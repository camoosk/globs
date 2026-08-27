import L from 'leaflet';
import { heatLayer } from '@linkurious/leaflet-heat';
import 'leaflet/dist/leaflet.css';

interface GeoJsonFeature {
  type?: string;
  geometry?: { type?: string; coordinates?: unknown };
  properties?: Record<string, unknown>;
}

interface FeatureCollection {
  type?: string;
  features?: GeoJsonFeature[];
}

const NEWS_GEO_API = 'https://api.gdeltproject.org/api/v2/geo/geo';
const GDACS_API = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP';

const asNumber = (value: unknown): number | null => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

const pointFromFeature = (feature: GeoJsonFeature): [number, number] | null => {
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const longitude = asNumber(coordinates[0]);
  const latitude = asNumber(coordinates[1]);
  if (latitude === null || longitude === null) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return [latitude, longitude];
};

const featureCollection = (payload: unknown): FeatureCollection => {
  if (!payload || typeof payload !== 'object') return { features: [] };
  const candidate = payload as FeatureCollection;
  return { features: Array.isArray(candidate.features) ? candidate.features : [] };
};

async function fetchNewsActivity(): Promise<GeoJsonFeature[]> {
  const params = new URLSearchParams({
    query: '(world OR global OR international OR breaking)',
    mode: 'PointHeatmap',
    format: 'GeoJSON',
    timespan: '24h',
    maxpoints: '1000'
  });
  const response = await fetch(`${NEWS_GEO_API}?${params.toString()}`, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`GDELT GEO ${response.status}`);
  const payload = await response.json();
  const features = featureCollection(payload).features ?? [];
  if (!features.length) throw new Error('GDELT GEO returned no heatmap points');
  return features;
}

async function fetchDisasters(): Promise<GeoJsonFeature[]> {
  const response = await fetch(GDACS_API, {
    headers: { Accept: 'application/geo+json, application/json' }
  });
  if (!response.ok) throw new Error(`GDACS ${response.status}`);
  return featureCollection(await response.json()).features ?? [];
}

function disasterLabel(properties: Record<string, unknown> = {}) {
  const type = String(properties.eventtype ?? properties.eventType ?? 'Event');
  const name = String(properties.name ?? 'GDACS event');
  const level = String(properties.alertlevel ?? properties.alertLevel ?? '');
  return `${type} · ${name}${level ? ` · ${level}` : ''}`;
}

class LegendControl extends L.Control {
  onAdd() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = '<b>World activity</b><span><i class="legend-news"></i> News heat</span><span><i class="legend-disaster"></i> Disaster</span>';
    L.DomEvent.disableClickPropagation(div);
    return div;
  }
}

class StatusControl extends L.Control {
  private element?: HTMLDivElement;

  onAdd() {
    const div = L.DomUtil.create('div', 'map-status');
    div.textContent = 'Updating…';
    this.element = div;
    L.DomEvent.disableClickPropagation(div);
    return div;
  }

  setText(text: string) {
    if (this.element) this.element.textContent = text;
  }
}

export async function initWorldMap(element: HTMLElement) {
  const map = L.map(element, {
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 7,
    zoomControl: true
  }).setView([20, 0], 2);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 7,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const newsLayer = L.layerGroup().addTo(map);
  const disasterLayer = L.layerGroup().addTo(map);

  new LegendControl({ position: 'bottomright' }).addTo(map);
  const status = new StatusControl({ position: 'topright' }).addTo(map);

  const [newsFeatures, disasterFeatures] = await Promise.allSettled([
    fetchNewsActivity(),
    fetchDisasters()
  ]);

  if (newsFeatures.status === 'fulfilled') {
    const points: Array<[number, number, number]> = [];
    const weights = newsFeatures.value.map((feature) =>
      asNumber(feature.properties?.count ?? feature.properties?.value ?? feature.properties?.weight) ?? 1
    );
    const maxWeight = Math.max(...weights, 1);

    newsFeatures.value.forEach((feature, index) => {
      const point = pointFromFeature(feature);
      if (!point) return;
      const weight = weights[index];
      const intensity = Math.min(1, Math.max(0.08, Math.log10(weight + 1) / Math.log10(maxWeight + 1)));
      points.push([point[0], point[1], intensity]);
    });

    if (points.length) {
      const heat = heatLayer(points, {
        radius: 25,
        blur: 18,
        maxZoom: 5,
        minOpacity: 0.2,
        max: 1
      });
      newsLayer.addLayer(heat);
    }
  }

  if (disasterFeatures.status === 'fulfilled') {
    disasterFeatures.value.slice(0, 100).forEach((feature) => {
      const point = pointFromFeature(feature);
      if (!point) return;
      const properties = feature.properties ?? {};
      const level = String(properties.alertlevel ?? properties.alertLevel ?? '').toLowerCase();
      const severityClass = level === 'red' ? 'disaster-red' : level === 'orange' ? 'disaster-orange' : 'disaster-green';
      L.circleMarker(point, {
        radius: level === 'red' ? 8 : 6,
        className: severityClass
      })
        .bindTooltip(disasterLabel(properties), { direction: 'top' })
        .addTo(disasterLayer);
    });
  }

  const newsOk = newsFeatures.status === 'fulfilled';
  const disasterOk = disasterFeatures.status === 'fulfilled';
  if (newsOk && disasterOk) {
    status.setText('News + disasters · near-real-time');
  } else if (newsOk) {
    status.setText('News live · disaster source unavailable');
  } else if (disasterOk) {
    status.setText('Disasters live · news heat unavailable');
  } else {
    status.setText('Live sources unavailable');
  }

  L.control.layers(undefined, {
    'News heat': newsLayer,
    Disasters: disasterLayer
  }, { collapsed: true, position: 'topright' }).addTo(map);

  window.setTimeout(() => map.invalidateSize(), 0);
  return map;
}

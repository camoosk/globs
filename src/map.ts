import L from 'leaflet';
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
    query: 'world',
    mode: 'pointheatmap',
    format: 'geojson',
    timespan: '24h',
    maxpoints: '700'
  });
  const response = await fetch(`${NEWS_GEO_API}?${params.toString()}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`GDELT GEO ${response.status}`);
  return featureCollection(await response.json()).features ?? [];
}

async function fetchDisasters(): Promise<GeoJsonFeature[]> {
  const response = await fetch(GDACS_API, { headers: { Accept: 'application/geo+json, application/json' } });
  if (!response.ok) throw new Error(`GDACS ${response.status}`);
  return featureCollection(await response.json()).features ?? [];
}

function disasterLabel(properties: Record<string, unknown> = {}) {
  const type = String(properties.eventtype ?? properties.eventType ?? 'Event');
  const name = String(properties.name ?? 'GDACS event');
  const level = String(properties.alertlevel ?? properties.alertLevel ?? '');
  return `${type} · ${name}${level ? ` · ${level}` : ''}`;
}

export async function initWorldMap(element: HTMLElement) {
  const map = L.map(element, { worldCopyJump: true, minZoom: 2, maxZoom: 7, zoomControl: true }).setView([20, 0], 2);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 7,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const newsLayer = L.layerGroup().addTo(map);
  const disasterLayer = L.layerGroup().addTo(map);

  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = '<b>World activity</b><span><i class="legend-news"></i> News activity</span><span><i class="legend-disaster"></i> Disaster</span>';
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  legend.addTo(map);

  const status = L.control({ position: 'topright' });
  status.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-status');
    div.textContent = 'Updating…';
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  status.addTo(map);

  try {
    const [newsFeatures, disasterFeatures] = await Promise.allSettled([fetchNewsActivity(), fetchDisasters()]);

    if (newsFeatures.status === 'fulfilled') {
      newsFeatures.value.forEach((feature) => {
        const point = pointFromFeature(feature);
        if (!point) return;
        const weight = asNumber(feature.properties?.count ?? feature.properties?.value ?? feature.properties?.weight) ?? 1;
        const radius = Math.min(22, 5 + Math.sqrt(Math.max(weight, 1)) * 2.2);
        L.circle(point, {
          radius: radius * 18000,
          stroke: false,
          fillOpacity: Math.min(0.18, 0.04 + Math.log10(Math.max(weight, 1) + 1) * 0.05),
          className: 'news-heat'
        }).addTo(newsLayer);
      });
    }

    if (disasterFeatures.status === 'fulfilled') {
      disasterFeatures.value.slice(0, 100).forEach((feature) => {
        const point = pointFromFeature(feature);
        if (!point) return;
        const properties = feature.properties ?? {};
        const level = String(properties.alertlevel ?? properties.alertLevel ?? '').toLowerCase();
        const severityClass = level === 'red' ? 'disaster-red' : level === 'orange' ? 'disaster-orange' : 'disaster-green';
        L.circleMarker(point, { radius: level === 'red' ? 8 : 6, className: severityClass }).bindTooltip(disasterLabel(properties), { direction: 'top' }).addTo(disasterLayer);
      });
    }

    const newsOk = newsFeatures.status === 'fulfilled';
    const disasterOk = disasterFeatures.status === 'fulfilled';
    status.getContainer()!.textContent = newsOk && disasterOk ? 'Live sources · updated now' : 'Partial source availability';
  } catch {
    status.getContainer()!.textContent = 'Partial source availability';
  }

  L.control.layers(undefined, { 'News activity': newsLayer, 'Disasters': disasterLayer }, { collapsed: true, position: 'topright' }).addTo(map);

  window.setTimeout(() => map.invalidateSize(), 0);
  return map;
}

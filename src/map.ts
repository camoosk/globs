import L from 'leaflet';
import { heatLayer } from '@linkurious/leaflet-heat';
import 'leaflet/dist/leaflet.css';
import type { Story } from './domain';

interface GeoJsonFeature {
  geometry?: { type?: string; coordinates?: unknown };
  properties?: Record<string, unknown>;
}

interface FeatureCollection {
  features?: GeoJsonFeature[];
}

const GDACS_API = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP';

const COUNTRY_POINTS: Record<string, [number, number]> = {
  US: [38.9, -77.0], CA: [56.1, -106.3], MX: [23.6, -102.5], GT: [15.8, -90.2], BH: [17.2, -88.5],
  HO: [14.6, -86.6], ES: [13.8, -88.9], NU: [12.9, -85.2], CS: [13.1, -59.6], VE: [7.0, -66.0],
  CO: [4.6, -74.1], EC: [-1.4, -78.4], PE: [-9.2, -75.0], BL: [-16.3, -64.7], CI: [-15.8, -47.9],
  AR: [-34.6, -58.4], BR: [-14.2, -51.9], CH: [35.9, 104.2], CN: [35.9, 104.2], JA: [36.2, 138.3],
  JP: [36.2, 138.3], KS: [37.6, 127.0], KR: [37.6, 127.0], TW: [23.7, 121.0], HK: [22.3, 114.2],
  IN: [22.6, 79.0], PK: [30.4, 69.3], AF: [33.9, 67.7], IR: [32.4, 53.7], IZ: [33.2, 44.4],
  IS: [31.5, 34.8], JO: [31.2, 36.0], LE: [33.9, 35.9], SY: [35.0, 38.0], SA: [24.0, 45.0],
  YM: [15.6, 48.5], AE: [24.3, 54.4], QA: [25.3, 51.2], KU: [29.3, 47.5], BA: [26.1, 50.6],
  OMA: [21.5, 55.9], OM: [21.5, 55.9], TU: [39.0, 35.2], TR: [39.0, 35.2], RS: [55.8, 37.6], RU: [55.8, 37.6],
  UP: [48.4, 31.2], UA: [48.4, 31.2], BO: [42.7, 25.5], RO: [45.9, 25.0], HU: [47.2, 19.5],
  PL: [52.1, 19.1], EZ: [49.8, 15.5], CZ: [49.8, 15.5], LO: [46.8, 8.2], SZ: [46.8, 8.2],
  GM: [51.2, 10.5], DE: [51.2, 10.5], FR: [46.2, 2.2], SP: [40.4, -3.7], ES2: [40.4, -3.7],
  PO: [39.4, -8.2], PT: [39.4, -8.2], IT: [41.9, 12.6], UK: [55.4, -3.4], GB: [55.4, -3.4],
  EI: [53.1, -8.0], IE: [53.1, -8.0], DA: [56.0, 10.0], DK: [56.0, 10.0], SW: [60.1, 18.6], SE: [60.1, 18.6],
  NO: [64.5, 17.7], FI: [64.0, 26.0], IC: [64.9, -19.0], ISL: [64.9, -19.0], NL: [52.1, 5.3],
  BE: [50.8, 4.5], LU: [49.8, 6.1], GR: [39.1, 22.9], AL: [41.2, 20.2], HR: [45.1, 15.2],
  SI: [46.1, 14.9], SR: [44.0, 21.0], BK: [43.9, 18.0], MK: [41.6, 21.7], SN: [1.35, 103.8],
  SG: [1.35, 103.8], MY: [4.2, 101.7], ID: [-2.5, 118.0], RP: [12.9, 122.8], PH: [12.9, 122.8],
  TH: [15.9, 100.9], VM: [14.1, 108.3], VN: [14.1, 108.3], BM: [4.5, 114.7], BN: [4.5, 114.7],
  LA: [18.0, 103.0], CB: [12.6, 104.9], KH: [12.6, 104.9], BT: [27.5, 90.4], NP: [28.4, 84.1],
  BG: [23.7, 90.4], BD: [23.7, 90.4], CE: [7.9, 80.8], LK: [7.9, 80.8], MV: [3.2, 73.2],
  AS: [-25.3, 133.8], AU: [-25.3, 133.8], NZ: [-41.0, 174.8], FJ: [-17.7, 178.1], PG: [-6.3, 143.9],
  ZA: [-30.6, 22.9], SF: [-30.6, 22.9], NG: [9.1, 8.7], GH: [7.9, -1.0], IV: [7.5, -5.5],
  SG2: [11.8, -15.2], GN: [11.8, -15.2], GV: [9.9, -9.7], LI: [6.4, -10.8], SL: [8.5, -11.8],
  MO: [17.6, -4.0], ML: [17.6, -4.0], ET: [9.1, 40.5], KE: [0.2, 37.9], TZ: [-6.4, 34.9],
  UG: [1.4, 32.3], RW: [-1.9, 29.9], SO: [5.2, 46.2], SU: [15.6, 32.5], EG: [26.8, 30.8],
  LY: [26.3, 17.2], TS: [34.0, 9.0], AG: [28.0, 2.6], MA: [31.8, -7.1], PY: [-23.4, -58.4],
  UY: [-32.5, -55.8], CL: [-33.4, -70.7]
};

const ISO3_TO_COUNTRY: Record<string, string> = {
  USA: 'US', CAN: 'CA', MEX: 'MX', GTM: 'GT', BLZ: 'BH', HND: 'HO', SLV: 'ES', NIC: 'NU', CRI: 'CS', VEN: 'VE',
  COL: 'CO', ECU: 'EC', PER: 'PE', BOL: 'BL', BRA: 'BR', ARG: 'AR', CHN: 'CN', JPN: 'JP', KOR: 'KR', PRK: 'KR',
  TWN: 'TW', HKG: 'HK', IND: 'IN', PAK: 'PK', AFG: 'AF', IRN: 'IR', IRQ: 'IZ', ISR: 'IS', JOR: 'JO', LBN: 'LE',
  SYR: 'SY', SAU: 'SA', YEM: 'YM', ARE: 'AE', QAT: 'QA', KWT: 'KU', BHR: 'BA', OMN: 'OM', TUR: 'TR', RUS: 'RU',
  UKR: 'UA', BGR: 'BO', ROU: 'RO', HUN: 'HU', POL: 'PL', CZE: 'CZ', CHE: 'SZ', DEU: 'DE', FRA: 'FR', ESP: 'SP',
  PRT: 'PO', ITA: 'IT', GBR: 'GB', IRL: 'IE', DNK: 'DK', SWE: 'SE', NOR: 'NO', FIN: 'FI', ISL: 'ISL', NLD: 'NL',
  BEL: 'BE', LUX: 'LU', GRC: 'GR', ALB: 'AL', HRV: 'HR', SVN: 'SI', SRB: 'SR', BIH: 'BK', MKD: 'MK', SGP: 'SG',
  MYS: 'MY', IDN: 'ID', PHL: 'PH', THA: 'TH', VNM: 'VN', BRN: 'BN', LAO: 'LA', KHM: 'KH', BTN: 'BT', NPL: 'NP',
  BGD: 'BD', LKA: 'LK', MDV: 'MV', AUS: 'AU', NZL: 'NZ', FJI: 'FJ', PNG: 'PG', ZAF: 'ZA', NGA: 'NG', GHA: 'GH',
  CIV: 'IV', GIN: 'GN', GNB: 'SG2', LBR: 'LI', SLE: 'SL', MLI: 'ML', MLI2: 'ML', MRT: 'MO', ETH: 'ET', KEN: 'KE',
  TZA: 'TZ', UGA: 'UG', RWA: 'RW', SOM: 'SO', SDN: 'SU', EGY: 'EG', LBY: 'LY', TUN: 'TS', DZA: 'AG', MAR: 'MA',
  PRY: 'PY', URY: 'UY', CHL: 'CL'
};

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

function countryPoint(country?: string): [number, number] | null {
  if (!country) return null;
  const normalized = country.trim().toUpperCase();
  const countryKey = ISO3_TO_COUNTRY[normalized] ?? normalized;
  return COUNTRY_POINTS[countryKey] ?? null;
}

function countryFromStory(story: Story): string | undefined {
  const explicit = story.source.sourceCountryCode?.trim().toUpperCase();
  if (explicit) return explicit;
  try {
    const hostname = new URL(story.source.url).hostname.toLowerCase();
    const tld = hostname.split('.').pop();
    return tld && tld.length === 2 ? tld.toUpperCase() : undefined;
  } catch {
    return undefined;
  }
}

class LegendControl extends L.Control {
  onAdd() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = '<b>World activity</b><span><i class="legend-news"></i> News coverage</span><span><i class="legend-disaster"></i> Disaster</span>';
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

export async function initWorldMap(element: HTMLElement, storiesPromise: Promise<Story[]>) {
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

  const [storiesResult, disasterResult] = await Promise.allSettled([
    storiesPromise,
    fetchDisasters()
  ]);

  let newsOk = false;
  if (storiesResult.status === 'fulfilled') {
    const counts = new Map<string, number>();
    storiesResult.value.forEach((story) => {
      const country = countryFromStory(story);
      const point = countryPoint(country);
      if (!point) return;
      const normalized = (ISO3_TO_COUNTRY[country!] ?? country!).toUpperCase();
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });

    const maxCount = Math.max(...counts.values(), 1);
    const points: Array<[number, number, number]> = [];
    counts.forEach((count, country) => {
      const point = countryPoint(country);
      if (!point) return;
      const intensity = Math.min(1, Math.max(0.12, Math.sqrt(count / maxCount)));
      points.push([point[0], point[1], intensity]);
    });

    if (points.length) {
      const heat = heatLayer(points, {
        radius: 42,
        blur: 26,
        maxZoom: 5,
        minOpacity: 0.28,
        max: 1
      });
      newsLayer.addLayer(heat as unknown as L.Layer);
      newsOk = true;
    }
  }

  let disasterOk = false;
  if (disasterResult.status === 'fulfilled') {
    disasterResult.value.slice(0, 100).forEach((feature) => {
      const point = pointFromFeature(feature);
      if (!point) return;
      disasterOk = true;
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

  if (newsOk && disasterOk) {
    status.setText('News coverage + disasters · near-real-time');
  } else if (newsOk) {
    status.setText('News coverage live · disaster source unavailable');
  } else if (disasterOk) {
    status.setText('Disasters live · news coverage unavailable');
  } else {
    status.setText('Live sources unavailable');
  }

  L.control.layers(undefined, {
    'News coverage': newsLayer,
    Disasters: disasterLayer
  }, { collapsed: true, position: 'topright' }).addTo(map);

  window.setTimeout(() => map.invalidateSize(), 0);
  return map;
}

import type { NormalizedRecord, SourceAdapter, SourceCapabilities, Source, Story } from '../domain';

interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

const source: Source = {
  id: 'gdelt',
  name: 'GDELT Project',
  homepageUrl: 'https://www.gdeltproject.org/',
  reliability: 'recognized',
  language: 'multilingual'
};

const capabilities: SourceCapabilities = {
  stories: true,
  events: false,
  geographicData: false,
  realtime: true
};

const API = 'https://api.gdeltproject.org/api/v2/doc/doc';

function parseDate(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.length >= 14
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}Z`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toRecord(article: GdeltArticle, index: number): NormalizedRecord | null {
  if (!article.url || !article.title) return null;

  const publishedAt = parseDate(article.seendate);
  const story: Story = {
    id: `gdelt:${article.seendate ?? 'unknown'}:${index}`,
    source: {
      sourceId: source.id,
      url: article.url,
      title: article.domain ?? article.title,
      publishedAt,
      retrievedAt: new Date().toISOString(),
      originalLanguage: article.language,
      sourceCountryCode: article.sourcecountry
    },
    headline: article.title,
    language: article.language,
    publishedAt
  };

  return { story };
}

function parsePayload(body: string): GdeltResponse {
  try {
    return JSON.parse(body) as GdeltResponse;
  } catch {
    throw new Error('GDELT returned invalid JSON');
  }
}

async function fetchJson(params: URLSearchParams): Promise<GdeltResponse> {
  const response = await fetch(`${API}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = await response.text();

  if (!response.ok) throw new Error(`GDELT request failed: ${response.status}`);
  if (!contentType.toLowerCase().includes('json')) throw new Error('GDELT returned a non-JSON response');
  return parsePayload(body);
}

function fetchJsonp(params: URLSearchParams): Promise<GdeltResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `__globsGdelt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('GDELT JSONP timeout'));
    }, 10000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };

    (window as unknown as Record<string, unknown>)[callbackName] = (payload: GdeltResponse) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('GDELT JSONP request failed'));
    };

    params.set('format', 'json');
    params.set('callback', callbackName);
    script.src = `${API}?${params.toString()}`;
    document.head.appendChild(script);
  });
}

async function queryGdelt(query: string, maxrecords = 12): Promise<NormalizedRecord[]> {
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    maxrecords: String(Math.min(maxrecords, 50)),
    timespan: '24h',
    sort: 'datedesc',
    format: 'json'
  });

  let payload: GdeltResponse;
  try {
    payload = await fetchJson(params);
  } catch {
    // GDELT documents JSONP specifically for browser embedding. It gives the
    // static GitHub Pages build a credential-free fallback when direct fetch
    // is blocked by a transient browser/network policy.
    payload = await fetchJsonp(params);
  }

  return (payload.articles ?? [])
    .map(toRecord)
    .filter((record): record is NormalizedRecord => record !== null);
}

export const gdeltAdapter: SourceAdapter = {
  source,
  capabilities,
  // Broad, lightweight homepage query. GDELT supports OR blocks and a rolling
  // recent window, so this remains useful without credentials or a server.
  fetch: () => queryGdelt('(world OR global OR breaking)', 20)
};

export function searchGdelt(query: string): Promise<NormalizedRecord[]> {
  return queryGdelt(query, 20);
}

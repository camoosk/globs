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
      originalLanguage: article.language
    },
    headline: article.title,
    language: article.language,
    publishedAt
  };

  return { story };
}

async function queryGdelt(query: string, maxrecords = 12): Promise<NormalizedRecord[]> {
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    maxrecords: String(maxrecords),
    timespan: '6h',
    sort: 'datedesc',
    format: 'json'
  });

  const response = await fetch(`${API}?${params.toString()}`, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`GDELT request failed: ${response.status}`);
  }

  const payload = (await response.json()) as GdeltResponse;
  return (payload.articles ?? [])
    .map(toRecord)
    .filter((record): record is NormalizedRecord => record !== null);
}

export const gdeltAdapter: SourceAdapter = {
  source,
  capabilities,
  fetch: () => queryGdelt('(world OR global OR international)', 12)
};

export function searchGdelt(query: string): Promise<NormalizedRecord[]> {
  return queryGdelt(query, 20);
}

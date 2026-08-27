import type { NormalizedRecord, Source } from './contracts';

export interface SourceCapabilities {
  stories: boolean;
  events: boolean;
  geographicData: boolean;
  realtime: boolean;
}

export interface SourceAdapter {
  readonly source: Source;
  readonly capabilities: SourceCapabilities;

  /** Fetch provider data and normalize it into GlobS records. */
  fetch(): Promise<NormalizedRecord[]>;
}

export interface SourceFetchResult {
  sourceId: string;
  records: NormalizedRecord[];
  retrievedAt: string;
  stale: boolean;
  error?: string;
}

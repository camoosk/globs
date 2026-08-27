import type { SourceFetchResult } from '../domain';
import { gdeltAdapter } from './gdelt';

export const sourceAdapters = [gdeltAdapter];

export async function fetchSourceData(): Promise<SourceFetchResult[]> {
  return Promise.all(sourceAdapters.map(async (adapter) => {
    const retrievedAt = new Date().toISOString();
    try {
      const records = await adapter.fetch();
      return {
        sourceId: adapter.source.id,
        records,
        retrievedAt,
        stale: false
      };
    } catch (error) {
      return {
        sourceId: adapter.source.id,
        records: [],
        retrievedAt,
        stale: true,
        error: error instanceof Error ? error.message : 'Unknown source error'
      };
    }
  }));
}

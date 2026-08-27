/**
 * Core domain contracts for GlobS.
 *
 * These contracts deliberately describe normalized information rather than
 * any provider-specific response format. External adapters should map their
 * data into these types before the UI consumes them.
 */

export type ISODateTime = string;

export type EntityId = string;

export interface Source {
  id: EntityId;
  name: string;
  homepageUrl: string;
  reliability?: SourceReliability;
  language?: string;
  region?: string;
}

export type SourceReliability = 'established' | 'recognized' | 'unknown';

export interface SourceReference {
  sourceId: EntityId;
  url: string;
  title?: string;
  publishedAt?: ISODateTime;
  updatedAt?: ISODateTime;
  retrievedAt: ISODateTime;
  originalLanguage?: string;
  sourceCountryCode?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface Place {
  id: EntityId;
  name: string;
  countryCode?: string;
  countryName?: string;
  regionName?: string;
  coordinates?: Coordinates;
}

export interface TimeContext {
  occurredAt?: ISODateTime;
  startedAt?: ISODateTime;
  endedAt?: ISODateTime;
  timezone?: string;
  precision: 'unknown' | 'minute' | 'hour' | 'day' | 'range';
}

export interface Topic {
  id: EntityId;
  name: string;
  category?: string;
  keywords?: string[];
}

export interface Story {
  id: EntityId;
  source: SourceReference;
  headline: string;
  summary?: string;
  language?: string;
  publishedAt?: ISODateTime;
  updatedAt?: ISODateTime;
  topics?: Topic[];
  places?: Place[];
}

export interface EvidenceReference {
  storyId: EntityId;
  relation: 'supports' | 'contradicts' | 'context' | 'related';
}

export interface Event {
  id: EntityId;
  title: string;
  summary?: string;
  place?: Place;
  time: TimeContext;
  topics: Topic[];
  stories: Story[];
  evidence?: EvidenceReference[];
  status: 'developing' | 'active' | 'resolved' | 'unknown';
}

export interface TrendSignal {
  type: 'freshness' | 'source_count' | 'activity_rate' | 'persistence' | 'geographic_spread' | 'external_signal';
  value: number;
  observedAt: ISODateTime;
}

export interface Trend {
  eventId: EntityId;
  score: number;
  signals: TrendSignal[];
  calculatedAt: ISODateTime;
}

/**
 * A normalized record returned by a source adapter.
 */
export interface NormalizedRecord {
  story: Story;
  eventCandidate?: Event;
}

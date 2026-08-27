# GlobS Source Strategy

GlobS is browser-first. A source is eligible for direct browser integration only when it can be accessed without user credentials and its public endpoint is suitable for cross-origin browser requests.

## Initial source

### GDELT Project

Role:
- Global news discovery
- Recent article search
- Multilingual coverage
- Initial latest/trending signal

Why it fits:
- Public DOC 2.0 API
- JSON output is available
- The GDELT documentation states that its API output includes a wildcard CORS header for universal embedding
- Coverage spans many languages and global sources

GlobS adapter:
- `src/data/gdelt.ts`

The first implementation deliberately keeps the integration small. It fetches recent article metadata and links users to the original source rather than copying article content.

## Candidate sources

### GDACS

Role:
- Disaster alerts
- Geographic event data

Status:
- Evaluated as a strong public source
- No authentication/API key required according to the published API documentation
- Browser CORS behavior still needs direct validation before client-side integration

### Our World in Data

Role:
- Contextual and historical data
- Country/region comparisons

Status:
- Candidate for later context layers
- Public Grapher endpoints expose CSV/JSON data and metadata

## Source principles

1. No user credentials required.
2. Prefer official/public endpoints.
3. Preserve source URLs.
4. Do not present an aggregator as the original reporting source.
5. Separate source retrieval from normalization.
6. Gracefully handle source failure or stale data.
7. Never claim verification merely because multiple sources repeat the same claim.

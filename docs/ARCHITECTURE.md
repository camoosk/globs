# GlobS Architecture Direction

## Guiding constraint

The initial GlobS application must be capable of running as a static web application. GitHub Pages is the intended first deployment target.

No application-owned cloud backend is required for the initial architecture.

## High-level flow

```text
                    Browser
                       |
              +--------+--------+
              |                 |
          UI Shell         Browser APIs
              |             (locale/time)
              |                 |
              +--------+--------+
                       |
                 Data Layer
                       |
              +--------+--------+
              |                 |
       Public Data Sources   Local Cache
              |
        Source Adapters
              |
        Normalized Records
              |
      Event / Topic Resolver
              |
       Discovery Signals
```

## Source adapters

Every external provider should be isolated behind an adapter. UI code must not contain provider-specific parsing logic.

Conceptually:

```text
SourceAdapter
  - source identity
  - capabilities
  - fetch()
  - normalize()
  - health/error metadata
```

An adapter may be disabled without requiring changes to the rest of the application.

## Normalized data

The UI should consume normalized domain records rather than raw provider responses.

Initial conceptual entities:

- Source
- Story / Report
- Event
- Topic
- Place
- Location
- Timestamp
- Evidence

## Browser-first constraints

The application must assume:

- network requests can fail;
- providers can be unavailable;
- CORS may prevent direct browser access;
- public feeds can change format;
- data may be stale or incomplete;
- mobile connections can be slow.

The application should degrade gracefully instead of failing as a whole.

## Credentials

No user-provided API keys or private credentials should be required for the core experience.

If a future capability genuinely requires a server-side secret, it must be treated as a separate architectural decision rather than exposing the secret in the client.

## Performance architecture

Initial page load should prioritize:

1. application shell
2. search/navigation
3. primary current/trending content
4. secondary source enrichment
5. optional geographic visualization

Large assets and expensive features should be lazy-loaded.

## Caching

Use browser caching deliberately for data that is safe and useful to cache. Cached data must carry freshness information and must never silently masquerade as current data.

## Security

Never place secrets in client-side source code, public configuration, or Git history.

External content must be treated as untrusted input. Rendering must prevent HTML/script injection.

## Future backend boundary

A backend may be introduced later only when there is a demonstrated need, such as:

- provider credentials that cannot be exposed client-side;
- server-side aggregation that cannot be performed safely in a browser;
- durable shared caches;
- advanced indexing/search infrastructure;
- computational workloads that exceed reasonable browser limits.

Such a backend should preserve the same normalized domain contracts so the client architecture remains stable.

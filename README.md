# GlobS — World Explorer

GlobS is a lightweight, source-transparent web portal for discovering, exploring, and understanding current information from around the world.

## Product direction

GlobS is designed as a browser-first world information explorer rather than a conventional news reader, map application, or search engine.

The initial experience will surface current and trending information, connect information to places and time, expose source context, and let users explore related events and topics.

## Core principles

- **Browser-first:** the initial product should run directly in the browser.
- **No user credentials:** users should not need to provide API keys or service credentials.
- **Lightweight:** fast initial rendering, progressive data loading, minimal dependencies, and careful asset usage.
- **Responsive:** mobile-friendly by default while providing a complete, information-rich desktop experience.
- **Source-transparent:** information should remain traceable to its original sources and timestamps.
- **Multi-source:** avoid dependence on a single information provider whenever practical.
- **Evidence over claims:** GlobS helps users assess information using sources, corroboration, timing, and context; it does not claim that a single automated score proves truth.
- **Locale-aware:** detect the user's locale automatically, with English as the default and fallback language. Users may override the language.
- **Progressive architecture:** do not introduce a backend or cloud service unless a capability genuinely requires one.

## Initial scope

### Discover
- Latest world information
- Trending topics and events
- Breaking or rapidly developing information where reliable signals are available
- Regional discovery

### Search
- Search across available public information sources
- Search by topic, location, and event
- Source-aware results

### Verify
- Source attribution
- Publication/update timestamps
- Cross-source comparison
- Related evidence and context

### Explore
- Interactive geographic context
- Related topics and events
- Location and timeline context

## Out of scope for the initial foundation

Astronomy and space-observation features are intentionally excluded from the initial product scope. They may be reconsidered later if they provide a clear product benefit and can be implemented without compromising the core experience.

## Architecture direction

The first implementation should favor a static/client-side architecture suitable for GitHub Pages:

```text
Public Sources
      |
      v
Source Adapters
      |
      v
Normalization
      |
      v
Event / Topic Resolution
      |
      v
Discovery + Source Context
      |
      v
GlobS Web UI
```

External data sources must be evaluated for public access, browser compatibility, licensing/usage conditions, reliability, freshness, and CORS behavior before becoming core dependencies.

## Performance goals

Performance is a product requirement, not a final optimization step.

- Render the application shell quickly.
- Load primary content before secondary enrichment.
- Lazy-load expensive features such as detailed maps where appropriate.
- Avoid large frameworks or libraries without a clear benefit.
- Cache suitable public data in the browser where appropriate.
- Keep mobile network usage conservative.
- Measure before adding complexity.

## Status

**Phase 0 — Foundation initialized.**

The repository is intentionally minimal. Product contracts, source adapters, application architecture, and the first usable browser experience will be introduced incrementally.

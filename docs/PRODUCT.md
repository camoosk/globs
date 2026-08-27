# GlobS Product Foundation

## Vision

**GlobS — World Explorer** is a web portal for discovering, understanding, and exploring current information from around the world.

The product starts with a living world view: what is happening now, what is gaining attention, where it is happening, when it happened, and which sources support the information.

## Core user promise

When a user opens GlobS, the page should already be useful. The user should see a current snapshot of the world without having to configure an account or provide credentials.

The user can then move naturally from:

**Discover → Understand → Verify → Explore**

## Primary surfaces

### Discover
The home experience presents current and trending information with strong emphasis on freshness and relevance.

### Search
Users can ask for information about topics, places, events, and developments.

### Event / topic view
A selected item brings together its summary, location, timing, sources, and related information.

### Explore
Users can follow relationships between events, locations, topics, and sources. A map is an exploration surface, not the sole purpose of the product.

## Information model

The initial conceptual model is:

```text
Source
  |
  +--> Report / Observation
            |
            +--> Event
            |      |
            |      +--> Location
            |      +--> Time
            |      +--> Topic
            |
            +--> Evidence / Context
```

This model deliberately separates a source's report from the underlying event. Multiple reports may refer to the same event, allowing GlobS to correlate information without pretending that every source is equally reliable.

## Source principles

A source can contribute:

- publisher identity
- original URL
- title
- publication time
- update time when available
- geographic information when available
- category/topic information
- source-specific metadata

GlobS should preserve provenance throughout processing. A derived summary must remain traceable to the underlying source material.

## Trending model

GlobS should not depend on a single provider's trending endpoint.

A future trend engine may combine available signals such as:

- freshness
- number of independent sources
- rate of new reports
- persistence over time
- geographic spread
- topic activity signals
- event relevance

A trend score is an attention/discovery signal, **not a truth score**.

## Trust and validity

GlobS should avoid absolute claims such as "this information is true" based solely on automation.

Instead, the interface should make evidence visible and help the user judge information using:

1. source identity
2. source provenance
3. freshness
4. independent corroboration
5. consistency between reports
6. uncertainty or missing information

## Localization

The interface uses automatic locale detection.

Priority:

1. explicit user language preference
2. browser locale
3. English fallback

UI translations are controlled by GlobS. Third-party source content remains identifiable as original source content; any future translation must be clearly distinguished from the original.

## Responsive experience

### Desktop
Desktop layouts should expose the major discovery surfaces simultaneously when screen space permits: navigation, trending/latest feeds, geographic context, filters, and selected-item details.

### Mobile
Mobile layouts should prioritize the same capabilities through stacking, drawers, tabs, and touch-friendly controls. No core capability should disappear solely because the viewport is small.

## Non-goals for initial versions

- Astronomy / space observation
- A full social network
- A replacement for original news publishers
- A system that claims to determine absolute truth automatically
- Mandatory user accounts
- Mandatory private API credentials
- A heavy 3D globe experience

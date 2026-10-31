---
"@osm-editor-kit/osm-way-chain": major
---

First stable release. Stable API to walk connected OSM ways from a center way into an oriented chain, handle ambiguous junctions, mirror directional tags, and describe the wanted ways with an app-owned selection policy that works for both Overpass queries and in-memory tags.

Changes since the last alpha:

- `extendChainAtJunction(adapter, chain, choice, id, { maxPerSide, candidateFilter })` takes an options object like `buildChain`.
- Removed from the public API, describe the ways with a selection policy instead: `overpassRoadLikeSelector`, `createLegacyStreetRoadWayPolicy`, `isRoadLikeHighway`, `isEditableRoadLikeHighway`, `isRoadLikeSegment`, `isEditableRoadLikeSegment`, `isClutterAccessWay`, `matchesHighwayInclusionStyle`, `HighwayInclusionStyle`, `DEFAULT_HIGHWAY_INCLUSION_STYLE`, `ROAD_LIKE_HIGHWAY_BASE_REGEX`, `OVERPASS_PUBLIC_ROAD_FILTERS`.
- Removed from the public API: `OsmTags` (use the type from `@osm-editor-kit/osm-data`), `filterNeighborCandidates`, `getKindKey`, `pickBestNeighbor`, `sameKind`, `scoreNeighborCandidate`, `isReversedAtNode`.

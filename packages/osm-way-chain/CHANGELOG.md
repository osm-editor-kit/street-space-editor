# @osm-editor-kit/osm-way-chain

## 1.0.1

### Patch Changes

- Updated dependencies [934b419]
    - @osm-editor-kit/osm-data@1.0.1

## 1.0.0

### Major Changes

- First stable release. Stable API to walk connected OSM ways from a center way into an oriented chain, handle ambiguous junctions, mirror directional tags, and describe the wanted ways with an app-owned selection policy that works for both Overpass queries and in-memory tags.

    Changes since the last alpha:

    - `extendChainAtJunction(adapter, chain, choice, id, { maxPerSide, candidateFilter })` takes an options object like `buildChain`.
    - Removed from the public API, describe the ways with a selection policy instead: `overpassRoadLikeSelector`, `createLegacyStreetRoadWayPolicy`, `isRoadLikeHighway`, `isEditableRoadLikeHighway`, `isRoadLikeSegment`, `isEditableRoadLikeSegment`, `isClutterAccessWay`, `matchesHighwayInclusionStyle`, `HighwayInclusionStyle`, `DEFAULT_HIGHWAY_INCLUSION_STYLE`, `ROAD_LIKE_HIGHWAY_BASE_REGEX`, `OVERPASS_PUBLIC_ROAD_FILTERS`.
    - Removed from the public API: `OsmTags` (use the type from `@osm-editor-kit/osm-data`), `filterNeighborCandidates`, `getKindKey`, `pickBestNeighbor`, `sameKind`, `scoreNeighborCandidate`, `isReversedAtNode`.

### Patch Changes

- c31ec5d: - The repository and homepage links point to the new home, [osm-editor-kit/street-space-editor](https://github.com/osm-editor-kit/street-space-editor).
- Updated dependencies [c31ec5d]
- Updated dependencies
    - @osm-editor-kit/osm-data@1.0.0

## 0.1.0-alpha.4

### Patch Changes

-   - Installable outside the OSM Editor Kit monorepo: the previous alpha still listed sibling kit packages as `workspace:*` in npm's metadata.

## 0.1.0-alpha.3

### Patch Changes

-   - Fix install outside the OSM Editor Kit monorepo: the published `package.json` listed sibling kit packages as `workspace:*`, which npm cannot resolve. They now reference real versions.

## 0.1.0-alpha.2

### Minor Changes

- Add app-owned `OsmWaySelectionPolicy` contract (`tag` helpers, compile/match, `buildWaysOverpassQuery`). Highway inclusion lists move out of package core; legacy road-like helpers are deprecated.

### Patch Changes

- 9248f97: Update readme
- Updated dependencies [9248f97]
    - @osm-editor-kit/osm-data@0.1.0-alpha.1

## 0.1.0-alpha.1

### Patch Changes

- 9248f97: Update readme
- Updated dependencies [9248f97]
    - @osm-editor-kit/osm-data@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- 8309d44: Initial npm alpha release.

    Core features to date:

    - Bidirectional way-chain traversal from a center segment via `OsmDataAdapter`, with per-side limits and optional candidate filters
    - Junction handling: score and auto-pick neighbor ways (same kind, name, ref) or surface ambiguous choices for `extendChainAtJunction`
    - Segment orientation: flip geometry and normalize directional OSM tags when chaining reversed ways
    - `mirrorTags` for reversing way digitization (left/right, forward/backward, oneway, lane pipes, placement, and related keys)
    - Road-like highway predicates with `public` vs `inclusive` inclusion style, plus Overpass selectors for lane-mode chains
    - Session graph adapter backed by in-memory `ParsedOsmData` (`createSessionGraphAdapter`, `osmWayToSegment`)

### Patch Changes

- Updated dependencies [8309d44]
    - @osm-editor-kit/osm-data@0.1.0-alpha.0

# @osm-editor-kit/osm-coverage

## 1.0.1

### Patch Changes

- Updated dependencies [934b419]
    - @osm-editor-kit/osm-data@1.0.1

## 1.0.0

### Major Changes

- First stable release. Stable API for incremental viewport downloads: `createOsmCoverageApi` fetches only the parts of the map you have not covered yet, keeps graph, coverage and fetch history in TanStack Query, can persist sessions through a storage adapter, and ships Overpass URL helpers.

    Changes since the last alpha:

    - `@tanstack/react-query` is now a peer dependency, install it yourself (`^5`).
    - Removed from the public API: `boundsToPolygon`, `bufferPxAtZoom`, `unionIntoCoverage`, `OsmDataSource`, and the `./dev-osm-map-fixture` subpath.
    - A failed save is silent unless you pass the new `onPersistError` option; it used to log to the console.

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

### Patch Changes

- 9248f97: Update readme
- Updated dependencies [9248f97]
    - @osm-editor-kit/osm-data@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- 8309d44: Initial npm alpha release.

    Core features to date:

    - `createOsmCoverageApi` factory with TanStack Query session state (parsed OSM graph, coverage polygon, fetch-history GeoJSON) and `ensureCoverage` for incremental viewport downloads
    - Coverage geometry: missing-area detection, zoom-aware pixel buffering, strip vs full fetch heuristics, `unionIntoCoverage`, and capped fetch-history tracking
    - Overpass helpers: `boundsToOverpassBbox`, `buildOverpassInterpreterUrl`, and preset endpoints (`overpassDeUrl`, `overpassVkUrl`)
    - `OsmDataSource` enum for selecting download backends
    - `/dev-osm-map-fixture` subpath: local OSM Map API fixture handler, bbox element filtering, and fixture index loader

### Patch Changes

- Updated dependencies [8309d44]
    - @osm-editor-kit/osm-data@0.1.0-alpha.0

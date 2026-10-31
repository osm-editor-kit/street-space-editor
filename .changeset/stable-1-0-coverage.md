---
"@osm-editor-kit/osm-coverage": major
---

First stable release. Stable API for incremental viewport downloads: `createOsmCoverageApi` fetches only the parts of the map you have not covered yet, keeps graph, coverage and fetch history in TanStack Query, can persist sessions through a storage adapter, and ships Overpass URL helpers.

Changes since the last alpha:

- `@tanstack/react-query` is now a peer dependency, install it yourself (`^5`).
- Removed from the public API: `boundsToPolygon`, `bufferPxAtZoom`, `unionIntoCoverage`, `OsmDataSource`, and the `./dev-osm-map-fixture` subpath.
- A failed save is silent unless you pass the new `onPersistError` option; it used to log to the console.

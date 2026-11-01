# @osm-editor-kit/osm-data

## 1.0.1

### Patch Changes

- 934b419: - No longer installs `axios`: `downloadOsmData` now uses the built-in `fetch`, and the package has no dependencies. HTTP errors still reject with `Request failed with status code <status>`. Thrown errors are plain `Error`s, without the axios `response` field.

## 1.0.0

### Major Changes

- First stable release. Stable API to download OSM JSON from Overpass or the OSM API, parse it into indexed ways, relations, tagged nodes, node coordinates and way-in-relation lookups, and merge several downloads with version-aware updates for ways and relations.

    Changes since the last alpha:

    - The types `RelationMember` and `OsmType` are now exported.

### Patch Changes

- c31ec5d: - The repository and homepage links point to the new home, [osm-editor-kit/street-space-editor](https://github.com/osm-editor-kit/street-space-editor).

## 0.1.0-alpha.1

### Patch Changes

- 9248f97: Update readme

## 0.1.0-alpha.0

### Minor Changes

- 8309d44: Initial npm alpha release — first alpha packaging of the existing kit package.

    Core features to date:

    - TypeScript types for OSM nodes, ways, relations, tags, and raw API responses
    - Download OSM JSON from a URL and parse it into an indexed in-memory store
    - Parse Overpass/API `elements` arrays into `ParsedOsmData` (ways, relations, tagged nodes, node coordinates, ways-in-relation lookup)
    - Merge multiple fetches with version-aware updates for ways and relations
    - Geo helper types (`MapBounds`, `LatLngLiteral`) for map bounds and coordinates

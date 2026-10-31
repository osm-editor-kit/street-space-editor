# @osm-editor-kit/osm-map-url

## 1.0.0

### Major Changes

- First stable release. Stable API to read and write compact `?map=zoom/lat/lng[/bearing]` and `?f=way/id` URL params, redirect legacy `#map=` hashes, keep TanStack Router search params in slash form, and remember the last map view in a cookie.

  Changes since the last alpha:

  - The location cookie now has a valid expiry date, `path=/` and `SameSite=Lax`, so it is read on every route. Malformed values and SSR return `undefined`.
  - Removed from the public API: `roundPositionForURL`, `parseLegacyMapHash`, `LatLngLiteral` (use the type from `@osm-editor-kit/osm-data`).

### Patch Changes

- c31ec5d: - The repository and homepage links point to the new home, [osm-editor-kit/street-space-editor](https://github.com/osm-editor-kit/street-space-editor).

## 0.1.0-alpha.1

### Patch Changes

- 9248f97: Update readme

## 0.1.0-alpha.0

### Minor Changes

- 8309d44: Initial npm alpha release.

  Core features to date:

  - Parse and serialize compact `?map=zoom/lat/lng` URLs with optional bearing and zoom-based coordinate rounding
  - Parse and serialize OSM feature refs (`?f=way/id`, including sidepath `way/id/cycleway|sidewalk/left|right`)
  - Redirect legacy `#map=zoom/lat/lng` hash bookmarks to `?map=` query params
  - TanStack Router search helpers that keep map and feature params in slash form instead of JSON in the URL bar
  - Read and write last map view location from a `location` cookie

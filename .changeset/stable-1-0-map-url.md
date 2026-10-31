---
"@osm-editor-kit/osm-map-url": major
---

First stable release. Stable API to read and write compact `?map=zoom/lat/lng[/bearing]` and `?f=way/id` URL params, redirect legacy `#map=` hashes, keep TanStack Router search params in slash form, and remember the last map view in a cookie.

Changes since the last alpha:

- The location cookie now has a valid expiry date, `path=/` and `SameSite=Lax`, so it is read on every route. Malformed values and SSR return `undefined`.
- Removed from the public API: `roundPositionForURL`, `parseLegacyMapHash`, `LatLngLiteral` (use the type from `@osm-editor-kit/osm-data`).

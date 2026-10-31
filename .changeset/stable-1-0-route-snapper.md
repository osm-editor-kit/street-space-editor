---
"@osm-editor-kit/osm-route-snapper": major
---

First stable release. Stable API to build a route-snapper graph from loaded OSM data, read its routing network as GeoJSON, and rebuild it automatically in React with TanStack Query.

Changes since the last alpha:

- `buildRouteSnapperGraphBytes` returns `null` without node coordinates, instead of falling back to a Berlin bounding box.
- Removed from the public API: `countRoutingNetworkEdges`, `emptyLineCollection`.

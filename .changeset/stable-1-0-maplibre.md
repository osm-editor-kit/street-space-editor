---
"@osm-editor-kit/osm-maplibre": major
---

First stable release. Stable OpenFreeMap Positron basemap style for MapLibre with an overlay anchor layer, plus metre-based line width and offset paint helpers and focus (highlight and mute) paint helpers.

Changes since the last alpha:

- `maplibre-gl` is now a peer dependency, install it yourself (`^6`).
- `lineWidthFromMeters`, `lineOffsetFromMeters`, `focusCaseColor` and `focusCaseOpacity` return `ExpressionSpecification` instead of `unknown`.
- Removed from the public API: `patchOpenFreeMapStyle`, `appendCustomContentAnchor`, `MAP_CUSTOM_CONTENT_ANCHOR_SOURCE_ID`, `EARTH_CIRCUMFERENCE`, `TILE_SIZE`, `GERMANY_LAT`, `PIXEL_SCALE_GERMANY`, `pixelScaleFactorAtLat`, `pixelsFromMeters`, `MAP_FOCUS_MUTED_COLOR`, `MAP_FOCUS_MUTED_OPACITY`.

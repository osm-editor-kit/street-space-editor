# `@osm-editor-kit/osm-maplibre`

MapLibre helpers for OSM editors: an OpenFreeMap Positron basemap style, an anchor layer for your overlays, and line paint in real-world metres.

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this package. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

## Install

```bash
npm install @osm-editor-kit/osm-maplibre
```

Also install the peer dependency `maplibre-gl` (the package uses its `StyleSpecification` and `ExpressionSpecification` types).

## What it does

- Ready-to-use OpenFreeMap Positron basemap style for MapLibre editors
- Anchor layer id so your overlays stack above the basemap
- Line width and offset from real-world metres (zoom-aware paint expressions)
- Focus styling helpers (highlight matching features, mute the rest)
- `buildOpenFreeMapPositronStyle` to rebuild the Positron style from an upstream style JSON

## Usage

```tsx
import {
  OPENFREEMAP_POSITRON_STYLE,
  OPENFREEMAP_POSITRON_IMAGERY_USED,
  MAP_CUSTOM_CONTENT_ANCHOR_LAYER_ID,
  lineWidthFromMeters,
  lineOffsetFromMeters,
  focusCaseColor,
  focusCaseOpacity,
  metersPerPixel,
  buildOpenFreeMapPositronStyle,
} from '@osm-editor-kit/osm-maplibre'

// Default basemap for <Map mapStyle={…} />
const style = OPENFREEMAP_POSITRON_STYLE

// Stack app layers above the basemap (react-map-gl `beforeId`)
<Layer id="my-overlay" beforeId={MAP_CUSTOM_CONTENT_ANCHOR_LAYER_ID} … />

// Line width/offset from feature properties in metres (zoom-aware)
'line-width': lineWidthFromMeters('roadWidthM')
'line-width': lineWidthFromMeters('roadWidthM', { extraMeters: 2 }) // wider hit target
'line-offset': lineOffsetFromMeters('parentRoadWidthM', 0.5, {
  sign: ['case', ['==', ['get', 'side'], 'left'], -1, 1],
})

// Active vs muted styling when focus filter matches
'line-color': focusCaseColor(['==', ['get', 'infra'], 'car'], '#2563eb')
'line-opacity': focusCaseOpacity(['==', ['get', 'infra'], 'car'], 0.55)

metersPerPixel(16, 51) // ground metres per screen pixel at zoom/latitude

// Rebuild the style from an upstream OpenFreeMap style JSON
buildOpenFreeMapPositronStyle(upstreamStyle) // null-safe filters + anchor layer
```

`OPENFREEMAP_POSITRON_IMAGERY_USED` is the iD-style `imagery_used` label for the default basemap when no ELI overlay is active.

The metre-based paint uses a fixed pixel scale for latitude 51° (Germany). Widths drift at other latitudes.

## License

MIT

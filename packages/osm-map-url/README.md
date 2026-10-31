# `@osm-editor-kit/osm-map-url`

Parse and serialize compact map and OSM feature URL params (`?map=zoom/lat/lng`, `?f=way/id`) for TanStack Router apps.

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this package. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

## Install

```bash
npm install @osm-editor-kit/osm-map-url
```

Also install the peer dependency `@tanstack/react-router`.

## What it does

- Read and write `?map=zoom/lat/lng` (optional bearing as 4th segment) for the map camera
- Read and write `?f=way/id` (and `way/id/cycleway|sidewalk/left|right` sidepath refs) for the selected feature
- Round coordinates by zoom level to keep URLs short
- Redirect old `#map=…` hashes to the query-param form
- Search param helpers for TanStack Router that keep the slash form in the URL bar
- Store and restore the last map view in a `location` cookie

## Usage

```ts
import {
  parseMapParam,
  serializeMapParam,
  parseFeatureParam,
  serializeFeatureParam,
  redirectLegacyMapHash,
  routerSearch,
  getLocationFromCookie,
  setLocationToCookie,
} from '@osm-editor-kit/osm-map-url'

parseMapParam('16/52.4751/13.4435') // → { zoom: 16, lat: 52.4751, lng: 13.4435 }
parseMapParam('16/52.4751/13.4435/45') // → { …, bearing: 45 }
parseMapParam('99/0/0') // → null (invalid input returns null)
serializeMapParam({ zoom: 16, lat: 52.4751, lng: 13.4435 }) // → "16/52.4751/13.4435"

parseFeatureParam('way/123') // → { type: 'way', id: 123 }
parseFeatureParam('way/123/cycleway/left') // → { type: 'way', id: 123, prefix: 'cycleway', side: 'left' }
serializeFeatureParam({ type: 'way', id: 123 }) // → "way/123"

// On app start: rewrites `#map=16/52.4751/13.4435` to `?map=16/52.4751/13.4435` in place (history.replaceState)
redirectLegacyMapHash()

// Last map view, stored in the `location` cookie (browser only)
setLocationToCookie({ lat: 52.4751, lng: 13.4435 }, 16)
getLocationFromCookie() // → { location: { lat, lng }, zoom } | undefined
```

### TanStack Router

Use `routerSearch` as `parseSearch` and `stringifySearch` so `map` and `f` stay in slash form instead of JSON.

```ts
import { createRouter } from '@tanstack/react-router'
import { routerSearch } from '@osm-editor-kit/osm-map-url'

const router = createRouter({
  routeTree,
  parseSearch: routerSearch.parse,
  stringifySearch: routerSearch.stringify,
})

routerSearch.stringify({
  map: { zoom: 16, lat: 52.4751, lng: 13.4435 },
  f: { type: 'way', id: 123 },
}) // → "?map=16/52.4751/13.4435&f=way/123"
```

`routerSearch.parse` returns `map` and `f` as strings. Run them through `parseMapParam` and `parseFeatureParam`, for example in the route's `validateSearch`.

Also exported: the types `MapParam`, `OsmFeatureRef`, and `LocationAndZoom`.

## License

MIT

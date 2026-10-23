# `@osm-editor-kit/osm-editor-links`

> [!NOTE]
> This package is an **alpha** release and still under active development. APIs may change; install with the npm `alpha` dist-tag.

## What it does

- Link lists for one OSM element, one changeset or one user: the OSM website, history, editors, viewers and JOSM, with a stable `id` and an English label per link
- `linksIn` keeps the links offered at a country (for example TILDA only in Germany)
- Deep links to osm.org element and changeset pages, web editors (iD, Rapid), JOSM remote control, OSM API map downloads, Mapillary, OSM Deep History, OSMCha and TILDA inspector URLs
- OSM type helpers and a JOSM link-click handler

## Link lists

```ts
import { elementLinks, changesetLinks, userLinks, linksIn } from '@osm-editor-kit/osm-editor-links'

elementLinks({ type: 'way', id: 123, loc: { lat: 52.5, lng: 13.4 } })
// osm-history, osm, deep-history, pewu, id, rapid, josm, level0,
// mapillary, panoramax, tilda (tilda only with countries ['de'])

changesetLinks({ id: 42 }) // osm-changeset, osmcha, achavi, resultmaps, osm-revert, josm, level0
userLinks({ name: 'Anna Müller' }) // osm-user, hdyc, osmcha-user, missingmaps
```

Each link is `{ id, label, url, countries?, josm? }`. Apps translate by `id` and fall back to `label`. A link with `josm: true` opens with `handleJosmLinkClick` (JOSM remote control) instead of a new tab.

Pass `server` to edit on another OSM website, for example the development server `https://master.apis.dev.openstreetmap.org`. The default is `https://www.openstreetmap.org`. Other servers get only their own links (element history and object page, changeset page, user profile); third-party tools only read production data.

```ts
const links = elementLinks({ type: 'way', id: 123, loc: { lat: 52.5, lng: 13.4 } })
const offered = linksIn(links, ['de']) // keeps TILDA; with ['fr'] it is dropped
```

## Other helpers

```ts
import {
  osmOrgUrl,
  osmEditIdUrl,
  josmLoadObjectUrl,
  idEditorUrl,
  getUrl,
  mapillaryUrl,
  osmchaChangesetUrl,
  tildaInspectorUrl,
  handleJosmLinkClick,
  osmProdUrl,
} from '@osm-editor-kit/osm-editor-links'

osmOrgUrl({ osmType: 'way', osmId: 123 }) // → https://www.openstreetmap.org/way/123
osmEditIdUrl({ osmType: 'way', osmId: 123, hashtags: 'TILDA' })

josmLoadObjectUrl({ osmType: 'way', osmId: 123 }) // http://127.0.0.1:8111/load_object?…
idEditorUrl({ center: { lat: 52.47, lng: 13.44 }, zoom: 16 })

getUrl({ west: 13.4, south: 52.4, east: 13.5, north: 52.5 }, false) // OSM API map bbox URL
mapillaryUrl({ lat: 52.47, lng: 13.44 }, { dateFrom: '2024-01-01' })

osmchaChangesetUrl(12345)
tildaInspectorUrl({
  regionSlug: 'radinfra',
  map: { zoom: 16, lat: 52.47, lng: 13.44 },
  features: { sourceId: 'atlas_bikelanes', featureId: 123, coords: [13.44, 52.47] },
})

await handleJosmLinkClick(event) // JOSM remote-control link click (fetches the link, no navigation)
```

Depends on `@osm-editor-kit/osm-data` for shared map bounds and OSM object types.

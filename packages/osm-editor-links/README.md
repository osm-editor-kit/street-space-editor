# `@osm-editor-kit/osm-editor-links`

Link lists for an OpenStreetMap element, changeset or user (website, history, editors, viewers, imagery), plus URL builders and a JOSM remote-control click handler. For apps that send people from their data to OSM tools.

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this package. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

## Install

```bash
npm install @osm-editor-kit/osm-editor-links
```

## What it does

- Builds the link list for one OSM element, one changeset or one user. Each link has a stable `id` and an English `label`.
- `linksIn` keeps the links offered in a country (for example TILDA only in Germany).
- Builds single URLs: osm.org pages, iD, JOSM remote control, OSM API map downloads, Mapillary, OSM Deep History, OSMCha and the TILDA inspector.
- Converts OSM types between long and short form (`way` and `w`).
- `handleJosmLinkClick` sends a JOSM link to JOSM without navigating away.

## Usage

```ts
import { elementLinks, changesetLinks, userLinks, linksIn } from '@osm-editor-kit/osm-editor-links'

elementLinks({ type: 'way', id: 123, loc: { lat: 52.5, lng: 13.4 } })
// osm-history, osm, deep-history, pewu, id, rapid, josm, level0,
// mapillary, panoramax, tilda (tilda only with countries ['de'])

changesetLinks({ id: 42 }) // osm-changeset, osmcha, achavi, resultmaps, osm-revert, josm, level0
userLinks({ name: 'Anna Müller' }) // osm-user, hdyc, osmcha-user, missingmaps
```

Each link is `{ id, label, url, countries?, josm? }`. Apps translate by `id` and fall back to `label`. A link with `josm: true` opens with `handleJosmLinkClick` instead of a new tab.

`loc` adds the imagery and TILDA links; `zoom` (default 17) sets their map zoom.

Pass `server` to edit on another OSM website, for example the development server `https://master.apis.dev.openstreetmap.org`. The default is `https://www.openstreetmap.org`. Other servers get only their own links (element history and object page, changeset page, user profile), because third-party tools only read production data.

```ts
const links = elementLinks({ type: 'way', id: 123, loc: { lat: 52.5, lng: 13.4 } })
const offered = linksIn(links, ['de']) // keeps TILDA; with ['fr'] it is dropped
```

## JOSM links

JOSM remote control answers the request itself, so the browser must not follow the link. `handleJosmLinkClick` cancels the navigation and fetches the link instead. It rejects when JOSM is not running.

```ts
import { handleJosmLinkClick } from '@osm-editor-kit/osm-editor-links'

link.addEventListener('click', handleJosmLinkClick)
```

In React, pass the event as is: `onClick={handleJosmLinkClick}`. The handler reads the link from `event.target`, so attach it to the `<a>` or a parent of it.

## Single URLs

```ts
import {
  osmOrgUrl,
  osmEditIdUrl,
  josmLoadObjectUrl,
  josmImportUrl,
  idEditorUrl,
  getUrl,
  mapillaryUrl,
  osmchaChangesetUrl,
  tildaInspectorUrl,
} from '@osm-editor-kit/osm-editor-links'

osmOrgUrl({ osmType: 'way', osmId: 123 }) // https://www.openstreetmap.org/way/123
osmEditIdUrl({ osmType: 'way', osmId: 123, hashtags: 'TILDA' })

josmLoadObjectUrl({ osmType: 'way', osmId: 123 }) // http://127.0.0.1:8111/load_object?objects=w123
josmImportUrl('https://example.org/data.osm') // http://127.0.0.1:8111/import?url=https://example.org/data.osm
idEditorUrl({ center: { lat: 52.47, lng: 13.44 }, zoom: 16 })

getUrl({ west: 13.4, south: 52.4, east: 13.5, north: 52.5 }, false) // OSM API map bbox URL
mapillaryUrl({ lat: 52.47, lng: 13.44 }, { dateFrom: '2024-01-01' })

osmchaChangesetUrl(12345)
tildaInspectorUrl({
  regionSlug: 'radinfra',
  map: { zoom: 16, lat: 52.47, lng: 13.44 },
  features: {
    sourceId: 'atlas_bikelanes',
    featureId: 123,
    coords: { kind: 'point', lon: 13.44, lat: 52.47 },
  },
})
```

URL builders that take an OSM type and id return `undefined` when either is missing.

`@osm-editor-kit/osm-data` is installed as a dependency; it provides the shared map bounds and OSM object types.

## License

MIT

# `@osm-editor-kit/osm-data`

Download OSM JSON from Overpass or the OSM API, parse it into an indexed in-memory store, and merge several downloads into one. For apps that show or check OSM data.

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this package. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

## Install

```bash
npm install @osm-editor-kit/osm-data
```

## What it does

- Fetches OSM JSON from a URL (Overpass or OSM API).
- Parses `elements` into indexes by id: ways, relations, tagged nodes, and node coordinates (`[lat, lon]`).
- Marks which ways are members of a relation (`waysInRelation`).
- Merges two parsed stores. Ways and relations keep the higher `version`; nodes and coordinates from the newer store replace existing ones.
- Exports TypeScript types for OSM elements and the parsed store.

It only fetches, parses, and indexes. It does not edit OSM data or write tags.

## Usage

```ts
import {
  downloadOsmData,
  emptyParsedOsmData,
  mergeParsedOsm,
  parseOsmResp,
  type ParsedOsmData,
  type RawOsmData,
} from '@osm-editor-kit/osm-data'

// Download from a URL that returns OSM JSON (throws when the request fails, for example HTTP 429)
const downloaded: ParsedOsmData = await downloadOsmData(
  'https://overpass-api.de/api/interpreter?data=[out:json];way(52.47,13.44,52.48,13.45)[highway];out;',
)

// Or parse a response you already have
const raw: RawOsmData = { elements: [] }
const parsed = parseOsmResp(raw)

// Merge into one store; start from an empty store if you have nothing yet
const store = mergeParsedOsm(emptyParsedOsmData(), downloaded)
const combined = mergeParsedOsm(store, parsed)

combined.ways[42]?.tags.highway
combined.nodeCoords[10] // [lat, lon]
combined.waysInRelation[42] // true when a parsed relation lists way 42
```

Notes:

- `parseOsmResp` throws on element types other than `node`, `way`, and `relation`.
- `waysInRelation` only marks ways that appear in the response before the relation. Overpass lists ways before relations, so this works with its default output.
- Only nodes with tags are stored in `nodes`. All nodes are stored in `nodeCoords`.

## License

MIT

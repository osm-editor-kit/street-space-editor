# `@osm-editor-kit/osm-way-chain`

Walk connected OSM ways from a center way and orient them into one chain, for editors that change several segments of a street at once.

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this package. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

## Install

```bash
npm install @osm-editor-kit/osm-way-chain
```

It depends on `@osm-editor-kit/osm-data`, which npm installs for you.

## What it does

- Walks connected ways left and right from a center way
- Ranks neighbor candidates (same kind of road, name, ref)
- Reports junctions where more than one neighbor is equally good, so the user can choose
- Flips geometry and directional tags when a way is digitized the "wrong" way (`mirrorTags`)
- Compiles app-owned way-selection policies to Overpass queries and matches them against in-memory tags
- Reads from an in-memory `ParsedOsmData` session (`createSessionGraphAdapter`) or any data source that implements `OsmDataAdapter`

## Usage

```ts
import type { ParsedOsmData } from '@osm-editor-kit/osm-data'
import {
  buildChain,
  buildWaysOverpassQuery,
  createSessionGraphAdapter,
  matchesOsmWaySelectionSegment,
  tag,
  type OsmWaySelectionPolicy,
} from '@osm-editor-kit/osm-way-chain'

// App-owned contract: which ways to download and chain. The package has no defaults.
const wayPolicy: OsmWaySelectionPolicy = {
  include: [
    { all: [tag.oneOf('highway', ['residential', 'cycleway', 'path', 'footway', 'steps'])] },
  ],
  globalAll: [tag.neq('access', 'private'), tag.neq('access', 'no')],
}

const graph: ParsedOsmData = /* loaded viewport data */
const adapter = createSessionGraphAdapter(graph)

const { chain, pendingJunctions } = await buildChain(adapter, {
  centerWayId: 123456,
  maxPerSide: 5,
  candidateFilter: (candidate) => matchesOsmWaySelectionSegment(candidate, wayPolicy),
})

// Overpass query that downloads the same ways for a bbox (south,west,north,east):
const query = buildWaysOverpassQuery(wayPolicy, '52.5,13.4,52.51,13.41')
```

`buildChain` returns the ordered `chain.segments`, the index of the center way in `chain.centerIndex`, and `pendingJunctions` for places where it could not pick a neighbor.

## Junctions

When a junction has several equally good neighbors, `buildChain` stops there and lists them in `pendingJunctions`. Let the user pick one, then continue with `extendChainAtJunction(adapter, chain, choice, selectedWayId, { maxPerSide, candidateFilter })`. Use `recenterChain(chain, wayId)` to move the center to another way in the chain without reloading; it returns the chain unchanged when the way is not part of it.

## Way-selection policies

A policy is a list of `include` clauses (OR), each a list of tag predicates (AND), plus optional `globalAll` predicates added to every clause. Build predicates with `tag.eq`, `tag.neq`, `tag.oneOf`, `tag.noneOf`, `tag.regex`, `tag.nregex`, `tag.present` and `tag.absent`. `compileOverpassWaySelectors` returns one Overpass filter per clause, `matchesOsmWaySelection` tests in-memory tags. A missing tag matches `neq`, `noneOf`, `nregex` and `absent`, as in Overpass.

`tag.regex` and `tag.nregex` patterns run as JavaScript `RegExp` in memory but go to Overpass unchanged, where they are POSIX extended regular expressions. Use only syntax both understand: anchors, groups, `|`, `[...]`, `*`, `+`, `?`, `{n,m}`. `\d`, `(?:...)`, lookarounds and lazy quantifiers behave differently or fail in Overpass.

## Helpers

- `mirrorTags(tags)` returns the tags as if the way were digitized the other way round (left/right, forward/backward, `oneway`, `*:lanes`, `placement`). `normalizeTagsForDirection(tags, reversed)` applies it only when `reversed`; `swapLeftRightKey(key)` swaps one key.
- `orientNeighbor(neighbor, sharedNodeId, from)` flips a neighbor so it runs in the direction of `from`.
- `getSharedNodeBetween(a, b)`, `getEndpointNodeId(segment, direction)` and `getOtherEndpointNodeId(segment, nodeId)` read way endpoints.
- `osmWayToSegment(way, nodeCoords)` turns an `OsmWay` from `@osm-editor-kit/osm-data` into a `Segment`.

## Other data sources

Implement `OsmDataAdapter` to chain ways from somewhere other than a loaded session:

```ts
import type { OsmDataAdapter, Segment } from '@osm-editor-kit/osm-way-chain'

const waysById = new Map<number, Segment>() // fill from your own source

const adapter: OsmDataAdapter = {
  getWay: async (wayId) => {
    const way = waysById.get(wayId)
    if (!way) throw new Error(`Way ${wayId} not found`)
    return way
  },
  // All ways that use this node
  getWaysForNode: async (nodeId) =>
    [...waysById.values()].filter((way) => way.nodeIds.includes(nodeId)),
}
```

## License

MIT

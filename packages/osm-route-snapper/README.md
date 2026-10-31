# `@osm-editor-kit/osm-route-snapper`

Build a [route-snapper](https://github.com/a-b-street/route-snapper) graph from OSM data you already loaded with `@osm-editor-kit/osm-data`, and read its routing network as GeoJSON.

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this package. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

## Install

```bash
npm install @osm-editor-kit/osm-route-snapper
```

Also install the peer dependencies: `react`, `@tanstack/react-query` and `route-snapper` (`^0.4.9`).

## What it does

- Builds route-snapper graph bytes from `ParsedOsmData` (vendored `osm-to-route-snapper` WASM)
- Exports the routing network as GeoJSON LineStrings (edges split at intersections)
- Exports the highway ways as GeoJSON LineStrings
- Gives a signature that changes when the loaded OSM data grows, for cache keys
- Optional TanStack Query hook that rebuilds the graph whenever more OSM data is loaded

## Usage

**Build the graph directly.** Pass merged `ParsedOsmData`. You get `Uint8Array` graph bytes, or `null` when there are no ways or no node coordinates.

```ts
import {
  buildRouteSnapperGraphBytes,
  routingNetworkGeoJsonFromBytes,
} from '@osm-editor-kit/osm-route-snapper'

const graphBytes = await buildRouteSnapperGraphBytes(parsedOsm)
const routingNetwork = graphBytes ? await routingNetworkGeoJsonFromBytes(graphBytes) : null
```

**React with TanStack Query.** The WASM has no incremental API, so the hook rebuilds the full graph each time the loaded data grows.

```ts
import { createRouteSnapperGraphApi } from '@osm-editor-kit/osm-route-snapper'

const { createUseQuery } = createRouteSnapperGraphApi({
  getGraphKey: () => ['route-snapper-graph'],
  useCoverageGraph: () => useMyParsedOsmData(), // your hook returning ParsedOsmData
})

const useRouteSnapperGraphQuery = createUseQuery()

// In a component:
const { data } = useRouteSnapperGraphQuery()
// data: { graphBytes, wayCount, edgeCount, overpassWays, routingNetwork, lastError }
```

`getGraphKey` is the query key prefix. The coverage signature is appended to it.

## API

- `buildRouteSnapperGraphBytes(data)`: graph bytes, or `null` when there are no ways or no node coordinates
- `routingNetworkGeoJsonFromBytes(graphBytes)`: routing-network LineStrings
- `parsedOsmWaysToFeatureCollection(data)`: ways as LineStrings with an `osm_way_id` property
- `countRoadWays(data)`: number of ways
- `coverageGraphSignature(data)`: string that changes when ways or nodes are added
- `parsedOsmToXml(data)`: minimal OSM XML as fed to the WASM converter
- `createRouteSnapperGraphApi(options)`: returns `{ emptyData, createUseQuery }`
- `emptyRouteSnapperGraphData()`: empty result

## License

MIT

# `@osm-editor-kit/osm-coverage`

Incremental OSM data fetching for map viewports, with the session state kept in TanStack Query. For OSM editors that load data as the user pans and zooms.

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this package. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

## Install

```bash
npm install @osm-editor-kit/osm-coverage
```

Also install the peer dependencies `react` and `@tanstack/react-query`.

## What it does

- Downloads OSM data for the current map viewport, and only the parts you have not covered yet.
- Keeps a session graph of nodes, ways and relations while the map moves.
- Tracks covered areas as polygons, so refetches skip what you already have.
- Records the fetch history as GeoJSON for debugging and UI.
- Builds Overpass interpreter URLs for common servers.
- Optionally saves graph and coverage through a `storage` adapter, so a reload does not start from zero.

## Usage

```ts
import { QueryClient } from '@tanstack/react-query'
import {
  boundsToOverpassBbox,
  buildOverpassInterpreterUrl,
  createOsmCoverageApi,
  overpassDeUrl,
} from '@osm-editor-kit/osm-coverage'

const api = createOsmCoverageApi<{ region: string }>({
  getSessionKey: ({ region }) => ['osm', region] as const,
  minZoom: 14,
  getDownloadUrl: (bounds) =>
    buildOverpassInterpreterUrl(
      overpassDeUrl,
      `[out:xml][timeout:60];way["highway"](${boundsToOverpassBbox(bounds)});(._;>;);out meta;`,
    ),
  // optional: storage: { load, save, clear }
})

const queryClient = new QueryClient()
const params = { region: 'berlin' }

await api.restoreSession(queryClient, params)
await api.ensureCoverage(queryClient, {
  bounds: { south: 52.47, west: 13.44, north: 52.48, east: 13.45 },
  zoom: 18,
  mapSizePx: { width: 1024, height: 768 },
  ...params,
})

const data = queryClient.getQueryData(api.sessionKey(params))
// { graph, coverage, fetchHistory, savedAt }
```

Call `ensureCoverage` whenever the map settles. It returns `{ skipped: true }` when nothing needs to be downloaded: below `minZoom`, viewport already covered, or `isNetworkEnabled` returns `false`. Concurrent calls for the same session run one after another.

## React hooks

`createOsmCoverageApi` also returns hook factories. Each takes a function that returns your session params:

```ts
const useOsmQuery = api.createUseQuery(() => ({ region: 'berlin' }))
const useIsOsmFetching = api.createUseIsFetching(() => ({ region: 'berlin' }))
const useResetOsmOnSessionChange = api.createUseResetOnSessionChange(() => ({ region: 'berlin' }))
```

- `useOsmQuery({ select })` returns the session data `{ graph, coverage, fetchHistory, savedAt }`.
- `useIsOsmFetching()` is `true` while a coverage download is running.
- `useResetOsmOnSessionChange()` clears the session when the params change.

## Storage

Pass `storage: { load, save, clear }` to keep graph and coverage across reloads. Each function receives the session key. Saves are debounced (`storageSaveDebounceMs`, default 500 ms). The fetch history is not saved.

- `api.restoreSession(queryClient, params)` loads the stored session once per session key. `ensureCoverage` calls it for you unless you pass `skipRestore`.
- `api.clearPersisted(params)` deletes the stored session.
- `ensureCoverage(…, { force: true })` refetches the viewport from scratch. Add `clearPersistedOnForce: true` to wipe the stored session too.

## Data age

`formatCoverageAgeHour(savedAt)` rounds `savedAt` down to the hour for display, for example `14:00` for today or `2026-10-24 14:00` for another day. It returns `null` for a missing or invalid value. `getCoverageSavedAt(savedAt)` returns the ISO string or `null`.

## Options

| Option                  | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `getSessionKey`         | Maps your session params to a TanStack Query key.                           |
| `minZoom`               | No downloads below this zoom.                                               |
| `getDownloadUrl`        | Builds the download URL for a bounding box.                                 |
| `download`              | Replaces the default `downloadOsmData` from `@osm-editor-kit/osm-data`.     |
| `isNetworkEnabled`      | Return `false` to pause all downloads.                                      |
| `storage`               | Durable store for graph and coverage.                                       |
| `storageSaveDebounceMs` | Delay for storage writes after a merge. Default 500.                        |
| `onPersistError`        | Called when a debounced storage write fails. Failures are silent otherwise. |

## Other exports

- `overpassDeUrl`, `overpassVkUrl`: Overpass interpreter endpoints for `buildOverpassInterpreterUrl`.

## License

MIT

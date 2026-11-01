# @osm-editor-kit/osm-editor-links

## 1.0.1

### Patch Changes

- 8c4b8b0: - No longer installs `@osm-editor-kit/osm-data` and its `axios`. The package now has no dependencies. Function signatures stay the same.

## 1.0.0

### Major Changes

- First stable release. Link lists for an OSM element, changeset and user with stable ids and country filtering, URL builders for osm.org, iD, JOSM, Mapillary, OSMCha and TILDA, and a JOSM remote-control click handler.

    Changes since the last alpha:

    - `josmImportUrl(url)` now takes the URL. It used to return only the prefix, so `josmImportUrl() + url` no longer works.
    - `josmLoadObjectUrl` no longer adds `TILDA` as changeset hashtag; pass `changesetHashtags`.
    - `handleJosmLinkClick` accepts native and React click events, so React apps no longer need `.nativeEvent`.
    - Level0 links use https.
    - Removed from the public API: `josmUrl`, `osmEditKyleKiwiIdUrl`, `osmEditRapidUrl`, `TILDA_INFRA_PRESETS`, `TILDA_SOURCE_NUMERIC_IDS`, `TildaInfraPreset`, `tildaSourceNumericId`, `tildaSourceIdFromNumeric`, `tildaInfraSourceNumericId`, `longOsmType`, `shortOsmType`, `josmRemoteBase`, `osmchaBase`, `osmDeepHistoryBase`, `tildaGeoBase`.

### Patch Changes

- c31ec5d: - The repository and homepage links point to the new home, [osm-editor-kit/street-space-editor](https://github.com/osm-editor-kit/street-space-editor).
- Updated dependencies [c31ec5d]
- Updated dependencies
    - @osm-editor-kit/osm-data@1.0.0

## 0.1.0-alpha.2

### Patch Changes

- `handleJosmLinkClick` cancels the navigation before it calls JOSM; before, the browser followed the link to 127.0.0.1:8111.

## 0.1.0-alpha.1

### Patch Changes

- Published from the packed tarball, so the registry lists the dist entry points and the version of `@osm-editor-kit/osm-data` (0.1.0-alpha.0 listed `workspace:*` and `src/`).

## 0.1.0-alpha.0

### Minor Changes

- Link lists for an element, a changeset and a user (`elementLinks`, `changesetLinks`, `userLinks`), with `linksIn` to keep the links offered in one country; `handleJosmLinkClick` uses `fetch` instead of axios.

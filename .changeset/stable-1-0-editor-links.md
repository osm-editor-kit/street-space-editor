---
"@osm-editor-kit/osm-editor-links": major
---

First stable release. Link lists for an OSM element, changeset and user with stable ids and country filtering, URL builders for osm.org, iD, JOSM, Mapillary, OSMCha and TILDA, and a JOSM remote-control click handler.

Changes since the last alpha:

- `josmImportUrl(url)` now takes the URL. It used to return only the prefix, so `josmImportUrl() + url` no longer works.
- `josmLoadObjectUrl` no longer adds `TILDA` as changeset hashtag; pass `changesetHashtags`.
- `handleJosmLinkClick` accepts native and React click events, so React apps no longer need `.nativeEvent`.
- Level0 links use https.
- Removed from the public API: `josmUrl`, `osmEditKyleKiwiIdUrl`, `osmEditRapidUrl`, `TILDA_INFRA_PRESETS`, `TILDA_SOURCE_NUMERIC_IDS`, `TildaInfraPreset`, `tildaSourceNumericId`, `tildaSourceIdFromNumeric`, `tildaInfraSourceNumericId`, `longOsmType`, `shortOsmType`, `josmRemoteBase`, `osmchaBase`, `osmDeepHistoryBase`, `tildaGeoBase`.

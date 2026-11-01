---
"@osm-editor-kit/osm-data": patch
---

- No longer installs `axios`: `downloadOsmData` now uses the built-in `fetch`, and the package has no dependencies. HTTP errors still reject with `Request failed with status code <status>`. Thrown errors are plain `Error`s, without the axios `response` field.

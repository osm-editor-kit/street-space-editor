# @osm-editor-kit/osm-editor-links

## 0.1.0-alpha.2

### Patch Changes

- `handleJosmLinkClick` cancels the navigation before it calls JOSM; before, the browser followed the link to 127.0.0.1:8111.

## 0.1.0-alpha.1

### Patch Changes

- Published from the packed tarball, so the registry lists the dist entry points and the version of `@osm-editor-kit/osm-data` (0.1.0-alpha.0 listed `workspace:*` and `src/`).

## 0.1.0-alpha.0

### Minor Changes

- Link lists for an element, a changeset and a user (`elementLinks`, `changesetLinks`, `userLinks`), with `linksIn` to keep the links offered in one country; `handleJosmLinkClick` uses `fetch` instead of axios.

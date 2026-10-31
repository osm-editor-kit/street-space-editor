# Street Space Editor for OpenStreetMap

- [Open the editor](https://osm-editor-kit.github.io/street-space-editor/?zoom=16&lat=52.4751&lng=13.4435)
- Learn more about the project [in the launch post](https://www.openstreetmap.org/user/acsd/diary/45026).

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of this project. [@tordans](https://github.com/tordans) specified what it should do and tested and verified its user-facing behavior.

One app with a shared OSM shell (auth, fetch, changeset upload) and **modes** for visualization and editing:

| Mode | Status |
| --- | --- |
| Parking | Active |
| Width | Active |
| Bicycle | Active |
| Lanes | Planned |
| Surface | Active |
| Sidewalks | Planned |

Modes plug into `app/src/modes/`; the shell lives in `app/src/shell/`. Shared kit packages remain under `packages/*`.

**Deploy path:** Vite / GH Pages base is `/street-space-editor/`.

## Screenshots

Viewer:

<img src="https://i.imgur.com/VwH7Hmh.png" alt="Viewer UI">

Editor:

<img src="https://i.imgur.com/e0vsqUQ.png" alt="Editor UI">

# Using correct Node version

The correct Node version is specified in `.nvmrc`.

For an easy way to automatically use this Node version just for your current shell:

- Install `nvm`
  - Using the [install script](https://github.com/nvm-sh/nvm#install--update-script)
  - Or using [Homebrew](https://formulae.brew.sh/formula/nvm)
- Run `nvm use` to automatically use the Node version specified in the `.nvmrc`. You may need to
  `nvm install`.

## Development

From the repo root:

```sh
bun install
bun run dev
```

The Vite app lives in `app/` (`@osm-editor-kit/street-space-editor`). Run `bun run check` from the root before pushing.

**Dev OSM data:** In development, the app defaults to a local Berlin fixture served as OSM Map API bbox slices (`dev-osm-map-fixture`). Use the debug panel’s “Live OSM viewport fetch” toggle to hit the real OSM Map API instead. The fixture file is downloaded on `bun run dev` via `predev` if missing.

### Audit — how the app understands OSM data

Flat audit pages (no mode chrome) for reviewing interpretation rules and fixtures:

**Local (with `bun run dev`):**

- [Width audit](http://localhost:5173/street-space-editor/audit-width) — measure rules and tag relations
- [Lanes audit](http://localhost:5173/street-space-editor/audit-lanes/one-lane-each-way) — cross-section / plan-sketch interpretation (one demo per URL)

**Deployed:**

- https://osm-editor-kit.github.io/street-space-editor/audit-width
- https://osm-editor-kit.github.io/street-space-editor/audit-lanes/one-lane-each-way

## Release

Versions and changelogs use [changesets](https://github.com/changesets/changesets), see [`.changeset/README.md`](.changeset/README.md). Releases run from a terminal with npm 2FA:

```bash
bun run release
```

## Install git hook

[Husky](https://github.com/typicode/husky) runs `bun run check-pre-push` on pre-push (type-check, lint, format, test-run — same areas as CI). See `.husky/pre-push`.

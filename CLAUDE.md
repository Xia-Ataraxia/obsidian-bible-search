# obsidian-bible-search

Korean/English Bible verse search plugin for Obsidian. Root `AGENTS.md` rules apply; see `obsidian-boiler-template/README.md` for the shared layers, CI and release flow.

## Distribution

The repo is private (Bible text copyright) and not in the community directory. BRAT cannot fetch releases without a PAT: copy `dist/main.js` + `dist/manifest.json` into a vault's plugin folder, or `gh release download --repo Xia-Ataraxia/obsidian-bible-search`.

## Commands

`bun run dev` (watch into `dist/`), `build`, `typecheck`, `lint`, `test`, `ci` (all four). `bun run release <bump>` opens a version-bump PR; CI tags and publishes. Never tag locally.

## Architecture

- `src/main.ts`: lifecycle and wiring.
- `src/ui/`: Obsidian code (modal, suggest, settings tab, notices, source adapters in `ui/sources/`).
- `src/domain/`, `src/utils/`, `src/types/`: pure logic, must not import `obsidian` (lint-enforced).
- Tests in `test/` cover pure logic only.

## Gotchas

- manifest `id` is `korean-bible-search`, name "Korean Bible Search" (renamed from `obsidian-bible-search` before the Community listing: ids and names must be unique and ids may not contain "obsidian"). Repo and package stay `obsidian-bible-search`.
- Settings use `getSettingDefinitions()` (minAppVersion 1.13.0); `setControlValue` in `BibleSettingsTab` applies empty-value fallbacks and clears the cache when disabled.

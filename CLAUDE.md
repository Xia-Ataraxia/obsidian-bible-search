# obsidian-bible-search

Korean/English Bible verse search plugin for Obsidian.

## Distribution

**This repo is private** due to copyright concerns with Bible text data. It is NOT published to the Obsidian community plugin directory.

### Installing / Updating

Since the repo is private, BRAT cannot fetch releases without a PAT. Use one of:

1. **Direct copy** (recommended): build locally and copy to vault
   ```bash
   pnpm build
   cp main.js manifest.json "$OBSIDIAN_VAULT_PATH/.obsidian/plugins/obsidian-bible-search/"
   obsidian plugin:reload id=obsidian-bible-search
   ```
2. **GitHub release download**: download `main.js` + `manifest.json` from the latest GitHub release via `gh`
   ```bash
   gh release download --repo Xia-Ataraxia/obsidian-bible-search --dir "$OBSIDIAN_VAULT_PATH/.obsidian/plugins/obsidian-bible-search/" --pattern 'main.js' --pattern 'manifest.json' --clobber
   obsidian plugin:reload id=obsidian-bible-search
   ```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Hot reload (requires `.hotreload` in vault plugin dir) |
| `pnpm build` | Production build (`tsc` + esbuild) |
| `pnpm test` | Vitest |
| `pnpm lint` | ESLint |
| `pnpm release:patch` | Run CI + version bump + push + tag (triggers CI release) |

## Release Flow

`pnpm release:patch` handles the full cycle:
1. `pnpm run ci`
2. `pnpm version patch` → bumps `package.json` + `manifest.json` (via `scripts/version.mjs`)
3. `postversion` → `git push && git push --tags`
4. Tag push triggers `.github/workflows/release.yml` → builds and creates GitHub release with `main.js`, `manifest.json`

Do NOT manually create tags or releases — use `pnpm release:patch`.

# Korean Bible Search

Search Korean/English Bible verses and insert with configurable template format.

![Searching for John 3:16 in the Korean Bible Search modal and inserting it as a quote with a working [[John 3|John 3:16]] link, the Korean text and the English (ESV) text.](https://raw.githubusercontent.com/Xia-Ataraxia/obsidian-bible-search/main/docs/assets/demo.webp)

## Features

- Search by book, chapter, and verse range in Korean or English.
- Insert Korean and English text side by side.
- Template variables `{bookKo}`, `{bookEn}`, `{chapter}`, `{range}`, `{versesKo}`, `{versesEn}`, as a blockquote or a callout.
- Korean versions GAE, KRV and NIR, English versions ESV and KJV, with optional verse numbers.

## Usage

1. Place the cursor in a note where the verse should go.
2. Run **Search verse** from the command palette.
3. Type a reference such as `John 3:16` or `요한복음 3:16-18`.
4. Select the verse to insert it using your template.

Settings: Korean and English version, format template, callout type, show verse numbers, append source line, and cache on or off.

## Installation

This plugin is not in the Community plugins directory because of copyright concerns with Bible text.

**Manual**: download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/Xia-Ataraxia/obsidian-bible-search/releases/latest) into `<vault>/<configDir>/plugins/korean-bible-search/`, then enable the plugin. `<configDir>` is your vault's configuration folder (`.obsidian` by default).

## Network and sources

Verse text is fetched on demand from two public sites:

| Versions | Host |
|---|---|
| 개역개정 (GAE), 개역한글 (KRV), 새번역 (NIR) | `www.bskorea.or.kr` (Korean Bible Society) |
| ESV, KJV | `bolls.life` |

- **What is sent**: the version, book and chapter. Nothing from your notes is ever sent. No analytics or telemetry.
- **When**: only on a user action. Picking a chapter fetches that one chapter; inserting a passage may fetch the same chapter in up to two more versions when your template uses `{versesKo}` or `{versesEn}`. Nothing is prefetched or downloaded in bulk.
- **Caching**: fetched chapters live in memory only, at most 20 chapters for 30 minutes, and are dropped when Obsidian closes or the cache is turned off. Verse text is never written to disk.
- **Rights**: KJV is public domain. ESV is © Crossway; 개역개정, 개역한글 and 새번역 are © 대한성서공회. Inserted passages end with a source line crediting the translation and site; turn it off with **Append source line**.

## Development

See the [dev contract](https://github.com/GoBeromsu/obsidian-boiler-template#dev-contract): `bun run dev`, `bun run build`, `bun run ci`.

## License

[MIT](LICENSE)

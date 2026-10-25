# Bible Search

Search Korean/English Bible verses and insert with configurable template format.

![Searching for John 3:16 in the Bible Search modal and inserting it as a quote with a working [[John 3|John 3:16]] link, the Korean text and the English (ESV) text.](https://raw.githubusercontent.com/Xia-Ataraxia/obsidian-bible-search/main/docs/assets/demo.webp)

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

Settings: Korean and English version, format template, callout type, show verse numbers, cache on or off, and cache TTL (default 30 minutes).

## Installation

This plugin is not in the Community plugins directory because of copyright concerns with Bible text.

**Manual**: download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/Xia-Ataraxia/obsidian-bible-search/releases/latest) into `<vault>/<configDir>/plugins/obsidian-bible-search/`, then enable the plugin. `<configDir>` is your vault's configuration folder (`.obsidian` by default).

## Disclosures

- **Network use**: verse text is fetched when you search. Requests go to `bolls.life` for ESV and KJV, and to `www.bskorea.or.kr` (the Korean Bible Society) for GAE, KRV and NIR. The book, chapter and version you search for is sent. Fetched chapters are cached in memory only.
- **Telemetry**: none.

## Development

See the [dev contract](https://github.com/GoBeromsu/obsidian-boiler-template#dev-contract): `bun run dev`, `bun run build`, `bun run ci`.

## License

[MIT](LICENSE)

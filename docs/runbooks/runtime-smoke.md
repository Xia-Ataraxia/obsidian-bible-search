# Runtime Smoke

> This runbook turns the repo's smoke expectations into concrete local operator steps.

## Scope

Use this when you need a lightweight runtime proof after local changes or before release.

This is a repo-local runbook:

- it may reference repo-specific commands
- it may evolve with the plugin
- it should not be promoted to a family-wide default script verbatim

## Preconditions

- Obsidian test vault is available
- plugin is built (`bun run build`) or CI already proved build/lint/test
- plugin files are present in the test vault plugin directory

## Minimum Smoke Flow

### 1. Reload the plugin

Expected proof:

- plugin reload succeeds
- no immediate startup error notice appears

Workspace catalog reference:

- `obsidian vault="Test" plugin:reload id="obsidian-bible-search"`

### 2. Trigger the command

Run the search command:

- `Bible Search: Search verse`

Expected proof:

- the modal opens
- no crash or console-visible fatal error occurs

Workspace catalog reference:

- `obsidian vault="Test" command id="obsidian-bible-search:search-bible-verse"`

### 3. Prove modal interaction

Use a known reference such as:

- `John 3:16`
- `요한복음 3:16-18`

Expected proof:

- book matching works
- chapter/verse suggestions appear
- range selection still behaves correctly

### 4. Prove insertion

Select a suggestion and confirm:

- verses are inserted into the active editor
- the configured template still applies
- no empty-result or malformed output is produced

### 5. Prove source viability

At minimum, confirm one successful path that exercises:

- English source (`ESV`/`KJV`)
- Korean source (`GAE`/`KRV`/`NIR`)

This does not require identical commands for both, but the evidence must show both source families still work.

## Evidence to Capture

Capture at least one of:

- screenshot of opened modal
- screenshot or note snippet showing inserted verses
- short operator note naming the tested reference and source
- release note verification bullet pointing to smoke success

## Failure Buckets

Classify failures as one of:

1. command/reload failure
2. modal/render failure
3. source fetch failure
4. parse/selection failure
5. insertion/template failure

When possible, capture:

- tested reference
- chosen source/version
- exact user-visible notice or error

## Relationship to Family Contract

What is shared:

- smoke category
- evidence expectation
- runbook structure

What stays local:

- exact operator steps
- chosen references
- source-specific debugging tactics

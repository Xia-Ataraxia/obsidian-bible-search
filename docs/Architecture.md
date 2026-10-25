# Architecture

> `obsidian-bible-search` is the pilot repo for the workspace's minimal shared-surface model.

## Goal

This document gives contributors a first-read map of the plugin without forcing shared implementation across the family.

It focuses on:

- layer boundaries
- integration seams
- unsafe edges
- verification entry points

## System Shape

`obsidian-bible-search` is a modal-driven Obsidian plugin that:

1. parses a user reference query
2. fetches chapter data from a source adapter
3. formats selected verses using settings
4. inserts the result into the active editor

## Layers

### `src/main.ts`

Composition root only.

Responsibilities:

- load and migrate settings
- create notices and cache
- register command
- register settings tab

This is the only place where all major layers are wired together.

### `src/domain/`

Pure plugin business rules.

Responsibilities:

- settings schema and defaults
- book metadata
- verse cache behavior

Rules:

- no `obsidian` imports
- keep logic testable in isolation

### `src/ui/`

Obsidian-facing integration layer.

Responsibilities:

- modal behavior
- settings UI
- source adapter orchestration
- user-facing notices and insertion flow

This is where runtime I/O and Obsidian APIs belong.

### `src/utils/`

Pure transformation helpers.

Responsibilities:

- parsing
- formatting
- template resolution
- resilient fetch policy

These helpers should stay free of Obsidian-specific assumptions.

### Localized former shared helpers

This pilot repo no longer depends on a `src/shared/` implementation directory.

Helpers that were previously inherited as shared implementation have been localized into repo-owned modules where needed.

Pilot rule:

- keep contract and harness sharing
- keep implementation ownership local
- do not reintroduce a shared implementation directory by default

## Dependency Direction

Preferred direction:

```text
utils + types -> domain -> ui -> main
domain -> ui
ui -> main
```

The key invariant is still:

> lower layers must not depend on Obsidian runtime APIs.

## Primary Runtime Seams

### 1. Settings seam

`main.ts` loads raw persisted data and applies migrations before assigning `BibleSearchSettings`.

Important because:

- persisted data is untrusted
- migration is the right boundary for future contract tightening

### 2. Source adapter seam

`src/ui/sources/source-registry.ts` is the adapter registry for Bible versions.

Important because:

- version-to-source routing is explicit
- new source addition should happen at this registry boundary, not inline in UI code

### 3. Network reliability seam

`src/utils/resilient-fetch.ts` defines timeout, retry, validation, and HTTP classification behavior without importing Obsidian directly.

Important because:

- this is a clean “parse-at-the-edge / retry-at-the-edge” boundary
- it is a good local pattern to preserve, not a family-wide shared implementation mandate

### 4. Formatting seam

Formatting is driven by settings and template resolution rather than hardcoded output strings.

Important because:

- user-visible output remains configurable
- new formatting behavior should stay isolated from transport code

## Unsafe Edges

These are expected repo-local unsafe edges:

- remote source variability from Bolls and BSKorea
- HTML scraping assumptions in the BSKorea adapter
- Obsidian modal/editor integration
- version-specific formatting expectations

Review rule:

When changing an unsafe edge, document:

1. what assumption is being made
2. what evidence says it still holds
3. what fallback or notice path exists

## Verification Entry Points

Use these when reasoning about confidence:

- static: `bun run build`
- lint: `bun run lint`
- tests: `bun run test`
- full repo gate: `bun run ci`

Important test clusters:

- parsing and selection
- source adapters
- resilient fetch
- template resolution
- verse cache behavior

## Pilot Interpretation

For the workspace pilot, this repo should donate:

- architecture-document shape
- clean layer boundaries
- parse/retry boundary ideas
- evidence-friendly verification entry points

It should not donate:

- product implementation code
- source adapter implementations
- runtime command details as family defaults

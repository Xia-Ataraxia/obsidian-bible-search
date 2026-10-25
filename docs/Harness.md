# Harness

> This repo follows the family harness contract while keeping its runtime details local.

## Purpose

The harness proves that `obsidian-bible-search` works without requiring the family to share its implementation code.

This document defines:

- required evidence
- verification entry points
- local runtime notes

See also:

- `../../docs/harness-contract.md`

## Required Evidence Categories

### 1. Static correctness

Run:

- `bun run build` (`tsc -noEmit -skipLibCheck` + production bundle)
- `bun run lint`
- `bun run test`

Combined gate:

- `bun run ci`

Typecheck note:

- this repo currently proves type safety through `bun run build`, because the `build` script includes the `tsc -noEmit -skipLibCheck` step before bundling

## 2. Runtime smoke proof

This plugin currently uses repo-local runtime proof rather than a shared family script.

Minimum smoke expectations:

1. open the modal
2. search a known reference
3. select a suggestion
4. verify insertion into an editor
5. verify at least one Korean and one English source path still works

The exact operator commands remain local to this repo.

## 3. Release proof

Before release:

- version and manifest parity must hold
- release notes must satisfy the workspace release-note contract
- CI must be green
- compatibility/risk notes must be written

See also:

- `../../docs/release-note-contract.md`

## 4. Operational runbook

If a fetch/source issue occurs, capture:

- failing source
- example reference
- timeout vs parse vs content failure
- whether retry changed the result
- what user-facing notice was shown

## Local Runtime Notes

These remain repo-local by default:

- concrete Bible source behavior
- HTTP headers or scraper assumptions
- exact network smoke commands
- source-specific fallback handling

## Family-Sharable Harness Surface

This repo can share:

- the evidence categories above
- runbook section layout
- smoke checklist structure
- release evidence expectations

This repo should not share by default:

- concrete source adapter commands
- scraper implementation details
- product-specific modal/runtime flows as global defaults

## Pilot Checklist

- [ ] `bun run ci` passes
- [ ] architecture doc stays accurate
- [ ] runtime smoke expectations are documented
- [ ] release-note contract is referenced
- [ ] repo-local assumptions are made explicit rather than centralized blindly

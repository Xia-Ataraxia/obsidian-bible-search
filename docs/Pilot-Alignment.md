# Pilot Alignment

> `obsidian-bible-search` is the first pilot repo for the workspace's minimal shared-contract model.

## Scope

This pilot prepares the repo to align with the workspace contract without sharing product implementation.

It does **not**:

- change plugin behavior
- centralize repo-specific runtime code
- use `obsidian-open-connections` as a migration target

## Reference Rule

`obsidian-open-connections` may inform:

- architecture doc structure
- harness/runbook discipline
- evidence expectations

It may not drive:

- direct code copying
- deployment-shape normalization
- implementation changes in this repo

## Keep Shared

These are valid family-level surfaces for this repo:

- architecture/doc schema
- lint/type/boundary rules
- release-note contract
- issue/PR governance contract
- harness evidence categories

## Keep Local

These remain repo-local:

- source adapter implementations
- scraper/API assumptions
- modal behavior details
- runtime smoke commands
- deploy mode and release asset quirks

## Pilot Goals

1. Make the repo's architecture readable in one document.
2. Make the repo's verification shape explicit.
3. Keep implementation and deployment logic local.
4. Provide a concrete example of the new family contract in practice.

## Success Criteria

The pilot is successful when:

- a newcomer can understand the repo boundaries without reading all source files
- the required evidence categories are explicit
- no shared-product-code expansion is introduced
- the repo can be discussed as a contract/harness example rather than a code donor

## Next Candidate Follow-ups

If the pilot proves useful, later work may include:

- stronger repo-local architecture boundary checks
- making typecheck expectations more explicit in review/checklists
- a repo-local runtime smoke script or operator guide

Those are follow-ups, not part of this prep pass.

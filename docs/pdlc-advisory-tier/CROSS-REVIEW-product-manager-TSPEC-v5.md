# Cross-Review: product-manager — TSPEC (delta confirmation, erratum round)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** Local — delta confirmation of the Phase D erratum edit only (commits `5105ff5`, `9d9ae61`, `5042d5c`, `f38ad2e`, `b198f1a`, diffed against `e067f5e`, the commit approved in v4). Sections untouched by that diff are not re-reviewed.

## Delta under review

The edit is confined to seven regions plus a new §18 changelog: the metadata version cell (`1.0` → `1.1`), §2.2's rejected-alternative paragraph, §2.3's prelude block and a new "two module-private symbols" paragraph, §3.2's C-2 header paragraph, §4.4's durability paragraph, §6.4.1's heading, its step-order paragraph and a new Reachability paragraph, §11.2's fixture-provenance paragraph plus a new scenario table, §11.3's one table cell, and §16.1/§16.3/§16.4. No requirement mapping, no seam contract, no budget, no acceptance criterion, and no interface signature changed. §14.1/§14.2's REQ↔FSPEC↔TSPEC traceability tables are byte-identical.

I re-grounded every factual claim the edit newly asserts rather than taking the changelog's word for it:

| Claim the edit now makes | Ground truth |
|---|---|
| Manifest rows are emitted per artifact from a three-entry `bundles` array | `pdlc/workflows/build-runtime.mjs:277-296` — `const bundles = [ … ]` with exactly three entries (`orchestrate-queue.bundle.js`, `orchestrate-dev.bundle.js`, `pdlc-cli.mjs`). Confirmed. |
| `commitPaths` is module-private at `orchestrate-dev.js:6905` | `async function commitPaths({ paths, message, what, _git, _sleep, emit })` at `:6905`, no `export`. Confirmed. |
| `gitWithLockRetry` is module-private at `:6862` and reachable from `commitPaths` via shared module scope | `async function gitWithLockRetry(argv, { _git, _sleep, emit, label })` at `:6862`, no `export`; `commitPaths` calls it on its first statement. Confirmed. |
| FSPEC C-2 already scopes its notice to the enabled case | `FSPEC-pdlc-advisory-tier.md:145` — "reported on the run report **only when the resolved configuration leaves the tier enabled** … a malformed `advisory.enabled` produces a disabled run, which carries **no** advisory content on its report at all (§12 D-5, §10.3 S-4)". Confirmed. |
| FSPEC already reconciles A2-6 with R-2 | `FSPEC:232-237` — "at **both**, steps 5 and 7 complete **before** that durable git operation"; `FSPEC:635` (A5-8) and `FSPEC:690` (R-2, "a precondition of an action **surviving**"). All three citations resolve to the text cited. Confirmed. |

## Item-by-item disposition

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

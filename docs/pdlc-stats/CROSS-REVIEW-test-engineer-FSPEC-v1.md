# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.2), approved *Approved with minor changes* at
`CROSS-REVIEW-test-engineer-REQ-v3.md` (0 High, 1 Medium, 3 Low)

## Claims verified against the repository

Every repository claim the FSPEC makes was checked against HEAD rather than taken from the document.

| FSPEC claim | Verdict | Evidence |
|---|---|---|
| `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker` all live in `pdlc/workflows/orchestrate-dev.js` (§1 fidelity anchor) | **Holds** | `:10134`, `:10192`, `:12384`, `:7601` |
| BR-10: the driver's DoD derivation returns highest-plus-one, so reporting it unchanged is off by one | **Holds** | `deriveDodRoundIndex` ends `return max + 1` with `max = 0` when nothing matches (`:12384-12396`) |
| BR-05: the un-suffixed basename denotes round 1, identically to `-v1` | **Holds** | `round: n === undefined ? 1 : Number(n)` (`:10145-10151`); runtime: `parseReviewFilename("CROSS-REVIEW-test-engineer-REQ-v3.md")` → `{ok:true,…,round:3}` |
| BR-07/EC-06: two round-1 spellings for one role and doc type refuse a round | **Holds** | `deriveRoundWindow` step 5 returns `{ok:false, reason:"malformed_round_one_duplicate", role}` (`:10225-10230`) |
| BR-12/EC-14: absent, duplicated or unparseable `RESOLVED:` classifies fail-closed | **Holds** | `parseResolvedMarker` returns `{ok:false, reason:"absent"|"duplicated"|"unparseable"}` (`:7608-7617`) |
| BR-01: `FLAGS_BY_COMMAND` / `validateFlags` are the existing closed-flag surface | **Holds** | `pdlc/engine/bin/cli.mjs:168`, `:198-199` |
| BR-29: exit `2` is reserved for a pipeline halt | **Holds** | `pdlc/engine/bin/cli.mjs:20-24` — `2  the pipeline HALTED`, `1  the engine itself refused or crashed` |
| BR-03: `docs/completed/pdlc-loop-economics/_evidence/` exists | **Holds** | directory present |
| BR-25/AT-18: `docs/PLAN-pdlc-integration-boundary-gates.md` and `docs/completed/REQ-completed.md` are loose files; the eight excluded directories are all present | **Holds** | `find docs -maxdepth 1 -type f` returns exactly the first; `docs/` carries `_constraints`, `_decisions`, `_queue`, `completed`, `design`, `discarded`, `ideas`, `requirements` — the exclusion set is set-equal at HEAD |
| AT-10: `docs/completed/pdlc-headless-engine/` has `LEARNINGS`, one surviving cross-review, none for the other five types | **Holds** | only `CROSS-REVIEW-software-engineer-TSPEC-v13.md` plus `LEARNINGS-pdlc-headless-engine.md` |
| AT-11: `docs/completed/pdlc-loop-economics/` carries `CODE_REVIEW-…-v1.md` and `-v2.md` | **Holds** | both present; expectation `2` is correct |
| AT-13: `docs/completed/pdlc-wave-resume/POSTMORTEM-PR-pdlc-wave-resume.md` exists | **Holds** | present; its marker is `RESOLVED: yes` at line 3, so the driver yields `resolved` (see F-03) |
| EC-17: `docs/pdlc-halt-hardening/` carries only a PLAN | **Holds** | single file `PLAN-pdlc-halt-hardening.md` |
| BR-09: the six-type row set is "the pipeline's cross-review doc-type catalogue" | **Partly** — the constant matches, but it is not the set of doc types the pipeline actually writes | `REVIEW_DOC_TYPES` is exactly those six (`:10105-10112`), while `reviewFileType = roundDocType \|\| "REVIEW"` (`:9245`) writes a seventh (F-01) |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

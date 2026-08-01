# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.1, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 1
**Scope:** every finding below carries its own Scope tag in the findings table.

## Verification pass (single pass, all existing-code claims)

Every claim this document makes about existing code, existing documents or sibling REQs was
checked once, here, against the working tree. Line numbers have drifted from the `9486c81`
baseline; per the document's own header row that is a mechanical fix and is not filed as a
finding. Navigation was by symbol and literal.

| Claim | Verified | Where at HEAD |
|---|---|---|
| Citation baseline `9486c81` is a real commit on `main` | ✅ | `git cat-file -t 9486c81` → commit |
| BL-01 — `docs/completed/pdlc-review-loop-hardening/` carries REQ, FSPEC, TSPEC, PLAN, PROPERTIES, LEARNINGS (and the cited POSTMORTEM) | ✅ | all seven files present |
| BL-06 / M-7a — `parseResolvedMarker` → `checkPostmortem` → step-G refusal → `haltError` | ✅ | `parseResolvedMarker` (`orchestrate-dev.js:1105`), `checkPostmortem` (`:2695`), step-G literal `Refused — unresolved POSTMORTEM at` (`:4246`), `throw haltError` (`:4247`) |
| M-7b — the halt catch rewrites the queue row, and the entry-validation halts do **not** | ✅ | `recordHaltFn({ feature: featureName, status: "halted" })` (`:4907`); the REQ-path / `forcePhases` / REQ-existence halts each `return buildFinalReport({… outcome: "halted" …})` directly (`:4292`–`:4360`) |
| M-1a — one module-scope constant | ✅ | `const MAX_REVIEW_ROUNDS = 5;` (`:52`) |
| M-1b — `windowEnd` is the sole width site, two callers | ✅ | `return startIndex + MAX_REVIEW_ROUNDS - 1;` (`:2451`); callers `reviewLoop` default (`:1830`) and `deriveRoundWindow` (`:2433`) |
| M-1c — three arithmetic-free value-reading sites | ✅ | `recordPhase` argument (`:1779`), post-mortem prompt literal (`:1938`), `iterations: MAX_REVIEW_ROUNDS` (`:1984`) |
| M-1d — per-invocation budget | ✅ | `deriveRoundWindow` (`:2386`); its JSDoc still says *"Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET rather than an absolute cap"* (`:2364`) |
| M-1e — the halt path recomputes `last` from the same helper | ✅ | `const last = endIndex === undefined ? windowEnd(first) : endIndex;` (`:1772`) |
| M-7e — the halt dispatch is a bare `Write ${postmortemPath}.` plus a section list, no preservation obligation | ✅ | `:1935`–`:1938` |
| One `docType` per phase, so a per-phase POSTMORTEM is a per-document one | ✅ | `PHASE_DISPATCH` (`:108`) — R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES |
| Sibling AC citations resolve: `pdlc-rcv-fixed-point-stop` AC-2.1, AC-2.2, AC-2.8; `pdlc-rcv-panel-topology` AC-3.2, AC-4.1 | ✅ | all present in the cited files |
| Catalogue ids S-3, S-4, S-11, S-12, S-13, S-14, S-15, S-16 owned/read as §4 states | ✅ | `docs/_constraints/pdlc-rcv-catalogue.md` §2 |
| §1's "66 KB — 40% of the finished document" | ✅ | baseline §1.1: 165.3 − 99.0 = 66.3 KB; 66.3/165.3 = 40% |
| §1's "blocking count reached its minimum at round 2 and rose thereafter" | ⚠️ partly | baseline §1.1 table is 11, 6, **6**, 7, 9 — round 3 held the minimum. See F-08 |
| **The claim that a step-4 refusal "reaches step G's path"** | ✅ mechanically available | step G's `throw haltError` is inside the `try` that wraps `pipelineFn`, so it reaches the catch at `:4111` and therefore `recordHaltFn`. But see F-02/F-03 for what is *not* determined |

## Findings

## Questions

## Positive Observations

## Recommendation

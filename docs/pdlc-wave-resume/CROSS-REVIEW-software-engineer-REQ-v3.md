# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** Technical lens, delta re-review of v1.4 against my v2 findings (G-01..G-04).

## Prior Findings Disposition

**Delta base:** v2 reviewed `005dc47d`; this revision is `115019b6..f256d767` (6 commits touching
the REQ), document version 1.3 → 1.4. Every check below was re-run against `main`
(`pdlc/workflows/orchestrate-dev.js`, the tree this branch does not yet carry — BL-04).

| v2 | Sev | Disposition | Evidence |
|----|-----|-------------|----------|
| G-01 — branch-base step has no gate | Medium | **Resolved** | §5 gains row **BL-04** with an explicit *Gating logic* cell ("Checked at FSPEC authoring: the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` must both be readable in the authoring tree"), and the base note now ends "it is BL-04 (§5)" instead of trailing off into prose no phase reads. This is exactly the shape I asked for: a prerequisite row, not a dated remark. |
| G-02 — stale inline line anchors | Medium | **Resolved** | `grep -n ':[0-9]\{3,\}' REQ-pdlc-wave-resume.md` now returns **zero** hits; §1, §7 and §9 cite by symbol (`WAVE_STATE_PATH`, `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`, `writeWaveLedger`, `explicitPointer`, `headCorroborated`, `allWavesRecorded`) and by banner string. Every symbol resolves on `main`: `WAVE_STATE_PATH` `:12214`, `computePlanHash` `:12230`, `parseWaveLedger` `:12267`, `formatWaveLedger` `:12325`, `explicitPointer` `:15236`, `headCorroborated` `:15280`, `allWavesRecorded` `:15262`, `writeWaveLedger` `:15350`. The test citation also resolves: `waveExecution.test.js:2239` `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")`. The base note's verification claim is correctly softened to "**substance** verified … while any positional anchor … is not re-verified". One residue only, F-02 below. |
| G-03 — OB-2 recipe written against a superseded baseline | Medium | **Resolved, and improved past what I asked** | The baseline is cited at `Version | 1.2 · 2026-08-20` (matches `main:docs/_constraints/pdlc-wave-gate-baseline.md:7`), sections through `## 4.` are acknowledged as occupied (they are) and ids through `M-WG-14` (correct — `M-WG-14` is the last row). Rather than hard-coding "§5 / bump to 1.3", the recipe now says *re-read at the version current when promotion runs, append the next unoccupied section, bump to the next version above the one found* — which is robust to the baseline moving again before promotion. M-WG-6 is downgraded from "is now false" to "needs a re-check, not an assumed correction", which is the honest reading. |
| G-04 — WVR-05's rejected position read as operative | Low | **Resolved** | The block is now headed "**Superseded — decision history, 2026-08-13 (SE G-04)**", written in the past tense throughout ("The position considered and *rejected*"), and closes "Nothing in this block is operative; WVR-05 above is the requirement." A skimmer can no longer take the rejected requirement for the live one. |

My v2 questions are answered by the revision as well: Q-01 by OB-1's new sentence that `explicitPointer`
is computed *before* the out-of-range clamp (verified: `:15236` precedes `:15237-15243`, so a
past-the-end pointer does still suppress the ledger); Q-02 by REQ-WVR-08's new surface split (the
hatch is owed on the run-log message only, not on the report row).

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

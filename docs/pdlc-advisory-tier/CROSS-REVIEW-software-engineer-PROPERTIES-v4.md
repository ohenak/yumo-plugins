# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 4
**Scope:** Local (unless a finding row says otherwise)
**Delta base:** `fd4bced` (the commit my v3 review was written against, per the v3 `REVIEWED-COMMIT`
anchor) → `08925cf` (`docs(properties): R-3 — close the scanFixtures.js open erratum`; v1.2 → v1.3).
`git diff fd4bced HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md` is one commit
touching three places: the header block, §12.3's `scanFixtures.js` owner cell, and §13.1 item 5.

The delta window also moved two **upstream** documents this one cites by line — TSPEC to v1.3 (five
erratum commits, `77f81ca` … `2e8227e`) and PLAN to v1.9. Citation re-grounding against those two is
in scope for this round, because the bytes the citations point at changed after my v3 pass.

## Disposition of v3 findings

Two of the three are closed. One is still open verbatim, and the upstream erratum round has since
made it worse rather than stale — it is re-filed at a higher severity as v4 F-01, not carried at Low.

| v3 | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | Low | **Open, and superseded by v4 F-01** | §6.5 is byte-identical: line 534 still reads "Two conjuncts, both required", and conjunct 2 (line 546) still reads "Replacing the gate with `async () => ({ passed: true })` must make the case fail" with no A1/A3 carve-out. In v3 this was Low because the closing paragraph ("neither has a post-action gate to stub") let a careful implementer infer the right thing. That inference is no longer sufficient: TSPEC v1.3 turned A1's and A3's `verifyGate` into a normative **`null`** and named the passing stub as a shape that "must not appear as a shipped implementation" (`TSPEC:655`, `:657`), and PLAN v1.7's §8.2 T-03-6 row now requires the **opposite** mutation direction at those two seams — install the stub, and the case must fail. See F-01. |
| F-02 | Low | **Half resolved** | (b) **Resolved, by the upstream fix.** §12.3's preamble ("all three non-collected rows … created by the 🔴 task named in PLAN §4's manifest", `PROPERTIES:1026-1028`) is now a true sentence: `helpers/advisoryDoubles.js` → A-02, `fixtures/created-files-26c3f1c.json` → A-15, and `fixtures/scanFixtures.js` → A-01 since PLAN v1.6 (`PLAN:308`). No qualifier is needed any more. (a) **Open.** §2.1 line 167 still cites "PLAN §2.2, `A-00`" for the jest exclusion; A-00 remains deleted (PLAN v1.2 changelog, `PLAN:1020`) and PLAN §2.2 is still `BL-PREREQ — the baseline symbols A-01 asserts` (`PLAN:85`). Re-filed as F-04. |
| F-03 | Low | **Resolved** | §13.1 item 5 was rewritten to a closure record and the misattribution is gone — the sentence "the manifest row must exist before Phase I, since `validatePlanContract` is what enforces it" no longer appears anywhere in the document. What replaced it is checkable and I checked it by executing the parsers over the amended PLAN rather than trusting the number: `parsePlanTasks` → 36 tasks, `parsePlanOwnership` → 36 rows, `validatePlanContract` → `{"ok":true}`, and A-01's row is `{"taskId":"A-01","files":["pdlc/workflows/__tests__/advisoryPreflight.test.js","pdlc/workflows/__tests__/fixtures/scanFixtures.js"]}`. The PLAN side states the real enforcer correctly too — `PLAN:252` gives both mechanisms, the wave commit staging only `task.files` (`orchestrate-dev.js:8143-8159`) for the *file* and `validatePlanContract` for the *row*, which is the accurate split. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

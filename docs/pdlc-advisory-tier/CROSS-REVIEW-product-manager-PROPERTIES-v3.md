# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 3
**Scope:** product lens — delta re-review of the v1.1→v1.2 revision; REQ traceability, scope compliance, acceptance-criteria fidelity
**Base reviewed at v2:** `91439f6` · **Head reviewed here:** `fd4bced`

## Prior findings — disposition

My v2 pass carried exactly one finding, a Low. It is **resolved**.

| v2 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | Low | **Resolved** | PROP-A4-09's trailing parenthetical now reads "no `T-06-7` is invented for it (**§13.2**)" (`PROPERTIES:661`), matching §12.4's own citation of §13.2 for the same fact. The two no longer disagree in print. The revision went one step further than the correction I asked for: §12.4 now pins the declaration's location and multiplicity — "**The declaration lives in PROP-A4-09 and nowhere else**; the id also occurs in this paragraph … a scan finding two occurrences has found the declaration plus this sentence, and a scan finding a third has found a real invented case" (`PROPERTIES:1062`). I ran that: `grep -c "T-06-7"` over the document returns **2**, at `:661` and `:1062` — exactly the two the paragraph declares. The one sanctioned exception to the §12.4 set-equality audit is now mechanically checkable rather than prose-asserted, which is what the audit needed to survive a future edit. |

## Findings

Scope of this pass: the changed sections only (`git diff 91439f6..fd4bced` on the document — 155
insertions, 28 deletions across the header changelog, §2.1, §4.2, §5.2, §6.5, §8.3, §10.1, §10.3,
§12.1, §12.3, §12.4 and §13.1). Unchanged sections approved at v1/v1.1 were not re-litigated. No
property was added, removed or re-levelled in this round — I confirmed the table-row count is still
**183** (`grep -c '^| PROP-'`), so §1's and §12.3's 195 / 148 / 40 / 7 / 0 stand without recomputation.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **A new citation points at a PLAN task that no longer exists.** §2.1's `scanFixtures.js` rationale reads "`__tests__/fixtures/` is already excluded from jest's collection (PLAN §2.2, `A-00`)" (`PROPERTIES:163`). `A-00` was **deleted** in PLAN v1.2 and its work restated as the §2.4 operator pre-flight step — PLAN's own changelog says so in as many words ("**A-00 deleted** and its work restated as the §2.4 **operator pre-flight step**", `PLAN:1017`), and PLAN §5.2 records the consequence ("A-00's removal empties nothing: layer 1 is now the single task A-01", `PLAN:451`). `grep -n "^| A-00 "` over the PLAN returns nothing. The **substance** of the claim survives — jest's configured `testPathIgnorePatterns` does list `/__tests__/fixtures/` (`PLAN:140`), and keeping the wave gate's command from replacing it is exactly what the §2.4 pre-flight step protects — so this is a pointer defect, not a coverage defect, and it costs a reader one wasted lookup into a task table that has no such row. It is worth fixing now rather than later because this is the *only* thing standing between the new fixture module and being collected as an empty suite, so a reader chasing the guarantee should land on the paragraph that owns it. **Fix:** change the parenthetical to `(PLAN §2.2, enforced by the §2.4 operator pre-flight step)`. | PLAN §2.4 / §2.2 self-consistency |

## Questions

## Positive Observations

## Recommendation

## Verdict

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

## Questions

## Positive Observations

## Recommendation

## Verdict

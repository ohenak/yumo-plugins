# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.4)
**Date:** 2026-08-28
**Iteration:** 5
**Scope:** delta re-review of `1d951e5ee..20a551c7f` on the REQ; the findings in `CROSS-REVIEW-software-engineer-REQ-v4.md` re-checked against HEAD. Unchanged sections already approved are not re-litigated.

## Prior-Round Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The in-scope set is now derived from a stated rule and reproduces C-5's 41 exactly. Three clauses did it: the carrier is a **heading** only (`REQ:64-66`), the file scope is `DECISIONS-*.md` (`:62-63`) which drops `.consolidation-log.md` and the three `CONSOLIDATION-PROPOSAL-*.md`, and **distinct id / first record wins** (`:66-69`) which collapses the twice-opened headings. Replayed at HEAD: heading-carried distinct ids under `docs/_decisions/` = **41** across the 12 `DECISIONS-*.md` files (0/1/4/2/2/7/2/12/1/1/6/3 by path order); `DECISIONS-pdlc-engineering-loop.md` yields 13 heading matches but 7 distinct, `DEC-LOOP-01`…`06` each opening a heading twice (`:237,249,259,282,322,337` and `:363,397,420,465,508,582`) exactly as G-1 cites. AC-01's set-equality expectation is now writable from the document alone. |
| F-02 | Medium | **Resolved** | The unnamespaced-feature case is now stated rather than derived: `DECISIONS-pdlc-plugin-retirement.md` is named a zero-line contributor "by design here, normalisation being O-3's to own" (`:71-73`). HEAD confirms zero heading matches under the `DEC-{NAMESPACE}-{NUMBER}` grammar in that file. |
| F-03 | Low | **Resolved** | The exemplar now matches the predicate literally. G-1 says the id opens the heading's content "after any heading marker or section number" and cites `## 3. DEC-CONS-01: …` (`:65-66`) — HEAD line `docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:65`. The clause and the cited line agree token for token. |
| Q-01 | — | **Answered in text** | Determinism is stated: "files in path order" (`:67`). |
| Q-02 | — | **Answered and re-measured** | Under the corrected predicate the largest feature record is 14 (`DECISIONS-pdlc-headless-engine.md`); `DECISIONS-pdlc-loop-economics.md` drops to 10 because its extra ids are citations, not headings. C-5's "41 + 14 = 55" is therefore correct as written at HEAD, and the 60 default keeps 5 lines of headroom. |

# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 3

**Delta scope.** Reviewed `git diff 29fe79a4..HEAD` on the REQ only (three commits: ff4d0e12,
1f330da2, 04ba6aac). v2's findings F-01…F-06 checked for resolution; unchanged sections not
re-litigated.

## Prior-round disposition

| v2 finding | Severity | Status |
|---|---|---|
| F-01 `delta`/`local` reuse framing contradicts DEC-CONS-05 | High | **Resolved as to the cited authority.** §1.2 claim 2, C-3 and O-7 now say *one predicate, two enumerations*, name the pass side as the reuse target, and drop the shared-agreement test — all three match `docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:422`, `:452-458`, `:462-476`. A different, packaging-level defect rides in on the same edit: F-01 below. |
| F-02 "the pipeline tags authoring" names a tag that does not exist | Medium | **Resolved — and my v2 finding was wrong.** `dispatchKind: "authoring"` is a real field at HEAD: creator (`pdlc/workflows/orchestrate-dev.js:13515`), optimizer (`:7660-7664`, positional `"authoring"`), erratum author (`:12821`) and the erratum land-proof retry (`:12915`). C-1's revised sentence is checkable exactly as written; the apology is mine. |
| F-03 AC-5.1a self-compares on one branch | Medium | **Addressed in direction, incomplete.** The comparand is now single ("AC-6.2's recorded baseline") but nothing states what the baseline is recorded *from* — F-02 below. |
| F-04 "records that it did" vs "no injection summary at all" | Medium | **Resolved.** AC-4.4 is now an enabled-with-empty-selection run (AC-3.1's empty rows), explicitly not AC-5.1a's absent key. |
| F-05 `RSN-UNLISTABLE` mixes corpus-level with per-document domain | Medium | **Resolved.** AC-3.2 splits the catalogue into per-document reasons and corpus-level outcomes (`RSN-UNLISTABLE`, `RSN-EMPTY`), two set-equality tests, and AC-4.1/AC-4.2 were re-pointed at the right half. Matches the shipped seam's own shape (`pdlc/workflows/consolidate-learnings.js:1348-1354`). |
| F-06 BL-01 vs AC-1.1 corpus floor | Low | **Resolved.** BL-01 now reads "at least one prior feature". |

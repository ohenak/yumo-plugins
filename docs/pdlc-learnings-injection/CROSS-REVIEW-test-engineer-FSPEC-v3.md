# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-19
**Iteration:** 3
**Scope:** delta re-review of `5966c937..HEAD`; testing lens only — testability, oracle
falsifiability, edge-case completeness. Unchanged sections approved in v2 are not re-litigated.

## Prior findings disposition (v2)

| ID | Severity | Status | Evidence in this revision |
|---|---|---|---|
| F-01 | High | **Resolved** | Option (a) taken cleanly: `E-05` deleted, AT-28's truncation conjunct deleted, BR-3 now states truncation is **not a separate outcome** and resolves under the same shape judgement — eligible via E-19 (→ AT-11) or `RSN-UNPARSEABLE` via E-04 (→ AT-27), FSPEC:294-299. No dangling `RSN-TRUNCATED` or `E-05` reference survives; the trace line records the retirement explicitly (FSPEC:880). Both surviving branches carry a fixture and an AT, so nothing is asserted that no fixture can build. |
| F-02 | Medium | **Resolved** | AT-11's expected byte count is now "committed with the fixture as a literal integer, recomputed by hand when the fixture changes, never derived in the test" (FSPEC:762-765). The implementation-echo path is closed by wording, not by hope. |
| F-03 | Medium | **Resolved** | BR-1's Excluded enumeration reads as one sentence again — "review dispatch, implementation, DoD verification and remediation, harvest, ship, and every advisory seam" (FSPEC:246-247); the orphaned "ship, advisory seam." line is gone, so AT-03's exclusion universe is readable. |
| F-04 | Low | **Resolved** | BR-5 now states the matching rule its figures were measured under — "under strict title matching on BR-6's five names" (FSPEC:356-357) — so a later reader can reproduce or contest them. |
| F-05 | Low | **Resolved** | The branch-coverage line now reads "D-5 by AT-04/16" (FSPEC:882); AT-15 no longer stands in for a branch BR-2 removed. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **This round emits a second kind of notice, and there is still no closed notice catalogue and no completeness test over it — the word "catalogued" now points at nothing.** BR-14 now emits two distinct notices: the malformed-configuration notice (FSPEC:583) and a new notice naming a wrong-typed declared key (FSPEC:584, E-34 at FSPEC:684). BR-9 defines exactly two closed catalogues and both are reason-id catalogues — per-document (`RSN-COUNT` … `RSN-NO-MATERIAL`) and corpus-level (`RSN-UNLISTABLE`, `RSN-EMPTY`) — each with a set-equality completeness AT (AT-19, AT-20 at FSPEC:805-810). No notice appears in either, so BR-9's own rule that "a new reason may not be emitted without being added to a catalogue and its test" (FSPEC:498-499) is broken by the very notice this round adds, and REQ C-9's demand that *every* report line or notice have a registered catalogue entry with an id and a test (REQ:205-207) has no FSPEC-level membership list to test against. AT-32's oracles are containment-only in consequence: "the report carries the catalogued malformed-configuration notice", "a notice naming the key" (FSPEC:857-859) — a third notice added later passes both, and a test author has to read the implementation to learn what a notice even looks like. Fix: add a **third closed catalogue** to BR-9 — one id per notice, both members named — plus an AT in AT-19/AT-20's shape asserting **set equality** over it, and point AT-32's conjuncts at those ids. F-O-3 may keep the serialised form for TSPEC; membership is FSPEC's. | BR-9, BR-14, E-23, E-34, AT-19, AT-20, AT-32 |
| F-02 | Medium | Local | **AT-32's new wrong-typed-key conjunct names no key, no expected value and no observable for "the default was used", so its only writable oracle is an implementation echo.** The AT says "given a wrong-typed declared key, then the run is enabled, its block is selected under that key's default, and the report carries a notice naming the key" (FSPEC:857-859). Which of the three declared keys is exercised is unstated, and "selected under that key's default" is not observable except by recomputing selection from the fixture — the second implementation of the rule under test that F-02 (v2) removed from AT-11. The document already ships the right instrument: BR-10's run-level rule-input record carries all three resolved thresholds, and AT-22 asserts it against an expectation "transcribed by hand and committed in the fixture". Fix: name the key (e.g. `maxDocuments: "five"`), assert BR-10's record shows that key **at its declared §4.1 default value as a literal** while the other two keep their configured values, and assert the resulting selection equals a literal expected selection committed with the fixture. | BR-14, E-34, AT-32, AT-22, BR-10 |

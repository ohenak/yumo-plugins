# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.2)
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** delta re-review of the changes between `872af669` and HEAD; testing lens only —
testability, oracle falsifiability, edge-case completeness.

## Prior findings — disposition

| v1 ID | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-14 now defines malformed as *present and not an object, or a declared key with a wrong-typed value*, matching the shipped sibling readers, and rules explicitly that a misspelt section name reads as absent. AT-32 tests both wrong-shape cases plus the typo-reads-as-absent case. The now-stale REQ AC-5.1b example is routed as an erratum rather than papered over. |
| F-02 | High | **Resolved** | AT-11 gains set equality over BR-6's five injected section names in priority order, with the Approval Record's distinctive text asserted absent *while* all five injected texts are asserted present — negative paired with positive on one path. |
| F-03 | High | **Resolved** | BR-6's *byte-accounting basis* paragraph makes all three quantities the same quantity (identification line, delimiters, source-path label, section headings and bodies; preamble counts toward none), and BR-8's *bytes injected* is bound to it. An expected count is now computable from a fixture. |
| F-04 | High | **Resolved** | AT-02/AT-03 now observe **every agent invocation the run makes**, with set equality taken over that universe rather than over the already-classified subset. |
| F-05 | Medium | **Resolved** | AT-22 now compares the record against an expected selection transcribed by hand and committed in the fixture, and states the test neither calls nor reimplements the production selector. |
| F-06 | Medium | **Resolved** | AT-10 adds reversed git-commit order, reversed ctime order, permuted mtimes and differing wall-clock between two compositions. |
| F-07 | Medium | **Resolved** | BR-5's **No back-fill** paragraph plus AT-13's prefix assertion and eight-document reason-id set equality. |
| F-08 | Medium | **Resolved** | BR-15 now defines both sides — observed set is file-open calls under `docs/`; expected set is the corpus-root enumeration plus one attempt per report-named document except `RSN-SELF`, with `RSN-UNREADABLE` explicitly inside it. |
| F-09 | Medium | **Resolved** | AT-34 is pinned to AT-33's instrument and window, and AT-33 asserts a non-empty observed set as the non-vacuity control. |
| F-10 | Medium | **Resolved** | AT-04 now asserts the per-document `RSN-SELF` row **and** that no corpus-level `RSN-EMPTY` is recorded. |
| F-11 | Medium | **Resolved** | D-5 is now `self / not excluded`; BR-2 re-bases corpus membership on the shipped enumeration instead of an invented exclusion rule. |
| F-12 | Medium | **Resolved** | AT-29 compares two runs differing only in the block and asserts member-for-member equality over the five named machineries, as set equality. |
| F-13 | Low | **Resolved** | AT-05 requires byte-equality against the preamble text transcribed literally from TSPEC's wording, explicitly not keyword search. |
| F-14 | Low | **Resolved** | AT-23 now enumerates the run's author-emitted channels and asserts set equality against the recorded pre-feature baseline set. |

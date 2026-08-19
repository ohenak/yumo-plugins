# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md`
**Date:** 2026-08-18
**Iteration:** 2

**Delta scope.** Reviewed `git diff 36f82b3e..29fe79a4` on the REQ (the only revision commit since
v1). Prior findings F-01…F-10 checked for resolution; unchanged sections not re-litigated.

## Prior-round disposition

| v1 finding | Severity | Status |
|---|---|---|
| F-01 — "exactly six dispatches" not the HEAD dispatch model | High | **Resolved.** C-1 is now a rule over creator / optimizer / erratum dispatches, AC-1.1 drops the fixed count as an oracle, AC-1.2 is set equality over the pipeline's own classification, §4.1 and O-1 state per-round rather than per-phase cost. One residual naming issue, F-02 below. |
| F-02 — corpus enumeration reinvented shipped mechanism | High | **Addressed in direction, defective in execution.** §1.2 claim 2, C-3 and O-7 now bind to the shipped enumeration — but they bind to it as *one shared definition*, which is what the cited decision rejects. See F-01 below. |
| F-03 — C-5's "no model call" false on the runtime-adapter channel | High | **Resolved.** C-5 now concedes model-mediated listing/read seams, scopes AC-2.5's byte-identity to a deterministic transport, and routes a failing listing to C-7 rather than to an empty corpus. |
| F-04 — malformed config silently identical to deliberate disable | High | **Resolved.** AC-5.1 is split into AC-5.1a (disabled/absent) and AC-5.1b (malformed ⇒ catalogued notice), C-9 names the notice, AC-6.2 asserts it fires. |
| F-05 — corpus includes untracked, excludes ignored | Medium | Resolved (C-3 states tracked-or-untracked, ignored excluded). |
| F-06 — §1.2 claim 1 overstated today's readership | Medium | Resolved (claim narrowed to "no *different* feature's LEARNINGS"; Tier-2 reader named). |
| F-07 — AC-5.1's unmeasurable "pre-feature baseline" | Medium | Partly resolved; the replacement is self-comparing on one branch — F-03 below. |
| F-08 — AC-2.2 ordering key unparseable at HEAD, no tiebreak | Medium | Resolved (total tiebreak = byte order over path; verified against the shipped enumeration, see Positive Observations). |
| F-09 — AC-5.2 absence-only | Medium | Resolved (positive membership claim added). |
| F-10 — AC-3.2 reasons as prose, not ids | Medium | Resolved as ids; one domain-mixing defect introduced — F-05 below. |

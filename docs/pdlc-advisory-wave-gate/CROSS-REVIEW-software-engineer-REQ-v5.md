# Cross-Review: software-engineer — REQ (delta confirmation, erratum round 3)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md
**Date:** 2026-08-18
**Iteration:** 5 (delta confirmation of the v1.7 erratum round)
**Scope:** Local

## Method

Re-read the REQ at HEAD in full (not only the erratum diff), then diffed `119bdaf4`
(`REQ v1.7 — erratum round 3`, the only commit in this round's window) against `6565080a`.
Every claim about shipped behaviour that the round's new text rests on was re-checked against
HEAD source rather than against the raised item's summary of it:

- wave-mode derivation and the BL-03 carrier — `pdlc/workflows/orchestrate-dev.js:14039-14045`
- the BL-04 script-gate carrier in the wave arm — `pdlc/workflows/orchestrate-dev.js:14142-14154`
- the ledger skip that reaches Phase I but executes no wave — `pdlc/workflows/orchestrate-dev.js:14267-14283`
- the advisory budget race the NFR-4 window describes — `pdlc/workflows/orchestrate-dev.js:3414-3423`

Per DEC-ERR-03 this confirmation is not limited to the raised item list: anything the REQ
still asserts that HEAD or the REQ's own definitions no longer support is a finding here.

## Raised Items — Landing Assessment

The round carried five distinct items (the dispatch list repeats several of them from
different raisers). Landing verdicts:

| Item | Landed? | Evidence at HEAD |
|---|---|---|
| AC-1.5 notice cardinality unscoped (F-18) | **No — mis-landed** | REQ:265-266 scopes the population to a run "that reaches Phase I **and executes a wave**". F-18 asked for "runs that reach Phase I". The narrower scope excludes the no-manifest legacy run — the only run in which BL-03's carrier fires (`orchestrate-dev.js:14041-14045`) — i.e. exactly the case AC-1.5 exists to constrain. See F-01. |
| AC-1.5's two carriers mutually exclusive (F-19) | Partially | REQ:270-274 now records the exclusivity and binds the requirement to whichever carrier fires, naming BL-03's as the both-absent carrier. The prose is correct against HEAD. It is however unmeasurable under the population the same edit wrote (F-01), so the fix does not stand on its own. |
| NFR-4's carve-out and `attemptBudget`-starvation rationale false | Partially | REQ:471-475 deletes both the carve-out and the false rationale, and states the exclusion as structural. That much is right and matches HEAD: the gate runs between dispatches, never inside one. What did not land is the *granularity* of the window the raisers named — see F-02. |
| §5 config table restated to AC-2.4's window | Partially | REQ:214 no longer says "excluding gate-command run time" and no longer implies subtraction, which is correct: HEAD performs none. It now says "per A6 invocation, measured dispatch to verdict", which inherits F-02's defect. |
| AC-4.1's unbounded existential negative replaced | **No — regressed** | REQ:370-376 replaces one unfalsifiable-but-true sentence with three conjuncts, two of which are impossible under the REQ's own definition of "resolves". See F-03. |

## Findings

## Questions

## Positive Observations

## Recommendation

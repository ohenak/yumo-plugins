# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md`
**Date:** 2026-08-18
**Iteration:** 1

Scope of this review is the testing lens only: whether each acceptance criterion is precise
enough to derive a failing black-box test from, whether the enumerated contracts are closed and
set-equality-checkable, and whether every existing-behaviour claim the REQ makes is true at HEAD.
Product framing (§1–§3) and technical approach are their reviewers' lenses, not mine.

All HEAD claims below were checked against the tree, not inferred.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **C-1 names a REQ authoring dispatch that does not exist at HEAD.** `PHASE_DISPATCH.R` sets `creator: null` (`pdlc/workflows/orchestrate-dev.js:3629`), and the pipeline dispatches nothing for it: `if (dispatch.creator)` guards the only creator dispatch (`orchestrate-dev.js:13505-13508`, comment "`creator: null` (Phase R) reviews a document this pipeline did not write, so there is nothing to dispatch"), reaffirmed at the Phase R call site — "No creator (`PHASE_DISPATCH.R.creator` is null — the REQ arrives authored)" (`orchestrate-dev.js:13760-13761`). One of the six members of C-1's closed set therefore has no dispatch to inject into, and AC-1.1 ("any of the six authoring dispatches named in C-1 is composed") cannot be exercised for it. A TE deriving the AC-1.1 test suite gets five cases and one that cannot be written. Either drop REQ from C-1 and say where a REQ author is grounded instead (the REQ is authored outside `orchestrate-dev`), or state the separate integration point that would carry it and scope it explicitly. | C-1, AC-1.1, §1.2.1 |
| F-02 | High | Local | **"Exactly the six authoring dispatches" is not a closed, run-invariant set at HEAD, so AC-1.2's set-equality check cannot be written.** Three separate facts break the count. (a) Phase D is conditional: it runs only when the `DECISIONS_WARRANTED` trailer says so, defaulting true on absent/malformed input (`orchestrate-dev.js:5204-5239`, prompt at `9411-9412`) — a run with `DECISIONS_WARRANTED: false` has five, not six. (b) Every phase adds one **optimizer** dispatch per failing review round (`reviewLoop` step (g), `orchestrate-dev.js:7655-7660`), and the optimizer is an author writing the same document, sharing the creator's session (`M-2`, `:7657`). (c) **Erratum** author dispatches and their land-proof retries are themselves tagged `dispatchKind: "authoring"` (`orchestrate-dev.js:12821`, `:12915`), alongside the creator (`:13515`). AC-1.2 asserts a cardinality of six and byte-identity for "every other dispatch"; against HEAD it is either false or vacuous depending on the run, and the failure is invisible under a fixture that converges on iteration 1 with no DECISIONS. State the rule over the dispatch taxonomy that already exists (`dispatchKind === "authoring"` and phase membership), not over a hand-counted six, and say explicitly whether optimizer and erratum dispatches for an in-scope document are in or out — NG-5 excludes reviews, implementation, DoD and harvest but is silent on both. | C-1, AC-1.2, NG-5 |

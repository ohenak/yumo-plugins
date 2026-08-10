# Cross-Review: test-engineer — REVIEW (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/` and the feature's implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 2
**Scope:** Delta re-review for the Final Codebase Review — testing lens only (oracle falsifiability, production-path coverage, property traceability)

## Method

Round-2 protocol: I re-read my own round-1 file, diffed the tree against the commit I reviewed,
and re-verified only the findings that blocked. Convergence question, not a fresh audit.

1. **Located the round-1 baseline.** Round 1 closed at `495e62a8`
   (`docs(review): IMPLEMENTATION v1 — recommendation and verdict`).
2. **Diffed since then.** `git log --oneline 495e62a8..HEAD` — 39 commits, of which nine are
   the remediation wave this round is about (`36707bd7`, `f2af78f7`, `155b8f46`, `0c966a46`,
   `689074f7`, `2272d493`, `f4eb66f3`, `4fdc7fac`, `79e304af`), each naming the round-1 finding
   it closes in its subject line.
3. **Correcting this file's own history.** An earlier draft of this round-2 file was committed at
   `acf2a43f` (09:28) recording *"no remediation reaching the branch"* and a `Needs revision`
   verdict on four still-open Highs. That was true of the tree at 09:28 and false thereafter: the
   remediation wave landed 09:32–09:52. This revision replaces that draft's judgement with a
   re-verification against HEAD. The earlier text is not retracted as wrong-at-the-time; it is
   superseded, and Q-04 below is answered by the timestamps.
4. **Re-verified every round-1 finding at HEAD by reading the code, not the commit messages.**
   Each row in the delta table cites the `file:line` I read, at HEAD.
5. **Ran the suite.** `cd pdlc/workflows && npm test` — 3888 passed, 70 skipped, 1 failed. The one
   failure is `documentOracles.test.js` AT-22, whose violations are `.serena/cache/…​.pkl` and
   `.tokensave/tokensave.db` — untracked local tool caches, exactly the false-red CLAUDE.md
   documents for the document oracle. No tracked file is implicated; not a branch defect.
6. **Checked artifact freshness.** `node pdlc/workflows/build-runtime.mjs --check` — all five rows
   `in-sync`. The dist bundles moved with their sources in `f2af78f7`, `0c966a46`, `79e304af`.

## Delta: status of round-1 findings

Every row below was re-verified by reading HEAD, not by trusting the remediation commit's subject.

| Round-1 ID | Severity | Status at HEAD | Evidence read |
|---|---|---|---|
| F-01 | High | **Resolved.** AT-M9 now drives a fixture that reaches step 13 and asserts a reachability conjunct (0) — two agent calls, the second the authoring dispatch — before the seven the title promises: `failed`, reason set of length 0, §8.3 table appended (keyed on the prior record's id), consumed pair present, marker bytes matching `^RELEASED: {passId} `, error verbatim in the body, `prUrl` null. The prior log record is deliberately given a *distinct* `(failureModeId, action)` pair so `enactedByLog` cannot suppress the proposal — the vacuity F-06 named is closed in the same body. | `consolidationPass.test.js:588-673` |
| F-02 | High | **Resolved.** `openClone` now discriminates on the clone's own stderr: a non-null `cfg.pluginRepository` whose clone fails with a repository-shaped stderr returns `{failure: "repository-unresolved", detail: String(cfg.pluginRepository)}` — the configured value verbatim, per FSPEC:889. AT-N4 drives `openClone` itself in three legs, with an `api-failure` control that keeps E-22 and E-23 uncollapsed, and a rendering leg fed from the value production returned rather than a literal. The hand-built `reasons: new Set([...])` state is gone. | `consolidate-learnings.js:2495-2506`; `consolidationReport.test.js:415-484` |
| F-03 | High | **Resolved.** The typedef-conforming shape moved into production as the exported `configNotices(parse)`; `main()` step 1 is its only caller and pushes its output straight onto `state.notices`. AT-N1…AT-N3 now **import** `configNotices` instead of transcribing a test-local builder. The DC-07 builder-not-wired gap is closed in the direction that matters: the shape the tests read is the shape the report renders. | `consolidate-learnings.js:2020-2036, 536`; `consolidationReport.test.js:42, 371-408` |
| F-04 | High | **Resolved.** `main()`'s result now carries `writeSet` as a snapshot array, and AT-M5 compares the union of observed commit pathspecs against it in **both** directions (`[...observed].sort()` ≡ `[...writeSet].sort()`), preceded by a non-vacuity floor (`writeSet.size > 0`) so the equality cannot pass on ∅, and keeping the marker-exclusion conjunct. This is the set-equality PROPERTIES §O-2 names, not containment. | `consolidationPass.test.js:504-521`; `consolidate-learnings.js:1198` |
| F-05 | Medium | **Resolved.** Both absence-only oracles replaced by positive pins: the post-reset case asserts `state` is `null` outright, the empty-consumed case likewise, each with a comment naming what the old `not.toBe(...)` was jointly satisfiable by. | `consolidationEffectiveness.test.js:264-274, 292-308` |
| F-06 | Medium | **Resolved** — folded into F-01's fixture (distinct prior-record id, ESCALATIONS.md body, dispatch asserted). | `consolidationPass.test.js:594-601, 648-651` |
| F-07 | Medium | **Resolved** — the AT-M5 set-equality above is asserted at both the per-call and `main()` levels. | `consolidationPass.test.js:504-521` |
| F-08 | Medium | **Resolved.** PROPERTIES §12.2's property→file map is now guarded mechanically: both containment directions between §§4–11 definitions and the map, sorted-set equality with counts, a non-vacuity floor, and on-disk existence of every file the map names. This is the guard that would have caught F-01 and F-04. | `consolidationTraceability.test.js:150-260` |
| F-09 | Low | **Resolved.** `notImplemented` deleted; no `notImplemented` symbol remains in `consolidate-learnings.js`. | `4fdc7fac`; grep at HEAD |
| F-10 | Low | **Partly resolved** — see F-13. Four suites corrected; four header comments still describe deleted behaviour. | `consolidationLifecycle/Report/Route/Rung.test.js` |
| F-11 | Medium | **Resolved.** Reviewer prompts now name the exact cross-review path the round window derives; this round was dispatched with the literal `REVIEW-v2` path. | `202f92e1` |

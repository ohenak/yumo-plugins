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

## Findings

Round-2 scope: were my blocking findings resolved, and did the revision break anything? All four
round-1 Highs are resolved on the production path, not merely in the oracle. Nothing regressed —
the suite is green apart from the documented untracked-file false red, and the dist artifacts
moved with their sources. Three residual Lows remain, none gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-12 | Low | Local | **`REPOSITORY_UNRESOLVED_RE` is broader than the E-22/E-23 boundary it draws.** The alternation carries a bare `/not found/`, which subsumes the specific `repository not found` beside it and also matches transport stderr that happens to contain the phrase (`fatal: unable to access …: server not found`, a DNS failure git reports on the `unable to access` path). That misclassifies an E-23 network blip as E-22 `repository-unresolved` — the direction the comment at `:2456-2458` explicitly says it wants to avoid. The AT-N4 control proves only that *one* transport phrasing (`Could not resolve proxy`) stays `api-failure`; it cannot fail on a phrasing containing "not found". Suggest dropping the bare alternative and adding a control whose stderr is transport-class but contains "not found". | `consolidate-learnings.js:2459-2460`; `consolidationReport.test.js:459-467` |
| F-13 | Low | Local | **F-10's residual: four suite headers still describe deleted behaviour.** `79e304af` corrected the Lifecycle/Report/Route/Rung comments, but four files still state that their subjects "throw `notImplemented`" — a symbol `4fdc7fac` removed from the module entirely. Same failure mode F-10 named: a comment that reads as a standing justification for a weaker oracle, now naming a function that does not exist. | `consolidationProperties.test.js:13`; `consolidationIdentity.test.js:14`; `consolidationPredicate.test.js:13`; `consolidationPass.test.js:18-19` |
| F-14 | Low | Local | **`result.writeSet` has no production reader.** It was added to give AT-M5 the domain PROPERTIES §O-2 names — the right fix for F-04 — but at HEAD the only consumer of the returned field is the test (`state.writeSet` itself is read by step 15's commit; the *result* field is not). It is defensible as a lineage field on an operator-facing return and is documented as one at `:1193-1197`, so this is not the dead-config pattern proper; recording it so a later reader does not mistake it for load-bearing. If item 8 or the terminal row ever wants to name the write set, that is the wiring that would retire this finding. | `consolidate-learnings.js:1193-1198`; `consolidationPass.test.js:504` |

## Questions

All four of round 1's questions are answered by the remediation wave; recorded here so the answers
are durable rather than buried in commit bodies.

| ID | Question |
|----|---------|
| Q-01 | *Answered* (`36707bd7`). A configured-but-unresolvable repository is `repository-unresolved`, discriminated on the clone's own stderr rather than an `ls-remote` probe — because `ls-remote` resolves to `unknown` in `resolveSeamVerb` and sits outside the git-clone permitted verb set (TSPEC §9.3), so probing would have failed AT-Q7's containment conjunct. That constraint is worth remembering: the seam vocabulary limits which oracles are even available here. |
| Q-02 | *Answered* (`f2af78f7`). The `ParseNotice`-conforming shape (`{subject, missingField, detail}`) is authoritative; it lives in production as `configNotices` and the tests import it. |
| Q-03 | *Answered* (`155b8f46`). A step-13-reaching fixture does exist: `deriveProposals`' `{clusters:[…]}` grammar, a cluster with no `diff`, and a `pdlc/workflows/` artifact at kind 3 routing PR via `MERGE_GUARD_DEFAULTS`. |
| Q-04 | *Answered by the timestamps.* Remediation did reach the branch — nine commits, 09:32–09:52 — after the 09:28 draft of this file was committed. Round 3 does not need to spend a budget slot on the "nothing is landing" hypothesis. |
| Q-05 | **New, and outside this feature's diff.** `pdlc/hooks/scripts/sync-workflows.sh --check` exits 1 here while printing only `…/.claude/pdlc.config.json could not be read for distribution.checkEnabled; assuming true` — no per-row drift verdict at all. On a tree with no `.claude/workflows/` that may be intended, but a non-zero exit with no row named is hard to act on, and the drift gate in `orchestrate-queue` reads this. No hooks script is in this feature's diff, so I am not filing it as a finding against this branch; flagging it in case it is a real gap in the drift ladder's reporting. |

## Positive Observations

- **The remediation answered the findings at the level they were filed.** F-02 and F-03 were
  production-path findings and were fixed in production, not in the oracle — `openClone` now
  *produces* the reason code, and `configNotices` is now a production builder with `main()` as its
  only caller. The lazy fix for both was available (widen the test, keep the shape) and was not
  taken.
- **Every strengthened oracle carries a negative control.** AT-N4's `api-failure` leg keeps E-22
  and E-23 uncollapsed; AT-M5's non-vacuity floor keeps the set-equality from passing on ∅; the
  new operator-channel suite pairs each `not.toContain("… none")` with the positive it replaces
  *and* a `none`-is-reserved-for-empty control (`consolidationOperatorChannels.test.js:157-166`).
  That is the exact shape the falsifiability bar asks for, applied without being asked twice.
- **F-01's fix included the reachability conjunct I did not ask for.** Conjunct (0) — two dispatches,
  the second matching `Author the promotion diff` — makes the other seven non-vacuous. The comment
  explaining why the prior record's `(failureModeId, action)` pair must differ is the kind of note
  that stops a future edit from silently re-vacuating the row.
- **F-08's guard is the durable one.** The §12.2 property→file map is now checked by set-equality
  in both directions plus on-disk existence — a mechanical descendant of the two findings that
  needed a human to spot them.
- **The per-section source narrowing (`a1a96513`, `4878bb23`) is asserted structurally,** splitting
  the body on `^## ` and asserting per-section rather than whole-body containment, with an explicit
  comment that a whole-body `toContain` would pass on the very defect the row is about
  (`consolidationOperatorChannels.test.js:340-365`).

## Recommendation

**Approved with minor changes**

All four round-1 Highs are resolved, and resolved on the production path rather than in the
oracle — which is the distinction that made them Highs. The four Mediums and both Lows are
resolved too, F-10 all but a residue. Nothing regressed: the suite is green apart from
`documentOracles` AT-22, whose violations are untracked local tool caches (`.serena/cache/`,
`.tokensave/`) and which CLAUDE.md documents as exactly this false red; `build-runtime.mjs --check`
reports all five artifacts in sync.

From the testing lens this branch is ready. The three residual Lows are worth doing but none of
them can hide a defect:

1. **F-12** — drop the bare `/not found/` alternative from `REPOSITORY_UNRESOLVED_RE` and add one
   control whose stderr is transport-class *and* contains "not found". This is the only residual
   with a behavioural consequence, and it is a misclassification of a reason code, not a
   correctness failure.
2. **F-13** — four suite headers still name `notImplemented`, deleted in `4fdc7fac`. Same one-line
   correction `79e304af` applied to the other four files.
3. **F-14** — bookkeeping only: note that `result.writeSet` is currently read by the test alone, so
   a later reader does not take it for load-bearing production output.

Q-05 is outside this feature's diff and should not gate it; it belongs to whoever next touches the
drift ladder's reporting.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

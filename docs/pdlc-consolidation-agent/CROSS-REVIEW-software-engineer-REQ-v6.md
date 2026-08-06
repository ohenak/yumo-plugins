# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 6
**Scope:** Local (delta re-review — v5 findings + changed sections only)
**Baseline diffed:** `d1d58c3..HEAD` (5 revision commits, +100/−99; 698 lines)

## Prior-Finding Disposition

All four v5 findings, checked against the revision.

| v5 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Resolved — and resolved the way I asked** | The REQ-CONS-03 preamble now defines a **third** trailer, `PDLC-CONSOLIDATION-PROMOTIONS: {sorted failure-mode-ids}`, "one id per promotion the PR enacts" (`:265-268`), and demotes the sources trailer explicitly to provenance — "which records pass provenance and is **not** a duplicate key". NFR-4 is rewritten to key "**per promotion**" on `failure-mode-id` and states *why* the set key was wrong in the same words the finding used: "a consumed set is time-dependent … so two passes proposing the same promotion normally consume different sets and a set key would miss exactly when suppression matters" (`:283-287`). AC-3.5's row moved with it (`:298`), and AC-3.8b's abandonment paragraph now says a later pass re-deriving the promotion "from a *larger* consumed set still records `duplicate-suppressed`" (`:352-354`). NFR-4 additionally added a state-reading rule I had not asked for and that closes a hole I had not raised — "State is read at poll time with no memory of prior states: a reopened PR is open, hence a key" (`:289-290`). The key now rides the PR, as Q-01 proposed. What this round did **not** settle is whether the id it keys on is actually stable — see v6 F-01/F-02, which are about `failure-mode-id` itself, not about the routing. |
| F-02 | Medium | **Resolved** | The revision took the second horn of Q-02. AC-1.3's Commits cell for `refused` is back to "**no** — it writes its AC-7.2 row but commits nothing" (`:200`), the paragraph is retitled "A `refused` pass writes its AC-7.2 row and commits nothing" and states the reason in the finding's own terms — "a pathspec stages a whole file, so a refused commit would capture the winner's live `IN-PROGRESS:` line — falsifying AC-3.8b's 'the marker is never committed'" (`:206-207`) — and closes the evidentiary loop both ways ("the winner's own AC-3.8b commit covers the same path and sweeps the row up; if the winner dies first the row stays in the working tree", `:207-209`). §4b's `writes-uncommitted` row reverted with it (`:600`). The AC-3.8b guarantee at `:333` is intact and now unreachable-false. The contradiction is gone. The concurrency half of the finding is answered but by assertion — v6 F-03. |
| F-03 | Medium | **Resolved, both halves** | (a) `no-cadence-datum` now permits `refused` (`:599`) and the composition paragraph derives it rather than asserting it: "it is decided at step 3 of the tick order, and the marker check that yields `refused` comes after (AC-1.3 — the marker is written 'after the trigger decision of steps 1–4')" (`:627-629`) — which is the quote at `:190` verbatim, so the derivation is checkable against the AC it cites. (b) `writes-uncommitted` no longer permits `refused` (`:600`) and the sentence that denied its own row is replaced by one that agrees with it: "`writes-uncommitted` does **not** permit `refused`, because a refused pass commits nothing (AC-1.3)" (`:630-631`). Table and paragraph now yield the same set for every row; a test transcribed from either agrees. |
| F-04 | Low | **Resolved, both citations** | (a) `phase: "CR"` is now cited `:10255-10257` (`:427`) — I confirm `:10257` is `phase: "CR",`. (b) The `CODE_REVIEW` row now names both dispatch sites: "`orchestrate-dev.js:7911` (round 1, `dodVerifyPrompt`) and `:7941` (rounds ≥2, `dodReVerifyPrompt` `:7924`)" (`:418`) — all three anchors confirmed below. The revision also volunteered `first key R: :3338` into the `PHASE_DISPATCH` range (`:614`), which is correct and makes the range's endpoints both pinned. |

Four of four resolved; nothing regressed on the resolved ground. The findings below are **new** and
all three arise in text this revision added — two of them in the `failure-mode-id` contract the F-01
fix now rests on.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict

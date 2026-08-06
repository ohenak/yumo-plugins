# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Local (delta re-review — v8 findings + changed sections only)
**Baseline diffed:** `a2abdb9..HEAD` (5 REQ commits, +63/−112; 634 lines / 61,053 bytes, down from 683 / 65,492), plus the two `docs/_constraints/` files those commits created

## Prior-Finding Disposition

All three v8 findings, checked against the revision and against the code or precedent each cites.

| v8 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Resolved — the promise was made total rather than repriced, and Q-01 was answered in the same edit** | AC-5.3 gains "A spent alternative, and the terminal remediation" (`:428-435`): "**when the pass's chosen alternative is already on a PR in state open or merged, it proposes the other one**", `retire` is declared **terminal** ("a retired promotion is gone, so no successor is owed and the ladder cannot run out"), and the AC-7.1 field "names the alternative actually proposed, never the one displaced". That is option (a) from my finding — the one that keeps the guarantee instead of pricing its loss. Q-01 is answered explicitly and in the direction that makes my case a corner rather than the main line: "a **merged** revision resets that promotion's `ineffective` streak to zero — the reset AC-5.5 makes explicit for `unmeasurable`, made explicit here too — so a revision that lands is re-judged on two fresh `recurred` counted passes rather than re-flagged on the next one" (`:434-435`). The asymmetry I flagged with AC-5.5 is gone. AC-5.1's `action` paragraph was corrected to agree rather than left contradicting: remediations reach the AC-3.1 route "unimpeded **by it**", and "can still be suppressed by an *earlier remediation of the same kind* — each action fires at most once per id — which is why AC-5.3 routes the pass to the other alternative when its first choice is spent, and makes `retire` terminal" (`:390-392`). Both sentences now say the same thing. I replayed the fixture: promote merged → `ineffective` → `revise` merged → streak 0 → two fresh `recurred` → `ineffective` → `revise` spent → `retire`. Terminates. |
| F-02 | Medium | **Resolved, and the case I said must be decidable is decided by name** | AC-5.1 gains "**One promotion is one authored file**" (`:371-378`), which states the split direction as a requirement rather than leaving it to inference: "a remedy spanning two authored files is **two** proposals — two ids, two AC-3.3 commits, two AC-5.2 rows, two AC-5.3 streaks — which may share one PR (AC-3.3 already permits that shape); they share nothing else and are measured separately". That is my option (a), and it took option (b)'s hardest case with it: "A **generated** path is never an `artifact` and never mints an id: the tracked outputs of `pdlc/workflows/build-runtime.mjs` under `pdlc/workflows/dist/` … ride the authored file's commit. So the likeliest promotion this feature will make — an edit to `pdlc/workflows/orchestrate-dev.js` plus its rebuilt bundles — is **one** promotion whose `artifact` is `pdlc/workflows/orchestrate-dev.js`". I checked the exclusion for totality against the guard set rather than taking it on faith (row 3 of the verification table below): within `MERGE_GUARD_DEFAULTS` the only tracked generated paths are the four under `pdlc/workflows/dist/`, and `.claude/workflows/` is gitignored and can never appear in a PR — so the carve-out is closed, not illustrative, and the derivation is total on every edit shape a promotion can have. |
| F-03 | Low | **Resolved, and hardened past what I asked for — by relocation, in the moved table** | Both cells are fixed in the table's new home: `promote`/`revise`/`retire` now reads `promoted`, `promoted-degraded`, `no-op` (`pdlc-consolidation-vocabularies.md:48`), matching `duplicate-suppressed` (`:41`) exactly as I asked, and both "as above" cells — `ineffective`/`unmeasurable` (`:47`) and `revision`/`retirement` (`:49`) — were replaced by their intended referent, "any status emitting the AC-5.2 table". The optional half of the finding was taken too: the file carries the standing rule at the top, above both tables — "**No cell in either table below may use a positional back-reference.** Every *May accompany status* cell names its permitted set explicitly, so inserting a row can never silently re-point a neighbour" (`:15-16`). That converts my one-time fix into an invariant that also covers §2's table. |

Three of three resolved, no v8 fix regressed, and two of the three were closed by adopting the
argument rather than the minimum patch. Both new findings below are consequences of the **relocation**
this round performed (v8 TE F-46) — not of the three fixes above, which are clean.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict

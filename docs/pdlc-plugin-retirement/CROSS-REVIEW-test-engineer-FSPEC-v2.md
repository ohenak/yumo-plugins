# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.2)
**Date:** 2026-08-17
**Iteration:** 2
**Scope:** delta re-review of `5aa6bf97..588ff5a6` against
`CROSS-REVIEW-test-engineer-FSPEC-v1.md`. Only changed sections were scanned for new issues;
every literal cited below was re-derived from the tree at `588ff5a6`, not from the document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AT-1.2's new positive control is written as a set-equality against a set that is provably larger than the output, so the clause cannot pass on a correct sweep.** Clause 1 requires the unfiltered output to "set-equal the A-1-covered path set". A-1's globs cover far more tracked paths than carry a retired name: `docs/completed/**` alone is **68** tracked files today, `docs/discarded/**` **14**, `docs/pdlc-plugin-retirement/**` **19**, while L-3's command run over those globs plus `docs/_decisions/**` returns **62** paths in total. Equality holds only if every allow-listed file contains a retired term, which is false now and gets falser with each cross-review that lands under BR-SWEEP-5's growing glob. The trailing "— at minimum {`DECISIONS-plugin-distribution.md`, `pdlc-retirement-baseline.md`}" is the opposite shape (a lower bound) and contradicts the set-equality in the same sentence, so the clause also does not tell a test author which to implement. Fix without weakening F-03's intent: state the control as a **two-sided containment** — the output path set **contains** A-1's two mandatory members (the positive control, non-empty by construction) and is **contained in** A-1's frozen glob coverage (clause 2, already correct). Set-equality remains the right shape where the enumeration is closed (L-1, L-2, L-4, L-7, L-10, AT-1.4, AT-5.2 field sets); A-1's coverage is not a closed enumeration | §6.1 AT-1.2 clause 1; §4.2 L-3 |
| F-02 | Medium | Local | **AT-3.1's transcript conjunct still carries one unbounded negative.** "The session transcript shows exactly one engine CLI invocation **and no other pipeline action**" — the first half is countable, the second is a claim over an unenumerated space and is discharged only by a reviewer reading a transcript. The two positives added this round (non-empty dispatch record, field-faithful relay) plus the static half (delegator skill files contain no queue selection, readiness evaluation, dispatch, verdict parsing or queue-row write) already carry the AC. Either drop "no other pipeline action" or restate it as the countable form the rest of the AT uses: the transcript's tool-invocation set for the skill **set-equals** {one engine CLI call}, which is falsifiable by counting | §6.3 AT-3.1 |
| F-03 | Low | Local | **AT-3.3's hook half names observables but not the channel they arrive on, and two of the four do not use the obvious one.** `check-scope-field.sh:50` and `check-req-size.sh:65,:74` emit their warning as a JSON `hookSpecificOutput.additionalContext` string on **stdout** and exit `0`; a test asserting "warning on stderr, non-zero exit" fails on a correct hook. Naming the channel per entry (JSON field for the two PostToolUse warn hooks, the guard's blocking payload for the harvest guard, session context for the nudge) costs one clause and removes the ambiguity before the TSPEC picks a harness | §6.3 AT-3.3 half 2 |

## Resolution of round-1 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (High) — workflow-comment count words unowned | **Resolved** | BR-DOC-1a names both live claims and lands them in class 1. Re-derived with the oracle's own flatten+regex at `588ff5a6`: `fixture-machine.yml` → `six PR-gate jobs`, `publish.yml` → `six rendered check names`, `pr-tests.yml` → none. Both correct to `four` = L-7's post-sweep size; class 1's row now reads "three workflow files" |
| F-02 (High) — AT-5.2 unpassable | **Resolved** | AT-5.2 splits field-set equality (whole report) from value comparison (stable subset), names the excluded classes, and §7.2 (2) routes the REQ correction rather than widening AC-5.2 silently |
| F-03 (High) — AT-1.2 absence-only | **Partly resolved** | A positive control is now present and required non-empty; its comparison shape is F-01 above |
| F-04 (Medium) — AT-1.3 vacuous skip / unidentifiable re-homing | **Resolved** | Skip conjunct is repo-wide; L-6 now carries assertion **titles** per row and AT-1.3 requires the titles to red when reverted |
| F-05 (Medium) — AT-1.4 absence-shaped CI conjunct | **Resolved** | Restated as set-equality over the checks rendered by the PR-triggered files, membership by `on:` trigger |
| F-06 (Medium) — agent self-report | **Resolved for AT-3.3, mostly for AT-3.1** | AT-3.3 is now two mechanical halves; AT-3.1 keeps one negative (F-02) |
| F-07 (Medium) — unpinned exit oracle | **Resolved** | BR-CLN-4 fixes `3`, and the transcription is exact: `sync-workflows.sh:714` `unknown` → `3`, `:718` `local-edit`/`unverified` → `2`, `:722` stale/missing → `1`, `:725` → `0` |
| F-08 (Low) — AT-4.4 comparison artifact | **Resolved** | Names the run report at its reported path, reuses AT-5.2's scoping, requires two runs |
| F-09 (Low) — post-sweep carrier | **Resolved** | BR-DOC-1b names CLAUDE.md's `### Continuous integration` as the single oracle-covered carrier and puts the oracle's explanatory prose in class 1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-1.2 clause 1: is the intended control "the two mandatory A-1 members are present in the output" (falsifiable, stable) or "the output enumerates A-1 exactly" (measured false today)? F-01 assumes the former. |

## Positive Observations

- **Every new literal re-derives exact.** The drift-state path and its writer are as cited —
  `pdlc/hooks/scripts/lib/pdlc-drift.sh:1559` `pdlc_write_drift_state`, target
  `${repoRoot}/.claude/workflows/.pdlc-drift-state.json` (`:1561`–`:1562`); the four terminal exit
  branches of `sync-workflows.sh` are byte-accurate; `documentOracles.test.js:747`–`:749` does
  assert CLAUDE.md *contains* `check-workflow-drift.sh` and `sync-workflows.sh`, which is exactly
  the inversion BR-SWEEP-4's new prose exception exists for.
- **BR-SWEEP-4's scope narrowing is the right repair, not a loophole.** It carves out prose only,
  keeps every gate-read reference under the no-lag rule, and hands the carve-out to two owning
  classes (9 for oracle-guarded, 12 for unguarded) so nothing lands unowned.
- **BR-CLN-3a states the consequence instead of hiding it.** "Expected name + modified content is
  removed" is the honest reading of a post-sweep world with no manifest, and it is paired with
  E-16a and an erratum rather than a reinterpretation of AC-4.3.
- **`A-1` vs `ASM-n` disambiguation** removes a real transcription hazard: the old `A-1`
  assumption and the baseline's `A-1` allow-list both appear inside AT-1.2's neighbourhood.
- **AT-1.8 now judges hunks, not files**, which matches BR-SWEEP-1's (file, section) unit and is
  the only form under which CLAUDE.md's four-class split is checkable.

## Recommendation

**Needs revision** — one High finding.

The round closed eight of nine round-1 findings, three of them High, with literals that re-derive
exactly. What remains is one sentence: AT-1.2's positive control has the right intent and the
wrong comparison operator, and as written it is the same "gate that cannot pass" shape that
F-02 fixed elsewhere this round. Restating clause 1 as two-sided containment resolves it without
touching anything else.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}

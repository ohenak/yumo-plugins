# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review — v2 findings F-16…F-19, plus new issues in changed sections only

## Review base

Diffed `0bc2841..HEAD` on the REQ (+53/−25, 7 revision commits, 343→371 lines). Every
existing-behaviour claim in the changed text was re-checked against the base the REQ now **pins**,
default-branch commit `26c3f1c` — which I confirmed is a real commit, is an ancestor of
`origin/main`, and is in fact `origin/main`'s tip today (`git merge-base --is-ancestor 26c3f1c
origin/main` → 0; `git log -1 origin/main` → `26c3f1c`). Pinning it was the right move: this branch
is still behind that tree, so an unpinned "written against main" would have drifted silently.

Facts re-verified at `26c3f1c` for the changed text only:

| Claim in changed text | Verified at `26c3f1c` |
|---|---|
| The A1 gate is `precheckDependencies`, and it is one-sided — it can only prove *blocked* | `pdlc/workflows/orchestrate-queue.js:630-648`; `done`/absent-from-queue fall through, doc comment `:618-627` |
| That pre-check runs **before** any agent, and a `blocked` result skips the candidate outright | `orchestrate-queue.js:890-899` (`precheck.blocked` → `emit` + `skipped.push` + `continue`); triage dispatch only after, `:901-905` |
| The harvest delete-guard refuses by denying the tool call, so the file survives | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:52-60` (stderr message + `sys.exit(2)`); two-prefix match `:35`, `:43` |
| The shipped in-process notices are merge-specific and frozen | `orchestrate-dev.js:1321-1328` (`MERGE_ESCALATIONS`, `Object.freeze`), emitted `:908`, `:920`, `:950`, `:1509`, `:1542` |
| Every shipped literal contains the substring `ESCALATION:`, so AC-10.5's one-grep claim holds | same lines — each begins `MERGE ESCALATION: ` |
| `gh run rerun` is a *write* against Actions, unlike every CI surface used today | BL-06's premise; the shipped surface is the read `gh pr view --json statusCheckRollup` (`orchestrate-dev.js:323`) |

Still no `docs/_constraints/` or `docs/_decisions/` in this repo, so no standing constraint is
contradicted.

## Disposition of v2 findings

All four are closed.

| v2 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-16 | Medium | **Resolved** | AC-4.5's A1 row no longer claims a state the pre-check cannot observe: it now reads "the pre-check returns not-blocked (AC-5.1)". AC-5.1 states the one-sidedness in the REQ's own words ("establishes only that no declared dependency has a not-`done` queue row, never that a dependency is present in base") and answers "who establishes presence in base" honestly — **nobody**: where presence is unsettled the advisory verdict is `escalate`, and "no advisory agent adjudicates presence in base". That matches `orchestrate-queue.js:630-648` exactly. A residual wording point about the re-run's falsifiability is filed as F-20, Low. |
| F-17 | Medium | **Resolved** | AC-3.6 is now an **ordered** eight-row trigger→reason table with first-match-wins, which makes the mapping injective by construction: the v2 collision between `revert-on-test-touch` and `out-of-envelope` is resolved by rank (2 before 3), and the missing case is added as `post-action-verification-failed` (rank 4), explicitly citing the AC-4.5 gate and the AC-7.4 re-run — both of the events I named. The closing sentence commits to set-equality over the full enumeration, which is the completeness oracle I asked for rather than a containment check. One residual, non-blocking totality gap is filed as F-21, Low. |
| F-18 | Low | **Resolved** | Both halves are declared. **BL-06** is new and names the E-1 capability precisely as a *write* against Actions requiring the token scope, distinguishing it from every read the pipeline performs today, and carries the same unavailable-behaviour clause ("E-1 is out of envelope and the seam escalates under the same clause as BL-05"). **BL-05** is widened to cover "AC-8.4's comparison **and** E-2's *introduced* test", which is the shared merge-base/default-branch check-history surface E-2 now depends on. |
| F-19 | Low | **Resolved** | AC-10.5 stops asserting a literal it does not own. It now describes the shipped channel as "Phase MERGE's, under its own frozen, merge-specific prefix" — accurate against the frozen `MERGE_ESCALATIONS` catalogue (`orchestrate-dev.js:1321-1328`) — states that catalogue is "left exactly as it is, **not widened**", and gives the advisory tier a distinct sibling prefix whose literal is TSPEC's. The added invariant that both prefixes carry the shared `ESCALATION:` token is true of the shipped side: every one of the five emission sites begins `MERGE ESCALATION: `, which contains `ESCALATION:`. |

## Findings

## Questions

## Positive Observations

## Recommendation

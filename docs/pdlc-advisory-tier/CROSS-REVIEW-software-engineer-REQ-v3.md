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

## Findings

## Questions

## Positive Observations

## Recommendation

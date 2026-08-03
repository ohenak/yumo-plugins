# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` (v1.1)
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review. Two questions only — are my v1 findings F-01…F-12 resolved, and did the
revision break anything in the sections it touched. Unchanged sections I approved in v1 are not
re-litigated. The approval bar is unchanged.

## Delta basis

`git diff 5a1b560 HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` — 95 insertions,
66 deletions across ten commits (`40e51a0` … `a19e7ac`). Touched: §3.3/§3.4, §4.1/§4.3/§4.4/§4.5,
§5.2/§5.3/§5.4/§5.5, §6.3/§6.4/§6.5/§6.6, §8.3, §9.2/§9.3/§9.4, §10.1/§10.2/§10.3/§10.5/§10.6,
§11.4, §12.1/§12.3, §14.1/§14.2, §15.2/§15.3, §16.1/§16.2, §17.2, §18.1/§18.2/§18.3.

Code re-verified for the *changed* claims only, against `main` at `26c3f1c` (the sha §2 pins;
`git show main:pdlc/workflows/orchestrate-dev.js`, cited below as `dev:N`). Note for the
orchestrator, not a finding: this branch forks from `7cdfbb0`, so the working-tree
`pdlc/workflows/orchestrate-dev.js` is the 2,139-line predecessor, not the 8,527-line file at
`26c3f1c`. Every line cite below is at `26c3f1c`, as §2 requires.

| Changed claim | Checked at | Result |
|---|---|---|
| §9.2 A5-3 — Phase PUB's re-poll waits on the pipeline's own CI cadence | `dev:34` `CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000`, `dev:33` `CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000`, `dev:6249-6286` the poll loop | Confirmed — a re-poll can legitimately run to 30 min, so a 10-minute seam budget that counted it would bind first, as A5-3 argues |
| §9.2 A5-9 — the completion cap halts today | `dev:6267-6272` `throw haltError("… did not complete within …")` | Confirmed |
| §9.3 — an *in-invocation* re-poll that hits the cap "consumes an attempt" | same `throw` at `dev:6267-6272` | Confirmed as a **change** to today's behaviour, not a restatement (see F-03) |
| §10.2 H-2 — a post-PUB commit leaves Phase MERGE evaluating a head beyond the checked one | `ciRule` at `dev:759-784`: `pending` → `{result:"refused", row:"10", reason:"CI is pending", escalate:false}` | Confirmed, and the outcome is a *non-escalating* refusal (see F-07) |
| §10.2 H-3 — the delete guard is a channel, not a courtesy | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:36` matches only `rm` / `unlink` / `git rm` inside a Bash `tool_input.command`; `pdlc/hooks/hooks.json:9` registers it as PreToolUse: Bash | Confirmed — and this is exactly why H-3's new clause needs a production-path test (F-04) |
| REQ AC-8.1 vs new A5-9 | `REQ-pdlc-advisory-tier.md` AC-8.1 — the seam fires on "a failing check"; a cap hit has no failing check | Consistent; A5-9 does not narrow the REQ |

## Disposition of v1 findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

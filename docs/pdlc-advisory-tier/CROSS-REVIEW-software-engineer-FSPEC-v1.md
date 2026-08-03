# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** FSPEC-pdlc-advisory-tier v1.0, reviewed against `REQ-pdlc-advisory-tier.md` v1.3 and the
repository at default-branch commit `26c3f1c` (the commit the FSPEC's §2 citation pin names).

## Baseline verification

Every `file:line` claim in §2 was re-read at `26c3f1c` in one pass (the cross-cutting existing-code
check). **All sixteen hold.** Recording it here so no later round re-litigates them:

| id | Verified at | Verdict |
|---|---|---|
| B-1 | `orchestrate-queue.js:653-668` (`triagePrompt`, three `TRIAGE:` verdicts), `:907-921` (both `blocked` and `needs-human` `continue`, differing only in the recorded free-text reason) | accurate |
| B-2 | `orchestrate-queue.js:630-649` (`precheckDependencies`; `:645` comment "Dependency done, or not in the queue at all → inconclusive here; defer to triage") | accurate |
| B-3 | `orchestrate-queue.js:662` — the only staleness-adjacent clause is verbatim "Also flag if the REQ references subsystems that do not yet exist"; no re-grounding obligation exists | accurate |
| B-4 | `orchestrate-dev.js:25` (`DOD_MAX_ITERATIONS = 3`), `:6164`, `:6190-6191` (`iteration === maxIterations` returns without remediating) | accurate |
| B-5 | `orchestrate-dev.js:8179-8188` (❌ row then `haltError`) | accurate |
| B-6 | `orchestrate-dev.js:8161-8172` (step-0 rebase; `"conflict"` → ❌ + `haltError`) | accurate |
| B-7 | `orchestrate-dev.js:6250-6286` (`passed` returns; `failed` halts; completion cap halts; `no-checks` **returns a pass**) | accurate |
| B-8 | `orchestrate-dev.js:8267-8271` — the phase row literal is "no GHA checks detected within timeout (assumed none configured)" | accurate |
| B-9 | `orchestrate-dev.js:5812-5824` (`checkPrCi` shells `gh pr view --json statusCheckRollup`), `:6245-6250` | accurate |
| B-10 | `orchestrate-dev.js:1578`, `:1621`, `orchestrate-queue.js:69` — all three are bare alias strings | accurate |
| B-11 | `orchestrate-dev.js:43` (`MERGE_CONFIG_PATH`), `:101-152` (`parseMergeConfig`), `:181-200` (`parseImplementationConfig`) — independent sections, each degrading to its own defaults | accurate |
| B-12 | `git ls-tree 26c3f1c .claude/` is empty; the untracked working-tree file carries an `implementation` section only | accurate |
| B-13 | `orchestrate-dev.js:1319-1328` (`MERGE_ESCALATIONS`, frozen, every member prefixed `MERGE ESCALATION:` and so carrying the `ESCALATION:` token), `:8291-8292`, `:8395`, `:8402` | accurate |
| B-14 | `guard-harvest-before-delete.sh:35` (token match), `:43` (token regex), `:52-59` (LEARNINGS glob + refusal) | accurate |
| B-15 | `orchestrate-dev.js:8151` (DOD), `:8192` (H), `:8248` (PUB), `:8274` (MERGE) | accurate |
| B-16 | `git ls-tree 26c3f1c docs/_queue/` → `QUEUE.md` only | accurate |

Two further facts I read at the same pin, which the findings below turn on and which §2 does **not**
carry:

- **P-a** — `orchestrate-dev.js:33-35`: `CI_NO_CHECKS_TIMEOUT_MS = 10 min`, `CI_POLL_INTERVAL_MS = 30 s`,
  **`CI_COMPLETION_TIMEOUT_MS = 30 min`**.
- **P-b** — `orchestrate-dev.js:8249-8250`, verbatim: Phase PUB *"Runs last so PR captures complete
  feature branch, including harvested LEARNINGS."* The pre-PUB placement of harvest is deliberate,
  and its stated reason is exactly what §10.2 moves away from.

## Findings

<!-- filled next -->

## Questions

<!-- filled next -->

## Positive Observations

<!-- filled next -->

## Recommendation

<!-- filled next -->

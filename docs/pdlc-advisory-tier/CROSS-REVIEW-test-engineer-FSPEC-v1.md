# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` (v1.0)
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** testability, edge-case completeness, oracle falsifiability, and acceptance-test coverage of the FSPEC and its 68-test acceptance matrix. Every existing-behaviour claim (§2's B-1…B-16) re-verified at the pinned default-branch commit `26c3f1c`. Not product strategy, not architecture, not module placement.

## Verification Log

Every §2 baseline row re-read at `26c3f1c` (`git rev-parse main` → `26c3f1c5d68f…`, the commit REQ
BL-02 pins). `dev` = `pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`.

| Baseline | Checked at | Result |
|---|---|---|
| B-1 — three triage verdicts; `blocked` and `needs-human` both skip | `queue:653-668` (`triagePrompt` emits exactly `ready` / `blocked` / `needs-human`), `queue:907-921` (both branches `emit` + `skipped.push` + `continue`) | Confirmed |
| B-2 — pre-check one-sided | `queue:631-649`: `{blocked:true}` only for `match && match.status !== "done"`; comment at `:646` *"Dependency done, or not in the queue at all → inconclusive here; defer to triage"* | Confirmed |
| B-3 — no re-grounding obligation in the triage prompt | `queue:656-666`: the only staleness-adjacent line is `Also flag if the REQ references subsystems that do not yet exist` | Confirmed |
| B-4 — DoD capped at 3, third failing verify returns without remediating | `dev:25` (`DOD_MAX_ITERATIONS = 3`), `dev:6164`, `dev:6190-6191` (`if (iteration === maxIterations) return {passed:false,…}`) | Confirmed |
| B-5 — not-passed records ❌ and halts with finding counts | `dev:8179-8188` (`recordPhase("DOD",…"❌"…)` then `throw haltError(…)` with the stub/mock/unwired/coverage/req_gaps detail) | Confirmed |
| B-6 — step-0 rebase conflict records ❌ and halts, branch unchanged | `dev:8161-8172` (`if (rebaseStatus === "conflict") { recordPhase(…"❌"…); throw haltError(…) }`) | Confirmed |
| B-7 — PUB rollup: passed→success, failed→halt, completion cap halts, no-checks→pass | `dev:6250-6286`, all four arms present; `return { prUrl, ciStatus: "no-checks" }` at `:6284` | Confirmed |
| B-8 — the no-checks pass is reported on the phase row | `dev:8267-8271`, literal `no GHA checks detected within timeout (assumed none configured)` | Confirmed |
| B-9 — CI read mechanically, no agent in the loop | `dev:5812-5824` (`checkPrCi` shells `gh pr view … --json statusCheckRollup`), `dev:6245-6250` (script owns cadence) | Confirmed |
| B-10 — one constant per rung, all bare aliases | `dev:1578` `MODEL_DEFAULT = "opus"`, `dev:1621` `MODEL_IMPLEMENTATION = "sonnet"`, `queue:69` `MODEL_QUEUE = "sonnet"` | Confirmed |
| B-11 — named top-level sections, independently parsed, degrading to own defaults | `dev:43` (`MERGE_CONFIG_PATH`), `dev:101-152` (`parseMergeConfig` returns `MERGE_DEFAULTS` on null/unparseable), `dev:181-200` (`parseImplementationConfig`, its own `degraded()`) | Confirmed |
| B-12 — no tracked `.claude/pdlc.config.json`; the working-tree copy has an `implementation` section only | `git ls-tree 26c3f1c .claude/` → empty; working tree file carries `implementation` only, no `merge` | Confirmed |
| B-13 — `notices` channel; merge escalations under a frozen prefix carrying `ESCALATION:` | `dev:1319-1328` (`MERGE_ESCALATIONS` frozen, all four literals begin `MERGE ESCALATION:`), `dev:8291-8292`, `dev:8395`, `dev:8402` | Confirmed |
| B-14 — guard matches only `CROSS-REVIEW` / `CODE_REVIEW`, refuses without a sibling `LEARNINGS-*.md` | `guard-harvest-before-delete.sh:35` (token gate), `:43` (token regex), `:52-59` (`glob(… "LEARNINGS-*.md")` → `blocked`) | Confirmed |
| B-15 — tail order DOD → H → PUB → MERGE | `dev:8151`, `:8192`, `:8248`, `:8274` — the four phase banners in that order | Confirmed |
| B-16 — `docs/_queue/` holds `QUEUE.md` only | `ls docs/_queue/` | Confirmed |
| §14.3 — the traceability matrix it defers to exists | `docs/requirements/traceability-matrix.md` | Confirmed (present) |

One new code observation, which F-01 rests on: at `queue:890-897` a blocked pre-check `continue`s
**before** the triage dispatch at `queue:900-903`. A `needs-human` verdict therefore cannot coexist
with a blocked pre-check on the production path.

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

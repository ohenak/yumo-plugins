# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** testability of REQ-pdlc-advisory-tier v1.1 — black-box acceptance-criterion precision, edge-case completeness, falsifiability of the prohibitions. Not product strategy, not architecture.

## Verification Log

Every existing-behavior claim in the REQ, checked against HEAD (not against the master plan).

| REQ claim | Verified at | Result |
|---|---|---|
| `MODEL_DEFAULT`, `MODEL_IMPLEMENTATION`, `MODEL_QUEUE` exist as constants (AC-1.1) | `pdlc/workflows/orchestrate-dev.js:39`, `:40`; `pdlc/workflows/orchestrate-queue.js:64` | Confirmed. All three are **bare aliases** (`"opus"`, `"sonnet"`) — see F-04 |
| A1: Phase-0 triage returns `needs-human` → skip the candidate, try next (§1) | `pdlc/workflows/orchestrate-queue.js:596-604` (`continue` after pushing to `skipped`) | Confirmed |
| Triage verdict is parsed from a `TRIAGE:` trailer, defaulting to `needs-human` | `pdlc/workflows/orchestrate-queue.js:264-283` | Confirmed |
| A2: a distinct "stale-REQ re-grounding gate" exists | `pdlc/skills/orchestrate-queue/SKILL.md:135-144` — prose **inside the triage prompt**, emitting the same `TRIAGE: needs-human` verdict; no separate gate in the workflow script | **Partially false as stated** — see F-01 |
| A3: Phase DOD verify→remediate is capped at 3 iterations, then halts | `pdlc/workflows/orchestrate-dev.js:24` (`DOD_MAX_ITERATIONS = 3`), loop at `:1218-1261`, halt at `:1953-1961` | Confirmed |
| A4: `ship-pr` reports `REBASE_STATUS: conflict`; pipeline halts, branch unchanged | `pdlc/skills/ship-pr/SKILL.md:54-55`; parser `pdlc/workflows/orchestrate-dev.js:974-990`; halt `:1938-1946` | Confirmed |
| A5: Phase PUB CI red → pipeline halts | `pdlc/workflows/orchestrate-dev.js:1315-1317` (`haltError` on `status === "failed"`) | Confirmed |
| `ciStatus` is derived from the GHA rollup, not from an agent (AC-4.3) | `pdlc/workflows/orchestrate-dev.js:1280`, `:1308-1343` — `_checkCi(prUrl)`, no agent in the poll loop | Confirmed |
| Harvest deletes `CROSS-REVIEW-*` / `CODE_REVIEW-*` after LEARNINGS lands (AC-9.3) | `pdlc/skills/harvest-learnings/SKILL.md:27,33,95-100`; guard `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35,43` | Confirmed — but the guard's token regex matches **only** `CROSS-REVIEW`/`CODE_REVIEW`; `ADVISORY-*` is not covered. See F-07 |
| `REQ-MERGE-03` exists and defines self-modification paths (AC-3.4, NFR-5) | `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md:106` (AC-3.1 names `pdlc/workflows/` and `pdlc/skills/` as the two non-removable defaults) | Confirmed — citation is to a real authority. See Q-03 |
| `docs/_queue/ESCALATIONS.md` does not exist yet (BL-04) | `docs/_queue/` contains only `QUEUE.md` | Confirmed |
| Upstream `docs/design/MASTER-PLAN-engineering-loop.md` exists | present | Confirmed |

## Findings

## Questions

## Positive Observations

## Recommendation

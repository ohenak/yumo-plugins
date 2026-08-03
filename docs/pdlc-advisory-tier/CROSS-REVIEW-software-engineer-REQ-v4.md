# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** delta confirmation — the v1.4 erratum only (§1 A2 row; AC-1.7/NFR-4; AC-4.5/5.1/5.5; AC-8.2; AC-9.1/9.3). Unchanged sections approved at v3 were not re-read.

## Review base

Diffed `b81d7d4..HEAD` on the REQ — six erratum commits (`f3615f1`, `0f2ff3e`, `85f1003`,
`acf958e`, `468164a`, `728d987`), +25/−17, version 1.3 → 1.4. Every existing-behaviour claim the
erratum introduces was re-checked at the base the REQ pins, `26c3f1c`:

| Claim in the erratum text | Verified at `26c3f1c` |
|---|---|
| No stale-REQ re-grounding gate exists today (§1 A2 row) | `orchestrate-queue.js` `triagePrompt` — the full prompt body verifies declared-dependency presence, adds only "Also flag if the REQ references subsystems that do not yet exist", instructs "Do NOT modify any files", and offers three outcomes (`ready` / `blocked` / `needs-human`). No re-grounding obligation, no citation-freshness clause |
| The dependency pre-check is a pure function of `(dependsOn, entries)` and cannot differ on a re-run after an A1 verdict | `precheckDependencies` — no IO, no clock, first not-`done` row wins, else `{blocked:false}` |
| The CI completion cap exceeds the 10-minute seam budget, so the rollup carve-out is load-bearing | `orchestrate-dev.js:35` `CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000`; the no-checks window is 10 min (`:33`), poll interval 30 s (`:34`) |
| Phase MERGE runs after Phase PUB and merges the PR raised there | `PHASE_MERGE_ENABLED` declared at `orchestrate-dev.js:39` as "the last phase of the pipeline"; `decideMerge` observes the PR raised by PUB |

No `docs/_constraints/` or `docs/_decisions/` in this repo, so no standing constraint is engaged.
REQ↔FSPEC agreement was spot-checked on the two items where the FSPEC had deliberately diverged:
FSPEC `A5-3` ("act → push → re-poll", E-1 carve-out, rollup wait excluded) and `V-5` now say the
same thing as AC-8.2 and NFR-4.

## Disposition of the erratum items

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

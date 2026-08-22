# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.1, `b8ddcc56`)
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Review Basis

**There is no `CROSS-REVIEW-product-manager-PLAN-v1.md`.** The only round-1 PLAN review on this
branch is `CROSS-REVIEW-test-engineer-PLAN-v1.md`, and the PLAN's own `Cross-Reviews` metadata field
names exactly that one file. The delta protocol therefore has no product-lens baseline to diff
against: I have no prior findings of my own to check for resolution. This round is consequently a
**full first product pass** over PLAN v1.1, written to the v2 filename the dispatch pins so this
phase's round history stays keyed correctly.

Every claim below is grounded in the repository, not in the document. What I ran:

| PLAN claim | Verification | Result |
|---|---|---|
| §1.2 branch is 1,637 commits behind | `git rev-list --count HEAD..origin/main` | `1637` — exact |
| §1.2 mechanism absent here | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` — exact |
| §1.2 baseline file absent here, tracked at main | `ls docs/_constraints/`; `git ls-tree origin/main docs/_constraints/` | absent here; `pdlc-wave-gate-baseline.md` tracked at `origin/main` |
| §1.2 `test:coverage`/`c8`/`fast-check` absent here, present at main | `pdlc/workflows/package.json` in both trees | here: only `test`, `test:watch`. At main: `test:coverage` with `--per-file --branches 85`, `c8@^10.1.3`, `fast-check@^4.9.0` |
| §1.2 ignore rule verbatim, same block as `/.claude/workflows/` | `git show origin/main:.gitignore` | line 40 `/.claude/workflows/`, line 41 `/.claude/pdlc-wave-state.json` — exact |
| §1.2 new exports resolve nowhere | `classifyWaveLedger`, `RESUME_OUTCOMES` in `git show origin/main:pdlc/workflows/orchestrate-dev.js` | `0` occurrences each — exact |
| §2.1 harness occurrence counts 18 / 7 / 9 / 29 | `makeLedgerArgs`, `ledgerWrites`, `PLAN_THREE_WAVES`, `CONFIG_WITH_TEST_COMMAND` at main | 18, 7, 9, 29 — exact |
| §2.2 a red script-owned gate is a **halt** | `orchestrate-dev.js:15432` `if (scriptGate)` → `:15436` message → `throw haltError(testGateMessage, …)`; the in-source comment at `:15498` reads "halts the wave with its work uncommitted" | confirmed, including `M-WG-4`'s uncommitted-work consequence |
| §3.4 `implementation.testCommand` literal | `cat .claude/pdlc.config.json` | string-identical to §3.4's transcription, character for character |
| §3.4 / RK-2 config surface closed at four keys | `Object.keys(IMPLEMENTATION_DEFAULTS)` at main | `["testCommand","postWaveCommand","postWavePathspecs","startWave"]` — one *global* `postWaveCommand`, so RK-2's premise holds |
| §4.1 suite layout: one of six files exists | `git ls-tree origin/main pdlc/workflows/__tests__/`; `ls pdlc/workflows/__tests__/` | only `waveExecution.test.js` exists (2,761 lines at main); the other five match nothing in either tree, and every task row naming one declares it *(new)* |
| §4.3 / RK-3 module size 734,711 B, §4.5.1 16,336 lines | `git show origin/main:pdlc/workflows/orchestrate-dev.js \| wc -lc` | `16336  734711` — both exact |
| T-08's `numRuns: 500` precedent | `advisoryHelperProperties.test.js:260-261` at main | `describe("PROP-CTR-05 (generative): …")` with `const runs = { numRuns: 500 }` — exact |
| T-03's promotion target state | `git show origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` | `Version 1.2 · 2026-08-20`, sections through `## 4`, ids through `M-WG-14` — exactly what §2.1 predicts, so `## 5` / `1.3` / `M-WVR-1..2` is right |

**§4.6's parse verification reproduced independently.** I ran the shipped parsers from
`git show origin/main:pdlc/workflows/orchestrate-dev.js` over this PLAN's bytes rather than trusting
the table:

- `parsePlanTasks` → 7 tasks, `warnings: undefined`, dependencies `[] / [T-01] / [T-01] / [T-01] / [T-02] / [T-02] / [T-07,T-08,T-03,T-04]`
- `computeTopologicalBatches` → `[[T-01],[T-02,T-03,T-04],[T-07,T-08],[T-10]]`
- `parsePlanOwnership` → 7 rows, one per task, **`nearMisses: []`**
- `computeWaves` → `[[T-01],[T-02,T-03,T-04],[T-07,T-08],[T-10]]`, ownership-disjoint

Every one matches §4.6 exactly. Phase P's converged-PLAN self-parse will pass.

**Set-equality checks over the enumerated contracts this PLAN claims to close:**

- FSPEC acceptance tests are exactly `AT-01 … AT-18` (18). §4.1 names all eighteen plus `P-1 … P-4`; the sets are equal, with no extra and no omission.
- TSPEC §1.2 delta rows are exactly `D-1 … D-11`. §1.1's table names all eleven with an owning task; the sets are equal.
- FSPEC §2 traces `FSPEC-WVR-01 … -07` onto `REQ-WVR-01 … -10`, all ten covered. Since §4.1 covers every AT, every P0 and P1 requirement — `REQ-WVR-01/02/03/04/09` (P0) and `-05/06/08/10` (P1) — has an owning task. `REQ-WVR-07` (P2) is owned by T-04. **No P0 or P1 requirement is silently dropped.**

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

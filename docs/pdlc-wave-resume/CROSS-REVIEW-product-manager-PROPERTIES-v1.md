# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding

Every shipped-behaviour claim this document makes was re-checked against the repository rather than
read back out of the document. All of them hold:

| PROPERTIES claim | Check run | Result |
|---|---|---|
| `git rev-list --count HEAD..origin/main` = `1637` | same command | `1637` — holds |
| `WAVE_STATE_PATH` absent from this tree's `orchestrate-dev.js` | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` — holds |
| `WAVE_STATE_PATH` exported at `origin/main` | `git show origin/main:pdlc/workflows/orchestrate-dev.js` → `export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` | holds |
| `parseWaveLedger` exported at `origin/main` | same file, `export function parseWaveLedger(text)` | holds |
| ignore rule exists only at `origin/main` | `git show origin/main:.gitignore` → line `/.claude/pdlc-wave-state.json` | holds (root-anchored, as PROP-REPO-01 requires) |
| `c8 ^10.1.3`, `fast-check ^4.9.0`, `test:coverage` at `origin/main`, absent in tree | `git show origin/main:pdlc/workflows/package.json` vs tree manifest | holds; the `test:coverage` script does carry `--per-file --branches 85` |
| `IMPLEMENTATION_DEFAULTS` has exactly the four keys PROP-OVERRIDE-04 transcribes | `origin/main` `export const IMPLEMENTATION_DEFAULTS = Object.freeze({ testCommand, postWaveCommand, postWavePathspecs, startWave })` | holds — set-equality literal is correct |
| `waveExecution.test.js` is 2,761 lines at `origin/main` | `git show … | wc -l` | `2761` — holds |
| harness helpers reusable | `function makeLedgerArgs({`, `const ledgerWrites =`, `const PLAN_THREE_WAVES = [`, `const CONFIG_WITH_TEST_COMMAND =` all resolve at `origin/main` | holds |
| the five new test files do not exist | none resolves under `pdlc/workflows/__tests__/` in tree or at `origin/main` | holds |
| baseline doc is at `Version 1.2 · 2026-08-20`, sections through `## 4`, ids through `M-WG-14` | `git show origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` | holds; file is absent in this tree, exactly as the document says |
| `numRuns: 500` precedent | `advisoryHelperProperties.test.js` at `origin/main`: `describe("PROP-CTR-05 (generative): …")` declares `const runs = { numRuns: 500 }`, applied at five `fc.assert` sites | holds |
| shipped announcement strings quoted | `Resuming at wave …`, `waves 1–… already green`, `All … waves complete (wave mode,`, `recorded green (wave ledger)` all resolve at `origin/main` | holds, including the U+2013 en-dash R-1 warns about |

**PLAN task coverage.** The PLAN's task table lists exactly `T-01, T-02, T-03, T-04, T-07, T-08,
T-10`; PROPERTIES' "PLAN tasks → properties" table carries one row per task, all seven, with no
extra and no missing row. `T-05`/`T-06`/`T-09` are retired ids (PLAN v1.1 change log), and
PROPERTIES says so rather than leaving a reader to wonder. Every named test file either exists at
`origin/main` (`waveExecution.test.js`) or is declared new by the PLAN row that owns it.

**AT / BR / EC coverage.** All eighteen FSPEC ATs (AT-01…AT-18) appear in the AT matrix; all
seventeen business rules BR-01…BR-17 appear in the BR matrix; the EC matrix covers EC-01…EC-21
with EC-17/EC-18/EC-19 explicitly parked. All ten REQ-WVR ids appear in the REQ matrix. That is a
better traceability posture than most PROPERTIES documents reach on iteration 1, and the findings
below are about three specific seams in it, not about its overall shape.

## Findings

## Questions

## Positive Observations

## Recommendation


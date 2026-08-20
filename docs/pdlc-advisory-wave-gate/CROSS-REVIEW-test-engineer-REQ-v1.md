# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.11)
**Date:** 2026-08-20
**Iteration:** 1

## Verification Basis

Every code path and existing-behaviour claim the REQ names was re-run against the working tree at
HEAD of `feat-pdlc-advisory-wave-gate`, not taken from the document. Anchors below are symbol- or
content-anchored per DEC-DOC-01.

| REQ claim | Site verified | Result |
|---|---|---|
| AC-1.1 / AC-3.1 — catalogue gains a sixth seam and two envelope members | `ADVISORY_SEAMS` and `ENVELOPE_DEFAULTS` in `pdlc/workflows/orchestrate-dev.js` | Holds. Both frozen literals now carry six members (`A1`…`A6`; `E-1`…`E-6`) |
| AC-2.2 — closed, ordered four-class root-cause set | `ADVISORY_ROOT_CAUSES` | Holds. Exactly `plan-ordering-defect`, `wave-internal-defect`, `environmental`, `unclassified`, in the REQ's order |
| AC-2.2 — receiving side is total, out-of-set reads as `unclassified` | the `ADVISORY_ROOT_CAUSES.includes(value) ? value : "unclassified"` normaliser | Holds |
| AC-3.3 — the four added exclusions (f)–(i) | `A6_PROHIBITIONS` (`["f","g","h","i"]`) | Holds |
| AC-3.4 — the refusal-reason set stays at eight and A6 adds no ninth | `ADVISORY_REFUSAL_REASONS` | Holds. Eight members; no A6-specific addition |
| C-2 — shipped defaults `attemptBudget: 3`, `seamBudgetMinutes: 10`, `waveBudgetPerRun: 1` | the advisory defaults literal | Holds for all three |
| AC-4.4 — one gate-sequence implementation shared by first pass and re-gate; ordered `invocations` | `runWaveGateSequence` | Holds. Pushes `"post-wave"` / `"test"` immediately before each `runCommandFn`, so the ordered-sequence oracle is observable and truncates at the first failing command |
| AC-1.2 — post-wave command runs once, failure halts immediately | `runWaveGateSequence`'s `failed: "post-wave"` early return and the wave loop's `haltError` on it | Claim holds; **the REQ's line anchor for it does not** — see F-02 |
| M-WG-3 — script-owned gate gated on both a test command and a transport | the `scriptGate` computation and its `if (scriptGate)` branches in the wave loop | Holds |
| M-WG-12 / AC-4.6 — per-wave commit covers only this wave's owned paths | `groupPromotedPaths`, which filters repair paths to those a **later** wave's `task.files` own | Holds, and is the mechanism O-8 anticipated |
| §1 — the wave ledger exists but is untracked and ignored | `WAVE_STATE_PATH` / `parseWaveLedger`; `.gitignore` carries `/.claude/pdlc-wave-state.json`; `.claude/pdlc-wave-state.json` is present on disk and reported by no `git status` entry | Holds exactly as v1.11 re-measured it. The v1.11 changelog's correction of v1.10 is the accurate one |
| M-WG-6 — no Phase I approval skip | `FORCE_PHASE_TOKENS`, a frozen six-member list carrying no `I` | Holds |
| C-5 — REQ inside the size budget | `pdlc/hooks/scripts/check-req-size.sh` (`LINE_LIMIT=700`, `BYTE_LIMIT=61440`) vs. the document at 636 lines / ~51 KB | Holds, with headroom |

## Findings

## Questions

## Positive Observations

## Recommendation


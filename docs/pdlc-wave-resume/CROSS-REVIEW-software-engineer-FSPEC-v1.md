# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** technical lens — feasibility, implementability, completeness of failure paths, grounding of claims about existing behaviour.

## Grounding Note

This authoring tree does not contain the mechanism under specification — re-verified, not taken
from the FSPEC: `git rev-list --count origin/main ^HEAD` → **1637**, `git grep WAVE_STATE_PATH
HEAD -- pdlc/workflows/orchestrate-dev.js` → no hits, and
`docs/_constraints/pdlc-wave-gate-baseline.md` does not exist at `HEAD`. So does
`docs/_decisions/DECISIONS-review-severity-bars.md`'s `DEC-DOC-01`: absent here, applied anyway.
Every code claim below is therefore verified against `origin/main` and cited by symbol first,
line second, exactly as the FSPEC does.

I checked every positional anchor the FSPEC's §1 table asserts. **All eight verify**, which is
worth recording because they are anchors into a revision this branch cannot see:

| FSPEC claim | Verification run here | Result |
|---|---|---|
| `WAVE_STATE_PATH` at `orchestrate-dev.js:12214` | `git show origin/main:… \| sed -n 12214p` | `export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` ✓ |
| `.gitignore:41` root-anchored rule, rationale at `:24-32` | `git show origin/main:.gitignore \| sed -n 24,42p` | `:41` is `/.claude/pdlc-wave-state.json`; anchoring rationale at `:30-33` ✓ (rationale span is off by ~2 lines, immaterial) |
| `parseWaveLedger` at `:12267` | same | `export function parseWaveLedger(text) {` ✓ |
| write guarded by git transport, `if (waveGit)` at `:15531`, write at `:15600` | same | `if (waveGit) {` under `// Only now — verified — does anything get committed (M-6).`; `await writeWaveLedger(` at `:15600`, inside it ✓ — and a **sibling** of the gate-mode branch, so the FSPEC's and REQ-WVR-09's transport-not-gate-mode reading is correct |
| `explicitPointer` at `:15236`, above the clamp at `:15237-15244` | same | `const explicitPointer = startWave > 1;` then `if (startWave > waves.length)` ✓ |
| retention comment at `:15607-15615` | same | `// Every implementation wave is green and committed. The record is KEPT —` … `if (allWavesRecorded) {` ✓ |
| queue delegates in-process, `orchestrate-queue.js:45` | same | `import realMain, { … } from "./orchestrate-dev.js";` ✓ |
| wave-ledger describe block, `waveExecution.test.js:2239` | same | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended", …` ✓ |

Two further checks the FSPEC does not claim but its clauses depend on, both run against
`origin/main`:

- **§3.2's ordering ratifies the shipped order.** The reader's `else if` chain is
  `ledger.reason` → `feature` → `planHash` → `headCorroborated` → `lastGreenWave > waves.length`
  (`orchestrate-dev.js:15297-15317`). That is exactly §3.2's questions 2→3→4→5→6. Good — but see
  F-04: it is *not* REQ-WVR-02's enumeration order, and the FSPEC never says so.
- **Per-wave skip announcements exist and name their source.** `Wave N/M: skipped (wave ledger…|
  implementation.startWave=…)` at `orchestrate-dev.js:15373-15381`, so §3.1's D-6 ("individually
  announced … naming which source skipped it") and AT-01 are implementable as written, not just
  aspirational. `if (allWavesRecorded) break;` at `:15372` discharges BR-11's "dispatches nothing".

## Findings

(pending)

## Questions

(pending)

## Positive Observations

(pending)

## Recommendation

(pending)

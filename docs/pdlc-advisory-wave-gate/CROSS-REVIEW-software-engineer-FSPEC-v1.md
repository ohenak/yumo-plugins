# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.0, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 1
**Scope:** Full technical review — feasibility, implementability, oracle quality, and verification of
every existing-code claim the document rests on. Reviewed on `feat-pdlc-advisory-wave-gate`.

## Claims Verified Against HEAD

Every shipped-behaviour claim this FSPEC rests on was re-measured on this branch rather than taken
from the baseline's (known-drifted) line recipes.

| Claim | FSPEC site | Verified at HEAD |
|---|---|---|
| Post-wave command runs **before** the test gate; its failure halts immediately | §3.1, BR-1, BR-7 | `pdlc/workflows/orchestrate-dev.js:14347-14369` — post-wave `throw haltError` at `:14351`, gate at `:14360` |
| Dispatch failure ends the wave before either command | §3.1, BR-1 | `evaluateWaveDispatch(...)` at `pdlc/workflows/orchestrate-dev.js:14338` |
| Nothing commits until past a green gate; two writers only | BR-8, AT-04-3 | `pdlc/workflows/orchestrate-dev.js:14396-14426` — per-task `commitPaths` over `task.files`, then the conditional post-wave-pathspec commit |
| The wave commit loop covers only tasks **in that wave** (M-WG-12) | BR-12 | same loop, `for (const task of wave)` at `:14397` — a later task's paths have no writer |
| Envelope ships four members | BR-4, AT-03-1 | `ENVELOPE_DEFAULTS = ["E-1","E-2","E-3","E-4"]`, `orchestrate-dev.js:1938` |
| Seam catalogue ships five members | AT-01-1 | `ADVISORY_SEAMS = ["A1"…"A5"]`, `orchestrate-dev.js:1947` |
| Refusal-reason catalogue is a frozen ordered eight | BR-15, AT-03-7 | `ADVISORY_REFUSAL_REASONS`, `orchestrate-dev.js:2297-2306` |
| Exclusions precede permissions and are evaluated in order | BR-5 | `classifyEnvelope` iterates `ADVISORY_EXCLUSIONS` before returning `inside: true`, `orchestrate-dev.js:2411-2443` |
| Guard paths refuse `out-of-envelope` | E-15, AT-03-3 | X-e arm, `orchestrate-dev.js:2420-2424` |
| A partly-outside proposal is refused whole | E-16, AT-03-6 | X-d arm refuses on any non-member path, `orchestrate-dev.js:2425-2430` |
| Confidence gate is `!== "high"` ⇒ `low-confidence` | §3.2 step 5 | `orchestrate-dev.js:3512-3514` |
| A disabled tier's report omits the key entirely | E-01, AT-01-4 | conditional spread `...(advisory ? { advisory } : {})` in `buildFinalReport`; callers pass `undefined` at `:15002`, `:15035`. **The FSPEC's "absent, not present-and-undefined" is correct at HEAD** — the shipped `expect(result.advisory).toBeUndefined()` (`__tests__/advisoryDisabled.test.js:554`) is satisfied by absence, so AT-01-4 tightens the oracle without changing disabled-tier behaviour |
| Budget keys `attemptBudget` (3) and `seamBudgetMinutes` (10) already ship | BR-11 | `ADVISORY_DEFAULTS`, `orchestrate-dev.js:1940-1945` |
| `resolveAdvisoryRung` is exported and is the one ladder | AT-07-4 | corpus baseline §3; `MODEL_ADVISORY`/`MODEL_ADVISORY_FALLBACK` at `orchestrate-dev.js:1930-1931` |

Two claims did **not** check out as the FSPEC frames them; they are F-01 and F-02 below.

## Findings

## Questions

## Positive Observations

## Recommendation


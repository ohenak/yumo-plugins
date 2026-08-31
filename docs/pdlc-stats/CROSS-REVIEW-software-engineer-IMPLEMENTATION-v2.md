# Cross-Review: software-engineer — Implementation (Wave 1 gate diagnosis, delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** Wave 1 output of pdlc-stats (`pdlc/workflows/__tests__/statsPreflight.test.js`, `pdlc/workflows/__tests__/helpers/statsDoubles.js`, PLAN T-01 status flip) against the captured full-suite run
**Date:** 2026-08-31
**Iteration:** 2
**Scope:** Local (per-finding tags below)

Delta re-review of `CROSS-REVIEW-software-engineer-IMPLEMENTATION-v1.md`. Every anchor was re-verified at the current working tree: no v1 finding has been resolved, and no new material has landed since v1 (`statsPreflight.test.js` is still untracked and byte-identical in its failing import; the census oracle and the local config are unchanged). The gate therefore reds for exactly the same three reasons v1 documented. Unchanged sections are not re-litigated; the findings below restate the open items with re-verified evidence only.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **Open (unresolved from v1 F-01).** `statsPreflight.test.js:1` still reads `import { describe, it, expect } from "vitest"`; the workflows suite runs under jest and `vitest` is absent from `pdlc/workflows/package.json` (grep re-verified: zero hits), so jest aborts the suite at module resolution — `Cannot find module 'vitest' from '__tests__/statsPreflight.test.js'`. Direct cause of the T-01 suite red. Fix unchanged: drop the import and use jest's injected globals (every sibling suite does), or import from `@jest/globals`. | `pdlc/workflows/__tests__/statsPreflight.test.js:1` |
| F-02 | High | Local | **Open (unresolved from v1 F-02).** `documentOracles.test.js:420` still pins the census at `expect(count).toBe(102)` and the namespace filter at `:413-419` still lacks a `stats` exclusion, so the new file makes the count 103 and AT-1.3 reds. Fix unchanged, per the oracle's own cite-and-reuse precedent: add `!name.startsWith("stats")` with a one-line comment citing pdlc-stats PLAN §2 (which owns the `stats*.test.js` census) — do not re-pin the literal, which the comment at `:403` explicitly rejects. One exclusion covers T-01 and all later `stats*` waves. | `pdlc/workflows/__tests__/documentOracles.test.js:413-420` |
| F-03 | Medium | Process | **Open, inherited/environmental — not Wave 1's delta and not gating this wave.** `.claude/pdlc.config.json` is git-ignored and untracked; the local copy still carries the prepended engine leg `(cd pdlc/engine && npm test) && …` (re-verified at config line 10), while `waveResumePreflight.test.js:45-46` pins the canonical workflows-only string from pdlc-wave-resume §3.4. Same red would appear on a clean pre-wave checkout of this machine; CI supplies the canonical command and stays green. Remediation remains operator-side: restore `implementation.testCommand` to the pinned string (the engine leg is already the separate required `Engine tests (ubuntu-latest)` CI check). Do **not** route to se-implement as pdlc-stats work. | `pdlc/workflows/__tests__/waveResumePreflight.test.js:45-46,138`; `.claude/pdlc.config.json:10` |
| F-04 | Low | Local | **Open (carried).** Jest's "worker process failed to exit gracefully" leak warning persists in the captured run; still most plausibly downstream of the F-01 resolution abort. Re-check only after F-01/F-02 land. | run summary (runtime-measured evidence) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v1, still unanswered: PLAN shows T-01 flipped ✅ while T-02's `statsDoubles.js` is on disk with T-02 still ⬚ — was the helper intentionally pre-staged, and should its status row move when the wave re-runs? |

## Positive Observations

- The blast radius is still exactly the two delta reds; the engine suite, the 891-test node:test block, and all 152 other jest suites remain green.
- The T-01 test body (beyond the import line) and `helpers/statsDoubles.js` remain conformant with PLAN's prescriptions as documented in v1; no regression was introduced between rounds.

## Recommendation

**Needs revision**

Both v1 High findings remain open and both fixes are one-line mechanical edits: (1) replace the `vitest` import with jest globals in `statsPreflight.test.js:1`; (2) add `!name.startsWith("stats")` to `documentOracles.test.js:413-419` citing PLAN §2. F-03 stays an operator-environment fix outside the feature's remediation dispatch.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}

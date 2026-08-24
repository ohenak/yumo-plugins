# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the shipped diff `main...feat-pdlc-wave-resume`
**Date:** 2026-08-24
**Iteration:** 1

## Scope and method

**Note on the file name.** The task names `…-REVIEW-v1.md` as this round's path. A
`CROSS-REVIEW-product-manager-REVIEW-v2.md` already exists on this branch (committed `9c415a75`…`97e783ca`)
with no v1 beneath it. I have written to the mandated v1 path and, per the tag-selection discipline,
reconciled my Scope tags against that file's findings rather than shipping conflicting tags for the
same defect. The overlap is called out per finding.

Product lens only. Method:

- Read `REQ-pdlc-wave-resume.md` §7 (REQ-WVR-01 … REQ-WVR-10) and `FSPEC` §6 (AT-01 … AT-18) first,
  then the shipped diff `main...feat-pdlc-wave-resume` (91 files, +21778/-297).
- For every AC claiming an operator-visible artifact, traced **AC → production caller → test that
  drives that caller**, not to a builder's own unit test.
- Ran the feature's suites to ground every claim about behaviour:
  `npm --prefix pdlc/workflows test -- __tests__/waveResume __tests__/waveExecution.test.js` →
  **6 suites, 177 tests, all passing**.
- Checked runtime drift: `node pdlc/workflows/build-runtime.mjs --check` → `in-sync`, exit 0. The
  generated `pdlc/workflows/dist/pdlc-cli.mjs` was rebuilt in the same feature branch as the source
  change, per this repo's standing rule.

**Production wiring — checked, and clean.** Every new export is reached from `main()`, not only from
tests:

| New seam | Production caller |
|---|---|
| `classifyWaveLedger` | `pdlc/workflows/orchestrate-dev.js:16266` (inside `main()`'s Phase I ledger branch) |
| `computePlanHash` | `orchestrate-dev.js:16227` |
| `parseWaveLedger` | `orchestrate-dev.js:16232` |
| `ANCESTRY_INDEPENDENT_CODES` | `orchestrate-dev.js:16272` (the lazy-probe short-circuit) |
| `WAVE_IGNORE_REASONS` / `PARSE_REASON_CODES` | inside `classifyWaveLedger`, `orchestrate-dev.js:12942`ff |
| `formatWaveLedger` / `writeWaveLedger` | `orchestrate-dev.js:16577`, inside the wave loop's `if (waveGit)` block |

There is **no zero-caller seam** in this feature and no dead config. The behavioural ACs are driven
through `main()` in `waveExecution.test.js` (96 `main(` call sites), not through the classifier alone
— the new `waveResume*.test.js` modules are deliberately unit-level and are the *supplement* to that
integration coverage, not a substitute for it. That is the right shape and I want to say so before
the findings.

## Requirement-by-requirement trace

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_

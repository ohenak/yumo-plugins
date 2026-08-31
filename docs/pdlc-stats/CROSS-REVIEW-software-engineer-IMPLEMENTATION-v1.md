# Cross-Review: software-engineer — Implementation (Wave 1 gate diagnosis)

**Reviewer:** software-engineer
**Document reviewed:** Wave 1 output of pdlc-stats (`pdlc/workflows/__tests__/statsPreflight.test.js`, `pdlc/workflows/__tests__/helpers/statsDoubles.js`, PLAN T-01 status flip) against the captured full-suite run
**Date:** 2026-08-31
**Iteration:** 1
**Scope:** Local (per-finding tags below)

The captured run reds on exactly three suites: `statsPreflight.test.js`, `documentOracles.test.js`, and `waveResumePreflight.test.js` (3 failed suites, 152 passed; the 891-test node:test block and the engine suite are green). Two of the three are delta — introduced by Wave 1's new test file. One is environmental and predates the wave.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `statsPreflight.test.js:1` opens with `import { describe, it, expect } from "vitest"`, but the workflows suite runs under **jest** (`pdlc/workflows/package.json:7` — `node --experimental-vm-modules …/jest.js`; PLAN "Verification" table row: `cd pdlc/workflows && npm test` → jest). `vitest` is not a dependency of the package, so jest fails module resolution before any test runs: `Cannot find module 'vitest' from '__tests__/statsPreflight.test.js'`. This is the direct cause of the T-01 suite red. Fix: delete the import and use jest's injected globals (every sibling suite in `__tests__/` does this), or import from `@jest/globals`. The helper `helpers/statsDoubles.js` is clean (plain `node:fs`, no runner import) and is excluded from the test glob anyway. | `pdlc/workflows/__tests__/statsPreflight.test.js:1` |
| F-02 | High | Local | `documentOracles.test.js:420` pins the post-retirement-sweep test-file census at **102**, filtering only the reserved namespaces whose PLANs own their own census (`learnings*`, `waveResume*`, `loop*`, `escalationView*` — `documentOracles.test.js:413-419`). Wave 1's new `statsPreflight.test.js` matches none of those prefixes, so the count becomes 103 and AT-1.3 reds. This feature ships its suites under a `stats*.test.js` namespace (PLAN §2 file-ownership table, T-01…T-04 rows) with the PLAN manifest owning their census — exactly the precedent the oracle's own comment block cites four times. **Cite-and-reuse the shipped precedent**: add `!name.startsWith("stats")` to the filter with a one-line comment citing pdlc-stats' PLAN §2, rather than re-pinning the literal per wave (the comment at `documentOracles.test.js:403` explicitly rejects re-pinning). Note `statsPreflight.test.js` itself starts with `stats`, so the one exclusion covers T-01 and every later `stats*` suite; no second touch of this oracle is needed in later waves. | `pdlc/workflows/__tests__/documentOracles.test.js:413-420` |
| F-03 | Medium | Process | The `waveResumePreflight.test.js:138` failure is **inherited/environmental, not Wave 1's delta**. `.claude/pdlc.config.json` is git-ignored (`.gitignore:7`) and was removed from tracking at `f5ce04dc2` (pdlc 0.23.0); the copy on this machine carries a locally prepended engine leg — `(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test …` — while the run-precondition pin (`waveResumePreflight.test.js:45-46`, from pdlc-wave-resume §3.4) expects the canonical workflows-only string. Neither Wave 1 file touches this config; the same red would appear on a clean pre-wave checkout of this machine, and CI (which supplies the canonical command) stays green. This is the known local-file failure mode CLAUDE.md's debugging note warns about for document oracles, now appearing on a config pin. Remediation is operator-side: restore `implementation.testCommand` to the pinned string (the engine leg is already a separate required CI check, `Engine tests (ubuntu-latest)`, so nothing is lost). Widening the pin itself would be a pdlc-wave-resume PLAN change — out of this feature's scope. Do **not** route this to se-implement as pdlc-stats work. | `.gitignore:7`; `pdlc/workflows/__tests__/waveResumePreflight.test.js:45-46,138` |
| F-04 | Low | Local | The run ends with jest's "worker process has failed to exit gracefully … likely caused by tests leaking" warning. This most plausibly follows from the resolution-failure abort in F-01 and should be re-checked only after F-01/F-02 land; not independently actionable now. | run summary (runtime-measured evidence) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PLAN's status column shows T-01 flipped to ✅ while T-02's `statsDoubles.js` is also on disk but T-02 remains ⬚ — did Wave 1's dispatch intentionally pre-stage the T-02 helper, or should its status row move with it when the wave is re-run? |

## Positive Observations

- The T-01 test body itself is exactly what PLAN prescribes: existence-only assertions on the four driver classifiers and `resolveWorkflowRoot` on `../../engine/lib/run.mjs` (not `cli.mjs`'s export surface), matching the PLAN row's verified-at-HEAD note verbatim.
- `helpers/statsDoubles.js` follows the fake-first discipline: four read seams, no write member, `lstatSync` (never `statSync`) in the real-path twin — consistent with the T-10 equivalence conjunct it will feed.
- The engine suite, the 891-test node:test block, and all 152 other jest suites are green; the blast radius of Wave 1 is exactly the two delta reds named above.

## Recommendation

**Needs revision**

Two High findings, both cheap and mechanical: (1) replace the `vitest` import with jest globals in `statsPreflight.test.js`; (2) add the `stats` namespace exclusion to `documentOracles.test.js:413-419` citing PLAN §2, per the four-feature precedent already documented inside that oracle. F-03 is an operator-environment fix (restore the git-ignored local `.claude/pdlc.config.json` testCommand to the §3.4 canonical string) and must not be batched into the feature's remediation dispatch.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}

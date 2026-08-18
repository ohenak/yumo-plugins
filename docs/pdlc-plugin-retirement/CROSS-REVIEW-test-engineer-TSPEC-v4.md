# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.4)
**Date:** 2026-08-17
**Iteration:** 4
**Scope:** delta re-review. v3's five findings checked for resolution; only what changed between `d81bc3df` and HEAD scanned for new issues (§2.6 helper paragraph, §3.2 row 4b, §4.4 re-home widening, §5.2 TT-1b / TT-3(b) / AT-3.3, §5.5 no-orphan paragraph, §6.1 erratum 8). Unchanged sections not re-litigated.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **§5.5's new no-orphan oracle is red by construction against live suite infrastructure.** The paragraph specifies that after the sweep "**every** file under `pdlc/workflows/__tests__/helpers/` is imported by at least one surviving module". Two helpers have *no* test-module importer today and will have none post-sweep, because they are wired through Jest configuration rather than through imports: `pdlc/workflows/package.json:37`–`:38` declares `"globalSetup": "<rootDir>/__tests__/helpers/skipSinkSetup.js"` and `"globalTeardown": "<rootDir>/__tests__/helpers/skipSinkTeardown.js"`. Measured: `skipSinkSetup.js` has zero occurrences anywhere under `__tests__/*.test.js`; `skipSinkTeardown.js` has exactly one, `driftHelpers.test.js:108`, and it is a comment (`// globalTeardown (helpers/skipSinkTeardown.js) …`) inside a module M-8 deletes. Both files are live — they import `./skipSink.js` and `./driftCapabilities.js` (`skipSinkSetup.js:11`, `skipSinkTeardown.js:12`–`:13`) and drive the skip-sink inventory the suite depends on. As written the assertion fails on the very first green run, and an implementer coding to it has only two exits: delete two files the harness needs, or silently deviate from the spec. Fix: define the consumer relation as "imported by a surviving module **or referenced by `pdlc/workflows/package.json`'s Jest `globalSetup`/`globalTeardown`/`setupFiles*` keys**", and say so in the oracle text rather than leaving the implementer to discover the carve-out at RED. | §5.5 |
| F-02 | Medium | Local | **The same oracle's derivation is text-grep-shaped, so a comment can green an orphan.** "Re-derived by grepping the surviving `__tests__` tree" is satisfied by any textual occurrence of a helper's name. `driftHelpers.test.js:108` is the live proof that helper names appear in prose comments as well as in import specifiers; `documentOracles.test.js:12` is a second (a comment naming `./helpers/driftCapabilities.js` beside the real import at `:54`). A helper that lost its last real importer but is still mentioned in a comment would pass. Specify the match as an **import specifier** (`from "./helpers/<name>.js"` / `new URL("./helpers/<name>.js", …)`), not a bare name grep — otherwise the oracle is weaker than the prose it replaces. | §5.5 |
| F-03 | Medium | Local | **TT-1b's root-conditional skip collides with §5.5's own no-skip rule, and the collision is unstated.** TT-1b is "skipped when the test runs as root", while the paragraph directly above it in the same section says "No `skip`, no pending marker … AT-1.3 asserts this repo-wide, not only over M-8's modules: a skip introduced in a *surviving* module during the sweep is the same defect". TT-1b's host (`consumerCleanup.test.js`) is a module the sweep introduces, so under a root runner the sweep's own new test registers exactly the marker AT-1.3 is written to catch. The repo already has the mechanism to reconcile this — `itOrSkip` / `SKIP_INVENTORY` from `helpers/driftCapabilities.js`, used by `skipSinkTransport.test.js:47` and `documentOracles.test.js:54`. State which side wins: either TT-1b's skip is registered through the skip sink and AT-1.3's clause reads "unregistered skip", or the gate runner is pinned non-root and the skip is unreachable there. | §5.2 TT-1b, §5.5 |

## Questions

## Positive Observations

## Recommendation


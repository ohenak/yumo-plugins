# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.5)
**Date:** 2026-08-17
**Iteration:** 5

**Scope:** delta re-review. v4's three findings checked for resolution; only the sections changed
between `22f559bb` and HEAD (`92ae9145`) were scanned for new issues — §2.6's config-wired
carve-out paragraph, §5.2's TT-1b sentence, §5.5 in full, §6.1 erratum 8's routing note.
Unchanged sections are not re-litigated.

## v4 findings — disposition

| v4 ID | Disposition | Evidence |
|---|---|---|
| F-01 (High) — helper no-orphan oracle reds against live infrastructure | **Resolved** | §5.5 now carries a second wiring channel: `globalSetup` / `globalTeardown` read out of `pdlc/workflows/package.json` (`:37`–`:38` name `__tests__/helpers/skipSinkSetup.js` / `skipSinkTeardown.js`), re-derived at assertion time rather than transcribed. I re-ran the oracle over a simulated post-sweep tree (21 deleted `*.test.js` modules per §4.4, four deleted helpers, plus the new `consumerCleanup.test.js` importing `freshClone.js`): every surviving `helpers/*.js` is satisfied by channel (a) except `skipSinkSetup.js` / `skipSinkTeardown.js`, which channel (b) covers. Green-constructible. |
| F-02 (Medium) — grep matched bare names, so a stale comment satisfied it | **Resolved** | §5.5 scope rule 2 matches specifier forms (`"./helpers/<name>.js"` in import/require position, `new URL(...)`) and channel (b) compares resolved paths. `driftHelpers.test.js:108`'s comment mention of `skipSinkTeardown.js` no longer satisfies the universal. |
| F-03 (Medium) — TT-1b's skip collided with §5.5's own no-skip rule | **Partly resolved; the collision is now stated but the resolving oracle is not implementable as written** — see F-01/F-02 below. The mechanism cited is real (`itOrSkip` at `helpers/driftCapabilities.js:324`, `SKIP_INVENTORY` at `:93`, used by `skipSinkTransport.test.js:47` and `documentOracles.test.js:54`, both sweep survivors), and the inventory is extensible (no oracle pins it to a spec enumeration). What is missing is the join between jest's pending set and the sink, and the upstream routing of the narrowed clause. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

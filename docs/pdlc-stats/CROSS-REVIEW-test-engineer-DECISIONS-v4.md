# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 4

## Scope

Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v3.md`. Diffed `f81dfe362..HEAD` on the
document (nine commits, +104/−48). I checked the disposition of v3's four findings, then scanned only
the changed sections — the v1.3 changelog header, DEC-STATS-01's option table, the site table, *What
the sweep found*, the corrected B/C cost paragraph, the durable-lesson paragraph, the re-evaluation
trigger, DEC-STATS-02's trigger, K-1/K-3/K-8/K-9 and *Standing costs accepted* — for new issues.
Unchanged sections already approved in v1–v3 are not re-litigated.

Every claim below was re-measured against HEAD by running the commands the document cites, not read
off the document.

## v3 findings disposition

| v3 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | Medium | **Resolved, and past what I asked for** | I asked for a seventh row (`coverageInstrumentation.test.js`) and for the six-vs-seven gap to be declared. The revision instead replaced hand-reading with a grep-derived set and found two further sites I had not seen — `run.test.js` and `learningsPremises.test.js`. Both verified: `run.test.js:117` and `:269` are `assert.deepEqual` over the sorted four-name manifest, `:249-256` copies the same four names into the scratch tree, and `learningsPremises.test.js:78-91` is `expect(names).toEqual([…])` over `MODULE_NAMES` parsed out of `prepack.mjs`'s source, with the count in its title (*"MODULE_NAMES is exactly the four canonical workflow modules"*). The trigger/table disagreement is gone: the trigger's *fifteen lists across nine files* reconciles exactly — 5 holders + 1 (`coverageInstrumentation`) + 5 (`loop-distribution`) + 3 (`run.test.js`) + 1 (`learningsPremises`) = 15 over 9 |
| F-02 | Medium | **Resolved** | K-8 now reads *"**Seven** assertion edits in all … (3 + 2 + 1 + 1)"* and states why `D1_BASELINE` and `D5_BASELINE` are two edits despite identical content |
| F-03 | Low | **Resolved** | DEC-STATS-02's trigger is restated in *fields* (*"A second JSON-only **field** appears. Two such fields — not two hoist sites —"*) and explicitly records that the trigger has not fired at one field / three sites |
| F-04 | Low | **Resolved, widened** | K-8 now carries the stale-provenance clause: the constants' header comment, `assertAdditiveOnly`'s *"exactly the two new members"* message and the `"vendored class size must be 5"` literal all move with the values, with the reason they are a clause and not a row |

All four v3 findings are landed. The two new findings below are both introduced by this round's edit.

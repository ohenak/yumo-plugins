# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.14)
**Date:** 2026-08-20
**Iteration:** 5

## Overview

Delta re-review of v1.13 → v1.14 (`033cd093..HEAD`, four content commits, +66/−10), scoped to what
changed: §1 changelog, §2.5's count sentence (line 336), §4.5's artifact table (line 1387), the
five-field bullet (line 1394), the `snapshotRef` render row and its two new contrast rows plus the
AT-05-3 paragraph (lines 1419–1427), §5.2's capture-failure inventory (lines 1571–1581) and the
two-red-wave inventory (line 1647), and §5.6's AT-06-4 / AT-06-4b rows (lines 1879–1880). Sections
approved in rounds v1.2–v1.13 are not re-litigated.

**All three of my v4 findings are resolved**, and the PM's High (unnamed rendering carrier) is
answered with a carrier that exists at HEAD. But the remedy to my own F-01 — turning §5.2's
capture-failure transcription into a **set-equality over five halt-field keys** — collides head-on
with a **shipped set-equality over four keys** in the very fixture file §5.2 names, and nothing in
the document names that shipped assertion as an edit. That is one new High (F-01 below); it is a
defect of this round's delta, not a re-opening of settled ground.

**Prior findings (v4).**

| v4 | Severity | State at v1.14 | Evidence |
|---|---|---|---|
| F-01 stale "four fields" / no positive oracle for `snapshotRef: null` | Medium | **Resolved (text), new consequence** | §2.5 line 336, §4.5 line 1394 and §5.2 line 1575 all read five; §5.2 states set-equality over halt-field keys. See F-01 below for the HEAD collision this creates |
| F-02 conjunct (3) predicate unspecified / echo hazard | Medium | **Resolved** | §5.6 line 1879 pins `expect(notice).toMatch(/overwrit/i)` and `expect(notice).toContain("refs/pdlc/a6-snapshot-" + waveNum)` as **spec-side literals written in the test**, with the `toContain(devModule.SOME_WARNING)` echo named and forbidden |
| F-03 §5.2's mechanical-assertion inventory omits the two arms | Low | **Resolved** | §5.2 line 1581 hosts AT-06-4b; line 1647 hosts AT-06-4 on the two-red-wave run — which also answers my Q-01 |

**Delta code claims, re-verified at HEAD (all true).** `export function renderAdvisoryEntry`
(`pdlc/workflows/orchestrate-dev.js:3605`) and `export function renderEscalationEntry` (`:3743`) are
both present, so a pure sibling adds no module and no file; the sink `const advisoryNotice = (line)
=> notices.push(line)` is at `:14635`; the **halt-path** `buildFinalReport` call does spread
`notices` and does forward `haltAdvisory: err && err.advisory ? err.advisory : undefined`
(`:16049`, `:16068`, `:16072`); `haltError(message, fields)` builds the `Error` from `message` alone
and `Object.assign`s the rest (`:4539-4546`); `haltReason = err.message` (`:15966`). The claim that
no report-to-text renderer exists in `pdlc/workflows` holds — `buildFinalReport` (`:16169`) returns
a plain object, and the shipped halt assertions read it as data
(`waveExecution.test.js:1094`, `advisoryWaveGateMain.test.js:373`). The carrier choice is sound.

## Architecture

The delta moves one thing architecturally: conjunct (3)'s observable surface, from an unnamed
"rendered report string" to a **halt-report `notices` entry** produced by
`renderSnapshotOverwriteNotice(snapshotRef)`. From a test-architecture standpoint this is the right
surface — it is a string (so "adjacent" is meaningful), it rides a field that already exists on the
halt report, and it leaves `haltReason` untouched, so no existing message oracle is disturbed.
`renderSnapshotOverwriteNotice` does **not** exist at HEAD (`grep -rn renderSnapshotOverwriteNotice
pdlc/` returns only this TSPEC), which is correct: it is the thing the PLAN mints. Its two named
siblings do exist, at the line numbers cited above, so the "no new module, no new file" claim (§1.2)
survives.

**The one architectural question the delta leaves open is the push site**, and it is not cosmetic
for testing. §4.5 line 1419 says the notice "is pushed through the sink the tier already owns —
`const advisoryNotice = (line) => notices.push(line)`". That sink reaches A6 as the `_notice`
parameter of `runWaveGateSeam` (`orchestrate-dev.js:3383`, `:15387`), so "pushed through
`advisoryNotice`" reads most naturally as *pushed from inside the seam*. But the document never says
so, and the two readings have different test consequences:

- **Pushed inside the seam.** Then every seam-level fixture that counts notices sees one more.
  `advisoryEscalationLog.test.js:821` asserts `expect(failed.notices).toHaveLength(2)` on a
  `runA6Escalation` run built over a **real** temp repo (`makeRealRepoFixture`, `:634`, `:655`) with
  the tier on and `waveNum: 2`. `captureTreeSnapshot` runs unconditionally before dispatch on that
  path (`orchestrate-dev.js:3403`, guarded only by the tier gate at `:3392`), so the capture
  succeeds, `snapshotRef` is non-`null`, and §4.5's "Every A6-touched halt whose `snapshotRef` is
  non-`null`" makes a third notice due — that shipped exact-count oracle reddens.
- **Pushed at `main`'s halt handler.** Then the seam-level count is safe, but §5.2's capture-failure
  fixture — where the delta puts AT-06-4b — is a **seam-level** run at HEAD (it asserts
  `result.haltFields` off `runWaveGateSeam`: `advisoryWaveGate.test.js:1699`, `:3425`), and a
  seam-level run has no halt report to read `notices` off at all.

Either reading needs a sentence in §4.5 and a consequent edit named in §5.1/§5.2. Filed as F-02.

The rest of the architecture is unmoved: no new double, no new test file, both arms still land in
`advisoryWaveGate.test.js` (§5.1 line 1481), so the same-batch same-new-file authoring guard is
still satisfied — PLAN A6-15 remains the single writer.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

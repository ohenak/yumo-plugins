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

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

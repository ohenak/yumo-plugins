# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.13)
**Date:** 2026-08-20
**Iteration:** 4

## Overview

Delta re-review of v1.12 → v1.13 (`0f2a9710..033cd093`, one commit, +39/-10 lines), the completion
pass the Phase D postmortem opened after v1.12 landed BR-14's mechanism in the design half and
stopped before the oracles. Scope: my three v3 findings, plus the sections this diff touched
(header lineage cell, changelog, §1.3 residue row, §4.5 Snapshot-ref row, §5.1 file table, §5.6
preamble + AT-06-4 + new AT-06-4b, §6 OQ-2 and OQ-7). Unchanged sections already approved in
v1.2–v1.12 rounds are not re-litigated.

**Prior findings, all resolved.**

| v3 finding | Severity | State at v1.13 | Evidence |
|---|---|---|---|
| F-01 — `snapshotRef` rendering contract had zero oracles in §5 | High | **Resolved** | §5.6 AT-06-4 (line 1823) now carries all three FSPEC v1.7 conjuncts with a co-location oracle; AT-06-4b (line 1824) adds the E-34 negative arm; §5.1's `advisoryWaveGate.test.js` row (line 1437) names both |
| F-02 — §6 OQ-2 stale against §2.5's BR-14 landing | Medium | **Resolved** | OQ-2 (line 1849) now records BR-14 as landed and scopes the open half to ref-naming only |
| F-03 — §4.5's Snapshot-ref row had no pointer to §2.5's next-run overwrite | Medium/Low | **Resolved** | §4.5 Snapshot-ref row (line 1353) now states the wave-scoped/not-run-scoped distinction and names §2.5 as the trigger's home |

**Verification integrity of the delta re-measured against the tree, not the prose.** Every
current-state claim this round makes holds:

| v1.13 claim | Measured | Verdict |
|---|---|---|
| Upstream is FSPEC v1.7 `sha256:d602c440…` over REQ v1.16 `sha256:f97f4f66…` | `shasum -a 256` on both files returns `d602c440fc9f…` and `f97f4f6601406b…`; FSPEC header line 12 reads `1.7`, REQ header line 18 reads `1.16` | holds — byte-exact, not approximate |
| `advisoryRecord.test.js:496` reads the six-member `toEqual` | `advisoryRecord.test.js:496` is `expect(rows.map((r) => r.seam)).toEqual(["A1", "A2", "A3", "A4", "A5", "A6"]);`, and `:505` compares the same projection to `[...devModule.ADVISORY_SEAMS]` | holds at the exact cited lines |
| Forty-eight ATs at FSPEC v1.7 (forty-seven before AT-06-4b) | 48 unique `AT-` ids in FSPEC §6 | holds |
| OQ-7's pin spans two REQ revisions — AC-5.1 at v1.14, AC-6.2's escalation-log append at v1.15 | REQ changelog line 34 (v1.14: "AC-5.1 pins its observation point, excludes record carriers and ignored paths"), line 29 (v1.15: "AC-5.1's excluded-carrier list adds AC-6.2's escalation-log append") | holds |
| No overwrite sentence transcribed into §5.5's halt literals (TE Q-01's answer) | `grep -n 'overwrit'` across §5.1–§5.6 returns only §5.1's file row, §5.2's one-ref-per-wave prose, and the two new §5.6 rows — nothing in §5.5 | holds |

## Architecture

No architectural surface moved this round. The diff adds no seam, no module, no double, and no test
file: AT-06-4b is placed on `advisoryWaveGate.test.js`'s **existing** E-34 capture-failure fixture
(§5.2 line 1528, "The capture-failure disposition, with the writers named"), which already drives
`captureTreeSnapshot` to failure and already owns the halt-field assertions. That placement is the
right one from a test-architecture standpoint — the negative arm shares the positive arm's fixture
family, so the two arms cannot drift onto differently-configured runs, and no new same-batch
same-new-file authoring hazard is introduced for PLAN (both ATs land inside a file A6-15 already
owns as single writer).

## Interfaces

No interface changed. §4.2's `runWaveGateSeam` return type, including the `haltFields.snapshotRef:
string | null` member added at v1.12, is untouched by this diff; my v3 assessment of it (closed
union, total discriminator, `null` rather than `undefined` matching the `repairPaths: []`
convention) stands unrevised.

## Data Model

The halt-fields contract at §4.5 is unchanged in shape — the five-member set
`{rootCause, diagnosis, repairApplied, repairPaths, snapshotRef}` (line 1353) with `snapshotRef`'s
two literal arms (line 1369: `null` on the capture-failure path; line 1382: `null` "when no capture
was taken"). What this round adds around it is a cross-reference, not a model change: the
Snapshot-ref row now distinguishes the wave-scoped promise ("one ref per wave, never overwritten by
a later wave") from the run-scoped gap (§2.5's next-run overwrite), and names the latter as the
condition `snapshotRef`'s rendering warns about. That closes v3 F-03 exactly as filed.

One residue the completion pass did not sweep, and it is a data-model/oracle seam rather than
prose: three sites still describe §4.5's field set as **four** fields — line 302 ("§4.5 gives the
capture-failure halt's four fields literal, transcribable values"), line 1357 ("The capture-failure
halt's **four fields** have literal values"), and, load-bearingly, §5.2 line 1530 ("a halt on
AT-05-3's literal with §4.5's **four fields** attached at their literal values"). §5.2 is the only
place in the document where the halt-field *values* are asserted as a transcribed set, so the stale
count means the one positive oracle for `snapshotRef: null` is not actually specified anywhere.
Filed as F-01 below with the exact remedy.

## Interfaces

## Data Model

## Test Strategy

**This is where v3's High finding is discharged, and it is discharged well.**

AT-06-4 (line 1823) is restated from the single conjunct ("carries the root-cause class") to the
full three FSPEC v1.7 pins, transcribed faithfully — I diffed the row against FSPEC lines 474–478
and the conjuncts, the co-location observable, and the "never the capture's name (O-1)" exclusion
all match with no TSPEC-side invention. Critically, the row does not stop at listing conjuncts: it
names the oracle shape as **co-location within one rendered report string** and rules out the
false-green form explicitly ("not merely both present somewhere in the run, since two independent
`toContain` assertions over separate strings cannot falsify a split"). That is exactly the split
oracle my v3 finding asked to be foreclosed.

AT-06-4b (line 1824) supplies the falsifying arm, and it is not an absence-only oracle: it pairs
the two negatives (no ref pointer, no overwrite sentence) with two positives on the same rendered
report (diagnosis present, root-cause class present), on a fixture whose field state is pinned to
`snapshotRef: null`. The row also states the mutation it exists to catch in one line — "an
implementation emitting the warning unconditionally passes AT-06-4 and fails here" — which is the
form I look for in a paired arm.

Set-equality over the AT enumeration still holds after the addition. I extracted the 48 AT ids from
FSPEC §6 and the 48 row ids from §5.6's table and diffed them: **set-equal, zero asymmetry**. The
preamble's arithmetic ("forty-eight ATs at FSPEC v1.7, forty-seven before AT-06-4b") matches the
measured count, so the row-per-AT/batch-safety argument it carries is not stale.

Two gaps remain in the strategy, neither gating.

**1. The `snapshotRef: null` field value has no positive oracle (F-01, Medium).** AT-06-4b asserts
absence *in the rendered report*; §5.2's capture-failure fixture asserts the halt fields "at their
literal values" but still enumerates them as four. An implementation that omits `snapshotRef`
entirely from the capture-failure halt's `fields` object passes both: the rendered report shows no
ref (AT-06-4b green) and a four-key transcription matches (§5.2 green). §4.5 line 1369 states the
literal; nothing in §5 asserts it. Remedy is mechanical: change "four fields" to "five fields" at
lines 302, 1357 and 1530, and state §5.2's transcription as a **set-equality over the halt-field
keys** including `snapshotRef: null`, so a dropped field reddens rather than passing a containment
check — the same discipline §5.6 already applies to AT-06-1's entry-field set.

**2. Conjunct (3)'s matcher is unspecified, and the obvious implementation is an echo (F-02,
Medium).** TSPEC answers TE Q-01 by declining a verbatim sentence pin (correctly — FSPEC pins
co-location, not wording, so inventing a sentence at TSPEC altitude would be a new decision). But
"presence of the statement" leaves the implementer without a matching predicate, and the cheapest
way to write it is `expect(report).toContain(devModule.OVERWRITE_WARNING)` — an expectation whose
expected value is imported from the code under test, which cannot fail on any wording and defeats
AT-06-4b's whole purpose. What the TSPEC can pin without deciding the wording is the **predicate
and the anti-echo rule**: the oracle is a spec-side, case-insensitive `/overwrit/` match plus the
`refs/pdlc/a6-snapshot-{waveNum}` substring, both found in the *same* `haltError` report string,
with the matched literal written in the test file and **never** imported or derived from the
production module. One clause on the AT-06-4 row closes it.

## Open Questions

## Findings

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

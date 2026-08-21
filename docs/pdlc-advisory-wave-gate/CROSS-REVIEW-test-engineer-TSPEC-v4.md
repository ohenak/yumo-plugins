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

§6's two touched rows both read clean against the tree.

- **OQ-2** now separates the closed half from the open one: BR-14/AC-6.3 have landed and the halt
  report carries the operator warning (asserted by §5.6's AT-06-4 / AT-06-4b), leaving only the
  ref-naming question — should the name gain a run discriminator so the overwrite cannot happen —
  open. That is precisely the correction v3 F-02 asked for, and the disposition no longer presents a
  decided obligation as an accepted cost.
- **OQ-7** gains the two-revision pin (AC-5.1 at REQ v1.14, AC-6.2's escalation-log append at
  v1.15). Verified against REQ's own changelog lines 29 and 34 — the claim is accurate, and the
  correction matters for a reader reconstructing which revision authorised which excluded carrier.

No open question in §6 forecloses a testing approach §5 needs, and no row contradicts a §2–§4
mechanism after this pass.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §4.5's halt-field set is five members (line 1353, `snapshotRef` added at v1.12), but three sites still say **four** — lines 302, 1357, and load-bearingly §5.2 line 1530, the only place halt-field *values* are transcribed. Consequence: `snapshotRef: null` (§4.5 line 1369) has no positive oracle anywhere; an implementation omitting the key entirely passes §5.2's four-key transcription and passes AT-06-4b, whose negatives are about the rendered report, not the field. Fix: say five at all three sites, and state §5.2's transcription as a set-equality over the halt-field keys | §5.2 (line 1530); §4.5 (lines 1353, 1357); §2.5 (line 302) |
| F-02 | Medium | Local | AT-06-4's conjunct (3) names the observable (co-location) but no matching predicate, and correctly declines a verbatim pin. The cheapest implementation of "presence of the statement" is `toContain(<constant imported from the module under test>)` — an implementation echo that cannot fail on wording and neuters AT-06-4b. Pin the predicate without deciding the wording: a spec-side case-insensitive `/overwrit/` match plus the `refs/pdlc/a6-snapshot-{waveNum}` substring in the **same** `haltError` string, literal written in the test, never imported or derived from production | §5.6 AT-06-4 (line 1823) |
| F-03 | Low | Local | §5.6's AT map and §5.1's file table both name the two new arms, but §5.2 — the "what is asserted mechanically" inventory, and the section the AT-06-4b row itself cites as the fixture's home — was not extended with them. A reader auditing §5.2's fixture list sees six positive assertions plus this round's two, none of them the co-location arms. One bullet clause in §5.2's capture-failure fixture (and its two-red-wave sibling) restores the inventory's completeness | §5.2 (line 1528); §5.6 (lines 1823–1824) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does the AT-06-4 fixture reuse §5.2's two-red-wave run (which already observes `refs/pdlc/a6-snapshot-1` / `-2` on the `_git` double) or the single-wave escalation fixture? Either works for co-location, but naming it in §5.2 would let PLAN mint the red test without a fixture choice being made at implementation time. |

## Positive Observations

- Every current-state claim in this delta is true at HEAD, and the two most falsifiable ones are
  byte-exact: the upstream hashes reproduce under `shasum -a 256`, and `advisoryRecord.test.js:496`
  reads the literal the §1.3 cell quotes, at the cited line. Three rounds ago this document's
  weakest surface was stale measurement; it is now its strongest.
- AT-06-4b is a textbook falsifying arm: negatives paired with positives on the same rendered
  string, placed on an existing fixture, with the mutation it catches stated in the row itself.
- The completion pass resisted the erratum failure mode of arguing with its own prior round — v1.12's
  mechanism text is left intact and the oracles are added around it, and §5.6's set-equality over AT
  ids still holds after the insertion (48 = 48, measured).
- TE Q-01 is answered *before* §5 was touched, and answered at the right altitude: co-location is
  the observable, so no sentence is invented at TSPEC altitude and none is transcribed into §5.5.

## Recommendation

**Approved with minor changes**

The v3 High is fully resolved and nothing in the delta broke a previously-approved section. F-01 and
F-02 are Medium and non-gating, but both are cheap and both make the difference between an oracle
that can fail and one that cannot — worth folding into the next authoring pass, or into PLAN's
red-test rows for A6-15 if the TSPEC is otherwise frozen.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | Stale "four fields" for §4.5's five-member halt-field set; `snapshotRef: null` has no positive oracle | §5.2 (line 1530), §4.5 (line 1357), §2.5 (line 302) |
| F-02 | Medium | delta | local | AT-06-4 conjunct (3) has no matching predicate; the obvious implementation is an imported-constant echo | §5.6 AT-06-4 (line 1823) |
| F-03 | Low | delta | nonlocal | §5.2's mechanical-assertion inventory not extended with the two new arms it hosts | §5.2 (line 1528) |

FINDING: Medium | inherited | nonlocal | §5.2 (line 1530), §4.5 (line 1357), §2.5 (line 302) | §4.5's halt-field set has been five members since v1.12 but three sites still enumerate four, including §5.2's transcription of the capture-failure halt's literal field values — the only place halt-field values are asserted — so `snapshotRef: null` has no positive oracle and an implementation omitting the key passes both §5.2 and AT-06-4b; say five and make §5.2's transcription a set-equality over the halt-field keys
FINDING: Medium | delta | local | §5.6 AT-06-4 (line 1823) | conjunct (3) pins co-location as the observable but no matching predicate, and the cheapest implementation is `toContain(<production constant>)`, an implementation echo that cannot fail on wording and neuters AT-06-4b; pin a spec-side case-insensitive `/overwrit/` plus the `refs/pdlc/a6-snapshot-{waveNum}` substring in the same `haltError` string, literal written in the test and never imported from production
FINDING: Low | delta | nonlocal | §5.2 (line 1528) | AT-06-4b cites §5.2's capture-failure fixture as its home, but §5.2's own inventory of what that fixture asserts was not extended with the co-location arms, leaving the mechanical-assertion list incomplete for a reader auditing it

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

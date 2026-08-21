# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-21
**Iteration:** 4 (delta re-review of v1.5 against my v3 findings)

## Overview

**Both my v3 findings are resolved, and I verified the fix against the repository rather than
against the document's own account of it.** The delta since my last-reviewed commit (`32a459ef`) is
**+128 / −29** across six commits (`53a36af6`…`d3f0bcf5`), landing PROPERTIES **v1.5**. F-01 (High)
is closed by four new properties, one new oracle, three new fixture rows, a fixture hazard, a §G-2
softness entry and a restated §G-4; F-02 (Low) is closed by a §Scope re-grounding that now names
versions **re-hashed on disk** rather than taken from the dispatch. Nothing I approved in v2 was
broken: I checked the two statements most exposed to this change — PROP-REST-09's byte-equality with
the pre-A6 halt literal and the shared Pre-A6 baseline fixture — and both are untouched, because the
upstream mechanism routes the notice through `notices` rather than through the halt reason string.

**Re-grounding first (DEC-ERR-03).** I re-hashed all five upstream documents on disk. REQ is
unchanged at `f97f4f66…` (**v1.16**) — the version my F-01 was measured against. The other four have
all moved since my v3 anchors, and moved *toward* this document: FSPEC `91ef2557…` → `d602c440…`
(**v1.7**), TSPEC `3fa21acf…` → `1f6ea486…`, DECISIONS `ef59893d…` → `dc7a8d65…`, PLAN `f7de7fcb…`
→ `c843cb4f…` (**v1.13**, confirmed at its changelog's last row). The document's §Scope names exactly
these five hashes, so its grounding claim is checkable and checks out.

**Q-01 from v3 is answered, and answered the way that costs least.** I asked whether PROPERTIES
should land the property now and route the FSPEC/TSPEC gap as a §G-3 erratum, or wait for an
FSPEC-first cascade. At HEAD the cascade has already landed upstream, so the question is moot and
§G-3 correctly records "nothing new routed, one cascade closed by absorption" rather than re-raising
it (which would have been DEC-ERR-01's anti-pattern). Verified on disk: FSPEC carries `AT-06-4b`
(`FSPEC-…md:479`) and its v1.7 changelog states BR-14's co-location clause and AT-06-4's third
conjunct (`:14`); TSPEC carries the `snapshotRef` field in the halt-fields type
(`TSPEC-…md:867`) and the `renderSnapshotOverwriteNotice(snapshotRef)` carrier row
(`TSPEC-…md:1428`); PLAN v1.13's A6-18 owns the seam-side arm, the `snapshotRef` field, the helper
and the `toHaveLength(2)` → `3` widening in its green step. Q-02 (DECISIONS moving outside the
stated delta) is likewise absorbed: I re-read DEC-A6-03 at HEAD and nothing PROP-REST-07 or
PROP-REST-08 leans on has moved.

**What I checked, and what I did not.** Per the delta protocol I scanned only the changed sections —
the changelog row, §Scope, "Where the tests live", PROP-REST-08, PROP-REC-05, the four new
PROP-REC-08…-11 rows, Oracle O-J, the falsifiability close, three fixture rows plus one new hazard
and the "one string deliberately not on that list" paragraph, C-1's AC-6.3 and AC-5.3 rows, C-2, C-3,
§G-2, §G-3 and §G-4. Settled properties, oracles and fixtures outside that set were not re-opened.
One new finding, Low, is in §Findings; it is a count that the round's own edit left behind.

## Properties

### F-01 (High, v3) — resolved, and resolved at conjunct granularity

My finding was that REQ v1.16's second AC-6.3 sentence had no property: C-1's row read
`PROP-REC-05, PROP-REST-08`, of which the first covers only the diagnosis/root-cause half and the
second is the capture-failure arm where the conjunct is vacuous. The revision closes it with four
properties, and each one answers a specific half of what I asked for:

- **PROP-REC-08** — the positive arm. Its trigger is **antecedent-guarded exactly as REQ writes it**
  (*"on a wave whose capture succeeded (`snapshotRef` non-`null`)"*), not unconditional. That is the
  over-assertion hazard I flagged, avoided. It asserts all three of AC-6.3's conjuncts **on one run**
  and pins **co-location inside a single `notices` element** — the faithful reading of REQ's *"in the
  same place"*, which a report-wide containment check would have narrowed away.
- **PROP-REC-09** — the negative arm on the existing E-34 fixture. It is not absence-only: the
  absence assertion (no `notices` element matches either predicate, asserted **over the whole array**)
  is paired on the same run with PROP-REST-08's positive five-key set-equality carrying
  `snapshotRef: null`. This is what makes PROP-REC-08 falsifiable — an implementation that warns on
  every halt passes -08 and fails -09.
- **PROP-REC-10** — the un-skip arm I had not identified. It follows TSPEC §4.5's universal
  quantifier over every A6-touched halt whose `snapshotRef` is non-`null`, and it carries its own
  paired negative (A6 never fired: `a6.calls.length === 0`, `advisory` argument omitted, outcome and
  halt reason positively pinned, no overwrite notice anywhere). A positive-only arm could not satisfy
  it. C-1's AC-5.3 row and C-2's AT-05-4 row were updated to match, which is the traceability I would
  have raised had they not been.
- **PROP-REC-11** — the field-shape contract, compared by **set-equality, never containment**, and
  the three shipped exact-shape oracles the fifth key disturbs.

**PROP-REC-05 is now scoped honestly rather than silently half-covering.** Its statement says in
words that it is AC-6.3's first sentence "and the whole of it", pointing at -08/-09/-10 for the
second and -11 for the shape. That is the fix I asked for done one level better than asked: the
under-coverage can no longer re-open invisibly, because the property itself declares its boundary.

### The C-1 row, and why the split matters

C-1's AC-6.3 row is now split **by sentence** — first sentence → PROP-REC-05; second sentence →
PROP-REC-08 (capture succeeded) / -09 (E-34 negative) / -10 (un-skip); field shape → PROP-REC-11,
PROP-REST-08. §G-4 states the bar this raises explicitly: coverage is claimed *"at conjunct
granularity"*, and it names the previous failure ("the claim was previously true only at AC
granularity"). Recording the defect class, not just the fix, is what stops the next REQ conjunct
landing in an already-cited AC and disappearing.

### Verified against code, not only against documents

Every claim PROP-REC-11 makes about shipped test surfaces is true at HEAD, and I checked each:

- `advisoryWaveGate.test.js:2714` — `expect(Object.keys(result.haltFields).sort()).toEqual([...])`
  reads the **four**-key array (`diagnosis, repairApplied, repairPaths, rootCause`), as claimed.
- `advisoryWaveGate.test.js:3369` — `ORACLE_G_HALT_FIELDS` is the four-key literal, used at `:3425`
  and `:3462`: **two** `toEqual` uses, as claimed.
- `advisoryWaveGate.test.js:2676` — the escalation-path `expect(result.haltFields).toEqual({rootCause:
  "plan-ordering-defect", …})`, as claimed.
- `advisoryWaveGateMain.test.js:373` — the four-key `expect(result.haltAdvisory).toEqual({…})`. The
  property claims its fifth value is the **ref, not `null`**, because that fixture's `_git` double
  answers `ok: true` to the capture verbs. Confirmed: `advisoryWaveGateMain.test.js:123` returns
  `{ok: true, stdout: "abc1234…"}` for `rev-parse`, `write-tree` and `commit-tree`. Had this been
  wrong, Phase I would have transcribed a red test; it is right.
- `advisoryEscalationLog.test.js:821` — `expect(failed.notices).toHaveLength(2)`, the exact count the
  property says becomes `3`.
- The two exported sibling helpers O-J cites are real: `export function renderAdvisoryEntry`
  (`orchestrate-dev.js:3605`) and `export function renderEscalationEntry` (`:3743`).
  `renderSnapshotOverwriteNotice` is correctly *absent* — it is the thing A6-18 builds.

**Anti-echo, checked as a product concern.** Both halves of the notice are matched by literals
written in the test (`/overwrit/i`, `"refs/pdlc/a6-snapshot-" + waveNum`), and O-J names the imported
constant as forbidden by construction — `toContain(devModule.SOME_WARNING)` cannot fail on wording
and would neuter PROP-REC-09. No expected value in this round derives from the code under test.

## Oracles

**Oracle O-J is the oracle my v3 §Oracles note asked for, and it rules out all three wrong units by
name.** I had written that hazard down precisely so the follow-up round would not have to rediscover
it; the revision does not merely satisfy it, it states the reasoning in the document where Phase I
will read it:

- *Containment over the whole report* (`JSON.stringify(report).includes("overwrit")`) is named and
  rejected, with the product reason attached — it passes when the warning rides a channel the
  operator never sees at halt, which is what BR-14's *"in the same place"* forbids. That was my
  first hazard, verbatim in substance.
- *Two independent `toContain` assertions over separate strings* is named and rejected: it cannot
  falsify a split across two notices. The oracle instead **selects the single `notices` element
  matching the ref pattern and asserts the overwrite predicate on that same element**. This is the
  unit that makes co-location testable rather than assumed.
- *A constant imported from the module under test* is named and rejected as an implementation echo.

**The negative arm is oracled, not asserted.** O-J closes by stating that PROP-REC-09's absence
assertion runs over the *whole* `notices` array and is paired with PROP-REST-08's five-key
set-equality including `snapshotRef: null` — the positive oracle for the `null` value. My v3 note
said an unpaired absence conjunct would let an unconditional warner pass; that pairing is now the
document's stated design, and the falsifiability close adds a fifth failure mode for it ("a
guarded conjunct asserted only on the fixture where its antecedent is false passes vacuously, which
is why PROP-REC-08 lives on the two-red-wave run and never on E-34's").

**Nothing I approved is disturbed, and the reason is checkable.** O-J states the carrier is
`notices`, **not** the halt reason string, so PROP-REST-09's byte-equality with the pre-A6 literal
(M-WG-3) and the shared Pre-A6 baseline fixture stand unedited. I confirmed both are byte-identical
in the diff. The blast radius I would have had to re-review is genuinely zero, and it is zero because
the upstream decision chose the low-radius carrier — not because this document waved it away.

**PROP-REST-08's correction is a strengthening, not a loosening.** Its "§4.5's four fields" became
"**five** fields, transcribed **set-equally**", with the reason stated in place: `toEqual` fails on an
extra key exactly as on a missing one, so quietly keeping four to stay green would delete the only
positive oracle for `snapshotRef: null` that AT-06-4b's negative arm rests on. That is exactly the
"completeness by set-equality, not containment" bar, and the document argues it from the consequence
rather than from the rule.

**Oracle count reconciled.** The §Oracles preamble moved from "Nine oracles" to "**Ten**" in the same
edit that added O-J. The one count in this document that a reader checks against the list is
consistent — which is what makes the one count that is *not* (§Findings F-01) worth naming.

**Oracle G is untouched and correctly so.** Its capture-failure `diagnosis` literal is TSPEC's, and
on the E-34 path there is no capture to point at, so AC-6.3's new conjunct does not reach into it. I
verified the shipped literal still matches at `advisoryWaveGate.test.js:3369`. This is the same
reading I gave in v3, and the revision did not disturb it.

## Fixtures

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-21
**Iteration:** 4 (delta re-review of PROPERTIES v1.5, against my v3 anchor `32a459ef`)

## Overview

**Scope of this round.** Delta re-review. My v3 anchor was `32a459ef`; six commits have landed on the
document since (`53a36af6`, `6cb64187`, `5719637f`, `b4627fa8`, `dd2e2e29`, `d3f0bcf5`), taking it to
**v1.5** — +128/−29 lines. I read the diff, not the document, and re-read only the sections it
touched: §Scope, §E (PROP-REST-08), §F (PROP-REC-05, plus new PROP-REC-08…-11), §Oracles (new O-J and
the falsifiability paragraph), §Fixtures (three new rows, one new hazard, the deliberately-unpinned
string), matrices C-1/C-2/C-3 and §§G-1/G-3/G-4.

**Where my three v3 findings stand.** All three are resolved, and the Medium was resolved *upstream*
rather than here, which is the right place for it.

| v3 finding | Status | Evidence I checked, not the document's word for it |
|---|---|---|
| F-01 (High) — AC-6.3's second conjunct had no property, oracle or fixture; C-1's row and §G-4's coverage claim were false at conjunct granularity | **Resolved** | Four properties added (`PROP-REC-08`, `-09`, `-10`, `-11`); C-1's AC-6.3 row is split by sentence; §G-4 restates the claim at conjunct granularity and names the gap it closed. The positive arm is homed on the **two-red-wave** run, *not* on E-34's `null`-capture run — the specific vacuous-pass mistake I named in advance |
| F-02 (Medium) — the warning's carrier was pinned by properties I had already approved; the slot decision was upstream's | **Resolved upstream, correctly absorbed** | FSPEC v1.7 adds AT-06-4's third conjunct and `AT-06-4b`; TSPEC v1.15 lands the fifth halt field `snapshotRef`, the exported helper `renderSnapshotOverwriteNotice`, and `notices` as the carrier; PLAN v1.12–v1.13 give both arms owners (A6-18 seam-side, A6-21 un-skip-side). The carrier is `notices`, so **PROP-REST-09's byte-equality with the pre-A6 literal is untouched** and the shared Pre-A6 baseline fixture is unaffected — the low-blast-radius resolution, taken deliberately |
| F-03 (Low) — grounding pins cited stale upstream HEAD | **Resolved** | I re-hashed all five on disk: REQ `f97f4f66…`, FSPEC `d602c440…`, TSPEC `1f6ea486…`, DECISIONS `dc7a8d65…`, PLAN `c843cb4f…`. Every one matches the version cell the document now claims |

**Did the revision break anything I approved?** No. I checked the two places where breakage would
have shown: `PROP-REST-09`'s reason-string **equality** is verbatim unchanged in the diff, and the
Pre-A6 baseline fixture row is unchanged. The only edit to an approved property is `PROP-REST-08`'s
four→**five** halt fields, which is the corollary of the upstream field addition and is required —
`toEqual` fails on an extra key exactly as on a missing one, so leaving it at four would have
reddened the very suite that owns it. `PROP-REC-05` gained a scoping sentence only; its assertion did
not move.

**Two Low findings, neither gating**: a stale suite count in §C-3 that the Overview's own edit
outran, and a lineage row that rolled backwards. No High, no Medium. **Approved with minor changes.**

## Properties

Four new rows, one corrected row, one rescoped row. I checked each against the repository rather than
against the document's account of it.

**PROP-REC-08 (positive arm) — homed correctly, and the antecedent is live on its fixture.** The
property asserts AC-6.3's three conjuncts on one run and pins the unit as *co-location inside a
single `notices` element*. Its fixture is §5.2's two-red-wave run, where a wave number is actually
distinguished — so a hard-coded `-1` in an implementation cannot pass. This is precisely the shape I
asked for in v3, including the reason: on E-34's run the antecedent is false and the conjunct would
pass vacuously.

**PROP-REC-09 (negative arm) — not an absence-only oracle.** The absence is asserted over the
**whole** `notices` array, and it is paired on the same run with `PROP-REST-08`'s five-key
set-equality carrying `snapshotRef: null` — the positive oracle for the `null` value. That pairing is
what makes PROP-REC-08's third conjunct falsifiable rather than a string that is always present. The
document states the failure mode explicitly ("an implementation warning unconditionally passes
PROP-REC-08 and fails here"), which is the right way to record why both arms exist.

**PROP-REC-10 (un-skip arm) — the carrier claim holds at HEAD.** TSPEC §4.5 quantifies over every
A6-touched halt with a non-`null` `snapshotRef`, and the seam has already returned by the un-skip
halt, so the push must happen at the halt site. I verified the sink exists and is already wired on
that path: `const advisoryNotice = (line) => notices.push(line)` at `orchestrate-dev.js:14635`, passed
as `_notice` at `:14688`, `:15387`, `:15685`, `:15741`. The paired negative (A6 never fired:
`a6.calls.length === 0`, `advisory` omitted, no overwrite notice anywhere, halt positively pinned by
outcome and reason) satisfies the no-absence-only rule on this arm too.

**PROP-REC-11 (field shape) — every shipped oracle it names exists at HEAD, and I checked the
prescribed values, not just the file names.**

| Claim in PROP-REC-11 | Verified |
|---|---|
| `advisoryWaveGate.test.js`'s `Object.keys(result.haltFields).sort()` reads the four-key array | `advisoryWaveGate.test.js:2714` |
| `ORACLE_G_HALT_FIELDS` literal and two `toEqual` uses of it | `advisoryWaveGate.test.js:3369`, `:3425`, `:3462` |
| `advisoryWaveGateMain.test.js`'s four-key `expect(result.haltAdvisory).toEqual({…})` | `advisoryWaveGateMain.test.js:373–378` (`rootCause`, `diagnosis`, `repairApplied`, `repairPaths`) |
| …in the test named *"a persistently red gate: A6 escalates…"* | `advisoryWaveGateMain.test.js:350` |
| …whose fifth value is the **ref**, not `null`, because the `_git` double answers `ok: true` to every capture verb | Confirmed: `write-tree`/`commit-tree` return `ok: true` at `advisoryWaveGateMain.test.js:124`, and `update-ref` falls through to `return { ok: true, stdout: "" }` at `:137`. The run is wave 1 (`haltReason` contains `"Wave 1 test gate failed"`, `:368`), so `refs/pdlc/a6-snapshot-1` is right |
| …and its `haltReason` **containment** assertion is deliberately untouched | Confirmed it is a `toContain`, `:368` — AT-05-3's surviving oracle, correctly left alone |
| `advisoryEscalationLog.test.js`'s `expect(failed.notices).toHaveLength(2)` → `3` | `advisoryEscalationLog.test.js:821`. I checked the *reason*, which is the part that could have been wrong: `runA6Escalation` drives the real `runWaveGateSeam` over a `makeRealRepoFixture` at `waveNum: 2` (`:633–663`), so the capture genuinely succeeds and a third notice is genuinely due. The prescribed `3` is correct, not a guess |

This is the finding I would otherwise have had to file myself: the fifth halt field is an *extra* key,
and `toEqual` fails on extras. Naming the three disturbed exact-shape oracles, assigning the widening
to the same red-to-green step that adds the field, and stating why (the batch gate has no
expected-red channel) is the correct engineering resolution and it is now written down.

**PROP-REST-08's correction is required, not cosmetic.** Its five-field set-equality is the only
positive oracle for `snapshotRef: null`; the document says so and says what dropping it would delete.
**PROP-REC-05** is rescoped to AC-6.3's first sentence with the second sentence's owners named
inline — the right way to keep two properties from silently claiming the same criterion.

**Anti-echo, checked as a property of the prescriptions.** Both halves are matched by literals
written *in the test* — `/overwrit/i` and `"refs/pdlc/a6-snapshot-" + waveNum` — never by a constant
imported from the module under test. The document states the consequence correctly: an imported
constant cannot fail on wording and would neuter PROP-REC-09.

## Oracles

**O-J is the section I asked for, and it rules out the three wrong units by name.** Containment over
the stringified report; two independent `toContain` calls over separate strings; a constant imported
from the module under test. The second is the one that actually bites — a split across two notices
satisfies both assertions and defeats BR-14's *"in the same place"* — and the oracle's response
(select the single `notices` element matching the ref pattern, assert the overwrite predicate **on
that same element**) is the correct unit.

**The carrier claim is true at HEAD, which is what makes O-J implementable.** O-J says the warning
rides `notices`, which the halt-path `buildFinalReport({… notices …})` call already spreads onto the
halt report. Verified: the halt-path call passes `notices` at `orchestrate-dev.js:16064`, inside the
`outcome: "halted"` report construction beginning at `:16049`, and `buildFinalReport` accepts
`notices = []` in its destructured signature at `:16169+`. So no new transport is invented, and
`PROP-NFR-04`'s "no A6 datum at module scope" discipline is unaffected.

**The exported-sibling claim checks out.** `renderSnapshotOverwriteNotice` is to be exported like its
two siblings: `export function renderAdvisoryEntry` at `orchestrate-dev.js:3605` and
`export function renderEscalationEntry` at `:3743`. O-J is careful to call the helper's direct purity
assertion *"an available unit assertion, not a substitute"* — the seam-level observation is what
proves the notice reaches the report. That is the right ordering; a pure-helper unit test alone would
have been the cheap wrong answer.

**Weakest-sufficient predicate, deliberately.** The `/overwrit/i` stem is named as the weakest
predicate that still discriminates a warning from its absence, and the document refuses to pin a
verbatim sentence because no upstream document owns one — FSPEC AT-06-4 pins co-location and
presence, REQ O-1 keeps the capture's name and storage form TSPEC's. I agree with the trade and with
its stated cost (a technically-matching but poorly-phrased notice passes). Minting a literal the spec
does not own would produce a red test against a spec-following implementation, which is strictly
worse, and the document cites the round-v1.4 `attempts` incident as precedent rather than asserting
the principle abstractly.

**The falsifiability paragraph now names the vacuous-pass mode.** The added clause — "a guarded
conjunct asserted only on the fixture where its antecedent is false passes vacuously, which is why
PROP-REC-08 lives on the two-red-wave run and never on E-34's" — is the reasoning I asked to be
written down so a later reader would not have to re-derive it.

**Set-equality over the enumerated contract, checked mechanically rather than read.** C-2 claims
forty-eight ATs at FSPEC v1.7 with no id present that FSPEC does not carry. I extracted both id sets
with `grep -oE "AT-[0-9]{2}-[0-9]+[a-z]?" | sort -u` and diffed them with `comm`: 48 ids on each side,
**both difference sets empty**. `AT-06-4b` is present in FSPEC (`FSPEC…md:479`) and carries a home
(`PROP-REC-09, PROP-REST-08`). The set-equality is real, not a containment check wearing its name, so
a deleted case fails.

## Fixtures

_(pending)_

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

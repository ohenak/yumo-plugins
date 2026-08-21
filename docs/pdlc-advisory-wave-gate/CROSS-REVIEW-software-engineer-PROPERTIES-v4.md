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

**Cost: three new rows, zero new infrastructure — as I sized it in v3.** All three fixtures the
overwrite-notice properties need already existed for other properties:

| New row | Reused from | My check |
|---|---|---|
| Two-red-wave run | PROP-REST-07's `update-ref` target set | Correctly identified as the **only** fixture distinguishing a wave number, which is why the ref-pointer half must be asserted there and not on a single-wave run |
| Capture-failure run (E-34) | PROP-REST-08 | Correctly described as PROP-REC-09's negative arm "at no new cost" — the antecedent is false by construction |
| Un-skip halt pair | PROP-REST-04 | Both members named: the resolved-then-un-skip-halt run and the no-A6-fired companion |

So the "too expensive to test" escape I warned against in v3 is now closed off explicitly, in the
document's own words, on the fixtures that refute it. The `Recording _git double` row gained
`PROP-REC-08` — right, since the ref target set is what the property reads.

**Hazard 3 is the right hazard, and it points the correct direction.** It states the real risk is not
fixture cost but the `snapshotRef` key reddening three shipped suites silently, and it binds the
widening to the same red-to-green step as the field, "because the batch gate they sit behind has no
expected-red channel." That is a genuine property of this repo's wave gate, not a stylistic
preference, and stating it in Fixtures is where an implementer will actually hit it.

**The deliberately-unpinned string is handled by the document's own convention.** The added paragraph
says the overwrite sentence is *not* on the verbatim-string list, with the reason (no upstream
document owns the wording) and the counterfactual cost (a manufactured literal minting a red test).
What *is* transcribed is the predicate pair. This is consistent with the rule that exact user-facing
strings are owned by the lowest layer that pins them: no layer pins this one, so none duplicates it.

**Hazards 1 and 2 are untouched by the delta, and I did not re-litigate them.** My v2 read of hazard
2 (ignored-path conjunct scoped to presence-only) stands; nothing in this delta moved its premise.

**Pre-A6 baseline is byte-unchanged.** This is the fixture F-02 was about. The diff shows the row
intact, and the carrier decision landing on `notices` is exactly what leaves it alone.

**Test-file existence, re-verified rather than accepted.** `advisoryWaveGateMain.test.js`,
`waveExecution.test.js`, `advisoryEscalationLog.test.js` and `advisoryWaveGate.test.js` are all on
disk under `pdlc/workflows/__tests__/`. PLAN ownership also holds: `advisoryWaveGateMain.test.js` is
in A6-18's file-ownership row (`PLAN…md:369`) and `waveExecution.test.js` is in A6-21's (`:370`), so
PROP-REC-10's home in C-3's `A6-19 (A6-21's former-A6-19 red step)` row names a PLAN-owned file. No
property names a file the PLAN's manifest does not assign.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §C-3's *File existence, verified at HEAD* paragraph still reads "**The ten** edited suites all exist" and enumerates ten names, but the same revision moved §Scope to "**eleven** existing suites … all eleven verified present at HEAD" by adding `advisoryWaveGateMain.test.js`. The count and the enumeration were outrun by the Overview's own edit. No coverage hole follows — I confirmed `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` is on disk and that PLAN owns it in A6-18's file-ownership row (`PLAN…md:369`) — so this is a stale count, not a wrong claim about the world. Fix: make it eleven and add the eleventh name to the parenthetical list. | §C-3, *File existence, verified at HEAD* (vs §Scope, *Where the tests live*) |
| F-02 | Low | Local | The lineage header's Cross-Reviews row moved **backwards**, from `…-v1.md`…`-v4.md` to `…-v1.md`…`-v3.md` for both reviewers. It was accurate at the moment of writing (no v4 existed), but this round produces `CROSS-REVIEW-software-engineer-PROPERTIES-v4.md` and its PM counterpart, so the row is stale again on landing. A row that has to be re-edited every round to stay true is better written as an open range. Fix: restore `-v4` (or write the range open-ended) next time the header is touched — not worth a round of its own. | §Lineage header, Cross-Reviews row |

**Scope note.** Both are `Local`: they are bookkeeping inside this artifact and carry no durable
constraint. Nothing this round warrants `Cross-Feature` or `Process` — the process signal that would
have qualified (route the carrier decision upstream rather than inventing a slot in PROPERTIES) was
already acted on correctly and needs no new tag.

**My three v2 Low findings** (C-3's matrix still titled on pre-restructure task ids) remain open and
non-gating; §C-3 acknowledges them by name and states the both-forms workaround. I am not re-filing
them here.

**Nothing routed upstream this round.** The v3 cascade question is closed by absorption, not by
deferral: FSPEC v1.7, TSPEC v1.15 and PLAN v1.13 all carry the obligation with owners. Re-raising it
would be the DEC-ERR-01 anti-pattern, and §G-3 says so.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-REC-11 routes `advisoryEscalationLog.test.js`'s `toHaveLength(2)` → `3` widening to **A6-18**, while the file itself is A6-17's test home. PLAN v1.12 makes the same assignment and C-3's A6-17 row states it in prose, so the contract is coherent and I am not filing it. The question is only for the implementer's benefit: is the single-writer-per-batch walk comfortable with A6-17 and A6-18 both writing that file in batch 6, or does it rely on A6-17's red step landing first within the same task sequence? Answering it in the PLAN's batch-safety clause rather than in PROPERTIES would keep the answer where the walk lives. |

## Positive Observations

- The round **absorbed** the cascade instead of routing it, and proved the absorption was legitimate
  by re-hashing all five upstream documents at HEAD first. I re-computed all five independently and
  every digest matches. Re-grounding before answering findings is the practice that made the rest of
  this round cheap.
- The carrier decision landed the **low-blast-radius** way. `notices` rather than the halt reason
  string means `PROP-REST-09`'s equality with the pre-A6 literal and the shared Pre-A6 baseline
  fixture are untouched. The blast radius I sized in v3 as the thing to protect is zero, and it was
  protected upstream, where the decision belonged.
- `PROP-REC-11` is the strongest row added this round and it was not asked for. Recognising that a
  *fifth* key breaks exact-shape oracles as surely as a missing one, enumerating the three that
  break, checking the fifth **value** on each (the ref on the main-suite fixture, `null` on E-34),
  and binding the widening to the same red-to-green step, is the difference between a spec that ships
  green and one that discovers a red batch gate at the wave boundary.
- The vacuous-pass trap I named in v3 was avoided on exactly the terms named: PROP-REC-08 lives on the
  two-red-wave run, never on E-34's. The two-red-wave fixture is also correctly justified as the only
  one that would catch a hard-coded wave number.
- Every negative assertion added this round is paired with a positive on the same run — PROP-REC-09
  with PROP-REST-08's five-key set-equality, PROP-REC-10's no-A6-fired companion with outcome, halt
  reason and `a6.calls.length === 0`. No absence-only oracle entered the document.
- C-2's set-equality survives contact with a mechanical check: 48 = 48, both `comm` difference sets
  empty against FSPEC v1.7.
- §G-4 no longer overclaims. Restating the bar as *conjunct* granularity, and naming the AC-level
  claim that was previously true only by accident, is what stops the same gap re-opening invisibly.

## Recommendation

**Approved with minor changes**

All three of my v3 findings are resolved — the High by four correctly-homed properties and a new
oracle, the Medium by an upstream decision that landed the way that protects the approved properties,
the Low by re-grounding I verified digest-by-digest. Nothing I previously approved was broken: the
one edit to an approved property (`PROP-REST-08`'s four→five fields) was compelled by the upstream
field addition and is required to keep the suite green. The two remaining findings are Low
bookkeeping items — a stale suite count and a lineage row that rolled backwards — and neither blocks
Phase I. Fix them in the next edit that touches those lines; do not spend a round on them.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:580ba2898227d0782c6514316d3adb84672065a1b0b38fe08d2945b53821fe51
APPROVAL-HASH-NORMALIZED: sha256:ff627fd516ce8b071f91ec8373740abbdf197972756e635a5f115f2ceefa3737
REVIEWED-COMMIT: d3f0bcf5689e25bd68ba074bad809571bc972353
UPSTREAM-STATE: REQ sha256:f97f4f6601406b5a6b5adb6dbc2e6f79d81218119c9b4238854f3431e8e6fab7
UPSTREAM-STATE: FSPEC sha256:d602c440fc9f3e76904419399c787d617e541d798d0348e07b9c2005b39dfe0e
UPSTREAM-STATE: TSPEC sha256:1f6ea4869d10dad1112510d588bf8d836bb4fd9f688dbde0ad5ece6ff9393f0b
UPSTREAM-STATE: DECISIONS sha256:dc7a8d654bea979d0f06207b8de67a9ebc1e180f134bf5141dcc41af17801fe9
UPSTREAM-STATE: PLAN sha256:c843cb4fc610fe03d03c1b94a97faa5ce38d7b36733611dde20d2110d26dfecb

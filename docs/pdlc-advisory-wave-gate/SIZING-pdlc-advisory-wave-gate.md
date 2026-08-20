# SIZING — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `TSPEC → DECISIONS → **PLAN** → SIZING` — a PLAN appendix, cited from PLAN's Overview HEAD-drift note |
| Downstream | `IMPL` |
| Cross-Reviews | *(none — relocated content, reviewed through `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1…v8.md`)* |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.0 | 2026-08-19 |

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-19 | **First authored by relocation.** This document is the sizing block that lived in `DECISIONS-pdlc-advisory-wave-gate.md`'s `## Consequences` section through v1.7, moved here whole per POSTMORTEM-D §6 steps 1–2 and PM v8 Q-01. Two changes were made in the move, both structural rather than substantive: the "twelve already-migrated sites" bullet is **folded into column (2)** as one enumeration read two ways, and the reconciliation clause that related the two counts is **deleted, not reworded** — it is the defect generator POSTMORTEM-D §5 identifies. Every count below was re-measured at HEAD in this revision; none moved. |

---

## Why this is not in DECISIONS

A DECISIONS document records choices and their consequences, and is meant to be stable once its
entries are approved. This block records **measurements of the working tree** — how many sites an
implementer must edit, how many go green on their own, how many are prose a later reader might
trust. Its truth conditions move with every commit: `e3b9d5a3` landed the test-side A6
transcriptions ahead of Phase I, so the advisory suites are red at HEAD by design and these totals
change under any tree that moves. Its consumer is PLAN's batch sizing, not the decision record —
`DEC-A6-01…DEC-A6-04` are unaffected by every number here, and none of them is re-opened by a
re-measurement.

The one number that belongs beside the decisions is column (1)'s **four**, and DECISIONS now carries
that plus a pointer to this file.

## The authoring check this document is under

**Before committing any edit to an enumeration below: if a sentence names two counts, re-run both.**
Not "re-derive" — *re-run*, using the recipe the section names, against HEAD, in the same session as
the edit. The failure mode this rule exists to prevent is the one that cost Phase D five review
rounds: a round re-derives one population, then writes a sentence relating it to a neighbouring
population that was not re-run, which converts a stale number into a stale *relation* — strictly
worse, because a stale relation reads as reconciled.

The corollary, applied in this revision: **no clause here reconciles one column against another.**
The columns are disjoint populations counted by disjoint recipes; where one is a reading of another,
it is written as one enumeration read two ways, never as a subset assertion between two integers.

## Measurement vintage

Everything below was measured at HEAD of `feat-pdlc-advisory-wave-gate` on 2026-08-19 by running,
not by reading:

```
cd pdlc/workflows && npm test -- __tests__/advisory
# 24 failed / 386 passed / 410 total, across 15 suites
```

plus the column (3) grep recipe printed under *How to re-derive column (3)* below. A count carried
forward without re-running its own recipe is a stale count; three earlier rounds shipped one.

## The size to hand PLAN is three columns, not one number

Three transcribed set-equality surfaces move together when A6 lands — `ADVISORY_SEAMS`,
`ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS`. The **constants** are three; their counterparts are
not, and the PLAN must be sized against the counterparts. Sized as "one task touching three
constants", it invites exactly the partial edit the set-equality discipline exists to catch
(PM F-02). Sized as "roughly a dozen transcriptions" (v1.3's figure), it is inflated by five seam
sites that had already migrated. The honest size is three columns.

### Column (1) — gate-demanded edits: **four**

Three production constants in `orchestrate-dev.js`'s advisory constants block — `ADVISORY_SEAMS`,
`ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS` — plus **one** test-side literal.

**The seam literal survives at one site, not six.** `["A1", "A2", "A3", "A4", "A5"]` is carried at
exactly one place under `pdlc/workflows/__tests__/` at HEAD: `advisoryRecord.test.js`'s
`rows.map((r) => r.seam)` equality inside `PROP-SUM-01` — the site TSPEC §1.3's per-seam-report-rows
row singles out as "**the one test-side literal not yet transcribed**". Re-measured this revision: a
grep for the five-member literal excluding `"A6"` returns that one hit and no other. The five sites
v1.2 listed beside it already read `["A1" … "A6"]` and are members of column (2).

This is the number an implementer must not get wrong, and it is small.

### Column (2) — sites already at the post-A6 value: **twelve**, of which **ten** are oracles red at HEAD and **two** are green inputs

One enumeration, read two ways. The population is the twelve sites across both literals that already
carry the post-A6 value and therefore need **no edit**. Ten of them assert against production, which
is why they are red at HEAD and why they flip red→green on column (1)'s green step alone. Two of them
are inputs, green today because nothing compares them to production.

A reader who goes to any of these twelve expecting a literal to edit finds the target value already
in place. That is a third category beside "gate-demanded edit" and "ungated hand-copy" — the one the
record previously lost (PM v6 Q-01) — and PLAN's own A6-05 red step already says so: "At HEAD most of
this step is **verification, not editing**".

**The ten oracles, and the fourteen of the run's twenty-four failures they account for.**

*Envelope side — three sites, seven failures:*

- `advisoryEnvelope.test.js`'s `T-03-8` `ENVELOPE_DEFAULTS` / `ADVISORY_EXCLUSIONS` set-equality (one
  failure).
- `advisoryConfig.test.js`'s `PROP-CFG-02` deep-equality — five inputs, five failures (absent file,
  no `advisory` section, unparseable JSON, top-level array, non-object section). Run at HEAD, all
  five are red and each diff drops `"E-5"`, `"E-6"` **and** `"waveBudgetPerRun": 1`.
- `advisoryConfig.test.js`'s `PROP-CFG-01` — "`ADVISORY_DEFAULTS`' own key set … set-equal to the
  shipped defaults, `waveBudgetPerRun` 1" — whose key-set equality is red on the absent production
  key (one failure).

`advisoryConfig`'s is not a *dedicated* envelope assertion, which is what made it easy to miss:
`PROP-CFG-01` asserts only that file's *key set*, its `waveBudgetPerRun` value, and key-set equality
against `parseAdvisoryConfig(null)`, and says nothing about envelope members — but `PROP-CFG-02`
deep-equals the *whole* literal against `parseAdvisoryConfig`'s output, and `toEqual` descends into
`envelope` (PM v6 F-01, TE v6 F-01 — which retracts the second half of TE v5 F-02, the claim v1.4
transcribed).

*A citation hazard worth carrying (PM v7 F-03).* The citation is to `advisoryConfig.test.js`'s
`describe("PROP-CFG-02 — absent/unreadable/malformed input yields ADVISORY_DEFAULTS (T-01-1)")`,
**not** to PROPERTIES' `PROP-CFG-02`, which is the `waveBudgetPerRun`-through-`nonNegativeInt`
property and ships in this same file under a second `describe` wearing the same id,
`PROP-CFG-02 (A6-02)`. `PROP-CFG-01` collides the same way. A reader who follows the id into
PROPERTIES lands on the wrong property; follow the file and the `T-01-1` deep-equality instead. The
collision is worth knowing at the bench too, since a red `PROP-CFG-02` names either property.

*Seam side — seven sites, seven failures,* all red against the five-member `export const
ADVISORY_SEAMS`:

- `advisoryEnvelope.test.js`'s `ADVISORY_SEAMS` six-member deep-equality.
- `advisoryDriver.test.js`'s `PROP-GATE-06` key-set equality — its `GATE_EXCLUSIVITY_REGISTRY`
  already carries the `A6` row, so the diff is one line, `+ "A6"`.
- `advisoryHarvest.test.js`'s `T-08-6` (six rows plus the `seamNames` equality).
- `advisoryHarvest.test.js`'s `T-08-8` row count — which no review named and only the run surfaced.
- `advisoryDisabled.test.js`'s `T-10-5 / PROP-DIS-05`.
- `advisoryQueueSeams.test.js`'s **`S-5`**, carrying the `ADVISORY_SEAMS drives the row list (S-1)`
  assertion. The `S-1` is the trailing comment on the assertion; `S-5` is the name the runner prints
  and the one to match a red run against (PM v8 F-04, TE v8 Q-02).
- `advisoryRecord.test.js`'s `T-08-10 / PROP-SUM-02` `test.each` identity case, whose `A6` entry
  finds no row.

**The two green inputs**: `consolidationProperties.test.js`'s generator pick
(`rng.pick(["A1" … "A6"])`) and `helpers/advisoryDoubles.js`'s `SEAMS` constant. Both verified at
six members at HEAD.

**All four bare `toHaveLength(6)` sites read `6` at HEAD**, checked individually:
`advisoryDisabled.test.js`, `advisoryQueueSeams.test.js` and both of `advisoryHarvest.test.js`'s.

**All ten oracles clear at `A6-05`'s single wave boundary.** PLAN's `A6-05` row — cited by task row
rather than by version, since the claim was measured at HEAD and PLAN's revision table has since
moved past the v1.3 this passage used to name (PM v8 F-03) — carries a **Green step (A6-05 proper)**
that lands `export const ENVELOPE_DEFAULTS` + `E-5`, `E-6` and `export const ADVISORY_DEFAULTS`
gaining `waveBudgetPerRun` in the *same* green step of the *same* task, so nothing splits them in
time (TE v7 F-01). There is no point at which the suite is uniformly green mid-task, and a member
still red at that boundary is an **incomplete green step**, not a false alarm: the wave gate has no
expected-red channel and will halt on it. Scheduling is PLAN's to state; this document states the
taxonomy only, and points at `A6-05` for when.

The symmetric signal is worth stating because the wave gate cannot raise it: a member of this column
that goes **green before** `A6-05`'s green step means production moved outside the task that owns it,
which is drift to escalate rather than progress to bank (PM v8 Q-02).

**An earlier keying, withdrawn.** v1.5 said the opposite of the above and keyed it to `A-17` — a task
id that does not exist in PLAN at all (`grep -c "A-17"` over PLAN returns `0` at HEAD; it survives
only in `helpers/advisoryDoubles.js`'s hand-sync comment, "authored by A-17, a downstream task",
which is where the record picked it up) — and to `A6-02` as if it landed production, when PLAN's v1.3
restructure row folded `A6-02` into `A6-05` as a **red test step**. That reassurance was backwards
and is withdrawn.

**Where TSPEC §1.3 stands to this.** §1.3's `ENVELOPE_DEFAULTS` row is the drift row for
`advisoryEnvelope`'s set-equality; §1.3's `ADVISORY_DEFAULTS` row records a *different* drift
(`waveBudgetPerRun` already present against an absent production key) and says nothing about that
file's envelope member, so the `advisoryConfig` envelope observation is this document's own and not
§1.3's (PM v5 F-02). §1.3 remains the carrier of which surfaces have **drifted**; this document only
**sizes the task**.

**The other ten failures in the run are not this column.** `ADVISORY_ROOT_CAUSES`, `A6_PROHIBITIONS`,
the seven `nonNegativeInt` validator arms and `P-1` are red because production lacks a symbol A6
*creates*, not a member it *grows*, so they size as new behaviour under column (1)'s task rather than
as drift. (14 column-(2) failures + 10 new-symbol failures = the run's 24, with none left over and
none double-counted.)

### Column (3) — ungated hand-copy surfaces: **twenty-five**

No gate demands these, but a later editor reads them, and the prose-site rule — **a comment that
restates a set-equality literal is a maintenance site like any other** — makes them count
(TE v6 F-02, corrected for membership by PM v7 F-02 / TE v7 F-03, raised to twenty-five by
PM v8 F-02 / TE v8 F-01). Applied to both halves and to the whole surface the recipe names, it
yields **seventeen seam prose sites** and **eight envelope/defaults hand-copy sites**.

**Seventeen seam prose sites.** Fourteen test-side:

- `advisoryRecord.test.js` (three): `PROP-SUM-01`'s header comment ("always emits five rows, one per
  `ADVISORY_SEAMS` member"), its `describe` title and its `test` title ("all five seams").
- `advisoryDisabled.test.js` (three): `T-10-5 / PROP-DIS-05`'s header comment, `describe` title and
  `test` title, all "five zero rows".
- `advisoryHarvest.test.js` (four): `T-08-6`'s header comment, `describe` title, `it` title ("carries
  five rows, four of them all-zero"), and the "five rows always, zero counts included" comment.
- `advisoryDriver.test.js` (four): the `T-03-6` comment above the registry ("the five per-seam
  gate-exclusivity cases, one per `ADVISORY_SEAMS` member (PROP-GATE-01…05)"); the generated-cases
  banner that repeats "(PROP-GATE-01…05)" while the registry banner above it already reads
  "PROP-GATE-01…06"; and the **two generated `it` titles** that restate the same range,
  `${seam} — verifyGate is null; resolved is unreachable on every path … (PROP-GATE-01…05, TSPEC
  §5.5, §6.5)` and `${seam} — resolved is reachable only through its declared verifyGate …
  (PROP-GATE-01…05)`. Those two titles are the sharpest of the seam sites, because once `A6` joins
  the registry they *print* at runtime naming a five-member range for the A6 case (TE v8 F-01). The
  offset v1.6 gave for the banner was wrong and is simply dropped — the content anchors carry the
  argument, per `DEC-DOC-01` (TE v8 F-02).

And three production-side, in the very file the green step edits (`orchestrate-dev.js`, PM v8 F-02):
"`ADVISORY_SEAMS` drives the row list (S-1), so five rows always appear"; "still carries five zero
rows rather than `undefined` (T-10-5)"; and "S-1: an enabled tier always reports its five rows".

**Eight envelope/defaults hand-copy sites.** The **production definition** is `ENVELOPE_DEFAULTS` in
`orchestrate-dev.js`; these are what a later editor reads to decide whether their copy of it is still
right, and where a stale copy silently re-scopes a fixture instead of reddening a suite:

- **Five test-side transcriptions** still carrying the four-member value: `advisoryDisabled.test.js`'s
  local `disabledConfig()` fixture and its inline enabled-config object, `advisoryHarvest.test.js`'s
  config fixture, and the frozen `ADVISORY_DEFAULTS_SHAPE` plus the property generator's shuffle in
  `helpers/advisoryDoubles.js`.
- `helpers/advisoryDoubles.js`'s hand-sync comment, which records why the frozen shape must be
  hand-synced and restates the literal itself (TE v2 F-03).
- `advisoryConfig.test.js`'s "`ADVISORY_DEFAULTS`' own key set is exactly the five keys" title —
  already at the post-A6 count, and a prose site nonetheless.
- The sharpest of the envelope side: `orchestrate-dev.js`'s `envelope: ENVELOPE_DEFAULTS, // the
  four-member literal above`, a comment sitting on a line the green step itself changes, which
  becomes actively false the moment `E-5`/`E-6` land.

**None of the five transcriptions is an oracle** (TE v5 F-01). Each is an *input* — config objects
fed to the code under test, a double's frozen shape, a generator's shuffle — so when
`ENVELOPE_DEFAULTS` grows to six members all five stay green and no gate demands their edit. That is
a real maintenance argument, and it is the one the shared-double bullet below rests on, but it is a
different claim from "still moves", which is how v1.3 framed it. An implementer sizing A6 off the
older wording would budget five edits no gate asks for.

### Excluded false positives

Each read in context rather than grepped:

- `advisoryRecord.test.js`'s "the table stays exactly five rows regardless of the injected newline",
  and its twin at the head of the same file — they count the diagnosis table's five
  `| Field | Value |` rows (Seam, Confidence, Envelope, Disposition, Model), which does not move at
  A6 (TE v7 F-03).
- `advisoryDisabled.test.js`'s A-15 capture note ("five seams" = the seams of an earlier run).
- `advisoryQueueSeams.test.js`'s "five canonical shapes" (double kinds).
- `advisoryEnvelope.test.js`'s "five `ADVISORY_REFUSAL_REASONS` members" (a different vocabulary).
- `pipelineWiring.test.js`'s `_`-prefixed `NEW_SEAMS` (a different notion of seam).
- `helpers/advisoryDoubles.js`'s "Returns five generator *functions*" — surfaced by re-running the
  recipe for this revision; its referent is the generator set, not any advisory constant.
- `orchestrate-dev.js`'s "all five are total" (the record parsers) and "when all five are satisfied"
  (LEARNINGS sections), neither of which has an advisory referent.

### How to re-derive column (3) instead of trusting it

The count is a measurement with a short shelf life, and three rounds shipped a stale one. Grep the
advisory suites *and* `orchestrate-dev.js` for **both** `five` and `01…05`-style range restatements,
read each hit in context, and keep only those whose referent is `ADVISORY_SEAMS`,
`ENVELOPE_DEFAULTS` or `ADVISORY_DEFAULTS`:

```
cd pdlc/workflows && grep -rn 'five\|01…05' \
  __tests__/advisory*.test.js __tests__/helpers/advisoryDoubles.js orchestrate-dev.js
```

The one-pattern grep is what missed `advisoryDriver.test.js`'s "(PROP-GATE-01…05)", which contains no
digit-free cardinality word at all.

### `dist/pdlc-cli.mjs` is in no column

(PM v6/v7 Q-02.) It carries its own copies of `ENVELOPE_DEFAULTS` and of the "four-member literal
above" comment, but it is a generated artifact that is never hand-edited — the wave gate's own
`postWaveCommand` regenerates it and stages `pdlc/workflows/dist/` (CLAUDE.md, DEC-08). An
implementer who greps the constant repo-wide will find it; the instruction is to leave it alone and
let the gate rebuild it.

### Why this stays one task

The shared double is the coupling the other two surfaces do not have: `advisoryDoubles.js` carries
*both* literals plus the frozen defaults shape, so a partial edit reddens tests in files that never
mention the changed constant, with a failure reason the plan cannot predict. Sequencing all of this
as **one task remains the right call** — that co-movement is the failure class A6 itself exists to
survive. Column (3)'s tail is long and will stay long; the number an implementer must not get wrong
is column (1)'s four.

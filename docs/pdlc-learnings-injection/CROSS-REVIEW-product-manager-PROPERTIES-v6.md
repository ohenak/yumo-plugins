# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation — PROPERTIES bytes unchanged, PLAN moved v0.5 → v0.6)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · DECISIONS `sha256:56617f5ab31a…` · PLAN
`sha256:d028d972450c…` (**v0.6**, was v0.5 `sha256:4510f9c3f12b…` at my v5) · PROPERTIES under
review `sha256:6d74d3eb5a23…` (**v0.3**, byte-identical to the version I approved at v5), branch
`feat-pdlc-learnings-injection` at `fdcdefec`.

## Overview

**The question.** I approved PROPERTIES v0.3 at round v5. Its bytes have not moved
(`sha256:6d74d3eb5a23…`, the same subject my v5 measured). What moved is **PLAN**, from v0.5
(`4510f9c3f12b…`) to v0.6 (`d028d972450c…`) — an erratum round of **23 insertions / 2 deletions**
across three commits (`748659c0`, `92e5d178`, `6a2d3007`), so my approval was recorded against a
PLAN that no longer exists. The single question here: is PROPERTIES v0.3 still a faithful
compression of PLAN as it now stands?

**What the PLAN erratum did.** Three edits, no more:

1. §The three gate wordings gains a paragraph **Amendment commits on landed suites (P-A-7)**, which
   names the expected-red ledger rows the heading-form follow-up commit owes, in two cases:
   **A** — the commit lands before batch 7 ⇒ **no** row is added, because `learningsBlock.test.js`
   is already ledgered as a **whole-suite** red after batches 7–8 and greens entire at LI-17 /
   batch 9; **B** — the commit lands at batch 9 or later ⇒ the ledger gains
   `learningsBlock` → **`LI-AT-11`'s heading-form cases only**, stated in test names, for every
   batch from the landing batch through the batch that greens them. `learningsFixtures.js`'s other
   consumers carry no row, because the declared-heading-form knob is additive over the landed
   helper's ordinal/gloss rendering.
2. LI-08's row appends a pointer to that paragraph.
3. The version cell reads 0.6 and a changelog row records the round.

The changelog's own closing sentence — *"no task moved batch, no `Deps` edge changed, no AT
partition or fixture was touched"* — is confirmed by the diff.

**Answer: PROPERTIES still holds as approved, with three documentation-fidelity items and no
behavioural change.** Every property's trace (`red LI-xx` / `green LI-yy`), every AT id, every
fixture, every oracle and §C.3's 23-of-23 task accounting are untouched by this erratum, because the
erratum touched none of the things they cite. What *is* now stale is PROPERTIES §C.4's own narrative
about this very erratum: it says the naming "is the PLAN's to do and is routed as an erratum" — the
erratum has since landed, and it landed scoped more narrowly than §C.4's sentence anticipates. All
three items below are Medium or Low, none gates, and none touches an oracle.

## Properties

**Nothing in the property catalogue moves.** The erratum added no task, moved no task between
batches, changed no `Deps` edge, added no AT id and invalidated no fixture, so the three things every
property in this document leans on PLAN for — its **owning red task**, its **owning green task**, and
its place in §C.3's task accounting — are all unchanged.

Checked directly against PLAN v0.6 rather than assumed:

| PROPERTIES claim about PLAN | Status at PLAN v0.6 |
|---|---|
| The 70 properties trace to red/green pairs LI-07/LI-16, LI-08/LI-17, LI-10/LI-19, LI-12/LI-21, LI-14, LI-23 | Holds — every one of those rows is byte-unchanged except LI-08, whose only edit is the appended pointer to the new paragraph |
| §C.3 "23 of 23 tasks accounted for"; LI-02 and LI-22 own no property by design | Holds — the task table still has 23 rows, LI-02 is still the fixture helper with no property of its own |
| §C.4's fourteen-file ownership table mirrors PLAN §File-ownership manifest | Holds — the manifest is untouched; the erratum explicitly states ownership does not move and the single-writer manifest is unchanged |
| PROP-RECORD-06/07's batch-11/13 split rides PLAN's LI-19 / LI-21 split of BR-10's two loci, with `LI-AT-22`'s run-level half in the expected-red ledger for batches 11–12 | Holds — LI-10's row carries that split verbatim, and the erratum did not touch it |
| PROP-CONFIG-09 matches LI-12's three-case `LI-AT-30` (including the `maxBytesPerDocument: 0` arm) | Holds — LI-12's row is byte-unchanged |
| PROP-BOUND-05/08's §D.3 heading-recognition oracle is red by LI-08 / green by LI-17 | Holds, and is now *better* supported: LI-08's row still declares the non-canonical heading forms and the `## Process Findings` near-miss, and the new paragraph says how their re-red is ledgered |

One PLAN-facing sentence in PROPERTIES is now **stale in the direction of understating upstream**:
§C.4's *"PLAN's LI-08 v0.5 amendment note assigns the follow-up commit to the existing owners but
does not name the ledger rows; that naming is the PLAN's to do and is routed as an erratum, not
decided here."* At HEAD, PLAN **does** name them. The routed item is answered, so the sentence should
read as closed rather than open (F-02). The neighbouring claim it exists to protect — *"No property
of this document changes either way"* — is confirmed by PLAN v0.6, not contradicted by it: both of
the paragraph's cases add or drop **zero** rows that any property here names.

The upstream pin in the header table still reads `PLAN-…md` **(v0.5)** (F-01). No property depends on
the pin, but the pin is what the next reviewer measures the document against.

## Oracles

**No oracle in this document reads PLAN.** Every oracle here is stated over REQ acceptance criteria,
FSPEC business rules and acceptance tests, or TSPEC sections — PLAN enters only as scheduling (which
task reds it, which greens it). The erratum changed scheduling *narrative*, not scheduling, so §O.1…
§O.9 and the §O.8 mutation ledger are unaffected. Spot-checked: PROP-BOUND-03's four-field zero
return (TSPEC §I.3), PROP-BOUND-05/08's rendered-block heading oracle (TSPEC §D.3), PROP-BOUND-07's
mechanical byte sum (§D.3 normalise-join-cut), PROP-CONFIG-09's E-36 run-level conjuncts — all cite
FSPEC v0.13 / TSPEC v0.9, both of which are at the shas this dispatch pins.

**One coverage question the erratum opens, and it is the only substantive item of this round.**
§C.4 lists **three** properties whose amendments land in the already-committed
`learningsBlock.test.js` — PROP-BOUND-05, **PROP-BOUND-07** and PROP-BOUND-08 — and PROP-BOUND-03's
own text adds a fourth ("one added case in `learningsBlock.test.js` (landed, 7.6 K) under the
**existing** LI-08 red / LI-17 green tasks"). PLAN v0.6's new paragraph answers the ledger question
for the **heading-form** subset only:

- **Case A** (commit lands before batch 7) is stated suite-wide and covers all four: the row that
  makes it correct is the ledger's **whole-suite** red for `learningsBlock` after batches 7–8, which
  is indifferent to which cases inside the suite are red.
- **Case B** (commit lands at batch 9 or later) is stated per-case: the ledger gains
  `learningsBlock` → *"`LI-AT-11`'s heading-form cases only"*. Read literally, an amendment landing
  after batch 9 that carries PROP-BOUND-07's re-hand-computed byte literals, or PROP-BOUND-03's
  zero-bound case, has **no** named row — the same defect the erratum was raised to fix, one scope
  narrower.

This is a Medium, not a High, for two reasons. First, it is contingent: case A is the scheduled path
(the whole point of "before batch 7"), and on case A the row set is provably empty for all four
properties. Second, no oracle, fixture, AT id or trace in PROPERTIES changes under either reading —
§C.4's "No property of this document changes either way" survives. What is needed is one sentence in
§C.4 recording that PLAN v0.6 has now named the rows, and that case B's naming covers the
heading-form cases specifically, so an amendment carrying PROP-BOUND-03/07's cases after batch 9
takes the same route (F-03). Whether PLAN then widens case B's wording is PLAN's call, not this
document's.

## Fixtures

**No fixture is invalidated.** PLAN v0.6's changelog asserts it (*"no AT partition or fixture was
touched"*) and the diff bears it out: the only fixture-adjacent sentence the erratum adds is the
statement that `__tests__/helpers/learningsFixtures.js`'s declared-heading-form knob is **additive**
over `buildLearningsCorpus`'s landed section spec — the helper already renders an optional ordinal
and an optional gloss, and callers declaring neither keep byte-identical output.

That additivity claim is *load-bearing for this document*, so I checked it against the properties
that would notice if it were false:

| PROPERTIES fixture dependency | Effect of the erratum |
|---|---|
| §F.1's named corpus fixtures (`NO-MATERIAL`, `ZERO-BOUND`, `DIVERGENT-CORPUS`, the five-section AT-11 fixture) | Unchanged; all are declared through the same helper, none declares an ordinal or gloss, so their bytes hold |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | Unchanged — byte-identical fixture output is exactly what additivity promises, so the literals do not need recomputing |
| PROP-BOUND-08's **real-corpus** arm (first `git ls-files` path, 9 documents at HEAD, all five canonical headings) | Unaffected — it reads the live corpus, not the helper |
| PROP-ISOLATE-01's deliberate gate-token strengthening | Unaffected |
| §C.4's "seven of fourteen files have landed" measurement | Still true at `fdcdefec`; the follow-up commit the erratum describes has not landed yet |

The erratum also names the failure mode that would break these rows — a *non-additive* future helper
amendment — and pre-commits PLAN to ledgering the moved consumer suites by name first. That is
strictly protective of this document's fixtures, and worth keeping.

**Positive observations.**

- The erratum resolves an item this document itself routed upward, in the direction §C.4 asked for,
  and does so without touching a single row this document traces to. That is a clean cascade.
- Case A's argument — *no row is added because the suite is already ledgered red as a whole* — is the
  right shape of answer: it derives the empty row-set from the existing ledger instead of asserting
  it.
- Naming the non-additive-helper escape hatch in advance means the next amendment cannot silently
  move a consumer suite's status out from under PROP-CORPUS-* and PROP-SELECT-*.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the heading-form follow-up commit expected on the scheduled path (case A, before batch 7)? If yes, F-03 collapses to a note; if the commit may land after LI-17, PLAN's case B wording is the one to widen |

## Recommendation

**Approved with minor changes** — PROPERTIES v0.3 still holds as approved against PLAN v0.6. No High
finding: no property, oracle, fixture, AT id or red/green trace is disturbed by the erratum. The
three items are documentation fidelity in §C.4 and the upstream pin, and can be taken in the next
ordinary revision of this document.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | Header table pins `PLAN-pdlc-learnings-injection.md` at **v0.5**; PLAN is v0.6 (`sha256:d028d972450c…`) at HEAD. Update the pin and the parenthetical to name what v0.6 added (P-A-7 amendment rows), so the next reviewer measures against the right upstream | Header table, `Upstream` row |
| F-02 | Low | delta | local | §C.4 states *"PLAN's LI-08 v0.5 amendment note … does not name the ledger rows; that naming is the PLAN's to do and is routed as an erratum, not decided here."* PLAN v0.6 §The three gate wordings now names them under **Amendment commits on landed suites (P-A-7)**. Restate the routed item as **answered**, citing that paragraph, and keep the unchanged conclusion "No property of this document changes either way" | §C.4, "On the re-red of landed suites (SE Q-02)" |
| F-03 | Medium | delta | local | PLAN v0.6's case B names the re-red rows as *"`LI-AT-11`'s heading-form cases only"*, while §C.4 scopes the landed-suite re-red to **PROP-BOUND-05/07/08** and PROP-BOUND-03 adds a further case to the same landed `learningsBlock.test.js`. Case A covers all four (whole-suite red after batches 7–8); case B, read literally, names none but the heading-form cases. Record in §C.4 which properties travel under which case, so an amendment landing at batch 9+ with PROP-BOUND-03/07's cases is not unledgered. No oracle, AT id or fixture changes either way | §C.4 / §O-facing note on PROP-BOUND-03/05/07/08 |

FINDING: Low | delta | local | Header table `Upstream` row | PLAN pin still reads v0.5; PLAN is v0.6 (sha256:d028d972450c…) at HEAD
FINDING: Low | delta | local | §C.4 "On the re-red of landed suites (SE Q-02)" | Says PLAN "does not name the ledger rows" and routes it as an erratum; PLAN v0.6 now names them under "Amendment commits on landed suites (P-A-7)", so the routed item should read as answered
FINDING: Medium | delta | local | §C.4 landed-suite re-red scope | PLAN v0.6 case B names only LI-AT-11's heading-form cases, but §C.4 scopes the landed-suite re-red to PROP-BOUND-05/07/08 (and PROP-BOUND-03 adds a case to the same landed suite); state which properties travel under case A vs case B so a batch-9+ amendment carrying PROP-BOUND-03/07's cases is not unledgered

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6
APPROVAL-HASH-NORMALIZED: sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6
REVIEWED-COMMIT: 5fceba19fe280ee53cc83175e7a82aff7fa3c6b9
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d
UPSTREAM-STATE: TSPEC sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131
UPSTREAM-STATE: DECISIONS sha256:56617f5ab31a8158a33b702ec4a21e8cf1f167b9ef1d78c8e2793976a645bd32
UPSTREAM-STATE: PLAN sha256:d028d972450c5da27bba6362db9e77b0125441d1b7d7f835d1caae968feafe09

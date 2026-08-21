# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.5)
**Date:** 2026-08-20
**Iteration:** 8

## Overview

PLAN moved: v0.4 -> **v0.5**, six commits (`96cf89a5` ... `7bcbce64`) since the bytes my v7
confirmation measured. This is a delta re-review scoped to those commits and to whether my five v7
findings closed.

| v7 finding | Sev | Status at v0.5 |
|---|---|---|
| F-01 — `LI-AT-30` commissions two cases; FSPEC v0.13's AT-30 has three, and no row owns the zero-bound production half | High | **Partly closed.** The three cases and a strong oracle landed (`96cf89a5`); the production half is still unowned — carried forward as this round's F-01, at **Medium** |
| F-02 — §Traceability's `RSN-NO-MATERIAL` branch states one cause and one AT | Medium | **Closed.** The arm-table row now carries both disjuncts, both ATs and both owner pairs (`3d6b0972`) |
| F-03 — errata section routes ERR-3/ERR-7 as live | Medium | **Closed.** Both recorded CLOSED with the FSPEC version that resolved each (`f6570869`) |
| F-04 — claim 4 scopes byte-identity to "non-authoring" dispatches | Medium | **Closed.** Restated as dispatches **outside BR-1's rule**, naming Phase CR's authoring-classified non-C-1 round as inside the promise (`af975290`) |
| F-05 — four stale version pins | Low | **Closed in substance.** The upstream matter row, §Overview and LI-01's edge rationale now read FSPEC v0.13 / TSPEC v0.9; the changelog's 0.1 row correctly keeps its historical pins |

The revision is accurate where it matters most. The zero-threshold case that blocked v7 is now
commissioned with an oracle **stronger** than the one I asked for: three positive conjuncts rather
than a widened enumeration, including the no-slot conjunct that kills the mutation. Checked against
upstream at HEAD, LI-12's new text is a faithful compression of TSPEC §I.2 (three zeros; the third
alone asserting reject rows; set equality over rejects, "not merely an empty `selected`") and of
FSPEC AT-30 (three cases, and in the `maxBytesPerDocument: 0` case every corpus document carrying
`RSN-NO-MATERIAL`, E-36).

Three Mediums remain, all bounded to sections this round touched, and none of them is a behaviour
this PLAN now fails to commission a test for — which is why none is High. The v7 High was "a
behaviour FSPEC guarantees and this PLAN commissions no test for"; that is closed. What is left is
*which task writes the production code*, and two precision holes inside the new text.

**Method.** Ran the delta (`git diff f08bfbf8..HEAD` on the PLAN), re-read v7, then verified every
new claim against upstream at HEAD and against code already landed on this branch: FSPEC AT-30 and
the E-36 edge row, TSPEC §I.2, §D.3, §D.5, §T.7 and ERR-8, and the landed
`pdlc/workflows/__tests__/learningsBlock.test.js` and
`pdlc/workflows/__tests__/helpers/learningsFixtures.js`.

## Batches

**LI-12 (batch 5) — v7's F-01 first clause, closed and then some.** The row now commissions
`LI-AT-30` as three cases, one per zero threshold, each an enabled run with BR-8's rows present and
empty, "never the absent key of a disabled run and never a refusal to run". Against FSPEC AT-30 at
HEAD ("`maxDocuments: 0`, separately `maxTotalBytes: 0`, and separately `maxBytesPerDocument: 0` …
*and* in the `maxBytesPerDocument: 0` case every corpus document carries `RSN-NO-MATERIAL` (E-36)")
this is an exact compression, and the three-conjunct oracle goes past it in the right direction:

- (i) key **present** with empty rows — the positive half that keeps this from being an absence-only
  oracle. A bare "selection is empty" would be satisfied by a disabled run, a refusal, or a crashed
  injector; the row says so in terms.
- (ii) `rejected[]` **set-equal** to every enumerated non-self corpus path at reason
  `RSN-NO-MATERIAL`, none `bounded` — set equality, "never 'at least one'". This is the enumerated-
  contract discipline stated where a test author reads it.
- (iii) **no** document carries `RSN-COUNT` — the no-slot conjunct. This is the one I did not ask
  for and the one that earns the round: it is exactly the assertion that falsifies an implementation
  taking a zero-byte first-section cut and burning `maxDocuments` slots, which is the shape TSPEC
  §D.5 carves out and FSPEC E-36 forbids.

**But conjunct (iii) is vacuous on a small fixture, and the row does not close that.** `RSN-COUNT`
rows only exist when the eligible set exceeds `maxDocuments`; REQ §4.1 sets that default at **5
documents per dispatch**. If the zero-bound fixture's eligible non-self corpus has five or fewer
documents, an implementation that applies the count bound *before* extraction — FSPEC Step 5's
literal item order, items 15–16 — still produces no `RSN-COUNT` row, and (iii) passes against the
very mutation it was written to catch. The fix is one clause: the third case's corpus must carry
**more** eligible non-self documents than `maxDocuments` in force, or configure `maxDocuments` below
the corpus size, so (iii) is a live assertion rather than a tautology. F-02 this round.

**LI-08 and LI-02 (batches 3 and 1) — F-O-1's second rule, well mapped, with two blemishes.** The
new `LI-AT-11` clause is a faithful transcription of TSPEC §D.3's matcher: "exactly two `#`, an
optional ordinal stripped and discarded (it is not the priority), an optional trailing gloss, and
otherwise exact case-sensitive comparison against `BR6_SECTION_NAMES`" — §D.3 says precisely that,
including that the ordinal "is *not* the priority" and that a `###` sub-heading is body text. The
named variants (un-numbered `## Cross-Feature Patterns`, un-glossed `## Rejected Proposals`, a `###`
sub-heading, near-miss `## Process Findings` that must not match) are the right four, and the
near-miss is the one §D.3 measured from E-33. Routing the shapes to LI-02's spec surface rather than
ad hoc into the suite keeps the no-ad-hoc-corpus-builder rule intact.

Two blemishes, both Low (F-04):

- The **amendment note is spliced into the middle of the AT enumeration**, so `LI-AT-12` now dangles
  after "Ownership does not move, so the single-writer manifest is unchanged, `LI-AT-12` (the
  character-safe cut …)". Nothing is lost — `LI-AT-12` is still named and still glossed — but the
  row is the artifact a test author works from, and its list of three ATs no longer reads as one.
- The note's factual claim is **narrower than stated**. It says the landed files "use the bare-title
  form only". True of the *fixtures*: `learningsBlock.test.js`'s `LI-AT-11` builds six sections with
  bare `name` values and no `ordinal`. Not true of the *helper*: `renderSection` in
  `__tests__/helpers/learningsFixtures.js` already takes `section.ordinal` and `section.gloss` and
  renders `## {ordinal}. {name} ({gloss})`, and `name` is free-form, so the near-miss title is
  already expressible. The only genuinely absent knob is the `###` sub-heading form. Saying so
  scopes the amendment to what it is — a fixture change plus one helper knob — instead of implying a
  larger edit to a file two later tasks depend on.

**The landed suites do honour what the row promises elsewhere.** `LI-AT-11` asserts
`result.sections` `toEqual(BR6_SECTION_NAMES)` — set-and-order equality over the full enumeration,
not containment — and pairs its one negative (`not.toContain("APPROVAL_MARKER")`) with five positive
marker assertions on the same call. `LI-AT-12`'s expected byte counts are committed as literal
integers with the arithmetic spelled out in a comment, never derived via `Buffer.byteLength` inside
an assertion. That is the standard this PLAN asked for and it is being met in the code.

## Dependencies

**No edge moved, and the changelog's claim to that effect checks out.** v0.5 closes with "No task
moved batch, no `Deps` edge changed, no fixture was invalidated". I diffed the batch ladder, the
`Deps` column and the edge-justification table across `f08bfbf8..HEAD`: the only touched line in
§Dependencies is LI-01's edge rationale, where "since TSPEC v0.6" became "since TSPEC v0.9" — a pin,
not an edge. The ordering claim holds.

**The zero-bound routing is where ownership went wrong, and it is a dependency question.** v7's F-01
had two clauses. The first — widen the gloss — landed. The second — "state which task owns the
production half … on the current text that is LI-16" — did not, and the arm table now answers it in
a way the task rows do not support:

> `… | AT-28 (structural disjunct); AT-30 case 3 (zero-bound disjunct) | LI-07 / LI-16 (structural);
> LI-12 / LI-21 (zero-bound) |`

`LI-12 / LI-21` is right about the *suite* (LI-12 reds `learningsConfig.test.js`, LI-21 greens it)
and wrong about the *code*. TSPEC §D.5 puts the zero-bound behaviour in two functions:
`extractInjectableMaterial` must test the bound before the cut and return
`{material: "", bounded: false, bytes: 0, sections: []}` at `maxBytes <= 0`, and `selectLearnings`
must drop on *yields no material* **before** the count and total bounds so no slot is consumed. Both
functions are LI-16's seams — LI-16's row is the task that writes them, at batch 8. LI-21's row
enumerates its own edits precisely and none of them reaches either function: read the config once
per run, push notices onto `buildFinalReport`'s existing `notices` channel, build the injector, hang
it on `wrapperSeams`, build `ruleInputs.thresholds`, add one conditionally-spread
`learningsInjection` parameter.

So on the current text the zero-bound branch is greened at batch 13 by a task whose stated scope
does not contain it, out of a seam another task closed at batch 8. Nothing breaks mechanically —
LI-21 does write `orchestrate-dev.js`, so the single-writer manifest is not violated, and LI-12's
red holds the line until someone implements it — but the batch-8 author is reading a row that points
the other way, which is the second half of this finding.

**LI-16's row still glosses the extractor in the pre-E-36 terms.** It commissions
`extractInjectableMaterial` as "(BR-6 priority order, character-safe cut, `bounded` decided at the
cut)". At a zero bound TSPEC §D.5 says the opposite in terms: "`bounded` is `false` — … `bounded`
records that a cut occurred, and at a zero bound nothing is taken, so nothing is cut. Reading the
unamended cut-and-flag rule … would give `{bytes: 0, bounded: true}` on a *selected* document — the
shape FSPEC v0.13 explicitly carves out." The row cites §D.5 wholesale, and this PLAN's convention
is that the TSPEC wins where a row and the TSPEC disagree — that is the defence, and it is why this
is Medium rather than High. But the row's parenthetical is now a **positively misleading** gloss on
the one case the round exists to cover, and `selectLearnings`'s gloss says nothing about extracting
before the count bound. One clause in each closes it.

**Why Medium and not High.** The v7 High was scored on user impact: an operator configures
`maxBytesPerDocument: 0`, gets a behaviour FSPEC guarantees, and no test proves it. That is gone —
LI-12's third case, with conjunct (iii) fixed per F-02, proves it, and it cannot ship silently
broken. What remains is a routing and rework cost inside the engineering lane: an implementer misled
at batch 8 reds at batch 13 and reopens a closed seam. That is a plan-hygiene defect, recorded and
fixable in two clauses, not a product-fidelity failure.

## Verification

**v7 F-02 — the decision-branch row — is closed, and matches TSPEC verbatim in structure.** The row
now reads "document **yields no material** ⇒ `RSN-NO-MATERIAL`, dropped before the bounds, no slot
consumed … **Two disjuncts, one branch**: no `BR6_SECTION_NAMES` heading present (E-33), **or**
`maxBytesPerDocument: 0` admits none (E-36) | AT-28 (structural disjunct); AT-30 case 3 (zero-bound
disjunct)". TSPEC §T.7's own row states the same two disjuncts, the same one branch and the same two
ATs. FSPEC's DC-05 closure ("every branch of the D-1 … D-12 decision table is exercised") is now
answered by PLAN with both causes named and both ATs cross-referenced. The owner columns are the
issue, not the branch statement — see F-01.

**The arm arithmetic survived the widening, and PLAN explains why in one sentence.** "Twelve arms,
twelve entering tasks — **thirteen** entering cases, because the `RSN-NO-MATERIAL` arm is entered by
two disjuncts and TSPEC §T.7 keeps them as one row, one branch." That is the right distinction:
LI-23's set equality is taken over reason **codes**, and E-36 widened what a code means without
minting one. `LEARNINGS_CORPUS_OUTCOMES`, `LEARNINGS_REJECT_REASONS` and `LEARNINGS_NOTICES` are
unchanged in TSPEC, so LI-23's oracle, its `Deps` edge and P-A-4's "no thirteenth fixture shape is
scheduled" all stand.

**v7 F-04 — claim 4's baseline scope — is closed correctly.** DoD 4 now reads "every dispatch
**outside BR-1's rule** likewise (AC-4.3) — the scope FSPEC AT-03/AT-29 and TSPEC §A.2 state, which
is wider than 'non-authoring'", and spells out the case: BR-1 carries a block only when the dispatch
is authoring-classified **and** its target is one of C-1's six, so Phase CR's optimizer round —
authoring-classified, `docType: null`, no C-1 target — is inside the promise. FSPEC AT-29 at HEAD
says "every dispatch prompt outside BR-1's rule is byte-identical to the recorded baseline". The
compression no longer promises less than upstream. This one had been open since v5; good to see it
land in the same pass.

**v7 F-03 — the errata section — is closed, but the rewrite drops a live erratum (F-03 this
round).** ERR-7 and ERR-3 are now recorded CLOSED, each with the FSPEC version that resolved it and
a "no effect on this PLAN" column, which is exactly right and is confirmed upstream: TSPEC's erratum
register marks ERR-7 "CLOSED, resolved by FSPEC v0.11 and v0.12". The section then makes a set
claim — "TSPEC's remaining open errata (**ERR-1, ERR-2, ERR-5**) are unchanged by this document and
are not re-raised here" — and that set is incomplete. TSPEC v0.9 carries **ERR-8** open, against
FSPEC's Step 5 items 15–16, and it is the one erratum in the register written *to this document's
author*: "what needs correcting is the item ordering, so the PLAN author reading the procedure
sequentially does not implement the shape E-36 carves out." I confirmed the defect is still live in
FSPEC at HEAD: item 15 drops on the structural condition, item 16 extracts, and the count cut sits
between them.

That omission is not cosmetic in this round of all rounds. ERR-8 *is* F-01's problem stated from the
upstream side, and a PLAN that enumerated it would have had nowhere to put it except LI-16's row —
which is the clause F-01 asks for. One added line in the open-errata list, and one in LI-16, close
both. I route ERR-8 upward as an ERRATUM as well, since FSPEC has not absorbed it across three
erratum rounds.

**The 35-AT partition, `LI-T-SUITEMAP` and the expected-red ledger are untouched, as claimed.**
LI-12's row states the reason itself: "Adding a case to an existing AT leaves §T.5's per-file AT
counts at 2 for this suite, so `LI-T-SUITEMAP`'s partition, the `Batch` column and every `Deps` edge
are untouched." FSPEC v0.13 added an edge (E-36) and widened an AT; it minted no AT, so
§Traceability's "All 35 … each appearing exactly once" and its arithmetic still hold, and DoD 1 is
unaffected.

**One trivial over-claim in the changelog (F-05).** The v0.5 row says "the four stale version pins
now read FSPEC v0.13 / TSPEC v0.9". Three were updated; the fourth — the changelog's own 0.1 row —
correctly still reads "First draft from REQ v0.9 / FSPEC v0.10 / TSPEC v0.6", because that is
history and rewriting it would be a falsification. The disposition is right and the sentence
describing it is wrong by one. Low, and the fix is the sentence, not the row.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | The zero-bound **production** half has no named owner. TSPEC §D.5 puts it in `extractInjectableMaterial` (bound tested before the cut; `{material: "", bounded: false, bytes: 0, sections: []}` at `maxBytes <= 0`) and `selectLearnings` (drop on *yields no material* before the count and total bounds, no slot consumed) — both LI-16's seams, batch 8. LI-16's row still glosses the extractor as "`bounded` decided at the cut", which §D.5 contradicts for exactly this case, and the arm table routes the zero-bound disjunct to LI-12 / LI-21, whose enumerated edits are `main()` and `buildFinalReport` only. Add the clause to LI-16 and name it in the owner column | AC-4.4, FSPEC E-36 / AT-30 |
| F-02 | Medium | Local | `LI-AT-30` conjunct (iii) — "**no** document carries `RSN-COUNT`" — is vacuous unless the third case's eligible non-self corpus exceeds the `maxDocuments` in force (REQ §4.1 default: **5 documents per dispatch**). Below that threshold a count-bound-before-extraction implementation also produces no `RSN-COUNT` row, so the conjunct passes against the mutation it exists to catch. State the fixture precondition in the row | AC-4.4, AC-2.1 |
| F-03 | Medium | Local | The rewritten errata section claims "TSPEC's remaining open errata (ERR-1, ERR-2, ERR-5)" — an incomplete set. TSPEC v0.9 carries **ERR-8** open against FSPEC Step 5 items 15–16 (structural drop, then count cut, then extract), and it is the one erratum addressed to the PLAN author: "so the PLAN author reading the procedure sequentially does not implement the shape E-36 carves out". Still live in FSPEC at HEAD. Add it, with its consequence pointing at F-01's LI-16 clause | AC-4.4, FSPEC BR-9 / D-12 |
| F-04 | Low | Local | LI-08's v0.5 amendment note is spliced mid-enumeration, orphaning `LI-AT-12` after "the single-writer manifest is unchanged, `LI-AT-12` (…)"; and its claim that the landed files "use the bare-title form only" holds for the fixtures but not the helper — `renderSection` already takes `ordinal` and `gloss` and `name` is free-form, so only the `###` sub-heading form is genuinely new. Move the note to the row's end and narrow the claim | AC-2.4 (BR-6 sections) |
| F-05 | Low | Local | The v0.5 changelog row states "the four stale version pins now read FSPEC v0.13 / TSPEC v0.9". Three were refreshed; the changelog's own 0.1 row correctly retains its historical pins. Fix the sentence, not the row | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does the third `LI-AT-30` case drive the **real** repository corpus (9 documents at HEAD, per TSPEC §I.1) or a synthetic `buildLearningsCorpus` fixture? Conjunct (ii)'s "every enumerated non-self corpus path" reads either way, and the answer decides whether F-02's precondition is automatically satisfied (9 > 5) or has to be declared. |
| Q-02 | With ERR-8 unresolved in FSPEC, is the implementer's rule stated anywhere a task row reaches? TSPEC §D.5 states it ("extract for every eligible document, then apply the count and total bounds"), but no PLAN row repeats or cites that sentence, and the row that would is LI-16's. |

## Positive Observations

- **The fix went past the finding, in the direction that protects the user.** I asked for AT-30's
  gloss to be widened to three cases. What landed is three cases *plus* a three-conjunct positive
  oracle, with the reasoning written down: "not `selection is empty` (which a disabled run, a
  refusal or a crashed injector would also satisfy)". That is an author reading the finding for its
  intent rather than its letter — the intent being that an operator who sets
  `maxBytesPerDocument: 0` gets a run that is *enabled and empty*, not one that quietly declines to
  run.
- **Conjunct (iii) is a mutation test written into a plan.** "No document carries `RSN-COUNT` … the
  conjunct that falsifies an implementation taking a zero-byte first-section cut, counting it as a
  contribution and burning slots." Naming the mutation the assertion exists to kill, in the task row
  the test author reads, is the strongest form this document has available. Fix its vacuity
  condition (F-02) and it is a model row.
- **Four of five v7 findings closed in one pass, three of them inherited ones that had been open for
  rounds.** F-04 (claim 4's baseline scope) had been open since v5; F-03 (the errata section) since
  v6. Clearing the backlog in the same commit series as the delta fix is how a document converges
  rather than accumulating.
- **The errata rewrite is genuinely better than "delete the stale rows".** Each closed item keeps its
  original statement, records which upstream version resolved it and states the effect on this PLAN
  as "None", with the reason ("already written to TSPEC's reading and TSPEC's reading is now
  FSPEC's"). That preserves the provenance harvest wants without leaving a live-looking conflict.
- **The code that has landed meets the standards the PLAN set.** `LI-AT-11` asserts full-enumeration
  equality on `sections`, pairs its single negative assertion with five positives on the same call,
  and `LI-AT-12` commits hand-computed byte counts as literal integers with the arithmetic shown.
  No implementation echoes, no absence-only oracle, no containment where set equality was promised.

## Recommendation

**Approved with minor changes**

The blocking finding of v7 is resolved: `maxBytesPerDocument: 0` is now commissioned as AT-30's third
case with an oracle strong enough to kill the mutation it guards against, and the three inherited
Mediums and the version pins are cleared. No High finding is open — every behaviour FSPEC v0.13
guarantees now has a test named in a task row.

Three Mediums and two Lows are recorded, all bounded to text this round wrote, none gating:

1. **F-01 (Medium)** — add one clause to LI-16: `extractInjectableMaterial` tests the bound **before**
   the cut, returning `{material: "", bounded: false, bytes: 0, sections: []}` at `maxBytes <= 0`
   (so "`bounded` decided at the cut" is not the whole rule), and `selectLearnings` extracts for
   every eligible document and drops on *yields no material* **before** the count and total bounds.
   Then correct the arm table's zero-bound owner column to name LI-16 for the production half beside
   LI-12 / LI-21 for the suite.
2. **F-02 (Medium)** — state the third AT-30 case's fixture precondition: its eligible non-self
   corpus must exceed the `maxDocuments` in force (REQ §4.1 default: 5), or `maxDocuments` must be
   configured below the corpus size, so conjunct (iii) is not vacuously true.
3. **F-03 (Medium)** — add **ERR-8** to "TSPEC's remaining open errata", noting that its consequence
   is F-01's clause in LI-16 rather than a task-row change elsewhere.
4. **F-04 (Low)** — move LI-08's amendment note to the end of the row so `LI-AT-12` rejoins the AT
   enumeration, and narrow its factual claim: the landed helper already carries `ordinal` and `gloss`
   knobs and free-form section names, so only the `###` sub-heading form is genuinely new.
5. **F-05 (Low)** — the v0.5 changelog row says four pins were refreshed; three were, and the 0.1
   row correctly keeps its historical pins. Fix the sentence, not the row.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | Zero-bound production half unowned: TSPEC §D.5 places it in `extractInjectableMaterial` and `selectLearnings` (LI-16, batch 8), LI-16's row still says "`bounded` decided at the cut", and the arm table routes the disjunct to LI-12 / LI-21, whose stated edits are `main()` / `buildFinalReport` only. v7 F-01's second clause, unresolved; downgraded from High because LI-12's third case now proves the behaviour and it cannot ship silently | §Batches LI-16 row; §Traceability fail-open arm table |
| F-02 | Medium | delta | local | `LI-AT-30` conjunct (iii) "no document carries `RSN-COUNT`" is vacuous unless the fixture's eligible non-self corpus exceeds `maxDocuments` (REQ §4.1 default 5); state the precondition | §Batches, LI-12 row |
| F-03 | Medium | delta | local | The rewritten errata section's "remaining open errata (ERR-1, ERR-2, ERR-5)" omits TSPEC v0.9's live **ERR-8** against FSPEC Step 5 items 15–16, the one erratum written to the PLAN author and the upstream statement of F-01 | §Open questions and upstream errata |
| F-04 | Low | delta | local | LI-08's amendment note is spliced mid-enumeration (orphaning `LI-AT-12`) and over-claims: the landed helper already carries `ordinal`, `gloss` and free-form names; only the `###` sub-heading form is new | §Batches, LI-08 row |
| F-05 | Low | delta | nonlocal | The v0.5 changelog says four version pins were refreshed; three were, and the 0.1 row correctly keeps its historical pins | §Changelog, 0.5 row |

FINDING: Medium | delta | local | §Batches LI-16 row; §Traceability fail-open arm table | The zero-bound production half has no named owner: TSPEC §D.5 puts it in `extractInjectableMaterial` and `selectLearnings` (LI-16, batch 8), LI-16 still glosses the extractor as "`bounded` decided at the cut", and the arm table routes the zero-bound disjunct to LI-12 / LI-21, whose enumerated edits reach neither function.
FINDING: Medium | delta | local | §Batches, LI-12 row | `LI-AT-30`'s conjunct (iii) — no document carries `RSN-COUNT` — is vacuously true unless the third case's eligible non-self corpus exceeds the `maxDocuments` in force (REQ §4.1 default 5), so the row must state the fixture precondition.
FINDING: Medium | delta | local | §Open questions and upstream errata | The rewritten section enumerates TSPEC's remaining open errata as ERR-1, ERR-2, ERR-5 and omits ERR-8, which is live at HEAD against FSPEC Step 5 items 15–16 and is addressed to the PLAN author.
FINDING: Low | delta | local | §Batches, LI-08 row | The v0.5 amendment note is spliced into the middle of the AT enumeration, orphaning `LI-AT-12`, and claims the landed files use the bare-title form only when the helper already supports `ordinal`, `gloss` and free-form names.
FINDING: Low | delta | nonlocal | §Changelog, 0.5 row | The changelog claims four stale version pins were refreshed; three were, the 0.1 row correctly retaining its historical pins.


## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 2}

APPROVAL-HASH: sha256:4510f9c3f12b8c7b75ef5b2b9b20304e09879aa90542c51aae42c0b1e10c2d09
APPROVAL-HASH-NORMALIZED: sha256:4510f9c3f12b8c7b75ef5b2b9b20304e09879aa90542c51aae42c0b1e10c2d09
REVIEWED-COMMIT: 7bcbce64dc9bbd18c9f5cc66f668c39bdf2de938
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d
UPSTREAM-STATE: TSPEC sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131
UPSTREAM-STATE: DECISIONS sha256:56617f5ab31a8158a33b702ec4a21e8cf1f167b9ef1d78c8e2793976a645bd32

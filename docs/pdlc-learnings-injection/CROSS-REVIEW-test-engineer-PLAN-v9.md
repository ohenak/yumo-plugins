# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.6)
**Date:** 2026-08-20
**Iteration:** 9 (delta confirmation of the v0.6 erratum)

## Overview

**What this round is.** I approved this PLAN at v0.5 (round 8, two Low findings, no High). A targeted
erratum has since landed — `748659c0`, `92e5d178`, `6a2d3007` — taking the document to v0.6. The
question is narrow: does the delta land the one routed item (three reviewers, one substance — LI-08's
v0.5 amendment note assigned the heading-form follow-up to the landed suites' existing owners without
naming the expected-red rows P-A-7 requires be committed before the run they govern), and is the
document still a faithful compression of upstream at HEAD?

**The delta, measured.** `git diff 9f87235e..HEAD -- PLAN-…md` is 23 insertions, 2 deletions across
four hunks: the version cell (0.5 → 0.6), one clause added mid-row to LI-08, a new
**Amendment commits on landed suites (P-A-7)** paragraph with a two-case table in
§The three gate wordings, and the v0.6 changelog row. No task row moved batch, no `Deps` edge moved,
no AT partition, fixture or file-ownership row was touched — and I re-derived that from the diff
rather than from the changelog's claim of it.

**Upstream, re-read at HEAD.** The four dispatch hashes match the files on disk byte for byte
(`shasum -a 256`: REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`), and
their version cells still read REQ v0.9 / FSPEC v0.13 / TSPEC v0.9 / DECISIONS v0.3 — the same four
versions this PLAN pins at `:11`, `:36`, `:275`. Upstream has not moved since round 8, so the
faithful-compression verification I did there still holds for the unchanged bytes; what needed fresh
checking is the new paragraph, and I checked its claims against the ledger, against TSPEC §D.3, and
against the landed helper on disk.

**Result.** The item lands, and lands as a mechanically evaluable rule rather than as prose. Two
non-gating findings: one Medium about a second P-A-7 case on the *same* landed suites that this
paragraph's generic title and closing sentence invite a reader to consider covered, and one Low about
Case A's justification being stated only for the batches that have a ledger. No High.

## Batches

Exactly one task row changed, and it changed by one clause.

**LI-08 (RED block/material suite, batch 3) — the note now points somewhere enforceable.** The v0.5
sentence ended at "Ownership does not move, so the single-writer manifest is unchanged". v0.6 adds:
"and the expected-red rows that follow-up commit owes are named in §The three gate wordings under
**Amendment commits on landed suites**, which is what P-A-7 requires be committed before the run it
governs (v0.6 erratum)". That is the correct repair shape for the routed item. P-A-7's own words are
"a live table is amended by an edit to this PLAN, committed before the run it governs" (`P-A-7`, the
open-questions table) — the naming had to land *in this document*, not in a completion note, and it
did. The cross-reference is a section-title-plus-bold-paragraph anchor, not a raw `file:line`, so it
is a citation DEC-DOC-01 accepts.

**Nothing else in the task table moved.** `git diff` touches no other row: `[Fake first]` ordering,
the red-before-green pairing for every implementation task, the single-writer file manifest and the
same-batch same-new-file guard are byte-identical to the v0.5 bytes I approved. LI-12's three-case
`LI-AT-30` oracle — v7's High, resolved at v0.5 — is untouched, and its three conjuncts still read
key-present / reject-rows set-equal / no `RSN-COUNT`.

**The heading-form cases are still the right red.** Re-read against TSPEC at HEAD rather than
re-derived from my own round-8 notes: §D.3 states the second rule (exactly two `#`, optional ordinal
stripped and discarded, optional trailing gloss, otherwise exact case-sensitive comparison against
`BR6_SECTION_NAMES`) and names the token-overlap hazard the near-miss must defeat —
`## Cross-Feature Findings` would match `Cross-Feature Patterns` and `## Process Findings` would match
`Process Learnings` under a widened matcher (`TSPEC §D.3`, the `SECTION_HEADING_RE` discussion). LI-08's
fixture picks `## Process Findings` as its non-matching near-miss, which is that exact hazard. The
compression is faithful; the erratum did not disturb it.

**The `Status` cell contradiction I filed as v8 F-01 is still on the page.** LI-02 and LI-08 read `⬚`
while the amendment note says both "have already landed on this branch" — and PROPERTIES §C.4 at HEAD
independently confirms the landing ("Seven of the fourteen files have landed. The tasks committed so
far are LI-01…LI-04, LI-07, LI-08, LI-09 and LI-13"). It was Low then and it is Low now; this erratum
was not scoped to it, so I do not re-file it as a finding of this round beyond noting it stands.

## Dependencies

**Batch DAG — unchanged, and re-derived rather than assumed.** The delta adds no task, no file and no
edge. LI-08 stays batch 3 on dep LI-02 (batch 2): `max(2) + 1 = 3` ✓. LI-02 stays batch 2 on LI-01
(batch 1) ✓. LI-17, the task the new paragraph's Case A leans on, stays batch 9, and the ledger's
batch-9 row is still `Landed by LI-17` ✓. No id was added, so uniqueness and acyclicity are
preserved by construction.

**The follow-up commit is not a task, and the paragraph is careful about that.** It creates no row in
the task table, so it consumes no batch and adds no edge. That is the right modelling: the work is an
amendment to two already-landed files taken by their existing owners, and turning it into a task
would have moved the single-writer manifest, which is precisely what LI-08's note promises it does
not do. What P-A-7 demands instead is that the *live table* — the ledger — carry its consequence, and
that is the demand the delta satisfies.

**Case A's arithmetic checks against the ledger as written.** Case A claims that a commit landing
before batch 7 adds no row because `learningsBlock` is already ledgered as a **whole suite** red after
batches 7 and 8 and drops entire at batch 9. I read the ledger rather than the claim: the batch-7 row
lists `learningsSelect, learningsBlock, learningsCorpus, learningsRecord, learningsDispatchSet,
learningsConfig, learningsArmInventory (whole suites)`; the batch-8 row still carries `learningsBlock`
unqualified; the batch-9 row (`Landed by LI-17`) lists `LI-AT-15; learningsCorpus, learningsRecord,
learningsDispatchSet, learningsConfig, learningsArmInventory` — `learningsBlock` is gone. Whole-suite
red subsumes the heading-form cases, so the row-set genuinely is empty, and the "none may be dropped
early" clause preserves the ledger's shrink-by-exactly-what-the-batch-greens property. The arithmetic
is right.

**Case B is the case that had to be stated, and it is stated in the gate's own grammar.** A commit
landing at batch 9 or later re-reds committed green code, and the ledger then gains
`learningsBlock` → `LI-AT-11`'s heading-form cases only, for every batch from the landing batch through
the batch that greens them, **stated in test names, not the suite name** — the same discipline the
existing split rows use (`learningsSelect` → `LI-AT-15` only; `learningsRecord` → `LI-AT-22` locus 2).
That matters mechanically: the batches 7–13 gate reads "every suite still listed in that batch's
ledger row is red for its specified reason", and "`learningsBlock` is partly red" is not a predicate a
dispatcher can evaluate. Case B also states the failure mode explicitly — "a re-red landing without it
is a gate failure, not a red" — which is P-A-3's bar restated at the point of use.

## Verification

**The additivity premise is checkable, and I checked it on disk rather than reading it.** The
paragraph's empty row-set for `learningsFixtures.js`'s consumers rests on one claim: the
declared-heading-form knob is *additive* to `buildLearningsCorpus`'s section spec, so existing callers
keep byte-identical output. At HEAD, `renderSection` in
`pdlc/workflows/__tests__/helpers/learningsFixtures.js` already computes
`ordinalPrefix` from `section.ordinal` (empty string when null/undefined), `glossSuffix` from
`section.gloss` (empty when falsy), and takes `section.name` and `section.body` verbatim. So three of
LI-08's four variants need **no helper change at all** — the un-numbered form is `ordinal` omitted,
the un-glossed form is `gloss` omitted, the near-miss is a `name` value — and the fourth, the `###`
sub-heading that must read as body text, is expressible through the existing `body` knob (or
`spec.extraLines`) without touching the `## ` literal any current caller depends on. A caller
declaring neither field gets the same bytes it gets today. The premise holds, and it holds more
strongly than the paragraph claims: the additive change may be nil.

That also retires the open half of my v8 F-02, which asked whether the `###` variant was a new knob
or body text. The answer implied by the additivity sentence — and confirmed by the helper — is body
text.

**No oracle was weakened, and none was added that can only pass.** The delta introduces no test, no
assertion and no fixture; it introduces a *gate rule*. The rule it introduces is falsifiable in the
sense that matters here: under Case B, a batch run in which `learningsBlock`'s heading-form tests are
red while the ledger lacks their row is a declared failure, and a batch in which the ledger carries
the row but the tests are green is equally a failure under the pre-existing "a suite dropping out of
the ledger early is as much a failure as one lingering" clause. Both directions are pinned, so the
amended ledger stays a set equality rather than a containment — which is the property three earlier
rounds spent findings establishing.

**The mutation this paragraph exists to prevent.** Without it: an owner lands the heading-form
amendment at, say, batch 10; `learningsBlock` re-reds; the batch-10 gate reads "every suite whose
green task has landed is green" and halts on a suite whose red is intended. The wave stops on a
correct test. With it, that landing is either a no-op (Case A) or is preceded by a PLAN edit naming
the exact test names (Case B). The routed item was real and the repair addresses its mechanism, not
just its wording.

**Where the paragraph's reach exceeds its scope.** Its title is generic —
"Amendment commits on landed suites (P-A-7)" — and its closing sentence names
`learningsSelect.test.js` and `learningsCorpus.test.js` as carrying "**no** row of their own in either
case". Read at the title's altitude, that sentence looks like a ruling about those suites; read in
context it is a ruling about *this* commit's fixture-helper knob only. There is a second, live P-A-7
case on the same two landed files: PROPERTIES §C.4 at HEAD states that PROP-BOUND-05/07/08's
amendments land in the committed `learningsBlock.test.js` and that the Group D amendments land in the
already-landed `learningsSelect.test.js` (LI-07) too, classifies them as "a re-red on landed green
code … exactly PLAN P-A-7's case", and routes the row-naming to this PLAN as an erratum
("that naming is the PLAN's to do and is routed as an erratum, not decided here"). Those rows are not
named here, and the closing sentence gives a hurried reader a reason to think they need not be. That
is finding F-01 — Medium, not gating, and the fix is one qualifying clause plus (when the PROPERTIES
erratum returns) a second case row.

**A smaller gap in Case A's justification.** Case A's window is "before batch 7", but its reasoning
cites only the batches 7–8 ledger rows. A commit landing during batches 2–6 is inside that window and
those batches have no ledger; their gate rows speak of "the batch's new tests" and "every
pre-existing test's status", neither of which is the amended `learningsBlock`. The outcome is still
"no row" — nothing evaluates it — but the reader has to derive that silence. One sentence closes it.
That is F-02, Low.

**Version pins and DoD.** Both untouched by the delta and both still correct against the files they
cite: `:11` reads TSPEC v0.9 / FSPEC v0.13 / REQ v0.9 / DECISIONS v0.3, `:36` and `:275` agree, and
each upstream file's version cell matches. DoD's thirteen clauses, the `--per-file --branches 85`
floor and the twelve-arm inventory are byte-identical to what I approved.

## Positive Observations

- The repair answers the question the three reviewers actually asked. All three findings said the same
  thing — the note assigns an owner but names no rows — and the delta names rows, in the ledger's own
  grammar, ahead of the run. It did not answer with prose about intent.
- **Both cases are enumerated instead of one being assumed.** The easy repair was to name rows for the
  case the author expects (A) and leave B to judgement. Naming B, and stating its "a re-red landing
  without it is a gate failure, not a red" consequence, is what makes the rule survive a schedule slip
  — which is the only circumstance under which it is needed.
- **Case A's "no row" is argued, not asserted.** It cites the specific ledger rows (batches 7 and 8
  whole-suite, batch 9 dropping `learningsBlock` entire) that make the empty row-set correct, so a
  reviewer can falsify the claim by reading two table cells. An unargued "no rows needed" would have
  been unfalsifiable.
- **The additivity premise is named as a premise, with its failure branch attached.** "That additivity
  is the premise on which the empty row-set rests: if a future amendment to the helper is **not**
  additive, the consumer suites it moves enter the ledger by name under case B's rule first." A rule
  that states the condition under which it stops applying is a rule the next author cannot
  over-generalise.
- The delta stayed inside its erratum. Four hunks, one of them a version cell and one a changelog row;
  no task moved batch, no edge moved, no oracle was reworded. Round 8's approval surface is intact and
  I could confirm that from the diff alone.

## Recommendation

**Approved with minor changes** (0 High, 1 Medium, 1 Low).

The routed item lands. LI-08's note now points at a named, ledger-grammar rule; the rule enumerates
both cases; Case A's empty row-set checks against the ledger rows it cites; Case B states its
gate-failure consequence; and the additivity premise the empty consumer row-set rests on is true of
the helper at HEAD — three of LI-08's four heading variants need no helper change at all. Nothing I
approved at v0.5 broke: no batch moved, no edge moved, no oracle was reworded, and the four upstream
pins still match the four upstream files at the hashes this dispatch names.

Neither finding gates the phase. F-01 is a scope-of-wording risk that becomes substantive only when
the PROPERTIES erratum returns; F-02 is one clause of derivation. Fold both into whatever edit comes
next.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | local | The new paragraph's generic title ("Amendment commits on landed suites (P-A-7)") and its closing "carry **no** row of their own in either case" sentence read as a ruling over `learningsBlock.test.js` / `learningsSelect.test.js` generally, but its scope is the heading-form fixture knob alone. A second live P-A-7 case exists on those same landed files — PROPERTIES §C.4 at HEAD states PROP-BOUND-05/07/08's amendments land in the committed `learningsBlock.test.js` and the Group D amendments in the already-landed `learningsSelect.test.js`, classifies them as "a re-red on landed green code … exactly PLAN P-A-7's case", and routes the row-naming to this PLAN. Those rows are unnamed here, and the closing sentence invites a reader to conclude they are not owed. **Fix:** qualify the closing sentence to "across *this* follow-up commit", and add a case row (or a one-line pointer) for the PROPERTIES amendments once that erratum returns from Phase P | §The three gate wordings → Amendment commits on landed suites |
| F-02 | Low | delta | local | Case A's window is "before batch 7", but its justification cites only the batches 7–8 whole-suite ledger rows and the batch-9 drop. A commit landing during batches 2–6 is inside the window; those batches carry no ledger and their gate rows speak of "the batch's new tests" and "every pre-existing test's status", neither of which covers an amended, already-landed feature suite. The outcome is unchanged (no row is owed) but the reader must derive the silence. **Fix:** one clause — "and in batches 2–6 no ledger exists to amend, since the ledger's universe begins at batch 7" | §The three gate wordings → Amendment commits on landed suites, Case A |

FINDING: Medium | inherited | local | §The three gate wordings → Amendment commits on landed suites | The paragraph's generic title and its "carry no row of their own in either case" closing sentence read as covering `learningsBlock.test.js` / `learningsSelect.test.js` generally, while its scope is only the heading-form fixture knob; PROPERTIES §C.4 routes a second P-A-7 re-red on those same landed files (PROP-BOUND-05/07/08 and the Group D amendments) to this PLAN, and those rows are unnamed here
FINDING: Low | delta | local | §The three gate wordings → Amendment commits on landed suites, Case A | Case A's window is "before batch 7" but its justification covers only batches 7–9; a commit landing in batches 2–6 is inside the window and those batches carry no ledger, so the "no row" outcome is correct but underived

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.5)
**Date:** 2026-08-20
**Iteration:** 8 (delta re-review of v7's findings)

## Overview

**Scope of this round.** v7 was an upstream-cascade confirmation against FSPEC v0.13 whose PLAN bytes
had not moved; it carried one High (F-01) and three Mediums. PLAN has since moved v0.4 → v0.5 across
six commits (`96cf89a5`, `3d6b0972`, `af975290`, `f6570869`, `c15f24c1`, `7bcbce64`) — 20 insertions,
21 deletions, all inside rows and tables I had already read. I re-read only those, plus the upstream
each edit cites.

**Result.** All four prior findings are resolved, and resolved against upstream that has since
landed the absorption I asked for: TSPEC is now v0.9 and carries E-36 in §I.2, §D.5, §D.3 and §T.7
(`TSPEC-pdlc-learnings-injection.md` §I.2 "upstream enumerates **three** zeros", §T.7's
`RSN-NO-MATERIAL` arm row "Two disjuncts, one branch"). The repair I described in v7 — TSPEC first,
then a one-touch PLAN edit — is exactly what happened, and the PLAN edit did not overreach it: no
task moved batch, no `Deps` edge changed, no fixture was invalidated, and I re-derived both facts
rather than taking the changelog's word for them.

**Two Low findings only**, both bookkeeping around the new v0.5 "amendment note" in LI-08. Neither
touches an oracle, a batch or an ownership row. Approved with minor changes.

## Batches

Three task rows changed. Each read against the upstream it now cites, not re-read from scratch.

**LI-12 (RED configuration suite, batch 5) — F-01 resolved, and resolved with the oracle I asked
for.** The row now reads `LI-AT-30` as **three** cases (`maxDocuments: 0`, `maxTotalBytes: 0`,
`maxBytesPerDocument: 0` / E-36) and states the third's oracle as three positive conjuncts:
(i) the `learningsInjection` key **present** with BR-8's rows present and empty; (ii) `rejected[]`
**set-equal** to every enumerated non-self corpus path, each at reason exactly `RSN-NO-MATERIAL`,
none `bounded` — set equality, never "at least one"; (iii) **no** document carrying `RSN-COUNT`.
That is the v7 three-conjunct form verbatim, and conjunct (iii) is the one that makes the case able
to fail: the row itself names the mutation ("reverting §D.5's `maxBytes <= 0` short-circuit would
stay green" without it). Upstream backs every clause — TSPEC §I.2 states the third case's oracle as
"a set equality over the reject rows (every enumerated non-self path present with
`RSN-NO-MATERIAL`, none `bounded`), not merely an empty `selected`", and names the same mutation.
PLAN's conjunct (iii) is a **strengthening** beyond TSPEC's wording, not a divergence: `RSN-COUNT`
absence is implied by "none `bounded`" plus the no-slot clause, and asserting it directly is
strictly harder to false-green.

**AT-count arithmetic re-derived, not trusted.** TSPEC §T.5's suite map still reads
`learningsConfig.test.js | AT-30 (three zero-threshold cases, §I.2), AT-32 | 2`, and its closure
line still sums `2 + 9 + 3 + 3 + 6 + 12 = 35`. Adding a case to an existing AT changed no count, so
`LI-T-SUITEMAP`'s partition, LI-12's `Batch` (5) and its `Deps` (LI-02, LI-06) are untouched — the
row says so and the arithmetic agrees.

**LI-08 (RED block/material suite, batch 3) — F-03 resolved on the red side.** `LI-AT-11` now takes
its section-set equality over a fixture carrying non-canonical heading forms — un-numbered
`## Cross-Feature Patterns`, un-glossed `## Rejected Proposals`, a `###` sub-heading that must read
as body text, and a near-miss `## Process Findings` that must **not** match. The rule the row
transcribes matches TSPEC §D.3 clause-for-clause: exactly two `#` (so `###` is body text), an
optional ordinal stripped and discarded ("it is not the priority"), an optional trailing gloss, and
otherwise exact case-sensitive comparison against `BR6_SECTION_NAMES`. The near-miss choice is the
right one: `## Process Findings` is the token-overlap case TSPEC §D.3 rule 2 argues E-33 turns on,
so the fixture defeats the widened-matcher mutation rather than merely the absent-heading one.

**LI-02 (fixture helper, batch 2) — the knob is declared where it belongs.** The heading-form
variants are declared in LI-02's spec surface, not built ad hoc in LI-08, and LI-08's existing
`Deps` on LI-02 already carries the edge. At HEAD the landed helper already renders the ordinal and
gloss knobs (`pdlc/workflows/__tests__/helpers/learningsFixtures.js:64-71`, `renderSection`'s
`section.ordinal` / `section.gloss`), so two of the four variants cost nothing; the near-miss rides
on `section.name`. The one variant with no expressed mechanism is the `###` sub-heading — see F-02.

**Everything else in the table.** No other row changed. `[Fake first]` ordering, the single-writer
file manifest and the same-batch same-new-file guard are byte-identical to what I approved in v6.

## Dependencies

**Batch DAG — arithmetic unchanged, and I checked rather than assumed.** The diff adds no task, no
file and no edge; the only cells inside the task table that moved are prose inside LI-02, LI-08 and
LI-12. LI-12 stays batch 5 on deps LI-02 (2) / LI-06 (4) — `max(2,4)+1 = 5` ✓. LI-08 stays batch 3
on dep LI-02 (2) — `max(2)+1 = 3` ✓. LI-02 stays batch 2 on LI-01 (1) ✓. The zero-bound branch is
greened by LI-21 (batch 13, deps LI-20 / LI-12 / LI-23), already in the graph and already
red-before-green via the `LI-21 → LI-12` edge the §Dependencies edge table names. No new same-batch
same-new-file collision: `learningsConfig.test.js` is LI-12's alone, and it does not exist at HEAD
(`ls pdlc/workflows/__tests__/` shows `learningsBlock`, `learningsCaptureScript`, `learningsCorpus`,
`learningsPredicatePin`, `learningsPremises`, `learningsSelect` only), so the row's implicit
new-file claim holds.

**Upstream precedence — the reason v7 could not approve is gone.** v7's High rested on PLAN faithfully
compressing a TSPEC that had not yet absorbed E-36. TSPEC v0.9 has: §I.2 enumerates the three zeros
and states the third case's reject-row set equality; §T.7's arm table carries "Two disjuncts, one
branch … AT-28 (structural disjunct); AT-30's third case (zero-bound disjunct, §I.2)"; §D.3 assigns
F-O-1's second rule with `SECTION_HEADING_RE` and `BR6_SECTION_NAMES` spelled out; §T.5 keeps the
per-file counts. PLAN v0.5 now compresses that, so row and TSPEC agree and PLAN's own
"where a row and the TSPEC disagree, the TSPEC wins" precedence rule is not being exercised anywhere
I could find in the changed text.

**Version pins — F-04 resolved, verified against the cited files' own version cells.** The front
matter now reads `TSPEC (v0.9)`, `FSPEC (v0.13)`, `REQ (v0.9)`, `DECISIONS (v0.3)`; §Overview reads
"REQ v0.9 / FSPEC v0.13 / TSPEC v0.9"; §Dependencies' LI-01 reason reads "since TSPEC v0.9". HEAD's
version cells are TSPEC 0.9, FSPEC 0.13, DECISIONS 0.3, REQ 0.9 (each file's `| pdlc | … |` row,
line 18). Four pins, four matches — the DECISIONS pin is new and correct rather than newly stale.

**ERR-3 / ERR-7 — correctly closed, not silently dropped.** The §Errata table now records both as
`CLOSED at HEAD` with an explicit "Effect on this PLAN: None" column, and I verified both closures
upstream rather than taking the changelog's word: FSPEC states BR-1's two-conjunct rule and names the
`docType: null` optimizer round as the excluded branch (`FSPEC-…md:287`, D-2), quantifies AT-03/AT-29
over dispatches "outside BR-1's rule" (`FSPEC-…md:622`), and states BR-15's expected set "as a set,
not a count" with the enumeration dropped (`FSPEC-…md:57`). TSPEC's erratum register marks both
CLOSED (`TSPEC-…md:1569`, `:1615`). The two task rows they touched (LI-11's `LI-AT-02`, `LI-AT-33`)
were already written to TSPEC's reading, so "no change needed" is a checkable claim, and it checks
out.

## Verification

**The mutation that survived v7 no longer survives.** v7's High was grounded on a mutation check:
make `extractInjectableMaterial` treat a zero bound as "take the first section anyway" and all twelve
planned `learnings*.test.js` suites stayed green, because no fixture configured
`maxBytesPerDocument: 0`. LI-12's third case now configures it, and each of the three conjuncts kills
a different mutant — (i) kills "drop the report key when the selection is empty", (ii) kills "reject
one document and stop", (iii) kills "cut to zero bytes, count it as a contribution, burn a slot".
Conjunct (iii) is the one v7 argued was load-bearing, and it is present verbatim.

**No absence-only oracle was introduced.** The row states the negative and the positive on the same
instrument: not "selection is empty" (which "a disabled run, a refusal or a crashed injector would
also satisfy" — the row's own words) but *key present + rows present and empty + every path rejected
at a named reason*. Set equality, not containment, on the reject rows, so a deleted case reds. This
is the DC-03 / set-equality shape asked of enumerated contracts.

**No implementation echo.** The three-case enumeration and the reason codes are transcribed from
FSPEC AT-30 / TSPEC §I.2, and LI-12's supporting `parseLearningsConfig` assertions still carry no AT
id, so the §T.5 counts stay honest. LI-08's expected byte counts remain "hand-computed from the
fixture over **material only**, ignoring every delimiter (§D.5)" — unchanged by this round and still
the correct compression of FSPEC v0.13's material-only basis.

**Fail-open arm coverage — F-02 resolved.** The `RSN-NO-MATERIAL` row now reads "document **yields no
material** … Two disjuncts, one branch (TSPEC §T.7): no `BR6_SECTION_NAMES` heading present (E-33),
**or** `maxBytesPerDocument: 0` admits none (E-36)", with entering ATs `AT-28 (structural); AT-30
case 3 (zero-bound)` and entering tasks `LI-07 / LI-16 (structural); LI-12 / LI-21 (zero-bound)`.
That mirrors TSPEC §T.7's row exactly. The arm count stays twelve and the prose explains why —
thirteen entering *cases*, twelve *arms* — which matters because LI-23's inventory asserts set
equality over **reason codes**, not disjuncts, so nothing about LI-23 had to change. I re-derived
that: `LEARNINGS_REJECT_REASONS` gains no member from E-36, so LI-23's three set equalities are
arithmetically unaffected, and a DoD walk of FSPEC → AT → task now lands on an owning row for the
zero-bound branch where in v7 it landed nowhere.

**F-O-1's second rule now has a red test, not just a mapping.** The obligations row names both rules
and routes them to LI-16 (`looksLikeLearningsDocument` and `extractInjectableMaterial`), and — the
part v7 asked for — LI-08's `LI-AT-11` pins the second rule by fixture variance rather than
inheriting it from the builder's shape. Without that, the matcher rule would have been asserted only
against `## N. Title` documents, which is precisely the shape the landed helper emits by default
(`learningsFixtures.js:68`), so the test would have proved nothing about ordinals being optional.

**DoD.** Clause 4's byte-identity scope now reads "every dispatch **outside BR-1's rule** … (AC-4.3)"
with the explanation that Phase CR's authoring-classified, `docType: null` optimizer round is *inside*
the promise. That is FSPEC's own scope at `FSPEC-…md:622` and closes v6's F-04, which I had carried as
inherited in v7. Clauses 1–3 and 5–13 are untouched; the `--per-file --branches 85` floor and the
TSPEC §T.7 inventory that actually enforces the new region are unchanged.

## Positive Observations

- The repair took the route v7 recommended in the order v7 recommended — TSPEC absorbs E-36 first,
  then PLAN takes a one-touch compression. The result is that PLAN's precedence rule ("the TSPEC
  wins") is not load-bearing anywhere in the changed text: row and TSPEC now say the same thing, so
  an implementer never has to know which document wins.
- LI-12's third case carries its own mutation statement inline ("reverting §D.5's `maxBytes <= 0`
  short-circuit would stay green" without conjunct (iii)). A task row that names the mutant it exists
  to kill is a row an implementer cannot satisfy vacuously.
- The arm table's "twelve arms, thirteen entering cases" sentence pre-empts the obvious wrong repair:
  adding a thirteenth arm row would have broken LI-23's set equality against a catalogue that gained
  no member. Explaining why the count did *not* change is more useful than changing it.
- LI-08's heading-form fixture picks the near-miss (`## Process Findings`) that TSPEC §D.3 rule 2
  identifies as the token-overlap hazard, not an arbitrary non-match. The case defeats the widened
  matcher, which is the mutant that would otherwise make E-33 unreachable by construction.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | LI-08's new v0.5 amendment note says LI-02 and LI-08 "have already landed on this branch", while both rows' `Status` cells still read `⬚`. Both statements are true of different ledgers, but the document contradicts itself on its face | §Batches, LI-08 / task-table `Status` column |
| F-02 | Low | Local | LI-02's declared-heading-form knob lists a `###` sub-heading among the forms, but the landed helper's `renderSection` always emits `## ` and expresses no heading-level knob; the row does not say whether the variant is a new knob or body text | §Batches, LI-02 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | LI-08's amendment note says the heading-form cases are taken "by their existing owners in a follow-up commit". Since LI-02 and LI-08 both still carry `⬚`, will the dispatcher simply re-enter those rows (in which case the note is guidance, not scheduling), or is a follow-up commit expected outside the batch ledger? The first reading is the one I assumed when checking TDD ordering. |


## Recommendation

**Approved with minor changes** (0 High, 0 Medium, 2 Low).

v7's High (F-01) is resolved with the exact three-conjunct oracle it specified, and the mutation it
was grounded on no longer survives the planned suite. v7's three Mediums (F-02 arm table, F-03 F-O-1's
second rule, F-04 version pins) are all resolved and verified against the cited upstream files, not
against the changelog. Nothing in the changed sections broke an oracle, moved a batch, invalidated a
fixture or disturbed the single-writer manifest — I re-derived the batch arithmetic for every touched
row rather than assuming it.

The two Low findings are bookkeeping inside the new amendment note and need not gate the phase; fold
them into the next edit if one happens:

1. Reconcile the amendment note with the `Status` column — either flip LI-02 / LI-08 to the landed
   marker, or word the note as "these files exist at HEAD from an earlier dispatch of these rows".
2. Say in one clause how the `###` sub-heading variant is produced — a `level` knob on `renderSection`
   or a `body`-embedded line. Either is fine; leaving it open lets two implementers fork the helper.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

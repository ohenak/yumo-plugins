# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md (v1.7)
**Upstream measured against:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md v1.16 (sha256:f97f4f66…6fab7)
**Delta reviewed:** `33634b3d..0fc601b2` (5 commits, +16/-7)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation)

## Overview

This is a **delta confirmation**, not a fresh review. I approved this FSPEC's structure in
earlier rounds and filed v4 F-01 (High) — AC-6.3's new preservation-warning conjunct unrepresented
in §4/§5/§6 — plus v4 F-02 (Medium, carried from v3) on the stale upstream pin.

**The routed item has landed, and it landed at the right altitude.** The v1.7 edit places the
obligation on BR-14 as a conditional clause, names its two arms in §3 step 10 and in E-34, defers
E-30 to BR-14's contents rather than re-enumerating them, and gives AT-06-4 a third *Then* conjunct
with a falsifying companion AT-06-4b. No ref name, no storage form, no lifetime — all correctly left
to REQ O-1. v4 F-01 is **resolved**.

I re-read REQ v1.16 §AC-6.3, AC-5.1, AC-5.2 and O-1 at the dispatched hash (verified: sha256 matches
byte-for-byte) rather than trusting the changelog. The FSPEC remains a faithful compression of the
REQ text it now leans on, with two exceptions recorded below, neither of them High and neither of
them a reason to hold the phase.

## Linked Requirements

§2's preamble still reads *"Every clause below traces to `REQ-pdlc-advisory-wave-gate` v1.13."*
REQ is at **v1.16** at HEAD — three erratum rounds on, two of which edited text this FSPEC compresses
(AC-5.1's excluded-carrier list, AC-1.1/R-5's post-change reading, and now AC-6.3). This round's own
v1.7 changelog cites *"REQ v1.16's second AC-6.3 conjunct"* eight lines above a concordance preamble
that claims v1.13, so the document now contradicts itself about which upstream it compresses.

This is v4 F-02 / v3 F-02, still open. It is **inherited** — the stale pin was in the pre-round bytes
and the edit did not touch §2 — and it stays Medium: the concordance rows themselves are correct
against v1.16, so the defect is a misleading pin rather than a coverage gap. It should be corrected in
whatever edit next touches this file; it does not warrant a round of its own. Filed as F-01 below.

The concordance's coverage claim for AC-6.1…AC-6.4 is now **true**, which it was not at v1.6 — that
was the substance of v4 F-01 and it is discharged.

## Behavioral Flow

**§3.2 step 10 — correct and non-controlling.** The rewrite keeps the step's load-bearing claim
("Halt, unchanged": same reason M-WG-3, same `halted` queue row M-WG-7) and adds the two arms as a
report-content distinction only. Nothing in the new sentence introduces a branch in control flow, so
the step's title stays honest and BR-14's "escalation adds information, never control flow" is not
weakened. The arms are stated as *report contents*, which is the right seam: the pipeline halts
identically either way.

I checked that step 10's new text does not create a second normative home for the obligation that
could drift from BR-14. It does not — step 10 names the arms and defers the clause's content to
BR-14 by citation, which is the same discipline E-30 was rewritten to adopt.

## Business Rules

**BR-14 is the right owner and the clause is well-drafted.** Measured against REQ AC-6.3 at HEAD:

| AC-6.3 clause (REQ v1.16) | BR-14 v1.7 |
|---|---|
| halt report carries diagnosis + root-cause class | present, unchanged |
| "Where the halt report points the operator at a captured pre-A6 tree state" | conditional antecedent preserved verbatim in substance |
| "it also warns, in the same place" | **"the same report, in the same place"**, with co-location named as *the* observable |
| "that re-running this feature overwrites that capture" | verbatim in substance |
| rationale: operator preserves it first | present |
| capture name/storage stay O-1's | present, and extended to lifetime |

Three drafting choices are worth naming as good ones. First, *"Co-location is the observable — a
pointer in the halt report and the warning in a runbook does not satisfy it"* converts the AC's "in
the same place" into something an oracle can fail on, which is exactly the compression an FSPEC owes
a REQ. Second, the negative scope statement (the clause binds the halt report only; BR-13's advisory
record carries no such warning) forecloses the over-broad reading that would have made E-30 and BR-13
carriers too. Third, adding *lifetime* to the O-1 deferral is a small extension beyond REQ's "name
and storage form" but a correct one — how long the capture lives is mechanism, and pinning it here
would have been an altitude violation.

**One citation-hygiene note.** BR-14 cites `(DEC-A6-03)`. That decision record at HEAD still reads
*"**The routing has not landed** (PM Q-02, TE): at REQ v1.15 and FSPEC v1.6, `a6-snapshot`, 'copy the
ref' and 'overwrit' match nothing in either document"* and *"This entry carries the gap until it
lands"* — a statement that is now false, and false specifically because of this edit. DEC-A6-03's own
re-evaluation triggers anticipate this ("or the halt-message obligation the PM is routing to REQ
lands, in which case … this entry's known gap closes"). The FSPEC is not wrong to cite it; the
DECISIONS record needs a one-paragraph erratum closing the gap. Filed as F-03 (Low) — the fix lands
in DECISIONS, not here.

## Edge Cases and Error Scenarios

**E-34 (capture impossible) — correct, and the placement move helps.** E-34 now names itself as the
arm on which the halt report carries diagnosis and class with **no** overwrite warning, "there being
no capture to point at". That is the right reading of AC-6.3's conditional: the antecedent is false,
so the consequent is not owed. Moving the row to sit beside E-28 (its sibling restoration row) makes
the pair readable in one pass.

**E-30 (escalation log unwritable) — the deferral is an improvement.** Replacing the enumerated
"diagnosis and root-cause class" with "BR-14's halt-report contents in full" removes a second copy of
a list that just grew a third member. Had it been left as-is, E-30 would already be stale against
BR-14. This is the right maintenance instinct.

**E-28 (restoration fails) is the gap this edit left.** E-34 gained a reciprocal pointer to BR-14's
arms; E-28 did not. E-28 is the row where the halt *does* point the operator at a captured pre-A6
tree state — that is precisely what TSPEC §2.5 specifies (the halt names the ref for the halting
wave, `TSPEC:534`'s re-run-overwrite paragraph) — yet at FSPEC altitude no row, rule or AT ever
asserts that any halt report points at a capture. The consequence is that BR-14's conditional and
AT-06-4's conjunct (3) have an antecedent that the FSPEC never establishes as reachable: a reader
holding only REQ + FSPEC cannot tell which halt is the with-capture arm, and the conjunct is
vacuously satisfiable against a document that never requires the pointer.

I am filing this **Medium, not High**, deliberately. REQ AC-6.3 has the identical conditional shape
and likewise never names which halt points at a capture, so the FSPEC *is* a faithful compression —
raising it High would be contesting upstream through the FSPEC, and the behaviour is grounded
downstream in TSPEC §2.5 either way. The fix is one clause on E-28 ("this is the arm on which BR-14's
overwrite warning is owed"), symmetric with the one E-34 just received, and it can ride along with
the §2 pin correction. Filed as F-02.

The rest of §5.4 and §5.5 are untouched and I re-confirm them as previously approved. E-33's
`waveBudgetPerRun: 0` reasoning and E-31's honest limit are unchanged.

## Acceptance Tests

**AT-06-4's three-conjunct restatement is the strongest part of this edit.** Numbering the *Then*
into (1) diagnosis, (2) root-cause class, (3) the co-located overwrite statement gives the oracle
three separately failable assertions instead of one compound sentence. The explicit oracle boundary —
*"asserts co-location and the presence of the overwrite statement, never the capture's name — that is
O-1's"* — is exactly the instruction a test author needs to avoid pinning `refs/pdlc/a6-snapshot-{n}`
at the wrong layer, and it forecloses the string-coupling failure mode where the FSPEC-level test
breaks when TSPEC renames the ref.

**AT-06-4b is the conjunct that makes AT-06-4 honest.** Without it, conjunct (3) is satisfiable by a
halt report that emits the overwrite sentence unconditionally, which would pass while specifying
nothing. The companion pins the E-34 arm to *no* pointer and *no* warning, so the pair distinguishes
"conditional, correctly implemented" from "constant string". The author named this reasoning inline
("the companion that makes AT-06-4's conjunct (3) falsifiable rather than a string always present") —
that is the property-thinking this pipeline asks for, and it should be preserved verbatim into
PROPERTIES rather than paraphrased.

**AT-05-5 remains E-28's only AT** and still requires only that "the halt names the failed
restoration". It is not wrong, but it is the natural owner of the with-capture assertion under F-02;
if E-28 gains the reciprocal clause, AT-05-5 or a companion should gain the matching conjunct so the
with-capture arm is exercised by a test and not only by AT-06-4's conditional.

## Open Questions

§7's obligation table is unchanged and still correct. O-1's row already reads *"The restoration
mechanism behind BR-9, and the point at which the pre-A6 tree state is captured. Its failure modes
are E-28 (restoration fails) and E-34 (capture fails)"* with the routed scope *"Only the observable"*
— so BR-14's new deferral of name, storage form and lifetime lands in an obligation that already
exists and already names both failure modes. No new obligation is owed by this edit, and none was
invented, which is the correct outcome for an erratum round.

Nothing in the delta reopens a settled decision. The changelog's claim "Nothing else changed; no
decision reopened" is accurate against the diff I read.

One item for the phase owner, not for this document: DEC-A6-03 needs its known-gap paragraph closed
(F-03). Its own re-evaluation trigger names this exact event, so the close is mechanical.

## Positive Observations

- The edit is **minimal and surgical**: +16/-7 across five commits, each commit one coherent move.
  Nothing was rewritten that did not need to move, and every touched location is a location the routed
  item actually requires.
- **The altitude discipline held under pressure.** The obvious wrong answer here was to write
  `refs/pdlc/a6-snapshot-{waveNum}` into the FSPEC — the ref name is right there in DEC-A6-03 and in
  TSPEC §2.5, and it would have made the AT trivially concrete. The author declined and routed name,
  storage and lifetime to O-1 instead. That is the harder and correct call.
- **E-30's deferral (`"BR-14's halt-report contents in full"`)** removes a duplicate enumeration at
  exactly the moment it would have gone stale. Small change, real durability win.
- **AT-06-4b exists at all.** Adding the falsifying companion in the same round as the positive
  conjunct — unprompted by any reviewer item — is the difference between a testable spec and a spec
  that reads as testable.
- Both routed items (TE's and PM's) are discharged by a single coherent clause rather than two
  parallel additions, and the changelog names the provenance honestly ("routed since round 5 and
  previously unlanded").

## Recommendation

**Approved with minor changes.**

The delta resolves both routed items and does not break anything I previously approved. v4 F-01
(High) is discharged: AC-6.3's preservation-warning conjunct is now represented in §3, §4, §5 and §6,
and §2's coverage claim for AC-6.1…AC-6.4 has become true. Re-measured against REQ v1.16 at the
dispatched hash, the FSPEC remains a faithful compression of the upstream text it now leans on.

Three non-gating findings remain, none of which should hold this phase:

- **F-01 (Medium, inherited)** — §2 still pins upstream as REQ v1.13 while the v1.7 changelog cites
  v1.16. Correct the pin in the next edit that touches this file.
- **F-02 (Medium, delta)** — E-28 did not receive the reciprocal with-capture clause that E-34
  received, leaving BR-14's conditional antecedent unestablished at FSPEC altitude. One clause on
  E-28, symmetric with E-34's.
- **F-03 (Low, delta)** — DEC-A6-03 still asserts the routing has not landed; it has. Close the
  known-gap paragraph per the record's own re-evaluation trigger.

All three fit in a single follow-up edit alongside each other. None requires a new decision, none
changes an observable, and none blocks TSPEC or implementation from proceeding against this FSPEC as
written.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | §2's preamble still pins upstream as "REQ-pdlc-advisory-wave-gate v1.13" while REQ is v1.16 at HEAD and this round's own v1.7 changelog cites v1.16 — the document contradicts itself about which upstream it compresses. Carried from v4 F-02 / v3 F-02. Concordance rows are correct against v1.16, so this is a misleading pin, not a coverage gap. | §2 Linked Requirements, preamble |
| F-02 | Medium | delta | local | E-34 gained a reciprocal pointer to BR-14's two arms; E-28 did not. E-28 is the arm whose halt does point at a captured pre-A6 tree state (TSPEC §2.5), yet no FSPEC row, rule or AT ever asserts that any halt report points at a capture — so BR-14's conditional and AT-06-4 conjunct (3) have an antecedent the FSPEC never establishes as reachable. Medium not High: REQ AC-6.3 has the identical conditional shape, so the FSPEC is still a faithful compression. Fix: one clause on E-28 symmetric with E-34's, plus a matching conjunct on AT-05-5. | §5.4 E-28 / BR-14 / AT-06-4 |
| F-03 | Low | delta | local | BR-14 cites DEC-A6-03, whose record at HEAD still reads "The routing has not landed … at REQ v1.15 and FSPEC v1.6" and "This entry carries the gap until it lands" — now false, and false because of this edit. DEC-A6-03's own re-evaluation trigger anticipates the close. Fix lands in DECISIONS, not in this FSPEC. | §4 BR-14, DEC-A6-03 citation |

FINDING: Medium | inherited | nonlocal | §2 Linked Requirements preamble | Upstream pin still reads "REQ v1.13" while REQ is v1.16 at HEAD and the v1.7 changelog itself cites v1.16 — internal contradiction about which upstream this FSPEC compresses; carried from v4 F-02.
FINDING: Medium | delta | local | §5.4 E-28 / BR-14 / AT-06-4 | E-28 did not get the reciprocal with-capture clause that E-34 got, so no FSPEC row asserts that any halt report points at a capture and BR-14's conditional antecedent is never established as reachable at FSPEC altitude; AT-06-4 conjunct (3) is correspondingly vacuously satisfiable. Faithful to REQ's identical conditional shape, hence Medium.
FINDING: Low | delta | local | §4 BR-14, DEC-A6-03 citation | DEC-A6-03 still asserts "The routing has not landed … at REQ v1.15 and FSPEC v1.6"; it landed this round, so the cited record now contradicts the citing clause. Close the known-gap paragraph in DECISIONS.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

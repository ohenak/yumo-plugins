# Cross-Review: test-engineer — FSPEC (delta confirmation, round v14)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.12)
**Date:** 2026-08-20
**Iteration:** 14

## Overview

Delta confirmation of the v0.12 erratum against the FSPEC I approved at v13 (reviewed commit
`1b4dc3de`, confirmed again at `7a539ca1`). The delta is `7a539ca1..c1d7218e`, +33/-19 across six
erratum commits, touching: the header `Cross-Reviews` row and version cell, an appended v0.12
revision note (FSPEC:61-68), the Overview's scope sentence (FSPEC:70), decision row D-2
(FSPEC:271), BR-11's byte-identity sentence (FSPEC:604-606), BR-15's expected-set bullet
(FSPEC:685-694), AT-02 and AT-03 (FSPEC:793-802), AT-29 (FSPEC:921-926), the D-2 line of the
branch-coverage mapping (FSPEC:971-972), and assumption A-2 (FSPEC:1009). Nothing else moved a
byte, so the ordering, bounding, config, record and edge-case material I approved at v12 and
re-confirmed at v13 is untouched.

Upstream REQ at HEAD hashes to `ff605dd3…92e84dd`, matching the dispatch digest exactly, so no
upstream sentence has shifted under this FSPEC since my last round. I re-read REQ C-1
(REQ:151-161), AC-1.2 (REQ:256-262), AC-4.3 (REQ:364-368), AC-5.2 (REQ:397-403), AC-6.1
(REQ:410-414) and NG-5 (REQ:142) against the delta rather than trusting the erratum note.

**All three routed items land.** The header row stops hand-enumerating rounds; the Overview and A-2
no longer restate one conjunct while deferring to BR-1; and D-2 — my v13 F-01 — now asks the
two-conjunct question with three named branches, with the branch-coverage mapping updated to match.
The erratum went further than the routed list and carried BR-1's complement into BR-11, AT-03 and
AT-29, which is the right instinct and is where two of this round's three findings sit: one
rule/oracle divergence the edit created by correcting BR-15 but not AT-33, and one citation-fidelity
item where the FSPEC's corrected wording is now stronger than the upstream clause it traces to. No
High. Nothing I previously approved is broken by this delta.

## Linked Requirements

The delta's citations resolve to live upstream text at HEAD, with one lag worth routing:

- **REQ C-1** (REQ:151-161) reads "every dispatch the pipeline tags `dispatchKind: "authoring"` at
  HEAD … **whose target document is REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES**". D-2's new
  question is that rule stated as a decision, in C-1's own conjunct order, and its three branches are
  the three states C-1 admits. Faithful compression.
- **REQ AC-1.2** (REQ:256-262) names the outside set explicitly, including "any dispatch the pipeline
  tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer
  at HEAD", and requires that whole set be "byte-identical to the same run with injection disabled".
  BR-11's revised sentence ("every dispatch prompt **outside BR-1's rule** — whether it fails the
  authoring conjunct or the C-1 target-document conjunct") is exactly AC-1.2's outside set, and
  AT-03/AT-29 quantify over it. This is the correct reading and a real strengthening: at v13 that
  dispatch shape was claimed by no byte-identity rule at all.
- **REQ AC-4.3** (REQ:364-368) is the clause the FSPEC's own traceability row (FSPEC:164,
  `AC-4.3 | BR-11 | AT-03, AT-29`) sends a reader to, and it still says "**non-authoring** dispatch
  prompts stay byte-identical to the disabled run (AC-1.2)" — the one-conjunct phrasing, parenthetically
  deferring to the two-conjunct AC-1.2. REQ AC-6.1 (REQ:412) repeats it ("AC-1.2's dispatch-set
  equality and non-authoring byte-identity"). The FSPEC is not wrong here — it follows the authority
  AC-4.3 itself cites, and REQ's own changelog (REQ:18) records the v0.8 erratum as "closes AC-1.2's
  outside-set over authoring-tagged dispatches with no C-1 document type". But after this delta the
  FSPEC's BR-11 and the REQ clause it traces to no longer say the same thing in the same words, and
  the weaker upstream wording is the one a later reader will resolve against. Route the wording lag
  to the REQ (F-02).
- **REQ AC-5.2** (REQ:397-403) claims "the corpus paths touched are exactly the reads of the documents
  AC-3.1 and AC-3.2 name — a positive membership claim, not an absence-only one". Paths, not counts.
  BR-15's revised bullet now says so explicitly; AT-33 does not (F-01).
- **REQ NG-5** (REQ:142) scopes non-application to "C-1's rule", which is the two-conjunct rule — so
  BR-1's and FSPEC:765's NG-5 references stay accurate under the widened complement.

No citation in the delta points at a nonexistent authority, and the traceability rows at FSPEC:149
(`AC-1.2 → BR-1, BR-11 → AT-02, AT-03`) and FSPEC:169 (`AC-5.2 → BR-15 → AT-33, AT-34`) still resolve.

## Behavioral Flow

**D-2 — my v13 F-01 is resolved, in the stronger of the two forms I offered.** The row now reads
"Does BR-1's two-conjunct rule hold — authoring-classified **and** a target document among the six
C-1 types?" with branches "both hold → block / not authoring-classified → no block /
authoring-classified, target none of the six → no block". That is three named branches where there
were two, and the third is precisely the discriminating case that had no name at v13. Because
FSPEC:277-278 makes this table the DC-05 branch catalogue ("Every branch in this table has at least
one acceptance test"), the table now *demands* a test for the case, instead of being satisfiable by
an implementation that drops the `docType` conjunct.

The demand is met, not merely declared: the branch-coverage paragraph (FSPEC:971-972) was updated in
the same edit to "D-2 — all three branches, the authoring-classified non-C-1 target included — by
AT-02/03", and both of those ATs were themselves widened to cover it (see §Acceptance Tests). Table,
mapping and oracle moved together; this is the coverage triangle closing, which is what I wanted from
the routed item.

Step 0 item 5 (FSPEC:195-197) still delegates rather than restates ("If the dispatch is **not** one
C-1 names as authoring, the flow stops here with no record (BR-1)"). It was elliptical at v13 and is
elliptical now, but it defers to C-1, which is the two-conjunct rule, and D-2 three lines below now
carries the full question — so a reader following the flow into the decision table gets the correct
rule. Not a finding.

Step 22 (FSPEC:265-267) still cites `BR-11, AC-4.3` for the gate-input claim. BR-11 changed under it
this round; the citation still resolves and the sentence makes no conjunct claim of its own, so it
survives the delta intact. The AC-4.3 wording lag is filed against the traceability row, not here.

No other flow step, and none of the ordering, bounding or record loci, is inside the diff.

## Business Rules

**BR-1 (untouched).** Byte-identical to the version I approved at v13; the erratum correctly left it
alone and propagated its complement outward instead.

**BR-11 (edited).** The rewrite is the substantive improvement of this round. "Every dispatch prompt
**outside BR-1's rule** — whether it fails the authoring conjunct or the C-1 target-document
conjunct — is byte-identical to the same dispatch composed with injection disabled" replaces "every
non-authoring dispatch prompt". Under the old wording, the authoring-classified/non-C-1-target
dispatch was in a testability hole: BR-1 excluded it from carrying a block, but no rule asserted its
prompt was unchanged, so an implementation that injected into it violated no stated FSPEC rule and
reddened no FSPEC-named test. The new quantifier closes that hole, and the *"whether it fails …
or …"* clause is what makes the population enumerable for a test author rather than a predicate they
must re-derive. The rule's falsifiable-form paragraph below (scripted fixtures, composed prompt
bytes, not live-run verdicts) is unchanged and still correct under the wider population.

**BR-15 (edited).** My v13 F-02 lands. The bullet now states the oracle explicitly: "Both sides are
compared as **sets of paths**, not as counts, so a document opened more than once neither adds a
member nor changes the verdict (REQ AC-5.2)." That is the faithful reading of AC-5.2's "the corpus
paths touched are exactly the reads of the documents … name", it keeps the `RSN-SELF` carve-out and
the `RSN-UNREADABLE` inclusion (the conjunct that keeps the equality falsifiable in the failure
direction), and it retains the in-place justification for the enumeration contributing no member.

What the edit did **not** do is carry the correction into AT-33, which transcribes this bullet.
AT-33 (FSPEC:947-949) still spells the expected set as "exactly one attempt per report-named document
other than the `RSN-SELF` ones" — the count phrasing BR-15 just disowned. Rule and oracle now
disagree in a directly testable way: a production path that opens a selected document twice (a size
probe then a read, or a re-read after ordering) is green under BR-15 and red under AT-33 as written,
and PLAN LI-11 transcribes the AT, not the rule. One clause in AT-33 (F-01). This is the classic
erratum failure mode — correcting a rule and leaving its transcription behind — and it is the one
place this otherwise careful delta hit it.

BR-2 through BR-10 and BR-12 through BR-14, and BR-16, are outside the diff and unchanged from the
bytes I approved at v12/v13.

## Edge Cases and Error Scenarios

No E-row is inside the diff hunks. I checked the rows the edited rules could have stranded:

- **E-27 / E-28 / E-29** (FSPEC:762-764) name AT-02 as their owner and describe the set-equality and
  no-fixed-count properties. AT-02's fixture list gained a fourth member this round; the three E-rows'
  fixtures are still in that list verbatim, so no E-row lost its owner or its fixture.
- **E-06 / `RSN-SELF`** — BR-15 still carves it out as "decided from the path before any read", and
  AT-04 still requires the per-document `RSN-SELF` row with no corpus-level `RSN-EMPTY`. Unchanged by
  the set-vs-count correction, which touches only how the remaining members are compared.
- **`RSN-UNREADABLE`** — still explicitly inside the expected set ("the failed attempt is the read").
  Preserved verbatim.

The widened complement in BR-11 gains no new edge-case owner and needs none: the states it adds are
byte-identity claims already covered by AT-03 and AT-29, whose populations widened with it. Widening
an exclusion only widens a population an existing AT already quantifies over — it cannot orphan a row.

The branch-coverage paragraph's first sentence (every E-row names an AT, every AT appears in the
reverse trace) is unchanged and still holds over these bytes.

## Acceptance Tests

Three ATs moved, and the movement is in the right direction in every case.

**AT-02 (edited).** My v13 F-03 lands. The fixture list is now "a run with no DECISIONS phase, a run
whose Phase R has no creator, a run with five optimizer rounds, and a run containing an
authoring-classified dispatch whose target is none of the six C-1 document types — so reverting
BR-1's second conjunct reds this test." The added trailing clause is the part I care about most: it
states the mutation the fixture exists to catch, in the AT itself, so an implementer who prunes the
fixture can see what they are pruning. That is a mutation-check contract written into the spec, not
merely a fixture enumeration. The universe clause ("the whole dispatch universe, not only those
already classified authoring") is unchanged and remains what makes an over-injection observable.

**AT-03 (edited).** Now quantifies over "the prompt of each dispatch **outside BR-1's rule** —
including the authoring-classified dispatch with no C-1 target". Tracks BR-11 exactly, and the
"including" clause names the member that would otherwise be silently absent from the population a
test author constructs. Same fixtures, same baseline comparison, wider and now-enumerable population.

**AT-29 (edited).** Its final conjunct became "every dispatch prompt outside BR-1's rule is
byte-identical to the recorded baseline", matching BR-11 and AT-03. The five-way set equality over
verdicts, completeness scores, round-window counters, approval anchors and erratum routes is
untouched, so the AC-4.3 gate-input oracle keeps the shape I approved.

**AT-33 (not edited — and it should have been).** Its expected set still reads "exactly one attempt
per report-named document other than the `RSN-SELF` ones", i.e. the count formulation, while BR-15
now says sets of paths and not counts. See F-01; the fix is one clause. Everything else in AT-33
survives: the observed set is asserted **non-empty** (the control that stops AT-34's absence claim
being vacuous), the enumeration-contributes-no-member clause is present, and the write-side boundary
conjuncts are intact. AT-34 still names AT-33 as its same-instrument, same-test control.

The **branch-coverage mapping** (FSPEC:968-975) was updated for D-2's third branch and is the only
mapping line that needed to move; D-1 and D-3 … D-12 mappings are byte-identical. AT-01, AT-04
through AT-28, AT-30 through AT-32, AT-34 and AT-35 are unchanged from the bytes I approved.

Line-wrapping in the edited AT-33 and BR-15 bullets still runs past the document's column width
mid-clause (FSPEC:693, FSPEC:949) — cosmetic, worth a re-wrap on the next touch, not a finding.

## Open Questions

My one carried `DEFERRED:` item is unchanged and still non-blocking: BR-9's notice catalogue leaves
its emission locus unstated, routed to TSPEC. This delta neither addresses nor disturbs it.

The v13 heads-up for the TSPEC round is now sharper rather than resolved. TSPEC:1305-1307 describes
this FSPEC's expected set as "every authoring-classified dispatch, including Phase CR's optimizer"
and frames the `docType` conjunct as something "TSPEC therefore adds". After v0.11 that was stale for
BR-1; after v0.12 it is stale for BR-11, AT-03 and AT-29 as well — the FSPEC and TSPEC expected sets
now agree everywhere, and the TSPEC's account of a divergence describes bytes that no longer exist.
That is the TSPEC's finding to carry, not this document's; flagging it here so the next TSPEC round
re-grounds on these bytes.

- **Q-01** — A-2 now says BR-1 excludes a future dispatch that "satisfies **neither** conjunct". The
  exclusion set is dispatches failing **at least one** conjunct, which is the larger set and the one
  containing the very case this erratum exists for. Was "neither" deliberate, or is it the artifact
  of rewriting a one-conjunct sentence into two? (F-03.)

## Positive Observations

- **The routed D-2 item was fixed at the level of the mechanism, not the sentence.** The table row,
  the branch-coverage mapping and the two owning ATs all moved in the same erratum. A branch that is
  named in a catalogue but has no mapped oracle is a coverage claim without coverage; this delta
  closed all three sides.
- **AT-02 states its own mutation contract.** "so reverting BR-1's second conjunct reds this test"
  written into the AT is exactly the artefact that survives a future implementer's fixture pruning.
  I would like to see more ATs in this document carry that clause.
- **BR-11's widening closed a real testability hole, unprompted.** The routed items asked for prose
  consistency; the author noticed that the authoring-classified/non-C-1-target dispatch was excluded
  from carrying a block by BR-1 but claimed by no byte-identity rule, and fixed the gap rather than
  the wording. That is the difference between an erratum that satisfies a checklist and one that
  makes the next phase's tests possible.
- **The header row was fixed by removing the re-staling mechanism**, not by re-enumerating through
  v13. `v{N}` — every round present on this branch — cannot go stale next round.

## Recommendation

**Approved with minor changes**

All three routed items land, and the two that carry testing weight land in the form that matters:
D-2 asks the two-conjunct question with three named branches and the branch-coverage mapping and
AT-02/AT-03 were moved to cover the new one, so the discriminating case now has a name, an owner and
a stated mutation contract. The header row stops re-staling, and the Overview and A-2 no longer
restate one conjunct while deferring to BR-1. The erratum also carried BR-1's complement into BR-11,
AT-03 and AT-29, closing a hole where the authoring-classified/non-C-1-target dispatch was excluded
from injection by BR-1 but claimed by no byte-identity rule. Nothing I approved at v12/v13 is broken:
no ordering, bounding, config, record or edge-case text moved, no E-row lost an owner, and the REQ at
HEAD hashes to the dispatch digest.

Three non-gating findings, none High. **F-01 (Medium, delta)** is the one to land before
implementation: BR-15 now states its oracle as sets of paths and not counts, but AT-33 — the
transcription PLAN LI-11 reads — still says "exactly one attempt per report-named document", so rule
and oracle disagree on a document opened twice. One clause. **F-02 (Medium, delta)** is a citation
lag pointing upstream: BR-11/AT-03/AT-29 now quantify over "outside BR-1's rule" while the REQ
clause the traceability row sends a reader to (AC-4.3, echoed at AC-6.1) still says "non-authoring
dispatch prompts"; the FSPEC's reading is the correct one and follows AC-1.2, which AC-4.3 itself
cites, so the fix belongs in the REQ's wording, not here. **F-03 (Low, delta)** is A-2's "satisfies
neither conjunct" where the exclusion set is "fails at least one".

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | BR-15's expected set now says both sides are compared as **sets of paths, not counts** (REQ AC-5.2 claims paths), but AT-33 — which transcribes it and which PLAN LI-11 reads — still says "exactly one attempt per report-named document other than the `RSN-SELF` ones". A production path that opens a selected document twice is green under the rule and red under the oracle. Restate AT-33's expected set as a set of paths, or make at-most-one-open-per-path an explicit conjunct of BR-15's claim. | §Acceptance Tests → AT-33 (vs §Business Rules → BR-15) |
| F-02 | Medium | delta | local | BR-11, AT-03 and AT-29 now quantify over "every dispatch prompt **outside BR-1's rule** — whether it fails the authoring conjunct or the C-1 target-document conjunct", but the upstream clause the traceability row `AC-4.3 \| BR-11 \| AT-03, AT-29` (FSPEC:164) sends a reader to still reads "**non-authoring** dispatch prompts stay byte-identical to the disabled run" (REQ:367), echoed at REQ AC-6.1 (REQ:412). The FSPEC's reading is the correct one — it follows AC-1.2, which AC-4.3 itself cites, and REQ:18 records the v0.8 erratum closing that outside set — but the cited clause no longer says it the same way, and the weaker wording is what a later reader resolves against. Route the AC-4.3/AC-6.1 wording to the REQ. | §Business Rules → BR-11; §Linked Requirements traceability row AC-4.3 |
| F-03 | Low | delta | local | A-2 now reads "If a future phase introduces a dispatch that satisfies **neither** conjunct in the pipeline's own terms yet is authoring in spirit, BR-1 excludes it by construction". BR-1 excludes dispatches failing **at least one** conjunct; "neither" describes a strict subset and omits the very case this erratum exists for (authoring-classified, target not one of the six). Say "fails either conjunct". | §Open Questions → Assumptions (A-2) |

FINDING: Medium | delta | nonlocal | §Acceptance Tests → AT-33 (vs §Business Rules → BR-15) | the erratum corrected BR-15's oracle to sets of paths rather than counts but left AT-33 transcribing "exactly one attempt per report-named document", so rule and oracle now disagree on a document opened twice and the AT is the side PLAN LI-11 transcribes
FINDING: Medium | delta | local | §Business Rules → BR-11; traceability row AC-4.3 | BR-11/AT-03/AT-29 now quantify over dispatches outside BR-1's two-conjunct rule while the cited upstream clause REQ AC-4.3 (echoed at AC-6.1) still says "non-authoring dispatch prompts"; the FSPEC's reading follows AC-1.2 and is correct, but the citation no longer matches its authority's words and the REQ wording should be routed back
FINDING: Low | delta | local | §Open Questions → Assumptions (A-2) | A-2 says BR-1 excludes a dispatch that "satisfies neither conjunct" where the exclusion set is dispatches failing at least one conjunct, so as written it omits the authoring-classified/non-C-1-target case this erratum exists for

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

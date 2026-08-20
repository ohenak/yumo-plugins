# Cross-Review: test-engineer — FSPEC (delta confirmation, round v15)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.13)
**Date:** 2026-08-20
**Iteration:** 15

## Overview

Delta confirmation of the v0.13 erratum against the FSPEC I approved at v14 (reviewed commit
`c1d7218e`). The delta is `eeafa236~1..cfb3d4d6`, +38/-18 across six erratum commits, touching: the
header version cell, an appended v0.13 revision note (FSPEC:67-79), decision row D-12 (FSPEC:294),
BR-6's byte-accounting-basis and per-document-bound paragraphs (FSPEC:480-498), BR-9's
`RSN-NO-MATERIAL` catalogue line (FSPEC:560), a new edge row E-36 (FSPEC:775), AT-30
(FSPEC:944-948), the E-row range in the branch-coverage paragraph (FSPEC:988), and obligation F-O-1
(FSPEC:1009). Nothing else moved a byte: the eligibility, ordering, record, config-state and
byte-identity material I approved at v12/v13/v14 is untouched.

Upstream REQ at HEAD hashes to `ff605dd3…92e84dd`, matching the dispatch digest exactly, so no
upstream sentence has shifted under this FSPEC since my last round. I re-read REQ AC-2.3
(REQ:291-295), AC-2.4 (REQ:296-301), AC-3.1 (REQ:310-318), AC-4.4 (REQ:371-374) and §4.1's threshold
table (REQ:225-226) against the delta rather than trusting the erratum note.

**All three routed items land.** The byte-accounting basis is now **material only** and reads exactly
as REQ AC-2.3's "the material taken", removing the FSPEC/TSPEC contradiction in the direction the
upstream clause supports. `maxBytesPerDocument: 0` is decided, given an edge row (E-36) and folded
into AT-30 beside the other two zeros. F-O-1 now owns both heading-recognition rules, so BR-6's
delegation names a real owner and the `## 3. Rejected Proposals (with rationale)` matching question
has somewhere to be answered.

No High. Nothing I previously approved is broken by this delta. Five findings: two are the delta's
own loose ends — a decision-table row and a traceability row that did not travel with the zero
decision — and three are my v14 Mediums/Low, untouched by this erratum and therefore re-filed as
`inherited` so they route rather than halt.

## Linked Requirements

Every citation the delta introduces resolves to live upstream text at HEAD, and in the two places
that matter it now quotes the clause rather than paraphrasing it:

- **REQ AC-2.3** (REQ:291-295) reads "the **material taken** from it does not exceed that threshold,
  the total across selected documents does not exceed `learningsInjection.maxTotalBytes`, and that
  document's report row carries the per-document bounded flag". The material-only basis is that
  sentence, and BR-6's new parenthetical ("REQ AC-2.3, which bounds 'the material taken'") quotes it
  verbatim. **REQ AC-2.4** (REQ:296-301) independently confirms the total is measured over material
  too: "selected documents whose **combined material** would exceed `maxTotalBytes`". The pre-delta
  wording — contributed bytes include the identification line, delimiters and source-path label — was
  the reading upstream does *not* support; the erratum moved the FSPEC onto the clause. Faithful
  compression, and the direction of the fix is the correct one.
- **REQ AC-3.1** (REQ:310-318) requires per authoring dispatch "the bytes injected per document; per
  document, whether its material was bounded (AC-2.3); and the total bytes injected". BR-8's *bytes
  injected* is now defined as the same material-only quantity BR-6 bounds, and the per-dispatch total
  as the sum of those rows — so one quantity is bounded, recorded and summed, which is what makes an
  expected byte count computable from a fixture without rendering the block. This closes a real
  test-authoring hazard: under the old basis a fixture's expected count depended on delimiter and
  label bytes the FSPEC never fixed (F-O-2 defers the wording to TSPEC), so no AT could state a
  literal without importing an unfixed string.
- **REQ AC-4.4** (REQ:371-374) covers "thresholds in §4.1 configured to values that admit nothing
  (zero documents **or zero bytes**), *when* the pipeline runs, *then* it behaves as an enabled run
  whose selection is empty — AC-3.1's empty rows, not AC-5.1a's absent key". `maxBytesPerDocument: 0`
  is a "zero bytes" threshold under §4.1's non-negative-integer rule (REQ:225), so E-36's outcome —
  enabled run, empty selection, BR-8 rows present and empty — is AC-4.4's outcome, not an invention.
  The FSPEC decides the one thing AC-4.4 leaves open (which per-document reason id the dropped
  documents carry) and decides it consistently with BR-9. Faithful.
- **REQ §4.1** (REQ:225-226) still declares `maxBytesPerDocument` 6,000 and `maxTotalBytes` 20,000 as
  consumer config, with no lower bound above zero — which is exactly why the third zero was reachable
  and needed deciding. The erratum's premise checks out against upstream; it is not a hypothetical.

One traceability row did not travel with the decision: FSPEC:178 still reads
`AC-4.4 | BR-5, BR-14 | AT-30`, while the `maxBytesPerDocument: 0` half of AC-4.4 is now decided in
**BR-6** and reasoned in **BR-9**. The reverse trace is the map a test author uses to find the rule
behind an AT; for this AC it now points at two of the three rules that own it (F-02).

## Behavioral Flow

**D-12 (edited).** The row now asks "Does the document yield any material?" with branches
"yes / no → `RSN-NO-MATERIAL`", replacing "Does the document carry any priority section?". This is
the right generalisation: the zero-bound document *carries* priority sections and still contributes
nothing, so the old question and the reason id it gated had diverged the moment E-36 was decided.
Because FSPEC:296-297 makes this table the DC-05 branch catalogue, restating the question over
"yields material" is what makes AT-30's zero-bound leg a **branch of a named decision** rather than
an unowned special case.

**D-9 did not travel with it, and it should have (F-01).** D-9 (FSPEC:294) still reads "Does the
per-document byte bound bind? → **yes → bounded flag** / no". Under `maxBytesPerDocument: 0` the
per-document bound binds in the strongest possible way, and yet no bounded flag is produced — the
document is dropped with `RSN-NO-MATERIAL` and has no BR-8 row to flag. A test author enumerating
D-9's branches to satisfy the DC-05 claim therefore has a branch label whose stated outcome is false
for one reachable input, and the two rows now answer the same fixture inconsistently: D-9 says
"bounded flag", D-12 says "`RSN-NO-MATERIAL`". One qualifier on D-9's yes-branch ("→ bounded flag,
except where the bound is zero (D-12)") resolves it. This is a Medium, not a High: AT-30 asserts the
D-12 outcome explicitly, so the oracle a test author would actually write is unambiguous — but the
decision table is the artefact PLAN transcribes when it enumerates branch coverage, and it currently
promises a flag the run does not emit.

**Steps 16-17 (FSPEC:259-263, unedited).** Step 16 still says the material is "cut if it exceeds
`learningsInjection.maxBytesPerDocument`" and marked **bounded**; step 17 accumulates contributed
bytes. Neither step makes a framing claim of its own, so both survive the basis change intact — step
17's "contributed bytes" now resolves to BR-6's material-only definition, which is the only
definition in the document. Step 19's block-composition step (FSPEC:271) is where the preamble and
delimiters are produced, and it makes no byte-accounting claim, so the "framing is charged to
nothing" rule has no contradicting flow step to reconcile with. Clean.

No other flow step, and no decision row other than D-12, is inside the diff.

## Business Rules

**BR-6 — the byte-accounting basis (edited).** The rewrite is the substantive win of this round. "A
document's **contributed bytes** are its **material** — the section headings and bodies taken from
it, and nothing else" replaces the framing-inclusive definition, and the framing clause names every
excluded artefact explicitly (identification line, per-document delimiters and source-path label,
block preamble). Three testing consequences, all improvements:

1. **An expected byte count is now computable from a fixture alone**, and the FSPEC says so. Under
   the old basis it was not: the identification line's format and the delimiters are F-O-2's and
   F-O-3's to fix in TSPEC, so any AT stating a literal expected count depended on strings this
   document deliberately does not fix. AT-11 and AT-12 both demand exactly such a literal
   ("committed with the fixture as a literal integer, recomputed by hand when the fixture changes,
   never derived in the test"). Those two ATs were unsatisfiable-as-written at v0.12 and are
   satisfiable now — the delta retroactively repaired an oracle I had approved.
2. **The self-referential budget is gone.** The justification the FSPEC gives — "a document is never
   abridged to pay for the annotation that says it was abridged" — is the real defect: the ABRIDGED
   annotation is emitted *because* the document was bounded, so charging it to that document's own
   budget makes the budget depend on its own outcome. That is a fixed-point, not a threshold, and it
   is untestable by construction.
3. **The FSPEC/TSPEC contradiction is resolved on the FSPEC's side, toward the upstream clause.**
   TSPEC §D.5 (TSPEC:763-790) already said "`maxBytesPerDocument` bounds material only, and so does
   `bytesInjected`", with framing charged to nothing and `totalBytesInjected` differing from rendered
   block size by a framing constant. The FSPEC now agrees, and agrees with REQ AC-2.3/AC-2.4. The
   downstream fixture guidance in TSPEC ("a fixture that wants to pin framing cost asserts on the
   rendered block, not on `bytesInjected`") needs no change.

**BR-6 — the zero bound (edited).** "Where the bound is **zero**, no material is admissible from any
document: each yields nothing, is dropped before the total bound with `RSN-NO-MATERIAL` (BR-9) and
consumes no slot, and the run is the enabled, empty-selection run BR-14 describes (E-36, AT-30)."
This decides all three of the routed sub-questions at once — not `RSN-BYTES`, not a zero-byte
contribution, not a refusal — and it decides them the way the rest of the rule already worked:
FSPEC:475-478 already dropped a no-material document before the bounds "otherwise it would take a
`maxDocuments` slot while injecting zero bytes, indistinguishable in BR-8's rows from real
contribution". The zero-bound document is that same document arrived at by a different route, so it
gets the same treatment. Consistency with the existing rule, not a new mechanism — which is what
makes it cheap to test.

The one seam the sentence leaves rough is its neighbour, not itself: the preceding paragraph still
ends "If the **first** section alone exceeds the bound, it is taken up to the bound and cut. **Either
way** the document's row carries the **bounded** flag (AC-2.3)". At bound zero the first section does
exceed the bound, so the unqualified "either way" reaches the case the very next sentence decides
differently. Prose order resolves it for a careful reader — the exception follows the rule — but D-9
repeats the unqualified form in the decision table, where there is no following sentence to correct
it (F-01).

**BR-9 (edited).** `RSN-NO-MATERIAL`'s catalogue line now reads "Eligible, but yields no material —
it carries none of BR-6's priority sections, or the per-document bound is zero and admits none". The
reason id is now overloaded across two causes, which is the right call: BR-9's ids classify the
*outcome* a report reader sees, and both causes produce the identical outcome (no slot, no bytes, no
row in the selected set). Splitting them would create a second id no consumer could act on
differently. The closed-set claim over the catalogue is unaffected — no id was added or removed.

BR-1 through BR-5, BR-7, BR-8, BR-10 through BR-16 are outside the diff and byte-identical to what I
approved at v14.

## Edge Cases and Error Scenarios

**E-36 (new).** "`maxBytesPerDocument: 0` → No document yields material: every one carries
`RSN-NO-MATERIAL` and consumes no slot; enabled run, empty selection, BR-8 rows present and empty →
AT-30." The row is well-formed for this table's contract: a named trigger, a fully positive outcome,
and a named AT. Three positive conjuncts, not an absence claim — the reason id is asserted by value,
the slot consumption is asserted at zero, and the run shape is asserted as *enabled with empty rows*
rather than "not disabled". That last distinction is the one that matters most here, because the
failure mode this row exists to catch (a zero threshold read as "off") produces the disabled run's
**absent key**, which an absence-only oracle would not separate from an empty-rows run.

**E-19 (unedited) still owns its own cause.** E-19 is the measured, real-corpus document that carries
none of BR-6's five sections and yields `RSN-NO-MATERIAL` at default thresholds. E-36 shares the
reason id but not the trigger, and both name an AT, so neither row absorbs the other and no row lost
an owner. The pair is worth keeping distinct in the table precisely because a mutation that broke the
zero-bound path would leave E-19 green.

**The E-row range statement was updated** — "Every row of §Edge Cases and Error Scenarios (E-01 …
**E-36**, less retired E-05) names an AT" (FSPEC:988). This is the small bookkeeping line errata
routinely miss, and missing it would have made the completeness claim false by one row the moment
E-36 landed. It travelled.

I checked the rows the basis change could have stranded:

- **E-rows over `maxTotalBytes`** (the `RSN-BYTES` family) describe whole-document drops from the low
  end and make no framing claim, so the material-only basis changes their expected sizes in a fixture
  but not their stated outcomes. AT-13's fixture is "sized so that `maxTotalBytes` drops the
  lowest-ordered of the five taken" — a relative sizing constraint, still satisfiable, now more
  easily since the fixture author no longer needs delimiter bytes to compute the boundary.
- **The bounded-flag rows** still route through AT-11/AT-12, whose literal counts are now computable
  (see §Business Rules). No row is orphaned.
- **BR-14's config-state table row** "Enabled, with thresholds admitting nothing (zero documents or
  zero bytes) → the enabled composition, with an empty selection → BR-8's rows, present and empty"
  (FSPEC:669) is unedited and now has three instantiating thresholds instead of two. Widening the set
  of triggers that reach an already-stated outcome cannot orphan the row.

## Acceptance Tests

**AT-30 (edited).** The third zero joins the other two in the same AT: "*Given* thresholds configured
to admit nothing — `maxDocuments: 0`, separately `maxTotalBytes: 0`, and separately
`maxBytesPerDocument: 0` … *then* it behaves as an enabled run with an empty selection: BR-8's rows
present and empty, **not** the absent key of a disabled run, and no refusal to run; *and* in the
`maxBytesPerDocument: 0` case every corpus document carries `RSN-NO-MATERIAL` (E-36)."

Two things I want to record about this shape, because both are the falsifiability property I would
otherwise have asked for:

1. **The three zeros are separate legs of one AT, not one merged fixture.** "separately" is doing
   real work — a single fixture with all three thresholds at zero would pass under an implementation
   that honours only one of them, because any one zero produces the same empty selection. Three legs
   means three independently falsifiable assertions, and a mutation that drops the per-document zero
   check reds exactly one leg.
2. **The per-document leg carries its own discriminating conjunct.** The shared conjunct (enabled,
   empty rows, no refusal) is identical across all three zeros and therefore cannot tell them apart;
   the added "every corpus document carries `RSN-NO-MATERIAL`" is what separates the zero-bound leg
   from the `maxDocuments: 0` leg, where documents are not-selected for a different reason. Without
   it, the third leg would be a duplicate of the first and would false-green a `maxBytesPerDocument`
   implementation that ignored the threshold entirely and dropped everything for an unrelated cause.
   The AT names the reason id by value; this is the positive-mechanism conjunct, and it is present.

The `not the absent key of a disabled run` conjunct is retained across all three legs, which is the
control that keeps the enabled/disabled distinction falsifiable rather than an absence claim.

**AT-11 and AT-12 (unedited, and repaired by the delta anyway).** Both demand an expected contributed-
byte count "committed with the fixture as a literal integer, recomputed by hand when the fixture
changes, never derived in the test". The material-only basis is what makes that literal derivable by
the fixture author at all (see §Business Rules). No edit needed; the ATs are strictly more
implementable than when I approved them.

**Nothing in the delta touches AT-01 … AT-29 or AT-31 … AT-35.** The branch-coverage paragraph's D-12
mapping still resolves — D-12's "no" branch is now exercised by both E-19's AT and AT-30's third leg,
which is redundancy in the useful direction. The paragraph's D-9 mapping is untouched and still names
AT-11/AT-12; those cover the non-zero bind, which is what D-9's label describes and all it should be
asked to cover once F-01's qualifier lands.

One carried-over oracle divergence is still open and is not this delta's doing: **AT-33** (FSPEC:973)
still spells its expected set as "exactly one attempt per report-named document other than the
`RSN-SELF` ones" — a count formulation — while BR-15 (FSPEC:710) says both sides are compared as sets
of paths and "a document opened more than once neither adds a member nor changes the verdict". I
raised this at v14 as F-01; the v0.13 erratum did not route it. Re-filed here as `inherited` (F-03).

## Open Questions

**F-O-1 (edited) — the routed delegation gap is closed.** The obligation now reads "Two
heading-recognition rules, on the same terms: the predicate for 'presents as a LEARNINGS document'
(BR-3), **and** the rule by which a heading counts as one of BR-6's named sections — whether the
numbered form, the bare title or a prefix of it is matched. Both are bounded by two requirements this
FSPEC fixes: each consults only the document's bytes, and each is decidable without a model call."

This is the correct shape for a testability delegation, on three counts. It names the **decision**
owed (numbered form / bare title / prefix), not merely the area, so the TSPEC round can be checked
against a specific answer rather than an essay. It carries the **same two bounds** to both rules, so
neither can be discharged with a model call or a filesystem read, which are the two mechanisms that
would make the matcher non-deterministic and its tests flaky. And it sits in the obligations table,
which is the artefact the TSPEC's "entry obligations discharged here" section transcribes — so the
gap is now *tracked*, not merely mentioned. BR-6's own text (FSPEC:441-442) already said "which
headings count as these sections is F-O-1's, not text matched literally here", so after this edit the
delegation and the owner agree.

**Heads-up for the next TSPEC round** (that document's finding to carry, not this one's): TSPEC §D.5
discharges F-O-1's document-shape half via `LEARNINGS_HEADING_RE` and specifies
`extractInjectableMaterial(text, maxBytes)` returning `{material, bytes, bounded}` with
`bounded === true` exactly when material was cut; T-O-6 (TSPEC:1236) turns that into a property over
**any** non-negative `maxBytes`. At `maxBytes: 0` that property yields empty material with
`bounded: true`, whereas the FSPEC now says the document yields nothing, is dropped, and carries
`RSN-NO-MATERIAL` with no row to flag. The extractor's return value and the selection outcome are not
in conflict — the caller drops on empty material regardless of the `bounded` bit — but the TSPEC must
say so, and T-O-6's generator now needs `maxBytes: 0` in range with the caller-side outcome pinned.
Flagging it here so the next TSPEC round re-grounds on these bytes rather than discovering it in
implementation.

**Q-01** — Is the section-heading matcher intended to be the *same* regex as `LEARNINGS_HEADING_RE`
with a different capture, or two independent matchers that merely share the two bounds? F-O-1's "on
the same terms" reads as the latter; if the former is intended, saying so would let TSPEC discharge
both halves with one pinned pattern and one mutation test.

**Q-02** — At `maxBytesPerDocument: 0`, is the corpus-level record still silent (per-document
`RSN-NO-MATERIAL` rows only), or does an all-documents-drop run also carry a corpus-level outcome?
BR-9's corpus-level catalogue covers "no document is known"; here documents *are* known and all drop.
E-36 and AT-30 assert BR-8's rows present and empty, which implies no corpus-level id, but the
implication is inferred rather than stated. Not a finding at FSPEC altitude — the outcome is
determined either way by BR-9's closed set — but worth one clause if it is cheap.

My carried `DEFERRED:` item (BR-9's notice-emission locus, routed to TSPEC) is unchanged and still
non-blocking. This delta neither addresses nor disturbs it.

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

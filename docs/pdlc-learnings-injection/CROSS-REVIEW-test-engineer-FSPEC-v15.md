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

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

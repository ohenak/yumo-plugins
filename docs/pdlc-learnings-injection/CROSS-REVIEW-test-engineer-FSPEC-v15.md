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

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

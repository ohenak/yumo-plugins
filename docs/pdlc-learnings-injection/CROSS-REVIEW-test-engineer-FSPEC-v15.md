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

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

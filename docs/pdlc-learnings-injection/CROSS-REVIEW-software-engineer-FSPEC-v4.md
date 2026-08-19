# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-19
**Iteration:** 4

Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v3.md`, over
`git diff 2e4408d1..HEAD` on the FSPEC (40 insertions, 26 deletions, v0.3 → v0.4).
Only changed sections were re-read for new defects. Every measured claim the round touched was
re-measured against HEAD.

## Prior findings disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-5's qualifier now reads "matching BR-6's five names in the `## N. Title` form the corpus writes" (FSPEC:360-361), which is what BR-6 states (FSPEC:391-397) and what the corpus ships: all 9 local corpus documents write every priority section with a numeric prefix, `## 1. Non-Convergences` … `## 6. Approval Record`, and no document writes a bare title. Re-measured at HEAD with BR-6's table titles under ordinal-tolerant matching: max **41,175 bytes** at `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md`, against the quoted 41,180 — the basis now reproduces the number the paragraph carries, where v0.3's "strict title matching" basis selected zero bytes in every document. The clause TSPEC reads for F-O-1's heading-form pin no longer licenses a predicate that injects nothing. |
| F-02 | Medium | **Resolved** | BR-3 now routes the divergence explicitly: "REQ AC-3.2's catalogue lists `RSN-TRUNCATED` and omits `RSN-NO-MATERIAL`; BR-9 differs on both — `ERRATUM: REQ` rides" (FSPEC:298-299). Verified upstream: `REQ-…md:314-317` lists `RSN-TRUNCATED` and carries no `RSN-NO-MATERIAL`. |
| F-03 | Medium | **Resolved** | BR-9 is now "three closed catalogues" with a notice catalogue of `NTC-MALFORMED` and `NTC-KEYTYPE` (FSPEC:474, 499-506), the ids are used at every site the notices appear — flow step 3, D-1, BR-14 rows 3-4, E-23, E-34 — and AT-32 carries "a **completeness test asserts set equality** over `NTC-MALFORMED` and `NTC-KEYTYPE`" (FSPEC:871-872), so REQ C-9's registration-with-a-test closure now has an enumeration to close over. The disjointness rule was generalised to three catalogues rather than left binding two. |
| F-04 | Low | **Resolved** | AT-12's bound is now "a fixture literal, recomputed by hand on change, never derived in the test" (FSPEC:783-784) and AT-13 gained "Its dropped set and byte counts are fixture literals, never derived" (FSPEC:791-792). The whole byte-accounting group is now pinned to transcription rather than computation. |

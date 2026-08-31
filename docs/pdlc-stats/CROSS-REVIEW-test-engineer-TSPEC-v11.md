# Cross-Review: test-engineer — TSPEC (delta confirmation, erratum round 8)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.8, `sha256:f32d9cb5…`)
**Upstream at HEAD:** REQ `sha256:f75c348f…` (v1.7), FSPEC `sha256:a493133f…` (v1.8)
**Reviewed range:** `bf496d9aa..0d72080f3` (three commits, TSPEC only)
**Date:** 2026-08-31
**Iteration:** 11 (delta confirmation; decision freeze in force)

## Overview

**All four v10 findings are resolved, nothing regressed, and the rule the round settled is green in
production code.** This is the cleanest confirmation round this document has had: the delta is
exactly the re-stamp §4.3 promised it would make when the dispute settled, and I can now check it
against something better than prose — the implementation landed in the meantime, so the settled rule
has a running oracle.

**What the round did** (three commits, TSPEC-only, 41 insertions / 21 deletions):

| Commit | Site | v10 finding it answers |
|---|---|---|
| `bc456b415` | §4.3 — contested paragraph re-stamped to the settled rule; BR-16 pin v1.7 → v1.8; AT-17 fourth-leg narration drops the withdrawn `measured` alternative | F-01, F-03 |
| `1d3976d70` | §8.3 — REQ-STATS-06/BR-16 bullet closed as discharged; count word two → one | F-02 |
| `0d72080f3` | §0 — v1.8 changelog re-grounds on REQ v1.7 / FSPEC v1.8; v1.7's superseded row neutralised in place | F-04 |

**Verification, not acceptance of the changelog's word.** I re-derived every load-bearing claim:

- The REQ text §4.3 now quotes is **verbatim** REQ-STATS-06 at HEAD (`REQ-pdlc-stats.md:207-213`),
  truncated at "reports **harvested**" — no paraphrase, no drift.
- FSPEC BR-16 at HEAD (`FSPEC-pdlc-stats.md:373-383`) states the same rule, and the FSPEC v1.8 diff
  is **11 insertions / 2 deletions confined to the header and changelog** — so §4.3's "FSPEC v1.8
  absorbed the same decision with no rule changed" is measured, not assumed.
- Both grounding hashes in the v1.8 changelog match `sha256sum` at HEAD exactly. F-04's stale pin is
  gone and the replacement is correct.
- §8.3 now carries exactly **one** bullet (BR-26/EC-10), matching its own count word, and
  `TSPEC:155` independently agrees ("only BR-26/EC-10 remains open").

**The new evidence this round affords.** The implementation has landed since v10, so I checked the
settled rule against code rather than documents. `computeByteRatio` (`lib/stats.mjs:277-294`)
filters `crossReviews` through `parsers.parseReviewFilename(b).ok` and fires
`harvested && (crossReviews.length === 0 || dodReviews.length === 0)` — precisely §4.3's sketch. The
AT-17 leg-4 oracle exists (`__tests__/statsMetrics.test.js:389-399`), asserts the positive token
`harvested` plus `ratio === null` over `realParsers()` with `CODE_REVIEW` intact, and **passes**: I
ran the suite (21/21 green). The expected value the dispute could have flipped is now pinned in
three documents and one running test, all reading the same token.

**What is left.** Two Low nits, neither touching an oracle: one wrap-width artefact the
neutralisation edit introduced, one imprecise section attribution in §8.3's closure prose that
predates this round. No High, no Medium. Approved with minor changes.

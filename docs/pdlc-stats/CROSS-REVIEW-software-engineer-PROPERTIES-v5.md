# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 5 (delta re-review of the v1.2 round-3 revision)

## Overview

This is a delta re-review, not a fresh read. My v4 was an upstream-cascade confirmation over
byte-identical PROPERTIES; this round the document actually moved. The reviewed base is v4's
`REVIEWED-COMMIT: 73565854d478ab523999659b677a9a99249fab2d`; HEAD's PROPERTIES hashes
`9b1186842055a769bfdd4e467a4853dda2cba3d105733b9f068c9bd1c7da2978`, so the bytes changed and
`git diff 73565854d..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is the whole of what I
scanned: **+63 / −23** across the revision history, PROP-DISC-10, PROP-RATIO-03/05/06, a new
PROP-RATIO-11, PROP-ERR-10, two §Oracles rows, `F-EXCLUDED-ONLY`, a new `F-CLI-SYMLINK`, four
§Coverage Matrix rows, the §PLAN tasks preamble and two of its rows, the level distribution, a new
G-8 and the checklist line that counts the G-rows.

**My v4 finding is resolved.** v4 carried exactly one open item — Medium F-01, that PROP-RATIO-03's
transcription of AT-15's neither-list and the §Traceability AT-15 / BR-16 rows were stale against
FSPEC v1.7. All four halves landed: PROP-RATIO-03 now names the out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` member and marks `HANDOFF-PROMPT.md` explicitly as a local
addition FSPEC does not carry; PROP-RATIO-06 gained `BR-16, AT-15` in Traces; the §Traceability
`BR-16` row now reads `PROP-RATIO-03, PROP-RATIO-06, PROP-RATIO-08, PROP-RATIO-09`; and the `AT-15`
row picked up `PROP-RATIO-06, PROP-RATIO-11`. I checked FSPEC at HEAD rather than trusting the
revision note: `FSPEC-pdlc-stats.md:901-903` routes `BR-14 | AT-15` and `BR-16 | AT-15, AT-17`, and
AT-15's *Given* (§6.6) enumerates the neither-list as `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`,
`SIZING-*.md` and the out-of-catalogue cross-review — exactly the four PROP-RATIO-03 now transcribes.
Nothing is owed on F-01.

**But the revision introduced one new defect, and it is the kind this round is not allowed to pass.**
The §PLAN tasks preamble was rewritten this round to make the table's `(new)` markers honest — a good
instinct, since implementation waves have landed since the table was first written. The rewrite
states a specific, checkable fact about the repository, and that fact is false at HEAD: it says
wave 9 has not run and `statsRealPaths.test.js` is therefore absent. Wave 9 has run and the file is
tracked. Detail in §Delta-Confirmation Findings. This is a factual contradiction with the repository
at HEAD introduced by this round's edit, so it blocks under both limbs of the frozen-round rule
rather than being deferrable.

Everything else in the delta checks out against code, and I say so section by section below. I
opened no new design question and re-litigated nothing that was settled in v1…v4.

# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 6 (delta re-review of the v1.3 round-5 revision, frozen round)

## Overview

Delta re-review under the decision freeze. My v5 verdict was **Needs revision** on exactly one open
item — F-01 High, delta-introduced and local: the §PLAN tasks preamble v1.2 added asserted that
wave 9 had not run and that `statsRealPaths.test.js` was "legitimately absent", both false at HEAD.

The base I reviewed in v5 was `1be839ea8` (PROPERTIES v1.2, round-3 revision history). Three
commits have touched the document since — `5db3218a9`, `c5725fe88`, `359874bb1`, all v1.3 — and
`git diff 1be839ea8..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is **+34 / −13**, confined to
four places: the revision-history block (new v1.3 entry, corrected v1.2 sentence), §Subject under
test's status paragraph, the §PLAN tasks preamble, and T-18's status cell. **No property row, no
oracle, no fixture, no trace, no coverage-matrix row and no level-distribution figure moved.** That
matches the revision note's own claim about its scope, which I checked by diffing rather than
reading.

**My v5 F-01 is resolved, in both halves.** The preamble no longer claims wave 9 is outstanding and
no longer names `statsRealPaths.test.js` as absent; it now states the measured position and cites
the three wave-9 commits, and T-18's status cell carries the same commit-anchor form T-09 and T-10
already used. I re-measured every anchor rather than trusting the prose, and every one resolves to
the commit the document names (§Oracles). The revision also picked up a cross-round inconsistency
the fix exposed — §Subject under test still said `lib/stats.mjs` was absent and that
`FLAGS_BY_COMMAND` had no `stats` row — which was the right call: leaving it would have put two
contradictory status claims in one document.

I found one new item in the delta, a Medium, and it does not gate: the corrected preamble's
universal quantifier ("every new file the manifest declares is tracked") is wider than the sixteen
files it then enumerates, and PLAN's manifest declares a seventeenth `new` row that is genuinely
absent. Detail in §Findings. Under the freeze I opened no new design question and re-litigated
nothing settled in v1…v5.

# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 6 (delta re-review, DECISION FREEZE in force)

## Overview

**Scope of this round.** Delta re-review under DECISION FREEZE. Per protocol I read my own
v5 cross-review first, then diffed the document under review against the commit I last
reviewed (`0c0475a7`, recorded as `REVIEWED-COMMIT:` in v5).

**The delta is empty.** `git diff 0c0475a7..HEAD -- docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
produces no output, and `git log 0c0475a7..HEAD` over that path lists no commits; the last
commit touching the file is still `0c0475a7` ("PROPERTIES v1.2 lineage and round-4 erratum
changelog"). `git status --porcelain` is clean, so there is no unstaged revision either. The
bytes in front of me are byte-identical to the bytes I approved in round 5
(sha256 `c2ebe8c8…`).

**Upstream is unmoved.** I re-hashed all five upstream documents in the working tree against
the `UPSTREAM-STATE:` anchors recorded in v5; every one matches: REQ `817b6745…`,
FSPEC `82f74a2d…`, TSPEC `1531143c…`, DECISIONS `84deee10…`, PLAN `e97acf66…`. So neither the
document nor anything it compresses has moved since the approved round — there is no drift
underneath this round and no new derivation to re-check.

Consequently the two questions this round exists to answer both resolve trivially:
(i) *did this revision break anything previously approved?* — there was no revision, so no;
(ii) *does any load-bearing claim now contradict the repository at HEAD or an upstream
document?* — I re-verified the claims most exposed to code drift below, and they hold.

Under the freeze, that leaves exactly the disposition I recorded in v5: one inherited Low
DEC-DOC-01 citation-drift finding, non-gating, to be swept at the next erratum opportunity.

## Properties

No property row changed, so per the delta protocol I did not re-read the unchanged property
catalogue. What I did re-check is the subset of property text whose truth depends on *code*
rather than on the document — those claims can go stale without an edit, which is the only
way this round could have produced a new High finding.

**Seam cardinality (PROP-SEAM-02 and the row-count sites).** The document's HEAD-state
sentence says every transcription surface already reads six members *except*
`advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, and that the production array is
still frozen at five. Both halves still hold at HEAD:
`pdlc/workflows/orchestrate-dev.js:1951` reads
`export const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5"]);` — the production
half is unmoved, so the red-wave baseline PROPERTIES describes (six on the test side, five in
production, wave opens red) is still the baseline a Phase I author would meet. This matches
TSPEC §1.3's *State surfaces at HEAD* table, so document and upstream still say the same thing
in the same direction.

**Seam-phase placement (PROP-REC-07).** `ADVISORY_SEAM_PHASES` is still declared at
`pdlc/workflows/orchestrate-dev.js:3112` and the `ADVISORY_SEAM_PHASES[seam]` lookup on the
`escalated` path is still at `:3342`. The *behaviour* the property asserts is therefore intact;
only the raw line pins in the document (`:3108`, `:3338`) remain four lines short — the
inherited Low carried forward from v5, unchanged in kind and in magnitude.

**Named test files.** Both files the Overview records as `new` are on disk and non-empty:
`pdlc/workflows/__tests__/advisoryWaveGate.test.js` (1.8K) and
`pdlc/engine/__tests__/advisory-config-example.test.js` (2.5K). The v4 High finding that this
paragraph resolved stays resolved.

Requirement traces, PLAN task homes, categories, and test-level assignments are byte-identical
to the approved round; nothing to re-litigate.

## Oracles

_(pending)_

## Fixtures

_(pending)_

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

# Cross-Review: software-engineer — FSPEC (delta confirmation, round v13)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.11)
**Erratum commits:** 4e5d8081, 4e8e684b, c9f672c3, 1b4dc3de
**Date:** 2026-08-20
**Iteration:** 13
**Round type:** delta confirmation (previously approved at v12, `REVIEWED-COMMIT: 9a4b7593`)
**Upstream state:** REQ `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` v0.9, sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd

## Overview

**Question answered:** does the v0.11 erratum resolve the four routed items without breaking anything approved at v12?

**Answer: the items land, but the delta is half a correction.** All four routed items are discharged in their own sections. BR-1 now carries REQ C-1's second conjunct, BR-15's expected set drops the enumeration and is stated as an enumerable equality, and AT-02/AT-33 track both. What the delta does **not** do is propagate BR-1's new two-conjunct rule to the rule's *complement* — the byte-identity side. BR-11, AT-03 and AT-29 still say **"every non-authoring dispatch"**, which under the corrected BR-1 is strictly narrower than "every dispatch outside BR-1's rule". REQ AC-1.2 names the difference explicitly and requires it byte-identical. That is one High finding, tagged `delta`/`local`.

The delta itself, over commits 4e5d8081, 4e8e684b, c9f672c3 and 1b4dc3de (+25/−11 across four hunks):

- `:283-290` BR-1 restated as a two-conjunct iff: authoring classification **and** target in {REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES}, with the second conjunct named load-bearing and the code-review optimizer named as the dispatch it excludes.
- `:678-684` BR-15 expected set: `**exactly** one open attempt per report-named document other than the `RSN-SELF` ones`, plus an explicit statement that the candidate-path enumeration contributes **no** member because it opens no file under `docs/`.
- `:783`, `:938-940` AT-02 retargeted at "BR-1's two-conjunct rule"; AT-33's expected set transcribed to match the corrected BR-15.
- `:18`, `:53-59` version 0.10 → 0.11 and a v0.11 erratum note stating both corrections and their upstream grounding.

No BR, E-row, AC mapping or flow step outside those four loci changed, so the approved surface is otherwise intact by construction.

## Linked Requirements

_pending_

## Behavioral Flow

_pending_

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_

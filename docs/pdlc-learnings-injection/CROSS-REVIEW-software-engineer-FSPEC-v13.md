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

**Upstream re-read at HEAD (DEC-ERR-03 obligation).** The dispatch pins REQ at sha256:ff605dd…e84dd, byte-identical to the `UPSTREAM-STATE` anchor on my v12 approval — upstream has not moved under this document. I did not rest on the sha: because this delta's whole content is a transcription of REQ C-1 and AC-1.2, I re-read those two, plus NG-5 and AC-5.2, in full at HEAD and diffed the FSPEC's new sentences against them.

| FSPEC text (v0.11) | Upstream at HEAD | Verdict |
|---|---|---|
| BR-1 — "the pipeline classifies it as authoring, **and** its target document is one of REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES (REQ C-1)" | REQ C-1 — "every dispatch the pipeline tags `dispatchKind: \"authoring\"` at HEAD … whose target document is REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES" | Accurate, both conjuncts and the six-member list verbatim-aligned |
| BR-1 — "an authoring-classified dispatch whose target is none of those six document types (the code-review phase's optimizer round at HEAD) is outside the rule" | REQ AC-1.2 — "any dispatch the pipeline tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer at HEAD" | Accurate; the FSPEC even preserves AC-1.2's own parenthetical |
| BR-1 — "which is what REQ AC-1.2 and NG-5 decide" | REQ NG-5 — "Not applied to review, implementation, DoD or harvest dispatches. Scope is C-1's rule." | Accurate; NG-5 defers to C-1's rule, so the corrected conjunct is the thing NG-5 scopes to |
| BR-1 — "not a new list maintained by this feature: the rule consumes them, it does not restate a call-site membership" | REQ C-1 — "deliberately a rule over the taxonomy that already exists rather than a hand-counted set of six" | Accurate; the FSPEC keeps C-1's reason for the rule form, which is what makes the six-name list an illustration rather than a maintained set |
| BR-1 — set-equality oracle, no fixed count, run with no DECISIONS phase / no Phase R creator / five optimizer rounds | REQ AC-1.2 and AC-1.1's derivation note | Accurate |
| BR-15 — "the corpus paths touched are **exactly** the reads the record accounts for — a positive membership claim, not an absence-only one" | REQ AC-5.2 — "the corpus paths touched are exactly the reads of the documents AC-3.1 and AC-3.2 name — a positive membership claim, not an absence-only one" | Accurate, verbatim-aligned |
| BR-15 — expected set excludes `RSN-SELF` documents, "decided from the path before any read" | REQ AC-5.2 reads on the *reads of* the named documents; a self-excluded document is named by AC-3.2 but never read, so it contributes no read | Compatible; the exclusion narrows to what AC-5.2 actually measures rather than to the naming |
| BR-15 — "the corpus enumeration … opens no file under `docs/`, so this instrument does not see it" | REQ AC-5.2 measures *reads*, and REQ NG-4 forbids any index/cache/state file; nothing upstream asserts the enumeration is a file-open | Accurate; the previous text's enumeration member was an FSPEC-local artefact, not an upstream claim, so dropping it moves toward upstream, not away |
| Header `Upstream` row — REQ v0.9 | REQ:18 version cell reads `0.9` | Accurate |

**Where the compression now breaks.** REQ AC-1.2 is one sentence with two halves: the block-carrying set **equals** C-1's rule, *and* every dispatch **outside it** is byte-identical to the disabled run — where "outside it" is spelled out to include the authoring-tagged/non-C-1-target dispatch. The delta corrected the first half (BR-1, AT-02) and left the second half (BR-11, AT-03, AT-29) written against the pre-correction complement, "non-authoring". After this edit those two halves no longer partition the same universe, and the dispatch REQ AC-1.2 goes out of its way to name is the one that falls in the gap. See F-01.

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

# Cross-Review: test-engineer — FSPEC (delta confirmation, round v13)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.11)
**Date:** 2026-08-20
**Iteration:** 13

## Overview

Delta confirmation of the v0.11 erratum against the FSPEC I approved at v12 (reviewed commit
`9a4b7593`). The delta is `9a4b7593..1b4dc3de`, +25/-11, touching four loci: the header version
cell, an appended v0.11 revision note (FSPEC:53-59), BR-1's rule sentence (FSPEC:284-291),
BR-15's expected-set bullet (FSPEC:679-684), and the two acceptance tests that transcribe those
two rules (AT-02 FSPEC:784, AT-33 FSPEC:937-941). Nothing else moved a byte, so the ordering,
bounding, config, record and edge-case material I approved at v12 is untouched.

Upstream REQ at HEAD hashes to `ff605dd3…92e84dd`, matching the dispatch digest exactly, so no
upstream sentence has shifted under this FSPEC since my last round. I re-read REQ C-1
(REQ:151-161), AC-1.1/AC-1.2 (REQ:250-262), NG-5 (REQ:142-143) and AC-5.2 (REQ:397-403) against
the delta rather than trusting the erratum note.

**All four routed items land.** BR-1 now carries C-1's second conjunct, BR-15 drops the
enumeration and states an enumerable equality, and AT-02/AT-33 track both. What remains is three
non-gating findings: one inherited compression loss in the decision table (the erratum fixed BR-1
but left D-2 stating the one-conjunct version of the same rule), and two Low precision nits inside
the edited bullets. No High. Nothing I previously approved is broken by this delta.

## Linked Requirements

The delta's citations resolve to live upstream text at HEAD:

- **REQ C-1** (REQ:151-161) reads "every dispatch the pipeline tags `dispatchKind: "authoring"`
  at HEAD … **whose target document is REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES**". BR-1's
  new sentence is a faithful compression of both conjuncts, in C-1's own order, and keeps C-1's
  "rule over the taxonomy, not a hand-counted set of six" framing in the following sentence — the
  distinction C-1 spends a paragraph on and the reason a fixed count is not the oracle.
- **REQ AC-1.2** (REQ:256-262) names the outside set explicitly, including "any dispatch the
  pipeline tags authoring whose target is none of C-1's six document types — the code-review
  phase's optimizer at HEAD". BR-1's third sentence and the v0.11 note cite exactly that clause,
  in the same words, for the same case. The citation is not a nonexistent authority.
- **REQ NG-5** (REQ:142-143) scopes non-application to "C-1's rule", which is now the two-conjunct
  rule BR-1 states — the FSPEC's NG-5 reference at BR-1 and at FSPEC:765 stays accurate.
- **REQ AC-5.2** (REQ:397-403) claims "the corpus paths touched are exactly the reads of the
  documents AC-3.1 and AC-3.2 name — a positive membership claim, not an absence-only one". BR-15's
  revised expected set is that claim made enumerable; dropping the corpus enumeration does not drop
  an upstream member, because AC-5.2's set is defined over *documents named by the record*, and the
  `git ls-files`-shaped enumeration names no document read under `docs/`.

No citation in the delta points at text upstream no longer carries, and the FSPEC's traceability
rows (FSPEC:139-140, `AC-1.1 → BR-1 → AT-01`, `AC-1.2 → BR-1, BR-11 → AT-02, AT-03`) still resolve.

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

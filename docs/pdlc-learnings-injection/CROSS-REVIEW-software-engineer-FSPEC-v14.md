# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.12)
**Upstream measured against:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` v0.9 (sha256 `ff605dd3…d92e84dd`, confirmed at HEAD)
**Date:** 2026-08-20
**Iteration:** 14 (delta confirmation)

## Overview

Scope of this round: the v0.12 erratum (commits `3f21bd3b` … `c1d7218e`) against
FSPEC v0.11, plus a re-check of every claim this document makes about REQ v0.9 at HEAD
(DEC-ERR-03). The REQ hash in the dispatch matches HEAD, so no upstream text moved under
this document since the v13 fidelity pass; the fidelity re-check below is therefore narrow,
covering only the sentences the erratum newly wrote or newly cited.

**All three routed items landed.**

| Routed item | Landed at | Verdict |
|---|---|---|
| Header `Cross-Reviews` row re-stales every round (Low, delta, local) | `:13` | Resolved — the row now reads `…-FSPEC-v{N}.md — every round present on this branch, not hand-enumerated`, so it cannot go stale again |
| Overview `:70`, D-2 `:265`, A-2 `:995` restate only the authoring conjunct (Low, delta, nonlocal) | `:79`, `:274`, `:1009` | Resolved in substance — all three now defer to BR-1's rule whole; one wording residue at A-2 is filed as F-01 below |
| D-2 asks the one-conjunct question, so the discriminating branch is unnamed and untested (Medium, inherited, nonlocal) | `:274`, `:798-802`, `:971` | Resolved — D-2 now enumerates three branches, AT-02 gains the authoring-classified/non-C-1-target fixture, AT-03 quantifies over that dispatch, and the DC-05 coverage paragraph names all three branches |

Nothing I approved in v11/v13 was broken by the edit. Two Low wording findings and one Low
citation finding are raised below; none is gating.

**Positive observations.**

- The complement is now carried through *consistently* — BR-11 (`:604`), AT-03 (`:800`) and
  AT-29 (`:924`) all quantify over "dispatches outside BR-1's rule" rather than over
  "non-authoring" ones. That is the widest of the three readings and the one REQ AC-1.2
  actually decides; the FSPEC is now stricter than REQ AC-4.3's and AC-6.1's own
  "non-authoring" shorthand, which is the right direction of divergence.
- AT-02's new fixture is stated with its own falsification condition — "so reverting BR-1's
  second conjunct reds this test". That is exactly the property a conjunct-coverage fixture
  needs, and it is asserted, not implied.
- The header row fix removes a per-round maintenance cost rather than paying it once more.

## Linked Requirements

Re-verified against REQ v0.9 at HEAD; only rows the erratum touched are listed.

| FSPEC text (v0.12) | Upstream at HEAD | Verdict |
|---|---|---|
| D-2 `:274` — "authoring-classified **and** a target document among the six C-1 types" | REQ C-1:151-154 — `dispatchKind: "authoring"` **whose target document is** REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES | Accurate; both conjuncts, six-member list intact |
| D-2 third branch — "authoring-classified, target none of the six → no block" | REQ AC-1.2:259 — "any dispatch the pipeline tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer at HEAD" | Accurate; the FSPEC branch is AC-1.2's outside-set clause verbatim in substance |
| BR-11 `:604` / AT-29 `:924` — "every dispatch prompt **outside BR-1's rule** … byte-identical" | REQ AC-1.2:256-261 (wide outside-set); REQ AC-4.3:367 and AC-6.1:412 use the narrower "non-authoring" shorthand | Faithful to AC-1.2, which is the deciding criterion; the shorthand elsewhere in REQ is a REQ-side inconsistency the FSPEC correctly does not inherit (see Q-01) |
| Overview `:79` — "to exactly the dispatches BR-1's rule names, and to no others" | REQ C-1:151, AC-1.1:250-255 | Accurate |
| A-2 `:1009` — "the authoring classification and the dispatch's target document type … consumed rather than restated" | REQ C-1:156-157 — "a rule over the taxonomy that already exists rather than a hand-counted set of six" | Accurate as to the two inputs; the exclusion clause that follows is imprecise (F-01) |
| BR-15 `:690-692` — "compared as **sets of paths**, not as counts … (REQ AC-5.2)" | REQ AC-5.2:397-401 — "the corpus paths touched are exactly the reads of the documents AC-3.1 and AC-3.2 name" | Compatible, not stated; AC-5.2 is silent on repeat opens, so the duplicate-open tolerance is an FSPEC-local instrument decision carrying an upstream citation (F-03) |
| Header `Upstream` row `:12` — REQ v0.9 | REQ:18 version cell reads `0.9` | Accurate; the dispatch sha matches HEAD |


## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict

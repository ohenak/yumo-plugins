# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10, 2026-08-13)
**Date:** 2026-08-13
**Iteration:** 5 (erratum delta-confirmation round)
**Scope:** Confirmation of the Phase F erratum items against `CROSS-REVIEW-software-engineer-REQ-v4.md`.
Diff base `2a1f910d` (the commit v4 reviewed) → HEAD `c38feb61`, three edited sites in the REQ.
Engineering lens only: feasibility, implementability, existing-code and upstream-citation
verification, integration risk.

## Erratum items — disposition

All four raised items landed, and the three distinct edits are the *only* changes to the REQ on
this diff (`git diff 2a1f910d..HEAD` touches the version row + changelog paragraph, NG-6, AC-3.5
and O-2, nothing else). Items 1–3 are three statements of one defect and are confirmed together.

| Item (raiser) | Status | Evidence at HEAD |
|---|---|---|
| NG-6/O-2 reconciled on **scope**, not on the read/write verb (se-review) | **Confirmed** | NG-6 (`:169-174`) now opens "The scope of this non-goal is **install and upgrade**, not every engine activity", forbids install/upgrade to "create, sync, write, read nor version-check any file inside a consumer project", and states the run is *outside* the non-goal and does read `engine.*` for its pin. The verb-based carve-out is gone; the residual "it still never writes it" is now a property of the run, not a reading of NG-6. |
| NG-6's own text no longer contradicted by O-2's gloss; FSPEC states it the same way (pm-author) | **Confirmed, and checked against the downstream text it cites** | The changelog's citation is accurate, not decorative: FSPEC F-3 step 5 (`FSPEC:139-142`) reads "**Install and upgrade neither read nor write consumer config**; the *run* reads the `engine.*` namespace (F-4 step 2)… The reconciliation with NG-6 is by **scope**, not by verb"; BR-2.2 (`:321-324`) scopes install/upgrade to "touch consumer config not at all" and routes the read to BR-4.7; BR-4.7 (`:374-375`) grants the run the `engine.*` namespace read and denies the write. One rule, three sites, same shape as NG-6's — downstream now inherits one rule, which was the item's whole point. |
| O-2's `:515` gloss "reading is not writing (NG-6 forbids only the latter)" misstates NG-6 (se-review) | **Confirmed removed** | O-2 (`:527-529`) now reads "This does not cross NG-6: that non-goal scopes install and upgrade, which touch no consumer file at all, while a run may read the operator-authored pin." No sentence in the REQ now characterises NG-6 by verb. |
| AC-3.5 absence-only oracle needs a positive conjunct (te-review) | **Confirmed** | AC-3.5 (`:340-346`) names the vacuity ("Absence alone holds vacuously if the credential is never consumed") and pairs two positives: (a) secret present ⇒ publish authenticates, release cut; (b) absent or empty ⇒ workflow fails at the publish step naming the missing secret, publishing nothing. Both are decidable on the same workflow run the absence claim is read from. |

Upstream re-grounding (DEC-ERR-03): `docs/_constraints/`, `docs/_decisions/` and `docs/_queue/`
are **byte-unchanged** between `2a1f910d` and HEAD (`git diff --stat` over all three is empty), so
every M-ENG citation this REQ leans on still says at HEAD exactly what it said when I approved
v0.9. Spot-checked the two the erratum sites touch or re-read: DEC-HE-02
(`DECISIONS-headless-engine-obligations.md:37-59`) still decides that `.claude/pdlc.config.json`
is "the **only** config file the engine reads" with engine knobs "overridable under a reserved
`engine.*` key" — which is what O-2 and NG-6 now claim of it, in the direction they claim it;
M-ENG-11 still records `pdlcPluginCompat` `^0.22.0` against plugin `0.22.7`, so C-1/AC-3.7 remain
satisfiable at HEAD rather than pre-failed.

## Prior findings still open

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

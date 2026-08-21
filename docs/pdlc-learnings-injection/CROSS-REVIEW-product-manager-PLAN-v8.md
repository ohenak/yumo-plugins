# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.5)
**Date:** 2026-08-20
**Iteration:** 8

## Overview

PLAN moved: v0.4 -> **v0.5**, six commits (`96cf89a5` ... `7bcbce64`) since the bytes my v7
confirmation measured. This is a delta re-review scoped to those commits and to whether my five v7
findings closed.

| v7 finding | Sev | Status at v0.5 |
|---|---|---|
| F-01 — `LI-AT-30` commissions two cases; FSPEC v0.13's AT-30 has three, and no row owns the zero-bound production half | High | **Partly closed.** The three cases and a strong oracle landed (`96cf89a5`); the production half is still unowned — carried forward as this round's F-01, at **Medium** |
| F-02 — §Traceability's `RSN-NO-MATERIAL` branch states one cause and one AT | Medium | **Closed.** The arm-table row now carries both disjuncts, both ATs and both owner pairs (`3d6b0972`) |
| F-03 — errata section routes ERR-3/ERR-7 as live | Medium | **Closed.** Both recorded CLOSED with the FSPEC version that resolved each (`f6570869`) |
| F-04 — claim 4 scopes byte-identity to "non-authoring" dispatches | Medium | **Closed.** Restated as dispatches **outside BR-1's rule**, naming Phase CR's authoring-classified non-C-1 round as inside the promise (`af975290`) |
| F-05 — four stale version pins | Low | **Closed in substance.** The upstream matter row, §Overview and LI-01's edge rationale now read FSPEC v0.13 / TSPEC v0.9; the changelog's 0.1 row correctly keeps its historical pins |

The revision is accurate where it matters most. The zero-threshold case that blocked v7 is now
commissioned with an oracle **stronger** than the one I asked for: three positive conjuncts rather
than a widened enumeration, including the no-slot conjunct that kills the mutation. Checked against
upstream at HEAD, LI-12's new text is a faithful compression of TSPEC §I.2 (three zeros; the third
alone asserting reject rows; set equality over rejects, "not merely an empty `selected`") and of
FSPEC AT-30 (three cases, and in the `maxBytesPerDocument: 0` case every corpus document carrying
`RSN-NO-MATERIAL`, E-36).

Three Mediums remain, all bounded to sections this round touched, and none of them is a behaviour
this PLAN now fails to commission a test for — which is why none is High. The v7 High was "a
behaviour FSPEC guarantees and this PLAN commissions no test for"; that is closed. What is left is
*which task writes the production code*, and two precision holes inside the new text.

**Method.** Ran the delta (`git diff f08bfbf8..HEAD` on the PLAN), re-read v7, then verified every
new claim against upstream at HEAD and against code already landed on this branch: FSPEC AT-30 and
the E-36 edge row, TSPEC §I.2, §D.3, §D.5, §T.7 and ERR-8, and the landed
`pdlc/workflows/__tests__/learningsBlock.test.js` and
`pdlc/workflows/__tests__/helpers/learningsFixtures.js`.

## Batches

## Dependencies

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

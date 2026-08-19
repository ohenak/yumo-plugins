# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 5
**Scope:** delta re-review of `f005e6ed..HEAD` under decision freeze; testing lens only. The FSPEC delta is three lines; the material event of this round is that the **upstream REQ moved underneath it** (v0.4 → v0.6, erratum rounds `1bac1663..bc603aa0`). Sections unchanged since v4 are not re-litigated except where a REQ change falsifies a claim they make.

## Disposition of v4 findings

| ID | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Open, carried** | AT-15's first clause still reads "*Given* a fixture whose only LEARNINGS documents lie under `docs/discarded/`" (FSPEC:800-802) and E-07 still reads "Corpus contains only documents under `docs/discarded/`" (FSPEC:663), while E-35's direct-path case sits on the same AT (FSPEC:664). The fixture-defining sentence still describes E-35's fixture verbatim. Not touched by the delta; re-filed below as F-02, non-gating. |
| F-02 | Low | **Open, carried** | AT-20's disjointness conjunct still reads "neither catalogue's ids appear in the other's position" (FSPEC:822-823) — two catalogues, while BR-9 binds three. Re-filed below as F-03, non-gating. |

Nothing approved in v4 was broken by the FSPEC delta itself. The delta is correct as far as it goes: `AC-5.1c` is now carried in the FSPEC-LRN-15 traceability row (FSPEC:90), given its own coverage row `AC-5.1c | BR-14 | AT-32` (FSPEC:118), and added to BR-14's heading (FSPEC:585). That matches the REQ's new split of AC-5.1b (malformed section) from AC-5.1c (wrong-typed declared key) at REQ:368-376, and AT-32 does carry both conjuncts, so the new row is not a promissory mapping.

The problem is what the delta stopped short of. The same REQ erratum cycle that created AC-5.1c also landed **every other divergence the FSPEC declares an erratum against**, and none of those declarations was retracted.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.6)
**Date:** 2026-08-21
**Iteration:** 5
**Round type:** delta confirmation (erratum round, Phase F)
**Scope:** Local — the erratum delta `1b24056a..HEAD`, plus re-verification of the upstream this REQ leans on at HEAD (DEC-ERR-03). Testing lens only.

## Context

I approved this REQ at v1.5 (round v4, one Low finding, no High). A Phase F erratum round has since
landed eight routed items across four commits (`aea4d92e`, `e029fc59`, `2c2efb74`, `d1dfbd20`, plus
two wording trims `c447eeb5`, `7660f1ed`), bumping the document to v1.6. The delta is 26 insertions
and 13 deletions across five sites: the v1.6 amendment note, §1's replay-cost paragraph,
REQ-WVR-02's IG-label note, REQ-WVR-08's no-commit clause, and §10's BL-04 readiness sentence.

This round answers one question: does the delta resolve the routed items without breaking what I
previously approved? Per DEC-ERR-03 I also re-read the upstream this REQ now leans on — the shipped
mechanism at `origin/main`, `docs/_constraints/pdlc-wave-gate-baseline.md`, the consolidation-agent
PLAN that OF-1 measures, and the downstream FSPEC the delta newly cites — and checked that the
document is still a faithful compression of it. Two of the eight routed items are duplicates raised
by two reviewers (the V-wave scoping, raised by both te-review and pm-author; the BL-04 mis-record,
likewise), so the delta has six distinct obligations to discharge.

## Goals

What this round set out to establish, in order:

1. **Each routed item landed in the bytes** — not paraphrased, not deferred to FSPEC, not answered
   with a promise.
2. **Each landed claim is true against HEAD**, re-derived by command rather than read and believed.
   The erratum items are themselves measurement claims (a wave count, a task count, a commit
   distance, the presence of a file, the guard on a dispatch site), so confirming them is a
   mechanical exercise and I treated it as one.
3. **Nothing I approved at v1.5 broke.** The delta touches §1, REQ-WVR-02, REQ-WVR-08 and §10 —
   sections that other sections cite. A correction that fixes one site and leaves a sibling site
   asserting the old thing is a worse state than before, because the document now contradicts
   itself where it previously merely erred.
4. **The document is still a faithful compression of its upstream** (DEC-ERR-03). The delta newly
   cites FSPEC §2, EC-20 and FSPEC §3.2, so those had to be read at their current version, not
   assumed from the erratum brief's summary of them.

## Scope (Non-Goals)

Out of scope for this round, deliberately:

- **Re-reviewing the whole REQ.** Sections untouched by this delta and approved at v1.5 are not
  re-litigated. The one exception DEC-ERR-03 mandates is upstream drift: a claim I approved that
  upstream no longer supports is in scope wherever it sits, and I checked the load-bearing ones
  (§1's untracked-record observation, OF-1's re-derivation recipe, §5's baseline-file citation).
- **The FSPEC.** It is reviewed on its own docType track (v1, v2 exist). I read FSPEC §2, §3.2,
  BR-03, BR-11 and EC-20 here only as the upstream/downstream counterpart the REQ's new sentences
  point at, and only to ask whether the REQ's characterisation of them is accurate.
- **Product framing, architecture choice, and whether the feature should be built.** Testing lens
  only, per role scope.
- **Test design.** At REQ altitude a testability finding asks for outcomes precise enough for a
  black-box acceptance test, never for seams, fixtures, oracle placement or test levels. Those
  belong to TSPEC and PROPERTIES review and are not missing here.

## Constraints

## Acceptance — routed items, one by one

## Risks

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

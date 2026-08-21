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

The verification constraints that shaped this round, and how each was satisfied:

- **The authoring tree is not HEAD.** This branch is 1,637 commits behind the default branch
  (`git rev-list --count origin/main ^HEAD` → `1637`, re-run this round), and the resume mechanism
  does not exist in it: `git show HEAD:pdlc/workflows/orchestrate-dev.js | grep -c WAVE_STATE_PATH`
  → `0`, against `10` in the same file at `origin/main`. Every code claim in this REQ therefore had
  to be checked against `origin/main`, which is exactly what the REQ's own header note instructs.
  I extracted `git show origin/main:pdlc/workflows/orchestrate-dev.js` to a scratch path and read
  the mechanism there.
- **Measurement claims are re-derived, not trusted.** OF-1 ships a re-derivation recipe; a recipe
  that is not run is decoration. I ran it (below). This is the same discipline the REQ asks of its
  own readers, and the reason the recipe belongs in the document.
- **DEC-DOC-01.** A raw `file:line` anchor in a spec document is a Low `Process` finding unless the
  position itself is the measured claim. `grep -n "\.js:[0-9]\|\.md:[0-9]"` over the whole REQ
  returns nothing — the delta introduced no new anchors, and the v3 fix has not regressed. The
  erratum brief cites `orchestrate-dev.js:15656` and `:15672`; the REQ correctly did **not** copy
  those anchors into itself, naming symbols and FSPEC ids instead.
- **REQ size budget.** 553 lines / 40,967 bytes, inside the 700-line / 60 KB budget the
  `check-req-size` hook enforces. The delta grew the file by roughly 1 KB.

## Acceptance — routed items, one by one

## Risks

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

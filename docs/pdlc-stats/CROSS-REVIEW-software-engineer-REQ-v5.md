# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 5 (erratum round 3 — delta confirmation)

**Delta base:** `50dffe8c8` (REQ v1.3, the commit my v4 confirmation reviewed) → `e33637af2`
(REQ v1.4, "erratum round 3, scope REQ-STATS-06 harvested predicate to C-4 grammars"). I read
`git diff 50dffe8c8 e33637af2 -- docs/pdlc-stats/REQ-pdlc-stats.md` (9 insertions, 3 deletions),
which touches only the metadata/changelog block and REQ-STATS-06's harvested predicate. Per
DEC-ERR-03 I also re-read the upstream text this section leans on at HEAD, and that re-read — not
the routed item — produced this round's one gating finding.

## 1. Routed item disposition

**Item:** REQ-STATS-06 carried the same bare-glob phrasing FSPEC BR-16 was corrected for — the
harvested-condition ambiguity needed settling at REQ level too. **Disposition: landed, correctly.**

The predicate now reads "no file matching C-4's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar
remains, or no file matching its `CODE_REVIEW-{feature}-v{N}.md` grammar does, or neither" in place
of the bare `CROSS-REVIEW-*` / `CODE_REVIEW-*` globs. Three things I checked rather than assumed:

- **The grammars cited are the real ones.** C-4 is a faithful quotation of the documented basenames:
  `pdlc/OPERATIONS.md:292` (`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`), `pdlc/OPERATIONS.md:295`
  (`CODE_REVIEW-{feature-name}-v{N}.md`) and `CLAUDE.md:93`, which carries both. The REQ writes
  `{feature}` where OPERATIONS writes `{feature-name}`; that is a token-name difference in the same
  grammar, not a divergence, and the REQ uses `{feature}` consistently throughout.
- **The edit is a citation, not a new parsing rule.** C-5 forbids this REQ from restating a parsing
  rule of its own. Naming the grammar C-4 already fixed, and deferring the match to it, stays inside
  that constraint — this is the shape of remediation I asked for in SE REQ v3 F-03, not a second
  rule to keep in sync.
- **The predicate now matches REQ-STATS-04's.** REQ-STATS-04 already reads "no
  `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains"; REQ-STATS-06 now reads
  the same way for both families. The document's two harvested predicates can no longer disagree
  about what counts as a survivor, which was the actual defect.

The stated failure mode is real: under a bare `CROSS-REVIEW-*` glob, any stray basename beginning
with that prefix — an editor backup, a scratch note, a `CROSS-REVIEW-notes.md` — reads as a survivor
and silently suppresses the harvested state, printing a computed ratio whose numerator harvest has
already gutted. That is the undercount NG-6 exists to prevent, so closing it at REQ level was worth
a round.

One imprecision in how the change is *described* is carried below as F-02.

## 2. Upstream fidelity re-read (DEC-ERR-03)

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

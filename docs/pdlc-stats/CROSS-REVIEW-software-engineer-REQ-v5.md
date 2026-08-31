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

The routed item landing is necessary but not sufficient. REQ-STATS-06's harvested predicate is not a
free choice — it is a compression of a shipped-behaviour fact about `harvest-learnings`, stated in
the very sentence the erratum edit ends on:

> harvest deletes cross-reviews and DoD reviews while post-mortems survive, so the numerator is only
> *partially* deleted and a computed value would silently undercount rather than be absent.

That premise is doing more work than any other sentence in §5. It is why REQ-STATS-06 needs a
harvested state at all (a *partially* deleted numerator), why the predicate is per-family rather
than "any C-4 file missing", and — by omission — why REQ-STATS-05 has **no** harvested state: line
185 ends "no post-mortem file is zero halts, never an error." So I re-read the upstream at HEAD.
The two upstream documents disagree:

- **`pdlc/skills/harvest-learnings/SKILL.md` supports the REQ.** Step 3 of its Git Workflow (`:28`)
  scopes deletion to "the `CROSS-REVIEW-*` and `CODE_REVIEW-*` files"; the Quality Checklist repeats
  it twice (`:128` LEARNINGS committed "before any `CROSS-REVIEW-*` / `CODE_REVIEW-*` deletion";
  `:129` "All harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` files deleted"). `POSTMORTEM-*` appears
  in the *inventory* step (`:34`) and the *read* checklist item (`:122`), never in a deletion clause.
- **`pdlc/OPERATIONS.md:296` contradicts it.** The `LEARNINGS` contract there defines the required
  `Harvested from` row as "the record of which `CROSS-REVIEW-*` / `CODE_REVIEW-*` / `POSTMORTEM-*`
  files harvest deleted" — post-mortems named inside the deleted set, not beside it.
- **The guard hook is silent either way.** `guard-harvest-before-delete.sh` matches no `POSTMORTEM`
  token at all, so it neither permits nor blocks such a deletion; it is not the tie-breaker.

I cannot resolve this from the artifacts, and it is not mine to resolve — but the REQ currently
compresses one side of a live contradiction into an unhedged shipped-behaviour claim, and two ACs
lean on it in opposite directions. That is F-01, tagged `inherited` because the sentence predates
this round's edit: the erratum touched the predicate above it and left this clause byte-identical.
It is `local` because it sits inside the section the edit changed — I would not have re-read it this
round if the edit had landed elsewhere.

**Everything else in the delta's blast radius is faithful.** C-3/C-4's document-type enumerations
still match `CLAUDE.md:93`'s artifact convention; C-5's deferral targets (round derivation, the
`CODE_REVIEW-*-v{N}` version grammar, the POSTMORTEM `RESOLVED:` lifecycle) still exist at
`pdlc/OPERATIONS.md:9`, `:295` and the post-mortem lifecycle section; NG-6's example
("cross-reviews removed by `harvest-learnings`") remains accurate whatever the post-mortem answer
turns out to be. The v4 approval's other anchors are unmoved.

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

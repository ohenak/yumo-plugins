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

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | inherited | local | REQ-STATS-06's rationale asserts as shipped fact that "harvest deletes cross-reviews and DoD reviews while post-mortems survive". Upstream at HEAD contradicts itself: `harvest-learnings/SKILL.md:28,128,129` scopes deletion to `CROSS-REVIEW-*` / `CODE_REVIEW-*` only, but `pdlc/OPERATIONS.md:296` names `POSTMORTEM-*` inside the set the `Harvested from` row records as deleted. The claim is load-bearing twice over — it justifies REQ-STATS-06's per-family predicate, and its converse justifies REQ-STATS-05 having no harvested state at all ("no post-mortem file is zero halts, never an error"). If OPERATIONS is the correct side, REQ-STATS-05 reports `0 halts` for a harvested feature that in fact halted — the exact silent undercount NG-6 and REQ-STATS-03/04/06 all exist to prevent. Fix: settle which upstream is authoritative (an operator/DECISIONS call, not a REQ edit), then either cite the settled source here, or hedge the clause and give REQ-STATS-05 the harvested state its siblings carry. | REQ-STATS-06, §5 (the "harvest deletes … while post-mortems survive" clause); knock-on REQ-STATS-05 |
| F-02 | Low | delta | local | The v1.4 changelog note justifies the edit as stopping "a foreign-feature file" from suppressing the harvested state. That reasoning holds for `CODE_REVIEW-{feature}-v{N}.md`, which carries a feature token, but not for `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, which carries none — cross-review basenames are scoped by their feature *directory*, never by the grammar. The AC text is correct; only the note's stated rationale overclaims. Fix: describe the win as "a non-conforming basename can no longer read as a survivor", which is what the grammar actually buys. | Metadata block, "Erratum round 3 (v1.4)" note (lines 20–23) |

FINDING: High | inherited | local | REQ-STATS-06, §5 — "post-mortems survive" harvest clause | Load-bearing shipped-behaviour claim contradicted at HEAD: harvest-learnings/SKILL.md:28,128,129 deletes only CROSS-REVIEW-*/CODE_REVIEW-*, but pdlc/OPERATIONS.md:296 names POSTMORTEM-* among the files harvest deleted. REQ-STATS-05's lack of a harvested state depends on the survive side being true.
FINDING: Low | delta | local | Metadata block, v1.4 erratum note (lines 20-23) | The note's "foreign-feature file" rationale does not hold for the cross-review family, whose grammar carries no feature token; the scoping win is over non-conforming basenames, not foreign features.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Which upstream is authoritative on post-mortem deletion at harvest — `harvest-learnings/SKILL.md` (survive) or `pdlc/OPERATIONS.md:296` (deleted)? The answer decides whether REQ-STATS-05 needs a harvested state, so it wants a `docs/_decisions/` entry rather than a REQ-local assertion. |
| Q-02 | If post-mortems do survive, is REQ-STATS-05's "no post-mortem file is zero halts" still right for a *harvested* feature — i.e. is a surviving post-mortem set genuinely complete evidence, or does harvest ever consolidate them into LEARNINGS §1 Non-Convergences and drop the originals? |

## Positive Observations

- The remediation took the *cite-the-existing-constraint* form rather than inlining a fresh match
  rule into the AC. That is exactly what C-5 demands and what SE REQ v3 F-03 asked for; a second
  copy of the basename grammar in an AC body would have been the easier edit and the wrong one.
- The edit is genuinely minimal — 9 insertions, 3 deletions, confined to one predicate and its
  changelog note. Nothing previously approved moved. I diffed the whole file, not just §5, to say so.
- REQ-STATS-06 and REQ-STATS-04 now express the harvested predicate the same way. Two ACs that
  disagreed about what counts as a survivor would have surfaced as a contradiction in TSPEC at the
  worst possible moment; it is settled at the layer that owns it.
- The changelog note names the round, the scope and "No other change" explicitly, which made this
  confirmation cheap to bound.

## Recommendation

**Needs revision**

The routed item landed and landed well — F-02 is a Low nit in a changelog sentence, not in an AC.
What blocks approval is F-01, which the DEC-ERR-03 upstream re-read surfaced rather than the item
list: REQ-STATS-06's harvested predicate rests on a "post-mortems survive harvest" premise that the
two upstream documents contradict each other about at HEAD, and REQ-STATS-05's *absence* of a
harvested state rests on the same premise from the other side. Because the finding is inherited —
pre-round bytes the erratum edit did not touch — it routes back through the REQ's ordinary revision
loop rather than halting the phase, which is the right disposition: the resolution is an upstream
decision about `harvest-learnings` behaviour, not a wording fix this erratum round could have made.

Concretely, to reach Approved: settle Q-01 (a `docs/_decisions/` entry, since the answer binds more
than this feature), then in REQ-STATS-06 cite the settled source in place of the bare assertion, and
give REQ-STATS-05 a harvested state if the answer is "deleted". If the answer is "survive", the
clause is already correct and only wants its citation.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}

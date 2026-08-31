# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.4, erratum round 3)
**Date:** 2026-08-31
**Iteration:** 5
**Round type:** Delta confirmation (previously approved at v4 / REVIEWED-COMMIT 50dffe8c8)
**Delta under review:** commit `e33637af2` — 9 insertions, 3 deletions

## Routed Items

| # | Routed item (raised by) | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | REQ-STATS-06 carries the same `CROSS-REVIEW-*` phrasing as FSPEC BR-16; the harvested-condition ambiguity needs settling at REQ level too (se-author) | **Yes** | REQ-STATS-06's harvested predicate no longer uses bare globs. It now reads: "no file matching C-4's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar remains, or no file matching its `CODE_REVIEW-{feature}-v{N}.md` grammar does, or neither". Both grammars are quoted **verbatim** from C-4 (REQ lines 105-108), so the citation is faithful, not paraphrased. The predicate now matches the scoping form REQ-STATS-04 already carries ("no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains"), so the two harvested rules read in one voice. |

### Fixture check — does the delta preserve the expectations v4 approved?

Both surviving fixtures on disk yield the same single expectation before and after the edit, so no
approved test expectation moved:

- `docs/completed/pdlc-headless-engine/` — `LEARNINGS-pdlc-headless-engine.md` present, one
  surviving cross-review (`CROSS-REVIEW-software-engineer-TSPEC-v13.md`, which *does* match C-4's
  grammar), zero `CODE_REVIEW-*`. New wording: the DoD family is entirely absent → **harvested**.
  Same verdict the v1.3 wording produced and v4 approved.
- `docs/completed/pdlc-advisory-wave-gate/` — LEARNINGS present, `CODE_REVIEW-…-v1.md` and `-v2.md`
  both present, cross-reviews present. Neither family is absent → **measured**. Unchanged.

The edit narrows the predicate strictly (a grammar is a subset of the glob it replaces), so the only
inputs whose classification could move are files that claim a family prefix but fail its grammar —
and for those, moving them out of the "survivor" set is exactly the routed correction.

## Upstream Fidelity Re-check

Scope is the REQ measured against the upstream it leans on at HEAD, not the routed-item list. The
delta introduces one new upstream citation (C-4's grammars), so I re-read C-4, C-5 and the driver
those constraints defer to.

**C-4 (REQ lines 105-108) — cited faithfully.** C-4 fixes the process side as
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, `POSTMORTEM-{phase}-{feature}.md`,
`CODE_REVIEW-{feature}-v{N}.md`. REQ-STATS-06 quotes the first and third character-for-character and
correctly names only those two as the "harvest-deleted process families", leaving post-mortems out —
which is what its own next clause ("post-mortems survive") requires. No divergence.

**C-5 (REQ lines 110-120) — the delta does not disturb it.** C-5 binds *classification* fidelity to
the driver. REQ-STATS-06's predicate is a *set-membership* question over C-4's byte-total set, and
coupling the harvested predicate to the very set that feeds the numerator is the internally correct
choice: if bytes from a family still enter the ratio, the ratio is measurable. The predicate is
therefore not a new parsing rule of the kind C-5 forbids.

**One consequence a test author must be told about (F-02, Low).** C-4's `{doc-type}` is an open
placeholder; the driver's is a **closed catalogue** — `parseReviewFilename` matches the regex at
`pdlc/workflows/orchestrate-dev.js:10095` and then rejects out-of-catalogue doc types against
`REVIEW_DOC_TYPES` (`:10105-10112`, `:10144`) with reason `bad_doc_type`. So a real file such as
`docs/completed/pdlc-advisory-wave-gate/CROSS-REVIEW-product-manager-REVIEW-v1.md` is **malformed**
under REQ-STATS-03 (which defers to C-5) yet a **survivor** under REQ-STATS-06's new C-4 predicate.
Each AC is individually derivable and neither is wrong; the hazard is a shared harvested-fixture test
that assumes the two ACs agree. This is not introduced by the delta — the prior bare `CROSS-REVIEW-*`
glob was strictly more permissive and produced the same split — so it is tagged `inherited`.

**Erratum note overclaims on one of the two families (F-03, Low).** The v1.4 status note (REQ lines
19-22) justifies the edit as "so a foreign-feature file cannot suppress the harvested state". That
holds for `CODE_REVIEW-{feature}-v{N}.md`, which carries a `{feature}` segment. It does not hold for
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, which has **no feature segment at all** — a cross-review
copied in from another feature is byte-indistinguishable from a native one and still counts as a
survivor. The AC text itself is correct; only the note's stated rationale over-promises. A test
author writing the "foreign file does not suppress harvested" case from the note would author a
cross-review fixture that cannot be made to pass. Fix: narrow the note to the grammar-conformance
claim, or attribute the feature-scoping claim to the DoD family only.

**Inherited, still open (F-01, Medium).** G-3 (REQ line 47) was flagged in v4 and this erratum did
not touch it — the round was scoped to REQ-STATS-06. It still reads that feature artifacts "missing
or failing to parse" are "reported missing/malformed", which the corrected REQ-STATS-07 contradicts:
a readable-but-empty directory is a normal zero row, only an unreadable directory is a by-name gap,
and *malformed* is a within-metric state (REQ-STATS-03), not a feature-level label. Non-gating —
REQ-STATS-07 governs test authoring — but the goal should not summarise it wrongly.

## Positive Observations

- **The routed ambiguity is closed at the same altitude it was raised.** se-author's point was that
  REQ-STATS-06 mirrored FSPEC BR-16's loose phrasing; the fix quotes C-4 rather than restating a
  grammar inline, so REQ and FSPEC now converge on one authority instead of two spellings.
- **The two harvested predicates finally rhyme.** REQ-STATS-04 and REQ-STATS-06 now both test
  "no file matching the grammar remains", so a test author writing harvested fixtures uses one
  mental model across both metrics instead of a glob for one and a grammar for the other.
- **The edit is a strict narrowing and shows it.** Both on-disk archive fixtures classify
  identically before and after, which is the cheapest possible evidence that no previously approved
  expectation moved — I could re-derive it from the tree without running anything.
- **Bounded, as an erratum should be.** 9 insertions / 3 deletions, one AC sentence plus a status
  note; no AC gained scope and no FSPEC material was pulled upward.

## Recommendation

**Approved with minor changes**

The delta resolves the single routed item without breaking anything previously approved. The
predicate cites C-4 verbatim, correctly excludes the surviving post-mortem family, preserves both
on-disk fixtures' expectations, and defers rendering to FSPEC as before. No open High finding exists,
old or new, so this confirmation approves.

Three non-gating findings follow. F-01 is inherited and unchanged from v4 (G-3's summary still
contradicts the corrected REQ-STATS-07). F-02 records a real cross-AC split between C-4's open
doc-type placeholder and the driver's closed catalogue that a shared harvested fixture could trip
over. F-03 is the only finding attributable to this round's bytes, and it is confined to the status
note's rationale, not the acceptance criterion: the cross-review grammar carries no feature segment,
so it cannot deliver the foreign-feature scoping the note claims for it. All three are single-clause
edits.

## Delta-Confirmation Findings

## Verdict

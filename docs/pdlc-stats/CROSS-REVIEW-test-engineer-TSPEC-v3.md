# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1, bytes unchanged since approval)
**Upstream at HEAD:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4, sha256:60a516fb…f1c9),
`docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.4, sha256:0b8864d6…17b0)
**Date:** 2026-08-31
**Iteration:** 3 (cascade confirmation, not a re-review)

## Summary

The question this round answers is narrow: the TSPEC's own bytes have not moved, but the FSPEC it
compresses was edited after approval (REQ v1.3/v1.4 → FSPEC v1.4, commits `ef7a2a64a`…`6e7985d14`),
so the version I approved no longer exists. I re-read the upstream delta and every TSPEC passage
that leans on it.

**Behaviourally the TSPEC still holds — textually it no longer does.** The erratum round landed, in
the upstream documents, exactly the readings §4.3 had already chosen and routed as errata:

| Upstream change at HEAD | What TSPEC §4.3 already decided | Agreement |
|---|---|---|
| REQ-STATS-06 + FSPEC BR-16 now state the harvested test over BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` / `CODE_REVIEW-{feature}-v{N}.md` grammars, evaluated over "exactly the file set BR-14's numerator sums" | `crossReviews = basenames.filter(b => parsers.parseReviewFilename(b).ok)`; harvested asked over the same membership that supplies the numerator | exact |
| FSPEC BR-11 now scopes the DoD harvested test to `CODE_REVIEW-{feature}-v{N}.md`, and says a `-draft` suffix or another feature's name "neither raises the number nor suppresses `harvested`" | `n = deriveDodRoundIndex(...) - 1; if (n > 0) measured else if (harvested) harvested else measured 0`, feature name escaped before matching | exact |
| FSPEC BR-25 now names `docs/completed/QUEUE-HISTORY-rows-0-1.md` as a third loose file | §4.4's `isDirectory`-only discovery; the file was already dropped by the filter | exact |

No computation, no state token, no exit code and no key set changes. The divergence the TSPEC was
managing has been resolved *in the TSPEC's favour*, which is the good outcome — but it leaves the
document asserting, as fact, upstream wording that has been deleted, and re-raising three errata
that are now closed. That is a fidelity break in the sections the delta touched, and it is what F-01
and F-02 are about; F-03 is an inherited oracle weakness the new AT-17 leg makes newly repairable.

## Design

Nothing in §2 (module placement, layering, `lstat` choice, the parser bundle) reads on the changed
upstream text; the delta touches BR-11, BR-16, BR-25 and two AT bodies only. §2.5's parser-identity
premise is if anything strengthened: the upstream now says out loud that grammar membership decides
both the numerator and the harvested state, which is precisely the invariant the identity oracle
protects.

The one design-level passage that has gone stale is §4.3, in two paragraphs:

- **DoD rounds (BR-10, BR-11)** — the TSPEC states "FSPEC BR-11's wording is looser (`no
  CODE_REVIEW-* file remains in the directory`), and the two readings disagree on a directory left
  holding a `CODE_REVIEW-{feature}-draft.md` or a foreign-feature `CODE_REVIEW-` file… the FSPEC's
  looser wording is routed as an erratum (§8.3)". At HEAD, FSPEC BR-11 states the grammar-scoped
  form and spells out the `-draft` and foreign-feature leftovers explicitly. There is no looser
  wording, no disagreement, and nothing to route.
- **The harvested test reads "no `CROSS-REVIEW-*` remains" grammatically, and that is a choice** —
  the TSPEC states "FSPEC BR-16 and REQ-STATS-06 both phrase the condition over `CROSS-REVIEW-*`,
  and the two readings genuinely disagree…" and closes with "The FSPEC's ambiguity is routed as an
  erratum (§8.3), not resolved by silence." At HEAD both documents phrase the condition over the
  grammars, and FSPEC BR-16 names the `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape and
  `docs/completed/pdlc-advisory-wave-gate/` itself. The ambiguity is gone.

Both paragraphs are load-bearing prose an implementer TDDs from: each tells them the FSPEC means
something the FSPEC no longer means, and each justifies the code by a divergence that no longer
exists. The repair is a re-grounding edit, not a design change — the `if` chains stay byte-identical.

## Seams

_pending_

## Data structures

_pending_

## Verification

_pending_

## Risks

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_

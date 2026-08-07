# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 8
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `50e28b23..HEAD` — four document commits: `eaf5c744` (DEC-CONS-07's first rejected
alternative annotated as the shipped behaviour, TE F-01), `cde34287` (§11.2 conjunct 4 item (i)
restated as the invoking-tree domain's *whole* verb set, obliged ∪ permitted, as §5 domain 1 already
did — TE F-02), `9fe8f762` (the stale `FSPEC:415` / `FSPEC:442` anchors retargeted and §9's
lifetime-row sentence past-tensed — my F-16), `d8a297e1` (the continuation-anchor spelling named,
both counts published, and the sweep warranty scoped to `TSPEC:` anchors with an FSPEC recipe stated
— my F-17 and F-16's third limb).

I read my v7 cross-review, ran
`git diff 50e28b23..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
(48 insertions, 11 deletions), and confined this pass to the changed spans plus my two open v7
findings.

Changed spans: §9's *Context* paragraph (`DECISIONS:657-663`), the accepted-cost paragraph
(`:681-693`), the first rejected-alternative bullet (`:761-772`); §11.2 conjunct 4 item (i)
(`:907-909`); the *Anchor provenance* paragraph (`:947-957`) and its new warranty-scope paragraph
(`:971-976`); §11.3 item 1 (`:1026-1031`). Everything else is untouched and not re-litigated.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-16 | Low | **Resolved on all four limbs I named, and the retargets land** | I asked for four things. (a) *Retarget `FSPEC:415`.* Done at both sites, to `:435-436` with `:441-442` for the explanation. I resolved them at HEAD: `FSPEC:435` is "Released \| at step 16, by the pass that took it — an **in-place rewrite** … `RELEASED: {passId} {ISO-8601}`" and `FSPEC:436` is "Removed \| **never by the pass**"; `FSPEC:441-442` is the sentence the document now quotes, word for word — "a lifetime that said 'removed at step 16' would state a capability the runtime does not have, so release is specified as the one operation available: an in-place write of the same path". (b) *Retarget `FSPEC:442`.* Done, to `FSPEC:479`, and the quoted outcome is verbatim: "Present but **empty**, or a line that is neither form \| undecidable \| treated as **stale and reclaimed**, recording `reclaimed-stale-lock` with the abandoned pass id reported as `unknown`". (c) *Past-tense `DECISIONS:658`.* Done — "**said** the marker was 'removed at step 16' at the revision this entry was written against. It no longer does". §11.3 item 1's twin now reads the same way and adds the current locations. (d) *Say the warranty covers `TSPEC:` anchors only.* Done as its own paragraph, naming both stale FSPEC values, their retargets, and the equivalent `FSPEC:` recipe for the next sweep. Beyond the ask, the revision explains the *fourth-row* drift instead of silently renumbering: the empty arm "was the fourth before the `RELEASED:` row at `FSPEC:476` was inserted". I checked that: `FSPEC:475`–`:479` are the five data rows, `:476` is the `RELEASED:` row, and deleting it makes `:479` the fourth. The two surviving `FSPEC:415` / `FSPEC:442` occurrences in the file are inside the provenance note itself, naming them as the retargeted-from values — correct usage, not a residual cite. |
| F-17 | Low | **Resolved as asked, on the second of the two options I offered** | I offered "widen the pattern, or state that continuation anchors are hand-resolved and give both counts". The document takes the second and takes it further than the ask: it names the third spelling explicitly ("the file-less *continuation* anchor, a backticked `` `:NNN` `` token whose file is carried by an earlier anchor in the same sentence"), gives three worked examples, states the hand-resolution rule, publishes the second recipe `` grep -onE '`:[0-9]+(-[0-9]+)?`' ``, and closes the loop on its own arithmetic — "the fourteenth stale site counted below is the pre-sweep bare `:684`, which the published pattern cannot see", which is exactly the gap I raised. The method is now as wide as the claim. The *numbers* attached to it are not, which is F-18 below — a new defect in new text, not a survival of F-17. |
| Q-04 | — | Answered upstream in v7; stays retired | Not re-opened. |
| Q-05 / Q-06 / Q-07 / Q-08 / Q-09 | — | Still open, still not findings | Carried forward unchanged. Q-09 is untouched by this delta — §11.3 still carries two struck items and one live one under a title that describes one of the three. |

Both v7 findings are resolved. The verdict turns on the new material.

## Verification of the changed sections

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

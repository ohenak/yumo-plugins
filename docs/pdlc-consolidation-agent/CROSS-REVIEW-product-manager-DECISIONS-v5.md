# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 5
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `61f11478..HEAD` — three document commits: `4800522a` (retarget DEC-CONS-03's
obligation cites to `TSPEC:2202-2203` and the domain rows to `:1724`/`:1725`), `a3227a0a` (§11.2's
DEC-CONS-03 row — enumerate all four set assertions in TSPEC order, both-domain absent-always), and
`8ee80a62` (re-measure remaining TSPEC anchors at HEAD; add the new *Anchor provenance* paragraph).
I read my v4 cross-review, ran
`git diff 61f11478..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`,
and confined this pass to the changed spans plus my two open v4 findings.

Changed spans: §5 (DEC-CONS-03) domains 1, 2 and 3 — anchor retargets plus the two parenthetical
"not `:2201-2202`, which is containment" clauses; §5's marker-lock rejection bullet (`:1619` ⇒
`:1724`); §8 (DEC-CONS-06)'s widened-prompt and exclusion anchors (`:425-426` ⇒ `:479-480`,
`:2160` ⇒ `:2282-2284`, `:912-919`/`:969-971` ⇒ `:992-996`/`:1046-1048`, `:439` ⇒ `:493`); §11.2's
DEC-CONS-03 row, rewritten from a prose sentence into a four-item enumeration, plus the wholly new
*Anchor provenance* paragraph. Everything else is untouched and not re-litigated.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-08 | Low | **Resolved, exactly** | I asked for the obligation conjunct to be cited at `TSPEC:2098-2099` rather than `:2097`, in all three places. The TSPEC has since moved, and the revision retargets to the *current* anchor in all three: DEC-CONS-03 domain 1, domain 2, and §11.2 item 3 now cite `TSPEC:2202-2203`. Verified at HEAD — `TSPEC:2202` reads "`observed ⊆ permitted` per domain, universally; **obligation** `obliged ⊆ observed` per domain, on" and `:2203` continues "the Given that obliges it; and the two `∅` equalities of AT-Q7c." Two of the three sites go further than I asked and state the *negative* — "`:2201-2202` is *containment*, which is precisely the conjunct this sentence has just said is insufficient" — which closes the mis-landing my finding described rather than merely relocating it. |
| F-09 | Low | **Resolved, in full** | I asked for three things and the revision does all three. (a) The span is now `TSPEC:2199-2204`, which I verified covers the whole oracle sentence from "The oracle is then **four** set assertions" through "never a multiset" — my v4 complaint that the cited span was short at both ends is gone. (b) The four are re-ordered to the TSPEC's own order: partition **first** (`:2199-2201`), containment (`:2201-2202`), obligation (`:2202-2203`), the two `∅` equalities of AT-Q7c **fourth** (`:2203`). I transcribed `TSPEC:2199-2204` and the order matches exactly. (c) The clone-domain absent-always `∅` is now carried — item 4 states *two* intersections, names the invoking-tree absent-always set (`checkout`, `switch`, `stash`, `reset`, `rebase`, every merge verb, `TSPEC:1724`) and the clone's (every merge verb, `TSPEC:1725`), and adds the sentence I would have written myself: "a property that carries only the invoking-tree half is not set-equal to the TSPEC's oracle." |
| Q-04 / Q-05 / Q-06 | — | Still open, still not findings | None is answered here and none needs to be. Carried forward unchanged. |

## Verification of the changed sections

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

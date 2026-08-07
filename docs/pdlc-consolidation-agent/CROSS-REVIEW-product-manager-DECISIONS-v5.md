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

Every retargeted anchor in the three commits was re-run against the TSPEC and the adapter at HEAD.

- **The two domain rows are now correct.** `TSPEC:1724` is the `git, invoking tree` row of §9.3's
  domain table (obliged `add`, `commit`; permitted `read-branch`, `read-status`, ⊕ `read-object`,
  ⊕ `read-remote`, ⊕ `read-index`; absent always `checkout`, `switch`, `stash`, `reset`, `rebase`,
  every merge verb) and `TSPEC:1725` is the `git, clone` row (obliged `clone`, `create-branch`,
  `add`, `commit`, `push`; permitted `fetch`, `read-branch`, `read-status`; absent every merge
  verb). Both are **set-equal** to what DEC-CONS-03 domains 1 and 2 and §11.2 transcribe — I
  compared member by member in both directions, and neither transcription has gained or lost a verb
  in this revision.
- **The four set assertions verify against `TSPEC:2199-2204` line for line.** `:2199-2200`
  partition and its union clause, `:2201` the "(without this, a call that falls out of the
  partition is exempt from containment)" rationale plus the word **containment**, `:2202` the
  containment formula and the word **obligation**, `:2203` "the Given that obliges it; and the two
  `∅` equalities of AT-Q7c. Comparison is over a `Set`, never a", `:2204` "multiset". Every
  sub-anchor §11.2 now gives — `:2199-2201`, `:2201-2202`, `:2202-2203`, `:2203`, `:2203-2204` —
  lands on the clause it names.
- **The DEC-CONS-06 retargets are right.** `TSPEC:479-480` is the widened `rtWriteFile` clause
  quoted verbatim, and I re-confirmed the count it turns on: `grep -n 'relative to the repository
  root' pdlc/workflows/runtime-adapter.js` still returns the single line `805:`, and `:480` reads
  "against the repository root", a different string — so the post-widening whole-file count is still
  1, exactly as the entry says. `TSPEC:2282-2284` is §11.6(e) conjunct 2 ("the string … occurs in
  `runtime-adapter.js` **exactly once** — the count is the falsifier for the opposite mistake"),
  correctly retargeted from the stale `:2160`. The standing guard sentence I praised at v4 is
  intact.
- **The exclusion paragraph's retargets are right.** `TSPEC:992-996` is the `takeMarker` passage
  that probes with `_checkFile` and reads with `_readFile`; `:1046-1048` is the observe-then-write
  ordering. `grep -n '_hashFile'` over the TSPEC still returns **exactly one** line — `:493`, the
  `rtDevInjections` member list — so "no consumer" holds and the retarget from `:439` is correct.
- **No regression against anything I approved.** DEC-CONS-06's decision, scoping and positive arms,
  DEC-CONS-03's three domains, the withdrawn-ground paragraphs and the `∅`/obligation strengthening
  are all untouched in substance; this revision moves anchors and expands one enumeration, and
  removes no assertion. I re-checked that §11.2's rewritten row is a superset of the prose it
  replaced — it is.
- **What did not verify: the new *Anchor provenance* paragraph's universal claim.** See F-10. Its
  scoped statement about the conjuncts is true (`:2095` ⇒ `:2199` and `:2098` ⇒ `:2202` are both
  +104), but the sentence generalises to the whole file, and the whole file does not hold.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 6
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `8ee80a62..HEAD` — seven document commits: `2566d28d` (§11.2 conjunct 4 restated as
AT-Q7c's two whole-domain `∅` equalities, TE F-01), `09988052` (full anchor re-measurement; the
shift claim scoped, PM F-10/F-11), `1a5b87e3`, `c3d02c0d`, `edcbecc3`, `8bfddd67` (the four
retarget batches), `01624628` (state the sweep counts exactly). I read my v5 cross-review, ran
`git diff 8ee80a62..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`,
and confined this pass to the changed spans plus my three open v5 findings.

Changed spans: §3 (DEC-CONS-01)'s inbound-residual paragraph (four anchors) and §11.3 item 3's twin
of it; §7 (DEC-CONS-05)'s `CORPUS_GLOBS` and hook-predicate anchors and the enumeration-pin anchor;
§8 (DEC-CONS-06)'s `_checkFile` transport cite; §9 (DEC-CONS-07)'s permanence anchors **plus a
wholly new *Anchor-sweep note* paragraph** recording an upstream supersession; §11.2's conjunct 4,
rewritten from four lines into a ~25-line block, and the *Anchor provenance* paragraph, rewritten
into three. Everything else is untouched and not re-litigated.

Two of those changes are not citation work and are reviewed as new material: §11.2's conjunct-4
rewrite (which **reverses** a reading I approved at v5) and §9's *Anchor-sweep note*.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-10 | Medium | **Resolved, and by the harder of the two remedies** | I offered a choice: complete the sweep, or narrow the warranty to the three sections actually swept. The revision completed the sweep. All six anchors I named are corrected and I re-resolved every one at HEAD: `:618`⇒`TSPEC:672` (`enumerateCorpus(_git): Promise<{files: CorpusFile[]} \| {unlistable: true, detail: string}>`) plus `:738` for the exact phrase; `:1832`⇒`TSPEC:1937` (§10.3 row 1a, "Corpus unlistable"); `:1522`⇒`TSPEC:1602` (`openClone(passId, config, seams): …`); `:2522`⇒`TSPEC:2658-2660` (the §13.3 residue line); `:1325`⇒`TSPEC:1405` (the NFR-2 / §7.4 traceability row); `:1595-1601`⇒`TSPEC:1675-1677` in **both** sites (§3 and §11.3 item 3), with `:1699` added as the restatement. The two NFR-2 inbound-residual anchors I singled out (`:1832`, `:1522`) now land on the row and the signature they name. The warranty sentence is also rewritten to state what was done and how, with counts. |
| F-11 | Low | **Resolved, exactly as asked** | The "roughly +105 lines" global-offset sentence is gone. In its place: the conjunct shift is stated as **+104** (`:2095`⇒`:2199`, `:2098`⇒`:2202`), explicitly labelled "**local, not a global offset**", with the range measured on this revision's own retargets — +54 (`:425`⇒`:479`, `:439`⇒`:493`), +80 (`:912`⇒`:992`), +105 (`:1619`⇒`:1724`), +122 (`:2160`⇒`:2282`) — and closed with "Adding a constant to a stale anchor lands nowhere." I recomputed all five deltas; every one is arithmetically right. |
| F-12 | Low | **Resolved, exactly** | §8 now reads "the `_checkFile` transport (prompt `:822-824`, its `check:${path}` label `:825`)". Verified at HEAD: `runtime-adapter.js:822` "Run this exact command from the repository root and report the result:", `:823` the `test -f … && test -s …` line, `:824` "Return ONLY one word: OK, EMPTY, or MISSING.", `:825` `{ label: \`check:${path}\`, … }`. The substantive exclusion claim is unchanged, as I asked. |
| Q-04 / Q-05 / Q-06 / Q-07 | — | Still open, still not findings | Carried forward unchanged. |

All three v5 findings are resolved. The verdict below turns entirely on the two **new** blocks the
same commits introduced.

## Verification of the changed sections

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

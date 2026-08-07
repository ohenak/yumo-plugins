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

I re-ran the sweep myself rather than taking the paragraph's word for it, and resolved every
`TSPEC:` anchor in the document at HEAD.

- **The sweep's own arithmetic checks out.** The paragraph claims "**ten** distinct stale values,
  across **twelve** citation sites". The listed ten are `:618`, `:1832`, `:1522`, `:1595-1601`,
  `:787-788`, `:117`, `:793-796`, `:962-966`, `:2522`, `:1325`; two of them (`:1595-1601`,
  `:787-788`) occur at two sites each, giving twelve. Consistent, and every replacement resolves.
- **The newly-corrected anchors land where they claim.** `TSPEC:806` is the `CORPUS_GLOBS` decision
  line and `:841-842` the code form (`CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")`
  and the comprehension over it); `:807` is the two-region predicate scoping; `:847` is
  "stated over **declaration, never line number**" and `:850` the `glob.glob(` exactly-once
  conjunct; `:966-970` carries the no-removal-verb sentence quoted verbatim. Each is the clause
  named, not a neighbour.
- **The anchors the v5 pass had already moved all still reproduce**, as the paragraph asserts:
  `:479-480`, `:493`, `:992-996`, `:1046-1048`, `:1724`, `:1725`, `:2199-2204` and its four
  sub-anchors, `:2282-2284`. I spot-resolved all of them; none has drifted.
- **§11.2's conjunct-4 rewrite is a correction, and it is the right one — including against my own
  v5 approval.** At v5 I praised the reading that AT-Q7c's two `∅` equalities are the two
  *absent-always intersections* (`TSPEC:1724`/`:1725`). That reading was wrong and the revision says
  so. I verified the new one against the upstream definitions: `FSPEC:2154` states AT-Q7c's oracle
  as "the PR seam and the clone seam observing `∅` and the invoking tree observing a set **bounded
  on both sides**", and `FSPEC:1060-1063` says the two `∅` conjuncts "*are* equalities, with the
  empty set rather than with a permitted set … weakening them to containment (which `∅ ⊆ permitted`
  satisfies vacuously) would leave that row nothing to catch." The document's three carry-with-you
  points transcribe that faithfully, including "**No** obligation is asserted on the two empty
  domains" (`FSPEC:2154` says exactly that). Its claim that `grep -n AT-Q7c` on the TSPEC returns
  `:2192`, `:2203`, `:2481`, `:2502` and none is a definition is true — I ran it. And relabelling
  the invoking-tree absent-always intersection as **implied by conjunct 2** is correct:
  `TSPEC:1724`'s permitted column is `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`,
  ⊕ `read-index`, which is disjoint from `checkout`/`switch`/`stash`/`reset`/`rebase`/the merge
  verbs, so `observed ⊆ permitted` forces that intersection to `∅`. This is a strictly better
  handoff than the one I approved.
- **§9's new *Anchor-sweep note* is right about the payload and wrong about the probe.** Its payload
  half verifies: `TSPEC:974` and `:977` both carry `RELEASED: {passId} {ISO-8601}` (matching FSPEC
  `BR-14a` at `FSPEC:2585`), `parseMarker` recognises the form at `:951`, `E-11b` maps it to `free`
  at any age at `:1016-1018`, the residue line reads "never empty in the steady state" at `:1036`
  and `:2658-2660`, and `:2656-2657` does say a PLAN task written against the empty form "would be
  written against the losing side". Its **probe** half does not verify — see F-13.
- **No substantive regression against anything I approved.** DEC-CONS-03's three domains and verb
  sets are untouched and still set-equal to `TSPEC:1724`/`:1725` in both directions; DEC-CONS-06's
  decision, scoping, positive arms and exclusion are unchanged apart from the F-12 cite;
  §11.6(e) conjunct 2's guard sentence is intact; DEC-CONS-05's evidence structure is unchanged
  apart from anchors. This revision corrected citations, corrected one reading, and added one note.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

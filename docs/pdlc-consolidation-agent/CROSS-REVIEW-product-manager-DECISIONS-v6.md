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

All three v5 findings are resolved. The two new blocks introduce one **High** and one **Medium**,
both in DEC-CONS-07, plus one Low against the sweep's stated method.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-13 | **High** | Local | **The new *Anchor-sweep note* certifies that DEC-CONS-07's `present` half "carried" upstream. The TSPEC at HEAD reverses it, and it reverses it in favour of the alternative this entry rejected.** The note (`DECISIONS:697-699`) partitions the entry into what survived and what did not: "The **reasoning** in this entry is what carried: release is a write, never a removal; **`present` is `_checkFile(...).ok`**; the two manual channels must agree. The **empty payload** did not…". Only the first and third clauses are true. `TSPEC:987-988` states the opposite of the second, in terms: "`{ok:false, reason:"file_empty"}` / `{ok:false, reason:"file_missing"}` otherwise; **the layer reads `file_missing` alone as absent, and treats `{ok:true}` and `file_empty` alike as present**." The same reversal is carried at `TSPEC:1026` ("decision 2 above reads `file_missing` alone as absent"), at `TSPEC:2653`, and in §13.1 row 13 (`TSPEC:2590`). DEC-CONS-07's Decision half 2 (`DECISIONS:668-673`) says `present` is `(await _checkFile(markerPath)).ok === true`, "only that", "so **`file_empty` is treated exactly as absent**" — which is now false upstream. **This is not a symmetric restatement; it flips an operator-visible outcome.** `TSPEC:1940` (§10.3 row 4) routes an empty marker as *present-and-unparseable* ⇒ `markerVerdict` ⇒ **`reclaim`** ⇒ `reclaimed-stale-lock`, and `TSPEC:2640` confirms the fixture set ("the `""` and the neither-verb fixtures **reclaim**, the two `RELEASED:` fixtures do not, at either age"). That outcome is **verbatim the alternative DEC-CONS-07 rejects** at `DECISIONS:707-710`: "**Preserve FSPEC §4.2's empty arm — treat an empty marker as `reclaim`** — rejected." So the entry's rejected alternative is what shipped, while the note tells the reader the probe half is the part that survived. Two further sentences in the entry inherit the error: the operator narrative at `DECISIONS:685-687` ("a released pass yields `file_empty`, and §7.3 treats both as absent") — the conclusion (both channels free) still holds upstream via `TSPEC:1040`, but the stated mechanism does not — and `DECISIONS:679` still explains the permanence cost as a *zero-byte* marker two lines above a note saying it is not zero-byte. **Why High rather than Medium.** The note's own stated purpose is downstream direction — it says "a PLAN or PROPERTIES task must be written against the `RELEASED:` form … never against the empty one". A PROPERTIES author who obeys that sentence and *also* obeys its neighbouring clause writes the release payload correctly and the presence oracle backwards: an `file_empty ≡ absent` property is red against `TSPEC:988` and misses `reclaimed-stale-lock` entirely, which is an AC-1.3 operator-visible outcome (a pass that reclaims a lock it should have refused, or the reverse). A wrong anchor costs a reader a grep; this costs an oracle. Fix: extend the supersession to **both** halves — state that `present` is now `file_missing` alone (`TSPEC:987-988`, `:1026`), that an empty marker is a *truncated* one that reclaims (`TSPEC:1940`, `:2640`), and therefore that the entry's rejected "empty ⇒ `reclaim`" alternative is the shipped behaviour; and reconcile `DECISIONS:679` and `:685-687` with it in the same pass. | AC-1.3, AC-3.8 |
| F-14 | **Medium** | Local | **The supersession is recorded only inside the entry body; every surface a downstream author actually reads still directs them to the superseded form.** `grep -c RELEASED` over the document returns **4**, all between `DECISIONS:692` and `:703` — i.e. entirely inside the new note. Outside it: (a) §2's Decision index row still reads "**DEC-CONS-07** \| Release is `_writeFile(markerPath, "")`; `_checkFile`'s `file_empty` is read as **absent**" with no supersession marker (`DECISIONS:58`-area row); (b) the §9 heading itself is still "**DEC-CONS-07: Release writes `""`; `file_empty` is read as absent**" (`DECISIONS:652`); (c) §11.1's *obligations on the PLAN* table still requires the marker task's Definition of Done to name "the six-status release set-equality and the **empty-vs-unparseable fixture pair**" (`DECISIONS:787`) — a fixture pair whose first member the note declares obsolete and whose distinction `TSPEC:1940`/`:2640` has re-drawn as `""`-vs-`RELEASED:`; (d) §11.2's DEC-CONS-07 consequence bullet (`DECISIONS:849-852`) states only the six-status set-equality and says nothing about the payload. §11 is titled *Consequences for downstream layers* — it is the handoff section, and it is the one place the note's instruction ("a PLAN or PROPERTIES task must be written against the `RELEASED:` form") does **not** appear. The index and the heading are worse than silent: they are one-line summaries that a PLAN author is entitled to read *instead of* the entry body, and both assert the losing form. This is the same defect shape as v5's F-10 — correct information present, wrong information certified in the place the reader is steered to — moved from anchors to payload. Fix: mark the index row and the §9 heading superseded (a parenthetical is enough: "payload and probe superseded by `TSPEC:974-977`, `:987-988`"), restate §11.1's fixture-pair obligation against the shipped fixture set, and add the `RELEASED:`-form instruction to §11.2's DEC-CONS-07 bullet where PROPERTIES will look for it. | AC-1.3 |
| F-15 | Low | Local | **The sweep's certified extraction recipe does not extract the full enumeration it certifies.** The *Anchor provenance* paragraph now says every `TSPEC:` anchor was resolved, "extracted mechanically (`grep -on 'TSPEC[^ ]*:[0-9]\+\(-[0-9]\+\)\?'` over this file) and resolved one by one, not the subset that happened to be under edit." I ran the quoted command: it returns **40** sites. A pattern that also admits the `TSPEC §N:LINE` spelling returns **42** — the two extra are `DECISIONS:444` and `:489`, both `` `TSPEC §7.1:806` ``, because `TSPEC[^ ]*:` cannot cross the space before `§7.1:`. Those two sites *are* correct in this revision (they were retargeted from `:787-788`), so nothing is stale today; the defect is that the recipe is published as the reproducible method and the next author to re-run it after the TSPEC moves will silently skip the `TSPEC §N:` form. Given that this paragraph exists precisely because a warranty was once stated broader than the work behind it, the recipe should be as wide as the claim. Fix: quote a pattern that admits both spellings (e.g. `grep -onE 'TSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'`), or state the count both patterns return so a re-runner can tell they have the whole set. | AC-3.8 |

## Questions

## Positive Observations

## Recommendation

## Verdict

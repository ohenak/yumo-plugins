# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 6
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v5.md`. Diff base `8ee80a62`
(the commit v5 reviewed) → HEAD; seven revision commits touched this document (`2566d28d`,
`09988052`, `1a5b87e3`, `c3d02c0d`, `edcbecc3`, `8dbfddd67`, `01624628`), +81/−23 lines confined to
§4's NFR-2 residual, §7.1 and its Alternatives, §8's exclusion paragraph, DEC-CONS-04's cost
paragraph, §11.2's DEC-CONS-03 bullet and Anchor-provenance note, and §12 item 3. Testing lens only:
whether v5's F-01 is closed, and whether the changed text introduced an oracle that is red on correct
code, green on a regression, or that mis-transcribes the contract it claims to carry. Unchanged
sections approved in v1–v5 are not re-litigated.

## Disposition of v5 findings

| v5 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | I asked for §11.2 conjunct 4 to be restated as AT-Q7c's two whole-domain emptiness equalities on the **PR seam** and the **clone**, with the note that neither is implied by containment, and for the invoking-tree absent-always intersection to be kept only if labelled implied. All of that landed. The bullet now reads "**PR-seam observed `= ∅`** and **clone-seam observed `= ∅`**", quotes `FSPEC:2154` verbatim for it, states in (ii) that `∅ ⊆ permitted` is satisfied **vacuously** so neither equality is implied by conjunct 2, states in (iii) that **no** obligation is asserted on the two empty domains, and demotes the invoking-tree intersection to a separately-labelled implied negative that "must not be written in their place". Re-measured at HEAD: `FSPEC:2154` is the AT-Q7c row and carries the quoted clause word-for-word; `FSPEC:1060-1063` carries "with the empty set rather than with a permitted set … would leave that row nothing to catch"; `TSPEC:2203` names the conjuncts without defining them, and `grep -n AT-Q7c` on the TSPEC returns exactly `:2192`, `:2203`, `:2481`, `:2502`, none a definition — the bullet's own provenance claim reproduces. The dropped PR-seam conjunct is restored and the inverted clone conjunct is corrected |

Conjuncts 1–3 and the `Set`-not-multiset closer were re-checked against `TSPEC:2199-2204` and are
unchanged and still exact. The two `∅` equalities are now the strongest part of the bullet rather
than the weakest, which is what v5 asked for.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The new item (i) transcribes the invoking-tree upper bound as FSPEC's *pre-widening* permitted set, which is red on correct code — and it contradicts this document's own §5 domain 1, which records that exact error as already withdrawn once.** §11.2 conjunct 4 item (i) now says the invoking tree "contains `{add, commit}` and is contained in `{add, commit, read-branch, read-status}` (its permitted set)". That upper bound is **not** the permitted set the implementation must satisfy. `TSPEC:1724`'s permitted column for the invoking-tree domain is `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index` — TSPEC §9.3 **widens** FSPEC §6.5 by three verbs (`TSPEC:1719`: "non-mutating, each marked ⊕ below. Every other cell is transcribed unchanged at FSPEC v11.1"; the widening table at `TSPEC:1743-1745` names each and why the pass makes it). At least one of the three is observed on **AT-Q7c's own Given**: `read-index` is `git ls-files --cached --others --exclude-standard -- :(glob)…`, §7.1's corpus enumeration (`TSPEC:1745`), and `enumerateCorpus` takes `_git` (`TSPEC:672`) — a `promoted` pass by definition enumerated a corpus, so its invoking-tree observed set contains `read-index` on every conforming run. A property written to item (i) as transcribed therefore **fails on correct behaviour**. This is the same defect class §5 domain 1 already documents and withdraws, five hundred lines earlier in this very document: "An earlier draft of this line … named only the three ⊕ widenings; that is **withdrawn**, because … it understated the reads by two and omitted the two obliged mutating verbs, so the assertion as written was **red on correct code**" (`DECISIONS:293-297`). §5 domain 1 carries the correct five-read set (`DECISIONS:294`); §11.2 item (i), added this round, carries the stale two-read one, so the document now states two different upper bounds for the same domain and the wrong one is the one addressed to a PROPERTIES author. The provenance is legible — item (i) is a faithful quotation of `FSPEC:2154`, which was written before TSPEC's widenings and was never re-issued (`grep -n 'read-index\|read-object\|read-remote'` on the FSPEC returns nothing) — but faithfulness to a superseded upstream is exactly what this document flags elsewhere and must flag here. Fix: state the upper bound as `TSPEC:1724`'s five-read permitted set, cite `TSPEC:1724` (not `FSPEC:2154`) for it, cross-reference §5 domain 1 so the two statements cannot drift again, and note that `FSPEC:2154`'s parenthetical "(its permitted set)" is superseded — an erratum is raised below. The two `∅` equalities themselves are unaffected: they are equalities with `∅`, not with a permitted set, and are correct as written | §11.2, DEC-CONS-03 bullet, conjunct 4 item (i) |
| F-02 | High | Local | **§12 item 3 raises two errata against a TSPEC that has already applied both, and mis-transcribes the row it now cites.** The item, edited this round, says: "**TSPEC §9.2 — the credentialed push cannot reach `git` by shell expansion** … `TSPEC:1675-1677` (with `:1699`) says the value reaches `git`/`gh` by shell expansion inside the transported command … This is the TSPEC's to correct, not this document's." At HEAD the TSPEC has corrected it, in terms: `TSPEC:1685-1687` reads "**The push half is different, and an earlier draft of this section was wrong about it.** `_git` takes **argv**, and `rtGit` passes every element through `rtShellQuote` (`pdlc/workflows/runtime-adapter.js:668-670`), which POSIX single-quotes it", and `TSPEC:1693-1698` picks a lane — the push stays on `_git` and carries the credential as a **git credential helper** whose text `git` expands through its own shell one process below the transport — with the command-string-seam alternative recorded as rejected. The TSPEC's own §1 changelog records the round: erratum 1.7(b), `TSPEC:55-60`. And `TSPEC:1675-1677` at HEAD is scoped to the `gh` half only ("That statement is exact for the `gh` half"), so the sentence attributing a `git`/`gh` shell-expansion claim to it is a mis-transcription of the cited lines, not merely a stale conclusion. The riding sentence is stale the same way and is checkable in one line: it says "the NFR-2 / §7.4 traceability row (`TSPEC:1405` …) states NFR-2 non-disclosure as unqualifiedly 'structural' … that row is the TSPEC's to qualify." `TSPEC:1405` at HEAD reads "non-disclosure **on the outbound path** is structural (§5.3) rather than reviewed. It is **not** structural inbound, **and this row does not claim it is**", and then carries the inbound residual (`rtGit`'s 300-character combined-output reply, §10.3 row 1a, `openClone`'s `{failure, detail}`) under DEC-CONS-01's qualification — i.e. the row already says the exact thing this item asks it to say, and `TSPEC:51-55` (erratum 1.7(a)) records that it was changed to say it. The parenthetical the revision added — "the TSPEC's own §1 pointer at `:52` still cites it as `:1325`, which is a blank line" — reads `:52` as a live cross-reference; it is a **changelog entry describing a past edit**, and its text ("no longer states non-disclosure as unqualifiedly 'structural'") is precisely the evidence that this erratum is closed. This matters beyond tidiness for two reasons a test author feels directly: a live erratum entry routes work to an upstream author who will find nothing to do, and the design it presumes is the one the TSPEC **rejected** — a property or PLAN task written from item 3 would target a command-string push seam, whereas the shipped lane is the credential helper on `_git`, which keeps the push inside §9.3's clone-domain classifier and therefore inside AT-Q7's `push` obligation. Fix: retire item 3 to a resolved/superseded note recording that both halves were applied upstream (`TSPEC:1685-1698`, `TSPEC:1405`, changelog `TSPEC:51-60`), and state the chosen lane, since DEC-CONS-01's residual paragraph and §9.3's `push` obligation both depend on it | §12 open questions, item 3 |
| F-03 | Low | Local | **The sweep's self-reported counts undercount it.** The Anchor-provenance note states "**ten** distinct stale values, across **twelve** citation sites". Counting the revision's own diff: the distinct stale `TSPEC:` values are `1595-1601`, `618`, `684`, `1832`, `1522`, `787-788`, `117`, `793-796`, `962-966`, `2522`, `1325` — **eleven**, because `:618` and `:684` were two separate anchors in the pre-edit §4 sentence ("(`TSPEC:618`, `:684`)"), not one value with two targets, and the note's shorthand "`:618`⇒`:672`/`:738`" collapses them. Counting sites, `:1595-1601`, `:787-788` and `:117` each occur twice (§4 residual + §12 item 3; §7.1 + Alternatives item 2; §7.1 + Alternatives item 3), giving **fourteen**. The retargets themselves are all correct — this is a bookkeeping claim, not a contract claim, which is why it is Low — but the note offers the counts as evidence that the extraction was mechanical and exhaustive, and a reader who recounts and gets a different number loses that assurance. Either restate as 11/14 or say how `:618`/`:684` are being counted as one | §11.2, Anchor provenance |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The sweep re-measured every `TSPEC:` anchor. F-02 shows that a correct anchor can still carry a stale *claim* — `:1405` and `:1675-1677` both resolve, and both now say something different from what the sentence citing them asserts. Is it worth one more pass that reads the **content** at each retargeted anchor against the sentence that cites it, rather than only confirming the anchor resolves? Three sites in this revision cite lines whose text moved as well as their number (`:1675-1677`, `:1405`, `:966-970`); two of the three are the subject of F-02. |
| Q-02 | DEC-CONS-04's new supersession note is the right pattern for "the upstream moved under an approved entry". F-01 and F-02 are two more instances of the same pattern (`FSPEC:2154`'s permitted set; §12 item 3). Should that note's shape be lifted into a short standing subsection — "entries whose upstream has moved" — so a PROPERTIES author has one place to look rather than three scattered paragraphs? |

## Positive Observations

- **The v5 finding was closed on the merits, not by softening the text.** The restatement adds the
  PR-seam conjunct back, corrects the clone conjunct from a merge-verb intersection to whole-domain
  emptiness, and adds the non-implication argument (`∅ ⊆ permitted` is vacuous) that makes it
  obvious *why* both are needed. The invoking-tree intersection I offered to drop was kept and
  labelled implied, with the reason for the label written down — which is the answer to v5's Q-01
  and a better one than dropping it.
- **DEC-CONS-04's supersession note is the strongest new paragraph in the revision.** It found, by
  re-measuring anchors rather than by being told, that the TSPEC had adopted BR-14a's
  `RELEASED: {passId} {ISO-8601}` in-place write and that the zero-byte payload this entry decided
  no longer exists in steady state; it separates the **reasoning** that survived (release is a
  write, never a removal; `present` is `_checkFile(...).ok`) from the **payload** that did not; and
  it tells a PLAN or PROPERTIES author, in terms, to write against the `RELEASED:` form. Every
  anchor in it reproduces at HEAD — `TSPEC:974`, `:977`, `parseMarker`'s `RELEASED:` arm at `:951`,
  E-11b's `free`-at-any-age mapping at `:1016-1018`, the residue line at `:1036` and `:2658-2660`,
  the read-back conjunct at `:998-1003`, and `:2656-2657`'s "a PLAN task written against the empty
  release form would be written against the losing side". Recording a supersession instead of
  silently re-deciding is the behaviour a decision log exists for.
- **The retargets are individually measured and every one lands.** I resolved all eleven stale
  values independently: `:672`/`:738` (the `enumerateCorpus` signature and the exact
  `{unlistable: true, detail: stderr}` phrase), `:1937` (§10.3 row 1a), `:1602` (`openClone`'s
  signature), `:1675-1677` and `:1699`, `:806` and `:841-842` (the `CORPUS_GLOBS` prose and the
  Python form), `:807`, `:847`/`:850` (declaration-not-line-number, and `glob.glob(` exactly once),
  `:966-970`, `:2658-2660`, `:1405`. All reproduce. The note's replacement of a single global offset
  with a measured range — `+54`, `+80`, `+104`, `+105`, `+122` — and its flat statement that "adding
  a constant to a stale anchor lands nowhere" is the correct lesson from the v5 round.
- **Both High findings are transcription defects against a moving upstream, not decision defects.**
  Nothing in this revision reopened a settled question, and no decision recorded here is wrong.
  DEC-CONS-03 is still containment-not-exclusion, conjoined with obligation, compared as a `Set`;
  DEC-CONS-01's inbound residual is real and the TSPEC now agrees with it at `:1405`.

## Recommendation

**Needs revision** (2 High, 0 Medium, 1 Low).

The v5 finding is closed properly — the two `∅` equalities are now transcribed as AT-Q7c states them,
with the non-implication argument that makes them load-bearing rather than decorative, and the
redundant invoking-tree conjunct is kept but labelled. The sweep that accompanied it is genuine work:
eleven stale anchors found and retargeted, each verified individually here, and the global-offset
fiction replaced with a measured range.

Two defects in the changed text block approval, and they are the same defect twice: a sentence whose
*anchor* was re-measured but whose *claim* was not re-read against what that anchor now says.

1. **F-01** — §11.2 conjunct 4 item (i) states the invoking-tree upper bound as
   `{add, commit, read-branch, read-status}`, quoting `FSPEC:2154`. `TSPEC:1724` widens that domain
   by three verbs (`read-object`, `read-remote`, `read-index`; `TSPEC:1719`, `:1743-1745`), and
   `read-index` is observed on AT-Q7c's own `promoted` Given, since `enumerateCorpus(_git)`
   (`TSPEC:672`) runs `git ls-files` in the invoking tree. The transcribed bound is red on correct
   code — the exact failure this document's own §5 domain 1 records as already withdrawn once
   (`DECISIONS:293-297`), and the document now carries both the corrected bound at `:294` and the
   stale one at §11.2. Restate against `TSPEC:1724`'s five-read set, cite the TSPEC for it, and
   cross-reference §5 domain 1.
2. **F-02** — §12 item 3 raises two errata the TSPEC has already applied. §9.2's shell-expansion
   claim was corrected and a lane chosen (credential helper on `_git`, `TSPEC:1685-1698`), and the
   NFR-2 / §7.4 row already reads "structural **on the outbound path** … It is **not** structural
   inbound, and this row does not claim it is" with the inbound residual carried (`TSPEC:1405`);
   both rounds are recorded in the TSPEC's own changelog at `:51-60`. `TSPEC:1675-1677` is also
   mis-transcribed — at HEAD it is scoped to the `gh` half explicitly. Retire item 3 to a
   resolved/superseded note and state the chosen lane, which §9.3's `push` obligation depends on.
3. **F-03** (Low) — the sweep's self-reported "ten distinct stale values, across twelve citation
   sites" is 11/14 by my count of the same diff; restate or explain the collapsing of `:618`/`:684`.

Nothing else in the revision broke an unchanged section. §4's residual, §7.1, the Alternatives block
and §8's exclusion paragraph changed by anchor retarget only; I re-resolved each new anchor and each
one lands on the content the surrounding sentence describes. DEC-CONS-04's supersession note is
correct throughout and is the pattern F-01 and F-02 should be fixed into.

One upstream defect found this round, emitted as an ERRATUM in my final message: `FSPEC:2154`'s
AT-Q7c row states the invoking-tree upper bound as "(its permitted set)" using FSPEC §6.5's
pre-widening set, which TSPEC §9.3 has since widened by three ⊕ read verbs; the FSPEC row is stale
and an AT written from it as it stands is red on correct code. That is FSPEC's to correct, not this
document's — but this document must stop transcribing it (F-01) either way. The §12 item-3 staleness
is **not** an erratum: it is this document's reading of a TSPEC that has already been fixed.

## Verdict

VERDICT: Needs revision

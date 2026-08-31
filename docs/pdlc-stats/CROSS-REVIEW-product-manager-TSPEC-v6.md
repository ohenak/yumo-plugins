# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 6 (erratum round 4 continuation — delta confirmation)
**Scope of this round:** the erratum delta only, plus a re-grounding of every claim this
document makes about upstream **as upstream reads at HEAD** (DEC-ERR-03). Not a re-review.

## What was checked

The dispatch reports the routed item as **absorbed upstream at HEAD**, with nothing left to
confirm from the item list. Per DEC-ERR-03 that makes the item list necessary but not
sufficient, so this round is scoped to two questions:

1. Does the delta that did land resolve cleanly without breaking anything previously approved?
2. Is the TSPEC still a faithful compression of REQ and FSPEC **as they read now**?

The second question is the live one this round. Between my v5 reviewed commit (`e952268bd`) and
HEAD, **FSPEC moved v1.4 → v1.5** (`0b8864d6…` → `25af3c47…`, 109 lines). My v5 prose stated the
upstream was unchanged; the anchors the workflow stamped on that file already carried the v1.5
hash. So a real upstream move sits between my last substantive reading and this one, and I
re-derived it rather than trusting either statement.

REQ is unchanged at `60a516fb…`, matching the dispatch and my v5 anchor.

## Upstream re-grounding (DEC-ERR-03)

I read FSPEC v1.5 in full at HEAD and diffed it against the v1.4 bytes I last reviewed. Every
hunk is rationale and framing; no rule cell, exit code, edge-case outcome or acceptance test
changed. TSPEC v1.4's changelog claims about that move are accurate, and I verified each rather
than reading it:

| TSPEC v1.4 claim about FSPEC v1.5 | Verified |
|---|---|
| §7.3 is now a settled record of five closed errata, E-1…E-5 | Yes — the table is headed "all closed" and each row names FSPEC sites that **stand unchanged** |
| Stale "live disagreement" framing corrected at §1, BR-06, BR-12, BR-27, EC-09, §7.1 D-8/D-9 | Yes — those are exactly the hunks in the diff, and they are the only prose hunks outside §7.3 |
| No behavioural change to any rule, exit code or acceptance test | Yes — I checked the decision columns of D-8/D-9 and the outcome cells of EC-09/EC-10/EC-11 byte-for-byte; unchanged |
| Nothing in TSPEC §3–§6 needs re-deriving | Yes, and for the stated reason: this document never narrated those six sites as live divergences |
| §4.3 already states BR-11/BR-16 as specified behaviour | Yes (absorbed at v1.2). BR-11, BR-16, AT-12 and AT-17 are untouched by v1.5 — the only diff lines naming them are inside §7.3 itself, so §4.3's citations "at v1.4" remain true statements at v1.5 |
| §5's `no_docs_root` row already carries D-9/BR-30 | Yes — TSPEC §5's row matches FSPEC EC-09's current text (one message, naming the root and which condition; BR-30's object on stdout under `--json`) |
| E-2's C-5 carve-out for post-mortem *discovery* leaves §4.3's halt matcher untouched | Yes. FSPEC now says C-5 "carves the discovery of *which* phases have a post-mortem out of fidelity"; the basename form and the fail-closed `RESOLVED:` reading are unchanged, and TSPEC reaches post-mortems by that same documented basename form. §4.3's matcher and its `open`-on-throw behaviour still trace |
| §8.3's one remaining open erratum (FSPEC BR-26/EC-10) is not among E-1…E-5 and stands | Yes. FSPEC EC-10 at HEAD still reads "in neither the exclusion set nor recognizable as a feature" — no positive recognition predicate. The two Low items FSPEC §7.3 records as routing nowhere are REQ-STATS-02's enumeration and REQ-STATS-08's separator; neither is this one |
| E-5's now-settled zero-state row is what §8.3's EC-03/AT-26 argument rests on | Yes, and TSPEC cites the right anchors: FSPEC EC-03 makes a readable-but-empty directory a normal measured row and AT-26 is the test that pins it (EC-03 ↔ AT-26 in FSPEC's own matrix) |

**Verdict on re-grounding:** the document is still a faithful compression of REQ v1.4 and
FSPEC v1.5. No acceptance criterion is narrowed, broadened, reinterpreted or dropped, and
nothing the TSPEC cites has stopped saying what the TSPEC says it says.

## The delta

Two edits land, both narrow, both in the class the round declared (`+31 −6`):

**(a) §1's co-change cost.** The sentence still said "four vendoring enumerations" — a count
v1.2/v1.3 had already corrected to ten at §2.1, §6.4, §7.3 and RK-1 but had missed at §1. It now
cites §2.1's derived ten and explicitly hands ownership of the count to §2.1 rather than carrying
a second number. This is the right fix shape: one owning site, everywhere else a citation. It is
also exactly the class of defect `pdlc-engineering-loop`'s LEARNINGS names (verbatim restatement
across sites is a defect generator), so removing the second number is worth more than correcting it.

**(b) §6.4's "the first of the four enumerations."** Disambiguated as the four **script-side**
sites, §2.1's sites 1–4, so it cannot be misread as disagreeing with the ten. I verified the
subset against the code rather than against §2.1: `assertAdditiveOnly` in
`pdlc/engine/__tests__/loop-distribution.test.js` has exactly four call sites, over
`prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`,
`_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` and `fixture-machine.mjs`'s
`WORKFLOW_MODULE_NAMES` — the four the sentence names, in §2.1's site order. The claim that this
oracle reaches a subset and not the ten is true as written. §6.4's "sites 8 and 9" for
`run.test.js` and `learningsPremises.test.js` also indexes §2.1's table correctly.

I re-derived §2.1's ten-site arithmetic while I was there, since edit (a) now depends on it:
five enumeration files carrying six symbol edits (`_tspec-packed-set.mjs` holds two), four test
files that pin them, and `pdlc/README.md` as the tenth — 5 + 4 + 1 = 10, and the table's rows
1–10 are exactly those. The two `docs/completed/pdlc-engine-distribution/` rows are additional
to the ten, which is consistent with the sweep's stated filter (it excludes `docs/` artifacts).

No behavioural claim, type, signature, oracle or code sketch moved. Nothing I approved at v1.3
or v5 was narrowed or dropped. **The delta resolves what it set out to resolve.**

## Delta-Confirmation Findings

Four findings, none High. The two on the delta are precision defects in the sentences the round
edited; the two inherited ones are carried forward for the record and gate nothing.

| ID | Severity | Provenance | Locality | Section anchor | Finding |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §1, the co-change cost sentence | The new sentence reads "a co-change across the **ten** sites §2.1 derives (six symbol edits across five in-repo enumeration files, four further pinning sites, and `pdlc/README.md`'s un-oracled prose enumeration), **including** a carve-out against a completed sibling feature's frozen packed-set table". The parenthetical is 5 + 4 + 1 = 10 and leaves no room for the sibling-feature edits, so "including" places inside the ten something §2.1 places outside it — §2.1's own derivation ends "and the tenth is `pdlc/README.md`'s prose enumeration", and RK-1's residue item (ii) calls README "the tenth site". The pre-edit sentence used "and", which was correct on this point. An implementer costing the change off §1 reads twelve edits as ten. Restore the coordinating "and" (or say "plus"), leaving the ten as §2.1 derives them. |
| F-02 | Low | delta | local | §6.4, "four **script-side** enumerations" | The four sites named are correct — I verified all four against `assertAdditiveOnly`'s call sites — but "script-side" is not true of the set: three live in `pdlc/engine/scripts/`, the fourth is `pdlc/engine/__tests__/_tspec-packed-set.mjs`, a test-tree file. §2.1 separately uses "test files that pin those enumerations" for sites 6–9, so a reader can reasonably take "script-side" as excluding anything under `__tests__/` and conclude the sentence names a different four than it does. Since this word exists solely to disambiguate a miscount, it should not need disambiguating itself: "the four enumerations `assertAdditiveOnly` reads (§2.1's sites 1–4)" says it by its falsifier instead of by its directory. |
| F-03 | Low | inherited | nonlocal | §7.3 RK-1, opening clause | RK-1 opens "The ten-site vendoring co-change (§2.1) is done partially — including the two sibling-feature document edits…", using the same "including" F-01 flags, against the same ten. RK-1's own residue item (ii) then names README the tenth, so the row is internally inconsistent. Untouched this round, so non-gating, but it is the second site of one wording defect and both should move in whichever edit fixes F-01 — fixing only §1 leaves the misleading reading alive at the risk row. |
| F-04 | Low | inherited | nonlocal | §2.1, `learningsPremises.test.js` row | Unresolved from my v5 F-01, and correctly so — it did not warrant a round of its own. The row still quotes P-1's title as "exactly four workflow modules"; the shipped title at `learningsPremises.test.js:78` is `MODULE_NAMES is exactly the four canonical workflow modules`. No assertion is affected. Fold into the next versioned edit or leave. |

FINDING: Medium | delta | local | §1's co-change cost sentence, the word "including" | The edited sentence cites §2.1's ten sites and then decomposes them as 5 + 4 + 1 = 10, but joins the sibling-feature packed-set carve-out with "including", placing inside the ten an edit §2.1 and RK-1's residue item (ii) both place outside it (README is "the tenth site"). The pre-edit "and" was correct here. An implementer costing the co-change off §1 reads twelve edits as ten; restore the coordinating conjunction.

FINDING: Low | delta | local | §6.4's "four script-side enumerations" | The four sites named are correct against `assertAdditiveOnly`'s four call sites, but "script-side" does not describe the set: three sit in `pdlc/engine/scripts/`, the fourth is `pdlc/engine/__tests__/_tspec-packed-set.mjs`. §2.1 calls sites 6–9 "test files", so "script-side" invites the reading that this four excludes anything under `__tests__/`. Name the subset by its falsifier — "the four enumerations `assertAdditiveOnly` reads (§2.1's sites 1–4)".

FINDING: Low | inherited | nonlocal | §7.3 RK-1's opening clause | RK-1 says the ten-site co-change is done partially "including the two sibling-feature document edits", the same mis-scoping as F-01 and against the same ten, while its own residue item (ii) names `pdlc/README.md` the tenth site. Untouched this round and non-gating, but it is the second site of one defect; move it with F-01 so the fix does not leave the misleading reading alive at the risk row.

FINDING: Low | inherited | nonlocal | §2.1's `learningsPremises.test.js` row, P-1 title quote | Carried from v5 F-01, still open and still not worth a round of its own: the row quotes the title as "exactly four workflow modules" where the shipped title at `learningsPremises.test.js:78` is "MODULE_NAMES is exactly the four canonical workflow modules". No assertion is affected; quote it verbatim or drop the quotation marks in the next versioned edit.

## Questions

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 5 (delta re-review of the v0.3 revision answering my v4 findings)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · PLAN `sha256:4510f9c3f12b…` (v0.5) · DECISIONS
`sha256:56617f5ab31a…` · PROPERTIES under review `sha256:6d74d3eb5a23…` (**v0.3**), branch
`feat-pdlc-learnings-injection` at `1533cf38`.

## Overview

**Question answered.** My v4 recorded one High, one Medium and two Lows against PROPERTIES v0.2 and
recommended Needs revision on a single narrow item: the document had excluded `maxBytes = 0` from
`PROP-BOUND-03` and §O.9's generated domain, against TSPEC v0.9's T-O-6 instruction, and then
recorded the obligation as discharged anyway. This round the bytes moved to **v0.3** — seven commits
(`64a9940b` … `48fd5ba5`), **73 insertions / 38 deletions**
(`git diff 0fb3380e..HEAD -- …PROPERTIES-…md`). The question is whether all four findings are closed
and whether the revision broke anything.

**All four are closed, and the High is closed exactly as upstream asked rather than as I asked.**

1. **F-01 (High) → closed.** `PROP-BOUND-03` is now *"stated over every non-negative
   `maxBytesPerDocument`, zero included"*, and the carve-out is written as a **positive** four-field
   conjunct: at `maxBytes <= 0` the unit *"**must** return `{material: "", bounded: false, bytes: 0,
   sections: []}` for every `text`, including one carrying all five priority sections"*. That is a
   verbatim transcription of TSPEC §I.3's JSDoc contract (`TSPEC-…md:579-581`: *"`maxBytes <= 0`
   short-circuits BEFORE the cut and returns `{material: "", bounded: false, bytes: 0, sections: []}`
   for every `text`"*) and of T-O-6's instruction (`TSPEC-…md:1511`: *"**The bound domain includes
   `0`, and the property must state its carve-out**  … State the zero conjunct, keep `0` in the
   domain"*). §O.9's generator domain is restored to *"every non-negative `maxBytes`, `0` included"*.
   The grep that failed at v4 now passes: `grep -c 'bounded: false'` returns **2**, at
   `PROPERTIES-…md:241` (the property) and `:1118` (§G.1's T-O-6 row).
2. **F-02 (Medium) → closed, and closed better than the fix I proposed.** I predicted that with F-01
   applied, §G.3's *"Still open: nothing"* would simply become true. The author checked instead of
   assuming, and found the sentence was untrue for a *different* reason: an AT-15 bullet sat orphaned
   **below** it, stranded when the v0.2 revision struck the two items TSPEC v0.9 had answered. §G.3
   now reads *"**Still open — one item, re-routed this round**"*, names the bullet, and says plainly
   what happened: *"The v0.2 revision struck the two items TSPEC v0.9 answered and wrote 'Still open:
   nothing' above this bullet, which left it orphaned and the sentence untrue."* Finding a second,
   real defect while closing the first is the outcome I want from a revision round.
3. **F-03 (Low, Process) → no document edit required**, as stated; carried to harvest below.
4. **F-04 (Low) → closed.** §C.4 now separates the two subjects: *"Seven of the fourteen **files**
   have landed. The **tasks** committed so far are LI-01…LI-04, LI-07, LI-08, LI-09 and LI-13 — eight
   ids against seven rows, because LI-04 owns none of the fourteen: its artifact is the
   `/.baseline-worktree/` ignore rule."* Verified: `git ls-files pdlc/workflows/__tests__ | grep -i
   learn` returns exactly **7** files, and `.gitignore:13` carries `/.baseline-worktree/`.

**What the revision broke.** Nothing that gates. The delta touched six passages, and I re-derived each
against repository state: `PROP-BOUND-03`, `PROP-BOUND-05`'s oracle, §O.5's L3 table, §O.9, §C.4, and
§G.1/§G.2/§G.3. Two small things did not survive that check — a routing claim in §C.4 whose erratum
never reaches §G.3's routed list (F-01 below, Medium), and four citations that place T-O-6 in the
wrong TSPEC section (F-02, Low). Neither touches a property's content, an AC's coverage, the AT
partition or the PLAN task map.

**Answer in one line.** The one High is closed against upstream's own words rather than paraphrased,
the Medium turned up a defect I had missed, and what remains are two record-keeping items that cost a
sentence each — **Approved with minor changes**.

**Method.** Read my v4; took `git diff 0fb3380e..HEAD` on PROPERTIES (111 changed lines); verified every
changed claim against repository state rather than upstream prose alone — `TSPEC` §I.3 (`:570-590`),
T-O-6 (`:1511`), §T.5's suite table (`:1200-1218`) and AT-11 oracle table (`:1247-1262`); `FSPEC`
AT-11 (`:855-863`) and AT-15 (`:882-887`); `PLAN` LI-07 (`:146`), LI-08 (`:147`) and P-A-7 (`:558`);
`git ls-files pdlc/workflows/__tests__`; `wc -c` on the landed block suite. Unchanged sections I
approved at v1/v2/v4 are not re-litigated.

## Properties

Two properties changed. Both are in the delta's blast radius, and both hold.

### P.1 `PROP-BOUND-03` now transcribes T-O-6 instead of arguing with it — F-01 (v4) closed

The v0.2 form scoped the property to `> 0` and justified the exclusion from the *un-amended*
cut-and-flag reading — the reading TSPEC §D.5 had already carved out. The v0.3 form does the
opposite, and the difference is not cosmetic:

> **At `maxBytesPerDocument <= 0` the carve-out conjunct holds instead, and it is positive rather
> than an exclusion:** `extractInjectableMaterial(text, maxBytes)` tests the bound *before* the cut
> and **must** return `{material: "", bounded: false, bytes: 0, sections: []}` for every `text`,
> including one carrying all five priority sections.

Four things make this the right closure rather than a compliant one:

- **It is a positive oracle, not an exclusion.** Four asserted fields, on a fixture *carrying all
  five sections* — so a fixture that would green vacuously (a section-less document) cannot satisfy
  it. This is the same discipline `PROP-CONFIG-09` established at v0.2, applied one altitude down.
- **It states why `bounded` is `false` rather than leaving it to look like an inconsistency.** *"No
  cut occurs, so `bounded` is **false** — the 'bounded exactly when cut' conjunct holds precisely
  because nothing was taken."* T-O-6 says the same thing in the same shape (`TSPEC-…md:1511`: *"no
  cut, so `bounded` is false, and the 'bounded exactly when cut' conjunct holds only because nothing
  was taken"*). A reader who meets the property without T-O-6 in hand reaches the same reading.
- **It resolves the altitude confusion that produced the v4 defect.** *"No `maxDocuments` slot
  question arises at this altitude at all: the drop and its `RSN-NO-MATERIAL` reason (FSPEC E-36,
  BR-9) are the **caller's** decision, observable only in a finished report. That run-level half is
  owned by **PROP-CONFIG-09**. The two properties **partition** §D.5's inputs rather than duplicating
  each other."* The v0.2 rationale had mixed a unit-level return with a run-level slot; naming the
  partition is what stops that recurring.
- **Its cost claim is checkable and checks out.** *"The zero case costs one added case in
  `pdlc/workflows/__tests__/learningsBlock.test.js` (landed, 7.6 K) under the **existing** LI-08 red
  / LI-17 green tasks — no new fixture, no new PLAN task, no new AT id, no new property id."*
  Verified: the file is tracked (`git ls-files`) and `wc -c` reports **7744** bytes; PLAN's LI-08 row
  (`PLAN-…md:147`) and LI-17 exist and are unamended by this delta; the unique property count is
  unchanged at **70** (`grep -o "PROP-[A-Z]*-[0-9]*" | sort -u | wc -l` ⇒ 70).

The trace line widens correctly too — `AC-4.4`, `E-36` and `TSPEC §I.3` are added alongside the
existing `AC-2.3, BR-6, E-15, E-16, AT-11, AT-12, §D.5`, which is exactly the set of upstream clauses
the new conjunct answers to.

### P.2 `PROP-BOUND-05`'s intersection oracle is a strengthening, not a relaxation

The oracle changed from *"equals `BR6_SECTION_NAMES`"* to *"equals — as an **ordered** list — the
**priority-ordered intersection** of `BR6_SECTION_NAMES` with the headings the fixture document
actually carries, hand-transcribed for the fixture at hand rather than derived at runtime."* I read
this against the completeness bar (set equality over the full enumeration, so a deleted case reds)
before accepting it, because "intersection" is the shape a weakened oracle usually takes.

It is not weakened, on three grounds:

- **On AT-11's own fixture the assertion is still over the full catalogue.** FSPEC AT-11's third
  clause is stated over *"an unbounded document carrying all six conventional sections"*
  (`FSPEC-…md:860-864`), so the intersection *is* all five — and the property says so explicitly:
  *"On AT-11's fixture, which carries all five, that intersection *is* the full `BR6_SECTION_NAMES`
  catalogue."* Set equality over the full enumeration survives where the AC puts it. TSPEC's AT-11
  oracle row states it the same way (`TSPEC-…md:1252`, *"assert the resulting list equals
  `BR6_SECTION_NAMES` — as an **ordered** list"*).
- **The generalisation is upstream's own, and it buys AT-11's *second* document.** T-O-6's
  corpus-driven conjunct reads *"`sections` equals the intersection of `BR6_SECTION_NAMES` with the
  level-2 headings it carries, ordinals and an optional trailing gloss ignored"* (`TSPEC-…md:1511`),
  and FSPEC AT-11's second document is *"one missing some of BR-6's priority sections"* which *"contributes
  its present sections in priority order"*. The v0.2 wording would have demanded all five of a fixture
  the AC says carries fewer. The intersection form covers both documents of the AC; the old form
  covered one.
- **"Hand-transcribed … rather than derived at runtime" is the anti-echo clause, kept.** The expected
  value stays a literal transcription; nothing computes it from the code under test, and the DC-14
  sentence demoting `sections[]` to a supporting equality (*"**in addition** … **never instead**"*)
  is untouched.

Everything else in Groups A–H is byte-identical to what I approved at v4, and the two properties'
own untouched conjuncts — the character-safe prefix, the Approval-Record absence paired with the
five body-marker presences, `PROP-BOUND-06`'s two driven disjuncts — are unchanged.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

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

The matrices are where a partially-absorbed upstream showed up as a false claim at v4, so I checked
each changed row against the artifact it summarises rather than against its neighbours.

| Oracle / matrix row | Claim it makes | Verified against | Holds? |
|---|---|---|---|
| **§G.1 T-O-6 row** *(rewritten)* | both arms stated over *"every non-negative `maxBytes`, `0` included"*; the partition is *"by **observable, not by input**"* — PROP-BOUND-03 owns the unit's whole return domain, PROP-CONFIG-09 owns *"the run-level consequences that no unit can produce"*; *"No input of §D.5 is unclaimed, and no observable is claimed twice"* | `TSPEC-…md:1511` (T-O-6), `:579-581` (§I.3) | **Yes.** This is the v4 F-01 fix and it is the strictly stronger claim I asked for: the row now asserts coverage of the zero return *and* the reason id *and* the slot, where v0.2 asserted the boundary was not this unit's at all. "No observable is claimed twice" is a real disjointness claim, and it holds — the unit arm asserts four return fields, the seam arm asserts a reason id and a slot count |
| **§O.9 T-O-6 generated arm** *(rewritten)* | domain is *"every non-negative `maxBytes`, `0` included, stated explicitly rather than left to the draw"*, quoting T-O-6 | same | **Yes.** The domain matches upstream verbatim. The added argument is the one that was missing at v0.2: *"The zero bound is **not** absence-shaped at this unit and so does not meet §O.5's L3 test: it is a four-field positive return value … which the unit both can and must falsify"* |
| **§O.9 shape answer (SE Q-01)** | the zero conjunct rides as *"a **guarded branch inside the same property body**"* **and** `0` is *"additionally **pinned as a distinguished example case** in the same suite rather than left to sampling frequency, so LI-08's red is reproducible on any seed"* | my v4 Q-01, which asked exactly this and said it should be stated rather than left to the implementer | **Yes — and it takes both branches of my question rather than choosing.** Generated coverage keeps the boundary in the domain by construction; the pinned example makes the red seed-independent. A generator that draws `0` with probability ~0 would otherwise have satisfied the letter of T-O-6 and proved nothing |
| **§O.5 L3 table** *(new row)* | *"**Six** claims are placed at L3"*; PROP-CONFIG-09 added with the note that *"only the **run-level** half of the zero bound is L3 … The unit-level half is **not** L3 and is not placed here"* | the table itself | **Yes.** Six prose, six rows (`awk '/### O.5 /,/### O.6 /' | grep -c '^| PROP'` ⇒ **6**). The row is doing real work: it forestalls exactly the misreading that produced v4's F-01, by recording *why* one half of a boundary sits at the seam and the other does not |
| **§C.4 file/task split** *(rewritten)* | seven files, eight task ids, LI-04's artifact is `/.baseline-worktree/` | `git ls-files pdlc/workflows/__tests__` ⇒ 7 `learnings*` entries; `.gitignore:13` | **Yes — v4 F-04 closed.** The two subjects are now separated in the sentence rather than reconciled by the reader |
| **§C.4 SE Q-02 answer** *(new)* | PROP-BOUND-05/07/08's amendments land in a **committed** suite, so they are *"a re-red on landed green code rather than a fold into LI-16/LI-17's green tasks — which is exactly PLAN P-A-7's case"* | `PLAN-…md:558` (P-A-7: *"a live table is amended by an edit to this PLAN, committed before the run it governs"*); `learningsBlock.test.js` tracked at HEAD | **Yes on the substance** — the classification is correct and P-A-7 is the right rule. **See F-01 below** for the routing half of the same sentence |
| **§G.3 "Still open — one item"** *(rewritten)* | the AT-15 suite-assignment mismatch is still open and re-routed; the v0.2 "Still open: nothing" is retracted with its cause named | `TSPEC-…md:1209` (`learningsSelect.test.js` row: `AT-04 … AT-15 … AT-28`, count 9, layer **L1**); `FSPEC-…md:882-887` (AT-15 clauses 2–3 are report-level); `PROPERTIES-…md:162` (PROP-CORPUS-03 traced *"L1 (clauses 1, 4) + L2/L3 (clauses 2, 3)"*); `PLAN-…md:146` (LI-07 splits the green, `LI-AT-15` *"stays red until LI-19"*) | **Yes — v4 F-02 closed, and the underlying mismatch is real.** Four documents agree the AT is split across levels and only TSPEC's suite table says otherwise. Routed as an ERRATUM in my final message |
| §G.2 gap 1 *(amended)* | records that the `>= 1` exclusion *"is retracted"*, naming it as an episode: *"an earlier revision of this document briefly excluded `0` from both, which TSPEC v0.9 §T.5 had already rejected in terms"* | my v4 F-01 | **Yes.** Recording the retraction in place, rather than silently restoring the domain, is what makes §G.2 worth reading — and it is the honest version of the same instinct that made §G.2's earlier episodes valuable |
| §G.3 ERR-8 non-duplication; §G.1 T-O-4 / T-O-5 rows; §C.1 35-of-35 partition; §C.3 task map | unchanged | not in the delta | **Unaffected.** The AT partition is intact, the property total is unchanged at 70, and no PLAN task row moves |

**The one oracle-level statement that does not reconcile.** §C.4 says the PLAN's ledger-row naming
*"is routed as an erratum, not decided here"* — but §G.3, whose first line is *"Emitted as line items
in this dispatch's final message"*, carries exactly one still-open item and it is the AT-15 one.
`awk '/### G.3 Routed errata/,0' | grep -n "ledger\|LI-08\|PLAN"` returns only the AT-15 bullet's
own lines. So the document asserts a routing that its own routing section does not carry. The
substance is right and the erratum is worth routing — which is why I emit it myself in my final
message rather than leaving it to the sentence — but a claim of routing with no route is the kind of
record-keeping gap that survives into implementation as "someone must have handled it". That is F-01
below, Medium.

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

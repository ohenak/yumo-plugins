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

**No fixture changed in this delta, and none needed to.** §F.1's inventory, the `ZERO-BOUND` /
`NO-MATERIAL` pairing added at v0.2, the `3/5/0` literals in `COUNT-BINDING` / `BYTES-BINDING`, the
`MULTIBYTE-BOUND` draw, and §F.4's seam doubles are byte-identical to the state I approved at v4
(`git diff 0fb3380e..HEAD` touches no line inside §F).

That is the correct outcome and worth stating rather than passing over, because the v4 High could
easily have been closed the expensive way. Restoring `0` to the domain of a *generated* property is
the kind of edit that invites a new fixture — a zero-bound corpus, a new `{caseId}`, a new baseline
digest to hand-transcribe. It did not, for the reason my v4 predicted and the revision confirms in
the property itself: the zero-bound conjunct is asserted over *"every `text`, including one carrying
all five priority sections"*, and a document carrying all five is already in the suite. The document
draws the consequence explicitly — *"no new fixture, no new PLAN task, no new AT id, no new property
id"* — and every clause of that sentence checks out against repository state (`learningsBlock.test.js`
tracked at 7744 bytes; PLAN's LI-08/LI-17 rows unamended; the AT inventory still 35; the unique
property count still 70).

One consequence for the fixture that *does* carry the run-level half. `ZERO-BOUND` remains
`PROP-CONFIG-09`'s positive control and its role is unchanged, but §G.1's rewritten row now makes the
division of labour explicit in a way the fixture inventory benefits from: `ZERO-BOUND` proves the
*reason id and the unconsumed slot*, and it is no longer also carrying the boundary's only proof.
Before this delta, if `ZERO-BOUND` had ever been dropped or narrowed, the zero bound would have had
no oracle at any level. Now it has two, at two altitudes, on fixtures that fail independently — which
is the property a reviewer of a future fixture edit actually needs.

The `PROP-BOUND-05` oracle change also touches fixtures indirectly and safely: *"hand-transcribed for
the fixture at hand rather than derived at runtime"* keeps the expected value a literal, so no
fixture gains a runtime-derived expectation, and the narrower-fixture case now has a stated expected
value where v0.2 would have demanded the full catalogue from a document that never carried it.

§F.3's heading-recognition transcription — the three numbered clauses I verified against TSPEC §D.3
at v4 — is unchanged, and remains the strongest passage in §F.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§C.4 states that the PLAN's expected-red ledger naming *"is routed as an erratum, not decided here"*, but §G.3 — the section whose opening line is *"Emitted as line items in this dispatch's final message"* — does not carry that item.** §G.3's still-open list has exactly one bullet, the AT-15 suite assignment; `awk '/### G.3 Routed errata/,0' PROPERTIES-…md \| grep -n "ledger\|LI-08\|PLAN"` matches only that bullet's own text. The substance of §C.4's claim is correct and I verified it: PROP-BOUND-05/07/08's amendments land in `learningsBlock.test.js`, which is tracked at HEAD, so they re-red a landed suite; PLAN P-A-7 (`PLAN-…md:558`) rules that *"a live table is amended by an edit to this PLAN, committed before the run it governs"*; and PLAN's LI-08 v0.5 amendment note (`PLAN-…md:147`) assigns the follow-up commit to the existing owners without naming the ledger rows. The gap is that a routing is asserted in one section and absent from the section that routes, so the item reaches no author unless a reviewer notices. **Fix:** add the bullet to §G.3's still-open list, in the same form as the AT-15 one — *"PLAN's expected-red ledger does not name rows for the re-red of the landed `learningsBlock.test.js` that PROP-BOUND-05/07/08's amendments cause; P-A-7 requires the naming to be an edit to the PLAN, committed before the batch it governs."* I emit it as an ERRATUM from this review regardless, so the fix is bookkeeping inside this document, not a dependency for the phase. | AC-2.3; PLAN P-A-7, LI-08; TSPEC §T.5 |
| F-02 | Low | Local | **T-O-6 is cited as living in TSPEC §T.5 in four places; it does not.** `PROPERTIES-…md:250`, `:710`, `:789` and `:1118` write *"TSPEC §T.5, T-O-6"* / *"TSPEC §T.5's T-O-6 instruction"*. T-O-6 sits at `TSPEC-…md:1511`, under `### Named obligations carried forward` inside `## Open Questions` (`:1434`); §T.5 is inside `## Test Strategy` (`:1052`) and ends before `:1434`. Every **quotation** from T-O-6 in those four places is verbatim-correct — I checked each against `:1511` — so this is a locator error, not a fidelity error, and nothing downstream of it is wrong. It matters only because these four are the citations an implementer will follow to decide what the zero-bound conjunct must assert, and §T.5 is a plausible-looking wrong destination: it is the suite-mapping section, so a reader who lands there and finds no T-O-6 may conclude the obligation moved. **Fix:** cite it as *"TSPEC, Named obligations carried forward, T-O-6"* (or by its spec id alone, which is unambiguous) in all four places. | TSPEC T-O-6 |
| F-03 | Low | Process | **Carry-forward of my v4 F-03, restated because it earned a second data point this round.** The rule: *a reviewer finding is as version-bound as an erratum, and is re-grounded against upstream at HEAD before it is implemented.* v4's High existed because a finding raised against TSPEC v0.7 was implemented after TSPEC reached v0.9. This round supplies the complementary case, and it is the one worth harvesting: closing my F-02 required the author to **re-check a sentence I had told them would become true automatically**, and it was not — an orphaned AT-15 bullet made *"Still open: nothing"* false for a reason neither of us had seen. Generalised: **a reviewer's predicted-consequence ("with (1) applied, (2) resolves itself") is a hypothesis to verify, not an instruction to apply.** Both halves belong in harvest as one process learning about the version- and assumption-boundedness of review findings. No edit to this document is required. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §G.1's T-O-6 row now claims *"no observable is claimed twice"* between PROP-BOUND-03 and PROP-CONFIG-09. I read that as true today. Is it worth stating as a **checkable** disjointness rather than a prose claim — e.g. that the unit arm asserts exactly the four return fields and the seam arm asserts exactly `reason` and slot occupancy — so that a future widening of either property has something to red against? Not a finding; the prose is accurate. But this document's own best pattern is turning a claim into an oracle, and this is the last claim in §G.1 that is still prose. |
| Q-02 | With `PROP-BOUND-05`'s oracle now stated as an intersection, the expected list is per-fixture and hand-transcribed. That is right for AT-11 (all five) and for a narrower fixture. What happens when a **fixture gains a section** — say the corpus document behind `PROP-BOUND-08` acquires `## Process Learnings` in a later harvest? The transcribed expectation goes stale silently in the passing direction only if the implementation also misses it; otherwise it reds loudly, which is the good failure. I think this is fine, but §F.2's re-capture rule is the place a reader would look for the answer and it does not currently mention section-set expectations. Worth one sentence there? |
| Q-03 | §C.4's SE Q-02 answer classifies the PROP-BOUND-05/07/08 amendments as a re-red of landed green code under P-A-7. Does that mean the PROPERTIES suite's own commit timing changes — i.e. is the amendment expected to land **with** the ledger edit in the same commit, or does P-A-7's *"committed before the run it governs"* mean the PLAN edit strictly precedes it? The distinction decides whether one dispatcher run sees a red row with no ledger entry, which is the halt P-A-3 exists to prevent. Worth pinning in §C.4 once F-01's erratum comes back answered. |

## Positive Observations

- **The High was closed against upstream's own words, not paraphrased into compliance.** The v0.3
  `PROP-BOUND-03` states the zero return as four literal fields *"for every `text`, including one
  carrying all five priority sections"* — the exact shape T-O-6 dictates, on the exact fixture class
  §I.3 names. The revision could have satisfied my finding with a sentence saying the boundary is
  covered; it wrote the conjunct instead.
- **The Medium turned up a defect I had missed, because the author verified my prediction instead of
  applying it.** I wrote that once F-01 landed, §G.3's *"Still open: nothing"* would become true and
  need no edit. It would not have: an AT-15 bullet sat orphaned below the sentence, stranded when
  v0.2 struck two answered items. §G.3 now names the item, re-routes it, and records the cause in
  plain terms. A reviewer's predicted consequence treated as a hypothesis is worth more than one
  treated as an instruction, and this is the round that demonstrates it.
- **The retraction is recorded as an episode rather than quietly reverted.** §G.2 gap 1 now reads
  *"an earlier revision of this document briefly excluded `0` from both, which TSPEC v0.9 §T.5 had
  already rejected in terms; that exclusion is retracted."* Nothing forced that sentence — the domain
  could simply have been restored. Keeping the wrong turn visible is the same instinct that made
  §G.2's earlier gap entries the most transferable content in this document.
- **§O.5's new row fixes the class of error, not the instance.** The zero bound's two halves are now
  separated by a stated *test* — is the observable a positive return value a unit can produce, or a
  run-level decision only a report records — with PROP-CONFIG-09 placed at L3 for the second half and
  explicitly *not* placed there for the first. That is what stops the next boundary from being
  mislocated by the same reasoning that produced v4's High.
- **§O.9 answered the shape question by taking both branches.** My v4 Q-01 offered generated-with-zero
  or generated-plus-example and said the choice should be stated rather than left to the implementer.
  The document takes both — a guarded branch inside the property body *and* `0` pinned as a
  distinguished example *"so LI-08's red is reproducible on any seed"*. The seed-independence
  argument is the part I did not think to ask for and the part that makes the boundary undeletable.
- **The intersection oracle widened AT-11's coverage while I was watching for it to narrow.** The old
  form would have demanded all five priority sections from AT-11's *second* document, which FSPEC
  describes as *"one missing some of BR-6's priority sections"*. The new form covers both documents of
  the AC and keeps the expected value hand-transcribed. A change that looks like a relaxation and is
  in fact a fidelity fix is worth calling out, because the next reviewer will have the same reflex.
- **Every countable claim in the delta reconciles against repository state.** Seven landed test files,
  eight committed task ids with LI-04's `.gitignore` artifact named, `learningsBlock.test.js` at
  7.6 K, six L3 rows against "six claims", 70 unique property ids, 35 ATs. I checked each
  mechanically; none was off by one.

## Recommendation

**Approved with minor changes**

All four of my v4 findings are closed. The one that gated — `maxBytes = 0` excluded from
`PROP-BOUND-03` and §O.9 while §G.1 recorded the obligation as discharged — is closed at every one of
its three sites: the property states TSPEC §I.3's four-field zero return as a positive conjunct over
a fixture carrying all five sections, §O.9's generator keeps `0` in its domain with the guarded
branch *and* a pinned example so the red is seed-independent, and §G.1's row is rewritten as a
partition **by observable** that claims more coverage than the v0.2 row did, not less. §O.5 gains the
row that prevents the misreading from recurring. The Medium closed by finding a second real defect —
an orphaned AT-15 bullet that made *"Still open: nothing"* untrue — and re-routing it. Both Lows are
closed or carried as intended. No fixture changed, no property was added or retired, the AT partition
is still 35, the property count is still 70, and no PLAN task row moved.

What remains is two record-keeping items, neither gating:

1. **F-01 (Medium)** — §C.4 says the PLAN ledger-row naming *"is routed as an erratum"*; §G.3's routed
   list does not carry it. Add the bullet to §G.3 in the AT-15 bullet's form. I emit the erratum from
   this review regardless, so nothing waits on the edit.
2. **F-02 (Low)** — four citations place T-O-6 in TSPEC §T.5; it lives under *Named obligations
   carried forward*. The quotations are verbatim-correct; only the locator is wrong. Fix all four.
3. **F-03 (Low, Process)** — no edit here; carry to harvest the rule that both a reviewer's *finding*
   and a reviewer's *predicted consequence* are re-grounded against HEAD before they are acted on.

Two upstream items leave this review as ERRATUM lines — TSPEC's §T.5 suite table assigning AT-15
wholly to L1 against FSPEC's report-level clauses 2–3, and PLAN's LI-08 amendment note not naming the
expected-red ledger rows for the re-red of a landed suite. Neither is a defect of the document in
front of me, and neither is folded into this verdict.

Nothing here re-opens the phase, changes an acceptance criterion's coverage, or requires an upstream
edit before Phase P can close. Every REQ acceptance criterion still carries at least one property,
AC-4.4's three zeros are asserted at the seam with AC-2.3's zero bound now also asserted at the unit,
and the 35-member AT partition is intact.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6
APPROVAL-HASH-NORMALIZED: sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6
REVIEWED-COMMIT: 48fd5ba5c34aa2c89804172edc23f54c4eeffcb2
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d
UPSTREAM-STATE: TSPEC sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131
UPSTREAM-STATE: DECISIONS sha256:56617f5ab31a8158a33b702ec4a21e8cf1f167b9ef1d78c8e2793976a645bd32
UPSTREAM-STATE: PLAN sha256:4510f9c3f12b8c7b75ef5b2b9b20304e09879aa90542c51aae42c0b1e10c2d09

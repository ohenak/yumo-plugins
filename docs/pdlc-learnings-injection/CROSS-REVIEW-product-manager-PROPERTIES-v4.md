# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review of the v0.2 revision answering my v3 findings)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (**v0.9**) · PLAN `sha256:4510f9c3f12b…` (v0.5) · DECISIONS
`sha256:56617f5ab31a…` · PROPERTIES under review `sha256:273009beb4f0…` (v0.2).

## Overview

**Question answered.** My v3 was a delta confirmation over unchanged PROPERTIES bytes; it recorded
four findings (two Medium, two Low) and approved with minor changes. This round the bytes moved:
PROPERTIES is v0.2, twelve commits (`a9862bf6` … `0fb3380e`), **207 insertions / 62 deletions**
(`git diff 14fd8bce..HEAD -- …PROPERTIES-…md`). The question is whether my four findings are closed
and whether the revision broke anything.

**All four are closed, and closed well.** The revision did not paper over them; it re-derived the
affected passages against upstream at HEAD:

1. **F-01 → `PROP-CONFIG-09`.** A new property owns AT-30's third arm with four positive conjuncts
   (enabled run with BR-8 rows present and empty, **every** corpus document `RSN-NO-MATERIAL`,
   contributing count `0`, no slot consumed, none `bounded`). §C.1's AT-30 row, §C.3's LI-12/LI-21
   rows and §C.4's property count all absorb it; the count is now **70**, and `grep -o "PROP-[A-Z]*-[0-9]*" | sort -u | wc -l`
   returns exactly 70.
2. **F-02 → §G.2.2 rewritten** as "resolved upstream, no recomputation owed", with the conditional
   correctly resolved to *no change*, and the matching §G.3 bullet struck rather than left standing.
3. **F-03 → §F.3 rewritten.** The heading-recognition rule is no longer described as delegated-and-open;
   it is transcribed as decided, in three numbered clauses.
4. **F-04 → `PROP-BOUND-06` widened** to both of BR-9's disjuncts, with a `ZERO-BOUND` fixture paired
   against `NO-MATERIAL` so the reason id's *meaning* is falsifiable rather than one of its routes.

**What the revision broke.** In the same window, **TSPEC moved from v0.7 to v0.9** — a fact the
document itself discovered and recorded honestly in §G.3. The revision absorbed most of v0.9 (§D.3's
matcher into §F.3, the assembly rule into `PROP-BOUND-07`, the AT-11 oracle relocation into
`PROP-BOUND-05`/`08`) but **not** T-O-6's zero-bound instruction. Commit `727ffd62` narrowed §O.9's
generated domain to `maxBytes >= 1` in answer to a software-engineer finding raised against **TSPEC
v0.7**, and TSPEC v0.9's carried obligation says the opposite in terms: *"The bound domain includes
`0`, and the property must state its carve-out … State the zero conjunct, keep `0` in the domain"*
(`TSPEC-pdlc-learnings-injection.md` §G/T-O-6). §G.1's T-O-6 row then claims the obligation is
"discharged across the pair with no input of §D.5 unclaimed", and §G.3 closes with "**Still open:
nothing**". Both are false at HEAD. That is F-01 below, and it is the one High.

**Answer in one line.** The revision closes every finding I raised and improves the document's
oracles materially, but it also lands a **silent divergence from TSPEC at HEAD** in exactly the
place this document's earlier virtue was declaring divergences openly — so the round is Needs
revision on one narrow, cheap edit, not on any of the work it did well.

**Method.** Read my v3; took `git diff 14fd8bce..HEAD` on PROPERTIES (405 lines); verified every
changed claim against repository state rather than against upstream prose alone —
`git ls-files pdlc/workflows/__tests__`, `.gitignore`, `PLAN` v0.5's LI-08 amendment note,
`TSPEC` §I.3/§D.5/§T.5/T-O-6, `FSPEC` BR-9/E-36, and `docs/_constraints/DOMAIN-CONSTRAINTS.md` DC-14.
Unchanged sections I approved at v1/v2 are not re-litigated.

## Properties

Property by property, over the surface the revision touched.

### P.1 `PROP-CONFIG-09` is a good property, and it is the right shape

It asserts **four positive conjuncts** and says why: *"the distinguishing observable is the reason id
and the unconsumed slot, not the empty selection: an empty selection is what `maxDocuments: 0` and
`maxTotalBytes: 0` produce too."* That is the absence-only-oracle trap named and avoided at the
point where it would have bitten — a property that asserted only `selected` is empty would have been
satisfied by a disabled run, a refusal, and a crashed injector alike.

Three further things it gets right, each verifiable upstream:

- **The fixture must carry material.** *"A fixture of section-less documents would green through
  PROP-BOUND-06's first disjunct even if the zero bound were unimplemented."* This is the
  precedence-defeating requirement, and it is why `ZERO-BOUND` is specified as a **threshold override
  on an existing corpus fixture** rather than a new corpus shape.
- **Set equality, not containment.** The reject rows are asserted over **every** corpus document,
  matching TSPEC §I.2's *"a set equality over the reject rows (every enumerated non-self path present
  with `RSN-NO-MATERIAL`, none `bounded`), not merely an empty `selected`"* and PLAN v0.5's LI-12
  conjunct (ii), which says the same in the same words. Three documents agree; a deleted case reds.
- **It adds no AT id and no PLAN task.** Verified: PLAN v0.5's LI-12 row already reads
  *"`LI-AT-30` (**three** cases, one per zero threshold … **and `maxBytesPerDocument: 0`** (E-36))"*,
  and §C.3's LI-12 / LI-21 rows widen from `PROP-CONFIG-01…08` to `…09` without a new row. The
  35-member AT partition is untouched, so `PROP-META-05` does not red.

`PROP-CONFIG-04` gains the disambiguating sentence that the two properties **partition** AT-30 rather
than overlapping on it — which is what keeps §C.1's row honest now that it names two owners.

### P.2 `PROP-BOUND-03`'s new `> 0` precondition contradicts TSPEC at HEAD — F-01

The property is now *"stated where `maxBytesPerDocument > 0`"*, and the stated ground is:

> a property stated over all bounds would demand a zero-byte contribution flagged `bounded: true`
> occupying a `maxDocuments` slot, which no conforming implementation can also satisfy

That is a true statement about the **un-amended** cut-and-flag rule, and it is precisely the reading
TSPEC v0.9 identifies and **carves out**:

> Reading the unamended cut-and-flag rule … would give `{bytes: 0, bounded: true}` on a *selected*
> document — the shape FSPEC v0.13 explicitly carves out. (`TSPEC` §D.5, *The zero bound yields
> nothing*)

Upstream at HEAD does not leave the boundary to inference. TSPEC §I.3's contract for
`extractInjectableMaterial` states it at the unit:

> `maxBytes <= 0` short-circuits BEFORE the cut and returns `{material: "", bounded: false,
> bytes: 0, sections: []}` for every `text` — no cut occurs, so `bounded` is false, and the caller
> drops the document `RSN-NO-MATERIAL` (E-36, §D.5).

So a property stated over all non-negative bounds demands `bounded: **false**`, not `true`, and
demands nothing about a slot at this unit at all. The premise the precondition rests on is a
reading upstream retired before this revision was written (`daa43540`, 03:59; the PROPERTIES commit
that introduced the carve-out is `727ffd62`, 17:11).

**Why this is High rather than a wording nit.** T-O-6 is a *carried obligation* — upstream's
instruction to this document, phrased as an instruction:

> **The bound domain includes `0`, and the property must state its carve-out** (FSPEC v0.13, E-36)
> … A generated-bound property written from the cut-and-flag rule alone with `0` in its domain reds
> against a conforming implementation; **one written with `0` excluded loses the edge to AT-30's L3
> case with no unit-level oracle. State the zero conjunct, keep `0` in the domain.**

The revision took the second branch of a fork upstream had already closed, and then §G.1 records the
obligation as **discharged** — *"The obligation is discharged across the pair with no input of §D.5
unclaimed"* — while `grep -n 'sections: \[\]\|bounded: false' PROPERTIES-…md` returns **no match**:
no property in this document asserts the zero-bound return shape. The claim and the artifact
disagree.

### P.3 The other Group D amendments are faithful

- **`PROP-BOUND-05`** now reads the **rendered block**, not the extractor's own `sections[]`, mapping
  heading lines through §D.3's rule and asserting the result **equals `BR6_SECTION_NAMES` as an
  ordered list**. This transcribes TSPEC §T.5's AT-11 oracle verbatim, and the explicit DC-14 cite
  is correct — `docs/_constraints/DOMAIN-CONSTRAINTS.md:379` is *"An oracle never sources its
  expected value from the code under test"*. Demoting `sections[]` to a supporting equality
  ("**in addition**, … **never instead**") is exactly right: the producer's report of what it
  intended cannot falsify a renderer that takes a section and drops it.
- **`PROP-BOUND-07`** absorbs §D.3's assembly rule, so the hand-computed literal becomes a stated
  procedure — normalise each extent, join in priority order with `"\n\n"`, cut once — and the byte
  identity becomes *"the sum of each taken section's normalised byte length **plus 2 bytes per
  join**"*. This closes my standing worry about hand-computed literals: two conforming
  implementations can no longer split on the arithmetic, so a literal fixture cannot red a correct
  implementation. It also retires §G.3's AT-11 erratum at the source rather than by assertion.
- **`PROP-BOUND-08`** now checks *"a matcher upstream **specifies** rather than bounding exposure to
  one upstream left open"*, while keeping the real-corpus operand and the positive-presence conjunct
  on the document's own heading lines. The load-bearing half — a wrong-spelling matcher and a
  synthetic fixture written to the same wrong spelling red instead of greening together — survives
  the rewrite intact.
- **`PROP-BOUND-06`** carries both disjuncts and names the falsifier: *"an implementation reaching
  `RSN-NO-MATERIAL` by testing 'document carries no section' greens on `NO-MATERIAL` and reds on
  `ZERO-BOUND`."* That is a mutation argument, not a restatement, and it closes my v3 F-04 properly.

## Oracles

The matrices are where a partially-absorbed upstream shows up as a false claim, so I checked each
changed row against the artifact it summarises rather than against its neighbours.

| Oracle / matrix row | Claim it makes | Verified against | Holds? |
|---|---|---|---|
| §C.1 AT-30 row → `PROP-CONFIG-04`, `PROP-CONFIG-09`, `PROP-RECORD-02` | all **three** arms owned, the third with its every-document `RSN-NO-MATERIAL` conjunct | `TSPEC` §I.2 (*"AT-30 … upstream enumerates **three** zeros"*), `FSPEC` E-36 row | **Yes** — the row now matches the AT it claims; my v3 F-01 is closed |
| §C.1 "35 of 35"; §C.4 `FSPEC acceptance tests 35` | partition unchanged | E-36 rides on AT-30; no AT id added | **Yes** — `PROP-META-05`'s partition oracle does not red |
| §C.3 LI-12 / LI-21 → `PROP-CONFIG-01…09` | the new property needs no new task | `PLAN` v0.5 LI-12 (three AT-30 cases) and LI-21 (greens `learningsConfig.test.js`) | **Yes** — PLAN already carries the case; no re-approval owed |
| §C.4 property count **70** | 66 at v1 + 4 | `grep -o "PROP-[A-Z]*-[0-9]*" \| sort -u \| wc -l` ⇒ **70** | **Yes**, mechanically |
| §C.4 test-file inventory, "seven of fourteen landed" | re-measured at HEAD | `git ls-files pdlc/workflows/__tests__` ⇒ `helpers/learningsFixtures.js`, `learningsBlock`, `learningsCaptureScript`, `learningsCorpus`, `learningsPredicatePin`, `learningsPremises`, `learningsSelect` — **7** | **Yes** — see F-04 for one readability wrinkle in the task-id parenthetical |
| §C.4 "PLAN records the same thing … *an amendment to landed suites*" | PLAN agrees | `PLAN` v0.5 LI-08: *"**Amendment note (v0.5):** LI-02 and LI-08 have already landed on this branch … the heading-form cases are an amendment to those landed files, taken by their **existing owners**"* | **Yes** — and PLAN keeps ownership fixed, so the single-writer manifest is unchanged |
| §O.8 mutation M-5 | mutation away from FSPEC **and** TSPEC | `FSPEC` BR-6 material-only basis; `TSPEC` §D.5 | **Yes** — unchanged from my v3 reading, now cited on both sides |
| §G.1 T-O-4 / T-O-5 rows | unchanged obligations | TSPEC | **Yes** |
| **§G.1 T-O-6 row** | *"Both are stated over `maxBytes >= 1`"*, boundary *"routed to `PROP-CONFIG-09`"*, *"observables live at the workflow seam, **not at this unit**"*, obligation *"discharged … with no input of §D.5 unclaimed"* | `TSPEC` §I.3 and T-O-6 | **No — F-01.** §I.3 locates the zero-bound return **at this unit** (`{material: "", bounded: false, bytes: 0, sections: []}`), and T-O-6 instructs *"keep `0` in the domain"*. `maxBytes = 0` is an input of §D.5 that no property claims |
| §O.9 T-O-6 generated arm, *"domain is `maxBytes >= 1`"* | mirrors PROP-BOUND-03's precondition | same | **No — F-01.** The mirror is faithful; both sides of it diverge from upstream |
| §G.2 gaps 1 and 2, restated as *"resolved upstream … (not a gap)"* | the record of what closed and where it landed | FSPEC v0.13; my v3 F-01/F-02 | **Yes** — and retaining the episode rather than deleting it is the right call |
| §G.3 *"**Still open:** nothing"* | every routed item answered, no divergence remains | the §G.1 row above | **No — F-02.** The sentence is true of the *routed* list and false as the completeness claim it reads as |
| §G.3 ERR-8 non-duplication | *"re-raising it here would be the DEC-ERR-01 anti-pattern"* | `TSPEC` §D.5 and its ERR-8 record | **Yes** — TSPEC raises ERR-8 against FSPEC Step 5's 15/16 sequencing; PROPERTIES correctly declines to re-route it, and correctly notes outcomes agree at every bound so no property moves |

**The two oracle-level statements that fail, stated as the implementer will meet them.** A test
author reading §G.1 and §O.9 will write a `maxBytes` generator over `[1, ∞)` and will never write a
unit assertion for the zero return. AT-30's L3 case still catches the mutation TSPEC names
(*"Reverting §D.5's `maxBytes <= 0` short-circuit to the cut-and-flag path reds that fixture"*), so
this is not an unguarded regression — which is why F-01 is about a **false discharge claim and an
undeclared divergence**, not about a hole in the product's proof. But §G.1 is this document's
contract that *"no obligation is deferred to implementation"*, and that contract is what a reviewer
of the implementation will check against; leaving it overstated moves the cost downstream to
someone with less context than the author has today.

**What the fix is.** Three coordinated edits, all inside this document, none touching PLAN, TSPEC,
FSPEC or REQ, and none adding a task, an AT id or a fixture: restore `0` to `PROP-BOUND-03`'s and
§O.9's domain with the carve-out conjunct T-O-6 dictates (`{material: "", bounded: false, bytes: 0,
sections: []}` for every text, no cut, so `bounded` is false); correct the rationale sentence, which
currently attributes to a universal property a `bounded: true` demand upstream explicitly removed;
and restate §G.1's T-O-6 row as discharged across a unit arm **and** a seam arm — which is what
upstream asked for, and is strictly more coverage than the current text claims.

## Fixtures

§F gained one row and rewrote one; nothing else in the inventory moved, and no hand-computed literal
changed — which is the outcome my v3 predicted once FSPEC's byte basis landed on material only.

| Fixture | Change in this delta | Assessment |
|---|---|---|
| `ZERO-BOUND` *(new)* | *"a multi-document corpus whose documents **do** carry BR-6 priority sections, run at `maxBytesPerDocument: 0` … the **positive control** for `RSN-NO-MATERIAL`'s second disjunct"* | **Correct and well-sized.** It is a threshold override on an existing corpus fixture, not a new corpus shape, so it costs no fixture-authoring budget. Its "what it stops" cell names three wrong answers, not one: the carries-no-section implementation, `RSN-BYTES` rows, and the zero-byte contribution flagged `bounded: true` occupying a slot |
| `NO-MATERIAL` *(reworded)* | now labelled *"the *carries-no-section* disjunct of BR-9's `RSN-NO-MATERIAL`, paired with the row below"* | **Correct.** The pairing is what makes the reason id's meaning falsifiable; the document explicitly places it in the same discipline as `DISCARDED-NESTED`/`DISCARDED-DIRECT` and `COUNT-BINDING`/`BYTES-BINDING`, which is a pattern this feature has used consistently |
| `BYTES-BINDING`, `COUNT-BINDING`, `MULTIBYTE-BOUND`, `GATE-GRAMMAR`, `SUPPLEMENTARY-PATHS`, corpus/self/unreadable, §F.4 seam doubles | untouched | **Unaffected.** The 3/5/0 literal stands, as §G.2 gap 2 now records |
| §F.3 heading-forms note *(rewritten)* | from "F-O-1's, not this document's to decide" to "decided", with the three-clause matcher transcribed | **Faithful.** Verified against `TSPEC` §D.3: `SECTION_HEADING_RE = /^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/`, exactly two `#`, optional ordinal *discarded*, exact case-sensitive comparison, optional trailing gloss. My v3 F-03 is closed |

**Two things in §F.3 deserve to be called out as better than a transcription.** First, clause 1
explains *why* the discarded ordinal is load-bearing for fixtures — *"the corpus's own numbering is
**not** BR-6's priority order … a fixture whose expected order was read off the ordinals would invert
the first two sections of every corpus document."* That is a real defect the clause prevents, stated
concretely. Second, clause 2 grounds exact case-sensitive matching on **E-33 rather than on taste**:
the measured `RSN-NO-MATERIAL` document carries `## Cross-Feature Findings` and `## Process
Findings`, which a substring or token rule would match, *"making E-33 and AT-28 unreachable by
construction"*. A rule that would make an edge case unreachable is a rule that would make a test
vacuous, and naming that is exactly the standard I want applied here.

**The one fixture consequence of F-01.** Closing F-01 needs **no new fixture**. The unit-level
carve-out T-O-6 asks for is an assertion over `extractInjectableMaterial(text, 0)` for any text
already in the suite — including, per TSPEC §I.3, *"one carrying all five sections"*, which
`ZERO-BOUND`'s corpus already provides. It lands in `learningsBlock.test.js` (LI-08 red / LI-17
green), a suite §C.3 already owns, alongside `PROP-BOUND-03`'s existing example arm. So the fix is
three sentences of specification and one test case, and it changes no count in §C.4 except by
leaving the property total at 70.

**One inventory wrinkle worth fixing while the file is open.** §C.4's re-measurement is materially
right and I verified it file by file, but the summary sentence reads *"Seven of the fourteen have
landed (LI-01…LI-04, LI-07, LI-08, LI-09, LI-13 are committed)"* — **seven files** against **eight
task ids**, because LI-04's artifact is `.gitignore` (landed: `.gitignore:13` carries
`/.baseline-worktree/`), which is not one of the fourteen rows. Both halves are true; a reader
reconciling them has to discover that the parenthetical changed subject from files to tasks. That is
F-04, Low.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | **High** | Local | **`maxBytes = 0` is excluded from `PROP-BOUND-03` and §O.9's generated domain, against TSPEC v0.9's explicit instruction, and §G.1 records the obligation as discharged anyway.** T-O-6 at HEAD reads *"**The bound domain includes `0`, and the property must state its carve-out** … one written with `0` excluded loses the edge to AT-30's L3 case with no unit-level oracle. **State the zero conjunct, keep `0` in the domain**"*, and TSPEC §I.3 fixes the return at that unit: *"`maxBytes <= 0` short-circuits BEFORE the cut and returns `{material: "", bounded: false, bytes: 0, sections: []}` for every `text`"*. PROPERTIES instead scopes `PROP-BOUND-03` to `> 0`, sets §O.9's domain to `maxBytes >= 1`, and asserts in §G.1 that the boundary's *"observables live at the workflow seam, not at this unit"* and that *"the obligation is discharged across the pair with no input of §D.5 unclaimed"*. No property asserts the zero return: `grep -n 'sections: \[\]\|bounded: false'` over the document returns no match. The stated rationale — a universal property *"would demand a zero-byte contribution flagged `bounded: true` occupying a `maxDocuments` slot"* — is the un-amended cut-and-flag reading TSPEC §D.5 names and carves out (*"would give `{bytes: 0, bounded: true}` on a *selected* document — the shape FSPEC v0.13 explicitly carves out"*). The carve-out entered at `727ffd62` in answer to a finding recorded against **TSPEC v0.7**; TSPEC's instruction landed at `daa43540`, earlier the same day, and the revision's own later commits absorbed v0.9 elsewhere. **Fix:** restore `0` to both domains with the carve-out conjunct stated (`{material: "", bounded: false, bytes: 0, sections: []}`, no cut, `bounded` false), correct the rationale sentence, and restate §G.1's T-O-6 row as discharged across a unit arm **and** `PROP-CONFIG-09`'s seam arm. One case in `learningsBlock.test.js` under existing LI-08/LI-17; no new fixture, task, AT id or property. | AC-2.3, AC-4.4; TSPEC T-O-6, §I.3, §D.5; FSPEC E-36 |
| F-02 | Medium | Local | **§G.3 closes with *"**Still open:** nothing. Every item this document routed upward has been answered"* and §G.2 restates both gaps as *"resolved upstream … (not a gap)"*, while the F-01 divergence sits undeclared.** Read strictly, the sentence is a claim about the *routed-erratum list* and is true of it. Read as a §G "known gaps" section is read — as this document's own account of where it stands against upstream — it is false, and it removes the one signal that has served this feature best. §G.2.2 previously carried a divergence *with its blast radius named*, which is precisely why my v3 confirmation cost a diff and a re-read rather than a re-derivation of every byte literal. **Fix:** with F-01's edits applied there is no divergence left to declare and the sentence becomes true as written; if the author instead wants to keep the `>= 1` domain, then it must be re-opened as a §G.2 gap naming TSPEC T-O-6 as the text it departs from — and at that point it is an upstream conversation, not a §G entry. | TSPEC T-O-6 |
| F-03 | Low | Process | **A reviewer finding raised against a superseded upstream version was implemented without re-checking it against upstream at HEAD.** §G.3 records the mechanism precisely — *"Both reviewers of this round recorded `UPSTREAM-STATE: TSPEC sha256:f629d29d…` (v0.7) and read TSPEC as byte-identical. It is not: TSPEC at HEAD is … **v0.9**"* — and the document correctly re-derived its *errata* against v0.9. What it did not do is re-derive the **reviewer findings** it was answering against the same v0.9, and F-01 is the one place where a v0.7-grounded finding and v0.9 disagree. The reusable rule: when a revision discovers that upstream moved after its reviews were dispatched, the routed items **and** the findings being addressed are both re-grounded, because a finding is as version-bound as an erratum. Worth carrying to harvest as a process learning rather than fixed only here. | — |
| F-04 | Low | Local | **§C.4's summary sentence changes subject from files to tasks mid-parenthetical.** *"Seven of the fourteen have landed (LI-01…LI-04, LI-07, LI-08, LI-09, LI-13 are committed)"* — seven files, eight task ids, because LI-04's artifact is `.gitignore` (landed at `.gitignore:13`, `/.baseline-worktree/`), which is not one of the fourteen rows. Both halves are true and the table above them is exact, verified against `git ls-files pdlc/workflows/__tests__`. **Fix:** say "seven of the fourteen files have landed; the tasks committed so far are LI-01…LI-04, LI-07, LI-08, LI-09 and LI-13, of which LI-04's artifact is `.gitignore` rather than a row in this table." | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | T-O-6 asks for the zero conjunct **in the generated arm** ("keep `0` in the domain"), which means a generator that draws `maxBytes` from `[0, ∞)` and branches its expectation at the boundary. Do you want it that way, or as `maxBytes >= 1` generated **plus** a separate example case at `0`? Upstream's wording points at the first; the second is easier to read and equally falsifying. Either closes F-01, but the choice should be stated in §O.9 rather than left to the implementer, because it decides whether the boundary is covered by construction or by one case someone can delete. |
| Q-02 | With the zero return specified at the unit (`sections: []`), is `PROP-CONFIG-09`'s no-slot conjunct now provable *twice* — once at the seam and once as "the selector drops on `sections: []`, and there is no zero-bound special case in the selector" (TSPEC §D.5)? If so, is the second worth an explicit conjunct in `PROP-BOUND-06`, since it is the one that would catch a selector that grew a zero-bound branch instead of keying on *yields no material*? |
| Q-03 | §G.3 now carries struck-through items as a record of where each landed. That reads well, but it makes the section's length grow monotonically as the feature converges. Is the intent to keep the struck list through harvest (as provenance for LEARNINGS), or to collapse it to a single "all routed items answered at FSPEC v0.13 / TSPEC v0.9" line once the phase closes? I would keep it — the episode in §G.2 gap 1 is the most transferable thing in this document — but it should be a decision, not drift. |

## Positive Observations

- **All four of my v3 findings are closed, and none was closed by weakening the claim.** F-01 got a
  new property with four positive conjuncts rather than a hedge; F-04 got a paired fixture rather
  than a widened sentence. That is the harder and better way to close a finding, and it is worth
  saying explicitly.
- **`PROP-CONFIG-09` is the best-argued property added to this document.** It states *why* four
  conjuncts and not one — *"an empty selection is what `maxDocuments: 0` and `maxTotalBytes: 0`
  produce too, so `PROP-RECORD-02`'s generic empty-selection oracle cannot tell the three apart"* —
  and *why* its fixture must carry material, which is the precedence-defeating requirement most
  zero-value tests get wrong. A reader can reconstruct the reasoning without the author present.
- **§G.2 kept the episodes instead of deleting them.** *"The entry is retained rather than deleted
  because the *episode* is the point: declining to guess cost one confirmation round and no retracted
  property, where a guessed answer would have frozen a wrong expected value into the suite."* That is
  the durable, transferable lesson of this whole phase, and preserving it in place — where the next
  reader of the gap will meet it — is better than routing it to LEARNINGS alone.
- **The document discovered its own reviewers' stale `UPSTREAM-STATE` and said so.** Rather than
  quietly re-routing two errata TSPEC had already answered, §G.3 names the hash mismatch, strikes the
  items, and cites the DEC-ERR-01 anti-pattern for the one item (ERR-8) that TSPEC has already routed.
  Declining to re-raise a question already routed is a discipline that saves whole rounds. The irony
  of F-01 is that this same rigour was applied to the errata and not to the findings.
- **`PROP-BOUND-07`'s absorption of §D.3's assembly rule retires a class of defect, not one defect.**
  Turning "hand-computed literal" into "sum of normalised section lengths plus 2 bytes per join" means
  a fixture author and an implementer cannot diverge on the arithmetic — the failure mode where a
  literal fixture reds a correct implementation is now unreachable by construction.
- **`PROP-BOUND-05`'s move to the rendered block, with `sections[]` demoted to a supporting equality
  and DC-14 cited by name, is exactly the right instinct.** *"An oracle reading the producer's own
  report of what it intended"* is the trap; naming the constraint that forbids it, in the property
  itself, is how the next author avoids re-deriving the argument.

## Recommendation

**Needs revision**

One High finding, and it is narrow. Everything I asked for at v3 landed, and landed better than I
asked: `PROP-CONFIG-09` owns AT-30's third arm with four positive conjuncts and a positive-control
fixture, §G.2's two gaps are correctly restated as resolved-with-no-recomputation-owed, §F.3
transcribes the now-decided matcher with the reasons its clauses exist, and `PROP-BOUND-05`/`07`/`08`
absorbed TSPEC v0.9's AT-11 oracle relocation and assembly rule — none of which I had asked for, all
of which strengthen the suite. The property count, the AT partition, the PLAN task map and the
test-file inventory all reconcile against repository state.

What blocks is a single partially-absorbed upstream instruction. TSPEC v0.9's T-O-6 says *"State the
zero conjunct, keep `0` in the domain"* and §I.3 fixes the unit's return at that boundary; this
revision excludes `0` from `PROP-BOUND-03` and §O.9, on a rationale drawn from the cut-and-flag
reading TSPEC explicitly retired, and then §G.1 records the obligation as fully discharged while no
property asserts the boundary. That is not a hole in the product's proof — AT-30's L3 case still reds
the mutation TSPEC names — but it is a **false claim about upstream inside the document whose job is
to be the faithful compression of upstream**, and it is undeclared where every previous divergence in
this document was declared with its blast radius. The standard that made §G.2.2 valuable at v3 is the
standard that makes this gating at v4.

**What must change to approve:**

1. **F-01 (High)** — restore `0` to `PROP-BOUND-03`'s and §O.9's domain with T-O-6's carve-out
   conjunct stated literally: at `maxBytes <= 0` the return is `{material: "", bounded: false,
   bytes: 0, sections: []}` for every text, including one carrying all five sections; no cut occurs,
   so `bounded` is `false`. Correct the rationale sentence that attributes a `bounded: true` demand to
   a universal property. Restate §G.1's T-O-6 row as discharged across a **unit** arm and
   `PROP-CONFIG-09`'s **seam** arm — which is more coverage than the row currently claims, not less.
   Lands as one case in `learningsBlock.test.js` under existing LI-08 (red) / LI-17 (green): **no new
   fixture, no new PLAN task, no new AT id, no new property, no upstream edit.**
2. **F-02 (Medium, not gating)** — once (1) is applied, §G.3's *"Still open: nothing"* becomes true as
   written and needs no edit. If the `>= 1` domain is kept instead, re-open it as a §G.2 gap naming
   T-O-6 as the text it departs from, and route it upward rather than absorbing it silently.
3. **F-03 (Low, Process)** — no edit to this document required; carry to harvest the rule that a
   reviewer finding is as version-bound as an erratum, and is re-grounded against upstream at HEAD
   before it is implemented.
4. **F-04 (Low)** — split §C.4's summary sentence so the file count and the task list are not read as
   the same seven.

Nothing here re-opens the phase, changes a REQ acceptance criterion's coverage, or touches PLAN,
TSPEC, FSPEC or REQ. Every REQ acceptance criterion still carries at least one property, AC-4.4's
three zeros are all asserted at the seam, and the 35-member AT partition is intact. This is one
absorption completed, not a revision round.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}

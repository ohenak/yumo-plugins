# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review of v0.2 against my v3 findings; base `f10dbd43` → HEAD)

## Overview

**Scope of this round.** My v3 was an upstream-cascade confirmation that did **not** approve: two High
findings (F-01 PROP-BOUND-03's universal statement against FSPEC v0.13's zero-bound rule; F-02 AT-30's
third arm unowned), plus three Medium/Low bookkeeping items. This round re-reads only what changed:
`git diff f10dbd43..HEAD` over PROPERTIES is +207/−62, and it lands in six places — the lineage header,
Group D (PROP-BOUND-03/05/06/07/08), Group H (PROP-CONFIG-04 and the new **PROP-CONFIG-09**), §O.9's
T-O-6 generator, §F.1's fixture table (`NO-MATERIAL` widened, `ZERO-BOUND` added), §F.3's F-O-1
paragraph, and §C.1/§C.3/§C.4/§G.1/§G.2/§G.3. I did not re-read unchanged material.

**All five of my v3 findings are addressed.** F-01: PROP-BOUND-03 now carries an explicit
`maxBytesPerDocument > 0` precondition and §O.9/§G.1 state the generator domain
(PROPERTIES:236, 775, 1091). F-02: PROP-CONFIG-09 exists in Group H with four positive conjuncts and the
`ZERO-BOUND` positive control, §C.1's AT-30 row names it, §C.3's LI-12/LI-21 rows widen to
`PROP-CONFIG-01…09`, §C.4's count moves 69 → 70 — and I counted 70 distinct `PROP-*` ids in the
document, so the reconciliation figure is true, not asserted. F-03: PROP-BOUND-06 is restated over
BR-9's *two* disjuncts with a fixture per disjunct. F-04: §G.2.2 and the two answered §G.3 items are
struck with their landing sites recorded. F-05: §F.3's F-O-1 paragraph is narrowed to "now decided" and
transcribes TSPEC §D.3's three matcher rules.

**Upstream moved again, and the document caught most of it.** TSPEC is `sha256:22dee8ce…` (**v0.9**) at
HEAD, not the `f629d29d…` (v0.7) both v3 reviews recorded; PLAN is v0.5; FSPEC is unchanged at
`ae75fa62…` (v0.13). PROPERTIES pins all three in its lineage header and absorbs TSPEC §D.3's matcher
and byte-assembly rule faithfully — I diffed the three transcribed matcher rules, the
`SECTION_HEADING_RE` two-`#` rule and the "sum of normalised lengths plus 2 bytes per join" formula
against TSPEC:797–885 and they match, including the reason rule 2's prefix candidate is rejected on a
*separate* ground from E-33.

**Why this is still Needs revision — one finding, and it is a consequence of the fix to my own v3 F-01.**
TSPEC v0.9's §T.5 states the T-O-6 obligation this document claims to discharge, and it decides the very
question my v3 left open, in the direction opposite to the one this revision chose:

> "**The bound domain includes `0`, and the property must state its carve-out** (FSPEC v0.13, E-36): at
> `maxBytes <= 0` the return is `{material: "", bounded: false, bytes: 0, sections: []}` for every text
> … A generated-bound property written from the cut-and-flag rule alone with `0` in its domain reds
> against a conforming implementation; **one written with `0` excluded loses the edge to AT-30's L3 case
> with no unit-level oracle. State the zero conjunct, keep `0` in the domain.**"
> — TSPEC-pdlc-learnings-injection.md, §T.5, T-O-6 row

PROPERTIES took the excluded-domain route (`maxBytes >= 1`) and routed the boundary to PROP-CONFIG-09's
L3 arm — the option TSPEC names and rejects in the same sentence. That is **F-01** below. Everything
else this round is bookkeeping.

**Method.** Read my v3; diffed PROPERTIES `f10dbd43..HEAD`; verified every new claim about upstream
against FSPEC/TSPEC/PLAN at HEAD by grep and by hash; verified the test-file inventory with
`git ls-files pdlc/workflows/__tests__`; counted properties mechanically; verified the corpus
measurement (`9` documents under §I.1's glob, 5-of-5 numbered priority headings in each).

## Properties

Only the properties the delta touched are assessed here.

### Resolved — my v3 findings, verified against the new bytes

- **PROP-CONFIG-09** (new, Group H, PROPERTIES:471–487) discharges v3 F-02 properly. It asserts four
  **positive** conjuncts — enabled run with BR-8 rows present and empty, *every* corpus document
  carrying the exact id `RSN-NO-MATERIAL`, contributing count `0`, no slot consumed, nothing flagged
  `bounded` — and it names the three plausible wrong answers it discriminates (`RSN-BYTES` rows, a
  zero-byte `bounded: true` row occupying a slot, AC-5.1a's absent key). That is not an absence-only
  oracle, and the "fixture **must** carry material" clause is what stops it greening through
  PROP-BOUND-06's first disjunct. It matches PLAN LI-12's third `LI-AT-30` case conjunct-for-conjunct,
  including PLAN's conjunct (iii) "no document carries `RSN-COUNT`" (PLAN:152), and adds no PLAN task
  and no AT id — verified: `learningsConfig.test.js` is LI-12's file in PLAN's manifest (PLAN:231).
- **PROP-BOUND-06** (PROPERTIES:267–278) now states BR-9's meaning in both disjuncts and requires both
  to be **driven**, one fixture each. The pairing argument is the right one: an implementation testing
  "carries no section" greens on `NO-MATERIAL` and reds on `ZERO-BOUND`, so the reason id's *meaning*
  is falsifiable rather than one of its routes. FSPEC:775 (E-36) and TSPEC:1423 ("two disjuncts, one
  branch") both agree, and the citation line now carries D-12, E-36 and AT-30.
- **PROP-CONFIG-04** (PROPERTIES:449–452) is amended to hand AT-30's third zero to PROP-CONFIG-09
  explicitly, so §C.1's AT-30 row partitions rather than overlaps. Coverage claim and property text now
  agree.
- **PROP-BOUND-05 / PROP-BOUND-08** absorb TSPEC §T.5's demotion of `sections[]`. This is a real
  strengthening and it is correctly reasoned: TSPEC's own JSDoc calls `sections` "a SUPPORTING
  assertion, NOT AT-11's operand … an oracle reading the producer's own report of what it intended,
  which is DC-14's shape" (TSPEC:812–816), and DC-14 exists at `docs/_constraints/DOMAIN-CONSTRAINTS.md:379`
  as cited. Reading the rendered block and mapping headings through §D.3 removes the last implementation
  echo in Group D.
- **PROP-BOUND-07** (PROPERTIES:279–300) now cites BR-6 beside TSPEC §D.5 and carries the mechanical
  byte formula. I re-derived it against TSPEC:883–885 and TSPEC:996: sum of each taken section's
  normalised byte length plus 2 bytes per join, `n` sections ⇒ `n − 1` joins, no leading or trailing
  newline in `material`. Byte-identical to upstream. This is the single most valuable line in the
  delta — it converts a hand-computed literal from a judgement call into a reproducible procedure, which
  is exactly what keeps a literal fixture from redding a conforming implementation.

### Broken by the fix — PROP-BOUND-03's precondition is now wider than upstream allows

**PROP-BOUND-03** (PROPERTIES:235–245) acquires *(stated where `maxBytesPerDocument > 0`)* and argues
the precondition is load-bearing because "a property stated over all bounds would demand a zero-byte
contribution flagged `bounded: true` occupying a `maxDocuments` slot, which no conforming implementation
can also satisfy."

That justification is false at the unit under test, and upstream says so in terms. TSPEC's contract for
`extractInjectableMaterial` (TSPEC:578–581) is:

> "`maxBytes <= 0` short-circuits BEFORE the cut and returns `{material: "", bounded: false, bytes: 0,
> sections: []}` for every `text` — no cut occurs, so `bounded` is false, and the caller drops the
> document `RSN-NO-MATERIAL` (E-36, §D.5)."

So at `maxBytes = 0` the function returns `bounded: **false**`, not `true`; the slot decision and the
`RSN-NO-MATERIAL` row are the **caller's**, not this function's. There is no contradiction to escape at
this altitude — only a conjunct to state. TSPEC §T.5's T-O-6 row then makes the instruction explicit
("State the zero conjunct, keep `0` in the domain") and names the excluded-domain route as the one that
"loses the edge to AT-30's L3 case with **no unit-level oracle**".

The consequence is a coverage hole, not just a mis-worded rationale: `grep -n "bounded: false"` over
PROPERTIES returns **nothing**, and no property in the document asserts the zero return shape. §G.1's
new T-O-6 row nevertheless claims "the obligation is discharged across the pair with **no input of §D.5
unclaimed**" (PROPERTIES:1091) — with `maxBytes = 0` excluded from both arms of the pair, that sentence
is not true. See **F-01**.

## Oracles

- **§O.9's T-O-6 generator (PROPERTIES:774–783) is where F-01 lands concretely.** The new paragraph
  states the domain as `maxBytes >= 1` "explicitly rather than left to the draw" — which is good
  practice in general and the wrong bound here. It then argues the exclusion is "the split §O.5
  prescribes — an absence-shaped conjunct belongs at the pipeline seam, not at an injectable unit that
  structurally cannot falsify it." The zero-bound obligation is **not** absence-shaped at the unit: it is
  a four-field positive return value (`material: ""`, `bounded: false`, `bytes: 0`, `sections: []`) that
  `extractInjectableMaterial(text, 0)` produces directly, so the unit both can and, per TSPEC §T.5, must
  falsify it. The seam property PROP-CONFIG-09 owns a *different* observable (the reason id and the
  unconsumed slot), and owning it does not discharge the unit one. The fix keeps both: restore `0` to
  the generator's domain with the zero conjunct stated (`maxBytes <= 0 ⇒ material === "" && bounded ===
  false && bytes === 0 && sections.length === 0`), keep PROP-CONFIG-09 unchanged, and rewrite §G.1's
  T-O-6 row as a genuine partition rather than a claimed one.
- **§O.5's L3-placement table was not extended (PROPERTIES:691–700).** §O.9's new text appeals to §O.5
  to justify placing the zero bound at L3, but §O.5 still opens "**Five** claims are placed at L3
  because no injectable unit can falsify them" and its table still lists `PROP-CONFIG-04/05` without
  PROP-CONFIG-09. Whatever happens to F-01, PROP-CONFIG-09 is an L3 property and belongs in that
  enumeration — the table is the document's closed record of deliberate L3 cost, and a property that
  cites it but is missing from it weakens exactly the discipline the table exists to enforce
  (**F-02**). Note the row's stated reason would need care: the current `PROP-CONFIG-04/05` reason
  ("rows present and empty versus key absent is a distinction only a finished report carries") is true of
  PROP-CONFIG-09's run-level conjuncts, but under F-01's fix it is *not* true of the unit-level return —
  which is the honest version of the split.
- **§O.7's new-blocking-causes rule — now satisfied.** My v3 said `maxBytesPerDocument: 0` was a
  newly-decided blocking cause needing its own defeater rather than an inherited one. PROP-CONFIG-09's
  "the fixture must carry material … a fixture of section-less documents would green through
  PROP-BOUND-06's first disjunct even if the zero bound were unimplemented" is that defeater, stated in
  §O.7's own vocabulary. Precedence order (`RSN-NO-MATERIAL` before the count cut before the byte cut)
  is unchanged and still matches BR-6's zero paragraph and TSPEC:1423.
- **§O.8's M-5 — unchanged and now unambiguous**, as v3 recorded: with BR-6 material-only, charging
  framing violates both specs. No edit needed and none made.
- **§O.1–§O.4, §O.6** — untouched by the delta, not re-reviewed. My v3/v2 open Medium on the shared
  static walk's operand (§O.1 vs §C.4's hand-transcribed literal) remains open as recorded and is not
  re-litigated here.

## Fixtures

- **`ZERO-BOUND` (§F.1, new row) is correct and cheap.** "A multi-document corpus whose documents **do**
  carry BR-6 priority sections, run at `maxBytesPerDocument: 0` with the other two thresholds at §4.1's
  declared non-zero values … a threshold override on an existing corpus fixture, not a new corpus
  shape." I checked feasibility against the landed helper: `helpers/learningsFixtures.js` already builds
  per-case threshold objects beside its corpora (`maxBytesPerDocument: 6000` at
  `pdlc/workflows/__tests__/helpers/learningsFixtures.js:180` and `:189`), so a threshold override is a
  literal change in an existing builder, not new machinery. The row's defeater column names three wrong
  answers, which is the pairing discipline §F.1 already applies in
  `DISCARDED-NESTED`/`DISCARDED-DIRECT`; `NO-MATERIAL`'s row was widened in the same edit to name itself
  as the *carries-no-section* disjunct and point at its mirror. This is exactly the fixture my v3 asked
  for.
- **§F.3's F-O-1 paragraph is now a transcription, not a hedge.** The three matcher rules are
  byte-faithful to TSPEC:810–882: optional ordinal stripped and carrying no priority; exact
  case-sensitive comparison after trim; optional trailing parenthetical gloss, stated as a defensive
  tolerance and explicitly *not* measured. The two supporting facts check out against the repository,
  not just against TSPEC: all **9** documents under §I.1's glob carry all five priority headings in the
  numbered form (`git ls-files 'docs/*/LEARNINGS-*.md' 'docs/completed/*/LEARNINGS-*.md'` less the two
  `docs/discarded/` paths; 5-of-5 in each), and the corpus's own numbering does put
  `1. Non-Convergences` before `2. Cross-Feature Patterns` while BR-6 ranks Cross-Feature Patterns
  first — so §F.3's warning that a fixture reading order off the ordinals "would invert the first two
  sections of every corpus document" is a measured claim, not a rhetorical one. The separate rejection
  ground for the prefix candidate is preserved from TSPEC:834–846 rather than collapsed into the E-33
  argument, which is the subtle half.
- **§F.2's byte-identity baseline** — untouched by the delta; retained digests unaffected.
- **§C.4's re-measured test-file inventory is honest and was overdue.** I verified every row:
  `git ls-files pdlc/workflows/__tests__` shows `helpers/learningsFixtures.js`, `learningsPremises`,
  `learningsCaptureScript`, `learningsPredicatePin`, `learningsSelect`, `learningsBlock`,
  `learningsCorpus` present (7 of 14) and the other seven absent — exactly as tabulated. The
  consequential sentence is right too: PROP-BOUND-05/07/08's amendments land in **already-landed**
  suites, and PLAN records the same at PLAN:147, whose v0.5 amendment note says LI-02 and LI-08 "have
  already landed on this branch … so the heading-form cases are an amendment to those landed files,
  taken by their **existing owners** in a follow-up commit." One nit: the parenthetical "(LI-01…LI-04,
  LI-07, LI-08, LI-09, LI-13 are committed)" enumerates eight tasks against seven of the fourteen rows,
  because LI-04 (the `/.baseline-worktree/` ignore rule, PLAN:144 — landed, `.gitignore:13`) owns none
  of them (**F-04**).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | PROP-BOUND-03's new `> 0` precondition and §O.9's `maxBytes >= 1` generator domain take the route TSPEC v0.9 §T.5's T-O-6 row explicitly rejects ("one written with `0` excluded loses the edge to AT-30's L3 case with no unit-level oracle. State the zero conjunct, keep `0` in the domain"). The stated rationale is also false at this altitude: TSPEC:578–581 pins `maxBytes <= 0` ⇒ `{material: "", bounded: **false**, bytes: 0, sections: []}`, so a universal property demands no `bounded: true` row and no slot — the slot/reason decision is the caller's. No property in the document asserts that return (`bounded: false` appears nowhere), so §G.1's "no input of §D.5 unclaimed" is untrue. Fix: state the zero conjunct in PROP-BOUND-03 and restore `0` to §O.9's domain; keep PROP-CONFIG-09 as the run-level arm and rewrite §G.1's T-O-6 row as a real partition | Group D PROP-BOUND-03; §O.9; §G.1 T-O-6 row |
| F-02 | Medium | Local | §O.5's L3-placement table still reads "**Five** claims are placed at L3" and lists `PROP-CONFIG-04/05` without PROP-CONFIG-09, while §O.9's new text cites §O.5 as the authority for placing the zero bound at L3. Add the row (and state its reason honestly: the run-level conjuncts need a finished report; the unit-level return does not) | §O.5; §O.9 |
| F-03 | Low | Local | PROP-BOUND-05's new oracle says "assert the resulting list equals `BR6_SECTION_NAMES` as an **ordered** list", i.e. the full five-name catalogue, while the property head says "the five priority sections **that the document carries**". True on AT-11's all-five fixture (TSPEC:1254 states it the same way for that AT), over-general as written. Say the expected list is the priority-ordered intersection, hand-transcribed for the fixture at hand | Group D PROP-BOUND-05 |
| F-04 | Low | Local | §C.4's "Seven of the fourteen have landed (LI-01…LI-04, LI-07, LI-08, LI-09, LI-13 are committed)" enumerates eight tasks against seven rows; LI-04 owns none of the fourteen files (it is the `/.baseline-worktree/` ignore rule, PLAN:144, landed at `.gitignore:13`). Either drop LI-04 from the list or say it owns no row | §C.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With `0` restored to §O.9's generator domain, does the generated arm draw `maxBytes = 0` as a distinguished case, or does the zero conjunct ride as a guarded branch inside the same property body? TSPEC asks for the conjunct, not for the sampling frequency; saying which keeps LI-08's red episode reproducible. |
| Q-02 | §C.4 now records that PROP-BOUND-05/07/08's amendments land in already-committed suites. Is the expected-red ledger amended for those (a re-red on landed green code), or are they folded into LI-16/LI-17's green tasks? PLAN P-A-7 says a live table is amended by an edit to the PLAN before the run it governs — this looks like exactly that case. |

## Positive Observations

- The zero-bound gap closed the way the document predicted it would in v0.1: Group H, beside
  PROP-CONFIG-04, one case in `learningsConfig.test.js`, no new PLAN task, no new AT id. Declining to
  guess the answer cost one confirmation round and retracted nothing — the §G.2.1 entry now records the
  *episode* rather than deleting it, which is the right instinct and the kind of durable signal harvest
  should keep.
- PROP-CONFIG-09 is written the way an L3 property should be: four positive conjuncts, the three
  plausible wrong answers named, and an explicit argument for why the fixture must carry material so the
  oracle cannot green through a sibling property's disjunct.
- Absorbing TSPEC §D.3's assembly rule into PROP-BOUND-07 turns AT-11's expected byte count from a
  judgement two conforming implementations could split into a mechanical sum. That is a real reduction
  in the chance of a fixture redding correct code, and it was done by transcription rather than
  paraphrase.
- The `sections[]` demotion (PROP-BOUND-05/08 reading the rendered block, `sections[]` asserted only as a
  supporting equality, DC-14 cited by id) removes the last implementation echo in Group D.
- §C.4's re-measured inventory corrects a claim that had silently gone stale as implementation began,
  and states the consequence — some amendments now land on committed code — instead of burying it.

## Recommendation

**Needs revision**

One High finding, and it is narrow: the document's response to my v3 F-01 chose the domain-exclusion
route at the moment TSPEC v0.9 landed the opposite instruction, so the fix and the upstream decision
crossed in flight. Nothing else in the 207-line delta is contested — PROP-CONFIG-09, the two-disjunct
PROP-BOUND-06, the `ZERO-BOUND` fixture, the §D.3 absorption, the `sections[]` demotion and the
re-measured inventory are all correct and all verified against the repository.

What must change, smallest first:

1. **F-01.** Restore `0` to §O.9's T-O-6 generator domain and replace PROP-BOUND-03's `> 0` precondition
   with the stated zero conjunct from TSPEC:578–581 — at `maxBytes <= 0`, `material === ""`,
   `bounded === false`, `bytes === 0`, `sections` empty, for every text. Then rewrite §G.1's T-O-6 row
   so the pair genuinely partitions §D.5's inputs: the unit property owns the return shape, PROP-CONFIG-09
   owns the reason id and the unconsumed slot.
2. **F-02.** Add PROP-CONFIG-09 to §O.5's table and update "Five claims".
3. **F-03, F-04.** One clause each.

No property retracts, no fixture changes, no PLAN task moves, and the 70-property count is unaffected —
F-01 is an amendment to two paragraphs and one table row.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}

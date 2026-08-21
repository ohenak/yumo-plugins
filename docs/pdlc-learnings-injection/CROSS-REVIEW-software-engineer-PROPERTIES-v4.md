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

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

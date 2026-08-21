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

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

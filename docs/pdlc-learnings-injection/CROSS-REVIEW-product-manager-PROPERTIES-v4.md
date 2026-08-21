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

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

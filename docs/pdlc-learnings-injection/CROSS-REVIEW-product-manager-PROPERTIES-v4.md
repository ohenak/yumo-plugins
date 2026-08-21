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

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.1)
**Date:** 2026-08-29
**Iteration:** 12 (delta confirmation — round 11's routed items)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…3c7b7c`, FSPEC v1.3 `sha256:2bd5c3ef…5aed39`

## Overview

I approved this TSPEC at v0.7, v0.8, v0.9 (minor) and v1.0 (minor, round 11). This round is a
**delta confirmation** on the two routed items — se-review's six-place and te-author's five-place
report that `PLAN` v0.7 states the census constants' home and cardinality against TSPEC §7.3.

What I did: re-read my v11 findings, ran `git diff 452d72c07..HEAD` over the TSPEC (the commit v11's
`REVIEWED-COMMIT:` anchor names), re-measured both upstream documents at HEAD, then re-read §7.3
whole and grepped every count word in the document rather than only the changed cells, per
DEC-ERR-03. I also read `PLAN` and `PROPERTIES` at HEAD, because the routed items are statements
*about* those documents and "landed" cannot be judged from the TSPEC alone.

**Upstream is byte-unmoved.** I hashed both files at HEAD: `REQ-pdlc-decision-ledger.md` is
`sha256:ce6b133f0c1d…0d3c7b7c` and `FSPEC-pdlc-decision-ledger.md` is `sha256:2bd5c3ef055f…735aed39`
— digit-for-digit the dispatch pins and the document's own v1.1 recital. Nothing this TSPEC cites
upstream has moved, so DEC-ERR-03 yields no finding on that axis: the compression is still faithful
because the compressed text is unchanged. The four corpus literals (6,305 / 10,859 / 12,059 / 441)
are untouched, no AT row moved, no traceability row moved.

**Scope of the edit.** 54 insertions, 3 deletions, across exactly two regions — the revision-history
changelog and §7.3 — as the commit sequence claims. No product decision was re-opened, no acceptance
criterion narrowed, nothing added that the REQ does not ask for.

**Bottom line up front.** The routed items are landed on the side this document controls, and landed
well. The defect they name, however, lives in `PLAN`, which this TSPEC cannot edit — and `PLAN` at
HEAD is still stale in all six places. That is F-01, tagged `inherited` so it routes back to PLAN's
own phase rather than halting this one.

## Architecture

**How the delta resolves the two routed items.** Both items report the same collision from two
directions: `PLAN` v0.7 declares `DECISION_LEDGER_CENSUS_TOKENS` production code, declared in
`orchestrate-dev.js` by T-18, a member of both `DECISION_LEDGER_OWNED_DECLS` and
`DECISION_LEDGER_CENSUS_EXEMPT`, with the partition six ∪ **nine** = **fifteen**; TSPEC v1.0 makes
all three census constants declarations of the census *test file* with a **fourteen**-member owned
list. `PLAN`'s T-11 row goes further and names the adopted TSPEC form the "**rejected**" resolution
(`PLAN`:19). Two approved documents therefore asserted mutually exclusive designs, and the one
implementation reads was the wrong one.

The author's resolution is the structurally right one for a document at this position in the graph.
Rather than restating the arithmetic at every site that touches it — which is what produced the
divergence in the first place — §7.3 gains one paragraph, *The size of the owned list, stated once*
(:1375–1382), which does three distinct jobs:

1. **States the count once, with its decomposition.** `DECISION_LEDGER_OWNED_DECLS` has fourteen
   members — §4.1–§4.4's six functions plus the eight top-level constants the *Scanned source* row
   enumerates — so the partition is six ∪ eight = fourteen.
2. **Declares the single-siting rule.** Any other section, and any downstream document, cites the
   count rather than restating it, with the stated reason: a count restated at several sites is a
   one-row edit that goes stale at all but one of them. The `pdlc-wave-resume` lesson is named as
   the precedent.
3. **States the correction direction explicitly.** A downstream document carrying a fifteen-member
   owned list, or assigning any of the three census constants a home in `orchestrate-dev.js`, is
   **stale against this section and not a competing design**; the correction runs downstream-to-here,
   never the reverse.

Item 3 is the load-bearing one and I want to be clear about why I credit it. A TSPEC cannot re-pin a
PLAN — that is PLAN's phase's work. What a TSPEC *can* do, and what this one now does, is remove the
ambiguity that let a downstream editor read the conflict as a live design choice. Before this edit,
a reader of `PLAN`:19 saw a reasoned argument that TSPEC's form was rejected; after it, that
argument is explicitly out of contract with its own upstream. The erratum has converted a
two-sided disagreement into a one-sided staleness, which is exactly the shape a downstream re-pin
round can close mechanically.

**Two prior findings of mine also closed, correctly and in scope.** My v11 F-04 (the cloned
`DECL_RE` matches `function` declarations only, while eight of the fourteen owned members are
top-level `const`s) is landed in the *Scanned source* row: the clone's regex must cover `const`/`let`
bindings and `export`-prefixed forms, and the row states the consequence — the non-empty-slice
conjunct is what catches a regex that missed a declaration form. My v11 F-02 (PROPERTIES still
encoding the retired PROP-INV-06/07 shapes) is closed in `PROPERTIES` at HEAD, which now carries the
fourteen-member owned list at PROP-INV-07 and PROP-INV-11 and flags the `PLAN` divergence itself.
Two of three downstream documents are now converged on fourteen; `PLAN` alone dissents.

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_

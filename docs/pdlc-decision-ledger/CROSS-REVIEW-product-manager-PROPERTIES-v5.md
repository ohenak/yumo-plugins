# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md
**Date:** 2026-08-30
**Iteration:** 5 (round 5 — upstream-cascade confirmation, PROPERTIES bytes unchanged)

## Overview

**Question answered.** Does PROPERTIES v1.2, which I approved at round 4, still hold as a faithful
compression of its upstream as that upstream now stands? **Yes on substance; no on citation
hygiene.** No property is falsified, no acceptance criterion is narrowed, no requirement has lost
its property, and the routed divergence PROPERTIES itself flagged has now been closed in PROPERTIES'
favour. What is stale is a set of pins, one now-resolved routed item, and three citations into
upstream text that upstream no longer phrases the way PROPERTIES quotes it.

**What moved.** My round-4 approval recorded `UPSTREAM-STATE: PLAN sha256:a8e91304…` and
`UPSTREAM-STATE: TSPEC sha256:b1b603a8…`. At this dispatch:

| Upstream | At my approval | At HEAD | Moved? |
|---|---|---|---|
| REQ | `ce6b133f…` v1.9 | `ce6b133f…` v1.9 | no |
| FSPEC | `2bd5c3ef…` v1.3 | `2bd5c3ef…` v1.3 | no |
| TSPEC | `b1b603a8…` v1.0 | `fc57bc56…` **v1.2** | **yes** |
| DECISIONS | `13aba061…` | `13aba061…` | no |
| PLAN | `a8e91304…` v0.7 | `d1af8e47…` **v0.9** | **yes** |

The dispatch names PLAN only. Per DEC-ERR-03 my scope is this document against its upstream **at
HEAD**, so TSPEC's v1.0 → v1.2 movement is in scope too, and it is where most of what follows comes
from. Neither movement reverses anything PROPERTIES was approved against: TSPEC v1.1/v1.2 sharpen
§7.3 and §4.3, and PLAN v0.9 lands the census-constant correction PROPERTIES had already made and
routed.

**The headline.** PROPERTIES was, at round 3, the document that got the census contract right first:
it re-pinned to TSPEC v1.0's fourteen-member owned list, three test-file census constants, and
§7.2's symmetric-difference conjunct 3, and it routed PLAN v0.7's contradicting fifteen-member form
as an upstream-vs-upstream divergence rather than adjudicating it. PLAN v0.9 has now landed exactly
that correction — six data-carrying names ∪ eight plumbing declarations = fourteen, all three
constants homed in `decisionLedgerCensus.test.js`, T-18 writing no census constant, and T-10a's
conjunct 3 re-pinned to §7.2's referents. **PROPERTIES did not have to move to agree with PLAN;
PLAN moved to agree with PROPERTIES.** That is the strongest possible outcome for this cascade.

The residue is bookkeeping, and all of it is non-gating: the header still pins TSPEC v1.0 / PLAN
v0.7 (F-02, F-03), the §Gaps routed item now describes a divergence that no longer exists (F-01),
and three in-body citations quote §7.3 text that v1.1/v1.2 replaced (F-03, F-04, F-05). One Low
from round 4 (F-08 there) is still open and is re-recorded here as F-06.

## Properties

_(pending)_

## Oracles

_(pending)_

## Fixtures

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_

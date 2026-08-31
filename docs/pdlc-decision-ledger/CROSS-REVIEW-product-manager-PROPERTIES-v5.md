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

Checked family by family against upstream at HEAD, looking only for properties that upstream no
longer supports or now supports differently.

**INV family (census) — substance holds, three citations went stale.**

- **PROP-INV-06** asserts the census over `orchestrate-dev.js` minus every member of a
  **fourteen**-member `DECISION_LEDGER_OWNED_DECLS` plus the sentinel-bounded wiring run. TSPEC v1.2
  §7.3 still pins fourteen, and PLAN v0.9 T-11 now carries the same. Substance holds. Two problems
  in how it is said. (a) It attributes the count to "`TSPEC` v1.0" and restates the decomposition
  ("the six functions plus the eight top-level constants") as its own assertion. §7.3 v1.1 added
  *The size of the owned list, stated once*, declared that paragraph the **authority**, and stated
  that "no other section of this document, and **no downstream document**, restates the arithmetic
  as its own assertion; it cites this paragraph instead." PLAN's v0.9 round was made to fix this
  same defect (its PM F-02) and now cites the paragraph by name. PROPERTIES has not been through
  that pass — F-03. (b) It describes the slicer as `loopEconomicsAnchorGuard.test.js`'s `bodyOf`
  over `allTopLevelDecls` with no qualifier. §7.3 v1.1's *Scanned source* row now says the
  precedent's declaration regex "must be widened, not cloned verbatim" — that `DECL_RE` matches
  `function` only, while **eight of the fourteen owned declarations are top-level `const`s**, so a
  verbatim clone leaves each catalogue's body in the remainder and reds the census on its own
  literals. PLAN v0.9 T-11 absorbed this in terms; PROPERTIES did not — F-04.
- **PROP-INV-07** (the partition) holds unchanged: `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` =
  `OWNED_DECLS`, disjoint, both directions, over the fourteen-member list. Its parenthetical
  justification quotes §7.3 as saying "roughly a dozen are declared"; v1.1 replaced that phrase with
  "the fourteen the paragraph above counts" — F-05. The rejection itself (export set-equality is red
  by construction) is unchanged upstream, so this is citation drift, not a substance change.
- **PROP-INV-08** (every slice non-empty) and **PROP-INV-11** (each owned member resolves to exactly
  one top-level declaration) are, by §7.3 v1.1's own words, the two conjuncts that "catch a regex
  that missed a declaration form". Both already exist in PROPERTIES. That is why F-04 is Medium and
  not High: the widened-regex requirement is under-cited, but it is not un-falsified.
- **PROP-INV-09** holds: the `decisionLedger` report field is still not a census token, and its two
  behavioural homes are still §7.2's live composition-root arm. Its "`FSPEC` §7.6" attribution is
  still the mis-citation I raised at round 4 (F-08 there); §7.6 is TSPEC's — F-06.
- **PROP-INV-10** (`MAX_REVIEW_ROUNDS` / `MAX_LIFETIME_ROUNDS` / `MAX_ERRATUM_FOLLOWUP_ROUNDS`
  untouched, REQ NG-5) is unaffected by either upstream move.

**WIRE / OFF families — converged with PLAN, no finding.** PROP-WIRE-12's paired-run symmetric
difference (`report` key sets differing by exactly `{decisionLedger}`, set equality in both
directions) and PROP-OFF-05's "notice set set-equal to **empty**, never compared to a baseline
notices array" are precisely the referents PLAN v0.9 re-pinned T-10a conjunct 3 and its §Definition
of Done bullet to. PROPERTIES was already correct here and needs no edit — this closes my round-4
F-07 (Medium), which routed exactly this divergence to PLAN's author.

**Everything else — CFG, REC, PRE, REND, BND, FAIL, TEXT, DISC.** Neither TSPEC v1.1/v1.2 nor PLAN
v0.9 touches the config grammar, recognition rule, precedence, rendering contract, bounds
arithmetic, fail-open legs or disclosure surface. The four corpus literals (6,305 / 10,859 / 12,059
/ 441) are explicitly unchanged in both TSPEC changelogs, so BND and ORC-03 are unmoved. One
adjacent v1.2 clarification is worth noting and does **not** produce a finding: §4.3 now says the
1,200-byte framing pin covers "four framing **pieces**", of which only two
(`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`) are top-level constants, the header and
trailer shipping as inline literals inside `renderDecisionLedgerBlock`. PROPERTIES' REND/BND
properties assert the pin over **rendered output**, not over a constant count, so they read
correctly against the sharpened wording.

**Requirement coverage.** No REQ acceptance criterion changed (REQ unmoved at v1.9), so the
Coverage Matrix's REQ/FSPEC mapping is unaffected. BR-11 / REQ NG-4 still resolve to
PROP-INV-06/07/08/11 exactly as approved.

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

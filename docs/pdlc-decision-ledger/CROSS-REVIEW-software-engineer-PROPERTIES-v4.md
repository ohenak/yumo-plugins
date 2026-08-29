# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-08-29
**Iteration:** 4 (delta re-review of the v1.1 → v1.2 diff)

## Overview

**Scope of this pass.** My v3 was an upstream-cascade confirmation that returned **Needs revision**
on two Highs, both tagged `inherited`: PROP-INV-06's exclusion regions and PROP-INV-07's assertion
were written against `TSPEC` §7.3 at v0.7/v0.8 and had been overtaken by §7.3 at **v1.0**. v1.2 is
the repair round. I diffed `ae0a4a5f0..HEAD` on the document (`102 +`, `24 -`, one file) and read
only the changed regions: the header pin and changelog, PROP-INV-06/07/09 and the new PROP-INV-11,
the new PROP-WIRE-12, PROP-OFF-05, the INV rationale paragraph, §FX-BASELINE's *Feeds* note, the
Coverage Matrix counts and module manifest, the BR-11/NG-4 and DC-07 obligation rows, and §Gaps'
second routed item. Nothing outside those regions is re-litigated here.

**Both of my v3 Highs are resolved, and I verified the repair against source, not only against
`TSPEC` prose.**

| v3 finding | Disposition | Evidence I checked |
|---|---|---|
| **F-01** (High) — PROP-INV-06 excluded "three brace-matched function bodies" | **Resolved** | `PROPERTIES`:409 now excludes the body of **every** member of `DECISION_LEDGER_OWNED_DECLS`, "**fourteen** at `TSPEC` v1.0, the six functions plus the eight top-level constants", each sliced "from its own declaration line to the next top-level declaration of any name", boundaries from **all** module top-level declarations. That is verbatim the mechanism `TSPEC`:1337 specifies, and it is the mechanism the precedent actually implements: `loopEconomicsAnchorGuard.test.js:63–66` builds `allTopLevelDecls`, `:123–127` slices `bodyOf(name)` from that declaration's line to the next entry's line, and `:114` holds `ANCHOR_TOKENS` as a test-file constant. The document also states the negative I asked for — brace-matching "cannot slice a constant such as `DECISION_HEADING_RE` at all" |
| **F-02** (High) — PROP-INV-07 asserted export set-equality, the form §7.3 rejects | **Resolved** | `PROPERTIES`:411 now carries §7.3's partition — `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` **set-equal** to `OWNED_DECLS`, sub-sets **disjoint**, both directions over the frozen fourteen-member list — and states explicitly that export set-equality "is the form `TSPEC` §7.3 **rejects as red by construction** … and must not be asserted". `TSPEC`:1336 is the matching text. The BR-11/NG-4 gloss (`PROPERTIES`:953) and the INV rationale paragraph (`:415–424`) were re-worded in step, which were the two secondary sites I named |
| **F-03** (Medium) — module manifest's T-11 → T-18 red→green rationale rested on a production `CENSUS_TOKENS` | **Resolved** | `PROPERTIES`:891–906 records the test-file home for all three operands and re-states the edge: T-11 is skipped in batch 2 and un-skipped by T-18 because PROP-INV-11's resolves-to-exactly-one and PROP-INV-08's non-empty-slice read the owned list against HEAD — "the ordinary red-before-green edge, not red-by-construction" |

**The partition arithmetic closes, and I recomputed it rather than taking it.** `TSPEC`:1336's
`DECISION_LEDGER_CENSUS_EXEMPT` holds exactly eight members (`parseDecisionLedgerConfig`,
`buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`,
`DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`,
`DECISION_LEDGER_NOTICES`); the token set holds six; the union is fourteen and is disjoint. Split by
kind, that union is six functions and eight top-level constants — exactly the fourteen `TSPEC`:1337
enumerates (§4.1/§4.2/§4.4's six functions plus §3.1, §3.2, §4.1, §4.3 ×2 and §5.2's three
catalogues). PROP-INV-06's "six functions plus the eight top-level constants" and PROP-INV-11's
"fourteen members" are therefore both correct, and the two sentences are consistent with each other,
which is where a hand-restated partition usually goes wrong.

**Counts reconcile.** `10 + 11 + 9 + 6 + 12 + 11 + 5 + 11 + 12 + 6 + 10 = 103`; the pyramid
restatement `36 + 12 + 39 + 6 + 10 = 103` with FAIL 11 + PRE 5 + INV 11 + WIRE 12 = 39. Both are
right, and I found no surviving `101`/`37` outside the changelog's own history entries.

**The `PLAN` divergence is routed, not adjudicated, which is the correct disposition.** My v3 Q-01
asked whether the repair should wait on `PLAN` converging to `TSPEC` v1.0. v1.2 answers by re-pinning
to the deeper upstream and routing the contradiction as a second `ERRATUM: PLAN` item
(`PROPERTIES`:980–994). I agree with that call: `PLAN` v0.7 at HEAD is genuinely out of contract with
`TSPEC` v1.0, and a PROPERTIES that followed `PLAN` would be out of contract with the document
`PLAN` itself derives from. I re-raise the erratum in my own trailer so the route does not depend on
this document alone carrying it.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

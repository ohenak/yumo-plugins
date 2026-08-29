# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1, bytes unchanged)
**Date:** 2026-08-29
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)

## Overview

**Question answered.** Does `PROPERTIES-pdlc-decision-ledger.md` (v1.1, own bytes unchanged since my
v2 approval) still hold against the TSPEC as it now stands? **No, in one family.** The INV family's
two census contract properties — **PROP-INV-06** and **PROP-INV-07** — describe a census design
`TSPEC` §7.3 no longer specifies, and in PROP-INV-07's case describe the exact assertion §7.3 names
**red by construction** and rejects. Both are High. Both are tagged `inherited`, for the reason set
out below, so this confirmation routes back to the owning phase rather than halting.

**How far upstream actually moved.** My v2 approval anchor pins `UPSTREAM-STATE: TSPEC
sha256:28d25518…cb32cb49`, which is commit `cc2c09e53`, **TSPEC v0.8**. TSPEC at HEAD is
`sha256:b1b603a8…18d31a0` — **v1.0**. Five commits separate them, and two of them rewrote §7.3's
census specification:

| Commit | TSPEC | What it did to §7.3 |
|---|---|---|
| `cc2c09e53` | v0.8 | **my approval pin** |
| `1a2d78cba` | — | §7/§7.2 re-measure, re-home the flag-off referent |
| `4b28af44a` | — | **census made satisfiable over its whole token set** — the substantive §7.3 rewrite |
| `588f4323e` | — | §5.4 points-field proof (PM Q-01) |
| `5189b73fb` | v0.9 | changelog for round 9 |
| `452d72c07` | v1.0 | **the erratum edit named in this dispatch** — the three census constants given a test-file home, `DECISION_LEDGER_CENSUS_TOKENS` dropped from `DECISION_LEDGER_CENSUS_EXEMPT` and from `DECISION_LEDGER_OWNED_DECLS` |

So the item list in this dispatch is, as `DEC-ERR-03` anticipates, **necessary but not sufficient**.
The v1.0 erratum on its own is a narrow, internally coherent edit. The divergence I am reporting
entered at **v0.9** (`4b28af44a`) — after my approval was taken and before this round — and the v1.0
edit lands inside the very §7.3 cells that carry it. I re-read §7.3 at HEAD in full rather than
diffing only the routed items, which is why both findings are here.

**What §7.3 specifies at HEAD.** The scanned source is the whole of `orchestrate-dev.js` minus (a)
the body of **every** member of the frozen `DECISION_LEDGER_OWNED_DECLS` — §4.1/§4.2/§4.4's six
functions plus eight top-level constants — and (b) the sentinel-bounded `main()` wiring run. Slices
are taken **from a declaration's own line to the next top-level declaration of any name**, boundaries
from *all* the module's top-level declarations, cloning `loopEconomicsAnchorGuard.test.js`'s `bodyOf`
over `allTopLevelDecls`. The token-set operand is kept honest **not** by set equality against the
module's exports — §7.3 says that comparison "is red by construction" — but by the partition
**`DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`**,
the two sub-sets disjoint, plus a resolves-to-exactly-one-top-level-declaration conjunct per owned
member and a non-empty-slice conjunct per slice. After v1.0 the partition is six ∪ eight = **fourteen**,
all fourteen module declarations.

**Scope.** I did not re-read PROPERTIES from scratch and I re-litigate nothing settled. My v2
Mediums (F-01 DISC task attribution, F-02 the missing set-equality property for `PLAN` T-12a) and
Low (F-03 stale BND range in §Overview) were open at approval and remain open; they are not repeated
here and are not part of this verdict. Every other family — CFG, REC, PRE, REND, BND, FAIL, WIRE,
OFF, TEXT, DISC — I re-checked only for dependence on the moved §7.3 text and found none.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

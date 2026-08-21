# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 14 (delta re-review under DECISION FREEZE — PROPERTIES moved v0.8 → v0.9)

## Overview

**What moved.** PROPERTIES went **v0.8 → v0.9** in three commits — `28de4ad4` (header re-pin),
`1f1400ab` (§G.3 re-pin and re-quote), `cb09985d` (§C.4 re-pin and re-quote). The whole delta is
**17 insertions, 12 deletions in one file** (`git diff --stat c575cdc3 HEAD --
docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`). It exists to close the two
Medium findings I raised at v13 — F-01 (the PLAN pin was three versions stale) and F-02 (a verbatim
quotation of PLAN's P-A-7 case C no longer matched PLAN).

**The diff, hunk by hunk:**

| Hunk | Location | Change | Reaches a property? |
|---|---|---|---|
| 1 | Header `Upstream` cell (line 11) | PLAN pin `v0.8` → `v1.3`; case C re-quoted; a v0.9 narrative paragraph added | No |
| 2 | Version row (line 18) | `0.8` → `0.9` | No |
| 3 | §C.4 case-C paragraph (lines 1126–1135) | Re-pins the three-case table to PLAN v1.3; re-quotes case A and case C; adds PLAN v1.2's "outcome, not expectation" limb | No |
| 4 | §G.3 struck bullet (lines 1326–1334) | `PLAN at HEAD (v0.8)` → `(v1.3)`; case A/B/C windows re-quoted verbatim | No |

`## Properties` (87–607), `## Oracles` (608–808) and `## Fixtures` (809–917) are **byte-untouched**;
the header's claim *"No property, oracle, fixture, AT mapping or coverage row moves at v0.9 either"*
is true as written and I verified it against the diff, not against the sentence.

**Both of my v13 findings are resolved, and every new quotation verifies.** I fixed-string grepped
each quotation the delta introduces against PLAN at HEAD:

| Quotation the delta now carries | Hits in PLAN at HEAD |
|---|---|
| `batch 13 or later, the case that is live at HEAD` (case C) | **1** |
| `before batch 9 (which includes batches 7 and 8)` (case A) | **2** |
| `batch 9 through batch 12` (case B) | **1** |
| `under case C they owe no ledger row, and they owe green` | **1** |
| `this row records an outcome, not a pending expectation` (v1.2) | **1** |
| `the ledger stays empty and the amendment must be green at the commit that lands it — and it was` | **1** |
| the retired form `after batch 13, the case that is live at HEAD` | **0** |

PLAN's version row reads **1.3** (`PLAN-pdlc-learnings-injection.md:18`), and its changelog carries
rows for 0.9, 1.0, 1.1, 1.2 and 1.3 — so the delta's *"PLAN has since passed through v0.9, v1.0,
v1.1, v1.2 and v1.3"* is exact.

**The product question this round asks.** A re-pin is not a neutral edit. Pinning to v1.3 converts
every dated statement in this document into a **currency claim**: the delta says so itself, in a new
sentence — *"a pin at HEAD may not carry a quotation that is no longer verbatim at HEAD"* — and then
asserts *"every ruling this document cites is still present at v1.3"*. So the only question worth
asking is whether the consequence sweep that sentence promises is **complete**. It is not. The delta
swept case C's quotation and §G.3's case windows, and missed two places where PLAN moved under this
document between v0.8 and v1.3: **P-A-6's fallback route, rewritten at PLAN v1.1**, and **§G.3's
"newly routed" item, answered at PLAN v1.2/v1.3**. The first is a High: this document now instructs
the reader to take a route PLAN explicitly retired, under a pin that asserts the instruction is
current. Details below.

## Properties

**No property text, no property status, and no coverage count moved.** `## Properties` is outside
every changed line range, and §C.3's accounting rows (`Tasks owning ≥1 property | 21`,
`Properties with **no** owning task | 0`, `Fail-open arms | 12`, lines 1060–1062) are byte-unchanged.
So the property-side question is narrow: does the re-pin make any *status* claim about a property
false?

**For the four case-C properties, no — the re-quote strengthens the claim rather than weakening it.**
§C.4's case-C paragraph (line 1126) previously read *"the amendment is expected to land green"*.
The delta restates it as *"the amendment had to be green at the commit that landed it"* and cites
PLAN v1.2's own tense change — *"this row records an outcome, not a pending expectation"* — which is
present at PLAN at HEAD (1 fixed-string hit). That is the correct direction: PROP-BOUND-03's zero
case and PROP-BOUND-05/07/08's heading-form arms **have** landed and **are** green, so a pending
expectation was the wrong tense and a record is the right one. The failure limb is still recorded as
*"**unexercised**, not waived"* (line 1160–1161), unchanged — the delta did not use PLAN's tense
change as licence to relax the rule.

**The green measurement underneath those statuses still reproduces.** I re-ran it in
`pdlc/workflows` (the package's `--experimental-vm-modules` runner is required):

```
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
```

and `grep -c 'test\.skip\|describe\.skip'` returns `0` on both `learningsBlock.test.js` and
`learningsSelect.test.js`. The Group D arms the paragraph names are still at their cited anchors —
`learningsSelect.test.js:647` (`describe("PROP-ORDER-06: …")`) and `:786`
(`describe("PROP-CORPUS-09: …")`). Nothing in this delta disturbed the measurement it rests on.

**But this document's *own* PROPERTIES suite is now told to follow a route PLAN retired.** Lines
1178–1186 say the suite *"may be committed as soon as it is green — or, if it lands red, its rows are
amended into the ledger by name first, under the same P-A-7 rule"*, and then that **P-A-6**
*"(byte-unchanged at v0.8)"* governs it, distinct from case C. PLAN's P-A-6 at HEAD
(`PLAN-pdlc-learnings-injection.md:663`) says the opposite, in terms:

> the PROPERTIES **suite** lands in one commit once green, or else its rows are handled under
> **P-A-7's governing case** — which at HEAD is case C, where no ledger remains to amend into and the
> obligation is green-at-landing; **the amend-into-the-ledger-by-name route is case B's, and case B
> closed at batch 12** (TE v11 F-03).

PLAN's v1.1 changelog row records the change deliberately: *"P-A-6's PROPERTIES fallback stops
offering case B's amend-into-the-ledger route unconditionally and instead routes to **P-A-7's
governing case**, which at HEAD is C"*. So P-A-6 is **not** byte-unchanged at HEAD, and the route
this document offers does not exist. Before this delta the document was pinned at v0.8, where that
reading was accurate as-of-pin; the delta re-pinned to v1.3 and asserted *"every ruling this document
cites is still present at v1.3"*, which converts a dated-but-true passage into a current-and-false
one. That is F-01 — **High**, and it is delta-attributable under both freeze limbs.

**Nothing was added to or dropped from the property set.** §C.3's `Properties with **no** owning task
| 0` row is byte-unchanged, and I re-confirmed that the four unowned files §C.4 inventories are named
in no property statement — the filename hits in this document are all in §C.4/§G.2/§G.3 prose.

## Oracles

## Fixtures

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict

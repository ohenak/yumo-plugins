# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 15 (delta re-review under DECISION FREEZE — PROPERTIES moved v0.9 → v1.0)

## Overview

**What moved.** PROPERTIES went **v0.9 → v1.0** in five commits — `bc28ad0a` (header pin claim
narrowed), `bb2d45f1` (§C.4's P-A-6 fallback restated), `9c945683` and `9e9a79e5` (§G.2 gap 5's
count re-derived, then the two "eighteens" distinguished), `de2443f8` (§G.3's routed manifest item
struck). The whole delta is **56 insertions, 29 deletions in one file**
(`git diff --stat cb09985d HEAD -- docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`).
It exists to land my v14 findings F-01…F-06 and SE v14 F-01…F-04.

**The diff, hunk by hunk, and what each one closes:**

| Hunk | Location | Change | Closes |
|---|---|---|---|
| 1 | Header `Upstream` cell (line 11) | The v0.9 blanket *"every ruling this document cites is still present at v1.3"* is replaced by a claim **scoped to the rulings re-checked** (P-A-7's three cases and their windows), plus a v1.0 paragraph naming P-A-6 as the ruling PLAN **did** move | F-01 limb 3 |
| 2 | Version row (line 18) | `0.9` → `1.0` | — |
| 3 | §C.4 fixture inventory row (line 1091) | `Added by 744311f7` now reads *"subtree added; the `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18 files and the `MANIFEST.json` re-capture arrived later, at `2fc6fcd3` — two landing events"* | F-06 |
| 4 | §C.4 case-C quotation (line 1131) | PLAN quotation extended through *"— which PROPERTIES §C.4 records as discharged"* | SE v14 |
| 5 | §C.4 P-A-6 passage (lines 1178–1192) | The amend-into-the-ledger route is replaced by **P-A-7's governing case C** (green-at-landing, red is a real defect owed a fix before batch 14), with PLAN's rewritten P-A-6 quoted verbatim; *"byte-unchanged at v0.8"* becomes *"whose fallback route PLAN rewrote at **v1.1**"* | **F-01** |
| 6 | §G.2 gap 5 (lines 1280–1310) | The count is re-derived: **seventeen** workflows-side files plus an **eighteenth** engine-side; the raw-`ls-files` 39/22 decomposition is shown; the inventory-table eighteen and the tracked-file eighteen are explicitly distinguished; `helpers/learningsComposition.js` is recorded as unnamed-but-executed on PROP-ORDER-05's path; PLAN's closure recorded | **F-03, F-04** |
| 7 | §G.3 (lines 1348, 1365, 1379–1394) | The *Newly routed this round* bullet is struck into the *Also answered* list citing PLAN v1.2 items (3)/(4) and v1.3 item (1); the case-C paraphrase *"after batch 13"* becomes *"in batch 13 or later"* | **F-02, F-05** |

`## Properties` (87–607), `## Oracles` (608–808), `## Fixtures` (809–917) and §C.1/§C.2/§C.3
(918–1051) are **byte-untouched** — every changed line sits in the header, §C.4 Reconciliation or
§G. The header's claim *"No property, oracle, fixture, AT mapping or coverage row moves at v1.0
either"* is true against the diff, checked against line ranges rather than against the sentence.

**All six of my v14 findings are resolved, and every quotation the delta introduces verifies.** I
fixed-string grepped each new quotation against PLAN at HEAD (v1.3, `PLAN-pdlc-learnings-injection.md:18`):

| Quotation the delta now carries | Hits in PLAN at HEAD |
|---|---|
| P-A-6's rewritten fallback, *"…the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* | **1** (`PLAN:663`) |
| *"they owe green — which PROPERTIES §C.4 records as discharged"* | **1** (`PLAN:561`) |
| *"the tracked `learnings*` test-side set is eighteen files"* | **1** (`PLAN:310`) |
| PLAN v1.1's changelog attribution for the P-A-6 rewrite (TE F-03) | **1** (`PLAN:682`) |
| PLAN v1.2 items (3)/(4); v1.3 item (1)'s **nineteen-row** §Post-batch remediation | present (`PLAN:683`, `:684`); the subsection at `PLAN:244` carries **19** data rows, counted |

**The product question this round asks.** v14's High was that a re-pin had converted a
dated-but-true instruction into a current-and-false one: an implementer landing this document's own
PROPERTIES suite red was directed to amend a PLAN ledger that no longer exists. The only question
that matters now is whether the fix states the *live* obligation, and whether closing it broke
anything adjacent. It does, and it did not. No finding.

## Properties

**No property text, no property status, and no coverage count moved.** `## Properties` (87–607) is
outside every changed line range, and §C.3's accounting rows (`Tasks owning ≥1 property | 21`,
`Properties with **no** owning task | 0`, `Fail-open arms | 12`) sit at 1008–1010, also outside it.
So the property-side question is the same narrow one as at v14: does the restated P-A-6 make any
status claim about a property false, or change what a property owes?

**It does not, and it fixes the one live instruction that was wrong.** Lines 1180–1186 now read that
the PROPERTIES suite *"may be committed as soon as it is green — or, if it lands red, its rows are
handled under **P-A-7's governing case**, which at HEAD is **case C**: no ledger remains to amend
into, the obligation is green-at-landing, and a red landing is a real defect owed a fix **before
batch 14 runs**"*, and then quotes PLAN's rewritten rule verbatim. That is character-exact against
`PLAN-pdlc-learnings-injection.md:663`, which reads *"the PROPERTIES **suite** lands in one commit
once green, or else its rows are handled under **P-A-7's governing case** — which at HEAD is case C,
where no ledger remains to amend into and the obligation is green-at-landing; the
amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12 (TE v11 F-03)"*
(1 fixed-string hit). PLAN's v1.1 changelog row confirms the rewrite was deliberate and attributes it
to TE F-03 (`PLAN:682`, 1 hit). **F-01 is closed on all three limbs** it named: the route (line
1180), the *"byte-unchanged at v0.8"* currency claim (line 1192, now *"whose fallback route PLAN
rewrote at **v1.1**, restated above"*), and the header's blanket sentence (line 11, now scoped).

**The fix did not over-reach in the direction that would have cost something.** The restatement
carries the *"a red landing is a real defect owed a fix before batch 14 runs"* limb through from
PLAN's own case-C text rather than dropping the failure obligation while retiring the ledger route —
which is the failure mode a "no ledger remains" edit invites. The document's standing distinction is
preserved verbatim: *"the conclusion that **no property of this document changes either way** is
unaffected; what changes is only when its cases may land and which case of the table governs them"*
(line 1188), and the two-mechanism paragraph still separates P-A-7 case C (landed implementation
suites) from P-A-6 (this document's own suite) at line 1190–1193.

**The green measurement underneath the case-C statuses still reproduces at HEAD.** Re-run in
`pdlc/workflows` with the package's `--experimental-vm-modules` runner (`npx jest` directly fails to
parse the ESM suites, so the package script is required):

```
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
```

`grep -c 'test\.skip\|describe\.skip'` is `0` on both `learningsBlock.test.js` and
`learningsSelect.test.js`. Nothing in this delta disturbed the measurement its statuses rest on, and
the *"**unexercised**, not waived"* failure limb is unchanged.

**The extended case-C quotation at line 1131 is verbatim, not a paraphrase folded into quote marks.**
The delta moves the closing quote from after *"they owe green"* to after *"— which PROPERTIES §C.4
records as discharged"*. I checked this specifically, because extending a quotation to swallow a
downstream clause is exactly how an implementation echo enters a document: PLAN at `:561` carries
*"under case C they owe no ledger row, and they owe green — which PROPERTIES §C.4 records as
discharged"* as one continuous sentence (1 fixed-string hit). The extension is PLAN's own text.

**Nothing was added to or dropped from the property set.** `Properties with **no** owning task | 0`
is byte-unchanged, and gap 5's new `helpers/learningsComposition.js` clause is careful to say the
file is *"unnamed but not unexercised"* — it changes what the prose discloses, not what any property
asserts.

## Oracles

## Fixtures

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict

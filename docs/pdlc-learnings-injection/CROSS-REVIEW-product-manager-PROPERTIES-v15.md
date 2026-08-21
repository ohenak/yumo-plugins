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

## Oracles

## Fixtures

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict

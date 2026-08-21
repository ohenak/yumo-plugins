# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 8 (delta re-review under DECISION FREEZE — PROPERTIES v0.4 → v0.5)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · DECISIONS `sha256:56617f5ab31a…` · PLAN
`sha256:b9fbd3eacb1b…` (v0.7, unchanged since my v7) · PROPERTIES under review
`sha256:6341096d6011…` (**v0.5**, was v0.4 `sha256:599a97a029e5…`), branch
`feat-pdlc-learnings-injection` at `7ac7fe8b`.

## Overview

**The question.** At v7 I raised two High findings and two non-gating ones, all four confined to
§C.4's HEAD accounting: the fourteen-row test-file inventory contradicted the very
`git ls-files pdlc/workflows/__tests__` measurement the section says it restates (F-01), the
ledger-routing conclusion derived from it was written against a batch-13-in-the-future world (F-02),
the four amendment cases owed to `learningsBlock.test.js` were not recorded as having lost their
red-owning task (F-03), and the header attributed PLAN's P-A-7 two-case table to v0.6/v0.7 when v0.6
alone added it (F-04). This round measures v0.5 — 84 insertions / 45 deletions in two regions
(header cell, §C.4), across four commits `21edb7c5`, `91aeb6bb`, `4cb84db5`, `7ac7fe8b` — against
those findings and against the repository at `7ac7fe8b`.

**All four of my v7 findings are resolved, and the two High ones are resolved with evidence I could
re-run.** The inventory is not merely corrected but re-founded: it is now declared a *snapshot, not a
live claim*, pinned to the commit the command was run at (`21edb7c5`), with an added **Added by**
column carrying the adding commit for every row — which is exactly the shape my v7 DEFERRED item
asked for, taken up unprompted. I checked all fourteen adding shas independently
(`git log --diff-filter=A`) and **all fourteen match**. The ledger paragraph is restated against
HEAD, correctly concluding that case A is unreachable and case B is live, and the P-A-6 deferral is
described as spent rather than pending. F-03's four owed cases are recorded with the grep evidence I
used, and the header now attributes the table to v0.6 with v0.7's four actual changelog items named.

**One defect this delta introduced.** §C.4's new closing sentence says the two gaps it finds in
PLAN case B's wording are *"routed as errata rather than decided here"* (line 1124). §G.3 — the
document's own **Routed Errata** list, unchanged by this delta — still reads *"Still open — one item,
re-routed this round"* and carries only the AT-15 suite-assignment item. Nothing routes the two new
gaps. That is one High finding in the freeze's category (i), and it is the *same* pattern §G.3 itself
records as a past failure in its struck P-A-7 entry: *"§C.4 asserted this routing and this list did
not carry it, so it reached no author from here (PM v5 F-01)."* The fix is three lines in §G.3. So
the PLAN work is not held up behind that edit, I route both gaps upward myself in this review's
ERRATUM lines.

**Nothing else moves.** No property, oracle, fixture, AT id, severity, group membership or red/green
trace changed in this delta; §C.4's count table (70 / 35 / 23 / 21 / 12) is byte-unchanged.

## Properties

**No property moves, and none is disturbed.** The diff touches the `Upstream` header cell, the
version cell (0.4 → 0.5) and §C.4. No property id, no `red LI-xx` / `green LI-yy` trace, no AT id, no
severity and no group membership changed. §C.4's reconciliation table — 70 properties, 35 ATs, 23
tasks, 21 owning tasks, 0 properties with no owning task, 12 fail-open arms (lines 1054–1062) — is
byte-unchanged, as is §C.3's 23-of-23 task accounting.

**The inventory now agrees with the repository, row for row.** I re-ran the document's own stated
method and independently derived each adding commit rather than reading them from the table:

| §C.4 row | Owning task | Tracked at `21edb7c5` | `git log --diff-filter=A` | Table says | Match |
|---|---|---|---|---|---|
| `helpers/learningsFixtures.js` | LI-02 | yes | `1920f281` | `1920f281` | ✓ |
| `learningsPremises.test.js` | LI-01 | yes | `cdeb1509` | `cdeb1509` | ✓ |
| `learningsCaptureScript.test.js` | LI-03 | yes | `688a5651` | `688a5651` | ✓ |
| `learningsPredicatePin.test.js` | LI-13 | yes | `07af8f52` | `07af8f52` | ✓ |
| `learningsSelect.test.js` | LI-07 | yes | `1544fdbd` | `1544fdbd` | ✓ |
| `learningsBlock.test.js` | LI-08 | yes | `5e522a52` | `5e522a52` | ✓ |
| `learningsCorpus.test.js` | LI-09 | yes | `b79b7859` | `b79b7859` | ✓ |
| `learningsBaselineGuard.test.js` | LI-06 | yes | `4a6c1816` | `4a6c1816` | ✓ |
| `learningsRecord.test.js` | LI-10 | yes | `2fe07964` | `2fe07964` | ✓ |
| `learningsDispatchSet.test.js` | LI-11 | yes | `c3e723e5` | `c3e723e5` | ✓ |
| `learningsConfig.test.js` | LI-12 | yes | `eb32d7d2` | `eb32d7d2` | ✓ |
| `learningsArmInventory.test.js` | LI-23 | yes | `100e3d9c` | `100e3d9c` | ✓ |
| `learningsSuiteMap.test.js` | LI-14 | yes | `960c229c` | `960c229c` | ✓ |
| `fixtures/learnings-baseline/` | LI-06 | yes (`MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/{0,1}.txt`) | `4a6c1816` | `4a6c1816` | ✓ |

Fourteen of fourteen, exactly as stated (**F-01 of v7 resolved**). The snapshot pin is honest too:
`git diff --name-status 21edb7c5 HEAD` returns only this PROPERTIES document, so no test file has
landed since the pin and the table is current as well as pinned.

**The task-id accounting is right in both directions.** `git log main..HEAD` yields commits for
**LI-01…LI-21 and LI-23**, and LI-22 alone has none — precisely what line 1096 claims. LI-22 owning
none of the fourteen is confirmed in PLAN's own LI-22 row (a 🔵 REFACTOR-and-close task whose
artifact is a full-suite green run plus the human cross-check of LI-23's arm inventory, not a file).
LI-04's `.gitignore:13` `/.baseline-worktree/` rule is present and landed at `ae2af1da`, matching the
new parenthetical.

**The ledger restatement is now true at HEAD (F-02 of v7 resolved).** LI-08 `5e522a52`, LI-17
`2cbacada`, LI-16 `d462ddd8` and LI-21 `92b7ea0c` are all on the branch. PLAN's case A is scoped
*"before batch 7"* (PLAN line 491) and case B to *"batch 9 or later"* (line 492), so "case B is the
live case and case A is unreachable" follows from the repository, not from assertion. P-A-6's text at
PLAN line 590 does say the PROPERTIES suite commits *"at the first point the suite is green, which in
practice is after LI-21 (batch 13)"* — so "spent, not pending" is the correct reading now that
`92b7ea0c` has landed. The paragraph also keeps the conclusion that mattered — *no property of this
document changes either way* — and my v7 DEFERRED item asking that the two sentences be reconciled
into one claim is closed by the new closing paragraph separating P-A-7 case B (the implementation
suite) from P-A-6 (this document's own suite).

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

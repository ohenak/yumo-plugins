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

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

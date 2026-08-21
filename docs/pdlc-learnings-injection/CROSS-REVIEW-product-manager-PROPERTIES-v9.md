# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 9 (delta re-review under DECISION FREEZE — PROPERTIES v0.5 → v0.6)

**UPSTREAM-STATE at this review:** REQ (v0.9) · FSPEC (v0.13) · TSPEC (v0.9) · DECISIONS · PLAN
(v0.7, unchanged since my v7) · PROPERTIES under review **v0.6** (was v0.5), branch
`feat-pdlc-learnings-injection` at `23adb5e5`, previously reviewed at `7ac7fe8b`.

## Overview

**The question.** At v8 I raised one High finding and two Low ones, all three inside §C.4's HEAD
accounting and §G.3's routed-errata list. F-01: §C.4's closing sentence claimed two newly found gaps
in PLAN's P-A-7 case B were *"routed as errata rather than decided here"*, while §G.3 — the list that
does the routing — still read *"Still open — one item, re-routed this round"* and carried neither, so
the sentence was false and the gaps reached no author from this document. F-02: the P-A-6 citation was
punctuated as a quotation but substituted *it* for *the suite*. F-03: four bare `file:line` anchors
(`learningsConfig.test.js:226`/`:242`/`:258`, `.gitignore:13`) with no quoted text beside them, a Low
`Process` item under `DEC-DOC-01`. This round measures v0.6 — 32 insertions / 10 deletions across two
commits (`2769ce86` §G.3, `23adb5e5` §C.4) — against those three findings and against the repository
at `23adb5e5`.

**All three findings are resolved, and the High one is resolved exactly as specified.** §G.3 now reads
*"Still open — three items:"* and carries both P-A-7 case-B gaps as their own bullets ahead of the
AT-15 item, each stating the gap, the evidence at the pinned commit, and an explicit *"this document
routes the gap and decides nothing"* disclaimer that keeps PLAN's call unprejudged — which is what my
v8 Q-01 asked for. §C.4's sentence needed no edit and got none; it is now true because the list
carries what it asserts. F-02's quote is restored verbatim (*"the first point the suite is green"*,
matching PLAN P-A-6). F-03's anchors are replaced by the three `test(` titles quoted in full and by
the rule text `/.baseline-worktree/`.

**The delta also absorbs SE v8 F-02, and the absorption is a correction I got wrong at v8.** My v8
Oracles section endorsed §C.4's claim that `learningsBlock.test.js` *"carries no un-numbered
`## Cross-Feature Patterns` … arm"*. That was too strong: the spelling does appear, and the suite
asserts the matcher accepts it. v0.6 narrows the claim rather than restating it — the un-numbered
spelling *does* appear as LI-AT-05's material and LI-AT-12's fixture text, with
`expect(result.sections).toEqual(["Cross-Feature Patterns"])` proving acceptance, so *"what is owed
there is the variant fixture as a whole, not that spelling"*. I re-measured the file and the narrowed
claim is correct in every conjunct.

**Nothing else moves, and nothing broke.** No property, oracle, fixture, AT id, severity, group
membership or red/green trace changed. §C.4's count table (70 / 35 / 23 / 21 / 12) and the fourteen-row
inventory are byte-unchanged, and the `21edb7c5` pin is still honest: `git diff --name-status 21edb7c5
HEAD` returns only this PROPERTIES document and the two v8 cross-reviews — no test file has landed
since the pin.

**One Low finding, delta-introduced.** §G.3's second new bullet quotes PLAN case B as *"every batch
from the landing batch through the batch that greens them"*; PLAN reads *"every batch from the one the
commit lands in through the batch that greens them"* (PLAN line 492). Same meaning, not verbatim — the
same class as v8's F-02, fixed in one place and reintroduced in another. Low, non-gating, recorded
below.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

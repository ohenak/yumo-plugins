# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.3)
**Date:** 2026-08-21
**Iteration:** 15 (delta confirmation — erratum round, decision freeze in force)

## Overview

**What this round is.** A delta confirmation on the v1.2 → v1.3 erratum edit, not a re-read. I
approved this PLAN at v0.5/v0.6/v0.7 and confirmed v0.8, v0.9, v1.1 and v1.2. Round 14 closed
**Needs revision** on two High findings — F-01 (the §Post-batch remediation subsection recorded six
of `2fc6fcd3`'s surfaces and stated that count as complete) and F-02 (the PLAN's
`pdlc/workflows/package.json` coverage story was falsified at HEAD by that same commit) — plus two
Lows (F-03 stale upstream pins, F-04 the "fourteen new test files" count).

**Scope, derived from the diff rather than from the changelog.** `git diff 95098af5..6792fa5f --
PLAN` measures **74 insertions / 35 deletions in one file**, across ten hunks: the header pin cell
and version cell, §Overview's "fourteen" sentence and its citation line, the §Overview
change-surface `package.json` row, LI-12's description cell (a `v0.13` → `v0.14` string only),
§Production and generated's `package.json` bullet, the §Post-batch remediation subsection (lead-in,
thirteen added table rows, generalised single-writer paragraph), §The arithmetic's closing sentence,
the `RSN-NO-MATERIAL` arm row and the arm paragraph, the F-O-1 obligations row, case A's derivation
sentence, DoD 11 and DoD 12, and five changelog rows (0.5/0.6 re-ordered, 0.9 re-credited, 1.3
added).

**Result: all four prior findings resolved, and I measured each rather than reading the changelog's
account of itself.** F-01 and F-02 — the two Highs — are closed against `git show --name-status
2fc6fcd3` and against the shipped `c8` block in `pdlc/workflows/package.json`, not against the
edit's own claims. F-03 and F-04 are closed too. The edit introduced no defect in anything I had
already approved: the two dispatcher-parsed task tables and the batches 7–13 expected-red ledger are
byte-identical across the delta, which I verified mechanically (§Batches).

**One new Low.** The `2fc6fcd3` rows credit CODE_REVIEW v1 finding ids that the code itself
attributes differently in two places — the `selectLearnings` signature drop is F3 in
`learningsSelect.test.js` and the `_log` wiring is F2 in `orchestrate-dev.js`, while the manifest row
and the subsection lead-in credit both to F1 and list neither id. That is provenance annotation in
the "why" column, not a dispatcher or gate input, and no file, owner, batch or single-writer claim
moves with it. Non-gating; recorded as F-01 below.

## Batches

**No task row moved, and I measured that mechanically rather than accepting the changelog's word.**
I extracted the last four cells of every `| LI-NN |` row — files, `Owner`/production file, `Batch`,
`Deps`, `Status` — from both `95098af5` and `6792fa5f` and diffed them: **identical**. The
expected-red ledger table (`| After batch | Landed by | Still expected red |`, PLAN:535–549) is
likewise **byte-identical** across the delta. The only touch inside a dispatcher-parsed table is
LI-12's description cell, where `FSPEC v0.13` became `FSPEC v0.14` twice; no `Batch`, `Deps`, file
or `Status` cell is on either side of the diff, so the batch-DAG derivation cannot have been
perturbed. `[Fake first]` labelling on LI-02, LI-06 and LI-23 and every red-before-green pairing are
untouched.

**F-01 (round 14, High, delta/local) — resolved, and the enumeration is now complete by set
equality, which is the standard my lens asked for.** `git show --name-status 2fc6fcd3` reports
**45 paths** (23 A / 22 M), which is exactly the number the new lead-in states. Its partition
reconciles to 45 with nothing left over:

| Lead-in's class | Claimed | Measured |
|---|---|---|
| added fixture prompts under `PIPELINE-NON-AUTHORING-PROMPTS/` | 18 | 18 (`.../fixtures/learnings-baseline/PIPELINE-NON-AUTHORING-PROMPTS/*.txt`) |
| added test-side files | 5 | 5 (`helpers/learningsBaselineScenarios.js`, `helpers/learningsComposition.js`, `learningsDisclosure.test.js`, `learningsErratumBinding.test.js`, `pdlc/engine/__tests__/learnings-config-example.test.js`) |
| modified under `pdlc/workflows/__tests__/` | 9 | 9 (`coverageInstrumentation`, `fixtures/learnings-baseline/MANIFEST.json`, `learningsArmInventory`, `learningsBaselineGuard`, `learningsCaptureScript`, `learningsConfig`, `learningsCorpus`, `learningsDispatchSet`, `learningsSelect`) |
| modified pre-existing engine suite | 1 | 1 (`pdlc/engine/__tests__/docs-uniqueness.test.js`) |
| modified production/configuration | 4 | 4 (`orchestrate-dev.js`, `scripts/capture-learnings-baseline.mjs`, `pdlc/workflows/package.json`, `pdlc/workflows/.gitignore`) |
| regenerated `dist/pdlc-cli.mjs` | 1 | 1 |
| pipeline/document files | 7 | 7 (`REQ`, `FSPEC`, `TSPEC`, `CLAUDE.md`, `pdlc/OPERATIONS.md`, `pdlc/README.md`, `.claude/pdlc.config.example.json`) |
| **total** | **45** | **45** |

The subsection's table carries **nineteen rows** (measured by parse, not by counting on the page):
five added files, LI-06's two second-writer rows, the six ladder-owned suites round 14 named
(LI-03 `learningsCaptureScript`, LI-07 `learningsSelect`, LI-09 `learningsCorpus`, LI-11
`learningsDispatchSet`, LI-12 `learningsConfig`, LI-23 `learningsArmInventory`), `orchestrate-dev.js`
(LI-15…LI-22), `scripts/capture-learnings-baseline.mjs` (LI-05), `pdlc/workflows/package.json`,
`pdlc/workflows/.gitignore`, `coverageInstrumentation.test.js` and `docs-uniqueness.test.js`. The
two paths with no row — `dist/pdlc-cli.mjs` and the seven pipeline documents — are excused *in the
lead-in by name*, so the table closes over the commit rather than merely containing part of it. The
claim that LI-04's **root** `.gitignore` is not in the commit is true: the only `.gitignore` present
is `pdlc/workflows/.gitignore`, `1	0`, adding the single line `/.tmp-capture-driver-*/`.

**The per-row rationales are true, not decorative.** `orchestrate-dev.js` `15	6` and
`scripts/capture-learnings-baseline.mjs` `74	19` match the row's stated counts exactly. The
`learningsCorpus` (`0	3`) and `learningsArmInventory` (`0	7`) diffs are pure removals of
`feature:` arguments — the row's "tracks the same `selectLearnings` signature change" is what the
bytes show. `learningsDispatchSet` imports `composeAuthoringPrompts` from the new
`helpers/learningsComposition.js` (F8, as the row says); `learningsCaptureScript` adds a
`captureFixturesFromWorktree` describe block driving the script directly (F4 round 2, as the row
says); `learningsConfig` adds a `configReadError` seam arm. Every second-writer row names a ladder
owner and batch that matches the ladder table.

**The generalised single-writer paragraph is sound and no weaker than the two-row version it
replaced.** It still argues from serialisation — one commit, landing after batch 13, no batch in
flight — which is the property batch-safety rule 2 protects, and it now says explicitly that the
same argument covers every row identically and that ladder ownership does not move. That is the
right generalisation: the reasoning was never per-file.

## Dependencies

**F-03 (round 14, Low) — resolved.** The header now pins `TSPEC (v0.9); FSPEC (v0.14); REQ (v0.10);
DECISIONS (v0.5)` (PLAN:11), matching the versions this dispatch carries, and §Overview's citation
sentence reads `REQ v0.10 / FSPEC v0.14 / TSPEC v0.9` (PLAN:40). The three in-prose quotations moved
with it: LI-12's `FSPEC v0.14's AT-30` and `BR-9/D-12 as restated in FSPEC v0.14` (PLAN:156), the
`RSN-NO-MATERIAL` arm row (PLAN:426) and its paragraph (PLAN:434), and the F-O-1 obligations row
(PLAN:440). A grep for `v0.13` now returns **only changelog rows**, where a superseded pin is the
historical record and is correct — the 0.1 row's `REQ v0.9 / FSPEC v0.10 / TSPEC v0.6` is the same
case. No substantive citation moved: this was a pin refresh, exactly as round 14 recorded, and I
re-verified at round 14 that AC-2.4's cause-defined attribution still routes through AT-13, that
E-36/AT-30's three zero-threshold cases are unmoved, and that F-O-1's two heading rules are
unchanged. Nothing in this delta disturbs those conclusions.

**F-04 (round 14, Low) — resolved, and the arithmetic now reconciles in both directions.** §Overview
reads "fourteen new test files **scheduled by the batch ladder**" and adds the tree count beside it:
eighteen at `09c7c62f`, "fourteen `learnings*.test.js` suites and three helpers under
`pdlc/workflows/__tests__/`, plus `pdlc/engine/__tests__/learnings-config-example.test.js`". Measured
with `git ls-tree -r --name-only 09c7c62f`: seventeen matching paths under
`pdlc/workflows/__tests__/` — fourteen `learnings*.test.js` and three `helpers/learnings*.js`
(`learningsBaselineScenarios.js`, `learningsComposition.js`, `learningsFixtures.js`) — plus the one
engine-side file. **18, exactly as stated.** §The arithmetic's new closing sentence reconciles the
same number from the other side: "the ladder's thirteen (twelve suites plus
`helpers/learningsFixtures.js`; the fourteenth test row is the fixture subtree, a directory), plus
`2fc6fcd3`'s five added files" — and 14 suites minus the two `2fc6fcd3` added (`learningsDisclosure`,
`learningsErratumBinding`) is indeed twelve. Both decompositions land on 18 and agree with the tree.

**§The arithmetic's scoping survived the row growth.** The sentence still scopes the twenty-four-row
count to "the **two dispatcher-parsed tables only**" and now says §Post-batch remediation's
**nineteen** rows are excluded by construction — the number I counted. The dispatcher's manifest
check therefore still sees exactly what it saw at v1.1, which is the property that made the
landing-commit column the right call in the first place.

**Upstream agreement is unbroken.** PROPERTIES §C.4's record of P-A-7 case C discharged green is
unchanged by this delta — case C's cell is not in the diff — and the four unowned remediation files
PROPERTIES routed here as its §G.2 gap 5 are now a superset in this PLAN (five new files, thirteen
second writes), so the routing is over-satisfied rather than partially satisfied. No new upstream
defect surfaced in the changed sections; I raise no `ERRATUM:` this round.

## Verification

## Recommendation

## Delta-Confirmation Findings

## Verdict

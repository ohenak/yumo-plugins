# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 7 (delta re-review under DECISION FREEZE — PROPERTIES v0.3 → v0.4)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · DECISIONS `sha256:56617f5ab31a…` · PLAN
`sha256:b9fbd3eacb1b…` (**v0.7**, was v0.6 `sha256:d028d972450c…` at my v6) · PROPERTIES under
review `sha256:599a97a029e5…` (**v0.4**, was v0.3 `sha256:6d74d3eb5a23…`), branch
`feat-pdlc-learnings-injection` at `a12b20f9`.

## Overview

**The question.** I approved PROPERTIES v0.3 at v5 and confirmed it against PLAN v0.6 at v6 with
three non-gating items (F-01 pin, F-02 routed-item-now-answered, F-03 which properties travel under
P-A-7's case A vs case B). This round measures v0.4 — 39 insertions / 17 deletions across five
hunks (`315bdc3c`, `353e1f26`, `d6f90732`, `a12b20f9`) — against my own findings and against the
repository at `a12b20f9`.

**All three of my v6 findings are resolved.** The pin reads PLAN v0.7, §C.4 restates the routed
ledger-naming item as answered and cites PLAN's two-case table, §G.3 gains the struck row that the
item was never carried on, and the four-not-three property count is now explicit. A fourth item the
delta fixed unprompted is real: three citations of `TSPEC §T.5, T-O-6` now read *TSPEC, Named
obligations carried forward* — the correct locator, since T-O-6 lives in
`TSPEC-pdlc-learnings-injection.md` under **Named obligations carried forward** (line 1511) while
§T.5 is the *Acceptance test → suite mapping* (line 1200).

**But the revision's central move — re-measuring §C.4 against HEAD — is half-done, and the half it
did not do is now false.** §C.4 announces its method in its own words: *"the count is restated
against `git ls-files pdlc/workflows/__tests__` at HEAD"* (line 1068). Running exactly that command
at `a12b20f9` returns **all fourteen** of the rows the table lists, including the seven the table
still marks *not yet created*. The delta re-measured `git ls-files scripts/` (correctly, LI-05 has
landed) and did not re-run the command §C.4 cites for its own table. Two High findings follow, both
in the freeze's category (ii) — a factual contradiction with the repository at HEAD that makes a
load-bearing claim in this document false — and both confined to §C.4's HEAD accounting. Nothing in
the property catalogue, the oracles or the fixtures moves.

## Properties

**No property in the catalogue moves, and none is disturbed by this delta.** The diff touches the
header row, three citation locators, §C.4's HEAD accounting and §G.3's answered-item list. No
property id, no `red LI-xx` / `green LI-yy` trace, no AT id, no severity and no group membership
changed. §C.3's 23-of-23 task accounting and §C.4's count table (70 properties, 35 ATs, 23 tasks, 21
owning tasks, 12 fail-open arms — lines 1054–1062) are byte-unchanged, and PLAN v0.7's own changelog
confirms the upstream half of that: *"No task moved batch, no `Deps` edge changed, no AT partition,
fixture or manifest row was touched"* (PLAN line 8 of the changelog).

**Where the document now contradicts HEAD.** §C.4's fourteen-row inventory (lines 1070–1085) marks
seven rows *not yet created*. Every one of them is tracked at `a12b20f9`:

| §C.4 row | §C.4 says | At HEAD (`git ls-tree HEAD`) | Landed by |
|---|---|---|---|
| `learningsBaselineGuard.test.js` | not yet created | tracked | `4a6c1816` (LI-06) |
| `learningsRecord.test.js` | not yet created | tracked | `2fe07964` (LI-10 RED), last touched `92b7ea0c` |
| `learningsDispatchSet.test.js` | not yet created | tracked | `c3e723e5` (LI-11) |
| `learningsConfig.test.js` | not yet created | tracked | `eb32d7d2` (LI-12 RED) |
| `learningsArmInventory.test.js` | not yet created | tracked | `100e3d9c` (LI-23) |
| `learningsSuiteMap.test.js` | not yet created | tracked | `960c229c` (LI-14) |
| `fixtures/learnings-baseline/` | not yet created | tracked (`MANIFEST.json` + three `.txt`) | `4a6c1816` (LI-06) |

So *"Seven of the fourteen files have landed … The remaining seven are explicitly planned and
unstarted"* (lines 1087–1091) is false at HEAD: **fourteen of fourteen** have landed (F-01). The
same paragraph's later clause *"PROP-CONFIG-09 in the not-yet-created `learningsConfig.test.js`
(LI-12)"* (lines 1105–1106) is false for the same reason.

**The consequence is not cosmetic, because §C.4's ledger conclusion is derived from it.** Lines
1100–1103 conclude that this document's four landed-suite properties *"travel under P-A-6's rule,
which holds the PROPERTIES suite's commit to the first point it is green (in practice after LI-21,
batch 13), so they enter no ledger row unless that commit is brought forward."* At HEAD, LI-16
(`d462ddd8`), LI-17 (`2cbacada`) and LI-21 (`92b7ea0c`) have all landed — 22 of the 23 tasks have
commits on this branch, LI-22 being the only id absent. Batch 13 is behind us, not ahead: PLAN
P-A-7's **case A** (*"before batch 7"*, PLAN line 489) is unreachable, and P-A-6's "commit at the
first point it is green" deferral is spent rather than pending (F-02). The document's own routing
conclusion has to be restated against the world at HEAD before a reader can act on it.

None of this changes a property. It changes what §C.4 tells the next reader about where those
properties' cases must land and what the PLAN owes for them.

## Oracles

**No oracle text changed in this delta, and no oracle reads §C.4.** The three edited citations are
locator repairs inside prose that surrounds oracles, not oracle statements:

- PROP-BOUND-03's zero-return note (line 247) and §O.9's generated-bound paragraph (line 786) now
  cite *TSPEC, Named obligations carried forward, T-O-6* instead of the non-existent `§T.5, T-O-6`.
  The quoted instruction — *"State the zero conjunct, keep `0` in the domain"* — is verbatim in
  TSPEC line 1511, as is the four-field zero return `{material: "", bounded: false, bytes: 0,
  sections: []}` the oracle transcribes. The expected values remain literal transcriptions from the
  spec, not derived from the implementation.
- §O.5's L3 table row for PROP-CONFIG-09 (line 707) takes the same repair and keeps its
  positive/negative pairing (`RSN-NO-MATERIAL` present **and** no document carrying `RSN-COUNT`),
  which is the conjunct set PLAN v0.7's LI-AT-30 still names.
- §G.1's T-O-6 row (line 1125) is the same repair. Its partition claim — PROP-BOUND-03 owns the
  unit's whole return domain, PROP-CONFIG-09 owns the run-level consequences — is unchanged and
  still set-partitioned by observable, so a deleted case fails rather than passing vacuously.

**One state-of-the-world check the oracles now invite.** §C.4 continues to describe PROP-BOUND-03's
zero case and PROP-BOUND-05/07/08's heading-form amendments as *pending* edits to the landed
`learningsBlock.test.js`. That is correct as far as it goes — at HEAD the suite is 7.6 K, declares
three ATs (`describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)")`,
`learningsBlock.test.js:38`), and carries **none** of the four amendment cases: no un-numbered
`## Cross-Feature Patterns` / un-glossed `## Rejected Proposals` heading-form arm, no `###`-as-body
case, no `## Process Findings` near-miss, and no `extractInjectableMaterial(text, 0)` case (the only
`maxBytes` literals in the file are `40` at line 111 and `66` at line 131). But their **green owners
have already landed** (LI-16 `d462ddd8`, LI-17 `2cbacada`), so these four oracles are, at HEAD,
property-owed test cases with no remaining red-owning task ahead of them. That is a Medium worth
recording in §C.4 alongside the corrected inventory (F-03); it is also the upstream gap I route to
PLAN below, since P-A-7's case table stops at *"the batch that greens them"* and no such batch
remains.

## Fixtures

**No fixture claim is invalidated by the delta, and one is repaired by it.**

| Fixture dependency in PROPERTIES | State at HEAD `a12b20f9` | Effect of this delta |
|---|---|---|
| `helpers/learningsFixtures.js` (LI-02) | tracked (`1920f281`) | unchanged; §C.4's row already read *exists (landed)* |
| §F.1's named corpora (`NO-MATERIAL`, `ZERO-BOUND`, `DIVERGENT-CORPUS`, the five-section AT-11 fixture) | declared through that helper | untouched by the delta; PLAN v0.7's changelog re-asserts *"no AT partition, fixture or manifest row was touched"* |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | `learningsBlock.test.js:106–139` still carries the 25 + 2 + n arithmetic in comments and literal expected strings | unchanged — and correctly still **transcribed**, not computed from the unit under test |
| PROP-BOUND-08's real-corpus arm (first `git ls-files` path) | reads the live corpus | unaffected |
| `scripts/capture-learnings-baseline.mjs` | **tracked** — `git ls-files scripts/` returns exactly that one path, landed at `ced75955` ("LI-05 — GREEN the capture script") | **repaired by this delta**: lines 1114–1118 replace the old *"the repository has no root-level `scripts/` directory today"* with the landed state and say plainly that the earlier sentence was true when written. This is exactly the right correction, correctly evidenced |
| `fixtures/learnings-baseline/` (LI-06) | **tracked** — `MANIFEST.json` plus `PHASE-F-AUTHORING-PROMPT/0.txt` and two `PHASE-R-REVIEW-PROMPTS/*.txt`, landed at `4a6c1816` | **not** repaired: §C.4 line 1085 still reads *not yet created*. Same defect class as the `scripts/` sentence the delta did fix — this is the fourteenth row of F-01 |

The asymmetry is the finding in miniature: the author re-measured one path and wrote an exemplary
correction for it, then left the table that the same method governs at its previous reading. The
baseline fixture directory is the clearest case, because it is the only non-`.test.js` row in the
inventory and it landed with its own guard suite (`learningsBaselineGuard.test.js`, 11 passing per
`4a6c1816`'s message).

No property's fixture bytes move under any of this, and no generator or corpus declaration changes.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | **High** | Local | §C.4's test-file inventory (lines 1070–1085) marks seven rows *not yet created*; all seven are tracked at HEAD — `learningsBaselineGuard.test.js` (`4a6c1816`), `learningsRecord.test.js` (`2fe07964`), `learningsDispatchSet.test.js` (`c3e723e5`), `learningsConfig.test.js` (`eb32d7d2`), `learningsArmInventory.test.js` (`100e3d9c`), `learningsSuiteMap.test.js` (`960c229c`), `fixtures/learnings-baseline/` (`4a6c1816`). The section states its own method — *"restated against `git ls-files pdlc/workflows/__tests__` at HEAD"* (line 1068) — and that command returns fourteen of fourteen. **Fix:** re-run it, set all fourteen rows to *exists (landed)*, and restate lines 1087–1091 as fourteen-of-fourteen with the task ids that landed them (LI-01…LI-14, LI-16…LI-21, LI-23; only LI-22 has no commit on this branch). Also correct *"the not-yet-created `learningsConfig.test.js` (LI-12)"* at lines 1105–1106 | PLAN §File-ownership manifest; §C.4 |
| F-02 | **High** | Local | §C.4's ledger conclusion (lines 1100–1103) rests on batch 13 being ahead: the four landed-suite properties *"travel under P-A-6's rule … in practice after LI-21, batch 13 … so they enter no ledger row unless that commit is brought forward."* At HEAD LI-16 (`d462ddd8`), LI-17 (`2cbacada`) and LI-21 (`92b7ea0c`) are landed, so PLAN P-A-7 case A (*"before batch 7"*, PLAN line 489) is unreachable and P-A-6's defer-until-green window is closed, not open. **Fix:** restate the paragraph against HEAD — say which of case A / case B is live now, and that the deferral P-A-6 offered has been overtaken — keeping the unchanged conclusion that no property of this document changes either way | PLAN P-A-6, P-A-7; §C.4 |
| F-03 | Medium | Local | At HEAD `learningsBlock.test.js` (7.6 K, `describe` at line 38 naming LI-AT-05/11/12) carries none of the four amendment cases §C.4 owes it — no non-canonical heading-form arm, no `###`-as-body case, no `## Process Findings` near-miss, no `extractInjectableMaterial(text, 0)` case (only `maxBytes` literals `40`:111 and `66`:131) — while both of their green owners have landed. Record in §C.4 that these four oracles are property-owed cases with no red-owning task remaining ahead of them, so a reader knows the amendment now lands into green code rather than into a scheduled red | PROP-BOUND-03/05/07/08; §C.4 |
| F-04 | Low | Local | The header `Upstream` cell now reads *"v0.6/v0.7 added the *Amendment commits on landed suites (P-A-7)* two-case table"*. PLAN's changelog attributes the two-case table to **v0.6** alone; v0.7's row lists LI-16 ownership, LI-AT-30's fixture precondition, ERR-8, LI-08's note relocation and the pin correction, and does not touch that table. Attribute it to v0.6 and pin v0.7 for what v0.7 did change | Header table, `Upstream` row |

**Deferred under the freeze** — recorded, not raised as findings:

DEFERRED: §C.4 lines 1093–1094 call the four properties' cases "a re-red on landed green code … exactly PLAN P-A-7's case" and lines 1100–1103 conclude they "enter no ledger row"; once F-02's restatement lands, reconcile the two sentences so the paragraph reads as one claim rather than two.
DEFERRED: §C.4's inventory would survive the next wave of commits if the *At HEAD* column carried the measuring commit sha beside the verdict, so a stale reading is visible without re-running the command.
DEFERRED: §G.3's newly struck P-A-7 item is written as prose about "PLAN v0.6/v0.7"; a bare pin to the PLAN section title would age better than a version pair.

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_

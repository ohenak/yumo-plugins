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

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_

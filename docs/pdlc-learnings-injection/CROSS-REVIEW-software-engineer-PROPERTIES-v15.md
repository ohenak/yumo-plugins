# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 15 (delta re-review under DECISION FREEZE — PROPERTIES v0.9 → v1.0)

## Overview

**What this round is.** A delta re-review, under decision freeze, of PROPERTIES **v0.9 → v1.0**. My
v14 approved v0.9 with one Medium (F-01, the re-pin's overreaching completeness claim, two sites) and
three Lows (F-02 a quotation period, F-03 a struck bullet one batch narrow, F-04 the inventory-row
"eighteen"). This round the document moved in five commits — `bc28ad0a`, `bb2d45f1`, `9c945683`,
`de2443f8`, `9e9a79e5` — totalling **56 insertions, 29 deletions** (`git diff --stat cb09985d HEAD` on
the document). I judge only whether my own prior findings are resolved and whether the revision broke
anything.

**The delta, measured.** `git diff -U0 cb09985d HEAD` returns **eleven hunks** at
`:11`, `:18`, `:1094`, `:1134`, `:1181`, `:1186`, `:1277`, `:1283`, `:1323`, `:1340`, `:1354`. Mapped
against the section map (`grep -n '^## '`: Overview `:20`, Properties `:87`, Oracles `:608`, Fixtures
`:809`, Coverage Matrix `:918`, Gaps `:1221`), **no hunk lands in §Properties, §Oracles or §Fixtures**.
Every hunk is in the header, §C.4 (inside §Coverage Matrix) or §G.2/§G.3. The header's claim — *"No
property, oracle, fixture, AT mapping or coverage row moves at v1.0 either"* — is therefore true for
properties, oracles, fixtures and AT mappings by construction of the diff; one §C.4 **inventory** row
cell did change (F-02 below).

**Every finding I filed at v14 is resolved.** This is the first round in five where that sentence is
true without a limb left over:

| v14 finding | Status at v1.0 | Evidence at HEAD |
|---|---|---|
| **F-01(a)** `:1181` still offered case B's retired amend-into-the-ledger fallback | **Resolved** | The clause is gone (`grep -n "amended into the ledger by name"` → **0 hits**) and replaced by P-A-7's governing case with PLAN v1.1's wording quoted verbatim; `grep -cF` of the 213-character quotation against PLAN → **1** (`PLAN:663`) |
| **F-01(a′)** `:1185`'s *"P-A-6 (byte-unchanged at v0.8)"* | **Resolved** | Now *"(whose fallback route PLAN rewrote at **v1.1**, restated above)"*; `grep -n "byte-unchanged at v0.8"` → **0 hits** |
| **F-01(b)** §G.3's *"Newly routed this round"* item asserting PLAN's manifest *"is now incomplete"* | **Resolved** | The item is struck and moved into *Also answered*, citing PLAN v1.2 items (3)/(4) and v1.3 item (1); `grep -n "manifest that is now incomplete"` → **0 hits** |
| **F-01(c)** the header's unscoped completeness claim | **Resolved** | Narrowed at `:11` to *"the rulings re-verified against PLAN at v1.3 in that pass — P-A-7's three cases and their windows"*, with the explicit carve-out *"**v1.0 extends the sweep to P-A-6**, which PLAN did move"* |
| **F-02** `:1131`'s quotation carried a period PLAN does not have | **Resolved** | Extended through the em-dash clause; `grep -cF "under case C they owe no ledger row, and they owe green — which PROPERTIES §C.4 records as discharged"` against PLAN → **1** |
| **F-03** struck bullet read *"landing **after** batch 13"* | **Resolved** | Now *"landing in batch 13 or later"*; `grep -n "after batch 13"` → **0 hits** |
| **F-04** "eighteen files" was an inventory-row count | **Resolved** | §G.2 gap 5 re-derived from the tree with both conventions stated and the two eighteens explicitly distinguished (verified below) |

**Verification method — repository, not documents.** `git ls-files` counts of the `learnings*` test
surface in both directories; `grep -cF` on every PLAN quotation the delta writes; the PLAN changelog
rows `:680`–`:684`; `PLAN:310` (§The arithmetic) and `PLAN:244`–`:293` (§Post-batch remediation) read
in full and its rows counted; `git show --name-status` on `2fc6fcd3` and `744311f7` for the fixture
subtree's two landing events; the `learningsComposition.js` header and `learningsDispatchSet.test.js`
import/spawn sites read directly; and a residual-staleness grep sweep of the document for all four
retired phrases.

**Conclusion up front.** The revision discharges every finding I filed, and the two counting claims it
adds — the hardest thing in this delta — are correct against `git ls-files` to the file. One **Medium**
stands, and it is the delta's own footprint: §C.4 `:1110` still says §G.3 *"routes to PLAN"* in the
present tense, which the same delta made false by striking that item forty lines later. Two **Lows**.
Nothing blocks: no property, oracle, fixture, AT mapping or coverage mapping moved, and I verified that
from the hunk offsets rather than from the assertion.

## Properties

**No property statement moved, and the hunk offsets prove it.** §Properties spans `:87`–`:607`; the
lowest hunk in the delta after the header is `:1094`. Groups A–J, their seventy `PROP-` statements,
their AT partitions, levels and owning tasks are byte-identical to the bytes I approved at v0.8, v0.9
and now v1.0. §C.1's 35-of-35, §C.2 and §C.3's 23-of-23 are likewise outside every hunk. Nothing this
round could have disturbed the property set, and nothing did — the fourth consecutive round in which
the document's scope claim survives being diffed rather than read.

**Every PLAN task the table lists still traces, because the trace did not move.** §C.3's reconciliation
of PLAN's 23 task rows against properties is untouched, and PLAN's task ladder is unchanged in the
relevant respect: `PLAN:310` still reconciles the tree, and PLAN's v1.2/v1.3 additions land in
**§Post-batch remediation**, a subsection explicitly *"outside the batch ladder"* whose rows *"carry no
`Owner` cell"* and are *"excluded from every count"* of §The arithmetic (`PLAN:244`, `PLAN:310`). So the
upstream movement this delta absorbs cannot have moved a task→property row: PLAN added rows to a table
the dispatcher does not parse, and §C.3 reconciles against the two tables it does.

**The four properties §C.4 routes are named identically before and after.** PROP-BOUND-03's zero case
and PROP-BOUND-05/07/08 appear unchanged in the delta; what moved is the *fallback route* a red
PROPERTIES suite would take (P-A-6), not the ruling over those four (P-A-7 case C). The two mechanisms
were already held distinct in this document since v0.3, and the delta restates that distinction rather
than editing it.

**The delta's load-bearing quotation is verbatim at HEAD.** The P-A-6 restatement at `:1181`–`:1187` is
the substantive change of this round, and it is a quotation, so the no-implementation-echo discipline
reduces to: is the string in PLAN? I ran `grep -cF` on the full quoted span, not a fragment:

| Quotation the delta writes | `grep -cF` in PLAN at HEAD |
|---|---|
| *"or else its rows are handled under **P-A-7's governing case** — which at HEAD is case C, where no ledger remains to amend into and the obligation is green-at-landing; the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* | **1** (`PLAN:663`) |
| *"under case C they owe no ledger row, and they owe green — which PROPERTIES §C.4 records as discharged"* | **1** (`PLAN:561`) |
| *"the tracked `learnings*` test-side set is eighteen files"* | **1** (`PLAN:310`) |

Three for three, including the one my v14 F-02 said returned **0**. The attribution *"PLAN rewrote that
fallback at **v1.1** (TE v11 F-03)"* is also correct at the version and the credit: `PLAN:682` (the v1.1
changelog row) reads *"P-A-6's PROPERTIES fallback stops offering case B's amend-into-the-ledger route
unconditionally and instead routes to **P-A-7's governing case**, which at HEAD is C … (TE F-03)"*.

**The counting claims are the risky part of this delta, and they are right to the file.** §G.2 gap 5 now
carries a three-way derivation, and every number in it resolves against `git ls-files` at HEAD:

| Claim at `:1284`–`:1300` | Measured at HEAD |
|---|---|
| *"seventeen `learnings*` files under `pdlc/workflows/__tests__`"* (subtree as a directory) | `git ls-files pdlc/workflows/__tests__ \| grep learnings \| grep -v fixtures/learnings-baseline/` → **17** |
| *"the ladder's thirteen (twelve suites plus `helpers/learningsFixtures.js`)"* | 14 manifest rows minus the fixture-subtree row = 12 `.test.js` + `learningsFixtures.js` = **13** |
| *"plus `2fc6fcd3`'s four added test-side files"* | `learningsBaselineScenarios.js`, `learningsComposition.js`, `learningsDisclosure.test.js`, `learningsErratumBinding.test.js` → **4**; 13 + 4 = 17 |
| *"an **eighteenth** engine-side, `pdlc/engine/__tests__/learnings-config-example.test.js`"* | `git ls-files pdlc/engine/__tests__ \| grep learnings` → exactly that one path |
| *"a raw `git ls-files … \| grep learnings` returns **39 paths**, of which 22 are that subtree's fixture files"* | **39** and **22**; 17 + 22 = 39 |
| *"§C.4's inventory table also totals **eighteen** … the fourteen manifest rows plus `2fc6fcd3`'s four workflows-side files"* | inventory table `:1079`–`:1098` → **18** rows, 14 + 4 |

That is the finding I filed at v13 and re-filed at v14 closed properly: not by changing the number, but
by naming the two sets the number counts and showing they coincide *"by coincidence of arithmetic, not
by naming the same entities"*. PLAN reaches eighteen by a different decomposition (`PLAN:310`: thirteen
ladder + *"`2fc6fcd3`'s five added files"*, the fifth being the engine-side suite), and the two
decompositions agree on the set — 13 + 5 = 17 + 1 = 18. Both are right; the document now says why.

## Oracles

**No oracle section moved.** §Oracles spans `:608`–`:808`; no hunk lands between `:18` and `:1094`.
§O.1–§O.9 and §G.1's obligation table are byte-identical. What the delta carries is quotation and
counting, so I applied the three test-discipline checks to those.

**No implementation echoes.** Every expected value the delta writes is a literal transcription from
PLAN or from a measurement command, never derived from the artifact it describes. The three `grep -cF`
results above are the proof for the quotations. For the counts, the delta does the stronger thing: it
publishes the command whose output it claims (*"a raw `git ls-files pdlc/workflows/__tests__ | grep
learnings` returns 39 paths"*), so the number is falsifiable by re-running rather than by re-reading.
I re-ran it; it returns 39.

**A negative was replaced by a positive on the same path — the exact shape the discipline asks for.**
The `:1181` edit's before-state was an absence-flavoured fallback (*"if it lands red, its rows are
amended into the ledger by name first"*), a route that no longer exists upstream. The after-state names
what **does** happen instead, on the same path and in three positive limbs: *"no ledger remains to amend
into, the obligation is green-at-landing, and a red landing is a real defect owed a fix **before batch
14 runs**"*. That last limb is the terminating condition PLAN v0.8 substituted for case B's ledger span
(`PLAN:684`-chain, case C), so the positive counterpart is upstream-anchored rather than invented here.

**The absence claim in §G.2 gap 5 also gained its positive counterpart.** The old text asserted only
what PLAN lacked (*"a reader using PLAN's manifest as the feature's test inventory would now under-count
by four"*). The new text pairs it with what exists: PLAN v1.2 items (3)/(4) and v1.3 item (1), the
**nineteen-row** §Post-batch remediation subsection, and the option PLAN chose among the three the item
left open. I counted the rows: `PLAN:271`–`:291` is a table of **19** data rows under a header and rule
line, exactly as claimed, and `PLAN:310` states the subsection is excluded from the ladder arithmetic.

**And the unowned-file claim gained an execution-path positive, which is the best thing in this delta.**
The old text said only that no property *names* `helpers/learningsComposition.js`. The new text keeps
that and adds what the file *does*: its header reads *"the AC-2.5 / PROP-ORDER-05 composition, in one
place so it can be driven from TWO SEPARATE NODE PROCESSES (CODE_REVIEW v1 F8)"*
(`pdlc/workflows/__tests__/helpers/learningsComposition.js:1`–`:3`, verbatim modulo the line wrap), and
the task-owned `learningsDispatchSet.test.js` both imports from it
(`learningsDispatchSet.test.js:42`, `import { composeAuthoringPrompts } from
"./helpers/learningsComposition.js"`) and spawns it as a child process
(`:47` `const COMPOSITION_CHILD_PATH = join(__dirname, "helpers", "learningsComposition.js")`, used at
`:531` `spawnSync(process.execPath, [COMPOSITION_CHILD_PATH], …)` beside the in-process call at `:528`).
The helper's own line `:46` names the role — *"The CLI entry point of the composition helper —
PROP-ORDER-05's SECOND process invocation"*. So the document's new sentence — *"PROP-ORDER-05's
two-process oracle **executes through** it"* — is true at the call site, not merely plausible. That
converts "unowned" from a coverage worry into a manifest-completeness fact, which is the correct
diagnosis and now the recorded one.

**Set-equality on the enumerations the delta touches.** Three enumerations are inside the delta and all
three are closed sets rather than containment claims:

- **The seventeen/eighteen file set.** Checked by difference, not by sampling: 17 non-fixture paths from
  `git ls-files`, 13 + 4 by provenance, both sides equal. A deleted file would break the equality on one
  side and not the other.
- **PLAN's nineteen remediation rows.** Counted, not quoted: 19 rows found, 19 claimed.
- **The four unowned files.** Named individually with their CODE_REVIEW v1 findings (F1/F7/F12, F8, F10,
  F11/F12), and each name resolves to a tracked path.

One scoping imprecision inside the last of these: *"Four of the seventeen no PLAN **task row** owns"* is
true as stated, but the engine-side eighteenth file is **also** owned by no task row — `PLAN:276` rows it
as *"new — no LI owner"*. Scoped to the seventeen the sentence is exact; a reader taking "four" as the
count of unowned files across the whole eighteen would be off by one. Low (F-03).

## Fixtures

**§F.1–§F.4 are byte-identical.** §Fixtures spans `:809`–`:917`; no hunk lands there. The fourteen-row
corpus fixture table, §F.2's byte-identity baseline rules, §F.3's verbatim-fixture-string rule and
§F.4's seam doubles are untouched, so no fixture, no generator and no test double moved this round.

**The one fixture-adjacent edit is in §C.4's inventory table, and it is a provenance correction that
checks out.** `:1094` widens the `fixtures/learnings-baseline/` row's *Added by* cell from a bare
`744311f7` to *"`744311f7` (subtree added; the `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18 files and the
`MANIFEST.json` re-capture arrived later, at `2fc6fcd3` — two landing events, recorded as PLAN
§Post-batch remediation's P-A-5 second-owner rows)"*. Each limb measured:

| Limb | Measured at HEAD |
|---|---|
| `744311f7` added the subtree | `git show --name-status 744311f7 -- …/fixtures/learnings-baseline` → **4 `A` paths**: `MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/{0,1}.txt` — exactly the four the row's descriptive cell lists |
| the `PIPELINE-NON-AUTHORING-PROMPTS/` arm is 18 files | `git ls-files …/PIPELINE-NON-AUTHORING-PROMPTS` → **18** |
| that arm arrived at `2fc6fcd3` | `git show --name-status 2fc6fcd3 -- …/PIPELINE-NON-AUTHORING-PROMPTS` → **18 `A` paths** |
| `MANIFEST.json` was **re-captured**, not added, at `2fc6fcd3` | that commit lists it `M`, not `A` |
| recorded as P-A-5 second-owner rows in PLAN | `PLAN:277` rows the subtree *"(incl. `MANIFEST.json`; +18 `PIPELINE-NON-AUTHORING-PROMPTS/*.txt`)"* and `PLAN:278` rows `learningsBaselineGuard.test.js` as **second writer** after LI-06 — two rows, plural as claimed |

This is the sharpest edit in the delta and the one I would have been least likely to ask for. The
inventory's *Added by* column had been carrying a single anchor for a row that is a **directory with two
landing events**, which is exactly the shape that makes a `git log --diff-filter=A -1` anchor silently
wrong for a subtree — the command reports the first add and says nothing about later arrivals. Naming
both events, and tying the second to the P-A-5 row that records it upstream, converts the row from an
anchor into an accounting.

**§F.3's verbatim-string rule is again what made the round checkable**, and this time the delta had no
paraphrase left to catch: the two phrases I flagged at v14 as narrower or over-punctuated (`:1131`'s
period, `:1340`'s *"after batch 13"*) are both re-cut to the normative string, and a sweep for all four
retired phrases — `manifest that is now incomplete`, `amended into the ledger by name`, `byte-unchanged
at v0.8`, `after batch 13` — returns **zero hits** across the whole document. That is the check I would
otherwise carry forward as "probably fixed in the visited paragraph, unknown elsewhere"; here it is
closed globally.

**Nothing in §C.4's fixture accounting turns on the header's coverage-row claim, but the claim is now
imprecise.** The header still asserts *"No property, oracle, fixture, AT mapping or coverage row moves at
v1.0 either"*, and §C.4's inventory table sits inside §Coverage Matrix (`:918`–`:1220`). No **mapping**
row moved — no property→AT, AT→test, or task→property cell changed, and I verified that from the hunk
offsets — but one inventory row's cell did. The convention this document has used since v0.8 clearly
means mapping rows, and the delta's own §G.2 text names the inventory change explicitly, so the claim is
loose rather than false. Low (F-02), and the fix is four words: *"no property, oracle, fixture, AT
mapping or coverage **mapping** row"*.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The delta struck §G.3's routed item but left §C.4's present-tense pointer to it.** `:1110` still reads *"…the fourteen-row manifest is no longer a complete listing of the feature's test surface, which §G.2 now records as a gap and **§G.3 routes to PLAN**."* That sentence was true before this delta and is false after it: the same revision struck the §G.3 item as *"answered, and answered before this round"* (`:1382`–`:1394`) and rewrote §G.2 gap 5 to say *"**PLAN has since closed it**"* (`:1310`). One document now says the item is routed and open, and, forty lines later, that it is struck and closed. The first half of `:1110`'s sentence remains true — PLAN's fourteen-row §File-ownership manifest is still fourteen rows at HEAD, with the remainder in §Post-batch remediation (`PLAN:244`) — so only the routing clause is stale. **Non-blocking:** no property, oracle, fixture, AT mapping or coverage mapping row depends on it; the two authoritative statements (§G.2 gap 5's closure record and §G.3's struck bullet) both say the resolved thing, and this is the one echo of the old state left behind. Fix: replace *"and §G.3 routes to PLAN"* with *"and §G.3 records as answered by PLAN v1.2/v1.3"*. | §C.4 `:1110` |
| F-02 | Low | Local | **The header's "no coverage row moves" claim is looser than the delta.** `:11` asserts *"No property, oracle, fixture, AT mapping or coverage row moves at v1.0 either"*, and one §C.4 inventory row's *Added by* cell did move (`:1094`, the `fixtures/learnings-baseline/` two-landing-events correction). §C.4 sits inside §Coverage Matrix (`:918`), so the claim reads as covering it. No **mapping** row moved — I verified that from the eleven hunk offsets against the section map, not from the assertion — and the edit is a provenance correction that the delta's own §G.2 text announces, so the claim is imprecise rather than untrue. Fix: say *"coverage **mapping** row"*, or add *"(one §C.4 inventory row's provenance cell is corrected)"*. | Header `:11`; §C.4 `:1094` |
| F-03 | Low | Local | **"Four of the seventeen" is exact but invites an off-by-one reading.** §G.2 gap 5 at `:1301` says *"Four of the seventeen no PLAN **task row** owns"*, having just established that the eighteenth file is engine-side. That eighteenth file is **also** owned by no task row — `PLAN:276` rows `pdlc/engine/__tests__/learnings-config-example.test.js` as *"new — no LI owner; the fifth added file"* — so across the full eighteen the unowned count is **five**, not four. Scoped to the seventeen the sentence is correct, and the four named files are the four this document has always routed, so nothing downstream is affected. Fix: *"Four of the seventeen — five of the eighteen, counting the engine-side file — no PLAN task row owns"*. | §G.2 gap 5 `:1301` |

**Prior-round findings — all four resolved.** My v14 carried no High, one Medium (F-01, in three sites)
and three Lows. **F-01(a)** the case-B fallback at `:1181` is replaced by P-A-7's governing case with
PLAN v1.1's wording quoted verbatim (`grep -cF` → 1 at `PLAN:663`); **F-01(a′)** `:1185`'s
*"byte-unchanged at v0.8"* is restated as *"whose fallback route PLAN rewrote at v1.1"*; **F-01(b)**
§G.3's routed manifest item is struck as answered, citing the PLAN versions that answered it;
**F-01(c)** the header's completeness claim is narrowed to the rulings actually re-checked and names
P-A-6 as the ruling that did move; **F-02** `:1131`'s quotation is extended through the em-dash clause
and now `grep -cF`s to 1; **F-03** the struck bullet reads *"batch 13 or later"*; **F-04** §G.2 gap 5 is
re-derived from the tree with both counting conventions stated and reconciled against `PLAN:310`. A
residual-phrase sweep for all four retired strings returns **zero hits** document-wide.

**Freeze accounting.** F-01 is the one finding in the freeze's blocking *category* — a defect this
revision introduced, an internal contradiction that did not exist in the bytes I approved at v0.9. I
record it at Medium and do not gate on it, on the same basis I have applied for four rounds: it is a
cross-reference in prose, no property, oracle, fixture, AT mapping or coverage mapping row turns on it,
and both authoritative statements of the item's status now say the resolved thing. F-02 and F-03 are
precision, not substance. I have opened no new decision, contested no settled one, and escalated no
unchanged substance; observations that would improve the document but are not defects are recorded as
`DEFERRED:` lines below.

DEFERRED: §C.4's inventory *Added by* column now carries one row whose cell is a two-event narrative and thirteen that are bare anchors; a separate *Landing events* column would make the subtree row's shape structural rather than parenthetical.
DEFERRED: §G.2 gap 5 now states the tree count with the command that produces it; the same treatment applied to §C.4's *"Eighteen files, fourteen of them task-owned"* paragraph would let a reader falsify both eighteens from the document alone.
DEFERRED: three of this round's five commits fixed a stale cross-reference to a *routed* item; a convention that every routed item's *status* lives in exactly one place, with all other mentions linking rather than restating, would have made F-01 unwritable.
DEFERRED: the document has now converged with PLAN at v1.3 on every quotation and every count; a content-hash pin (as `UPSTREAM-STATE` anchors already do) would let the next round prove that in one command instead of six greps.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §G.2 gap 5 is now the record of a **closed** gap, retained *"as the record of where it landed"*. That is the right call, and it raises a lifecycle question this document will hit again: does a closed gap stay in §G.2 indefinitely, or move to a §G.4 "closed gaps" list once the phase ends? I read "keep it" as better — the gap's value is now the audit trail — but stating it once would stop the next reviewer proposing a move. |
| Q-02 | PLAN reaches eighteen as 13 + 5; this document reaches it as 17 + 1. Both are right and the document now says so. Is it worth one sentence naming which decomposition is canonical for future citation, so the two documents do not drift into quoting different derivations of the same number? |

## Positive Observations

- **Every finding from the round is closed, and the residual-phrase sweep proves it globally.** All four
  retired strings — `manifest that is now incomplete`, `amended into the ledger by name`,
  `byte-unchanged at v0.8`, `after batch 13` — return **zero hits** document-wide, not merely in the
  paragraphs the delta visited. The usual failure mode of a "fix the wording" round is that the visited
  copy is corrected and a second copy elsewhere survives; this revision left none.

- **The header's completeness claim was narrowed rather than defended.** My v14 F-01 said the claim
  *"every ruling this document cites is still present at v1.3"* was false in two places. The easy
  discharge was to fix the two places and keep the claim. This revision instead scoped the claim to
  *"the rulings actually re-checked"* **and** named the counter-example in the same sentence
  (*"v1.0 extends the sweep to P-A-6, which PLAN did move"*). A claim that names its own exception is
  one the next reviewer can audit; one that has merely been patched is not.

- **The counting finding was closed by explaining the number, not by changing it.** "Eighteen" was
  ambiguous across three rounds. The fix could have been to write 39, or 17, and move on. Instead §G.2
  gap 5 now derives the number two ways, publishes the command, states which entities each convention
  counts, reconciles against `PLAN:310`, and says outright that the two eighteens *"agree by coincidence
  of arithmetic, not by naming the same entities"*. That last clause is the part that stops the
  coincidence hardening into a fact, which is exactly what I said the risk was at v14.

- **The unowned-file worry was converted into an execution-path fact.** *"`helpers/learningsComposition.js`
  is unnamed but not unexercised"* — with the header quote, the import at `learningsDispatchSet.test.js:42`
  and the `spawnSync` at `:531` behind it. I verified all three at HEAD. A reviewer reading "no property
  names this file" could reasonably have suspected a coverage hole; the document now shows PROP-ORDER-05's
  two-process oracle running **through** the file, and correctly diagnoses the remaining gap as manifest
  completeness rather than oracle fidelity.

- **The fixture row's two landing events were caught without being asked for.** No finding of mine
  required `:1094`. A `git log --diff-filter=A -1` anchor on a *directory* row reports the first add and
  is silent about everything that arrived later — a quiet class of wrong anchor — and this delta found
  it, named both events, and tied the second to PLAN's P-A-5 second-owner rows. I checked it four ways
  (`744311f7` → 4 adds; the arm → 18 files; `2fc6fcd3` → 18 adds plus `MANIFEST.json` as `M`;
  `PLAN:277`/`:278`) and every limb holds.

- **The routing loop closed end to end.** At v0.8 this document declined to absorb four unowned files and
  routed them to PLAN. PLAN answered across v1.2 and v1.3 with a nineteen-row subsection. At v1.0 this
  document notices the reply, strikes the item, records which of the three options PLAN chose, and cites
  DEC-ERR-01 for why it will not re-route. That is the full cycle working as designed, and it is the
  first round in this phase where I can say so.

## Recommendation

**Approved with minor changes**

This revision closes **every** finding I filed at v14 — the case-B fallback at `:1181` replaced by
P-A-7's governing case with PLAN v1.1's wording quoted verbatim (`grep -cF` → 1 at `PLAN:663`), the
`byte-unchanged at v0.8` parenthetical restated, §G.3's routed manifest item struck as answered by PLAN
v1.2/v1.3, the header's completeness claim narrowed to the rulings actually re-checked with P-A-6 named
as the exception, `:1131`'s quotation extended to a form that greps, the struck bullet's *"after batch
13"* re-cut to *"batch 13 or later"*, and §G.2 gap 5's eighteen re-derived from the tree. All four
retired phrases return **zero hits** document-wide.

I verified the numbers rather than the prose: 17 non-fixture `learnings*` paths under
`pdlc/workflows/__tests__` and one engine-side, 39 raw paths of which 22 are fixture files, an
18-row §C.4 inventory, an 18-file `PIPELINE-NON-AUTHORING-PROMPTS/` arm added at `2fc6fcd3` over a
subtree created at `744311f7`, and **19** rows in PLAN's §Post-batch remediation subsection. Every
count in the delta holds. No hunk lands in §Properties (`:87`–`:607`), §Oracles (`:608`–`:808`) or
§Fixtures (`:809`–`:917`), so no property, oracle, fixture or AT mapping moved — checked from the
eleven hunk offsets, not from the assertion.

Three findings, none blocking. **F-01 (Medium)** — the delta struck §G.3's routed item and left
§C.4 `:1110`'s present-tense *"§G.3 routes to PLAN"* behind, so the document states the item's status
both ways. It is a defect this revision introduced, which is the freeze's blocking category, and I
record it without gating: it is a prose cross-reference, both authoritative statements of the status
now say the resolved thing, and nothing downstream turns on it. **F-02/F-03 (Low)** — the header's
"coverage row" wording against the one §C.4 inventory cell that moved, and the exact-but-off-by-one
"four of the seventeen" against the engine-side fifth unowned file.

Under the decision freeze I opened no new decision and escalated no unchanged substance. Four
improvement observations are recorded as `DEFERRED:` lines rather than folded into the verdict. No
upstream defect was found — every claim this document makes about PLAN resolves at `PLAN:244`,
`:271`–`:293`, `:310`, `:561`, `:663` and `:680`–`:684` at HEAD — so I emit no `ERRATUM:` line.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:5eb02c76c4fab5c73919541db30a4ee9e01d6f44e135384473980f830d394aef
APPROVAL-HASH-NORMALIZED: sha256:07907354c1bf4373cf5b4ea81552a163236a7a1cb21f659935f47d21923891e7
REVIEWED-COMMIT: 9e9a79e5cb81b35d552c1fd560db0aecaec24f26
UPSTREAM-STATE: REQ sha256:32cb8b7d4f4072d18772c7efeeb846460083dfea1959cd1159ac625a057fafeb
UPSTREAM-STATE: FSPEC sha256:ef2301995af6ab2b0d722339a15d07da1eeec8ce28b501a92155064d660b5e56
UPSTREAM-STATE: TSPEC sha256:1ddfdbc340d9078efc98930df625cc4f8f0dd6d3d9b24070fdee08af8ff44a95
UPSTREAM-STATE: DECISIONS sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193
UPSTREAM-STATE: PLAN sha256:d6a0b45c5c1753b91752d4fe60a42a700ef441f532a26d9a4535e88c1857673a

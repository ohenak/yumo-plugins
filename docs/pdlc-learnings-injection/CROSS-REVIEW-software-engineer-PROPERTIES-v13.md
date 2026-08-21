# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE — PROPERTIES v0.7 → v0.8)

## Overview

**What this round is.** A delta re-review, under decision freeze, of PROPERTIES v0.7 → **v0.8**. My
v12 was an upstream-cascade confirmation on byte-unchanged PROPERTIES; this round the document itself
moved, in six commits (`022e1c46`, `d173ff19`, `7cc189f5`, `085a4024`, `67233d19`, `c575cdc3`) that
land 245 changed lines. I judge only whether my own prior blocking findings are resolved and whether
this revision broke anything.

**The delta, measured.** `git diff -U0 72771ffa HEAD` on the document returns fifteen hunks, and every
one of them falls inside four regions:

| Region | Lines | What moved |
|---|---|---|
| Header / Overview | `:11`, `:18`, `:29` | version cell `0.7` → `0.8`; upstream row gains a v0.8 note; HEAD pin `(2026-08-20)` → `` (`09c7c62f`, 2026-08-21) `` |
| §C.4 Reconciliation | `:1064`–`:1207` | the whole re-pin and case-C reversal |
| §G.2 Known gaps | `:1274` | new gap **5**, old 5 renumbered to **6** |
| §G.3 Routed errata | `:1340`, `:1350`–`:1363` | two anchor re-pins, one newly routed item |

No hunk touches §Properties (Groups A–J), §Oracles (§O.1–§O.9), §Fixtures (§F.1–§F.4), §C.1, §C.2 or
§C.3. The header's own claim — *"No property, oracle, fixture, AT mapping or coverage row moves"* — is
therefore true by construction of the diff, not merely asserted, and I checked it that way.

**What the revision does.** Three things, and they are the right three:

1. **Re-pins every commit anchor.** PM v11 F-01 named the branch as rebased and every anchor as
   pre-rebase. All 21 anchors the revision writes resolve at HEAD (`b9074d1e`, `2f71b899`, `b6cbf930`,
   `2139fea8`, `aadd01bc`, `8eee671f`, `92cd9345`, `744311f7`, `2f0927f3`, `bb686ca3`, `d9b51a9a`,
   `ad58b052`, `6467afa6`, `2fc6fcd3`, `a4998e13`, `be2456c8`, `e7fa8d87`, `7a97f357`, `6e45e788`,
   `5b4c6663`, `0fa099a3`) — I ran `git log -1 --format=%s` on each and every subject matches the task
   the row attributes it to.
2. **Reverses seven absence claims into positive ones.** §C.4 previously reasoned forward from *"none
   of the four is present in the landed suite"*. That is now false at HEAD, and the revision says so
   in a claim-by-claim table rather than silently deleting the old text.
3. **Records what it found while re-measuring.** Four `learnings*` files exist that no `LI-*` task
   owns; they go into §G.2 as gap 5 and are routed to PLAN in §G.3 rather than absorbed.

**Verification method — repository, not documents.** `git ls-files pdlc/workflows/__tests__` filtered
to `learnings*`; `git log -1` on all 21 anchors; `git log --diff-filter=A -1` on the four unowned
files; `sed -n {N}p` on all seventeen `file:line` anchors the revision writes; `head -4` on the four
remediation files to check the header attributions; `git log --oneline main..HEAD` for LI-id coverage;
and `npm test -- __tests__/learningsBlock.test.js __tests__/learningsSelect.test.js` to check the
green claim by running it rather than reading it.

**Conclusion up front.** My v12 carried **no High and no Medium** — one Low (a stale PLAN version pin).
Nothing in this delta is broken: every re-pinned anchor resolves, every line anchor lands on the text
quoted, the green claim reproduces exactly, and the four-file gap is real. The v12 Low is **not**
resolved and has widened — PLAN reached **v1.1** on this branch *before* this revision was written,
and PROPERTIES still pins **v0.8**, which now costs one non-resolving verbatim quotation, one false
paraphrase of case A, and one fallback sentence PLAN v1.1 deliberately retired. That is Medium, and
under the freeze it does not block: no property, oracle, fixture or AT moves on it, and case C's
substantive ruling is byte-identical across v0.8 → v1.1.

## Properties

**No property statement moved, and the diff proves it rather than the prose.** The fifteen hunks are
confined to the header, §C.4, §G.2 item 5 and §G.3 (table in §Overview). §Properties' Groups A–J
(`:553` and above), §C.1's 35-of-35 (`:920`), §C.2 (`:969`) and §C.3's 23-of-23 (`:1008`) are
byte-identical. So the seventy `PROP-` statements, their AT partitions, levels and owning tasks all
stand exactly where my v11 approval left them, and nothing in this round can have disturbed them.

**The §C.3 accounting survives the four unowned files — checked, not assumed.** The obvious hazard in
adding four rows to a table that §C.3 reconciles against PLAN's task table is that the task→property
accounting stops closing. It does not, for the reason the revision gives: `grep -c` for
`learningsDisclosure|learningsErratumBinding|learningsComposition|learningsBaselineScenarios` over
PROPERTIES returns **13** hits and *all thirteen* are inside the three places that discuss the gap
(§C.4's inventory table and its follow-on paragraph, §G.2 gap 5, §G.3's newly routed item). No
`PROP-` row, no oracle and no fixture entry names any of the four. §C.3 reconciles PLAN's 23 task rows
against properties; the four files carry no task row, so they cannot enter that reconciliation. The
revision's claim — *"This does not falsify §C.3's accounting"* — is exactly right.

**Set-equality over the inventory, not containment.** The new table is an enumeration, so I checked it
as a closed set rather than spot-checking rows. `git ls-files pdlc/workflows/__tests__` filtered to
`learnings*` returns, at HEAD, **14** `*.test.js` suites, **3** `helpers/*.js` modules and the
`fixtures/learnings-baseline/` subtree — 18 entities, and the table has exactly 18 rows with no row
absent from the command's output and no output entity absent from the table. A deleted row would fail
this check. The fourteen task-owned rows are still exactly PLAN's fourteen manifest test rows, and the
four added rows are exactly the set difference. The partition into *fourteen owned / four unowned* is
a genuine set equality, not a containment claim.

**Every task id claim re-verified.** The revision reverses its own earlier *"LI-22 is the only id with
no commit"* to *"LI-01…LI-23, with no exceptions"*. `git log --oneline main..HEAD` counting subjects
per id returns a non-zero count for every id from LI-01 to LI-23 (LI-11, LI-15, LI-17…LI-21 have one
each; LI-08 has seven; LI-22 has two — `7a97f357` and `6e45e788`, exactly the two the revision names).
The claim is true and is stated at the right strength.

**LI-04's artifact claim re-verified at the byte level.** The revision re-pins LI-04 to `5b4c6663` and
says the ignore rule *"is present as the root-anchored `/.baseline-worktree/` at `.gitignore:13`"*.
`sed -n 13p .gitignore` returns `/.baseline-worktree/` — the anchor is exact, and the root-anchoring
the sentence emphasises is visible in the returned bytes.

**Where the revision is stale against PLAN.** PLAN reached **v1.1** at `aa5f0378`, which precedes this
revision's first commit `022e1c46` in branch order — so this was available and was not picked up. Three
consequences, all inside text this delta touched or adjoins:

| PROPERTIES says | PLAN at HEAD says |
|---|---|
| header `:11`, §C.4 `:1129`: case C is *"after batch 13, the case that is live at HEAD"* (as a verbatim quotation) | *"batch 13 or later, the case that is live at HEAD"* — `grep -cF` on the quoted form returns **0** |
| §C.4 `:1127`: *"case A is scoped to a follow-up commit landing before batch 7"* | case A's *When* cell now reads **"before batch 9 (which includes batches 7 and 8)"** (PLAN v1.1, PM v11 F-02 / TE v11 F-02) |
| §C.4 `:1178`: if the PROPERTIES suite lands red, *"its rows are amended into the ledger by name first, under the same P-A-7 rule"* | P-A-6 now routes the fallback through **P-A-7's governing case, which at HEAD is C** — *"the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* (TE v11 F-03) |

The third is the one with teeth: an implementer reading `:1178` would prepare a named ledger row that
PLAN says must not exist. It is mitigated — and that is why it is Medium, not High — by the fact that
§C.4's own case-C paragraphs, twenty lines earlier, state the correct obligation twice (*"the ledger
stays empty and the amendment is expected to land green"*, and *"no `learningsBlock` ledger row was
owed and none exists"*). PLAN v1.1 moved *toward* what §C.4 already concluded; the stale sentence is
the document's last un-updated echo of case B, not a live disagreement about the ruling.

**What the staleness does not touch.** The load-bearing quotations §C.4 rests on still resolve verbatim
at PLAN HEAD: *"batch 9 through batch 12"*, *"after LI-17 has greened the suite, with a greening batch
still ahead"*, *"any other amendment to a landed suite arriving from here on"*, *"the first point the
suite is green"*, *"has found a real defect, not staged a TDD red"* — `grep -cF` returns 1 for each.
Case C is live at HEAD under either wording, cases A and B are behind us under either wording, and no
property changes on any of it.

## Oracles

**No oracle section moved; the three discipline checks are applied to the text the delta reaches.**
§O.1–§O.9 (`:608`–`:808`) and §G.1's obligation table are byte-identical. What this delta adds is a
block of *evidence* — the seven-row reversal table and the green measurement — and evidence carries
the same three obligations an oracle does.

**No implementation echoes.** This is the check that mattered most here, because the reversal table's
right-hand column is quoted test source. Every cell is a **literal transcription** of a line in the
suite, not a value derived from the code under test, and I re-derived each one independently with
`sed -n {N}p` rather than trusting the quotation:

| Anchor | Line at HEAD | Matches the cell |
|---|---|---|
| `learningsBlock.test.js:40` | `describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)", () => {` | yes |
| `:105` | `test("LI-AT-11: heading-form variants — ordinal stripped, gloss optional, a ### sub-heading reads as body text, and a near-miss title is excluded …")` | yes |
| `:125` | `name: "Rejected Proposals",` | yes (the un-glossed arm) |
| `:133` | `"### A sub-heading that is body text, not a section boundary.\n\n" +` | yes |
| `:139` | `name: "Process Findings",` | yes (the near-miss) |
| `:152` | `"Rejected Proposals (with rationale)",` | yes (the canonical glossed form asserted) |
| `:160` | `"### A sub-heading that is body text, not a section boundary."` | yes (survives verbatim in extent) |
| `:235` | `const maxBytes = 60;` | yes (the third binding literal) |
| `:274` | `describe("PROP-BOUND-03 generated arm: extractInjectableMaterial character-safety over every non-negative maxBytes (TSPEC T-O-6)", () => {` | yes |
| `:329` | `test("PROP-BOUND-03: maxBytes === 0 is pinned as a distinguished example case, not left to sampling frequency (TSPEC §I.3)", async () => {` | yes |
| `:337` | `const result = extractInjectableMaterial(text, 0);` | yes |
| `learningsSelect.test.js:647` | `describe("PROP-ORDER-06: orderCorpus permutation invariance and strict-weak-ordering (TSPEC T-O-4)", () => {` | yes |
| `:786` | `describe("PROP-CORPUS-09: selectLearnings totality (TSPEC T-O-5)", () => {` | yes |
| `learningsConfig.test.js:247`, `:248`, `:264`, `:280` | the `LI-AT-30` describe and its three tests, in that order | yes |

Seventeen anchors, seventeen exact landings. The `const maxBytes = 60` row is the one I most expected
to drift, because the old text asserted *"its only binding `maxBytes` literals are 40 and 66"* and the
revision claims a third: `grep -n "maxBytes = "` returns exactly `174: = 40`, `194: = 66`, `235: = 60`,
so the enumeration is complete at three and the revision's *"a third binding literal"* is the whole
truth, not a partial correction.

**No absence-only oracles — the delta moves in the right direction on this axis.** The old §C.4 was
built out of seven absence assertions with no positive counterpart on the same path. The revision
pairs every one of them: *"no un-glossed `## Rejected Proposals`"* becomes "present at `:125`, asserted
to normalise to the canonical glossed form at `:152`"; *"no `###`-as-body case"* becomes "supplied as
body at `:133`, asserted to survive verbatim inside its section's extent at `:160`"; *"no
`extractInjectableMaterial(text, 0)` case"* becomes "present at `:337` under the named test at `:329`".
The one remaining negative — the `## Process Findings` near-miss — carries its positive counterpart in
the same clause (*"excluded from the taken section set"*, i.e. the taken set is asserted, not merely
its non-membership). This is a strict improvement on the oracle discipline of the text it replaces.

**The green claim is a measurement I reproduced, not a citation.** The revision asserts
*"`npm test -- __tests__/learningsBlock.test.js __tests__/learningsSelect.test.js` at `09c7c62f`
reports **26 passed, 26 total**, and a `test.skip`/`describe.skip` count over both files returns 0."*
I ran it: `Test Suites: 2 passed, 2 total` / `Tests: 26 passed, 26 total`, and
`grep -c "test.skip\|describe.skip\|it.skip"` returns `0` on both files. Exact match on both numbers.
The skip count is the right companion to the pass count and the revision was right to pair them —
26-of-26 green means nothing if arms are skipped, and it names the check that rules that out.

**The failure limb is recorded as unexercised, not waived.** Case C's red branch (*"has found a real
defect, not staged a TDD red"*, fix owed before batch 14, survivor is a gate failure) did not fire.
The revision says so in those terms — *"therefore **unexercised**, not waived"* — which is the honest
statement: an untaken branch is untaken, and calling it discharged would have been the error. It did
not make that error.

**Set-equality on §G.3's enumeration.** §G.3 is itself a closed list. The delta adds one item (the PLAN
manifest under-count) and removes none; the still-open TSPEC AT-15 suite-assignment item is untouched
and still routed, and the struck items keep their strikethrough with two anchors re-pinned
(`2cbacada` → `a4998e13`, `92b7ea0c` → `e7fa8d87`). No item was quietly dropped while the section was
being edited — the risk in editing a routed-errata list — and I diffed the list to confirm it.

## Fixtures

**§F.1–§F.4 are byte-identical.** No hunk lands in `:817`–`:917`, so the fourteen-row corpus fixture
table, the byte-identity baseline rules (§F.2), §F.3's verbatim-fixture-string rule and §F.4's seam
doubles are untouched. The fixture surface this delta reaches is entirely inside §C.4's inventory.

**The baseline fixture row grew, and the growth is real.** The row for
`__tests__/fixtures/learnings-baseline/` gains *"and a `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18
files"*. `git ls-files` on that subtree returns `MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`,
`PHASE-R-REVIEW-PROMPTS/{0,1}.txt` and `PIPELINE-NON-AUTHORING-PROMPTS/{0…17}.txt` — **18** files in
that arm exactly, numbered contiguously from 0. The count is right and the enumeration is closed.
This matters more than a row detail: §F.2's byte-identity oracle runs over whatever the baseline
directory contains, so an arm the document did not know about would have been an unmeasured input to
a preservation property. Recording it closes that.

**§F.3's verbatim-fixture-string rule is what makes the reversal table checkable, and it held.** The
rule says a fixture string in this document must be the normative string, not a paraphrase. That is
precisely why I could check the reversal table with `sed -n {N}p` and get exact matches on
`"Rejected Proposals"`, `"Rejected Proposals (with rationale)"`, `"Process Findings"` and the
`"### A sub-heading that is body text, not a section boundary."` body line. Had the revision
paraphrased, the seven-row reversal would have been unfalsifiable prose. It did not, and the
discipline paid for itself in this exact round.

**The four unowned files are fixture-adjacent, and the revision classified them correctly.** Two of the
four are *helpers*, not suites — `helpers/learningsBaselineScenarios.js` and
`helpers/learningsComposition.js` — which means they sit in the same category as
`helpers/learningsFixtures.js`: modules that register no jest test and can carry no red/green status.
I read the header of each to check the attribution the revision writes:

| File | Header at HEAD | Attribution in the document |
|---|---|---|
| `learningsDisclosure.test.js` | *"— CODE_REVIEW v1 F10."* | F10 — matches |
| `learningsErratumBinding.test.js` | *"— CODE_REVIEW v1 F11 and F12."* | F11/F12 — matches |
| `helpers/learningsComposition.js` | *"…so it can be driven from TWO SEPARATE NODE PROCESSES (CODE_REVIEW v1 F8)."* | F8 — matches |
| `helpers/learningsBaselineScenarios.js` | *"the committed L3 fixture matrix for `scripts/capture-learnings-baseline.mjs` (TSPEC §T.3), CODE_REVIEW v1 F1/F7/F12."* | F1/F7/F12 — matches |

All four resolve to `2fc6fcd3` under `git log --diff-filter=A -1`, and `2fc6fcd3`'s subject is
`docs(cross-review): TE DECISIONS v8 context` — a docs-titled commit, exactly as the revision says,
which is why no `LI-*` id stands behind them. `grep` for all four names across PLAN returns nothing, so
*"no PLAN task owns them"* is verified against PLAN's bytes and not inferred from the absence of a task
id in a commit subject.

**The routing decision is the right one.** `helpers/learningsBaselineScenarios.js` is a *fixture
matrix* for the capture script — the same production surface §F.2's byte-identity baseline covers. A
reviewer could reasonably have argued it should be absorbed into §F.2's fixture accounting. The
revision does not do that, and should not: no property of this document names it, PLAN's manifest is
what is incomplete, and PLAN is where the decision (task row, remediation row, or explicit
out-of-manifest note) belongs. Routing rather than absorbing keeps this document's fixture accounting
a faithful compression of PLAN instead of quietly diverging from it.

**One count-convention imprecision.** *"finds **eighteen** `learnings*` files under
`pdlc/workflows/__tests__`"* (§G.2 gap 5) counts the `fixtures/learnings-baseline/` **subtree** as one
file. `git ls-files pdlc/workflows/__tests__ | grep learnings` returns **39 paths** — 14 suites, 3
helpers and 22 fixture files. Eighteen is the count of *inventory rows*, which is the useful number and
the one the surrounding prose reasons with; the word "files" is what is imprecise. The document already
used this convention at v0.7 (*"fourteen rows over fourteen files"*), so it is inherited, not
introduced. Low, below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **PLAN version pin is stale at v0.8; PLAN reached v1.1 on this branch before this revision was written** (`aa5f0378` precedes `022e1c46`). Three concrete consequences. (a) The verbatim quotation *"after batch 13, the case that is live at HEAD"* (header `:11`, §C.4 `:1129`) returns `grep -cF` **0** against PLAN at HEAD, which now reads *"batch 13 or later, the case that is live at HEAD"*. (b) §C.4 `:1127`'s *"case A is scoped to a follow-up commit landing before batch 7"* is false: PLAN v1.1's case A *When* cell reads **"before batch 9 (which includes batches 7 and 8)"**. (c) §C.4 `:1178` still offers case B's fallback — *"its rows are amended into the ledger by name first"* — which PLAN v1.1's P-A-6 deliberately retired (*"the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"*, TE v11 F-03); an implementer following it would prepare a ledger row PLAN says must not exist. **Non-gating and non-blocking under the freeze**: case C's substantive ruling is byte-identical across v0.8 → v1.1, every load-bearing PLAN quotation §C.4 rests on still resolves verbatim (`"batch 9 through batch 12"`, `"after LI-17 has greened the suite…"`, `"any other amendment to a landed suite arriving from here on"`, `"the first point the suite is green"`, `"has found a real defect, not staged a TDD red"` — all `grep -cF` 1), no property, oracle, fixture or AT mapping moves, and §C.4's own case-C paragraphs already state the correct green-at-landing obligation twice, twenty lines above `:1178`. Fix at the next ordinary touch: re-pin the header to **v1.1**, restate (a) with PLAN's current words, correct (b) to "before batch 9", and delete `:1178`'s case-B fallback clause in favour of P-A-7's governing case. | Header `:11`; §C.4 `:1127`, `:1129`, `:1178` |
| F-02 | Low | Local | **"Eighteen files" is an inventory-row count, not a file count.** §G.2 gap 5 says the re-measurement *"finds eighteen `learnings*` files under `pdlc/workflows/__tests__`"*; `git ls-files pdlc/workflows/__tests__ \| grep learnings` returns **39 paths** (14 suites, 3 helpers, 22 fixture files). Eighteen is the count of rows in §C.4's table, which treats `fixtures/learnings-baseline/` as one row — the useful number, and the one the surrounding prose reasons with. Inherited, not introduced: v0.7 used the same convention (*"fourteen rows over fourteen files"*). Fix: say "eighteen inventory rows" or "eighteen tracked entities". | §G.2 gap 5; §C.4 inventory table |

**Prior-round findings.** My v12 carried no High and no Medium. Its single Low — the stale PLAN version
pin — is **not resolved** and has widened from `v0.8 → v0.9` to `v0.8 → v1.1` with substantive
consequences, so it is re-filed at Medium as F-01 rather than carried at Low.

**Freeze accounting.** Neither finding meets the blocking bar. F-02 is a wording imprecision, inherited.
F-01 is a factual contradiction with an upstream document — the one category that *can* block — but the
claims it falsifies are not load-bearing: no property, oracle, fixture, AT mapping or coverage row
depends on which batch number bounds case A, on the exact wording of case C's domain, or on the retired
case-B fallback, and this document's own operative conclusion (case C governs, ledger empty, green at
landing) is the conclusion PLAN v1.1 reaffirms. It is recorded, not gated.

DEFERRED: §C.4's inventory table could carry the `git ls-files` invocation and its raw output count beside the row count, so a reader can reconcile 18 rows against 39 paths without re-running it.
DEFERRED: the seven-row reversal table is the clearest artifact this document has produced; a short note naming it as the pattern for future re-pins would make the technique reusable at harvest.
DEFERRED: §G.2 gap 5 and §G.3's newly routed item restate the same four files and the same four CODE_REVIEW finding ids; one could reference the other rather than duplicate the enumeration.
DEFERRED: consider recording, beside the 26-of-26 green measurement, the jest invocation's exact form (`npm test --`, not bare `npx jest`, which fails on this repo's ESM config) so a future verifier reproduces it first try.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PLAN v1.1's P-A-6 now routes a red PROPERTIES suite through *"P-A-7's governing case"* rather than naming a route directly. When this document re-pins to v1.1, does §C.4 `:1178` want to quote that indirection verbatim, or state the resolved answer at HEAD (case C, green at landing, no ledger)? The second reads better but goes stale the next time P-A-7 gains a case — which has now happened twice. |
| Q-02 | The four unowned remediation files are routed to PLAN. If PLAN answers with *"explicit out-of-manifest note"* rather than task rows, does §C.4's inventory keep all 18 rows, or drop back to 14 with a pointer to PLAN's note? I read the 18-row form as the better one — the inventory's value is that it is the output of a command — but the choice is PLAN's answer to make legible. |

## Positive Observations

- **The revision reverses its own claims out loud instead of editing them away.** Seven absence
  assertions had gone false when the branch advanced. The easy move was to delete them and restate the
  new state; the revision instead prints a two-column table of *"claim as it stood"* against *"state at
  `09c7c62f`"* and says plainly *"every one of those absence claims is false"*. That costs the document
  nothing in correctness and buys every future reader the ability to see which readings expired and
  why — and it is what let me check the reversal in seventeen `sed -n` calls rather than by re-reading
  two suites.

- **It retired a hedge instead of deferring it.** Earlier revisions flagged PROP-BOUND-03's
  `maxBytesPerDocument <= 0` case as *not obviously green at landing* — unexercised through the
  `extractInjectableMaterial` seam, so *"the first call may red"*. It landed green on first exercise
  (`learningsBlock.test.js:337` under the named test at `:329`, inside the 26-of-26 pass). The revision
  records that the hedge is spent rather than carrying it forward as a live risk. Carrying a discharged
  hedge is how documents accumulate false urgency; this one stopped.

- **It distinguishes unexercised from waived.** Case C's failure limb never fired, and the revision says
  it is *"**unexercised**, not waived"*. That is a precise and slightly uncomfortable distinction — the
  comfortable version would have called the obligation discharged — and getting it right is what keeps
  the branch honest if an amendment does red before batch 14.

- **It reported a gap that was purely to its own cost.** Nothing forced the re-measurement to notice
  four files that no task owns; §C.3's accounting closes without them and no property names them. The
  revision surfaced them anyway, classified the gap as **PLAN's rather than its own**, and routed it
  instead of absorbing it — which is exactly right, and is the harder of the two options to write.

- **Every measurement it asserts, it made checkable.** Commit anchors with `git log --diff-filter=A -1`
  named as the derivation; a test command with its exact output; a skip count paired with the pass count;
  file headers quoted so the CODE_REVIEW attribution can be confirmed with `head -4`. I re-ran all of it
  and every number matched on the first attempt. That is not luck — it is what happens when a document
  writes down the command as well as the result.

- **The blast radius is exactly what the header claims.** *"No property, oracle, fixture, AT mapping or
  coverage row moves"* — fifteen hunks, all four inside the header, §C.4, §G.2 item 5 and §G.3. A
  scope claim that survives being diffed makes a re-review cheap, and this one did.

## Recommendation

**Approved with minor changes**

The revision does what PM v11 F-01 asked and does it well: 21 commit anchors re-pinned and all 21
resolve, 17 `file:line` anchors written and all 17 land on the quoted text, seven absence claims
reversed with positive counterparts on the same paths, a green claim I reproduced exactly
(26 passed / 26 total, 0 skips), and a real gap in PLAN's manifest found, classified and routed. No
property, oracle, fixture, AT mapping or coverage row moved, and I verified that from the diff rather
than from the assertion.

Two findings, neither blocking. **F-01 (Medium)** — the PLAN pin is stale at v0.8 against PLAN v1.1,
costing one non-resolving verbatim quotation, one false case-A paraphrase, and one fallback sentence at
`:1178` that PLAN v1.1 retired. It does not block: case C's ruling is byte-identical across the version
gap, every load-bearing PLAN quotation still resolves verbatim, and §C.4 already states the correct
obligation. **F-02 (Low)** — "eighteen files" is a row count, inherited from v0.7's convention.

Under the decision freeze I have opened no new decision. Four observations that would improve the
document but are not defects are recorded as `DEFERRED:` lines above rather than folded into the
verdict.

## Recommendation

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

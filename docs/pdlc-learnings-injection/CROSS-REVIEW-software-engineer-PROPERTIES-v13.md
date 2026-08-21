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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

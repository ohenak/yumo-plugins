# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE — PROPERTIES moved v0.7 → v0.8)

## Overview

**What moved, and why the freeze still binds.** PROPERTIES went **v0.7 → v0.8** across six commits
(`022e1c46`, `d173ff19`, `7cc189f5`, `085a4024`, `67233d19`, `c575cdc3`). Every one of them is a
**re-measurement**, not a decision: the branch was rebased, the document's commit anchors were all
pre-rebase, and re-running the measurements at HEAD found that the branch had also advanced past the
commit those readings were taken at. I confirmed the rebase claim directly rather than taking it on
trust — `git merge-base --is-ancestor` says every old anchor (`21edb7c5`, `1920f281`, `cdeb1509`,
`5e522a52`, `1544fdbd`, `eb32d7d2`, `2cbacada`, `92b7ea0c`, `d462ddd8`, `ced75955`, `ae2af1da`) is
**not reachable from HEAD**, while every new anchor (`b9074d1e`, `8eee671f`, `a4998e13`, `e7fa8d87`,
`2fc6fcd3`, `09c7c62f`) **is**. The document's framing of its own edit is therefore accurate: this is
a measurement round, and DECISION FREEZE is the right regime for it.

**The diff, hunk by hunk, and what each one touches:**

| Hunk | Location | Change | Reaches a property? |
|---|---|---|---|
| 1 | Header `Upstream` cell (line 11) | Appends the v0.8 re-pin note | No |
| 2 | Version row (line 18) | `0.7` → `0.8` | No |
| 3 | Overview subject line (line 29) | Pins the HEAD measurement to `09c7c62f`, 2026-08-21 | No |
| 4 | §C.4 test-file inventory | Re-derives all fourteen anchors; **adds four rows** for unowned files; 14 → 18 | No — none is property-named |
| 5 | §C.4 task-id paragraph | LI-22 now has commits; ids are LI-01…LI-23 with no exceptions | No |
| 6 | §C.4 case-C paragraphs | **Seven absence claims reversed**; case C recorded discharged green | No — the properties are unchanged, their *status* is now measured |
| 7 | §C.4 closing / §C.3 tail | Re-pins LI-21, LI-07, LI-08, LI-12, LI-05 anchors; adds `learningsConfig.test.js` line anchors | No |
| 8 | §G.2 | **New gap 5** (manifest under-count); old item 5 renumbers to 6 | No |
| 9 | §G.3 | **Newly routed — one item**: the four unowned files, routed to PLAN | No |

**No property statement, oracle row, fixture row, AT mapping or coverage count moved.** The diff's
line ranges are 8–14, 26–29, 1061–1211 (§C.4, inside `## Coverage Matrix`) and 1254–1361 (`## Gaps,
Obligations and Routed Errata`). `## Properties` (lines 87–607), `## Oracles` (608–808) and
`## Fixtures` (809–917) are byte-untouched. The header's own claim — *"No property, oracle, fixture,
AT mapping or coverage row moves"* — is true as written, and I verified it against the diff rather
than against the sentence.

**The product question this round asks.** A document that reverses seven of its own absence claims is
exactly where a reversal can be done sloppily: an author under pressure to show progress can record
"landed and green" without measuring, and the reader inherits a false green. So this review's whole
weight sits on one question — **is the new reading measured, or asserted?** I re-ran every
measurement the delta makes. All of them hold, character-exactly, and the green claim reproduces on
my machine. Details in the sections below.

**One thing moved underneath this document while it was being revised.** PLAN is now **v1.1**
(`PLAN-pdlc-learnings-injection.md:18`), having passed through v0.9, v1.0 and v1.1 since the v0.8 pin
this document still carries. One of those rounds re-worded case C's *When* cell, which this document
quotes verbatim. The substance behind the quotation is unchanged and the conclusion drawn from it is
still correct, so this is quotation freshness, not fidelity — F-01 and F-02 below, both non-gating.

## Properties

**No property text changed, so the test is whether each property's *status* claim is now measured
truthfully.** §C.4's reversal table is the delta's load-bearing content. I re-ran all seven rows
against `pdlc/workflows/__tests__/learningsBlock.test.js` at HEAD:

| Reversal the delta asserts | Measured at HEAD | Holds? |
|---|---|---|
| **two** `describe`s, at `:40` and `:274` | `grep -n 'describe('` returns exactly two, at lines **40** and **274**, with the quoted titles character-exact | Yes |
| `LI-AT-11` heading-form arm present at `:105` | Line 105 is that `test(` with the quoted title verbatim | Yes |
| un-glossed `name: "Rejected Proposals"` at `:125`, normalising to the glossed form at `:152` | `:125` is `name: "Rejected Proposals",`; `:152` is `"Rejected Proposals (with rationale)",` | Yes |
| `###`-as-body at `:133`, surviving verbatim at `:160` | `:133` is the `"### A sub-heading that is body text, not a section boundary.\n\n" +` body line; `:160` is the same string asserted | Yes |
| `## Process Findings` near-miss at `:139` | `:139` is `name: "Process Findings",` | Yes |
| a **third** binding literal `const maxBytes = 60` at `:235` | `grep -n 'const maxBytes'` returns **three**: `40` (`:174`), `66` (`:194`), `60` (`:235`) | Yes |
| `extractInjectableMaterial(text, 0)` at `:337`, under the `test(` at `:329` | `:337` is that call; `:329` is that `test(` with the title verbatim | Yes |

**Seven for seven, with no rounding.** Each new claim is a positive assertion about a line that
exists, replacing a negative assertion about a line that did not — which is the right direction of
travel for this document, and the direction that is hardest to fake, because each one is falsifiable
by a single `sed -n`. The old readings were true when taken and are false now; the delta says exactly
that, and names the reason (the branch advanced past the reviewed commit), rather than quietly
restating.

**The green claim reproduces.** The delta asserts `npm test -- __tests__/learningsBlock.test.js
__tests__/learningsSelect.test.js` reports **26 passed, 26 total** at `09c7c62f`, with a
`test.skip`/`describe.skip` count of **0** over both files. I ran it in
`pdlc/workflows` (the suite needs the package's `--experimental-vm-modules` runner; a bare `npx jest`
fails on the ESM import, which is a runner detail, not a red):

```
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
```

and `grep -c 'test\.skip\|describe\.skip'` returns `0` on each file. The skip count matters more than
the pass count here — 26 green with skipped arms would be the vacuous-green failure mode this
pipeline has been bitten by before, and the delta forecloses it by counting skips on the same line as
the passes rather than leaving the reader to infer it.

**The four property-owed amendments are discharged, and the document says so without overclaiming.**
PROP-BOUND-03's zero case and PROP-BOUND-05/07/08's heading-form arms have all landed, all green.
What I looked for and did not find was inflation: the delta could have read "all four green" as
"case C is validated". It does not. It records case C's **failure limb** — a landing red is a real
defect, fix owed before batch 14, a survivor is a gate failure — as *"**unexercised**, not waived"*.
That is the honest reading: the rule was never triggered, so it was never tested, and nothing about
this round licenses relaxing it. From a product lens that distinction is the whole value of the
paragraph, because a future amendment still travels under the untested limb.

**PROP-BOUND-03's hedge is retired, not deferred.** The prior revision flagged the
`maxBytesPerDocument <= 0` arm as the one *"not obviously green at landing"* — the zero-bound
production half (LI-16, now `be2456c8`) had never been exercised through the
`extractInjectableMaterial` seam. It now is (`:337`), and it passed on first exercise. The document
records that as retiring the hedge. Correct, and correctly scoped: it is a statement about this arm,
not a general claim that first exercises are safe.

**The Group D amendments are discharged on the same terms.** `learningsSelect.test.js:647`
(`describe("PROP-ORDER-06: orderCorpus permutation invariance and strict-weak-ordering (TSPEC
T-O-4)")`) and `:786` (`describe("PROP-CORPUS-09: selectLearnings totality (TSPEC T-O-5)")`) are both
present and both inside the 26-green count. Verified character-exact at both anchors.

**Nothing was added to the property set, and nothing was dropped.** §C.3's *"Properties with **no**
owning task | 0"* row is byte-unchanged, and the four newly-inventoried files are declared
property-free. That claim is true in the direction it is stated — I grepped this document for all four
filenames and the thirteen hits are all inside §C.4/§G.2/§G.3's new prose, never inside a property
statement — but it is not the whole picture in the other direction:
`helpers/learningsComposition.js:2` describes itself as *"the AC-2.5 / PROP-ORDER-05 composition"* and
is imported by the task-owned `learningsDispatchSet.test.js:42`, so one of the four sits on
PROP-ORDER-05's oracle path even though no property names it. The oracle itself has not moved (§O text
at line 751 is byte-unchanged and still satisfied), so this is a completeness point about the new
characterisation, recorded as F-03 below. The obligation the implementer receives is unchanged in kind
and in count, which is the question a product reading of this delta has to answer.

## Oracles

**No oracle row, AT mapping, level or red/green owner changed in this delta.** §O.1–§O.10 are outside
every changed line range. What the delta touches is the *evidence* an oracle's status rests on, and in
two places the anchor cited alongside an oracle:

| Oracle-side dependency | Delta effect | Verified at HEAD |
|---|---|---|
| PROP-BOUND-03/05/07/08 → red LI-08 / green LI-17 | Anchors re-pinned `5e522a52`→`8eee671f`, `2cbacada`→`a4998e13`; owners unchanged | Both new anchors are the true `--diff-filter=A` / commit-subject anchors and are ancestors of HEAD |
| LI-16 owner of TSPEC §D.5's zero-bound production half | `d462ddd8` → `be2456c8` | `be2456c8` is *"LI-16 — **GREEN the pure selection core** (TSPEC §I.3, §D.3–§D.6)"* |
| PROP-CONFIG-09 ↔ LI-12's three-case `LI-AT-30` | Anchor re-pinned `eb32d7d2`→`d9b51a9a`; **three new line anchors added** (`:248`, `:264`, `:280` inside the `describe` at `:247`) | All four lines are character-exact, and all three `test(` titles match the quoted text |
| PROP-ORDER-06 / PROP-CORPUS-09 Group D arms | Recorded present and green | `learningsSelect.test.js:647` and `:786`, both inside the 26-green run |
| P-A-6's PROPERTIES-suite window (LI-21) | `92b7ea0c` → `e7fa8d87` | `e7fa8d87` is *"LI-21 — **GREEN the run wiring and the report key**"* |
| LI-05's capture script | `ced75955` → `0fa099a3` | `0fa099a3` is *"LI-05 — GREEN the capture script"*; `git ls-files scripts/` still returns exactly `scripts/capture-learnings-baseline.mjs` |
| LI-04's ignore rule | `ae2af1da` → `5b4c6663` | `5b4c6663` is *"LI-04 — GREEN the ignore rule"*; `.gitignore:13` is `/.baseline-worktree/` |

**The new line anchors are the right kind of citation.** DEC-DOC-01 makes a bare `file:line` a Process
finding when the line number *is* the claim. Every anchor this delta adds carries the verbatim
`describe(`/`test(` title beside it, so the line number is a convenience and the title is the claim —
a reader who finds the title moved knows what to look for. No DEC-DOC-01 finding arises from this
delta.

**The three-case reading survived PLAN's move to v1.1 in substance, not in quotation.** PLAN's case C
*When* cell now reads *"batch 13 or later, the case that is live at HEAD"*
(`PLAN-pdlc-learnings-injection.md:493`); this document quotes it as *"after batch 13, the case that is
live at HEAD"* at line 11, line 1129 and (paraphrased) lines 1329 and 1335. A fixed-string grep for the
quoted form returns **zero** matches in PLAN at HEAD. PLAN v1.1's changelog explains the rewording: the
domain was restated by batch number so *"no batch falls between case B's upper bound (12) and this
case"*. That widens case C to include batch 13, and every amendment this document routes landed **after**
batch 13 — so the case that governs, and the obligation it imposes, are identical under either wording.
The quotation is stale; the conclusion is not. F-02, Medium, non-gating.

**The other case-C quotations still match character-exactly at PLAN v1.1.** I re-ran fixed-string greps
for each: *"under case C they owe no ledger row, and they owe green"* (1 hit), *"batch 9 through batch
12"* (1), *"**this** heading-form follow-up commit, not a standing exemption"* (1), *"has found a real
defect, not staged a TDD red"* (1), *"any other amendment to a landed suite arriving from here on"* (1),
*"the first point the suite is green, which in practice is after LI-21"* (1). Only the *When* cell moved.

**PLAN itself still cites the pre-rebase anchors this delta retired.** `PLAN:493` names `92b7ea0c`,
`d462ddd8` and `2cbacada`; none is reachable from HEAD. That is a defect in PLAN, not here — PROPERTIES
is now the more accurate of the two documents on this point — and I route it as an ERRATUM rather than
folding it into this verdict.

**Both new sections route rather than decide, which is the correct oracle-side behaviour.** §G.2 gap 5
and §G.3's newly-routed item state a measured fact about PLAN's manifest and hand the decision to PLAN
(*"PLAN's to decide whether the four take task rows, a remediation row, or an explicit out-of-manifest
note"*). Under a decision freeze that is exactly right: the document records what it measured and opens
no decision of its own.

## Fixtures

**§F.1–§F.3 are byte-untouched, so the fixture question is whether the delta's new fixture-side facts
contradict them.** They do not, but the delta stops short of one consequence it uncovered.

| Fixture-side claim | Measured at HEAD | Holds? |
|---|---|---|
| §C.4's fixture row: `fixtures/learnings-baseline/` holds `MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/{0,1}.txt` **and a `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18 files** | `git ls-files` returns exactly those, and the arm is `0.txt`…`17.txt` — **18** | Yes |
| §F.2: `MANIFEST.json` records per file the capture commit, case id, dispatch index, `docType` and a SHA-256, re-verified by PROP-META-04 | Section unchanged; the delta makes no digest claim that could contradict it | Yes |
| §F.2: `.baseline-worktree` is **not** ignored, `git check-ignore -v .baseline-worktree` exits 1 | Exits **1** at HEAD — and it still does *after* LI-04, because `.gitignore:13`'s `/.baseline-worktree/` carries a trailing slash and the path is absent. The delta re-pins LI-04 without disturbing this | Yes |
| §F.1 corpus fixtures declared against `helpers/learningsFixtures.js` | Helper unchanged this round; no fixture row moved | Yes |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | Still hand-computed; the third binding literal `60` (`learningsBlock.test.js:235`) is likewise beside the two-section arm, not derived from the code under test | Yes |

**The `Added by` cell for the fixture row is now attributing two events to one commit.** The row reads
`744311f7`, which is correct for `MANIFEST.json` and the two `PHASE-*` arms (*"LI-06 — pre-feature
baseline capture committed"*). The `PIPELINE-NON-AUTHORING-PROMPTS/` arm the same cell enumerates
arrived in **`2fc6fcd3`**, not `744311f7`. Since the table's stated convention is *"each row carries the
commit that added the file"*, a reader auditing the arm against `744311f7` finds nothing there. Low,
F-04.

**The under-stated half of gap 5 — and this is the finding with product weight.** `2fc6fcd3` did more
than add four files. `git show --stat` shows it also **rewrote `MANIFEST.json`** and added the entire
18-file `PIPELINE-NON-AUTHORING-PROMPTS/` case-id arm, and rewrote `learningsBaselineGuard.test.js`
(200 lines changed). That is a **re-capture of the byte-identity baseline**, landing under a
docs-titled commit with no PLAN row. PLAN's own P-A-5 rules on precisely this case: a re-capture's
manifest rows go *"To the PLAN, at the time … one added row per file, naming the causing task and its
batch — committed **before** the re-capture runs"*, because *"a re-capture that exists only in a
completion note is a second writer on `fixtures/learnings-baseline/**` and on the guard suite that no
mechanical check can see"*. §G.2 gap 5 and §G.3 record the four **files** and route them; they do not
record that the same commit is a second writer on the fixture subtree and on the guard suite, which is
the larger half of the same manifest gap and the half PLAN already has a rule for. Recording it would
sharpen the route without opening any decision: it tells PLAN this is a P-A-5 event, not just four
unlisted files. F-02b — Medium, non-gating (recorded as F-05).

**Nothing here falsifies a property.** PROP-META-04 reds if a **retained** digest changes; adding a new
case-id arm and re-transcribing the manifest is a re-capture, which §F.2 and §O.2 already contemplate
and which the delta does not claim otherwise about. The fourteen-row inventory's arithmetic is restated
correctly (*"Eighteen files, fourteen of them task-owned"*), and every one of the fourteen still maps to
a PLAN task row I confirmed in PLAN's §File-ownership manifest — I extracted its `learnings*` paths and
got exactly the same fourteen, with none of the four remediation files among them.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The PLAN pin is now three versions stale, and one sentence states it as a fact about HEAD.** Line 11 pins `PLAN-pdlc-learnings-injection.md` at **v0.8**; PLAN at HEAD is **v1.1** (`PLAN-pdlc-learnings-injection.md:18`), via v0.9 (erratum), v1.0 (Phase CR round 1, new DoD 14) and v1.1 (round 11 delta confirmation). Line 1326 goes further than a pin and asserts *"PLAN at HEAD (**v0.8**)"*, which is literally false at HEAD; lines 1169, 1334, 1341 and 1374 attribute rulings to *"PLAN v0.8"*, which are correct as provenance and need no change. **Non-gating**: the underlying rulings are all still present at v1.1 (six of the seven verbatim quotations still match character-exactly — see Oracles), so no conclusion this document draws is false, and the sentence is inherited, not introduced by this delta. Fix: re-pin line 11 to v1.1 and change line 1326's *"PLAN at HEAD (v0.8)"* to name v1.1 | PLAN P-A-6 / P-A-7 |
| F-02 | Medium | Local | **A verbatim quotation of PLAN's case C no longer matches PLAN.** Lines 11 and 1129 quote case C's *When* cell as *"after batch 13, the case that is live at HEAD"*; PLAN v1.1 reads *"batch 13 or later, the case that is live at HEAD"* (`PLAN:493`), and a fixed-string grep for the quoted form returns **zero** hits in PLAN at HEAD. Lines 1329 and 1335 paraphrase the same stale form (*"after batch 13"*). PLAN's v1.1 changelog gives the reason — the domain was restated by batch number so *"no batch falls between case B's upper bound (12) and this case"*. **Non-gating**: the widened domain includes every amendment this document routes (all landed after batch 13), so the governing case and its obligation are identical under either wording. Fix: re-quote the *When* cell verbatim at both sites and adjust the two paraphrases | PLAN P-A-7 case C |
| F-03 | Medium | Local | **One of the four newly-inventoried files sits on a property's oracle path, which the new characterisation does not say.** §C.4 and §G.2 gap 5 describe all four as remediation artifacts *"no property of this document names"*. True as stated — the thirteen filename hits in this document are all in §C.4/§G.2/§G.3 prose, none in a property statement. But `helpers/learningsComposition.js:2` calls itself *"the AC-2.5 / PROP-ORDER-05 composition"* and `:149` *"the SECOND process invocation of PROP-ORDER-05"*, and it is imported by the task-owned `learningsDispatchSet.test.js:42`. So PROP-ORDER-05's two-process oracle (§F.2 tail, line 751; §O AT-14 row) now executes through an unowned helper. The oracle itself has not moved and is still satisfied, so this is completeness, not fidelity. Fix: one clause in gap 5 noting that `learningsComposition.js` is on PROP-ORDER-05's execution path, so PLAN's disposition of it is not purely cosmetic | AC-2.5, PROP-ORDER-05 |
| F-04 | Low | Local | **The baseline fixture row attributes two capture events to one commit.** §C.4's `fixtures/learnings-baseline/` row reads `Added by 744311f7` while its own cell enumerates the `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18 files, which arrived in **`2fc6fcd3`** (`git log --diff-filter=A -1` on `PIPELINE-NON-AUTHORING-PROMPTS/0.txt`). `744311f7` is correct for `MANIFEST.json` and the two `PHASE-*` arms. Against the table's own stated convention (*"each row carries the commit that added the file"*), a reader auditing the arm at `744311f7` finds nothing. Fix: split the row, or name both commits in the cell | PLAN §File-ownership manifest |
| F-05 | Medium | Cross-Feature | **Gap 5 under-states its own evidence: `2fc6fcd3` is a P-A-5 re-capture event, not just four unlisted files.** `git show --stat 2fc6fcd3` shows the same commit rewrote `MANIFEST.json`, added the whole 18-file `PIPELINE-NON-AUTHORING-PROMPTS/` case-id arm, and rewrote `learningsBaselineGuard.test.js` (200 lines changed) — a second writer on `fixtures/learnings-baseline/**` **and** on the guard suite. PLAN P-A-5 already rules this case: a re-capture's manifest rows go *"To the PLAN, at the time … one added row per file, naming the causing task and its batch — committed **before** the re-capture runs"*, precisely because a re-capture recorded elsewhere is *"a second writer … that no mechanical check can see"*. §G.2/§G.3 route the four files but not the fixture-side second-writer event, which is the half PLAN has a standing rule for. **Non-gating**: this is an addition to a route this document already opened, not a contradiction of anything it states. Fix: one sentence in gap 5 and in the §G.3 routed item naming the re-capture and citing P-A-5 | PLAN P-A-5; DoD 6 |

**No High findings.** Every claim the delta introduces was re-measured and holds: seven of seven
reversed absence claims, all eighteen inventory anchors, the 26-green run with a zero skip count, the
rebase claim itself (old anchors unreachable from HEAD, new ones reachable), the LI-22 commits, the
`.gitignore:13` rule, the `learningsConfig.test.js` line anchors and the PLAN-manifest under-count that
§G.3 routes. Nothing this revision changed broke anything that worked before, and no load-bearing claim
contradicts the repository at HEAD.

## Deferred

Observations that are improvements, not defects. Under DECISION FREEZE none of these blocks, and none
is a decision to reopen:

DEFERRED: The §C.4 reversal table is the clearest artifact in this document — consider making it the standing form for any future re-measurement, rather than editing claims in place.
DEFERRED: The inventory table would survive the next rebase better if the `Added by` column carried commit *subjects* alongside SHAs, since subjects are rebase-stable and SHAs are not.
DEFERRED: §C.4 now states the green run's numbers (`26 passed`) but not the command's working directory; `pdlc/workflows`'s package script is required (a bare `npx jest` fails on the ESM import), which a future reader reproducing the claim will hit.
DEFERRED: The four unowned files could carry a one-line pointer back to §G.2 gap 5, so a reader arriving from the code side finds the routing rather than re-deriving it.
DEFERRED: PROP-META-04's retained-digest invariant is the natural mechanical check for the P-A-5 second-writer event in F-05; whether it should be extended to *added* case-id arms is a decision for a future round, not this one.

## Positive Observations

- **It reversed its own claims rather than quietly restating them.** Seven absence claims are named as
  *"now false"*, with the reason (the branch advanced past the commit they were taken at) and a
  claim-by-claim table putting the old wording beside the measured state. That is the honest form of a
  correction, and it is the form that lets a reviewer check it in one pass — I checked all seven with
  `sed -n` and `grep -n`, and all seven matched.
- **It counted skips on the same line as the passes.** *"26 passed, 26 total"* plus a
  `test.skip`/`describe.skip` count of **0** forecloses the vacuous-green failure mode this pipeline has
  been bitten by before. A green count alone would have been unfalsifiable in the direction that
  matters; this one reproduces exactly on re-run.
- **It refused to over-read its own good news.** Case C's failure limb is recorded as *"**unexercised**,
  not waived"*, and PROP-BOUND-03's hedge is retired for that arm only. Four green amendments could
  easily have been written up as "case C validated"; they were not, and the next author who lands an
  amendment still meets the untested rule intact.
- **It routed the PLAN gap instead of absorbing it.** §G.3 states the measured fact and hands PLAN the
  decision (*"PLAN's to decide whether the four take task rows, a remediation row, or an explicit
  out-of-manifest note"*). Under a decision freeze, discovering a gap and *not* deciding it is exactly
  the right move, and it is why this round has no High.
- **Its re-pinning was verifiable end to end.** Every one of the eighteen inventory anchors is the true
  `--diff-filter=A` commit for its file, and every retired anchor is provably unreachable from HEAD.
  A re-pin is the easiest edit to fake and one of the harder ones to check; this one checked out on
  every row.

## Recommendation

## Verdict

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

## Fixtures

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict

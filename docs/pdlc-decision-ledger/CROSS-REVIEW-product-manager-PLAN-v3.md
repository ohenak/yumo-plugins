# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.3, se-author)
**Date:** 2026-08-29
**Iteration:** 3
**Scope:** Local

Delta re-review. Base: `446a78692` (the bytes v2 reviewed); head `665eb44a8`. Five revision commits
(`596ee1546`, `7b2bc163e`, `98eb071ce`, `8cee638a8`, `665eb44a8`), 37 insertions / 14 deletions in
one file. I re-read my v2 findings, diffed the document, verified the disposition, and scanned
**only** the changed regions — the header/revision-history block, the Overview blast-radius
paragraph, rows T-00a, T-03, T-12a, T-10a, T-18, and the `### The coverage gate` subsection of
§Verification. Sections approved at v2 and untouched here are not re-litigated.

## Disposition of v2 findings

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | T-03's enumeration now carries all four `DECISION_CORPUS_ARGV` alternatives, and every number in the row is measured-correct. Executed here: the four-alternative filter over `git ls-tree -r --name-only 8c673a09f` yields **25**; the three-alternative form the row now explicitly names as wrong yields **24**; the same four-alternative filter over live `git ls-files` yields **26**. `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md` is present at `8c673a09f` (`git ls-tree -r --name-only 8c673a09f \| grep discarded`), so the named 24→25 delta is the right file. The fourth alternative matches `TSPEC-pdlc-decision-ledger.md:307-317`'s `DECISION_CORPUS_ARGV`, which holds exactly those four `:(glob)` pathspecs in the same order. |

The fix went further than the finding asked. My v2 F-01 asked only that the arithmetic stop
contradicting itself. The row now (a) names both deltas — 24→25 and 25→26 — so no figure stands as
a bare assertion an implementer must take on trust, and (b) converts the integrity guard from
"set equality on the fixture's path list" into **set equality against a 25-element literal path
array hand-transcribed into the test file**. That second half is the part that actually protects
REQ-DECLEDGER-01: under v0.2's wording a fixture built from the wrong 24-path enumeration would have
been checked against its own path list and passed, surfacing later as an unexplained T-09 byte-literal
red. Under v0.3 it fails at batch 1, naming the missing path. That is the difference between a guard
and a tautology, and it was not something I had asked for.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **T-03's enumeration command is now correct as rendered but unrunnable as written** — the third variant of the same trap, and this time the escaping is not the author's error but the table's. To keep the cell GFM-legal, v0.3 escaped the shell pipe as well as the three regex pipes. Copied verbatim from the raw markdown, the command fails at the first token: `git ls-tree -r --name-only 8c673a09f \| grep -E …` ⇒ `error: unknown switch \`E'` (executed here). Inside the single-quoted ERE, `\|` is a literal pipe, not alternation, so even after the shell pipe is repaired the filter matches nothing. The numbers in the row are right (verified above); the artefact an implementer executes is not. This matters because the row does not merely cite the command, it **assigns its execution**: T-03 must "record this reconciliation in its file header". Fix: hoist the command into a fenced code block in `### Suite layout, verified at HEAD` or immediately under the task table — a fenced block is exempt from GFM cell escaping — and have T-03's cell point at it. | REQ-DECLEDGER-01 |
| F-02 | Medium | Process | **The per-wave delta-coverage remediation is addressed to the one implementer who does not need it.** The corrected timing analysis is right and materially important: `implementation.testCommand` in `.claude/pdlc.config.json` is `(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- --testPathIgnorePatterns …` (verified — and byte-identical in `.claude/pdlc.config.example.json`), which contains no coverage clause, while `pdlc/workflows/package.json:9`'s `test:coverage` chains `check-wave-resume-delta-coverage.mjs` as its third clause and `.github/workflows/pr-tests.yml:92` is what runs it. So an uncovered line introduced at batch 3 surfaces at PR time, six greens later — exactly as the section now says. The close is "an explicit instruction to the implementer of **each** of batches 3–8", but it lives **only** in T-18's row (batch 8) and in this prose. `grep -n check-wave-resume-delta-coverage` over the PLAN returns lines 119 (T-18), 321, 332, 355 (prose) and 421 (DoD) — rows T-13 through T-17, the batch-3-to-7 implementers this instruction is *for*, say nothing. An se-implement agent dispatched on T-13 reads T-13's row; an instruction sitting in a task eight batches downstream is not a delivery mechanism. Fix: one sentence in each of T-13…T-17 ("after committing this batch's `orchestrate-dev.js` edit, run `node pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`"), or in `### RED-terminal batch gate wording`, which every batch-3–8 implementer must read anyway. | REQ-DECLEDGER-02 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | T-10a arm 3 now compares the `main()`-driven flag-off reviewer prompt against **T-02's committed merge-base recording**. That is the right referent — `FSPEC-pdlc-decision-ledger.md`'s AT-04 says "byte-identical to the committed fixture baseline — not a same-branch before/after comparison", and TSPEC §7.4 §1160-1163 gives the reason (a regression corrupting both arms identically passes every same-branch comparison). One implementation question the row leaves open: T-02 captures that recording by driving **exported `reviewLoop`** through `runCaptureScript`'s scenario matrix, while T-10a drives **`main()`**. For the byte comparison to be meaningful rather than vacuously red, T-10a must reproduce the scenario inputs `scenarios.mjs` fixes. Worth one clause naming `fixtures/decision-ledger-baseline/scenarios.mjs` as the shared input source, so the batch-2 implementer does not discover the coupling by failing. Not blocking; the referent choice is correct. |
| Q-02 | Carried from v1 and v2, still open and still not blocking: `decisionLedger.enabled` ships **false**, so nothing in this feature is operator-visible until someone edits config. Is default-off the intended end state, or is a follow-up enabling it after a bake period expected? A product-roadmap question for the REQ, not a defect in the PLAN. |
| Q-03 | Carried from v1 and v2: the completeness gate applied to reviewer dispatches names `## Overview / ## Batches / ## Dependencies / ## Verification` — the **PLAN's** section contract, not a cross-review's. This file follows the `pm-review` SKILL's mandated cross-review format. Gate configuration for reviewer dispatches still looks mis-wired. |

## Verification performed

Every factual claim the v0.3 edit newly introduced, executed against the working tree on
`feat-pdlc-decision-ledger`. Only changed regions were checked.

**The corpus arithmetic is now right in all three places, and each figure is falsifiable.** Measured:
4-alternative filter at `8c673a09f` = 25; 3-alternative = 24; 4-alternative over live `git ls-files`
= 26. `TSPEC-pdlc-decision-ledger.md:307-317` lists the four `:(glob)` pathspecs the alternation
mirrors, in order. The row's `git ls-tree` rejects `:(glob)` note remains true. The remaining defect
is the copy-paste form (F-01), not the content.

**The coverage-gate correction is sound and is the more valuable of the two TE F-02 halves.**
`pdlc/workflows/package.json:9` chains `check-wave-resume-delta-coverage.mjs` third inside
`test:coverage`; the wave gate's `implementation.testCommand` (verified in both
`.claude/pdlc.config.json` and `.claude/pdlc.config.example.json`) is plain `npm test` with
`--testPathIgnorePatterns`, no coverage clause; `.github/workflows/pr-tests.yml:28,92` is the
`Unit tests (ubuntu-latest, node 20)` check that runs `test:coverage`. The PLAN's "exactly two
places" claim is exactly right, and it retracts v0.2's opposite claim in the open rather than
quietly rewriting it. Declining to widen `testCommand` is also the right product call — widening it
applies clause 3 to unrelated work landing in the same wave, which is this project's recorded T17
gate-widening hazard. My F-02 is about where the remediation is written, not whether it is right.

**T-00a's positive-control claim is now honest about its own reach.** The new sentence says the
`102` complement pin falsifies a mistyped prefix or an exclusion swallowing a neighbouring namespace,
and **cannot** detect a dropped `decisionLedger*` module, since deleting one leaves the complement at
`102`. That is correct and it is the claim v0.2 overstated. Moving the namespace's own census to
T-12a as a **terminal** obligation is the right placement: it is only satisfiable once batch 2's nine
modules exist, and un-skipping at batch 9 keeps it from reddening the wave gate mid-feature — the
same reasoning `documentOracles.test.js`'s own comment block gives for not re-pinning the literal.

**T-12a's new census conjunct is a set, and the set is the right size.** It asserts the
`decisionLedger*.test.js` module-name set is set-equal to twelve names transcribed from the
file-ownership manifest. The manifest (PLAN:151-176) does list exactly twelve distinct
`decisionLedger*.test.js` paths — Preflight, BaselineGuard, FixtureGuard, Config, Recognise, Render,
Bounds, Injector, Corpus, Loop, Main, Census — matching T-00a's "three in batch 1, nine in batch 2".
Set equality rather than a count means a dropped or renamed module names itself in the failure,
which is what the DC-07-shaped risk here actually needs.

**The blast-radius re-count agrees with the manifest it summarises.** Fifteen new paths under
`pdlc/workflows/__tests__/` = twelve modules + `helpers/decisionLedgerDoubles.js` + the two fixture
trees; the engine module is the sixteenth overall. The manifest carries all sixteen, and the
paragraph's own standing promise ("this paragraph is its prose summary and must agree with it") now
holds.

**T-10a's flag-off referent change is a product-fidelity fix, not a test-style preference.** v0.2
would have defined the flag-off prompt by subtracting the rendered block from the flag-on prompt —
the expected value derived from the code under test, which is precisely the implementation echo
`FSPEC` AT-04 forbids when it says "not a same-branch before/after comparison" and REQ-DECLEDGER-02
means when it says byte-identical to *today*. The committed recording is the independent referent.
AT-14 and AT-16 both cite "AT-04's committed baseline" as their own anchor, so this change also
keeps three acceptance criteria pointing at one artefact instead of two.

## Positive Observations

- **Every one of TE's five findings and my one were addressed as structure, not as prose.** Each fix
  changed what a test asserts or where an obligation lives — the 25-path literal array, the terminal
  namespace census, the committed-recording referent — rather than adding a sentence promising care.
- **The document corrects itself in the open.** The coverage-gate subsection opens "v0.2 said it
  'runs at every wave gate from batch 3 onward'. It does not", then draws the *opposite* consequence
  from the corrected fact. A plan that names its own retracted claim is far cheaper to review than
  one that silently rewrites, and this is the second round it has done so.
- **T-03's numbers are now each attached to a named file.** 24→25 is
  `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md`; 25→26 is this feature's
  own `DECISIONS` file, which is the reason the fixture is frozen at all. An implementer who
  measures a different number can now tell *which* file explains the difference, instead of halting.
- **The scope discipline under pressure is the right call.** The obvious fix for the coverage-gate
  timing gap is to widen `implementation.testCommand`; the PLAN names that, rejects it as out of
  scope with the reason, and takes the more awkward manual-run remediation instead. Declining a
  tempting fix that would change gate semantics for unrelated work is the judgement this repo's
  learnings say costs the most when it is missing.
- **T-00a now states what its control does *not* prove.** Writing down the limit of an assertion is
  rarer and more useful than adding another assertion, and it is what let the missing obligation be
  relocated to T-12a rather than left implicitly covered.

## Recommendation

**Approved with minor changes**

No High findings. My v2 F-01 is resolved, and the fix is stronger than the finding required. Scanning
the changed regions raises two Mediums, neither gating and neither about the product content of the
plan: F-01 is a copy-paste hazard in a command the PLAN assigns an implementer to execute, fixed by
moving it out of a table cell into a fenced block; F-02 is a delivery-address problem — a correct
per-wave instruction placed where the wrong implementer will read it, fixed by one sentence in each
of T-13…T-17 or in the batch-gate wording. Both are best folded into batch 1's dispatch rather than
another full round. No scope creep, and no P0/P1 acceptance criterion is left without an owning task
in the changed regions.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}

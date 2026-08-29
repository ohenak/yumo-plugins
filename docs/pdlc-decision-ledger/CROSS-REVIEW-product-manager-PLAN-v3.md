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

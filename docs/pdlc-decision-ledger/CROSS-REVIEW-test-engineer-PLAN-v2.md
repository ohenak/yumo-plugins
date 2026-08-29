# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.2, Draft)
**Date:** 2026-08-29
**Iteration:** 2

## Overview

Delta re-review of v0.2 against my v1 (`CROSS-REVIEW-test-engineer-PLAN-v1.md`, verdict *Needs
revision*, 4 High / 3 Medium / 1 Low). I read v1, diffed the PLAN against the commit I reviewed
(`b80cba470`, 190 insertions / 66 deletions), and confined my reading to the changed sections.

**All four v1 High findings are resolved, and resolved well** — not papered over. `T-00a` moves the
census exclusion into batch 1 where it belongs; the coverage-gate section is rewritten around the
clause it had missed; `T-10a` gives the `main()` wiring a live execution arm with a call-count
runtime oracle; `T-12a` gives T-19's documentation half a derived, set-equality red predecessor.
The three Medium and one Low are resolved too.

One **new High** blocks: the `git ls-tree` enumeration `T-03` transcribes this round — added by the
same edit that fixed PM F-01's `:(glob)` problem — omits one of `DECISION_CORPUS_ARGV`'s four
pathspecs. It yields **24** files at the Baseline commit, not the **25** the row claims, and the
file it silently drops carries four decision ids. Every corpus literal in T-09 is transcribed
against a 25-file corpus, so the fixture built from the row as written cannot satisfy them.

That is a one-line fix to one cell. Nothing else in v0.2 is structurally wrong: I re-ran the
engine's own `lintPlanArtifact` over the document — `ok: true`, zero diagnostics, 24 tasks parsed,
every batch matching the column, every ownership row resolving to a real task id.

## Batches

**The three new tasks parse, and they parse into the batches the prose claims.** I did not re-derive
the batch column by hand this round — I ran the production parser over the document:

```
node -e "import {lintPlanArtifact, parsePlanTasks, parsePlanOwnership} from
         'pdlc/workflows/orchestrate-dev.js' ..."
  → lintPlanArtifact: ok=true, diagnostics=[]
  → 24 tasks; T-00/b1 T-00a/b1 T-01/b1 T-02/b1 T-03/b1 T-12/b1
    T-12a/b2[T-00 T-00a] T-04/b2 T-05/b2 T-06/b2 T-07/b2 T-08/b2 T-09/b2
    T-10/b2 T-10a/b2[T-01 T-02 T-03] T-11/b2
    T-13/b3 T-14/b4 T-15/b5 T-16/b6 T-17/b7 T-18/b8[T-10 T-10a T-11 T-17]
    T-19/b9[T-12 T-12a T-18] T-20/b10
  → parsePlanOwnership: 24 rows, 0 owner ids absent from the task table,
    0 task ids absent from the manifest
```

Every declared `Batch` equals `max(dep batch) + 1`; the graph is acyclic; ids are unique; every
dependency resolves. `T-00a` (batch 1) and `T-12a`/`T-10a` (batch 2) shift no other row, exactly as
§Batch column re-derivation states.

**Same-batch same-file check, re-run over the new shape.** `documentOracles.test.js` now has three
owners — T-00a (1), T-12a (2), T-19 (9) — in three distinct batches, serialised by the real edges
T-00a → T-12a → T-19. No batch contains two writers of any file. Batch 1's other five tasks write
pairwise-disjoint new paths.

**PM F-01's manifest reshape is genuinely fixed, not just described.** v0.1's owner cells carried
parentheticals and comma lists that `parsePlanOwnership` would have read as unknown task ids; v0.2's
every row carries one bare id with the batch in its own column, and the parser confirms it. The two
`ownership-near-miss` entries the parser reports are the two coverage tables (`| Row | Scenario |
Owning task |` and `| AT | Owning task | Level |`); they are inert, because
`orchestrate-dev.js:6323-6326` only converts near-misses into diagnostics when the ownership
manifest itself failed to parse, and it did not. `lintPlanArtifact` returning `ok: true` is the
proof.

**Red-before-green, re-checked over the changed rows.** T-10a and T-12a are both `[red]`, both
committed skipped with blocks titled by the id of the green that un-skips them (T-18, T-19), and
both appear in the red-before-green table. T-19's `documentOracles.test.js` entry — the orphan that
was my v1 F-04 — now has T-12a as its red half. T-00a is the one green-at-both-ends row, and it is
labelled as such rather than smuggled in as a green with no red: its own positive control (count
still `102`) is the falsifier, and a mistyped prefix would push the count to 105 and red it. That is
an honest treatment.

## Dependencies

The three new edges are all load-bearing and all correct:

- **T-12a → T-19.** Without it, three of T-19's four deliverables (`OPERATIONS.md`, `README.md`,
  `CLAUDE.md`) stood on a DoD checkbox. The edge makes the derived oracle a precondition of the
  prose edit, which is the right direction: the oracle is written red against constants that do not
  exist yet, then un-skipped once T-19's prose lands.
- **T-10a → T-18.** T-10a carries `T-01, T-02, T-03` — doubles, the byte-identity baseline and the
  frozen corpus — which is the right closure for a `main()`-driven arm that must serve a real
  reviewer flow with scripted `_readFile`/`_git` and compare against the recording.
- **T-00a → T-12a → T-19.** This serialises the three writers of `documentOracles.test.js` through
  real edges rather than through a prose note, which is what the same-file rule actually requires.

**The T-02-before-any-production-change ordering is still enforced as a real edge, not prose** (T-13
carries `T-02`; the serial green chain T-13 → … → T-18 inherits it transitively). I re-checked this
because the new tasks could have introduced a path to production that bypasses it: T-10a is a red
task and writes no production file, so it cannot.

**One dependency claim I checked against the repository and found wrong** — see F-01 in `## Findings`.
The `Ordering constraints` bullet for T-03 states the fixture is "a frozen copy at `8c673a09f`" of
**25** in-scope files while "the live enumeration already returns 26". Those two numbers are right;
the enumeration command T-03's own row transcribes does not produce them. The bullet and the row
disagree, and the row is what an implementer will run.

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

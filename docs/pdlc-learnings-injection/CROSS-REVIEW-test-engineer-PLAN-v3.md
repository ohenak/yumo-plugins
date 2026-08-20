# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-20
**Iteration:** 3
**Base of the delta:** `94539626` (the commit at which v2 was written) → HEAD

## Overview

**Scope of this round.** Delta re-review of the seven commits between `94539626` and HEAD
(+35 / −15 lines on the PLAN). I read my v2 file, diffed the document against the commit I
reviewed, verified each of my six prior findings against the revised text and against the
repository, and scanned only the changed material for new issues. Sections I approved in v2 and
that the diff did not touch — the batch DAG, the file-ownership manifest's structure, LI-08, LI-09,
LI-11, LI-12, LI-16…LI-22, the measured coverage baseline — were not re-litigated.

**Disposition of the six v2 findings. All six are resolved.** None was resolved by wording alone;
each landed as a changed clause in the artifact the implementer transcribes from.

| v2 | Sev | What v0.3 does | Resolved |
|---|---|---|---|
| F-01 | Med | LI-23's `corpusOutcome` equality is scoped to **non-`null`** observations, with the reason stated (healthy value is `null`, three arms cannot be driven without observing it) and the wrong repair explicitly forbidden ("do **not** expect `LEARNINGS_CORPUS_OUTCOMES ∪ {null}`"); §Traceability's twelve-arm paragraph carries the same scoping | ✅ |
| F-02 | Med | The green-terminal gate row gains "**and** every pre-existing test's status is unchanged from the measured baseline, the same conjunct the other three rows carry", with batch 4's fixture-subtree risk named as the reason | ✅ |
| F-03 | Med | LI-07 restates AT-15 as **four** clauses, names the two fixtures in order, assigns (1) and (4) to LI-16 and (2)/(3) to LI-19, and says why (4) may not be dropped — "without it clause (1) is an absence-only oracle over path handling". §Traceability's AT-15 row carries the same split | ✅ |
| F-04 | Med | §The measured baseline restates the instrument: `execFileSync("git", ["status", "--porcelain"])` at the repository root, **no `-uno`**, so `-unormal` applies and a written-but-uncommitted new test file reds it | ✅ |
| F-05 | Low | `LI-T-SUITEMAP`'s closure is taken **over the directory**: enumerate `__tests__/learnings*.test.js`, compute the set of files registering ≥1 `LI-AT-` jest **title**, assert that set equal to the six, then partition. DoD 1 and batch 6's ladder row carry the same wording | ✅ |
| F-06 | Low | The `→ LI-06` edge is split: `LI-10, LI-11, LI-12 → LI-06` keeps the byte-identity reason; `LI-23 → LI-06` gets its own row stating it is **not** byte-identity but the shared L3 fixture matrix, and that the edge is slack | ✅ |

**Every resolution was re-measured against the repository, not read.** `consumerCleanup.test.js`'s
`AT-4.1` runs `execFileSync("git", ["status", "--porcelain"], {cwd: <repo root>})` and asserts
`""` with no `-uno` (`pdlc/workflows/__tests__/consumerCleanup.test.js:149-153`) — v0.3's restated
mechanism is exact. No `learnings*` file exists under `pdlc/workflows/__tests__/` at HEAD, so the
directory-wide closure has a clean field to start from. P-2a's four sites are still
`:12861`, `:12955`, `:13657` (object literal) and the positional `"authoring"` argument to
`runWrapped` inside `reviewLoop`'s FAIL path (`pdlc/workflows/orchestrate-dev.js:7659-7664`); the
other `"authoring"` occurrences are reads and `mode:` literals (`:6511`, `:6515`, `:6517`, `:6535`,
`:8886`), which the row's "object-literal `dispatchKind:` sites plus positional argument" keying
correctly excludes. P-4 holds: `enumerateCorpus` is exported at
`pdlc/workflows/consolidate-learnings.js:1349` and `LS_FILES_ARGV` is a module-private `const` at
`:1338`.

**Verdict of this round: Approved with minor changes.** No High findings, and none open from any
prior round. One Medium and three Lows, all of them consequences of the v0.3 edits themselves —
three are one-clause alignments that the revision made necessary and did not finish propagating,
and the Medium is a delegated positive assertion that no task row names.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

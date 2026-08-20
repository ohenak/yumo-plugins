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

**Four task rows changed: LI-01, LI-07, LI-23, LI-14.** I checked each against the repository and
against the upstream text it transcribes.

| Row | Claim checked | Result |
|---|---|---|
| LI-01 | The premise suite drops the change-surface **absence** claims and keeps them as a one-time pre-flight (PM F-07) | ✅ — and this is the right call under my lens too: three of the four absences are falsified by this PLAN's own tasks at batches 1–4, so a standing assertion would red at batch 3 and halt every batch after it. Nothing is lost: `LI-T-IGNORE` conjunct (1) is the *positive* standing oracle over the same fact after LI-04 |
| LI-01 | P-2a as a **set equality over the four call sites**, keyed by enclosing function and argument position, so a fifth site reds at batch 1 (PM Q-04) | ✅ — the keying is well-defined and exact at HEAD. Three object-literal `dispatchKind: "authoring"` properties (`:12861`, `:12955`, `:13657`) plus the positional argument at `:7663`; `mode: "authoring"` at `:6517`/`:6535` and the reads at `:6515`/`:8886` are correctly outside the keyed set |
| LI-07 | AT-15 is **four** clauses, with (4) the positive half | ✅ — a literal transcription of `FSPEC:836-841`, and the row now states the falsifiability argument I made for it ("without it clause (1) is an absence-only oracle over path handling"). Naming `DISCARDED-NESTED` and `DISCARDED-DIRECT` "in that order" closes the fixture question the enumeration used to leave open |
| LI-23 | Non-`null` scoping on the `corpusOutcome` equality | ✅ for the equality; ⚠️ for the delegation it rests on — see F-01 below |
| LI-14 | Directory-wide closure, keyed on **registered test titles** | ✅ for the mechanism; ⚠️ for two consequences it does not finish propagating — see F-02 and F-03 |

**The directory closure is stronger than the fix I asked for, and it is sound at batch 6.** I
walked its arithmetic. The glob `__tests__/learnings*.test.js` matches twelve files by the end of
batch 6 — `Premises` (b1), `CaptureScript`, `PredicatePin` (b2), `Select`, `Block`, `Corpus` (b3),
`BaselineGuard` (b4), `Record`, `DispatchSet`, `Config`, `ArmInventory` (b5), `SuiteMap` (b6) — and
does **not** match `helpers/learningsFixtures.js`, which is one directory down. Six of those twelve
register `LI-AT-` titles; the other six register `LI-T-` titles only. The equality therefore closes
at six and stays closed for the life of the wave, since no task after batch 6 authors a new test
file (the manifest's remaining rows are all `orchestrate-dev.js`). The "no new `Deps` edge is
needed" argument is also correct in the direction that matters: a file that does not yet exist can
only fail to *contribute* a member, never add a spurious one, and the six that must be present are
exactly LI-14's six declared dependencies.

**The self-exclusion argument holds.** `learningsSuiteMap.test.js` matches its own glob and its
hand-transcribed literal mentions all 35 `LI-AT-` ids, so a textual scan would put the suite in its
own expected set and the equality would close at seven. Keying on *registered jest titles* — the
suite registers only `LI-T-SUITEMAP` — is what keeps it out, and the row says so explicitly. That
is the one detail an implementer would most plausibly get wrong, and it is stated.

**What the closure newly makes load-bearing, and does not say.** With the set taken over the
directory, the *naming* of every non-AT suite's tests is now a gate input: an `LI-AT-`-prefixed
title in `learningsPremises.test.js` or `learningsBaselineGuard.test.js` reds `LI-T-SUITEMAP` at
batch 6. Four of the six non-AT suites declare their test names in their rows — `LI-T-IGNORE` /
`LI-T-WORKTREE` (LI-03), `LI-T-PIN-1` (LI-13), `LI-T-ARMS-1…3` (LI-23), `LI-T-SUITEMAP` (LI-14).
LI-01's and LI-06's rows do not. Filed as F-02, Low.

**No same-batch same-new-file collision was introduced, and TDD order is unchanged.** No task rows
were added or removed this round (still 23), no `Test File` or manifest cell changed, and the two
rewritten green attributions (LI-16 for AT-15's clauses 1 and 4, LI-19 for 2 and 3) both name a
suite whose red predecessor — LI-07 — is already a declared dependency of both. Every
implementation task still has a preceding red-test row referencing the same suite.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

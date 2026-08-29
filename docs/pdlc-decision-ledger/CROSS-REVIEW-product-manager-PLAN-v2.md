# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.2, se-author)
**Date:** 2026-08-29
**Iteration:** 2
**Scope:** Local

Delta re-review. Base for the diff: `bedf68649` (the commit at which v1 was written); nine revision
commits `477e330a2..446a78692` follow it, 190 insertions / 66 deletions. I re-read my own v1
findings, diffed the document, verified that each is resolved, and scanned **only** the changed
sections for new issues. Unchanged sections approved at v1 were not re-litigated.

## Disposition of my v1 findings

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Not resolved — new defect in the fix** | T-03's replacement command runs, but omits `DECISION_CORPUS_ARGV`'s fourth glob and yields 24, not the 25 the row claims. See F-01 below. |
| F-02 | Medium | **Resolved** | T-20 now names the target `0.23.7` and carries the constraint that binds it: `pdlc/engine/package.json:18` does declare `"pdlcPluginCompat": "^0.23.0"`, so a `0.24.0` bump would fall outside the range the AT-1.6 / DEC-09 handshake asserts. The constraint now travels with the task instead of being rediscovered at batch 10. |
| F-03 | Medium | **Resolved** | T-12a is a real red predecessor for T-19's three prose deliverables, and it is the right shape: every expectation **derived** from `DECISION_LEDGER_OMIT_REASONS` / `DECISION_LEDGER_NOTICES` / `DECISION_LEDGER_DEFAULTS` and **set-equal**, not containment. The Red-before-green table now pairs `T-12, T-12a → T-19` over both test files, and the coverage table carries a `FSPEC Q-3 / disclosure prose` row. The absence-only DoD checkbox is gone — the checkbox now says "mechanically asserted by T-12a, not by this checkbox alone". |
| F-04 | Low | **Resolved** | The Overview now carries a "Blast radius outside `orchestrate-dev.js`" paragraph enumerating all seven non-test paths plus the fourteen test/fixture paths, and binds itself to the manifest ("this paragraph is its prose summary and must agree with it"). |
| F-05 | Low | **Resolved** | The RED-terminal sentence now reads "the **six production-file greens** (T-13…T-18) land in batches 3–8, and the two remaining greens — T-19 and T-20 — sit in batches 9 and 10". |

Four of five resolved. F-01's fix replaced an unrunnable command with a runnable one that returns
the wrong number — the same evidence line, wrong a second time in a new way.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **T-03's replacement enumeration command drops `DECISION_CORPUS_ARGV`'s fourth glob and yields 24, not the 25 the row asserts.** The row now hands the implementer `git ls-tree -r --name-only 8c673a09f \| grep -E '^(docs/_decisions/DECISIONS-[^/]*\.md\|docs/[^/]+/DECISIONS-[^/]*\.md\|docs/completed/[^/]+/DECISIONS-[^/]*\.md)$'` and states it "yields **25**", with "the live tree yields 26 under the same filter". Executed verbatim at `8c673a09f` it yields **24**; against `HEAD` it yields **25**. The regex has three alternatives but `TSPEC-pdlc-decision-ledger.md:318-324` defines `DECISION_CORPUS_ARGV` with **four** pathspecs — the missing one is `:(glob)docs/discarded/*/DECISIONS-*.md`, and the file it silently drops is `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md`. Adding a `docs/discarded/[^/]+/DECISIONS-[^/]*\.md` alternative restores 25 at `8c673a09f` and 26 live — exactly the figures the prose already carries, which are themselves correct. **Why it is not cosmetic:** the row makes agreement an acceptance condition ("the two enumerations must be shown to agree at `8c673a09f`, and T-03 records that comparison in its file header"), and under the command as written they demonstrably do not. A batch-1 implementer meets a contradiction between a command returning 24 and a fixture spec saying 25, and the wrong resolution — re-pinning the literal to 24 — drops an in-scope decisions file from the frozen corpus, narrowing a corpus TSPEC enumerates in four globs. **Fix:** add the fourth alternative to the `grep`; leave the 25 / 26 figures alone. | REQ-DECLEDGER-01 (frozen-corpus expected value); TSPEC §3.1 `DECISION_CORPUS_ARGV` |

**Nothing rises to High.** The corpus cardinality the PLAN commits to (25 frozen / 26 live) is
correct; only the reproduction command disagrees with it. T-03's own guards are two-sided —
per-file digest literals hand-transcribed plus set equality on the path list — so a 24-path fixture
fails loudly at batch 1 rather than shipping. This is a halt-and-rediscover cost, not a defect that
reaches users, which is why it stays where I put it at v1 rather than being escalated for being
wrong twice.

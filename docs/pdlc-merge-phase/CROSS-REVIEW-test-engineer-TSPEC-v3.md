# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/TSPEC-pdlc-merge-phase.md` (v1.2, commit `8144608`)
**Date:** 2026-08-02
**Iteration:** 3
**Scope:** line

Delta re-review: `git diff 952326d..HEAD` on the TSPEC, then the four round-2 findings and every new
code citation the delta introduces. No unchanged section re-litigated.

## Round-2 finding dispositions

| ID | Sev (v2) | Disposition | Evidence checked |
|----|----------|-------------|------------------|
| N-01 | Medium | **Closed.** The transport is three-field end to end: §2.3's `defaultGhRun` returns `{ ok, stdout, stderr }`, §4.1's `catch` mirrors `defaultGit`'s **exactly** — I diffed them: `String((err && (err.stderr \|\| err.message)) ?? "")` is `orchestrate-dev.js:4267` verbatim, and the success branch matches `:4262` — and §11.3's `rtGhRun` now answers `rtGit`'s JSON object rather than `RT_MISSING`, with the same three fields, the same escaping instruction and the same `"unparseable adapter response"` fallback (`runtime-adapter.js:932`–`:947`). §4.7's `detail` is therefore obtainable, and the empty-`stderr` hole I did not raise is closed too: the zero-exit-unconfirmed arm gets the fixed token `"merge not confirmed"`, so `detail` is never `undefined` and never empty. The testability half is the part that matters and it is now real: `fakeGhRun`'s default carries a `stderr` string, failing-merge fixtures supply a real one, §13.2's row-17 case asserts the reason line contains **each attempted method *and* that fixture's `stderr` first line**, and `mergeAdapter.test.js` (d) asserts all three reply arms — explicitly naming `stderr` preservation as "the arm a two-field implementation reds". That is a falsifiable oracle for the exact regression, not a restatement | §2.3, §4.1, §4.7, §11.3, §13.1, §13.2 |
| N-02 | Low | **Closed.** §13.3 gains the constraint verbatim: the row-3 and row-18 fixtures supply a `parsePrRef`-parseable `prUrl`, so *queue written: yes* is unambiguous against E16, whose own case stays in `mergeQueueWriteback` | §13.3 |
| N-03 | Low | **Closed.** `isAbsenceDefault` now cited at `runtimeBundle.test.js:817` in §10.4, and §15.1's TE F-03 row updated to the `:787`–`:817` span. Re-verified: the predicate is declared at `:817` | §10.4, §15.1 |
| N-04 | Low | **Closed, and better than asked.** The constant is the expression `1 + MERGE_MAX_RETRIES + 4 + 3 + 1 + 5` (= 24, which I recomputed), and §13.2's termination case asserts the **relation** `MERGE_MAX_DECISION_STEPS > 1 + MERGE_MAX_RETRIES + 4 + 3 + 1` recomputed from the constants rather than the literal. Raising either constant is now checked rather than assumed — the mutation-resistance point, taken properly | §2.2, §5.2, §13.2 |

Nothing else in the delta breaks anything. The two citations new to v1.2 both resolve exactly:
`defaultGit`'s catch shape at `orchestrate-dev.js:4252`–`:4270`, and `firstLine` at
`orchestrate-queue.js:916` — which is genuinely the right helper to reuse, since its existing caller
(`:968`) already uses it for a git failure's first `stderr` line, the same job. The §15.1a
disposition table and E-4's declaration as a *downstream tightening* (rather than an unstated
divergence) leave the FSPEC relationship honestly stated.

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| P-01 | Low | Local | §4.7 draws `executeMerge`'s `reason` from the closed set `"command-failed" \| "not-confirmed"`, but `"not-confirmed"` is absent from §4.1's shared observation-`reason` catalogue (`"command-failed" \| "unparseable" \| "field-absent" \| "unrecognised-value" \| "incomplete"`), and §2.4 makes `O6` one of the six discriminated unions that share the error contract (DC-11). A test enumerating the catalogue from §4.1 would miss the member. Add `"not-confirmed"` to §4.1's list, or say in §4.1 that `O6`'s reasons are its own closed set — either is one line, and neither changes behaviour. Non-blocking: it is a documentation-consistency nit, safe to fold into the PLAN task that writes `mergeObservations.test.js` | §4.1, §4.7, §2.4 |

## Positive Observations

- N-01's fix was made at the seam rather than at the call site: adopting `defaultGit`'s three-field contract and `rtGit`'s reply verbatim means two adapters now answer one shape instead of two, and the "one contract, not two" sentence in §11.3 is the right way to record it.
- The `"merge not confirmed"` token closes a hole my finding did not name — a zero-exit-but-unconfirmed attempt has no `stderr` at all, so a bare "first line of stderr" rule would have produced an empty `detail` on exactly the path FSPEC §6.2 cares most about.
- `mergeAdapter.test.js` (d) naming which arm a regressed implementation reds is the habit that makes a test list reviewable rather than aspirational.

## Recommendation

**Approved with minor changes**

All four round-2 findings are closed, each verified against the code it cites rather than against the
disposition text. Nothing in the delta broke. One Low remains (P-01), which is a one-line catalogue
alignment with no behavioural consequence and can be absorbed by the PLAN. The test strategy now
pins FSPEC §11's 25 rows and AT-M1…AT-M6 with falsifiable oracles at the right levels, every declared
function is reachable through a declared injection point, and the error catalogue's rows each have a
home in §13.2.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 1}

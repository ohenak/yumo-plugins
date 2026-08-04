# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.4)
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** delta re-review — my v3 findings (F-01 H, F-02 M, F-03 L) and questions (Q-01, Q-02), plus new issues in the changed sections only. Testing lens: testability, TDD ordering, batch-DAG mechanics, oracle falsifiability, coverage measurability.

## Disposition of my v3 findings

Diffed `7a44317..HEAD` (six revision commits, `468e98b` … `dc6997c`) over the PLAN. All three v3
findings and both v3 questions are resolved; every claim below was re-executed, not read off the
document.

| v3 | Verdict | Evidence |
|---|---|---|
| F-01 (H) `--json` procedure reads fields jest does not emit | **Resolved, and resolved by transcribing what jest really emits rather than by patching one row.** §5.2 now (a) states the absent fields explicitly as a negative-with-positive pair — `testResults[]` carries `{assertionResults, endTime, message, name, startTime, status, summary}`, the four counters exist only at top level — and (b) derives the per-file triple from `testResults[].name` + `assertionResults[].status` in **one fenced `perFile` reducer quoted by all three gate rows and by §9.1**. I ran the reducer verbatim against `guardMatrix.test.js` at HEAD: `{"guardMatrix — core rows (M01–M32, M34–M90)": {passed:19, failed:0, pending:70}, …}`, and the file total's `pending` matches the top-level `numPendingTests` ⇒ 70. The `ancestorTitles[0]` claim also holds for a **whole-block** `describe.skip`, which is the case that actually matters here and which no shipped suite in this repo exercises — I built a two-block probe (`describe.skip` + live `describe`) and ran it on the pinned jest: `{"BLOCK-A — skipped whole block": {passed:0, failed:0, pending:2}, "BLOCK-B — live": {passed:1, …}}`. So the block-level partition §3's un-skip discipline depends on is real, not assumed. |
| F-02 (M) §9.2's red evidence was an unfalsifiable self-report | **Resolved with both conjuncts I asked for, stated in full.** §9.2 keeps the transcript as "the readable half" and gates on (i) `git show {commit}^:{testFile}` containing the block **with** `.skip` and `git show {commit}:{testFile}` **without**, and (ii) that block's cases moving `pending` → `passed` between the two retained `--json` runs, "with the same *k* on both sides". Both fail-closed conditions are named. §3 step 4 restated to match rather than left to drift. The mechanism is sound at the runner: `commitPaths` commits **once per task**, pathspec-scoped, under `// Only now — verified — does anything get committed (M-6).` (`orchestrate-dev.js:8142-8160`), so `{commit}` and `{commit}^` are both on the branch, and no two writers of one test file share a wave (re-proved below). One defect remains in (ii)'s *input*, not in its logic — see F-01. |
| F-03 (L) P-4's coherence conjunct mis-attributed | **Resolved, and generalised.** P-4 now says the conjunct is "**derived, not quoted**", names what TSPEC:514-515 does state (return type + reason enum), derives coherence from §5.1's ladder, and cross-references `TSPEC:1405`'s absorbing property. Re-read at HEAD: `:514` is the `@returns` type, `:515` the reason enum, `:517` the signature, `:1405` "for any candidate whose paths include a guard path or a test artifact, `inside === false`". All exact. One line-range slip remains; see F-02 below. |
| Q-01 (does the zero-skips glob include `advisoryDisabled.test.js` itself?) | **Answered, with the reason.** §5.2's batch-18 row now says the glob is "**unqualified, i.e. including `advisoryDisabled.test.js` itself**", and states why self-inclusion is safe and what it buys (it closes the one file check (b) alone would cover). |
| Q-02 (how the previous wave's numbers are obtained) | **Answered — retention, not re-derivation.** §5.2's **Retention** paragraph keeps each wave's `/tmp/adv-gate-w{n}.json`, so the batch 7–17 delta is a comparison of two recorded documents. Better than I asked: *k* is read from the block's own wave-(n−1) entry, so **no expected case count is written down anywhere** — the assertion cannot drift from the suite. That reasoning is right; the artifact it reads is not yet single-writer (F-01). |

## Verification performed

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

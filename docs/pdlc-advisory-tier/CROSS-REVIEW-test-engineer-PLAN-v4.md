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

Everything below was executed against the working tree at HEAD.

| Check | Result |
|---|---|
| §5.2's rewritten command, as written | **Executed on the pinned jest** (`pdlc/workflows/package.json` ⇒ `"jest": "^29.7.0"`; runtime 29.7.0). `npm test -- --json --outputFile=/tmp/adv-probe.json 'guard.*\.test\.js'` from `pdlc/workflows/` collected **exactly the three matching suites** (`branchGuard`, `mergeGuard`, `guardMatrix`) — the trailing positional really is jest's test-path pattern under this `npm test` script, so the targeted narrowing works and §5.2's parenthetical is exact. |
| §5.2's `perFile` reducer, verbatim | **Executed twice.** (a) Against `guardMatrix.test.js`: `{core rows: {passed:19, failed:0, pending:70}, M33 re-run: {passed:53,…}, self-audit: {passed:3,…}}` — file-total `pending` 70 = top-level `numPendingTests` ⇒ 70, so "a file's totals are the sum over its blocks" holds. (b) Against a purpose-built two-block probe under `/tmp` (one `describe.skip`, one live) on the same jest binary: `{"BLOCK-A — skipped whole block": {passed:0, failed:0, pending:2}, "BLOCK-B — live": {passed:1, failed:0, pending:0}}`. `ancestorTitles[0]` is populated for cases inside a skipped `describe` — the block-level partition the whole un-skip discipline rests on is confirmed, not inferred. |
| §5.2's `:5849` citation (why the run is targeted) | Exact. `` `Run only your task's targeted tests — do not run the full suite; the orchestrator runs it.` `` at `orchestrate-dev.js:5849`, immediately above `` `You own EXACTLY these files: …` `` at `:5850` and `` `Do NOT run git add or git commit …` `` at `:5851`. The v1.4 `:5849` → `:5850` correction in §3 is right, and §5.2's new `:5849` citation is right. |
| PLAN self-parse after the v1.4 fenced JS block | **Executed** against `orchestrate-dev.js` at HEAD: `parsePlanTasks` ⇒ **36 tasks**, `parsePlanOwnership` ⇒ **36 rows**, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20 batches**, no cycle. The `||=` inside the fence is not mistaken for a table row. §9.1's claim is exact, including its parenthetical about the fence. |
| `computeWaves` ⇒ 20 waves identical to §5.2 | **Re-executed and confirmed member-for-member**, unchanged from v1.3: `1:A-01 \| 2:A-02 \| 3:A-03…A-07 \| 4:A-08…A-12 \| 5:A-13,A-14,A-15 \| 6:A-16,A-17,A-28 \| 7:A-18 \| 8:A-19 \| 9:A-20 \| 10:A-21 \| 11:A-22 \| 12:A-23,A-29 \| 13:A-24,A-30 \| 14:A-25,A-31 \| 15:A-26 \| 16:A-27 \| 17:A-32 \| 18:A-33 \| 19:A-34,A-35 \| 20:A-36`. Byte-identical to `computeTopologicalBatches`. So §9.2 (i)'s premise holds: no two un-skippers of one test file share a wave, and each 🟢 task's commit and its parent bracket exactly its own un-skip. |
| Batch-column re-derivation | **Re-derived all 36 rows** from the `dependencies` column (`batch == max(dep batch) + 1`): **zero desync**, ids unique, every dependency resolves, acyclic. |
| Manifest rows for the multi-task waves | Read from the parsed manifest: A-23 ⇒ `orchestrate-dev.js`, `advisoryDodSeams.test.js`, `advisoryDriver.test.js`; A-29 ⇒ `orchestrate-queue.js`, `advisoryQueueSeams.test.js`. Disjoint, as claimed — and **both** own files matching `advisory.*\.test\.js`, which is what F-01 below turns on. Wave 3 is five agents each creating a different `advisory*.test.js` (`advisoryConfig`, `advisoryRung`, `advisoryVerdict`, `advisoryEnvelope`, `advisoryDriver`). |
| §9.2 (i)'s runner premise | `commitPaths` loop under `// Only now — verified — does anything get committed (M-6).` at `orchestrate-dev.js:8142-8160`, one call per task, `paths` from the manifest row, never `-a`. The script-owned aggregate gate is at `:8115-8118`. The PLAN cites `:8143-8159` and `:8113-8118` — inner ranges, still unambiguous; not worth a finding. |
| P-4's re-attribution against TSPEC | `TSPEC:514` `@returns {{ inside: boolean, reason: string\|null, matched: string[] }}`; `:515` the three-member reason enum; `:517` the signature; `:1405` the absorbing property. All exact. The six-check ladder's line range is off; see F-02. |
| §8.2's registry-generation claim | Reads correctly as a closed loop in both directions (delete a case ⇒ delete a registry row ⇒ set-equality fails; add a sixth `ADVISORY_SEAMS` member with no row ⇒ same case fails). This is completeness by set-equality over the full enumeration, not containment, and it is now stated as a *generation* rule rather than a convention an implementer could quietly abandon. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

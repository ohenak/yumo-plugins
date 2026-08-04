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

Both findings are new, in the section v1.4 rewrote. No v3 finding remains open.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The per-wave `--json` artifact has one path and up to five concurrent writers, so the evidence every per-file gate reads is race-corrupted — and a file missing from the snapshot makes the batch 3–5 defective-red detector pass vacuously.** §5.2 line 469 says "**The wave agent** runs … `--outputFile=/tmp/adv-gate-w{n}.json`" (singular), and §5.2's Retention paragraph (line 510) says "each wave writes its own" file. But a wave is not one agent. I re-executed `computeWaves`: wave 3 dispatches **five** agents (A-03…A-07), each *creating* a different `advisory*.test.js`; waves 12, 13, 14 and 19 dispatch two. Manifest rows confirm the collision is real where it hurts most — wave 12's A-23 owns `advisoryDriver.test.js` + `advisoryDodSeams.test.js` and A-29 owns `advisoryQueueSeams.test.js`, and **both** match the run's `advisory.*\.test\.js` pattern. Three consequences, all on load-bearing oracles: (a) **last-writer-wins** — the retained `/tmp/adv-gate-w{n}.json` is whichever agent finished its run last, so the artifact §9.2 (ii) diffs against wave n+1 may not describe the wave's end state at all; (b) **vacuous pass by absence** — the batch 3–5 gate asserts "for each new `advisory*.test.js` path, `passed === 0 && failed === 0 && pending > 0`", but `perFile` is keyed by whatever jest collected: a sibling's file that did not exist yet simply has **no entry**, and an assertion quantified over the entries present is trivially satisfied. That is exactly the containment-not-set-equality shape this PLAN rejects everywhere else (§8.2's registry, T-03-8's closed sets); it is the only detector separating a genuine skipped-red from a defective one, and it can false-green four of wave 3's five files; (c) an agent snapshotting mid-flight can collect a sibling's half-written suite and attribute the failure to itself. **Resolution — three sentences, no new mechanism.** (1) Name the artifact per task, not per wave: `/tmp/adv-gate-{taskId}-pre.json` and `/tmp/adv-gate-{taskId}-post.json`, so there is exactly one writer per file. (2) Scope every per-file assertion to the **agent's own** owned `advisory*.test.js` files (§4's manifest already names them), taken from that agent's own two runs — which also retires the cross-wave retention rule and its ordering assumption: the 🟢 delta becomes `pre` shows the block `pending: k, passed: 0` and `post` shows `pending: 0, passed: k`, both produced inside one agent, immune to siblings because no sibling writes that file in that wave (proved by `computeWaves`). (3) Require the entry to **exist**: "`perFile` must contain a key for each of this task's owned `advisory*.test.js` paths; a missing key fails the gate" — the set-equality conjunct that turns (b) from a vacuous pass into a falsifiable one. | §5.2 lines 469, 472, 495, 510-513; batch 3–5, 7–17 and 18 gate rows; §9.1 zero-skips checkbox; §9.2 conjunct (ii) |
| F-02 | Low | Local | §6.5's P-4 now correctly says its coherence conjunct is derived, but the range it derives it from stops one line short of the ladder it calls exhaustive: "§5.1's exhaustive six-check ladder (`TSPEC:525-534`)". At HEAD, `TSPEC:525-526` is the introductory sentence, `:528-529` the table header and separator, and the six checks are `:530-535` — so `525-534` covers checks 1–5 and **omits check 6** (`| 6 | X-c / membership | …`, line 535), the one branch whose absence would leave a path returning `inside:false` with `reason:null`. Cite `TSPEC:528-535` (or `:530-535` for the rows alone). One clause, and the same class of precision the rest of P-4's rewrite achieved. | §6.5 P-4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Batches 1 and 2 land no `advisory*.test.js` file, so a targeted run with that pattern collects nothing and jest exits non-zero on "no tests found". No gate row asks for the run at those batches, so this is almost certainly a non-issue — but if an agent runs it defensively as "the evidence step", it will read a failure that is not one. One clause in §5.2 ("the targeted run applies from executor batch 3 onward, the first batch that creates an `advisory*.test.js` file") would remove the ambiguity. |

## Positive Observations

- **F-01 was answered by transcribing reality, not by patching the row that was wrong.** §5.2 now records the absent fields *and* the present ones as a literal, states the reducer once, and has the three gate rows plus §9.1 quote that one expression. The negative ("no `testFilePath`, no `numPendingTests`") is paired with the positive that replaces it — the shape this PLAN demands of its own test oracles, now applied to its own evidence procedure.
- **The `ancestorTitles[0]` insight does more work than the finding asked for.** Partitioning by top-level `describe` title turns the batch 7–17 delta from "the file's pending count falls by the block's case count" into a per-block statement, and it means *k* is read from the previous run rather than written into the PLAN. An expected-count constant in a document is a thing that drifts; a count derived from the artifact cannot. I verified the partition survives a whole-block `describe.skip` — the case the repo's own suites do not exercise, and the only one that matters here.
- **§9.2's red evidence is now genuinely falsifiable, and it says which half is which.** "The transcript is the readable half; this row gates on a second, mechanical conjunct" is the right division, and both conjuncts fail closed for a named reason ("a task that un-skips nothing fails (i), and a case that was already passing fails (ii)"). Naming the failure mode is what distinguishes a gate from a checklist item.
- **§8.2 closed the set-equality loop in both directions.** Stating that the five per-seam cases are *generated* by iterating the registry — rather than merely that a registry exists — makes "a registry row that survives while its case is deleted" inexpressible. That is a stronger guarantee than the review asked for, and it is stated as a construction rule an implementer cannot quietly drop.
- **P-4's re-attribution generalises rather than patches.** "Derived, not quoted", followed by what TSPEC *does* state, the derivation, and a pointer to the related absorbing property at `TSPEC:1405`, is the lesson of P-9's empty-input note applied to a second row. Only the line range slipped.
- **The v1.4 changelog row is the most useful one in §10.** It records what jest actually emits, why the run is targeted (`:5849` reserves full-suite runs to the script), and which reviewer item each edit answers. A future reader who wonders why the evidence command looks the way it does will find the answer without re-running jest.

## Recommendation

**Needs revision**

All three v3 findings and both v3 questions are resolved, and the two I cared most about are resolved
better than asked: the `--json` procedure is now a transcribed literal I re-executed line for line
(including the whole-block `describe.skip` case no shipped suite covers), and §9.2's red evidence has
a git-observable, recomputable conjunct with both fail-closed directions named. The DAG, the wave
partition, the manifest bijection, the batch column, the runner citations and P-4's TSPEC anchors all
re-verified clean by execution.

One High remains, and — as last round — it is a defect *in* the new mechanism rather than anywhere
else in the document:

1. **F-01** — `/tmp/adv-gate-w{n}.json` has one path and up to five concurrent writers. Wave 3 is
   five agents each creating a different `advisory*.test.js`; waves 12/13/14/19 are two, and wave
   12's pair both own files matching the run's pattern. The retained artifact is therefore
   last-writer-wins, and worse, the batch 3–5 assertion is quantified over the entries `perFile`
   happens to contain: a sibling file that did not exist when the snapshot was taken has **no key**,
   so the defective-red detector — the only thing separating an authored red from a case that
   asserts nothing — passes vacuously for it. Fix by making the artifact per task
   (`/tmp/adv-gate-{taskId}-{pre,post}.json`), scoping each agent's assertions to its own manifest
   rows, and adding the set-equality conjunct: every owned `advisory*.test.js` path must have a key,
   a missing key fails. That also retires the cross-wave retention rule — the 🟢 delta becomes two
   runs inside one agent, with no ordering assumption at all.

Then **F-02**, one clause: P-4's "exhaustive six-check ladder (`TSPEC:525-534`)" stops at check 5;
check 6 is line 535. Cite `TSPEC:528-535`.

Nothing else in the changed sections needs rework. §5.2's reducer, its `:5849` justification for the
targeted run, §8.2's registry generation rule, §9.1's re-parse claim, §9.2's conjunct (i) and §10's
1.4 row were each verified against code or execution, and each holds.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}

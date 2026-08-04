# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.4, 2026-08-03)
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** Local

## Grounding

Delta re-review. Base for the diff is `7a44317`, the commit v3 reviewed; the document has moved
through six authoring commits to HEAD `dc6997c` (v1.4). I read the diff, not the document, and
re-executed every mechanical claim the revision newly makes rather than trusting any of them.

What was re-run at HEAD, and what it showed:

- **The jest field transcription is exactly right, and I reproduced both of its verifications.**
  Running `npm test -- --json --outputFile=/tmp/adv-check.json 'guard.*\.test\.js'` from
  `pdlc/workflows/` on jest 29.7.0 (`npx jest --version` ⇒ 29.7.0; `package.json` pins `"jest":
  "^29.7.0"`) collected **exactly three suites** (`branchGuard`, `guardMatrix`, `mergeGuard` — jest
  applies the pattern case-insensitively, `Ran all test suites matching /guard.*\.test\.js/i`), as
  §5.2's parenthetical claims. `Object.keys(testResults[0])` is
  `assertionResults,endTime,message,name,startTime,status,summary` — character for character what
  §5.2 transcribes, and it carries **no** per-file counters. Running §5.2's `perFile` reducer verbatim
  over that document yields `guardMatrix.test.js ⇒ {"passed":75,"failed":0,"pending":70}` against a
  top-level `numPendingTests` of 70 — the exact figures §5.2 reports.
- **The re-parse claim holds after the fenced JS block was added.** `parsePlanTasks` ⇒ **36 tasks**,
  `parsePlanOwnership` ⇒ **36 ownership rows**, `validatePlanContract` ⇒ `{"ok":true}`,
  `computeTopologicalBatches` ⇒ **20 batches**, no cycle, `computeWaves` ⇒ **20 waves**:
  `[[A-01],[A-02],[A-03…A-07],[A-08…A-12],[A-13…A-15],[A-16,A-17,A-28],[A-18],[A-19],[A-20],[A-21],
  [A-22],[A-23,A-29],[A-24,A-30],[A-25,A-31],[A-26],[A-27],[A-32],[A-33],[A-34,A-35],[A-36]]` —
  identical to §5.2's transcription. §9.1's "the `||=` pipes are inside a code fence and change
  nothing the parsers see" is correct.
- **The three prompt-line citations are now right.** `orchestrate-dev.js:5849` is `Run only your
  task's targeted tests — do not run the full suite; the orchestrator runs it.`, `:5850` is `You own
  EXACTLY these files: …`, `:5851` is `Do NOT run git add or git commit …`. The v1.3 slip I noted in
  v3 is repaired in both places.
- **The wave runner's shape, which F-12 below turns on.** A wave's agents are dispatched
  **concurrently in one tree** — `await parallelFn(wave.map((task) => agentFn("se-implement", …)))`
  (`orchestrate-dev.js:8095-8102`) — and the only post-wave steps are script-owned: the gate
  (`:8112-8118`) and the per-task commits (`:8143-8159`). There is no post-wave *agent* hook.
- **P-4's re-attribution checks out.** `TSPEC:514-515` is the `@returns` type plus the reason enum
  and nothing more; the six-check ladder is §5.1's, at `TSPEC:525-535` (heading `### 5.1
  classifyEnvelope — one pure function, evaluated twice` at `TSPEC:507`); `TSPEC:1405` states the
  absorbing property in the same direction. "Derived, not quoted" is the honest description.

Only findings that survived that check appear below.

## Prior findings — disposition

| v3 ID | Severity | Status | Evidence in v1.4 |
|---|---|---|---|
| F-10 | Medium | **Resolved, and resolved better than I asked.** | §5.2's evidence run is now `npm test -- --json --outputFile=/tmp/adv-gate-w{n}.json 'advisory.*\.test\.js'`, explicitly labelled "**targeted**, not full-suite", with the reason cited to `orchestrate-dev.js:5849` — the line that reserves full-suite runs to the script. The narrowing is verified rather than assumed: I re-ran the analogous `'guard.*\.test\.js'` invocation at HEAD and it collected exactly the three matching suites. Beyond the fix I asked for, the revision discovered that the fields the v1.3 procedure read (`testFilePath`, `numPassingTests`, `numFailingTests`, `numPendingTests`) **do not exist per-file** in jest 29.7.0's `--json` document at all, and replaced them with one transcribed `perFile` reducer over `testResults[].name` + `assertionResults[].status`, quoted identically by the batch 3–5, 7–17 and 18 gate rows and by §9.1. I ran that reducer verbatim and got the document's own figures. The procedure went from *forbidden* to *permitted* and from *unimplementable* to *executed*. |
| F-11 | Low | **Resolved** | The blank line between the `1.1` and `1.2` rows is deleted (diff hunk at `@@ -904,9 +962,9 @@`), so all five version rows now sit under the one `\| Version \| Date \| Change \|` header. |
| Q-08 | — | **Answered, and the answer closed the loop** | §8.2 now states that the five per-seam gate cases are *generated* by iterating the in-file registry (`for (const [seam, block] of Object.entries(REGISTRY)) it(…)`), never hand-written, "so deleting a case means deleting its registry row, which the set-equality case then fails; and adding a sixth `ADVISORY_SEAMS` member with no registry row fails the same case. A registry row that survives while its case is deleted is therefore not expressible." That is exactly the both-directions answer the question asked for. |
| Q-09 | — | **Answered by removing the need for the number** | Because `ancestorTitles[0]` is the top-level `describe` title and §3 names every block for its green owner, `perFile` partitions by block; *k* is read from the block's own wave-(n−1) entry, so "no expected case count has to be recorded anywhere". A number nobody records is no longer a number anybody has to compare against — the better answer. |

## Findings

Both v3 findings are resolved. All three findings below are **new** and all three live inside the
sections this revision changed — §5.2's rewritten evidence procedure and §6.5's P-4 row.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-12 | Medium | Local | **The per-wave `/tmp/adv-gate-w{n}.json` snapshot is assigned to "the wave agent" (singular), but 8 of the 20 waves have 2–5 agents running concurrently in one tree, and no agent in a multi-task wave can observe the post-wave state the new assertions read.** §5.2 says "The wave agent runs, from `pdlc/workflows/`: `npm test -- --json --outputFile=/tmp/adv-gate-w{n}.json …`" and "Each wave writes its own `/tmp/adv-gate-w{n}.json`". But the runner dispatches every task in a wave **in parallel, in the shared tree** — `await parallelFn(wave.map((task) => agentFn("se-implement", …)))` (`orchestrate-dev.js:8095-8102`) — and the only post-wave steps are script-owned (gate `:8112-8118`, commits `:8143-8159`); there is no post-wave agent hook. I re-ran `computeWaves` at HEAD: the multi-task waves are **3** (`A-03…A-07`), **4** (`A-08…A-12`), **5** (`A-13…A-15`), **6** (`A-16, A-17, A-28`), **12** (`A-23, A-29`), **13** (`A-24, A-30`), **14** (`A-25, A-31`) and **19** (`A-34, A-35`). Three consequences, all inside newly written text: (a) *the producer is unnamed* — in a 5-agent wave, "the wave agent" does not identify anybody, so the snapshot may be written five times or not at all; (b) *the path is shared* — five concurrent writers of one `--outputFile` race, and the loser's partial document is indistinguishable from a complete one; (c) *the snapshot cannot be post-wave* — an agent that finishes first records a tree its wave-mates are still mutating, so its counters are not the wave's. That matters most exactly where the strongest new oracle lives: **batches 3–5 are three of the eight multi-task waves**, and their "the newly added files contribute zero passing and zero failing cases" check is the only thing that catches a *defective red*. It also weakens §9.2's new conjunct (ii), which now **gates** on comparing `/tmp/adv-gate-w{n-1}.json` with `/tmp/adv-gate-w{n}.json`. **Fix — lossless, because ownership is already disjoint within a wave:** have **each task** (not "the wave agent") run the targeted `--json` over the test files in *its own* §4 manifest row, as its last action, to a task-scoped path `/tmp/adv-gate-w{n}-{taskId}.json`, and report its own file's numbers in its own task summary. Every assertion in §5.2 survives unchanged: batch 3–5's zero-passing/zero-failing claim is per new file and is the union over the wave's summaries; batch 7–17's delta is per block of a file only its own task owns (`pathsCollide` guarantees no wave-mate touches it, so a mid-wave read of *that* file is already final); batch 18 and §9.1's whole-suite `pending === 0` sweep are single-task waves (18 is `A-33` alone) and can keep the unscoped form. Then state in §9.2 (ii) that the two documents being compared are the *block-owning task's* snapshots, not a wave-global pair. | REQ-ADV-04 AC-4.6; FSPEC §18.1; §5.2, §9.1, §9.2 |
| F-13 | Low | Local | **The "transcribed literal" paragraph mis-transcribes two of the four field names it says exist at the top level, and one of the four exists nowhere.** §5.2 reads "…and **no** `testFilePath`, `numPassingTests`, `numFailingTests` or `numPendingTests` — those four counters exist only at the top level of the document". Verified at HEAD against `/tmp/adv-check.json`: the top-level numeric keys are exactly `numFailedTestSuites, numFailedTests, numPassedTestSuites, numPassedTests, numPendingTestSuites, numPendingTests, numRuntimeErrorTestSuites, numTodoTests, numTotalTestSuites, numTotalTests`. So `numPendingTests` is there, but the top-level spellings are `numPassedTests` / `numFailedTests` (**not** `numPassingTests` / `numFailingTests`), and `testFilePath` does not appear at any level of the `--json` document. Nothing downstream breaks — the reducer uses neither — but a paragraph that presents itself as a literal transcription is the one place an implementer will trust without re-checking, and §9.1's derived checkbox ("jest 29.7.0 emits no per-file `numPendingTests`") is correct only because of the per-file half. **Fix:** one clause — "…the aggregate counters that do exist are `numPassedTests` / `numFailedTests` / `numPendingTests`, at the top level only; `testFilePath` appears nowhere." | §5.2, §9.1 |
| F-14 | Low | Local | **P-4's derivation cites a ladder range that stops one row short of the check the argument needs.** §6.5's P-4 row argues the coherence conjunct follows from "§5.1's exhaustive six-check ladder (`TSPEC:525-534`), every branch of which maps onto one of the three enum reasons". The ladder's six rows are at `TSPEC:530-535`; `:535` is check 6 (`X-c / membership`), so the cited range excludes one of the six checks the word "exhaustive" is doing the work for. **Fix:** cite `TSPEC:525-535`. (The substance is sound — I read all six rows and each maps onto one of `prohibited-action` / `revert-on-test-touch` / `out-of-envelope`, so no path returns `inside:false` with `reason:null`. This is a citation range, not the argument.) | §6.5 |

## Questions

| ID | Question |
|----|---------|
| Q-10 | §5.2's retention rule keeps the previous wave's `/tmp/adv-gate-w{n}.json` so a delta is a comparison of two recorded documents. Waves 3–6 land in batch order but batch 6 is the last wave that adds new skipped blocks (A-16), so from batch 7 onward the block population is closed and "every other block in the file is unchanged in all three counters" is a clean invariant. Is that reasoning something the PLAN wants to state? It is the premise that makes batch 7–17's *and by no more* half falsifiable, and today a reviewer has to re-derive it from §3's task ordering. One clause in the batch 7–17 row ("no 🔴 task runs after batch 6, so no new block can appear between two snapshots") would make the conjunct self-evidently checkable. |
| Q-11 | §9.2 (i) recomputes red evidence as "`git show {commit}^:{testFile}` contains the block **with** `.skip` and `git show {commit}:{testFile}` contains it **without**". Within a wave the script commits one task at a time (`:8143-8159`), so a task's commit parent is a wave-mate's commit — which is fine here, since `pathsCollide` guarantees no wave-mate touched that test file. Worth one parenthetical? The rule as written is correct for exactly that reason, and a reviewer applying it to a two-task wave (12, 13, 14) will otherwise wonder whether `{commit}^` is the right baseline. |

## Positive Observations

- **The revision found a defect underneath the one I reported, and fixed the deeper one.** F-10 said
  the `--json` run was forbidden by the wave prompt. The author fixed that *and* discovered that the
  four fields the procedure read do not exist per-file in jest 29.7.0's `--json` document at all — so
  the v1.3 procedure was not merely instructed-against, it was unimplementable. Replacing it with one
  reducer over `testResults[].name` + `assertionResults[].status`, verified against a shipped
  skip-carrying suite, is the difference between a plan that reads plausible and a plan that runs. I
  executed both verifications independently and got the document's own numbers to the digit.
- **`ancestorTitles[0]` was recognised as a partition, not just a label.** The single most valuable
  line in this revision is the observation that because §3 names every `describe.skip` block for its
  green owner, bucketing by `ancestorTitles[0]` partitions each file **by un-skip block** — which
  simultaneously answers Q-09 (the expected case count is the block's own wave-(n−1) `pending`, so
  nothing has to be recorded), makes batch 7–17's *and by no more* conjunct mechanical, and gives
  §9.2's new conjunct (ii) something to compare. One existing naming convention was turned into a
  measuring instrument at zero cost.
- **§9.2's red-evidence row now gates on something a reviewer can recompute.** "The transcript is the
  readable half; this row gates on a second, mechanical conjunct" is the right diagnosis — a reviewer
  can tell that *some* text is present but not that it is a genuine transcript. Pinning the row to
  `.skip` present in the commit's parent and absent in the commit, plus `pending → passed` across two
  retained snapshots, with both failure directions named ("a task that un-skips nothing fails (i),
  and a case that was already passing fails (ii)"), converts an honour-system checkbox into a
  falsifiable one without discarding the human-readable half.
- **P-4's coherence conjunct was re-labelled rather than defended.** The easy response to "this isn't
  where TSPEC says that" is to find a nearby line and re-cite it. Instead the row now says plainly
  that the conjunct is **derived** — from the return type and enum at `TSPEC:514-515` plus §5.1's
  ladder — and shows the derivation. A property that declares which of its conjuncts are quoted and
  which are inferred is one a later reader can audit; F-14 is a range typo on top of a correct
  argument.
- **Q-08's answer closed the loop in the direction I could not see.** Stating that the five per-seam
  cases are *generated* by iterating the registry makes "a registry row that survives while its case
  is deleted" **not expressible** — a stronger guarantee than the set-equality check alone, and the
  precise both-directions completeness the review standard asks for.
- **The re-parse was re-run for the right reason.** §9.1 does not just repeat the numbers; it names
  *why* the numbers could have changed ("adds a fenced JS block to §5.2 — its `||=` pipes are inside
  a code fence") and then reports the re-execution. I re-ran it: 36 / 36 / `{"ok":true}` / 20 batches
  / 20 waves, wave-for-wave identical to §5.2. Re-verifying the parse gate after adding pipe
  characters to a document the parser reads line-wise is the kind of care that prevents a Phase P
  halt nobody would have predicted.

## Recommendation

_(pending)_

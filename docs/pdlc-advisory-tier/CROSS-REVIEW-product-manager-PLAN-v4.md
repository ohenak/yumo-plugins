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

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

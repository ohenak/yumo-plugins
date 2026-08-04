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

_(pending)_

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

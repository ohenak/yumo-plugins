# PLAN — pdlc-review-loop-hardening

**Version:** v1.0
**Scope:** Work breakdown for implementing TSPEC v1.5 (`pdlc-review-loop-hardening`) — task list, batch
assignment, file ownership, TDD order, traceability and halt conditions. This document specifies **when
and by whom** each change is built. It specifies **no behaviour**: every behavioural, structural and
algorithmic statement lives in REQ v1.6 / FSPEC v1.8 / TSPEC v1.5 and is cited here, never restated.

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **PLAN**` |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN[-v{N}].md` |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |

---

## 1. Overview

### 1.1 What is being built

Four harness defects (TSPEC §1.2 `H-1`…`H-4`) are fixed inside the existing `pdlc/workflows/` ES
modules. Five tracked paths change and nothing outside them does — TSPEC §1.3 owns the change surface.
No new package, no new dependency, no new source file under `pdlc/workflows/` (TSPEC §2.1, §2.2).

The work decomposes into **34 tasks across 16 batches**. The shape is unusual and the reason is
structural rather than stylistic: almost all of it lands in **one** physical file
(`pdlc/workflows/orchestrate-dev.js`), and every commit that touches a tracked workflow source must
also rebuild `pdlc/workflows/dist/` in the same commit (§3 below). Those two facts together mean the
**source lane is fully serialised** — one source-writing task per batch — while the test, fixture and
SKILL lanes fan out widely beside it. Batch 2 carries nine tasks; the source lane carries one.

### 1.2 How to read this document

**This PLAN cites; it does not restate.** Every task row names the TSPEC section that owns the thing
being built. If a task row and the TSPEC disagree, the TSPEC wins and the task row is the defect.

That rule is not stylistic either. This feature's own review history is the argument for it: every
residual defect across four consecutive rounds of TSPEC cross-review was a **consistency failure
between duplicated statements of a single rule** — one `ListFailure` contract stated in six places, one
read bound in three, one signature in three. A PLAN that re-describes `selectMode` or the digest
becomes the seventh copy and is wrong within a round. So a task row states only what the TSPEC does
not: *when* the work happens, *who* owns which file, *which test comes first*, and *what stops*.

Where a task row does carry a normative statement, it is a **process** statement (batch, owner, gate,
order) and the TSPEC is silent on it by design.

### 1.3 Test-name namespacing — mandatory

Every jest test this feature adds is named **`RLH-AT-{N}`**, never bare `AT-{N}` (TSPEC §8.3). The
collision is measured, not hypothetical: `pdlc/workflows/__tests__/documentOracles.test.js` at HEAD
carries `test("AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing", …)` from the
preceding feature, and this feature's AT-22 is a different assertion entirely. The TSPEC-local ATs
follow the same rule: `RLH-AT-01a`, `RLH-AT-13a`, `RLH-AT-43a`.

Throughout this document bare `AT-{N}` refers to the **FSPEC's** numbering (which is how the FSPEC
numbers them); the jest name is always the `RLH-` form.

## 2. Test baseline and the exit criterion

### 2.1 The measured baseline

**Re-measured for this PLAN**, at HEAD on `feat-pdlc-review-loop-hardening`, by
`cd pdlc/workflows && npm test`:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        179.175 s
```

The single failure is `__tests__/documentOracles.test.js`'s **intentional** red placeholder
`AT-22 [red-until-L-06]`, carried deliberately from the preceding feature. It is **not this feature's
test and must not be fixed, deleted or skipped.** This figure agrees with the TSPEC's own measurement
(§8.3, taken at `ef4705a`).

### 2.2 The exit criterion, stated once — every task cites this section

> **The gate is "no new failures against the §2.1 baseline", never "the suite is green."**
> A batch passes when `npm test` reports **1038 passing / 1 failing / 70 skipped or better**, the one
> failure is still `documentOracles.test.js` `AT-22 [red-until-L-06]` and no other, **plus** any
> `RLH-AT-*` test whose greening task (column `Greened by` in §4) has not yet run.
> A second unexplained failure, or a *different* single failure, is a regression.

The `Greened by` column makes the permitted-red set mechanically derivable at every batch: a red test
owned by this feature is permitted exactly until the batch of its greening task completes, and is a
regression from the batch after that onwards.

Two batches are **RED-terminal by construction** — batch 2 and batch 3, which write test files ahead
of their subjects. Their gate wording is therefore: *the new `RLH-AT-*` tests fail for the stated
reason (their subject does not exist yet) and every pre-existing test still passes.* No batch is gated
on absolute green.

### 2.3 The 179-second hazard — how to run the suite

The full suite takes **179 s**, which sits one second under the 180 s stall watchdog that produced
`H-3` in the first place. A `se-implement` agent that runs `npm test` in the foreground as its
inner-loop command will be killed mid-run, repeatedly, and will conclude the suite hangs.

Normative for every task in this PLAN:

- **Inner TDD loop:** run only the task's own file(s) —
  `cd pdlc/workflows && npx jest __tests__/scanLines.test.js`. Single files are seconds, not minutes.
- **Batch gate:** run the full suite **in the background** and read the output file, or with an
  explicit timeout above 300 s. Never in a blocking foreground call.
- Do **not** shorten the suite to fit the watchdog. Do not add `--silent`-driven partial runs to the
  gate. The gate is the whole suite against §2.2 or it is not the gate.

## 3. Generated-artifact discipline and why it serialises the source lane

### 3.1 The three tiers

| Tier | Paths | Rule |
|---|---|---|
| **Tracked source** | `pdlc/workflows/{orchestrate-dev,orchestrate-queue,runtime-adapter}.js`, `pdlc/workflows/build-runtime.mjs` | hand-edited; the single source of truth |
| **Tracked generated** | `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `…/orchestrate-queue.bundle.js`, `…/distribution-manifest.json` | **never hand-edited**; regenerated by `node pdlc/workflows/build-runtime.mjs` and committed **in the same commit** as the source change (TSPEC §7.3, `CLAUDE.md`, `DEC-DIST-01/02`) |
| **Untracked consumer copy** | `.claude/workflows/` | produced by `pdlc/hooks/scripts/sync-workflows.sh`; **never committed, never hand-edited**. No task in this PLAN commits it |

`build-runtime.mjs --check` exits non-zero when a `dist/` artifact is stale and
`__tests__/runtimeBundle.test.js` asserts freshness, so a source commit without a rebuild reds the
suite. That is the intended behaviour and it is not to be worked around.

### 3.2 The consequence: one source-writing task per batch

`pdlc/workflows/dist/` is a **shared physical write surface for every task that edits any tracked
workflow source**, because each such task must rebuild it. Batch-safety rule 2 (single writer per
physical file per batch) therefore applies to `dist/` and forces:

> **No two tasks in the same batch may edit any tracked source under `pdlc/workflows/`.**

This is why §4's source lane is a strict chain — `RLH-05 → 10 → 13 → 15 → 16 → 18 → 20 → 23 → 26 → 27
→ 30 → 32 → 33` — with one link per batch, and why several of its `Deps` edges exist **for
serialisation alone**. Those edges are marked `[dist]` in §4 so a reader does not mistake a
serialisation edge for a logical one. Removing a `[dist]` edge does not break a compile; it produces a
batch in which two agents rebuild `dist/` concurrently and one silently loses the other's bytes behind
a green suite — precisely the last-writer-wins race rule 2 exists to prevent.

The alternative — deferring the rebuild to one task at the end — was **rejected**: it violates
TSPEC §7.3's same-commit rule on every intermediate commit and leaves the branch shippable-looking
with a stale bundle at thirteen points in its history.

### 3.3 The four `build-runtime.mjs` edits, and their ordering

TSPEC §7.2 specifies four edits (edit 2 being two edits, 2a and 2b, to different literals). All four
are owned by **one task, `RLH-32`**, and land in one commit with one rebuild. They are not split:

- edit 2a and edit 2b touch **different** injection objects in `QUEUE_ENTRY` and TSPEC §7.2 states
  outright that conflating them "leaves the production path unwired behind a green suite". Two tasks
  editing the same literal region in the same file cannot be batched in parallel anyway, and splitting
  them across batches would ship an intermediate commit where `_recordHalt` is unwired on the queue
  path — the exact defect edit 2b exists to close.
- edit 4 (inserting `queueModule` into the dev bundle's `contents` array) carries the **ordering
  hazard** TSPEC §7.2 names: `devModule` must still precede `queueModule`, because `queueModule`'s
  `wrapModule` prelude is `const realMain = __dev.main;`. Verified at HEAD: the dev bundle's array is
  `[DEV_META, BANNER, adapter, devModule, DEV_ENTRY]` and the queue bundle's is
  `[QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY]`. Reversing produces a bundle
  that throws at load, which no unit test of a source module can see.
- edit 3 extends `wrapModule("__queue", …, ["main", "meta", "DEFAULT_QUEUE_PATH"])` with
  `rewriteStatus` and `updateQueueStatus`. Its precondition is that `orchestrate-queue.js` **exports**
  `rewriteStatus` — non-exported at HEAD (verified). That precondition is `RLH-20`, which is why
  `RLH-32` depends on it and cannot precede it.

Sequencing rule for `RLH-32`: make all four edits, then run `node pdlc/workflows/build-runtime.mjs`,
then `node pdlc/workflows/build-runtime.mjs --check`, then the batch gate. The bundle is never left
stale between the edits and the commit because there is only one commit.

### 3.4 The version bump

`pdlc/.claude-plugin/plugin.json`'s `version` is bumped by **`RLH-33`**, in its own batch **after**
`RLH-32`, and that task rebuilds `dist/` again. The ordering is not arbitrary:
`distribution-manifest.json` records the plugin version the bytes were built at (TSPEC §7.5), so a
bump without a subsequent rebuild produces a manifest that under-reports what changed — and a rebuild
before the bump records the old version.

## 4. Batches

**Status key:** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

**Column contract.** `Batch` re-derives mechanically as `max(batch of Deps) + 1`, sources being batch 1
— the dispatcher validates the column against the `Deps` edges and halts on mismatch. `Greened by`
names the task(s) after which a `RLH-AT-*` test in that file must pass; before that batch its failure
is permitted by §2.2, after it a failure is a regression. `[dist]` on a `Deps` edge marks a
serialisation edge required by §3.2, not a logical one. `[Fake first]` marks a test-double or
fixture-creation task, which precedes every production task for the same component.

Paths are repo-relative and subpackage-qualified. `__tests__/` and `dist/` are always under
`pdlc/workflows/`.

| # | Task | Test File | Source File | Batch | Deps | Greened by | Status |
|---|---|---|---|---|---|---|---|
| **RLH-01** | **Pre-flight gate.** Assert, at HEAD, every baseline fact this PLAN and the TSPEC depend on; promote any absent one to blocking work before batch 2 runs. Enumerated in §4.1. Asserts existence only, never the new shape a later task creates | — | — | 1 | — | — | ⬚ |
| **RLH-02** | `[Fake first]` **The one canonical seam-double module** (TSPEC §8.1, `DEC-ORACLE-03`): `fakeListFiles(files)`, `fakeFs(initialContents)`, `fakeGit(script)`, `recordingRecordHalt()`. Sole owner; every L2 test imports from here and no test file defines an ad-hoc seam object | `__tests__/helpers/seams.js` | — | 2 | RLH-01 | — | ⬚ |
| **RLH-03** | `[Fake first]` **RED `scanLines` suite + its three fenced-region fixtures.** Fixtures are byte-exact per TSPEC §8.2 — `quoted-verdict.md` pinned to the **nested** four-in-three form (a three-in-three fixture passes under the wrong implementation), `quoted-hash.md`, `unclosed-fence.md`. RLH-AT-65, RLH-AT-66, plus TSPEC §8.2's `scanLines` totality-and-partition property via `driftGenerators` | `__tests__/scanLines.test.js`, `__tests__/fixtures/cross-reviews/{quoted-verdict,quoted-hash,unclosed-fence}.md` | — | 2 | RLH-01 | RLH-05 | ⬚ |
| **RLH-04** | **RED SKILL-amendment assertions.** Extend the existing suite with one assertion per row of TSPEC §7.4 (nine files). Verification method per §10 of this PLAN | `__tests__/skillFiles.test.js` | — | 2 | RLH-01 | RLH-07, RLH-08, RLH-09 | ⬚ |
| **RLH-06** | `[Fake first]` **RED approval-hash / digest suite + known-answer vectors.** Vectors per TSPEC §8.2: empty string, ASCII, multi-byte UTF-8, surrogate-pair emoji, each with an externally computed 64-hex digest — the last two are the only falsifier of a wrong `utf8Bytes`. Covers AT-12…AT-18 (incl. the L2 append cases) and the `canonicaliseForDigest` idempotence + `sha256Hex` determinism properties | `__tests__/approvalHash.test.js`, `__tests__/fixtures/digest-vectors.js` | — | 2 | RLH-01 | RLH-10, RLH-26 | ⬚ |
| **RLH-11** | **RED round-derivation suite.** AT-01…AT-07, AT-63, plus the `parseReviewFilename` round-trip and `deriveRoundWindow` window-invariant properties of TSPEC §8.2 — the **restated** forms (partition stated over `parseReviewFilename`'s three-way split, not over `deriveRoundWindow`'s return; the weaker v1.1 form is false on a correct implementation) | `__tests__/roundDerivation.test.js` | — | 2 | RLH-01 | RLH-13, RLH-26 | ⬚ |
| **RLH-14** | **RED force-phases suite.** AT-29 (bad-token rejection, message ending `Valid: R, F, T, P, D, PR, all.`), AT-28 (force overrides approval only), **RLH-AT-01a** (a forced phase on a branch carrying `-v1` writes `-v2` next), plus the `parseForcePhases` catalogue-closure property | `__tests__/forcePhases.test.js` | — | 2 | RLH-01 | RLH-15, RLH-26 | ⬚ |
| **RLH-17** | **RED composition-root wiring update.** Extend for the six new `main()` parameters (TSPEC §3.1) and, at L3, the derived-seam-set half of AT-64 that belongs to `main()`'s parameter list. **May not inject anything** (TSPEC §8.4) | `__tests__/pipelineWiring.test.js` | — | 2 | RLH-01 | RLH-18, RLH-32 | ⬚ |
| **RLH-29** | **RED phase-suite updates** for `buildFinalReport`'s widened field list (TSPEC §8.3's closing paragraph). Behaviour unaffected; the four files are updated together because they share one cause | `__tests__/{dodPhase,shipPhase,implPhase,harvestPhase}.test.js` | — | 2 | RLH-01 | RLH-30 | ⬚ |
| **RLH-31** | **RED bundle-guard extension.** RLH-AT-19 (the two anchored regexes `/\bprocess\s*\./` and `/\bfetch\s*\(/`, **not** the bare-identifier forms, plus the await-discipline scan over source), RLH-AT-20 (freshness — already present), RLH-AT-64 (derived seam set, wired-or-exempt with E-1/E-2/E-3 and both anti-rot clauses). Contract in TSPEC §8.5 verbatim; §9 of this PLAN states the traps | `__tests__/runtimeBundle.test.js` | — | 2 | RLH-01 | RLH-32, RLH-33 | ⬚ |
| **RLH-05** | **GREEN constants, the four closed catalogues, and `scanLines`.** The constants block per TSPEC §4.8 (placement: immediately after `const MODEL_DEFAULT = "opus";`, module-level, unexported); the four frozen arrays per §4.1; `scanLines` per §5.0 | `__tests__/scanLines.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 3 | RLH-01, RLH-03 | — | ⬚ |
| **RLH-07** | **Amend the three review SKILLs** — `## Verdict` as the file's last section in TSPEC §4.4's exact grammar (FSPEC §6.5) | `__tests__/skillFiles.test.js` | `pdlc/skills/{se,pm,te}-review/SKILL.md` | 3 | RLH-04 | — | ⬚ |
| **RLH-08** | **Amend the three author SKILLs** — `REVISION-COMPLETE: yes\|no` as the response's **last line**, and the pacing contract (FSPEC §8.4, TSPEC §7.4). §10 states the drift risk and its mitigation | `__tests__/skillFiles.test.js` | `pdlc/skills/{se,pm,te}-author/SKILL.md` | 3 | RLH-04 | — | ⬚ |
| **RLH-09** | **Amend the three orchestration/harvest SKILLs** — `harvest-learnings` emits `## 6. Approval Record` per TSPEC §4.4 copying anchor lines **verbatim, never recomputing** (FSPEC §9.4); `orchestrate-dev` documents the POSTMORTEM lifecycle and the `RESOLVED:` marker (AC-5.3); `orchestrate-queue` documents that a `halted` row is committed (AC-5.4). Must keep `orchestrateDevSkill.test.js` green | `__tests__/skillFiles.test.js` | `pdlc/skills/{harvest-learnings,orchestrate-dev,orchestrate-queue}/SKILL.md` | 3 | RLH-04 | — | ⬚ |
| **RLH-19** | **RED queue-module suite extension.** `updateQueueStatus`'s `{ markdown, matched }` return (TSPEC §4.6) at every existing call site, `rewriteStatus` exported and committing (§3.6, §6.5), AT-30…AT-34's queue half | `__tests__/orchestrateQueue.test.js` | — | 3 | RLH-01, RLH-02 | RLH-20 | ⬚ |
| **RLH-21** | **RED pacing-wrapper suite.** AT-35…AT-54, AT-58, AT-61, and **RLH-AT-43a** (S-INV freshness, **both** refresh outcomes — (a) round 2's optimizer is `mode: "revision"` with an `EpisodeKey` differing from round 1's, (b) a mid-loop `unreadable` **halts** with `Cannot enumerate docs/{feature}: unreadable` and dispatches no episode). Both fixtures sit on the same clean branch where `docs/{feature}/` **exists and is empty of cross-reviews** — TSPEC §6.2 row 1's successful empty listing, **not** `dir_missing` | `__tests__/pacingWrapper.test.js` | — | 3 | RLH-02 | RLH-23 | ⬚ |
| **RLH-22** | **RED review-loop suite update.** The three new parameters (`docType`, `_listFiles`, `_readFile`) and **no seed maps**; `iteration` supplied at every call site; `if (iteration > endIndex)`; the return shape's `postmortemWritten` and `trailerReason` (TSPEC §3.9, §5.6.1) | `__tests__/reviewLoop.test.js` | — | 3 | RLH-02 | RLH-23, RLH-26, RLH-27 | ⬚ |
| **RLH-24** | **RED approval-search suite.** AT-08…AT-11, AT-56, AT-57 per TSPEC §5.4 — same-round dual approval, no cross-round combination, absent role file is not approving, duplicated verdict, partial/disagreeing anchor pair, higher non-approving round, exclusive tier selection | `__tests__/approvalSearch.test.js` | — | 3 | RLH-02 | RLH-26 | ⬚ |
| **RLH-25** | **RED halt-and-queue suite.** AT-21…AT-27, AT-30…AT-34, and **RLH-AT-13a** (G-INV totality: each of the four exits that lead to running the phase refuses on an unresolved POSTMORTEM and reproduces the Recommendation; the `FRESH` exit does **not** refuse but names it in the skip notice). FSPEC §12.4 example A and AC-2.3b example B are driven **verbatim as fixtures** | `__tests__/haltAndQueue.test.js` | — | 3 | RLH-02 | RLH-20, RLH-26, RLH-27 | ⬚ |
| **RLH-28** | **RED report-template suite.** AT-55 — no un-substituted `{…}` template reaches any operator-facing report string (TSPEC §6.3's general rule) | `__tests__/reportTemplates.test.js` | — | 3 | RLH-02 | RLH-30 | ⬚ |
| **RLH-10** | **GREEN the digest family** — `canonicaliseForDigest`, `utf8Bytes`, `sha256Hex`, `approvalHashOf` per TSPEC §5.3. Canonicalisation applied **inside** `sha256Hex`, never by a caller. **Not a seam**, takes no injection (§3.7); no `crypto`, no `TextEncoder`, no `BigInt` | `__tests__/approvalHash.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 4 | RLH-05 `[dist]`, RLH-06 | — | ⬚ |
| **RLH-12** | **RED structural-completeness suite + heading fixtures.** AT-59, AT-60, AT-62 and the `isComplete` **exact-required-set** property (falsifiable in both directions; the v1.1 monotonicity form was satisfied by a matcher recognising no heading at all). Fixtures are copied **verbatim from the SKILL templates** — this is the standing mitigation for TSPEC §10.2 Q-09's drift risk, so a template change reds the suite rather than a run. Depends on RLH-08/09 so the copy is taken from the final text | `__tests__/completeness.test.js`, `__tests__/fixtures/completeness/` | — | 4 | RLH-01, RLH-08, RLH-09 | RLH-16, RLH-23 | ⬚ |
| **RLH-13** | **GREEN the filename grammar and round window** — `parseReviewFilename` (G-1…G-4, role alternation derived from `reviewerRoleSlug`'s `MAP`), `deriveRoundWindow`, and the reverse accessor `reviewerSkillForSlug` over the same `MAP`, per TSPEC §5.2 and §3.9 | `__tests__/roundDerivation.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 5 | RLH-10 `[dist]`, RLH-11 | — | ⬚ |
| **RLH-15** | **GREEN the five record parsers** — `parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker`, `extractRecommendation`, `parseForcePhases`, per TSPEC §3.7, §4.3, §5.7, §5.8. All total, all over `scanLines`, all synchronous | `__tests__/{approvalHash,forcePhases}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 6 | RLH-13 `[dist]`, RLH-14, RLH-06 | — | ⬚ |
| **RLH-16** | **GREEN the two judgements** — `isStale` per TSPEC §5.5 (read at comparison time, one hash-equality test, never reads `REVIEWED-COMMIT`) and `isComplete` per §5.9 (four wrapped classes, six spec-class heading tables, order not required, the accepted shallowness of T-Q-04) | `__tests__/{approvalHash,completeness}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 7 | RLH-15 `[dist]`, RLH-12, RLH-10 | — | ⬚ |
| **RLH-18** | **GREEN the six seams and their Node defaults.** Six new parameters on `main()`'s destructured list (TSPEC §3.1 — nothing existing renamed or reordered), `meta.inputs` gains the `forcePhases` entry, and `defaultListFiles` / `defaultWriteFile` / `defaultAppendFile` / `defaultGit` / `defaultRecordHalt` per §3.2–§3.5. `_appendFile` is **append-shaped, never a whole-file rewrite**. `DEV_META` is **not** edited (§3.1, Q-07) | `__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 8 | RLH-16 `[dist]`, RLH-17, RLH-02 | — | ⬚ |
| **RLH-20** | **GREEN the queue module.** The four changes of TSPEC §3.6 — `updateQueueStatus`'s `{ markdown, matched }` (§4.6) with **every** existing call site updated to destructure, `rewriteStatus` **exported** (load-bearing for §7.2 edit 3, not cosmetic) with a `_git` parameter and §6.5's two-invocation commit, `main()`'s `_git`, and `runPicked`'s three status writes routed through the committing `rewriteStatus` | `__tests__/{orchestrateQueue,haltAndQueue}.test.js` | `pdlc/workflows/orchestrate-queue.js`, `dist/` | 9 | RLH-18 `[dist]`, RLH-19 | — | ⬚ |
| **RLH-23** | **GREEN the episode machinery** — `selectMode` (§5.6.1, the ONLY producer of `EpisodeKey.mode`), `isTerminal` (§5.6.2, exactly two members), `dispatchAndVerify` (§3.8, §5.6.2's terminal-first-then-progress loop), the two prompt kinds (§5.6.3), and `reviewLoop`'s `refreshReviewState` helper called at **every** wrapped episode entry — never a pre-loop snapshot (S-INV). `reviewLoop` gains `docType`, `_listFiles`, `_readFile` and **no seed maps** (§3.9) | `__tests__/{pacingWrapper,reviewLoop,completeness}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 10 | RLH-20 `[dist]`, RLH-21, RLH-22, RLH-13, RLH-16 | — | ⬚ |
| **RLH-26** | **GREEN the phase gate.** TSPEC §2.5 steps 1–4 and step G in one task because they are one control-flow shape and **G-INV is an invariant over paths, not a step number**: the approval search (§5.4), the staleness call (§5.5), `checkPostmortem` (§5.8) placed at the single point every phase-running exit converges on, the anchor capture/append ordering t0…t6 with the pre-count **count-and-compare** (§5.3), the `forcePhases` gate (§5.7), and **all seven `reviewLoop` call sites** passing the branch-derived `startIndex` — including the forced path | `__tests__/{approvalSearch,approvalHash,forcePhases,haltAndQueue,roundDerivation,reviewLoop}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 11 | RLH-23 `[dist]`, RLH-24, RLH-25, RLH-14, RLH-15, RLH-16, RLH-10, RLH-11 | — | ⬚ |
| **RLH-27** | **GREEN the terminal exit.** `checkConverged` gains `feature`, its `postmortemPath` template is **corrected and read**, and the exit sequence of §6.3 runs in order — dispatch, `await _checkFile` **confirmation** (never the agent's reply), `await _recordHalt`, throw one of §6.4's **two conditional** shapes. Plus §7.1's five `MAX_REVIEW_ROUNDS` edits, all five anchored by enclosing symbol + distinctive literal, and `reviewLoop`'s `postmortemWritten` | `__tests__/{haltAndQueue,reviewLoop}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 12 | RLH-26 `[dist]`, RLH-25, RLH-05 | — | ⬚ |
| **RLH-30** | **GREEN the report surface.** `buildFinalReport`'s four new fields and four new lines per TSPEC §4.7 — including the skip notice's **specified** detail string with its conditional bracketed clause (absent, not empty, when the POSTMORTEM state is clean) — and the `{DOC-TYPE}` substitution in `reviewerPrompt` / `optimizerPrompt` (§3.9), which is the same "no un-substituted template" rule as §6.3 | `__tests__/{reportTemplates,dodPhase,shipPhase,implPhase,harvestPhase}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 13 | RLH-27 `[dist]`, RLH-28, RLH-29 | — | ⬚ |
| **RLH-32** | **GREEN the adapter and the build.** `rtListFiles`, `rtAppendFile`, `rtGit` and the four-entry extension of `rtDevInjections` (TSPEC §3.10 — `_writeFile: rtWriteFile` **existed but was never wired**; `_recordHalt` is deliberately **not** here); then all four `build-runtime.mjs` edits of §7.2 with §3.3 of this PLAN's ordering. One commit, one rebuild | `__tests__/{runtimeBundle,pipelineWiring}.test.js` | `pdlc/workflows/runtime-adapter.js`, `pdlc/workflows/build-runtime.mjs`, `dist/` | 14 | RLH-30 `[dist]`, RLH-31, RLH-18, RLH-20 | — | ⬚ |
| **RLH-33** | **Version bump and final rebuild.** Bump `version` per TSPEC §7.5, rebuild, confirm `distribution-manifest.json` records the new version and `build-runtime.mjs --check` exits 0 | `__tests__/runtimeBundle.test.js` | `pdlc/.claude-plugin/plugin.json`, `dist/` | 15 | RLH-32 `[dist]` | — | ⬚ |
| **RLH-34** | **Final verification.** Run §12's checklist end to end. Writes no source and no test; a failure here re-opens the owning task rather than being patched locally | — | — | 16 | RLH-33, and every task above | — | ⬚ |

### 4.1 What `RLH-01`, the pre-flight gate, asserts

Existence only — never the new shape a later task creates. Every row was verified while authoring this
PLAN and is expected to pass; the gate exists so that a drift between authoring and implementation
becomes blocking work in batch 1 instead of a confusing red in batch 9.

| Assertion | Verified value at authoring time |
|---|---|
| the §2.1 baseline reproduces, with the one red being `documentOracles.test.js` `AT-22 [red-until-L-06]` | 1038 / 1 / 70, 36 suites, 179 s |
| `__tests__/helpers/driftGenerators.js` exports `seeded` (returning `{ seed, int, pick, shuffle, bytes }`), `resolveSeed` (with the `PDLC_PROP_SEED` override), `shrink` | all present; `bytes(n)` returns a `Buffer` |
| that generator is already consumed by seven suites — so it is reused, **not** re-implemented, and no second generator library is written | `driftBackups`, `driftBaseline`, `driftFault`, `driftHook`, `driftOrdering`, `driftRepoRoot`, `queueDriftGate` |
| `main()` in `orchestrate-dev.js` carries sixteen `_`-prefixed parameters | sixteen, `_agent` … `_sleep` |
| `rtDevInjections` returns nine entries, and `rtWriteFile` **exists but is absent from them** | nine; `rtWriteFile` defined at `async function rtWriteFile(path, contents)` |
| `reviewLoop` has exactly seven call sites in `orchestrate-dev.js`, and `checkConverged` seven | seven each (`R`, `F`, `T`, `D`, `P`, `PR`, `CR`) |
| `reviewLoop`'s `iteration = 1` default and its `if (iteration > 5)` gate both exist | present |
| `checkConverged(loopResult, phaseId, phaseLabel, recordPhase)` takes no `feature` | confirmed |
| `wrapModule("__queue", …)`'s `exportedNames` is `["main", "meta", "DEFAULT_QUEUE_PATH"]`, and `rewriteStatus` is **not** exported from `orchestrate-queue.js` | confirmed |
| the **dev** bundle's `contents` array is `[DEV_META, BANNER, adapter, devModule, DEV_ENTRY]` — no `queueModule` | confirmed |
| `QUEUE_ENTRY` carries `_writeFile: rtWriteFile,` and `_runPipeline: ({ reqPath }) => __dev.main({ reqPath, ...__devInjections }),` — §7.2's edit-2a and edit-2b anchors | both present, distinct literals |
| each of §7.1's five distinctive literals occurs, and occurs **once** | five |
| `pdlc/workflows/dist/` holds exactly the three tracked artifacts | `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `distribution-manifest.json` |

### 4.2 Counts, width and the critical path

| Quantity | Value |
|---|---|
| Tasks | **34** |
| Batches | **16** |
| Widest batches | batch 2 — **nine** tasks (RLH-02, 03, 04, 06, 11, 14, 17, 29, 31) — and batch 3 — **nine** tasks (RLH-05, 07, 08, 09, 19, 21, 22, 24, 25). Every task in each is a distinct file; the only source-lane member of batch 3 is RLH-05 |
| Batches 4–16 | one to three tasks each, always exactly one source-lane task |
| **Critical path** | the source lane: **RLH-01 → 05 → 10 → 13 → 15 → 16 → 18 → 20 → 23 → 26 → 27 → 30 → 32 → 33 → 34** — fifteen links, one per batch, and it is the whole span of the schedule |

The critical path is the batch count. Nothing shortens it except merging source tasks, which trades
review granularity for wall time and is **not** recommended for `RLH-23`, `RLH-26` or `RLH-27` — those
three are where every one of this feature's four defects actually gets fixed, and they are the three
whose failure modes are invisible to the unit level.

`RLH-26` is the single heaviest task and the one most likely to need splitting in flight. If it must be
split, split it **along step boundaries of TSPEC §2.5** (steps 1–2 / steps 3–4 / step G + t0…t6), never
along file boundaries, and put each piece in its own batch — **and re-read G-INV first**, because the
one thing a split must not do is leave a path that reaches `reviewLoop` without passing step G.

## 5. File-ownership manifest

Every physical file this feature creates or modifies, with its owning task(s). Where a file has more
than one owner they are listed **in batch order** and no two share a batch — this table is the
mechanical audit of the single-writer-per-batch premise, and it is the only thing preventing a
last-writer-wins race that the green gate cannot detect.

### 5.1 Tracked source and generated

| File | Owner(s), in batch order | Batches |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | RLH-05, RLH-10, RLH-13, RLH-15, RLH-16, RLH-18, RLH-23, RLH-26, RLH-27, RLH-30 | 3, 4, 5, 6, 7, 8, 10, 11, 12, 13 |
| `pdlc/workflows/orchestrate-queue.js` | RLH-20 | 9 |
| `pdlc/workflows/runtime-adapter.js` | RLH-32 | 14 |
| `pdlc/workflows/build-runtime.mjs` | RLH-32 | 14 |
| `pdlc/workflows/dist/` (all three artifacts) | RLH-05, RLH-10, RLH-13, RLH-15, RLH-16, RLH-18, RLH-20, RLH-23, RLH-26, RLH-27, RLH-30, RLH-32, RLH-33 | 3–15, one per batch |
| `pdlc/.claude-plugin/plugin.json` | RLH-33 | 15 |

**`dist/` is the reason batches 3–15 each carry exactly one source-lane task.** Read the `dist/` row as
the constraint and the `orchestrate-dev.js` row as its largest consequence. See §3.2.

### 5.2 Test helpers and fixtures

| File | Owner | Batch |
|---|---|---|
| `pdlc/workflows/__tests__/helpers/seams.js` | RLH-02 | 2 |
| `pdlc/workflows/__tests__/fixtures/cross-reviews/{quoted-verdict,quoted-hash,unclosed-fence}.md` | RLH-03 | 2 |
| `pdlc/workflows/__tests__/fixtures/digest-vectors.js` | RLH-06 | 2 |
| `pdlc/workflows/__tests__/fixtures/completeness/` | RLH-12 | 4 |

`pdlc/workflows/__tests__/helpers/driftGenerators.js` is **read-only for this feature.** It is reused,
never modified and never duplicated (TSPEC §8.2, §9.4). No task owns it.

### 5.3 Test files — one owning task each

Every test file has **exactly one** owning task. A file is written whole and red by its owner, then
greened across one or more later source tasks; no test file is appended to by a second task. This is
stricter than the batch-safety rule requires and it removes the whole class of "two agents both added a
`describe` block" conflicts.

| File | Owner | Batch | New / extended |
|---|---|---|---|
| `__tests__/scanLines.test.js` | RLH-03 | 2 | new |
| `__tests__/skillFiles.test.js` | RLH-04 | 2 | extended |
| `__tests__/approvalHash.test.js` | RLH-06 | 2 | new |
| `__tests__/roundDerivation.test.js` | RLH-11 | 2 | new |
| `__tests__/forcePhases.test.js` | RLH-14 | 2 | new |
| `__tests__/pipelineWiring.test.js` | RLH-17 | 2 | extended |
| `__tests__/dodPhase.test.js`, `shipPhase.test.js`, `implPhase.test.js`, `harvestPhase.test.js` | RLH-29 | 2 | extended |
| `__tests__/runtimeBundle.test.js` | RLH-31 | 2 | extended |
| `__tests__/orchestrateQueue.test.js` | RLH-19 | 3 | extended |
| `__tests__/pacingWrapper.test.js` | RLH-21 | 3 | new |
| `__tests__/reviewLoop.test.js` | RLH-22 | 3 | extended |
| `__tests__/approvalSearch.test.js` | RLH-24 | 3 | new |
| `__tests__/haltAndQueue.test.js` | RLH-25 | 3 | new |
| `__tests__/reportTemplates.test.js` | RLH-28 | 3 | new |
| `__tests__/completeness.test.js` | RLH-12 | 4 | new |

`__tests__/documentOracles.test.js` is **not owned by any task and is not to be touched.** It carries
another feature's deliberate red (§2.1). `__tests__/parseVerdict.test.js` needs no change — TSPEC §3.9
keeps `parseVerdict` unchanged, and its new file-text callers are covered in `approvalSearch.test.js`.

### 5.4 SKILL prompts

| File(s) | Owner | Batch |
|---|---|---|
| `pdlc/skills/{se,pm,te}-review/SKILL.md` | RLH-07 | 3 |
| `pdlc/skills/{se,pm,te}-author/SKILL.md` | RLH-08 | 3 |
| `pdlc/skills/{harvest-learnings,orchestrate-dev,orchestrate-queue}/SKILL.md` | RLH-09 | 3 |

Three tasks, nine files, no overlap — which is why they run in parallel in one batch. All three are
verified through the single test file `skillFiles.test.js`, owned by RLH-04 one batch earlier.

### 5.5 Never written by any task

`.claude/workflows/` — the untracked consumer copy (§3.1). No task copies into it and no task commits
it. Operators refresh it with `pdlc/hooks/scripts/sync-workflows.sh`; `RLH-34` only *checks* it.

## 6. Dependencies

### 6.1 The three kinds of edge in §4's `Deps` column

| Kind | Meaning | How to spot it |
|---|---|---|
| **Red-before-green** | the green task cannot start until the test that specifies it exists and fails | the dep is a `RED …` task and the dependent's `Test File` includes it |
| **Logical** | the dependent calls, extends or is composed from the dep's output | neither of the other two |
| **Serialisation `[dist]`** | no code dependency; the edge exists solely to keep two `dist/`-rebuilding tasks out of one batch (§3.2) | marked `[dist]` |

A `[dist]` edge is still a **real** dispatcher edge and must not be deleted. It is labelled so a
reviewer can tell that reordering it changes only wall-clock, whereas reordering a logical edge changes
correctness.

### 6.2 Logical dependency chains worth naming

Four chains carry the feature's actual coupling, and the TSPEC states in §1.2 that the four defects are
not independent. Each chain below is that statement expressed as task order:

1. **H-1 supplies H-4's key.** `RLH-13` (`deriveRoundWindow` → `startIndex`) must precede `RLH-26` (the
   approval search, whose candidate is `startIndex - 1`). An approval search built against a
   `startIndex` that is always 1 searches round 0 forever and never grants a skip — a silent, green
   no-op.
2. **The digest precedes staleness precedes the skip.** `RLH-10` → `RLH-16` (`isStale`) → `RLH-26`.
   `isStale` is one hash-equality test and nothing else (§5.5); it cannot be stubbed with a comparison
   the digest does not implement.
3. **`selectMode` precedes the gate, not the reverse.** `RLH-23` → `RLH-26`. `selectMode` is pure and
   its freshness is `refreshReviewState`'s obligation inside `reviewLoop`; the phase gate's own
   `present` / `reviewFiles` are consumed at phase entry by §5.4 and are **not** threaded into the loop.
   Building the gate first invites exactly the pre-loop-snapshot defect S-INV exists to forbid.
4. **The queue export precedes the build edit.** `RLH-20` → `RLH-32`. `build-runtime.mjs` edit 3 cannot
   publish `rewriteStatus` on `__queue` until `orchestrate-queue.js` exports it —
   `stripModuleSyntax` rewrites `export function` to `function` and `wrapModule` re-publishes only the
   names in its `exportedNames` list, so the bundle cannot publish what the module does not export.

### 6.3 Integration points with existing code

Everything this feature integrates with, and the shipped precedent it reuses rather than reinvents
(TSPEC §1.5, §9.4). A task that reinvents one of these is a review-blocking finding.

| Integration point | Existing symbol / file | Reused by | Task |
|---|---|---|---|
| dependency injection for capabilities | `main()`'s existing sixteen-parameter destructured list | the six new seams extend it **in place**; no new injection mechanism | RLH-18 |
| verdict grammar and its closed catalogue | `parseVerdict` + `VALID_VERDICTS` + its reverse-scan + `malformed: true` fallback | the persisted verdict record, **verbatim and unchanged** | RLH-26 |
| pass/fail semantics | `isPass` | the approval search's unanimity check | RLH-26 |
| role-slug catalogue | `reviewerRoleSlug`'s `MAP` | the filename grammar's role alternation **and** the new reverse accessor, so the two cannot desynchronise | RLH-13 |
| Node-default IO with an injectable module | `checkFileNonEmpty(path, { fsMod = fs })` | `defaultListFiles` / `defaultWriteFile` / `defaultAppendFile`, same `{ fsMod = fs }` idiom | RLH-18 |
| `child_process` injection | `mergeWorktree(…, { execFn })` | `defaultGit(argv, { execFn })` | RLH-18 |
| adapter agent-relay, JSON return | `rtMergeWorktree` | `rtListFiles`, `rtGit` | RLH-32 |
| adapter agent-relay, constrained one-word output | `rtCheckFile` | `rtListFiles`'s prompt discipline | RLH-32 |
| the skip marker in the phase table | the existing `"⏭"` status | the approval skip's phase-table row | RLH-30 |
| seeded property generation | `__tests__/helpers/driftGenerators.js` — `seeded`, `resolveSeed`, `shrink` | all seven §8.2 properties. Dependency-free, already consumed by seven suites | RLH-03, 06, 11, 12, 14 |
| bundle staleness and structural guards | `build-runtime.mjs --check`, `runtimeBundle.test.js` | extended, not replaced | RLH-31, RLH-32 |
| SKILL-file assertions | `__tests__/skillFiles.test.js` | the natural home for §7.4's amendment checks | RLH-04 |

**Explicitly not reused**, each with its reason at the point of decision — a task that reaches for one
of these has misread the TSPEC:

| Not reused | Why | TSPEC |
|---|---|---|
| `listAllFiles(root)` / `WALK_SKIP_DIRS` from `document-oracles.mjs` | a Node-only recursive walker with no seam and a skip-list tuned for a different job; the two listing paths instead share **one error contract**, the `ListFailure` catalogue | §1.5, FSPEC §3.4 |
| `recoverVerdict({ reviewer, rawResult, _agent })` | an agent adjudicating whether a phase may be skipped breaches C-5 and fails **open** — a hallucinated "Approved" silently discards a phase | §2.6 |
| `_mergeWorktree` as a general git transport | a **task** seam returning a domain record, versus `_git`'s **transport** seam; folding them would move conflict parsing out of the adapter and give callers a second, looser way to invoke a merge | §3.4 |
| a cache over `_listFiles` | the thing to invalidate is precisely the just-written review files S-INV exists to observe | §2.6 |
| a second property-generator library | `driftGenerators.js` ships and is dependency-free | §8.2 |

## 7. Traceability — task → acceptance tests

TSPEC §8.3 owns the **AT → jest file** map; this table carries that map into the tasks rather than
re-deriving it, and adds the one thing §8.3 cannot know: which task turns each test green.

The jest name for every id below is the `RLH-` form (§1.3).

| Task | Acceptance tests it must satisfy | Level | Owning test file |
|---|---|---|---|
| RLH-03 | AT-65, AT-66; property: `scanLines` totality-and-partition | L1 | `scanLines.test.js` |
| RLH-05 | AT-65, AT-66 go green | L1 | `scanLines.test.js` |
| RLH-06 | AT-12 … AT-18; properties: `canonicaliseForDigest` idempotence, `sha256Hex` determinism-and-totality | L1 + L2 | `approvalHash.test.js` |
| RLH-10 | AT-12, AT-13, AT-14, AT-17 go green (digest usability, one digest function, canonicalisation inside, rebase invariance) | L1 | `approvalHash.test.js` |
| RLH-11 | AT-01 … AT-07, AT-63; properties: `parseReviewFilename` round-trip, `deriveRoundWindow` window-invariant | L1 | `roundDerivation.test.js` |
| RLH-13 | AT-01 … AT-06, AT-63 go green | L1 | `roundDerivation.test.js` |
| RLH-14 | AT-28, AT-29, **AT-01a**; property: `parseForcePhases` catalogue-closure | L1 + L2 | `forcePhases.test.js` |
| RLH-15 | AT-29 goes green | L1 | `forcePhases.test.js` |
| RLH-12 | AT-59, AT-60, AT-62; property: `isComplete` exact-required-set | L1 + L2 | `completeness.test.js` |
| RLH-16 | AT-60, AT-62 go green; AT-15, AT-16, AT-18's staleness half | L1 | `completeness.test.js`, `approvalHash.test.js` |
| RLH-17 | AT-64's `main()`-parameter-list half | L3 | `pipelineWiring.test.js` |
| RLH-18 | AT-64's derived seam set includes the six new names | L3 | `pipelineWiring.test.js` |
| RLH-19 | AT-30 … AT-34 (queue half) | L1 + L2 | `orchestrateQueue.test.js` |
| RLH-20 | AT-30 … AT-34 go green; AT-21's queue-row commit half | L2 | `orchestrateQueue.test.js`, `haltAndQueue.test.js` |
| RLH-21 | AT-35 … AT-54, AT-58, AT-61, **AT-43a** | L2 | `pacingWrapper.test.js` |
| RLH-22 | the review-loop signature and return-shape assertions | L2 | `reviewLoop.test.js` |
| RLH-23 | AT-35 … AT-54, AT-58, AT-61, **AT-43a**, AT-59 all go green | L2 | `pacingWrapper.test.js`, `completeness.test.js` |
| RLH-24 | AT-08 … AT-11, AT-56, AT-57 | L2 | `approvalSearch.test.js` |
| RLH-25 | AT-21 … AT-27, AT-30 … AT-34, **AT-13a** | L2 | `haltAndQueue.test.js` |
| RLH-26 | AT-07, AT-08 … AT-11, AT-15, AT-16, AT-18, AT-28, **AT-01a**, **AT-13a**, AT-56, AT-57 all go green | L2 | `roundDerivation`, `approvalSearch`, `approvalHash`, `forcePhases`, `haltAndQueue` |
| RLH-27 | AT-21 … AT-27 go green | L2 | `haltAndQueue.test.js` |
| RLH-28 | AT-55 | L2 | `reportTemplates.test.js` |
| RLH-29 | the `buildFinalReport` field-list assertions in the four phase suites | L2 | `dodPhase`, `shipPhase`, `implPhase`, `harvestPhase` |
| RLH-30 | AT-55, AT-61's report echo go green | L2 | `reportTemplates.test.js`, `pacingWrapper.test.js` |
| RLH-31 | AT-19, AT-20, AT-64 | L3 | `runtimeBundle.test.js` |
| RLH-32 | AT-19, AT-64 go green; AT-20 stays green | L3 | `runtimeBundle.test.js` |
| RLH-33 | AT-20 stays green with the new manifest version | L3 | `runtimeBundle.test.js` |

### 7.1 The three TSPEC-local ATs — where they live and what reds them

These three exist because the invariants they guard are stated in the TSPEC rather than the FSPEC, and
each was added after a specific wrong implementation shipped through review. They are the tests most
worth reading the TSPEC prose for before writing.

| AT | Owner task | Greened by | The implementation it must red on |
|---|---|---|---|
| **RLH-AT-01a** | RLH-14 | RLH-26 | the "a force skips steps 2–4" reading — which restores H-1 on the forced path. TSPEC §5.7 skips steps **3–4** only; step 2's round derivation always runs |
| **RLH-AT-13a** | RLH-25 | RLH-26, RLH-27 | a gate placed ahead of step 1 (breaks FSPEC §12.4 example A) **or** reachable only from step 4 (breaks AC-2.3b example B). Both worked examples are driven verbatim as fixtures for exactly this reason |
| **RLH-AT-43a** | RLH-21 | RLH-23 | (a) any implementation deciding mode from a pre-loop snapshot — `present` stays empty for the phase, round 2's optimizer goes greenfield, needs no trailer, and carries round 1's key: **both** conjuncts red. (b) both prior wrong shapes: the one that read a kept `{}` as a successful observation, and the one that returned `present: null` and continued as a revision episode. Neither halts; the correct implementation halts |

### 7.2 Property tests — one per parameterisable component

TSPEC §8.2 owns the seven property statements and their generated-input descriptions. Two of them were
**restated** because the weaker forms were satisfied by the very defects they existed to catch — do not
reintroduce the weaker form:

- `deriveRoundWindow`'s partition is stated over **`parseReviewFilename`'s total three-way split**
  (`entries` / other-doc-type / `skipped`), not over `deriveRoundWindow`'s return. "`skipped` ∪ entries
  partitions the input" is **false** on a correct implementation, and the generator produces the
  falsifying case on nearly every run.
- `isComplete`'s property is the **exact required set, falsifiable in both directions**, not
  monotonicity. Monotonicity is satisfied by a matcher recognising no required heading at all.

Each property file declares its own literal seed and passes it through `resolveSeed`. Reproduction is
by **replay, not by index** — print the seed, reproduce case *n* by replaying draws 1…*n*. `shrink` is
for the failure report, never the pass path.

## 8. Traceability — FSPEC obligations and defects

### 8.1 FSPEC obligations → tasks

**TSPEC §9.1 already maps every FSPEC obligation to the TSPEC section that discharges it, and states
that nothing is deferred.** That table is not rebuilt here. This one adds only the missing column — the
task that builds it — and is read *through* §9.1, not instead of it.

`O-10` … `O-15` are absent because they were retracted during FSPEC review and are absent from the
FSPEC's own obligation map. Their absence is deliberate.

| O-row | TSPEC §9.1 discharges it in | Built by |
|---|---|---|
| O-1 | §3.2, §4.2, §6.2 rows 1–2 | RLH-18 (seam + Node default), RLH-32 (`rtListFiles`), RLH-05 (`LIST_FAILURES`), RLH-26 (dispositions at the phase gate), RLH-23 (dispositions at `refreshReviewState`) |
| O-2 | §5.2 | RLH-13 |
| O-3 | §5.8 | RLH-15 (`parseResolvedMarker`, `extractRecommendation`), RLH-26 (`checkPostmortem` at step G) |
| O-4 | §6.5 | RLH-20 |
| O-5 | §3.5 | RLH-18 (`defaultRecordHalt`), RLH-32 (both entrypoint suppliers) |
| O-6 | §5.6 | RLH-23 |
| O-7 | §5.9 | RLH-16 |
| O-8 | §5.5 | RLH-16, RLH-26 |
| O-9 | §3.1, §5.7 | RLH-18 (`main()` + `meta.inputs`), RLH-15 (`parseForcePhases`), RLH-26 (precedence), RLH-32 (build edit 1) |
| O-16 | §7.1, §7.2, §3.9 | RLH-27 (the five §7.1 edits), RLH-32 (the four §7.2 edits) |
| O-17 | §5.1, §5.3, §4.3 | RLH-10, RLH-15, RLH-26 |
| O-18 | §5.4 | RLH-26 |
| O-19 | §4.8, §5.6, §8.3 | RLH-05 (constant placement), RLH-21 (the behavioural oracles). `MAX_AUTHORING_WRITE_BYTES` has **no** oracle and no task pretends otherwise |
| O-20 | §5.6, §6.6 | RLH-08 (the per-section cadence stated to authors), RLH-23 (no git operation on the pacing path may discard uncommitted work), RLH-30 (the advisory proxy line) |
| O-21 | §4.4 | RLH-09 (harvest emits the section), RLH-26 (the script appends the anchors) |

### 8.2 Defect → mechanism → first falsifying test → task

Carried from TSPEC §9.2, with the task column added.

| Defect | Mechanism (TSPEC) | First falsifying test | Task that fixes it |
|---|---|---|---|
| **H-1** — round index always 1 | `deriveRoundWindow`'s `max(present) + 1` (§5.2), passed at all seven `reviewLoop` call sites **including the forced path** | AT-01; **AT-01a** for the forced path | RLH-13 (derivation) + RLH-26 (the seven call sites) |
| **H-2** — non-terminal exit, no POSTMORTEM | corrected `postmortemPath`, `_checkFile` confirmation, `_recordHalt`, the two conditional halt shapes (§6.3, §6.4); G-INV for the refusal half | AT-22; **AT-13a** for G-INV totality | RLH-27 (+ RLH-26 for the gate, RLH-20 for the row commit) |
| **H-3** — 180 s stall kills a monolithic write | `dispatchAndVerify`'s terminal-first-then-progress loop, per-episode counters and mode (S-INV), the resume prompt (§5.6) | AT-35; **AT-43a** for per-episode mode and budget | RLH-23 (+ RLH-08 for the authoring-side pacing contract) |
| **H-4** — approved phase re-run from scratch | the two-tier approval search + `isStale` (§5.4, §5.5) | AT-08 | RLH-26 (+ RLH-16, RLH-10) |

**H-2 and H-3 each need a prompt-side task as well as a code-side one**, and that is the one place this
feature's fix is not entirely mechanical: the persisted records of TSPEC §4.4 exist only if the agents
write them, so `RLH-07`/`RLH-08`/`RLH-09` are load-bearing for H-2 and H-4 respectively even though
they change no code. §10 is about how that half is verified.

## 9. The C-2 runtime gate

C-2 is **a build-time gate, not a review note.** TSPEC §1.4 owns the constraint and §8.5 owns the two
tests; this section states only which task makes them green and what an agent must not do to get there.

### 9.1 The constraint, as a checklist a task can run

A bundle may declare `export const meta` as its **first** statement and as a **pure literal**; it may
declare no other `export`; it has no `import`, no `import()`, no `process`, no `fs`, no `fetch`, no
`crypto`, no `TextEncoder`. Exactly **eleven** host globals exist: `agent`, `parallel`, `pipeline`,
`phase`, `log`, `workflow`, `args`, `budget`, `console`, `setTimeout`, `clearTimeout`.

Consequences every source task must honour, and none of them is negotiable at implementation time:

- a new capability arrives **only** as an injected seam on `main()`'s destructured options object, with
  a Node default so jest can exercise the module directly (RLH-18) and an adapter implementation for
  the bundle (RLH-32). There is no second way;
- `sha256Hex` is hand-rolled pure JS over a hand-rolled `utf8Bytes`, using `Math`, `>>>`, `|`, `^` and
  `Number` only — no `BigInt`, no `crypto`, no `TextEncoder` (RLH-10). It is **not** a seam and takes no
  injection;
- no new dependency can help. C-2 forbids `import` in the bundle, so a dependency could not reach the
  runtime at all.

### 9.2 Await discipline — the defect this repo repeats

> **Every call to an injected seam is `await`ed, without exception, including calls whose result is
> discarded.**

The adapter's seam implementations are `async`; the jest doubles are **synchronous**. A missing `await`
therefore **passes every L1 and L2 test and fails only in the runtime**. TSPEC §8.1 calls RLH-AT-19
"the only thing standing between this design and this repo's most repeated defect class".

`refreshReviewState` (RLH-23) is **new IO on a hot path** — one `_listFiles` plus up to two `_readFile`
at *every* episode entry — and is therefore the highest-risk site in the feature for this defect. Its
task's exit criterion includes RLH-AT-19 passing over the amended source.

Two call-site shapes RLH-AT-19 must classify explicitly, from TSPEC §8.5, **or the test reds on correct
source**:

| Shape | Ruling |
|---|---|
| **Alias** — the seam is destructured under a local name (`_readFile: readFileFn`) and called through it | resolve the alias from `main()`'s destructuring pattern and scan **the local name**. Scanning the `_` name alone finds zero call sites and **passes vacuously** — the worst possible failure for this test |
| **Returned promise** — the call is the whole body of an arrow function or the operand of a `return` | **exempt, and the wrapper's own name inherits the obligation.** The wrapper is then scanned as an alias |

And the trap RLH-AT-19 must **not** fall into: the assertion's name set is FSPEC AT-19's **closed
thirteen names** — `_agent`, `_readFile`, `_writeFile`, `_appendFile`, `_checkFile`, `_listFiles`,
`_git`, `_checkCi`, `_mergeWorktree`, `_recordHalt`, `_rebaseOntoDefault`, `_dodVerifyLoop`,
`_raisePrAndVerifyCi` — and **not** a set derived from `main()`'s parameter list. Derivation reds on
shipped, correct source: `_now` is a clock called synchronously at four sites in
`raisePrAndVerifyCi`, and `_phaseDodEnabled` / `_phasePubEnabled` are booleans never called.
The two guards answer different questions and **must not share a derivation** — AT-64 asks *is every
capability wired* (derived, so a new seam cannot be forgotten); AT-19 asks *is every asynchronous call
awaited* (a closed list, because membership is a design judgement).

**A test loosened ad hoc to go green is worse than none.** If RLH-AT-19 reds on source an agent
believes correct, that is a §11 halt condition, not an invitation to widen the regex.

### 9.3 RLH-AT-64 — wired or exempt

Asserted against the **production** composition root with **no injection whatsoever** (TSPEC §8.4: L3
may not inject anything). The seam set is **derived** from `main()`'s destructured parameter names
matching `/^_/`; each must be either *wired* or *exempt*, exemption being a **predicate over the
parameter's own declaration** (E-1 policy value, E-2 pass-through, E-3 agent-composite) and never a list
of names.

Three things about it that a task will get wrong if it has not read TSPEC §8.5:

1. **`_recordHalt` is wired, not exempt.** It is deliberately absent from `rtDevInjections` because its
   implementation differs by caller. It is satisfied by `QUEUE_ENTRY`'s `_runPipeline` closure
   (§7.2 edit 2b) and by `DEV_ENTRY`. If either is dropped, AT-64 reds — which is the whole point.
2. **The alias hop is load-bearing, and it is one hop.** `main()`'s only forward of `_now`/`_sleep` goes
   through the destructured local `raisePrAndVerifyCiFn`, not a module declaration, so without the hop
   both fall in no class and AT-64 reds on correct source. A *chain* is not authorised.
3. **Both anti-rot clauses are required.** A parameter classified exempt that is *also* wired is a
   failure; and evidence must resolve for all three forms, **E-2 included**. Dropping the second clause
   makes "declare a seam with no default and inject it nowhere" a silent pass.

Counts to expect after this feature: `main()` carries **twenty-one** `_`-prefixed parameters (sixteen
today plus five seams — `forcePhases` is data, not a seam, and carries no `_`), `rtDevInjections`
returns **thirteen** (nine today plus `_writeFile`, `_appendFile`, `_listFiles`, `_git`), and the same
three E-3 members remain exempt. RLH-01 records the before-figures so the after-figures are checkable
rather than asserted.

## 10. SKILL amendments and how each is verified

## 11. Halt conditions

## 12. Verification

## 13. Open Questions

## 14. Changelog

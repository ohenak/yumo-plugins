# PLAN — pdlc-review-loop-hardening

**Version:** v1.2
**Scope:** Work breakdown for implementing TSPEC v1.6 (`pdlc-review-loop-hardening`) — task list, batch
assignment, file ownership, TDD order, traceability and halt conditions. This document specifies **when
and by whom** each change is built. It specifies **no behaviour**: every behavioural, structural and
algorithmic statement lives in REQ v1.6 / FSPEC v1.8 / TSPEC v1.6 and is cited here, never restated. **One TSPEC amendment was
made in this round and only one** — v1.6's §8.5 ruling row (§14, `TE F-01`); it was forced by a
measurement, is owned by the TSPEC, and is cited from §9.2 rather than copied.

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

The work decomposes into **31 tasks across 13 batches**. The shape is unusual and the reason is
structural rather than stylistic: almost all of it lands in **one** physical file
(`pdlc/workflows/orchestrate-dev.js`), and every commit that touches a tracked workflow source must
also rebuild `pdlc/workflows/dist/` in the same commit (§3 below). Those two facts together mean the
**source lane is fully serialised** — one source-writing task per batch — while the test, fixture and
SKILL lanes fan out widely beside it. Batch 3 carries ten tasks; the source lane carries one.

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

**Re-measured for v1.1**, at HEAD on `feat-pdlc-review-loop-hardening`, by
`cd pdlc/workflows && { time npm test; }`:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        184.752 s
npm test  115.66s user 173.42s system 155% cpu 3:05.43 total
```

**The three counts are the baseline and they are stable**: `1038 passed / 1 failed / 70 skipped` over
36 suites reproduced identically in v1.0's measurement, the test-engineer's independent round-1 and
round-2 measurements, this one, and a fifth re-run while authoring v1.2 — **five for five, same three
counts, same single red.** They agree with the TSPEC's own measurement (§8.3, taken at `ef4705a`).

**The wall-clock figure is not stable and is not a gate** — five measurements of the same HEAD gave
179.175 s, 179.924 s, 184.752 s, 181.681 s and 181.336 s of jest-reported `Time:`. It is load-dependent by construction
(§2.3). Nothing in this PLAN gates on it; §2.3 states what to do about it and §4.1 states the tolerance.

The single failure is `__tests__/documentOracles.test.js`'s **intentional** red placeholder
`AT-22 [red-until-L-06]`, carried deliberately from the preceding feature. It is **not this feature's
test and must not be fixed, deleted or skipped.**

### 2.2 The exit criterion, stated once — every task cites this

> **A batch gate passes when the suite shows no *new* failures against §2.1's baseline.**

Never "green". The baseline is 1 failed / 1038 passed / 70 skipped, and the one failure —
`AT-22 [red-until-L-06]` in `documentOracles.test.js` — belongs to another feature (§13.2 `P-Q-08`). A
gate demanding green is unsatisfiable at every batch, and a task that "fixes" that red has changed
another feature's contract.

"No new failures" needs a companion, because a task's own red tests are legitimately failing between the
batch that writes them and the batch that greens them. **That companion is §7.3, and only §7.3.** It is a
ledger **per acceptance test**, not per file: for each assertion it gives the batch it must be green from
and the batches in which a red is permitted. Outside its window, a red is a regression and a halt.

v1.0 kept the same information per **file**, and that fails open in exactly the place this feature can
least afford it. A file's window is the union of its assertions' windows, so an assertion that is green
on arrival inherits a permitted-red window from its noisiest neighbour. **Three assertions are green at
HEAD**, measured for v1.1: `RLH-AT-19` and `RLH-AT-20` have an **empty** window — a red at any gate,
including batch 2, is a regression — and `RLH-AT-64` has a *bounded* one, batches 4–10 only, opened by
`RLH-18` and closed by `RLH-32`. Under v1.0's per-file column `RLH-AT-19` was permitted-red through the
batch that adds `refreshReviewState`, the feature's riskiest await site, which would have made this
feature's own await guard silent over its own worst risk.

### 2.3 The suite is already over the 180 s watchdog — how to run it

Five measurements of the **same** HEAD, all after the baseline above:

| Run | jest `Time:` | wall |
|---|---|---|
| v1.0 authoring | 179.175 s | not recorded |
| test-engineer review | 179.924 s | **180.56 s** |
| v1.1 re-measurement | 184.752 s | **185.43 s** |
| test-engineer round 2 | 181.681 s | **182.35 s** |
| v1.2 re-measurement | 181.336 s | **181.80 s** |

So the honest statement is **not** "179 s, just under the ceiling" but **already over it, and noisy
upward**. The five points span jest 179.2–184.8 s and wall 180.6–185.4 s; **every recorded wall figure
exceeds 180 s and none is under**, and no run reproduces to better than ±3 s. That is the whole argument
for the treatment below: a number this noisy cannot be a gate, and a ceiling every measurement already
crosses is a procedural constraint, not a budget to trim coverage against. The wall clock is set by the longest single suite plus worker contention, not by the sum of
test time: in the v1.1 run `driftFault.test.js` alone took 184.459 s of the 184.752 s total, with
`guardMatrix.test.js` at 177.718 s and `driftSync.test.js` at 154.248 s beside it — shell-spawning drift
suites paying process-startup cost under contention. This feature's new suites are in-process and cheap,
but they add workers competing for the same cores, so the projection after the feature is **190–200 s**,
not 179 s plus a few seconds of new assertions.

Consequences, and the first is not a recommendation:

- **run the suite in the background, always** — a foreground invocation will be killed at 180 s, and the
  kill looks like a hang, not a failure. This is **mandatory** at every batch gate, not advisory;
- **halt if a gate run exceeds 300 s.** Beyond that the run is not slow, it is stuck (§11.3);
- **do not shorten the suite to fit the watchdog.** Deleting or skipping a drift suite to buy margin
  destroys coverage this repo paid for; the ceiling is a procedural problem, not a coverage budget;
- **record the wall time in each batch commit**, so the trend stays visible rather than being rediscovered
  at review;
- **run a single file with `npm test --`, never bare `npx jest <file>`:**

```bash
cd pdlc/workflows && npm test -- __tests__/scanLines.test.js
```

  jest here needs `node --experimental-vm-modules` (see `package.json`), which the npm script supplies.

  **The hazard, restated as measured (v1.2 correction).** Bare `npx jest <file>` **cannot run any suite
  in this directory at all**. Measured at HEAD, `npx jest __tests__/parseVerdict.test.js` prints
  `● Test suite failed to run` with `SyntaxError: Cannot use import statement outside a module`, reports
  `Test Suites: 1 failed, 1 total` / `Tests: 0 total`, and **exits 1**; the same file under
  `npm test -- __tests__/parseVerdict.test.js` reports `20 passed`, exit 0. v1.1 asserted that the bare
  invocation "exits 0 — a vacuous green"; **that is false and is withdrawn.** It is a loud red, not a
  silent green.

  The correction matters in both directions. It **removes** a hazard the PLAN claimed to have — nothing
  in this feature can be waved through by a zero-test run that reports success, because there is no such
  run. And it **replaces** it with a smaller, real one: an implementer who reaches for the bare command
  gets a module-parse error that is indistinguishable, at a glance, from the failure a legitimately RED
  new test is supposed to produce. That is why every single-file invocation in this PLAN — §4.1's
  pre-flight, §12.1's per-task gate — uses `npm test -- <file>`, and why `RLH-01` asserts the measured
  observation (suite-failed-to-run, `Tests: 0 total`, non-zero exit) rather than the withdrawn one.


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

This is why §4's source lane is a strict chain — `RLH-05 → 18 → 20 → 16 → 23 → 26 → 27 → 30 → 32 → 33`
— with one link per batch, and why several of its `Deps` edges exist **for
serialisation alone**. Those edges are marked `[dist]` in §4 so a reader does not mistake a
serialisation edge for a logical one. Removing a `[dist]` edge does not break a compile; it produces a
batch in which two agents rebuild `dist/` concurrently and one silently loses the other's bytes behind
a green suite — precisely the last-writer-wins race rule 2 exists to prevent.

The alternative — deferring the rebuild to one task at the end — was **rejected**: it violates
TSPEC §7.3's same-commit rule on every intermediate commit and leaves the branch shippable-looking
with a stale bundle at ten points in its history.

**The lane is ordered for shortness, not by task id.** Within the logical constraints of §6.2 the
source lane is free to be permuted, and it is: `RLH-18` (seams) and `RLH-20` (queue) precede `RLH-16`
(the two judgements) because `RLH-16` cannot start until `RLH-12`'s fixtures exist in batch 4, and
parking the lane for a batch to wait for them would cost a batch for nothing. Read the lane order as
the schedule, and §6.2 as the constraints it satisfies.

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
— the dispatcher validates the column against the `Deps` edges and halts on mismatch. `[dist]` on a
`Deps` edge marks a serialisation edge required by §3.2, not a logical one. `[Fake first]` marks a
test-double or fixture-creation task, which precedes every production task for the same component.

**There is no `Greened by` column.** v1.0 carried one, per *file*, and §2.2 explains why that
granularity fails open. The permitted-red window is stated **once**, per acceptance test, in **§7.3** —
that table is the gate's only authority. A task row here says what the task builds; §7.3 says when each
assertion must be green.

**Three ids are retired**: `RLH-10`, `RLH-13` and `RLH-15` are folded into `RLH-05` (§4.2). No task row,
`Deps` edge, ledger row or traceability cell names one; the only surviving mentions are historical, in
§4.2, §13.1 and §14. A reference to one **as a live task** is a stale reference.

Paths are repo-relative and subpackage-qualified. `__tests__/` and `dist/` are always under
`pdlc/workflows/`.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| **RLH-01** | **Pre-flight gate.** Assert, at HEAD, every baseline fact this PLAN and the TSPEC depend on; promote any absent one to blocking work before batch 2 runs. Enumerated in §4.1. Asserts existence only, never the new shape a later task creates | — | — | 1 | — | ⬚ |
| **RLH-02** | `[Fake first]` **The one canonical seam-double module** (TSPEC §8.1, `DEC-ORACLE-03`): `fakeListFiles(files)`, `fakeFs(initialContents)`, `fakeGit(script)`, `recordingRecordHalt()`. Sole owner; every L2 test imports from here and no test file defines an ad-hoc seam object | `__tests__/helpers/seams.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-03** | `[Fake first]` **RED `scanLines` suite + its three fenced-region fixtures.** Fixtures are byte-exact per TSPEC §8.2 — `quoted-verdict.md` pinned to the **nested** four-in-three form (a three-in-three fixture passes under the wrong implementation), `quoted-hash.md`, `unclosed-fence.md`. RLH-AT-65, RLH-AT-66, plus TSPEC §8.2's `scanLines` totality-and-partition property via `driftGenerators` | `__tests__/scanLines.test.js`, `__tests__/fixtures/cross-reviews/{quoted-verdict,quoted-hash,unclosed-fence}.md` | — | 2 | RLH-01 | ⬚ |
| **RLH-04** | **RED SKILL-amendment assertions.** Extend the existing suite with one assertion per row of TSPEC §7.4 (nine files). Verification method per §10 of this PLAN | `__tests__/skillFiles.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-06** | `[Fake first]` **RED approval-hash / digest suite + known-answer vectors.** Vectors per TSPEC §8.2: empty string, ASCII, multi-byte UTF-8, surrogate-pair emoji, each with an externally computed 64-hex digest — the last two are the only falsifier of a wrong `utf8Bytes`. Covers AT-12…AT-18 (incl. the L2 append cases) and the `canonicaliseForDigest` idempotence + `sha256Hex` determinism properties | `__tests__/approvalHash.test.js`, `__tests__/fixtures/digest-vectors.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-11** | **RED round-derivation suite.** AT-01…AT-07, AT-63, plus the `parseReviewFilename` round-trip and `deriveRoundWindow` window-invariant properties of TSPEC §8.2 — the **restated** forms (partition stated over `parseReviewFilename`'s three-way split, not over `deriveRoundWindow`'s return; the weaker v1.1 form is false on a correct implementation) | `__tests__/roundDerivation.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-14** | **RED force-phases suite.** AT-29 (bad-token rejection; the operator message is the literal in **TSPEC §6.2 row 12** — copy it from there, do not retype it from here), AT-28 (force overrides approval only), **RLH-AT-01a** (a forced phase on a branch carrying `-v1` writes `-v2` next), plus the `parseForcePhases` catalogue-closure property over the return shape **TSPEC §3.7** pins: `{ ok: true, phases: Set<string> } \| { ok: false, badTokens: string[] }` | `__tests__/forcePhases.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-17** | **RED composition-root wiring update.** Extend for the six new `main()` parameters (TSPEC §3.1) — five `_`-prefixed seams plus `forcePhases`, which is data. The parameter-list assertion is named **`RLH-WIRE-01`** and is **not** AT-64: TSPEC §8.3 assigns AT-64 to `runtimeBundle.test.js` alone (RLH-31), and a second home for the same id gives one run two tests of one name (§1.3, §7.4). **May not inject anything** (TSPEC §8.4) | `__tests__/pipelineWiring.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-29** | **RED phase-suite updates** for `buildFinalReport`'s widened field list (TSPEC §8.3's closing paragraph). Behaviour unaffected; the four files are updated together because they share one cause | `__tests__/{dodPhase,shipPhase,implPhase,harvestPhase}.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-31** | **RED bundle-guard extension.** RLH-AT-19 (the two anchored regexes `/\bprocess\s*\./` and `/\bfetch\s*\(/`, **not** the bare-identifier forms, plus the await-discipline scan over source), RLH-AT-20 (freshness — already present), RLH-AT-64 (derived seam set, wired-or-exempt with E-1/E-2/E-3 and both anti-rot clauses). **Also owns the await scan's *mechanism* and the mechanism's own oracle `RLH-SCAN-01`** — a masked bracket-depth walk, file-local and unexported in this file, no parser and **no new dependency** (`H-n`). Its shape is decided in **§9.2 item 3**, which this task implements rather than re-invents; a mechanism that cannot decide a shape must report that site as unclassified, never pass it. Contract in TSPEC §8.5 verbatim; §9 of this PLAN states the traps and the mechanism | `__tests__/runtimeBundle.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-05** | **GREEN the whole pure-function leaf segment.** One task, one commit, one rebuild — v1.0's `RLH-05`/`10`/`13`/`15` merged (§4.2). Six independent groups, no group consuming another except as noted: **(a)** the constants block per TSPEC §4.8 (placement: immediately after `const MODEL_DEFAULT = "opus";`, module-level, unexported); **(b)** the four frozen closed-catalogue arrays per §4.1; **(c)** `scanLines` per §5.0; **(d)** the digest family — `canonicaliseForDigest`, `utf8Bytes`, `sha256Hex`, `approvalHashOf` per §5.3, canonicalisation applied **inside** `sha256Hex` and never by a caller, **not a seam**, no injection (§3.7), no `crypto`, no `TextEncoder`, no `BigInt`; **(e)** `parseReviewFilename` (G-1…G-4, role alternation derived from `reviewerRoleSlug`'s `MAP`), `deriveRoundWindow`, and the reverse accessor `reviewerSkillForSlug` over the same `MAP`, per §5.2 and §3.9; **(f)** the five record parsers `parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker`, `extractRecommendation`, `parseForcePhases` per §3.7, §4.3, §5.7, §5.8 — all total, all over `scanLines` (so (f) follows (c)), all synchronous, and `parseForcePhases` returns the `Set<string>` shape §3.7 pins | `__tests__/{scanLines,approvalHash,roundDerivation,forcePhases}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 3 | RLH-01, RLH-03, RLH-06, RLH-11, RLH-14 | ⬚ |
| **RLH-07** | **Amend the three review SKILLs** — `## Verdict` as the file's last section in TSPEC §4.4's exact grammar (FSPEC §6.5) | `__tests__/skillFiles.test.js` | `pdlc/skills/{se,pm,te}-review/SKILL.md` | 3 | RLH-04 | ⬚ |
| **RLH-08** | **Amend the three author SKILLs** — `REVISION-COMPLETE: yes\|no` as the response's **last line**, and the pacing contract (FSPEC §8.4, TSPEC §7.4). §10 states the drift risk and its mitigation | `__tests__/skillFiles.test.js` | `pdlc/skills/{se,pm,te}-author/SKILL.md` | 3 | RLH-04 | ⬚ |
| **RLH-09** | **Amend the three orchestration/harvest SKILLs** — `harvest-learnings` emits `## 6. Approval Record` per TSPEC §4.4 copying anchor lines **verbatim, never recomputing** (FSPEC §9.4); `orchestrate-dev` documents the POSTMORTEM lifecycle and the `RESOLVED:` marker (AC-5.3); `orchestrate-queue` documents that a `halted` row is committed (AC-5.4). Must keep `orchestrateDevSkill.test.js` green | `__tests__/skillFiles.test.js` | `pdlc/skills/{harvest-learnings,orchestrate-dev,orchestrate-queue}/SKILL.md` | 3 | RLH-04 | ⬚ |
| **RLH-19** | **RED queue-module suite extension.** `updateQueueStatus`'s `{ markdown, matched }` return (TSPEC §4.6) at every existing call site, `rewriteStatus` exported and committing (§3.6, §6.5). **AT-30…AT-34, module half only** (§7.4): the `rewriteStatus` / `updateQueueStatus` mechanism itself — the row rewrite, the `_git` two-invocation commit, and each commit-failure branch driven directly against the module. The orchestrator-level half — *which* halt paths reach it — is `RLH-25`'s and is asserted nowhere here. Jest names carry the `-module` qualifier (`RLH-AT-30-module` …) so one run has no two tests of one name | `__tests__/orchestrateQueue.test.js` | — | 3 | RLH-01, RLH-02 | ⬚ |
| **RLH-21** | **RED pacing-wrapper suite.** AT-35…AT-54, AT-58; **AT-61 as two named tests** because its two conjuncts green in different batches (§7.3) — `RLH-AT-61-loop` (each trailer reason distinguishable in `reviewLoop`'s return, green with `RLH-23`) and `RLH-AT-61-report` (the same reason distinguishable in the operator report line, green with `RLH-30`). Both live here; `RLH-30` writes no test. Plus **RLH-AT-43a** (S-INV freshness, **both** refresh outcomes — (a) round 2's optimizer is `mode: "revision"` with an `EpisodeKey` differing from round 1's, (b) a mid-loop `unreadable` **halts** with `Cannot enumerate docs/{feature}: unreadable` and dispatches no episode). Both fixtures sit on the same clean branch where `docs/{feature}/` **exists and is empty of cross-reviews** — TSPEC §6.2 row 1's successful empty listing, **not** `dir_missing` | `__tests__/pacingWrapper.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-22** | **RED review-loop suite update.** The three new parameters (`docType`, `_listFiles`, `_readFile`) and **no seed maps**; `iteration` supplied at every call site; the gate `if (iteration > endIndex)` reading `endIndex` as a **consumed parameter** — the `startIndex + MAX_REVIEW_ROUNDS - 1` arithmetic is `RLH-26`'s, at the phase gate, and is asserted to happen **once** (§11.5 `N-a`); the return shape's `postmortemWritten` and `trailerReason` (TSPEC §3.9, §5.6.1). **This file is the oracle for both halves of §11.5 `N-a`** — `RLH-LOOP-01` asserts `reviewLoop`'s two sibling fields and the gate, `RLH-LOOP-02` asserts the return shape **and** `checkConverged`'s rendered `rounds {startIndex}..{endIndex}` text over a case with `startIndex ≠ 1 ≠ endIndex`, so a swapped positional pair is a named red. **Plus `RLH-LOOP-03`** (new at v1.3), the grep-shaped oracle for §11.5's single-computation rule: over `orchestrate-dev.js`'s source text, the literal `MAX_REVIEW_ROUNDS - 1` occurs **exactly once**, and that occurrence lies **outside** the source spans of `reviewLoop` and `checkConverged` — the same construction as §12.3's `selectMode` row. `RLH-23`/`26`/`27` red here if any of them threads the window differently. The shape is decided in §11.5, not by this task | `__tests__/reviewLoop.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-24** | **RED approval-search suite.** Drives the search **through `main()` with injected seams** (L2, §7), so it needs no exported identifier and the §11.5 `N-b` name is not observable to it. AT-08…AT-11, AT-56, AT-57 per TSPEC §5.4 — same-round dual approval, no cross-round combination, absent role file is not approving, duplicated verdict, partial/disagreeing anchor pair, higher non-approving round, exclusive tier selection | `__tests__/approvalSearch.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-25** | **RED halt-and-queue suite.** AT-21…AT-27; **AT-30…AT-34, orchestrator half only** (§7.4) — that each halting exit of `orchestrate-dev` reaches the committing status write, and what the orchestrator reports when the commit fails; the mechanism itself is `RLH-19`'s. Jest names carry the `-orch` qualifier (`RLH-AT-30-orch` …). Plus **RLH-AT-13a** (G-INV totality: each of the four exits that lead to running the phase refuses on an unresolved POSTMORTEM and reproduces the Recommendation; the `FRESH` exit does **not** refuse but names it in the skip notice). FSPEC §12.4 example A and AC-2.3b example B are driven **verbatim as fixtures** | `__tests__/haltAndQueue.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-28** | **RED report-template suite.** AT-55 — no un-substituted `{…}` template reaches any operator-facing report string (TSPEC §6.3's general rule) | `__tests__/reportTemplates.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-18** | **GREEN the five seams, their Node defaults, and the `forcePhases` data parameter.** Six new parameters on `main()`'s destructured list (TSPEC §3.1 — nothing existing renamed or reordered), of which **five are seams** (`_listFiles`, `_writeFile`, `_appendFile`, `_git`, `_recordHalt`) and the sixth, `forcePhases`, is **data**: §3.1 states outright that it carries no default implementation and is never called. So there are five Node defaults — `defaultListFiles` / `defaultWriteFile` / `defaultAppendFile` / `defaultGit` / `defaultRecordHalt` per §3.2–§3.5 — and five adapter entries later, not six of either. Do not go looking for a sixth. `meta.inputs` gains the `forcePhases` entry. `_appendFile` is **append-shaped, never a whole-file rewrite**. `DEV_META` is **not** edited (§3.1, Q-07) | `__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 4 | RLH-05 `[dist]`, RLH-17, RLH-02 | ⬚ |
| **RLH-12** | **RED structural-completeness suite + heading fixtures.** AT-59, AT-60, AT-62 and the `isComplete` **exact-required-set** property (falsifiable in both directions; the v1.1 monotonicity form was satisfied by a matcher recognising no heading at all). Fixtures are copied **verbatim from the SKILL templates as they read at the end of batch 3** — hence the `RLH-08`/`RLH-09` edges. The copy is a point-in-time snapshot and **detects no subsequent SKILL edit**; §10.2 states plainly what it does and does not buy. Do not paraphrase a heading while copying it | `__tests__/completeness.test.js`, `__tests__/fixtures/completeness/` | — | 4 | RLH-01, RLH-08, RLH-09 | ⬚ |
| **RLH-20** | **GREEN the queue module.** The four changes of TSPEC §3.6 — `updateQueueStatus`'s `{ markdown, matched }` (§4.6) with **every** existing call site updated to destructure, `rewriteStatus` **exported** (load-bearing for §7.2 edit 3, not cosmetic) with a `_git` parameter and §6.5's two-invocation commit, `main()`'s `_git`, and `runPicked`'s three status writes routed through the committing `rewriteStatus` | `__tests__/{orchestrateQueue,haltAndQueue}.test.js` | `pdlc/workflows/orchestrate-queue.js`, `dist/` | 5 | RLH-18 `[dist]`, RLH-19 | ⬚ |
| **RLH-16** | **GREEN the two judgements** — `isStale` per TSPEC §5.5 (read at comparison time, one hash-equality test, never reads `REVIEWED-COMMIT`) and `isComplete` per §5.9 (four wrapped classes, six spec-class heading tables, order not required, the accepted shallowness of T-Q-04) | `__tests__/{approvalHash,completeness}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 6 | RLH-20 `[dist]`, RLH-12, RLH-05 | ⬚ |
| **RLH-23** | **GREEN the episode machinery** — `selectMode` (§5.6.1, the ONLY producer of `EpisodeKey.mode`), `isTerminal` (§5.6.2, exactly two members), `dispatchAndVerify` (§3.8, §5.6.2's terminal-first-then-progress loop), the two prompt kinds (§5.6.3), and `reviewLoop`'s `refreshReviewState` helper called at **every** wrapped episode entry — never a pre-loop snapshot (S-INV). **The `ListFailure` disposition belongs inside `refreshReviewState`, above the `deriveRoundWindow` call, exactly as TSPEC §5.6.1's pseudocode places it** — `dir_missing ─► r.files ← []`, otherwise the one halt of §4.2 / §6.2 rows 2 and 17. That is pinned, not a layering choice. `reviewLoop` gains `docType`, `_listFiles`, `_readFile` and **no seed maps** (§3.9) | `__tests__/{pacingWrapper,reviewLoop,completeness}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 7 | RLH-16 `[dist]`, RLH-21, RLH-22, RLH-05 | ⬚ |
| **RLH-26** | **GREEN the phase gate.** TSPEC §2.5 steps 1–4 and step G in one task because they are one control-flow shape and **G-INV is an invariant over paths, not a step number**: the approval search (§5.4), the staleness call (§5.5), `checkPostmortem` (§5.8) placed at the single point every phase-running exit converges on, **§5.1's three-step file-verdict extraction** — locate the trailing `## Verdict` section by last-visited `scanLines` match, the **duplicate-`VERDICT:` pre-count that fails closed** (`AT-11`'s oracle, and a *different* pre-count from §5.3's), then `parseVerdict` unchanged over the section text — the anchor capture/append ordering t0…t6 with §5.3's own pre-count **count-and-compare**, the `forcePhases` gate (§5.7) whose parsed input is the `Set<string>` of §3.7, and **the review-window threading of §11.5 `N-a`, which this task owns end to end**: compute `endIndex` **once** here as `startIndex + MAX_REVIEW_ROUNDS - 1` (TSPEC §7.1 edit 3's arithmetic, hoisted to the gate by `N-a`) and pass `startIndex` **and** `endIndex` at **all seven `reviewLoop` call sites** — including the forced path — **and at all seven `checkConverged` call sites**. At the `checkConverged` sites this task writes **all three** new arguments — `feature`, then `startIndex`, then `endIndex`, positionally after `recordPhase` — because it cannot write arguments 6 and 7 without writing argument 5, and v1.2 left `feature`'s seven argument lists with no named owner (PM `L-02`); `RLH-27` owns the *parameter list* that receives them. No other site computes `endIndex`; a second derivation is an `H-q` halt, and **`RLH-LOOP-03` is what falsifies it** (§11.5, §7.3) | `__tests__/{approvalSearch,approvalHash,forcePhases,haltAndQueue,roundDerivation,reviewLoop}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 8 | RLH-23 `[dist]`, RLH-24, RLH-25, RLH-22, RLH-14, RLH-11, RLH-16, RLH-05 | ⬚ |
| **RLH-27** | **GREEN the terminal exit.** `checkConverged` gains **three** positional parameters after `recordPhase` — `feature`, `startIndex`, `endIndex` (§11.5 `N-a`; TSPEC §3.9 pins the positional shape and §7.1 site 1 requires both indices, so the two are the same row's two halves) — renders §7.1 site 1's `rounds ${startIndex}..${endIndex}` from them and **recomputes neither**; `reviewLoop` destructures the same two as sibling fields and its gate reads `endIndex` (§7.1 edit 3, arithmetic-free at the site). Its `postmortemPath` template is **corrected and read**, and the exit sequence of §6.3 runs in order — dispatch, `await _checkFile` **confirmation** (never the agent's reply), `await _recordHalt`, throw one of §6.4's **two conditional** shapes. Plus §7.1's five `MAX_REVIEW_ROUNDS` edits, all five anchored by enclosing symbol + distinctive literal, and `reviewLoop`'s `postmortemWritten` | `__tests__/{haltAndQueue,reviewLoop}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 9 | RLH-26 `[dist]`, RLH-25, RLH-22, RLH-05 | ⬚ |
| **RLH-30** | **GREEN the report surface.** `buildFinalReport`'s four new fields and four new lines per TSPEC §4.7 — including the skip notice's **specified** detail string with its conditional bracketed clause (absent, not empty, when the POSTMORTEM state is clean) — and the `{DOC-TYPE}` substitution in `reviewerPrompt` / `optimizerPrompt` (§3.9), which is the same "no un-substituted template" rule as §6.3 | `__tests__/{reportTemplates,dodPhase,shipPhase,implPhase,harvestPhase}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 10 | RLH-27 `[dist]`, RLH-28, RLH-29, RLH-21 | ⬚ |
| **RLH-32** | **GREEN the adapter and the build.** `rtListFiles`, `rtAppendFile`, `rtGit` and the four-entry extension of `rtDevInjections` (TSPEC §3.10 — `_writeFile: rtWriteFile` **existed but was never wired**; `_recordHalt` is deliberately **not** here); then all four `build-runtime.mjs` edits of §7.2 with §3.3 of this PLAN's ordering. One commit, one rebuild | `__tests__/{runtimeBundle,pipelineWiring}.test.js` | `pdlc/workflows/runtime-adapter.js`, `pdlc/workflows/build-runtime.mjs`, `dist/` | 11 | RLH-30 `[dist]`, RLH-31, RLH-18, RLH-20 | ⬚ |
| **RLH-33** | **Version bump and final rebuild.** Bump `version` per TSPEC §7.5, rebuild, confirm `distribution-manifest.json` records the new version and `build-runtime.mjs --check` exits 0 | `__tests__/runtimeBundle.test.js` | `pdlc/.claude-plugin/plugin.json`, `dist/` | 12 | RLH-32 `[dist]` | ⬚ |
| **RLH-34** | **Final verification.** Run §12's checklist end to end. Writes no source and no test; a failure here re-opens the owning task rather than being patched locally | — | — | 13 | RLH-33, and every task above | ⬚ |

### 4.1 What `RLH-01`, the pre-flight gate, asserts

Existence only — never the new shape a later task creates. Every row was verified while authoring this
PLAN and is expected to pass; the gate exists so that a drift between authoring and implementation
becomes blocking work in batch 1 instead of a confusing red in batch 9.

| Assertion | Verified value at authoring time |
|---|---|
| **Command:** `cd pdlc/workflows && { time npm test; }`, run in the background per §2.3. **Blocking assertion:** the three counts and the suite total reproduce exactly, and the one red is `documentOracles.test.js` `AT-22 [red-until-L-06]`. Any deviation in a count, or a different red, fails the gate | 1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites |
| **Advisory, recorded not asserted:** the wall clock of that command. **No tolerance, because it is not a gate** — it is load-dependent (§2.3) and five measurements of one HEAD spanned 179.2–185.4 s. `RLH-01` records the number it measures so §2.3's 190–200 s projection can be falsified later; it does **not** fail on it. If it exceeds **300 s** at HEAD, halt — the §2.3 procedure has been outrun before the feature starts | jest `Time: 184.752 s`; wall clock `3:05.43` = 185.43 s (2026-07-30) |
| **Blocking assertion, restated as measured (v1.2).** `cd pdlc/workflows && npx jest __tests__/parseVerdict.test.js` **fails to run the suite**: `Test Suites: 1 failed, 1 total`, `Tests: 0 total`, `SyntaxError: Cannot use import statement outside a module`, **exit 1**. The same file under `npm test -- __tests__/parseVerdict.test.js` reports `20 passed`, exit 0. The gate asserts *that* — suite-failed-to-run, zero tests, non-zero exit for the bare form; 20 tests, exit 0 for the npm form — and **not** v1.1's withdrawn "exits 0 / vacuous green" (§2.3). If the bare form ever starts *executing* tests, the row fails and §2.3's mandate is re-derived rather than assumed | re-measured 2026-07-30: bare → suite failed to run, `Tests: 0 total`, exit **1**; npm form → 20 passed, exit 0 |
| **Blocking assertion — a predicate, not a count (v1.3).** The await-discipline scan `RLH-31` will encode reports **every** call site of FSPEC AT-19's closed thirteen-name set, resolved through `main()`'s destructuring aliases and through wrapper names that inherit the obligation, across `orchestrate-dev.js` and `orchestrate-queue.js` source; and **every such site that is not lexically preceded by `await` is classified by one of TSPEC §8.5's three rulings.** *That total classification is the whole of the blocking assertion.* A site matching no ruling fails the gate and is blocking work before batch 2 — never a quiet fourth exemption (§11.3 `H-h`). **A site that is correctly exempt never fails this gate, whatever the total is**: a future correct arrow wrapper adds one to the number and nothing else. The gate exists so `RLH-AT-19`'s **empty** permitted-red window (§7.3 row 1) rests on a *checked* premise at batch 1 | see the advisory row below for the observed set. Nothing in this row depends on its size |
| **Advisory, recorded not asserted (v1.3): the observed site set — and §4.1 is the one place in this PLAN that states it.** §7.3 row 1, §9.2 and §12.3 cite this row for the evidence and TSPEC §8.5 for the rule; none of them restates it. Recorded so §11.2's diagnosis can name what moved, **and so a drift is a report rather than a halt** — the assertion above is what halts | **five** non-`await`ed sites, measured 2026-07-30 at HEAD by the mechanism §9.2 item 3 prescribes, out of **35** scan-set call sites in total (27 in `orchestrate-dev.js`, 8 in `orchestrate-queue.js`). All five exempt, none unclassified: `orchestrate-dev.js:615`, `:616` — `_agent` under its own `_` name, array elements of `await _parallel([…])` in `reviewLoop`, **awaited-combinator-argument** ruling; `orchestrate-dev.js:1569` — `rawAgentFn`, the `_agent: rawAgentFn = agent` alias (`:1545`), the whole body of `const agentFn = (skill, prompt, opts) => rawAgentFn(…)`, **returned-promise** ruling; `orchestrate-dev.js:1867` — `agentFn`, the inheriting wrapper, as an anonymous `batch.map` arrow body, **returned-promise** ruling; `orchestrate-queue.js:524` — the identical wrapper over that file's own `_agent: rawAgentFn` alias (`:511`), `MODEL_QUEUE`, **returned-promise** ruling. **So `orchestrate-queue.js` has one, not none.** v1.1 stated one site, v1.2 stated three and said the queue had none; **both were wrong, and in the same way — the number was verified rather than re-derived from the ruling.** v1.3's five was re-derived from the predicate (§9.2 item 3), which is also why the count is no longer load-bearing |
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
| Tasks | **31** (v1.0 had 34; `RLH-10`, `RLH-13` and `RLH-15` are folded into `RLH-05`) |
| Batches | **13** (v1.0 had 16) |
| Widest batches | batch 2 — **nine** tasks (RLH-02, 03, 04, 06, 11, 14, 17, 29, 31) — and batch 3 — **ten** tasks (RLH-05, 07, 08, 09, 19, 21, 22, 24, 25, **28**). Every task in each writes a distinct file; the only source-lane member of batch 3 is RLH-05 |
| Batches 4–12 | one or two tasks each, always exactly one source-lane task (batch 4 also carries RLH-12, a test file). **Batch 13 has none** — its sole member `RLH-34` writes no source and no test, matching §5.1's `dist/` range ("3–12, one per batch") and §13.3's ten serialised source-lane commits |
| **Critical path** | **RLH-01 → 03 → 05 → 18 → 20 → 16 → 23 → 26 → 27 → 30 → 32 → 33 → 34** — thirteen nodes, twelve edges, one node per batch, and it is the whole span of the schedule |

The critical path is the batch count, so shortening it means merging source tasks. **v1.1 takes the one
merge that is free.** `RLH-05`, `10`, `13` and `15` were four consecutive one-per-batch source tasks
over the **pure-function leaf segment** — constants and catalogues, `scanLines`, the digest family, the
filename grammar and round window, the five record parsers. They are mutually independent except for
two local orderings kept inside the merged task (the parsers run over `scanLines`; `isStale` needs the
digest), every one of their RED suites already exists by batch 2, and none of them was separated by a
logical edge — only by the `[dist]` serialisation edge of §3.2. Merging them removes three batches,
roughly a fifth of the schedule, without touching §3.2, because that rule bounds *tasks per batch* and
merging tasks is the sanctioned way to satisfy it. The cost is one larger reviewable unit: a red in
batch 3 now names a segment rather than a single function. That trade is worth three batches on a lane
whose gate takes over three minutes to run.

**The two judgements (`RLH-16`) are deliberately *not* merged into it**, even though they are the fifth
leaf: `isComplete` cannot be greened before `RLH-12`'s fixtures exist in batch 4, so folding it in would
have delayed the whole merged task by a batch and bought nothing.

**No further merge is taken.** `RLH-23`, `RLH-26` and `RLH-27` stay separate — those three are where
every one of this feature's four defects actually gets fixed, and they are the three whose failure modes
are invisible to the unit level. Both round-1 reviewers independently reached the same conclusion.

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
| `pdlc/workflows/orchestrate-dev.js` | RLH-05, RLH-18, RLH-16, RLH-23, RLH-26, RLH-27, RLH-30 | 3, 4, 6, 7, 8, 9, 10 |
| `pdlc/workflows/orchestrate-queue.js` | RLH-20 | 5 |
| `pdlc/workflows/runtime-adapter.js` | RLH-32 | 11 |
| `pdlc/workflows/build-runtime.mjs` | RLH-32 | 11 |
| `pdlc/workflows/dist/` (all three artifacts) | RLH-05, RLH-18, RLH-20, RLH-16, RLH-23, RLH-26, RLH-27, RLH-30, RLH-32, RLH-33 | 3–12, one per batch |
| `pdlc/.claude-plugin/plugin.json` | RLH-33 | 12 |

**`dist/` is the reason batches 3–12 each carry exactly one source-lane task.** Read the `dist/` row as
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

**No shared domain-generator module appears in this manifest, and that is a decision, not an omission.**
The five property-owning tasks each build their domain draws **file-local and unexported** over
`driftGenerators.js`'s primitives; §7.2 states why and what is still forbidden. So there is nothing to own
here, and no `Deps` edge for it.

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

**Every pre-existing suite not named above needs no change**, and that is an assertion, not an
omission. Spot-checked at HEAD for the two most likely to break: `orchestrate-dev.test.js` reads
`meta.inputs` by `find(i => i.name === "reqPath")`, so `RLH-18`'s added entry cannot red it, and
`orchestrateDevSkill.test.js` asserts properties of `pdlc/skills/orchestrate-dev/SKILL.md` that
`RLH-09` must preserve (§10.1). If any other pre-existing suite reds, that is a regression under §2.2
and a §11.2 halt — never a licence to edit a file this manifest does not list.

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

1. **H-1 supplies H-4's key.** `RLH-05`'s `deriveRoundWindow` → `startIndex` must precede `RLH-26` (the
   approval search, whose candidate is `startIndex - 1`). An approval search built against a
   `startIndex` that is always 1 searches round 0 forever and never grants a skip — a silent, green
   no-op.
2. **The digest precedes staleness precedes the skip.** `RLH-05` (the digest family) → `RLH-16`
   (`isStale`) → `RLH-26`.
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
| dependency injection for capabilities | `main()`'s existing sixteen-parameter destructured list | the **five** new seams — plus `forcePhases`, which is **data**, not a seam (TSPEC §3.1) — extend it **in place**; no new injection mechanism | RLH-18 |
| verdict grammar and its closed catalogue | `parseVerdict` + `VALID_VERDICTS` + its reverse-scan + `malformed: true` fallback | the persisted verdict record, **verbatim and unchanged** | RLH-26 |
| pass/fail semantics | `isPass` | the approval search's unanimity check | RLH-26 |
| role-slug catalogue | `reviewerRoleSlug`'s `MAP` | the filename grammar's role alternation **and** the new reverse accessor, so the two cannot desynchronise | RLH-05 |
| Node-default IO with an injectable module | `checkFileNonEmpty(path, { fsMod = fs })` | `defaultListFiles` / `defaultWriteFile` / `defaultAppendFile`, same `{ fsMod = fs }` idiom | RLH-18 |
| `child_process` injection | `mergeWorktree(…, { execFn })` | `defaultGit(argv, { execFn })` | RLH-18 |
| adapter agent-relay, JSON return | `rtMergeWorktree` | `rtListFiles`, `rtGit` | RLH-32 |
| adapter agent-relay, constrained one-word output | `rtCheckFile` | `rtListFiles`'s prompt discipline | RLH-32 |
| the skip marker in the phase table | the existing `"⏭"` status | the approval skip's phase-table row | RLH-30 |
| seeded property generation — **primitives** | `__tests__/helpers/driftGenerators.js` — `seeded` (`int`, `pick`, `shuffle`, `bytes`), `resolveSeed`, `shrink` | all seven §8.2 properties. Dependency-free, already consumed by seven suites. The **domain** draws each property needs on top of these are file-local and unshared by decision (§7.2) | RLH-03, 06, 11, 12, 14 |
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

TSPEC §8.3 owns the **AT → jest file** map. The table below carries it into the **authoring** tasks —
which task writes each assertion. **When each assertion must be green is stated only in §7.3**; §7.4
gives each split id a single owner and §7.5 names the assertions that are not FSPEC ATs.

Greening is stated **once** deliberately. v1.0 stated it twice — a "go green" row per task here and a
`Greened by` cell per file in §4 — and the two disagreed twice over, which is §1.2's own failure class.
§7.3 is the only authority; §2.2 and §12.2 gate on it. Every id below takes its `RLH-` jest name (§1.3).

| Authoring task | Assertions it writes | Level | Owning test file |
|---|---|---|---|
| RLH-03 | AT-65, AT-66; property: `scanLines` totality-and-partition | L1 | `scanLines.test.js` |
| RLH-04 | `RLH-SKILL-01` … `RLH-SKILL-09`, one per row of TSPEC §7.4 (§7.5) | L1 | `skillFiles.test.js` |
| RLH-06 | AT-12 … AT-18; properties: `canonicaliseForDigest` idempotence, `sha256Hex` determinism-and-totality | L1 + L2 | `approvalHash.test.js` |
| RLH-11 | AT-01 … AT-07, AT-63; properties: `parseReviewFilename` round-trip, `deriveRoundWindow` window-invariant | L1 | `roundDerivation.test.js` |
| RLH-12 | AT-59, AT-60, AT-62; property: `isComplete` exact-required-set | L1 + L2 | `completeness.test.js` |
| RLH-14 | AT-28, AT-29, **AT-01a**; property: `parseForcePhases` catalogue-closure | L1 + L2 | `forcePhases.test.js` |
| RLH-17 | **`RLH-WIRE-01`** — `main()`'s parameter list carries the five seams and `forcePhases`. **Not AT-64** (§7.4) | L3 | `pipelineWiring.test.js` |
| RLH-19 | AT-30 … AT-34, **module half only** (`-module` names, §7.4) | L1 + L2 | `orchestrateQueue.test.js` |
| RLH-21 | AT-35 … AT-54, AT-58, **AT-43a**; AT-61 as the two named tests `RLH-AT-61-loop` and `RLH-AT-61-report` (§7.4) | L2 | `pacingWrapper.test.js` |
| RLH-22 | **`RLH-LOOP-01`** — `reviewLoop`'s two sibling fields, `iteration` at every call site and the `endIndex` gate; §11.5 `N-a`'s oracle for `reviewLoop`. **`RLH-LOOP-02`** — `postmortemWritten`, `trailerReason`, **and `checkConverged`'s rendered `rounds {startIndex}..{endIndex}`** over `startIndex ≠ 1 ≠ endIndex`; §11.5 `N-a`'s oracle for `checkConverged`, including a swapped positional pair | L2 | `reviewLoop.test.js` |
| RLH-24 | AT-08 … AT-11, AT-56, AT-57 | L2 | `approvalSearch.test.js` |
| RLH-25 | AT-21 … AT-27, **AT-13a**; AT-30 … AT-34, **orchestrator half only** (`-orch` names, §7.4) | L2 | `haltAndQueue.test.js` |
| RLH-28 | AT-55 | L2 | `reportTemplates.test.js` |
| RLH-29 | **`RLH-REPORT-01`** — `buildFinalReport`'s widened field list, in each of the four phase suites | L2 | `dodPhase`, `shipPhase`, `implPhase`, `harvestPhase` |
| RLH-31 | AT-19, AT-20, AT-64 — **sole owner of all three** (§7.4) | L3 | `runtimeBundle.test.js` |

No other task writes an assertion. Every remaining task in §4 turns one of these green, and §7.3 says
which and when.

### 7.1 The three TSPEC-local ATs — where they live and what reds them

These three exist because the invariants they guard are stated in the TSPEC rather than the FSPEC, and
each was added after a specific wrong implementation shipped through review. They are the tests most
worth reading the TSPEC prose for before writing.

| AT | Owner task | The implementation it must red on |
|---|---|---|
| **RLH-AT-01a** | RLH-14 | the "a force skips steps 2–4" reading — which restores H-1 on the forced path. TSPEC §5.7 skips steps **3–4** only; step 2's round derivation always runs |
| **RLH-AT-13a** | RLH-25 | a gate placed ahead of step 1 (breaks FSPEC §12.4 example A) **or** reachable only from step 4 (breaks AC-2.3b example B). Both worked examples are driven verbatim as fixtures for exactly this reason |
| **RLH-AT-43a** | RLH-21 | (a) any implementation deciding mode from a pre-loop snapshot — `present` stays empty for the phase, round 2's optimizer goes greenfield, needs no trailer, and carries round 1's key: **both** conjuncts red. (b) both prior wrong shapes: the one that read a kept `{}` as a successful observation, and the one that returned `present: null` and continued as a revision episode. Neither halts; the correct implementation halts |

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

**Domain generators are per file, deliberately, and no shared module is created** (deciding TE round-1
F-10 / round-2 F-07, which v1.1's changelog wrongly recorded as fixed — see §14.1). `driftGenerators.js`
supplies **primitives** only — `int`, `pick`, `shuffle`, `bytes` — and the seven properties need *domain*
draws on top of them: conforming and non-conforming review filenames (`RLH-11`), fenced-markdown documents
(`RLH-03`), multi-byte and surrogate-pair strings (`RLH-06`), heading sets (`RLH-12`), force-phase token
strings (`RLH-14`). Each of those five tasks builds its own, **file-local and unexported**, over the shared
primitives. The reasons, stated so the choice is auditable rather than accidental:

- **The five domains have no common shape.** A filename builder, a fence builder, a codepoint builder, a
  heading-set builder and a token-string builder share nothing but the primitives they already share. A
  module holding all five would be a namespace, not an abstraction, and would couple five tasks in three
  batches to one file.
- **§5.3's single-writer rule would have to be paid for.** A shared generator module needs one owning
  batch-1/2 task and a `Deps` edge from each of the five consumers — real schedule cost, and it puts a
  batch-2 file on the critical path of `RLH-12` in batch 4.
- **A domain generator that drifts from its property is a *local* defect.** Unlike a shared oracle, a
  wrong filename builder reds only its own property, so the blast radius the shared-module argument
  usually buys against does not exist here.
- **What is *not* accepted is a second primitive library.** `driftGenerators.js` stays the only source of
  `int` / `pick` / `shuffle` / `bytes` / `resolveSeed` / `shrink` (§6.3, §12.3). A task that reimplements a
  primitive has misread this paragraph.

If a sixth property later wants one of these domains, the reuse move is to promote *that* generator to
`__tests__/helpers/`, as its own change with its own owner — not to pre-build a module for five callers
that do not overlap.

### 7.3 The permitted-red ledger — per acceptance test

**This table is the gate.** `Green from` is the batch of the last task that greens the assertion: at
that batch's gate and every gate after it, a red is a **regression** and a halt (§2.2, §11.3). Outside
its `Permitted red` window an `RLH-AT-*` failure is never excused, whatever else in its file is still
red — which is the whole reason the ledger is per assertion and not per file (§2.2).

| Assertion(s) | Written by (batch) | Green from | Permitted red | Greened by |
|---|---|---|---|---|
| `RLH-AT-19`, `RLH-AT-20`; `RLH-SCAN-01` | RLH-31 (2) | **batch 2 — green on arrival** | **none, ever** | nobody. Both anchored regexes match **zero** times in both bundles (re-measured at HEAD), and the await scan is clean over both sources: **every non-`await`ed thirteen-list call site is classified by one of TSPEC §8.5's three rulings** — the rule is §8.5's and the observed site set is §4.1's advisory row; **neither is restated here** (v1.3). `RLH-SCAN-01` is the scan mechanism's own self-test (§9.2 item 3), green on arrival for the same reason. `RLH-32` and `RLH-33` **keep** all three green; they do not turn them green. A red at any gate is a `H-h`/`H-k` halt (§2.2) |
| `RLH-AT-64` | RLH-31 (2) | batch 2, and again from batch 11 | **batches 4–10 only** | RLH-32. Also green on arrival, being **derived** (§9.3) over HEAD's wired-or-exempt root. `RLH-18` (4) opens the window by declaring five seams the production root does not yet supply; `RLH-32` (11) closes it. A red at batch 2, 3, or 11 onwards is a regression |
| `RLH-AT-65`, `RLH-AT-66`; `scanLines` property | RLH-03 (2) | batch 3 | batch 2 | RLH-05 (c) |
| `RLH-AT-12`, `-13`, `-14`, `-17`; both digest properties | RLH-06 (2) | batch 3 | batch 2 | RLH-05 (d) |
| `RLH-AT-15`, `-16`, `-18` | RLH-06 (2) | batch 8 | batches 2–7 | RLH-16 (6) supplies the staleness conjunct, RLH-26 (8) the gate conjunct, so **batch 8 binds all three**. **Three tests, one per AT, no `-stale`/`-gate` split** — v1.1 offered the split as optional and v1.2 withdraws it: it left the gate's sole authority with two windows for three assertions and ids registered nowhere (§7.4), and it does not decompose — FSPEC `AT-18` ("a record-less LEARNINGS passes the guard and the next Phase F **runs**") carries **no** staleness conjunct, so the split prescribes an empty `-stale` test for it. The cost of withdrawing it is one batch of slack on `AT-15`/`-16` only; the benefit is that every id the ledger names exists in the run |
| `RLH-AT-01` … `-06`, `-63`; both round-derivation properties | RLH-11 (2) | batch 3 | batch 2 | RLH-05 (e) |
| `RLH-AT-07` | RLH-11 (2) | batch 8 | batches 2–7 | RLH-26 — the call-site half |
| `RLH-AT-29`; `parseForcePhases` catalogue-closure | RLH-14 (2) | batch 3 | batch 2 | RLH-05 (f) |
| `RLH-AT-28`, `RLH-AT-01a` | RLH-14 (2) | batch 8 | batches 2–7 | RLH-26 |
| `RLH-SKILL-01` … `-09` | RLH-04 (2) | batch 3 | batch 2 | RLH-07, RLH-08, RLH-09 |
| `RLH-WIRE-01` | RLH-17 (2) | batch 4 | batches 2–3 | RLH-18 |
| `RLH-REPORT-01` | RLH-29 (2) | batch 10 | batches 2–9 | RLH-30 |
| `RLH-AT-30-module` … `-34-module` | RLH-19 (3) | batch 5 | batches 3–4 | RLH-20 |
| `RLH-AT-35` … `-54`, `-58`, `RLH-AT-43a`, `RLH-AT-61-loop` | RLH-21 (3) | batch 7 | batches 3–6 | RLH-23 |
| `RLH-AT-61-report` | RLH-21 (3) | batch 10 | batches 3–9 | RLH-30 |
| `RLH-LOOP-01` | RLH-22 (3) | **batch 9** | **batches 3–8** | **RLH-27** — corrected at v1.3. v1.1's `batch 7 / RLH-23` was right for v1.1's shape; v1.2 moved `reviewLoop`'s window destructuring and its `if (iteration > endIndex)` gate to `RLH-27` (§11.5's ownership table) and left this row behind, so the ledger greened an oracle two batches before the task that satisfies it and batches 7–8 would have read a §11.3 regression. **The work stays in `RLH-27`** (see §11.5 for why, and for the accepted one-batch interim) and the ledger follows it |
| `RLH-LOOP-02` | RLH-22 (3) | batch 9 | batches 3–8 | RLH-27 |
| `RLH-LOOP-03` | RLH-22 (3) | batch 8 | batches 3–7 | RLH-26 — new at v1.3. The grep-shaped oracle for §11.5's single-computation rule (`H-q`); reds at HEAD with **zero** occurrences of the literal and greens when `RLH-26` writes the one gate-side occurrence. §11.5 defines it, §12.3 carries the matching DoD row |
| `RLH-AT-08` … `-11`, `-56`, `-57` | RLH-24 (3) | batch 8 | batches 3–7 | RLH-26 |
| `RLH-AT-21` … `-27`, `RLH-AT-13a`, `RLH-AT-30-orch` … `-34-orch` | RLH-25 (3) | batch 9 | batches 3–8 | RLH-27; `RLH-AT-13a`'s gate half needs RLH-26 (batch 8) first, so batch 9 binds |
| `RLH-AT-55` | RLH-28 (3) | batch 10 | batches 3–9 | RLH-30 |
| `RLH-AT-60`, `-62`; `isComplete` property | RLH-12 (4) | batch 6 | batches 4–5 | RLH-16 |
| `RLH-AT-59` | RLH-12 (4) | batch 7 | batches 4–6 | RLH-23 |

**`RLH-AT-64` guards `orchestrate-dev`'s composition root only** (TSPEC §8.5), so it does not see the
other bundle: `RLH-20` (batch 5) adds `_git` to `orchestrate-queue.js`'s `main()`, and `QUEUE_ENTRY`
does not supply it until `RLH-32`'s edit 2a in batch 11. Between those batches the built queue bundle
carries a declared-but-unsupplied seam and **nothing reds** — the module keeps a Node default, so every
L1/L2 test passes. Answering TE Q-01: this is real and accepted. The mitigation is that an interim
batch's `dist/` is not a shippable artifact — only `RLH-34` certifies one (§12.3) — and `RLH-32` lists
`RLH-20` in its `Deps` precisely so the gap cannot outlive the feature. Do **not** widen `RLH-AT-64` to
both roots to cover it; extending the guard to `orchestrate-queue.js` is its own change, and doing it
mid-feature would red batches 5–10 by design.

### 7.4 Every assertion has exactly one owning task

Three ids were owned twice in v1.0, each in two files, with nothing saying which conjunct lived where —
so two concurrent agents could each write "their half" as they read it and leave a conjunct uncovered
with both files green, while producing two jest tests of one name in one run (§1.3). Resolved:

| Id | v1.0 | v1.1 |
|---|---|---|
| AT-30 … AT-34 | RLH-19 "queue half" and RLH-25 unqualified, both batch 3 | **Split by what is asserted, not by file order.** RLH-19 owns the *mechanism* — `rewriteStatus` / `updateQueueStatus`, the `_git` commit, each commit-failure branch, driven against the module — as `RLH-AT-30-module` … `-34-module`. RLH-25 owns *reach* — which halting exit of `orchestrate-dev` arrives at the committing write and what it reports when the commit fails — as `RLH-AT-30-orch` … `-34-orch`. TSPEC §8.3 assigns the range to both files, so the split is per conjunct, not per file |
| AT-64 | RLH-17 (`pipelineWiring.test.js`) and RLH-31 (`runtimeBundle.test.js`) | **RLH-31 alone**, which is what TSPEC §8.3 assigns. RLH-17's parameter-list assertion is a real and useful precondition, but it is not AT-64 and it must not carry the id: it is `RLH-WIRE-01` |
| AT-61 | one id, greened at batch 10 by §4's column and batch 13 by §7's row | **Two tests**, `RLH-AT-61-loop` and `RLH-AT-61-report`, both in `pacingWrapper.test.js` (RLH-21 remains sole owner of the file), greening at batches 7 and 10 respectively |

### 7.5 Assertions that are not FSPEC ATs

Five groups of assertion in this PLAN guard a TSPEC interface, a PLAN decision or the test harness itself
rather than an FSPEC acceptance criterion, so they have no `AT-{N}` to inherit. They are named and
countable anyway, because §12.3's checklist has to be mechanically checkable: **`RLH-WIRE-01`** (RLH-17),
**`RLH-LOOP-01`**, **`RLH-LOOP-02`** and **`RLH-LOOP-03`** (RLH-22), **`RLH-REPORT-01`** (RLH-29),
**`RLH-SCAN-01`** (RLH-31), and **`RLH-SKILL-01` … `RLH-SKILL-09`** (RLH-04, one per row of TSPEC §7.4,
nine files). **Fifteen** assertions — 1 + 3 + 1 + 1 + 9 — each listed in §7.3 like any other.

**The count has moved twice and both moves are recorded here rather than overwritten.** v1.1 said
"fourteen" and had mis-added; v1.2 corrected it to **thirteen** (1 + 2 + 1 + 9), which both round-3
reviewers independently re-derived and confirmed. v1.3 makes it **fifteen** by *adding two assertions*, not
by re-counting: **`RLH-LOOP-03`**, the grep-shaped oracle that finally falsifies §11.5's single-computation
rule (TE `F-05` — an `H-q` halt with nothing able to red on it), and **`RLH-SCAN-01`**, the await scan
mechanism's own oracle (TE `F-03` — the mechanism decides the answer, so it is tested rather than trusted;
§9.2 item 3).

They are **not** ATs and must not be renumbered into the FSPEC's range, which is exactly why §12.3's two
AT-counting rows do not reach them: §12.3 therefore carries **its own row naming all fifteen**, added at
v1.2 and extended at v1.3. Without it `RLH-34` could certify a tree in which `RLH-LOOP-01` — §11.5's oracle
for the `N-a` threading shape — and all nine `RLH-SKILL-*` were absent.


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
| O-2 | §5.2 | RLH-05 (e) |
| O-3 | §5.8 | RLH-05 (f) (`parseResolvedMarker`, `extractRecommendation`), RLH-26 (`checkPostmortem` at step G) |
| O-4 | §6.5 | RLH-20 |
| O-5 | §3.5 | RLH-18 (`defaultRecordHalt`), RLH-32 (both entrypoint suppliers) |
| O-6 | §5.6 | RLH-23 |
| O-7 | §5.9 | RLH-16 |
| O-8 | §5.5 | RLH-16, RLH-26 |
| O-9 | §3.1, §5.7 | RLH-18 (`main()` + `meta.inputs`), RLH-05 (f) (`parseForcePhases`), RLH-26 (precedence), RLH-32 (build edit 1) |
| O-16 | §7.1, §7.2, §3.9 | RLH-27 (the five §7.1 edits), RLH-32 (the four §7.2 edits) |
| O-17 | §5.1, §5.3, §4.3 | RLH-05 (d) (§5.3's digest family) and RLH-05 (f) (§4.3's record parsers), RLH-26 (§5.1's extraction) |
| O-18 | §5.4 | RLH-26 |
| O-19 | §4.8, §5.6, §8.3 | RLH-05 (constant placement), RLH-21 (the behavioural oracles). `MAX_AUTHORING_WRITE_BYTES` has **no** oracle and no task pretends otherwise |
| O-20 | §5.6, §6.6 | RLH-08 (the per-section cadence stated to authors), RLH-23 (no git operation on the pacing path may discard uncommitted work), RLH-30 (the advisory proxy line) |
| O-21 | §4.4 | RLH-09 (harvest emits the section), RLH-26 (the script appends the anchors) |

### 8.2 Defect → mechanism → first falsifying test → task

Carried from TSPEC §9.2, with the task column added.

| Defect | Mechanism (TSPEC) | First falsifying test | Task that fixes it |
|---|---|---|---|
| **H-1** — round index always 1 | `deriveRoundWindow`'s `max(present) + 1` (§5.2), passed at all seven `reviewLoop` call sites **including the forced path** | AT-01; **AT-01a** for the forced path | RLH-05 (e) (derivation) + RLH-26 (the seven call sites) |
| **H-2** — non-terminal exit, no POSTMORTEM | corrected `postmortemPath`, `_checkFile` confirmation, `_recordHalt`, the two conditional halt shapes (§6.3, §6.4); G-INV for the refusal half | AT-22; **AT-13a** for G-INV totality | RLH-27 (+ RLH-26 for the gate, RLH-20 for the row commit) |
| **H-3** — 180 s stall kills a monolithic write | `dispatchAndVerify`'s terminal-first-then-progress loop, per-episode counters and mode (S-INV), the resume prompt (§5.6) | AT-35; **AT-43a** for per-episode mode and budget | RLH-23 (+ RLH-08 for the authoring-side pacing contract) |
| **H-4** — approved phase re-run from scratch | the two-tier approval search + `isStale` (§5.4, §5.5) | AT-08 | RLH-26 (+ RLH-16, RLH-05 (d)) |

**H-2 and H-3 each need a prompt-side task as well as a code-side one**, and that is the one place this
feature's fix is not entirely mechanical: the persisted records of TSPEC §4.4 exist only if the agents
write them, so `RLH-07`/`RLH-08`/`RLH-09` are load-bearing for H-2 and H-4 respectively even though
they change no code. §10 is about how that half is verified.

## 9. The C-2 runtime gate

C-2 is **a build-time gate, not a review note.** TSPEC §1.4 owns the constraint and §8.5 owns the two
tests; this section states only which task makes them green and what an agent must not do to get there.

### 9.1 What the constraint forces on every source task

TSPEC §1.4 owns the constraint in full — the `export const meta` rule, the forbidden identifiers and
the closed host-global list. It is cited, not restated. What follows is only what it forces here.

Consequences every source task must honour, and none of them is negotiable at implementation time:

- a new capability arrives **only** as an injected seam on `main()`'s destructured options object, with
  a Node default so jest can exercise the module directly (RLH-18) and an adapter implementation for
  the bundle (RLH-32). There is no second way;
- `sha256Hex` is hand-rolled pure JS over a hand-rolled `utf8Bytes`, using `Math`, `>>>`, `|`, `^` and
  `Number` only — no `BigInt`, no `crypto`, no `TextEncoder` (RLH-05 (d)). It is **not** a seam and takes no
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

**The rulings that keep RLH-AT-19 off correct source are owned by TSPEC §8.5 and cited, not restated
here.** §8.5's table gives three predicates over syntactic position — **alias**, **returned promise**
(which covers the anonymous-arrow case: an arrow body is an arrow body whether the arrow is named or
not), and **awaited combinator argument**, added at TSPEC v1.6. Read them there. §8.5 also states the
meta-rule that makes them durable: they are predicates over *position*, the `file:line` citations are
evidence that each is exercised, and a call site matching none of them is a **failure the assertion
names** — never a fourth clause naming a line.

Three things about them this PLAN adds, because they are process statements TSPEC §8.5 is silent on:

1. **The scan is clean at HEAD — every non-`await`ed site is classified — and `RLH-01` checks *that*, at
   batch 1** (§4.1). The observed site set and its size live in **§4.1's advisory row and nowhere else in
   this document**; they are not restated here, in §7.3 or in §12.3. Corrected at v1.3, and the correction
   is the *shape*, not the arithmetic: v1.1 asserted one site, v1.2 asserted three and said
   `orchestrate-queue.js` had none, and **both were wrong the same way** — a hand-carried enumeration
   installed as a blocking premise in four places at once. The number is now advisory (five at HEAD, §4.1)
   and a correct new wrapper cannot halt the plan.
2. **An *unclassified* site is blocking work; a *correctly exempt* one never is** — and v1.2's wording
   here ("a fourth site is blocking work") was wrong on exactly that point: sites four and five
   (`orchestrate-dev.js:1569` and `orchestrate-queue.js:524`) are shipped, correct and exempt under §8.5's
   returned-promise ruling, and v1.2's text told an implementer who scanned correctly that they were
   blocking work. **Withdrawn and restated.** For a genuinely unclassified site, `RLH-AT-19`'s
   permitted-red window is empty (§7.3 row 1) and §11.3 `H-h` forbids loosening the assertion, so the only
   legal responses are a source fix or a **TSPEC amendment adding a ruling as a predicate** — the route
   v1.6 took for `:615–616` and v1.7 used again to *withdraw* `race`/`any`.
3. **The scan mechanism — decided here, and owned by `RLH-31`.** TSPEC §8.5 prescribes a mechanism only
   for the two `process`/`fetch` regexes and is deliberately silent on the await half, so this PLAN
   decides it; the mechanism is a test-construction choice, not a contract (TSPEC v1.7's §0 says so).
   **Decision: a bracket-depth walk over source text, file-local and unexported inside
   `runtimeBundle.test.js`. No parser, no new dependency.** In three steps:
   (a) mask string literals, template literals, regex literals and comments, so no delimiter inside them
   is counted; (b) build the scan set — the thirteen names, each name's `main()`-destructured local alias
   read from the destructuring pattern, and each named wrapper whose whole body is a call of an
   already-in-set name (fixed-point, so `agentFn` enters via `rawAgentFn`); (c) for each call site of a
   scan-set name **not** lexically preceded by `await`, walk *backwards* from its offset maintaining a
   stack of unclosed `(` / `[` / `{` to find the enclosing context, and decide the three rulings from it —
   returned promise (the nearest non-whitespace token before the call is `=>` or `return`), awaited
   combinator argument (the innermost unclosed delimiter is `[`, its own enclosing unclosed delimiter is
   `(`, the callee before that `(` awaits every element per §8.5, and that callee is lexically preceded by
   `await`), alias (already discharged by (b)).
   **Why not a parser.** `pdlc/workflows/package.json` declares **`jest` alone**; `@babel/parser` and
   `esprima` are present only transitively under `node_modules`, so either would be an undeclared
   dependency — and §11.4 `H-n` halts on a new runtime dependency. Against that, the walk needed here is
   small and its input is known-shaped: two files, top-level functions unindented, no nested combinator
   calls anywhere at HEAD. It also **stays honest about its own limits** — a shape it cannot decide is an
   unclassified site, which fails loudly (item 2), never a silent pass. There is **no existing structural
   source scan in this repo to reuse** (answering TE Q-02: `scanLines` is markdown-fence-aware and is
   *product* code this feature adds, `driftGenerators.js` is a generator library; neither does delimiter
   depth over JS), so this is written, not cited.
   **The mechanism has its own oracle: `RLH-SCAN-01`** (`RLH-31`, batch 2, §7.3 row 1, §7.5). It drives
   the walk over inline literal source fixtures — one per ruling, plus a masked-delimiter case, plus a
   shape matching no ruling — and asserts the classification of each, so the scanner is tested rather than
   trusted. This exists because **the mechanism decides the answer**: a line-local scan, an alias-blind
   scan and a structural scan return three different site sets, which is how the count in §4.1 was wrong
   twice. `RLH-AT-19` asserts the property; `RLH-SCAN-01` asserts that the thing asserting it works.

And the trap `RLH-AT-19` must **not** fall into: the assertion's name set is **FSPEC AT-19's closed
thirteen-name list**, restated once in TSPEC §8.5 and cited — never re-enumerated — from here. It is
**not** a set derived from `main()`'s parameter list. A derived set reds on the shipped, correct source:
`_now` is a clock called synchronously at four sites in `raisePrAndVerifyCi`, and `_phaseDodEnabled` /
`_phasePubEnabled` are booleans never called at all.
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

The after-feature counts are **TSPEC §8.5's** — read them there. `RLH-01` records the before-figures at HEAD so the after-figures are *checked*
rather than asserted.

## 10. SKILL amendments and how each is verified

Nine prompt files change (TSPEC §7.4). They are **prompt text, not code**, and they cannot be
unit-tested the way a module can: no test can assert that an Opus agent reading an amended SKILL will in
fact emit the trailer. What a test *can* assert is that the instruction is present, unambiguous and
byte-consistent with the grammar the script parses. That is the whole of the verification available, and
saying so plainly is better than implying a stronger guarantee.

### 10.1 The three verification layers, per amendment

| Amendment | Owner | L1 — the instruction is present | L2 — the script's parser accepts what the SKILL asks for | Runtime — the only true test |
|---|---|---|---|---|
| review SKILLs emit `## Verdict` as the file's **last** section in TSPEC §4.4's grammar | RLH-07 | `skillFiles.test.js` asserts each of the three files contains the section template and the words "last section" | `approvalSearch.test.js` parses a fixture **copied from the SKILL's own template** through §5.1's `parseVerdict` path | a real review dispatch writes a parseable verdict |
| author SKILLs end every response with `REVISION-COMPLETE: yes\|no` as its **last line**, and observe the pacing contract | RLH-08 | `skillFiles.test.js` asserts the literal `REVISION-COMPLETE:` and both permitted values appear in each of the three files, and that the per-section-commit cadence and the `MAX_AUTHORING_WRITE_BYTES` figure are stated | `pacingWrapper.test.js` drives `parseRevisionComplete` over responses shaped exactly as the SKILL instructs, and over each of the four `TRAILER_FAILURES` shapes | a real authoring dispatch reaches terminal in a revision episode |
| `harvest-learnings` emits `## 6. Approval Record`, copying anchor lines **verbatim and never recomputing** | RLH-09 | `skillFiles.test.js` asserts the heading, the six column names in order, and the explicit "copy, never recompute" instruction | `approvalSearch.test.js`'s tier-2 fixture is the SKILL's own table shape | a real harvest produces a tier-2 record a later run can read |
| `orchestrate-dev` documents the POSTMORTEM lifecycle and the `RESOLVED:` marker | RLH-09 | `skillFiles.test.js` asserts the marker literal and that it is described as **human-written only** | `haltAndQueue.test.js` drives `parseResolvedMarker` over the documented shapes | — |
| `orchestrate-queue` documents that a `halted` row is committed | RLH-09 | `skillFiles.test.js` asserts the statement | `orchestrateQueue.test.js` asserts the commit actually happens | — |

`RLH-09` must additionally keep `__tests__/orchestrateDevSkill.test.js` green — that suite already
asserts properties of `pdlc/skills/orchestrate-dev/SKILL.md` and is not owned by this feature.

### 10.2 The known drift risk, and why this PLAN does not claim to detect it

TSPEC §10.2's **Q-09** names and binds it: §5.9's per-class heading lists live in the workflow script,
the templates authors follow live in the SKILLs, and the two can drift.

**v1.1 builds no drift detector, and no task in §4 is asked to.** v1.0 implied otherwise twice, and both
are removed: §12.3 carried a "heading fixtures byte-identical to the SKILL templates" row **no task could
satisfy**, and §11.3's `H-j` presupposed a test that would fire on drift. `RLH-12`'s fixtures are a
**point-in-time copy** — they pin `isComplete`'s matcher against a real template shape and detect **no
later SKILL edit** whatever. A real detector must parse nine SKILL files for heading blocks, judge which
are templates, and compare them against a list inside a bundle that cannot `import` (§9.1): that is a
feature with its own REQ. It is bound to `docs/_queue/QUEUE.md` **Order 9**, beside TSPEC Q-09 and
`P-Q-05`.

What this feature does instead, and this is the whole of it: `RLH-04`'s `RLH-SKILL-01`…`-09` assert each
amendment's **presence and grammar**, so a silent revert reds (§10.1 layer 1); `RLH-12`'s fixtures pin the
template shape at the moment they are written; and the residual gap — a SKILL heading edited *after*
`RLH-12` — is **announced, not covered**. Anyone editing a §5.9 heading list or a SKILL template updates
the other in the same commit. That instruction is the mitigation; there is no test behind it, and this
PLAN does not pretend there is.

### 10.3 The one thing prompts cannot be held to

`MAX_AUTHORING_WRITE_BYTES` has **no oracle** (TSPEC §4.8, T-Q-03): nothing in the runtime measures the
bytes an agent emits per tool call. It is stated in the prompt and enforced only by agent compliance,
corroborated by §6.6's **advisory-only** commit-diff proxy, which `RLH-30` reports and which never
halts. No task in this PLAN attempts to enforce it, and none should — the only stronger control
available under C-2 is to halt the pipeline on an oversized commit, which converts a stylistic violation
into an outage and would fire on a legitimately large section.

## 11. Halt conditions

**An `se-implement` agent halts and reports rather than guesses whenever any row below fires.** The
default is not "make a reasonable choice"; the default is **stop and say what is missing**. This
feature's own history is the argument: the residual defects that survived four review rounds were all
consistency failures, and every one of them would have been caught earlier by someone declining to
reconcile two statements on their own authority.

### 11.1 Halt — the TSPEC is silent, and the choice is observable

| # | Condition | Why guessing is worse than halting |
|---|---|---|
| H-a | A behaviour is needed that no TSPEC §3/§4/§5/§6 section specifies, and the choice is **observable** in a return value, a persisted record, a report line or a halt message | An invented observable becomes a de-facto contract that no reviewer approved and no AT covers |
| H-b | Two TSPEC statements about the same rule disagree | Reconciling them silently picks a winner. **Report both citations.** This is the exact failure class §1.2 describes |
| H-c | A closed catalogue (`LIST_FAILURES`, `FILENAME_FAILURES`, `HASH_FAILURES`, `TRAILER_FAILURES`, `VALID_VERDICTS`, the six doc types, the seven `forcePhases` tokens) needs a value it does not contain | Adding a value to a closed catalogue changes a DC-01 contract on both sides. Never widen one locally |
| H-d | A halt-message or report string would contain an un-substituted `{…}` placeholder and the TSPEC does not supply the substitution | AT-55 forbids it, and this is precisely H-2's original shape |

### 11.2 Halt — a claim about existing code does not hold

| # | Condition | Action |
|---|---|---|
| H-e | Any `RLH-01` pre-flight assertion fails | **Halt the whole PLAN at batch 1.** Promote the absent item to blocking work; do not proceed to batch 2 with an unmet premise. This is the gate's only purpose |
| H-f | A §7.1 or §7.2 anchor literal is absent, or occurs **more than once** | Halt. A multi-match anchor means the edit is ambiguous and a `replace_all` would corrupt a second site. Report the literal and the match count |
| H-g | A symbol the TSPEC says exists does not (or has a different shape) | Halt and report the symbol, the expected shape and the measured one. Do **not** create the symbol to satisfy the citation — the TSPEC's claim is what is wrong, and it needs a spec revision, not a workaround |

### 11.3 Halt — a guard test reds and the temptation is to loosen it

| # | Condition | Action |
|---|---|---|
| H-h | `RLH-AT-19` reds on source the agent believes correct | **Halt.** Do not widen the regex, do not add a name to an exemption list, do not switch the closed thirteen-name set to a derived one. Report the exact call site and the classification the test gave it. §9.2 explains why this test in particular must not be loosened |
| H-i | `RLH-AT-64` names a parameter that falls in neither class | Halt. Either the parameter is a real seam that is unwired (fix the wiring) or the predicate has drifted (a spec question). **Do not add a name-based exemption** — the predicate is deliberately not a list of names |
| H-j | a `completeness.test.js` heading fixture no longer matches the SKILL template it was copied from | **Not a halt — and not a detected condition.** Nothing in this feature watches for it (§10.2). If a human notices, fix both sides in one commit and say which. Do **not** bolt a fixture-versus-SKILL comparison onto `completeness.test.js` under cover of this feature: that is Order 9 work, and a half-built detector is worse than the recorded gap |
| H-k | The suite's single permitted failure changes identity — the red is no longer `documentOracles.test.js` `AT-22 [red-until-L-06]` | Halt. Never delete or `skip` that placeholder to get green; it is another feature's deferral marker (§2.1) |
| H-l | `build-runtime.mjs --check` exits non-zero and a rebuild does not fix it | Halt. Something outside `dist/` is generating differently. Do not hand-edit `dist/` — §3.1 |

### 11.4 Halt — scope

| # | Condition | Action |
|---|---|---|
| H-m | The work appears to require a **new source file** under `pdlc/workflows/` | Halt. TSPEC §2.2 rules this out with a stated cost argument (a fifth module means a new `wrapModule` call, entries in both bundle composition arrays, a new `exportedNames` list and a cross-module reference idiom nothing in the tree uses) |
| H-n | The work appears to require a new runtime dependency, a `crypto` call, a `TextEncoder`, or an `import` in a bundle | Halt. C-2 forbids all four; §9.1 |
| H-o | The work appears to require touching `docs/_queue/QUEUE.md`, any `CROSS-REVIEW-*` file, the REQ, the FSPEC or the TSPEC | Halt. Those are out of scope for Phase I; a needed spec change is reported, not made |
| H-p | The work appears to require per-worktree consumer state, a history walk on the approval path, an agent on the approval path, or a cache over `_listFiles` | Halt. All four are in TSPEC §2.6's "deliberately not built" list, each with its reason |
| H-q | A task implements either interface shape of **§11.5** differently from the decision recorded there — `reviewLoop`'s two sibling fields, `checkConverged`'s three positional arguments, the single gate-side computation of `endIndex`, or `N-b`'s non-exported unnamed search | Halt. §11.5 decided both **before batch 1** precisely because the tests that encode them are written in batch 3 by a single owner (§5.3) and cannot be renegotiated by a batch-8/9 task. **Every clause of this row has a named oracle that reds on the violation** — `RLH-LOOP-01` (field shape and gate), `RLH-LOOP-02` (return shape, positional order, the rendered window), `RLH-LOOP-03` (the single computation, added at v1.3 because that clause previously had none: a recomputation inside `reviewLoop` from the `startIndex` it was handed yields an identical value and no behavioural oracle can see it). The halt is what stops the red being "fixed" by editing the oracle. Report the shape built and the shape decided; a genuine case for the other shape is a **PLAN** revision, not a local choice |

### 11.5 Two interface shapes — **decided here**, not deferred to a task

TSPEC §10.3 leaves both to implementation. v1.0 nominated a task to decide each, and in both cases that
task ran **after** the batch-3 task that writes the test encoding the decision (`reviewLoop.test.js` is
written whole by `RLH-22` in batch 3, and §5.3 forbids a second writer). A note asking tasks to agree does
not fix that; deciding in the PLAN does. **Both are decided below. Neither is open. Picking the other
shape in Phase I is a halt under §11.4 `H-q`, not a judgement call** — v1.1 pointed at "a §11.4 scope
halt" when §11.4 held no such row; v1.2 adds the row rather than deleting the pointer, because the
condition is real and `RLH-LOOP-01`/`-02` catch it as a red without saying what to *do* about it.

**N-a — how `startIndex` / `endIndex` reach `reviewLoop` and `checkConverged`.** The two functions have
**different** approved signature shapes, so one answer cannot serve both, and v1.1's "`checkConverged`
receives it the same way" was wrong on that point. v1.2 states them separately.

***`reviewLoop`* — two sibling fields on the existing options object.** `reviewLoop` already takes one
destructured options object (TSPEC §3.9) and `iteration` already rides on it, so `startIndex` and
`endIndex` **extend** that object rather than changing its shape; `iteration` keeps its meaning and its
`= 1` default. Rejected: a new record type for two integers; positional arguments (seven call sites,
silent on a wrong order); a field on `EpisodeKey` (which is compared for equality, and these are loop
control, not episode identity).

***`checkConverged`* — two additional positional arguments, because §3.9 pins it positional.** TSPEC §3.9
gives `checkConverged(loopResult, phaseId, phaseLabel, recordPhase)` and says it "gains `feature`" **and,
in the same row, that "the literal `5`s become `MAX_REVIEW_ROUNDS` / `startIndex..endIndex` per §7.1"** —
so §3.9 already contemplates the function reading both indices and is simply silent on the channel.
Deciding the channel is this PLAN's job (§11.1 `H-b` applies only when the choice is *observable and
unstated*; here it is unstated but the enclosing shape is pinned). Decision: **positional, after
`feature`** —
`checkConverged(loopResult, phaseId, phaseLabel, recordPhase, feature, startIndex, endIndex)`, arity four
to seven, at all seven call sites. Rejected: converting it to an options object (that *would* contradict
§3.9's pinned positional signature, and §3.9 wins — §1.2); carrying the two indices as new fields on
`loopResult` (§3.9 pins that return shape as gaining `postmortemWritten` and `trailerReason`, and nothing
else, so two more fields is the same contradiction one indirection away); and letting `checkConverged`
re-derive `endIndex` from `MAX_REVIEW_ROUNDS` (a second derivation is exactly what the single-computation
rule below exists to forbid).

The known cost of positional here is the one that made it wrong for `reviewLoop`: `startIndex` and
`endIndex` are both integers, so a swapped pair is silent at the type level. It is **not** silent at the
assertion level, and that is the mitigation: `RLH-LOOP-02` drives a case with `startIndex ≠ 1` and
`startIndex ≠ endIndex` and asserts the rendered `rounds {startIndex}..{endIndex}` text, so a swap, a
duplicated argument or a missing one is a named red.

**`endIndex` is computed exactly once, at the phase gate**, as `startIndex + MAX_REVIEW_ROUNDS - 1`
(TSPEC §7.1 edit 3), and passed to both functions; **never recomputed inside `reviewLoop` and never inside
`checkConverged`.** §7.1 edit 3 stays where TSPEC §7.1 anchors it — inside `reviewLoop`, as the gate
`if (iteration > endIndex)` — but under this decision that site *reads a parameter* and performs no
arithmetic; the arithmetic named in edit 3's Edit cell happens at the gate.

**And that rule now has something that can falsify it: `RLH-LOOP-03`** (new at v1.3; `RLH-22`, batch 3,
green from batch 8 — §7.3, §7.5, and a matching §12.3 row). Until v1.3 the rule was three statements, an
`H-q` halt and an owner, with **no assertion able to red on the one violation that matters**: a
recomputation inside `reviewLoop` from the `startIndex` it was handed produces an **identical** value, so
`RLH-LOOP-01`'s gate passes, `RLH-LOOP-02`'s rendered window text passes, and every AT passes. An
unfalsifiable halt condition is enforcement by eyeball, which is the standard this feature exists to
replace. The oracle is mechanical and is the **same construction §12.3 already uses for `selectMode`** —
over `orchestrate-dev.js`'s source text, the literal `MAX_REVIEW_ROUNDS - 1` occurs **exactly once**, and
that occurrence lies **outside** the source spans of `reviewLoop` and `checkConverged` (span = the
function's declaration line to the next `}` in column 0; every top-level function in this file is
unindented, so the span is decidable without the depth walk of §9.2 item 3). It **reds at HEAD** with zero
occurrences, so it is a genuine red-then-green, not a green-on-arrival tautology.

This is also the clause an implementer is most likely to violate innocently, which is why it earns an
oracle rather than a deletion: **TSPEC §7.1 edit 3 anchors the arithmetic inside `reviewLoop`** (enclosing
symbol `reviewLoop`, distinctive literal `startIndex + MAX_REVIEW_ROUNDS - 1`) while this section relocates
it to the gate. Answering TE Q-01: that relocation is a **PLAN** decision the TSPEC tolerates rather than a
§7.1 amendment, because §7.1's Edit cell for edit 3 names *two* things — the gate comparison
`if (iteration > endIndex)` and the derivation of `endIndex` — and only the first is anchored to
`reviewLoop` by the enclosing-symbol rule; §3.9's approved row leaves the channel to implementation
(§13.1 `P-Q-02`) and §10.3 `T-Q-02` says so outright. So edit 3 splits across `RLH-26` (the derivation, at
the gate, batch 8) and `RLH-27` (the comparison, inside `reviewLoop`, batch 9), both halves land, and
`RLH-LOOP-03` is what proves the derivation did not land twice. No TSPEC change is taken for this.

**Ownership, so no part of this is unowned work** (v1.1 left the gate-side arithmetic with no task):

| Work | Owning task | Batch |
|---|---|---|
| compute `endIndex` once at the phase gate; pass `startIndex` **and** `endIndex` at all seven `reviewLoop` call sites; write **all three** new arguments — **`feature`**, `startIndex`, `endIndex` — at all seven `checkConverged` call sites (v1.3 adds `feature` here: it was the one value with no named owner, and arguments 6 and 7 cannot be written without argument 5 — PM `L-02`) | **`RLH-26`** | 8 |
| `reviewLoop` destructures both fields; the gate becomes `if (iteration > endIndex)` reading the parameter (§7.1 edit 3's comparison half, no arithmetic at the site) | **`RLH-27`** | 9 |
| `checkConverged` grows the **three** positional parameters (`feature`, `startIndex`, `endIndex`) and renders `rounds ${startIndex}..${endIndex}` (§7.1 site 1) | **`RLH-27`** | 9 |

**The one-batch interim this creates, stated rather than left to be discovered.** At batch 8 the call
sites pass `startIndex`/`endIndex` that `reviewLoop`'s batch-9 signature does not yet destructure. That is
**benign and accepted**: they arrive as extra properties on an options object, which is ignored, and
`reviewLoop` keeps its pre-feature `if (iteration > 5)` until edit 3's comparison half lands at batch 9. It
is also why **`RLH-LOOP-01` greens at batch 9, not 7** — §7.3's row was corrected to `9 / 3–8 / RLH-27` at
v1.3. v1.1's `7 / RLH-23` was correct for v1.1's shape; v1.2 moved the destructuring here and left the
ledger row behind, which would have made `RLH-LOOP-01` red outside its window at the batch-7 and batch-8
gates — a §11.3 regression halt caused by bookkeeping. **The alternative was considered and rejected:**
folding `reviewLoop`'s destructuring and gate into `RLH-23` (batch 7) would keep the row at 7, but it
splits `reviewLoop`'s signature across two writers *and* leaves the gate reading an `endIndex` that no
call site supplies for a whole batch — `iteration > undefined` is always false, i.e. a live loop with no
termination gate, in a window where twenty-plus `RLH-AT-*` assertions are green. The interim above is
inert; that one is not.

**One name, two bindings — answering PM Q-02.** Inside `reviewLoop`, `startIndex` is both the new
destructured parameter and a field of `refreshReviewState`'s per-episode result, which TSPEC §5.6.1
declares block-scoped as `{ present, reviewFiles, startIndex } ← await refreshReviewState()`. **The
parameter is the loop-control value and the only one `endIndex` relates to; the refresh result's field is
episode-local and must be destructured under a distinct local name** (e.g. `refreshedStartIndex`) rather
than shadowing the parameter. This is a naming rule, not a behaviour change — the gate compares
`iteration` against the parameter-derived `endIndex` either way — but shadowing would make a reader unable
to tell which binding a later edit reads, which is this feature's own defect class. `RLH-LOOP-01` pins
which binding `endIndex` relates to by asserting the gate over a `startIndex` passed in, with a refresh
returning a *different* index. **`H-q` deliberately does not name this rule** (answering PM Q-02): `H-q`'s
shapes are *interface* decisions a later task could renegotiate, and this is a local naming choice with no
interface consequence — shadowing changes which binding the gate reads, which `RLH-LOOP-01` already reds
on, and the halt row would add nothing the oracle does not already supply. The omission is a decision, not
an artefact of drafting order.

**Oracles.** All three are written by `RLH-22` in batch 3, before every implementing task, so none needs a
dependency on one; §7.3 is the single authority for their windows and this paragraph does not restate them
beyond naming the greening task. **`RLH-LOOP-01`** (green from batch **9**, by `RLH-27` — see the interim
note above) asserts `reviewLoop`'s field shape, `iteration` at every call site, and termination on
`iteration > endIndex`; it reds on every rejected `reviewLoop` form. **`RLH-LOOP-02`** (green from batch 9,
by `RLH-27`) asserts the return shape *and* `checkConverged`'s rendered window text, so it reds on every
rejected `checkConverged` form and on a swapped index pair. **`RLH-LOOP-03`** (green from batch 8, by
`RLH-26`) is the single-computation oracle above.

**N-b — the name of §5.4's two-tier approval search.** Decision: **non-exported, and no test may name
it.** `RLH-24`'s `approvalSearch.test.js` drives it through `main()` at L2, which is why `AT-08`…`AT-11`,
`AT-56` and `AT-57` can be written in batch 3 against an unnamed function — the assertions are about
which files are read and which verdict is reached. `RLH-26` may pick any name; it exports nothing, so no
§9.1 rule and no `RLH-AT-64` parameter class is touched. A later need to import it is a TSPEC change
request.

## 12. Verification

### 12.1 Per-task gate

Every task, before it commits:

1. Its own test file(s) run under **`cd pdlc/workflows && npm test -- <file>`** — the only invocation that
   can run a suite in this directory at all, per §2.3, which owns the rule. **Never bare `npx jest <file>`:
   measured at HEAD it fails the suite with `Cannot use import statement outside a module`, `Tests: 0
   total`, exit 1**, so under it no task in this PLAN — green or red — can satisfy this step, and a RED
   task's failure would be a module-parse error rather than its oracle.
   - a **GREEN** task: the file passes.
   - a **RED** task: the criterion is **assertion-level, not suite-level** — the suite *runs*, and exactly
     the named `RLH-AT-*` / `RLH-*` assertions §7 assigns to this task fail, each on **its own oracle**
     (the subject does not exist yet, or exists in the pre-feature shape). A suite that fails to *run*, or
     a failure anywhere else in the file, is not a valid red.
2. If it touched a tracked source under `pdlc/workflows/`: `node pdlc/workflows/build-runtime.mjs`, then
   `node pdlc/workflows/build-runtime.mjs --check` exits 0, and `dist/` is staged in the **same commit**.
3. Every injected-seam call it added or moved is lexically preceded by `await` (§9.2) — checked by eye
   before RLH-AT-19 checks it mechanically.
4. Its commit message names the task id.

### 12.2 Per-batch gate

1. `cd pdlc/workflows && npm test`, **run in the background or with a >300 s timeout** (§2.3).
2. Result satisfies §2.2: 1038 passed / 1 failed **/ skipped exactly 70** — an equality, not "or
   better" — the one failure still `documentOracles.test.js` `AT-22 [red-until-L-06]`, **plus only those
   assertions whose §7.3 `Permitted red` window contains the current batch.** Read that column; the rule is
   not restated here. **And every in-window assertion must be *present* and either red-as-expected or
   green: `RLH-*` and `RLH-AT-*` are all executed, none is skipped, and a skip is not a green** (v1.3, TE
   `F-04`). "1038 / 1 / 70 or better" was under-specified in exactly one direction and it is the direction
   this repo makes easy — see the third erosion below.
3. `node pdlc/workflows/build-runtime.mjs --check` exits 0.
4. No file outside §5's manifest was modified.

**Why this gate cannot be defeated by a run that executes nothing** (answering TE Q-02, and the reason
§2.3's correction does not weaken anything here). Step 2 asserts **absolute counts** — a run that executed
zero tests fails it — and §7.3's ledger is keyed on **named assertions**, never on a process exit status.
So the batch gate is structurally immune to a vacuous or non-executing run, whichever way the tooling
fails; only §12.1's per-*task* gate ever depended on a single-file invocation, which is why §12.1 step 1
names the working one. **Three things would erode step 2**, and the third was missing until v1.3: a suite
silently leaving jest's match pattern; a `--passWithNoTests` path appearing; and — the one this repo makes
reachable — **a skipped assertion, which is neither red nor green.** A `test.skip`, `describe.skip` or
`it.todo` on an `RLH-AT-*` or `RLH-*` assertion satisfied all of v1.2's criteria at once: the pass count is
unchanged or higher, no failure appears, and §7.3's window is **never consulted** because the assertion is
not red — while §2.2's "no *new* failures" is silent on it too, so the two statements of the exit criterion
were not equivalent for a skipped test. An unimplemented or stubbornly-red assertion could therefore be
switched off at batch 3 and ride through twelve batch gates as permitted, caught only by `RLH-34` at the
end — the fail-late shape §7.3's per-assertion regranulation exists to remove. This is not theoretical
here: the baseline already carries **70 skipped** tests and a `globalSetup`/`globalTeardown` skip-sink
harness (`__tests__/helpers/skipSinkSetup.js`, `skipSinkTeardown.js`), so skipping is an established local
idiom rather than an exotic act. Hence step 2's skip criterion is an **equality** and its assertion
criterion is *present and executed*, not merely *not failing*. The absolute counts remain the argument for
asserting counts rather than "green"; they were simply not sufficient on their own.

Batches 2 and 3 are RED-terminal (§2.2) and their gate is the split wording: **the new `RLH-AT-*` tests
fail for the stated reason and every pre-existing test still passes.**

### 12.3 Definition of Done — the checklist `RLH-34` runs

**Behaviour and tests**

- [ ] All 66 FSPEC ATs plus `RLH-AT-01a`, `RLH-AT-13a`, `RLH-AT-43a` are implemented under their
      `RLH-`-namespaced jest names, in the files TSPEC §8.3 assigns.
- [ ] Every task row in §4 is ✅ and every AT in §7 is green.
- [ ] The **fifteen non-AT assertions of §7.5** — `RLH-WIRE-01`, `RLH-LOOP-01`, `RLH-LOOP-02`,
      **`RLH-LOOP-03`**, `RLH-REPORT-01`, **`RLH-SCAN-01`**, `RLH-SKILL-01` … `RLH-SKILL-09` — all exist
      under those exact jest names and are green. They are deliberately outside the AT-counting rows above,
      so this row is the only thing that requires them. (Thirteen at v1.2; `RLH-LOOP-03` and `RLH-SCAN-01`
      were added at v1.3 — §11.5 and §9.2 item 3 respectively.)
- [ ] **No `RLH-*` or `RLH-AT-*` assertion is skipped**, and the suite reports **exactly 70** skipped —
      the baseline's own count. A skip is not a green (§12.2 step 2, the third erosion).
- [ ] The seven property tests of TSPEC §8.2 exist, one per parameterisable component, each declaring a
      literal seed through `resolveSeed`, each L1.
- [ ] Full suite against §2.2: **no new failures**, the one permitted red unchanged in identity.
- [ ] No test reads `pdlc/workflows/dist/` to make a claim about source behaviour (TSPEC §8.4, L2), and
      no L3 test injects anything.
- [ ] No L1 test touches the filesystem.

**Generated artifacts and distribution**

- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits 0.
- [ ] `git status` shows no uncommitted change under `pdlc/workflows/dist/`.
- [ ] `pdlc/workflows/dist/distribution-manifest.json` records the **bumped** plugin version (§3.4).
- [ ] `pdlc/hooks/scripts/sync-workflows.sh` then `--check` exits 0 — run by **bare path**, no `bash`
      prefix; an exit 126 means the execute bit was lost. **`.claude/workflows/` is not committed**, and
      `git status` confirms it is untracked.
- [ ] `RLH-AT-19`: both anchored regexes match zero times in both bundles; the await-discipline scan is
      clean over `orchestrate-dev.js` **and** `orchestrate-queue.js` source, meaning **every non-`await`ed
      thirteen-list call site is classified by one of TSPEC §8.5's three rulings**. No site may be
      classified by a clause naming a line number (§9.2). **This row asserts the classification, not a
      count** (v1.3): the observed site set is §4.1's advisory row and is neither restated nor re-counted
      here, and a correctly-exempt site that did not exist at authoring time does not fail this row.
- [ ] `RLH-SCAN-01`: the scan mechanism's own oracle is present and green, so `RLH-AT-19`'s answer rests on
      a tested scanner rather than a trusted one (§9.2 item 3).
- [ ] `RLH-AT-64`: every `_`-prefixed `main()` parameter is wired or exempt; both anti-rot clauses hold;
      `_recordHalt` is satisfied by `QUEUE_ENTRY`'s `_runPipeline` closure **and** `DEV_ENTRY`.
- [ ] Each bundle: `export const meta` first and a pure literal, no other `export`, no `import`.

**Contract integrity — the consistency checks this feature exists to earn**

- [ ] `ListFailure`'s dispositions are applied **unchanged at every call site** — the phase-entry
      derivation and `refreshReviewState` alike — and at both call sites the three non-benign values
      produce **one and the same halt shape**, the one TSPEC §6.2 row 2 fixes (cited, not restated:
      TSPEC §4.2, §6.2 rows 1/2/17).
- [ ] `selectMode` is the **only** producer of `EpisodeKey.mode`; grep confirms no other assignment.
- [ ] `endIndex` is derived **exactly once**: the literal `MAX_REVIEW_ROUNDS - 1` occurs once in
      `orchestrate-dev.js` and outside the source spans of `reviewLoop` and `checkConverged` — the same
      grep-shaped construction as the row above, and `RLH-LOOP-03` is the assertion that carries it
      (§11.5, §11.4 `H-q`).
- [ ] `refreshReviewState` is called at **every** wrapped episode entry and there is **no** pre-loop
      snapshot; `reviewLoop` takes **no** seed maps.
- [ ] Every path that reaches `reviewLoop` passes step G (**G-INV**); the `FRESH` branch calls
      `checkPostmortem` for **reporting only** and cannot change the outcome.
- [ ] The digest is computed by exactly one function, canonicalising **internally**; no call site
      canonicalises.
- [ ] `_appendFile` is append-shaped everywhere; no site implements it as read-modify-write.
- [ ] `parseVerdict` and `recoverVerdict` are **unchanged**; `recoverVerdict` is not reached from the
      approval path.
- [ ] `driftGenerators.js` is unmodified and no second generator library exists.
- [ ] Every operator-facing string is fully substituted (AT-55).

**Prompts and version**

- [ ] All nine SKILL amendments of TSPEC §7.4 are present and asserted in `skillFiles.test.js`;
      `orchestrateDevSkill.test.js` is still green.
- [ ] `pdlc/.claude-plugin/plugin.json` `version` is bumped.

**Documentation**

- [ ] `CLAUDE.md`'s pdlc section still describes the shipped behaviour — in particular the model-selection
      and hooks tables, if a task's change made either stale. If nothing there is stale, record that it
      was checked.

### 12.4 What `RLH-34` may not do

It may not fix anything. A failing checklist row re-opens the owning task from §5's manifest, in its own
batch, with its own commit. A verification task that patches its own findings destroys the only
independent signal in the plan.

## 13. Open questions

Everything here is a place the **TSPEC is silent or deliberately incomplete**, recorded so Phase I does
not mistake silence for licence. Nothing here blocks the start of batch 1.

v1.1 shortened this section rather than annotating it. Two entries were never open — the TSPEC already
pins them, and v1.0 misread it (§13.1). Two more were real interface choices that v1.0 deferred to tasks
running *after* the tests encoding them, so they are **decided in §11.5** and appear here only as a
pointer (§13.1a). What remains in §13.2 is accepted incompleteness, and closing it is out of scope.

### 13.1 Not open — the TSPEC already pins these

Both were listed as open against the TSPEC's own text, and each nominated a closer running after the code
it was meant to shape. Removed as questions; the pinned contract is recorded so nobody reopens them.

| Was | The pinned contract | Where |
|---|---|---|
| "`forcePhases` — array or `Set`?" | **Neither is a choice.** `main()`'s `forcePhases` is a **raw, unparsed operator string** (TSPEC §3.1 annotates it so); `parseForcePhases(raw)` returns `{ ok: true, phases: Set<string> }` or `{ ok: false, badTokens: string[] }`. No array exists anywhere. v1.0's nominated closer `RLH-30` also ran after every task that touches it | TSPEC §3.1, §3.7 |
| "Where is `refreshReviewState`'s `ListFailure` disposition applied?" | **Inside `refreshReviewState`**, above the `deriveRoundWindow` call — TSPEC §5.6.1's pseudocode places it there literally (`dir_missing` → empty listing, anything else halts, both before the window is derived). v1.0 assigned the question to `RLH-15`, which wrote no listing code, and cited `AT-30`…`AT-34` as the net — but TSPEC §8.3 assigns that range to the queue-row commit | TSPEC §5.6.1; `RLH-23` in §4 |


### 13.1a Decided in this PLAN, not in a task

| # | Question | Decision |
|---|---|---|
| P-Q-01 | The **name** of §5.4's two-tier approval search | Non-exported, and **no test names it**. §11.5 `N-b` |
| P-Q-02 | How `startIndex` / `endIndex` are **threaded** | Two channels, one per callee, both decided in §11.5 `N-a`: **`reviewLoop`** takes two sibling fields on its existing options object (oracle `RLH-LOOP-01`); **`checkConverged`** takes two additional **positional** arguments after `feature` (oracle `RLH-LOOP-02`, which reds on a swapped pair). `endIndex` is computed **once**, at the phase gate, by `RLH-26` |

Both were decided in the PLAN rather than in a task because the test that encodes each one is written in
batch 3 by a single owning task, and every task v1.0 nominated as the decider ran later (§11.5).

### 13.2 Accepted incompleteness — do **not** try to close these

| # | Item | Disposition |
|---|---|---|
| P-Q-05 | **TSPEC T-Q-03 — `MAX_AUTHORING_WRITE_BYTES` has no oracle.** Nothing under C-2 measures the bytes an agent emits per tool call; §6.6's commit-diff proxy is advisory only. So no test can prove the constant is *obeyed*, only that it is *stated*. | Accepted and **bound to `docs/_queue/QUEUE.md` Order 9**. Assert the constant's placement and its appearance in the authoring brief; do **not** invent enforcement, and do **not** escalate the advisory proxy into a halt — TSPEC T-Q-03 rejects that explicitly (it would fire on a legitimately large section). |
| P-Q-06 | **TSPEC T-Q-04 — `isComplete`'s placeholder detection is deliberately shallow.** A body consisting solely of a fenced block containing `TBD` scores non-empty. FSPEC v1.5 declined the fix because a fence-aware test reintroduces the §16.2 ↔ rule 5 coupling that caused v1.4's false-halt regression. | **Accepted, carried knowingly.** `RLH-16` implements §5.9 as written and must not add fence awareness. What bounds a badly behaved episode is §4.5's per-episode counters, not this test. |
| P-Q-07 | **TSPEC Q-05 and Q-09** — both explicitly bound to `docs/_queue/QUEUE.md` **Order 9**. | **Out of scope. Do not reopen in Phase I.** If implementation appears to need either resolved, that is a halt (§11.4), not a licence to decide them here. |
| P-Q-08 | **`AT-22 [red-until-L-06]`** in `documentOracles.test.js` is an intentional pre-existing red owned by another feature. | Not this feature's to fix. It is the *identity* of the one permitted failure in §2.2's gate; changing it invalidates the baseline. |

### 13.3 Risks this PLAN carries knowingly

- **The suite is already past the 180 s watchdog** (§2.3). Measured at **185.43 s** wall for v1.1, and
  the trend across three measurements of the same HEAD is upward-noisy, not stable. Mitigation is
  procedural — background invocation is **mandatory**, not advised — and explicitly *not* shortening the
  suite. Every task this feature adds makes the margin worse; the projection after the feature is
  **190–200 s**. If a batch gate is killed, re-run it in the background and record the wall time in the
  batch commit so the trend stays visible.
- **SKILL.md / fixture drift** (§10.2). `completeness.test.js`'s heading fixtures are a point-in-time
  copy of the SKILL templates and **detect no later SKILL edit**. No task in this feature builds a
  detector, no checklist row claims one, and the gap is bound to `docs/_queue/QUEUE.md` **Order 9**
  beside TSPEC Q-09. v1.0 attributed a byte-identity assertion to `RLH-31`, which asserts nothing of the
  kind — that claim is withdrawn.
- **Ten serialised source-lane commits** (§3.2). The critical path is long by construction: every
  tracked-source commit must rebuild `pdlc/workflows/dist/` in the same commit (TSPEC §7.3), so the lane
  admits one task per batch. v1.1's merges took it from thirteen to ten. A task that discovers it must
  also touch `orchestrate-dev.js` out of turn **moves**, it does not fork — a second writer in a batch is
  a §11.4 halt.

## 14. Changelog

| Version | Date | Change |
|---|---|---|
| **v1.0** | 2026-07-30 | Initial PLAN. 34 tasks across 16 batches, derived from TSPEC v1.5 (§3 interfaces, §4 data model, §5 algorithms, §7 edit sites, §8 test strategy, §9 traceability) with **no** behaviour restated — every rule is cited. Establishes: the §2.1 baseline (**1038 passed / 1 failed / 70 skipped**) and the "no new failures" exit criterion; the §3.2 serialisation rule (no two tasks in one batch may edit any tracked source under `pdlc/workflows/`, because each must rebuild `dist/` in the same commit); the `RLH-AT-{N}` test namespace, avoiding collision with the pre-existing intentional red `AT-22 [red-until-L-06]`; single-owner-per-test-file with a `Greened by` column; §5's file-ownership manifest; §7/§8's task→AT and task→FSPEC-obligation traceability; §9's C-2 build-time gate including the await-discipline scan; §10's SKILL-amendment verification; §11's halt conditions; §12's Definition of Done; §13's open questions. Phase D was assessed and deliberately skipped — there is no DECISIONS document, by design. |
| **v1.1** | 2026-07-30 | Round-1 cross-review revision (PM 1H/3M/5L, TE 3H/5M/2L). **31 tasks across 13 batches** (was 34/16). No REQ, FSPEC or TSPEC change — every finding was editorial to this PLAN. Per-finding disposition in §14.1, **audited and corrected at v1.2** — five of its claims were overstated or false. |
| **v1.2** | 2026-07-30 | Round-2 cross-review revision (PM 1H/3M/7L, TE 3H/3M/3L). **Task count, batch count, DAG, `Deps` edges, ledger arithmetic and file ownership are unchanged** — both reviewers re-derived them independently and found them clean, and v1.2 does not reopen them. **One TSPEC amendment, and only one: TSPEC v1.6** adds the awaited-combinator-argument ruling to §8.5, forced by a measurement (`orchestrate-dev.js:615–616`); REQ and FSPEC untouched. Everything else is a correction to this PLAN. Per-finding disposition in §14.2. |

### 14.1 v1.1 — disposition of every round-1 finding

No REQ / FSPEC / TSPEC change: both reviewers confirmed every finding is editorial to this PLAN.

**Product manager.** F-01, F-02 **fixed** — neither P-Q-04 nor P-Q-03 was open; questions deleted, the
pinned contracts cited in §13.1. F-03 **fixed by withdrawing the claim** (§10.2; see TE F-03). F-04
**fixed by deletion** — §9.1's C-2 sentence and host-global list, §9.2's thirteen-name list, §9.3's
counts, `RLH-14`'s literal and §12.3's halt string are now citations; the exempted checklist rows and
baseline figures are kept. F-05 **fixed** (batch 3 is ten, §1.1/§4.2). F-06 **fixed structurally** — the
per-file column is gone, `AT-15/16/18` get a §7.3 row greening at **batch 8** (`batch 6` here was a
mis-transcription of the staleness conjunct's batch; the row itself always said 8 — **corrected at v1.2**).
F-07 **partially fixed at v1.1, completed at v1.2** — v1.1 fixed `RLH-17`/`RLH-18`/§9.3 to five seams plus
`forcePhases` as data but left §6.3 saying "the six new seams"; PM re-filed it as `L-01` and v1.2 fixed
§6.3 (**claim corrected at v1.2**). F-08 **fixed** — §11.5 `N-b` decides the name. F-09 **fixed** —
`RLH-26` now owns §5.1's three steps and the fail-closed duplicate-`VERDICT:` pre-count. Batching
judgement **adopted in the form that pays**: `RLH-10/13/15` fold into `RLH-05`, but `RLH-16` stays
separate because `RLH-12`'s fixtures land in batch 4 and folding it in would have *cost* a batch — three
batches saved. The `RLH-23/26/27` merges are **declined**, as recommended. Q-01 answered (the mitigation
is not a property and v1.1 stops calling it one); Q-02 answered (§5.3 now states that every unlisted
pre-existing suite needs no change, with the spot-check); Q-03 answered (G-INV integrity is the
unconditional tiebreak — `RLH-26` is not split, and wall time does not buy a split).

**Test engineer.** F-01 **partially fixed at v1.1, completed at v1.2** — §7.3 is a **per-assertion** ledger and the
gate's only authority; `RLH-AT-19`/`-20` are green on arrival with **no** permitted-red window and
`RLH-AT-64`'s window is bounded to batches 4–10. TE re-derived all 23 rows as arithmetically correct. But
row 1's premise was **one** measured await site where there are **three**; TE re-filed it as round-2 `F-01`
and v1.2 fixed it (three sites, TSPEC v1.6's fourth ruling, `RLH-01` checks it at batch 1) — **claim
corrected at v1.2**. F-02 **fixed by deciding both shapes in the PLAN**
(§11.5), with `RLH-LOOP-01` as `N-a`'s oracle and real `Deps` edges rather than a note. F-03 **fixed** —
no detector is claimed, the unowned §12.3 row is deleted, `H-j` is rewritten, §13.3's `RLH-31`
attribution withdrawn, and the gap is bound to `QUEUE.md` Order 9. F-04 **fixed** — `AT-30…34` split per
conjunct (`-module` / `-orch`), `AT-64` is `RLH-31`'s alone per TSPEC §8.3, `RLH-17`'s assertion renamed
`RLH-WIRE-01` (§7.4). F-05 **fixed** — one row per assertion, and `AT-61` splits into `-loop` (7) and
`-report` (10), which was the contradiction. F-06 **fixed** — five names, not six. F-07 **fixed** — neither of the two questions it named (`forcePhases`'s shape, the `ListFailure`
disposition's placement) was open; both are recorded as pinned TSPEC contracts in §13.1. (v1.1 wrote
"fixed throughout §7.3, §8.1, §8.2" here, which describes a different finding's remedy — **claim corrected
at v1.2**; TE independently verified the actual remedy as "Fixed, and better than I asked for".) F-08
**fixed and re-measured** — **five** runs of one HEAD (v1.1 wrote "three"; §2.3 records five, so **"three"
→ "five", corrected at v1.3** — v1.2 made this correction by *deleting* the word rather than annotating it,
which is outside the audit's own stated method and is PM round-3 `L-03`; the resulting sentence was true,
the method was not), **185.43 s** wall, 190–200 s projected, background invocation **mandatory**, suite not
shortened. F-09 **fixed** — batch 3 is ten, critical path thirteen nodes. **F-10
was NOT fixed, and v1.1's "fixed as filed" was false** — no shared domain-generator module was created and
no acceptance of per-file generators was stated. TE re-filed it as round-2 `F-07`. v1.2 resolves it by
**deciding and stating** per-file domain generators (§7.2, §5.2, §6.3), i.e. the second of the two remedies
TE offered — **claim corrected at v1.2**. Q-01 answered in §7.3's closing note (the queue bundle's unwired `_git`, batches 5–10, accepted —
and why not to widen `RLH-AT-64`); Q-02 answered in §9.2's third ruling row (an anonymous arrow is exempt
and passes its obligation to nobody) — **that row was deleted at v1.2 in favour of a citation and the
answer was not added to the cited section, so between v1.2 and v1.3 this claim pointed at nothing** (TE
round-3 `F-06`); the answer now lives in the owning section, TSPEC §8.5's returned-promise row (v1.7), and
the citation resolves. **Claim corrected at v1.3.** Q-03 answered by §7.5's `RLH-`-namespaced ids — **thirteen**, not the "fourteen" v1.1 wrote, and
§12.3 did not in fact count them separately until v1.2 added the row (**claim corrected at v1.2**).

### 14.2 v1.2 — disposition of every round-2 finding

**One spec change, and it is named:** TSPEC **v1.6** adds one ruling row to §8.5 (TE `F-01`). REQ, FSPEC,
`docs/_queue/QUEUE.md` and every `CROSS-REVIEW-*` file are untouched. Nothing else in this round required
a spec change.

**The measurement both reviewers took, and which v1.1 got wrong.** Bare `npx jest <file>` reports
`Tests: 0 total` **and exits 1**, with `Test Suites: 1 failed` / `Cannot use import statement outside a
module`. v1.1 asserted `exits 0 — a vacuous green`. Re-measured for v1.2 at HEAD: **exit 1**. The hazard is
therefore that the bare invocation **cannot run these ESM suites at all**, not that it passes silently —
and the corrected statement is *weaker* in one direction (no gate here is defeatable by a vacuous green)
and *sharper* in the other (a parse error masks a RED task's real oracle). Restated at §2.3 and §4.1;
§12.1 now uses `npm test -- <file>`.

#### Test engineer

| Id | Sev | Disposition |
|---|---|---|
| **F-01** | High | **Overstated — "fixed" was wrong on the count, and "completed at v1.2" in the audit table below was wrong with it. Corrected at v1.3** (§14.3, PM `N-01` / TE `F-01`): the ruling and the mechanism were right, the arithmetic over them was not, and the sentence immediately following — "Verified TE's measurement myself" — names the defect exactly. **A number was verified rather than re-derived from the ruling**, which is why v1.1's one, v1.2's three and the queue-zero were all wrong; v1.3 re-derives **five** from the predicate and demotes the count to advisory evidence. The original v1.2 disposition follows, unedited: **Fixed, and it is the one finding that was not editorial.** Verified TE's measurement myself: exactly **three** non-`await`ed thirteen-list call sites at HEAD — `orchestrate-dev.js:615`, `:616`, `:1867`; `orchestrate-queue.js` none. Read `orchestrate-dev.js:600–630` and `runtime-adapter.js:67`. **Conclusion: the source is correct and the guard was wrong.** `_parallel` resolves to `async function rtParallel(promises) { return await Promise.all(promises); }`, so the combinator supplies the await; putting `await` on each array element would **serialise a deliberately concurrent two-reviewer dispatch**, a behaviour change for no safety gain. Since the exemption predicate is owned by TSPEC §8.5, **TSPEC v1.6** adds a fourth ruling — *awaited combinator argument* — stated as a rule over **syntactic position** (the `G-INV` / E-1–E-3 construction), plus an explicit clause that the rulings are predicates and the `file:line` citations are evidence, not the definition, and a fix to §8.5's catch-all, which reached only *aliased* seams and so let an unaliased call fall through the whole section. §9.2 and §7.3 row 1 now **cite** §8.5 instead of restating it; §7.3 row 1 and §12.3 say **three** sites with each one's ruling; `RLH-01` gains a **blocking** pre-flight row asserting the count **and** the classification, so `RLH-AT-19`'s empty window rests on a checked premise at batch 1. `RLH-AT-19`'s window is unchanged (**empty**) because the resolution makes the assertion green at HEAD, which is what an empty window requires. |
| **F-02** | High | **Fixed.** §12.1 step 1 is `cd pdlc/workflows && npm test -- <file>`, citing §2.3 as owner. The RED criterion is restated at **assertion level**: the suite *runs* and exactly the named `RLH-*` assertions §7 assigns the task fail, each on its own oracle; a suite that fails to run is not a valid red. |
| **F-03** | High | **Fixed.** §2.3 and §4.1 both restate the measured behaviour; §4.1's row asserts suite-failed-to-run / `Tests: 0 total` / non-zero exit, so `H-e` no longer fires on a false premise. |
| **F-04** | Medium | **Fixed by dropping the split** — the first of the two options TE offered. The optional `-stale`/`-gate` split is withdrawn: it left the gate's sole authority with two window sets for three assertions and ids registered in neither §7.4 nor §7.5, and it does not decompose (FSPEC `AT-18` has no staleness conjunct, so it prescribed an empty `-stale` test). Cost: one batch of slack on `AT-15`/`-16`. Benefit: every id the ledger names exists in the run. |
| **F-05** | Medium | **Fixed both halves.** §7.5 reads **thirteen** (1+2+1+9) and no longer claims a §12.3 behaviour §12.3 lacks; §12.3 gains the row naming all thirteen, so `RLH-34` cannot certify a tree missing `RLH-LOOP-01` or the nine `RLH-SKILL-*`. |
| **F-06** | Medium | **Fixed.** §12.2 step 2 now cites §7.3's **`Permitted red`** column and restates no rule, so the `RLH-AT-64` batches-2–3 discrepancy and the "`Greened by` is nobody" unresolvable case both disappear. |
| **F-07** (round-1 F-10) | Low | **Fixed as a stated decision, and the false changelog claim corrected — the latter treated as the more serious half.** §7.2 now decides **per-file, file-local, unexported domain generators** over `driftGenerators.js`'s primitives, with four reasons (no common shape across the five domains; a shared module would cost a §5.3 owner plus five `Deps` edges and put a batch-2 file on `RLH-12`'s path; a drifting domain generator reds only its own property; a second *primitive* library remains forbidden) and a stated promotion path if a sixth caller appears. Recorded also at §5.2 and §6.3. §14.1's "fixed as filed" is marked false. |
| **F-08** | Low | **Fixed.** §4.2 reads "Batches 4–12" and states that batch 13 has no source-lane task, agreeing with §5.1's `dist/` range and §13.3. |
| **F-09** | Low | **Fixed.** §12.3's `ListFailure` row is a sentence again, with its citation intact. |
| **Q-01** | — | Answered by the F-01 resolution: **exempt**, and the evidence is `rtParallel`'s `await Promise.all`. |
| **Q-02** | — | Answered in §12.2, in one paragraph as suggested: the batch gate is structurally immune because step 2 asserts **absolute counts** and §7.3 keys on **named assertions**, never exit status; only §12.1's per-task gate ever depended on a single-file invocation. The paragraph also names what *would* erode it (`--passWithNoTests`, a suite leaving jest's match pattern). |
| **Q-03** | — | Answered: **thirteen**, and §12.3 now counts them (see F-05). |

#### Product manager

| Id | Sev | Disposition |
|---|---|---|
| **N-01** | High | **Fixed** — same remedy as TE `F-03`; "exits 0" and "a vacuous green" are deleted from both sites. |
| **N-02** | Medium | **Fixed** — same remedy as TE `F-02`. |
| **N-03** | Medium | **Fixed; `endIndex` now has exactly one owning task.** `RLH-26` (batch 8) owns the gate-side computation `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1` **and** the passing of both values at all seven `reviewLoop` call sites and all seven `checkConverged` call sites. `RLH-22`'s row no longer restates the in-loop formula: it describes `endIndex` as a **consumed parameter**, with the arithmetic attributed to `RLH-26`. `RLH-27` (batch 9) owns the two consuming signatures. §11.5's dangling enforcement pointer is fixed by **adding** the row rather than deleting the reference: §11.4 `H-q` covers building either §11.5 shape differently, and says the halt exists to stop a red being "fixed" by editing the oracle. §11.5 carries an explicit ownership table so the mapping is not inferred from prose. |
| **N-04** | Medium | **Fixed concretely, without a TSPEC change.** `checkConverged` gets **two additional positional arguments after `feature`** — `checkConverged(loopResult, phaseId, phaseLabel, recordPhase, feature, startIndex, endIndex)`. This is what TSPEC §3.9's own row requires: the same row says it "gains `feature`" **and** that "the literal `5`s become `MAX_REVIEW_ROUNDS` / `startIndex..endIndex` per §7.1", so §3.9 already contemplates both indices and is silent only on the channel. Rejected and recorded: converting it to an options object (contradicts §3.9's pinned positional shape); carrying the indices on `loopResult` (§3.9 pins that return shape as gaining `postmortemWritten` and `trailerReason` and nothing else); re-deriving `endIndex` inside it (a second derivation). The positional-swap risk PM's objection implies is mitigated at the assertion level: **`RLH-LOOP-02`** is extended to assert the rendered `rounds {startIndex}..{endIndex}` over a case with `startIndex ≠ 1 ≠ endIndex`, so a swap, a duplicate or a missing argument is a named red — and it is written in batch 3, before `RLH-27` in batch 9. `RLH-27`'s row names both values. |
| **L-01** | Low | **Fixed** — §6.3 reads "the **five** new seams … plus `forcePhases`, which is **data**". |
| **L-02** | Low | **Fixed** — the four wrong letters: §8.1 `O-2` → `(e)`, `O-3` → `(f)`, `O-17` → `(d)`+`(f)` with the §5.1 half attributed to `RLH-26`, §8.2 `H-1` → `(e)`. |
| **L-03** | Low | **Fixed** — same remedy as TE `F-09`. |
| **L-04** | Low | **Fixed** — same remedy as TE `F-05`. |
| **L-05** | Low | **Fixed** — same remedy as TE `F-06`. |
| **L-06** | Low | **Fixed by narrowing the claim, not by keeping the absolute.** (i) §4 now says no task row, `Deps` edge, ledger row or traceability cell names a retired id, that the surviving mentions in §4.2/§13.1/§14 are historical, and that a reference **as a live task** is stale. (ii) §9.3 no longer restates the two counts it says it does not restate — the parenthetical is deleted and the reader is sent to TSPEC §8.5. |
| **L-07** | Low | **Fixed** — same remedy as TE `F-04` (the split is withdrawn). |
| **Q-01** | — | Noted, not actioned here: `QUEUE.md` is outside this change surface and `H-o` forbids a Phase-I task touching it. Recorded for **Harvest**, which is the surface that survives this feature — the operator's `awaiting-merge` edit is a single moment and the Order 9 REQ author is the reader who needs the correction. §10.2's account, not `QUEUE.md`'s, is the accurate one. |
| **Q-02** | — | **Answered, and it produced a rule.** §11.5 now states that `reviewLoop`'s `startIndex` **parameter** is the loop-control value `endIndex` relates to, and that `refreshReviewState`'s per-episode `startIndex` field must be destructured under a **distinct local name** rather than shadowing it; `RLH-LOOP-01` pins which binding the gate reads by supplying a refresh that returns a different index. A naming rule, not a behaviour change — but shadowing is precisely the ambiguity this feature exists to remove. |
| **Q-03** | — | Confirmed deliberate: advisory below 300 s, blocking above. The row reads that way by design and is unchanged. |

#### Audit of §14.1 — what the round-1 changelog claimed that it should not have

TE's `F-07` made the general point: **a changelog asserting a fix that does not exist is the defect class
this feature exists to remove.** So every claim in §14.1 was re-checked against the tree, not just the one
TE named. **Five** claims did not survive; each is annotated in place at §14.1:

| §14.1 claim | Verdict | Correction |
|---|---|---|
| TE F-10 "**fixed** as filed" | **False** — no generator module, no stated acceptance | now recorded as not fixed at v1.1, fixed by decision at v1.2 |
| PM F-06 "`AT-15/16/18` get a §7.3 row greening at **batch 6**" | **False** — the row says batch **8**; 6 is the staleness conjunct's batch | corrected to batch 8 |
| PM F-07 "**fixed** — five seams plus `forcePhases`" | **Overstated** — §6.3 still said six; PM re-filed as `L-01` | corrected to partially fixed at v1.1, completed at v1.2 |
| TE F-01 "**fixed**" | **Overstated** — mechanism and all 23 rows correct, but row 1's premise measurably false | corrected to partially fixed at v1.1, completed at v1.2 |
| Q-03 "§7.5's **fourteen** ids" | **False** — thirteen, and §12.3 did not count them | corrected to thirteen, with §12.3's row added |

Claims that **did** substantiate, checked individually: PM F-01/F-02 (`P-Q-04`/`P-Q-03` deleted, contracts
in §13.1), F-03 (detector claim withdrawn at all five sites), F-04 (catalogues deleted, no load-bearing
rule lost — PM verified this independently), F-05 (batch 3 is ten), F-08 (`N-b` decides the name), F-09
(`RLH-26` owns §5.1's three steps and the pre-count), PM Q-01/Q-02/Q-03 (§5.3 does carry the unlisted-suite
statement and the spot-check; G-INV is recorded as the unconditional tiebreak at §4.2), the batching
judgement (both reviewers re-derived the `RLH-16` arithmetic), TE F-02…F-06, F-08, F-09 and Q-01/Q-02. One
further defect was found by the audit rather than by a reviewer: §14.1's **TE F-07** entry described the
wrong remedy ("fixed throughout §7.3, §8.1, §8.2" belongs to another finding); it is corrected to the
remedy TE actually verified.

**Byte count.** v1.1 → v1.2 grows the document. Neither reviewer filed the overage and both accepted the
stated trade, so **no compression pass was run for its own sake** and none of the rationale prose either
reviewer defended was cut. What *was* deleted is genuine redundancy: §9.2's three-row restatement of TSPEC
§8.5's ruling table (now a citation) and §9.3's restated counts. The growth is the §11.5 ownership table,
§7.2's generator decision, §12.2's immunity paragraph, and this section — a round that corrects five false
changelog claims cannot also be the round that shrinks the changelog.

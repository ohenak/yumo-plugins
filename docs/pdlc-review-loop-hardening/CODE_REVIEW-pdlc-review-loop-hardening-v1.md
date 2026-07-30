# CODE_REVIEW — pdlc-review-loop-hardening — v1

**Scope:** Definition of Done verification, Phase DOD round 1, for the feature
`pdlc-review-loop-hardening` on branch `feat-pdlc-review-loop-hardening` at HEAD `f093c14`.
The reviewed diff is `git merge-base origin/main HEAD` (`2763eec`) `..HEAD` — 107 files,
+40,653 / −1,913. Production surface reviewed: `pdlc/workflows/orchestrate-dev.js`,
`pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/runtime-adapter.js`,
`pdlc/workflows/build-runtime.mjs`, the generated `pdlc/workflows/dist/` artifacts,
`pdlc/.claude-plugin/plugin.json`, the nine amended `pdlc/skills/*/SKILL.md` prompts,
and `CLAUDE.md`. Tests and fixtures are reviewed as *evidence*, not as the subject.

**Role:** evaluator. This document records findings only. It fixes nothing; a separate
`se-implement` remediation pass acts on it and Phase DOD re-verifies.

**Method:** every claim below is derived from a command or from source read at HEAD
(DC-02). No finding rests on inference from a spec alone.

**Out of scope / already ruled on** (not re-raised): the permanent red
`AT-22 [red-until-L-06]`; FSPEC §16.3 vs TSPEC §5.9 on the terminal criterion;
FSPEC §16.5 vs TSPEC §5.9 on LEARNINGS completeness; the `VALID_VERDICTS` hoist;
the `RLH-AT-64` assertion change in `runtimeBundle.test.js`; CR F-4/F-5/F-6 (deferred
with named successors); `file:line` citation drift (R-6).

---

## 1. Verdict

**Definition of Done is MET. Nothing found in this round blocks DoD.**

Every mechanically checkable row of PLAN §12.3 that I could run, I ran, and each passed.
The suite reproduces the declared baseline exactly — `Tests: 1 failed, 70 skipped, 1168 passed,
1239 total`, the single red being the permitted `AT-22 [red-until-L-06]`, identity unchanged.
No new failures. Generated artifacts are fresh, the consumer copy is in sync, the tree is clean,
and `.claude/workflows/` is ignored rather than tracked.

Four findings, **all Low, none blocking**:

| Id | Severity | Blocks DoD? | One line |
|---|---|---|---|
| F-1 | Low | No | `reviewerSkillForSlug` ships dead — no caller, not exported, no test — while its doc comment claims it prevents a desynchronisation |
| F-2 | Low | No | `checkPrCi`'s unconditional `await import("child_process")` runs before the injected `execFn` is consulted, so the runtime's only CI-status path throws in a sandbox that has no dynamic `import` — **pre-existing on `origin/main`, untouched by this diff** |
| F-3 | Low | No | The bundles ship six dynamic-`import` sites while the build script and the `orchestrate-dev` SKILL both state the runtime forbids `import()`; the freshness guard only anchors on `/^import\s/m` |
| F-4 | Low | No | `CLAUDE.md` does not record that a **direct** `orchestrate-dev` invocation now writes *and git-commits* a `halted` row into `docs/_queue/QUEUE.md` |

F-2 and F-3 are one defect seen from two sides. F-2's live site is entirely pre-existing
(unchanged bytes on both ends of the seam), so per DC-08 it is deferred with a named successor
surface rather than folded into this feature. F-1, F-3's guard gap and F-4 are cheap and
in-scope, but none of them can make a shipped run behave wrongly, so none gates the phase.

I found **no** stub, no placeholder implementation, no mock or hard-coded data on a production
path, and no acceptance test that passes vacuously. The "claim that outlives its truth" pattern
this feature has already produced three times recurs twice more (F-1, F-3), both times in prose
about a guarantee rather than in the guarantee itself.

## 2. Verification performed

Step 0 (rebase) was already satisfied and was not re-run: the branch is 0 behind `origin/main`,
439 ahead, and the merge-base is `origin/main`'s current tip.

### 2.1 Suite

Run from a clean tree, via `npm test` (not bare `npx jest` — the package script supplies
`--experimental-vm-modules`, without which all 45 suites fail to parse):

```
Test Suites: 1 failed, 44 passed, 45 total
Tests:       1 failed, 70 skipped, 1168 passed, 1239 total
Time:        443.27 s
```

The single failure is `AT-22 [red-until-L-06]` at `__tests__/documentOracles.test.js:246`
(`coveredViolations(LIVE_ROOT)` returns one `.tokensave/tokensave.db` row) — the permitted,
identity-unchanged red of PLAN §7.3. Skipped count is the baseline's own 70, and every skip
is a capability guard (`hookCompatibility`: 6 bash-gated, `implPhase`: 2 git-gated,
`guardMatrix`: 3) or a `guardMatrix` `isLive` pending — **no `RLH-*` or `RLH-AT-*` name is
skipped**; `grep -rn "it\.skip|describe\.skip|xit\(|test\.skip|\.todo\("` over `__tests__`
returns only those. `git status --porcelain` is empty both before and after the run, so
`runtimeBundle.test.js`'s import-time rebuild of `dist/` changed nothing and AC-6.6's
`advertisedVersionViolation` oracle was not spuriously reddened.

### 2.2 Generated artifacts and distribution

| Check | Result |
|---|---|
| `node pdlc/workflows/build-runtime.mjs --check` | exit 0; all three rows `in-sync` |
| `pdlc/hooks/scripts/sync-workflows.sh --check` (bare path) | exit 0 — not 126, execute bit intact |
| `git status --porcelain` | empty |
| `.claude/workflows/` tracked? | no — `.gitignore:29` `/.claude/workflows/` |
| `pdlc/.claude-plugin/plugin.json` `version` | bumped `0.12.0` → `0.13.0` |
| `dist/distribution-manifest.json` `pluginVersion` / both `artifactVersion` | `0.13.0` — matches the bump |
| bundle structure | each begins `export const meta = {` as its first statement; `grep -c "^export "` = 1 per bundle; `not.toMatch(/^import\s/m)` holds (see F-3 for the dynamic-`import` gap) |

### 2.3 Assertion inventory

- `grep -rhoE "RLH-AT-[0-9]+[a-z]?"` over `__tests__` yields exactly **69** distinct ids:
  `RLH-AT-01`…`-66` plus `RLH-AT-01a`, `-13a`, `-43a`. The FSPEC's own id set is `AT-01`…`AT-66`.
  Nothing missing, nothing invented.
- All fifteen non-AT assertions of PLAN §7.5 are present under their exact names:
  `RLH-WIRE-01`, `RLH-LOOP-01`/`-02`/`-03`, `RLH-REPORT-01`, `RLH-SCAN-01`, `RLH-SKILL-01`…`-09`.
- The seven TSPEC §8.2 property components each have a literal-seeded `resolveSeed` call:
  `canonicaliseForDigest` + `sha256Hex` (`approvalHash.test.js:368`), `scanLines`
  (`scanLines.test.js:328`), `parseReviewFilename` + `deriveRoundWindow`
  (`roundDerivation.test.js:45`), `parseForcePhases` (`forcePhases.test.js:196`),
  `isComplete` (`completeness.test.js:545`).

### 2.4 Contract-integrity rows of PLAN §12.3

Each derived by grep or by reading the cited span, not inferred:

- **`endIndex` derived exactly once** — `MAX_REVIEW_ROUNDS - 1` occurs once in
  `orchestrate-dev.js`, at `:2204` (`return startIndex + MAX_REVIEW_ROUNDS - 1;`), outside both
  `reviewLoop` and `checkConverged`.
- **`selectMode` is the only producer of `EpisodeKey.mode`** — the three `mode:` *producers*
  (`:1440`, `:1458`, `:1478`) are all inside `selectMode` (`:1436`); the only other site,
  `:2699 mode: selection.mode`, reads what `selectMode` returned.
- **No pre-loop snapshot** — `refreshReviewState` (`:2346`) is called at `:2605` (episode entry)
  and `:3776`, both at entry; the `ListFailure` disposition sits above the `deriveRoundWindow`
  call and maps `dir_missing` → benign, everything else → halt, exactly once.
- **`_appendFile` is append-shaped everywhere** — the module default is
  `fsMod.appendFileSync` (`:3651`), the sole production call is
  `await _appendFile(path, "\nAPPROVAL-HASH: …\nREVIEWED-COMMIT: …\n")` (`:1975`), and the
  adapter's `rtAppendFile` prompt explicitly forbids read-modify-write. No site reads first.
- **`driftGenerators.js` unmodified** — `git diff` over `*driftGenerators*` is empty; no second
  generator library exists.
- **`parseVerdict` / `recoverVerdict` unchanged**, and `recoverVerdict` is not reached from the
  approval path (the approval path goes `refreshReviewState` → `extractFileVerdict` →
  `tier1ApprovalRecord`).
- **AT-55 substitution** — the only `{…}`-bearing operator strings are `PHASE_DISPATCH`'s
  `creatorOutputPath` templates, and the single consumer substitutes them
  (`:2841`, `.replace(/\{feature\}/g, featureName)`). `:3931`'s usage text shows the template
  deliberately.
- **`RLH-AT-64` seam accounting** — `rtDevInjections` supplies `_agent`, `_parallel`,
  `_pipeline`, `_phase`, `_log`, `_checkFile`, `_readFile`, `_checkCi`, `_mergeWorktree`,
  `_writeFile`, `_appendFile`, `_listFiles`, `_git`; `_recordHalt` is supplied per entrypoint
  by both `DEV_ENTRY` and `QUEUE_ENTRY`'s `_runPipeline` closure, exactly as the adapter's
  comment says. The adapter's claim that `_writeFile`'s adapter "existed since the first bundle
  but was never in this object" checks out against `origin/main`: `rtWriteFile` was defined at
  `runtime-adapter.js:99` there and `_writeFile` was absent from `rtDevInjections`.
- **The four `build-runtime.mjs` edits of PLAN §3.3** are all present, in the stated order, with
  `devModule` preceding `queueModule` in *both* bundles (the documented ordering hazard —
  `queueModule`'s prelude is `const realMain = __dev.main;`).

### 2.5 Prompts

The nine TSPEC §7.4 SKILL amendments land in nine files (`harvest-learnings`, `orchestrate-dev`,
`orchestrate-queue`, `pm-author`, `pm-review`, `se-author`, `se-review`, `te-author`,
`te-review`) and are asserted by `RLH-SKILL-01`…`-09` in `skillFiles.test.js`. Spot-reading
`pm-review/SKILL.md` and `orchestrate-queue/SKILL.md`, the prose is substantive, not
token-shaped: it states the grammar, the last-section rule, the fail-closed duplicate-`VERDICT:`
rule, and — for the queue — the two-`git`-invocation pathspec commit and the "commit failure
does not downgrade the halt" rule, all of which match the code at
`orchestrate-queue.js:930-970`.

## 3. Findings

<!-- filled in section 3 -->

## 4. Checked and clean

<!-- filled in section 4 -->

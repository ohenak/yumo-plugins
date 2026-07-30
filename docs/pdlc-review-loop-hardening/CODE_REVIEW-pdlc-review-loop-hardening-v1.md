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

### F-1 — `reviewerSkillForSlug` ships dead, and its comment claims a guarantee it cannot provide

**Severity: Low. Does not block Definition of Done.**

`pdlc/workflows/orchestrate-dev.js:2031` defines:

```js
function reviewerSkillForSlug(slug) {
  for (const skill of Object.keys(MAP)) {
    if (MAP[skill] === slug) return skill;
  }
  return null;
}
```

It has **no caller**, is **not exported**, and has **no assertion**. Measured:
`grep -rn "reviewerSkillForSlug"` over `orchestrate-dev.js`, `orchestrate-queue.js`,
`__tests__/` and `dist/` returns the definition, its two verbatim copies in the two generated
bundles, and one *comment* in `roundDerivation.test.js:11` — a batch-2 red-phase preamble
recording that the symbol did not yet exist. Nothing evaluates it.

The claim is in its own doc comment: the reverse accessor exists "so the filename grammar's
role alternation and the dispatch table cannot desynchronise" (TSPEC §3.9 uses the same
wording). With no caller and no test, nothing detects such a desynchronisation. The function is
inert and the sentence describing it is false about the shipped artifact.

**Falsifier.** Delete `reviewerSkillForSlug` entirely and rebuild: `npm test`,
`build-runtime.mjs --check` and `sync-workflows.sh --check` all stay exactly as they are now,
because no assertion and no production path reaches it. If that is *not* what happens, this
finding is wrong.

**Why it does not block.** Dead code cannot mis-execute; the guarantee that was never enforced
is not one this feature relies on anywhere else. The two acceptable remediations are (a) give
it the assertion TSPEC §3.9's rationale implies — a round-trip over `MAP` asserting
`reviewerSkillForSlug(reviewerRoleSlug(s)) === s` for every reviewer skill, which requires
exporting it — or (b) remove it and amend TSPEC §3.9. Either is a small, isolated change with
one owning test file (`roundDerivation.test.js`, PLAN §5.3).

### F-2 — `checkPrCi` dereferences `import()` before consulting its injected `execFn`, so the runtime's only CI path throws

**Severity: Low. Does not block Definition of Done.** Pre-existing on `origin/main`;
**not introduced, and not touched, by this diff.**

`pdlc/workflows/orchestrate-dev.js:2923-2925`:

```js
export async function checkPrCi(prUrl, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));
```

The dynamic import is **unconditional** — it is evaluated even when the caller supplied
`execFn` and `realExecSync` is therefore never used. The runtime's `_checkCi` is
`rtMakeCheckCi(devModule)`, whose body ends
(`runtime-adapter.js:144`) with exactly that call:

```js
return await devModule.checkPrCi(prUrl, { execFn: () => text });
```

The adapter's own header records the probe result: "probed 2026-07-27, the sandbox has NO
`import` (static or dynamic)". So in the workflow runtime this line rejects. There is no
`try`/`catch` anywhere on the path: `raisePrAndVerifyCi` calls `await _checkCi(prUrl)` at
`orchestrate-dev.js:3360` inside its poll loop with no guard, so the rejection propagates out
of Phase PUB and out of `main()`.

**Falsifier.** Invoke the generated `orchestrate-dev` bundle through the workflow runtime on a
branch with an open PR and let it reach Phase PUB. If Phase PUB reports a `ciStatus` rather than
dying on the first poll, then either the sandbox does have `import()` (the adapter's recorded
probe is stale) or something catches the rejection, and this finding is wrong.

**Why it does not block, and its successor surface (DC-08).** Both ends of the seam are
byte-identical to `origin/main`: `git show <merge-base>:pdlc/workflows/runtime-adapter.js`
already contains `rtMakeCheckCi` at line 134 and `_checkCi: rtMakeCheckCi(devModule)` at 187,
and `checkPrCi`'s first line is unchanged. It is therefore outside this feature's remediation
surface, and repairing it here would put an untested runtime-behaviour change into a DoD round.
It should be carried as **its own `docs/_queue/QUEUE.md` row** — the natural shape is "move the
`await import("child_process")` below the `execFn ?? …` fallback in `checkPrCi` and
`mergeWorktree`, and add the bundle-level assertion F-3 asks for", which is one source task plus
one rebuild. Recording it here is the point: it is exactly the class of defect
(a seam declared, supplied, and still unreachable on the real path) that this document exists to
surface.

### F-3 — the bundles ship six dynamic-`import` sites against a stated "no `import()`" constraint, and the guard does not look for them

**Severity: Low. Does not block Definition of Done.**

Three places assert the constraint:

- `pdlc/workflows/build-runtime.mjs:10` — "2. No `import` — static or dynamic."
- `pdlc/workflows/runtime-adapter.js:13-15` — "the sandbox has NO `import` (static or dynamic)".
- `pdlc/skills/orchestrate-dev/SKILL.md` (amended by this feature) — "`import` / `import()` /
  `process` / `fs` / `fetch` are all unavailable".

What actually ships: `grep -nE "[^a-zA-Z]import\(" pdlc/workflows/dist/orchestrate-dev.bundle.js`
returns **six** hits (`:3265`, `:4009`, `:4961`, `:5529`, `:5538`, `:5559`), and the queue bundle
carries the same set. `stripModuleSyntax` only filters lines matching `/^import\s.+;\s*$/`, i.e.
single-line *static* imports, so every `await import(…)` survives verbatim.

The guard is correspondingly narrow. `runtimeBundle.test.js:474` asserts
`expect(read(file)).not.toMatch(/^import\s/m)` — anchored at line start, so it cannot see
`  const { readFileSync } = await import("fs");`. `RLH-AT-19`'s bundle half asserts only
`/\bprocess\s*\./` and `/\bfetch\s*\(/`. Nothing in the suite asserts the `import()` half of the
constraint the two source files and the SKILL all state.

**Falsifier.** Add `expect(text.match(/[^A-Za-z0-9_$]import\s*\(/g) || []).toEqual([])` to the
`RLH-AT-19` bundle block. If it passes, this finding is wrong.

**Scope note, measured.** Four of the six sites pre-date this branch (`checkPrCi` and
`mergeWorktree` in `orchestrate-dev.js`; `defaultReadFile` and `defaultWriteFile` in
`orchestrate-queue.js` — confirmed by `git show <merge-base>:…`). The **two new** ones are the
`defaultGit` seams this feature added, one per module. Both new sites are unreachable in the
runtime, because `DEV_ENTRY` and `QUEUE_ENTRY` both supply `_git: rtGit`; they follow the
established dead-in-runtime pattern of the other `default*` seams and introduce no live
regression. The live site is F-2's, and it is pre-existing.

**Why it does not block.** No shipped path is broken *by this feature* on account of this. The
finding is that the constraint is asserted in prose in three places and enforced in none — a
guard gap, not a fault. Adding the assertion is a one-line test change; note that doing so will
red until F-2's site is fixed, so the two should land together, which is the second reason to
carry F-2 and F-3 as one successor row rather than as DoD remediation.

### F-4 — `CLAUDE.md` does not record that a direct `orchestrate-dev` run now git-commits a queue row

**Severity: Low. Does not block Definition of Done.**

`build-runtime.mjs`'s `DEV_ENTRY` now supplies, for a **direct** `orchestrate-dev` invocation:

```js
_recordHalt: async ({ feature, status }) =>
  __queue.rewriteStatus(__queue.DEFAULT_QUEUE_PATH, feature, status, rtReadFile, rtWriteFile, rtGit),
```

`rewriteStatus` writes `docs/_queue/QUEUE.md` and then calls `commitQueueRow`
(`orchestrate-queue.js:938`), which runs `git add -- {queuePath}` followed by
`git commit -m "chore(queue): {feature} → {status}" -- {queuePath}`. So a halted direct run
now creates a commit in the operator's repository. That is deliberate and specified (REQ
AC-2.7a; PLAN §7.2 edits 3+4) and it is documented in `pdlc/skills/orchestrate-queue/SKILL.md`,
which this feature amended with the full rule including the pathspec rationale and the
"commit failure does not downgrade the halt" clause.

`CLAUDE.md` was updated by this feature and updated well — the `## Verdict` contract, the
`APPROVAL-HASH`/`REVIEWED-COMMIT` anchors, the LEARNINGS shape, the POSTMORTEM `RESOLVED:`
lifecycle and the `forcePhases` object form are all now described. But its "Entry (single
feature)" bullet still describes a direct run purely in terms of the pipeline, and its queue
bullet still attributes the status lifecycle to `orchestrate-queue`. A reader of `CLAUDE.md`
alone would not expect `/pdlc:orchestrate-dev` to touch `docs/_queue/QUEUE.md`, still less to
commit.

**Falsifier.** Read `CLAUDE.md`'s "Artifact convention (for consuming repos)" section at HEAD
and find a sentence saying a direct `orchestrate-dev` invocation writes or commits a queue row.
There is none — `grep -n "queue" CLAUDE.md` attributes every queue write to `orchestrate-queue`.

**Why it does not block.** PLAN §12.3's documentation row asks that `CLAUDE.md`'s pdlc section
"still describes the shipped behaviour — in particular the model-selection and hooks tables".
Neither of those is stale (no model constant and no hook changed in this diff), so the row's
named obligations are met; this is an *omission* of newly-shipped behaviour, not a false
statement. One sentence on the "Entry (single feature)" bullet closes it.

## 4. Checked and clean

Recorded so a later round does not pay for this again, and so the absence of findings here is
evidence rather than silence.

### 4.1 Stubs, placeholders, TODO

`grep -rn "TODO|FIXME|XXX|HACK|placeholder|not implemented|NotImplemented|stub"` over
`orchestrate-dev.js`, `orchestrate-queue.js`, `runtime-adapter.js` and `build-runtime.mjs`
returns **no** unfinished work. Every hit is one of three benign classes:

- the two `// ─── Runtime API stubs (replaced by real runtime in production) ───` banners
  (`orchestrate-dev.js:3537`, `orchestrate-queue.js:469`) — the documented no-op globals the
  build replaces;
- `dodVerifyLoop`'s own prompt text, which enumerates stubs/mock data/unwired integrations
  because that is what it instructs `dod-verify` to hunt for, and its `stubs: 0` fields, which
  are parsed counters not placeholders;
- `isPlaceholderBody`'s `/^[_*`~\s]*(?:TBD|TODO)[_*`~\s]*$/i` (`:1251`) — the §5.9 rule that
  *detects* placeholder bodies.

### 4.2 Mock or hard-coded data on production paths

None. The two shapes worth suspecting were both checked and are correct:

- `commitQueueRow` returns the literal `{ queueRow: "halted" }` on success regardless of the
  status written (`orchestrate-queue.js:946`). This is not hard-coding: `rewriteStatus`'s
  contract documents `queueRow` as TSPEC §4.7's **row disposition** catalogue
  (`"halted" | "halted (uncommitted)" | "none" | "error"`), not as the status. The value is also
  never surfaced from the non-halt call sites — `orchestrate-queue.js:789`, `:802` and `:820`
  discard the return — so only `_recordHalt`'s value reaches a report, where `"halted"` is
  correct by construction.
- `PHASE_DISPATCH`'s `creatorOutputPath` templates are substituted at their single consumer
  (§2.4 above).

### 4.3 Unwired integrations

Every `_`-prefixed parameter of `orchestrate-dev.js`'s `main()` was enumerated against
`rtDevInjections` plus the two entrypoint templates. Thirteen are supplied by the adapter
object, `_recordHalt` by both `DEV_ENTRY` and `QUEUE_ENTRY`, and the remainder
(`_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`, `_phaseDodEnabled`,
`_phasePubEnabled`, `_now`, `_sleep`) default to in-module values that are themselves
agent-composite or literal — the E-1/E-3 forms `RLH-AT-64`'s `classifyExemption` recognises,
with the anti-rot clauses asserting that a parameter cannot be both wired and exempt and that
every exemption's evidence resolves. `rtDevInjections` is the only object the assertion reads
and it is read from `runtime-adapter.js` **as it ships**, so a seam added later without an
adapter cannot pass silently.

The queue side matches: `orchestrate-queue.js`'s `main()` declares `_agent`, `_readFile`,
`_writeFile`, `_git`, `_runPipeline`, `_log`, `_phase`, and `QUEUE_ENTRY` supplies all seven.
Its `_recordHalt` closure threads `rtReadFile`/`rtWriteFile`/`rtGit` explicitly into
`rewriteStatus`, so the queue's `default*` seams are unreachable in the runtime too.

The **one** genuine unwired-in-runtime path found is F-2's, and it is pre-existing.

### 4.4 Coverage — behaviour shipping without a test

No production behaviour ships untested. One observation, deliberately **not** raised as a
finding: four parsers — `parseApprovalHash` (`:838`), `extractFileVerdict` (`:888`),
`parseResolvedMarker` (`:953`) and `extractRecommendation` (`:988`) — are never named in any
test file. They are nonetheless covered, at two levels:

- their shared primitive `scanLines` is directly and property-tested, with the fence-aware
  edge cases pinned by dedicated fixtures (`__tests__/fixtures/cross-reviews/quoted-hash.md`,
  `quoted-verdict.md`, `unclosed-fence.md`, consumed at `scanLines.test.js:247/278/292`);
- their behaviour is exercised through `main()` by `approvalSearch.test.js`,
  `haltAndQueue.test.js` and `forcePhases.test.js`, which construct `APPROVAL-HASH:` and
  `RESOLVED:` inputs and assert the pipeline outcome those parsers determine.

That is integration coverage rather than unit coverage, which is a legitimate choice here (all
four are unexported and reachable only through the phase-entry derivation). It is recorded so a
future round does not mistake the naming gap for an untested surface.

### 4.5 No vacuous passes

`RLH-AT-19`'s source half carries an explicit vacuity guard —
`expect(sites.length).toBeGreaterThan(0)` before the classification assertion — so a scanner that
went blind would fail rather than pass over an empty set, and `RLH-SCAN-01` is the scanner's own
self-test, so the classification rests on a tested mechanism rather than a trusted one.
`RLH-AT-64` has the matching guard ("the seam set is derived from `main()`, and is not empty").
Both were checked by reading the assertions, not by trusting their names.

### 4.6 Dead code that is not this feature's

Two symbols are defined and never used, both **byte-identical on `origin/main`** and therefore
outside this diff: `orchestrate-queue.js:74 export const QUEUE_STATUSES` and
`orchestrate-queue.js:84 function haltError`. Recorded, not raised. (`reviewerSkillForSlug` is
the same shape but *is* new with this feature, which is why it is F-1.)

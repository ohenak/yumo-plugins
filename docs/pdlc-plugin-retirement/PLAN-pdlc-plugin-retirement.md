# PLAN — pdlc-plugin-retirement

**Artifact lineage**

| Slot | Documents |
|---|---|
| Upstream | `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.16) → `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.10) → `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.11) → `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.5) → **`docs/pdlc-plugin-retirement/PLAN-pdlc-plugin-retirement.md` (this document)** |
| Downstream | `docs/pdlc-plugin-retirement/PROPERTIES-pdlc-plugin-retirement.md` (Phase T — not yet written); the implementation commits Phase I lands from §2 |
| Cross-Reviews | `docs/pdlc-plugin-retirement/CROSS-REVIEW-pm-PLAN-pdlc-plugin-retirement-v{N}.md`, `docs/pdlc-plugin-retirement/CROSS-REVIEW-te-PLAN-pdlc-plugin-retirement-v{N}.md` (Phase P — not yet written) |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` (Phase H — not yet written) |
| Measured baseline | `docs/_constraints/pdlc-retirement-baseline.md` (M-1…M-11p, A-1 allow-list, partition closure) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc-plugin-retirement | Draft — awaiting Phase P cross-review | se-author | v0.1 | 2026-08-18 |

**Changelog**

| Version | Date | Change |
|---|---|---|
| v0.1 | 2026-08-18 | First draft. Thirteen commit classes of FSPEC §3.1 mapped onto 33 tasks over 27 batches, with DEC-07's erratum-6 gate and DEC-10's class-7/class-11 same-commit edge carried as explicit dependency edges. |

---

## 1. Summary

This feature deletes the pdlc **plugin's** workflow-runtime distribution channel — the
bundled runtime under `pdlc/workflows/dist/`, the consumer sync script, the drift
library and the drift hook — leaving `@kaneho/pdlc-engine` (`pdlc/engine`) as the sole
unattended execution host. The plugin keeps all fifteen skills (FSPEC L-10) and all four
surviving human-facing hooks (FSPEC L-4); its two orchestration skills become thin
delegators onto `pdlc dev <req-path>` / `pdlc queue` (TSPEC §3.3). The probe CLI
`pdlc/workflows/dist/pdlc-cli.mjs` survives at its current path (DEC-01, baseline M-9).

The plan is a **subtractive** one. Most of its work is deleting code while keeping the
suite green at every commit, so the shape below is unusual for this repo: very few new
modules, one new script, and a long serial chain of per-class commits whose ordering is
itself the specification.

### 1.1 What gets built (and unbuilt)

Streams are FSPEC §3.1's thirteen commit classes; the concrete edits per class are
TSPEC §2.9's class-to-change map.

| Stream | Scope | Where it lands (TSPEC) |
|---|---|---|
| 0 — pre-flight | Baseline M-row existence check; C-6 partition re-closure (T-1) | §6.3 T-1 |
| 1 — CI jobs | Two `pr-tests.yml` jobs and its index-mode steps removed; `publish.yml` tag-gate steps; `ci-arrangement.test.js`'s arrangement carrier; the CI prose in CLAUDE.md and `pdlc/OPERATIONS.md`; the two workflow-file count words | §2.9 class 1; FSPEC L-7, L-8 |
| 2 — engine drift coverage | `pdlc/engine/__tests__/smoke.test.js`, `fs-observation.test.js`, `fixtures/consumer-ac12/` | §2.9 class 2 |
| 3 — queue drift gate | `orchestrate-queue.js`'s drift gate and `distribution.checkEnabled` parse; `queueDriftGate.test.js` deleted; new `consumerCleanup.test.js` and its two fixtures; `SKIP_INVENTORY` row for TT-1b | §2.9 class 3; §5.5 |
| 4 — drift hook | `check-workflow-drift.sh` and its second `SessionStart` registration | §2.9 class 4 |
| 5 — drift library and sync | `lib/pdlc-drift.sh`, `sync-workflows.sh` | §2.9 class 5 |
| 6 — test corpus | 20 of M-8's 21 `*.test.js` modules plus `runtimeProvenanceWiring.test.js` deleted; six M-8 helpers deleted; `hookCompatibility.test.js` and `driftGenerators.js` reduced in place | §2.9 class 6; §4.4 |
| 7 — bundles and emission | `build-runtime.mjs` reduced to a single-row builder; M-4/M-5/M-10/M-6 deleted; M-11p bundle assertions removed | §2.3, §2.9 class 7 |
| 8 — ignore/worktree rows | `.worktreeinclude` row, `.gitignore` row and its rationale block | §2.9 class 8 |
| 9 — document oracles | `lib/document-oracles.mjs`, `documentOracles.test.js` D-1/D-2, `fixtures/covered-violations/` re-fixturing, the CLAUDE.md prose those oracles guard, plugin version `0.23.2` | §2.9 class 9; DEC-09 |
| 10 — wave-gate config | CLAUDE.md wave-gate **prose only**; `.claude/pdlc.config.example.json` values unchanged | §2.9 class 10; DEC-08 |
| 11 — skills and banners | Two delegator SKILL.md rewrites; `consolidate-learnings/SKILL.md`'s two-part edit; three module banners; `orchestrateDevSkill.test.js`, `skillFiles.test.js` | §2.4, §2.9 class 11 |
| 12 — documentation | CLAUDE.md, `pdlc/OPERATIONS.md`, READMEs, `pdlc/RELEASE-CHECKLIST.md`, `DECISIONS-plugin-distribution.md`, `QUEUE.md`, stored operator notes | §2.9 class 12; §6.3 T-3 |
| 13 — consumer cleanup | New `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`; A-1 allow-list extension first | §3.2, §2.9 class 13; §6.3 T-4 |

### 1.2 What is deliberately **not** built here

1. **Engine-side feature work.** REQ NG-5 carves the engine out of scope except for
   (a) the declared compatible-plugin range (DEC-09) and (b) engine-side tests and
   fixtures whose *subject* is a retired artifact — which is exactly stream 2, plus
   `ci-arrangement.test.js` in stream 1 and `preflight-baseline.test.js` in stream 0.
   No engine runtime module is edited by any task in §2.
2. **New or renamed CI gates.** `pdlc/engine/__tests__/ci-arrangement.test.js` carries a
   transcription of FSPEC §5.1's required-check set **and its count word**; adding or
   renaming a gate reddens it. §2 therefore only ever *removes* checks (six → four,
   FSPEC L-7) and never introduces a workflow file or job.
3. **Hand edits to generated output.** `pdlc/workflows/dist/` is generated IO. T19 edits
   `pdlc/workflows/build-runtime.mjs` and then **regenerates**; no task hand-edits a file
   under `dist/`, and `pdlc/workflows/dist/pdlc-cli.mjs` survives untouched (DEC-01).
4. **Automatic consumer cleanup.** REQ NG-6 forbids it. Stream 13 ships an
   operator-invoked, all-or-nothing script (DEC-04); nothing registers it in
   `pdlc/hooks/hooks.json` (TSPEC §3.2).
5. **The successor's work.** DEC-10 accepts the consolidation capability loss and binds
   it to `pdlc-consolidation-rehost` (REQ O-8, queue Order 24, `ready: false`). No task
   here re-hosts it.
6. **`MERGE_GUARD_DEFAULTS` and `runtime-adapter.js`.** Left alone by DEC-03 and DEC-06.

### 1.3 Three properties this plan is arranged around

1. **Green at every commit outranks one-class-per-commit.** REQ C-7 outranks C-5. Where
   a class cannot be split without a red intermediate — stream 1 above all — the class
   lands whole in a single batch (T03), and the plan says so rather than pretending the
   split exists.
2. **Deleted, never skipped.** REQ C-8. No task in §2 disables a test to make a deletion
   pass. The one place `.skip` appears is the repo's `[red]` convention, where a `[red]`
   task's assertions are committed inside a skipped block **titled with its owning
   `[green]` task's id**, and `checkWaveUnskips` treats that title as the ownership
   record. Those blocks are un-skipped by the owning task as its first act.
3. **Ordering is the specification.** FSPEC §3.1 fixes a partial order over the classes;
   DEC-07 blocks class 6 behind an upstream erratum; DEC-10 and TSPEC T-5 bind classes 7
   and 11 into one commit. §2's `Deps` column and §4's notes carry all three as edges,
   not as prose a reader has to remember.

### 1.4 Status key

`⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done`

---

## 2. Tasks and batches

Reading rules for the table below.

- **Ids are bare** (`T01`, never `**T01**`) in both the id column and every `Deps` cell,
  spelled identically in both, so `parsePlanTasks` links them.
- **`Batch` is derived mechanically**, `max(batch of each dep) + 1`, dependency-free rows
  at 1. It is not a scheduling preference; re-deriving it from `Deps` must reproduce the
  column exactly.
- **Test-only rows carry `—` in `Source File`.** Rows whose evidence is a committed
  transcript or an operator observation rather than a suite module carry `—` in
  `Test File` and are labelled `[manual]`; there are four such rows (T31, T32, T33 —
  plus T13, which is a `[gate]` row that *does* have a mechanical host).
- **`Test File` and `Source File` name the row's primary pair.** Every other file the task
  touches is listed in §3's ownership manifest, which is the authority for
  single-writer analysis.
- **`[red]` rows commit their assertions inside skipped blocks** (`describe.skip` /
  `it.skip` / `test.skip` in statement position) whose title begins with the owning
  `[green]` row's id followed by `": "`. The owning row un-skips them as its first act.
- **A subtractive `[red]` row asserts an absence.** For deletion work the red assertion is
  "no reference to X survives"; it is red at authoring time precisely because X still
  exists, and it is what makes the deletion checkable rather than merely done.

| # | Stream | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| T01 | 0 | [gate] Pre-flight over the measured baseline: every path named in M-1…M-6, M-9, M-10 and the six M-8 helper paths of `docs/_constraints/pdlc-retirement-baseline.md` exists at HEAD (**existence only**, no shape claim), and the partition-closure line names a commit that is an ancestor of HEAD with swept = classified and remainder = 0 (T-1, REQ C-6) | `pdlc/engine/__tests__/preflight-baseline.test.js` | — | 1 | — | ⬚ |
| T02 | 1 | [red] Post-sweep CI arrangement: rendered required checks over the two PR-triggered workflow files set-equal FSPEC L-7's **four** post-sweep rows, the count word matches the set size, and `publish.yml`'s tag gate invokes none of the removed checks (L-8). Skipped under T03 | `pdlc/engine/__tests__/ci-arrangement.test.js` | — | 2 | T01 | ⬚ |
| T03 | 1 | [gate+green] Class 1, landing whole (C-7 outranks C-5): delete the `artifact-freshness` and `fresh-clone-bootstrap` jobs and the index-mode steps of `script-syntax` from `pr-tests.yml`; drop the retired tag-gate steps from `publish.yml`; correct the count words in `publish.yml` and `fixture-machine.yml`; rewrite CLAUDE.md's `### Continuous integration` and `pdlc/OPERATIONS.md`'s `## Continuous integration` to the post-sweep four | `pdlc/engine/__tests__/ci-arrangement.test.js` | `.github/workflows/pr-tests.yml` | 3 | T02 | ⬚ |
| T04 | 2 | [red] Engine-side drift coverage absent: no leg of the engine suite observes the consumer runtime copy, and `pdlc/engine/__tests__/fixtures/consumer-ac12/` is not a tracked path. Skipped under T05 | `pdlc/engine/__tests__/smoke.test.js` | — | 4 | T03 | ⬚ |
| T05 | 2 | [green] Class 2: delete the drift-channel legs from `smoke.test.js` and `fs-observation.test.js`, and delete the six files of `pdlc/engine/__tests__/fixtures/consumer-ac12/` | `pdlc/engine/__tests__/smoke.test.js` | `pdlc/engine/__tests__/fs-observation.test.js` | 5 | T04 | ⬚ |
| T06 | 3 | [red] Queue drift gate absent: `orchestrate-queue.js` exports no drift-gate symbol and parses no `distribution.checkEnabled` key; plus a restatement, live not skipped, of FSPEC L-6 row 1's four protected triage titles already hosted here (`orchestrateQueue.test.js:366, :379, :457, :496`). Absence half skipped under T08 | `pdlc/workflows/__tests__/orchestrateQueue.test.js` | — | 6 | T05 | ⬚ |
| T07 | 3 | [Fake first] New module `pdlc/workflows/__tests__/consumerCleanup.test.js`: AT-4.1/4.2/4.3 and TT-1/TT-1b/TT-2/TT-3/TT-4 committed **skipped under T30**, plus §5.5's skip-join orphan-freedom oracle and TT-3's re-homed mode-bit block, both **live**. Adds the two new fixtures `fixtures/skipJoinFalsifier.js` and `fixtures/skipJoinTeardown.js` (neither a `*.test.js`, so the L-5 count is untouched) | `pdlc/workflows/__tests__/consumerCleanup.test.js` | `pdlc/workflows/__tests__/fixtures/skipJoinFalsifier.js` | 6 | T05 | ⬚ |
| T08 | 3 | [green] Class 3: remove the drift gate and the `distribution.checkEnabled` parse from `pdlc/workflows/orchestrate-queue.js`; delete `queueDriftGate.test.js`; register TT-1b's `uid-nonroot` row in `helpers/driftCapabilities.js`'s `SKIP_INVENTORY`; restate `helpers/skipSink.js`'s `WHAT IS NOT ENFORCED, AND WHY` derivation rule so the widened inventory does not contradict it | `pdlc/workflows/__tests__/orchestrateQueue.test.js` | `pdlc/workflows/orchestrate-queue.js` | 7 | T06, T07 | ⬚ |
| T09 | 4 | [red] Hook manifest post-sweep: `pdlc/hooks/hooks.json`'s registered entry set, keyed by event and script name, set-equals FSPEC L-4's **four** rows — a set-equality, so deleting the whole `SessionStart` event fails it — and `pdlc/hooks/scripts/check-workflow-drift.sh` is untracked. Skipped under T10 | `pdlc/workflows/__tests__/hookCompatibility.test.js` | — | 8 | T08 | ⬚ |
| T10 | 4 | [green] Class 4: delete `pdlc/hooks/scripts/check-workflow-drift.sh` (M-3) and remove its `SessionStart` entry from `pdlc/hooks/hooks.json`, leaving the surviving `SessionStart` entry in place | `pdlc/workflows/__tests__/hookCompatibility.test.js` | `pdlc/hooks/hooks.json` | 9 | T09 | ⬚ |
| T11 | 5 | [red] Shell surface post-sweep: `sync-workflows.sh` and `lib/pdlc-drift.sh` are untracked, and `git ls-files '*.sh'` names neither, so FSPEC L-9's `bash -n` leg sees only surviving scripts. Skipped under T12 | `pdlc/workflows/__tests__/hookCompatibility.test.js` | — | 10 | T10 | ⬚ |
| T12 | 5 | [green] Class 5: delete `pdlc/hooks/scripts/sync-workflows.sh` (M-1) and `pdlc/hooks/scripts/lib/pdlc-drift.sh` (M-2) | `pdlc/workflows/__tests__/hookCompatibility.test.js` | `pdlc/hooks/scripts/sync-workflows.sh` | 11 | T11 | ⬚ |
| T13 | 6 | [gate] **Erratum-6 disposition gate (DEC-07).** Class 6 may not start until upstream has resolved FSPEC L-5's `97` against TSPEC §4.4's `99`: assert that the post-sweep `*.test.js` literal stated in FSPEC §4 and the one derived in TSPEC §4.4 are the same number. Red while the erratum is open; that redness **is** the block | `pdlc/engine/__tests__/preflight-baseline.test.js` | — | 12 | T12 | ⬚ |
| T14 | 6 | [red] AT-1.3's mechanical half: `pdlc/workflows/__tests__/*.test.js` counts exactly the reconciled post-sweep literal; L-6 row 1's host module and its four assertion titles both exist; L-6 row 2's host `hookCompatibility.test.js` exists and still carries `PROP-COMPAT-04/05/06`. Skipped under T15 | `pdlc/workflows/__tests__/documentOracles.test.js` | — | 13 | T13 | ⬚ |
| T15 | 6 | [green] Class 6, deletions: delete the 19 M-8 `*.test.js` modules still standing (`bootstrap`, `drift*` ×16, `runtimeBundle`, `worktreeInclude` — `queueDriftGate` went with T08, `hookCompatibility` is retained) plus `runtimeProvenanceWiring.test.js`, and the six M-8 helpers `helpers/drift{Fixtures,Harness,Probe}.js` and `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh` | `pdlc/workflows/__tests__/documentOracles.test.js` | `pdlc/workflows/__tests__/helpers/driftHarness.js` | 14 | T14 | ⬚ |
| T16 | 6 | [green] Class 6, reductions, **same commit as T15**: `hookCompatibility.test.js` loses only its `C7` block; `helpers/driftCapabilities.js` loses its ten `"bash"` rows and `KNOWN_CAPABILITY_KEYS` gains the new key while keeping T08's `uid-nonroot` row; `helpers/skipSink.js` follows; `helpers/driftGenerators.js` is reduced to the `seeded`/`resolveSeed`/`shrink` primitives its eight surviving importers use (T-2); `consolidationHookParity.test.js` gains AT-3.3 clause 2's `nudge-consolidation.sh` assertion and `PROP-COMPAT-04` is strengthened to parse the stdout JSON | `pdlc/workflows/__tests__/hookCompatibility.test.js` | `pdlc/workflows/__tests__/helpers/driftCapabilities.js` | 14 | T14 | ⬚ |
| T17 | 7 | [red] TT-5, extending `consolidationBuild.test.js`'s existing T32 block: the reduced builder run against a clean temp `dist/` emits a file set that **set-equals `{pdlc-cli.mjs}`**, stdout carries exactly one `wrote`/`in-sync` row, and mutating the artifact makes `--check` print `STALE pdlc/workflows/dist/pdlc-cli.mjs` and exit 1. Skipped under T19 | `pdlc/workflows/__tests__/consolidationBuild.test.js` | — | 15 | T15, T16 | ⬚ |
| T18 | 11 | [red] AT-3.1's static half — the delegator SKILL.md files each show a three-step resolution ladder, name the install command, and retain **no** selection / readiness / dispatch / verdict-parsing / queue-writeback text — plus `RLH-SKILL-10`'s two conjuncts over `pdlc/skills/consolidate-learnings/SKILL.md`: the file exists, and its text names no retired host. Skipped under T20 | `pdlc/workflows/__tests__/skillFiles.test.js` | — | 15 | T15, T16 | ⬚ |
| T19 | 7 | [green] Class 7: reduce `pdlc/workflows/build-runtime.mjs` to a single-row builder emitting only `pdlc-cli.mjs` (DEC-02), **regenerate** `pdlc/workflows/dist/` so M-4, M-5, M-10 and M-6 disappear as build output rather than by hand, and restate the three symbol references in `pipelineWiring.test.js` and `consolidationPreflight.test.js` plus M-11p's bundle assertions in `advisoryBundle.test.js`, `advisoryDisabled.test.js` and `consolidationIdentity.test.js` | `pdlc/workflows/__tests__/consolidationBuild.test.js` | `pdlc/workflows/build-runtime.mjs` | 16 | T17, T18 | ⬚ |
| T20 | 11 | [green] Class 11, **same commit as T19** (DEC-10, T-5): rewrite `orchestrate-dev/SKILL.md` and `orchestrate-queue/SKILL.md` as thin delegators onto `pdlc dev <req-path>` / `pdlc queue`; apply `consolidate-learnings/SKILL.md`'s two-part edit — delete the bundle reference, restate the delegation contract at `:8`–`:18` against REQ O-8's bound disposition; rewrite the three workflow-module banners; retarget `orchestrateDevSkill.test.js:93` and `skillFiles.test.js`'s `RLH-SKILL-08` (`:196`) / `RLH-SKILL-09` (`:209`), and add `RLH-SKILL-10` | `pdlc/workflows/__tests__/skillFiles.test.js` | `pdlc/skills/orchestrate-dev/SKILL.md` | 16 | T17, T18 | ⬚ |
| T21 | 8 | [red] AT-1.5: neither `.worktreeinclude` nor `.gitignore` carries a row whose only purpose is the consumer runtime copy, the removed `.gitignore` row's ~20-line rationale block is gone with it, and both files still carry their other rows. Skipped under T22 | `pdlc/workflows/__tests__/documentOracles.test.js` | — | 17 | T19, T20 | ⬚ |
| T22 | 8 | [green] Class 8: delete the consumer-runtime row from `.worktreeinclude` and the corresponding row plus its rationale comment block from `.gitignore` | `pdlc/workflows/__tests__/documentOracles.test.js` | `.gitignore` | 18 | T21 | ⬚ |
| T23 | 9 | [red] AT-1.6 and DEC-09: `document-oracles.mjs`'s packaging and advertised-version checks over the deleted bundles are gone, the drift scan carries no exemption for a tree that no longer exists, D-1/D-2 no longer require CLAUDE.md to contain the two retired script names, and — positively — `satisfiesRange(version, pdlcPluginCompat).ok === true` for the post-sweep plugin version `0.23.2`. Skipped under T24 | `pdlc/workflows/__tests__/documentOracles.test.js` | — | 19 | T22 | ⬚ |
| T24 | 9 | [green] Class 9: strip the retired checks and exemptions from `pdlc/workflows/lib/document-oracles.mjs`, rewrite D-1/D-2, re-fixture `pdlc/workflows/__tests__/fixtures/covered-violations/`, edit **in the same commit** the CLAUDE.md prose those oracles guard (BR-SWEEP-4's exception), and bump `pdlc/.claude-plugin/plugin.json` to `0.23.2` | `pdlc/workflows/__tests__/documentOracles.test.js` | `pdlc/workflows/lib/document-oracles.mjs` | 20 | T23 | ⬚ |
| T25 | 10 | [red] Wave-gate prose only: the expectations at `consolidationPreflight.test.js:205`–`:208` read the post-sweep CLAUDE.md wording, and `.claude/pdlc.config.example.json`'s two values are asserted **unchanged** (DEC-08). Skipped under T26 | `pdlc/workflows/__tests__/consolidationPreflight.test.js` | — | 21 | T24 | ⬚ |
| T26 | 10 | [green] Class 10: rewrite CLAUDE.md's wave-gate prose. No config value moves | `pdlc/workflows/__tests__/consolidationPreflight.test.js` | `CLAUDE.md` | 22 | T25 | ⬚ |
| T27 | 12 | [red] AT-2.1/2.2/2.3: no instructional document carries a retired concept's verbatim heading (M-11l), and the sections are absent rather than replaced by pointers; `pdlc/RELEASE-CHECKLIST.md` instructs no check that cannot be performed; no live decision and no open queue row mandates the retired copy channel, and each superseded decision carries an explicit superseding entry. Skipped under T28 | `pdlc/workflows/__tests__/documentOracles.test.js` | — | 23 | T26 | ⬚ |
| T28 | 12 | [green] Class 12, last of the sweep, over T-3's per-file list: CLAUDE.md, `pdlc/OPERATIONS.md`, the plugin and repo READMEs, `pdlc/RELEASE-CHECKLIST.md`, `docs/_decisions/DECISIONS-plugin-distribution.md`'s superseding entry, and `docs/_queue/QUEUE.md`'s `pdlc-release-ci` row | `pdlc/workflows/__tests__/documentOracles.test.js` | `CLAUDE.md` | 24 | T27 | ⬚ |
| T29 | 13 | [gate] T-4, **before** class 13 lands: extend A-1's allow-list globs in `docs/_constraints/pdlc-retirement-baseline.md` to cover the new cleanup script's own text, then re-run AT-1.2's L-3 command and confirm all three clauses — non-empty unfiltered output containing the two allow-listed survivors, and the output minus A-1's globs set-equalling L-2's seven terms | `pdlc/workflows/__tests__/documentOracles.test.js` | `docs/_constraints/pdlc-retirement-baseline.md` | 25 | T28 | ⬚ |
| T30 | 13 | [green] Class 13: create `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` — operator-invoked, all-or-nothing over FSPEC L-11's nine names, exits `0`/`3`/`4a`/`4b`, `--dry-run` supported, index mode `100755`, registered nowhere in `hooks.json` — and un-skip T07's AT-4.1/4.2/4.3 and TT-1/TT-1b/TT-2/TT-3/TT-4 blocks as its first act | `pdlc/workflows/__tests__/consumerCleanup.test.js` | `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` | 26 | T07, T29 | ⬚ |
| T31 | — | [manual] AT-1.8 replay: for every commit in the sweep's range, check it out in a detached worktree and run FSPEC L-9's three commands; every commit passes and every hunk belongs to the one class §3.1 assigns it, judged per `(file, section)` pair. Transcript committed under `docs/pdlc-plugin-retirement/` | — | — | 27 | T30 | ⬚ |
| T32 | — | [manual] AT-5.1, AT-5.2 and AT-4.4: one post-sweep end-to-end engine run compared field-set-wise against BL-08's pre-sweep report under §4.5's rule, plus AT-4.4's second pair of runs — leftovers present and absent — which BL-08's capture cannot supply | — | — | 27 | T30 | ⬚ |
| T33 | — | [manual] Operator observations that no suite can make: AT-3.1's transcript half (tool-invocation sequence of length 1), AT-3.2, AT-3.4, AT-3.5, AT-3.6's out-of-range refusal over a temp plugin-root fixture, and AT-5.3's probe-CLI invocation from the surviving repo path | — | — | 27 | T30 | ⬚ |

**Batch census.** 33 tasks over 27 batches. Batch 1: T01. Batches 2–13, 15, 17–26: one or
two rows each. Batch 14: T15, T16 (class 6, one commit). Batch 16: T19, T20 (classes 7
and 11, one commit — §4 kind 3). Batch 27: T31, T32, T33 (the three post-merge manual
verifications). The chain is deliberately long and thin: FSPEC §3.1's class ordering is a
near-total order, and REQ C-5 gives each class its own commit, so there is little the
plan could honestly parallelise.

### 2.1 Acceptance-test traceability

Set-equality with FSPEC §6's enumeration, not a sample: all twenty-six acceptance tests
appear below exactly once. This table deliberately carries no `#`/`ID` header cell and no
`Deps`/`Dependencies` header cell, so `parsePlanTasks` cannot mistake it for §2.

| Acceptance test | Carried by |
|---|---|
| AT-1.1 | T14/T15 (M-1…M-6 and M-10 untracked at the tip), T17/T19 (TT-5's `dist/` set-equality with `{pdlc-cli.mjs}`) |
| AT-1.2 | T29 (all three clauses of the L-3 command, run after A-1's extension) |
| AT-1.3 | T14/T15 (count literal, L-6 rows 1 and 2), T16 (no `.skip` left behind; C-8) |
| AT-1.4 | T02/T03 |
| AT-1.4b | T02/T03 (`publish.yml`'s tag gate, L-8) |
| AT-1.4c | T01 (pre-sweep base commit green), evidenced by BL-08's transcript |
| AT-1.5 | T21/T22 |
| AT-1.6 | T23/T24, judged on a clean tracked-files-only checkout (E-6) |
| AT-1.7 | T09/T10 |
| AT-1.8 | T31 |
| AT-2.1 | T27/T28 |
| AT-2.2 | T27/T28 (`pdlc/RELEASE-CHECKLIST.md` rows) |
| AT-2.3 | T27/T28 (`docs/_decisions/`, `docs/_queue/QUEUE.md`) |
| AT-3.1 | T18/T20 (static half, four conjuncts), T33 (transcript half) |
| AT-3.2 | T33 (asserted **after** the sweep; regression guard) |
| AT-3.3 | T18/T20 (skills half — the fifteen-name set-equality, L-10), T16 (hooks half — the four surviving hooks' named observables) |
| AT-3.4 | T33 |
| AT-3.5 | T33 (regression guard, against BL-07's published range) |
| AT-3.6 | T33 (out-of-range refusal over a temp plugin-root fixture; no real release on the path) |
| AT-4.1 | T07/T30 |
| AT-4.2 | T07/T30 |
| AT-4.3 | T07/T30 (both constructions, including the `.pdlc-tmp.<pid>.<rand>` residue) |
| AT-4.4 | T32 (the leftovers/no-leftovers run pair) |
| AT-5.1 | T32 |
| AT-5.2 | T32 (field-set comparison under §4.5's rule against BL-08) |
| AT-5.3 | T33 |

Three FSPEC literals are also checked directly rather than through an AT: L-1 by T17,
L-4 by T09, L-9 by T31's replay.

---

## 3. File-ownership manifest

One row per task in §2, no row without a task — the bijection `validatePlanContract`
checks. Every path is repo-root-relative and subpackage-qualified, because
`pdlc/workflows` (jest) and `pdlc/engine` (`node --test`) are separate suites with
overlapping basenames; no bare basename appears here. Each row's `Files` cell is the
union of its §2 `Test File` and `Source File` cells plus every other file the task edits.
This table is the authority for the single-writer analysis in §6.

| Task | Files |
|---|---|
| T01 | `pdlc/engine/__tests__/preflight-baseline.test.js` |
| T02 | `pdlc/engine/__tests__/ci-arrangement.test.js` |
| T03 | `pdlc/engine/__tests__/ci-arrangement.test.js`, `.github/workflows/pr-tests.yml`, `.github/workflows/publish.yml`, `.github/workflows/fixture-machine.yml`, `CLAUDE.md`, `pdlc/OPERATIONS.md` |
| T04 | `pdlc/engine/__tests__/smoke.test.js` |
| T05 | `pdlc/engine/__tests__/smoke.test.js`, `pdlc/engine/__tests__/fs-observation.test.js`, `pdlc/engine/__tests__/fixtures/consumer-ac12/` |
| T06 | `pdlc/workflows/__tests__/orchestrateQueue.test.js` |
| T07 | `pdlc/workflows/__tests__/consumerCleanup.test.js` (new), `pdlc/workflows/__tests__/fixtures/skipJoinFalsifier.js` (new), `pdlc/workflows/__tests__/fixtures/skipJoinTeardown.js` (new) |
| T08 | `pdlc/workflows/__tests__/orchestrateQueue.test.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/__tests__/queueDriftGate.test.js`, `pdlc/workflows/__tests__/helpers/driftCapabilities.js`, `pdlc/workflows/__tests__/helpers/skipSink.js` |
| T09 | `pdlc/workflows/__tests__/hookCompatibility.test.js` |
| T10 | `pdlc/workflows/__tests__/hookCompatibility.test.js`, `pdlc/hooks/hooks.json`, `pdlc/hooks/scripts/check-workflow-drift.sh` |
| T11 | `pdlc/workflows/__tests__/hookCompatibility.test.js` |
| T12 | `pdlc/workflows/__tests__/hookCompatibility.test.js`, `pdlc/hooks/scripts/sync-workflows.sh`, `pdlc/hooks/scripts/lib/pdlc-drift.sh` |
| T13 | `pdlc/engine/__tests__/preflight-baseline.test.js` |
| T14 | `pdlc/workflows/__tests__/documentOracles.test.js` |
| T15 | `pdlc/workflows/__tests__/documentOracles.test.js`, `pdlc/workflows/__tests__/bootstrap.test.js`, `pdlc/workflows/__tests__/driftBackups.test.js`, `pdlc/workflows/__tests__/driftBaseline.test.js`, `pdlc/workflows/__tests__/driftC1Absent.test.js`, `pdlc/workflows/__tests__/driftClassify.test.js`, `pdlc/workflows/__tests__/driftFault.test.js`, `pdlc/workflows/__tests__/driftHelpers.test.js`, `pdlc/workflows/__tests__/driftHook.test.js`, `pdlc/workflows/__tests__/driftLadder.test.js`, `pdlc/workflows/__tests__/driftMessages.test.js`, `pdlc/workflows/__tests__/driftMessageSplit.test.js`, `pdlc/workflows/__tests__/driftOrdering.test.js`, `pdlc/workflows/__tests__/driftRecordShape.test.js`, `pdlc/workflows/__tests__/driftRelpath.test.js`, `pdlc/workflows/__tests__/driftRepoRoot.test.js`, `pdlc/workflows/__tests__/driftSync.test.js`, `pdlc/workflows/__tests__/driftWriteFailure.test.js`, `pdlc/workflows/__tests__/runtimeBundle.test.js`, `pdlc/workflows/__tests__/worktreeInclude.test.js`, `pdlc/workflows/__tests__/runtimeProvenanceWiring.test.js`, `pdlc/workflows/__tests__/helpers/driftFixtures.js`, `pdlc/workflows/__tests__/helpers/driftHarness.js`, `pdlc/workflows/__tests__/helpers/driftProbe.js`, `pdlc/workflows/__tests__/helpers/bin/backup-grammar.sh`, `pdlc/workflows/__tests__/helpers/bin/lib-probe.sh`, `pdlc/workflows/__tests__/helpers/bin/percent-encode-driver.sh` |
| T16 | `pdlc/workflows/__tests__/hookCompatibility.test.js`, `pdlc/workflows/__tests__/helpers/driftCapabilities.js`, `pdlc/workflows/__tests__/helpers/skipSink.js`, `pdlc/workflows/__tests__/helpers/driftGenerators.js`, `pdlc/workflows/__tests__/consolidationHookParity.test.js` |
| T17 | `pdlc/workflows/__tests__/consolidationBuild.test.js` |
| T18 | `pdlc/workflows/__tests__/skillFiles.test.js` |
| T19 | `pdlc/workflows/__tests__/consolidationBuild.test.js`, `pdlc/workflows/build-runtime.mjs`, `pdlc/workflows/dist/` (regenerated, never hand-edited), `pdlc/workflows/__tests__/pipelineWiring.test.js`, `pdlc/workflows/__tests__/consolidationPreflight.test.js`, `pdlc/workflows/__tests__/advisoryBundle.test.js`, `pdlc/workflows/__tests__/advisoryDisabled.test.js`, `pdlc/workflows/__tests__/consolidationIdentity.test.js` |
| T20 | `pdlc/workflows/__tests__/skillFiles.test.js`, `pdlc/workflows/__tests__/orchestrateDevSkill.test.js`, `pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/skills/orchestrate-queue/SKILL.md`, `pdlc/skills/consolidate-learnings/SKILL.md`, `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/consolidate-learnings.js` |
| T21 | `pdlc/workflows/__tests__/documentOracles.test.js` |
| T22 | `pdlc/workflows/__tests__/documentOracles.test.js`, `.gitignore`, `.worktreeinclude` |
| T23 | `pdlc/workflows/__tests__/documentOracles.test.js`, `pdlc/engine/__tests__/handshake.test.js` |
| T24 | `pdlc/workflows/__tests__/documentOracles.test.js`, `pdlc/workflows/lib/document-oracles.mjs`, `pdlc/workflows/__tests__/fixtures/covered-violations/`, `CLAUDE.md`, `pdlc/.claude-plugin/plugin.json` |
| T25 | `pdlc/workflows/__tests__/consolidationPreflight.test.js` |
| T26 | `pdlc/workflows/__tests__/consolidationPreflight.test.js`, `CLAUDE.md` |
| T27 | `pdlc/workflows/__tests__/documentOracles.test.js` |
| T28 | `pdlc/workflows/__tests__/documentOracles.test.js`, `CLAUDE.md`, `pdlc/OPERATIONS.md`, `README.md`, `pdlc/README.md`, `pdlc/RELEASE-CHECKLIST.md`, `docs/_decisions/DECISIONS-plugin-distribution.md`, `docs/_queue/QUEUE.md` |
| T29 | `pdlc/workflows/__tests__/documentOracles.test.js`, `docs/_constraints/pdlc-retirement-baseline.md` |
| T30 | `pdlc/workflows/__tests__/consumerCleanup.test.js`, `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` (new) |
| T31 | `docs/pdlc-plugin-retirement/REPLAY-pdlc-plugin-retirement.md` (new) |
| T32 | `docs/pdlc-plugin-retirement/POSTSWEEP-RUN-pdlc-plugin-retirement.md` (new) |
| T33 | `docs/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md` (new) |

Every path above except the seven marked `(new)` exists at HEAD; T01 checks the
baseline-derived subset of them mechanically before any deletion starts.

---

## 4. Task dependencies — notes on the edges

Every edge in §2's `Deps` column is one of five kinds. This section names the kinds whose
edges are not self-evident, so a reviewer can re-derive the graph rather than trust it.

**Kind 1 — red-before-green.** Every `[green]` row names its `[red]` row in `Deps`, never
merely sitting in a later batch. The pairs:

| Red | Green | What goes from failing to passing |
|---|---|---|
| T02 | T03 | The four-row required-check set and `publish.yml`'s tag gate (L-7, L-8) |
| T04 | T05 | Engine-side drift coverage and `fixtures/consumer-ac12/` gone |
| T06 | T08 | `orchestrate-queue.js` free of the drift gate and `distribution.checkEnabled` |
| T07 | T30 | The cleanup script's contract rows — exits `0`/`3`/`4a`/`4b`, `--dry-run`, mode bits |
| T09 | T10 | `hooks.json`'s four-entry set-equality (L-4) |
| T11 | T12 | `sync-workflows.sh` and `lib/pdlc-drift.sh` untracked |
| T14 | T15 | The post-sweep suite count and L-6's two rows |
| T17 | T19 | The reduced builder's `{pdlc-cli.mjs}` emission set (TT-5, L-1) |
| T18 | T20 | AT-3.1's static half and `RLH-SKILL-10` |
| T21 | T22 | `.worktreeinclude` / `.gitignore` rows and the rationale block gone |
| T23 | T24 | The retired document-oracle checks gone; DEC-09's positive range assertion |
| T25 | T26 | The post-sweep wave-gate prose |
| T27 | T28 | The instructional documents telling one story (AT-2.1/2.2/2.3) |

A red/green pair spanning two batches is deliberate: the `Deps` edge puts the `[green]`
row in a later topological batch than its `[red]` predecessor, and the engine gates wave
exit on `implementation.testCommand`. The intermediate wave still comes out green,
because the `[red]` row's assertions are committed **skipped, titled with the green row's
id**; `checkWaveUnskips` reads that title as the ownership record and reddens only if the
owning row completes with the block still skipped. The pair's red interval is real but
held in skip titles rather than in a red suite. This is the only use of `.skip` anywhere
in the feature — REQ C-8's "deleted, never skipped" governs *production* coverage, and no
row in §2 skips an existing assertion to make a deletion pass.

**Kind 2 — the erratum-6 block (DEC-07).** T13 is not decoration. FSPEC L-5 pins the
post-sweep `*.test.js` literal at **97**; TSPEC §4.4 derives **99**, because §2.6 retains
`hookCompatibility.test.js` and reduces it in place rather than deleting it, making the
arithmetic 119 − 21 + 1 rather than 119 − 22. TSPEC routes the disagreement upstream as
§6.1 erratum 6. DEC-07 says class 6 does not start until it is closed, and the cross-cutting
rule the DECISIONS document states — assert the spec's literal, halt and raise an erratum
on disagreement — means an implementer who simply picked one number would be violating
the decision, not resolving it. So the block is an **edge**: T13 sits between T12 (the
last pre-class-6 task) and T14, and it is red for as long as the two documents disagree.
Because T14 → T15 → T17/T18 → T19/T20 → T21 → … is a single chain, the block propagates
transitively to classes 7 through 12 exactly as DEC-07 requires, with no further
bookkeeping.

**Kind 3 — the class-7/class-11 same-commit edge (DEC-10, TSPEC T-5, REQ C-7).** T19 and
T20 share batch 16, and **no other row occupies batch 16**. That is the plan's way of
saying: one commit carries both. The reason is not tidiness. Class 7 deletes the
consolidation bundle `pdlc/workflows/dist/consolidate-learnings.bundle.js` (M-10); class
11 rewrites `pdlc/skills/consolidate-learnings/SKILL.md`'s bundle reference and its
`:8`–`:18` delegation prose. Land class 7 alone and the shipped skill file names a host
that no longer exists; land class 11 alone and the prose describes a disposition the tree
does not yet have. Either order leaves a commit that is internally inconsistent, which
REQ C-7 forbids. This is a **different kind of edge** from kind 2: kind 2 is an upstream
disposition that must close before work starts, kind 3 is a co-landing constraint between
two pieces of work that are both ready.

Two mechanical consequences inside batch 16, both for the implementer rather than the
reviewer. First, T20 edits the banners of `orchestrate-dev.js`, `orchestrate-queue.js`
and `consolidate-learnings.js`, which are inputs to the surviving `pdlc-cli.mjs` build;
T19 owns `pdlc/workflows/dist/` and must therefore run `node
pdlc/workflows/build-runtime.mjs` **after** T20's banner edits, so the commit's generated
output matches its sources. Second, nothing under `dist/` is hand-edited at any point —
the four bundles disappear because the reduced builder stops emitting them (DEC-02), and
`pdlc/workflows/dist/pdlc-cli.mjs` survives as build output, not as a preserved file.

**Kind 4 — multi-writer serialisation.** Six physical files are written by more than one
task, each pair separated by at least one batch **and** connected by a transitive `Deps`
path, so the writers are ordered rather than merely non-simultaneous:

- `pdlc/workflows/__tests__/helpers/driftCapabilities.js` and
  `pdlc/workflows/__tests__/helpers/skipSink.js` — T08 (batch 7, class 3, adding TT-1b's
  `uid-nonroot` `SKIP_INVENTORY` row) and T16 (batch 14, class 6, removing the ten
  `"bash"` rows and widening `KNOWN_CAPABILITY_KEYS`). TSPEC calls this out by name: two
  commits touch one file, serialised in the PLAN, never batched together.
- `CLAUDE.md` — T03 (batch 3, `### Continuous integration`), T24 (batch 20, the prose the
  document oracles guard), T26 (batch 22, wave-gate prose), T28 (batch 24, everything
  else). Four writers, four sections, four batches. AT-1.8 judges commit hygiene per
  `(file, section)` pair rather than per file precisely so this is legal.
- `pdlc/OPERATIONS.md` — T03 (batch 3, `## Continuous integration`) and T28 (batch 24).
- `pdlc/workflows/__tests__/hookCompatibility.test.js` — T09, T10, T11, T12 (batches
  8–11) and T16 (batch 14).
- `pdlc/workflows/__tests__/documentOracles.test.js` — T14, T15, T21, T22, T23, T24, T27,
  T28, T29 across batches 13–25, one writer per batch.
- `pdlc/workflows/__tests__/consolidationPreflight.test.js` — T19 (batch 16, restating the
  three `build-runtime.mjs` symbol references) and T25 (batch 21, the wave-gate prose
  expectation at `:205`–`:208`).

**Kind 5 — class ordering from FSPEC §3.1.** Classes 1 → 2 → 3 → 4 → 5 are a stated
sequence (class 1 first because C-7 outranks C-5; class 2 before class 6; class 3 after
class 2; class 4 after 1–3; class 5 after 4), and classes 8, 9, 10 and 12 sit after class
7 with class 12 last. Those edges appear in `Deps` as the single spine T01 → T02 → …
→ T30. Two edges in that spine deserve naming. T08 deletes
`pdlc/workflows/__tests__/queueDriftGate.test.js`, an M-8 member, in **class 3** rather
than class 6: its whole subject is the gate T08 removes, so leaving it for class 6 would
put a red module in the class-3 commit and break C-7. TSPEC §2.9 anticipates this by
giving class 3 "workflow-suite coverage"; the L-5 arithmetic is unaffected, since it
counts deletions, not which commit performs them. And T29 sits before T30 rather than
inside it because TSPEC T-4 requires A-1's allow-list to cover the new script's text
**before** class 13 lands, so that AT-1.2's grep does not report the cleanup script as a
surviving retired term the moment it appears.

**Where the graph terminates.** T31, T32 and T33 all depend on T30 and share batch 27.
They are the only `[manual]` rows: AT-1.8's replay reads the finished commit range, and
AT-5.1/5.2/4.4 and the AT-3.x operator observations need a merged tree and a real engine
run. Nothing in §2 depends on them, which is the honest shape — they verify the sweep
rather than build it.

**Acyclicity.** The `Deps` relation is a single spine with three short forks (T06/T07 at
batch 6, T15/T16 at batch 14, T17/T18 at batch 15 feeding T19/T20 at batch 16) and one
three-way fan-out at batch 27. Every edge points from a lower batch number to a strictly
higher one, which is sufficient for acyclicity and is re-checkable by inspection of the
`Batch` column alone.

---

## 5. Integration points

Six places where §2's tasks meet machinery that already exists at HEAD. Each names the
file an implementer will actually open.

**1. The CI arrangement carrier is a hand-maintained transcription, not a doc read.**
`pdlc/engine/__tests__/ci-arrangement.test.js` holds FSPEC §5.1's required-check set as
literal constants in the test file, with expansion logic below them, and asserts two
set-equalities against the rendered job and step names in `.github/workflows/pr-tests.yml`.
It also carries the **count word**. Consequence for §2: T03 must edit the carrier and the
workflow file in the same commit — which is why class 1 lands whole and why T03 is
labelled `[gate+green]` rather than split. Equally: **no task in §2 adds or renames a CI
gate**, because the same oracle that makes removals checkable makes additions red.
Membership in the gate set is decided by a workflow file's `on:` trigger, not by its name,
so `publish.yml` (tag-triggered) is outside the PR-gate set while `fixture-machine.yml`
(PR-triggered) is inside it; T03's count-word edits follow that rule, not the filenames.

**2. The jest suite collects `__tests__/*.test.js` automatically, and its size is
pinned.** `pdlc/workflows/__tests__/consumerCleanup.test.js` needs no registration step —
but it is also the **only** new `*.test.js` module the sweep is permitted to add, because
AT-1.3 asserts the post-sweep count as a literal (TSPEC §4.4: 119 − 21 + 1). This is why
T01's pre-flight lives in `pdlc/engine/__tests__/preflight-baseline.test.js` rather than
in a new workflows-side module, and why T07's two new skip-join fixtures are placed under
`__tests__/fixtures/` with names that are deliberately not `*.test.js`.

**3. `helpers/driftGenerators.js` is a survivor with eight importers.** The baseline
assigns it to M-11p, not M-8: `approvalHash`, `completeness`, `consolidationPreflight`,
`forcePhases`, `pacingWrapper`, `roundDerivation` and `scanLines` import its
`seeded`/`resolveSeed`/`shrink` primitives, and so does
`__tests__/helpers/mergeDoubles.js` — the eighth, missed on a first count because it is a
helper rather than a `*.test.js` module. T16 reduces the file to those three exports and
re-derives the importer list (`grep -rn 'driftGenerators' pdlc/workflows/__tests__ | grep
import`) rather than trusting this paragraph, which is TSPEC obligation T-2. T07's TT-4
property test is one of the consumers, so the reduction must keep the primitives working,
not merely present.

**4. `bootstrap.test.js` is the sole host of the mode-bit oracle, and it is deleted.**
`grep -rn "100755" pdlc/workflows/__tests__/*.test.js` returns that file alone at HEAD.
Deleting it (T15) would silently drop mode-bit coverage for **three still-shipped**
scripts, not just the two retired ones, and CLAUDE.md's fresh-clone rule — invoke by bare
path, no `bash`/`sh` prefix, exit 126 means the mode bit was lost — is a live project
constraint. T07's TT-3 therefore re-homes the block into `consumerCleanup.test.js` as a
**widening**: the post-sweep enumeration is the five shipped scripts
(`cleanup-consumer-workflows.sh`, `check-req-size.sh`, `check-scope-field.sh`,
`guard-harvest-before-delete.sh`, `nudge-consolidation.sh`), set-equal against a fresh
`git ls-files -s` of `pdlc/hooks/scripts/`. Ordering matters and the graph enforces it:
T07 is batch 6, T15 is batch 14, so the coverage exists before its old host disappears.
The re-home imports `makeFreshClone` from `__tests__/helpers/freshClone.js`, which is not
an M-8 member and survives; `helpers/driftHarness.js`'s `indexMode` does not, so TT-3
re-derives the mode inline.

**5. `coveredViolations` walks the whole tree, so "green" needs a clean checkout.**
`pdlc/workflows/lib/document-oracles.mjs`'s walk skips only `.git/` and `node_modules/`.
An untracked local file — a wave-state JSON, an editor backup, a tool cache — reddens
`documentOracles.test.js` for a reason no diff in this feature explains. AT-1.6 is judged
on a **clean tracked-files-only checkout** (E-6), and T31's replay uses `git worktree add`
against each commit rather than the working tree, which gets this for free. A reviewer
seeing exactly one failure that names an untracked path has not seen a defect.

**6. FSPEC L-9's three commands are the per-commit gate, and T31 replays them.** `npm
test` in `pdlc/workflows`, `npm ci && npm test` in `pdlc/engine`, and `bash -n` over `git
ls-files '*.sh'`. The third is why T11's red assertion is worth having: after T12 deletes
`sync-workflows.sh` and `lib/pdlc-drift.sh`, the `bash -n` leg must be seen to cover only
surviving scripts rather than to have quietly shrunk. The replay buys two properties a
tip-only check cannot: a commit that went red and was repaired in the next one is caught
(BR-SWEEP-2), and each commit's class claim is auditable hunk by hunk (AT-1.8).

---

## 6. Batch-safety rules honoured

Stated against §2 and §3 so a reviewer can check rather than take on trust.

**Rule 1 — `Batch` is `max(dep batches) + 1`.** Re-derived over all 33 rows. The
dependency-free row is T01 at batch 1. The forks: T06 and T07 both take batch 6 from T05
at 5; T15 and T16 both take batch 14 from T14 at 13; T17 and T18 both take batch 15 from
T15/T16 at 14; T19 and T20 both take batch 16 from T17/T18 at 15; T30 takes
`max(T07 at 6, T29 at 25) + 1 = 26`; T31, T32 and T33 all take 27 from T30 at 26. Batch
sizes: 1 row each except batches 6, 14, 15 and 16 (2 rows) and batch 27 (3 rows) —
(4 × 2) + 3 + (22 × 1) = 33 rows across 27 batches.

**Rule 2 — one writer per physical file per batch.** Checked over §3's `Files` cells, not
over §2's two-column summary. Six files have multiple writers; all six are enumerated in
§4 kind 4 with their batch numbers, and no two writers of any file share a batch. The
closest call is batch 16, where T19 and T20 land in one commit: their file sets are
disjoint (builder plus `dist/` plus five test modules for T19; three SKILL.md files, three
workflow modules and two test modules for T20), so the single-writer rule holds even
though the commit does not distinguish them.

**Rule 3 — red-before-green as an explicit edge.** Re-derived over §4 kind 1's thirteen
pairs. Every `[green]` row in §2 names its `[red]` predecessor in `Deps`; no pair relies
on batch ordering alone. Three rows are labelled neither `[red]` nor `[green]`: T01 and
T13 are `[gate]` rows whose whole content is an assertion that must hold before work
proceeds, and T07 is `[Fake first]` — it creates the new test module and its fixtures,
carrying both live oracles and blocks skipped under T30, so it is simultaneously a
creation task and T30's red predecessor. T29 is a `[gate]` row for the same reason as
T13: its subject is an allow-list that must be widened before the thing it covers exists.

**Rule 4 — shared prerequisites owned by one early task.** Two shared modules are written
by more than one task and neither is a free-for-all.
`pdlc/workflows/__tests__/helpers/driftCapabilities.js` and `helpers/skipSink.js` have
exactly two writers each, T08 and T16, with T08 the earlier and the `Deps` path
T08 → T09 → … → T14 → T16 connecting them. The new fixtures
`__tests__/fixtures/skipJoinFalsifier.js` and `__tests__/fixtures/skipJoinTeardown.js`
have exactly one writer, T07, at the earliest batch that can host them; no later row
reopens them.

**Rule 5 — subpackage-qualified paths.** Every path in §2 and §3 is repo-root-relative.
`pdlc/engine/__tests__/` and `pdlc/workflows/__tests__/` run under different runners and
share basenames (`cli.test.js`, `smoke.test.js`, `preflight.test.js`), so a bare basename
would be ambiguous. None appears in either table.

**Rule 6 — directory entries have exactly one owner.** Four directory paths appear in §3:
`pdlc/engine/__tests__/fixtures/consumer-ac12/` (T05), `pdlc/workflows/dist/` (T19),
`pdlc/workflows/__tests__/fixtures/covered-violations/` (T24) and
`pdlc/hooks/scripts/lib/` implicitly via T12's `lib/pdlc-drift.sh`. No other row names a
path underneath any of them.

**Rule 7 — manifest and task table in bijection.** 33 tasks in §2, 33 rows in §3, the same
identifiers in the same order, no row without a task and no task without a row — the
condition `validatePlanContract` checks by running `parsePlanTasks` and
`parsePlanOwnership` over this document.

**Rule 8 — only §2 is the task table.** `parsePlanTasks` matches on **exact** header
cells, never substrings, so the other tables here cannot be swallowed: §1.1's stream
table (`Stream | Scope | Where it lands`), §2.1's traceability table (`Acceptance test |
Carried by`), §3's manifest (`Task | Files`), §4 kind 1's pairing table (`Red | Green |
What goes from failing to passing`), and the lineage and changelog tables at the top. None
of them carries a `#`/`ID` cell or a `Deps`/`Dependencies` cell.

---

## 7. Definition of Done — verification

Branch `feat-pdlc-plugin-retirement`.

**Suites.**

1. `cd pdlc/workflows && npm test` green on a **clean tracked-files-only checkout**. The
   qualifier is load-bearing, not defensive: `coveredViolations` walks the whole tree
   skipping only `.git/` and `node_modules/`, so any untracked stray reddens
   `documentOracles.test.js` for a reason unrelated to this feature (§5 item 5). A DoD
   reader meeting a single red here should confirm that exactly one test fails, that its
   message names an untracked path, and then read the CI run.
2. `cd pdlc/engine && npm ci && npm test` green, including
   `pdlc/engine/__tests__/ci-arrangement.test.js` over the post-sweep four-row check set
   and `pdlc/engine/__tests__/preflight-baseline.test.js` over the reconciled suite
   literal.
3. `bash -n` clean over `git ls-files '*.sh'` — the surviving set only, with no entry for
   a deleted entrypoint and no entry for a deleted sourced library.
4. `node pdlc/workflows/build-runtime.mjs --check` exits 0 with `pdlc/workflows/dist/`
   holding exactly `pdlc-cli.mjs` (L-1). There is no `sync-workflows.sh --check` step in
   this list, because T12 deleted the script — its disappearance from the DoD is itself
   part of what AT-1.1 asserts.

**Counted facts.**

5. `ls pdlc/workflows/__tests__/*.test.js | wc -l` equals the literal reconciled by
   erratum 6 (TSPEC §4.4 derives 99; FSPEC L-5 currently pins 97 — T13 will not pass
   until one number stands).
6. `pdlc/hooks/hooks.json` registers exactly four entries (L-4), with the `SessionStart`
   event still present and carrying its surviving entry.
7. `ls pdlc/skills/*/SKILL.md` set-equals L-10's fifteen names. The plugin sheds machinery,
   not skills.
8. `git ls-files -s pdlc/hooks/scripts/` shows five scripts, every one at mode `100755`,
   and `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` is invocable by bare path
   without a `bash`/`sh` prefix (status never 126).
9. The L-3 grep, run unfiltered, satisfies all three of AT-1.2's clauses — non-empty
   output containing `docs/_decisions/DECISIONS-plugin-distribution.md` and
   `docs/_constraints/pdlc-retirement-baseline.md`, and the output minus A-1's globs
   set-equalling L-2's seven terms.

**Evidence artifacts, committed under `docs/pdlc-plugin-retirement/`.**

10. T31's replay transcript: every commit in the sweep's range passes all three L-9
    commands, and every hunk belongs to the one class FSPEC §3.1 assigns it, judged per
    `(file, section)` pair. This is operator-read evidence, not a suite assertion.
11. T32's post-sweep run report, compared field-set-wise against BL-08's pre-sweep report
    under TSPEC §4.5's rule — equal field sets over the whole report, with value
    comparison excluded for exactly REQ AC-5.2's enumerated allowed-difference set and
    nothing else. Plus AT-4.4's second pair of runs, over a tree with leftovers and a
    tree without.
12. T33's operator observations: AT-3.1's tool-invocation sequence of length 1, AT-3.2's
    refusal with the plugin absent, AT-3.4, AT-3.5, AT-3.6's out-of-range refusal carrying
    all three of engine version, plugin version and expected range, and AT-5.3's probe-CLI
    answers from the surviving repo path.

**Obligations discharged, each with a named home.**

13. T-1 (re-run the C-6 partition) — T01. T-2 (re-derive `driftGenerators.js`'s surviving
    exports) — T16. T-3 (the instructional-document per-file list) — T28. T-4 (extend A-1
    before class 13) — T29. T-5 (classes 7 and 11 land together) — batch 16. T-6 (re-check
    `hookCompatibility.test.js` retention) — T13's gate, since retention is exactly what
    erratum 6 turns on.
14. DEC-09's plugin patch-bump to `0.23.2` lands in T24 together with the positive
    assertion that `satisfiesRange(version, pdlcPluginCompat).ok === true` — a positive
    check, not the absence of a refusal.
15. DEC-10's accepted capability loss is recorded, and its successor
    `pdlc-consolidation-rehost` remains bound at queue Order 24 with `ready: false`
    (REQ O-8). T28's `QUEUE.md` edit must not flip that flag.

**Not in this feature's DoD.** No engine runtime module changes; no CI gate is added or
renamed; no consumer's `.claude/workflows/` is touched automatically; no file under
`pdlc/workflows/dist/` is hand-edited.

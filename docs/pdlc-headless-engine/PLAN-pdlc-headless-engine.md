---
feature: pdlc-headless-engine
---

# PLAN — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** (`REQ-pdlc-headless-engine.md` v0.10; `FSPEC-pdlc-headless-engine.md` v1.6; `TSPEC-pdlc-headless-engine.md` v1.5; `DECISIONS-pdlc-headless-engine.md` v1.3) |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 1. Summary

This plan builds out the headless engine under `pdlc/engine/` from the partial implementation
already committed there (`bin/pdlc.mjs`, seven `lib/*.mjs`, nine `__tests__/*.test.js` — measured at
HEAD) to the design TSPEC §§2–7 fixes. It is **not greenfield**: `docs/_constraints/pdlc-engine-baseline.md`
M-ENG-06 is the authority on which acceptance criterion is red, green or partially green at HEAD,
and TSPEC §8.3 is the authority on which files are **new**, **extended** or **regenerated**. Tasks
below are labelled accordingly, because a plan that treats the three alike mis-schedules.

Four properties of the shape of the work drive the batch order, and each is a load-bearing
scheduling decision rather than a preference:

1. **The suite spine is built first, before any property that accumulates through it.** TSPEC §7.0
   makes the run id minted by `__tests__/_run-suite.mjs` — a runner, before any child process exists —
   the mechanism three of the five suite-wide set-equality properties depend on (§7.4). The failure
   mode of getting this wrong is asymmetric: the outcome harness's forward direction
   (`observed ⊆ OUTCOMES`) passes **vacuously green over the empty set**. So the spine, its
   inheritance self-test and its emptiness guard land in batches 2–4, ahead of every consumer.
2. **The workflow-module edit and its bundle rebuild are one task, never two.** TSPEC §8.3 states
   this as a PLAN obligation: `stripModuleSyntax` (`pdlc/workflows/build-runtime.mjs:45`) inlines the
   whole module body, so adding `DISPATCHABLE_SKILLS` changes `pdlc/workflows/dist/*.bundle.js` and
   `distribution-manifest.json` bytes, and `.github/workflows/pr-tests.yml:77` (`artifact-freshness`)
   gates on `build-runtime.mjs --check` producing no diff. T16 owns the source change, the rebuild
   and the regenerated artifacts together; `implementation.postWavePathspecs` already names
   `pdlc/workflows/dist/` in `.claude/pdlc.config.json`, which is the mechanism that commits them.
3. **The guard measurement is scheduled before anything that could be called unattended use.** FSPEC
   BR-GUARD-4 and TSPEC §6.5 both say so, and DEC-ENG-04 makes an unrecorded measurement a *red*
   hermetic suite. T29 (the gate) and T42 (the first M-ENG-09 rows plus the live measurement that
   produces them) are deliberately close together: TSPEC §6.5 requires the gate and the first rows to
   land in the **same task** so CI never observes an unrecorded state, and this plan honours that by
   making T29 a red-test task whose only green is T42.
4. **The five-configuration corpus is the last thing built, because it consumes everything.** TSPEC
   §7.4's model-map witness table needs whole-run descriptors from five distinct run configurations,
   and row 4 needs a mid-run forced failure. It cannot be assembled until the adapter, both
   transports, the ladder, the report and the CLI are all green, so it sits in batch 8 with the
   suite-wide assertion that reads it in batch 10.

Two scope statements, so the table is read correctly. **The engine owns hosting; the modules own the
pipeline** (TSPEC §1.4): only two tasks touch `pdlc/workflows/` (T07's test, T16's exports) and
neither changes pipeline behaviour. And **`.claude/pdlc.config.json` is on the edit surface even
though TSPEC §8.3 does not list it** — measured at HEAD, `implementation.testCommand` is
`cd pdlc/workflows && npm test …`, so no wave gate in this feature's own Phase I would ever execute
the engine suite it is building. T17 corrects that; the omission is also raised as an erratum.


## 2. Pre-flight gate and prior-phase baseline

This feature extends a prior phase's baseline, so **T00 is a `P2-00` pre-flight gate and is the first
task in the table**. It asserts only that the `BL-PREREQ` symbols this plan builds on are importable
at HEAD — existence, never shape. A symbol whose *shape* a later task changes (`buildEngineBlock`'s
argument list, `runStartupChecks`' return) is that task's business, not the gate's; a gate that
asserted target shapes would be red by design for the whole feature.

| `BL-PREREQ` symbol | Module | Measured at HEAD |
|---|---|---|
| `createAdapter`, `createGit`, `createRunCommand`, `computeRateLimitWaitMs` | `pdlc/engine/lib/adapter.mjs` | `:215`, `:116`, `:161`, `:75` |
| `createTransport`, `DEFAULT_PERMISSION_MODE`, `AuthPolicyError`, `RateLimitedError`, `TimeoutError`, `TransportError` | `pdlc/engine/lib/transport.mjs` | `:135`, `:89`, `:23`, `:33`, `:46`, `:55` |
| `runStartupChecks`, `formatStartup`, `EXPECTED_SKILLS` | `pdlc/engine/lib/startup.mjs` | `:60`, `:145`, `:20` |
| `buildEngineBlock`, `stampReport` | `pdlc/engine/lib/report.mjs` | `:36`, `:70` |
| `WORKFLOW_MODULE_URLS`, `workflowModulePath`, `devInjection`, `queueInjection` | `pdlc/engine/lib/run.mjs` | `:52`, `:58`, `:80`, `:114` |
| `resolvePluginRoot`, `skillFilePath`, `loadSkill`, `composeDispatchPrompt` | `pdlc/engine/lib/skills.mjs` | `:204`, `:267`, `:290`, `:312` |
| `checkCompat`, `buildBanner`, `parseVersion`, `satisfiesRange` | `pdlc/engine/lib/handshake.mjs` | `:137`, `:183`, `:20`, `:86` |
| `PHASE_DISPATCH` (already exported) | `pdlc/workflows/orchestrate-dev.js` | `:3337` |
| `runAdvisorySeam` (exported, and imported by the queue) | `pdlc/workflows/orchestrate-dev.js`, via `orchestrate-queue.js:41` | measured |

`EXPECTED_SKILLS` is in the gate deliberately although T44 **deletes** it: the gate proves the
starting state the deletion is against, and a plan that omitted it would make "the frozen list was
removed" indistinguishable from "the frozen list was never there". The model constants the witness
table reads (`MODEL_DEFAULT` `orchestrate-dev.js:1603`, `MODEL_IMPLEMENTATION` `:1646`,
`MODEL_ADVISORY` `:1652`, `MODEL_ADVISORY_FALLBACK` `:1653`, `ADVISORY_RUNG_SKILL` `:1797`) are
**module-local at HEAD**, and only `ADVISORY_RUNG_SKILL` is promoted (T16). The rest stay local
because TSPEC §7.4 requires M-ENG-07's table to be a *transcription* in the harness, never an import
— importing it would make the drift AC-3.3 exists to catch invisible. They are therefore not gate
symbols.

**What the gate does not cover, and why.** `pdlc/engine/node_modules/` is present in the working
tree at HEAD but is not committed; `npm ci` under `pdlc/engine` is a step of T17's CI job and of any
fresh clone, not a symbol the gate can assert. The gate runs `node --test` only, and it is inert on a
tree where the SDK dependency is absent — it imports no module that reaches
`@anthropic-ai/claude-agent-sdk`, because `transport.mjs`'s `defaultQueryFn` (`:17`) imports the SDK
lazily, which is what makes that true.

## 3. Task table

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done.
Paths are repo-relative and subpackage-qualified. `[Fake first]` marks the test-double and harness
tasks that must precede the production tasks reading them. Every green task lists its red-test task
in `Deps` as an explicit edge, never by id order.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T00 | `P2-00` pre-flight gate — §2's `BL-PREREQ` symbols importable at HEAD; existence only, never shape | `pdlc/engine/__tests__/preflight.test.js` | — (gate) | 1 | — | ⬚ |
| T01 | 🔴 suite-spine: one run dir per suite, both probe files' records in it, runner mints the id before any child (TSPEC §7.0) | `pdlc/engine/__tests__/suite-spine.test.js`, `pdlc/engine/__tests__/spine-probe-a.test.js`, `pdlc/engine/__tests__/spine-probe-b.test.js` | — | 2 | T00 | ⬚ |
| T02 | 🔴 hermeticity: construction guard fails on real-transport construction; socket trap fires on a deliberate connect (AT-ENG-63) | `pdlc/engine/__tests__/hermeticity.test.js` | — | 2 | T00 | ⬚ |
| T03 | 🔴 suite-wide assertion step driven over synthetic run dirs: empty dir ⇒ non-zero exit; populated dir ⇒ each row's pass and fail case (AT-ENG-33, AT-ENG-61) | `pdlc/engine/__tests__/assert-suite-wide.test.js` | — | 2 | T00 | ⬚ |
| T04 | 🔴 outcome taxonomy: six members, total classifier, per-member provocation fixture, unrecognised ⇒ `transport-contract-violation` (AT-ENG-33, AT-ENG-34) | `pdlc/engine/__tests__/outcome.test.js` | — | 2 | T00 | ⬚ |
| T05 | 🔴 catalogue: unknown id throws, missing param throws, severity is entry data, `messageIds()` (AT-ENG-61, AT-ENG-62) | `pdlc/engine/__tests__/catalogue.test.js` | — | 2 | T00 | ⬚ |
| T06 | 🔴 auth posture: §3.2's six rows in first-match order over scratch `HOME` + env fixtures; empty key counts absent; unreadable ≠ absent in message only (AT-ENG-13, AT-ENG-19) | `pdlc/engine/__tests__/auth.test.js` | — | 2 | T00 | ⬚ |
| T07 | 🔴 `[Fake first]` workflows-side derivation + no-bare-literal, with the closed exemption list asserted as **exactly** `orchestrate-dev.js:6229-6231` (AC-3.5, AT-ENG-10) | `pdlc/workflows/__tests__/dispatchableSkills.test.js` | — | 2 | T00 | ⬚ |
| T08 | 🔴 CI arrangement: `pr-tests.yml` declares an `engine-tests` job on the `unit-tests` matrix whose body is `npm test`; `.claude/pdlc.config.json` `implementation.testCommand` runs the engine suite (TSPEC §7.6) | `pdlc/engine/__tests__/ci-arrangement.test.js` | — | 2 | T00 | ⬚ |
| T09 | 🔴 fixture redaction scanner with its positive control in the same test: scratch file carrying one instance of each documented rule **must** be flagged (AT-ENG-64, TSPEC §7.2) | `pdlc/engine/__tests__/fixtures-redaction.test.js` | — | 2 | T00 | ⬚ |
| T10 | Anti-fork strengthening — tighten `run.test.js:64` from "a `file:` URL" to the repo-relative path assertion; keep `:48`'s no-second-copy clause (AC-1.5, AT-ENG-49). Test-only: the observable already exists at `run.mjs:58`, so this task has no green counterpart | `pdlc/engine/__tests__/run.test.js` | — | 2 | T00 | ⬚ |
| T11 | 🟢 `[Fake first]` suite runner: mint `PDLC_TEST_RUN_ID`, empty the run dir, spawn `node --test --import=./__tests__/_bootstrap.mjs __tests__/`, then the assertion step; `scripts.test` becomes the runner | `pdlc/engine/__tests__/suite-spine.test.js` | `pdlc/engine/__tests__/_run-suite.mjs`, `pdlc/engine/package.json` | 3 | T01 | ⬚ |
| T12 | 🟢 `[Fake first]` bootstrap v1: construction guard, socket trap (`net`/`tls`), observation writer appending to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, failing loudly if the id is unset rather than minting one | `pdlc/engine/__tests__/hermeticity.test.js` | `pdlc/engine/__tests__/_bootstrap.mjs` | 3 | T01, T02 | ⬚ |
| T13 | 🟢 **new** `lib/outcome.mjs`: frozen six-member `OUTCOMES`, total `classifyOutcome({error, result, reportedFailure})`, records each result through the observation seam | `pdlc/engine/__tests__/outcome.test.js` | `pdlc/engine/lib/outcome.mjs` | 3 | T04 | ⬚ |
| T14 | 🟢 **new** `lib/catalogue.mjs`: frozen `MESSAGES`, `message(id, params)` throwing on unknown id or missing param and recording the id, `messageIds()` | `pdlc/engine/__tests__/catalogue.test.js` | `pdlc/engine/lib/catalogue.mjs` | 3 | T05 | ⬚ |
| T15 | 🟢 **new** `lib/auth.mjs`: `readLoginEvidence`, frozen `AUTH_ROWS`, pure `resolveAuthPosture` returning `{row, catalogueId, refuses, evidencePath}` | `pdlc/engine/__tests__/auth.test.js` | `pdlc/engine/lib/auth.mjs` | 3 | T06 | ⬚ |
| T16 | 🟢 workflows exports **and** bundle rebuild in one task: `DISPATCHABLE_SKILLS`, `ADVISORY_RUNG_SKILL`, the five `SKILL_*` constants, `SKILL_TRIAGE`; bare literals replaced at their dispatch sites; then `node pdlc/workflows/build-runtime.mjs`, with the regenerated artifacts in this task's commit | `pdlc/workflows/__tests__/dispatchableSkills.test.js` | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `pdlc/workflows/dist/orchestrate-queue.bundle.js`, `pdlc/workflows/dist/distribution-manifest.json` | 3 | T07 | ⬚ |
| T17 | 🟢 CI + wave gate: add the `engine-tests` job (ubuntu/macos, node 20, `working-directory: pdlc/engine`, `npm ci` then `npm test`); extend `implementation.testCommand` so a wave gate runs the engine suite too | `pdlc/engine/__tests__/ci-arrangement.test.js` | `.github/workflows/pr-tests.yml`, `.claude/pdlc.config.json` | 3 | T08 | ⬚ |
| T18 | 🟢 `[Fake first]` per-transport recorded fixture sets (SDK message streams: `system/init` with `apiKeySource`, `rate_limit_event`, terminal `result`; `claude -p` stream-json lines) plus the refresh/redaction README (AC-6.3, AT-ENG-64) | `pdlc/engine/__tests__/fixtures-redaction.test.js` | `pdlc/engine/__tests__/fixtures/README.md`, `pdlc/engine/__tests__/fixtures/transport-sdk/`, `pdlc/engine/__tests__/fixtures/transport-cli/` | 3 | T09 | ⬚ |
| T19 | 🟢 `[Fake first]` assertion step v1: emptiness guard, spine self-assertion (one run dir, both probes), catalogue row, outcome row — rows 1 and 2 of TSPEC §7.4's table | `pdlc/engine/__tests__/assert-suite-wide.test.js` | `pdlc/engine/__tests__/_assert-suite-wide.mjs` | 4 | T03, T11, T12, T13, T14 | ⬚ |
| T20 | 🔴 adapter descriptor: `_phase` run state and its prefix normalisation, engine-stamped `timeoutMs`, terminal `outcome`/`errorText`, one settlement line per attempt, `byPhase`, `authSources`, `createGit` identity ≠ module default (AT-ENG-28, AT-ENG-29, AT-ENG-16) | `pdlc/engine/__tests__/adapter-descriptor.test.js` | — | 4 | T13, T14 | ⬚ |
| T21 | 🔴 retry machine: FSPEC §8.2's eight sequences, one shared budget, the one-timeout-per-dispatch cap with `terminal: "timeout-cap" \| "budget-exhausted"`, per-dispatch budget locality, `auth-failure` never retried (AT-ENG-35, AT-ENG-36, AT-ENG-37, AT-ENG-39) | `pdlc/engine/__tests__/adapter-retry.test.js` | — | 4 | T13 | ⬚ |
| T22 | 🔴 transport boundary: option-key containment over `{model, cwd, timeoutMs, maxTurns}` plus `cwd`/`timeoutMs` presence on **every** dispatch; env spread carries both proxy variables; unrecognised model forwarded; single permission posture (AT-ENG-26, AT-ENG-27, AT-ENG-30, AT-ENG-31) | `pdlc/engine/__tests__/transport-boundary.test.js` | — | 4 | T13, T18 | ⬚ |
| T23 | 🔴 fallback transport over its recorded fixtures: same `DispatchResult`, same four error classes, absent terminal result ⇒ `TransportError`, composed prompt identical across transports (AT-ENG-22, AC-6.3) | `pdlc/engine/__tests__/transport-cli.test.js` | — | 4 | T13, T18 | ⬚ |
| T24 | 🔴 prompt composition: for **every** member of the derived set one invocation, full prompt-file text present, no Skill-tool instruction, supplements exactly when the dispatch asks, `--dry-run` executes nothing (AT-ENG-20…AT-ENG-25) | `pdlc/engine/__tests__/skills-composition.test.js` | — | 4 | T16 | ⬚ |
| T25 | 🔴 seam contract: TSPEC §3.1's per-module table exactly — supplied seams present, `_sessionAgent` unwired, `_runCommand` non-null for dev, `_runPipeline` supplied for queue, fall-through to the throwing stub is fatal and names the seam (AT-ENG-51, EC-PAR-5) | `pdlc/engine/__tests__/seam-contract.test.js` | — | 4 | T16 | ⬚ |
| T26 | 🔴 ladder rungs 0–5: total, ordered, post-failure rungs `skipped`-with-reason; `doctor`'s three AC-2.1 facts equal the run's; derived rung-4 set-equality both directions (AT-ENG-06…AT-ENG-12) | `pdlc/engine/__tests__/startup-ladder.test.js` | — | 4 | T15, T16 | ⬚ |
| T27 | 🔴 rung 4a guard executability: no candidate runs ⇒ refusal naming each candidate, its outcome and the remedy, nothing dispatched; a present-but-not-runnable earlier candidate with a runnable later one ⇒ rung passes (AT-ENG-11a, EC-START-10/11) | `pdlc/engine/__tests__/startup-guard-executable.test.js` | — | 4 | T15 | ⬚ |
| T28 | 🔴 guard parity, three clauses each with the falsifying counterpart in the same file, deny-path performing the deletion it guards, host carrying no pdlc hook registration (AT-ENG-41…AT-ENG-44) | `pdlc/engine/__tests__/guard-parity.test.js` | — | 4 | T14, T18 | ⬚ |
| T29 | 🔴 M-ENG-09 gate: no row for the running platform ⇒ hermetic suite **fails** with a catalogue-registered message naming the missing measurement and the opt-in command; a row recording `denyFired: no` while the hook carrier ships ⇒ fails (DEC-ENG-04, TSPEC §6.5) | `pdlc/engine/__tests__/m-eng-09.test.js` | — | 4 | T14 | ⬚ |
| T30 | 🔴 tunables: `resolveTunables` over TSPEC §4.6's five rows; the two operator-owned rows are flag-only and ignore config (AT-ENG-03); effective-timeout oracle at `dispatch.timeoutMinutes: 7` asserting the literal `420000` at the boundary and `7` in the report | `pdlc/engine/__tests__/tunables.test.js` | — | 4 | T14 | ⬚ |
| T31 | 🔴 exit mapping and the loop sub-block: one mapping function over the module `outcome`; halt ⇒ `2`, engine refusal ⇒ `1`; `stopReason` total over all four loop exits; `maxIterations` is `null` in the **in-memory** object (AT-ENG-04, AT-ENG-53…AT-ENG-56) | `pdlc/engine/__tests__/exit-loop.test.js` | — | 4 | T14 | ⬚ |
| T32 | 🔴 report `engine` block: every FSPEC §12.2 row present, counts present-and-zero, `retries[]` empty not absent, `engine` is the only key `stampReport` adds, one JSON line last on stdout (AT-ENG-58, AT-ENG-59, AT-ENG-60, AT-ENG-68) | `pdlc/engine/__tests__/report-engine.test.js` | — | 4 | T14 | ⬚ |
| T33 | 🔴 AC-1.2 instrument: recording non-empty; the two positive read clauses; the `.claude/workflows/` absence clause asserted only alongside them; a deliberate read under that tree **must** fail clause 3 (AT-ENG-47, AT-ENG-48, AT-ENG-50) | `pdlc/engine/__tests__/fs-observation.test.js` | — | 4 | T12 | ⬚ |
| T34 | 🔴 parity oracle: the write-less double **fails** this test first; then §10.2's structural clauses; two successive reviewer dispatches produce two files, not one rewritten; the double writes no approval anchors (AT-ENG-45, AT-ENG-46, AT-ENG-51) | `pdlc/engine/__tests__/parity.test.js` | — | 4 | T18 | ⬚ |
| T35 | 🟢 `lib/adapter.mjs` v1: `_phase` run state + normalisation, `dispatchTimeoutMs` constructor option stamped as `timeoutMs`, descriptor terminal half, settlement-time append (composition-time with `null` terminals for the inert transport), `byPhase`/`RetryRow`/`PauseRow`/`DenialRow` phase fields, `getAuthSources()`, stale `:266-268` comment corrected | `pdlc/engine/__tests__/adapter-descriptor.test.js`, `pdlc/engine/__tests__/adapter.test.js` | `pdlc/engine/lib/adapter.mjs` | 5 | T19, T20 | ⬚ |
| T36 | 🟢 `lib/transport.mjs`: shared child-env helper, four-key option boundary, `resolveTransport` with constant `kind`, `permissionMode` reporting, per-dispatch `apiKeySource` assertion widened by policy, and the engine-built guard configuration plus its `PreToolUse` carrier | `pdlc/engine/__tests__/transport-boundary.test.js`, `pdlc/engine/__tests__/transport.test.js` | `pdlc/engine/lib/transport.mjs` | 5 | T22, T28 | ⬚ |
| T37 | 🟢 **new** `lib/transport-cli.mjs`: `claude -p --output-format stream-json`, same result shape and error classes, per-dispatch `--settings` guard carrier removed after use | `pdlc/engine/__tests__/transport-cli.test.js` | `pdlc/engine/lib/transport-cli.mjs` | 5 | T23 | ⬚ |
| T38 | 🟢 `lib/skills.mjs`: inline the identifier's whole prompt-file set (`SKILL.md` plus every supplement in its directory, DEC-ENG-06) | `pdlc/engine/__tests__/skills-composition.test.js`, `pdlc/engine/__tests__/skills.test.js` | `pdlc/engine/lib/skills.mjs` | 5 | T24 | ⬚ |
| T39 | 🟢 `lib/run.mjs` v1: `loadDispatchableSkills()` returning the **union** of both modules' sets (R-ARCH-1 keeps the workflows import here), and `devInjection`/`queueInjection` completed to TSPEC §3.1's table | `pdlc/engine/__tests__/seam-contract.test.js`, `pdlc/engine/__tests__/run.test.js` | `pdlc/engine/lib/run.mjs` | 5 | T16, T25 | ⬚ |
| T40 | 🟢 `lib/report.mjs`: `buildEngineBlock` takes observed `transport` and `authSources`; the block carries every TSPEC §4.5 field | `pdlc/engine/__tests__/report-engine.test.js`, `pdlc/engine/__tests__/report.test.js` | `pdlc/engine/lib/report.mjs` | 5 | T32 | ⬚ |
| T41 | 🟢 `lib/handshake.mjs`: banner rows for the version pair, the effective base URL and the auth catalogue id; the `apiKeyPolicy` row (`:183` `buildBanner`) stops being flag-derived | `pdlc/engine/__tests__/handshake.test.js` | `pdlc/engine/lib/handshake.mjs` | 5 | T26 | ⬚ |
| T42 | 🟢 the O-2 measurement and its record, in one task: the opt-in live test that dispatches a real deletion attempt under `bypassPermissions`, and the first `M-ENG-09` rows (one per CI platform) it produces — so CI never observes an unrecorded state | `pdlc/engine/__tests__/m-eng-09.test.js` | `pdlc/engine/__tests__/live/guard-measurement.test.js`, `docs/_constraints/pdlc-engine-baseline.md` | 5 | T29 | ⬚ |
| T43 | 🟢 bootstrap v2: the `fs` read recorder over `readFileSync`, `promises.readFile`, `createReadStream`, `openSync`, `promises.open`, live for the whole run including the modules' dynamic import, enabled only for the AC-1.2 test | `pdlc/engine/__tests__/fs-observation.test.js` | `pdlc/engine/__tests__/_bootstrap.mjs` | 5 | T12, T33 | ⬚ |
| T44 | 🟢 `lib/startup.mjs`: structured `RungRecord[]`, rungs 0 and 5 added, **`EXPECTED_SKILLS` deleted** in favour of `loadDispatchableSkills()`, rung 4a's guard-interpreter probe, the AC-2.1 projection fields, and EC-GUARD-4's fail-closed capability refusal | `pdlc/engine/__tests__/startup-ladder.test.js`, `pdlc/engine/__tests__/startup-guard-executable.test.js`, `pdlc/engine/__tests__/startup.test.js` | `pdlc/engine/lib/startup.mjs` | 6 | T26, T27, T36, T39, T41 | ⬚ |
| T45 | 🟢 `lib/adapter.mjs` v2: the generalised retry machine — one shared budget, the timeout cap and its recorded terminal reason, `RetryRow` on every retry, `PauseRow` additionally on rate-limit retries | `pdlc/engine/__tests__/adapter-retry.test.js`, `pdlc/engine/__tests__/adapter.test.js` | `pdlc/engine/lib/adapter.mjs` | 6 | T21, T35 | ⬚ |
| T46 | 🟢 `[Fake first]` AC-1.2 consumer fixture: a scratch repo carrying a **populated** `.claude/workflows/` tree and the `distribution.checkEnabled` posture the criterion names | `pdlc/engine/__tests__/fs-observation.test.js` | `pdlc/engine/__tests__/fixtures/consumer-ac12/` | 6 | T18, T43 | ⬚ |
| T47 | 🟢 `bin/pdlc.mjs` + `lib/run.mjs` v2: `resolveTunables` at both `createAdapter` sites, the `tunables` block from the same return, the single exit mapping, the `loop` sub-block with `maxIterations` converted to `null` where it is built, `--max-iterations`, `--allow-api-key-billing`, usage errors | `pdlc/engine/__tests__/tunables.test.js`, `pdlc/engine/__tests__/exit-loop.test.js`, `pdlc/engine/__tests__/cli.test.js` | `pdlc/engine/bin/pdlc.mjs`, `pdlc/engine/lib/run.mjs` | 7 | T30, T31, T39, T40, T44 | ⬚ |
| T48 | 🟢 `[Fake first]` the five-configuration corpus harness: fixture repos and run wiring for runs i–v(b), stamping `corpusRun` on every record; run i pins wave mode (valid ownership manifest + local exit-`0` `testCommand`), `dispatch.timeoutMinutes: 7`, and well-formed `VERDICT:` trailers throughout | `pdlc/engine/__tests__/smoke.test.js` | `pdlc/engine/__tests__/_corpus.mjs`, `pdlc/engine/__tests__/fixtures/corpus/` | 8 | T18, T35, T36, T37, T38, T44, T45, T47 | ⬚ |
| T49 | 🟢 `[Fake first]` the write-replaying double: replays each dispatch's file writes, keyed by `(skill, phase, round index)` with the round derived from the directory listing, and writes no approval anchors | `pdlc/engine/__tests__/parity.test.js` | `pdlc/engine/__tests__/_replay-double.mjs` | 8 | T34, T47 | ⬚ |
| T50 | 🔴 the model-map witness table over recorded descriptors: rows 1 and 2 quantified over the Phase-I wave set in run i (and zero `haiku` in run i), rows 3/5/6/7 existential, row 4 the `(F, B)` pair on `promptHash`, `transport-contract-violation` and the injected `errorText` (AC-3.3, AT-ENG-29) | `pdlc/engine/__tests__/corpus-model-map.test.js` | — | 9 | T48 | ⬚ |
| T51 | 🟢 the opt-in live smoke path: one real small feature end to end against a scratch repo, §10.2's structural set plus one cross-review round reaching a parseable terminal verdict from a real model call; writes no observation records (AC-6.2, AT-ENG-65) | `pdlc/engine/__tests__/live/smoke.test.js` | `pdlc/engine/__tests__/live/smoke.test.js` | 9 | T48 | ⬚ |
| T52 | 🟢 assertion step v2: the model-map row and the pre-phase row (`no record with corpusRun != null has phase === null`) — rows 3 and 5, completing the five the table enumerates | `pdlc/engine/__tests__/corpus-model-map.test.js` | `pdlc/engine/__tests__/_assert-suite-wide.mjs` | 10 | T19, T50 | ⬚ |
| T53 | Baseline refresh: restate `M-ENG-06`'s per-criterion red/green rows against the delivered engine, so the constraints file stays the authority the next feature reads. Documentation only — no code, therefore no red phase | — (documentation) | `docs/_constraints/pdlc-engine-baseline.md` | 11 | T42, T49, T51, T52 | ⬚ |

## 4. File-ownership manifest

Every path any task writes, with its owning task per batch. This is the table that makes §5's
disjointness premise **mechanically auditable** rather than asserted: read it column-wise and no
batch shows one path twice.

| Path | Owner(s), by batch |
|---|---|
| `pdlc/engine/__tests__/preflight.test.js` | T00 (b1) |
| `pdlc/engine/__tests__/suite-spine.test.js` | T01 (b2) |
| `pdlc/engine/__tests__/spine-probe-a.test.js` | T01 (b2) |
| `pdlc/engine/__tests__/spine-probe-b.test.js` | T01 (b2) |
| `pdlc/engine/__tests__/hermeticity.test.js` | T02 (b2) |
| `pdlc/engine/__tests__/assert-suite-wide.test.js` | T03 (b2) |
| `pdlc/engine/__tests__/outcome.test.js` | T04 (b2) |
| `pdlc/engine/__tests__/catalogue.test.js` | T05 (b2) |
| `pdlc/engine/__tests__/auth.test.js` | T06 (b2) |
| `pdlc/workflows/__tests__/dispatchableSkills.test.js` | T07 (b2) |
| `pdlc/engine/__tests__/ci-arrangement.test.js` | T08 (b2) |
| `pdlc/engine/__tests__/fixtures-redaction.test.js` | T09 (b2) |
| `pdlc/engine/__tests__/run.test.js` | T10 (b2), T39 (b5), T47 (b7) |
| `pdlc/engine/__tests__/_run-suite.mjs` | T11 (b3) |
| `pdlc/engine/package.json` | T11 (b3) |
| `pdlc/engine/__tests__/_bootstrap.mjs` | T12 (b3), T43 (b5) |
| `pdlc/engine/lib/outcome.mjs` | T13 (b3) |
| `pdlc/engine/lib/catalogue.mjs` | T14 (b3) |
| `pdlc/engine/lib/auth.mjs` | T15 (b3) |
| `pdlc/workflows/orchestrate-dev.js` | T16 (b3) |
| `pdlc/workflows/orchestrate-queue.js` | T16 (b3) |
| `pdlc/workflows/dist/` (both bundles + `distribution-manifest.json`) | T16 (b3) |
| `.github/workflows/pr-tests.yml` | T17 (b3) |
| `.claude/pdlc.config.json` | T17 (b3) |
| `pdlc/engine/__tests__/fixtures/README.md` | T18 (b3) |
| `pdlc/engine/__tests__/fixtures/transport-sdk/` | T18 (b3) |
| `pdlc/engine/__tests__/fixtures/transport-cli/` | T18 (b3) |
| `pdlc/engine/__tests__/_assert-suite-wide.mjs` | T19 (b4), T52 (b10) |
| `pdlc/engine/__tests__/adapter-descriptor.test.js` | T20 (b4) |
| `pdlc/engine/__tests__/adapter-retry.test.js` | T21 (b4) |
| `pdlc/engine/__tests__/transport-boundary.test.js` | T22 (b4) |
| `pdlc/engine/__tests__/transport-cli.test.js` | T23 (b4) |
| `pdlc/engine/__tests__/skills-composition.test.js` | T24 (b4) |
| `pdlc/engine/__tests__/seam-contract.test.js` | T25 (b4) |
| `pdlc/engine/__tests__/startup-ladder.test.js` | T26 (b4) |
| `pdlc/engine/__tests__/startup-guard-executable.test.js` | T27 (b4) |
| `pdlc/engine/__tests__/guard-parity.test.js` | T28 (b4) |
| `pdlc/engine/__tests__/m-eng-09.test.js` | T29 (b4) |
| `pdlc/engine/__tests__/tunables.test.js` | T30 (b4) |
| `pdlc/engine/__tests__/exit-loop.test.js` | T31 (b4) |
| `pdlc/engine/__tests__/report-engine.test.js` | T32 (b4) |
| `pdlc/engine/__tests__/fs-observation.test.js` | T33 (b4) |
| `pdlc/engine/__tests__/parity.test.js` | T34 (b4) |
| `pdlc/engine/lib/adapter.mjs` | T35 (b5), T45 (b6) |
| `pdlc/engine/__tests__/adapter.test.js` | T35 (b5), T45 (b6) |
| `pdlc/engine/lib/transport.mjs` | T36 (b5) |
| `pdlc/engine/__tests__/transport.test.js` | T36 (b5) |
| `pdlc/engine/lib/transport-cli.mjs` | T37 (b5) |
| `pdlc/engine/lib/skills.mjs` | T38 (b5) |
| `pdlc/engine/__tests__/skills.test.js` | T38 (b5) |
| `pdlc/engine/lib/run.mjs` | T39 (b5), T47 (b7) |
| `pdlc/engine/lib/report.mjs` | T40 (b5) |
| `pdlc/engine/__tests__/report.test.js` | T40 (b5) |
| `pdlc/engine/lib/handshake.mjs` | T41 (b5) |
| `pdlc/engine/__tests__/handshake.test.js` | T41 (b5) |
| `pdlc/engine/__tests__/live/guard-measurement.test.js` | T42 (b5) |
| `docs/_constraints/pdlc-engine-baseline.md` | T42 (b5), T53 (b11) |
| `pdlc/engine/lib/startup.mjs` | T44 (b6) |
| `pdlc/engine/__tests__/startup.test.js` | T44 (b6) |
| `pdlc/engine/__tests__/fixtures/consumer-ac12/` | T46 (b6) |
| `pdlc/engine/bin/pdlc.mjs` | T47 (b7) |
| `pdlc/engine/__tests__/cli.test.js` | T47 (b7) |
| `pdlc/engine/__tests__/_corpus.mjs` | T48 (b8) |
| `pdlc/engine/__tests__/fixtures/corpus/` | T48 (b8) |
| `pdlc/engine/__tests__/smoke.test.js` | T48 (b8) |
| `pdlc/engine/__tests__/_replay-double.mjs` | T49 (b8) |
| `pdlc/engine/__tests__/corpus-model-map.test.js` | T50 (b9) |
| `pdlc/engine/__tests__/live/smoke.test.js` | T51 (b9) |

**Four notes the manifest cannot carry in a cell, each a place a wave could otherwise collide.**

- **`pdlc/engine/__tests__/fixtures/` is owned at directory-entry granularity, and the three owners
  never share a batch.** T18 owns `transport-sdk/`, `transport-cli/` and `README.md` (b3); T46 owns
  `consumer-ac12/` (b6); T48 owns `corpus/` (b8). Wave partitioning collides on a directory when one
  task owns it and another owns an entry under it, so no task may be given
  `pdlc/engine/__tests__/fixtures/` itself.
- **`pdlc/engine/__tests__/live/` has two owners in different batches** — T42's
  `guard-measurement.test.js` (b5) and T51's `smoke.test.js` (b9) — and neither owns the directory.
- **T51's test file and source file are the same path.** A live, opt-in test is its own
  implementation; there is no production module behind it, and this is the one row where the two
  columns coincide. It is not exempt from red-before-green so much as outside it: it is gated by a
  flag, never runs in CI (TSPEC §7.5), and cannot be red on a machine with no credential.
- **T16 owns three generated paths it must not hand-edit.** `pdlc/workflows/dist/` is written by
  `node pdlc/workflows/build-runtime.mjs`, run inside T16; the repo also ships
  `implementation.postWavePathspecs: ["pdlc/workflows/dist/"]`, so batch 3's chore commit carries
  them even if the task's own pathspec set is read narrowly.

## 5. Batch-safety rules and wave gates

## 6. Task dependency notes

## 7. Integration points

## 8. Definition of Done

## 9. Traceability — acceptance criteria to tasks

## 10. Risks, deferrals and open questions carried into implementation

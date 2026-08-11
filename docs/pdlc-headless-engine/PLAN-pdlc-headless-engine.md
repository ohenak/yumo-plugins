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
| pdlc | draft | Claude | 1.1 | 2026-08-11 |

**Changelog — v1.1** (addresses cross-review round 1, product-manager and test-engineer):

| Change | Findings |
|---|---|
| T07 and its DoD item take DEC-ENG-05's **containment** oracle with no exemption list; TSPEC §3.3's exactly-equal allow-list is recorded as superseded and raised as an erratum. The oracle is content-keyed, so T16's edits cannot move it | TE F-01, TE F-08 |
| The second matrix platform's `M-ENG-09` row is a named **operator step** in §5 with its command in §11; batch 5–11 gate wording says which platform's suite is expected red until it exists | TE F-02 |
| AT-ENG-02, 05, 17, 18, 32, 40, 57 and 66 get owning rows (T21, T22, T31, T32, T47) and a §9 table; AT-ENG-17/18 are red tasks, being the billing-safety pair | PM F-01, TE F-03 |
| §9's Acceptance-tests column restated **set-equal to FSPEC §14.1**, with this plan's additions marked as additions | PM F-01, PM F-03, TE F-04 |
| T22 carries the `apiKeySource` policy clauses that were T36's missing red — the abort-before-billing positive and its flag-widened falsifier | TE F-05 |
| `implementation.testCommand`'s post-T17 value quoted literally; the DoD requires **both** V1 and V2 with V2's ignore patterns preserved | PM F-02 |
| T10 moved into AC-1.5's green column with clauses (a) and (b) separated; given a status glyph and explicitly exempted from §5's batch-2 red gate | PM F-04, TE F-12 |
| §11's CI table corrected against `pr-tests.yml` at HEAD: `script-syntax` `:161`, `unit-tests` `:27`, `fresh-clone-bootstrap` `:103`, `npm ci` `:68`, `npm test` `:75` | PM F-05 |
| T48 labelled **extended** for `smoke.test.js` (tracked, 387 lines at HEAD); v(a)'s malformed trailer and v(b)'s unparseable table pinned as fixture content | PM F-06, TE F-06 |
| T25's absence oracles each paired with a positive on the same path | TE F-07 |
| Property strategies named for `classifyOutcome`, `resolveAuthPosture`, `computeRateLimitWaitMs`, `resolveTunables`, `parseVersion`/`satisfiesRange` | TE F-09 |
| ≥ 85 % branch-coverage floor on the four new modules, with V5 as its invoking command | TE F-10 |
| `_run-suite.mjs`, `_bootstrap.mjs`, `_assert-suite-wide.mjs` labelled **new** per TSPEC §8.3 | TE F-11 |
| DoD's AT enumeration spelled as all 69, `AT-ENG-01…AT-ENG-68` plus `AT-ENG-11a` | TE F-13 |
| AC-6.2's evidence stated as operator-recorded rather than suite-observed | PM F-07 |

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
| T04 | 🔴 outcome taxonomy: six members, total classifier, per-member provocation fixture, unrecognised ⇒ `transport-contract-violation`; **property strategy** — totality is universally quantified, so `classifyOutcome` is driven over a generated corpus of arbitrary thrown values (strings, `null`, `undefined`, non-`Error` objects, nested causes) and every result must be a member of `OUTCOMES`, never a throw and never `undefined` (AT-ENG-33, AT-ENG-34) | `pdlc/engine/__tests__/outcome.test.js` | — | 2 | T00 | ⬚ |
| T05 | 🔴 catalogue: unknown id throws, missing param throws, severity is entry data, `messageIds()` (AT-ENG-61, AT-ENG-62) | `pdlc/engine/__tests__/catalogue.test.js` | — | 2 | T00 | ⬚ |
| T06 | 🔴 auth posture: §3.2's six rows in first-match order over scratch `HOME` + env fixtures; empty key counts absent; unreadable ≠ absent in message only; **property strategy** — over the generated product of the row predicates' inputs, **exactly one** of the six rows matches any environment, so first-match order can never be masking an overlap (AT-ENG-13, AT-ENG-19) | `pdlc/engine/__tests__/auth.test.js` | — | 2 | T00 | ⬚ |
| T07 | 🔴 `[Fake first]` workflows-side derivation + no-bare-literal in **DEC-ENG-05's containment form, with no exemption list**: every skill-identifier-shaped literal in either module is a member of the exported `DISPATCHABLE_SKILLS` union. **Oracle choice, recorded:** TSPEC §3.3's "exempt sites equal — not merely contain — `orchestrate-dev.js:6229-6231`" is the *earlier draft* DEC-ENG-05 names and rejects as unwritable against HEAD (`DECISIONS:355-375`, restated `:846`), because bare literals sit at eleven dispatch sites; DECISIONS v1.3 is the later document and wins. The reviewer-role map keys need no exemption (they are genuine members); its *values* are role slugs and do not match the identifier shape. The shape predicate is itself asserted against the known set, never left to an unread regex. Content-keyed throughout — no absolute line number is an oracle, so T16's edits cannot turn it red for the wrong reason. TSPEC §3.3's superseded form is raised as an erratum (AC-3.5, AT-ENG-10) | `pdlc/workflows/__tests__/dispatchableSkills.test.js` | — | 2 | T00 | ⬚ |
| T08 | 🔴 CI arrangement: `pr-tests.yml` declares an `engine-tests` job on the `unit-tests` matrix whose body is `npm test`; `.claude/pdlc.config.json` `implementation.testCommand` runs the engine suite (TSPEC §7.6) | `pdlc/engine/__tests__/ci-arrangement.test.js` | — | 2 | T00 | ⬚ |
| T09 | 🔴 fixture redaction scanner with its positive control in the same test: scratch file carrying one instance of each documented rule **must** be flagged (AT-ENG-64, TSPEC §7.2) | `pdlc/engine/__tests__/fixtures-redaction.test.js` | — | 2 | T00 | ⬚ |
| T10 | 🟢 Anti-fork strengthening — tighten `run.test.js:64` from "a `file:` URL" to the repo-relative `pdlc/workflows/` path assertion; keep `:48`'s no-second-copy clause (AC-1.5, AT-ENG-49). Test-only and **green on landing**: the observable already exists at `run.mjs:58`, so this task has no separate green counterpart and is **explicitly exempt from §5's batch-2 red-terminal gate** — a passing T10 is the intended outcome, not a defect in the test | `pdlc/engine/__tests__/run.test.js` | — | 2 | T00 | ⬚ |
| T11 | 🟢 `[Fake first]` **new** `_run-suite.mjs` — suite runner: mint `PDLC_TEST_RUN_ID`, empty the run dir, spawn `node --test --import=./__tests__/_bootstrap.mjs __tests__/`, then the assertion step; `scripts.test` becomes the runner. **The runner forwards its own unrecognised arguments through to the spawned `node --test`**, so `npm test -- --experimental-test-coverage` is a hermetic coverage run rather than a second, bootstrap-less spelling of the suite (§8's coverage item depends on this; a test asserts a forwarded flag reaches the child's argv) | `pdlc/engine/__tests__/suite-spine.test.js` | `pdlc/engine/__tests__/_run-suite.mjs`, `pdlc/engine/package.json` | 3 | T01 | ⬚ |
| T12 | 🟢 `[Fake first]` **new** `_bootstrap.mjs` — bootstrap v1: construction guard, socket trap (`net`/`tls`), observation writer appending to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, failing loudly if the id is unset rather than minting one | `pdlc/engine/__tests__/hermeticity.test.js` | `pdlc/engine/__tests__/_bootstrap.mjs` | 3 | T01, T02 | ⬚ |
| T13 | 🟢 **new** `lib/outcome.mjs`: frozen six-member `OUTCOMES`, total `classifyOutcome({error, result, reportedFailure})`, records each result through the observation seam | `pdlc/engine/__tests__/outcome.test.js` | `pdlc/engine/lib/outcome.mjs` | 3 | T04 | ⬚ |
| T14 | 🟢 **new** `lib/catalogue.mjs`: frozen `MESSAGES`, `message(id, params)` throwing on unknown id or missing param and recording the id, `messageIds()` | `pdlc/engine/__tests__/catalogue.test.js` | `pdlc/engine/lib/catalogue.mjs` | 3 | T05 | ⬚ |
| T15 | 🟢 **new** `lib/auth.mjs`: `readLoginEvidence`, frozen `AUTH_ROWS`, pure `resolveAuthPosture` returning `{row, catalogueId, refuses, evidencePath}` | `pdlc/engine/__tests__/auth.test.js` | `pdlc/engine/lib/auth.mjs` | 3 | T06 | ⬚ |
| T16 | 🟢 workflows exports **and** bundle rebuild in one task: `DISPATCHABLE_SKILLS`, `ADVISORY_RUNG_SKILL`, the five `SKILL_*` constants, `SKILL_TRIAGE`; bare literals replaced at their dispatch sites; then `node pdlc/workflows/build-runtime.mjs`, with the regenerated artifacts in this task's commit | `pdlc/workflows/__tests__/dispatchableSkills.test.js` | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `pdlc/workflows/dist/orchestrate-queue.bundle.js`, `pdlc/workflows/dist/distribution-manifest.json` | 3 | T07 | ⬚ |
| T17 | 🟢 CI + wave gate: add the `engine-tests` job on **the matrix that exists at HEAD** — `os: [ubuntu-latest]`, node 20 (`pr-tests.yml:40`; `macos-latest` was dropped on purpose in `410f3a07`, "ci: drop macos-latest from the unit-test matrix", and this feature does not reverse that) — `working-directory: pdlc/engine`, `npm ci` then `npm test`; extend `implementation.testCommand` so a wave gate runs the engine suite too | `pdlc/engine/__tests__/ci-arrangement.test.js` | `.github/workflows/pr-tests.yml`, `.claude/pdlc.config.json` | 3 | T08 | ⬚ |
| T18 | 🟢 `[Fake first]` per-transport recorded fixture sets (SDK message streams: `system/init` with `apiKeySource`, `rate_limit_event`, terminal `result`; `claude -p` stream-json lines) plus the refresh/redaction README (AC-6.3, AT-ENG-64) | `pdlc/engine/__tests__/fixtures-redaction.test.js` | `pdlc/engine/__tests__/fixtures/README.md`, `pdlc/engine/__tests__/fixtures/transport-sdk/`, `pdlc/engine/__tests__/fixtures/transport-cli/` | 3 | T09 | ⬚ |
| T19 | 🟢 `[Fake first]` **new** `_assert-suite-wide.mjs` — assertion step v1: emptiness guard, spine self-assertion (one run dir, both probes), catalogue row, outcome row — rows 1 and 2 of TSPEC §7.4's table | `pdlc/engine/__tests__/assert-suite-wide.test.js` | `pdlc/engine/__tests__/_assert-suite-wide.mjs` | 4 | T03, T11, T12, T13, T14 | ⬚ |
| T20 | 🔴 adapter descriptor: `_phase` run state and its prefix normalisation, engine-stamped `timeoutMs`, terminal `outcome`/`errorText`, one settlement line per attempt, `byPhase`, `authSources`, `createGit` identity ≠ module default (AT-ENG-28, AT-ENG-29, AT-ENG-16) | `pdlc/engine/__tests__/adapter-descriptor.test.js` | — | 4 | T13, T14 | ⬚ |
| T21 | 🔴 retry machine: FSPEC §8.2's eight sequences, one shared budget, the one-timeout-per-dispatch cap with `terminal` ∈ {`timeout-cap`, `budget-exhausted`}, per-dispatch budget locality, `auth-failure` never retried; EC-FAIL-2…EC-FAIL-6 one case each; **property strategy** — the wait function `computeRateLimitWaitMs` (`adapter.mjs:75`, base `:58`, cap `:59`, jitter `:60`) is checked over generated attempt indices for its three laws: monotone non-decreasing in the attempt, never above the 15-minute cap, always within the jitter band of the un-jittered value (AT-ENG-35, AT-ENG-36, AT-ENG-37, AT-ENG-39, AT-ENG-40) | `pdlc/engine/__tests__/adapter-retry.test.js` | — | 4 | T13 | ⬚ |
| T22 | 🔴 transport boundary: option-key containment over `{model, cwd, timeoutMs, maxTurns}` plus `cwd`/`timeoutMs` presence on **every** dispatch; env spread carries both proxy variables; unrecognised model forwarded; single permission posture. **Plus the `apiKeySource` policy clauses, which are T36's only red** (BR-AUTH-4/BR-AUTH-5, `transport.mjs:201-206` at HEAD): (i) a fixture reporting a source outside the allowed set aborts that dispatch **before billing**, naming the raw value; (ii) a fixture whose source changes at dispatch 3 of 5 stops there with **both** values in the report; (iii) the falsifier on the same path — the flag-widened set admits the same fixture and the dispatch proceeds. Also EC-DISP-4 and EC-DISP-5, one case each (AT-ENG-17, AT-ENG-18, AT-ENG-26, AT-ENG-27, AT-ENG-30, AT-ENG-31, AT-ENG-32) | `pdlc/engine/__tests__/transport-boundary.test.js` | — | 4 | T13, T18 | ⬚ |
| T23 | 🔴 fallback transport over its recorded fixtures: same `DispatchResult`, same four error classes, absent terminal result ⇒ `TransportError`, composed prompt identical across transports (AT-ENG-22, AC-6.3) | `pdlc/engine/__tests__/transport-cli.test.js` | — | 4 | T13, T18 | ⬚ |
| T24 | 🔴 prompt composition: for **every** member of the derived set one invocation, full prompt-file text present, no Skill-tool instruction, supplements exactly when the dispatch asks, `--dry-run` executes nothing (AT-ENG-20…AT-ENG-25) | `pdlc/engine/__tests__/skills-composition.test.js` | — | 4 | T16 | ⬚ |
| T25 | 🔴 seam contract: TSPEC §3.1's per-module table exactly — supplied seams present, `_sessionAgent` unwired, `_runCommand` non-null for dev, `_runPipeline` supplied for queue, fall-through to the throwing stub is fatal and names the seam. **Each absence clause is paired with its positive on the same path**, so an omitted seam and an unreached one are distinguishable: `_sessionAgent` unwired is paired with two successive dispatches producing two independent sessions (observable as two fresh contexts, not one resumed); the twelve un-overridden IO seams are paired with an assertion that the modules' Node defaults are actually *exercised* — the existing `smoke.test.js` already drives the consumer-relative `_readFile`/`_writeFile`/`_listFiles`/`_checkFile`/`_hashFile`/`_git` path, so this reuses it rather than building a second harness (AT-ENG-51, EC-PAR-5) | `pdlc/engine/__tests__/seam-contract.test.js` | — | 4 | T16 | ⬚ |
| T26 | 🔴 ladder rungs 0–5: total, ordered, post-failure rungs `skipped`-with-reason; `doctor`'s three AC-2.1 facts equal the run's; derived rung-4 set-equality both directions (AT-ENG-06…AT-ENG-12) | `pdlc/engine/__tests__/startup-ladder.test.js` | — | 4 | T15, T16 | ⬚ |
| T27 | 🔴 rung 4a guard executability: no candidate runs ⇒ refusal naming each candidate, its outcome and the remedy, nothing dispatched; a present-but-not-runnable earlier candidate with a runnable later one ⇒ rung passes (AT-ENG-11a, EC-START-10/11) | `pdlc/engine/__tests__/startup-guard-executable.test.js` | — | 4 | T15 | ⬚ |
| T28 | 🔴 guard parity, three clauses each with the falsifying counterpart in the same file, deny-path performing the deletion it guards, host carrying no pdlc hook registration (AT-ENG-41…AT-ENG-44) | `pdlc/engine/__tests__/guard-parity.test.js` | — | 4 | T14, T18 | ⬚ |
| T29 | 🔴 M-ENG-09 gate: no row for the running platform ⇒ hermetic suite **fails** with a catalogue-registered message naming the missing measurement and the opt-in command; a row recording `denyFired: no` while the hook carrier ships ⇒ fails (DEC-ENG-04, TSPEC §6.5) | `pdlc/engine/__tests__/m-eng-09.test.js` | — | 4 | T14 | ⬚ |
| T30 | 🔴 tunables: `resolveTunables` over TSPEC §4.6's five rows; the two operator-owned rows are flag-only and ignore config (AT-ENG-03); effective-timeout oracle at `dispatch.timeoutMinutes: 7` asserting the literal `420000` at the boundary and `7` in the report; **property strategy** — over generated `(flag, config, default)` triples the resolution is a total function whose result equals the highest-precedence *present* source, and the two operator-owned rows never read config | `pdlc/engine/__tests__/tunables.test.js` | — | 4 | T14 | ⬚ |
| T31 | 🔴 exit mapping and the loop sub-block: one mapping function over the module `outcome`; halt ⇒ `2`, engine refusal ⇒ `1`; `stopReason` total over all four loop exits; `maxIterations` is `null` in the **in-memory** object; EC-Q-2, EC-Q-5, EC-Q-6 and EC-Q-7, one case each (AT-ENG-04, AT-ENG-53…AT-ENG-57) | `pdlc/engine/__tests__/exit-loop.test.js` | — | 4 | T14 | ⬚ |
| T32 | 🔴 report `engine` block: every FSPEC §12.2 row present, counts present-and-zero, `retries[]` empty not absent, `engine` is the only key `stampReport` adds, one JSON line last on stdout; EC-REP-1, EC-REP-2 and EC-REP-3, one case each (AT-ENG-58, AT-ENG-59, AT-ENG-60, AT-ENG-66, AT-ENG-68) | `pdlc/engine/__tests__/report-engine.test.js` | — | 4 | T14 | ⬚ |
| T33 | 🔴 AC-1.2 instrument: recording non-empty; the two positive read clauses; the `.claude/workflows/` absence clause asserted only alongside them; a deliberate read under that tree **must** fail clause 3 (AT-ENG-47, AT-ENG-48, AT-ENG-50) | `pdlc/engine/__tests__/fs-observation.test.js` | — | 4 | T12 | ⬚ |
| T34 | 🔴 parity oracle: the write-less double **fails** this test first; then §10.2's structural clauses; two successive reviewer dispatches produce two files, not one rewritten; the double writes no approval anchors (AT-ENG-45, AT-ENG-46, AT-ENG-51) | `pdlc/engine/__tests__/parity.test.js` | — | 4 | T18 | ⬚ |
| T35 | 🟢 `lib/adapter.mjs` v1: `_phase` run state + normalisation, `dispatchTimeoutMs` constructor option stamped as `timeoutMs`, descriptor terminal half, settlement-time append (composition-time with `null` terminals for the inert transport), `byPhase`/`RetryRow`/`PauseRow`/`DenialRow` phase fields, `getAuthSources()`, stale `:266-268` comment corrected | `pdlc/engine/__tests__/adapter-descriptor.test.js`, `pdlc/engine/__tests__/adapter.test.js` | `pdlc/engine/lib/adapter.mjs` | 5 | T19, T20 | ⬚ |
| T36 | 🟢 `lib/transport.mjs`: shared child-env helper, four-key option boundary, `resolveTransport` with constant `kind`, `permissionMode` reporting, per-dispatch `apiKeySource` assertion widened by policy, and the engine-built guard configuration plus its `PreToolUse` carrier | `pdlc/engine/__tests__/transport-boundary.test.js`, `pdlc/engine/__tests__/transport.test.js` | `pdlc/engine/lib/transport.mjs` | 5 | T22, T28 | ⬚ |
| T37 | 🟢 **new** `lib/transport-cli.mjs`: `claude -p --output-format stream-json`, same result shape and error classes, per-dispatch `--settings` guard carrier removed after use | `pdlc/engine/__tests__/transport-cli.test.js` | `pdlc/engine/lib/transport-cli.mjs` | 5 | T23 | ⬚ |
| T38 | 🟢 `lib/skills.mjs`: inline the identifier's whole prompt-file set (`SKILL.md` plus every supplement in its directory, DEC-ENG-06) | `pdlc/engine/__tests__/skills-composition.test.js`, `pdlc/engine/__tests__/skills.test.js` | `pdlc/engine/lib/skills.mjs` | 5 | T24 | ⬚ |
| T39 | 🟢 `lib/run.mjs` v1: `loadDispatchableSkills()` returning the **union** of both modules' sets (R-ARCH-1 keeps the workflows import here), and `devInjection`/`queueInjection` completed to TSPEC §3.1's table | `pdlc/engine/__tests__/seam-contract.test.js`, `pdlc/engine/__tests__/run.test.js` | `pdlc/engine/lib/run.mjs` | 5 | T16, T25 | ⬚ |
| T40 | 🟢 `lib/report.mjs`: `buildEngineBlock` takes observed `transport` and `authSources`; the block carries every TSPEC §4.5 field | `pdlc/engine/__tests__/report-engine.test.js`, `pdlc/engine/__tests__/report.test.js` | `pdlc/engine/lib/report.mjs` | 5 | T32 | ⬚ |
| T41 | 🟢 `lib/handshake.mjs`: banner rows for the version pair, the effective base URL and the auth catalogue id; the `apiKeyPolicy` row (`:183` `buildBanner`) stops being flag-derived; **property strategy** — `parseVersion`/`satisfiesRange` (`:20`, `:86`) are a comparator with an ordering law, checked over generated version triples for totality, antisymmetry and transitivity, plus the round-trip that a version inside a range stays inside it under patch bumps | `pdlc/engine/__tests__/handshake.test.js` | `pdlc/engine/lib/handshake.mjs` | 5 | T26 | ⬚ |
| T42 | 🟢 the O-2 measurement and its record, in one task: the opt-in live test that dispatches a real deletion attempt under `bypassPermissions`, and the first `M-ENG-09` rows it produces — so CI never observes an unrecorded state. **A wave agent runs on one host and can therefore produce only one row**, and T29 keys on `process.platform`, not on a matrix entry. The obligation is therefore one row per platform on which the hermetic suite actually runs: `linux` (the `engine-tests` job's only platform, `pr-tests.yml:40`) and the wave host's platform, which is `darwin` whenever waves run on the maintainer's macOS. T42 records the row for the host its own wave runs on; **the remaining row — in practice `linux`, the one CI observes — is a named operator step, not a task**: a maintainer runs `PDLC_LIVE=1 node --test __tests__/live/guard-measurement.test.js` on a host of that platform and commits the row, and until it exists the `engine-tests` job is red — by T29's design, not by accident. If the wave host is itself `linux`, the two coincide and one row discharges the obligation; no second row is invented to satisfy a matrix entry that does not exist. §5's batch-5 gate carries this as an explicit precondition and §11 carries the command, so it is on the schedule rather than in the reader's head | `pdlc/engine/__tests__/m-eng-09.test.js` | `pdlc/engine/__tests__/live/guard-measurement.test.js`, `docs/_constraints/pdlc-engine-baseline.md` | 5 | T29 | ⬚ |
| T43 | 🟢 bootstrap v2: the `fs` read recorder over `readFileSync`, `promises.readFile`, `createReadStream`, `openSync`, `promises.open`, live for the whole run including the modules' dynamic import, enabled only for the AC-1.2 test | `pdlc/engine/__tests__/fs-observation.test.js` | `pdlc/engine/__tests__/_bootstrap.mjs` | 5 | T12, T33 | ⬚ |
| T44 | 🟢 `lib/startup.mjs`: structured `RungRecord[]`, rungs 0 and 5 added, **`EXPECTED_SKILLS` deleted** in favour of `loadDispatchableSkills()`, rung 4a's guard-interpreter probe, the AC-2.1 projection fields, and EC-GUARD-4's fail-closed capability refusal | `pdlc/engine/__tests__/startup-ladder.test.js`, `pdlc/engine/__tests__/startup-guard-executable.test.js`, `pdlc/engine/__tests__/startup.test.js` | `pdlc/engine/lib/startup.mjs` | 6 | T26, T27, T36, T39, T41 | ⬚ |
| T45 | 🟢 `lib/adapter.mjs` v2: the generalised retry machine — one shared budget, the timeout cap and its recorded terminal reason, `RetryRow` on every retry, `PauseRow` additionally on rate-limit retries | `pdlc/engine/__tests__/adapter-retry.test.js`, `pdlc/engine/__tests__/adapter.test.js` | `pdlc/engine/lib/adapter.mjs` | 6 | T21, T35 | ⬚ |
| T46 | 🟢 `[Fake first]` AC-1.2 consumer fixture: a scratch repo carrying a **populated** `.claude/workflows/` tree and the `distribution.checkEnabled` posture the criterion names | `pdlc/engine/__tests__/fs-observation.test.js` | `pdlc/engine/__tests__/fixtures/consumer-ac12/` | 6 | T18, T43 | ⬚ |
| T47 | 🟢 `bin/pdlc.mjs` + `lib/run.mjs` v2: `resolveTunables` at both `createAdapter` sites, the `tunables` block from the same return, the single exit mapping, the `loop` sub-block with `maxIterations` converted to `null` where it is built, `--max-iterations`, `--allow-api-key-billing`, usage errors — including BR-CLI-1's `--flag value` ≡ `--flag=value` equivalence asserted on the **composed descriptor**, and EC-CLI-2…EC-CLI-7 one case each with BR-REP-0a's split observed (EC-CLI-2 and EC-CLI-5 emit no report line, EC-CLI-3 does) (AT-ENG-02, AT-ENG-05) | `pdlc/engine/__tests__/tunables.test.js`, `pdlc/engine/__tests__/exit-loop.test.js`, `pdlc/engine/__tests__/cli.test.js` | `pdlc/engine/bin/pdlc.mjs`, `pdlc/engine/lib/run.mjs` | 7 | T30, T31, T39, T40, T44 | ⬚ |
| T48 | 🟢 `[Fake first]` the five-configuration corpus harness: fixture repos and run wiring for runs i–v(b), stamping `corpusRun` on every record; run i pins wave mode (valid ownership manifest + local exit-`0` `testCommand`), `dispatch.timeoutMinutes: 7`, and well-formed `VERDICT:` trailers throughout. **v(a) and v(b) are pinned by fixture content, not by hope**: v(a)'s reviewer fixture emits a *malformed* trailer (`VERDICT — Approve`, no colon) so M-ENG-07 row 6 is witnessed by a real unparseable verdict, and v(b)'s PLAN fixture carries a task table whose header cell reads `Task` rather than `#`/`ID` so row 7 is witnessed by a genuinely unparseable table. Without these two the corpus is one comma away from making both rows unwitnessable. **`smoke.test.js` is `extended`, not new** — it is tracked at HEAD (387 lines) and is today's offline end-to-end proof of engine↔module wiring against the real `orchestrate-dev.js` with only the transport doubled; every existing assertion in it survives, and T48 adds the corpus drivers beside them. TSPEC §8.3 does not classify the file at all; raised as an erratum | `pdlc/engine/__tests__/smoke.test.js` | `pdlc/engine/__tests__/_corpus.mjs`, `pdlc/engine/__tests__/fixtures/corpus/` | 8 | T18, T35, T36, T37, T38, T44, T45, T47 | ⬚ |
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

These are dispatcher contract, not documentation. The `Batch` column re-derives mechanically as
`max(batch of dependencies) + 1`, with T00 the single batch-1 source; §4's manifest is the
disjointness premise; and no prose note anywhere in this plan substitutes for a `Deps` edge.

**Batch composition and its gate wording.**

| Batch | Tasks | Character | Gate wording |
|---|---|---|---|
| 1 | T00 | pre-flight, green-on-HEAD | full engine suite green |
| 2 | T01–T10 | **RED-terminal** — nine failing test files plus one strengthening | the batch's nine **new** tests (T01–T09) fail **for the reason each names** (missing module, missing export, missing job) and every pre-existing test stays green; a batch-2 test that *passes* is a defect in the test, not progress — **with T10 explicitly exempt**: it strengthens an assertion whose observable already exists at `run.mjs:58`, has no green counterpart, and is expected to pass on landing. A red T10 is the defect there |
| 3 | T11–T18 | green over batch 2 | batch-2 tests now pass; full suite green; `node pdlc/workflows/build-runtime.mjs --check` exits 0 |
| 4 | T19, T20–T34 | **mixed, and therefore RED-terminal** — T19 is green, T20–T34 are fifteen red test files | T19's assertion step passes its own driver; T20–T34 fail for their stated reasons; pre-existing tests green |
| 5 | T35–T43 | green | batch 4's reds for these owners now pass; full suite green **on the platform the wave runs on**. Precondition, not an aspiration: T29's gate fails wherever no `M-ENG-09` row exists for `process.platform`, and T42's wave agent can record only its own host's row — so "full suite green" here and in batches 6–11 means *green on a platform that has a row*. The wave supplies its own host's row; the operator step below supplies the row for the platform CI runs on (`linux`) when the wave host is not that platform |
| 6 | T44, T45, T46 | green | full suite green |
| 7 | T47 | green | full suite green |
| 8 | T48, T49 | green (harness) | full suite green, and the corpus's five configurations each produce ≥1 record |
| 9 | T50, T51 | **RED-terminal for T50**; T51 is flag-gated and does not run in the gate | T50 fails naming the missing suite-wide rows; T51 is not executed by the gate |
| 10 | T52 | green | full suite green, **including** T50 |
| 11 | T53 | documentation | full suite green; no code change |

**The one operator step on this plan's critical path, named rather than assumed.** T29 keys the
`M-ENG-09` lookup on `process.platform`, so the obligation is one row per platform on which the
hermetic suite is actually run — **not** one row per matrix entry. At HEAD that set has at most two
members: `linux`, because `engine-tests` inherits `unit-tests`' matrix and that matrix is
`os: [ubuntu-latest]` (`pr-tests.yml:40` — `macos-latest` was dropped deliberately in `410f3a07`,
nine days before this plan, and nothing here re-adds it); and the platform the Phase-I wave host
runs on, which is `darwin` when waves run on the maintainer's macOS. If those coincide, one row
discharges the obligation and there is no operator step.

The producing instrument — `__tests__/live/guard-measurement.test.js` — is credentialed and opt-in,
so it never runs in CI and a wave agent can run it only on its own host. T42 records the row for the
host the batch-5 wave runs on. **When the wave host is not `linux`, CI's own row is the one no
automation can produce, and it is recorded by hand, by a maintainer, before the feature can be green
in CI**: run `PDLC_LIVE=1 node --test __tests__/live/guard-measurement.test.js` on a Linux host and
commit the appended row to `docs/_constraints/pdlc-engine-baseline.md`. Until that lands, T17's
`engine-tests` job is red for want of a row — which is exactly what DEC-ENG-04 asks for (an
unrecorded measurement is *loud*), and is not a defect to be repaired by loosening T29. It is a
Phase-DOD precondition, and §8 carries it as a DoD item.

**Batch numbers here are documentation; the runtime derives its own ready-sets.** The `Batch` column
in §3 is `max(dep batches) + 1`, which yields the eleven batches above; the shipped dispatcher
re-derives finer ready-sets from the same `Deps` edges and will run more waves than eleven. The
edges are identical, so no gate below is attached to a wave the runtime cannot form — but an
operator watching a run should match a stopped wave to a *task id*, not to a batch number in this
section.

**Why three batches are deliberately RED-terminal and cannot be gated on "full suite green".** Batches
2, 4 and 9 end with failing tests by construction — that is the red half of TDD, and a blanket
"suite green after every batch" gate is unsatisfiable there. Their gate is the split form above.
This repo's shipped wave gate runs `implementation.testCommand` and commits only on success, so
**the batches that end red must be run with the split gate wording rather than the default**, and
that is a scheduling instruction to the dispatcher, not a note.

**Shared prerequisites are created serially in batch 1 or 3 by a single owning task.** There is no
package marker to add (`pdlc/engine/package.json` exists at HEAD and is T11's), and the two shared
test helpers have single owners created before any consumer: `_bootstrap.mjs` (T12, b3) and
`_run-suite.mjs` (T11, b3). Every task that needs the observation seam depends on T12 through the
chain T12 → T19 → T35, never on filename luck. The two `[Fake first]` harness modules that
production tests read — `_corpus.mjs` (T48) and `_replay-double.mjs` (T49) — are created strictly
upstream of their only consumers, T50 and T34's green run respectively.

**Three single-writer hazards this plan resolves by serialisation rather than by prose.**

| Hazard | Resolution |
|---|---|
| `lib/adapter.mjs` carries two distinct changes — the descriptor (T35) and the retry machine (T45) | split across batches 5 and 6 with `T45 Deps T35`, never merged into one oversized task and never co-scheduled |
| `lib/run.mjs` carries the skill-set loader (T39) and the CLI-facing loop/exit wiring (T47) | split across batches 5 and 7 with `T47 Deps T39` |
| `__tests__/_bootstrap.mjs` carries the hermeticity spine (T12) and the AC-1.2 `fs` recorder (T43) | split across batches 3 and 5 with `T43 Deps T12` |

**The one ordering rule that is a correctness requirement, not a convenience.** T29 (the M-ENG-09
gate) and T42 (the first rows) are adjacent by dependency and must land in the same wave-sequence
without an intervening green gate that would observe an unrecorded state. TSPEC §6.5 words this as
"the gate and the first M-ENG-09 rows land in the same task"; this plan splits them into a red task
and its only green because the gate is a test and the rows are data, and preserves the property by
making T42 the **sole** dependent of T29 — no other task can turn CI red-for-an-unrelated-reason in
between. If an implementer prefers TSPEC's literal single-task form, merging T29 into T42 is a
sanctioned simplification; splitting T42's rows away from T29's gate is not.

## 6. Dependencies — task ordering and the edges that matter

The `Deps` column is complete; this section explains the edges whose *absence* would be the easy
mistake, and the two places where an edge that looks natural is deliberately not there.

**Edges that exist because a wrong order is silently green, not loudly red.**

- **T13, T14 → T19 → T35.** The outcome and catalogue modules record through the observation seam,
  and the assertion step reads it. Building the step before either module leaves it asserting over
  an empty union, and the forward direction `observed ⊆ OUTCOMES` is *true* of the empty set. This
  chain is why T19 depends on T13 and T14 rather than only on its own driver T03.
- **T16 → T26, T16 → T24, T16 → T39.** Rung 4's set-equality, the per-identifier prompt-composition
  sweep and `loadDispatchableSkills()` all read `DISPATCHABLE_SKILLS` as **imported data**. Without
  the export they would fall back to a hand-typed array, which is the declaration BR-START-4 forbids
  and the shape DEC-ENG-05 rejects; the edge is what makes the fallback unavailable.
- **T18 → T22, T23, T28, T34, T48.** Every fixture-driven property reads the recorded sets. An
  implementer who writes the transport tests first will invent a synthetic stream shape, and the
  fixtures then get written to match the test — the transport upgrade that the fixtures exist to
  catch becomes invisible (TSPEC §7.2).
- **T43 → T46.** The consumer fixture is only meaningful once the recorder exists; a populated
  `.claude/workflows/` tree with nothing watching it satisfies AC-1.2 clause 3 for the wrong reason,
  which is exactly the failure §7.7 designs around.
- **T44 → T47.** The CLI's `doctor` projection renders the ladder's three AC-2.1 facts, and the
  `tunables` block is built at the same two `createAdapter` sites that resolve them. Wiring the CLI
  before the ladder returns those fields produces a `doctor` that prints a rung array and a run that
  reports different values — the divergence TSPEC §4.3 requires one function to prevent.
- **T35, T36, T37, T38, T44, T45, T47 → T48.** The corpus is a whole-pipeline instrument. Rows 1 and
  2 of the witness table need a run's full phase context, row 4 needs a mid-run forced failure, and
  row 5 needs the queue's Phase-0 triage — none of which exists until the adapter, both transports,
  the composer, the ladder, the retry machine and the CLI are all green.

**Two edges deliberately absent.**

- **T50 does not depend on T52, and T52 depends on T50.** The witness table is written as a test
  over synthetic and recorded descriptors *before* the assertion step implements it. Reversing this
  produces the failure DEC-ENG-10 and TSPEC §7.4 both name: an assertion step written first is
  written against whatever the accumulator happens to contain, and the row that "passes" is the one
  the data already satisfied.
- **No task depends on T51.** The live smoke path is opt-in, never in CI, and gates nothing. T53
  lists it only so the baseline refresh happens after someone has run it, not because any code path
  waits on it. Making a hermetic task depend on a credentialed one would put a credential on the
  critical path of an unattended pipeline.

**The one dependency that is a `Deps` edge and also a same-task rule.** T16's three generated paths
are not a downstream task. `stripModuleSyntax` (`pdlc/workflows/build-runtime.mjs:45`) inlines the
whole module body, so the exports change the bundle bytes even though the bundles publish no such
name (`:87`, `:107` are explicit publish lists), and `artifact-freshness`
(`.github/workflows/pr-tests.yml:77`) gates on `build-runtime.mjs --check` producing no diff. A
batch that commits `orchestrate-dev.js` without the rebuild leaves CI red at Phase PUB for a reason
unrelated to the work, and the repair looks like a CI problem rather than a missed step.

**Cycle check.** Every edge above points from a lower batch to a higher one, and the `Batch` column
is `max(dep batches) + 1` on every row, so the graph is a DAG by construction: a cycle would require
an edge into an equal-or-lower batch, which no row has. `parsePlanTasks` plus
`computeTopologicalBatches` are run against this table at the close of Phase P, and the header cells
above (`#`, `Deps`) are the exact spellings that parser accepts. **The rule, stated once so it does
not depend on an enumeration staying total:** the parser accepts a table only when its header
carries **both** an exact id cell (`#`, `ID`, `Task ID`) **and** an exact dependencies cell
(`Deps`, `Dependencies`, `Depends on`, `Prerequisites`); a `#` cell alone is not enough, and
substring look-alikes are deliberately not matched. §3's task table is the only table in this file
with the second cell, and is therefore the only one the parser accepts.

Three other tables here open with a `#` cell and are safe for exactly that reason — §7's integration
table (`# | Integration point at HEAD | What attaches`), §10's open questions
(`# | Question | Disposition here`) and §11's command table
(`# | Command | Observes | State at HEAD`) — and §4's ownership manifest is safe for a stronger one,
having no id-like column at all (`Path | Owner(s), by batch`). The operative consequence is the same
in all four cases and is a constraint on future edits, not a property of today's text: **adding a
`Deps`-, `Dependencies`-, `Depends on`- or `Prerequisites`-spelled column to any of them would make
that table parseable as a task table and break the Phase-P self-parse.** That is why §7 names its
edges in prose rather than in a column, and why §10 and §11 should keep doing the same.

## 7. Integration points

Each row names the existing code or configuration a task attaches to, measured at HEAD, so the
integration is a known edit rather than a discovery made mid-wave.

| # | Integration point at HEAD | What attaches |
|---|---|---|
| T11 | `pdlc/engine/package.json` `scripts.test` is `node --test __tests__/` | replaced by `node __tests__/_run-suite.mjs`; this one spelling is what makes CI and the local suite assert the same property (TSPEC §7.6) |
| T12 | `transport.mjs:17` `defaultQueryFn` imports the SDK lazily; `transport.mjs:135` `createTransport` takes an injectable `queryFn` | the construction guard hooks the path a test takes when it *omits* `queryFn` — the seam that already exists is what makes hermeticity observable rather than aspirational |
| T13 | `transport.mjs:98` `classifyThrown` already funnels every thrown value into the four classes, with the unrecognised arm at `:123` | `classifyOutcome` maps those four plus `reportedFailure`; the total-without-fallback property is inherited from `:123`, not re-implemented |
| T14 | strings are built inline at `handshake.mjs:124` (`REMEDY`), `startup.mjs:139`, `bin/pdlc.mjs:36` (`USAGE`) | each becomes a registered id; the inline sites are the closed list T05's test enumerates |
| T15 | `startup.mjs:49`, `:64` and `handshake.mjs:183` `buildBanner` render an `apiKeyPolicy` row **from the CLI flag alone** — HEAD inspects neither environment nor login record | `lib/auth.mjs` supplies the observed posture; T41 rewires the banner row to it |
| T16 | `PHASE_DISPATCH` exported at `orchestrate-dev.js:3337`, rows `:3344`–`:3435`; `ADVISORY_RUNG_SKILL` module-local at `:1797`; `orchestrate-queue.js:41` already imports from `orchestrate-dev.js` on one line, as `stripModuleSyntax` requires | five role keys are flattened out of `PHASE_DISPATCH`, six constants are promoted, and the queue's two-member set is derived; the single-line import at `:41` is extended, never wrapped |
| T17 | `pr-tests.yml` runs four jobs — `unit-tests` `:27`, `artifact-freshness` `:77`, `fresh-clone-bootstrap` `:103`, `script-syntax` `:161` — and **none runs `pdlc/engine/`'s tests**; `.claude/pdlc.config.json` `implementation.testCommand` is `cd pdlc/workflows && npm test …` | a fifth job on the `unit-tests` matrix, and a `testCommand` that runs **both** suites — engine first, then workflows with its ignore patterns preserved verbatim (§11 quotes the literal post-change value) — so this feature's own waves are gated on the code they are writing without blinding any other feature's |
| T20 | `adapter.mjs:266-268`'s comment claims `opts.label` is one of two fields the modules pass; `:274` `const tag = label \|\| skill`; `:278-281` builds `dispatchOpts`; `:357-359` logs the phase label and discards it | the `_phase` seam is retained as run state and stamped; the stale comment is corrected in the same task, because leaving it is how the next reader keys something on `label` |
| T22 | `transport.mjs:159` spreads the parent env; `:162-166` is the `AbortController` timer; `:170-174` pairs `permissionMode` with `allowDangerouslySkipPermissions`; `:176-178` assign `model`/`cwd`/`maxTurns`; `:199-206` reads `apiKeySource` from `system/init` | the shared child-env helper is factored out of `:159` so both transports carry one rule, and BR-PARITY-5's sentinel test asserts it survives on both |
| T28 | `pdlc/hooks/scripts/guard-harvest-before-delete.sh` — stdin JSON, unparseable ⇒ exit 0 (`:29-30`), scope match (`:35-38`), directory `LEARNINGS-*.md` check (`:53-57`), exit 2 blocks and feeds stderr back (`:6`) | both carriers invoke **the shipped script** and consume its exit code; no JavaScript reimplementation, so "exists on the branch" keeps one meaning (NG-1, DEC-ENG-03) |
| T27 | the same script's interpreter probe, `:13-21`: candidates `python3`, `python`, `py`, each **run** (`"$cand" -c "import sys"`), and `[ -z "$PY_BIN" ] && exit 0` — fail-open | rung 4a probes the identical candidate set in the identical order, by running rather than by `PATH` presence, and refuses; the script's own fail-open posture is untouched |
| T30 | `adapter.mjs:57` `maxRateLimitPauses` default 3, `:58` `baseMs` 30 s, `:59` cap 15 min, `:60` jitter; `transport.mjs:64` `DEFAULT_TIMEOUT_MS` and `:139`/`:152` its application; `bin/pdlc.mjs:83`, `:303-307` `--max-iterations`; `:88-93` `--allow-api-key-billing` | `resolveTunables` becomes the single reader; the fixture pins `dispatch.timeoutMinutes: 7` precisely because `DEFAULT_TIMEOUT_MS` equals the tunable's own default and an assertion at the default is self-consistent and false |
| T31 | `run.mjs:273` `maxPasses = 100`; `:277-282` the loop's four exits; `bin/pdlc.mjs:236-238` the exit write; `:304-305` yields `Infinity` when the flag is absent | one mapping function over the module `outcome`; `stopReason` total over all four exits; `Infinity → null` converted where the block is assembled, asserted on the in-memory object |
| T35 | `adapter.mjs:245` `lastApiKeySource`, written `:320`, read `:381`; `:305`/`:340` push `label: tag`; `report.mjs:51` surfaces the scalar once | the scalar becomes a per-dispatch `authSources` array; pause and denial rows gain `phase` while keeping `label` as an honest log tag |
| T36 | `transport.mjs:63` `DEFAULT_API_KEY_SOURCE_POLICY = ["none"]`; `:201-206` throws `AuthPolicyError` before any tool runs; `bin/pdlc.mjs:88` `startupFor` widens the set at `:93` | C-1b stays in the transport as an observation of that dispatch; the widening stays flag-only |
| T39 | `run.mjs:52` `WORKFLOW_MODULE_URLS`, `:58` `workflowModulePath`, `:80` `devInjection`, `:114` `queueInjection`, `:155` `withCwd`; `orchestrate-dev.js:8916` declares 30+ seams, `orchestrate-queue.js:1033` declares 12, and `:1422` calls `_runPipeline` with `{reqPath}` and no seams | only `lib/run.mjs` names `pdlc/workflows/` (R-ARCH-1); `_git` is supplied with a **distinct function identity** because `branchGuardTransport` (`orchestrate-dev.js:3487`) refuses to act through the module's own default |
| T40 | `report.mjs:36` `buildEngineBlock`, `:50` the hardcoded `"agent-sdk"`, `:70` `stampReport` | the constant becomes the observed `kind`; `stampReport` still copies the module report verbatim and adds exactly one key |
| T42 | `transport.mjs:70-89`'s comment recording a measured runtime fact beside the code is the shape precedent; `docs/_constraints/pdlc-engine-baseline.md` already carries M-ENG-01…M-ENG-08 | `M-ENG-09` is appended in the same `M-ENG-*` form, columns `date \| platform \| transport \| sdkVersion \| denyFired` |
| T48 | `orchestrate-dev.js:9995` selects wave mode; `:9959-9962` is the `haiku` PLAN-DAG fallback; `:7454`→`:7463` is `recoverVerdict`; `:10248`→`:10253` is the V-wave; `orchestrate-queue.js:1216` is Phase-0 triage | run i's fixture PLAN carries a valid ownership manifest and a local exit-`0` `testCommand` so wave mode is taken and asserted; its reviewer fixtures emit well-formed `VERDICT:` trailers so both `haiku` routes are closed by fixture content rather than by luck |

**Two integration points that are deliberately *not* touched.** `runtime-adapter.js`'s IO surface is
not ported (TSPEC §2.5, M-ENG-03): `_readFile`, `_writeFile`, `_appendFile`, `_listFiles`,
`_checkFile`, `_hashFile`, `_ghRun`, `_checkCi`, `_mergeWorktree`, `_recordQueueRow`,
`_rebaseOntoDefault` and the advisory and probe seams all keep the modules' Node defaults, and
overriding one whose default works is a defect in this feature, not an improvement. And
`_sessionAgent` stays **unwired** (R-4, O-6, DEC-ENG-07's neighbourhood): fresh-per-dispatch is
today's semantics, and painting the seam shut would remove the attachment point a future
session-reuse flag needs. T25's seam-contract test asserts both, so a well-meaning later wiring is
red rather than silent.

## 8. Definition of Done

Every item is mechanically checkable, and the check is named. An item that could only be confirmed
by reading prose is not on this list.

**Suite and gates**

- [ ] `cd pdlc/engine && npm test` exits 0 on `ubuntu-latest`, node 20 — the whole of `engine-tests`'
      matrix at HEAD (`pr-tests.yml:40`) — through the **one** spelling in `scripts.test`: the
      runner, not a bare `node --test`.
- [ ] The suite-wide assertion step runs on every invocation and **fails on an empty observation
      set**; a run against an empty scratch run dir exits non-zero (T01, T03).
- [ ] All five rows of TSPEC §7.4's property table are implemented in `_assert-suite-wide.mjs`, and
      the module enumerates the same five things the table does (T19, T52).
- [ ] The hermeticity guard and the socket trap each fire in a test written to trip them; a trap
      that never fires would be indistinguishable from one never installed (AT-ENG-63).
- [ ] `.github/workflows/pr-tests.yml` runs five jobs, the new one on the `unit-tests` matrix with a
      body of `npm ci` then `npm test` and nothing else.
- [ ] `.claude/pdlc.config.json` `implementation.testCommand` runs **both** V1 and V2 — the engine
      suite *and* the workflows suite — with **all four** of `pdlc/workflows`' existing ignore
      patterns
      `--testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'`
      preserved verbatim (HEAD's value, `.claude/pdlc.config.json:3`). Post-T17 the value is literally
      `cd pdlc/engine && npm test && cd ../workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'`.
      Set-equality, not containment: this file is repo-wide state, so a value that runs only the
      engine suite would blind **other** features' wave gates — a blast radius outside this REQ.
      The same argument runs in the other direction and is why `'documentOracles'` is carried
      through rather than dropped: the document oracles are CWD- and untracked-file-sensitive
      (`pdlc/workflows/lib/document-oracles.mjs` reads `process.cwd()`; a document oracle can be red
      locally and green in CI), so re-admitting them to the wave gate would turn *other* features'
      untracked docs into wave failures. Dropping a pattern is as much a blast radius as dropping a
      suite.

**Generated artifacts and the workflow modules**

- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits 0, and `pdlc/hooks/scripts/sync-workflows.sh --check`
      exits 0.
- [ ] `pdlc/workflows/dist/` and `distribution-manifest.json` are committed in T16's own batch.
- [ ] The workflows-side change is exactly two files: added exports plus bare literals replaced at
      their dispatch sites. No pipeline behaviour changes, and `pdlc/workflows/`'s own suite is green.
- [ ] The no-bare-literal test is DEC-ENG-05's **containment** form with **no exemption list**: every
      skill-identifier-shaped literal in either module is a member of the exported
      `DISPATCHABLE_SKILLS` union, and the shape predicate is itself asserted against the known set.
      No absolute line number appears as an oracle. TSPEC §3.3's exactly-equal allow-list is the
      superseded draft and is **not** implemented.

**Acceptance criteria and acceptance tests**

- [ ] All 26 of REQ v0.10's acceptance criteria have a passing test, per §9's table — **except
      AC-6.2, whose evidence is operator-recorded rather than suite-observed**: T51 is flag-gated and
      never runs in CI, so AC-6.2 is met by a dated line recorded beside `M-ENG-06`/`M-ENG-09` in
      `docs/_constraints/pdlc-engine-baseline.md` (T53 owns that file) naming the commit the live
      smoke ran against. No command in §11 observes it, and that is stated rather than implied.
- [ ] **All 69 of FSPEC v1.6's acceptance tests — AT-ENG-01…AT-ENG-68 plus AT-ENG-11a** — each map to
      at least one named test, and every AT that FSPEC scopes "per transport" is asserted twice. The
      enumeration is set-equal to FSPEC's, not a numeric range that silently drops `11a`.
- [ ] §9's "Acceptance tests" column is **set-equal, per row, to FSPEC §14.1** (`FSPEC:1335-1360`);
      any AT this plan deliberately routes to a different AC's row says so in the cell.
- [ ] Each parameterisable component named in §3 carries its property strategy and the strategy runs:
      `classifyOutcome`'s totality (T04), `resolveAuthPosture`'s exactly-one-row-matches (T06),
      `computeRateLimitWaitMs`'s monotone/capped/jittered laws (T21), `resolveTunables`' precedence
      totality (T30), `parseVersion`/`satisfiesRange`'s ordering laws (T41).
- [ ] Branch coverage over the four new modules (`lib/outcome.mjs`, `lib/catalogue.mjs`,
      `lib/auth.mjs`, `lib/transport-cli.mjs`) is **≥ 85 %**, observed by
      `cd pdlc/engine && npm test -- --experimental-test-coverage` (node 20) and read off that run's
      coverage table. The command goes **through `scripts.test`**, per the first item in this
      section: a bare `node --test __tests__/` skips T11's runner, so `PDLC_TEST_RUN_ID` is never
      minted, `--import=./__tests__/_bootstrap.mjs` is never passed, no observation records are
      written and DEC-ENG-10's suite-wide step never runs — a coverage number read off that run
      would be read off a red, non-hermetic run. T11's runner therefore **forwards unrecognised
      arguments to the spawned `node --test`** (its row states this as an obligation, not an
      accident); a maintainer who prefers to be explicit can spell the same run as
      `node __tests__/_run-suite.mjs --experimental-test-coverage`.
- [ ] The six-member outcome taxonomy is asserted in **both** directions, the reverse by a named
      provocation fixture per member; a member no fixture reaches is a missing fixture, never a
      loosened oracle.
- [ ] The message catalogue is asserted in both directions over ids accumulated across the whole
      suite, not per test.
- [ ] The dispatchable-skill set is asserted in both directions over imported data, never parsed
      source.
- [ ] AC-3.3's witness table has one passing witness per M-ENG-07 row, with rows 1 and 2 quantified
      over the Phase-I wave set and run i asserting **zero** `haiku` descriptors.

**Guard parity and the measurement that gates unattended use**

- [ ] Each of §6.3's three clauses has its falsifying counterpart asserted in the same file, and the
      deny path performs the deletion it is guarding.
- [ ] The provenance test runs with no pdlc hooks registered on the host.
- [ ] `docs/_constraints/pdlc-engine-baseline.md` carries an `M-ENG-09` row for **every
      `process.platform` on which the hermetic suite is run** — `linux`, because that is
      `engine-tests`' only platform (`pr-tests.yml:40`), plus the Phase-I wave host's platform when
      it differs (`darwin` if waves run on the maintainer's macOS) — and the hermetic gate fails when
      a row for the running platform is absent. T42 supplies the wave host's row; any remaining row
      is the §5 operator step. The item is met when every platform that runs the suite has a row —
      one row suffices when wave host and CI platform coincide. It is **not** met by a row for a
      platform no job and no wave runs on, and no `macos-latest` row is required, `410f3a07` having
      removed that platform from the matrix.
- [ ] If any row records `denyFired: no`, TSPEC §6.5's branch is taken — the posture tightens or the
      guard moves to `canUseTool` — and this DoD is **not** met by noting the measurement.

**Boundaries the feature must not have crossed**

- [ ] No file under `pdlc/workflows/` other than the two modules and their generated artifacts is
      modified; `git diff --stat` against the merge base is the check.
- [ ] No engine-owned file is created under a consumer repo across a full fixture run (AT-ENG-50).
- [ ] `stampReport` adds exactly one key, `engine`.
- [ ] Only `lib/run.mjs` names a path under `pdlc/workflows/`; any other engine file doing so fails
      the suite (R-ARCH-1).
- [ ] `_sessionAgent` is unwired and `runtime-adapter.js`'s IO seams are un-overridden, both asserted
      by T25 rather than left to review — and **each absence is paired with its positive on the same
      path**: two successive dispatches are shown to produce two independent sessions, and the
      un-overridden seams' Node defaults are shown to be exercised by a real run. An assertion set
      that cannot tell "seam omitted" from "seam never reached" does not meet this item.
- [ ] No fixture contains a credential, asserted by a scanner whose positive control is in the same
      test.

**Documents**

- [ ] `M-ENG-06`'s per-criterion rows are restated against the delivered engine (T53).
- [ ] The errata this plan raises against TSPEC and DECISIONS are routed and confirmed, or explicitly
      declined, before Phase DOD. Four are open: (i) TSPEC §8.3's edit surface omits
      `.claude/pdlc.config.json`; (ii) `RungRecord = { rung: 0..5 }` (`TSPEC:834`, `:840`) cannot
      represent FSPEC v1.6's rung 4a; (iii) TSPEC §3.3's exactly-equal allow-list oracle is the draft
      DEC-ENG-05 supersedes, and TSPEC does not record the supersession; (iv) TSPEC §8.3's file table
      does not classify `pdlc/engine/__tests__/smoke.test.js`, which is tracked at HEAD and is
      **extended** by T48, not new.

## 9. Traceability — acceptance criteria to tasks

Total over REQ v0.10's 26 acceptance criteria. Every criterion names the task that makes it pass and
the task whose failing test proves it was not already passing.

**The "Acceptance tests" column is a transcription of FSPEC §14.1 (`FSPEC:1335-1360`), set-equal per
row.** Where this plan additionally routes an AT to a row FSPEC does not, the cell marks it
`(+ …, this plan's addition)` — so a reader diffing the two documents sees a deliberate widening and
never a silent narrowing. Narrowing is the failure this column exists to prevent: it is the table the
DoD's "all 26 ACs have a passing test" is checked against.

| AC | Red task | Green task(s) | Acceptance tests |
|---|---|---|---|
| AC-1.1 parity with a Claude Code run | T34 | T49, T39, T40 | AT-ENG-45, AT-ENG-46 (+ AT-ENG-51, this plan's addition) |
| AC-1.2 the run observed at the filesystem level | T33 | T43, T46 | AT-ENG-47, AT-ENG-48 (+ AT-ENG-50, this plan's addition) |
| AC-1.3 queue surface, both stop reasons | T31 | T39, T47 | AT-ENG-52…AT-ENG-57 |
| AC-1.4 halt exits `2`, not `1` | T31 | T47 | AT-ENG-04, AT-ENG-38 |
| AC-1.5 not a fork | — (no red task: clause (a)'s observable already exists at `run.mjs:58`, so T10's strengthened assertion passes the moment it is written; T10 is green on landing and exempt from §5's batch-2 red gate) | T10 — clause (a), the repo-relative path assertion, is closed by T10; clause (b), the no-second-copy assertion, is green at HEAD (`run.test.js:48`) | AT-ENG-49 |
| AC-2.1 startup banner, six ordered auth rows | T06, T26 | T15, T41, T44 | AT-ENG-09, AT-ENG-11, AT-ENG-13, AT-ENG-15, AT-ENG-24 |
| AC-2.2 key present without opt-in ⇒ refusal | T06 | T15, T44, T47 | AT-ENG-14 |
| AC-2.3 proxy env reaches every dispatch | T22 | T36, T37 | AT-ENG-26, AT-ENG-27 |
| AC-2.4 logged-in session, key ignored | T06, T20 | T15, T35, T40 | AT-ENG-16 |
| AC-2.5 dispatch cwd is the repo, per dispatch | T20, T22 | T35, T36, T37 | AT-ENG-28 |
| AC-3.1 a dispatch composes for every skill in the set | T24 | T38, T47 | AT-ENG-20, AT-ENG-21, AT-ENG-23 |
| AC-3.2 no plugin installed ⇒ legible refusal | T26 | T44 | AT-ENG-08, AT-ENG-12 |
| AC-3.3 pinned model map, both directions | T50 | T48, T52 | AT-ENG-29, AT-ENG-30 |
| AC-3.4 permission posture is explicit | T22 | T36, T42 | AT-ENG-31 |
| AC-3.5 dispatchable ≡ readable, both directions | T07, T26 | T16, T39, T44 | AT-ENG-10, AT-ENG-12 |
| AC-4.1 six-member outcome taxonomy | T04 | T13, T19 | AT-ENG-33, AT-ENG-34 |
| AC-4.2 retry budget and timeout cap | T21 | T45 | AT-ENG-35, AT-ENG-36, AT-ENG-37 |
| AC-4.3 exhausted retries surface legibly | T21, T05 | T14, T45 | AT-ENG-38 |
| AC-4.4 mid-run `auth-failure` is fatal, never retried | T21, T31 | T45, T47 | AT-ENG-39, AT-ENG-67 |
| AC-4.5 report carries module fields + engine block | T32 | T40, T35, T47 | AT-ENG-58, AT-ENG-59, AT-ENG-60, AT-ENG-68 |
| AC-5.1 guard refuses with `LEARNINGS` absent, per transport | T28 | T36, T37 | AT-ENG-41, AT-ENG-43 (+ AT-ENG-44, this plan's addition) |
| AC-5.2 harvest's deletions succeed once it exists | T28 | T36, T37 | AT-ENG-42 |
| AC-6.1 hermetic suite, observed | T02, T01 | T11, T12 | AT-ENG-63 |
| AC-6.2 opt-in live smoke | — (flag-gated, §4's note) | T51 — evidence is **operator-recorded**, not suite-observed (§8) | AT-ENG-65 |
| AC-6.3 per-transport recorded fixtures | T09, T23 | T18, T37 | AT-ENG-64 (+ AT-ENG-22, this plan's addition) |
| AC-6.4 closed message catalogue, both directions | T05, T03 | T14, T19 | AT-ENG-61, AT-ENG-62 |

**Acceptance tests FSPEC §14.1's AC rows do not claim as members, and the task that owns each.**
One entry is a near-miss rather than an absence and is listed for the same reason: AT-ENG-57 appears
in FSPEC's AC-1.3 row only parenthetically, so this plan pins its owner explicitly. FSPEC's AC→AT map
is not total over FSPEC's 69 ATs — several ATs are edge-case families scoped by a BR or an EC rather
than by an acceptance criterion. They are owned all the same, and named here so the DoD's total-AT
claim is checkable without reading the task table twice:

| AT | What it asserts | Owning task |
|---|---|---|
| AT-ENG-02 | `--flag value` ≡ `--flag=value` on the composed descriptor (BR-CLI-1, `FSPEC:280`) | T47 |
| AT-ENG-05 | EC-CLI-2…EC-CLI-7 one case each, with BR-REP-0a's usage-error/refusal split (`FSPEC:283`) | T47 |
| AT-ENG-17 | a disallowed reported key source aborts that dispatch **before billing**, naming the raw value (BR-AUTH-4, `FSPEC:540`) | T22 red → T36 green |
| AT-ENG-18 | source changes at dispatch 3 of 5 ⇒ stop there, both values in the report (BR-AUTH-5/EC-AUTH-5, `FSPEC:541`) | T22 red → T36 green |
| AT-ENG-32 | EC-DISP-4, EC-DISP-5, one case each (`FSPEC:722`) | T22 |
| AT-ENG-40 | EC-FAIL-2…EC-FAIL-6, one case each (`FSPEC:878`) | T21 red → T45 green |
| AT-ENG-57 | EC-Q-2, EC-Q-5, EC-Q-6, EC-Q-7, one case each (`FSPEC:1169`) | T31 red → T47 green (also AC-1.3's row above) |
| AT-ENG-66 | EC-REP-1, EC-REP-2, EC-REP-3, one case each (`FSPEC:1295`) | T32 red → T40 green |

AT-ENG-17 and AT-ENG-18 are the billing-safety pair and are deliberately **red tasks, not clauses
absorbed into a green one**: a feature that ships with no failing test for "a disallowed key source
stops a run" has no evidence the abort path works at all.

**Constraints not reducible to a single AC.** C-11 (a host that cannot run the guard is not a host
that runs pdlc unattended) is authorised in REQ v0.10 and specified as FSPEC v1.6's rung 4a with
BR-GUARD-6, EC-START-10/11 and AT-ENG-11a. It has **no TSPEC section** — TSPEC v1.5 predates that
FSPEC revision and still declares the ladder as "always all six" rungs with
`RungRecord = { rung: 0..5 }` (`TSPEC:834`, `:840`). T27 and T44 implement it against FSPEC, which is
the approved authority for observable behaviour, and the gap is raised as an erratum rather than
absorbed silently: the `RungRecord` shape a TSPEC reader would build cannot represent rung 4a, so an
implementer working from TSPEC alone would either drop the rung or renumber the ladder, and
renumbering would break FSPEC's fixed rung numbers 0–5.

C-9 (every runtime fact measured, per platform) is carried by T17's two-platform matrix and T42's
per-platform `M-ENG-09` rows; C-4 (the modules are not forked) by T10 and the DoD's `git diff --stat`
check; C-8 (closed message catalogue) by T05/T14/T19.

## 10. Risks, deferrals and open questions carried into implementation

**Risks this plan schedules against, rather than notes.**

| Risk | Why it is real here | How the schedule answers it |
|---|---|---|
| The guard is green and vacuous under `bypassPermissions` | `DEFAULT_PERMISSION_MODE = "bypassPermissions"` (`transport.mjs:89`) is the production posture and whether a `PreToolUse` deny fires under it is unmeasured on either transport. Every well-formedness test in §6.3 would pass while the guard protected nothing | T29's gate makes an unrecorded measurement **red**, and T42 supplies the rows; both sit at batches 4–5, well before anything resembling unattended use (BR-GUARD-4) |
| The suite-wide properties degrade back to vacuous green | The forward direction `observed ⊆ OUTCOMES` is true of the empty set, and the tempting repair under time pressure is to scan all run directories and drop the emptiness guard | The spine is batch 3, its inheritance self-test is batch 2's T01, and the emptiness guard is part of T19 rather than a later hardening |
| The workflows edit lands without its rebuild | `artifact-freshness` gates on `build-runtime.mjs --check`, so the symptom is CI red at Phase PUB for a reason unrelated to the change | T16 owns source, rebuild and artifacts as one task, and `implementation.postWavePathspecs` already names `pdlc/workflows/dist/` |
| The corpus is built too early and the witness rows are written to fit it | A witness written after the data is a restatement of the data | T50 (the witness table) precedes T52 (the assertion step) and both follow T48; the model constants stay module-local so M-ENG-07 remains a transcription, never an import |
| Cost and time of a fifth CI job | The engine suite runs on two platforms on every PR | O-ENG-T1 is a maintainer decision; this plan takes the technical requirement only — both platforms exercised somewhere — and T17 defaults to matching the existing matrix, which is the reversible choice |

**Open questions carried, with the disposition this plan takes.** None of these blocks a task; each
names where it would attach if answered.

| # | Question | Disposition here |
|---|---|---|
| O-1 | the fallback's `claude -p` flag surface | T37 fixes the flag spellings while producing T18's fixture set. There is still **no runtime selector** and none is added: `resolveTransport` returns a constant `kind`, `"cli"` is reachable only by direct unit construction, and making it selectable stays O-1's (DEC-ENG-01/02) |
| O-2 | guard mechanism per transport, and the deny-under-bypass measurement | scheduled, not deferred — T29 and T42. Both branches of TSPEC §6.5 are pre-committed so a red measurement is a decision already taken, not a design debate |
| O-3 | where engine configuration lives | untouched. T30 fixes the set, the defaults and the single resolution point; only the *location* `resolveTunables` reads from is open, and no AC depends on it |
| O-5 | whole-run `--dry-run` | not built. `--dry-run-skill` (`bin/pdlc.mjs:171-172`) is the prompt-corpus surface T24 uses, and TSPEC §7.4 is explicit that the model-map harness does **not** depend on a whole-run dry run |
| O-6 | session-reuse flag | `_sessionAgent` stays unwired and T25 asserts it, so the seam remains available |
| O-ENG-T1 | the CI job's cost and placement | T17 inherits `unit-tests`' matrix as it stands at HEAD — `os: [ubuntu-latest]` (`pr-tests.yml:40`). Widening the engine job back to macOS would reverse `410f3a07` and is deliberately not part of this feature; it stays a one-line change to the same file |
| O-ENG-T2 | two concurrent engine runs against one repo | out of scope (EC-RUN-4, DEC-ENG-14). No lock is invented; the in-process case is settled by `withCwd`'s `process.chdir` (`run.mjs:155`) and the cross-process case is recorded, not closed |
| O-ENG-T3 | supplement inlining and prompt size | T38 implements DEC-ENG-06 as written — the identifier's whole prompt-file set. If measured prompt size becomes a problem, the alternative needs the measurement first, and T38 is where it would attach |
| O-ENG-T4 | the M-ENG-09 gate's platform granularity | T29 keys on `process.platform` — a *runtime* fact, deliberately not a matrix entry, which is why a `darwin` wave host needs its own row even though CI has no macOS job; `sdkVersion` and `date` are recorded as provenance and are deliberately not part of the lookup (DEC-ENG-04) |
| O-ENG-T5 | platforms that run the suite without a CI job | **a plan author hits this on day one, as TSPEC §9.2 predicted.** T29 makes an absent row red, so any host outside `engine-tests`' matrix — including a `darwin` wave host and any contributor's machine — sees a red suite for a measurement it may not be able to take. This plan does **not** decide the general case: T29 implements the refuse-and-require-a-row form, because it is the loud one, and the skip-with-a-notice form is a one-predicate change in the same test. Flagged for the operator, not resolved by an implementer mid-wave. **The two platforms this feature actually runs on are not open questions**: `linux` (CI) and the wave host's platform are on the critical path, and §5 names the operator step that records whichever of them no wave produces |

**One deferral this plan makes on its own authority, and states rather than hides.** `lib/skills.mjs`
is extended by T38 for DEC-ENG-06's whole-file-set inlining, but no task caches composed prompts.
Every dispatch recomposes, which is measurably wasteful on a run that dispatches the same skill a
dozen times. It is left alone because a cache is state at layer 3, `promptHash` (TSPEC §7.4) reads
the composed prompt, and a cache keyed wrongly would make two descriptors share a hash they did not
earn — turning row 4's pairing predicate into a false positive. If prompt composition becomes a cost,
the fix is a measurement and a cache keyed on `(skill, prompt)` with the hash computed before the
cache, not after.

## 11. Verification

§8 states *what* must hold; this section states the **commands that observe it**, so a wave gate, a
reviewer and CI all judge the same thing by running the same lines. Every command below is measured
against HEAD: where a command does not yet do what this plan needs, the task that changes it is
named, and the pre-change spelling is quoted so the delta is checkable rather than remembered.

**The five commands that constitute the local check.**

| # | Command | Observes | State at HEAD |
|---|---|---|---|
| V1 | `cd pdlc/engine && npm ci && npm test` | the engine suite, including the suite-wide assertion step and its emptiness guard | `scripts.test` is `node --test __tests__/` (`pdlc/engine/package.json:13`); T11 replaces it with `node __tests__/_run-suite.mjs`, and until it does, V1 runs no assertion step at all |
| V2 | `cd pdlc/workflows && npm test` | that the workflow-module edit changed no pipeline behaviour | `node --experimental-vm-modules node_modules/jest/bin/jest.js` (`pdlc/workflows/package.json:7`); unchanged by this feature |
| V3 | `node pdlc/workflows/build-runtime.mjs --check` | that T16's rebuild was committed with its source change | passes at HEAD; goes red the moment `orchestrate-dev.js` is edited without the rebuild |
| V4 | `pdlc/hooks/scripts/sync-workflows.sh --check` | that the consumer copy under `.claude/workflows/` is not silently stale | invoked by bare path, never `bash …`; a `126` exit means the execute bit was lost, not that the tree drifted |
| V5 | `cd pdlc/engine && npm test -- --experimental-test-coverage` | the ≥ 85 % branch-coverage floor over the four new modules (§8) | goes **through the runner**, per T11's forwarding clause, so the coverage number is read off a hermetic run: a bare `node --test __tests__/` mints no `PDLC_TEST_RUN_ID`, imports no `_bootstrap.mjs`, writes no observation records and skips the suite-wide step, which would leave V5 measuring a red run and contradicting §8's "one spelling in `scripts.test`" item. `scripts.test` carries no coverage flag at HEAD (`pdlc/engine/package.json:13`) and gains none: the flag is passed per invocation, so V5 stays a local check and T17's job body remains `npm ci` then `npm test` and nothing else |

V1 and V2 are **not interchangeable and neither subsumes the other**: they are two suites, two
runners, two working directories. A reviewer who runs only V2 has verified that this feature broke
nothing and has verified nothing that it built.

**Where the wave gate reads from, and the one edit that makes it real.** The dispatcher's gate runs
`implementation.testCommand`, which at HEAD is
`cd pdlc/workflows && npm test -- --testPathIgnorePatterns …` (`.claude/pdlc.config.json:3`) — V2
only. Every wave of this feature's own Phase I would therefore be gated on a suite that never loads
a single file the wave wrote, and each wave would commit green regardless. T17 owns the correction;
until T17 lands, batch gates 2–11 are being judged by V2 alone, which is the failure mode the
`postWaveCommand` hook cannot compensate for (`:4` runs `build-runtime.mjs`, i.e. V3's builder,
not V1).

**T17's post-change value, stated literally rather than described.** The corrected
`implementation.testCommand` is:

```
cd pdlc/engine && npm test && cd ../workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'
```

**Both** suites, and all **four** of V2's ignore patterns preserved verbatim — HEAD's value is
`cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'`
(`.claude/pdlc.config.json:3`), and the post-change value is that string with the engine suite
prepended, token for token. `'documentOracles'` is load-bearing, not noise: the document oracles
resolve paths from `process.cwd()` and read the working tree, so they are red locally and green in
CI depending on untracked files. Re-admitting them to the wave gate would make *other* features'
untracked docs fail this repo's waves — the same repo-wide blast radius the item below argues
against, arriving through a dropped token instead of a dropped suite. Replacing the value with
`cd pdlc/engine && npm test` would satisfy "runs the engine suite" while **dropping V2**, and this
plan's own §11 states V1 and V2 are not interchangeable and neither subsumes the other. The blast
radius matters more than the wording: `.claude/pdlc.config.json` is repo-wide state, so a value that
runs only the engine suite blinds *other* features' Phase I wave gates — an effect outside this
feature and outside this REQ. The DoD item is therefore set-equality (both suites), never
containment (at least the engine suite). Note also that TSPEC §8.3's edit surface does not list this
file at all, so the change is authorised by this PLAN alone today; that omission is raised as an
erratum rather than treated as permission.

**The operator-recorded `M-ENG-09` row's command**, since no CI job and no wave gate can produce it:
a maintainer runs `PDLC_LIVE=1 node --test __tests__/live/guard-measurement.test.js` from
`pdlc/engine` on a host of the platform that lacks a row — in practice `linux`, the platform
`engine-tests` runs on, when the Phase-I wave host is a Mac — and commits the appended row to
`docs/_constraints/pdlc-engine-baseline.md` (§5). This spelling is a bare `node --test` on purpose:
it names one opt-in file rather than the suite, so it neither needs nor wants the runner's run-id
and bootstrap, and it is not the coverage case §8 rules out.

**Where CI reads from.** `.github/workflows/pr-tests.yml` ships four jobs; T17 adds the fifth.

Every line number in the `Command` column below cites the **`run:` line** that carries the command,
not the `- name:` line of the step, so one convention holds down the column.

| Job at HEAD | Job line | Command (`run:` line) | Relation to V1–V4 |
|---|---|---|---|
| `unit-tests` (`ubuntu-latest`, node 20 — `os: [ubuntu-latest]` at `:40`) | `:27` | `npm ci` (`:68`) then `npm test` (`:75`), `working-directory: pdlc/workflows` (`:67`, `:71`) | V2, on the one platform the matrix has |
| `artifact-freshness` | `:77` | `build-runtime.mjs --check` (`:93`), then rebuild-produces-no-diff (`:99`) | V3, plus an independent-observer second half |
| `fresh-clone-bootstrap` | `:103` | build (`:127`), then `pdlc/hooks/scripts/sync-workflows.sh` (`:133`), then `--check` (`:148`) | V4, from a tree with no consumer copy |
| `script-syntax` (display name "Shell scripts parse") | `:161` | `bash -n` every shipped script (`:172`), then executable-bit check (`:188`) | neither; unaffected by this feature |
| **new (T17)** | — | `npm ci` then `npm test`, `working-directory: pdlc/engine`, on `unit-tests`' matrix as it stands (`ubuntu-latest`) | V1 |

T17's job body is deliberately `npm ci` then `npm test` **and nothing else**: any command CI runs
that a maintainer cannot run locally as V1 is a check that fails in a place it cannot be reproduced.
The matrix is single-platform because HEAD's is: `macos-latest` was dropped in `410f3a07` ("ci: drop
macos-latest from the unit-test matrix"), and re-adding it for this feature would reverse a standing
decision on a repo-wide file, in the same PR, for a reason no AC states. C-9's per-platform
requirement is met where it actually bites — T29 keys `M-ENG-09` on `process.platform`, so the
platform CI runs on (`linux`) and the platform the Phase-I wave runs on (`darwin` on the
maintainer's macOS) each need a row, whether or not either has a CI job. That is the obligation §5
schedules and §8 checks; a matrix entry is neither necessary nor sufficient for it.

**Verifying the red batches.** Batches 2, 4 and 9 end red by construction (§5), so V1 exiting
non-zero is the expected observation there and the gate is the split wording, never "suite green".
The check that a red batch was *correctly* red is mechanical: the failing test files are exactly the
ones that batch owns per §4's manifest, and no pre-existing test is among them. A batch-2 run whose
failure list includes a file from batch 4 has a scheduling defect, not a TDD red.

**Verifying the two claims no command can make.** Two DoD items are `git`-observed rather than
suite-observed, and both are stated here as the exact invocation:
`git diff --stat $(git merge-base HEAD main)..HEAD -- pdlc/workflows/` must list exactly
`orchestrate-dev.js`, `orchestrate-queue.js` and paths under `dist/` — any fourth path is C-4's
fork-by-accident. And `git status --porcelain .claude/workflows/` must stay empty of tracked
entries: the consumer copy is generated and untracked, and a diff that shows it means it was
committed, which V4 cannot detect because `--check` compares content, not tracking state.


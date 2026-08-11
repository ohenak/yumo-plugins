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

## 4. File-ownership manifest

## 5. Batch-safety rules and wave gates

## 6. Task dependency notes

## 7. Integration points

## 8. Definition of Done

## 9. Traceability — acceptance criteria to tasks

## 10. Risks, deferrals and open questions carried into implementation

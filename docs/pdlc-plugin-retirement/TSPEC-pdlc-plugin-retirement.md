# TSPEC — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-plugin-retirement.md` (v0.11) → `FSPEC-pdlc-plugin-retirement.md` (v0.5) → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-17 |

*Measured at `2cd0d6b1` (2026-08-17, `feat-pdlc-plugin-retirement`). Every file/symbol claim below
was verified against the tree at that commit; the FSPEC's own base commit is `b3f24fc6` and its
literals are re-transcribed at C-6 re-measurement time, not here.*

## 1. Overview

This TSPEC is the implementation contract for the retirement sweep the FSPEC specifies
behaviourally. It **decides only what the FSPEC routed here** and grounds every decision in the
tree at `2cd0d6b1`; it invents no requirement and changes no pipeline semantics (REQ NG-3).

### 1.1 What this document settles

| Routed item | Decision | Section |
|---|---|---|
| FSPEC O-C / REQ O-3 — which surviving directory holds the probe CLI's build | `pdlc/workflows/dist/` survives holding exactly one entry, `pdlc-cli.mjs`; AC-1.1's **first** branch is pinned | §2.2 |
| FSPEC O-D / REQ O-4 — Phase MERGE's self-modification guard paths | `MERGE_GUARD_DEFAULTS` is **not edited by this sweep**; the `pdlc/engine/` coverage gap is bound to a successor REQ under NG-5 | §2.7 |
| FSPEC O-E — which surviving modules host the re-homed assertions | Hook compatibility: `hookCompatibility.test.js` is **retained**, minus its drift-registration block. Queue triage: `orchestrateQueue.test.js` | §2.6, §4.4 |
| FSPEC ASM-3 — where the consumer-cleanup step lives | `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`, operator-invoked, exit statuses `0` / `3` / `4` | §3.2 |
| FSPEC ASM-4 — how the delegator skills reach the engine | The installed `pdlc` binary (`pdlc dev` / `pdlc queue`), resolved PATH-first with a named refusal | §3.3 |
| FSPEC AT-5.2 — the stable field subset the report comparison values | An **excluded key-path list** over the stamped report, complement value-compared | §4.5 |
| FSPEC BR-VER-1 — the post-sweep plugin version | `0.23.2` (stays inside the published engine's `^0.23.0` window) | §4.6 |

### 1.2 What this document does not settle

- Engine runtime capability (REQ NG-5): the engine's declared compatible-plugin range and its
  own tests over retired artifacts are edited by the sweep; nothing else engine-side is.
- Operator-owned gates: BL-03's adoption evidence and BL-08's pre-sweep report/transcript
  (FSPEC §7 O-A, O-B) are captured by the operator before the first deletion commit.
- The FSPEC's pinned literals. Where a decision here moves one — L-5's post-sweep suite count
  (§4.4) — the correction is made in the FSPEC at C-6 re-measurement time (FSPEC §3.0 step 3,
  ASM-2's veto path), never loosened into an inequality here.

### 1.3 Evidence grounding

Every claim below cites the symbol or file it rests on, verified at `2cd0d6b1`:
`pdlc/workflows/build-runtime.mjs` (`bundles`, `cliArtifact`, `DEV_META`, `QUEUE_META`,
`CONS_META`, `manifestRows`), `pdlc/workflows/runtime-adapter.js` (`rtConsInjections`,
`RT_CLI_PATH`), `pdlc/workflows/orchestrate-dev.js` (`MERGE_GUARD_DEFAULTS`,
`MERGE_CONFIG_PATH`), `pdlc/engine/lib/report.mjs` (`buildEngineBlock`, `stampReport`),
`pdlc/engine/lib/startup.mjs` (`OPERATOR_ONLY_SKILLS`), `pdlc/engine/bin/cli.mjs`
(`FLAGS_BY_COMMAND`), `pdlc/engine/scripts/prepack.mjs` (`MODULE_NAMES`),
`pdlc/hooks/hooks.json`, `pdlc/.claude-plugin/plugin.json`. Three claims the upstream documents
make do **not** survive that check; they are raised as errata rather than absorbed (§6.1).

## 2. Architecture

## 3. Interfaces

## 4. Data Model

## 5. Test Strategy

## 6. Open Questions

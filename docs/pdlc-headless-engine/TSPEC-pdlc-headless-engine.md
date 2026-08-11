---
feature: pdlc-headless-engine
---

# TSPEC — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` v0.9; `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` v1.3) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 1. Overview

### 1.1 What this document decides

FSPEC fixes *observable* behaviour: the ladder's rungs, the auth first-match list, the six-member
outcome taxonomy, the retry table, the report's fields. This TSPEC fixes the **code that produces
them**: which module owns which behaviour, the exact seam signatures each workflow module declares,
the types crossing each boundary, and the mechanism for the two obligations FSPEC deliberately left
open at the mechanism level (guard parity, §6; the per-transport fallback, §3.4).

It is not a greenfield design. A partial engine is committed under `pdlc/engine/`
(`bin/pdlc.mjs`, seven `lib/*.mjs`, nine `__tests__/*.test.js`), and `docs/_constraints/pdlc-engine-baseline.md`
**M-ENG-06** is the authority on which acceptance criterion is red, green or partially green at HEAD.
Every section below therefore states, per component, whether it is **extended**, **replaced**, or
**new** — the three demand different work, and a plan that treats them alike mis-schedules.

### 1.2 Design premises inherited, not re-decided

| Premise | Source | Consequence here |
|---|---|---|
| The modules run in plain Node; only `agent()` is missing | M-ENG-01 | The engine supplies seams, not a runtime (§3.1) |
| SDK primary, `claude -p` declared fallback, one `_agent` seam | REQ §1.3, M-ENG-04/05 | One transport interface, two implementations (§3.4) |
| Skill prompts come from the installed plugin, inlined | G-5, A-ENG-01 | No Skill tool in a composed prompt (§3.3) |
| The modules are imported, never forked | C-4, AC-1.5 | Two anti-fork observables (§2.4) |
| Nothing engine-owned is written into the consumer repo | NG-7, BR-REP-0 | The report is one JSON line on stdout (§4.5) |

### 1.3 The four structural changes this design makes to HEAD

Everything else is additive. These four replace shipped behaviour and are where review attention
belongs:

1. **Auth becomes two components, not one banner row.** HEAD has no auth check at all —
   `startup.mjs` renders an `apiKeyPolicy` banner row (`pdlc/engine/lib/startup.mjs:49`, `:64`,
   `handshake.mjs:183` `buildBanner`) from the CLI flag alone, and never inspects the environment or
   the login record. §3.2 adds `lib/auth.mjs` (startup posture, C-1a) and §5.2 keeps the per-dispatch
   assertion where it already is (`transport.mjs:201-206`), but records it **per dispatch** rather
   than as one scalar (`adapter.mjs:320`'s `lastApiKeySource`, surfaced once at `report.mjs:51`).
2. **The skill set becomes derived, not declared.** HEAD probes a frozen 17-name list
   (`startup.mjs:20` `EXPECTED_SKILLS`) for readability — containment in one direction, over a set
   that over-declares the dispatchable one. §3.3 derives the identifier set from the modules
   themselves and checks set-equality in both directions over that scope (AC-3.5, FSPEC §4.4).
3. **Outcome classification becomes an enumerated total function.** HEAD throws four error classes
   (`transport.mjs:23`, `:33`, `:46`, `:55`) and has no `transport-contract-violation` or
   `agent-reported-failure` member at all; the six-member closed catalogue and its set-equality
   observable are §5.1's.
4. **Every operator-visible string becomes a catalogue entry.** HEAD builds strings inline
   (`handshake.mjs:124` `REMEDY`, `startup.mjs:139`, `bin/pdlc.mjs:36` `USAGE`). §3.5 introduces one
   emission seam so the suite can accumulate emitted ids and compare them to the registered set
   (AC-6.4(a), BR-MSG-1).

### 1.4 Ownership boundary — one sentence

**The engine owns hosting; the modules own the pipeline.** No file under `pdlc/engine/` decides a
phase outcome, a queue row, a review verdict or a halt; no file under `pdlc/workflows/` learns that
it is being hosted. The two changes this design makes to `pdlc/workflows/` (§3.3's
`DISPATCHABLE_SKILLS` export, §3.6's nothing-else) are declarations *about* the modules, not
behaviour changes inside them, and each is a tested change in this repo — never a fork (C-4).

## 2. Architecture

### 2.1 Module map

Layering is strict downward: a module may import only from layers below it. `lib/startup.mjs`'s
existing rule — it imports **nothing** from `pdlc/workflows/` — is preserved and widened into the
table's "may import workflows" column, because it is what makes "fail closed before any module
evaluation" (C-10, FSPEC §4.2) a structural property rather than a call-order convention.

| Layer | File | State | Responsibility | May import workflows |
|---|---|---|---|---|
| 5 CLI | `bin/pdlc.mjs` | extended | argv → command; usage errors; exit codes; report emission | no (only via layer 4) |
| 4 run wiring | `lib/run.mjs` | extended | seam injection per module; `cwd` pinning; dynamic module import | **yes, and only here** |
| 3 startup | `lib/startup.mjs` | extended | the six-rung ladder, total, reporting every rung | no (rung 4 delegates, §3.3) |
| 3 startup | `lib/auth.mjs` | **new** | C-1a startup posture, first-match over env + login record | no |
| 3 startup | `lib/handshake.mjs` | extended | version parse/compare/range, C-10 decision, banner rows | no |
| 3 startup | `lib/skills.mjs` | extended | plugin-root resolution, identifier→path, prompt composition | no |
| 2 dispatch | `lib/adapter.mjs` | extended | the `_agent` seam: compose → dispatch → classify → retry → record | no |
| 1 transport | `lib/transport.mjs` | extended | SDK invocation, message-stream parse, C-1b assertion | no |
| 1 transport | `lib/transport-cli.mjs` | **new** | `claude -p` invocation and output parse (§3.4) | no |
| 0 shared | `lib/outcome.mjs` | **new** | the six-member taxonomy and its total classifier (§5.1) | no |
| 0 shared | `lib/catalogue.mjs` | **new** | registered message ids, one emission seam (§3.5) | no |
| 0 shared | `lib/report.mjs` | extended | pure `engine` block build + stamp | no |

Two rules fall out of the table and are asserted, not merely stated:

- **R-ARCH-1 — only `lib/run.mjs` may reference `pdlc/workflows/`.** Any other engine file naming a
  workflow path is a layering violation and fails the suite (§7.4). This is what keeps rung 3's
  refusal genuinely pre-import.
- **R-ARCH-2 — layers 0–1 hold no policy.** The taxonomy, the catalogue and the transports know
  nothing about phases, skills or the queue; everything pipeline-shaped lives at layer 2 and above.

### 2.2 Control flow of one run

```
argv ──► parseInvocation (bin)              usage error ──► stderr, exit 1, no report line (BR-REP-0a)
          │
          ▼
       runLadder (startup)  rung 0..5, total, every rung reported
          │  fail ──► catalogue refusal ──► report line (one JSON, stdout) ──► exit 1
          ▼
       banner (version pair, base URL, auth id)
          │
          ▼
       run.mjs: dynamic import of the workflow module(s), chdir to consumer root
          │
          ▼
       module main({...seams})
          │   every dispatch ──► adapter._agent
          │                        compose (skills)  ──► transport.dispatch
          │                        classify (outcome) ──► retry ladder ──► record
          ▼
       module report ──► stampReport(+engine block) ──► one JSON line ──► exit 0 | 2
```

The only two places the engine can end a run of its own accord are the ladder (exit `1`, zero
tokens) and an engine-fatal classification (`auth-failure`, `transport-contract-violation`; exit `1`,
no POSTMORTEM, queue row untouched — BR-FAIL-3). Every other ending is the module's (`0`/`2`).

### 2.3 Process model

One pipeline per process. `lib/run.mjs` `withCwd` (`pdlc/engine/lib/run.mjs:155`) `process.chdir`s
into the consumer root for the duration and restores in a `finally`, because the modules address the
filesystem consumer-relative and never call `process.cwd()` themselves — they hand bare relative
paths to `fs` (M-ENG-01: `defaultReadFile` at `orchestrate-dev.js:8492`) and shell `git` with no cwd
option. This is process-global state, and it is why the engine dispatches no run concurrently with
another in the same process. `dispatchOpts.cwd` is *also* set per dispatch
(`adapter.mjs:281`) so the transport pins the agent's own working directory (AC-2.5, BR-CWD-1)
independently of the process cwd.

**Two engine runs against one consumer repo are out of scope** (EC-RUN-4): no lock is designed here.
The gap is recorded, not closed.

### 2.4 Anti-fork, structurally

`WORKFLOW_MODULE_URLS` (`pdlc/engine/lib/run.mjs:52`) resolves both modules by relative URL from the
engine source inside this repo checkout, and `workflowModulePath()` (`:58`) exposes the absolute path
as the AC-1.5 observable. Two assertions make "not a fork" decidable with no reference copy:

| Observable | Assertion | HEAD state |
|---|---|---|
| resolved specifier | equals the repo-relative path `pdlc/workflows/orchestrate-{dev,queue}.js` | weaker at HEAD — `__tests__/run.test.js:64` asserts a `file:` URL only (M-ENG-06) |
| tree contents | no second file named `orchestrate-dev.js` / `orchestrate-queue.js` anywhere under `pdlc/engine/` | green (`__tests__/run.test.js:48`) |

Tightening the first to a path assertion is in scope (AC-1.5(a)).

### 2.5 What the engine does *not* build

`runtime-adapter.js`'s IO surface is not ported (M-ENG-03): `_readFile`, `_writeFile`, `_appendFile`,
`_listFiles`, `_checkFile`, `_hashFile`, `_ghRun`, `_checkCi`, `_mergeWorktree`, `_recordQueueRow`,
`_rebaseOntoDefault`, the advisory seams and the probe seams all keep the modules' own Node defaults,
so an engine run exercises exactly the code paths the module test-suite already covers. Overriding a
seam whose default works is a defect here, with one deliberate exception (`_git`, §3.1).

## 3. Interfaces

## 4. Data Model

## 5. Error Handling

## 6. Guard Parity Design

## 7. Test Strategy

## 8. Traceability

## 9. Open Questions

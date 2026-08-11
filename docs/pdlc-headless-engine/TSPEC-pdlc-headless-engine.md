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

Every signature below is transcribed from the declaration cited beside it. Where the engine and the
module disagree about a default, the module wins: the engine passes seams, never expectations.

### 3.1 The per-module seam contract (G-2, BR-PARITY-2)

`orchestrate-dev.js`'s `main()` declares 30+ injection parameters (`pdlc/workflows/orchestrate-dev.js:8916`);
`orchestrate-queue.js`'s declares 12 (`orchestrate-queue.js:1033`). **The engine supplies only the
seams whose module default does not work in plain Node, plus `_git`.** The complete contract, per
module — this table is the exhaustive answer REQ G-2 defers to TSPEC:

| Seam | Module default | dev | queue | Why supplied / left alone |
|---|---|---|---|---|
| `_agent(skill, prompt, opts)` | `agent()` **throws** (`orchestrate-dev.js:8458-8460`) | ✅ | ✅ | The one capability the runtime provided (M-ENG-01) |
| `_parallel(promises)` | `Promise.all` (`:8464`) — works | ✅ | — *(not declared)* | Supplied for log symmetry; behaviour identical |
| `_pipeline(label, fn)` | `fn()` (`:8469`) — works | ✅ | — *(not declared)* | Adds the section log line only |
| `_phase(label)` | no-op (`:8474`) | ✅ | ✅ | Progress output |
| `_log(message)` | `console.log` | ✅ | ✅ | Routed through the engine's log sink |
| `_runCommand` | `NO_RUN_COMMAND` = `null` | ✅ | — *(not declared)* | **Load-bearing:** a null seam silently degrades Phase I's script-owned wave gate to the legacy self-report path |
| `_git(argv)` | `defaultGit` (`:8609`) — works | ✅ | ✅ | **The one deliberate exception** (below) |
| `_runPipeline(args)` | `realMain` (`orchestrate-queue.js:1040`) | — | ✅ | **Necessity:** the queue calls it at `:1422` with `{reqPath}` and *no seams*, so the delegated dev pipeline would reach the throwing stub |
| every other IO / advisory / probe seam | working Node default | ✗ | ✗ | §2.5 — overriding is a defect |
| `_sessionAgent` | declared without a default; `sessionBoundAgent` defaults it to `NO_SESSION_AGENT` (`orchestrate-dev.js:5567`) | ✗ | ✗ | Fresh-per-dispatch is today's semantics (R-4, O-6). The seam must stay unpainted, not be wired |

**Why `_git` is supplied although its default works.** `branchGuardTransport`
(`orchestrate-dev.js:3487`) returns a transport only when `_git` is a function *and*
`_git !== defaultGit`: the guard refuses to mutate a checkout through a seam nobody explicitly chose.
Leaving the default in place makes the branch guard announce itself inert and skip, and the pipeline
then commits onto whatever branch the tree happens to be on — the precise failure the guard exists
to prevent. **Distinct function identity is the contract**, so `createGit()` (`adapter.mjs:116`) must
never be memoised into the module's own default and a test asserts the inequality.

`devInjection(adapter)` (`run.mjs:80`) and `queueInjection(adapter, runPipeline)` (`:114`) are the two
functions that build these objects; they forward the declared seams and nothing else (`composePrompt`
and the getters are deliberately not forwarded, so the injection object reads against the module's
parameter list).

**Fall-through is fatal, never silent** (EC-PAR-5): if a dispatch path reaches the modules' throwing
stub, the thrown `agent() not available outside Claude Code runtime` propagates as an engine failure
naming the seam — it is never caught and turned into a skipped phase.

### 3.2 `lib/auth.mjs` — the startup posture (new, C-1a)

```js
// Total: never throws for an environment problem; every input maps to a row.
export function readLoginEvidence({ home, fs, env }): {
  readable: boolean,          // ~/.claude.json parsed
  loggedIn: boolean,          // it carries an `oauthAccount` object (M-ENG-08)
  path: string,               // the file inspected, named in refusals
  reason: string|null,        // "absent" | "unreadable: {code}" | "no oauthAccount"
}

export const AUTH_ROWS = Object.freeze([...]);   // the six, in first-match order
export function resolveAuthPosture({ env, evidence, allowApiKeyBilling }): {
  row: 1|2|3|4|5|6,
  catalogueId: "auth.oauth-token" | "auth.session" | "auth.api-key-optin"
             | "auth.session-key-ignored" | "auth.api-key-refused" | "auth.unknown",
  refuses: boolean,           // true only for row 5
  evidencePath: string,       // echoed into the refusal (BR-AUTH-0)
}
```

Three properties are structural, not stylistic:

- **First match, evaluated in order, row 6 total** (BR-AUTH-1). The rows are an ordered array and the
  resolver returns on the first predicate that holds; the sixth predicate is `true`.
- **`ANTHROPIC_API_KEY` set to the empty string counts as absent** (EC-AUTH-1) — an empty key cannot
  bill. The predicate is `typeof v === "string" && v.trim() !== ""`, in one helper, used by every row.
- **Unreadable evidence is distinguished from absent evidence in the *message*, never in the row**
  (EC-AUTH-2): both leave `loggedIn: false`, so rows 2 and 4 cannot match and the list falls through
  to 5 or 6 by the key's presence alone — exactly M-ENG-08's per-platform correction.

`resolveAuthPosture` is pure over injected `env`/`evidence`, so every row is fixturable by pointing
`HOME` at a scratch directory with or without the record (BR-AUTH-0) and no operator credential is
involved in any test, including row 5.

### 3.3 Skill resolution and the derived dispatchable set (AC-3.5, BR-START-4)

**The identifier set is derived from the modules, not declared beside them.** Each workflow module
gains one export:

```js
// pdlc/workflows/orchestrate-dev.js
export const DISPATCHABLE_SKILLS = Object.freeze([
  "dod-verify", "harvest-learnings", "pm-author", "pm-review", "se-author",
  "se-implement", "se-review", "ship-pr", "te-author", "te-review",
]);
// pdlc/workflows/orchestrate-queue.js
export const DISPATCHABLE_SKILLS = Object.freeze(["se-author"]); // A2 re-grounding
```

That is a declaration, which BR-START-4 forbids unless something ties it to the modules. The tie is a
**workflows-side test** (not production code) that scans each module's own source for skill literals
at dispatch call sites and asserts set-equality with the export. A skill added to a dispatch without
being added to the export fails that test in this repo, before the engine ever sees it. At HEAD the
derived union is **10 identifiers** — the count is an observation, never the assertion.

Adding an export is a change to the modules, in this repo, with tests (C-4). It is bundle-safe:
`stripModuleSyntax` (`pdlc/workflows/build-runtime.mjs:45`) rewrites `export const` to `const`, and
the bundle's published-binding lists (`:87`, `:107`) are explicit, so the runtime bundles are
unaffected by a name they do not publish.

**Rung 4 therefore imports the two modules** (after rungs 1–3 pass, never before — R-ARCH-1 keeps that
import inside `lib/run.mjs`, which exposes `loadDispatchableSkills()` for startup to call). The
equality is then computed over that scope:

| Direction | Statement | Failure |
|---|---|---|
| A: dispatchable ⊆ readable | every derived identifier has a present, non-empty prompt file under `{pluginRoot}/skills/{id}/` | refusal naming each missing identifier |
| B: readable ⊆ dispatchable | every prompt file **belonging to a derived identifier's directory** is reachable by a composed dispatch | refusal naming each unreachable file |
| out of scope | a prompt file under a skills directory no module dispatches (`tech-lead`, `consolidate-learnings`, …) | reported, never a refusal (EC-START-7) |

Direction B is what forces §3.3's supplement decision. `skills/se-implement/` holds three files
(`SKILL.md`, `SKILL-typescript.md`, `SKILL-python.md`), and **no module dispatch names a supplement**
— `SKILL-typescript`/`SKILL-python` appear nowhere in `pdlc/workflows/*.js`; the supplements are
loaded by the *agent* at runtime per `pdlc/skills/se-implement/SKILL.md:3`, which under a headless
dispatch it cannot do (it is told no plugin path). **Decision: the engine inlines a dispatched
identifier's whole prompt-file set**, `SKILL.md` first, each supplement following under a named
delimiter. This makes the 12-file count REQ AC-3.5 fixes reachable, satisfies Direction B without an
exemption list, and keeps BR-SKILL-3's intent (the supplements travel with `se-implement` and only
with it). It is an engine-side *composition* choice, not a prompt rewrite (NG-8): no byte of any
`SKILL.md` changes. See the FSPEC erratum this raises, §9.

`composeDispatchPrompt(skillName, skillText, taskPrompt)` (`skills.mjs:312`) keeps its shape — role
line, delimited role definition, task — and gains the supplement blocks between the role definition
and the task. `skillFilePath()` (`:267`) keeps both identifier forms (`se-implement`,
`se-implement:SKILL-typescript.md`) and its traversal guard (`:278-280`).

Plugin-root resolution is discharged and unchanged (O-8): explicit override → install registry →
extracted cache → marketplace checkout, with `tried[]` retained for a legible refusal
(`skills.mjs:204-256`).

### 3.4 The `Transport` interface and its two implementations (C-3, BR-TRANS-*)

One interface, deliberately narrow — a transport dispatches a composed prompt and reports what it
observed. It owns no policy: no retry, no backoff, no rate-limit pausing, no auth verdict. Those live
one layer up in the adapter (R-ARCH-2).

```js
createTransport({ queryFn, env, apiKeySourcePolicy, defaultTimeoutMs, permissionMode })
  -> { dispatch(prompt, { model, cwd, timeoutMs, maxTurns })
         -> Promise<DispatchResult> }
```

`createTransport` (`transport.mjs:135`) and its `dispatch` JSDoc (`:143-150`) already declare exactly
this shape at HEAD; the SDK implementation is the one that exists. **Both implementations return the
same `DispatchResult`** (§4.2) and throw from the same four-class error set — `AuthPolicyError`
(`:23`), `RateLimitedError` (`:33`), `TimeoutError` (`:46`), `TransportError` (`:55`) — which is why
`classifyOutcome` (§5.1) can be transport-blind.

| Concern | `transport.mjs` (SDK, primary) | `transport-cli.mjs` (`claude -p`, fallback, new) |
|---|---|---|
| dispatch | `queryFn({ prompt, options })`, consume the async stream | spawn `claude -p --output-format stream-json`, consume stdout lines |
| model / cwd / turns | `options.model` / `.cwd` / `.maxTurns` (`:176-178`) | `--model`, child `cwd`, `--max-turns` |
| child env | `{ ...env }`, **spread, never replaced** (`:159`) | identical rule, same helper |
| timeout | `AbortController` + timer (`:162-166`) | same timer, `child.kill("SIGTERM")` then `SIGKILL` |
| `apiKeySource` | `system/init` message (`:199-206`) | same field in the stream-json init line |
| permission mode | `options.permissionMode` + paired `allowDangerouslySkipPermissions` (`:170-174`) | `--permission-mode`, `--dangerously-skip-permissions` |
| guard parity | in-process `hooks.PreToolUse` (§6) | `--settings` file per dispatch (§6) |
| absent terminal result | `TransportError` (`:236-243`) | identical: a stream that ends without a result is a contract violation, never an empty success |

**The proxy-passthrough rule is a shared invariant, not two implementations of one idea** (C-2, G-4).
The env spread at `transport.mjs:159` is what carries `ANTHROPIC_BASE_URL` and
`ANTHROPIC_CUSTOM_HEADERS` (SPIKE §4) into every dispatch. A single exported helper builds the child
env for both transports, and a shared parity test asserts a sentinel variable survives (BR-PARITY-5).

**Per-dispatch auth assertion stays in the transport** (C-1b), because it is an observation of that
dispatch, not a policy: the observed `apiKeySource` is checked against `apiKeySourcePolicy`
(`DEFAULT_API_KEY_SOURCE_POLICY = ["none"]`, `:63`) and a mismatch throws `AuthPolicyError` **before
any tool runs**. `startupFor` (`bin/pdlc.mjs:88`) widens that set to the five-member policy only under
`--allow-api-key-billing` (`:93`).

**Transport selection is explicit and recorded.** `resolveTransport({ env, flags })` returns
`{ kind: "agent-sdk" | "cli", transport, reason }`; the primary is chosen unless the operator selects
the fallback. There is **no silent failover**: an SDK failure is a failure (BR-TRANS-6), because a
transport that quietly changes underneath a run makes every subsequent observation unattributable.

### 3.5 The message catalogue seam (C-8, AC-6.4)

Every operator-visible string the engine emits — refusals, gate reasons, pause notices, exit
summaries — is registered, and emitted only through the registry:

```js
// lib/catalogue.mjs (new)
export const MESSAGES = Object.freeze({ "auth.api-key-refused": { severity, template }, ... });
export function message(id, params): string   // throws on unknown id or missing param
export function messageIds(): string[]
```

Three properties, all mechanically checked rather than reviewed:

- **Unknown id throws** at emission, so an unregistered string cannot reach an operator.
- **Every registered id is emitted at least once by the suite, asserted once suite-wide**, not per
  test: each `message()` call records its id into a run-scoped set, and a final test asserts
  set-equality with `messageIds()`. Per-test assertions would make the property vacuous the moment a
  test is skipped (this repo's `consolidation-agent-vacuous-green` lesson).
- **Ids are stable identifiers, wording is not.** The catalogue id is the contract other documents
  cite (`auth.*` rows in §3.2); the template may be reworded without a spec change, and no test
  asserts prose.

Severity is data on the entry, not the caller's choice, so the same condition cannot be a warning in
one path and a refusal in another.

### 3.6 Report and provenance seams (AC-4.5, BR-REP-0, NG-7)

`buildEngineBlock()` (`report.mjs:36`) and `stampReport(report, engine)` (`:70`) keep their contract:
the module's report is copied verbatim and extended with one `engine` key — `stampReport` never
mutates and never edits a module-produced field (NG-7). Two fields change from declaration to
observation:

| Field | HEAD | Target |
|---|---|---|
| `transport` | hardcoded `"agent-sdk"` (`report.mjs:51`) | the `kind` `resolveTransport` chose, recorded once per run |
| `apiKeySource` | one run-scoped `lastApiKeySource` (`adapter.mjs:245`, written `:320`, read `:381`) | a per-dispatch record; the block carries the observed set plus per-dispatch rows |

`buildEngineBlock` therefore takes `transport` and `authSources` arguments instead of a constant and a
scalar. Both are supplied by the adapter's getters, which is why the adapter already exposes
`getPauseLog`, `getDenialLog`, `getDispatchCounts`, `getApiKeySource` — the last becomes
`getAuthSources()`. **The engine writes the `engine` block and nothing else**, so a module field and
an engine field can never collide silently: a test asserts `engine` is the only key `stampReport`
adds.

## 4. Data Model

Every shape here is engine-owned and in-memory. **The engine defines no persisted schema**: the
pipeline's documents, cross-reviews, queue table and drift-state file remain exactly as the workflow
modules write them (NG-7). The only bytes the engine adds to disk are the `engine` block inside the
run report (§3.6) and, when the operator asks for it, the report file itself.

### 4.1 `DispatchDescriptor` — what the adapter hands a transport

```js
{ skill: string,          // a member of the derived dispatchable set (§3.3)
  label: string|null,     // the module's phase label, for logs and pause rows
  prompt: string,         // composed: role line + role definition + supplements + task
  model: string,          // verbatim from the module's opts.model; never defaulted here
  cwd: string|undefined,  // per-dispatch, never process.chdir (§2.3)
  timeoutMs: number,      // dispatch.timeoutMinutes × 60 000
  attempt: number }       // 0-based; 0 is the first try, not a retry
```

`model` passes through untouched (`adapter.mjs:271`): the modules own phase→model pinning
(`MODEL_DEFAULT` `orchestrate-dev.js:1603`, `MODEL_IMPLEMENTATION` `:1646`, `MODEL_ADVISORY` `:1652`,
`MODEL_ADVISORY_FALLBACK` `:1653`, `MODEL_QUEUE` `orchestrate-queue.js:70`). An engine-side default
would silently re-price a phase, so there is none — an absent `model` is passed as absent and the
transport omits the option (`transport.mjs:176`).

### 4.2 `DispatchResult` and `Outcome`

```js
DispatchResult = {
  text: string,                 // the assistant's final text, verbatim
  sessionId: string,
  costUsd: number,
  usage: object,
  rateLimitEvents: object[],    // every rate_limit_event seen in the stream
  apiKeySource: string|null,    // from system/init; null when never reported
}
```

`_agent` returns `result.text` alone (`adapter.mjs`, §3.1) — the modules parse prose, and widening
that return would let a module start depending on transport internals.

```js
Outcome = "ok" | "retryable" | "timeout" | "auth-failure"
        | "transport-contract-violation" | "agent-reported-failure"    // AC-4.1
```

Exactly six members, frozen, exported once. **Set-equality is asserted in both directions** — every
classifier branch yields a member, and every member is produced by some fixture — so neither an
unclassified error nor a dead member can survive (§5.1).

### 4.3 `AuthPosture` and `StartupResult`

`AuthPosture` is §3.2's return: `{ row, catalogueId, refuses, evidencePath }`, plus the resolved
`apiKeySourcePolicy` the transport will enforce per dispatch. The startup posture (C-1a) and the
per-dispatch assertion (C-1b) share the catalogue id but are separate observations: agreement between
them is a checked property, not an assumption (a run may start on row 1 and observe a key mid-run).

```js
StartupResult = {
  ok: boolean,
  rungs: RungRecord[],     // always all six, 0..5, in order
  banner: string,
  pluginRoot: string|null,
  pluginVersion: string|null,
  reason: string|null,     // catalogue id + detail of the first failing rung
}
RungRecord = { rung: 0..5, name: string, state: "pass"|"fail"|"skipped", detail: string|null }
```

**The ladder is total** (BR-START-1): a rung after a failure records `"skipped"` with the reason it
was skipped, never absence. `pdlc doctor` prints the same array — the mechanism is one function, so
the diagnostic and the gate cannot diverge. HEAD's `runStartupChecks` (`startup.mjs:60`) returns
`{ok, banner, pluginRoot, pluginVersion, reason}` and pushes free-text check lines; the change is to
make the records structured and to add rungs 0 (args/cwd) and 5 (billing posture), keeping the string
banner as a rendering of the array (`formatStartup`, `:145`).

Rung 4's `EXPECTED_SKILLS` frozen literal (`startup.mjs:20`) is deleted, replaced by the derived set
(§3.3) — the constant is the declaration BR-START-4 forbids.

### 4.4 `PauseRow`, `DenialRow`, `DispatchCounts`

`PauseRow` exists at HEAD (`adapter.mjs`, pushed on `RateLimitedError`) and is unchanged:

```js
{ timestamp, skill, label, attempt, waitedMs, rateLimitType, status, resetsAt, retryAfterMs }
```

It is append-only and run-scoped: a pause is evidence of what the account did, so rows are never
coalesced or trimmed. `rateLimitType` and `status` carry the SDK's own vocabulary verbatim
(`"five_hour"`, `"rejected"` — SPIKE §3), never a normalised synonym, so the report can be read
against Anthropic's semantics rather than the engine's.

`DenialRow` records permission denials (`{ timestamp, skill, tool, reason }`); `DispatchCounts` is
`{ [skill]: number }`. Both feed the report, neither feeds a decision.

### 4.5 The `engine` report block

```js
report.engine = {
  engineVersion, pluginVersion, pluginRoot,
  transport: "agent-sdk" | "cli",          // observed choice, §3.6
  authSources: [{ skill, label, attempt, apiKeySource }],   // per dispatch, AC-4.5
  baseUrl: string|null,                    // ANTHROPIC_BASE_URL, or null when direct
  startup: RungRecord[],
  pauses: PauseRow[], denials: DenialRow[], dispatches: DispatchCounts,
  outcomes: { [Outcome]: number },         // all six keys, zeros included
  startedAt, finishedAt,
}
```

Two conventions this repo already relies on carry over. **Counts are present-and-zero, never absent**,
so a quiet run and a broken counter are distinguishable (the advisory tier's all-zero rows make the
same distinction). And **provenance is observation, never verdict**: `transport`, `authSources` and
`baseUrl` record what happened; nothing in the block is derived from what the engine intended.

`stampReport` places all of this under the single `engine` key of the module's own report object, so
`outcome`, `phase`, `prUrl`, `ciStatus` and every other module field reach the operator byte-identical
to a Claude Code run (AC-1.1, `orchestrate-dev.js:6190`).

## 5. Error Handling

### 5.1 `lib/outcome.mjs` — one total classifier (AC-4.1, BR-FAIL-1)

The classification decision is extracted out of the transport into a new module so that it is (a)
transport-blind and (b) testable without a dispatch:

```js
export const OUTCOMES = Object.freeze([
  "ok", "retryable", "timeout", "auth-failure",
  "transport-contract-violation", "agent-reported-failure",
]);
export function classifyOutcome({ error, result }): Outcome    // total: no throw, no undefined
export function observedOutcomes(): Set<string>               // suite-wide accumulator, §7.4
```

The mapping is by error class, which is why §3.4 requires both transports to throw the same four:

| Input | Outcome |
|---|---|
| `AuthPolicyError` (`transport.mjs:23`) | `auth-failure` |
| `RateLimitedError` (`:33`) | `retryable` |
| `TimeoutError` (`:46`) | `timeout` |
| `TransportError` (`:55`) | `transport-contract-violation` |
| a result whose text the module's own contract marks as a reported failure | `agent-reported-failure` |
| anything else, with a terminal result | `ok` |

HEAD already funnels every thrown value into those four classes: `classifyThrown`
(`transport.mjs:98`) passes the four through unchanged, maps a fired timer to `TimeoutError`
(`:107-109`), a rate-limit-shaped error to `RateLimitedError` (`:110-121`) forwarding `status`,
`rateLimitType`, `resetsAt`, `retryAfterMs` verbatim, and **everything unrecognised to
`TransportError`** (`:123`) — never to success and never to `retryable`. That last arm is the reason
`classifyOutcome` can be total without a fallback branch of its own.

Two obligations follow, and both are tests rather than code:

- **Forward (outputs ⊆ six), suite-wide.** Every `classifyOutcome` call records into
  `observedOutcomes()`; one final test asserts that set is a subset of `OUTCOMES`. Scoping the
  assertion to the provocation corpus alone would let a seventh member appear in any other test
  unnoticed — the same accumulate-then-assert shape as the catalogue (§3.5).
- **Reverse (six ⊆ outputs).** A named provocation fixture per member. A member no fixture reaches
  fails the check, and the repair is a new fixture, never a loosened oracle.

`agent-reported-failure` is classified, recorded, and handed to the module unchanged (BR-FAIL-2). It
is terminal for the dispatch: never retried, consuming no attempt beyond the one that produced it. The
modules own what a failed agent response means — re-dispatch, round exhaustion, POSTMORTEM — and an
engine that retried here would silently double a review round.

### 5.2 The retry machine (AC-4.2, BR-RETRY-1…4)

HEAD implements **rate-limit pausing only**: `_agent` retries the same dispatch on `RateLimitedError`
up to `maxRateLimitPauses` (`adapter.mjs:290-318`, default 3 at `:57`) and rethrows every other error
(`:291-292`). Timeouts are not retried at all. The target machine keeps that loop's shape and
generalises its predicate:

- **One budget, `dispatch.retryAttempts` (default 3 retries after the first attempt), shared by
  `retryable` and `timeout`** (BR-RETRY-1). A timeout retry is one of the three, never an extra one.
- **A per-dispatch cap of one timeout retry** (BR-RETRY-2): a second `timeout` anywhere in the
  remaining attempts is terminal even with budget left. The cap is counted per dispatch *run*, not per
  attempt position, so it is a counter beside `attempt`, not a comparison against it.
- **Budgets are per dispatch** (BR-RETRY-4): `attempt` is a local of the `_agent` call
  (`adapter.mjs:285`, "number of pauses already taken for THIS dispatch"), so nothing accumulates across dispatches within a phase. That locality is the
  mechanism — a run-scoped counter would make one slow phase silently starve the next.
- **`auth-failure` and `transport-contract-violation` are never retried**, at any budget.

Delays come from `computeRateLimitWaitMs` (`adapter.mjs:75`), unchanged in preference order:
transport-supplied `retryAfterMs` if finite and positive → the remaining interval to a supplied
`resetsAt` (`< 1e12` guarded) → exponential `baseMs × 2^attempt` from 30 s (`:58`), every branch capped
at 15 min (`:59`) with ≤ 1 s of jitter added (`:60`). Because the ladder is a pure function of
`(err, attempt, options)` with `now`/`jitterFn` injected, FSPEC §8.2's pause table and its eight
sequences are transcribed into fixtures directly — the tests assert the delay, not that "a pause
happened".

**Every pause is recorded** (§4.4) with the delay actually observed, so an unattended run's wall clock
is explainable afterwards: three 30 s pauses and a 30/60/120 s ladder are distinguishable in the
report.

### 5.3 Engine-fatal stops (BR-FAIL-3)

`auth-failure` and `transport-contract-violation` end the run at exit `1` **without any module halt**:
no POSTMORTEM is written, no `halted` queue row is committed, and the feature's queue row stays
exactly as the modules last left it (typically `in-progress`). The engine never fabricates a pipeline
outcome — a POSTMORTEM it invented would be indistinguishable from one the review loop produced, and
this repo's whole halt-clearing protocol (`RESOLVED: yes` against a real `## Recommendation`) depends
on that distinction holding.

The single witness is the run report on stdout, carrying the dispatches already made and the
classification that stopped the run. Mechanically: the engine catches at the top of `runDev`/`runQueue`
(`run.mjs:187`, `:228`), stamps the report (§3.6), prints it, and exits — the module is never given a
chance to write its own halt artefacts, because it is no longer running.

### 5.4 Exit-code mapping (AC-1.4, BR-EXIT-1…3)

| Code | Condition | Written where |
|---|---|---|
| `0` | the pipeline finished, or a non-dispatching surface (`doctor`, `--dry-run`) passed | `bin/pdlc.mjs:236-238` |
| `2` | the pipeline **halted or blocked at its own gate** — a normal, recorded pdlc outcome | the module's `outcome` field, mapped once |
| `1` | the **engine** refused or crashed: startup gate, auth policy, bad usage, unparseable transport output | every refusal path, uniformly |

**A halt is not a crash** (BR-EXIT-1). The modules produce a halt's record — POSTMORTEM file, `halted`
queue row, pathspec-scoped commit — and the engine's only job is to stay alive long enough for those
writes to land, then report `2`. Exiting `1` on a halt would erase the operator's ability to tell
"pdlc stopped and told you why" from "the host broke", which is the distinction the exit code exists
for.

The mapping lives in **one** function over the module's `outcome` field, called once at the top level,
so `refused`, `idle`, `no-queue`, `halted`, `blocked` and `max-passes` (`run.mjs:273`) cannot acquire
divergent codes down different paths. Under `--loop`, the loop's code is the worst iteration's,
`1` > `2` > `0` (BR-EXIT-3); since a refusal stops the loop, the worst is always the last iteration's.

## 6. Guard Parity Design

## 7. Test Strategy

## 8. Traceability

## 9. Open Questions

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
| pdlc | draft | Claude | 1.1 | 2026-08-11 |

**v1.1 changelog** — revision round 1, addressing `CROSS-REVIEW-product-manager-TSPEC-v1.md`
(4 High, 2 Medium, 1 Low) and `CROSS-REVIEW-test-engineer-TSPEC-v1.md` (7 High, 7 Medium, 2 Low).
Substantive changes: transport selection removed in favour of FSPEC §3.2's no-selector decision
(§3.4, §4.5); the suite's accumulate-then-assert mechanism replaced with a cross-process one
(§7.4, and its consumers §3.5, §5.1); the skill-set derivation oracle changed from a source scan to
a data read (§3.3); the queue's dispatchable set corrected and rung 4's scope stated (§3.3);
`agent-reported-failure` given a literal predicate and an owning layer (§5.1); the guard-parity
oracle given an execution mechanism and falsifying counterparts (§6.3); AC-1.2's filesystem
observation designed (new §7.7); the `engine` block enumerated against FSPEC §12.2 and given a
loop-termination sub-block (§4.5); tunables collected into one resolver table (new §4.6).

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
(`adapter.mjs:278`) so the transport pins the agent's own working directory (AC-2.5, BR-CWD-1)
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
| `_runPipeline(args)` | `realMain` (`orchestrate-queue.js:1041`) | — | ✅ | **Necessity:** the queue calls it at `:1422` with `{reqPath}` and *no seams*, so the delegated dev pipeline would reach the throwing stub |
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

**The identifier set is derived from the modules, not declared beside them.** A hand-typed array
beside the dispatch sites is exactly the declaration BR-START-4 forbids, and a *source scanner*
tying that array to the modules does not repair it: only three of the ten identifiers sit at an
`_agent("…")` call site (`ship-pr` `orchestrate-dev.js:8008`, `:8112`; `se-implement` `:8064`). The
rest are reached by other shapes — `agentFn("se-implement", …)` (`:10142`, `:10251`),
`agentFn("harvest-learnings", …)` (`:10542`), a `skill:` object field (`:10448`), bare argument
literals (`"dod-verify"` `:8035`, `"se-author"` `:9964`), a named constant (`ADVISORY_RUNG_SKILL`
`:1797`) — and five of them (`pm-author`, `pm-review`, `te-author`, `te-review`, `se-review`) appear
**only** as `PHASE_DISPATCH` role fields (`:3337` the export, `:3344`–`:3435` the rows). A scanner
honouring "skill literals at dispatch call sites" derives `{ship-pr, se-implement}`, set-equality
fails, and the only available repair is loosening the oracle — which is how the property goes
quietly vacuous.

**So the export is computed, not typed, and the oracle reads data rather than parsing source.** The
change to each module is one derivation plus the promotion of the remaining bare literals to named
constants, so that every dispatched identifier is reachable as a module-level value:

```js
// pdlc/workflows/orchestrate-dev.js — PHASE_DISPATCH is already exported (:3337)
export const ADVISORY_RUNG_SKILL = "se-review";           // was module-local (:1797)
export const SKILL_SHIP_PR = "ship-pr";                   // :8008, :8112
export const SKILL_SE_IMPLEMENT = "se-implement";         // :8064, :10028, :10068, :10142, :10251, :10448
export const SKILL_DOD_VERIFY = "dod-verify";             // :8035
export const SKILL_HARVEST = "harvest-learnings";         // :10542
export const SKILL_SE_AUTHOR = "se-author";               // :9964

const PHASE_ROLE_KEYS = ["creator", "optimizer", "verifier", "remediator", "reviewers"];
export const DISPATCHABLE_SKILLS = Object.freeze([...new Set([
  ...Object.values(PHASE_DISPATCH).flatMap((p) =>
    PHASE_ROLE_KEYS.flatMap((k) => (p[k] == null ? [] : [].concat(p[k])))),
  ADVISORY_RUNG_SKILL, SKILL_SHIP_PR, SKILL_SE_IMPLEMENT,
  SKILL_DOD_VERIFY, SKILL_HARVEST, SKILL_SE_AUTHOR,
])].sort());

// pdlc/workflows/orchestrate-queue.js — imports from orchestrate-dev.js already (:41)
export const SKILL_TRIAGE = "se-author";                  // Phase-0 readiness triage (:1216)
export const DISPATCHABLE_SKILLS = Object.freeze(
  [SKILL_TRIAGE, ADVISORY_RUNG_SKILL].sort());            // advisory reached via :1252 → :1258
```

Two corrections to v1.0 are folded in here, both grounded at HEAD. The queue's set is **not**
`["se-author"] // A2 re-grounding`: `se-author` is the queue's **Phase-0 readiness triage** dispatch
(`orchestrate-queue.js:1216`), and the queue reaches a *second* identifier the v1.0 array omitted —
`runAdvisorySeamFn` is called at `:1252` with `_agent: rawAgentFn` (`:1258`), and `runAdvisorySeam`
(`orchestrate-dev.js:2943`) dispatches under `ADVISORY_RUNG_SKILL` (`:1841`). A source scan could
never have caught that omission either, because the `"se-review"` literal lives in the *dev*
module's source, so declaration and scanner would have agreed with each other and both disagreed
with the run.

The tie is then two **workflows-side tests** (not production code), and neither parses source:

| Test | Assertion | What it catches |
|---|---|---|
| derivation | `DISPATCHABLE_SKILLS` ≡ the union recomputed in the test from `PHASE_DISPATCH` + the named constants, read as imported data | an identifier added to a phase row or a constant and not to the export — impossible by construction, so this is a regression guard on the derivation itself |
| no-bare-literal | no string literal equal to a member of the union appears in either module's source outside the constant declarations, `PHASE_DISPATCH`, and the exemption below | a *new* dispatch site typed as a bare literal, which is the only way an identifier can escape the derivation |

**The no-bare-literal test needs a stated exemption, and the exemption is a fixed list rather than a
loosened pattern.** At HEAD the reviewer-role map keys three of the ten identifiers as object keys
that are not dispatch sites at all — `"se-review": "software-engineer"` (`orchestrate-dev.js:6229`),
`"pm-review": "product-manager"` (`:6230`), `"te-review": "test-engineer"` (`:6231`). Promoting these
to computed keys is churn against correct code, so the test as first written would fail on HEAD and
the only repairs would be a looser pattern or a deleted assertion — the pressure this section exists
to remove. So the exemption is named here, in the spec, as a **closed allow-list of non-dispatch
literal sites**, and the test asserts the observed exempt sites are **exactly** that list, not merely
contained in it:

| Exempt site | Identifiers | Why it is not a dispatch |
|---|---|---|
| reviewer-role map keys, `orchestrate-dev.js:6229-6231` | `se-review`, `pm-review`, `te-review` | maps a skill id to a review *role* name for filename construction; no `_agent` call reads it |

An added exemption is therefore a reviewed decision recorded in this table, never an implementer's
local widening of a regex. A literal appearing anywhere else — including a fourth row added to that
same map — fails the test.

At HEAD the derived union is **10 identifiers** — an observation, never the assertion; the assertion
is set-equality.

Adding these exports is a change to the modules, in this repo, with tests (C-4). It is behaviourally
bundle-safe: `stripModuleSyntax` (`pdlc/workflows/build-runtime.mjs:45`) rewrites `export const` to
`const`, and the bundle's published-binding lists (`:87`, `:107`) are explicit, so the runtime
bundles are unaffected by a name they do not publish. It is **not** byte-safe: `stripModuleSyntax`
inlines the whole module body, so both `pdlc/workflows/dist/*.bundle.js` and
`distribution-manifest.json` change and must be rebuilt and committed in the same task
(`.github/workflows/pr-tests.yml:77` `artifact-freshness` gates on exactly that — §8.3).

**Rung 4 therefore imports the two modules** (after rungs 1–3 pass, never before — R-ARCH-1 keeps that
import inside `lib/run.mjs`, which exposes `loadDispatchableSkills()` for startup to call).
**Rung 4 checks the union of both modules' sets on every invocation, not the invoked command's
module alone.** Under a per-command reading `pdlc queue` would pass rung 4 over a set excluding a
skill it can dispatch — `se-review` reaches the queue only through the delegated dev pipeline and
the advisory seam — and a missing `se-review/SKILL.md` would surface mid-run instead of at startup.
The union is also cheap: `lib/run.mjs` imports both modules regardless, because the queue imports
the dev module itself (`orchestrate-queue.js:41`). The equality is then computed over that scope:

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

**The delimiter grammar is fixed and asserted** (TE Q-02). Each supplement is introduced by a line
`--- BEGIN SUPPLEMENT: {basename} ---` and closed by `--- END SUPPLEMENT: {basename} ---`, matching
the role-definition delimiters `composeDispatchPrompt` already emits (`skills.mjs:312`). AC-3.1's
oracle is then **set-equality over the file set**, not containment of a supplement's text somewhere
in the prompt: for each dispatched identifier, the set of basenames appearing in BEGIN markers ≡ the
set of `.md` files in that identifier's skill directory (3 for `se-implement`, 1 for each of the
other nine, 12 in total). Containment would pass a prompt that inlined a supplement twice, or one
that inlined a file no longer in the directory.

`composeDispatchPrompt(skillName, skillText, taskPrompt)` (`skills.mjs:312`) keeps its shape — role
line, delimited role definition, task — and gains the supplement blocks between the role definition
and the task. `skillFilePath()` (`:267`) keeps both identifier forms (`se-implement`,
`se-implement:SKILL-typescript.md`) and its traversal guard (`:278-280`).

Plugin-root resolution is discharged and unchanged (O-8): explicit override → install registry →
extracted cache → marketplace checkout, with `tried[]` retained for a legible refusal
(`skills.mjs:204-256`).

### 3.4 The `Transport` interface and its two implementations (C-2, C-6, FSPEC §3.2)

One interface, deliberately narrow — a transport dispatches a composed prompt and reports what it
observed. It owns no policy: no retry, no backoff, no rate-limit pausing, no auth verdict. Those live
one layer up in the adapter (R-ARCH-2).

```js
createTransport({ queryFn, env, apiKeySourcePolicy, defaultTimeoutMs, permissionMode })
  -> { dispatch(prompt, { model, cwd, timeoutMs, maxTurns })
         -> Promise<DispatchResult> }
```

**This four-key options object is the whole transport-facing boundary**, and the boundary test
asserts set-equality over its keys, not containment. §4.1's `DispatchDescriptor` is a strictly wider
*adapter-internal* shape: `skill`, `label` and `attempt` stay adapter-local (`adapter.mjs:272`,
`:285`) and are never handed to a transport, which is why HEAD builds `dispatchOpts` as
`{ cwd }` plus the three optional keys (`adapter.mjs:278-281`) rather than forwarding the
descriptor. The two enumerations are deliberately different and §4.1 names which is which.

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

**There is no transport selector in this feature, and `resolveTransport` takes no operator input.**
FSPEC §3.2 is explicit (`FSPEC:193-196`): every real run uses the primary transport, the fallback is
exercised through recorded fixtures only, and making it runtime-selectable is O-1's work, not this
document's. v1.0 stated the opposite here and the correct thing in §6.4; this is the single place
the question is settled.

```js
resolveTransport({ env }) -> { kind: "agent-sdk", transport, reason }   // kind is constant here
```

The consequences a test author needs, stated rather than implied:

- **`kind` is `"agent-sdk"` on every code path a run can take.** `reason` is present so the field
  reads as an observation rather than a constant, and so O-1 can add branches without changing the
  shape; at this feature's scope `reason` has one value, naming the absent selector.
- **`"cli"` is reachable only by direct unit construction** — a test importing `transport-cli.mjs`
  and driving it over §7.2's recorded fixtures. It is not reachable through `resolveTransport`, and
  no flag, env var or fallback path produces it.
- **The report's `transport` field therefore asserts one value on any run-shaped test** (§4.5), and
  two only in the per-transport unit tests that construct the fallback directly. The
  `"agent-sdk" | "cli"` enumeration is the field's *type*, not its runtime range in this feature.
- **There is no failover, silent or otherwise** (**R-TRANS-1**, a TSPEC-introduced design rule with
  no upstream id — v1.0 attributed it to a `BR-TRANS-6` that does not exist in REQ or FSPEC): an SDK
  failure is a failure, classified by §5.1 and surfaced. With no selector there is nothing to fail
  over *to*, and a transport that quietly changed underneath a run would make every subsequent
  observation unattributable.

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
  test: each `message()` call appends its id to the run's observation directory (§7.0's
  cross-process mechanism — a module-scoped `Set` would be per test *file*, not per run), and a
  final step asserts set-equality with `messageIds()`. Per-test assertions would make the property
  vacuous the moment a test is skipped (this repo's `consolidation-agent-vacuous-green` lesson).
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
| `transport` | hardcoded `"agent-sdk"` (`report.mjs:50`) | the `kind` `resolveTransport` returned, recorded once per run — same value, but observed rather than declared (§3.4) |
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

### 4.1 `DispatchDescriptor` — the adapter's own per-dispatch record

**This is an adapter-internal shape, not the transport boundary.** The transport receives §3.4's
four-key options object (`{ model, cwd, timeoutMs, maxTurns }`, built at `adapter.mjs:278-281`);
`skill`, `label` and `attempt` stay adapter-local (`:272`, `:285`) and feed the logs, pause rows and
`authSources` records instead. Two enumerations, two different boundary tests: set-equality over the
transport's option keys, and field-presence over the descriptor.

```js
{ skill: string,          // a member of the derived dispatchable set (§3.3)
  label: string|null,     // the module's phase label, for logs and pause rows
  prompt: string,         // composed: role line + role definition + supplements + task
  model: string,          // verbatim from the module's opts.model; never defaulted here
  cwd: string|undefined,  // per-dispatch, never process.chdir (§2.3)
  timeoutMs: number,      // dispatch.timeoutMinutes × 60 000 (§4.6)
  attempt: number }       // 0-based; 0 is the first try, not a retry
  // maxTurns is a transport option with no descriptor field: the modules never set it,
  // so it is absent per dispatch and the transport omits it (transport.mjs:178).
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
the diagnostic and the gate cannot diverge.

**`doctor` has a stated projection, not just "prints the array"** (AC-2.1's closing paragraph,
`REQ:428-432`; FSPEC BR-START-3 `:303-305`). AC-2.1 requires three facts readable *without starting
a run*, and a `RungRecord`'s `{rung, name, state, detail}` does not carry them, so `StartupResult`
gains them as first-class fields rather than leaving them buried in `detail` prose:

| AC-2.1 fact | Field | Rung that observed it |
|---|---|---|
| engine and plugin versions, always as a pair | `versions: { engine, plugin }` | 3 (handshake, C-10) |
| effective base URL | `baseUrl: string\|null` | 5 (billing posture) |
| auth catalogue id | `auth: { row, catalogueId }` (§3.2's `AuthPosture`, minus `refuses`) | 5 |

`doctor` renders exactly those three plus the rung array, and the same three are the values §4.5's
`engine` block carries, from the same call — so the diagnostic and the report cannot disagree about
a fact one of them observed. HEAD's `runStartupChecks` (`startup.mjs:60`) returns
`{ok, banner, pluginRoot, pluginVersion, reason}` and pushes free-text check lines; the change is to
make the records structured and to add rungs 0 (args/cwd) and 5 (billing posture), keeping the string
banner as a rendering of the array (`formatStartup`, `:145`).

Rung 4's `EXPECTED_SKILLS` frozen literal (`startup.mjs:20`) is deleted, replaced by the derived set
(§3.3) — the constant is the declaration BR-START-4 forbids.

### 4.4 `PauseRow`, `RetryRow`, `DenialRow`, `DispatchCounts`

`PauseRow` exists at HEAD (`adapter.mjs`, pushed on `RateLimitedError`) and its fields are unchanged:

```js
{ timestamp, skill, label, attempt, waitedMs, rateLimitType, status, resetsAt, retryAfterMs }
```

It is append-only and run-scoped: a pause is evidence of what the account did, so rows are never
coalesced or trimmed. `rateLimitType` and `status` carry the SDK's own vocabulary verbatim
(`"five_hour"`, `"rejected"` — SPIKE §3), never a normalised synonym, so the report can be read
against Anthropic's semantics rather than the engine's.

**`RetryRow` is new** (`{ timestamp, skill, label, attempt, outcome, delayMs }`) and is the row
FSPEC §12.2 asks for by name — "taxonomy member, phase, attempt number, delay". `PauseRow` alone
could not carry it: it has no taxonomy-member field, and §5.2 now retries `timeout`, which produces
no rate-limit pause at all and so would otherwise appear in the report nowhere. Every retry writes a
`RetryRow`; a rate-limit retry additionally writes the `PauseRow` that records what the *account*
did. The two are not redundant — one is the engine's decision, the other the provider's state.

`DenialRow` records permission denials (`{ timestamp, skill, tool, reason }`). `DispatchCounts` is
`{ bySkill: { [skill]: number }, byPhase: { [label]: number } }`: FSPEC §12.2 asks for **per-phase**
counts, and HEAD's `{[skill]: number}` (`adapter.mjs` `dispatchCounts`) cannot answer that, since one
skill is dispatched from several phases. Both keys are always present, empty objects included. All of
these feed the report; none feeds a decision.

### 4.5 The `engine` report block

```js
report.engine = {
  engineVersion, pluginVersion, pluginRoot,
  startupAuth: { row, catalogueId },       // the §3.2 row that decided at startup
  transport: "agent-sdk",                  // observed, §3.6; one value in this feature (§3.4)
  authSources: [{ skill, label, attempt, apiKeySource }],   // per dispatch, AC-4.5
  baseUrl: string|null,                    // ANTHROPIC_BASE_URL, or null when direct
  startup: RungRecord[],
  dispatches: DispatchCounts,              // per phase label and per skill (§4.4)
  retries: RetryRow[],                     // every retry, §4.4 — empty array, never absent
  pauses: PauseRow[], denials: DenialRow[],
  tunables: { retryAttempts, retryBackoff, timeoutMinutes, maxIterations },  // effective, §4.6
  permissionMode: string,                  // the single named setting in force (BR-PERM-1/2)
  loop: { iterations, maxIterations, stopReason } | null,   // queue --loop only, below
  outcomes: { [Outcome]: number },         // all six keys, zeros included
  startedAt, finishedAt,
}
```

**Row-by-row against FSPEC §12.2** (`FSPEC:1149-1160`), because a reader must be able to check
completeness rather than infer it. Six rows are AC-4.5's own; three are FSPEC-added:

| FSPEC §12.2 row | Field here | Note |
|---|---|---|
| engine version with the plugin version, as a pair | `engineVersion`, `pluginVersion` | always both, never one |
| startup auth catalogue id | `startupAuth.{row, catalogueId}` | **added in v1.1** — v1.0 carried no startup-posture field, only the per-dispatch one |
| transport-reported auth source, **per dispatch** | `authSources[]` | one row per dispatch, not a scalar (§3.6) |
| effective base URL | `baseUrl` | `null` when direct, never absent |
| per-phase dispatch counts | `dispatches` | keyed by phase label **and** skill; v1.0's `{[skill]: number}` alone could not answer "per phase" |
| retry / pause rows: taxonomy member, phase, attempt, delay | `retries[]`, `pauses[]` | **`retries[]` added in v1.1** — v1.0 carried `PauseRow` only, so a `timeout` retry (§5.2 now retries them) had no row at all |
| transport (FSPEC-added) | `transport` | §3.4 |
| effective dispatch tunables (FSPEC-added, BR-CLI-3) | `tunables` | **added in v1.1** — §4.6 |
| permission posture in force (FSPEC-added, BR-PERM-1/2) | `permissionMode` | **added in v1.1** — the single named setting's value, `transport.mjs:89` |

`RetryRow` is `{ timestamp, skill, label, attempt, outcome, delayMs }` where `outcome` is the
taxonomy member that provoked the retry (`retryable` or `timeout`) — the member FSPEC's row asks for
by name. A `PauseRow` is the rate-limit-shaped specialisation and keeps its own richer fields
(§4.4); a `retryable` retry produces one of each, a `timeout` retry produces a `RetryRow` only.

**The loop sub-block is what makes AC-1.3's two stop reasons distinguishable** without inspecting
the queue. `pdlc queue --loop` ends for exactly two declared reasons (REQ:379-387, FSPEC BR-LOOP-2
`:1074-1079`), and both exit `0`, so the exit code cannot carry the distinction:

| `stopReason` | Condition | HEAD |
|---|---|---|
| `"exhausted"` | no ready row remains — the module reported `idle` or `no-queue` | `run.mjs:279-281` returns that outcome |
| `"bound-reached"` | `queue.maxIterations` reached with ready work possibly remaining | `run.mjs:282` returns `outcome: "max-passes"` |

`loop.iterations` is the number of passes actually run and `loop.maxIterations` the bound in force
(`null` when unbounded — §4.6). The same two ids are the loop's own stdout outcome line
(catalogue ids `loop.exhausted` and `loop.bound-reached`, §3.5), so the operator reads the
distinction in the line *and* in the report, as AC-1.3 requires. `loop` is `null` for `pdlc dev` and
for a single-pass `pdlc queue`, which is the one place an absent value is meaningful: no loop ran.

Two conventions this repo already relies on carry over. **Counts are present-and-zero, never absent**,
so a quiet run and a broken counter are distinguishable (the advisory tier's all-zero rows make the
same distinction). And **provenance is observation, never verdict**: `transport`, `authSources` and
`baseUrl` record what happened; nothing in the block is derived from what the engine intended.

`stampReport` places all of this under the single `engine` key of the module's own report object, so
`outcome`, `phase`, `prUrl`, `ciStatus` and every other module field reach the operator byte-identical
to a Claude Code run (AC-1.1, `orchestrate-dev.js:6190`).

### 4.6 The tunable set and its single resolution point

REQ §4.1 (`:302-308`) fixes the closed set of thresholds and rules that "no AC may depend on a
tunable that is not listed here". All five are named here, with the one function that resolves each,
so an AC that depends on one is decidable. `resolveTunables({ config, flags })` is that function; its
return is what §4.5's `tunables` block reports, so the *effective* value is always observable
(BR-CLI-3).

| REQ §4.1 tunable | Default | Owner | Resolved from | HEAD |
|---|---|---|---|---|
| `dispatch.retryAttempts` | 3 retries after the first attempt | engine config | `resolveTunables` ← config, O-3 location | hard-coded `maxRateLimitPauses` default 3 (`adapter.mjs:57`) |
| `dispatch.retryBackoff` | exponential from 30 s, capped at 15 min | engine config | same | hard-coded `baseMs` 30 s (`adapter.mjs:58`), cap 15 min (`:59`), ≤1 s jitter (`:60`) |
| `dispatch.timeoutMinutes` | 30 min per dispatch | engine config | same | not a named tunable at HEAD; `timeoutMs` arrives per dispatch |
| `auth.allowApiKeyBilling` | `false` | operator, per invocation | **flag only** — `--allow-api-key-billing` (`bin/pdlc.mjs:88-93`), never config, never env (BR-CLI-2) | green |
| `queue.maxIterations` | **unbounded** | operator, per invocation | **flag only** — `--max-iterations` (`bin/pdlc.mjs:83`, `:303-307`) | green, and correctly unbounded: the flag omitted yields `Infinity` (`:304-305`), so `runQueueLoop`'s `maxPasses = 100` (`run.mjs:273`) is a *parameter* default the CLI always overrides, never the operator-visible one |

Three rules make the table load-bearing rather than descriptive:

- **One resolution point.** Every read of a tunable goes through `resolveTunables`; no call site
  reaches config or a flag directly, which is what makes the reported effective values honest.
- **The two operator-owned rows are flag-only** and are not accepted from configuration at all
  (BR-CLI-2 for billing; the same rule extended to `--max-iterations`, since an unattended bound
  silently set by a config file is the failure BR-LOOP-2 exists to prevent).
- **`queue.maxIterations` unbounded is the shipped default**, and AC-1.3's promise depends on it:
  with no flag the loop is bounded only by BR-LOOP-1 and `loop.maxIterations` reports `null`. A test
  asserts `runQueueLoop`'s own `100` is never the effective value on a CLI-driven run — a defaulted
  bound reached at pass 100 would be reported as `bound-reached` on a queue the operator believed
  unbounded.

Where engine configuration *lives* remains O-3 (§9.1); this section fixes the set, the defaults and
the resolution point, none of which depend on that answer.

## 5. Error Handling

### 5.1 `lib/outcome.mjs` — one total classifier (AC-4.1, BR-FAIL-1)

The classification decision is extracted out of the transport into a new module so that it is (a)
transport-blind and (b) testable without a dispatch:

```js
export const OUTCOMES = Object.freeze([
  "ok", "retryable", "timeout", "auth-failure",
  "transport-contract-violation", "agent-reported-failure",
]);
export function classifyOutcome({ error, result, reportedFailure }): Outcome   // total: no throw
```

The mapping is by error class, which is why §3.4 requires both transports to throw the same four:

| Input | Outcome |
|---|---|
| `AuthPolicyError` (`transport.mjs:23`) | `auth-failure` |
| `RateLimitedError` (`:33`) | `retryable` |
| `TimeoutError` (`:46`) | `timeout` |
| `TransportError` (`:55`) | `transport-contract-violation` |
| no error, and `reportedFailure === true` | `agent-reported-failure` |
| no error, otherwise, with a terminal result | `ok` |

**`agent-reported-failure` has a literal predicate, and it is not `outcome.mjs`'s.** v1.0 said only
"a result whose text the module's own contract marks as a reported failure", which no fixture can be
written against; and any workable predicate is module-prose knowledge (`VERDICT:` grammar, `ERRATUM:`
lines, POSTMORTEM conventions), which R-ARCH-2 forbids a layer-0 module from holding. Both are
resolved the same way — **the predicate lives at layer 2 and `outcome.mjs` receives an already-tagged
input**:

```js
// lib/adapter.mjs (layer 2) — the only place that reads a dispatch's text
const REPORTED_FAILURE_RE = /^\s*(DISPATCH-FAILED|ERROR):\s*\S/m;
const reportedFailure = REPORTED_FAILURE_RE.test(result.text);
classifyOutcome({ error: null, result, reportedFailure });
```

The literal predicate is: **the result text contains a line whose first non-space content is
`DISPATCH-FAILED:` or `ERROR:` followed by non-space text.** Upstream fixes only the member's
*meaning* — "the dispatch ran and the agent reported failure" (`FSPEC:709`, `REQ:519`) — and
deliberately leaves the predicate to this document (BR-FAIL-2 hands the *consequence* to the
modules), so the token above is TSPEC-introduced, with no upstream id. Three consequences worth
stating,
because each is a way this could have gone wrong:

- **It is engine vocabulary, not pipeline vocabulary.** It deliberately does *not* read `VERDICT:`,
  `REVISION-COMPLETE:` or `ERRATUM:`. Those are the modules' own parses of an agent's prose, and a
  dispatch carrying `VERDICT: Needs revision` is a **successful** dispatch — the module decides what
  the verdict means (BR-FAIL-2). An engine that classified it as a failure would silently convert a
  normal review round into a retry or a halt.
- **The fixture is a transcription, not an echo.** §5.1's reverse-direction fixture for this member
  is a recorded transport result whose text begins with `DISPATCH-FAILED: …`; it is written against
  the predicate stated *here*, in the spec, not against whatever the classifier happens to look for.
  The falsifying companion is a fixture whose text merely *mentions* the token mid-line, which must
  classify `ok`.
- **`outcome.mjs` stays policy-free** (R-ARCH-2): it holds the six-member enumeration and a total
  map over `(error, reportedFailure)`, and knows nothing about phases, skills or prose.

HEAD already funnels every thrown value into those four classes: `classifyThrown`
(`transport.mjs:98`) passes the four through unchanged, maps a fired timer to `TimeoutError`
(`:107-109`), a rate-limit-shaped error to `RateLimitedError` (`:110-121`) forwarding `status`,
`rateLimitType`, `resetsAt`, `retryAfterMs` verbatim, and **everything unrecognised to
`TransportError`** (`:123`) — never to success and never to `retryable`. That last arm is the reason
`classifyOutcome` can be total without a fallback branch of its own.

Two obligations follow, and both are tests rather than code:

- **Forward (outputs ⊆ six), suite-wide.** Every `classifyOutcome` call records its result through
  §7.0's cross-process observation seam; a final step asserts that union is a subset of `OUTCOMES`.
  Scoping the assertion to the provocation corpus alone would let a seventh member appear in any
  other test unnoticed — the same accumulate-then-assert shape as the catalogue (§3.5). **This
  direction is the one that fails vacuously green** if the accumulator is not genuinely cross-process
  (`observed ⊆ OUTCOMES` holds over the empty set), which is why §7.4's mechanism is specified rather
  than assumed, and why the harness's own emptiness is a failure (§7.4).
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
  attempt position, so it is a counter beside `attempt`, not a comparison against it. **The terminal
  reason is recorded, not just the terminality**: the last `RetryRow` (§4.4) carries
  `terminal: "timeout-cap" | "budget-exhausted"`, because FSPEC §8.2's sequence 8
  (`retryable, timeout, timeout`) ends by the cap with budget still left and is otherwise
  indistinguishable in the report from budget exhaustion.
- **Budgets are per dispatch** (BR-RETRY-4): `attempt` is a local of the `_agent` call
  (`adapter.mjs:285`, "number of pauses already taken for THIS dispatch"), so nothing accumulates across dispatches within a phase. That locality is the
  mechanism — a run-scoped counter would make one slow phase silently starve the next.
- **`auth-failure` and `transport-contract-violation` are never retried**, at any budget.

- **A `timeout` retry's delay is the backoff ladder's, with no rate-limit hints.** This is the one
  delay v1.0 left unstated. `computeRateLimitWaitMs`'s preference order is rate-limit-shaped
  (`retryAfterMs` → `resetsAt` → exponential), and a `TimeoutError` carries none of the first two, so
  a timeout retry takes the **exponential arm alone**: `dispatch.retryBackoff`'s `baseMs × 2^attempt`
  from 30 s (`adapter.mjs:58`), capped at 15 min (`:59`), with the same ≤1 s jitter (`:60`), using
  the shared `attempt` counter. Mechanically that is `computeRateLimitWaitMs` called with an error
  carrying no hints, so there is one ladder and not two. FSPEC §8.2's sequence 3 (`timeout, success`)
  is therefore testable on its timing: the fixture asserts a 30 s delay at `attempt` 0, not merely
  that a retry happened.

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
so `refused`, `idle`, `no-queue`, `halted`, `blocked` and `max-passes` (`run.mjs:282`) cannot acquire
divergent codes down different paths. Under `--loop`, the loop's code is the worst iteration's,
`1` > `2` > `0` (BR-EXIT-3); since a refusal stops the loop, the worst is always the last iteration's.

**The exit code deliberately does not distinguish AC-1.3's two stop reasons**, and that is why they
need a carrier elsewhere. `idle`, `no-queue` and `max-passes` all map to `0` — correctly, since all
three are clean terminations an unattended wrapper must not treat as failures — so the code cannot
tell "the queue is drained" from "the bound was reached with work remaining". §4.5's `loop.stopReason`
and the loop's own outcome line carry that distinction (`exhausted` / `bound-reached`), and §8.1
maps AC-1.3 to both. A wrapper reading only the exit code sees a clean stop; one that must not
believe a queue is drained reads the report.

## 6. Guard Parity Design

### 6.1 What is being reproduced

`pdlc/hooks/scripts/guard-harvest-before-delete.sh` is a blocking `PreToolUse` hook on the `Bash`
matcher. Its decision procedure, read from the script itself:

1. Parse the hook's stdin JSON; **unparseable input exits 0** (`:29-30`) — the guard never interferes
   with something it did not understand.
2. Scope: the command text must mention `CROSS-REVIEW`, `CODE_REVIEW` or `ADVISORY` (`:35-36`) **and**
   match a removal form — `rm`/`unlink` at a command boundary, or `git rm` (`:37-38`).
3. Extract the protected path tokens, take the directories they live in (`:42-50`), and block the call
   when a directory holds no `LEARNINGS-*.md` (`:53-57`).
4. **Exit 2 blocks the call and feeds stderr back to the agent** (`:6`); exit 0 allows. The refusal
   prefix and bracketed directory are byte-exact because `orchestrate-dev.js` reads them.

Two properties of that procedure are the ones the engine must preserve, and neither is a spelling:
the guard is **conditional** on `LEARNINGS-*.md` (BR-GUARD-2 — harvest must still be able to delete),
and the refusal is **visible to the agent**, so it can proceed differently instead of continuing while
believing the deletion happened.

**The script itself is the guard's definition and is not rewritten** (NG-1). Both transports invoke
the shipped script and consume its exit code; a JavaScript reimplementation would be a second
definition that could drift, and "exists on the branch" would then mean two things.

### 6.2 Mechanism per transport (C-5, BR-GUARD-1)

| | Primary (`agent-sdk`) | Fallback (`claude -p`) |
|---|---|---|
| carrier | `hooks: { PreToolUse: [{ matcher: "Bash", hooks: [cb] }] }` on the `query` options (`sdk.d.ts:1545`, event name `:816`) | a per-dispatch `--settings` JSON file registering the same hook |
| callback | runs the shipped `.sh` with the tool-input JSON on stdin, maps exit 2 → deny with the script's stderr as the reason | the CLI runs the script itself; the deny path is the CLI's own |
| lifetime | the dispatch's options object — created per dispatch, never process-global | a temp file per dispatch, removed after |
| source of truth | `{pluginRoot}/hooks/scripts/guard-harvest-before-delete.sh` | the same path |

The configuration is built once, by the engine, and handed to whichever transport `resolveTransport`
chose — so the invariant is one object and the carriers are two adapters over it (R-ARCH-2: policy
above, plumbing below).

### 6.3 The provenance assertion (BR-GUARD-3)

The test that matters runs **with no pdlc hooks registered on the host** and asserts the refusal
still happens. A green test on a developer machine where the plugin's hooks are live proves nothing
about the engine — it proves the host. Mechanically the test writes `CLAUDE_PROJECT_DIR` and
`HOME`/settings into a scratch tree containing neither `.claude/settings.json` hook entries nor an
installed plugin registration.

**The execution mechanism, stated.** §7.1 forbids constructing the real SDK client or spawning a
`claude` child, and FSPEC §18.2 (AT-ENG-X3) confirms the fallback is fixture-only, so nothing here
issues a real tool call. What executes is the **deletion the guard is guarding**, driven by the test:

1. The test builds the engine's guard configuration exactly as §6.2's carrier does, extracting the
   `PreToolUse` callback (primary) or the `--settings` file's registration (fallback).
2. It invokes that callback with a synthetic tool-input JSON naming an `rm` of a `CROSS-REVIEW-*`
   file in the scratch tree — the same JSON shape the SDK passes (`sdk.d.ts:1545`).
3. **It then performs the deletion the callback's verdict permits**: on `deny`, nothing; on `allow`,
   the actual `fs.rm`. This is the step v1.0 omitted, and without it clause (b) is unfalsifiable —
   the file survives because nobody ever tried to delete it.

Each clause therefore has a falsifying counterpart, asserted in the same file, and the negative half
is written first (§7.3's AT-ENG-45 discipline):

| Clause | Positive assertion | Falsifying counterpart |
|---|---|---|
| (a) the deny | callback returns deny for `rm` of a `CROSS-REVIEW-*` with no `LEARNINGS-{f}.md` in the directory (AC-5.1) | with `LEARNINGS-{f}.md` present the same call **allows** (AC-5.2), so the guard is conditional and not a blanket refusal |
| (b) the file survives | after step 3, the file is on disk | the **same fixture with the same deletion step** under an allow verdict **removes** the file — proving the harness can delete, so survival is the guard's doing |
| (c) the agent sees the refusal | the deny's reason carries the script's stderr, byte-exact prefix and bracketed directory (§6.1 step 4) | a deliberately mis-built configuration (matcher `"Write"` instead of `"Bash"`, or the hook path pointed at a nonexistent script) produces **no deny**, and the test asserts it fails — proving the assertion is reading the engine's wiring and not a constant |

Clause (c) asserts the callback's return value, which is what the SDK feeds back to the agent; that
the SDK *does* feed it back is the SDK's contract, and the only thing that can check it on a real
run is §6.5's live measurement. That boundary is stated rather than papered over: the hermetic suite
proves the engine builds and honours the guard; the live test proves the runtime consults it.

Both directions are asserted per transport, the fallback over its recorded fixture (AC-5.1, AC-5.2).

### 6.4 Fail-closed refusal when the guard cannot be carried (EC-GUARD-4)

If the guard configuration cannot be applied on the transport a run would use, **the engine refuses to
dispatch rather than dispatching unguarded**. Because this feature ships no runtime transport selector,
a refusal on the primary transport is a refusal of the whole engine, and the message must satisfy
three obligations, asserted as three separate expectations (AT-ENG-43): it names the missing
capability, names the fallback transport as the known alternative, and states that selecting it is not
yet available. That is a state an operator can act on — measure or defer — rather than a dead end.

The check is a startup-time capability probe, not a per-dispatch surprise: it belongs to the ladder's
rung 5 neighbourhood, so a run that cannot be guarded never gets as far as touching the repo.

### 6.5 The measurement O-2 owes first (BR-GUARD-5, M-ENG-06)

`DEFAULT_PERMISSION_MODE = "bypassPermissions"` (`transport.mjs:89`) is the production posture, set
explicitly and paired with `allowDangerouslySkipPermissions` (`:170-174`). **Whether a PreToolUse deny
fires at all under that posture is unmeasured on either transport.** This is the single largest open
safety gap and the first thing implementation must measure, because a guard the bypass setting
disables would pass every well-formedness test in §6.3 and protect nothing — the tests would be
green and vacuous, which is precisely the failure mode this repo has already paid for once.

The measurement is a live, opt-in test (§7.5) dispatching a real deletion attempt under the
production posture. Its result determines the design, and the branches are pre-committed so that a
red measurement does not become a design debate:

| Measured | Consequence |
|---|---|
| deny fires under `bypassPermissions` | §6.2 stands as written |
| deny does not fire | the posture and the guard are **one decision, not two**: either the posture tightens (drop the bypass, enumerate `allowedTools`) or the guard moves to a mechanism the posture cannot disable (the SDK's `canUseTool` callback, which is consulted on the tool-use path rather than registered as a hook) |

**The measurement leaves a durable record, and the hermetic suite reads it.** A live-only test
records nothing: on a fresh clone `bypassPermissions` (`transport.mjs:89`) and a hook-based guard
coexist with no artefact saying whether that combination was ever measured, on which platform, or
against which SDK version — and C-9 makes per-platform measurement a constraint. So the live test's
last act is to append a dated row to `docs/_constraints/pdlc-engine-baseline.md`, in the same
`M-ENG-*` form this repo already uses (`DEFAULT_PERMISSION_MODE`'s own comment at
`transport.mjs:70-89` is the precedent for recording a measured runtime fact beside the code):

**M-ENG-09 — PreToolUse deny under `bypassPermissions`**, columns
`date | platform | transport | sdkVersion | denyFired`.

Two assertions in the **hermetic** suite make the record load-bearing rather than decorative:

- **The shipped mechanism matches the recorded verdict.** If a row records `denyFired: no` for the
  current platform, a hermetic test fails while §6.2's hook carrier is still the shipped mechanism —
  the red gate that forces the §6.5 branch to be taken rather than noted.
- **Unrecorded is red, not silent** (PM Q-03, TE Q-05). With no M-ENG-09 row for the running
  platform, the hermetic suite **fails** with a catalogue-registered message naming the missing
  measurement. This is deliberate: an absent measurement is exactly the state in which the guard's
  well-formedness tests are green and prove nothing, so it must not be the state a clean CI run
  reports. The failure names the opt-in command that produces the row. **Ordering matters for the
  PLAN**: the gate and the first M-ENG-09 rows (one per CI platform) land in the *same* task, so CI
  never observes an unrecorded state; introducing the gate first would leave the pipeline red for a
  reason unrelated to the change that turned it red.

Until that measurement exists, §6's tests are the *shape* of the answer, not the answer, and an
engine run can delete review history the plugin path would have protected. **A plan schedules this
before any unattended use** (BR-GUARD-4).

Note the guard's own denial-blindness interacts here. `adapter.mjs:320-341` already logs and tallies
permission denials precisely because a dispatch whose tool calls were denied still terminates as a
success with prose claiming the work was done — the agent is not told. A guard deny that the agent
cannot see would reproduce that failure exactly, which is why "the agent sees the refusal" is an
asserted property in §6.3 and not an implementation detail.

## 7. Test Strategy

The suite is `node --test` under `pdlc/engine/`, no test framework beyond the runtime's. Everything
below is a mechanism, not an aspiration: each subsection names the seam that makes the property
assertable.

### 7.0 How the suite is invoked (the decision §§3.5, 5.1, 7.1, 7.4 all depend on)

`node --test` runs **each test file in its own child process** (measured on this repo's node
v20.20.1: a file writing to a shared module-scoped `Set` prints size 1 from one pid, a second file
importing the same module prints size 0 from another), and gives **no ordering guarantee across
files**. v1.0's "a module-scoped accumulator read by a test file that runs last by name ordering"
is therefore not a mechanism at all, and its failure mode is asymmetric and dangerous: the outcome
harness's forward direction (`observed ⊆ OUTCOMES`) would pass **vacuously green over the empty
set** — precisely the failure §5.1 exists to prevent — while the catalogue's set-equality would fail
permanently. So the invocation is fixed here, once:

```json
"scripts": {
  "test": "node --test --import=./__tests__/_bootstrap.mjs __tests__/ && node __tests__/_assert-suite-wide.mjs"
}
```

Three parts, each doing one job:

| Part | Job | Why it must be this |
|---|---|---|
| `--import=./__tests__/_bootstrap.mjs` | preloads into **every** test-file process: §7.1's construction guard and socket trap, and the observation writer below | a bootstrap that is merely `import`ed by some test files is installed only in those files' processes; `--import` is the only thing that makes "a new test file inherits it without opting in" true |
| observation directory | each process appends its observations as JSON lines to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, created by the bootstrap; the run dir is keyed by `PDLC_TEST_RUN_ID` (set by the bootstrap on first use, inherited by every child) | append-only per-pid files need no locking and survive concurrent processes, unlike a shared file or a socket |
| `&& node __tests__/_assert-suite-wide.mjs` | reads the union of every `.jsonl` and makes §7.4's assertions | a *step*, not a test file, so it is ordered by the shell rather than by filename luck, and it runs once per suite by construction |

`--test-concurrency=1` plus a single-process entry file was the alternative considered; it was
rejected because it serialises the suite for a property that does not need serialisation, and
because it leaves the ordering assumption in place rather than removing it.

**The final step's own emptiness is a failure.** If the observation directory is missing or holds no
records, `_assert-suite-wide.mjs` exits non-zero naming that, rather than asserting over an empty
union — the one guard that stops the whole mechanism from degrading back into the vacuous green it
was introduced to prevent. A self-test asserts exactly that: run the step against an empty scratch
run dir, expect failure.

### 7.1 Hermeticity, observed rather than asserted (AC-6.1, BR-VER-1)

Three layers, in increasing order of paranoia:

1. **Seam construction.** Every test builds a transport through `createTransport({ queryFn })`
   (`transport.mjs:135`); the SDK's own `query` is reached only by `defaultQueryFn` (`:17`), which
   imports the SDK lazily. A test that omits `queryFn` gets the real client.
2. **Construction guard.** A guard fails the run on any attempt to construct the real transport — the
   SDK client *or* a `claude` child spawn. It is installed by `__tests__/_bootstrap.mjs`, preloaded
   into every test-file process by `--import` (§7.0), which is what makes "a new test file inherits
   it without opting in" true rather than aspirational.
3. **Socket trap.** The same preloaded bootstrap patches `net.Socket.prototype.connect` (and the
   `tls` path) to fail the suite on any outbound connection attempt.

Layers 2 and 3 exist **per process**, not suite-wide, and that is the correct scope: each is a trap
in the process that could violate hermeticity. What must be suite-wide is only the *observation* of
§7.4's set properties, which §7.0 handles separately.

**The trap is itself tested**: one test deliberately attempts a connection and expects to trip it
(AT-ENG-63). A trap that never fires is indistinguishable from one that was never installed — the
same vacuity argument as §3.5's catalogue and §5.1's classifier, and the reason none of these three
properties is left to a comment.

`--dry-run-skill` (`bin/pdlc.mjs:171-172`) composes a prompt without dispatching, so the whole prompt
corpus is reachable hermetically, and the CLI's own surface is testable without a transport at all.

### 7.2 Fixtures per transport (AC-6.3, BR-VER-2)

One fixture set per transport, recorded from that transport's real output: SDK message streams
(`system/init` with `apiKeySource`, `rate_limit_event`, terminal `result`) and `claude -p`
stream-json lines. The SPIKE (`docs/pdlc-headless-engine/SPIKE-agent-sdk-auth.md`) is the first such
recording. Refreshing a set against a newer SDK or CLI is a documented, repeatable step —
a `__tests__/fixtures/README.md` naming the command and the redaction rules — rather than a rewrite,
because the fixtures are the only thing standing between a transport upgrade and a silent contract
change.

Fixtures are redacted of account identifiers at recording time; no fixture may contain a credential.
**The scanner that checks this is paired with a positive control in the same test**, because an
absence-only scan passes identically whether its pattern is right, wrong or empty. Both halves:

| Half | Assertion |
|---|---|
| negative | the scan over `__tests__/fixtures/` finds no match |
| positive | the **same scanner**, run over a scratch file the test writes containing one deliberately key-shaped string, **must** flag it — asserted in the same test, so a broken pattern fails here instead of passing silently over the fixtures |

The pattern is named in the spec rather than left to the implementation: `sk-ant-` followed by ≥20
characters of `[A-Za-z0-9_-]`, plus any assignment of `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`
to a non-empty value. The redaction rules `fixtures/README.md` documents are the same list, and the
positive control carries one instance of each rule, so "the README's rules" and "the scanner's
pattern" are asserted equal rather than assumed to be.

### 7.3 The parity oracle and its write-replaying double (AC-1.1, BR-PARITY-3/4/5)

The oracle asserts that an engine run produces the same artifacts a Claude Code run does. Its
correctness depends entirely on the double:

- **A double that only returns a response string leaves `docs/{f}/` empty**, and every structural
  clause passes on nothing. So the double **replays each dispatch's file writes from its fixture** —
  for a reviewer dispatch, creating the cross-review file the prompt names, with the fixture's
  `VERDICT:` line and counts — reproducing the creation events a real agent would have produced.
- **A fixture is bound to a dispatch by `(skill, phase label, round index)`, never by skill alone**
  (TE Q-03). Keying on skill would make a round-2 reviewer dispatch replay round 1's writes, so the
  double would overwrite `CROSS-REVIEW-{role}-{doc}-v1.md` instead of creating `-v2.md` — breaking
  the append-only property `deriveRoundWindow` (`orchestrate-dev.js:2151`) reads from the directory
  listing, *inside the oracle meant to prove parity*. The double derives the round index the same
  way the module does, from the directory listing, and a test asserts that two successive reviewer
  dispatches for one document produce two files rather than one rewritten one.
- **The double must *not* write the approval anchors.** `APPROVAL-HASH:` / `REVIEWED-COMMIT:` are the
  module's own write (`orchestrate-dev.js:6190`, through `_appendFile`, after its own pre-count
  check). A double that wrote them would make the anchor clause assert the fixture's bytes instead of
  the module's append logic — the exact vacuity BR-PARITY-5 exists to prevent.
- **The oracle observes creation events, not the surviving tree** (BR-PARITY-4): Phase H deletes
  harvested `CROSS-REVIEW-*` / `CODE_REVIEW-*` files once the LEARNINGS commit is confirmed, so a
  harvested file's later absence is not a failure. The double records a creation log and the clauses
  read that log.
- **The negative half is asserted first** (AT-ENG-45): a write-less double must *fail* this test.
  Without that, a later refactor could silence the oracle and the suite would stay green.

### 7.4 Set-equality harnesses

Four properties share one shape — accumulate through a seam across the whole suite, assert once at
the end — because per-test assertions go vacuous the moment a test is skipped:

| Property | Seam (writes a record per observation) | Assertion in `_assert-suite-wide.mjs` |
|---|---|---|
| message catalogue (§3.5) | `message(id, …)` records the id | emitted ids ≡ `messageIds()` |
| outcome taxonomy (§5.1) | `classifyOutcome` records its result | observed ⊆ `OUTCOMES`, and provocation fixtures ⊇ `OUTCOMES` |
| **pinned model map (§4.1, AC-3.3)** | the adapter records each `DispatchDescriptor`'s `{ skill, label, model }` | the observed `(phase, model)` pairs ≡ **M-ENG-07's seven rows, in both directions** |
| dispatchable skills (§3.3) | not an accumulator — computed once from imported data | both directions, §3.3's table |

**The model-map row is new in v1.1** and closes AC-3.3, which v1.0 left owned by verbatim
pass-through alone. `adapter.mjs:271` forwarding `model` untouched is necessary and correctly
designed, but it proves neither direction: a phase that silently stopped pinning a model would pass
a pass-through test, and a model reaching a phase no row names would too. AC-3.3 asks for
set-equality over the recorded corpus and M-ENG-07's map in *both* directions, including that no
provocation reaches an unnamed model such as `haiku`, so it needs an accumulator of its own. The
forward direction catches a new model; the reverse catches a phase that stopped pinning — the
failure that motivated the criterion.

Its corpus is M-ENG-07's own: the union of **five run configurations** (dev healthy path, queue,
advisory seam, advisory fallback, and the two `haiku` recovery paths), because no single run
exercises every row. A descriptor is recorded when a dispatch is *composed*, whether or not a model
call is executed, so all five are reachable hermetically through `--dry-run-skill` (§7.1) and
fixture-driven runs, and no row depends on billed traffic. M-ENG-07's table stays a **transcription**
of the modules' constants, never an import from them — importing it would make the drift AC-3.3
exists to catch invisible.

The first three write through §7.0's observation seam, so the union is genuinely suite-wide across
processes. The accumulator is per process by construction and never reset per test — resetting per
test is how these degrade into the per-test assertions they replace. Each property's assertion also
fails on an empty observation set (§7.0), so "no test exercised this" is a red result, not a green
one.

### 7.5 The opt-in live path (AC-6.2, BR-VER-3)

Behind an explicit flag (never the default suite, never CI), one real small feature runs end-to-end
against a scratch repo, asserting §7.3's structural set plus the one thing only a live run shows: at
least one cross-review round reaching a parseable terminal verdict produced by a real model call. The
§6.5 guard measurement is the second live test, and it is the one that gates unattended use.

### 7.6 CI arrangement

`.github/workflows/pr-tests.yml` currently runs four jobs — `unit-tests` (`:27`; matrix
ubuntu/macos, node 20, `working-directory: pdlc/workflows`), `artifact-freshness` (`:77`),
`fresh-clone-bootstrap` (`:103`) and `script-syntax` (`:161`) — and **none of them runs
`pdlc/engine/`'s tests**. A fifth job is therefore part of this feature, not a
follow-up:

```yaml
engine-tests:
  strategy: { matrix: { os: [ubuntu-latest, macos-latest] } }   # same matrix as unit-tests
  # working-directory: pdlc/engine ; npm ci ; npm test
```

The job body is `npm test` and nothing else, which is what makes §7.0's invocation load-bearing
rather than a developer convention: the `--import` bootstrap flag and the suite-wide assertion step
are inside the `test` script, so CI inherits both. A job that spelled out `node --test __tests__/`
directly would run without the hermeticity bootstrap and without the set-equality step, and would be
green for a strictly weaker property than the local suite — the drift is prevented by there being
one spelling, in `package.json`.

Matching the existing matrix is deliberate: the engine spawns processes and reads `~/.claude.json`,
both of which differ across the maintainer's macOS and CI's Linux, and this repo already pays for
that difference in its bash-3.2/bash-5 constraint. The job runs the hermetic suite only; nothing in
CI dispatches a model call or reads a credential.

### 7.7 AC-1.2's filesystem observation (the instrument, not a proxy)

AC-1.2 (`REQ:355-376`) is the one criterion whose oracle is an **instrument**: the run must be
observed at the filesystem level *for its whole duration*, and three clauses must hold on that same
observed run — at least one read of `{pluginRoot}/skills/{skill}/SKILL.md`, at least one read of
`docs/{f}/REQ-{f}.md`, and an **empty** set of paths opened under the consumer's `.claude/workflows/`.
v1.0 mapped this to `WORKFLOW_MODULE_URLS` (`run.mjs:52`), which resolves module specifiers and
observes nothing; no section designed the observation at all. This section does.

**The instrument is an in-process `fs` recorder installed by the test, not a platform tracer.**
`strace`/`dtrace` were considered and rejected: they need elevated privileges on macOS, differ per
platform (against C-9's grain rather than with it), and cannot run in the hermetic suite. Instead:

| Element | Design |
|---|---|
| what records | a wrapper over `node:fs`'s read entry points (`readFileSync`, `promises.readFile`, `createReadStream`, `openSync`, `promises.open`) installed by `__tests__/_bootstrap.mjs` (§7.0) and enabled only for the AC-1.2 test |
| scope | **the whole run**, from before `runLadder` to after the report is stamped — installed by the bootstrap, so it is live during the dynamic `import()` of the modules too, which is the window the `.claude/workflows/` clause is really about |
| coverage of both readers | the engine reads through `node:fs` directly, and the modules read through their **own Node defaults** (`defaultReadFile`, `orchestrate-dev.js:8492`) which are also `node:fs` — so one wrapper observes both, and §2.5's decision not to override the modules' IO seams is what makes that true. An injected `_readFile` recorder would have observed the modules only |
| what is recorded | every resolved absolute path, in order, with the call that opened it |

The three clauses are then assertions over one recording, and the two positive clauses are what make
the negative one falsifiable:

1. `∃` a recorded path matching `{pluginRoot}/skills/{skill}/SKILL.md` for the dispatched skill.
2. `∃` a recorded path equal to `docs/{f}/REQ-{f}.md` under the consumer root.
3. `∄` a recorded path under `{consumerRoot}/.claude/workflows/`.

**Clause 3 is absence-shaped and is never asserted alone.** It is asserted only in a test where 1
and 2 pass on the *same* recording — an instrument that recorded nothing satisfies clause 3
perfectly. Two further falsifying controls, in the same file: a case that deliberately reads a file
under `.claude/workflows/` inside the observation window **must** fail clause 3 (proving the matcher
sees that tree), and a case asserting the recording is non-empty (proving the wrapper is installed).

The consumer fixture is a scratch repo carrying a **populated** `.claude/workflows/` tree, not an
absent one; an empty directory would satisfy clause 3 for the wrong reason. This is what turns
AC-1.2 from "we found no read" into "we watched, and there was none" — and it is the reason the
posture the run is given (`distribution.checkEnabled`, `REQ:365-374`, consumed at
`orchestrate-queue.js:2068`, `:1071-1072`) is part of the fixture and named in §8.1's row.

## 8. Traceability

### 8.1 Acceptance criteria → design section → owning component

Total over REQ v0.9's 26 acceptance criteria. "Owning component" names where the behaviour lives, not
every file it touches; a component in **bold** is new in this feature.

| AC | Subject | TSPEC § | Owning component |
|---|---|---|---|
| AC-1.1 | artifact parity with a Claude Code run | §3.1, §3.6, §7.3 | `lib/run.mjs`, `lib/report.mjs` (parity is a property of the seams, not a component) |
| AC-1.2 | the run observed at the filesystem level: two reads present, `.claude/workflows/` set empty | **§7.7**, §4.6 (the `distribution.checkEnabled` posture the fixture carries) | **`__tests__/_bootstrap.mjs`'s `fs` recorder** + the AC-1.2 test's three clauses |
| AC-1.3 | queue surface, both stop reasons named | §3.1 (`_runPipeline`), §4.5 (`loop.stopReason`), §4.6 (`queue.maxIterations`), §5.4 | `lib/run.mjs:273-282`, `bin/pdlc.mjs:303-313`, `lib/report.mjs` |
| AC-1.4 | halt recorded, exit `2` not `1` | §5.4 | `bin/pdlc.mjs:236-238` |
| AC-1.5 | not a fork: resolved specifier, no second module file | **§2.4** (both observables), §7.6 (the job that runs them) | `lib/run.mjs:52`, `:58`; `__tests__/run.test.js:48`, `:64` |
| AC-2.1 | startup banner, six ordered auth rows | §3.2, §4.3 | **`lib/auth.mjs`**, `lib/startup.mjs` |
| AC-2.2 | key present without opt-in ⇒ refusal | §3.2 (row 5), §5.4 | **`lib/auth.mjs`**, `bin/pdlc.mjs:88-93` |
| AC-2.3 | proxy env reaches every dispatch | §3.4 | `lib/transport.mjs:159` |
| AC-2.4 | logged-in session, key ignored | §3.2 (row 4), §4.5 | **`lib/auth.mjs`**, `lib/report.mjs` |
| AC-2.5 | dispatch cwd is the repo, per dispatch | §2.3, §4.1 | `lib/adapter.mjs:278`, `lib/run.mjs:155` |
| AC-3.1 | a dispatch composes for every skill in the set | §3.3 | `lib/skills.mjs:312` |
| AC-3.2 | no plugin installed ⇒ legible refusal | §3.3 (resolution), §4.3 rung 1 | `lib/skills.mjs:204-256` |
| AC-3.3 | pinned model map, set-equality both directions | §4.1, **§7.4** (the model-map harness) | modules' constants; `lib/adapter.mjs:271` passes through; the descriptor accumulator asserts against M-ENG-07 |
| AC-3.4 | permission posture is explicit | §6.2, §6.5 | `lib/transport.mjs:89`, `:170-174` |
| AC-3.5 | dispatchable ≡ readable, both directions | §3.3, §7.4 | **`DISPATCHABLE_SKILLS`** exports + `lib/startup.mjs` rung 4 |
| AC-4.1 | six-member outcome taxonomy | §4.2, §5.1 | **`lib/outcome.mjs`** |
| AC-4.2 | retry budget and timeout cap | §5.2 | `lib/adapter.mjs:285-318`, `computeRateLimitWaitMs :75` |
| AC-4.3 | exhausted retries surface legibly | §5.2, §5.3, §3.5 | `lib/adapter.mjs`, **`lib/catalogue.mjs`** |
| AC-4.4 | mid-run `auth-failure` is fatal, never retried | §5.1, §5.3 | **`lib/outcome.mjs`**, `lib/run.mjs:187/228` |
| AC-4.5 | report carries module fields + engine block | §3.6, §4.5 (row-by-row vs FSPEC §12.2), §4.6 | `lib/report.mjs:36`, `:70` |
| AC-5.1 | guard refuses with `LEARNINGS` absent, per transport | §6.2, §6.3 | engine-supplied hook config; shipped `.sh` |
| AC-5.2 | harvest's deletions succeed once it exists | §6.1, §6.3 | same |
| AC-6.1 | hermetic suite, observed | §7.0 (the `--import` that installs it), §7.1 | `__tests__/_bootstrap.mjs` (guard + socket trap), `package.json` `scripts.test` |
| AC-6.2 | opt-in live smoke | §7.5 | `__tests__/live/` |
| AC-6.3 | per-transport recorded fixtures | §7.2 | `__tests__/fixtures/` |
| AC-6.4 | closed message catalogue, both directions | §3.5, §7.0, §7.4 | **`lib/catalogue.mjs`**, `__tests__/_assert-suite-wide.mjs` |

### 8.2 Constraints → design section

| C | TSPEC § | C | TSPEC § |
|---|---|---|---|
| C-1a startup billing posture | §3.2, §4.3 | C-6 permissions explicit, non-interactive | §6.2, §6.5 |
| C-1b per-dispatch auth assertion | §3.4, §4.3 | C-7 model aliases forwarded, not re-mapped | §4.1 |
| C-2 environment passthrough | §3.4 | C-8 closed message catalogue | §3.5 |
| C-3 `cwd` is the consumer project | §2.3, §4.1 | C-9 every runtime fact measured, per platform | §6.5, §7.2, §7.6 |
| C-4 the modules are not forked | §2.4, §2.5, §3.3 | C-10 plugin version handshake | §4.3 rung 3 |
| C-5 guard parity | §6.2, §6.4 | | |

### 8.3 New and changed files

| File | State | Sections |
|---|---|---|
| **`lib/auth.mjs`** | new | §3.2, §4.3 |
| **`lib/outcome.mjs`** | new | §4.2, §5.1 |
| **`lib/catalogue.mjs`** | new | §3.5 |
| **`lib/transport-cli.mjs`** | new | §3.4 |
| `lib/transport.mjs` | extended (guard config, transport selection) | §3.4, §6.2 |
| `lib/adapter.mjs` | extended (retry machine, per-dispatch auth record) | §3.6, §5.2 |
| `lib/startup.mjs` | changed (structured rungs 0–5, derived skill set) | §4.3 |
| `lib/report.mjs` | changed (observed transport, `authSources`) | §3.6, §4.5 |
| `lib/run.mjs`, `bin/pdlc.mjs` | extended (exit mapping, `doctor` projection, flags, `resolveTunables`) | §4.3, §4.6, §5.4, §7.1 |
| **`__tests__/_bootstrap.mjs`** | new — hermeticity guard + socket trap + observation writer + `fs` recorder | §7.0, §7.1, §7.7 |
| **`__tests__/_assert-suite-wide.mjs`** | new — the four set-equality assertions | §7.0, §7.4 |
| `pdlc/engine/package.json` | changed — `scripts.test` gains `--import` and the assertion step | §7.0 |
| `pdlc/workflows/orchestrate-dev.js` | **exports added** (`DISPATCHABLE_SKILLS`, `ADVISORY_RUNG_SKILL`, the five `SKILL_*` constants) + bare skill literals replaced by those constants at their dispatch sites | §3.3 |
| `pdlc/workflows/orchestrate-queue.js` | **exports added** (`DISPATCHABLE_SKILLS`, `SKILL_TRIAGE`); imports `ADVISORY_RUNG_SKILL` (`:41`) | §3.3 |
| `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js` | **regenerated** — `stripModuleSyntax` inlines the whole module body, so the added constants change the bundle bytes even though no name is published | §3.3 |
| `pdlc/workflows/dist/distribution-manifest.json` | **regenerated** — sha1 and byte counts follow the bundles | §3.3 |
| `docs/_constraints/pdlc-engine-baseline.md` | one measurement added (**M-ENG-09**, PreToolUse deny under `bypassPermissions`) | §6.5 |
| `.github/workflows/pr-tests.yml` | one job added (`engine-tests`) | §7.6 |

No other file under `pdlc/workflows/` is modified (§2.4, §2.5).

**The three generated rows are a PLAN obligation, not a footnote.** `node pdlc/workflows/build-runtime.mjs`
must run in the **same task** that adds the module exports, and the regenerated `dist/` artifacts
must be in that task's owned-file set and its commit — `.github/workflows/pr-tests.yml:77`
(`artifact-freshness`) gates on `build-runtime.mjs --check` producing no diff, so a wave that commits
the source change without the rebuild leaves CI red at Phase PUB for a reason unrelated to the work.
`implementation.postWavePathspecs` naming `pdlc/workflows/dist/` is the mechanism this repo already
ships for exactly that.

## 9. Open Questions

### 9.1 Carried from FSPEC §13.2, with this document's disposition

| # | Question | Disposition here | Owner |
|---|---|---|---|
| O-1 | fallback `claude -p` flag surface; per-transport model-alias semantics | §3.4 fixes the *interface* both transports satisfy; the CLI's flag spellings are a PLAN task producing the §7.2 fixture set. **Not blocking**: the primary transport ships without it, and v1.1 removes the transport selector v1.0 had mistakenly designed here — `resolveTransport` returns a constant `kind` and `"cli"` is reachable only by direct unit construction, so making the fallback runtime-selectable remains wholly O-1's | PLAN |
| O-2 | guard-parity mechanism per transport, and first **whether a PreToolUse deny fires at all under `bypassPermissions`** | §6.5 pre-commits both branches so a red measurement is not a design debate, and v1.1 gives the measurement a **durable record** (M-ENG-09) the hermetic suite reads: an unrecorded measurement is a red suite, not a silent omission. **Blocking for unattended use**, and scheduled before it (BR-GUARD-4) | PLAN, first implementation wave |
| O-3 | where engine configuration lives (consumer config vs. engine-global with override) | still not decided, and now decidably so: **§4.6 fixes the set, the defaults and the single resolution point** (`resolveTunables`), and names all five of REQ §4.1's tunables including the two v1.0 never mentioned (`queue.maxIterations`, `dispatch.retryBackoff`). Only the *location* the resolver reads from is open, and no AC depends on it | deferred |
| O-4 | token viability and renewal runbook for cron contexts | out of scope for TSPEC — an operational runbook, not a mechanism. §3.2 row 1 is the only code contact | deferred |
| O-5 | dry-run surface shape | partly discharged: `--dry-run-skill` exists (`bin/pdlc.mjs:171-172`) and §7.1 makes it the hermetic prompt-corpus surface. Whether a whole-run `--dry-run` is added is a PLAN decision | PLAN |
| O-6 | session-reuse flag design | **the seam must not be painted shut** (R-4). §3.1 keeps `_sessionAgent` unwired, so fresh-per-dispatch stays today's semantics and a future flag has somewhere to attach | deferred, deliberately |
| O-7 | re-derive retry defaults from observed unattended load | §5.2's defaults are a starting point, not a measured floor; §4.4's pause records are the measurement instrument | deferred, instrumented |
| O-8 | plugin installed-location discovery | **discharged** — probed and shipped (`skills.mjs:204-256`), unchanged here | closed |
| O-9 | whether either transport can distinguish a logged-in session from a token credential from its own reported state | §3.2 and §3.4 are deliberately independent observations for exactly this reason. If the answer is no, §3.2's startup mapping is the whole answer and §3.4's per-dispatch check remains a policy assertion, not a discrimination | deferred |

### 9.2 Raised by this document

- **O-ENG-T1 — the CI job's cost and placement.** §7.6 adds a fifth job on the same two-platform
  matrix. Whether the engine suite runs on both platforms every PR, or ubuntu-only with macos on
  merge, is a maintainer decision about CI minutes that a plan can set either way. The technical
  requirement is only that **both platforms are exercised somewhere**, because C-9 makes per-platform
  measurement a constraint (`~/.claude.json` location, process spawning).
- **O-ENG-T2 — two concurrent engine runs in one repo.** §2.3 records the opposite of what v1.0
  wrote here: `withCwd` (`run.mjs:155`) **does** `process.chdir` for the run's duration, which is
  process-global and is exactly why one process hosts one pipeline at a time; `cwd` is *additionally*
  passed per dispatch (`adapter.mjs:278`) so the agent's own directory is pinned independently. So
  the in-process case is settled by exclusion, not by coherence — and the open question is the
  cross-process one: two runs against the same worktree share a git index and a branch. The engine does not currently
  detect this. The likely answer is an advisory lock file scoped to the repo, refusing the second run
  with a catalogue-registered message; it is not designed here because no acceptance criterion binds
  it and inventing a locking protocol without a stated requirement is how a lock becomes the thing
  that halts unattended runs.
- **O-ENG-T3 — supplement inlining and prompt size.** §3.3 decides that `se-implement` dispatches
  carry `SKILL.md` plus both language supplements. That is the smallest change that satisfies
  AC-3.5's 12-file count without an exemption list, but it sends both languages to every
  implementation dispatch. If measured prompt size becomes a problem, the alternative is a
  language-conditioned selection driven by the repo's own manifest — a decision that needs a
  measurement first, and one this TSPEC deliberately does not pre-empt.
- **O-ENG-T4 — the M-ENG-09 gate's platform granularity.** §6.5 makes an unrecorded guard
  measurement a red hermetic suite, keyed by platform. Whether "platform" means `process.platform`
  (two values, matching §7.6's matrix) or a finer key including the SDK version is a maintainer
  decision: a version-keyed row is more honest and goes stale on every SDK bump, which on an
  unattended pipeline means a red suite for a reason no code change caused. The design records the
  SDK version in the row either way; only the *staleness predicate* is open.

### 9.3 Errata raised against upstream documents

Emitted verbatim in this dispatch's final message, not folded into any document:

- `ERRATUM: FSPEC: BR-SKILL-3` — the two `se-implement` language supplements are named nowhere in
  `pdlc/workflows/*.js`; they are loaded by the agent per `pdlc/skills/se-implement/SKILL.md:3`.
- `ERRATUM: REQ: AC-3.5`'s 12-prompt-file count (10 `SKILL.md` + 2 supplements) is only reachable if
  the engine inlines a dispatched identifier's whole file set — §3.3's decision — because no module
  dispatch names a supplement.

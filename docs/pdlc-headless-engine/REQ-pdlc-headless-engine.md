---
feature: pdlc-headless-engine
# ready:false is deliberate: this feature is driven by direct `pdlc dev` /
# `orchestrate-dev` invocation, never by queue auto-pickup (SE v1 F-11).
ready: false
depends-on: []
---

# REQ — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | **REQ** — design discussion 2026-08-08 (this REQ is its record); `docs/_decisions/DECISIONS-plugin-distribution.md`; `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-01, DC-02); `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-01…07, A-ENG-01) |
| Downstream | FSPEC, TSPEC, PROPERTIES; successors `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md`, `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft — awaiting operator review | Claude | 0.9 | 2026-08-11 |

*Change note (0.9, 2026-08-11, Phase-F erratum round 5 — targeted edit):* one erratum, nothing
else changed. M-ENG-06 in `docs/_constraints/pdlc-engine-baseline.md` claimed every criterion
appears in *exactly one* row while AC-4.5 is deliberately split (green except its per-dispatch
auth clause; red for that clause); the fact now states at-least-one-row totality with clause-level
splits named, and §1.2a's echo of the old wording follows it. No AC text changed.

*Change note (0.8, 2026-08-11, Phase-F erratum round — targeted edit, no re-authoring):* nine
errata raised against this REQ while FSPEC was authored are absorbed, and nothing else changed.
**Statements corrected to HEAD:** AC-1.2(c) now attributes the empty `.claude/workflows/`
read-set per surface (the dev module opens nothing there on any posture; the config opt-out is
the queue surface's, AC-1.3); AC-3.5's both-directions equality is scoped to the
module-dispatchable subset (10 identifiers / 12 prompt files at HEAD), since the plugin also
delivers operator-invoked skills no module dispatches; AC-2.1 rows 2/4/5 name the inspectable
logged-in evidence (M-ENG-08) instead of an unobservable "settings state present", so row 5 is
fixturable without an operator credential. **Gaps closed:** AC-4.5 records which transport ran
per dispatch (NG-6, AC-5.1, AC-6.3 all bind per transport) and fixes where the operator reads the
report (the run's output stream; no engine-owned file in the consumer repo, NG-7); AC-1.3 and
§4.1 declare `queue.maxIterations` and make a bounded stop distinguishable from queue exhaustion;
the diagnostic startup-posture surface gains upstream authority in AC-2.1 (`pdlc doctor` reached
FSPEC through the command set alone). **In `docs/_constraints/pdlc-engine-baseline.md`:** M-ENG-06
declares itself total over the ACs and gains its missing AC-2.3 and AC-4.4 rows; M-ENG-08's
closing "never a refusal" is corrected — unreadable evidence with `ANTHROPIC_API_KEY` present is
AC-2.1 row 5, not row 6. Every citation in the changed text was verified at HEAD.
The earlier change notes are compressed to hold the size budget; no approved decision is reopened.

*Earlier change notes.* **0.7** (round 3): AC-1.1's closed filename set widened to run-dependent
members and its observation window fixed at creation time; AC-3.3's `haiku` row split by
provocation over a five-configuration corpus; §1.2a's table and the model map relocated to
`docs/_constraints/pdlc-engine-baseline.md` as M-ENG-06/07. **0.6** (round 2): three literal
oracles corrected to HEAD (AC-3.3's `MODEL_ADVISORY` row, AC-1.2(c), AC-2.1's ordered first-match
list); AC-4.2's `timeout` cap; measured facts relocated to the constraints file. **0.5** (round 1):
transport swap completed through the mechanism layer; C-1 split into startup and per-dispatch
parts; G-2's seam list marked non-exhaustive. **0.4**: the Phase-0 spike supersedes the
docs-derived §1.3 ruling — SDK primary, `claude -p` fallback, both behind the unchanged `_agent`
seam. **0.3**: skills are not packaged inside the engine; the plugin is their sole delivery
vehicle and the version handshake is a hard constraint (operator, 2026-08-08).

> **Scope in one line.** A standalone Node CLI (`pdlc dev`, `pdlc queue`) that executes the
> canonical workflow modules **unmodified** and dispatches every agent via **the Claude Agent
> SDK (headless `claude -p` as declared fallback)** under **subscription auth**, resolving each
> skill's `SKILL.md` from the
> locally installed pdlc plugin at dispatch time and inlining it — eliminating the per-project
> workflow copy (and therefore drift) by construction, not by detection, while the plugin
> remains the sole delivery vehicle for skill prompts.

## 1. Problem / Context

The pipeline's logic reaches consumers through a copy chain: `pdlc/workflows/*.js` →
`build-runtime.mjs` → `pdlc/workflows/dist/*.bundle.js` → `sync-workflows.sh` → each consumer
project's untracked `.claude/workflows/`. The final hop exists because the Claude Code
workflow runtime loads only from the project directory. Every failure mode this family of
REQs addresses is a property of that hop:

- **Silent staleness.** On 2026-08-08 the consumer `regime-ledger` ran engine bytes built at
  plugin 0.21.0 while the plugin was at 0.22.0 — versions that differ in review-gate
  semantics. Drift *detection* (the drift-state record, the SessionStart reporter, the queue
  drift gate) patches the symptom; the copy is the wound.
- **Session-cache staleness on top of file staleness.** The workflow launcher snapshots
  scripts at session start, so even a freshly synced copy is not what a live session runs.
- **Per-worktree gaps.** A self-created worktree has an empty `.claude/workflows/` while the
  drift tooling reports the main tree in sync (deferred as D-DIST-07, queue row 6).

### 1.1 Who has this problem

| ID | User story |
|---|---|
| US-01 | As the **operator** of pdlc across several consumer repos, I want one engine install to serve them all, so that upgrading pdlc does not mean re-syncing every project and hoping no session cached the old bytes. |
| US-02 | As the **operator running unattended queues**, I want the pipeline to run from a plain terminal or a cron slot without an interactive Claude Code session, and to bill against my subscription — never silently against pay-per-token API credit. |
| US-03 | As the **pdlc maintainer**, I want the tested workflow modules in this repo to be the only copy that exists, so that a bug I fix here is fixed everywhere without a build-and-distribute chain. |
| US-04 | As the **operator**, I want all model traffic to keep flowing through my local `headroom` proxy, so that the observability and context tooling I depend on is not bypassed by the new host. |

### 1.2 Why removal is cheap — three measured facts

Measured against this repo on 2026-08-08 and relocated verbatim in substance to
`docs/_constraints/pdlc-engine-baseline.md` (pm-author §5e), where each fact carries the
citation it was measured from (DC-02). Cited here by id, not re-carried:

1. **M-ENG-01 — the modules already run in plain Node**; the only capability they take from the
   workflow runtime is `agent()`.
2. **M-ENG-02 — the plugin coupling is one string**, not a dependency to remove. The plugin
   stays installed as the one place `SKILL.md` files live, for `/pdlc:*` sessions (C-10).
3. **M-ENG-03 — the rest of `runtime-adapter.js` is workaround**, re-expressing `fs`/`git`/`gh`
   through IO agents. Hosted in Node it is not ported; it is deleted.

### 1.2a State at HEAD — this is not a greenfield REQ

A partial engine is already committed on `feat-pdlc-headless-engine` (`pdlc/engine/`, landed
across `059750de`…`f6f8029a`), so for each AC below a test written today either starts red or
re-asserts green — the two demand different work (TE v1 F-07, SE v1 F-07). The per-AC red/green
table with its evidence citations is **M-ENG-06** in `docs/_constraints/pdlc-engine-baseline.md`,
relocated under pm-author §5e and cited by id; that fact declares itself **total over the criteria
below**; a criterion whose clauses differ in state is split across rows, each naming its clause
(AC-4.5's per-dispatch auth clause). Red at HEAD: AC-1.1, AC-2.1/2.2/2.4, AC-3.3, AC-3.5,
AC-4.5's per-dispatch auth clause, AC-5.1/5.2 and AC-6.2/6.3/6.4 — including the auth check
`startup.mjs` does not yet make, the hook/settings wiring absent from `pdlc/engine/lib/` (O-2),
and the per-dispatch auth source the adapter records once rather than per dispatch (TE v2 F-05).

### 1.3 Transport decision (superseded 2026-08-08 by Phase-0 spike)

The docs-derived ruling — that the Claude **Agent SDK is ruled out as the dispatch
transport** because Anthropic's authentication docs state the SDK must use
`ANTHROPIC_API_KEY` — is **superseded by empirical measurement**: the Phase-0 spike recorded
as **M-ENG-04** (`docs/_constraints/pdlc-engine-baseline.md`, from
`docs/pdlc-headless-engine/SPIKE-agent-sdk-auth.md`) observed the SDK completing a call under
subscription auth with `apiKeySource: "none"` and subscription-shaped rate limiting, with
`ANTHROPIC_API_KEY` absent from environment and settings.
**Architectural decision: the Agent SDK is the primary dispatch
transport; headless `claude -p` is the declared fallback, both behind the same unchanged
`_agent` seam** (G-2). `apiKeySource` is reported only from *inside* a dispatch (the
`system/init` message), so the auth obligation splits: a billing-free startup check over
environment and settings state (C-1a), and the `apiKeySource == "none"` assertion at each
dispatch (C-1b), both refusing absent an explicit opt-in flag.

**Policy-risk caveat, kept from the superseded ruling:** the docs' language and the spike's
observed behavior could diverge again — a future SDK release could start requiring a key, or
an org-level policy change could disable the subscription path the proxy currently permits;
M-ENG-04 records that the spike shows *that* subscription auth works, never *why*. The
`apiKeySource` assertion is the tripwire: any dispatch reporting a source other than `"none"`
fails closed rather than silently billing pay-per-token.

Headless `claude -p` is the declared fallback and accepts subscription auth (M-ENG-05). The
operator's subscription and headroom proxy (`http://127.0.0.1:8787`, ambient in the shell
environment) remain hard constraints (§4).

## 2. Goals

- **G-1 — No consumer-resident engine.** *(US-01, US-03)* The workflow logic executes from
  the engine's own install location, and the skill prompts it inlines are resolved from the
  machine-wide pdlc plugin install (G-5, C-10) — neither lives under, nor is synced into, a
  consumer project. Nothing under a consumer project is read, required, synced, or
  version-checked **in order to run the pipeline** — the consumer repo remains the home of the
  feature artifacts the pipeline reads and writes, and of its own `.claude/pdlc.config.json`.
  Updating the engine, or updating the plugin within the engine's compatible range, updates
  every project at once.
- **G-2 — Canonical modules, unmodified.** *(US-03)* `orchestrate-dev.js` and
  `orchestrate-queue.js` are imported as ES modules from this repo's tested sources and
  remain the single source of truth. The engine adds one new adapter that supplies whichever
  of the modules' existing injection seams each module's entry point declares; every other IO
  seam uses the modules' Node defaults untouched. **The seam set is not enumerated here and
  differs per module** — `orchestrate-queue.js`'s `main()` declares no `_parallel`,
  `_pipeline`, `_runCommand` or `_sessionAgent` parameter and delegates the dev pipeline
  through `_runPipeline` (`orchestrate-queue.js:1040`, called at `:1422` with no seams
  forwarded), so an engine that supplied only the dev seam set would reach the modules'
  throwing `agent()` stub (`orchestrate-dev.js:8458`). The exhaustive per-module seam
  contract is owned by TSPEC; the requirement here is only that it is complete enough for
  AC-1.1 and AC-1.3 to pass. Adding a seam is a change to the modules, in this repo, with
  tests — never a fork (C-4).
- **G-3 — Subscription-first dispatch.** *(US-02)* Every model call runs on the operator's
  Claude subscription through the configured transport, and the per-phase model each module
  already pins is forwarded to that transport verbatim, whatever its value (C-7) — the engine
  introduces no model policy of its own and knows no model names.
- **G-4 — Proxy passthrough as contract.** *(US-04)* `ANTHROPIC_BASE_URL`,
  `ANTHROPIC_CUSTOM_HEADERS` and headroom's own variables reach every dispatch — as the
  dispatch environment handed to the SDK on the primary path, as the inherited child
  environment on the `claude -p` fallback; the effective endpoint is reported at startup so a
  bypassed proxy is visible immediately rather than discovered from a missing trace hours later.
- **G-5 — Skills resolved from the installed plugin, inlined by the engine.** *(US-01)* All 17
  skill prompt files — 15 `SKILL.md` files plus the two `se-implement` language supplements —
  are **not** packaged inside the engine. The pdlc Claude Code plugin remains the single
  delivery vehicle for every `SKILL.md`, so `/pdlc:*` skills keep working standalone in
  interactive sessions; the engine locates the locally installed plugin at dispatch time,
  reads each skill's prompt file from it, and inlines that text into the composed dispatch
  prompt — the same composed prompt on either transport. No Skill tool and no `pdlc:` namespace
  reference appear in a composed prompt — the plugin is a resolved-from-disk source of prompt
  text, not an in-session capability the dispatched agent invokes. (Recorded alternative, not
  chosen: direct Skill-tool invocation — A-ENG-01 in `docs/_constraints/pdlc-engine-baseline.md`.)
- **G-6 — Pipeline semantics preserved.** *(US-03)* Phase graph, convergence behavior, round
  windows, verdict parsing, erratum routing, POSTMORTEM lifecycle, queue lifecycle, halt-row
  commits, Phase MERGE ladder — all unchanged, because the code that implements them is
  unchanged. All state stays artifact-derived in the consumer repo, so a killed run is
  resumed by re-invoking, exactly as today.
- **G-7 — Unattended endurance.** *(US-02)* `pdlc queue --loop` replaces `/loop` as the
  driver: one ready feature per iteration until none is ready. A dispatch that fails for a
  reason known to be transient (rate limit, overload, transport hiccup) is retried within a
  declared budget and the pauses are visible in the run report; only exhaustion of that
  budget becomes a pipeline-visible failure.

## 3. Non-Goals

- **NG-1** Changing any pipeline semantics, document grammar, completeness criterion,
  review bar, or queue lifecycle. This feature relocates the host, not the behavior.
- **NG-2** Packaging, publishing, version channels, or install UX — bound to
  `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md`. Within this REQ the engine
  is run from a checkout of this repo; that is sufficient to satisfy every AC below.
- **NG-3** Retiring the plugin, the sync/drift machinery, or the workflow-runtime bundles —
  bound to `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`, and only after the
  engine is proven in a consumer repo. Until then the existing plugin path keeps working,
  untouched, and this feature adds no new drift surface of its own (NG-7).
- **NG-4** `pdlc-cli.mjs` (the state-probe CLI) stays project-local and unchanged; the
  engine does not absorb it (design brief requirement 5; an earlier proposal to make it the
  execution engine is explicitly rejected).
- **NG-5** No interactive-session UX (watching phases inside a Claude Code session). A thin
  plugin front-door that shells out to the engine may come with `pdlc-plugin-retirement`.
- **NG-6** *(restated 0.5; the pre-0.4 wording "no Agent SDK usage, even optionally" is
  withdrawn — it rested on the docs-derived ruling §1.3 superseded)* No engine transport work
  beyond the Agent-SDK-primary / `claude -p`-fallback design decided in §1.3: no third
  transport, no model-routing logic, no transport auto-selection heuristic beyond the
  `apiKeySource` fail-closed check (C-1). **Both transports are in scope for this REQ's ACs**
  (TE v1 Q-01): an AC that binds a transport mechanism states the obligation for each, and AC-6.3
  requires a fixture set per transport.
- **NG-7** No new copy of anything into a consumer project. The engine ships no installer and
  writes no engine-owned file into a consumer repo. It neither repairs nor reports on
  `.claude/workflows/`, and reads nothing under it **on its own account** — the one permitted
  read is the module's own drift gate, whose disposition AC-1.2 fixes. A project's existing
  copy is otherwise irrelevant to an engine run.
- **NG-8** No change to the skill prompts themselves. Prompt text that assumes the workflow
  runtime's mechanics is *audited* (R-5) and its disposition recorded, but rewriting SKILL.md
  bodies is out of scope here — a needed rewrite becomes an obligation, not a silent edit.

## 4. Constraints

- **C-1 — Auth: subscription-first, fail-loud.** *(operator hard constraint)* The engine
  authenticates via the logged-in Claude Code state or `CLAUDE_CODE_OAUTH_TOKEN`, and must
  never *silently* fall back to `ANTHROPIC_API_KEY` billing. The obligation has two parts,
  because the SDK reports its auth source only from inside a dispatch (SE v1 F-02):
  - **C-1a — startup, billing-free.** Before any dispatch the engine decides from
    *inspectable* state only — the process environment and the Claude Code settings files —
    whether pay-per-token billing is possible: `ANTHROPIC_API_KEY` present with no
    subscription credential is a startup refusal naming the opt-in flag
    (`auth.allowApiKeyBilling`, §4.1). This check costs no tokens and issues no probe
    dispatch; the banner reports what it found (AC-2.1).
  - **C-1b — per-dispatch, fail-closed.** Every dispatch asserts the transport-reported auth
    source is in the allowed policy set — on the primary transport, `apiKeySource` from the
    SDK's `system/init` message is exactly `"none"`; on the `claude -p` fallback, its own
    reported source (O-1). Any other value aborts that dispatch before the model is billed,
    naming the reported source, absent the opt-in flag. A run may therefore pass C-1a and
    still stop at its first dispatch; that ordering is intended, not a gap.
- **C-2 — Environment passthrough is contractual.** *(operator hard constraint)* The
  environment the engine hands a dispatch is always the parent environment extended, never
  constructed from scratch: on the primary transport it is the dispatch environment passed to
  the SDK, on the fallback the inherited child environment. headroom's `ANTHROPIC_BASE_URL`
  (`http://127.0.0.1:8787`) and `ANTHROPIC_CUSTOM_HEADERS` are carried through unmodified on
  either path — the engine never sets, unsets, or rewrites either variable. The startup banner
  reports the effective base URL.
- **C-3 — `cwd` is the consumer project.** Every dispatch runs with the consumer repo as its
  working directory; all artifact paths remain consumer-relative exactly as today.
- **C-4 — The modules are not forked.** Any behavior the adapter cannot express through the
  existing seams is a change to the modules (tested, in this repo), never a patched copy.
- **C-5 — Guard parity.** The `guard-harvest-before-delete` invariant (no deletion of
  `CROSS-REVIEW-*` / `CODE_REVIEW-*` / `ADVISORY-*` without `LEARNINGS-{feature}.md`) must
  hold for engine-dispatched agents on **either** transport, enforced from the engine's own
  per-dispatch configuration — not left to plugin installation. The mechanism differs per
  transport and is O-2's to decide; the invariant does not.
- **C-6 — Non-interactive permissions are explicit.** The permission posture each dispatch
  carries (allowed tools, bypass level) comes from one named, reviewable engine setting on
  either transport, not an ad-hoc escalation scattered through call sites.
- **C-7 — Model aliases forwarded, not re-mapped.** Whatever model a module names for a
  dispatch passes to the transport untranslated. The engine holds no model table, no alias
  map, and no fallback list: **the transport in use owns alias resolution and owns rejection
  of an unknown alias** (SE v1 Q-01 — whether the SDK resolves bare aliases with the CLI's
  semantics is O-1's to measure, per transport, and the answer changes neither this
  constraint nor the engine). A module that gains a new model tier needs no engine change.
- **C-8 — Operator-visible strings are a closed catalogue** *(DC-01)*. Every banner line,
  refusal, warning, and failure message the engine emits is a registered catalogue entry
  asserted by id in the test harness (AC-6.4), and every value the engine parses out of a
  transport's output — SDK message stream or CLI stdout/stderr alike — is read by a **total**
  function with a defined outcome for malformed input. No ad-hoc regex over stderr, no string
  emitted outside the catalogue.
- **C-9 — Every runtime fact is measured, per platform** *(DC-02)*. The transport flag /
  message surface, auth-source detection, and output shape are recorded from the installed
  SDK and CLI with the command that measured them (O-1), never inferred from documentation;
  the supported platform set is stated and each claim is measured on each member.
- **C-10 — Plugin version handshake, hard constraint.** *(operator hard constraint,
  2026-08-08)* The engine declares a compatible pdlc-plugin version range **as data in one
  place a test can read** — the `pdlcPluginCompat` field of the engine package manifest (TE
  v1 Q-03; at HEAD `pdlc/engine/package.json` carries `"^0.22.0"`). At startup it
  locates the installed plugin (O-8) and reads its `.claude-plugin/plugin.json` version. A
  missing plugin install, or an installed version outside the declared range, is a fail-closed
  startup refusal — the engine dispatches nothing and exits non-zero with a message naming
  both the engine's declared range and the plugin version found (or "not found"), plus the
  remedy (install/upgrade/downgrade the plugin). Both the startup banner and every run report
  carry `engineVersion` and `pluginVersion` together, always as a pair. This makes the plugin a
  hard runtime dependency of the CLI — a change of premise from earlier drafts, which treated
  plugin absence as harmless — and reopens the skew axis R-6 carries.

### 4.1 Declared thresholds

Every threshold an acceptance criterion below relies on, with its default and its owner.
No AC may depend on a tunable that is not listed here.

| Name | Default | Owner | Used by |
|---|---|---|---|
| `dispatch.retryAttempts` | 3 retries after the first attempt | engine config | AC-4.1 |
| `dispatch.retryBackoff` | exponential from 30 s, capped at 15 min | engine config | AC-4.1 |
| `dispatch.timeoutMinutes` | 30 min per dispatch | engine config | AC-4.2 |
| `auth.allowApiKeyBilling` | `false` (flag-only opt-in, never a config file) | operator, per invocation | AC-2.2 |
| `queue.maxIterations` | unbounded — loop ends on queue exhaustion unless the operator sets a positive bound for that invocation | operator, per invocation | AC-1.3 |

The retry defaults are a starting point chosen to absorb a transient rate-limit window
without masking a persistent one, not a measured floor — re-derivation is owed by O-7.

## 5. Acceptance Criteria

Each criterion is stated so a test engineer can derive a failing test from it without asking a
question. `{f}` denotes a feature name throughout.

**Group 1 — pipeline parity** *(US-01, US-03; G-1, G-2, G-6)*

- **AC-1.1** *Who:* the operator. *Given* a consumer repo on `feat-{f}` holding
  `docs/{f}/REQ-{f}.md`, with **no `.claude/workflows/` directory at all**, the engine's
  declared queue posture set — `distribution.checkEnabled: false` in the consumer's
  `.claude/pdlc.config.json` (AC-1.2, SE v2 Q-05) — and the pdlc
  plugin installed machine-wide at a version within the engine's declared compatible range
  (C-10), *when* they run `pdlc dev docs/{f}/REQ-{f}.md`, *then* the pipeline runs end-to-end
  through the phases enabled by that repo's config and satisfies each **structural** oracle
  below. The oracle is structural, not byte-equality, and needs no comparison run of the
  workflow-runtime path — two pipeline runs dispatch non-deterministic model calls, and AC-6.1
  forbids a live comparison arm in CI (TE v1 F-08). Every clause below observes the run's
  **creation events** — AC-1.2's filesystem observation is the method — not the tree surviving at
  exit: Phase H deletes each harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` file once the
  LEARNINGS commit is confirmed on remote, so clauses 1–3 assert over each file as created, and a
  harvested file's later absence is not an oracle failure (SE v3 F-20). Expected sets are
  transcribed here:
  1. the artifact **filenames** created under `docs/{f}/` satisfy two rules, because only part
     of the set is run-independent (TE v2 F-06): (i) **set-equality** against the phase-declared
     core — `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `LEARNINGS` (`REQ` pre-exists) — for the
     phases that repo's config enables; (ii) for each run-dependent member, a rule, not a fixed
     set (SE v3 F-17) — `DECISIONS-{f}.md` iff the run report records the Phase-T decision that
     warrants it; the `CROSS-REVIEW-{role}-{doc}[-v{N}].md` set equal to exactly one file per
     `(role, doc, round)` the run's own recorded round windows name; `CODE_REVIEW-{f}-v{N}.md`
     one file per DoD round the run report records, which is at least one whenever the run
     reaches that phase, since the DoD gate is on for every run and is not a consumer-config
     switch this AC's *Given* can disable; `POSTMORTEM-{phase}-{f}.md` iff the run report records
     a halt of that phase — clause 4 admits `halted`, so this member is reachable on a passing
     oracle; and `ADVISORY-{f}.md` iff the advisory tier is enabled, which the *Given* leaves at
     its shipped default of off. No filename outside (i) and (ii) may appear — the set is closed
     in both rules;
  2. every `CROSS-REVIEW-*` file carries a parseable `VERDICT:` line and a counts JSON object;
  3. approval anchors (`APPROVAL-HASH:`, `REVIEWED-COMMIT:`) are present on each cross-review
     that reached a terminal approval;
  4. the feature's `docs/_queue/QUEUE.md` row holds one of the lifecycle values the modules
     write (`in-progress`, `awaiting-merge`, `halted`), with its pathspec-scoped commit;
  5. the run report carries every field the modules already produce plus AC-4.5's engine fields.
- **AC-1.2** *Given* the same repo, *when* the run is observed at the filesystem level for its
  whole duration, *then* all three hold on that **same observed run** (TE v1 F-09): (a) at least
  one read of `{pluginRoot}/skills/{skill}/SKILL.md` is observed; (b) at least one read of the
  consumer's `docs/{f}/REQ-{f}.md` is observed; (c) the set of paths opened under the
  consumer's `.claude/workflows/` is **empty, with no exception** — under the posture AC-1.1's
  *Given* fixes, no path under that directory is opened at all. **The two run surfaces reach that
  empty read-set by different routes, and the `distribution.checkEnabled: false` posture is
  load-bearing for only one of them** (Phase-F erratum): the dev module opens no path under
  `.claude/workflows/` on any posture — its single occurrence of that string is a Phase-MERGE
  self-modification guard path, not a read (`orchestrate-dev.js:52`) — so AC-1.1's run satisfies
  (c) with or without the config opt-out, and the *Given* carries it for consistency with AC-1.3
  rather than as this clause's cause. On the queue surface (AC-1.3) the opt-out is what the clause
  rests on: the module's config-side opt-out is evaluated *before* any drift-state read and
  short-circuits it
  (`parseDistributionCheckEnabledOptOut`, `orchestrate-queue.js:2068`, called at `:1071-1072`;
  the drift-state read at `.claude/workflows/.pdlc-drift-state.json`, `:64`, lives only in the
  else-branch, `:1074`) — so the drift gate that G-2/C-4 forbid forking (SE v1 F-04) costs the
  engine no read under `.claude/workflows/` at all, rather than one permitted read. Without
  that opt-out the same run is **expected** to be blocked by the gate, and the drift-state read
  is then observable; that is a different posture, not this AC's. (`:1947`'s
  `record.checkEnabled === false` is `mapDriftState`'s row 2 — a field *of the drift-state
  record*, not the config-file opt-out this posture sets; SE F-13, TE F-04.)
  Reads of the consumer's own `docs/**` and `.claude/pdlc.config.json`, and reads inside
  the engine install or the installed plugin's `skills/` tree (G-5, C-10), are expected.
- **AC-1.3** *Given* a queue with a ready row and the AC-1.2 posture configured, *when* the
  operator runs `pdlc queue`, *then* exactly one feature is selected by the module's own
  Phase-0 triage — same row, same ordering, same blocked/halted handling as the
  workflow-runtime path — and `pdlc queue --loop` repeats that one feature at a time until it
  stops for one of exactly two declared reasons, then exits 0: **queue exhaustion** (no ready row
  remains) or **the iteration bound `queue.maxIterations` (§4.1) being reached with ready rows
  still present**. The two are distinguishable by the operator without inspecting the queue: the
  loop's own outcome line, and the run report (AC-4.5), name which of the two ended it (Phase-F
  erratum — an unbounded-only reading left a bounded stop indistinguishable from exhaustion).
- **AC-1.4** *Given* a pipeline that halts, *when* the run ends, *then* the halt is recorded
  exactly as the modules record it today — the POSTMORTEM file, the `halted` queue row and
  its pathspec-scoped commit — and the CLI's exit code distinguishes a halt from a crash of
  the engine itself.
- **AC-1.5** *Given* the engine's own repository, *when* its test suite runs, *then* two
  observable assertions hold, so "not a fork" is decidable without a reference copy to diff
  against (TE v1 F-12): (a) the module specifier the engine resolves for each workflow module is
  the repo-relative path under `pdlc/workflows/`; (b) no second file named `orchestrate-dev.js`
  or `orchestrate-queue.js` exists anywhere under the engine tree. A fork is then a test
  failure rather than a discovery (C-4).

**Group 2 — auth and environment** *(US-02, US-04; G-3, G-4; C-1, C-2)*

- **AC-2.1** *Given* any successful start, *when* the banner is printed, *then* it reports the
  engine version, the installed plugin version confirmed compatible by the handshake (C-10),
  the effective `ANTHROPIC_BASE_URL` (with headroom's ambient environment present,
  `http://127.0.0.1:8787`), and **the startup auth posture C-1a can read without billing** —
  named by catalogue id from this mapping, so a test transcribes the expected string
  from this table rather than from engine code (SE v1 F-03, TE v1 F-03). The rows are an **ordered
  first-match list**, not disjoint predicates — the first row whose condition holds decides,
  and row 6 makes the list total (SE v2 F-14, TE v2 F-03):

  | # | Inspectable startup state | Banner catalogue id |
  |---|---|---|
  | 1 | `CLAUDE_CODE_OAUTH_TOKEN` set in the environment | `auth.oauth-token` |
  | 2 | no `ANTHROPIC_API_KEY`, **logged-in evidence readable** (M-ENG-08) | `auth.session` |
  | 3 | `ANTHROPIC_API_KEY` present **and** `auth.allowApiKeyBilling` passed | `auth.api-key-optin` |
  | 4 | `ANTHROPIC_API_KEY` present, flag not passed, **logged-in evidence readable** (M-ENG-08) | `auth.session-key-ignored` — start proceeds, key unused; AC-2.4's state |
  | 5 | `ANTHROPIC_API_KEY` present, flag not passed, **no logged-in evidence readable** | refusal `auth.api-key-refused` (AC-2.2) — no banner |
  | 6 | none of the above (no credential the engine can see) | `auth.unknown` — start proceeds; C-1b decides at first dispatch |

  **"Logged-in evidence readable" is a named, fixturable observable, not a posture** (Phase-F
  erratum): it is the inspectable login record **M-ENG-08** measures — a named file carrying a
  named field, cited by id rather than re-carried here (DC-02) — so every row of this list can be
  fixtured by placing or withholding that record plus the environment variables, with no operator
  credential involved and none needed for row 5. Where M-ENG-08's evidence is unreadable (a
  platform it has not been measured on, or a host that is not logged in), the list still decides:
  with `ANTHROPIC_API_KEY` present the run refuses at row 5, and only with it absent does the run
  proceed at row 6 as `auth.unknown`.

  The **same startup posture is readable without starting a run**, through a diagnostic command
  that dispatches nothing and bills nothing — engine and plugin versions as a pair (C-10), the
  effective base URL, and the auth catalogue id this table names. That command is this REQ's, not
  an inheritance from the command set FSPEC enumerates (Phase-F erratum: `pdlc doctor` was an
  operator-visible surface with no upstream authority); its name and flags are FSPEC's to fix.

  The banner reports **no** SDK `apiKeySource` value, because none exists before a dispatch;
  the per-dispatch value is a C-1b/AC-2.4 observable and appears in the run report (AC-4.5). A
  transport-reported source outside the allowed policy set is not silently mapped: it aborts
  the dispatch naming the raw value (AC-4.4). Discriminating "logged-in session" from "OAuth
  token" *from the transport's own report*, if it is possible at all, is unmeasured — O-9.
- **AC-2.2** *Given* no subscription credential inspectable at startup and `ANTHROPIC_API_KEY`
  present, *when* the operator runs any engine command, *then* the engine **dispatches
  nothing** and exits non-zero naming the refusal (`auth.api-key-refused`) and the opt-in flag,
  reaching that decision from the environment and settings files alone — no probe dispatch,
  zero tokens billed (C-1a); *and given* the same state with the flag passed, the run proceeds
  and the banner carries `auth.api-key-optin`.
- **AC-2.3** *Given* a parent environment carrying `ANTHROPIC_BASE_URL` and
  `ANTHROPIC_CUSTOM_HEADERS`, *when* any dispatch is made, *then* the environment that dispatch
  receives contains both unmodified together with the rest of the parent environment — the
  dispatch options' environment on the primary transport, the child process environment on the
  `claude -p` fallback — asserted for **every** dispatch the engine makes, not only the first.
- **AC-2.4** *Given* an operator whose subscription auth is **logged-in Claude Code settings
  state with `CLAUDE_CODE_OAUTH_TOKEN` absent from the environment** — the state AC-2.1's
  first-match list resolves to row 4, since an OAuth token present would match row 1 and yield
  `auth.oauth-token` instead (TE v3 F-01) — and `ANTHROPIC_API_KEY` also present in the
  environment, *when* the run is made with `auth.allowApiKeyBilling` **not** passed, *then*
  the positive observable holds: the banner carries `auth.session-key-ignored` (AC-2.1 row 4),
  every dispatch reports `apiKeySource == "none"` **and**
  completes, and the run report records that value per dispatch (TE v2 F-02). The negative ("no
  key was needed") is thereby paired with a positive on the same path rather than asserted by
  absence.
- **AC-2.5** *Given* any dispatch, *when* it is made, *then* its working directory is the
  consumer repo root (C-3), so every artifact path the modules use resolves consumer-relative
  exactly as it does today.

**Group 3 — prompt composition, plugin handshake, and model forwarding** *(G-5; C-6, C-7,
C-10)*

- **AC-3.1** *Given* a dispatch for **each** member of the skill-identifier set AC-3.5 fixes
  (every member, not a sample), *when* the composed prompt is inspected via the dry-run
  surface, *then* it contains the full text of that prompt file
  resolved from the **locally installed pdlc plugin's** `skills/{skill}/SKILL.md` (or its
  `se-implement` language-supplement file), and contains **no instruction to invoke the Skill
  tool** and no `pdlc:` namespace reference — the plugin supplies the bytes at dispatch time,
  never a runtime Skill-tool call.
- **AC-3.2** *Given* a repo with no plugin installed, or one installed outside the engine's
  declared compatible version range, *when* the operator runs any engine command, *then* the
  engine **dispatches nothing** and exits non-zero with a message naming the engine's declared
  range, the plugin version found (or "not found"), and the remedy (C-10) — this replaces the
  earlier assumption that the engine has no plugin dependency to lose.
- **AC-3.3** *Given* the **dispatch corpus** and the **pinned model map** that
  `docs/_constraints/pdlc-engine-baseline.md` **M-ENG-07** fixes — seven map rows over a corpus
  of five named configurations, relocated there under pm-author §5e and cited by id, not
  re-carried — *when* the model each dispatch in the corpus carries is compared against that
  **literal** map, *then* the comparison is a **set-equality** in both directions: every
  dispatch descriptor's model value in the corpus appears in the map, and every map row is
  exercised by at least one descriptor in the corpus, so a phase that silently stops pinning a
  model fails (TE v1 F-04, SE v2 F-12). Two properties of the corpus make the second direction
  satisfiable, and both are M-ENG-07's to supply rather than this AC's (SE v3 F-18/F-19, TE v3
  F-02/F-03): each map row names the **configuration and the provocation** that reaches it — the
  advisory rows need the tier enabled and, for the fallback row, `fable` resolution forced to
  fail; the two `haiku` rows are distinct sites reached only by a malformed reviewer `VERDICT`
  trailer and by a PLAN task table the in-script parser rejects, so a healthy run reaches
  neither — and the corpus is defined over **recorded dispatch descriptors** (the model value a
  dispatch carries when composed), not over executed model calls, so the oracle needs no billed
  traffic and no live run (AC-6.1). The engine substitutes no default of its own for a model it
  does not recognise; the map is a **test fixture**, never an engine table (C-7).
- **AC-3.4** *Given* the permission posture passed to each dispatch, *when* the engine is
  inspected, *then* it comes from one named, reviewable setting applied uniformly, and no
  call site carries its own ad-hoc permission escalation (C-6).
- **AC-3.5** *Given* any engine start, *when* the startup checks run alongside the C-10
  handshake and **before** any dispatch, *then* the set of skill identifiers the modules can
  dispatch equals the set of prompt files the installed plugin holds **for those identifiers** —
  set-equality in both directions, not containment (TE v1 F-06): a dispatchable identifier with no
  readable file, and a prompt file for a dispatchable identifier that the engine cannot dispatch,
  both fail closed at startup with the differing identifiers named. A missing or renamed
  `SKILL.md` is therefore discovered before the run starts, not mid-run by the phase that needed
  it. **The equality is over the dispatchable subset, not over the plugin's whole `skills/`
  tree** (Phase-F erratum): the plugin also delivers skills only an operator invokes
  interactively, which no module dispatches, and a both-directions equality against every file
  present would fail on a correct install. Which identifiers are dispatchable is derived from the
  modules, never from a list the engine maintains alongside them; at HEAD the derived set is 10
  identifiers over 12 prompt files (10 `SKILL.md` + 2 `se-implement` language supplements), with 5
  further operator-invoked skills present in the plugin and outside the set. Those counts are an
  observation of HEAD, never the assertion.
**Group 4 — dispatch failure taxonomy and endurance** *(US-02; G-7; DC-01)*

- **AC-4.1** *Given* any dispatch outcome, *when* the engine classifies it, *then* it lands in
  **exactly one member of exactly this six-member catalogue** — `ok`, `retryable` (rate limit,
  overload, transport interruption), `timeout`, `auth-failure`, `transport-contract-violation`
  (output the engine cannot parse), `agent-reported-failure` (the dispatch ran and the agent
  reported failure, which is the modules' business, not the engine's). The catalogue is closed:
  the test asserts **set-equality** between the classifier's possible outputs and these six
  (TE v1 F-05), and adding a seventh member is a change to this AC, not a configuration. Every
  classification is a total function of the observed outcome: unrecognised output classifies as
  `transport-contract-violation`, never as success.
- **AC-4.2** *Given* a `retryable` outcome, *when* it occurs, *then* the dispatch is retried up
  to `dispatch.retryAttempts` with `dispatch.retryBackoff`; *given* a dispatch producing no
  output for `dispatch.timeoutMinutes`, it is classified `timeout` and retried at most once.
  **The `timeout` retry is drawn from the same `dispatch.retryAttempts` budget, and a timeout
  never resets it** (TE v1 F-10, SE v1 Q-04). At the default of 3, the total attempt counts are:

  | Observed sequence | Total attempts | Terminal classification |
  |---|---|---|
  | `retryable` × 3, then success | 4 | `ok` |
  | `retryable` × 4 | 4 | `retryable`, budget exhausted |
  | `timeout`, then success | 2 | `ok` |
  | `timeout`, `timeout` | 2 | `timeout`, terminal (second timeout is never retried) |
  | `retryable`, `timeout`, then success | 3 | `ok` |
  | `timeout`, `retryable`, `retryable` | 3 | non-terminal — one retry of the budget is still owed, so a fourth attempt follows |
  | `timeout`, `retryable`, `retryable`, `retryable` | 4 | `retryable`, budget exhausted |
  | `retryable`, `timeout`, `timeout` | 3 | `timeout`, terminal (the cap, not the budget, ends it) |

  The last row holds because the `timeout` cap is **per run of a dispatch, not per attempt
  position** (TE v2 Q-02): once a dispatch has been retried after one `timeout`, a second
  `timeout` anywhere in its remaining attempts is terminal even with budget left. Every
  observable sequence a test transcribes is a row; this clause explains the table rather than
  extending it (SE v3 F-21).
- **AC-4.3** *Given* retries were exhausted, *when* the run ends, *then* the failure surfaces
  through the modules' own failure path — the phase halts with its normal POSTMORTEM and
  halt-row semantics — and both halves are asserted (TE v1 F-14): *positively*, the halt artifacts
  exist (the POSTMORTEM file, the `halted` queue row, its pathspec-scoped commit), which is
  what proves the engine process stayed alive long enough to record the halt; *negatively*, the
  set of child processes the engine started is empty at exit and the engine itself did not
  crash. On the primary transport the negative half is over an empty set by construction (no
  child is spawned); on the `claude -p` fallback it is over the children it spawned.
- **AC-4.4** *Given* an `auth-failure` mid-run, *when* it occurs, *then* it is **not**
  retried silently: the run stops and the message names the auth source that failed, because
  a retry loop against a dead credential burns the wall clock a queue run depends on.
- **AC-4.5** *Given* a completed or halted run, *when* the run report is read, *then* it
  carries, in addition to every field the modules already produce: engine version, the startup
  auth catalogue id (AC-2.1), the transport-reported auth source observed per dispatch (C-1b;
  `apiKeySource` on the primary path), effective base URL, per-phase dispatch counts, and one
  row per retry and per pause (taxonomy member, phase, attempt number, delay). A run with zero
  retries carries an empty set of such rows, not a missing field.
  **Which transport ran is a recorded field, per dispatch** (Phase-F erratum): NG-6 keeps both
  transports in scope and C-5/AC-5.1 and AC-6.3 bind obligations *per transport*, so a report that
  does not name the transport a dispatch used leaves every per-transport obligation unattributable
  after the fact. The field's value is one member of a closed two-member set (primary, declared
  fallback), recorded from what the engine actually invoked, never from configuration intent; a
  run that used both carries both, per dispatch. For `pdlc queue --loop` the report also names
  which of AC-1.3's two stop reasons ended the loop.
  **Where the operator reads the report is part of this criterion** (Phase-F erratum): the report
  is delivered on the run's own operator-visible output stream, and the engine writes **no
  engine-owned file into the consumer repo** to deliver it (NG-7) — a report that could only be
  read from a file the engine dropped in the project would contradict that non-goal. Persisting a
  copy elsewhere, if it is wanted at all, is out of scope here; the stream is the surface every AC
  above may assume. Per-phase dispatch counts are
  **observable, not derivable** from this REQ for an arbitrary run (TE v1 Q-04): a test asserts
  their presence and internal consistency (counts sum to the recorded dispatch rows), and
  asserts exact values only for a fixture run whose dispatch sequence the fixture fixes.

**Group 5 — guard parity and safety** *(C-5)*

- **AC-5.1** *Given* an engine-dispatched agent in a repo where `LEARNINGS-{f}.md` does not
  exist, *when* it attempts to delete a `CROSS-REVIEW-*`, `CODE_REVIEW-*` or `ADVISORY-*`
  file, *then* the deletion is refused by the guard configuration the engine itself supplies
  with that dispatch (C-5), on **whichever transport the run uses** — asserted independently of
  the plugin's own hook wiring (the assertion runs with no pdlc hooks registered), so the guard
  is proven to travel with the engine's dispatch configuration rather than depend on whatever a
  plugin install happens to register. The mechanism per transport is O-2's; the refusal, and
  its independence from plugin hooks, is asserted for each transport the engine can use.
- **AC-5.2** *Given* the same repo once `LEARNINGS-{f}.md` exists, *when* harvest deletes
  those files, *then* the deletion succeeds — the guard is not a blanket ban.

**Group 6 — verification strategy** *(Team Principle 2)*

- **AC-6.1** *Given* the engine's test suite, *when* it runs in CI, *then* it exercises the
  adapter against the modules' existing test doubles with **no live model calls and no
  network**, and the hermeticity gate is an observable of the run, not a counterfactual (TE
  v1 F-13): every test constructs the transport through the injected seam, a guard fails the suite
  on any attempt to construct the real transport (SDK `query` or a `claude` child spawn), and
  the suite asserts that no outbound network connection was attempted.
- **AC-6.2** *Given* an explicit opt-in flag, *when* the live smoke path runs, *then* it drives
  one real, small feature end-to-end against a scratch repo and asserts **the same structural
  set as AC-1.1**, plus the one thing only a live run can show: at least one cross-review round
  reaching a parseable terminal verdict produced by a real model call (TE v1 Q-02). It is never
  part of the default suite.
- **AC-6.3** *Given* the recorded transport interface contracts (O-1), *when* a transport is
  tested, *then* it is tested against **recorded fixtures of that transport's real output** —
  one fixture set per transport (SDK message stream; `claude -p` headless output), since NG-6
  keeps both in scope — and a fixture refresh against a newer SDK or CLI version is a
  documented, repeatable step rather than a rewrite.
- **AC-6.4** *Given* C-8's closed catalogue, *when* the suite runs, *then* two checks exist
  (TE v1 F-11): (a) **set-equality** between the catalogue ids the engine can emit and the ids
  registered in the catalogue — an unregistered emitted string, and a registered id no path
  emits, both fail; (b) for every value the engine parses out of a transport's output, a
  defined outcome for malformed input is asserted by test, including an unrecognised
  `apiKeySource` (→ dispatch aborted per AC-4.4, never mapped to a banner id) and unparseable
  transport output (→ `transport-contract-violation` per AC-4.1).

## 6. Risks

- **R-1 — Transport output contract.** *(now primarily the SDK message schema, per §1.3)* The
  engine depends on the Agent SDK's message stream (`system/init`, `rate_limit_event`, terminal
  `result`) staying parseable, and on the `claude -p` fallback's headless output
  (`--output-format json` / stream) staying parseable when it is used; an SDK or CLI upgrade
  could shift either shape independently. Mitigation: one thin transport module owns invocation
  + parsing for both paths; a version/`apiKeySource` probe at startup; both transports covered
  by fixtures.
- **R-2 — Subscription limits under unattended load.** A cron'd loop can exhaust weekly Max
  limits invisibly. Mitigation: AC-4.1 pause/resume, run-report pause records, optional
  headroom stats surfaced in the report.
- **R-3 — Policy drift.** §1.3's auth facts are policy, not physics; Anthropic could change
  either side. The transport lives behind the `_agent` seam precisely so a future SDK (or
  API) transport is a swap, not a rewrite.
- **R-4 — Session semantics.** `_sessionAgent` maps naturally onto `claude -p --resume`,
  but resumed-session behavior under headless mode is less traveled; ship fresh-per-dispatch
  first (today's semantics), enable sessions behind a flag (AC deferred to that flag's
  work).
- **R-5 — Watchdog assumptions baked into prompts.** The pacing contract and IO-transport
  prose in the modules assume the runtime's 180 s watchdog and agent-mediated IO. They are
  harmless when hosted in Node (pacing remains good practice), but prompts that *instruct*
  runtime-specific mechanics (e.g., chunked SHA-256 file echo) must not be dispatched where
  the mechanic is obsolete — audit `runtime-adapter.js`-originated prompt text during
  design.
- **R-6 — Skills-vs-engine version skew.** Making the plugin a hard runtime dependency (C-10)
  reopens a skew axis this REQ had otherwise designed away: an engine version and a plugin
  version can drift independently on an operator's machine (engine upgraded via its own
  channel, plugin upgraded — or not — via its marketplace/install path), producing behavior
  that depends on *which pair* is running. Mitigation: the handshake (C-10) is the sole
  contract point — the engine never dispatches against an unverified pair, the compatible
  range is declared and checked, not assumed, and both versions are always reported together
  (banner, run report) so an operator debugging a surprising result can see the pair rather
  than infer it.

## 7. Obligations / Open Questions

- **O-1** *(partially discharged — SE v1 F-07)* The **primary** transport's message-stream shape
  (system/init, rate_limit_event, terminal result) is measured and in use:
  `SPIKE-agent-sdk-auth.md` §4b plus the shipped parse at `pdlc/engine/lib/transport.mjs:180-205`
  (`059750de`). Still open, before TSPEC: (a) the **fallback** `claude -p` flag surface (output
  format, model, settings/hook injection, `--resume`, permission flags) against the installed
  CLI version, with fixtures; (b) per-transport model-alias resolution semantics (C-7, SE
  Q-01); (c) both transports exercised behind the one `_agent` seam.
- **O-2** Decide the guard-parity mechanism per transport (C-5): for `claude -p`, per-dispatch
  `--settings` carrying the PreToolUse hook; for the SDK path, the equivalent hook/permission
  configuration the SDK accepts — **unmeasured, and no hook or settings wiring exists in
  `pdlc/engine/lib/` at HEAD**, so this is the largest open safety gap. Must be sourced from
  the engine's own dispatch configuration, not from whatever hooks the plugin install happens
  to register (AC-5.1); the plugin being present (C-10) is no longer the open case — hook
  *provenance* is.
- **O-3** Decide where engine config lives (reuse `.claude/pdlc.config.json` per consumer —
  likely, since `implementation.testCommand` etc. are consumer-specific — vs. engine-global
  defaults with per-project override).
- **O-4** Confirm `claude setup-token` viability on the operator's account for cron
  contexts (token lifetime, renewal story), and document the renewal runbook.
- **O-5** Decide dry-run surface (AC-3.1/3.2) shape: `--dry-run` printing composed
  dispatches is the current assumption.
- **O-6** Session-reuse flag design (R-4) — deferred, but the seam must not be painted shut.
- **O-7** Record the observed rate-limit behaviour under real unattended load and re-derive
  `dispatch.retryAttempts` / `dispatch.retryBackoff` (§4.1) from it before treating them as
  settled.
- **O-8** *(discharged — SE v1 F-07)* Plugin installed-location discovery is probed and shipped:
  candidate-root resolution with a deterministic precedence order plus `--plugin-root` /
  `PDLC_PLUGIN_ROOT` overrides (`pdlc/engine/lib/skills.mjs`, `resolvePluginRoot` `:204`), with
  the startup handshake in `startup.mjs` (`2ed13815`). TSPEC records the resolved precedence as
  the measured fact; nothing further is owed here.
- **O-9** *(new — SE v1 F-03)* Measure whether either transport can distinguish a
  logged-in Claude Code session from a `CLAUDE_CODE_OAUTH_TOKEN` credential *from its own
  reported auth state* (the spike measured exactly one value, `apiKeySource: "none"`, for the
  subscription case). If it cannot, AC-2.1's startup mapping — which reads the environment and
  settings, not the transport — stands as the whole answer, and TSPEC records the limitation
  rather than inventing a discriminator.

---
feature: pdlc-headless-engine
ready: false
depends-on: []
---

# REQ — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | **REQ** — design discussion 2026-08-08 (this REQ is its record); `docs/_decisions/DECISIONS-plugin-distribution.md`; `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-01, DC-02) |
| Downstream | FSPEC, TSPEC, PROPERTIES; successors `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md`, `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft — awaiting operator review | Claude | 0.5 | 2026-08-10 |

*Change note (0.5, 2026-08-10):* §1 records a **second measured staleness incident** — the
consumer `regime-ledger`'s `wheel-paper-portfolio` run, relayed by operator handoff 2026-08-10 —
as corroborating evidence for the same copy-hop failure §1 already describes. Evidence only: no
new goal, non-goal, constraint, requirement, acceptance criterion or obligation is added, and no
section is restructured.

*Change note (0.4, 2026-08-08):* Phase-0 spike (`SPIKE-agent-sdk-auth.md`) supersedes the
docs-derived §1.3 ruling — the Claude Agent SDK runs under subscription auth on the operator's
machine (`apiKeySource: "none"`), so the SDK becomes the primary dispatch transport with
headless `claude -p` as the declared fallback, both behind the unchanged `_agent` seam; C-1,
NG-6, O-1 and R-1 updated to match.

*Change note (0.3, 2026-08-08):* skills are no longer packaged inside the engine; the pdlc
plugin remains their sole delivery vehicle, the engine resolves and inlines `SKILL.md` from
the installed plugin at dispatch time, and a version-compatibility handshake against the
plugin is now a hard constraint (operator decision, 2026-08-08).

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

  *Second measured incident — 2026-08-10, operator handoff.* The same consumer completed a full
  end-to-end pipeline run for the feature `wheel-paper-portfolio` (~40 review rounds, 49
  implementation tasks, 3 DoD rounds, PR #261 green) while still executing engine bytes built at
  plugin **0.21.0** against an installed plugin at **0.22.x**. The cost was not an outage but a
  tax the operator paid across the whole run: the stale review-gate semantics nearly mis-gated a
  phase (averted by hand), four or more
  verdict trailers were repaired by hand, background waits and repository-index contention
  needed manual intervention, and tracked-copy ride-alongs from the sync chain landed in the
  feature PR's diff. Each of those pain points is already answered by the 0.22.x modules at HEAD
  — `"Approved with minor changes"` is a recognised verdict (`orchestrate-dev.js:4116-4118`),
  verdict-trailer recovery already exists (`recoverVerdict`, `:7494`), per-phase model routing is
  already module policy, and wave-mode implementation already produces script-owned,
  pathspec-scoped commits behind a foreground test gate. The operator paid the cost anyway,
  because the copy hop — not the plugin version installed — decides which bytes run.

  **Read this as evidence, not as scope.** The remediations these pain points call for have
  already shipped in the modules; G-6 (pipeline semantics preserved) is what keeps them shipped
  when the host changes. A reviewer should not reopen verdict vocabulary, trailer recovery, model
  routing or commit/test-gate mechanics as engine work on the strength of this incident.

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

Verified against this repo on 2026-08-08 (per DC-02, each fact carries the citation it was
measured from; the values below are the record, not a recollection):

1. **The modules already run in plain Node.** Of the four runtime capabilities the modules
   declare, three already have working plain-Node bodies — `parallel`
   (`orchestrate-dev.js:8464`), `pipeline` (`:8469`), `phase` (`:8474`) — and only
   `agent()` (`:8458`) throws outside the Claude Code runtime. Every IO seam already
   defaults to real Node: `defaultReadFile` → `fs.readFileSync` (`orchestrate-dev.js:8492`),
   `execSync` resolved by dynamic import (`:7680`, `:10754`), and `orchestrate-queue.js`
   carries its own `fs`-backed defaults (`:948`). `dist/pdlc-cli.mjs` is an existing
   plain-Node artifact built from the same body. **The only capability the modules take from
   the workflow runtime is `agent()`.**
2. **The plugin coupling is one string, not a dependency to remove.** `runtime-adapter.js:47`
   (`rtSkillPrompt`) tells the dispatched agent to invoke the Skill tool with
   `"pdlc:{skill}"`. A dispatcher that reads each skill's `SKILL.md` by path and inlines it
   removes the *Skill-tool invocation* from the unattended path — the pdlc plugin itself stays
   installed as the one place those `SKILL.md` files live, since it must remain usable
   standalone for interactive `/pdlc:*` sessions (operator decision, 2026-08-08; §4 C-10).
3. **Everything else in `runtime-adapter.js` (53,056 bytes) is workaround**, re-expressing
   `fs` and `git`/`gh` through IO agents because the runtime has nothing else — including the
   prose-chunked, SHA-256-verified file transport built after four measured corruption modes.
   Hosted in Node, that workaround is not ported; it is deleted.

### 1.3 Transport decision (superseded 2026-08-08 by Phase-0 spike)

The docs-derived ruling below — that the Claude **Agent SDK is ruled out as the dispatch
transport** because Anthropic's authentication docs state the SDK must use
`ANTHROPIC_API_KEY` — is **superseded by empirical measurement**. A Phase-0 spike
(`docs/pdlc-headless-engine/SPIKE-agent-sdk-auth.md`) ran the installed
`@anthropic-ai/claude-agent-sdk` on the operator's machine with `ANTHROPIC_API_KEY` verified
absent from the process environment and both Claude Code settings files. The SDK's
`system/init` message reported **`apiKeySource: "none"`**; the call completed with no
exception and no key prompt; a `rate_limit_event` message carried `rateLimitType: "five_hour"`
with `overageStatus: "rejected"` — the shape associated with subscription-plan rate limiting,
not a pay-as-you-go key. **Architectural decision: the Agent SDK is the primary dispatch
transport; headless `claude -p` is the declared fallback, both behind the same unchanged
`_agent` seam** (G-2). The engine asserts the SDK's reported `apiKeySource` is `"none"` at
startup and at each dispatch, refusing otherwise absent an explicit opt-in flag (C-1).

**Policy-risk caveat, kept from the superseded ruling:** the docs' third-party-product
language ("the SDK requires `ANTHROPIC_API_KEY`") and the spike's observed behavior could
diverge again — a future SDK release could start requiring a key, or an org-level policy
change could disable the subscription path the proxy currently permits. The spike does not
prove *why* subscription auth works (whether the local `headroom` proxy itself performs
auth translation invisible to the SDK client, versus the SDK having a genuine subscription
path) — only that it does, on this machine, today. The `apiKeySource` assertion is the
tripwire: any dispatch where the SDK reports a source other than `"none"` fails closed rather
than silently billing pay-per-token.

Headless Claude Code (`claude -p`) remains available as the declared fallback: it also accepts
subscription auth (interactive `/login` state or a `claude setup-token` OAuth token via
`CLAUDE_CODE_OAUTH_TOKEN`) and honors `ANTHROPIC_BASE_URL` / `ANTHROPIC_CUSTOM_HEADERS` from
the environment. The operator runs the most expensive Claude subscription and routes all
traffic through the local `headroom` proxy (`ANTHROPIC_BASE_URL=http://127.0.0.1:8787`,
ambient in the shell environment); both remain hard constraints (§4). Sources:
`docs/pdlc-headless-engine/SPIKE-agent-sdk-auth.md` (2026-08-08, empirical); code.claude.com
authentication, env-vars and network-config docs, retrieved 2026-08-08 (the superseded
docs-derived claim, kept as the policy-risk baseline above).

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
  remain the single source of truth. The engine adds one new adapter that supplies the
  modules' existing injection seams (`_agent`, `_parallel`, `_pipeline`, `_phase`, `_log`,
  `_runCommand`, and the session seam `_sessionAgent`); every other IO seam uses the modules'
  Node defaults untouched. Adding a seam is a change to the modules, in this repo, with
  tests — never a fork (C-4).
- **G-3 — Subscription-first dispatch.** *(US-02)* Every model call runs on the operator's
  Claude subscription through headless Claude Code, and the per-phase model each module
  already pins is forwarded to the CLI verbatim, whatever its value (C-7) — the engine
  introduces no model policy of its own and knows no model names.
- **G-4 — Proxy passthrough as contract.** *(US-04)* `ANTHROPIC_BASE_URL`,
  `ANTHROPIC_CUSTOM_HEADERS` and headroom's own variables reach every spawned `claude`
  process; the effective endpoint is reported at startup so a bypassed proxy is visible
  immediately rather than discovered from a missing trace hours later.
- **G-5 — Skills resolved from the installed plugin, inlined by the engine.** *(US-01)* All 17
  skill prompt files — 15 `SKILL.md` files plus the two `se-implement` language supplements —
  are **not** packaged inside the engine. The pdlc Claude Code plugin remains the single
  delivery vehicle for every `SKILL.md`, so `/pdlc:*` skills keep working standalone in
  interactive sessions; the engine locates the locally installed plugin at dispatch time,
  reads each skill's prompt file from it, and inlines that text into the composed `claude -p`
  prompt. No Skill tool and no `pdlc:` namespace reference appear in a composed prompt — the
  plugin is a resolved-from-disk source of prompt text, not an in-session capability the
  dispatched agent invokes. (A recorded alternative, not chosen: have the dispatched headless
  session invoke the Skill tool `pdlc:{skill}` directly, since the plugin is installed
  machine-wide — rejected because it reintroduces a runtime dependency on the Skill tool's
  namespace resolution inside a non-interactive headless session, rather than a plain file
  read the engine controls end to end; see C-10.)
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
- **NG-6** *(superseded 2026-08-08 — see §1.3 change note 0.4)* No engine transport work
  beyond the Agent-SDK-primary / `claude -p`-fallback design already decided in §1.3: no third
  transport, no model-routing logic, no transport auto-selection heuristic beyond the
  `apiKeySource` fail-closed check (C-1). The prior wording of this non-goal ("no Agent SDK
  usage, even optionally") depended on the docs-derived ruling §1.3 has since superseded and no
  longer applies.
- **NG-7** No new copy of anything into a consumer project. The engine ships no installer,
  writes no engine-owned file into a consumer repo, and does not read, repair, or report on
  `.claude/workflows/`. A project's existing copy is simply irrelevant to an engine run.
- **NG-8** No change to the skill prompts themselves. Prompt text that assumes the workflow
  runtime's mechanics is *audited* (R-5) and its disposition recorded, but rewriting SKILL.md
  bodies is out of scope here — a needed rewrite becomes an obligation, not a silent edit.

## 4. Constraints

- **C-1 — Auth: subscription-first, fail-loud.** *(operator hard constraint)* The engine
  authenticates via the logged-in Claude Code state or `CLAUDE_CODE_OAUTH_TOKEN`. It must
  never *silently* fall back to `ANTHROPIC_API_KEY` billing: if subscription auth is
  unavailable and an API key is present, the engine refuses to start unless the operator
  passes an explicit opt-in flag; the startup banner names the auth source in use. The
  refusal is at **startup**, before any dispatch — a run that has already billed a phase to
  the wrong account has already failed. **Mechanical form (§1.3):** for the primary Agent-SDK
  transport, the engine asserts the SDK-reported `apiKeySource` (from the `system/init`
  message) is exactly `"none"` at startup and at each dispatch; any other value is a startup
  refusal naming the reported source, absent the explicit opt-in flag (`auth.allowApiKeyBilling`,
  §4.1). The same fail-closed check applies to the `claude -p` fallback via its own reported
  auth source.
- **C-2 — Environment passthrough is contractual.** *(operator hard constraint)* Every
  spawned `claude` process inherits the parent environment, headroom's
  `ANTHROPIC_BASE_URL` (`http://127.0.0.1:8787`) and `ANTHROPIC_CUSTOM_HEADERS` included.
  The engine never constructs a child environment from scratch — it only ever extends the
  parent's — and it never sets, unsets, or rewrites either variable. The startup banner
  reports the effective base URL.
- **C-3 — `cwd` is the consumer project.** Every dispatch runs with the consumer repo as its
  working directory; all artifact paths remain consumer-relative exactly as today.
- **C-4 — The modules are not forked.** Any behavior the adapter cannot express through the
  existing seams is a change to the modules (tested, in this repo), never a patched copy.
- **C-5 — Guard parity.** The `guard-harvest-before-delete` invariant (no deletion of
  `CROSS-REVIEW-*` / `CODE_REVIEW-*` / `ADVISORY-*` without `LEARNINGS-{feature}.md`) must
  hold for engine-dispatched agents, enforced via per-dispatch hook/settings configuration
  passed to `claude -p` — not left to plugin installation.
- **C-6 — Non-interactive permissions are explicit.** The permission mode passed to
  `claude -p` (allowed tools, bypass level) is a named, reviewable engine setting, not an
  ad-hoc `--dangerously-skip-permissions` scattered through call sites.
- **C-7 — Model aliases forwarded, not re-mapped.** Whatever model a module names for a
  dispatch passes through to the CLI untranslated. The engine holds no model table, no
  alias map, and no fallback list: alias resolution and unknown-alias errors stay the CLI's
  job, so a module that gains a new model tier needs no engine change.
- **C-8 — Operator-visible strings are a closed catalogue** *(DC-01)*. Every banner line,
  refusal, warning, and failure message the engine emits is a registered catalogue entry
  asserted by id in the test harness, and every value the engine parses out of the CLI is
  read by a **total** function with a defined outcome for malformed input. No ad-hoc regex
  over stderr, no string emitted outside the catalogue.
- **C-9 — Every runtime fact is measured, per platform** *(DC-02)*. The CLI flag surface,
  auth-source detection, and output shape are recorded from the installed CLI with the
  command that measured them (O-1), never inferred from documentation; the supported
  platform set is stated and each claim is measured on each member.
- **C-10 — Plugin version handshake, hard constraint.** *(operator hard constraint,
  2026-08-08)* The engine declares a compatible pdlc-plugin version range. At startup it
  locates the installed plugin (O-8) and reads its `.claude-plugin/plugin.json` version. A
  missing plugin install, or an installed version outside the declared range, is a fail-closed
  startup refusal — the engine dispatches nothing and exits non-zero with a message naming
  both the engine's declared range and the plugin version found (or "not found"), plus the
  remedy (install/upgrade/downgrade the plugin). Both the startup banner and every run report
  carry `engineVersion` and `pluginVersion` together, always as a pair. This makes the plugin a
  hard runtime dependency of the CLI (a change of premise from earlier drafts of this REQ,
  which treated plugin absence as harmless) and reopens a skills-vs-engine version-skew axis;
  the handshake is the contained mitigation — skew is checked at every startup, never assumed
  absent.

### 4.1 Declared thresholds

Every threshold an acceptance criterion below relies on, with its default and its owner.
No AC may depend on a tunable that is not listed here.

| Name | Default | Owner | Used by |
|---|---|---|---|
| `dispatch.retryAttempts` | 3 retries after the first attempt | engine config | AC-4.1 |
| `dispatch.retryBackoff` | exponential from 30 s, capped at 15 min | engine config | AC-4.1 |
| `dispatch.timeoutMinutes` | 30 min per dispatch | engine config | AC-4.2 |
| `auth.allowApiKeyBilling` | `false` (flag-only opt-in, never a config file) | operator, per invocation | AC-2.2 |
| `queue.loopIdleExit` | exit 0 when no ready row remains | engine | AC-1.2 |

The retry defaults are a starting point chosen to absorb a transient rate-limit window
without masking a persistent one, not a measured floor; O-7 obliges recording the observed
rate-limit behaviour and re-deriving them before they are treated as settled.

## 5. Acceptance Criteria

Each criterion is stated so a test engineer can derive a failing test from it without asking a
question. `{f}` denotes a feature name throughout.

**Group 1 — pipeline parity** *(US-01, US-03; G-1, G-2, G-6)*

- **AC-1.1** *Who:* the operator. *Given* a consumer repo on `feat-{f}` holding
  `docs/{f}/REQ-{f}.md`, with **no `.claude/workflows/` directory at all** and the pdlc
  plugin installed machine-wide at a version within the engine's declared compatible range
  (C-10), *when* they run `pdlc dev docs/{f}/REQ-{f}.md`, *then* the pipeline runs end-to-end
  through the phases enabled by that repo's config and produces the same artifact set as the
  workflow-runtime path produces for the same inputs: the spec documents, the cross-review
  files with parseable verdicts and approval anchors, the queue-row writes, and the final
  report fields.
- **AC-1.2** *Given* the same repo, *when* the run is observed at the filesystem level for
  its whole duration, *then* **no path under the consumer's `.claude/workflows/` is opened**,
  and the only files read outside the consumer repo are inside the engine install or the
  installed pdlc plugin's `skills/` tree (resolved per G-5, C-10). Reads of the consumer's own
  `docs/**` and `.claude/pdlc.config.json` are expected and do not violate this.
- **AC-1.3** *Given* a queue with a ready row, *when* the operator runs `pdlc queue`, *then*
  exactly one feature is selected by the module's own Phase-0 triage — same row, same
  ordering, same blocked/halted handling as the workflow-runtime path — and `pdlc queue
  --loop` repeats that one feature at a time until no ready row remains, then exits 0
  (`queue.loopIdleExit`).
- **AC-1.4** *Given* a pipeline that halts, *when* the run ends, *then* the halt is recorded
  exactly as the modules record it today — the POSTMORTEM file, the `halted` queue row and
  its pathspec-scoped commit — and the CLI's exit code distinguishes a halt from a crash of
  the engine itself.
- **AC-1.5** *Given* the engine's own repository, *when* its test suite runs, *then* it
  asserts that the workflow modules it loads are this repo's tested sources and not a
  vendored or edited copy, so a fork is a test failure rather than a discovery (C-4).

**Group 2 — auth and environment** *(US-02, US-04; G-3, G-4; C-1, C-2)*

- **AC-2.1** *Given* any successful start, *when* the banner is printed, *then* it reports
  the engine version, the installed plugin version confirmed compatible by the handshake
  (C-10), the resolved auth source as one of a closed set (logged-in session / OAuth token /
  API key), and the effective `ANTHROPIC_BASE_URL`; with headroom's ambient environment
  present it reports `http://127.0.0.1:8787`.
- **AC-2.2** *Given* no subscription auth available and `ANTHROPIC_API_KEY` present, *when*
  the operator runs any engine command, *then* the engine **dispatches nothing** and exits
  non-zero naming the refusal and the opt-in flag; *and given* the same state with that flag
  passed, the run proceeds and the banner states that pay-per-token billing is in effect.
- **AC-2.3** *Given* a parent environment carrying `ANTHROPIC_BASE_URL` and
  `ANTHROPIC_CUSTOM_HEADERS`, *when* any dispatch is spawned, *then* the child process
  environment contains both, unmodified, together with the rest of the parent environment —
  asserted for every spawn the engine performs, not only the first.
- **AC-2.4** *Given* an operator whose subscription auth is present, *when* the engine
  starts, *then* it neither reads nor requires `ANTHROPIC_API_KEY`, and setting one does not
  change which account is billed.
- **AC-2.5** *Given* any dispatch, *when* it is spawned, *then* its working directory is the
  consumer repo root (C-3), so every artifact path the modules use resolves consumer-relative
  exactly as it does today.

**Group 3 — prompt composition, plugin handshake, and model forwarding** *(G-5; C-6, C-7,
C-10)*

- **AC-3.1** *Given* a dispatch for any of the 17 skill prompts, *when* the composed prompt is
  inspected via the dry-run surface, *then* it contains the full text of that prompt file
  resolved from the **locally installed pdlc plugin's** `skills/{skill}/SKILL.md` (or its
  `se-implement` language-supplement file), and contains **no instruction to invoke the Skill
  tool** and no `pdlc:` namespace reference — the plugin supplies the bytes at dispatch time,
  never a runtime Skill-tool call.
- **AC-3.2** *Given* a repo with no plugin installed, or one installed outside the engine's
  declared compatible version range, *when* the operator runs any engine command, *then* the
  engine **dispatches nothing** and exits non-zero with a message naming the engine's declared
  range, the plugin version found (or "not found"), and the remedy (C-10) — this replaces the
  earlier assumption that the engine has no plugin dependency to lose.
- **AC-3.3** *Given* a dry run of the full phase graph, *when* the model passed to each
  dispatch is compared against the model the corresponding module pins, *then* every dispatch
  matches, for every model value the modules currently name, and the engine substitutes no
  default of its own for a model it does not recognise.
- **AC-3.4** *Given* the permission posture passed to each dispatch, *when* the engine is
  inspected, *then* it comes from one named, reviewable setting applied uniformly, and no
  call site carries its own ad-hoc permission escalation (C-6).
**Group 4 — dispatch failure taxonomy and endurance** *(US-02; G-7; DC-01)*

- **AC-4.1** *Given* any dispatch outcome, *when* the engine classifies it, *then* it lands
  in exactly one member of a **closed, documented taxonomy** — at minimum: `ok`,
  `retryable` (rate limit, overload, transport interruption), `timeout`, `auth-failure`,
  `transport-contract-violation` (output the engine cannot parse), and `agent-reported
  failure` (the dispatch ran and the agent reported failure, which is the modules' business,
  not the engine's). Every classification is a total function of the observed outcome:
  unrecognised output classifies as `transport-contract-violation`, never as success.
- **AC-4.2** *Given* a `retryable` outcome, *when* it occurs, *then* the dispatch is retried
  up to `dispatch.retryAttempts` with `dispatch.retryBackoff`; *given* a dispatch producing
  no output for `dispatch.timeoutMinutes`, it is classified `timeout` and treated as
  retryable once, then terminal.
- **AC-4.3** *Given* retries were exhausted, *when* the run ends, *then* the engine surfaces
  the failure through the modules' own failure path — the phase halts with its normal
  POSTMORTEM and halt-row semantics — and the engine process itself does not crash, leave an
  orphan `claude` child, or exit before the halt is recorded.
- **AC-4.4** *Given* an `auth-failure` mid-run, *when* it occurs, *then* it is **not**
  retried silently: the run stops and the message names the auth source that failed, because
  a retry loop against a dead credential burns the wall clock a queue run depends on.
- **AC-4.5** *Given* a completed or halted run, *when* the run report is read, *then* it
  carries, in addition to every field the modules already produce: engine version, auth
  source, effective base URL, per-phase dispatch counts, and one row per retry and per pause
  (taxonomy member, phase, attempt number, delay). A run with zero retries carries an empty
  set of such rows, not a missing field.

**Group 5 — guard parity and safety** *(C-5)*

- **AC-5.1** *Given* an engine-dispatched agent in a repo where `LEARNINGS-{f}.md` does not
  exist, *when* it attempts to delete a `CROSS-REVIEW-*`, `CODE_REVIEW-*` or `ADVISORY-*`
  file, *then* the deletion is refused via the per-dispatch hook/settings the engine itself
  passes to `claude -p` (C-5) — asserted independently of the plugin's own hook wiring, so the
  guard is proven to travel with the engine's dispatch configuration rather than depend on
  whatever hooks a plugin install happens to register.
- **AC-5.2** *Given* the same repo once `LEARNINGS-{f}.md` exists, *when* harvest deletes
  those files, *then* the deletion succeeds — the guard is not a blanket ban.

**Group 6 — verification strategy** *(Team Principle 2)*

- **AC-6.1** *Given* the engine's test suite, *when* it runs in CI, *then* it exercises the
  adapter against the modules' existing test doubles with **no live model calls and no
  network**, and it fails if a test path would spawn a real `claude` process.
- **AC-6.2** *Given* an explicit opt-in flag, *when* the live smoke path runs, *then* it
  drives one real, small feature end-to-end against a scratch repo and asserts the artifact
  set of AC-1.1; it is never part of the default suite.
- **AC-6.3** *Given* the recorded CLI interface contract (O-1), *when* the transport is
  tested, *then* it is tested against **recorded fixtures of real CLI output**, and a fixture
  refresh against a newer CLI version is a documented, repeatable step rather than a rewrite.

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
- **R-3 — Policy drift.** §1.1's auth facts are policy, not physics; Anthropic could change
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

- **O-1** *(fallback-path obligation, per §1.3's transport swap)* Probe and record the exact
  `claude -p` flag surface used (output format, model, settings/hook injection, `--resume`,
  permission flags) against the installed CLI version before TSPEC, as the fallback transport's
  interface contract with fixtures — the primary Agent-SDK transport's message-stream shape
  (system/init, rate_limit_event, terminal result — per `SPIKE-agent-sdk-auth.md`) is probed and
  fixtured the same way, and both are exercised behind the one `_agent` seam.
- **O-2** Decide the guard-parity mechanism (C-5): per-dispatch `--settings` carrying the
  PreToolUse hook vs. an engine-side pre-flight. Must be sourced from the engine's own
  dispatch configuration, not from whatever hooks the plugin install happens to register
  (AC-5.1) — the plugin being present (C-10) is no longer the open case to design for; hook
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
- **O-8** Probe and record the pdlc plugin's installed-location discovery mechanism (C-10,
  G-5) before TSPEC: the plugin cache layout under `~/.claude`, the marketplace-clone layout,
  and how each resolves a specific plugin's version and its `skills/` directory. Cover the
  case of multiple candidate install roots (e.g. a marketplace clone alongside a cache
  install) and state which one wins, deterministically.

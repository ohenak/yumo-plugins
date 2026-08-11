---
feature: pdlc-headless-engine
---

# FSPEC — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md`, v0.7) |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 0. Overview

The pipeline's logic reaches consumers today by being **copied into them**. The headless engine
removes the copy: one installed engine runs the canonical workflow modules against any consumer
repo, dispatching every agent itself. Nothing about the phase graph, the review loop, the queue
lifecycle, or the documents changes — only the host does.

That relocation is behaviourally interesting in exactly five places, and those five are what this
document specifies:

1. **A start can refuse.** Before anything is dispatched the engine runs an ordered gate ladder —
   plugin found, plugin version compatible, skill prompts readable, billing posture acceptable. A
   failure at any rung dispatches nothing and exits non-zero (§4). A refusal that costs a token is
   a defect, not a slower refusal.
2. **Auth is decided twice, on different evidence.** Startup decides from *inspectable* state
   (environment, settings files); each dispatch decides again from what the transport reports about
   itself from inside the call (§5). Passing the first says nothing about the second, and a run
   that starts cleanly may still stop at its first dispatch — an intended ordering, not a gap.
3. **A prompt is composed from the plugin's bytes.** The engine reads the skill's prompt file from
   the installed plugin at dispatch time and inlines it; the dispatched agent is never told to
   invoke a skill by name (§6).
4. **A failure is classified before it is retried.** Every dispatch outcome lands in exactly one of
   six named classes, and the retry/timeout state machine over those classes is a fixed table an
   unattended run's endurance depends on (§8).
5. **The consumer project is read, never written to on the engine's account.** The engine writes no
   engine-owned file into a consumer repo and — under the posture §10 fixes — opens no path under
   the consumer's `.claude/workflows/` at all (§10).

Everything else in this feature is *preservation*: the modules are imported unmodified, so the
semantics they implement are unchanged by construction rather than by re-specification (§10).

**Reading order for a reviewer with limited time:** §3–§5 are the operator's first ten seconds
(what can be typed, what refuses, what the banner says). §6–§8 are the dispatch. §9–§12 are what
the run leaves behind. §13 lists what is still open; §14 traces every AC; §15–§18 consolidate the
flow, rules, edge cases, and tests already specified in §3–§12 without adding behaviour.

## 1. Scope and reading order

This FSPEC specifies the **observable behaviour** of the engine described by
`REQ-pdlc-headless-engine.md` v0.7. It covers what the operator can invoke, what the engine
refuses and when, what each dispatch carries, how outcomes are classified and retried, what
travels with a dispatch to keep the delete guard alive, and what the run reports.

**Why this feature earns an FSPEC.** Each of the five areas above has branching an engineer should
not settle alone: an ordered gate ladder where two rungs can fail at once, a first-match auth table
whose rows are not disjoint, a retry state machine with two interacting budgets (attempts and a
one-timeout cap), and a "reads nothing under `.claude/workflows/`" claim whose truth depends on
which module is driving.

| FSPEC | Requirement(s) | Behaviour specified |
|---|---|---|
| FSPEC-ENG-01 | AC-1.4, AC-1.3 | command surface, invocation grammar, exit-code meanings |
| FSPEC-ENG-02 | AC-3.2, AC-3.5, C-10 | startup gate ladder, ordering, refusal content |
| FSPEC-ENG-03 | AC-2.1, AC-2.2, AC-2.4, C-1 | startup auth mapping and the per-dispatch assertion |
| FSPEC-ENG-04 | AC-3.1, AC-3.5, G-5 | skill resolution from the plugin, prompt composition, dry-run surface |
| FSPEC-ENG-05 | AC-2.3, AC-2.5, AC-3.3, AC-3.4 | dispatch environment, `cwd`, model forwarding, permission posture |
| FSPEC-ENG-06 | AC-4.1, AC-4.2, AC-4.3, AC-4.4 | outcome taxonomy, retry/timeout machine, exhaustion routing |
| FSPEC-ENG-07 | AC-5.1, AC-5.2, C-5 | delete-guard parity travelling with the dispatch |
| FSPEC-ENG-08 | AC-1.1, AC-1.2, AC-1.5, G-6 | pipeline parity oracle, empty consumer read-set, anti-fork |
| FSPEC-ENG-09 | AC-1.3 | queue selection, `--loop` termination |
| FSPEC-ENG-10 | AC-4.5, AC-6.4, C-8 | run report contents, closed message catalogue, total parsing |

**Not specified here** (owned downstream by TSPEC / PLAN): module boundaries and file placement,
seam and function signatures, which injection parameter each module's entry point declares, the
transport's message-parsing shape, config-file schema at the key-by-key level, and the order in
which code is written. Where this document names a value it is one an **operator or reviewer
reads**: a command, a flag, a config key, a catalogue id, an exit code, a reported field.

**Vocabulary.** *Dispatch* — one agent invocation the engine makes on behalf of a module.
*Transport* — the mechanism a dispatch is made through: the Agent SDK (primary) or headless
`claude -p` (declared fallback). *Descriptor* — the record of a dispatch as composed (skill,
prompt, model, environment), which exists whether or not the dispatch is executed. *Consumer repo*
— the project holding `docs/{f}/` artifacts and `.claude/pdlc.config.json`. *Plugin* — the
installed pdlc Claude Code plugin, the sole source of skill prompt text.

## 2. Baseline — what an operator can already run at HEAD

This is not a greenfield FSPEC. A partial engine is committed on `feat-pdlc-headless-engine`, and
`docs/_constraints/pdlc-engine-baseline.md` **M-ENG-06** records, per acceptance criterion, whether
a test written today starts red or re-asserts green. Two consequences shape this document:

- Where M-ENG-06 records **green**, this FSPEC states the behaviour as a contract to be *pinned*,
  and the observable it names must match what the operator sees at HEAD. Any place this document
  is stricter than HEAD is called out in the section that says so (§4.4, §6.4, §13).
- Where M-ENG-06 records **red**, this FSPEC is specifying behaviour that does not exist yet — the
  auth check at startup and per dispatch (§5), guard parity (§9), the message catalogue (§12), and
  the skill-set equality check (§6.4). These are the sections a plan should schedule first.

The measured facts every later section cites by id rather than re-deriving: **M-ENG-01** (the
modules already run in plain Node; `agent()` is the only capability they take from the runtime),
**M-ENG-04** (the SDK completing a call under subscription auth with a reported source of `"none"`,
and the caveat that this records *that* it works, never *why*), **M-ENG-05** (headless `claude -p`
accepts subscription auth), **M-ENG-07** (the pinned model map and the five-configuration corpus
that exercises every row), **A-ENG-01** (Skill-tool invocation considered and rejected).

## 3. FSPEC-ENG-01 — Command surface, invocation grammar, and exit codes

### 3.1 The commands

The engine exposes one executable, `pdlc`, with a closed command set. Every command below is
operator-visible surface; an invocation naming no command, or a command outside this set, prints
usage and exits with the engine-refusal code (§3.3).

| Command | Purpose | Dispatches models? |
|---|---|---|
| `pdlc dev <REQ path>` | run the dev pipeline for one feature (the direct-invocation entry) | yes |
| `pdlc queue` | run the queue driver for one ready feature | yes |
| `pdlc queue --loop` | repeat one feature per iteration until none is ready (§11) | yes |
| `pdlc doctor` | run the startup gate ladder and report every rung, then stop | no |
| any of the above with `--dry-run` | resolve, handshake, compose, print; dispatch nothing | no |

`pdlc doctor` and `--dry-run` are the two **non-billing** surfaces, and their inertness is a
contract, not an intention: on either path an attempted dispatch is itself a failure the run
surfaces (§6.5, AT-ENG-14).

### 3.2 Flags

| Flag | Applies to | Meaning |
|---|---|---|
| `--force-phases <list>` | `dev` | forwarded to the module verbatim; the module owns its token grammar and its rejection of an unknown token |
| `--queue-path <path>` | `queue` | which queue file the module reads |
| `--loop` | `queue` | iterate (§11) |
| `--dry-run` | `dev`, `queue` | compose and print, dispatch nothing |
| `--plugin-root <path>` | all | override plugin discovery for this invocation |
| `--cwd <path>` | all | the consumer repo the run operates on (§7.2) |
| `--allow-api-key-billing` | all | the `auth.allowApiKeyBilling` opt-in of REQ §4.1 (§5) |

Three grammar rules hold for every flag, because an unattended operator cannot see a typo:

- **BR-CLI-1.** A flag is accepted in both `--flag value` and `--flag=value` form, and the two are
  equivalent in effect.
- **BR-CLI-2.** `--allow-api-key-billing` is **flag-only, per invocation**. It is never read from a
  config file, never from an environment variable, and never persists across invocations (REQ §4.1
  names its owner as the operator, per invocation). A config file offering to enable it has no
  effect — this is what makes "did this run bill me?" answerable from the command line alone.
- **BR-CLI-3.** Every other tunable of REQ §4.1 (`dispatch.retryAttempts`, `dispatch.retryBackoff`,
  `dispatch.timeoutMinutes`) comes from engine configuration, and the engine's *effective* value
  for each is reported in the run report (§12.2) so a surprising pause is explainable after the
  fact. Where that configuration lives is O-3, still open (§13).

### 3.3 Exit codes

The exit code is the only thing a cron slot or a wrapper script reads, so it distinguishes the
three outcomes an operator must act on differently (AC-1.4):

| Code | Meaning | Operator's next move |
|---|---|---|
| `0` | the pipeline finished, or a non-dispatching surface (`doctor`, `--dry-run`) passed | none |
| `2` | the pipeline **halted** — a normal, recorded pdlc outcome | read the POSTMORTEM; the run did its job |
| `1` | the **engine** refused or crashed — startup gate, auth policy, bad usage, unparseable transport output | fix the environment; the pipeline never got its chance |

**BR-EXIT-1 — a halt is not a crash.** A halt is a pipeline outcome the modules produce and record
(POSTMORTEM file, `halted` queue row, its pathspec-scoped commit); the engine's job on a halt is to
stay alive long enough for those records to be written and then report `2`. An engine that exits
`1` on a halt has destroyed the operator's ability to distinguish "pdlc stopped and told you why"
from "the host broke".

**BR-EXIT-2 — refusals are `1`, uniformly.** Every startup-gate refusal (§4), the startup billing
refusal (§5.2), and the per-dispatch auth abort (§5.3) exit `1`, because in all of them the
pipeline produced no verdict about the feature.

**BR-EXIT-3 — `queue --loop` reports the worst iteration.** The loop's exit code is `0` only if
every iteration it ran ended at `0`; a halted iteration yields `2` and an engine refusal yields `1`
(§11.3 fixes what the loop does *next* in each case, which is a separate decision from what it
finally reports).

### 3.4 Edge cases

| # | Case | Behaviour |
|---|---|---|
| EC-CLI-1 | no command given, or an unrecognised command | usage printed, exit `1`; nothing resolved, nothing dispatched |
| EC-CLI-2 | `pdlc dev` with no REQ path | usage printed, exit `1` — the engine does not guess a feature |
| EC-CLI-3 | `pdlc dev` with a REQ path that does not exist under `--cwd` | engine refusal naming the path, exit `1`, before startup dispatch |
| EC-CLI-4 | `--force-phases` with a token the module rejects | the module's own refusal surfaces; the engine adds no token vocabulary of its own |
| EC-CLI-5 | a value flag given with no value (`--cwd` as the last argument) | usage error, exit `1`; never silently treated as empty |
| EC-CLI-6 | `--dry-run` on a repo whose plugin handshake fails | the handshake refusal wins (§4.2 ordering): a dry run is not a way to skip the gate |

### 3.5 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-01 | each command in §3.1 is accepted; a command outside the set prints usage and exits `1` (EC-CLI-1) |
| AT-ENG-02 | `--flag value` and `--flag=value` produce identical composed descriptors (BR-CLI-1) |
| AT-ENG-03 | a config file setting `auth.allowApiKeyBilling: true` changes nothing; only the flag does (BR-CLI-2) |
| AT-ENG-04 | a halting fixture run exits `2` and a startup-refusal run exits `1`, on the same repo (BR-EXIT-1/2) |
| AT-ENG-05 | EC-CLI-2…EC-CLI-6, one case each |

## 4. FSPEC-ENG-02 — The startup gate ladder

### 4.1 The ladder

Every command that can dispatch runs the same ladder before the workflow modules are asked to do
anything, and `pdlc doctor` runs exactly this ladder and stops. The rungs, in order:

| # | Rung | Passes when | On failure |
|---|---|---|---|
| 1 | **plugin resolved** | an installed pdlc plugin is located (or `--plugin-root` / the plugin-root environment override names one) | refusal naming what was searched and both overrides |
| 2 | **plugin manifest readable** | the located plugin's manifest is present and parseable | refusal naming the manifest path and why it failed |
| 3 | **version handshake (C-10)** | the plugin version satisfies the engine's declared compatible range | refusal naming the declared range, the version found (or "not found"), and the remedy |
| 4 | **skill prompts readable** | every prompt file the run can need is present and non-empty (§4.4) | refusal naming each missing or unreadable identifier |
| 5 | **billing posture** | the startup auth mapping of §5.1 does not land on the refusal row | refusal `auth.api-key-refused` naming the opt-in flag |

**BR-START-1 — dispatch nothing until every rung passes.** No model call, and no probe of any kind,
is made while the ladder is running; a failure at any rung ends the invocation with exit `1` and
zero tokens billed. This is what makes a mis-installed machine cheap to discover.

**BR-START-2 — the ladder is total and reports every rung, not the first failure.** Two broken
things (say, an absent plugin *and* an API key with no subscription credential) produce one message
listing both, because an operator fixing a cron host one round-trip at a time is the failure mode
this rule exists to prevent. Rungs whose evidence is unavailable because an earlier rung failed
report as *skipped, with the reason* — never as passing.

**BR-START-3 — `doctor` is the same ladder, not a second implementation.** Any divergence between
what `doctor` reports and what a run's start enforces is a defect: `doctor` exists to answer "will a
run start here?" and only a shared ladder can answer that honestly.

### 4.2 Ordering, and why it is fixed

The order above is behavioural, not cosmetic. Two orderings in it are load-bearing:

- **The plugin handshake precedes everything the modules do.** The engine must not import, let
  alone run, the workflow modules on a machine whose plugin is missing or out of range, because a
  partially-started pipeline can commit to a consumer repo (queue rows, POSTMORTEMs). Fail-closed
  means *before the first side effect*, not merely before the first dispatch (C-10).
- **The billing posture is the last rung, and a dry run does not skip it.** A `--dry-run` still runs
  rungs 1–4 (it needs the plugin's bytes to compose anything) and still reports rung 5's finding,
  but since it dispatches nothing it does not refuse on rung 5 alone — an operator may legitimately
  inspect composed prompts on a machine that could not bill. This is the single point where the
  dry-run path and the run path differ, and it is deliberate (EC-START-4).

### 4.3 What a refusal says

Every startup refusal is a catalogue entry (§12.3) and carries three things: **what was expected**,
**what was found**, and **the remedy**. The handshake refusal is the worked example: the engine's
declared compatible range, the plugin version found or "not found", and install/upgrade/downgrade
guidance (AC-3.2). A refusal that names only the failure — "plugin incompatible" — does not satisfy
this section.

The banner and every run report carry `engineVersion` and `pluginVersion` **together, as a pair**,
on success and on refusal alike (C-10). An operator debugging a surprising result reads the pair
rather than inferring it, which is the entire mitigation R-6 offers for the skew axis C-10 opens.

### 4.4 Rung 4: which skills must be readable

AC-3.5 asks for **set-equality** between the skill identifiers the modules can dispatch and the
skill prompt files present in the installed plugin, in both directions, checked before any dispatch.
The intent — a missing or renamed prompt file is discovered at startup, not mid-run by the phase
that needed it — is specified here as:

- **Direction A (dispatchable ⊆ readable), enforced.** Every skill identifier a module can dispatch
  has a present, non-empty prompt file in the located plugin, and the two `se-implement` language
  supplements are present. A failure names each missing identifier and refuses (exit `1`).
- **Direction B (readable ⊆ dispatchable), reported.** A prompt file present in the plugin that no
  module dispatches is reported at startup and does **not** refuse.

Direction B is stated as *report, not refuse*, because at HEAD the two sets are not equal and cannot
be: the plugin ships prompt files the modules never dispatch (the operator-invoked entry and
consolidation skills), so an equality gate would refuse on every correctly installed machine. This
is a defect in AC-3.5's oracle rather than a decision this FSPEC may make on its own — it is raised
as an erratum against the REQ, and §13 O-ENG-1 carries it. The count in AC-3.5's parenthetical is
likewise a count of *files*, not of dispatchable identifiers.

**BR-START-4 — the count is never the assertion.** Neither direction is expressed as "17" or any
other number. A frozen list of names, or a count, passes on a plugin whose files have been renamed
underneath it; the assertion is over identifiers derived from the modules and files found in the
plugin at startup.

### 4.5 Edge cases

| # | Case | Behaviour |
|---|---|---|
| EC-START-1 | no plugin installed anywhere | rung 1 refusal naming both overrides; exit `1`, nothing dispatched (AC-3.2) |
| EC-START-2 | plugin present, version outside the declared range | rung 3 refusal naming range, version found, remedy (AC-3.2) |
| EC-START-3 | plugin present, manifest unparseable | rung 2 refusal naming the manifest path; never treated as "version unknown, proceed" |
| EC-START-4 | `--dry-run` on a machine that would refuse on rung 5 only | composition proceeds and prints; rung 5's finding is reported, not fatal (§4.2) |
| EC-START-5 | `--plugin-root` naming a directory with no skills tree | rung 1 passes on the override, rung 4 refuses naming every unreadable identifier |
| EC-START-6 | a prompt file present but empty | treated as unreadable by rung 4 — an empty prompt would dispatch an agent with no role |
| EC-START-7 | plugin ships a prompt file no module dispatches | reported, not refused (§4.4 Direction B) |
| EC-START-8 | two rungs fail at once | one message lists both; skipped rungs report their reason (BR-START-2) |

### 4.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-06 | rungs run in §4.1's order, and a rung-1 failure leaves rungs 2/4 reported as skipped-with-reason, never passing (BR-START-2) |
| AT-ENG-07 | every failing rung refuses with exit `1` and zero dispatches attempted (BR-START-1) |
| AT-ENG-08 | the handshake refusal text names range, found-version, and remedy (§4.3, AC-3.2) |
| AT-ENG-09 | `doctor`'s reported rungs equal the rungs a run enforces, on the same fixture (BR-START-3) |
| AT-ENG-10 | Direction A refuses on a plugin missing one dispatchable skill's prompt file; Direction B reports without refusing on an extra file (§4.4) |
| AT-ENG-11 | banner and run report both carry `engineVersion` and `pluginVersion` as a pair (§4.3) |
| AT-ENG-12 | EC-START-3…EC-START-8, one case each |

## 5. FSPEC-ENG-03 — Auth posture: startup banner and the per-dispatch assertion

### 5.1 Startup: an ordered first-match mapping

Startup decides the auth posture from **inspectable state only** — the process environment and the
Claude Code settings files — and never by issuing a probe dispatch, because a probe costs the very
tokens the check exists to protect (C-1a). The mapping is AC-2.1's, restated here as the behaviour
a banner test transcribes:

| # | Inspectable startup state | Outcome |
|---|---|---|
| 1 | `CLAUDE_CODE_OAUTH_TOKEN` set in the environment | banner `auth.oauth-token`, start proceeds |
| 2 | no `ANTHROPIC_API_KEY`, logged-in settings state present | banner `auth.session`, start proceeds |
| 3 | `ANTHROPIC_API_KEY` present **and** the opt-in flag passed | banner `auth.api-key-optin`, start proceeds |
| 4 | `ANTHROPIC_API_KEY` present, flag not passed, logged-in settings state present | banner `auth.session-key-ignored`, start proceeds, key unused |
| 5 | `ANTHROPIC_API_KEY` present, flag not passed, no subscription credential | refusal `auth.api-key-refused`, exit `1`, no banner |
| 6 | none of the above | banner `auth.unknown`, start proceeds; the first dispatch decides |

**BR-AUTH-1 — first match wins, and row 6 makes the list total.** The rows are not disjoint
predicates: a machine with both an OAuth token and an API key matches rows 1, 3 and 4, and row 1
decides. Every reachable state lands on exactly one row, so "the banner said nothing about auth" is
not a possible outcome.

**BR-AUTH-2 — the banner reports no transport auth source.** No `apiKeySource` value exists before
a dispatch (M-ENG-04), so the banner never carries one. The per-dispatch value is a §5.3 observable
that reaches the operator through the run report.

**BR-AUTH-3 — the banner also carries the effective base URL.** With headroom's ambient environment
present that is `http://127.0.0.1:8787`. A bypassed proxy is therefore visible in the first lines
of output rather than discovered hours later from a missing trace (G-4, C-2).

### 5.2 The startup refusal (row 5)

*Who:* the operator. *Given* `ANTHROPIC_API_KEY` present and no subscription credential the engine
can inspect, *when* any dispatching command is run, *then* the engine dispatches nothing, exits
`1`, and its message names both the refusal (`auth.api-key-refused`) and the opt-in flag that would
permit the run. Zero tokens are billed reaching that decision (AC-2.2).

*Given* the same state **with the flag passed**, the run proceeds and the banner carries
`auth.api-key-optin` — the operator has taken the billing decision explicitly, which is the only way
this engine ever bills pay-per-token.

### 5.3 Per dispatch: the fail-closed assertion

Startup passing says nothing about how the transport will actually authenticate, because the
transport reports its auth source only from *inside* a call (M-ENG-04). So every dispatch asserts,
before the model is billed, that the transport-reported source is in the **allowed policy set**:

| Invocation | Allowed policy set | On a value outside it |
|---|---|---|
| without the opt-in flag | exactly the transport's "no API key" report — `"none"` on the primary transport, the fallback's equivalent | the dispatch is aborted before billing, naming the **raw reported value**; the run stops (§8.4) |
| with the opt-in flag | the API-key-backed sources as well | proceeds |

**BR-AUTH-4 — an unrecognised source is never mapped.** A transport reporting a source the engine
does not recognise is treated as outside the allowed set and named verbatim in the failure; it is
never coerced onto a banner id and never assumed benign (AC-6.4(b)).

**BR-AUTH-5 — asserted per dispatch, not once per run.** The check runs on every dispatch, and the
observed source is recorded per dispatch in the run report (§12.2). A run that recorded one source
at its first dispatch and assumed it for the rest cannot detect a credential that changes mid-run,
which is exactly the long unattended run this engine exists to enable.

**BR-AUTH-6 — passing §5.1 and stopping at the first dispatch is a correct outcome.** The two checks
read different evidence; the ordering is intended, not a gap (C-1).

### 5.4 The paired positive (AC-2.4)

The dangerous shape of "no key was needed" is an assertion by absence. §5.3's record makes it
positive:

*Given* an operator whose subscription auth is logged-in settings state with
`CLAUDE_CODE_OAUTH_TOKEN` **absent** — the state that selects row 4 of §5.1's first-match list,
since a token present would have matched row 1 — and `ANTHROPIC_API_KEY` also present, *when* the
run is made **without** the opt-in flag, *then*: the banner carries `auth.session-key-ignored`,
every dispatch reports a no-API-key source **and completes**, and the run report records that
source once per dispatch. The negative ("the key was not used") is thereby paired with two
positives on the same run — a completing dispatch and a recorded source.

### 5.5 Edge cases

| # | Case | Behaviour |
|---|---|---|
| EC-AUTH-1 | `ANTHROPIC_API_KEY` set to an empty string | treated as absent — an empty key cannot bill; the row that ignores it decides |
| EC-AUTH-2 | settings files unreadable (permissions) | the settings-derived evidence is unavailable, so rows 2/4 cannot match; the first-match list falls through to row 5 or 6 and the reason is reported |
| EC-AUTH-3 | both `CLAUDE_CODE_OAUTH_TOKEN` and `ANTHROPIC_API_KEY` present, no flag | row 1 — banner `auth.oauth-token`; §5.3 still decides at the first dispatch |
| EC-AUTH-4 | transport reports no auth source at all | outside the allowed set; dispatch aborted naming "absent" (BR-AUTH-4) |
| EC-AUTH-5 | the source changes between dispatch *n* and *n+1* | dispatch *n+1* aborts; the report shows both values (BR-AUTH-5) |
| EC-AUTH-6 | opt-in flag passed on a machine with no API key at all | permitted set is wider, nothing else changes; the run behaves as row 1/2 would |
| EC-AUTH-7 | an auth failure reported by the transport mid-run | never retried; the run stops naming the source (§8.4, AC-4.4) |

### 5.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-13 | each of §5.1's six rows, one fixture environment each, yields its banner id or refusal — including the overlap cases that prove first-match (BR-AUTH-1, EC-AUTH-3) |
| AT-ENG-14 | row 5 refuses with exit `1`, names the flag, and attempts zero dispatches (AC-2.2, §5.2) |
| AT-ENG-15 | the banner carries no transport-reported auth source, and does carry the effective base URL (BR-AUTH-2/3) |
| AT-ENG-16 | AC-2.4's paired positive: banner id, a completing dispatch, and one recorded source per dispatch (§5.4) |
| AT-ENG-17 | a fixture whose reported source is outside the allowed set aborts that dispatch before billing, naming the raw value (BR-AUTH-4) |
| AT-ENG-18 | a fixture whose source changes at dispatch 3 of 5 stops there, with both values in the report (BR-AUTH-5, EC-AUTH-5) |
| AT-ENG-19 | EC-AUTH-1, EC-AUTH-2, EC-AUTH-4, EC-AUTH-6, one case each |

## 6. FSPEC-ENG-04 — Skill resolution and prompt composition

### 6.1 Where prompt text comes from

The plugin is the **sole delivery vehicle** for skill prompts and stays that way: prompt files are
not packaged inside the engine, so `/pdlc:*` skills keep working in interactive sessions unchanged
(G-5). At dispatch time the engine reads the requested skill's prompt file from the located plugin
and inlines its text into the composed prompt.

**BR-SKILL-1 — resolved from disk, not invoked as a capability.** A composed prompt contains no
instruction to invoke the Skill tool and no `pdlc:` namespace reference. The plugin is a source of
bytes the engine controls end to end, never an in-session capability the dispatched agent must
resolve (A-ENG-01 records the rejected alternative).

**BR-SKILL-2 — one composed prompt, both transports.** The same composed text is what either
transport receives. A behavioural difference between the primary and fallback transports may exist
in how a dispatch is *made*; it may not exist in what the agent is *told*.

**BR-SKILL-3 — the supplements are conditional, and their condition is the module's.** The two
`se-implement` language supplements are inlined when the module's dispatch asks for them. The
engine adds no language-detection policy of its own.

**BR-SKILL-4 — read at dispatch time.** Prompt bytes are read for the dispatch that needs them, so
a plugin upgraded between two runs takes effect on the next run without an engine step. (Whether
reads within one run are cached is a TSPEC concern; the observable this section fixes is that no
run inlines prompt text from a plugin other than the one the startup handshake approved.)

### 6.2 What a composed prompt contains

A composed dispatch descriptor carries, as operator-inspectable content:

| Part | Content |
|---|---|
| skill identifier | the identifier the module named |
| inlined prompt text | the full text of that skill's prompt file from the located plugin |
| task text | the module's own dispatch prompt, unmodified by the engine |
| model | the value the module pinned, forwarded verbatim (§7.3) |
| environment | the parent environment extended (§7.1) |
| working directory | the consumer repo root (§7.2) |
| permission posture | the one engine-wide setting (§7.4) |

The engine composes; it does not edit. It adds no instruction of its own to the module's task text
beyond what this table names, because prompt semantics are the modules' and the skills' business
(NG-8: a needed prompt rewrite is an obligation, never a silent engine-side edit).

### 6.3 The dry-run surface

`--dry-run` is the inspection surface AC-3.1 assumes (O-5): it resolves the plugin, runs the startup
ladder, composes the dispatch(es), prints the composed prompt, and dispatches nothing. It is the
mechanism by which every claim in §6.2 is checkable without billing a token, and by which the model
map of §7.3 is exercised over descriptors rather than executed calls.

**BR-SKILL-5 — dry-run inertness is asserted, not assumed.** On the dry-run path an attempted
dispatch is a failure the surface reports, not a silently-executed call (§3.1).

### 6.4 Coverage: every skill, not a sample

AC-3.1 requires the composition assertion for **each** member of the dispatchable skill set, not a
sample, so a skill whose prompt file was renamed or whose composition path is special (the
supplements) cannot hide behind a passing sample. The set the assertion ranges over is the
dispatchable set of §4.4 Direction A — the identifiers the modules can dispatch, plus the two
supplements — and §4.4's erratum about AC-3.5's reference set applies here identically.

### 6.5 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-SKILL-1 | prompt file deleted between startup and a later dispatch | that dispatch fails as a transport-independent engine error naming the identifier and path; it is not silently dispatched with empty role text |
| EC-SKILL-2 | prompt file present but empty at dispatch time | same as EC-SKILL-1 — an empty role is never dispatched (cf. EC-START-6) |
| EC-SKILL-3 | a module dispatches an identifier startup did not know about | engine error naming the identifier; never a best-effort dispatch with no prompt |
| EC-SKILL-4 | the plugin is upgraded mid-run | the run continues against the plugin version the handshake approved; a version change is discovered by the next run's handshake, not mid-run (BR-SKILL-4) |
| EC-SKILL-5 | prompt text itself contains a `pdlc:` reference (skill prose, not an engine instruction) | permitted — BR-SKILL-1 constrains what the *engine* adds; auditing prompt prose that assumes runtime mechanics is R-5's audit, recorded as an obligation (NG-8) |
| EC-SKILL-6 | `--dry-run` where a dispatch is attempted anyway | reported as a failure of the run (BR-SKILL-5) |

### 6.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-20 | for **every** member of the dispatchable set (§6.4), the composed prompt contains that prompt file's full text (AC-3.1) |
| AT-ENG-21 | no composed prompt contains a Skill-tool instruction or an engine-added `pdlc:` reference (BR-SKILL-1) |
| AT-ENG-22 | the composed prompt for the same dispatch is identical across transports (BR-SKILL-2) |
| AT-ENG-23 | the `se-implement` supplements appear exactly when the module's dispatch asks for them (BR-SKILL-3) |
| AT-ENG-24 | `--dry-run` prints composed prompts and executes no dispatch; an attempted dispatch fails the run (BR-SKILL-5, EC-SKILL-6) |
| AT-ENG-25 | EC-SKILL-1…EC-SKILL-4, one case each |

## 7. FSPEC-ENG-05 — What a dispatch carries: environment, working directory, model, permissions

### 7.1 Environment: extended, never constructed

**BR-ENV-1 — the dispatch environment is always the parent environment extended.** It is never
assembled from a list of variables the engine believes are needed. On the primary transport this is
the environment handed to the SDK for the call; on the fallback it is the inherited child
environment. The distinction is the whole of G-4: a proxy variable the engine has never heard of
still reaches the model call.

**BR-ENV-2 — the proxy variables are carried through untouched.** `ANTHROPIC_BASE_URL` and
`ANTHROPIC_CUSTOM_HEADERS` are never set, unset, or rewritten by the engine (C-2). The effective
base URL is reported in the banner (§5.1) and the run report (§12.2).

**BR-ENV-3 — asserted for every dispatch, not the first.** A long run that drifted its environment
after dispatch 1 would bypass the observability the operator depends on; the assertion ranges over
all dispatches of a run (AC-2.3).

### 7.2 Working directory

**BR-CWD-1 — every dispatch runs with the consumer repo root as its working directory** (C-3), so
every artifact path the modules use resolves consumer-relative exactly as it does under the
workflow runtime (AC-2.5). `--cwd` selects that root; absent the flag it is the process's working
directory. The engine's own install location never becomes a dispatch's working directory, on
either transport.

### 7.3 Model forwarding

**BR-MODEL-1 — forwarded verbatim, whatever the value.** The model a module pins for a dispatch
reaches the transport untranslated. The engine holds no model table, no alias map, and no fallback
list, and substitutes no default of its own for a value it does not recognise; the transport owns
alias resolution and owns rejection of an unknown alias (C-7). A module that gains a model tier
needs no engine change.

**BR-MODEL-2 — the map is a test fixture, never an engine table.** The pinned model map and the
five-configuration corpus that exercises every one of its rows are **M-ENG-07** in
`docs/_constraints/pdlc-engine-baseline.md`, cited by id and not re-carried here. The comparison is
a **set-equality in both directions** over that corpus — every descriptor's model value appears in
the map, and every map row is exercised by at least one descriptor — so a phase that silently stops
pinning a model fails the check (AC-3.3).

**BR-MODEL-3 — the corpus is over recorded descriptors, not executed calls.** A descriptor exists
when a dispatch is composed, so the whole corpus is reachable from dry runs and hermetic
fixture-driven runs; no row of the map depends on billed traffic (AC-6.1, AC-3.3).

### 7.4 Permission posture

**BR-PERM-1 — one named setting, applied uniformly.** The permission posture each dispatch carries
(allowed tools, bypass level) comes from a single named, reviewable engine setting on either
transport. No call site carries its own escalation (C-6). "Which posture is in force" is therefore
answerable by reading one value, and the run report records the value in force (§12.2).

### 7.5 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-DISP-1 | parent environment has no proxy variables | nothing is invented; the banner reports the transport's default endpoint as effective |
| EC-DISP-2 | `ANTHROPIC_CUSTOM_HEADERS` holds a value the engine cannot interpret | carried through unmodified — the engine is a courier, not a validator, for these two variables (BR-ENV-2) |
| EC-DISP-3 | module pins a model the transport rejects | the transport's rejection surfaces as a dispatch outcome (§8.1); the engine neither retries with a different model nor substitutes one (BR-MODEL-1) |
| EC-DISP-4 | module pins no model for a dispatch | the dispatch carries no engine-chosen model; the transport's own default applies, and the descriptor records "unpinned" rather than a fabricated value |
| EC-DISP-5 | `--cwd` names a path that is not a git repository | engine refusal before dispatch — the pipeline's own git operations would otherwise fail deep inside a phase |
| EC-DISP-6 | a map row of M-ENG-07 is unreachable in the corpus | the set-equality check fails; the fix is the corpus or the map, both M-ENG-07's, never a loosened oracle (BR-MODEL-2) |

### 7.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-26 | every dispatch of a multi-dispatch fixture run receives both proxy variables unmodified, alongside the rest of the parent environment (AC-2.3, BR-ENV-1/3) |
| AT-ENG-27 | the engine never sets or unsets either proxy variable, including when they are absent (BR-ENV-2, EC-DISP-1) |
| AT-ENG-28 | every dispatch's working directory is the consumer repo root, on both transports (AC-2.5) |
| AT-ENG-29 | set-equality between the corpus's descriptor model values and M-ENG-07's map, both directions, over recorded descriptors only (AC-3.3, BR-MODEL-2/3) |
| AT-ENG-30 | an unrecognised model value is forwarded, not substituted (BR-MODEL-1, EC-DISP-3) |
| AT-ENG-31 | the permission posture of every dispatch equals the single named setting; a fixture adding a per-call-site override fails (BR-PERM-1) |
| AT-ENG-32 | EC-DISP-4, EC-DISP-5, one case each |

## 8. FSPEC-ENG-06 — Dispatch outcome taxonomy, retry, and timeout

### 8.1 The six-member catalogue

Every dispatch outcome lands in **exactly one** member of this closed catalogue (AC-4.1):

| Member | Means | Engine's response |
|---|---|---|
| `ok` | the dispatch completed and its output parsed | hand the result to the module |
| `retryable` | rate limit, overload, transport interruption | retry within budget (§8.2) |
| `timeout` | no output for the declared timeout | retry at most once, from the same budget (§8.2) |
| `auth-failure` | the transport reported an auth problem, or §5.3's assertion failed | stop the run (§8.4) — never retried |
| `transport-contract-violation` | output the engine cannot parse | no retry; the run stops as an engine failure (exit `1`) |
| `agent-reported-failure` | the dispatch ran and the agent reported failure | hand it to the module — this is the modules' business, not the engine's |

**BR-FAIL-1 — the catalogue is closed and the classifier is total.** Set-equality is asserted
between the classifier's possible outputs and these six; a seventh member is a change to this
section and to AC-4.1, never a configuration. Unrecognised output classifies as
`transport-contract-violation` — never as success, and never as `retryable` (a retry loop over
output nobody can parse burns the wall clock without a path to progress).

**BR-FAIL-2 — `agent-reported-failure` is not the engine's to interpret.** The modules already own
what a failed agent response means for a phase (re-dispatch, round exhaustion, POSTMORTEM). The
engine classifies it, records it, and passes it through unchanged.

### 8.2 The retry state machine

Two budgets interact, and their interaction is the whole of this subsection:

- **The attempt budget** — `dispatch.retryAttempts` (default 3 retries after the first attempt).
- **The one-timeout cap** — a dispatch is retried after at most **one** `timeout`, ever.

**BR-RETRY-1 — timeouts draw from the same budget and never reset it.** A `timeout` retry is one of
the `dispatch.retryAttempts` retries, not an extra one.

**BR-RETRY-2 — the cap is per run of a dispatch, not per attempt position.** Once a dispatch has
been retried after one `timeout`, a second `timeout` anywhere in its remaining attempts is terminal
even with budget left.

**BR-RETRY-3 — backoff is `dispatch.retryBackoff`** (default: exponential from 30 s, capped at
15 min), and **every pause is recorded** in the run report (§12.2), so an unattended run's wall
clock is explainable afterwards rather than mysterious.

At the default of 3, the observable sequences and their outcomes (AC-4.2's table, which a test
transcribes row by row):

| Observed sequence | Total attempts | Terminal classification |
|---|---|---|
| `retryable` × 3, then success | 4 | `ok` |
| `retryable` × 4 | 4 | `retryable`, budget exhausted |
| `timeout`, then success | 2 | `ok` |
| `timeout`, `timeout` | 2 | `timeout`, terminal (second timeout is never retried) |
| `retryable`, `timeout`, then success | 3 | `ok` |
| `timeout`, `retryable`, `retryable` | 3 | non-terminal — a retry of the budget is still owed, so a fourth attempt follows |
| `timeout`, `retryable`, `retryable`, `retryable` | 4 | `retryable`, budget exhausted |
| `retryable`, `timeout`, `timeout` | 3 | `timeout`, terminal (the cap, not the budget, ends it) |

**BR-RETRY-4 — retries are per dispatch, not per phase.** A dispatch that succeeds on attempt 3
leaves the next dispatch of the same phase with a full budget; nothing accumulates across
dispatches.

### 8.3 Exhaustion: routed through the modules' own failure path

**BR-RETRY-5 — the engine never invents a pipeline outcome.** When retries are exhausted the
failure is handed to the module, which halts the phase with its normal POSTMORTEM and halt-row
semantics (AC-4.3). Both halves are observable:

- *Positively*: the halt artifacts exist — the POSTMORTEM file, the `halted` queue row, its
  pathspec-scoped commit. Their existence is what proves the engine process stayed alive long
  enough to record the halt.
- *Negatively*: the set of child processes the engine started is empty at exit, and the engine
  itself did not crash. On the primary transport that set is empty by construction (no child is
  spawned); on the fallback it is over the children it spawned.

The process then exits `2` (BR-EXIT-1) — a halt, not a crash.

### 8.4 `auth-failure` is never retried

*Given* an `auth-failure` mid-run, *when* it occurs, *then* the run stops and the message names the
auth source that failed (AC-4.4). No backoff, no second attempt: a retry loop against a dead
credential burns exactly the wall clock an unattended queue run depends on, and the credential will
not heal itself within a 15-minute backoff. §5.3's assertion failure is classified here, so a
transport that begins reporting an API-key-backed source mid-run stops the run rather than billing
the remaining dispatches.

### 8.5 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-FAIL-1 | transport emits partially-parseable output (a well-formed prefix, truncated tail) | `transport-contract-violation` — partial output is not a partial success |
| EC-FAIL-2 | rate-limit signal arrives *after* a usable result | the result is `ok`; the rate-limit signal is recorded as a pause note, not a failure |
| EC-FAIL-3 | `dispatch.retryAttempts` configured to 0 | no retries; the first `retryable` is terminal, and the report still carries the (empty) retry row set |
| EC-FAIL-4 | a `timeout` on the very last attempt of the budget | terminal `timeout`; the cap and the budget agree |
| EC-FAIL-5 | the transport is unavailable altogether (SDK import fails, `claude` binary absent) | engine failure, exit `1` — this is a host problem, not a pipeline outcome |
| EC-FAIL-6 | a retry succeeds after a pause longer than the phase's own expectations | `ok`; the pause is in the report, and no module-visible behaviour changes |
| EC-FAIL-7 | the engine is killed mid-run (host reboot, operator ^C) | nothing special is owed: all state is artifact-derived in the consumer repo, so re-invoking resumes exactly as it does today (G-6) |

### 8.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-33 | set-equality between the classifier's possible outputs and the six members (AC-4.1, BR-FAIL-1) |
| AT-ENG-34 | unrecognised output classifies as `transport-contract-violation`, never `ok`, never `retryable` (BR-FAIL-1, EC-FAIL-1) |
| AT-ENG-35 | each of §8.2's eight sequences, one fixture each, yields its stated attempt count and terminal classification (AC-4.2) |
| AT-ENG-36 | a dispatch succeeding on attempt 3 leaves the next dispatch a full budget (BR-RETRY-4) |
| AT-ENG-37 | every pause appears in the run report with taxonomy member, phase, attempt number, and delay (BR-RETRY-3, §12.2) |
| AT-ENG-38 | exhaustion yields the halt artifacts, an empty child-process set at exit, no engine crash, and exit `2` (AC-4.3, §8.3) |
| AT-ENG-39 | an `auth-failure` fixture stops the run with the source named and zero retries attempted (AC-4.4) |
| AT-ENG-40 | EC-FAIL-2…EC-FAIL-6, one case each |

## 9. FSPEC-ENG-07 — Guard parity for engine-dispatched agents

### 9.1 The invariant that must survive the host change

Under the plugin, one PreToolUse hook refuses deletion of a `CROSS-REVIEW-*`, `CODE_REVIEW-*` or
`ADVISORY-*` file unless `LEARNINGS-{f}.md` exists on the branch. That guard is the only thing
standing between a harvest-order mistake and the permanent loss of every review round's findings.
The engine dispatches agents outside a Claude Code session, so the guard does not come along by
itself.

**BR-GUARD-1 — the guard travels with the engine's own dispatch configuration.** Every engine
dispatch carries the guard from configuration the engine itself supplies, on **whichever transport
the run uses**. It is never left to whatever hooks a plugin install happens to have registered on
the host (C-5). The mechanism differs per transport and is O-2's to decide; the invariant does not.

**BR-GUARD-2 — the guard is not a blanket ban.** Once `LEARNINGS-{f}.md` exists, deletion of those
files succeeds — that is Phase H doing its job (AC-5.2). A guard that refused unconditionally would
make harvest impossible and would be discovered only at the end of a long run.

**BR-GUARD-3 — provenance is the asserted property.** The proof that the guard belongs to the
engine is an assertion made **with no pdlc hooks registered** on the host: the refusal must still
happen. An assertion made on a host where the plugin's hooks are live proves nothing about the
engine (AC-5.1).

### 9.2 Behaviour

*Given* an engine-dispatched agent working in a repo where `LEARNINGS-{f}.md` does not exist,
*when* it attempts to delete a `CROSS-REVIEW-*`, `CODE_REVIEW-*` or `ADVISORY-*` file, *then* the
deletion is refused, the agent sees the refusal (so it can proceed differently rather than
silently continuing), and the file survives on disk. *Given* the same repo once `LEARNINGS-{f}.md`
exists, *when* harvest deletes those files, *then* the deletions succeed.

**BR-GUARD-4 — this is the largest open safety gap at HEAD.** M-ENG-06 records that no hook or
settings wiring exists in the engine yet, on either transport. Until §9's tests are green on both
transports, an engine run can delete review history that the plugin path would have protected —
which is why a plan should schedule this before any unattended use.

### 9.3 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-GUARD-1 | host has the plugin's hooks registered as well | the refusal still happens; the test that matters runs with them absent (BR-GUARD-3) |
| EC-GUARD-2 | deletion attempted through a shell pipeline rather than a direct command | the guard's coverage is the invariant, not a command spelling; a form that evades it is a defect of the mechanism O-2 selects |
| EC-GUARD-3 | `LEARNINGS-{f}.md` exists but is untracked / uncommitted | the existing guard's own definition of "exists on the branch" governs; the engine changes no part of that definition (NG-1) |
| EC-GUARD-4 | the guard configuration cannot be applied on a transport | that transport is unusable for a real run: the engine refuses to dispatch rather than running unguarded (fail-closed, C-5) |
| EC-GUARD-5 | a non-matching file is deleted (source file, scratch file) | unaffected — the guard's file classes are unchanged (NG-1) |

### 9.4 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-41 | with no pdlc hooks registered on the host, an engine-dispatched deletion of each of the three protected classes is refused when `LEARNINGS-{f}.md` is absent — asserted per transport (AC-5.1, BR-GUARD-1/3) |
| AT-ENG-42 | with `LEARNINGS-{f}.md` present, harvest's deletions succeed — asserted per transport (AC-5.2, BR-GUARD-2) |
| AT-ENG-43 | a transport that cannot carry the guard configuration refuses to dispatch (EC-GUARD-4) |
| AT-ENG-44 | EC-GUARD-1, EC-GUARD-5, one case each |

## 10. FSPEC-ENG-08 — Pipeline parity and the empty consumer read-set

### 10.1 Why parity is preservation, not re-specification

The phase graph, convergence behaviour, round windows, verdict parsing, erratum routing, POSTMORTEM
lifecycle, queue lifecycle, halt-row commits and Phase MERGE ladder are unchanged **because the code
that implements them is unchanged** (G-6). This FSPEC therefore does not restate them; it states the
*oracle* by which "unchanged" is checked, and the two structural facts that keep it true.

**BR-PARITY-1 — the modules are imported, never copied.** Any behaviour the engine cannot express
through the modules' existing injection seams is a change to the modules — in this repo, with tests
— never a patched copy (C-4). Two observables make "not a fork" decidable without a reference copy
to diff against (AC-1.5): (a) the module the engine resolves for each workflow module is the one in
this repo's `pdlc/workflows/` tree; (b) no second file bearing either module's name exists anywhere
under the engine tree.

**BR-PARITY-2 — the seam set the engine supplies differs per module.** It is complete enough that
every dispatch a module makes reaches the engine's transport rather than the modules' own throwing
stub. The exhaustive per-module seam contract is TSPEC's; the behavioural requirement here is that
no dispatch path in either module falls through to the stub (a fall-through is observable as an
engine failure, never as a silent skip).

### 10.2 The parity oracle

*Who:* the operator. *Given* a consumer repo on `feat-{f}` holding `docs/{f}/REQ-{f}.md`, with **no
`.claude/workflows/` directory at all**, the declared queue posture set, and a compatible plugin
installed, *when* they run `pdlc dev docs/{f}/REQ-{f}.md`, *then* the pipeline runs end-to-end
through the phases that repo's config enables and satisfies the structural oracle below.

**BR-PARITY-3 — the oracle is structural, and it needs no comparison run.** Two pipeline runs
dispatch non-deterministic model calls, and a live comparison arm is forbidden in the default suite
(AC-6.1). The oracle is over the *shape* of what a run produces, never over bytes.

**BR-PARITY-4 — the oracle observes creation events, not the surviving tree.** Phase H deletes each
harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` file once the LEARNINGS commit is confirmed on
remote, so every clause below is asserted over each file **as created**; a harvested file's later
absence is not an oracle failure.

The clauses (AC-1.1):

1. **Filenames under `docs/{f}/`** satisfy two rules, because only part of the set is
   run-independent:
   - *(i) set-equality* against the phase-declared core — `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`,
     `LEARNINGS` (`REQ` pre-exists) — for the phases that repo's config enables;
   - *(ii) a rule, not a fixed set*, per run-dependent member: `DECISIONS-{f}.md` iff the run report
     records the Phase-T decision that warrants it; the `CROSS-REVIEW-{role}-{doc}[-v{N}].md` set
     equal to exactly one file per `(role, doc, round)` the run's own recorded round windows name;
     `CODE_REVIEW-{f}-v{N}.md` one file per recorded DoD round, at least one whenever the run
     reaches that phase; `POSTMORTEM-{phase}-{f}.md` iff the run report records a halt of that
     phase; `ADVISORY-{f}.md` iff the advisory tier is enabled, which this posture leaves off.
   - No filename outside (i) and (ii) may appear: the set is closed under both rules.
2. Every `CROSS-REVIEW-*` file carries a parseable `VERDICT:` line and a counts object.
3. Approval anchors are present on each cross-review that reached a terminal approval.
4. The feature's queue row holds one of the lifecycle values the modules write (`in-progress`,
   `awaiting-merge`, `halted`), with its pathspec-scoped commit.
5. The run report carries every field the modules already produce, plus the engine fields of §12.2.

### 10.3 The consumer read-set

*Given* the same repo, *when* the run is observed at the filesystem level for its whole duration,
*then* all three hold **on that same observed run**:

| Clause | Observable |
|---|---|
| (a) | at least one read of a skill prompt file under the located plugin's skills tree |
| (b) | at least one read of the consumer's `docs/{f}/REQ-{f}.md` |
| (c) | the set of paths opened under the consumer's `.claude/workflows/` is **empty** |

**BR-READ-1 — clause (c) is unconditional for a `pdlc dev` run.** The dev module has no drift gate
of any kind, so no path under `.claude/workflows/` is reachable from it at all. The consumer-config
opt-out AC-1.1's *Given* fixes is what keeps clause (c) true for a **`pdlc queue`** run, whose
module does evaluate a drift gate: the config-side opt-out is evaluated *before* any drift-state
read and short-circuits it, so the gate that C-4 forbids forking costs the engine no read under
that directory rather than one permitted read. Without the opt-out, the same queue run is
**expected** to be blocked by the gate and the drift-state read is then observable — a different
posture, not this clause's. (AC-1.2 attributes the dev-run clause to the queue module's gate; that
attribution is raised as an erratum, §13 O-ENG-2.)

**BR-READ-2 — what the engine *does* read is stated, so clause (c) is not vacuous.** The consumer's
own `docs/**` and `.claude/pdlc.config.json`, and reads inside the engine install and the located
plugin's skills tree, are all expected.

**BR-READ-3 — nothing is written into the consumer on the engine's account.** The engine ships no
installer and writes no engine-owned file into a consumer repo; it neither repairs nor reports on
`.claude/workflows/` (NG-7). A project's existing copy is irrelevant to an engine run.

### 10.4 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-PAR-1 | consumer repo *has* a populated `.claude/workflows/` tree | irrelevant: same run, same read-set, no report about it (BR-READ-3) |
| EC-PAR-2 | consumer has no `.claude/pdlc.config.json` at all | the modules' own defaults govern; the engine adds no config of its own to the repo |
| EC-PAR-3 | a queue run without the config-side opt-out on a repo with drift recorded | blocked by the module's own drift gate, reported as the module reports it — correct, and not an engine failure |
| EC-PAR-4 | a phase disabled by the consumer's config | its artifacts are absent from clause 1(i)'s expected set; the oracle is over *enabled* phases |
| EC-PAR-5 | a dispatch path reaches the modules' throwing stub | engine failure naming the seam that was missing, exit `1` — never a silently skipped phase (BR-PARITY-2) |
| EC-PAR-6 | a second copy of a workflow module appears under the engine tree | AC-1.5's anti-fork check fails the engine's own suite (BR-PARITY-1) |

### 10.5 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-45 | the five structural clauses of §10.2 over one hermetic fixture run, asserted over creation events (AC-1.1, BR-PARITY-3/4) |
| AT-ENG-46 | clause 1(ii)'s rules: a run recording a Phase-T decision has `DECISIONS`, one without has none; the cross-review set matches the recorded round windows exactly (AC-1.1) |
| AT-ENG-47 | the three read-set clauses on one observed run, including the empty set under `.claude/workflows/` for a `pdlc dev` run with no opt-out configured (AC-1.2, BR-READ-1) |
| AT-ENG-48 | a `pdlc queue` run with the opt-out configured opens no path under `.claude/workflows/`; without it, the run is blocked by the module's gate (BR-READ-1, EC-PAR-3) |
| AT-ENG-49 | the anti-fork pair: resolved module locations and the absence of a second copy (AC-1.5) |
| AT-ENG-50 | no engine-owned file is created under a consumer repo across a full fixture run (BR-READ-3, NG-7) |
| AT-ENG-51 | EC-PAR-1, EC-PAR-4, EC-PAR-5, one case each |

## 11. FSPEC-ENG-09 — Queue driving and `--loop`

## 12. FSPEC-ENG-10 — The run report and the closed message catalogue

## 13. Open questions

## 14. Linked Requirements

## 15. Behavioral Flow

## 16. Business Rules

## 17. Edge Cases and Error Scenarios

## 18. Acceptance Tests

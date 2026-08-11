---
feature: pdlc-headless-engine
---

# FSPEC — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md`, v0.8) |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.2 | 2026-08-11 |

**Change note, v1.2** (upstream re-grounding, no new content): REQ v0.8 landed the Phase-F erratum
round, so all five §13.1 items are resolved upstream and M-ENG-06 is total over the REQ's criteria
with a three-state vocabulary. §2 now defers to that table (AC-2.3, AC-4.4 and AC-4.1's
set-equality half are **partially green**, each naming its unasserted half) instead of stating
AC-2.3's state itself, and the upstream cell cites v0.8. No decision or rule changed.

**Change note, v1.1** (round 1, addressing `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v1`):
the parity oracle's hermetic double and fixture-fixed expectations (BR-PARITY-5/6), the report's
delivery surface and `transport` field (BR-REP-0, §12.2), the named observable behind "logged-in
settings state" (BR-AUTH-0, M-ENG-08) and the literal auth policy sets (§5.3), rung 0 of the ladder
(BR-START-0), the exit-code order (BR-EXIT-3), the diagnostic-command exemption (BR-CMD-1), the
guard's production permission posture (BR-PERM-2, BR-GUARD-5), observables for the two remaining
set-equalities (BR-FAIL-1, BR-MSG-1) and the hermeticity trap (BR-VER-1), the pause-delay table
(BR-RETRY-3), what an engine-fatal stop leaves behind (BR-FAIL-3), and two further errata
(O-ENG-4/5). Decisions taken in v1.0 are unchanged.

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

M-ENG-06 now records a third state, **partially green**, for a criterion whose asserted and
unasserted halves differ; each such row names its unasserted half, and that named half is what this
document schedules. AC-2.3 is one of them (green for the single-dispatch spread at
`pdlc/engine/lib/transport.mjs:159`, `:168`, asserted at `__tests__/transport.test.js:170`; red for
BR-ENV-3's every-dispatch quantifier, §7.1), as is AC-4.4 (§8.4) and AC-4.1's set-equality half
(§8.1, AT-ENG-33). The table is total over the REQ's criteria, so it — not this section — is the
authority: where this restatement and M-ENG-06 drift, a test author transcribes the table.

The measured facts every later section cites by id rather than re-deriving: **M-ENG-01** (the
modules already run in plain Node; `agent()` is the only capability they take from the runtime),
**M-ENG-04** (the SDK completing a call under subscription auth with a reported source of `"none"`,
and the caveat that this records *that* it works, never *why*), **M-ENG-05** (headless `claude -p`
accepts subscription auth), **M-ENG-07** (the pinned model map and the five-configuration corpus
that exercises every row), **A-ENG-01** (Skill-tool invocation considered and rejected).

## 3. FSPEC-ENG-01 — Command surface, invocation grammar, and exit codes

### 3.1 The commands

The engine exposes one executable, `pdlc`, with a closed **operator-visible** command set. Every
command below is that surface; an invocation naming no command, or a command outside the union of
this set and the diagnostic set below, prints usage and exits with the engine-refusal code (§3.3).

| Command | Purpose | Dispatches models? |
|---|---|---|
| `pdlc dev <REQ path>` | run the dev pipeline for one feature (the direct-invocation entry) | yes |
| `pdlc queue` | run the queue driver for one ready feature | yes |
| `pdlc queue --loop` | repeat one feature per iteration until none is ready (§11) | yes |
| `pdlc doctor` | run the startup gate ladder and report every rung, then stop | no |
| any of the above with `--dry-run` | resolve, handshake, compose, print; dispatch nothing | no |

**BR-CMD-1 — the diagnostic commands are named, exempt, and not operator surface.** `pdlc hello`
and `pdlc spike:sdk` exist at HEAD (`pdlc/engine/bin/pdlc.mjs:332`, `:335`; both in `USAGE`, `:41`)
as development diagnostics. They are **exempt from the closed-set assertion** and carry no
obligation of this document — no ladder, no report, no catalogue id — and `spike:sdk` dispatches a
real call, so it is not a non-billing surface. AT-ENG-01's red state is a *third* command name, in
neither §3.1's table nor this exempt pair, being accepted; an addition to either set is a change to
this section.

`pdlc doctor` and `--dry-run` are the two **non-billing** surfaces, and their inertness is a
contract, not an intention: on either path an attempted dispatch is itself a failure the run
surfaces (§6.5, AT-ENG-24).

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
| `--max-iterations <n>` | `queue --loop` | the opt-in iteration bound of BR-LOOP-2; a positive number, else a usage error (EC-Q-5). Shipped at `pdlc/engine/bin/pdlc.mjs:83`, parsed `:303`, rejected `:306-307` |
| `--dry-run-skill <name>` | `dev`, `queue` with `--dry-run` | which skill's composed prompt the dry run prints (default `pm-author`); §6.3 fixes how the every-member assertion of §6.4 is reached over it |

This table is the closed flag surface: a flag outside it is a usage error, and a flag the engine
ships is a row here or a defect. **There is no transport selector.** In this feature every real
run uses the primary transport; the fallback is exercised through recorded fixtures only (§12.4
BR-VER-2), so "which transport ran" is answered by the report's `transport` field (§12.2) rather
than chosen by the operator. Making the fallback runtime-selectable is O-1's, not this document's.

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
| `2` | the pipeline **halted or was blocked** by its own gate — a normal, recorded pdlc outcome | read the POSTMORTEM or the block reason; the run did its job |
| `1` | the **engine** refused or crashed — startup gate, auth policy, bad usage, unparseable transport output | fix the environment; the pipeline never got its chance |

**BR-EXIT-1 — a halt is not a crash.** A halt is a pipeline outcome the modules produce and record
(POSTMORTEM file, `halted` queue row, its pathspec-scoped commit); the engine's job on a halt is to
stay alive long enough for those records to be written and then report `2`. An engine that exits
`1` on a halt has destroyed the operator's ability to distinguish "pdlc stopped and told you why"
from "the host broke".

**BR-EXIT-2 — refusals are `1`, uniformly.** Every startup-gate refusal (§4), the startup billing
refusal (§5.2), and the per-dispatch auth abort (§5.3) exit `1`, because in all of them the
pipeline produced no verdict about the feature.

**BR-EXIT-3 — `queue --loop` reports the worst iteration, under a total order.** "Worst" is
`1` > `2` > `0`: an engine refusal in *any* iteration is the loop's exit code even if a later or
earlier iteration halted; absent a refusal, any halted-or-blocked iteration yields `2`; only an
all-`0` loop exits `0`. The order is total over the three codes, so a loop whose iteration 1 halts
(`2`) and whose iteration 2 refuses (`1`) exits `1` — a broken host outranks a recorded pipeline
outcome, because it is the one an operator must fix before the next cron slot. (§11.3 fixes what
the loop does *next* in each case, which is a separate decision from what it finally reports.)

### 3.4 Edge cases

| # | Case | Behaviour |
|---|---|---|
| EC-CLI-1 | no command given, or an unrecognised command | usage printed, exit `1`; nothing resolved, nothing dispatched |
| EC-CLI-2 | `pdlc dev` with no REQ path | usage printed, exit `1` — the engine does not guess a feature |
| EC-CLI-3 | `pdlc dev` with a REQ path that does not exist under `--cwd` | rung-0 refusal naming the path, exit `1`, before anything is resolved (§4.1) |
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
| 0 | **argument and working-directory validation** | the invocation's flags carry values, and `--cwd` (or the process's working directory) names an existing git repository; for `dev`, the REQ path exists under it | usage error or refusal naming the offending argument or path, exit `1` (EC-CLI-2/3/5, EC-DISP-5) |
| 1 | **plugin resolved** | an installed pdlc plugin is located (or `--plugin-root` / the plugin-root environment override names one) | refusal naming what was searched and both overrides |
| 2 | **plugin manifest readable** | the located plugin's manifest is present and parseable | refusal naming the manifest path and why it failed |
| 3 | **version handshake (C-10)** | the plugin version satisfies the engine's declared compatible range | refusal naming the declared range, the version found (or "not found"), and the remedy |
| 4 | **skill prompts readable** | every prompt file the run can need is present and non-empty (§4.4) | refusal naming each missing or unreadable identifier |
| 5 | **billing posture** | the startup auth mapping of §5.1 does not land on the refusal row | refusal `auth.api-key-refused` naming the opt-in flag |

**BR-START-1 — dispatch nothing until every rung passes.** No model call, and no probe of any kind,
is made while the ladder is running; a failure at rungs 0–4 ends the invocation with exit `1` and
zero tokens billed, and so does a rung-5 failure **on a dispatching path**. The one exception lives
in the rule rather than in prose: under `--dry-run`, rung 5's finding is reported and is *not*
fatal, because that path bills nothing either way (§4.2, EC-START-4). This is what makes a
mis-installed machine cheap to discover.

**BR-START-0 — rung 0 is part of the ladder, and `doctor` runs the part it can.** `pdlc doctor`
takes no REQ path, so it runs rung 0's working-directory half (`--cwd` names a git repository) and
reports the REQ-path half as *not applicable* — never as passing. Without rung 0 in the ladder,
`doctor` would answer "will a run start here?" while ignoring the directory the run would operate
in, which is exactly the dishonesty BR-START-3 exists to prevent.

**BR-START-2 — the ladder is total and reports every rung, not the first failure.** Two broken
things (say, an absent plugin *and* an API key with no subscription credential) produce one message
listing both, because an operator fixing a cron host one round-trip at a time is the failure mode
this rule exists to prevent. Rungs whose evidence is unavailable because an earlier rung failed
report as *skipped, with the reason* — never as passing.

Rung 0 is inside this rule, not before it: a rung-0 **refusal** on a well-formed command (a `--cwd`
that is not a git repository, a `dev` REQ path that does not exist — EC-CLI-3, EC-DISP-5) reports
rungs 1–5 as skipped-with-reason in the same message, and emits the report line (BR-REP-0). A
**usage error**, which never became a command, is outside the ladder entirely: usage on stderr,
exit `1`, no rung report and no report line (BR-REP-0a). `doctor` inherits both behaviours
unchanged, since it is the same ladder (BR-START-3).

**BR-START-3 — `doctor` is the same ladder, not a second implementation.** Any divergence between
what `doctor` reports and what a run's start enforces is a defect: `doctor` exists to answer "will a
run start here?" and only a shared ladder can answer that honestly. `doctor` is the surface AC-2.1
requires — the startup posture readable **without starting a run** — so it dispatches nothing, bills
nothing, and its report names three fields: the `engineVersion`/`pluginVersion` pair (§4.3), the
effective base URL, and the auth catalogue id rung 5's mapping lands on (§5.1). Reporting the rungs
without those three would answer "did the ladder pass?" rather than AC-2.1's question.

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
prompt files the installed plugin holds **for those identifiers** — in both directions, checked
before any dispatch. The equality is scoped to the **dispatchable subset**, never to the plugin's
whole `skills/` tree, because the plugin also delivers skills only an operator invokes
interactively, which no module dispatches (`REQ-pdlc-headless-engine.md:493-507`). Within that
scope both directions are satisfiable on a correct install, and both **fail closed**:

- **Direction A (dispatchable ⊆ readable), enforced.** Every skill identifier a module can dispatch
  has a present, non-empty prompt file in the located plugin, and the two `se-implement` language
  supplements are present. A failure names each missing identifier and refuses (exit `1`).
- **Direction B (readable ⊆ dispatchable), enforced over the same scope.** A prompt file the plugin
  holds **for a dispatchable identifier** that the engine cannot dispatch names that identifier and
  refuses (exit `1`). A prompt file belonging to an operator-invoked skill is **outside the scoped
  set**: it is reported, and does not refuse. The distinction is membership of the modules-derived
  identifier set, never a judgement about the file.

The intent is unchanged — a missing, renamed, or unreachable prompt file is discovered at startup,
not mid-run by the phase that needed it — and it now holds symmetrically: neither an identifier
without a file nor a file the engine cannot reach can pass the rung silently.

**BR-START-4 — the count is never the assertion, and the identifier set is checked against the
modules.** Neither direction is expressed as "17" or any other number: a count passes on a plugin
whose files have been renamed underneath it. The reference set is the identifiers **both** modules
can dispatch — the union, for every command, so `pdlc dev` and `pdlc doctor` gate identically and a
queue-only skill missing from the plugin is discovered before the queue run that needs it. Whether
the engine derives that set from the modules or declares it and verifies the declaration against
them is TSPEC's; what this rule forbids is a declaration **no check ties to the modules**, since
that is a second place to forget a skill. (At HEAD the probe is one-direction containment over the
frozen 17-name `EXPECTED_SKILLS` list, `pdlc/engine/lib/startup.mjs:20` — red against this rule, as
M-ENG-06 records.)

### 4.5 Edge cases

| # | Case | Behaviour |
|---|---|---|
| EC-START-1 | no plugin installed anywhere | rung 1 refusal naming both overrides; exit `1`, nothing dispatched (AC-3.2) |
| EC-START-2 | plugin present, version outside the declared range | rung 3 refusal naming range, version found, remedy (AC-3.2) |
| EC-START-3 | plugin present, manifest unparseable | rung 2 refusal naming the manifest path; never treated as "version unknown, proceed" |
| EC-START-4 | `--dry-run` on a machine that would refuse on rung 5 only | composition proceeds and prints; rung 5's finding is reported, not fatal (§4.2) |
| EC-START-5 | `--plugin-root` naming a directory with no skills tree | rung 1 passes on the override, rung 4 refuses naming every unreadable identifier |
| EC-START-6 | a prompt file present but empty | treated as unreadable by rung 4 — an empty prompt would dispatch an agent with no role |
| EC-START-7 | plugin ships an operator-invoked skill's prompt file, outside the dispatchable set | outside the scoped equality: reported, not refused (§4.4) |
| EC-START-8 | two rungs fail at once | one message lists both; skipped rungs report their reason (BR-START-2) |
| EC-START-9 | a prompt file for a dispatchable identifier the engine cannot dispatch | rung 4 refuses naming that identifier (§4.4 Direction B) |

### 4.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-06 | rungs run in §4.1's order, and a rung-1 failure leaves rungs 2/4 reported as skipped-with-reason, never passing (BR-START-2) |
| AT-ENG-07 | every failing rung refuses with exit `1` and zero dispatches attempted (BR-START-1) |
| AT-ENG-08 | the handshake refusal text names range, found-version, and remedy (§4.3, AC-3.2) |
| AT-ENG-09 | `doctor`'s reported rungs equal the rungs a run enforces, on the same fixture, including rung 0's working-directory half and its "not applicable" REQ-path half (BR-START-0/3) |
| AT-ENG-10 | three fixtures over §4.4's scoped equality: a dispatchable identifier whose prompt file is missing ⇒ refuse, naming it; a prompt file for a dispatchable identifier the engine cannot dispatch ⇒ refuse, naming it; an operator-invoked skill's file present ⇒ pass, reported only (§4.4, EC-START-7/9) |
| AT-ENG-11 | banner and run report both carry `engineVersion` and `pluginVersion` as a pair (§4.3) |
| AT-ENG-12 | EC-START-3…EC-START-9, one case each |

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

**BR-AUTH-0 — "logged-in settings state present" names one inspectable observable.** Rows 2, 4 and
5 turn on it, so it is fixed here rather than left to TSPEC: the evidence is present when
`~/.claude.json` is readable and carries an **`oauthAccount`** record (**M-ENG-08**). Nothing else
counts — settings files carry no credential, and the credential itself is not in any file the
engine reads. Two consequences a test transcribes:

- A fixture selects any row of §5.1 by setting the process environment and pointing `HOME` at a
  scratch directory with, or without, that record. No row is unfixturable.
- **Row 5 refuses on the state it can see, and says so.** On a host whose credential the engine
  cannot observe (another platform, another storage location — M-ENG-08 is one platform's
  measurement, C-9), a run with `ANTHROPIC_API_KEY` present lands on row 5 and refuses; the
  refusal names the path inspected, the opt-in flag, and `CLAUDE_CODE_OAUTH_TOKEN` as the row-1
  route, so the operator has two recourses rather than none (EC-AUTH-8). Widening the evidence set
  as platforms are measured changes M-ENG-08 and this rule, never a silent special case.

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

| Invocation | Allowed policy set (literal) | On a value outside it |
|---|---|---|
| without the opt-in flag | `{"none"}` — the primary transport's "no API key" report (M-ENG-04) | the dispatch is aborted before billing, naming the **raw reported value**; the run stops (§8.4) |
| with the opt-in flag | `{"none", "user", "project", "org", "temporary"}` | proceeds |

Both sets are literal and closed, matching the policy the shipped CLI passes to the transport
(`pdlc/engine/bin/pdlc.mjs:93`, `:201-203`). The fallback's own vocabulary is unmeasured (O-1);
until it lands the fallback inherits these sets unchanged, so any value not literally in them is
outside the set and aborts the dispatch — the fail-closed direction, and the transcribed one.

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
| EC-AUTH-2 | `~/.claude.json` unreadable (permissions) or carrying no `oauthAccount` | the evidence is unavailable, so rows 2/4 cannot match; the list falls through to row 5 or 6 and the reason — unreadable vs. absent — is reported (BR-AUTH-0) |
| EC-AUTH-8 | row 5 reached on a host whose credential the engine cannot inspect | still a refusal, but its message names the inspected path, the opt-in flag, and `CLAUDE_CODE_OAUTH_TOKEN`; an operator with a subscription is one environment variable from a run (BR-AUTH-0) |
| EC-AUTH-3 | both `CLAUDE_CODE_OAUTH_TOKEN` and `ANTHROPIC_API_KEY` present, no flag | row 1 — banner `auth.oauth-token`; §5.3 still decides at the first dispatch |
| EC-AUTH-4 | transport reports no auth source at all | outside the allowed set; dispatch aborted naming "absent" (BR-AUTH-4) |
| EC-AUTH-5 | the source changes between dispatch *n* and *n+1* | dispatch *n+1* aborts; the report shows both values (BR-AUTH-5) |
| EC-AUTH-6 | opt-in flag passed on a machine with no API key at all | permitted set is wider, nothing else changes; the run behaves as row 1/2 would |
| EC-AUTH-7 | an auth failure reported by the transport mid-run | never retried; the run stops naming the source (§8.4, AC-4.4) |

### 5.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-13 | each of §5.1's six rows, one fixture environment each — environment variables plus a scratch `HOME` with or without the `oauthAccount` record — yields its banner id or refusal, including the overlap cases that prove first-match (BR-AUTH-0/1, EC-AUTH-3) |
| AT-ENG-14 | row 5 refuses with exit `1`, names the flag, and attempts zero dispatches (AC-2.2, §5.2) |
| AT-ENG-15 | the banner carries no transport-reported auth source, and does carry the effective base URL (BR-AUTH-2/3) |
| AT-ENG-16 | AC-2.4's paired positive: banner id, a completing dispatch, and one recorded source per dispatch (§5.4) |
| AT-ENG-17 | a fixture whose reported source is outside the allowed set aborts that dispatch before billing, naming the raw value (BR-AUTH-4) |
| AT-ENG-18 | a fixture whose source changes at dispatch 3 of 5 stops there, with both values in the report (BR-AUTH-5, EC-AUTH-5) |
| AT-ENG-19 | EC-AUTH-1, EC-AUTH-2, EC-AUTH-4, EC-AUTH-6, EC-AUTH-8, one case each |

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

**BR-SKILL-6 — the dry run prints one skill per invocation; the coverage assertion ranges over the
set.** `--dry-run-skill` names the skill whose composed prompt is printed, defaulting to
`pm-author` (`pdlc/engine/bin/pdlc.mjs:172`, `:189-191`). The surface is deliberately one-at-a-time
— an operator inspecting a prompt wants one prompt — so §6.4's every-member assertion is reached by
**one invocation per member** of the dispatchable set, not by one invocation printing all of them.
AT-ENG-20 is therefore parameterised over the set derived at startup (§4.4 Direction A), and a
member with no invocation is a failing test, not a smaller sample.

### 6.4 Coverage: every skill, not a sample

AC-3.1 requires the composition assertion for **each** member of the dispatchable skill set, not a
sample, so a skill whose prompt file was renamed or whose composition path is special (the
supplements) cannot hide behind a passing sample. The set the assertion ranges over is the
dispatchable set of §4.4 — the identifiers the modules can dispatch, plus the two supplements — the
same modules-derived set AC-3.5's scoped equality ranges over, so a skill outside it (operator-
invoked, dispatched by no module) is outside this assertion too.

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
| AT-ENG-20 | for **every** member of the dispatchable set (§6.4), one invocation each, the composed prompt contains that prompt file's full text (AC-3.1, BR-SKILL-6) |
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

**BR-PERM-2 — the posture in force is the most permissive one, and §9's guard must hold under it.**
At HEAD that value is `bypassPermissions`, with the SDK's paired acknowledgement
(`pdlc/engine/lib/transport.mjs:89`, `:170-175`). Every assertion in this document that a dispatch
is constrained — the delete guard above all — is therefore asserted on a dispatch composed exactly
as §6.2 and this subsection compose it, permission posture included. An assertion made under a
stricter test-only posture proves the configuration is well-formed and nothing about a production
dispatch (§9.1).

### 7.5 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-DISP-1 | parent environment has no proxy variables | nothing is invented; the banner reports the transport's default endpoint as effective |
| EC-DISP-2 | `ANTHROPIC_CUSTOM_HEADERS` holds a value the engine cannot interpret | carried through unmodified — the engine is a courier, not a validator, for these two variables (BR-ENV-2) |
| EC-DISP-3 | module pins a model the transport rejects | the transport's rejection surfaces as a dispatch outcome (§8.1); the engine neither retries with a different model nor substitutes one (BR-MODEL-1) |
| EC-DISP-4 | module pins no model for a dispatch | the dispatch carries no engine-chosen model; the transport's own default applies, and the descriptor records "unpinned" rather than a fabricated value |
| EC-DISP-5 | `--cwd` names a path that is not a git repository | rung-0 refusal before anything is resolved (§4.1), and one `doctor` reports — the pipeline's own git operations would otherwise fail deep inside a phase |
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

**BR-FAIL-1 — the catalogue is closed and the classifier is total, and both directions are
observable.** Set-equality is asserted between the classifier's possible outputs and these six; a
seventh member is a change to this section and to AC-4.1, never a configuration. "Possible outputs"
is made observable the way §7.3 makes the model map observable, not by inspection of source:

- *Forward (outputs ⊆ six).* The classifier's own member set is an **inspectable value** — one
  enumeration the engine exposes to its suite — and every classification asserted over the corpus
  below is a member of it.
- *Reverse (six ⊆ outputs).* A named **provocation corpus** reaches every member at least once:
  a completing fixture (`ok`), a rate-limit fixture (`retryable`), a fixture that emits nothing
  within the timeout (`timeout`), a fixture reporting an out-of-policy auth source (`auth-failure`,
  §5.3), a fixture emitting unparseable output (`transport-contract-violation`), and a fixture whose
  agent response reports failure (`agent-reported-failure`). A member no fixture reaches fails the
  check; the fix is a fixture or this table, never a loosened oracle (cf. EC-DISP-6).

 Unrecognised output classifies as
`transport-contract-violation` — never as success, and never as `retryable` (a retry loop over
output nobody can parse burns the wall clock without a path to progress).

**BR-FAIL-2 — `agent-reported-failure` is not the engine's to interpret.** The modules already own
what a failed agent response means for a phase (re-dispatch, round exhaustion, POSTMORTEM). The
engine classifies it, records it, and passes it through unchanged — **terminal for that dispatch**:
it is never retried and consumes no attempt beyond the one that produced it, so it never appears in
§8.2's sequences. A module that re-dispatches afterwards starts a new dispatch with a full budget
(BR-RETRY-4).

**BR-FAIL-3 — an engine-fatal stop leaves the report and nothing else.** `auth-failure` (§8.4) and
`transport-contract-violation` both end the run at exit `1` without a module halt: **no POSTMORTEM
is written, no `halted` row is committed, and the feature's queue row stays exactly as the modules
last left it** (typically `in-progress`; recovery is the modules' own lifecycle, EC-Q-4). The only
witness is the run report on stdout (§12.1), which carries the dispatches already made and the
classification that stopped the run. This is deliberate — the engine never invents a pipeline
outcome (BR-RETRY-5) and a fabricated POSTMORTEM would be exactly that — but an operator returning
to a repo whose row still reads `in-progress` should know it means "the host stopped", not "the
pipeline is still thinking".

### 8.2 The retry state machine

Two budgets interact, and their interaction is the whole of this subsection:

- **The attempt budget** — `dispatch.retryAttempts` (default 3 retries after the first attempt).
- **The one-timeout cap** — a dispatch is retried after at most **one** `timeout`, ever.

**BR-RETRY-1 — timeouts draw from the same budget and never reset it.** A `timeout` retry is one of
the `dispatch.retryAttempts` retries, not an extra one.

**BR-RETRY-2 — the cap is per run of a dispatch, not per attempt position.** Once a dispatch has
been retried after one `timeout`, a second `timeout` anywhere in its remaining attempts is terminal
even with budget left.

**BR-RETRY-3 — backoff is `dispatch.retryBackoff`, and the delay of each pause is derived by a
fixed ladder** — a transport-supplied retry-after value wins if it is finite and positive; else a
transport-supplied reset time, as the remaining interval; else exponential from the 30 s base,
doubling per pause. Every delay is capped at 15 min, and a jitter of at most 1 s is added (never
subtracted, so the cap is a floor-of-the-capped-case, not a ceiling the jitter breaches). At the
defaults the pause sequence is therefore transcribable, and a test asserts it rather than asserting
"a pause happened":

| Pause | Delay, no transport hint | With a transport retry-after of *d* | With a reset time *t* |
|---|---|---|---|
| 1st | 30 s (+jitter) | *d* (+jitter), capped | *t* − now (+jitter), capped, never negative |
| 2nd | 60 s (+jitter) | *d* (+jitter), capped | as above |
| 3rd | 120 s (+jitter) | *d* (+jitter), capped | as above |
| any | capped at 15 min | capped at 15 min | capped at 15 min |

(Measured at HEAD: `pdlc/engine/lib/adapter.mjs:58-59` for the base and cap, `:75-95` for the
ladder.) **Every pause is recorded** in the run report (§12.2) with its observed delay, so an
unattended run's wall clock is explainable afterwards rather than mysterious: three 30 s pauses and
one 30 s/60 s/120 s sequence are different runs, and the report distinguishes them.

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
| AT-ENG-33 | set-equality between the classifier's inspectable member set and the six, and every member reached by BR-FAIL-1's provocation corpus (AC-4.1, BR-FAIL-1) |
| AT-ENG-34 | unrecognised output classifies as `transport-contract-violation`, never `ok`, never `retryable` (BR-FAIL-1, EC-FAIL-1) |
| AT-ENG-35 | each of §8.2's eight sequences, one fixture each, yields its stated attempt count and terminal classification (AC-4.2) |
| AT-ENG-36 | a dispatch succeeding on attempt 3 leaves the next dispatch a full budget (BR-RETRY-4) |
| AT-ENG-37 | every pause appears in the run report with taxonomy member, phase, attempt number, and delay, and the delays match BR-RETRY-3's table on a three-pause fixture — with no hint, with a retry-after, and with a reset time (BR-RETRY-3, §12.2) |
| AT-ENG-67 | an engine-fatal stop (`auth-failure`, `transport-contract-violation`) writes no POSTMORTEM, commits no `halted` row, leaves the queue row untouched, and still emits the report (BR-FAIL-3, §12.1) |
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

**BR-GUARD-5 — the refusal is asserted under the production permission posture.** The dispatch the
guard is asserted against is composed exactly as §6.2 and §7.4 compose a real one, `bypassPermissions`
included (BR-PERM-2). Whether a PreToolUse-style guard fires *under* that posture is unmeasured on
either transport — it is the first thing O-2 must measure (§13.2), because a guard that the bypass
setting disables would pass every well-formedness test and protect nothing. Until that measurement
exists, §9's tests are the shape of the answer, not the answer.

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
| EC-GUARD-4 | the guard configuration cannot be applied on a transport | that transport is unusable for a real run: the engine refuses to dispatch rather than running unguarded (fail-closed, C-5). Since this feature ships no runtime transport selector (§3.2), a refusal on the **primary** transport is a refusal of the whole engine, and its message says so: it names the missing capability, names the fallback as the known alternative, and states that selecting it is not yet available (O-1/O-2). That is a decision an operator can act on — measure or defer the engine — rather than a silent dead end |
| EC-GUARD-5 | a non-matching file is deleted (source file, scratch file) | unaffected — the guard's file classes are unchanged (NG-1) |

### 9.4 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-41 | with no pdlc hooks registered on the host, an engine-dispatched deletion of each of the three protected classes is refused when `LEARNINGS-{f}.md` is absent — asserted per transport, on a dispatch composed under the production permission posture (AC-5.1, BR-GUARD-1/3/5) |
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

**BR-PARITY-5 — the hermetic double performs the agent's writes, or the oracle is vacuous.** Every
artifact clauses 1–3 observe (`CROSS-REVIEW-*` files, their `VERDICT:` lines, the approval anchors)
is written by the *dispatched agent's* tool calls, never by the modules: the modules compose those
paths into prompts and read the files back, and no module code creates them. A transport double
that merely returns a response string therefore leaves `docs/{f}/` empty and clauses 1–3 pass on
nothing. The double this oracle requires **replays each dispatch's file writes from its fixture**
— for a reviewer dispatch, writing the cross-review file the prompt names, with the fixture's
verdict line and counts object — so the oracle observes creation events that a real agent would
have produced. A double that writes nothing fails AT-ENG-45 rather than passing it; asserting that
is AT-ENG-45's first obligation, before any clause is checked.

**BR-PARITY-6 — expected sets are the fixture's, never the run's own report.** Clause 1(ii)'s
rules are evaluated against what the **fixture fixes** — round windows, DoD rounds, Phase-T
decision, halt — with expected filenames transcribed literally into the test, and the run report
checked *separately* to agree with the same fixture. Deriving the expectation from the report under
test would pass a consistently-wrong run (one that skipped a review round and omitted it from the
report satisfies both halves) — the failure BR-REP-3 already avoids for dispatch counts.

The clauses (AC-1.1):

1. **Filenames under `docs/{f}/`** satisfy two rules, because only part of the set is
   run-independent:
   - *(i) set-equality* against the phase-declared core — `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`,
     `LEARNINGS` (`REQ` pre-exists) — for the phases that repo's config enables;
   - *(ii) a rule, not a fixed set*, per run-dependent member, evaluated against the fixture per
     BR-PARITY-6: `DECISIONS-{f}.md` iff the fixture supplies the Phase-T decision that warrants
     it; the `CROSS-REVIEW-{role}-{doc}[-v{N}].md` set equal to exactly one file per
     `(role, doc, round)` the fixture's round windows name; `CODE_REVIEW-{f}-v{N}.md` one file per
     DoD round the fixture drives, at least one whenever the run reaches that phase;
     `POSTMORTEM-{phase}-{f}.md` iff the fixture halts that phase; `ADVISORY-{f}.md` iff the advisory tier is enabled, which this posture leaves off.
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
of any kind, so it **opens or reads no path** under `.claude/workflows/` — the same vocabulary as
clause (c), and the only claim the observation supports. The module does *name* that directory, as
one member of the Phase-MERGE self-modification guard's prefix list
(`pdlc/workflows/orchestrate-dev.js:48-53`, `:52`), where it is compared against a PR's changed
files and never opened; a source-level "no reference to the path" reading of this rule would fail a
correct engine, and is not what it says. The consumer-config
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
| AT-ENG-45 | first, that a write-less transport double fails this test; then the five structural clauses of §10.2 over one hermetic fixture run whose double replays each dispatch's file writes, asserted over creation events (AC-1.1, BR-PARITY-3/4/5) |
| AT-ENG-46 | clause 1(ii)'s rules against fixture-fixed expectations: a fixture supplying a Phase-T decision yields `DECISIONS`, one without yields none; the cross-review set equals the filenames transcribed from the fixture's round windows; the run report is separately asserted to agree with the same fixture (AC-1.1, BR-PARITY-6) |
| AT-ENG-47 | the three read-set clauses on one observed run, including the empty set under `.claude/workflows/` for a `pdlc dev` run with no opt-out configured (AC-1.2, BR-READ-1) |
| AT-ENG-48 | a `pdlc queue` run with the opt-out configured opens no path under `.claude/workflows/`; without it, the run is blocked by the module's gate (BR-READ-1, EC-PAR-3) |
| AT-ENG-49 | the anti-fork pair: resolved module locations and the absence of a second copy (AC-1.5) |
| AT-ENG-50 | no engine-owned file is created under a consumer repo across a full fixture run (BR-READ-3, NG-7) |
| AT-ENG-51 | EC-PAR-1, EC-PAR-4, EC-PAR-5, one case each |

## 11. FSPEC-ENG-09 — Queue driving and `--loop`

### 11.1 One invocation, one feature

*Given* a queue with a ready row and the §10.3 posture configured, *when* the operator runs
`pdlc queue`, *then* exactly one feature is selected **by the module's own Phase-0 triage** — same
row, same ordering, same blocked/halted handling as the workflow-runtime path (AC-1.3).

**BR-QUEUE-1 — selection is the module's, always.** The engine contributes no ordering preference,
no readiness opinion, and no dependency reasoning. "Which feature runs next" has exactly one
implementation, and it is the one already tested in this repo.

**BR-QUEUE-2 — `forcePhases` is not forwarded from the queue path.** A queue run is unattended; a
forced re-run is always a direct `pdlc dev` invocation (mirroring the workflow-runtime rule, NG-1).

### 11.2 `--loop`

`pdlc queue --loop` replaces `/loop` as the unattended driver (G-7): one ready feature per
iteration, repeating until no ready row remains, then exiting `0`.

**BR-LOOP-1 — termination is a decidable condition, not a count.** The loop ends when the module
reports no ready feature. It does not stop because a fixed number of iterations elapsed.

**BR-LOOP-2 — an iteration bound, if offered, is opt-in and reported.** Where an invocation passes
an explicit maximum-iteration bound, reaching it is a *distinct, reported* termination reason —
"bound reached, ready work may remain" — never reported as "no ready work remains". An unattended
operator who cannot tell those two apart will believe a queue is drained when it is not. Absent the
flag, the loop is bounded only by BR-LOOP-1. (AC-1.3 admits no bound at all while the shipped CLI
exposes one; the reconciliation is raised as an erratum, §13 O-ENG-3.)

**BR-LOOP-3 — the loop does not swallow an iteration's outcome.** Each iteration's outcome
(completed, halted, blocked, engine refusal) is recorded per iteration, and §3.3's BR-EXIT-3 fixes
what the loop finally exits with.

**BR-LOOP-4 — what the loop does next per outcome:**

| Iteration outcome | Loop's next move | Why |
|---|---|---|
| completed | continue to the next ready feature | the normal path |
| halted | continue to the next ready feature | the halt is recorded on that feature's row; other features are independent work |
| blocked by the module's own gate (e.g. drift) | stop | the block is a property of the repo, not of the feature; the next iteration would hit it identically |
| engine refusal (startup, auth) | stop | the host is broken; every further iteration would refuse the same way, burning the cron slot on identical failures |

### 11.3 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-Q-1 | queue file absent or unparseable | the module's own handling surfaces; the engine invents no empty queue |
| EC-Q-2 | queue has rows, none ready | exit `0` immediately, reporting "no ready work" — not an error |
| EC-Q-3 | every ready feature halts in turn | the loop runs them all, records each halt, and exits `2` (BR-EXIT-3, BR-LOOP-4) |
| EC-Q-4 | a feature's row is `in-progress` from a killed earlier run | the module's own lifecycle handling governs; the engine re-invokes nothing on its own initiative |
| EC-Q-5 | `--loop` with an explicit bound of 0 or a non-numeric value | usage error, exit `1` — never silently treated as unbounded |
| EC-Q-6 | new ready rows appear (human edits the queue) while the loop runs | picked up on the next iteration, since selection re-reads the queue each iteration |
| EC-Q-7 | `--dry-run` with `--loop` | one iteration's composition is printed and the loop stops: a dry run that iterated forever would never terminate, since no feature's state advances |

### 11.4 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-52 | `pdlc queue` selects exactly the row the module's triage selects, on a multi-row fixture with dependencies (AC-1.3, BR-QUEUE-1) |
| AT-ENG-53 | `--loop` runs one feature per iteration until none is ready, then exits `0` (AC-1.3, BR-LOOP-1) |
| AT-ENG-54 | a bounded loop that stops at its bound reports a termination reason distinct from "no ready work" (BR-LOOP-2) |
| AT-ENG-55 | each row of BR-LOOP-4's table, one fixture each |
| AT-ENG-56 | the loop's exit code is the worst iteration's (BR-EXIT-3, EC-Q-3) |
| AT-ENG-57 | EC-Q-2, EC-Q-5, EC-Q-6, EC-Q-7, one case each |

## 12. FSPEC-ENG-10 — The run report and the closed message catalogue

### 12.1 What the report is for

The run report is the only artifact an operator reads when a cron'd run finishes at 4 a.m. Its job
is to answer, without a re-run: *what did it do, on whose credential, through which endpoint, how
long did it wait and why, and which pair of versions produced this?*

**BR-REP-0 — the report is emitted as one JSON line, the last line of stdout.** That is its whole
delivery surface: no file is written for it, in the consumer repo or anywhere else (BR-READ-3,
NG-7). Progress lines print above it; the report is always exactly one line and always the last, so
a cron wrapper parses the final line without scanning for a block. Two implications: a run whose
stdout is not captured leaves no witness at all, and a run that died is distinguishable from one
that refused, because a refusal still emits the line (EC-REP-1). This matches the shipped
convention (`pdlc/engine/bin/pdlc.mjs:215-221`, emitted at `:236-237`).

**BR-REP-0a — a usage error is not a refusal, and emits no report line.** The rule above ranges over
invocations the engine parsed into a well-formed command: those the ladder then rejects (rung-0
path and working-directory refusals, EC-CLI-3, EC-DISP-5, and rungs 1–5) always emit the line.
An invocation the engine could not parse into a command at all — an unknown command, a missing
required positional, a value flag with no value (EC-CLI-1, EC-CLI-2, EC-CLI-5) — prints usage on
stderr and exits `1` with **no** report line, because there is no run to report on. This is the
boundary a cron wrapper needs stated: a parseable last line is guaranteed for everything it was
able to invoke, never for a malformed command line. HEAD already behaves this way
(`pdlc/engine/bin/pdlc.mjs:243-247` — usage on stderr, exit code `1`, return before any report).

**BR-REP-1 — the modules' report is extended, never replaced.** Every field the modules already
produce survives verbatim; the engine adds fields alongside them (AC-4.5).

### 12.2 The engine's added fields

| Field | Content |
|---|---|
| engine version | with the plugin version, always as a pair (§4.3) |
| startup auth catalogue id | the §5.1 row that decided |
| transport-reported auth source | **per dispatch** (§5.3), not once per run |
| effective base URL | what §5.1's banner reported (BR-ENV-2) |
| per-phase dispatch counts | how much work each phase cost |
| retry / pause rows | one row per retry and per pause: taxonomy member, phase, attempt number, delay |
| transport | which transport the run's dispatches were made through (**FSPEC-added**, §3.2) |
| effective dispatch tunables | the retry-attempt, backoff and timeout values actually in force (BR-CLI-3; **FSPEC-added** under AC-4.5's "in addition to" clause) |
| permission posture in force | the single named setting's value (BR-PERM-1/2; **FSPEC-added**) |

The six unmarked rows are AC-4.5's own enumeration; the three marked **FSPEC-added** are this
document's, so a test author transcribing AT-ENG-58 does not go looking for them in the REQ.

**BR-REP-2 — an empty set is not a missing field.** A run with zero retries carries an *empty* set
of retry rows. "Field absent" and "nothing happened" must not be the same observation, or a
reporting bug reads as a clean run.

**BR-REP-3 — dispatch counts are observable, not derivable.** For an arbitrary run this FSPEC does
not predict counts; a test asserts their **presence and internal consistency** (counts sum to the
recorded dispatch rows) and asserts exact values only for a fixture run whose dispatch sequence the
fixture fixes.

### 12.3 The closed message catalogue

**BR-MSG-1 — every operator-visible string is a registered catalogue entry.** Every banner line,
refusal, warning and failure message the engine emits is registered and asserted **by id** in the
test harness. Two checks make the catalogue closed in both directions (AC-6.4(a)): an emitted
string with no registered id fails, and a registered id no path can emit fails. The second half is
what keeps the catalogue from accumulating dead entries that make it useless as a review surface,
and it has a named observable rather than a reviewer's judgement: **every emission passes through
one seam the suite observes, ids emitted accumulate across the whole suite, and at the end of the
run the accumulated set is compared to the registered set for equality**. An id no test provoked is
indistinguishable from an id no path can emit, and that is the intended strictness — the fix is a
test that provokes it or the entry's deletion, never an exemption list. (The provocation corpus of
§8.1 BR-FAIL-1 and the six auth rows of §5.1 are already most of the emissions; the residue is
what this check surfaces.)

**BR-MSG-2 — every parse of transport output is a total function.** Every value the engine reads
out of a transport's output — SDK message stream or CLI stdout/stderr alike — has a defined outcome
for malformed input. No ad-hoc pattern-matching over stderr. Two outcomes are pinned by test
(AC-6.4(b)): an unrecognised auth source → dispatch aborted per §5.3, never mapped to a banner id;
unparseable transport output → `transport-contract-violation` per §8.1.

**BR-MSG-3 — catalogue ids are stable, human-readable, and namespaced by concern** (`auth.*` for
the posture ids AC-2.1 fixes, and equivalently for the other concerns). An operator quoting an id
in a bug report must be quoting something greppable.

### 12.4 Verification posture (the report's own testability)

**BR-VER-1 — the default suite is hermetic, and hermeticity is observed, not assumed.** Every test
constructs the transport through the injected seam; a guard fails the suite on any attempt to
construct the real transport (SDK client or a `claude` child spawn); and the suite installs a
**socket-level trap that fails the suite on any outbound connection attempt** (AC-6.1). The trap is
itself asserted — one test deliberately attempts a connection and is expected to trip it — because
a trap that never fires is indistinguishable from one that is not installed. A "we don't call the
network" comment is not this property.

**BR-VER-2 — each transport is tested against recorded fixtures of its own real output** — one
fixture set per transport, since both remain in scope (NG-6) — and refreshing a fixture set against
a newer SDK or CLI version is a documented, repeatable step rather than a rewrite (AC-6.3).

**BR-VER-3 — the live smoke path is opt-in and never part of the default suite.** Behind an
explicit flag it drives one real, small feature end-to-end against a scratch repo and asserts the
same structural set as §10.2, plus the one thing only a live run can show: at least one cross-review
round reaching a parseable terminal verdict produced by a real model call (AC-6.2).

### 12.5 Edge cases and error scenarios

| # | Case | Behaviour |
|---|---|---|
| EC-REP-1 | run halts before any dispatch (startup refusal) | the engine's own block is still emitted, in BR-REP-0's shape — one JSON line, last line of stdout — carrying the version pair, the startup auth id and an empty dispatch set, with no module fields to extend (BR-REP-2) |
| EC-REP-2 | a dispatch's auth source differs from the startup id's implication | both are reported; neither overwrites the other (§5.3) |
| EC-REP-3 | transport reports a rate-limit event with no delay value | the pause row records the observed delay as unknown rather than fabricating a number (BR-MSG-2) |
| EC-REP-4 | a message is emitted from a path with no registered id | the catalogue check fails the suite (BR-MSG-1) |
| EC-REP-5 | a registered id no code path can emit | the catalogue check fails the suite (BR-MSG-1) |
| EC-REP-6 | a test constructs the real transport by accident | the hermeticity guard fails the suite (BR-VER-1) |

### 12.6 Acceptance tests

| Test | Asserts |
|---|---|
| AT-ENG-58 | every field of §12.2 is present on a completed fixture run, alongside every field the modules already produce (AC-4.5, BR-REP-1) |
| AT-ENG-59 | a zero-retry run carries an empty retry-row set, not a missing field (BR-REP-2) |
| AT-ENG-60 | dispatch counts sum to the recorded dispatch rows; a fixed-sequence fixture asserts exact values (BR-REP-3) |
| AT-ENG-61 | catalogue set-equality, both directions, over ids accumulated across the whole suite through the emission seam (AC-6.4(a), BR-MSG-1, EC-REP-4/5) |
| AT-ENG-62 | malformed-input outcomes for every parsed value, including the two AC-6.4(b) names (BR-MSG-2) |
| AT-ENG-63 | the hermeticity guard fails a suite that constructs the real transport; the socket trap fires on a deliberate connection attempt; and no other test attempts one (AC-6.1, BR-VER-1) |
| AT-ENG-68 | the report is one JSON line and the last line of stdout, on a completed run and on a startup refusal alike (BR-REP-0, EC-REP-1) |
| AT-ENG-64 | one fixture set exists per transport and a documented refresh step reproduces it (AC-6.3, BR-VER-2) |
| AT-ENG-65 | the live smoke path runs only behind its flag and asserts §10.2's set plus a real terminal verdict (AC-6.2, BR-VER-3) |
| AT-ENG-66 | EC-REP-1, EC-REP-2, EC-REP-3, one case each |

## 13. Open questions

### 13.1 Raised by this FSPEC against its upstream

Five items were defects in the REQ's own text rather than decisions this FSPEC could take. All five
were emitted as errata, routed in the Phase-F erratum round, and **resolved in REQ v0.8**; the
"interim behaviour" column is what this document assumed while they were open, and each is now the
REQ's own reading rather than this FSPEC's gap-filling. No row below is still open.

| # | Item (resolved in REQ v0.8) | This FSPEC's behaviour, now confirmed upstream |
|---|---|---|
| O-ENG-1 | AC-3.5's set-equality between dispatchable identifiers and plugin prompt files read as unsatisfiable on a correct install, since the plugin ships prompt files no module dispatches (the operator-invoked skills), and the parenthetical count read as a count of files. **Resolved by rescoping, not by weakening:** the equality is over the **dispatchable subset**, both directions fail closed, and the counts (10 identifiers, 12 prompt files, 5 operator-invoked skills outside the set) are an observation of HEAD, never the assertion (`REQ:493-507`) | §4.4: equality scoped to the modules-derived set, Direction A **and** Direction B both refuse; an operator-invoked skill's file is out of set, reported only. §6.4 ranges over the same set; AT-ENG-10 pins all three fixtures |
| O-ENG-2 | AC-1.2 clause (c) justifies an empty `.claude/workflows/` read-set for a **`pdlc dev`** run by citing the **queue** module's drift-gate ordering; the dev module has no drift gate at all, so the cited opt-out is not load-bearing for the observed run — it is load-bearing for AC-1.3's queue run | §10.3 BR-READ-1: clause (c) unconditional for dev, opt-out-dependent for queue |
| O-ENG-3 | AC-1.3 states `--loop` "repeats … until no ready row remains" and REQ §4.1 declares no iteration bound, while the operator-visible loop surface offers an explicit maximum-iteration bound; the two terminations are not distinguishable under the AC as written | §11.2 BR-LOOP-2: bound is opt-in and its termination reason is reported distinctly |
| O-ENG-4 | M-ENG-06's red/green table, relocated from the REQ under pm-author §5e, had **no row for AC-2.3** (environment passthrough) or AC-4.4, while §2 here and the REQ's §1.2a read it as total; both rows now exist and the table is declared total | §2 defers to M-ENG-06's AC-2.3 row (partially green) and names the unasserted half it schedules — BR-ENV-3's every-dispatch quantifier, §7.1. The table, not §2, is the authority |
| O-ENG-5 | `pdlc doctor` was operator-visible surface with **no upstream authority**: no AC, constraint or goal named it. **Resolved inside AC-2.1**, which now requires the startup posture to be readable without starting a run, through a command that dispatches nothing and bills nothing and reports the engine/plugin version pair, the effective base URL, and the auth catalogue id; the command's name and flags are FSPEC's to fix (`REQ:422-426`) | §3.1, §4.1, §4.6: the ladder's read-only surface, named `doctor`, reporting those three fields (§4.1). AC-2.1's diagnostic half now traces to AT-ENG-09/11/24 in §14.1 |

### 13.2 Carried from the REQ, unchanged

These remain open exactly as the REQ states them; this FSPEC neither closes nor narrows them.

| # | Item | Where it bites this document |
|---|---|---|
| O-1 | fallback `claude -p` flag surface measured with fixtures; per-transport model-alias semantics; both transports exercised behind the one seam | §7.3, §12.4 (BR-VER-2's per-transport fixture sets) |
| O-2 | the guard-parity mechanism per transport — and, first, **whether any PreToolUse-style guard fires at all under the `bypassPermissions` posture §7.4 puts in force** (BR-GUARD-5); if it does not, the posture and the guard are one decision, not two | §9 — the largest open safety gap (BR-GUARD-4) |
| O-3 | where engine configuration lives (consumer config vs. engine-global with override) | §3.2 BR-CLI-3's tunables |
| O-4 | token viability and renewal runbook for cron contexts | §5.1 row 1 |
| O-5 | dry-run surface shape | §6.3 |
| O-6 | session-reuse flag design; the seam must not be painted shut | not specified here — fresh-per-dispatch is today's semantics (R-4) |
| O-7 | re-derive the retry defaults from observed unattended load | §8.2's defaults are a starting point, not a measured floor |
| O-9 | whether either transport can distinguish a logged-in session from a token credential from its own reported state | §5.1 vs §5.3 — if it cannot, the startup mapping is the whole answer |

## 14. Linked Requirements

### 14.1 Acceptance criterion → section → tests

| REQ AC | Section | Tests |
|---|---|---|
| AC-1.1 | §10.2 | AT-ENG-45, AT-ENG-46 |
| AC-1.2 | §10.3 | AT-ENG-47, AT-ENG-48 |
| AC-1.3 | §11.1, §11.2 | AT-ENG-52…AT-ENG-57 |
| AC-1.4 | §3.3, §8.3 | AT-ENG-04, AT-ENG-38 |
| AC-1.5 | §10.1 | AT-ENG-49 |
| AC-2.1 | §5.1 (mapping); §4.1, §4.6 (diagnostic surface) | AT-ENG-13, AT-ENG-15, AT-ENG-09, AT-ENG-11, AT-ENG-24 |
| AC-2.2 | §5.2 | AT-ENG-14 |
| AC-2.3 | §7.1 | AT-ENG-26, AT-ENG-27 |
| AC-2.4 | §5.4 | AT-ENG-16 |
| AC-2.5 | §7.2 | AT-ENG-28 |
| AC-3.1 | §6.2, §6.4 | AT-ENG-20, AT-ENG-21, AT-ENG-23 |
| AC-3.2 | §4.1, §4.3 | AT-ENG-08, AT-ENG-12 |
| AC-3.3 | §7.3 | AT-ENG-29, AT-ENG-30 |
| AC-3.4 | §7.4 | AT-ENG-31 |
| AC-3.5 | §4.4 | AT-ENG-10, AT-ENG-12 |
| AC-4.1 | §8.1 | AT-ENG-33, AT-ENG-34 |
| AC-4.2 | §8.2 | AT-ENG-35, AT-ENG-36, AT-ENG-37 |
| AC-4.3 | §8.3 | AT-ENG-38 |
| AC-4.4 | §8.4 | AT-ENG-39, AT-ENG-67 |
| AC-4.5 | §12.1, §12.2 | AT-ENG-58, AT-ENG-59, AT-ENG-60, AT-ENG-68 |
| AC-5.1 | §9.1, §9.2 | AT-ENG-41, AT-ENG-43 |
| AC-5.2 | §9.2 | AT-ENG-42 |
| AC-6.1 | §12.4 | AT-ENG-63 |
| AC-6.2 | §12.4 | AT-ENG-65 |
| AC-6.3 | §12.4 | AT-ENG-64 |
| AC-6.4 | §12.3 | AT-ENG-61, AT-ENG-62 |

### 14.2 Constraints, goals, and non-goals

| REQ item | Where honoured |
|---|---|
| C-1 (auth, two parts) | §5.1–§5.3 |
| C-2 (environment passthrough) | §7.1 |
| C-3 (`cwd`) | §7.2 |
| C-4 (no fork) | §10.1 |
| C-5 (guard parity) | §9 |
| C-6 (permissions from one setting) | §7.4 |
| C-7 (models forwarded, not re-mapped) | §7.3 |
| C-8 (closed string catalogue, total parsing) | §12.3 |
| C-9 (facts measured per platform) | §12.4 (fixtures per transport), §2 (M-ENG-* citations) |
| C-10 (plugin handshake) | §4.1 rungs 1–3, §4.3 |
| G-1, G-3, G-4, G-5, G-6, G-7 | §10.3, §5, §7.1, §6, §10.1, §8/§11 |
| G-2 (canonical modules, run unmodified behind their seams) | §10.1 (BR-PARITY-1/2), §10.4 EC-PAR-5/6 |
| NG-1 (no semantic change) | §10.1, §9.3 EC-GUARD-3/5, §11.1 |
| NG-2…NG-5 | **no section, deliberately** — packaging and install UX (NG-2), retiring the plugin or the sync/drift machinery (NG-3), `pdlc-cli.mjs` (NG-4), and interactive-session UX (NG-5) are each work this document specifies none of. Their honouring is the absence of a section, checkable by finding no clause that reaches for the excluded work: §3.1's command set contains no install, no sync, no probe and no interactive surface |
| NG-6 (both transports in scope) | §6.1 BR-SKILL-2, §9.1, §12.4 BR-VER-2 |
| NG-7 (no new consumer copy) | §10.3 BR-READ-3 |
| NG-8 (no prompt rewrites) | §6.2, §6.5 EC-SKILL-5 |
| R-1…R-6 | §12.3/§12.4 (R-1), §8.2/§12.2 (R-2), §5.3 (R-3), §13.2 O-6 (R-4), §6.5 EC-SKILL-5 (R-5), §4.3 (R-6) |

### 14.3 Coverage direction

Both directions are checked: every AC of the REQ appears in §14.1 with at least one section and one
test, and every section §3–§12 traces to at least one AC or constraint in §14.1/§14.2. Two
behaviours specified here have no AC of their own and are carried as constraints instead — the
loop's per-outcome continuation (BR-LOOP-4, under AC-1.3's "same blocked/halted handling") and the
exit-code triple (BR-EXIT-1…3, under AC-1.4's "distinguishes a halt from a crash").

## 15. Behavioral Flow

§15–§18 add no behaviour. They consolidate what §3–§12 already specify, so the document is readable
as a whole without re-reading ten sections; each entry cites the section that owns it.

### 15.1 One run, end to end

| Step | What happens | Owned by |
|---|---|---|
| 1 | the operator invokes a command; argv is parsed, unknown usage refuses (`1`) | §3 |
| 1a | rung 0: flag values, `--cwd` as a git repository, and (for `dev`) the REQ path's existence | §4.1 |
| 2 | the rest of the ladder runs: plugin resolved → manifest read → version handshake → skill prompts readable → billing posture; any failure refuses (`1`), zero tokens | §4 |
| 3 | the banner prints: version pair, effective base URL, startup auth id | §4.3, §5.1 |
| 4 | the workflow module is loaded and run; the engine supplies the seams it declares | §10.1 |
| 5 | for each dispatch the module makes: compose (skill prompt inlined, task text, model, environment, `cwd`, permission posture, guard configuration) | §6, §7, §9 |
| 6 | assert the transport-reported auth source is in the allowed policy set; outside it → abort before billing | §5.3 |
| 7 | execute; classify the outcome into exactly one of six members | §8.1 |
| 8 | on `retryable` / `timeout`: retry within the attempt budget and the one-timeout cap, recording every pause; on `auth-failure` / `transport-contract-violation`: stop | §8.2, §8.4 |
| 9 | on exhaustion: hand the failure to the module, which halts with its normal artifacts | §8.3 |
| 10 | the run report is written: modules' fields plus the engine's | §12.2 |
| 11 | exit `0` finished / `2` halted / `1` engine refused-or-crashed | §3.3 |
| 12 | under `--loop`: repeat from step 4 for the next ready feature, per BR-LOOP-4 | §11.2 |

### 15.2 Where the run can stop, and what it costs

| Stop point | Cost | Exit |
|---|---|---|
| usage error | nothing resolved | `1` |
| startup ladder rung 1–4 | plugin reads only, zero tokens | `1` |
| startup billing posture (row 5) | zero tokens | `1` |
| per-dispatch auth assertion | zero tokens for that dispatch; earlier dispatches already billed | `1` |
| retry exhaustion | the attempts made | `2` (via the module's halt) |
| module halt for any pipeline reason | whatever the run spent | `2` |
| transport-contract violation, or a mid-run `auth-failure` | the dispatches already made; no POSTMORTEM, no `halted` row, queue row untouched (BR-FAIL-3) | `1` |

### 15.3 Flow invariants

- **I-1** Nothing bills before the ladder passes (§4 BR-START-1).
- **I-2** Every dispatch carries the same seven parts (§6.2), on either transport.
- **I-3** Every dispatch is auth-asserted, environment-extended, `cwd`-pinned, model-forwarded, and
  guard-configured — no dispatch is exempt (§5.3, §7, §9).
- **I-4** Every outcome is classified before anything else happens to it (§8.1).
- **I-5** No pipeline outcome is invented by the engine; halts and queue rows come from the modules
  (§8.3, §11.1).
- **I-6** Nothing engine-owned is written into the consumer repo (§10.3 BR-READ-3).

## 16. Business Rules

### 16.1 Register

| Rule | Statement (abbreviated) | Section |
|---|---|---|
| BR-CMD-1 | `hello` / `spike:sdk` are exempt diagnostics, not operator surface | §3.1 |
| BR-CLI-1 | `--flag value` ≡ `--flag=value` | §3.2 |
| BR-CLI-2 | the billing opt-in is flag-only, per invocation | §3.2 |
| BR-CLI-3 | dispatch tunables come from config and are reported | §3.2 |
| BR-EXIT-1 | a halt is `2`, not `1` | §3.3 |
| BR-EXIT-2 | refusals are `1` | §3.3 |
| BR-EXIT-3 | the loop exits with its worst iteration, `1` > `2` > `0` | §3.3 |
| BR-START-0 | rung 0 is part of the ladder; `doctor` runs the part it can | §4.1 |
| BR-START-1 | dispatch nothing until every rung passes (rung 5 non-fatal on `--dry-run`) | §4.1 |
| BR-START-2 | the ladder is total and reports every rung | §4.1 |
| BR-START-3 | `doctor` is the same ladder | §4.1 |
| BR-START-4 | the count is never the assertion | §4.4 |
| BR-AUTH-0 | "logged-in settings state" is one named observable (M-ENG-08) | §5.1 |
| BR-AUTH-1 | first match wins; row 6 makes it total | §5.1 |
| BR-AUTH-2 | the banner reports no transport auth source | §5.1 |
| BR-AUTH-3 | the banner reports the effective base URL | §5.1 |
| BR-AUTH-4 | an unrecognised source is never mapped | §5.3 |
| BR-AUTH-5 | asserted per dispatch, recorded per dispatch | §5.3 |
| BR-AUTH-6 | passing startup and stopping at dispatch 1 is correct | §5.3 |
| BR-SKILL-1 | resolved from disk, never invoked as a capability | §6.1 |
| BR-SKILL-2 | one composed prompt, both transports | §6.1 |
| BR-SKILL-3 | supplements inlined on the module's condition | §6.1 |
| BR-SKILL-4 | prompt bytes read at dispatch time, from the approved plugin | §6.1 |
| BR-SKILL-5 | dry-run inertness is asserted | §6.3 |
| BR-SKILL-6 | one skill printed per invocation; the assertion ranges over the set | §6.3 |
| BR-ENV-1 | the environment is the parent's, extended | §7.1 |
| BR-ENV-2 | proxy variables untouched | §7.1 |
| BR-ENV-3 | asserted for every dispatch | §7.1 |
| BR-CWD-1 | `cwd` is the consumer repo root | §7.2 |
| BR-MODEL-1 | models forwarded verbatim, never substituted | §7.3 |
| BR-MODEL-2 | the map is a fixture; set-equality both directions | §7.3 |
| BR-MODEL-3 | the corpus is over descriptors, not calls | §7.3 |
| BR-PERM-1 | one named permission setting, uniformly applied | §7.4 |
| BR-PERM-2 | that posture is the permissive one, and §9's guard must hold under it | §7.4 |
| BR-FAIL-1 | six-member closed catalogue, total classifier | §8.1 |
| BR-FAIL-2 | agent-reported failure is the modules' business, terminal for the dispatch | §8.1 |
| BR-FAIL-3 | an engine-fatal stop leaves the report and nothing else | §8.1 |
| BR-RETRY-1 | timeouts draw from the attempt budget | §8.2 |
| BR-RETRY-2 | the one-timeout cap is per dispatch run | §8.2 |
| BR-RETRY-3 | backoff declared; every pause recorded | §8.2 |
| BR-RETRY-4 | budgets are per dispatch | §8.2 |
| BR-RETRY-5 | exhaustion routes through the modules' failure path | §8.3 |
| BR-GUARD-1 | the guard travels with engine dispatch configuration | §9.1 |
| BR-GUARD-2 | the guard is not a blanket ban | §9.1 |
| BR-GUARD-3 | provenance asserted with no plugin hooks registered | §9.1 |
| BR-GUARD-4 | this is the largest open gap at HEAD | §9.2 |
| BR-GUARD-5 | the refusal is asserted under the production permission posture | §9.1 |
| BR-PARITY-1 | modules imported, never copied; anti-fork observable | §10.1 |
| BR-PARITY-2 | seams complete enough that no dispatch reaches the stub | §10.1 |
| BR-PARITY-3 | the oracle is structural, no comparison run | §10.2 |
| BR-PARITY-4 | the oracle observes creation events | §10.2 |
| BR-PARITY-5 | the hermetic double replays the agent's writes, or the oracle is vacuous | §10.2 |
| BR-PARITY-6 | expected sets come from the fixture, never the run's own report | §10.2 |
| BR-READ-1 | empty `.claude/workflows/` read-set, per module | §10.3 |
| BR-READ-2 | expected reads stated, so (c) is not vacuous | §10.3 |
| BR-READ-3 | nothing engine-owned written into the consumer | §10.3 |
| BR-QUEUE-1 | selection is the module's | §11.1 |
| BR-QUEUE-2 | `forcePhases` is not forwarded from the queue path | §11.1 |
| BR-LOOP-1 | termination is a condition, not a count | §11.2 |
| BR-LOOP-2 | an iteration bound is opt-in and distinctly reported | §11.2 |
| BR-LOOP-3 | per-iteration outcomes are recorded | §11.2 |
| BR-LOOP-4 | per-outcome continuation table | §11.2 |
| BR-REP-0 | one JSON line, the last line of stdout; no file | §12.1 |
| BR-REP-1 | the modules' report is extended, not replaced | §12.1 |
| BR-REP-2 | an empty set is not a missing field | §12.2 |
| BR-REP-3 | counts are observable, not derivable | §12.2 |
| BR-MSG-1 | closed catalogue, both directions | §12.3 |
| BR-MSG-2 | every parse is total | §12.3 |
| BR-MSG-3 | ids stable, readable, namespaced | §12.3 |
| BR-VER-1 | hermeticity is observed, not assumed | §12.4 |
| BR-VER-2 | per-transport recorded fixtures, refreshable | §12.4 |
| BR-VER-3 | the live smoke is opt-in only | §12.4 |

### 16.2 Cross-cutting rules

Four rules apply to every section and are the ones a reviewer should check a new behaviour against:

- **Fail closed, and fail cheap.** Every refusal happens before the spend it protects (BR-START-1,
  BR-AUTH-4/5, BR-FAIL-1, EC-GUARD-4).
- **Both transports or neither — as a test-level obligation.** Any obligation stated for one
  transport is stated for the other and asserted against that transport's recorded fixtures
  (BR-SKILL-2, BR-GUARD-1, BR-VER-2). It is not a runtime obligation in this feature: no transport
  selector ships (§3.2), so every real run uses the primary and says so in the report.
- **The engine owns hosting, the modules own the pipeline.** Nothing here decides a pipeline
  outcome (BR-FAIL-2, BR-RETRY-5, BR-QUEUE-1, BR-PARITY-1).
- **Observability is a contract, not a courtesy.** Version pair, auth id and per-dispatch source,
  base URL, and every pause are reported because an unattended run has no other witness (BR-AUTH-3,
  BR-RETRY-3, BR-REP-1/2).

## 17. Edge Cases and Error Scenarios

### 17.1 Index of the per-section tables

| Section | Table | Cases |
|---|---|---|
| §3.4 | command surface | EC-CLI-1…6 |
| §4.5 | startup ladder | EC-START-1…8 |
| §5.5 | auth | EC-AUTH-1…8 |
| §6.5 | prompt composition | EC-SKILL-1…6 |
| §7.5 | dispatch payload | EC-DISP-1…6 |
| §8.5 | taxonomy and retry | EC-FAIL-1…7 |
| §9.3 | guard parity | EC-GUARD-1…5 |
| §10.4 | pipeline parity | EC-PAR-1…6 |
| §11.3 | queue and loop | EC-Q-1…7 |
| §12.5 | report and catalogue | EC-REP-1…6 |

### 17.2 Run-level cases spanning more than one section

| # | Case | Behaviour |
|---|---|---|
| EC-RUN-1 | the plugin is uninstalled while a run is in flight | prompt bytes are read per dispatch (BR-SKILL-4), so a dispatch needing a file it can no longer read fails as an engine error (EC-SKILL-1), never a silent empty prompt; whether an earlier read was cached within the run is TSPEC's and changes only how far the run gets, not what a failed read does |
| EC-RUN-2 | the consumer repo's branch changes underneath the run | the modules' own branch checks govern; the engine introduces no branch policy (NG-1) |
| EC-RUN-3 | disk fills mid-run | writes fail through the modules' own IO paths; the engine reports the failure rather than classifying it as a model-dispatch outcome |
| EC-RUN-4 | two engine runs are started against the same consumer repo | out of scope for this feature: no locking is specified, and the modules' artifact-derived state is what it has always been (G-6). Recorded here so a reviewer sees the gap deliberately rather than by omission |
| EC-RUN-5 | the run is invoked from inside the engine's own repository as the consumer | permitted; nothing distinguishes it — but the self-modification guard the pipeline's own merge phase applies is unchanged (NG-1) |

### 17.3 The direction unhandled cases fall

Every case in this document falls in one direction: **refuse, report, and cost nothing further**.
Unrecognised transport output is a violation, not a success; an unrecognised auth source is outside
the allowed set, not benign; an unreadable prompt file is a failed dispatch, not an empty prompt; a
missing seam is an engine failure, not a skipped phase. A reviewer finding a case in this document
that falls the other way has found a defect.

## 18. Acceptance Tests

### 18.1 The set

AT-ENG-01…AT-ENG-68, defined in §3.5, §4.6, §5.6, §6.6, §7.6, §8.6, §9.4, §10.5, §11.4 and §12.6.
Every test is derivable from its section without asking a question, and every one is hermetic
except AT-ENG-65 (the opt-in live smoke, BR-VER-3).

### 18.2 The three cross-section assertions

Three assertions cannot live in any single section because they range over the whole engine:

- **AT-ENG-X1 — every dispatch, every property.** Over one multi-phase fixture run, assert I-2 and
  I-3 of §15.3 for *every* dispatch: seven composed parts, auth-asserted, environment-extended,
  `cwd`-pinned, model-forwarded, guard-configured. Per-section tests sample; this one quantifies.
- **AT-ENG-X2 — zero spend before the ladder.** Across every refusal path in §15.2 that is marked
  "zero tokens", assert that no dispatch was attempted at all (not merely that none succeeded).
- **AT-ENG-X3 — transport symmetry, over fixtures.** For every obligation stated per transport
  (BR-SKILL-2, BR-GUARD-1, BR-VER-2, §8.3's negative half), assert the primary and fallback
  **recorded fixture sets** produce the same obligation-level outcome. No live fallback run is
  implied: none is selectable in this feature (§3.2), and AT-ENG-65's live smoke is the primary
  transport's alone.

### 18.3 What the suite is required to pin

- Both directions of every set-equality this document names, each with the observable its section
  fixes: the outcome taxonomy over BR-FAIL-1's provocation corpus (§8.1), the model map over
  M-ENG-07's corpus (§7.3), the message catalogue over ids accumulated through the emission seam
  (§12.3), and clause 1(i) of the parity oracle against fixture-fixed expectations (§10.2). No
  set-equality in this document is left to a reviewer's reading of the source.
- Every row of every table a test can transcribe: §5.1's six auth rows, §8.2's eight retry
  sequences and BR-RETRY-3's pause delays, §11.2's four loop continuations, §3.3's three exit codes
  and BR-EXIT-3's order over them.
- The hermeticity guard itself (§12.4 BR-VER-1) — a suite whose guard does not fail on a real
  transport construction is not hermetic, it is merely untested.

### 18.4 Out of scope for this document

Test *implementation* — file layout, doubles, fixture format, and which tests are unit versus
integration — is TSPEC's and PROPERTIES' to decide. This section fixes what must be true, not how
the suite is arranged.

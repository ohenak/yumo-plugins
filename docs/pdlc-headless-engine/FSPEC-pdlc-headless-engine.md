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

## 5. FSPEC-ENG-03 — Auth posture: startup banner and the per-dispatch assertion

## 6. FSPEC-ENG-04 — Skill resolution and prompt composition

## 7. FSPEC-ENG-05 — What a dispatch carries: environment, working directory, model, permissions

## 8. FSPEC-ENG-06 — Dispatch outcome taxonomy, retry, and timeout

## 9. FSPEC-ENG-07 — Guard parity for engine-dispatched agents

## 10. FSPEC-ENG-08 — Pipeline parity and the empty consumer read-set

## 11. FSPEC-ENG-09 — Queue driving and `--loop`

## 12. FSPEC-ENG-10 — The run report and the closed message catalogue

## 13. Open questions

## 14. Linked Requirements

## 15. Behavioral Flow

## 16. Business Rules

## 17. Edge Cases and Error Scenarios

## 18. Acceptance Tests

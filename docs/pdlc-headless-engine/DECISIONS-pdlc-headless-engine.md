---
feature: pdlc-headless-engine
---

# DECISIONS — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` v0.9; `FSPEC-pdlc-headless-engine.md` v1.3; `TSPEC-pdlc-headless-engine.md` v1.5) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 0. Scope of this document

TSPEC v1.5 fixes the mechanism. This document records only the **load-bearing choices inside that
mechanism** — the ones where an alternative was live, where the rejection has a cost, and where a
later reader would otherwise re-open the question from scratch. Each entry states what was decided,
what was rejected and why, what constraint forced the shape, how reversible it is, and what would
make it worth revisiting.

Two classes of thing are deliberately **not** here: TSPEC's open questions (O-ENG-T1…T5, §9.2 there)
are undecided by construction and stay undecided; and design detail with no rejected alternative is
mechanism, not decision, and lives in TSPEC alone.

Project-level decisions under `docs/_decisions/` are treated as settled input, not re-litigated.
DEC-ENG-08 below applies `DEC-ORACLE-01` rather than re-deriving it.

Every code claim below was verified against the working tree at authoring time; `file:line`
citations are to that state.

## 1. Transport

## DEC-ENG-01: The Agent SDK is the primary transport; `claude -p` is built as a fallback but is not runtime-selectable

**Context:** REQ G-5 wants an unattended pipeline that dispatches agents with no Claude Code session.
Two carriers can do that: the in-process Agent SDK (`@anthropic-ai/claude-agent-sdk`, pinned
`^0.3.226` in `pdlc/engine/package.json`, resolved 0.3.226 in the tree) and spawning `claude -p`.
HEAD already ships only the first (`pdlc/engine/lib/transport.mjs`, `queryFn` consumed as a message
stream). The question was whether this feature ships one transport, two, or one with a selector.

**Decision:** Ship the SDK transport as the only path a run takes, and build `lib/transport-cli.mjs`
to the *same* interface (TSPEC §3.4) so the fallback is a tested unit, driven in tests over recorded
fixtures only. `resolveTransport({ env })` returns a constant `kind: "agent-sdk"`; `"cli"` is
reachable only by direct unit construction. Making the fallback selectable stays with O-1.

**Alternatives considered:**

- **Ship only the SDK transport, no CLI module** — rejected because the two carriers differ in
  exactly the places C-2/C-5/C-6 constrain (env passthrough, hook carriage, permission flags), and
  those differences are cheapest to discover while the interface is being written, not after the SDK
  path is the only thing anyone has run. The cost of the rejection is real: `transport-cli.mjs` is
  code with no production caller this feature.
- **Ship a runtime selector (flag or env var)** — rejected, and this is a *reversal* of TSPEC v1.0,
  which had designed one. A selector is only honest once the CLI path has been measured against a
  live `claude` binary on both CI platforms (C-9), and nothing in this feature funds that
  measurement. A selector shipped ahead of the measurement offers operators a switch whose far side
  is unmeasured.
- **Spawn `claude -p` as primary** — rejected: it puts a second process, its stdout framing and its
  own settings resolution between the engine and every dispatch, and the SDK exposes as typed
  options (`hooks`, `permissionMode`, `canUseTool`) what the CLI exposes as flags and temp files.

**Constraints that forced this shape:** C-2 (proxy env reaches every dispatch — satisfied by the
spread at `transport.mjs:159`, never a constructed child env); C-9 (every runtime fact measured per
platform, which is what makes an unmeasured selector unacceptable).

**Reversibility:** Easy in one direction. Because `resolveTransport` already exists and both
transports satisfy one interface, adding the selector is a change to one function plus the
measurement it waits on. Removing `transport-cli.mjs` later is also easy — nothing depends on it.

**Re-evaluation triggers:** O-1 completes the CLI flag-surface measurement; an SDK version bump
breaks the primary path and the fallback becomes the recovery route; a consumer environment forbids
in-process SDK use.

## DEC-ENG-02: There is no failover between transports — an SDK failure is a failure

**Context:** With two transports in the tree, the tempting behaviour is: primary throws, retry on
the fallback. TSPEC v1.0 attributed this rule to a `BR-TRANS-6` that exists in neither REQ nor
FSPEC, so the rule needed an owner; it is recorded here as a design decision (TSPEC §3.4,
**R-TRANS-1**).

**Decision:** No failover, silent or announced. A dispatch failure on the primary transport is
classified by `lib/outcome.mjs` (§5.1) and surfaced. The fallback is never reached by a failure path.

**Alternatives considered:**

- **Automatic failover on transport error** — rejected on evidence-integrity grounds. Every
  downstream oracle in this pipeline reads *files* an agent wrote, and the engine's report attributes
  a run to one transport (`report.mjs:50` today, observed rather than declared after §3.6). If the
  carrier can change underneath a run, every subsequent observation in that run is unattributable to
  a transport, and a per-transport measurement regime (C-9) is unfalsifiable.
- **Operator-triggered failover after a halt** — not rejected so much as *not this feature's*: it is
  the same measurement O-1 owes, and it can be added later without changing anything decided here.

**Constraints that forced this shape:** C-9; and the taxonomy's totality (AC-4.1) — a six-member
closed outcome set means a transport failure already has a name and a report row, so "try the other
one" would be a behaviour that hides a classified outcome rather than one that surfaces it.

**Reversibility:** Easy — it is an absence of code, not a structure.

**Re-evaluation triggers:** A measured SDK failure mode that is both frequent and provably
transport-local (so the fallback is a genuine recovery rather than a second sample of the same
fault); or an operator requirement for unattended completion that outranks per-run attributability.

## 2. Guard parity

## DEC-ENG-03: The shipped hook script stays the guard's only definition — both transports invoke it, and its fail-open interpreter probe is an accepted, probed consequence

**Context:** `pdlc/hooks/scripts/guard-harvest-before-delete.sh` is the plugin path's blocking
`PreToolUse` hook. Under Claude Code the harness runs it; under the engine, something must. The
engine could invoke the script, or reproduce its decision procedure in JavaScript inside the
transport layer where the hook callback already lives.

**Decision:** Invoke the shipped script and consume its exit code, on both transports (TSPEC §6.1,
§6.2). No JavaScript reimplementation. The engine builds one guard configuration and each transport
is an adapter over it.

**Alternatives considered:**

- **Reimplement the decision procedure in JS** — rejected because "the guard exists on the branch"
  would then mean two things that can drift, and the drift is silent: the script's scope test is
  three substrings and one removal-form regex (`guard-harvest-before-delete.sh:35`, `:37`), its
  protected-token extraction is another regex (`:43`, `:49`), and its refusal text is byte-read by
  `orchestrate-dev.js`. A second definition would have to be kept byte-equivalent by review, which is
  the class of obligation this repo has already learned not to take on.
- **Port the script and delete the original** — rejected outright: NG-1, and the plugin path still
  runs the hook for interactive sessions. One definition, two callers.

**Constraint that forced this shape:** C-5 (guard parity) is a parity claim, and parity against a
copy is not parity.

**The consequence this decision accepts, stated rather than inherited.** The script is a bash
wrapper around Python: it probes `python3`, `python`, `py` and, finding none, **exits 0 — allow**
(`guard-harvest-before-delete.sh:14-21`, comment: "If none is available, fail open (allow) rather
than erroring"). Under Claude Code that trade is defensible; a hook that errors on a Windows box
would break every Bash tool call. Under the engine it is not the same trade: an unattended pipeline
on a host without a usable interpreter would run with the guard silently inert, which is exactly the
green-and-vacuous state DEC-ENG-04 exists to refuse. TSPEC §6.1's enumeration of the decision
procedure begins at the JSON parse (`:29-30`) and does not carry this branch, so it is raised as an
erratum rather than folded in here.

**The decision, given that:** the interpreter probe is part of §6.4's startup capability probe, not
a per-dispatch surprise. If the engine cannot obtain an interpreter the shipped script will accept,
the run **refuses at startup** with a catalogue-registered message, on the same fail-closed footing
as a transport that cannot carry the hook at all. The engine does not fix the script's fail-open
posture (that would edit the plugin path's interactive behaviour, NG-1); it declines to *rely* on it.

**Reversibility:** Easy. The probe is one rung-5 check and one catalogue id; changing the script's
own posture later is an independent, plugin-path decision.

**Re-evaluation triggers:** The guard script stops depending on an external interpreter; or M-ENG-09
(DEC-ENG-04) records that the hook mechanism does not fire at all under the production permission
posture, in which case the carrier changes and this decision is re-derived against the new one.

## DEC-ENG-04: An unrecorded guard measurement is a red hermetic suite, not a silent omission

**Context:** `DEFAULT_PERMISSION_MODE = "bypassPermissions"` (`pdlc/engine/lib/transport.mjs:89`),
paired with `allowDangerouslySkipPermissions` as the SDK requires (`:170-174`; `sdk.d.ts:1772`).
Whether a `PreToolUse` hook deny still fires under that mode is **not** settled by the SDK's own
types: `sdk.d.ts:1759` documents bypass as "Bypass all permission checks", while `:4337` says
PreToolUse hook denies "resolve before `canUseTool` runs" and are simply not covered by the
permission-denied event — the two readings are compatible with either answer. So the guard's
well-formedness tests (§6.3) can be green while the guard protects nothing.

**Decision:** The live, opt-in measurement (§6.5) appends a dated `M-ENG-09` row to
`docs/_constraints/pdlc-engine-baseline.md`, and the **hermetic** suite reads it: with no row for the
running platform, the hermetic suite **fails** with a catalogue-registered message naming the
measurement and the command that produces it.

**Alternatives considered:**

- **Live-only test, no durable record** — rejected: on a fresh clone nothing then states whether the
  combination was ever measured, on which platform, or against which SDK version, and C-9 makes
  per-platform measurement a constraint. This repo already records measured runtime facts beside the
  code in exactly this form (`transport.mjs:70-89` is the precedent, and `M-ENG-06`/`M-ENG-07`
  already live in the baseline file).
- **Warn instead of fail when unrecorded** — rejected. A warning on an unattended pipeline is a
  message nobody is present to read, and "unrecorded" is precisely the state in which the guard
  suite is green and proves nothing. The repo has paid for a vacuous green once already.
- **Gate on the measurement without seeding it** — rejected as an ordering error, and the ordering is
  a PLAN obligation: the gate and the first `M-ENG-09` rows (one per CI platform) land in the *same*
  task, or CI goes red for a reason unrelated to the change that turned it red.

**Constraints that forced this shape:** C-9; BR-GUARD-4 (measure before unattended use); AC-6.1
(the hermetic suite is the thing CI runs, so the gate has to live there, not in the live path).

**Reversibility:** Easy per branch, hard in spirit. The gate is one assertion; but if the
measurement comes back `denyFired: no`, §6.5's pre-committed branches bind — either the permission
posture tightens or the guard moves to `canUseTool` (`sdk.d.ts:1404`), and that is a one-way-ish
change to the transport's permission contract.

**Re-evaluation triggers:** The measurement lands (then the branch is taken, not debated); the SDK
documents the hook/bypass interaction normatively; O-ENG-T4 settles the staleness predicate, or
O-ENG-T5 settles what an off-matrix platform does — both of which change this gate's *key*, not its
existence.

## 3. Skills and prompts

## DEC-ENG-05: The dispatchable skill set is derived from the workflow modules' own exports, not declared engine-side and not scanned out of source text

**Context:** Startup rung 4 must check that every skill the pipeline can dispatch is readable, in
both directions (AC-3.5, BR-START-4). HEAD does neither: `lib/startup.mjs:20` probes a frozen
17-name `EXPECTED_SKILLS` list living in the engine, which is a second declaration of a fact the
workflow modules own.

**Decision:** Each workflow module exports its own `DISPATCHABLE_SKILLS`, computed at module load
from the data that already drives dispatch — `PHASE_DISPATCH`'s role fields
(`pdlc/workflows/orchestrate-dev.js:3337`) unioned with the named skill constants — and the engine
imports it. `EXPECTED_SKILLS` goes away. Rung 4 checks set-equality over the **union** of both
modules' sets on every invocation, not just the invoked command's.

**Alternatives considered:**

- **Keep an engine-side list** — rejected: it is exactly the hand-maintained declaration BR-START-4
  forbids, and it is already wrong in both directions (17 names against a derived 10).
- **Scan the modules' source text for skill literals at dispatch call sites** — rejected on measured
  evidence, and this is the alternative that looked cheapest. Only three of the ten identifiers sit
  at a literal `_agent("…")` call site; the rest are reached as `agentFn(SKILL, …)`, as a `skill:`
  object field, or as a module-local constant (`ADVISORY_RUNG_SKILL`, `orchestrate-dev.js:1797`,
  dispatched at `:1841`), and five roles appear **only** inside `PHASE_DISPATCH` rows. A scanner
  honouring "literals at dispatch sites" derives `{ship-pr, se-implement}`; the only repair is to
  loosen the oracle until it stops being one.
- **Per-command scope for rung 4** (`pdlc queue` checks only the queue module) — rejected: `se-review`
  reaches the queue only through the delegated dev pipeline and the advisory seam, so a missing
  `se-review/SKILL.md` would surface mid-run instead of at startup. The union is also free —
  `lib/run.mjs` imports both modules anyway, and the queue module already imports the dev module
  (`orchestrate-queue.js:41`).

**Constraints that forced this shape:** C-4 (the modules are not forked — so the fact must be
*exported* from them, not copied); BR-START-4; AC-3.5's two directions.

**The cost this decision accepts:** the derivation is only as good as the guard against a new bare
literal at a new dispatch site, so the design pairs it with a no-bare-literal test carrying a **closed
allow-list** of non-dispatch literal sites — today exactly the reviewer-role map keys at
`orchestrate-dev.js:6229-6231`. Widening that list is a reviewed spec change, not a regex edit. A
second accepted cost: deleting `EXPECTED_SKILLS` means nothing asserts that the five
operator-invoked-only skills are readable. That is correct rather than lost — the engine can never
dispatch them — but it is recorded here so a later reader does not read the reduction as an
oversight.

**Reversibility:** Easy. The exports are additive; reverting to an engine-side list is a one-file
change (with the old defect restored).

**Re-evaluation triggers:** A dispatch path appears that is not reachable from `PHASE_DISPATCH` or a
named constant; the allow-list needs a second entry (which is the signal that dispatch-site
discipline is eroding).

## DEC-ENG-06: A dispatch inlines the identifier's whole prompt-file set — `SKILL.md` plus every supplement in its directory

**Context:** Direction B of AC-3.5 requires every readable prompt file to be reachable by some
dispatch. `pdlc/skills/se-implement/` holds three files (`SKILL.md`, `SKILL-typescript.md`,
`SKILL-python.md`), and no module names a supplement: under Claude Code the *agent* loads them per
`pdlc/skills/se-implement/SKILL.md`, which a headless dispatch cannot do because it is told no
plugin path. REQ AC-3.5's 12-prompt-file count only closes if something reaches the two supplements.

**Decision:** `composeDispatchPrompt` inlines the dispatched identifier's whole file set, `SKILL.md`
first, each supplement introduced by a fixed delimiter (`--- BEGIN SUPPLEMENT: {basename} ---` /
`--- END SUPPLEMENT: {basename} ---`, matching the existing role-definition delimiter in
`pdlc/engine/lib/skills.mjs`).

**Alternatives considered:**

- **Exempt the supplements from Direction B** — rejected: an exemption list is a place where a real
  unreachable prompt file can hide, and it would have to grow with every future supplement.
- **Rewrite `SKILL.md` so the supplements are not separate files** — rejected: NG-8 (no prompt
  rewrites), and it would change interactive behaviour to serve a headless constraint.
- **Language-conditioned selection** (send only the supplement matching the repo's language) —
  rejected *for now*, and deliberately not pre-empted: it needs a prompt-size measurement first, and
  a manifest to read the language from. Recorded as O-ENG-T3.

**Constraint that forced this shape:** NG-8, plus AC-3.5's set-equality in both directions — this is
the smallest change that closes Direction B without an exemption.

**The cost this decision accepts:** every `se-implement` dispatch carries both language supplements,
including the irrelevant one. Bytes, not correctness.

**Reversibility:** Easy — composition is one function, and the delimiter grammar is asserted, so a
later narrowing has a test to change rather than a convention to guess.

**Re-evaluation triggers:** Measured prompt size becomes a cost (context pressure or billing); a
third language supplement lands; a skill directory acquires a non-prompt `.md` file, at which point
"whole file set" needs a stated membership rule rather than a directory listing.

## 4. Engine-side provenance

## 5. Test mechanics

## 6. Configuration and lifecycle

## 7. Decision index

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

## 0. Context and scope of this document

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

How an engine dispatch actually reaches a model, and what happens when that fails. The two entries
below settle one question jointly: the SDK is the only path a run can take, so a transport failure is
the run's failure rather than a trigger for a second attempt down a different path. DEC-ENG-01 fixes
which transport is live and why the other is still built; DEC-ENG-02 fixes what is *not* built
between them.

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

The shipped hook scripts are a consumer-facing safety property, so the engine must not acquire a
second, drifting copy of them. These two entries keep the `.sh` file authoritative (DEC-ENG-03) and
make the one place that could silently weaken it — an unrecorded measurement — fail loudly instead
(DEC-ENG-04).

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

What the engine is allowed to dispatch, and what text a dispatch carries. Both entries reject a
scan-the-source approach in favour of deriving from structure the workflow modules already expose:
DEC-ENG-05 fixes the dispatchable *set*, DEC-ENG-06 fixes the prompt *bytes* each member contributes.

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

Three entries about facts the engine records for itself without asking the workflow modules to change
shape: which phase a dispatch belongs to (DEC-ENG-07), what the credential posture was at startup
(DEC-ENG-08), and how a finished dispatch is classified (DEC-ENG-09). The common commitment is that
provenance is bought engine-side, from seams that already exist.

## DEC-ENG-07: Phase provenance is bought entirely on the engine side, from the `_phase` seam the modules already call

**Context:** AC-3.3's model map is per *phase* (`Phase I` on Sonnet, everything else Opus), so
asserting it needs each dispatch record to carry the phase it belongs to. The modules do not pass a
phase to `_agent`: they pass `model` and a log-only `label` (`pdlc/engine/lib/adapter.mjs:266-268`),
and `label` is not the phase.

**Decision:** The adapter holds the most recent `_phase(label)` value as run state and stamps it onto
each `DispatchDescriptor`. The seam already exists and the modules already call it — 15 call sites in
`pdlc/workflows/orchestrate-dev.js` (`:9516`, `:9951`, `:10066`, `:10136`, `:10248`, …) — and the
engine's implementation today merely logs (`adapter.mjs:357`).

**Alternatives considered:**

- **Add a `label`/`phase` argument at the modules' dispatch sites** — rejected because it would
  falsify the claim that the only change under `pdlc/workflows/` is the DEC-ENG-05 exports. That
  claim is load-bearing for C-4: it is what makes "the engine does not fork the modules" a statement
  about a two-row diff rather than a promise. Buying the phase from a seam the modules already call
  keeps the diff at two rows.
- **Infer the phase from the skill identifier** — rejected: the mapping is not a function.
  `se-implement` is dispatched from Phase I waves, from Phase DOD remediation and from the PROPERTIES
  wave; `se-author` is both a spec author and the queue's Phase-0 triage agent.

**Constraint that forced this shape:** C-4, read strictly.

**The cost this decision accepts:** the phase is *last-write-wins run state*, so it is only as
accurate as the modules' own `_phase` discipline — and one known wrinkle is already priced in: Phase
I's V-wave announces itself as `"Phase PT"` (`orchestrate-dev.js:10248`) while pinning `sonnet`
(`:10253`). The model-map oracle therefore partitions on a defined Phase-I wave set that includes
that descriptor, rather than on the announced string. Dispatches occurring before any `_phase` call
carry `null`, which is asserted rather than assumed away.

**Reversibility:** Easy, and asymmetric in a useful way: if per-dispatch labels ever become
necessary, they can be added to the modules later without unwinding the run-state mechanism.

**Re-evaluation triggers:** A module dispatches from a code path that announces no phase; concurrent
dispatches within one phase make "most recent" ambiguous (it is not today — `_parallel` fans out
within a single announced phase).

## DEC-ENG-08: Startup auth posture is a new pure module, deliberately independent of the per-dispatch auth assertion

**Context:** Two auth questions look like one. Before dispatching, the operator needs to know which
credential a run will bill (C-1a, AC-2.1/2.2/2.4); during a dispatch, the engine must refuse a
credential the operator did not opt into — which HEAD already does, throwing `AuthPolicyError` when
the SDK's `system/init` message reports an `apiKeySource` outside the policy
(`pdlc/engine/lib/transport.mjs:201-206`, default policy `["none"]` at `:63`).

**Decision:** Add `lib/auth.mjs` as a **pure** function over injected `env` and file evidence
(`readLoginEvidence` / `resolveAuthPosture`, six first-match rows), and keep §3.4's per-dispatch
assertion exactly where it is. Two independent observations, one banner.

**Alternatives considered:**

- **Derive the startup posture from the transport's reported `apiKeySource`** — rejected: it is not
  available before a dispatch exists, so the banner could only be printed after billing had already
  started. That inverts C-1a.
- **Treat the per-dispatch check as sufficient and print no posture** — rejected: AC-2.2 requires a
  refusal *before* a run, and an operator with `ANTHROPIC_API_KEY` set by a shell profile they forgot
  about is the exact case the banner exists for.
- **Fold both into one module** — rejected for a reason recorded as O-9: it is not known whether
  either transport can distinguish a logged-in session from a token credential from its own reported
  state. Keeping the two observations separate means that if the answer is no, the startup mapping
  is still the whole answer and the per-dispatch check remains an honest policy assertion rather than
  a discrimination it cannot make.

**Constraints that forced this shape:** C-1a and C-1b are two constraints, not one; M-ENG-08 fixes
what "logged-in state" is inspectable as (`~/.claude.json` carrying an `oauthAccount` object), which
is a *file* fact and therefore only reachable at startup.

**Reversibility:** Easy. Purity is the enabling property: every row is fixturable by pointing `HOME`
at a scratch directory, so no operator credential is involved in any test, including row 5's refusal.

**Re-evaluation triggers:** O-9 resolves affirmatively (a transport can report the distinction), at
which point the per-dispatch record could subsume part of the startup mapping; the login record's
location or shape changes per platform beyond what M-ENG-08 records.

## DEC-ENG-09: Outcome classification is a policy-free layer-0 module, and the transport stays blind to it

**Context:** HEAD classifies inside the transport, as four error classes it throws
(`AuthPolicyError` `transport.mjs:23`, `RateLimitedError` `:33`, `TimeoutError` `:46`,
`TransportError` `:55`). AC-4.1 requires a six-member closed taxonomy, adding
`transport-contract-violation` and `agent-reported-failure` — and the second of those is not a
transport fact at all: it is a claim about what the agent said.

**Decision:** `lib/outcome.mjs` (new, layer 0) owns one total classifier over a `DispatchResult`.
Transports report what they observed and throw their typed errors; they hold no taxonomy, no retry
policy, no auth verdict, and no knowledge of phases or skills.

**Alternatives considered:**

- **Extend the transport's error classes to six** — rejected: `agent-reported-failure` would force
  the transport to parse agent output, and `transport-cli.mjs` would then have to reproduce that
  parsing to stay at parity — a second definition of a policy, which is the same failure DEC-ENG-03
  refuses for the guard.
- **Classify in the adapter, beside the retry machine** — rejected as a layering choice rather than a
  correctness one: the retry machine is a *consumer* of the classification, and putting both in one
  module makes the taxonomy's totality testable only through a dispatch. As its own module it is
  testable directly, which is what makes the set-equality assertion (observed ≡ the six) cheap.

**Constraint that forced this shape:** AC-4.1's totality plus AC-4.4 (a mid-run `auth-failure` is
fatal and never retried) — a fatal-vs-retryable verdict is policy, and policy above plumbing is the
architecture rule this design already asserts.

**Reversibility:** Easy — one new module with no persisted contract.

**Re-evaluation triggers:** A seventh outcome is needed (the set is closed and asserted, so this is a
spec change, not a code change); a transport reports something the classifier cannot map, which is
itself the `transport-contract-violation` member and should surface, not widen the taxonomy.

## 5. Test mechanics

Two decisions where the *test* design is load-bearing enough to outlive the code it checks: how an
assertion that spans the whole suite accumulates without a shared process (DEC-ENG-10), and how a
guard-parity test is stopped from passing vacuously (DEC-ENG-11). Both exist because the obvious
cheaper mechanism produces a green suite that proves nothing.

## DEC-ENG-10: Suite-wide assertions accumulate through the filesystem, under a run id minted by a runner before any test process exists

**Context:** Three of this feature's oracles are set-equality over *the whole run*: the outcome
taxonomy (six members, AC-4.1), the message catalogue (both directions, AC-6.4), and the model map
(AC-3.3). `node --test` runs each test file in its own child process and gives no ordering guarantee
across files, so a module-scoped accumulator read by a "last" test file holds at most that file's own
contributions. `docs/_decisions/DECISIONS-test-oracle-mechanics.md` DEC-ORACLE-01 already settled the
general form of this — a run-wide assertion cannot live at module level — for jest; the same reasoning
applies unchanged to `node --test`, and this decision applies it rather than re-deriving it.

**Decision:** `package.json`'s `scripts.test` becomes `node __tests__/_run-suite.mjs`, which (1)
mints one `PDLC_TEST_RUN_ID`, (2) creates its run directory empty, removing prior contents, (3)
spawns `node --test --import=./__tests__/_bootstrap.mjs` with that id in the environment so every
test process inherits the one value, and (4) on success only, spawns
`__tests__/_assert-suite-wide.mjs`. Test processes append observation records to that directory;
the final step asserts over them.

**Alternatives considered:**

- **Module-scoped `Set` read by a name-ordered last file** — rejected, and the failure mode is what
  makes it worth recording: it is *asymmetric*. The catalogue's set-equality would fail loudly and
  permanently, while the outcome harness's forward direction (`observed ⊆ OUTCOMES`) would pass
  **vacuously green over the empty set** — precisely what that harness exists to prevent.
- **Mint the run id in the bootstrap "on first use"** — rejected on measurement. `--import` is
  preloaded into every test file's own child process, and those children are siblings: an environment
  variable a child assigns is visible to that child alone. Every file would mint a different id, and
  the assertion step a further one. This fails by construction on every run, and the tempting repair
  under time pressure — scan all run directories, drop the emptiness guard — walks straight back into
  the vacuity. So the id is minted where it can be inherited, not where it is first needed.
- **`PDLC_TEST_RUN_ID=$(…) node --test … && node …` in the npm script** — the same fix, rejected on
  two counts: the assignment is shell syntax `cmd.exe` does not accept (C-9 makes both platforms
  real), and it gives step 2 — clearing the directory so a stale record from an earlier run cannot be
  counted as this run's observation — no ordered home.

**Constraints that forced this shape:** AC-6.1 (the suite is hermetic and CI runs it on both
platforms); the repo's own history of a vacuous green (`consolidation-agent-vacuous-green`).

**The mechanism is itself asserted, per DEC-ORACLE-01's testability note.** Two deliberately separate
test files each write one record, and the final step requires both to be found in **one** run
directory, with exactly one directory for the run. Two directories, or one directory holding one
record, fails. The inheritance property was silently false in an earlier draft, so it is asserted
directly rather than implied by the harnesses that consume it.

**Reversibility:** Easy — three new test-support files and one `package.json` line; no production
code depends on any of it.

**Re-evaluation triggers:** `node --test` gains a supported run-wide hook (a reporter or global
teardown), which would make the filesystem hop unnecessary; the suite grows a case where a record
must survive a *failed* run, which today's "step 4 on success only" ordering deliberately does not
support.

## DEC-ENG-11: Every guard-parity clause carries a falsifying counterpart in the same file, and the deny path performs the deletion it is guarding

**Context:** §6.3's clauses are the kind that pass for the wrong reason. "The file survives" is true
when nobody attempted to delete it; "the refusal reaches the agent" is true of a constant string; and
a green run on a developer machine where the plugin's hooks are live proves the *host*, not the
engine.

**Decision:** Each clause is asserted together with a counterpart that must fail: the deny is paired
with an allow (a `LEARNINGS-{f}.md` present in the directory makes the same call permit the deletion,
AC-5.2, so the guard is conditional and not a blanket refusal); the survival assertion is paired with
the **same fixture and the same deletion step** under an allow verdict, which removes the file; and
the reason-text assertion is paired with a deliberately mis-built configuration (matcher `"Write"`
instead of `"Bash"`, or a hook path pointing at no script) that must produce no deny. The test runs
with no pdlc hooks registered on the host, in a scratch tree with neither settings entries nor an
installed plugin.

**Alternatives considered:**

- **Assert the callback's verdict only, without performing the deletion** — rejected: that is
  precisely the unfalsifiable form, and it is the defect an earlier draft shipped.
- **Drive a real tool call through the SDK to observe the deny end-to-end** — rejected here because
  §7.1 forbids constructing a real client or spawning `claude` in the hermetic suite. The boundary is
  stated rather than papered over: the hermetic suite proves the engine *builds and honours* the
  guard; only DEC-ENG-04's live measurement proves the runtime *consults* it.

**Constraints that forced this shape:** BR-GUARD-3 (provenance — the refusal must be the engine's,
not the host's); AC-6.1's hermeticity.

**Reversibility:** Easy; and the discipline is cheap to keep because the negative half is written
first.

**Re-evaluation triggers:** The live measurement lands and makes an end-to-end hermetic proxy
possible (e.g. a recorded SDK session that replays a tool-use turn); the guard's carrier changes
under DEC-ENG-04's second branch, at which point the counterparts are re-derived against
`canUseTool` rather than a hook matcher.

## 6. Configuration and lifecycle

What an operator can turn, what they can read, and what the engine declines to manage. DEC-ENG-12
gives the one tunable a single resolution point, DEC-ENG-13 closes the set of messages that can reach
an operator, and DEC-ENG-14 records a known concurrency gap as deliberately unclosed rather than
overlooked.

## DEC-ENG-12: The resolved dispatch timeout is an adapter constructor option stamped onto every dispatch, resolved at exactly one point

**Context:** `dispatch.timeoutMinutes` is a REQ tunable and BR-CLI-3 requires the report to carry its
effective value. At HEAD the number cannot reach a dispatch: the adapter assigns `timeoutMs` onto the
options object only when the caller passed one (`pdlc/engine/lib/adapter.mjs:280`), no workflow module
passes one, and the transport therefore always falls back to its constructor default
(`transport.mjs:152`, `DEFAULT_TIMEOUT_MS` at `:64`). An operator-set value would be reported and
enforce nothing — a reported number that no run obeys.

**Decision:** `createAdapter` takes `dispatchTimeoutMs` as a constructor option, on the same footing
as the two tunables it already takes that way (`maxRateLimitPauses` `adapter.mjs:224`,
`retryBackoffBaseMs` `:225`), and the adapter stamps it as `timeoutMs` onto every dispatch's options
object. `resolveTunables({ config, flags })` is the single resolution point, called at both
`createAdapter` sites in `bin/pdlc.mjs` — `:173` (the dry-run surface, whose transport refuses to
dispatch, `:97-101`) and `:205` (the live run path) — and the same return feeds the `tunables` report
block. `doctor` (`:157`) constructs no adapter and is not a third resolution point.

**Alternatives considered:**

- **Leave the transport's constructor default as the only enforcement** — rejected: that is HEAD's
  behaviour and it makes BR-CLI-3's reported value decorative.
- **Have the workflow modules pass `timeoutMs` per dispatch** — rejected: it would put a second row
  under `pdlc/workflows/` in the change set and falsify DEC-ENG-07's premise, for no gain — the
  engine, not the module, owns the operator's tunable.
- **A per-run seam or a second resolver inside `run.mjs`** — rejected: `run.mjs` receives an
  already-built adapter, and two resolution points is how a reported number and an enforced number
  start to differ. One call site returns both, so the identity is structural rather than a convention
  someone must maintain.

**Constraint that forced this shape:** BR-CLI-3, read as an *effective-value* obligation rather than
a display obligation — which is also what makes it testable: the assertion is that the value reaching
the transport equals the value in the report.

**A related, deliberate asymmetry:** `maxTurns` stays a declared-but-unassigned option key. It is
part of the transport's four-key interface but nothing supplies it, so the boundary test asserts
**containment plus two required keys** (`cwd`, `timeoutMs`) rather than set-equality over one call.
Key presence and key *value* are also split on purpose: `adapter.mjs:278` builds `{ cwd }`
unconditionally so the key exists even when the value is `undefined`, and AC-2.5's own test owns the
value.

**Reversibility:** Easy — one constructor option and one assignment.

**Re-evaluation triggers:** A workflow module acquires a legitimate per-dispatch timeout need (long
implementation waves versus short reviews), at which point the stamp becomes a default rather than an
override and the precedence rule has to be stated.

## DEC-ENG-13: No message reaches an operator except through a closed catalogue, and an unknown id throws

**Context:** Operator-visible strings at HEAD are scattered across modules — a remedy block in
`lib/handshake.mjs`, a refusal in `lib/startup.mjs`, a usage block in `bin/pdlc.mjs`. C-8 and AC-6.4
require a closed catalogue with both directions asserted.

**Decision:** `lib/catalogue.mjs` (new, layer 0) holds every refusal, gate reason, pause notice and
exit summary. Emission goes through `message(id, …)`; an unregistered id **throws** rather than
falling back to the raw string, so an unregistered message cannot reach an operator by accident. Ids
are the stable contract; wording is not, and no test asserts prose. Severity is data on the entry, so
the same condition cannot be a warning on one path and a refusal on another.

**Alternatives considered:**

- **A lookup that falls back to the passed string on a miss** — rejected: it makes the closed set
  advisory. The whole value of the catalogue is that "every message an operator can see is reviewed",
  and a fallback is the hole through which an unreviewed one arrives.
- **Assert registered-equals-emitted per test file** — rejected as vacuous the moment a test is
  skipped; the assertion is suite-wide, over DEC-ENG-10's accumulator.

**Constraints that forced this shape:** C-8; AC-6.4's *both directions* (every registered id is
emitted somewhere in the suite, and every emitted id is registered).

**The cost this decision accepts:** every new operator-visible string is now a catalogue edit plus a
suite-wide obligation to emit it at least once — including the ones introduced by DEC-ENG-03's
interpreter probe and DEC-ENG-04's missing-measurement gate. That is the intended friction.

**Reversibility:** Easy structurally, harder socially — once ids are cited by docs and tests, renaming
them is a coordinated change. That is why ids, not wording, are the pinned half.

**Re-evaluation triggers:** A message needs runtime-variable severity; a consumer wants machine-
readable output for messages (at which point the catalogue is already the right place and the change
is a serialisation, not a redesign).

## DEC-ENG-14: Two concurrent runs against one repo are out of scope, and no lock is invented

**Context:** `withCwd` (`pdlc/engine/lib/run.mjs:155`) calls `process.chdir` for the run's duration,
which is process-global — so one process hosts one pipeline at a time by exclusion, not by design
(`cwd` is *additionally* pinned per dispatch at `adapter.mjs:278`, so the agent's own directory is
independent of it). The open case is cross-process: two engine runs against the same worktree share a
git index and a branch.

**Decision:** Record the gap (EC-RUN-4, O-ENG-T2); build nothing. The engine does not detect the
second run.

**Alternatives considered:**

- **An advisory lock file scoped to the repo, refusing the second run with a catalogue-registered
  message** — this is the likely eventual answer and is deliberately *not* built here. No acceptance
  criterion binds it, and a locking protocol invented without a stated requirement is how a lock
  becomes the thing that halts unattended runs at 3am — stale lock, no human, no recovery path.
- **Rely on git's own index lock** — rejected as a mitigation to *claim*: it serialises individual git
  invocations, not pipeline phases, so it converts a data race into an intermittent command failure
  mid-phase. Worth knowing, not worth calling protection.

**Constraint that forced this shape:** none — which is exactly the point. This is a decision to leave
a known gap open rather than close it speculatively, and it is recorded so the gap is not later read
as an oversight.

**Reversibility:** Easy to add; the refusal would be one startup rung and one catalogue id, both of
which now exist as shapes.

**Re-evaluation triggers:** An operator runs the queue and a direct pipeline concurrently and
corrupts a branch (the first real incident should produce the lock, with its stale-lock recovery
path designed at the same time); or per-worktree consumer state (D-DIST-07) lands and makes
concurrent worktree runs a supported workflow rather than an accident.

## 7. Decision index

| ID | Decision | Reversibility | Owning TSPEC § |
|---|---|---|---|
| DEC-ENG-01 | SDK primary, `claude -p` built but not runtime-selectable | easy | §3.4 |
| DEC-ENG-02 | No failover between transports | easy | §3.4 (R-TRANS-1) |
| DEC-ENG-03 | Shipped `.sh` is the guard's only definition; its fail-open interpreter probe is startup-probed | easy | §6.1, §6.2, §6.4 |
| DEC-ENG-04 | Unrecorded `M-ENG-09` measurement ⇒ red hermetic suite | easy per branch; the branch it forces is not | §6.5 |
| DEC-ENG-05 | Dispatchable skill set derived from module exports | easy | §3.3 |
| DEC-ENG-06 | Dispatch inlines the identifier's whole prompt-file set | easy | §3.3 |
| DEC-ENG-07 | Phase provenance from the `_phase` seam, engine-side only | easy | §4.1, §8.3 |
| DEC-ENG-08 | Startup auth posture is a pure module, independent of the per-dispatch check | easy | §3.2, §3.4 |
| DEC-ENG-09 | Outcome taxonomy is a policy-free layer-0 module | easy | §5.1 |
| DEC-ENG-10 | Suite-wide accumulation via filesystem, run id minted by the runner | easy | §7.0, §7.4 |
| DEC-ENG-11 | Every guard clause has a falsifying counterpart; the deny path performs the deletion | easy | §6.3 |
| DEC-ENG-12 | `dispatchTimeoutMs` constructor option, one resolution point | easy | §3.4, §4.6 |
| DEC-ENG-13 | Closed message catalogue; unknown id throws | easy structurally, social once ids are cited | §3.5 |
| DEC-ENG-14 | No concurrency lock; the gap is recorded, not closed | easy to add later | §2.3, §9.2 O-ENG-T2 |

### What is not decided here

TSPEC §9.2's five open questions (O-ENG-T1 CI placement, O-ENG-T2 concurrency — see DEC-ENG-14,
O-ENG-T3 supplement size — see DEC-ENG-06, O-ENG-T4 measurement-key granularity, O-ENG-T5 the
off-matrix platform) remain open. Three of them are maintainer calls about *keys and cost*, not about
mechanism, and each has a named home above: a decision that changes one of them changes a gate's key,
not the gate.

Two REQ/FSPEC-level questions also stay upstream: where engine configuration lives (O-3 — §4.6 fixes
the set, the defaults and the resolution point, so only the *location* is open and no acceptance
criterion depends on it), and whether either transport can distinguish a session from a token
credential (O-9 — DEC-ENG-08 is built to survive either answer).

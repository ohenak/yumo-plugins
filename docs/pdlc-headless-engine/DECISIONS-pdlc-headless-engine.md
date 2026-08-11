---
feature: pdlc-headless-engine
---

# DECISIONS — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` v0.9; `FSPEC-pdlc-headless-engine.md` v1.5; `TSPEC-pdlc-headless-engine.md` v1.5) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.3 | 2026-08-11 |

**Change note, v1.3** (POSTMORTEM-D resolution, Step 3, one sentence): DEC-ENG-03’s authority
paragraph updated — the REQ half landed as C-11 (REQ v0.10, `6ff9871a`, confirmed at round v8),
so the "zero hits in both" claim was half false; the FSPEC half remains outstanding. No other
entry, alternative or consequence table changed.

**Changelog.** v1.2 (round-1 cross-review, pm + te) corrects the record without reversing a decision.
DEC-ENG-03's interpreter refusal no longer *originates* a host precondition, no longer borrows EC-GUARD-4's
message contract, and no longer pins a rung number — all three are filed upstream as errata and the
entry is now explicitly conditional on that authority (pm F-01/F-02/F-03, te F-02). DEC-ENG-04
re-cites BR-GUARD-5/O-2 for the measure-first obligation and states the gate's key (pm F-04, te
F-05). DEC-ENG-05's measurements are corrected against HEAD — the scanner alternative derives five
names, not two; `EXPECTED_SKILLS` is wrong in one direction, not both — and the no-bare-literal
guard is restated in a form that is writable at HEAD (te F-01/F-03/F-04, pm F-06). DEC-ENG-10 scopes
the suite-wide step to unfiltered runs (te F-06); DEC-ENG-11's mis-built arm gains a positive
assertion (te F-07); DEC-ENG-07 states the wave-set oracle's maintenance rule (te F-08). The upstream
pin moves to FSPEC v1.5; v1.4/v1.5 changed BR-MODEL-3's model-map corpus only, which DEC-ENG-07
already reads as hermetic fixture-driven runs, so no decision rested on superseded text (pm F-05).

v1.1 adds §7 (options considered — the rejected alternatives collated across entries)
and §8 (consequences — the costs each decision accepts, split into PLAN obligations and standing
costs), and names §0 as context and scope. No decision changed; the decision index moved to §9.

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
  code with no production caller this feature. Stated plainly for the O-1 decision later: it delivers
  **no operator-visible benefit** in this feature. It cannot be selected at runtime, and it cannot
  rescue the guard cases — DEC-ENG-03 has both transports invoke the same shipped `.sh`, so a host
  that fails the interpreter probe fails on either carrier. Its whole value is the design pressure of
  writing the interface to two carriers, plus a fallback that is already a tested unit if O-1 ever
  funds the measurement that makes it selectable.
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

**The engineering position, and where its authority has to come from.** The engine should not *rely*
on the fail-open branch: it should observe at startup whether an interpreter the shipped script will
accept is obtainable, and refuse the run rather than proceed with a silently inert guard. That is an
engineering judgement about what C-5's parity claim is worth on a host where the script cannot
execute, and it stands.

What this document may not do is *establish* the precondition. Refusing at startup makes a working
interpreter a precondition for running pdlc unattended, and turns a host that previously ran (guard
inert) into a host that cannot run at all — an operator-facing deployability rule. That authority
has now landed for the REQ half: **C-11 (`REQ-pdlc-headless-engine.md:284-298`, v0.10)** is the
constraint that authorises the startup refusal, and this entry **cites** it rather than originating
it. The FSPEC half is still outstanding: `grep -inE "python|interpreter"` over
`FSPEC-pdlc-headless-engine.md` returns zero hits at HEAD, so the EC row with its own rule remains
filed as an erratum. The decision recorded here stays the narrow half that is already ours: *the
engine does not rely on the fail-open branch; the probe's observation is reported at startup rather
than discovered per dispatch.* Whether that observation refuses the run or reports a failed rung is
upstream's call to authorise; the engine does not fix the script's own posture either way (that
would edit the plugin path's interactive behaviour, NG-1).

**Two things this entry deliberately does not settle, because they are not DECISIONS-local:**

- **The message contract is not EC-GUARD-4's.** An earlier draft put this refusal "on the same
  fail-closed footing" as EC-GUARD-4. That row's obligations are fixed and asserted as three separate
  expectations — it "names the missing capability, names the fallback as the known alternative, and
  states that selecting it is not yet available" (`FSPEC:921`, `AT-ENG-43` at `FSPEC:930`). On a host
  with no interpreter the fallback is **not** an alternative: this very decision has both transports
  invoke the same shipped `.sh`, so `transport-cli.mjs` fails identically, and naming it as the known
  alternative would mislead the operator the message is written for. The interpreter case therefore
  needs its own EC row and its own obligations (name the missing interpreter and the candidates
  probed — `python3`, `python`, `py`, `guard-harvest-before-delete.sh:14-21` — and name the remedy),
  with `AT-ENG-43`'s three-obligation assertion scoped to the transport-capability case. Filed as an
  FSPEC erratum.
- **The rung number is not fixed here.** TSPEC says only that the check "belongs to the ladder's rung
  5 *neighbourhood*" (`TSPEC:1306-1307`), and the hedge is load-bearing: FSPEC's ladder assigns rung 5
  to **billing posture** (`FSPEC:292`) and is closed at 0–5 under BR-START-2's totality contract
  (`FSPEC:307-311`, `AT-ENG-06` enumerating "rungs 1–5"), with `RungRecord` pinned to `rung: 0..5`
  and "always all six" (`TSPEC:834`, `:840`). Hardening this probe onto rung 5 would make two
  derivable tests disagree on one fixture — on a host with clean auth and no interpreter, the
  FSPEC-derived rung-5 test passes and a DECISIONS-derived one fails — and would leave `doctor`'s
  `{rung, name, state}` report unable to say which capability failed. It would also silently inherit
  EC-START-4's dry-run non-fatality (`FSPEC:392`) without that being stated as intended. So the
  number stays upstream's: either a distinct rung 6 with its own FSPEC ladder row (so BR-START-2's
  totality can report it) or an explicit redefinition of rung 5 as a two-predicate rung with
  per-cause catalogue ids. Filed as an FSPEC erratum; dry-run fatality is to be stated there, not
  inherited by placement.

**Reversibility:** Easy. The probe is one startup check and one catalogue id, whichever rung the
ladder ends up giving it; changing the script's own posture later is an independent, plugin-path
decision.

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

**Constraints that forced this shape:** C-9; **BR-GUARD-5** (the refusal is asserted under the
production permission posture, `FSPEC:894`) and **O-2**, which is what actually requires the
deny/bypass interaction to be settled first (`FSPEC:1285`); AC-6.1 (the hermetic suite is the thing
CI runs, so the gate has to live there, not in the live path). BR-GUARD-4 is cited here as the *gap
statement* it is — "this is the largest open safety gap at HEAD" (`FSPEC:909`, index row `:1454`) —
not as a measurement obligation; an earlier draft glossed it as one.

**The gate's key, stated so the fixtures are constructible.** A row is `date | platform | transport |
sdkVersion | denyFired` (TSPEC §6.5, `TSPEC:1336`), but the gate keys on **`platform` and `transport`
only**. `sdkVersion` and `date` are recorded as provenance and are *not* part of the lookup: the SDK
is pinned by caret (`"@anthropic-ai/claude-agent-sdk": "^0.3.226"`, `pdlc/engine/package.json:16`),
so a clean install resolving 0.3.227 would otherwise turn a hermetic, offline suite red with no code
change — a gate that fires on `npm i` teaches maintainers to ignore it, which is the same oracle
erosion this decision exists to prevent. The red fixture is therefore "no row whose `platform` and
`transport` match the running pair"; the green fixture is a baseline containing one. Whether a
version *skew* should ever be surfaced (as a warning, not this gate) is O-ENG-T4's staleness
predicate, and O-ENG-T5 owns the off-matrix platform — both change this key, not its existence.

Stated plainly, because it is a product call and not a side effect: with the key as above, a
contributor on a platform outside the CI matrix meets a **red hermetic suite** on first run, and the
remedy is to run the opt-in live measurement and seed their own `M-ENG-09` row — which the failure
message names. That is intended for as long as C-9 makes measurement per-platform: an unmeasured
platform is exactly the state where the guard suite is green and proves nothing. A friendlier
first experience (for instance, off-matrix platforms reported as *unmeasured* rather than failed) is
a real option and is what O-ENG-T5 exists to settle; it is not assumed here.

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
  forbids, and it is already wrong today — in **one** direction, by over-listing. `startup.mjs:20-37`
  freezes 17 entries (15 skill identifiers plus `se-implement`'s two supplement entries, as its own
  comment says), and the derived 10 are a strict *subset* of those 15. What HEAD gets wrong is the
  five operator-invoked-only skills it lists as dispatchable (`consolidate-learnings`,
  `orchestrate-dev`, `orchestrate-queue`, `tech-lead`, `tech-lead-python`) — which is precisely REQ
  AC-3.5's "5 operator-invoked" scoping note (`REQ:499-516`). An earlier draft said "wrong in both
  directions"; it is not, and the correction matters because the oracle transcribes this claim.
- **Scan the modules' source text for skill literals at dispatch call sites** — rejected on measured
  evidence, and this is the alternative that looked cheapest. Measured at HEAD across both modules, a
  scanner honouring "string literal in first argument position of a dispatch call" derives **five**
  names — `{ship-pr, dod-verify, se-implement, se-author, harvest-learnings}` — from these sites:
  `ship-pr` (`orchestrate-dev.js:8008`, `:8112`), `dod-verify` (`:8035`, multi-line), `se-implement`
  (`:8064`, `:10028`, `:10068`, `:10142`, `:10251`), `se-author` (`:9964` and
  `orchestrate-queue.js:1216`), `harvest-learnings` (`:10542`). The other **five** identifiers
  (`pm-author`, `pm-review`, `se-review`, `te-author`, `te-review`) never appear as a literal at any
  dispatch site in either module: they are reached through `PHASE_DISPATCH`'s role fields (`:3337`+)
  or, for `se-review`, through a module-local constant (`ADVISORY_RUNG_SKILL`, `:1797`, dispatched at
  `:1841`). `harvest-learnings` also appears as a `skill:` object field (`:10448`), which is not a
  call site at all. So the scanner is short by half, and the sites it does find include two
  multi-line call forms a single-line grep misses — the only repair is to loosen the oracle until it
  stops being one.
- **Per-command scope for rung 4** (`pdlc queue` checks only the queue module) — rejected: `se-review`
  reaches the queue only through the delegated dev pipeline and the advisory seam, so a missing
  `se-review/SKILL.md` would surface mid-run instead of at startup. The union is also free —
  `lib/run.mjs` imports both modules anyway, and the queue module already imports the dev module
  (`orchestrate-queue.js:41`).

**Constraints that forced this shape:** C-4 (the modules are not forked — so the fact must be
*exported* from them, not copied); BR-START-4; AC-3.5's two directions.

**The cost this decision accepts:** the derivation is only as good as the guard against a *new*
identifier appearing at a *new* dispatch site without being exported. An earlier draft named that
guard "a no-bare-literal test with a closed allow-list of non-dispatch literal sites — today exactly
the reviewer-role map keys at `orchestrate-dev.js:6229-6231`", and that test cannot be written
against HEAD: bare literals sit at dispatch sites in eleven places across the two modules (enumerated
in the scanner alternative above), so the allow-list would either leave the suite permanently red or
have to exempt nearly every site it exists to police. The guard is therefore **containment, not
absence**:

> Every string literal in either workflow module that matches a skill-identifier shape — at a
> dispatch call site, in a `PHASE_DISPATCH` role field, in a `skill:` field, or bound to a
> module-local constant — is a member of the two modules' exported `DISPATCHABLE_SKILLS` union.

That is green at HEAD by measurement — every literal occurrence of the ten identifiers in either
module is a member, including the reviewer-role map's *keys* (`se-review`, `pm-review`, `te-review`
at `orchestrate-dev.js:6229-6231`), which need no exemption because they are genuine members; that
map's *values* (`software-engineer`, `product-manager`, `test-engineer`) are role slugs, not skill
identifiers, and do not match the shape. And it fails
exactly when the drift this decision fears occurs: a new dispatch site naming an identifier the
exports do not carry. Its own failure mode is stated rather than assumed: the test is only as good as
the identifier-shape predicate, so the predicate is asserted against the known set rather than being
a regex nobody re-reads. A second accepted cost: deleting `EXPECTED_SKILLS` means nothing asserts that the five
operator-invoked-only skills are readable. That is correct rather than lost — the engine can never
dispatch them — but it is recorded here so a later reader does not read the reduction as an
oversight.

**Reversibility:** Easy. The exports are additive; reverting to an engine-side list is a one-file
change (with the old defect restored).

**Re-evaluation triggers:** A dispatch path appears that is not reachable from `PHASE_DISPATCH` or a
named constant; the containment test needs an exemption of any kind (which is the signal that
dispatch-site discipline is eroding); a skill identifier stops matching the shape predicate the test
relies on.

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

That wave set is itself a second hand-maintained declaration — the very thing DEC-ENG-05 removes
elsewhere — so its maintenance rule and failure mode are stated rather than left implicit. Deriving
it from the implementation would only turn the oracle into an implementation echo, so it stays
declared in the test, and the assertion is **set-equality in both directions**: the descriptors in
the declared Phase-I wave set are exactly the descriptors carrying `sonnet`. Stated as containment
in one direction only, the drift is toward green — a fourth `sonnet`-pinned site could appear and
simply not be partitioned. Set-equality makes that case red, which is the point: the test fails when
the code grows a wave the declaration does not know about, and the fix is to update the declaration
deliberately.

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

**Step 4 is defined over a whole run only, and says so when it is not one.** The three assertions are
set-equality over every observation a full suite produces, so a *filtered* run (`node --test
--test-name-pattern …`, `--test-only`, or a single file) produces a partial corpus against which
registered-⊆-emitted is false by construction — a red that reports nothing about the code. Rather
than weaken the assertion to survive filtering, the runner detects the filtered case (any
test-selection argument forwarded to `node --test`) and reports step 4 as **skipped, with the
reason**, rather than passing or failing it. Skipped-with-reason, not silence: a suite-wide oracle
that quietly does not run is the same vacuity in a different costume, so the skip is printed and the
run's summary carries it. Only an unfiltered run can turn step 4 green.

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
instead of `"Bash"`, or a hook path pointing at no script). The test runs with no pdlc hooks
registered on the host, in a scratch tree with neither settings entries nor an installed plugin.

**The mis-built arm asserts positively, because "no deny" is an absence-only oracle.** Requiring only
that the mis-built configuration *produce no deny* passes for at least three wrong reasons: the
harness never invoked the hook at all, the fixture command never matched the guard's scope regex
(`guard-harvest-before-delete.sh:35`, `:37`), or an error was swallowed on the way. So the mis-built
arm must assert on the same path as the well-built one: the callback returns an explicit **allow**
verdict, and the deletion the well-built arm blocks actually **completes** — the `CROSS-REVIEW-*`
file is gone from the scratch tree afterwards. Both arms therefore observe a verdict and a
filesystem effect; neither can pass by nothing having happened.

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

**What the operator reads about it: nothing, today.** No banner line and no report field hints at the
gap — the pipeline stays silent until a branch is corrupted. That is a consequence of building
nothing rather than a separate judgement, and it is the weakest part of this decision. A one-line
honest disclosure would not be the invented lock refused above, but it is not free either: every
operator-visible string is a catalogue entry plus a suite-wide emit obligation (DEC-ENG-13), and no
acceptance criterion binds the disclosure any more than it binds the lock. So it is named here as
the cheapest available improvement and left to O-ENG-T2, which should settle disclosure and
detection together rather than one at a time.

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

## 7. Options considered — the rejected alternatives in one place

Each entry above carries its own **Alternatives considered** block; this section collates them so a
later reader can find a rejection by the shape they are about to re-propose, rather than by guessing
which decision owns it. The right-hand column is the reason the rejection is *not* free — a rejected
alternative with no cost is not a decision worth recording.

| Rejected alternative | Rejected in | Reason | What the rejection costs |
|---|---|---|---|
| Ship only the SDK transport, no CLI module | DEC-ENG-01 | The carriers differ exactly where C-2/C-5/C-6 bind, and those differences are cheapest to find while the interface is written | `lib/transport-cli.mjs` is code with no production caller this feature (the file does not exist at HEAD — `pdlc/engine/lib/` holds seven modules, none of them a CLI transport) |
| A runtime transport selector | DEC-ENG-01 | Reverses TSPEC v1.0; a selector is honest only after the CLI flag surface is measured on both platforms (C-9) | Operators get no switch this feature; O-1 owes the measurement |
| Spawn `claude -p` as primary | DEC-ENG-01 | Puts a second process, its stdout framing and its own settings resolution between engine and dispatch | None material |
| Automatic failover on transport error | DEC-ENG-02 | A run whose carrier can change is unattributable, and C-9's per-transport regime becomes unfalsifiable | An SDK outage halts the run rather than completing it on the fallback |
| Reimplement the guard's decision procedure in JS | DEC-ENG-03 | Two definitions that drift silently across four regexes and a byte-read refusal string | The engine must be able to run the shipped `.sh`, which is why an interpreter precondition exists at all — its authorisation, refusal message and rung placement are filed upstream, not settled here |
| Port the guard script and delete the original | DEC-ENG-03 | NG-1; the plugin path still runs the hook interactively | None |
| Live-only guard measurement, no durable record | DEC-ENG-04 | A fresh clone would state nothing about whether the combination was ever measured, on which platform, against which SDK version | The baseline file grows a per-platform row that must be seeded in the same task as the gate |
| Warn instead of fail when the measurement is unrecorded | DEC-ENG-04 | A warning on an unattended pipeline is a message nobody reads; unrecorded is exactly the vacuous-green state | CI goes red on a platform nobody has measured yet — intended |
| Keep an engine-side `EXPECTED_SKILLS` list | DEC-ENG-05 | The hand-maintained declaration BR-START-4 forbids, and already wrong at HEAD by over-listing (17 frozen entries at `pdlc/engine/lib/startup.mjs:20-37` = 15 skills + 2 supplements; the derived 10 are a strict subset, so the five operator-invoked-only skills are the error) | Deleting it drops the assertion that operator-invoked-only skills are readable |
| Scan module source text for skill literals | DEC-ENG-05 | Measured at HEAD: a faithful scanner derives five names (`ship-pr`, `dod-verify`, `se-implement`, `se-author`, `harvest-learnings`) and misses five that never appear as a literal at a dispatch site | The derivation instead depends on a containment test — every skill-identifier literal in either module is a member of the exported union |
| Per-command scope for startup rung 4 | DEC-ENG-05 | `se-review` reaches the queue only via delegation, so a missing SKILL would surface mid-run | None — both modules are imported anyway |
| Exempt `se-implement`'s supplements from Direction B | DEC-ENG-06 | An exemption list is where a genuinely unreachable prompt file hides | — |
| Rewrite `SKILL.md` to absorb the supplements | DEC-ENG-06 | NG-8, and it would change interactive behaviour to serve a headless constraint | — |
| Language-conditioned supplement selection | DEC-ENG-06 | Needs a prompt-size measurement and a language manifest first (O-ENG-T3) | Every `se-implement` dispatch carries both supplements from `pdlc/skills/se-implement/` |
| Add a phase argument at the modules' dispatch sites | DEC-ENG-07 | Would falsify the two-row claim about the `pdlc/workflows/` diff that C-4 rests on | Phase provenance is last-write-wins run state, only as accurate as `_phase` discipline |
| Infer phase from the skill identifier | DEC-ENG-07 | Not a function — `se-implement` is dispatched from three phases | — |
| Derive startup auth posture from the transport's `apiKeySource` | DEC-ENG-08 | Not available before a dispatch exists, so the banner would print after billing began | — |
| Fold startup posture and per-dispatch assertion into one module | DEC-ENG-08 | O-9 is open: no transport is known to distinguish session from token credential | Two modules observing adjacent facts, one banner |
| Extend the transport's error classes to six | DEC-ENG-09 | `agent-reported-failure` is not a transport fact; the CLI transport would have to reproduce the parsing | — |
| Classify outcomes in the adapter | DEC-ENG-09 | Makes the taxonomy's totality testable only through a dispatch | — |
| Module-scoped `Set` read by a name-ordered last test file | DEC-ENG-10 | Asymmetric failure: the catalogue direction fails loudly, the outcome direction passes vacuously green over the empty set | The suite gains a runner, a bootstrap and an assertion step |
| Mint the test run id in the bootstrap on first use | DEC-ENG-10 | `--import` preloads into sibling child processes; an id assigned in a child is visible to that child alone | — |
| Inline the run id in the npm script | DEC-ENG-10 | Shell assignment syntax `cmd.exe` does not accept, and the directory-clearing step gets no ordered home | — |
| Assert the guard verdict without performing the deletion | DEC-ENG-11 | The unfalsifiable form — and the defect an earlier draft shipped | — |
| Drive a real tool call through the SDK end-to-end | DEC-ENG-11 | §7.1 forbids a real client in the hermetic suite | The hermetic suite proves build-and-honour; only the live measurement proves consultation |
| Leave the transport's timeout default as the only enforcement | DEC-ENG-12 | HEAD's behaviour, which makes BR-CLI-3's reported value decorative | — |
| Have workflow modules pass `timeoutMs` per dispatch | DEC-ENG-12 | A second row under `pdlc/workflows/`, for no gain | — |
| A second timeout resolver inside `run.mjs` | DEC-ENG-12 | Two resolution points is how a reported number and an enforced number start to differ | — |
| A catalogue lookup that falls back to the passed string | DEC-ENG-13 | Makes the closed set advisory and reopens the unreviewed-message hole | Every new operator string is a catalogue edit plus an emit obligation |
| Assert registered-equals-emitted per test file | DEC-ENG-13 | Vacuous the moment a test is skipped | Depends on DEC-ENG-10's accumulator |
| An advisory repo lock refusing the second run | DEC-ENG-14 | No acceptance criterion binds it; an invented locking protocol is what halts an unattended run at 3am with a stale lock | Two concurrent runs against one worktree stay undetected (EC-RUN-4, O-ENG-T2) |
| Rely on git's own index lock as protection | DEC-ENG-14 | Serialises git invocations, not pipeline phases — converts a data race into an intermittent mid-phase failure | — |

## 8. Consequences

The costs each decision accepts, gathered so PLAN and PROPERTIES can carry them as obligations rather
than rediscover them. Nothing here is new: each row restates a cost stated in its own entry above.

**Consequences that become work in PLAN.**

| Consequence | From | Obligation it creates |
|---|---|---|
| `transport-cli.mjs` is written to the same interface with no production caller | DEC-ENG-01 | A test-only unit driven over recorded fixtures; parity clauses must not silently degrade to "the file exists" |
| The guard script's fail-open interpreter probe is not relied upon | DEC-ENG-03 | A startup-time capability probe plus one catalogue id, observed at startup rather than per dispatch. **Blocked on upstream:** the precondition's authority (a REQ constraint), its own EC row and message obligations, its rung placement (a new rung 6, or rung 5 redefined as two predicates with per-cause ids) and whether it is fatal under dry run are FSPEC/REQ errata, not PLAN's to choose |
| The `M-ENG-09` gate and its first rows must land together | DEC-ENG-04 | Single PLAN task — a gate landing before its seed rows turns CI red for an unrelated reason. The gate keys on `platform` + `transport` only; `sdkVersion` and `date` are provenance, so a caret-range SDK bump must not turn the hermetic suite red |
| `EXPECTED_SKILLS` is deleted | DEC-ENG-05 | Both workflow modules export `DISPATCHABLE_SKILLS`; rung 4 checks set-equality over the union; a containment test asserts every skill-identifier literal in either module is a member of that union (no exemption list) |
| Suite-wide assertions need a runner | DEC-ENG-10 | `_run-suite.mjs`, `_bootstrap.mjs`, `_assert-suite-wide.mjs` and one `package.json` line, plus a test asserting the inheritance property itself; the runner detects a filtered invocation and reports the suite-wide step skipped-with-reason rather than passing or failing it |
| Every guard clause needs a falsifying counterpart | DEC-ENG-11 | The negative half is written first; the survival clause reuses the same fixture and deletion step under an allow verdict; the mis-built-configuration arm asserts an explicit allow verdict **and** that the deletion completes, never merely that no deny occurred |
| Every operator-visible string is a catalogue entry | DEC-ENG-13 | Including the strings DEC-ENG-03 and DEC-ENG-04 introduce; each must be emitted at least once in the suite |

**Consequences accepted as standing costs, closing nothing.**

- Bytes, not correctness: every `se-implement` dispatch carries both language supplements (DEC-ENG-06).
- Phase provenance is last-write-wins and inherits `_phase` discipline, including the V-wave that
  announces `"Phase PT"` while pinning `sonnet`; the model-map oracle partitions on a defined wave
  set rather than on the announced string, asserted as set-equality in both directions so a new
  `sonnet`-pinned site cannot drift toward green (DEC-ENG-07).
- Two concurrent runs are not merely undetected but undisclosed: nothing an operator reads mentions
  the gap, and closing that is left to O-ENG-T2 alongside detection (DEC-ENG-14).
- Nothing asserts that operator-invoked-only skills are readable, because the engine cannot dispatch
  them (DEC-ENG-05).
- `maxTurns` stays a declared-but-unassigned option key, so the boundary test asserts containment
  plus two required keys rather than set-equality (DEC-ENG-12).
- Catalogue ids are cheap to add and socially expensive to rename, which is why ids and not wording
  are the pinned half (DEC-ENG-13).

**Consequences for reversibility.** Every decision above is individually easy to reverse — the index
in §9 records this — with one qualification: DEC-ENG-04's gate is easy to remove, but the branch it
forces is not. If the measurement returns `denyFired: no`, either the permission posture tightens or
the guard moves to `canUseTool`, and that is a change to the transport's permission contract rather
than to a test.

## 9. Decision index

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

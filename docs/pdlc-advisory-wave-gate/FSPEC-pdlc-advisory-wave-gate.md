# FSPEC — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` |
| Downstream | `TSPEC-pdlc-advisory-wave-gate.md`, `PLAN-pdlc-advisory-wave-gate.md`, `PROPERTIES-pdlc-advisory-wave-gate.md` |
| Cross-Reviews | (active) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.7 | 2026-08-20 |

**v1.7 (erratum round, Phase D).** Lands the one item this round raised by SE and TE alike: DEC-A6-03's operator-facing halt-message obligation, routed since round 5 and previously unlanded. REQ v1.16's second AC-6.3 conjunct is now compressed at FSPEC altitude — BR-14 carries the co-location clause, §3 step 10 and E-34 name its two arms, E-30 defers to BR-14's contents rather than re-enumerating them, and AT-06-4 gains the third conjunct plus its no-capture companion AT-06-4b. The capture's name, storage form and lifetime stay O-1's. Nothing else changed; no decision reopened.

**v1.1 (round 1).** All v1 High/Medium addressed: E-04/AT-01-5 counting oracle; AT-04-3 over writer identity; §3.2 step 3b; BR-11 window; seven ATs added, four restated as oracles.

**v1.2 (round 2).** BR-11, E-25 and AT-02-7 restate the seam-budget window as dispatch→verdict (superseded by v1.4); E-33 and AT-07-2b pin a non-negative validator so `0` survives; AT-07-1's BR-1…BR-16 partition made total. REQ NFR-4's rationale raised as an erratum.

**v1.3 (round 3).** AT-07-1's BR-2 arm carries BR-2's own outcome (`unclassified`, no refusal reason, no attempt consumed), its BR-3 arm pins `attemptBudget` `1`; AT-02-7's companion gains a positive disposition and a one-window *Given*; E-30/AT-06-6 name the report's notice channel as the failed-log-write carrier. REQ errata re-emitted.

**v1.5 (closing pass).** Upstream re-grounded: REQ v1.6 → v1.13 and `pdlc-wave-gate-baseline.md` v1.1 → v1.2 in §1, §2 and A-2; E-33 absorbs AC-2.4's zero-mode conjuncts. REQ lineage-header items raised as errata.

**v1.6 (round 1 on FSPEC).** BR-2/AT-02-1 carry AC-2.2's first-matching-class rule with an ordered oracle and a two-class arm (E-08b); BR-9/AT-05-1/AT-05-2 pin the map's domain (non-ignored) and observation point; BR-5 and BR-15 transcribe the shipped exclusion and refusal orders; BR-12's signal is durable; §6 states the pre-A6 comparands are transcribed literals; E-34, E-23's halt writes, §2's before-base, AT-07-1's BR-4, AT-04-1/-02-9/-03-2/-03-7 clarified.

**v1.4 (round 5).** AT-04-1 split to AC-4.1's three conjuncts, a run each (AT-04-1a green re-gate, AT-04-1b suppressed re-gate); "not assertable" rationale deleted (SE F-01, TE F-02). Seam budget per **attempt**, worst case `attemptBudget` × the value, carve-out dropped (SE F-02/F-03, TE F-01). AT-01-5, A-1, A-4 realigned (SE F-04…F-06, TE F-03/F-04). REQ errata landed in v1.7/v1.8.

## 1. Overview

**Scope in one line.** This FSPEC specifies the observable behaviour of **A6**, a sixth advisory
seam that fires when a Phase I implementation wave's script-owned test gate returns non-zero, gets
one bounded and reversible repair attempt inside a declared file envelope, re-runs the wave's own
gate sequence, and — if the gate does not go green on its own — escalates and leaves the pipeline
halting exactly as it halts today, with a diagnosis attached.

**What this adds over the REQ.** The REQ states the outcomes an operator can observe; this FSPEC states the *order* in which they become observable: the decision points inside one invocation, which condition wins when two apply, what each terminal disposition leaves on disk, and the tests that decide whether the behaviour shipped.

**What it deliberately does not state.** No seam signature, no injected-dependency name, no algorithm for computing an owned-path set, no restoration mechanism, no field layout of any shipped record — all the TSPEC's, routed there by REQ (O-1, O-3, O-4, O-5, O-8). Shipped behaviour is cited, never restated: `M-WG-*` ids from `docs/_constraints/pdlc-wave-gate-baseline.md` v1.2, tier behaviour by section id from `docs/_constraints/pdlc-advisory-corpus-baseline.md` (§1–§4).

**Reading order.** §3 the lifecycle end to end; §4 the rules deciding its branches; §5 absent, malformed and contradictory inputs; §6 the acceptance tests. For the boundary alone, read BR-4 through BR-9.

**Inherited contracts.** A6 extends a shipped tier, not a new mechanism (REQ C-1). The verdict shape, the confidence-and-envelope action gate, the ordered eight-member refusal-reason catalogue, the exclusion set, the per-feature advisory record, the escalation log and the model rung are the tier's, used unchanged. A6 adds only: one trigger, one
classification vocabulary, two envelope members, one config key, four prohibitions, and one
re-gate-and-restore cycle.

**Non-goals, restated from REQ §4 because they bound this spec's tests.** A6 does not change the
wave gate, wave partitioning, or commit discipline; does not fix PLAN dependency derivation; does
not give Phase I a POSTMORTEM lifecycle or an approval skip; does not apply to the final V-wave; does
not apply on the legacy worktree path; and changes no other seam, no refusal reason, and no model
rung.

## 2. Linked Requirements

Every clause below traces to `REQ-pdlc-advisory-wave-gate` v1.13. The FSPEC unit is the behavioural
group, one per REQ requirement id, so a reader holding either document can move between them without
a concordance.

| FSPEC id | Behaviour | Traces REQ | Traces US |
|---|---|---|---|
| FSPEC-AWG-01 | The seam, its single trigger, and its inertness | REQ-AWG-01 (AC-1.1…AC-1.5) | US-01, US-02, US-03, US-05 |
| FSPEC-AWG-02 | The A6 invocation contract: verdict, classification, evidence, budgets | REQ-AWG-02 (AC-2.1…AC-2.4) | US-02, US-03, US-04, US-05 |
| FSPEC-AWG-03 | The envelope: two added members, inherited exclusions, added prohibitions, refusal reporting | REQ-AWG-03 (AC-3.1…AC-3.5) | US-01, US-03, US-04 |
| FSPEC-AWG-04 | What A6 may never do: declare green, commit, edit tests or PLAN or config; and the re-gate sequence | REQ-AWG-04 (AC-4.1…AC-4.6) | US-01, US-03, US-04 |
| FSPEC-AWG-05 | Reversibility, and the unchanged halt | REQ-AWG-05 (AC-5.1…AC-5.3) | US-01, US-02, US-04 |
| FSPEC-AWG-06 | Record, escalation, report, and countability | REQ-AWG-06 (AC-6.1…AC-6.4) | US-02, US-05 |
| FSPEC-AWG-07 | Non-functional behaviour: enforcement site, disabled-tier equivalence, budgets, rung | REQ-AWG-07 (NFR-1…NFR-6) | US-03, US-04 |

**Prerequisites this FSPEC assumes hold at HEAD** (REQ §9). BL-01 the shipped tier; BL-02 the tier's
exported model-rung resolver; BL-05 `pdlc-consolidation-agent` landed. BL-03 (valid PLAN ownership
manifest, so Phase I is in wave mode) and BL-04 (a configured script-owned gate) are *not* assumed:
they are checked per run, and their absence is specified behaviour here (§3 step 1, §5 E-01/E-02),
not a gap. BL-06's enumeration — the transcribed set-equality surfaces that this feature reds — is an
input to planning, and this FSPEC states only the observable consequence: the surfaces named in
M-WG-9 are expected to change, and a run in which they did not is a defect (AT-01-1, AT-07-2).

**Where "before" is measured.** AT-01-1, AT-07-2 and AT-04-5's first companion define themselves
against the pre-A6 state, which this branch's HEAD no longer carries: A6 merged at `bb4d36fb`, and
`pdlc-wave-gate-baseline.md` §4 records the post-change readings (M-WG-13, M-WG-14, at `11420461`).
The base those before-readings are measured at is `c8aa22a4`, where M-WG-8's five-member catalogue
still holds. A green result for one of those three at any later base is a vacuum, not a pass.

**Where a requirement is deliberately not specified here.** REQ O-1, O-3, O-4, O-5 and O-8 are obligations on the TSPEC: this FSPEC states the outcome each must produce and nothing about how. §7.1 carries them forward so the TSPEC author inherits them from one place.

## 3. Behavioral Flow

### 3.1 Baseline — the wave as it behaves today

One Phase I wave runs its members in parallel in one shared tree, told not to commit. Three
conditions end the wave, in this order, with nothing committed: a dispatch-level failure (M-WG-1);
the configured post-wave command failing (M-WG-2); the script-owned test gate failing (M-WG-3). Only
past a green gate does anything commit, pathspec-scoped, per task and then for the post-wave
pathspecs (M-WG-4). A6 sits between the third condition and the halt it causes. It sits nowhere else.

### 3.2 The A6 lifecycle

**Step 1 — Applicability.** Before anything is dispatched, the run establishes whether A6 applies. It applies only when all four hold: the tier is enabled; Phase I is in wave mode on a valid
ownership manifest (BL-03); a script-owned gate is configured (BL-04); and the wave is an ordinary
implementation wave, not the final V-wave. If any fails, A6 does not apply, the phase behaves exactly
as it does today, and inapplicability is stated once per run on the run's notice surface (§5 E-01,
E-02, E-03).

**Step 2 — Trigger.** One condition only: the script-owned test gate returning non-zero for an ordinary wave (M-WG-3). A dispatch-level failure (M-WG-1) and a post-wave command failure (M-WG-2) halt exactly as today and never reach A6 (BR-1).

**Step 3 — Budget admission.** Before dispatch, the run checks the wave budget: if A6 has already
*resolved* `advisory.waveBudgetPerRun` distinct waves in this run, the wave escalates without any
dispatch (BR-11). Attempt budget is read at step 3b; the time budget is per-dispatch (BR-11).

**Step 3b — Attempt admission.** The run reads the wave's consumed-attempt count against `advisory.attemptBudget`. If no attempt remains, the wave escalates with the tier's `budget-exhausted` reason and nothing further is dispatched (BR-11, E-24). Otherwise one attempt is available and control passes to step 4. Every arrival here — the first, and each return from step 8b — reads the same counter, so A6 dispatches on one wave never exceed `advisory.attemptBudget` and equal it exactly when every attempt ends in a red re-gate (AT-02-9).

**Step 4 — Diagnose.** A6 is dispatched on the tier's existing model rung, receives the gate
command's captured output, and returns the tier's existing verdict carrying one added field: a
root-cause classification drawn from a four-member closed vocabulary (BR-2). The diagnosis must cite
the gate output it rests on (BR-3).

**Step 5 — Authorisation.** The tier's existing rule decides whether any action is taken: only when the proposal is inside the envelope **and** confidence is high. A6 adds two envelope members (BR-4), keeps the tier's exclusions unchanged and precedence-first (BR-5), and adds four prohibitions (BR-6). `environmental` and `unclassified` authorise nothing, whatever the confidence (BR-2).

**Step 6 — Repair.** If and only if step 5 authorises it, the repair is applied to the working tree.
Nothing is committed at this step or any other: A6 never commits (BR-8).

**Step 7 — Re-gate.** The wave's whole gate sequence re-runs in the order the wave ran it: post-wave command first, then test command. Only that sequence returning success declares the wave green; no verdict field substitutes for it (BR-7).

**Step 8a — Green re-gate.** The wave proceeds past the gate into exactly the post-gate path it would have reached had the gate been green on the first pass. A later check there may still halt the wave; that halt is neither a red re-gate nor a restoration trigger, and the repair stays applied (BR-10). Where the repair was authorised under E-6 and touches a *later* PLAN task's paths, the wave's commit step must still leave it committed and that task's dispatch is told so (BR-12).

**Step 8b — Red re-gate.** The attempt is consumed, the **whole working tree** is restored to the
state it stood in immediately before A6 acted — the wave's post-dispatch, pre-commit tree, with the
wave agents' own uncommitted work intact — and control returns to step 3b's attempt check (BR-9).

**Step 9 — Terminal disposition.** Exactly one of: *resolved* (step 8a on a green re-gate); *escalated* (refusal, malformed verdict, budget exhaustion, or a red re-gate with no attempt left); *no-action* (tier disabled, or A6 inapplicable). The vocabulary is the tier's, not A6's, and its closed assertion belongs to the tier's own suite — the same division AT-06-1 makes for the record shape; A6 adds no disposition, and no AT here re-asserts the set. An advisory-record entry is appended for every disposition and an escalation-log entry for every escalated one (BR-13); a record-write failure refuses the action rather than proceeding unrecorded.

**Step 10 — Halt, unchanged.** When A6 does not resolve the wave, the pipeline halts with the same reason it emits today (M-WG-3) and writes the same `halted` queue row (M-WG-7); the halt report additionally carries the diagnosis and its root-cause class. It has two arms: where the report points the operator at a captured pre-A6 tree state, it also warns there that re-running this feature overwrites that capture; where no capture was taken (E-34), it carries the diagnosis and class and no such warning. Escalation adds information, never control flow (BR-14).

### 3.3 The flow in one table

| Step | Decision | Green branch | Red branch |
|---|---|---|---|
| 1 | Does A6 apply? | continue | phase behaves exactly as today; one inapplicability notice per run |
| 2 | Which condition ended the wave? | test gate red ⇒ continue | dispatch or post-wave failure ⇒ halt as today |
| 3 | Wave budget left? | continue | escalate, no dispatch |
| 3b | Attempt left on this wave? | continue | escalate `budget-exhausted`, no dispatch |
| 4 | Verdict well formed, and does the diagnosis cite gate output? | continue | escalate, one attempt consumed (E-07, E-10) |
| 4b | Classification present and inside the four-member set? | continue | reads `unclassified`; escalate, **no** attempt consumed (BR-2, E-08) |
| 5 | Inside envelope, high confidence, and does the class authorise action? | continue | escalate with a refusal reason, no attempt consumed |
| 6 | — | repair applied to the working tree | — |
| 7 | Does the whole gate sequence pass? | wave green | restore whole tree, consume attempt, back to step 3b |
| 8a/8b | — | wave proceeds past the gate | see step 7's red branch |
| 9 | — | resolved | escalated |
| 10 | — | wave proceeds | halt exactly as today, diagnosis attached |

Steps 4 and 4b are separate because they consume differently: a malformed verdict or uncited diagnosis costs one attempt (E-07, E-10), an absent or out-of-set classification costs none (BR-2, E-08). Where both apply, E-09's tie-break governs.

## 4. Business Rules

Each rule states one decidable proposition and names the REQ clause it realises. Where two rules
could both apply, the precedence rule says which wins; there is no case in which the answer is
"either".

**BR-1 — One trigger, and it is the test gate (AC-1.2, AC-1.3).** A6 fires when, and only when, the
script-owned test gate returns non-zero for an ordinary implementation wave. Not on a dispatch-level failure — no completed work to repair. Not on a post-wave command failure: the single run is the detection, and a build-breaking source defect being permanently outside A6's reach is a decision (REQ O-7), not an oversight. Not for the final V-wave, which carries no ownership-manifest row and so gives E-5 and E-6 no owned-path set to range over: a seam whose envelope cannot be evaluated must not act.

**BR-2 — The classification vocabulary is closed on one side and total on the other (AC-2.2, C-3).**
Every A6 verdict carries a root-cause classification drawn from exactly this set:

| # | Class | Meaning | Authorises action? |
|---|---|---|---|
| 1 | `plan-ordering-defect` | the failure names a symbol, file or artifact the PLAN itself schedules for a **later** task than the one that consumed it | yes, subject to E-6 |
| 2 | `wave-internal-defect` | the failure is attributable to work this wave produced, inside paths this wave owns | yes, subject to E-5 |
| 3 | `environmental` | the failure reproduces independently of this wave's diff — a pre-existing red, a missing tool, a transport failure | no |
| 4 | `unclassified` | none of the above is decidable from the gate output | no |

The set is **ordered** and the first matching class wins, so a failure matching both #1 and #2 is classed `plan-ordering-defect` and never carries two (E-08b). Its oracle is therefore ordered-sequence equality over class ids, never set equality: a reordering silently changes which class a two-way failure receives, and a deleted or invented class fails the suite (AT-02-1). The receiving side is total: an absent or out-of-set classification reads as `unclassified` rather than being rejected, and since `unclassified` authorises nothing the wave escalates **without consuming an attempt** — an attempt is a repair-and-re-gate cycle, and none was attempted.

**BR-3 — A diagnosis without gate-output evidence is malformed (AC-2.3, AC-2.1).** The gate output is the only evidence distinguishing a repair from a guess, so a diagnosis citing none is malformed under the tier's existing rule and escalates, consuming one attempt. The evidence available is the gate command's captured output as A6 receives it, not the truncated tail the halt message shows a human, so the rule stays satisfiable on a long suite.

**BR-4 — The envelope gains exactly two members (AC-3.1).** A6 adds E-5 and E-6 to the shipped
four-member default envelope, each with a decidable membership rule:

| # | Permitted | Decidable rule |
|---|---|---|
| E-5 | a repair confined to the failing wave's **own** owned paths | every path the proposal would change is a member of the union of the owned-path sets the PLAN's ownership manifest assigns to that wave's tasks |
| E-6 | completing a promotion the PLAN schedules for a **later** task | the gate output names a symbol or artifact that a later task's PLAN row already undertakes to produce, **and** every path the proposal would change is a member of that later task's owned-path set |

Nothing else A6 proposes is in the envelope. The shipped envelope becomes one closed six-member set,
assertable by a single set-equality over member ids, never by prose joining two sets. E-5 and E-6 are not two further act kinds beside `E-1`…`E-4`: A6 widens the envelope's semantics from act kinds alone to act-plus-scope. `E-1`…`E-4` name what may be done, E-5 and E-6 where a repair may land, and a proposal is in envelope only when both hold. A proposal whose changed paths fall outside that scope is refused by the tier's existing declared-scope exclusion, reporting that exclusion's reason, not a new one. E-5 therefore admits no act the shipped four do not; the residual — a wrong repair of a permitted kind inside owned production files — is R-1, accepted in §7.3 A-3.

**BR-5 — Exclusions win over permissions, always (AC-3.2).** The tier's existing exclusion set holds unchanged for A6 and takes precedence over E-5 and E-6 wherever both could apply. Two consequences, named rather than discovered. First, the test-artifact clause binds even when the failing test sits inside the wave's own owned paths: editing a test to turn a red gate green is the pipeline's most dangerous failure mode and A6 sits closest to it. Second, the self-modification guard clause holds, so a wave owning `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/` or `.claude/workflows/` escalates `out-of-envelope` — the 2026-08-09 motivating incident would today be diagnosed, not repaired, while the 2026-08-11 consumer-repository incident is unaffected. Relaxing either is out of scope without an operator. The shipped exclusion catalogue is **ordered**, and the order is load-bearing: classification
walks it in order and the first matching clause decides which refusal reason is reported. That
order is `X-a` (test artifacts), `X-e` (guard paths), `X-d` (declared scope), `X-b` (DoD
criteria), `X-c` (membership) — transcribed here, and deliberately not alphabetical, so the
oracle has a spec-side literal instead of copying the catalogue it asserts over (M-WG-10). Its
oracle is ordered-sequence equality over those clause ids — the same unit BR-15's refusal
reasons get, never set equality (AT-03-8) — because a reordering silently changes the reason A6
reports while a set assertion still passes.

**BR-6 — Four further prohibitions, as a closed set (AC-3.3, AC-4.3).** In addition to the tier's
exclusions, A6 may not: (f) change the PLAN, its task table, or its file-ownership manifest; (g)
change implementation configuration — the test command, the post-wave command, or the post-wave
pathspecs; (h) commit, push, or tag; (i) touch any path outside the set E-5 and E-6 compute for this
invocation. These four are a closed set and are asserted as one: the prohibition ids `(f)`…`(i)` are
compared by set-equality, so a deleted prohibition fails the suite instead of passing a
containment check, and each prohibited operation is additionally exercised one by one (AT-03-5).

**BR-7 — Only the gate declares the wave green, and the whole sequence re-runs (AC-4.1, AC-4.4).** No
advisory verdict substitutes for a gate result. After a repair the wave's whole gate sequence re-runs in the order the wave ran it: post-wave command first, then test command — not incidental, since a source-touching repair would otherwise re-red the gate for its own unbuilt outputs. A post-wave command failing on re-gate is a red re-gate, not the first pass's immediate halt; it reaches no test command and contributes a truncated sequence, an admitted form. The observable is an **ordered sequence**: gate-command invocations for a wave equal the shipped sequence concatenated once per pass, passes = 1 + attempts (the first pass is not an attempt), a failing pass truncated at the failing command. AT-04-2 carries the three worked sequences. Set equality is the wrong unit: it collapses duplicates and would admit a resolution declared on a single invocation.

**BR-8 — A6 never commits (AC-4.2).** The committing writers stay the two the wave already has: the
pathspec-scoped per-task commit over a task's owned paths, and the build-output commit scoped to the
configured post-wave pathspecs, both reached only past a green gate (M-WG-4). Where post-wave
pathspecs are configured, the re-gate's regenerated artifacts already have a writer; only paths a
*later* task owns remain the gap BR-12 closes. The invariant A6 preserves is the writer **identity** set, not the pathspec scope those writers
pass: the two writers above stay the only ones, and a green gate stays their precondition. The
scope of the per-task pathspec commit may widen under O-8's E-6 resolution — that is the degree
of freedom BR-12 hands the TSPEC author — so no clause here asserts set-equality over committed
paths (AT-04-3).

**BR-9 — Restoration is whole-tree, and has exactly three triggers (AC-5.1, AC-4.4).** On a refusal,
on budget exhaustion, and on a red re-gate, the working tree is left observably identical to the state
it stood in immediately before A6 acted: the wave's post-dispatch, pre-commit tree, with the wave
agents' own uncommitted work intact. Restoration is of the **whole** tree, never of the repair's paths
alone, because a re-run post-wave command writes generated outputs into paths A6 never proposed and no
envelope rule ranges over; a per-path restore would leave the halted tree carrying artifacts built
from a repair that is no longer present. "Observably identical" is a content-level oracle, not a `git status` one: the path-to-content-hash map over tracked files and **non-ignored** untracked files, generated outputs included, equals the map taken immediately before A6 acted — a file the repair created that no pre-A6 entry covers is therefore absent afterwards, not merely reset. A status-level comparison passes a per-path restore whenever the re-run post-wave command rewrote already-dirty paths — the case this rule exists to fail (AT-05-2). Two boundaries on that map are stated rather than left to the fixture author. **Domain:** `.gitignore`d paths are outside restoration's reach — A6 never deletes or rewrites one, so `node_modules/`, tool caches, `.env` and the run's own untracked wave ledger are outside the map in both directions, and an ignored path the re-gate mutated is not a restoration defect. **Observation point:** the map is taken immediately after restoration completes and **before** the record and escalation writes BR-13 requires; both carriers are files inside the tree, so an observation taken after them differs by exactly the bytes BR-13 mandates (AT-05-1, AT-06-1).

**BR-10 — A post-gate halt is not a restoration trigger (AC-4.4, AC-5.3).** A green re-gate lets the
wave proceed past the gate into the same post-gate path it would have reached anyway, and a later
check on that path may still halt the wave. That halt is neither a red re-gate nor a restoration
trigger; the three triggers in BR-9 are exhaustive. One consequence is stated rather than left to be discovered: here the repair stays in the working tree, no restoration trigger having fired. The advisory record entry and the halt report both say a repair remains applied and name its paths, so the operator is never told a machine-authored change was reverted when it was not (AC-5.1, AC-5.3, E-22).

**BR-11 — Three budgets, and exceeding any of them escalates rather than retries (AC-2.4).** More
than `advisory.attemptBudget` attempts on one wave; more than `advisory.seamBudgetMinutes` of working
time on a single **attempt**, over the window AC-2.4 pins — dispatch→verdict on that attempt, the
deadline restarting each attempt — **not** cumulative, so an A6 **invocation** (A6 on one red
wave, REQ §5) has NFR-4's worst case of `attemptBudget` × that value. Gate-command run time
falls outside the window structurally, no subtraction being performed: the gate runs between
attempts, never inside a dispatch→verdict window, so a slow suite cannot exhaust the seam budget and
a slow diagnosis is what it catches (E-25, AT-02-7); and more
than `advisory.waveBudgetPerRun` distinct waves *resolved* in one run. Only resolutions consume wave budget — escalated waves leave it untouched (AT-02-6's cases). An attempt is one repair-and-re-gate cycle.

**BR-12 — An E-6 resolution does not leave the repair uncommitted (AC-4.6).** When A6 resolves a wave
under E-6, once the wave's commit step completes the repair is part of the branch's committed state.
This is a real gap in the shipped scope, not a restatement of it: the wave commit loop commits only
paths owned by tasks *in that wave* (M-WG-12), and an E-6 repair by construction touches a later
task's paths. The repair's paths and the later PLAN task owning them are named in the advisory record, and that task's dispatch is told its owned paths already carry the promotion, so it revises what exists rather than rediscovering it. That signal is **durable**, not in-run state: M-WG-6 has a re-invocation after a later wave's halt re-entering Phase I at wave 1 and re-dispatching every wave, so the carriers the signal must be read from are ones that survive the run — the branch's committed state and the advisory record entry, both of which this rule already requires (AT-04-5). How the pathspec-scoped commit path comes to cover those paths is the TSPEC's (REQ O-8).

**BR-13 — No action without a record; every escalation is durably logged (AC-6.1, AC-6.2).** An entry
is appended to the feature's advisory record for every A6 invocation, naming the wave, the root-cause
class, the envelope determination, the action taken or refused, and the gate-output citation the
diagnosis rests on. The tier's rule holds: an action with no record written is a defect, and a failed record write refuses the action. Every escalation additionally appends an escalation-log entry carrying the root-cause class alongside the tier's required fields, stating in one sentence what the operator must decide.

**BR-14 — Escalation adds information and never changes control flow (AC-5.2, AC-6.3).** When A6 does not resolve the wave, the pipeline halts with the same reason it emits today and writes the same `halted` queue row. The halt report carries the diagnosis and its root-cause class, so the operator's turn starts with the diagnosis on the halt path, not only in a file they must find. One conditional clause follows: where that report points the operator at a captured pre-A6 tree state, the **same report, in the same place**, states that re-running this feature overwrites that capture, so an operator who intends to inspect it preserves it first (DEC-A6-03). Co-location is the observable — a pointer in the halt report and the warning in a runbook does not satisfy it. What the capture is called, how it is stored and how long it lives are O-1's. The clause binds the halt report only; the advisory record entry BR-13 mandates is read after the fact and carries no such warning, and the remedy an operator then chooses is not part of the report's observable.

**BR-15 — Refusal reasons are the tier's eight, unextended (AC-3.4).** Any refusal reports a reason from the tier's closed, ordered eight-member set, transcribed here so AT-03-7's oracle has a spec-side literal: `prohibited-action`, `revert-on-test-touch`, `out-of-envelope`, `post-action-verification-failed`, `record-write-failed`, `malformed-verdict`, `low-confidence`, `budget-exhausted`. A6 does not extend it: a refusal inexpressible in that set is a defect in this specification, not a missing ninth reason. A diagnosis-only outcome — `environmental` or `unclassified` — is not a refusal but an escalation with no proposal to refuse, and needs no reason.

**BR-16 — Enforcement lives in the workflow script (NFR-1, C-4).** Every boundary in §4 is enforced
by the code that runs the pipeline. A prompt instruction is not a control, and no rule here is
satisfied by telling the agent about it.

## 5. Edge Cases and Error Scenarios

Each row states an input condition, the specified behaviour, and the rule it follows from. None of
these is left to judgement at run time.

### 5.1 Applicability and inertness

| # | Condition | Specified behaviour |
|---|---|---|
| E-01 | `advisory.enabled` is false | A6 is provably inert: no advisory agent is dispatched, no model rung is resolved, and the run's created-file set is byte-identical to the pre-A6 baseline for the same run. The report carries **no** advisory summary key at all — the key is absent, not present-and-undefined and not a six-row all-zero table (NFR-2). Inertness is over run behaviour only: the shipped default tables — the envelope's new members, the new config key, and the fixtures that transcribe them — do change, and AC-1.4 does not claim otherwise. |
| E-02 | No script-owned gate is configured (BL-04 absent) | A6 does not apply; the wave degrades to the legacy self-report gate exactly as today. |
| E-03 | Phase I is not in wave mode — no valid ownership manifest (BL-03 absent) | A6 does not apply; the phase takes the legacy path exactly as today. |
| E-04 | Both BL-03 and BL-04 are absent | Still **exactly one** inapplicability notice on the run's notice surface, naming every absent prerequisite. The observable is a cardinality on a named surface, not a mention: exactly one notice per run, not per wave, and none at all in a run where A6 applies. The population is a run that reaches Phase I; a run halting earlier, or skipping Phase I on a recorded wave ledger, emits none and is outside the criterion. The shipped once-per-run notices are the carriers — the statement is added to them, never emitted beside them — and they are mutually exclusive, the no-manifest carrier on the legacy-path branch and the script-gate carrier on that branch's other arm, so here the no-manifest carrier alone discharges the requirement. The oracle counts inapplicability *statements* whoever authored the carrier, never A6-authored notices only: A6 authors none, so an author-filtered count reads zero against the implementation this row specifies (AC-1.5). |
| E-05 | The failing wave is the final V-wave carrying the PROPERTIES tests | A6 does not fire and the gate failure halts exactly as today (BR-1). |
| E-06 | The run is on the legacy worktree path | A6 does not apply; wave mode is a precondition of the seam existing at all (REQ §4). |

E-02 and E-06 are **inherited-behaviour rows**: beyond A6's absence, which AT-01-4 and AT-01-5 assert, they add no observable of their own — the degraded self-report gate and the legacy worktree path are covered by the shipped suites owning them. They are listed so a reader checking applicability finds every arm, not because they owe this feature a test.

### 5.2 Verdict and classification

| # | Condition | Specified behaviour |
|---|---|---|
| E-07 | The verdict is malformed | Escalation consuming one attempt, never a pass — the tier's existing rule, unchanged (AC-2.1). |
| E-08 | The classification field is absent, or carries a value outside the four-member set | Read as `unclassified` rather than rejected; because `unclassified` authorises nothing, the wave escalates **without** consuming an attempt (BR-2). |
| E-08b | The gate output matches **two** classes — it names a symbol a later PLAN task promotes *and* a defect inside the wave's own owned paths | The first matching class wins, so the outcome is `plan-ordering-defect` (#1), never both and never `wave-internal-defect`; the envelope determination that follows is E-6's, not E-5's (BR-2, AC-2.2). |
| E-09 | The verdict is both malformed **and** unclassifiable, so E-07 and E-08 could both read | E-07 wins and one attempt is consumed. AC-2.1's rule is the more specific one; there is no case in which the answer is ambiguous. |
| E-10 | The diagnosis cites no gate output | Malformed under E-07: escalation, one attempt consumed (BR-3). |
| E-11 | The classification is `environmental` or `unclassified` and confidence is high | Still no action. Confidence does not promote a diagnosis-only class into an authorising one (BR-2). |
| E-12 | The gate output is very long and the halt message truncates it | The criterion is satisfied against the output A6 receives, not the truncated tail shown to a human (BR-3). |
| E-13 | The gate output distinguishes an import/collection error from a failing assertion | That is evidence *inside* the existing classes, never a fifth class, and it is best-effort: `testCommand` is arbitrary operator configuration, so an absent distinction is a defined state and not an error (REQ Q-5). |

### 5.3 Envelope and refusal

| # | Condition | Specified behaviour |
|---|---|---|
| E-14 | The proposal changes a test file or test configuration, and that file is inside the wave's own owned paths | Refused. The exclusion takes precedence over E-5 (BR-5). |
| E-15 | The failing wave owns a self-modification guard path — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` | Refused `out-of-envelope` (BR-5). In this repository that is the common case, and the 2026-08-09 motivating incident is among it. |
| E-16 | The proposal is partly inside and partly outside the envelope | No part of it survives the seam. The wave escalates and the run does not report the wave resolved (AC-3.5). There is no partial application. |
| E-17 | The proposal would change the PLAN, its manifest, or implementation configuration | Refused; each excluded operation is asserted by its own test (BR-6, AC-3.5). |
| E-18 | The proposal would commit, push, or tag | Refused (BR-6, BR-8). |
| E-19 | The outcome is diagnosis-only, so there is no proposal to refuse | An escalation with no refusal reason. The eight-member reason set is not extended (BR-15). |

### 5.4 Re-gate, restoration, and budgets

| # | Condition | Specified behaviour |
|---|---|---|
| E-20 | The re-gate's post-wave command fails | A red re-gate, not an immediate halt: the attempt is consumed, the whole tree is restored, and the invocation sequence for that pass is truncated at the failing command — an admitted form, not a defect (BR-7). |
| E-21 | Only a test command is configured, with no post-wave command | The sequence is `[test, test]` for one attempt. A re-gate that skips a configured command is a defect; a sequence that never had the command is not (BR-7). |
| E-22 | The re-gate is green, and a later post-gate check halts the wave anyway | Not a red re-gate and not a restoration trigger. The post-gate checks meant here are the ones the wave already runs after a green gate today — chiefly the un-skip guard, which halts the wave with its work uncommitted when an owned test file still carries a skipped block owed by a completed task. The wave halts on that check and the tree is whatever that path left, **including the repair A6 applied, which is not reverted**; the advisory record entry and the halt report both say so and name the repair's paths, so reversibility is never claimed where it does not hold (BR-10, AC-5.3). |
| E-23 | The run ends on the wave's own gate halt | It ends on the restored tree — the tree as it stood before A6 acted, first-pass build outputs included (BR-9, AC-5.2). "Restored" is BR-9's observation point, not the last byte written: the halt path still appends the record and escalation entries BR-13 requires and still rewrites and commits the `halted` queue row (M-WG-7), and those writes are the halt's, not a restoration defect. |
| E-24 | `advisory.attemptBudget` is exhausted on one wave | Escalate; the reason is the tier's `budget-exhausted` (BR-11, BR-15). |
| E-25 | `advisory.seamBudgetMinutes` is exceeded on one **attempt** | Escalate `budget-exhausted`, measured over BR-11's per-attempt dispatch→verdict window (NFR-4). |
| E-26 | A6 already resolved `advisory.waveBudgetPerRun` waves this run, and a further wave goes red | Escalate with no dispatch at all (BR-11). |
| E-27 | A6 attempted and escalated on two earlier waves, and a third wave goes red | The third wave still gets its attempt: only resolutions consume wave budget (BR-11). |
| E-28 | Restoration itself fails | The wave halts. A6 must never leave a tree it can neither repair nor restore, and the mechanism and its failure handling are the TSPEC's (REQ O-1, carried in §7). |
| E-34 | The pre-A6 tree state cannot be captured at all, so there is nothing to restore to | Distinct from E-28, and the safe branch: **no repair is proposed and none is applied**. A6 escalates without dispatching a repair, the wave halts on its own red gate exactly as today, and the wave agents' uncommitted work is untouched because nothing ever wrote to the tree. The escalation names the capture as the cause. The capture mechanism and which failure modes it has are the TSPEC's (REQ O-1); the observable is that a seam which cannot guarantee reversibility does not act (BR-9, AC-5.1). |
| E-33 | `advisory.waveBudgetPerRun` is absent, malformed, or zero | Absent or malformed falls back to the shipped default `1`, per key independently like the other advisory keys, the key named in the tier's existing invalid-key report; a malformed value never disables the seam or the tier. An explicit `0` is **honoured as written**, not treated as misconfiguration: the tier stays enabled and every red wave escalates with no dispatch, observably distinct from E-01's inertness — the sixth summary row is **present** and reads `resolved: 0`, carrying one `escalated` invocation per red wave, each classed `unclassified` because no reply was ever classified (BR-2), where a disabled tier carries no advisory summary at all (AC-2.4, E-01). The key therefore validates as a **non-negative** integer — a distinct variant from the shipped positive-integer validator, which rejects `0` and substitutes the default; reusing it would turn an operator's `0` into `1` (E-32, BR-11, REQ C-2, AT-07-2b). |

### 5.5 Record, escalation, and reporting

| # | Condition | Specified behaviour |
|---|---|---|
| E-29 | The advisory record cannot be written | The action is refused rather than taken unrecorded — the tier's existing rule, unchanged (BR-13). |
| E-30 | The escalation log cannot be written | The escalation still happens and the operator is still told; the carrier for the write failure is the run report's notice channel, which the tier already downgrades a failed escalation-log write onto, while the halt report goes on carrying BR-14's diagnosis and root-cause class. Re-surfacing it in the halt report would be new behaviour, not inherited. A failed log write never upgrades an escalation to a resolution and never changes the halt (BR-13, BR-14, AT-06-6). |
| E-31 | A `plan-ordering-defect` recurs across runs | It is countable per feature from the durable escalation log without run logs (AC-6.4). **Honest limit:** because the per-feature advisory record is distilled into LEARNINGS and deleted at Phase PUB, A6's *resolution* counts do not survive the run — only escalations are durably countable. Making resolution counts durable is out of scope and bound in REQ O-2. |
| E-32 | The tier is enabled but A6 never fires in a run | The advisory summary carries a sixth row reading zero, as it carries five today. Enabled-but-quiet is an all-zero summary, not an absent key (AC-1.1, NFR-2). |

## 6. Acceptance Tests

Who/Given/When/Then. Each test names the FSPEC clause it falsifies. A test that can pass without the
behaviour existing is not listed; where the only honest oracle is a set-equality or a sequence
equality, it is stated as such rather than as an absence.

**Pre-A6 comparands are transcribed literals.** Four oracles below compare against "the pre-A6
baseline" or "the reason the pre-A6 pipeline emits" — AT-01-3, AT-01-4, AT-04-1, AT-05-3. No pre-A6
pipeline remains to run: A6 merged at `bb4d36fb` and the default-branch catalogue now reads six
(`pdlc-wave-gate-baseline.md` §4). The expected halt-reason string, the `halted` queue-row value and
the created-file set are therefore **literals transcribed into the fixture once**, from M-WG-3 and
M-WG-7 at baseline v1.2; a comparand re-derived from the code under test compares the pipeline
against itself and passes unconditionally.

### 6.1 FSPEC-AWG-01 — Seam, trigger, inertness

- **AT-01-1** — *Who:* the workflows suite. *Given* the advisory seam catalogue and every surface
  driven by it. *When* the catalogue is compared by set-equality against its transcribed literal.
  *Then* it has six members including `A6`, and the catalogue-driven surfaces — the per-seam report
  rows in particular — carry six rows where they carried five. A run in which the sixth row is absent
  is a defect. *(BR-2 context; AC-1.1, M-WG-8, M-WG-9.)*
- **AT-01-2** — *Who:* an operator running Phase I. *Given* a wave whose dispatch fails. *When* the
  wave ends. *Then* no advisory agent is dispatched and the run halts exactly as today. Repeat with a
  post-wave command failure; same result. *(BR-1, AC-1.2.)*
- **AT-01-3** — *Who:* an operator running Phase I. *Given* the final V-wave carrying the PROPERTIES
  tests. *When* its gate returns non-zero. *Then* A6 does not fire, no advisory agent is dispatched, and the halt reason string and the queue row written equal those the pre-A6 pipeline produces for the same gate failure. Named artifacts, not whole run text, which varies by timestamp (NFR-2). *(BR-1, AC-1.3.)*
- **AT-01-4** — *Who:* the disabled-tier suite. *Given* `advisory.enabled` false. *When* a wave's gate
  goes red. *Then* no advisory agent is dispatched, no model rung is resolved, the created-file set
  equals the pre-A6 baseline for the same run, and the report carries no advisory summary key. The
  test asserts the key is **absent**, not undefined. *(E-01, NFR-2, AC-1.4.)*
- **AT-01-5** — *Who:* an operator reading a run report. *Given* a run in which BL-03, BL-04, or both
  are absent. *When* the run completes. *Then* an oracle scanning the run report's whole notice surface and counting inapplicability *statements*, whoever authored the carrier, counts exactly **one**, naming every absent prerequisite; and **zero** in a run where A6 applies. It must not filter for A6-authored notices — A6 authors none, so that count reads zero in both arms and falsifies nothing. Population: runs that reach Phase I **and evaluate wave mode** — wave-executing and no-manifest legacy alike, the legacy arm a fixture, not an exclusion (ledger-skip and early-halt runs stay out). *(E-04, AC-1.5.)*
- **AT-01-6** — *Who:* the workflows suite. *Given* the tier enabled and a run in which no wave gate goes red, so A6 never fires. *When* the run completes. *Then* the report's advisory summary key is **present**, carries six per-seam rows, and every A6 counter reads zero. Paired with AT-01-4's key-**absent** assertion on the disabled tier, the two make present-and-undefined fail on both sides. *(E-32, AC-1.1, NFR-2.)*

### 6.2 FSPEC-AWG-02 — Invocation contract

- **AT-02-1** — *Who:* the workflows suite. *Given* the four-member classification vocabulary. *When*
  compared by **ordered-sequence** equality against its transcribed literal. *Then* it is exactly
  `plan-ordering-defect`, `wave-internal-defect`, `environmental`, `unclassified`, in that order. A
  deleted or invented class fails, and so does a reordering — which set equality would pass.
  *Given instead* a gate output matching both class 1 and class 2. *When* it is classified. *Then*
  the class reported is `plan-ordering-defect` and exactly one class is carried; the arm is what
  makes the ordering load-bearing rather than decorative. *(BR-2, E-08b, AC-2.2.)*
- **AT-02-2** — *Who:* the workflows suite. *Given* a verdict whose classification is absent, and a
  second whose classification is outside the set. *When* each is received. *Then* both read as
  `unclassified`, both escalate, and the attempt count is unchanged in both. *(E-08, BR-2.)*
- **AT-02-3** — *Who:* the workflows suite. *Given* a verdict that is both malformed and
  unclassifiable. *When* it is received. *Then* the outcome is the malformed-verdict escalation and
  exactly one attempt is consumed. *(E-09.)*
- **AT-02-4** — *Who:* the workflows suite. *Given* a diagnosis citing no gate output. *When* it is
  received. *Then* it is treated as malformed and escalates, consuming one attempt. *(E-10, BR-3.)*
- **AT-02-5** — *Who:* the workflows suite. *Given* a gate output longer than the halt message's tail.
  *When* A6 diagnoses. *Then* the evidence available to it is the full captured output, demonstrated
  by a citation to a region the tail does not contain. *(E-12, BR-3.)*
- **AT-02-6** — *Who:* an operator with `advisory.waveBudgetPerRun` at its default `1`. *Given* a run
  in which A6 attempted and escalated on waves 1 and 2. *When* wave 3's gate goes red. *Then* wave 3
  is dispatched. *Given instead* a run in which A6 **resolved** wave 1. *When* wave 2's gate goes red.
  *Then* wave 2 escalates with no dispatch. Two oracles that a "counts every invocation" reading would
  make disagree. *Given instead* `advisory.waveBudgetPerRun` at `0` with the tier enabled, and two red
  waves. *Then* neither is dispatched, the A6 summary row is present reading `resolved: 0` with **two**
  `escalated` invocations each classed `unclassified`, and the run is distinguishable from AT-01-4's
  disabled tier, which carries no summary key at all. *(E-26, E-27, E-33, BR-11, AC-2.4.)*
- **AT-02-7** — *Who:* the workflows suite. *Given* one A6 dispatch whose dispatch→verdict elapsed
  time exceeds `advisory.seamBudgetMinutes`. *When* the wave terminates. *Then* it escalates with
  `budget-exhausted`; and a companion case with a slow gate command whose every dispatch→verdict
  window stays inside budget terminates `resolved` on a green re-gate — a named positive disposition,
  since E-24 shares the `budget-exhausted` literal, so a non-escalation is not readable from the
  reason string alone. The window is BR-11's: one dispatch, dispatch→verdict; the
  companion's slow gate command sits between dispatches, outside every measured window. *(E-25, NFR-4, BR-11.)*
- **AT-02-8** — *Who:* the workflows suite. *Given* a verdict classified `environmental`, and a second classified `unclassified`, each carrying no repair proposal. *When* each is received. *Then* in both the terminal disposition is `escalated`, no repair is applied and no restoration is performed, the outcome carries **no** refusal reason, and the escalation-log entry carries the root-cause class. The assertion on the absent reason is paired with the positive assertions beside it, so a run that never reached the seam cannot satisfy it. *(E-11, E-19, BR-2, BR-15.)*
- **AT-02-9** — *Who:* the workflows suite. *Given* `advisory.attemptBudget` at `1`, `advisory.seamBudgetMinutes` pinned high enough that no window can exhaust it, and a wave whose re-gate stays red. *When* the wave terminates. *Then* exactly **one** A6 dispatch occurred on that wave and the disposition is `escalated` with `budget-exhausted`. *Given instead* `advisory.attemptBudget` at `2` under the same red re-gate. *Then* exactly **two** dispatches occurred. Counted, never bounded: a "no more than" oracle passes an implementation that dispatches none. *(E-24, BR-11, §3.2 step 3b.)*

### 6.3 FSPEC-AWG-03 — Envelope

- **AT-03-1** — *Who:* the workflows suite. *Given* the shipped default envelope. *When* compared by
  set-equality over member ids. *Then* it is exactly `E-1`…`E-6`. One set-equality, not prose joining
  two sets. *(BR-4, AC-3.1.)*
- **AT-03-2** — *Who:* the workflows suite. *Given* a proposal confined to the failing wave's own
  owned paths, where one of those paths is a test file. *When* the envelope is classified. *Then* it is refused, and the reason reported is `revert-on-test-touch`, the literal BR-15 transcribes for `X-a`, which precedes `X-d` in BR-5's order — not the declared-scope exclusion's `out-of-envelope` and not a permit under E-5. Asserting the reason is what makes the precedence claim falsifiable. *(E-14, BR-5.)*
- **AT-03-3** — *Who:* the workflows suite. *Given* a wave owning a self-modification guard path and
  a proposal confined to it. *When* the envelope is classified. *Then* the refusal reason is
  `out-of-envelope`. *(E-15, BR-5.)*
- **AT-03-4** — *Who:* the workflows suite. *Given* a proposal under E-6 naming a symbol a later PLAN
  task undertakes to produce. *When* the envelope is classified. *Then* it is permitted only if
  **both** halves hold; a companion case satisfying the symbol half but changing a path outside that
  later task's owned set is refused. *(BR-4, AC-3.1.)*
- **AT-03-5** — *Who:* the workflows suite. *Given* each excluded operation in BR-6 in turn — PLAN edit, PLAN **task-table** edit, file-ownership-manifest edit, test-command change, post-wave-command change, post-wave-pathspec change, commit, push, tag, and a path outside the computed set. *When* proposed. *Then* each is refused, each asserted by its own test; and the prohibition id set `(f)`…`(i)` is separately compared by set-equality against its transcribed literal, so a deleted prohibition fails here rather than passing a containment check. *(E-17, E-18, BR-6, AC-3.3, AC-3.5.)*
- **AT-03-6** — *Who:* the workflows suite. *Given* a proposal partly inside and partly outside the
  envelope. *When* it is evaluated. *Then* no part of it is present in the tree afterwards and the run
  does not report the wave resolved. *(E-16, AC-3.5.)*
- **AT-03-7** — *Who:* the workflows suite. *Given* the refusal-reason catalogue. *When* compared by
  **ordered-sequence** equality against the eight-member literal BR-15 transcribes. *Then* it still
  has exactly those eight members in that order; A6 added none. Ordered-sequence equality, never set
  equality. *(BR-15, AC-3.4.)*
- **AT-03-8** — *Who:* the workflows suite. *Given* the shipped exclusion catalogue. *When* compared against the five-clause literal BR-5 transcribes. *Then* the comparison is **ordered-sequence** equality over clause ids and the sequence is unchanged by A6. The order decides which reason a matching proposal reports, so a reordering must fail this test where a set assertion would pass it. *(BR-5, AC-3.2.)*

### 6.4 FSPEC-AWG-04 — What A6 may never do

- **AT-04-1** — *Who:* the workflows suite. *Given* any A6 verdict, including one asserting the wave
  is fixed with the highest confidence. *When* the gate command still returns non-zero on re-gate. *Then* three positive assertions on that one run: disposition equals `escalated`; the halt reason equals the reason the pre-A6 pipeline emits for the same gate failure (AT-05-3's literal), so the halt is the wave's own; resolved-wave count `0`. AC-4.1's conjunct (ii); restoration is AT-05-1's. The three assertions share this one run; it is AC-4.1's *conjuncts* that are split one per run across AT-04-1/-1a/-1b, so no run exhibits two conjuncts. *(BR-7, AC-4.1, AC-5.2.)*
- **AT-04-1a** — *Who:* the workflows suite. *Given* an applied in-envelope repair. *When* the gate
  re-runs green. *Then* the wave is reported resolved, proceeds, and that green invocation
  appears in AT-04-2's sequence. Conjunct (i). *(BR-7, AC-4.1, AC-4.4.)*
- **AT-04-1b** — *Who:* the workflows suite. *Given* an applied in-envelope repair. *When* **no**
  gate invocation follows. *Then* the wave halts: not resolved, resolved-wave count `0`.
  Conjunct (iii) carries the prohibition — it fails where a verdict stood in for a gate
  result — and is unreachable on an ordinary run, so the fixture suppresses the re-gate; its
  construction is the TSPEC's (O-1). *(BR-7, AC-4.1.)*
- **AT-04-2** — *Who:* the workflows suite. *Given* one A6 attempt on a wave with both commands
  configured. *When* the run completes. *Then* the ordered sequence of gate-command invocations for
  that wave equals `[post-wave, test, post-wave, test]`. Companion cases: a re-gate whose post-wave
  command failed yields `[post-wave, test, post-wave]`; a run with only a test command yields
  `[test, test]`. Asserted as a **sequence**, never as a set — set equality collapses duplicates and
  would admit a resolution declared on a single invocation. *(BR-7, AC-4.4.)*
- **AT-04-3** — *Who:* the workflows suite. *Given* an A6 invocation of any outcome. *When* the run
  completes. *Then* the set of committing writer **identities** is unchanged from the pre-A6 baseline — the pathspec-scoped per-task commit and the post-wave-pathspec build-output commit, both still reached only past a green gate. The assertion is over writer identity and the green-gate precondition, not the pathspec scope those writers pass: that scope may widen under O-8's E-6 resolution, which AT-04-5 asserts. *(BR-8, AC-4.2.)*
- **AT-04-4** — *Who:* the workflows suite. *Given* a red re-gate that exhausts the budget. *When* the
  wave halts. *Then* the refusal reason is recorded, the escalation entry is written, and the
  pre-A6 behaviour is taken — a positive assertion on all three, so the negative assertions of
  AT-04-1 and AT-04-3 cannot be satisfied by accident. *(AC-4.5.)*
- **AT-04-5** — *Who:* an operator inspecting the branch. *Given* a wave A6 resolved under E-6. *When*
  the wave's commit step completes. *Then* the repair is in the branch's committed state and no
  uncommitted working-tree change from the repair remains; the advisory record names the repair's
  paths and the later PLAN task that owns them; and that later task's dispatch is told the promotion already exists. Companion case, chosen to be red against today's behaviour: the same scenario with the later task's paths **outside** every configured post-wave pathspec, so the shipped commit loop — which commits only paths owned by tasks *in* the wave (M-WG-12) — leaves the repair uncommitted. It must fail before the fix and pass after (against the base M-WG-8 was measured at, §2); a fixture whose later-task paths sit inside a post-wave pathspec asserts nothing new. Second companion, for the durability half: after the E-6 resolution a later wave halts and the run is re-invoked, re-entering Phase I at wave 1 and re-dispatching every wave (M-WG-6). *Then* the later task's fresh dispatch is still told the promotion exists — read from the branch's committed state and the advisory record, both durable — so an in-run-only signal fails this arm. *(BR-12, AC-4.6, M-WG-12, M-WG-6.)*

### 6.5 FSPEC-AWG-05 — Reversibility and the unchanged halt

- **AT-05-1** — *Who:* the workflows suite. *Given* a refusal, a budget exhaustion, and a red re-gate
  in three separate runs. *When* each terminates. *Then* in each the working tree is observably identical to the wave's post-dispatch, pre-commit tree, with the wave agents' own uncommitted work intact. "Observably identical" is BR-9's content-level oracle, with BR-9's domain and observation point: the path-to-content-hash map over tracked and **non-ignored** untracked files, generated outputs included, taken immediately after restoration completes and before the record and escalation writes, equals the map taken before A6 acted. Ignored paths are excluded on both sides — an implementation that restores one fails this test rather than passing it — and a file the repair created is asserted **absent**, not merely reset. A `git status` comparison does not discriminate here and must not be the oracle. *(BR-9, AC-5.1.)*
- **AT-05-2** — *Who:* the workflows suite. *Given* a red re-gate on a run with a configured post-wave
  command that writes generated outputs. *When* the tree is restored. *Then* those generated outputs
  match the pre-A6 tree too, demonstrating whole-tree rather than per-path restoration — a case a
  repair-paths-only restore fails. The outputs the case ranges over are non-ignored ones; a fixture
  whose generated output is `.gitignore`d tests nothing here, since BR-9 puts it outside the map. *(BR-9, AC-4.4.)*
- **AT-05-3** — *Who:* an operator. *Given* a wave A6 did not resolve. *When* the run halts. *Then*
  the halt reason equals the reason the pre-A6 pipeline emits for the same gate failure, and the queue
  row is written `halted` exactly as today. *(BR-14, AC-5.2, M-WG-3, M-WG-7.)*
- **AT-05-4** — *Who:* the workflows suite. *Given* a green re-gate followed by a post-gate check that halts the wave — the un-skip guard, which runs after the gate and before the commits and halts on a skipped block owed by a completed task. *When* the run halts. *Then* no restoration was performed, the outcome is not recorded as a red re-gate, the repair A6 applied is still present in the working tree, and both the advisory record entry and the halt report state that a repair remains applied and name its paths. *(E-22, BR-10, AC-5.3.)*
- **AT-05-5** — *Who:* the workflows suite. *Given* a red re-gate whose restoration itself fails. *When* the wave terminates. *Then* the wave halts, the halt names the failed restoration, and no commit of any kind is reached — the tree is never carried forward as if restored. *(E-28, BR-9.)*

### 6.6 FSPEC-AWG-06 — Record, escalation, report

- **AT-06-1** — *Who:* an operator reading the feature's advisory record. *Given* any A6 invocation.
  *When* it terminates. *Then* an entry names the wave, the root-cause class, the envelope determination, the action taken or refused, and the gate-output citation. Containment is deliberate: the entry keeps the tier's record shape, whose closed assertion belongs to the tier's own entry-shape test; A6's only addition is the root-cause class, asserted present here. *(BR-13, AC-6.1.)*
- **AT-06-2** — *Who:* the workflows suite. *Given* a record write that fails. *When* an action would
  otherwise be taken. *Then* the action is refused and the outcome carries the tier's
  record-write-failure reason. *(E-29, BR-13.)*
- **AT-06-3** — *Who:* an operator reading the escalation log. *Given* an A6 escalation. *When* the
  entry is written. *Then* it carries the root-cause class alongside the tier's required fields and
  one sentence stating what the operator must decide. *(BR-13, AC-6.2.)*
- **AT-06-4** — *Who:* an operator reading a halt report. *Given* a halt following an A6 escalation.
  *When* the report is produced. *Then* it carries the diagnosis and its root-cause class. *(BR-14,
  AC-6.3.)*
- **AT-06-5** — *Who:* an operator counting recurrences. *Given* several runs in which A6 escalated
  `plan-ordering-defect`. *When* the escalation log alone is read, with no run logs. *Then* the count
  is derivable per feature. The companion negative is specified, not a gap: resolution counts are
  **not** derivable after Phase PUB, and REQ O-2 owns that. *(E-31, AC-6.4.)*
- **AT-06-6** — *Who:* the workflows suite. *Given* an escalation whose escalation-log write fails. *When* the wave terminates. *Then* the disposition is still `escalated`, the halt reason is unchanged from AT-05-3's literal, the failure to log is surfaced on the carrier E-30 names — the run report's notice channel — and the disposition is never upgraded to `resolved`. Contrast AT-06-2: a failed **record** write refuses the action, a failed **escalation-log** write does not undo the escalation. *(E-30, BR-13.)*

### 6.7 FSPEC-AWG-07 — Non-functional

- **AT-07-1** — *Who:* the workflows suite. *Given* each **agent-proposable** boundary in §4 — E-5's scope rule, E-6's two halves, and the rules the partition below names proposable. *When* a stub agent double returns a violating proposal — no live model, no prompt, the form AT-03-5 already uses. *Then* the proposal is refused by the workflow script, the shipped refusal reason is reported, and the working tree is unchanged — **except the BR-2 arm**, which carries BR-2's own outcome instead: an out-of-set class reads `unclassified`, authorises nothing, and the wave escalates with **no** refusal reason and **no** attempt consumed, the tree still unchanged (the shipped catalogue holds no reason for an out-of-vocabulary class; AT-02-8 pins the same path). The BR-3 arm pins `advisory.attemptBudget` to `1`, so the reported reason is the malformed-verdict one rather than the budget one a longer fixture would terminate on. The partition over BR-1…BR-16 is total, so no rule is left silently unlisted; BR-16's claim that every §4 boundary is script-enforced is discharged, not sampled. **Proposable, asserted here:** BR-2 (a class outside the vocabulary, under its own *Then* above), BR-3 (a diagnosis citing no gate output), BR-4 (E-5's scope rule and E-6's two halves, the arms the *Given* names first), BR-5, BR-6, BR-7 (a verdict asserting the wave is fixed, AT-04-1's case re-run through the stub double), BR-8. **Not proposable, by construction:** BR-1, BR-9…BR-16, each decided by the script before or after any proposal is read, so no proposal can violate it. *(BR-16, NFR-1, BR-2, BR-3, AT-02-8.)*
- **AT-07-2** — *Who:* the workflows suite. *Given* the transcribed set-equality surfaces M-WG-9
  names — the seam catalogue, the envelope defaults, the advisory config key set, the two
  catalogue-driven surfaces, and the disabled-tier fixtures. *When* the suite runs. *Then* each has
  been updated for A6, `E-5`/`E-6`, and `advisory.waveBudgetPerRun`; this feature is not deliverable as a purely additive change and a run in which a surface was not re-checked is a defect. Assertion, not narration: each surface is compared by set-equality against its transcribed literal, and the comparison fails when a surface still carries its pre-A6 literal. *(R-5, BL-06.)*
- **AT-07-2b** — *Who:* the workflows suite. *Given* the advisory config key set as the module under test exposes it. *When* compared by set-equality against a literal transcribed from this spec — the shipped keys plus `waveBudgetPerRun`. *Then* the sets are equal, and the default read back for `waveBudgetPerRun` equals `1`. Companion: `0` in yields `0` back, key absent from the invalid-key report — the assertion the shipped positive-integer validator fails (E-33). The literal is transcribed from the spec and the value is read back from the module, never the reverse; the parse-and-default fixtures are asserted in the same test so a key added without a default fails. *(C-2, BR-11, E-33.)*
- **AT-07-3** — *Who:* the workflows suite. *Given* a green wave. *When* the run completes. *Then*, on that one run, the green wave's A6 dispatch count equals `0` **and** that wave reached its post-gate commit step with its per-task commit performed, while a red-gated wave in the same run has a dispatch count `≥ 1`. Two counts on one run distinguish "nothing ran" from "the path was never reached"; an absence-only assertion cannot. No timing assertion: wall-clock cost is not decidable in a unit suite, and NFR-5 rests on reachability, not a stopwatch. *(NFR-5.)*
- **AT-07-4** — *Who:* the workflows suite. *Given* an A6 dispatch. *When* the model is resolved.
  *Then* it is resolved through the tier's exported rung resolver, not through literals restated in
  this feature's code. *(NFR-6, REQ O-3.)*
- **AT-07-5** — *Who:* the workflows suite. *Given* an A6 dispatch and a dispatch of an already-shipped advisory seam in the same run. *When* the two dispatches' options are compared. *Then* A6's tool grants, transport and environment equal the shipped seam's, member for member — the reuse argument AT-07-4 makes for the model rung. A6 introduces no capability of its own, so equality against a shipped seam is the whole assertion, and no reviewer judgement is left inside §6. *(NFR-3.)*

## 7. Open Questions

**No question in this FSPEC is open against the operator.** The REQ's five operator questions were
decided on 2026-08-13 and their provenance is recorded in
`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md` (Q-1…Q-5). This section carries forward
only obligations on downstream authors, and the deferrals the REQ already made, so the TSPEC author
inherits them from one place.

### 7.1 Obligations carried to the TSPEC

| # | Obligation | Owner | This FSPEC states |
|---|---|---|---|
| O-1 | The restoration mechanism behind BR-9, and the point at which the pre-A6 tree state is captured. Its failure modes are E-28 (restoration fails) and E-34 (capture fails). | Feature TSPEC | Only the observable: whole-tree, three triggers, wave agents' work intact |
| O-3 | Reuse of the tier's exported model-rung resolver rather than restated literals | Feature TSPEC | Only that the rung is the tier's (AT-07-4) |
| O-4 | How a wave's owned-path set is computed for E-5 and E-6, and how a proposal's changed paths are compared against it | Feature TSPEC | Only the membership rule (BR-4) |
| O-5 | Whether the root-cause classification is derived by the seam or supplied by the wave's own agents | Feature TSPEC | Only the vocabulary and its totality (BR-2) |
| O-8 | How an E-6 repair reaches committed state through the existing pathspec-scoped commit path, and how the later task's dispatch is told the promotion already exists | Feature TSPEC | Only the outcome: no resolved wave leaves the repair uncommitted (BR-12) |

BR-12 is the one that most rewards early attention: it is a genuine gap against shipped scope
(M-WG-12), not a restatement of it, and a TSPEC that treats it as already covered will ship an E-6
resolution whose repair is stranded uncommitted.

### 7.2 Deferrals — out of scope, with a named owner

These are not open questions in this feature. They are recorded so a reviewer who notices the gap
finds it already routed rather than raising it as a finding.

| # | Deferred | Owner |
|---|---|---|
| O-2 | Persisting per-seam **resolution** counts, so resolution rate is measurable at all (E-31) | `pdlc-engineering-loop` (queue row 6) |
| O-6 | Improving PLAN's dependency derivation, so a task is not scheduled before the task that promotes what it consumes | `pdlc-engineering-loop` (queue row 6) |
| O-7 | Build-breaking source defects — post-wave command red — being outside A6's reach. A decision (Q-2), not an oversight; any remedy is a separate mechanism with its own trigger and budget, never a widened A6 | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-01 | Widening E-5/E-6 | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-02 | A6 coverage of the PROPERTIES V-wave — it has no owned-path set (E-05) | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-03 | A POSTMORTEM lifecycle and an approval skip for Phase I (M-WG-5, M-WG-6) | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-03b | Re-entry at the failed wave rather than wave 1 | `pdlc-wave-resume` (queue row 20) |
| D-AWG-04 | Firing A6 on post-wave command failure | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-05 | Re-running the gate for `environmental` classifications without a repair (Q-3: no, in v1) | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-06 | Mode-aware Phase I halt reporting, and a structured halt record for a wave-gate halt | `pdlc-engineering-loop` (queue row 6) |

### 7.3 Assumptions this FSPEC makes explicit

- **A-1.** BL-06's three enumerations — the transcribed set-equality surfaces this feature reds, a re-measurement of the BL-03 no-manifest notice E-04's cardinality rests on, and that notice's mutual exclusivity with BL-04's, which E-04 consumes as fact — are assumed complete before implementation planning. AT-07-2 is the observable; skipping the enumeration surfaces later as unexplained red suites.
- **A-2.** The line references in `pdlc-wave-gate-baseline.md` §1–§2 have drifted since they were measured; the symbol- and grep-anchored recipes in §3 still resolve. This FSPEC cites by `M-WG-*` id at the baseline's stated `Version` (1.2), never by line, so drift below a cited id invalidates the baseline row — that file's change-control problem — not a clause here.
- **A-3.** R-1 is accepted, not solved: a repair inside the wave's own production files can be the
  wrong repair and still turn the suite green. The exclusion of test files (BR-5) removes the worst
  version of it and Phase DOD's Final Codebase Review still runs over the result, but a residual risk
  is real. That is why the tier ships disabled, and this FSPEC specifies no behaviour that assumes an
  operator has enabled it.
- **A-4.** R-3 is bounded honestly: `advisory.waveBudgetPerRun` bounds drift *within* a single run
  only. Drift across runs is bounded by the operator arriving between them, not by a number,
  and no clause here claims otherwise.

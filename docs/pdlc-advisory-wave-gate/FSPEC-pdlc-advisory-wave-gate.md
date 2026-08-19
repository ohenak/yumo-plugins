# FSPEC — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` |
| Downstream | `TSPEC-pdlc-advisory-wave-gate.md`, `PLAN-pdlc-advisory-wave-gate.md`, `PROPERTIES-pdlc-advisory-wave-gate.md` |
| Cross-Reviews | (active) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.0 | 2026-08-18 |

## 1. Overview

**Scope in one line.** This FSPEC specifies the observable behaviour of **A6**, a sixth advisory
seam that fires when a Phase I implementation wave's script-owned test gate returns non-zero, gets
one bounded and reversible repair attempt inside a declared file envelope, re-runs the wave's own
gate sequence, and — if the gate does not go green on its own — escalates and leaves the pipeline
halting exactly as it halts today, with a diagnosis attached.

**What this document adds over the REQ.** The REQ states the outcomes an operator can observe. This
FSPEC states the *order* in which they become observable: the decision points inside one A6
invocation, which condition wins when two apply, what each terminal disposition leaves on disk, and
the Who/Given/When/Then tests that decide whether the behaviour shipped.

**What this document deliberately does not state.** No seam signature, no injected-dependency name,
no algorithm for computing an owned-path set, no restoration mechanism, no field layout of any
shipped record. Those are the TSPEC's, and the REQ already routes them there (O-1, O-3, O-4, O-5,
O-8). Where behaviour that already ships is referenced, it is cited by `M-WG-*` id from
`docs/_constraints/pdlc-wave-gate-baseline.md` v1.1, and tier behaviour by section id from
`docs/_constraints/pdlc-advisory-corpus-baseline.md` (§1–§4), rather than restated.

**Reading order.** §3 gives the single lifecycle end to end; §4 gives the rules that decide the
branches §3 names; §5 gives what happens when an input is absent, malformed, or contradictory; §6
gives the acceptance tests. A reader who wants only the boundary should read BR-4 through BR-9.

**Inherited contracts.** A6 is an extension of a shipped tier, not a new mechanism (REQ C-1). The
verdict shape, the confidence-and-envelope action gate, the ordered eight-member refusal-reason
catalogue, the exclusion set, the per-feature advisory record, the escalation log, and the model
rung are the tier's and are used unchanged. This FSPEC states only what A6 adds: one trigger, one
classification vocabulary, two envelope members, one config key, four prohibitions, and one
re-gate-and-restore cycle.

**Non-goals, restated from REQ §4 because they bound this spec's tests.** A6 does not change the
wave gate, wave partitioning, or commit discipline; does not fix PLAN dependency derivation; does
not give Phase I a POSTMORTEM lifecycle or an approval skip; does not apply to the final V-wave; does
not apply on the legacy worktree path; and changes no other seam, no refusal reason, and no model
rung.

## 2. Linked Requirements

Every clause below traces to `REQ-pdlc-advisory-wave-gate` v1.6. The FSPEC unit is the behavioural
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

**Where a requirement is deliberately not specified here.** REQ O-1 (restoration mechanism), O-3
(rung resolver reuse), O-4 (owned-path computation and comparison), O-5 (whether the classification
is derived by the seam or supplied by the wave's own agents) and O-8 (how an E-6 repair reaches
committed state) are obligations on the TSPEC. This FSPEC states the outcome each must produce and
nothing about how; §7 carries them forward so the TSPEC author inherits them from one place.

## 3. Behavioral Flow

### 3.1 Baseline — the wave as it behaves today

One Phase I wave runs its members in parallel in one shared tree, told not to commit. Three
conditions end the wave, in this order, with nothing committed: a dispatch-level failure (M-WG-1);
the configured post-wave command failing (M-WG-2); the script-owned test gate failing (M-WG-3). Only
past a green gate does anything commit, pathspec-scoped, per task and then for the post-wave
pathspecs (M-WG-4). A6 sits between the third condition and the halt it causes. It sits nowhere else.

### 3.2 The A6 lifecycle

**Step 1 — Applicability.** Before anything is dispatched, the run establishes whether A6 applies at
all. It applies only when all four hold: the tier is enabled; Phase I is in wave mode on a valid
ownership manifest (BL-03); a script-owned gate is configured (BL-04); and the wave is an ordinary
implementation wave, not the final V-wave. If any fails, A6 does not apply, the phase behaves exactly
as it does today, and inapplicability is stated once per run on the run's notice surface (§5 E-01,
E-02, E-03).

**Step 2 — Trigger.** A6 fires on exactly one condition: the script-owned test gate returning
non-zero for an ordinary wave (M-WG-3). A dispatch-level failure (M-WG-1) and a post-wave command
failure (M-WG-2) both halt exactly as today and never reach A6 (BR-1).

**Step 3 — Budget admission.** Before dispatch, the run checks the wave budget: if A6 has already
*resolved* `advisory.waveBudgetPerRun` distinct waves in this run, the wave escalates without any
dispatch (BR-11). Attempt and time budgets are read at step 3b, not here.

**Step 3b — Attempt admission.** The run reads the wave's consumed-attempt count against `advisory.attemptBudget`. If no attempt remains, the wave escalates with the tier's `budget-exhausted` reason and nothing further is dispatched (BR-11, E-24). Otherwise one attempt is available and control passes to step 4. Every arrival here reads the same counter — the first arrival and each return from step 8b alike — so the number of A6 dispatches on one wave never exceeds `advisory.attemptBudget`, and equals it exactly when every attempt ends in a red re-gate.

**Step 4 — Diagnose.** A6 is dispatched on the tier's existing model rung, receives the gate
command's captured output, and returns the tier's existing verdict carrying one added field: a
root-cause classification drawn from a four-member closed vocabulary (BR-2). The diagnosis must cite
the gate output it rests on (BR-3).

**Step 5 — Authorisation.** The tier's existing rule decides whether any action is taken: only when
the proposal is inside the envelope **and** confidence is high. A6 adds two envelope members, E-5 and
E-6 (BR-4), keeps the tier's exclusions unchanged and precedence-first (BR-5), and adds four further
prohibitions (BR-6). Two of the four classifications — `environmental` and `unclassified` — authorise
nothing at all, whatever the confidence (BR-2).

**Step 6 — Repair.** If and only if step 5 authorises it, the repair is applied to the working tree.
Nothing is committed at this step or any other: A6 never commits (BR-8).

**Step 7 — Re-gate.** The wave's whole gate sequence re-runs, in the order the wave itself ran it:
the configured post-wave command first, then the test command (BR-7). Only that sequence returning
success declares the wave green; no verdict field substitutes for it (BR-7).

**Step 8a — Green re-gate.** The wave proceeds past the gate into exactly the post-gate path it would
have reached had the gate been green on the first pass. Any later check on that path may still halt
the wave; such a halt is not a red re-gate and is not a restoration trigger (BR-10). Where the repair
was authorised under E-6 and therefore touches paths a *later* PLAN task owns, the wave's commit step
must still leave the repair in the branch's committed state, and the later task's dispatch is told
the promotion already exists (BR-12).

**Step 8b — Red re-gate.** The attempt is consumed, the **whole working tree** is restored to the
state it stood in immediately before A6 acted — the wave's post-dispatch, pre-commit tree, with the
wave agents' own uncommitted work intact — and control returns to step 3b's attempt check (BR-9).

**Step 9 — Terminal disposition.** Every invocation ends in exactly one of: *resolved* (step 8a
reached on a green re-gate); *escalated* (refusal, malformed verdict, budget exhaustion, or a red
re-gate with no attempt left); or *no-action* (the tier disabled, or A6 inapplicable). An entry is
appended to the feature's advisory record for every terminal disposition, and an escalation entry to
the durable escalation log for every escalated one (BR-13). Record-write failure refuses the action
rather than proceeding unrecorded, as the tier already requires.

**Step 10 — Halt, unchanged.** When A6 does not resolve the wave, the pipeline's existing behaviour
proceeds untouched: the same halt with the same reason it emits today (M-WG-3), and the same queue
row written `halted` (M-WG-7). The halt report additionally carries the diagnosis and its root-cause
class. Escalation adds information; it never changes control flow (BR-14).

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

Steps 4 and 4b are separate decisions because they consume differently: a malformed verdict or an uncited diagnosis costs one attempt (E-07, E-10), while an absent or out-of-set classification costs none (BR-2, E-08). Where both apply, E-09's tie-break governs.

## 4. Business Rules

Each rule states one decidable proposition and names the REQ clause it realises. Where two rules
could both apply, the precedence rule says which wins; there is no case in which the answer is
"either".

**BR-1 — One trigger, and it is the test gate (AC-1.2, AC-1.3).** A6 fires when, and only when, the
script-owned test gate returns non-zero for an ordinary implementation wave. It does not fire on a
dispatch-level failure — there is no completed work to repair. It does not fire on a post-wave command
failure — the single run is the detection, and the consequence, that a build-breaking source defect is
permanently outside A6's reach, is a decision (REQ O-7), not an oversight. It does not fire for the
final V-wave, which carries no ownership-manifest row and therefore gives E-5 and E-6 no owned-path
set to range over: a seam whose envelope cannot be evaluated must not act.

**BR-2 — The classification vocabulary is closed on one side and total on the other (AC-2.2, C-3).**
Every A6 verdict carries a root-cause classification drawn from exactly this set:

| # | Class | Meaning | Authorises action? |
|---|---|---|---|
| 1 | `plan-ordering-defect` | the failure names a symbol, file or artifact the PLAN itself schedules for a **later** task than the one that consumed it | yes, subject to E-6 |
| 2 | `wave-internal-defect` | the failure is attributable to work this wave produced, inside paths this wave owns | yes, subject to E-5 |
| 3 | `environmental` | the failure reproduces independently of this wave's diff — a pre-existing red, a missing tool, a transport failure | no |
| 4 | `unclassified` | none of the above is decidable from the gate output | no |

The set is asserted by set-equality, so a deleted or invented class fails the suite. The receiving
side is total: a classification that is absent, or outside the set, reads as `unclassified` rather
than being rejected. Because `unclassified` authorises nothing, such a wave escalates **without
consuming an attempt** — an attempt is a repair-and-re-gate cycle, and no repair was attempted.

**BR-3 — A diagnosis without gate-output evidence is malformed (AC-2.3, AC-2.1).** The gate output is
the only evidence that distinguishes a repair from a guess, so a diagnosis citing none is malformed
under the tier's existing rule and escalates, consuming one attempt. The evidence available to A6 is
the gate command's captured output as A6 receives it, not the truncated tail the halt message shows a
human, so the rule stays satisfiable on a long suite.

**BR-4 — The envelope gains exactly two members (AC-3.1).** A6 adds E-5 and E-6 to the shipped
four-member default envelope, each with a decidable membership rule:

| # | Permitted | Decidable rule |
|---|---|---|
| E-5 | a repair confined to the failing wave's **own** owned paths | every path the proposal would change is a member of the union of the owned-path sets the PLAN's ownership manifest assigns to that wave's tasks |
| E-6 | completing a promotion the PLAN schedules for a **later** task | the gate output names a symbol or artifact that a later task's PLAN row already undertakes to produce, **and** every path the proposal would change is a member of that later task's owned-path set |

Nothing else A6 proposes is in the envelope. The shipped envelope becomes one closed six-member set,
assertable by a single set-equality over member ids, never by prose joining two sets. E-5 and E-6 are not two further act kinds beside `E-1`…`E-4`: A6 widens the envelope's semantics
from act kinds alone to act-plus-scope. `E-1`…`E-4` name what may be done; E-5 and E-6 name
where a repair may land. A proposal is in the envelope only when both readings hold — an act the
shipped set already names, landing inside the path scope E-5 or E-6 computes. A proposal whose
changed paths fall outside that scope is refused by the tier's existing declared-scope exclusion
and reports that exclusion's reason, not a new one. E-5 therefore admits no act the shipped four
do not already admit; the residual it leaves — a wrong repair of a permitted kind inside owned
production files — is R-1, accepted in §7.3 A-3 and not solved here.

**BR-5 — Exclusions win over permissions, always (AC-3.2).** The tier's existing exclusion set holds
unchanged for A6, and its clauses take precedence over E-5 and E-6 wherever both could apply. Two
consequences are named rather than discovered. First, the clause excluding any change to a test file
or test configuration binds even when the failing test sits inside the wave's own owned paths:
editing the test to turn a red gate green is the pipeline's most dangerous failure mode, and A6 sits
closer to it than any other seam. Second, the clause excluding the self-modification guard paths
holds unchanged, so in this repository a wave owning `pdlc/workflows/`, `pdlc/skills/`,
`pdlc/hooks/` or `.claude/workflows/` escalates `out-of-envelope` — meaning the 2026-08-09 motivating
incident would today be diagnosed and escalated, not repaired, while the 2026-08-11 incident in a
consumer repository is unaffected. Relaxing either is out of scope and must never be taken without
an operator. The shipped exclusion catalogue is **ordered**, and the order is load-bearing: classification
walks it in order and the first matching clause decides which refusal reason is reported. Its
oracle is therefore ordered-sequence equality over the shipped clause ids — the same unit
BR-15's refusal reasons get, never set equality (AT-03-8) — because a reordering silently
changes the reason A6 reports while a set assertion still passes.

**BR-6 — Four further prohibitions, as a closed set (AC-3.3, AC-4.3).** In addition to the tier's
exclusions, A6 may not: (f) change the PLAN, its task table, or its file-ownership manifest; (g)
change implementation configuration — the test command, the post-wave command, or the post-wave
pathspecs; (h) commit, push, or tag; (i) touch any path outside the set E-5 and E-6 compute for this
invocation. These four are a closed set and are asserted as one: the prohibition ids `(f)`…`(i)` are
compared by set-equality, so a deleted prohibition fails the suite instead of passing a
containment check, and each prohibited operation is additionally exercised one by one (AT-03-5).

**BR-7 — Only the gate declares the wave green, and the whole sequence re-runs (AC-4.1, AC-4.4).** No
advisory verdict substitutes for a gate result. After a repair, the wave's whole gate sequence
re-runs in the order the wave itself ran it: the configured post-wave command first, then the test
command. Re-running the post-wave command first is not incidental — a source-touching repair would
otherwise re-red the gate for its own unbuilt outputs. A post-wave command failing on re-gate is a
red re-gate, not an immediate halt as it is on the first pass; that pass reaches no test command, so
it contributes a truncated sequence, which is an admitted form and not a defect. The observable is an
**ordered sequence**: the gate-command invocations for a wave equal, as a sequence, the shipped
sequence concatenated once per gate pass, where passes = 1 + attempts (the first pass is not an
attempt), with a failing pass truncated at the failing command. One attempt gives
`[post-wave, test, post-wave, test]`; `[post-wave, test, post-wave]` means the re-gate's post-wave
command failed; `[test, test]` is a run with only a test command configured. Set equality is the
wrong unit — it collapses duplicates and would admit a resolution declared on a single invocation.

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
from a repair that is no longer present. "Observably identical" is a content-level oracle, not a `git status` one: the map from path to
content hash, taken over tracked and untracked files alike and including generated outputs,
equals the same map taken immediately before A6 acted. A status-level comparison would pass a
per-path restore whenever the re-run post-wave command rewrote paths the wave had already
dirtied — the very case this rule exists to fail (AT-05-2).

**BR-10 — A post-gate halt is not a restoration trigger (AC-4.4, AC-5.3).** A green re-gate lets the
wave proceed past the gate into the same post-gate path it would have reached anyway, and a later
check on that path may still halt the wave. That halt is neither a red re-gate nor a restoration
trigger; the three triggers in BR-9 are exhaustive. One consequence is stated here rather than left to be discovered: on this path the repair A6
applied stays in the working tree, because no restoration trigger fired. The advisory record
entry and the halt report therefore both state that a repair remains applied and name its paths,
so the operator arriving at the halt is never told that a machine-authored change was reverted
when it was not (AC-5.1, AC-5.3, E-22).

**BR-11 — Three budgets, and exceeding any of them escalates rather than retries (AC-2.4).** More
than `advisory.attemptBudget` attempts on one wave; more than `advisory.seamBudgetMinutes` of working
time on a single invocation, measured excluding time spent running the gate command (NFR-4) — an **invocation** being one A6 episode on one wave, opening when that wave's gate first
returns non-zero and step 3b admits an attempt, closing at step 9's terminal disposition, and so
spanning up to `advisory.attemptBudget` dispatch/repair/re-gate cycles. The exclusion covers the
run time of **every** gate-command invocation inside that window, first pass and each re-gate
alike; a slow suite therefore cannot starve the attempt budget, and a slow diagnosis is what the
budget catches (E-25, AT-02-7); and more
than `advisory.waveBudgetPerRun` distinct waves *resolved* in one run. Only resolutions consume wave
budget: two waves A6 attempted and escalated leave the budget untouched and a third red wave still
gets its attempt, whereas one wave A6 resolved exhausts the shipped default of `1` and the next red
wave escalates without dispatch. An attempt is one repair-and-re-gate cycle.

**BR-12 — An E-6 resolution does not leave the repair uncommitted (AC-4.6).** When A6 resolves a wave
under E-6, once the wave's commit step completes the repair is part of the branch's committed state.
This is a real gap in the shipped scope, not a restatement of it: the wave commit loop commits only
paths owned by tasks *in that wave* (M-WG-12), and an E-6 repair by construction touches a later
task's paths. The repair's paths, and the later PLAN task that owns them, are named in the advisory
record, and that later task's dispatch is told its owned paths already carry the promotion so it
revises what exists rather than rediscovering it. How the existing pathspec-scoped commit path comes
to cover those paths is the TSPEC's (REQ O-8).

**BR-13 — No action without a record; every escalation is durably logged (AC-6.1, AC-6.2).** An entry
is appended to the feature's advisory record for every A6 invocation, naming the wave, the root-cause
class, the envelope determination, the action taken or refused, and the gate-output citation the
diagnosis rests on. The tier's existing rule holds: an action taken with no record written is a
defect, and a failed record write refuses the action. Every escalation additionally appends an entry
to the escalation log carrying the root-cause class alongside the fields the tier already requires,
and stating in one sentence what the operator must decide.

**BR-14 — Escalation adds information and never changes control flow (AC-5.2, AC-6.3).** When A6 does
not resolve the wave, the pipeline halts with the same reason it emits today and writes the same
`halted` queue row. The halt report carries the diagnosis and its root-cause class, so the operator's
turn starts with the diagnosis on the halt path and not only in a file they must go find.

**BR-15 — Refusal reasons are the tier's eight, unextended (AC-3.4).** Any refusal reports a reason
drawn from the tier's existing closed, ordered eight-member refusal-reason set. A6 does not extend it:
if an A6 refusal cannot be expressed in that set, that is a defect in this specification, not a
missing ninth reason. A diagnosis-only outcome — `environmental` or `unclassified` — is not a refusal;
it is an escalation with no proposal to refuse, and it needs no reason.

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
| E-04 | Both BL-03 and BL-04 are absent | Still **exactly one** inapplicability notice on the run's notice surface, naming every absent prerequisite. The observable is a cardinality on a named surface, not a mention: exactly one notice per run, not per wave, and none at all in a run where A6 applies. The population is a run that actually reaches Phase I: a run halting in an earlier phase, or skipping Phase I outright on a recorded wave ledger, emits none and is outside this criterion. The shipped once-per-run notices are the carriers — the inapplicability statement is added to them, never emitted beside them — and those carriers are mutually exclusive, the no-manifest carrier sitting on the legacy-path branch and the script-gate carrier on that branch's other arm, so in this both-absent case the no-manifest carrier alone discharges the requirement. The oracle counts inapplicability *statements* on the surface whoever authored the carrier, never A6-authored notices only: A6 authors no notice of its own, so an author-filtered count reads zero against the very implementation this row specifies (AC-1.5). |
| E-05 | The failing wave is the final V-wave carrying the PROPERTIES tests | A6 does not fire and the gate failure halts exactly as today (BR-1). |
| E-06 | The run is on the legacy worktree path | A6 does not apply; wave mode is a precondition of the seam existing at all (REQ §4). |

E-02 and E-06 are **inherited-behaviour rows**: they add no observable of their own beyond A6's absence, which AT-01-4 and AT-01-5 already assert, and the degraded self-report gate and the legacy worktree path are covered by the shipped suites that own them. They are listed so a reader checking applicability finds every arm, not because they owe this feature a test.

### 5.2 Verdict and classification

| # | Condition | Specified behaviour |
|---|---|---|
| E-07 | The verdict is malformed | Escalation consuming one attempt, never a pass — the tier's existing rule, unchanged (AC-2.1). |
| E-08 | The classification field is absent, or carries a value outside the four-member set | Read as `unclassified` rather than rejected; because `unclassified` authorises nothing, the wave escalates **without** consuming an attempt (BR-2). |
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
| E-23 | The run ends on the wave's own gate halt | It ends on the restored tree — the tree as it stood before A6 acted, first-pass build outputs included (BR-9, AC-5.2). |
| E-24 | `advisory.attemptBudget` is exhausted on one wave | Escalate; the reason is the tier's `budget-exhausted` (BR-11, BR-15). |
| E-25 | `advisory.seamBudgetMinutes` is exceeded on one invocation | Escalate `budget-exhausted`. The budget is measured excluding gate-command run time, without which a slow suite ends the invocation inside attempt 1 and `attemptBudget` never binds (NFR-4). |
| E-26 | A6 already resolved `advisory.waveBudgetPerRun` waves this run, and a further wave goes red | Escalate with no dispatch at all (BR-11). |
| E-27 | A6 attempted and escalated on two earlier waves, and a third wave goes red | The third wave still gets its attempt: only resolutions consume wave budget (BR-11). |
| E-33 | `advisory.waveBudgetPerRun` is absent, malformed, or zero | Absent or malformed falls back to the shipped default `1`, per key and independently of the other advisory keys, and the key is named in the tier's existing invalid-key report; a malformed value never disables the seam or the tier. An explicit `0` is honoured as written: the tier stays enabled, every red wave escalates without dispatch, and the run reports the sixth row reading zero (E-32). Zero is a legitimate operator setting — advisory diagnosis off while the rest of the tier runs — not a misconfiguration to be corrected (BR-11, REQ C-2). |
| E-28 | Restoration itself fails | The wave halts. A6 must never leave a tree it can neither repair nor restore, and the mechanism and its failure handling are the TSPEC's (REQ O-1, carried in §7). |

### 5.5 Record, escalation, and reporting

| # | Condition | Specified behaviour |
|---|---|---|
| E-29 | The advisory record cannot be written | The action is refused rather than taken unrecorded — the tier's existing rule, unchanged (BR-13). |
| E-30 | The escalation log cannot be written | The escalation still happens and the operator is still told; a failed log write never upgrades an escalation into a resolution, and never changes the halt. |
| E-31 | A `plan-ordering-defect` recurs across runs | It is countable per feature from the durable escalation log without run logs (AC-6.4). **Honest limit:** because the per-feature advisory record is distilled into LEARNINGS and deleted at Phase PUB, A6's *resolution* counts do not survive the run — only escalations are durably countable. Making resolution counts durable is out of scope and bound in REQ O-2. |
| E-32 | The tier is enabled but A6 never fires in a run | The advisory summary carries a sixth row reading zero, as it carries five today. Enabled-but-quiet is an all-zero summary, not an absent key (AC-1.1, NFR-2). |

## 6. Acceptance Tests

Who/Given/When/Then. Each test names the FSPEC clause it falsifies. A test that can pass without the
behaviour existing is not listed; where the only honest oracle is a set-equality or a sequence
equality, it is stated as such rather than as an absence.

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
  tests. *When* its gate returns non-zero. *Then* A6 does not fire and the halt is byte-comparable to
  today's. *(BR-1, AC-1.3.)*
- **AT-01-4** — *Who:* the disabled-tier suite. *Given* `advisory.enabled` false. *When* a wave's gate
  goes red. *Then* no advisory agent is dispatched, no model rung is resolved, the created-file set
  equals the pre-A6 baseline for the same run, and the report carries no advisory summary key. The
  test asserts the key is **absent**, not undefined. *(E-01, NFR-2, AC-1.4.)*
- **AT-01-5** — *Who:* an operator reading a run report. *Given* a run in which BL-03, BL-04, or both
  are absent. *When* the run completes. *Then* an oracle scanning the whole notice surface and
  filtering for A6-authored inapplicability notices counts exactly **one**, naming every absent
  prerequisite; and in a run where A6 applies it counts **zero**. *(E-04, AC-1.5.)*

### 6.2 FSPEC-AWG-02 — Invocation contract

- **AT-02-1** — *Who:* the workflows suite. *Given* the four-member classification vocabulary. *When*
  compared by set-equality against its transcribed literal. *Then* it is exactly
  `plan-ordering-defect`, `wave-internal-defect`, `environmental`, `unclassified`. A deleted or
  invented class fails. *(BR-2, AC-2.2.)*
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
  make disagree. *(E-26, E-27, BR-11.)*
- **AT-02-7** — *Who:* the workflows suite. *Given* an invocation whose working time excluding
  gate-command run time exceeds `advisory.seamBudgetMinutes`. *When* it terminates. *Then* it
  escalates `budget-exhausted`; and a companion case with a slow gate command and fast working time
  does **not** escalate, so the exclusion is falsifiable rather than decorative. *(E-25, NFR-4.)*

### 6.3 FSPEC-AWG-03 — Envelope

- **AT-03-1** — *Who:* the workflows suite. *Given* the shipped default envelope. *When* compared by
  set-equality over member ids. *Then* it is exactly `E-1`…`E-6`. One set-equality, not prose joining
  two sets. *(BR-4, AC-3.1.)*
- **AT-03-2** — *Who:* the workflows suite. *Given* a proposal confined to the failing wave's own
  owned paths, where one of those paths is a test file. *When* the envelope is classified. *Then* it
  is refused on the test-artifact exclusion, not permitted under E-5. *(E-14, BR-5.)*
- **AT-03-3** — *Who:* the workflows suite. *Given* a wave owning a self-modification guard path and
  a proposal confined to it. *When* the envelope is classified. *Then* the refusal reason is
  `out-of-envelope`. *(E-15, BR-5.)*
- **AT-03-4** — *Who:* the workflows suite. *Given* a proposal under E-6 naming a symbol a later PLAN
  task undertakes to produce. *When* the envelope is classified. *Then* it is permitted only if
  **both** halves hold; a companion case satisfying the symbol half but changing a path outside that
  later task's owned set is refused. *(BR-4, AC-3.1.)*
- **AT-03-5** — *Who:* the workflows suite. *Given* each excluded operation in BR-6 in turn — PLAN
  edit, manifest edit, test-command change, post-wave-command change, post-wave-pathspec change,
  commit, push, tag, and a path outside the computed set. *When* proposed. *Then* each is refused,
  each asserted by its own test. *(E-17, E-18, AC-3.3, AC-3.5.)*
- **AT-03-6** — *Who:* the workflows suite. *Given* a proposal partly inside and partly outside the
  envelope. *When* it is evaluated. *Then* no part of it is present in the tree afterwards and the run
  does not report the wave resolved. *(E-16, AC-3.5.)*
- **AT-03-7** — *Who:* the workflows suite. *Given* the refusal-reason catalogue. *When* compared by
  set-equality. *Then* it still has exactly eight members in the shipped order; A6 added none. *(BR-15,
  AC-3.4.)*

### 6.4 FSPEC-AWG-04 — What A6 may never do

- **AT-04-1** — *Who:* the workflows suite. *Given* any A6 verdict, including one asserting the wave
  is fixed with the highest confidence. *When* the configured gate command still returns non-zero on
  re-gate. *Then* the wave is not treated as gated, and no path exists by which the verdict
  substitutes for the gate result. *(BR-7, AC-4.1.)*
- **AT-04-2** — *Who:* the workflows suite. *Given* one A6 attempt on a wave with both commands
  configured. *When* the run completes. *Then* the ordered sequence of gate-command invocations for
  that wave equals `[post-wave, test, post-wave, test]`. Companion cases: a re-gate whose post-wave
  command failed yields `[post-wave, test, post-wave]`; a run with only a test command yields
  `[test, test]`. Asserted as a **sequence**, never as a set — set equality collapses duplicates and
  would admit a resolution declared on a single invocation. *(BR-7, AC-4.4.)*
- **AT-04-3** — *Who:* the workflows suite. *Given* an A6 invocation of any outcome. *When* the run
  completes. *Then* the set of committing writers for the wave is unchanged from the pre-A6 baseline:
  the pathspec-scoped per-task commit and the post-wave-pathspec build-output commit, both reached
  only past a green gate. *(BR-8, AC-4.2.)*
- **AT-04-4** — *Who:* the workflows suite. *Given* a red re-gate that exhausts the budget. *When* the
  wave halts. *Then* the refusal reason is recorded, the escalation entry is written, and the
  pre-A6 behaviour is taken — a positive assertion on all three, so the negative assertions of
  AT-04-1 and AT-04-3 cannot be satisfied by accident. *(AC-4.5.)*
- **AT-04-5** — *Who:* an operator inspecting the branch. *Given* a wave A6 resolved under E-6. *When*
  the wave's commit step completes. *Then* the repair is in the branch's committed state and no
  uncommitted working-tree change from the repair remains; the advisory record names the repair's
  paths and the later PLAN task that owns them; and that later task's dispatch is told the promotion
  already exists. *(BR-12, AC-4.6.)*

### 6.5 FSPEC-AWG-05 — Reversibility and the unchanged halt

- **AT-05-1** — *Who:* the workflows suite. *Given* a refusal, a budget exhaustion, and a red re-gate
  in three separate runs. *When* each terminates. *Then* in each the working tree is observably
  identical to the wave's post-dispatch, pre-commit tree, with the wave agents' own uncommitted work
  intact. *(BR-9, AC-5.1.)*
- **AT-05-2** — *Who:* the workflows suite. *Given* a red re-gate on a run with a configured post-wave
  command that writes generated outputs. *When* the tree is restored. *Then* those generated outputs
  match the pre-A6 tree too, demonstrating whole-tree rather than per-path restoration — a case a
  repair-paths-only restore fails. *(BR-9, AC-4.4.)*
- **AT-05-3** — *Who:* an operator. *Given* a wave A6 did not resolve. *When* the run halts. *Then*
  the halt reason equals the reason the pre-A6 pipeline emits for the same gate failure, and the queue
  row is written `halted` exactly as today. *(BR-14, AC-5.2, M-WG-3, M-WG-7.)*
- **AT-05-4** — *Who:* the workflows suite. *Given* a green re-gate followed by a post-gate check that
  halts the wave. *When* the run halts. *Then* no restoration was performed and the outcome is not
  recorded as a red re-gate. *(E-22, BR-10, AC-5.3.)*

### 6.6 FSPEC-AWG-06 — Record, escalation, report

- **AT-06-1** — *Who:* an operator reading the feature's advisory record. *Given* any A6 invocation.
  *When* it terminates. *Then* an entry names the wave, the root-cause class, the envelope
  determination, the action taken or refused, and the gate-output citation. *(BR-13, AC-6.1.)*
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

### 6.7 FSPEC-AWG-07 — Non-functional

- **AT-07-1** — *Who:* the workflows suite. *Given* each boundary in §4. *When* an agent is prompted
  to violate it. *Then* the violation is refused by the workflow script, with no reliance on the
  prompt. *(BR-16, NFR-1.)*
- **AT-07-2** — *Who:* the workflows suite. *Given* the transcribed set-equality surfaces M-WG-9
  names — the seam catalogue, the envelope defaults, the advisory config key set, the two
  catalogue-driven surfaces, and the disabled-tier fixtures. *When* the suite runs. *Then* each has
  been updated for A6, `E-5`/`E-6`, and `advisory.waveBudgetPerRun`; this feature is not deliverable
  as a purely additive change and a run in which a surface was not re-checked is a defect. *(R-5,
  BL-06.)*
- **AT-07-3** — *Who:* the workflows suite. *Given* a green wave. *When* the run completes. *Then* no
  advisory agent was dispatched for it and no measurable wall-clock cost was added; A6 is reachable
  only from a red gate. *(NFR-5.)*
- **AT-07-4** — *Who:* the workflows suite. *Given* an A6 dispatch. *When* the model is resolved.
  *Then* it is resolved through the tier's exported rung resolver, not through literals restated in
  this feature's code. *(NFR-6, REQ O-3.)*
- **AT-07-5** — *Who:* a security-minded reviewer. *Given* an A6 invocation. *When* its capabilities
  are enumerated. *Then* it holds no credential the pipeline does not already hold and reaches no
  network surface Phase I does not already reach. *(NFR-3.)*

## 7. Open Questions

**No question in this FSPEC is open against the operator.** The REQ's five operator questions were
decided on 2026-08-13 and their provenance is recorded in
`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md` (Q-1…Q-5). This section carries forward
only obligations on downstream authors, and the deferrals the REQ already made, so the TSPEC author
inherits them from one place.

### 7.1 Obligations carried to the TSPEC

| # | Obligation | Owner | This FSPEC states |
|---|---|---|---|
| O-1 | The restoration mechanism behind BR-9, and the point at which the pre-A6 tree state is captured. Its failure mode is E-28. | Feature TSPEC | Only the observable: whole-tree, three triggers, wave agents' work intact |
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

- **A-1.** The two enumerations BL-06 requires — the transcribed set-equality surfaces this feature
  reds, and a re-measurement of the BL-03 no-manifest notice that E-04's cardinality rests on — are
  assumed complete before implementation planning. AT-07-2 is the observable; a planning round that
  skips the enumeration will discover it as unexplained red suites.
- **A-2.** The line references in `pdlc-wave-gate-baseline.md` §1–§2 were measured at an earlier
  default-branch commit and have drifted; the symbol- and grep-anchored recipes in §3 still resolve.
  This FSPEC cites facts by `M-WG-*` id at the baseline's stated `Version` (1.1), never by line, so
  drift below a cited id does not invalidate a clause here — it invalidates the baseline row, which
  is that file's change-control problem.
- **A-3.** R-1 is accepted, not solved: a repair inside the wave's own production files can be the
  wrong repair and still turn the suite green. The exclusion of test files (BR-5) removes the worst
  version of it and Phase DOD's Final Codebase Review still runs over the result, but a residual risk
  is real. That is why the tier ships disabled, and this FSPEC specifies no behaviour that assumes an
  operator has enabled it.
- **A-4.** R-3 is bounded honestly: `advisory.waveBudgetPerRun` bounds drift *within* an invocation
  only. Drift across invocations is bounded by the operator arriving between them, not by a number,
  and no clause here claims otherwise.

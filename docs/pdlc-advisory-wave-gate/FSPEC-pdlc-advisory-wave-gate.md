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
dispatch (BR-11). Attempt and time budgets are checked inside the invocation, not here.

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
wave agents' own uncommitted work intact — and control returns to step 3's budget check for a further
attempt if one remains (BR-9).

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
| 1 | Does A6 apply? | continue | phase behaves as today; one notice per run |
| 2 | Which condition ended the wave? | test gate red ⇒ continue | dispatch or post-wave failure ⇒ halt as today |
| 3 | Wave budget left? | continue | escalate, no dispatch |
| 4 | Verdict well formed, classification present? | continue | escalate, one attempt consumed |
| 5 | Inside envelope, high confidence, class authorises action? | continue | escalate with a refusal reason, no attempt consumed |
| 6 | — | repair applied to working tree | — |
| 7 | Does the whole gate sequence pass? | wave green | restore whole tree, consume attempt, back to step 3 |
| 9 | — | resolved | escalated |
| 10 | — | wave proceeds | halt exactly as today, with diagnosis attached |

## 4. Business Rules

## 5. Edge Cases and Error Scenarios

## 6. Acceptance Tests

## 7. Open Questions

---
feature: pdlc-advisory-wave-gate
ready: false
depends-on: [pdlc-advisory-tier, pdlc-consolidation-agent]
---

# REQ — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (the five-seam tier this extends) |
| Downstream | `pdlc-engineering-loop` |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-09 |

> **Scope in one line.** A sixth advisory seam — **A6**, at the Phase I implementation-wave gate —
> so that a wave whose gate goes red gets one bounded, reversible, gate-verified remediation attempt
> inside its own declared file ownership before the pipeline halts, and so that a halt that still
> happens arrives with the diagnosis already done.

> **Stopping rule for this REQ's review loop (DC-09).** A round whose blocking findings are all
> implementability or oracle-falsifiability defects — none contesting user need, scope, priority or
> phasing — means this REQ has met its bar: approve it and route those findings downstream as named
> entry obligations for TSPEC. "This AC has no oracle" is closable by deferring the oracle to TSPEC.
> Two consecutive rounds with a non-decreasing blocking count is a fixed point, not slow
> convergence; say so and escalate rather than revising again.

## 1. Problem / Context

Phase I runs implementation as **waves**: topologically ordered, ownership-disjoint groups of tasks
dispatched in parallel into one shared tree, told not to commit, with the orchestrator itself
owning the gate. Measured facts about that gate live in
`docs/_constraints/pdlc-wave-gate-baseline.md` v1.0 and are cited here by id.

Three conditions end a wave, in order: a dispatch-level failure (M-WG-1), a post-wave command
failure (M-WG-2), and the script-owned test gate (M-WG-3). All three halt the run, and none of them
commits anything (M-WG-4). **The gate is correct and this REQ does not touch it.** What it changes
is what happens in the instant after the gate goes red.

Today that instant is a full stop with no attempt at resolution, and it is a more expensive stop
than the tier's other five:

| | Consequence | Fact |
|---|---|---|
| No post-mortem is written | Phase I acquires no refusal marker and no `RESOLVED:` lifecycle, so nothing records *why* it stopped or forces anyone to say it was addressed | M-WG-5 |
| Phase I has no approval skip | a re-invocation re-enters at wave 1 and re-dispatches **every** wave, including those whose commits already landed | M-WG-6 |
| The queue row goes `halted` | an unattended `/loop` stops here and waits for a human | M-WG-7 |

So the operator arrives at a stop with no diagnosis, and the cheapest way forward is to re-run the
most expensive phase in the pipeline from its beginning.

**The motivating incident (2026-08-09, `pdlc-consolidation-agent`).** A wave-2 task authored a new
module importing four symbols from an existing one. Three were exported; the fourth's promotion was
assigned by the PLAN to a task **two waves later**. The module graph therefore failed to link, and
every suite that transitively imported the new module failed to load — reported as suites failing to
run rather than as a failing assertion. The gate went red and refused to commit, which is exactly
right. The whole repair was one keyword, in a file the PLAN already named as a later task's
deliverable. The pipeline had no way to make it, so an unattended run became an operator turn.

**The naive fix is the dangerous one.** Letting an agent decide that the gate should pass would put
a model in charge of the gate that exists to catch it. This REQ takes the tier's existing split —
*diagnosing* the problem is delegable, *authorizing* the resolution is not — and applies it here:
A6 may change causes inside a declared envelope, and the gate command itself, re-run, is the only
thing that may ever declare the wave green.

## 2. User stories

- **US-01** — As the operator, I want a wave that fails on a mechanical, in-scope defect repaired
  and re-gated without me, so an unattended loop survives its first red wave.
- **US-02** — As the operator, when a wave halt genuinely needs me, I want the diagnosis and the
  root-cause classification already attached, so my turn starts at approve-or-reject rather than at
  reading a test log.
- **US-03** — As the operator, I want a hard, declared boundary on what may be repaired unattended
  inside a wave, and I want it un-widenable by the agent — in particular I never want a red gate
  turned green by editing a test.
- **US-04** — As the operator, I want every wave repair reversible, so a failed attempt leaves the
  tree exactly as the wave left it rather than half-repaired.
- **US-05** — As the operator, I want recurring wave-ordering defects to be countable, so I learn
  that the PLAN's dependency derivation needs work rather than paying for it one halt at a time.

## 3. Goals

- **G-1** — A red wave gate attempts one bounded remediation before the pipeline halts.
- **G-2** — The gate command, re-run and passing on its own, remains the only thing that can declare
  a wave green.
- **G-3** — A remediation that is refused, exhausted, or followed by a red re-gate leaves the tree
  and the pipeline's control flow exactly as they are today.
- **G-4** — A halt that still happens carries a diagnosis and a root-cause classification.
- **G-5** — The seam is inert when the advisory tier is disabled, which is how it ships.

## 4. Non-Goals

**In scope:** the A6 seam at the Phase I wave gate; its envelope, prohibitions and reversibility;
its record, escalation and report surface; the root-cause vocabulary; tests.

**Out of scope, explicitly:**

- Changing the wave gate, the wave partitioning, or the commit discipline. The gate is correct
  (M-WG-3, M-WG-4); this seam sits after it, never inside it.
- Fixing the **PLAN dependency derivation** that produced the motivating incident. A6 makes that
  class of defect survivable, not absent — see R-4 and O-6.
- Giving Phase I a POSTMORTEM lifecycle (M-WG-5) or an approval skip (M-WG-6). Both are real gaps;
  neither is this seam's (see D-AWG-03).
- The V-wave carrying the PROPERTIES tests. It has no ownership-manifest row, so the envelope's
  owned-path rules have no set to range over there (AC-1.3, D-AWG-02).
- The worktree exception path. Wave mode requires a valid ownership manifest (BL-03); without one
  Phase I runs the legacy path and this seam does not apply.
- Any change to the other five seams, to the refusal-reason catalogue, or to the model-rung ladder.

## 5. Constraints

**C-1 — This is an extension of a shipped tier, not a new mechanism.** Every contract the advisory
tier already defines is inherited unchanged and **not restated here**: the verdict's confidence
gating, the closed ordered refusal-reason set, the prohibitions, the advisory record, the escalation
log, and the two-rung model ladder. Where this REQ needs one it cites `REQ-pdlc-advisory-tier` by
AC id. Reuse of the model-rung resolver rather than restatement of its literals is required by
`docs/_constraints/pdlc-advisory-corpus-baseline.md` §3.

**C-2 — Declared thresholds.** All A6 knobs live in the existing `advisory` section of
`.claude/pdlc.config.json`, owned by the **repo operator**:

| Threshold | Default | Status | Meaning |
|---|---|---|---|
| `advisory.enabled` | `false` | existing, unchanged | master switch; false ⇒ A6 inert (AC-1.4) |
| `advisory.attemptBudget` | `3` | existing, reused | remediation attempts per wave invocation (AC-2.4) |
| `advisory.seamBudgetMinutes` | `10` | existing, reused | working time per wave invocation, excluding gate-command run time (NFR-4) |
| `advisory.envelope` | gains `E-5`, `E-6` (AC-3.1) | existing, extended | the per-seam allow-list |
| `advisory.waveBudgetPerRun` | `2` | **new** | how many distinct waves A6 may resolve in one run (AC-2.4); exceeded ⇒ escalate |

`advisory.waveBudgetPerRun`'s default of 2 is a proposal, not a confirmed operator decision — Q-1.

**C-3 — Closed vocabularies.** A6's root-cause classification (AC-2.2) is a closed catalogue on the
emitting side and a total function on the receiving side, per DC-01: an unrecognised or absent
classification is malformed input with a defined fallback, not undefined behaviour.

**C-4 — Enforcement is in code.** Every boundary in §6 is enforced by the workflow script. A prompt
instruction is not a control (inherits `REQ-pdlc-advisory-tier` NFR-1).

**C-5 — Size discipline.** This REQ is measured against `pdlc/hooks/scripts/check-req-size.sh`
(700 lines / 61,440 bytes) at authoring time and at the start of every review round. Measured facts
about shipped behaviour are held in `docs/_constraints/pdlc-wave-gate-baseline.md` and cited by
`M-WG-*` id rather than restated, both to keep this document inside its budget and to keep it at
requirements altitude.

## 6. Acceptance Criteria

### REQ-AWG-01 — The seam, its trigger, and its inertness (P0)

- **AC-1.1** — Given the advisory tier's seam catalogue, Then it carries a sixth member, `A6`, and
  every surface driven by that catalogue — the per-seam report rows in particular — carries six rows
  where it carried five. The catalogue is closed and transcribed in tests (M-WG-8), so this is a
  deliberate, test-visible change; a run in which the sixth row is absent is a defect.
  *(Traces: US-01, US-05.)*
- **AC-1.2** — Given a Phase I wave, Then A6 fires on **exactly one** condition: the script-owned
  test gate returning non-zero (M-WG-3). It does **not** fire on a dispatch-level failure (M-WG-1) —
  there is no completed work to repair — nor on a post-wave command failure (M-WG-2), whose repair is
  a rebuild the script has already attempted. Both continue to halt exactly as today. *(US-03.)*
- **AC-1.3** — Given the final V-wave that carries the PROPERTIES tests, Then A6 does not fire, and
  its gate failure halts exactly as today. The V-wave has no ownership-manifest row, so E-5 and E-6
  have no owned-path set to be confined to; a seam whose envelope cannot be evaluated must not act.
  *(US-03.)*
- **AC-1.4** — Given `advisory.enabled` is false, Then A6 is provably inert: no advisory agent is
  dispatched, no model resolution is attempted, the wave halt is the one that ships today, and the
  run's created-file set and phase outcomes are identical to the pre-A6 baseline. *(US-03.)*
- **AC-1.5** — Given wave mode is not in effect (BL-03) or no script-owned gate is configured
  (BL-04), Then A6 does not apply and the phase behaves exactly as today, with the inapplicability
  named once in the run report rather than being silently indistinguishable from a quiet seam.
  *(US-02.)*

### REQ-AWG-02 — The A6 contract (P0)

- **AC-2.1** — Given an A6 invocation, Then it returns the advisory tier's existing verdict, with no
  field added or removed except the classification of AC-2.2, and it is gated by the tier's existing
  rule: action is taken only when the proposal is within the envelope **and** confidence is high
  (`REQ-pdlc-advisory-tier` AC-2.2). A malformed verdict is an escalation consuming one attempt
  (AC-2.3 there), never a pass. *(US-03.)*
- **AC-2.2** — Given an A6 verdict, Then it carries a **root-cause classification** drawn from this
  closed, ordered set, the first matching class winning so a failure matching two still has one
  class:

  | # | Class | Meaning |
  |---|---|---|
  | 1 | `plan-ordering-defect` | the failure names a symbol, file or artifact the PLAN itself schedules for a **later** task than the one that consumed it |
  | 2 | `wave-internal-defect` | the failure is attributable to work this wave produced, inside paths this wave owns |
  | 3 | `environmental` | the failure reproduces independently of this wave's diff — a pre-existing red, a missing tool, a transport failure |
  | 4 | `unclassified` | none of the above is decidable from the gate output |

  The set is asserted by set-equality, so a deleted or invented class fails the suite. `environmental`
  and `unclassified` are diagnosis-only: neither authorises any action. *(US-02, US-05.)*
- **AC-2.3** — Given an A6 diagnosis, Then it cites the gate command's own output as its evidence. A
  diagnosis citing no gate output is malformed under AC-2.1 — the gate output is the only evidence
  that distinguishes a repair from a guess. *(US-02.)*
- **AC-2.4** — Given the budgets of C-2, Then A6 escalates rather than retrying when any is
  exceeded: more than `advisory.attemptBudget` attempts on one wave, more than
  `advisory.seamBudgetMinutes` of working time on one wave, or an attempt on a wave beyond the
  `advisory.waveBudgetPerRun`-th distinct wave A6 has already resolved in this run. One attempt is
  one **repair→re-gate** cycle. *(US-04.)*

### REQ-AWG-03 — The envelope (P0)

- **AC-3.1** — Given the shipped default envelope, Then A6 adds exactly these two members, each with
  a decidable rule:

  | # | Permitted | Decidable rule |
  |---|---|---|
  | E-5 | a repair confined to the failing wave's **own** owned paths | every path the proposal would change is a member of the union of the owned-path sets the PLAN's ownership manifest assigns to that wave's tasks |
  | E-6 | completing a promotion the PLAN schedules for a **later** task | the gate output names a symbol or artifact that a later task's PLAN row already undertakes to produce, **and** every path the proposal would change is a member of that later task's owned-path set |

  Nothing else A6 proposes is in the envelope. *(US-01, US-03.)*
- **AC-3.2** — Given the tier's existing exclusion set (`REQ-pdlc-advisory-tier` AC-3.4), Then it
  holds unchanged for A6, and clause (a) — **any** change to a test file or test configuration —
  takes precedence over E-5 and E-6 wherever they would otherwise permit a change. This binds even
  when the test file is one the failing wave itself created in this same run: a wave whose own test
  is wrong escalates. Turning a red gate green by editing a test is the pipeline's most dangerous
  failure mode, and A6 sits closer to it than any other seam. *(US-03.)*
- **AC-3.3** — Given A6, Then these are excluded in addition, as a closed set: (f) any change to the
  PLAN, its task table, or its file-ownership manifest; (g) any change to the implementation
  configuration — the test command, the post-wave command, or the post-wave pathspecs; (h) any
  commit, push, or tag; (i) any path outside the set E-5 or E-6 computed for this invocation.
  *(US-03.)*
- **AC-3.4** — Given any refusal, Then it is reported with a reason drawn from the tier's existing
  closed, ordered refusal-reason set (`REQ-pdlc-advisory-tier` AC-3.6), which A6 **does not extend**:
  the set stays at eight members, and an A6 refusal that cannot be expressed in it is a defect in
  this REQ rather than a licence to add a ninth. *(US-03.)*
- **AC-3.5** — Given a proposal or a produced change that violates AC-3.1, AC-3.2 or AC-3.3, Then no
  part of it survives the seam, the wave escalates, and the run is not reported as having resolved
  that wave. Each excluded operation enumerated in AC-3.2 and AC-3.3 is asserted by its own test.
  *(US-03, US-04.)*

### REQ-AWG-04 — What A6 may never do (P0)

- **AC-4.1** — Given any A6 invocation, Then it may never cause a wave to be treated as gated other
  than by the configured gate command re-running and returning success on its own. There is no path
  by which an advisory verdict substitutes for a gate result.
- **AC-4.2** — Given any A6 invocation, Then it never commits, and the pipeline's existing
  pathspec-scoped per-task commit path remains the sole writer of wave commits — still reached only
  after a green gate (M-WG-4).
- **AC-4.3** — Given any A6 invocation, Then it never edits a test file or test configuration
  (AC-3.2), never edits the PLAN or its ownership manifest, and never edits the implementation
  configuration (AC-3.3).
- **AC-4.4** — Given a repair is applied, Then the configured gate command **re-runs** and reaches
  its own verdict. A green re-gate lets the wave proceed to the commit step it would have reached
  anyway; a red re-gate reverts the repair whole (AC-5.1) and consumes one attempt.
- **AC-4.5** — Given AC-4.1 through AC-4.4, Then each has a failing test proving the prohibition
  holds, and each such test asserts the corresponding positive outcome on the same path — the
  refusal reason recorded, the escalation entry written, the pre-A6 behaviour taken — because a
  negative assertion alone is satisfied by accident. *(US-03.)*

### REQ-AWG-05 — Reversibility and the unchanged halt (P0)

- **AC-5.1** — Given a refusal, a budget exhaustion, or a red re-gate, Then the working tree is
  observably identical to its state immediately before A6 acted — which is the wave's
  **post-dispatch, pre-commit** tree, with the wave agents' own uncommitted work intact. A6 never
  destroys the wave's work in the course of failing to repair it. The mechanism of restoration is
  TSPEC's to choose (O-4). *(US-04.)*
- **AC-5.2** — Given A6 does not resolve the wave, Then the pipeline's existing behaviour proceeds
  unchanged: the same halt, carrying the same reason it emits today (M-WG-3), and the same queue-row
  write to `halted` (M-WG-7). Escalation adds information; it never changes control flow. *(US-04.)*
- **AC-5.3** — Given A6 resolves the wave, Then the run continues into the wave's normal commit step
  and on to the next wave, and the resolution is visible in the report rather than leaving a
  successful run indistinguishable from one that never needed the seam. *(US-01, US-02.)*

### REQ-AWG-06 — Record, escalation and report (P1)

- **AC-6.1** — Given any A6 invocation, Then an entry is appended to the feature's existing advisory
  record naming the wave, the root-cause class, the envelope determination, the action taken or
  refused, and the gate-output citation the diagnosis rests on. The tier's existing rule holds: an
  action taken with no record written is a defect, and a failed record write refuses the action
  (`REQ-pdlc-advisory-tier` AC-9.2). *(US-05.)*
- **AC-6.2** — Given any A6 escalation, Then an entry is appended to the escalation log carrying the
  root-cause class alongside the fields the tier already requires, and stating in one sentence at the
  top what the operator must decide. *(US-02.)*
- **AC-6.3** — Given the pipeline halts after an A6 escalation, Then the halt report carries the
  diagnosis and the root-cause class, so US-02's "my turn starts from a diagnosis" is satisfied on
  the halt path and not only in a file the operator must go and find. *(US-02.)*
- **AC-6.4** — Given a `plan-ordering-defect` classification, Then it is countable per feature from
  the durable escalation log without reading run logs, so a recurring wave-ordering defect becomes a
  visible signal rather than a repeated surprise. **Honest limit:** the per-feature advisory record
  is distilled into LEARNINGS and deleted after Phase PUB
  (`docs/_constraints/pdlc-advisory-corpus-baseline.md` §1), so A6's *resolution* counts do not
  survive the run and only escalations are durably countable (§4 there). Making resolution counts
  durable is out of scope and bound in O-2. *(US-05.)*

### REQ-AWG-07 — Non-functional (P0)

- **NFR-1** — Every boundary in REQ-AWG-03 and REQ-AWG-04 is enforced in the workflow script, never
  only in an agent prompt.
- **NFR-2** — With `advisory.enabled` false and the same inputs, the report's phase table, every
  phase outcome, and the run's created-file set are identical to the pre-A6 baseline, and the report
  carries no A6 row. (Stated as an equality on named artifacts, since report text varies by
  timestamp.)
- **NFR-3** — A6 holds no credentials the pipeline does not already hold, and reaches no network
  surface Phase I does not already reach.
- **NFR-4** — No A6 invocation exceeds `advisory.seamBudgetMinutes`, measured from dispatch to
  verdict **less** the time spent running the gate command — without that carve-out a slow suite
  ends every invocation inside attempt 1 and `advisory.attemptBudget` never binds. An overrun
  escalates as `budget-exhausted`.
- **NFR-5** — A6 adds no wall-clock cost to a green wave: it is reachable only from a red gate.
- **NFR-6** — A6 runs on the advisory tier's existing model rung, resolved through the tier's
  exported resolver rather than through restated literals
  (`docs/_constraints/pdlc-advisory-corpus-baseline.md` §3).

## 7. Risks

- **R-1 — A green re-gate that masks a real defect.** A repair inside the wave's own production
  files can be the wrong repair and still turn the suite green. The envelope's exclusion of test
  files (AC-3.2) removes the worst version of this, and the Final Codebase Review and Phase DOD
  still run over the result, but the residual risk is real and is what the operator accepts by
  enabling the seam. It is the reason the tier ships disabled.
- **R-2 — The envelope may be too narrow to be useful.** If most red waves classify `environmental`
  or `unclassified`, A6 escalates and the halt rate is unchanged at the cost of one dispatch. This is
  measurable from the escalation log before any widening is contemplated (D-AWG-01), and it is the
  right failure direction: a seam that does nothing is recoverable, a seam that does the wrong thing
  is not.
- **R-3 — Compounding drift across waves.** Several repairs in one run can carry the branch away
  from what the PLAN describes, with no review between them. `advisory.waveBudgetPerRun` (default 2)
  bounds it; Q-1 asks the operator to confirm the number.
- **R-4 — This seam treats a symptom.** The motivating incident's root cause was a PLAN whose task
  ordering did not reflect a real dependency. A6 makes that class survivable; it does not make the
  PLAN correct, and a pipeline that routinely repairs its own waves has a Phase P problem it can now
  ignore. AC-6.4's countability and O-6 exist so that ignoring it is a choice rather than a
  side-effect.
- **R-5 — The catalogue change is not additive.** A sixth seam reds the transcribed set-equality
  tests by design (M-WG-8). That is the intended signal, but it means this feature cannot be
  delivered as a purely additive change and every catalogue-driven surface must be re-checked
  (BL-06).

## 8. Obligations

- **O-1** — The restoration mechanism behind AC-5.1, and the point at which the pre-A6 tree state is
  captured, are TSPEC's to specify. This REQ states only the observable outcome.
- **O-2** — Persisting per-seam **resolution** counts so a resolution rate is measurable at all. The
  advisory record is deleted after Phase PUB, so today resolutions are observable only as the absence
  of an escalation (`pdlc-advisory-corpus-baseline.md` §4). Owner: `pdlc-engineering-loop`
  (queue row 6).
- **O-3** — The Fable rung's alias literal remains `REQ-pdlc-advisory-tier` BL-01's obligation on
  TSPEC. A6 inherits the ladder and adds nothing to it (NFR-6).
- **O-4** — How a wave's owned-path set is computed for E-5 and E-6, and how a proposal's changed
  paths are compared against it, are TSPEC's. This REQ states the membership rule, not the
  comparison.
- **O-5** — Whether the root-cause classification should be derived by the seam or supplied by the
  wave's own agents is TSPEC's; AC-2.2 constrains only the vocabulary and its totality.
- **O-6** — Improving the PLAN's dependency derivation so that a task cannot be scheduled before the
  task that promotes what it consumes. Explicitly out of scope here (§4). Owner:
  `pdlc-engineering-loop` (queue row 6).

**Open questions for the operator:**

- **Q-1** — `advisory.waveBudgetPerRun` default of **2** is proposed, not confirmed. Alternatives: 1
  (one repair per run, maximally conservative) or unbounded-within-`attemptBudget` (no cross-wave
  cap). Proposed default is 2 because the motivating incident would have consumed one and left
  headroom for a second unrelated failure without letting a run repair itself indefinitely.
- **Q-2** — Should A6 also fire on a post-wave command failure (M-WG-2)? Proposed **no** (AC-1.2),
  because that failure is a build failure the script has already attempted and its repair is
  usually the same repair a wave task owes. Bound as D-AWG-04 if the operator wants it revisited.
- **Q-3** — Should `environmental` classifications be permitted to re-run the gate once without any
  repair, as seam A5's E-1 permits for a flaky check? Proposed **no** for v1 — a flaky suite is a
  test-quality defect this pipeline should surface, not absorb. Bound as D-AWG-05.

## 9. Prerequisites

Every row must be checkable at gate time and must hold at HEAD before FSPEC authoring begins.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | The advisory tier ships, with its verdict contract, envelope enforcement, refusal-reason set, advisory record and escalation log | PR merged (`pdlc-advisory-tier`, queue row 1, `done`) | Must exist at HEAD before FSPEC authoring |
| BL-02 | The tier's model-rung resolver is exported and reusable, so NFR-6 needs no restated literals | `pdlc-advisory-corpus-baseline.md` §3, at its stated `Version` | Must exist at HEAD; a restated pair of literals is acceptable only with a named drift observable, never with a named risk |
| BL-03 | The feature under implementation carries a valid PLAN file-ownership manifest, so Phase I runs in wave mode | Phase P's own gate on the PLAN | Checked per run; absent it, AC-1.5 applies and A6 does not fire |
| BL-04 | A configured implementation test command and an injected command transport, so the gate is script-owned rather than self-reported | `.claude/pdlc.config.json` + runtime seam (M-WG-3) | Checked per run; absent either, AC-1.5 applies |
| BL-05 | `pdlc-consolidation-agent` is merged | PR merged (queue row 2) | Operator sequencing decision, 2026-08-09: this seam is taken up after that feature lands |
| BL-06 | The transcribed seam-catalogue set-equality assertions are identified, so the sixth member is added deliberately rather than discovered by a red suite | M-WG-8's measured sites, re-verified at the then-current base | Must be enumerated before implementation planning |

## 10. Deferrals

Every deferral binds to a queue row that exists today.

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-AWG-01 | Widening the envelope beyond E-5/E-6 | Requires escalation-log evidence about which A6 escalations were routinely rubber-stamped (R-2) | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-02 | A6 coverage of the PROPERTIES V-wave | Needs an owned-path set the V-wave does not have today (AC-1.3) | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-03 | A POSTMORTEM lifecycle and/or an approval skip for Phase I (M-WG-5, M-WG-6) | A real gap, but about re-invocation economics rather than about this seam | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-04 | Firing A6 on a post-wave command failure (Q-2) | Deliberately excluded from v1's single trigger | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-05 | Gate re-run without repair for `environmental` classifications (Q-3) | Absorbing flakiness is a decision that needs evidence it is flakiness | `pdlc-engineering-loop` (queue row 6) |

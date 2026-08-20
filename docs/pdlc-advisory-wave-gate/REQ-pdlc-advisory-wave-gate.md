---
feature: pdlc-advisory-wave-gate
ready: true
depends-on: [pdlc-advisory-tier, pdlc-consolidation-agent]
---

# REQ — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (the five-seam tier this extends) |
| Downstream | `pdlc-engineering-loop` |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.12 | 2026-08-20 |

*v1.12 changelog (cross-review round 1). SE F-01: `ready: true`, the feature having merged (PR #66,
`bb4d36fb`), and QUEUE row 19 set `done` — the pair blocked rows 6 and 20 under the queue's
not-done dependency pre-check. Relocation to `docs/completed/` is SE Q-02's, not taken here.
TE F-01: AC-2.4 gains the `waveBudgetPerRun: 0` conjunct. TE F-03: O-4 extended to E-6's symbol
conjunct. SE F-02 routed to the constraints file. Lows: AC-1.2's anchor reissued in symbol form,
§1's drift sentence re-measured, fixture-design phrases dropped to PROPERTIES. No decision
reopened.*

*v1.11 changelog (DoD remediation, CODE_REVIEW v2 finding 1). §1's corroborating-evidence
paragraph re-measured at the branch tip: `.claude/pdlc-wave-state.json` is **untracked** —
working-tree only, ignored by `/.claude/pdlc-wave-state.json` — which v1.10 recorded as the
opposite because the ignore rule landed after that re-measurement. No decision reopened.*

*v1.10 changelog (DoD remediation, CODE_REVIEW v1 finding 7). §1's corroborating-evidence paragraph
re-measured at the branch tip: the ledger file exists here and the record it holds is this feature's
own completed wave sequence. (Its tracked/untracked status as stated in this entry was superseded by
v1.11.) No decision reopened.*

*v1.9 changelog (erratum round 5). Restoration, not decision. A rebase onto `origin/main` had
reverted five previously approved round-3 sites while leaving every reference to them in place;
all five are restored to their approved wording: the Upstream row's `docs/completed/…` path
(F-03), §1's corrected M-WG-6 row (F-04), §1's 2026-08-11 corroborating incident paragraph (F-05),
§5 C-2's `advisory.waveBudgetPerRun` default `1` per Q-1 (F-01), and §9's O-7 (F-02). Two Medium
corrections ride along: §1's ledger citations now name stable symbols instead of line numbers that
had drifted ~2 000 lines (F-06), and NFR-4 now says the measured window closes at the attempt's
verdict rather than that the gate "runs between attempts" — the conclusion (no subtraction, no
carve-out) is unchanged (F-07). No decision reopened.*

*v1.8 changelog (erratum round, round 4). Decided: AC-1.5's population is runs reaching Phase I
and **evaluating wave mode**, so the no-manifest legacy run — where BL-03's own carrier fires — is
back inside it, while earlier halts and ledger skips stay outside (F-22, F-01). `seamBudgetMinutes`
is stated **per attempt**, restarting each attempt, with an invocation's worst case named as
`attemptBudget` × the value in NFR-4, §5 and AC-2.4; no per-episode cap introduced (F-23). Terms
separated — *run*, *A6 invocation*, *attempt* — and R-3 says run where it meant run (F-25).
AC-4.1's conjuncts key on A6 **applying a repair**, *resolves* reserved for the green re-gate
outcome, each conjunct on a run of its own, (iii) named a mutation fixture (F-24, F-02). Nothing
else changed.*

*v1.7 changelog (erratum round, round 3). Decided: AC-1.5's notice cardinality is scoped to runs
reaching Phase I and executing a wave, earlier halts and ledger skips being outside the population
(F-18); its two carriers are mutually exclusive, so the requirement binds whichever fires and BL-03's
alone serves a both-absent run (F-19), BL-06 widened to measure that; AC-4.1's unbounded negative
replaced by three positive conjuncts; NFR-4's carve-out and its `attemptBudget`-starvation rationale
deleted as false under the per-invocation dispatch→verdict window AC-2.4 pins — the exclusion is
structural, no subtraction performed — and §5's config table restated to that window. Nothing else
changed.*

*v1.6 changelog: round 3 addressed. Decided: AC-4.4's oracle is **sequence** equality over the
shipped sequence concatenated once per gate pass (passes = 1 + attempts), each pass truncated at
its first failing command, so a red-post-wave re-gate is admitted (SE F-15, TE F-02); a green
re-gate carries the wave past the gate, and a later post-gate halt is no restore trigger (TE F-03); AC-1.5's carriers are the once-per-run notices both prerequisites already emit,
the inapplicability added to them (TE F-01); BL-06 widened to every drifted §1–§2 recipe plus the
BL-03 notice measurement (SE F-16, TE F-04); AC-4.2's post-wave clause made conditional (SE F-17).*

*v1.5 changelog: round 2 addressed. Decided: a red re-gate restores the whole tree, not the
repair's paths (SE F-10); M-WG-4 names two committing writers (SE F-11); the re-gate oracle is an
ordered invocation sequence (TE F-01); the baseline's §1–§2 recipes no longer resolve and BL-06
owns reissuing them (SE F-12). AC-1.5, AC-2.2, AC-3.1 and the baseline corrected (SE F-13, F-14;
TE F-02, F-03).*

*v1.4 changelog: cross-review round 1 addressed. The branch's stale parallel v1.0 superseded by
main's v1.3 after rebase (SE F-01). Decided: guard paths bind A6 unchanged (TE F-01, AC-3.2); a
diagnosis-only outcome escalates without a ninth refusal reason (SE F-04, AC-3.4); the re-gate
re-runs the wave's gate sequence in shipped order (SE F-03, TE F-07, AC-4.4); E-6 repair's
committed fate stated (SE F-02, AC-4.6, O-8). Shipped-behaviour evidence measured into
`pdlc-wave-gate-baseline.md` v1.1 (M-WG-9…M-WG-12) rather than restated here; §8's
resolved-question provenance relocated to the decision document.*

*v1.3 changelog: v1.2's three open questions decided by delegated operator adjudication,
2026-08-13 — budget default `1` (Q-1); no A6 firing on a post-wave command failure, that defect
class routed to O-7 (Q-2); Q-4's disabled-tier half routed to D-AWG-06, AC-1.4 and PROP-DIS-03
untouched. No question stated in this REQ is open; per-question provenance lives in
`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md`.*

*v1.2 changelog: Q-3, Q-4's diagnosis half and Q-5 answered; AC-1.2's "already attempted"
rationale, M-WG-6's re-entry claim and D-AWG-03's approval-skip ownership corrected.*

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
`docs/_constraints/pdlc-wave-gate-baseline.md` v1.1 and are cited here by id.

Three conditions end a wave, in order: a dispatch-level failure (M-WG-1), a post-wave command
failure (M-WG-2), and the script-owned test gate (M-WG-3). All three halt the run, and none of them
commits anything (M-WG-4). **The gate is correct and this REQ does not touch it.** What it changes
is what happens in the instant after the gate goes red.

Today that instant is a full stop with no attempt at resolution, and it is a more expensive stop
than the tier's other five:

| | Consequence | Fact |
|---|---|---|
| No post-mortem is written | Phase I acquires no refusal marker and no `RESOLVED:` lifecycle, so nothing records *why* it stopped or forces anyone to say it was addressed | M-WG-5 |
| Phase I has no approval skip | a re-invocation carries no phase-level skip, so a human must re-invoke by hand rather than the pipeline resuming on its own | M-WG-6 |
| The queue row goes `halted` | an unattended `/loop` stops here and waits for a human | M-WG-7 |

**Correction, 2026-08-13.** The M-WG-6 row above previously claimed a re-invocation "re-enters
at wave 1 and re-dispatches every wave, including those whose commits already landed." The source
no longer does that *unconditionally* — the interim wave ledger (`orchestrate-dev.js`, exported
`WAVE_STATE_PATH` and `parseWaveLedger`, consumed by the resume block that emits "Notice: the wave
ledger … was ignored") and `implementation.startWave` can skip already-committed waves — but
**wave-1 re-entry is what is still observed in practice**, so the row is far closer to true than to
false. Four preconditions gate the ledger, and each of them fails routinely:

- **It is written only under the script-owned gate.** The write sits inside the `if (scriptGate)`
  branch, and `scriptGate` is defined as requiring both `implementation.testCommand` and a
  `_runCommand` transport. A self-report-gate run records nothing, ever.
- **It is written only after a wave goes green and its work is committed.** A run that halts at
  wave N records nothing for wave N — and a run that halts at wave 1 records nothing at all, which
  is exactly the wave-gate-failure case this REQ exists for.
- **It is ignored when the PLAN's wave layout changes** (`planHash`), so any PLAN edit between
  invocations — routine when remediating a halt — returns the next run to wave 1 with a notice.
- **It is ignored when the recorded commit is not an ancestor of HEAD.** Phase DOD step 0 rebases
  `feat-{feature}` onto the default branch, rewriting those commits, so a post-DOD re-invocation
  fails corroboration.

Corroborating evidence, **re-measured 2026-08-20** and corrected: the ledger file does now exist in
this repo's tree — one untracked `.claude/pdlc-wave-state.json`, present in the working tree only and
ignored by `/.claude/pdlc-wave-state.json`, recording a green last wave for this feature's own run,
whose recorded head is an ancestor of the branch tip; it is a working-tree observation, not a shared
artifact — so the stronger claim v1.2
made, that no record has ever survived here, no longer holds and is withdrawn.
What the single surviving record does not show is a resume: it names a wave sequence that ran to
completion, and every one of the four preconditions above still gates its use. Separately, and as a working-tree
observation only: `node pdlc/workflows/build-runtime.mjs --check` reports the tracked artifact
in-sync and exits `0`, while the consumer runtime copy under `.claude/workflows/` — gitignored, so
not reproducible by another reviewer — differs from it, and such a copy is announced but silently
executed.

The consequence for this REQ is that the seam's economics argument stands as originally written:
the expensive part of a wave-gate stop is still a from-scratch Phase I re-run in the common case,
not merely the operator's turn to re-invoke. Closing the gap between what the ledger ships and what
it delivers is `pdlc-wave-resume`'s (queue row 20) work, not this seam's.

**The motivating incident (2026-08-09, `pdlc-consolidation-agent`).** A wave-2 task authored a new
module importing four symbols from an existing one. Three were exported; the fourth's promotion was
assigned by the PLAN to a task **two waves later**. The module graph therefore failed to link, and
every suite that transitively imported the new module failed to load — reported as suites failing to
run rather than as a failing assertion. The gate went red and refused to commit, which is exactly
right. The whole repair was one keyword, in a file the PLAN already named as a later task's
deliverable. The pipeline had no way to make it, so an unattended run became an operator turn.

**The corroborating incident (2026-08-11, `iv-snapshot-store-postgres`, consumer repo
`regime-ledger`).** A Wave 2 `se-implement` agent delivered half of task T07's declared ownership:
it wrote the NEW test module (`tests/shared/storage/test_file_discipline_array.py`) but never
touched the MOD implementation file (`shared/storage/file_discipline.py`) the same PLAN row owned.
The gate died at pytest *collection* — `ImportError: cannot import name 'read_committed_json_array'`
— zero tests run, the whole scoped suite interrupted. Unlike the first incident, the repair lay
entirely inside the failing wave's **own** owned paths: E-5 alone covers it, no E-6 needed, and it
is the first live instance of the `wave-internal-defect` class (AC-2.2 #2). Recovery was manual:
implement the missing symbol per the TSPEC section the test's own docstring cited, re-run the exact
gate command to green, re-invoke. Two engine facts observed at this halt feed Q-4/Q-5 and D-AWG-06
below: the halt report carried `haltPhase: null` with no structured record beyond the raw gate
tail, and the recovery hint said "set the QUEUE row back to pending, then re-run the queue" although
the run was a direct `pdlc dev` invocation with no queue in the loop.

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
  neither is this seam's (D-AWG-03, D-AWG-03b).
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
| `advisory.attemptBudget` | `3` | existing, reused | remediation attempts per A6 invocation, one invocation being A6 engaged on one red wave (AC-2.4) |
| `advisory.seamBudgetMinutes` | `10` | existing, reused | working time per attempt, dispatch to verdict; deadline restarts each attempt, so one A6 invocation may consume up to `attemptBudget` × this value (AC-2.4, NFR-4) |
| `advisory.envelope` | gains `E-5`, `E-6` (AC-3.1) | existing, extended | the per-seam allow-list |
| `advisory.waveBudgetPerRun` | `1` | **new** | how many distinct waves A6 may resolve in one run (AC-2.4); exceeded ⇒ escalate |

`advisory.waveBudgetPerRun`'s default `1` is an operator decision recorded under Q-1 (2026-08-13); the earlier proposal of `2` is superseded.

**C-3 — Closed vocabularies.** A6's root-cause classification (AC-2.2) is a closed catalogue on the
emitting side and a total function on the receiving side, per DC-01: an unrecognised or absent
classification is malformed input with a defined fallback, not undefined behaviour.

**C-4 — Enforcement is in code.** Every boundary in §6 is enforced by the workflow script. A prompt
instruction is not a control (inherits `REQ-pdlc-advisory-tier` NFR-1).

**C-5 — Size discipline.** This REQ is measured against `pdlc/hooks/scripts/check-req-size.sh`
(700 lines / 61,440 bytes) at authoring time and at the start of every review round. Measured facts
about shipped behaviour are held in `docs/_constraints/pdlc-wave-gate-baseline.md` v1.1 and cited
by `M-WG-*` id rather than restated, both to keep this document inside its budget and to keep it at
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
  there is no completed work to repair — nor on a post-wave command failure (M-WG-2). **Correction,
  2026-08-13:** the post-wave command runs exactly once and its failure halts immediately
  (`orchestrate-dev.js:12331-12343`); the single run is the detection, not an attempted rebuild, so
  the earlier "already attempted" framing overstated what the script does. Both continue to halt
  exactly as today; what M-WG-2's exclusion means in practice — that a build-breaking source defect
  is permanently outside A6's reach — is Q-2's decision, recorded as O-7. *(US-03.)*
- **AC-1.3** — Given the final V-wave that carries the PROPERTIES tests, Then A6 does not fire, and
  its gate failure halts exactly as today. The V-wave has no ownership-manifest row, so E-5 and E-6
  have no owned-path set to be confined to; a seam whose envelope cannot be evaluated must not act.
  *(US-03.)*
- **AC-1.4** — Given `advisory.enabled` is false, Then A6 is provably inert: no advisory agent is
  dispatched, no model resolution is attempted, the wave halt is the one that ships today, and the
  run's created-file set and phase outcomes are identical to the pre-A6 baseline. Inertness is a
  claim about the run — no dispatch, no model resolution, the halt that ships today, the same created
  files, the same phase outcomes — and not a claim that the shipped default tables are unchanged:
  AC-3.1's envelope members and C-2's new key change those tables and the fixtures transcribing them
  by design (BL-06). *(US-03.)*
- **AC-1.5** — Given wave mode is not in effect (BL-03) or no script-owned gate is configured
  (BL-04), Then A6 does not apply, the phase behaves exactly as it does today, and the
  inapplicability is named once in the run report rather than being silently indistinguishable from
  a quiet seam. The observable is cardinality on a named surface, not mention, scoped to the runs
  that can carry it: in a run **that reaches Phase I and evaluates wave mode** — executing waves or
  taking the no-manifest legacy path alike — exactly one inapplicability notice, not per wave,
  naming **every** absent prerequisite (both, in a run lacking manifest and script-owned gate
  alike); none in a run where A6 applies. A run halting before Phase I, or skipping it on a
  recorded wave ledger, never evaluates wave mode and is outside the population, not a zero-count
  violation of it. Both prerequisites already emit a once-per-run
  notice on that surface: BL-04's when the script-owned gate degrades, BL-03's when the phase takes
  the no-manifest legacy path (BL-06 measures the latter into the baseline). Those shipped notices
  are the carriers — the inapplicability is **added to** them, never emitted beside them — and they
  are **mutually exclusive**: a run takes either the wave path or the no-manifest legacy path, so at
  most one is reachable, BL-03's in a both-absent run. The requirement binds whichever fires, which
  names every absent prerequisite including one whose own carrier was unreachable — so the count
  stays one and the oracle scans the whole surface rather than filtering for A6-authored
  notices. *(US-02.)*

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
  and `unclassified` are diagnosis-only: neither authorises any action. The receiving side is total
  (C-3): a verdict whose classification is absent or outside the set is read as `unclassified` rather
  than rejected, and — because `unclassified` authorises nothing — the wave escalates without
  consuming an attempt, since an attempt is a repair→re-gate cycle and no repair was attempted
  (AC-2.4). This is distinct from the malformed verdict of AC-2.1, which does consume one; where both
  could read — a verdict malformed **and** unclassifiable — AC-2.1 is the specific rule and wins.
  *(US-02, US-05.)*
- **AC-2.3** — Given an A6 diagnosis, Then it cites the gate command's own output as its evidence. A
  diagnosis citing no gate output is malformed under AC-2.1 — the gate output is the only evidence
  that distinguishes a repair from a guess. The evidence is the gate command's captured output as A6
  receives it, not the truncated tail the halt message shows a human, so the criterion stays
  satisfiable on a long suite. *(US-02.)*
- **AC-2.4** — Given the budgets of C-2, Then A6 escalates rather than retrying when any is
  exceeded: more than `advisory.attemptBudget` attempts on one wave, more than
  `advisory.seamBudgetMinutes` on a single **attempt** (per attempt, dispatch to verdict, the
  deadline restarting each attempt — NFR-4 pins the window and its worst case), or an attempt on a
  wave once A6 has
  already **resolved** `advisory.waveBudgetPerRun` distinct waves in this run. One attempt is one
  **repair→re-gate** cycle. Only resolutions consume the wave budget, which fixes the two oracles a
  test can disagree about: two waves A6 attempted and escalated leave the budget untouched, so a
  third red wave still gets an attempt; one wave A6 resolved exhausts the shipped default of 1, so
  the next red wave escalates without a dispatch. *(US-04.)*

### REQ-AWG-03 — The envelope (P0)

- **AC-3.1** — Given the shipped default envelope, Then A6 adds exactly these two members, each with
  a decidable rule:

  | # | Permitted | Decidable rule |
  |---|---|---|
  | E-5 | a repair confined to the failing wave's **own** owned paths | every path the proposal would change is a member of the union of the owned-path sets the PLAN's ownership manifest assigns to that wave's tasks |
  | E-6 | completing a promotion the PLAN schedules for a **later** task | the gate output names a symbol or artifact that a later task's PLAN row already undertakes to produce, **and** every path the proposal would change is a member of that later task's owned-path set |

  Nothing else A6 proposes is in the envelope. The shipped set-equality is over member **ids** alone
  (M-WG-9), so it widens from four members to six; the permitted action and the deciding rule are this
  document's presentation of each member, not fields of a shipped record. The envelope stays one closed
  set of six, assertable by that one set-equality rather than by prose joining two sets. *(US-01, US-03.)*
- **AC-3.2** — Given the tier's existing exclusion set (`REQ-pdlc-advisory-tier` AC-3.4), Then it
  holds unchanged for A6, and clause (a) — **any** change to a test file or test configuration —
  takes precedence over E-5 and E-6 wherever they would otherwise permit a change. This binds even
  when the test file is one the failing wave itself created in this same run: a wave whose own test
  is wrong escalates. Turning a red gate green by editing a test is the pipeline's most dangerous
  failure mode, and A6 sits closer to it than any other seam. Clause (e), the self-modification guard
  paths, holds unchanged and takes precedence in the same way, and A6 adds no carve-out for a wave
  that happens to own them: the guard paths are already inside every seam's exclusion set with the
  shipped defaults, not only Phase MERGE's (M-WG-10). The consequence is named rather than
  discovered — in a repo that modifies this pipeline, including this one, a wave owning
  `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/` or `.claude/workflows/` escalates
  `out-of-envelope`, so the 2026-08-09 motivating incident would today be diagnosed and escalated,
  not repaired; the 2026-08-11 incident, in a consumer repo, is unaffected. Relaxing this is
  D-AWG-01's, and it is the widening that must never be taken without the operator: an agent editing
  the pipeline that supervises it is the risk the guard exists to refuse. *(US-03.)*
- **AC-3.3** — Given A6, Then these are excluded in addition, as a closed set: (f) any change to the
  PLAN, its task table, or its file-ownership manifest; (g) any change to the implementation
  configuration — the test command, the post-wave command, or the post-wave pathspecs; (h) any
  commit, push, or tag; (i) any path outside the set E-5 or E-6 computed for this invocation.
  *(US-03.)*
- **AC-3.4** — Given any refusal, Then it is reported with a reason drawn from the tier's existing
  closed, ordered refusal-reason set (`REQ-pdlc-advisory-tier` AC-3.6), which A6 **does not extend**:
  the set stays at eight members, and an A6 refusal that cannot be expressed in it is a defect in
  this REQ rather than a licence to add a ninth. A diagnosis-only outcome is **not** a refusal and
  needs no member: when the class is `environmental` or `unclassified` A6 proposes nothing, so the
  escalation carries the root-cause class and no refusal reason — which the shipped escalation entry
  already expresses, rendering that field as not-applicable (M-WG-11). The eight are complete for A6
  because every A6 refusal refuses a *proposal*; an outcome with no proposal escalates without one.
  *(US-03.)*
- **AC-3.5** — Given a proposal or a produced change that violates AC-3.1, AC-3.2 or AC-3.3, Then no
  part of it survives the seam, the wave escalates, and the run is not reported as having resolved
  that wave. Each excluded operation enumerated in AC-3.2 and AC-3.3 is asserted by its own test.
  *(US-03, US-04.)*

### REQ-AWG-04 — What A6 may never do (P0)

- **AC-4.1** — Given any A6 invocation, Then a wave is treated as gated only where the configured
  gate command re-ran and returned success on its own. Two terms are held apart here: A6 **applies
  a repair** when an in-envelope, high-confidence proposal is written to the tree, and A6
  **resolves** the wave only in the outcome the rest of this document gives that word — an applied
  repair whose re-gate came back green (AC-4.6, AC-5.3). The observable is three positive
  conjuncts, each on a run of its own, so three fixtures: (i) applies, re-gate green ⇒ the wave is
  resolved, proceeds, and that green invocation is in the run's gate-invocation sequence (AC-4.4);
  (ii) applies, re-gate red ⇒ the wave halts, the tree is restored (AC-5.1), and the halt is the
  wave's own gate halt (AC-5.2); (iii) applies and **no** gate invocation follows ⇒ the wave halts.
  Conjunct (iii) carries the prohibition — it fails exactly where a verdict stood in for a gate
  result — and is unreachable on an ordinary run, so its fixture mutates the shipped control flow
  to drop the re-gate and asserts the halt survives.
- **AC-4.2** — Given any A6 invocation, Then it never commits. M-WG-4 names two committing writers,
  not one: the pathspec-scoped per-task commit of each task's owned paths, and, where a post-wave
  command ran and post-wave pathspecs are configured, the build-output commit scoped to those
  pathspecs. Both are reached only by a green gate. Where both writers are configured — as in this repo — a re-gate's regenerated artifacts already have a writer, and only the paths a *later*
  task owns remain the gap AC-4.6 and O-8 close; otherwise those artifacts are uncommitted too and
  fall to O-8 alike.
- **AC-4.3** — Given any A6 invocation, Then it never edits a test file or test configuration
  (AC-3.2), never edits the PLAN or its ownership manifest, and never edits the implementation
  configuration (AC-3.3).
- **AC-4.4** — Given a repair is applied, Then the wave's **whole gate sequence re-runs, in the order
  the wave ran it** — the configured post-wave command where one is configured, then the configured
  test command (M-WG-2, M-WG-3) — and reaches its own verdict. Re-running the test command alone is
  not a re-gate: the shipped order builds before it gates, so a source-touching repair would re-red
  on its own unbuilt outputs. A post-wave command failing on the re-gate is a red re-gate, not the
  immediate halt it would be on the first pass; that pass reaches no test command, so it contributes
  a truncated sequence — an admitted form, not a defect. A green re-gate lets the wave proceed
  **past the gate**, into the same post-gate path it would have reached anyway; a later check on that path may still halt the wave, and such a halt is neither a
  red re-gate nor a restore trigger (AC-5.1's triggers are exactly refusal, budget exhaustion and
  red re-gate). A red re-gate consumes one attempt and restores the **whole working tree** (AC-5.1),
  never the repair's paths alone: the re-run post-wave command writes generated outputs at paths A6
  never proposed and no envelope rule ranges over, so a per-path restore would leave a halted tree
  carrying artifacts built from a repair no longer present. The run then ends on the wave's own gate
  halt from that restored tree (AC-5.2), which is the tree as it stood before A6 acted, first-pass
  build outputs included. The oracle is an observation of the run: the **ordered sequence** of configured gate-command invocations for the wave equals, **as a
  sequence**, the shipped sequence concatenated once per gate pass — passes = 1 + attempts,
  the first pass not being an attempt (AC-2.4) — each pass truncated at its first failing command.
  One attempt gives `[post-wave, test, post-wave, test]`; `[post-wave, test, post-wave]` where the
  re-gate's post-wave command failed; `[test, test]` where only a test command is configured.
  Set equality is not the unit: it collapses the duplicates and admits a resolution declared on one
  invocation, the defect this criterion excludes. A re-gate skipping a configured command is a
  defect too, and AC-4.1 is falsifiable.

- **AC-4.5** — Given AC-4.1 through AC-4.4, Then each has a failing test proving the prohibition
  holds, and each such test asserts the corresponding positive outcome on the same path — the
  refusal reason recorded, the escalation entry written, the pre-A6 behaviour taken — because a
  negative assertion alone is satisfied by accident. *(US-03.)*
- **AC-4.6** — Given A6 resolves a wave under E-6, Then once that wave's commit step completes the
  repair is part of the branch's committed state: a resolved wave never leaves an A6 repair behind as
  an uncommitted working-tree change, which is what the shipped per-wave commit scope would otherwise
  do with paths owned by a task in a *later* wave (M-WG-12). The repair's paths and the later PLAN
  task that owns them are named in the advisory record (AC-6.1), and that later task's dispatch is
  told which of its owned paths already carry the promotion, so it revises what exists rather than
  rediscovering it. How the existing pathspec-scoped commit path comes to cover paths no task in the
  wave owns is TSPEC's (O-8). *(US-01, US-04.)*

### REQ-AWG-05 — Reversibility and the unchanged halt (P0)

- **AC-5.1** — Given a refusal, a budget exhaustion, or a red re-gate, Then the working tree is
  observably identical to its state immediately before A6 acted — which is the wave's
  **post-dispatch, pre-commit** tree, with the wave agents' own uncommitted work intact. A6 never
  destroys the wave's work in the course of failing to repair it. The mechanism of restoration is
  TSPEC's to choose (O-1). *(US-04.)*
- **AC-5.2** — Given A6 does not resolve the wave, Then the pipeline's existing behaviour proceeds
  unchanged: the same halt, carrying the same reason it emits today (M-WG-3), and the same queue-row
  write to `halted` (M-WG-7). Escalation adds information; it never changes control flow. *(US-04.)*
- **AC-5.3** — Given A6 resolves the wave, Then the run continues along the wave's normal post-gate
  path, its commit step and on to the next wave, and the resolution is visible in the report rather than leaving a
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
  carries no A6 row. The oracle is not absence alone, which an accidentally empty report also
  satisfies: with the tier disabled the report's advisory summary is **absent** — the key is
  undefined, not a six-row all-zero summary — exactly as the tier already requires when disabled
  (`REQ-pdlc-advisory-tier` AC-1.6), and the phase outcomes and created-file set are equal to the
  pre-A6 baseline on the same run. (Stated as an equality on named artifacts, since report text
  varies by timestamp.)
- **NFR-3** — A6 holds no credentials the pipeline does not already hold, and reaches no network
  surface Phase I does not already reach.
- **NFR-4** — No A6 **attempt** exceeds `advisory.seamBudgetMinutes`, measured over the window
  AC-2.4 pins: dispatch to verdict on that one attempt. The deadline restarts each attempt, so an
  A6 invocation on one wave has a worst case of `advisory.attemptBudget` × that value — shipped
  behaviour, and no cap over the invocation as a whole is required here.
  Gate-command run time falls outside the window **structurally** — the window closes at the
  attempt's verdict, and the gate runs after that verdict, not within the measured span — so no
  subtraction is performed and no carve-out is needed. An overrun
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
  from what the PLAN describes, with no review between them. `advisory.waveBudgetPerRun` (default 1)
  bounds it at one resolved wave per run (Q-1, decided). The bound is honest about its
  reach: a per-run knob bounds drift within a single run only, and drift across runs is
  bounded by the operator arriving between them, not by this number.
- **R-4 — This seam treats a symptom.** The motivating incident's root cause was a PLAN whose task
  ordering did not reflect a real dependency. A6 makes that class survivable; it does not make the
  PLAN correct, and a pipeline that routinely repairs its own waves has a Phase P problem it can now
  ignore. AC-6.4's countability and O-6 exist so that ignoring it is a choice rather than a
  side-effect.
- **R-5 — The change is not additive, and not only in the catalogue.** A sixth seam reds the
  transcribed `ADVISORY_SEAMS` set-equalities by design (M-WG-8), and so do the two envelope members
  and the new config key on their own transcribed sets (M-WG-9). That is the intended signal, but it
  means this feature cannot be delivered as a purely additive change and every transcribed surface —
  including the disabled-tier fixtures — must be re-checked (BL-06).

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
- **O-7** — Build-breaking source defects (post-wave command red) are outside A6's reach by
  decision, not by oversight (Q-2, 2026-08-13). Any remedy is a separate mechanism with its own
  trigger and budget, and must not be modelled as a widened A6. Owner: `pdlc-engineering-loop`
  (queue row 6).

- **O-8** — How AC-4.6's E-6 repair reaches the committed state through the existing pathspec-scoped
  commit path, and how the later task's dispatch is told what already exists, are TSPEC's. This REQ
  states only the outcome: no resolved wave leaves its repair uncommitted. Owner: this feature's
  TSPEC.

**Operator questions — all decided 2026-08-13.** The reasoning behind each, with the corrections that
were made to the REQ's own claims while answering them, is recorded verbatim in
`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md` (Q-1…Q-5) rather than carried here. No
question in this REQ is open.

| # | Question | Decision |
|---|---|---|
| Q-1 | May A6 repair a second distinct wave in one run, before any human has seen the first? | **No.** `advisory.waveBudgetPerRun` ships at `1` (C-2, AC-2.4). Revisitable at `2` once wave resume demonstrably resumes the failed wave, not settled forever. |
| Q-2 | Should A6 also fire on a post-wave command failure (M-WG-2)? | **No** (AC-1.2). The consequence is accepted and named: a source defect breaking the post-wave command is permanently outside A6's reach, recorded as O-7. |
| Q-3 | May an `environmental` classification re-run the gate once without a repair? | **No** for v1; D-AWG-05 stands. A6's re-run would be the same machine and the same tree, so the A5 analogy it was argued from is weaker than v1.1 implied, not stronger. |
| Q-4 | Should a deterministic per-task ownership-delivery check feed A6 as diagnosis input? | **Yes**, as a signal and never a verdict, when the tier is enabled. The tier-off half is routed to D-AWG-06, keeping AC-1.4's inertness contract unamended. |
| Q-5 | Should gate-output evidence distinguish a collection error from failing assertions? | **Yes**, as an evidence signal inside the existing classes, not a fifth class; best-effort with a defined absent state, since `testCommand` is arbitrary operator config. The full gate output is available to A6 even though the halt message truncates. |


## 9. Prerequisites

Every row must be checkable at gate time and must hold at HEAD before FSPEC authoring begins.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | The advisory tier ships, with its verdict contract, envelope enforcement, refusal-reason set, advisory record and escalation log | PR merged (`pdlc-advisory-tier`, queue row 1, `done`) | Must exist at HEAD before FSPEC authoring |
| BL-02 | The tier's model-rung resolver is exported and reusable, so NFR-6 needs no restated literals | `pdlc-advisory-corpus-baseline.md` §3, at its stated `Version` | Must exist at HEAD; a restated pair of literals is acceptable only with a named drift observable, never with a named risk |
| BL-03 | The feature under implementation carries a valid PLAN file-ownership manifest, so Phase I runs in wave mode | Phase P's own gate on the PLAN | Checked per run; absent it, AC-1.5 applies and A6 does not fire |
| BL-04 | A configured implementation test command and an injected command transport, so the gate is script-owned rather than self-reported | `.claude/pdlc.config.json` + runtime seam (M-WG-3) | Checked per run; absent either, AC-1.5 applies |
| BL-05 | `pdlc-consolidation-agent` has landed on the default branch | Its per-feature docs are at `docs/completed/pdlc-consolidation-agent/` on the default branch — the observable form, since queue row 2 was retired from the table on 2026-08-12 once merged and no longer states a status | Operator sequencing decision, 2026-08-09: this seam is taken up after that feature lands |
| BL-06 | Two enumerations complete: every transcribed set-equality assertion this feature reds — seam catalogue, envelope defaults, advisory config key set, and the surfaces compared against the catalogue — and every drifted positional recipe in the baseline's §1–§2, each reissued in grep- or symbol-anchored form together with the BL-03 no-manifest notice AC-1.5 rests on, and the mutual exclusivity of that notice with BL-04's | M-WG-9's measured sites and the baseline's §1–§2 recipes, re-run against the current base | Set-equality enumeration before implementation planning; reissue and BL-03 measurement before FSPEC authoring |

**BL-06 scope, corrected 2026-08-18.** The reds are not confined to the seam catalogue: `A6` reds the
`ADVISORY_SEAMS` transcriptions and the surfaces compared against them, `E-5`/`E-6` red the
`ENVELOPE_DEFAULTS` set-equality, and C-2's `advisory.waveBudgetPerRun` reds the `ADVISORY_DEFAULTS`
key-set comparison and the config fixtures transcribing it, two of them disabled-tier fixtures
(M-WG-9). That last point does not contradict AC-1.4: inertness is over run behaviour, not the
shipped default tables. Nor is the recipe drift confined to the three rows AC-4.2, AC-4.4 and AC-4.6
rest on — every positional line-range recipe in §1–§2, the M-WG-1…M-WG-8 rows and §1's V-wave
trailer sentence alike, is drifted until re-run, so BL-01's reader cannot reproduce those facts
today; the facts re-verified true, the recipes did not. Also confirmed at the current base: D-AWG-06's `haltPhase: null` observation still holds — a wave-gate halt records no Phase I
failure row, and `haltPhase` derives from that row.

## 10. Deferrals

Every deferral binds to a queue row that exists today.

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-AWG-01 | Widening the envelope beyond E-5/E-6 | Requires escalation-log evidence about which A6 escalations were routinely rubber-stamped (R-2) | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-02 | A6 coverage of the PROPERTIES V-wave | Needs an owned-path set the V-wave does not have today (AC-1.3) | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-03 | A POSTMORTEM lifecycle for Phase I (M-WG-5) | A real gap, but about re-invocation economics rather than about this seam | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-03b | Re-entry after a wave halt actually resuming at the failed wave (M-WG-6) | The mechanism ships — the interim wave ledger — but its preconditions do not hold in practice (§1), so the gap is one of reliability, not of design | `pdlc-wave-resume` (queue row 20) |
| D-AWG-04 | Firing A6 on a post-wave command failure (Q-2) | Deliberately excluded from v1's single trigger | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-05 | Gate re-run without repair for `environmental` classifications (Q-3) | Absorbing flakiness is a decision that needs evidence it is flakiness | `pdlc-engineering-loop` (queue row 6) |
| D-AWG-06 | Mode-aware Phase I halt reporting: recovery hint distinguishes a queue run from a direct `pdlc dev` invocation, and a wave-gate halt writes a structured halt record (observed 2026-08-11: `haltPhase: null`, reason only in the run-report JSON) | Engine report-surface work, not seam behaviour | `pdlc-engineering-loop` (queue row 6) Also owns the tier-off ownership-delivery diagnosis line routed here by Q-4b (2026-08-13). |

**D-AWG-03 ownership, decided 2026-08-18** (superseding the 2026-08-13 note that left it open). The
approval-skip half of D-AWG-03 is not `pdlc-engineering-loop`'s: the interim wave ledger and
`implementation.startWave`'s resume-at-failed-wave behaviour landed in `87d9c6ad` as
`pdlc-wave-resume`'s (queue row 20) deliverable, and what remains is making them fire. It is split
out as D-AWG-03b above and bound there; D-AWG-03 keeps the POSTMORTEM half only.

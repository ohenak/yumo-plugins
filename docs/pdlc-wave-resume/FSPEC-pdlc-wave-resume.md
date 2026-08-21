# FSPEC — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | pm-author |
| Version | 1.0 |
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

## 1. Overview

This FSPEC specifies the **observable behaviour** of automatic Phase I wave resume: what an
operator sees, and what a run does, when the pipeline is re-invoked after a Phase I wave-gate
halt. It derives entirely from `REQ-pdlc-wave-resume.md` v1.5 and adds no requirement of its own.

**What is specified here.** The decision an invocation makes about where Phase I starts, the
three outcomes it can reach, the announcement each outcome owes the operator, and the conditions
under which the resume record is disregarded. **What is not specified here:** the record's
location, encoding, field names, matching procedure, and write mechanics — those are
implementation contracts owned by the TSPEC (REQ OB-1), which ratifies or revises the shipped
interim contract rather than inventing one (REQ BL-03).

**Grounding, and one prerequisite that is not met.** REQ BL-04 requires the resume mechanism and
`docs/_constraints/pdlc-wave-gate-baseline.md` to be readable in the authoring tree at FSPEC
authoring time. They are **not**: this branch is 1,637 commits behind the default branch
(`git rev-list --count origin/main ^HEAD` → 1637) and neither the mechanism nor the baseline file
exists in it. Every claim this FSPEC makes about shipped behaviour is therefore verified against
`origin/main`, and each such claim names the symbol or file it was verified against, per
DEC-DOC-01. The unmet prerequisite is carried in §7 (OB-F1) and raised as an erratum against the
REQ, because R-4 ("new code alongside") is exactly the risk an authoring tree without the
mechanism invites.

| Claim | Verified against (`origin/main`) |
|---|---|
| A resume record exists as consumer-local, untracked state | `WAVE_STATE_PATH`, `pdlc/workflows/orchestrate-dev.js:12214` |
| Its exclusion is anchored by a root-anchored ignore rule | `.gitignore:41` (`/.claude/pdlc-wave-state.json`), with the anchoring rationale at `.gitignore:24-32` |
| Reading the record is total and never halts the pipeline | `parseWaveLedger`, `pdlc/workflows/orchestrate-dev.js:12267` |
| Commits and the record write are both guarded by the git transport, not by the gate mode | the `if (waveGit)` branch opening at `pdlc/workflows/orchestrate-dev.js:15531` under the comment "Only now — verified — does anything get committed", with the record write at `:15600` inside it |
| An operator pointer is judged explicit before any range clamp | `explicitPointer`, `pdlc/workflows/orchestrate-dev.js:15236`, computed above the clamp at `:15237-15244` |
| The record survives a completed Phase I | the retention comment above the `allWavesRecorded` report row, `pdlc/workflows/orchestrate-dev.js:15607-15615` |
| The queue path runs the same pipeline in-process | `orchestrate-queue.js` imports `orchestrate-dev`'s `main` as `realMain` (`pdlc/workflows/orchestrate-queue.js:45`) and delegates the whole pipeline to it |
| Behaviour is exercised by tests today | the wave-ledger describe block, `pdlc/workflows/__tests__/waveExecution.test.js:2239` |

Line anchors above are positional claims about a revision this branch does not contain; the
symbol and file names are the durable half and are what downstream artifacts should cite.

## 2. Linked Requirements

Every FSPEC clause below traces to at least one REQ acceptance criterion, and every P0/P1
criterion of the REQ is covered by at least one clause. REQ-WVR-07 (P2, Phase 2) is specified
here as a parity clause rather than a distinct flow, because its content is "the same outcome on
a second entry path".

| FSPEC | Subject | Traces to |
|---|---|---|
| FSPEC-WVR-01 | The start-of-Phase-I resume decision and its three outcomes | REQ-WVR-01, REQ-WVR-08 |
| FSPEC-WVR-02 | Disregard conditions and their announcements | REQ-WVR-02, REQ-WVR-05 |
| FSPEC-WVR-03 | Verification independence of any executed wave | REQ-WVR-03, REQ-WVR-08 |
| FSPEC-WVR-04 | Operator override precedence, provenance, and the force-full-run hatch | REQ-WVR-04, OQ-1 |
| FSPEC-WVR-05 | What counts as a completed wave (committed, never merely verified) | REQ-WVR-06, REQ-WVR-09 |
| FSPEC-WVR-06 | Record lifecycle: retained, invalidated by the reader | REQ-WVR-05, REQ-WVR-10 |
| FSPEC-WVR-07 | Queue-delegated parity | REQ-WVR-07 |

**Behavioural complexity justifying an FSPEC.** Three of the seven carry branching a reader
should not be left to infer: FSPEC-WVR-01 resolves one of three mutually exclusive outcomes;
FSPEC-WVR-02 enumerates six disregard causes with two different announcement behaviours; and
FSPEC-WVR-04 defines a precedence relation between two resume sources whose boundary case (the
pointer at its default) reverses which source wins. The remaining four are single-rule clauses
recorded here so the traceability chain has no gap.

**Vocabulary.** *Resume record* — the consumer-local state naming how far a previous run of this
plan got. *Resume point* — the wave number Phase I begins executing at. *Provenance* —
`operator-set` or `automatic`, the source of the resume point. *Completed wave* — a wave whose
work is committed (FSPEC-WVR-05); never a wave that merely passed its gate.

## 3. Behavioral Flow

### 3.1 The resume decision (FSPEC-WVR-01)

The decision happens once per invocation, at the start of Phase I, after the plan's waves are
derived and before the first wave is dispatched. It has one input the operator controls (the
manual resume point) and one the pipeline maintains (the resume record), and it produces exactly
two outputs: a **resume point** and a **provenance**.

| Step | Question | Yes | No |
|---|---|---|---|
| D-1 | Is a manual resume point set to something other than the plan's first wave? | resume point is the operator's; provenance `operator-set`; the record is not consulted at all (§3.2 is skipped, and no disregard reason is announced) → D-6 | → D-2 |
| D-2 | Is a resume record present and usable for this feature and this plan (§3.2)? | → D-3 | resume point is wave 1; provenance `automatic`; announcement per §3.2's IG row → D-6 |
| D-3 | Does the record account for every wave of this plan? | **Outcome (c)**: Phase I is skipped in full → D-5 | → D-4 |
| D-4 | **Outcome (b)**: resume point is the wave after the last completed one; provenance `automatic` → D-6 | | |
| D-5 | Phase I dispatches nothing, executes no gate, and produces no commit; the run report's Phase I row carries a skip status naming the record as the reason | | |
| D-6 | Phase I runs from the resume point; every wave below it is individually announced as skipped, naming which source skipped it | | |

**Outcome (a)** is the D-2 "No" arm and the D-1 out-of-range arm (§3.3): a full run from wave 1.
The catalogue of outcomes is **closed at three** — (a) full run, (b) resume mid-plan, (c) skip
Phase I entirely — and every invocation resolves to exactly one and announces which (REQ-WVR-08).

### 3.2 Consulting the record (FSPEC-WVR-02)

Reached only from D-2, i.e. only when no explicit operator pointer is in force. The record is
put to a fixed, ordered sequence of questions; the **first** one it fails decides the outcome and
supplies the announced reason. Ordering is observable, so it is fixed (BR-03).

| Order | Question | On failure |
|---|---|---|
| 1 | Is there a record at all, and does it carry content? | outcome (a), **silently** — IG-6 |
| 2 | Is the content readable as a record this pipeline wrote? | outcome (a), announced — IG-1 |
| 3 | Does it record the feature being run? | outcome (a), announced — IG-2 |
| 4 | Does it describe this plan's current wave layout? | outcome (a), announced — IG-3 |
| 5 | Is the commit it names still reachable from the current branch tip? | outcome (a), announced — IG-5 |
| 6 | Does it claim no more completed waves than this plan has? | outcome (a), announced — IG-4 |

A record passing all six proceeds to D-3. Question 5 is *falsification of the record*, not
derivation of completion from commit history, and is expressly permitted by REQ-WVR-06's
carve-out. Question 5 has no answer when the run has no way to ask the tree; an unanswerable
probe is **not** a staleness finding (EC-06).

### 3.3 The operator override path (FSPEC-WVR-04)

A manual resume point is judged explicit **before** any range correction, so an out-of-range
pointer is still an operator instruction: it suppresses the record, and the run then corrects the
point to wave 1 and announces it — a full run, provenance `operator-set`. A pointer at the plan's
first wave is **defined as not set** (REQ-WVR-04's boundary): the record is consulted and
provenance is `automatic`. The manual point is therefore a resume-point *selector* only, and can
never express "ignore the record".

The single force-a-full-run hatch is **removal of the resume record** (REQ OQ-1's decision). It
is named in the announcement of outcomes (b) and (c), so an operator reading either announcement
learns how to undo it without consulting documentation. No configuration value expresses the
intent, and none is added.

### 3.4 During the run: what makes a wave completed (FSPEC-WVR-05, -06)

A wave is recorded as completed only after its gate is green **and** its work has been committed
by the run. Nothing about a wave's outcome is recorded before its commits land, so:

- a run that halts at wave N records nothing for wave N, and the next invocation resumes at N;
- a run that commits nothing — because no commit transport was available to it — records nothing
  at all, however green its gates were (REQ-WVR-09);
- a wave whose tasks legitimately produced no changes is still completed, because completion is
  a statement about the wave having been committed *past*, not about commits existing
  (REQ-WVR-06, grounded in REQ OF-2).

Recording is **best-effort**: a record that cannot be written costs the *next* invocation its
resume and nothing else, so failure to write is announced as a notice and never halts the run.

The record is **retained** after Phase I completes (REQ-WVR-05). Retention is what makes a
re-invocation after a later-phase halt (CR, DOD, PUB) cheap: outcome (c). The record never
becomes tracked content, in any run of any length (REQ-WVR-10).

### 3.5 The queue-delegated path (FSPEC-WVR-07)

A queue-driven iteration delegates the whole pipeline to the same run logic in the same process
and the same working directory (`pdlc/workflows/orchestrate-queue.js:45`). The behaviour above
is therefore not restated for the queue; the parity clause is the observable: for the same
feature, plan and record, a delegated run resolves the **same outcome, same resume point and
same provenance** as a direct invocation, and reports them in the queue run's own report. No
queue-specific configuration exists anywhere in this feature.

## 4. Business Rules

| # | Rule | Traces to |
|---|---|---|
| BR-01 | Every invocation of Phase I resolves to exactly one of the three outcomes (a) full run, (b) resume mid-plan, (c) skip Phase I, and announces which. The set is closed: adding or removing an outcome is a deliberate change to this rule. | REQ-WVR-08 |
| BR-02 | The disregard catalogue is closed at six causes (IG-1..6), five announced and one — the absent or empty record — deliberately silent, because an absent record is the normal fresh-run case and not an anomaly. | REQ-WVR-02 |
| BR-03 | Disregard causes are evaluated in the fixed order of §3.2 and the **first** failure supplies the announced reason. A record failing two causes announces the earlier one. Ordering is observable and therefore specified, not incidental. | REQ-WVR-02 |
| BR-04 | An explicit operator resume point outranks the record unconditionally, and the record is not consulted when one is in force — so no disregard reason is announced on that path. | REQ-WVR-04 |
| BR-05 | A manual resume point equal to the plan's first wave is not an explicit setting; a manual point past the plan's last wave is an explicit setting that resolves to a full run. Neither can mean "ignore the record". | REQ-WVR-04 |
| BR-06 | Exactly one force-a-full-run mechanism exists — removal of the record — and it is named in the announcement of outcomes (b) and (c). No configuration value expresses it. | REQ OQ-1 |
| BR-07 | Every resume announces provenance, `operator-set` or `automatic`. A run's starting point is never unattributed. | REQ-WVR-01, -04, R-3 |
| BR-08 | Completion means committed. A wave is never recorded completed on the strength of a green gate alone, and a run that commits nothing records nothing. | REQ-WVR-09 |
| BR-09 | Completion is never inferred from the presence, absence, or message of a task's commit. Testing whether the *specific commit the record names* remains reachable from the branch tip is falsification of the record and is permitted. | REQ-WVR-06 |
| BR-10 | Skipping a wave skips its **dispatch only**. The first executed wave's gate verifies the whole tree before this run commits anything, so skipped waves' work is verified before any new commit lands. | REQ-WVR-03 |
| BR-11 | Under outcome (c) Phase I executes no gate and produces no commit. REQ-WVR-03 is discharged because the phase lands nothing, not because a verification was skipped; an implementation that commits anything in Phase I under outcome (c) violates it. | REQ-WVR-08 |
| BR-12 | No state of the record may make the pipeline refuse to run. Unreadable, foreign, out-of-range and unwritable records all degrade to announced normal behaviour. | REQ C-2 |
| BR-13 | The record is retained after Phase I completes; staleness is a property the reader proves at read time, never one the writer promises at write time. | REQ-WVR-05 |
| BR-14 | The record never becomes tracked content and never appears in any commit the run produces; its exclusion is anchored by an ignore rule rather than by nobody staging it. | REQ-WVR-10, C-1 |
| BR-15 | Writing the record is best-effort: a failed write is announced as a notice and the run continues. | REQ C-2, C-3 |
| BR-16 | A delegated (queue) run and a direct run of the same feature, plan and record resolve the same outcome, resume point and provenance. | REQ-WVR-07 |
| BR-17 | The feature adds no new host capability and no new configuration surface. | REQ C-3, OQ-1 |

**Announcement content, not wording.** BR-01/02/06/07 constrain what an announcement must
*convey* — the outcome, the reason, the provenance, and (for outcomes b and c) the hatch — not
the sentence that conveys it. Exact strings are the implementation's, and the shipped banners
already satisfy these rules; PROPERTIES should assert on content, and any string-identity
assertion is a test-design choice for te-author, not a requirement of this spec.

## 5. Edge Cases and Error Scenarios

| # | Scenario | Expected behaviour | Traces to |
|---|---|---|---|
| EC-01 | No record exists (first ever run of the feature). | Outcome (a), **no announcement**. Silence is correct: this is the fresh-run case. | IG-6, BR-02 |
| EC-02 | A record exists but is empty, or has been cleared to a content-free shape. | Same as EC-01: outcome (a), silent. | IG-6 |
| EC-03 | The record's content is unreadable, or is readable but is not something this pipeline wrote. | Outcome (a), announced with the reason. Never a halt, never a partial run. | IG-1, BR-12 |
| EC-04 | The record names a different feature — e.g. a consumer that ran another feature in the same working copy. | Outcome (a), announced. Cross-feature resume is out of scope by REQ §3. | IG-2 |
| EC-05 | The PLAN was edited between invocations — the routine case when remediating a halt. | Outcome (a), announced as a changed wave layout. A changed plan is never resumed into. | IG-3, R-1 |
| EC-06 | The branch was reset, re-cut, or rebased (including by Phase DOD step 0) since the record was written. | Outcome (a), announced: the recorded commit is no longer reachable from the branch tip. | IG-5, R-1 |
| EC-07 | The record names a commit, but the run has no way to interrogate the tree about it. | The probe's unavailability is **not** a staleness claim; the record is not disregarded on that ground alone and the remaining questions still apply. | §3.2, BR-12 |
| EC-08 | The record claims more completed waves than the current plan has. | Outcome (a), announced. Listed separately from EC-06 because the two are independent guards with different failure modes; fusing them would let one be deleted without the catalogue changing. | IG-4, TE G-02 |
| EC-09 | The record accounts for exactly every wave of the plan — the state after Phase I finished and a later phase halted. | Outcome (c): Phase I skipped in full, announced with the reason and the hatch, and the run report's Phase I row carries a skip status distinct from an executed Phase I's — one row with a distinguishing status, not a second row. | REQ-WVR-08 |
| EC-10 | An operator left a manual resume point set from an earlier recovery. | It wins (BR-04) and the run announces provenance `operator-set`. This is the one case where the operator can still start mid-plan on a stale intent; the announcement is the mitigation, and BR-10 bounds the damage to a gate halt or wasted work, never an unverified commit. | REQ-WVR-04, R-3 |
| EC-11 | A manual resume point is set past the plan's last wave. | Treated as an explicit request; the record is suppressed and the run corrects to wave 1 and announces it. Not a way to skip Phase I. | BR-05 |
| EC-12 | Phase I halts at wave 1. | Nothing is recorded — there is no completed wave — so the next invocation is EC-01: a silent full run. The re-entry is correct but pays no replay tax, since nothing below wave 1 exists to replay. | REQ §1, OF-1 |
| EC-13 | A wave's gate passes but the run commits nothing for it (no commit transport). | The wave is **not** recorded completed; a later invocation starts at that same wave and announces it as not previously completed. This is the feature's only unrecoverable failure mode if got wrong, so it is stated as its own criterion rather than left to inference. | REQ-WVR-09, R-2 |
| EC-14 | A wave's tasks complete without producing any commit because nothing they own changed. | The wave **is** completed — the run committed past it — and a re-invocation of the same plan announces the **next** wave as its resume point. That announcement is the oracle: it fails if completion regresses to commit archaeology. | REQ-WVR-06, OF-2 |
| EC-15 | The record cannot be written (read-only location, permissions). | Announced as a notice; the run continues to completion. The cost is borne by the *next* invocation, which starts from wave 1. | BR-15 |
| EC-16 | Advisory wave-gate remediation acts on a halted wave. | The two compose without coordination: remediation either turns the gate green — after which the wave commits and is recorded normally — or restores the pre-remediation tree and the identical halt stands, leaving the record naming the wave below. Neither path can touch the record, which is in no wave's owned-path set. | REQ OB-3 |
| EC-17 | Phase I runs inside a worktree that does not carry consumer-local state. | No record is visible: outcome (a), silent, as EC-01. Consistent with the standing worktree deferral; the run is correct, merely not cheap. | REQ OB-3, D-DIST-07 |
| EC-18 | A record is stale but passes all six questions — e.g. work was reverted by a commit that is itself an ancestor of the tip. | The run resumes and its first executed wave's gate verifies the whole tree, so the worst outcome is a gate halt, never an unverified commit. This is the accepted residual cost of retention (REQ-WVR-05's "honest cost"). | BR-10, BR-13 |
| EC-19 | Two invocations run concurrently in the same working copy. | Out of scope: the pipeline is serial by construction and the record is consumer-local. No guarantee is offered, and none is needed for any REQ criterion. | REQ §3 |

**No scenario in this table halts the pipeline.** That is the table's own invariant and the
strongest reading of REQ C-2: every row resolves to one of the three outcomes of BR-01, with or
without an announcement.

## 6. Acceptance Tests

## 7. Open Questions

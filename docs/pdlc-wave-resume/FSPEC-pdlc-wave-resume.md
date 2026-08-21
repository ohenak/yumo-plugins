# FSPEC — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | pm-author |
| Version | 1.1 |
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | CROSS-REVIEW-software-engineer-FSPEC-v1.md, CROSS-REVIEW-test-engineer-FSPEC-v1.md |
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

*Phase I*, throughout this document, means the **implementation wave loop** — the waves the PLAN
declares. It does **not** include Phase PT's appended V-wave, which is a separate phase that
dispatches, gates and commits on every invocation independently of any resume decision (EC-20).
Every clause below that says "Phase I dispatches nothing / executes no gate / produces no commit"
is therefore scoped to the implementation waves.

*Announcement* — the observable a run emits to its **run log**; where a criterion additionally
names the run report (REQ-WVR-01's "the run log and final report state the resume point and its
provenance", REQ-WVR-08's Phase I row), the report is a second observable of the same fact and is
named per clause rather than assumed. Provenance is announced content, not private vocabulary: a
test may assert that an announcement conveys `operator-set` or `automatic`, on the run log for
every outcome that announces and additionally on the report row where a clause names it.

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
| D-3 | Does the record account for every wave of this plan? | **Outcome (c)** → D-5 | **Outcome (b)**: resume point is the wave after the last completed one; provenance `automatic` → D-6 |

The two terminal actions the table routes to are not questions and are stated here rather than as
rows of it:

- **D-5 (outcome (c)).** Phase I dispatches no wave, executes no wave gate, and produces no
  implementation-wave commit; the run report's Phase I row carries a skip status naming the record
  as the reason. Phase PT's V-wave is outside this scope (§2 Vocabulary, EC-20).
- **D-6.** Phase I runs from the resume point; every wave below it is individually announced as
  skipped, naming which source skipped it.

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
carve-out. Question 5 has **three** answers, not two: reachable (pass); unreachable (IG-5); and
**no commit named at all**, which passes — a record carrying no commit is honoured on the
remaining questions alone, because a record that predates the corroboration is a compatibility
case and not evidence of staleness (`headCorroborated`, `pdlc/workflows/orchestrate-dev.js`, whose
absent-commit arm is commented "pre-`head` record: honoured as before"). The accepted cost is
stated: such a record survives a history rewrite that question 5 exists to catch, and is bounded
by BR-10 exactly as EC-18 is. Question 5 also has no answer when the run has no way to ask the
tree; an unanswerable probe is **not** a staleness finding (EC-06, EC-07).

**The order above is deliberately not REQ-WVR-02's IG numbering.** The REQ enumerates IG-4
(over-count) before IG-5 (ancestry); the evaluation order here places ancestry *before* over-count,
ratifying the shipped chain rather than the document's numbering (REQ BL-03, R-4). The IG labels
name causes, not precedence; only this table's order is normative (BR-03), and a downstream reader
must not "correct" it to the REQ's numbering.

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

**Completion is a high-water property of the plan, not of the run.** The record states how far
*this plan* has been carried, counted from the plan's first wave, whichever invocation carried it
there. A wave this run skipped as previously completed remains completed in the record this run
writes, so a plan halted at wave 2, resumed, and halted again at wave 4 leaves a record naming
wave 3 — not a record that begins at the resumed run's own first executed wave (AT-18). Completion
therefore never regresses across invocations while the record is honoured at all; the only way it
returns to the plan's first wave is a disregard cause of §3.2.

Recording is **best-effort**: a record that cannot be written costs the *next* invocation its
resume and nothing else, so failure to write is announced as a notice and never halts the run.
Recording is also **per wave**, so a failed write costs only the waves recorded after the last
successful one: if some write in the run succeeded, the next invocation resumes from the last
successfully recorded wave and re-executes the rest; only a run in which *no* write succeeded
leaves the next invocation a full run (EC-15, AT-15).

The record is **retained** after Phase I completes (REQ-WVR-05). Retention is what makes a
re-invocation cheap — outcome (c) — for a later-phase halt that leaves the branch's history
intact: a CR halt, a DOD halt whose step-0 rebase changed nothing, a PUB CI-red re-poll. A
re-invocation whose history *was* rewritten (a DOD step-0 rebase that replays commits, a re-cut
branch) is not the cheap case: the recorded commit is no longer reachable, question 5 disregards
the record, and the run is a full one with an announced reason (EC-06). Both are correct; only the
first is cheap, and §5's table carries one row for each. The record never becomes tracked content,
in any run of any length (REQ-WVR-10).

### 3.5 The queue-delegated path (FSPEC-WVR-07)

A queue-driven iteration delegates the whole pipeline to the same run logic in the same process
and the same working directory (`orchestrate-queue` imports `orchestrate-dev`'s `main` as
`realMain` and delegates the whole pipeline to it — §1). The behaviour above
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
| BR-07 | Every run that starts anywhere other than the plan's first wave — outcomes (b) and (c) — announces its provenance, `operator-set` or `automatic`, and so does a full run reached by an operator pointer or by an announced disregard cause. A full run reached with no record at all (IG-6) is silent by BR-02 and is not an unattributed start: it is the absence of a resume. | REQ-WVR-01, -04, R-3 |
| BR-08 | Completion means committed. A wave is never recorded completed on the strength of a green gate alone, and a run that commits nothing records nothing. Completion is a high-water property of the plan, counted from the plan's first wave and monotonic across invocations while the record is honoured: a wave skipped as previously completed stays completed in the record this run writes (§3.4). | REQ-WVR-09, REQ-WVR-01 |
| BR-09 | Completion is never inferred from the presence, absence, or message of a task's commit. Testing whether the *specific commit the record names* remains reachable from the branch tip is falsification of the record and is permitted. | REQ-WVR-06 |
| BR-10 | Skipping a wave skips its **dispatch only**. The first executed wave's gate verifies the whole tree before this run commits anything, so skipped waves' work is verified before any new commit lands. | REQ-WVR-03 |
| BR-11 | Under outcome (c) the implementation wave loop dispatches nothing, executes no wave gate, and produces no commit. REQ-WVR-03 is discharged because the wave loop lands nothing, not because a verification was skipped; an implementation that commits anything in the wave loop under outcome (c) violates it. The rule is scoped to the wave loop (§2 Vocabulary): Phase PT's V-wave is outside it and replays on every invocation (EC-20). | REQ-WVR-08 |
| BR-12 | No state of the record may make the pipeline refuse to run. Unreadable, foreign, out-of-range and unwritable records all degrade to announced normal behaviour. | REQ C-2 |
| BR-13 | The record is retained after Phase I completes; staleness is a property the reader proves at read time, never one the writer promises at write time. | REQ-WVR-05 |
| BR-14 | The record never becomes tracked content and never appears in any commit the run produces; its exclusion is anchored by an ignore rule rather than by nobody staging it. | REQ-WVR-10, C-1 |
| BR-15 | Writing the record is best-effort and per wave: a failed write is announced as a notice, the run continues, and the cost is bounded to the waves recorded after the last successful write — a full run for the next invocation only when no write in the run succeeded. | REQ C-2, C-3 |
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
| EC-09 | The record accounts for exactly every wave of the plan — the state after the wave loop finished and a later phase halted **without rewriting the branch's history** (a CR halt, a PUB CI re-poll, a DOD whose step-0 rebase replayed nothing). | Outcome (c): the implementation wave loop is skipped in full, announced with the reason and the hatch, and the run report's Phase I row carries a skip status distinct from an executed Phase I's — one row with a distinguishing status, not a second row. | REQ-WVR-08 |
| EC-10 | An operator left a manual resume point set from an earlier recovery. | It wins (BR-04) and the run announces provenance `operator-set`. This is the one case where the operator can still start mid-plan on a stale intent; the announcement is the mitigation, and BR-10 bounds the damage to a gate halt or wasted work, never an unverified commit. | REQ-WVR-04, R-3 |
| EC-11 | A manual resume point is set past the plan's last wave. | Treated as an explicit request; the record is suppressed and the run corrects to wave 1 and announces it. Not a way to skip Phase I. | BR-05 |
| EC-12 | Phase I halts at wave 1. | Nothing is recorded — there is no completed wave — so the next invocation is EC-01: a silent full run. The re-entry is correct but pays no replay tax, since nothing below wave 1 exists to replay. | REQ §1, OF-1 |
| EC-13 | A wave's gate passes but the run commits nothing for it (no commit transport). | The wave is **not** recorded completed; a later invocation starts at that same wave and announces it as not previously completed. This is the feature's only unrecoverable failure mode if got wrong, so it is stated as its own criterion rather than left to inference. | REQ-WVR-09, R-2 |
| EC-14 | A wave's tasks complete without producing any commit because nothing they own changed. | The wave **is** completed — the run committed past it — and a re-invocation of the same plan announces the **next** wave as its resume point. That announcement is the oracle: it fails if completion regresses to commit archaeology. | REQ-WVR-06, OF-2 |
| EC-15 | **No** write of the record in the run succeeds (read-only location, permissions). | Each failure is announced as a notice; the run continues to completion. The cost is borne by the *next* invocation, which resolves outcome (a) and runs from wave 1. | BR-15 |
| EC-15a | **Some** write succeeds and a later one fails — the reachable partial case, since recording is per wave. | Announced as a notice; the run continues. The next invocation resolves outcome (b) at the wave after the last **successfully recorded** one, and re-executes the waves whose writes were lost. The replay cost is the number of consecutive failed writes at the end of the run, not the whole plan. This is a cost clause, not a correctness one: BR-10 bounds the damage either way. | BR-15, BR-10 |
| EC-16 | Advisory wave-gate remediation acts on a halted wave. | The two compose without coordination: remediation either turns the gate green — after which the wave commits and is recorded normally — or restores the pre-remediation tree and the identical halt stands, leaving the record naming the wave below. Neither path can touch the record: **this feature's PLAN claims it in no wave's owned-path set**, so no remediation envelope of this run can authorise touching it. The general form — that no PLAN may claim consumer-local state as owned — is a Phase P gate question, not a per-feature assertion, and is routed as such (OB-F6). | REQ OB-3 |
| EC-17 | Phase I runs inside a worktree that does not carry consumer-local state. | No record is visible: outcome (a), silent, as EC-01. Consistent with the standing worktree deferral; the run is correct, merely not cheap. | REQ OB-3, D-DIST-07 |
| EC-18 | A record is stale but passes all six questions — e.g. work was reverted by a commit that is itself an ancestor of the tip. | The run resumes and its first executed wave's gate verifies the whole tree, so the worst outcome is a gate halt, never an unverified commit. This is the accepted residual cost of retention (REQ-WVR-05's "honest cost"). | BR-10, BR-13 |
| EC-19 | Two invocations run concurrently in the same working copy. | Out of scope: the pipeline is serial by construction and the record is consumer-local. No guarantee is offered, and none is needed for any REQ criterion. | REQ §3 |
| EC-20 | Outcome (c) is reached, and the run continues past the implementation wave loop into Phase PT's V-wave. | The V-wave **replays**: it dispatches, gates and commits on every invocation, independently of the resume decision, because it is not one of the plan's waves and no wave loop records it (`phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`, `pdlc/workflows/orchestrate-dev.js`, reached unconditionally after the wave loop). Outcome (c)'s "no dispatch, no gate, no commit" is scoped to the wave loop (§2, BR-11). Whether the V-wave should be recordable is not this FSPEC's to decide — it is an upstream question, raised as an erratum against REQ-WVR-08. | §2, BR-11, AT-12 |
| EC-21 | The record names no commit at all (a record written before commit corroboration existed). | Question 5 passes: the record is honoured on the remaining questions alone (§3.2). The accepted cost is that such a record survives a history rewrite, bounded exactly as EC-18 is. | §3.2, BR-10 |

**No scenario in this table halts the pipeline.** That is the table's own invariant and the
strongest reading of REQ C-2: every row resolves to one of the three outcomes of BR-01, with or
without an announcement.

## 6. Acceptance Tests

Each test is stated so a test engineer can derive a failing test without asking a question. The
**oracle is always an observed resume** — an announced outcome, a dispatched or undispatched
wave, a report row — never the presence of a code path (REQ §1).

**AT-01 — automatic resume at the failed wave (REQ-WVR-01).**
*Who:* pipeline operator. *Given:* a Phase I run of a multi-wave plan halted at wave N>1, the
cause since addressed, the same feature and an unchanged plan, and no resume-related
configuration set. *When:* the pipeline is re-invoked. *Then:* waves 1..N-1 are each announced as
skipped and dispatch nothing; wave N is dispatched; the run announces its resume point as wave N
with provenance `automatic`; the final report states the same.

**AT-02 — the disregard catalogue is complete and closed (REQ-WVR-02).**
*Who:* pipeline maintainer. *Given:* one record per row of §3.2. *When:* the pipeline is
invoked for each. *Then:* each produces outcome (a); IG-1..5 each announce their own distinct
reason and IG-6 announces nothing. *Oracle form:* **set equality** over the **announced reasons**,
not over the six cause labels. IG-1 is one cause covering more than one distinguishable way the
content fails to read as this pipeline's record, and each such way announces its own reason; a
set-equality check over six labels cannot fail when one of IG-1's arms is deleted. The enumeration
of IG-1's arms belongs to the record's contract and is owned by the TSPEC (OB-F2); the check is
set equality over the reasons that enumeration yields, transcribed from the spec, never read back
out of the mechanism under test.

**AT-03 — ordering of disregard causes (BR-03).**
*Given:* a record failing **both ancestry (IG-5) and over-count (IG-4)** — it names a commit not
reachable from the tip *and* claims more completed waves than the plan has. *When:* invoked.
*Then:* **IG-5** is the announced reason. *Why this pair:* it is the one pair where §3.2's
normative order visibly diverges from REQ-WVR-02's IG numbering, so it fails under the REQ's
numbering while passing under the shipped order; a pair the two documents agree on (a foreign
feature and a changed plan) passes either way and tests nothing.

**AT-04 — verification independence (REQ-WVR-03).**
*Given:* a record producing outcome (b). *When:* the resumed run reaches its first executed wave.
*Then:* the full suite runs over the whole tree before any new commit lands, with the same gate
outcome semantics as an unresumed run. *Negative arm, over a named fixture set:* the same
assertion holds for each of — a resume point at the plan's second wave, at its last wave, a record
whose named commit is the tip, and one whose named commit is an earlier ancestor — and no member
of that set produces a commit that precedes a whole-tree verification. The set is finite and
enumerated in PROPERTIES; "any content, including adversarial bytes" is not an oracle, since
content that fails §3.2 never reaches outcome (b) at all.

**AT-05 — operator override wins, with provenance (REQ-WVR-04).**
*Given:* both a valid record and a manual resume point beyond the plan's first wave. *When:*
invoked. *Then:* the manual point is the resume point, provenance is `operator-set`, and no
disregard reason is announced — the record was not consulted.

**AT-06 — the pointer at its default is not a setting (REQ-WVR-04 boundary).**
*Given:* a valid record and a manual resume point equal to the plan's first wave. *When:*
invoked. *Then:* the record is honoured and provenance is `automatic` — byte-identical in
outcome to having set nothing.

**AT-07 — the pointer past the end is a full run, not a skip (BR-05).**
*Given:* a valid record and a manual point past the last wave. *When:* invoked. *Then:* outcome
(a) from wave 1, announced, provenance `operator-set`; no wave is skipped.

**AT-08 — the hatch is named where it is needed, and it is the only one (BR-06, BR-17).**
*Who:* pipeline operator. *Given:* runs resolving outcome (b) and outcome (c). *Then:* each run's
announcement of that outcome names the record-removal hatch. *Positive conjunct 1 — the hatch
works:* the same fixture with the record removed resolves outcome (a) with its announcement, so
the hatch named is the hatch that functions. *Positive conjunct 2 — set equality, not absence:*
the recognised `implementation.*` configuration keys are exactly {`testCommand`,
`postWaveCommand`, `postWavePathspecs`, `startWave`}, asserted as set equality against that
literal, transcribed from this spec and never read back out of the config parser. Adding a
`forceFullRun`-style key therefore fails a test rather than passing one. Both conjuncts are
positive; no arm asserts the absence of an unnamed key from an open universe.

**AT-09 — verified-but-uncommitted is never completed (REQ-WVR-09).**
*Given:* a run whose waves' gates pass but which commits nothing, because no commit transport is
available. *When:* the pipeline is re-invoked for the same feature and unchanged plan. *Then:*
implementation starts at that same wave, announcing it as not previously completed. *Companion
arm:* the same run with a transport, under either gate mode, records normally — so the guard is
shown to be the transport, not the gate mode.

**AT-10 — a no-change wave is still completed (REQ-WVR-06).**
*Given:* a plan whose wave K contains only tasks that produce no changes, run to a halt at a
later wave. *When:* re-invoked. *Then:* the resume point announced is past K. *Negative arm, with
its positive conjunct on the same path:* with a stray unrelated commit added to, or removed from,
history, the announced resume point is **the same wave** as without it — the positive assertion is
the announced next wave, not the absence of a change.

**AT-11 — ancestry corroboration is falsification, not archaeology (REQ-WVR-06 carve-out).**
*Given:* a valid record whose named commit is no longer reachable from the branch tip. *When:*
invoked. *Then:* outcome (a), announced with that reason (EC-06). *And:* with the probe
unavailable, the record is not disregarded on ancestry grounds (EC-07).

**AT-12 — all waves recorded: the implementation wave loop is skipped in full (REQ-WVR-08).**
*Who:* pipeline operator. *Given:* a valid record for this feature and unchanged plan accounting
for every wave. *When:* invoked. *Then:* the skip is announced with its reason and the hatch, and
the report's Phase I row carries a skip status distinct from an executed Phase I's — one row, not
two. *Oracle:* **call counts**, not absence — with a counting spy on the agent seam and one on the
command seam, the implementation wave loop performs **zero** agent dispatches and **zero** gate
invocations, and produces no implementation-wave commit. *Fourth conjunct — the V-wave:* Phase PT
still dispatches exactly **one** agent and, under a script-owned gate, invokes the gate command
exactly **once**, and its commit is the run's only Phase-I-adjacent commit (EC-20). Every count is
a literal from this spec, never a value derived from the mechanism under test; an absence-shaped
"no commit" oracle alone cannot distinguish a skipped V-wave from one that ran with nothing to
add.

**AT-13 — the outcome catalogue is closed at three (BR-01).**
*Who:* pipeline maintainer. *Given:* three fixtures, one per outcome — (a) no record present
(EC-01), (b) a valid record naming fewer completed waves than the plan has (AT-01's fixture), and
(c) a valid record accounting for every wave (AT-12's fixture) — over the same feature and plan.
*When:* the pipeline is invoked for each. *Then:* each resolves exactly one outcome, each
announces which, and the set of outcomes observed across the three equals {(a) full run, (b)
resume mid-plan, (c) skip the wave loop}. *Oracle form:* **set equality**, so a deleted outcome
fails a test rather than passing one; containment does not discharge BR-01.

**AT-14 — the record never becomes tracked content (REQ-WVR-10).**
*Given:* any run of any length that writes the record. *When:* the run's commits are inspected.
*Then:* no commit contains the record, and the record is not a tracked file. *And:* its exclusion
is anchored by an ignore rule, asserted against the rule itself rather than against the absence
of churn in one run. *Branch precondition:* the rule exists on the default branch and **not** in
this authoring tree, so this test is RED here until OB-F1 is discharged. That is a branch-state
consequence, not a defect of the rule: te-author must not weaken the arm to observed quiet to make
it pass before the rebase.

**AT-15 — a failed write is a notice, never a halt; the cost is bounded (BR-15).**
*Arm 1 — no write succeeds.* *Given:* a run in which **no** write of the record succeeds. *Then:*
a notice is announced per failure, the run continues to its normal outcome, and a subsequent
invocation resolves outcome (a) from wave 1 (EC-15).
*Arm 2 — some write succeeds.* *Given:* a run whose wave-1 write succeeds and whose write at a
later wave M fails. *Then:* the run still continues to its normal outcome, and a subsequent
invocation resolves outcome **(b)** at the wave after the last successfully recorded one,
re-executing the waves whose writes were lost (EC-15a). *Discriminating value:* arm 2 fails an
implementation that discards the whole record on any write failure, while arm 1 alone does not.

**AT-16 — queue parity (REQ-WVR-07).**
*Given:* the same feature, plan and record. *When:* run once directly and once through a
queue-delegated iteration. *Then:* both resolve the same outcome, the same resume point and the
same provenance, and the queue run's own report states them. *Discriminating arm:* the record
resolves against the same working directory on both paths — a resume point differing between the
two fails this test while AT-01..05 all still pass.

**AT-17 — advisory remediation composes without coordination (EC-16).**
*Given:* a halted wave on which the advisory wave-gate seam acts. *Then:* on resolution the wave
commits and is recorded; on failure the identical halt stands and the record still names the
wave below. *And:* **this feature's PLAN** claims the record in no wave's owned-path set — a
finite check over that PLAN's ownership manifest, asserted by name. The general claim (no PLAN may
ever claim consumer-local state) is not asserted here: it is unfalsifiable as a per-feature test
and is routed to Phase P as a gate question (OB-F6).

**AT-18 — completion accumulates across invocations (BR-08, §3.4).**
*Who:* pipeline operator. *Given:* a multi-wave plan halted at wave 2, re-invoked and halted again
at wave 4, with the same feature, an unchanged plan, and no resume-related configuration set.
*When:* the pipeline is re-invoked a third time. *Then:* the announced resume point is **wave 4**
with provenance `automatic`, and waves 1–3 are **each** announced as skipped. *Discriminating
value:* a record that counted only the waves the previous run itself executed would announce a
resume point of wave 3 and skip only wave 3 — failing this test while AT-01..AT-17 all still pass,
because each of those covers at most one halt and one resume.

## 7. Open Questions

No question in this FSPEC is open against the operator; the REQ closed OQ-1 and OB-1..3. What
remains is obligations owed downstream, each with a named owner.

| # | Obligation | Owner | Discharged when |
|---|---|---|---|
| OB-F1 | REQ BL-04 is **not met**: this authoring tree is 1,637 commits behind the default branch and contains neither the resume mechanism nor `docs/_constraints/pdlc-wave-gate-baseline.md`. Every shipped-behaviour claim in §1 is therefore verified against `origin/main`, and this FSPEC's positional citations are not re-verifiable in this tree. Bring the branch onto the current default-branch base before TSPEC authoring, or R-4's "new code alongside" outcome becomes unavoidable. Raised as an erratum against the REQ, whose §10 records BL-04 as "discharged at FSPEC authoring". | orchestrator / operator (branch management) | the branch is rebased and the mechanism is readable in the tree |
| OB-F2 | Ratify or revise the shipped interim contract — the record's location, encoding, matching procedure and write mechanics — rather than inventing a second one alongside it (REQ BL-03, R-4). This FSPEC deliberately states none of them. | TSPEC (se-author) | TSPEC names the contract and states whether it formalises or replaces the interim |
| OB-F3 | Decide the fate of the content-free "cleared" record shape that the reader tolerates (EC-02) but nothing ever writes: wire it or drop it. The observable behaviour is identical either way, which is why it is not a requirement here. | TSPEC (se-author) | TSPEC states the decision |
| OB-F4 | Promote REQ OF-1 and OF-2 into `docs/_constraints/pdlc-wave-gate-baseline.md` as `M-WVR-1..2` in the next unoccupied section, each with a re-derivation command, bumping the file to the next version above the one found — and record that `M-WG-6` was reviewed and left, not missed. Blocked on OB-F1: the file is not in this tree. | se-author, at TSPEC authoring | the baseline carries the new section and §4 of the REQ cites by `M-WVR-*` id |
| OB-F5 | Assert set equality rather than containment for both closed catalogues — the six disregard causes (AT-02) and the three outcomes (AT-13) — so a deletion fails a test instead of passing one. Treat the feature-key, plan-layout and ancestry checks as the highest-value oracles, per REQ-WVR-05's honest cost. | PROPERTIES (te-author) | PROPERTIES carries both set-equality checks |
| OB-F6 | Record one assertion that the resume record is in no wave's owned-path set, so no advisory remediation envelope can authorise touching it (EC-16, REQ OB-3). | PROPERTIES (te-author) | the assertion exists |

**One recorded interaction, not a coordination requirement (REQ OB-3).** The advisory tier's
wave budget is scoped per *run*. Automatic resume makes runs shorter and more numerous, so that
budget effectively refreshes per re-invocation. It stays bounded in practice because clearing a
halt still requires a human, but `pdlc-advisory-wave-gate`'s compounding-drift bound is weaker
under resume than that feature assumed. Noted for its owner; nothing in this FSPEC changes.

**Assumptions.** (A-1) The pipeline is invoked serially against a working copy — EC-19's
concurrency case needs no guarantee. (A-2) An operator who sets a manual resume point intends it
for the invocation in which it is set; EC-10's stale-pointer case is mitigated by announcement,
not by expiry. Both are vetoable by the operator; neither is relied on by any P0 criterion.

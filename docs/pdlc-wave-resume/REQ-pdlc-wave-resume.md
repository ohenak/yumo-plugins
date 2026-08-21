---
feature: pdlc-wave-resume
ready: true
depends-on: [pdlc-consolidation-agent, pdlc-advisory-wave-gate]
---

# REQ — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | pm-author (operator-directed session, 2026-08-09) |
| Version | 1.5 |
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

**Amendment, 2026-08-21 (v1.3) — round-1 cross-review.** Applied against the v1.2 text on the
default branch, which an earlier dispatch of this round had regressed to v1.0 (SE F-01): the
v1.2 amendments below are **not** withdrawn. Frontmatter `ready:` flips to `true` — BL-01, BL-02
and BL-03 (§5) are all resolved at HEAD of the default branch, and both depended-on features are
archived under `docs/completed/`. §4 cites `M-WG-*` ids with re-derivation commands; REQ-WVR-02
closes its ignore catalogue; REQ-WVR-04 gains its default-pointer boundary; REQ-WVR-06 is
narrowed with a positive conjunct; REQ-WVR-08..10 are added; R-1 and R-2 are re-attributed. Per
finding, see `CROSS-REVIEW-software-engineer-REQ-v1.md` and `CROSS-REVIEW-test-engineer-REQ-v1.md`.

**Amendment, 2026-08-21 (v1.4) — round-2 cross-review.** §1's operational finding is restated
(TE G-01); REQ-WVR-02 splits IG-4 and renumbers the silent case to IG-6 (TE G-02); §5 gains BL-04
(SE G-01); the wave-gate baseline is cited at its current version (SE/TE G-03); code citations
move to symbol and banner-string names (SE G-02, TE G-04); REQ-WVR-08 names its phase-row reading
(TE G-05); REQ-WVR-05's superseded position is labelled history (SE G-04).

**Amendment, 2026-08-21 (v1.5) — round-3 cross-review.** §1 separates never-written from
discarded and cites the write's guard re-derivably (SE F-01, F-03; TE H-03); OQ-1's banner recipe
matches both banners (SE F-02, TE H-01); §10 enumerates all of §5 (TE H-02, Q-01).

**Note on this branch's base (SE F-01, F-02).** This feature branch is 1,637 commits behind the
default branch and predates the merge of the mechanism §1 describes; the code claims in this REQ
have their **substance** verified against the default branch — not against this branch's tree,
where the mechanism does not exist at all — while any positional anchor inherited from earlier
revisions dates from 2026-08-13 and is not re-verified. Bringing the branch onto the current
default-branch base is a branch-management step owed before FSPEC authoring; it is BL-04 (§5).

**Amendment, 2026-08-13 (v1.2).** The two decisions this REQ was waiting on are recorded
(operator delegated adjudication). REQ-WVR-05 is restated as **retention with invalidation**,
aligning the requirement with the shipped interim ledger; OQ-1 resolves to **record deletion as the
only force-full-run hatch**, with no new config knob. No question in this REQ is open.

**Amendment, 2026-08-13.** OB-1, OB-2 and OB-3 (§9) are answered against the shipped interim
mechanism, which reconciliation confirms is already merged to main; §1 and §5 are corrected for
staleness. The two questions this amendment left open — OQ-1's hatch form and REQ-WVR-05's
lifecycle — were both decided in v1.2 above; neither is open.

## 1. Problem / Context

Phase I (Implementation) runs a plan's tasks in topologically ordered, ownership-disjoint
waves in one shared tree. Each wave ends with a script-owned gate; a red gate halts the
pipeline with the halted wave's work deliberately uncommitted. This halt-and-refuse
contract is correct and is not in question here.

What the halt costs is the *re-entry*. A re-invocation of the pipeline re-enters Phase I
at wave 1 and re-dispatches implementation agents over every wave whose work is already
committed, each of which reads the plan, finds its task done, and reports a no-op.
Observed on the pdlc-consolidation-agent run of 2026-08-09 (OF-1, §4): a 16-wave plan
halted at wave 2 and again at wave 4. The re-invocation after the wave-4 halt paid seven
no-op agent dispatches (waves 1–3) before reaching the point of interest; the re-invocation
after the wave-2 halt replayed wave 1 only, a single task. Multi-halt runs pay this replay
tax once per halt, in the task count of every wave below the halted one, so it grows with
the plan rather than costing a fixed amount per halt.

A manual resume pointer now exists (`implementation.startWave`, an operator-set
configuration value — BL-01, §5). It works, but it demands operator arithmetic with a
sharp edge: the correct resume point is the wave that *failed* — whose work is
uncommitted — not the wave after it, and an operator who forgets to clear the pointer
causes a later, unrelated run to silently skip waves. The pointer converts the replay tax
into an attention tax on exactly the unattended-operation path the pipeline exists to
serve.

**Correction, 2026-08-13.** The sharp edge above is overstated in one direction: an
out-of-plan-range `startWave` is already clamped to 1 with an announced notice (the clamp sits
immediately below `explicitPointer` in `orchestrate-dev.js`), so that failure mode is mitigated at HEAD. An
in-range stale pointer still silently skips waves, so the claim is accurate in spirit
but not, as originally written, without qualification.

This feature makes the resume point self-determining: a re-invocation after a Phase I
halt resumes at the correct wave with no operator action, while an explicit operator
override still wins and correctness never depends on the resume record being right.

An **interim** mechanism for this is **already merged to the default branch** (added 2026-08-09
to unblock the live run, marked INTERIM in its comments, landed with
`pdlc-consolidation-agent`), so BL-01 and BL-03 (§5) are already resolved. Per the
activation-check discipline, this feature's deliverable is therefore the *formalized, reviewed
contract* — behavioural specification, property tests, and operator-facing documentation — that
supersedes or replaces the interim mechanism, not necessarily new wiring.

**Operational finding, 2026-08-13, re-verified 2026-08-21 — the interim ledger fires, but
narrowly, and several routine conditions discard what it writes.** The 2026-08-13 observation was
that no `.claude/pdlc-wave-state.json` existed anywhere in this repo. That is **no longer true**:
as of 2026-08-21 this working copy carries an untracked record for `pdlc-advisory-wave-gate` with
seven waves recorded green and a `head` stamp, so the mechanism has fired and recently. What
survives re-verification against the default branch is the narrowness, not the never — three
shipped preconditions keep the record from reaching the next run under conditions this pipeline
meets routinely: **one prevents it from ever being written, two discard what was written** — two
shapes, two oracles. That is the concrete gap this feature closes, so it belongs in FSPEC as such:

1. The write happens only after a wave goes green **and** its work is committed, so a run that
   halts at wave N records nothing for wave N — and one that halts at wave 1 records nothing at
   all, which is precisely the halt this feature is meant to resume from (OF-1). The write is
   guarded by the **git transport**, not by the gate mode: a run with no transport verifies but
   commits nothing and therefore records nothing, which is REQ-WVR-09's premise. A self-report-gate
   run *with* a transport records normally. Re-derivable at the default branch, where this guard
   has been misread as the gate mode's (SE F-01): the write's branch is the one opening with the
   comment "Only now — verified — does anything get committed", a **sibling** of the gate-mode
   branch, which closed at its own `else` (the self-report arm) — so commits and record are
   reached in either gate mode.
2. The record is ignored when the PLAN's wave layout changes (`planHash`), so any PLAN edit
   between invocations — routine when remediating a halt — sends the next run back to wave 1.
3. The record is ignored when the recorded commit is not an ancestor of HEAD, and Phase DOD step 0
   rebases `feat-{feature}` onto the default branch, rewriting exactly those commits.

One consequence for this REQ. **REQ-WVR-01's contract is not satisfied by the interim** — BL-03's
"formalize and replace, never duplicate" rule still applies, and the FSPEC's oracle must be an
**observed resume, not the presence of the code path**, because a code path is never an oracle:
the three preconditions above are exactly the distance between "the write exists" and "a resume
happened".

## 2. Goals

- **G-1 — zero-action resume.** After a Phase I wave-gate halt, re-invoking the pipeline
  resumes implementation at the wave whose work is not yet committed, with no
  configuration edit, no arithmetic, and no clean-up step owed by the operator.
- **G-2 — correctness independent of the resume record.** The record that determines the
  resume point is an optimisation, never a trust anchor: whatever it says — stale,
  foreign, corrupt, or maliciously wrong — no new commit lands before the full test suite
  has verified the whole tree, and the worst outcome of a bad record is a full run or a
  gate halt, exactly as today.
- **G-3 — operator override wins.** An explicitly set manual resume point always takes
  precedence over the automatic determination, and every resume announces its provenance
  (automatic vs. operator-set) so a run's starting point is never a mystery.
- **G-4 — self-invalidating lifecycle.** A leftover resume record never warps a later run: a
  changed plan, a different feature, or a branch re-cut since the record was written invalidates
  it, and an invalid record is treated exactly as an absent one. Staleness is a property the
  reader proves, not one the writer promises — the record may survive a completed Phase I
  (REQ-WVR-05, decided v1.2: retention with invalidation), and it earns that survival by making a
  post-Phase-I re-invocation cheap.
- **G-5 — unattended parity.** The queue-driven, unattended invocation path benefits
  identically to a direct invocation, with no per-run configuration.

## 3. Non-Goals

- **Remediating the failure itself.** Diagnosing or repairing whatever made the wave gate
  red belongs to the advisory tier (the wave-gate remediation seam is
  `pdlc-advisory-wave-gate`'s scope). This feature only removes the replay tax from the
  re-entry after the cause is addressed.
- **Changing the halt contract.** The wave gate's refusal to commit red work, the absence
  of a POSTMORTEM on wave halts, and the halt's queue-row recording all stay exactly as
  they are.
- **Resuming across features or branches.** A resume record never carries from one
  feature, plan, or branch to another; cross-feature state is out of scope.
- **Commit-history archaeology.** Deriving wave completion from the presence of task
  commits is explicitly rejected (OF-2, §4), not deferred.
- **Skipping verification.** No form of "trust the record and skip the gate" is in scope
  at any priority.

## 4. Constraints

Observed facts. Facts already measured in the wave-gate baseline
(`docs/_constraints/pdlc-wave-gate-baseline.md`, present at HEAD of the default branch) are
**cited by `M-*` id and not restated** here; the two genuinely new observations carry the command
that re-derives them, so a reviewer can check rather than believe them (OB-2, §9, still owns
promoting those two into the baseline as a new section).

- **OF-1 (2026-08-09, pdlc-consolidation-agent run; re-derived 2026-08-21).** Re-entry after a
  wave halt re-dispatches waves whose commits already landed — that mechanism fact is `M-WG-6`,
  which the shipped ledger has since partly superseded (OB-2). The **replay cost** is this REQ's
  new observation: the run's plan derives **16** waves (17 counting Phase PT's appended V-wave),
  and waves 1–3 hold **7** tasks, so re-entry after the wave-4 halt paid seven no-op dispatches.
  Re-entry after the *wave-2* halt replayed wave 1 only — a single task, `T00` — so the cost is
  not uniform per halt: it is the task count of every wave below the halted one, and it grows
  with plan depth. *Re-derive:* run `parsePlanTasks` + `parsePlanOwnership` + `computeWaves` from
  `pdlc/workflows/orchestrate-dev.js` over
  `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md` → 34 tasks, 16 waves,
  W1 = `[T00]`, W2 = `[T01..T05]`, W3 = `[T06]`.
- **OF-2 (2026-08-09, same run, wave 1).** A completed task may legitimately produce **no
  commit**: wave 1's only task finished with "nothing staged — no changes to commit", and stray
  agent-authored commits were observed in the same run. Commit presence is therefore not usable
  as completion evidence in either direction. *Re-derive:* the wave-1 task list above (one task)
  against that run's log; the nothing-to-commit path is reachable at HEAD for any wave whose
  owned paths are unchanged.
- **OF-3 (2026-08-09, same run, wave 4).** A halted wave's own work is uncommitted at the halt —
  `M-WG-4`, with `M-WG-12` on the commit loop's pathspec scoping. The consequence this REQ draws
  from it: the correct resume point is the earliest wave whose work is not yet committed, i.e.
  the failed wave itself, never the one after it.
- **C-1 — consumer-local state.** The record supporting automatic resume lives in consumer-local,
  untracked state, and at HEAD of the default branch that is already anchored rather than
  incidental: `.gitignore` carries a root-anchored ignore rule for the resume record alongside
  the one for `/.claude/workflows/`, with a comment explaining why the anchor matters for the
  checked-in fixture tree. Per-wave bookkeeping must not generate tracked-file commit churn on
  the feature branch; REQ-WVR-10 (§7) is the observable that fails if it does.
- **C-2 — fail open, never halt.** An unreadable, foreign, or out-of-range resume record
  degrades to a full run with an announced reason. No state of the record may make the
  pipeline refuse to run.
- **C-3 — no new runtime capabilities.** The determination and its bookkeeping operate
  within the workflow runtime's existing capability envelope (injected-seam IO, no new
  host dependencies); the contract's specifics are the TSPEC's to own (OB-1, §9).

## 5. Prerequisites

**Correction, 2026-08-13.** BL-01 and BL-03 are already resolved: `pdlc-consolidation-agent`
is merged to main, so the manual resume override and the interim auto-resume mechanism both
already exist at HEAD of main. BL-02's file also already exists on main
(`docs/_constraints/pdlc-wave-gate-baseline.md`, at `Version | 1.2 · 2026-08-20`) despite its
resolution form below still reading as a pending PR merge; it is citable now.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | Manual resume override (`implementation.startWave` config value, default 1, owner: repo operator via `.claude/pdlc.config.json`) exists at HEAD | `pdlc-consolidation-agent` PR merged | Must exist at HEAD before FSPEC authoring — REQ-WVR-04 specifies precedence over it |
| BL-02 | Wave-gate baseline measured-facts file (`docs/_constraints/pdlc-wave-gate-baseline.md`) available for citation | `pdlc-advisory-wave-gate` PR merged | Must exist at HEAD before FSPEC authoring — OF-1..3 promote into it (OB-2) |
| BL-03 | Interim auto-resume mechanism (marked INTERIM, 2026-08-09) present at HEAD | `pdlc-consolidation-agent` PR merged | Checked at FSPEC authoring: deliverable formalizes or replaces it, never duplicates alongside it |
| BL-04 | This feature branch is on the current default-branch base (SE G-01) | `git rebase`/merge of `origin/main` into `feat-pdlc-wave-resume` | Checked at FSPEC authoring: the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` must both be readable in the authoring tree, or R-4's "new code alongside" outcome is unavoidable |

## 6. User Stories

- **US-01.** As the operator of an unattended pdlc run, when Phase I halts at a wave gate
  and I re-invoke after addressing the cause, I want the run to resume at the wave that
  failed without my computing or setting anything, so that recovery costs one
  re-invocation instead of a replay of completed waves plus config arithmetic.
- **US-02.** As the operator, I want an explicitly set manual resume point to always win
  over the automatic one, and every resume to announce where it starts and why, so that
  I can force any starting point and audit any run's behaviour from its log.
- **US-03.** As the maintainer of the pipeline's integrity guarantees, I want the resume
  record to be unable to weaken verification — no new commit before the full suite passes
  over the whole tree — so that automatic resume adds no new trust surface.
- **US-04.** As the operator of the multi-feature queue, I want unattended queue
  iterations to recover from wave halts with the same zero-action resume, so that the
  no-halt direction of the loop does not depend on my attention.

## 7. Acceptance Criteria

### REQ-WVR-01 — automatic resume at the failed wave (P0, Phase 1)

**Who:** pipeline operator. **Given:** a Phase I run halted at a wave gate, the cause
since addressed, the same feature and an unchanged plan. **When:** the pipeline is
re-invoked with no resume-related configuration set. **Then:** implementation resumes at
the wave that failed (OF-3); each skipped wave is announced as skipped; the run log and
final report state the resume point and its provenance as automatic. *Source: US-01.*

### REQ-WVR-02 — fresh runs and foreign state are unaffected (P0, Phase 1)

**Who:** pipeline operator. **Given:** no prior halted Phase I for this feature, or a resume
record that fails any member of the closed catalogue below. **When:** the pipeline is invoked.
**Then:** every wave runs from the first; nothing about the record makes the invocation refuse to
run (C-2). The catalogue of causes is **complete as enumerated**, not open-ended — one row per
mechanism, five announced and one deliberately silent:

| # | Cause | Operator-visible outcome |
|---|---|---|
| IG-1 | the record's content cannot be read as a record (unparseable or foreign shape) | full run, announced with the reason |
| IG-2 | it records a different feature than the one being run | full run, announced with the reason |
| IG-3 | the PLAN's wave layout has changed since it was written | full run, announced with the reason |
| IG-4 | it records more waves complete than this plan has | full run, announced with the reason |
| IG-5 | it names a commit no longer reachable from the current branch tip | full run, announced with the reason |
| IG-6 | no record exists, or it is empty/cleared | full run, **no** announcement — an absent record is the normal fresh-run case, not an anomaly |

The set is closed: adding a seventh cause, or deleting one, is a deliberate change to this AC.
IG-4 and IG-5 are listed separately because they are independent guards with different failure
modes (TE G-02); fusing them would let the ancestry guard be deleted without the enumeration
changing. The IG labels name **causes, not precedence**: this table's row order carries no claim
about the order in which a run tests for them, which is FSPEC's to state (§3.2 there evaluates
ancestry before over-count). PROPERTIES owes a **set-equality** check over IG-1..6 rather than a containment check,
so a deleted cause fails a test instead of passing one. *Source: US-01, US-02.*

### REQ-WVR-03 — verification independence (P0, Phase 1)

**Who:** pipeline maintainer. **Given:** any resume-record content whatsoever, including
corrupt or adversarial bytes. **When:** a resumed run reaches its first executed wave.
**Then:** the full test suite verifies the whole tree before any new commit lands, with
the same gate outcome semantics as an unresumed run; a record that cannot be read
degrades to a full run with an announced reason (C-2). *Source: US-03.*

### REQ-WVR-04 — operator override precedence (P0, Phase 1)

**Who:** pipeline operator. **Given:** both an explicit manual resume point (BL-01) and
an automatic resume determination available for the same invocation. **When:** the run
starts. **Then:** the manual point wins, the run announces provenance as operator-set,
and a documented, announced escape hatch exists to force a full run despite a valid
record.

**Boundary — the manual point set to its default (TE F-01).** A manual resume point whose value
is the plan's first wave is **defined as not an explicit setting**: it is indistinguishable from
having set nothing, the automatic determination is consulted, and the run announces provenance as
automatic. Setting the manual pointer is therefore a *resume-point selector only* and can never
mean "ignore the record". The force-a-full-run intent is served by exactly one mechanism, the
record-removal hatch decided in OQ-1 (§9), and by no configuration value. A manual point past the
last wave of the plan is likewise not a way to skip Phase I: it is treated as a request for a full
run, announced as such. *Source: US-02.*

### REQ-WVR-05 — resume-state lifecycle: retained, never able to skip unverified work (P1, Phase 1)

**Who:** the pipeline operator. **Given:** a resume record exists, whether or not Phase I has since
completed all its waves. **When:** any later run reads it. **Then:** the record may survive the
completed phase, but it can never cause a run to skip work it has not verified — it is usable only
while it validates against the feature key, the PLAN hash, and commit ancestry from the current
HEAD, and a record failing any of those checks is treated exactly as an absent record — a full
run — with the reason announced (REQ-WVR-02, IG-1..5; an absent record itself is IG-6 and is
silent). Staleness is therefore a property the reader proves, not a property the
writer promises. *Source: US-01.*

**Superseded — decision history, 2026-08-13 (SE G-04).** The position considered and *rejected*
on that date was that WVR-05 should require self-*clearing*: after Phase I completed, no resume
state would survive. It was rejected because the shipped ledger deliberately **persists** past
Phase I (the retention comment above `allWavesRecorded`'s `⏭` `recordPhase` call in
`orchestrate-dev.js`, with the complete-record skip banner "Skipping Phase I (wave ledger") so
that a later halt in CR/DOD/PUB re-invokes without re-dispatching any wave, and nothing in the
codebase ever cleared it — its staleness story was self-*invalidating*, not self-clearing. Under
BL-03's "formalize and replace, never duplicate" rule that position would have forced a
regression. Nothing in this block is operative; WVR-05 above is the requirement.

**Decision: retention with invalidation; the requirement moves, not the code.** WVR-05 is restated
above. The shipped ledger's persistence past Phase I is deliberate and load-bearing — a halt in CR,
DOD or PUB must not re-dispatch a green wave — so demanding true self-clearing would have required
deleting a behaviour that already earns its keep, for a guarantee that invalidation supplies more
cheaply. What the shipped code owes under the restated requirement is the invalidation half, not a
clearing step: feature key, PLAN hash and ancestry checks must be total and must fail closed, which
is exactly what REQ-WVR-03's verification independence already demands. Note the honest cost: a
stale record is now permitted to exist indefinitely, so every skip decision rests on those three
checks being correct — PROPERTIES should treat them as the feature's highest-value oracles.

### REQ-WVR-06 — completion evidence is never commit presence (P1, Phase 1)

**Who:** pipeline maintainer. **Given:** a plan containing tasks that complete without
producing a commit (OF-2). **When:** the resume point is determined. **Then:** completion is
never inferred from the presence, absence, or message of a task's commit; positively, the wave
containing the no-commit task is treated as complete, and a re-invocation of the same plan
announces the **next** wave as its resume point (that announcement is the oracle — it fails if
the determination regresses to commit archaeology).

**Carve-out — ancestry corroboration is permitted and is not archaeology (SE F-04).** Testing
whether the *specific commit a record names* is still reachable from the current branch tip is
falsification of the record, not derivation of completion from commit presence. It is expressly
allowed by this AC and required by IG-5 of REQ-WVR-02; §3's rejection of commit-history
archaeology is likewise limited to deriving completion from task commits. *Source: US-03.*

### REQ-WVR-07 — unattended queue parity (P2, Phase 2)

**Who:** queue operator. **Given:** a queue-driven iteration whose feature halted at a
wave gate in a previous iteration. **When:** the queue re-attempts the feature after the
halt is cleared. **Then:** the delegated run announces **the same resume point and the same
provenance** in the queue run's own report as a direct invocation of the same feature would, with
no queue-specific configuration present anywhere. The queue-specific observable is the one that
can fail while REQ-WVR-01..05 all pass: the record must resolve against the same working
directory on both paths, so a resume point that differs between a direct and a delegated run of
the same feature and plan fails this AC. *Source: US-04.*


### REQ-WVR-08 — all waves recorded complete: Phase I is skipped in full (P1, Phase 1)

**Who:** pipeline operator. **Given:** a valid record for this feature and this unchanged plan
recording **every** wave of the plan complete — the state a run reaches when Phase I finished and
a later phase (CR, DOD, PUB) halted. **When:** the pipeline is re-invoked. **Then:** Phase I is
skipped in full; the skip is announced as its own run-log message, naming the reason and the
force-a-full-run hatch (OQ-1, §9); and the run report's **Phase I row** carries a skip status and
a reason naming the record, distinct from the status an executed Phase I carries (TE G-05 — this
is one row with a distinguishing status, not a second row; the hatch is owed on the run-log
message only, not on the report row). **How REQ-WVR-03 is discharged here:** no wave executes, so no gate
runs and **Phase I produces no new commit** — the guarantee "no new commit lands before the full
suite has verified the whole tree" is satisfied because this phase lands none, not because a
verification was skipped. The tree's most recent whole-tree verification is the one performed by
the last wave of the run that wrote the record; any later phase that wants to commit runs its own
gates. An implementation that commits anything in Phase I under this outcome violates REQ-WVR-03.

**The resume-outcome catalogue is closed at three** — (a) full run from wave 1, (b) resume at a
wave in the middle, (c) skip Phase I entirely — and every invocation resolves to exactly one of
them and announces which. PROPERTIES owes a set-equality check over the three, so a deleted
outcome fails a test. *Source: US-01.*

### REQ-WVR-09 — a wave that was verified but not committed is never recorded complete (P0, Phase 1)

**Who:** pipeline maintainer. **Given:** a Phase I run in which a wave's tasks completed and the
wave's gate passed, but the run committed nothing for it (for example, a run with no git
transport, which verifies but does not commit). **When:** the pipeline is re-invoked for the same
feature and unchanged plan. **Then:** implementation starts at **that same wave**, not after it,
and announces it as not previously completed. Completion, for resume purposes, means *committed*,
never merely *verified*: work that exists nowhere but the working tree is never skipped. This is
the property R-2 (§8) names as the only unrecoverable failure mode of this feature, stated as a
requirement so an acceptance test has something to trace to. *Source: US-03.*

### REQ-WVR-10 — the resume record never becomes tracked content (P1, Phase 1)

**Who:** pipeline maintainer. **Given:** any run of any length, halted or complete, that writes
the resume record. **When:** the run's commits are inspected afterwards. **Then:** no commit
produced by the run contains the resume record, and the record never appears as a tracked file in
the repository — its exclusion is anchored by an ignore rule (C-1), not by nobody happening to
stage it. This is the observable C-1 previously lacked: it fails if per-wave bookkeeping ever
produces tracked-file churn on the feature branch. *Source: US-01, US-03.*

## 8. Risks

- **R-1 — stale record after history rewrite.** An operator rebase/reset — or Phase DOD's own
  rebase onto the default branch — can invalidate what the record believes is committed. The
  first-line mitigation is ancestry corroboration: a record naming a commit no longer reachable
  from the current branch tip is ignored with an announced reason (REQ-WVR-02, IG-5), which this
  REQ **requires** rather than merely permits. Behind it stand REQ-WVR-03 (nothing commits before
  full-tree verification) and IG-3 (a changed plan invalidates the record). Residual worst case is
  a full run or a gate halt, as today — the risk is therefore Low, not the load-bearing one it
  read as before.
- **R-2 — resume-skip strands uncommitted work.** If a wave were recorded complete while
  its work is uncommitted, a resumed run would skip work that exists nowhere but the
  tree. **REQ-WVR-09** is the requirement that forbids it — completion means committed, never
  merely verified — and REQ-WVR-01/OF-3's "resume at the earliest uncommitted wave" is its
  companion. The acceptance test traces to REQ-WVR-09 rather than being deferred to the FSPEC.
- **R-3 — provenance confusion.** Two resume sources (manual, automatic) can leave an
  operator unsure why a run started where it did. Mitigated by REQ-WVR-01/-04's
  mandatory provenance announcements.
- **R-4 — interim/final divergence.** The interim HEAD mechanism (BL-03) and this
  feature's reviewed contract could drift apart if the feature lands as "new code
  alongside". BL-03's gating logic (formalize or replace, never duplicate) is the
  control; se-review should treat duplication as a blocking finding.

## 9. Obligations / Open Questions

- **OB-1 (owner: TSPEC).** The resume record's location, format, matching rules, and the
  determination procedure are implementation contracts owned by the TSPEC — this REQ
  deliberately states only their observable outcomes (REQ-WVR-01..06).
  **Answered 2026-08-13.** The mechanism this REQ formalizes already ships, merged to
  main, all in `pdlc/workflows/orchestrate-dev.js` and cited by **exported symbol name**, which
  is grep-stable where a line anchor is not (SE G-02, TE G-04): `WAVE_STATE_PATH`
  (`.claude/pdlc-wave-state.json`, consumer-local and untracked, mirroring the
  drift-state precedent); `computePlanHash` (an FNV-1a "same plan?" fingerprint
  over wave order, task ids, and owned paths — not an integrity hash); `parseWaveLedger`
  (total, never throws, with three outcomes: silent no-record including `{}`
  or absent, ignored-with-reason, or well-formed — fail-open); `formatWaveLedger`
  (`{version: 1, feature, planHash, lastGreenWave, head?}`); read/decide (`explicitPointer`
  — a manual `implementation.startWave > 1` outranks the ledger, and is computed *before* the
  out-of-range clamp so a past-the-end pointer still suppresses the ledger; the
  ledger is ignored with an announced reason on feature mismatch, planHash mismatch,
  out-of-range, or failed `headCorroborated` via `git merge-base --is-ancestor`
  (fail-open when no transport), otherwise resume at `lastGreenWave + 1`, and
  `allWavesRecorded` skips Phase I with a `⏭` row); and the `writeWaveLedger` call, nested
  inside the wave loop's git-transport branch, best-effort, once
  per wave, after the script's own pathspec-scoped commits, with write failure a notice
  never a halt. Skipping skips dispatch only — every executed wave's gate still runs the
  full suite over the whole tree, so REQ-WVR-03 holds structurally. Tests exist in
  `pdlc/workflows/__tests__/waveExecution.test.js` (the wave-ledger describe block). TSPEC's job is therefore
  to **ratify or revise this shipped contract, not invent one**. Reconciliation findings
  for TSPEC to carry forward: git per-task commits remain the only source of truth for
  *work*, and the ledger is only a dispatch-skipping optimization — worst case of a bad
  record is a full run, satisfying G-2; the POSTMORTEM lifecycle does **not** compete,
  because wave halts write no POSTMORTEM (baseline M-WG-5), so there is no `RESOLVED:`
  gate to coordinate with, and TSPEC should state this rather than assume it; the queue
  row lifecycle is orthogonal (a human resets `halted → pending`, the ledger governs
  where the re-run starts), so REQ-WVR-07 queue parity is free and TSPEC owes only a
  test; and a Claude-created worktree has no ledger, because `.worktreeinclude` lists
  only `.claude/workflows/`, so it fails open to a full run — consistent with the
  D-DIST-07 deferral, but TSPEC should say so explicitly rather than inherit it silently.
  One decision remains genuinely left to TSPEC: the `{}` "cleared" shape that `parseWaveLedger`
  reserves but nothing ever writes — wire it or drop it. (Retention-vs-clearing was
  decided in v1.2 under REQ-WVR-05.)
- **OB-2 (owner: this feature's se-author, at FSPEC/TSPEC authoring).** Promote OF-1..3
  into `docs/_constraints/pdlc-wave-gate-baseline.md` as measured `M-*` facts once BL-02
  resolves, and cite them by id from downstream artifacts.
  **Answered 2026-08-13; recipe restated v1.4 (SE/TE G-03).** `docs/_constraints/pdlc-wave-gate-baseline.md`
  exists at HEAD, at `Version | 1.2 · 2026-08-20`, with sections through §4 occupied and ids
  through `M-WG-14`. Its own control rule is that a successor feature's facts go in a **new
  section, never interleaved**, with any content change requiring a `Version` bump, and that a
  consumer cites the file *at its `Version`*. Promotion therefore means: re-read the file at the
  version current when promotion runs, append the **next unoccupied section** (`## 5.` if the file
  is still at 1.2), ids `M-WVR-1..2`, each with a Measured-by command, and bump to the **next**
  version above the one found (1.3 from 1.2) — never to a fixed number written here, which would
  be a downgrade if the file has moved again. **Partly discharged, v1.3:** §4's duplicated facts
  cite `M-WG-4`, `M-WG-6` and `M-WG-12` instead of restating them, so what this obligation still
  owes the baseline is only the two genuinely new observations — the replay cost (7 no-op
  dispatches, waves 1–3) and OF-2 (a completed task may legitimately produce no commit; stray
  agent commits were also observed). Also carry: **BL-02's stated gate is stricter than reality**
  — the baseline is committed on main and citable now, regardless of queue row 19. And **M-WG-6
  needs a re-check, not an assumed correction**: it was found false at HEAD against 1.0 and read
  unchanged at 1.2, so the promoted section must state the version it was checked against and
  record that the row was reviewed and left, not missed. One ownership wrinkle: after promotion,
  §4 should cite by `M-WVR-*` id, a pm-author edit even though OB-2's owner is se-author.
- **OB-3 (owner: pm-author, at FSPEC authoring).** Confirm the interaction ordering with
  the advisory wave-gate remediation seam (`pdlc-advisory-wave-gate`): proposed default —
  remediation acts *within* the halted run, automatic resume acts at the *next*
  invocation, so the two compose without coordination. Carried as open until that REQ's
  FSPEC exists.
  **Answered 2026-08-13.** They compose without coordination; the structural reason: the
  ledger is written only downstream of a green gate, and A6 can only end in "green gate"
  or "exact pre-A6 tree plus the same halt." If A6 resolves a wave, control reaches the
  normal commit step and then the ledger write, so resume sees an ordinary green wave; if
  A6 fails, the pre-A6 tree is restored and the identical halt stands, so the ledger
  still reads `lastGreenWave = N-1` and the next invocation resumes at wave N — exactly
  REQ-WVR-01's contract. The invariants are already ACs in the A6 REQ (A6 never commits,
  never edits implementation config), and `.claude/pdlc-wave-state.json` is in no wave's
  owned-path set, so A6's envelope can never authorize touching it — worth one
  PROPERTIES assertion, no REQ change. One residual interaction is recorded here as an
  FSPEC note, not coordination: `advisory.waveBudgetPerRun` is per-*run*, so auto-resume
  makes runs shorter and more numerous and the budget effectively refreshes per
  re-invocation; it is bounded in practice because clearing a halt still needs a human,
  but the A6 REQ's R-3 "compounding drift" bound is weaker under resume than it assumes.
  Cross-reference defect also recorded here: A6's D-AWG-03 defers re-invocation
  economics to `pdlc-engineering-loop` (queue row 6), but that is this feature's (queue
  row 20) deliverable and the interim already ships it — flagged; the repoint is the
  operator's call.
- **OQ-1.** Should the escape hatch of REQ-WVR-04 be a config value, a record-removal
  action, or both? Product requirement is only that one exists and is announced;
  form is the TSPEC's choice unless the operator states a preference at FSPEC review.
  **Decided 2026-08-13 — deletion only.** What exists at HEAD: exactly one hatch, the
  record-removal action, announced in both banners (grep `orchestrate-dev.js` for `to force a`
  — two hits, one under the complete-record skip, one under the mid-plan resume; "to force a full
  run" matches only the second, the skip banner wrapping it across a line break). No config value can force a full run today — `implementation.startWave`
  defaults to 1, which *defers to* the ledger, and the parser clamps invalid values back
  to 1, so there is no sentinel meaning "ignore ledger, start at wave 1" and
  `startWave: 1` is indistinguishable from the default; any `startWave > 1` bypasses the
  ledger but gives a *partial* run. Evidence favours keeping record-removal: it matches
  the record's design as an untracked consumer-local file whose absence parses as a
  silent fresh run, adds zero config surface, and satisfies the product requirement
  verbatim. What deletion cannot express is a *declarative* full-run request, which is
  awkward in unattended or worktree contexts. The operator's question: is deletion
  acceptable as the sole documented force-full-run hatch, or is a config knob wanted —
  and if so, what shape, given `startWave: 1` cannot express it?

  **Decision: the record-removal action is the only hatch; no config value is added.** It already
  exists, it is already announced in the halt banners, and it is the one hatch that cannot be
  silently wrong: an absent record has exactly one meaning, whereas a `forceFullRun`-style knob left
  set to true in a consumer's `.claude/pdlc.config.json` would defeat resume permanently and
  invisibly. The named cost is accepted: deletion is imperative rather than declarative and is
  awkward in unattended or worktree contexts. If that cost is ever observed rather than predicted —
  a queue run that needed a full re-run and could not express it — a declarative knob becomes a
  follow-up, not a v1 requirement. FSPEC must state the hatch and its wording; `startWave` remains a
  resume-point selector, never a full-run switch.

## 10. Traceability

| User story | Requirements |
|---|---|
| US-01 | REQ-WVR-01, REQ-WVR-02, REQ-WVR-05, REQ-WVR-08, REQ-WVR-10 |
| US-02 | REQ-WVR-02, REQ-WVR-04 |
| US-03 | REQ-WVR-03, REQ-WVR-06, REQ-WVR-09, REQ-WVR-10 |
| US-04 | REQ-WVR-07 |

Registered in `docs/_queue/QUEUE.md` as Order 20; project matrix row in
`docs/requirements/traceability-matrix.md`. Readiness over the whole §5 table (TE H-02): BL-01,
BL-02, BL-03 resolved at HEAD; BL-04 open, discharged at FSPEC authoring and
**not** a pickup gate — so `ready: true` is accurate today.

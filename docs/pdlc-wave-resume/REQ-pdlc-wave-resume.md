---
feature: pdlc-wave-resume
ready: false
depends-on: [pdlc-consolidation-agent, pdlc-advisory-wave-gate]
---

# REQ — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | pm-author (operator-directed session, 2026-08-09) |
| Version | 1.2 |
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

**Amendment, 2026-08-13 (v1.2).** The two decisions this REQ was waiting on are recorded
(operator delegated adjudication). REQ-WVR-05 is restated as **retention with invalidation**,
aligning the requirement with the shipped interim ledger; OQ-1 resolves to **record deletion as the
only force-full-run hatch**, with no new config knob. No question in this REQ is open.

**Amendment, 2026-08-13.** OB-1, OB-2, and OB-3 (§9) are answered against the shipped interim
mechanism, which reconciliation confirms is already merged to main. OQ-1 (§9) remains open pending
an operator decision on the escape-hatch form. A previously unrecorded conflict between REQ-WVR-05's
self-clearing lifecycle and the shipped ledger's deliberate persistence is flagged open under
REQ-WVR-05 (§7), also pending an operator decision. §1 and §5 are corrected for staleness: the
interim mechanism and BL-01/BL-03 are resolved at HEAD of main, not pending on a feature branch.

## 1. Problem / Context

Phase I (Implementation) runs a plan's tasks in topologically ordered, ownership-disjoint
waves in one shared tree. Each wave ends with a script-owned gate; a red gate halts the
pipeline with the halted wave's work deliberately uncommitted. This halt-and-refuse
contract is correct and is not in question here.

What the halt costs is the *re-entry*. A re-invocation of the pipeline re-enters Phase I
at wave 1 and re-dispatches implementation agents over every wave whose work is already
committed, each of which reads the plan, finds its task done, and reports a no-op.
Observed on the pdlc-consolidation-agent run of 2026-08-09 (OF-1, §4): a 15-wave plan
halted at wave 2 and again at wave 4, and each re-invocation paid seven no-op agent
dispatches (waves 1–3) before reaching the point of interest. Multi-halt runs pay this
replay tax once per halt, and it grows with the plan.

A manual resume pointer now exists (`implementation.startWave`, an operator-set
configuration value — BL-01, §5). It works, but it demands operator arithmetic with a
sharp edge: the correct resume point is the wave that *failed* — whose work is
uncommitted — not the wave after it, and an operator who forgets to clear the pointer
causes a later, unrelated run to silently skip waves. The pointer converts the replay tax
into an attention tax on exactly the unattended-operation path the pipeline exists to
serve.

**Correction, 2026-08-13.** The sharp edge above is overstated in one direction: an
out-of-plan-range `startWave` is already clamped to 1 with an announced notice
(`orchestrate-dev.js:12171-12177`), so that failure mode is mitigated at HEAD. An
in-range stale pointer still silently skips waves, so the claim is accurate in spirit
but not, as originally written, without qualification.

This feature makes the resume point self-determining: a re-invocation after a Phase I
halt resumes at the correct wave with no operator action, while an explicit operator
override still wins and correctness never depends on the resume record being right.

At authoring time an **interim** mechanism for this already exists at HEAD of the
pdlc-consolidation-agent branch (added 2026-08-09 to unblock the live run, and marked
INTERIM in its comments). Per the activation-check discipline, this feature's deliverable
is therefore the *formalized, reviewed contract* — behavioural specification, property
tests, and operator-facing documentation — that supersedes or replaces the interim
mechanism, not necessarily new wiring.

**Correction, 2026-08-13.** The paragraph above is stale: the interim mechanism is
**already merged to main** (it landed with `pdlc-consolidation-agent`), not sitting at
HEAD of a feature branch. BL-01 and BL-03 (§5) are correspondingly already resolved.

**Operational finding, 2026-08-13 — the interim ledger is merged but is not, in practice,
resuming anything.** Operator observation is that a re-invocation still re-enters at wave 1, and
the tree corroborates it: **no `.claude/pdlc-wave-state.json` exists anywhere in this repo,
including its worktrees**, despite wave-mode Phase I runs since the ledger merged on 2026-08-10
(`87d9c6ad`). Four shipped preconditions explain it, and each fails routinely — this list is the
concrete gap this feature closes, and it belongs in FSPEC as such:

1. The write sits inside the `if (scriptGate)` branch (`orchestrate-dev.js:12345`-`:12429`), and
   `scriptGate` requires both `implementation.testCommand` and a `_runCommand` seam (`:12128`), so
   a self-report-gate run records nothing, ever.
2. The write happens only after a wave goes green **and** its work is committed, so a run that
   halts at wave N records nothing for wave N — and one that halts at wave 1 records nothing at
   all, which is precisely the halt this feature is meant to resume from (OF-1).
3. The record is ignored when the PLAN's wave layout changes (`planHash`), so any PLAN edit
   between invocations — routine when remediating a halt — sends the next run back to wave 1.
4. The record is ignored when the recorded commit is not an ancestor of HEAD, and Phase DOD step 0
   rebases `feat-{feature}` onto the default branch, rewriting exactly those commits.

Two consequences for this REQ. **REQ-WVR-01's contract is not satisfied by the interim** — BL-03's
"formalize and replace, never duplicate" rule still applies, but what is being formalized is a
mechanism that has never once fired here, so the FSPEC's oracle must be an observed resume, not
the presence of the code path. And **the REQ-WVR-05 conflict below is less acute than it appears**:
a record that is never written cannot fail to be cleared.

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
- **G-4 — self-clearing lifecycle.** A completed Phase I leaves no resume state behind
  for a later fresh run to inherit; a changed plan or a different feature invalidates a
  leftover record rather than being warped by it.
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

Observed facts, each dated and reproducible from the cited run. On merge of the
`pdlc-advisory-wave-gate` REQ these should be promoted into
`docs/_constraints/pdlc-wave-gate-baseline.md` and cited from there by id (Obligation
OB-2, §9).

- **OF-1 (2026-08-09, pdlc-consolidation-agent run).** A 15-wave plan halted at wave 2
  and again at wave 4; each re-invocation re-entered wave 1 and re-dispatched seven
  implementation agents (waves 1–3) that individually concluded no-op. Replay cost
  recurs per halt and scales with plan depth.
- **OF-2 (2026-08-09, same run, wave 1).** A completed task may legitimately produce
  **no commit**: wave 1's only task finished with "nothing staged — no changes to
  commit". Commit presence is therefore not usable as completion evidence, in either
  direction (stray agent-authored commits were also observed in the same run).
- **OF-3 (2026-08-09, same run, wave 4).** A halted wave's own work is uncommitted at
  the halt — the gate refuses to commit red work. The correct resume point is therefore
  the earliest wave whose work is not yet committed, i.e. the failed wave itself, never
  the one after it.
- **C-1 — consumer-local state.** Whatever record supports automatic resume lives in
  consumer-local, untracked state (the drift-state record's precedent): per-wave
  bookkeeping must not generate tracked-file commit churn on the feature branch.
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
(`docs/_constraints/pdlc-wave-gate-baseline.md`, v1.0, 2026-08-09) despite its resolution
form below still reading as a pending PR merge; it is citable now.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | Manual resume override (`implementation.startWave` config value, default 1, owner: repo operator via `.claude/pdlc.config.json`) exists at HEAD | `pdlc-consolidation-agent` PR merged | Must exist at HEAD before FSPEC authoring — REQ-WVR-04 specifies precedence over it |
| BL-02 | Wave-gate baseline measured-facts file (`docs/_constraints/pdlc-wave-gate-baseline.md`) available for citation | `pdlc-advisory-wave-gate` PR merged | Must exist at HEAD before FSPEC authoring — OF-1..3 promote into it (OB-2) |
| BL-03 | Interim auto-resume mechanism (marked INTERIM, 2026-08-09) present at HEAD | `pdlc-consolidation-agent` PR merged | Checked at FSPEC authoring: deliverable formalizes or replaces it, never duplicates alongside it |

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

**Who:** pipeline operator. **Given:** no prior halted Phase I for this feature — or a
resume record left by a different feature, a since-changed plan, or an out-of-range
state. **When:** the pipeline is invoked. **Then:** every wave runs from the first; an
ignored record is announced with the reason it was ignored; nothing about the record
makes the invocation refuse to run (C-2). *Source: US-01, US-02.*

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
record. *Source: US-02.*

### REQ-WVR-05 — resume-state lifecycle: retained, never able to skip unverified work (P1, Phase 1)

**Who:** the pipeline operator. **Given:** a resume record exists, whether or not Phase I has since
completed all its waves. **When:** any later run reads it. **Then:** the record may survive the
completed phase, but it can never cause a run to skip work it has not verified — it is usable only
while it validates against the feature key, the PLAN hash, and commit ancestry from the current
HEAD, and a record failing any of those checks is treated exactly as an absent record: full run,
announced reason (C-2). Staleness is therefore a property the reader proves, not a property the
writer promises. *Source: US-01.*

**Decided 2026-08-13 — retention with invalidation.** The shipped interim ledger conflicts with this requirement
as written and is not being changed here. WVR-05 requires self-*clearing*: after Phase I
completes, no resume state survives. The shipped ledger deliberately **persists** after
Phase I completes (`orchestrate-dev.js:12429` ff.; complete-record skip at
`:12252-12267`; test at `waveExecution.test.js:1694`) precisely so a later halt in
CR/DOD/PUB re-invokes without re-dispatching any wave, and nothing in the codebase ever
clears it — its staleness story is self-*invalidating* (feature/planHash/head match), not
self-clearing. Because BL-03's gating logic (§5) is "formalize and replace, never
duplicate," this REQ as written forces either a regression (make the shipped ledger
clear itself) or a rewrite of this requirement. The operator has two options: reword
WVR-05 to retention-with-invalidation, matching shipped behaviour; or keep WVR-05 as
written and demand true clearing, changing shipped behaviour. The first is chosen
below; WVR-05 above is already restated accordingly.

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
producing a commit (OF-2). **When:** the resume point is determined. **Then:** the
determination does not consult commit presence or commit messages; a no-op-completing
task never causes its wave to be treated as incomplete. *Source: US-03.*

### REQ-WVR-07 — unattended queue parity (P2, Phase 2)

**Who:** queue operator. **Given:** a queue-driven iteration whose feature halted at a
wave gate in a previous iteration. **When:** the queue re-attempts the feature after the
halt is cleared. **Then:** the delegated run resumes exactly as a direct invocation
would under REQ-WVR-01..05, with no queue-specific configuration. *Source: US-04.*

## 8. Risks

- **R-1 — stale record after history rewrite.** An operator rebase/reset can invalidate
  what the record believes is committed. Mitigated structurally by REQ-WVR-03 (nothing
  commits before full-tree verification) and REQ-WVR-02 (changed plan invalidates the
  record); residual worst case is a gate halt, as today.
- **R-2 — resume-skip strands uncommitted work.** If a wave were recorded complete while
  its work is uncommitted, a resumed run would skip work that exists nowhere but the
  tree. REQ-WVR-01/OF-3's "resume at the earliest uncommitted wave" is the requirement
  that forbids this; the FSPEC must carry an explicit acceptance test for it.
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
  main, all in `pdlc/workflows/orchestrate-dev.js`: `WAVE_STATE_PATH =
  ".claude/pdlc-wave-state.json"` (`:9976`, consumer-local and untracked, mirroring the
  drift-state precedent); `computePlanHash` (`:9992`, an FNV-1a "same plan?" fingerprint
  over wave order, task ids, and owned paths — not an integrity hash); `parseWaveLedger`
  (`:10029`, total, never throws, with three outcomes: silent no-record including `{}`
  or absent, ignored-with-reason, or well-formed — fail-open); `formatWaveLedger`
  (`:10087`, `{version: 1, feature, planHash, lastGreenWave, head?}`); read/decide
  (`:12191-12280`, a manual `implementation.startWave > 1` outranks the ledger, the
  ledger is ignored with an announced reason on feature mismatch, planHash mismatch,
  out-of-range, or failed head corroboration via `git merge-base --is-ancestor`
  (fail-open when no transport), otherwise resume at `lastGreenWave + 1`, and a complete
  record skips Phase I with a `⏭` row); and write (`:12284`, `:12429`, best-effort, once
  per wave, after the script's own pathspec-scoped commits, with write failure a notice
  never a halt). Skipping skips dispatch only — every executed wave's gate still runs the
  full suite over the whole tree, so REQ-WVR-03 holds structurally. Tests exist at
  `pdlc/workflows/__tests__/waveExecution.test.js:1573` onward. TSPEC's job is therefore
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
  Two decisions remain genuinely left to TSPEC: retention-vs-clearing (see the
  REQ-WVR-05 open note in §7) and the `{}` "cleared" shape that `parseWaveLedger`
  reserves but nothing ever writes — wire it or drop it.
- **OB-2 (owner: this feature's se-author, at FSPEC/TSPEC authoring).** Promote OF-1..3
  into `docs/_constraints/pdlc-wave-gate-baseline.md` as measured `M-*` facts once BL-02
  resolves, and cite them by id from downstream artifacts.
  **Answered 2026-08-13.** Promotion mechanics: `docs/_constraints/pdlc-wave-gate-baseline.md`
  exists at HEAD (v1.0, 2026-08-09), and its own control rule is that a successor
  feature's facts go in a **new section, never interleaved**, with any content change
  requiring a `Version` bump — so promotion means adding a new §3 cited by this REQ, ids
  `M-WVR-1..3` mapping OF-1..3, each with a Measured-by command, bumping the baseline to
  1.1, and re-verifying at a fresh default-branch commit. Avoid restating: OF-3
  duplicates M-WG-4 and OF-1's re-entry half duplicates M-WG-6, so cite those ids instead
  of re-deriving them; the genuinely new facts to measure are the replay cost (7 no-op
  dispatches, waves 1–3) and OF-2 (a completed task may legitimately produce no commit;
  stray agent commits were also observed). Two corrections to carry into that promotion:
  **BL-02's stated gate is stricter than reality** — the baseline file is already
  committed on main and citable now, so OB-2 can execute at FSPEC-authoring time
  regardless of queue row 19; and **M-WG-6 is now false at HEAD** (it says a
  re-invocation re-enters at wave 1, which the shipped ledger contradicts), which the
  promoted section and a fresh check of M-WG-6 must record. One ownership wrinkle: after
  promotion, §4 should cite by `M-WVR-*` id, which is a pm-author edit even though OB-2's
  own owner is se-author.
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
  record-removal action, announced in both banners ("Delete
  `.claude/pdlc-wave-state.json` to force a full run", `orchestrate-dev.js:12265` and
  `:12276`). No config value can force a full run today — `implementation.startWave`
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
| US-01 | REQ-WVR-01, REQ-WVR-02, REQ-WVR-05 |
| US-02 | REQ-WVR-02, REQ-WVR-04 |
| US-03 | REQ-WVR-03, REQ-WVR-06 |
| US-04 | REQ-WVR-07 |

Registered in `docs/_queue/QUEUE.md` as Order 20 (`ready: false` until prerequisites
BL-01..03 resolve); project matrix row in `docs/requirements/traceability-matrix.md`.

---
feature: pdlc-queue-autoresolve
ready: true
depends-on: pdlc-stats
---

# REQ pdlc-queue-autoresolve

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §6 "Unattended halt resolution — `queue.autoResolve`" |
| Downstream | FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-queue-autoresolve/LEARNINGS-pdlc-queue-autoresolve.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-30 |

## 1. Problem / Context

A POSTMORTEM halt is terminal for the queue today. `pdlc/OPERATIONS.md`'s POSTMORTEM lifecycle
section records the invariant plainly: the review loop that exhausts its rounds and writes a
POSTMORTEM halts the phase, and the phase refuses to run again until the file carries a
`RESOLVED: yes` line outside any fenced block — a line the workflow scripts themselves never
write. Clearing a halt is a judgment call an operator or agent makes by hand: read the
POSTMORTEM's `## Recommendation`, verify the named finding is addressed on the branch, then
commit the `RESOLVED: yes` flip naming the addressed finding as evidence. On the queue side,
`docs/_queue/QUEUE.md`'s status lifecycle (`pending → in-progress → awaiting-merge → done`, with
`halted` and `blocked` as terminal-for-the-driver states) means a `halted` row sits until a human
returns to it — the driver's `selectNextPending` only ever picks `pending` entries, and a `halted`
row is not one of them. `pdlc queue --loop` therefore cannot be genuinely unattended across a
POSTMORTEM class that recurs mechanically: review-cap non-convergence (a document exhausts
`MAX_REVIEW_ROUNDS` without an approving verdict) and mechanical-precondition halts (a phase gate
rejects a structurally incomplete artifact, e.g. Phase P's unparseable PLAN table or ownership
mismatch) are both classes where the fix is often a bounded, checkable remediation rather than a
judgment call requiring a human read of the artifact.

The design's key move is separating *who produced the halt* from *who is permitted to clear it*.
Today those are trivially the same non-actor: nothing in the pipeline writes `RESOLVED: yes`, so
the loop never re-picks a halted row by construction. That is a safety property of *the review
loop*, not a statement that no in-engine actor may ever clear a halt — it only requires that the
actor recording the halt is never the same actor certifying it resolved. This REQ specifies a
bounded, config-gated remediation cycle inside the queue driver that respects that separation: one
dispatch classifies and fixes, a **separate** dispatch verifies and is the only writer of
`RESOLVED: yes`, and the cycle is bounded by attempt budgets so exhaustion always falls back to
today's human-backstop behavior rather than looping.

## 2. Goals

**G-1 (bounded remediation cycle on a halted report, config-gated, default off).** When the queue
driver observes `report.outcome === "halted"` for a feature it just ran, and after it records the
`halted` row per today's behavior, it runs a bounded remediation cycle **only if**
`queue.autoResolve.enabled` is `true`: classify the halt's POSTMORTEM, and if the halt class is
automatable (G-2), dispatch a scoped remediation, then a separate verification, then re-queue on
success. Every step of the cycle happens before the driver's pass ends; it is not a new standing
background process.

**G-2 (halt classification: automatable vs. human-only, fail-closed by default).** The
remediation cycle only proceeds past classification for two POSTMORTEM classes: review-cap
non-convergence (a phase's review loop exhausted `MAX_REVIEW_ROUNDS` without an approving verdict)
and mechanical-precondition halts (a phase gate's structural check — parse, ownership manifest,
completeness probe — rejected the artifact). Every other class stays human-only, unchanged from
today's behavior: erratum R4 halts (`erratumPostmortemHalt`), guard-fired merges (the
self-modification guard path), any `MERGE ESCALATION:` condition, a POSTMORTEM whose
`## Recommendation` itself proposes a document split, and a POSTMORTEM that cannot be parsed at
all. A halt that does not classify cleanly as automatable is treated as human-only — classification
fails closed, never open.

**G-3 (remediation is scoped to the Recommendation's named findings only).** The remediation
dispatch is given exactly the findings named in the halted POSTMORTEM's `## Recommendation`
section — nothing broader. It does not re-review the document, does not address findings outside
that section, and does not touch any phase other than the one that halted.

**G-4 (verification is a separate dispatch from remediation, and is the only `RESOLVED: yes`
writer).** After remediation, a **separate** dispatch — never the same dispatch or agent session
that performed remediation — checks, on the branch, whether the Recommendation's named findings
are addressed. Only this verification dispatch may write `RESOLVED: yes` into the POSTMORTEM, and
it does so naming the addressed finding as evidence, per the existing POSTMORTEM lifecycle
convention (`pdlc/OPERATIONS.md`). A remediation dispatch that also verifies its own fix, or a
verification that writes `RESOLVED: yes` without naming addressed-finding evidence, does not
satisfy this goal.

**G-5 (successful resolution re-queues the feature for a fresh pass).** When verification writes
`RESOLVED: yes`, the queue flips that feature's row from `halted` to `pending` and commits the
row change (mirroring the existing halted-row commit convention: pathspec-scoped, never `-a`,
never pushed further than the local commit the driver already makes). The feature is picked up on
a subsequent queue iteration by the normal `selectNextPending` path — this REQ does not add a
resume-within-pass mechanism. The re-invoked phase re-derives its state from the tree, never from
state carried in the remediation or verification dispatch's prompt (mirrors the already-shipped
wave-ledger precedent named in `pdlc/OPERATIONS.md`: resume state is read from disk, never
trusted stale from a prior dispatch).

**G-6 (bounded attempts; exhaustion falls back to the human backstop, never a longer loop).** The
cycle is bounded by two independently-declared thresholds (§4 C-4): a per-POSTMORTEM attempt cap
and a per-feature cap across the life of that feature in the queue. Exhausting either cap leaves
the row `halted` (unchanged from today) and appends an escalation row to
`docs/_queue/ESCALATIONS.md` via the existing escalation-append mechanism, so the human backstop
gains a visible entry rather than the loop silently retrying forever.

**G-7 (measurable via `pdlc stats`, this REQ's `depends-on`).** Every remediation cycle attempt —
whether it resolves, exhausts its budget, or is skipped because the halt classified as human-only
— is observable in `pdlc stats {feature}` output as one line per attempt: feature, phase, attempt
count, and outcome. This REQ depends on `pdlc-stats` (§Prerequisites) because it has no other
measurement surface to report through; there is no bespoke reporting mechanism invented here.

## 3. Non-Goals

**NG-1** No auto-resolution for any halt class outside G-2's two automatable classes. Erratum R4
halts, guard-fired merges, `MERGE ESCALATION:` conditions, split recommendations, and unparseable
POSTMORTEMs stay human-only — this is fail-closed by design, not a gap to close in a later
iteration of this REQ.

**NG-2** No change to any merge-phase behavior, config, or gate (Phase MERGE, `cascade.pinCheck`,
the self-modification guard, `mergeStatus` semantics). The remediation cycle operates strictly on
a halted phase's POSTMORTEM and the queue row; it never touches Phase MERGE.

**NG-3** No change to `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, `MAX_ERRATUM_FOLLOWUP_ROUNDS`, or
any other review-loop or erratum-channel budget. A remediation cycle operates on an *already
halted* phase; it never grants a phase's review loop additional rounds.

**NG-4** No new `RESOLVED: yes` writer other than the verification dispatch specified in G-4. The
remediation dispatch, the queue driver itself, and any other pipeline actor remain unable to write
`RESOLVED: yes` — the separation this REQ specifies is exactly the pipeline's existing invariant
(the actor producing a halt never also clears it), extended by naming a second, independent actor
as the sole clearer, not relaxed.

**NG-5** No changes under `pdlc/engine/`; the engine vendors `pdlc/workflows/*.js` and picks up
changes automatically at the next pack/publish, per repo convention.

**NG-6** No new operator-facing CLI surface. `pdlc queue [--loop]` remains the only entry point;
this REQ's behavior is config-gated inside that existing command, per `docs/design/DESIGN-pdlc-
minimal-loop-2026-08-30.md` §4's stated intent that `init`/`stats` are the only surface additions
of the design's broader scope.

## 4. Constraints

**C-1** Config keys follow the shipped per-key independent-fallback precedent
(`learningsInjection`, `cascade.pinCheck`, `review.derivativeStop`, all in
`.claude/pdlc.config.json`): one malformed key inside the `queue.autoResolve` block never retunes
the rest of the block or any other config block.

**C-2** The disabled path (`queue.autoResolve.enabled` false, absent, or malformed) is
byte-identical to the pre-feature baseline — a halted row is recorded exactly as today, and the
driver takes no further action on it in the same pass. Verified against a committed fixture
baseline, mirroring the shipped `learningsBaselineGuard.test.js` precedent named in
`pdlc/OPERATIONS.md`.

**C-3** Config keys are spelled exactly `queue.autoResolve.enabled`,
`queue.autoResolve.maxAttemptsPerPostmortem`, `queue.autoResolve.maxResolutionsPerFeature`; no
other spelling or nesting satisfies this REQ's criteria.

**C-4** Per the threshold-declaration obligation, the following thresholds are declared here, not
left to TSPEC to invent:

| Key | Default | Type | Config owner | Rationale |
|---|---|---|---|---|
| `queue.autoResolve.enabled` | `false` | boolean | operator, `.claude/pdlc.config.json` → `queue.autoResolve` | Off by default per design §6/§8: one-feature experiment discipline, same rollout posture as `cascade.pinCheck` / `review.derivativeStop` |
| `queue.autoResolve.maxAttemptsPerPostmortem` | `1` | non-negative integer | operator, `.claude/pdlc.config.json` → `queue.autoResolve` | Design §6's stated default; one remediation attempt per individual POSTMORTEM before it counts as exhausted for that halt |
| `queue.autoResolve.maxResolutionsPerFeature` | `2` | non-negative integer | operator, `.claude/pdlc.config.json` → `queue.autoResolve` | Design §6's stated default; caps total successful-or-attempted resolutions across a feature's lifetime in the queue, so a feature that keeps re-halting cannot consume unbounded queue passes |

**C-5** Exhausting either threshold in C-4 (attempts on this POSTMORTEM, or resolutions on this
feature) leaves the row `halted` — never any other status — and appends exactly one escalation
row via the existing `appendEscalationEntry` mechanism (`docs/_queue/ESCALATIONS.md`); it never
retries beyond the declared bound in the same pass or a later one.

**C-6** This REQ does not change the meaning of any queue `Status` value or add a new one; `halted`
and `pending` are the only statuses this REQ's cycle transitions between, and both already exist
in `docs/_queue/QUEUE.md`'s documented lifecycle.

## 5. Acceptance Criteria

### REQ-AUTORESOLVE-01 Disabled path is byte-identical to today (P0)

**Source:** US-03.

**Who:** queue driver, after a pipeline run reports `outcome: "halted"`.
**Given:** `queue.autoResolve.enabled` is `false` (the default), absent, or malformed.
**When:** the driver finishes recording the `halted` row for that feature.
**Then:** the driver takes no further action on that row in this pass or any later one on
account of this REQ — the row stays `halted` exactly as it does today, and no remediation,
verification, or escalation append this REQ specifies occurs.

### REQ-AUTORESOLVE-02 Halt classification is fail-closed to human-only (P0)

**Source:** US-01.

**Who:** queue driver, remediation cycle.
**Given:** `queue.autoResolve.enabled` is `true`; a feature's row was just recorded `halted` and
its POSTMORTEM exists on the branch.
**When:** the driver classifies the POSTMORTEM's phase and `## Recommendation`.
**Then:** the cycle proceeds past classification only for review-cap non-convergence or
mechanical-precondition halts (G-2); an erratum R4 halt, a guard-fired merge, a `MERGE
ESCALATION:` condition, a split recommendation, or a POSTMORTEM that fails to parse is classified
human-only and the cycle stops at classification with no remediation, verification, or status
change beyond what REQ-AUTORESOLVE-01 already describes.

### REQ-AUTORESOLVE-03 Remediation is scoped to the Recommendation's named findings (P0)

**Source:** US-01.

**Who:** queue driver, remediation cycle.
**Given:** classification (REQ-AUTORESOLVE-02) selects an automatable halt.
**When:** the driver dispatches remediation.
**Then:** the remediation dispatch receives exactly the findings named in the POSTMORTEM's `##
Recommendation` section and no other content is scoped in as instruction to fix; the dispatch does
not re-review the halted document and does not touch any phase other than the one that halted.

### REQ-AUTORESOLVE-04 Verification is a separate dispatch and the sole `RESOLVED: yes` writer (P0)

**Source:** US-01.

**Who:** queue driver, remediation cycle.
**Given:** remediation (REQ-AUTORESOLVE-03) has run.
**When:** the driver dispatches verification.
**Then:** verification runs as a dispatch distinct from the remediation dispatch that produced
it; it checks, on the branch, whether the Recommendation's named findings are addressed, and it is
the only actor in this cycle permitted to write `RESOLVED: yes` into the POSTMORTEM — and only
while naming the addressed finding as evidence, per the existing POSTMORTEM lifecycle convention.
A verification dispatch that finds a named finding unaddressed does not write `RESOLVED: yes`.

### REQ-AUTORESOLVE-05 Successful verification re-queues the feature as pending (P0)

**Source:** US-01.

**Who:** queue driver, remediation cycle.
**Given:** verification (REQ-AUTORESOLVE-04) writes `RESOLVED: yes`.
**When:** the driver processes that outcome.
**Then:** the feature's row flips from `halted` to `pending` and the row change is committed
pathspec-scoped to `docs/_queue/QUEUE.md`, mirroring the existing halted-row commit convention
(never `-a`, never pushed beyond the local commit the driver already makes); the feature becomes
eligible for `selectNextPending` on a subsequent queue iteration, and the re-invoked phase derives
its resume state from the tree at that time, never from state carried in the remediation or
verification dispatch's prompt.

### REQ-AUTORESOLVE-06 Attempt and resolution budgets are independently enforced and fail to the human backstop (P0)

**Source:** US-02.

**Who:** queue driver, remediation cycle.
**Given:** `queue.autoResolve.enabled` is `true`; either `queue.autoResolve
.maxAttemptsPerPostmortem` attempts have already been spent on this POSTMORTEM, or
`queue.autoResolve.maxResolutionsPerFeature` resolutions have already been spent on this feature.
**When:** the driver would otherwise begin a new remediation cycle for that feature's halted row.
**Then:** the driver does not dispatch remediation or verification; the row stays `halted`, and
the driver appends exactly one escalation row via the existing `appendEscalationEntry` mechanism
to `docs/_queue/ESCALATIONS.md` naming the feature and the exhausted budget, matching the append
site's existing best-effort-outside-any-status-changing-transaction behavior (an append failure is
surfaced as a notice and never changes the row's `halted` status).

### REQ-AUTORESOLVE-07 Config keys fail open independently (P1)

**Source:** US-03.

**Who:** config loader.
**Given:** the `queue.autoResolve` block in `.claude/pdlc.config.json` has one wrong-typed or
malformed key among `enabled`, `maxAttemptsPerPostmortem`, `maxResolutionsPerFeature`.
**When:** config is parsed for a queue pass.
**Then:** only that key falls back to its declared default (C-4); the other keys in the
`queue.autoResolve` block, and every other config block, are unaffected — mirrors the shipped
`REQ-LOOPECON-08` precedent already in this pipeline.

### REQ-AUTORESOLVE-08 Every remediation cycle attempt is observable via `pdlc stats` (P1)

**Source:** US-04.

**Who:** operator, running `pdlc stats {feature}`.
**Given:** `queue.autoResolve.enabled` is `true` and at least one remediation cycle attempt has
occurred for that feature (resolved, exhausted, or skipped at classification).
**When:** the operator runs `pdlc stats {feature}`.
**Then:** the output includes one line per attempt carrying at minimum the feature, the halted
phase, the attempt count so far against that POSTMORTEM's cap, and the attempt's outcome
(resolved / exhausted / classified-human-only).

## 6. Risks

**R-1** A remediation fix could be wrong in a way that a scoped verification dispatch, checking
only the named findings, does not catch — a narrow verification is cheaper but less thorough than
a full re-review. Mitigated by G-2's fail-closed classification (only two narrow, largely
mechanical halt classes qualify at all) and by the pipeline's existing downstream gates (DoD's
stub/mock/coverage scan, document oracles, tests) still running unchanged after re-queue — this
REQ does not weaken any check the re-queued phase would otherwise run.

**R-2** The verification dispatch, even though separate from remediation, could still be
systematically lenient if both dispatches share the same scoping prompt material. Mitigated by
G-4's requirement that verification is the sole `RESOLVED: yes` writer and must name evidence — a
verification that writes `RESOLVED: yes` without addressed-finding evidence does not satisfy the
acceptance criterion, so this is checkable rather than merely aspirational.

**R-3** Config-gated, default-off means zero pipeline-wide effect until an operator opts a repo in.
This is by design (design §6/§8's "one-feature experiment discipline") and mirrors the shipped
`cascade.pinCheck` / `review.derivativeStop` rollout pattern.

**R-4** The `maxAttemptsPerPostmortem` / `maxResolutionsPerFeature` defaults in C-4 are the design
document's stated defaults, not independently re-measured against this repo's own halt corpus.
Mitigated by labeling them vetoable in Assumptions below, and by REQ-AUTORESOLVE-06 pinning the
observable fail-to-backstop behavior regardless of the default's exact value.

## 7. Obligations / Open

**O-1** The exact dispatch construction for remediation (which existing authoring/implementation
skill performs it — `se-implement` for a mechanical-precondition halt in an implementation phase,
`pm-author`/`se-author`/`te-author` for a review-cap halt in their respective authoring phase) is
FSPEC/TSPEC material; this REQ specifies only that remediation is scoped to the Recommendation's
findings (G-3) and that it is not the same dispatch as verification (G-4).

**O-2** The exact mechanism by which the driver identifies "the same actor" is excluded from
performing both remediation and verification (distinct dispatch invocation, distinct session, or
some other separation the runtime already provides) is TSPEC-level design material, not specified
here.

**O-3** Where in `pdlc/workflows/orchestrate-queue.js` the remediation cycle is wired relative to
the existing halted-row write and escalation-append call sites (`updateQueueStatus`,
`appendEscalationEntry`, both already present per `pdlc/OPERATIONS.md`'s queue entry-point
section) is TSPEC/PLAN material.

**O-4** This REQ's `depends-on: pdlc-stats` (§Prerequisites) blocks FSPEC/TSPEC authoring on
`pdlc-stats` existing at HEAD as a merged capability, per the hard-prerequisite table below; G-7's
acceptance criterion (REQ-AUTORESOLVE-08) cannot be implemented against a `pdlc stats` surface
that does not yet exist.

**Assumptions.** This REQ was authored in an orchestrated (non-interactive) dispatch; the
following choices are recorded as explicit, operator-vetoable assumptions rather than open
questions blocking authoring:
- **A-1** The `maxAttemptsPerPostmortem` (1) and `maxResolutionsPerFeature` (2) defaults in C-4
  are taken directly from the design document's stated defaults, not independently re-measured
  against this repo's own halt corpus. An operator may revise either default before FSPEC
  authoring without requiring a REQ revision round.
- **A-2** This feature targets the same repo-internal rollout posture as `pdlc-loop-economics` and
  `pdlc-decision-ledger` (config-gated, default off, one feature per experiment) rather than
  shipping ungated, per the design document's §8 rollout-order framing.
- **A-3** "Review-cap non-convergence" and "mechanical-precondition halts" (G-2) are read as the
  two POSTMORTEM classes the design's §6 text names by that description — respectively, a phase's
  review loop exhausting `MAX_REVIEW_ROUNDS`/`MAX_LIFETIME_ROUNDS` without an approving verdict,
  and a phase gate's structural/parse check (e.g. Phase P's PLAN parser, the completeness probe)
  rejecting an artifact. FSPEC may need to enumerate the exact POSTMORTEM `## Recommendation` text
  patterns that identify each class precisely; this REQ does not prescribe that parsing logic
  (altitude rule).

## Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-stats` feature (design §6/§8: `pdlc stats [feature]` measurement surface) | merged capability at HEAD, or a named successor REQ file registered in `docs/_queue/QUEUE.md` | Must exist at HEAD before FSPEC authoring for REQ-AUTORESOLVE-08's stats-line acceptance criterion to be implementable |

## 8. Traceability

| User Story | Requirements |
|---|---|
| US-01 As an operator running `pdlc queue --loop` unattended, I need a halted feature classified as review-cap non-convergence or a mechanical-precondition halt to be remediated and verified by separate dispatches, then re-queued, without requiring my judgment call | REQ-AUTORESOLVE-02, REQ-AUTORESOLVE-03, REQ-AUTORESOLVE-04, REQ-AUTORESOLVE-05 |
| US-02 As an operator, I need the remediation cycle bounded so a feature that keeps re-halting falls back to the human backstop (an escalation row) rather than looping forever | REQ-AUTORESOLVE-06 |
| US-03 As an operator, I need this to be safe to enable per project, with the disabled path unchanged and every config key failing open independently | REQ-AUTORESOLVE-01, REQ-AUTORESOLVE-07 |
| US-04 As an operator, I need every remediation attempt visible in `pdlc stats` so I can decide whether to keep the gate on | REQ-AUTORESOLVE-08 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

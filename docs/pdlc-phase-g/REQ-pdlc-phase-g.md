---
feature: pdlc-phase-g
ready: true
depends-on: pdlc-decision-ledger, pdlc-stats
---

# REQ — pdlc-phase-g

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3; proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §3 R3-1 and §4(a)/(b)/(e) |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-phase-g/LEARNINGS-pdlc-phase-g.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-30 |

## 1. Problem / Context

Discovery happens in the wrong place. The pipeline approves a REQ, authors an FSPEC from it,
and then discovers — across review rounds 2 through 15 — what the REQ actually meant. The
design's evidence section (`docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §1) records
the shape: mechanical gates with a fully-decided target converge in 2–5 rounds, while
open-ended document review does not converge at all — `pdlc-engineering-loop`'s FSPEC ran to
the 15-round lifetime cap, `pdlc-learnings-injection`'s did too, and 114 approving verdicts
were recorded on documents that still hit that cap
(`docs/_decisions/DECISIONS-loop-termination.md`, `DEC-TERM-01`). The cap did the converging,
not the reviewers, and rounds past roughly three are dominated by bookkeeping rather than
specification content.

The proposal's R3-1 (§3, Tier 3, risk High) names the fix and §4(a)–(b) design it: a bounded
phase between REQ approval and FSPEC authoring in which reviewers interrogate the approved REQ
under the frontier discipline of mattpocock's grilling skill, so that discovery is paid once,
up front, in a forum whose structure guarantees termination — rather than leaking into an
unbounded review loop that has no such guarantee.

Grilling cannot be adopted verbatim. That skill answers its questions by waiting on a human;
the pdlc pipeline is `/loop`-driven and unattended, and an agent that answers its own questions
is a broken skill (§4(a)). The proposal's substitution is an **authority ladder** with a
fail-closed bottom rung: a question answerable only by invention becomes one bounded escalation
row and the frontier moves on without it — strictly stronger than the status quo, where the
same question becomes a finding, a revision, another finding (§4(a), closing paragraph).

This REQ specifies that phase — **Phase G** — as a config-gated, default-off, one-feature
experiment, matching the rollout posture the proposal's §6 requires for every Tier 3 change and
the shipped `cascade.pinCheck` / `review.derivativeStop` precedent from `pdlc-loop-economics`.

## 2. Goals

**G-1 (a bounded grilling phase in the R→F slot).** When enabled, an approved REQ is
interrogated before FSPEC authoring begins, by the pm-review and te-review lenses acting as
grillers against pm-author defending the approved REQ as grillee (proposal §4(b)).

**G-2 (frontier discipline).** Each round asks only numbered questions whose prerequisites are
already settled — questions whose answers depend on other open questions are explicitly
deferred to a later round, naming the question that blocks them. This is the property that
makes termination structural rather than a matter of an agent judging itself finished.

**G-3 (authority ladder, ordered and exhaustive).** Every answer comes from exactly one of four
rungs, in order: (1) the approved REQ text, quoted; (2) `docs/_constraints/` or
`docs/_decisions/`, citing the decision id; (3) shipped code, with a verified `file:line`
citation; (4) `ESCALATE`. Nothing else is admissible, and an uncited answer is treated as
`ESCALATE` — the fail-closed direction.

**G-4 (bounded cost, bounded operator surface).** The phase costs at most 8 dispatches per
feature, once. Unanswerable questions land as escalation rows on `docs/_queue/ESCALATIONS.md`,
which is already item 3 of the documented four-item steady-state operator surface
(`pdlc/OPERATIONS.md` §Operator surface, BR-25) with a resolution command that already exists —
so this adds no new operator burden class.

**G-5 (downstream FSPEC is synthesis, not discovery).** When Phase G has run, FSPEC authoring
proceeds `to-spec` style: pure synthesis of already-settled material, no interview, decisions
pre-made, existing seams preferred over new ones (proposal §4(b), and its `to-spec` row).

**G-6 (measurable, attributable experiment).** Phase G's per-feature cost and yield — rounds
used, questions asked, answered by rung, deferred, escalated, dispatches spent — are derivable
by `pdlc stats` from the artifacts the phase already writes, so the one-feature experiment
yields a result comparable against the proposal's §5 baseline.

**G-7 (safe to try, safe to leave off).** The phase is config-gated and off by default; with it
off, every dispatch the pipeline constructs is byte-identical to the pre-feature baseline.

## 3. Non-Goals

**NG-1** No human-in-the-loop waiting. Grilling's "wait for the user's answers" and "do not act
until confirmed" steps have no referent in an unattended pipeline; they are **adapted**, not
adopted, exactly as proposal §4(e) prescribes — the frontier, numbering, recommended answers
and deferral rule are kept; the human is replaced by the authority ladder.

**NG-2** No new map, tracker, or session artifacts. The wayfinder-style issue map and the
one-ticket-per-session sizing rule are rejected outright (proposal §4(e); design §7):
`docs/_queue/QUEUE.md` is already the map, and session-sizing would cap throughput on operator
attention — the resource the pipeline exists to conserve.

**NG-3** No change to `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, `MAX_ERRATUM_ROUNDS_PER_DOC`
or `MAX_ERRATUM_FOLLOWUP_ROUNDS`. Phase G spends its own budget (C-5) and touches no other
phase's.

**NG-4** No relaxation of any fail-closed gate: untagged High findings, the erratum channel's
R4 POSTMORTEM halt, the structural-completeness probe, the DoD mutation floor, the wave gate
and the document oracles are all out of scope (proposal §4(d), §6).

**NG-5** Size tiers are out of scope. The design's tier table (§3) contemplates Phase G being
skipped on S-tier features and capped lower on M-tier than L-tier; that classification is R3-3
/ future `pdlc-size-tiers` territory. This REQ sets one round cap for every feature that
enables the phase; a future size-tiers feature owns any per-tier variation of it, and Phase G
does not depend on tiers existing.

**NG-6** The `CONTEXT.md` domain glossary (R3-5) and the `grill-with-docs` wrapper are out of
scope; the wrapper is rejected in the design (§7) as a name over two Skill calls, and the
glossary is a separate feature. Phase G consumes a glossary if one exists and requires none.

**NG-7** No changes under `pdlc/engine/`; the engine vendors `pdlc/workflows/*.js` and picks up
changes at the next pack/publish, per repo convention.

**NG-8** Phase G does not edit the approved REQ. A REQ defect discovered during grilling routes
through the existing erratum channel unchanged (`pdlc/OPERATIONS.md` §Phase graph and erratum
channel; proposal §4(b) Outputs).

## 4. Constraints

**C-1** Phase G occupies the slot between REQ approval and FSPEC authoring and disturbs no
existing contract in the phase graph: the phase letters already dispatched through the shared
convergence primitive (`PHASE_DISPATCH`, `pdlc/workflows/orchestrate-dev.js`) keep their
identities, round windows, cross-review file naming, POSTMORTEM lifecycle, `forcePhases`
tokens and report rows.

**C-2** Phase G is not a review loop and does not produce cross-review artifacts or verdicts.
It has no `VERDICT:` grammar, no approval anchors, no round window derived from
`CROSS-REVIEW-*-v{N}` basenames, and it consumes no review-round budget (NG-3).

**C-3** Config keys follow the shipped per-key independent-fallback precedent
(`learningsInjection`, `cascade.pinCheck`, `review.derivativeStop`): one malformed key inside
the `grilling` block never retunes the rest of the block or any other config block.

**C-4** With the phase disabled, the dispatch stream is byte-identical to the pre-feature
baseline, verified against a committed fixture baseline rather than a same-branch before/after
assertion — mirroring the shipped `learningsBaselineGuard.test.js` precedent named in
`pdlc/OPERATIONS.md`.

**C-5** Per the threshold-declaration obligation, these thresholds are declared here, not left
to TSPEC to invent:

| Key | Default | Type | Config owner | Rationale |
|---|---|---|---|---|
| `grilling.enabled` | `false` | boolean | operator, `.claude/pdlc.config.json` → `grilling` | Tier 3 gating: off by default, one-feature experiment (proposal §6) |
| `grilling.maxRounds` | `3` | integer | operator, same block | Proposal §4(b): "the question budget is capped at ≤3 rounds" |
| `grilling.maxDispatchesPerRound` | `2` | integer | operator, same block | Proposal §4(b) cost bound: one griller dispatch + one grillee dispatch per round |
| `grilling.maxFactFindingDispatches` | `2` | integer (per feature, not per round) | operator, same block | Proposal §4(b) cost bound: "up to 2 exploration sub-agent dispatches for rung-3 facts" |

The total dispatch bound is **derived, not chosen**: `maxRounds × maxDispatchesPerRound +
maxFactFindingDispatches` = 3 × 2 + 2 = **8**, which is the proposal's stated ≤8 cost bound
(§4(b) "Cost bound"; §3 R3-1 "Saving: +3–8 dispatches once"). No fifth threshold sets the
total independently.

**C-6** Escalation rows are appended to `docs/_queue/ESCALATIONS.md` — the same file and the
same append-only, non-feature-scoped convention that the merge-refusal and split-halt paths
already write to, resolved by the existing `pdlc decide` command (`pdlc/OPERATIONS.md`
§Operator surface). Phase G introduces no second escalation surface.

**C-7** Phase G's per-question outputs align with the decision-record shape the
`pdlc-decision-ledger` feature consumes: id, one-line statement, the phase/round it closed in,
and its citation (`docs/completed/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md`, `REQ-DECLEDGER-01`).
That REQ's `NG-1` anticipates this feature as an additional *source* for its index; this REQ
therefore uses its vocabulary — *closed decision*, *decision id*, *citation* — rather than
minting a parallel one.

## 5. Acceptance Criteria

### REQ-GRILL-01 Phase G runs between REQ approval and FSPEC authoring (P0)

**Source:** US-01.

**Who:** the pipeline driver.
**Given:** `grilling.enabled` is `true` and the feature's REQ has been approved.
**When:** the pipeline advances past REQ approval.
**Then:** the grilling phase runs to completion before any FSPEC authoring dispatch is
constructed; its grillers are the pm-review and te-review lenses and its grillee is the
pm-author role defending the approved REQ; and no existing phase's round window, cross-review
naming, POSTMORTEM lifecycle, `forcePhases` token or report row changes as a result (C-1).

### REQ-GRILL-02 Each round asks only prerequisite-settled questions; dependents are deferred (P0)

**Source:** US-01.

**Who:** a griller lens, in a grilling round.
**Given:** the phase is running and a round is being composed.
**When:** the round's questions are emitted.
**Then:** every question is numbered and carries the decision it hangs off, a recommended
answer, and the authority rung its answer is expected from; a question whose answer depends on
another still-open question of that round is not asked, but is explicitly listed as deferred,
naming the number of the question blocking it.

### REQ-GRILL-03 Every answer comes from the authority ladder, in order, or escalates (P0)

**Source:** US-02.

**Who:** the grillee, answering a numbered question.
**Given:** a numbered question from the current round.
**When:** the answer is produced.
**Then:** it is either an answer naming exactly one of the four ordered rungs — (1) approved
REQ text quoted, (2) a `docs/_constraints/` or `docs/_decisions/` entry cited by decision id,
(3) shipped code cited as `file:line` and verified, (4) `ESCALATE` — carrying the citation that
rung requires; or it is treated as `ESCALATE`. An answer without an admissible citation is
`ESCALATE`, never an accepted answer: the fail-closed direction.

### REQ-GRILL-04 Termination is structural, never agent-judged (P0)

**Source:** US-02.

**Who:** the pipeline driver.
**Given:** the phase is running.
**When:** a round completes.
**Then:** the phase ends by exactly one of three observable conditions and no other: the
frontier is empty; `grilling.maxRounds` rounds have completed; or every remaining question has
escalated. No termination condition depends on an agent reporting that it is finished.

### REQ-GRILL-05 Cost is bounded at 8 dispatches per feature (P0)

**Source:** US-02.

**Who:** the pipeline driver.
**Given:** `grilling.enabled` is `true` and the thresholds hold their declared defaults (C-5).
**When:** the phase completes, by any of REQ-GRILL-04's three conditions.
**Then:** the total number of dispatches the phase spent for that feature is at most 8 —
at most `maxDispatchesPerRound` per round across at most `maxRounds` rounds, plus at most
`maxFactFindingDispatches` fact-finding sub-agent dispatches for rung-3 citations across the
whole phase — and exceeding either component bound is not possible by any path.

### REQ-GRILL-06 Outputs are decision rows and escalation rows; the REQ is never edited (P0)

**Source:** US-01, US-03.

**Who:** the pipeline driver.
**Given:** the phase has completed.
**When:** its outputs are written.
**Then:** each resolved question yields one closed-decision record for the feature carrying id,
one-line statement, the phase and round it closed in, and its citation (C-7); each escalated
question yields exactly one row appended to `docs/_queue/ESCALATIONS.md` (C-6); and the
approved REQ file is unchanged by the phase — a REQ defect found during grilling is routed
through the existing erratum channel instead (NG-8).

### REQ-GRILL-07 Deferred questions unresolved at the cap are carried open, never dropped (P0)

**Source:** US-03.

**Who:** the pipeline driver.
**Given:** the phase ends because `grilling.maxRounds` was reached and questions remain
deferred or unanswered.
**When:** the phase's outputs are written and FSPEC review later runs.
**Then:** each such question is recorded as open in the feature's decision record and is
visible to FSPEC review; none is silently dropped, and reaching the round cap is not by itself
a halt, a POSTMORTEM, or a failure of the phase.

### REQ-GRILL-08 FSPEC authoring after Phase G is synthesis, not discovery (P1)

**Source:** US-01.

**Who:** the FSPEC author.
**Given:** Phase G ran to completion for this feature.
**When:** the FSPEC authoring dispatch is constructed.
**Then:** it is framed as `to-spec` synthesis of the settled material — the approved REQ, the
closed-decision records Phase G produced, and any repo glossary that exists — with no interview
step, no re-deciding of a question Phase G closed, and existing seams preferred over new ones.

### REQ-GRILL-09 Disabled path is byte-identical to today (P0)

**Source:** US-04.

**Who:** the pipeline driver.
**Given:** `grilling.enabled` is `false` (the default), absent, or malformed.
**When:** the pipeline runs any feature end to end.
**Then:** no grilling phase runs, no grilling artifact is written, and the dispatch stream is
byte-identical to the committed pre-feature baseline (C-4).

### REQ-GRILL-10 Config keys fail open independently (P0)

**Source:** US-04.

**Who:** the config loader.
**Given:** the `grilling` block in `.claude/pdlc.config.json` has one wrong-typed or malformed
key among `enabled`, `maxRounds`, `maxDispatchesPerRound`, `maxFactFindingDispatches`.
**When:** config is parsed for a run.
**Then:** only that key falls back to its declared default (C-5); the other keys in the
`grilling` block, and every other config block, are unaffected — the shipped per-key
independent-fallback behaviour of `cascade.pinCheck` and `review.derivativeStop` (C-3).

### REQ-GRILL-11 No existing gate or budget is relaxed (P0)

**Source:** US-04.

**Who:** the pipeline driver.
**Given:** `grilling.enabled` is `true`.
**When:** the feature runs end to end.
**Then:** every fail-closed gate named in NG-4 behaves exactly as it does with the phase
disabled, and no review-round or erratum budget named in NG-3 changes value or accounting.

### REQ-GRILL-12 The experiment is measurable per feature (P1)

**Source:** US-04.

**Who:** an operator, after a feature completes with the phase enabled.
**Given:** Phase G ran for that feature.
**When:** the operator asks `pdlc stats` for that feature.
**Then:** the phase's rounds used, questions asked, questions answered per authority rung,
questions deferred, questions escalated and dispatches spent are all derivable from the
artifacts the phase already wrote — no separate instrumentation channel is required.

## 6. Risks

**R-1** New phase, new failure modes — the proposal rates R3-1 High risk and permits a
one-feature experiment only. Mitigated by G-7 / REQ-GRILL-09 (off by default, disabled path
byte-identical) and by REQ-GRILL-05's hard cost bound: a failed experiment costs at most 8
dispatches and leaves a decision record behind, not damage (design §8, step 5).

**R-2** The grillee could answer by invention rather than escalating, converting the ladder's
fail-closed bottom rung into a source of fabricated settlement. Mitigated by REQ-GRILL-03's
treatment of any uncited answer as `ESCALATE` — the burden is on the citation, not on detecting
invention.

**R-3** Escalation volume could exceed what an operator will resolve, stalling features behind
open rows. Mitigated by the bounded question budget (C-5) and by escalation being an existing
operator-surface item with an existing resolution command (C-6, G-4) rather than a new class;
if volume is the observed outcome, that is the experiment's result (REQ-GRILL-12).

**R-4** Front-loading discovery could relocate it rather than reduce it, leaving FSPEC review
as long as before plus 8 dispatches. This is what the one-feature experiment measures (G-6);
the proposal's §5 saving is modelled, not measured, and this REQ asserts no saving.

**R-5** Round-cap defaults (C-5) are the proposal's numbers, not measurements against this
repo's corpus. Mitigated by their being config keys with per-key fail-open (REQ-GRILL-10) and
by the total bound being derived from them rather than independently asserted.

## 7. Obligations / Open Questions

**O-1** How the two griller lenses share the per-round dispatch budget — one combined dispatch
carrying both lenses, or alternation across rounds — is FSPEC/TSPEC material. This REQ pins
only the observable: both lenses are represented (REQ-GRILL-01) and the per-round dispatch
count holds (REQ-GRILL-05).

**O-2** How the frontier and its deferral edges are represented between rounds, and how
"prerequisites settled" is evaluated, is FSPEC/TSPEC material.

**O-3** How Phase G's closed-decision records are stored, named, and how their ids are minted
so they do not collide with `docs/_decisions/*` project-level ids or per-feature
`DECISIONS-{feature}.md` ids, is FSPEC/TSPEC material — and is the same open question
`pdlc-decision-ledger`'s `O-3` already carries. The two must be answered consistently; this
REQ's C-7 fixes the field set, not the storage.

**O-4** Whether wiring the grilling contract into griller- and grillee-facing prompt text
requires a `SKILL.md` edit (routing through the consolidation contract's
`CONSOLIDATION-PROPOSAL` human review, and reddening the digest manifest until re-recorded —
proposal §6, "The skill-prompt path") or can be delivered entirely through
dispatch-construction text the way `learningsInjection` is today, is a TSPEC-level choice.
Either path stays config-gated per C-3/C-4.

**O-5** Whether a future `pdlc-size-tiers` feature lowers `grilling.maxRounds` per tier or
skips the phase for S-tier features is that feature's decision, not this one's (NG-5).

**Assumptions.** This REQ was authored in an orchestrated (non-interactive) dispatch; the
following are recorded as explicit, operator-vetoable assumptions rather than open questions
blocking authoring:

- **A-1** The `grilling` block name and its four key spellings are chosen by analogy to the
  shipped `cascade.pinCheck` / `review.derivativeStop` / `learningsInjection` blocks and to the
  proposal's own §6 sketch (`grilling.enabled: false`). An operator may rename the block before
  FSPEC authoring without a REQ revision round.
- **A-2** Phase G is scoped to one M-tier feature as its experiment (design §8, step 5). This
  REQ does not encode the tier as a gate — enabling the config on any feature runs the phase —
  because tier classification does not exist yet (NG-5).
- **A-3** No per-round question-count threshold is declared: the proposal bounds the phase by
  rounds and dispatches, not by question count, and inventing a fifth threshold would make the
  ≤8 bound over-determined (C-5).

## 8. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-decision-ledger` — the closed-decision record shape (id, one-line statement, phase/round closed, citation) that C-7 and REQ-GRILL-06 align to, and the index that consumes Phase G's rows | REQ approved and feature merged to the base branch | Must exist at HEAD before FSPEC authoring |
| BL-02 | `pdlc-stats` — the measurement surface REQ-GRILL-12 reports through | Feature merged to the base branch | Must exist at HEAD before FSPEC authoring |

## 9. Traceability

| User Story | Requirements |
|---|---|
| US-01 As the pipeline, I need discovery paid once before FSPEC authoring rather than leaked across review rounds 2–15 | REQ-GRILL-01, REQ-GRILL-02, REQ-GRILL-06, REQ-GRILL-08 |
| US-02 As an operator, I need grilling to terminate structurally and cost a bounded, known number of dispatches | REQ-GRILL-03, REQ-GRILL-04, REQ-GRILL-05 |
| US-03 As an operator, I need every unanswerable question to become one bounded escalation row, and no question to be silently dropped | REQ-GRILL-06, REQ-GRILL-07 |
| US-04 As an operator, I need this experimental phase safe to try and safe to leave off, with a measurable result | REQ-GRILL-09, REQ-GRILL-10, REQ-GRILL-11, REQ-GRILL-12 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

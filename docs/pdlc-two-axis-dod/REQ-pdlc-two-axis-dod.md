---
feature: pdlc-two-axis-dod
ready: false
depends-on: pdlc-size-tiers
---

# REQ pdlc-two-axis-dod

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0 Move R3-4; design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3 (Verify row, footnote 2), §8 (item 7) |
| Downstream | FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-two-axis-dod/LEARNINGS-pdlc-two-axis-dod.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-30 |

## 1. Problem / Context

Today the shipped diff for a feature is evaluated by two separate, fully independent
dispatch chains: Phase CR (pm-review and te-review, each producing its own
`CROSS-REVIEW-*.md` chain) and Phase DOD (`dod-verify`'s stub/mock/coverage scan, producing
`CODE_REVIEW-{feature}-v{N}.md`). `pdlc/OPERATIONS.md`'s phase-graph section records that "CR
and DOD remain separate gates (operator decision, 2026-08-02 — never merge them)" — an
explicit, standing decision, not an oversight.

`docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §1 reports that same-diff review chains
with adjacent lenses and no shared state converge slowly relative to mechanical checks: DoD's
fixed checklist over the diff closes in 2 rounds, while open-ended review chains have run to
the 15-round lifetime cap. The proposal's R3-4 move (`docs/design/PROPOSAL-…html`) names the
fix as a **two-axis single gate**, not a merge of the two lenses: one post-implementation
dispatch running two parallel, non-merging axes over the same diff — a **Spec axis** (does the
diff match what the REQ/FSPEC asked for — missing requirements, scope creep, wrong
implementations) and a **Standards axis** (documented repo standards plus the existing smell
baseline, with a documented repo standard overriding the smell baseline on conflict) — reusing
`mattpocock`'s `code-review` skill shape: two parallel sub-agents, reports aggregated verbatim
under separate headings, never merged or re-ranked, one summary per axis, no overall winner.
This retires the standalone Phase CR dispatch chain for the shipped diff; the existing
`dod-verify` stub/mock/coverage scan keeps running alongside the two axes, unchanged.

The design's Verify row footnote is explicit that this move differs in kind from every other
row in its table: it "requires an explicit operator re-decision (it contradicts a standing
one) — it is the only row of this table that does." The proposal's own Risk assessment for
R3-4 agrees: "High — contradicts a standing operator decision; needs an explicit re-decision,
not a config flag." Unlike the Tier 3 items this REQ's siblings ship (config-gated,
default-off, reversible by flag), this one cannot ship reversibly behind a flag — the
mechanism it replaces is a standing decision, and superseding a standing decision is itself an
operator act this REQ cannot substitute for.

A second, narrower risk sits underneath the first: the proposal's Correctness note for R3-4
argues this is "not the merge the 2026-08-02 decision forbids" because it "keeps two
independent evaluators and two independent verdicts; it removes one dispatch chain and one
artifact set, not one lens" — but it also flags the corroborating signal from
`DEC-ORACLE-06` (`docs/_decisions/DECISIONS-test-oracle-mechanics.md`): "When two review
lenses … emit byte-identical finding text, that identity is evidence of a **shared
generator**, not of two independent judgments converging." Two axes independent in name but
not in execution would reproduce that exact failure mode — so "lens independence must be
structurally enforced regardless" (proposal, R3-4 Correctness) is part of what this REQ has to
guarantee, not an incidental note.

## 2. Goals

**G-1 (two-axis gate replaces standalone Phase CR).** The shipped diff is reviewed by one
post-implementation gate running two parallel axes — Spec (pm lens) and Standards (te lens) —
over the same diff, alongside the unchanged `dod-verify` stub/mock/coverage scan. No standalone
Phase CR dispatch chain runs for that feature once this ships.

**G-2 (verbatim, unmerged, unranked reporting).** Each axis's findings are recorded verbatim
under its own distinct heading; axes are never merged, re-ranked, or reduced to one overall
verdict spanning both.

**G-3 (structural lens independence).** The two axes are genuinely independent evaluations of
the diff, not one evaluation relabeled twice. Identical text appearing under both axis headings
is treated per DEC-ORACLE-06 — as a signal of a shared generator, never as two independent
judgments corroborating one another — and is never counted toward convergence as if it were.

**G-4 (DoD's fail-closed guarantees carry over unweakened).** The existing stub/mock/coverage
scan, DoD's mutation floor, and DoD's own round-budget behavior are unchanged by adding the two
axes.

**G-5 (gated on an explicit operator re-decision, not a config flag).** This REQ's mechanism
does not ship, and is not picked up by the queue, until an operator has recorded a decision
that explicitly supersedes the 2026-08-02 "CR and DOD remain separate gates" decision. This is
a one-time gating precondition, not a reversible runtime flag.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-size-tiers` feature merged into the base branch | PR merged | Must exist at HEAD before FSPEC authoring (per DESIGN §8 rollout order, item 7: "last, needs operator re-decision") |
| BL-02 | An explicit operator decision superseding the 2026-08-02 "CR and DOD remain separate gates … never merge them" decision (`pdlc/OPERATIONS.md`) | A recorded decision (e.g. a new `DECISIONS-*.md` entry, or an amendment to the record carrying the 2026-08-02 decision) naming this REQ | Must exist before `ready` flips to `true` in this REQ's frontmatter; this REQ's own authoring may proceed with `ready: false`, but no pipeline change built from it is picked up by the queue until BL-02 is resolved |

## 4. Non-Goals

**NG-1** No change to `dod-verify`'s stub/mock/coverage scan mechanics, DoD's mutation floor,
or DoD's own round-budget behavior (currently up to 3 evaluator→optimizer rounds before halt,
per `pdlc/OPERATIONS.md`'s Definition of Done section) — the two axes are additive to that
mechanism, not a replacement for it.

**NG-2** This REQ does not fuse the two axes into one verdict, one summary, or one ranked
outcome. That fusion is exactly what the 2026-08-02 decision's spirit forbids; the two-axis
gate stays two independent evaluators reported separately (G-2).

**NG-3** Phase G, the decision ledger, size tiers, and the `CONTEXT.md` domain glossary are
separate, already-queued features (`docs/_queue/QUEUE.md` rows 30, 31, 32's own dependency —
pdlc-size-tiers itself); none of them is authored by this REQ.

**NG-4** No changes under `pdlc/engine/`; the engine vendors `pdlc/workflows/*.js` and picks up
changes automatically at the next pack/publish, per repo convention.

**NG-5** No change to `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, or any erratum-channel budget
constant — this REQ retires one dispatch chain (Phase CR) and folds its lenses into an existing
one (Phase DOD); it does not touch round-budget math for either phase.

## 5. Constraints

**C-1** This REQ's mechanism is gated on BL-02 (§3), not on a config flag: unlike the
config-gated, default-off Tier 3 items this REQ's siblings ship, there is no runtime toggle
that makes this reversible per-repo — the standing decision it supersedes has to be explicitly
re-decided first, once, by an operator.

**C-2** `depends-on: pdlc-size-tiers` in this REQ's frontmatter reflects the rollout order
recorded in `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §8: size tiers ship first
("Size tiers … S first"), two-axis DoD ships "last, needs operator re-decision" (item 7) —
and matches the dependency already recorded for this feature at `docs/_queue/QUEUE.md`, row 32.

**C-3** `CODE_REVIEW-{feature}-v{N}.md` remains the versioned, disk-derived DoD artifact
(`N = max existing CODE_REVIEW-{feature}-v* version found on disk, or 1`) per
`pdlc/OPERATIONS.md`'s artifact convention; this REQ does not change that derivation.

## 6. Acceptance Criteria

### REQ-TWOAXIS-01 Two-axis gate replaces standalone Phase CR for the shipped diff (P0)

**Source:** US-01.

**Who:** the pipeline, reviewing a feature's shipped diff.
**Given:** a feature reaches its post-implementation review step.
**When:** the review dispatches.
**Then:** the Spec axis (pm lens: missing requirements, scope creep, wrong implementations
against the REQ/FSPEC) and the Standards axis (te lens: documented repo standards plus the
smell baseline, standard overriding baseline on conflict) run in parallel over the same diff,
alongside the unchanged `dod-verify` stub/mock/coverage scan; no standalone Phase CR dispatch
occurs for that feature.

### REQ-TWOAXIS-02 Verbatim, unmerged, unranked axis reporting (P0)

**Source:** US-01.

**Who:** the pipeline, recording review findings.
**Given:** both axes have completed their evaluation of the diff.
**When:** findings are recorded.
**Then:** the Spec axis's findings and the Standards axis's findings each appear verbatim under
their own distinct heading in the round's artifact; neither axis's content is combined into,
reordered by, subordinated to, or averaged against the other's, and no single overall
pass/fail verdict spans both axes.

### REQ-TWOAXIS-03 Lens independence is structurally enforced, and shared-generator text is never treated as corroboration (P0)

**Source:** US-02.

**Who:** the pipeline, evaluating the two axes' outputs for convergence.
**Given:** the Spec axis's and Standards axis's findings for a round.
**When:** the round's findings are accounted for.
**Then:** the two axes are evaluated as genuinely separate judgments over the diff, never as
one evaluation reported twice; where the two axes' recorded text is byte-identical, that
identity is treated per DEC-ORACLE-06 as evidence of a shared generator and is never counted as
two independent judgments corroborating one another toward convergence.

### REQ-TWOAXIS-04 DoD's existing fail-closed guarantees are unaffected (P0)

**Source:** US-03.

**Who:** the pipeline, running Phase DOD.
**Given:** the two-axis gate has shipped.
**When:** Phase DOD runs on a feature's diff.
**Then:** the stub/mock/coverage scan, the mutation floor, and DoD's round-budget behavior
observe the same outcomes they would have produced before this REQ shipped, for the same input
diff; none of them is weakened, bypassed, or made conditional on the two axes' outcomes.

### REQ-TWOAXIS-05 Gated on an explicit operator re-decision, not queue pickup (P0)

**Source:** US-02.

**Who:** the queue driver / an operator.
**Given:** this REQ's frontmatter carries `ready: false` and BL-02 (§3) is unresolved.
**When:** the queue driver considers this feature for pickup, or an operator considers
authoring downstream artifacts from this REQ.
**Then:** the feature is not picked up and downstream authoring does not proceed until an
operator has recorded a decision explicitly superseding the 2026-08-02 "CR and DOD remain
separate gates" decision and this REQ's `ready` field has been flipped to `true` by that
operator act — never by an automated process.

## 7. Risks

**R-1** Contradicts a standing operator decision (2026-08-02, `pdlc/OPERATIONS.md`); this is
the design's own assessment ("the only row of this table that does") and the proposal's own
Risk rating (High). Mitigated by G-5 / REQ-TWOAXIS-05: `ready: false` plus an explicit
Prerequisites row (BL-02) that a config flag cannot substitute for.

**R-2** Structural lens independence could erode in practice even where G-3 is honored in
intent — two axes dispatched from a shared context or a shared generator would reproduce the
exact false-corroboration failure DEC-ORACLE-06 already named. Mitigated by REQ-TWOAXIS-03;
the precise enforcement mechanism is TSPEC material (Obligations, O-3).

**R-3** Retiring Phase CR's dispatch chain risks silently weakening DoD's own fail-closed
mutation-floor and scan guarantees if the two axes are wired into the same round budget or
gate logic as the scan. Mitigated by NG-1 / REQ-TWOAXIS-04.

**R-4** Wiring the axis routing into `pm-review` / `te-review` likely requires editing their
`SKILL.md` files, which — per the proposal's "skill-prompt path" — routes through the
consolidation contract's `CONSOLIDATION-PROPOSAL` with human review, a slower path than a
config-gated Tier 3 change. Flagged in Obligations (O-1) rather than resolved here.

## 8. Obligations / Open Questions

**O-1** Whether the axis routing requires editing `pm-review` / `te-review` `SKILL.md` files
(routing through the consolidation contract's `CONSOLIDATION-PROPOSAL`) or can be achieved
entirely through dispatch-construction changes is TSPEC-level design material.

**O-2** The exact heading/label grammar distinguishing the two axes within the round's artifact
(e.g. what each heading is titled, how a reader tells Spec from Standards at a glance) is
TSPEC material — not specified here, per the altitude rule.

**O-3** The mechanism for detecting or flagging byte-identical text across the two axes
(REQ-TWOAXIS-03 / DEC-ORACLE-06) is TSPEC/PLAN material, not specified here.

**O-4** The form the BL-02 operator re-decision takes — a new `docs/_decisions/*.md` entry, an
amendment to the record carrying the 2026-08-02 decision, or another form — is left to the
operator; this REQ requires only that it exist and be checkable before `ready` flips to `true`.

**Assumptions.** This REQ was authored in an orchestrated (non-interactive) dispatch; the
following choices are recorded as explicit, operator-vetoable assumptions rather than open
questions blocking authoring:
- **A-1** `depends-on: pdlc-size-tiers` and `ready: false` are read directly from this
  feature's existing row in `docs/_queue/QUEUE.md` (Order 32) rather than re-derived; an
  operator may revise either before FSPEC authoring without requiring a REQ revision round.
- **A-2** "Explicit operator re-decision" (BL-02) requires a durable, recorded decision
  document naming this REQ — not a verbal or transient approval — since the decision it
  supersedes is itself durably recorded in `pdlc/OPERATIONS.md`.

## 9. Traceability

| User Story | Requirements |
|---|---|
| US-01 As a pipeline operator, I want the post-implementation review to run as one two-axis gate (Spec + Standards) instead of two separate dispatch chains (CR, DoD), so review cost drops without losing lens independence | REQ-TWOAXIS-01, REQ-TWOAXIS-02 |
| US-02 As a pipeline maintainer, I need this collapse blocked from auto-pickup until an explicit operator re-decision supersedes the 2026-08-02 "CR and DOD remain separate gates" decision, so a standing decision is never silently overridden | REQ-TWOAXIS-03, REQ-TWOAXIS-05 |
| US-03 As an operator relying on DoD's fail-closed gates, I need the existing stub/mock/coverage scan and mutation floor unaffected by this collapse | REQ-TWOAXIS-04 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

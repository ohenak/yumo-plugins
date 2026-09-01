---
feature: pdlc-review-tightenings
ready: true
depends-on: pdlc-stats
---

# REQ pdlc-review-tightenings

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §3 "Review loop end state, validated"; proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` rows R1-5, R1-6, R2-5, R2-6, R2-7 |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-review-tightenings/LEARNINGS-pdlc-review-tightenings.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-30 |

## 1. Problem / Context

Five review-loop failure modes are documented today only as SKILL-level instructions or
interactive-only advisory hooks — an agent can silently comply, and the corpus shows several
do not. Each is small, independently correctness-tightening, and already load-bearing enough
that the design doc lists it as validated pipeline end state, not a proposal still under
debate (`DESIGN-pdlc-minimal-loop-2026-08-30.md` §3): "verdict line hard precondition for a
round (R1-5), FINDING-grammar parse errors returned in-round before the existing fail-closed
behaviour fires (R1-6), mechanical split-halt when one High blocks a document twice running
(R2-5), REQ ≥90%-of-ceiling relocation trigger (R2-6), fail-closed Scope gate (R2-7)."

**R1-5 (verdict-required rounds).** `pdlc-wave-resume` produced 2 cross-review files with no
`VERDICT:` line at all; the regime-ledger corpus records 9 rounds on
`structure-directional-options-scoring` with the same gap. A review that renders no verdict is
today indistinguishable from an approval to a reader who only checks whether a round-N file
exists on disk (proposal R1-5, Mechanism/Correctness).

**R1-6 (FINDING-grammar feedback).** The regime-ledger corpus records `pm-review` FINDING
fail-closes on `paper-book`, and `pdlc-learnings-injection` produced 6 consecutive approving
rounds with zero `FINDING:` lines — silent conformance decay that the fail-closed gate caught
only at the class level, not the round it first appeared in. `hooks/scripts/check-finding-grammar.sh`
already warns interactively (PostToolUse, non-blocking) for erratum-round delta-confirmation
cross-reviews; it never returns the parse error to the reviewer inside the dispatch itself
(proposal R1-6, Mechanism).

**R2-5 (mechanical split-halt).** `pm-author`'s SKILL.md §5g already instructs: "If blocking
cross-review findings land in the same AC or clause for two consecutive rounds, stop revising
it in place" and split into its own REQ. On `regime-swing-confirmation`, 5g fired at Phase R
round 3 and nobody split — in-place revisions continued to the 15-round lifetime cap on six
documents and 188 cross-review files (proposal R2-5, Mechanism). The recurrence condition —
the same finding id blocking the same document across consecutive rounds — is mechanically
detectable; today enforcement depends entirely on the reviewing agent noticing and acting on
prose guidance.

**R2-6 (REQ byte-ceiling relocation trigger).** `hooks/scripts/check-req-size.sh` already
computes the 90%-of-61,440-byte soft threshold and warns (PostToolUse, non-blocking, advisory
context only). `regime-swing-confirmation` hit 92% of the ceiling at round 2, and roughly 90%
of that content was eventually relocated to `docs/_constraints/` anyway — after being reviewed
repeatedly in the wrong document first (proposal R2-6, Mechanism). `pdlc-rcv-budget-stop`
(61 KB / 99.8% of ceiling) and `pdlc-review-convergence` (311 KB) are the same pattern at
larger scale.

**R2-7 (fail-closed Scope gate).** A cross-review's `Scope:` tag (Local | Cross-Feature |
Process) is what `harvest-learnings` and `consolidate-learnings` use to decide which findings
are durable, project-level signal. The under-tagging pattern was independently re-derived in 5
of 8 harvests on the regime-ledger side and was itself suppressed as a learning (DC-13) instead
of being promoted to a mechanism — one `Scope` column serving two purposes caused 2–3 halts on
`pdlc-learnings-injection` alone (proposal R2-7, Mechanism). `hooks/scripts/check-scope-field.sh`
already detects a missing tag interactively but never blocks. The engine already enforces an
equivalent Scope-plus-findings structural gate for `CODE_REVIEW-*.md` (DoD's `code-review`
artifact class, `isComplete` in `pdlc/workflows/orchestrate-dev.js`) — this REQ is that same
mechanism's absence on `CROSS-REVIEW-*.md`.

All five mechanisms are already-verified against the engine at authoring time
(`pdlc/workflows/orchestrate-dev.js`): `extractFileVerdict` (verdict extraction, whose absence
today is `{ok: false, reason: "no_verdict_line"}` — a distinguishable outcome the workflow does
not yet act on as a round precondition), the `FINDING:` line grammar regex used by the erratum
delta-confirmation path, `MAX_REVIEW_ROUNDS` / `MAX_LIFETIME_ROUNDS` (round-budget constants,
unchanged by this REQ), `crossReviewComplete` (the structural-completeness check that today
reads only the `## Verdict` heading and its verdict line, not a `Scope:` field), and the
`code-review` artifact class's existing Scope-plus-findings gate this REQ extends to
`cross-review`. All five are defect-fix-tier tightenings of gates the engine or its hooks
already compute — none introduces a new gate class from nothing.

## 2. Goals

**G-1 (R1-5 — verdict is a round precondition, always-on).** A cross-review file that never
renders a parseable `VERDICT:` line is not treated as a completed review round. It is returned
to the reviewer for correction inside the same round, the same way an unparseable verdict
already fails closed today — never silently advanced as if it were an approval, and never
silently advanced as if it were an ordinary "Needs revision" round consuming round budget on a
review that said nothing at all.

**G-2 (R1-6 — FINDING-grammar parse errors returned in-round).** When a reviewer's findings
fail the required `FINDING:` line grammar, the reviewer receives the parse error and one
corrective turn inside the same round before the existing fail-closed behaviour (untagged/
malformed High findings fail closed) fires. This is strictly additive to today's fail-closed
floor — it never weakens it, never removes it, and applies before it, not instead of it.

**G-3 (R2-5 — mechanical split-halt, always-on).** When one High finding blocks approval of the
same document, on the same finding, for two consecutive rounds, the pipeline halts mechanically
with a POSTMORTEM naming the finding and recommending a split — rather than continuing to
dispatch further rounds on the strength of a SKILL-level instruction alone. The document's
author retains the split-execution judgment (which clause, what the successor REQ looks like);
the pipeline's job is only to stop and surface the recurrence, not to perform the split itself.

**G-4 (R2-6 — REQ byte-ceiling relocation trigger, always-on).** When a REQ crosses 90% of the
hard byte/line ceiling (`pdlc/hooks/scripts/check-req-size.sh`'s existing soft threshold), the
pipeline requires a relocation pass to `docs/_constraints/` before the next review round is
dispatched — the same threshold the hook already computes, but as a blocking pipeline action
rather than an interactive-only advisory context note that a non-interactive dispatch cannot
act on.

**G-5 (R2-7 — fail-closed Scope gate, always-on).** A `CROSS-REVIEW-*.md` file missing its
`Scope:` tag fails the same structural-completeness check that already fail-closes a
`CODE_REVIEW-*.md` file missing its Scope-plus-findings pair — extended from the `code-review`
artifact class to the `cross-review` artifact class — instead of only producing an interactive,
non-blocking hook notice.

**G-6 (no config gates).** All five tightenings ship always-on and fail-closed from the first
commit — no `enabled` flag, no per-repo opt-in, no rollout-experiment posture. This is a
deliberate departure from the `learningsInjection` / `cascade.pinCheck` /
`review.derivativeStop` / `decisionLedger` precedent of config-gated, default-off, one-feature
experiments: the design doc classifies R1-5/R1-6/R2-5/R2-6/R2-7 as "small always-on/fail-closed
tightenings, one feature, no config gates needed" (§8 step 3), distinct from the Tier 2/3 moves
that do carry that posture.

## 3. Non-Goals

**NG-1** The decision ledger (proposal Move M4, `docs/completed/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md`)
is a separate, already-in-flight REQ and is not part of this bundle; this REQ does not modify
or depend on its outcome.

**NG-2** Front-loaded grilling (Phase G, proposal move M5 / R3-1), size-tiered pipelines
(R3-3), the two-axis DoD collapse (R3-4), and `queue.autoResolve` are out of scope — none is a
prerequisite for, or blocked on, any of the five tightenings here.

**NG-3** No change to `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, or
`MAX_ERRATUM_FOLLOWUP_ROUNDS`. G-3's split-halt is a new halt condition, not a new round-budget
math; a document that halts under G-3 does so within its existing round budget, not past it.

**NG-4** No change to any existing fail-closed gate's floor: untagged High findings failing
closed, the erratum channel's R4 POSTMORTEM halt, the structural-completeness probe's existing
criteria for other artifact classes, the DoD mutation floor, the wave gate, or the document
oracles. G-1 and G-2 add a corrective step *before* an existing fail-closed behaviour fires;
they never relax what that behaviour does once it fires.

**NG-5** No changes under `pdlc/engine/`; the engine vendors `pdlc/workflows/*.js` and picks up
changes automatically at the next pack/publish, per repo convention.

**NG-6** Whether each tightening is delivered as an engine/workflow-side mechanical check, a
`SKILL.md` prompt-text change, or both, is not decided here — see Obligations, O-1. Editing a
`SKILL.md` file routes through the consolidation contract's `CONSOLIDATION-PROPOSAL` review per
`pdlc/OPERATIONS.md`; this REQ does not pre-empt that routing decision.

**NG-7** No new interactive-only affordance is added. Where an existing hook
(`check-req-size.sh`, `check-scope-field.sh`, `check-finding-grammar.sh`) already computes the
relevant signal for a human editing files interactively, this REQ's job is to make the
orchestrated, non-interactive dispatch path enforce the same signal the hook already surfaces —
not to add a sixth hook or change the three existing hooks' own non-blocking behaviour for
interactive sessions.

## 4. Constraints

**C-1** All five tightenings are always-on and fail-closed with no config key (G-6); there is
no `decisionLedger`-style `enabled`/`maxEntries`-style threshold-declaration table in this REQ
because there is no threshold left as a config owner's choice — G-4's 90% figure is the
existing `check-req-size.sh` soft threshold (630 lines / 55,296 bytes against the 700-line /
61,440-byte hard ceiling), not a new value this REQ invents.

**C-2** G-3's "two consecutive rounds" recurrence window matches `pm-author` SKILL.md §5g's
existing "same AC or clause for two consecutive rounds" language verbatim — this REQ does not
introduce a second, different window value for the same concept.

**C-3** G-1, G-2, G-3 and G-5 change what counts as a completed round or a passing structural
check; none changes what a reviewer's *content* judgment is scored on — severity bars, the
High-only convergence bar, and the derivative-stop / pin-check mechanics (both still
config-gated and default-off, unaffected by this REQ) are untouched.

**C-4** This REQ's five items are independent of one another at the acceptance-criterion level
— a downstream implementation may land them in any order or in separate commits — but they
share one document because each is individually too small to justify its own REQ/FSPEC/TSPEC
cycle (defect-fix tier, not a design-scale feature).

## 5. Acceptance Criteria

### REQ-REVTIGHT-01 A cross-review without a parseable verdict is not counted as a completed round (P0)

**Source:** US-01.
**Who:** review-loop driver, accounting for a dispatched round's outcome.
**Given:** a reviewer's cross-review file for the round contains no parseable `VERDICT:` line.
**When:** the round's outcome is accounted for.
**Then:** the round is not recorded as an approving round, and the reviewer receives the parse
failure and an opportunity to correct it before the round is treated as consumed —
mirroring how an unparseable verdict already fails closed today, so no reviewer output that
renders no verdict is ever read as silent approval by a later invocation.

### REQ-REVTIGHT-02 FINDING-grammar parse failures are returned to the reviewer in-round (P0)

**Source:** US-01.
**Who:** review-loop driver, accounting for a reviewer's `FINDING:` lines in an erratum-round
delta-confirmation.
**Given:** one or more `FINDING:` lines fail the required grammar (severity, provenance,
locality, section anchor, text).
**When:** the round's findings are parsed.
**Then:** the parse error is returned to that reviewer for one corrective turn inside the same
round before the existing fail-closed behaviour (untagged/malformed High findings fail closed)
is applied; the fail-closed behaviour itself still fires exactly as today if the corrective
turn does not resolve the grammar failure.

### REQ-REVTIGHT-03 A High finding blocking the same document twice running halts mechanically (P0)

**Source:** US-02.
**Who:** review-loop driver, accounting for two consecutive completed rounds on the same
document.
**Given:** the same High-severity finding blocks approval of the same document in round N and
again in round N+1.
**When:** round N+1 completes.
**Then:** the pipeline halts with a POSTMORTEM naming the finding and recommending a split,
instead of dispatching a round N+2 on the same clause; this halt consumes no additional round
budget beyond the two rounds that triggered it (NG-3).

### REQ-REVTIGHT-04 A REQ crossing the 90% byte-ceiling threshold requires relocation before the next round (P0)

**Source:** US-03.
**Who:** review-loop driver, about to dispatch the next review round for a REQ document.
**Given:** the REQ's current size is at or above 90% of the hard line/byte ceiling
(`check-req-size.sh`'s existing soft threshold).
**When:** the driver is about to dispatch the next review round.
**Then:** the next round is not dispatched until a relocation pass has moved shared or
project-level material out of the REQ (to `docs/_constraints/`) and the REQ is back under the
90% threshold, or the document is otherwise brought under it; this requirement applies at every
round boundary while the REQ remains at or above the threshold, not only once.

### REQ-REVTIGHT-05 A cross-review missing its Scope tag fails the structural-completeness check (P0)

**Source:** US-04.
**Who:** structural-completeness probe, scoring a `CROSS-REVIEW-*.md` file.
**Given:** the file carries no `Scope:` tag (Local | Cross-Feature | Process) on its findings.
**When:** the file's structural completeness is scored.
**Then:** the file fails the completeness check exactly as a `CODE_REVIEW-*.md` file missing
its existing Scope-plus-findings pair already does — never only an interactive, non-blocking
hook notice — so an untagged cross-review cannot reach the harvest step as if it were complete.

### REQ-REVTIGHT-06 All five tightenings are unconditional — no config key gates any of them (P1)

**Source:** US-05.
**Who:** operator or reviewer of this feature's implementation.
**Given:** any of REQ-REVTIGHT-01 through -05.
**When:** the behavior is exercised on any feature branch, in any repo consuming this pipeline.
**Then:** no `.claude/pdlc.config.json` key disables it; the behavior is present unconditionally,
the same way the pre-existing fail-closed floors (untagged High findings, R4 POSTMORTEM halt)
are unconditional today.

## 6. Risks

**R-1** G-3's split-halt (R2-5) is rated Medium risk in the source proposal, not Low like the
other four — it adds a new operator-facing stop where today's SKILL-level instruction sometimes
fires silently and sometimes not at all. Mitigated by scoping the halt narrowly (same finding
id, same document, exactly two consecutive rounds — C-2) and by routing it through the existing
POSTMORTEM/escalation surface (`pdlc/OPERATIONS.md`'s POSTMORTEM lifecycle) rather than
inventing a new operator-facing failure class.

**R-2** G-4's relocation requirement (R2-6) could stall a round if the relocation pass itself
is nontrivial (deciding what is genuinely shared vs. feature-specific). Mitigated by this REQ
not specifying *how* the relocation pass decides what moves — that judgment stays with the
document's author, as it already is under `pm-author` SKILL.md §5e's existing relocation rule;
this REQ only makes the round-boundary check for the *threshold* mechanical.

**R-3** G-1/G-2/G-5 tighten checks that already exist in some form (hook or code-review class);
the residual risk is narrow — a cross-review that was previously accepted with a missing verdict,
malformed FINDING grammar, or missing Scope tag now fails a check it did not fail before. This
is the intended, defect-fix-tier effect (proposal Correctness rows: "fail-closed and strictly
tightening" for R1-5; "retained as the fallback" for R1-6; scope gate "already detects it
interactively" for R2-7) and is not treated as a regression.

**R-4** Bundling five independent tightenings into one REQ risks one item's implementation
snagging the others' review rounds. Mitigated by C-4: each acceptance criterion is independently
verifiable and a downstream implementation may land them as separate commits or even separate
PLAN tasks, so a snag on one does not require re-litigating the REQ for the other four.

## 7. Obligations / Open

**O-1** Whether each of the five tightenings is delivered as an engine/workflow-side mechanical
check (`pdlc/workflows/orchestrate-dev.js`), a `SKILL.md` prompt-text change, or both — and, for
G-2/G-3/G-5, exactly how the "in-round return" or "halt" is threaded through the existing
dispatch/convergence primitive — is FSPEC/TSPEC-level design material (NG-6), not specified
here.

**O-2** The precise wording and placement of the POSTMORTEM recommendation text for G-3's
split-halt (REQ-REVTIGHT-03) is FSPEC material; this REQ specifies only that a POSTMORTEM is
written naming the finding and recommending a split, not its exact prose.

**O-3** Whether G-4's relocation-pass check (REQ-REVTIGHT-04) is enforced by extending
`check-req-size.sh`'s existing soft-threshold computation into the engine's round-dispatch path,
or by a separate engine-side re-computation of the same 90% figure, is TSPEC-level design
material; this REQ requires only that the check exist at round-dispatch time, not which
component performs it.

**Assumptions.** This REQ was authored in an orchestrated (non-interactive) dispatch; the
following choices are recorded as explicit, operator-vetoable assumptions rather than open
questions blocking authoring:

- **A-1** R1-6's scope is the erratum-round delta-confirmation `FINDING:` grammar specifically
  (the grammar `check-finding-grammar.sh` already checks, and the grammar
  `erratumConfirmPrompt` already requires), not every possible reviewer output format. An
  operator may widen this scope before FSPEC authoring without requiring a REQ revision round.
- **A-2** R2-5's "same finding" identity, for the purpose of counting two consecutive
  blocking rounds, is read as the same clause/AC per `pm-author` SKILL.md §5g's existing
  language (C-2) — not a looser "any High finding on the document" reading, which would fire far
  more often and was not the pattern observed on `regime-swing-confirmation`.
- **A-3** "No config gates" (G-6) is read as applying to all five items uniformly, including
  G-2's in-round corrective turn — even though G-2's fallback (existing fail-closed behavior)
  is itself unconditional today, the corrective turn it adds is also unconditional, not an
  opt-in convenience.

## 8. Traceability

| User Story | Requirements |
|---|---|
| US-01 As a reviewer or operator, I need an unparseable verdict or malformed FINDING grammar to be caught and correctable in the same round it occurs, not silently mistaken for approval or discovered only as an aggregate class failure later | REQ-REVTIGHT-01, REQ-REVTIGHT-02 |
| US-02 As an operator, I need the pipeline to stop itself, not rely on a reviewer noticing, when the same High finding blocks a document twice running | REQ-REVTIGHT-03 |
| US-03 As an operator, I need an oversized REQ to be relocated before it is reviewed again in the wrong document | REQ-REVTIGHT-04 |
| US-04 As an operator, I need every cross-review's Scope tag to be enforced, not merely suggested, so harvest never silently loses cross-feature signal | REQ-REVTIGHT-05 |
| US-05 As an operator, I need these five tightenings to be unconditional, not another config surface to opt into | REQ-REVTIGHT-06 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

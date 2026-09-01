---
feature: pdlc-erratum-delivery-gate
ready: false
depends-on: pdlc-review-tightenings
---

# REQ pdlc-erratum-delivery-gate

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — evidence sources: `docs/completed/pdlc-decision-ledger/POSTMORTEM-PR-pdlc-decision-ledger.md` §Recommendation items 4–6 and §Best-Guess Root Cause; `docs/completed/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` §4 items 2 and 9, §5 items 2, 3, 4 and 7; `docs/_queue/ESCALATIONS.md` (the four `pdlc-decision-ledger` entries) |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-erratum-delivery-gate/LEARNINGS-pdlc-erratum-delivery-gate.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft (stub — operator-seeded, to be hardened in review) | pm-author | 0.1 | 2026-09-01 |

## 1. Problem / Context

The erratum channel is the pipeline's mechanism for landing a defect found in an already-approved
upstream document: the item is routed to that document's author for a targeted versioned edit, and
the document's own approvers then write a delta-confirmation round. The channel's gate is
severity-, provenance- and locality-shaped, and it fails closed on untagged High findings
(`pdlc/OPERATIONS.md`, §"Errata are a first-class signal"). What it does **not** check is whether
the routed edit was actually made. Delta confirmation asks confirmers to assert an absence —
"nothing routed remains unreflected" — and dispatches them whether or not the author touched the
routed text at all.

`pdlc-decision-ledger` hit that gap twice in one feature, five rounds apart.

**Occurrence 1 (Phase PR, round 4).** An erratum round ended with `REVISION-COMPLETE` while one
routed item's locus was untouched. The halt was diagnosed by hand, and the first post-mortem
edition wrote the fix down: compare each routed item's named locus against the round's diff before
dispatching delta confirmation, and fail closed if the locus is byte-unchanged. It was recorded a
second time, in the `erratum-routed-item-unlanded-halt` project memory note, as "the standing
pipeline-improvement candidate".

**Occurrence 2 (Phase PR, round 9).** The identical failure recurred. The round landed two routed
items across five sites and re-grounded a twice-moved upstream, and did not touch the one row the
remaining routed item named; the author again emitted `REVISION-COMPLETE`. Cost: two confirmer
dispatches, a second halt, a second post-mortem edition on the same phase, and a document still
contradicting itself at two sites.

The post-mortem's own conclusion is this REQ's motivation, stated verbatim there as the primary
root cause: **a corrective control that was identified at the first occurrence was written down
instead of built.** The pipeline has a document-oracle harness, a fail-closed wave gate and a
finding-grammar check; the one recurring erratum-protocol defect it had observed twice had no gate
at all. `LEARNINGS` §4 item 2 records the same finding as the highest-signal item of the whole
feature and generalises it: a post-mortem recommendation that names a mechanical check should
either be built or explicitly declined with a reason, because "recorded candidate" is the state in
which defects recur.

Three further facts from the same evidence set shape what the gate has to be, rather than merely
motivating that one exist.

**The channel routes loci, but the defect lives in claims.** The routed list named a single task
row; the claim it asked to retire was stated at *two* sites — that row and a §Definition of Done
bullet. A locus-shaped route under-scopes systematically whenever a document says something twice,
which is exactly what large documents do. The confirmers correctly raised the surviving twin, and
the erratum channel had no vocabulary for it: it was classed `inherited` — formally out of scope of
the round that caused it to matter. A perfect locus-diff gate would have passed that round.
(`POSTMORTEM-PR` §Recommendation 5, §Best-Guess Root Cause Contributing 1; `LEARNINGS` §5 item 3.)

**The falsifiability rule the repo already ships can be satisfied by a tautology.** The oracle
checklist requires an absence-shaped assertion to be paired with a positive conjunct. One shipped
conjunct paired "the report has no `decisionLedger` key" with "the report's key set equals the
flag-off key set" — evaluated on the flag-off run, that second conjunct is `X == X`. The rule was
obeyed to the letter and the purpose was missed, because the checklist does not require the added
conjunct to be falsifiable on the arm it runs on. The post-mortem calls this a generic hazard of
any "add a positive conjunct" rule, not a quirk of one feature.
(`POSTMORTEM-PR` §Recommendation 6, Contributing 4; `LEARNINGS` §5 item 4.)

**The advisory tier produced zero signal across the same feature.** Four escalations were recorded
(`docs/_queue/ESCALATIONS.md`, the `pdlc-decision-ledger` entries: three A6, one A4; mirrored in
`docs/completed/pdlc-decision-ledger/ADVISORY-pdlc-decision-ledger.md`). Every one carries the same
payload: refusal reason `budget-exhausted`, root cause `unclassified`, diagnosis "no verdict was
produced", evidence `(none)`, proposed action `(none)`. Three of the four coincided with real
halts — and each of those halts was diagnosed by hand, by an operator reading the wave gate's own
output, with no contribution from the escalation record sitting beside it. A tier that fires
exactly when something is wrong and reliably records nothing is not a diagnostic surface; it is a
second file to read past. (`LEARNINGS` §4 item 9, §5 item 7.)

## 2. Goals

**G-1 (routed-locus delta-confirmation gate).** Before a delta-confirmation round is dispatched
for an erratum item set, the pipeline establishes that each routed item's named locus actually
changed in that round, and fails closed — naming the unchanged locus — when one did not. The
observable effect is that the round-4 and round-9 halts both occur at the same place: locally,
before a confirmer dispatch is spent, rather than after two of them. The routed list already
carries the loci, so no new authoring obligation falls on the reviewer who mints the item.

**G-2 (retired-text routing).** A routed erratum item can carry, in addition to its locus, the
verbatim text the item requires to disappear. The pipeline then establishes that the text survives
nowhere in the document, not merely that the named locus moved. The observable effect is that a
claim stated at two sites is caught by the channel that routed it, in the round that routed it,
instead of returning one round later as an `inherited` finding that is formally out of scope. This
is the same fail-closed, positive-oracle shape the finding-grammar check already uses, and it
converts "the author must remember every site" into a mechanical check.

**G-3 (cross-arm falsifiability clause).** The repo's oracle-contract requirements — the item list
`pdlc/OPERATIONS.md` already refers to when it says `AT-`/`INV-` items are linted for their full
contract, and the matching checklists in the test-engineering SKILLs — state that a positive
conjunct added to satisfy the absence-oracle rule must be **cross-arm**: it must compare against a
paired opposite run, and a conjunct that compares a value against its own definition on the arm it
runs on does not discharge the rule. The observable effect is that the tautological-conjunct class
is a review finding with a name, rather than a defect that passes every checklist it is measured
against. The conjunct that failed on `pdlc-decision-ledger` is available as the worked example.

**G-4 (an escalation carries a diagnosis or is not counted as advice) — secondary.** When the
advisory tier refuses a seam, the record it writes is required to distinguish "the tier looked and
found nothing" from "the tier never produced a well-formed verdict". A refusal that reaches the
operator with root cause `unclassified` and empty evidence is surfaced as what it is — a tier
failure to be fixed or disabled — and never presented in the same form as a diagnosis. The
observable effect is that the four-escalation, zero-diagnosis record of `pdlc-decision-ledger`
becomes either a real diagnosis or an explicit, visible admission that the tier had nothing to say;
`LEARNINGS` §5 item 7 leaves exactly that decision open, and this REQ closes it in the direction of
honest reporting.

**G-5 (built, not recorded).** Every item in this REQ is a check that some prior post-mortem
already recommended in prose. The feature's purpose is the conversion itself: each item either
ships as a gate or is explicitly declined with a recorded reason, per `LEARNINGS` §4 item 2. No
item of this REQ is discharged by adding guidance to a SKILL or a runbook alone — including G-3,
whose home is the oracle-contract requirement set the erratum channel's existing item-list lint
already checks `AT-`/`INV-` items against; the matching SKILL checklist text follows that
requirement, it does not substitute for it.

## 3. Non-Goals

**NG-1 — the no-halt advisory direction is named here and deliberately excluded.** There is a
standing operator direction that the advisory tier should *remediate* wave-gate failures rather
than let them halt the loop — the "no-halt advisory" idea, recorded in project memory as
`fable5-advisory-no-halt` and deferred there pending `pdlc-consolidation-agent` (since merged). It
is excluded from this REQ for a reason worth stating rather than leaving to inference: it changes
the **halt contract** — what the pipeline is allowed to continue past unattended — whereas every
item here only changes what the pipeline *reports*, and G-1/G-2 add halts rather than removing
any. Bundling a halt-removal with three halt-additions would put the two under one review loop and
one approval, and the evidence for the two is unrelated. G-4 is the honest-reporting half of the
advisory problem and is safe to ship alone: an escalation that admits it produced no verdict is
strictly more informative than one that does not, under either halt posture. See O-3 for the
binding this leaves open.

**NG-2** No change to the erratum channel's severity/provenance/locality grammar, to its round
budgets (`MAX_ERRATUM_ROUNDS_PER_DOC`, `MAX_ERRATUM_FOLLOWUP_ROUNDS`), or to the R1–R4 disposition
ladder. G-1 and G-2 add a precondition *before* delta confirmation is dispatched; they do not
rewrite what confirmation does once it runs, and they do not create a new round.

**NG-3** No change to any existing fail-closed floor: untagged High findings, the R4 POSTMORTEM
halt, the wave gate, the document oracles, the DoD mutation floor, the structural-completeness
probe. This REQ only adds checks.

**NG-4** The five review-loop tightenings green-lit for `pdlc-review-tightenings` (row 28) —
verdict-as-round-precondition, in-round FINDING-grammar feedback, mechanical split-halt, the REQ
byte-ceiling relocation trigger and the fail-closed `Scope:` gate — are that feature's scope, not
this one's. This REQ does not restate, modify or re-decide any of them; it depends on them landing
first (C-1).

**NG-5** This REQ does not decide whether the advisory tier should keep firing at all. G-4 makes a
zero-signal refusal visible as a tier failure; whether the response to a persistently zero-signal
seam is to fix it, narrow it or disable it is an operator decision this REQ deliberately leaves
outside its acceptance criteria.

**NG-6** Whether each item is delivered engine-side, as `SKILL.md` prompt text, or both, is not
decided here (O-1) — subject to G-5, which forbids the SKILL-text-only answer. Editing a
`SKILL.md` routes through the consolidation contract's `CONSOLIDATION-PROPOSAL` review per
`pdlc/OPERATIONS.md`; this REQ does not pre-empt that routing.

**NG-7** No new document oracle over feature artifacts, and no retrospective enforcement: nothing
here re-opens or re-verifies `pdlc-decision-ledger`'s shipped documents. That feature is merged;
it is this REQ's evidence, not its target.

## 4. Constraints

**C-1 (ordering).** This REQ is blocked on `pdlc-review-tightenings` (queue row 28) and must not
be picked up before it merges. Both features change what the review-round dispatch path treats as a
completed or admissible round, and both add requirements to the same oracle-contract and
cross-review surfaces. Landing them in parallel would produce exactly the rework loop this pipeline
has already paid for twice — two REQs revising the same clauses in alternating rounds.

Hard prerequisites, checkable at Phase-0 readiness triage:

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-review-tightenings` (queue row 28) — its five tightenings settled and merged | PR merged to the base branch | Must be merged at base HEAD before FSPEC authoring |
| BL-02 | The erratum channel's routed item list carries each item's named locus | Shipped behaviour, `pdlc/OPERATIONS.md` §"Errata are a first-class signal" (item-list hygiene at mint) | Must hold at REQ acceptance; G-1 adds no authoring obligation only if it does |
| BL-03 | The advisory tier's escalation record is the operator-facing surface for a refusal | Shipped behaviour, `docs/_queue/ESCALATIONS.md` plus per-feature `ADVISORY-*.md` | Must hold at REQ acceptance; G-4 changes what that record says, not where it lives |

**C-2 (no config gates).** Every item ships always-on and fail-closed from the first commit, with
no `.claude/pdlc.config.json` key gating it — matching `pdlc-review-tightenings`' G-6 posture and
distinguishing this feature from the `learningsInjection` / `cascade.pinCheck` /
`review.derivativeStop` / `decisionLedger` family of config-gated, default-off experiments. There
is consequently no threshold table in this REQ: no item introduces a numeric cutoff, staleness
window, penalty value or enum whose value is a config owner's choice.

**C-3 (G-2 is opt-in per item, not per repo).** The retired-text field on a routed item is
optional for the reviewer minting the item: an item that names no retired text is gated by G-1
alone. C-2's always-on rule governs the *check* — whenever the field is present it is enforced,
with no way to switch it off — not whether every minted item must carry one.

**C-4 (delivery size).** This REQ ships at or under **400 lines**. The enforced ceiling is
`pdlc/hooks/scripts/check-req-size.sh`'s 700 lines / 61,440 bytes, with its soft threshold at 90%
(630 lines / 55,296 bytes); 400 is the authoring target that keeps the document clear of both, and
it is a delivery constraint on this document, not a claim about the ceiling.

**C-5 (items are independent).** G-1, G-2, G-3 and G-4 are independent at the acceptance-criterion
level and may land in any order or as separate commits. They share one REQ because each is a
defect-fix-tier check too small to justify its own REQ/FSPEC/TSPEC cycle, and because all four are
the same lesson — a recommendation converted into a control — applied at four layers.

## 5. Acceptance Criteria

### REQ-ERRGATE-01 An erratum round whose routed locus is byte-unchanged does not reach confirmers (P0)

**Source:** US-01.
**Who:** the erratum channel, preparing to dispatch a delta-confirmation round.
**Given:** an erratum item set has been routed to a document's author, the author's targeted edit
round has ended, and at least one routed item's named locus is byte-unchanged in that round.
**When:** the delta-confirmation round is about to be dispatched.
**Then:** confirmation is not dispatched. The pipeline fails closed and reports the unchanged
locus by name, so the operator sees which routed item did not land — the same outcome the round-4
and round-9 halts eventually reached, reached before a confirmer dispatch is spent rather than
after two.

### REQ-ERRGATE-02 An erratum round whose routed retired text survives anywhere in the document does not reach confirmers (P0)

**Source:** US-02.
**Who:** the erratum channel, preparing to dispatch a delta-confirmation round.
**Given:** a routed item carries verbatim text that the item requires to be retired, and that text
is still present somewhere in the edited document — at the routed locus or at any other site.
**When:** the delta-confirmation round is about to be dispatched.
**Then:** confirmation is not dispatched. The pipeline fails closed and reports the surviving text
and where it survives, so a claim stated at two sites is caught in the round that routed it. A
routed item that carries no retired text is unaffected by this criterion and is gated by
REQ-ERRGATE-01 alone (C-3).

### REQ-ERRGATE-03 A positive conjunct that is not cross-arm does not discharge the absence-oracle rule (P0)

**Source:** US-03.
**Who:** a test engineer authoring or reviewing an oracle, and the reviewer minting an `AT-`/`INV-`
erratum item that the channel's existing item-list lint checks for its full contract.
**Given:** an absence-shaped assertion carries a positive conjunct added to satisfy the repo's
falsifiability rule, and that conjunct compares a value against its own definition on the arm the
oracle runs on — so it cannot fail on that arm.
**When:** the oracle is reviewed, or the item naming it is minted.
**Then:** the conjunct does not satisfy the rule: the oracle-contract requirement set states that a
distinguishing conjunct is a comparison against a **paired opposite run**, and the reviewing
checklists carry the same requirement in the same words. A reviewer flagging a tautological
conjunct is citing a stated requirement, not exercising discretion, and the
`pdlc-decision-ledger` conjunct is available as the worked example.

### REQ-ERRGATE-04 An escalation with no diagnosis is reported as a tier failure, not as advice (P1)

**Source:** US-04.
**Who:** an operator reading `docs/_queue/ESCALATIONS.md` or a feature's `ADVISORY-*.md` record.
**Given:** the advisory tier refuses a seam and produces no well-formed verdict — the shape all
four `pdlc-decision-ledger` escalations took: refusal reason `budget-exhausted`, root cause
`unclassified`, empty diagnosis, empty evidence, empty proposed action.
**When:** the escalation record is written and surfaced to the operator.
**Then:** the record distinguishes "the tier examined the seam and had nothing to propose" from
"the tier never produced a verdict", and the second is presented as a tier failure to be fixed or
disabled rather than in the same form as a diagnosis. An operator reading the record can tell,
without opening the wave gate's own output, which of the two happened.

### REQ-ERRGATE-05 Each item ships as a check or is declined in writing (P1)

**Source:** US-05.
**Who:** the operator or reviewer accepting this feature.
**Given:** any of REQ-ERRGATE-01 through -04.
**When:** the feature is accepted.
**Then:** the item is present as an enforced check, or its decline is recorded with a reason in the
feature's own artifacts. No item is accepted as discharged by SKILL or runbook guidance alone
(G-5), and no item is accepted in the "recorded candidate" state whose recurrence cost this
pipeline the second post-mortem edition that motivates this REQ.

## 6. Risks

**R-1 (G-1 over-fires on a legitimate no-op).** A routed item can be correct to leave a locus
byte-unchanged — for instance when a prior round already landed the change, or when re-grounding a
moved upstream makes the routed edit redundant. G-1 as stated would halt on that. This is the
highest-value question for FSPEC: whether the legitimate no-op is expressed as a distinct item
disposition the author can record, or whether the halt is simply accepted as the cheaper error. The
observed cost asymmetry favours halting — two occurrences at two confirmer dispatches each, versus
an occasional avoidable stop — but the REQ does not pre-decide it (O-2).

**R-2 (G-2's retired text is only as good as the quote).** A verbatim quote that is too short
matches innocent text elsewhere and fails the round spuriously; too long, and it misses the twin
site that paraphrases the claim. This narrows the reach of G-2 rather than defeating it — the twin
that escaped on `pdlc-decision-ledger` was a near-verbatim restatement — but G-2 must be understood
as raising the floor, not as a guarantee that every restated claim is caught.

**R-3 (G-3 is a requirement about judgment).** Unlike G-1 and G-2, "cross-arm" is a property a
reviewer assesses; the item-list lint can check that an item states its contract, and cannot in
general prove a conjunct is falsifiable on its arm. The mitigation is the worked example: the
requirement plus a concrete failing conjunct is materially more enforceable than the current rule,
even though it is not mechanical in the way G-1 is.

**R-4 (G-4 makes existing noise louder).** Reporting zero-signal refusals honestly may produce a
run of visible tier failures where today there are quiet records. That is the intended effect —
three of the four escalations on `pdlc-decision-ledger` sat beside real halts and contributed
nothing to diagnosing them — but an operator should expect the record to look worse before the tier
gets better, and NG-5 deliberately leaves the response to that out of scope.

**R-5 (blocked-row staleness).** C-1 blocks this REQ on row 28. If `pdlc-review-tightenings`
changes the review-round dispatch surface substantially, this REQ's items may need re-grounding
against it before FSPEC authoring — the ordinary upstream-re-grounding obligation, noted here so
the dependency is not read as merely a scheduling convenience.

## 7. Obligations / Open

**O-1** Whether each item is delivered engine-side, as SKILL prompt text, or both — and how the
G-1/G-2 preconditions are threaded through the existing erratum dispatch path — is FSPEC/TSPEC
design material (NG-6), bounded by G-5's prohibition on the SKILL-text-only answer.

**O-2** R-1's legitimate-no-op question — whether an author can record a routed item as
correctly-no-op, and if so what evidence that disposition requires — is left open for FSPEC. It is
the one place where this REQ's gate could be wrong in the operator-hostile direction, and it should
be decided deliberately rather than defaulted.

**O-3 (unbound deferral, flagged not hidden).** NG-1 excludes the no-halt advisory direction. That
direction has **no queue row today** and this REQ deliberately does not create one, because a
change to the halt contract needs an operator decision this dispatch cannot make. Recorded as an
open item rather than an assumption: an operator should either seed a successor row for it or
record it as explicitly declined, per `LEARNINGS` §4 item 2's own rule. Until one of those happens
it remains a prose-only intent — the exact state this REQ exists to argue against.

**O-4 (stub status).** This document is an operator-seeded stub, authored to capture the
`pdlc-decision-ledger` debts while the evidence is fresh and to hold the queue row. It has not been
through a review round. Expect §5 to gain precision — particularly REQ-ERRGATE-03's and -04's
observable outcomes, which are today the least sharply stated — and expect §1's evidence citations
to be re-verified against `docs/completed/pdlc-decision-ledger/` at review time.

**Assumptions.** Authored in an orchestrated dispatch with no human mid-dispatch; the following are
explicit, operator-vetoable choices rather than open questions blocking authoring:

- **A-1** The four items belong in one REQ rather than four. Vetoable: an operator who wants G-1
  shipped immediately may split it out — it is the item with two observed occurrences and the
  cleanest evidence, and C-5 already permits independent landing.
- **A-2** The advisory item (G-4) is scoped to *how a refusal is reported*, not to fixing whatever
  makes the tier exhaust its budget. The narrower reading was chosen because it is verifiable from
  the escalation record alone; an operator may widen it before FSPEC authoring.
- **A-3** `pdlc-decision-ledger`'s artifacts are read at `docs/completed/pdlc-decision-ledger/`,
  where they were archived on merge. Citations by stable content (section headings, item numbers)
  survive that move; only the paths in this REQ's header table are move-sensitive.
- **A-4** The queue row is seeded `blocked` AND the frontmatter is `ready: false` — a deliberate
  double hold (operator decision, 2026-09-01), diverging from row 28's dependency-only shape:
  this REQ is an unreviewed operator-seeded stub, and `ready: false` keeps the queue from
  auto-dispatching it the moment `pdlc-review-tightenings` merges. Flipping `ready` to `true`
  is the operator's green-light after the stub has been hardened.

## 8. Traceability

| User Story | Requirements |
|---|---|
| US-01 As an operator, I need an erratum round that did not touch what it was routed to fix to stop before confirmers are dispatched, not after two of them have reported it | REQ-ERRGATE-01 |
| US-02 As an operator, I need a routed claim to be retired everywhere it is stated, caught by the round that routed it rather than returning as an out-of-scope inherited finding | REQ-ERRGATE-02 |
| US-03 As a test engineer, I need the falsifiability rule to reject a conjunct that cannot fail on the arm it runs on, so obeying the checklist and satisfying its purpose are the same act | REQ-ERRGATE-03 |
| US-04 As an operator, I need an advisory escalation to tell me whether it diagnosed nothing or produced nothing, so a zero-signal tier is visible as a defect instead of reading like advice | REQ-ERRGATE-04 |
| US-05 As an operator, I need each of these post-mortem recommendations either built or declined in writing, because the recorded-candidate state is what let one of them recur five rounds later | REQ-ERRGATE-05 |

Roll-up to be recorded in `docs/requirements/traceability-matrix.md` when this REQ leaves stub
status.

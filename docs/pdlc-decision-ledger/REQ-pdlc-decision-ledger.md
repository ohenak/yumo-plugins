---
feature: pdlc-decision-ledger
ready:
depends-on:
---

# REQ pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §0 Move M4, §3 R3-2 |
| Downstream | FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.1 | 2026-08-28 |

## 1. Problem / Context

Reviewers re-open decisions that are already closed, and pay for it every round. Two
project-level decision files already name the pattern without a gate behind it:
`docs/_decisions/DECISIONS-erratum-routing.md` (`DEC-ERRROUTE-01`) requires that a
confirmation-round finding mechanically mint an erratum item; separately,
`docs/_decisions/DECISIONS-review-severity-bars.md` (`DEC-ERR-01`, "A collision whose upstream
has already decided is absorbed, not routed", summarised in `pdlc/OPERATIONS.md`'s
erratum-channel section) states that routing a question the upstream has already decided is a
false statement in a hand-off section, not a demoted finding. `docs/_decisions/DECISIONS-loop-termination.md`
(`DEC-TERM-02`) separately establishes that a staleness-only round is not a review round.
Both are enforced today only as prompt instructions: `pdlc/OPERATIONS.md`'s review-loop
mechanics section records that round-2+ delta-scoped dispatches already tell the optimizer
"settled decisions are not re-litigated" — but this is an instruction to the agent, not a
mechanically checked gate, and the corpus shows it does not hold: 114 approving verdicts were
recorded on documents that still hit the 15-round lifetime cap on `pdlc-engineering-loop`
(`docs/_decisions/DECISIONS-loop-termination.md` `DEC-TERM-01`), and the proposal's D4 finding
class (staleness bookkeeping re-filed as findings) recurs independently on
`pdlc-engineering-loop` (one hash re-filed as a Low finding across 54 cross-reviews),
`pdlc-wave-resume` (eight findings hand-copied instead of hash-derived), and — from the
separate `regime-ledger` corpus the proposal's §2 cites, not this repository —
`structure-directional-options-scoring` (an approval anchor re-filed across four reviews,
159 `FINDING:` lines total). Re-litigation of a already-closed decision is the same shape of
waste, one layer up: not a stale citation, but a question with a settled answer, asked again.

The proposal's Move M4 (§0 top-moves table, Tier 3, risk Medium) and its R3-2 mechanism
(§3/§4(c)) name the fix: a one-line-per-closed-decision index injected into every review
dispatch, plus a rule that a reviewer may re-open a closed decision only with a High finding
that cites new evidence and names the decision id. The proposal reuses the shipped
learnings-injection budget machinery as the mechanism precedent (`pdlc/OPERATIONS.md`'s
"Prior-feature learnings injection" section; config block `learningsInjection` in
`.claude/pdlc.config.json`, parsed with per-key independent fallback) and dedupe-keys on
decision id, the same key the proposal notes R1-4's staleness dedup already uses for findings
(§4(c): "the dedupe key for both re-litigation and staleness re-filing is the same"). This REQ
is the pipeline-internal counterpart to the loop-economics feature (`M1`–`M3`, now shipped at
`docs/completed/pdlc-loop-economics/`), which fixed round-level staleness re-filing; this
feature fixes decision-level re-litigation, one layer up the same stack.

## 2. Goals

**G-1 (decision index in review dispatches, config-gated, default off).** When enabled, every
review dispatch includes a rendered index of the closed decisions in scope for the document
under review: one line per decision carrying **exactly two required fields** — the decision id
and a one-line statement of what it decided — plus a **source citation** naming the record file
and the heading the line was rendered from. No other field is required. Where a record happens
to carry an origin or evidence datum, it may be rendered after those fields; where it does not,
the line is rendered without it and this is not a defect. The index is sourced from decision
records that already exist today (`docs/_decisions/*` project-level decisions, and a feature's
own `DECISIONS-{feature}.md` where present) — this REQ does not mint a new decision-record file
type, does not add a field to any existing record shape, and does not require every feature to
author one. **In scope for a document** means, as a derivable set: every decision record under
`docs/_decisions/` plus the feature's own `DECISIONS-{feature}.md` if it exists — not a
relevance judgement made per document.

**G-2 (never-re-litigate rule is reviewer-side, config-gated, default off, requires G-1
enabled).** The rule is carried to the reviewer as prompt text accompanying the index, exactly
the way prior-feature learnings are carried today; **it changes no driver-side accounting
whatsoever.** The reviewer is instructed not to file a finding that re-opens an indexed
decision unless the finding is High severity and cites evidence that was not part of the
decision's own record. The observable is therefore the reviewer's own output: a cross-review
artifact that does not carry the discouraged finding, and counts that do not include it. The
driver continues to read the verdict line and its `high`/`medium`/`low` counts exactly as it
does today, applies the same convergence bar to them, and never inspects a decision id.

**G-3 (currency and fail-open safety).** An index that is stale or wrong is worse than none
(the proposal's own framing, §6 Gating). The index is therefore derived fresh at
dispatch-construction time from whatever decision records exist at that moment; if the source
is missing, unreadable, or fails to parse, dispatch construction falls back to today's
behavior — no index rendered, no never-re-litigate enforcement — and this is never a new halt
or a new operator-facing failure class.

**G-4 (measurable outcome — non-binding rationale, no acceptance criterion).** The intended
effect is that findings restating an indexed decision id without new evidence trend to zero
across a feature's review rounds. Its measurement source is the **committed `CROSS-REVIEW-*`
artifacts on the branch** — which exist on every round independently of any config flag — read
against the decision ids in `docs/_decisions/`. This is a retrospective, human-read outcome
measure for deciding whether to keep the experiment, in the spirit of the proposal's §5
Measurement plan. It deliberately carries no acceptance criterion: no gate, test, or phase
outcome depends on it.

## 3. Non-Goals

**NG-1** Front-loaded grilling (Phase G, proposal move M5 / R3-1) is out of scope. Its output —
a per-feature decision-ledger file produced by interrogating an approved REQ — is a different
mechanism from this REQ's index, which only renders decisions that already exist. A future
Phase G feature may become an additional *source* for this REQ's index; it is not a
prerequisite and this REQ does not depend on it.

**NG-2** The `CONTEXT.md` domain glossary (proposal move, R3-5) is out of scope; a glossary
entry is described in the proposal as "a decision like any other," but authoring the glossary
mechanism itself is a separate feature.

**NG-3** Size-tiered pipelines (R3-3) and the CR/DoD two-axis collapse (R3-4) are out of scope;
neither is a prerequisite for this REQ.

**NG-4** No change to any driver-side scoring or gate. Because G-2 is reviewer-side, **every
finding that reaches the driver is scored exactly as today**: the convergence bar, the
identity-triple finding dedupe of `DEC-LOOPECON-06`, the `review.derivativeStop` flat-round
test, erratum-item minting under `DEC-ERRROUTE-01`, the fail-closed read of a non-approving
confirmation carrying no parseable `FINDING:` line, untagged High findings failing closed, the
R4 POSTMORTEM halt, the structural-completeness probe, the DoD mutation floor, the wave gate
and the document oracles are all untouched. A finding the reviewer chooses not to file is
absent, not suppressed — there is no driver-side "discounted finding" state for any of these
mechanisms to disagree about. REQ-DECLEDGER-08 pins this claim as falsifiable.

**NG-5** No change to `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, or
`MAX_ERRATUM_FOLLOWUP_ROUNDS`.

**NG-6** No engine **runtime** changes under `pdlc/engine/`; the engine vendors
`pdlc/workflows/*.js` and picks up changes automatically at the next pack/publish, per repo
convention. This does **not** forbid the shipped per-block config-disclosure test precedent
(`pdlc/engine/__tests__/learnings-config-example.test.js`,
`pdlc/engine/__tests__/loop-config-example.test.js`): if this feature discloses its block in
`.claude/pdlc.config.example.json`, adding the matching engine-side disclosure test is in
scope and expected.

**NG-7** Whether wiring the decision index and never-re-litigate rule into reviewer-facing
prompt text requires editing a `SKILL.md` file (which would route through the consolidation
contract's `CONSOLIDATION-PROPOSAL` review, per `pdlc/OPERATIONS.md`) or can be delivered
entirely through dispatch-construction text the way learnings injection is today, is not
decided by this REQ; it is TSPEC-level design material (see Obligations, O-2).

## 4. Constraints

**C-1** Config keys follow the shipped per-key independent-fallback precedent
(`learningsInjection`, `cascade.pinCheck`, `review.derivativeStop`): one malformed key inside
the `decisionLedger` block never retunes the rest of the block or any other config block.

**C-2** The disabled path is byte-identical to the pre-feature baseline, verified against a
committed fixture baseline (not a same-branch before/after assertion) — mirrors the shipped
`learningsBaselineGuard.test.js` precedent named in `pdlc/OPERATIONS.md`. Which commit that
baseline is captured at, and how the pointer to it is pinned so a re-capture cannot silently
satisfy the check, is TSPEC material (O-4).

**C-3** The config block holds **exactly three keys**, spelled exactly `decisionLedger.enabled`,
`decisionLedger.maxEntries`, `decisionLedger.maxBytes`. This enumeration is exhaustive: a
fourth key does not satisfy this REQ's criteria, and no other spelling or nesting does.

**C-4** This REQ does not touch `MAX_REVIEW_ROUNDS` or `MAX_LIFETIME_ROUNDS` math (NG-5); a
decision blocked from re-opening under G-2 still consumes round budget exactly as an ordinary
finding would if it did clear the bar — G-2 changes whether a finding counts, not how rounds
are budgeted.

**C-5** Per the threshold-declaration obligation, the following thresholds are declared here,
not left to TSPEC to invent:

| Key | Default | Type | Config owner | Rationale |
|---|---|---|---|---|
| `decisionLedger.enabled` | `false` | boolean | operator, `.claude/pdlc.config.json` → `decisionLedger` | Tier 3 gating: off by default per proposal §6 |
| `decisionLedger.maxEntries` | `40` | positive integer | operator, `.claude/pdlc.config.json` → `decisionLedger` | Author default, chosen by analogy to the shipped `learningsInjection.maxDocuments` (5) budget, scaled up because a decision-index row is a single line, not a multi-paragraph document; open to operator veto before FSPEC authoring (see Assumptions) |
| `decisionLedger.maxBytes` | `8000` | positive integer | operator, `.claude/pdlc.config.json` → `decisionLedger` | Author default, chosen by analogy to the shipped `learningsInjection.maxBytesPerDocument` (6000) and `maxTotalBytes` (20000) budgets; open to operator veto before FSPEC authoring (see Assumptions) |

`maxBytes` bounds **the rendered index text alone** — the index block as it appears in the
prompt, not its contribution to total dispatch size, and not the underlying records. When the
in-scope decision set exceeds either bound, whole decision lines are omitted from that
dispatch's index rather than the dispatch being oversized or aborted, and a line is never
truncated mid-line; which lines are omitted is TSPEC material (O-1).

## 5. Acceptance Criteria

### REQ-DECLEDGER-01 Decision index rendered when enabled, sourced fresh at dispatch time (P0)

**Source:** US-01.

**Who:** review-loop driver, constructing a review dispatch.
**Given:** `decisionLedger.enabled` is `true`.
**When:** a dispatch prompt for a document under review is constructed.
**Then:** the dispatch prompt includes a rendered index with one line per decision in the
in-scope set defined in G-1 (every record under `docs/_decisions/` plus the feature's own
`DECISIONS-{feature}.md` if it exists — a derivable set, so the expected index is a set-equality
check, not containment), each line carrying the decision id, a one-line statement and a source
citation naming the record file and heading, and no other required field; the index reflects decision
records as they exist at dispatch-construction time, never a snapshot carried forward from an
earlier dispatch in the same round window (mirrors the already-shipped
`REQ-LOOPECON-01b` contract: recomputed at dispatch-construction time, never a mint-time
value rendered as current).

### REQ-DECLEDGER-02 Disabled path is byte-identical to today (P0)

**Source:** US-03.

**Who:** review-loop driver.
**Given:** `decisionLedger.enabled` is `false` (the default), absent, or malformed.
**When:** any dispatch prompt is constructed.
**Then:** the dispatch stream is byte-identical to the pre-feature baseline; no decision-index
text is ever rendered and the never-re-litigate rule (G-2) is never applied.

### REQ-DECLEDGER-03 Never-re-litigate gating requires citation and new evidence (P0)

**Source:** US-01.

**Who:** the reviewer authoring a cross-review (the rule is reviewer-side; the driver never
reads a decision id — see NG-4 and REQ-DECLEDGER-08).
**Given:** `decisionLedger.enabled` is `true`.
**When:** a review dispatch prompt is constructed.
**Then:** the prompt carries, adjacent to the index, rule text instructing the reviewer not to
file a finding that re-opens an indexed decision unless **both** hold: the finding is High
severity, and it cites evidence that was not part of that decision's own record. Whether
evidence is new is a reviewer judgement, deliberately not a machine predicate: no parser
compares citations. Boundary exemplars the rule text must make decidable for a reviewer — *in*
(clears the bar): a shipped behaviour that changed after the decision was recorded, cited at
the changed source. *Out* (does not clear it): the same source the decision already cites,
re-cited at a different line or a later commit with no behavioural change.

### REQ-DECLEDGER-04 Index construction fails open, never silently stale (P0)

**Source:** US-02.

**Who:** review-loop driver.
**Given:** `decisionLedger.enabled` is `true`; the decision-record source (`docs/_decisions/*`
and/or the feature's own decision records) is missing, unreadable, or fails to parse at
dispatch-construction time.
**When:** the dispatch prompt is constructed.
**Then:** where **every** source is unavailable, the driver falls back to the disabled behavior
of REQ-DECLEDGER-02 for that dispatch — no index rendered, no rule text. Where **one record of
several** is missing, unreadable or unparseable, that record's line is omitted and the
remaining lines are rendered: a decision absent from the index is one a reviewer may freely
challenge, which is the safe direction. Either way the fallback is never a
halt and never a new operator-facing failure class; it degrades exactly as
`learningsInjection`'s own fail-open path does today.

### REQ-DECLEDGER-05 Config keys fail open independently (P0)

**Source:** US-03.

**Who:** config loader.
**Given:** the `decisionLedger` block in `.claude/pdlc.config.json` has one wrong-typed or
malformed key among `enabled`, `maxEntries`, `maxBytes`.
**When:** config is parsed for a dispatch.
**Then:** only that key falls back to its declared default (C-5); the other keys in the
`decisionLedger` block, and every other config block, are unaffected. The block's key set is
exactly the three of C-3, so this is verifiable as set equality over the full enumeration
crossed with {wrong type, malformed, absent}, not containment — mirrors the shipped
`REQ-LOOPECON-08` precedent.

### REQ-DECLEDGER-06 Decision id is the reopening dedupe key across rounds (P1)

**Source:** US-01.

**Who:** review-loop driver.
**Given:** findings in two different rounds of the same document both name the same decision
id without meeting REQ-DECLEDGER-03's citation-and-new-evidence bar.
**When:** the second finding is accounted for.
**Then:** it is recognized as the same rejected reopening attempt as the first, not a fresh
question — the decision id is the dedupe key for this purpose, the same key the proposal
names for staleness re-filing dedup (§4(c)).

### REQ-DECLEDGER-07 Index size stays within declared bounds (P1)

**Source:** US-02.

**Who:** review-loop driver, constructing a review dispatch.
**Given:** `decisionLedger.enabled` is `true`; the full set of closed decisions relevant to a
dispatch exceeds `decisionLedger.maxEntries` rows or `decisionLedger.maxBytes` bytes.
**When:** the index for that dispatch is rendered.
**Then:** the rendered index never exceeds either bound; the dispatch is neither oversized nor
aborted on account of index size.

## 6. Risks

**R-1** An index that is stale or wrong is worse than none (proposal §6). Mitigated by G-3 /
REQ-DECLEDGER-04: construction is fresh at dispatch time and fails open rather than rendering
a potentially-stale index.

**R-2** The never-re-litigate rule could suppress a legitimately new concern that happens to
reuse a decision id in passing. Mitigated by REQ-DECLEDGER-03's requirement that both the
decision id be named *and* new evidence be cited — a finding that does not explicitly name the
id is unaffected and scored exactly as today; accidental id collision without an explicit
citation does not trigger the rule.

**R-3** Config-gated, default-off means zero pipeline-wide effect until an operator opts a
project in. This is by design (proposal §6 "one feature per experiment," Tier 3 experiment
discipline) and mirrors the shipped `cascade.pinCheck` / `review.derivativeStop` rollout
pattern from the loop-economics feature.

**R-4** The `maxEntries` / `maxBytes` defaults in C-5 are author defaults chosen by analogy,
not measured against this repo's own decision-record corpus (unlike, e.g., the REQ size
budget, which is a measured floor). Mitigated by explicitly labeling them vetoable in
Assumptions below, and by REQ-DECLEDGER-07 pinning the observable bound regardless of the
default's exact value.

## 7. Obligations / Open

**O-1** The selection rule for which decisions are omitted when the full set exceeds
`maxEntries` / `maxBytes` (REQ-DECLEDGER-07) is FSPEC/TSPEC material, not specified here.

**O-2** Whether wiring the decision index and never-re-litigate rule into reviewer-facing
dispatch text requires a `SKILL.md` edit (routing through the consolidation contract's
`CONSOLIDATION-PROPOSAL` review) or can be delivered entirely through dispatch-construction
text — the way `learningsInjection` is delivered today, with no `SKILL.md` edit — is a
TSPEC-level design choice (NG-7). Either path stays config-gated per C-1/C-2.

**O-3** How a decision id is minted and kept unique across `docs/_decisions/*` project-level
decisions and per-feature `DECISIONS-{feature}.md` records (which today use independently
chosen id namespaces, e.g. `DEC-TERM-01` vs. `DEC-LOOPECON-01`) is FSPEC/TSPEC material.

**Assumptions.** This REQ was authored in an orchestrated (non-interactive) dispatch; the
following choices are recorded as explicit, operator-vetoable assumptions rather than
open questions blocking authoring:
- **A-1** The `decisionLedger.maxEntries` (40) and `decisionLedger.maxBytes` (8000) defaults in
  C-5 are author defaults by analogy to the shipped `learningsInjection` budget, not measured
  against this repo's decision-record corpus. An operator may revise either default before
  FSPEC authoring without requiring a REQ revision round.
- **A-2** This feature targets the same repo-internal rollout posture as `pdlc-loop-economics`
  (config-gated, default off, one feature per experiment) rather than shipping ungated; Tier 3
  risk (Medium, per proposal §0) is read as requiring this posture, not merely permitting it.

## 8. Traceability

| User Story | Requirements |
|---|---|
| US-01 As a reviewer, I don't want to re-litigate a decision that's already closed unless there's a High-severity reason with new evidence, because re-opening a settled question without one burns a round for no substantive change | REQ-DECLEDGER-01, REQ-DECLEDGER-03, REQ-DECLEDGER-06 |
| US-02 As an operator, I need the decision index to never be silently stale, and never let a dispatch grow unbounded | REQ-DECLEDGER-04, REQ-DECLEDGER-07 |
| US-03 As an operator, I need this to be safe to enable per project, with the disabled path unchanged and every config key failing open independently | REQ-DECLEDGER-02, REQ-DECLEDGER-05 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

# Cross-Review: test-engineer — TSPEC (delta re-review, frozen round)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.2)
**Date:** 2026-08-30
**Iteration:** 13
**Scope:** Local (this artifact), DECISION FREEZE in force

## Overview

Delta re-review under DECISION FREEZE. Base for the delta is `54b17bf84` (TSPEC v1.1), the
bytes my v12 confirmation read; HEAD is `3a17387d6` (TSPEC v1.2). `git diff` on the document over
that range is +70/−10 across exactly three hunks:

1. **Revision-history header** — the v1.2 changelog entry (document lines 14–56).
2. **§4.3 Rendering (pure)** — the framing-budget paragraph gains the "only two of the four framing
   pieces are top-level constants" clarification (PM v12 F-03), lines ~897–915.
3. **§7.3** — *The size of the owned list, stated once* gains the decomposition nouns (my v12 F-01)
   and is split into a second paragraph that reconciles the single-siting claim (PM v12 F-02),
   lines ~1423–1444.

I re-read those three regions in full, re-derived §7.3's arithmetic against the operand rows at
HEAD, re-verified every repository citation the changed text makes, and checked the whole document
for sites that the new "this paragraph is the authority" rule would now contradict. I did not
re-review sections the edit did not touch.

## Architecture

No architectural surface changed in this delta. §4.3's edit is a *normative* statement about the
shipped shape of one already-specified function, not a new component: the header and trailer
sentinel lines ship as inline string literals inside `renderDecisionLedgerBlock`'s body rather than
as top-level bindings. That is internally consistent with the rest of the design rather than in
tension with it — a hoisted sentinel `const` would be a feature-declared top-level name absent from
`DECISION_LEDGER_OWNED_DECLS`, and §7.3's resolves-to-exactly-one / partition conjuncts (document
lines 1447–1448) are precisely what would redden on it. So the paragraph does not merely assert the
shape, it names the guard that enforces it, which is the reviewable form.

The census design is unchanged: declaration-anchored slicing cloned from
`pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` with the widened declaration regex, over
`DECISION_LEDGER_OWNED_DECLS`, minus the sentinel-bounded `main()` wiring run. I re-verified the
precedent still reads `const DECL_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/`
at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:61` — function-anchored, so the
widening requirement §7.3 states is still true of HEAD and still load-bearing.

## Interfaces

`renderDecisionLedgerBlock`'s signature (§4.3) is byte-unchanged by this delta: it still returns
exactly `""` on an empty `selected`, otherwise the block prefixed `"\n\n"` and closed by the
trailer with no trailing newline. The rendered-form fence above it is also unchanged, so the
`{DECISION_LEDGER_PREAMBLE}` / `{DECISION_LEDGER_RULE_TEXT}` placeholders the new prose points at
do exist in the block it cites, and the two sentinel lines it quotes verbatim
(`--- CLOSED DECISIONS (do not re-open without new evidence) ---`,
`--- END CLOSED DECISIONS ---`) are transcribed from that fence exactly — no drift between the
quoting prose and the quoted artifact, which is the failure mode this kind of inline quotation
usually introduces.

None of the symbols named in the changed regions exist in production yet, correctly:
`renderDecisionLedgerBlock`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT` and the three
census constants return no hits under `pdlc/workflows/`, which is what a pre-implementation TSPEC
should show. The *shipped* names §7.3 relies on for its "no `/Decision/i` name rule" argument all
still resolve at HEAD: `MERGE_MAX_DECISION_STEPS` (`pdlc/workflows/orchestrate-dev.js:88`),
`renderDecisionEntry` (`:4640`), `escalationDecision` (`:4738`), `erratumGateDecision` (`:6914`),
`parseDecisionsWarranted` (`:7037`). That argument is therefore still grounded after the edit.

## Data Model

The only data-model-adjacent claim in the delta is the owned-declaration partition, and it is now
stated with its nouns. I re-derived it from the operand rows at HEAD rather than from the paragraph:

- **Six functions** (§4.1–§4.4, *Scanned source* row, line 1448): `parseDecisionLedgerConfig`,
  `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`,
  `gatherDecisionCorpus`, `buildDecisionLedgerInjector`.
- **Eight top-level constants** (same row): `DECISION_CORPUS_ARGV` (§3.1), `DECISION_HEADING_RE`
  (§3.2), `DECISION_LEDGER_DEFAULTS` (§4.1), `DECISION_LEDGER_PREAMBLE` and
  `DECISION_LEDGER_RULE_TEXT` (§4.3), plus §5.2's three catalogues
  (`DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES`).

6 ∪ 8 = 14, matching the paragraph. The second, membership-different partition
(`DECISION_LEDGER_CENSUS_TOKENS`'s six data-carrying names ∪ `DECISION_LEDGER_CENSUS_EXEMPT`'s eight
plumbing declarations, *Forbidden token set* row, line 1447) also sums to fourteen and is now
explicitly named as the collision hazard inside the pin phrase itself. **My v12 F-01 is resolved**:
the phrase reads "six functions ∪ eight constants = fourteen", so a downstream citation of the bare
phrase now carries its own disambiguation and cannot be wired to the wrong operands.

The §4.3 edit does not move the count. The two sentinels are declared to ship as inline literals, so
they are not top-level declarations and correctly stay out of `DECISION_LEDGER_OWNED_DECLS`; the
fourteen-member enumeration in the operand row is byte-unchanged by this delta. The two partitions
remain disjoint and set-equal to the owned list, so the census's set-equality oracle still fails on
a deleted or added member — completeness by set equality, not containment, survives the edit.

## Test Strategy

**Nothing I approved is broken by this delta.**

- **The 1,200-byte framing pin stays falsifiable, and the edit makes it more so.** The paragraph now
  states explicitly that the pin "measures rendered output, not a constant count — it is a unit test
  over `renderDecisionLedgerBlock`'s emitted framing, so it stays honest however the sentinels are
  spelled in source." That is the right oracle placement: an assertion over the renderer's output
  cannot be defeated by hoisting or inlining a sentinel, whereas a summed-constants assertion could
  have been. The literal `1,200` is transcribed from the budget, not derived from the code under
  test, so there is no implementation echo. §3.6's dependent arithmetic (`12500 − 1200 = 11,300`,
  `6,305` project-level, `10,859 + 1,200 = 12,059`, `441` clearance) is untouched by the delta and
  still consistent with the paragraph.
- **The classify-or-redden guard is a positive mechanism, not an absence-only oracle.** §4.3's
  "hoisting either sentinel would introduce a feature-declared name absent from
  `DECISION_LEDGER_OWNED_DECLS`, which §7.3's classify-or-redden guard fires on" names the exact
  conjunct that reddens (partition set-equality plus resolves-to-exactly-one), not merely "the test
  would not pass".
- **The single-siting reconciliation improves testability rather than weakening it.** The prior
  claim ("stated nowhere else") was false on its face against the operand rows and the revision
  history; the new formulation distinguishes *authority* (this paragraph) from *enumeration* (the
  operand rows, which are what makes the count mechanically checkable) and *history* (the
  changelog), and gives an explicit precedence rule — "when this paragraph and an operand row
  disagree, this paragraph is right and the row is the defect". A reviewer or implementer now has a
  deterministic resolution rule instead of a claim that HEAD contradicts.
- **Traceability survives.** §7.6's AT-12 routing of the source census, §8.1's REQ-DECLEDGER-08 row,
  §7.2's sole-proof statement for `report.decisionLedger`, and §7.4's baseline pinning are all
  outside the three changed hunks and unmodified.

The one thing the delta gets factually wrong is bookkeeping, not test design — see F-01 below.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | §4.3's framing pin is a unit test over "emitted framing", but the renderer returns `""` for an empty `selected`, so the framing can only be measured on a non-empty render minus its decision lines. TSPEC altitude does not owe the extraction recipe, and PROPERTIES/PLAN can supply it — flagging only so the PROPERTIES author does not have to rediscover it. No change requested here. |

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.9)
**Date:** 2026-08-29
**Iteration:** 10 (delta confirmation on round 9's findings)

## Overview

**Upstream: unmoved, and re-checked rather than assumed.** I recomputed both digests at HEAD:
REQ `sha256:ce6b133f…3c7b7c`, FSPEC `sha256:2bd5c3ef…5aed39` — byte-identical to the pins the v0.9
changelog carries and to the ones round 9 approved against. `git diff cc2c09e53..HEAD` over both
upstream paths is empty. Nothing is absorbed, no pin advances, and the four corpus literals
(6,305 / 10,859 / 12,059 / 441) are unchanged, exactly as the changelog states.

**Scope of the round.** The delta is four commits — `1a2d78cba`, `4b28af44a`, `588f4323e`,
`5189b73fb` — +95 / −14 against `cc2c09e53`, the commit I last reviewed. The touched sections are
§5.4, §7, §7.2, §7.3 and the changelog, which is exactly the set the changelog claims; I diffed the
whole file to confirm no section outside that set moved. §§1–4, §6, §7.4–§7.7 are not re-litigated
here.

Both of round 9's blocking findings are landed, and landed by a *general* repair rather than by a
member-by-member exception — which is the harder and better of the two available fixes. The two
Highs are closed. What remains are two precision items on the new text and one placement question,
all non-gating.

## Architecture

The repair changes the shape of §7.3's second operand, so I re-derived it rather than reading it.

**The partition now closes arithmetically.** `DECISION_LEDGER_CENSUS_TOKENS` has six members;
`DECISION_LEDGER_CENSUS_EXEMPT` as enumerated has nine (`parseDecisionLedgerConfig`,
`buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`,
`DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`,
`DECISION_LEDGER_NOTICES`, `DECISION_LEDGER_CENSUS_TOKENS`). `DECISION_LEDGER_OWNED_DECLS` as
enumerated is six functions plus nine top-level constants = fifteen. 6 + 9 = 15, and the two
sub-sets share no member, so the stated partition is satisfiable — unlike v0.8's set equality
against "the module's exported decision-ledger symbol names", which was red by construction. The
six functions also reconcile: four of them sit in the token set, two in the exempt set.

**And the census itself is now satisfiable.** Round 9's failure was that four of six tokens occurred
in the scanned remainder on *correct* code. Under v0.9 every owned declaration's body is subtracted,
so a token's own declaration line and its uses by sibling declarations are all outside the
remainder. Re-running my v9 table against the new operand: `gatherDecisionCorpus` (its own body now
sliced), `DECISION_LEDGER_OMIT_REASONS` / `DECISION_LEDGER_CORPUS_OUTCOMES` (§5.2's catalogues now
sliced), and `recogniseDecisionRecords`'s mention inside `gatherDecisionCorpus` (that body now
sliced) all move out of the remainder. All six tokens can now read zero on a conforming
implementation. F-01 resolved.

The census also does not go vacuous in the process: the non-emptiness assertion per slice is kept,
and the exclusion cannot silently widen because every owned member must resolve to **exactly one**
top-level declaration at HEAD. The paragraph explaining *why* a `/Decision/i` name rule was rejected
is grounded — `MERGE_MAX_DECISION_STEPS` (`pdlc/workflows/orchestrate-dev.js:88`),
`renderDecisionEntry` (:4640), `escalationDecision` (:4738), `erratumGateDecision` (:6914) and
`parseDecisionsWarranted` (:7044) all exist at HEAD and would indeed have been wrongly excluded.

## Interfaces

Every seam the delta newly leans on, checked against HEAD rather than against the spec's prose:

| Claim in the delta | Verified at HEAD |
|---|---|
| §7.3's slicer is "`loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls`", boundaries from *all* top-level declarations | ✅ shape exists — `bodyOf` at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:123`, `allTopLevelDecls` at :63, and its own comment (:119–121) gives the same reason the spec gives: boundaries come from all declarations, not the census subset, so a sandwiched helper cannot be folded into a neighbour's body. ⚠️ but see F-01: its `DECL_RE` (:61) matches `function` declarations only |
| "`advisoryDisabled.test.js`'s `sourceExcludingParser` slicing `parseAdvisoryConfig`" | ✅ `pdlc/workflows/__tests__/advisoryDisabled.test.js:717`, applied at :740 |
| §7's per-file denominator is "**18,509** lines … the file measures at HEAD" | ✅ `wc -l pdlc/workflows/orchestrate-dev.js` = 18509 exactly. Round 9's F-04 (Low) closed with a transcribed, not remembered, figure |
| §7.2's conjunct 3: §7.4's recording "records one narrow case driving exported `reviewLoop` … never `report` keys" | ✅ §7.4's "Recorded stream, deliberately narrow" bullet: one case `REVIEW-LOOP-REVIEWER-PROMPTS`, driving exported `reviewLoop`, recording reviewer-prompt streams |
| "§7.4 expressly rejects a whole-`main()` recording *because* it would red on this feature's new report field" | ✅ §7.4, same bullet: "A whole-`main()` recording would red on this feature's own intended additions (the new notices, the new report field)". The delta's citation is the section's actual reasoning, not a paraphrase pushed further than the source |
| "no AT row's Notes column mentions `report.decisionLedger`" | ✅ §7.6 carries fourteen AT rows and not one mentions `decisionLedger` or the report field. PM F-02's premise holds, and so does the correction it produced |
| "PLAN T-10a already records that its `report.decisionLedger` assertion is the only one" | ✅ PLAN v0.5 T-10a (`PLAN-pdlc-decision-ledger.md:133`): "This is the home file for T-18's `report.decisionLedger` assertion, which had none" |
| Changelog: PLAN T-11 "transcribes the six-member set and states `decisionLedger`'s deliberate exclusion" | ✅ PLAN:134 transcribes exactly those six names and carries the exclusion rationale. Round 9's F-03 (Medium) is discharged downstream, as claimed |
| Round 9's F-05: v0.6 recital marked superseded | ✅ the v0.6 changelog entry now carries "(*superseded in v0.7*: §7.3 now pins the **10,859** index-byte figure … this v0.6 recital is history, not a live reading of the section)" |

One claim I checked because it is the load-bearing half of the fix rather than because it looked
doubtful: §7.3 asserts the owned-declaration list is frozen and each member "must resolve to exactly
one top-level declaration at HEAD". That is the guard that stops the exclusion silently widening,
and it is the right one — a rename would otherwise shrink the census invisibly, which is the failure
mode a source census exists to prevent.

## Data Model

Two things about the new operand lists are worth writing down, because they are what a future editor
will get wrong.

**Where the three lists live is not stated, and only one placement is consistent.** §7.3 requires
`DECISION_LEDGER_CENSUS_TOKENS` to be an owned declaration *inside the scanned source* — that is the
stated reason it must be sliced ("the token strings live inside its own declaration, so the census
would otherwise red on its own literal"), which only makes sense for a declaration in
`orchestrate-dev.js`. It says nothing about where `DECISION_LEDGER_CENSUS_EXEMPT` and
`DECISION_LEDGER_OWNED_DECLS` live. Working the cases:

| Placement | Consequence |
|---|---|
| All three in the module | `CENSUS_EXEMPT` and `OWNED_DECLS` are then declarations this feature introduces, so they belong in `OWNED_DECLS` and in the partition — they are in neither. Their declaration bodies transcribe four census-token names, and being unsliced those names land in the remainder. Census red on conforming code — round 9's defect, one level up |
| All three test-side | `CENSUS_TOKENS` is then not an owned declaration, so the owned list is fourteen while tokens ∪ exempt is fifteen. Partition red by construction |
| `CENSUS_TOKENS` in the module (as §7.3 states), the other two test-side | Both checks green: owned = 15 = 6 ∪ 9, disjoint; and the two test-side literals are outside the scanned source so their token strings are harmless. This is also the shipped precedent's shape — `FROZEN_CENSUS` and `ANCHOR_TOKENS` are test-file literals in `loopEconomicsAnchorGuard.test.js` |

So a satisfiable reading exists and is the natural one, which is why this is not a blocking finding.
But two of the three readings are red, and the document does not say which it means: one clause in
the operand row ("`DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS` are test-file
literals; only `DECISION_LEDGER_CENSUS_TOKENS` ships in the module") removes the ambiguity. F-03,
Low.

**The exempt list's reasons are per-member and checkable, not a blanket.** Each of the nine carries
its own justification, and the two I would have challenged are the two the spec pre-empts:
`DECISION_LEDGER_NOTICES` is exempt because generic driver code legitimately renders and counts
run-level notice ids — true of the shipped `LEARNINGS_NOTICES` analogue — and `DECISION_LEDGER_DEFAULTS`
because config defaults carry no record data. The partition therefore does what a set equality was
meant to do (a later symbol must be classified or the test reddens) without being red on arrival.

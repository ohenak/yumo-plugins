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

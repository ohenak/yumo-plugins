# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v1.0)
**Date:** 2026-08-29
**Iteration:** 11 (delta confirmation on round 10's routed items)

## Overview

**Upstream: unmoved, and re-measured rather than assumed.** I recomputed both digests at HEAD:
REQ `sha256:ce6b133f…3c7b7c`, FSPEC `sha256:2bd5c3ef…5aed39` — byte-identical to the dispatch pins
and to the ones round 10 approved against. The v1.0 changelog's claim that nothing is absorbed and
no pin advances is therefore true as written.

**The delta is genuinely minimal.** `git show 452d72c07` touches 44 lines across exactly two
regions — §7.3 and the changelog — which matches the commit's own "Sections touched" claim. I
checked the rest of the document is byte-unchanged, so the approved surface outside §7.3 stands.

All three routed items were one defect seen from two directions, and the edit resolves it at the
root rather than at each symptom. I confirm all three landed.

## Test Strategy

### Item-by-item against round 10

**Item 1 (te-review) — the owned-list membership was red by construction.** Landed. The new
*Where the three census constants live* paragraph (TSPEC:1324) states that
`DECISION_LEDGER_CENSUS_TOKENS`, `_CENSUS_EXEMPT` and `_OWNED_DECLS` are declarations of the census
test file, not of `orchestrate-dev.js`, and draws the consequence explicitly: a test-file constant
can never be a member of the owned list, and the census never scans the file the three are declared
in. That is the correct repair. The bogus rationale — "the token strings live inside its own
declaration, so the census would otherwise red on its own literal" — is gone from the Scanned source
row, which is right, because it only ever held if the constant were production code.

**Item 2 (se-author) — no module-surface section declared it.** Landed, and landed the honest way.
The edit did not manufacture a §4 or §5.2 declaration to satisfy the owned list; it removed the
member and explained why §3/§4/§5 legitimately do not declare it (those sections specify the
*shipped module surface*; these three are test operands). The `ANCHOR_TOKENS` precedent is cited
accurately — I confirmed `ANCHOR_TOKENS` is indeed a top-level constant of
`loopEconomicsAnchorGuard.test.js` rather than of the module that test scans.

**Item 3 (pm-review + te-review) — §5.2 lists only three catalogues.** Landed as a consequence of
the same repair. §5.2 is now correct without edit: it lists exactly the three frozen catalogues that
are module declarations, and the census constants are no longer claimed to be among them.

### The partition is now exact, and I re-derived it rather than trusting the prose

This was the item most at risk of being broken by the fix, since removing a member from the owned
list without removing it from the exempt list would have made the union under-cover. It is right:

| Set | Members | Count |
|---|---|---|
| `DECISION_LEDGER_CENSUS_TOKENS` | `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES` | 6 |
| `DECISION_LEDGER_CENSUS_EXEMPT` | `parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`, `DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, `DECISION_LEDGER_NOTICES` | 8 |
| **Union** | | **14** |

And the owned list, re-derived from the module-surface sections rather than from §7.3's own prose:
six functions (`parseDecisionLedgerConfig` :699, `recogniseDecisionRecords` :733, `selectDecisions`
:745, `renderDecisionLedgerBlock` :789, `gatherDecisionCorpus` :853, `buildDecisionLedgerInjector`
:861), five constants (`DECISION_CORPUS_ARGV` §3.1, `DECISION_HEADING_RE` §3.2,
`DECISION_LEDGER_DEFAULTS` §4.1, `DECISION_LEDGER_PREAMBLE` and `DECISION_LEDGER_RULE_TEXT` §4.3)
and §5.2's three catalogues = **14**. Union equals owned list, the two sub-sets are disjoint, and
every member now resolves to a real module-surface declaration. Both honesty conjuncts —
resolves-to-exactly-one and non-empty-slice — are satisfiable for the first time.

I also checked §4.5 introduces no top-level declaration the owned list would be missing:
`_injectDecisionLedger` is a `reviewLoop` parameter, `ledgerBlock` is a local inside `reviewLoop`
and a `reviewerPrompt` parameter, and `reviewerPrompt` is a shipped function being modified, not
introduced. So "every declaration this feature introduces" is genuinely exhaustive at 14.

### The census is now self-consistent as an executable test

The scanned source is `orchestrate-dev.js` alone; the three operand constants live in
`decisionLedgerCensus.test.js`; so the census cannot red on its own literals, and it needs no
exception to avoid doing so. That is a strictly better construction than the v0.9 exception it
replaces, because the exception was itself the thing that made the owned list dishonest.
§7.3's closing paragraph at :1372 remains consistent under the new framing — `decisionLedger` is
absent from the owned list because it is a field, not a declaration, which is now the same kind of
reason the census constants are absent (not module declarations).

### One implementability item the fix has made sharper, not resolved

Round 10 raised this as a Medium and it is still open. §7.3 cites `loopEconomicsAnchorGuard.test.js`'s
`bodyOf` over `allTopLevelDecls` as the slicer. I read that file: `DECL_RE` at :61 is
`/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/` — it matches `function` declarations
only and cannot match a `const`. Eight of the fourteen owned members are top-level `const`
declarations. Cloned as cited, `bodyOf` finds no entry for any of the eight, and §7.3's own
"assert each slice is non-empty before counting" conjunct reds for all eight.

The delta has made this *more* load-bearing, not less: with `DECISION_LEDGER_CENSUS_TOKENS` gone the
owned list is wholly module declarations, and the const-to-function ratio moved from 9-of-15 to
8-of-14 — still a majority. The spec's own rule ("the next top-level declaration of **any name**")
is the right rule; it is the cited implementation that cannot deliver it. One clause widening the
declaration regex to cover `const` would close it.

## Open Questions

None newly opened. The edit re-litigates no approved decision and re-opens no product question,
as its changelog claims.

## Positive Observations

- **The right diagnosis was adopted over the expedient one.** The available shortcut was to invent a
  §5.2 row for `DECISION_LEDGER_CENSUS_TOKENS` and declare the honesty conjuncts satisfied. That
  would have put a test operand into the shipped module surface and left the census reading a file
  containing its own token literals. Homing the constant where it actually belongs is the repair
  that makes the test *executable*, not merely the one that makes the sentence consistent.
- **The partition was maintained, not just the membership.** Removing a member from the owned list
  is the easy half; noticing that the exempt list had to lose it too, so the union still covers
  exactly, is the half that keeps the companion assertion green. The closing sentence stating the
  census constants are absent from *both* sub-sets, and why, is precisely the note a future editor
  needs before adding a symbol.
- **The changelog entry is auditable.** It names the three routed items, states which diagnosis was
  adopted and why the alternatives were rejected, enumerates the three edits, and re-measures
  upstream. I could check every claim in it against the diff, and all held.
- **The precedent citation is real.** `ANCHOR_TOKENS`' location in the precedent test file is as
  described — this document has consistently cited checkable precedent rather than plausible-sounding
  precedent, which is why these rounds converge.

## Recommendation

**Approved with minor changes**

All three routed items are resolved, the partition arithmetic is exact and disjoint over a
fourteen-member owned list whose every member resolves to a real module declaration, and no
approved section outside §7.3 was touched. The TSPEC is sound as a basis for implementation.

Two non-gating items travel onward rather than blocking this document: the `DECL_RE`/`const`
slicer clause carried over from round 10, and a PLAN re-pin that this delta has now made necessary —
PLAN v0.7 still encodes the six/nine/fifteen counts and states that `DECISION_LEDGER_CENSUS_TOKENS`
is production, declared by T-18 in `orchestrate-dev.js`. Left unre-pinned, T-18's implementer would
rebuild exactly the red-by-construction census this erratum removed. Neither belongs to the TSPEC's
own loop, which is why neither is a High here.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | PLAN v0.7 now contradicts TSPEC v1.0 on the census constants' home and counts; T-18 would reinstate the removed defect | §7.3 ↔ PLAN v0.7 DoD / T-18 |
| F-02 | Medium | inherited | local | Cited slicer `DECL_RE` matches `function` only; 8 of 14 owned members are `const`, so the non-empty-slice conjunct reds | §7.3, Scanned source operand row |
| F-03 | Low | inherited | local | Owned list cites "§4.1/§4.2/§4.4's six functions" but `renderDecisionLedgerBlock` is declared in §4.3 | §7.3, Scanned source operand row |

FINDING: Medium | delta | nonlocal | §7.3 ↔ PLAN v0.7 DoD and the T-18 file-ownership row | This delta moved `DECISION_LEDGER_CENSUS_TOKENS` into the test file and shrank the owned list to fourteen, but PLAN v0.7 still states the partition as six ∪ **nine** = **fifteen**, still asserts "`DECISION_LEDGER_CENSUS_TOKENS` is **production**, declared by T-18", and still assigns that declaration to `orchestrate-dev.js` in the T-18 file-ownership row; unre-pinned, T-18's implementer rebuilds the red-by-construction census this erratum just removed — re-pin PLAN to TSPEC v1.0 in the cascade that follows this approval.
FINDING: Medium | inherited | local | §7.3, Scanned source operand row, cited `bodyOf`/`allTopLevelDecls` slicer | The cited `loopEconomicsAnchorGuard.test.js` slicer's `DECL_RE` at :61 resolves `function` declarations only and cannot match a `const`, while eight of the now-fourteen owned members are top-level `const` declarations, so §7.3's own "each slice non-empty before counting" conjunct reds for all eight when the citation is cloned as written; add a clause widening the declaration regex to `const` (raised in round 10, unaddressed by this edit).
FINDING: Low | inherited | local | §7.3, Scanned source operand row, owned-list citation | The owned declaration list is cited as "§4.1/§4.2/§4.4's six functions", but `renderDecisionLedgerBlock` is declared in §4.3 (TSPEC:789), so one of the six functions is attributed to a section that does not declare it (raised in round 10, unaddressed by this edit).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

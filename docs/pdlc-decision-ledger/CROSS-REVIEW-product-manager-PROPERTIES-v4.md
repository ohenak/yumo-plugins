# Cross-Review: product-manager — PROPERTIES (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-08-29
**Iteration:** 4 (delta re-review of the v1.2 revision answering `CROSS-REVIEW-product-manager-PROPERTIES-v3.md`)

## Overview

**Question answered:** did the v1.2 edit land the three High findings and the two Medium/one Low of
round 3, and did landing them break anything?

**Yes to the first; one Medium and one Low newly surface, neither gating.** The revision is
`e45a55347..HEAD` over five commits (`5f44e3609`, `c3712936a`, `ffdb63940`, `70dd03cbc`,
`9b96b15c9`). It is confined to the INV, WIRE and OFF families, the Coverage Matrix arithmetic, the
module manifest, §FX-BASELINE's referent note and §Gaps. No fixture literal, no corpus digest, no
acceptance criterion and no `REQ`/`FSPEC` scope moved — I re-diffed the four corpus literals
(6,305 / 10,859 / 12,059 / 441) and they are untouched, as the v1.2 changelog claims.

**Scope of this pass.** Round 3's six findings, then the changed sections only. Unchanged families
(CFG, REC, REND, TEXT, BND, FAIL, PRE, DISC) were approved at round 1 and are not re-litigated.

## Prior findings — disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | PROP-INV-06 (`PROPERTIES`:407) now subtracts the body of **every** member of `DECISION_LEDGER_OWNED_DECLS` — "fourteen at `TSPEC` v1.0, the six functions plus the eight top-level constants" — sliced declaration-line-to-next-top-level-declaration over *all* top-level declarations, and states brace-matching is **not** the mechanism because it cannot slice a constant. That is a faithful transcription of `TSPEC`:1337, whose owned list is the six §4.1/§4.2/§4.4 functions plus `DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT` and §5.2's three catalogues = 6 + 8 = 14. The cited precedent is real: `loopEconomicsAnchorGuard.test.js:63` builds `allTopLevelDecls` and `:123–127` slices `bodyOf` against it. |
| F-02 | High | **Resolved** | PROP-INV-07 (`PROPERTIES`:408) now asserts the partition `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` = `OWNED_DECLS`, disjoint, both directions, and names export set-equality as the form `TSPEC` §7.3 rejects — matching `TSPEC`:1336 verbatim in substance ("Not set equality against *all* the module's decision-ledger exports — that comparison is red by construction"). |
| F-03 | High | **Resolved** | PROP-WIRE-12 (`PROPERTIES`:348) is new and carries §7.2's conjunct 3 whole: the paired flag-off/flag-on `main()` runs driven **inside the arm**, symmetric difference of the two returned `report` key sets exactly `{decisionLedger}`, set equality **in both directions**, notice set set-equal to empty. Compare `TSPEC`:1170–1176 — the three moving parts I flagged as unasserted (paired-run referent, symmetric difference, both-directions) are each now on the property. PROP-OFF-05 (`:362`) correctly retires its FX-BASELINE referent for both `report` keys and notices, and §FX-BASELINE (`:791–793`) gained the matching non-referent note. |
| F-04 | Medium | **Resolved** | PROP-INV-11 (`PROPERTIES`:413) asserts each owned member resolves to **exactly one** top-level declaration at HEAD as a count of `1`, so zero- and two-resolution both fail — `TSPEC`:1337's red-on-rename conjunct, and the count form is what makes it catch the zero case PROP-INV-08 cannot. |
| F-05 | Medium | **Resolved** | PROP-INV-09 (`:410`) now routes the field's behavioural obligation to exactly two homes, both inside §7.2's live arm, both carried by PROP-WIRE-12, and records that the AT rows are not a home — matching `TSPEC`:1373–1379. |
| F-06 | Low | **Resolved** | The INV rationale paragraph (`:416–427`) drops "both set-equality-checked", re-grounds each operand on its own conjunct (PROP-INV-07's partition; PROP-INV-11 + PROP-INV-08), and records the three census constants' test-file home. |

The two round-3 questions are also answered: Q-01 by the new module-manifest paragraph
(`:889–906`), Q-02 by PROP-WIRE-12's referent split.

## New observations in the changed sections

**Arithmetic checks out.** INV 10 → 11, WIRE 11 → 12; the partition
`10 + 11 + 9 + 6 + 12 + 11 + 5 + 11 + 12 + 6 + 10` sums to **103** as claimed, and the pyramid
restatement `36 + 12 + 39 + 6 + 10 = 103` holds with integration recomputed as FAIL 11 + PRE 5 +
INV 11 + WIRE 12 = 39. Property ids are contiguous with no gaps or duplicates
(PROP-INV-01…11, PROP-WIRE-01…12), the family table and module manifest rows were both re-pinned
(`PROP-INV-06…11`, `PROP-WIRE-01…12`), and no stale `101`/`37` reading survives outside the
changelog's own before→after prose.

**The named test modules are real PLAN artifacts, and ownership is unchanged.** PROP-WIRE-12 lands
in `decisionLedgerMain.test.js`, owned by T-10a (`PLAN`:206) with T-18 un-skipping (`PLAN`:220);
PROP-INV-11 lands in `decisionLedgerCensus.test.js`, owned by T-11 (`PLAN`:207). Both are `[new]`
modules explicitly planned in `PLAN`'s batch table, so nothing here asks for a file no task creates,
and the "all 24 task ids traced in both directions" claim is unaffected by the two new properties.

**Test-quality bars are met by both new properties.** PROP-WIRE-12's expected delta is the literal
`{decisionLedger}` transcribed from `TSPEC`:1170, not a value derived from the code under test, and
its both-directions set equality is exactly the completeness form (a dropped key fails, not only an
added one). PROP-OFF-05's former absence-shaped conjunct ("free of `NTC-DECLEDGER-*`") is now a
positive set-equality to empty. PROP-INV-11's count-of-`1` is likewise positive rather than a
"not renamed" negative.

**One un-routed upstream contradiction remains (F-07, Medium).** §Gaps now routes the census-constant
divergence as a second `ERRATUM: PLAN` item and is right to — `PLAN`:19/152/207/219/490–495 do state
`DECISION_LEDGER_CENSUS_TOKENS` as production and the owned list as fifteen, against `TSPEC`
v1.0:1324's test-file home and fourteen. But the *same* PLAN task row carries a second divergence this
document silently corrected without routing: `PLAN` T-10a (`PLAN`:151) still instructs
"`notices` is **set-equal** to the baseline notices array" and "`report`'s key set is **set-equal**
to the flag-off key set", which is precisely the retired FX-BASELINE referent PROP-OFF-05 and
PROP-WIRE-12 now reject as non-existent. An implementer writing T-10a from `PLAN` writes the
unimplementable oracle; this document knows why it is unimplementable and does not say so in §Gaps.

**One citation slip (F-08, Low).** PROP-INV-09 attributes the AT map to "`FSPEC` §7.6". §7.6 is a
**TSPEC** section (`TSPEC`:1549, "Coverage of the FSPEC's acceptance tests"); `FSPEC`'s acceptance
tests are its §6 and its §7 is Open Questions (`FSPEC`:344, `:512`). The substance is correct — no
AT row's Notes column mentions `report.decisionLedger` (`TSPEC`:1553–1560) — only the document name
is wrong, and PROP-WIRE-12 one section earlier says "no `FSPEC` AT row" for the same fact.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-WIRE-12 and PROP-OFF-05 both assert the flag-off notice set is set-equal to empty. That is deliberate (each is anchored in a different `TSPEC` conjunct and a different test module) and costs one duplicated assertion, but should PROP-OFF-05's copy cite PROP-WIRE-12 as its live-arm twin so a future editor deleting one knows the other exists? |

## Positive Observations

- **The revision is precisely scoped.** Every changed byte traces to a round-3 finding or to the
  arithmetic those findings moved. No unrelated family was touched, no fixture literal re-derived,
  and no acceptance criterion narrowed — the cheap kind of cascade repair.
- **PROP-WIRE-12 is the right shape for a DC-07 obligation.** It names the arm the field's sole
  proof, says so explicitly, and makes deletion of the arm visibly a spec change rather than a
  silent loss of coverage. That is the failure mode the pipeline has been burned by before, closed
  at property level rather than left to reviewer memory.
- **The census constants' home is now recorded where a reader will hit it.** The module manifest
  paragraph explains why PROP-INV-07's partition is coherent only under the test-file home, and why
  T-11 → T-18's red→green edge is ordinary rather than red-by-construction — answering round 3's
  Q-01 with the reasoning, not just the fact.
- **The document routes rather than adjudicates the `PLAN` conflict.** Re-pinning to the deeper
  upstream and raising an erratum is the correct move for a document that owns neither task row.

## Recommendation

**Approved with minor changes**

No High findings: all three round-3 Highs are landed and faithfully transcribed against `TSPEC`
v1.0. Two non-gating items for the next touch of this document:

1. **F-07 (Medium)** — add `PLAN` T-10a's baseline-notices / flag-off-key-set referent to the
   §Gaps routed item, so both halves of the `PLAN`↔`TSPEC` divergence reach `PLAN`'s author.
2. **F-08 (Low)** — change PROP-INV-09's "`FSPEC` §7.6" to "`TSPEC` §7.6".

`REQ` BR-11 / NG-4, `REQ` C-2 and `REQ` NG-5 are untouched by this revision; product scope is
unchanged.

## Delta-Confirmation Findings

Both findings are **delta** (the v1.2 edit introduced the text carrying them) and **local** (they sit
inside sections this round changed: §Gaps' routed-items block and PROP-INV-09).

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-07 | Medium | delta | local | §Gaps routes only the census-constant half of the `PLAN` v0.7 ↔ `TSPEC` v1.0 divergence. `PLAN` T-10a (`PLAN`:151) also still names FX-BASELINE's "baseline notices array" and an unqualified "flag-off key set" as conjunct-3 referents — the referents PROP-OFF-05 and PROP-WIRE-12 retire in this same revision as non-existent. The document corrects the substance without routing it, so `PLAN`'s author is never told, and an implementer working T-10a from `PLAN` writes the unimplementable oracle. Add the second half to the routed item. | §Gaps, Risks and Routed Items — routed upstream |
| F-08 | Low | delta | local | PROP-INV-09's new text attributes the AT map to "`FSPEC` §7.6". §7.6 is `TSPEC`'s (`TSPEC`:1549); `FSPEC`'s acceptance tests are §6 and its §7 is Open Questions. The substance is right; the document name is not, and PROP-WIRE-12 states the same fact one section earlier as "no `FSPEC` AT row". | §Properties, INV family, PROP-INV-09 |

FINDING: Medium | delta | local | §Gaps, Risks and Routed Items — routed upstream | §Gaps routes only the census-constant half of the PLAN v0.7 ↔ TSPEC v1.0 divergence; PLAN T-10a (PLAN:151) still names FX-BASELINE's baseline notices array and an unqualified flag-off key set as conjunct-3 referents, which this same revision retires as non-existent in PROP-OFF-05 and PROP-WIRE-12, so PLAN's author is never told and a T-10a implementer writes the unimplementable oracle

FINDING: Low | delta | local | §Properties, INV family, PROP-INV-09 | PROP-INV-09 attributes the AT map to FSPEC §7.6, but §7.6 is TSPEC's (TSPEC:1549) and FSPEC's acceptance tests are its §6; the substance (no AT row asserts report.decisionLedger) is correct, only the document name is wrong

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

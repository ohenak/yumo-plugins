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

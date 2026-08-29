# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.1)
**Date:** 2026-08-29
**Iteration:** 12 (delta confirmation on a previously approved document)

## Scope of this round

Delta confirmation only. The erratum edit touches §7.3 and the revision-history changelog and
nothing else (`git diff 24ec69288..HEAD` on the TSPEC: +54/−3, two changed hunks). I re-read the
TSPEC at HEAD, re-derived §7.3's arithmetic against §3.1, §3.2, §4.1–§4.4 and §5.2, and checked the
cited precedent in the repository. I did not re-review sections the edit did not touch.

## Routed items

**Routed item 1 (se-review) — re-pin the test-file home and the six ∪ eight = fourteen partition.**
Landed. §7.3 now carries *The size of the owned list, stated once*, which states
`DECISION_LEDGER_OWNED_DECLS` has **fourteen** members, declares that paragraph the sole home of the
count in this document, and states the correction direction explicitly: a downstream fifteen-member
owned list, or a production home in `orchestrate-dev.js` for any of the three census constants, is
stale against this section and is corrected downstream-to-here. The pre-existing *Where the three
census constants live* paragraph (unchanged by this edit) still homes the three in the census test
file, and the new paragraph is consistent with it rather than restating it.

**Routed item 2 (te-author) — the downstream fifteen-member list and the production home for
`DECISION_LEDGER_CENSUS_TOKENS`.** Landed at this document's altitude. Both halves of the
contradiction are named in the changelog and adjudicated in §7.3; the PLAN-side corrections (T-11,
T-18, the ownership-manifest rows and the Definition-of-Done bullet) belong to the owning downstream
phase and are out of scope for a TSPEC confirmation.

## Arithmetic re-derived (I did not trust the prose)

| Operand | Members counted at HEAD | Result |
|---|---|---|
| §4.1–§4.4 functions | `parseDecisionLedgerConfig`, `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock` (§4.3), `gatherDecisionCorpus`, `buildDecisionLedgerInjector` | 6 |
| Top-level constants | `DECISION_CORPUS_ARGV` (§3.1), `DECISION_HEADING_RE` (§3.2), `DECISION_LEDGER_DEFAULTS` (§4.1), `DECISION_LEDGER_PREAMBLE` + `DECISION_LEDGER_RULE_TEXT` (§4.3), §5.2's three catalogues | 8 |
| `DECISION_LEDGER_CENSUS_TOKENS` | six data-carrying names | 6 |
| `DECISION_LEDGER_CENSUS_EXEMPT` | eight plumbing declarations, each with a stated reason | 8 |

§5.2 does declare exactly three catalogues (`DECISION_LEDGER_OMIT_REASONS`,
`DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES`), so 6 + 8 = 14 holds on both
decompositions and the partition `TOKENS ∪ EXEMPT = OWNED_DECLS` remains an exact, disjoint set
equality over a fourteen-member list. No other site in the document restates the count: the only
other occurrences of "fourteen" are the two changelog entries describing this edit and an unrelated
failure-row count at line 1119; "fifteen" appears only in the changelog and in the pin paragraph,
both times as the thing being retired.

## Falsifiability of the new regex requirement

The edit's other substantive clause — the cloned declaration regex must recognise top-level `const`
and `let` bindings, not only `function` — is correct and correctly grounded. The precedent's
`DECL_RE` at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:61` is
`/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/`, i.e. function-only, and eight of the
fourteen owned declarations are `const`s, so a verbatim clone would leave each catalogue's body in
the scanned remainder and red the census on its own literals. The oracle the section names is
genuinely falsifiable rather than a comment: a member the regex cannot see resolves to zero
declarations, so the resolves-to-exactly-one conjunct reddens, and the non-empty-slice conjunct
catches a slice that collapses. This is a positive mechanism assertion, not an absence-only oracle.

## Nothing approved was broken

Traceability survives the edit: §7.6 still routes the source census through AT-12, and §8.1's
REQ-DECLEDGER-08 row still cites §7.3's source census alongside the AT-16 replay. The four corpus
literals (6,305 / 10,859 / 12,059 / 441) are untouched, upstream pins are unmoved (REQ v1.9
`sha256:ce6b133f…`, FSPEC v1.3 `sha256:2bd5c3ef…`), and no approved decision is re-litigated.

## Findings

One Low, non-gating: see the tagged section below.

## Questions

None.

## Positive Observations

- Single-siting the count and stating the correction direction is the right shape for an erratum
  whose failure mode was a count restated at seven sites — it makes the next drift a one-row edit.
- The regex-widening clause explains *why* the conjuncts catch the miss, so an implementer who
  clones the precedent has a red test rather than a silently widened census.
- The `renderDecisionLedgerBlock` §4.3-not-§4.4 correction is made inline in the row itself, so the
  mis-citation cannot be quietly reintroduced by a later copy-edit.

## Recommendation

**Approved with minor changes**

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | The pinned phrase "six ∪ eight = fourteen" names the functions-plus-constants decomposition, but §7.3's *Forbidden token set* row asserts a numerically identical but membership-different partition (`CENSUS_TOKENS` 6 ∪ `CENSUS_EXEMPT` 8). The pin paragraph glosses its own meaning, so it is unambiguous in place; the hazard is downstream citation, since the whole point of the paragraph is that other documents cite the phrase rather than restate it, and the phrase alone does not say which decomposition it is. Suggest the pin read "six functions ∪ eight constants = fourteen" so a citation carries its own disambiguation and cannot be wired into the wrong test operands. | §7.3, *The size of the owned list, stated once* |

FINDING: Low | delta | local | §7.3 "The size of the owned list, stated once" | The pinned phrase "six ∪ eight = fourteen" is numerically identical to §7.3's other partition (CENSUS_TOKENS 6 ∪ CENSUS_EXEMPT 8) but has different membership; glossed in place, but a downstream citation of the bare phrase could be wired into the wrong test operands — suggest "six functions ∪ eight constants = fourteen".

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

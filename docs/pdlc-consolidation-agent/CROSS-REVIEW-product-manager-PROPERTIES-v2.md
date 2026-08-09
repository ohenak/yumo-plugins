# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.1, 2026-08-09)
**Date:** 2026-08-09
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review against v1 (`CROSS-REVIEW-product-manager-PROPERTIES-v1.md`) over `git diff fa41e080..HEAD` on the document (344 insertions, 186 deletions).

## Prior findings — disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 mis-keyed `AC-…`/`NFR-…` citations throughout §12.1 | High | **Resolved** | §12.1 re-keyed row by row against REQ v2.1 §3/§4. Checked all 31 obligation labels against the REQ definitions (`REQ:161` AC-1.1 cadence, `:170` AC-1.2 volume, `:174` AC-1.3 marker, `:215` AC-1.4 no-op, `:239` AC-2.4 log record, `:267` AC-3.4 URL in both carriers, `:271` AC-3.5 fallback, `:285` AC-3.6 PR-only from `consolidation/{passId}`, `:341`/`:349` AC-4.2/4.3, `:452` AC-5.4, `:518`–`:546` NFR-1…NFR-5). Every label now matches its REQ sentence; the marker family reads AC-1.3, not AC-1.4. |
| F-02 §12.2/§12.3 mapping contradicts the per-property trailers | High | **Resolved in substance** | PROP-COR-11 now sits in `consolidationPass.test.js`/T20 in both the trailer (`:374`) and §12.2/§12.3; PROP-COR-07/08/12/13 are the hook-parity set in both places (`:405`, `:433`, `:438`); PROP-COR-09/10 are pass-level (`:360`, `:367`); PROP-PASS-07's trailer (`:1333`) and §12.2 both say `consolidationRung.test.js`/T06. Every file named in §12.2 matches PLAN §5's ownership manifest for its RED owner. One residue survives as F-06 below. |
| F-03 AC-1.4's positive obligation had no property | Medium | **Resolved** | PROP-PASS-11 (`:1293-1312`) asserts `no-op` positively on two Givens and pins the streak behaviour to consumed-set emptiness rather than to the label — the AC-5.5 half REQ warns about. |
| F-04 four AC conjuncts with no property | Medium | **Resolved, all four** | (a) PROP-PR-09 (`:1030`) asserts URL *string equality* across both AC-3.4 carriers; (b) PROP-PR-10 (`:1045`) adds the surviving-ref observation AC-3.6's "not deleted by the pass" needs and states why PROP-PR-05's verb bound cannot substitute; (c) PROP-PR-11 (`:1058`) pins the `PDLC-CONSOLIDATION-PASS` trailer set-equally — verified against `docs/_constraints/pdlc-consolidation-vocabularies.md` §4, whose PR-body table carries exactly those three `PDLC-CONSOLIDATION-*` names; (d) PROP-RPT-09 (`:1143`) asserts `consumed:` set-equal to the NFR-5 block and `deferred:` present and non-empty, with the explicitly-empty paired negative. |
| F-05 §12.4 filed `PROP-CFG-*` under AT-P | Low | **Resolved** | §12.4's AT-N row now names PROP-CFG-01, PROP-CFG-03, PROP-RPT-06, PROP-RPT-07, with the reason stated (`:1697-1699`); PROP-CFG-02 is accounted for in the "no register id" list under REQ §4a. |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-06 | Medium | Local | **T25 is named as a green un-skipper for three properties in a file T25 does not own.** PROP-COR-10 (`:367`) and PROP-COR-11 (`:374`) carry `T20 → T25/T31`, and PROP-CFG-03 (`:463-464`) carries `T24/T20 → T25/T31` — all three live (in part) in `consolidationPass.test.js`. PLAN §5's ownership manifest gives T25 exactly `consolidationPredicate.test.js`, `consolidationHookParity.test.js`, `consolidationProperties.test.js` (PLAN `:328`), and PLAN §4's T25 row says in terms that it "un-skips T14's block, T04's `T25 — AT-P7` and `T25 — pathspec semantics` blocks, and T19's `T25` property blocks" (PLAN `:281`) — nothing in a pass-level file. §12.2's `consolidationPass.test.js` row inherits the error (Green: `T25, T28, T31`), as does §12.3's `T20 → T25/T28/T31`. Since T31 also appears, no property is stranded permanently red — which is why this is not the v1 High — but §12.2's own stated derivation ("Red owner and green owners are read from PLAN §4's task table") is false for this row, and a T25 implementer following it would edit a file outside its pathspec, whose changes the wave commit drops. Internal inconsistency travels with it: PROP-CFG-03's trailer names T25 while §12.2's `consolidationReport.test.js` row names T29/T31 for the same property. Fix: drop T25 from those three trailers and from the two §12 rows, leaving T28/T31 (and T29/T31 for the report half). | PLAN §4 T25, §5 manifest; AC-1.1, AC-2.4, AC-3.5 |
| F-07 | Low | Local | **§12.1's AC-1.1 row claims the whole `PROP-COR-01…13` range as trigger coverage.** PROP-COR-12 and PROP-COR-13 (`:433`, `:438`) are the pre-widening fixture and its validity pin for the L4 differential; their own trailers cite `(no FSPEC AT), TSPEC §7.1` and no AC-1.1 obligation. Listing them under AC-1.1 makes the cadence trigger look better covered than the two-direction read supports. The row is right about PROP-COR-01…11; name that range, or say explicitly that 12/13 are the differential's fixture scaffolding. | AC-1.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §13.1's AC-3.4 gap row and §13.3 erratum 4 together say the happy-path conjunct is vacuous and route the reconciliation to REQ. If REQ comes back with "in each carrier that exists", does PROP-PR-09 change at all, or does the `promoted-degraded` Given already discharge the reconciled wording as written? Worth one sentence in the row so the erratum's landing does not silently reopen the property. |
| Q-02 | The count claim moved to **114** (`:87`). I re-derived it: 118 distinct `PROP-*` ids appear in the document, minus the four §5.1 retirements (PROP-TRG-01/02/04/05), which lands exactly on 114. Is the retired-id set expected to stay visible in the ids the traceability parser sweeps (PROP-TRC-01), or will their appearance in §5.1's retirement table need an exclusion rule when that property runs? |

## Positive Observations

- **The re-key was done as a re-read, not a patch.** Every one of §12.1's obligation labels now paraphrases its REQ sentence closely enough to check by eye against `REQ:161-546`, which is what makes the two-direction claim auditable by the next reviewer rather than taken on trust.
- **The four new properties answer the exact product gaps, and each states why the existing property could not carry the obligation.** PROP-PR-10's "containment alone is satisfied by a pass that never created a branch" and PROP-RPT-09's "both fields are in PROP-RPT-04's free-form class, excluded by name" are the reasoning I was hoping to see — they show the gap was understood, not just filled.
- **PROP-PASS-11 splits the two `no-op` causes instead of pooling them.** Keying the streaks on consumed-set emptiness rather than on the `no-op` label is precisely AC-5.5's intent, and the property names the single-fixture version that would pass falsely.
- **Grounding was re-measured for the changed rows, not inherited.** Spot-checked at HEAD: the hook's `THRESHOLD = 5` at `:25`, glob `:28`, early exit `:29-30`, predicate `:41`, guarded message `:43-48` all match §1's table, and the three PR-body trailers PROP-PR-11 pins are exactly the three in `pdlc-consolidation-vocabularies.md` §4.
- **The §5.1 retirements make the document smaller and truer.** Retiring PROP-TRG-01/02/04/05 into their L2 homes with a table saying why each was a collision rather than a layer removes the two-owners-one-file hazard without losing an invariant.
- **Still no scope creep.** Nothing in the added material asserts behaviour REQ does not ask for, and the layer boundary holds: the AC-3.4 tension is routed as erratum 4 and recorded as a gap rather than resolved by a test that quietly picks a reading.

## Recommendation

**Approved with minor changes**

Both v1 High findings are resolved, and all three non-blocking ones are addressed. Nothing in the revision broke a previously-approved section: the §12.1 re-key, the §5.1 retirements and the five added properties are all self-consistent with the per-property trailers, and the count reconciles. The two remaining items are non-gating:

1. **F-06** — remove T25 from PROP-COR-10, PROP-COR-11 and PROP-CFG-03's green lists and from §12.2/§12.3's pass-file rows.
2. **F-07** — narrow §12.1's AC-1.1 range to PROP-COR-01…11, or annotate 12/13 as differential scaffolding.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.7)
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v7.md`
**Date:** 2026-08-19
**Iteration:** 8 (delta confirmation)

## Scope

Delta only. I diffed `4857352e..fa229bde` on the FSPEC (12 insertions, 4 deletions across four
hunks: version row, v0.7 erratum note, the AC-6.2 traceability row, E-13, and AT-32), verified my
two v7 Medium findings against the repository rather than against the document, and scanned the
changed passages for new issues. Sections untouched by the edit were not re-reviewed.

## Routed-item disposition

| Item | Disposition |
|------|-------------|
| F-01 — E-13 provenance overshoot ("declared; not seen at HEAD") | **Landed, and the new numbers verify** |
| F-02 — AT-32 vacuous-green equality against a live sibling branch | **Landed** |
| AC-6.2 traceability row (raised by a sibling reviewer) | **Landed, and the mapping is correct** |

### F-01 verified against the corpus, not the document

E-13 now reads `(measured: 2 of 89 at HEAD, both in regime-ledger; none in yumo-plugins)`. I
re-measured both repositories under REQ C-3's predicate (`docs/{feature}/` and
`docs/completed/{feature}/`, nested `docs/discarded/{feature}/` excluded by shape per FSPEC:73 and
FSPEC:279):

- `regime-ledger`: exactly two `Date Completed` values carry free text after the date —
  `2026-06-09 (Phase H harvest; partial close-out)` in
  `docs/completed/02-macro-prediction/LEARNINGS-macro-prediction.md` and `2026-07-22 (merged PR #214)`
  in `docs/completed/78-structure-options-scoring/LEARNINGS-structure-options-scoring.md`. Both sit
  inside the corpus roots.
- `yumo-plugins`: all nine corpus documents carry a bare ISO date. The two free-text values that do
  exist here (`docs/discarded/pdlc-review-convergence/`, `docs/discarded/pdlc-rcv-budget-stop/`) are
  nested under `docs/discarded/{feature}/` and are therefore outside C-3 — which is exactly what
  E-35 and AT-15 already say. So "none in yumo-plugins" is true *for the corpus*, and it is true for
  a non-obvious reason the document already carries elsewhere.

E-13 no longer contradicts BR-4: BR-4's "some values carry free text after the date" and E-13's
count are the same fact at two altitudes, and E-13 now reads HEAD the same way as E-12 one row above.
A fixture author can cite `02-macro-prediction` for real HEAD provenance.

### F-02 verified

AT-32 now asserts that the enabled-run comparison target is itself carrying the C-4-delimited
advisory material (AC-1.1) before the three default-enabled compositions are compared against it.
That is the positive-presence conjunct the oracle was missing: a regression that silently empties
injection in every branch now fails on the comparand assertion rather than passing on both-sides-
equal. The conjunct also covers the `NTC-MALFORMED` and `NTC-KEYTYPE` legs, since both compare
against the same target. The set-equality leg over the notice catalogue is unchanged and intact.

### AC-6.2 traceability

`| AC-6.2 | §Acceptance-test preamble, AT-31, AT-32 | AT-31, AT-32 |` is now correct. REQ AC-6.2
carries two obligations — byte-identity against the recorded pre-feature baseline, and "AC-5.1b's
catalogued notice fires on a section present and not an object, and AC-5.1c's on a wrong-typed key"
(REQ:415-419). AT-31 discharges the first; only AT-32 discharges the second. Pointing the row at
AT-31 alone left half of AC-6.2 with no covering test.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | AT-32's new positive conjunct asserts the comparison target "carries the injected LEARNINGS block (the C-4-delimited advisory material)" but drops the source-document identity my v7 finding suggested. Delimiter-presence alone is falsifiable against an empty injection, which is the failure mode that mattered, so this does not gate; but a run that composed a delimited block from the *wrong* document would still pass all three default-enabled legs. The `NTC-KEYTYPE` leg already pins its selection to a fixture literal — extending that same phrase to the three default-enabled legs would close the gap at no cost, on the next erratum or in TSPEC. | AT-32 |

## Questions

None. My v7 Q-01 is discharged: REQ v0.9's AC-5.1b now grounds its fail-open analogy on
`parseImplementationConfig` rather than on the advisory reader, and that citation is accurate —
`pdlc/workflows/orchestrate-dev.js:191-198` returns `IMPLEMENTATION_DEFAULTS` with a
`sectionMalformed` flag for a malformed section, i.e. defaults plus an explicit operator signal.
The FSPEC gloss and the REQ sentence now agree.

## Positive Observations

- Both v7 Mediums were fixed by scoping rather than by re-inflating or by deleting. E-13 kept its
  measured claim and added the two axes that make it checkable (count, repository); AT-32 kept its
  sibling-branch comparison and added the conjunct that makes the comparison mean something. Neither
  edit widened beyond the routed item.
- The v0.7 erratum note names all three routed items and what each edit does, so the next reader can
  diff intent against bytes without reconstructing this round.
- The edit is genuinely minimal — four hunks, no unchanged section disturbed. I re-checked BR-4,
  E-12, E-35, AT-15, AT-31 and the AC-6.2 preamble for collateral contradiction and found none.

## Recommendation

**Approved**

All three routed items landed, all three verify against the repository rather than only against the
document, and nothing previously approved broke. The single remaining item is Low and is a
tightening, not a defect.

## Delta-Confirmation Findings

FINDING: Low | delta | local | AT-32 (Acceptance Tests, Group 5) | New positive conjunct asserts delimiter presence but not source-document identity, so a block composed from the wrong document would still pass the three default-enabled legs.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:57b71e0c5687067aa34ec4c4afc0c2ce58ff3dce61b1813f21b42cca5f048fcf
APPROVAL-HASH-NORMALIZED: sha256:57b71e0c5687067aa34ec4c4afc0c2ce58ff3dce61b1813f21b42cca5f048fcf
REVIEWED-COMMIT: a85ced73e5ff5708359a9b82a91b7cb56a64e79a
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd

# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-30
**Iteration:** 10 (delta confirmation, erratum round)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I previously approved this PLAN; a targeted
erratum edit (`6b10f388c`…`64666b25a`, PLAN **v0.9**) has landed to close one routed item:

> PLAN v0.7 contradicted TSPEC v1.2 §7.3 at six sites — the `:19` revision history calling the
> adopted test-file/fourteen form "rejected", T-11, T-18's instruction to declare
> `DECISION_LEDGER_CENSUS_TOKENS` in `pdlc/workflows/orchestrate-dev.js`, two file-ownership-manifest
> rows, and §Definition of Done — all to be re-pinned to the census test-file home and to
> six ∪ eight = fourteen **before batches 3–8 run**.

Per DEC-ERR-03 the measurement is this PLAN against its upstream **at HEAD**, not against the item
list. I re-measured the four upstream pins mechanically before reading the delta:

| Upstream | Pin in PLAN header | `shasum -a 256` at HEAD | Agrees |
|---|---|---|---|
| REQ v1.9 | `ce6b133f…3c7b7c` | `ce6b133f0c1d…0d3c7b7c` | yes |
| FSPEC v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef055f…35aed39` | yes |
| TSPEC **v1.2** | `fc57bc56…d4c27504` | `fc57bc56e0b5…d4c27504` | yes |
| DECISIONS | `13aba061…4fb89a` | `13aba06127b4…0bb4fb89a` | yes |

The header's TSPEC pin moved `v1.1 → v1.2` in this same edit, so the document is measured against the
version this dispatch names — no stale-pin gap of the kind that produced the last two rounds.

**Answer to the one question:** yes. The delta lands all six sites, is a faithful compression of
TSPEC v1.2 §7.3 and §7.2 at every site it now leans on, and breaks nothing I previously approved.

## Batches

Site-by-site landing check of the routed item. Each row is verified against the PLAN bytes at HEAD,
not against the commit messages.

| # | Site | State at HEAD | Landed |
|---|---|---|---|
| 1 | `:19`–`:29` revision history | v0.9 entry added; **v0.7's entry explicitly marked superseded** ("the count and home this entry records were corrected downstream-to-TSPEC-§7.3; retained as history") and a standalone paragraph records that v0.7's "six ∪ nine = fifteen" reading, and its labelling of the fourteen-member form as "rejected", is history and **not contract** | yes |
| 2 | T-11 (`:162`) | Operands re-pinned: `CENSUS_TOKENS` six data-carrying names, `CENSUS_EXEMPT` eight plumbing declarations, `OWNED_DECLS` fourteen; **"All three are declarations of this task's own test file"**, none production, none a member of the owned list | yes |
| 3 | T-18 (`:168`) | The production-declaration instruction is gone and replaced by its negation: "This task writes **no census constant**: TSPEC §7.3 homes all three … in `decisionLedgerCensus.test.js`" | yes |
| 4 | Manifest row, census test file (`:217`) | Re-worded to "the sole home of **all three** frozen census lists … never of `orchestrate-dev.js`" | yes |
| 5 | Manifest row, T-18 / `orchestrate-dev.js` (`:229`) | "it declares **no** census constant — all three are test-file constants owned by T-11, TSPEC §7.3" | yes |
| 6 | §Definition of Done (`:~505`) | Partition bullet re-pinned to six data-carrying ∪ eight plumbing = fourteen, all three constants test-file, `TSPEC v0.9 §7.3` version-pins dropped for bare `§7.3` | yes |

A grep for the stale numerals confirms no residual assertion: every surviving `fifteen` / `nine` in
the file is either inside a revision-history entry that names itself superseded, or unrelated (`:103`
counts fifteen new *test/fixture paths*; `:352` is a different arithmetic). TSPEC §7.3's own
*This paragraph is the authority for that count* explicitly permits the history form — "the revision
history records the count as history of an edit, not as a claim about HEAD" — so those survivals are
conformant, not leftovers.

**Batch-timing conjunct.** The routed item required the re-pin to land *before batches 3–8 run*. It
did: nothing in batches 1–2 has been executed against the old text, T-11 remains a batch-2
committed-skipped red un-skipped by T-18 in batch 8, and the fourteen owned declarations it resolves
against are still written by `[green]` tasks T-13…T-18 across batches 3–8. The red-before-green edge
is untouched by this edit.

## Dependencies

## Verification

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict

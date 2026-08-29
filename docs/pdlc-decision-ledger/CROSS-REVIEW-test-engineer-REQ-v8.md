# Cross-Review: test-engineer — REQ (delta confirmation, v1.8 erratum)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8)
**Date:** 2026-08-28
**Iteration:** 8
**Round type:** delta confirmation over a previously approved REQ
**Scope:** the v1.8 erratum edit only — C-5's two threshold rows, §6 R-5, §7 A-1, and the Baseline pin. Sections the edit did not touch were re-read for breakage, not re-litigated.

## Delta Under Review

`git diff 6fd604320..HEAD` over the REQ is 19 insertions / 11 deletions across four places, and
nothing else moves:

| Site | Change |
|---|---|
| Header table | Baseline pin `v1.1` → **`v1.2`**; Status version `1.7` → `1.8`; a v1.8 erratum changelog paragraph added |
| §4 C-5, `maxEntries` row | Type `positive integer` → **`non-negative integer`**, with the reason stated in the row: `0` is a valid admits-nothing value, not a malformed one falling back to `70` |
| §4 C-5, `maxBytes` row | Default `8000` → **`12500`**; type `positive integer` → **`non-negative integer`**; rationale re-sourced from analogy to `M-7b`/`M-7c` by id |
| §6 R-5 and §7 A-1 | The "unmeasured analogy" claim retired; R-5 restated as the *growth-model* residual risk (`M-6d`/`M-7d`), A-1 restated as both defaults measured-once-and-cited, still operator-revisable |

The edit is genuinely confined to C-5's two thresholds and the two clauses that recited their
provenance. No acceptance criterion, no `US-*`, no `G-*`, no `O-*` row changed bytes.

## Routed Items — Disposition

Nine routed items reduce to two distinct asks. Both land.

| Routed ask | Raised by | Landed? | Evidence at HEAD |
|---|---|---|---|
| Retype `maxEntries`/`maxBytes` **non-negative**, so FSPEC E-7's `maxEntries: 0` admits-nothing value is valid rather than malformed-falling-back-to-`70` (TSPEC ERR-1; `parseLearningsConfig` precedent) | se-author (×4), pm-review | **Yes** | REQ `:172–173` — both rows read `non-negative integer`; the `maxEntries` row states the semantics explicitly, the `maxBytes` row inherits it by "Non-negative as above" |
| Raise `maxBytes` off the falsified `8000` analogy to a **measured** value | pm-review (×2), te-review, se-author (×4) | **Yes** | REQ `:173` — `12500`, sourced to Baseline `M-7c`, which is a real entry in a real file at the pinned version (below) |
| Retire the "unmeasured analogy" recital that R-5 and A-1 carried | pm-review, se-author | **Yes** | §6 R-5 `:327–330` and §7 A-1 `:374–378` both now cite `M-6b`/`M-6c` and `M-7b`/`M-7c` by id; neither says "analogy" |

The non-negative retype is not merely a type-label change; it is now **oracle-consistent with an
existing AC.** REQ-DECLEDGER-07 (`:290`) already enumerated "`maxEntries` of `0`, as zero in-scope
decisions, not an error" as a stated boundary outcome. Under v1.7's `positive integer` that clause
described a value C-5 declared invalid — a boundary case whose expected value contradicted the
type row it was configured by. The delta removes that contradiction, and a tester can now write
the `maxEntries: 0` case against a single-valued expectation. That is the strongest thing in this
edit and it was not among the routed asks.

## Re-Derivation of the Measurement

## Breakage Check on Previously Approved Material

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

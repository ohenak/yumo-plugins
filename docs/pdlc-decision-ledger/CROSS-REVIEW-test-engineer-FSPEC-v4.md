# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.2)
**Upstream re-measurement:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` v1.8 (sha256:3eb52deb…)
**Previous round:** `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (2 High, 1 Medium, 1 Low — Needs revision)
**Date:** 2026-08-28
**Iteration:** 4

## Scope of this round

Delta confirmation, not a re-review. v3 recorded two High findings against the FSPEC's recital of
REQ **v1.8**'s re-measured bounds; a targeted erratum has since landed in three commits
(`c75797636`, `577cf6860`, `f450e8de4`), taking the FSPEC to **v1.2**. I read the diff of those
three commits, then re-read the upstream text this spec leans on at its current version, and
answered one question: does the delta resolve the routed items without breaking anything approved
earlier, and is the document still a faithful compression of REQ HEAD?

Per DEC-ERR-03 the measure is upstream HEAD, not the routed-item list. So the sections the erratum
did *not* touch were re-measured against REQ v1.8 too, and one carried finding is restated below
because it is still live — not because it was routed.

## What the delta changed

Eighteen lines in, nine out, across four sites and nothing else:

| Site | Change |
|---|---|
| Header `:9`, `:11`, `:17` | Upstream pin REQ **v1.7 → v1.8**, Baseline pin **v1.1 → v1.2**, version row **1.1 → 1.2** |
| Header `:19`–`:26` | New v1.2 erratum note recording the scope of the edit |
| §1 `:52`, §6 `:340` | Baseline `Verified at` citations re-pinned to **v1.2** |
| §3.1 `:120` | `maxBytes` default recital **`8000` → `12500`** |
| §7 Assumptions `:553`–`:555` | A-1 restated: both defaults measured once at the Baseline's named commit and cited by id |

No behavioral flow, business rule, edge case or acceptance test text moved. That is the right blast
radius for this erratum — the cascade really was confined to recited constants and a provenance
claim, exactly as v3 scoped it.

## Routed items — confirmation

**F-01 (High) — resolved.** §3.1 `:120` now reads "Defaults are `enabled` `false`, `maxEntries`
`70`, `maxBytes` `12500` (REQ C-5)." REQ C-5 `:173` records `12500` as the measured value clearing
`M-7b`'s worst standing case, and names `8000` as the value that "sits *below* `M-7b`" and drops
lines on day one. The recital and its `(REQ C-5)` attribution now agree. I grepped the whole FSPEC
for `8000` / `8,000`: the only surviving occurrence is `:21`, inside the erratum note, describing
the value that was replaced. That is correct historical prose, not a live recital — the definition
site every downstream author reads is single-valued again.

**F-02 (High) — resolved.** §7 Assumptions `:553`–`:555` now reads "both defaults are measured once
against the Baseline's named commit and cited by id, not re-derived here — `maxEntries` (70) from
`M-6b`/`M-6c`, `maxBytes` (12500) from `M-7b`/`M-7c`". That is REQ A-1 at `:377`–`:379` in
substance and in id set. The retired `learningsInjection`-analogy claim is gone, so the
"carried from REQ §7 unchanged" preamble is true again — which was the more dangerous half of the
finding, since an operator auditing the vetoable assumptions stops at that sentence. I also checked
the R-5 half: the FSPEC recites no R-5 at all (grep for `R-5` hits only `BR-5`), so there is no
stale commit-growth recital left to re-aim. Nothing to fix there.

**F-04 (Low) — resolved in this document.** All three Baseline pins moved together: header `:11`,
§1 `:52`, §6 `:340` now name **v1.2**. §6's frozen-fixture instruction therefore points at Baseline
v1.2's `Verified at` commit (`8c673a09f`), which is the commit the fixture must actually be cut at.
The second half of F-04 — the Baseline's own `Cited by` propagation row omitting FSPEC §7
Assumptions — is unchanged and restated below, since §7 now cites four `M-*` ids and is still not on
the propagation list.

**F-03 (Medium) — not addressed, and still live.** Restated below; see the next section for why the
erratum note's reasoning does not close it.

## Upstream re-measurement (DEC-ERR-03)

## What remains

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

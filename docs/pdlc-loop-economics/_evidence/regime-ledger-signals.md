# Engine-side signals from regime-ledger consolidation pass (peer session, 2026-08-27)
Corpus: 8 features (iv-snapshot-store-postgres, regime-symbol-ladder, structure-directional-options-scoring,
longhorizon-product-scaffold, longhorizon-daily-baseline, macro-nightly-job, paper-book-strategy-generalization,
regime-swing-confirmation).

1. Cascade-confirmation dominates cost (4+ features). longhorizon-product-scaffold DECISIONS v2–v7 identical
   approval hash across six rounds; only upstream pins moved. Proposal: cheap "pin-cascade confirmation" round
   type when own-hash unchanged; batch upstream errata into one revision.
2. Erratum channel routes but never closes (paper-book): 6 ERRATUM items routed, none amended upstream; same
   findings re-filed 4 consecutive rounds. Gate should refuse downstream approval while routed errata live.
   Also: erratum dispatch naming a subset cannot claim absorbed version range.
3. pm-review FINDING grammar gate fail-closes silently (2 halts, same feature). Feed parse failure back to
   reviewer in-round, or in-SKILL self-check.
4. Approval anchors must be harness-computed (structure-directional: transcription drift sha mismatch; engine
   also quoted stale upstream hashes as "current" in delta re-confirmations — longhorizon-daily-baseline ×2).
5. DoD round number must be derived from tree: max(CODE_REVIEW-*-v*)+1 (regime-swing dispatched v3 with v1..v5
   on disk).
6. Review stubs without verdict: hard precondition; VERDICT: aborted for aborted rounds; 9 approving rounds on
   structure-directional had no anchors at all.
7. Split-on-recurrence should be mechanical: halt when High finding blocks two consecutive rounds
   (regime-swing: 15-round ceiling on SIX documents, 188 cross-review files). REQ byte-ceiling ≥90% →
   mechanical relocation to docs/_constraints/.
8. Scope column mandatory in findings table (under-tagging re-derived by hand in 5 of 8 harvests).

## Raw extracts (2nd message, with counts)

ITEM 1 — cascade/pin-confirmation dominance:
- longhorizon-product-scaffold: 112 cross-review files, one scaffold feature. DECISIONS v2–v7 identical hash
  (3e282f13…) across 6 rounds; PLAN v2–v7 same (693805d4…). Each REQ erratum v1.4→v1.5→v1.6→v1.8 triggered a
  full downstream delta-confirmation sweep. Harvest asks verbatim for a "pin-cascade confirmation" round type
  (own-hash unchanged → check dependency cells only, batched sweeps).
- longhorizon-daily-baseline: TSPEC 12 rounds, REQ 9; ~half of TSPEC rounds were delta re-confirmations
  (~15 re-confirmation dispatches, 4 erratum re-grounds). PLUS engine defect: dispatches quoted stale FSPEC
  sha (ace3aa35…) as "current".
- macro-nightly-job: TSPEC 8, REQ 6+, FSPEC 6; rounds 3+ overwhelmingly cascade-confirmation closing
  {high:0, medium:1–2}. "The expensive part was not getting the spec right; it was proving, repeatedly, that
  late upstream edits had not silently invalidated approved downstream text."
- iv-snapshot-store-postgres: PLAN 15 rounds, TSPEC 9. PLAN v4–v7+v10–v15, TSPEC v7–v9 entirely provenance
  bookkeeping (commit SHAs, line ranges, counts); one squash invalidated 17 in-prose short SHAs at once.

ITEM 7 — split-on-recurrence / ceiling:
- regime-swing-confirmation: 188 cross-review files + 6 code-review rounds. REQ 15, FSPEC 15, TSPEC 15,
  PLAN 15, PROPERTIES 15, DECISIONS 14, REVIEW 5. 5g split trigger FIRED (Phase R round 3), answered with
  in-place revisions, nobody split. REQ at 92% of 61,440-byte ceiling by round 2; fix relocated ~90% of
  constraint text to docs/_constraints/. Harvest: make both mechanical (halt on 5g; relocation at ≥90%,
  hook candidate check-req-size.sh).
- paper-book-strategy-generalization: TSPEC/PLAN/PROPERTIES 15, DECISIONS 14 (~85%-scale, 140KB TSPEC).
  5-round per-invocation cap paged operator while doc WAS converging; lifetime cap (15) nowhere near reached.
- structure-directional-options-scoring: 159 FINDING: lines, 124 cross-feature-tagged; rounds 10+ were
  stale-citation churn; approval-anchor drift class re-filed by four separate reviews.

Citation caveat: LEARNINGS-*.md is the most primary surviving source (cross-reviews deleted post-harvest).
Paths: regime-ledger docs/completed/{91,93,94}-*/LEARNINGS-*.md and docs/{longhorizon-daily-baseline,
macro-nightly-job,paper-book-strategy-generalization,regime-swing-confirmation}/LEARNINGS-*.md

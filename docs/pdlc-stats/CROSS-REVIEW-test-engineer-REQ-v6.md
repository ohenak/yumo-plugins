# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.4, commit `e33637af2`)
**Date:** 2026-08-31
**Iteration:** 6
**Round type:** Delta re-review (prior: `CROSS-REVIEW-test-engineer-REQ-v5.md`, Approved with minor changes)
**Delta under review:** none — REQ bytes unchanged since v5

## 1. Delta scope

`git diff e33637af2 HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md` is **empty**, and
`git status --porcelain` on the path is clean. The REQ is byte-identical to the v1.4 bytes I
approved in v5. There is therefore no delta to confirm: no previously-approved expectation moved,
and no routed item landed in this round's bytes.

That makes this round a re-confirmation against an unchanged document. Per the delta protocol I did
not re-litigate sections already approved. I did, however, re-run the REQ/FSPEC verification checks
that are grounded in *repository state* rather than in document bytes — those checks can flip
without the document changing, because the corpus the command measures is itself under version
control. One of them flipped, and it is section 3 below.

## 2. Carried findings from v5

Both non-gating findings from v5 are still open, unchanged, and still non-gating.

- **v5 F-01 (Medium, G-3)** — carried forward as **F-02**. §2 G-3 (`REQ-pdlc-stats.md:47`) still
  reads that feature artifacts "missing or fail to parse" are "reported missing/malformed". This
  still contradicts REQ-STATS-07, which reserves the by-name gap report for a directory that cannot
  be read, treats a readable-but-empty directory as a normal zero row, and leaves *malformed* as a
  within-metric state owned by REQ-STATS-03. The AC governs test authoring, so no test is misled;
  the goal statement simply summarises the ACs wrongly.
- **v5 F-02 (Low, C-4 doc-type placeholder)** — carried forward as **F-03**, unchanged. C-4's
  `{doc-type}` is an open placeholder while the driver's catalogue is closed
  (`REVIEW_DOC_TYPES`, `pdlc/workflows/orchestrate-dev.js:10105-10112`, rejected at `:10144` with
  reason `bad_doc_type`), so `CROSS-REVIEW-product-manager-REVIEW-v1.md` is malformed under
  REQ-STATS-03 yet a survivor under REQ-STATS-06.
- **v5 F-03 (Low)** was confined to the v1.4 changelog note's rationale rather than to an
  acceptance criterion. I am not re-filing it: it does not bind any test.

## 3. New finding: the harvested-halt oracle is a false green

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

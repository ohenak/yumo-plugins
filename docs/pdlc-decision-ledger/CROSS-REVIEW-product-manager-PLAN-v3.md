# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.3, se-author)
**Date:** 2026-08-29
**Iteration:** 3
**Scope:** Local

Delta re-review. Base: `446a78692` (the bytes v2 reviewed); head `665eb44a8`. Five revision commits
(`596ee1546`, `7b2bc163e`, `98eb071ce`, `8cee638a8`, `665eb44a8`), 37 insertions / 14 deletions in
one file. I re-read my v2 findings, diffed the document, verified the disposition, and scanned
**only** the changed regions — the header/revision-history block, the Overview blast-radius
paragraph, rows T-00a, T-03, T-12a, T-10a, T-18, and the `### The coverage gate` subsection of
§Verification. Sections approved at v2 and untouched here are not re-litigated.

## Disposition of v2 findings

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | T-03's enumeration now carries all four `DECISION_CORPUS_ARGV` alternatives, and every number in the row is measured-correct. Executed here: the four-alternative filter over `git ls-tree -r --name-only 8c673a09f` yields **25**; the three-alternative form the row now explicitly names as wrong yields **24**; the same four-alternative filter over live `git ls-files` yields **26**. `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md` is present at `8c673a09f` (`git ls-tree -r --name-only 8c673a09f \| grep discarded`), so the named 24→25 delta is the right file. The fourth alternative matches `TSPEC-pdlc-decision-ledger.md:307-317`'s `DECISION_CORPUS_ARGV`, which holds exactly those four `:(glob)` pathspecs in the same order. |

The fix went further than the finding asked. My v2 F-01 asked only that the arithmetic stop
contradicting itself. The row now (a) names both deltas — 24→25 and 25→26 — so no figure stands as
a bare assertion an implementer must take on trust, and (b) converts the integrity guard from
"set equality on the fixture's path list" into **set equality against a 25-element literal path
array hand-transcribed into the test file**. That second half is the part that actually protects
REQ-DECLEDGER-01: under v0.2's wording a fixture built from the wrong 24-path enumeration would have
been checked against its own path list and passed, surfacing later as an unexplained T-09 byte-literal
red. Under v0.3 it fails at batch 1, naming the missing path. That is the difference between a guard
and a tautology, and it was not something I had asked for.

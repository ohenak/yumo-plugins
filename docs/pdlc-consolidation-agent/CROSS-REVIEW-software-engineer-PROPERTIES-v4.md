# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.3)
**Date:** 2026-08-09
**Iteration:** 4
**Scope:** Delta re-review under the round-4 protocol. Diffed `d090ef08..HEAD` on the document
(80 insertions, 7 deletions), read my own v3 findings first, and judged only (a) whether the v3
blocking finding is resolved and (b) whether the revision broke anything. Unchanged sections were
not re-litigated. Every upstream citation the new text introduces was re-measured against HEAD
rather than trusted from the document.

## 1. Round-3 findings disposition

| v3 finding | Severity | Disposition | Evidence, re-measured at HEAD |
|---|---|---|---|
| F-01 — AT-P6 and AT-P10 claimed in a file the approved TSPEC/PLAN does not give them, and §12.4 asserted the single-file invariant unqualified | High | **Resolved, and resolved the way I asked** — §13.3 erratum 6 routes the re-registration upstream, and §12.4 names the pending erratum instead of over-claiming | §13.3 item 6 (`:1896-1912`) states both halves of the correction (TSPEC §12.3 moves the two ids to the `consolidationPass.test.js` row; PLAN T14's `T25` block drops them), exactly the shape erratum 5 uses. §12.4's AT-P cell (`:1775`) now says the two ids sit in a file the approved upstream does not give them and defers to erratum 6; the AT-C cell (`:1774`) narrowed its own claim from "each id" to "each **AT-C** id", so it no longer speaks for a family it cannot vouch for. PROP-COR-10 and PROP-COR-11 stayed at L2 — trailers still read `L2 · consolidationPass.test.js · T20 → T31` (`:397`, `:405`) — so no property moved and no L1 arm was invented for a conjunct a pure subject cannot observe |
| F-02 — false existing-code claim in erratum-3 prose ("a directory that does not exist at HEAD") | Medium | **Resolved** | §4.3 (`:446-449`) now says the directory **exists and is tracked at HEAD**, cites the measurement, and states that the new thing is the file while the missing thing is the manifest row. §13.3 item 3 (`:1877-1879`) carries the same correction. Re-measured: `git ls-files pdlc/workflows/__tests__/fixtures/` returns 36 tracked files at HEAD, and the remedy is unchanged — `PLAN:307` still names only `pdlc/workflows/__tests__/consolidationHookParity.test.js` |
| F-03 — PROP-PASS-11 lands in a file whose PLAN block text excludes it, with the exclusion explicit | Medium | **Resolved** | §13.3 erratum 7 (`:1913-1927`) routes the gap upstream, names the third unregistered obligation PLAN T20 should declare, and states the sharper fact I wanted on the record: no PLAN block declares AC-1.4's no-op case at all, before or after the v1.2 re-home. PROP-PASS-11's trailer carries a placement note (`:1367-1371`) marking the file as derived from the property's subject and the `T20 → T31` cell as this document's judgment pending the erratum |
| F-07 (v1) — hook facts pinned by name, not line index | Low | Still resolved | unchanged |

## 2. Independent re-measurement of the new claims

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict

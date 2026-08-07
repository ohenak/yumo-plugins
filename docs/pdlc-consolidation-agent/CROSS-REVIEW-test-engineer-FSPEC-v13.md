# Cross-Review: test-engineer — FSPEC (delta confirmation, erratum round v11.3)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 13
**Scope:** DELTA CONFIRMATION only. Diff reviewed: `767b6b59..0499e532` (the six erratum commits
`b68dddea`, `fcb8a4bc`, `858797f6`, `838868e3`, `b9f66cb4`, `0499e532`), against my v12 approval at
`767b6b59`. I did not re-read the document; I read the diff, the seven erratum items, and the
sections each item names, plus the HEAD sources the new text cites.

## Item-by-item disposition

| # | Erratum item | Disposition | Evidence |
|---|---|---|---|
| 1 | §4.1's "Removed at step 16" states a capability no seam has (te-review + se-author, same item) | **Resolved** | The `Removed` row is split into `Released` — "an **in-place rewrite** of the same file to a single line, `RELEASED: {passId} {ISO-8601}`" (`:424`) — and a new `Removed` row that says **never by the pass** (`:425`). The justification (`:427-430`) cites the grep I raised; I re-ran it at HEAD: `grep -nc "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` → `0`. The spec now describes only operations the adapter ships. |
| 2 | §4.2's `empty (truncated write)` arm is unreachable under a write-empty release; and the product question — must the durable log witness a pass that dies mid-take? (te-review + se-author, same item) | **Resolved, both halves** | The release form is a **sentinel line, not an empty file** (`:437-442`), which is what makes the empty arm reachable at all rather than being the normal end state of every pass; §4.2 grows from three outcomes to four with an explicit `RELEASED:` row (`:463`) and re-labels the last row "Present but **empty**, or a line that is neither form" (`:467`). The product question is answered in the document rather than deferred: **"The durable log must witness that pass"** (`:484`), with the reason stated (the abandoned pass appended no row of its own, so the reclaiming pass's `reclaimed-stale-lock` / `unknown` is the only trace). E-11 is re-grounded (`:2644`), E-11b is new (`:2645`), BR-14 is narrowed to `IN-PROGRESS:` and BR-14a is new (`:2550-2551`), AT-M3 gains the two-fixture form and AT-M11 is the paired negative (`:2084-2085`). See L-03 for one sentence of that rationale that is over-claimed. |
| 3 | AT-P7's *When*/*Then* would be red on correct code (se-author) | **Resolved at the level that matters** | AT-P7 (`:2072`) now compares **the two predicates** over a fixture root rather than running the hook, and states the exclusion explicitly: the `THRESHOLD` gate (`:25`) and the advisory line "govern whether the hook *speaks*, not what it counts, and are asserted neither way here". The stdout oracle that made the row red is gone. The residual is the observation channel, filed as L-04. I verified the cited hook anchors at HEAD: `THRESHOLD = 5` at `:25`, the corpus glob at `:28`, the log read at `:36-37` and the predicate at `:41`. |
| 4 | AC-3.2's PR-body obligation has no acceptance test (se-author) | **Resolved** | **AT-Q13** is new (`:2126`), two fixtures (a multi-feature recurrence and a single-occurrence standing-invariant promotion), asserting all three body obligations — sources **set-equal** to the derived features, the `symptom` line verbatim, and the AC-2.3 evidence *in the form that fixture cleared the bar with*. The AC→AT map now binds AC-3.2 to `AT-Q2` (trailers) **and** `AT-Q13` (body) (`:2320`). §6.2 carries the pointer and the separation ("not discharged by them", `:827-829`). |
| 5 | §5.3's "when, and only when" has no test for the "only when" half (se-author) | **Resolved** | **AT-R7** is new (`:2106`), three fixtures with `docs/_decisions/` listed **before and after** each pass: (a) a `promoted` pass with no §5.3 cause, (b) a `no-op` pass whose promotions were all duplicate-suppressed, (c) a positive control that degrades. AC-1.4 gains AT-R7 in the map (`:2312`) and §5.3 names it inline (`:689-691`). |
| 6 | T-10's `phase`-arm subject (v12 Low) | **Resolved** | T-10 (`:2211`) now excludes "**§8.3's `phase` arm** and §8.1's `failure-mode-id` arm" rather than the whole `phase` arm, and records why. This closes my v12 **L-01**. |
| 7 | BR-33a's `phase`-arm subject (v12 Low) | **Resolved** | BR-33a's `phase` clause (`:2591`) now adds "§8.4 steps 2–3's question is still asked, with the `phase` half stated unavailable". |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|

## Questions

## Positive Observations

## Recommendation

## Verdict

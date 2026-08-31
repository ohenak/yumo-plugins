# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3
**Previous round:** `docs/pdlc-stats/CROSS-REVIEW-test-engineer-REQ-v2.md` (Needs revision; 1 High, 1 Medium, 1 Low)
**Diff reviewed:** `82afd0c60..HEAD` on `docs/pdlc-stats/REQ-pdlc-stats.md` (one commit: `bb6f56af2`, +25 −15)

Sections touched by the delta, and therefore in scope for new-issue scanning: the lineage
header, C-5, REQ-STATS-02, REQ-STATS-03, REQ-STATS-04, REQ-STATS-06, REQ-STATS-08. Everything
else is unchanged and was approved in earlier rounds; not re-litigated.

## Prior-round disposition

| v2 finding | Severity | Status |
|---|---|---|
| F-01 REQ-STATS-03's harvested predicate is whole-feature while the repo's harvest is partial | High | **Resolved** |
| F-02 harvested displaces REQ-STATS-04 / REQ-STATS-06 where their own evidence survives | Medium | **Resolved** |
| F-03 C-5's "never diverge" reads onto the driver's coarse `skipped` bucket | Low | **Resolved** |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **REQ-STATS-06's harvested predicate has an unresolved negation scope, and the two readings disagree on a directory that exists in this repo.** The new clause reads "Where `LEARNINGS-{feature}.md` is present and no `CROSS-REVIEW-*` or no `CODE_REVIEW-*` file remains". English allows both "no (`CROSS-REVIEW-*` or `CODE_REVIEW-*`) file remains" (neither class survives) and "(no `CROSS-REVIEW-*`) or (no `CODE_REVIEW-*`)" (either class is gone). `docs/completed/pdlc-headless-engine/` separates them: `LEARNINGS-pdlc-headless-engine.md` present, one surviving cross-review (`CROSS-REVIEW-software-engineer-TSPEC-v13.md`), zero `CODE_REVIEW-*`. First reading → measured ratio; second → `harvested`. The trailing rationale ("the numerator is only *partially* deleted and a computed value would silently undercount") argues for the second, so a test author can land on it — but only by inferring from rationale rather than reading the predicate, and the same paragraph's arithmetic ("harvest deletes cross-reviews and DoD reviews while post-mortems survive") is true of `pdlc-loop-economics` too, where the surviving class is the DoD one. Fix: state the disjunction with explicit scope — "where **either** the `CROSS-REVIEW-*` files or the `CODE_REVIEW-*` files are entirely absent" — one clause, no other change. | REQ-STATS-06 |
| F-02 | Low | Local | **REQ-STATS-04's harvested sentence lost its subject in the rewrite.** It reads "`LEARNINGS-{feature}.md` present **and** no `CODE_REVIEW-*` file reports **harvested** rather than `0`", which parses on first read as *"no `CODE_REVIEW-*` file reports harvested"* — the opposite of the intent. The preceding clause ("applies only when this metric's own evidence is absent") and the following one ("where any survives, the measured highest version wins") make the intent recoverable, so this is not gating, but the load-bearing sentence of a P0 AC should not need its neighbours to parse. Fix: "where `LEARNINGS-{feature}.md` is present **and** no `CODE_REVIEW-*` file remains, the value is **harvested** rather than `0`". | REQ-STATS-04 |
| F-03 | Low | Local | **REQ-STATS-02's state enumeration now over-distributes across the ACs it names.** It says "REQ-STATS-03/04/06's malformed, unmeasurable and harvested states ride in their own metric's value" — but the same commit removed REQ-STATS-04's malformed state ("the driver draws no malformed distinction on the DoD side, so neither does this"), and neither 04 nor 06 has an unmeasurable state. Read distributively, the sentence asserts JSON-value slots that no AC produces; a set-equality test over `--json` written from REQ-STATS-02 alone would expect fields REQ-STATS-04 forbids. Fix: "each of REQ-STATS-03/04/06's non-numeric states — malformed, unmeasurable, harvested — rides in its own metric's value where that AC defines it". | REQ-STATS-02 |
| F-04 | Low | Local | **REQ-STATS-08 lost the conjunction between conjunct (b)'s first two clauses.** The delta changed "by path and modification time**, and** issues no network request" to "by path and modification time issues no network request", producing a run-on where the tree-equality clause and the no-network clause abut with no boundary. The three sub-conjuncts of (b) are still individually enumerable — set-equal working tree, no network request, no `git` write command — so the AC remains testable as three assertions, but the sentence no longer marks where one ends. Restore the comma and "and". | REQ-STATS-08 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For `docs/completed/pdlc-headless-engine/` — LEARNINGS present, one surviving TSPEC cross-review, zero `CODE_REVIEW-*` — does REQ-STATS-06 report a measured ratio or `harvested`? The rationale says `harvested`; the predicate as written admits both. (F-01) |

## Positive Observations

- **The v2 High is cleanly closed, and closed at the right altitude.** REQ-STATS-03 now says the harvested test "is per document type, not per feature", and spells out the mixed row-set explicitly ("`harvested` per row for types whose files are gone, and a measured index for types whose files survive"). Applied to `docs/completed/pdlc-headless-engine/` that yields exactly one expectation and no clarifying question: TSPEC `13`, and REQ / FSPEC / PLAN / PROPERTIES / DECISIONS `harvested`. The false measured `0` that v1's F-02 and v2's F-01 both targeted is now unreachable on that directory.
- **REQ-STATS-04's demotion of the DoD malformed state is code-accurate, not merely convenient.** `deriveDodRoundIndex` matches `^CODE_REVIEW-{feature}-v(\d+)\.md$` and does `if (!match) continue` (`pdlc/workflows/orchestrate-dev.js:12387-12392`) — there is no reject bucket and no reason code on that path, so a non-matching `CODE_REVIEW-` basename genuinely is indistinguishable from an unrelated file to the driver. The asymmetry against REQ-STATS-03's malformed state is therefore fidelity to C-5 rather than an inconsistency, and the REQ now says so in the AC that carries it.
- **C-5's two narrowings both survive a read of the source.** "Case-insensitive *value* matching" is exact: `parseResolvedMarker` matches the literal `RESOLVED:` token case-sensitively (`:7604`) and lowercases only the captured value (`:7611`) — the v2 text's unqualified "case-insensitivity" would have licensed a `resolved:` fixture the driver rejects. And "fidelity binds the driver's per-file rejection reason, not its coarser aggregate reject list" lands on the real seam: `parseReviewFilename` returns `not_cross_review` / `bad_role` / `bad_round` / `trailing_junk` per file (`:10136`, `:10156-10162`), while `deriveRoundWindow` flattens all four into one `skipped` array (`:10151-10154`). REQ-STATS-03's three-way operator-facing split is now anchored to the former, which is the only one that distinguishes "not a cross-review" from "malformed".
- **REQ-STATS-02's new parenthetical is what makes the `--json` set-equality test writable.** "malformed, unmeasurable and harvested states ride in their own metric's value, never as extra top-level keys" resolves the standing tension with REQ-STATS-03's "reported separately as malformed": separate *within* the review-rounds metric, not a sibling top-level key. The set-equality assertion over the top-level key set can now be written against a fixture containing a malformed basename without a second reading being defensible.

## Recommendation

**Approved with minor changes**

No open High finding, old or new. The single v2 High is resolved: REQ-STATS-03's harvested state
is now a per-document-type test, so the repo's own partially harvested archive
(`docs/completed/pdlc-headless-engine/`) yields one unambiguous row set rather than three
defensible expectations, and REQ-STATS-04 and REQ-STATS-06 no longer inherit a predicate that
would discard measurable evidence. Every existing-behaviour claim the delta added checks out
against source — the DoD side's absent malformed distinction (`orchestrate-dev.js:12387-12392`),
the `RESOLVED:` value-only case folding (`:7611`), and the per-file rejection reasons the
aggregate `skipped` array flattens (`:10136`, `:10151-10154`).

The four remaining findings are all wording precision in the sentences this round rewrote: one
Medium negation-scope ambiguity in REQ-STATS-06 whose intent is recoverable from the adjacent
rationale (F-01), and three Low editing residues in REQ-STATS-02, REQ-STATS-04 and REQ-STATS-08
(F-02, F-03, F-04). None of them blocks writing the acceptance tests, and all four are single-clause
edits that can land alongside the FSPEC rather than gating another REQ round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:71ecf55740411bb44e15296e9da53ea37263fd22af3b8f8d534f6d2f4bdb7fdf
APPROVAL-HASH-NORMALIZED: sha256:71ecf55740411bb44e15296e9da53ea37263fd22af3b8f8d534f6d2f4bdb7fdf
REVIEWED-COMMIT: bb6f56af27962a1a8ba046c79dceaf8eb8d91178

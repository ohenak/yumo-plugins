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

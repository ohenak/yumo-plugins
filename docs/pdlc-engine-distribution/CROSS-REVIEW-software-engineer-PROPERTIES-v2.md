# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-14
**Iteration:** 2
**Scope:** Delta re-review. Round-1 findings (SE F-01…F-04) checked for resolution; only the
changed sections re-read for new defects. Every existing-code and upstream-document claim added in
v0.3 re-verified at HEAD.

## Round-1 disposition

All four of my round-1 findings are resolved. Each was checked against the diff
(`git diff 00177ed3 HEAD -- …/PROPERTIES-…md`), not against the changelog's description of it.

| Round-1 finding | Severity | Resolution | Verified |
|---|---|---|---|
| F-01 — PROP-CAT-2 asserted twelve ids past the open TSPEC §10.3 / §9.3 erratum without PROP-CAT-4's conditional marking | Medium | PROP-CAT-2 now states both resolutions ("eleven or twelve"), names `node.below-floor` as the conditional member, forbids transcribing the expected set from the row, and adds `PLAN §7 open erratum` to its `Traces`; §5's REQ-EDIST-05 row carries the matching footnote and states that no `AT-5.*` id depends on the branch | **Resolved.** Both edits present |
| F-02 — §7's Unit row was defined by reachability, which does not discriminate | Medium | The row is now defined by **scope of assertion** (single module or function over injected seams; no spawned process, temp prefix, built artifact or full run) and explicitly hands the Machine boundary back to reading rule 5 | **Resolved.** The nine Integration properties no longer fall inside the Unit definition |
| F-03 — PROP-REGR-1's site-count floor was not mechanically reproducible as stated | Low | The counting method is stated inline (top-level `test(` call, excluding `.test(` regex predicates and comment mentions), with the naive `grep -c` result (20) named as the trap; §1's floor list follows; `ci-arrangement.test.js` gains its own dual floor | **Resolved, and the new measurement holds.** `node --test __tests__/ci-arrangement.test.js` at HEAD reports `1..2` and `# tests 6`, exactly as claimed |
| F-04 — PROP-PACK-7's positional anchor lacked the "at HEAD" qualifier its sibling carries | Low | The parenthetical now reads "read at HEAD" and states that T41 edits those very lines | **Resolved** |

Nothing in the revision re-opened a settled decision, changed the task graph or the ownership
manifest, or disturbed §4's set-equality against FSPEC §8 — the 35 `AT-` rows are unchanged in
count and in `Carried by`; only the `Properties` cell of AT-1.1 moved.

## Claims verified at HEAD (v0.3 additions only)

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

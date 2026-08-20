# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 5

**Scope:** frozen delta re-review of `27d3129f..HEAD` — four commits, all of them answering v4
findings. Nothing outside the inserted blocks was re-litigated; §T.5's citation fix and the v0.5
front-matter bump are included because they are part of the delta, not because they were reopened.

## Delta inventory

| Commit | Section | What landed |
|---|---|---|
| `643f4ea2` | §A.2 property 1 (`:186-234`) | Restructures "two consequences" into four (a)–(d). Adds the composition-site expected-set table (PM F-01: `"LEARNINGS"` is a second non-member), the once-per-episode probe placement (my Q-01), and the five-site seam-plumbing table (my F-01) |
| `8aee8c22` | §T.3 (`:832-847`) | Gives both `.baseline-worktree` obligations named oracles with shapes (my F-02) |
| `9cbcaa1e` | §T.5 (`:919-925`) | Corrects the `advisoryDisabled.test.js` mis-citation (my F-04) |
| `16f30820` | front matter | v0.4 → v0.5, cross-review lineage completed through v4 |

My F-03 was also taken silently inside `643f4ea2`: `:175` now reads "written only for dispatches the
injector was actually called for" instead of "*accepted*", which removes the collision with §D's
per-source `rejected[]`. All four v4 findings are resolved.

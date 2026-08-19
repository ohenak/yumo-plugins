# Cross-Review: test-engineer — Codebase Review (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `af1ae046..HEAD` (delta since v1) — `docs/pdlc-plugin-retirement/PLAN-pdlc-plugin-retirement.md`, `CLAUDE.md`, `pdlc/OPERATIONS.md`, `pdlc/README.md`, `pdlc/RELEASE-CHECKLIST.md`, `pdlc/workflows/__tests__/{consolidationBuild,consumerCleanup,documentOracles}.test.js`
**Date:** 2026-08-18
**Iteration:** 2 (Phase CR round 2, delta confirmation)
**Scope:** delta only (`git diff af1ae046..HEAD`), confirming remediation of v1's F-01 through F-04

## Findings

None. All four v1 findings resolved by the remediation commits.

- **F-01 (High)** resolved by `4b2eb43a`: `CLAUDE.md:55` no longer claims `distribution-manifest.json` is a build-runtime output; it now reads "...generates runnable artifact into `pdlc/workflows/dist/`, which holds exactly `pdlc-cli.mjs`." The D-1 oracle in `pdlc/workflows/__tests__/documentOracles.test.js:253` was upgraded from mere string-presence checks to a reality assertion — `expect(section).not.toEqual(expect.stringContaining("distribution-manifest.json"))` — so the claim is now oracle-covered against drift, not just internally consistent prose.
- **F-02 (Medium)** resolved by `671132b7`: TT-4 (`pdlc/workflows/__tests__/consumerCleanup.test.js:293-330`) now loops `DRAWS = 20` seeded draws per branch (`seeded(BASE_SEED + i*2)` for the "subset alone" branch, `seeded(BASE_SEED + i*2 + 1)` for the "subset + unexpected name" branch), each still routed through `resolveSeed` so `PDLC_PROP_SEED` overrides remain honored. This is a genuine iterated property exercise over the input space rather than a single hand-picked draw, substantiating PROP-CLEAN-8's "arbitrary subsets" claim.
- **F-03 (Low)** resolved by `671132b7`: the vacuous `T33 CLAUDE.md ↔ manifest` block in `pdlc/workflows/__tests__/consolidationBuild.test.js` (109 lines, early-returning `if (!existsSync(MANIFEST_PATH)) return;` on every assertion) is deleted outright, with a comment at `consolidationBuild.test.js:184-187` explaining the retired invariant is already covered live by TT-5 ("the emitted file set set-equals `{pdlc-cli.mjs}`"). No dead no-op tests remain in the suite.
- **F-04 (Low)** resolved by `c25b5e48`: `PLAN-pdlc-plugin-retirement.md`'s per-row Status column is updated across all landed task rows; the only remaining `⬚` glyph in the file is inside the legend/key definition itself (`⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done`), not a task row.

## Questions

None.

## Positive Observations

- The D-1 oracle upgrade (F-01 remediation) is a stronger fix than the minimum ask: rather than merely correcting the prose, it hardens the test so a future regression to a stale manifest claim would fail CI, closing the exact gap the finding identified.
- TT-4's remediation shares a single `BASE_SEED` and interleaves even/odd offsets across the two branches so no seed is reused between the "alone" and "plus unexpected" cases, while keeping the override hook (`resolveSeed`) intact — a clean way to widen coverage without losing determinism or diagnosability.
- The T33 deletion left a clear inline rationale pointing to the still-live TT-5 coverage, so the removal is traceable rather than a silent coverage drop.

## Recommendation

**Approved with minor changes**

No High, Medium, or Low findings remain open against the delta. Nothing else in the delta (CLAUDE.md prose reflow, OPERATIONS.md, README.md, RELEASE-CHECKLIST.md trims) introduces new testability, coverage, or traceability concerns within this review's scope.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 0}

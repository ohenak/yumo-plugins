# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 11 (delta re-review under DECISION FREEZE — v0.6 → v0.7, the PLAN v0.8 cascade absorption)

## Overview

**What this round is.** A delta re-review under DECISION FREEZE of the revision that answers my v10
confirmation. My v10 was an upstream-cascade confirmation that did **not** approve: PLAN had moved
v0.7 → v0.8 (two-case P-A-7 table → three cases, new **case C** live at HEAD) and PROPERTIES still
asserted case B was live, still listed the two case-B gaps as open, and still pinned PLAN v0.7. This
revision is exactly that absorption and nothing else.

**Scope of the delta.** `git diff 23adb5e5..HEAD` on the document is **67 insertions / 32 deletions**
across three commits — `33c93eb6` (header pin), `b49143a9` (§C.4), `a469ef4b` (§G.3) — touching
three regions only: the header's Upstream row and version cell (line 11, line 18: `0.6` → `0.7`),
§C.4's re-red paragraph plus two new paragraphs, and §G.3's routed-errata list. No property
statement, level, owning task, AT partition, bound, enum, oracle, fixture row or count is inside any
hunk. Per the delta protocol I re-verified my five prior findings and scanned only these regions.

**Answer: all five of my v10 findings are resolved, and the revision breaks nothing.** F-01 (High)
is resolved substantively, not cosmetically: §C.4 now re-derives the obligation under case C, carries
the green-at-landing rule, the empty ledger and the fix-before-batch-14 gate consequence, and
extends the same rule to the Group D `learningsSelect.test.js` amendments. F-02 and F-03 (Medium)
are resolved — §G.3 reads "**Still open — one item**" with both case-B items struck into *Also
answered — by PLAN v0.6/v0.7/v0.8*, and the header pins **v0.8** with the three-case structure.
F-04 (Low) is resolved by a new paragraph that names PROP-BOUND-03's zero case as the one arm not
obviously green and cites case C's fix rule as its cover. F-05 (Low) is resolved incidentally, as
predicted, by the strike of the bullet that carried the paraphrase.

**Verification method — repository, not documents.** `git diff 23adb5e5..HEAD` on PROPERTIES;
exact-substring comparison of every quotation the revision adds against `PLAN-…md` at HEAD
(`:492`, `:493`, `:495–:506`, `:594`, `:610`); `git diff f73046ad..HEAD` on PLAN filtered for
`P-A-6` (0 hits — the "byte-unchanged at v0.8" claim is measured, not asserted);
`git show 21edb7c5:pdlc/workflows/__tests__/learningsBlock.test.js` grepped for
`extractInjectableMaterial(` and `sections).toEqual`; `git log -1` on each of `1544fdbd`,
`d462ddd8`, `2cbacada`, `92b7ea0c`; `shasum -a 256` over all five upstream documents;
`ls pdlc/workflows/__tests__/learnings*.test.js`.

**Upstream pins at HEAD, all five verified this round.** REQ `ff605dd3…`, FSPEC `ae75fa62…`,
TSPEC `22dee8ce…`, DECISIONS `56617f5a…` — byte-identical to what v9/v10 recorded, so no second
cascade is open. PLAN is `sha256:281c60c0…`, version cell `| pdlc | Draft | Claude | 0.8 |`
(`PLAN-…md:18`), which is exactly what the revised header now pins. PROPERTIES itself is
`sha256:e9de08bc…` at `a469ef4b`.

**Freeze discipline.** I record two wording observations as `DEFERRED` lines rather than findings:
neither is a defect this delta introduced nor a contradiction with HEAD, and neither would block.

## Properties

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Verdict

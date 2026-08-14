# Cross-Review: product-manager — PROPERTIES (round-5 delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 5 (delta re-review of v0.6 against the tree as it now stands)
**Scope:** Product lens only. Delta from the commit I last reviewed (`a4b12eb7`, v0.6, approved with
one Low in v4). The document itself is byte-unchanged; the branch around it is not, so this round
asks the only question a delta re-review can ask here — did the tree's movement stale anything the
document claims?

## 1. What changed

`git diff a4b12eb7..HEAD -- docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md`
returns **empty**. The document under review has not moved one byte since I approved it in v4. There
is no revision to re-review, so there is nothing that can have been broken *inside* the document, and
every unchanged section stays as approved.

What did move is the material the document derives from and the code it points at:

| Site | Change | Bearing on PROPERTIES |
|---|---|---|
| `PLAN-pdlc-engine-distribution.md` | v0.8 → **v0.9** (`PLAN:12`), seven one-passage round-6 edits | The Upstream cell (`PROPERTIES:5`) still pins PLAN **v0.8** — §2 below |
| `pdlc/engine/__tests__/preflight-baseline.test.js` (new, 115 lines) | T01 shipped | Named by PLAN T01, not by PROPERTIES — no claim to check |
| `pdlc/engine/__tests__/_doubles.mjs` (new, 489 lines) | T03 shipped | §8's engine-side S-1…S-7 row and the three generators — §3 |
| `pdlc/workflows/__tests__/helpers/provenanceDoubles.js` (new, 191 lines) | T04 shipped | §8's module-side row — §3 |
| `docs/_decisions/DECISIONS-plugin-distribution.md` | +26 lines | Project-level record; no PROPERTIES row cites it |

The seven PLAN edits, read from `git diff a4b12eb7..HEAD -- …/PLAN-…md`, are: (a) §4's red-interval
paragraph no longer licenses landing `scripts/fixture-machine.mjs` ahead of T50; (b) T59 gains both
arms of T50's capability discriminator as named legs; (c) DoD items 14/15 narrow "hermetic carriers"
for AT-2.1; (d) the item-12 gloss corrected; (e) §2.1's AT-3.8a label restated as two-sided;
(f) AT-3.8a's discharge re-attributed to FSPEC v0.3; (g) v0.6 changelog scope claim and T50's
"pinned `ubuntu-latest`" wording corrected. **Batch arithmetic, the ownership manifest and §2.1's
set-equality are byte-unchanged**, and no row was added, removed, re-batched or re-scoped — so the
task-side accounting PROPERTIES §4/§5/§8 hangs on is structurally untouched.

## 2. Prior findings

One Low was open from v4, and the author has not revised the document, so it stands unchanged rather
than unresolved-on-the-merits. I re-state it rather than re-litigate it.

**F-08 (Low, v4) — changelog rows out of order — still open.** `grep -n '^| 0\.'` returns `:18` 0.1,
`:19` 0.2, `:20` 0.3, `:21` 0.4, `:22` **0.6**, `:23` **0.5**. Unchanged, still a one-row swap, still
non-gating. It is carried forward below as F-08 rather than renumbered, so the harvest sees one
finding with a two-round life, not two findings. The software-engineer reviewer raised the identical
row in `CROSS-REVIEW-software-engineer-PROPERTIES-v4.md:73` and tagged it `Low / Local`; my tag
matches, so the two reviews do not ship conflicting scope for one defect.

Also still open and **not mine to re-raise**: SE F-02 (`:74`, §4's "is AT-1.6's" wording). It is a
Low in the same non-revised document; I record it here only so a reader of this file does not
conclude the SE round closed clean.

The two Lows I closed in v4 (F-06, PROP-LAUNCH-1's AC-5.5 trace; F-07, §4's observation site) remain
closed — the passages at `PROPERTIES:86` and `:316-323` are byte-identical to what I verified then.

## 3. Did the surrounding movement break anything

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

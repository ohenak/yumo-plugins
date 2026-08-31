# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3

## Delta scope

**The document did not change this round.** `git log aa7e066..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is empty and `git diff --stat` over the same range is empty; the last commit touching the file is still `aa7e06626` ("PROPERTIES v1.1 — G-4 narrowed, revision history"), the exact commit `CROSS-REVIEW-product-manager-PROPERTIES-v2.md` recorded as `REVIEWED-COMMIT:`. This is therefore a **cascade re-confirmation**, not a re-review of a revision: the round exists because upstream pins moved, not because the author edited bytes.

Which pins moved, measured at HEAD (`fd0debb2a`) against the `UPSTREAM-STATE` anchors v2 recorded:

| Upstream | Pinned in v2 | At HEAD | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` | `5f3e8051…` | no |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no |
| DECISIONS | `48522bf9…` | `48522bf9…` | no |
| TSPEC | `f2261510…` | `a06a6032…` | **yes** |
| PLAN | `7c2a888d…` | `87b439ea…` | **yes** |

So the review question this round is narrow and answerable: **does PROPERTIES still hold against the moved TSPEC and PLAN?** I read the PLAN v1.2 delta (te F-01…F-05) and the TSPEC erratum-round commits, then checked every PROPERTIES claim they could touch. Sections untouched by that upstream movement, and approved in v1/v2, were not re-read.

Because the document is byte-identical, **all three findings from v2 remain open by construction** — they were not addressed, and could not have been. They are carried below so they are not lost, but they are not new evidence and none of them gates.

One further piece of ground truth changed the character of this round: **implementation of PLAN T-09 and T-10 has already landed on this branch** (`2fc6d9b57` "T-09 — CLI process-level reds", `df1441b76` "T-10 — CLI structure reds"). `pdlc/engine/__tests__/stats-cli.test.js` (357 lines) and `pdlc/engine/__tests__/stats-cli-structure.test.js` (521 lines) are tracked at HEAD. That let me check two of PROPERTIES' trace claims against shipped test code rather than against documents alone, which is where both of this round's findings come from.

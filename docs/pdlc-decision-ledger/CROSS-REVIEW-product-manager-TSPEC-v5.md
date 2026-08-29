# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.5, bytes unchanged)
**Upstream re-read:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8, sha256:3eb52deb…)
**Date:** 2026-08-28
**Iteration:** 5 (upstream-cascade confirmation, not a full re-review)

## Overview

**The one question.** My v4 approval of this TSPEC was recorded against REQ
`sha256:c18b7e88…` (commit `6fd604320`). Three erratum commits have landed since
(`4e197abe5`, `0756cefed`, `273d0ce00`), producing REQ v1.8 at `sha256:3eb52deb…`. The TSPEC's own
bytes have not moved. Does it still hold against the REQ as it now stands?

**Method.** Re-read `CROSS-REVIEW-product-manager-TSPEC-v4.md`, ran
`git diff 6fd604320..HEAD -- REQ-pdlc-decision-ledger.md` (19 insertions, 11 deletions), then went
back into the TSPEC text that leans on the changed upstream clauses rather than working from the
erratum's own item list (DEC-ERR-03).

**What the erratum actually changed.** Three things, all in REQ §4 C-5 and its downstream recitals:

| REQ change | Was (v1.7) | Now (v1.8) |
|---|---|---|
| `decisionLedger.maxBytes` default | `8000`, typed *positive integer*, recorded as an unmeasured `learningsInjection` analogy | **`12500`**, typed **non-negative integer**, derived from Baseline **v1.2**'s `M-7b`/`M-7c` |
| `decisionLedger.maxEntries` type | *positive integer* | **non-negative integer** (`0` is a valid admits-nothing value, not a fallback to `70`) |
| §6 R-5 / §7 A-1 | "`maxBytes` is an author analogy, not measured" | both bounds re-derived; residual risk restated as *no growth model* (`M-6d`, `M-7d`) |
| Baseline dependency | v1.1 | **v1.2** |

**Why this is not a formality.** Both of the errata this TSPEC raised in §9.2 have now been answered
upstream — and ERR-2 was answered by adopting **this document's own recommendation of 12,500**. That
is the good outcome. But it means the TSPEC is now the stale party: it still ships `8000` as the
normative default in three places, and §3.6's central argument is built on the arithmetic that `8000`
produces. §3.6 is the section rounds 2–3 rewrote specifically to establish that the omission order is
**live on day one**. At `12500` it is not, and REQ C-5's new rationale says so in as many words:
8,000 "sits *below* `M-7b` — drops lines on day one", which is precisely the regime the REQ has now
chosen to leave.

I verified every figure below against the Baseline at HEAD. One reassurance worth stating up front,
because it bounds the repair: Baseline v1.2 did **not** move `Verified at` (`8c673a09f`, unchanged
from v1.1) and is purely additive — it adds the `M-7` rendered-index byte floors. So no measurement
in §3.5/§3.6 is invalidated, the frozen fixture is untouched, and §7.3's transcribed literals (the 41
ids, `6,305`, `22 lines / 4,553 bytes`, `10,859`) all still stand. What has to change is a literal, a
paragraph of arithmetic that depends on it, and some bookkeeping — not the design.

## Delta-Confirmation Findings

<!-- table + FINDING: lines + narrative -->

## Questions

<!-- questions -->

## Positive Observations

<!-- positives -->

## Recommendation

<!-- recommendation -->

## Verdict

<!-- written last -->

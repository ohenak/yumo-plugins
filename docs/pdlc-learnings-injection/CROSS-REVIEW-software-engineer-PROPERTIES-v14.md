# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 14 (delta re-review under DECISION FREEZE — PROPERTIES v0.8 → v0.9)

## Overview

**What this round is.** A delta re-review, under decision freeze, of PROPERTIES **v0.8 → v0.9**. My
v13 approved v0.8 with one Medium (the stale PLAN pin) and one Low. This round the document moved in
three commits — `28de4ad4` (header), `1f1400ab` (§G.3), `cb09985d` (§C.4) — totalling **17 insertions,
12 deletions** across `git diff --stat c575cdc3 HEAD` on the document. I judge only whether my own
prior blocking findings are resolved and whether this revision broke anything.

**The delta, measured.** `git diff c575cdc3 HEAD` on the document returns **three hunks**, and all
three land in regions I named in v13 F-01:

| Region | Lines | What moved |
|---|---|---|
| Header / upstream row | `:11`, `:18` | PLAN pin `v0.8` → **`v1.3`**; case C re-quoted; a v0.9 paragraph explaining the re-pin and its two consequences; version cell `0.8` → `0.9` |
| §C.4 P-A-7 paragraph | `:1123`–`:1138` | case A's window re-quoted as *"before batch 9 (which includes batches 7 and 8)"*; case C re-quoted; the case-C limb restated as record (*"had to be green at the commit that landed it"*) with PLAN v1.2's *"records an outcome, not a pending expectation"* |
| §G.3 struck bullet | `:1326`–`:1336` | *"PLAN at HEAD"* re-pinned `v0.8` → **`v1.3`**; all three case windows re-quoted verbatim; case C's limb given PLAN v1.2's record wording |

No hunk touches §Properties (Groups A–J), §Oracles (§O.1–§O.9), §Fixtures (§F.1–§F.4), §C.1, §C.2,
§C.3, §C.4's inventory table or reversal table, or §G.2. The header's claim — *"No property, oracle,
fixture, AT mapping or coverage row moves at v0.9 either"* — is therefore true by construction of the
diff, and I checked it that way rather than taking the assertion.

**What the revision does, and whether it does it.** This delta exists to discharge my v13 F-01 and PM
v13 F-01/F-02. It resolves **two of the three** consequences I named:

| v13 F-01 limb | Status at v0.9 |
|---|---|
| (a) case C quoted as *"after batch 13, the case that is live at HEAD"*, `grep -cF` **0** against PLAN | **Resolved.** Re-quoted at `:11`, `:1129` and `:1332` as *"batch 13 or later, the case that is live at HEAD"*; `grep -cF` against PLAN returns **1** |
| (b) case A paraphrased as *"before batch 7"* | **Resolved.** `:1127` and `:1331` now quote *"before batch 9 (which includes batches 7 and 8)"*; `grep -cF` returns **2** in PLAN |
| (c) `:1181` still offers case B's *"amended into the ledger by name first"* fallback, retired by PLAN v1.1's P-A-6 | **Not resolved.** `grep -n "amended into the ledger by name"` still returns `:1181`; PLAN `:663` still reads *"the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* |

**Verification method — repository, not documents.** `git diff --stat` and full `git diff` on the
document against `c575cdc3`; `grep -cF` on six load-bearing PLAN quotations the delta writes; the PLAN
version cell read from `PLAN-pdlc-learnings-injection.md:18`; PLAN's changelog rows `:680`–`:684` for
the v0.9→v1.3 chain the header enumerates; PLAN `:559`, `:561`, `:663` read in full for the three case
rows and P-A-6; `git merge-base --is-ancestor 09c7c62f HEAD` for the pinned measurement commit; and a
grep sweep of the document for residual `after batch 13` / `v0.8` pins.

**Conclusion up front.** The delta is a net improvement and broke nothing: PLAN is at **v1.3**
(`PLAN:18`), every version in the chain the header names exists (`PLAN:680`–`:684`), and every one of
the six PLAN quotations the delta writes resolves verbatim at HEAD. One **Medium** stands: the header's
new completeness claim — *"every ruling this document cites is still present at v1.3, so the finding
was pin freshness, not fidelity"* — is **false in two places the re-pin did not visit**, and one of
them is my unresolved v13 F-01(c). Under the freeze it does not block, for the same reason it did not
block in v13: no property, oracle, fixture, AT mapping or coverage row turns on it, and §C.4's own
case-C paragraphs state the correct obligation twice, twenty lines above the stale sentence.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

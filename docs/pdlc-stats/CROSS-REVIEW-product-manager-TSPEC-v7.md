# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.5, erratum round 5)
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** Delta confirmation (erratum)

## Overview

**Scope of this round.** A targeted erratum edit (`fb69424c3..7747eb78f`, five commits) against a
TSPEC I approved at v6. I did not re-review the document. I read the diff, verified the dispatched
item against the artefacts it claims, then — as `DEC-ERR-03` requires — re-grounded the TSPEC's
upstream citations on **REQ and FSPEC at HEAD**, not on the dispatched item list.

**The dispatched item is discharged.** The claim that §2.1 and §8/RK-1 "still list five" is itself
stale, and the v1.5 changelog says so rather than silently rewriting: §1, §2.1, §6.4, §7.3 and RK-1
all carry the sweep-derived **ten**, and §2.1's table names both sibling-feature document edits
(`docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26`; that feature's FSPEC §5.2 per-class
five → six) as explicit `K-7`-owned rows. I checked the dispatch's "`K-1` derives nine" against
`DECISIONS-pdlc-stats.md` at HEAD: `K-1` says **ten** and partitions all ten across `K-1`/`K-3`/
`K-8`/`K-9`. The "nine" survives only as a superseded mention of Option A's pre-correction count.
TSPEC and DECISIONS agree. Nothing in the item list is outstanding.

**But the round does not pass.** The dispatched items are necessary, not sufficient. FSPEC moved
**v1.5 → v1.7** after the grounding TSPEC v1.4 recorded, and v1.7 rewrote the very `BR-16` passage
TSPEC §4.3 quotes as its authority — reversing the worked example's verdict. TSPEC §4.3 now
attributes to FSPEC a claim FSPEC explicitly denies, and states a falsehood about a real archive
path this feature's tests bind to. That is `F-01`, and it is **inherited**: the erratum edit did not
touch §4.3, and did not introduce the divergence. The v1.5 changelog's own attestation that upstream
"neither moved" is what let it pass unnoticed, and that claim *is* delta-introduced (`F-02`).

Both findings are recorded below with provenance and locality tags. The High is tagged `inherited`
deliberately: this is FSPEC-movement fallout that belongs back in the owning phase, not a defect the
erratum edit created, and it should route rather than halt.

## Architecture

### What the erratum edit changed

Five commits, four wording corrections in the body plus a changelog row. I verified each against the
artefact it describes rather than against the changelog's description of it.

| Edit | Claim | Verified at HEAD | Verdict |
|---|---|---|---|
| (a) §1 cost sentence | The sibling-feature carve-out was joined to the ten with "including", placing *inside* the ten an edit §2.1 and RK-1 place *outside* it; corrected to a coordinating "and … that sits **outside** that ten" | §2.1's table does list the two `docs/completed/pdlc-engine-distribution/` rows below the ten in-repo rows, and `K-1`'s partition in DECISIONS covers sites 1–10 only, assigning the sibling edits to `K-7` | Correct, and it removes a genuine scoping contradiction |
| (b) RK-1 opening clause | Same mis-scoping, corrected the same way | RK-1 now reads "the ten-site vendoring co-change (§2.1), together with the two sibling-feature document edits that sit **outside** the ten (§2.1's last two rows, owned by `DEC-STATS-01`'s `K-7`)" | Correct, and consistent with (a) |
| (c) §6.4 "four script-side enumerations" | Renamed "the four enumerations `assertAdditiveOnly` reads", because three sit under `pdlc/engine/scripts/` and the fourth is `_tspec-packed-set.mjs` under `__tests__/` | `loop-distribution.test.js:137,145,153,166` — four `assertAdditiveOnly` calls reading `../scripts/prepack.mjs`, `../scripts/publish-preflight.mjs`, `./_tspec-packed-set.mjs`, `../scripts/fixture-machine.mjs`. `_tspec-packed-set.mjs` resolves to `pdlc/engine/__tests__/` | Correct. The old name was factually wrong about one of the four; the new one names the subset by its falsifier |
| (d) §2.1 `learningsPremises.test.js` row | Now quotes P-1's shipped title verbatim | `pdlc/workflows/__tests__/learningsPremises.test.js:78` — `test("MODULE_NAMES is exactly the four canonical workflow modules", …)`. The TSPEC quotes this string character-for-character | Correct. A co-change grep for the quoted phrase now resolves; the prior paraphrase ("exactly four workflow modules") would not have |

### Does the delta break anything previously approved?

No. All four edits are scoping or citation corrections. I confirmed no count, behavioural claim,
type, signature, oracle or code sketch moved: the diff touches the changelog block, one clause in
§1, one table cell in §2.1, one sentence in §6.4 and one clause in RK-1's risk cell. The `ten`, the
`4 + 15 + 6 + 1` re-baseline, the `5 → 6` derived class-size assertion and P7-02's
`vendoredClassWord` ternary arm are all unchanged. Nothing I approved at v6 regressed.

### Where the round fails: upstream moved and §4.3 did not

TSPEC v1.4's changelog recorded "**Upstream moved: FSPEC v1.4 → v1.5.** Re-grounded first." Since
that grounding, FSPEC has advanced to **v1.7** across three commits (`ae7eb8f1a`, `a81a3c45c`,
`d3843cfe7`). v1.6 and v1.7 both edited `BR-16` — the rule TSPEC §4.3 leans on most heavily.

FSPEC `BR-16` at HEAD (`FSPEC-pdlc-stats.md`, §4.2) now reads:

> A directory whose only `CROSS-REVIEW-` basenames are the out-of-catalogue
> `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files BR-06 reports as malformed reports `harvested`, not a
> measured ratio. That basename shape is cited from `docs/completed/pdlc-advisory-wave-gate/`, which
> carries four of them **alongside** grammar-matching cross-reviews and so reports a measured ratio
> itself; only the shape is borrowed, not the verdict.

TSPEC §4.3 still says FSPEC "names the `docs/completed/pdlc-advisory-wave-gate/` shape — a harvested
directory whose only `CROSS-REVIEW-` basenames are the out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` form — as reporting `harvested`."

FSPEC v1.7 added its second sentence specifically to deny that reading. The ground truth agrees with
FSPEC: `docs/completed/pdlc-advisory-wave-gate/` holds **62** `CROSS-REVIEW-*` files, of which only
**four** are the out-of-catalogue `REVIEW` form; the other 58 match `BR-14`'s grammar. That directory
reports a **measured ratio**, not `harvested`. Detail in `## Test Strategy` below.

## Interfaces

_(pending)_

## Data Model

_(pending)_

## Test Strategy

_(pending)_

## Open Questions

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Positive Observations

_(pending)_

# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.10)
**Date:** 2026-08-31
**Iteration:** 11
**Round type:** Delta confirmation on a previously approved REQ (frozen round)

## Scope

The erratum under confirmation is `d16ea5c50..e7035da2e`, minting REQ **v1.10**. Three routed
items, all raised in round 9:

| Item | Where it lands |
|---|---|
| C-5's `maxBytes` rationale attributed the whole 3,204-byte slack to per-record framing | `REQ:194` C-5 row, edited |
| Header *Cross-Reviews* row named v1–v6 while later rounds exist | `REQ:13`, edited |
| v1.9 note named `§1` as a swept site; the re-pinned line sits in `§2` G-1 | `REQ:35`, edited |

Plus the item this confirmation was dispatched against: the stale `TSPEC v0.7` literals in the
`§ Context` passage and the DEC-DECLEDGER-10/-12 re-evaluation-trigger row, against a TSPEC whose
HEAD is **v1.2**. The REQ's disposition of that item is a **routing**, not an edit (`REQ:29-31`).

I read the diff, then verified each claim against the tree rather than the commit message, and
re-read the two upstreams this REQ leans on — the corpus Baseline and the routed item's actual
loci — at their current bytes.

## Did the routed item land?

**The routing itself is correct.** `REQ:29-31` claims the stale literals "live in
`DECISIONS-pdlc-decision-ledger.md` ... not in this REQ, which names no TSPEC version anywhere".
Both halves check out:

| Claim | Verification | Verdict |
|---|---|---|
| The REQ names no TSPEC version | `grep -n "v0\.7\|TSPEC v"` over the whole REQ returns exactly one line — `:30`, the routing sentence itself, which *mentions* the literal as the name of the defect rather than *using* it as a pin | **True** |
| The literals live in DECISIONS | `DECISIONS:36`, `:98`, `:398` each carry `TSPEC **v0.7**` | **True** |
| TSPEC HEAD is not v0.7 | `TSPEC:17` reads `| Draft | se-author | 1.2 | 2026-08-30 |` | **True — the item is real** |
| The derived figures still agree | Baseline `M-7b` = 9,296 / 63 records, `M-7c` = cap 12,500 clearing by 3,204, both at `Verified at 8c673a09f`; `12500 − 1200 = 11,300` unchanged | **True — a version label is stale, no measured value moved** |

So declining to edit is the right call, and the substantive claim the stale figures support still
holds. **But the routing pointer under-enumerates its own sweep sites, in two ways.**

**First, there is a third locus the pointer does not name.** `REQ:30-31` names two — `§ Context`
and the DEC-DECLEDGER-10/-12 row. `## Context` begins at `DECISIONS:51`, so `:98` and `:398` are
inside the two named loci, but **`DECISIONS:35-36` is not**: it is the v1.4 changelog note, above
`## Context`, and it reads "`TSPEC-pdlc-decision-ledger.md` **is now v0.7**" — present tense, a
live claim about HEAD, not a tensed historical record. An se-author sweeping exactly the two named
sites leaves it stale and buys another erratum round. I held the v1.8 cascade pointer to **set
equality rather than containment** at v10 and praised it for surviving that bar; the same bar
applied here returns two of three.

**Second, this erratum staled a second member of the same tuples.** `DECISIONS:98` and `:398` do
not pin TSPEC alone — they pin a HEAD tuple, `(TSPEC v0.7, REQ v1.9 / FSPEC v1.3 / Baseline v1.2)`.
FSPEC is `v1.3` at HEAD (`FSPEC:17`) and the Baseline is `v1.2` (`baseline:7`), so those two are
current. `REQ v1.9` was current when the item was raised and stopped being current **when this
commit minted v1.10**. The routing note characterises the routed defect as "the stale
`TSPEC v0.7` literals", which now understates the sweep by one literal that this very edit created.

Neither point contests the routing. Both are about the completeness of the instruction handed to
the next author, so both are Medium, not High: no acceptance criterion, threshold or oracle moves
on either.

## Did the delta break anything previously approved?

## Disposition of my v10 findings

## What I found by re-reading upstream at HEAD

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

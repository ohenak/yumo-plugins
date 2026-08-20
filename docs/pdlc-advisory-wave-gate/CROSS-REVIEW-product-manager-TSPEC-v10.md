# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.9)
**Date:** 2026-08-19
**Iteration:** 10
**Scope:** Local

## Re-grounding on upstream HEAD

This is the check the round's own changelog claims to have performed, so I ran it first and
independently rather than reading the claim.

| Upstream | HEAD sha256 | Anchor carried in v1.9's changelog / my v9 `UPSTREAM-STATE` | Match |
|---|---|---|---|
| REQ | `817b6745…8a7a8` | `a10396e8…d9645` | **differs** |
| FSPEC | `82f74a2d…61c3e` | `82f74a2d…61c3e` | identical |

FSPEC has not moved. REQ has: it is at **v1.9** at HEAD, advanced by commit `e619b6d6`
*"docs(req): v1.9 — §1 ledger, NFR-4 (v7 F-06, F-07)"*. That commit is inside this review's range
and, by author timestamp, landed at **16:42:31**, roughly fifteen minutes **before** the five
TSPEC v1.9 commits (`12f506bd` 16:57:27 → `3f5a65f9` 16:59:52). The re-grounding assertion was
therefore already false at the moment it was written, not merely stale by drift. That is F-01.

I then checked whether the movement costs the design anything, because a false basis and an owed
absorption are different sizes of problem:

- REQ v1.9's own changelog says *"Restoration, not decision … No decision reopened."* Four of the
  seven items are restorations of previously approved wording reverted by a rebase.
- The one item that touches this round's subject matter — §5 C-2's `advisory.waveBudgetPerRun`
  default `1` per Q-1 (`REQ:237`, `:239`) — **agrees** with TSPEC §4.4's default `1`.
- NFR-4's revision (`REQ:500`–`:506`) changes the *rationale* for excluding gate-command time (the
  window now "closes at the attempt's verdict" rather than the gate "running between attempts")
  and explicitly preserves the conclusion: no subtraction, no carve-out. TSPEC cites NFR-4 nowhere,
  so nothing in it contradicts the new wording.

So no substantive absorption is owed, and I am not asking for design work. What is owed is an
honest basis: the document currently offers a byte-identity claim as its evidence that it re-grounded,
and that evidence is false. Given how much of this feature's convergence has rested on the
re-grounding ritual, a changelog that certifies an upstream state that HEAD contradicts is worth one
correcting round.

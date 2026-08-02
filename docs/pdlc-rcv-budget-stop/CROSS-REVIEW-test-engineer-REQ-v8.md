# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.2, 458 lines / 55,125 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v7 finding is closed, plus a scan of the text added or rewritten since v7 for new issues. Sections unchanged since v1…v7 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `8a60091..dde2670` (5 commits touching the REQ)
**Date:** 2026-08-01
**Iteration:** 8

## Disposition of v7 findings

All four are **closed**, and the two Mediums are closed by a change of design rather than by adding
the cells I asked for — the interim decision procedure was **removed** instead of being made
writable. I checked each closure against the artifacts the claims cite, and I checked the new design
for the failure modes it now inherits (see F-37, F-38).

| v7 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-33 | Medium | **Closed, by removing the emission rather than by naming a reason** | I asked for repair (i) — *"say the interim refusal emits **no** S-16"* — and v2.2 goes further: there is no interim refusal at all, so there is nothing to render. O-10 now states it explicitly: *"**No interim leg asserts an S-16 notice**: the enum is closed at three, all three are false of a well-formed region, and an entry that declines to decide is not an entry that found the region corrupt"* — which is the argument I made, adopted as text. The catalogue's closure claim at `pdlc-rcv-catalogue.md:63` stays true, no fourth reason was minted, and the character-for-character bar of catalogue §3 is no longer being asked to supply a string no rule can produce. |
| F-34 | Medium | **Closed, both halves, with cells** | The pair is now stated cell by cell exactly where I said the rest of O-10 states them. *Leg 1* is pinned at **`H = 1`, `A = 0`** with one `HALT-REASON:` line and a readable `RESOLVED: yes`, and asserts four positive observables (one `WINDOW-START: {N}` appended at the region's end, `A = H = 1` after, no S-16, no refusal and no ❌ row, **≥ 1** dispatch). *Leg 2* no longer says *"grants the window normally"* — the phrase with two readings — but names the discriminating conjuncts I asked for: *"`H = A = 0`, highest round below `windowEnd(1)` ⇒ `W = 1`, the ordinary window opens — **no** refusal, **no** S-16, **no** answering line written, both counts still `0`, and **≥ 1** dispatch"*. The `A = H` fail-open reading is now foreclosed by the *no answering line, counts unmoved* conjuncts, and O-10 says so in its own words, citing AC-1.5(4)'s *"the loop writes nothing and grants nothing"*. Both legs also survive row 18, which the paragraph claims and which I verified: leg 1's region is well-formed (`H − A = 1 ∈ {0, 1}`, no answering line to range-check) so AC-7.1 will call it valid and still grant; leg 2's region is empty, which AC-1.5(4) declares valid vacuously, and `A < H` is false there either way. |
| F-35 | Low | **Closed at the load-bearing site** | X-06's *"exactly as today"* is gone and replaced with the narrower claim I proposed: *"leaving every branch on the path AC-1.1–AC-1.5(3) and (5) already put it on"*. Two rhetorical restatements survive — X-06's *"the only interim whose behaviour is **today's**"* and R-14's *"every branch keeps HEAD's behaviour"* — but each is immediately scoped by a trailing clause naming AC-1.1–AC-1.5(3) and (5), so a test author reading either sentence to the end reaches the correct expectation. Not re-filed. |
| F-36 | Low / Process | **Closed as filed; the mechanism it warned about is visible in the numbers** | The v2.0 split record moved to `docs/_constraints/pdlc-rcv-split.md` (77 lines, §1–§5), and the REQ is 55,125 bytes against `SOFT_BYTE_LIMIT=55296` — 171 bytes of headroom against v2.1's 9, at 458/630 lines. Relocation was the right instrument (§10 keeps a one-line summary plus the pointer, so no reason was deleted). Worth recording that it bought less than it looks: roughly 2.4 KB left the file and 2.2 KB of it was immediately spent by X-06, R-14 and O-10, which is the exact pattern F-36 described. Re-filed once, compressed, as F-40. |

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_

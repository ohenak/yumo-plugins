# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.3, 455 lines / 55,238 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v8 finding is closed, plus a scan of the text added or rewritten since v8 for new issues. Sections unchanged since v1…v8 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `dde2670..HEAD` (5 commits touching the REQ)
**Date:** 2026-08-01
**Iteration:** 9

## Disposition of v8 findings

All four are **closed**, and both Mediums are closed at the sites I named, in the form I proposed —
F-38's by the subtraction I asked for rather than by adding prose. I checked each closure against the
artifacts the claims cite (including the two relocations and the paired-edge discharge), and I
checked the replacement text for the failure modes it now inherits (see F-41).

| v8 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-37 | Medium | **Closed at all three sites, with the wiring/meaning distinction intact** | AC-1.5(4) gains the paragraph at `:310`–`:314`, immediately after the *when it is **false*** bullet: *"at this REQ's ship the gate evaluates its **first two conjuncts only**, so the dispositions above — and §4.1's two rows that restate them — are the **target state**, reachable at `REQ-RCV-07`'s commit, not behaviour this REQ's own delivery exhibits. The predicate's meaning and disposition are fixed here so that commit adds no requirement; O-10's interim legs are what this REQ's PROPERTIES derive from."* The last clause is more than I asked for and is the useful part: it tells a PROPERTIES author *which* text to derive from, so the two surfaces cannot be mistaken for an acceptance surface at this ship. §4.1's two derivation rows are scoped precisely rather than wholesale — the `W` row now reads *"no absent or invalid value ever widens the window — **the validation guard is unwired until `REQ-RCV-07` (X-06)**, so the ***invalid*** half is target state"*, which correctly leaves the *absent* half shipped (that is the `W` = 1 default, decidable today), and the clearance row appends *"**target state; that conjunct is unwired until `REQ-RCV-07` (X-06)**"*. "The dispositions above" is unambiguous in place: the only dispositions above it are the false bullet's four. |
| F-38 | Medium | **Closed by the subtraction, and the 0-dispatch clause was tracked down with it** | O-10 now reads *"**The non-validating legs are `REQ-RCV-07` O-10's in full** (X-06) — *a region that does not validate consuming no clearance*, the refusal legs and their renders belong to the REQ that wires the conjunct and can run them on a production path; driving an unconsulted seam here would assert over a call graph this REQ's entrypoint never traverses, and would keep passing if the seam were deleted."* The reason is stated next to the handover, which is what stops a later compression pass from restoring the legs. The stranded closing clause went with it: the call-count sentence is now *"exactly **0** dispatches on the exhausted-budget entry, **≥ 1** on the control entry"* — the *"and on a non-validating entry"* half is gone. The replacement obligation is the one I proposed: *"one contract leg, on the production path: the injected function's signature, and the interim composition calling it **exactly 0 times**"*. I also checked the consequential deletion — v2.2's *"the granting legs above drive the *validate* seam explicitly to **true**"* is gone, which it had to be, since a granting leg that drives the seam contradicts a composition that calls it 0 times. F-41 is about that leg's fixture, not about the handover. |
| F-39 | Low | **Closed, and by the stronger of the two repairs I offered** | Leg 1's vacuous *"highest round below `windowEnd(N)`"* is replaced with concrete rounds: *"highest round on the branch = `windowEnd(1)` = **3** ⇒ the entry **grants** — exactly one `WINDOW-START: 4` appended at the end of the region"*. I re-derived the whole fixture: window `[1, 3]` exhausted ⇒ `H = 1`, `A = 0`, `H − A = 1 ∈ {0, 1}` so the region is valid under AC-7.1 (swap-stability preserved); `N` = one past the highest round = **4**, so `WINDOW-START: 4` is the right literal; the granted window is `[4, 6]`, so round 4 is admitted and the `≥ 1` dispatch conjunct is load-bearing rather than accidental. Leg 2's parallel phrase stays as it was. The two legs now read as a pair *and* constrain as a pair. |
| F-40 | Low / Process | **Closed as filed — the relocations are faithful, and I verified both destinations** | Two more relocations landed (`pdlc-rcv-split.md` §5.1, the *why unwired* argument; §6, the catalogue delegation) plus compression at §7, §10 and §4.1's preamble. I read both destination sections against the text that left: §5.1 carries all four horns — refusing, granting, **the narrower procedure**, co-delivery — with the same mechanism citations (`AC-1.4 clause 1`, `AC-7.4`, `MAX_REVIEW_ROUNDS` 3, row 18's own Phase R); §6 carries the delegation **including** the catalogue §3 row-schema clause (*"AC-1.5(4)'s step-4 path"* ⇒ AC-7.1 step 4's, *"fixed by `pdlc-rcv-budget-stop` §6"* ⇒ `REQ-RCV-07` §6's) that the compressed §4 pointer no longer states. Nothing test-derivable was lost in either move. The paired-edge obligation was also discharged in-commit again: `3105033` carries v2.3's X-06/R-14 revisions into `REQ-RCV-07` X-07/R-16 **and** its O-10, which now owns the non-validating legs the REQ handed over — so F-38's subtraction did not drop the legs on the floor. Re-filed once, compressed, as F-42: the file grew, not shrank. |

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

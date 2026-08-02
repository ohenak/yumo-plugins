# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.1, 492 lines / 55,287 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v6 finding is closed, plus a scan of the text added or rewritten since v6 for new issues. Sections unchanged since v1…v6 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `8d77618..8a60091` (7 commits touching the REQ)
**Date:** 2026-08-01
**Iteration:** 7

## Disposition of v6 findings

All three are **closed**, and the Medium is closed in a stronger form than I asked for: I proposed a
controllable seam defaulting to *invalid*, and the revision correctly rejected that default as worse
than none before adopting the seam. I verified each closure against the artifacts the claims cite
rather than against the changelog.

| v6 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-30 | Medium | **Closed, both halves, and the first half improved on the proposal** | *Seam half:* X-06 now names the shape outright — *"an **injected, controllable seam** whose **production default is the interim shape**: valid on the empty region, invalid on any non-empty one"* — and scopes the prohibition where I asked: *"A production default of *valid* is the fail-open AC-1.5(4) exists to close; that prohibition scopes to the **default**, not to the seam, which tests drive to either value (O-10)."* The two incompatible readings are gone. It also **rejected my suggested default** with an argument I checked and accept: a constant *invalid* refuses on every entry (AC-1.5(4)'s false disposition is not scoped to entries carrying a clearance), so it would refuse every document-typed phase on every feature and block the delivery of its own replacement. The chosen shape is the real predicate restricted to the one region it can decide — AC-1.5(4) already says *"The empty region satisfies it vacuously — an empty region is valid, not corrupt"* — so the interim default is a **restriction** of the shipped semantics, never a contradiction of them. That is the right construction. *Oracle half:* O-10 now says *"**Each gate leg names the seam value it drives** (X-06): the granting legs above drive the *validate* seam explicitly to **true** and never read its production default; the non-validating leg drives it to **false**"*, and adds the interim-ship pair. The pair is the leg I said was missing; F-33 and F-34 below are about its **cells**, not its existence. |
| F-31 | Low | **Closed, and checked against the file** | R-14 and §3.1 both drop *"immediately behind"*. §3.1 now reads *"queued at **`Order 18`** — `docs/_queue/QUEUE.md`'s stated net pickup order is **10 → 12 → 18**, so X-06's interim shape is live across a whole intervening feature and row 18's own Phase R"*. `QUEUE.md` agrees line for line: row 18 is `pdlc-rcv-reset-region`, row 12 is `pdlc-rcv-finding-quality`, and its note states *"Net pickup order: **10 → 12 → 18 → 17 → 11**"*. R-14 goes further than a wording fix and re-bases the whole mitigation — *"**Mitigated by fixing the interim *shape*, not by sequencing.** Sequencing is too weak at that distance"* — which is the correct response to the finding rather than the minimum one. |
| F-32 | Low | **Closed on the REQ side, which was the half that was mine** | §4's rule is no longer keyed to a phrase: *"read **every catalogue reference to AC-1.5(4)'s algorithm, its numbered steps, or the refusal renders it produces** as `REQ-RCV-07` AC-7.1 … The rule is over the references, not one phrase, because the four rows word them differently"*. That reaches S-14's *"AC-1.5(4)'s validation"* (`pdlc-rcv-catalogue.md:61`) and S-16's *"AC-1.5(4) step 4"* (`:63`), which the old rule did not. Catalogue §3's two pointers are now named individually and repointed — I confirmed both still read as quoted at `:118` (*"AC-1.5(4)'s step-4 path"*) and `:124` (*"fixed by `pdlc-rcv-budget-stop` §6"*), so the rule is stated over text that exists. *"The catalogue may say so directly once `REQ-RCV-07` ships"* correctly leaves the shared-file edit to the REQ that will own the clauses. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

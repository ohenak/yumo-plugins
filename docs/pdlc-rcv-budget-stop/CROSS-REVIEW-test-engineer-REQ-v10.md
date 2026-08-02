# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.4, 442 lines / 55,273 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v9 finding is closed, plus a scan of the text added or rewritten since v9 (`26d886f..HEAD`, 11 commits touching the REQ) for new issues. Sections unchanged since v1…v9 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `26d886f..HEAD` — +51 / −64 lines
**Date:** 2026-08-01
**Iteration:** 10

## Disposition of v9 findings

Both are **closed**, and F-41 is closed in the exact form I proposed, at the site I named. I checked
the closure against the fixture arithmetic rather than the wording, and I checked the round-9
relocations against their four destinations. F-42 is re-filed once, as F-46, because the headroom it
tracks fell again.

| v9 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-41 | Medium | **Closed as proposed, with the ordering half settled by the same clause** | O-10's contract leg now reads *"the interim composition calling it **exactly 0 times** — **asserted on *leg 1's* fixture**, the only one that defeats the two earlier conjuncts and therefore the only one a wired implementation would answer differently (on leg 2's region `A < H` is false, so a wired gate short-circuits and never reaches the seam either — 0 calls under every wiring, an oracle that cannot fail). Naming leg 1 also settles the evaluation-order half: on that fixture every conjunct is reached under any order."* I re-derived it: leg 1 is `H = 1`, `A = 0`, `RESOLVED: yes` readable ⇒ conjuncts 1 and 2 both hold, so the gate reaches the third and a wired implementation calls the seam ≥ 1 against the interim's 0 — the assertion inverts at row 18 and is falsifiable today. The parenthetical also records *why* leg 2 was rejected, which is what stops a later pass from "simplifying" the leg back onto the vacuous fixture. |
| F-42 | Low / Process | **Acknowledged in substance and acted on — four relocations landed — but the headroom fell again; re-filed once as F-46** | The round moved four blocks out (AC-1.5(4)'s conjunct arithmetic → split §5.2; the refusal-is-not-a-halt argument → split §5.3; §6's row notes → baseline §3.1; §4.1's durability map → baseline §3.2), including the ~800-byte block I nominated as the next relocation. I read all four destinations. Net effect on the gate this finding tracks: 55,238 → 55,273 bytes — headroom **58 → 23**, the sixth consecutive round to finish inside a few hundred bytes of the size gate and the second running in which the file **grew** while shedding several KB. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

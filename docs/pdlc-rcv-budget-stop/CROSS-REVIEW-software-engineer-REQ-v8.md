# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.2, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 8
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. Baseline reviewed at v7 was the REQ as of `48930d9`; this review covers
`48930d9..HEAD` on that file — commits `59ba426`, `d1b2a46`, `bd8d261`, `4bc9c3b`, `dde2670`
(37 insertions, 71 deletions across §0 header/changelog, §3.1 X-06 and *Consequence for sequencing*,
§7, §8 O-10, §9 R-14, §10) plus the new shared file `docs/_constraints/pdlc-rcv-split.md` and the
paired revision of `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` X-07/R-16. Sections
unchanged since v7 were not re-litigated.

## 1. Disposition of the v7 findings

**All four are closed, and the High is closed by the exit I recommended rather than by an argument
for the shape I objected to.** v2.2 takes option (a): AC-1.5(4)'s third conjunct is **not wired at
this REQ's ship**, the interim composition does not consult the seam, and the interim behaviour is
HEAD's. That removes the defect rather than mitigating it, and it was carried to the sibling in the
same commit-shaped discipline the v7 F-03 asked for.

| v7 id | Sev | Status | What was checked |
|---|---|---|---|
| **F-01** | **High** | ✅ closed, by option (a) | X-06 now reads *"the conjunct is **not wired into the gate at this REQ's own ship** — `REQ-RCV-07` wires it in the same commit that lands AC-7.1's decision procedure. Until then AC-1.5(4)'s gate is its **two decidable conjuncts** (a readable `RESOLVED: yes`, and `A < H`)"*, and states the consequence in the terms I asked for: *"**no refusal and no S-16 on any branch, region or none, leaving every branch on the path AC-1.1–AC-1.5(3) and (5) already put it on.**"* The bricking mechanism I traced is now the document's own stated reason for not shipping an interim procedure — *"refuses on **non-emptiness** … a region is non-empty exactly when the phase has halted (AC-1.4 clause 1) … `RESOLVED: yes` could not clear it (the marker is read *inside* the failing gate) … including row 18's own Phase R"*. R-14 carries the same words and time-boxes the residual to R-10's hand-edited-region fail-open, *"no wider than HEAD's, where it is open unconditionally"* — which is the correct accounting: at the interim the feature adds no exposure that HEAD does not already carry. O-10's interim legs were rewritten to grant rather than refuse. **The one thing the fix leaves behind is a back-pointer gap** — F-01 below, Low. |
| **F-02** | **Medium** | ✅ closed, by construction | The leg that demanded an S-16 notice no member of the closed enum was true of is gone. O-10 now states *"**No interim leg asserts an S-16 notice**: the enum is closed at three, all three are false of a well-formed region, and an entry that declines to decide is not an entry that found the region corrupt."* Both replacement legs assert `no reset-region-corrupt` / `no S-16` positively, so the enum's closure is now defended by the tests rather than violated by them. Leg 2 also keeps the `A = H` fail-open guard I did not ask for and which the leg needed (*"no answering line written, both counts still `0`"*). One fixture-binding nit — F-04 below, Low. |
| **F-03** | **Medium** | ✅ closed, in the same words | I read `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` at HEAD. X-07 now reads *"**Paired edge — revise with `REQ-RCV-01` X-06 and R-14 in the same commit, in the same words** … that REQ ships with the conjunct unwired: its gate is the two decidable conjuncts … the call site exists as an injected seam the interim composition does not consult, and no interim entry is refused"*, and the superseded *"immediately behind row 10"* is replaced by *"`Order 18` (net pickup 10 → 12 → 18)"*. R-16 now reads *"**Mitigated by leaving the conjunct unwired on row 10, not by sequencing and not by a stub**"* and explicitly retracts the old claim — *"A stub returning *invalid* is **not** safe"* — with the same non-emptiness argument. Both ends of the edge now agree on all three things `pdlc-rcv-split.md` §5 requires them to agree on: wiring, queue distance, and the cost of an interim procedure. |
| **F-04** | Low | ✅ closed, by relocation rather than by compression | The document is now **458 lines / 55,125 bytes** against the 630-line / 55,296-byte soft threshold — headroom went from **9 bytes to 171**, and it was bought by moving §10's split narrative to `docs/_constraints/pdlc-rcv-split.md` (`4bc9c3b`), which is the remedy `check-req-size.sh`'s message names. The relocated file is a real shared artifact, not a dumping ground: `REQ-RCV-07` cites its §5 too, so the paired-edge rule now has one home for both halves. 171 bytes is still thin, and §4.1's durability table and §6's threshold rows remain the next candidates — noted in Q-02, not re-filed. |

**Independent re-verification of the new cross-document claims:**

- **`docs/_constraints/pdlc-rcv-split.md` exists, is tracked, and has the sections cited.** §10 cites
  its *"§1–§4"* for the narrative and the header row cites *"§5"* for the paired edges; the file's
  headings are `## 1. What happened`, `## 2. What moved, and where`, `## 3. What stayed…`,
  `## 4. Consequences`, `## 5. Paired edges…`. Both citations resolve.
- **§7's relocated collision rule is present at the new home**, `pdlc-rcv-split.md` §5 line 70–72:
  *"`O-*`, `R-*` and `X-*` ids are **not** namespaced and do collide across the split, so every
  cross-document citation must name the owning REQ."* The **enumerated** collisions (`O-10`, `O-12`,
  `R-10`, `R-14`) did not survive the move — the rule did, which is the load-bearing half, so I am
  not filing it; noted only so the trail is complete.
- **The size figures are mine, not the document's**: `wc -lc` gives 458 / 55,125; the thresholds are
  `check-req-size.sh:47-48`.

## 2. Disposition of the v7 questions

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict

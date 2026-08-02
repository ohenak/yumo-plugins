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

| v7 id | Status | Note |
|---|---|---|
| **Q-01** (was option (a) rejected, and on what grounds?) | ✅ answered by adopting it | v2.2 takes option (a) and X-06 states the rejection of the alternatives in the cell: co-delivery *"was rejected because it would make this REQ's unconditional saving wait on a successor it does not need as a requirement"*, and an interim procedure is rejected by the non-emptiness argument. The reason now sits next to the choice, which is what I asked for. One over-reach in the rejection's scope — F-02 below, Low. |
| **Q-02** (is co-release required, and does that owe a `RELEASE-CHECKLIST.md` line?) | ✅ answered, and the answer follows from the new design | R-14: *"**Nothing therefore requires the two halves to land in the same plugin release**: distribution is per-commit (O-11), and a consumer installing between rows 10 and 18 gets an interim that behaves as HEAD does, so no `pdlc/RELEASE-CHECKLIST.md` line is owed."* That is the right shape of answer — it is a *consequence* of the interim being HEAD's behaviour, not an independent assertion, so it stays true exactly as long as X-06 does. Under v2.1's shape the answer would have had to be *yes*; the design change made the question moot rather than the answer convenient. |
| **Q-03** (does anything exercise the seam's **production** wiring on a granting path?) | ✅ answered, and inverted | There is now no production wiring to exercise: the interim composition *"does not consult it — so there is no production default to get wrong"*, and O-10's two interim legs run the production composition *"with no seam override"*. The question moves to `REQ-RCV-07` for the commit that wires it. It does raise a different implementability point about a seam production never calls — F-03 below, Low. |
| **Q-04** (carried, `REQ-RCV-07`'s `W`-visibility question) | — | Still that REQ's. Recorded only so the trail is unbroken for harvest. |

## 3. Findings

Scanned the changed sections only — the §0 header row and v2.2 changelog, §3.1's X-06 and
*Consequence for sequencing*, §7's relocated collision rule, §8 O-10, §9 R-14, §10's relocation and
paired-edge rule — plus the two files the change reaches outside this document
(`pdlc-rcv-split.md`, `REQ-pdlc-rcv-reset-region.md` X-07/R-16). **No High, no Medium; four Low.**
Every one is a back-pointer, a scope-of-claim, or a fixture-binding nit with a one-sentence fix;
none changes a behaviour, an acceptance criterion's meaning, or a threshold.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AC-1.5(4)'s own text still states the third conjunct and its entire false branch unconditionally, with no back-pointer to X-06's *not wired at this ship*.** Lines 295–310 read *"The third conjunct, as a named predicate … when it is **false**, fail-closed and in all four respects at once: **`W` = 1**; the clearance is not consumed …; the run report emits exactly one `reset-region-corrupt: {reason}` notice; and the entry **refuses the phase** rather than halting … with the feature's queue row written `halted`"* — the behaviour X-06 has just established does not ship at row 10. §4.1's clearance row says the same (*"the clearance is unconsumed exactly when `RESOLVED: yes` is readable, `A < H`, **and the region validates**"*, *"a region that does not validate ⇒ the refusal AC-1.5(4) fixes"*), and X-06 does name it (*"`W` is read as §4.1 states without the validation guard"*) — but the naming runs only one way, from X-06 outward. The reader who arrives at AC-1.5(4) first — which is the reading order for an implementer working the acceptance criteria, and for `dod-verify` tracing *"every REQ acceptance criterion … to real implementation and tests"* — sees a criterion that requires wiring the conjunct, emitting S-16 and writing the queue row `halted`. Implementing it as written reinstates exactly the defect v2.2 removed. **I grade this Low, not Medium, because three independent guards already stand between that misreading and the tree:** AC-1.5(4)'s own predicate paragraph already cites X-06 one sentence earlier (*"not restated here (X-06)"*); X-06 names AC-1.5(4) explicitly and gives the interim gate composition verbatim; and O-10's two interim legs are executable — they assert *no refusal, no S-16, ≥ 1 dispatch* at the production composition with no seam override, so a wired-conjunct implementation goes red rather than green. The fix is one clause, and it belongs where the misreading starts: after AC-1.5(4)'s false-branch bullet, say *"This disposition is the target state; the conjunct is **not wired at this REQ's ship** — see X-06 — and `REQ-RCV-07` wires it with AC-7.1"*, and qualify §4.1's clearance row the same way (X-06 already qualifies the `W` row, so the two rows should read alike). | §5 AC-1.5(4) *The third conjunct, as a named predicate*; §4.1 clearance row; §3.1 X-06 |
| F-02 | Low | Local | **X-06 and R-14 state the interim trichotomy as exhaustive — *"**any** interim procedure that refuses what it cannot decide refuses on **non-emptiness**"*, *"*any* interim procedure is worse than none"* — but that is not true of every interim procedure, and the counter-example is one this document already specifies.** A procedure that decides exactly what **this REQ** fixes in AC-1.5(4) — every answering-line value well-formed per S-13/S-14 and consistent with the lines before it, and `H − A ∈ {0, 1}` — grants on a well-formed non-empty region (so it does not refuse on non-emptiness), refuses only on a genuinely malformed one with a `{reason}` the closed enum *is* true of, and is not the fail-open either, since it does not admit what it cannot check without checking it. What it *cannot* do is AC-7.1's ordering and highest-round analysis, so it would disagree with the shipped procedure at row 18 on regions that turn on that analysis — and a disagreement in the refusing direction is unclearable for the same reason the blanket refusal was. **That** is the real reason to reject it, and it is a different, narrower argument than the one stated. Nothing behaves wrongly as a result: option (a) is the safer exit and I recommended it. The cost is that the justification now baked into four clauses across two REQs (X-06, R-14, X-07, R-16) over-claims, and the next reader who proposes the narrow procedure will find the document's stated objection does not apply to their proposal. Fix: narrow the claim in X-06 and carry it to X-07/R-16 per `pdlc-rcv-split.md` §5 — *"any interim procedure either refuses what it cannot decide (⇒ refuses on non-emptiness, unclearable) or grants it (⇒ the fail-open); a procedure deciding only what this REQ specifies avoids both but must still disagree with AC-7.1 on ordering and highest-round, and a disagreement in the refusing direction is unclearable until AC-7.4 ships"*. | §3.1 X-06 *Why the conjunct is not shipped early*; §9 R-14; `REQ-pdlc-rcv-reset-region.md` X-07, R-16 |

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict

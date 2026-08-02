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
| F-03 | Low | Process | **X-06 asks for an injected seam that production never calls — which is, byte for byte, the shape `dod-verify` is chartered to flag, and no clause tells it this one is deliberate.** X-06: *"The call site exists as an **injected, controllable seam** so row 18 replaces a stub rather than a call graph, but the interim production composition **does not consult it**."* `dod-verify` scans production code for *"stubs, unwired integrations, mock data"*, and Phase DOD then dispatches `se-implement` to **remediate** what it documents. The obvious remediation of *"injected validate seam is never called from production"* is to call it — reinstating the conjunct and, with it, the defect this round removed. O-10's interim legs would catch that on the next test run, so the failure mode is a wasted DoD round and a red build rather than a shipped defect; that is why this is Low and Process rather than a correctness finding. It is nonetheless avoidable for one sentence, and it belongs where the verifier reads: add it to **O-11** (which already carries the runtime obligations an implementer must honour) or to **NB-3** — *"the `validate` seam is deliberately present and unconsulted at this REQ's ship (X-06); a finding that it is unwired is correct and known by construction, and `REQ-RCV-07` wires it with AC-7.1. Do not remediate it by wiring it."* NB-3 already uses precisely that *"correct and known by construction — file it there"* formula for the algorithm's absence, so the pattern exists and this is one more row of it. Worth carrying to harvest as durable signal: **a deliberately-unconsulted seam introduced to shrink a successor's diff must be declared to the DoD verifier at the REQ that introduces it**, or the verifier's remediation loop will close it. | §3.1 X-06; §8 O-11; §7 NB-3; `pdlc/skills/dod-verify/SKILL.md` |
| F-04 | Low | Local | **O-10's new leg 1 leaves `{N}` unbound — the same symbol carries the pre-clearance window origin and the value of the answering line the leg asserts, and the two are not the same number.** The leg reads *"one `HALT-REASON:` line, no answering line (`H = 1`, `A = 0`), a readable `RESOLVED: yes`, highest round below `windowEnd(N)` ⇒ the entry **grants** — exactly one `WINDOW-START: {N}` appended at the end of the region."* Trace the fixture against §4.1: with no `WINDOW-START:` line present, `W` is *"treated as **1**"*, so the window that just halted is `[1, windowEnd(1)]` = rounds 1..3, and the halt happened because round 3 is the highest — i.e. *highest round below `windowEnd(N)`* is **false** for `N = 1`, and true only for the `N` the clearance is about to open (4). So the reader must silently rebind `N` between the precondition and the postcondition, and an implementer who does not gets a fixture whose precondition contradicts the `H = 1` that makes it a clearance case at all. Per the PROPERTIES review bar — the owning test must use the normative fixture body verbatim — a symbol used at two bindings in one sentence is not a body that can be used verbatim. Fix: state the leg with concrete numbers, as O-10's other legs do (*"a region with two `HALT-REASON:` lines and one `WINDOW-START:`"*): *"a region with one `HALT-REASON:` line and no answering line (`H = 1`, `A = 0`), a readable `RESOLVED: yes`, and highest round on the branch = `windowEnd(1)` = 3 ⇒ the entry grants: exactly one `WINDOW-START: 4` appended at the end of the region, `A = H = 1` after…"*. Leg 2 does not have the problem — its `windowEnd(1)` is already concrete. | §8 O-10 (*Leg 1, well-formed non-empty region*); §4.1 `W` row |

## 4. Questions

| ID | Question |
|---|---|
| Q-01 | With the conjunct unwired, is anything at row 10 still **observable** about the seam other than its existence? If the answer is no, is the seam worth shipping at all at row 10 — or is F-03's declaration cheaper than the parameter it declares? I am not asking for it to be removed: *"row 18 replaces a stub rather than a call graph"* is a real saving and I would keep it. I am asking whether the document should say, once, that the seam is **structural only** at this ship, which would also answer F-03 in the same clause. |
| Q-02 | Headroom under the size soft threshold is now **171 bytes** (458 lines / 55,125 against 630 / 55,296). If the four Low fixes above are taken as written they cost roughly 700–900 bytes, which crosses it. Is the intent to relocate §4.1's durability table or §6's threshold rows to `pdlc-rcv-baseline.md` **before** writing them, per the check's own message? This is not a finding — it is the sequencing question that decides whether the next revision trips the hook. |
| Q-03 | Carried, `REQ-RCV-07`'s: is `W` guaranteed absent from every operator- and downstream-visible surface on a refusing entry? Recorded so the trail is unbroken for harvest; **not** a finding against this document. |

## 5. Positive Observations

- **The round removed the defect instead of mitigating it, and that is the whole difference between
  this verdict and the last one.** v2.1 answered *what should the interim procedure do?*; v2.2
  answered *should there be an interim procedure?* — and shipping none is the only interim whose
  behaviour is the one already in production. X-06 says exactly that (*"Leaving it unwired is the
  only interim whose behaviour is **today's**"*), and every consequence I checked follows from it
  rather than being asserted alongside it: no S-16 to render from a closed enum (F-02 closed), no
  release-checklist line owed (Q-02 answered), no production default to get wrong (Q-03 dissolved).
  Three of my open items closed as *consequences of one design change*, which is what a correct
  design change looks like.
- **The paired edge was revised at both ends in the same words, and the obligation was made
  mechanical rather than remembered.** `pdlc-rcv-split.md` §5 does not just say *keep them in sync* —
  it names the four clauses, and names the three things the two ends must agree on: *"whether the
  conjunct is wired in the interim, … the queue distance between the two rows, and … what an interim
  procedure would cost."* That is a checkable obligation, and I checked it: X-07 and R-16 agree with
  X-06 and R-14 on all three, including the retraction of *"a stub returning **invalid** [is] safe by
  construction"*, which is now stated as its own negation. A two-round divergence closed in one.
- **The size fix was paid for the way the check asks, and it produced a shared artifact rather than
  an archive.** `pdlc-rcv-split.md` is cited by both halves of the split and carries material that was
  duplicated or about to be; the REQ's §10 keeps a one-paragraph summary and a pointer, which is the
  right residue. Compare v7's remedy — deleting a clause to clear nine bytes.
- **R-14's residual is stated with the right comparator.** *"R-10's hand-edited-region fail-open stays
  open until row 18 — operator-caused and **no wider than HEAD's, where it is open unconditionally**."*
  Measuring the interim exposure against HEAD rather than against the finished feature is what makes
  the deferral honest; the same sentence is what lets Q-02's co-release answer be *no* without
  hand-waving.
- **O-10's interim legs are falsifiers, not documentation.** Each carries a `≥ 1` dispatch conjunct
  and the note that says why (*"what makes each leg falsify an interim that refuses"*), and leg 2
  keeps the *no answering line, counts unmoved* conjuncts so it cannot green the `A = H` fail-open.
  Both legs are stated to survive row 18 — *"neither is deleted at that commit; what row 18 adds is
  the refusing leg"* — which is the property I asked for last round and the reason F-01 (v7) could
  close rather than recur.

## 6. Recommendation

**Approved with minor changes**

The v7 High and both Mediums are closed, and closed at the root rather than at the symptom. v2.2
takes the exit I recommended — AC-1.5(4)'s third conjunct is **not wired at this REQ's ship**, so the
interim is HEAD's behaviour: no refusal, no S-16, no branch put on a path AC-1.1–AC-1.5(3) and (5)
does not already put it on. The bricking chain I traced at v7 (region non-empty ⇔ the phase has
halted ⇒ refuse ⇒ `RESOLVED: yes` read inside the failing gate ⇒ terminal) is now the document's own
stated reason for shipping no interim procedure at all, in X-06, R-14 and O-10 with one vocabulary,
and carried to `REQ-RCV-07` X-07 and R-16 in the same words — I read both at HEAD and they agree on
wiring, on queue distance (`Order 18`, net pickup 10 → 12 → 18) and on what an interim procedure
would have cost. O-10's interim legs now grant rather than refuse, assert **no** S-16, and are stated
to survive row 18. The size finding was answered by relocating the split record to
`docs/_constraints/pdlc-rcv-split.md` — a real shared artifact both halves cite — rather than by
compression. Every citation I could check mechanically holds: the new file exists and is tracked, its
§1–§4 and §5 resolve as cited, and the collision rule survived the move.

Four Low findings remain, all of them one sentence each and none of them behavioural:

1. **F-01** — AC-1.5(4) and §4.1's clearance row still state the conjunct and its false branch
   unconditionally with no back-pointer to X-06. Three guards stand between that and a wrong
   implementation (AC-1.5(4)'s own X-06 citation, X-06's explicit naming of AC-1.5(4), and O-10's
   executable interim legs), which is why it is Low — but the reader who arrives at the criterion
   first sees a requirement to wire it. Add the *target state / not wired at this ship* clause.
2. **F-02** — X-06 and R-14 (and their paired ends) state *any* interim procedure as either
   refusing-on-non-emptiness or fail-open; a procedure deciding only what this REQ specifies is
   neither. The right objection to it is narrower — it must disagree with AC-7.1 on ordering and
   highest-round, and a refusing-direction disagreement is unclearable until AC-7.4. Narrow the
   claim, and carry it to X-07/R-16 per `pdlc-rcv-split.md` §5.
3. **F-03** — the deliberately-unconsulted seam is exactly the shape `dod-verify` flags as an unwired
   integration, and its natural remediation is to wire it. Declare it in O-11 or NB-3, using NB-3's
   existing *correct and known by construction* formula.
4. **F-04** — O-10 leg 1's `{N}` is bound twice in one sentence (window origin vs. the appended
   answering line's value); state the fixture with concrete numbers as the neighbouring legs do.

None of these is a reason to hold the document. Per the approval rule — Low findings only —
**Approved with minor changes**: take them in the next authoring pass, alongside Q-02's relocation
so the edits fit under the size soft threshold.

Durable signal from this round, for `docs/_constraints/DOMAIN-CONSTRAINTS.md`:

- **When a gate conjunct's decision procedure is owed by a successor, the honest interim is usually
  to leave the conjunct unwired** — an interim procedure that refuses what it cannot decide refuses
  on the feature's own domain, and one that grants it is the fail-open the conjunct exists to close.
  Judge the interim against HEAD's behaviour, not against the finished feature's.
- **A seam introduced ahead of its consumer, deliberately unconsulted in production, must be declared
  as such at the REQ that introduces it** — otherwise the DoD verifier files it as an unwired
  integration and the remediation loop wires it.
- **Split documents need a named paired-edge register, not a norm of care.** Two rounds of divergence
  between `REQ-RCV-01` and `REQ-RCV-07` closed in one once the four clauses and the three facts they
  must agree on were written down in a shared file.

## Verdict

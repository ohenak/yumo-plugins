# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.1, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 7
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v6 was the REQ as of the tree at `a0afcf6`;
this review covers `a0afcf6..HEAD` on that file — commits `eff9523`, `fd9c400`, `a112501`, `28ff461`,
`33b73d9`, `5122a5e`, `8a60091` (29 insertions, 14 deletions across §0 changelog, §3.1, §4, §7, O-10,
R-14). Sections unchanged since v6 were not re-litigated.

## 1. Disposition of the v6 findings

**All four v6 findings are textually closed, and the one that mattered — F-01 — was answered in the
right register: the document now argues about the stub's *shape* rather than its value, and says so
in X-06, R-14 and O-10 with one vocabulary.** That is the change I asked for. What I could not
confirm is that the shape it chose is safe; §3 F-01 below is about the chosen shape, not about the
refusal to state one.

| v6 id | Sev | Status | What was checked |
|---|---|---|---|
| **F-01** | **High** | ⚠️ addressed, new mechanism defect | X-06 now reads *"**Fail-closed here is a shape, not a constant.** A constant *invalid* is **not** the fail-closed reading … a constant would refuse every document-typed review phase on every feature and block the delivery of its own replacement"*, and prescribes an **injected, controllable seam** whose production default is *valid on the empty region, invalid on any non-empty one*. R-14 carries the same words (*"Mitigated by fixing the interim **shape**, not by sequencing"*), and O-10 gained both halves I asked for: each granting leg now *"drives the *validate* seam explicitly to **true** and never reads its production default"*, and a new interim-ship oracle asserts the default with no override. The constant is gone; the naming of the seam is exact. **But the replacement shape has its own blast radius, and O-10 now pins it as a required property** — see F-01 below. |
| **F-02** | Low | ✅ closed | §3.1 now reads *"queued at **`Order 18`** — `docs/_queue/QUEUE.md`'s stated net pickup order is **10 → 12 → 18**, so X-06's interim shape is live across a whole intervening feature and row 18's own Phase R"*, and R-14 repeats the exposure. I checked the queue: rows 10 / 12 / 18 are as cited and `QUEUE.md`'s own note says *"Net pickup order: **10 → 12 → 18 → 17 → 11**"*. Both sentences now match the fact. The sibling's copy of the claim was **not** corrected — F-03 below. |
| **F-03** | Low | ✅ closed, by rule rather than by rename | §7 now states *"`O-*`, `R-*` and `X-*` are **not** namespaced and do collide across the v2.0 split (`O-10`, `O-12`, `R-10` and `R-14` differ between this REQ and `REQ-RCV-07`), so **every cross-document citation of one must name the owning REQ**, as each here does."* That is cheaper than renaming and it states the hazard where the next reader meets it. I re-checked the citations added this round — O-10's *"that REQ's AC-7.1–AC-7.6 and **its** O-10"*, §10's *"`REQ-RCV-07` §6 / catalogue §4"* — and all are qualified. Accepting the rule as the fix. |
| **F-04** | Low | ✅ closed | X-06's *Direction* cell now reads *"**read from** `pdlc-rcv-reset-region`"*, matching X-05, and §3.1's opening is qualified to *"head of the family **at requirements altitude** — nothing it needs *as a requirement* is owed by a sibling"*, with the forward-edge distinction stated immediately after. Both were exactly the suggested wording. |

**Independent re-verification of the new cross-document claims** (a relocation or a delegation is only
as good as its citations):

- **§4's widened delegation rule checks out against the catalogue.** It claims catalogue **§3**'s
  *"AC-1.5(4)'s step-4 path"* and *"fixed by `pdlc-rcv-budget-stop` §6"*. Both strings are present in
  `docs/_constraints/pdlc-rcv-catalogue.md` §3 verbatim, in the row-B paragraph, and the substitution
  it prescribes (read them as AC-7.1 step 4 and `REQ-RCV-07` §6) is the only reading consistent with
  §6's *"this REQ now mints no operator string of its own"*. Widening the rule from one phrase to
  *every* reference is the correct generalisation — the four rows do word it differently.
- **The queue citation is exact**, as above.
- **The S-16 enum is genuinely closed at three members** — catalogue §2's S-16 row, *"`{reason}` ∈
  `{invalid-window-start, invalid-window-resumed, counts-mismatch}` — closed three-member enum"*, and
  *"a reason outside [it is a] defect, not a fallback"*. This is what F-02 below turns on.
- **The sibling was not updated in step.** `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md`
  X-07 and R-16 still prescribe the constant and the superseded sequencing claim — F-03 below.

## 2. Disposition of the v6 questions

| v6 id | Status | Note |
|---|---|---|
| **Q-01** (is the conjunct wired into the gate from row 10, or added by row 18?) | ✅ answered, unambiguously | X-06: *"The conjunct **is wired into the gate at this REQ's own ship** — only the **decision procedure** waits."* That is the first of the two branches I offered, stated in the cell I asked for it in. It also fixes what O-10 can assert, and O-10 was updated to match. The answer is clear; F-01 below is a consequence of it, not a complaint about it. |
| **Q-02** (must the two halves land in the same *release*, not merely the same queue sweep?) | ❌ not addressed | Nothing in v2.1 speaks to the distribution boundary. The interim default now has a stated shape, so the question is sharper rather than moot: a consumer who installs the plugin between row 10 and row 18 gets that default, and F-01 argues what it costs them. Re-asked below. |
| **Q-03** (carried, `REQ-RCV-07`'s: is `W` absent from every operator-visible surface on a refusing entry?) | — | Still that REQ's. Recorded only so the trail is unbroken for harvest. |


## 3. Findings

Scanned the changed sections only — the v2.1 changelog paragraph, §3.1's preamble, X-06 and the
*Consequence for sequencing* paragraph, §4's widened delegation rule, §7's id-namespace paragraph,
O-10's two new clauses and R-14. **One High, two Medium, one Low.** The High is not a return of last
round's finding: the constant is gone and the argument is now in the right register. It is that the
**replacement shape refuses on the one input the whole feature exists to serve**, and that O-10 now
pins that refusal as a required test rather than flagging it as the cost of shipping early.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Cross-Feature | **The interim default is *valid on the empty region, invalid on any non-empty one* — and a region is non-empty exactly when the phase has halted. So for the whole interim the clearance mechanism this REQ exists to add never grants: the first halt of any phase permanently refuses that phase, and `RESOLVED: yes` — the operator's only lever — cannot clear it.** Trace it in this document's own clauses. (1) The region is created **by the halt path**: AC-1.4 clause 1, and catalogue §2's S-12 row — *"the first halt of a phase **creates** it, every later halt preserves it"*. So *region empty* ⇔ *this phase has never halted on this branch*, and *region non-empty* ⇔ *it has*. (2) The predicate is resolved **on every entry**, not only when a clearance is pending — X-06 says so itself (*"the predicate is resolved on every entry"*), §4.1's `W` row gives the region as `W`'s durable home, and `REQ-RCV-07` AC-7.3 makes the resolution *unconditional* inside the phase body. (3) AC-1.5(4)'s false branch is not a downgrade but a **refusal**: *"`W` = 1; the clearance is not consumed …; exactly one `reset-region-corrupt: {reason}` notice; and the entry **refuses the phase** rather than halting, terminating the invocation on step G's path (M-7a, M-7b) with the feature's queue row written `halted`."* Compose the three: entry 1 of a phase finds no region ⇒ valid ⇒ the window opens and the loop behaves as today ⇒ rounds run ⇒ the budget halts ⇒ **the halt path creates the region**. Entry 2 of that same phase, and every entry after it, finds a non-empty region ⇒ the interim default returns *invalid* ⇒ the phase is refused and the queue row written `halted`. **The operator writes `RESOLVED: yes` and it changes nothing**, because the marker is read *inside* a gate whose first conjunct now fails; the sanctioned repairs are `REQ-RCV-07` AC-7.4's and unshipped; and no repair could help anyway, since the default refuses on *non-emptiness*, not on any fault a repair removes. This is not the status quo preserved. Today a halted phase is cleared by `RESOLVED: yes` and re-runs; at the interim ship it is **terminal**. And it ships alongside `MAX_REVIEW_ROUNDS` 5 → 3 made **absolute per document** (AC-1.1, §6) — strictly more halts, reaching a recovery path that has just been disabled. X-06's safety claim is true only as literally worded: *"leaves branches with **no reset region** behaving exactly as today"* — the branches that have one are exactly the ones excluded, and they are the subject of the REQ. R-14 names the exposure interval (*"live across one whole intervening feature and row 18's own Phase R"*) but not its content, and per `QUEUE.md`'s pickup order **10 → 12 → 18** the content is: row 12 runs five review phases where the first halt of each is unrecoverable, and **row 18's own Phase R** — the feature that ships the fix — is in the same position, so the replacement is still gated on not halting. The v6 finding's shape survives in reduced form: not *bricks everything immediately*, but *bricks each phase at its first halt*. **What makes this High rather than an accepted risk is O-10.** Its new interim oracle asserts the behaviour as correct: *"on a branch with a **non-empty** region and a readable `RESOLVED: yes` the entry refuses, emits exactly one S-16 notice, dispatches **0** reviewers and leaves `A` and `H` unmoved"*, and calls the pair *"the regression oracle both ways"*. That is a test that **fails when the defect is fixed** — row 18 landing the real algorithm makes a well-formed non-empty region validate, so this leg must be deleted or rewritten at that moment, which is the signature of a property pinning an artefact of incompleteness rather than a requirement. **Three ways out; the document must pick one and say so in X-06's cell, R-14's disposition and O-10 together.** (a) **Do not wire the third conjunct at row 10** — ship AC-1.5(4)'s counts-and-marker gate with the *region validates* conjunct absent, and let row 18 add it. The exposure is then R-10's fail-open on a *hand-edited* region for one queue interval — an operator-caused, operator-visible risk that does not exist today either, and strictly smaller than disabling recovery for every halt. This contradicts nothing in §3.1 and only needs Q-01's answer changed. (b) **Add the `depends-on` edge on `pdlc-rcv-reset-region` and co-deliver**, moving row 18 to `Order 11`; then §3.1's *"deliverable alone"* must be qualified from *requirement* to *implementation*. (c) **Keep the conjunct wired but make the interim default *valid* on any region whose lines are well-formed by this REQ's own S-13/S-14 grammar and whose counts satisfy `H − A ∈ {0, 1}`** — i.e. implement the part of the check this REQ already specifies in §6 and defer only AC-7.1's ordering/highest-round analysis to row 18. That decides more than emptiness, refuses genuinely corrupt regions, and lets ordinary clearance work. Whichever is chosen, O-10's interim oracle must assert an outcome that **remains true after row 18 ships**, or be labelled explicitly as a temporary leg with the commit that must delete it. | §3.1 X-06; §3.1 *Consequence for sequencing*; AC-1.4 clause 1; AC-1.5(4) *The third conjunct, as a named predicate*; §4.1 `W` row; §8 O-10; §9 R-14; catalogue §2 S-12; `docs/_queue/QUEUE.md` |

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict

# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.0, 477 lines / 52,052 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v5 finding is closed, plus a scan of the text added or rewritten since v5 for new issues. Sections unchanged since v1…v5 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `fc3410e..8d77618` (17 commits touching the REQ, including the **v2.0 altitude split**)
**Date:** 2026-08-01
**Iteration:** 6

## Disposition of v5 findings

All three are **closed**, and the Medium among them was closed twice over — once on the merits inside
v1.6, then again structurally by the v2.0 split, which moved the whole surface the finding lived on
into `REQ-RCV-07`. I verified the relocation rather than assuming it: a moved obligation that lands
nowhere is a silently deleted one, so for every row of §10's mapping table I opened the named
destination and confirmed the clause is there.

| v5 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-27 | Medium | **Closed, on the merits and then by relocation** | The substance landed in v1.6 before the split: `db65e27` made the unconfirmable-append residue *deleted, not left*, `8d70d40` **suppressed** the shipped generic recovery line rather than substituting it, `44280d7` gave §6's refusal-render rows the **two acts**, and `7a7b3b5` restored the **sequel leg** I asked for. All four now live in `REQ-RCV-07`, and I read them there rather than trusting the mapping table: **AC-7.5** carries act 1 and the byte comparison; **AC-7.6**'s row-B table gives the unconfirmable-append variant a *Recovery text* cell reading **"two acts in order"** pointing at catalogue §4; catalogue **§4** exists and fixes those bytes; and `REQ-RCV-07` **O-10** carries both legs I named — the torn-write legs *"parameterised over the truncation offset — inside the key, inside the value, newline lost, the well-formed `WINDOW-START: 1` case included"* **and** their sequel, *"asserted positively — the next entry **after act 1** finds `A < H`, clearance unspent … while the next entry **after act 1 skipped** finds `A = H`, `W` = 1 and the clearance gone: **the pair**"*. That pair is exactly the entry I said was where the clearance is actually lost, and it now has a positive oracle on both branches. The two incompatible readings of the same recovery-text assertion are gone with it, since one document now owns both legs. |
| F-28 | Low | **Closed, decisively** | 3 bytes of headroom became **9,388**: 477 lines / 52,052 bytes against 700 / 61,440. Both dimensions are now under the 90% soft threshold rather than against the hard ceiling, which is the state the size hook is designed to leave a document in. |
| F-29 | Low | **Closed** | §3.1's dangling *"depends on both"* is gone. The sentence now reads *"`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`, and `pdlc-rcv-panel-topology` depends on the two of them"* — antecedent restored in its own sentence, and the §10 dependency edge it was shorthand for is untouched. |

Q-04 stays closed. Q-05 is **withdrawn** rather than carried a fifth time — the ordering question it
asked (a `HALT-REASON:` and an answering line written by the *same* entry) is now decided inside
`REQ-RCV-07` AC-7.5's write-then-confirm sequence and is that document's to answer. Carrying it here
would be filing a finding against a clause this REQ no longer owns.

## Findings

Three, all in material **new in v2.0** — X-06, R-14 and §4's delegation clause did not exist at v5.
**No High.** One Medium, and it is the testability of the split's own seam rather than anything the
split moved.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-30 | Medium | Local | **The fail-closed stub X-06 and R-14 mandate and the granting legs O-10 requires cannot both be satisfied as written, and the intermediate ship state the stub creates has no oracle at all.** X-06 states it without a scope qualifier: *"an implementation of this REQ alone must stub it **fail-closed** (invalid ⇒ refuse). A stub returning *valid* is the fail-open AC-1.5(4) exists to close."* R-14 repeats it — *"a stub returning *invalid* refuses rather than grants and is safe by construction"* — and adds *"O-10 requires the gate legs to be driven from that stub, so the seam is exercised either way."* Now read what O-10 actually asks of that seam: *"a region with two `HALT-REASON:` lines and one `WINDOW-START:` granting **exactly one** further window and a region with `A = H` granting none; the answering-line write **confirmed before** any dispatch; an S-11 clearance writing `WINDOW-RESUMED: {W}`, leaving `W` unchanged, with a **subsequent** convergence halt then **not** auto-cleared"*. Every one of those legs requires the third conjunct to be **true** — AC-1.5(4) makes *the region validates* a conjunct of the gate, and clause 4's own text says a false predicate writes no answering line and moves neither count. A predicate stubbed constant-*invalid* short-circuits all four legs before the behaviour they assert can occur. So either the stub is a **constant**, in which case O-10's granting legs are unrunnable against the production composition at this REQ's ship and can only be produced by a double that replaces the shipped stub — the builder-not-wired shape DC-07 forbids relying on; or it is a **controllable seam whose production default is invalid**, in which case X-06's *"a stub returning valid is … a defect"* needs scoping to the production composition, because the granting legs must drive it to valid. O-10's *"driven from a **stub or double**"* names both and chooses neither, so a property author has two incompatible readings of the same seam and no rule for picking — and whichever they pin, the other reading is untested. **The second half is independent and is the more serious one:** the state the stub creates is operator-visible and is nowhere asserted. With `REQ-RCV-07` unshipped and the predicate constant-invalid, an operator who writes `RESOLVED: yes` gets the AC-1.5(4) **refusal** — no window, queue row `halted` — on every entry, so US-04's *"my one escape hatch … grants one fresh window"* and AC-1.5(3)'s *"an operator who has addressed the finding gets a fresh window"* are **inert on the artifact this REQ ships**, and no O-10 leg says so. §3.1's *"This REQ is deliverable alone as a **requirement**, and its window, budget, halt path and clearance accounting are fully determined without any successor"* is true of the *specification* and says nothing about the shipped behaviour; R-14 dispositions the risk but pins no observable. Three things close it, and they are one clause and one leg: (i) say which of the two stub shapes is meant — I would take the controllable seam, defaulting to invalid in the production composition, and scope X-06's prohibition to that default; (ii) have O-10 name, for each granting leg, the seam value it drives, so the legs are not silently reading production; (iii) add the leg that is missing entirely — **the intermediate-ship disposition asserted positively**: with the predicate at its production default and a readable `RESOLVED: yes`, the entry refuses, emits its S-16 notice, dispatches **0** reviewers, and leaves `A` and `H` unmoved — which is also the regression oracle that catches a later implementer relaxing the stub to *valid* once the successor is late. | §3.1 X-06, R-14, O-10 *The gate (AC-1.5(4)–(5))*, AC-1.5(3), US-04 |
| F-31 | Low | Local | **The sequencing that is R-14's entire mitigation is contradicted by the queue it cites.** R-14's disposition reads *"**Accepted; sequencing is the mitigation.** The queue orders `pdlc-rcv-reset-region` immediately behind this row"*, and §3.1 repeats it — *"`pdlc-rcv-reset-region` is queued immediately behind it"*. `docs/_queue/QUEUE.md` says otherwise, in its own words: row 18 is `pdlc-rcv-reset-region`, row 12 is `pdlc-rcv-finding-quality` with `Depends-On: pdlc-rcv-budget-stop`, and the queue's own note states the *"Net pickup order: **10 → 12 → 18 → 17 → 11**"*. One whole feature is picked up between this REQ and its successor, so the interval during which the fail-closed stub is the shipped behaviour is a feature longer than the disposition claims. The mitigation's substance survives — the successor is queue-eligible the moment this row is `done`, and the stub is safe by construction either way — so this is a Low, not a Medium: nothing untestable is introduced and no obligation moves. But it is a falsifiable claim about a cited artifact that the artifact falsifies, which is the class this family has shipped before. Repair is two words in each place: *"queued at `Order 18`, picked up after row 12"*. | R-14, §3.1 *Consequence for sequencing*, `docs/_queue/QUEUE.md:27`–`:35`, `:66` |
| F-32 | Low | Cross-Feature | **§4's delegation rule is keyed to a phrase two of the four rows it names do not use, and catalogue §3's two pointers at the moved material are not covered by any rule.** §4 states the redirect once and carefully: *"Catalogue §2's S-12, S-13, S-14 and S-16 rows describe their receive side as *'AC-1.5(4)'s ordered algorithm'* … read *AC-1.5(4)'s ordered algorithm* as *AC-7.1* wherever the catalogue says it."* Checked against the file: the phrase appears in the **S-12 and S-13 rows only** (`pdlc-rcv-catalogue.md:59`, `:60`). S-14's receive-side cell reads *"the `A` count; AC-1.5(4)'s validation"* with a body of *"same algorithm and same append rule"*, and S-16's emitter cell reads bare *"AC-1.5(4) step 4"* — neither is the quoted phrase, so a redirect scoped to it does not reach them. S-16 recovers anyway, because §4's own S-16 row separately says *"its sole emitter and its `{reason}` selection are `REQ-RCV-07` AC-7.1 step 4's"*; S-14 recovers only by inference from S-13's adjacent row. Two further pointers are outside the rule altogether, and they sit in catalogue **§3**, the shared row schema whose stated bar is that *"a test author must be able to derive the exact cell, character for character, from these documents alone"*: it defines row B as *"the row of an entry that opens no round on `pdlc-rcv-budget-stop` **AC-1.5(4)'s step-4 path**"* — this REQ's AC-1.5(4) no longer has numbered steps — and says *"the **validation-failure** variant's is fixed by `pdlc-rcv-budget-stop` §6"*, which is now false in this document's own words (*"this REQ now mints no operator string of its own"*). **Low, not Medium, and the reason is that every pointer recovers in one hop:** a reader sent to §6 finds the forwarding sentence naming `REQ-RCV-07` §6 and catalogue §4, `REQ-RCV-07` AC-7.6 states the ❌ text with its `§6` citation, and no obligation is lost anywhere. It is filed because the catalogue is read by three REQs and the drift is in the *shared* file, so it should be fixed once rather than re-derived by each reader — and because §4's sentence is itself an inaccurate claim about a cited file. Cheapest repair: widen §4's rule from the quoted phrase to *"every reference to AC-1.5(4)'s algorithm, its steps or its refusal renders"*, and repoint catalogue §3's two clauses at `REQ-RCV-07` AC-7.1 step 4 and `REQ-RCV-07` §6. Whether the catalogue edit lands here or in the successor is not mine to decide; the REQ-side half is. | §4 *One delegation, stated once*, `pdlc-rcv-catalogue.md:61`, `:63`, §3's row-B paragraph, §6 |

## Questions

Q-04 and Q-05 are both closed — Q-04 answered at v5, Q-05 withdrawn above as belonging to
`REQ-RCV-07`. One new question, and it is genuinely optional: no finding depends on it.

| ID | Question |
|----|---------|
| Q-06 | AC-1.5(4) fixes the predicate's **meaning** (*"true exactly when every answering-line value is well-formed and consistent with the lines before it and with the highest round on the branch, **and** the counts satisfy `H − A ∈ {0, 1}`"*) while `REQ-RCV-07` AC-7.1 fixes its **procedure** (*"the predicate is exactly 'steps 1–3 all pass'"*). I checked the two against each other and they agree, clause for clause — AC-7.1 step 2 carries the strictly-greater and range checks the meaning calls *consistent with the lines before it and with the highest round*, step 3 carries the count invariant, and step 5's *greatest `WINDOW-START:` present, or 1* matches §4.1's durable-home row. What neither document asks for is a **conformance leg** pinning that agreement: a test that the shipped procedure decides exactly the stated meaning, so a later revision of AC-7.1 that drifts from AC-1.5(4)'s definition fails something. Both documents' O-10s test the procedure's own cases. Is the agreement meant to be a review-time obligation only, or should one of the two O-10s carry a leg over a shared table of regions labelled valid/invalid **by the meaning** and asserted against the procedure? Cheap either way, and it is the seam the split created, which is why I am asking rather than filing. |

## Positive Observations

- **The split was cut where the findings were, and the cut is checkable rather than asserted.** §10's
  *"What stayed, and why that is the whole test of the cut"* names the criterion — the material that
  drew **zero blocking findings after round 2** — and I could verify it against my own five reviews:
  every one of my Highs and Mediums from v2 onward (F-12, F-16, F-22, F-24, F-27) landed in
  AC-1.5(4)'s machinery, §6's render rows or O-10's corresponding legs, and every one of those three
  surfaces is on the moved side of the table. Nothing I approved moved, and nothing I blocked stayed.
  That is the strongest evidence a split of this kind can offer, and it is stated as a falsifiable
  claim rather than a summary.
- **The mapping table is honest — I checked all nine rows against the destination file.** AC-7.1
  carries the ordered algorithm with the `H − A ∈ {0, 1}` invariant and its stated domain; AC-7.2 the
  *refusal is not a halt* bullets, the step-G routing, the generic-line suppression and the
  `postmortemStatus` mechanism; AC-7.3 the three entry classes; AC-7.4 the sanctioned-repair and
  delete-a-line tables; AC-7.5 the byte confirmation, the torn-write and value-tear analysis and act
  1; AC-7.6 row B in two variants; §6 and catalogue §4 the render rows; and `REQ-RCV-07`'s O-6, O-10
  and R-11 the obligations. Nothing on that table lands nowhere. A relocation review is mostly a
  search for the row that quietly evaporated, and there isn't one.
- **The delegated conjunct is delegated by *procedure only*, which is the right seam.** AC-1.5(4)
  keeps the predicate's **meaning**, its **fail-closed disposition in all four respects at once**, and
  the arithmetic argument for why validation is a conjunct of the gate rather than a constraint on
  `W`. Only the decision procedure crosses. That is what makes X-06 a forward edge instead of a
  `depends-on`, and it means a reviewer of the successor cannot re-open the semantics by re-deciding
  the algorithm. F-30 is about the seam's **oracle**, not about where the line was drawn.
- **Every `M-*` id this document now cites exists, and the four references repointed by `8d77618`
  land on clauses that say what this REQ claims they say.** All of `M-1a`–`M-1e`, `M-2f`, `M-7a`,
  `M-7b`, `M-7d`, `M-7e` are rows of `pdlc-rcv-baseline.md`. AC-1.1's *"fail the strictly-increasing
  check on `WINDOW-START:` values (`REQ-RCV-07` AC-7.1 step 2)"* is exact — step 2 requires each value
  *"strictly greater than every `WINDOW-START:` value before it"*; §4's and §6's S-16 rows correctly
  name AC-7.1 **step 4** as the sole emitter and the `{reason}` selector, which is what step 4 does;
  and X-06 correctly names AC-7.1 as the decision procedure. §1's cost figures (`11, 6, 6, 7, 9`;
  66 KB / 40%) are baseline §1.1's verbatim. NB-4's *no line citation* rule holds throughout — I found
  none.
- **Row C is still stated cell by cell and still matches the schema exactly.** AC-1.5(1) populates
  `round`, `panel-shape`, `blocking`, `growth-bytes`, `classification` and `notice` — all six columns
  of catalogue §3, no more and no fewer — and the mutual-exclusion claim it makes with row B (*"B's
  entry takes no halt, C's takes one, so B never carries S-4 and C never carries S-16"*) is the
  catalogue's own sentence, unchanged by the split. The row that survived the cut survived it intact.
- **The dispatch-count oracle and its positive control survived the compression.** O-10 still reads
  *"exactly **0** dispatches on the exhausted-budget entry and on a non-validating entry, **≥ 1** on
  the control entry that does open a round — asserted *alongside* the file-absence check, since a test
  double that writes no file satisfies absence either way."* A split is where negative controls
  usually get lost to the other document; this one kept its own, and kept the sentence explaining why
  absence alone would not do.

## Recommendation

_(pending)_

## Verdict

_(pending)_

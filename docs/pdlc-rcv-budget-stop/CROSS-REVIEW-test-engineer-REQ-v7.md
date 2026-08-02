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

Four, all in material **new in v2.1** — the interim shape, the O-10 pair and the widened §4 did not
exist at v6. **No High.** Two Mediums, and both are about the *cells* of the interim-ship oracle the
revision added at my request, not about the decision to add it: one cannot be written at all as
stated, and the other is stated so that it does not falsify what it claims to falsify.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-33 | Medium | Local | **The interim refusal is required to emit an S-16 notice whose `{reason}` no rule can supply, and every value of the closed enum is factually false on the fixture O-10 names.** O-10's new first leg reads: *"on a branch with a **non-empty** region and a readable `RESOLVED: yes` the entry refuses, emits exactly one S-16 notice, dispatches **0** reviewers and leaves `A` and `H` unmoved"*. Trace the render a test author must assert. S-16's format is fixed *"**here only here**, character for character"* by catalogue §2 (`pdlc-rcv-catalogue.md:63`), and its reason token is a **closed three-member enum**: `{invalid-window-start, invalid-window-resumed, counts-mismatch}`, with the catalogue's own rule that *"a reason outside is a defect, not a fallback"*. This REQ's §4 and §6 then delegate the **selection** of that token: *"its sole emitter and its `{reason}` selection are `REQ-RCV-07` AC-7.1 step 4's"* — a step that by construction does not run in the interim, since the seam exists precisely because AC-7.1 is unshipped. Now take the leg's own fixture, which the granting legs make concrete: a region created by AC-1.4 clause 1's first halt, one `HALT-REASON:` line, no answering line. `H = 1`, `A = 0`, so `H − A = 1 ∈ {0, 1}` — `counts-mismatch` is **false**. There is no `WINDOW-START:` line and no `WINDOW-RESUMED:` line, so `invalid-window-start` and `invalid-window-resumed` are **false**. The region is, on AC-1.5(4)'s stated *meaning*, perfectly **valid** — the interim seam refuses it only because it declines to decide, not because anything is wrong with it. So the leg demands an assertion whose expected string is (a) not derivable from any document, against catalogue §3's stated bar that *"a test author must be able to derive the exact cell, character for character, from these documents alone"*, and (b) not truthfully instantiable by **any** member of an enum the catalogue closes. Whatever the implementer picks, the operator's only diagnostic for the entire interim — one intervening feature plus row 18's own Phase R, by §3.1's own reckoning — reads `reset-region-corrupt` about a region that is not corrupt. Two repairs, either of which closes it, and both are one clause: (i) say the interim refusal emits **no S-16** (the notice is defined as the signal that *"a corrupt region is diagnosable"*, and this region is not corrupt), and have O-10's leg assert **zero** S-16 notices plus the refusal's ❌ phase-row text; or (ii) mint the interim reason explicitly here — e.g. `undecidable-region` — and state that the enum is closed at three **for AC-7.1's selections** and carries this fourth only while X-06's seam is at its interim default, so the catalogue's closure claim stays true. I prefer (i): it adds no id, it keeps the enum closed, and it leaves the refusal's operator string a single fact to assert. Either way the leg becomes writable. | O-10 *The interim ship state*, AC-1.5(4) *when it is **false***, §4, §6, `pdlc-rcv-catalogue.md:63`, `:118` |
| F-34 | Medium | Local | **Neither leg of the interim-ship pair is the regression oracle the sentence claims, because the empty-region leg asserts an outcome AC-1.5(4) forbids and the non-empty leg fixes no count state.** The pair reads: *"on a branch with a **non-empty** region and a readable `RESOLVED: yes` the entry refuses … ; on a branch whose region is **empty** that same default grants the window normally. The pair is the regression oracle both ways — a default later relaxed to *valid* fails the first leg, a default collapsed to the constant *invalid* fails the second."* **(a) The empty-region leg contradicts the gate it is testing.** An empty region gives `H = 0` and `A = 0`, so AC-1.5(4)'s second conjunct `A < H` is false, and that clause states the consequence in its own words: *"When `A = H` every halt so far has been answered and the loop writes nothing and **grants nothing**."* So *"grants the window normally"* has two readings that differ observably — *"the ordinary `W = 1` window opens because the entry does not refuse"* (correct, and what I believe is meant) versus *"the clearance is honoured: an answering line is appended and a fresh three-round window opens at `N`"* (which is the fail-open — a clearance re-granted on every invocation, since an empty region never becomes non-empty by that path). A property author who takes the second reading writes a green test against a broken gate. The leg also names **no cells at all**, where its sibling names four, so nothing pins which reading is asserted. **(b) The non-empty leg does not falsify a relaxed default unless its counts are pinned.** For *"a default later relaxed to valid fails the first leg"* to hold, the fixture must satisfy `A < H` — that is what makes a *valid* seam grant, append and dispatch. On a fixture that merely satisfies the stated description (*non-empty region*, `RESOLVED: yes`) with `A = H` — e.g. a region already carrying its answering line — a *valid* default writes nothing, moves neither count and may dispatch nothing, so all four conjuncts of the leg pass and the regression is missed. The description as written admits that fixture. Repair is to state the cells, as the rest of O-10 does everywhere else: the refusing leg over a region with **`H = 1`, `A = 0`** (AC-1.4 clause 1's first-halt region), and the empty-region leg asserting the observables that actually discriminate — **no refusal, no S-16, `W = 1`, no answering line appended, `A` and `H` still `0`, and ≥ 1 dispatch on a branch whose highest round is below `windowEnd(1)`** — which is both truthful under AC-1.5(4) and fails cleanly under a constant-*invalid* default. Note the ≥ 1 dispatch conjunct is what makes the second half of the claim true; absence of a refusal alone would not, per O-10's own rule about absence-only oracles. | O-10 *The interim ship state*, AC-1.5(4) clause 4, X-06 |
| F-35 | Low | Local | **X-06's *"exactly as today"* is falsified by this REQ's own AC-1.1 and AC-1.5(1).** The new clause ends *"The stated shape can neither grant a window nor open one over an unvalidated region, and leaves branches with **no reset region** behaving exactly as today."* Branches with no reset region are exactly the migration population R-13 describes, and this REQ changes their behaviour deliberately: `MAX_REVIEW_ROUNDS` becomes 3, `W = 1`, and AC-1.5(1) admits *"a branch whose highest existing round is 3 or more … **no rounds**"*, halting immediately — which R-13 itself calls *"Correct and expected, not a defect"*. So the true claim is the narrower one the sentence is reaching for: the interim seam adds **no refusal and no S-16** on such branches, leaving them on whatever path AC-1.1–AC-1.5(3) put them. Stated as *"exactly as today"* it is a falsifiable claim about the shipped behaviour that the document falsifies two sections later, and it is the sentence a test author would read to decide what the empty-region leg of F-34(a) should assert — which is why a wording fix here is not cosmetic. Repair: *"leaves branches with no reset region on the path AC-1.5(1)–(3) already put them on — no refusal, no S-16, no change from this REQ's own behaviour without the seam"*. | §3.1 X-06, AC-1.1, AC-1.5(1), R-13 |
| F-36 | Low | Process | **The document is back against the 90% soft threshold with 9 bytes of headroom, so the fix for F-33/F-34 must again be paid for by a compression pass.** 55,287 bytes against `check-req-size.sh`'s `SOFT_BYTE_LIMIT=55296` — under it, but by 9 bytes; lines are comfortable at 492/630. This is the third round in this document's history to land within tens of bytes of a size gate (v5 sat 3 bytes under the hard ceiling; v6 opened 9,388 bytes of headroom by splitting; v2.1 spent 3,235 of it and closed the gap again). The mechanism the hook exists to prevent is stated in the script's own comment — *"a REQ that can only absorb the next review round by deleting existing text will eventually delete a reason rather than a restatement"* — and it is a live risk here, because both Mediums are closed by **adding** cells to O-10, the single densest row in the document. Filed `Process` rather than `Local`: the recurrence is the signal, and the durable lesson is that a split buys headroom which the very next round spends unless the budget is checked *while* revising rather than after. Practical note for this round: F-33's repair (i) and F-35's are net-neutral or net-shorter, and F-34's needs perhaps 300 bytes — so the fix fits, but only just, and a fifth round would not. | Document size, `pdlc/hooks/scripts/check-req-size.sh:46`–`:48` |

## Questions

Q-04 and Q-05 stay closed. Q-06 is unanswered but was explicitly optional and no finding depends on
it; I restate it once, compressed, and will not carry it a third time.

| ID | Question |
|----|---------|
| Q-06 | AC-1.5(4) fixes the *region validates* predicate's **meaning**; `REQ-RCV-07` AC-7.1 fixes its **procedure**. I checked them against each other again and they still agree clause for clause. Neither document asks for a **conformance leg** pinning the agreement — a shared table of regions labelled valid/invalid *by the meaning*, asserted against the procedure — so a later revision of AC-7.1 that drifts from AC-1.5(4)'s definition fails nothing. Review-time obligation only, or a leg in one of the two O-10s? The split made this seam, and it is now also the seam X-06's interim shape is a restriction of, which is a second reason to want it pinned. |

## Positive Observations

- **The revision refused my proposed fix and was right to.** I asked for a controllable seam
  *"defaulting to invalid in the production composition"*. X-06 adopts the seam and rejects the
  default, with an argument that is checkable rather than asserted: AC-1.5(4)'s false disposition
  refuses the **entry**, and nothing scopes that refusal to entries carrying a clearance, so a
  constant *invalid* refuses every document-typed phase on every feature — including the phases that
  would deliver `REQ-RCV-07`. *"**Fail-closed here is a shape, not a constant**"* is the right
  distinction and it is the first time in seven rounds this document has pushed back on a reviewer's
  proposed remedy on the merits. The shape it chose is the shipped predicate **restricted** to the
  one region it can decide — AC-1.5(4) already declares the empty region valid — so the interim is a
  sub-relation of the final semantics, never a competing one. That is exactly the property that makes
  the eventual swap to AC-7.1 a strict extension, and it means no test written against the interim
  legs has to be deleted when the successor lands.
- **The seam/default split is expressed the way a test can consume it, and it dodges the DC-07 trap
  rather than walking into it.** O-10 now separates the two populations cleanly: the granting legs
  *"drive the *validate* seam explicitly to **true** and never read its production default"*, while
  the interim legs run *"at the production default with no seam override"*. That is the shape DC-07
  asks for — the composed production default has its own oracle, so a test double can never be the
  only thing proving the wired behaviour. The sentence *"never read its production default"* is worth
  singling out: it forecloses the leg that would otherwise pass for the wrong reason once the
  successor ships and the default starts returning *true* on its own.
- **R-14 was rewritten rather than patched.** The v6 finding was a wording defect — *"immediately
  behind"* versus `QUEUE.md` — and the minimum fix was two words. Instead the disposition's whole
  logic changed: *"**Mitigated by fixing the interim *shape*, not by sequencing.** Sequencing is too
  weak at that distance."* A risk register whose mitigation column is falsified by a cited file and
  responds by strengthening the mitigation is doing its job. §3.1 and R-14 now agree with each other
  and with `QUEUE.md`, which I checked directly.
- **The new `O-*`/`R-*`/`X-*` id-collision rule is a real hazard caught early, and I verified the
  collisions it claims.** §7 now states that those namespaces are **not** per-REQ and do collide
  across the split — *"`O-10`, `O-12`, `R-10` and `R-14` differ between this REQ and `REQ-RCV-07`"*.
  All four ids exist in `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` (§8 and §9), so the
  claim is true, and the consequent rule — *"**every cross-document citation of one must name the
  owning REQ**"* — holds throughout this document: every reference I followed says *"`REQ-RCV-07`
  O-10"* or *"that REQ's AC-7.1"*, never a bare id. This is the failure mode that silently
  mis-routes a property between two documents' PROPERTIES phases, and it was written down before it
  bit anyone.
- **§4's widened delegation rule is stated over references rather than a phrase, and it reaches the
  catalogue §3 clauses that were outside the old rule.** *"The rule is over the references, not one
  phrase, because the four rows word them differently"* is the correct generalisation, and both §3
  pointers are now named individually with their destinations. I re-read `pdlc-rcv-catalogue.md:59`,
  `:61`, `:63`, `:118` and `:124` and every reference the rule quantifies over exists as quoted, so
  the rule is stated over real text rather than a remembered version of it. Deferring the shared-file
  edit to the REQ that will own the clauses is also right — the catalogue is read by three REQs and
  should change once, when the change becomes true.

## Recommendation

## Verdict

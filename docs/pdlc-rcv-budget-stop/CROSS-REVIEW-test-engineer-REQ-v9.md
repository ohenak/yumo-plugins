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

Two, and only one blocks. **No High.** The v2.3 changes are the ones I asked for and I am contesting
none of them. The single Medium is about the **one leg the subtraction left behind**: O-10 now owes
exactly one seam property, it is asserted to *falsify an accidental early wiring*, and the fixture it
must run on is not named — on the wrong fixture it is an oracle that cannot fail.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-41 | Medium | Local | **The new 0-call contract leg does not name its fixture, and on the obvious wrong choice it is unfalsifiable — it would pass under both wirings, which is exactly the property it claims to exclude.** O-10 states the obligation as *"one contract leg, on the production path: the injected function's signature, and the interim composition calling it **exactly 0 times** — which falsifies an accidental early wiring and inverts cleanly at row 18."* The falsification claim is true of **one** fixture and false of the other, and the sentence sits immediately before the two interim legs, so *attach it to those legs* is the natural reading — with a 50 % chance of picking the vacuous one. Derive it: AC-1.5(4) clause 4 gates on the conjunction *readable `RESOLVED: yes`* ∧ *`A < H`* ∧ *region validates*. **Leg 2's fixture (`H = A = 0`, no region) makes the second conjunct false**, so a *wired* implementation short-circuits and never reaches the seam either — a 0-call assertion there passes at this ship, passes after row 18, and passes on an implementation that wired the conjunct a feature early. It is a green that carries no information. **Leg 1's fixture is the discriminating one**: `RESOLVED: yes` readable and `A = 0 < H = 1`, so both earlier conjuncts hold, the gate reaches the third, and the wired implementation calls the seam **≥ 1** where the interim calls it **0** — the assertion inverts cleanly at row 18 exactly as O-10 claims. This is the precedence-chain false-green my checklist names: an oracle placed behind an earlier branch that preempts it, where the fixture has to defeat every earlier branch for the terminal assertion to mean anything. There is a second, smaller half: *"exactly 0 times"* is only well-defined once the gate's conjuncts have a stated evaluation order, since an implementation free to evaluate *validates* first would call the seam even on leg 2's region. Both halves close with one clause, and it costs about 25 bytes net: after *"calling it **exactly 0 times**"*, insert *"— asserted on **leg 1's** fixture, the only one that defeats the two earlier conjuncts and therefore the only one a wired implementation would answer differently (on leg 2's region `A < H` is false, so a wired gate never reaches the seam either)"*. Naming leg 1 also disposes of the ordering half, because on leg 1 every conjunct is reached under any order. Note this is not a re-litigation of F-38: the handover is right, and this is the residue of it — the one seam property this REQ keeps has to be the one that can fail. | §8 O-10 (*"one contract leg, on the production path"*, and *Leg 1* / *Leg 2*), §5 AC-1.5(4) clause 4 (*"exactly when all three hold"*), §3.1 X-06, `pdlc/skills/te-review/SKILL.md` *Oracle-Falsifiability* check 4 |
| F-42 | Low | Process | **The fifth consecutive round to land inside a few hundred bytes of a size gate — and this round the file grew while shedding 2.9 KB, so headroom fell from 171 bytes to 58.** 55,238 bytes against `SOFT_BYTE_LIMIT = 55296` (`pdlc/hooks/scripts/check-req-size.sh:47`–`:48`), 455/630 lines. Two relocations and four compressions moved roughly 2.9 KB out (split record §5.1 and §6, plus §4, §4.1, §7 and §10 trims) and the round spent ~3.0 KB putting it back — X-06's summary of the relocated argument, AC-1.5(4)'s new paragraph, §4.1's two clauses, NB-3's DoD sentence and O-10's handover. That is F-36 and F-40's mechanism for the third time running, and the numbers now show it converging on zero: v2.1 left 9 bytes, v2.2 left 171, v2.3 leaves 58. I want to be precise about what is and is not wrong here — **every one of those insertions was a review finding's repair**, so no individual edit is criticisable, and the relocations were faithful (I verified both destinations). The durable signal is structural: a REQ that owns a live forward edge to an unshipped sibling accretes prose *at that edge* on every round, because the edge is where every reviewer's question lands, and relocation cannot outrun it while the sibling is unshipped. F-41's repair is ~25 bytes net so this round fits, but the next round that raises anything on X-06/AC-1.5(4)/O-10 will not. Candidate next relocation, and it is the natural one: **AC-1.5(4)'s *why validation is a conjunct of the gate, not merely a constraint on `W`* argument** (`:316`–`:323`) — it is arithmetic that both halves depend on and that neither half restates, so it belongs beside §5.1 in `pdlc-rcv-split.md`, leaving the claim plus a pointer. That is ~800 bytes and it is the last large shared block in the document. | Document size, `pdlc/hooks/scripts/check-req-size.sh:47`–`:48`, §5 AC-1.5(4), §10 |

## Questions

None. F-41 is a finding with a stated repair, not a request for information, and F-42 is a recurrence
record. No question from any earlier round is still open.

## Positive Observations

- **The repair landed where a test author reads, and it went one clause further than I asked.**
  AC-1.5(4)'s new paragraph closes with *"O-10's interim legs are what this REQ's PROPERTIES derive
  from"* — I asked only that the AC stop asserting behaviour this ship does not have. Telling the
  author where to go instead is the difference between a caveat and a routing rule, and it is what
  stops the next PROPERTIES pass from re-deriving the three tests that must fail. The §4.1 repairs
  are better than the five-word clauses I proposed, because they are **scoped rather than
  wholesale**: the `W` row marks the *invalid* half target state and leaves the *absent* half
  shipped, which is right — `W = 1` on an absent value is decidable today and is a real property this
  REQ owes.
- **F-38 was answered by subtracting, including the part I did not have to name.** The stranded
  *"and on a non-validating entry"* clause in the closing call-count sentence was tracked down and
  removed, and so was v2.2's *"the granting legs above drive the *validate* seam explicitly to
  **true**"* — which had to go, since a leg that drives the seam contradicts a composition that calls
  it zero times. Two rounds ago that consistency check would have been mine to file. A revision that
  finds its own downstream contradictions is the thing that ends a review loop.
- **The handover has a receiver, and I checked it.** *"The non-validating legs are `REQ-RCV-07`
  O-10's in full"* is only a repair if that REQ actually took them. Commit `3105033` carries v2.3's
  X-06/R-14 revisions into `REQ-pdlc-rcv-reset-region.md` X-07 (`:96`), R-16 (`:463`) **and** its
  O-10 (`:452`), which now states *"the non-validating legs [are] this REQ's in full"* and carries
  the *consumes no clearance* leg with its own 0-dispatch oracle. Both ends cite `pdlc-rcv-split.md`
  §5.1, agree the conjunct is unwired in the interim, and agree on the 10 → 12 → 18 distance — the
  three facts §5's obligation row requires them to agree on. This is the third consecutive round the
  paired-edge rule has been discharged in the same commit that triggered it.
- **The relocations moved reasons, not just bytes, and the destinations are complete.** I read
  `pdlc-rcv-split.md` §5.1 against the X-06 text it replaced: all four horns survive — refusing,
  granting, **the narrower procedure**, co-delivery — with their mechanism citations intact
  (`AC-1.4` clause 1 for non-emptiness, `AC-7.4` for the missing repair, `MAX_REVIEW_ROUNDS` 3 for
  the traffic argument, row 18's own Phase R for the self-gating). §6 likewise keeps the catalogue
  §3 row-schema clause that the compressed §4 pointer drops. A relocation that quietly loses the
  clause a reviewer will next ask about is worse than the prose it saved; neither of these does.
- **NB-3's new sentence is the one piece of v2.3 nobody asked for and it is the most operationally
  valuable.** *"So is the *validate* seam being **present and unconsulted in production** at this ship
  (X-06): a DoD finding that it is an unwired integration is correct and known by construction …
  and it is **not** to be remediated by wiring it here."* An injected seam with no production caller
  is precisely what `dod-verify` is built to flag, and the default remediation — wire it — is the
  fail-open this whole edge exists to avoid. Declaring the exception at the non-goal, in the
  verifier's own vocabulary, converts a predictable Phase DOD round-trip into a no-op. That is a
  process-level saving reached by reasoning about a downstream phase's behaviour, not about this
  document's.
- **Leg 1 is now a fixture, not a shape.** Concrete rounds (`highest = 3`, `WINDOW-START: 4`,
  granted window `[4, 6]`) make every conjunct re-derivable by the reader, which is how I caught
  F-41 at all — the same concreteness applied to the contract leg would have made its fixture
  question answer itself.

## Recommendation

_pending_

## Verdict

_pending_

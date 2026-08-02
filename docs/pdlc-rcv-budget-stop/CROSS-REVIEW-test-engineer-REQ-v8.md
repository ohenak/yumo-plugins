# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.2, 458 lines / 55,125 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v7 finding is closed, plus a scan of the text added or rewritten since v7 for new issues. Sections unchanged since v1…v7 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `8a60091..dde2670` (5 commits touching the REQ)
**Date:** 2026-08-01
**Iteration:** 8

## Disposition of v7 findings

All four are **closed**, and the two Mediums are closed by a change of design rather than by adding
the cells I asked for — the interim decision procedure was **removed** instead of being made
writable. I checked each closure against the artifacts the claims cite, and I checked the new design
for the failure modes it now inherits (see F-37, F-38).

| v7 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-33 | Medium | **Closed, by removing the emission rather than by naming a reason** | I asked for repair (i) — *"say the interim refusal emits **no** S-16"* — and v2.2 goes further: there is no interim refusal at all, so there is nothing to render. O-10 now states it explicitly: *"**No interim leg asserts an S-16 notice**: the enum is closed at three, all three are false of a well-formed region, and an entry that declines to decide is not an entry that found the region corrupt"* — which is the argument I made, adopted as text. The catalogue's closure claim at `pdlc-rcv-catalogue.md:63` stays true, no fourth reason was minted, and the character-for-character bar of catalogue §3 is no longer being asked to supply a string no rule can produce. |
| F-34 | Medium | **Closed, both halves, with cells** | The pair is now stated cell by cell exactly where I said the rest of O-10 states them. *Leg 1* is pinned at **`H = 1`, `A = 0`** with one `HALT-REASON:` line and a readable `RESOLVED: yes`, and asserts four positive observables (one `WINDOW-START: {N}` appended at the region's end, `A = H = 1` after, no S-16, no refusal and no ❌ row, **≥ 1** dispatch). *Leg 2* no longer says *"grants the window normally"* — the phrase with two readings — but names the discriminating conjuncts I asked for: *"`H = A = 0`, highest round below `windowEnd(1)` ⇒ `W = 1`, the ordinary window opens — **no** refusal, **no** S-16, **no** answering line written, both counts still `0`, and **≥ 1** dispatch"*. The `A = H` fail-open reading is now foreclosed by the *no answering line, counts unmoved* conjuncts, and O-10 says so in its own words, citing AC-1.5(4)'s *"the loop writes nothing and grants nothing"*. Both legs also survive row 18, which the paragraph claims and which I verified: leg 1's region is well-formed (`H − A = 1 ∈ {0, 1}`, no answering line to range-check) so AC-7.1 will call it valid and still grant; leg 2's region is empty, which AC-1.5(4) declares valid vacuously, and `A < H` is false there either way. |
| F-35 | Low | **Closed at the load-bearing site** | X-06's *"exactly as today"* is gone and replaced with the narrower claim I proposed: *"leaving every branch on the path AC-1.1–AC-1.5(3) and (5) already put it on"*. Two rhetorical restatements survive — X-06's *"the only interim whose behaviour is **today's**"* and R-14's *"every branch keeps HEAD's behaviour"* — but each is immediately scoped by a trailing clause naming AC-1.1–AC-1.5(3) and (5), so a test author reading either sentence to the end reaches the correct expectation. Not re-filed. |
| F-36 | Low / Process | **Closed as filed; the mechanism it warned about is visible in the numbers** | The v2.0 split record moved to `docs/_constraints/pdlc-rcv-split.md` (77 lines, §1–§5), and the REQ is 55,125 bytes against `SOFT_BYTE_LIMIT=55296` — 171 bytes of headroom against v2.1's 9, at 458/630 lines. Relocation was the right instrument (§10 keeps a one-line summary plus the pointer, so no reason was deleted). Worth recording that it bought less than it looks: roughly 2.4 KB left the file and 2.2 KB of it was immediately spent by X-06, R-14 and O-10, which is the exact pattern F-36 described. Re-filed once, compressed, as F-40. |

## Findings

Four, all consequences of the one change v2.2 made — **the third conjunct is no longer wired at this
REQ's ship**. **No High**, and I am not contesting that decision: X-06's argument that any interim
*procedure* is worse than none is correct and I checked both horns of it. The two Mediums are that
the decision was made in §3.1, §9 and §8 and **not carried into the two surfaces a test author
actually derives from** — §5's AC-1.5(4) and §4.1's derivation table — so those surfaces now specify
behaviour this REQ's own delivery cannot exhibit, and O-10 still carries legs over a call site
production never reaches.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-37 | Medium | Local | **AC-1.5(4) and §4.1 still state the validation conjunct unconditionally, so the acceptance surface specifies behaviour this REQ's own implementation is now stated not to have — and those are the two sites a test author derives from.** X-06 and R-14 are unambiguous that the conjunct is *"**not wired into the gate at this REQ's own ship**"* and that *"AC-1.5(4)'s gate is its **two decidable conjuncts**"*. §5 clause 4 says the opposite, in normative voice and with no interim caveat anywhere in its ~30 lines: *"A clearance is **unconsumed** exactly when all three hold: `checkPostmortem` reads a `RESOLVED: yes`, `A < H`, **and the region validates**"*, and its *when it is **false*** bullet fixes four simultaneous consequences (`W = 1`, clearance not consumed, one S-16 notice, the phase refused). §4.1 repeats it twice more, in the rows that are explicitly the derivation contract: the `W` row conditions the greatest `WINDOW-START:` on *"only if the region **validates** (AC-1.5(4))"* with a default column reading *"**Fail-closed: no absent or invalid value ever widens the window**"*, and the clearance row's default column reads *"A region that does not validate ⇒ the refusal AC-1.5(4) fixes"*. All three are false of the shipped interim: an invalid hand-edited `WINDOW-START: 9` **does** widen the window at row 10 (that is precisely R-14's accepted residual), and no entry is refused. The consequence is not stylistic. A PROPERTIES author writing acceptance tests from §5 and §4.1 — which is what §8's own rule directs, *"a review finding of the form 'this AC has no oracle' is answered [by O-10]"* — derives at least three tests that **must fail at this REQ's ship** (invalid region ⇒ `W = 1`; invalid region ⇒ no answering line; invalid region ⇒ refusal + S-16), and dod-verify tracing AC-1.5(4) to implementation finds an unwired conjunct with nothing at the AC to explain it. The information exists in the document; it is in §3.1's edge table and §9's risk register, neither of which is an acceptance surface. Repair is one sentence at each of the three sites, pointing at X-06 and scoping *wiring* (not meaning): at AC-1.5(4), after the *when it is **false*** bullet — *"**This conjunct's wiring waits for its decision procedure** (X-06): at this REQ's ship the gate evaluates the first two conjuncts only, and this bullet's dispositions become reachable at `REQ-RCV-07`'s commit. The predicate's meaning and disposition are fixed here so that commit adds no requirement."*; and a clause in each of §4.1's two default columns saying the same thing in five words. Note this is the *inverse* of the X-05 precedent the document leans on: X-05's interim follows from **unreachability** — no path emits S-11 — so no clause is contradicted, whereas X-06's interim **removes a stated conjunct from a reachable gate**, which needs saying where the conjunct is stated. | §5 AC-1.5(4) clause 4 (*"exactly when all three hold"*, *"when it is **false***"), §4.1 rows *First round of the current window `W`* and *Whether a clearance is still unanswered*, §3.1 X-06, §9 R-14 |
| F-38 | Medium | Local | **O-10 keeps two legs over the non-validating path, but the interim composition never consults the seam — so as written they can only be run by injecting a seam production does not read, which is the builder-not-wired shape my review checklist exists to reject, and O-10 does not say whether they are this REQ's PROPERTIES or row 18's.** Two sentences carry them. The gate paragraph: *"**a region that does not validate consuming no clearance** — neither count moves and no answering line is written — … the non-validating leg drives it to **false** and is `REQ-RCV-07`'s to run in production, since the conjunct is unwired here"*. And the closing paragraph, unchanged from v2.1 and now stranded: *"exactly **0** dispatches on the exhausted-budget entry **and on a non-validating entry**"*. Both describe an entry class the interim composition cannot produce: X-06 states the production composition *"**does not consult**"* the seam, so no value driven into it changes any production observable, and a test that drives it to `false` and asserts a refusal is asserting over a call graph the production entrypoint does not traverse — it passes against a seam, proves nothing about the delivered loop, and would keep passing if the seam were deleted. *"Is `REQ-RCV-07`'s to run in production"* is the acknowledgement, but it is ambiguous in the way that matters to a PROPERTIES author: it can be read as *write the leg here, driven through the seam; the sibling adds the production run* (the DC-07 false-green) or as *do not write the leg here at all* (correct, but then the two sentences above must stop demanding it, and the 0-dispatch sentence must drop its second clause). A property that cannot be run against the production path in the revision that introduces it should not sit in that revision's PROPERTIES obligation. Repair, and it is a subtraction: state that the non-validating legs — the *consumes no clearance* leg, the refusal legs, and the *0 dispatches on a non-validating entry* clause — are **`REQ-RCV-07` O-10's in full**, and that what this REQ's PROPERTIES owes over the seam is at most one **contract** leg asserting the injected function's signature and that the interim composition calls it **0 times** (a call-count oracle on the seam itself, which *is* a production-path assertion and which falsifies an accidental early wiring). That leg is writable today, survives row 18 by inversion, and is the only thing about the seam this REQ can honestly test. | §8 O-10 (*the gate*, and the closing *"no round ran"* sentence), §3.1 X-06, `pdlc/skills/te-review/SKILL.md` *Builder-not-wired runtime oracle* (**not** this repo's `DOMAIN-CONSTRAINTS.md` DC-07 — see that file's numbering caveat at `:11`–`:16`; the skill's `DC-07` cites a different consuming repo) |
| F-39 | Low | Local | **Leg 1's fixture condition is vacuous where its sibling's is load-bearing, so a test author cannot tell whether a constraint is intended.** Leg 1 reads *"a readable `RESOLVED: yes`, **highest round below `windowEnd(N)`** ⇒ the entry **grants**"*. But AC-1.5(4) defines `N` as *"one past the highest round then on the branch"*, so `windowEnd(N) = N + 2` exceeds the highest round on **every** fixture — the condition is a tautology and constrains nothing. Leg 2's *"highest round below `windowEnd(1)`"* is the opposite: with `W = 1` it means *highest ≤ 3*, a real fixture constraint whose violation flips the expected outcome from *dispatch* to *budget halt*, and it is exactly the constraint that makes leg 2's `≥ 1` dispatch conjunct true rather than accidental. A reader who assumes the two phrases are parallel either invents a fixture constraint for leg 1 that does not exist, or discounts leg 2's, which is real. Repair: drop the phrase from leg 1 (the grant follows from the gate alone once `N` is the origin) and keep leg 2's, or restate leg 1's as the thing it presumably means — *"any highest round; the fresh window opens at `N` regardless"*. | §8 O-10 *Leg 1*, AC-1.5(4) clause 4 (*"`N` is one past the highest round then on the branch"*) |
| F-40 | Low | Process | **The relocation bought 2.4 KB and 2.2 KB of it was spent in the same revision, so the document is again inside 200 bytes of the soft threshold with two Mediums outstanding.** 55,125 bytes against `SOFT_BYTE_LIMIT=55296` — 171 bytes of headroom, 458/630 lines. This is the fourth consecutive round to land within a few hundred bytes of a size gate (v5: 3 bytes under the hard ceiling; v6: split, 9,388 bytes freed; v2.1: 9 bytes; v2.2: relocation, 171 bytes). The instrument was right this time — moving the split record to `docs/_constraints/pdlc-rcv-split.md` deletes no reason and gives the sibling a single source — but the pattern F-36 named held anyway: headroom created by relocation is consumed by the same revision that creates it, because the argument being written is always the longest one in the document. F-37's repair is ~450 bytes and F-38's is roughly net-neutral (it subtracts more than it adds), so this round fits — but only via F-38, and only if F-37's three insertions stay to one sentence each. Filed `Process` again because the recurrence, not the instance, is the signal: the durable lesson is that a REQ carrying a live forward edge accretes prose at the edge on every round, and the budget check belongs *in* the revision loop, not after it. Candidate next relocations if this recurs: §4's delegation paragraph and §7's `O-*`/`R-*`/`X-*` collision rule, both of which are already shared with `REQ-RCV-07` and would sit naturally in `pdlc-rcv-split.md` §5 beside the paired-edge rule. | Document size, `pdlc/hooks/scripts/check-req-size.sh:47`–`:48`, §10 |

## Questions

Q-06 was optional and unanswered at v7; I said I would not carry it a third time and I am not. It is
partly overtaken anyway — with the conjunct unwired, the conformance leg it asked for can only live
in `REQ-RCV-07`'s O-10, which is where I would file it if I were reviewing that document. No new
questions: F-37 and F-38 are findings with stated repairs, not requests for information.

## Positive Observations

- **The v2.2 design change is right, and it was reached by rejecting my own preferred fix twice
  over.** At v6 I asked for a seam defaulting to *invalid*; v2.1 rejected that and gave a restricted
  predicate; v7 I asked for that predicate's cells; v2.2 concluded the predicate itself should not
  exist yet. The argument is checkable and I checked both horns. *Refusing horn:* an interim that
  refuses what it cannot decide refuses on **non-emptiness**, and AC-1.4 clause 1 makes the region
  non-empty **exactly** when the phase has halted — so the first halt of every phase would be
  terminal, and `RESOLVED: yes` cannot clear it because `parseResolvedMarker`'s result is read
  *inside* the gate that is failing. With `MAX_REVIEW_ROUNDS = 3` landing in the same commit, halts
  get **more** frequent, so the disabled path gets **more** traffic — including row 18's own Phase R,
  which would gate the replacement on the replacement not being needed. That is a genuine deadlock,
  not a hypothetical. *Granting horn:* trivially the fail-open. Concluding that the only safe interim
  is **no interim** is the correct reading of a two-horned dilemma, and it is the third round running
  that this document has answered a reviewer's proposal on the merits rather than by compliance.
- **The interim legs were rebuilt to be swap-stable, and the claim survives checking.** O-10 asserts
  *"both its legs stay true after row 18 wires the conjunct — so neither is deleted at that commit;
  what row 18 adds is the refusing leg"*. I verified it against AC-7.1 as the sibling states it: leg
  1's region is `H = 1, A = 0` with no answering line, so `H − A = 1 ∈ {0, 1}` holds and there is no
  answering-line value to range-check ⇒ valid ⇒ still grants; leg 2's region is empty, which
  AC-1.5(4) declares valid vacuously, and `A < H` is false there under either wiring. A property that
  does not have to be rewritten when its forward edge lands is worth much more than one that merely
  passes today, and this is the property v7 could not have produced — the v2.1 shape would have had
  its refusing leg deleted at row 18.
- **The `A = H` fail-open is now closed by conjuncts rather than by adjective.** Leg 2's *"no
  answering line written, both counts still `0`"* is exactly the pair that discriminates the two
  readings of the old *"grants the window normally"*, and O-10 states **why** it carries them, citing
  AC-1.5(4)'s *"the loop writes nothing and grants nothing"*. Stating the reason next to the conjunct
  is what stops a later compression pass from deleting it as redundant — which is the failure mode
  F-40 is about.
- **The paired-edge rule is real, and the sibling actually carries the same words.** §10's new
  paragraph says X-06/R-14 and `REQ-RCV-07` X-07/R-16 are *"the **same edge described from both
  ends**"* and must be revised *"in the same commit, in the same words — including v2.2's"*. I read
  the sibling: `REQ-pdlc-rcv-reset-region.md:96` (X-07) and `:463` (R-16) both carry the unwired
  design, both name the two rejected horns in the same vocabulary, both cite `pdlc-rcv-split.md` §5,
  and both agree on the queue order. The obligation was discharged in the same revision that created
  it, which is the only evidence that a paired-edge rule is more than a promise.
- **The relocation kept the pointer and the summary, not just the file.** `pdlc-rcv-split.md` exists
  with §1–§4 (the narrative, the moved-clause table, what stayed, the three consequences) and §5 (the
  paired edges), §10 keeps a one-sentence restatement of the cut plus *"no requirement, AC, `S-*` id,
  threshold or user story changed meaning"*, and the header table gained a **Shared split record**
  row so a reader arriving at the document cold is routed before §10. Relocation that leaves a
  dangling reference is worse than no relocation; this one does not.

## Recommendation

**Needs revision**

All four v7 findings are closed, and the two Mediums are closed by a **better** change than the one I
asked for: rather than making the interim decision procedure writable as a test, v2.2 establishes
that no interim procedure is safe and removes it. I checked both horns of that argument and both
hold. **No High**, nothing about the interim *decision* is contested, and the O-10 legs that replaced
the v2.1 pair are cell-by-cell, positively asserted, and — I verified this — still true after row 18
wires the conjunct.

What blocks approval is that the decision landed in **§3.1, §9 and §10 but not in §5 and §4.1**, the
two surfaces a PROPERTIES author derives tests from.

1. **F-37 (Medium)** — AC-1.5(4) clause 4 still says a clearance is unconsumed *"exactly when all
   three hold … **and the region validates**"*, and fixes four consequences for the false case, with
   no interim caveat; §4.1 repeats the conjunct in both derivation rows, one of whose default columns
   asserts *"no absent or invalid value ever widens the window"* — which the interim falsifies, since
   an invalid hand-edited `WINDOW-START:` **does** widen it at row 10 (R-14's own accepted residual).
   A test author working from those two sections derives at least three tests that must fail at this
   REQ's ship, and DoD tracing AC-1.5(4) to implementation finds an unwired conjunct with nothing at
   the AC to explain it. Repair is one sentence at AC-1.5(4)'s false bullet scoping the **wiring**
   (not the meaning) to `REQ-RCV-07` per X-06, plus a five-word clause in each of §4.1's two default
   columns. Note the asymmetry with the X-05 precedent this document leans on: X-05's interim follows
   from unreachability, so no clause is contradicted; X-06's removes a conjunct from a **reachable**
   gate, which has to be said where the conjunct is stated.

2. **F-38 (Medium)** — O-10 still carries the non-validating legs (*"a region that does not validate
   consuming no clearance"*, and *"**0** dispatches … on a non-validating entry"*) while X-06 states
   the production composition *"does not consult"* the seam. Driving an unconsulted seam to `false`
   and asserting a refusal is a test against a call graph the production entrypoint never traverses —
   it would keep passing if the seam were deleted. *"Is `REQ-RCV-07`'s to run in production"*
   acknowledges this but leaves a PROPERTIES author two readings, one of which is the false-green.
   The repair is a subtraction: hand those legs wholly to `REQ-RCV-07` O-10, and let this REQ own one
   seam leg it can actually run on the production path — a **call-count oracle asserting the interim
   composition calls the seam 0 times**, which falsifies an accidental early wiring and inverts
   cleanly at row 18.

The two Lows are small. Leg 1's *"highest round below `windowEnd(N)`"* is vacuous by AC-1.5(4)'s own
definition of `N`, where leg 2's parallel phrase is load-bearing, so the two read as a pair when only
one constrains anything (F-39). And the relocation to `pdlc-rcv-split.md` bought ~2.4 KB of which
~2.2 KB was spent in the same revision, leaving 171 bytes under the soft byte threshold with two
Mediums outstanding — filed `Process` for the fourth-round recurrence, not for this instance (F-40).

**On room.** F-38's repair subtracts more than it adds, F-39's is a deletion, and F-37 needs roughly
450 bytes across three insertions. Net it fits inside 171 bytes plus what F-38 and F-39 return — but
apply F-38 and F-39 **first**, then F-37, so the budget is never the reason a sentence gets shortened
into ambiguity. If it still does not fit, relocate rather than delete: §4's delegation paragraph and
§7's `O-*`/`R-*`/`X-*` collision rule are both already shared with `REQ-RCV-07` and belong beside the
paired-edge rule in `pdlc-rcv-split.md` §5.

Explicitly **not** filed: the decision to leave the conjunct unwired, which is correct and whose
supporting argument I verified on both horns; the shape and cells of O-10's two interim legs and
their swap-stability claim, which I checked against `REQ-RCV-07` AC-7.1; the absence of any S-16 in
the interim; the relocation of the split record and its pointers; the paired-edge rule, whose
discharge I verified at `REQ-pdlc-rcv-reset-region.md:96` and `:463`; the release-coupling answer in
R-14; and everything in §1, §2, §4, §4.1's unaffected rows, AC-1.1–AC-1.4, AC-1.5(1)–(3) and (5),
§6, §7, §8 beyond O-10 and §9 beyond R-14 — approved across seven rounds and unchanged here. Nothing
here contests user need, priority, phasing, the budget of three, the split, or shipping this REQ
ahead of its successor.

## Verdict

VERDICT: Needs revision

{"high": 0, "medium": 2, "low": 2}

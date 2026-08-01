# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 7
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v6.md` (baseline `fb9ac66`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `db9b544`, clean.

## 1. Delta scan

```
git rev-parse fb9ac66:docs/.../REQ-pdlc-review-convergence.md → 97682c5…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → b0af913…
git diff --stat fb9ac66 HEAD -- …/REQ-…md → 304 insertions(+), 84 deletions(-)
bytes: 209,953 → 241,698   (+31,745)
```

The revision is v1.4 → v1.5 and it answers round 6 from both panels, across twelve commits
(`5174e21` … `db9b544`). Changed sections, and the only ones scanned below: the header (Cross-Reviews
row, the v1.5 revision note), §5 (*reset region*, three durability rows, the catalogue lead-in now
**sixteen**, the kind ordering, the `HALT-REASON:` lead-in paragraph, S-12 rewritten, new **S-15** and
**S-16**, S-13/S-14's append rule, the `notice` sentence), AC-1.4 (clause 1 restated over **every**
halt, clause 2 scoped to **unfenced** markers, the new *why the first halt is stated* paragraph),
AC-1.5(4) (the gate's third conjunct, three new paragraphs — append, non-consumption, sanctioned
repair — the five-step algorithm with its new **step 3**, the `H − A ≤ 1` paragraph, the
listing-time-validity paragraph), AC-1.5(5) (the three-row table and its new justifying paragraph),
AC-1.5's closing re-wrap, AC-2.6 (table header and four *When*/pair/fire cells restated over `W`, plus
the new justifying paragraph), AC-2.7 (numbered, read-in-order table with new **row 3**, the trailing
space, the new row-3 trace paragraph), AC-3.2 (*Given* gains the dispatched range, clause 1 restated,
new justifying paragraph), AC-3.4 step 1, AC-4.7 (`notice` cell, new precedence row 8, new S-16
paragraph), §6 (three rows amended, one added), O-3, O-5, O-9(c), O-10 (seven new bullets), §10.9's
heading and lead-in, and new §10.10. Sections that did not change — §1–§4, AC-1.1–1.3, AC-2.1–2.5,
AC-2.8, AC-3.1, AC-3.3, AC-3.5–3.7, AC-4.1–4.6, AC-5, AC-6, §7–§9 — are not re-litigated, except where
a changed section is stated *over* one of them: AC-1.1's *"admitted no rounds and halts immediately"*
and AC-1.5(3)'s clearance gate are read below as the receivers of AC-1.5(4)'s new refusal branch.

Growth into this round is +31,745 bytes — `new-mechanism` under AC-4.2, and under AC-3.1 that would
escalate **this** round to the full panel, which is what it got. That is now four consecutive
`new-mechanism` rounds on a document whose own AC-2.6 target regime is `incremental`; I note it under
R-9 rather than as a finding, because every one of those bytes was requested by a reviewer.

## 2. Disposition of round-6 findings

Three of mine were open (1 High, 1 Medium, 1 Low). **All three are resolved**, each checked against the
document rather than against §10.10's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-1.4 clause 1 is restated over *"**every** halt, without exception"*, with the creating halt named explicitly: *"creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own"*. The two cases are unified through O-5's read-modify-write — *"the captured region of a file that does not exist is the **empty region**"* — which is the right place to put the unification, because it is one implementation rule rather than two ACs. The consequence I asked for is now stated where the accounting reads it: *"`H` … is **exactly the number of halts this document has taken**, on every path"*, repeated in §5's durability row and in S-12. §6's `## Reset Region` row no longer delegates into a clause that does not fire — it names the creating halt itself. And O-10 gains the fixture the v1.4 text did not entitle a PROPERTIES author to, *with* the reason the existing test does not cover it (*"written against a fixture that already has a region and passes under both readings"*) — that sentence is what stops the bullet being folded back into the neighbouring test. |
| F-02 | Medium | **Resolved** | All three halves are answered. (a) Validation is now the third conjunct of clause 4's gate — *"a `RESOLVED: yes`, `A < H`, **and the region validates**"* — so a corrupt region writes nothing, exactly the direction I recommended. (b) The sanctioned repair is stated as an operator action rather than left implicit, and §5's *"machine-written and machine-maintained"* is qualified to match. (c) The notice gains **S-16** (`reset-region-corrupt: {reason}`, closed three-member enum), an AC-4.7 precedence-8 slot with a stated row shape for the admits-no-round case, and a §6 row — so a PROPERTIES author can now assert the operator-visible half. F-01 below is about what happens on the entry *after* the refusal, not about the refusal itself. |
| F-03 | Low | **Resolved** | AC-1.5(5)'s table drops *absent* and the paragraph beneath states the unreachability argument in the same terms I filed it (`A < H` ⇒ `H ≥ 1` ⇒ a last line exists), then relocates the real absent case *"one level up, at the region"* with S-12 named as its one home. §5's S-12 row carries it. A dead fixture is removed and the live one keeps exactly one authority. |

Mechanical fixes MF-12 (AC-2.6's cells restated over `W`, `W+1`, `W+2` — and the new paragraph
explaining that the absolute-index reading is off by `W − 1`, which is the part a test author needs),
MF-13 (AC-2.7 numbered and read in order, with rows 5–7 scoped to *"exactly one `VERDICT: ` line"*),
MF-14 (re-wrap) and MF-15 (*"never **counted**, wherever in the file it sits"*) are all applied.
Q-09 is answered by the new `H − A ≤ 1` paragraph — and, better, *validated* by step 3 rather than
asserted. Q-10 is answered by the listing-time-validity paragraph, which states the predicate is
deliberately re-evaluated on every read and names harvest's paired deletion as the reason the ordinary
path never reaches it. MR-03, MR-04 and MR-06 are carried and correctly recorded as non-blocking.

I record one thing about the *shape* of this round's answers, because it bears on F-01 below. Six of
the seven round-6 findings were answered by adding a new conjunct, a new step, or a new input to a
mechanism that already existed. Every one of those additions is locally correct. The failure mode that
remains is the same one round 6 found and round 5 found before it: a new branch is stated, and the
**path the system takes after that branch** is not re-traced against the ACs that own it.

## 3. Findings

Every finding below is **new** and lies in text this revision changed. All four ids are fresh; none is
a re-file. Three of the four are consequences of one structural move — v1.5 added a *refusal* branch to
AC-1.5(4) (a clearance that is observed but not granted) without stating what the entry does next, and
the entry does something: it halts.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **A refused clearance is not inert. The entry is admitted, immediately halts on the budget path, and that halt appends a `HALT-REASON:` and strips the marker — so the clearance does *not* survive, `H − A` ratchets to 2, and the sanctioned repair then fails step 3 permanently.** The dead end F-02 of round 6 closed is re-opened by the new step 3, through a different door. See §3.1. | AC-1.5(4)'s *"an invalid region is inert … the operator's clearance survives for a later entry"*, AC-1.5(4) step 3, AC-1.5(1), AC-1.4 clauses 1–2, O-10's v1.5 bullet 3 |
| F-02 | Medium | Local | **The sanctioned repair is undefined for one of S-16's three reasons.** The repair is *"the operator deletes or corrects the offending line named in the report — and nothing else"*. `counts-mismatch` names **no line** — S-16 carries *"the pair `H`/`A`"* for that reason — and repairing it requires *adding* an answering line or *removing* a `HALT-REASON:`, both of which the *"and nothing else"* clause forbids and the second of which contradicts *"leaving `H` equal to the number of halts the document has taken"*. O-10's counts-mismatch bullet accordingly asserts *"**no** window granted on that entry **or any later one**"* — a permanent halt with no exit — while the sibling bullet for the invalid-value reason asserts a repair does work. One third of a closed enum is fail-closed with no stated way out. See §3.2. | AC-1.5(4)'s sanctioned-repair paragraph, step 3, S-16, O-10 bullets 2–3 |
| F-03 | Medium | Cross-Feature | **The verifier's dispatched round range is a new boundary-crossing input with no grammar, no catalogue id and no total receive side — the exact DC-01 defect the paragraph that introduces it cites DC-01 to justify.** AC-3.2's *Given* now requires *"a dispatch that names the window: the loop passes the verifier the inclusive round range `{W … N−1}` … as an explicit input"*, and clause 1's required `## Disposition` row set is a function of it. But: §5's catalogue is declared closed at **sixteen** and this input is not among them, so its rendering is unfixed (`{W … N−1}`? `4..6`? `rounds 4–6`?) while AC-6.4 elsewhere fixes a *range separator* precisely because ranges are ambiguous; AC-3.2's *Then* states no behaviour for an absent, empty or unparseable range; and the only statement of that behaviour lives in **O-9(c)** — *"a verifier given no range does not guess … it reports the missing input"* — which is an FSPEC/implementation obligation, not an AC, and names no report slot, no notice id and no loop-side response. AC-3.2's completeness check is an approval gate, so a verifier that receives a garbled range emits the wrong row set and refuses approval for the wrong reason — which is SE v6 G-16's failure relocated into the seam, not removed from it. A PROPERTIES author can write the happy-path range test (O-10 bullet 6 asks for exactly that) and has nothing assertable for any other input. This is the third consecutive round in which a new loop→agent value shipped without a receive side (v1.4's `HALT-REASON:` → TE v5 F-06; v1.5's S-16 → TE v6 F-02); the recurrence is why I tag it `Cross-Feature`. | AC-3.2 *Given* and clause 1, its new justifying paragraph, §5 catalogue lead-in, O-3, O-9(c), O-10 bullet 6 |
| F-04 | Low | Local | **AC-2.7's new row 3 assigns *malformed* to an input that §5 defines as *unavailable*, and §5 is not amended.** §5: *"**unavailable** — a quantity that no reader can obtain from the branch — distinct from **malformed**, which is a quantity that was read and could not be parsed."* Row 3 is a `## Verdict` section carrying **no `VERDICT: ` line at all**: no quantity was read, so §5's own words classify it *unavailable*. Row 4 explicitly appeals to that definition to justify itself (*"which is §5's definition of *malformed* exactly"*), so the definition is load-bearing in the same table. The classification row 3 asserts is correct against HEAD and the trace is verified — I am not contesting the value. But a test author who reasons from §5 rather than from the row gets the opposite answer, and the document's own convention is that §5's definitions are the authority the ACs are stated over. Fix: amend §5's *malformed* entry to cover the structurally-absent-trailer case explicitly (e.g. *"…or a `## Verdict` section that structurally should carry the quantity and does not — see AC-2.7 row 3, which is stated over `parseVerdict`'s `malformed: true` fallback"*), or add one sentence to row 3 saying it is a deliberate exception to §5's split and why. | AC-2.7 row 3, §5 *unavailable* / *malformed* definitions, AC-2.3 |

### 3.1 F-01 in full — the refusal branch does not survive the halt that follows it

AC-1.5(4)'s new non-consumption paragraph closes with a claim about what happens after a refusal:

> With the conjunct, an invalid region is **inert**: nothing is written, nothing is granted, the run
> report names the file and the values found (S-16), and **the operator's clearance survives for a
> later entry**.

Neither half is true on the path the document specifies, because the refusal happens *inside* an entry
that has already been admitted and that must now do something with the rounds it has.

**The trace, entirely from ACs this document fixes.** The refusal is evaluated by AC-1.5(4), which runs
on an entry the phase gate already let through: clause 3's gate — the shipped one — is
`checkPostmortem`'s reading of the **marker**, and the marker says `RESOLVED: yes`. AC-1.5(4) then
refuses the grant, so `W` stays 1. AC-1.5(1) is unambiguous about what a branch with three or more
rounds and `W = 1` gets: *"a branch whose highest existing round is 3 or more is admitted **no rounds**
and **halts immediately on the budget path (AC-1.4)**, emitting the S-4 halt reason"*. And AC-1.4, as
v1.5 restated it, is unconditional: on **every** halt, without exception, (1) the halt appends its own
`HALT-REASON:` line to the region, and (2) every unfenced `RESOLVED:` line in the file is stripped.

So the entry that "wrote nothing" writes two things, and both of them are the load-bearing ones:

1. **The clearance does not survive.** Clause 2 strips it on the way out. The operator returns to a
   post-mortem with no marker, which is the state `checkPostmortem` maps to `unresolved` and step G
   refuses on. The sentence *"the operator's clearance survives for a later entry"* is false as
   written, and it is the sentence that makes the fail-closed branch tolerable.
2. **`H − A` ratchets, and step 3 turns the ratchet into a brick.** Take the reachable region my round-6
   F-02 was filed about: two `HALT-REASON:` lines, one **invalid** `WINDOW-START: 99`. `H = 2`, `A = 1`,
   `H − A = 1` — counts fine — step 2 fails ⇒ S-16 `invalid-window-start`, no grant. The entry then
   halts: `H = 3`, `A = 1`. The operator reads the report, performs the **sanctioned repair** exactly as
   written (correct `99` → `4`, *and nothing else*), and clears again. Step 2 now passes. Step 3 does
   not: `H − A = 2 ∉ {0, 1}` ⇒ `counts-mismatch` ⇒ `W = 1`, no grant — and the entry halts again,
   `H = 4`. Every retry moves the counts one further from repairable. The repair the document sanctions
   **cannot** succeed after a single refusal, and the phase is a permanent halt.

That is precisely the dead end the same paragraph says the conjunct exists to prevent — *"every
subsequent clearance would be consumed and grant nothing, and the phase would halt on entry forever"*.
v1.5 removed the consumption and left the halting, and then added a counts check that converts the
halting into permanence. Step 3 is not wrong; it is correct and necessary (SE v6 G-14 is real). What is
missing is that the refusal path was never re-traced through AC-1.5(1) and AC-1.4 after step 3 landed.

**The testability half, which is why this is High and not Medium.** O-10's third v1.5 bullet is the
falsifying test for this branch, and as written it is unsatisfiable by a conformant implementation:

> • a region whose `WINDOW-START:` fails step 2 with `A < H` ⇒ **nothing written**, the clearance
> survives, and a later entry after the operator's sanctioned repair grants the window (AC-1.5(4) —
> TE v6 F-02). The v1.4 reading spent the clearance here, so the assertion is *the file is
> byte-unchanged apart from the report*.

A PROPERTIES author who writes that test against an implementation that obeys AC-1.4 gets RED on all
three conjuncts: the file **is** changed (a `HALT-REASON:` appended, the marker removed), the clearance
does **not** survive, and the later entry after the repair grants **no** window. There are only two
outcomes and both are bad: the author reports the REQ as internally contradictory and the phase stalls,
or — far more likely, because the bullet reads like a settled expectation — the author writes the test
against a fixture that stops at the refusal and never runs the following halt, which is an oracle that
structurally cannot observe the defect. That is the unfalsifiable-oracle shape again: the one property
that distinguishes "inert" from "ratcheting" is the one the obligation as written steers away from.

**Fix.** State what the entry does when AC-1.5(4) refuses a clearance for corruption. The reading that
makes the paragraph's own claim true is that the entry **refuses the phase rather than taking a halt** —
it emits S-16, leaves the file untouched (marker included), and returns, exactly as step G refuses an
unresolved post-mortem without writing one. One sentence in AC-1.5(4), plus a matching exception in
AC-1.4 clause 1's *"every halt, without exception"* (there is no halt to except — the entry never
halts), plus AC-4.7's row-8 note already anticipates the shape (*"a row carrying `round` = the round
that would have opened and every other column empty"*, which is only accurate if no halt occurs). If
instead the halt is intended, then say so and state that its `HALT-REASON:` is **not** counted in `H`
(or that clause 2 does not strip on this path), because otherwise the counts are guaranteed to drift by
one per refused entry and step 3 guarantees the drift is terminal. Either way, O-10 bullet 3 must be
restated to match, and a bullet added for *the entry after a refusal* — that is the test neither
reading currently asks for and it is the one that separates them.

### 3.2 F-02 in full — one third of the closed enum has no exit

S-16's reason enum is closed at three members, and the document is explicit that the notice is *"the
operator's only signal that the region needs the sanctioned repair AC-1.5(4) describes"*. The repair is
stated once:

> When the run report emits S-16, the region is **human-repairable**: the operator **deletes or corrects
> the offending line named in the report** — and nothing else — leaving `H` equal to the number of halts
> the document has taken and `A` equal to the number of clearances already answered.

That instruction is total over two of the three reasons and empty on the third:

| Reason | What the report names (S-16) | Is "delete or correct the offending line" actionable? |
|---|---|---|
| `invalid-window-start` | the offending value | yes — one line, one edit |
| `invalid-window-resumed` | the offending value | yes — one line, one edit |
| `counts-mismatch` | *"the pair `H`/`A`"* — **no line** | **no** |

A counts mismatch is by construction a statement about lines that are *missing* or *surplus*, not about
a line that is wrong. Step 3 names both directions: `A > H` (surplus answers) and `A < H − 1` (*"a halt
is recorded whose clearance no line answers, which is only reachable if a line was removed"*). Repairing
the second — the reachable one, and the one F-01 shows the system generates by itself — means **adding**
a `WINDOW-START:` or `WINDOW-RESUMED:` line, or **deleting** a `HALT-REASON:`. The first is neither a
delete nor a correction of a named line, so *"and nothing else"* forbids it; the second is forbidden
twice over, since it also breaks the same sentence's requirement that the repair leave *"`H` equal to
the number of halts the document has taken"* — and it would falsify the invariant AC-1.4 clause 1 was
just rewritten to guarantee. Adding an answering line is additionally the one edit the document is most
emphatic a human never makes: §6's `WINDOW-START:` row says *"Written by the loop, **never by a
human**; it carries no authority of its own"*.

O-10 records the consequence without flagging it. The counts-mismatch bullet asks for a test asserting
*"`W` = 1, **no** window granted on that entry **or any later one**"* — i.e. the obligation explicitly
pins a permanent, unrecoverable halt — while the neighbouring invalid-value bullet asks for *"a later
entry after the operator's sanctioned repair grants the window"*. Two adjacent obligations, one
recoverable and one not, and nothing in the document says the asymmetry is deliberate.

**Why it is Medium and not Low.** It is not that the operator has no move at all — there is an obvious
one, and it is the absence of any statement about it that makes this a finding. Deleting the
post-mortem outright restores `H = A = 0` (S-12: an absent heading is an empty region), so the phase
halts once more, writes a fresh one-line region, and the next clearance works. That path costs one
round-trip and is available today — I checked that nothing blocks it: `guard-harvest-before-delete.sh`
matches only `CROSS-REVIEW` / `CODE_REVIEW` tokens (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`,
`if "CROSS-REVIEW" not in cmd and "CODE_REVIEW" not in cmd`), so a post-mortem deletion passes the hook
even though the file is a harvest input. But that path is nowhere sanctioned and nowhere described, and
it silently discards the halt history the region exists to keep. An operator who reasons from this REQ
alone concludes the phase is bricked; an operator who guesses concludes the machine state is
disposable, which is the opposite of what §5 says. Either way, a PROPERTIES author
asked to prove the escape hatch is operable — which is the whole of AC-1.5(3)'s *"stated here because
it is what makes an absolute cap operable rather than a dead end"* — cannot write a green recovery test
for one third of the enum.

**Fix, one paragraph in AC-1.5(4):** state the repair per reason. For the two value reasons, the
existing sentence is right. For `counts-mismatch`, say what the operator does — my recommendation is
the coarse, unambiguous one, since a counts mismatch means the machine state is no longer trustworthy:
*"a `counts-mismatch` region is not line-repairable, because the mismatch is about lines that are
absent; the operator's repair is to delete the `## Reset Region` section entirely (or the post-mortem
with it), which returns the document to `H = A = 0` — the never-reset state — at the cost of one
further halt to re-create it."* Then add the recovery leg to O-10's counts-mismatch bullet, so it no
longer asserts a permanent halt as the specified outcome.

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict

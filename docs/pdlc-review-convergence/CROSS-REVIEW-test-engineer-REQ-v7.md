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

Reported per AC-6.5 as a fix list, not as blocking findings; excluded from the counts below. MF-12 …
MF-15 of v6 are all applied and are not carried.

| # | Location | Issue | Fix |
|---|---|---|---|
| MF-16 | AC-1.5(5), lead-in | The `S-12` → `S-15` edit left the sentence unwrapped at 113 columns (`docs/…/REQ-…md:826`), against 96–105 in the surrounding lines of the same clause. | Re-wrap. |
| MF-17 | §5, S-16 row and AC-4.7 row 8 | The reason enum's payload is stated twice and not identically: S-16 says the notice *"carries the post-mortem's path and, per reason, the offending value or the pair `H`/`A`"*; AC-4.7 row 8 says only that it is emitted on the first row. Neither fixes the **rendering** of that payload, while every sibling notice's render is fixed character-for-character *"because a test author must be able to derive the exact cell, character for character, from this document alone"* (AC-4.7's own words). | Fix the render once, e.g. `reset-region-corrupt: counts-mismatch (H=3, A=1) {path}`, in the S-16 row only. |
| MF-18 | AC-1.5(4), step 3 | *"`A > H` means more clearances have been answered than halts have been taken"* — under AC-1.4 clause 1 as v1.5 now states it, `A > H` is unreachable by any path the loop takes (a halt always precedes its answer, and `H` counts halts exactly). Stating it as one of the two corruption cases is right; stating it without noting it is only reachable through a hand-edit invites a PROPERTIES author to look for a machine path to it. | Add four words: *"…which only a hand-edit produces"*. |
| MF-19 | §10.10, lead-in | *"all seven findings below lie in text v1.4 added"* — the table carries eight finding rows (TE F-01, SE G-13 … G-17, TE F-02, TE F-03). The prose count and the row count disagree, which is the same class of slip §10.9's heading was amended to prevent this round. | Seven → eight, or say which row is not counted. |

## 5. Measurement Required

Filed under AC-5.2's convention. Non-blocking; excluded from the counts below. MR-01 and MR-02 remain
bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`. MR-03, MR-04 and
MR-06 are carried unchanged and are correctly recorded in §10.10 as non-blocking; I do not restate them.

| # | Fact to measure | How | What it would settle |
|---|---|---|---|
| MR-07 | **New.** When the loop refuses a clearance for corruption (AC-1.5(4) step 4) and the phase then has no rounds to run, does the shipped code path reach the post-mortem writer at all, or does it return before it? | Read `reviewLoop`'s entry sequence at the Citation baseline and note whether the zero-admitted-rounds case reaches the halt writer or short-circuits. | Whether F-01's ratchet is a specification defect only, or also matches an implementation that already halts. It does not change the fix — the REQ must state the behaviour either way — but it decides whether the FSPEC is describing a change or a preservation. |

## 6. Questions

Q-09 and Q-10 of v6 are both answered in v1.5 (§2 above) and are closed. Two new ones, both answerable
in a sentence and neither blocking.

| ID | Question |
|----|---------|
| Q-11 | Is the S-11 (`no-revision:`) clearance path subject to the same refusal arithmetic as the convergence path? AC-1.5(5) routes an S-11 clearance to `WINDOW-RESUMED: {W}`, which does not move the origin — so on a window whose three rounds are already spent, a resumed window admits **no** rounds and the entry halts immediately, incrementing `H` again. `A` is incremented too (the clearance was honoured), so `H − A` stays at 1 and step 3 is satisfied; the mechanism is safe. But the operator sees a clearance answered and a halt in the same entry, and the run report row carries S-14's answer and S-4's halt together. Is that intended, and is it worth one sentence? A PROPERTIES author writing the S-11 path needs to know whether "resumed" and "halted" co-occurring is a pass or a bug. |
| Q-12 | Does the *first* halt's region creation compose with a post-mortem the **agent** writes? AC-1.4 clause 1 now says the creating halt produces a file carrying `## Reset Region` with one line, and O-5 says the loop captures the region *before* the dispatch and re-applies it *after*. On the first halt there is no "before" — the file does not exist — so the loop's only opportunity is the re-apply, which must now **create** a section in a document the agent has just authored, at a position no AC fixes (§5 defines the region as running to *"the next top-level heading or end of file"*, so appending at end of file is the only placement that is self-consistent). Is end-of-file the intended placement, and is it worth saying? It is the one detail the first-halt fixture in O-10 has to assert positionally. |

## 7. Positive Observations

- **The first-halt fix was taken at the right altitude.** I proposed adding a clause for the creating
  halt alongside the existing one — two cases, two sentences. v1.5 instead found the single rule that
  covers both: *"the captured region of a file that does not exist is the **empty region**"*, stated in
  O-5 where the implementation lives, so AC-1.4 has one obligation rather than a case split that a
  later edit could desynchronise. That is the third round running in which the answer generalised the
  fix rather than applying it, and it is the reason `H` can now be described in five words
  (*"exactly the number of halts taken"*) in four different places without any of them drifting.
- **Step 3 is the one addition this revision made that no reviewer's proposed wording contained.**
  SE G-14 asked for the invariant to be validated; my Q-09 asked whether it was worth *stating*. v1.5
  did both and, crucially, gave the invariant a reachability argument rather than an assertion — *"a
  halt strips the marker … so two halts cannot accumulate without an answer between them"*. That
  argument is what let me find F-01: I could only construct the counts drift by looking for a path the
  argument does not cover. A stated invariant with a stated reason is testable *and* attackable; an
  assumed one is neither.
- **O-10's v1.5 bullets carry their own justification, not just their assertion.** The first-halt
  bullet explains why the existing test does not cover it; the append bullet says *"with a prepending
  implementation failing the test"*, which is a mutation criterion, not a description; the `VERDICT: `
  bullet names the exact object the assertion must match and the exact object it must **not**
  (`malformed: true` vs the genuine `0/0/0`). Those are the three shapes that most often false-green in
  this repo, and each is pre-empted in the obligation itself. F-01 is a defect in one of these bullets,
  which is precisely because the bullets are specific enough to be wrong — a vaguer obligation would
  have hidden the contradiction.
- **AC-2.7 row 3 was verified against HEAD rather than reasoned from the model.** The trace
  (`:900-903` → `:906` → `:415-422` → `:424-428`, the object at `:394-400`, distinct from `:451`) is
  the kind of citation that survives a reader who disbelieves it. I re-read all six of those locators
  at `9486c81` and they resolve as described, including the distinction between the two zero-count
  return objects — which is the whole content of the row. F-04 below contests where the *definition*
  lives, not the value.
- **The trailing space is now normative in both places it is read.** `VERDICT:Approved` counting as
  zero is a one-character behaviour that would otherwise have been discovered in implementation, and it
  is now in AC-2.7's preamble, AC-3.4 step 1 and an O-10 bullet with the counter-example spelled out.
  That is the cheapest possible moment to fix it and it was fixed from a **mechanical** note, not a
  finding — the fix list is doing the job it exists for.

## 8. Recommendation

**Needs revision**

Mandatory per the approval rules: one High and two Medium findings are open. **All three round-6
findings are resolved**; every open finding is new and lies in text this revision added.

What must change before this document can be approved:

1. **F-01** — state what the entry does after AC-1.5(4) refuses a clearance for corruption. As written,
   the entry is admitted, halts on the budget path, appends a `HALT-REASON:` and strips the marker, so
   *"an invalid region is inert"* and *"the operator's clearance survives"* are both false, `H − A`
   ratchets to 2, and the sanctioned repair is then rejected by the new step 3 — permanently. My
   recommendation is that a corrupt-region refusal **refuses the phase without halting**, exactly as
   step G refuses an unresolved post-mortem. O-10 bullet 3 must be restated to match: as written it
   asserts *"the file is byte-unchanged apart from the report"*, which no conformant implementation can
   satisfy.
2. **F-02** — state the sanctioned repair for `counts-mismatch`. The existing instruction (*"delete or
   correct the offending line named in the report"*) is empty for that reason, because the report names
   no line and the repair requires adding or removing one — both forbidden by the same sentence. O-10's
   counts-mismatch bullet currently specifies a permanent, unrecoverable halt as the expected outcome.
3. **F-03** — give the verifier's dispatched round range the treatment this document gives every other
   boundary-crossing value: a fixed rendering, a catalogue id, and an AC-level statement of what a
   verifier does on an absent or unparseable range (O-9(c)'s *"reports the missing input"* is an FSPEC
   obligation with no report slot, no notice id and no loop-side response). AC-3.2's completeness check
   is an approval gate, so an unstated receive side here refuses approval for the wrong reason.

F-04 is Low and may be taken as mechanical, though I would rather §5's definitions and AC-2.7's rows
agreed than that a reader had to know which wins. MF-16 … MF-19, MR-07 and Q-11/Q-12 are non-blocking
and contribute nothing to the counts.

Nothing here contests user need, scope, priority or phasing — that remains settled and out of scope.
Nor do I contest any mechanism v1.5 introduces: the every-halt region rule, the counts check, the
append rule, the dispatched range and AC-2.7 row 3 are all correct, and two of them are better than the
wording I proposed. F-01 and F-02 are the same shape as my round-6 findings — a new branch stated
without re-tracing the path the system takes after it — and F-03 is the same shape as my round-5 F-06
and round-6 F-02: a new value crossing a component boundary without a receive side.

**Trajectory note (self-applied, per the preamble's fixed-point rule).** My own blocking counts (High +
Medium): round 1 — 7, round 2 — 4, round 3 — 5, round 4 — 4, round 5 — 6, round 6 — 2, round 7 — **3**.
Under AC-2.1 that is a **rise** (3 ≥ 2) on a comparable, same-shape (full-panel) consecutive pair, so
the rule this REQ specifies **would fire** on this round — and I say so plainly rather than shading a
finding down to avoid it, because a reviewer who tunes their counts to the mechanism they are reviewing
is the exact failure R-9 warns about. Two things temper what the number means, and both belong in the
run report rather than in the count: **3 of 3 round-6 findings are discharged, 0 carried**, for the
fourth consecutive round; and the growth into this round (+31,745 bytes) is `new-mechanism`, so the
document under review is materially a different one, which is why AC-2.4's same-shape requirement is
not the whole of comparability. The honest summary is the one the count alone cannot give: the
mechanisms are converged and the *edges* are not, and the edges are getting narrower each round —
round 5 found a free window, round 6 found a swallowed clearance, round 7 finds a swallowed clearance
one invocation later. That is convergence, but it is convergence at one hop per round, and the next
revision should re-trace the refusal path end to end rather than patch the sentence I quoted.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}

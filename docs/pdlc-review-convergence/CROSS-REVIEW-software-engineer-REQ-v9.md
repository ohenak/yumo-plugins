# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 9
**Scope:** REQ-pdlc-review-convergence v1.7, delta re-review against the v1.6 tree reviewed at iteration 8 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

- Baseline: `e99dede` (*"docs(pdlc-review-convergence): SE REQ v8 — verdict"*), the commit carrying my v8
  cross-review. `git diff e99dede HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+158 / −41** across 10 commits (`d574b35` … `8c198e6`), tree clean.
- The version row reads **1.7**, there is a *Revision note (v1.7)* with seven numbered changes plus an
  *Also* paragraph, and **§10.12** maps the round-8 findings, mechanical fixes, questions and the one
  measurement request to where they are answered.
- Scanned sections: the header *Cross-Reviews* row and version row; the *Revision note (v1.7)* and the
  two re-counted sentences in the v1.6 note; §5's *reset region* row, the rewritten **S-16** row, the
  **S-17** row's two pointers and the new **phase refusal** meanings row; AC-1.4's *phase refusal*
  paragraph; **AC-1.5(4)**'s *refusal is not a halt* bullets 3–4, the per-reason repair table, the new
  *prefer correcting* paragraph, and step 4's *one notice* and *unconditional* additions; **AC-3.2**'s
  *approval refusal* qualification and the new *What a garbled range costs is a sequence* paragraph;
  **AC-3.5**'s refusing-row paragraph; **AC-4.7 row B**'s `round` cell; §6's `reset-region-corrupt:` and
  `REVIEW-SCOPE-ROUNDS:` rows; §9's **R-5** and **R-9**; **O-10**'s counts-mismatch and garbled-range
  bullets; §10.11's re-counted lead-in; §10.12 in full. Unchanged sections I approved earlier are not
  re-litigated.
- Verification pass this round: v1.7 adds **no new `file:line` citation**, so there is nothing new to
  check against the codebase. The two shipped-behaviour claims the refusal argument rests on I verified
  last round at `9486c81` (`checkPostmortem` `:2440-2448` is pure; the step-G refusal `:3890-3901`
  records a phase row and throws); v1.7 now states that second half in the document itself rather than
  leaving it to the analogy, which is what G-23 asked for, and the statement matches what I read there.
  What I did check this round is **internal**: three of the four findings below are contradictions
  between two passages *both added by v1.7*, and I traced each to a concrete reachable branch state
  rather than reporting a wording mismatch.

## Round-8 disposition

**All five prior findings are closed**, each checked at the surface it names.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| G-21 — S-16's bracket content is called *the offending value* in §5's prose and *the offending line* in §6 | Low | **closed** | §5's S-16 row now reads *"the offending **line** — the whole line as it appears in the region, not the value alone"*, AC-1.5(4) step 4 reads *"the offending **line**"*, the specimen is unchanged, and §6's row no longer restates the parts — it says *"the specimen is §5's S-16 row and is not repeated here"*, which is MF-10's stronger option and removes the second home rather than synchronising it. |
| G-22 — a region that fails more than one check has no stated `{reason}` | Low | **closed exactly as recommended** | Both §5's S-16 row and AC-1.5(4) step 4 now carry *"**Exactly one S-16 notice is emitted per entry**, whatever the region's fault count: the reported `{reason}` is the **first** failing line in document order, and `counts-mismatch` only when every line passes step 2"*, and step 4 adds *"Two S-16 notices never co-occur in AC-4.7's `; `-joined cell, so precedence row 8's single slot is always enough"* — which closes the precedence-table half I raised as well as the render half. |
| G-23 — *"the only effect of the entry is the S-16 notice"* overstates a step-G-shaped refusal | Low | **closed at both surfaces** | AC-1.5(4) bullet 3 now scopes the claim (*"*Scoped to the post-mortem file*, the only effect … It is **not** a claim that the invocation is otherwise unaffected"*) and bullet 4 states the rest directly: *"*Returns* means **the phase does not run and the invocation terminates on step G's path**"*, with the ❌ phase row and the committed `halted` `QUEUE.md` row named, and the reason it is the right outcome (an unattended queue must stop rather than re-pick once per iteration). AC-1.4's paragraph carries the same scoping. The unsafe literal reading is now unavailable. |
| G-24 — the value-reason repair offers *delete or correct* as equals | Low | **closed in the table, and the arithmetic is stated — but the new `H − A = 0` licence opens a different hole (G-28)** | The table reads *"**correct that line** — preferred, always safe. Delete it only when `H − A = 0`"* on both value rows, the paragraph beneath states the `H = 2, A = 1` case I traced, and §5's *reset region* row carries the same preference. The finding as filed is closed. What the fix added is a *sanctioned deletion of an answering line*, which is a different edit from the one I was reasoning about, and it is not safe in the sense the document means — see G-28. |
| G-25 — *refusal* carries three senses and the new term of art is not in §5 | Low | **closed as recommended, and then some** | §5 gains a **phase refusal** row defined *against* approval refusal (*"the opposite shape: there the round has already run … and **the window proceeds**"*), and both existing uses are qualified in place — AC-3.5's refusing-row paragraph now says *"records the **approval refusal**"* and explicitly *"It is **not** the *phase refusal* of §5 and AC-1.5(4)"*, and AC-3.2 says *"an *approval refusal* in §5's sense, not a phase refusal"*. I asked for one or the other; the document did both. |

All five of my mechanical fixes are applied — **MF-6** (§10.11's lead-in and the v1.6 note now state
*seven filed, five rows, five of the seven in the refusal path*), **MF-7** (both v8 files added to the
*Cross-Reviews* row), **MF-8** (R-5 widened to AC-3.2's S-17 receive side, with the fabricated-*narrower*
range named as the unsafe direction), **MF-9** (R-9's series extended to rounds 6 and 7 with the
would-have-halted-at-round-7 conclusion stated), **MF-10** (§6 points at §5's specimen) — and my three
questions are answered in §10.12's row.

I also read TE v8's Medium (F-01, O-10's contradictory `counts-mismatch` universal) because its fix lands
in the same O-10 bullet I traced last round: the universal is now scoped to *"a later entry that has not
performed the sanctioned repair"*, the two legs are named a **mutation pair**, and the recovery leg is
sequenced with **two** clearances. I re-traced that leg at the branch level and it is right: the
whole-section deletion leaves `H = A = 0`, the gate's `A < H` conjunct is false, the entry halts and
strips the marker, and the operator's second `RESOLVED: yes` is what opens the window. That bullet is now
correct. The **adjacent** bullet — the one v1.7 rewrote to close TE F-03 — is not (G-26).

Four findings below. **Three are Medium**, which reverses the recommendation I made last round, and I
want to be plain about why: all four lie in text v1.7 added, and **two of the three Mediums are in the
fixes to my own round-8 findings and to TE's** — the same pattern this phase has produced at every
round where a fix introduced a state its author did not trace. None of them re-opens a closed finding;
each is a new neighbour of a new fix.

## Findings

Ids continue the `G-` series so they cannot be confused with the closed `F-01…F-12` or `G-01…G-25`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-26 | Medium | Local | **The newly sanctioned *delete the answering line at `H − A = 0`* branch is the one hand-edit that can bank an unpaid window — the edit §6's prohibition exists to prevent.** The grant gate is a conjunction: `checkPostmortem` reads `RESOLVED: yes`, **`A < H`**, and the region validates. `A` exists precisely to make a clearance one-shot: at `A = H` every halt has been answered, so a marker still on disk grants nothing. Deleting an answering line at `H − A = 0` moves the region to `A < H` with the marker untouched — the refusal explicitly *"leaves the `RESOLVED:` marker in place"* — so the **next entry grants a window** off a clearance that was already answered. Take the smallest case: `H = 1`, `A = 1`, the operator hand-garbles `WINDOW-START: 4` → `99` and (as operators do when a phase refuses) writes `RESOLVED: yes`. S-16 reports `invalid-window-start (H=1, A=1)`; `H − A = 0`, so the table licenses **delete**; after it, `H = 1`, `A = 0`, marker present, region valid ⇒ a fresh three-round window. Under **correct**, `A = H` and nothing is granted. The two sanctioned branches therefore differ by a whole window, and the document calls the deleting one *safe*. *Safe* is being used to mean *step 3 still passes* — which is true — while §6's row claims of the other sanctioned deletion that it *"can only cost windows, never grant them"*, an argument this branch does not satisfy. The fix is to remove the branch, not to qualify it: correcting is stated to be safe at every `H − A`, so deletion of an answering line is never *needed*, only ever risky. | AC-1.5(4)'s repair table and the *prefer correcting* paragraph; the grant gate in clause 4; §6's `WINDOW-START:` row; §5's *reset region* row |
| G-27 | Medium | Local | **O-10's *two consecutive garbled dispatches* obligation cannot be satisfied as written: the round it asserts the second dispatch on is a round AC-2.8 does not dispatch.** The bullet asks the second round to assert *"`disposition-missing` again **and** that the intervening authoring pass produced a byte-identical document, which is AC-2.8's zero-delta halt (S-11)"*. AC-2.8 is evaluated at round-open, *"**before** it dispatches round N's reviewers"*, and on a hit *"round N is **not** dispatched"* — so a round that carries the zero-delta halt carries **no** verifier dispatch and therefore no second `disposition-missing`. The two assertions are mutually exclusive on one round. AC-3.2's own prose gets this right — its sequence has *"The operator clears, the window resumes (AC-1.5(5)), the same garbled dispatch is emitted again"*, i.e. a halt **and a clearance** between the two dispatches — and O-10 compressed that clearance out, which is exactly the defect TE Q-14 forced out of the `counts-mismatch` recovery leg one bullet earlier in the same revision. This is the same class as the Medium the panel filed at round 8: an obligation no implementation satisfies, whose likelier reading (assert two dispatches on consecutive rounds) is unreachable. | **O-10**, the `REVIEW-SCOPE-ROUNDS:` bullet; AC-2.8's *Given* / *When* and its first receive-side row; AC-3.2's *What a garbled range costs* paragraph |
| G-28 | Medium | Local | **Step 4's justification for making the refusal unconditional is false on a reachable branch, and AC-4.7 row B — added in the same revision — says the opposite.** Step 4 now says *"On a mid-window branch the outcome is unchanged either way — `W` falls back to 1, which admits no rounds, and the entry would have halted on the budget path — so the widening costs nothing"*. `W = 1` admits rounds 1…3, so it admits no rounds only on a branch that already carries three. A branch carrying **two** is reachable and ordinary: AC-2.1 and AC-2.8 both halt at round 2, which creates the region (`H = 1`), and a hand-edit then corrupts it. On that branch `W = 1` admits **round 3**, the entry would **not** have halted on the budget path, and the unconditional refusal costs a round that would otherwise have run. Row B's `round` cell states this from the other side, in text added by the same revision: *"on a *mid-window* refusal this is also the round that would have opened"*. Both cannot be true. The decision is still defensible — fail-closed on a corrupt region is the right posture — but it must be justified as *fail-closed*, not as *free*, and the two readings are behaviourally distinguishable, so O-10 needs the fixture that kills the conditional implementation: a two-round branch with a corrupt region refuses, and does **not** open round 3. §10.12's question row repeats the false clause and would carry the correction too. | AC-1.5(4) step 4's *unconditional* paragraph; AC-4.7 row B's `round` cell; §10.12's *SE Q-19 … TE Q-14* row; **O-10** |
| G-29 | Low | Local | **"The cap is absolute, so the sequence is finite" contradicts M-1d and clause 3.** AC-3.2's new paragraph rests half its survivability argument on an absolute cap. §4's **M-1d** says the opposite in terms — *"`MAX_REVIEW_ROUNDS` is a per-invocation **budget** at HEAD, **not an absolute cap** on a document"* — and this REQ keeps that property deliberately: clause 3 grants a fresh window on every operator clearance, which is what makes the escape hatch *"operable rather than a dead end"*. So nothing caps the sequence; what bounds it is the other half of the same sentence — every iteration costs an operator interaction, and the operator sees the repeat. That half is sound and is the whole argument. Delete the clause, or restate the bound as *the operator, not the cap*. (The neighbouring claim that *"the diagnostic reaches the operator on **consecutive** rounds under the same name"* is loose for the reason in G-27 — the intervening round reports S-11 `no-revision:`, attributed to the author — so the name alternates rather than repeating; one clause covers both.) | AC-3.2's *What a garbled range costs* paragraph; §4 M-1d; AC-1.5(3) |

## Findings in detail

Each of the three Mediums is a two-state trace, so each gets its own.

### G-26 — the arithmetic of the delete branch, one level further out

Last round I traced the delete branch *forward* from `H − A = 1` and found it converts the reported
reason. The document accepted that and drew the licence at `H − A = 0`. That is where the same branch has
its other effect, and it runs the other way:

| Region before | Marker on disk? | Repair taken | Region after | Next entry |
|---|---|---|---|---|
| `H = 1`, `A = 1`, `WINDOW-START: 99` | yes (left in place by the refusal) | **correct** to a valid value | `H = 1`, `A = 1` | `A < H` **false** ⇒ no grant; `W` = the corrected value; the phase proceeds under the window already spent |
| same | yes | **delete** the line (licensed: `H − A = 0`) | `H = 1`, `A = 0` | marker present, `A < H` **true**, region validates ⇒ **a window is granted** and `WINDOW-START:` is written |

The two sanctioned repairs for one notice differ by an entire three-round window. The document's own
words for what must not happen are §6's: the `WINDOW-START:` prohibition *"forbids the one hand-edit that
could bank an unpaid window"*, and it excuses the `counts-mismatch` whole-section deletion on the ground
that that edit *"can only cost windows, never grant them"* — true of that edit, because it zeroes **both**
counts; false of this one, which lowers `A` and leaves `H`. So the licence added in v1.7 is precisely the
shape the scoping argument in v1.6 was written to exclude, and it was added one revision later, in the
row that argument sits above.

Two smaller points fall out of the same trace and I mention them because they bear on the fix, not as
separate findings. First, *safe* is doing two jobs: the paragraph proves *safe against step 3* (`H − A`
stays in `{0, 1}`) and states it as *safe* full stop. Second, the licence is unnecessary — the same
paragraph says *"Correcting the value is safe at every `H − A`"*, so there is no region on which the
operator **needs** to delete an answering line. A repair table that offers only *correct* for the two
value reasons loses nothing and closes this. If the delete branch is kept for some reason I have not
seen, it needs the conjunct the grant gate uses: delete only when `H − A = 0` **and** no `RESOLVED:`
marker is present — which is a condition the operator cannot reliably establish, since the refusal is
what left the marker there.

### G-27 — why the second dispatch cannot be on the halting round, and where the sequence actually stops

AC-2.8 fixes the order precisely, which is what makes this checkable: *When:* the loop's round-open read
happens *"**before** it dispatches round N's reviewers"*; *Then:* on a hit the loop halts and *"round N is
**not** dispatched and **not** counted against AC-1's budget"*. So for the fixture:

- round `k`: garbled `REVIEW-SCOPE-ROUNDS:` ⇒ verifier omits `## Disposition` ⇒ approval refused,
  `disposition-missing` reported. **Dispatch 1.**
- optimizer episode: no defect named, plausible response is a byte-identical document.
- round `k+1` opens: `bytes = DOC-BYTES(k)` and `sha256 = DOC-SHA256(k)` ⇒ **halt, S-11**, no dispatch.
  This round cannot assert `disposition-missing`, because no verifier ran on it.
- operator clears; AC-1.5(5) writes `WINDOW-RESUMED:`, `W` unchanged, round `k+1` re-opens.

O-10 asks for both the second `disposition-missing` **and** the byte-identical zero-delta halt as
properties of *the second round*. They are properties of two different rounds separated by an operator
interaction, which is exactly the sequencing TE Q-14 forced into the `counts-mismatch` bullet in this
same revision. Write it the same way: three rounds and one clearance, not two rounds.

There is a second-order point the fixture will hit as soon as someone writes it, and it is worth stating
in AC-3.2 rather than discovering in PROPERTIES. When round `k+1` re-opens after the clearance, the
document is *still* byte-identical to round `k`'s — nothing changed it, and by hypothesis there is nothing
for the author to change. AC-2.8's anchors are unchanged too, so the test fires **again**: halt, clear,
halt, clear. The loop never reaches *"the same garbled dispatch is emitted again"* unless some byte moves.
So the pathology's real shape is **absorbing at the zero-delta halt**, not a cycle of garbled dispatches —
worse than the paragraph describes, and it changes what the fixture must assert: the second dispatch is
reachable only from an authoring pass that *did* change bytes, so the fixture must make it do so
(a cosmetic revision is the realistic model of a real optimizer, and it is also the input that makes the
sequence progress).

### G-28 — the branch on which `W = 1` admits a round

`W = 1` makes the window `{1, 2, 3}`. It admits nothing only when the branch already carries three rounds
— the *canonical exhausted-branch fixture* row B is written over. The mid-window case is different, and it
is reachable without any exotic state:

1. rounds 1 and 2 run. Round 2 halts — AC-2.1's fixed point or AC-2.8's zero-delta, both of which can fire
   at round 2 (AC-2.8's own *Given* is `N ≥ 2 of the current window`). AC-1.4 clause 1 creates the region
   with one `HALT-REASON:` line: `H = 1`, `A = 0`.
2. the operator writes `RESOLVED: yes`, and in the same pass hand-edits the region — the only way a region
   becomes corrupt at all, per §5.
3. next entry: step 2 fails ⇒ `W = 1` ⇒ **step 4 refuses**.

Under the pre-v1.7 conditional reading the entry would have resolved `W = 1`, found the window `{1, 2, 3}`
with round 3 unfilled, and **run round 3** with the full panel. Under v1.7 it refuses. That is a real
behavioural widening, and it is the right one — a corrupt region means the accounting cannot be trusted,
and running a round on it would produce a cross-review the loop cannot place in a window. What is wrong is
only the sentence that says it costs nothing, and the cost matters twice: it is what makes the two
implementations distinguishable (so O-10 must kill the conditional mutant), and row B's `round` cell is
stated over exactly this case (*"on a mid-window refusal this is also the round that would have opened"*)
— so the document currently asserts both that such a round exists and that it does not.

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict

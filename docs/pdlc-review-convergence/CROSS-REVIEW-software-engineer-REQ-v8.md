# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 8
**Scope:** REQ-pdlc-review-convergence v1.6, delta re-review against the v1.5 tree reviewed at iteration 7 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

- Baseline: `4b9dd37` (*"docs(pdlc-review-convergence): SE REQ v7 — verdict"*), the commit carrying my v7
  cross-review. `git diff 4b9dd37 HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+239 / −48** across 11 commits (`232fedb` … `9bc94d1`), tree clean.
- The version row reads **1.6**, there is a *Revision note (v1.6)* with four numbered changes plus an
  *Also* paragraph, and **§10.11** maps the round-7 findings, mechanical fixes and questions to where
  they are answered.
- Scanned sections: the header *Cross-Reviews* row; the *Revision note (v1.6)* and the two corrected
  sentences in the v1.5 note; §5's *reset region* row, the *unavailable* / *malformed* row, the
  *clearance still unanswered* durability row, the catalogue lead-in (sixteen → seventeen, six kinds,
  the S-16/S-9 re-ordering) and the rewritten **S-16** plus the new **S-17** row; AC-1.4's new
  *"every halt is exactly that, and an entry refused by AC-1.5(4) is not one"* paragraph; **AC-1.5(1)**
  clause 1's new sentence; **AC-1.5(4)**'s *refusal is not a halt* block, the per-reason repair table and
  its *why deletion* paragraph, steps 3–4 and the invariant paragraph; **AC-1.5(5)**'s re-wrap;
  **AC-2.7** row 3's paragraph; **AC-3.2**'s *Then* and clause 1 plus the new
  *"the range is a boundary-crossing value"* block; **AC-4.7**'s *two rows* lead-in, **row A**, the new
  **row B** table and precedence row 8; §6's `WINDOW-START:`, `reset-region-corrupt:` and new
  `REVIEW-SCOPE-ROUNDS:` rows; **O-3**, **O-9(c)**, **O-10**'s v1.6 bullets; §10.10's corrected lead-in
  and two annotated rows; §10.11 in full. Unchanged sections I approved earlier are not re-litigated.
- Verification pass this round: v1.6 adds **no new `file:line` citation** — the only one appearing in an
  added line is O-9(d)'s pre-existing `pdlc/workflows/orchestrate-dev.js:1725-1730`, carried through an
  unrelated edit to the same cell. I did verify the two shipped-behaviour claims the new text leans on,
  because the whole *refusal is not a halt* argument rests on them: `checkPostmortem`
  (`pdlc/workflows/orchestrate-dev.js:2440-2448` at `9486c81`) is **pure** — it reads, maps and returns,
  writing nothing — and the step-G refusal at `:3890-3901` (`gate.status === "unresolved"` ⇒
  `recordPhase(…, "❌", …)` then `throw haltError(…)`) writes nothing to disk either. So the analogy
  AC-1.4's new paragraph draws (*"exactly as step G refuses an unresolved post-mortem without recording
  anything"*) is **exactly right at the baseline**, which is what makes the new rule implementable by
  pointing at an existing path rather than by describing a new one. G-23 is about the one thing that
  citation does *not* settle.

## Round-7 disposition

**All three prior findings are closed**, each checked at the surface it names rather than at the
revision note or §10.11 row that claims it.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| G-18 — the refusal path halts, and the halt strips the clearance the refusal declined to spend and increments the mismatch it reported | High | **closed at the mechanism, on the option I called the better one** | AC-1.5(4) step 4 now ends *"**The entry then refuses the phase and returns** — it takes no halt, writes nothing to the post-mortem and leaves the `RESOLVED:` marker in place"*, and a dedicated *refusal is not a halt* block states the four consequences (no halt, marker left in place, file byte-unchanged, phase refused not halted). The ratchet is gone at every one of the three places it showed: **AC-1.5(1)** clause 1 now says it *"is not reached on an entry whose reset region failed validation … so no halt is taken and no S-4 reason is emitted"*; **AC-1.4** states the boundary from the halt side (*"a **halt** is an event the accounting records; a **refusal** is a decision not to enter"*) **without** adding an exception to *"every halt, without exception"* — which is the right way round, since an exception there would return `H` to being an approximation; §5's durability row and the invariant paragraph both carry *"`H` and `A` are both unchanged by a refused entry"*. O-10's TE F-02 bullet is now satisfiable as written, and O-10 gains the **ratchet fixture** — the refusing entry *and the entry after it*, asserting the same S-16 reason twice — which is the test I could not have got from v1.5. |
| G-19 — the sanctioned repair is defined only for the two value reasons and is inoperable for `counts-mismatch` | Medium | **closed, by a route I had not considered and which is better than either I offered** | The repair is now a **three-row per-reason table**, and `counts-mismatch` is repaired by *"delete the **whole `## Reset Region` section**, heading included"*. That contradicts neither rule I named it against: S-12 already reads an absent heading as the empty region (`H = A = 0`, `W = 1`), so no `HALT-REASON:` line is deleted and no answering line is authored. §6's `WINDOW-START:` row is scoped to **authoring** — *"it forbids a human **authoring** an answering line, which is the edit that would bank an unpaid window; it does not forbid this deletion, which can only cost windows"* — which is the correct scoping test, stated over the failure *direction* rather than over the edit's shape. I traced the recovery leg at the branch level and it converges: empty region ⇒ `A = H = 0` ⇒ no clearance outstanding ⇒ the next entry halts on the budget path (`H = 1`), the operator clears, `A < H` and the region validates ⇒ one window granted. That is exactly the *"cost is one further halt"* the document states, and O-10's counts-mismatch bullet now carries the leg. |
| G-20 — AC-4.7 gains a second dispatchless row inside a precedence table | Medium | **closed exactly as recommended** | AC-4.7 now opens *"**Two rows have no dispatch behind them, and both are stated explicitly**"*, splits the text into **row A** (the AC-2.8 halt row) and **row B** (the no-round-admitted row), and gives row B its own six-cell table: `round` = one past the highest round on the branch, *"derived from the directory listing alone (§5, `deriveRoundWindow`), not from `W`, which is 1 on this path by construction"*; four empty cells licensed by the following paragraph on the same footing as row A's; `notice` = **S-16 alone**, with the S-4 question answered explicitly (*"no halt was taken on this entry, so AC-1.5(1)'s budget clause was never evaluated and emitted nothing"*). Precedence row 8 keeps only its sort justification. All four sub-points of the finding are addressed, and O-10 gains the row-B fixture asserted character for character. |

All five of my mechanical fixes are applied — **MF-1** (§10.10's lead-in and the v1.5 note both read
**eight**, with the derivation stated), **MF-2** (AC-1.5(5)'s lead-in re-wrapped), **MF-3** (the S-16 row
moved beside S-5/S-6 **and** S-9 moved beside S-8, so the kind-adjacency clause now describes the table;
the lead-in reads *six kinds* with `dispatch inputs` added), **MF-4** (*"the only hand-edit this document
asks for **to machine-written state**"*, with the marker named as human-owned), **MF-5** (O-10 bullet 3
re-checked after G-18 was decided and kept, now satisfiable) — and my three questions are answered in
§10.11's row, each with the answer I was fishing for.

I also read TE F-03, the round's other Medium, because S-17 lands in the same dispatch AC-3.2 describes:
the range is now a catalogue member with a fixed render (`REVIEW-SCOPE-ROUNDS: {W}..{N−1}`), a §6 row, a
total receive side over four named non-canonical inputs, and a loop-side response that reuses the
already-enumerated *missing `## Disposition`* case rather than inventing a notice. That is the right
shape — it adds no mechanism — and I have no finding against it beyond the R-5 bookkeeping in MF-8.

Every finding below is **new in v1.6**, all five lie in text this revision added, and **none is High or
Medium**. That is the first round in this phase where I can write that sentence.

## Findings

Ids continue the `G-` series so they cannot be confused with the closed `F-01…F-12` or `G-01…G-20`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-21 | Low | Local | **S-16's bracket content is named two different ways in the two places v1.6 rewrote to fix its render.** §5's S-16 row says *"the offending **value** follows the path in square brackets"* and then shows `… [WINDOW-START: 99]` — the whole line, not the value `99`. §6's row says *"a trailing ` [{line}]` carrying the offending **line**"*. So the prose says `[99]`, the specimen and §6 say `[WINDOW-START: 99]`. The specimen settles it in practice, but the row's own claim is *"the render is fixed **here and only here**, character for character"*, and the sentence beside the specimen contradicts it. One word: say *the offending line*. | §5 S-16; §6's `reset-region-corrupt:` row |
| G-22 | Low | Local | **S-16's `{reason}` is single-valued, and a region can fail more than one check.** Step 4 fires *"if **any** line's value fails step 2, **or** the counts fail step 3"*. A hand-edited region can carry an invalid `WINDOW-START:` **and** an invalid `WINDOW-RESUMED:`, or an invalid value **and** `H − A = 2`; the notice grammar admits one `{reason}` and one optional `[{line}]`, and precedence row 8 gives S-16 one slot. Nothing says which reason is reported, or whether two S-16 notices may co-occur in the `; `-joined cell. The **behaviour** is unambiguous (`W` = 1, nothing written, refuse), so this is a report-rendering gap, not a decision gap — but AC-4.7's bar is that a test author derives the exact cell, and for a two-fault region they cannot. One clause: report the **first** failing line in document order, and step 3's `counts-mismatch` only when every line passes step 2. | AC-1.5(4) step 4; §5 S-16; AC-4.7 precedence row 8 |
| G-23 | Low | Local | **What a refused entry does to the *invocation* is pinned only by analogy, and one sentence overstates it.** *"The only effect of the entry is the S-16 notice in the run report"* is not true of the path the document points at: step G's refusal, which AC-1.4's new paragraph names as the same shape, is `throw haltError(…)` after `recordPhase(phaseId, label, "❌", …)` (`pdlc/workflows/orchestrate-dev.js:3895-3901` at `9486c81`) — so the invocation also gets a ❌ phase row and, on the shipped orchestrate-dev halt path, a rewritten and **git-committed** `docs/_queue/QUEUE.md` row. None of that is wrong (an operator must repair the region, so leaving the queue row `halted` is the right outcome) and none of it touches the post-mortem, which is what *"byte-unchanged"* is scoped to. But an implementer reading *"refuses the phase and **returns**"* literally could return normally and let the pipeline advance past an unentered review phase — the one reading that is unsafe. The analogy carries the answer; state it directly: the phase does not run, the invocation terminates on the step-G path, and *"the only effect"* is scoped to the post-mortem file. | AC-1.5(4)'s *refusal is not a halt* block, third and fourth bullets; AC-1.4's new paragraph |
| G-24 | Low | Local | **The value-reason repair's *delete* branch can convert `invalid-window-start` into `counts-mismatch`, and the document does not warn the operator which branch to take.** The table offers *"delete **or** correct that line"* for both value reasons. Deleting an answering line decrements `A`, so on a region that already sits at `H − A = 1` — reachable, e.g. `H = 2`, `A = 1` with `WINDOW-START: 0` — the sanctioned delete lands on `H − A = 2` and the next entry refuses with a **different** reason, forcing the destructive whole-section repair. Correcting the value is always safe. The document half-anticipates this (*"any repair that leaves `H − A ∉ {0, 1}` is itself rejected by the counts check below, so a mis-repair fails closed"*), so no state is lost — but it also spends a round of operator attention, and the *reason changes underneath the operator*, which is the property v1.6 added the refusal to protect. One clause in the table: prefer **correct**; **delete** only when `H − A = 0`. | AC-1.5(4)'s per-reason repair table and the paragraph beneath it |
| G-25 | Low | Local | **"Refusal" now carries three senses, one of them a term of art introduced this round and not in §5's meanings table.** v1.6 makes it load-bearing: *"a **halt** is an event the accounting records; a **refusal** is a decision not to enter"*. But AC-3.5 already says, of an approval refusal, *"in every refusing row the loop does **not** halt: it records the refusal, the round remains owed an authoring pass, and **the window proceeds** under AC-1"* — the opposite of not entering — and AC-3.2's S-17 clause says a garbled range *"refuses approval without halting"*, a third sense. A reader who applies AC-1.4's new definition where AC-3.5 uses the word gets the wrong machine. Every other term this document leans on this hard (*crashed*, *zero-delta*, *unavailable*, *malformed*, *reset region*, *current window*) has a §5 row; this one does not. Add **phase refusal** to §5's meanings table, or qualify the two existing uses as *approval refusal*. | AC-1.4's new paragraph; AC-1.5(4) step 4; AC-3.5's refusing-row paragraph; AC-3.2's S-17 receive side; §5's meanings table |

## Findings in detail

None of the five needs a page; each is one clause, and I have written the clause into the finding row.
Two are worth a short trace because the reasoning is not obvious from the row.

### G-23 — what the analogy carries and what it does not

The document's argument is sound and I verified both halves of it at `9486c81`: `checkPostmortem`
(`:2440-2448`) reads and returns without writing, and the step-G refusal (`:3890-3901`) records a phase
row and throws. So *"a refusal is a decision not to enter, exactly as step G refuses an unresolved
post-mortem without recording anything"* is true **about the post-mortem file**, which is the only thing
the ratchet cared about. What it is not true about is the invocation: `throw haltError(…)` is how the
shipped code ends a phase, and orchestrate-dev's halt path then rewrites the feature's `QUEUE.md` row to
`halted` and commits that one file. So an entry refused by AC-1.5(4) does more than emit a notice —
it ends the run and marks the queue. That is the **right** behaviour (the region needs an operator, and
an unattended queue must stop rather than spin), which is why this is Low and not a design finding. The
defect is only that the document says *"the only effect of the entry is the S-16 notice in the run
report"* and a reader who takes the sentence at face value would implement a plain `return`, which lets
Phase F run on an unreviewed document. Two words fix it: scope *"only effect"* to the post-mortem, and
say the phase terminates on the step-G path.

### G-24 — the arithmetic of the delete branch

Take the smallest reachable case. A region with `HALT-REASON:` ×2 and one answering line reading
`WINDOW-START: 0`: `H = 2`, `A = 1`, `H − A = 1` — the counts pass step 3, and step 2 rejects the value,
so the reported reason is `invalid-window-start`. Both sanctioned repairs are offered as equals:

| Repair | Region after | Next entry |
|---|---|---|
| **correct** the line to a valid value | `H = 2`, `A = 1` | step 2 passes, step 3 passes ⇒ the window is granted |
| **delete** the line | `H = 2`, `A = 0` | `H − A = 2` ⇒ `counts-mismatch` ⇒ refused again, and now only the whole-section deletion repairs it |

The general rule is one line of arithmetic: deleting an answering line raises `H − A` by one, so it is
safe exactly when `H − A = 0` beforehand — which the operator can read off the notice, since S-16 now
carries `(H={h}, A={a})`. That is why the fix is a clause and not a mechanism: the notice already gives
the operator the number they need to choose the branch; the table just does not tell them to look.

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict

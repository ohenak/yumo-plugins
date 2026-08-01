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

## Findings in detail

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict

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

## Findings in detail

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict

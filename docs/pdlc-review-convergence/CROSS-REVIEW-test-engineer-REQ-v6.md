# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 6
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v5.md` (baseline `4f5be4f`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `fb9ac66`, clean.

## 1. Delta scan

```
git rev-parse 4f5be4f:docs/.../REQ-pdlc-review-convergence.md → c9343be…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → 97682c5…
git diff --stat 4f5be4f HEAD -- …/REQ-…md → 342 insertions(+), 131 deletions(-)
bytes: 178,410 → 209,953   (+31,543)
```

The revision is v1.3 → v1.4 and it answers round 5 from both panels. Changed sections, and the only
ones scanned below: the header (Cross-Reviews row, the *Citation baseline* row's new re-verification
paragraph, the v1.4 revision note), §5 (*current window*, the new **reset region** entry, *zero-delta*
restated over `N > W`; three durability rows rewritten and one added; the catalogue lead-in now
**fourteen**; the kind ordering; the `HALT-REASON:` paragraph; new **S-12, S-13, S-14**), AC-1.4
(rewritten — two clauses, the strip, the loop-maintained region), AC-1.5(4) (rewritten over `H`/`A`
plus the four-step ordered algorithm), AC-1.5(5) (rewritten — `WINDOW-RESUMED:`, the three-row table
with its new third column), AC-2.6's lead-in, AC-2.7 (new duplicated-`VERDICT:` row plus its
paragraph), AC-2.8 (row 4 restated over `N ≤ W`, the report-row paragraph, the S-11 clearance
paragraph, the digest citations), AC-3.1 (restated over windows, plus the new justifying paragraph),
AC-3.2 (*Given* and clause 1 scoped to the window, plus the new paragraph), AC-3.4 steps 1–5 and the
stopping-scan paragraph, AC-4.1 step 1 and the first-round-of-a-window paragraph, AC-4.5's *Given*,
AC-4.7's `growth-bytes` / `classification` cells and the AC-2.8 halt-row paragraph, §6 (four new
rows, `DOC-SHA256:`'s corrected citations), N-4, O-5, O-9(d), O-10 (bulleted, nine new obligations),
O-12, R-9, and new §10.9 plus §10.8's closing convention note. Sections that did not change — §1–§4,
AC-1.1–1.3, AC-2.1–2.5, AC-3.3, AC-3.5–3.7, AC-4.2–4.4, AC-4.6, AC-5, AC-6 — are not re-litigated,
except where a changed section is stated *over* one of them: AC-1.1's cap, AC-2.1's window scoping
and AC-2.2's `; `-joined `HALT-REASON:` sentence are read below only as the receivers of the new
`H`/`A` accounting and of §6's new rows.

Growth into this round is +31,543 bytes — `new-mechanism` under AC-4.2, and under AC-3.1 that would
escalate **this** round to the full panel, which is what it got.

## 2. Disposition of round-5 findings

Seven were open (3 High, 3 Medium, 1 Low). **All seven are resolved**, each checked against the
document — and, where the finding was about the codebase, against `9486c81` — rather than against
§10.9's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-1.5(5) now writes `WINDOW-RESUMED: {W}` (S-14) on the S-11 path, and AC-1.5(4) counts `H` (halts) against `A` (`WINDOW-START:` + `WINDOW-RESUMED:`). I re-traced the banking scenario end to end: S-11 halt ⇒ `H=1, A=0`; clearance ⇒ `WINDOW-RESUMED: 1` ⇒ `A=1=H`; the later S-4 halt ⇒ `H=2, A=1` **with the `RESOLVED:` line stripped by AC-1.4**, so re-entry is refused until the operator clears again. The free window is gone, in both the direct and the deferred form. The mechanism is also *better* than the paired-line fix I proposed: counting the loop's own halts rather than the human's marker sidesteps `parseResolvedMarker`'s single-value contract entirely, which my proposed `R`/`S`-plus-`WINDOW-RESUMED:` fix did not. |
| F-02 | High | **Resolved** | AC-1.4 clause 2 strips any prior `RESOLVED:` line on every halt that finds an existing post-mortem, so the marker cannot outlive the halt it cleared. I verified the three shipped readers the paragraph cites at the baseline: `parseResolvedMarker` (`:953`, `values.length > 1 ⇒ duplicated` at `:961`), `checkPostmortem` (`:2440`, `:2446-2447`) and the step-G refusal (`:3895-3901`, literal *"Phase … refused: unresolved POSTMORTEM at …"*). Both failure directions the finding named — fail-open on one preserved marker, permanent `duplicated` on two — are closed, and N-4 is amended rather than left claiming the marker is "untouched". |
| F-03 | High | **Resolved** | AC-3.1 is restated over windows: round `W` is the full panel, `N > W` is the verifier. AC-3.2's *Given* is now `N > W` and clause 1 is scoped to *"every prior blocking finding **of the current window**"*, which makes the `## Disposition` content derivable on every round a verifier actually opens on. AC-4.1 step 1 is gated on `N > W`; AC-4.5's *Given* follows; §5's *current window*, AC-2.6's lead-in and AC-4.7's two cells all agree. The reset-without-revision path now reads: AC-2.8 row 4 not evaluated, no growth measured, **full panel**, and the following round's zero-delta test compares against round `W`'s own `DOC-BYTES:` — so a still-unrevised document halts at `W+1`. That is option (a) of the fix I proposed, taken whole. |
| F-04 | Medium | **Resolved** | AC-1.5(4)'s table is replaced by a four-step ordered algorithm — collect, validate every line, any failure ⇒ `W = 1`, else the greatest. My round-5 counter-example (`WINDOW-START: 4` then `9`, highest round 6) now has exactly one answer, and it is an O-10 bullet. I also checked the new `WINDOW-RESUMED:` validity clause against the reachable regions: repeated `WINDOW-RESUMED: 1` from consecutive S-11 halts is valid (the rule is positional — *"equal to the greatest `WINDOW-START:` **before it**, or 1 if there is none"*), which is the case a naive "strictly increasing" rule would have bricked. |
| F-05 | Medium | **Resolved, and verified exhaustively rather than by sample.** | I extracted every `orchestrate-dev.js:{line}` citation in the document (42 distinct locators) and read each at `9486c81`. All resolve, including the five v1.3 got wrong: `sha256Hex` `:696`, `canonicaliseForDigest` `:615`, its JSDoc `:600-614` (the cited literal is at `:605`, inside the block), `approvalHashOf` `:797`, and the post-mortem prompt as `reviewLoop` (`:1623`) / `postmortemPrompt` (`:1725-1730`, literal `` `Write ${postmortemPath}.` ``). The fabricated `writePostmortem` is gone from AC-1.4, O-9(d) and §10.9. Spot-checks of the older §4 rows also hold (`:52` `MAX_REVIEW_ROUNDS = 5`, `:393` `parseVerdict`, `:569` `scanLines`, `:1436` `selectMode`, `:1915` `approvalAnchorPreCount`, `:1934` `appendApprovalAnchors`, `:2151` `deriveRoundWindow`, `:2215-2217` `windowEnd`, `:2358` `refreshReviewState`, `:2824` `recoverVerdict`), so the header's universal claim survives the check it now makes. |
| F-06 | Medium | **Resolved** | `HALT-REASON:` has one grammar, stated in one place with a §6 row: one line per halt, value = the `; `-joined render in AC-4.7's precedence order. AC-2.2's pre-existing *"the same `; `-joined string"* sentence now agrees with §5 and AC-1.5(5) instead of contradicting them, and AC-1.5(5)'s receive side reads the **leading** reason with the non-co-occurrence of S-11 given as the reason that is exact. `WINDOW-START:` and `WINDOW-RESUMED:` got §6 rows too, and `## Reset Region` — which answers Q-07 in the same edit. |
| F-07 | Low | **Resolved** | R-9's demonstration is restated over counts obtainable from the branch. I re-derived them from the files: rounds 1–2 carry no `{"high": …}` line in either panel's file, round 3 carries one only in the SE file (`3+2`), round 4 = `1+4` + `2+2` = **9**, round 5 = `1+4` + `3+3` = **11**. Every number in the row checks out, including both panels' self-reported trajectories, and the *unavailable* rounds are now named as such — which is R-7 measured on this document, exactly as the row says. |

Mechanical fixes MF-08 (*"since the last **granted** window"*), MF-09 (*"on any entry"*), MF-10
(AC-2.6's lead-in restated over the growth into the round in the row) and MF-11 (the §10.8 freeze
convention) are all applied. Q-07 is answered by §5's *reset region* and §6's `## Reset Region` row;
Q-08 is answered *"no, not deliberately"* and declined, with AC-4.1 stating the first-round-of-window
rule instead. MR-03 and MR-04 are carried; **MR-05 is closed** — AC-1.4 makes the loop re-apply the
region deterministically around the agent's write, so no AC depends on an agent preserving bytes any
more. That was the right call and it is the single most load-bearing decision in this revision.

## 3. Findings

Every finding below is **new** and lies in text this revision changed. All three ids are fresh; none
is a re-file of a round-2/3/4/5 finding. Two of the three are consequences of one structural move —
v1.4 re-based the one-shot accounting from the human's `RESOLVED:` marker onto lines **the loop
writes**, without stating everywhere that the loop always writes them.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **No AC requires the *first* halt of a phase to write a reset region, and under the new `H`/`A` accounting that makes the operator's escape hatch a no-op on the most common path.** See §3.1. | AC-1.4 clauses 1–2, AC-1.5(4), AC-1.5(5), §5 durability row *"Whether a clearance is still unanswered"*, §5 S-12, §6 `## Reset Region` row |
| F-02 | Medium | Local | **On a region that fails AC-1.5(4) step 2's validation, nothing says whether the clearance is consumed — and both readings are derivable, one of which is a permanent dead end with no stated repair path and no report slot.** See §3.2. | AC-1.5(4) steps 2–4 and clause 4's gate, AC-1.4 clause 1, §5 catalogue (S-5/S-6), AC-4.7 |
| F-03 | Low | Local | **AC-1.5(5)'s third row enumerates a case that clause 4's gate makes unreachable, so one of the three receive-side rows has no constructible fixture.** Clause 5's table is read *"on the entry that observes an unconsumed clearance (clause 4)"*, and clause 4's condition is `A < H`. `A < H` implies `H ≥ 1`, which implies at least one `HALT-REASON:` line is present — so *"absent"*, the first of the third row's three inputs, cannot co-occur with the precondition under which the row is read. The other two inputs (*unparseable*, *any other value*) are reachable and the row is still needed for them; only *absent* is dead. This matters because §5's S-12 row advertises the receive side as *"all four cases … absent; anything else"*, and O-10 will be read as asking for a fixture per case. Fix: either drop *absent* from row 3 and from S-12's enumeration, or state where it **is** reachable (I could not construct it: `H` is by definition the count of the lines whose absence the row describes). | AC-1.5(5) table row 3, AC-1.5(4) clause-4 gate, §5 S-12, O-10 |

### 3.1 F-01 in full — the accounting moved onto lines the halt path is not always required to write

v1.3 anchored one-shot on `R > S`, counting the operator's `RESOLVED:` lines against the loop's
`WINDOW-START:` lines. That formulation needed nothing from the halt path to make the **first** grant
work: on a fresh post-mortem `R = 1 > S = 0` held the moment the operator wrote the marker. v1.4
re-bases the same decision onto `A < H`, where **both** counts are lines the loop writes. The gate is
now:

> A clearance is **unconsumed** exactly when `checkPostmortem` reads a `RESOLVED: yes` **and**
> `A < H`. (AC-1.5(4) clause 4)

So the first grant now depends on `H ≥ 1` — i.e. on the halt that produced the post-mortem having
written a `HALT-REASON:` line into a `## Reset Region` section. Three statements bear on whether it
did, and they do not compose:

- **AC-1.4** is the AC that owns the write, and both of its clauses are scoped: *"Therefore, on
  **every halt that finds an existing post-mortem**: 1. the reset region is preserved … and the halt
  **appends its own `HALT-REASON:` line to the end of that region**; 2. any `RESOLVED:` line already
  in the file is stripped."* A halt that finds **no** existing post-mortem — the first halt of a
  phase, which is the case that creates the file — is outside both clauses. Nothing in AC-1.4 says it
  creates `## Reset Region` or writes anything into it.
- **AC-1.5(5)** says *"Each halt appends exactly one `HALT-REASON: {value}` line to the **end** of the
  reset region (S-12, AC-1.4)"* — unconditional, but *appends to the region*, which presupposes the
  region exists, and delegates to AC-1.4 for the write.
- **§6**'s `## Reset Region` row names the emitter as *"the halt path (AC-1.4)"* — delegating back to
  the AC whose clauses do not fire. The circle does not close anywhere.

The wrong reading is not exotic and its consequence is total. Take the ordinary first halt:

1. Phase R, rounds 1–3 run and fail. Entering round 4 ⇒ S-4 ⇒ the loop writes
   `POSTMORTEM-R-{feature}.md` for the first time. Under the reading AC-1.4 licenses, the file has no
   `## Reset Region`. §5's S-12 row is explicit about what that means: *"An absent `## Reset Region`
   heading is read as an empty region: `H = A = 0`, `W = 1`, no reset in effect."*
2. The operator addresses the findings and writes `RESOLVED: yes`. `checkPostmortem` returns
   `resolved`, so step G admits the phase.
3. AC-1.5(4) evaluates the gate: `A = 0`, `H = 0`, so `A < H` is **false**. No answering line is
   written and **no window is granted**. `W` stays 1.
4. AC-1.1 admits rounds 1…3 counted from `W = 1`; the branch's highest round is already 3; the phase
   is admitted **no rounds** and halts immediately on the budget path — appending, on this second
   halt, the `HALT-REASON:` line clause 1 now does require, and stripping the operator's marker.
5. The operator clears again. Now `H = 1`, `A = 0`, so the *second* clearance is honoured. The first
   one was silently swallowed.

Step 5 is why this is a defect and not merely a paperwork gap: the mechanism is not permanently
broken, it costs the operator exactly one wasted round-trip per document and produces a halt that
looks identical to a real budget halt. That is the worst shape for an operator-facing failure — it
self-heals on the second attempt, so it will be reported as flakiness rather than as a bug, and §5's
durability row will keep saying *"`A = H` ⇒ every halt so far has been answered"* while a halt has
plainly not been.

The testability half is why I file it High rather than Medium. The falsifying test is
*"first halt of a phase ⇒ the post-mortem carries `## Reset Region` with exactly one `HALT-REASON:`
line"*, and **the REQ does not currently entitle a PROPERTIES author to that expectation** — AC-1.4's
clauses do not apply to that halt, and the competing expectation (*"the first post-mortem has no
region; the region appears on the second halt"*) is equally derivable from the same text. Worse, the
natural O-10 test for the whole mechanism — *"halt, clear, assert a fresh window opens"* — is written
against a fixture that already has a region (because that is how one writes the fixture), so it
passes under **both** readings and never touches the first-halt path. This is an unfalsifiable-oracle
shape, not a wording quibble: the one property that distinguishes the readings is the one nobody will
write unless the REQ asks for it.

Fix, and it is one clause: state AC-1.4's obligations over **every halt**, not only over a halt that
finds an existing file — *"a halt that finds no existing post-mortem creates `## Reset Region`
containing its own `HALT-REASON:` line; a halt that finds one preserves the region, appends its
`HALT-REASON:` line to the end of it, and strips any `RESOLVED:` line"* — and add the first-halt case
to O-10 alongside the second-halt case already there. The `H`/`A` invariant then reads
*"exactly one `HALT-REASON:` per halt, exactly one answering line per honoured clearance"* with no
exception, which is what the accounting already assumes everywhere else.

### 3.2 F-02 in full — the fail-closed branch does not say whether it spends the clearance

AC-1.5(4)'s ordered algorithm is a genuine improvement and it is total and single-valued **on `W`**.
It is silent on the other half of the same entry. Its step 3 says:

> **if any line fails validation ⇒ `W` = 1, fail-closed**, no reset is honoured, and the run report
> names the file and the values found. A corrupt region is never partially believed.

But the decision to *write an answering line* is taken by clause 4's gate, which is stated over
`checkPostmortem`'s marker and the two raw counts — `A` = *"the number of `WINDOW-START:` **plus**
`WINDOW-RESUMED:` lines"* — and mentions validation nowhere. So on a region carrying, say,
`WINDOW-START: 9` when the branch's highest round is 6, plus one `HALT-REASON:`:

- **Reading A** — the counts are counts of *lines*, so `A = 1`, `H = 1`, `A < H` is false, nothing is
  written, and the clearance is *not* consumed. Benign, and the operator can retry after repairing
  the file.
- **Reading B** — *"no reset is honoured"* constrains only `W`, and the gate is evaluated on the raw
  counts regardless. Take the reachable region carrying two `HALT-REASON:` lines and one **invalid**
  `WINDOW-START:`: `H = 2`, `A = 1`, so `A < H` holds, clause 4 writes `WINDOW-START: {N}` and `A = H`
  again. The clearance is **spent** and `W` is still 1, because the invalid line is still in the
  region and step 3 fails it again on every subsequent read.

Reading B is a dead end with no exit. Nothing ever removes a line from the region — AC-1.4 clause 1
preserves *"every `WINDOW-START:`, `WINDOW-RESUMED:` and `HALT-REASON:` line already in
`## Reset Region`"* — so once one invalid line is present, `W = 1` is permanent, every subsequent
clearance is consumed and grants nothing, and the phase halts on entry forever. That is precisely the
*"dead end"* AC-1.5(3) says the escape hatch exists to prevent, and no AC gives the operator a
sanctioned repair: §5 calls the region *"machine-written and machine-maintained"*, and the one thing a
human is told to write into this file is the marker, not the region.

Reachability is not hypothetical. The human is *directed* to hand-edit this exact file, the agent that
writes the post-mortem body has no obligation to leave the region alone beyond O-9(d)'s
belt-and-braces prompt clause, and a crash between the read and the re-apply that O-5 specifies leaves
a partially-written region behind. A mechanism whose corrupt state is unrecoverable needs to say so
deliberately, or not be unrecoverable.

There is a third gap in the same sentence, and it is the one a test author hits first: step 3 requires
that *"the run report names the file and the values found"*, and the run report has **no slot for
it**. AC-4.7 fixes the row schema at six columns, one row per round, and declares the columns closed;
the `notice` column takes *"a possibly-empty, ordered list of S-3 … S-6 and S-11 notices"*, and §5's
catalogue — now explicitly *"fourteen"*, with *"FSPEC may not add a fifteenth without amending this
table"* — has no member for a corrupt reset region. So AC-1.5(4) mandates a report output that this
REQ's own closed catalogue forbids FSPEC to invent. A PROPERTIES author writing the fail-closed cases
(an O-10 bullet as of v1.4) can assert `W = 1` but cannot assert anything about what the operator is
shown, which is the half of the behaviour that decides whether the dead end is diagnosable.

Fix, all three in one edit to AC-1.5(4): (a) state whether a region that fails validation consumes the
clearance — I would say **it must not**: fail-closed on `W` should mean fail-closed on spending too,
so the gate becomes *"`RESOLVED: yes`, `A < H`, **and** the region validates"*; (b) say what an
operator does with a region that never validates again (a sanctioned repair, or an explicit statement
that the region is human-repairable when the report names it); and (c) give the corrupt-region notice
a catalogue id and an AC-4.7 home, as S-5/S-6 have.

## 4. Mechanical fixes

Reported per AC-6.5 as a fix list, not as blocking findings; excluded from the counts below. MF-08 …
MF-11 of v5 are all applied and are not carried.

| # | Location | Issue | Fix |
|---|---|---|---|
| MF-12 | AC-2.6, table | The lead-in is restated over *"the three rounds of a window (rounds `W`, `W+1`, `W+2`)"*, but the table's header still reads *"Reachable sequence (rounds 1, 2, 3)"* and every *When* cell still names *"the growth into round 2 … into round 3"*. The prose fixes the reading; the cells a test author copies do not. | Header → *"(rounds `W`, `W+1`, `W+2`)"*; cells → *"into round `W+1`"* / *"into round `W+2`"*. |
| MF-13 | AC-2.7, table | The new duplicated-`VERDICT:` row overlaps rows 3 and 4 on a reachable input: a `## Verdict` section carrying two `VERDICT:` lines followed by nothing (or by nothing but anchor lines) matches *unavailable* under rows 3–4 and *malformed* under the new row. AC-3.4's step ordering resolves it — step 1 counts before step 2 scans — and the paragraph *"AC-3.4 states the reader; this table classifies its outputs"* imports that ordering by reference, so this is not a finding. But the table also says the cases are *"exactly these … and in no others"*, which reads as independent rows. | Either put the duplicated row **first** and say the table is read in order, or scope rows 3–5 to *"a section with a single `VERDICT:` line"*. |
| MF-14 | AC-1.5, closing paragraph | The re-flow left one 105-column line (*"`HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` lines. Nothing here needs a clock, a process identity, or a memory of a previous"*), against ~100 everywhere else in the file. | Re-wrap. |
| MF-15 | §5, *reset region* | *"the operator's `RESOLVED:` marker is **not** in it and is never counted"* is stated as a fact about the file, but nothing prevents an operator from writing the marker inside the region — and AC-1.4 clause 2 anticipates exactly that, stripping any `RESOLVED:` line *"wherever it sits"*. The two are compatible (the marker is never *counted*, wherever it sits) but the sentence reads as a placement constraint the document does not impose. | *"the operator's `RESOLVED:` marker is never counted, wherever in the file it sits"*. |

## 5. Measurement Required

Filed under AC-5.2's convention. Non-blocking; excluded from the counts below. MR-01 and MR-02 remain
bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`. **MR-05 is
closed** — AC-1.4 no longer depends on an agent preserving a region, so the fact it asked for has no
consumer.

| # | Fact to measure | How | What it would settle |
|---|---|---|---|
| MR-03 | *(carried, unchanged)* Does an append to a cross-review file that a reviewer agent has just written reliably land, and is the appended byte visible to the next read in the same invocation? | Append a marker line to a cross-review file immediately after the reviewer dispatch returns, in one throwaway phase, and read it back. | Whether `appendRoundAnchors` (AC-4.1) can share `appendApprovalAnchors`'s append seam. |
| MR-04 | *(carried, unchanged)* Does the halt path's write of `POSTMORTEM-{phase}-{feature}.md` overwrite or append when the file already exists? | Read the existing writer at the Citation baseline and note which seam it uses. | Which of AC-1.4's preservation implementations is cheapest. The REQ correctly declines to wait on it. |
| MR-06 | **New.** Is the loop's post-dispatch re-apply of the reset region (O-5) observable to the *same* invocation — i.e. does a `_readFile` of the post-mortem immediately after the agent's write see the agent's bytes, so the read-modify-write has something to modify? | One throwaway phase: dispatch a write of a small file, then `_readFile` it in the same invocation and compare. | Whether O-5's read-modify-write can be a same-invocation seam at all, or must be deferred to the next entry (which would move `H`'s increment one invocation later and change F-01's arithmetic). Non-blocking: AC-1.4 states the obligation either way. |

## 6. Questions

Q-07 and Q-08 of v5 are both answered in v1.4 (§2 above) and are closed. Two new ones, both answerable
in a sentence and neither blocking.

| ID | Question |
|----|---------|
| Q-09 | Is `H − A ≤ 1` an invariant, and is it worth stating? Every reachable path I can construct keeps the difference at 0 or 1, because a halt strips the marker (AC-1.4 clause 2) and `checkPostmortem` then refuses re-entry until the operator clears again — so two halts cannot accumulate without a clearance between them. That matters, because clause 4 writes **exactly one** answering line per honoured clearance: if `H − A` could ever reach 2, one clearance would answer one halt, `A < H` would survive it, and the *next* halt would be auto-cleared — the v1.3 defect (my round-5 F-01) returning by a different route. Stating the invariant, or stating that a clearance answers **all** outstanding halts, would close the question for a PROPERTIES author who has to decide whether that fixture is worth writing. |
| Q-10 | What happens to the region when harvest deletes the round files? `harvest-learnings` deletes `CROSS-REVIEW-*` and `POSTMORTEM-*` together, so the ordinary path is fine. But AC-1.5(4) step 2 validates every `WINDOW-START:` against *"one past the highest round **on the branch**"* — a predicate over mutable branch state — so any sequence that removes cross-review files while the post-mortem survives turns a previously-valid region invalid and lands in F-02's territory. Is the validity predicate deliberately re-evaluated against the current listing on every read, rather than being a write-time check? If so, a sentence saying the region is only meaningful alongside the rounds it describes would save a future reader the trace. |

## 7. Positive Observations

## 8. Recommendation

## Verdict

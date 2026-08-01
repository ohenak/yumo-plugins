# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 8
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v7.md` (baseline `db9b544`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `af5359c`, clean.

## 1. Delta scan

```
git rev-parse db9b544:docs/.../REQ-pdlc-review-convergence.md → b0af913…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → f86d9a1…
git diff --stat db9b544 HEAD -- …/REQ-…md → 239 insertions(+), 48 deletions(-)
bytes: 241,698 → 268,264   (+26,566)
```

The revision is v1.5 → v1.6 and it answers round 7 from both panels, across nine document commits
(`232fedb` … `9bc94d1`). Changed sections, and the only ones scanned below: the header (Cross-Reviews
row, the v1.6 revision note, the v1.5 note's seven → eight correction), §5 (*reset region* and the two
durability rows, the catalogue lead-in now **seventeen**, the kind list now **six** kinds with the S-16
and S-9 rows moved, the S-16 render, the new **S-17** row, the amended *unavailable* / *malformed*
definition), AC-1.4 (the new *"every halt is exactly that, and an entry refused by AC-1.5(4) is not
one"* paragraph), AC-1.5(1) clause 1 (the not-reached note), AC-1.5(4) (the new *refusal is not a halt*
paragraph and its four bullets, the per-reason repair table, the *why counts-mismatch is repaired by
deletion* paragraph, step 3's hand-edit note, step 4's refusal sentence, the invariant paragraph's
refusal clause), AC-1.5(5) clause 5's re-wrap, AC-2.7's row-3 paragraph, AC-3.2 (*Given* and clause 1
restated over S-17, the new *the range is a boundary-crossing value* paragraph and its two bullets, the
loop-side-response paragraph), AC-4.7 (row A / row B split, row B's six-cell table and its justifying
paragraph, precedence row 8 trimmed), §6 (the `WINDOW-START:` row's scoped prohibition, the S-16 render
row, the new S-17 row), O-3, O-9(c), O-10 (six new or amended bullets), §10.10's lead-in and its TE F-02
row, and new §10.11. Sections that did not change — §1–§4, AC-1.1–1.3, AC-2.1–2.6, AC-2.8, AC-3.1,
AC-3.3–3.7, AC-4.1–4.6, AC-5, AC-6, §7–§9 — are not re-litigated, except where a changed section is
stated *over* one of them: AC-3.2's `## Disposition` receive-side table (`:1413-1424`, unchanged) is
read below as the receiver of the new S-17 refusal, because the new text explicitly delegates to it.

Growth into this round is +26,566 bytes — `new-mechanism` under AC-4.2 (S-17 is a new catalogue member
and AC-4.7 row B is a new report row), which under AC-3.1 escalates round 8 to the full panel, which is
what it got. That is five consecutive `new-mechanism` rounds; R-9 already carries the observation and I
do not re-file it, but the trajectory note in §8 says what the shape of it now is.

## 2. Disposition of round-7 findings

Four of mine were open (1 High, 2 Medium, 1 Low). **All four are resolved**, each checked against the
document rather than against §10.11's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | v1.6 took the reading I recommended and took it at the altitude the contradiction lived at. AC-1.5(4)'s new *refusal is not a halt* paragraph states the four consequences separately and each one is an assertion a test can make: no halt is taken and no budget is evaluated; the marker is **left in place**, so `checkPostmortem` still reads `resolved`; the file is **byte-unchanged**; the phase is *"refused, not halted — the same shape as step G's refusal"*. Step 4 carries the same sentence at the point of decision, so the algorithm and its prose cannot drift. Critically, the fix does **not** except anything from AC-1.4: the new AC-1.4 paragraph says so explicitly (*"this REQ deliberately adds no exception to them … What it does instead is stop one path from reaching a halt at all"*), which preserves `H` = the number of halts exactly and keeps the round-6 fix intact. AC-1.5(1) clause 1 gains the not-reached note, so the halt side and the refusal side agree. §5's durability row carries *"the entry refuses the phase and returns without taking a halt, so the marker survives and neither count moves"*, and the invariant paragraph adds *"the refusal path does not disturb it"*. O-10 gains the ratchet fixture I asked for — *"the entry that follows a refusal, and the refusal's own entry"*, with the mutation criterion stated (*"fails against any implementation that lets AC-1.5(1)'s budget halt run after step 4"*). That last clause is what makes it a test rather than a description. |
| F-02 | Medium | **Resolved** | The repair is now a per-reason table, and the `counts-mismatch` row says **delete the whole `## Reset Region` section**. The justifying paragraph does the work I could not do myself when I filed it: it shows that both line-level repairs are forbidden elsewhere (§6's *"never by a human"*, AC-1.4 clause 1's `H` guarantee), that section deletion contradicts nothing because S-12 already reads an absent heading as the empty region, and it states the price in full — *"one further halt … and the loss of the halt history"*. §6's `WINDOW-START:` row is scoped to **authoring** rather than left contradicting the sanctioned deletion, which is the right direction: the prohibition now names the harm it exists to prevent (banking an unpaid window) instead of a syntactic class of edit. §5's *reset region* row carries the per-reason split. One residue remains and it is in O-10, not in the AC — F-01 below. |
| F-03 | Medium | **Resolved** | Both halves. The emitted form is **S-17**, `REVIEW-SCOPE-ROUNDS: {W}..{N−1}`, with the separator justified against S-4's existing `rounds {first}..{last}` render and the wrong renderings named and excluded (*"an en dash, a hyphen or the set notation `{4 … 6}` is **not** this line"*), a §5 catalogue row, a §6 row, and the catalogue count moved to seventeen. The receive side is total over four enumerated inputs — absent, empty, unparseable, inverted — under one behaviour, and the behaviour lands in an **already-enumerated** loop-side case (`## Disposition` absent ⇒ approval refused, `disposition-missing` in the run report, not a halt) rather than inventing a notice. O-3 and O-9(c) are both restated over S-17 and both now say the rendering and the receive side are **not** open to FSPEC. O-10 gains a bullet asserting all four inputs. I checked the delegated case is real and not assumed: AC-3.2's `## Disposition` receive-side table (`:1417`) does state the absent case as a fail-closed refusal with a run-report signal, so the delegation resolves. |
| F-04 | Low | **Resolved** | §5's *malformed* now reads *"a quantity that was read and could not be parsed, **or that the structure carrying it says should be there and is not**"*, and *unavailable* is scoped to an absent **carrier** — which is the split I asked for, stated once and in the place the ACs are stated over. AC-2.7's row-3 paragraph points at the amended definition and adds that rows 1 and 2 are the *unavailable* cases by the same split, so the table and the definition now agree in both directions rather than only where the finding touched. |

Mechanical fixes MF-16 (re-wrap), MF-17 (the S-16 render fixed in §5 and §6), MF-18 (*"which only a
hand-edit produces"* added to step 3) and MF-19 (§10.10's seven → eight, and the v1.5 revision note
corrected in the same pass) are all applied — MF-17 with one residue, F-02 below. Q-11 and Q-12 are both
answered in §10.11 and both answers are the ones a PROPERTIES author needs: co-occurring S-14 and S-4
is a **pass**, and the creating halt places `## Reset Region` at **end of file**, asserted positionally
by O-10's first-halt fixture. MR-07 is carried and correctly recorded as non-blocking.

The shape of this round's answers is different from the last two, and it is worth recording because it
is the reason the count below is what it is. Round 7's answers did not add a conjunct to an existing
mechanism — they **removed a path**. The refusal no longer reaches the halt; it returns. That is a
smaller surface than the round-6 answers presented, and correspondingly fewer edges came with it. The
two findings below are both in the *carriage* of those answers (a test obligation and a render), not in
the mechanisms, which is the first round of this review in which that has been true.

## 3. Findings

Every finding below is **new** and lies in text this revision changed. All three ids are fresh; none is
a re-file. None is in an AC: the mechanisms v1.6 states are, as far as I can trace them, correct and
consistent. Both blocking-eligible findings are in the artifacts a downstream author reads *instead of*
the ACs — O-10's obligations and §5's fixed renders — which is exactly where a defect is most likely to
survive review and reach a test suite unchallenged.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **O-10's counts-mismatch bullet asserts two opposite outcomes in one obligation.** The v1.5 sentence *"**no** window granted on that entry **or any later one**"* is retained verbatim, and v1.6 appends *"the clearance after it grants a window, so the fixture asserts a **recoverable** refusal and not a permanent one"*. A PROPERTIES author cannot satisfy both: the first forbids any later grant, the second requires one. §10.11's own row says the bullet *"gains the recovery leg it previously specified away"* — but the specifying-away sentence is still there. This is the same defect class as my round-7 F-01 (an O-10 obligation unsatisfiable by a conformant implementation), relocated from the ACs into the obligation that survives them. See §3.1. | O-10, the v1.5 counts-mismatch bullet; AC-1.5(4)'s per-reason repair table; §10.11 row 2 |
| F-02 | Low | Local | **The S-16 render is fixed in three places and two of them disagree about what goes in the brackets.** §5's S-16 row: *"the offending **value** follows the path in square brackets"*, immediately followed by an example carrying the whole **line**, `… docs/f/POSTMORTEM-R-f.md [WINDOW-START: 99]`. §6's row: *"a trailing ` [{line}]` carrying the offending **line**"*. AC-1.5(4) step 4: *"the offending **value**"*. So a test author derives `[99]` from two of the four statements and `[WINDOW-START: 99]` from the other two, on a row whose own text says the render is fixed *"**here and only here**, character for character"* precisely so that cannot happen. The example and §6 agree, so the likely intent is the line; the prose is the outlier. Fix: one word in §5's S-16 row (*value* → *line*) and in step 4's summary. | §5 S-16, §6 `reset-region-corrupt:` row, AC-1.5(4) step 4, AC-4.7's character-for-character bar |
| F-03 | Low | Cross-Feature | **The claim that a garbled `REVIEW-SCOPE-ROUNDS:` line *"costs one round"* is not supported by any mechanism, and no obligation asserts the round after it.** S-17's emitter is the **loop**, so the four non-canonical inputs are loop-side defects, and a deterministic one (a wrong render, a line the dispatch never carries) recurs on every round of the phase. Each such round: verifier omits `## Disposition` ⇒ approval refused, `disposition-missing` reported ⇒ the optimizer is dispatched to address feedback that names no document defect ⇒ a plausible byte-identical revision ⇒ **AC-2.8 zero-delta halt (S-11)**, whose reported reason attributes to the author a failure that is the loop's. The operator clears, the window resumes (AC-1.5(5)), and the same dispatch is emitted again. The document is not wrong about the single round; it is silent about the sequence, and O-10's new bullet asserts only the single round — so all four assertions are **green** on an implementation that never converges. Non-blocking because the diagnostic does reach the operator (`disposition-missing` on consecutive rounds) and the absolute cap terminates it; but the *"costs one round"* sentence should either go or say what the second round costs, and O-10 should ask for two consecutive garbled dispatches. Tagged `Cross-Feature` because the shape — *an obligation that asserts the branch and never the path after it* — is now the third round running in which I have filed it. | AC-3.2's loop-side-response paragraph (`:1397-1402`), S-17, O-10's S-17 bullet, AC-2.8, AC-1.5(5) |

### 3.1 F-01 in full — one obligation, two contradictory assertions

O-10's counts-mismatch bullet now reads, in full (line breaks mine):

> • a region with two `HALT-REASON:` lines and **no** answering line ⇒ counts-mismatch ⇒ `W` = 1,
> **no** window granted on that entry or any later one, `RESOLVED: yes` **not** consumed, and
> `reset-region-corrupt: counts-mismatch (H=2, A=0) {path}` in the report row (AC-1.5(4) steps 3–4,
> S-16 — SE v6 G-14). The positive control is the same region with one answering line, which grants
> exactly one window. **The recovery leg is part of this obligation**: after the operator's sanctioned
> `counts-mismatch` repair — deleting the whole `## Reset Region` section — the next halt re-creates a
> one-line region and the clearance after it grants a window, so the fixture asserts a *recoverable*
> refusal and not a permanent one (SE v6 G-19, TE v6 F-02).

The first sentence and the last are contradictory over the same fixture. *"No window granted on that
entry **or any later one**"* is a universal over later entries; *"the clearance after it grants a
window"* names a later entry that grants one. Nothing in the bullet scopes the universal — it does not
say *"or any later one **absent a repair**"*, which is the reading that would make both true and which
is presumably what is meant now that AC-1.5(4) states a repair for this reason.

**Why this is not a wording quibble.** O-10 is the input to the PROPERTIES phase, and this bullet is one
of the two obligations in the whole document that pins a *non-recovery*. A PROPERTIES author has three
available moves and two of them are bad:

1. Write both assertions. The suite is red on one of them against every implementation, conformant or
   not. The author reports the REQ as internally contradictory and the phase stalls — the good outcome,
   and the least likely one, because the bullet reads as settled.
2. Take the first sentence as normative — it is the older text, it is the one carrying the AC citation
   (*"steps 3–4"*), and it is stated in the imperative shape the other bullets use. The author writes a
   fixture that refuses, then asserts **no** grant on a later entry, and to make that assertion pass
   must build a later entry that does **not** include the repair. That test is green against an
   implementation that has correctly implemented recovery **and** against one that has bricked the
   phase — it cannot distinguish them. That is an unfalsifiable oracle for the exact property round 7
   was spent establishing.
3. Take the last sentence as normative and drop the universal. Correct, and available only to an author
   who notices the contradiction and resolves it in the right direction with no textual authority for
   doing so.

Move 2 is the default, and move 2 is precisely the *permanent-halt* oracle that made this a finding in
round 7. The AC was fixed; the test obligation that encodes the old reading was not.

**The residue is one clause.** Delete *"or any later one"*, or scope it: *"no window granted on that
entry, and none on a later entry that has not performed the sanctioned repair"*. Then the recovery leg
is the positive control for the same fixture rather than its negation, and the pair is exactly the
mutation criterion this obligation wants — an implementation that refuses permanently fails the
recovery leg, and one that grants on a corrupt region fails the refusal leg. As written, no
implementation passes both, so neither leg can be trusted.

I checked whether the AC itself carries the same residue: it does not. AC-1.5(4)'s per-reason table,
the *why counts-mismatch is repaired by deletion* paragraph and §5's *reset region* row all state the
recoverable reading and none of them asserts permanence. §10.11's TE F-02 row states the intent
correctly too. The contradiction is confined to O-10, which is why this is Medium and not High — the
authority is unambiguous, the artifact a downstream author actually works from is not.

## 4. Mechanical fixes

Reported per AC-6.5 as a fix list, not as blocking findings; excluded from the counts below. MF-16 …
MF-19 of v7 are all applied and are not carried (MF-17 with the residue F-02 records).

| # | Location | Issue | Fix |
|---|---|---|---|
| MF-20 | §10.11, lead-in | *"all six findings below lie in text v1.5 added — five of them in the refusal path"*. The table carries **five** finding rows (SE G-18/TE F-01, SE G-19/TE F-02, SE G-20, TE F-03, TE F-04); the two panels **filed seven** (SE 1 High + 2 Medium, TE 1 High + 2 Medium + 1 Low, with two pairs merged). Six is neither. The *"five of them"* clause is consistent with the filed count of seven and not with the row count of five, so the two numbers in the same sentence are counted on different bases. This is the same slip §10.10's lead-in carried until this round (MF-19) — the second occurrence, which is why it is worth stating the rule rather than the number. | Pick one basis and say which: *"all **seven** findings the two panels filed, on **five** rows below"*, or *"all **five** findings below, of which **three** are in the refusal path"*. |
| MF-21 | AC-4.7, row B, `round` cell | *"one past the highest round on the branch — **the round that would have opened**"*. On the canonical fixture the gloss is false: the branch is exhausted, `W` = 1, and **no** round would have opened — that is the whole reason the entry has no round to report. The gloss is accurate only on a mid-window refusal, where the two coincide. The **definition** is total and correct and O-10's row-B bullet uses it, so nothing downstream is broken; but a test author deriving the cell on a differently-shaped fixture from the gloss rather than the definition gets no answer. | Drop the gloss, or scope it: *"— on a mid-window refusal this is also the round that would have opened; on an exhausted branch no round would have"*. |
| MF-22 | §5, S-17 row | Two pointers do not resolve. (a) *"AC-3.2's *When the range is absent or unreadable* clause"* — AC-3.2 has no clause with that title; the receive side is stated in an unnumbered bullet beginning *"the receive side is total…"*. In a document whose convention is that italics quote the target, a quoted title that does not exist sends the reader looking for a clause. (b) *"lands in AC-3.2(1)'s already-stated absent-`## Disposition` case"* — the absent case is stated in AC-3.2's **receive-side table** (`docs/…/REQ-…md:1417`), not in clause 1; clause 1 is what *fails*, the table is what *states the behaviour*. | (a) *"AC-3.2's receive-side bullet for the range"*; (b) *"AC-3.2's `## Disposition` receive-side table, first row"*. |
| MF-23 | AC-1.5(5), clause 5 | The re-wrap that applied SE MF-2/TE MF-16 left an orphan: `…of every halt reason that halt raised — so a round on which S-3 and S-4 both hold writes` / `**one** line reading` / `` `fixed-point: …; budget-exhausted: …` ``. The middle line is ~19 columns against 96–105 in its neighbours. | Re-flow the three lines. |

## 5. Measurement Required

Filed under AC-5.2's convention. Non-blocking; excluded from the counts below. MR-01 and MR-02 remain
bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`. MR-03, MR-04,
MR-06 and MR-07 are carried unchanged and are correctly recorded in §10.10/§10.11 as non-blocking; I do
not restate them. MR-07 is now the more interesting of them, because v1.6's refusal is stated as a
*return* and the shipped code's control flow at that point decides how large the FSPEC's change is.

| # | Fact to measure | How | What it would settle |
|---|---|---|---|
| MR-08 | **New.** Does a phase refusal — the step-G shape v1.6 states the AC-1.5(4) refusal *"is the same shape as"* — write `halted` to `docs/_queue/QUEUE.md` and commit it? A refusal takes no halt in this REQ's accounting, but the queue's row is written by `orchestrate-dev` on a **pipeline** halt, which is a different notion of halt with the same name. | Read the queue-row write site and the step-G refusal path at the Citation baseline, and note whether a refused phase reaches it. | Whether a corrupt-region refusal leaves the queue row `in-progress` (so `/loop` re-picks the feature and refuses again, once per iteration, forever) or `halted` (so it stops). It changes no AC — the REQ's `H`/`A` accounting is right either way — but it decides whether O-10 needs an obligation about the queue row, and it is the only place I can see where *refusal* and *halt* being different words for adjacent things could bite an operator. |

## 6. Questions

Q-11 and Q-12 of v7 are both answered in §10.11 (§2 above) and are closed. Two new ones, both answerable
in a sentence and neither blocking.

| ID | Question |
|----|---------|
| Q-13 | Does step 4's refusal fire on an entry that has rounds left in an already-granted window? Step 4 is unconditional — *"the entry then refuses the phase and returns"* — but every sentence justifying it is stated over the exhausted branch (`W` = 1, no rounds admitted, the ratchet). On a branch at round 4 of window `4..6` whose region a hand-edit has corrupted, v1.6 refuses the phase outright where v1.5 would have fallen back to `W` = 1 and then halted on the budget anyway, so I believe the outcome is the same and the widening is harmless. Confirming it is worth one clause, because a PROPERTIES author choosing a fixture for the refusal will otherwise reach for the exhausted branch only, and the mid-window case is the one where the two readings could have differed. |
| Q-14 | After a `counts-mismatch` repair, how many operator actions are there before a window opens? Tracing it: the operator deletes the section (`H = A = 0`), re-invokes; the gate's `A < H` conjunct is now **false**, so no window is granted, and on an exhausted branch the entry halts, appends one `HALT-REASON:` and **strips the marker the refusal preserved**; the operator must write `RESOLVED: yes` a second time; the entry after that grants the window. So the cost is one halt **and two clearances**, not one halt and the clearance already on disk. The document's *"the clearance after it grants a window"* is consistent with this — *after it* is the second clearance — but *"at the cost of one further halt to re-create it"* reads like the only cost. Is it worth naming the second clearance explicitly? O-10's recovery leg has to sequence it correctly to be green. |

## 7. Positive Observations

- **The refusal was fixed by removing a path, not by adding an exception.** I offered two readings and
  said either would do provided the document picked one. v1.6 picked the one that costs nothing: it
  left AC-1.4's *"every halt, without exception"* untouched and made the refusal not be a halt. The new
  AC-1.4 paragraph says why in one line — *"a **halt** is an event the accounting records; a
  **refusal** is a decision not to enter"* — and that distinction is now doing work in five places
  (AC-1.4, AC-1.5(1), AC-1.5(4) step 4, §5's durability row, AC-4.7 row B) without any of them
  restating the rule differently. An exception would have made `H` conditional; this keeps `H` a
  counted quantity, which is the property every one of my last three findings depended on.
- **The per-reason repair table answers the finding *and* the reason the finding existed.** I asked for
  a repair for `counts-mismatch`. The document gives one, and then does the thing I could not do from
  outside: it shows that the two obvious repairs are each forbidden by a *named* rule elsewhere, and
  that the deletion is forbidden by none — with S-12's empty-region case supplying the landing state.
  That is a proof, not a decision, and it is why §6's *"never by a human"* could be scoped safely
  rather than deleted. The scoping is the better half: the prohibition now names the harm (*"the edit
  that could bank an unpaid window"*) instead of a syntactic class, so a future repair can be checked
  against it rather than blocked by it.
- **S-17's non-canonical inputs were routed to an existing enumerated case rather than to a new
  notice.** The temptation on a finding like my F-03 is to add a catalogue member for the failure as
  well as for the value — an eighteenth string, a new precedence slot, a new report cell, all of which
  a test author then has to learn. v1.6 instead observed that *"no `## Disposition` section"* is
  already total and already has a run-report signal, and reused it. The catalogue grew by exactly one.
  I verified the delegation resolves rather than taking it on trust: `:1417` states the absent case as
  a fail-closed refusal that is explicitly *"not a halt"*, so the loop-side response the new paragraph
  claims is real.
- **O-10's new bullets keep carrying their own mutation criteria.** The ratchet fixture names the
  implementation that must fail it (*"any implementation that lets AC-1.5(1)'s budget halt run after
  step 4"*); the row-B bullet says *"asserted character for character, with **no** S-4 reason
  present"*, which is a positive **and** a negative conjunct on the same cell; the S-17 bullet
  enumerates all four inputs rather than saying "a bad range". Those are three different anti-false-green
  devices in three consecutive bullets. F-01 is a defect in this same set, and it is a defect of
  *retention* — an old assertion left standing beside a new one — not of specificity, which is a
  materially easier class to prevent than the ones the last three rounds found.
- **The one-word slips are now the interesting findings, which is itself the signal.** F-02 is a
  *value*/*line* mismatch inside a render the document declares fixed character for character; MF-20 is
  a count of findings in a paragraph about counting findings. Neither would have been visible three
  rounds ago because larger things were wrong. A review whose residue is orthography and one stale
  clause in a test obligation is a document that has converged on mechanism.

## 8. Recommendation

**Needs revision**

Mandatory per the approval rules: one Medium finding is open. **All four round-7 findings are
resolved**, for the fifth consecutive round with nothing carried; every open finding is new, and none
of them is in an acceptance criterion.

What must change before this document can be approved:

1. **F-01** — remove or scope O-10's *"or any later one"*. As written the counts-mismatch obligation
   asserts that no later entry ever grants a window **and** that the entry after the sanctioned repair
   does, so no implementation can satisfy both and the likelier reading of the two is the
   permanent-halt oracle round 7 was spent removing. One clause. The AC it is stated over is already
   correct and needs no change.

That is the whole of the blocking list. F-02 and F-03 are Low and may be taken as mechanical if the
author prefers: F-02 is one word in §5's S-16 row (and its echo in AC-1.5(4) step 4), and F-03 is one
sentence in AC-3.2 plus, ideally, one more O-10 assertion for a second consecutive garbled dispatch.
MF-20 … MF-23, MR-08 and Q-13/Q-14 are non-blocking and contribute nothing to the counts.

Nothing here contests user need, scope, priority or phasing — that remains settled and out of scope.
Nor do I contest any mechanism v1.6 introduces or amends: the refusal-is-not-a-halt boundary, the
per-reason repair, AC-4.7's row A / row B split, S-17 and its receive side, and §5's amended
*malformed* definition are all correct as far as I can trace them, and three of them are better than
the wording I proposed. This is the first round in which I have found no defect in an AC.

**Trajectory note (self-applied, per the preamble's fixed-point rule).** My own blocking counts (High +
Medium): round 1 — 7, round 2 — 4, round 3 — 5, round 4 — 4, round 5 — 6, round 6 — 2, round 7 — 3,
round 8 — **1**. Under AC-2.1 that is a **fall** (1 < 3) on a comparable, same-shape (full-panel)
consecutive pair, so the rule this REQ specifies does **not** fire this round; it fired on round 7 and I
said so then, which is the only reason saying it now means anything. The substantive change is not the
number but where the findings live: rounds 5, 6 and 7 each found a defect in a **mechanism** (a free
window, a swallowed clearance, a ratcheting refusal); round 8 finds none. The one blocking finding is a
sentence in a test obligation that the AC above it already contradicts. My read is that the ACs have
converged and the remaining risk has moved downstream — into O-10, which the PROPERTIES author will
read *instead of* the ACs, and where a stale assertion is invisible to anyone not diffing it against
the AC it cites. If there is a process signal in this round, it is that the O-10 bullets should be
re-read against their own ACs whenever an AC changes, not only when a finding names the bullet.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 2}

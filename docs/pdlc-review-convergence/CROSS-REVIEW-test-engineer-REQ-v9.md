# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 9
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v8.md` (baseline `af5359c`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `8c198e6`, clean.

## 1. Delta scan

```
git rev-parse af5359c:docs/.../REQ-pdlc-review-convergence.md → f86d9a1…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → e7b4dc6…
git diff --stat af5359c HEAD -- …/REQ-…md → 158 insertions(+), 41 deletions(-)
bytes: 268,264 → 288,942   (+20,678)
```

The revision is v1.6 → v1.7 and it answers round 8 from both panels, across ten document commits
(`d574b35` … `8c198e6`). Changed sections, and the only ones scanned below: the header (Cross-Reviews
row, the version cell, the new v1.7 revision note, the v1.6 note's counting bases), §5 (the *reset
region* row's repair preference, the new **phase refusal** meanings row, the S-16 row's *line* wording
and its one-notice rule, the S-17 row's two corrected pointers), AC-1.4's *refusal is not a halt*
paragraph (the phase-refusal naming and the ❌-row / queue-row scoping), AC-1.5(4) (the *only effect*
bullet's scoping, the *returns* bullet's termination semantics, the per-reason repair table's
correct-over-delete preference and its arithmetic paragraph, step 4's one-notice rule and its new
**unconditional** paragraph), AC-1.5(5) clause 5's re-flow, AC-3.2 (the approval-refusal naming and the
new *what a garbled range costs is a sequence* paragraph), AC-3.5's closing paragraph, AC-4.7 row B's
`round` cell, §6 (the S-16 and S-17 rows), §9 (R-5 widened, R-9 extended to rounds 6–7), O-10 (the
counts-mismatch bullet and the S-17 bullet), §10.11's lead-in, and new §10.12. Sections that did not
change — §1–§4, AC-1.1–1.3, AC-1.5(1)–(3), AC-2 in full, AC-3.1, AC-3.3–3.4, AC-3.6–3.7, AC-4.1–4.6,
AC-5, AC-6, §7, §10.1–§10.10 — are not re-litigated, except where a changed section is stated *over* one
of them: §6's `WINDOW-START:` row (`:2142`, unchanged) is read below as the receiver of AC-1.5(4)'s
widened repair set, because the widened text is stated against the exemption that row carries.

Growth into this round is +20,678 bytes. Two of the changes are `new-mechanism` under AC-4.2 rather
than clarification — step 4's refusal is newly **unconditional** (a rule widening, not a restatement),
and a phase refusal now has stated invocation-level consequences (❌ row, terminate, queue row
`halted`) that no prior version asserted. That is six consecutive `new-mechanism` rounds; R-9 carries
the observation and I do not re-file it.

## 2. Disposition of round-8 findings

Three of mine were open (0 High, 1 Medium, 2 Low). **All three are resolved**, each checked against the
document rather than against §10.12's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The universal is scoped exactly as asked: O-10's counts-mismatch bullet now reads *"**no** window granted on that entry, **and none on a later entry that has not performed the sanctioned repair**"*, with the scoping reason stated inline (*"because AC-1.5(4) now states a repair for this reason and the recovery leg below asserts that it works"*). The recovery leg is then restated as the refusal leg's **mutation pair** — *"an implementation that refuses permanently fails the recovery leg, and one that grants a window on a corrupt region fails the refusal leg, so neither leg is green on both"* — which is the falsifiability property the bullet lacked, not merely the removal of a contradiction. The revision went one step further than the finding required and sequenced the recovery leg with **two** clearances per my Q-14, naming the arithmetic (`H = A = 0` ⇒ the gate's `A < H` conjunct is false ⇒ the re-creating halt strips the marker again). A PROPERTIES author can now build both legs from the bullet alone. |
| F-02 | Low | **Resolved** | All four statements say *line*. §5's S-16 row: *"the offending **line** — the whole line as it appears in the region, not the value alone"*; AC-1.5(4) step 4: *"the offending **line**"*; the specimen is unchanged; and §6's row no longer restates the parts at all — it points at §5's specimen (*"the specimen is §5's S-16 row and is not repeated here, so the two homes cannot drift apart again"*), which removes the drift channel rather than re-synchronising it. That is the better of the two fixes available and it was not the one I proposed. |
| F-03 | Low, Cross-Feature | **Resolved.** Both halves | The *"costs one round"* claim is gone, replaced by AC-3.2's new **sequence** paragraph, which states the whole cycle (refusal ⇒ `disposition-missing` ⇒ an optimizer dispatch against feedback naming no document defect ⇒ a plausible byte-identical revision ⇒ AC-2.8's zero-delta halt attributed to the author ⇒ clearance ⇒ the same dispatch again) and names the two properties that make it survivable — the diagnostic repeats under one name, and the cap is absolute. O-10 asks for **two** consecutive garbled dispatches with the reason stated (*"an obligation that asserts only the single round is green against an implementation that never converges"*). The AC half is fully resolved. The O-10 half is resolved as to *count* and defective as to *sequencing* — F-03 below, a new finding in the new text, not a carry. |

Mechanical fixes MF-20 (§10.11's counting bases), MF-21 (AC-4.7 row B's gloss scoped to a mid-window
refusal, with the exhausted-branch case named as the one where the gloss is false), MF-22 (§5's two
S-17 pointers now resolve — I checked both: *"AC-3.2's receive-side bullet for the range"* is the bullet
that exists, and *"AC-3.2's `## Disposition` receive-side table, first row"* is `:1470`) and MF-23 (the
re-flow) are applied; MF-23 with one residue recorded as MF-27 below. Q-13 and Q-14 are both answered
in the document rather than only in §10.12 — Q-13 in step 4's new *unconditional* paragraph, Q-14 in
O-10's recovery leg. **Q-13's answer is where this round's first finding is**: the widening is stated
correctly and the reason given for it is false on a reachable branch.

**MR-08 is answered, and I verified the answer against the shipped code rather than accepting it.** The
document asserts that a phase refusal terminates on step G's path and that the shipped `orchestrate-dev`
halt path therefore rewrites the queue row to `halted` and commits it. At the working tree: step G's
gate throws `haltError` (`pdlc/workflows/orchestrate-dev.js:4178-4184`, `if (gate.status ===
"unresolved")`, literal `Refused — unresolved POSTMORTEM at`), and the halt catch calls
`recordHaltFn({ feature: featureName, status: "halted" })` (`:4838-4841`). So a refusal that terminates
the way step G does does reach the queue write, and the document's claim holds. Note that **not** every
`outcome: "halted"` return does — the entry-validation halts at `:4225-4293` call `buildFinalReport`
directly and never touch `recordHaltFn` — so the claim is true *because* the refusal is stated as
step-G-shaped, and it would be false of a literal early `return`. That is exactly the distinction
AC-1.5(4) now draws, so the AC is right; it is right without a citation, which is MF-25.

## 3. Findings

Every finding below is **new** and lies in text this revision changed. None is a re-file. Two are in
acceptance criteria — the first round in three where that is true, and it is a direct consequence of
this round's answers being *rule widenings* rather than clarifications. The third is in O-10, in the
bullet that answers my own round-8 F-03.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Step 4's justification for the unconditional refusal is false on a reachable branch, and the branch it is false on is the only one that can falsify the widening.** The new paragraph says the widening costs nothing because *"on a mid-window branch the outcome is unchanged either way — `W` falls back to 1, which admits no rounds, and the entry would have halted on the budget path"*. `W` = 1 admits rounds 1–3, so it admits no rounds only when the branch's highest round is ≥ 3. A corrupt region is reachable at highest round **2** (AC-2.1 can fire on the (1,2) pair and AC-2.8 can halt at round 2; both append a `HALT-REASON:` and create the region, after which a hand-edit corrupts it). On that branch the two readings differ completely: without step 4's refusal, `W` = 1 admits round 3 and the phase runs; with it, the phase is never entered and the invocation terminates with the queue row `halted`. So the widening does not cost nothing — and the fixture where it costs something is precisely the fixture that distinguishes an implementation of step 4's refusal from one that only falls back to `W` = 1. The AC's *rule* is correct and decidable; the paragraph tells a PROPERTIES author that the distinguishing fixture is not distinguishing. See §3.1. | AC-1.5(4) step 4, the *unconditional* paragraph (`:965-969`); AC-1.5(1); AC-2.1; AC-2.8; O-10's refusal bullets |
| F-02 | Medium | Local | **§6's `WINDOW-START:` row forbids the repair AC-1.5(4) now prefers, so O-10's value-repair fixture cannot be constructed.** v1.6 scoped §6's *"never authored by a human"* prohibition and exempted exactly one repair: *"it does not forbid AC-1.5(4)'s sanctioned `counts-mismatch` repair, which **deletes** the whole `## Reset Region` section and can only cost windows, never grant them"*. v1.7 then changed the *value*-reason repair from *"delete or correct that line"* to **correct that line — preferred, always safe**, and left §6's row untouched. Correcting a `WINDOW-START:` line is a human authoring a `WINDOW-START: {N}` value, which is the one thing that row says never happens; and unlike the exempted deletion it **can** grant a window, so it is not covered by the exemption's stated reason either. O-10 carries an obligation whose fixture is *"a later entry after the operator's sanctioned repair grants the window"* — under AC-1.5(4) and §5 the repair is a corrected line, under §6 that line cannot exist. A test author cannot build the region the obligation requires without violating the closed grammar §6 declares. | §6's `WINDOW-START:` row (`:2142`); AC-1.5(4)'s per-reason repair table and its *prefer correcting* paragraph; §5's *reset region* row; O-10's `WINDOW-START:`-fails-step-2 bullet |
| F-03 | Medium | Local | **O-10's new *two consecutive garbled dispatches* obligation asserts two properties of the same round that cannot both hold.** It requires that *"the second round asserts `disposition-missing` again **and** that the intervening authoring pass produced a byte-identical document, which is AC-2.8's zero-delta halt (S-11)"*. If the intervening pass produced a byte-identical document, AC-2.8 halts the round at its `t0` read — §5 is explicit that a zero-delta round *"is a halt, not a consumed round"* — so no verifier is dispatched and there is no second `disposition-missing`. The two assertions belong to two different rounds separated by a halt **and an operator clearance** (AC-1.5(5)), which the bullet does not mention at all. AC-3.2's prose states the sequence correctly, so the authority exists; the obligation compresses it into one round and is unsatisfiable as written. Same class as my round-8 F-01 — an O-10 bullet the AC above it contradicts — and it is in the bullet that answers my round-8 F-03, which is why I am filing it at the same severity rather than as a mechanical fix. | O-10's S-17 bullet; AC-3.2's *what a garbled range costs is a sequence* paragraph (`:1476-1487`); AC-2.8; §5 *zero-delta*; AC-1.5(5) |
| F-04 | Low | Process | **The §10.N lead-in count has been wrong in three consecutive revisions, each time fixed by naming the number rather than the rule.** §10.12 says the eight round-8 findings are *"carried on **six** rows below, because two pairs are the same finding filed independently (SE G-21/TE F-02, and SE G-23's invocation question shares its answer with TE MR-08)"*. The table has **seven** finding rows (TE F-01; SE G-21/TE F-02; G-22; G-23; G-24; G-25; TE F-03), and the second "pair" is not a merge — MR-08 is a measurement request with its own row, not a finding, so it removes nothing from the count. 8 findings − 1 genuine merge = 7. §10.10's lead-in carried this slip until v1.6 (MF-19), §10.11's until v1.7 (MF-20), and §10.12 carries it now. I filed it as a mechanical fix twice; the third occurrence in the third consecutive section of the same kind is a process signal, not a typo, which is why it is a finding this time and tagged `Process`. The durable rule is one sentence: state the filed count and the row count separately, and derive the row count as *filed minus merges*, listing the merges. | §10.12 lead-in; §10.11 lead-in; §10.10 lead-in |

### 3.1 F-01 in full — the fixture the paragraph rules out is the one that proves the rule

Step 4's widening is the right call and I am not contesting it. The defect is the sentence that
justifies it, because a PROPERTIES author reads that sentence as a statement about *which fixtures
matter*.

Take a phase whose highest round on the branch is **2**:

1. Round 1 and round 2 run. Round 2 halts — either AC-2.1's fixed point on the comparable (1, 2) pair,
   or AC-2.8's zero-delta. Either way AC-1.4 clause 1 appends one `HALT-REASON:` line and the
   `## Reset Region` now exists with `H` = 1, `A` = 0.
2. A hand-edit corrupts the region — say it adds `WINDOW-RESUMED: 7`, or mangles a later
   `WINDOW-START:` value. Step 2 of AC-1.5(4)'s algorithm now fails.
3. The next entry resolves `W`. Under **v1.6** it falls back to `W` = 1, and the current window is
   `{1, 2, 3}`; the branch's highest round is 2, so **round 3 is admitted and the phase runs**. Under
   **v1.7** step 4 fires unconditionally: the phase is refused, the invocation terminates on step G's
   path, and the queue row is written `halted`.

Those are not the same outcome. The paragraph's two clauses are both false here: `W` = 1 does admit a
round, and the entry would **not** have halted on the budget path. The claim is true only on the
canonical exhausted-branch fixture the rest of the section is written over — which is the fixture where
the refusal is *indistinguishable* from the fallback.

**Why this is a testability finding and not a wording quibble.** Step 4's refusal, on the exhausted
branch, is behaviourally observable only through S-16's notice and the ratchet (no `HALT-REASON:`
appended, marker not stripped). Those are asserted, and they are good assertions. But the *refusal
itself* — the decision not to enter — has no observable difference from the `W` = 1 fallback on that
branch, because `W` = 1 halts too. The one fixture where the refusal has a distinct, positive,
falsifiable consequence is the rounds-remaining branch: an implementation that skips step 4 runs round
3 and produces a cross-review file; an implementation that honours it produces a ❌ phase row and a
`halted` queue row and no round-3 file. That is a two-conjunct positive oracle over the exact behaviour
this revision introduced. The paragraph tells the author it is not worth writing.

There is also a second-order consequence the paragraph's framing hides. Step 4 runs on **every** entry
that resolves `W`, not only on an entry carrying a clearance. So on the branch above, a corrupt region
refuses the phase permanently and unconditionally with **no** operator clearance pending and rounds
still available — a state that did not exist before v1.7. That is defensible (the region needs an
operator either way) but it is a strictly larger blast radius than *"the widening costs nothing"*
describes, and nothing in O-10 asserts it.

**The fix is small and is a scoping, not a retraction.** Replace the equivalence claim with the case
split: on an **exhausted** branch the outcome is the same either way; on a branch with rounds remaining
under `W` = 1 the refusal is the difference between the phase running and the invocation terminating,
and that is intended, because a corrupt region is not a state a review round should be opened over.
Then add the rounds-remaining fixture to O-10 as the refusal's positive control. The rule needs no
change at all.

## 4. Mechanical fixes

Reported per AC-6.5 as a fix list, not as blocking findings; excluded from the counts below. MF-20 …
MF-22 of v8 are applied and are not carried. MF-23 is applied with one residue, MF-27.

| # | Location | Issue | Fix |
|---|---|---|---|
| MF-24 | §5, **phase refusal** row (`:584`) | The row states three consequences — no halt recorded, `H`/`A` untouched, no post-mortem byte written — and then *"the phase does not run and the invocation terminates on the same path step G takes"*. It omits the two consequences AC-1.4 and AC-1.5(4) added in the same revision: the ❌ phase row, and the queue row rewritten to `halted` and committed. §5 is the meanings table a reader is sent to by name (*"a phase refusal in §5's sense"*), so the definition should carry the whole shape rather than half of it. | Add the ❌ row and the `halted` queue row to the meanings row, or replace the enumeration with a pointer: *"the full consequence set is AC-1.5(4) step 4's"*. |
| MF-25 | AC-1.5(4), the *returns* bullet | *"on the shipped `orchestrate-dev` halt path the feature's `docs/_queue/QUEUE.md` row is rewritten to `halted` and committed"* is a claim about shipped behaviour with **no citation** — no `file:line`, no enclosing symbol, no distinctive literal — in a document whose Citation-baseline row asserts that *every* such reference carries all three. The claim is **true** (I verified it: step G throws `haltError` at `pdlc/workflows/orchestrate-dev.js:4178-4184`, and the halt catch calls `recordHaltFn({ …, status: "halted" })` at `:4838-4841`), but those are working-tree line numbers and the document owes the reader the pair read at the Citation baseline `9486c81`. Worth doing precisely because the claim is load-bearing: it is the whole reason the refusal is safe under an unattended queue. | Add the two citations at the baseline, in AC-6.4's C-1 form. |
| MF-26 | §10.11 lead-in vs §10.12 lead-in | §10.11 now states its two counts on their bases (*"filed seven … carried on five rows … five of the seven filed"*), which is the fix MF-20 asked for. §10.12, written in the same revision, does not follow the pattern it establishes. This is the finding F-04 records; it is listed here as well because the *fix* is mechanical even though the recurrence is not. | Restate §10.12's lead-in on §10.11's pattern: filed count, merge list, row count derived. |
| MF-27 | AC-1.5(5), clause 5 (`:1017`) | The MF-23 re-flow moved the orphan rather than removing it: line 1017 is 129 columns against 96–104 in every neighbour (`:1012-1018`). | Re-flow lines 1015–1018 as a block. |

## 5. Measurement Required

Filed under AC-5.2's convention. Non-blocking; excluded from the counts below. MR-01 and MR-02 remain
bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`. MR-03, MR-04,
MR-06 and MR-07 are carried unchanged and are correctly recorded as non-blocking; I do not restate
them. **MR-08 is closed** — §2 above records the answer and the verification.

I raise no new measurement request this round. The one candidate I considered — whether the shipped
window-origin resolution runs on entries that carry no clearance, which decides how large F-01's
second-order consequence is — is not a measurement: AC-1.5(4) states it normatively (`W` is resolved on
every entry), so the answer is in the REQ and the question is Q-15 below, not an MR.

## 6. Questions

Q-13 and Q-14 of v8 are both answered in the document and are closed. Two new ones, both answerable in
a sentence and neither blocking.

| ID | Question |
|----|---------|
| Q-15 | Is a phase whose region is corrupt refused on entries that carry **no** clearance at all? Step 4 sits inside `W`'s resolution, which AC-1.5(4) runs on every entry, so I read it as yes — a corrupt region refuses the phase whether or not a `RESOLVED:` marker is present, and the marker's presence only decides whether the *repair* can then be honoured. That is the reading F-01 is written against and I believe it is intended. Confirming it is worth one clause, because if the refusal were gated on a pending clearance the blast radius would be much smaller and F-01's fixture would change shape. |
| Q-16 | On a *correct*-the-line repair, what value may the operator write? The repair table says correcting is *"always safe"*, and step 2 validates only that the value is a decimal integer ≥ 1, is ≥ every value before it, and is ≤ the branch's highest round. Within those bounds the operator picks the origin, and the choice decides which rounds the resumed window admits. If any step-2-valid value is acceptable, say so — it makes the repair fixture trivially constructible. If the operator is expected to restore the value the loop originally wrote, then the repair needs a source for it (the value is not recoverable from the region once corrupted), and O-10's repair fixture needs to say which value it writes. |

## 7. Positive Observations

- **The counts-mismatch obligation came back as a mutation pair, not just as a de-contradicted
  sentence.** I asked for one clause to be deleted or scoped. v1.7 scoped it, and then said what the
  two legs are *for*: *"an implementation that refuses permanently fails the recovery leg, and one that
  grants a window on a corrupt region fails the refusal leg, so neither leg is green on both."* That is
  the mutation criterion written into the obligation itself, which is the only place it survives to the
  test suite. It then sequenced the recovery leg with two clearances off my Q-14 — an answer to a
  question I had marked non-blocking, folded into the obligation rather than into a §10 row where a
  PROPERTIES author would never see it.
- **The S-16 render drift was closed by removing a home, not by synchronising two.** §6's row now
  points at §5's specimen instead of restating it. My finding asked for one word to be changed in two
  places; the revision observed that two independent renderings of one literal will drift again and
  deleted one of them. That is the structurally correct fix and it is strictly better than what I
  proposed.
- **R-9's demonstration now includes the round on which it would have fired against this very
  document.** `blocking(6)` = 6 and `blocking(7)` = 6 — I re-derived both from the four trailers rather
  than trusting the arithmetic: SE v6 `0H+4M`, TE v6 `1H+1M`, SE v7 `1H+2M`, TE v7 `1H+2M`. Both
  operands are available and both rounds are full-panel, so AC-2.1 **would** have halted this phase at
  round 7 — one round before the round on which every blocking finding closed. A risk row that names
  the case where its own mechanism misfires, on the branch the reader is standing on, is worth more
  than the mitigation text beside it.
- **The queue-row answer to MR-08 was confirmation, not assertion — and it is the right answer.** The
  document could have said *"a refusal leaves the queue row alone"* and been internally consistent; it
  instead reasoned about the operator consequence (an unattended `/loop` would re-pick the feature and
  refuse once per iteration forever) and picked the outcome that terminates. Checking it against the
  shipped code, the claim holds because the refusal is stated as step-G-shaped rather than as a literal
  `return` — and the entry-validation halts nearby, which return directly, do **not** write the queue
  row. The distinction the AC draws is exactly the one the code makes.
- **Both mechanism widenings this round are correct; both of my Medium findings are in their
  justifications.** Step 4's unconditional refusal is right. Correct-over-delete is right, and its
  arithmetic (`delete` raises `H − A` by one, so it converts `invalid-window-start` into
  `counts-mismatch` at `H − A = 1`) is a genuinely sharp piece of reasoning that I did not see and did
  not ask for. F-01 and F-02 are both the *surroundings* failing to keep up with a good rule: a
  justifying sentence that over-claims, and a grammar row that was exempted for the old repair set.
  That is a materially different failure mode from the ones rounds 5–7 found, and it is the failure
  mode of a document that is changing rules rather than discovering them.

## 8. Recommendation

**Needs revision**

Mandatory per the approval rules: three Medium findings are open. **All three round-8 findings are
resolved**, for the sixth consecutive round with nothing carried; every open finding is new.

What must change before this document can be approved:

1. **F-01** — replace step 4's *"the outcome is unchanged either way"* with the case split. On an
   exhausted branch it is unchanged; on a branch with rounds remaining under `W` = 1 the refusal is the
   difference between the phase running and the invocation terminating, and that branch is reachable at
   highest round 2. Then add that fixture to O-10 as the refusal's positive control, because it is the
   only one on which the refusal has an observable consequence the `W` = 1 fallback does not.
2. **F-02** — widen §6's `WINDOW-START:` exemption to the repair set AC-1.5(4) now states. As written
   the row forbids the corrected line the preferred repair produces, so O-10's value-repair fixture is
   unconstructible under the closed grammar. One clause in one row; no AC changes.
3. **F-03** — split O-10's *two consecutive garbled dispatches* bullet into the rounds it actually
   spans. A byte-identical intervening revision halts the next round at AC-2.8 before any verifier is
   dispatched, so *"asserts `disposition-missing` again"* and *"the intervening pass produced a
   byte-identical document"* cannot both be true of one round. AC-3.2's paragraph already states the
   full sequence including the clearance; the obligation should mirror it.

That is the whole of the blocking list. F-04 is Low and may be taken as mechanical if the author
prefers, though the rule matters more than the number. MF-24 … MF-27 and Q-15/Q-16 are non-blocking and
contribute nothing to the counts; MR-08 is closed.

Nothing here contests user need, scope, priority or phasing — that remains settled and out of scope.
Nor do I contest either mechanism v1.7 widens: step 4's unconditional refusal and the
correct-over-delete preference are both right, and the arithmetic given for the second is better than
anything either panel asked for.

**Trajectory note (self-applied, per the preamble's fixed-point rule).** My own blocking counts (High +
Medium): round 1 — 7, round 2 — 4, round 3 — 5, round 4 — 4, round 5 — 6, round 6 — 2, round 7 — 3,
round 8 — 1, round 9 — **3**. Under AC-2.1 that is a **rise** (3 ≥ 1) on a comparable, same-shape
consecutive pair, so on my counts alone the rule **would** fire this round. I record that rather than
soften it, and I record what I think it means, because a rise after the round I called converged is
exactly the case R-9 exists for. Rounds 5–7 found defects in mechanisms; round 8 found a stale test
obligation; round 9 finds two rule *widenings* whose surroundings did not move with them, plus one new
obligation defect. That is not the same document regressing — it is a document that answered a round by
changing rules rather than by clarifying them, which re-opened the neighbourhood of each rule it
touched. The mechanisms themselves are still, as of round 8, the part I have no findings in. If there
is a process signal here it is the sibling of last round's: when an answer **widens a rule**, the fixed
statements *around* that rule — the closed grammar in §6, the justifying prose, the O-10 obligations —
all need re-reading against the new rule, not only the section the finding named. F-02 is a §6 row that
was correct for the repair set that existed when it was written, and nothing pointed at it when the
repair set grew.

## Verdict

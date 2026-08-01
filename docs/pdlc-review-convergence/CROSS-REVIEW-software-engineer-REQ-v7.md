# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 7
**Scope:** REQ-pdlc-review-convergence v1.5, delta re-review against the v1.4 tree reviewed at iteration 6 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

- Baseline: `f80df18` (*"docs(pdlc-review-convergence): SE REQ v6 — verdict"*), the commit carrying my
  v6 cross-review. `git diff f80df18 HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+304 / −84** across 13 commits (`3b0010c` … `db9b544`), tree clean, HEAD `db9b544`.
- The version row reads **1.5**, there is a *Revision note (v1.5)* with five numbered changes, and
  **§10.10** maps the round-6 findings, mechanical fixes, questions and measurement requests to where
  they are answered.
- Scanned sections: the header *Cross-Reviews* row, §5's *reset region* definition, the two rewritten
  durability rows (*First round of the current window*, *Whether a clearance is still unanswered*), the
  *Which halt a POSTMORTEM records* row, the catalogue lead-in and its count (fourteen → sixteen), the
  `HALT-REASON:` paragraph, the rewritten **S-12** row and the new **S-15** / **S-16** rows, the amended
  **S-13** / **S-14** rows, **AC-1.4 clauses 1–2 rewritten** plus the new *"Why the first halt is stated"*
  paragraph, **AC-1.5(4)** (the gate's third conjunct, the append paragraph, the *does not spend the
  clearance* paragraph, the *sanctioned repair* paragraph, steps 1–5, the invariant paragraph, the
  range-check paragraph), **AC-1.5(5)**'s three-row table and its *"three rows and not four"* paragraph,
  **AC-2.6**'s table restated over `W`, **AC-2.7**'s seven-row ordered table and its row-3 note,
  **AC-3.2**'s *Given* and clause 1 plus the *"the window is given, not derived"* paragraph, **AC-3.4
  step 1**, **AC-4.7**'s `notice` column and its new precedence row 8 plus the S-16 paragraph, §6's four
  amended/added rows, O-3, O-5, O-9(c), O-10's v1.5 bullets, §10.9's heading, §10.10. Unchanged sections
  I approved earlier are not re-litigated.
- Verification pass this round: v1.5 adds ten citation sites and claims all resolve at the frozen
  baseline `9486c81`. I read them there rather than accepting the claim. All hold:
  `extractFileVerdict` (`:888`), its `scanLines` heading scan and `no_verdict_section` return, the
  trailer counter at `:902` (`line.trim().startsWith("VERDICT: ")` — with the space), the `> 1` return at
  `:904`, the fall-through `return { ok: true, ...parseVerdict(section, roleSlug) }` at `:906`;
  `parseVerdict`'s reverse scan `:415-422` (`:417` is the same space-bearing predicate), its
  `verdictLine === null` fallback `:424-428` returning the `malformed: true` object at `:394-400`, and
  the genuine truncated-output return `{verdict: rawVerdict, high: 0, medium: 0, low: 0}` at `:451` with
  no `malformed` flag. `parseResolvedMarker` `:953-958` and `scanLines` `:569` are as cited. **AC-2.7 row
  3's claim *"this is what HEAD returns"* is exactly right**, and the v1.4 mismatch G-15 named is gone.

## Round-6 disposition

**All five prior findings are closed**, each checked at the surface it names rather than at the revision
note or §10.10 row that claims it.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| G-14 — the counting rule validates every line's *value* and never the relation `H − A ≤ 1`, and the unvalidated case fails **open** | Medium | **closed as recommended, and then some** | AC-1.5(4) gains **step 3** — `H − A` must be 0 or 1, both directions named (`A > H`, `A < H − 1`) — and step 4 folds it into the same fail-closed treatment as a corrupt value: `W` = 1, no grant, reported. The invariant is stated as clause 4's domain, with the reachability argument attached. The fail-open path I traced (`H − A − 1` unpaid windows) is gone. v1.5 went further than I asked and made validation a **conjunct of the grant gate** (TE F-02), which is the right call — see G-18 for what that additional step does not yet account for. |
| G-13 — the write position of the two answering lines is unstated while step 2's validation is order-sensitive | Medium | **closed exactly as recommended** | Clause 4 now says the loop *"**appends** exactly one answering line to the **end** of the reset region"*, with a dedicated paragraph giving the reason (step 2 reads *"before it"*; a prepended `WINDOW-RESUMED: 4` inverts it and locks `W = 1` absorbingly). S-13 and S-14 carry *"appended to the end"* in their *Exact string* cells, §5's durability row carries *"Every such line is appended at the end … so document order is event order"*, and O-10 asserts it **positionally**, with a prepending implementation required to fail. |
| G-16 — AC-3.2 scopes the verifier's required rows to `W`, and nothing gives the verifier `W` | Medium | **closed as recommended, at the better of the two options** | AC-3.2's *Given* now includes *"a dispatch that names the window"* — the inclusive round range `{W … N−1}`, *"as an explicit input, not as something the verifier derives"* — and clause 1 is restated over *"the round range it was given"*. The reasoning paragraph puts the obligation on the party that can discharge it and keeps `W`'s single reader in the loop. O-3 carries the dispatch input, O-9(c) carries it into the SKILL **plus** the refusal to guess when the range is absent, and O-10 asserts the row set is derived from the range and not from branch history. |
| G-15 — a `## Verdict` section with **zero** trailer lines is classified by no AC-2.7 row, and AC-3.4 disagreed with HEAD | Medium | **closed as recommended, matching HEAD** | AC-2.7 gains **row 3** ⇒ *malformed*, with the full `9486c81` trace, and the table is now numbered and declared **read in order** so rows 5–7 are reached only for a section carrying exactly one trailer line. AC-3.4 step 1 is corrected from *unavailable* to *malformed* and cites the same fall-through. The distinction from the genuine `0/0/0` truncated-output return at `:451` is drawn in both places. I re-verified the whole chain at the baseline (see *Delta baseline*); the document and the shipped reader now agree on this input. |
| G-17 — the strip reaches inside fenced blocks | Low | **closed** | AC-1.4 clause 2 now strips *"every **unfenced** one"*, citing `parseResolvedMarker` (`:953-958`) and `scanLines` (`:569`), and states the one-scoping-rule reason. O-10 asserts a fenced marker surviving while an unfenced one is removed. §5's *reset region* row is amended in the same direction (TE MF-15). |

All five mechanical fixes are applied: **MF-1** (AC-2.6's table restated over `W`, `W+1`, `W+2` in the
header *and* every cell, with the `W = 1` reading stated), **MF-2** (the trailing space written into both
normative clauses and into AC-2.7's lead-in, with `VERDICT:Approved` named as not-a-line), **MF-3** (the
creating halt is governed — see below), **MF-4** (`HALT-REASON:` gets its own id **S-15**), **MF-5**
(§10.9's heading names its non-finding rows).

I also checked TE F-01, the round's one High, because it changes the same clause my findings sit in:
AC-1.4 clause 1 is now stated over **every** halt, create-or-preserve, unified under O-5's
read-modify-write with *"the captured region of a file that does not exist is the empty region"*, and
O-5 itself carries that sentence. `H` is now defensibly *"exactly the number of halts this document has
taken"* — on every path **except** the one G-18 names, which is new in v1.5.

Every finding below is **new in v1.5**. All three lie in text this revision added, and all three lie in
the mechanism it added to close G-14 and TE F-02: the refusal path. None re-litigates a section I
approved.

## Findings

Ids continue the `G-` series so they cannot be confused with the closed `F-01…F-12` or `G-01…G-17`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-18 | High | Local | **The refusal path halts, and the halt destroys the clearance the refusal was written to preserve and increments the very mismatch it reported.** AC-1.5(4) now says an invalid region *"is inert: nothing is written, nothing is granted … and the operator's clearance survives for a later entry"*. It does not survive. A refusal leaves `W` = 1; AC-1.5(1) then admits **no rounds** on a branch whose highest round is ≥ 3 and *"halts immediately on the budget path (AC-1.4)"*; and AC-1.4 governs *"**every** halt, without exception"* — so clause 1 appends this halt's `HALT-REASON:` (`H += 1`) and clause 2 **strips the operator's `RESOLVED:` line** in the same breath. Three consequences, all in text v1.5 added: (a) the clearance is spent by the immediately following halt, so *"survives for a later entry"* is false in exactly the situation where a clearance matters (a clearance is only needed on an exhausted branch, which is the branch that halts); (b) `H − A` **grows by one per refusal**, so a step-2 value corruption converts itself into a `counts-mismatch` after one entry and the reported reason changes underneath the operator; (c) the invariant paragraph's claim that `H − A ≤ 1` *"holds on every path the document generates"* is falsified by the document's own refusal path. It also makes an O-10 obligation unsatisfiable: the TE F-02 bullet requires the test to assert *"the file is byte-unchanged apart from the report"*, and a correct implementation must rewrite that very file (new `HALT-REASON:`, stripped marker) on the same entry. Following the document's stated repair (*"deletes or corrects the offending line named in the report — and nothing else"*) therefore **never converges**: each repair-and-clear cycle is met by one more halt, `H − A` is one larger than the operator just fixed, and the phase refuses again. That is the dead end AC-1.5(3)'s escape hatch exists to prevent, reintroduced by the conjunct added to prevent it. | AC-1.5(4), *"A region that fails validation does not spend the clearance"*, the *sanctioned repair* paragraph and the invariant paragraph; AC-1.5(1); AC-1.4 clauses 1–2; O-10's v1.5 TE F-02 bullet |
| G-19 | Medium | Local | **The sanctioned repair is defined only for the two value reasons and is inoperable for `counts-mismatch` — the reason S-16 exists for.** The repair is *"the operator deletes or corrects **the offending line** named in the report — and nothing else"*. For `invalid-window-start` / `invalid-window-resumed` there is such a line. For `counts-mismatch` there is not: S-16's own row says the notice carries *"per reason, the offending value **or the pair `H`/`A`**"* — a pair, not a line. Restoring `H − A ∈ {0, 1}` from `A < H − 1` requires either **adding** an answering line by hand, which §6's `WINDOW-START:` row forbids in terms (*"Written by the loop, never by a human"*) and which *"and nothing else"* excludes, or **deleting** a `HALT-REASON:` line, which falsifies the invariant AC-1.4 clause 1 was rewritten this round to establish (*"`H` is exactly the number of halts this document has taken, on every path"*) and which §5's *Which halt a POSTMORTEM records* row depends on for *"the last"* to mean *"the most recent"*. So the one reason that cannot be repaired by correcting a value is the one the repair clause does not cover, and both available repairs contradict a stated rule. The clause also asks the operator to leave *"`H` equal to the number of halts the document has taken and `A` equal to the number of clearances already answered" — two quantities whose only record on the branch is the lines being repaired. | AC-1.5(4), *sanctioned repair* paragraph; S-16 (§5) and its §6 row; §6's `WINDOW-START:` row; AC-1.4 clause 1 |
| G-20 | Medium | Local | **AC-4.7 gains a second dispatchless row inside a precedence table, contradicting the schema paragraph beside it and leaving the cell underivable.** Precedence row 8 says S-16 is emitted *"on a row carrying `round` = the round that would have opened and every other column empty"* — a row for a round that never opened. But (i) the paragraph two lines above still reads *"**The AC-2.8 halt row is the one row with no dispatch behind it**"*, which this row falsifies; (ii) the column schema admits `empty` for `growth-bytes` and `classification` only — `panel-shape` is *"the on-disk role-slug set … or `crashed`"* and `blocking` is *"`blocking(N)`, or `unavailable`, or `malformed`"*, and the AC-2.8 row's empty cells needed an explicit paragraph to license exactly this, which the new row does not get; (iii) that entry **also halts on the budget path** and AC-1.5(1) says it emits the S-4 halt reason, so the `notice` cell is either `S-4; S-16` or S-16 alone and the document says both — precedence row 8 says *"every other column empty"* while AC-1.5(1) says the S-4 reason is emitted. AC-4.7's declared bar is that *"a test author must be able to derive the exact cell, character for character, from this document alone"*; for the row v1.5 just added, they cannot. Stating a **row** inside a **notice-ordering** table is also the wrong home: the AC-2.8 row got its own paragraph for the same reason. | AC-4.7 column schema, the *"one row with no dispatch"* paragraph, precedence row 8; AC-1.5(1) |

## Findings in detail

### G-18 (High) — the refusal is followed by a halt, and the halt undoes the refusal's guarantees

I traced this the same way I traced G-14, because the conjunct v1.5 added is right and I want to be
precise about where it stops being right. The three clauses in tension are all v1.5's:

> **A region that fails validation does not spend the clearance.** … an invalid region is inert: nothing
> is written, nothing is granted, the run report names the file and the values found (S-16), and the
> operator's clearance survives for a later entry.

> 1. … a branch whose highest existing round is 3 or more is admitted **no rounds** and halts
>    immediately on the budget path (AC-1.4), emitting the S-4 halt reason …

> Therefore, on **every** halt, without exception: 1. the reset region exists after the halt, and it
> carries this halt's line … 2. any `RESOLVED:` line already in the file is stripped …

The entry sequence, on a branch with rounds 1–3 and a region that fails step 2 or step 3:

| Step | State |
|---|---|
| operator writes `RESOLVED: yes`, re-invokes | `checkPostmortem` ⇒ `resolved`; step G admits the phase |
| AC-1.5(4) runs | region invalid ⇒ `W` = 1, no answering line, clearance *"not consumed"*, S-16 reported |
| AC-1.5(1) runs with `W` = 1 on a branch whose highest round is 3 | **no rounds admitted ⇒ immediate budget halt** |
| AC-1.4 clause 1 | appends this halt's `HALT-REASON:` ⇒ `H += 1` |
| AC-1.4 clause 2 | **strips the operator's `RESOLVED:` line** |

So on the next entry the marker is gone (the operator must clear again) and `H − A` is one **larger**
than it was when S-16 named it. Three separate statements v1.5 makes are falsified by its own path:

1. *"the operator's clearance survives for a later entry"* — it does not. It survives only when the
   branch is **not** exhausted, which is the case where no clearance was needed.
2. *"It holds on every path the document generates"*, of `H − A ≤ 1` — the refusal path generates
   `H − A = 2`, then 3, then 4. The paragraph's own argument (*"a clearance is answered before the next
   halt can be taken"*) presumes the clearance is always answered; the refusal is precisely the case
   where it is not, and the halt still follows.
3. The reported **reason** is unstable: a region refused for `invalid-window-start` is refused for
   `counts-mismatch` on the next entry, because the halt moved `H`. An operator who fixes what the first
   report named is told something different the second time, for a defect they did not introduce.

And it makes a required PROPERTIES obligation unsatisfiable. O-10's v1.5 TE F-02 bullet reads: *"a region
whose `WINDOW-START:` fails step 2 with `A < H` ⇒ **nothing written**, the clearance survives … the
assertion is *the file is byte-unchanged apart from the report*"*. A conforming implementation **must**
change that file on that entry — one appended `HALT-REASON:`, one stripped marker — so the test as
specified fails against a correct implementation. That is the shape of defect this REQ exists to catch
in other documents.

Why it does not self-heal: following the stated repair literally, each cycle is *(operator repairs the
line the report named; operator writes `RESOLVED: yes`; entry refuses on the counts, which the previous
halt moved; entry halts; `H` increments; marker stripped)*. `H − A` is never smaller at the end of a
cycle than at the start. Only a repair the document does not sanction — deleting `HALT-REASON:` lines,
or hand-writing an answering line — breaks the loop, and G-19 is about the fact that neither is allowed.

**Required change**, and it is small — one clause, in whichever of the two places the author prefers:

- **Either** exempt the refusal from the halt's file mutations: state that an entry refused by
  AC-1.5(4) step 4 halts **without** writing a `HALT-REASON:` line and **without** stripping the marker
  (it is not a halt of the loop's own budget; it is a refusal to enter), which makes *"the clearance
  survives"* true as written and keeps `H` = *"the number of halts this document has taken"* — the
  refusal took none;
- **or** keep the halt and delete the three claims it falsifies: say that the refusal costs the
  clearance, that `H − A` grows on refusal, and that the sanctioned repair must therefore restore the
  counts rather than only the line — and rewrite the O-10 bullet accordingly.

The first is the better mechanism (it keeps the invariant true and the report stable) and, notably, it
is the same shape as v1.5's own answer to TE F-03: a gate that refuses is not an event the accounting
records.

### G-19 (Medium) — the repair clause does not cover the reason it was written for

`counts-mismatch` is the third member of S-16's enum and the only one whose evidence is not a line —
S-16's row says so itself (*"the offending value **or the pair `H`/`A`**"*). The repair clause is stated
only over lines:

> the operator deletes or corrects the offending line named in the report — and nothing else — leaving
> `H` equal to the number of halts the document has taken and `A` equal to the number of clearances
> already answered.

For `A < H − 1` there is no offending line to delete or correct. The two edits that would restore the
relation are each forbidden elsewhere in this document:

- **adding** a `WINDOW-START:` / `WINDOW-RESUMED:` line — §6's row says *"Written by the loop, never by
  a human; it carries no authority of its own"*, and *"and nothing else"* excludes it explicitly;
- **deleting** a `HALT-REASON:` line — this falsifies *"`H` is exactly the number of halts this document
  has taken, on every path"* (AC-1.4 clause 1, restated in §5's durability row and §10.10's TE F-01 row),
  and §5's *Which halt a POSTMORTEM records* row reads *the last* such line to decide S-11 versus
  S-3/S-4, so deleting one can change the clearance semantics of the next entry.

The trailing instruction compounds it: the operator is to leave `H` and `A` at their true values, but the
document gives them no independent record of either — the lines under repair *are* the record.

**Required change:** state the repair per reason. For the two value reasons, the current sentence is
right. For `counts-mismatch`, say which line class the operator may delete or add, and amend the rule it
contradicts (either §6's *"never by a human"*, scoped to normal operation, or the `H` invariant, scoped
to un-repaired regions). One sentence and one scoping word; the alternative — making the counts
unrepairable — leaves the dead end AC-1.5(3) forbids.

### G-20 (Medium) — the no-round-admitted report row

Precedence row 8 does three things at once, and only the first belongs in a precedence table: it fixes
S-16's sort position (fine), it states *when* the notice is emitted (*"on the **first** row the entry
produces"*), and it introduces **a new report row** for an entry that opens no round. The third collides
with the schema it sits under:

- *"The AC-2.8 halt row is the one row with no dispatch behind it"* is still the text above the table.
  It is now false; and it was written precisely because AC-4.7's bar is character-for-character
  derivability, so the reader is entitled to trust it.
- `panel-shape` is *"the on-disk role-slug set at that round (§5), or `crashed`"* and `blocking` is
  *"`blocking(N)`, or `unavailable`, or `malformed`"*. Neither admits *empty*. The AC-2.8 halt row needed
  a whole paragraph to license its four empty cells against exactly these column definitions; the new row
  asserts *"every other column empty"* in a table cell and licenses nothing.
- The `notice` cell is doubly specified. The entry that admits no round **halts on the budget path** and
  AC-1.5(1) says it emits the S-4 halt reason; precedence row 8 says every column other than `round` is
  empty. So the cell is `budget-exhausted: rounds 1..3 of 3; reset-region-corrupt: counts-mismatch`
  under one clause and `reset-region-corrupt: counts-mismatch` under the other. Given precedence 8 sorts
  S-16 **after** S-4, the first reading looks intended — but the document says both.
- `round` = *"the round that would have opened"* is the one round index the branch does not and will not
  carry a file for, and §5 defines round indices by the basenames present. The row is derivable only if
  the schema says how that index is computed (`W + 3`? one past the highest round?).

**Required change:** move the row out of the precedence table into its own paragraph beside the AC-2.8
one, restate the *"one row with no dispatch"* sentence as *"two rows"* (or generalise it), name the four
empty cells explicitly as that paragraph does, say whether the S-4 notice co-occurs, and define the
`round` value. Precedence row 8 then keeps only the sort justification.

## Questions

Q-13, Q-14 and Q-15 from v6 are **closed** by v1.5 (step 3's counts check; the append rule; AC-3.2's
dispatched range) and are not restated. Three new, each the fastest route into the finding beside it.

| ID | Question |
|----|---------|
| Q-16 | On an exhausted branch with a corrupt reset region and a fresh `RESOLVED: yes`: after AC-1.5(4) step 4 refuses, does the entry halt? If it does, what in the document stops AC-1.4 clause 2 from stripping the marker the refusal just declined to spend? (G-18) |
| Q-17 | The report says `reset-region-corrupt: counts-mismatch`. Which line does the operator delete or correct, given that §6 forbids a human writing an answering line and AC-1.4 clause 1 defines `H` as the number of halts taken? (G-19) |
| Q-18 | For an entry that admits no round, what exactly are the six cells of its report row — including whether `notice` carries the S-4 halt reason alongside S-16, and how `round` is computed for a round that has no file? (G-20) |

## Positive Observations

- **Every one of my five round-6 findings is closed at the mechanism, and two are closed better than I
  asked.** G-14's counts check is stated in both directions, folded into the same fail-closed step as a
  bad value, and given a reachability argument; G-16's window is *dispatched* rather than derived, with
  the SKILL told not to guess when the input is absent — a refusal I did not think to ask for and which
  is the difference between a missing input and a silently wrong row set. The pattern across three
  rounds now is that the author closes the mechanism rather than the sentence.
- **Validation became a conjunct of the grant gate, not just a constraint on `W`.** This was TE's finding
  and it is the sharper of the two readings: fail-closed on `W` without fail-closed on *spending* leaves
  a state where every future clearance is consumed and nothing is granted. The paragraph that argues it
  (*"Nothing ever removes a line from the region, so that state is permanent"*) is the right kind of
  argument to have in a REQ. G-18 is not a disagreement with that decision — it is the observation that
  the halt which follows the refusal was not carried through the same analysis.
- **The trailer reader now agrees with the shipped code on every enumerated input, and I verified it.**
  Row 3's `malformed` classification, the `:906` fall-through, the `:424-428` fallback and its
  distinction from `:451`'s genuine `0/0/0` all hold at `9486c81`, and the trailing space in
  `VERDICT: ` is written into both normative clauses and named as excluding `VERDICT:Approved`. Making
  the table **ordered** — so rows 5–7 are reached only for a section with exactly one trailer line — is
  what converts six independent rows into a single-valued function, which is DC-01's actual requirement
  and not merely tidiness.
- **AC-1.4's unification of the creating and preserving halts is the correct altitude.** One rule over
  every halt, with the empty region as the identity element of the read-modify-write, is a better answer
  than two clauses with a shared postcondition — and it is what lets §5 say `H` is exactly the number of
  halts taken. My G-18 is precisely a test of that sentence, which was worth having stated so plainly:
  the claim is checkable *because* v1.5 made it universal.
- **AC-2.6's table is now stated over window offsets in its cells and not only in its lead-in**, with the
  `W = 1` reading spelled out. The general lesson worth harvesting is the one that keeps recurring in
  this document: **when a rule moves from absolute indices to a relative frame, the derivable artifacts
  — tables a test author reads off — must move with it, or the frame change is only half applied.**

## Mechanical fixes

Not findings. Apply without discussion; none affects the recommendation.

| id | Where | Fix |
|---|---|---|
| MF-1 | §10.10 lead-in, and the *Revision note (v1.5)* opening | Both say **seven** round-6 findings (*"all seven findings below"*, *"six of the seven"*). Round 6 produced **eight**: SE v6 filed four Medium and one Low (G-13 … G-17), TE v6 filed one High, one Medium and one Low (F-01, F-02, F-03) — `{"high": 0, "medium": 4, "low": 1}` and `{"high": 1, "medium": 1, "low": 1}` in the two verdict trailers. §10.10's own table has eight finding rows. Write eight in both places (and *"seven of the eight"* if the "in text v1.4 added" sub-count is recounted — by my reading all eight are, since TE F-03's *absent* row is v1.4 text too). |
| MF-2 | AC-1.5(5), first sentence | The S-15 edit left line 826 at 113 characters — *"region (S-15, AC-1.4 clause 1), `{value}` being the `; `-joined render, in AC-4.7's precedence order,"* — against the ~100-column wrap the surrounding paragraph and the rest of the document keep. v1.5 re-wrapped AC-1.5's closing paragraph for exactly this reason (TE v6 MF-14); re-wrap this one too. |
| MF-3 | §5, catalogue lead-in | *"The five kinds, in the order the rows appear"* now lists **report notices** as (S-5, S-6, S-16) and **reset-region lines** as (S-13, S-14, S-15), but the rows themselves appear in the order S-12, S-15, S-16, S-13, S-14 — so S-16, a report notice, sits between two reset-region rows and the *"beside their kin"* justification no longer describes the table. Either move the S-16 row up beside S-5/S-6, or drop the clause claiming kind-adjacency. |
| MF-4 | AC-1.5(4), *sanctioned repair* paragraph | *"it is the only hand-edit this document asks for besides the marker"* — the document also asks the operator to hand-write `RESOLVED: yes` **and**, per AC-1.5(3), nothing else; but §10.10's TE Q-10 row contemplates a third hand path (a post-mortem surviving a partial harvest). One clause: say the repair is the only hand-edit to *machine-written state*. |
| MF-5 | O-10, v1.5 bullet for TE F-02 | *"a later entry after the operator's sanctioned repair grants the window"* is asserted for a `WINDOW-START:` that *"fails step 2 with `A < H`"*. Under G-18 the intervening halt changes `H`, so the fixture as written does not reach the asserted state; and if G-18 is closed by exempting the refusal from the halt, this bullet becomes correct unchanged. Re-check the bullet once G-18 is decided rather than editing it now. |

## Recommendation

**Needs revision** — one High and two Medium, **all three new in v1.5**, all three in the refusal path
v1.5 introduced. Every finding from rounds 1–6 is closed, four of my five exactly as recommended and one
(the dispatched range plus the SKILL's refusal to guess) better than recommended.

### What must change to close this out

Three clauses. None requires a new mechanism; the first is a decision the author has already made twice
elsewhere in this document.

1. **G-18** — decide whether an entry refused by AC-1.5(4) step 4 **halts as a halt**. The clean answer
   is no: the refusal declines to enter the phase, so it writes no `HALT-REASON:` and strips no
   `RESOLVED:` line, which makes *"the clearance survives for a later entry"* true as written, keeps
   `H` = *"the number of halts this document has taken"*, keeps the reported reason stable across
   entries, and makes O-10's *"byte-unchanged apart from the report"* assertion satisfiable. If the
   author prefers the halt, then delete the three claims it falsifies and rewrite the O-10 bullet.
   This is the only finding this round whose consequence is a **permanent dead end** under the
   document's own repair procedure.
2. **G-19** — state the sanctioned repair for `counts-mismatch`, whose evidence is a pair and not a
   line, and scope whichever rule that repair contradicts (§6's *"never by a human"*, or AC-1.4's `H`
   invariant).
3. **G-20** — move the no-round-admitted report row out of AC-4.7's precedence table into a paragraph
   beside the AC-2.8 one, name its six cells, say whether S-4 co-occurs with S-16 there, define `round`,
   and fix the now-false *"the one row with no dispatch behind it"*.

MF-1 … MF-5 do not block.

### On the stopping rule

Read as §5 defines `blocking(N)` — the sum over the round's two files, by `extractFileVerdict` — the
series is: rounds 1–3 **unavailable**, round 4 = **9** (`(1+4) + (2+2)`), round 5 = **11**
(`(1+4) + (3+3)`), round 6 = **6** (`(0+4) + (1+1)`). Round 6 is the **first decrease** since the
document became measurable, and it is a large one: `blocking(6) = 6 < blocking(5) = 11`, so AC-2.1's
fixed-point condition did **not** hold at round 6 and this round exists because the rule said continue,
not because an operator overrode it. That is the first time in this phase that sentence can be written.

My own panel-private series is 10, 5, 5, 5, 5, 4, **3** — a second consecutive decrease. But I have to
record the counter-signal honestly, because it points the other way from the count: **a High reappeared
after one round without one.** It is not a regression to an old defect — every prior finding is closed —
it is a new hole in the mechanism v1.5 added to close last round's hole, and it has the same shape the
last two rounds had: a state machine that is correct on every path the author traced, with one adjacent
path (here, what the loop does *immediately after* it refuses) not traced. Three consecutive rounds have
now found exactly that, in three different mechanisms.

What I read from the pair of signals together: **the document is converging in volume and not yet in
kind.** The new-mechanism defect rate per round is falling (7 → 8 findings on a bigger diff last round,
3 from me this round on a comparable one), the mechanisms are landing right at the first attempt more
often, and the residue is single missing clauses rather than wrong decompositions. But the reset-region
accounting has now taken a finding in each of rounds 5, 6 and 7 — it is the one part of this REQ that
keeps generating them, because each fix adds a state and each new state has an untraced neighbour.

My read, offered to the operator rather than asserted, and consistent with the standing advice in
`POSTMORTEM-R-pdlc-review-convergence.md` §Recommendation clause 2: **land G-18 — it is one clause, and
it is a fail-closed permanent dead end in the operator escape hatch, which is the one failure mode this
REQ cannot ship with — and carry G-19 and G-20 into FSPEC as inputs.** G-19 is an operator-procedure
sentence FSPEC has to restate anyway; G-20 is a report-row schema paragraph, which is FSPEC-shaped work
(O-8 already owns where the table is emitted). If the operator prefers the mechanical route: apply
G-18 and MF-1, re-resolve the POSTMORTEM, and treat the phase as converged rather than opening round 8.

I would also say plainly, as the reviewer who has filed against this AC three rounds running: if a
fourth round is opened for the reset region alone, the right move is probably not another REQ round but
to let FSPEC state the region's state machine as a table of (state, event) → (state, writes) and let
the untraced neighbours fall out of the enumeration. That is a `Process` observation about where this
kind of defect is cheapest to find, and I have tagged it as such below rather than inflating it into a
finding.

### Explicit non-findings (carried and extended)

Recorded so a later round does not re-raise them: I do not contest any of the six decisions; I do not
file R-5's known unenforceability of AC-5, AC-4.6 or AC-3.2(2); I do not file R-6's mixed-panel
integration risk; I do not contest AC-2.8's fail-open posture, AC-1.5(4)'s fail-closed posture, N-7's
widening to Phase DOD, AC-4.1's live later endpoint, the S-3/S-4 co-occurrence ordering, the AC-2.8 halt
row's empty cells, R-9's decision to record rather than fix, the `H`/`A` decomposition, the
`WINDOW-RESUMED:` literal, AC-1.4's strip, the window-scoping of AC-3.1/AC-3.2/AC-4.1/AC-4.5, AC-3.4's
stopping scan, or the mapping of a duplicated trailer line to *malformed*. **New this round:** I do not
contest making validation a conjunct of the grant gate (G-18 is about the halt that follows, not about
the conjunct), the counts check's bounds `H − A ∈ {0, 1}`, the append rule, S-15's promotion to its own
id, S-16's closed three-member enum, AC-2.7's ordered reading, AC-3.4 step 1's correction to *malformed*,
or the dispatched round range `{W … N−1}`. I have no blocking finding against REQ-RCV-05 or REQ-RCV-06.
I raised no `## Measurement Required` items.

**Scope note.** All three findings are tagged `Local`: each is a missing clause in this document, not a
constraint that outlives it. The durable signal from this round is in the Positive Observations
(*a rule whose correct behaviour is "write nothing" needs a positive artifact*; *a frame change must
move the derivable tables with it*) and in the `Process` observation above about enumerating a state
machine rather than reviewing it path by path.

## Verdict

**Needs revision.** v1.5 (+304/−84, 13 commits) **closes every one of my five round-6 findings**, four
exactly as recommended and one better: AC-1.5(4) gains a two-sided counts check (`H − A ∈ {0, 1}`)
folded into the same fail-closed step as a corrupt value, with the invariant stated as clause 4's domain
(G-14); the loop **appends** its answering line to the end of the region, with S-13/S-14, §5's
durability row and an O-10 positional assertion carrying the rule (G-13); AC-3.2's *Given* now names the
dispatch and the loop passes the inclusive range `{W … N−1}`, with O-9(c) telling the verifier not to
guess when it is absent (G-16); AC-2.7 gains row 3 ⇒ *malformed* with the full baseline trace and the
table is declared read-in-order, and AC-3.4 step 1 is corrected to match HEAD (G-15); and the strip is
scoped to **unfenced** lines (G-17). All five mechanical fixes are applied. I re-read every citation
v1.5 adds at `9486c81` — `:900-903`, `:902`, `:904`, `:906`, `:415-422`, `:417`, `:424-428`,
`:394-400`, `:451`, `:953-958`, `:569` — and every one resolves, including the trailing-space predicate
and the distinction between `parseVerdict`'s `malformed: true` fallback and its genuine `0/0/0`
truncated-output return.

Three new findings, all in text v1.5 added, all three in the refusal path it introduced. **One High:**
AC-1.5(4)'s refusal is immediately followed by a halt — `W` = 1 on an exhausted branch admits no rounds
and AC-1.5(1) halts on the budget path, and AC-1.4 governs *every* halt — so the halt appends a
`HALT-REASON:` (`H += 1`) and **strips the very `RESOLVED:` line the refusal declined to spend**. This
falsifies three statements v1.5 makes (*"the operator's clearance survives for a later entry"*,
*"`H − A ≤ 1` holds on every path the document generates"*, and the stability of S-16's reported
reason), makes O-10's *"the file is byte-unchanged apart from the report"* assertion unsatisfiable
against any conforming implementation, and leaves the document's stated repair procedure divergent: each
repair-and-clear cycle is met by one more halt and a mismatch one larger than the operator just fixed —
a fail-closed **permanent dead end** in the escape hatch AC-1.5(3) exists to keep open (G-18). Two
Medium: the sanctioned repair is stated only over an *offending line* and is therefore inoperable for
`counts-mismatch`, whose evidence is the pair `H`/`A` — and both edits that would fix the counts are
forbidden elsewhere (§6's *"never by a human"*; AC-1.4's *"`H` is exactly the number of halts"*) —
G-19; and AC-4.7's precedence row 8 introduces a **second** dispatchless report row inside a
notice-ordering table, contradicting the *"the one row with no dispatch behind it"* paragraph above it,
asserting empty `panel-shape` / `blocking` cells the column definitions do not admit, and leaving the
`notice` cell doubly specified (AC-1.5(1) says that entry emits the S-4 reason; row 8 says every other
column is empty) — under a schema whose declared bar is character-for-character derivability (G-20).

On the stopping rule: `blocking(4) = 9`, `blocking(5) = 11`, `blocking(6) = 6` — the **first decrease**
since the document became measurable, so AC-2.1's condition did not hold at round 6 and round 7 exists
because the rule said continue. My own series is 10, 5, 5, 5, 5, 4, **3**. The counter-signal, recorded
honestly: a High reappeared after a round without one, and the reset-region accounting has now taken a
finding in each of rounds 5, 6 and 7 — always the same shape, an untraced neighbour of a state the
previous fix added. My recommendation to the operator is to land G-18 (one clause: a refusal is not a
halt) and carry G-19 and G-20 into FSPEC rather than open an eighth round; and, if the region takes a
fourth finding, to let FSPEC enumerate its (state, event) → (state, writes) table rather than review it
path by path.

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}

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

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict

# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 5
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v4.md` (baseline `4df1199`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `4f5be4f`, clean.

## 1. Delta scan

```
git rev-parse 4df1199:docs/.../REQ-pdlc-review-convergence.md → 5258bbb…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → c9343be…
git diff --stat 4df1199 HEAD -- …/REQ-…md → 328 insertions(+), 105 deletions(-)
bytes: 151,011 → 178,410   (+27,399)
```

The revision is v1.2 → v1.3 and it answers round 4 from both panels. Changed sections, and the only
ones scanned below: the header (Cross-Reviews row, v1.3 revision note), §5 (*round growth*, new
*current window*, *zero-delta*; three durability rows plus a new one; the two-writer table; the
catalogue lead-in, the new `HALT-REASON:` paragraph, S-4 and S-10), AC-1.4 (the new preservation
paragraph), AC-1.5(1), AC-1.5(4) restated over counts with a five-row receive side, **new
AC-1.5(5)**, AC-2.1, AC-2.2, AC-2.6's *When* column, AC-2.7 rows 4–5, AC-2.8 (window scoping, the
report row, the digest paragraph), AC-3.1, AC-3.4's five-step reader, AC-4.1 (rewritten), AC-4.2,
AC-4.5, AC-4.7 (`classification` column, the AC-2.8 row, the precedence table now seven rows), §6's
`DOC-SHA256:` row, O-5/O-9/O-10/O-12, **new R-9**, §9.3's new row, and new §10.8. Sections that did
not change — §1–§4, AC-1.1–1.3, AC-2.3–2.5, AC-3.2/3.3/3.5/3.6/3.7, AC-4.3/4.4/4.6, AC-5, AC-6 — are
not re-litigated, except where a changed section is stated *over* one of them: AC-3.2 and AC-1.4's
re-entry gate are read below only as the receivers of AC-1.5(5) and AC-3.1's new window semantics.

Growth into this round is +27,399 bytes — new-mechanism under this REQ's own AC-4.2, and under
**v1.3's** AC-3.1 that classification now escalates *this* round rather than the next, which is the
correct call for a revision that adds a new clause (AC-1.5(5)), a new durable line (`HALT-REASON:`),
a new §5 term (*current window*) and a new risk (R-9).

## 2. Disposition of round-4 findings

Six were open (2 High, 2 Medium, 2 Low). **All six are resolved**, each checked against the document
rather than against §10.8's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-4.1 is rewritten as one round-open read at `t0` yielding `n` and `h`, then three ordered steps: classify `growth = n − DOC-BYTES(N−1)` and select **round N's own** panel, dispatch, then persist. AC-4.2's *When* is *"it selects **round N's** panel, before dispatching it"* and its third column is retitled `Round N's panel`. AC-4.5 is restated over *"the growth into round N ≥ 2"*. AC-3.1's exception now reads *"the growth into round N"* and gains the paragraph *"the classified revision is the one round N's reviewers are about to read"*. §5's *round growth* entry agrees, and round 1 is explicitly *"not measured and raises no notice"* — which closes the second half of the finding (round 2 is no longer forced to `no-anchor` ⇒ full panel). The fix is the one I asked for, taken at the boundary rather than at the writer. |
| F-02 | High | **Resolved as stated, with a new consequence — F-01 and F-02 below** | AC-1.4 gains an explicit obligation: a halt that rewrites an existing post-mortem *"preserves its reset region verbatim"*, with the HEAD prompt cited (`orchestrate-dev.js:1912-1918`, `writePostmortem`) and both halves routed — O-9(d) the prompt clause, O-5 the write confirmation. AC-1.5(4) is restated over the **counts** `R` and `S` with `R > S` as the unconsumed predicate, which is the right shape for a file that accumulates. The lifecycle question I raised is answered. What the answer *introduces* is the subject of my two new Highs: the counting invariant is broken by the new clause 5, and the preserved `RESOLVED: yes` now satisfies AC-1.4's re-entry gate forever. |
| F-03 | Medium | **Resolved** | AC-4.7's precedence table splits S-3 (row 2) and S-4 (row 3), the *"at most one of the two"* clause is deleted, and row 3 states *"**S-3 and S-4 can appear together**, on the last admitted round, in this order"*. AC-2.2 keeps its co-occurring paragraph and adds that S-11 *"never co-occurs with either of them"* because it is decided at round-open. O-10 adds the two-halt row. The cell is now derivable in both directions. |
| F-04 | Medium | **Resolved** | AC-2.1's *Given* and AC-2.8's *Given* are both scoped to *"round N ≥ 2 **of the current window**"* with the `N − 1 ≥ W` test made explicit, §5 defines *current window*, AC-2.8's receive-side row 4 covers `N − 1 < W` with the deliberate-reset rationale, and AC-1.5(5) states that an S-11 halt is cleared **without** consuming the reset. Every part of the composition I asked for is now stated. F-03 below is about a *third* AC that was not scoped alongside these two. |
| F-05 | Low | **Resolved** | AC-1.5(1) renders `rounds {W}..{W+2} of 3` with both specimens; §5's S-4 row gives the format string `rounds {first}..{last} of {MAX_REVIEW_ROUNDS}` plus the reset-window example. |
| F-06 | Low | **Resolved, and generalised** | AC-3.4 now states the trailer reader **once**, as a five-step algorithm whose skip-set is *"**§5's catalogue** … **by reference**; this REQ enumerates it nowhere else, so it has exactly one membership"*. AC-2.7's row 4 is restated as *"contains **nothing but anchor lines**"* so the table classifies exactly the algorithm's outputs. I re-checked: no second enumeration of the anchor keys survives anywhere in the file. |

Mechanical fixes MF-04 (AC-4.7 row 7 now *"last of the seven"*), MF-05 (§5's writer row now names
AC-2.1, with the AC-2.8 ordering spelled out), MF-06 (§10.7's *"noted below"* dropped) and MF-07
(AC-2.8's anchor condition moved out of *Given* into the receive-side table) are all applied. Q-05 is
answered in two places consistently — §5's writer row and AC-4.1 step 3 both say *"into each of the
round's files **that exist** — zero files on a wholly crashed round, one on a partly crashed one"*.
Q-06 is answered by AC-4.1's *"one read"* and AC-2.8's *"there is exactly one read per round-open and
both ACs use it"*. MR-03 is carried; MR-04 is carried and correctly declared not to block.

I checked the five citations v1.3 adds against the stated baseline `9486c81` and **none of them
resolves there** — see F-05. The *claims* they support are nonetheless true, which I verified by
symbol rather than by line: `canonicaliseForDigest` (`:615` at the baseline) does normalise inside
`sha256Hex` (`:696`) and never in a caller, so SE G-03's correction is right — `DOC-SHA256:` is a
digest of the canonical form, not of the bytes `DOC-BYTES:` counts. And AC-1.4's premise holds: the
post-mortem prompt at the baseline is `Write ${postmortemPath}.` plus a section list, with no
preservation obligation of any kind (`pdlc/workflows/orchestrate-dev.js:1724-1731`, inside
`reviewLoop`, literal `postmortemPrompt`). F-05 is about the locators, not about the claims.

## 3. Findings

Every finding below is **new** and lies in a section this revision changed. All six ids are fresh;
none is a re-file of a round-2/3/4 finding. Three of them (F-01, F-02, F-03) are consequences of the
same structural move — v1.3 made the POSTMORTEM into durable machine state and scoped two ACs to the
window without scoping the rest.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-1.5(5) breaks AC-1.5(4)'s counting invariant: an S-11 clearance raises `R` without raising `S`, so `R > S` persists and the *next* halt of any kind is auto-cleared with a fresh window, without the operator doing anything.** See §3.1. | AC-1.5(4), AC-1.5(5), AC-1.1, AC-1.4, §5 durability rows 3–4 |
| F-02 | High | Local | **AC-1.4's new preservation obligation makes one `RESOLVED: yes` clear *every* future halt of that phase, forever.** The gate is stated as presence — *"refusing to re-run the phase until a human writes `RESOLVED: yes`"* — and v1.3 now **forbids** the halt path to remove that line. So the marker an operator wrote to clear halt #1 is still in the file at halt #2, halt #3 and every halt after; the refusal never fires again and the phase re-enters unattended. This is not a pre-existing defect: before v1.3 the halt path rewrote the file with no obligation to keep anything, so each halt plausibly demanded a fresh marker; v1.3 makes staleness mandatory. The mechanism AC-1.1 relies on to be *absolute* — a human in the loop at every halt — is removed by the clause added to protect it. Fix: restate AC-1.4's gate over the same accounting AC-1.5(4) uses (re-entry is permitted iff `R > S`, i.e. an **unpaired** clearance exists), so preservation and one-shot are the same rule read twice, rather than two rules that disagree. | AC-1.4, AC-1.5(3)(4)(5), AC-1.1, §5 durability row 4 |
| F-03 | High | Local | **The first round of a reset window is a single-verifier round, and on a reset-without-revision it can approve the byte-identical document the previous window's full panel rejected.** See §3.2. | AC-3.1, AC-3.2, AC-4.1, AC-4.2, AC-2.8 receive-side row 4, AC-1.5(3), §5 *current window* |
| F-04 | Medium | Local | **AC-1.5(4)'s receive-side table is total but not single-valued — rows 2, 4 and 5 overlap on inputs that are reachable, and give different `W`.** A region carrying `WINDOW-START: 4` then `WINDOW-START: 9` on a branch whose highest round is 6 matches **row 2** (*"decimal integers ≥ 1 and strictly increasing"* ⇒ `W` = the greatest = 9) **and row 5** (*"a value greater than one past the highest round"* ⇒ `W` = 1, fail-closed). A region carrying one garbage value and two good increasing ones matches row 2 and row 3. Nothing states that the rows are evaluated in order, nor that the qualifying rows are a partition. This is the exact defect v1.3 fixed for the trailer reader — DC-01 requires the receive side to be total **and single-valued**, as AC-3.4's new preamble now says in terms — reproduced one AC earlier by the table added in the same revision. A PROPERTIES author writing the fail-closed cases (an O-10 obligation) has two expected values for the same fixture. Fix: state the table as an ordered algorithm (validate every line first; any invalid line ⇒ `W` = 1; otherwise take the greatest), the way AC-3.4 states its reader. | AC-1.5(4) receive-side table rows 2–5, AC-3.4, §5 durability row 3 |
| F-05 | Medium | Local | **Every citation v1.3 adds resolves at `main`, not at the declared baseline, and one names a symbol that exists at neither commit.** See §3.3. | AC-1.4, AC-2.8 digest paragraph, AC-4.1 digest paragraph, §6 `DOC-SHA256:` row, O-9(d), header *Citation baseline* |
| F-06 | Medium | Local | **`HALT-REASON:`'s value grammar is stated three ways and has no §6 row, so the line is underivable on exactly the round O-10 requires a test for.** AC-2.2 says the line *"carries the same `; `-joined string"* on a round where S-3 and S-4 co-occur. §5's new paragraph and AC-1.5(5) both say it carries *"the S-3, S-4 or S-11 string **verbatim**"* — singular, and *verbatim* excludes a joined pair. A test author asserting the post-mortem's line for O-10's new *two-halt row* has three candidate expectations: one line with the joined string, one line with S-3 only, or two `HALT-REASON:` lines. The choice is not academic: AC-1.5(5) reads *"the **last** `HALT-REASON:` line"*, which under the two-line reading is `budget-exhausted:` and under the joined reading is a string that *begins* `fixed-point:` — same branch here, but the receive side is stated over `begins`, and a reader that instead tested set-membership against §5's three strings would reject the joined form outright. §6 is declared authoritative for exactly this (*"a threshold not in this table is a defect in this document"*) and carries rows for the other two new literals, `DOC-BYTES:` and `DOC-SHA256:`, but none for `HALT-REASON:` or for `WINDOW-START:`. Fix: give `HALT-REASON:` (and `WINDOW-START:`) a §6 row fixing the literal, the value grammar and whether a halt writes one line or one per reason; then state §5 and AC-1.5(5) over that row. | AC-2.2, AC-1.5(5), §5 *How a halt reason reaches a later invocation*, §6, O-10 |
| F-07 | Low | Local | **R-9's demonstration does not hold under this REQ's own definition of `blocking(N)`, and its numbers are not obtainable from the branch.** R-9 cites *"blocking counts 10, 5, 5, 5 — AC-2.1 would fire on rounds 3→4"* as measured evidence from this document's own review. §5 defines `blocking(N)` as the sum of `high` + `medium` **over every reviewer of that round, read from the file** by `extractFileVerdict`. Read that way the actual series is: rounds 1 and 2 — *unavailable*, no `{"high": …}` line exists in any of the four files; round 3 — *unavailable*, `CROSS-REVIEW-test-engineer-REQ-v3.md` carries no trailer (`CROSS-REVIEW-software-engineer-REQ-v3.md` carries `3/2/3`); round 4 — `1+4` plus `2+2` = **9**, against round 3's `5` from the one readable file. So AC-2.1 would **not** fire on 3→4 (9 < 10 on the prose numbers; *unavailable* on the readable ones), and the risk's headline example is the one thing it cannot demonstrate. The risk itself is real and I do not contest it — SE G-06's point stands on the finding-turnover half alone. Fix: state the series as the two panels' filed counts with the missing trailers named as *unavailable*, or drop the numbers and keep the turnover argument. Worth noting that this is R-7 happening in front of both panels: three of four rounds of this very document are *unavailable* to AC-2 exactly as R-7 predicts. | R-9, §9.3, R-7, §5 `blocking count` |

### 3.1 F-01 in full — the counting invariant does not survive the clause that uses it

AC-1.5(4) defines the whole reset mechanism over two counts taken on the preserved region: `R` =
`RESOLVED: yes` lines, `S` = `WINDOW-START:` lines, and *"a reset is **unconsumed** exactly when
`R > S`"*. The invariant that makes this work is stated explicitly: *"the region accumulates one
`RESOLVED:` per operator clearance and one `WINDOW-START:` per granted window, so the counts are the
state"*. That is a pairing argument: every clearance is answered by exactly one line that spends it.

AC-1.5(5), added in the same revision, breaks the pairing. Its first row says an S-11 clearance is
honoured — the halt is cleared and the window resumes — but *"no `WINDOW-START:` is written … and the
reset is **not** consumed"*. So a clearance has happened and nothing was written to answer it. `R`
went up; `S` did not. `R > S` is now **permanently** true for that file.

Follow it through, using only reachable states:

1. Window `W = 1`, rounds 1 and 2 spent. Round 3 opens on an unrevised document ⇒ AC-2.8 halts with
   S-11. `R = 0`, `S = 0`.
2. The operator writes `RESOLVED: yes` to clear it (AC-1.4 admits no other way). `R = 1`, `S = 0`.
3. Re-entry: `R > S`, so clause 4 would write `WINDOW-START:` — but clause 5's S-11 row forbids it.
   The window resumes at `W = 1` with round 3 still available. **`R = 1`, `S = 0`.** Correct so far,
   and exactly what I asked for in round 4.
4. Round 3 runs, fails, and the loop halts on the budget on entering round 4 (S-4).
5. Re-entry. Clause 4 observes `R = 1 > S = 0` — *"the first entry that observes `R > S`"* — and
   clause 5's second row says the last `HALT-REASON:` begins `budget-exhausted:`, so **the reset is
   granted and consumed: `WINDOW-START: 4` is written and a fresh three-round window opens.** No
   operator wrote anything between step 4 and step 5.

The result is a free window, handed out by the machine, on the strength of a clearance the operator
spent on an unrelated authoring failure three rounds earlier. And it compounds: each S-11 halt an
operator clears adds one to the surplus `R − S`, so a pipeline that fails to author *k* times banks
*k* free windows redeemable against future budget halts. That is precisely the *"unbounded supply of
fresh windows — one per no-revision halt"* that clause 5's own justifying paragraph says it exists to
prevent. The clause prevents the direct form and reintroduces the deferred form.

The fix is small and is the one the counting formulation already implies: **an S-11 clearance must
write a line too** — a distinct key, e.g. `WINDOW-RESUMED: {W}`, counted in `S` alongside
`WINDOW-START:`. Then `R = S` after every clearance of either kind, the invariant *"one written line
per clearance"* holds without exception, and the two rows of clause 5's table differ only in **which**
line is written and therefore in whether `W` moves — which is exactly the distinction the clause is
about. As a bonus it makes the S-11 path observable: today a resumed window leaves no trace at all in
the file, so no test can distinguish "clause 5 ran and resumed" from "clause 5 was never reached",
which makes O-10's new obligation *"an S-11 halt cleared without consuming the reset"* an
unfalsifiable oracle — there is no positive artifact to assert on, only the absence of a
`WINDOW-START:` line, and absence is also what a loop that ignored clause 5 entirely would produce.

### 3.2 F-03 in full — the first round of a reset window is not treated as a first round

v1.3 scopes **two** ACs to the current window and stops there. AC-2.1 and AC-2.8 both gain
*"of the current window"* with the same justification, stated twice: a round whose predecessor is in
an earlier window *"has no comparable predecessor, exactly as round 1 has none"* (§5), because
*"the operator has just declared the previous window's findings discharged"* (AC-2.1).

Three ACs that read the same boundary were not scoped:

- **AC-3.1** still says *"every round `N ≥ 2` dispatches a single verifier"*, and the first round of a
  reset window is `N ≥ 2` by construction (clause 4 sets `W` to one past the highest existing round,
  so `W ≥ 2` always). §5 says such a round is like round 1; AC-3.1 says it is like round 5. The
  document contains both.
- **AC-3.2**'s *Given* is *"round `N ≥ 2` on a document whose round `N−1` findings **have been
  addressed**"*, and its clause 1 requires a `## Disposition` row *"per prior blocking finding"* of
  round `N−1`. At `N = W` those findings were not addressed by an optimizer episode; they were
  discharged by the operator's marker. The precondition is false, and the required content of the
  round's mandatory `## Disposition` section is underivable.
- **AC-4.1** measures `growth = bytes(t0) − DOC-BYTES(N−1)` with no window scoping, so at `N = W` it
  measures across the operator's intervention.

Compose those three with AC-2.8's new row 4 and the failure is concrete, not theoretical. AC-2.8 row 4
explicitly protects the reset-without-revision case: *"An operator who resets without revising the
document is exercising the escape hatch deliberately; halting the fresh window on its first round
would spend a reset on zero rounds."* Take that operator at their word:

1. Round `W−1` ends with the full panel filing *Needs revision*; the budget is exhausted; halt.
2. The operator judges the findings wrong and writes `RESOLVED: yes` **without touching the
   document**. Clause 4/5 grant a fresh window, `W` = one past the highest round.
3. Round `W` opens. AC-2.8 is **not evaluated** (row 4). AC-4.1 measures `growth = 0` ⇒ AC-4.2
   classifies **incremental** ⇒ AC-3.1 dispatches a **single verifier**.
4. The verifier's job (AC-3.2) is to check the disposition of findings nobody dispositioned, on bytes
   nobody changed. If it approves, AC-3.5's same-round rule is satisfied — one dispatched role, one
   approval — and the document **is approved**.

So the byte-identical document that a two-reviewer panel rejected is approvable by one agent one round
later, and the single mechanism that exists to catch "the document did not change" has been switched
off for that round by this revision. AC-2.8's rationale for switching it off is sound in isolation —
do not spend a reset on zero rounds — but it was written against AC-2.8 alone and not against AC-3.1.

This is a testability finding as much as a correctness one. A PROPERTIES author cannot write the
panel-selection property for `N = W` (two stated answers), cannot write the `## Disposition`
expectation (precondition false), and — worse — the natural test for the reset path is
*"reset ⇒ the fresh window runs"*, which passes under both readings and would never reveal the
approval. The falsifying case is *"reset without revising, verifier approves, assert the document is
**not** approved"*, and nothing in the REQ currently entitles a test author to that expectation.

Fix, at REQ altitude, one of: (a) state that the first round of every window dispatches the **full
panel**, exactly as round 1 does — which follows directly from §5's own *"exactly as round 1 has
none"* and makes AC-3.1 total over windows rather than over rounds; or (b) keep the verifier but scope
AC-3.2's disposition obligation to *within the window* and state what a verifier is asked to do at
`N = W`; and, either way, say whether a round whose growth is zero because nothing was revised can
yield an approval. Option (a) costs one round of one panel per operator reset — a price the operator
has already signalled willingness to pay by resetting — and closes the hole outright.

### 3.3 F-05 in full — v1.3's citations are read at a different commit than the header declares

The header states, unqualified: *"Every `file:line` reference in this document was read from the
working tree at **`9486c81`** on the **default branch `main`**, tree clean."* v1.3 adds five citations
and I checked all of them at that commit:

| Cited as | At `9486c81` | At `main` |
|---|---|---|
| `sha256Hex` — `:848` | `:696` | `:848` ✓ |
| `canonicaliseForDigest` — `:767` | `:615` | `:767` ✓ |
| JSDoc *"applied INSIDE `sha256Hex`"* — `:752-759` | `:600-608` | ✓ |
| `approvalHashOf` — `:950` | `:797` | `:949` |
| `writePostmortem` — `:1912-1918` | **no such symbol**; `:1912-1918` is `approvalAnchorPreCount`'s JSDoc | **no such symbol** |

Four of the five are off by a constant ~+152 lines and land exactly on `main`, so this is not drift —
the rows were read at `main` while the header still declares `9486c81`, and the document now mixes two
baselines with nothing marking which row belongs to which. The header's remedy for drift (*"navigate
by the row's named symbol and distinctive literal"*) does not apply, because the reader who follows the
header opens the wrong commit and finds a SHA-256 compression loop where the JSDoc is claimed to be.
Re-baselining is a mechanical fix and I would have filed it as one; **mixing** baselines silently is
not, because it falsifies a universally-quantified claim the whole §4 evidence base rests on.

The fifth row is a different problem and is why this is Medium rather than mechanical: `writePostmortem`
**names no symbol at either commit**. AC-6.4's check 3 — the citation checker this REQ specifies — is
symbol-proximity within ±25 lines; a symbol that exists nowhere fails it at every window size. The REQ
therefore contains a citation its own AC-6.4 would report, and the row is load-bearing: it is the sole
evidence for AC-1.4's premise that *"nothing today tells the agent either line is precious"*, and O-9(d)
repeats it as the amendment target. I verified the premise independently and it holds — the post-mortem
prompt is `Write ${postmortemPath}.` plus a section list, built inline in `reviewLoop` at
`pdlc/workflows/orchestrate-dev.js:1724-1731` (baseline), local `postmortemPrompt`, no preservation
clause of any kind. So the claim survives; only the locator is fabricated. Fix: re-baseline the header
to the commit these rows were actually read at (and re-verify §4's older rows there), and replace
`writePostmortem` with the enclosing symbol that exists, `reviewLoop`, plus the `postmortemPrompt`
literal.

## 4. Mechanical fixes

Reported per AC-6.5 as a fix list, not as blocking findings; excluded from the counts below. MF-04 …
MF-07 of v4 are all applied and are not carried.

| # | Location | Issue | Fix |
|---|---|---|---|
| MF-08 | §5, *current window* | *"The rounds admitted by AC-1 **since the last operator reset**"* mis-describes the S-11 case: after an S-11 clearance the last operator reset is that clearance, and `W` is explicitly **unchanged** (AC-1.5(5)). | *"since the last **granted** window"*, or *"the window whose origin is `W`"*. |
| MF-09 | AC-1.5(4) | *"On the **first entry** that observes `R > S`"* — "first entry" is not an observable; there is no record of which entry is first, and the condition `R > S` is the whole state. The word invites an implementer to look for an entry counter that does not exist. | Drop "first": *"On any entry that observes `R > S`"*. |
| MF-10 | AC-2.6, table | The *When* column now reads *"the growth into round 2 and into round 3 both exceed 12,000"* — correct under v1.3's boundary — but the row for `dual, dual, verifier` says *"the growth into round 2 was large, into round 3 small"*, which under the new boundary makes round 2 dual **because** of round 2's own growth. That is right; the table's lead-in sentence above it still speaks of *"round N−1's revision"*. | Restate the lead-in over "the growth into round N", as AC-3.1 now does. |
| MF-11 | §10.8, `TE MF-04` row | *"AC-4.7 precedence row 7 — 'last of the seven', not 'always last'"* — the row is correct; §10.7's amended `TE F-04` row says *"six rows in v1.2, seven since v1.3"*, which is also correct. Nothing to fix in either; noting only that the two rows are the only place the row count is stated twice, so a future split must touch both. | None required — a maintenance note. |

## 5. Measurement Required

Filed under AC-5.2's convention. Non-blocking; excluded from the counts below. MR-01 and MR-02 remain
bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`.

| # | Fact to measure | How | What it would settle |
|---|---|---|---|
| MR-03 | *(carried, unchanged)* Does an append to a cross-review file that a reviewer agent has just written reliably land, and is the appended byte visible to the next read in the same invocation? | Append a marker line to a cross-review file immediately after the reviewer dispatch returns, in one throwaway phase, and read it back. | Whether `appendRoundAnchors` (AC-4.1) can share `appendApprovalAnchors`'s append seam. |
| MR-04 | *(carried, unchanged)* Does the halt path's write of `POSTMORTEM-{phase}-{feature}.md` overwrite or append when the file already exists? | Read the existing writer at the Citation baseline and note which seam it uses. | Which of AC-1.4's preservation implementations is cheapest. The REQ correctly declines to wait on it. |
| MR-05 | **New.** Does an agent dispatched with a `Write {path}` prompt, given a preservation clause, reliably preserve an arbitrary region of an existing file — and does the loop's `_checkFile` confirmation seam expose enough of the written bytes to verify that it did? | One throwaway phase: write a post-mortem containing three marker lines, re-dispatch the same prompt with AC-1.4's clause, and diff. | Whether O-5's *"confirms the reset region survived"* is implementable as a confirmation at all, or whether AC-1.4's obligation has to be discharged by a deterministic script write rather than by an agent prompt. F-01 and F-02 both assume the region survives; if it does not survive reliably, the whole `R`/`S` accounting is built on a datum the pipeline can silently lose. |

## 6. Questions

Q-05 and Q-06 of v4 are both answered in v1.3 (§2 above) and are closed. Two new ones, both answerable
in a sentence and neither blocking.

| ID | Question |
|----|---------|
| Q-07 | What is the *reset region*, syntactically? AC-1.4 calls it *"under a heading the halt path does not touch"* and AC-1.5(4) reads counts *"on the reset region"*, but no AC names the heading. If the region is "the whole file", then a `RESOLVED: yes` an operator wrote inside a quoted example, or a `HALT-REASON:` the post-mortem's own Recommendation section quotes, both count — and `R`/`S` are then attacker-writable by ordinary prose. Every other line-scanning rule in this REQ is scoped (`outside any fenced block`, `scanLines`); this one is not, and it is the only one whose miscount grants a review window. I read the intent as an exactly-named section, which would make it S-12 and give it a §6 row alongside F-06's ask. |
| Q-08 | Is AC-4.1's growth measured across a window boundary deliberately? At `N = W` it spans the operator's intervention, so a reset that follows a large revision classifies `new-mechanism` and escalates to the full panel — which is the behaviour F-03 asks for, but reached by accident and only when the operator happened to revise. If the answer is "yes, deliberately", saying so in AC-4.1 resolves half of F-03 by itself; the other half (reset **without** revising ⇒ growth 0 ⇒ verifier) is what still needs a rule. |

## 7. Positive Observations

- **The growth-boundary fix is the right fix, taken at the right place.** I proposed moving the later
  endpoint to the round-open read; v1.3 did that *and* propagated it through every dependent
  statement in one pass — AC-4.1's three ordered steps, AC-4.2's *When* and column title, AC-4.5's
  *Given*, AC-3.1's exception, §5's definition, AC-2.6's *When* column, AC-4.7's `classification`
  cell, and the new round-1 rule (*"no measurement, no S-6 notice"*) that I had not asked for and
  that closes the one hole the change would otherwise have left. Nine locations, no stragglers. That
  is the difference between answering a finding and closing it.
- **AC-3.1 now escalates on `unmeasurable` as well as `new-mechanism`.** v1.2 left AC-4.5's
  fail-safe stated only in AC-4.5, so the panel rule and the fail-safe rule had to be composed by the
  reader. Stating both in AC-3.1's one sentence makes the panel derivable from one AC, which is what
  a PROPERTIES author actually needs.
- **The `R > S` reformulation is a better idea than the presence test it replaces**, and its
  justification — *"the pairing is positional-free"* — is exactly why. My finding was that presence
  is undecidable on an accumulating file; counting is the general answer, not a patch. F-01 is a
  defect in one clause's arithmetic, not in the choice of mechanism, and the fix I propose keeps the
  mechanism intact.
- **AC-3.4's five-step reader with the skip-set *by reference* is the strongest single edit in this
  revision.** *"This REQ enumerates it nowhere else, so it has exactly one membership"* converts a
  recurring class of defect — the same set written twice and drifting — into one that cannot recur
  by construction. It is also the pattern F-06 asks for one more time, for `HALT-REASON:`.
- **SE G-03 was accepted rather than argued with.** The REQ had claimed `DOC-SHA256:` was both a
  digest of the raw bytes and a reuse of the tier-1 hashing; v1.3 states plainly that only the second
  is true, explains what the canonical form drops, and then shows that the AND with `DOC-BYTES:`
  recovers it — including the falsifying case (*"a revision that changes only line endings"*), which
  is now an O-10 obligation. Withdrawing a claim and keeping the mechanism is harder than defending
  the claim, and it is what a receive side that has to be exact requires.
- **R-9 exists at all.** SE G-06 is a finding about the mechanism this REQ is building, raised from
  the review of the REQ itself, and the author recorded it as an accepted risk with a named successor
  rather than burying it. F-07 is about the arithmetic in its evidence, not about the judgement.

## 8. Recommendation

**Needs revision**

Mandatory per the approval rules: three High and three Medium findings are open. **All six round-4
findings are resolved**; every open finding is new and lies in text this revision added.

What must change before this document can be approved:

1. **F-01** — make an S-11 clearance write a paired line (`WINDOW-RESUMED: {W}` or equivalent) counted
   in `S`, so `R = S` holds after every clearance of either kind. As written, `R > S` persists after
   an S-11 clearance and the next halt of any kind is auto-cleared with a fresh window, unattended —
   one banked window per no-revision halt, which is the behaviour clause 5's own justification says
   it exists to prevent. It also gives the S-11 path a positive artifact to assert on; today O-10's
   *"an S-11 halt cleared without consuming the reset"* has no falsifiable oracle.
2. **F-02** — restate AC-1.4's re-entry gate over the same accounting: re-entry is permitted iff an
   **unpaired** clearance exists, not iff a `RESOLVED: yes` line is present. v1.3 forbids the halt
   path to delete that line, so under the present wording one marker clears every future halt of the
   phase forever and AC-1.1's cap stops being operator-gated.
3. **F-03** — scope AC-3.1 (and with it AC-3.2) to the window as AC-2.1 and AC-2.8 now are, or state
   explicitly that the first round of a reset window is a verifier round and that it may approve a
   document nobody revised. Today: reset without revising ⇒ AC-2.8 disabled by its own row 4 ⇒
   growth 0 ⇒ `incremental` ⇒ one verifier ⇒ approval of the byte-identical document the full panel
   had just rejected.
4. **F-04** — restate AC-1.5(4)'s receive side as an ordered algorithm. It is total but not
   single-valued; DC-01 requires both, as AC-3.4's own new preamble says.
5. **F-05** — re-baseline the header to the commit v1.3's citations were read at, re-verify §4's
   older rows there, and replace the nonexistent `writePostmortem` with `reviewLoop` /
   `postmortemPrompt`. The claims are all true; the locators point at a different commit and, in one
   case, at nothing.
6. **F-06** — give `HALT-REASON:` (and `WINDOW-START:`) a §6 row and one statement of the value
   grammar, so the co-occurring-halt line O-10 now requires a test for has one expected literal.

F-07 is Low and may be taken as mechanical. MF-08 … MF-11, MR-03/MR-04/MR-05 and Q-07/Q-08 are
non-blocking and contribute nothing to the counts.

Nothing here contests user need, scope, priority or phasing — that remains settled and out of scope.
Nor do I contest any mechanism v1.3 introduces: the round-open read, the counted one-shot, the
`HALT-REASON:` line, the window scoping and the preservation obligation are, in my judgement, all the
right answers. F-01, F-02 and F-03 are three places where the *new* durable state has not been
composed with the rules that already read it.

**Trajectory note (self-applied, per the preamble's fixed-point rule).** My own blocking counts:
round 1 — 7, round 2 — 4, round 3 — 5 (over a byte-identical document), round 4 — 4, round 5 — **6**.
Under AC-2.1 that is a rise (6 ≥ 4) on a comparable same-shape pair, so on this round the rule
this REQ specifies **would fire** and halt the phase. I record that plainly, and I also record what
the count hides, which is R-9's exact point measured a second time: **6 of 6 round-4 findings are
discharged and 0 are carried**, and all six new findings are defects in text v1.3 added — three of
them in the single clause (AC-1.5(5)) that answered my round-4 F-04. The revision classifies
`new-mechanism` at +27.4 KB, so AC-4.2 and AC-2.1 disagree about this round exactly as R-9 predicts
they will. My judgement, offered to the operator who has to make the call the mechanism cannot: this
is not a plateau. It is a document whose remaining defects are concentrated in one clause added two
days ago, and they are individually small — a missing paired line, a gate stated over presence
instead of counts, one AC not scoped alongside two others. Round 6 should close them.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 1}

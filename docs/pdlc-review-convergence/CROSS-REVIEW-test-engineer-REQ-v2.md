# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` (v1.1)
**Date:** 2026-07-31
**Iteration:** 2
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review of v1.1 against my v1 findings. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v1.md` (baseline `950d781`).
**Verification baseline:** working tree at `3405f2b` (branch `main`, clean).

## 1. Disposition of round-1 findings

All nine of my v1 findings are dispositioned below against v1.1. Each was checked by reading the
changed section, not by trusting §10.6's mapping table.

| Prior id | Severity | Disposition | Evidence in v1.1 |
|---|---|---|---|
| TE F-01 | High | **partially-resolved** | §5's durability table plus AC-4.1's `DOC-BYTES:` anchor give the growth endpoints a nominal durable home, and AC-4.5's S-6 reason enum gives the operator the structural-vs-incidental signal I asked for. But the anchor's declared writer is `appendApprovalAnchors`, which runs only on the approving terminal round — so on a failing round, which is the only kind of round whose growth AC-4 classifies, no anchor is ever written. The endpoint is durable in the wrong place. See F-01 below: the original defect (AC-3 inert, no operator-visible reason) survives in a new form. |
| TE F-02 | High | **resolved** | AC-6.4 now states a closed catalogue C-1 … C-4, one range separator (ASCII hyphen), C-3/C-4/en-dash each *reported as a grammar defect rather than resolved*, and an explicit unparseable-input rule that accumulates and never throws. That is the receive-side totality DC-01 asks for. Verified against the corpus: every citation in v1.1 is now C-1 or C-2 — the only two non-C-1 tokens left in the document are AC-6.4's own C-3/C-4 example cells (lines 983–984), which is deliberate. See F-06 for the residue that creates. |
| TE F-03 | Medium | **resolved** | AC-2.6 replaces the flat claim with a five-row enumeration of every reachable panel-shape sequence, and states the fire-site per sequence. I re-derived all four non-degenerate rows from AC-3.1 + AC-4.2 and they are correct, including `dual, verifier, dual ⇒ never`. R-2 is restated by regime. A test author can now derive expected fire-sites. |
| TE F-04 | Medium | **resolved** | §5's vocabulary table restates **panel shape** over *"the set of reviewer role slugs whose cross-review files exist on the branch at that round"*, explicitly *"not the set of roles dispatched"*, and defines **crashed** as its own state that is never comparable and never a baseline. AC-2.4 carries the `crashed-round` reason. The aliasing I raised is closed in both mechanisms. |
| TE F-05 | Medium | **partially-resolved** | AC-3.2(2) now requires a per-finding `New-mechanism:` field, which does make clause 2 falsifiable at the file level — a verifier that ignores the clause and one that obeys it no longer produce identical artifacts. But the field's stated *consequence* (a finding without it is "not counted" toward AC-2) contradicts §5's own definition of blocking count and needs a findings-table grammar the document says it is not changing. See F-03. |
| TE F-06 | Medium | **resolved** | AC-3.2(1) names `## Disposition` (S-8) exactly, fixes the row contents (prior id *as the prior round wrote it*, round, role, disposition from a closed four-member set), and states a five-case receive side including the fail-closed absent case that refuses approval without halting. O-10 carries it to PROPERTIES. This is exactly the structural artifact I asked for. |
| TE F-07 | Medium | **resolved** | AC-3.5(e) states the marker's receive side at REQ altitude, fail-closed throughout, and O-4 is explicitly narrowed to *"the plumbing, not the semantics"*. The interaction with M-4b's `≥2` ambiguity rule and the both-files case are both stated. See F-05 for a Low bookkeeping defect in that table. |
| TE F-08 | Low | **resolved** | §4.7 and AC-4.1 now both say **"returned"**, and §4.7 names the discrepancy it retracted. One boundary, stated once. |
| TE F-09 | Low | **resolved** | AC-5.4 adds `approved, {n} measurements outstanding` and states plainly that the count is a report field only — not an approval condition, changes no verdict, never gates. |

Round-1 mechanical fixes MF-01 … MF-03 are all applied: `tier2ApprovalRecord` is now quoted in
declaration form (M-3f), every citation is repo-root-relative, and every range uses an ASCII hyphen.
My round-1 Measurement Required items MR-01/MR-02 are carried, not answered, and bound to
`docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md` — the correct handling
under AC-5.3.

## 2. Findings

Scanned: every section the diff `950d781..3405f2b` touched — the header, §2, §3, §4.1/§4.2/§4.7, §5
(vocabulary, durability table, S-catalogue), AC-1.5, AC-2.1/2.4/2.6/2.7, AC-3.2/3.4/3.5(e)/3.7,
AC-4.1/4.5/4.7, AC-5.4/5.5, AC-6.4, §6, §7 N-3, §8, §9.2, §9.3, §10. Sections I approved in v1 and
which the diff did not change are not re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **`DOC-BYTES:` is written by a function that only runs on the approving terminal round, so no failing round ever carries the anchor — and a failing round is the only kind whose growth AC-4 classifies.** AC-4.1 names the writer explicitly: the anchor goes *"in the same anchor block and by the same writer as `APPROVAL-HASH:` / `REVIEWED-COMMIT:` and `REVIEW-MODE:` (M-4a, M-4b)"*, and §6's `DOC-BYTES:` row repeats it (*"written by the same writer as `APPROVAL-HASH:` and `REVIEW-MODE:` so the three cannot drift into three mechanisms"*). At `pdlc/workflows/orchestrate-dev.js:1845` that writer is called from inside `if (gatePass)` only — the PASS branch, whose own comment says *"The round is terminal"*. A round that fails (`gatePass` false) writes no anchor at all. Growth into round N+1 needs `DOC-BYTES(round N)` where round N failed by construction — if round N had passed there would be no round N+1. So under AC-4.1's own receive-side table every boundary reads `no-anchor` ⇒ *unmeasurable* ⇒ AC-4.5 dispatches the full panel ⇒ AC-3.1's single-verifier path never runs. This is my v1 F-01 in a new form: AC-3 is inert, permanently and structurally, and now with an S-6 reason (`no-anchor`) that tells the operator a defect is present rather than that the mechanism does not apply. A second, independent expression of the same defect: AC-4.1 says the loop reads the byte length *"when round N is opened"* and *"writes it into every cross-review file of round N"* — at round-open those files do not exist, they are written by that round's reviewers when the round closes; and a crashed reviewer leaves no file to write into (§5). The write site and the measurement instant are stated as one event and cannot be. **The fix is a REQ-altitude one, not O-4 plumbing:** name a writer that runs on every round regardless of verdict (or a per-round anchor file), and separate the instant the length is read from the instant it is persisted. | AC-4.1, AC-4.2, AC-4.5, §6 `DOC-BYTES:`, M-4a, §5 durability table, O-4 |
| F-02 | High | Local | **AC-1.5's operator reset has no durable window-start anchor, and its reset token is a persistent file state — so after the first reset the absolute cap silently degrades to the per-invocation budget it was written to abolish, for every subsequent invocation.** AC-1.1 fixes the window at *"round 3 counted from round 1 of that document"*; AC-1.5(2) keeps the start append-only at one past the highest existing round; AC-1.5(3) says a `RESOLVED: yes` POSTMORTEM clears the halt and that *"the rounds recorded before that marker do not count against the budget of the window opened after it"*. Two problems, both about observables this REQ otherwise handles well. (a) Nothing on the branch records **where the post-reset window starts.** §5's durability table gives a home to *"Highest round reached for a document"* but not to *"first round of the current window"*, and the marker itself carries no round index. After a reset on a branch whose highest round is 3, the loop must admit rounds 4…6 — which is exactly `windowEnd(highest + 1)`, i.e. the relative rule of M-1d that AC-1.1 replaces — but it cannot distinguish that state from the pre-reset state without a datum no AC names. (b) `RESOLVED: yes` is **not consumed**: per the repo's stated lifecycle the marker sits in `POSTMORTEM-{phase}-{feature}.md` indefinitely, so *every* later invocation reads the same marker and takes the same fresh window. AC-1.5(3)'s claim — *"an operator who has addressed the finding gets a fresh window; an unattended re-invocation does not"* — is therefore false as specified: the second, third and tenth unattended re-invocation all read `RESOLVED: yes` and each gets three more rounds. A test author cannot write the AC-1.1 test for a document that has ever been reset, because the expected admitted-round set is underivable. State the durable window-start anchor (a round index written into the POSTMORTEM at resolve time, or a per-window marker file) and state what makes the reset one-shot. | AC-1.1, AC-1.5(1)(2)(3), M-1d, §5 durability table, S-4 |
| F-03 | High | Local | **AC-3.2(2)/S-9 define `blocking(N)` a second, incompatible way, and require a machine-parsed findings-table grammar that N-3 says this REQ does not introduce and whose receive side is not total.** §5's vocabulary fixes the operand: **blocking count** is *"the sum of `high` + `medium` … read from the file by `extractFileVerdict` → `parseVerdict` (M-2e)"* — i.e. the integers in the count trailer, and nothing else. AC-3.2(2) then says a blocking finding whose `New-mechanism:` field is empty or absent *"is **not counted** in the `high`/`medium` totals of AC-2 and is reported as a malformed finding in the run report"*, and S-9 names AC-2's count as the field's **receiver**. These cannot both hold. Either (i) the loop deducts, which requires it to parse the verifier's findings table — a new machine-read structure with no declared grammar (id column, per-row field syntax, one table or several), directly contrary to N-3's *"the **one** change is AC-3.4's"*, and with no receive-side behaviour stated for an absent table, an unparseable row, or a row count that disagrees with the trailer; or (ii) the verifier is trusted to exclude such findings from the trailer it writes itself — in which case the deduction is unobservable, "reported as a malformed finding in the run report" has no reader that can produce it, and the falsifiability TE F-05 asked for is only half delivered. The document does not say which. Consequence for testability: the expected value of `blocking(N)` for a verifier round is underivable, and `blocking(N)` is the operand of AC-2's halt — so the expected halt/no-halt outcome of a whole class of rounds cannot be derived from the document. It also breaks AC-4.7's auditability claim (*"every column is derivable from the branch alone"*): under reading (i) the `blocking` column is not derivable from the trailer alone. Pick one mechanism and state it; if (i), the findings table becomes a parsed data contract and needs its own row in §5's closed catalogue with a total receiver, and N-3 must say so. | AC-3.2(2), S-9, §5 vocabulary, AC-2.1, AC-4.7, N-3 |
| F-04 | Medium | Local | **AC-4.7's `notice` column admits *exactly one* of S-3 … S-6, but S-5 and S-6 co-occur on a reachable and unexceptional round, so the expected report row is underivable.** The schema is declared closed and fixed *here* rather than downstream (*"O-8 specifies where the table is emitted, not what its columns are"*), and `notice` is *"empty, or exactly one of S-3 … S-6"*. Take a crashed round — zero files, or one unmarked file. §5 makes its panel shape *crashed*, so AC-2.4 emits S-5 `not-comparable: crashed-round`; AC-2.7 also makes its blocking count *unavailable*, a second S-5 (`unavailable-count`); and with no file there is no `DOC-BYTES:` anchor, so AC-4.1 makes the boundary *unmeasurable* and AC-4.5 emits S-6 `growth-unmeasurable: no-anchor`. Three notices, one column, no stated precedence. The same collision occurs whenever a reviewer writes a file with no trailer and no anchor. Either widen the column to a list (and say the ordering), or state a precedence over S-3 … S-6. Until then a PROPERTIES author cannot write the report-row assertion for the crashed-round case that O-10 explicitly requires them to cover. | AC-4.7, AC-2.4, AC-2.7, AC-4.5, S-5, S-6, O-10 |
| F-05 | Low | Local | **AC-3.5(e) announces "all five cases" and tabulates six rows, two of which are the same state seen from two sides.** The lead-in says *"all five cases, at REQ altitude"* and §5's S-1 row repeats the count (*"AC-3.5(e) states all five cases: absent, one exact match, one line with any other value, two or more lines, and a marker on more than one file of the same round"*). The table has six rows: the last two — *"marker present on more than one file of the same round"* and *"marker present on a dual round's file alongside a second unmarked file"* — describe one predicate (more than one file at the round, at least one marked) and the second row's own text says so (*"same contradiction as the row above, seen from the other side"*). Harmless today because both rows refuse identically, but a closed catalogue whose stated cardinality disagrees with its own table is the kind of drift AC-6 exists to prevent, and a PROPERTIES author counting cases from S-1 will write five tests for six rows. Merge the two rows or restate the count as six. | AC-3.5(e), S-1 |
| F-06 | Low | Local | **AC-6.4's own C-3/C-4 example cells are, by AC-6.4's rule, permanent defect reports against this document, and no exemption is stated.** The extraction rule is *"any `:` followed by digits inside backticks"* that matches none of C-1 … C-4 is reported as `unparseable` / a grammar defect. Lines 983–984 of the REQ contain exactly two such tokens — `` `orchestrate-dev.js:1436` `` and `` `:1574` `` — and they are the catalogue's illustrative examples, which must **not** be "fixed". So the checker's output on this REQ is permanently two must-not-fix items, and an author following AC-6.5 (*"an author fixes them without a round of discussion"*) would destroy the catalogue. The repo already has the mechanism to express the exemption: `scanLines` skips fenced regions precisely so *"a quoted example anchor cannot fabricate an ambiguity"* (`pdlc/workflows/orchestrate-dev.js:1907-1910`). State the equivalent rule for the checker — fenced blocks and/or a table cell marked as an example are not citations — or move the examples into a fenced block. | AC-6.4, AC-6.5, M-4b |

## 3. Mechanical fixes

Reported per AC-6.5 as a fix list, not as blocking findings; excluded from the counts below. Every
`M-*` row in §4 was re-verified against `pdlc/workflows/orchestrate-dev.js` at `3405f2b`, including
the rows the revision added, and all of them hold — see Positive Observations.

| # | Location | Issue | Fix |
|---|---|---|---|
| MF-01 | §4.7, first bullet | *"Unmeasured at `d11dad5`"*. The header's Citation baseline was moved to `9486c81` on `main` precisely because `d11dad5` is not reachable from where this document is reviewed (SE F-08); this sentence still pins the old, unreachable sha. It is a claim about a *tree*, so it is a citation in the sense §4 means. | Restate as unmeasured at the current baseline, or drop the sha. |
| MF-02 | §5, S-2 row | S-2's receiver column says AC-4.1 states *"all four"* unmeasurable cases and AC-4.1's own table has four rows — consistent. But O-10 says *"all four `DOC-BYTES:` unmeasurable cases (AC-4.1)"* while AC-4.5's prose names only three reasons (`no-anchor`, `unreadable-anchor`, `non-document-target`) because two of the four inputs share a reason. Nothing is wrong, but a PROPERTIES author reading O-10 will look for a fourth reason string. | Say "four inputs, three reasons" once, where the counts first appear. |

## 4. Measurement Required

Filed under AC-5.2's convention (self-applied ahead of the AC shipping). Non-blocking; excluded from
the counts below. MR-01 and MR-02 from v1 are carried unchanged and are bound to
`docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`; neither is repeated here.

| # | Fact to measure | How | What it would settle |
|---|---|---|---|
| MR-03 | Does `_appendFile` on a cross-review file that a reviewer agent is still writing (or has just written) reliably land, and is the appended byte visible to the next `_readFile` in the same invocation? | Append a marker line to a cross-review file immediately after the reviewer dispatch returns, in one throwaway phase, and read it back. | Whether F-01's fix — writing `DOC-BYTES:` on **every** round rather than only the approving one — can reuse `appendApprovalAnchors`'s append seam at all, or needs a different write point. It does not change the fact that the current writer runs only on the PASS branch. |

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | *(carried from v1, unanswered)* AC-3.1 exempts Phase CR by name and AC-3.3 gives the reason. Phase DOD runs its own evaluator→optimizer loop (`dod-verify` → `se-implement`, 3 rounds) over `CODE_REVIEW-{feature}-v{N}.md` artifacts. Is that loop in or out of scope for AC-1, AC-2 and AC-4? It is neither `reviewLoop` nor Phase CR, no non-goal names it, and AC-1.1's *"any review-loop phase for a document"* does not obviously exclude it. |
| Q-02 | *(carried from v1, unanswered)* On the last admitted round, both AC-2's fixed-point test and AC-1's budget can be satisfied at once. Which halt reason does the operator see — S-3 or S-4 — and does AC-2.1's evaluation run at all on the final round, given it is defined as happening *"before round N's optimizer episode is dispatched"* and the final round dispatches no optimizer? |
| Q-03 | AC-3.4 requires the count trailer *inside* the `## Verdict` section. The repo's existing file contract states that the section *"must carry exactly one `VERDICT: {value}` line; a second one is read fail-closed"*. Does the JSON trailer line count as part of that section for `extractFileVerdict`'s purposes on a file written by an **un-amended** SKILL that emits the trailer *after* the section (the current SKILL wording puts it at the end of the *response*)? R-7 accepts the lag as *unavailable*, which is the right disposition — the question is whether a trailer one line below the section boundary reads as *unavailable* or as *malformed*, since the two report differently (AC-2.3 vs AC-2.7). |

## 6. Positive Observations

- **The durability axis is now a first-class part of the document, and it was the right diagnosis.**
  §5's durability table plus §4.7's closing paragraph name the axis the original §4.7 missed —
  *in-process state that does not survive an invocation boundary* — and then discharge it row by row
  with an explicit rule that an AC stated over an *in-process only* row is a defect. AC-2.1 reading
  **both** operands from files, AC-1.5 making the window absolute, and M-2e/M-2f/M-2g naming the
  file-side seam and the trailer gap are three independent consequences of one insight. F-01 above is
  a failure to carry that insight into AC-4.1's *writer*, not a failure of the insight.
- **AC-2.6's reachable-sequence table is the shape a testable AC should have.** It replaces a flat
  claim with an enumeration whose rows I could mechanically re-derive from AC-3.1 and AC-4.2, and it
  states in terms what varies between regimes and what does not (*"fires at most once per phase in
  every reachable sequence"*). §2's two-regime saving table does the same for the cost claim and says
  plainly that the pessimistic row is the expected steady state. Stating the weaker claim
  unconditionally, and the stronger one with its precondition, is exactly right.
- **Every one of the eight new `M-*` rows verifies at `3405f2b`.** I re-checked M-1d
  (`deriveRoundWindow`'s per-invocation-budget doc comment and the two lines at
  `pdlc/workflows/orchestrate-dev.js:2197-2198`), M-1e's `const last = endIndex === undefined ?
  windowEnd(first) : endIndex;`, M-2e's `extractFileVerdict`, M-2f's record shape at
  `pdlc/workflows/orchestrate-dev.js:2401-2407` (no `high`/`medium`/`low` — the claim that makes the
  whole durability argument), M-2g's SKILL wording, and M-3f's declaration form. All accurate,
  including the retraction of v1.0's wrong `windowEnd` caller in M-1b. The document is now
  self-consistent about what it got wrong, which is unusual and worth saying.
- **The receive-side tables are real totality, not a gesture at it.** AC-3.5(e), AC-4.1's
  `DOC-BYTES:` table, AC-3.2's `## Disposition` table and AC-5.5's S-7 paragraph each enumerate
  inputs and give each one a behaviour, and each is fail-closed in the direction that cannot grant a
  false approval. O-4 and O-6 are narrowed to plumbing *in their own text*, which is what stops the
  semantics leaking back into the FSPEC.
- **§9.3's deferrals are bound to files that exist.** I checked the three successor paths; each stub
  is on the branch with `ready: false`. A deferral bound to a checkable surface is testable; a
  deferral bound to prose intent is not.
- **The negative cases survived the revision and grew.** AC-2.5's `0 ≥ 0`, AC-2.3's both-directions
  chain break, AC-2.7's *unavailable* (new, and the right distinction — a missing trailer reading as
  a genuine `0/0/0` was a real false-green), AC-2.4's crashed round, AC-3.5(b), AC-4.5's escalation,
  and AC-3.2's missing-`## Disposition` refusal-without-halt are each stated as a non-behaviour with
  a reason, and O-10 now lists all of them by name as a PROPERTIES obligation.

## 7. Recommendation

**Needs revision**

Mandatory per the approval rules: three High and one Medium finding are open. The trajectory is
strongly favourable — seven of my nine round-1 findings are fully resolved, the two Highs are down to
one partially-resolved, and the revision answered the *diagnosis* correctly. Two of the three Highs
below are consequences of carrying that diagnosis one step short, not new problems.

What must change before this document can be approved:

1. **F-01** — `DOC-BYTES:` must be written on **every** round, not only the approving terminal one.
   As specified, the anchor's writer (`appendApprovalAnchors`, called only inside `if (gatePass)` at
   `pdlc/workflows/orchestrate-dev.js:1845`) never runs on a failing round, and a failing round is the
   only kind whose growth AC-4 classifies — so every boundary reads `no-anchor`, AC-4.5 escalates, and
   AC-3's single-verifier path is dead on every run. Separate the instant the byte length is read
   (round open) from the instant it is persisted (round close, into files that by then exist).
2. **F-02** — give AC-1.5's post-reset window a durable start anchor, and say what makes the
   `RESOLVED: yes` reset one-shot. As written, the marker persists, so every later unattended
   re-invocation gets a fresh three-round window and the absolute cap degrades to the per-invocation
   budget AC-1.1 replaces — the opposite of what AC-1.5(3) claims.
3. **F-03** — decide which component performs AC-3.2(2)'s "not counted" deduction. If the loop does
   it, the verifier's findings table becomes a parsed data contract: it needs a row in §5's closed
   catalogue with a total receiver, and N-3 must stop saying AC-3.4's trailer is the only grammar
   change. If the verifier does it in its own trailer, say so and drop the "reported as a malformed
   finding" clause, which no reader can then produce.
4. **F-04** — state a precedence over S-3 … S-6, or widen AC-4.7's `notice` column to a list. A
   crashed round legitimately raises two S-5 notices and one S-6 at once, and O-10 requires PROPERTIES
   to assert the row for exactly that case.

F-05 and F-06 are Low and may be taken as mechanical. MF-01/MF-02 and MR-03 are non-blocking and
contribute nothing to the counts.

Nothing in this review contests user need, scope, priority, phasing, or whether the six changes should
be made — per the stopping rule that is settled and out of scope. F-01, F-02 and F-04 are findings
that an AC's externally observable behaviour is undefined or self-defeating; F-03 is a finding that
two sections define the same observable incompatibly. None of them turns on an unmeasured runtime
fact, and F-01 is verified against the code at the baseline sha rather than argued from the document.

**Trajectory note (self-applied, per the preamble's fixed-point rule).** Round 1: 2 High, 5 Medium =
7 blocking from this reviewer. Round 2: 3 High, 1 Medium = 4 blocking. Decreasing, so the fixed-point
rule does **not** fire on my side of the panel. Bytes grew from 71,025 to 116,569 — 45,544 bytes, nearly four pacing
write, so under this REQ's own AC-4.2 the revision would classify *new-mechanism* and round 3 would
re-escalate to the full panel. Both figures are offered so the operator can watch the trajectory the
preamble asks them to watch.

## Verdict

VERDICT: Needs revision

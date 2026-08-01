---
feature: pdlc-review-convergence
ready: true
depends-on: [pdlc-review-loop-hardening]
---

# REQ — pdlc-review-convergence

| Field | Value |
|---|---|
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 1–3 and recommendations R-4, R-5, R-6; `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` §2, §4, §5.3; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-review-convergence.md`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; a new library under `pdlc/workflows/lib/`; the three review SKILLs (`pm-review`, `se-review`, `te-review`); the three author SKILLs (`pm-author`, `se-author`, `te-author`); generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Cross-Reviews | `docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v1.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v1.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v2.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v2.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v3.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v3.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v4.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v4.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v5.md`; `docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v5.md`. **This row is maintained per round** — the revision that answers round N adds round N's two files — so a missing later round is a mechanical fix, not a finding (SE v4 MF-4). |
| LEARNINGS | `docs/pdlc-review-convergence/LEARNINGS-pdlc-review-convergence.md` |
| Citation baseline | Every `file:line` reference in this document was read from the working tree at **`9486c81`** on the **default branch `main`**, tree clean. The v1.0 header pinned `d11dad5` on `feat-pdlc-review-loop-hardening`, which is *not* an ancestor of `main` and therefore not reachable from where this document is reviewed (SE F-08); the predecessor feature has since merged (`7bc559a`), so the baseline is restated over the default branch and every row in §4 was re-verified against it. Per the convention this repo adopted after `CROSS-REVIEW-software-engineer-REQ-v1` F-05 on the predecessor feature, **every** citation below names its enclosing symbol *and* a distinctive literal alongside the line number, so a line drift narrows the reader's search rather than invalidating the claim. Citations are written **repo-root-relative** (`pdlc/workflows/orchestrate-dev.js:52`) — the closed grammar AC-6.4 defines. A citation that names only a line number, or only a basename, is a defect in this document; report it as a mechanical fix, not a finding (see AC-6). **The baseline is a fixed commit, not "HEAD".** `9486c81` is an ancestor of `main`, so every citation below resolves there; `main` has since advanced and `pdlc/workflows/orchestrate-dev.js` has gained ~217 lines, so a reader checking a row at a *later* commit should navigate by the row's named symbol and distinctive literal — which is exactly the drift tolerance the convention exists to provide — rather than by the line number alone (TE v3 MF-03). Re-baselining is a mechanical fix, not a finding. **v1.4 re-verified every citation this document makes against `9486c81` itself, line by line.** v1.3 added five rows whose line numbers were read at `main` rather than at the baseline — off by a constant ~+152 lines — and one (`writePostmortem`) named a symbol that exists at neither commit; that is not drift, it is two baselines mixed in one document, which falsifies the universal claim this row makes (TE v5 F-05, SE v5 MF-1). All five are corrected below to their `9486c81` values, and the citations v1.4 itself adds were read there in the same pass. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.4 | 2026-07-31 |

> **Revision note (v1.4).** This version answers round 5. Both panels again closed **every** prior
> finding, and every round-5 finding lies in text v1.3 added — six of the seven in the three mechanisms
> v1.3 introduced. §10.9 maps each one. Six things changed:
>
> 1. **`RESOLVED:` is no longer overloaded as a counter, and the halt path leaves the file unresolved
>    (SE G-07, TE F-02).** `parseResolvedMarker` (`pdlc/workflows/orchestrate-dev.js:953`) reads **every**
>    unfenced `RESOLVED:` line and returns `duplicated` — fail-closed — for more than one (`:961`), and
>    `checkPostmortem` (`:2440`) maps anything but a single `yes` to `unresolved` (`:2446-2447`). v1.3's
>    preservation rule therefore either left a stale `RESOLVED: yes` that made the *next* halt read as
>    already resolved (fail-open on the repo's central gate), or accumulated a second one that bricked
>    the phase permanently. AC-1.4 now has the halt path **strip** any prior `RESOLVED:` line while
>    preserving the rest of the reset region, so exactly one marker can ever exist and every halt demands
>    a fresh human clearance.
> 2. **One-shot is restated over lines that may legally repeat (SE G-07, TE F-01).** The reset region
>    accounts `H` — `HALT-REASON:` lines — against `A` — `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines.
>    A clearance is unconsumed exactly when `A < H`, and **every** clearance writes exactly one answering
>    line: `WINDOW-START:` on a convergence halt, the new `WINDOW-RESUMED: {W}` on an S-11 halt. The
>    S-11 path therefore no longer banks a free window for the next fixed-point halt, and it gains a
>    positive artifact a test can assert on.
> 3. **The reset region is a named section, and the loop maintains it deterministically (TE Q-07,
>    TE MR-05).** It is `## Reset Region` (S-12), scanned outside fenced blocks; each halt **appends** its
>    own `HALT-REASON:` to the end of it, so document order is halt order and AC-1.5(5)'s *"last"* means
>    *"most recent"* (SE G-11). The region is written by the loop around the agent's post-mortem write,
>    not by asking an agent to preserve bytes.
> 4. **The first round of every window is treated exactly as round 1 (TE F-03).** Round `W` dispatches
>    the full panel, is not compared by AC-2.1, is not tested by AC-2.8, and has no measured growth. v1.3
>    scoped two ACs to the window and left AC-3.1, AC-3.2 and AC-4.1 unscoped, which let a single verifier
>    approve the byte-identical document a full panel had just rejected.
> 5. **The trailer reader stops, and a duplicated `VERDICT:` is classified (SE G-08, SE G-09).** AC-3.4
>    step 2's scan stops at the first candidate, so steps 4–5 no longer quantify over a set that cannot
>    have two members; and `extractFileVerdict`'s third return value (`duplicated`,
>    `pdlc/workflows/orchestrate-dev.js:904`) now has a row in AC-2.7 ⇒ *malformed*.
> 6. **`HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` are catalogue members with §6 rows
>    (TE F-06, SE MF-2).** One `HALT-REASON:` line per halt, carrying the `; `-joined render of every
>    reason that halt raised in AC-4.7's order — so the co-occurring-halt line O-10 requires a test for
>    has exactly one expected literal.
>
> Also: AC-1.5(4)'s receive side is restated as an ordered algorithm (TE F-04), R-9's demonstration is
> restated over counts that are obtainable from the branch (TE F-07), the AC-2.8 halt row's empty cells
> are justified as a presentation choice rather than as an absence of sources (SE G-12), every v1.3
> citation is corrected to the declared baseline (TE F-05, SE MF-1), and both mechanical-fix lists are
> applied.

> **Revision note (v1.3).** This version answers round 4. Both panels closed **every** prior finding
> (SE F-01…F-08, TE F-01…F-07) and every round-4 finding lies in text v1.2 added. §10.8 maps each one.
> Five things changed:
>
> 1. **The growth boundary selects the panel of the round it measures (TE F-01).** v1.2's formula
>    classified the revision *into* round N and selected round **N+1's** panel from it, so the revision a
>    verifier must read cold was never the one classified, and round 2 was unclassifiable (there is no
>    `DOC-BYTES(0)`) and therefore always the full panel. AC-4.1 now states one read at round N's open —
>    shared with AC-2.8 (TE Q-06) — `growth = bytes(t0) − DOC-BYTES(N−1)`, classified immediately, and
>    **round N's own** panel selected from it. Round 1 is the only unclassified round, and it is dual by
>    AC-3.1 regardless.
> 2. **The POSTMORTEM's lifecycle under a second halt is stated (TE F-02, SE G-04).** `WINDOW-START:` is
>    machine-written, load-bearing state living in a fixed path the halt path rewrites. AC-1.4 now
>    requires that rewrite to preserve the reset region verbatim; AC-1.5(4) is restated over the
>    *counts* of `RESOLVED: yes` and `WINDOW-START:` lines, so one-shot survives appending, and clause 5
>    states the halt-reason line every halt writes.
> 3. **An S-11 halt does not spend the operator's reset, and neither AC-2.1 nor AC-2.8 compares across a
>    window boundary (TE F-04).** A no-revision halt is an authoring failure; clearing it restores the
>    window it interrupted rather than replacing it.
> 4. **The two halt notices co-occur, and the undispatched round has a row (SE G-01/TE F-03, SE G-02).**
>    AC-4.7's precedence table splits S-3 and S-4 into two rows and states the AC-2.8 halt row: four
>    empty cells and `notice` = S-11 alone.
> 5. **`DOC-SHA256:` names the bytes it digests (SE G-03), and the trailer reader is stated once
>    (SE G-05, TE F-06).** The digest is `sha256Hex`'s — i.e. over `canonicaliseForDigest`'s output — and
>    the reader is one algorithm whose skip-set is §5's catalogue by reference, not a second enumeration.
>
> Also: AC-1.5(1)'s halt literal is parameterised (TE F-05), and both mechanical-fix lists are applied.

> **Revision note (v1.2).** This version answers rounds 2 and 3 of cross-review. Round 3's panel
> reviewed a byte-identical document — the round-2 authoring episode produced no commit — so both
> reviewers carried their round-2 findings forward verbatim and added one new `Process` finding about
> the empty round itself. §10.7 maps every round-2/3 finding to where it is answered. Five things
> changed structurally:
>
> 1. **The per-round anchor writer is separated from the approval writer (SE/TE F-01).** v1.1 named
>    `appendApprovalAnchors` as the writer of `DOC-BYTES:` and `REVIEW-MODE:`. That function runs only
>    on the approving terminal round, so on a *failed* round — the only kind AC-2 compares and AC-4
>    measures — neither anchor was ever written, and both mechanisms were structurally dead. AC-4.1 now
>    names an **unconditional per-round writer** that runs after every round's reviewers return,
>    whatever they returned, and the growth formula is restated so that only the *earlier* endpoint has
>    to be durable — removing v1.1's circular dependency on files that did not yet exist.
> 2. **Panel shape is read from the on-disk role-slug set, not from the marker (SE F-02).** §5's
>    *crashed* predicate no longer turns on `REVIEW-MODE:`. Every round produces role slugs, including
>    failed ones; the marker remains the approval-path discriminator.
> 3. **AC-3.2(2)'s "not counted" rule has a named reader (SE/TE F-03).** Reading 2 is chosen and stated:
>    the verifier excludes such findings from the trailer it writes; the loop deducts nothing. R-5
>    records that this half of S-9 is directive rather than enforced.
> 4. **The operator reset has a durable window-start anchor and is one-shot (SE F-05, TE F-02).**
>    AC-1.5 gains clause 4: the loop anchors the reset with a `WINDOW-START: {N}` line in the resolved
>    POSTMORTEM and treats a marker that already carries one as consumed. §5's durability table gains
>    both rows.
> 5. **A zero-delta round is a halt, not a consumed round (TE F-07, SE F-08).** AC-2.8 adds a
>    byte-and-hash identity test over the reviewed document across consecutive rounds, with its own halt
>    reason — the defect this very round of review exhibited.
>
> Also: AC-3.4 fixes the trailer's **placement** (SE F-04), AC-4.7's `notice` column gains a stated
> precedence (TE F-04), AC-6.4 exempts its own example cells (TE F-06), and the Lows and mechanical
> fixes of both v2 lists are applied.

> **Revision note (v1.1).** This version answers round 1 of cross-review in full: SE F-01 … F-12 and
> TE F-01 … F-09, plus both mechanical-fix lists. §10.6 maps every finding to where it is answered.
> Four things changed structurally:
>
> 1. **Durability.** The three High findings were one question — *what cross-round loop state survives
>    an invocation boundary?* — answered in one place, §5's new **durability table**. AC-1.5 makes the
>    round budget absolute per document; AC-2.1 reads both operands from the files; AC-4.1 gives the
>    growth endpoints a durable `DOC-BYTES:` anchor. No AC is now stated over in-process state.
> 2. **DC-01 totality.** §5 carries a **closed catalogue of nine** boundary-crossing strings, each with
>    a total receiver stated at REQ altitude — including all five `REVIEW-MODE:` cases (AC-3.5(e)),
>    all four `DOC-BYTES:` cases (AC-4.1), and AC-6.4's citation grammar C-1 … C-4 with its
>    unparseable-input behaviour. O-4 and O-6 are narrowed to plumbing.
> 3. **Oracles for AC-3.2.** `## Disposition` (S-8) and the per-finding `New-mechanism:` field (S-9)
>    make both clauses falsifiable; v1.0's versions could not be distinguished from their own violation.
> 4. **DC-08 binding.** All three deferrals are bound to successor REQ stub files that exist on the
>    branch (§9.3), and §2 states the saving as **two named regimes** rather than one figure.
>
> Every citation is repo-root-relative with an ASCII-hyphen range, and the baseline is pinned to a
> commit on the default branch.

> **Stopping rule (binding on Phase R for this document).**
>
> This REQ is written at requirements altitude. Every acceptance criterion below is stated over
> something a script or a human can *observe in-band*: an integer in a reviewer's count trailer, the
> presence or absence of a named file on disk, the byte length of a document, or a line of text in the
> run report. **No acceptance criterion in this document turns on unmeasured behaviour of the Claude
> Code workflow runtime.** That is the deliberate difference between this REQ and its predecessor,
> whose Phase R died in five rounds because two of its acceptance criteria could only be settled by a
> measurement nobody had taken (POSTMORTEM root cause 1: *"design work mis-filed as requirements
> work"*). A reviewer who finds an AC here that *does* turn on an unmeasured runtime fact has found a
> real and blocking defect — say so plainly and name the fact.
>
> Conversely: a finding of the form "this AC has no oracle / no fixture / no seam / no test yet" is a
> **downstream obligation**, discharged by §8, not a REQ revision. Only a finding that contests user
> need, scope, priority, phasing, or an AC's externally observable behaviour may block this document.
>
> **Two consecutive rounds of non-decreasing blocking-finding count is a fixed point: escalate to the
> operator, do not iterate.** This clause is prose, and prose is exactly what failed last time — the
> enforcement that would make it bite is AC-2 of this very document, which has not shipped yet. Until
> it does, Phase R for this REQ runs under the **current** five-round, dual-panel behaviour and the
> rule above is honoured only by whoever is reading. The operator is asked to watch the trajectory.
>
> **On the decision itself.** The six changes below are operator-directed and settled. Reviews should
> establish whether each is specified observably, completely and consistently — not whether it should
> be made. A finding that relitigates *whether* is out of scope; a finding that the specification of
> *what* is ambiguous, unobservable or self-contradictory is squarely in scope and welcome.

## 1. Problem

The pdlc review loop does not converge, and when it fails to converge it fails **expensively**. This
is now measured twice, on two consecutive features, with the same signature.

### 1.1 The measured run

`docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` records Phase R for that
feature in full. Five rounds of author → dual cross-review → address ran to the five-round ceiling
without a single **Approved** verdict from either reviewer. The two tables that matter:

| REQ version reviewed | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 |
|---|---|---|---|---|---|
| Blocking findings (High + Medium, SE + TE) | 11 | 6 | 6 | 7 | 9 |
| of which High | 4 | 1 | 1 | 1 | 3 |

| REQ version | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 |
|---|---|---|---|---|---|---|
| Bytes | 25.9 KB | 51.7 KB | 74.0 KB | 99.0 KB | 127.1 KB | 165.3 KB |

The blocking count fell once, flattened, then rose for three consecutive rounds. The document grew
monotonically at roughly 25 KB per round — 6.4× over five rounds. The predecessor feature
(`pdlc-workflow-distribution`) produced the same shape twice, for a combined ten rounds and 384 KB
with no acceptance.

Meanwhile the *resolution rate* was near perfect: rounds 2–5 resolved 5/5, 5/5, 6/6 and 5/5 of the
findings they were given. The authoring side did everything it was asked. That is what makes this a
loop defect rather than a quality defect.

### 1.2 Why it does not converge

The post-mortem names four defects. All four are in scope here.

**P-1 — New text is unreviewed text, so the finding rate is self-sustaining.** Under delta review,
each round reads what the previous round added. Every round's answer to a finding is *more text*:
a retraction, a rationale, a risk row, a downstream obligation. At ~25 KB of new text per round the
review surface never shrinks, so the blocking-finding rate cannot fall below the rate at which the
answers themselves generate reviewable material. POSTMORTEM §Pattern 1 states this directly: at
round 5, *every* blocking finding from both reviewers landed in text introduced at v1.4. The loop is
convergent on the text it reviewed and non-convergent on the document. Nothing in the loop
distinguishes "this round tightened 1 KB" from "this round added a new 25 KB mechanism" — the
iteration counter treats both as one round (root cause 3).

**P-2 — The stopping rule is advisory, so it does nothing.** The predecessor REQ's preamble carried
the same fixed-point rule this document carries in its own preamble. Its test was satisfied at
round 3 (6 → 6, non-decreasing). Rounds 4 and 5 ran anyway, consumed two full author-plus-two-reviewer
cycles, added 66 KB — 40% of the finished document — and ended with *more* blocking findings than the
round on which the rule fired. Nothing in `orchestrate-dev` reads a stopping rule written in the
document under review, so the loop cannot honour it. This is a verbatim reproduction of finding R-4
of the feature *before* that one. An advisory stopping rule has now failed on three features
(root cause 2).

**P-3 — Findings that only a measurement can close are filed as blocking prose findings.** The
post-mortem's primary root cause. Two of the four generator classes (A: unobservable termination
signal; B: provenance of the approval hash) never closed across five rounds, because both turn on
properties the workflow runtime does not expose and nobody had measured. Every candidate rule was
therefore a guess about unobservable behaviour; a competent reviewer can always construct the
falsifying scenario, and the author can only answer by choosing a different unobservable or by
converting the defect into an accepted risk. That process **has no fixed point** below the point where
the underlying facts get measured. Three of the surviving answers (R-9, R-10, R-12) are risk
acceptances, not solutions. The measurements themselves were cheap — a throwaway bundle run — and
were never the REQ's job.

**P-4 — Mechanically checkable defects consume review rounds.** Class D: line-number and
symbol-existence accuracy in `file:line` citations. It was filed at round 1, answered with a dedicated
`Citation baseline` header row and a symbol-plus-literal drift-proofing convention, and *reappeared at
round 5* inside the newest measured section — off-by-two line numbers at the very sha the row named,
plus a function cited in call form that does not exist at HEAD. Four rounds of attention and a
documented convention did not fix it. POSTMORTEM R-6 already rules it "verifiable by a script and
should never consume a review round again". It has no script.

### 1.3 Two structural facts about the panel

Two further observations from the post-mortem are load-bearing for the fix and are not defects in
themselves:

- **The two reviewers do not disagree with each other** (§Pattern 4). At round 5 both independently
  filed the same wrong-read defect. Their disposition tables agree on what was fixed. Both explicitly
  approve the large majority of each revision. The dual-adversarial panel is buying breadth on the
  *first* read of a document and, on later reads, is buying a duplicated disposition check.
- **There is no product disagreement at all** (§Pattern 3). Across ten reviews, not one blocking
  finding contests user need, scope, priority, phasing, or an externally observable behaviour. Every
  blocking finding is about internal mechanism.

### 1.4 What this REQ does

Six changes to the review loop, directed by the operator, each attacking one of the four defects:

| # | Change | Attacks |
|---|---|---|
| AC-1 | Round cap 5 → 3 | P-1 (bounds the damage), P-2 |
| AC-2 | Enforced fixed-point stop, computed from the reviewers' own count trailers | P-2 |
| AC-3 | Round 1 dual-adversarial; rounds 2+ a single verifier in disposition-check mode | P-1, §1.3 |
| AC-4 | Revision-size bound: measure per-round byte growth; large growth re-escalates the panel | P-1 |
| AC-5 | Measurement-required routing: such findings are non-blocking and carried to the report | P-3 |
| AC-6 | A mechanised citation checker under `pdlc/workflows/lib/`, run by reviewers and authors | P-4 |

**The whole set is observable in-band.** AC-1 is an integer constant. AC-2 compares two integers the
reviewers already emit. AC-3 turns on which files exist on disk with which role slug and marker.
AC-4 compares two byte lengths of a file. AC-5 turns on the presence of a named markdown section.
AC-6 is a program with an exit code. None of the six requires anyone to settle, in prose, a fact about
the runtime that nobody has measured — which is precisely the failure mode (P-3) that killed the
predecessor's Phase R.

## 2. Users and value

The pdlc pipeline has three classes of actor. All three are affected.

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a review loop that stops when it stops making progress, so that a non-convergent phase costs me three rounds instead of five and I am told why. |
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so that a queue of ten features does not become a 3 MB corpus of specs nobody can read. |
| **US-03** | *As the operator*, I want the run report to tell me what stopped the loop and what remains unsettled, so that I can act on a halt without reading ten cross-review files and reconstructing a trajectory table by hand. |
| **US-04** | *As an authoring agent*, I want a clear rule for which findings I am expected to answer in prose and which I must not, so that I stop producing 25 KB of speculative mechanism per round in answer to questions that only a measurement can close. |
| **US-05** | *As a reviewing agent*, I want to know whether I am opening a document for the first time or checking the disposition of my own prior findings, so that I do not manufacture a fresh crop of findings in text that was written to answer me. |
| **US-06** | *As a maintainer of these documents*, I want `file:line` citation accuracy checked by a program, so that a class of defect a machine can find never consumes a human or agent review round again. |

**Value, stated concretely.** The predecessor's Phase R burned five rounds and produced a 165 KB
document that was accepted only by operator-directed manual convergence, outside the loop. Under the
six changes below, the same run would have halted at round 3 — the round its own fixed-point test
fired — with a post-mortem naming the two generator classes that were unmeasurable.

The saving is stated as a **range with its two regimes named**, because AC-3's saving is contingent on
AC-4's classification and the only run we have measured lands in the pessimistic regime (SE F-09,
TE F-03):

| Regime | When | Rounds run | Reviewer dispatches | Saving vs. the measured run (5 rounds × 2 reviewers = 10 dispatches, 165 KB) |
|---|---|---|---|---|
| **Pessimistic — every revision is large** | every round's growth exceeds 12,000 bytes, so AC-4.2 classifies **new-mechanism** and AC-3.1's exception re-escalates every round to the full panel. **This is what the predecessor's measured rounds (25.8 / 22.3 / 25.0 / 28.1 / 38.2 KB) would all have done.** | 3 | 6 | ~40% fewer dispatches and ~40% fewer bytes, from AC-1 alone. AC-3 contributes nothing. |
| **Target — AC-4.6's minimal-revision clause takes effect** | rounds 2 and 3 revise under one pacing write, so AC-4.2 classifies **incremental** and AC-3.1 dispatches a single verifier. | 3 | 4 | ~60% fewer dispatches and ~60% fewer bytes. |

**The pessimistic regime is the expected steady state at ship time**, and the REQ says so rather than
quoting the target figure as though it were predicted. Moving from one regime to the other is the job
of AC-4.6, which is a prompt clause and therefore directive rather than enforced (R-5); whether it
moves is the first thing the run report of AC-4.7 will show, per round, in bytes. The claim this REQ
makes unconditionally is the **pessimistic** row — it follows from AC-1 alone, which is one constant.

That is the whole claim; it is a claim about *cost and legibility*, not about making non-convergent
documents converge. **This REQ does not promise that more documents will reach approval.** It promises
that the ones that will not, fail faster and say why.

### 2.1 Non-user-visible? No — the operator sees all six

Every change surfaces to the operator through an artifact they already read:

| Change | Operator-visible surface |
|---|---|
| AC-1 | The round budget in the run report and in the post-mortem's Iterations table |
| AC-2 | A halt with a named reason, on a round the operator can see was non-decreasing |
| AC-3 | Cross-review files with a distinct role slug and a `REVIEW-MODE:` marker |
| AC-4 | A per-round growth figure in the loop's report |
| AC-5 | A `## Measurement Required` section in the cross-review, carried into the run report |
| AC-6 | A CLI the operator can run by hand, with an exit code and a list of bad citations |

## 3. Prerequisites

This REQ is stacked on `pdlc-review-loop-hardening`, which has now merged. That feature's shipped
mechanism is upstream input here, not something this REQ re-specifies.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | **Directory `docs/completed/pdlc-review-loop-hardening/` exists on the default branch** and contains that feature's `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES` and `LEARNINGS`; the archived queue row is recorded in `docs/completed/QUEUE-HISTORY-rows-0-1.md` as `Order 0`. **Satisfied at `9486c81`** (the artifacts were archived to `docs/completed/` by `7bc559a`, which is single-parent, not a merge commit — SE F-07). The v1.0 form of this row named a live `docs/_queue/QUEUE.md` row at `done`; that row was archived out of the live table when the feature completed, so the gate as first written was unevaluable (SE F-07). | Must hold at HEAD before FSPEC authoring for this feature begins |
| **BL-02** | `parseVerdict` returns machine-readable `{verdict, high, medium, low, malformed?}` | Symbol present in `pdlc/workflows/orchestrate-dev.js` (see §4 M-2a) | Must exist at HEAD before FSPEC authoring — AC-2 and AC-3 are stated over its output |
| **BL-03** | Per-round cross-review state is refreshed from the branch inside the loop, and `selectMode` computes an episode's mode from that state | Symbols `refreshReviewState`, `selectMode` present (§4 M-3e, M-3c) | Must exist at HEAD — AC-3's panel-shape decision is taken at the same seam |
| **BL-04** | Approval anchors (`APPROVAL-HASH:` / `REVIEWED-COMMIT:`) are appended to cross-review files on the terminal round | Symbol `appendApprovalAnchors` present (§4 M-4a) | Must exist at HEAD — AC-3's verifier-round approval marker is appended by the same writer |
| **BL-05** | `pdlc/workflows/lib/` exists as a home for non-bundled production libraries | Directory present, containing `document-oracles.mjs` (§4 M-6a) | Must exist at HEAD — AC-6's new library is a sibling of that file and inherits its "not in the bundle" classification |

**All five now hold on the default branch** at the Citation baseline commit `9486c81`, and each is
checkable there by the observable in its Resolution-form column. At v1.0 this paragraph said BL-01 was
*"the only one not yet satisfied on the default branch"* because the document was authored on a stacked
branch before `pdlc-review-loop-hardening` merged; that merge has since happened, the
feature's artifacts are archived under `docs/completed/pdlc-review-loop-hardening/`, and BL-02 …
BL-05's symbols all resolve on `main` (`pdlc/workflows/orchestrate-dev.js:393` `parseVerdict`,
`pdlc/workflows/orchestrate-dev.js:2358` `refreshReviewState`, `pdlc/workflows/orchestrate-dev.js:1436`
`selectMode`, `pdlc/workflows/orchestrate-dev.js:1934` `appendApprovalAnchors`,
`pdlc/workflows/lib/document-oracles.mjs`). The stacked-branch caveat is therefore **retracted, not
weakened**: the prerequisite table is a gate that passes today, and FSPEC authoring may begin against
it. Nothing in this REQ offers a fallback if that upstream mechanism is later reverted — AC-2, AC-3 and
AC-4 are stated over its seams and would lose them.

## 4. Measured facts

Every fact below was read from the working tree at the Citation baseline commit **`9486c81`** on
`main`. Each row names the **enclosing symbol** and a **distinctive literal** as well as the line, per
the drift convention in the header, and every path is written **repo-root-relative** — the form AC-6.4
check 1 resolves. These are the seams AC-1 through AC-6 attach to; a reviewer verifying this REQ should
verify these rows, not re-derive them from memory.

### 4.1 The round budget

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-1a** | The round budget is one module-scope constant. | `pdlc/workflows/orchestrate-dev.js:52`, module scope | `const MAX_REVIEW_ROUNDS = 5;` |
| **M-1b** | The **sole** site where the window *width* is expressed in terms of that constant is the helper `windowEnd`. Its own doc comment says so: *"This is the SOLE place in the module where the window width is expressed in terms of `MAX_REVIEW_ROUNDS`."* `reviewLoop` takes `endIndex` as a parameter and defaults it through this helper rather than recomputing the arithmetic. **`windowEnd` has exactly two callers**, and the v1.0 form of this row named neither correctly: `reviewLoop`'s own default, and `deriveRoundWindow` (M-1d). | `pdlc/workflows/orchestrate-dev.js:2215-2217`, function `windowEnd`; the `reviewLoop` default is applied at `pdlc/workflows/orchestrate-dev.js:1632`, inside the signature that opens at `pdlc/workflows/orchestrate-dev.js:1623`. (v1.0 attributed the default to `pdlc/workflows/orchestrate-dev.js:1574`; that line is inside the **non-convergence / post-mortem recorder**, not `reviewLoop` — SE F-04, MF-1.) | `return startIndex + MAX_REVIEW_ROUNDS - 1;` and `endIndex = windowEnd(startIndex),` |
| **M-1c** | Three further sites *read* the constant without doing width arithmetic: the non-convergence phase record, the post-mortem prompt's required-sections literal, and the returned `iterations` field. All three are value-sensitive but arithmetic-free. | `pdlc/workflows/orchestrate-dev.js:1581`, `pdlc/workflows/orchestrate-dev.js:1727`, `pdlc/workflows/orchestrate-dev.js:1773` | `MAX_REVIEW_ROUNDS` as an argument to `recordPhase`; `` `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` ``; `iterations: MAX_REVIEW_ROUNDS,` |
| **M-1d** | **`MAX_REVIEW_ROUNDS` is a per-invocation *budget* at HEAD, not an absolute cap on a document.** `deriveRoundWindow` computes the window's *start* from the cross-review basenames present on the branch — one past the highest existing round — and its *end* by adding the budget to that start. On a branch whose highest existing round is 3, a re-entered phase is therefore admitted rounds 4…6, and the document has been reviewed for six rounds. The function's own doc comment states this in terms. | `pdlc/workflows/orchestrate-dev.js:2151`, function `deriveRoundWindow`; the two lines at `pdlc/workflows/orchestrate-dev.js:2197-2198`; doc comment at `pdlc/workflows/orchestrate-dev.js:2129-2131` | `const startIndex = indices.length ? Math.max(...indices) + 1 : 1;` then `const endIndex = windowEnd(startIndex);`; doc comment *"Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET rather than an absolute cap"* |
| **M-1e** | The same relativity is restated on the halt path: the post-mortem recorder computes its `last` round from the same helper when no explicit end was given. | `pdlc/workflows/orchestrate-dev.js:1574`, inside the non-convergence recorder; the AC-5.1 comment at `pdlc/workflows/orchestrate-dev.js:1570-1572` | `const last = endIndex === undefined ? windowEnd(first) : endIndex;`; *"AC-5.1: the window is RELATIVE"* |

### 4.2 The counts AC-2 compares

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-2a** | `parseVerdict` returns `{verdict, high, medium, low, malformed?}` — the blocking counts are already machine-readable, parsed from the reviewer's trailing `{"high": N, "medium": N, "low": N}` JSON object. **It is a function of an agent *response*, not of a file**, so its result lives only in the invocation that took it. | `pdlc/workflows/orchestrate-dev.js:393`, function `parseVerdict` | `export function parseVerdict(result, skillName)`; JSDoc `@returns {{ verdict: string, high: number, medium: number, low: number, malformed?: boolean }}` |
| **M-2b** | `malformed: true` is set **only** when the trailer is missing or unparseable. Its doc comment is explicit that a genuine parse — *"including the truncated-output zero-counts case"* — never sets it. | JSDoc immediately above `pdlc/workflows/orchestrate-dev.js:393`; the `fallback` object literal is inside the function body, below the signature | `malformed: true,` in `const fallback = { verdict: "Needs revision", high: 0, medium: 0, low: 0, malformed: true }` |
| **M-2c** | The truncated-output path returns **genuine zero counts** and no `malformed` flag, so `0/0/0` is a real observation, not an absence. | `pdlc/workflows/orchestrate-dev.js:451`, inside `parseVerdict` | `return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };` |
| **M-2d** | A malformed trailer already has a cheap recovery path: a second, small-model pass over the raw reviewer output. | `pdlc/workflows/orchestrate-dev.js:2824`, function `recoverVerdict` | `export async function recoverVerdict({ reviewer, rawResult, _agent = agent })` |
| **M-2e** | **There is a file-side reader of the same trailer, and it already exists.** `extractFileVerdict` locates a cross-review file's trailing `## Verdict` section, feeds it to `parseVerdict`, and returns the same `{verdict, high, medium, low, malformed?}` shape. Counts are therefore recoverable from a file **that carries the trailer** — which today's SKILLs do not require it to (M-2f). | `pdlc/workflows/orchestrate-dev.js:888`, function `extractFileVerdict` | `function extractFileVerdict(fileText, roleSlug)`; `if (/^\s*##\s+Verdict\s*$/.test(line)) headingIndex = index;` |
| **M-2f** | **The branch-side state the loop rebuilds each invocation discards the counts.** `refreshReviewState` reads only the *candidate* round's files, and the record it builds keeps `verdict`, `verdictReadable`, `anchorHash`, `anchorReason` and `path` — no `high`, no `medium`, no `low`. Round N−2 and earlier are never read at all. So on a re-entered phase there is no in-memory left operand for AC-2, and today no on-disk one either. | `pdlc/workflows/orchestrate-dev.js:2358`, function `refreshReviewState`; candidate at `pdlc/workflows/orchestrate-dev.js:2390`, the skip at `pdlc/workflows/orchestrate-dev.js:2397`, the record at `pdlc/workflows/orchestrate-dev.js:2401-2407` | `const candidate = window.startIndex - 1;`; `if (parsed.round !== candidate) continue;`; `reviewFiles.set(...{ verdict, verdictReadable, anchorHash, anchorReason, path })` |
| **M-2g** | **The count trailer is required in the reviewer's *response*, not in the reviewed file.** The three review SKILLs instruct the reviewer to *"append the following two lines as the last content of your **response**"*; the repo's documented **file** contract is the trailing `## Verdict` section and its single `VERDICT:` line. A correctly written cross-review file may therefore carry no trailer at all — in which case `extractFileVerdict` → `parseVerdict` takes the truncated-output path (M-2c) and returns **genuine `0/0/0`**, indistinguishable from a perfect round. | `pdlc/skills/se-review/SKILL.md:206`, `pdlc/skills/te-review/SKILL.md:231`, `pdlc/skills/pm-review/SKILL.md:192`; and `CLAUDE.md` § *Artifact convention*, the `## Verdict` data contract | *"append the following two lines as the last content of your response"*; *"the section must carry exactly one `VERDICT: {value}` line"* |

### 4.3 The panel AC-3 reshapes

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-3a** | `reviewLoop` hardcodes **exactly two** reviewers. The results are two named bindings, and the reviewer array is indexed positionally at `[0]` and `[1]`. | `pdlc/workflows/orchestrate-dev.js:1623` (`reviewLoop` signature), `pdlc/workflows/orchestrate-dev.js:1710` (bindings), `pdlc/workflows/orchestrate-dev.js:1803-1812` (dispatch) | `let result1, result2;`; `reviewers[0]` / `reviewers[1]`; `const [r1, r2] = await _parallel([...])` |
| **M-3b** | The per-round cross-review path is derived from the reviewer's role slug and the round number, so a new reviewer role writes a file the existing machinery already indexes. | `pdlc/workflows/orchestrate-dev.js:1697`, arrow `reviewTargetPath` | `` `docs/${feature}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${reviewFileType}-v${round}.md` `` |
| **M-3c** | `selectMode` rule 2 requires **every** role in `present` to approve at the *same* round before that round is considered discharged. Its `dualApproved` predicate is `roles.every(...)` over the roles observed in `present`. | `pdlc/workflows/orchestrate-dev.js:1436` (`selectMode` signature) and the `dualApproved` arrow at `pdlc/workflows/orchestrate-dev.js:1466` | `const dualApproved = (round) => roles.length > 0 && roles.every((role) => {...})` |
| **M-3d** | `tier1ApprovalRecord` treats **a lone file at the candidate round as role asymmetry and yields no approval**. It is a **plain (non-`async`) function declaration**, unlike its neighbour M-3f's `tier2ApprovalRecord`, which is `async`; the asymmetry is real and is named here so a reader does not infer symmetry (SE MF-3). This is deliberately fail-closed against a dual round one of whose reviewers crashed. | `pdlc/workflows/orchestrate-dev.js:2478` (function `tier1ApprovalRecord`), `pdlc/workflows/orchestrate-dev.js:2490` (the asymmetry test) | `// Role-asymmetry: one reviewer wrote the candidate round and the other did not.` followed by `if (records.some((r) => r === null)) return noApprovalRecord(candidate);` |
| **M-3e** | The state `selectMode` and the approval records read is refreshed **from the branch, inside the loop**, once per episode. | `pdlc/workflows/orchestrate-dev.js:2358`, function `refreshReviewState` | `async function refreshReviewState({ feature, docType, _listFiles, _readFile })` |
| **M-3f** | Tier 2 — the LEARNINGS approval record — is a separate, later reader of the same approvals. It is a **standalone function declaration**, not a method; v1.0 quoted it in method form, which is the very defect shape §1.2 P-4 names (TE MF-01). | `pdlc/workflows/orchestrate-dev.js:2528`, function `tier2ApprovalRecord` | `async function tier2ApprovalRecord({ feature, docType, candidate, reviewers, _readFile })` |

### 4.4 The approval anchors AC-3 extends

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-4a** | On the terminal round the loop appends a two-line anchor block to each approving cross-review file. This is an existing writer of durable, in-file, machine-read markers — AC-3's verifier marker is a third line in the same block, written by the same function. | `pdlc/workflows/orchestrate-dev.js:1934` (function `appendApprovalAnchors`), append at `pdlc/workflows/orchestrate-dev.js:1975` | `` `\nAPPROVAL-HASH: ${hash}\nREVIEWED-COMMIT: ...` `` |
| **M-4b** | The anchor pre-count is a count **and** a comparison: 0 ⇒ append; 1 equal ⇒ idempotent no-op; 1 unequal ⇒ error, no approval; ≥ 2 ⇒ history ambiguous, no approval. Nothing here throws. | JSDoc immediately above `pdlc/workflows/orchestrate-dev.js:1934`, and function `approvalAnchorPreCount` at `pdlc/workflows/orchestrate-dev.js:1915` | `if (existing.length >= 2) {`; `/^APPROVAL-HASH:\s*(\S+)\s*$/` |

### 4.5 The growth AC-4 measures

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-5a** | `12000` already exists in the module as the per-tool-call authoring emission ceiling, and is the figure the runtime prompt states to every wrapped authoring dispatch. | `pdlc/workflows/orchestrate-dev.js:56` (constant) and `pdlc/workflows/orchestrate-dev.js:2279` (`PACING_CONTRACT_CLAUSE`) | `const MAX_AUTHORING_WRITE_BYTES = 12000;`; `"section per edit, keep every single write under 12,000 bytes, and commit after"` |
| **M-5b** | There is already an **advisory** post-dispatch check that shells `git diff --numstat` and compares *added lines* against that byte constant, emitting a note and never halting. AC-4 does **not** reuse it: it compares lines to a byte figure, and it is scoped to one dispatch, not to a round. AC-4's measurement is a byte length of the document, taken from a read. | `pdlc/workflows/orchestrate-dev.js:2724-2743`, function `advisoryPacingCheck` | `result = await _git(["diff", "--numstat", "--", targetPath]);` and `"only — it is a proxy, not an oracle, and never a halt condition."` |
| **M-5c** | The loop already reads the document's text through an injected reader on the same seam AC-4 needs, so no new IO primitive is required. | `pdlc/workflows/orchestrate-dev.js:1623` (`reviewLoop`) and `pdlc/workflows/orchestrate-dev.js:2358` (`refreshReviewState`), the threaded `_readFile` parameter | `_readFile` |

### 4.6 The library AC-6 adds

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-6a** | `pdlc/workflows/lib/` exists and holds exactly one file today: `document-oracles.mjs`. It is **production code with no side effects on import** — its header says so, and every export is a pure function of a `root` directory path, with no `process.cwd()` and no `import.meta.url`-derived paths. It names *"a future CLI"* among its intended callers. | `pdlc/workflows/lib/document-oracles.mjs:1-12`, module header | `"Production code, no side effects: every exported function is a pure"` |
| **M-6b** | That library is **not** part of the runtime bundle. `build-runtime.mjs` refers to it only in a comment about keeping two exact strings in step. AC-6's new library is the same class. | `pdlc/workflows/build-runtime.mjs:237`, comment | `` // `coveredViolations` (pdlc/workflows/lib/document-oracles.mjs) `` |
| **M-6c** | `build-runtime.mjs` is itself **import-unsafe** (it acts on import), which is why a new checker must be a separate module rather than an addition to the builder. Recorded in `LEARNINGS-pdlc-review-loop-hardening.md` §2 and §5.3, citing `pdlc/workflows/__tests__/runtimeBundle.test.js:18` (`import { stripModuleSyntax } from "../build-runtime.mjs";` — the import that makes the unsafety observable) and `CODEBASE-v2 §7(a)`. | `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` §2, §5.3 | `` **`build-runtime.mjs` import-unsafe** `` |
| **M-6d** | The workflow test suite is jest under `--experimental-vm-modules`; a new `lib/` module is testable by the existing `npm test` with no tooling change. | `pdlc/workflows/package.json:6-9`, `scripts` | `"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"` |

### 4.7 What is deliberately **not** measured here

Two facts this REQ does **not** claim, and does not need:

- **How an exhausted retry or a stall-killed dispatch surfaces to the caller.** **Unmeasured at the
  Citation baseline `9486c81`**, and unmeasured anywhere on `main` — the predecessor REQ recorded it as
  unmeasured in its §4a A-8, and nothing has measured it since. (v1.1 pinned this claim to `d11dad5`,
  which the header itself declares unreachable from `main`, so the claim could not be checked from
  where this document is reviewed — SE F-06, MF-1.) No AC below depends on it.
- **Whether a partial write is visible on disk before its commit.** Also unmeasured at `9486c81`. AC-4's growth
  measurement is taken at a **round boundary — after the optimizer episode has returned**, which is the
  single boundary AC-4.1 also names. v1.0 said *"returned"* in AC-4.1 and *"returned and committed"*
  here; the two are not the same boundary and the difference was load-bearing (TE F-08). **The boundary
  is "returned"**, everywhere, and it is stated once in AC-4.1. The measurement therefore does not
  depend on intra-dispatch write visibility, and it does not depend on the episode having committed.

Both are named here so that a reviewer can check the claim in §1.4 — that no AC turns on an unmeasured
runtime fact — against the two specific unmeasured facts that killed the predecessor.

**What §4.7 did not cover, and now does.** Round 1 of cross-review found that all three High findings
were about a third axis this section missed: not *unmeasured runtime behaviour*, but **in-process state
that does not survive an invocation boundary**. §4.1's M-1d, §4.2's M-2f and §5's durability table are
the answer; the axis is named here so a later reader does not read §4.7 as a completeness claim it
never made.

## 5. Acceptance criteria

Six requirements. Every acceptance criterion is in Who / Given / When / Then form and is stated over
an in-band observable named in §4.

**Vocabulary used throughout §5.** These three terms are defined once and used with exactly these
meanings:

| Term | Definition |
|---|---|
| **blocking count** of a round | The sum of `high` + `medium`, over every reviewer whose cross-review file exists at that round, **read from the file** by `extractFileVerdict` → `parseVerdict` (M-2e), not from the agent response. A round for which any dispatched role's count cannot be read from its file has **no blocking count** — see *unavailable* below. |
| **panel shape** of a round | The *set of reviewer role slugs whose cross-review files exist on the branch at that round*. Exactly **two** sets are canonical: `{software-engineer, test-engineer}` (dual) and `{verifier}` (single verifier). Panel shape is read from the **role slugs alone** — every round writes them, including a round on which every reviewer filed *Needs revision*, because the slug is part of the filename the path derivation composes (M-3b). It is **not** the set of roles dispatched (nothing records a dispatch), and it does **not** turn on the `REVIEW-MODE:` marker: v1.1 defined it that way and the marker is written only into the anchor block, so a *failed* verifier round would have read as shapeless (SE F-02). Two rounds have equal panel shape iff their slug sets are equal **and** neither is a *crashed* round (AC-2.4). |
| **crashed** round | A round whose on-disk role-slug set is **not** one of the two canonical sets — i.e. a strict subset of a canonical set (one file whose slug is `software-engineer` or `test-engineer` and no second panel file), the empty set, or any other set (e.g. `{verifier, test-engineer}`). A crashed round's panel shape is **undetermined**; it is never comparable and never a baseline (AC-2.4), and it never yields an approval (M-3d, AC-3.5(b)). The predicate is decided by the directory listing and nothing else, so it is total, computable on every round, and independent of any round's verdict. |
| **round growth** *into* round N | `bytes(t0 of round N) − DOC-BYTES(N−1)` — the byte length of the reviewed document as **round N's** reviewers are about to be given it, minus the durable anchor of round N−1 (AC-4.1). The **earlier** endpoint is durable and in the past; the **later** endpoint is the one read at round N's open, in the single read AC-4.1 and AC-2.8 share. It therefore selects **round N's own** panel — the revision a cold reader must actually read is the revision that is classified. v1.2 stated both endpoints as past anchors and selected round N+1's panel from them, which classified the *previous* revision and left round 2 permanently unclassifiable, since there is no `DOC-BYTES(0)` (TE v4 F-01). |
| **current window** | The rounds admitted by AC-1 since the last **granted** window: `{W … W+2}`, where `W` is the window origin AC-1.5(4) resolves (1 when no reset has been granted). "Since the last operator reset" was wrong for the S-11 path, where a clearance is honoured and `W` is deliberately unchanged (TE v5 MF-08). Round `W` is the **first round of the window** and is treated exactly as round 1 is: it is the full panel (AC-3.1), it is not compared (AC-2.1), it is not tested for zero-delta (AC-2.8), and its growth is not measured (AC-4.1). A round whose predecessor is in an earlier window has no comparable predecessor, exactly as round 1 has none. |
| **reset region** | The section headed exactly `## Reset Region` (S-12) in `POSTMORTEM-{phase}-{feature}.md`, from that heading to the next top-level heading or end of file, **outside any fenced block** — the same scoping rule `scanLines` already applies. It is the only place `HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` lines are read from, so a line quoted in a post-mortem's prose or Recommendation counts for nothing (TE v5 Q-07). It is machine-written and machine-maintained (AC-1.4); the operator's `RESOLVED:` marker is **not** in it and is never counted. |
| **zero-delta** round | A round N ≥ 2 **of the current window** whose reviewed document is byte-and-hash identical to the document reviewed at round N−1 — `bytes(t0 of round N) = DOC-BYTES(N−1)` **and** `sha256(t0 of round N) = DOC-SHA256(N−1)`. It is not a small revision; it is *no revision*, and it is a halt (AC-2.8), not a consumed round. |
| **unavailable** | A quantity that no reader can obtain from the branch — distinct from **malformed**, which is a quantity that was read and could not be parsed. Both break AC-2's comparison chain, and the run report distinguishes them (AC-2.3, AC-2.7). |

**Durability: what survives an invocation boundary.** Round 1 of cross-review found three High
findings that were one question — the loop *re-derives its state from the branch on every invocation*
(M-2f, M-1d), so any AC stated over in-process state is undefined on a resumed phase, which is the
normal case. Every quantity this REQ's ACs read is therefore listed here with its durable home. **An AC
stated over a row marked *in-process only* is a defect in this document.**

| Quantity | Read by | Durable home | If absent |
|---|---|---|---|
| Round index N | AC-1, AC-2, AC-4 | The `CROSS-REVIEW-{role}-{doc}-v{N}.md` basenames on the branch, via `deriveRoundWindow` (M-1d) | n/a — the listing is always readable |
| Highest round reached for a document | AC-1.5 | Same basenames | Treated as 0; the window opens at round 1 |
| **First round of the current window** (the post-reset offset) | AC-1.5(4), AC-1.1, AC-2.1, AC-2.8, AC-3.1, AC-4.1 | The `WINDOW-START: {N}` lines in the **reset region** — the region AC-1.4 requires every halt to preserve. The origin is the **greatest** value present, and only if every line in the region validates (AC-1.5(4)'s ordered algorithm) | Treated as **1** — no reset is in effect and AC-1.1's absolute cap applies from round 1. Fail-closed: an absent, unparseable, non-increasing or out-of-range value never widens the window. **Survives a second halt** because AC-1.4 requires the halt path's rewrite to preserve the region |
| **Whether a clearance is still unanswered** (the reset is one-shot) | AC-1.5(4), AC-1.5(5) | The **counts**, in that region, of `H` = `HALT-REASON:` lines and `A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines. A clearance is unconsumed exactly when a `RESOLVED: yes` is readable **and** `A < H` | `A = H` ⇒ every halt so far has been answered; the loop writes nothing and grants nothing. Counting halts against answers, rather than counting the human's `RESOLVED:` lines, is what keeps one-shot true on a file whose `RESOLVED:` line is single-valued by `parseResolvedMarker`'s own contract (SE v5 G-07, TE v5 F-01/F-02) |
| **Whether the operator has cleared the current halt** | AC-1.4's re-entry gate (shipped), AC-1.5(4) | The **single** `RESOLVED:` line in the post-mortem, read by `parseResolvedMarker` (`pdlc/workflows/orchestrate-dev.js:953`, `values.length > 1 ⇒ {ok: false, reason: "duplicated"}` at `:961`) and mapped by `checkPostmortem` (`:2440`; `resolved` only when `marker.ok && marker.resolved`, `:2446`, everything else `unresolved`, `:2447`) | absent, `no`, unparseable **or duplicated** ⇒ the phase is refused — the shipped fail-closed gate, unchanged. AC-1.4 keeps it exact by having each halt **strip** any prior `RESOLVED:` line, so the file never carries two and a cleared halt never clears the next one |
| `blocking(N)` | AC-2.1 | The **count trailer inside the round's cross-review files**, required there by AC-3.4 and read by `extractFileVerdict` (M-2e) | *unavailable* — AC-2.7 |
| Panel shape of round N | AC-2.4, AC-3.1 | The **role slugs of the files at round N**, and nothing else | *crashed* — not comparable |
| `bytes(document as reviewed at round N)` | AC-4.1, AC-2.8 | The `DOC-BYTES: {n}` anchor line in the round's cross-review files, written by AC-4.1's unconditional per-round writer. Only the **earlier** endpoint of a growth measurement is ever read from an anchor; the later endpoint is read live at round-open | growth *unmeasurable* — AC-4.5 |
| `sha256(document as reviewed at round N)` | AC-2.8 | The `DOC-SHA256: {64 hex}` anchor line beside it, same writer, same round, same read | AC-2.8's zero-delta test is **not evaluated** and the round proceeds — fail-open, because a missing anchor must not manufacture a halt |
| **Which halt a POSTMORTEM records** | AC-1.5(4), AC-1.5(5), AC-2.8 | The **last** `HALT-REASON: {string}` line in the reset region (S-12) — one line per halt, **appended to the end of the region**, so document order is halt order | Read as a convergence halt (S-3/S-4) — fail-closed, so an unreadable reason never converts a consuming reset into a free one |
| Approval at round N | AC-3.5 | `APPROVAL-HASH:` / `REVIEWED-COMMIT:` / `REVIEW-MODE:` anchors (M-4a) | no approval — fail-closed |
| Prior rounds' finding ids | AC-3.2(1) | The `## Disposition` section of the verifier's file (AC-3.2) | the disposition is incomplete — AC-3.2 |

Nothing in this table is *in-process only*. Where a quantity had no durable home at HEAD — the blocking
counts and the byte anchor — this REQ gives it one, on a surface that already exists for exactly this
purpose: the cross-review file's `KEY: value` anchor block (M-4a, M-4b).

**Closed catalogue of boundary-crossing strings.** DC-01 requires every string that crosses a component
boundary to be a **closed catalogue on the emitting side and a total function on the receiving side,
before FSPEC authoring**. This REQ introduces **fourteen**. All fourteen are fixed here — id, exact
emitted form, emitter, receiver, and the receiver's behaviour on **every** input outside the catalogue.
FSPEC may not add a fifteenth without amending this table.

Two **writers** appear in the Emitter column and they are deliberately different functions:

| Writer | When it runs | What it writes |
|---|---|---|
| `appendApprovalAnchors` (M-4a), unchanged | the **approving terminal round only**, inside the existing `gatePass` branch | `APPROVAL-HASH:`, `REVIEWED-COMMIT:` |
| **`appendRoundAnchors`** — new, named by AC-4.1 | after **every** round's reviewers return, whatever verdict they returned, before **AC-2.1** is evaluated. (Not "before AC-2": AC-2.8 is evaluated at round-open, *before* this writer runs for that round — TE v4 MF-05) | `DOC-BYTES:`, `DOC-SHA256:`, and on a verifier round `REVIEW-MODE: verification`, into each of the round's files **that exist** — zero files on a wholly crashed round, one on a partly crashed one (TE v4 Q-05) |

v1.1 assigned all five lines to `appendApprovalAnchors`. That function has one call site and it is
inside `if (gatePass)`, so on a failed round none of the five was written — and a failed round is the
only kind AC-2 compares and AC-4 measures (SE F-01, TE F-01). The split is the fix, and it is
REQ-altitude because it decides which panel gets dispatched.

Ids are stable once assigned, so the ones added in v1.2 and v1.4 keep the next free numbers; the table
is therefore ordered **by kind** and not by id, so `S-10` … `S-14` sit beside their kin rather than at
the end. The five kinds, in the order the rows appear: **anchor lines** (S-1, S-2, S-10), **halt
reasons** (S-11, S-3, S-4), **report notices** (S-5, S-6), **section headings and fields** (S-7, S-8,
S-9, S-12), **reset-region lines** (S-13, S-14, and the `HALT-REASON:` render inside S-12's row) — SE
v4 MF-3.

**How a halt reason reaches a later invocation.** S-3, S-4 and S-11 are read by a human in the run
report and by the loop itself on the next entry (AC-1.5(5) must know which halt it is clearing). Each
halt therefore writes **exactly one** `HALT-REASON:` line into the reset region, appended at the end of
it. v1.3 called that line "a rendering, not a twelfth catalogue member"; it has a grammar, an emitter, a
receiver and a fail-closed receive side — all four columns — so v1.4 gives it a row of its own inside
S-12 and a §6 entry, and states its value grammar once (SE v5 MF-2, TE v5 F-06).

| id | Exact string | Emitter | Receiver | Receiver is total because |
|---|---|---|---|---|
| **S-1** | `REVIEW-MODE: verification` — one line, that exact casing and spacing, in the anchor block | **`appendRoundAnchors`**, on every verifier round (AC-3.5(a)) | `tier1ApprovalRecord` (M-3d) — the **approval** path only. AC-2.4's panel-shape read no longer consults it | AC-3.5(e) states all **six** rows of its table: absent on a lone file, one exact match, one line with any other value, two or more lines in one file, a marker on more than one file of the same round, and a marker on a dual round's file beside an unmarked second file. (v1.1's lead-in said "five" against a six-row table — TE F-05.) |
| **S-2** | `DOC-BYTES: {n}` — one line, `{n}` a decimal integer ≥ 0, no separators | **`appendRoundAnchors`**, every round (AC-4.1) | AC-4.1's growth computation; AC-2.8's zero-delta test | AC-4.1 states **four inputs producing three reasons**: no anchor (`no-anchor`); an unparseable value and two-or-more unequal lines (both `unreadable-anchor`); a non-document target (`non-document-target`) ⇒ *unmeasurable* ⇒ AC-4.5. Two or more **equal** lines is an idempotent re-write (M-4b's rule) and reads as one value; **negative growth is measurable and normal** (TE MF-02) |
| **S-10** | `DOC-SHA256: {64 lower-case hex}` — one line, in the same anchor block; the value is `sha256Hex`'s digest, i.e. taken over `canonicaliseForDigest`'s output, and is rendered **bare** (no `sha256:` prefix, unlike `APPROVAL-HASH:`) | **`appendRoundAnchors`**, every round (AC-4.1) | AC-2.8's zero-delta test | AC-2.8 states all four: absent, unparseable, two or more unequal lines, and equal to the previous round's value. The first three ⇒ the test is **not evaluated** and the round proceeds (fail-open, so a missing anchor cannot manufacture a halt); the fourth ⇒ halt with S-11 |
| **S-11** | Halt reason `no-revision: round {N} document identical to round {N-1}` | AC-2.8's halt path | the post-mortem prompt and the run report (AC-2.2) | a single format string with two round-index slots; nothing else is emitted on this path |
| **S-3** | Halt reason `fixed-point: round {N} blocking {b(N)} >= round {N-1} blocking {b(N-1)}` | AC-2's halt path | the post-mortem prompt and the run report (AC-2.2) | it is a single format string with two integer and two round-index slots; nothing else is emitted on this path |
| **S-4** | Halt reason `budget-exhausted: rounds {first}..{last} of {MAX_REVIEW_ROUNDS}` — **rendered**, three integer slots, no constant *name* in the user-facing string: e.g. `rounds 1..3 of 3`, or `rounds 4..6 of 3` after an AC-1.5(4) reset moved the window origin | the existing budget halt (AC-1.4) | same two readers | same. (v1.1 showed `{MAX_REVIEW_ROUNDS}` interpolated by name here and the rendered form in AC-1.5; v1.2 over-corrected to a single specimen, so the general form was stated nowhere and a reset window's render was underivable — SE MF-4, SE v4 MF-1, TE v4 F-05.) |
| **S-5** | Report notice `not-comparable: {reason}` where `{reason}` ∈ `{malformed-count, unavailable-count, unequal-panel-shape, crashed-round}` — a closed four-member enum | AC-2.3, AC-2.4, AC-2.7 | the run report row of AC-4.7 | the enum is closed here; a reason outside it is a defect, not a fallback |
| **S-6** | Report notice `growth-unmeasurable: {reason}` where `{reason}` ∈ `{no-anchor, unreadable-anchor, non-document-target}` — a closed three-member enum | AC-4.5 | the run report row of AC-4.7 | same |
| **S-7** | Section heading `## Measurement Required`, exactly | the three review SKILLs (AC-5.2) | AC-5.4's extraction | AC-5.5 states absent ⇒ contributes nothing, never an error; a malformed body is carried verbatim |
| **S-8** | Section heading `## Disposition`, exactly | the verifier (AC-3.2) | AC-3.2(1)'s completeness check and the run report | AC-3.2 states all five cases: absent, unmatched prior id, unknown id, out-of-set disposition value, and the section on a dual round |
| **S-12** | Section heading `## Reset Region`, exactly, plus the `HALT-REASON: {value}` lines inside it. `{value}` is the **`; `-joined render, in AC-4.7's precedence order, of every halt reason that halt raised** — `no-revision: …` alone, or `fixed-point: …`, or `budget-exhausted: …`, or `fixed-point: …; budget-exhausted: …`. **One line per halt**, appended at the end of the region | every halt path (AC-1.4, AC-1.5(5)) | AC-1.5(5)'s clearance decision; a human reading the post-mortem | AC-1.5(5) states all four cases of the **last** such line: begins `no-revision:`; begins `fixed-point:` or `budget-exhausted:`; absent; anything else — the last two treated as a convergence halt, fail-closed. An absent `## Reset Region` heading is read as an empty region: `H = A = 0`, `W = 1`, no reset in effect |
| **S-13** | `WINDOW-START: {N}` — one line, `{N}` a decimal integer ≥ 1, in the reset region | the loop, on the entry that grants a convergence-halt clearance (AC-1.5(4)) | AC-1.5(4)'s window-origin resolution; the `A` count | AC-1.5(4)'s ordered algorithm is total over every region: any line that fails validation ⇒ `W = 1`, fail-closed; otherwise `W` is the greatest value |
| **S-14** | `WINDOW-RESUMED: {W}` — one line, `{W}` a decimal integer ≥ 1 equal to the origin then in effect, in the reset region | the loop, on the entry that clears an S-11 halt (AC-1.5(5)) | the `A` count; AC-1.5(4)'s validation | same algorithm: a `WINDOW-RESUMED:` value that is not a decimal integer ≥ 1, or that does not equal the resolved `W`, ⇒ `W = 1`, fail-closed. It never moves the origin — it only answers a clearance, which is exactly what distinguishes resuming from resetting |
| **S-9** | Findings-table field `New-mechanism: {section or clause reference}` on every blocking finding a verifier raises | the verifier (AC-3.2(2)) | **the verifier itself**, when it composes its own count trailer; and a human or the citation checker reading the file. **Not** the loop: no component deducts anything from the trailer | AC-3.2(2) states the rule as **directive to the emitter**: a verifier does not count a finding it cannot bind to new mechanism, so the trailer it writes already excludes it. The receive side is therefore the ordinary S-2/trailer receive side and needs no new grammar (SE F-03, TE F-03). R-5 records that this half is unenforced |

The **run-report row schema** these notices land in is fixed by AC-4.7 and is part of this catalogue:
one row per round, columns `round | panel-shape | blocking | growth-bytes | classification | notice`,
`notice` a **possibly-empty list** of S-3 … S-6 and S-11 in the precedence order AC-4.7 fixes. O-8
specifies where it is emitted, not what its columns are.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Phase:** 1 · **Source:** US-01, US-02 · **Depends on:** BL-01

A review loop that has not converged in three rounds has, on the two features measured, not converged
at all: the predecessor's blocking count reached its minimum at round 2 and rose thereafter, and 66 KB
— 40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired.
Three rounds buys the decay that was real (11 → 6) and declines to buy the plateau that was not.

**AC-1.1 — The budget is three, per document, not per invocation.**
*Who:* the pipeline. *Given:* any review-loop phase for a document. *When:* the review window is
opened. *Then:* the window ends at round **3 counted from round 1 of that document**, and the loop
halts on entering round 4 — *whatever invocation opened the earlier rounds*.

This is a **second behavioural change**, and v1.0 did not say so. At HEAD `MAX_REVIEW_ROUNDS` is a
*per-invocation budget*: `deriveRoundWindow` starts the window one past the highest round already on
the branch and then adds the budget to that start (M-1d), so a phase re-entered on a branch whose
highest round is 3 is admitted rounds 4…6 — a fourth round *does* dispatch reviewers, and the document
is reviewed six times. Under the relative rule, three-rounds-per-invocation bounds nothing about a
document, and §2's cost claim would be stated over a number that does not bound the thing it costs.
AC-1.5 states the replacement rule and its one escape hatch.

**AC-1.2 — One constant, one arithmetic site.**
*Who:* a maintainer. *Given:* the module at `pdlc/workflows/orchestrate-dev.js`. *When:* they change
the budget. *Then:* they change exactly one module-scope constant (M-1a) and no arithmetic anywhere
else, because the sole site that expresses the window *width* in terms of that constant is `windowEnd`
(M-1b). The three value-reading sites at M-1c must continue to report the *effective* budget, so a
halt message that says "5" while the budget is 3 is a defect.

**AC-1.3 — The reduction is not silently partial.**
*Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:*
the post-mortem's Iterations section and the phase record both state **three**, and the returned
`iterations` field is consistent with them.

**AC-1.4 — Existing halt behaviour is unchanged in kind.**
*Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts. *Then:* it halts the
way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write rather than
trusting the agent's reply, and refusing to re-run the phase until a human writes `RESOLVED: yes`.
This REQ changes *when* the halt happens, not *what* a halt is.

**Two things about that write do change, because this REQ puts machine-written state in that file.**
`POSTMORTEM-{phase}-{feature}.md` is a **fixed** path — it is not versioned as `CROSS-REVIEW-…-v{N}` and
`CODE_REVIEW-…-v{N}` are — so a document that halts twice has its post-mortem written twice, and the
reset region (§5, S-12) lives there. Therefore, on **every** halt that finds an existing post-mortem:

1. **the reset region is preserved** — every `WINDOW-START:` (S-13), `WINDOW-RESUMED:` (S-14) and
   `HALT-REASON:` line already in `## Reset Region`, in document order — and the halt **appends its own
   `HALT-REASON:` line to the end of that region**, so document order is halt order and AC-1.5(5)'s
   *"the last `HALT-REASON:`"* means *"the most recent halt's"* (SE v5 G-11). Nothing is written above
   the preserved lines and nothing between them;
2. **any `RESOLVED:` line already in the file is stripped**, wherever it sits. The new post-mortem is
   therefore **unresolved on arrival**, and the operator must clear *this* halt before the phase runs
   again.

Clause 2 is not fastidiousness; without it the mechanism is broken in both directions, because
`RESOLVED:` is a **single-valued, human-owned, fail-closed marker** and never a counter.
`parseResolvedMarker` (`pdlc/workflows/orchestrate-dev.js:953`) collects **every** unfenced
`RESOLVED:` line — its JSDoc says the marker is positionally unconstrained — and returns
`{ok: false, reason: "duplicated"}` for more than one (`:961`); `checkPostmortem` (`:2440`) returns
`resolved` only for `marker.ok && marker.resolved` (`:2446`) and `unresolved` otherwise (`:2447`), and
the step-G refusal every phase-running exit converges on reads exactly that (`:3895-3901`, literal
*"Phase … refused: unresolved POSTMORTEM"*). So a preserved single `RESOLVED: yes` would make the
**next** halt's post-mortem read as already resolved — step G would never refuse, and the halt would
have no durable effect at all — while a *second* `RESOLVED: yes` reads as `duplicated` ⇒ permanently
`unresolved` ⇒ the phase could never be re-entered. Those were the only two reachable states of v1.3's
rule and they are opposite failures (SE v5 G-07, TE v5 F-02). Stripping the spent marker is the
fail-closed choice and keeps the shipped reader exact.

**This does not weaken clause 3's prohibition.** What no agent and no script may ever write is
`RESOLVED: yes`; removing a marker that has already been spent is not writing one, and its only effect
is to *refuse* a phase that would otherwise have run unattended. N-4 is amended accordingly.

**The region is maintained by the loop, not by an agent's diligence.** At the Citation baseline the
halt path dispatches an agent with a bare `Write {path}` prompt and no preservation obligation of any
kind (`pdlc/workflows/orchestrate-dev.js:1725-1730`, inside **`reviewLoop`**, local `postmortemPrompt`,
literal *"Write ${postmortemPath}."* plus a section list — v1.3 cited this as `writePostmortem` at
`:1912-1918`, which is the range at `main` and a symbol that exists at neither commit: SE v5 MF-1,
TE v5 F-05). Rather than trust a prompt with load-bearing state, the loop reads the existing file
before the dispatch and **re-applies** the region deterministically after it: preserved lines,
this halt's appended `HALT-REASON:`, any prior `RESOLVED:` stripped. O-5 carries that read-modify-write
and its confirmation; O-9(d) keeps the prompt clause as a belt-and-braces measure, not as the
mechanism. This also removes the dependency TE v5 MR-05 asks to measure — whether an agent reliably
preserves an arbitrary region — from the correctness of AC-1.5. Whether the seam appends or rewrites
remains an implementation question (TE v4 MR-04); the **obligation** is stated here because the datum
is REQ-level durable state.

**AC-1.5 — The window is absolute, and only an operator resets it.**
*Who:* the review loop. *Given:* a phase whose document already carries cross-review rounds on the
branch — the state `deriveRoundWindow` reads (M-1d). *When:* the phase is (re-)entered. *Then:*

1. the window's **end** is round 3 counted from the window's **origin** `W` (clause 4; `W = 1` when no
   reset is in effect), not from the highest existing round: with `W = 1`, a branch whose highest
   existing round is 2 is admitted **round 3 only**, and a branch whose highest existing round is 3 or
   more is admitted **no rounds** and halts immediately on the budget path (AC-1.4), emitting the S-4
   halt reason rendered as `rounds {W}..{W+2} of 3` — `rounds 1..3 of 3` in that example, and
   `rounds 4..6 of 3` on a branch reset to `WINDOW-START: 4`. The literal varies with the window and
   the format string is S-4's; a clause that hard-codes one window's render is a defect (TE v4 F-05);
2. the window's **start** is unchanged — one past the highest existing round (M-1d), so review history
   stays append-only and no existing file is ever overwritten;
3. the **one** reset is an operator's: a `POSTMORTEM-{phase}-{feature}.md` carrying a human-written
   `RESOLVED: yes` outside any fenced block clears the halt, and the rounds recorded *before* that
   marker do not count against the budget of the window opened after it. This is the existing operator
   escape hatch (AC-1.4), stated here because it is what makes an absolute cap operable rather than a
   dead end: an operator who has addressed the finding gets a fresh window; an unattended re-invocation
   does not. **No agent and no script ever writes `RESOLVED: yes`** — that rule is unchanged;
4. **the reset is anchored and consumed, in the POSTMORTEM, by the loop.** The **reset region** (§5) is
   read as two counts: `H`, the number of `HALT-REASON:` lines, and `A`, the number of `WINDOW-START:`
   **plus** `WINDOW-RESUMED:` lines — the lines the loop writes to *answer* a clearance. A clearance is
   **unconsumed** exactly when `checkPostmortem` reads a `RESOLVED: yes` **and** `A < H`. On any entry
   that observes both (TE v5 MF-09: there is no observable "first entry"; the counts are the whole
   state), the loop writes exactly one answering line — `WINDOW-START: {N}` on a convergence halt,
   `WINDOW-RESUMED: {W}` on an S-11 halt (clause 5) — which makes `A = H` again. For `WINDOW-START:`,
   `N` is one past the highest round then on the branch and becomes the window's origin `W`: the budget
   of 3 is counted from `W`, and rounds below `W` are outside the window. When `A = H` every halt so far
   has been answered and the loop writes nothing and grants nothing.

   **The accounting is over lines the loop owns, not over the human's marker.** v1.2 tested for the
   presence of a `WINDOW-START:` beside a `RESOLVED: yes`, which is undecidable once the file carries
   several of each; v1.3 counted `RESOLVED:` lines against `WINDOW-START:` lines, which requires the
   file to accumulate a datum `parseResolvedMarker` rejects as `duplicated`
   (`pdlc/workflows/orchestrate-dev.js:961`) — the file can hold **at most one** `RESOLVED:` line and
   still be readable at all (SE v5 G-07). Counting **halts against answers** keeps the pairing exact
   without touching the marker: every halt appends one `HALT-REASON:` (AC-1.4), every honoured clearance
   writes one answering line, and both kinds of line may legally repeat.

   Receive side, stated as an **ordered algorithm** rather than as a table of independent rows, because
   DC-01 requires it to be total **and single-valued** and v1.3's rows overlapped on reachable inputs —
   e.g. `WINDOW-START: 4` then `WINDOW-START: 9` on a branch whose highest round is 6 matched both the
   strictly-increasing row and the out-of-range row, with different answers (TE v5 F-04). Given the
   region, the loop:

   1. collects every `WINDOW-START:` and `WINDOW-RESUMED:` line in it, in document order;
   2. **validates every one of them.** A `WINDOW-START:` value is valid iff it is a decimal integer ≥ 1,
      strictly greater than every `WINDOW-START:` value before it, and no greater than one past the
      highest round on the branch. A `WINDOW-RESUMED:` value is valid iff it is a decimal integer ≥ 1
      equal to the greatest `WINDOW-START:` value before it, or to 1 if there is none;
   3. **if any line fails validation ⇒ `W` = 1, fail-closed**, no reset is honoured, and the run report
      names the file and the values found. A corrupt region is never partially believed;
   4. otherwise `W` = the greatest `WINDOW-START:` value present, or **1** if there is none.

   Fail-closed in every non-canonical case is the point: an absent, unparseable, repeated, decreasing or
   out-of-range value never widens the window, and a region with no `WINDOW-START:` line at all is
   simply a document that has never been reset.

   Both halves are load-bearing. Without the anchor, nothing on the branch records *which* rounds
   preceded the marker, so "counted from round 1" is unstated for any document that has ever been
   reset and AC-1.1 is underivable there (SE F-05, TE F-02). Without consumption, `RESOLVED: yes` is a
   persistent file state that re-grants a fresh window on **every** subsequent invocation — which
   silently restores the per-invocation budget AC-1.1 exists to abolish. `WINDOW-START:` is written by
   the loop, not by a human, and carries no authority of its own: it records where a reset the operator
   already granted began. The prohibition in clause 3 is on **writing** `RESOLVED: yes`, and is
   untouched: AC-1.4's strip removes a marker the operator has already spent, which can only refuse a
   phase, never admit one;

5. **every halt records which halt it was, and a no-revision halt resumes the window rather than
   replacing it.** Each halt appends exactly one `HALT-REASON: {value}` line to the **end** of the reset
   region (S-12, AC-1.4), `{value}` being the `; `-joined render, in AC-4.7's precedence order, of every
   halt reason that halt raised — so a round on which S-3 and S-4 both hold writes **one** line reading
   `fixed-point: …; budget-exhausted: …` and the operator sees the same string here and in the run
   report's `notice` cell (AC-2.2, TE v5 F-06). Because each halt appends and nothing is written after
   the region, the **last** such line is the most recent halt's (SE v5 G-11). On the entry that observes
   an unconsumed clearance (clause 4), the loop reads that last line and its **leading** reason:

   | Last `HALT-REASON:` begins | Effect of the `RESOLVED: yes` | Line the loop writes |
   |---|---|---|
   | `no-revision:` (S-11) | the halt is cleared and the **interrupted window is resumed** — `W` is unchanged and the rounds the window had already spent stay spent | `WINDOW-RESUMED: {W}` (S-14) |
   | `fixed-point:` (S-3) or `budget-exhausted:` (S-4) | the reset is granted and consumed as clause 4 states: a fresh three-round window opens at `N` | `WINDOW-START: {N}` (S-13) |
   | absent, unparseable, or any other value | treated as S-3/S-4 — **fail-closed**, because the safe error is to consume a reset the operator can re-grant, never to hand out a free window | `WINDOW-START: {N}` |

   Reading the **leading** reason is exact: S-11 is decided at round-open and never co-occurs with S-3
   or S-4 (AC-2.2), so a joined value never begins `no-revision:`.

   **Every clearance is answered by exactly one line, including this one.** v1.3 had the S-11 path write
   nothing, on the reasoning that an authoring failure should not cost the operator's escape hatch. The
   reasoning is right and the mechanism was not: with nothing written, the clearance stayed unanswered
   forever, so the **next** halt of any kind — a fixed-point halt three rounds later, with no operator
   action at all — met an unconsumed clearance and was granted a fresh three-round window on the
   strength of a marker written for an unrelated authoring failure. A pipeline that failed to author *k*
   times banked *k* free windows (SE v5 G-10, TE v5 F-01). Writing `WINDOW-RESUMED: {W}` keeps the
   intent — the origin does not move, the spent rounds stay spent, the operator is not charged a window
   — while restoring `A = H`, and it gives the S-11 path a **positive artifact** to assert on, which
   O-10's obligation *"an S-11 halt cleared without consuming the reset"* previously lacked: absence of a
   `WINDOW-START:` is also what a loop that ignored this clause entirely would produce.

   AC-2.8 calls a zero-delta round an **authoring** failure whose remedy is re-running the authoring
   step; charging the operator's single escape hatch for it would misprice an unrelated failure
   (TE v4 F-04). Resuming rather than resetting keeps AC-1.1's cap absolute across the S-11 path, and it
   is derivable from one line the halt already had to write.

The durable observable for all five clauses is the same one the loop already reads: the cross-review
basenames on the branch, plus the POSTMORTEM's single `RESOLVED:` marker and its preserved
`HALT-REASON:`, `WINDOW-START:` and `WINDOW-RESUMED:` lines. Nothing here needs a clock, a process identity, or a memory of a previous
invocation.

**Observability.** `MAX_REVIEW_ROUNDS === 3`; the highest `-v{N}` on the branch never exceeds 3 for a
document with no resolved POSTMORTEM; a fourth round never dispatches a reviewer; the post-mortem
contains the literal `3` and the S-4 reason string.

---

### REQ-RCV-02 — The fixed-point stop is enforced by the loop, not by prose

**Priority:** P0 · **Phase:** 1 · **Source:** US-01, US-03 · **Depends on:** BL-01, BL-02

The stopping rule has now been written into three consecutive REQ preambles and honoured by none of
them, because nothing in `orchestrate-dev` reads a rule written in the document under review
(P-2). Both counts the rule needs are already machine-readable (M-2a). The enforcement is available
and simply unbuilt.

**AC-2.1 — The rule, and where each operand comes from.**
*Who:* the review loop. *Given:* a failed round **N ≥ 2 of the current window** (§5) — i.e. round N's
reviewers did not all approve, and round N−1 belongs to the same window, so `N − 1 ≥ W`; the first
round of a window has no comparable predecessor, exactly as round 1 has none, because the operator has
just declared the previous window's findings discharged (TE v4 F-04) — whose blocking count and whose
predecessor round N−1's blocking count are both **available**
(AC-2.7) and **reliable** (AC-2.3), and whose panel shape equals round N−1's (AC-2.4). *When:* round
N's verdicts have been parsed and **before** round N's optimizer episode is dispatched. *Then:* if
`blocking(N) ≥ blocking(N−1)` **and** `blocking(N) > 0`, the loop halts on the existing post-mortem
path (AC-1.4) instead of iterating, and does not dispatch that optimizer episode. The halt reason is
S-3.

**Both operands are read from the cross-review files on the branch**, by `extractFileVerdict` →
`parseVerdict` (M-2e), never from the in-process agent response. This is the answer to the question the
three round-1 High findings shared. `parseVerdict`'s response-side result (M-2a) lives only in the
invocation that took it, and the branch-side state the loop rebuilds each invocation **discards the
counts** (M-2f) — so an in-process operand is undefined for round N−1 on any resumed phase, which is
the normal case. Reading both operands from the same durable surface makes the rule invocation-agnostic
by construction: the same branch yields the same decision whoever evaluates it, and AC-2 can be
re-derived after the fact from the files alone, which is what makes AC-4.7's report auditable.

This is why AC-3.4 requires the count trailer **inside** the cross-review file. See N-3, which is
amended accordingly: that requirement is the one file-grammar change this REQ makes, and it is stated
rather than assumed.

**AC-2.2 — The halt is distinguishable from budget exhaustion.**
*Who:* the operator. *Given:* a fixed-point halt. *When:* they read the post-mortem and the run
report. *Then:* the halt reason names the fixed point and carries the two counts and the two round
numbers that triggered it — e.g. *"fixed point: round 3 blocking 7 ≥ round 2 blocking 6"* — and is
textually distinct from the budget-exhaustion reason. An operator must be able to tell, without
reading the cross-review files, whether the loop ran out of rounds or stopped making progress.

**When more than one halt condition holds, the operator sees all of them, in AC-4.7's order** (TE Q-02,
carried unanswered from round 1). On the last admitted round the fixed-point test and the budget can
both be satisfied; the `notice` cell then carries S-3 and S-4 in that order, and the post-mortem's
`HALT-REASON:` line (AC-1.5(5)) carries the same `; `-joined string, so the operator sees the same two
reasons in the same order in both places (SE v4 Q-07). AC-4.7's precedence table gives S-3 and S-4
**two rows** for exactly this reason; v1.2's single row asserted that at most one could appear, which
this paragraph denies, and the exact cell was therefore undecidable in the very case the paragraph was
written to answer (SE v4 G-01, TE v4 F-03). AC-2.1 **is** evaluated on the last admitted round — it is
defined as happening before that round's optimizer episode would be dispatched, and "would be" is not
"is": a round that dispatches no optimizer still has verdicts to compare.

**S-11 never co-occurs with either of them**, although it sorts ahead of both. An S-11 halt is decided
at round-open, before the round is dispatched, so its row is the undispatched round's row and carries
S-11 alone (AC-2.8); S-3 and S-4 are decided after a round's verdicts exist. The precedence order still
places S-11 first, because a reader scanning the column should meet the strongest explanation first.

**AC-2.3 — Unreliable counts break the chain; they never fire the rule.**
*Who:* the review loop. *Given:* any reviewer in round N or in round N−1 whose verdict parse is
`malformed` (M-2b) after the existing recovery pass (M-2d) has been attempted and has also failed.
*When:* AC-2.1 would be evaluated. *Then:* the comparison is **not made**, the loop continues to the
next round, and the run report records that the round was not comparable and why. A count nobody could
read is not evidence of a plateau. Because the rule compares only *consecutive* rounds, an unreliable
round is neither a trigger nor a baseline: it breaks the chain in both directions.

**AC-2.4 — Rounds of different panel shape are not comparable, and a crashed round has no shape.**
*Who:* the review loop. *Given:* rounds N and N−1. *When:* AC-2.1 would be evaluated. *Then:* the
comparison is **not made**, and the run report carries the S-5 notice with the matching reason, if
either of the following holds:

- **unequal panel shape** (`unequal-panel-shape`) — the two rounds' on-disk role-slug sets differ,
  which under AC-3 is the normal relationship between round 1 (dual) and round 2 (single verifier). A
  sum over two reviewers and a sum over one are not the same measurement, and normalising them would be
  a guess this REQ declines to make (N-2). See R-2 for the consequence and its successor.
- **either round is crashed** (`crashed-round`) — its on-disk role-slug set is not one of the two
  canonical sets (§5): a strict subset of a canonical set, the empty set, or a mixed set. The
  discriminator is the **slug**, not the `REVIEW-MODE:` marker: a lone file under slug `verifier` is a
  verifier round on its face, a lone file under `software-engineer` or `test-engineer` is a dual round
  one of whose reviewers crashed, and the two are already distinguishable without reading a single byte
  of file content.

**Why comparability is stated over slugs and not over the marker.** v1.1 defined *crashed* as "one file
with no `REVIEW-MODE: verification` marker". Composed with AC-2.1 — which is scoped to *failed* rounds
— and with v1.1's writer, which ran only on an approving round, that made **every failed verifier round
crashed**, so AC-2 could never fire in the `dual, verifier, verifier` regime AC-2.6's second row says
it fires in (SE F-02). AC-3.5(a) now writes the marker on every verifier round, which closes the gap
from the other side; stating the comparability test over the slug set closes it independently of the
marker, which is the property that matters: **the slug set is produced by the path derivation (M-3b) on
every round, including a round on which every reviewer crashed after writing nothing at all — in which
case the set is empty and the round is crashed, correctly.** The marker remains load-bearing for the
*approval* path (AC-3.5(b), M-3d), where fail-closed on a lone unmarked file is the right posture and
is unchanged.

A crashed round is neither a trigger nor a baseline. It breaks the chain in both directions, exactly as
an unreliable count does (AC-2.3).

**AC-2.5 — A zero-to-zero comparison must never fire.**
*Who:* the review loop. *Given:* `blocking(N) = 0` and `blocking(N−1) = 0` on a round that
nevertheless failed. *When:* AC-2.1 is evaluated. *Then:* the rule does **not** fire — this is the
purpose of the `blocking(N) > 0` conjunct. `0/0/0` is a *genuine* parse in this codebase (M-2c: the
truncated-output path returns real zeros and sets no `malformed` flag), so a naive `≥` would read a
round with no blocking findings at all as a plateau and halt a document that is one Low finding away
from approval. Zero blocking findings is the best possible round, not the worst.

**AC-2.7 — An unavailable count is not a malformed one, and it also breaks the chain.**
*Who:* the review loop. *Given:* a round for which some dispatched role's blocking count cannot be
obtained from the branch at all. *When:* AC-2.1 would be evaluated. *Then:* that round's blocking count
is **unavailable**; the comparison is not made in either direction; the run report carries the S-5
notice with reason `unavailable-count`, naming the round and the role. The loop continues to the next
round.

**The two states are separated by what is observable, not by intent.** A count is *unavailable* in
exactly these cases, and in no others:

| Observation on the role's file at that round | State |
|---|---|
| The file is absent | *unavailable* |
| The file carries no `## Verdict` heading | *unavailable* |
| A `## Verdict` section exists and there is **no non-empty line after** the `VERDICT:` line | *unavailable* — `parseVerdict`'s truncated-output path, which returns genuine `0/0/0` (M-2c) |
| A `## Verdict` section exists and, after `VERDICT:`, contains **nothing but anchor lines** — no candidate line survives AC-3.4's skip rule | *unavailable* — the trailer was never written; an anchor is not a malformed trailer |
| A candidate line exists — the first non-empty **non-anchor** line after `VERDICT:` — and does not parse as `{"high": N, "medium": N, "low": N}` after `recoverVerdict` (M-2d) has been tried | *malformed* (AC-2.3) |
| The `## Verdict` section carries **two or more `VERDICT:` lines** | *malformed* (AC-2.3) — the quantity was read and could not be resolved, which is §5's definition of *malformed* exactly |

**The duplicated-`VERDICT:` row is new in v1.4 and is not a new behaviour**: `extractFileVerdict`
(`pdlc/workflows/orchestrate-dev.js:888`) scopes its scan to the trailing `## Verdict` section, counts
lines beginning `VERDICT: `, and returns `{ok: false, reason: "duplicated"}` when there is more than
one (`:904`) — *before* `parseVerdict` ever runs — and the repo's documented file contract already says
a second `VERDICT:` line is read fail-closed. v1.3 classified that outcome nowhere: AC-3.4 step 1
presumed a *single* line and enumerated only *absent*, and this table had no row, so a third failure
mode of AC-2's operand mapped to neither of the two chain-breaking states (SE v5 G-09). Mapping it to
*malformed* keeps the shipped return value on a chain break rather than on silence, and leaves an
implementer reading only this REQ no reason to drop the existing behaviour.

The anchors-only row is the operator-facing half of AC-3.4's placement rule; v1.3 restates it as
*"nothing but anchor lines"* so that the table classifies exactly the observations AC-3.4's algorithm
produces (SE v5 MF-3: it is no longer new, and the rows have shifted, so it is named rather than
numbered). v1.2 stated it as *"the **first** non-empty line after `VERDICT:` is an anchor
line"*, which contradicted AC-3.4's skip rule on the input `VERDICT:` → anchor → valid trailer: the
algorithm read a count, the table said *unavailable*, and DC-01 requires the receive side to be total
**and single-valued** (SE v4 G-05, TE v4 F-06). **AC-3.4 states the reader; this table classifies its
outputs; the anchor set is §5's catalogue and is enumerated in neither.** Because
`extractFileVerdict` takes the `## Verdict` section to end-of-file, the anchor block AC-4.1 appends is
*inside* that section; without this row a file that simply never carried a trailer would `JSON.parse`
an anchor line, throw, and be reported as **malformed** — inverting the very distinction this AC exists
to draw, on the most common lagging-SKILL case R-7 accepts (SE F-04). Recognising the closed set of
anchor keys is sufficient to tell "no trailer was written" from "a trailer was written badly", and that
set is fixed by §5's catalogue.

*Unavailable* and *malformed* (AC-2.3) are different states and are reported differently on purpose.
Malformed means a trailer was found and could not be parsed even after `recoverVerdict` (M-2d);
unavailable means no trailer was there to parse. The distinction matters because `parseVerdict`'s
truncated-output path returns **genuine `0/0/0` with no `malformed` flag** (M-2c): a file with no
trailer would otherwise read as a perfect round and, worse, as a *comparable* one. AC-2.7 is what stops
a missing trailer from being read as zero blocking findings. It is the receive-side totality DC-01
requires of the count trailer, now that AC-2 reads that trailer from a file.

**AC-2.8 — A round whose document did not change is a halt, not a consumed round.**
*Who:* the review loop. *Given:* a round **N ≥ 2 of the current window** about to be opened — i.e.
`N − 1 ≥ W` (§5, AC-1.5(4)). *When:* the loop takes its single round-open read of the document (`t0`,
the same read AC-4.1 measures growth from — there is exactly one read per round-open and both ACs use
it, TE v4 Q-06), **before** it dispatches round N's reviewers. *Then:* if that read's byte length
equals `DOC-BYTES(N−1)` **and** its `sha256Hex` digest equals `DOC-SHA256(N−1)`, the loop **halts on the
existing post-mortem path** (AC-1.4) with the S-11 halt reason `no-revision: round {N} document
identical to round {N-1}`, and round N is **not** dispatched and **not** counted against AC-1's budget.

Receive side, total over every input — the anchor condition is stated **here**, not as a precondition of
*Given*, because the third row is exactly the case in which it does not hold (TE v4 MF-07):

| Observation | Behaviour |
|---|---|
| Both anchors present at round N−1, both endpoints equal | **halt**, S-11 |
| Both anchors present, either endpoint differs | no halt; the round proceeds and AC-4 classifies the growth from the same read |
| Either anchor absent, unparseable, or duplicated with unequal values at round N−1 | the test is **not evaluated**; the round proceeds. Fail-**open**, deliberately: a missing anchor is evidence about the writer, not about the author, and must never manufacture a halt |
| N = 1, or `N − 1 < W` — round N is the first round of a window | not evaluated — there is no predecessor **in this window**. An operator who resets without revising the document is exercising the escape hatch deliberately; halting the fresh window on its first round would spend a reset on zero rounds (TE v4 F-04) |

**What the run report shows for the undispatched round.** Round N produces no cross-review files, so
`panel-shape` and `blocking` have no source at all (SE v4 G-02). `growth-bytes` and `classification`
**do** have one — the halt condition is `bytes(t0) = DOC-BYTES(N−1)`, so the growth is exactly 0 and the
classification `incremental`, both derivable with no round-N file in existence (SE v5 G-12) — and they
are nevertheless left empty **by choice**, not for want of a source: reporting `0` / `incremental`
invites the reader to think a round was measured, and no round ran. The table gains **a row for round
N**, and that row is fixed here: `round` = N, `panel-shape`, `blocking`, `growth-bytes` and
`classification` all **empty** — round N was not dispatched, so nothing is reported about it — and
`notice` carrying **S-11 alone**. The mechanically-derived alternative (`crashed` / `unavailable` /
`unmeasurable` plus three S-5/S-6 notices) is wrong on its face: it presents the operator's primary
evidence that the *author* did nothing as evidence that the *reviewers* crashed. Empty cells say
"not run", which is what happened. O-10 asserts this row.

**Clearing an S-11 halt does not consume the operator's reset** — AC-1.5(5). The halt is an authoring
failure, and the window it interrupted resumes with the rounds it had already spent still spent.

**Why the byte length alone is not the test.** Two different revisions of the same length are possible
and a halt on that evidence would be wrong. The SHA-256 endpoint is what makes the test exact, and it
costs nothing new: the same `sha256Hex` the tier-1 approval anchors already call over the reviewed
document (M-4a), written by the same per-round writer as `DOC-BYTES:` (AC-4.1).

**Which bytes are digested, precisely.** `sha256Hex` canonicalises before it digests — CRLF and lone CR
to LF, exactly one trailing newline — inside the function and never in a caller, by design
(`pdlc/workflows/orchestrate-dev.js:696`, `sha256Hex`; `:615`, `canonicaliseForDigest`; its JSDoc
`:600-614`, *"applied INSIDE `sha256Hex`, never by a caller, so no two call sites can disagree about
which bytes were digested"*). `DOC-SHA256:` **is that digest** — over the canonical form — and is
therefore **not** a digest of the raw bytes `DOC-BYTES:` counts. v1.2 claimed both, which cannot hold
(SE v4 G-03). The conjunction is what recovers the difference: a revision that changes only line
endings or trailing newlines leaves the digest equal but the byte count different, so the test does not
fire and the round proceeds — the safe direction, and the reason the two endpoints are ANDed rather
than either taken alone.

**Why this is a halt and not a notice.** A zero-delta round is the strongest observable form of
non-convergence there is: the optimizer episode between the two rounds produced nothing, so round N's
reviewers cannot resolve a finding, cannot change a verdict, and cannot produce a review that differs
from round N−1's. Spending a round of a three-round budget on it converts an *authoring* failure into a
*non-convergence* post-mortem, which names the wrong cause and burns the budget that would have paid
for the real revision. Making it a distinct halt reason (S-11) tells the operator exactly what to fix —
re-run the authoring step — rather than inviting them to adjudicate findings that were never contested.

**This defect was observed on this document.** Round 3 of this REQ's own Phase R was dispatched against
a byte-identical file: both reviewers verified the blob hash was unchanged across the round-2 and
round-3 baselines, both carried every finding forward verbatim, and one round of a five-round budget
bought a review that could not differ from its predecessor (SE F-08, TE F-07). AC-2's fixed-point test
does not catch it — the blocking counts are trivially equal, which reads as a *plateau of disagreement*
rather than as *no input* — so the byte-identity test is a separate clause, evaluated earlier and
reported differently. AC-4's `DOC-BYTES:` datum is what makes it a two-anchor comparison rather than a
new mechanism.

**AC-2.6 — The rule bounds work, and it is honest about how much.**
*Who:* the operator. *Given:* AC-1's three rounds. *When:* the rule fires. *Then:* how often it can
fire depends on which of §2's two regimes the run is in, and v1.0 stated only one of them as though it
were a consequence. Both are enumerated here — these are **all** the panel-shape sequences reachable
under AC-3.1 and AC-4.2, each stated over **the growth into the round in the row**, and each read over
the three rounds of a window (rounds `W`, `W+1`, `W+2`; `W = 1` when no reset has been granted), since
AC-3.1's first-round rule is over windows rather than over round indices (TE v5 MF-10, F-03):

| Reachable sequence (rounds 1, 2, 3) | When | Comparable consecutive same-shape pairs | Rule can fire at |
|---|---|---|---|
| dual, dual, dual | the growth into round 2 and into round 3 both exceed 12,000 — **the measured regime** (AC-4.3: 5 of 5 predecessor rounds) | (1,2) and (2,3) | round 2 **or** round 3 |
| dual, verifier, verifier | both growths ≤ 12,000 — the target regime | (2,3) only | round 3 |
| dual, verifier, dual | the growth into round 2 was small, into round 3 large | none | never |
| dual, dual, verifier | the growth into round 2 was large, into round 3 small | (1,2) | round 2 |
| any sequence containing a crashed or unavailable round | a reviewer crashed or wrote no trailer | fewer than the above | correspondingly fewer |

So AC-2.6's v1.0 claim — *"the only consecutive same-shape pair is (2,3) … it does not save a round of
reviewers"* — is true **only** in the target regime, and is false in the measured one, where the rule
can fire at round 2 and thereby save a full round of reviewers as well as an optimizer episode. The
honest statement is: the rule fires **at most once per phase** in every reachable sequence, saves at
least one optimizer episode when it fires, and saves a round of reviewers as well when it fires at
round 2. R-2 is restated to match.

A test author can derive the expected fire-sites from this table plus AC-4.2's classification of each
round's measured growth; nothing about it depends on which process opened which round.

**Observability.** Two integers read from two files on the branch, two on-disk role-slug sets, two
anchor pairs, three comparisons, two halt reason strings. No unmeasured runtime behaviour and no
in-process state is involved.

---

### REQ-RCV-03 — Round 1 is dual-adversarial; later rounds are a single verifier

**Priority:** P0 · **Phase:** 1 · **Source:** US-05, US-02 · **Depends on:** BL-01, BL-03, BL-04

Two facts from §1.3 motivate this. The two reviewers **never disagreed** — at round 5 both
independently filed the same defect, their disposition tables agreed, and both approved the large
majority of each revision. And rounds 2–5 had a ~100% finding-resolution rate: the authoring side
resolved every finding it was given, every round. Later rounds were therefore *disposition checks* that
also happened to manufacture a fresh crop of findings in the new text written to answer them. Two
agents doing a disposition check independently is a duplicated disposition check at double the
finding-manufacture rate.

Round 1 is different: it is the only round that reads the document cold, and breadth of lens is worth
paying for exactly once.

**AC-3.1 — Panel by round.**
*Who:* the review loop. *Given:* a review-loop phase other than Phase CR. *When:* it dispatches
round N. *Then:* **round `W`** — the first round of the current window, which is round 1 when no reset
has been granted — dispatches the **full reviewer panel** (today: `se-review` and `te-review`, in
parallel, as now), and every round `N > W` dispatches a **single verifier** — unless AC-4 classified
**the growth into round N** as `new-mechanism` or `unmeasurable`, in which case round N dispatches the
full panel again.

**The rule is over windows, not over round indices**, and v1.3's *"every round N ≥ 2"* was not. The
first round of a reset window is `N ≥ 2` by construction (clause 4 sets `W` past the highest existing
round), yet §5 and AC-2.1 both say such a round has no comparable predecessor *"exactly as round 1 has
none"* — so v1.3 said both that it is like round 1 and that it is like round 5. Composed with AC-2.8's
row 4, which deliberately does **not** evaluate the zero-delta test on a window's first round, the
consequence was concrete: an operator who resets **without revising** got growth 0 ⇒ `incremental` ⇒ a
single verifier, and that one agent could approve the byte-identical document a two-reviewer panel had
just rejected, with the one mechanism that detects "the document did not change" switched off for that
round (TE v5 F-03). Scoping the panel rule to the window closes it outright, and costs one round of one
panel per operator reset — a price an operator who has just spent their escape hatch has already
signalled willingness to pay.

The classified revision is the one round N's reviewers are about to read, not the one round N−1 already
read: AC-4.1 measures it from the same round-open read that dispatches the round, so the escalation and
the revision that triggers it belong to the same round (TE v4 F-01). Round `W` is the only round with no
classification, and it is dual regardless, so the exception is total over rounds `N > W`.

**AC-3.2 — What the verifier is asked to do, and the artifact that proves it did.**
*Who:* the verifier. *Given:* a round `N > W` — a round of the current window that is not its first —
on a document whose round N−1 findings have been addressed. *When:* it reviews. *Then:* it works in
**disposition-check mode**:
1. it verifies that **every** prior blocking finding **of the current window** is resolved, and states a
   per-finding disposition **in a section headed exactly `## Disposition` (S-8)**, one row per such
   finding, carrying that finding's **id exactly as the prior round wrote it** (`F-03`), its round, its
   role, and one disposition from the closed set `{resolved, partially-resolved, not-resolved,
   withdrawn}`;
2. it may raise a **new blocking finding only in text that adds new mechanism** — a clause that
   changes what the system does. Text that restates, tightens, retracts, cites, or records a risk is
   not new mechanism and is not a place a new blocking finding may be raised. **Every blocking finding
   a verifier raises carries a `New-mechanism:` field** in its findings-table row, naming the section
   or clause of the revision it judged to be new mechanism (`AC-4.1, sentence 2`). A blocking finding
   with an empty or absent `New-mechanism:` field **must be excluded by the verifier from the
   `high`/`medium` numbers it writes into its own count trailer** (AC-3.4), and recorded as a Low
   instead. **The loop performs no subtraction and parses no findings table.** `blocking(N)` has
   exactly one definition everywhere in this REQ — the `high` + `medium` operand of the count trailer
   read by `extractFileVerdict` → `parseVerdict` (§5) — and this clause changes *what the verifier
   writes into it*, never how it is read. v1.1 said such a finding "is not counted", which read as a
   loop-side deduction from a single integer that no reader can perform, and as a second, incompatible
   definition of `blocking(N)` requiring a findings-table grammar N-3 declines to introduce (SE F-03,
   TE F-03). Like AC-4.6 this is therefore a **prompt-directive** clause: it binds the verifier and is
   unenforceable by the loop, and it is stated here so the obligation has one owner rather than two
   readings;
3. it may raise Low findings and `## Measurement Required` items (AC-5) anywhere, without restriction.

Restriction 2 is the direct answer to P-1. It is a rule about *where* a blocking finding may be
raised, not about what is true; a verifier that believes a non-mechanism clause is wrong records it as
Low or as a Measurement Required item.

**Why *"of the current window"*, and why no verifier is ever asked to disposition a discharged
finding.** A window's first round is a full-panel cold read (AC-3.1), so no verifier ever opens on a
round `N = W`, and the findings of a *previous* window were not addressed by an optimizer episode at
all — the operator discharged them by writing `RESOLVED: yes`. v1.3's *"every prior blocking finding
from every prior round"* therefore asked the first verifier after a reset for rows whose content is
underivable, on a precondition (*"whose round N−1 findings have been addressed"*) that is false there
(TE v5 F-03). Scoping both the *Given* and clause 1 to the window makes the required content derivable
from the branch on every round on which a verifier runs at all.

**Both clauses now have an oracle, because round 1 of cross-review established that neither did.** As
written in v1.0, a verifier that obeyed clause 2 and one that ignored it produced byte-identical
artifacts (TE F-05), and clause 1's disposition was prose no reader could check against the prior
rounds' finding ids (TE F-06). The two named literals above — `## Disposition` and the
`New-mechanism:` field — are the structural artifacts that make each clause falsifiable, and they are
named on the same principle as `Scope:` and `## Verdict`: an exact string, in the file, machine-locatable.

**Receive side (DC-01 totality) for `## Disposition` (S-8):**

| Input | Behaviour |
|---|---|
| Section absent on a verifier round's file | The verifier's **approval is refused, fail-closed** — the round is treated as not approving; the run report says `disposition-missing` and names the round and role. It is not a halt: the loop opens the next round normally. |
| Section present, but a prior round's blocking finding id has no row | Reported in the run report as an **unmatched id**, naming the id and its round. Never fatal, never a halt — an id the verifier did not see is evidence about the verifier, not about the document. |
| A row whose id matches no prior finding | Reported the same way and ignored. |
| A row whose disposition value is outside the closed four-member set | Read as `not-resolved` (fail-closed) and reported. |
| Section present on a **dual** round's file (round 1, or a re-escalated round) | Permitted and ignored. AC-3.2 binds the verifier; a full-panel reviewer that also states dispositions is not in error. |

The prior rounds' finding ids are read from the prior rounds' cross-review files on the branch — the
durable home §5's table records for this quantity. Nothing here reads in-process state.

**AC-3.3 — Phase CR keeps the full panel every round.**
*Who:* the pipeline. *Given:* Phase CR, the final codebase review. *When:* any round runs. *Then:*
the full panel is dispatched, every round. Phase CR's optimizer changes **code**, not the reviewed
document, so the growth AC-4 measures does not exist there and the "new text is unreviewed text"
mechanism this AC is designed around does not apply. Applying the verifier rule to a phase whose
growth is unmeasurable would be applying it blind.

**Phase DOD is out of scope for the same reason, and this REQ now says so** (TE Q-01, carried
unanswered from round 1). Phase DOD runs its own evaluator→optimizer loop — `dod-verify` writing
`CODE_REVIEW-{feature}-v{N}.md`, `se-implement` remediating — under its own three-round budget. Its
optimizer changes **code**, not the reviewed document, so `DOC-BYTES:` has no subject there and AC-4
cannot classify a revision; and its artifacts are not `CROSS-REVIEW-{role}-{doc}-v{N}.md`, so
`deriveRoundWindow`'s basenames, AC-2's panel shape and AC-1's window are all stated over a naming
convention Phase DOD does not use. **AC-1, AC-2, AC-3 and AC-4 therefore apply to `reviewLoop` phases
only** — the phases that review a document. AC-5 and AC-6 are prompt- and tool-level and are not scoped
by phase at all. Extending the convergence mechanism to Phase DOD is a legitimate later question and is
not asked here; N-7 is widened to name it.

**AC-3.4 — The file grammar gains a required count trailer, and this REQ says so.**
*Who:* every reviewer — verifier and full panel alike. *Given:* any round. *When:* it finishes.
*Then:* it writes `CROSS-REVIEW-{role-slug}-{doc}-v{N}.md` with a trailing `## Verdict` section
written last, carrying exactly **one** `VERDICT:` line **and, inside that same section, the
machine-readable `{"high": N, "medium": N, "low": N}` count trailer**. The verifier uses the same
grammar under its own slug; the loop's existing path-derivation already composes the path from the
role slug and the round (M-3b), so no parser changes there.

**This is a file-grammar change, and it is the only one this REQ makes.** v1.0 called the trailer part
of the "unchanged" grammar; it is not. Today the three review SKILLs require the trailer in the
reviewer's **response**, and the repo's documented **file** contract is the `## Verdict` section and
its single `VERDICT:` line — a correctly written file may carry no trailer at all (M-2g). Because AC-2
now reads both its operands from files (AC-2.1), a file without the trailer would take
`parseVerdict`'s truncated-output path and return **genuine `0/0/0`** (M-2c), i.e. read as a perfect,
comparable round (SE F-10). So:

- the trailer is **required in the file**, in the `## Verdict` section, and its **placement is exact**:
  it is written immediately after the `VERDICT:` line, before any anchor line, which is what
  `parseVerdict` requires (M-2c). v1.1 fixed only *that* the trailer is in the file, not *where*,
  leaving a compliant-looking file that `parseVerdict` rejects (SE F-04);
- **the reader is one algorithm, stated once, here.** Given a file, the trailer reader:
  1. locates the trailing `## Verdict` section and counts the `VERDICT:` lines in it. No section, or no
     `VERDICT:` line ⇒ *unavailable*; **two or more `VERDICT:` lines ⇒ *malformed*** — the outcome
     `extractFileVerdict` already returns as `{ok: false, reason: "duplicated"}`
     (`pdlc/workflows/orchestrate-dev.js:888`, the count at `:904`), classified here rather than left
     unmapped (SE v5 G-09, AC-2.7);
  2. from the single `VERDICT:` line, **scans forward and stops at the first non-empty line that is not
     an anchor line — that line is *the* candidate, and there is at most one.** The anchor set is
     **§5's catalogue** (S-1, S-2, S-10 and the M-4a approval anchors) **by reference**; this REQ
     enumerates it nowhere else, so it has exactly one membership;
  3. no candidate ⇒ *unavailable* (AC-2.7);
  4. the candidate does not parse as `{"high": N, "medium": N, "low": N}` after `recoverVerdict`
     (M-2d) has been tried ⇒ *malformed* (AC-2.3);
  5. the candidate parses ⇒ that is `blocking`'s source. **A second parsing trailer later in the section
     is not observed and is therefore not a case**: the scan has already stopped.

  **The scan stops; it does not collect.** v1.3 defined the candidate by a stopping scan in step 2 and
  then quantified over *"two or more parsing candidates"* in steps 4–5, which presupposes a collecting
  scan — two readings that answer differently on a reachable input (`VERDICT:` → a prose line → a valid
  trailer: stopping ⇒ *malformed*, collecting ⇒ a readable count), reachable during R-7's transition
  because a lagging SKILL writes whatever prose it likes under `## Verdict` (SE v5 G-08). Stopping is
  chosen: it matches `parseVerdict`'s own *"first non-empty line after `VERDICT:`"* and is the cheaper
  reader. The duplicate-trailer concern that motivated the deleted clause is answered one level up, in
  step 1, over the datum a duplicate actually shows up in.

  Skipping rather than first-line-testing is what keeps *unavailable* reachable: anchors are appended
  into this same section *after* the trailer, so on a file that never carried a trailer an anchor line
  would otherwise present itself as the first non-empty line after `VERDICT:` and parse as *malformed*,
  inverting the operator-facing distinction AC-2.7 draws (SE F-04, TE Q-03). v1.2 stated the skip rule
  here **and** a conflicting first-line rule in AC-2.7's table, and enumerated the anchor keys twice with
  different membership — four keys here, five there (SE v4 G-05, TE v4 F-06, SE v4 MF-2). One algorithm,
  one skip-set, by reference. This is a second amendment to M-2c's reader, and O-9 carries it alongside
  the SKILL amendment below;
- **N-3 is amended accordingly** and no longer claims the trailer is unchanged;
- the corresponding review-SKILL amendment — write the trailer in the file as well as in the response
  — is added to **O-9**, which v1.0 did not list;
- the trailer stays in the response too. Nothing about the in-process path (M-2a) changes; AC-2 simply
  stops depending on it.

The completeness criterion for a cross-review is unchanged in *kind* — a trailing `## Verdict` section
with exactly one `VERDICT:` line — and now also requires the trailer inside it. `## Measurement
Required` (AC-5.2) remains outside the criterion (AC-5.5).

**AC-3.5 — A verifier-round approval is recorded, and a crashed dual round still is not.**

This is the load-bearing integration constraint, and it exists because three separate places in
`orchestrate-dev.js` currently encode "two reviewers" as an invariant. All three must be satisfied.

*Who:* the review loop. *Given:* round N ≥ 2 dispatched a single verifier — **whatever verdict it
returned**. *When:* the round's file exists, i.e. after the verifier returns. *Then:*

- **(a) A durable, in-file marker distinguishes a verifier round from a crashed dual round, and it is
  written on every verifier round.** The loop appends `REVIEW-MODE: verification` to the verifier's
  cross-review file, in the same anchor block, with the same idempotence and ambiguity rules as M-4b.
  Its writer is the **unconditional sibling writer of AC-4.1**, not `appendApprovalAnchors`: the marker
  describes the round's *panel shape*, which is a fact about the round, not about its verdict.
  Writing it only on an approving round would leave every **failed** verifier round as one file with no
  marker — indistinguishable from a crashed dual round under the §5 predicate, and AC-2.1 compares only
  failed rounds, so AC-2 could never fire in the `dual, verifier, verifier` regime AC-2.6 row 2 states
  it fires in (SE F-02). The marker is **in the file**, not in memory, because the reader that needs it
  (M-3d) runs on a later invocation with nothing but the branch to read.
- **(b) A lone cross-review file at the candidate round WITHOUT the marker remains fail-closed.**
  The existing role-asymmetry rule (M-3d) exists to refuse approval when one reviewer of a dual round
  crashed, and that refusal must survive intact. Only the marker converts "one file" from *evidence of
  a crash* into *evidence of a verifier round*.
- **(c) Same-round approval is evaluated against the roles dispatched at that round.** `selectMode`
  rule 2 today requires every role in `present` to approve at the same round, and `present`'s role set
  is accumulated across **all** observed rounds (M-3c). Unchanged, a branch carrying
  `{software-engineer, test-engineer}` at round 1 and `{verifier}` at round 2 would require all three
  roles to approve at round 2, which is unsatisfiable — every round would read as still owed an
  authoring pass, and the loop would never terminate on approval. The rule must be evaluated against
  the roles dispatched **at the round being judged**.
- **(d) The reviewer list is per-round.** `reviewLoop` currently hardcodes two reviewers in three
  places: two named result bindings, positional `reviewers[0]`/`reviewers[1]` dispatch, and a
  two-element `lastResults` construction on the halt path (M-3a). A round's panel must be a list whose
  length the round determines, and every one of those sites must read from it.

- **(e) The marker's reader is a total function — all six cases below, at REQ altitude.** `REVIEW-MODE:` is
  a machine-read string crossing a component boundary (S-1), and DC-01 requires the receiving side to
  be total *before* FSPEC authoring. v1.0 stated only present/absent and deferred the rest to O-4,
  which is an obligation on the FSPEC — the deferral DC-01 forbids (SE F-05, TE F-07). Each case below
  decides whether an approval is granted, which is externally observable behaviour. The rule is
  **fail-closed throughout**, matching M-3d's existing role-asymmetry posture and M-4b's `≥2`
  ambiguity posture:

  | Case on the candidate round's file(s) | Reading | Approval |
  |---|---|---|
  | **Absent** on a lone file | crashed dual round (§5) | **no approval** — the existing M-3d rule, intact |
  | Exactly **one** line, exactly `REVIEW-MODE: verification` | verifier round | approval honoured, if the verdict approves |
  | Exactly one line, **any other value** | unrecognised mode; the catalogue S-1 is closed and has one member | **no approval**; run report notice names the file and the value found |
  | **Two or more** `REVIEW-MODE:` lines in one file | history ambiguous — the same state M-4b calls `≥ 2` | **no approval**, by the same rule and for the same reason |
  | Marker present on **more than one file of the same round** | contradiction: a verifier round has one file by construction, so this is a dual round claiming to be a verifier round | **no approval**; the round's panel shape is *crashed* (§5) and therefore not comparable under AC-2.4 either |
  | Marker present on a **dual** round's file alongside a second unmarked file | same contradiction as the row above, seen from the other side | **no approval**; same notice |

  In every refusing row the loop does **not** halt: it records the refusal, the round remains owed an
  authoring pass, and the window proceeds under AC-1. A refusal is the absence of an approval, not an
  error, and it is exactly what M-3d does today.

**AC-3.6 — Tier 2 may remain dual-only, and says so.**
*Who:* the harvest step. *Given:* a feature whose approving round was a verifier round. *When:* the
LEARNINGS approval record (tier 2, M-3f) is written. *Then:* it is acceptable for tier 2 to record no
approval row for that round, **provided the limitation is documented** in the LEARNINGS file and in
the run report — i.e. the absence is reported as a known limitation, not left as a silent gap. Tier 2
is a best-effort record and is already explicitly excluded from the completeness criterion; extending
it is not in this REQ's scope. R-3 binds the residue.

**AC-3.7 — The verifier's lens is named, and it is not a third opinion.**
*Who:* the operator. *Given:* the verifier role. *When:* they ask what lens it applies. *Then:* the
verifier applies the **union** of the panel's lenses in disposition-check mode, not a new lens. It is
not a tie-breaker between the two round-1 reviewers, because §1.3 measured that they do not disagree.
Its slug is **`verifier`**, declared with a default in §6 — v1.0 left it unfixed, which left AC-2.4's
panel-shape set equality comparing sets of an undefined string (SE F-11). Its skill file, and whether
it is a new SKILL or a mode of an existing review SKILL, remain FSPEC decisions (§8 O-3); FSPEC may
rename the slug only by amending §6's row, and may not leave it unset. What matters to the mechanisms
is that there is **one stable slug**, because it is the key the file path, the approval marker and
AC-2's panel-shape comparison are all stated over.

**Observability.** Which files exist, under which role slug, at which round; whether a file carries
`REVIEW-MODE: verification`; which round `selectMode` reports as owed. All on disk, all readable on a
later invocation.

---

### REQ-RCV-04 — Revisions are measured, and a large revision re-escalates the panel

**Priority:** P0 · **Phase:** 1 · **Source:** US-02, US-05 · **Depends on:** BL-01, AC-3

Root cause 3: nothing in the loop distinguishes "this round tightened 1 KB" from "this round added a
new 25 KB mechanism", and the iteration counter treats both as one round. At ~25 KB of new text per
round the review surface never shrinks. AC-3 stops the verifier from *mining* small revisions for new
findings; AC-4 stops a genuinely large revision from slipping past a verifier that is not equipped to
read it cold.

**AC-4.1 — Growth is measured per round, from a durable in-file anchor.**
*Who:* the review loop. *Given:* a review-loop phase other than Phase CR. *When:* round N is opened.
*Then:* the loop takes **one** read of the reviewed document through the injected reader (M-5c) at that
instant `t0` — the same read AC-2.8 tests and the same instant at which AC-3.5 captures the document for
`APPROVAL-HASH:` — and from it derives `n = bytes(t0)` and `h = sha256Hex(t0)`. It then, in order:

1. **if `N > W`** — i.e. round N is not the first round of the current window — computes
   `growth = n − DOC-BYTES(N−1)` and classifies it under AC-4.2, **selecting round N's own panel**
   (AC-3.1). At `N = W` nothing is measured: that round's panel is fixed full by AC-3.1;
2. dispatches round N's reviewers;
3. after they return — **before AC-2.1 is evaluated**, and regardless of the round's verdict — writes
   `DOC-BYTES: {n}` (S-2) and `DOC-SHA256: {h}` (S-10) into each of round N's cross-review files that
   exists (`appendRoundAnchors`; zero files on a wholly crashed round, one on a partly crashed one —
   TE v4 Q-05).

**The read instant and the persist instant are deliberately different.** `n` and `h` describe the bytes
the round's reviewers were actually given, so they must be read before the dispatch; the round's files
do not exist until it returns, so they cannot be written until after. v1.1 collapsed the two into
"when round N is opened", which asked for a write into files that did not yet exist (SE F-01, TE F-01).

**Only the earlier endpoint has to be durable, and that is the whole point of the anchor.** v1.2 made
*both* endpoints durable by shifting the window back a round — `DOC-BYTES(N) − DOC-BYTES(N−1)`,
selecting round **N+1's** panel — which classified the revision round N's reviewers had *already* read
rather than the one round N+1 must read cold, defeating this AC's stated purpose. It also left round 2
unclassifiable in every run: there is no round 0 and therefore no `DOC-BYTES(0)`, so the growth into
round 1 is `no-anchor` ⇒ unmeasurable ⇒ AC-4.5's full panel, making `dual, dual, …` the opening of
every run and AC-2.6's target-regime rows unreachable (TE v4 F-01). With the live later endpoint, round
1 is the only unclassified round and it is dual by AC-3.1 anyway.

**The writer runs on every round, and it is a named, separate function.** `appendApprovalAnchors` is
the *approving-round* writer — it runs only inside the gate-pass branch — and remains solely
responsible for `APPROVAL-HASH:` and `REVIEWED-COMMIT:`, which are properties of an *approval*.
Everything that is a property of a *round* is written by **`appendRoundAnchors`**, an unconditional
sibling writer that runs on the failing and approving path alike, appending to the same anchor block in
each of the round's files and under the same idempotence and multi-line rules (M-4a, M-4b). It writes
three lines: `DOC-BYTES:` (S-2), `DOC-SHA256:` (S-10) and — on a verifier round — `REVIEW-MODE:`
(S-1, AC-3.5(a)). §5's two-writer table is the normative statement of the split.

This separation is the whole of the fix: a failing round is the only kind of round whose growth AC-4
ever classifies and whose counts AC-2 ever compares, so a writer that skips failing rounds writes its
anchors exactly when they are never needed and never when they are (SE F-01, TE F-01, SE F-02).

**`DOC-SHA256:` is written at the same instant, by the same writer, from the same read — but not over
the same bytes.** It is `sha256Hex`'s digest of the `t0` text, i.e. taken over `canonicaliseForDigest`'s
output: CRLF and lone CR normalised to LF, exactly one trailing newline, applied inside the function and
never by a caller (`pdlc/workflows/orchestrate-dev.js:696`, `sha256Hex`; `:615`,
`canonicaliseForDigest`; its JSDoc `:600-614`, literal *"applied INSIDE `sha256Hex`, never by a caller,
so no two call sites can disagree about which bytes were digested"*). `DOC-BYTES:` counts the **raw**
bytes. v1.2 asserted it was
"the SHA-256 of the same bytes `DOC-BYTES:` counts" *and* a reuse of the tier-1 hashing; only the second
is true, and the REQ must be right about its own subject (SE v4 G-03). The reuse is deliberate — it
inherits the canonicalisation discipline the digest family was built around — and AC-2.8's conjunction
with `DOC-BYTES:` recovers the byte-exactness the canonical form drops. Rendering differs from
`APPROVAL-HASH:` on purpose: that anchor carries the `sha256:{64 hex}` prefixed form produced by
`approvalHashOf` (`pdlc/workflows/orchestrate-dev.js:797`), while S-10 is bare 64 hex, because the
receivers differ. It costs one hash of a string the loop has already read.

**Round growth** is measured across the boundary between rounds N−1 and N:

```
growth = bytes(t0 of round N) − DOC-BYTES(round N−1)
```

The **earlier** endpoint is a durable anchor already on the branch; the **later** endpoint is the
round-open read this AC's step 1 takes. That is the minimum durability the measurement needs, and it is
what lets the classification select the panel of the round whose revision it measured. v1.1's formula
reached forward to `DOC-BYTES(round N+1)` — a value living in files that round N+1's dispatch creates,
circular as stated — and v1.2's over-corrected by making both endpoints past, which is not circular but
measures the wrong revision (TE v4 F-01).

**The anchor exists because the in-memory endpoint does not survive an invocation.** v1.0 defined both
endpoints as in-process `_readFile` results with no durable home, and the loop re-derives its state
from the branch on every invocation (M-1d, M-2f). On a resumed phase — the normal case — the round-N
endpoint was never taken in this process and nothing on the branch recorded it, so **every** round's
growth was unmeasurable, AC-4.5 fired, and AC-3's single-verifier path was dead on every resumed run
without any operator-visible signal that this was structural (SE F-03, TE F-01). AC-3.5(a) had already
solved exactly this problem for its own marker, for exactly this reason; AC-4 now uses the same
surface. §5's durability table records the result: no AC in this REQ is stated over an in-process
quantity.

**Receive side (DC-01 totality) for `DOC-BYTES:` (S-2).** Growth is **unmeasurable** — AC-4.5, with the
S-6 reason shown — in each of these cases, and in no others:

The **later** endpoint is the live round-open read and is unmeasurable only in the last row's case; the
first three rows are all observations on round N−1's anchor.

| Input | S-6 reason |
|---|---|
| At round N ≥ 2: no `DOC-BYTES:` line in any of round N−1's cross-review files | `no-anchor` |
| A line whose value is not a decimal integer ≥ 0 — non-numeric, signed, separators, empty | `unreadable-anchor` |
| Two or more `DOC-BYTES:` lines in one file with **unequal** values | `unreadable-anchor` |
| The phase's target is not a single readable document (Phase CR's directory target) | `non-document-target` |

Two or more `DOC-BYTES:` lines with **equal** values is an idempotent re-write and is read as one
value — the same rule M-4b already applies to `APPROVAL-HASH:`. A round whose several files disagree
on the value is `unreadable-anchor`: the anchor is a property of the document at the round, so the
files must agree. Negative growth is **measurable and normal** (a round that shortened the document)
and classifies *incremental* under AC-4.2; it is not an error.

**The first round of a window is not measured and raises no notice.** At round 1 there is no round 0,
and at round `N = W` of a reset window the predecessor belongs to a window whose findings the operator
has discharged, so a growth measured across that boundary would span the operator's intervention rather
than an optimizer's revision (TE v5 Q-08 — the answer is *"no, not deliberately"*, and v1.4 declines
it). In both cases the `growth-bytes` and `classification` cells are empty (AC-4.7) and **no S-6 notice
is raised** — an absent measurement that was never owed is not an unmeasurable one. Round `W`'s panel is
fixed full by AC-3.1 and needs no classification, which is the same treatment AC-2.1 and AC-2.8 already
give that round: **all four ACs now share one boundary**, and the boundary is the window, not the round
index (TE v5 F-03).

**AC-4.2 — Classification.**
*Who:* the review loop. *Given:* the growth `g` into round N, measured at round N's open (AC-4.1).
*When:* it selects **round N's** panel, before dispatching it. *Then:*

| Condition | Classification | Round N's panel |
|---|---|---|
| `g > 12,000` bytes | **new-mechanism** | full panel (AC-3.1's exception) |
| `g ≤ 12,000` bytes, including zero and negative | **incremental** | single verifier |
| growth unmeasurable | **unmeasurable** | full panel — fail safe |

**AC-4.3 — Why 12,000, and what the number means.**
The threshold is `MAX_AUTHORING_WRITE_BYTES` — **12,000 bytes, one pacing write**, already a constant
in the module and already stated verbatim to every wrapped authoring dispatch (M-5a). It is not a new
number and it is not a guessed round number: it is the largest revision an author can emit in a single
tool call under the pacing contract, so "more than one pacing write of growth" is exactly "this
revision was too big to be one edit". Its derivation is therefore **the pacing contract's**, not a
fresh estimate; this REQ inherits it rather than inventing one. For calibration against the measured
run: the predecessor's rounds grew 25.8, 22.3, 25.0, 28.1 and 38.2 KB — every one of the five would
have classified new-mechanism, which is the correct reading of a run in which every round added a new
mechanism.

**AC-4.4 — The threshold is a declared, named threshold.**
See §6. It is `MAX_AUTHORING_WRITE_BYTES`, default 12,000 bytes, owner: the `orchestrate-dev` workflow
module. Changing the pacing contract changes this classification with it, deliberately — they are the
same quantity and must not drift apart into two numbers.

**AC-4.5 — Unmeasurable growth fails safe to the full panel, and says which case it was.**
*Who:* the review loop. *Given:* the growth into round N ≥ 2 is unmeasurable in one of the four ways
AC-4.1 enumerates. *When:* round N's panel is selected. *Then:* the **full panel** is dispatched
and the run report carries the **S-6 notice** `growth-unmeasurable: {reason}` with the matching
closed-enum reason and the round it applied to. Failing safe here means failing *toward more review*,
which is the direction that cannot lose a finding.

The operator must be able to tell a *structural* unmeasurable — the target is a directory, so growth
does not exist there — from an *incidental* one, a missing or unreadable anchor on a round that should
have carried one. The reason enum is what carries that distinction: `non-document-target` is expected
and permanent; `no-anchor` and `unreadable-anchor` are defects worth looking at. This is the signal
round 1 of cross-review found missing (TE F-01).

**AC-4.6 — The optimizer is told to revise minimally.**
*Who:* an authoring agent addressing findings. *Given:* a revision dispatch. *When:* it receives its
prompt. *Then:* the prompt carries a **minimal-revision clause**: address every blocking finding, and
prefer the smallest edit that does so — a targeted edit over a rewritten section, a corrected clause
over a new subsection, a retraction over a retraction plus a new mechanism. The clause states the
consequence plainly: a revision that grows the document by more than one pacing write re-escalates the
next round to the full panel. This is a prompt clause, so it is directive rather than enforced; AC-4.2
is what actually bites, and the clause exists so the author knows the rule it is being measured
against.

**AC-4.7 — Growth is reported, in a fixed row schema.**
*Who:* the operator. *Given:* any completed review-loop phase, converged or halted. *When:* they read
the run report. *Then:* it carries **one row per round**, with exactly these columns:

| Column | Value |
|---|---|
| `round` | the round index N |
| `panel-shape` | the on-disk role-slug set at that round (§5), or `crashed` |
| `blocking` | `blocking(N)`, or `unavailable`, or `malformed` |
| `growth-bytes` | the signed integer growth into that round, or empty for round 1 and for an unmeasurable boundary |
| `classification` | `new-mechanism`, `incremental`, or `unmeasurable` (AC-4.2); empty for round 1 |
| `notice` | a **possibly-empty, ordered list** of S-3 … S-6 and S-11 notices, rendered as a `; `-separated string in the precedence order below |

**The AC-2.8 halt row is the one row with no dispatch behind it.** A round halted at open by AC-2.8 was
never dispatched, so it produced no cross-review files: `panel-shape` and `blocking` have no source, and
`growth-bytes` / `classification` are withheld deliberately rather than for want of one (AC-2.8, SE v5
G-12). Its row is: `round` = N; `panel-shape`, `blocking`, `growth-bytes` and `classification`
**empty**; `notice` = S-11 alone. It is stated in AC-2.8 and repeated here because AC-4.7's bar is
character-for-character derivability, and the mechanical derivation from absent files would render
`crashed` / `unavailable` / `unmeasurable` plus three spurious notices — reporting an authoring failure
as a reviewer crash (SE v4 G-02).

**The `notice` column is a list, in a fixed order, because notices co-occur.** v1.1 admitted "exactly
one of S-3 … S-6", which is unsatisfiable on a round that is reachable and unexceptional: a crashed
round raises `not-comparable: crashed-round` (AC-2.4) **and** `not-comparable: unavailable-count`
(AC-2.7) **and** `growth-unmeasurable: no-anchor` (AC-4.5) at once, so the expected report row was
underivable and O-10's required PROPERTIES assertion for that case could not be written (TE F-04). The
column therefore carries **every** notice the round raised, deduplicated, in this order:

| # | Notice | Why it sorts here |
|---|---|---|
| 1 | S-11 `no-revision:` | it is a halt decided before the round was dispatched, and it explains why the round exists at all. It appears alone (AC-2.8) |
| 2 | S-3 `fixed-point:` | a halt on the evidence of the round's own counts |
| 3 | S-4 `budget-exhausted:` | the other halt. **S-3 and S-4 can appear together**, on the last admitted round, in this order — AC-2.2 constructs exactly that case, and v1.2's single row claimed at most one could appear, which made the cell undecidable there (SE v4 G-01, TE v4 F-03) |
| 4 | S-5 `not-comparable: crashed-round` | the round's shape is the most general reason a comparison did not happen |
| 5 | S-5 `not-comparable: unequal-panel-shape` | shape known, but different from the predecessor's |
| 6 | S-5 `not-comparable: unavailable-count` / `malformed-count` | shape comparable, operand missing |
| 7 | S-6 `growth-unmeasurable: {reason}` | independent of comparability; **last of the seven** (TE v4 MF-04 — the ordering is over this closed list, not a standing rule about notices yet to exist) |

An empty list renders as an empty cell. The order is fixed here and not downstream because a test
author must be able to derive the exact cell, character for character, from this document alone.

The schema is part of §5's closed catalogue and is fixed **here**, not downstream: O-8 specifies where
the table is emitted and in what format, not what its columns are. Every column is derivable from the
branch alone — the cross-review basenames, the files' count trailers, their `REVIEW-MODE:` and
`DOC-BYTES:` anchors — which is what makes AC-2's fixed-point determination re-derivable after the
fact by a reader who was not there. This is the artifact the predecessor's post-mortem had to be
reconstructed by hand (US-03).

**Observability.** Two integers read from two anchor lines on the branch, one comparison against a
constant, one row per round in a report. No in-process state.

---

### REQ-RCV-05 — Findings that require a measurement are routed, not answered in prose

**Priority:** P0 · **Phase:** 1 · **Source:** US-04, US-03 · **Depends on:** BL-01

The primary root cause. Generator classes A and B never closed across five rounds because both turn on
properties of the workflow runtime that nobody had measured. Every candidate answer was a guess about
unobservable behaviour, every guess was falsifiable by a reviewer-constructed scenario, and the
author's only moves were to guess differently or to convert the defect into an accepted risk. That
process has **no fixed point** below the point where the fact gets measured. The measurements were
cheap. They were never the REQ's job — and filing them as blocking REQ findings is what made them the
REQ's job.

**AC-5.1 — The test a reviewer applies.**
*Who:* a reviewer (full panel or verifier). *Given:* a finding they are about to file. *When:* they
classify it. *Then:* if **resolving** the finding requires a measurement against the real workflow
runtime — a fact about what the runtime does that is not established at HEAD — it is **not** a
blocking finding. The test is about the *resolution*, not the topic: "this clause contradicts that
one" is answerable from the document and blocks; "this clause depends on what an exhausted retry
returns, which nobody has measured" is not answerable from the document and does not block.

**AC-5.2 — Where it goes.**
*Who:* a reviewer. *Given:* such a finding. *When:* they write their cross-review file. *Then:* it
goes in a section headed exactly `## Measurement Required`, one item per finding, each naming: the
fact to be measured, how it could be measured, and what it would settle. The section is
**non-blocking** — it does not contribute to the `high`/`medium` counts AC-2 reads, and its presence
alone never prevents an `Approved` verdict.

**AC-5.3 — Authors must not answer these in prose.**
*Who:* an authoring agent. *Given:* a `## Measurement Required` item on its document. *When:* it
addresses the round's findings. *Then:* it **does not** invent a mechanism, choose an unobservable, or
convert the item into an accepted risk. It may record the item and its status; it may not resolve it.
Answering such an item in prose is precisely the act that produced R-9, R-10 and R-12 on the
predecessor — three "resolutions" that name the failure the design tolerates rather than removing it.

**AC-5.4 — The loop carries them into the report.**
*Who:* the review loop. *Given:* a round's cross-review files. *When:* the round completes. *Then:*
the loop extracts each file's `## Measurement Required` section and carries the items into the run
report, attributed to their round and role. The operator therefore ends every phase — converged or
halted — with a list of the measurements the phase is waiting on, without opening a cross-review file.

**An approval reached with items outstanding says so.** The phase outcome in the run report reads
`approved, {n} measurements outstanding` when `n > 0`, and plain `approved` when `n = 0`. AC-5.2 makes
the section non-blocking on purpose, but a terminal approval that leaves unsettled measurements
recorded only inside a cross-review file is a state the operator should see named (TE F-09). The count
is a report field only: it is **not** an approval condition, changes no verdict, and never gates the
phase.

**AC-5.5 — An absent section is normal.**
*Who:* the review loop. *Given:* a cross-review file with no `## Measurement Required` section.
*When:* extraction runs. *Then:* it contributes nothing and is not an error. Most rounds will have
none. The section is optional and its absence is never a halt, a warning, or a completeness failure —
it is **not** part of the cross-review completeness criterion, which remains the trailing `## Verdict`
section and its single `VERDICT:` line, plus the count trailer AC-3.4 adds.

**Receive side (DC-01 totality) for `## Measurement Required` (S-7):** absent ⇒ contributes nothing,
never an error; present but empty ⇒ contributes nothing; present with a body the loop cannot parse
into items ⇒ the body is carried **verbatim** into the report under its round and role, never dropped
and never an error; two or more such sections in one file ⇒ their bodies are concatenated in document
order. There is no input on which extraction fails, because nothing downstream of it is gated.

**Observability.** The presence and content of a named markdown section in files on disk; a list in
the run report. Note the self-application: this REQ's §4.7 names the two unmeasured facts it declines
to depend on, which is what AC-5 asks every reviewer and author to do.

---

### REQ-RCV-06 — Citation accuracy is checked by a program

**Priority:** P1 · **Phase:** 1 · **Source:** US-06 · **Depends on:** BL-01, BL-05

POSTMORTEM R-6 already ruled `file:line` citation drift *"verifiable by a script"* that *"should never
consume a review round again"*. It then consumed part of every round anyway — surviving a dedicated
`Citation baseline` header row, a symbol-plus-literal drift-proofing convention, and four rounds of
attention, before reappearing at round 5 as two off-by-two line numbers **at the very sha the header
row named**, plus a function cited in call form that does not exist at HEAD. That is sufficient
evidence that prose discipline does not fix it. The remedy is a program.

**AC-6.1 — A new library, and where it lives.**
*Who:* a maintainer. *Given:* the repo. *When:* they look for the checker. *Then:* it is a module
under `pdlc/workflows/lib/`, a sibling of `document-oracles.mjs` (M-6a).

**AC-6.2 — Import-safe.**
*Who:* anything importing it. *Given:* the module. *When:* it is imported. *Then:* **nothing
happens** — no filesystem access, no argument parsing, no output, no process exit. Every export is a
pure function of its arguments. This is the same discipline `document-oracles.mjs` states in its own
header, and it is stated as an AC because `build-runtime.mjs` in this same repo is *import-unsafe* and
that has already cost a finding (M-6c, LEARNINGS §2 and §5.3). A module that acts on import cannot be
unit-tested, and cannot be called from a second caller.

**AC-6.3 — A CLI entry.**
*Who:* a reviewer, an author, or a human at a terminal. *Given:* one or more document paths and a
repo root. *When:* they run the CLI. *Then:* it reports every bad citation with the file and line it
was found at, what was expected and what was found, and exits **non-zero** if any citation is bad,
zero otherwise. The CLI is a separate entry point from the library (AC-6.2), not a side effect of it.

**AC-6.4 — The citation grammar is a closed catalogue, and the checker is total over it.**
*Who:* the checker. *Given:* a markdown document. *When:* it runs. *Then:* it extracts citations
matching **exactly these forms, and no others**:

| id | Form | Example | Resolution |
|---|---|---|---|
| **C-1** | repo-root-relative path + `:` + line | `pdlc/workflows/orchestrate-dev.js:52` | the path, resolved against the repo root |
| **C-2** | repo-root-relative path + `:` + range | `pdlc/workflows/orchestrate-dev.js:2215-2217` | same; both endpoints checked |
| **C-3** | bare basename + `:` + line or range | `orchestrate-dev.js:1436` | **reported as a grammar defect, not resolved.** A basename is ambiguous under the repo root and the checker does not guess. |
| **C-4** | bare `:` + line or range, no path | `` `:1574` `` | **reported as a grammar defect, not resolved.** There is no anchor to resolve it against; "nearest preceding full path" is a heuristic that fails silently on the exact defect this checker exists to catch. |

**Range separator:** the ASCII hyphen `-` only. An en-dash range (`2215–2217`) is form C-3/C-4's
sibling defect and is **reported as a grammar defect** with the fix ("use `-`") named. One separator,
stated in one place, so the document and the checker cannot disagree.

**Exempt regions: a quoted example is not a citation.** Before extraction the checker excludes two
regions, and reports nothing from either:

1. **Fenced code blocks**, exactly as `scanLines` already excludes them so that *"a quoted example
   anchor cannot fabricate an ambiguity"* — the JSDoc above `approvalAnchorPreCount` at
   `pdlc/workflows/orchestrate-dev.js:1907-1910`, over the helper `scanLines` at
   `pdlc/workflows/orchestrate-dev.js:569`. This REQ adopts that existing rule rather than inventing a
   second one.
2. **A table row whose first cell is an id in the C-1 … C-4 catalogue**, i.e. the catalogue's own
   `Example` column above. Such a cell is a *specimen* of a form, not a claim about a file.

Without exemption 2 this document is a permanent counter-example to its own rule: the C-3 and C-4 rows
above contain the only two non-C-1/C-2 tokens in the file, they are illustrative by construction, and
AC-6.5 tells an author to fix reported items **without a round of discussion** — so an author following
both ACs would delete the catalogue's examples and leave the catalogue unable to show what it forbids
(TE F-06). Exemption 2 is stated at REQ altitude, not left to FSPEC, because it decides the checker's
output on a real corpus.

**Unparseable input is reported, never silently skipped.** Outside the exempt regions, a token that
looks like a citation — any `:` followed by digits inside backticks — but matches none of C-1 … C-4 is
reported as `unparseable` with its file and line. The checker never fails, never throws, and never exits on a parse problem; it
accumulates. This is the receive-side totality DC-01 requires (TE F-02).

For each citation that resolves (C-1, C-2) the checker performs three checks:

| # | Check | Fails when |
|---|---|---|
| 1 | **Path existence** | the cited path does not exist under the repo root |
| 2 | **Line-range validity** | the cited line, or either end of the cited range, is beyond the end of the cited file, or the range is inverted |
| 3 | **Nearby symbol presence** | the citation's surrounding prose names a backticked symbol or literal that does not appear in the cited file within a tolerance window around the cited line |

**Why the grammar had to be fixed here rather than in the FSPEC.** Measured over v1.0 of this very
document, 3 citations were C-1, 13 were bare basenames and 14 were bare `:NNN` — so the checker as
first specified would have reported the 13 as nonexistent paths and never seen the 14 at all, i.e.
been false-positive or blind on ~82% of the corpus it exists to check (TE F-02). The recurring P-4
defect lived precisely in those two forms. v1.1 normalises every citation in this document to C-1/C-2
(TE MF-02, MF-03) and the header states the convention; C-3 and C-4 remain in the catalogue as
**named defects** so that a document which drifts back to them is told so, rather than passing
vacuously.

**Check 3's window has a stated direction.** It catches the defect that actually recurred — a line
number that drifted by two while still pointing inside a real file — so the window must be **wide
enough that the motivating two-line drift passes on symbol presence, and narrow enough that a symbol
belonging to a different function fails**. Concretely: materially wider than 2 lines, materially
narrower than a typical function's separation in this module. The exact value is a tuning parameter
with no product consequence and remains an FSPEC decision (§6, O-6); the direction is fixed here so
the AC determines the outcome of its own motivating example (SE F-12).

**AC-6.5 — Output is mechanical fixes, not findings.**
*Who:* a reviewer. *Given:* the checker's output on a document under review. *When:* they write their
cross-review. *Then:* bad citations are reported as **mechanical fixes** — a list to be applied — and
are **not** filed as blocking findings, do not contribute to the `high`/`medium` counts AC-2 reads,
and never prevent an `Approved` verdict on their own. An author fixes them without a round of
discussion. Both the reviewer SKILLs and the author SKILLs are amended to run the checker and to treat
its output this way.

**AC-6.6 — Not in the runtime bundle.**
*Who:* the build. *Given:* the new library. *When:* `build-runtime.mjs` runs. *Then:* the library is
**not** inlined into `orchestrate-dev.bundle.js` or `orchestrate-queue.bundle.js`. It is the same class
as `document-oracles.mjs` (M-6b): production code that runs under Node, called by SKILLs and by
humans, never by the workflow runtime. The runtime's structural constraints (no `import`, no `fs`, no
`process`) therefore do not apply to it, and it must not acquire a caller inside the bundle.

**AC-6.7 — Tested by the existing suite.**
*Who:* CI. *Given:* the new library. *When:* `npm test` runs in `pdlc/workflows`. *Then:* the library's
tests run with it, under the existing jest configuration and with no new tooling or dependency
(M-6d).

**AC-6.8 — Advisory, never a gate.**
*Who:* the pipeline. *Given:* a non-zero exit from the checker. *When:* a phase is running. *Then:*
the pipeline does **not** halt. The checker's status is advisory: it produces a fix list. Making it a
gate would convert a mechanical nuisance into a pipeline halt, which is the opposite of the change.

**Observability.** A program, its stdout, and its exit code.

## 6. Declared thresholds

Every configured value any AC above depends on, with its default and its owner. A threshold not in
this table is a defect in this document.

| Name | Default | Owner | Cited by | Derivation |
|---|---|---|---|---|
| `MAX_REVIEW_ROUNDS` | **3** (was 5) | `pdlc/workflows/orchestrate-dev.js`, module scope (M-1a) | AC-1.1, AC-2.6 | Operator decision, evidenced by §1.1: the measured blocking count reached its minimum at round 2 and rose thereafter; rounds 4 and 5 added 40% of the document and ended with more blocking findings than round 2. |
| `MAX_AUTHORING_WRITE_BYTES` | **12,000 bytes** (unchanged) | `pdlc/workflows/orchestrate-dev.js:56`, and stated verbatim in `PACING_CONTRACT_CLAUSE` at `pdlc/workflows/orchestrate-dev.js:2279` (M-5a) | AC-4.2, AC-4.3 | **Inherited, not new.** It is one pacing write — the largest revision an author can emit in a single tool call. AC-4 deliberately reuses this quantity rather than introducing a second growth number, so the two cannot drift apart. |
| Verifier role slug | **`verifier`** | `pdlc/workflows/orchestrate-dev.js` + the verifier SKILL | AC-3.4, AC-3.5(a), AC-2 panel shape | v1.0 left this unfixed. It is a **key** three mechanisms are stated over — the cross-review file path (M-3b), the approval marker's owning file, and AC-2.4's panel-shape set equality, which compares *sets of these strings* (SE F-11). A key with no value cannot be compared, so the REQ fixes the default here. It matches the existing slug shape (`software-engineer`, `test-engineer`: lower-case, hyphenated, no role suffix). FSPEC may rename it, but only by amending this row — it may not leave it unset. |
| `REVIEW-MODE: verification` | that exact literal | **`appendRoundAnchors`** — every verifier round, whatever its verdict (AC-3.5(a)) | AC-3.5(a), AC-3.5(b) | Follows the existing `APPROVAL-HASH:` / `REVIEWED-COMMIT:` anchor convention — a bare `KEY: value` line, in the same block, parsed by the same style of anchored regex. v1.1 assigned it to `appendApprovalAnchors`, which runs only on the approving round, so a *failed* verifier round carried no marker (SE F-02). |
| `## Measurement Required` | that exact heading | the three review SKILLs | AC-5.2, AC-5.4 | Follows the existing `## Verdict` convention: an exactly-named top-level section the loop extracts. Deliberately **not** part of the completeness criterion (AC-5.5). |
| Symbol-proximity window (AC-6.4 check 3) | **±25 lines**, FSPEC may tune | the new `pdlc/workflows/lib/` module | AC-6.4 | AC-6.4 fixes the *shape* (presence within a window, not exact-line match), its reason, and now its **direction** — wide enough that the motivating two-line drift passes, narrow enough that a symbol in a different function fails (SE F-12). ±25 lines is a stated default satisfying both bounds against this module's function sizes; it is a tuning parameter with no product consequence and O-6 may change the number, not the direction. |
| `DOC-BYTES: {n}` | that exact literal, `{n}` a decimal integer ≥ 0 | **`appendRoundAnchors`** — every round (AC-4.1) | AC-4.1, AC-4.2, AC-4.5, AC-2.8 | The durable home of AC-4's growth endpoints (S-2). Follows the existing `KEY: value` anchor convention exactly. v1.1 named `appendApprovalAnchors` as its writer; that function runs only on the approving terminal round, so the anchor was absent on precisely the failing rounds AC-4 measures (SE F-01, TE F-01). |
| `DOC-SHA256: {64 hex}` | that exact literal, `{64 hex}` lower-case, **bare** (no `sha256:` prefix) | **`appendRoundAnchors`** — every round, same instant, same read (AC-4.1) | AC-2.8 | The durable home of AC-2.8's identity test (S-10). It exists so *"the document did not change"* is decided exactly rather than by byte length alone. The value is `sha256Hex`'s (`pdlc/workflows/orchestrate-dev.js:696`), i.e. **over `canonicaliseForDigest`'s output** (`:615`; its JSDoc `:600-614`) — the tier-1 hashing reused verbatim, and therefore **not** a digest of the raw bytes `DOC-BYTES:` counts. v1.2 claimed both, and the two cannot hold together (SE v4 G-03); AC-2.8's conjunction of the two anchors is what recovers byte-exactness. |
| `## Disposition` / `New-mechanism:` | those exact literals | the verifier SKILL (AC-3.2) | AC-3.2(1), AC-3.2(2), AC-2 | S-8 and S-9. Each is the structural artifact that makes one AC-3.2 clause falsifiable; without them a verifier that obeyed the clause and one that ignored it produced identical files (TE F-05, F-06). |

**Every threshold now carries a value.** v1.0 left two rows with *"unfixed — FSPEC decides"* in the
Default column, against this section's own stated obligation (SE F-11). Both now have a default: the
verifier slug because it is a comparison key and a key without a value cannot be compared, and the
proximity window because AC-6.4 must determine the outcome of its own motivating example. FSPEC may
change either number or string; it may not leave either unset, and a change is an amendment to this
table.

## 7. Non-goals and out of scope

Stated so a reviewer does not file a blocking finding against an absence that is intentional.

| # | Not in scope | Why |
|---|---|---|
| **N-1** | Making non-convergent documents converge. | This REQ bounds and explains failure. §2 says so explicitly. A finding of the form "this will not make the loop converge" is correct and is not a defect. |
| **N-2** | Normalising blocking counts across panels of different size. | AC-2.4 declines it: a sum over two reviewers and a sum over one are not the same measurement, and any normalisation is a guess. R-2 records the cost. |
| **N-3** | Changing the cross-review file grammar **beyond the one change AC-3.4 names**. | *Amended in v1.1 (SE F-10).* The filename form `CROSS-REVIEW-{role}-{doc}-v{N}.md`, the trailing `## Verdict` section and its single `VERDICT:` line are **unchanged**. The **one** change is AC-3.4's: the `{"high": N, "medium": N, "low": N}` count trailer, today required only in the reviewer's *response* (M-2g), becomes required **in the file**, inside the `## Verdict` section — because AC-2 now reads both its operands from files and a file without the trailer would read as a genuine `0/0/0` (M-2c). The corresponding SKILL amendment is O-9. `## Measurement Required` (AC-5.2), `## Disposition` (AC-3.2) and the `DOC-BYTES:` / `DOC-SHA256:` / `REVIEW-MODE:` anchor lines are **additions**, not changes: the first two are sections no existing reader looks for, and the anchors extend an anchor block that already exists (M-4a). **The findings table is not a parsed data contract**: AC-3.2(2)'s `New-mechanism:` field binds the verifier that writes it and is read by no component of the loop (S-9), so no findings-table grammar is introduced and none is needed (SE F-03, TE F-03). |
| **N-4** | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation, and the human-written `RESOLVED: yes` marker are untouched. This REQ changes *when* a halt happens and *what it says*. |
| **N-5** | Extending tier-2 (LEARNINGS) approval records to verifier rounds. | AC-3.6 permits the limitation, provided it is documented. R-3. |
| **N-6** | Taking the two measurements §4.7 names. | They are genuinely worth taking, and they are not this REQ's deliverable. R-4. |
| **N-7** | Applying AC-1 … AC-4 to Phase CR **or to Phase DOD**. | AC-3.3: both phases' optimizers change code, not the reviewed document, so growth is unmeasurable and the mechanism does not apply; Phase DOD additionally writes `CODE_REVIEW-*` artifacts, which none of the round-window, panel-shape or anchor mechanisms is stated over. *Widened in v1.2 (TE Q-01).* |
| **N-8** | Applying AC-6's checker as a merge or pipeline gate. | AC-6.8: advisory only. |
| **N-9** | Changing `orchestrate-queue`, the drift gate, or the queue schema. | Nothing here touches them. The queue row for this feature is added by the orchestrator, not by this document. |
| **N-10** | Model selection per phase. | Unchanged: Opus everywhere except Phase I batches and the queue's Phase-0 triage. Whether a verifier round could run on a smaller model is a legitimate later question and is not asked here. |

## 8. Downstream obligations

This section is the **discharge point for the preamble's stopping rule**. A review finding of the form
"this AC has no oracle / no fixture / no seam / no test" is answered here: it is an obligation on the
FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision.

| # | Obligation | Owner |
|---|---|---|
| **O-1** | Specify how the loop threads a **per-round reviewer list** through `reviewLoop`, replacing the two named result bindings, the positional `reviewers[0]`/`[1]` dispatch and the two-element `lastResults` construction (M-3a, AC-3.5(d)). | FSPEC → TSPEC |
| **O-2** | Specify the amended same-round-approval rule: how `selectMode` evaluates rule 2 against the roles dispatched **at the round being judged** rather than the accumulated role set (M-3c, AC-3.5(c)), and what happens on a branch that carries a mixture of dual and verifier rounds. | FSPEC → TSPEC |
| **O-3** | Specify the verifier role's SKILL file and whether it is a new SKILL or a mode of an existing review SKILL (AC-3.7). **Its slug is not open**: §6 fixes it at `verifier`, and a rename is an amendment to §6, not an FSPEC decision. | FSPEC |
| **O-4** | Specify the **write path** of `appendRoundAnchors` — the unconditional per-round writer AC-4.1 names — for the `REVIEW-MODE: verification`, `DOC-BYTES: {n}` and `DOC-SHA256: {64 hex}` lines: where in `reviewLoop` it is called so that the round's files exist and AC-2 has not yet been evaluated, and how each line composes with the existing anchor pre-count semantics (0 / 1-equal / 1-unequal / ≥2 — M-4b) it shares with `appendApprovalAnchors`. **Whether it is a new function or a parameterised extension of `appendApprovalAnchors` is an FSPEC decision; that it runs on every round, whatever the verdict, is not** — that is AC-4.1 and AC-3.5(a), and it is the whole of SE F-01 / TE F-01 / SE F-02. Likewise **the meaning of every non-canonical input is not open**: AC-3.5(e) fixes all six `REVIEW-MODE:` rows, AC-4.1 fixes the four `DOC-BYTES:` inputs, and AC-2.8 fixes the four `DOC-SHA256:` inputs, because DC-01 requires the receive side to be total *before* FSPEC authoring and v1.0 deferred it *to* the FSPEC (SE F-05, TE F-07). O-4 specifies the plumbing, not the semantics. | FSPEC → TSPEC |
| **O-12** | Specify where AC-2.8's byte-and-hash identity test is evaluated — after round N−1's anchors are readable and **before** round N's reviewers are dispatched — and how the S-11 halt reaches the post-mortem writer on the same path as S-3 and S-4 (AC-1.4). Specify the **single round-open read** AC-4.1 and AC-2.8 share, so the two never see different bytes. Note it must not consume a round of AC-1's budget, and that an S-11 halt cleared by the operator resumes the window rather than resetting it (AC-1.5(5)). | FSPEC → TSPEC |
| **O-5** | Specify where in the loop AC-2's comparison is evaluated so that it precedes the optimizer dispatch (AC-2.1), and how its halt reason reaches both the post-mortem prompt and the run report distinctly from budget exhaustion (AC-2.2). Specify the **post-mortem write confirmation** AC-1.4 now requires: after any halt that rewrote an existing post-mortem, the loop confirms the reset region survived — every prior `RESOLVED:`, `WINDOW-START:` and `HALT-REASON:` line still present — and reports a lost region rather than proceeding on a silently widened window. | TSPEC |
| **O-6** | Specify the checker's **implementation and output format** against AC-6.4's closed grammar (C-1 … C-4), and tune the symbol-proximity window if ±25 lines proves wrong. **The grammar, the range separator, the unparseable-input behaviour and the window's direction are not open** — AC-6.4 and §6 fix them (TE F-02, SE F-12). | FSPEC → TSPEC |
| **O-7** | Specify **how** the `## Measurement Required` section is located and rendered in the report (AC-5.2, AC-5.4). Its receive-side behaviour on absent, empty, unparseable and duplicated sections is fixed by AC-5.5 (S-7). | TSPEC |
| **O-8** | Specify **where** AC-4.7's per-round table is emitted, for both converged and halted phases, and in what rendering. **Its columns are not open** — AC-4.7 fixes the six-column schema and §5 records it as part of the closed catalogue. | TSPEC |
| **O-9** | Write the SKILL amendments: (a) the three review SKILLs — AC-5.1, AC-5.2, AC-6.5, **and AC-3.4's requirement that the count trailer appear inside the file's `## Verdict` section as well as in the response** (the one file-grammar change, SE F-10); (b) the three author SKILLs — AC-5.3, AC-4.6, AC-6.5; (c) the verifier's disposition-check contract — AC-3.2, including the `## Disposition` section (S-8) and the per-finding `New-mechanism:` field (S-9); **(d) the post-mortem prompt — a belt-and-braces clause telling the agent that the `## Reset Region` section (S-12) is machine state and must be left alone.** At the Citation baseline that prompt is a bare `Write ${postmortemPath}.` plus a section list, built inline in **`reviewLoop`** (`pdlc/workflows/orchestrate-dev.js:1725-1730`, local `postmortemPrompt`), so nothing today tells the agent anything in that file is precious (SE v4 G-04, TE v4 F-02). **It is not the mechanism**: AC-1.4 requires the loop to re-apply the region deterministically after the dispatch (O-5), precisely so correctness does not rest on an agent's compliance (TE v5 MR-05). v1.3 cited this prompt as `writePostmortem` at `:1912-1918` — the range at `main`, and a symbol that exists at neither commit (SE v5 MF-1, TE v5 F-05). | FSPEC → implementation |
| **O-10** | Properties and tests for all six ACs, including the negative cases this REQ names explicitly: the `0 ≥ 0` non-firing (AC-2.5), the malformed-count chain break in **both** directions (AC-2.3), the *unavailable*-count chain break (AC-2.7), the unequal-panel-shape and crashed-round non-comparisons (AC-2.4), the lone-file-without-marker fail-closed (AC-3.5(b)), all **six** `REVIEW-MODE:` rows (AC-3.5(e)), the **four `DOC-BYTES:` inputs and their three reasons** (AC-4.1) with unmeasurable growth escalating rather than degrading (AC-4.5), a missing `## Disposition` refusing approval without halting (AC-3.2), and AC-6.4's C-3/C-4/en-dash/unparseable citation forms each being *reported* rather than skipped or fatal. Added in v1.2: **the crashed-round report row**, whose `notice` cell carries three co-occurring notices in AC-4.7's stated precedence order (TE F-04); **a failed verifier round comparing as `{verifier}` and not as *crashed*** (AC-2.4, SE F-02); **the zero-delta halt** and each of AC-2.8's three non-halting inputs, including the fail-open on an absent `DOC-SHA256:` (TE F-07); **an absent, unparseable and duplicated `WINDOW-START:` each yielding no reset** (AC-1.5(4)); **an anchor line following `VERDICT:` reading as *unavailable*, not *malformed*** (AC-2.7); and **AC-6.4's own C-3/C-4 example cells producing no report item** (TE F-06). Added in v1.3: **the two-halt row**, whose `notice` cell carries S-3 then S-4 on the last admitted round (AC-2.2, AC-4.7 — SE G-01/TE F-03); **the AC-2.8 halt row**, four empty cells and `notice` = S-11 alone (SE G-02); **round 2's panel selected from the growth into round 2**, both classifications, with round 1 raising no S-6 notice (TE F-01); **a second halt preserving the reset region**, and the counted one-shot rule over a region carrying two `RESOLVED: yes` lines and one `WINDOW-START:` (AC-1.4, AC-1.5(4) — TE F-02); **an S-11 halt cleared without consuming the reset** and **a first-round-of-window zero-delta not halting** (AC-1.5(5), AC-2.8 — TE F-04); **`VERDICT:` → anchor → valid trailer reading as a count, not as *unavailable*** (AC-3.4's algorithm, AC-2.7 — SE G-05/TE F-06); and **a line-endings-only revision not firing AC-2.8** (equal digest, unequal byte count — SE G-03). | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the C-2 runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed** (the adapter's implementations are async; the test doubles are sync, so a missing `await` passes the tests and fails at runtime). AC-6's library must acquire no caller inside the bundle (AC-6.6). | implementation |

## 9. Risks, assumptions and deferrals

### 9.1 Assumptions

| # | Assumption | If false |
|---|---|---|
| **A-1** | Reviewers reliably emit the `{"high": N, "medium": N, "low": N}` count trailer. Measured on the predecessor: **7 of 10** files carried it; the three that did not were all rounds 1–3 of one reviewer, and `recoverVerdict` (M-2d) exists to recover exactly that case. | AC-2 fires less often than expected. It never fires *wrongly* — AC-2.3 makes an unreadable count break the chain rather than trigger it. This is a degradation, not a defect. |
| **A-2** | A single verifier in disposition-check mode catches what a second reviewer would have caught on rounds 2+. Evidenced by §1.3: across ten reviews the two reviewers converged rather than disagreeing. | AC-3 loses findings on later rounds. AC-4 is the compensating control — any revision large enough to contain a genuinely new mechanism re-escalates to the full panel. |
| **A-3** | Byte growth is a usable proxy for "this revision added new mechanism". | AC-4 misclassifies. Both directions fail toward *more* review or toward the same review: a large tightening escalates unnecessarily (costly, safe), and a small new mechanism is read by a verifier who is still instructed to raise blocking findings in new-mechanism text (AC-3.2 clause 2). |
| **A-4** | Reviewers can apply AC-5.1's test — "does resolving this require a measurement?" — consistently. | Findings are misrouted. Misrouting *toward* `## Measurement Required` weakens the loop; misrouting *away* from it reproduces the predecessor's failure. This is a prompt-quality risk with no mechanical control, and it is the weakest of the six changes. R-5. |

### 9.2 Risks

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour.** Five rounds, dual panel, no enforced stop, no measured growth, no citation checker. The predecessor's Phase R died exactly here. | Mitigated by the preamble's stopping rule, by §4.7's explicit naming of the two unmeasured facts no AC depends on, and by keeping this document short. **Accepted, and unenforceable** — the enforcement is AC-2, which has not shipped. The operator is asked to watch the trajectory table and halt at the fixed point by hand. |
| **R-2** | **How much AC-2 saves depends on the regime, and in one regime it is close to inert.** *Restated in v1.1 (SE F-09, TE F-03).* v1.0 asserted that the only comparable consecutive same-shape pair is (2, 3) and therefore that the rule fires at most once, saving one optimizer episode. That is true of the **target** regime only. In the **measured** regime — every round re-escalated to the full panel by AC-4.2 — rounds 1, 2 and 3 are all dual, both (1,2) and (2,3) are comparable, and a fire at round 2 saves a full round of *reviewers* as well. AC-2.6's table enumerates every reachable sequence. | **Accepted and enumerated in AC-2.6 rather than stated as a single figure.** In every reachable sequence the rule fires at most once per phase; what varies is where it can fire and therefore what it saves. Successor: `docs/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md` — revisit cross-panel comparability (N-2) once real runs exist to calibrate against. |
| **R-9** | **A count-only fixed point cannot distinguish a plateau from complete finding turnover.** *New in v1.3 (SE v4 G-06).* Demonstrated by this document's own review: blocking counts 10, 5, 5, 5 — AC-2.1 would fire on rounds 3→4 — yet **zero** of round 3's findings survived into round 4; all were closed and all five round-4 findings were defects in text v1.2 had just added. AC-4.2 would have classified that revision `new-mechanism` and re-escalated to the full panel, so the two mechanisms disagree about the same round. | **Accepted, Low, and recorded rather than fixed here.** The cost is a false-positive halt — one operator interaction on a round that made large, correct progress — never a wrong approval, and R-2 already accepts the coarseness of count-only comparison (N-2). A finding-identity test would need a findings-table grammar N-3 declines to introduce. Successor: the same calibration REQ as R-2, which now carries *"does the fixed-point test need finding identity, not just count?"* as a fourth question. |
| **R-3** | **Tier-2 approval records will have gaps** for verifier-approved rounds (AC-3.6). | Accepted, with the limitation documented in LEARNINGS and the run report. Tier 2 is already best-effort and excluded from the completeness criterion. Successor: `docs/pdlc-approval-record-tier2/REQ-pdlc-approval-record-tier2.md`. |
| **R-4** | **The two unmeasured runtime facts (§4.7) remain unmeasured**, so the predecessor's generator classes A and B stay open. | Out of scope by N-6. AC-5 is what stops them consuming review rounds in the meantime; it does not settle them. Successor: `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`, which carries POSTMORTEM R-3's spike. |
| **R-7** | **AC-3.4's file-grammar change lands before every reviewer emits the trailer in the file.** A review written by an un-amended SKILL carries no in-file trailer, so AC-2 reads its round as *unavailable* (AC-2.7). Measured on the predecessor, 7 of 10 files carried a trailer at all (A-1). | Accepted and degradation-only, by construction: an *unavailable* round breaks AC-2's chain in both directions and never fires the rule (AC-2.7), so a lagging SKILL costs a comparison, never a wrong halt. O-9 amends the three review SKILLs in the same delivery. |
| **R-5** | **AC-5, AC-4.6 and AC-3.2(2) are prompt clauses, so they are directive rather than enforced.** An agent that ignores them is not detected. *Widened in v1.2 (SE F-03, TE F-03).* AC-3.2(2) joins the list explicitly: the verifier excludes an unbindable finding from the counts it writes, and no reader can check that it did, because checking would require parsing the findings table — a grammar N-3 declines to introduce. | Accepted, and now stated rather than implied. AC-4.2 and AC-2 remain the mechanical controls; AC-5's mechanical half is only the extraction (AC-5.4). The mechanical residue of AC-3.2(2) is that `blocking(N)` keeps **one** definition — the count trailer — so a verifier that ignores the clause produces a *higher* count, which can only make AC-2 halt earlier, never later. The failure direction is safe. A finding that any of the three is unenforceable is **correct and known** — file it as Low. |
| **R-8** | **A round can be dispatched against a document no authoring episode revised.** Observed on this REQ: round 3 of its own Phase R reviewed a byte-identical file because the round-2 authoring episode produced no commit, and the loop had no way to notice (SE F-08, TE F-07). | **Mechanised, not accepted** — AC-2.8 makes it a halt with its own reason (S-11) rather than a consumed round. Two residues remain and are not this REQ's deliverable: an authoring episode that produces no write still *reports success* to the loop, and the authoring watchdog has no zero-write check. Both belong to the authoring path, not the review loop, and are carried to the successor named in R-4's row of §9.3 alongside the runtime-behaviour spike, since detecting them requires the same unmeasured fact — how an exhausted or stall-killed dispatch surfaces to its caller (§4.7). |
| **R-6** | **A branch carrying a mixture of dual and verifier rounds is a state the existing approval machinery has never seen.** Three separate call sites encode "two reviewers" (M-3a, M-3c, M-3d). | This is the highest-risk part of the change and is why AC-3.5 states four separate constraints rather than one. O-1, O-2, O-4 and O-10 discharge it downstream. |

### 9.3 Deferrals and their binding

DC-08 requires every deferred capability to be bound to a **named successor surface** — a queue row, a
hand-off row, or a follow-up REQ — not to prose. v1.0 declared all three of its deferrals **Unbound**
and offered an "Unbound" label plus prose intent as the binding, which is precisely what DC-08 forbids
(SE F-06). DC-08 accepts three binding surfaces and only one of them is the queue, which the authoring
agent is correctly forbidden to touch. **All three are therefore now bound to successor REQ files that
exist on this branch:**

| Deferral | Bound to | Status |
|---|---|---|
| Cross-panel count comparability (R-2, N-2) | `docs/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md` | **Bound.** Stub REQ, `ready: false`, depends-on `pdlc-review-convergence`. Carries the inherited problem, the three questions it would decide, and its prerequisite that ≥ 5 phases' AC-4.7 tables exist to calibrate against. |
| **Finding-identity in the fixed-point test** (R-9) | the same stub, `docs/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md` | **Bound.** The same successor and the same prerequisite: deciding whether a plateau of *count* is a plateau of *findings* needs the AC-4.7 tables of several real phases, which do not exist yet. |
| Tier-2 approval for verifier rounds (R-3, N-5) | `docs/pdlc-approval-record-tier2/REQ-pdlc-approval-record-tier2.md` | **Bound.** Stub REQ, `ready: false`. Carries the three deliverables, including removing AC-3.6's documented-limitation text in the same change that closes the gap. |
| Measuring the two runtime facts of §4.7 (R-4, N-6) | `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md` | **Bound.** Stub REQ, `ready: false`, no dependencies — it is measurable today. Carries both facts (MR-1, MR-2) with a proposed method and what each would settle. |
| **Detecting an authoring episode that produced no write** (R-8's residue) | the same stub, `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md` | **Bound.** AC-2.8 catches the *symptom* on the review side — a round whose document did not change — and halts. Catching the *cause* on the authoring side means knowing how an exhausted or stall-killed dispatch surfaces to its caller, which is exactly MR-1's unmeasured fact (§4.7), so the residue is bound to the same spike rather than to a new file. Nothing in this REQ depends on that measurement (§1.4). |

Each stub is `ready: false`, so none is queue-eligible until an operator specifies it and opts it in.
That is the intended state: DC-08 asks for a **checkable successor surface**, not for scheduled work.
Adding queue rows remains an operator action — the authoring agent does not modify
`docs/_queue/QUEUE.md` — but the deferrals no longer depend on that action to be bound.

The precedent is explicit in DC-08's origin note: `pdlc-workflow-distribution`'s deferral check passed
three DoD rounds running **because** its deferrals were bound to real successor surfaces. The
counter-precedent is equally explicit and is why the third row exists at all — POSTMORTEM R-3
recommended creating successors for these very measurements and none were created, so the deferral
survived into a second feature. A file on the branch is what stops that recurring a third time.

## 10. Traceability

### 10.1 User story → requirement

| User story | Requirements |
|---|---|
| US-01 — the loop stops when it stops progressing | REQ-RCV-01, REQ-RCV-02 |
| US-02 — bounded, predictable cost per document | REQ-RCV-01, REQ-RCV-03, REQ-RCV-04 |
| US-03 — the report says what stopped it and what is unsettled | REQ-RCV-02 (AC-2.2), REQ-RCV-04 (AC-4.7), REQ-RCV-05 (AC-5.4) |
| US-04 — authors know what they must not answer in prose | REQ-RCV-05 (AC-5.3), REQ-RCV-04 (AC-4.6) |
| US-05 — reviewers know cold-read from disposition-check | REQ-RCV-03, REQ-RCV-04 |
| US-06 — citation accuracy checked by a program | REQ-RCV-06 |

Every requirement traces to at least one user story; every user story is served by at least one
requirement.

### 10.2 Upstream finding → requirement

| Upstream source | Finding | Requirement |
|---|---|---|
| POSTMORTEM root cause 3 / R-5 | Nothing bounds the size of a revision; new text is unreviewed text | REQ-RCV-04, REQ-RCV-01 |
| POSTMORTEM root cause 2 / R-4 | The stopping rule is advisory, so it did nothing | REQ-RCV-02 |
| POSTMORTEM root cause 1 | Design work mis-filed as requirements work; classes A and B never closed | REQ-RCV-05 |
| POSTMORTEM §Pattern 4 | The two reviewers do not disagree; rounds 2–5 were disposition checks at ~100% resolution | REQ-RCV-03 |
| POSTMORTEM §Iterations | Five rounds, blocking count non-decreasing from round 2, 6.4× growth | REQ-RCV-01 |
| POSTMORTEM R-6 / class D | Citation drift is a mechanical check that consumed part of every round | REQ-RCV-06 |
| LEARNINGS §2, §5.3 | `build-runtime.mjs` is import-unsafe | REQ-RCV-06 (AC-6.2) |
| LEARNINGS §2 | The runtime has no digest primitive and eleven host globals; C-2 bans `import` | REQ-RCV-06 (AC-6.6), O-11 |
| LEARNINGS §4 | Owning-section-wins; re-derive stated procedures rather than verifying quoted numbers | Applied to this document's own construction (§4, §6) |

### 10.3 Requirement → measured fact

| Requirement | Facts it attaches to |
|---|---|
| REQ-RCV-01 | M-1a, M-1b, M-1c, **M-1d, M-1e** (the per-invocation-budget facts AC-1.5 replaces) |
| REQ-RCV-02 | M-2a, M-2b, M-2c, M-2d, **M-2e, M-2f, M-2g** (the file-side seam AC-2.1 reads and the trailer gap AC-3.4 closes) |
| REQ-RCV-03 | M-3a … M-3f, M-4a, M-4b |
| REQ-RCV-04 | M-5a, M-5b, M-5c, **M-4a, M-4b** (the anchor block AC-4.1's `DOC-BYTES:` line joins) |
| REQ-RCV-05 | *(no code seam — it is a SKILL change plus a section extraction; the extraction rides M-3e's existing file read)* |
| REQ-RCV-06 | M-6a, M-6b, M-6c, M-6d |

### 10.4 Requirement → priority and phase

| Requirement | Priority | Phase | Rationale |
|---|---|---|---|
| REQ-RCV-01 | P0 | 1 | One constant. Delivers the cost bound on its own, independent of everything else. |
| REQ-RCV-02 | P0 | 1 | The defect that has now recurred on three features. |
| REQ-RCV-03 | P0 | 1 | The largest behavioural change and the highest integration risk (R-6). |
| REQ-RCV-04 | P0 | 1 | AC-3's compensating control — shipping AC-3 without it removes a reviewer with nothing watching revision size (A-2). |
| REQ-RCV-05 | P0 | 1 | Addresses the post-mortem's *primary* root cause. |
| REQ-RCV-06 | P1 | 1 | Real but smaller: class D was recurring and never blocking. The only P1 in the set. |

All six are Phase 1 — this is a single delivery. **The one ordering constraint that is not optional:
REQ-RCV-04 must not ship after REQ-RCV-03.** AC-3 removes a reviewer from rounds 2+, and AC-4 is what
puts the panel back when a revision is large enough to warrant it (A-2). Shipping AC-3 alone would
leave large revisions read by a single verifier under a rule (AC-3.2 clause 2) that restricts where it
may raise blocking findings. The other four have no ordering constraint between them.

### 10.5 Requirement → downstream obligation

| Requirement | Obligations |
|---|---|
| REQ-RCV-01 | O-11 |
| REQ-RCV-02 | O-5, O-8, O-10, O-11 |
| REQ-RCV-03 | O-1, O-2, O-3, O-4, O-9, O-10, O-11 |
| REQ-RCV-04 | O-4 (the `DOC-BYTES:` write path), O-8, O-9, O-10, O-11 |
| REQ-RCV-05 | O-7, O-8, O-9, O-10, O-11 |
| REQ-RCV-06 | O-6, O-9, O-10, O-11 |

No obligation is orphaned and no requirement is without one.

### 10.6 Round-1 finding → where it is answered

Recorded so a later round can check the disposition without re-reading v1.0. Both reviewers' round-1
cross-review files are cited in the header's Cross-Reviews row.

| Finding | Answered in |
|---|---|
| SE F-01, F-04 | §4.1 M-1b/M-1d/M-1e; AC-1.1; **AC-1.5** — the budget is per document, absolute, operator-resettable |
| SE F-02, F-10 | §4.2 M-2e/M-2f/M-2g; **AC-2.1** (both operands read from files); **AC-2.7** (*unavailable*); **AC-3.4** (trailer required in the file); **N-3** amended; **O-9** |
| SE F-03, TE F-01 | §5 durability table; **AC-4.1** (`DOC-BYTES:` anchor, S-2); AC-4.5's S-6 reasons |
| SE F-05, TE F-07 | §5's closed catalogue S-1 … S-9; **AC-3.5(e)**; AC-4.1's receive-side table; AC-5.5's S-7 totality; O-4 narrowed to plumbing |
| SE F-06 | §9.3 — three successor REQ stub files created and cited by path |
| SE F-07 | §3 BL-01 restated over `docs/completed/pdlc-review-loop-hardening/`; §3 closing paragraph corrected |
| SE F-08 | Header Citation baseline pinned to `9486c81` on `main`; §3 agrees |
| SE F-09, TE F-03 | §2's two-regime saving table; **AC-2.6**'s reachable-sequence enumeration; R-2 restated |
| SE F-11 | §6 — verifier slug `verifier`, proximity window ±25 lines; AC-3.7 |
| SE F-12 | AC-6.4 — the window's direction stated; §6 |
| TE F-02 | **AC-6.4** — closed grammar C-1 … C-4, one range separator, unparseable reported |
| TE F-04 | §5 vocabulary — panel shape over on-disk slugs, *crashed* defined; AC-2.4 |
| TE F-05, F-06 | **AC-3.2** — `## Disposition` (S-8) and `New-mechanism:` (S-9) |
| TE F-08 | §4.7 and AC-4.1 — one boundary, "returned" |
| TE F-09 | AC-5.4 — `approved, {n} measurements outstanding` |
| SE MF-1…MF-5, TE MF-01…MF-03 | §4 — every citation repo-root-relative, symbols corrected, ASCII hyphen ranges |
| TE MR-01, MR-02 | Carried, not answered — bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md` per AC-5.3 |

### 10.7 Round-2 and round-3 finding → where it is answered

Round 3 reviewed a byte-identical document (SE F-08, TE F-07), so both panels carried their round-2
findings forward verbatim. The two rounds are therefore mapped as one set, keyed by the round-2 id each
reviewer used and re-used.

| Finding | Answered in |
|---|---|
| SE F-01, TE F-01 — `DOC-BYTES:` written only on the approving round; growth formula circular | **AC-4.1** — `appendRoundAnchors`, the unconditional per-round writer, named; read instant separated from persist instant; growth restated over two past endpoints. §5's two-writer table; §6's `DOC-BYTES:` row; O-4 restated |
| SE F-02 — a failed verifier round reads as *crashed*, so AC-2 cannot fire in the target regime | **§5** *panel shape* / *crashed* restated over the on-disk role-slug set alone; **AC-2.4**'s "why over slugs" paragraph; **AC-3.5(a)** widened so the marker is written on every verifier round; §6's `REVIEW-MODE:` row |
| SE F-03, TE F-03 — AC-3.2(2)'s "not counted" has no reader | **AC-3.2(2)** — reading 2 chosen and stated: the verifier excludes the finding from its own trailer, the loop deducts nothing and parses no findings table. §5's S-9 receiver; N-3; R-5 widened |
| SE F-04 — the trailer's placement is unspecified; an anchor makes a trailer-less file *malformed* | **AC-3.4** — the trailer is the first non-empty line after `VERDICT:`, anchors follow it; **AC-2.7**'s five-row observation table, whose fourth row makes an anchor line read as *unavailable* |
| SE F-05, TE F-02 — AC-1.5(3)'s reset has no durable observable and is not one-shot | **AC-1.5(4)** — `WINDOW-START: {N}` appended by the loop to the resolved POSTMORTEM; a marker already carrying one is consumed; fail-closed receive side. §5's durability table gains both rows |
| TE F-04 — AC-4.7's `notice` column admits one notice, but three co-occur | **AC-4.7** — the column is an ordered list with a precedence table (six rows in v1.2, seven since v1.3 split S-3 from S-4 — §10.8); §5's row-schema paragraph; O-10 names the crashed-round row explicitly |
| TE F-07, SE F-08 — a round dispatched against an unrevised document | **AC-2.8** — the zero-delta halt, with `DOC-SHA256:` (S-10) as the exact endpoint and S-11 as its halt reason. R-8 records the authoring-side residue and binds it; O-12 specifies the plumbing |
| TE F-05 — AC-3.5(e) says "five cases" over six rows | **AC-3.5(e)** lead-in and **§5's S-1 row** both say six |
| TE F-06 — AC-6.4's own example cells are permanent must-not-fix defect reports | **AC-6.4** — two exempt regions stated: fenced blocks (adopting `scanLines`'s existing rule) and a catalogue row's own `Example` cell |
| SE F-06, SE MF-1, TE MF-01 — §4.7 pins two claims to the unreachable `d11dad5` | **§4.7** — both restated at the Citation baseline `9486c81` |
| SE F-07, SE MF-2 — `7bc559a` called a merge commit | **§3** BL-01 and its closing paragraph — the wording is corrected and the parenthetical dropped |
| SE MF-3 | **§4.3 M-3d** — `tier1ApprovalRecord` is a plain declaration, not `async` (TE v4 MF-06: v1.2's "noted below" pointed at nothing) |
| SE MF-4 | **§5 S-4** — the halt reason shows the rendered form only |
| TE MF-02 | **§5 S-2** and **AC-4.1** — stated once as "four inputs, three reasons" |
| TE MF-03 | **Header Citation baseline** — the baseline is a fixed ancestor commit, and the drift convention (symbol + literal) is what a reader uses at a later commit; re-baselining is a mechanical fix |
| TE MR-03 | Carried, not answered — bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md` per AC-5.3, alongside MR-01 and MR-02 |
| SE Q-01…Q-05, TE Q-01…Q-04 | Each is the fastest route into the finding beside it and is answered by that finding's row above; TE Q-01 (is Phase DOD in scope?) is answered by **N-7**'s neighbour — AC-1.1's *"any review-loop phase for a document"* covers a phase whose optimizer revises the reviewed **document**, and Phase DOD's optimizer revises **code**, so AC-3.3's reasoning applies to it exactly as it applies to Phase CR. **TE Q-02** (which halt reason does the operator see when the budget cap and the fixed point are satisfied on the same round, and does AC-2.1 evaluate on a round that dispatches no optimizer?) is answered by **AC-2.2**'s co-occurring-halt paragraph, which reports every holding condition in AC-4.7's order rather than one. **TE Q-04 and SE Q-06** (was an optimizer episode dispatched between rounds 2 and 3, and did it fail silently?) are the same question about this run: the answer is recorded in **R-8** and mechanised by **AC-2.8** — the loop cannot distinguish "not dispatched" from "dispatched and wrote nothing", so it halts on the byte identity itself rather than on a cause it cannot observe |

### 10.8 Round-4 finding → where it is answered

Round 4 is the first round of this document's review with **no carried finding**: both panels closed
every prior finding (SE F-01…F-08, TE F-01…F-07) and every finding below lies in text v1.2 added.
Ids are given as `{panel} {id}` because the two panels' round-4 series overlap numerically.

| Finding | Answered in |
|---|---|
| SE G-01, TE F-03 — AC-2.2 and AC-4.7 contradict each other on S-3/S-4 co-occurrence | **AC-4.7**'s precedence table — S-3 and S-4 are now two rows and the "at most one" clause is deleted; **AC-2.2** states the render and that the `HALT-REASON:` line carries the same `; `-joined string (SE Q-07); **O-10** adds the two-halt row |
| TE F-01 — the growth boundary selects the next round's panel, so round 2 is always the full panel | **AC-4.1** — one round-open read, `growth = bytes(t0) − DOC-BYTES(N−1)`, classified immediately; **AC-4.2** and **AC-4.5** restated over round N's own panel; **AC-3.1**'s exception restated; §5's *round growth*; AC-4.1's round-1 rule (no measurement, no S-6 notice) |
| TE F-02, SE G-04 — `WINDOW-START:` lives in a file the halt path rewrites | **AC-1.4** — the halt path preserves the reset region verbatim, with the HEAD prompt cited as the defect; **AC-1.5(4)** restated over line *counts* so one-shot survives appending, with a five-row fail-closed receive side; §5's durability rows; **O-5** (write confirmation) and **O-9(d)** (prompt amendment) |
| TE F-04 — AC-2.8 is not composed with AC-1.4/AC-1.5, and the reset is spent on an authoring failure | **AC-1.5(5)** — every halt writes `HALT-REASON:`, and an S-11 halt is cleared **without** consuming the reset: the interrupted window resumes; **AC-2.1** and **AC-2.8** are scoped to the current window (§5's *current window*), so neither compares across a reset boundary |
| SE G-02 — S-11 has no report row | **AC-2.8** and **AC-4.7** — the undispatched round N gets a row with `panel-shape`, `blocking`, `growth-bytes` and `classification` **empty** and `notice` = S-11 alone; O-10 asserts it |
| SE G-03 — `DOC-SHA256:` does not digest the bytes `DOC-BYTES:` counts | **AC-4.1** and **AC-2.8** — the digest is `sha256Hex`'s, over `canonicaliseForDigest`'s output, and the "same bytes" claim is withdrawn; the conjunction of the two anchors is what recovers byte-exactness; §5's S-10 row and §6's row state the provenance and the bare rendering |
| SE G-05, TE F-06 — the trailer reader is two different total functions; the anchor set has two memberships | **AC-3.4** — one five-step algorithm, skip-set given **by reference** to §5's catalogue and enumerated nowhere else; **AC-2.7**'s row 4 restated as "nothing but anchor lines after `VERDICT:`" (SE MF-2 folded in) |
| TE F-05, SE MF-1 — `rounds 1..3 of 3` is hard-coded and S-4's general form is stated nowhere | **AC-1.5(1)** renders `rounds {W}..{W+2} of 3`; **§5 S-4** shows the format string with two specimens, including a reset window's |
| SE G-06 — a count-only fixed point cannot see complete finding turnover | **R-9** (new) and §9.3's new binding row; the calibration successor gains **Q-4**. Recorded, not fixed: the cost is a false-positive halt, and the fix needs a findings-table grammar N-3 declines to introduce |
| SE MF-3 | **§5** catalogue lead-in — the four kinds named in row order |
| SE MF-4 | **Header** Cross-Reviews row — round 4 added, and the row declared per-round maintenance |
| TE MF-04 | **AC-4.7** precedence row 7 — "last of the seven", not "always last" |
| TE MF-05 | **§5** two-writer table — `appendRoundAnchors` runs before **AC-2.1**, not before "AC-2" |
| TE MF-06 | **§10.7** SE MF-3 row — "noted below" dropped |
| TE MF-07 | **AC-2.8** — the anchor condition moved out of *Given* into the receive-side table |
| SE Q-07, Q-08, Q-09 | Answered by the AC-2.2, AC-2.8/AC-4.7 and AC-4.1 rows above respectively |
| TE Q-05 | **§5** two-writer table and **AC-4.1** step 3 — the writer writes into each of the round's files **that exist**: none on a wholly crashed round, one on a partly crashed one |
| TE Q-06 | **AC-4.1** and **AC-2.8** — one read per round-open, shared; O-12 carries the plumbing |
| TE MR-04 | Carried, not answered — whether the post-mortem seam appends or overwrites is an implementation question; AC-1.4 states the obligation either way, so nothing in this REQ waits on the measurement |

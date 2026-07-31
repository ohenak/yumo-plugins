---
feature: pdlc-review-convergence
ready: true
depends-on: [pdlc-review-loop-hardening]
---

# REQ — pdlc-review-convergence

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 1–3 and recommendations R-4, R-5, R-6; `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` §2, §4, §5.3; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-review-convergence.md`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; a new library under `pdlc/workflows/lib/`; the three review SKILLs (`pm-review`, `se-review`, `te-review`); the three author SKILLs (`pm-author`, `se-author`, `te-author`); generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Cross-Reviews | *(none yet — this document has not been reviewed)* |
| LEARNINGS | `docs/pdlc-review-convergence/LEARNINGS-pdlc-review-convergence.md` |
| Citation baseline | Every `file:line` reference in this document was read from the working tree at HEAD **`d11dad5`** (`d11dad51952b090af4cfaabe97616e1850ba8d6b`), branch `feat-pdlc-review-convergence`, tree clean. Per the convention this repo adopted after `CROSS-REVIEW-software-engineer-REQ-v1` F-05 on the predecessor feature, **every** citation below names its enclosing symbol *and* a distinctive literal alongside the line number, so a line drift narrows the reader's search rather than invalidating the claim. A citation that names only a line number is a defect in this document; report it as a mechanical fix, not a finding (see AC-6). |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-07-30 |

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

`docs/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` records Phase R for that
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
fired — with a post-mortem naming the two generator classes that were unmeasurable, at roughly 60% of
the byte cost and 60% of the agent cost. That is the whole claim; it is a claim about *cost and
legibility*, not about making non-convergent documents converge. **This REQ does not promise that more
documents will reach approval.** It promises that the ones that will not, fail faster and say why.

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

This REQ is stacked on `pdlc-review-loop-hardening`. That feature's shipped mechanism is upstream
input here, not something this REQ re-specifies.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | PR merged; `docs/_queue/QUEUE.md` row `pdlc-review-loop-hardening` at `done` | Must hold at HEAD before FSPEC authoring for this feature begins |
| **BL-02** | `parseVerdict` returns machine-readable `{verdict, high, medium, low, malformed?}` | Symbol present in `pdlc/workflows/orchestrate-dev.js` (see §4 M-1) | Must exist at HEAD before FSPEC authoring — AC-2 and AC-3 are stated over its output |
| **BL-03** | Per-round cross-review state is refreshed from the branch inside the loop, and `selectMode` computes an episode's mode from that state | Symbols `refreshReviewState`, `selectMode` present (§4 M-4) | Must exist at HEAD — AC-3's panel-shape decision is taken at the same seam |
| **BL-04** | Approval anchors (`APPROVAL-HASH:` / `REVIEWED-COMMIT:`) are appended to cross-review files on the terminal round | Symbol `appendApprovalAnchors` present (§4 M-6) | Must exist at HEAD — AC-3's verifier-round approval marker is appended by the same writer |
| **BL-05** | `pdlc/workflows/lib/` exists as a home for non-bundled production libraries | Directory present, containing `document-oracles.mjs` (§4 M-8) | Must exist at HEAD — AC-6's new library is a sibling of that file and inherits its "not in the bundle" classification |

All five hold at the Citation baseline commit `d11dad5`, which is the tip of
`feat-pdlc-review-loop-hardening`'s stack. **BL-01 is the only one not yet satisfied on the default
branch**: this branch is stacked, so the prerequisite is a merge order, not a missing capability. If
`pdlc-review-loop-hardening` is abandoned rather than merged, BL-02 through BL-04 fail with it and
AC-2, AC-3 and AC-4 lose their stated seams — that dependency is hard, and this REQ does not offer a
fallback for it.

## 4. Measured facts

## 5. Acceptance criteria

## 6. Declared thresholds

## 7. Non-goals and out of scope

## 8. Downstream obligations

## 9. Risks, assumptions and deferrals

## 10. Traceability

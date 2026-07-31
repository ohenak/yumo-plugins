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

Every fact below was read from the working tree at the Citation baseline commit **`d11dad5`**. Each
row names the **enclosing symbol** and a **distinctive literal** as well as the line, per the drift
convention in the header. These are the seams AC-1 through AC-6 attach to; a reviewer verifying this
REQ should verify these rows, not re-derive them from memory.

### 4.1 The round budget

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-1a** | The round budget is one module-scope constant. | `pdlc/workflows/orchestrate-dev.js:52`, module scope | `const MAX_REVIEW_ROUNDS = 5;` |
| **M-1b** | The **sole** site where the window *width* is expressed in terms of that constant is the helper `windowEnd`. Its own doc comment says so: *"This is the SOLE place in the module where the window width is expressed in terms of `MAX_REVIEW_ROUNDS`."* `reviewLoop` takes `endIndex` as a parameter and defaults it through this helper rather than recomputing the arithmetic. | `orchestrate-dev.js:2215–2217`, function `windowEnd`; the default is applied at `:1574` inside `reviewLoop` | `return startIndex + MAX_REVIEW_ROUNDS - 1;` and `const last = endIndex === undefined ? windowEnd(first) : endIndex;` |
| **M-1c** | Three further sites *read* the constant without doing width arithmetic: the non-convergence phase record, the post-mortem prompt's required-sections literal, and the returned `iterations` field. All three are value-sensitive but arithmetic-free. | `orchestrate-dev.js:1581`, `:1727`, `:1773` | `MAX_REVIEW_ROUNDS` as an argument to `recordPhase`; `` `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` ``; `iterations: MAX_REVIEW_ROUNDS,` |

### 4.2 The counts AC-2 compares

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-2a** | `parseVerdict` returns `{verdict, high, medium, low, malformed?}` — the blocking counts are already machine-readable, parsed from the reviewer's trailing `{"high": N, "medium": N, "low": N}` JSON object. | `orchestrate-dev.js:393`, function `parseVerdict` | `export function parseVerdict(result, skillName)`; JSDoc `@returns {{ verdict: string, high: number, medium: number, low: number, malformed?: boolean }}` |
| **M-2b** | `malformed: true` is set **only** when the trailer is missing or unparseable. Its doc comment is explicit that a genuine parse — *"including the truncated-output zero-counts case"* — never sets it. | `orchestrate-dev.js` JSDoc immediately above `:393`, and the `fallback` object literal inside the function | `malformed: true,` in `const fallback = { verdict: "Needs revision", high: 0, medium: 0, low: 0, malformed: true }` |
| **M-2c** | The truncated-output path returns **genuine zero counts** and no `malformed` flag, so `0/0/0` is a real observation, not an absence. | `orchestrate-dev.js:451`, inside `parseVerdict` | `return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };` |
| **M-2d** | A malformed trailer already has a cheap recovery path: a second, small-model pass over the raw reviewer output. | `orchestrate-dev.js:2824`, function `recoverVerdict` | `export async function recoverVerdict({ reviewer, rawResult, _agent = agent })` |

### 4.3 The panel AC-3 reshapes

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-3a** | `reviewLoop` hardcodes **exactly two** reviewers. The results are two named bindings, and the reviewer array is indexed positionally at `[0]` and `[1]`. | `orchestrate-dev.js:1623` (`reviewLoop` signature), `:1710` (bindings), `:1803–1812` (dispatch) | `let result1, result2;`; `reviewers[0]` / `reviewers[1]`; `const [r1, r2] = await _parallel([...])` |
| **M-3b** | The per-round cross-review path is derived from the reviewer's role slug and the round number, so a new reviewer role writes a file the existing machinery already indexes. | `orchestrate-dev.js`, arrow `reviewTargetPath` near `:1697` | `` `docs/${feature}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${reviewFileType}-v${round}.md` `` |
| **M-3c** | `selectMode` rule 2 requires **every** role in `present` to approve at the *same* round before that round is considered discharged. Its `dualApproved` predicate is `roles.every(...)` over the roles observed in `present`. | `orchestrate-dev.js:1436` (signature) and the `dualApproved` arrow near `:1462` | `const dualApproved = (round) => roles.length > 0 && roles.every((role) => {...})` |
| **M-3d** | `tier1ApprovalRecord` treats **a lone file at the candidate round as role asymmetry and yields no approval**. This is deliberately fail-closed against a dual round one of whose reviewers crashed. | `orchestrate-dev.js:2478` (function), `:2490` (the asymmetry test) | `// Role-asymmetry: one reviewer wrote the candidate round and the other did not.` followed by `if (records.some((r) => r === null)) return noApprovalRecord(candidate);` |
| **M-3e** | The state `selectMode` and the approval records read is refreshed **from the branch, inside the loop**, once per episode. | `orchestrate-dev.js:2358`, function `refreshReviewState` | `async function refreshReviewState({ feature, docType, _listFiles, _readFile })` |
| **M-3f** | Tier 2 — the LEARNINGS approval record — is a separate, later reader of the same approvals. | `orchestrate-dev.js:2528`, method `tier2ApprovalRecord` | `async tier2ApprovalRecord({ feature, docType, candidate, reviewers, _readFile })` |

### 4.4 The approval anchors AC-3 extends

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-4a** | On the terminal round the loop appends a two-line anchor block to each approving cross-review file. This is an existing writer of durable, in-file, machine-read markers — AC-3's verifier marker is a third line in the same block, written by the same function. | `orchestrate-dev.js:1934` (function `appendApprovalAnchors`), append at `:1975` | `` `\nAPPROVAL-HASH: ${hash}\nREVIEWED-COMMIT: ...` `` |
| **M-4b** | The anchor pre-count is a count **and** a comparison: 0 ⇒ append; 1 equal ⇒ idempotent no-op; 1 unequal ⇒ error, no approval; ≥ 2 ⇒ history ambiguous, no approval. Nothing here throws. | JSDoc immediately above `:1934`, and `approvalAnchorPreCount` near `:1918` | `if (existing.length >= 2) {`; `/^APPROVAL-HASH:\s*(\S+)\s*$/` |

### 4.5 The growth AC-4 measures

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-5a** | `12000` already exists in the module as the per-tool-call authoring emission ceiling, and is the figure the runtime prompt states to every wrapped authoring dispatch. | `orchestrate-dev.js:56` (constant) and `:2279` (`PACING_CONTRACT_CLAUSE`) | `const MAX_AUTHORING_WRITE_BYTES = 12000;`; `"section per edit, keep every single write under 12,000 bytes, and commit after"` |
| **M-5b** | There is already an **advisory** post-dispatch check that shells `git diff --numstat` and compares *added lines* against that byte constant, emitting a note and never halting. AC-4 does **not** reuse it: it compares lines to a byte figure, and it is scoped to one dispatch, not to a round. AC-4's measurement is a byte length of the document, taken from a read. | `orchestrate-dev.js:2725–2743`, the advisory pacing emitter | `result = await _git(["diff", "--numstat", "--", targetPath]);` and `"only — it is a proxy, not an oracle, and never a halt condition."` |
| **M-5c** | The loop already reads the document's text through an injected reader on the same seam AC-4 needs, so no new IO primitive is required. | `orchestrate-dev.js`, `_readFile` parameter threaded through `reviewLoop` and `refreshReviewState` (`:2358`) | `_readFile` |

### 4.6 The library AC-6 adds

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-6a** | `pdlc/workflows/lib/` exists and holds exactly one file today: `document-oracles.mjs`. It is **production code with no side effects on import** — its header says so, and every export is a pure function of a `root` directory path, with no `process.cwd()` and no `import.meta.url`-derived paths. It names *"a future CLI"* among its intended callers. | `pdlc/workflows/lib/document-oracles.mjs:1–12`, module header | `"Production code, no side effects: every exported function is a pure"` |
| **M-6b** | That library is **not** part of the runtime bundle. `build-runtime.mjs` refers to it only in a comment about keeping two exact strings in step. AC-6's new library is the same class. | `pdlc/workflows/build-runtime.mjs:237`, comment | `` // `coveredViolations` (pdlc/workflows/lib/document-oracles.mjs) `` |
| **M-6c** | `build-runtime.mjs` is itself **import-unsafe** (it acts on import), which is why a new checker must be a separate module rather than an addition to the builder. Recorded in `LEARNINGS-pdlc-review-loop-hardening.md` §2 and §5.3, citing `pdlc/workflows/__tests__/runtimeBundle.test.js:18` (`import { stripModuleSyntax } from "../build-runtime.mjs";` — the import that makes the unsafety observable) and `CODEBASE-v2 §7(a)`. | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` §2, §5.3 | `` **`build-runtime.mjs` import-unsafe** `` |
| **M-6d** | The workflow test suite is jest under `--experimental-vm-modules`; a new `lib/` module is testable by the existing `npm test` with no tooling change. | `pdlc/workflows/package.json:6–9`, `scripts` | `"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"` |

### 4.7 What is deliberately **not** measured here

Two facts this REQ does **not** claim, and does not need:

- **How an exhausted retry or a stall-killed dispatch surfaces to the caller.** Unmeasured at
  `d11dad5`; recorded as unmeasured by the predecessor REQ's §4a A-8. No AC below depends on it.
- **Whether a partial write is visible on disk before its commit.** Also unmeasured. AC-4's growth
  measurement is taken at a round boundary, after the optimizer episode has returned and committed, so
  it does not depend on intra-dispatch write visibility.

Both are named here so that a reviewer can check the claim in §1.4 — that no AC turns on an unmeasured
runtime fact — against the two specific unmeasured facts that killed the predecessor.

## 5. Acceptance criteria

Six requirements. Every acceptance criterion is in Who / Given / When / Then form and is stated over
an in-band observable named in §4.

**Vocabulary used throughout §5.** These three terms are defined once and used with exactly these
meanings:

| Term | Definition |
|---|---|
| **blocking count** of a round | The sum of `high` + `medium`, over every reviewer dispatched in that round, as returned by `parseVerdict` (M-2a). Low findings are excluded. |
| **panel shape** of a round | The *set of reviewer role slugs* dispatched in that round — e.g. `{software-engineer, test-engineer}` or `{verifier}`. Two rounds have equal panel shape iff these sets are equal. |
| **round growth** | The byte length of the reviewed document at the start of round N+1 minus its byte length at the start of round N (AC-4.1). |

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Phase:** 1 · **Source:** US-01, US-02 · **Depends on:** BL-01

A review loop that has not converged in three rounds has, on the two features measured, not converged
at all: the predecessor's blocking count reached its minimum at round 2 and rose thereafter, and 66 KB
— 40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired.
Three rounds buys the decay that was real (11 → 6) and declines to buy the plateau that was not.

**AC-1.1 — The budget is three.**
*Who:* the pipeline. *Given:* any review-loop phase. *When:* the review window is opened. *Then:*
the window spans **three** rounds, and the loop halts on entering a fourth.

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

**Observability.** `MAX_REVIEW_ROUNDS === 3`; a fourth round never dispatches a reviewer; the
post-mortem contains the literal `3`.

---

### REQ-RCV-02 — The fixed-point stop is enforced by the loop, not by prose

**Priority:** P0 · **Phase:** 1 · **Source:** US-01, US-03 · **Depends on:** BL-01, BL-02

The stopping rule has now been written into three consecutive REQ preambles and honoured by none of
them, because nothing in `orchestrate-dev` reads a rule written in the document under review
(P-2). Both counts the rule needs are already machine-readable (M-2a). The enforcement is available
and simply unbuilt.

**AC-2.1 — The rule.**
*Who:* the review loop. *Given:* a failed round **N ≥ 2** — i.e. round N's reviewers did not all
approve — whose blocking count and whose predecessor round N−1's blocking count are both **reliable**
(AC-2.3) and whose panel shape equals round N−1's (AC-2.4). *When:* round N's verdicts have been
parsed and **before** round N's optimizer episode is dispatched. *Then:* if
`blocking(N) ≥ blocking(N−1)` **and** `blocking(N) > 0`, the loop halts on the existing post-mortem
path (AC-1.4) instead of iterating, and does not dispatch that optimizer episode.

**AC-2.2 — The halt is distinguishable from budget exhaustion.**
*Who:* the operator. *Given:* a fixed-point halt. *When:* they read the post-mortem and the run
report. *Then:* the halt reason names the fixed point and carries the two counts and the two round
numbers that triggered it — e.g. *"fixed point: round 3 blocking 7 ≥ round 2 blocking 6"* — and is
textually distinct from the budget-exhaustion reason. An operator must be able to tell, without
reading the cross-review files, whether the loop ran out of rounds or stopped making progress.

**AC-2.3 — Unreliable counts break the chain; they never fire the rule.**
*Who:* the review loop. *Given:* any reviewer in round N or in round N−1 whose verdict parse is
`malformed` (M-2b) after the existing recovery pass (M-2d) has been attempted and has also failed.
*When:* AC-2.1 would be evaluated. *Then:* the comparison is **not made**, the loop continues to the
next round, and the run report records that the round was not comparable and why. A count nobody could
read is not evidence of a plateau. Because the rule compares only *consecutive* rounds, an unreliable
round is neither a trigger nor a baseline: it breaks the chain in both directions.

**AC-2.4 — Rounds of different panel shape are not comparable.**
*Who:* the review loop. *Given:* rounds N and N−1 whose panel shapes differ — which, under AC-3, is
the normal relationship between round 1 (dual) and round 2 (single verifier). *When:* AC-2.1 would be
evaluated. *Then:* the comparison is **not made** and the run report says so. A sum over two reviewers
and a sum over one are not the same measurement, and normalising them would be a guess this REQ
declines to make. See R-2 for the consequence and its successor.

**AC-2.5 — A zero-to-zero comparison must never fire.**
*Who:* the review loop. *Given:* `blocking(N) = 0` and `blocking(N−1) = 0` on a round that
nevertheless failed. *When:* AC-2.1 is evaluated. *Then:* the rule does **not** fire — this is the
purpose of the `blocking(N) > 0` conjunct. `0/0/0` is a *genuine* parse in this codebase (M-2c: the
truncated-output path returns real zeros and sets no `malformed` flag), so a naive `≥` would read a
round with no blocking findings at all as a plateau and halt a document that is one Low finding away
from approval. Zero blocking findings is the best possible round, not the worst.

**AC-2.6 — The rule bounds work, and it is honest about how much.**
*Who:* the operator. *Given:* the default configuration (AC-1's three rounds, AC-3's panel shape).
*When:* the rule fires. *Then:* the only consecutive same-shape pair inside the window is
(round 2, round 3), both verifier rounds, so the rule fires at most once per phase and saves **one
optimizer episode** — the round-3 revision that today is written and then never reviewed, exactly as
the predecessor's v1.5 was. It does not save a round of reviewers. This is a smaller saving than the
rule would deliver at the old five-round budget, and it is stated here rather than left for a reviewer
to discover: the rule's durable value is that it makes the budget a **backstop rather than the only
stop**, and it bites harder immediately if the budget is ever raised or if AC-4 re-escalates two
consecutive rounds to the full panel. R-2 records the residue.

**Observability.** Two integers from `parseVerdict`, two role-slug sets, one comparison, one halt
reason string. No unmeasured runtime behaviour is involved.

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
round N. *Then:* round 1 dispatches the **full reviewer panel** (today: `se-review` and `te-review`,
in parallel, as now), and every round N ≥ 2 dispatches a **single verifier** — unless AC-4 classified
round N−1's revision as **new-mechanism**, in which case round N dispatches the full panel again.

**AC-3.2 — What the verifier is asked to do.**
*Who:* the verifier. *Given:* round N ≥ 2 on a document whose round N−1 findings have been addressed.
*When:* it reviews. *Then:* it works in **disposition-check mode**:
1. it verifies that **every** prior blocking finding from every prior round is resolved, and states a
   per-finding disposition;
2. it may raise a **new blocking finding only in text that adds new mechanism** — a clause that
   changes what the system does. Text that restates, tightens, retracts, cites, or records a risk is
   not new mechanism and is not a place a new blocking finding may be raised;
3. it may raise Low findings and `## Measurement Required` items (AC-5) anywhere, without restriction.

Restriction 2 is the direct answer to P-1. It is a rule about *where* a blocking finding may be
raised, not about what is true; a verifier that believes a non-mechanism clause is wrong records it as
Low or as a Measurement Required item.

**AC-3.3 — Phase CR keeps the full panel every round.**
*Who:* the pipeline. *Given:* Phase CR, the final codebase review. *When:* any round runs. *Then:*
the full panel is dispatched, every round. Phase CR's optimizer changes **code**, not the reviewed
document, so the growth AC-4 measures does not exist there and the "new text is unreviewed text"
mechanism this AC is designed around does not apply. Applying the verifier rule to a phase whose
growth is unmeasurable would be applying it blind.

**AC-3.4 — The verifier writes the same file grammar under its own role slug.**
*Who:* the verifier. *Given:* round N ≥ 2. *When:* it finishes. *Then:* it writes
`CROSS-REVIEW-{verifier-role-slug}-{doc}-v{N}.md` — the **unchanged** cross-review grammar: a trailing
`## Verdict` section written last, carrying exactly **one** `VERDICT:` line, plus the machine-readable
`{"high": N, "medium": N, "low": N}` count trailer that AC-2 reads. No parser changes; the loop's
existing path-derivation already composes the path from the role slug and the round (M-3b).

**AC-3.5 — A verifier-round approval is recorded, and a crashed dual round still is not.**

This is the load-bearing integration constraint, and it exists because three separate places in
`orchestrate-dev.js` currently encode "two reviewers" as an invariant. All three must be satisfied.

*Who:* the review loop. *Given:* round N ≥ 2 dispatched a single verifier which approved. *When:*
the loop records the approval. *Then:*

- **(a) A durable, in-file marker distinguishes a verifier round from a crashed dual round.** The
  loop appends `REVIEW-MODE: verification` to the verifier's cross-review file, alongside the
  `APPROVAL-HASH:` / `REVIEWED-COMMIT:` anchors the terminal round already writes (M-4a) — same
  writer, same append, same idempotence and ambiguity rules as M-4b. The marker is **in the file**,
  not in memory, because the reader that needs it (M-3d) runs on a later invocation with nothing but
  the branch to read.
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
The role's name, its skill file, and whether it is a new SKILL or a mode of an existing one are FSPEC
decisions (§8 O-3); what this REQ fixes is that it has **one stable role slug**, because the slug is
what the file path, the approval marker and AC-2's panel-shape comparison are all keyed on.

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

**AC-4.1 — Growth is measured, per round.**
*Who:* the review loop. *Given:* a review-loop phase other than Phase CR. *When:* an optimizer episode
for round N has returned and the loop is about to open round N+1. *Then:* it computes **round growth**
as `bytes(document at start of round N+1) − bytes(document at start of round N)`, using the same
injected reader the loop already uses to take the round's anchor (M-5c). The measurement is taken at a
**round boundary**, after the optimizer episode has returned — so it does not depend on whether a
partial write is visible on disk mid-dispatch, which §4.7 records as unmeasured.

**AC-4.2 — Classification.**
*Who:* the review loop. *Given:* a measured round growth `g`. *When:* it selects round N+1's panel.
*Then:*

| Condition | Classification | Round N+1's panel |
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

**AC-4.5 — Unmeasurable growth fails safe to the full panel.**
*Who:* the review loop. *Given:* either endpoint read returns nothing, or the phase's target is not a
single readable document (Phase CR's directory target being the standing example). *When:* the panel
for the next round is selected. *Then:* the **full panel** is dispatched and the run report records
that growth was unmeasurable and why. Failing safe here means failing *toward more review*, which is
the direction that cannot lose a finding.

**AC-4.6 — The optimizer is told to revise minimally.**
*Who:* an authoring agent addressing findings. *Given:* a revision dispatch. *When:* it receives its
prompt. *Then:* the prompt carries a **minimal-revision clause**: address every blocking finding, and
prefer the smallest edit that does so — a targeted edit over a rewritten section, a corrected clause
over a new subsection, a retraction over a retraction plus a new mechanism. The clause states the
consequence plainly: a revision that grows the document by more than one pacing write re-escalates the
next round to the full panel. This is a prompt clause, so it is directive rather than enforced; AC-4.2
is what actually bites, and the clause exists so the author knows the rule it is being measured
against.

**AC-4.7 — Growth is reported.**
*Who:* the operator. *Given:* any completed review-loop phase. *When:* they read the run report.
*Then:* it carries, per round: the round number, the panel shape, the blocking count, the round
growth in bytes, and the resulting classification. This table is the artifact the predecessor's
post-mortem had to be reconstructed by hand (US-03), and it is what makes AC-2's fixed-point
determination auditable after the fact.

**Observability.** Two byte lengths of one file, one comparison against a constant, one row per round
in a report.

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

**AC-5.5 — An absent section is normal.**
*Who:* the review loop. *Given:* a cross-review file with no `## Measurement Required` section.
*When:* extraction runs. *Then:* it contributes nothing and is not an error. Most rounds will have
none. The section is optional and its absence is never a halt, a warning, or a completeness failure —
it is **not** part of the cross-review completeness criterion, which remains the trailing `## Verdict`
section and its single `VERDICT:` line, unchanged.

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

**AC-6.4 — What it extracts.**
*Who:* the checker. *Given:* a markdown document. *When:* it runs. *Then:* it extracts `path:line`
citations — including line **ranges** (`path:12-18`), which this repo's documents use — and, for each,
checks three things:

| # | Check | Fails when |
|---|---|---|
| 1 | **Path existence** | the cited path does not exist under the repo root |
| 2 | **Line-range validity** | the cited line, or either end of the cited range, is beyond the end of the cited file, or the range is inverted |
| 3 | **Nearby symbol presence** | the citation's surrounding prose names a backticked symbol or literal that does not appear in the cited file within a tolerance window around the cited line |

Check 3 is the one that catches the defect that actually recurred — a line number that drifted by two
while still pointing inside a real file. It is stated as *presence within a window* rather than
*exact-line match* precisely because the symbol-plus-literal convention exists to survive small drift:
the check should report a citation whose symbol is nowhere near it, not one that moved by a line.

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
| `MAX_AUTHORING_WRITE_BYTES` | **12,000 bytes** (unchanged) | `pdlc/workflows/orchestrate-dev.js:56`, and stated verbatim in `PACING_CONTRACT_CLAUSE` at `:2279` (M-5a) | AC-4.2, AC-4.3 | **Inherited, not new.** It is one pacing write — the largest revision an author can emit in a single tool call. AC-4 deliberately reuses this quantity rather than introducing a second growth number, so the two cannot drift apart. |
| Verifier role slug | *unfixed — FSPEC decides the name* | `pdlc/workflows/orchestrate-dev.js` + the verifier SKILL | AC-3.4, AC-3.5(a), AC-2 panel shape | AC-3.7 fixes only that it is **one stable slug**; the string itself is a naming decision, listed here so it is not forgotten. It is the key for the file path, the approval marker and the panel-shape comparison. |
| `REVIEW-MODE: verification` | that exact literal | `appendApprovalAnchors` (M-4a) | AC-3.5(a), AC-3.5(b) | Follows the existing `APPROVAL-HASH:` / `REVIEWED-COMMIT:` anchor convention — a bare `KEY: value` line, appended by the same writer, parsed by the same style of anchored regex. |
| `## Measurement Required` | that exact heading | the three review SKILLs | AC-5.2, AC-5.4 | Follows the existing `## Verdict` convention: an exactly-named top-level section the loop extracts. Deliberately **not** part of the completeness criterion (AC-5.5). |
| Symbol-proximity window (AC-6.4 check 3) | *unfixed — FSPEC decides* | the new `pdlc/workflows/lib/` module | AC-6.4 | AC-6.4 fixes the *shape* (presence within a window, not exact-line match) and its reason; the window size is a tuning parameter with no product consequence and is an FSPEC decision (§8 O-6). |

Two of the six are deliberately left to the FSPEC. Both are named here with their owner and their
decision criterion, which is what the threshold-declaration obligation requires; neither has a product
consequence that this REQ could decide better than the FSPEC can.

## 7. Non-goals and out of scope

Stated so a reviewer does not file a blocking finding against an absence that is intentional.

| # | Not in scope | Why |
|---|---|---|
| **N-1** | Making non-convergent documents converge. | This REQ bounds and explains failure. §2 says so explicitly. A finding of the form "this will not make the loop converge" is correct and is not a defect. |
| **N-2** | Normalising blocking counts across panels of different size. | AC-2.4 declines it: a sum over two reviewers and a sum over one are not the same measurement, and any normalisation is a guess. R-2 records the cost. |
| **N-3** | Changing the cross-review file grammar. | `CROSS-REVIEW-{role}-{doc}-v{N}.md`, the trailing `## Verdict` section, the single `VERDICT:` line and the count trailer are all **unchanged**. AC-3.4 has the verifier write the same grammar; AC-5.2 adds an optional section that is not part of the completeness criterion. |
| **N-4** | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation, and the human-written `RESOLVED: yes` marker are untouched. This REQ changes *when* a halt happens and *what it says*. |
| **N-5** | Extending tier-2 (LEARNINGS) approval records to verifier rounds. | AC-3.6 permits the limitation, provided it is documented. R-3. |
| **N-6** | Taking the two measurements §4.7 names. | They are genuinely worth taking, and they are not this REQ's deliverable. R-4. |
| **N-7** | Applying AC-3 or AC-4 to Phase CR. | AC-3.3: Phase CR's optimizer changes code, not the reviewed document, so growth is unmeasurable there and the mechanism does not apply. |
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
| **O-3** | Name the verifier role: its slug, its SKILL file, and whether it is a new SKILL or a mode of an existing review SKILL (AC-3.7, §6). | FSPEC |
| **O-4** | Specify the `REVIEW-MODE: verification` marker's exact write path through `appendApprovalAnchors`, and its interaction with that function's existing pre-count semantics (0 / 1-equal / 1-unequal / ≥2 — M-4b): what a duplicated or contradictory marker means, and how `tier1ApprovalRecord` reads it fail-closed (AC-3.5(a), AC-3.5(b)). | FSPEC → TSPEC |
| **O-5** | Specify where in the loop AC-2's comparison is evaluated so that it precedes the optimizer dispatch (AC-2.1), and how its halt reason reaches both the post-mortem prompt and the run report distinctly from budget exhaustion (AC-2.2). | TSPEC |
| **O-6** | Specify the citation grammar the checker recognises, the symbol-proximity window and its default, and the exact output format (AC-6.3, AC-6.4, §6). | FSPEC → TSPEC |
| **O-7** | Specify the `## Measurement Required` extraction: how the section is located, what an empty or malformed one does (AC-5.5 requires: nothing), and the report format (AC-5.4). | TSPEC |
| **O-8** | Specify the run-report row schema of AC-4.7 (round, panel shape, blocking count, growth, classification) and where it is emitted for both converged and halted phases. | TSPEC |
| **O-9** | Write the SKILL amendments: the three review SKILLs (AC-5.1, AC-5.2, AC-6.5), the three author SKILLs (AC-5.3, AC-4.6, AC-6.5), and the verifier's disposition-check contract (AC-3.2). | FSPEC → implementation |
| **O-10** | Properties and tests for all six ACs, including the negative cases this REQ names explicitly: the `0 ≥ 0` non-firing (AC-2.5), the malformed-count chain break in **both** directions (AC-2.3), the unequal-panel-shape non-comparison (AC-2.4), the lone-file-without-marker fail-closed (AC-3.5(b)), and unmeasurable growth escalating rather than degrading (AC-4.5). | PROPERTIES |
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
| **R-2** | **AC-2 is nearly inert in the default configuration.** Under AC-1's three rounds and AC-3's panel shape, the only comparable consecutive same-shape pair is (2, 3), so the rule fires at most once and saves one optimizer episode. | **Accepted and stated in AC-2.6 rather than hidden.** The rule's value is durability, not immediate saving. Successor: revisit cross-panel comparability (N-2) once real runs exist to calibrate against. |
| **R-3** | **Tier-2 approval records will have gaps** for verifier-approved rounds (AC-3.6). | Accepted, with the limitation documented in LEARNINGS and the run report. Tier 2 is already best-effort and excluded from the completeness criterion. Successor: extend tier 2 to verifier rounds. |
| **R-4** | **The two unmeasured runtime facts (§4.7) remain unmeasured**, so the predecessor's generator classes A and B stay open. | Out of scope by N-6. AC-5 is what stops them consuming review rounds in the meantime; it does not settle them. Successor: a spike that measures both, per POSTMORTEM R-3. |
| **R-5** | **AC-5 and AC-4.6 are prompt clauses, so they are directive rather than enforced.** An agent that ignores them is not detected. | Accepted. AC-4.2 and AC-2 are the mechanical controls; AC-5's mechanical half is only the extraction (AC-5.4), and its classification half is prompt-borne. A-4 records the assumption. A finding that AC-5 is unenforceable is **correct and known** — file it as Low. |
| **R-6** | **A branch carrying a mixture of dual and verifier rounds is a state the existing approval machinery has never seen.** Three separate call sites encode "two reviewers" (M-3a, M-3c, M-3d). | This is the highest-risk part of the change and is why AC-3.5 states four separate constraints rather than one. O-1, O-2, O-4 and O-10 discharge it downstream. |

### 9.3 Deferrals and their binding

Per the deferral-binding obligation, every deferred capability must be bound to a successor that
exists as a queue row or a named successor REQ file. **This is not satisfied at authoring time**, and
the REQ says so plainly rather than offering prose intent as a binding:

| Deferral | Named successor | Status |
|---|---|---|
| Cross-panel count comparability (R-2, N-2) | `pdlc-review-convergence-calibration` | **Unbound.** No queue row exists. |
| Tier-2 approval for verifier rounds (R-3, N-5) | `pdlc-approval-record-tier2` | **Unbound.** No queue row exists. |
| Measuring the two runtime facts of §4.7 (R-4, N-6) | POSTMORTEM R-3's spike | **Unbound.** No queue row exists; POSTMORTEM R-3 recommended creating them and they were not created. |

The authoring agent was instructed not to modify `docs/_queue/QUEUE.md` — the orchestrator adds this
feature's own row after authoring. **Creating the three successor rows above is therefore an operator
action, and it is recorded here as an open item rather than papered over.** A reviewer is entitled to
treat these as unbound deferrals; that reading is correct. They become bound when the rows exist.

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
| REQ-RCV-01 | M-1a, M-1b, M-1c |
| REQ-RCV-02 | M-2a, M-2b, M-2c, M-2d |
| REQ-RCV-03 | M-3a … M-3f, M-4a, M-4b |
| REQ-RCV-04 | M-5a, M-5b, M-5c |
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
| REQ-RCV-04 | O-8, O-9, O-10, O-11 |
| REQ-RCV-05 | O-7, O-8, O-9, O-10, O-11 |
| REQ-RCV-06 | O-6, O-9, O-10, O-11 |

No obligation is orphaned and no requirement is without one.

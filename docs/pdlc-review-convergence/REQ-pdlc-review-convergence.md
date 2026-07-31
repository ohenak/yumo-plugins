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
| **M-6c** | `build-runtime.mjs` is itself **import-unsafe** (it acts on import), which is why a new checker must be a separate module rather than an addition to the builder. Recorded in `LEARNINGS-pdlc-review-loop-hardening.md` §2 and §5.3, citing `runtimeBundle.test.js:18` and `CODEBASE-v2 §7(a)`. | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` §2, §5.3 | `` **`build-runtime.mjs` import-unsafe** `` |
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

## 6. Declared thresholds

## 7. Non-goals and out of scope

## 8. Downstream obligations

## 9. Risks, assumptions and deferrals

## 10. Traceability

# pdlc-rcv-baseline — shared reference for the review-convergence feature family

> **What this is.** The measured baseline, the non-convergence analysis, the measured facts, the
> declared thresholds and the shared non-goals that the three `pdlc-rcv-*` REQs are all stated over.
> Every section below is extracted **verbatim in substance** from
> `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` **v1.8** (superseded 2026-08-01),
> trimmed of that document's per-round review bookkeeping and of prose that only defended a revision.
>
> **This is a read-only reference, not a reviewed pipeline artifact.** It is not a REQ, it is not an
> FSPEC input in its own right, no cross-review is written against it, and nothing in the pipeline
> gates on it. Cite it; do not re-litigate it here. Its successors —
> `docs/pdlc-rcv-budget-stop/`, `docs/pdlc-rcv-fixed-point-stop/`, `docs/pdlc-rcv-panel-topology/`, `docs/pdlc-rcv-finding-quality/` —
> are the documents that carry acceptance criteria and are reviewed.

| Field | Value |
|---|---|
| Extracted from | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8, §1, §4, §6, §7 |
| Upstream evidence | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 1–3, recommendations R-4, R-5, R-6; `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` §2, §4, §5.3 |
| Citation baseline | Commit **`9486c81`** on the default branch `main`, tree clean. Every `file:line` below was read there. Citations are **repo-root-relative** and name the enclosing symbol *and* a distinctive literal alongside the line number, so a later line drift narrows the reader's search rather than invalidating the claim. `main` has advanced since; navigate by symbol and literal, not by line number alone. Re-baselining is a mechanical fix, not a finding. |
| Date | 2026-08-01 |

## 1. The problem

The pdlc review loop does not converge, and when it fails to converge it fails **expensively**. This
is measured twice, on two consecutive features, with the same signature.

### 1.1 The measured run

`docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` records Phase R
for that feature in full. Five rounds of author → dual cross-review → address ran to the five-round
ceiling without a single **Approved** verdict from either reviewer. The two tables that matter:

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
**loop defect rather than a quality defect**.

### 1.2 Why it does not converge

The post-mortem names four defects.

**P-1 — New text is unreviewed text, so the finding rate is self-sustaining.** Under delta review,
each round reads what the previous round added. Every round's answer to a finding is *more text*: a
retraction, a rationale, a risk row, a downstream obligation. At ~25 KB of new text per round the
review surface never shrinks, so the blocking-finding rate cannot fall below the rate at which the
answers themselves generate reviewable material. At round 5, *every* blocking finding from both
reviewers landed in text introduced at v1.4. The loop is convergent on the text it reviewed and
non-convergent on the document. Nothing in the loop distinguishes "this round tightened 1 KB" from
"this round added a new 25 KB mechanism" — the iteration counter treats both as one round
(root cause 3).

**P-2 — The stopping rule is advisory, so it does nothing.** The predecessor REQ's preamble carried a
fixed-point rule. Its test was satisfied at round 3 (6 → 6, non-decreasing). Rounds 4 and 5 ran
anyway, consumed two full author-plus-two-reviewer cycles, added 66 KB — 40% of the finished document
— and ended with *more* blocking findings than the round on which the rule fired. Nothing in
`orchestrate-dev` reads a stopping rule written in the document under review, so the loop cannot
honour it. An advisory stopping rule has now failed on three features (root cause 2).

**P-3 — Findings that only a measurement can close are filed as blocking prose findings.** The
primary root cause. Two of the four generator classes (A: unobservable termination signal; B:
provenance of the approval hash) never closed across five rounds, because both turn on properties the
workflow runtime does not expose and nobody had measured. Every candidate rule was therefore a guess
about unobservable behaviour; a competent reviewer can always construct the falsifying scenario, and
the author can only answer by choosing a different unobservable or by converting the defect into an
accepted risk. That process **has no fixed point** below the point where the underlying facts get
measured. Three of the surviving answers (R-9, R-10, R-12) are risk acceptances, not solutions. The
measurements themselves were cheap — a throwaway bundle run — and were never the REQ's job.

**P-4 — Mechanically checkable defects consume review rounds.** Class D: line-number and
symbol-existence accuracy in `file:line` citations. Filed at round 1, answered with a dedicated
`Citation baseline` header row and a symbol-plus-literal drift-proofing convention, and *reappeared at
round 5* inside the newest measured section — off-by-two line numbers at the very sha the row named,
plus a function cited in call form that does not exist at HEAD. Four rounds of attention and a
documented convention did not fix it. POSTMORTEM R-6 already rules it "verifiable by a script and
should never consume a review round again". It has no script.

### 1.3 Two structural facts about the panel

Not defects in themselves, but load-bearing for the fix:

- **The two reviewers do not disagree with each other.** At round 5 both independently filed the same
  wrong-read defect. Their disposition tables agree on what was fixed. Both explicitly approve the
  large majority of each revision. The dual-adversarial panel is buying breadth on the *first* read of
  a document and, on later reads, is buying a duplicated disposition check.
- **There is no product disagreement at all.** Across ten reviews, not one blocking finding contests
  user need, scope, priority, phasing, or an externally observable behaviour. Every blocking finding
  is about internal mechanism.

### 1.4 The six changes, and the fact that all six are observable in-band

| Requirement | Change | Attacks | Carried by |
|---|---|---|---|
| REQ-RCV-01 | Round cap 5 → 3, absolute per document | P-1 (bounds the damage), P-2 | `pdlc-rcv-budget-stop` |
| REQ-RCV-02 | Enforced fixed-point stop, computed from the reviewers' own count trailers | P-2 | `pdlc-rcv-fixed-point-stop` |
| REQ-RCV-03 | Round 1 dual-adversarial; later rounds a single verifier in disposition-check mode | P-1, §1.3 | `pdlc-rcv-panel-topology` |
| REQ-RCV-04 | Revision-size bound: measure per-round byte growth; large growth re-escalates the panel | P-1 | `pdlc-rcv-panel-topology` |
| REQ-RCV-05 | Measurement-required routing: such findings are non-blocking and carried to the report | P-3 | `pdlc-rcv-finding-quality` |
| REQ-RCV-06 | A mechanised citation checker under `pdlc/workflows/lib/`, run by reviewers and authors | P-4 | `pdlc-rcv-finding-quality` |

**The whole set is observable in-band.** RCV-01 is an integer constant. RCV-02 compares two integers
the reviewers already emit. RCV-03 turns on which files exist on disk with which role slug and marker.
RCV-04 compares two byte lengths of a file. RCV-05 turns on the presence of a named markdown section.
RCV-06 is a program with an exit code. None of the six requires anyone to settle, in prose, a fact
about the runtime that nobody has measured — which is precisely the failure mode (P-3) that killed the
predecessor's Phase R.

**The value claim, stated with its two regimes.** The predecessor's Phase R burned five rounds and
produced a 165 KB document accepted only by operator-directed manual convergence, outside the loop.
Under the six changes the same run would have halted at round 3 — the round its own fixed-point test
fired — with a post-mortem naming the two unmeasurable generator classes.

| Regime | When | Rounds run | Reviewer dispatches | Saving vs. the measured run (5 rounds × 2 reviewers = 10 dispatches, 165 KB) |
|---|---|---|---|---|
| **Pessimistic — every revision is large** | every round's growth exceeds 12,000 bytes, so RCV-04 classifies **new-mechanism** and RCV-03's exception re-escalates every round to the full panel. **This is what the predecessor's measured rounds (25.8 / 22.3 / 25.0 / 28.1 / 38.2 KB) would all have done.** | 3 | 6 | ~40% fewer dispatches and ~40% fewer bytes, from RCV-01 alone. RCV-03 contributes nothing. |
| **Target — the minimal-revision clause takes effect** | rounds 2 and 3 revise under one pacing write, so RCV-04 classifies **incremental** and RCV-03 dispatches a single verifier. | 3 | 4 | ~60% fewer dispatches and ~60% fewer bytes. |

**The pessimistic regime is the expected steady state at ship time.** Moving between regimes is the
job of a prompt clause and is therefore directive rather than enforced. The claim the family makes
unconditionally is the **pessimistic** row — it follows from RCV-01 alone, which is one constant. It
is a claim about *cost and legibility*, not about making non-convergent documents converge. **Nothing
here promises that more documents will reach approval.** It promises that the ones that will not, fail
faster and say why.

## 2. Measured facts

Every fact below was read from the working tree at the Citation baseline commit **`9486c81`** on
`main`. Each row names the **enclosing symbol** and a **distinctive literal** as well as the line, and
every path is repo-root-relative. These are the seams the six requirements attach to; a reviewer
verifying a child REQ should verify these rows, not re-derive them from memory.

### 2.1 The round budget (M-1)

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-1a** | The round budget is one module-scope constant. | `pdlc/workflows/orchestrate-dev.js:52`, module scope | `const MAX_REVIEW_ROUNDS = 5;` |
| **M-1b** | The **sole** site where the window *width* is expressed in terms of that constant is the helper `windowEnd`; its doc comment says so. `reviewLoop` takes `endIndex` as a parameter and defaults it through this helper. `windowEnd` has exactly two callers: `reviewLoop`'s own default and `deriveRoundWindow` (M-1d). | `pdlc/workflows/orchestrate-dev.js:2215-2217`, function `windowEnd`; the `reviewLoop` default at `pdlc/workflows/orchestrate-dev.js:1632`, signature opening at `pdlc/workflows/orchestrate-dev.js:1623` | `return startIndex + MAX_REVIEW_ROUNDS - 1;` and `endIndex = windowEnd(startIndex),` |
| **M-1c** | Three further sites *read* the constant without doing width arithmetic — the non-convergence phase record, the post-mortem prompt's required-sections literal, and the returned `iterations` field. Value-sensitive but arithmetic-free. | `pdlc/workflows/orchestrate-dev.js:1581`, `:1727`, `:1773` | `MAX_REVIEW_ROUNDS` as an argument to `recordPhase`; `` `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` ``; `iterations: MAX_REVIEW_ROUNDS,` |
| **M-1d** | **`MAX_REVIEW_ROUNDS` is a per-invocation *budget* at HEAD, not an absolute cap on a document.** `deriveRoundWindow` computes the window's *start* from the cross-review basenames present on the branch — one past the highest existing round — and its *end* by adding the budget to that start. On a branch whose highest existing round is 3, a re-entered phase is admitted rounds 4…6, and the document has been reviewed six times. | `pdlc/workflows/orchestrate-dev.js:2151`, function `deriveRoundWindow`; the two lines at `:2197-2198`; doc comment at `:2129-2131` | `const startIndex = indices.length ? Math.max(...indices) + 1 : 1;` then `const endIndex = windowEnd(startIndex);`; doc comment *"Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET rather than an absolute cap"* |
| **M-1e** | The same relativity is restated on the halt path: the post-mortem recorder computes its `last` round from the same helper when no explicit end was given. | `pdlc/workflows/orchestrate-dev.js:1574`, inside the non-convergence recorder; comment at `:1570-1572` | `const last = endIndex === undefined ? windowEnd(first) : endIndex;`; *"AC-5.1: the window is RELATIVE"* |

### 2.2 The counts the fixed-point rule compares (M-2)

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-2a** | `parseVerdict` returns `{verdict, high, medium, low, malformed?}` — the blocking counts are already machine-readable, parsed from the reviewer's trailing `{"high": N, "medium": N, "low": N}` JSON object. **It is a function of an agent *response*, not of a file**, so its result lives only in the invocation that took it. | `pdlc/workflows/orchestrate-dev.js:393`, function `parseVerdict` | `export function parseVerdict(result, skillName)` |
| **M-2b** | `malformed: true` is set **only** when the trailer is missing or unparseable. Its doc comment is explicit that a genuine parse — *"including the truncated-output zero-counts case"* — never sets it. | JSDoc immediately above `pdlc/workflows/orchestrate-dev.js:393`; the `fallback` object literal in the body | `malformed: true,` in `const fallback = { verdict: "Needs revision", high: 0, medium: 0, low: 0, malformed: true }` |
| **M-2c** | The truncated-output path returns **genuine zero counts** and no `malformed` flag, so `0/0/0` is a real observation, not an absence. | `pdlc/workflows/orchestrate-dev.js:451`, inside `parseVerdict` | `return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };` |
| **M-2d** | A malformed trailer already has a cheap recovery path: a second, small-model pass over the raw reviewer output. | `pdlc/workflows/orchestrate-dev.js:2824`, function `recoverVerdict` | `export async function recoverVerdict({ reviewer, rawResult, _agent = agent })` |
| **M-2e** | **There is a file-side reader of the same trailer, and it already exists.** `extractFileVerdict` locates a cross-review file's trailing `## Verdict` section, feeds it to `parseVerdict`, and returns the same shape. Counts are therefore recoverable from a file **that carries the trailer** — which today's SKILLs do not require it to (M-2g). | `pdlc/workflows/orchestrate-dev.js:888`, function `extractFileVerdict` | `function extractFileVerdict(fileText, roleSlug)`; `if (/^\s*##\s+Verdict\s*$/.test(line)) headingIndex = index;` |
| **M-2f** | **The branch-side state the loop rebuilds each invocation discards the counts.** `refreshReviewState` reads only the *candidate* round's files, and the record it builds keeps `verdict`, `verdictReadable`, `anchorHash`, `anchorReason` and `path` — no `high`, no `medium`, no `low`. Round N−2 and earlier are never read at all. | `pdlc/workflows/orchestrate-dev.js:2358`, function `refreshReviewState`; candidate at `:2390`, skip at `:2397`, record at `:2401-2407` | `const candidate = window.startIndex - 1;`; `if (parsed.round !== candidate) continue;` |
| **M-2g** | **The count trailer is required in the reviewer's *response*, not in the reviewed file.** The three review SKILLs say *"append the following two lines as the last content of your **response**"*; the repo's documented **file** contract is the trailing `## Verdict` section and its single `VERDICT:` line. A correctly written cross-review file may carry no trailer at all — in which case `extractFileVerdict` → `parseVerdict` takes the truncated-output path (M-2c) and returns **genuine `0/0/0`**, indistinguishable from a perfect round. | `pdlc/skills/se-review/SKILL.md:206`, `pdlc/skills/te-review/SKILL.md:231`, `pdlc/skills/pm-review/SKILL.md:192`; `CLAUDE.md` § *Artifact convention* | *"append the following two lines as the last content of your response"* |

### 2.3 The panel (M-3)

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-3a** | `reviewLoop` hardcodes **exactly two** reviewers: two named result bindings, positional `[0]`/`[1]` indexing, and a two-element `lastResults` construction on the halt path. | `pdlc/workflows/orchestrate-dev.js:1623` (signature), `:1710` (bindings), `:1803-1812` (dispatch) | `let result1, result2;`; `reviewers[0]` / `reviewers[1]`; `const [r1, r2] = await _parallel([...])` |
| **M-3b** | The per-round cross-review path is derived from the reviewer's role slug and the round number, so a new reviewer role writes a file the existing machinery already indexes. | `pdlc/workflows/orchestrate-dev.js:1697`, arrow `reviewTargetPath` | `` `docs/${feature}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${reviewFileType}-v${round}.md` `` |
| **M-3c** | `selectMode` rule 2 requires **every** role in `present` to approve at the *same* round before that round is discharged; `present`'s role set is accumulated across all observed rounds. | `pdlc/workflows/orchestrate-dev.js:1436` (`selectMode`), `dualApproved` arrow at `:1466` | `const dualApproved = (round) => roles.length > 0 && roles.every((role) => {...})` |
| **M-3d** | `tier1ApprovalRecord` treats **a lone file at the candidate round as role asymmetry and yields no approval** — deliberately fail-closed against a dual round one of whose reviewers crashed. It is a plain (non-`async`) function declaration, unlike `tier2ApprovalRecord`. | `pdlc/workflows/orchestrate-dev.js:2478` (function), `:2490` (the asymmetry test) | `if (records.some((r) => r === null)) return noApprovalRecord(candidate);` |
| **M-3e** | The state `selectMode` and the approval records read is refreshed **from the branch, inside the loop**, once per episode. | `pdlc/workflows/orchestrate-dev.js:2358`, function `refreshReviewState` | `async function refreshReviewState({ feature, docType, _listFiles, _readFile })` |
| **M-3f** | Tier 2 — the LEARNINGS approval record — is a separate, later reader of the same approvals, and a standalone function declaration, not a method. | `pdlc/workflows/orchestrate-dev.js:2528`, function `tier2ApprovalRecord` | `async function tier2ApprovalRecord({ feature, docType, candidate, reviewers, _readFile })` |

### 2.4 The approval anchors (M-4)

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-4a** | On the terminal round the loop appends a two-line anchor block to each approving cross-review file — an existing writer of durable, in-file, machine-read markers. | `pdlc/workflows/orchestrate-dev.js:1934` (function `appendApprovalAnchors`), append at `:1975` | `` `\nAPPROVAL-HASH: ${hash}\nREVIEWED-COMMIT: ...` `` |
| **M-4b** | The anchor pre-count is a count **and** a comparison: 0 ⇒ append; 1 equal ⇒ idempotent no-op; 1 unequal ⇒ error, no approval; ≥ 2 ⇒ history ambiguous, no approval. Nothing here throws. | JSDoc above `pdlc/workflows/orchestrate-dev.js:1934`, function `approvalAnchorPreCount` at `:1915` | `if (existing.length >= 2) {`; `/^APPROVAL-HASH:\s*(\S+)\s*$/` |

### 2.5 The growth measurement (M-5)

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-5a** | `12000` already exists in the module as the per-tool-call authoring emission ceiling, and is the figure the runtime prompt states to every wrapped authoring dispatch. | `pdlc/workflows/orchestrate-dev.js:56` (constant), `:2279` (`PACING_CONTRACT_CLAUSE`) | `const MAX_AUTHORING_WRITE_BYTES = 12000;` |
| **M-5b** | There is already an **advisory** post-dispatch check that shells `git diff --numstat` and compares *added lines* against that byte constant, emitting a note and never halting. It is not reusable as a growth oracle: it compares lines to a byte figure and is scoped to one dispatch, not to a round. | `pdlc/workflows/orchestrate-dev.js:2724-2743`, function `advisoryPacingCheck` | `result = await _git(["diff", "--numstat", "--", targetPath]);` |
| **M-5c** | The loop already reads the document's text through an injected reader on the seam the growth measurement needs, so no new IO primitive is required. | `pdlc/workflows/orchestrate-dev.js:1623` (`reviewLoop`) and `:2358` (`refreshReviewState`), the threaded `_readFile` parameter | `_readFile` |

### 2.6 The library the citation checker joins (M-6)

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-6a** | `pdlc/workflows/lib/` exists and holds exactly one file today: `document-oracles.mjs`. It is **production code with no side effects on import** — every export is a pure function of a `root` directory path, with no `process.cwd()` and no `import.meta.url`-derived paths. It names *"a future CLI"* among its intended callers. | `pdlc/workflows/lib/document-oracles.mjs:1-12`, module header | `"Production code, no side effects: every exported function is a pure"` |
| **M-6b** | That library is **not** part of the runtime bundle. `build-runtime.mjs` refers to it only in a comment about keeping two exact strings in step. | `pdlc/workflows/build-runtime.mjs:237`, comment | `` // `coveredViolations` (pdlc/workflows/lib/document-oracles.mjs) `` |
| **M-6c** | `build-runtime.mjs` is itself **import-unsafe** (it acts on import), which is why a new checker must be a separate module rather than an addition to the builder. | `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` §2, §5.3, citing `pdlc/workflows/__tests__/runtimeBundle.test.js:18` | `` **`build-runtime.mjs` import-unsafe** `` |
| **M-6d** | The workflow test suite is jest under `--experimental-vm-modules`; a new `lib/` module is testable by the existing `npm test` with no tooling change. | `pdlc/workflows/package.json:6-9`, `scripts` | `"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"` |

### 2.7 Other shipped seams the child REQs cite

| ID | Fact | Where |
|---|---|---|
| **M-7a** | `parseResolvedMarker` collects **every unfenced** `RESOLVED:` line and returns `{ok: false, reason: "duplicated"}` for more than one; `checkPostmortem` maps `resolved` only when `marker.ok && marker.resolved`, everything else `unresolved`; the step-G refusal every phase-running exit converges on reads exactly that and then throws `haltError`. | `pdlc/workflows/orchestrate-dev.js:953` (`:961` duplicated), `:2440` (`:2446`/`:2447`), `:3895-3901` (literal `Refused — unresolved POSTMORTEM at`) |
| **M-7b** | The shipped `orchestrate-dev` halt catch rewrites the feature's queue row: `recordHaltFn({ feature: featureName, status: "halted" })`. The entry-validation halts nearby build their final report directly and never call it. | `pdlc/workflows/orchestrate-dev.js:4551` |
| **M-7c** | `sha256Hex` canonicalises before it digests — CRLF and lone CR to LF, exactly one trailing newline — **inside the function and never in a caller**, by design. `approvalHashOf` renders the prefixed `sha256:{64 hex}` form. | `pdlc/workflows/orchestrate-dev.js:696` (`sha256Hex`), `:615` (`canonicaliseForDigest`), JSDoc `:600-614`, `:797` (`approvalHashOf`) |
| **M-7d** | `scanLines` is the shipped helper that scopes a line scan to **outside fenced blocks**, so *"a quoted example anchor cannot fabricate an ambiguity"*. | `pdlc/workflows/orchestrate-dev.js:569`, JSDoc above `approvalAnchorPreCount` at `:1907-1910` |
| **M-7e** | At the baseline the halt path dispatches an agent with a bare `Write ${postmortemPath}.` prompt plus a section list, built inline in `reviewLoop` as local `postmortemPrompt` — no preservation obligation of any kind. | `pdlc/workflows/orchestrate-dev.js:1725-1730` |

### 2.8 The halt catch's operator-facing surface (M-8)

`orchestrate-dev`'s halt catch is the single site every non-entry halt converges on, and the strings
it emits are the last text an operator reads before the invocation ends. Four child REQs make claims
about those strings; this section is the measurement, so none of them re-derives the chain.

**Read at a different commit, deliberately.** The rows below were read on
`feat-pdlc-rcv-budget-stop` at **`cf207bd`**, *not* at the header's Citation baseline `9486c81` — the
catch has moved since. The equivalents at `9486c81` are `:4519` (`postmortemStatus = "none"`),
`:4567`, `:4572` and `:1597`; at `cf207bd` the same four are `:4875`, `:4923`, `:4927`–`:4929` and
`:1795`. That is a ~356-line drift over one file, and it is why the header's rule — navigate by
enclosing symbol and distinctive literal, never by line number alone — applies to this section
harder than to any other. A child REQ citing these lines states its own commit or it states nothing.

| ID | Fact | Where | Literal |
|---|---|---|---|
| **M-8a** | The halt catch is `main`'s single `catch (err)`. Its body runs `:4862`–`:4946`. **Every** `throw` raised inside the `try` reaches it — the branch guard, the pipeline callback, every phase, and every helper they await — because the `try` wraps all of them and nothing inside re-catches a `haltError`. The **four entry-validation** halts are the exception, and all four are outside it: empty `reqPath`, a `reqPath` that fails the `docs/{feature}/REQ-{feature}.md` pattern, an invalid `forcePhases` token, and a missing or empty REQ file each sit *before* the `try` and `return buildFinalReport(...)` directly, so they reach none of this section's emits (M-7b's second sentence, measured from the other side). **An entry-validation halt is therefore not "a halt class that reaches the catch"**, and a claim that enumerates it among them is wrong in the direction that matters — it names a string the operator never sees. | `pdlc/workflows/orchestrate-dev.js:4861`, function `main` (`:4057`); the `try` at `:4373`; the four pre-`try` returns at `:4294`, `:4309`, `:4332` and `:4354` | `} catch (err) {`; `Error: no REQ path provided.`; `Error: invalid forcePhases token`; `Error: REQ file not found at ${reqPath}` |
| **M-8b** | The catch contains **exactly two `emit` calls and one `notices.push`**, and nothing else in it is operator-facing: every remaining line either computes a local or becomes a `buildFinalReport` field. **The two channels are disjoint.** `emit` is `logFn` — the run log — bound once at the top of `main`; `notices` is a report field. Neither `emit` string appears in the returned report, and the `notices` entry appears in no log line. A criterion that says one channel *replaces* text on the other is naming a substitution the module has no seam for. | `pdlc/workflows/orchestrate-dev.js:4084` (`emit`), `:4139` (`notices`), the two emits at `:4923` and `:4927`, the push at `:4916`, the return at `:4931` | `const emit = logFn;`; `const notices = [];`; `return buildFinalReport({` |
| **M-8c** | **Emit 1 is guarded, and the guard tests the default rather than the fact.** `No POSTMORTEM was written.` is emitted only when `postmortemStatus === "none"` — a bare string literal, no interpolation, one trailing full stop, no trailing newline. | `pdlc/workflows/orchestrate-dev.js:4922` (guard), `:4923` (emit), in `main`'s catch | `if (postmortemStatus === "none") {` then `emit("No POSTMORTEM was written.");` |
| **M-8d** | **Emit 2 is unguarded.** The queue-reset recovery line is a bare `emit(...)` in the catch — no `if`, no early return above it, after the queue-row write and before `buildFinalReport` — so **every halt class that reaches the catch prints it**: convergence, DoD, PUB, branch guard, step-G refusal, and any future refusal built to the same shape. One interpolated slot, `${featureName}`. The shipped comment two lines above states the intent as an invariant of the module, not of a phase. | `pdlc/workflows/orchestrate-dev.js:4927`–`:4929` (emit), comment at `:4925`–`:4926`, in `main`'s catch | `` `Recover: set the ${featureName} row in docs/_queue/QUEUE.md back to pending, then re-run the queue.` ``; *"exactly ONE recovery act is offered"* |
| **M-8e** | **There is exactly one near-miss, and it is a different string on a different channel.** `checkConverged` builds a recovery clause into the *halt reason* — i.e. into `err.message`, which becomes the report's `haltReason` — on its `written` branch only; its `write_failed` branch carries no recovery clause at all. A repo-wide search for `Recover:` in the module returns these two sites and no third, so a test author grepping for "the recovery string" finds M-8d's and this one and must disambiguate by channel. | `pdlc/workflows/orchestrate-dev.js:1795`, function `checkConverged` (`:1736`); the `write_failed` alternative at `:1796`–`:1797`; consumed at `:4862` | `` `Recover: resolve it per AC-2.4, then set the feature's row back to pending.` ``; `Post-mortem write FAILED — no artifact at ${postmortemPath}.` |
| **M-8f** | **`postmortemStatus` is a four-way, first-match-wins chain, and its first value is an initialiser rather than an outcome.** `none` is assigned before any branch runs; the three branches are, in order, the step-G gate (`unresolved`), a disposition the thrown error already carries (`written` or `write_failed`), and an existence probe on `POSTMORTEM-{haltPhase}-{feature}.md` (`written`). A halt that matches none of the three keeps the initialiser. The shipped enum is exactly `none \| unresolved \| written \| write_failed`; no other value is assignable anywhere in the module. | `pdlc/workflows/orchestrate-dev.js:4875` (initialiser), `:4880`, `:4883`, `:4890`–`:4901` (the three branches), in `main`'s catch | `let postmortemStatus = "none";`; `if (gatePostmortem) {`; `} else if (err && err.postmortemStatus) {`; `} else if (haltPhase) {` |
| **M-8g** | **Branch 2 has exactly one producer in the whole module.** Of the 31 `haltError(...)` call sites, **one** passes a second argument, and it is `checkConverged`'s non-convergence throw; every other site throws a message alone, so `err.postmortemStatus` is `undefined` for all of them and the chain falls through to branch 3 or to the initialiser. A refusal built to step-G's shape that attaches nothing therefore lands on **branch 3**, not branch 2 — which is a property of what it *omits*, and is falsifiable by inspecting the thrown error. | `pdlc/workflows/orchestrate-dev.js:1799`–`:1803`, function `checkConverged`; the `fields` merge in `haltError` at `:188`–`:195` | `postmortemStatus: written ? "written" : "write_failed",`; `if (fields && typeof fields === "object") Object.assign(err, fields);` |
| **M-8h** | **Consequence, and it is the one an oracle is most likely to get backwards: `No POSTMORTEM was written.` is *not* emitted on the class where the post-mortem write actually failed.** `write_failed` is truthy, so branch 2 takes it; M-8c's guard is `=== "none"`, which is then false. The line therefore fires only on a halt that reached **no** branch at all — no step-G gate, no carried disposition, and either no ❌ row or a probe that came back not-ok. It reports *the chain found nothing*, not *no post-mortem exists*. The failed-write class states its own fact in `haltReason` instead (M-8e). | `pdlc/workflows/orchestrate-dev.js:4883` and `:4922`, in `main`'s catch | `} else if (err && err.postmortemStatus) {` against `if (postmortemStatus === "none") {` |
| **M-8i** | **Branch 3's probe is fail-quiet in one direction only.** It is entered only when `haltPhase` is non-null, and `haltPhase` is read back off the recorded phase rows — the **last** row whose status is `❌` — never from a parallel variable. A `checkFileFn` that throws is swallowed to `{ ok: false }`, and a not-ok confirmation leaves the initialiser standing, so an IO fault on the probe degrades to `none` and thence to M-8c's line. It never degrades to `written`. | `pdlc/workflows/orchestrate-dev.js:4870`–`:4871` (`haltPhase`), `:4890`–`:4901` (the probe), the swallow at `:4895`–`:4897` | `const failedRow = [...phases].reverse().find((row) => row.status === "❌");`; `} catch { confirmation = { ok: false }; }` |
| **M-8j** | **The catch's one report-bound line is the queue-row notice, and silence is its normal case.** `notices.push(\`Queue row ${queueRow}: ${recorded.detail}\`)` runs only when the recorded result carries a `detail`; a clean write carries none and is therefore silent by design. The whole `recordHaltFn` call is wrapped in its own `try`/`catch`, whose only effect is `queueRow = null` — a queue-seam failure can neither halt the catch nor reach either `emit`. The Node default returns `{ queueRow: "none" }` with no `detail`, so in a repo with no queue this line never fires. | `pdlc/workflows/orchestrate-dev.js:4904`–`:4920`, in `main`'s catch; `defaultRecordHalt` at `:4046` | `` notices.push(`Queue row ${queueRow}: ${recorded.detail}`); ``; `return { queueRow: "none" };` |

## 3. Declared thresholds

Every configured value the family's acceptance criteria depend on, with its default, its owner and the
child REQ that fixes it. **A threshold used by a child REQ and not in this table, or changed by a child
REQ without amending this table, is a defect.** A child REQ may restate a row it owns; it may not
contradict one.

| Name | Default | Owner | Owning REQ | Derivation |
|---|---|---|---|---|
| `MAX_REVIEW_ROUNDS` | **3** (was 5) | `pdlc/workflows/orchestrate-dev.js`, module scope (M-1a) | RCV-01 | Operator decision, evidenced by §1.1: the measured blocking count reached its minimum at round 2 and rose thereafter; rounds 4 and 5 added 40% of the document and ended with more blocking findings than round 2. |
| `## Reset Region` | that exact heading | the halt path — **created by the first halt of a phase**, preserved by every later one | RCV-01 | S-12. The syntactic home of every line the window accounting counts or reads. Naming it is what stops the counts being writable by ordinary prose — a `HALT-REASON:` quoted in a post-mortem's Recommendation is outside the region and counts for nothing. Absent heading ⇒ empty region ⇒ `H = A = 0`, `W = 1`. |
| `HALT-REASON: {value}` | that exact literal; `{value}` is the `; `-joined render, in the report's precedence order, of every halt reason that halt raised. **One line per halt**, appended to the end of the reset region | the halt path — every halt, without exception | RCV-01 | S-15. One line, joined, in the report's order: the operator sees the identical string in the post-mortem and in the report's `notice` cell. |
| `WINDOW-START: {N}` | that exact literal, `{N}` a decimal integer ≥ 1 | the loop, on the entry that grants a convergence-halt clearance | RCV-01 | S-13. The durable home of the window origin `W`. Written by the loop, **never authored by a human** — that prohibition is scoped to *authoring* and exempts both sanctioned repairs (whole-section deletion for `counts-mismatch`; in-place correction for a value reason). |
| `WINDOW-RESUMED: {W}` | that exact literal, `{W}` a decimal integer ≥ 1 equal to the origin then in effect | the loop, on the entry that clears an S-11 halt | RCV-01 | S-14. Answers a clearance without moving the origin — the difference between resuming an interrupted window and being granted a new one. |
| `reset-region-corrupt: {reason} (H={h}, A={a}) {path}` | that exact render; `{reason}` ∈ `{invalid-window-start, invalid-window-resumed, counts-mismatch}`, and on the two value reasons a trailing ` [{line}]` carrying the offending line | the loop, from the window-origin resolution | RCV-01 | S-16. The operator's only signal that the region needs a sanctioned repair, so a corrupt region is diagnosable rather than a silent permanent halt. |
| `DOC-BYTES: {n}` | that exact literal, `{n}` a decimal integer ≥ 0 | **`appendRoundAnchors`** — every round | RCV-04 (read by RCV-01/02) | S-2. The durable home of the growth measurement's earlier endpoint, and of the zero-delta test's byte endpoint. Follows the existing `KEY: value` anchor convention exactly. |
| `DOC-SHA256: {64 hex}` | that exact literal, lower-case, **bare** (no `sha256:` prefix) | **`appendRoundAnchors`** — every round, same instant, same read | RCV-04 (read by RCV-02) | S-10. The value is `sha256Hex`'s (M-7c), i.e. over `canonicaliseForDigest`'s output, and therefore **not** a digest of the raw bytes `DOC-BYTES:` counts. The conjunction of the two anchors is what recovers byte-exactness. |
| `REVIEW-MODE: verification` | that exact literal | **`appendRoundAnchors`** — every verifier round, whatever its verdict | RCV-03 | S-1. Follows the existing anchor convention — a bare `KEY: value` line, in the same block, parsed by the same style of anchored regex. |
| Verifier role slug | **`verifier`** | `pdlc/workflows/orchestrate-dev.js` + the verifier SKILL | RCV-03 | A **key** three mechanisms are stated over — the cross-review file path (M-3b), the approval marker's owning file, and the panel-shape set equality that compares *sets of these strings*. A key with no value cannot be compared. Matches the existing slug shape. FSPEC may rename it, only by amending this row; it may not leave it unset. |
| `## Disposition` / `New-mechanism:` | those exact literals | the verifier SKILL | RCV-03 | S-8 and S-9. Each is the structural artifact that makes one disposition-check clause falsifiable; without them a verifier that obeyed the clause and one that ignored it produce identical files. |
| `REVIEW-SCOPE-ROUNDS: {W}..{N−1}` | that exact literal, two decimal integers ≥ 1 either side of the two-character `..` separator, `{W}` ≤ `{N−1}` | the loop, on every verifier dispatch | RCV-03 | S-17. The separator matches `rounds {first}..{last}`; an en dash or set notation is not this line. |
| `MAX_AUTHORING_WRITE_BYTES` | **12,000 bytes** (unchanged) | `pdlc/workflows/orchestrate-dev.js:56`, stated verbatim in `PACING_CONTRACT_CLAUSE` at `:2279` (M-5a) | RCV-04 | **Inherited, not new.** One pacing write — the largest revision an author can emit in a single tool call. The growth classification deliberately reuses this quantity rather than introducing a second growth number, so the two cannot drift apart. |
| `## Measurement Required` | that exact heading | the three review SKILLs | RCV-05 | S-7. Follows the existing `## Verdict` convention: an exactly-named top-level section the loop extracts. Deliberately **not** part of the completeness criterion. |
| Symbol-proximity window | **±25 lines**, FSPEC may tune | the new `pdlc/workflows/lib/` module | RCV-06 | The *shape* (presence within a window, not exact-line match) and the *direction* are fixed — wide enough that the motivating two-line drift passes, narrow enough that a symbol in a different function fails. ±25 lines satisfies both bounds against this module's function sizes. FSPEC may change the number, not the direction. |

## 4. Shared non-goals

Stated so a reviewer does not file a blocking finding against an absence that is intentional. Each
child REQ restates the subset that bears on it and adds none that contradict these.

| # | Not in scope | Why |
|---|---|---|
| **N-1** | Making non-convergent documents converge. | The family bounds and explains failure. §1.4 says so explicitly. A finding of the form "this will not make the loop converge" is correct and is not a defect. |
| **N-2** | Normalising blocking counts across panels of different size. | A sum over two reviewers and a sum over one are not the same measurement, and any normalisation is a guess. The cost is recorded as a risk and bound to the calibration successor. |
| **N-3** | Changing the cross-review file grammar beyond the **one** change RCV-03 names. | The filename form `CROSS-REVIEW-{role}-{doc}-v{N}.md`, the trailing `## Verdict` section and its single `VERDICT:` line are unchanged. The one change is the `{"high": N, "medium": N, "low": N}` count trailer, today required only in the reviewer's *response* (M-2g), becoming required **in the file** inside `## Verdict`. `## Measurement Required`, `## Disposition` and the `DOC-BYTES:` / `DOC-SHA256:` / `REVIEW-MODE:` anchor lines are **additions**, not changes. **The findings table is not a parsed data contract.** |
| **N-4** | Changing what a halt is. | The POSTMORTEM path, the write confirmation, and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the shipped gate that reads it (M-7a). The family changes *when* a halt happens and *what it says*. One lifecycle change is in scope: a halt **strips** the spent `RESOLVED:` line, which is the fail-closed direction and is what keeps the marker single-valued. |
| **N-5** | Extending tier-2 (LEARNINGS) approval records to verifier rounds. | Permitted as a documented limitation; tier 2 is already best-effort and excluded from the completeness criterion. |
| **N-6** | Taking the two measurements §5 names. | Genuinely worth taking, and not this family's deliverable. Bound to `docs/pdlc-runtime-measurement-spike/`. |
| **N-7** | Applying the round-window, fixed-point, panel-shape and growth mechanisms to Phase CR **or to Phase DOD**. | Both phases' optimizers change code, not the reviewed document, so growth is unmeasurable and the mechanism does not apply; Phase DOD additionally writes `CODE_REVIEW-*` artifacts, which none of those mechanisms is stated over. |
| **N-8** | Applying the citation checker as a merge or pipeline gate. | Advisory only. |
| **N-9** | Changing `orchestrate-queue`, the drift gate, or the queue schema. | Nothing in the family touches them. |
| **N-10** | Model selection per phase. | Unchanged: Opus everywhere except Phase I batches and the queue's Phase-0 triage. Whether a verifier round could run on a smaller model is a legitimate later question and is not asked. |

## 5. What is deliberately not measured

Two facts the family does **not** claim, and does not need. Both are **unmeasured at the Citation
baseline `9486c81`** and unmeasured anywhere on `main`; the predecessor REQ recorded the first as
unmeasured and nothing has measured either since. **No acceptance criterion in any child REQ depends
on either.**

- **How an exhausted retry or a stall-killed dispatch surfaces to the caller.**
- **Whether a partial write is visible on disk before its commit.** The growth measurement is taken at
  a **round boundary — after the optimizer episode has returned** — so it does not depend on
  intra-dispatch write visibility, and it does not depend on the episode having committed.

They are named so a reviewer can check the family's central claim — that no acceptance criterion turns
on an unmeasured runtime fact — against the two specific unmeasured facts that killed the predecessor.

A third axis the predecessor's equivalent section missed, and which the family's durability tables now
answer: not *unmeasured runtime behaviour*, but **in-process state that does not survive an invocation
boundary** (M-1d, M-2f). Every quantity the family's criteria read has a durable on-branch home.


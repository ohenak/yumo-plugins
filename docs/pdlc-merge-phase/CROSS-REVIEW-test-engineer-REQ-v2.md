# Cross-Review: test-engineer — REQ (pdlc-merge-phase), Round 2

Scope: docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md @ v1.1 (working tree, branch feat-pdlc-merge-phase)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md` (v1.1, draft)
**Date:** 2026-08-02
**Iteration:** 2
**Lens:** testability only. This round judges exactly two things: (a) whether each round-1 blocking
finding is genuinely closed — one `mergeStatus` per condition, a string oracle behind every
escalation, an `Evidence` encoding that survives the *real* parser — and (b) whether the revision
introduced a new blocking defect. No advisory item is re-litigated and no new scope is opened.

## 1. Disposition of round-1 findings

| ID | Sev (r1) | Disposition | Evidence in v1.1 |
|----|----------|-------------|------------------|
| F-01 | High | **Resolved** | AC-6.1a is a 17-row `condition → mergeStatus` table, declared exhaustive and exclusive ("exactly one `mergeStatus` value applies, assigned by this table"), with the `refused` = safety-rule / `deferred` = not-ready partition stated. This is a parameterised test table verbatim. |
| F-02 | High | **Resolved** | AC-1.3 fixes one outcome shape for every non-merge: pipeline `success`, failed precondition named, queue left `awaiting-merge`, **no queue commit by Phase MERGE**. AC-2.3 disambiguates "stops attempting methods" from "the pipeline halts" in so many words. Three assertable facts, and they no longer collide with the existing halt→`halted` commit path (`orchestrate-queue.js` `rewriteStatus`). |
| F-03 | High | **Resolved, sink verified** | AC-6.2a names the stable prefix `MERGE ESCALATION: ` in "the final report's existing operator-facing notices channel". That channel is real: `notices` is a first-class array field on the report object (`orchestrate-dev.js:5295`, defaulted `[]`, populated at `:4434`, `:4483`, `:5173`). So the AC-3.2 assertion is a plain `notices.some(n => n.startsWith("MERGE ESCALATION: "))` plus containment of the PR link and each matched path. AC-6.2a also states escalation never implies a halt, closing the last F-02 edge. |
| F-04 | High | **Resolved, verified against the parser** | AC-5.5 puts the evidence in a sixth `Evidence` cell and pins `Status` to the bare token `done`; AC-5.3 permits exactly two structural changes (header cell + one empty cell per data row) and nothing else. I checked the claim "collides with none of the five existing column names" against the actual header lookup — `parseQueue`'s `colIndex` is a *substring* match over `["order","#"]`, `["status"]`, `["feature"]`, `["req path","req","path"]`, `["depends","depends-on","deps"]` (`orchestrate-queue.js:126-140`), and `"evidence"` contains none of those tokens. `updateQueueStatus` resolves its columns the same way and rebuilds the row as `| ${newCells.join(" | ")} |` (`:830`), so a sixth cell round-trips unchanged. The claim is true, not merely asserted. AC-5.5's warning about `done (abc1234)` is also correct against the code: the pending/dependency comparisons read the lowercased status cell exactly. |
| F-05 | High | **Resolved** | AC-1.4 now states `mergeStatus: skipped` explicitly *and* that no guard evaluation occurs; AC-1.6 rows 1–2 fix the precedence of the two off switches and note both produce the same value, so `expect(report.mergeStatus)` has one answer on a disabled run. |
| F-06 | High | **Resolved** | AC-1.2 is now a five-row table naming the observed surface and the merge/fail values per precondition. AC-1.2a gives `mergeable: UNKNOWN` a bounded re-read (`mergeableRetries` 3 / `mergeableRetryDelay` 10 s) then a deferral. AC-1.2b generalises AC-3.4 to the whole set. Q-03 is answered against the reviewer's concern rather than around it: the review-thread check is GraphQL-only and `reviewDecision` is explicitly **not** an accepted substitute. |
| F-07 | Med | **Resolved** | AC-3.6 states case-sensitive, repo-relative, `/`-delimited directory-prefix matching and names the three near-miss negatives (`pdlc/workflows-notes/x`, `docs/pdlc/skills/x.md`, `PDLC/Workflows/x.js`) plus deletions and both sides of a rename. That is the falsification pair AC-3.5 needs. |
| F-08 | Med | **Resolved** | Defaults are now four — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — and AC-3.7 states the authoring-repo/consuming-repo split and its consequence, with §6 BL-04 recording that `merged` is evidenced by tests here. AC-3.3's "the four defaults" agrees with AC-3.1's list. |
| F-09 | Med | **Resolved** | AC-1.6 row 3 + AC-5.8 + NFR-5 give the re-entry tuple: read from PR state, zero merge attempts, write-back re-attempted idempotently (`done` row left byte-identical), human merges count, `method: unknown`. This is what makes AC-5.2's failure state recoverable, which was the substance of the finding. |
| F-10 | Med | **Resolved** | REQ-MERGE-07 is the `knob | home | default | owner` table asked for, seven rows, plus AC-7.2 (ships `off`) and AC-7.3 (malformed config never enables merging). The "ships safe by default" test now has a fixed expectation. |
| F-11 | Med | **Resolved** | AC-2.5a (capability query unretrievable → failed precondition, never assume permitted) and AC-2.5b (no permitted method → its own reason line, same `deferred` value) split the two branches without inventing a sixth status. |
| F-12 | Med | **Resolved** | AC-2.6a: merged + delete failed → `merged` with a named note, never an escalation, never a downgrade. Also resolves the naming hazard by renaming the knob `deleteBranchOnPdlcMerge`. |
| F-13 | Med | **Resolved** | AC-6.3 now has both halves — the dependent *is* selected after `merged`, and is *not* selected when the row is left `awaiting-merge`. Falsifiable. |
| F-14 | Low | Addressed (advisory) | NFR-2 restated as the ordering invariant. |
| F-15 | Low | Addressed (advisory) | AC-3.5 restated as a system property (two lists differing only in a guard path → opposite outcomes). |
| F-16 | Low | Addressed (advisory) | AC-3.3: silently unioned, no warning. |
| F-17 | Low | Addressed (advisory) | AC-3.7 and BL-04. |

**13 of 13 blocking findings closed.** None was closed by deferral or by restating the ambiguity in
new words; each names a determinate observable.

## 2. New findings introduced by the revision

I looked specifically for the failure mode the brief names — AC-1.6's evaluation-order table
contradicting another AC — and for conditions the new AC-6.1a table maps twice or not at all. Two
findings, neither blocking.

### N-01 — AC-3.1's "regardless of … merge mode, or any other configuration" is now literally
contradicted by AC-1.6 rows 1–2 [advisory, Low]

AC-1.6 resolves `PHASE_MERGE_ENABLED = false` (row 1) and `mergeMode: "off"` (row 2) to `skipped`
*before* the guard is reached (row 4). AC-1.4 was amended to say so for the compile-time flag ("no
guard evaluation occurs"), but AC-3.1's clause still reads that the guard fires "regardless of CI
status, **merge mode**, or any other configuration". A self-modifying PR with `mergeMode: "off"`
therefore reads as `refused` by AC-3.1's own words and `skipped` by AC-1.6.

I am not treating this as blocking, because the document supplies its own tie-break twice over and
both are unambiguous: AC-1.6 declares "the first one that resolves is the answer", and AC-6.1a
declares itself the sole assigner of the value. A test author has exactly one defensible expectation
(`skipped`), and no safety property is weakened — neither reading merges anything. The fix is a
half-line and can land in FSPEC: strike `merge mode` from AC-3.1's list, or append "except where
AC-1.6 rows 1–3 resolve first".

### N-02 — Simultaneous precondition failures have no stated precedence within AC-1.6 row 5
[advisory, Medium — carry to FSPEC as a named entry obligation]

AC-1.6 row 5 resolves "on the first failure", but the order *within* the AC-1.2 precondition set is
not stated, and the set mixes both classes: `CI pending` → `refused`, `mergeable CONFLICTING` →
`deferred`. An input where both hold — entirely reachable, since a conflicted PR is exactly the one
whose checks are unstable — has two documented answers, and AC-6.2 asks the report to name *the*
condition, singular. NFR-2 sharpens rather than resolves this: it requires **every** precondition to
be evaluated before any state-mutating call, so a run genuinely holds a set of failures and must pick
one to report.

This is an oracle-determinacy gap of exactly the class §8's stopping rule addresses: it contests no
user need, scope, priority or phasing, and it is closable downstream by FSPEC stating the evaluation
order of the AC-1.2 rows (the table's own top-to-bottom order is the obvious choice) plus a
tie-break — e.g. *any `refused`-class failure in the set wins over any `deferred`-class one*, which
is also the fail-closed answer. I record it as an entry obligation for FSPEC rather than a blocker.

### Checked and found sound (no finding)

- **AC-1.2a vs AC-1.2b.** `UNKNOWN` is not among the mergeable row's stated values, so AC-1.2b's
  general "cannot parse → failed → `refused`" could have swallowed it. AC-1.2a carves it out and
  AC-6.1a gives it its own `deferred` row: specific beats general, the value is determinate.
- **Guard vs CI when both fail.** AC-1.6 row 4 before row 5 makes this `refused` either way.
- **AC-6.1a coverage.** I walked every named failure in REQ-MERGE-01/02/03/04/05 and every one has a
  row: no `prUrl`, PR closed, unresolved threads, unretrievable diff, unretrievable capability query,
  method exhaustion, no permitted method, delete failure, queue-write failure, working-tree failure,
  unrecognised `mergeMode` (via AC-7.3 → `off` → `skipped`). No orphans, no double-mapped condition
  other than N-02's simultaneous-failure case.
- **AC-5.6 against the real driver.** The AC is aimed at a real defect: `orchestrate-queue.js:819`
  computes `newStatus = succeeded ? "awaiting-merge" : "halted"` and writes it unconditionally after
  the pipeline returns, which would overwrite every `done` this feature writes, and `:831` emits the
  "Merge the PR, then set it to done" message. Both are named. Scoping them in (§5) is correct.

## 3. Questions

| ID | Question |
|----|----------|
| Q-01 | (N-02) Is the intended tie-break "first failure in AC-1.2 table order" or "`refused` wins over `deferred`"? Either is fine; FSPEC should say which. |
| Q-02 | AC-5.3 permits adding an empty `Evidence` cell to every other data row. Is that migration expected on the first `done` write, or as a one-off edit to `QUEUE.md`? The test differs (whole-file comparison vs row comparison), but this is FSPEC-altitude. |

## 4. Positive observations

- **AC-6.1a is the right artifact at the right altitude** — a closed, exclusive condition table that
  doubles as the parameterised suite, with the `refused`/`deferred` partition stated as a *rule*
  rather than left to be inferred row by row. It is the single change that makes this REQ testable.
- **AC-5.5 checks out against the real parser**, not just against a description of it. The claim
  about column-name collision is the kind of assertion that is usually approximately true; here it is
  exactly true, and the `done`-must-stay-a-bare-token warning correctly identifies the one encoding
  that would have silently blocked every dependent.
- **NFR-1's restatement from "no agent" to "no judgment"** is the honest version and, unlike the
  original, it is true on the path that actually ships — while remaining assertable (every value
  parsed by script code, unparseable → fail closed).
- **AC-1.6's rationale column** does the thing REQs usually omit: it says *why* row 3 precedes the
  guard, so a future reader cannot "tighten" the ordering into a permanent queue stall.

## 5. Recommendation

**Approve.** Every round-1 blocking finding is closed with a determinate observable, and the two
verifiable claims I could check against code — the `notices` escalation sink and the `Evidence`
column's safety against `parseQueue`/`updateQueueStatus` — are true as written. The revision
introduced no blocking defect: N-01 is a residual half-line contradicted by two explicit precedence
statements, and N-02 is an oracle-precedence gap that §8's stopping rule directs to FSPEC rather than
to a third round of this document. Both are recorded here as entry obligations for FSPEC.

## Verdict

VERDICT: APPROVED

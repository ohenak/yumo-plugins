# Cross-Review: software-engineer — REQ (pdlc-merge-phase)

Scope: docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md v1.1 (delta re-review of v1 @ b97a006)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md`
**Date:** 2026-08-02
**Iteration:** 2

Judged on two questions only, per the round-2 brief: (a) is each round-1 blocking finding
genuinely resolved, and (b) did the revision introduce a new blocking defect. No advisory taste
items are re-litigated and no new scope is opened.

## Round-1 finding disposition

| ID | Sev (v1) | Disposition | Where resolved / evidence |
|----|----------|-------------|---------------------------|
| F-01 | High (blocking) | **Resolved** | AC-5.6 states the outcome for the queue driver's post-pipeline write and suppresses the "merge the PR" message; §5 In-scope now names the driver's success transition. This is the exact write at `orchestrate-queue.js:817-833`. |
| F-02 | High (blocking) | **Resolved** | NFR-1 restated as "no LLM *judgment*", NFR-4 as "no new *reasoning* dispatch", with AC-1.2b generalising AC-3.4's fail-closed parse to every precondition. Matches the shipped mechanism (`runtime-adapter.js:838-848` transports `gh` output, `checkPrCi` decides). |
| F-03 | Medium (blocking) | **Resolved** | AC-1.6's ordered decision table puts already-`MERGED` at row 3 — before the guard (row 4) and the AC-1.2 chain (row 5) — and AC-1.2's "PR open" row defers `MERGED` to it. NFR-5 and AC-6.1a agree. |
| F-04 | Medium (blocking) | **Resolved** | AC-3.1's default set now includes `pdlc/hooks/` and `.claude/workflows/`; REQ-MERGE-03's preamble states the guard's subject as an outcome; AC-3.6 pins matching semantics; AC-3.7 + BL-04 answer Q-01 directly (permanently `refused` in this repo, `merged` evidenced by tests). |
| F-05 | Medium (blocking) | **Resolved** | AC-5.7 requires the tree on the default branch, updated, before completion, and states the failure disposition (escalate, keep `merged`). |
| F-06 | Medium (blocking) | **Resolved** | REQ-MERGE-07's setting/home/default/owner table; AC-1.6 rows 1–2 fix precedence between the two off switches; AC-7.3 fixes malformed-config behaviour; `deleteBranchOnPdlcMerge` renamed away from GitHub's collision (Q-04 answered); `mergeMode` ships `off` (Q-02 answered). |
| F-07 | Medium (blocking) | **Resolved** | §8 carries the DC-09 stopping rule verbatim in substance, including the deferral clause and the plateau/churn distinction. |
| F-08 | Low | **Resolved** | AC-4.0 establishes CI evidence at merge time; AC-4.4 now names `pending`/`failed` as reachable and says why. |
| F-09 | Low | **Resolved** | AC-5.5 pins the Status cell to the single token `done` with the evidence in a sixth `Evidence` cell; AC-5.3 permits exactly the header + cell-count change. Verified against `parseQueue`: the header probe needs `status` + a cell containing `req`, and `colIndex` matches on substrings `order/#`, `status`, `feature`, `req path|req|path`, `depends|deps` — `evidence` collides with none, and extra columns are ignored (`orchestrate-queue.js:114-136`). `updateQueueStatus` rebuilds the row from its own cells, so an added column survives (`:355-362`). |
| F-10 | Low | **Resolved** | AC-1.2a's bounded re-read with named retry/delay settings, terminal deferral. |
| F-11 | Low | **Declined, accepted** | §8's round-1 disposition declines it with a stated cost rationale. An advisory finding declined on the record is closed; I do not re-file it. |
| F-12 | Low | **Resolved** | AC-6.2a defines escalation as report notices with the stable `MERGE ESCALATION: ` prefix, and states escalation never halts (Q-03 answered: AC-5.2 does not halt). The channel exists — `notices` is a real field of `buildFinalReport` and rides both the halt and the success report (`orchestrate-dev.js:5202`, `:5209`, `:5295-5306`). |

Q-01…Q-04 from round 1 are all answered in the revision; no question is carried forward.

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-13 | Low | Cross-Feature | AC-5.6's direct-invocation half supersedes a shipped acceptance criterion (AC-2.7a of `pdlc-rcv-budget-stop`) and the test that pins it; the REQ does not name the supersession | AC-5.6, §5 |
| F-14 | Low | Local | AC-5.7 (tree moved to the default branch) and AC-5.6 (queue row written and committed after the pipeline returns) do not state their relative order; taken in the wrong order the `done` commit lands on the local default branch | AC-5.6, AC-5.7 |

Neither is blocking. Both are implementability/ordering defects of exactly the class §8's stopping
rule routes downstream — closable by deferral, not by adding REQ prose the next round reviews. They
are recorded here as **named entry obligations for the FSPEC**, per §8.

### F-13 — name the superseded criterion (entry obligation)

`orchestrate-dev`'s success path today hard-codes `queueRow: "none"` on the stated invariant
"`orchestrate-dev` owns no status write but the halt one" (`orchestrate-dev.js:5199-5203`), and
`__tests__/haltAndQueue.test.js:809-821` (`RLH-AT-32-orch`) asserts positively that a successful
direct run's recorded statuses **do not contain `"done"`**. AC-5.6 requires precisely that write.
The REQ is right to put it in scope; the risk is that the conflict is discovered as a red test and
resolved by deleting an assertion rather than by a recorded decision.

Nothing about the REQ's *requirement* is wrong. **Entry obligation for FSPEC:** state that AC-5.6
supersedes AC-2.7a for the `merged` case only (the halt path and the queue-less `"none"` path are
unchanged), and name `RLH-AT-32-orch` as the test to re-express rather than remove.

### F-14 — fix the order of AC-5.7 and the queue write (entry obligation)

`rewriteStatus` re-reads the queue at write time and `commitQueueRow` commits it against whatever
branch HEAD is on, pathspec-scoped and unpushed (`orchestrate-queue.js:869-957`; the commit message
is parameterised by status, so `chore(queue): {feature} → done` needs no change). If AC-5.7's
checkout happens **before** that write, the `done` row is committed onto the local default branch —
which in this repo cannot be pushed (main is protected), so the next pass's `git pull --ff-only`
fails and the following feature is cut from a diverged local base. That is the same class of
failure F-05 raised, arriving through the fix for F-05.

Both orders are defensible and either satisfies the REQ as written; the REQ does not need to
choose. **Entry obligation for FSPEC:** state the order of AC-5.7's checkout relative to the queue
write-and-commit, and which branch the `done` commit is expected to land on.

## Questions

None carried forward.

## Positive Observations

- AC-1.6's ordered decision table is the strongest addition: it resolves F-03 and F-06's precedence
  gap with one mechanism instead of two prose clauses, and its "the first one that resolves is the
  answer" phrasing makes the FSPEC's control flow fall out of the REQ rather than be invented.
- AC-6.1a assigns exactly one `mergeStatus` to every reachable condition and gives `refused` vs
  `deferred` a stated meaning (safety said no / not ready yet). Every branch I could construct from
  §3 lands on exactly one row.
- AC-6.2a's `MERGE ESCALATION: ` prefix converts F-12's undefined "escalated to the operator" into
  something a test can assert by string — the right shape for an oracle at REQ altitude.
- AC-3.7 and BL-04 answer an uncomfortable question honestly instead of eliding it: the `merged`
  path cannot be exercised end-to-end in this repo, and that is recorded for the future reader.
- F-09's resolution was checked against the parser rather than asserted; the `Evidence` column name
  is genuinely collision-free under `colIndex`'s substring matching, which is not obvious.

## Recommendation

**Approved with minor changes** — all seven round-1 blocking findings are resolved in substance,
not by rewording: each is closed by a new AC that states an outcome and is falsifiable. The two new
findings are Low, are ordering/supersession details rather than requirement defects, and are
carried downstream as the named FSPEC entry obligations above per §8's stopping rule. The REQ has
met its bar; further rounds would add prose the next round reviews.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 2}

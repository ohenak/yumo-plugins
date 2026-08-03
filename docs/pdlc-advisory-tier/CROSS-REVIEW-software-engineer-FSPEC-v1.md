# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** FSPEC-pdlc-advisory-tier v1.0, reviewed against `REQ-pdlc-advisory-tier.md` v1.3 and the
repository at default-branch commit `26c3f1c` (the commit the FSPEC's §2 citation pin names).

## Baseline verification

Every `file:line` claim in §2 was re-read at `26c3f1c` in one pass (the cross-cutting existing-code
check). **All sixteen hold.** Recording it here so no later round re-litigates them:

| id | Verified at | Verdict |
|---|---|---|
| B-1 | `orchestrate-queue.js:653-668` (`triagePrompt`, three `TRIAGE:` verdicts), `:907-921` (both `blocked` and `needs-human` `continue`, differing only in the recorded free-text reason) | accurate |
| B-2 | `orchestrate-queue.js:630-649` (`precheckDependencies`; `:645` comment "Dependency done, or not in the queue at all → inconclusive here; defer to triage") | accurate |
| B-3 | `orchestrate-queue.js:662` — the only staleness-adjacent clause is verbatim "Also flag if the REQ references subsystems that do not yet exist"; no re-grounding obligation exists | accurate |
| B-4 | `orchestrate-dev.js:25` (`DOD_MAX_ITERATIONS = 3`), `:6164`, `:6190-6191` (`iteration === maxIterations` returns without remediating) | accurate |
| B-5 | `orchestrate-dev.js:8179-8188` (❌ row then `haltError`) | accurate |
| B-6 | `orchestrate-dev.js:8161-8172` (step-0 rebase; `"conflict"` → ❌ + `haltError`) | accurate |
| B-7 | `orchestrate-dev.js:6250-6286` (`passed` returns; `failed` halts; completion cap halts; `no-checks` **returns a pass**) | accurate |
| B-8 | `orchestrate-dev.js:8267-8271` — the phase row literal is "no GHA checks detected within timeout (assumed none configured)" | accurate |
| B-9 | `orchestrate-dev.js:5812-5824` (`checkPrCi` shells `gh pr view --json statusCheckRollup`), `:6245-6250` | accurate |
| B-10 | `orchestrate-dev.js:1578`, `:1621`, `orchestrate-queue.js:69` — all three are bare alias strings | accurate |
| B-11 | `orchestrate-dev.js:43` (`MERGE_CONFIG_PATH`), `:101-152` (`parseMergeConfig`), `:181-200` (`parseImplementationConfig`) — independent sections, each degrading to its own defaults | accurate |
| B-12 | `git ls-tree 26c3f1c .claude/` is empty; the untracked working-tree file carries an `implementation` section only | accurate |
| B-13 | `orchestrate-dev.js:1319-1328` (`MERGE_ESCALATIONS`, frozen, every member prefixed `MERGE ESCALATION:` and so carrying the `ESCALATION:` token), `:8291-8292`, `:8395`, `:8402` | accurate |
| B-14 | `guard-harvest-before-delete.sh:35` (token match), `:43` (token regex), `:52-59` (LEARNINGS glob + refusal) | accurate |
| B-15 | `orchestrate-dev.js:8151` (DOD), `:8192` (H), `:8248` (PUB), `:8274` (MERGE) | accurate |
| B-16 | `git ls-tree 26c3f1c docs/_queue/` → `QUEUE.md` only | accurate |

Two further facts I read at the same pin, which the findings below turn on and which §2 does **not**
carry:

- **P-a** — `orchestrate-dev.js:33-35`: `CI_NO_CHECKS_TIMEOUT_MS = 10 min`, `CI_POLL_INTERVAL_MS = 30 s`,
  **`CI_COMPLETION_TIMEOUT_MS = 30 min`**.
- **P-b** — `orchestrate-dev.js:8249-8250`, verbatim: Phase PUB *"Runs last so PR captures complete
  feature branch, including harvested LEARNINGS."* The pre-PUB placement of harvest is deliberate,
  and its stated reason is exactly what §10.2 moves away from.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The post-PUB distil step has no specified relationship to the PR it is deleting files behind.** §10.2 H-1 moves the record's distil-and-delete after Phase PUB. But Phase PUB is where the PR is raised (B-15), and Phase MERGE — which merges that PR — runs after it (`dev:8274`). `dev:8249-8250` states the shipped reason harvest sits *before* PUB in the first place: "Runs last so PR captures complete feature branch, including harvested LEARNINGS." §10.2 never says what an operator observes for the bytes it writes and deletes after the PR exists. Two observably different outcomes are both consistent with the text as written: the delete + LEARNINGS append are pushed (moving the branch head after CI went green, so Phase MERGE evaluates a head no check ran on), or they are not (so `ADVISORY-{feature}.md` is in the merged PR and its content never reaches `LEARNINGS`, falsifying H-2). **Resolution:** §10.2 must state, as an observable, whether the post-PUB distil result reaches the PR, and what the operator sees on the report and on the merged branch in each case. | §10.2 H-1/H-2, §15.2 |
| F-02 | High | Local | **"Revert to a byte-identical pre-invocation tree" is not achievable at A5, where the action includes a push.** §9.2 A5-3 defines one A5 attempt as "fix → push → re-poll". §4.1 then runs CHECK (5), VERIFY (6) and RECORD (7) *after* ACT (4), and each has a revert path; BR-5 ("two tree states, never three"), T-03-2, T-08-2 and §5.3 reason 4 all assert the tree returns byte-identical. A pushed commit is not undone by restoring a working tree — undoing it is a further remote-visible act (a revert commit, a reset+force-push, or nothing), each with a *different* observable for the operator and for the PR's check history. The FSPEC never says which. This is the single most likely place the tier leaves the "third state" A4-6 forbids. **Resolution:** define, at A5 specifically, what "revert" means for a pushed commit and what the operator observes on the branch and on the PR afterwards — or move the push after RECORD so the reverted region is local-only. | §4.1 steps 5–7, §9.2 A5-3, §16.2 BR-5, T-08-2 |
| F-03 | High | Local | **The shipped defaults make A5's attempt budget unreachable, and T-07-6 unsatisfiable.** §3.1 ships `seamBudgetMinutes = 10` and `attemptBudget = 3`; §4.3 V-5 ends the invocation on whichever bound is hit first. But one A5 attempt contains a CI re-poll, and the pipeline's own completion cap for a registered-but-incomplete check run is **30 minutes** (`dev:35`, `CI_COMPLETION_TIMEOUT_MS`), with a 30 s poll interval (`dev:34`). A5-3 explicitly contemplates a re-poll running to that cap and says it "consumes an attempt rather than escalating separately" — but V-5 will already have escalated at 10 minutes, inside attempt 1. So at shipped defaults A5 escalates with `budget-exhausted` on essentially every real CI cycle, `attemptBudget` never binds there, and T-07-6 ("exactly that many cycles occurred") cannot pass. **Resolution:** either make `seamBudgetMinutes` a per-seam value with an A5 default above the CI completion cap, or state that A5's wall-clock bound excludes time spent waiting on the rollup — and name which, since the two give different escalation counts. | §3.1, §4.3 V-5, §9.2 A5-3, T-07-6 |
| F-04 | High | Local | **Queue-side advisory records (A1, A2) have no harvest path, so H-2 is false for them.** §10.1 R-4 requires a record for every invocation including those that took no action, and A1's *only* possible outcomes are `run-candidate` / `hold` / `escalate` with A1-4 fixing "A1 adjudication changes no file". §10.2 H-1 then binds distil-and-delete to Phase PUB — a phase in the **dev** pipeline. For a candidate adjudicated `hold` or `escalate`, and for A2's apply-then-defer-to-the-next-invocation path (A2-4), no `orchestrate-dev` run happens, so no Phase PUB ever runs for that feature and `docs/{feature}/ADVISORY-{feature}.md` accumulates permanently. H-2's "at the end of a completed run, `ADVISORY-{feature}.md` is absent" is therefore only true of the dev-side seams. T-08-3 as written would pass on a dev-side fixture and mask this. **Resolution:** §10.2 must state when a queue-side record is harvested (or that it deliberately persists until the feature's own run reaches PUB), and §10.6 needs a queue-side case. | §10.1 R-4, §10.2 H-1/H-2, §6.3 A1-4, §6.4 A2-4 |
| F-05 | High | Local | **§17.2 removes the advisory summary from exactly the runs that need it, contradicting S-1 and REQ AC-9.4.** §17.2 row 3 says a run that halts at A3 or A4 produces no summary "because the run did not complete". The halt path does build a final report — `dev:8390-8396` returns `buildFinalReport({ … haltReason, haltPhase, … notices })` — so a report exists and the operator reads it. §10.3 S-1 and REQ AC-9.4 both state the report carries the summary unconditionally, and §12.2 uses the summary's *presence* as the sole distinguisher between "enabled but unexercised" and "disabled". Dropping it on halted runs both breaks that distinguisher and removes the audit surface on the tier's primary escalation path. **Resolution:** state that a halted run's report carries the summary for the seams reached so far, and add a halted-run case to §10.6. | §17.2, §10.3 S-1, §12.2 |
| F-06 | High | Local | **Rung resolution is specified twice with observably different results: lazily in §3.2/§3.3, eagerly in §15.2.** §3.2 evaluates the ladder "at the first advisory dispatch of a run"; §3.3 row 2 then says that with the tier enabled and no seam firing "no dispatch happens, so no resolution happens" and the summary names the rung *not exercised*; T-01-4 phrases the unresolvable case as "**When** a seam fires · **Then** the run fails". §15.2 places "resolve the advisory rung ONCE" in the run's prologue, immediately after the config read and *before* the pipeline proceeds, with "neither rung resolves ──► the run fails loudly". Under §15.2 an enabled tier with an unresolvable rung fails a run in which no seam would ever have fired; under §3.2/§3.3 that run completes with five zero rows (§12.2 row 2, T-10-5). §1 asserts §15 "adds no behaviour", so this is not a licensed elaboration. **Resolution:** pick one and make §15.2 cite it. Note that eager resolution also requires a probe dispatch with no seam behind it — a real cost and a real agent turn — which §3.2 should then declare. | §3.2, §3.3, §15.2, §12.2, T-01-4, T-10-5 |

## Questions

<!-- filled next -->

## Positive Observations

<!-- filled next -->

## Recommendation

<!-- filled next -->

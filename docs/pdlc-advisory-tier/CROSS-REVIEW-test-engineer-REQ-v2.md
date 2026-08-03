# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (v1.2)
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review of REQ-pdlc-advisory-tier v1.1 → v1.2. Closure of the v1 findings (F-01…F-13), plus a fresh testability scan of the changed sections only. Unchanged sections already approved in v1 are not re-litigated. Not product strategy, not architecture.
**Diff reviewed:** `e6ff9f9..b8ce721` on `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (+165 / −87)

## Prior-Finding Closure

All thirteen v1 findings are closed. Each row names the change that closes it.

| v1 ID | Sev | Closed by | Status |
|---|---|---|---|
| F-01 | High | **AC-5.5** — the `needs-human` result carries a machine-readable seam token; an unrecognised/absent token routes to the A1 adjudicator. §1's A2 row now states the indistinguishability as today's fact rather than assuming a seam exists. AC-5.2/AC-5.3 now have a testable precondition. | Closed |
| F-02 | High | **AC-3.6** — one refusal path with a positive observable triple: outcome `escalated`, a refusal reason drawn from a closed seven-value set, and the pre-advisory behavior proceeding unchanged. **AC-4.6** now requires every prohibition test to assert that triple on the same path, which is exactly the paired positive conjunct the project standard demands. | Closed |
| F-03 | High | **AC-3.3** gives each of E-1…E-4 a decidable rule (flaky = identical sha, no push between; introduced = passes at merge-base, fails at head; branch-created = absent from merge-base tree and default-branch tip; re-grounding = symbol still exists). **AC-3.4(d)** defines *declared scope* as PLAN-named files ∪ files the branch had already touched. Four undefined terms → four checkable predicates. | Closed (see F-16 for one residual ambiguity, and F-15 for a baseline conflict E-2 introduces) |
| F-04 | High | **AC-1.1** now states the observable property (one constant, the Fable 5 rung, resolvable by the runtime) and explicitly hands the literal alias to TSPEC once BL-01 resolves. The implementation-echo trap is gone; AC-1.4 remains the falsifiable oracle. | Closed |
| F-05 | Medium | **AC-1.7** ships a config table with values: `attemptBudget: 3`, `seamBudgetMinutes: 10`. **NFR-4** now names the unit and the measurement window ("wall-clock, measured from dispatch to verdict") and routes the overrun through AC-3.6 with reason `budget-exhausted`. | Closed |
| F-06 | Medium | **AC-4.5** is now a per-seam table naming the gate and the state it must reach, and it correctly declines to claim Phase-0 triage is deterministic. The A2 row also resolves the AC-5.4 interaction by deferring the re-run to the next invocation. | Closed as a structure; the A1 row's content is wrong — see F-14 |
| F-07 | Medium | **AC-9.3** states the `ADVISORY-*` extension of the LEARNINGS-precedes-delete protection explicitly, and adds the "no delete while a later phase can still append" rule that makes A5's Phase-PUB entries reachable. **AC-9.2** gives the failed record write its positive outcome (action not taken or reverted, AC-3.6 path, reason `record-write-failed`). | Closed (residual: F-17) |
| F-08 | Medium | **AC-10.4** fixes append order (newest-last), the entry unit (one entry per escalation under its own heading), and the repeat rule (append again, never update in place). **AC-10.1** defines *pipeline state* as phase id + that phase's outcome. A downstream `pdlc-engineering-loop` parser test is now writable. | Closed |
| F-09 | Medium | **NFR-3** is restated as an equality on named artifacts (phase table, per-phase outcomes, no `ADVISORY-*`, no `ESCALATIONS.md` entry, no advisory summary) and says why. **AC-1.6** carries the same positive observable. | Closed |
| F-10 | Medium | **AC-3.4(a)** enumerates the seven evasions as a closed set; **AC-3.5** requires each enumerated operation to be asserted by its own test and states the set-equality intent ("a dropped case must fail the suite"). | Closed |
| F-11 | Low | **AC-2.1** collapses the enum to `{high, low}` and says why. | Closed |
| F-12 | Low | **AC-9.4** requires all five seams A1–A5 with zero counts included — a set-equality assertion is now available. | Closed |
| F-13 | Low | **AC-8.2** states the interaction: one attempt = one fix→push→re-poll cycle, and a re-poll that hits Phase PUB's own completion timeout consumes an attempt rather than escalating separately. | Closed |

## Verification Log

Every **new or changed** existing-behavior claim, checked against code. **BL-02 declares the base to
be the default branch (`main`), not this feature branch's tree**, so every row below is verified
against `main` — currently `26c3f1c` — and the branch tree is cited only where the two differ.
`feat-pdlc-advisory-tier` is **21 commits behind `main`** (`git log --oneline HEAD..main`;
merge-base `7cdfbb0`), and `main` has since landed Slices A/B/C of the orchestrate-dev rewrite
(`91c5421`, `f6518de`, `26c3f1c`) — `pdlc/workflows/orchestrate-dev.js` is **8527 lines on `main`
vs 2139 on this branch**. That gap is the subject of F-15.

| REQ claim (new/changed in v1.2) | Verified at | Result |
|---|---|---|
| AC-1.7: `.claude/pdlc.config.json` is the per-repo config home Phase MERGE already uses | `main:pdlc/workflows/orchestrate-dev.js:43` (`MERGE_CONFIG_PATH = ".claude/pdlc.config.json"`), `:60` (`mergeMode: "off"`), `:122-124` | Confirmed |
| AC-1.7: …and the distribution gate uses it too | `main:pdlc/workflows/orchestrate-queue.js:1308`, `:1484-1488` (`record.checkEnabled` opt-out) | Confirmed |
| AC-1.1: `MODEL_DEFAULT` / `MODEL_IMPLEMENTATION` / `MODEL_QUEUE` are the existing constants | `main:pdlc/workflows/orchestrate-dev.js:1578`, `:1621`; `main:pdlc/workflows/orchestrate-queue.js:69` | Confirmed |
| §1 A1: Phase-0 triage `needs-human` → skip the candidate | `main:pdlc/workflows/orchestrate-queue.js:314` (`/^TRIAGE:\s*(ready\|blocked\|needs-human)\b/`), `:305` (defaults to `needs-human`) | Confirmed |
| AC-5.1: `blocked` is a real triage verdict distinct from `needs-human` | same regex, `main:pdlc/workflows/orchestrate-queue.js:314`; prompt catalogue `:664-666` | Confirmed |
| AC-4.5 A1 / AC-5.1: dependency presence in base is a **deterministic check** | `main:pdlc/workflows/orchestrate-queue.js:630` (`precheckDependencies`); branch copy `pdlc/workflows/orchestrate-queue.js:401-419` | **False.** The pre-check is one-sided — it returns `blocked` only when a declared dependency has a **non-`done` row in QUEUE.md**, and its own docstring says a dependency that is `done` *or absent from the queue* is "inconclusive here; defer to triage" (branch `:394-396`, `:416`). Presence-in-base is judged by the **agent** (`triagePrompt`, branch `:429`: "must already be merged into the base branch"). See F-14 |
| §1 A3 / AC-6.1: Phase DOD verify→remediate is capped at 3 iterations | `main:pdlc/workflows/orchestrate-dev.js:25` (`DOD_MAX_ITERATIONS = 3`), flag `:22` | Confirmed |
| §1 A4 / AC-7.1: `ship-pr` reports `REBASE_STATUS: conflict` and the pipeline reads it | `main:pdlc/workflows/orchestrate-dev.js` — **no `REBASE_STATUS` token anywhere; no `ship-pr` dispatch anywhere** (only `TSPEC-SHIP-01/02` flag comments at `:27`, `:30`). The trailer still exists on the branch tree (`pdlc/workflows/orchestrate-dev.js:852-853`, `:974-990`) and in the skill (`main:pdlc/skills/ship-pr/SKILL.md:41`, `:54-55`) | **Not verifiable at the declared base.** See F-15 |
| §1 A5 / AC-8.6: Phase PUB has a 10-minute no-checks window and passes when none registers | `main:pdlc/workflows/orchestrate-dev.js:33` (`CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000`) | Confirmed |
| AC-4.3 / AC-4.5 A5: `ciStatus` derives from the GHA rollup, no agent in the loop | `main:pdlc/workflows/orchestrate-dev.js:323` (`gh pr view … --json statusCheckRollup`) | Confirmed |
| AC-9.3: the LEARNINGS-precedes-delete protection today covers only `CROSS-REVIEW-*` / `CODE_REVIEW-*` | `main:pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43` (token regex `(?:CROSS-REVIEW\|CODE_REVIEW)-[\w.\-]*`) | Confirmed — the REQ's "without that extension 'exactly like' would be untrue" is accurate |
| AC-9.3: Phase PUB runs after Phase H, so A5 entries land after harvest | phase catalogue `main:pdlc/workflows/orchestrate-dev.js:1648-1745` (R, F, T, D, P, PR, CR, DOD) + Phase H/PUB/MERGE ordering per `CLAUDE.md` | Confirmed |
| AC-10.5: the pipeline already emits in-process `ESCALATION:` notices on the final report | `main:pdlc/workflows/orchestrate-dev.js:908`, `:950`, `:1324` — the literal token is **`MERGE ESCALATION:`**, emitted only by Phase MERGE for its closed set of conditions. Absent entirely from this branch's tree | Confirmed in substance; the prefix is not the bare `ESCALATION:` — see F-18 |
| BL-02: `pdlc-merge-phase` has landed on the default branch | `b5d68c2` is on `main` (and `300af4f` archives it); Phase MERGE code present at `main:pdlc/workflows/orchestrate-dev.js:43-124`, `:836-950` | Confirmed |
| BL-04: `docs/_queue/ESCALATIONS.md` does not exist yet | `docs/_queue/` contains only `QUEUE.md` | Confirmed |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

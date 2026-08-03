# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** delta confirmation — the v1.4 erratum only (§1 A2 row; AC-1.7/NFR-4; AC-4.5/5.1/5.5; AC-8.2; AC-9.1/9.3). Unchanged sections approved at v3 were not re-read.

## Review base

Diffed `b81d7d4..HEAD` on the REQ — six erratum commits (`f3615f1`, `0f2ff3e`, `85f1003`,
`acf958e`, `468164a`, `728d987`), +25/−17, version 1.3 → 1.4. Every existing-behaviour claim the
erratum introduces was re-checked at the base the REQ pins, `26c3f1c`:

| Claim in the erratum text | Verified at `26c3f1c` |
|---|---|
| No stale-REQ re-grounding gate exists today (§1 A2 row) | `orchestrate-queue.js` `triagePrompt` — the full prompt body verifies declared-dependency presence, adds only "Also flag if the REQ references subsystems that do not yet exist", instructs "Do NOT modify any files", and offers three outcomes (`ready` / `blocked` / `needs-human`). No re-grounding obligation, no citation-freshness clause |
| The dependency pre-check is a pure function of `(dependsOn, entries)` and cannot differ on a re-run after an A1 verdict | `precheckDependencies` — no IO, no clock, first not-`done` row wins, else `{blocked:false}` |
| The CI completion cap exceeds the 10-minute seam budget, so the rollup carve-out is load-bearing | `orchestrate-dev.js:35` `CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000`; the no-checks window is 10 min (`:33`), poll interval 30 s (`:34`) |
| Phase MERGE runs after Phase PUB and merges the PR raised there | `PHASE_MERGE_ENABLED` declared at `orchestrate-dev.js:39` as "the last phase of the pipeline"; `decideMerge` observes the PR raised by PUB |

No `docs/_constraints/` or `docs/_decisions/` in this repo, so no standing constraint is engaged.
REQ↔FSPEC agreement was spot-checked on the two items where the FSPEC had deliberately diverged:
FSPEC `A5-3` ("act → push → re-poll", E-1 carve-out, rollup wait excluded) and `V-5` now say the
same thing as AC-8.2 and NFR-4.

## Disposition of the erratum items

All six are resolved. The two I raised at v3 as Low (F-20, F-21) are treated below.

| Item | Raised by | Status | Evidence in the erratum |
|---|---|---|---|
| §1 A2 row claims the re-grounding obligation already lives in the triage prompt | se-review, pm-author | **Resolved** | The row now reads "Stale-REQ re-grounding — **no such gate exists today**; this feature introduces A2's trigger", with Today = "nothing fires; a stale REQ runs unnoticed". That matches `triagePrompt` at `26c3f1c` exactly. The correction is propagated, not spot-fixed: AC-5.5 no longer says "the two stops are one free-text signal" but "Today's stop is one free-text signal and A2's gate does not exist", which keeps §1 and REQ-ADV-05 consistent, and E-4 (§AC-3.3) still scopes re-grounding to A2 alone. |
| AC-4.5's A1 gate row is vacuous | se-review, pm-author (= my v3 F-20) | **Resolved** | The row is now `**none** — A1 changes no file, so no gate's inputs change and no re-run could differ`, state `n/a — pre-condition, not post-action gate`. AC-5.1's trailing clause changed in the same direction ("that pre-check runs before any advisory agent as a pre-condition, not as an AC-4.5 post-action gate"), so the REQ no longer names a gate that cannot fail. This matches FSPEC §5.4 and closes F-20 in both of its consequences: there is now no unwritable AC-4.6 test for A1, because the row asserts an absence rather than a verification. |
| AC-1.7 / NFR-4 seam budget is unqualified wall-clock and cannot bind under the 30-min CI cap | se-review, te-review, pm-author | **Resolved** | AC-1.7's row now reads "advisory working time per seam invocation, **excluding** check-rollup wait"; NFR-4 states the bound as "measured from dispatch to verdict **less** check-rollup wait" and carries the arithmetic reason inline. The reason is correct as stated: with the carve-out absent, a single 30-minute completion window (`orchestrate-dev.js:35`) exceeds the 10-minute default, so `attemptBudget` could never be reached. REQ and FSPEC V-5/A5-3 now agree in text as well as intent. |
| AC-8.2's one-attempt definition does not cover E-1's re-run-only cycle | te-review, pm-author | **Resolved** | "One attempt is one **act→re-poll** cycle, the act being either a pushed fix (E-2) or a re-run on the unchanged commit (E-1, which pushes nothing) — so E-1's re-run-only cycle counts as one attempt on the same budget." That gives E-1 a defined budget-counting oracle and matches FSPEC A5-3's generalisation. The AC-1.7 threshold row was updated to "act→re-poll" in the same pass, so the two statements of the budget no longer diverge. One residual wording nit is filed as F-23 (Low). |
| AC-9.3 binds distil-and-delete to "after Phase PUB" but says nothing about Phase MERGE | se-review | **Resolved as to the question asked** | AC-9.3 now states that MERGE runs after PUB and merges the PR raised there, so the distil-and-delete is pushed before MERGE evaluates the PR and "the merged branch carries the LEARNINGS content, not the record". That answers what the run's merged state contains. It introduces a first-ever post-PUB push, whose interaction with MERGE's own CI re-observation is filed as F-22 (Low) — a consequence to state, not a contradiction. |
| AC-9.1: records for A1/A2 candidates that never reach Phase PUB have no end of life | se-review | **Resolved** | AC-9.1 now places the A1/A2 record under the **candidate feature's** directory and says a `hold`/`escalate` adjudication "leaves it for that feature's next run to harvest at Phase PUB (AC-9.3)". That is a coherent lifecycle: the record is tracked, sits with the feature it describes, and is distilled by the first run that gets that far. A residual (a candidate that never runs) is Q-09, not a finding. |
| v3 F-21 — AC-3.6 has no reason row for an advisory agent's own abstention | se-review (v3) | **Still open, Low** | The AC-3.6 table is unchanged by the erratum (rows 1–8 as at v1.3), so AC-5.1's "where presence in base is unsettled, the advisory verdict is `escalate`" still has no exact row: it is an escalation with no proposal and no reverted diff, so row 3's trigger ("any other out-of-envelope **proposal** or reverted diff") only fits by stretch. Carried forward unchanged below; it was Low at v3 and remains Low. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

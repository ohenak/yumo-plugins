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

Numbering continues from v3. Nothing the erratum changed broke anything approved at v3: I
re-checked the four call sites the erratum touches (§1 table, AC-1.7 threshold table, AC-4.5/5.1,
AC-8.2/AC-9.1/AC-9.3) against their cross-references and found no orphaned pointer — `AC-4.5` is
still cited correctly by AC-3.6 row 4 and AC-4.6, and `advisory.attemptBudget` / `seamBudgetMinutes`
still resolve to the AC-1.7 table from AC-2.4, AC-8.2 and NFR-4.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | Low | Cross-Feature | **AC-9.3's post-PUB push is the pipeline's first, and Phase MERGE re-observes CI rather than inheriting PUB's result — so an advisory-enabled run will usually leave its own PR unmerged.** The new sentence is right that MERGE follows PUB, but MERGE does not trust PUB's verdict: `decideMerge` demands observation `O2` and applies `ciRule`, where `"pending"` resolves `mergeStatus: "refused"` (row 10) and only `"passed"` passes. Today nothing pushes after PUB's rollup goes green — harvest runs at Phase H, *before* PUB — so MERGE observes a settled head. A distil-and-delete pushed between PUB and MERGE moves the head, restarts the checks, and MERGE then reads `pending` on the new sha: `refused`, queue row stays `awaiting-merge`, a human finishes the merge. The REQ's observable ("the merged branch carries the LEARNINGS content") is not falsified by that — there simply is no merged branch that run — but the erratum reads as though merge proceeds, and an implementer will otherwise discover this at Phase MERGE. It is Low, not Medium, because `mergeMode` ships `off` (so the default-config blast radius is nil) and because the fix is one clause at REQ altitude, not a design change. Suggested wording: state which outcome is intended — either "an advisory run's PR is expected to resolve `refused`/`deferred` at MERGE and be merged by a human on the next pass", or "the advisory record is harvested before PUB raises the PR, accepting that A5 cannot then append". Whichever is chosen belongs in the REQ because it decides an operator-visible outcome; the mechanism stays TSPEC's. | AC-9.3, and `pdlc-merge-phase`'s CI rule |
| F-23 | Low | Local | **AC-8.2's leading sentence still asserts a pushed fix for every in-envelope cause, and the E-1 carve-out arrives only in the sentence after it.** As written: "Given the cause is within the envelope (AC-3.3), Then a minimal fix is committed and pushed, CI is re-polled…" — E-1 (re-running a flaky check) *is* within the envelope per AC-3.3 and commits nothing, so the Then clause is false for it until the following sentence corrects it. The attempt-accounting question the reviewers raised is genuinely answered; this is only that the criterion's first clause and its clarification now disagree about whether a push happens, which will read as an ambiguity to whoever writes the AT for E-1. One-word fix: "Then an **action** is taken — a minimal fix committed and pushed (E-2), or a re-run on the unchanged commit (E-1) — CI is re-polled, and the cycle repeats…", which also lets the following sentence shrink to just the budget rule. | AC-8.2, AC-3.3 (E-1) |
| F-21 | Low | Local | *(carried forward from v3, untouched by the erratum.)* **AC-3.6's reason set has no row for an advisory agent's considered abstention.** AC-5.1 produces exactly that outcome — "where presence in base is therefore unsettled, the advisory verdict is `escalate`" — with high confidence, no proposed diff, no prohibition, no budget or parse failure. Rows 1, 2, 4, 5, 6, 8 do not match; row 7 needs `confidence != high`; row 3's trigger names a proposal or a reverted diff and there is neither. Since AC-3.6 declares the set closed and asserts set-equality, an implementer must either invent a token or stretch row 3. Cheapest fix unchanged: reword row 3's trigger to "any other verdict that is out of envelope (proposal, reverted diff, or a decline to act)", or add an explicit ninth token if a considered abstention deserves its own label in `ESCALATIONS.md`. | AC-3.6, AC-5.1 |

## Questions

## Positive Observations

## Recommendation

## Verdict

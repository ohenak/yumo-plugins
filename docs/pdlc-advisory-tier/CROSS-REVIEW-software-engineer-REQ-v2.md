# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review — v1 findings F-01…F-15, plus new issues in changed sections only

## Review base

Diffed `bb297bf..HEAD` on the REQ (+165/−87, 9 revision commits, 252→343 lines). Every
existing-behaviour claim in the changed text was re-checked against **`main`**, which is the base
the REQ now declares it is written against (BL-02) and the base this feature will be implemented on.
`feat-pdlc-advisory-tier` is still 37 commits behind `main` — an operational note for the Phase-DOD
rebase, not a defect of this document.

Facts re-verified this round (all as the REQ describes them):

| Claim | Verified at (`main`) |
|---|---|
| Phase MERGE, its mode catalogue, its config reader are shipped | `pdlc/workflows/orchestrate-dev.js:43`, `:54`, `:60`, `:122-124`, `:1373` |
| `.claude/pdlc.config.json` is the config home for both Phase MERGE **and** the distribution gate | `orchestrate-dev.js:43`; `pdlc/hooks/scripts/lib/pdlc-drift.sh:845` |
| REQ-MERGE-03 self-modification paths (`pdlc/workflows/`, `pdlc/skills/`), additive, two defaults non-removable | `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md` REQ-MERGE-03 AC-3.1/AC-3.3 |
| §1 A1 — `needs-human` skips the candidate and the loop tries the next | `orchestrate-queue.js:912-921` (`continue`); parse `:296-314`, default `needs-human` `:304-305` |
| §1 A2 — no distinct code signal; triage verdicts are exactly `ready\|blocked\|needs-human` | `orchestrate-queue.js:314` regex, prompt catalogue `:664-666` |
| §1 A3 — 3 DoD iterations | `orchestrate-dev.js:25` (`DOD_MAX_ITERATIONS = 3`) |
| §1 A4 — `REBASE_STATUS: conflict` → halt, branch unchanged | `orchestrate-dev.js:5792`, `:5915-5918`, halt at `:8166-8171` |
| §1 A5 — red halts; no-checks passes | `raisePrAndVerifyCi`, `orchestrate-dev.js:6222-6285` (`throw haltError` on `failed`, `return { ciStatus: "no-checks" }`) |
| AC-8.2's "Phase PUB's own completion timeout" is a real, separate budget | `CI_COMPLETION_TIMEOUT_MS`, `orchestrate-dev.js:6230`, enforced `:6266-6273`; no-checks window `:33` |
| Phase order H → PUB → MERGE (AC-8.3/AC-9.3 premise) | `orchestrate-dev.js:8192` (H), `:8247` (PUB), `:8272` (MERGE) |
| Harvest delete-guard recognises only `CROSS-REVIEW` / `CODE_REVIEW` | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43` |
| Queue row 2 for `pdlc-merge-phase` still reads `pending` (BL-02's parenthetical) | `docs/_queue/QUEUE.md:15` |
| `MODEL_DEFAULT` / `MODEL_IMPLEMENTATION` / `MODEL_QUEUE` live in two modules | `orchestrate-dev.js:1578`, `:1621`; `orchestrate-queue.js:69` |

Still no `docs/_constraints/` or `docs/_decisions/` in this repo, so no standing constraint is
contradicted.

## Disposition of v1 findings

All fifteen are closed. Notes only where the resolution differs from what I asked for.

| v1 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BL-02 now reads "Satisfied", states the REQ is written against `main`, and records the stale queue row as an operator note. §1 rows re-checked and all five hold (see review base). |
| F-02 | High | **Resolved** | AC-10.5 reconciles the two channels: shipped notices unchanged, an advisory escalation additionally emits one pointing at its `ESCALATIONS.md` entry, and the durability rationale (the operator's turn begins after the process exits) is stated. Naming nit only — see F-19. |
| F-03 | High | **Resolved** | AC-8.3 is now an outcome about DoD-passed reporting ("names the verified commit; a branch head beyond it is reported unverified") with the restoration mechanism left to TSPEC. Correct altitude. |
| F-04 | High | **Resolved** | AC-9.3 states the ordering constraint as an outcome (no record deleted while a later phase can still append) and names the guard extension explicitly, which the guard script's two-prefix match (`guard-harvest-before-delete.sh:35`) does require. |
| F-05 | High | **Resolved** | AC-1.7 declares four knobs with names, defaults and one owning `advisory` section of `.claude/pdlc.config.json` — the config home Phase MERGE and the drift gate already use. The A5 fix-cycle budget is explicitly bound to the same `attemptBudget`, which closes the double-counting question AC-8.2 would otherwise have raised. |
| F-06 | High | **Resolved** | AC-3.2 is now post-hoc refusal ("one already written is reverted"), AC-3.5 is the AC-7.4 revert-and-escalate template, and AC-3.4(a) enumerates the tamper operations with a per-operation test obligation. Attainable at the `agent()` seam the runtime actually provides. |
| F-07 | Medium | **Partly** | AC-4.5 now names a gate per seam and AC-5.1 limits adjudication to abstentions and forbids overturning `blocked` — the right shape. The A1 row's factual premise is wrong; refiled as F-16. |
| F-08 | Medium | **Resolved** | BL-05 added as its own blocker, distinguished from BL-03 and from the PR rollup, and AC-8.4 states the unavailable-capability behaviour (escalate with the comparison undone, no fix attempted). |
| F-09 | Medium | **Resolved** | AC-5.5 requires a machine-readable seam token on the `needs-human` result with a default route to A1. Implementable: the reason is free text after the verdict token (`orchestrate-queue.js:314`), so a token can ride there. |
| F-10 | Medium | **Resolved** | A1 verdicts renamed `run-candidate` / `hold` / `escalate`; AC-4.2 carries the disambiguating note. No collision with the `ready: true` frontmatter flag remains. |
| F-11 | Medium | **Resolved** | AC-1.2 defines non-resolution observably (runtime rejects the dispatch with a model/alias error before output; any other failure is not non-resolution) and AC-1.4 hands the detection point to TSPEC. |
| F-12 | Low | **Resolved** | AC-1.5 now says "both the dev and the queue module (seams A1/A2 live in the queue module)". |
| F-13 | Low | **Resolved** | §1's A5 row covers both outcomes and AC-8.6 defines the no-checks case: seam does not fire, existing pass stands, outcome named in the summary. |
| F-14 | Low | **Resolved** | D-ADV-02/04 marked "Closed, not deferred — no successor"; D-ADV-05 bound to `pdlc-consolidation-agent`. Nothing left for the DoD boundary check to flag. |
| F-15 | Low | **Resolved** | The uncited anecdote is gone; AC-8.4's rationale now rests on BL-05. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

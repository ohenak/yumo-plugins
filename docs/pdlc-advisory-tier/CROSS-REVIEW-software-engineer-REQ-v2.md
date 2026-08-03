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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

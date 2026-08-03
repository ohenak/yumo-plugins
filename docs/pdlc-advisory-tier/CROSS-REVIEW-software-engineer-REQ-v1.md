# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** technical feasibility, implementability, cost, integration boundaries

## Review base

Every claim below was checked against source, not against sibling documents. Two bases exist and
they differ materially:

- **Branch base** — `feat-pdlc-advisory-tier` is **37 commits behind `main`**
  (`git rev-list --count HEAD..main` → 37; 208 files, +123,789/−1,396 since the merge base).
  `pdlc/workflows/orchestrate-dev.js` is ~2,150 lines here and ~8,100 lines on `main`, and
  `runtime-adapter.js`, `build-runtime.mjs`, `cli.mjs`, `lib/` and `dist/` do not exist on this
  branch at all.
- **`main`** — carries Phase MERGE, the `converge()` review primitive
  (`main:pdlc/workflows/orchestrate-dev.js:7425`), wave-based Phase I, and the config reader
  `MERGE_CONFIG_PATH = ".claude/pdlc.config.json"` (`main:pdlc/workflows/orchestrate-dev.js:43`).

Where the two agree I cite the branch; where they differ I cite `main` explicitly, because `main`
is what this feature will be implemented against.

Confirmed as described by the REQ (all five seams still exist with the stated semantics):

| Seam | Verified at |
|---|---|
| A1 `needs-human` → skip | `pdlc/workflows/orchestrate-queue.js:596-604`; parse at `:264-284`; default `needs-human` at `:272-273`. Same on `main` (`orchestrate-queue.js:314`, `:912-918`) |
| A2 re-grounding gate | prompt-only — `pdlc/skills/orchestrate-queue/SKILL.md:135-148`. No code site (see F-09) |
| A3 DoD 3 iterations | `DOD_MAX_ITERATIONS = 3`, `pdlc/workflows/orchestrate-dev.js:24`; `main:25` |
| A4 rebase conflict → halt | `pdlc/workflows/orchestrate-dev.js:1940-1946`; `main:8166-8167` |
| A5 CI red → halt | `pdlc/workflows/orchestrate-dev.js:1315-1317` (`throw haltError`) |
| `MODEL_*` constants | `orchestrate-dev.js:39-40`, `orchestrate-queue.js:64`; `main:1578`, `main:1621` |
| `REQ-MERGE-03` citation | real — `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md:106` |
| Upstream master-plan row | real — `docs/design/MASTER-PLAN-engineering-loop.md:243` (order 3) |

No `docs/_constraints/` or `docs/_decisions/` exists in this repo, so no standing constraint or
promoted decision is contradicted; the citations the REQ makes to `REQ-MERGE-03` and to the master
plan both resolve.

## Findings

## Questions

## Positive Observations

## Recommendation

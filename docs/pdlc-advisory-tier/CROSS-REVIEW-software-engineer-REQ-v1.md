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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The REQ is grounded on a base that no longer exists.** BL-02 lists "`pdlc-merge-phase` delivered" as an outstanding blocker, but Phase MERGE is already on `main` (`MERGE_MODES`, `main:pdlc/workflows/orchestrate-dev.js:54`; `mergeMode` gates at `:837`, `:1407`). This is precisely the stale-premise case seam A2 exists to catch (`pdlc/skills/orchestrate-queue/SKILL.md:135-148`): a declared dependency merged after the REQ's 2026-07-27 authoring date. Re-diff every §1 "Today" claim and §6 blocker against `main` before FSPEC authoring, and downgrade BL-02 from blocker to satisfied. (`docs/_queue/QUEUE.md` still shows order 2 `pending` for the delivered feature — a queue defect, noted for the operator, not folded into this verdict.) | §1, §6 BL-02 |
| F-02 | High | Cross-Feature | **REQ-ADV-10 reinvents a shipped escalation channel.** `main` already ships an operator escalation mechanism for the same audience and the same moment: `MERGE_ESCALATIONS` (`main:pdlc/workflows/orchestrate-dev.js:1321-1328`) emitting `MERGE ESCALATION: …` notices onto the final report (`:908`, `:920`, `:950`, `:1509`, `:1542`). REQ-ADV-10 defines a second, file-based channel (`docs/_queue/ESCALATIONS.md`) with no reconciliation, so an operator would have to watch two places to learn the pipeline needs them. Either extend the shipped mechanism to carry advisory escalations, or state as an outcome why a durable file is required where a report notice is not — and in that case say what happens to the existing `MERGE ESCALATION:` notices. | REQ-ADV-10, §6 BL-04 |
| F-03 | High | Local | **AC-8.3 asks for a phase re-entry the pipeline shape forbids.** Phase PUB is the last phase and runs *after* Phase H harvest (`pdlc/workflows/orchestrate-dev.js:2005-2028`; ordering unchanged on `main`, `:8166`+). "Phase DOD re-verifies" after a PUB-time push therefore means re-entering a phase whose artifacts (`CODE_REVIEW-{feature}-v{N}.md`) harvest has already deleted, and any new `CODE_REVIEW-*` produced by the re-verify is created after the only harvest and is never distilled. The requirement itself is right ("a branch that changed after the gate has not been through the gate") — state it as that observable outcome (the run is not reported DoD-passed on unverified bytes) and leave the loop shape to TSPEC, rather than asserting a re-entry that does not exist. | AC-8.3 |
| F-04 | High | Local | **AC-9.3 cannot hold for the highest-value seam.** `ADVISORY-{feature}.md` is declared a Phase-H harvested artifact, but seam A5 (REQ-ADV-08) fires in Phase PUB, which runs *after* Phase H (`orchestrate-dev.js:2005-2028`). Every A5 advisory record is written after its own harvest and can never reach LEARNINGS — which disables exactly the improvement loop §9's closing paragraph and D-ADV-01/D-ADV-03 depend on. Related: "exactly like `CROSS-REVIEW-*` and `CODE_REVIEW-*`" is not achievable as written, because the delete guard recognises only those two prefixes (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43`), so an `ADVISORY-*` deletion is unguarded where the others are not. | AC-9.3 |
| F-05 | High | Local | **Four "configured" thresholds are cited with no default and no owner.** AC-2.4 "configured attempt budget", NFR-4 "configured budget" (wall-clock), AC-3.1's envelope allow-list, and AC-1.6's `ADVISORY_ENABLED` all name a knob whose default value and config home are unstated; only AC-8.2's 3 attempts is declared. A config home already exists and is the obvious owner: `.claude/pdlc.config.json` (`main:pdlc/workflows/orchestrate-dev.js:43`, `MERGE_CONFIG_PATH`), read via `parseMergeConfig` (`main:101`) with a frozen defaults object (`main:60`) — the same shape `distribution.checkEnabled` and `merge.mergeMode` already use. Declare each threshold's name, default value, and owning config section before FSPEC. | AC-1.6, AC-2.4, AC-3.1, NFR-4 |
| F-06 | High | Local | **AC-3.5's "structurally impossible" is not attainable at the enforcement point the architecture provides.** Every advisory action is performed by a dispatched agent through the runtime `agent()` seam (`orchestrate-dev.js:1568`), which takes a skill, a prompt and options — there is no tool-restriction or write-sandbox parameter, on this branch or on `main` (`main:6911`, `main:7167`). The workflow script therefore cannot prevent a write; it can only inspect the resulting diff and revert. AC-3.2's "refused by the workflow script" is achievable *post-hoc*, AC-3.5's "structurally impossible rather than discouraged" is not. Restate AC-3.5 as the observable outcome it can actually have — an advisory-produced diff that touches a test assertion is reverted and escalated, and no run in which that happened is reported as resolved — which is testable and is what AC-7.4 already does for the rebase seam. | AC-3.2, AC-3.5 |

## Questions

## Positive Observations

## Recommendation

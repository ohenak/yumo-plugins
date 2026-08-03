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
| F-07 | Medium | Local | **AC-4.5's "original deterministic gate" does not exist for seams A1/A2, and AC-5.1 lets the tier flip a blocking verdict.** The Phase-0 gate is itself an LLM agent — `orchestrate-queue.js:578-581` dispatches the `se-author` skill on `MODEL_QUEUE` and parses a free-text `TRIAGE:` trailer (`:264-284`). Only the dependency-presence pre-check is deterministic (`precheckDependencies`, `:573-582`). So AC-4.5 ("the original deterministic gate re-runs and reaches its own verdict") has nothing to re-run at A1/A2, while AC-5.1 permits the advisory agent to return `ready` where triage returned `needs-human` — one model overruling another model's block, which is the "converting a blocking verdict into a passing one" the scope line forbids. Name which sub-check stays deterministic, and state what the advisory verdict may and may not override. | AC-4.5, AC-5.1 |
| F-08 | Medium | Local | **AC-8.4 needs a capability §6 does not claim.** Establishing that a failing check "is also present on the default branch" requires reading default-branch check history — a different `gh` surface from BL-03's `gh run view --log-failed`, and different again from the only CI read the pipeline performs today, `gh pr view <url> --json statusCheckRollup` (`orchestrate-dev.js:879`). Add the capability to §6 as its own blocker, and state the observable behaviour when it is unavailable (escalate with the comparison undone, presumably — but the REQ must say, because the alternative is silently attributing an unrelated failure to the feature, the exact harm AC-8.4 exists to prevent). | AC-8.4, §6 BL-03 |
| F-09 | Medium | Local | **Seam A2 has no distinct observable signal.** The re-grounding gate exists only as a triage-prompt obligation (`pdlc/skills/orchestrate-queue/SKILL.md:135-148`) that instructs the agent to emit `needs-human`. In code there is one `needs-human` branch (`orchestrate-queue.js:596-604`) and nothing distinguishes an A1 stop from an A2 stop — the reason string is free text. §1 presents them as two seams at two locations. This matters because REQ-ADV-05 gives A1 and A2 different envelopes (AC-5.1 vs AC-5.3): the workflow cannot route to the right envelope from a signal it cannot tell apart. State the outcome that makes them distinguishable, or collapse them into one seam. | §1 (A1, A2), AC-5.1, AC-5.3 |
| F-10 | Medium | Local | **`ready` is overloaded across two prohibitions.** AC-4.2 forbids the tier from ever setting `ready: true` on a REQ — real thing, frontmatter parsed at `orchestrate-queue.js:560-565`. AC-5.1 permits it to *return* a verdict of `ready` — also a real thing, `TRIAGE: ready` parsed at `:282`. Two different objects, one word, in adjacent prohibitions; a reader (or an implementer) can satisfy one while breaking the other and believe they are consistent. Rename one of them in the REQ. | AC-4.2, AC-5.1 |
| F-11 | Medium | Local | **AC-1.4's "fails at startup" assumes a model-resolution probe that does not exist.** `model` is an opaque option handed to the runtime `agent()` call (`orchestrate-dev.js:1568`; `orchestrate-queue.js:505`) and nothing on `main` validates it before dispatch — an unresolvable alias surfaces, if at all, when the first agent is dispatched. Startup-time failure may simply not be implementable. The requirement's substance is sound; state it as the outcome ("no advisory agent ever runs on an unresolved model, and a wholly unresolvable configuration fails the run loudly rather than reverting to `MODEL_DEFAULT`") and let TSPEC choose the detection point. Same note applies to AC-1.2's "cannot be resolved by the runtime" — the REQ should say what *observation* constitutes non-resolution. | AC-1.2, AC-1.4 |
| F-12 | Low | Local | AC-1.1 places `MODEL_ADVISORY` "alongside the existing `MODEL_DEFAULT`, `MODEL_IMPLEMENTATION` and `MODEL_QUEUE`", implying one location. They are in two modules: `orchestrate-dev.js:39-40` and `orchestrate-queue.js:64`. AC-1.5's one-line-change goal is still achievable — `main:pdlc/workflows/orchestrate-queue.js:40` already imports `orchestrate-dev.js` — but the REQ's phrasing understates that seams A1/A2 live in the other module. | AC-1.1, AC-1.5 |
| F-13 | Low | Local | §1's "Today" row for A5 is incomplete. Red CI does halt (`orchestrate-dev.js:1315-1317`), but there is a second, quieter outcome: no checks registering within `CI_NO_CHECKS_TIMEOUT_MS` (10 min, `:32`) returns `ciStatus: "no-checks"` and the phase **passes** (`:1336-1343`). Seam A5's behaviour is undefined for a run where CI never appeared — arguably the case most deserving an advisory look, since today it is indistinguishable from a repo with no CI. | §1 (A5), REQ-ADV-08 |
| F-14 | Low | Local | Three deferrals bind to "—": D-ADV-02, D-ADV-04, D-ADV-05. The DoD verifier treats a deferral with no queued successor as a boundary finding (`pdlc/skills/dod-verify/SKILL.md:145`), so these will resurface at Phase DOD of this very feature. Bind each to a successor or state explicitly that it is closed rather than deferred. | §7 |
| F-15 | Low | Local | Line 188's justification for AC-8.4 ("drawn from a recorded real occurrence") cites nothing. Per the REQ altitude rule, shipped-behaviour facts belong in a constraints file as measured-fact ids; this repo has no `docs/_constraints/` at all. Either drop the anecdote from the REQ or create the constraints entry it should cite, so the rationale survives independently of this document. | §REQ-ADV-08, line 188 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With Phase MERGE now on `main`, is there a sixth seam? Phase MERGE resolves to `deferred` / `refused` on four named conditions (`main:pdlc/workflows/orchestrate-dev.js:1321-1328`) and leaves the queue row `awaiting-merge` for a human — structurally the same "operator arrives at an unexplained stop" §1 describes. §5 puts "merging" out of scope, which I read as *the tier never merges* (AC-4.4, NFR-5) rather than *the tier never diagnoses a refused merge*. Which is intended? |
| Q-02 | AC-8.2 pushes a fix to the feature branch during Phase PUB. What is the intended interaction with the PR's review threads and with Phase MERGE's `mergeableState` precondition — does a PUB-time push invalidate an approval that was already recorded? |
| Q-03 | AC-3.3 permits "resolving a rebase conflict confined to files the feature branch itself created". Is "created" evaluated against the merge base or against the default branch tip? A file created on the feature branch *and* independently created on the default branch conflicts and satisfies a naive reading of "the feature branch created it" — which is exactly the shared-code case AC-7.3 wants escalated. |
| Q-04 | NFR-3 promises byte-identical behaviour with `ADVISORY_ENABLED = false`. Does that extend to the final report — i.e. is the AC-9.4 advisory summary absent entirely when disabled, or present with zero counts? The two are not byte-identical and the report is a parsed surface. |
| Q-05 | AC-2.2 requires `confidence == high` for autonomous action, but confidence is self-reported by the same agent proposing the action. What, observably, prevents an agent from labelling every proposal `high`? If the answer is "the envelope check is the real control and confidence is advisory", say so — it changes what AC-2.2 is buying. |

## Positive Observations

- The separation of *diagnosing* from *authorizing* (§1, closing paragraph) is the right cut, and it
  is what makes the rest of the REQ reviewable rather than alarming. The prohibitions in REQ-ADV-04
  are stated as outcomes, are individually checkable, and AC-4.6 pairs each with a required test —
  that is the correct shape for a control.
- AC-1.2/AC-1.3's treatment of the fallback as a *declared, first-class outcome* rather than a
  silent downgrade is genuinely good engineering, and it de-risks BL-01 without hiding it. The
  three-way split across AC-1.2 / AC-1.3 / AC-1.4 leaves no unhandled model-resolution state.
- AC-1.5's one-line-change goal is achievable against the real module layout:
  `main:pdlc/workflows/orchestrate-queue.js:40` already imports `orchestrate-dev.js`, so a single
  exported constant is genuinely reachable from both the queue seams and the dev seams.
- A config home for the envelope already exists and needs no invention:
  `.claude/pdlc.config.json` (`main:pdlc/workflows/orchestrate-dev.js:43`) with the
  `parseMergeConfig` / frozen-defaults pattern (`main:101`, `main:60`) and a precedent for a
  per-repo opt-out (`distribution.checkEnabled`). Adopting that shape resolves F-05 cheaply.
- AC-7.4 (apply → re-run tests → revert on failure → escalate) is the right template for every
  advisory action, and generalising it is the concrete path out of F-06.
- AC-8.4 is the finding I would most have expected a spec to miss. It is correct, it is the
  expensive failure mode, and it is worth the extra `gh` capability F-08 asks you to declare.

## Recommendation

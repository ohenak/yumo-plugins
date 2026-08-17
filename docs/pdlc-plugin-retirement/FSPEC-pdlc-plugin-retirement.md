---
feature: pdlc-plugin-retirement
---

# FSPEC — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.9); measured surface `docs/_constraints/pdlc-retirement-baseline.md` |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-17 |

**FSPEC-RET-01** — behavioural specification of the retirement sweep, its gates, its
pinned literals and the consumer cleanup step.

## 1. Overview

The sweep removes the workflow-runtime host's machinery from the repo while the pdlc plugin
stays installed permanently as the engine's skills carrier (REQ G-1, G-2, NG-1). This
specification fixes the *observable* behaviour of that sweep: the order its work lands in, the
gates each commit must pass, the literal values the checkable criteria compare against, what the
orchestration skills do after they stop carrying pipeline logic, and how the one-time consumer
cleanup behaves. It states no implementation contract; how each behaviour is realised is the
TSPEC's and PLAN's.

**Measured base commit for every literal in this document: `b3f24fc6`** (2026-08-17,
`feat-pdlc-plugin-retirement`). Every pinned literal in §4 is transcribed here at authoring time
and **re-transcribed at C-6 re-measurement time** against the sweep's actual base commit before
the first deletion commit; a literal that moved between the two is corrected in this FSPEC, not
worked around in a test.

### 1.1 What is in this feature's scope

| Area | Behaviour specified here |
|---|---|
| Deletion sweep | Commit classes, per-commit gate set, ordering constraints (§3.1, §4.1) |
| Pinned literals | AC-1.2's term set and its expected-empty command; AC-1.3's suite count; AC-1.7's hook-entry set; AC-3.3's skill set; AC-1.8's gate command set (§4.2) |
| Documentation | The instructional set, and what a reader must no longer be able to find (§3.3, §4.3) |
| Delegator skills | What `orchestrate-dev` / `orchestrate-queue` do when invoked after the sweep, including how an engine refusal reaches the human (§3.4, §4.4 — REQ O-2) |
| Consumer cleanup | Invocation, idempotence, refusal behaviour and exit convention (§3.5, §4.5) |
| Version handshake | Which plugin version line the sweep may ship under the published engine's declared range (§4.6 — REQ BL-07, C-10) |

### 1.2 What is *not* decided here

Per REQ O-3 and O-4, the probe CLI's surviving path (and therefore AC-1.1's branch) and the
Phase-MERGE self-modification guard paths are settled in the **TSPEC**. This FSPEC pins AC-1.3's
literals and treats the CLI's post-sweep location as "the single surviving path the TSPEC names".
Engine-side runtime capability stays with the engine's own successors (REQ NG-5), except the two
carve-outs REQ NG-5 makes explicit: the declared compatible-plugin range, and engine-side tests
and fixtures whose subject is a retired artifact.

### 1.3 State of the prerequisites at authoring time

Checked at `b3f24fc6`; each is re-checked at Phase R gate time, and BL-03/BL-07/BL-08 gate the
first deletion commit rather than this document.

| Row | State at HEAD | Evidence |
|---|---|---|
| BL-01 | satisfied | `docs/completed/pdlc-headless-engine/` present; `docs/_queue/QUEUE.md` records the row's removal on 2026-08-12 |
| BL-02 | satisfied | `docs/completed/pdlc-engine-distribution/` present; `QUEUE.md` records row 4's removal on 2026-08-16 as merged |
| BL-03 | **not satisfied** — no adoption run report is tracked at HEAD; a `grep` of `git ls-files` for a report artifact returns none. C-1's four thresholds are the operator's to judge and the reports are the operator's to capture and commit; §7 O-A carries this as the gating obligation | — |
| BL-04 | operator-judged; the guard carrier is exercised on the engine path (`pdlc/engine/lib/startup.mjs` `checkGuardCarrier`) | re-confirmed at gate time |
| BL-05 | **not satisfied** — `QUEUE.md` row 8 (`pdlc-release-ci`) is still `blocked` and still describes the retired copy channel | `docs/_queue/QUEUE.md` row 8 |
| BL-06 | pending — `docs/_decisions/DECISIONS-plugin-distribution.md` exists and is unsuperseded at HEAD | that file |
| BL-07 | **not satisfied for a minor bump** — the published engine `@kaneho/pdlc-engine@0.2.0` declares `pluginCompat: ^0.23.0` (`docs/completed/pdlc-engine-distribution/EVIDENCE-ENGINE-V0.2.0.md` §2), and the repo's `pdlc/engine/package.json:18` declares the same `^0.23.0`. The plugin is at `0.23.1` (`pdlc/.claude-plugin/plugin.json`). See BR-VER-1 | as cited |
| BL-08 | not yet captured — no pre-sweep report or gate transcript is tracked at HEAD | §7 O-B |

## 2. Linked Requirements

## 3. Behavioral Flow

## 4. Business Rules

## 5. Edge Cases and Error Scenarios

## 6. Acceptance Tests

## 7. Open Questions

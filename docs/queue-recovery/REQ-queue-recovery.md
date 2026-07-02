---
Status: Draft
Author: pm-author
Version: 1.0
Feature: queue-recovery
ready: true
depends-on: []
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/queue-recovery/LEARNINGS-queue-recovery.md |

# REQ — queue-recovery

Make the serial queue self-healing and make triage do the re-grounding it promises. Today a hard crash (killed loop, OOM) leaves a QUEUE.md row `in-progress` forever, and `selectNextPending` refuses all work while any row is `in-progress` — one crash freezes the whole queue until a human edits the table. `halted` rows silently block their dependents with no surfaced alert. And DEC-01's stale-REQ re-grounding gate ("re-diff REQ citations against HEAD, emit needs-human") exists only in the skill prose — `triagePrompt` never asks for it, so the exact regression DEC-01 was written to prevent ships today.

---

## Background

Gap review findings (2026-07-01), `pdlc/workflows/orchestrate-queue.js` and `skills/orchestrate-queue/SKILL.md`:

- `runPicked` writes `in-progress` before the pipeline (:593); JS throws are caught → `halted` (:599), but hard crashes leave `in-progress`; `selectNextPending` then returns `blocked-active` on every pass (:349-351). No lease, no timeout, no recovery.
- `halted` is terminal-for-loop; dependents triage `blocked` forever (SKILL.md:108-119); only signal is a skip log line.
- DEC-01 re-grounding (SKILL.md:140-149) absent from `triagePrompt` (:373-388).
- `updateQueueStatus` (:325) collapses column padding and updates only the first matching feature row.

---

## Scope

### In Scope

- Lease stamp on `in-progress` rows + stale-lease recovery
- Halted/blocked surfacing in every queue-iteration report
- DEC-01 re-grounding steps embedded in the triage prompt and TRIAGE trailer
- `updateQueueStatus` formatting preservation + duplicate-row detection

### Out of Scope

- Parallel queue execution (stays serial by design)
- Automatic retry of `halted` features (human decision stays; only visibility changes)
- Queue UI beyond QUEUE.md + report text

### Assumptions

- QUEUE.md stays a Markdown table; extra columns are permitted by the documented parser ("extra columns are ignored")
- The loop driver (`/loop`) re-invokes orchestrate-queue at least every few minutes while active

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As a pdlc user running the queue overnight, I want a crashed run's `in-progress` row to be reclaimed automatically after a staleness window, so that one crash does not freeze the queue until morning. |
| US-02 | As a pdlc user, I want every queue iteration to report halted rows and the dependents they block, so that a stuck pipeline is impossible to miss. |
| US-03 | As a pdlc user, I want triage to verify a REQ's claims against the current codebase (DEC-01), so that a stale REQ is routed to a human instead of producing specs against files that moved. |
| US-04 | As a pdlc maintainer, I want QUEUE.md edits to be surgical, so that status updates do not reformat the table or touch the wrong row. |

---

## Requirements

### Domain: QREC — Lease & Recovery

#### REQ-QREC-01
**Title:** Lease stamp on in-progress

**Description:** When a row transitions to `in-progress`, the skill SHALL record a lease timestamp (ISO-8601 UTC) in a `Lease` column (added if absent). On every invocation, before selection, any `in-progress` row whose lease age exceeds the staleness window SHALL be transitioned to `halted` with a note `stale-lease`, unblocking the queue.

Threshold declaration: **QUEUE_LEASE_STALE_MINUTES** = 120 (default; owner: orchestrate-queue.js constant; overridable via QUEUE.md header comment `lease-stale-minutes: N`).

**Acceptance criteria:**
- **Who:** queue driver / **Given:** row `in-progress` with lease 3 h old / **When:** next invocation / **Then:** row becomes `halted (stale-lease)`, selection proceeds to other work.
- **Who:** queue driver / **Given:** row `in-progress` with lease 10 min old / **When:** invocation / **Then:** `blocked-active` behavior unchanged (genuine run respected).

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01

#### REQ-QREC-02
**Title:** Lease refresh on long runs

**Description:** The queue skill SHALL refresh the lease timestamp when it delegates to orchestrate-dev and when the pipeline reports phase completions (where observable). At minimum the lease SHALL be re-stamped once at delegation time so the window measures pipeline inactivity, not pipeline duration from pickup.

**Acceptance criteria:**
- **Who:** queue driver / **Given:** legitimate 4-h pipeline updating its checkpoint / **When:** stale check runs mid-pipeline after a recent re-stamp / **Then:** not reclaimed.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-01

### Domain: QREC — Visibility

#### REQ-QREC-03
**Title:** Halted/blocked surfacing

**Description:** Every queue-iteration report SHALL include a table of rows in `halted`/`blocked` status with: feature, reason (from the halt note), the list of pending dependents transitively blocked by it, and the human action required (`reset to pending` / `resolve and set done`). An iteration that picks no work because everything is halted/blocked SHALL say so explicitly rather than "queue empty".

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** `harden-harvest-guard` halted and `harvest-after-pub` depends on it / **When:** iteration report / **Then:** report shows halted row, blocked dependent, required action.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

### Domain: QREC — Triage Re-grounding (DEC-01)

#### REQ-QREC-04
**Title:** Re-grounding checks in triage

**Description:** The Phase-0 triage prompt SHALL instruct the triage agent to: (1) extract file paths, symbols, line references, and dependency-surface claims cited in the REQ; (2) verify each exists/matches at current HEAD; (3) verify each queue dependency is merged into the base; (4) return `TRIAGE: needs-human` with an itemized stale-claims list when any citation is stale, `TRIAGE: blocked` for unmerged deps, `TRIAGE: ready` otherwise. The TRIAGE trailer JSON SHALL gain `stale_claims: [..]`.

**Acceptance criteria:**
- **Who:** triage agent / **Given:** REQ cites `orchestrate-dev.js:1547` but the phase block moved / **When:** triage / **Then:** `needs-human` with the stale citation listed; feature not picked.
- **Who:** triage agent / **Given:** all citations current, deps merged / **When:** triage / **Then:** `ready`.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-03

### Domain: QREC — Table Hygiene

#### REQ-QREC-05
**Title:** Surgical QUEUE.md updates

**Description:** `updateQueueStatus` SHALL preserve column widths/padding and all non-target rows byte-for-byte, and SHALL fail (halt the iteration with a clear message) if the feature slug matches zero or multiple rows, rather than silently updating the first.

**Acceptance criteria:**
- **Who:** queue driver / **Given:** duplicate rows for one feature / **When:** status update / **Then:** halt "duplicate queue rows for {feature}".
- **Who:** maintainer / **Given:** hand-aligned table / **When:** one row's status updates / **Then:** diff touches only that row.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-04

---

## Open Questions

None.

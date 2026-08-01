---
ready: false
depends-on: []
---

# REQ — pdlc-adapter-read-cache

| Field | Value |
|---|---|
| Status | Draft |
| Author | pm-author |
| Version | 1.0 |
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | — (none yet) |
| LEARNINGS | docs/pdlc-adapter-read-cache/LEARNINGS-pdlc-adapter-read-cache.md |

## 1. Problem

The workflow runtime adapter reads files through IO agents in verified 6,000-byte
chunks (`RT_READ_CHUNK`, `pdlc/workflows/runtime-adapter.js:97`). One logical
`rtReadFile(path)` costs **1 size-probe agent + ⌈size/6000⌉ chunk agents**
(`runtime-adapter.js:229-262`) — for a 40 KB cross-review, 8 agents.

The workflow modules call their injected `_readFile` seam independently from every
concern that needs the bytes, with no memory between calls:

- `refreshReviewState` (`pdlc/workflows/orchestrate-dev.js:2585`) re-reads the
  candidate round's review files on **every** review-loop step;
- `tier2ApprovalRecord` (`orchestrate-dev.js:2755`) reads the same files again to
  extract approval anchors;
- the feedback-assembly dispatch reads them again to quote findings to the author.

**Measured floor** (run `wf_a985bc0f-d18`, 2026-08-01, feature
`pdlc-review-convergence`): `CROSS-REVIEW-software-engineer-REQ-v5.md` (~40 KB,
7 chunks) was fully re-read **at least 3 times inside 8 minutes** with no
intervening write to it — ≥21 chunk agents plus size probes dispatched to fetch
bytes the invocation already held. Beyond token cost and latency, the repeated
identical reads made the run **look stuck** to the operator watching
`/workflows` — an interpretability failure, not just a cost one.

The adapter is the right layer for the fix: the modules' seam-per-concern shape is
tested and correct, and deduplicating call sites module-by-module would fight the
design instead of completing it.

## 2. User Stories

| ID | Story |
|---|---|
| US-01 | As the **operator paying for a pipeline run**, I want a file that has not changed to be transported through agents **once**, so that review loops do not multiply IO agent fan-out (and tokens, and wall-clock) by the number of module call sites. |
| US-02 | As the **operator watching `/workflows` live**, I want repeated reads of an unchanged file to be visibly cheap (a single revalidation probe, not a fresh chunk burst), so that normal loop progress is distinguishable from a stuck run at a glance. |
| US-03 | As the **maintainer of the workflow modules**, I want caching to live entirely behind the adapter's `_readFile`/`_writeFile` seams, so that module code and its jest suite keep their current shape and remain the single tested source of truth. |

## 3. Requirements

_(authored below — see §3.1–§3.6)_

## 4. Scope

_(§4)_

## 5. Prerequisites

_(§5)_

## 6. Non-Functional Requirements & Threshold Declarations

_(§6)_

## 7. Traceability

_(§7)_

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

### REQ-RTCACHE-01 — Correctness bound: a cache never serves bytes that differ from disk (P0)

**Source:** US-01, US-03.

- **Who:** any workflow module calling the injected `_readFile`.
- **Given:** `rtReadFile(path)` previously returned content for `path` in this
  invocation, and the file at `path` **may have been mutated since** — including
  by a **dispatched agent's own tools**, outside the adapter's write seam
  (reviewer and author skills write `CROSS-REVIEW-*` and spec files themselves;
  the adapter never sees those writes).
- **When:** `_readFile(path)` is called again.
- **Then:** the returned content is byte-identical to the file on disk at the
  time of this call. A cached entry may be served **only** after the adapter has
  positively established the file is unchanged (see RT_REVALIDATION_PROBE, §6);
  any doubt — probe mismatch, probe failure, unparseable probe reply — falls
  back to a full verified chunked read. Fail open to re-reading, never to stale
  bytes.

This is the load-bearing criterion: `isComplete`, `extractFileVerdict`,
`deriveRoundWindow` inputs and approval anchors are all computed from these
bytes, and a stale serve would corrupt gating decisions silently.

### REQ-RTCACHE-02 — Repeated read of an unchanged file costs at most one IO agent (P1)

**Source:** US-01, US-02.

- **Who:** the operator paying for / observing the run.
- **Given:** a file was fully read once in this invocation and has not changed.
- **When:** any later `_readFile(path)` call in the same invocation asks for it.
- **Then:** at most **one** IO agent is dispatched (the revalidation probe, §6)
  — never the size-probe + chunk fan-out. For the measured floor in §1, the
  three re-reads collapse from ≥21 chunk agents to 2 probe agents.

### REQ-RTCACHE-03 — Adapter-seam writes invalidate before they return (P0)

**Source:** US-03.

- **Who:** any workflow module calling the injected `_writeFile` (or the
  append-style write, `runtime-adapter.js:316`).
- **Given:** a cached entry exists for `path`.
- **When:** the adapter writes or appends to `path`.
- **Then:** the entry for `path` is invalidated **before** the write call
  resolves, so a read racing in after the write can never observe the
  pre-write cache.

### REQ-RTCACHE-04 — Cache lifetime is one workflow invocation (P0)

**Source:** US-03.

- **Who:** an operator resuming a run (`resumeFromRunId`) or re-invoking after
  a halt.
- **Given:** a prior invocation cached content.
- **When:** a new invocation (or resume) starts.
- **Then:** it starts with an empty cache — no persistence to disk, no sharing
  across invocations. (Resume replay of completed `agent()` calls is the host
  runtime's concern and is unaffected: the cache lives in script memory and is
  rebuilt as replayed reads complete.)

### REQ-RTCACHE-05 — Cache-hit observability (P2)

**Source:** US-02.

- **Who:** the operator watching `/workflows`.
- **Given:** a `_readFile` call is served from cache.
- **When:** the call completes.
- **Then:** a `log()` line records the hit (`path`, agents avoided), so the
  cheapness of a repeated read is visible in the run narration rather than
  inferable only from the absence of chunk agents.

## 4. Scope

**In scope**

- `pdlc/workflows/runtime-adapter.js` — the cache, keyed by `path`, wrapped
  around `rtReadFile` / `rtWriteFile` / the append write; nothing above the
  seam changes.
- Jest coverage in `pdlc/workflows/__tests__/` for hit, revalidation-miss,
  seam-write invalidation, out-of-seam mutation detection, and eviction.
- `pdlc/workflows/dist/` rebuilt in the same commit (repo rule: the adapter is
  inlined by `build-runtime.mjs`; a stale dist fails `--check` and CI).

**Out of scope** (not deferred capabilities — explicitly not wanted here)

- Caching `_listFiles` results: directory listings feed `deriveRoundWindow`,
  whose whole design is to re-derive from the live listing; caching it would
  change gating semantics, not just cost.
- Deduplicating module call sites (`refreshReviewState` et al.): the
  seam-per-concern shape is the tested design; this REQ completes it at the
  adapter instead.
- Persistence across invocations, or any shared cache between concurrent runs.

**Assumptions**

- Only this invocation's agents and the operator touch the repo during a run;
  the cache defends against those mutations (REQ-RTCACHE-01), not against a
  hostile concurrent writer.

## 5. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | Chunked, size-verified `rtReadFile` (`RT_READ_CHUNK`, `rtChunkPlan`, `rtReadChunk`) | Commits `f18c341`, `fb9ac66` merged | Must exist at HEAD before FSPEC authoring — **satisfied**: both are on `main` as of 2026-08-01 |

## 6. Non-Functional Requirements & Threshold Declarations

**NFR-01 — Runtime constraints.** The adapter runs inside the workflow runtime:
no Node APIs, no `Date.now()` / `Math.random()` / argless `new Date()`. Eviction
order and probe retries must therefore be clock-free (insertion-order counters).

**NFR-02 — Portability.** The revalidation probe's shell command must work on
both macOS bash 3.2 and Linux bash 5 (the CI matrix exists for exactly this);
the hash tool differs across platforms (`shasum -a 256` vs `sha256sum`) — the
TSPEC owns the concrete command, this REQ owns only the fingerprint strength.

**Declared thresholds** (config owner for all: the constants block at the top of
`pdlc/workflows/runtime-adapter.js`, alongside `RT_READ_CHUNK`):

| Threshold | Default | Derivation / meaning |
|---|---|---|
| `RT_REVALIDATION_PROBE` | 1 IO agent returning byte size **and** a SHA-256 of the file | Size alone cannot detect a same-size edit; size+SHA-256 makes a stale serve require a hash collision. One agent is the cost ceiling REQ-RTCACHE-02 promises. |
| `RT_READ_CACHE_MAX_BYTES` | 2,097,152 bytes (2 MiB) | Measured floor: the largest document the adapter has transported is 209,953 bytes (`runtime-adapter.js:85-86`). 2 MiB ≈ 9.9 such documents — more than one review round's working set (REQ + spec + 2 reviews ≈ 4 docs). Over the cap, evict oldest-inserted entries; never refuse the read itself. |
| `RT_REVALIDATION_RETRIES` | 2 (mirrors `RT_READ_RETRIES`) | A garbled probe reply is a transport fault; after retries are exhausted the entry is dropped and the read proceeds as a full chunked read (fail open to re-reading, per REQ-RTCACHE-01). |

## 7. Traceability

| User Story | Requirements |
|---|---|
| US-01 | REQ-RTCACHE-01, REQ-RTCACHE-02 |
| US-02 | REQ-RTCACHE-02, REQ-RTCACHE-05 |
| US-03 | REQ-RTCACHE-01, REQ-RTCACHE-03, REQ-RTCACHE-04 |

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

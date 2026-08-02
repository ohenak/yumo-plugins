# PROPERTIES — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | *(none yet — PROPERTIES round 1 pending)* |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-02 |

> **Scope in one line.** The invariants Phase MERGE must satisfy over *all* inputs — the quantified
> layer beneath TSPEC §13's example-based ATs and FSPEC §11's 25-row table.

## 1. Conventions

### 1.1 Identifier scheme and row columns

`PROP-M-{NN}`, one domain (`M`) because one phase. Every property carries a **statement**, a
**domain** (what is quantified over and how it is generated), an **oracle** (what makes it fail), and
a **lands in** cell naming the PLAN §12 task and its test file. Each row is tagged:

| Tag | Meaning |
|---|---|
| **Category** | te-author taxonomy — Functional, Contract, Data Integrity, Error Handling, Idempotency, Integration, Observability, Security |
| **Kind** | **P** = pure-function property (in-process, no seam, cheap) · **I** = integration property (drives `phaseMerge`, `main()` or `runPicked` through doubles) |
| **Domain size** | `enum(n)` = exhaustive bounded enumeration of *n* cases · `rand(n)` = *n* seeded pseudo-random draws |

### 1.2 No property-testing dependency — bounded enumeration and a seeded RNG

`pdlc/workflows/package.json` has **exactly one devDependency (jest)**, and TSPEC §1 / the
`pdlc-workflow-distribution` precedent both refuse to widen it. **`fast-check` is not added.** Every
property below is expressed in plain jest as either:

- **exhaustive bounded enumeration** — the axis product is small (every axis here is 2–11 wide), so
  the domain is *enumerated*, not sampled. Sampling a domain you can enumerate is how a cell goes
  untested; every `enum(n)` row states its *n* and the suite asserts its own case count, so a dropped
  axis is a failure rather than an absence; or
- **a seeded loop** for the two string-shaped domains (path strings, queue markdown), using a
  `seeded(seed)` xorshift32 generator with `int/pick/shuffle/string` — the shape
  `driftGenerators.js` already ships in this repo.

**Where the generators live.** In **`__tests__/helpers/mergeDoubles.js`**, the file PLAN task **F1**
already creates and every consumer already depends on. This is a widening of F1's stated scope
(doubles + goldens → doubles + goldens + generators) and **no new file**; it is flagged here rather
than silently assumed, because PLAN §4's ownership manifest is the audit surface and F1 is a
single-writer batch-1 task, so the widening costs nothing structurally.

Four rules every property inherits:

1. **Seed is a literal constant, printed on failure, overridable.** `MERGE_PROP_SEED = 0x5ED`
   declared in each property file; `PDLC_PROP_SEED` (decimal integer) overrides it — the env name the
   existing suite already uses. Every failure message prints the seed **and the case value**, never
   only an index: reproduction is by replaying the value, so `shrink` operates on values.
2. **No clock, no filesystem, no network, no `gh`, no `git`.** `_sleep`/`_now`/`_ghRun`/`_git`/
   `_readFile`/`_writeFile`/`_recordQueueRow` are injected in every case (TSPEC §13). A property that
   needed a real clock would be a design defect, not a slow test.
3. **Frozen inputs stay frozen.** Every property that passes a module constant (`MERGE_DEFAULTS`,
   `MERGE_GUARD_DEFAULTS`, `MERGE_MODES`) asserts it is deep-equal to a captured snapshot afterwards.
   A shared mutable default is the failure mode that turns a per-case property into a per-suite one.
4. **Positive-presence conjuncts are mandatory.** No property asserts only an absence. Every
   "never merged", "never mutates", "no escalation" row carries the exact terminal value, the named
   reason/row id, and — where a file is involved — a positive assertion that the fixture *contained*
   the thing whose preservation is claimed.

### 1.3 The two shared vocabularies

`ROW_IDS` = FSPEC §11's 25 identifiers `1…23, "11a", "13a"`; `MERGE_STATUSES` =
`merged | deferred | refused | skipped`. Both are enumerable module values (TSPEC §2.2, DC-01) —
every property that quantifies over rows or statuses reads the exported catalogue rather than a local
literal, so a catalogue that gains a member reds the properties instead of silently escaping them.

## 2. Decision-core properties

## 3. Self-modification guard properties

## 4. Configuration and method-policy properties

## 5. Queue write-back properties

## 6. Phase-level integration properties

## 7. Coverage matrix

## 8. Gaps, residuals, and what this document does not prove

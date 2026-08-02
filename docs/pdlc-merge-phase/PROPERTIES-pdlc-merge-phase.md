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

All five drive **`decideMerge`** and the §5.2 step loop directly, with a scripted observation supplier
in place of `phaseMerge`'s IO. The axis product is the record shape of TSPEC §2.4:
`mergeMode ∈ 3` × `prUrl ∈ {present, null}` × `o1 ∈ 7` (`{ok:false}`, and `ok` × state ∈ 3 ×
`mergeable` ∈ 4 incl. the sentinel) × `ci ∈ 5` × `o3 ∈ 4` × `o4 ∈ 3` × `o5 ∈ 4` × `caps ∈ 8` ×
`attempt outcome ∈ 2`. Enumerated in full where a property needs it; the short-circuit means most
combinations are unreachable and the enumeration *proves* that rather than assuming it.

**PROP-M-01 — Totality and termination. Every observation record resolves to exactly one FSPEC §11
row, within the step bound, for every configuration.**
*(Contract · **P** · `enum(≈4 800)` reachable records · A4 — `mergeDecision.test.js`)*
- **Domain:** the full axis product above, driven through a faithful re-implementation of §5.2's loop
  whose observation supplier answers each demand from the case's axis value (so a demand for a slot
  the case did not fix is itself a failure).
- **Oracle:** for every case, the loop returns `kind: "resolved"` with `row ∈ ROW_IDS`,
  `mergeStatus ∈ MERGE_STATUSES`, and a **step count strictly below `MERGE_MAX_DECISION_STEPS`**;
  the `throw` at the loop's exit is never reached, and `row === "internal"` never occurs. Exactly-one
  is asserted positively: the resolving guard index is recorded per case and the case's expected
  `(row, mergeStatus)` pair is compared to §5.3's table, so two guards claiming one row reds.
- **Bound conjunct:** asserted as the **relation** `MERGE_MAX_DECISION_STEPS > 1 + MERGE_MAX_RETRIES
  + 4 + 3 + 1` recomputed from the constants, never against the literal `24` (TSPEC §5.2, TE N-04),
  and re-run with `mergeableRetries` at its cap of 10.

**PROP-M-02 — Purity. `decideMerge` is a deterministic, non-mutating function of `(record, config)`.**
*(Functional · **P** · `enum(≈4 800)` shared with PROP-M-01 · A4 — `mergeDecision.test.js`)*
- **Domain:** each PROP-M-01 case, evaluated twice, with a deep-frozen structural clone of both
  arguments captured before the first call.
- **Oracle:** the two results are deep-equal; `record` and `config` are deep-equal to their
  pre-call clones; `MERGE_DEFAULTS`, `MERGE_MODES` and `MERGE_GUARD_DEFAULTS` are unchanged. Positive
  conjunct: the clone is asserted **non-empty and equal to a fixture-known value** first, so a
  vacuous "undefined equals undefined" cannot pass.

**PROP-M-03 — Fail-closed monotonicity. Degrading any single precondition observation never moves the
outcome toward `merged`.**
*(Security · **P** · `enum(5 slots × ≈600 baselines)` · A4 — `mergeDecision.test.js`)*
- **Domain:** every PROP-M-01 case that resolves `merged` (row 18) or reaches a later guard, paired
  with each of the five degradations `o1 := {ok:false}`, `ci := "unknown"`, `o3 := {ok:false}`,
  `o5 := {ok:false}`, `o4 := {ok:false}`.
- **Oracle:** the degraded run's `mergeStatus` is `refused` (never `merged`, never `skipped`), and its
  `row` is the specific fail-closed row §5.3 assigns that slot (8 / 11 / 13a / 5 / 15) — a *named
  row*, not merely "not 18", so a degradation that lands on the wrong fail-closed row still reds.
- **The one declared exception, asserted as its own case, not excluded by a filter:** on the
  already-merged path (§11 row 3) `O4` is an *observation, not a precondition* (TSPEC §5.5), so
  `o4 := {ok:false}` there keeps `mergeStatus: merged` and adds row 22's escalation. This case
  asserts that positive pair explicitly; an implementation that made `O4` a precondition on row 5
  would red it, and one that made it a precondition everywhere would red the main arm.

**PROP-M-04 — No-bypass equivalence. `mergeMode: "gated"` and `mergeMode: "on"` are the same function.**
*(Functional · **P** · `enum(≈4 800)` · A4 — `mergeDecision.test.js`)*
- **Domain:** every PROP-M-01 record, with the config's `mergeMode` set to `"gated"` and to `"on"`.
- **Oracle:** the two resolutions are **deep-equal** — same row, status, reason, escalations, sha and
  method. Positive conjunct: at least one case in the enumeration resolves `merged` and at least one
  resolves `refused`, asserted by counting, so the equivalence is not proven over a domain where both
  arms are trivially `skipped`. Falsifies AC-1.5's "no mode bypasses the preconditions" directly: any
  branch on `"on"` anywhere in the core reds this.

**PROP-M-05 — Short-circuit minimality. An observation the resolution does not depend on is never
demanded.**
*(Performance · **P** · `enum(≈4 800)` · A4 — `mergeDecision.test.js`)*
- **Domain:** PROP-M-01's cases, with the observation supplier recording every demand in order.
- **Oracle:** for each case, the recorded demand sequence is a **prefix of §5.3's demand order**
  (`O1, O5, O2, O1*, O3, O4`) truncated at the resolving guard, and contains no slot below it.
  Concretely: a case resolving at row 8 demanded `O1` and nothing else; a case resolving at row 7
  never demanded `O2`, `O3` or `O4`. This is the property that makes NFR-2's "no state-mutating call
  before every precondition" cheap to hold — an unobserved surface is one nothing asked for.

## 3. Self-modification guard properties

**PROP-M-06 — Guard dominance. A changed-file list matching a guard path yields `refused` at row 4
regardless of every other input, configuration included.**
*(Security · **I** · `enum(2 × 3 × 5 × 4 × 3 = 360)` phase runs · A3 unit + A7 — `mergeGuard.test.js`, `mergePhase.test.js`)*
- **Domain:** `passingGh` with `O5` overridden to a list containing one guard-matching path, crossed
  with `mergeMode ∈ {gated, on}`, `mergeRequiresCi ∈ {true, false}` × `ci ∈ {passed, none, pending,
  failed, unknown}`, `o3 ∈ {0 unresolved, 3 unresolved, unretrievable}`, `caps ∈ {rebase-only,
  merge-only, none}`, and a `guardPaths` config value drawn from `{absent, [], ["!pdlc/workflows/"],
  ["extra/"], 42, "not-an-array"}`.
- **Oracle:** every case reports `mergeStatus: "refused"`, `row: 4`, **zero** commands matching
  `/^gh pr merge/` in `fakeGhRun`'s record, and exactly one notice equal to
  `MERGE ESCALATION: self-modification guard fired for {prUrl} — matched paths: {paths}` naming every
  matched path in observed order.
- **Scoping, stated so the property is true rather than nearly true:** dominance is over every guard
  *below* it. The four conditions that resolve above it — `PHASE_MERGE_ENABLED false` (row 1),
  `mergeMode: off` (row 2), no `prUrl` (row 6), unreadable `O1.state` (row 8) and `state: MERGED`
  (row 3) — are excluded from the domain **and asserted separately as a five-case control block**
  showing each one preempts the guard, so the exclusion is evidenced, not assumed.

**PROP-M-07 — Additivity and irremovability. No configuration value removes a shipped default.**
*(Security · **P** · `rand(500)` config values + `enum(12)` adversarial shapes · A3 — `mergeGuard.test.js`)*
- **Domain:** `effectiveGuardPaths(v)` for `v` drawn from a seeded generator over arrays of random
  strings (including `""`, whitespace, `"!"`-prefixed, duplicate-of-a-default, with and without
  trailing slash) plus the enumerated non-array shapes `undefined, null, 42, "str", {}, [], [null],
  [1,2], [{}], [" "], ["pdlc/workflows"], [".claude/workflows/"]`.
- **Oracle:** the result **contains all four members of `MERGE_GUARD_DEFAULTS`** (positive presence,
  by exact string), every member ends in `/`, no member is a duplicate, and `MERGE_GUARD_DEFAULTS`
  itself is deep-equal to its captured snapshot afterwards. A configuration is additive by
  construction: `result ⊇ defaults` for every input, with no filter, subtraction or reorder.

**PROP-M-08 — Prefix exactness. `guardVerdict` fires exactly when some changed path has a guard path
as a case-sensitive, position-0, `/`-terminated prefix — and never otherwise.**
*(Data Integrity · **P** · `rand(1 000)` paths + `enum(7)` FSPEC §4.2 rows · A3 — `mergeGuard.test.js`)*
- **Domain:** a seeded path generator that, for each guard path `g`, emits the six mutation classes
  FSPEC §4.2 names — `g + rand`, `g` with a segment suffix (`pdlc/workflows-notes/x`), `g` prefixed
  (`docs/` + g), `g` case-flipped, `g` with the trailing slash removed and a non-`/` char appended,
  and an unrelated path — plus the five near-miss literals of §4.2 enumerated exactly.
- **Oracle:** `verdict.fired` equals an **independently written reference predicate**
  (`files.some(p => guards.some(g => p.slice(0, g.length) === g))`) for every case, and `verdict.matched`
  equals the reference's filtered list in observed order. Writing the oracle twice, in two shapes, is
  what makes a `startsWith` → `includes` or case-folding mutant red rather than merely unasserted;
  the generator guarantees each mutation class has at least one *firing* and one *non-firing* case,
  asserted by count so no branch is covered only negatively.

## 4. Configuration and method-policy properties

## 5. Queue write-back properties

## 6. Phase-level integration properties

## 7. Coverage matrix

## 8. Gaps, residuals, and what this document does not prove

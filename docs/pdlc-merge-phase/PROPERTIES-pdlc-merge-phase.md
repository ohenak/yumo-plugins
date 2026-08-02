# PROPERTIES — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`, `CROSS-REVIEW-software-engineer-PROPERTIES-v1.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.1 | 2026-08-02 |

> **Scope in one line.** The invariants Phase MERGE must satisfy over *all* inputs — the quantified layer beneath TSPEC §13's example-based ATs
> and FSPEC §11's 25-row table.

## 1. Conventions

### 1.1 Identifiers, and where a property's metadata lives

`PROP-M-{NN}`; ids are stable across versions, so PROP-M-21 (new in v1.1) sits with its §2 peers rather than forcing a renumber. Each property
states its **domain** (what is quantified over, and how generated) and its **oracle** (what makes it fail); category, kind (**P** pure-function,
**I** integration through doubles), domain size (`enum(n)` exhaustive, `rand(n)` seeded draws), owning PLAN task, test file and traced ACs live
in **§7's matrix**, stated once rather than twice.

### 1.2 No property-testing dependency — bounded enumeration and a seeded RNG

`pdlc/workflows/package.json` has **exactly one devDependency (jest)** and TSPEC §1 refuses to widen it: **`fast-check` is not added.** Every
property is plain jest — either **exhaustive bounded enumeration** (each `enum(n)` row states its *n* and the suite asserts its own case count, so
a dropped axis reds) or a **seeded loop** for the two string-shaped domains (path strings, queue markdown). The PRNG and the seed override are
**imported, never re-declared** (SE F-07): `helpers/driftGenerators.js` exports `seeded(seed)` (xorshift32: `int`/`pick`/`shuffle`/`bytes`) and
`resolveSeed(literal)`, and its header forbids re-declaring either. Merge-specific generators live in **`__tests__/helpers/mergeDoubles.js`**,
their self-test at **`__tests__/mergeDoubles.test.js`** — not beside them, because jest's `testPathIgnorePatterns` skips `/__tests__/helpers/`.
PLAN v1.2 records both (§4 batch 1, §12 F1); nothing here needs a new file or batch.

Four rules every property inherits:

1. **Seed is a literal constant, printed on failure, overridable** — `MERGE_PROP_SEED = 0x5ED` per file, overridden by `PDLC_PROP_SEED`; failure
   messages print the seed **and the case value**, never only an index, so reproduction replays a value.
2. **No clock, filesystem, network, `gh` or `git`** — `_sleep`/`_now`/`_ghRun`/`_git`/`_readFile`/`_writeFile`/`_recordQueueRow` are injected
   (TSPEC §13).
3. **Frozen inputs stay frozen** — any property passing `MERGE_DEFAULTS`, `MERGE_GUARD_DEFAULTS` or `MERGE_MODES` asserts it deep-equals a
   captured snapshot afterwards.
4. **Positive-presence conjuncts are mandatory** — no property asserts only an absence; every "never merged" / "never mutates" / "no escalation"
   row pins the exact terminal value and the named row id, and every preservation claim asserts the fixture *contained* the content.

**The two vocabularies, sourced differently on purpose (SE F-03).** `MERGE_STATUSES` is a real frozen export (TSPEC §2.2), read from the module.
`ROW_IDS` is **not** an export and must not become one here: TSPEC §2.4 declares the 25 ids as prose (`1…23`, `"11a"`, `"13a"`), and a membership
oracle read from the implementation's own catalogue passes vacuously under exactly the row-id mutation (§8.5 target 2) it exists to catch. It is
a **test-local frozen transcription of FSPEC §11's table**, self-checked by `ROW_IDS.length === 25` and by comparison against the row ids each
property's expected-value table already names. A future `MERGE_ROW_IDS` export would not replace it (SE Q-02).

## 2. Decision-core properties

All six drive **`decideMerge`** with a scripted observation supplier in place of `phaseMerge`'s IO. **The step loop is harness code** (SE F-06):
§5.2's `for (let step …)` lives inside `phaseMerge`, not in an export, so every `P`-kind conjunct below (step count, "the exit `throw` is never
reached") describes the harness's re-drive of the exported pure function; the **production** throw and its `row: "internal"` mapping are
PROP-M-20's and TSPEC §12 E21's.

**`D_core` is a reachability-pruned enumeration, not a cross product (SE F-01, Q-01).** v1.0 wrote the raw product (161 280 cases) beside a size
of ≈4 800; both are withdrawn. The generator walks TSPEC §5.3's guard sequence, branching at each guard over **only the values that guard can
distinguish** and fixing every axis that cannot yet affect the resolution — unreachability proved by construction, every case a distinct decision
path. The arithmetic, asserted as one number (`|D_core| === 419`), each `+` reading "leaves resolving here":

| Level | Leaves | Sum |
|---|---|---|
| `mergeMode: "off"` → row 2 | 1 | **1** |
| `mergeMode ∈ {gated, on}` × the 209-case subtree | | **418** |
| — subtree: no `prUrl` (6) 1 + `o1` not-ok (8) 1 + `MERGED` × `o4 ∈ {ok, not-ok}` (3) 2 + `o5` not-ok/matched (5, 4) 2 + `CLOSED` (7) 1 + CI-refusing `(ci, mergeRequiresCi)` combos 7 + **3 CI-passing combos × 65** | | **209** |
| — 7c onward: sentinel field (11a) 1 + `mergeableRetries ∈ 0…10` × terminal re-read {UNKNOWN → 13, not-ok → 11a} 22 + CONFLICTING/DIRTY/BLOCKED (12) 3 + 39 | | **65** |
| — 7d onward: `o3` not-ok (13a) 1 + unresolved > 0 (14) 1 + 37 · 7e onward: `o4` not-ok (15) 1 + 36 | | **39 / 37** |
| — candidates: `caps ∈ 8` × `allowSquashMerge ∈ 2`; chain length `L` ⇒ `L+1` outcome patterns (`L = 0` → row 16; else `L` first-success → row 18, plus all-fail → row 17) = 16 squash-off + 20 squash-on | | **36** |

`mergeRequiresCi` enters at the CI level (PM F-01, SE F-02) and `mergeableRetries` sweeps `0…10` at the retry level (PM F-07) — both crossed only
where they can change an outcome, which is what keeps 419 small. **Cost budget:** **≤ 5 000 loop runs / ≤ 50 000 `decideMerge` calls**; actual
**≈ 2 300 runs** (M-01 419, M-02 838, M-03 602, M-04 418, M-21 20; M-05 rides M-01's pass) and ≈ 20 000 calls, since no run reaches the step cap.
**Full `D_core`:** M-01, M-02, M-05. **Reduced:** M-03 (120 row-18 cases × 5 degradations + 2 exceptions), M-04 (the 209-case subtree, decided
twice), M-21 (10 CI cases). Integration properties are budgeted at **≤ 2 000 phase runs**; §7 sums to ≈ 1 550.

**PROP-M-01 — Totality and termination. Every observation record resolves to exactly one FSPEC §11 row, within the step bound, for every
configuration.**
- **Domain / oracle:** all **419** `D_core` cases (the count itself asserted) driven through the harness loop — a demand for a slot the case did
  not fix is itself a failure. Every case returns `kind: "resolved"` with `row ∈ ROW_IDS`, `mergeStatus ∈ MERGE_STATUSES`, and a step count
  **strictly below `MERGE_MAX_DECISION_STEPS`**. *Exactly one* is positive, not disjointness-by-absence: the resolving guard index is recorded
  and the `(row, mergeStatus)` pair compared to §5.3's table, so two guards claiming one row reds. The bound is asserted as the **relation**
  `MERGE_MAX_DECISION_STEPS > 1 + MERGE_MAX_RETRIES + 4 + 3 + 1` recomputed from the constants, never the literal `24` (TE N-04).
- **AC-1.2a conjunct (PM F-07), free on the retry sub-path:** for every `mergeableRetries = R ∈ 0…10` an exhausting run demands `O1` exactly
  `1 + R` times and its reason line interpolates that same count (`after 1 observations` at `R = 0` included) — eleven enumerated values where
  TSPEC §13.2 samples `{0, 1, 3}`, with counter and sentence read by one oracle so they cannot drift.

**PROP-M-02 — Purity. `decideMerge` is a deterministic, non-mutating function of `(record, config)`.**
- **Domain / oracle:** each case evaluated twice against a structural clone captured first: the two results deep-equal, `record`/`config`
  deep-equal their clones, and `MERGE_DEFAULTS` / `MERGE_MODES` / `MERGE_GUARD_DEFAULTS` unchanged. Positive conjunct: the clone is first
  asserted non-empty and equal to a fixture-known value, so no `undefined == undefined` passes vacuously.

**PROP-M-03 — Fail-closed monotonicity. Degrading any single precondition observation never moves the outcome toward `merged`.**
- **Domain / oracle:** the **120** `D_core` cases resolving at row 18 (20 candidate-block leaves × 3 CI-passing combos × 2 modes), each paired
  with the five degradations `o1 | ci | o3 | o5 | o4 := unknown` — **600 cases**, plus the two exception cases below, asserted as **602**. The
  degraded run reports `refused` **at the specific fail-closed row §5.3 assigns that slot** — 8 / 11 / 13a / 5 / 15 — a named row rather than
  "not 18", so landing on the wrong fail-closed row still reds.
- **The one declared exception, asserted as a case rather than filtered out:** on the already-merged path (row 3) `O4` is an *observation, not a
  precondition* (TSPEC §5.5), so degrading it keeps `merged` and adds row 22's escalation — asserted as that positive pair. Making `O4` a
  precondition on row 5 reds this case; making it one everywhere reds the main arm.

**PROP-M-04 — No-bypass equivalence. `mergeMode: "gated"` and `"on"` are the same function.**
- **Domain / oracle:** each of the **209** subtree records decided under both modes; the two resolutions are **deep-equal** — row, status,
  reason, escalations, sha, method. Positive conjunct: the domain is asserted by count to contain at least one `merged` and one `refused`
  outcome, so the equivalence is not proven where both arms are trivially `skipped`. Any branch on `"on"` anywhere in the core reds this —
  AC-1.5's "no mode bypasses the preconditions", made falsifiable.

**PROP-M-05 — Short-circuit minimality. An observation the resolution does not depend on is never demanded.**
- **Domain / oracle:** PROP-M-01's 419 runs with the supplier recording demands in order (no extra evaluations). Each demand sequence is a
  **prefix of §5.3's demand order** (`O1, O5, O2, O1*, O3, O4`) truncated at the resolving guard, no later slot present: a row-8 case demanded
  `O1` and nothing else; a row-7 case never demanded `O2`, `O3` or `O4`. NFR-2 held cheaply — an unobserved surface is one nothing asked for.

**PROP-M-21 — CI-rule relaxation is exactly one cell. `mergeRequiresCi: false` relaxes `no-checks` and nothing else.**
- **Domain:** the rule's own exhaustive sub-domain, `ci ∈ {passed, none, pending, failed, unknown}` × `mergeRequiresCi ∈ {true, false}` = **10**
  cases, each on a fixture that reaches guard 11 — `O5` clear (so guard 7 cannot preempt it, SE F-02) and `state: OPEN`.
- **Oracle:** each case's `(mergeStatus, row, escalation?)` equals a column **transcribed from FSPEC §5's table** — `passed` ⇒ satisfied under
  both settings; `(none, true)` ⇒ `refused` row 9 **with** the CI escalation; `(none, false)` ⇒ satisfied, no escalation; `pending`/`failed` ⇒
  `refused` row 10 and `unknown` ⇒ row 11, **identically under both settings**. The mutant-killer is the differential: for every `ci ≠ "none"` the
  two settings are **deep-equal**, so a rule widened to `ci === "none" || ci === "pending"` reds at `(pending, false)` (PM F-01).

## 3. Self-modification guard properties

**PROP-M-06 — Guard dominance. A changed-file list matching a guard path yields `refused` at row 4 regardless of every other input, configuration
included.**
- **Domain:** `passingGh` with `O5` overridden to a list containing one guard-matching path, **crossed** (every axis, not one-at-a-time) over
  `mergeMode ∈ {gated, on}` × `mergeRequiresCi ∈ {T, F}` × `ci ∈ 5` × `o3 ∈ {0, 3 unresolved, unretrievable}` × `caps ∈ {rebase-only, merge-only,
  none}` × `guardPaths ∈ {absent, [], ["!pdlc/workflows/"], ["extra/"], 42, "not-an-array"}` = **1 080** phase runs, which is the number the
  suite asserts (SE F-05; v1.0 said 360 and was simply wrong).
- **Oracle:** every case reports `mergeStatus: "refused"`, `row: 4`, **zero** `/^gh pr merge/` commands, and **exactly one line beginning `MERGE
  ESCALATION: `** — `MERGE ESCALATION: self-modification guard fired for {prUrl} — matched paths: {paths}`, every matched path in observed order —
  **plus** FSPEC §9.4's merge-deferred note, which every `refused` run emits, and nothing else (counting escalations rather than notices is PM
  F-04's fix; asserting the §9.4 note makes its presence here a fact rather than an accident).
- **Scoped so the property is true rather than nearly true:** dominance is over every guard *below* it; the five conditions resolving above —
  rows 1, 2, 6, 8, 3 — are excluded **and asserted as a five-case control block** showing each preempts the guard.

**PROP-M-07 — Additivity and irremovability. No configuration value removes a shipped default.**
- **Domain / oracle:** `effectiveGuardPaths(v)` over seeded string arrays (`""`, whitespace, `"!"`-prefixed, duplicate-of-a-default, with and
  without trailing slash) plus the enumerated non-array shapes `undefined, null, 42, "str", {}, [], [null], [1,2], [{}], [" "],
  ["pdlc/workflows"], [".claude/workflows/"]`. The result **contains all four `MERGE_GUARD_DEFAULTS` members by exact string**, every member ends
  in `/`, none is duplicated, and the frozen source deep-equals its snapshot afterwards — `result ⊇ defaults` for every input.

**PROP-M-08 — Prefix exactness. `guardVerdict` fires exactly when some changed path has a guard path as a case-sensitive, position-0,
`/`-terminated prefix — and never otherwise.**
- **Domain:** per guard path `g`, the six mutation classes §4.2 names — `g + rand`, segment-suffixed (`pdlc/workflows-notes/x`), prefixed
  (`docs/` + g), case-flipped, slash-stripped, unrelated — plus §4.2's five near-miss literals enumerated exactly.
- **Oracle:** `verdict.fired` equals an **independently written reference predicate** (`files.some(p => guards.some(g => p.slice(0, g.length) ===
  g))`) and `verdict.matched` its filtered list, in order — two shapes of the same rule, which is what reds a `startsWith` → `includes` or
  case-folding mutant. Each mutation class is asserted by count to have ≥ 1 firing **and** ≥ 1 non-firing case.

## 4. Configuration and method-policy properties

**PROP-M-09 — Config totality. For any input text, `parseMergeConfig` returns a complete config whose every key is inside its accepted domain,
and never throws.**
- **Domain / oracle:** `null`, `""`, non-JSON bytes, JSON scalars, arrays, `{}`, `{merge: <non-object>}`, and seeded `{merge:{…}}` objects where
  each of the seven keys independently takes `{valid, wrong type, out of domain, null, missing}` — plus `mergeableRetries` at `10` (accepted),
  `11` (defaulted), `0` (honoured) and `mergeableRetryDelay: 0`. The result has **exactly** the seven `MERGE_DEFAULTS` keys; `mergeMode ∈
  MERGE_MODES`; three `typeof "boolean"`; both integers `Number.isInteger` within `0…MERGE_MAX_RETRIES` / `≥ 0`; `guardPaths` an array of
  non-empty strings; nothing throws; and `MERGE_DEFAULTS` deep-equals its snapshot — the mutation this property exists to catch.

**PROP-M-10 — Independent fallback. One bad key never defaults another.**
- **Domain / oracle:** a fully valid **non-default** section with exactly one key corrupted: the corrupted key equals its default **and all six
  others equal the non-default values supplied** — the positive half, without which "everything defaulted" would pass. `sectionMalformed` is
  `true` only for the `merge`-is-not-an-object shape and `false` for all 28, keeping E3's note off 27 paths.

**PROP-M-11 — Squash unreachability. Under the shipped configuration, no code path can issue a squash merge.**
- **Domain:** `mergeCandidates(caps, config)` over all 8 capability triples × `allowSquashMerge ∈ {absent, false, null, "true", 1}` (every
  non-`true` shape the reader can emit); and every §11 row driven at phase level with the shipped defaults.
- **Oracle:** `"squash"` is **absent from the returned array**, not merely skipped at attempt time; the array is `["rebase","merge"]` filtered by
  capability **in that order** (AC-2.1/AC-2.2); `fakeGhRun` records **zero** `--squash` occurrences. Positive control: the one
  `allowSquashMerge: true` × squash-allowed case yields `"squash"` last and reports `mergeMethod: "squash"`, so dropping squash entirely reds too.

## 5. Queue write-back properties

**PROP-M-12 — Evidence-null identity. `updateQueueStatus(md, f, s, null)` is byte-identical to the 3-parameter call, for every input.**
- **Domain:** the six queue shapes F1 captures (5-column canonical, already-migrated, padded cells, one data row, feature absent, no table at
  all) × every `QUEUE_STATUSES` member.
- **Oracle:** a **three-way** equality — the 4-parameter `null` call, the 3-parameter call, and the **committed golden captured from
  `updateQueueStatus` at HEAD before the change** (PLAN F1) — byte-identical including `matched` and `written`. Per TE F-11 the golden is the only
  non-circular arm, and the one that must be able to fail; each is asserted to *contain* the target row and to *differ* from the other statuses'
  goldens, so goldens captured empty cannot pass.

**PROP-M-13 — Write-back idempotence. Applying the `done` write twice equals applying it once, byte for byte, and never downgrades evidence.**
- **Domain:** each canonical queue × evidence ∈ `{"abc1234 #42", "merged #42", "abc1234 #7"}`, applied twice; plus `mergeEvidenceCell(prev,
  next)` over 200 seeded pairs from `{"", sha-form, merged-form, arbitrary string}`.
- **Oracle:** `md2 === md1` exactly (a fixed point); `ensureEvidenceColumn` reports `migrated: false` on the second pass; the Status cell holds
  the single token `done`, undecorated, on both passes. Cell helper: when `prev` is a non-empty string and `next` matches `/^merged #/` the
  result **is `prev`**, else **is `next`** — an equality against an independent reference, so no-downgrade cannot become never-update.

**PROP-M-14 — Structural containment. Only the target row's Status and Evidence cells ever change value; every other cell is preserved.**
- **Domain:** seeded queues of 1–8 data rows (generated feature names, statuses from `QUEUE_STATUSES`, mixed `Depends-On` cells, interleaved
  prose and a trailing history table), each row in turn the write target.
- **Oracle:** every **non-target** data row's first five cells are string-equal to their pre-write values and its sixth is `""`; the header gains
  exactly the cell `Evidence`; the separator gains one dash cell; **every row has the same cell count**; every non-table line is byte-identical.
  Positive conjunct: the target Status changed *from* its known prior value *to* `done` and its Evidence cell holds the expected string, so
  "changed nothing at all" fails.

**PROP-M-15 — Round-trip. A written `done` row re-parses as `done`, and its dependents unblock.**
- **Domain:** each written queue from PROP-M-14 fed back through the *shipped, unmodified* `parseQueue` / `selectNextPending` /
  `precheckDependencies`, over three graphs: sole-dependency dependent; two-dependency dependent with the other still `pending`; no dependent.
- **Oracle:** `parseQueue` resolves the same five columns as before migration (the sixth ignored by `colIndex`, asserted by comparing parsed row
  objects field by field); the target row's `status` is **exactly** `done`; graph 1's dependent is **selected**, graph 2's is **not** (the reason
  naming the pending dependency), graph 3 selects nothing — both halves of AC-6.3, so the gate is proven to be what held the dependent shut.

## 6. Phase-level integration properties

**PROP-M-16 — `merged` is never downgraded. No post-merge failure, in any combination, changes `mergeStatus`.**
- **Domain / oracle:** the power set of §11's four composable annotations (M2 deletion failure, M3 tree failure, M4 `error`, M4 `recorded
  (uncommitted)`) over rows 18 and 3 — 32 runs — **plus two §2.5 non-overwrite overlays** (each row against a queue row reading `blocked`), which
  are row 18's stated exception and the only runs producing the non-overwrite note (SE F-04): **34**. All 34 report `mergeStatus: "merged"` with
  the SHA present, `outcome: "success"`, and exactly the lines the applied subset predicts in §9.3's order; the overlays additionally assert the
  queue file byte-unchanged with a note naming the status found. Empty subset ⇒ **no** `MERGE ESCALATION: ` line; all four ⇒ AT-M6, in order.

**PROP-M-17 — Report totality. Every pipeline path reports a `mergeStatus` from the closed set, and every non-`merged` value carries a one-line
reason.**
- **Domain:** all 25 §11 rows driven through `phaseMerge` into `buildFinalReport`, plus three runs halted before Phase MERGE (at R, I, DOD) and
  one with `PHASE_MERGE_ENABLED: false`.
- **Oracle:** every report — success *and* halt path — carries `mergeStatus`, `mergeSha`, `mergeMethod` by `Object.hasOwn` (so `null` counts as
  present); `mergeStatus ∈ MERGE_STATUSES`; `deferred`/`refused` carry a non-empty one-line `reason` naming AC-6.1a's condition **and** the §9.4
  note, `skipped`/`merged` carry no such note; `mergeSha` is non-empty **iff** `merged` with an observed oid; `mergeMethod ∈ {rebase, merge,
  squash, unknown, null}`, `"unknown"` exactly on row 3; halt paths report `skipped` (row 23).

**PROP-M-18 — No mutation before resolution (NFR-2). A run that does not report `merged` issues no state-changing command.**
- **Domain:** every §11 row, plus 200 seeded `passingGh` perturbations each overriding one surface with a drawn recognised-or-degraded value —
  the domain where a mis-ordered guard shows up as an unexpected merge.
- **Oracle, split by resolving row (PM F-02 — v1.0's single ≥ 1 conjunct contradicted FSPEC §2.5 on row 3):** **row 18** recorded **≥ 1 and ≤ 3**
  `/^gh pr merge/` commands; **row 3 exactly zero** — the already-merged path attempts no merge and evaluates no guard, and asserting that
  positively is what pins NFR-5; **every non-`merged` row** zero merge commands, zero `push`/`checkout`/`rebase`/`merge` git verbs and **no**
  `_recordQueueRow` call. Both merged rows recorded **exactly one** `_recordQueueRow` call — AC-5.2's recovery conjunct, and a call-count oracle
  because one merge and two produce one envelope.

**PROP-M-19 — Notice-catalogue closure. Every operator-visible line the phase emits is a member of a frozen catalogue, and every escalation
carries the exact prefix.**
- **Domain (SE F-04, PM F-05 — v1.0's domain could not produce three of the seven notes):** PROP-M-16's **34** + PROP-M-17's **29** + **two named
  fixtures** — a `merge` section present but not an object (§10.3's malformed-section note) and a merged run whose `prUrl` neither `parsePrRef`
  nor `O1.number` resolves (§7.5's missing-`prNumber` note) — = **65**; the third missing member, the §2.5 non-overwrite note, arrives with
  PROP-M-16's overlays.
- **Oracle:** every line pushed onto `notices` either starts with `MERGE ESCALATION: ` and equals a `MERGE_ESCALATIONS` template rendered with
  the run's own parameters, or equals a `MERGE_NOTES` template — exact strings, never substring sniffing. Cardinality positive: **4** escalations
  and **7** notes (TSPEC §10.2), both `Object.isFrozen`, and the observed union covers **every** member at least once.
- **Catalogue naming, reconciled (SE F-04):** TSPEC §10.2 names both frozen objects while §7.1's snippet writes the ahead-of-remote note as a
  standalone `AHEAD_OF_REMOTE_NOTE(…)`. This property reads §10.2's catalogues and treats that note as a `MERGE_NOTES` member; **A7 owns making
  the two sites one symbol**. §4.1's `reason` catalogue is a different, non-operator-facing set, outside this closure.

**PROP-M-20 — Phase MERGE never throws. For any fault at any single injected call site, the phase returns a well-formed `MergeOutcome` and the
pipeline does not halt.**
- **Domain:** for each of `_ghRun`, `_git`, `_readFile`, `_recordQueueRow`, a double that behaves normally for *k* calls then throws, for every
  reachable *k* on a merging fixture — the index range derived from TSPEC §11.1's enumeration of await sites, not guessed.
- **Oracle:** `phaseMerge` **resolves** (never rejects); `mergeStatus ∈ MERGE_STATUSES`, `row ∈ ROW_IDS ∪ {"internal"}`, and `"internal"` implies
  `refused` with a reason; through `main()` the pipeline `outcome` is `success` and the phase glyph is never `❌` (which would make a non-merge
  look like the halting phase, TSPEC §10.3). Positive control: the same fixture with no fault reports `merged`.

## 7. Coverage matrix

Classification, placement and traceability, stated once. **Kind**: `P` pure, `I` integration. Every file is in PLAN §4's ownership manifest.

| Property | Category | Kind | Domain | Task → file | Traces to |
|---|---|---|---|---|---|
| PROP-M-01 | Contract | P | `enum(419)` | A4 → `mergeDecision.test.js` | AC-1.2a, AC-1.6, AC-6.1a; TSPEC §5.2, §5.3 |
| PROP-M-02 | Functional | P | `enum(419)` ×2 | A4 → `mergeDecision.test.js` | NFR-1, NFR-4; TSPEC §5.1 |
| PROP-M-03 | Security | P | `enum(602)` | A4 → `mergeDecision.test.js` | AC-1.2b, AC-3.4, AC-4.4, AC-2.5a; TSPEC §5.3, §5.5 |
| PROP-M-04 | Functional | P | `enum(209)` ×2 | A4 → `mergeDecision.test.js` | AC-1.5 |
| PROP-M-05 | Performance | P | shares M-01's 419 | A4 → `mergeDecision.test.js` | AC-1.6, NFR-2; TSPEC §5.1 |
| PROP-M-21 | Security | P | `enum(10)` | A4 → `mergeDecision.test.js` | AC-4.1, AC-4.2, AC-4.3, AC-4.4; FSPEC §5; TSPEC §5.4 |
| PROP-M-06 | Security | I | `enum(1 080)` | A3/A7 → `mergeGuard`, `mergePhase` | AC-3.1, AC-3.2, AC-3.5; FSPEC §11 row 4 |
| PROP-M-07 | Security | P | `rand(500)` + `enum(12)` | A3 → `mergeGuard.test.js` | AC-3.3, AC-3.7, NFR-3; TSPEC §6.1 |
| PROP-M-08 | Data Integrity | P | `rand(1 000)` + `enum(7)` | A3 → `mergeGuard.test.js` | AC-3.6; FSPEC §4.2 |
| PROP-M-09 | Contract | P | `enum(40)` + `rand(500)` | A1 → `mergeConfig.test.js` | AC-7.1, AC-7.2, AC-7.3; TSPEC §3.1, E1–E5 |
| PROP-M-10 | Error Handling | P | `enum(28)` | A1 → `mergeConfig.test.js` | AC-7.3; FSPEC §10.3 |
| PROP-M-11 | Security | P + I | `enum(40)` + `enum(25)` | A4/A7 → `mergeDecision`, `mergePhase` | AC-2.1, AC-2.2, AC-2.4; TSPEC §5.6 |
| PROP-M-12 | Data Integrity | P | `enum(24)` vs goldens | B2 → `mergeQueueWriteback.test.js` | AC-5.3; FSPEC §7.4; TSPEC §8.4, §13.5 |
| PROP-M-13 | Idempotency | P | `enum(18)` + `rand(200)` | B1/B2 → `mergeQueueWriteback.test.js` | AC-5.8, NFR-5; AT-M2; FSPEC §7.2 |
| PROP-M-14 | Data Integrity | P | `enum(48)` | B1/B2 → `mergeQueueWriteback.test.js` | AC-5.1, AC-5.3, AC-5.5; AT-M1; TSPEC §8.5 |
| PROP-M-15 | Integration | I | `enum(18)` | B2/B3 → `mergeQueueWriteback`, `mergeQueueDriver` | AC-5.1, AC-5.5, AC-6.3; AT-M5; TSPEC §9.4 |
| PROP-M-16 | Error Handling | I | `enum(34)` | A7 → `mergePhase.test.js` | AC-2.6a, AC-5.2, AC-5.7; AT-M6; FSPEC §11 rows 18–22 |
| PROP-M-17 | Contract | I | `enum(29)` | A8 → `mergePhase`, `pipelineWiring`, `reportTemplates` | AC-1.3, AC-1.4, AC-6.1, AC-6.2; TSPEC §10.1 |
| PROP-M-18 | Security | I | `enum(25)` + `rand(200)` | A7 → `mergePhase.test.js` | NFR-2; TSPEC §4.7, §5.2 |
| PROP-M-19 | Observability | I | `enum(65)` | A7 → `mergePhase.test.js` | AC-6.2a; TSPEC §10.2 |
| PROP-M-20 | Error Handling | I | `enum(≈56)` | A7 → `mergePhase.test.js` | AC-1.3, NFR-2; TSPEC §5.2, §12 E21 |

**Requirements without a property, and why (PM F-03, PM F-06).** AC-2.3/AC-2.5b are *counting* behaviours whose whole content is an exact number
and an exact reason string, which TSPEC §13.2's cases pin better than a quantifier would (AC-1.2a is no longer here — PROP-M-01 now sweeps
`0…10`). AC-5.4/AC-5.6 are single-branch, covered by AT-M4 and E17. **AC-4.0** — CI read at merge time, never inherited from Phase PUB — is
carried *structurally* by **PROP-M-02**: `decideMerge` is a function of `(record, config)` alone and `record.ci` can only come from `O2`, so no
report field can reach the decision. **AC-1.1** (placement after Phase PUB) is TSPEC §10.4's call site, asserted by `pipelineWiring`; **AC-1.2**
is the *union* of guards PROP-M-01/-03/-21 already quantify, with no separate content; **AC-2.5** (a forbidden method is skipped, not attempted)
is inside PROP-M-11's candidate-chain oracle, since the chain is built from `caps` before any attempt.

## 8. Gaps, residuals, and what this document does not prove

1. **The `merged` path is never observed live in this repo** (BL-04, PLAN K-5): every PR this queue raises touches a guard path, so PROP-M-06 is
   the *shipped* behaviour here and the merged arms of PROP-M-11/-16/-18 are evidenced through doubles — "never merged in `yumo-plugins`" is not
   "never worked".
2. **Transport fidelity is out of reach.** Observations arrive through an agent-mediated `_ghRun`; a transport that mangles a *value* inside its
   recognised set is undetectable here (TSPEC §15.3). These properties quantify over what the classifier receives, not over what `gh` sent.
3. **`git rebase --empty=drop` (git ≥ 2.26) is a measured platform fact, not a property** — DC-02 routes it to PLAN K-1.
4. **Negative properties, named as a set:** PROP-M-03, PROP-M-08's non-firing arms, PROP-M-11, PROP-M-18, PROP-M-21's equal-under-both-settings
   arm and PROP-M-19's closure. Each carries a positive control in the same suite.
5. **Mutation targets these properties must kill** (TSPEC §13.5): the guard's `startsWith` (M-08), §5.3's row order and ids (M-01/-03), **the CI
   rule's single relaxed cell (M-21, *not* M-03 — v1.0 named a property that could not kill it)**, `evidenceCellFor`'s truncation (M-13/-14), the
   `recorded`-only gate on the §8.2 notice (M-16). A survivor is a defect in the property.
6. **Routed downstream:** task **A7** reconciles TSPEC §7.1's `AHEAD_OF_REMOTE_NOTE` with §10.2's `MERGE_NOTES` — one symbol, which PROP-M-19's
   closure needs. F1's generators and the `__tests__/mergeDoubles.test.js` self-test path are already in PLAN v1.2, so nothing is open there.

## 9. Round-1 cross-review dispositions

PM `REVISE` (2 high, 6 low), SE `REVISE` (1 high, 3 medium, 3 low). Every blocking, medium and advisory finding is closed.

| ID | Sev | Disposition |
|---|---|---|
| SE F-01 / Q-01 | High | **Fixed.** §2's `D_core` is a reachability-pruned enumeration with a derivation table summing to **419**; the 161 280-case product and the ≈4 800 figure are both withdrawn. Per-property counts and a stated budget (≤ 5 000 loop runs / ≤ 50 000 `decideMerge` calls; actual ≈ 2 300 / ≈ 20 000) name which properties use the full set and which a reduced one |
| PM F-01 / SE F-02 | High/Med | **Fixed twice over.** `mergeRequiresCi` is now an axis of `D_core` at the CI level, and **PROP-M-21** gives the rule its own exhaustive 5 × 2 sub-domain on a fixture that reaches guard 11 (guard 7 cannot preempt it), with FSPEC §5's table transcribed as the expected column and a deep-equal differential for every `ci ≠ "none"`. The `pending`-widening mutant dies at `(pending, false)` |
| PM F-02 | High | **Fixed.** PROP-M-18's merge-command conjunct is split by resolving row: row 18 ⇒ 1…3, **row 3 ⇒ exactly 0**, non-`merged` ⇒ 0; "exactly one `_recordQueueRow`" is kept across both merged rows |
| SE F-03 / Q-02 | Med | **Fixed as the review prescribes.** `ROW_IDS` is a test-local frozen transcription of FSPEC §11 with a 25-count and per-id cross-check, explicitly *not* a production export; a future `MERGE_ROW_IDS` export would not become the oracle |
| SE F-04 / PM F-05 | Med | **Fixed.** PROP-M-19's domain names the two extra fixtures (malformed `merge` section; unresolvable `prNumber`) and PROP-M-16 gains the two §2.5 non-overwrite overlays that produce the third missing note — 34 + 29 + 2 = **65**. The `AHEAD_OF_REMOTE_NOTE` / `MERGE_NOTES` naming drift is reconciled and routed to A7 (§8.6) |
| SE F-05 | Low | **Fixed.** PROP-M-06 is **1 080** (axes crossed, stated as crossed); PROP-M-19 is **65** |
| SE F-06 | Low | **Fixed.** §2's preamble states that the step loop is harness code re-driving the exported `decideMerge`, and leaves the production throw to PROP-M-20 / §12 E21 |
| SE F-07 | Low | **Fixed.** `seeded` / `resolveSeed` are **imported** from `helpers/driftGenerators.js`, never re-declared; the F1 self-test path `__tests__/mergeDoubles.test.js` is cited from PLAN v1.2 (jest ignores `/__tests__/helpers/`) |
| PM F-03 | Adv | **Fixed.** AC-4.0's structural carrier (PROP-M-02's purity) is stated in §7's exclusion list rather than left to the reader |
| PM F-04 | Adv | **Fixed.** PROP-M-06 counts *escalations*, not notices, and now asserts FSPEC §9.4's note as a positive fact |
| PM F-06 | Adv | **Fixed.** AC-2.1/AC-2.2 → PROP-M-11, AC-5.1 → PROP-M-14/-15, AC-7.2 → PROP-M-09; AC-1.1, AC-1.2 and AC-2.5 added to §7's exclusion list with their carriers |
| PM F-07 | Adv | **Fixed by quantifying, not by arguing.** PROP-M-01 sweeps `mergeableRetries ∈ 0…10` and asserts `1 + R` observations with the count interpolated into the reason line; AC-1.2a leaves the exclusion list |
| PM F-08 | — | No action — positive observations, recorded for harvest |

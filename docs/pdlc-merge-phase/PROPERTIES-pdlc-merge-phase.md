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

### 1.1 Identifier scheme

`PROP-M-{NN}`. Each property below states its **domain** (what is quantified over, and how it is
generated) and its **oracle** (what makes it fail). Its category, kind — **P** pure-function
(in-process, no seam) or **I** integration (drives `phaseMerge` / `main()` / `runPicked` through
doubles) — domain size (`enum(n)` exhaustive, `rand(n)` seeded draws), owning PLAN task, test file
and traced ACs all live in **§7's matrix**, stated once rather than twice.

### 1.2 No property-testing dependency — bounded enumeration and a seeded RNG

`pdlc/workflows/package.json` has **exactly one devDependency (jest)** and TSPEC §1 refuses to widen
it: **`fast-check` is not added.** Every property is plain jest — either **exhaustive bounded
enumeration** (every axis here is 2–11 wide, so the domain is enumerated, not sampled; each `enum(n)`
row states its *n* and the suite asserts its own case count, so a dropped axis reds) or a **seeded
loop** for the two string-shaped domains (path strings, queue markdown) over a `seeded(seed)`
xorshift32 generator, the shape `driftGenerators.js` already ships here. **The generators live in
`__tests__/helpers/mergeDoubles.js`** — the file PLAN task **F1** already creates and every consumer
depends on; a widening of F1's scope and **no new file**, flagged rather than assumed because PLAN
§4's ownership manifest is the audit surface.

Four rules every property inherits:

1. **Seed is a literal constant, printed on failure, overridable** — `MERGE_PROP_SEED = 0x5ED` per
   file, overridden by `PDLC_PROP_SEED` (the env name the existing suite uses); failure messages
   print the seed **and the case value**, never only an index, so reproduction replays a value.
2. **No clock, filesystem, network, `gh` or `git`** — `_sleep`/`_now`/`_ghRun`/`_git`/`_readFile`/
   `_writeFile`/`_recordQueueRow` are injected in every case (TSPEC §13).
3. **Frozen inputs stay frozen** — any property passing `MERGE_DEFAULTS`, `MERGE_GUARD_DEFAULTS` or
   `MERGE_MODES` asserts it deep-equals a captured snapshot afterwards.
4. **Positive-presence conjuncts are mandatory** — no property asserts only an absence; every
   "never merged" / "never mutates" / "no escalation" row also pins the exact terminal value and the
   named row id, and every preservation claim asserts the fixture *contained* the preserved content.

`ROW_IDS` (FSPEC §11's 25 identifiers `1…23, "11a", "13a"`) and `MERGE_STATUSES` are read from the
exported frozen catalogues (DC-01), never from local literals, so a catalogue that gains a member
reds these properties instead of escaping them.

## 2. Decision-core properties

All five drive **`decideMerge`** and TSPEC §5.2's step loop directly, with a scripted observation
supplier in place of `phaseMerge`'s IO. **The shared axis product** (`D_core`), from TSPEC §2.4's
record shape: `mergeMode ∈ 3` × `prUrl ∈ 2` × `o1 ∈ 7` (`{ok:false}`, and `ok` × state ∈ 3 ×
`mergeable` ∈ 4 incl. the `__unrecognised__` sentinel) × `ci ∈ 5` × `o3 ∈ 4` × `o4 ∈ 3` × `o5 ∈ 4` ×
`caps ∈ 8` × `attempt ∈ 2`. Most combinations are unreachable behind the short-circuit; enumerating
the product *proves* that rather than assuming it.

**PROP-M-01 — Totality and termination. Every observation record resolves to exactly one FSPEC §11
row, within the step bound, for every configuration.**
- **Domain / oracle:** `D_core` driven through §5.2's loop (a demand for a slot the case did not fix
  is itself a failure). Every case returns `kind: "resolved"` with `row ∈ ROW_IDS`, `mergeStatus ∈
  MERGE_STATUSES`, and a step count **strictly below `MERGE_MAX_DECISION_STEPS`**; the loop's exit
  `throw` is never reached and `row === "internal"` never occurs. *Exactly one* is positive, not
  disjointness-by-absence: the resolving guard index is recorded and the `(row, mergeStatus)` pair
  compared to §5.3's table, so two guards claiming one row reds. The bound is asserted as the
  **relation** `MERGE_MAX_DECISION_STEPS > 1 + MERGE_MAX_RETRIES + 4 + 3 + 1` recomputed from the
  constants — never the literal `24` (TE N-04) — re-run with `mergeableRetries` at its cap of 10.

**PROP-M-02 — Purity. `decideMerge` is a deterministic, non-mutating function of `(record, config)`.**
- **Domain / oracle:** each case evaluated twice against a structural clone captured first: the two
  results deep-equal, `record`/`config` deep-equal their clones, and `MERGE_DEFAULTS` / `MERGE_MODES`
  / `MERGE_GUARD_DEFAULTS` unchanged. Positive conjunct: the clone is first asserted non-empty and
  equal to a fixture-known value, so no `undefined == undefined` passes vacuously.

**PROP-M-03 — Fail-closed monotonicity. Degrading any single precondition observation never moves the
outcome toward `merged`.**
- **Domain / oracle:** every `D_core` case reaching row 18 or a later guard, paired with each
  degradation `o1 | ci | o3 | o5 | o4 := unknown`; the degraded run reports `refused` **at the
  specific fail-closed row §5.3 assigns that slot** — 8 / 11 / 13a / 5 / 15 — a named row rather than
  "not 18", so landing on the wrong fail-closed row still reds.
- **The one declared exception, asserted as a case rather than filtered out:** on the already-merged
  path (§11 row 3) `O4` is an *observation, not a precondition* (TSPEC §5.5), so degrading it there
  keeps `mergeStatus: merged` and adds row 22's escalation — asserted as that positive pair. Making
  `O4` a precondition on row 5 reds this case; making it one everywhere reds the main arm.

**PROP-M-04 — No-bypass equivalence. `mergeMode: "gated"` and `"on"` are the same function.**
- **Domain / oracle:** each `D_core` record decided under both modes; the two resolutions are
  **deep-equal** — row, status, reason, escalations, sha, method. Positive conjunct: the enumeration
  is asserted by count to contain at least one `merged` and one `refused` outcome, so the equivalence
  is not proven over a domain where both arms are trivially `skipped`. Any branch on `"on"` anywhere
  in the core reds this, which is AC-1.5's "no mode bypasses the preconditions" made falsifiable.

**PROP-M-05 — Short-circuit minimality. An observation the resolution does not depend on is never
demanded.**
- **Domain / oracle:** with the supplier recording demands in order, each case's demand sequence is a
  **prefix of §5.3's demand order** (`O1, O5, O2, O1*, O3, O4`) truncated at the resolving guard, with
  no later slot present: a row-8 case demanded `O1` and nothing else; a row-7 case never demanded
  `O2`, `O3` or `O4`. This is what makes NFR-2 cheap to hold — an unobserved surface is one nothing
  asked for.

## 3. Self-modification guard properties

**PROP-M-06 — Guard dominance. A changed-file list matching a guard path yields `refused` at row 4
regardless of every other input, configuration included.**
- **Domain:** `passingGh` with `O5` overridden to a list containing one guard-matching path, crossed
  with `mergeMode ∈ {gated, on}` × `mergeRequiresCi ∈ {T, F}` × `ci ∈ 5` × `o3 ∈ {0, 3 unresolved,
  unretrievable}` × `caps ∈ {rebase-only, merge-only, none}` × `guardPaths ∈ {absent, [],
  ["!pdlc/workflows/"], ["extra/"], 42, "not-an-array"}`.
- **Oracle:** every case reports `mergeStatus: "refused"`, `row: 4`, **zero** `/^gh pr merge/`
  commands in `fakeGhRun`'s record, and exactly one notice equal to `MERGE ESCALATION:
  self-modification guard fired for {prUrl} — matched paths: {paths}`, naming every matched path in
  observed order.
- **Scoping, so the property is true rather than nearly true:** dominance is over every guard *below*
  it. The five conditions resolving above it — rows 1, 2, 6, 8 and 3 — are excluded from the domain
  **and asserted as a five-case control block** showing each preempts the guard, so the exclusion is
  evidenced, not assumed.

**PROP-M-07 — Additivity and irremovability. No configuration value removes a shipped default.**
- **Domain:** `effectiveGuardPaths(v)` over seeded arrays of strings (`""`, whitespace, `"!"`-prefixed,
  duplicate-of-a-default, with and without trailing slash) plus the enumerated non-array shapes
  `undefined, null, 42, "str", {}, [], [null], [1,2], [{}], [" "], ["pdlc/workflows"], [".claude/workflows/"]`.
- **Oracle:** the result **contains all four `MERGE_GUARD_DEFAULTS` members by exact string**, every
  member ends in `/`, none is duplicated, and the frozen source array deep-equals its snapshot
  afterwards. `result ⊇ defaults` holds for every input — additive by construction, no filter,
  subtraction or reorder.

**PROP-M-08 — Prefix exactness. `guardVerdict` fires exactly when some changed path has a guard path
as a case-sensitive, position-0, `/`-terminated prefix — and never otherwise.**
- **Domain:** per guard path `g`, the six mutation classes §4.2 names — `g + rand`, segment-suffixed
  (`pdlc/workflows-notes/x`), prefixed (`docs/` + g), case-flipped, slash-stripped, unrelated — plus
  §4.2's five near-miss literals enumerated exactly.
- **Oracle:** `verdict.fired` equals an **independently written reference predicate**
  (`files.some(p => guards.some(g => p.slice(0, g.length) === g))`) and `verdict.matched` equals its
  filtered list, in order. Writing the oracle twice in two shapes is what reds a `startsWith` →
  `includes` or case-folding mutant; the generator guarantees each mutation class has at least one
  firing **and** one non-firing case, asserted by count, so no branch is covered only negatively.

## 4. Configuration and method-policy properties

**PROP-M-09 — Config totality. For any input text, `parseMergeConfig` returns a complete config whose
every key is inside its accepted domain, and never throws.**
- **Domain:** `null`, `""`, non-JSON bytes, JSON scalars, arrays, `{}`, `{merge: <non-object>}`, and
  seeded `{merge:{…}}` objects where each of the seven keys independently takes `{valid, wrong type,
  out of domain, null, missing}` — plus `mergeableRetries` at `10` (accepted), `11` (defaulted) and
  `0` (honoured), and `mergeableRetryDelay: 0`.
- **Oracle:** the result has **exactly** the seven `MERGE_DEFAULTS` keys; `mergeMode ∈ MERGE_MODES`;
  the three booleans are `typeof "boolean"`; the integers satisfy `Number.isInteger` within
  `0…MERGE_MAX_RETRIES` and `≥ 0`; `guardPaths` is an array of non-empty strings; nothing throws; and
  `MERGE_DEFAULTS` deep-equals its snapshot — the mutation this property exists to catch.

**PROP-M-10 — Independent fallback. One bad key never defaults another.**
- **Domain / oracle:** a fully valid **non-default** section with exactly one key corrupted: the
  corrupted key equals its default **and all six others equal the non-default values supplied** — the
  positive half, without which "everything defaulted" would pass. `sectionMalformed` is `true` only
  for the `merge`-is-not-an-object shape and `false` for all 28, keeping E3's note off 27 paths.

**PROP-M-11 — Squash unreachability. Under the shipped configuration, no code path can issue a squash
merge.**
- **Domain:** `mergeCandidates(caps, config)` over all 8 capability triples × `allowSquashMerge ∈
  {absent, false, null, "true", 1}` (every non-`true` shape the reader can emit); and every §11 row
  driven at phase level with the shipped defaults.
- **Oracle:** `"squash"` is **absent from the returned array**, not merely skipped at attempt time;
  the array is `["rebase","merge"]` filtered by capability; `fakeGhRun` records **zero** `--squash`
  occurrences across every phase run. Positive control: the one `allowSquashMerge: true` ×
  squash-allowed case **does** yield `"squash"` last and reports `mergeMethod: "squash"` on success —
  so an implementation that dropped squash entirely also reds.

## 5. Queue write-back properties

**PROP-M-12 — Evidence-null identity. `updateQueueStatus(md, f, s, null)` is byte-identical to the
3-parameter call, for every input.**
- **Domain:** the six queue shapes F1 captures (5-column canonical, already-migrated, padded cells,
  one data row, feature absent, no table at all) × every `QUEUE_STATUSES` member.
- **Oracle:** a **three-way** equality — the 4-parameter `null` call, the 3-parameter call, and the
  **committed golden captured from `updateQueueStatus` at HEAD before the change** (PLAN F1) —
  byte-identical including `matched` and `written`. Per TE F-11, comparing the new code against
  itself proves nothing: the golden is the only non-circular arm and the one that must be able to
  fail. Positive-presence conjunct: each golden is asserted to *contain* the target feature's row and
  to *differ* from the other statuses' goldens, so goldens captured empty cannot pass.

**PROP-M-13 — Write-back idempotence. Applying the `done` write twice equals applying it once, byte
for byte, and never downgrades evidence.**
- **Domain:** each canonical queue × evidence ∈ `{"abc1234 #42", "merged #42", "abc1234 #7"}` applied
  twice; and `mergeEvidenceCell(prev, next)` over 200 seeded pairs from `{"", sha-form, merged-form,
  arbitrary string}`.
- **Oracle:** `md2 === md1` exactly (a fixed point); `ensureEvidenceColumn` reports
  `migrated: false` on the second pass; the Status cell holds the single token `done`, undecorated, on
  both passes. For the cell helper: when `prev` is a non-empty string and `next` matches
  `/^merged #/` the result **is `prev`**, otherwise it **is `next`** — an equality against an
  independent reference, so no-downgrade cannot degenerate into never-update.

**PROP-M-14 — Structural containment. Only the target row's Status and Evidence cells ever change
value; every other cell is preserved.**
- **Domain:** seeded queues of 1–8 data rows (generated feature names, statuses from
  `QUEUE_STATUSES`, mixed `Depends-On` cells, interleaved prose and a trailing history table), each
  row in turn the write target.
- **Oracle:** every **non-target** data row's first five cells are string-equal to their pre-write
  values and its sixth is `""`; the header gains exactly the cell `Evidence`; the separator gains one
  dash cell; **every row has the same cell count**; every non-table line is byte-identical. Positive
  conjunct: the target row's Status changed *from* its known prior value *to* `done` and its Evidence
  cell holds the expected string — so "changed nothing at all" fails.

**PROP-M-15 — Round-trip. A written `done` row re-parses as `done`, and its dependents unblock.**
- **Domain:** each written queue from PROP-M-14 fed back through the *shipped, unmodified*
  `parseQueue` / `selectNextPending` / `precheckDependencies`, over three graphs: a dependent whose
  sole dependency is the target; one with two dependencies, the other still `pending`; and none.
- **Oracle:** `parseQueue` resolves the same five columns as before migration (the sixth ignored by
  `colIndex`, asserted by comparing parsed row objects field by field); the target row's `status` is
  **exactly** `done`; graph 1's dependent is **selected**, graph 2's is **not** (with the reason naming
  the pending dependency), graph 3 selects nothing. Both halves of AC-6.3, so the gate is proven to
  have been what held the dependent shut.

## 6. Phase-level integration properties

**PROP-M-16 — `merged` is never downgraded. No post-merge failure, in any combination, changes
`mergeStatus`.**
- **Domain / oracle:** the full power set of §11's four composable annotations (M2 deletion failure,
  M3 tree failure, M4 `error`, M4 `recorded (uncommitted)`) over both row 18 and row 3. All 32 runs
  report `mergeStatus: "merged"` with the SHA present, pipeline `outcome: "success"`, and exactly the
  escalation/note lines the applied subset predicts in §9.3's order. The empty subset asserts **no**
  notice beginning `MERGE ESCALATION: `; the all-four subset is AT-M6, asserting all lines in order.

**PROP-M-17 — Report totality. Every pipeline path reports a `mergeStatus` from the closed set, and
every non-`merged` value carries a one-line reason.**
- **Domain:** all 25 §11 rows driven through `phaseMerge` into `buildFinalReport`, plus three runs
  halted before Phase MERGE (at R, I, DOD) and one with `PHASE_MERGE_ENABLED: false`.
- **Oracle:** every report — success *and* halt path — carries `mergeStatus`, `mergeSha`,
  `mergeMethod` by `Object.hasOwn` (so `null` counts as present); `mergeStatus ∈ MERGE_STATUSES`; for
  `deferred`/`refused` the `reason` is a non-empty single line naming AC-6.1a's condition and the
  §9.4 note is emitted, for `skipped`/`merged` that note is **absent**; `mergeSha` is a non-empty
  string **iff** `merged` with an observed oid; `mergeMethod ∈ {rebase, merge, squash, unknown, null}`
  and is `"unknown"` exactly on row 3; halt paths report `skipped` (row 23).

**PROP-M-18 — No mutation before resolution (NFR-2). A run that does not report `merged` issues no
state-changing command.**
- **Domain:** every §11 row, plus 200 seeded `passingGh` perturbations each overriding one surface
  with a drawn recognised-or-degraded value — the domain where a mis-ordered guard shows up as an
  unexpected merge.
- **Oracle:** every non-`merged` run recorded **zero** `/^gh pr merge/` commands, **zero** `push` /
  `checkout` / `rebase` / `merge` git verbs, and **no** `_recordQueueRow` call. Every `merged` run
  recorded **≥ 1 and ≤ 3** merge commands and **exactly one** `_recordQueueRow` call — a behavioural
  call-count oracle, because one merge and two merges produce the same envelope.

**PROP-M-19 — Notice-catalogue closure. Every operator-visible line the phase emits is a member of a
frozen catalogue, and every escalation carries the exact prefix.**
- **Domain / oracle:** every line pushed onto `notices` across PROP-M-16's and PROP-M-17's runs either
  starts with `MERGE ESCALATION: ` and equals a `MERGE_ESCALATIONS` template rendered with the run's
  own parameters, or equals a `MERGE_NOTES` template — exact-string comparison, never substring
  sniffing. Cardinality positive: `MERGE_ESCALATIONS` has **4** members and `MERGE_NOTES` **7**
  (TSPEC §10.2), both `Object.isFrozen`, and the observed union covers **every** member at least once,
  so a catalogue member no run can produce is a failure rather than dead weight.

**PROP-M-20 — Phase MERGE never throws. For any fault at any single injected call site, the phase
returns a well-formed `MergeOutcome` and the pipeline does not halt.**
- **Domain:** for each of `_ghRun`, `_git`, `_readFile`, `_recordQueueRow`, a double that behaves
  normally for *k* calls then throws, for every reachable *k* on a merging fixture — the index range
  derived from TSPEC §11.1's enumeration of await sites, not guessed.
- **Oracle:** `phaseMerge` **resolves** (never rejects) in every case; `mergeStatus ∈ MERGE_STATUSES`
  and `row ∈ ROW_IDS ∪ {"internal"}`; `row === "internal"` implies `refused` with a reason; and
  through `main()` the pipeline `outcome` is `success` with the phase glyph never `❌` (a `❌` would
  make a non-merge look like the halting phase, TSPEC §10.3). Positive control: the same fixture with
  no fault reports `merged`, so this does not pass by refusing everything.

## 7. Coverage matrix

Classification, placement and traceability, stated once. **Kind**: `P` pure-function, `I` integration.
Tasks and files are PLAN §12's; every file already exists in PLAN §4's ownership manifest.

| Property | Category | Kind | Domain | Task → file | Traces to |
|---|---|---|---|---|---|
| PROP-M-01 | Contract | P | `enum(≈4 800)` | A4 → `mergeDecision.test.js` | AC-1.6, AC-6.1a; TSPEC §5.2, §5.3 |
| PROP-M-02 | Functional | P | `enum(≈4 800)` | A4 → `mergeDecision.test.js` | NFR-1, NFR-4; TSPEC §5.1 |
| PROP-M-03 | Security | P | `enum(≈3 000)` | A4 → `mergeDecision.test.js` | AC-1.2b, AC-3.4, AC-4.4, AC-2.5a; TSPEC §5.3, §5.5 |
| PROP-M-04 | Functional | P | `enum(≈4 800)` | A4 → `mergeDecision.test.js` | AC-1.5 |
| PROP-M-05 | Performance | P | `enum(≈4 800)` | A4 → `mergeDecision.test.js` | AC-1.6, NFR-2; TSPEC §5.1 |
| PROP-M-06 | Security | I | `enum(360)` | A3/A7 → `mergeGuard`, `mergePhase` | AC-3.1, AC-3.2, AC-3.5; FSPEC §11 row 4 |
| PROP-M-07 | Security | P | `rand(500)` + `enum(12)` | A3 → `mergeGuard.test.js` | AC-3.3, AC-3.7, NFR-3; TSPEC §6.1 |
| PROP-M-08 | Data Integrity | P | `rand(1 000)` + `enum(7)` | A3 → `mergeGuard.test.js` | AC-3.6; FSPEC §4.2 |
| PROP-M-09 | Contract | P | `enum(40)` + `rand(500)` | A1 → `mergeConfig.test.js` | AC-7.1, AC-7.3; TSPEC §3.1, E1–E5 |
| PROP-M-10 | Error Handling | P | `enum(28)` | A1 → `mergeConfig.test.js` | AC-7.3; FSPEC §10.3 |
| PROP-M-11 | Security | P + I | `enum(40)` + `enum(25)` | A4/A7 → `mergeDecision`, `mergePhase` | AC-2.4; TSPEC §5.6 |
| PROP-M-12 | Data Integrity | P | `enum(24)` vs goldens | B2 → `mergeQueueWriteback.test.js` | AC-5.3; FSPEC §7.4; TSPEC §8.4, §13.5 |
| PROP-M-13 | Idempotency | P | `enum(18)` + `rand(200)` | B1/B2 → `mergeQueueWriteback.test.js` | AC-5.8, NFR-5; AT-M2; FSPEC §7.2 |
| PROP-M-14 | Data Integrity | P | `enum(48)` | B1/B2 → `mergeQueueWriteback.test.js` | AC-5.3, AC-5.5; AT-M1; TSPEC §8.5 |
| PROP-M-15 | Integration | I | `enum(18)` | B2/B3 → `mergeQueueWriteback`, `mergeQueueDriver` | AC-5.5, AC-6.3; AT-M5; TSPEC §9.4 |
| PROP-M-16 | Error Handling | I | `enum(32)` | A7 → `mergePhase.test.js` | AC-2.6a, AC-5.2, AC-5.7; AT-M6; FSPEC §11 rows 19–22 |
| PROP-M-17 | Contract | I | `enum(29)` | A8 → `mergePhase`, `pipelineWiring`, `reportTemplates` | AC-1.3, AC-1.4, AC-6.1, AC-6.2; TSPEC §10.1 |
| PROP-M-18 | Security | I | `enum(25)` + `rand(200)` | A7 → `mergePhase.test.js` | NFR-2; TSPEC §4.7, §5.2 |
| PROP-M-19 | Observability | I | `enum(57)` | A7 → `mergePhase.test.js` | AC-6.2a; TSPEC §10.2 |
| PROP-M-20 | Error Handling | I | `enum(≈56)` | A7 → `mergePhase.test.js` | AC-1.3, NFR-2; TSPEC §5.2, §12 E21 |

**Requirements without a property, and why that is correct:** AC-1.2a (bounded re-reads) and AC-2.3/
AC-2.5b (method exhaustion) are *counting* behaviours whose whole content is an exact number and an
exact reason string — TSPEC §13.2's example cases pin them better than a quantifier would;
AC-5.4 and AC-5.6 are single-branch behaviours covered by AT-M4 and E17. Every other AC appears above.

## 8. Gaps, residuals, and what this document does not prove

1. **The `merged` path is never observed live in this repo** (BL-04, PLAN K-5): every PR this queue
   raises touches a guard path, so PROP-M-06 is the *shipped* behaviour here and PROP-M-11/-16/-18's
   merged arms are evidenced entirely through doubles. Stated so a future reader does not read
   "never merged in `yumo-plugins`" as "never worked".
2. **Transport fidelity is out of reach.** Every observation arrives through an agent-mediated
   `_ghRun`; a transport that mangles a *value* inside its recognised set is undetectable from here
   (TSPEC §15.3). The properties quantify over what the classifier receives, not over what `gh` sent.
3. **`git rebase --empty=drop` (git ≥ 2.26) is a measured platform fact, not a property** — DC-02
   routes it to PLAN K-1's two-runner CI reading, and no property here asserts it.
4. **Negative properties, named as a set:** PROP-M-03 (degradation never merges), PROP-M-08's
   non-firing arms, PROP-M-11 (squash never issued), PROP-M-18 (no mutation before resolution) and
   PROP-M-19's catalogue closure. Each carries a positive control in the same suite, so none of them
   can pass by the system doing nothing at all.
5. **Mutation targets these properties are expected to kill** (TSPEC §13.5): the guard's `startsWith`
   (PROP-M-08), §5.3's row order and row ids (PROP-M-01/-03), the CI rule's single relaxed cell
   (PROP-M-03), `evidenceCellFor`'s 7-character truncation (PROP-M-13/-14) and the `recorded`-only
   gate on the §8.2 notice (PROP-M-16). A surviving mutant in any of these is a defect in the
   property, not an acceptable residual.
6. **Routed to the PLAN author, not papered over:** F1's scope widens to hold the seeded generators
   (§1.2). No new file and no new batch — but PLAN §4's manifest should say so.

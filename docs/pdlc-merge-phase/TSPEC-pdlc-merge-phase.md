# TSPEC — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-FSPEC-v3.md`, `CROSS-REVIEW-test-engineer-FSPEC-v3.md`, `CROSS-REVIEW-product-manager-TSPEC-v1.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.1 | 2026-08-02 |

## 1. Scope, inputs, and how to read this document

This TSPEC specifies **how** FSPEC v1.2's Phase MERGE is built in `pdlc/workflows/`. The FSPEC is the
behavioural contract and is not restated here: every section below either names a function, a
signature, a file and a line, or a mechanical rule, and cites the FSPEC clause it implements.

**Inputs.** REQ v1.1 (approved), FSPEC v1.2 (dual-approved), `CROSS-REVIEW-software-engineer-FSPEC-v3`
and `CROSS-REVIEW-test-engineer-FSPEC-v3` (both `APPROVED`, carrying advisory riders addressed here).

**Project-level context read before authoring.** `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-01
closed catalogues and total parsers, DC-02 measured platform facts, DC-03 falsified assertions, DC-04
oracles as pure functions of an injected root, DC-05 one AT per named branch, DC-11 sibling oracles
share an error contract) and `docs/_decisions/DECISIONS-plugin-distribution.md` (the runtime exposes
no `fs`, no `process`, no `import()`, no `fetch`; the bundle is generated). Nothing below contradicts
them; §11 is written against DC-02 in particular — every runtime claim it makes is cited to a line.

**Where the code goes.** Two modules change, plus the generator and the adapter:

| File | Change class |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` | new: Phase MERGE — config reader, six observations, pure decision core, guard, merge execution, post-merge sequence, phase wiring in `main()`, report fields |
| `pdlc/workflows/orchestrate-queue.js` | changed: `updateQueueStatus`, `rewriteStatus`, `commitQueueRow`, `uncommitted`, `runPicked`; new pure helpers for the `Evidence` column |
| `pdlc/workflows/build-runtime.mjs` | changed: `exportedNames` for both IIFEs, both entrypoint `_recordQueueRow` closures, `DEV_META.phases` |
| `pdlc/workflows/runtime-adapter.js` | new: `rtMergeObservations`; one new key in `rtDevInjections` |

**Obligation index.** FSPEC §13's entry obligations are discharged as follows; §15 restates the
result with evidence.

| Obligation | Discharged in |
|---|---|
| O-M1 — disposition catalogue migration, producers and readers, seam rename | §8.2, §8.5 |
| O-M2 — observation names/signatures/injection; the evidence-carrying recording channel | §4, §8.3, §8.4 |
| O-M3 — `O3` GraphQL query, pagination, `prUrl` → owner/repo/number | §4.4 |
| O-M4 — `O5` pagination completeness rule | §4.6 |
| O-M5 — where the `merge` config section is read and cached | §3.3 |
| O-M6 — `RLH-AT-32-orch` re-expression (PLAN-owned) | §13.4 names the task; PLAN owns it |
| O-M7 — the wait between `mergeable` re-reads | §4.3 |
| O-M8 — the M3 replay command sequence and its failure detection | §7.4 |
| SE-v3 advisory / TE-v3 **N-02** — `O4` on the already-merged path | §5.5 |
| TE-v3 **N-01** — an unparseable `O1.number` resolving at two rows | §4.6, §13.3 |

This is **v1.1**, revised against the two round-1 cross-reviews (PM `Needs revision`, TE `REVISE`).
§15.1 records the per-finding disposition and the two FSPEC errata this revision requests. The
obligation index above is the document's single one — v1.0's duplicate in §15 is gone.

**House idioms this feature inherits, not invents.** `{ execFn }` injection for a command-running
observation (`checkPrCi`, `orchestrate-dev.js:3485`); `defaultGit(argv, { execFn })`'s never-throwing
`{ ok, stdout, stderr }` (`:4252`); the `_seam = defaultImpl` parameter idiom on `main()` (`:4297`);
compile-time phase flags (`PHASE_DOD_ENABLED :22`, `PHASE_PUB_ENABLED :28`); the fail-closed
injected-read wrapper (`readDriftStateSafely`, `orchestrate-queue.js:1354`); and the
fixed-command/exact-reply adapter discipline (`rtGit`, `runtime-adapter.js:927`).

## 2. Module architecture and function inventory

### 2.1 Layering

Four layers, with the dependency arrow pointing one way only:

```
main()  ──►  phaseMerge()  ──►  decideMerge()          [pure, total, no IO]
                   │        ──►  observations O1…O6     [{ execFn } transport]
                   │        ──►  post-merge effects M2…M5 (_git, _recordQueueRow)
                   └──► returns one MergeOutcome record
```

`decideMerge` never performs IO and never receives a seam; `phaseMerge` performs no parsing and takes
no decision beyond "which observation the core just demanded".

**What that split does and does not buy (TE F-01, F-13).** FSPEC §11's table has **24** rows (1–23
plus 11a), and it is **not** a pure-function suite: three of its four columns — *queue written*,
*escalation*, and the observation-traffic assertions §13.3 requires — are `phaseMerge`'s, not
`decideMerge`'s. The row table is therefore driven through `phaseMerge` (§13.2), and `decideMerge`
carries a thinner suite of its own: the ordered guard sequence, the two §2.3 tie-breaks, the
short-circuit property and the termination bound. v1.0 claimed otherwise; the claim was wrong.

### 2.2 New constants — `orchestrate-dev.js`, alongside the existing phase flags (`:19`–`:35`)

| Name | Value | Note |
|---|---|---|
| `PHASE_MERGE_ENABLED` | `true` | FSPEC §2.4 row 1; same shape as `PHASE_DOD_ENABLED` (`:22`) |
| `MERGE_CONFIG_PATH` | `".claude/pdlc.config.json"` | §3 |
| `MERGE_GUARD_DEFAULTS` | `Object.freeze(["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"])` | FSPEC §4.3; frozen so no code path can remove a default |
| `MERGE_DEFAULTS` | `Object.freeze({ mergeMode: "off", mergeRequiresCi: true, allowSquashMerge: false, deleteBranchOnPdlcMerge: true, mergeableRetries: 3, mergeableRetryDelay: 10, guardPaths: [] })` — `mergeableRetryDelay` is **in seconds**, the REQ §7 / FSPEC §10.1 key name, with the unit documented rather than encoded in the name (PM F-03) | FSPEC §10.1 |
| `MERGE_MODES` | `Object.freeze(["off", "gated", "on"])` | closed catalogue (DC-01) |
| `MERGE_STATUSES` | `Object.freeze(["merged", "deferred", "refused", "skipped"])` | FSPEC §9.1 |
| `MERGE_FILES_PAGE_LIMIT` | `100` | §4.6 — GitHub's `files` page size |
| `MERGE_THREAD_PAGE_LIMIT` | `100` | §4.4 |
| `MERGE_MAX_THREAD_PAGES` | `10` | §4.4 — bounded, fail-closed |
| `MERGE_MAX_RETRIES` | `10` | §3.1 — the accepted upper bound on `mergeableRetries` (TE F-02) |
| `MERGE_MAX_DECISION_STEPS` | `24` | §5.2 — termination bound, **derived** from `MERGE_MAX_RETRIES` (§5.2) |

### 2.3 Function inventory — `orchestrate-dev.js`

`export` here means "exported from the ES module so jest can import it"; §11.2 says which names the
bundle additionally publishes. Every function is total and never throws unless the column says so.

| Function | Signature | Purity |
|---|---|---|
| `parseMergeConfig` | `(text: string \| null) => { config: MergeConfig, sectionMalformed: boolean }` | pure |
| `readMergeConfigSafely` | `async (readFileFn, path) => string \| null` | IO, never throws |
| `effectiveGuardPaths` | `(configured: unknown) => string[]` | pure |
| `parsePrRef` | `(prUrl: string) => { owner, repo, number } \| null` | pure |
| `classifyPrState` | `(raw: string \| null) => O1Observation` | pure |
| `classifyReviewThreads` | `(raw: string \| null) => O3Observation` | pure |
| `classifyRepoCaps` | `(raw: string \| null) => O4Observation` | pure |
| `classifyChangedFiles` | `(primaryRaw, fallbackRaw, opts) => O5Observation` | pure |
| `classifyMergeResult` | `(mergeRaw, readbackRaw) => O6Observation` | pure |
| `mergeCommandFor` | `(surface, params) => string` | pure — the **single** home of every `gh` command string (§4.1) |
| `defaultGhRun` | `async (command, { execFn }) => { ok, stdout }` | IO — the one new capability seam's default |
| `observePrState` | `async (prUrl, { _ghRun }) => O1Observation` | IO |
| `observeCi` | `async (prUrl, { _ghRun, _checkCi }) => CiStatus` | IO — delegates to `checkPrCi` |
| `observeReviewThreads` | `async (ref, { _ghRun }) => O3Observation` | IO |
| `observeRepoCaps` | `async ({ _ghRun }) => O4Observation` | IO |
| `observeChangedFiles` | `async (prUrl, ref, { _ghRun }) => O5Observation` | IO |
| `executeMerge` | `async (prUrl, method, { _ghRun }) => O6Observation` | IO, mutating |
| `guardVerdict` | `(changed: O5Observation, guardPaths: string[]) => { fired, kind, matched }` | pure |
| `mergeCandidates` | `(caps: O4Observation, config) => Array<"rebase" \| "merge" \| "squash">` | pure |
| `decideMerge` | `(record: ObservationRecord, config) => Demand \| Resolution` | pure, total |
| `deleteRemoteBranch` | `async ({ feature, _git }) => { ok, reason }` | IO |
| `updateDefaultBranch` | `async ({ defaultBranch, mergeSha, _git }) => { ok, branch, reason }` | IO |
| `evidenceCellFor` | `(mergeSha: string \| null, prNumber: number) => string` | pure |
| `phaseMerge` | `async ({ feature, prUrl, config?, _enabled = PHASE_MERGE_ENABLED, _ghRun = defaultGhRun, _git, _readFile, _recordQueueRow, _log, _now, _sleep, _configPath = MERGE_CONFIG_PATH }) => MergeOutcome` | orchestrator |

**The enable seam, named once (TE F-05).** `phaseMerge`'s parameter is **`_enabled`**, defaulted in
the callee; `main()`'s corresponding parameter is `_phaseMergeEnabled` and it forwards its value into
`_enabled` (§10.4). Two names for two scopes, and both are injectable — §13.3's row-1 case needs
`_readFile` provably uncalled, which requires reaching row 1 without editing a module constant.

**One new capability seam, not six (TE F-03, F-04).** v1.0 proposed a `_mergeObservations` table of
six functions. It is replaced by a single seam, **`_ghRun(command) => { ok, stdout }`** — "run this
`gh` command, give me its raw stdout" — because that is the only capability the runtime must supply.
Every command string, every fallback, every pagination loop and the `O6` read-back then live in this
module, in one place, and the adapter carries no `gh` knowledge at all (§11.3). FSPEC §3.1's "one
substitutable observation point per external surface" is satisfied by the six `observe*` functions:
each is separately importable and separately drivable, because a test's `fakeGhRun` is keyed on the
command shape and can answer one surface while leaving the others alone (§13.1).

### 2.4 The two record types

```
ObservationRecord = {
  prUrl: string | null,
  o1: O1Observation | null,        // last observation; o1Count counts them (FSPEC §3.3)
  o1Count: number,
  ci: CiStatus | null,
  o3: O3Observation | null,
  o4: O4Observation | null,
  o5: O5Observation | null,
  attempts: Array<{ method, ok, detail }>,   // one row per O6 attempt, in order
}

MergeOutcome = {
  mergeStatus: "merged" | "deferred" | "refused" | "skipped",
  mergeSha: string | null,
  mergeMethod: "rebase" | "merge" | "unknown" | null,   // + "squash", pending erratum E-1 (§15.2)
  row: RowId,                      // see the rule below — reported, and asserted by tests
  reason: string | null,           // FSPEC §9.2, one line
  escalations: string[],           // each already prefixed "MERGE ESCALATION: "
  notes: string[],                 // plain, non-escalating notices
  queueRow: "recorded" | "recorded (uncommitted)" | "none" | "error" | null,
}
```

**`row` is a FSPEC §11 row identifier — always (PM F-01).** v1.0 leaked §2.2's row numbers into this
field, making §11 rows 6 and 8 unreachable and rows 3 and 4 double-claimed by conditions with
different `mergeStatus` and escalation expectations. The rule, stated once and enforced by §5.3:

| `row` value | Meaning |
|---|---|
| `1`…`23`, `"11a"` | the FSPEC §11 row that resolved. This is the normal case and covers every row of §11's table |
| `"7d-unknown"` | the **one** condition FSPEC §11 has no row for: an unretrievable `O3` (FSPEC §3.2 assigns it `refused` at §2.3 **7d**, but §11's table has no corresponding row). Requested as FSPEC erratum E-2 (§15.2); until it lands, this designator names the gap rather than borrowing a row that means something else |
| `"internal"` | E30 only — `phaseMerge` caught a throw (§5.2). Never produced by a correct implementation |

`mergeMethod`'s `"squash"` member is likewise **not** in FSPEC §9.1's enumeration and is reachable
only under `allowSquashMerge: true` (FSPEC §6.1). It is declared here and raised as erratum E-1
(§15.2, PM F-04) rather than shipped silently.

Every observation type is a discriminated union `{ ok: true, … } | { ok: false, reason }` where
`ok: false` **is** FSPEC §3.2's `unknown`. One shape for all six (DC-11: sibling oracles share an
error contract), so the core's fail-closed branches are written once, not six times.

### 2.5 Function inventory — `orchestrate-queue.js`

| Function | Change |
|---|---|
| `ensureEvidenceColumn(markdown) => { markdown, migrated }` | **new**, exported, pure — FSPEC §7.3's three structural changes |
| `mergeEvidenceCell(prev, next) => string` | **new**, exported, pure — FSPEC §7.2's no-downgrade rule |
| `updateQueueStatus(markdown, feature, newStatus, evidence = null)` | **4th parameter**; `evidence == null` takes today's code path unchanged (§8.4) |
| `rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn, gitFn, evidence = null)` | **7th parameter**, appended |
| `commitQueueRow` / `uncommitted` | return `"recorded"` / `"recorded (uncommitted)"` (§8.2) |
| `runPicked` | `mergeStatus: "merged"` ⇒ `done` + suppressed operator message (§9) |
| `QUEUE_ROW_DISPOSITIONS` | **new**, exported frozen catalogue (DC-01) |

`orchestrate-queue.js` learns nothing about merging: it gains an evidence *string* it does not
interpret. The queue's table grammar stays entirely on its side of the seam, unchanged from the
dependency direction `rewriteStatus`'s docblock states (`orchestrate-queue.js:865`–`875`).

## 3. Configuration reader (O-M5)

Implements FSPEC §10. This is the **first script-side read of `.claude/pdlc.config.json`** — verified:
the only reader today is `pdlc_resolve_check_enabled` in `pdlc/hooks/scripts/lib/pdlc-drift.sh:840`,
and the queue's drift gate reads the drift-state record, not the config
(`orchestrate-queue.js:1354`).

### 3.1 `parseMergeConfig(text)` — pure and total

Returns `{ config, sectionMalformed }`. Never throws; never reads anything.

1. `text == null` or `JSON.parse` throws → `{ config: MERGE_DEFAULTS, sectionMalformed: false }`.
   An absent or unparseable **file** is not a malformed **section**: FSPEC §10.3's note exists for an
   operator who wrote a `merge` section, and a repo with no config file wrote none.
2. Parsed value is not a plain object, or `merge` is absent → defaults, `sectionMalformed: false`.
3. `merge` is present but not a plain object → defaults, `sectionMalformed: **true**`.
4. Otherwise each key is validated independently and **falls back independently** (FSPEC §10.3):

| Key | Accepted | Otherwise |
|---|---|---|
| `mergeMode` | one of `MERGE_MODES` | `"off"` |
| `mergeRequiresCi`, `allowSquashMerge`, `deleteBranchOnPdlcMerge` | `typeof === "boolean"` — the strings `"true"`/`"false"` are not | the default |
| `mergeableRetries` | `Number.isInteger(v) && v >= 0 && v <= MERGE_MAX_RETRIES` (0…10) | the default (`3`) |
| `mergeableRetryDelay` | `Number.isInteger(v) && v >= 0`, **in seconds** | the default (`10`) |
| `guardPaths` | an array; **each member** that is a non-empty string is kept, others dropped | contributes nothing |

`0` is honoured for both integers, so a deterministic suite that sets `mergeableRetryDelay: 0` tests
its own value (FSPEC §10.3). The `distribution` section is never touched, read or re-emitted.

**Why `mergeableRetries` has an upper bound (TE F-02).** FSPEC §10.3 accepts "integers ≥ 0" without a
ceiling, and v1.0 transcribed that literally — which made §5.2's decision-step bound reachable from
configuration: `mergeableRetries: 25` would exhaust the loop, throw, be caught, and report `refused,
row: "internal"` where FSPEC §11 row 13 requires `deferred`. A configuration value must not be able
to convert one FSPEC row into another. The out-of-domain value therefore **takes the default**, which
is exactly FSPEC §10.3's own rule for a value outside its accepted domain — no new behaviour class,
just a domain that is bounded above as well as below. `11` is out of domain and yields `3`, and
§13.2 tests the boundary pair (`10` accepted, `11` defaulted) plus the row-13 case at `10`.

### 3.2 `readMergeConfigSafely(readFileFn, path)`

Byte-for-byte the shape of `readDriftStateSafely` (`orchestrate-queue.js:1354`) and adopted for the
same reason: the injected read is agent-mediated in production (`rtReadFile`,
`runtime-adapter.js:493`), which returns `null` for a missing file rather than throwing — but a
throw from some future read implementation must not abort the pipeline. Wraps the call in
`try/catch`, returns the string or `null`. **Awaited** at its one call site (§11.1).

### 3.3 Where it is read, and where it is cached (O-M5)

Read **once per `phaseMerge` invocation**, at the top of the function, **after** the
`PHASE_MERGE_ENABLED` check and **before** everything else:

```js
if (!enabled) return skippedOutcome(1, "Phase MERGE disabled");   // FSPEC §2.2 row 1 — no read
const { config, sectionMalformed } = parseMergeConfig(
  await readMergeConfigSafely(_readFile, _configPath)             // exactly one read per run
);
if (sectionMalformed) notes.push(`…`);                            // FSPEC §10.3, suppressed on row 1 by construction
if (config.mergeMode === "off") return skippedOutcome(2, "mergeMode is off");
```

Row 1 resolving before the read is **structural, not a checked precondition**: the `return` above it
means no code path exists on which a disabled phase reads the file, so FSPEC §10.3's "the note is
suppressed when row 1 resolves" holds by construction and cannot regress into an ordering bug.

The value lives in a **local `const` of `phaseMerge`** and is passed down explicitly. There is
deliberately **no module-level cache**: `orchestrate-queue` calls `orchestrate-dev.main` *in process*
(`build-runtime.mjs:178`–`184`), so a module-level cache would leak one feature's configuration into
the next feature of the same `/loop` iteration. A test may bypass the read entirely by passing
`config` directly to `phaseMerge`; when `config` is supplied the read is skipped, which is also what
makes the config path itself testable without a filesystem.

`_configPath` defaults to `MERGE_CONFIG_PATH` in the callee, so no new `main()` seam is needed for it.

## 4. Observation points O1–O6 (O-M2, O-M3, O-M4, O-M7)

Implements FSPEC §3. Each surface is **one function** that issues its command through the single
`_ghRun` transport seam (§2.3) and classifies the raw output against a closed value set. `_ghRun`
defaults to `defaultGhRun`, whose own `execFn` defaults to `child_process.execSync` resolved through
the module's existing dynamic `import()` — the one construct the runtime forbids and never reaches,
because in the bundle `_ghRun` is always supplied by the adapter (§11.3).

### 4.1 The shared transport and the shared failure shape

```js
export function mergeCommandFor(surface, params) { … }     // pure: the ONLY home of every gh string

export async function defaultGhRun(command, { execFn } = {}) {   // the seam's default
  const { execSync } = await import("child_process");
  const run = execFn ?? ((c, o) => execSync(c, o));
  try { return { ok: true, stdout: String(run(command, { stdio: "pipe", encoding: "utf8" })) }; }
  catch { return { ok: false, stdout: "" }; }
}

async function ghJson(surface, params, _ghRun) {            // module-private
  const r = await _ghRun(mergeCommandFor(surface, params));
  if (!r || r.ok !== true) return { ok: false, reason: "command-failed" };
  try { return { ok: true, json: JSON.parse(r.stdout) }; }
  catch { return { ok: false, reason: "unparseable" }; }
}
```

Three separations, each doing work:

- **`mergeCommandFor` is pure and singular.** Every `gh` command string in this feature is built
  there and nowhere else, so the adapter needs no catalogue of its own (§11.3) and a test can assert
  a command's exact bytes without running anything (TE F-04).
- **`defaultGhRun` never throws** and returns `{ ok, stdout }` — `defaultGit`'s contract
  (`orchestrate-dev.js:4252`), for the same reason: the caller branches on `ok`, the seam interprets
  nothing. Its `{ execFn }` injection is `checkPrCi`'s (`:3485`–`:3490`).
- **Every `classify*` is pure and takes the raw string**, so the §3.2 fail-closed table is a
  pure-function suite with no transport at all, and the `observe*` wrappers contain nothing but a
  `ghJson` call and a classifier call.

`reason` is drawn from the closed set `"command-failed" | "unparseable" | "field-absent" |
"unrecognised-value" | "incomplete"` (DC-01). Every one of them is FSPEC §3.2's `unknown`; the
distinction exists only for the operator-facing detail line.

### 4.2 `O1` — PR state

```
gh pr view {prUrl} --json state,mergeable,mergeStateStatus,number,mergeCommit
```

`classifyPrState(raw)` returns
`{ ok: true, state, mergeable, mergeStateStatus, number, mergeCommitOid } | { ok: false, reason }`,
per-field:

| Field | Recognised | On violation |
|---|---|---|
| `state` | `OPEN` / `CLOSED` / `MERGED` | `{ ok: false }` — FSPEC §2.2 row 4 |
| `mergeable` | `MERGEABLE` / `CONFLICTING` / `UNKNOWN` | field is set to the sentinel `"__unrecognised__"` |
| `mergeStateStatus` | the eight of FSPEC §3.2 | same sentinel |
| `number` | `Number.isInteger(n) && n > 0` | `null` |
| `mergeCommit.oid` | a string; **absent is legal** on an open PR | `null`, never a failure |

The asymmetry is FSPEC §2.3's 7c split, made mechanical: an unreadable `state` is a *whole-observation*
failure (it resolves at row 4, above the guard), while an unreadable `mergeable`, `mergeStateStatus`
or `number` leaves the observation `ok` and is decided at **7c** by `decideMerge` (§5.4, §11 row 11a).
Encoding that as one sentinel value rather than three booleans keeps the core's 7c branch a single
membership test.

### 4.3 `O1` re-observation on `mergeable: UNKNOWN` (FSPEC §3.3, O-M7)

The loop lives in `decideMerge`/`phaseMerge`, **not** inside `observePrState` — the core demands a
re-observation, the orchestrator sleeps and takes it (§5.3). Consequences pinned:

- A run that exhausts the loop makes exactly `1 + mergeableRetries` observations, counted in
  `record.o1Count`. Reason line: `` `mergeability still UNKNOWN after ${record.o1Count} observations` ``
  — interpolating the counter, so the number cannot drift from the loop.
- `mergeableRetries: 0` yields `after 1 observations`, ungrammatical and deliberately unspecial-cased.
- A re-read that returns `{ ok: false }` ends the loop with `refused` (§11 row 11a), never `deferred`.
- **O-M7 — the wait.** `phaseMerge` declares `_sleep = sleep` and `_now = () => Date.now()` **in its
  own parameter list**, the default-in-callee pattern `raisePrAndVerifyCi` already uses (`:3899`,
  `:3901`). `main()`'s `_now`/`_sleep` are declared with no default (`:4315`–`:4316`) and forwarded;
  forwarding `undefined` therefore lands on the callee default rather than on an undefined value.
  The wait is `config.mergeableRetryDelay * 1000` milliseconds (the key is in seconds), computed at
  the call site.

### 4.4 `O2` — CI rollup, and `O3` — review threads (O-M3)

**`O2` reuses `checkPrCi` unchanged.** `observeCi(prUrl, { execFn, _checkCi = checkPrCi })` is a
one-line delegation returning `passed | pending | failed | none | unknown`. FSPEC §3.1's "two
classifications of the same rollup that disagree is the defect AC-4.0 prevents" is satisfied
structurally: there is no second classifier, and `classifyCheckRollupEntry` (`:3532`) is not copied.

**`O3`** needs owner/repo/number, so `parsePrRef(prUrl)` comes first: a pure parse of
`https://github.com/{owner}/{repo}/pull/{n}` (host ignored, trailing segments and query string
tolerated, `n` an integer > 0), returning `null` on anything else. `null` ⇒ `O3` is `{ ok: false,
reason: "unparseable" }` (FSPEC §3.1). When `O1` is `ok` and carries a `number`, a mismatch against
`ref.number` also yields `{ ok: false }` — the cross-check FSPEC §3.1 requires.

The query, issued through `gh api graphql`, one page per call:

```
gh api graphql -f owner={owner} -f repo={repo} -F number={number} -f cursor={cursor|""} -f query='
query($owner:String!,$repo:String!,$number:Int!,$cursor:String){
  repository(owner:$owner,name:$repo){ pullRequest(number:$number){
    reviewThreads(first:100, after:$cursor){
      pageInfo{ hasNextPage endCursor } nodes{ isResolved } } } } }'
```

`-F` (not `-f`) for `number` so it is sent as an `Int`; `cursor` is omitted on the first call and
passed as `endCursor` thereafter. Pagination: loop while `hasNextPage`, at most
`MERGE_MAX_THREAD_PAGES` (10) pages — 1 000 threads. Exceeding the bound, a page that fails to parse,
a missing `nodes`, or a node whose `isResolved` is not a boolean each yield `{ ok: false }`, which is
a **failed precondition** (`refused`, §11 row 15's sibling at 7d). Success yields
`{ ok: true, unresolved: n }` where `n` counts `isResolved === false`; `n === 0` (including an empty
list) passes. `reviewDecision` is **not** consulted anywhere — REQ AC-1.2 forbids the substitute, and
its absence from every command string in this document is the check.

### 4.5 `O4` — repository capabilities and default branch

```
gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge,defaultBranchRef
```

`classifyRepoCaps` requires all four booleans to be `typeof === "boolean"` **and**
`defaultBranchRef.name` to be a non-empty string; anything else is `{ ok: false }` ⇒ `refused`
(FSPEC §3.2, AC-2.5a — "never guess a branch name to check out"). Success:
`{ ok: true, rebase, mergeCommit, squash, deleteBranchOnMerge, defaultBranch }`.

`O4` carries no PR URL, so it is the one observation reusable across runs in principle — and
deliberately **not** cached: one run, one observation, no cross-run state (§3.3's reasoning).

### 4.6 `O5` — changed files, and the completeness rule (O-M4)

Two commands, in order:

1. `gh pr view {prUrl} --json files` → `files[].path`.
2. Fallback, when and only when step 1 is **possibly incomplete**:
   `gh api --paginate --slurp repos/{owner}/{repo}/pulls/{number}/files`, whose reply is a JSON array
   of pages; paths come from each element's `filename`, and `previous_filename` is added when present
   (FSPEC §4.2's rename rule — both paths matched where the surface supplies both).

**The completeness rule (O-M4), stated as a decision procedure — the phase never assumes a list is
complete, it establishes it:**

| Step-1 result | Verdict |
|---|---|
| not `ok`, or `files` absent / not an array | **possibly incomplete** → try the fallback |
| `files.length < MERGE_FILES_PAGE_LIMIT` | **complete** — GitHub returned fewer than a full page, so there is no next page |
| `files.length >= MERGE_FILES_PAGE_LIMIT` | **possibly incomplete** → try the fallback |
| any member without a string `path` | `{ ok: false, reason: "unparseable" }`, no fallback — a malformed page is not a pagination problem |

The fallback is complete when it runs, parses as an array of arrays, and every element carries a
string `filename`; otherwise `{ ok: false, reason: "incomplete" }`. `parsePrRef` failing also lands
here. **An empty list is `{ ok: true, files: [] }`** — a valid observation of a PR with no changed
files, which passes the guard (FSPEC §3.2's second note). `{ ok: false }` from either path makes the
guard **fire** (§6.3), never pass.

**TE-v3 N-01, resolved.** An unparseable `O1.number` reaches `O5`'s fallback before it reaches 7c,
so the same bad input resolves at §11 row 5 when the fallback is needed and at row 11a when it is not.
Both refuse; the difference is only the escalation. The TSPEC makes this a *fixture obligation*
rather than a code change: §13.3 states that a row-11a fixture must keep step 1 complete
(`files.length < 100` and parseable), and a row-5-via-`number` fixture must force the fallback. The
test file names the constraint at the top of the parameterised table so a future author cannot
reintroduce the ambiguity by editing a fixture.

### 4.7 `O6` — merge execution

`executeMerge(prUrl, method, { execFn })` issues exactly one of
`gh pr merge {prUrl} --rebase` / `--merge` / `--squash`, then **always** reads back
`gh pr view {prUrl} --json mergeCommit,state`. Success requires `state === "MERGED"` **and** a string
`mergeCommit.oid`; a zero-exit command whose read-back does not confirm both is a **failed attempt**
and the chain continues (FSPEC §6.2). Returns
`{ ok: true, oid } | { ok: false, reason, detail }` where `detail` is the first line of stderr, kept
for the exhaustion reason line (FSPEC §6.3).

`O6` is the only mutating observation. NFR-2 is preserved by construction: it is reachable from
exactly one place in `phaseMerge` — the `act` branch of §5.2's loop — and that branch is reachable
only from a `decideMerge` resolution that every precondition passed.

## 5. The pure decision core — `decideMerge`

### 5.1 Why demand-driven rather than all-inputs-up-front

FSPEC §2.2 and §2.3 both **short-circuit**: `O1` is observed once at row 4, `O2` only if 7a passed,
`O3` only if 7c passed, and a failing precondition means later ones are never observed. A pure
`decideMerge(allObservations, config)` would require every observation to be taken before any
decision — the precise shape FSPEC §2.3 rejects ("a class-based re-sort would require every
observation to be taken before any can be reported, contradicting the short-circuit AC-1.6 fixes").

So the core is **pure and demand-driven**. It is a total function of the observations taken *so far*
and returns either a demand for the next one or a resolution:

```
decideMerge(record, config) =>
  | { kind: "need", observation: "O1"|"O2"|"O3"|"O4"|"O5", waitMs?: number }
  | { kind: "act",  method: "rebase" | "merge" | "squash" }
  | { kind: "resolved", row, mergeStatus, reason, escalations, mergeSha, mergeMethod }
```

No IO, no clock, no randomness: the same record and config always produce the same answer. Short-
circuiting is not a property the implementation must remember to preserve — an observation that is
never demanded is never taken, because taking it is the orchestrator's response to a demand.

### 5.2 The orchestrator loop

```js
for (let step = 0; step < MERGE_MAX_DECISION_STEPS; step++) {
  const d = decideMerge(record, config);
  if (d.kind === "resolved") return finish(d);
  if (d.kind === "act")  { record.attempts.push(await observe.merge(prUrl, d.method)); continue; }
  if (d.waitMs) await _sleep(d.waitMs);
  record[slotFor(d.observation)] = await observe[nameFor(d.observation)](…);
  if (d.observation === "O1") record.o1Count += 1;
}
throw new Error("unreachable: decideMerge did not resolve");   // see below
```

**Termination.** Every iteration either fills a slot that was empty, appends an attempt from a
finite candidate chain, or resolves. `MERGE_MAX_DECISION_STEPS = 24` bounds `1 + maxRetries` `O1`
observations, four other observations and three attempts with slack. The bound is an assertion, not
a control-flow device: reaching it is a coding defect, and the loop's exit therefore throws — but
**`phaseMerge` wraps its whole body in `try/catch`** and maps any throw to
`{ mergeStatus: "refused", row: "internal", reason }`, because FSPEC §2.1 requires that **Phase MERGE
never throws** (a throw would take `main()`'s halt path at `:5117` and write a `halted` queue row over
a feature whose only fault is an unmergeable PR). The catch is the single place that guarantee is
enforced, and §13.2 pins it with an observation double that throws.

### 5.3 The resolution order — a literal transcription of FSPEC §2.2

`decideMerge`'s body is one ordered sequence of guarded returns, in FSPEC §2.2's row order. The row
number is *carried in the result*, so a test asserts the resolving row rather than inferring it:

| Guard, in order | Result |
|---|---|
| `config.mergeMode === "off"` | row 2, `skipped` |
| `!record.prUrl` | row 3, `deferred`, "no PR URL from Phase PUB" |
| `record.o1 === null` | **need `O1`** |
| `!record.o1.ok` | row 4, `refused`, "PR state could not be determined", **no escalation** |
| `record.o1.state === "MERGED"` | see §5.5 (already-merged path) |
| `record.o5 === null` | **need `O5`** |
| `guardVerdict(record.o5, guardPaths).fired` | row 4/5, `refused` + escalation (§6) |
| `record.o1.state === "CLOSED"` | 7a → row 7, `deferred`, "PR is CLOSED" |
| `record.ci === null` | **need `O2`** |
| CI rule (§5.4) fails | 7b → rows 9/10/11, `refused` |
| `mergeable` / `mergeStateStatus` / `number` unreadable | 7c → row 11a, `refused` |
| `mergeable === "UNKNOWN"` and `o1Count <= retries` | **need `O1`**, `waitMs = delay × 1000` |
| `mergeable === "UNKNOWN"` (retries exhausted) | row 13, `deferred` |
| `mergeable === "CONFLICTING"` or `mergeStateStatus ∈ {DIRTY, BLOCKED}` | row 12, `deferred` |
| `record.o3 === null` | **need `O3`** |
| `!record.o3.ok` | 7d → `refused` |
| `record.o3.unresolved > 0` | row 14, `deferred`, "N unresolved review thread(s)" |
| `record.o4 === null` | **need `O4`** |
| `!record.o4.ok` | 7e → row 15, `refused` |
| `mergeCandidates(...)` is empty | row 16, `deferred`, "no permitted merge method" |
| an untried candidate remains | **act** with it |
| the last attempt succeeded | row 18, `merged` + `mergeSha` + `mergeMethod` |
| every candidate attempted and failed | row 17, `deferred`, reason naming each attempt |

`PHASE_MERGE_ENABLED` (row 1) is **not** in this table: it is checked in `phaseMerge` before the
config is read (§3.3), so the core never sees a disabled run. That is the one row the core does not
own, and it is stated here so the omission reads as a decision rather than a gap.

**Positional tie-break (FSPEC §2.3, Q-01).** The table above *is* the tie-break: 7b precedes 7c, so
`CI pending` + `mergeable: CONFLICTING` reports `refused`; 7a precedes 7b, so `CLOSED` + `CI failed`
reports `deferred`. No class-based re-sort exists anywhere in the code, and §13.2 asserts both pairs.

### 5.4 The CI rule

Pure, inlined as a two-line table lookup over `(record.ci, config.mergeRequiresCi)` exactly as
FSPEC §5 states it. Only `("none", true)` escalates; `pending`, `failed` and `unknown` are `refused`
with a reason line and no escalation, under both settings. `mergeRequiresCi: false` relaxes exactly
the one cell — expressed as a single `if (ci === "none") return requiresCi ? refuse : pass;` so no
future edit can accidentally widen it to `pending`.

### 5.5 The already-merged path, and `O4` for the branch name (SE-v3 advisory / TE-v3 N-02)

FSPEC §2.2 row 5 short-circuits the guard, the remaining preconditions and the merge attempt. But M3
(§7.4) needs a default-branch name, and after v1.2 the **only** source of that name is
`O4.defaultBranchRef.name` — which 7e would have observed and row 5 never reaches. The carried rider
asks the TSPEC to resolve this. **Decision: row 5 observes `O4`, and only for the name.**

```
row 5 reached ⇒ if (record.o4 === null) need "O4";
               resolve row 3-of-§11 (merged, method "unknown", sha = o1.mergeCommitOid ?? null),
               carrying defaultBranch = record.o4.ok ? record.o4.defaultBranch : null
```

Three properties make this safe rather than a widening of row 5:

1. **It is an observation, not a precondition.** `!record.o4.ok` on this path does **not** refuse —
   the resolution is still `merged`. It only leaves `defaultBranch === null`, which makes M3
   unperformable and produces §11 row 22's escalation with the reason "default branch name
   unavailable". Row 5's terminal value is unchanged for every input.
2. **No guard is evaluated and no merge is attempted**, so FSPEC §2.5's "zero merges, no guard"
   still holds literally, and NFR-2 is untouched — `O4` is a read.
3. It is the cheapest of the two options the rider names; the alternative (narrowing row 22 off the
   already-merged path) would leave AT-M2a's recovery run reporting an un-updated working tree
   permanently, which the reviewer judged "probably not the intent". Recorded here because it is the
   one place this TSPEC extends the FSPEC's control flow rather than transcribing it.

### 5.6 Merge candidates

`mergeCandidates(caps, config)` is pure and builds the chain **before any attempt** (FSPEC §6.1):
`rebase` if `caps.rebase`, then `merge` if `caps.mergeCommit`, then — only when
`config.allowSquashMerge === true` — `squash` if `caps.squash`. Squash is otherwise **absent from the
array**, not skipped at attempt time, so no code path can issue `gh pr merge --squash` with the
shipped configuration. An empty chain is row 16 (`deferred`, "no permitted merge method"), textually
distinct from row 17's exhaustion reason.

## 6. The self-modification guard

Implements FSPEC §4 and NFR-3.

### 6.1 `effectiveGuardPaths(configured)` — additive by construction

```js
export function effectiveGuardPaths(configured) {
  const extra = Array.isArray(configured) ? configured : [];
  const norm = (p) => (p.endsWith("/") ? p : `${p}/`);
  return [...new Set([...MERGE_GUARD_DEFAULTS, ...extra.filter(isNonEmptyString).map(norm)])];
}
```

The defaults are **first and unconditional**: there is no code path that filters, subtracts or
re-orders them, and `MERGE_GUARD_DEFAULTS` is `Object.freeze`d so a caller cannot mutate the source
array either. A configuration listing fewer paths, none, or a path that looks like a removal (a
`"!"`-prefixed string, say) is simply unioned — the `"!pdlc/workflows/"` entry becomes a guard path
that matches nothing, which is the FSPEC's "silently unioned, no warning, no error, no report line".

Trailing-slash normalisation is applied to configured paths only; defaults already carry it. So
`src/pipeline` and `src/pipeline/` are the same guard path and neither matches `src/pipeline-notes/`.

### 6.2 `guardVerdict(changed, guardPaths)` — the pure decision

```js
export function guardVerdict(changed, guardPaths) {
  if (!changed || changed.ok !== true)
    return { fired: true, kind: "unretrievable", matched: [] };            // FSPEC §4.4
  const matched = changed.files.filter((p) => guardPaths.some((g) => p.startsWith(g)));
  return { fired: matched.length > 0, kind: matched.length ? "match" : "clear", matched };
}
```

`String.prototype.startsWith` on repo-relative paths **is** FSPEC §4.2's semantics: case-sensitive,
`/`-delimited (because every guard path ends in `/`), position-0 anchored, no globbing, no
normalisation, no case folding. The five-row near-miss table of §4.2 falls out of it directly, and
§13.2 asserts all five plus the two positive rows. No regex is used anywhere in the guard — a regex
would reintroduce metacharacter semantics the FSPEC excludes.

`matched` preserves the observed order and every match is reported (FSPEC §4.5), so the escalation
delimits the operator's review scope. Deletions and renames need no special handling: they are paths
in the observed list, and `O5`'s fallback adds `previous_filename` where the surface supplies it
(§4.6) — the phase synthesises nothing.

### 6.3 Fail-closed, and the absence of an override (NFR-3)

`ok !== true` fires the guard before any list is inspected, so command failure, unparseable output,
an absent `files` field and an incomplete list all fire it (FSPEC §4.4). `kind` selects which of the
two §9.3 lines is emitted; the phase resolves `refused` at §11 row 4 (`match`) or row 5
(`unretrievable`).

**There is no override.** `guardVerdict` takes exactly two arguments, neither of which can disable
it; `config` is not in scope in the guard branch of `decideMerge`; and no `force`, `skip`, `bypass`
or `override` token appears in any of the new code. §13.2 encodes that as a *source scan* over the
new production symbols, so adding an override in future turns a test red rather than passing review.

### 6.4 AC-3.5 — the guard-falsifiability test design

FSPEC AT-M3 requires two arms that differ in exactly one guard-matching path and produce **opposite
positive terminal values**. Implemented at two levels, both of which a guard-deleting mutant reds:

| Level | Fixture | Assertion |
|---|---|---|
| Pure | `guardVerdict({ok:true,files:[...]}, defaults)` for each arm | `fired` is `false` / `true`, and `matched` is exactly `["pdlc/skills/x.md"]` on the second |
| Integration (AT-M3) | one `phaseMerge` fixture whose every other precondition passes, run twice with the two file lists | arm A: `mergeStatus === "merged"`, `row === 18`, and **no** notice starting `MERGE ESCALATION: `; arm B: `mergeStatus === "refused"`, `row === 4`, and the exact escalation line |

The mutant analysis, stated so the reviewer can check it rather than trust it: a guard that always
returns `fired: false` reds arm B (it would merge); a guard that always returns `fired: true` reds
arm A (it would refuse); a guard deleted entirely reds arm B. Only a correct guard passes both.
The three near-miss lists (`pdlc/skills-notes/x.md`, `docs/pdlc/skills/x.md`, `PDLC/Skills/x.md`)
each reproduce arm A **exactly** — same row, same status, same empty escalation set — which is what
makes a substring, case-insensitive or unanchored implementation red instead of merely unasserted.

## 7. Merge execution and the post-merge sequence M1–M5 (O-M8)

Implements FSPEC §6.2–§6.4 and §8. M1 is `decideMerge`'s `act` branch (§5.2); M2–M4 run in
`phaseMerge` after the core resolves `merged`; M5 belongs to the queue driver (§9).

### 7.1 The order is a straight-line sequence, not a scheduler

```js
// reached only when resolution.mergeStatus === "merged"
if (config.deleteBranchOnPdlcMerge) { const d = await deleteRemoteBranch(…); if (!d.ok) notes.push(…); }  // M2
const tree = await updateDefaultBranch({ defaultBranch, mergeSha, _git });                                 // M3
if (!tree.ok) escalations.push(`MERGE ESCALATION: working tree not updated after merging ${prUrl} — ${tree.reason}; tree is on ${tree.branch}`);
const rec = await _recordQueueRow({ feature, status: "done", evidence });                                  // M4
```

M3 **precedes** M4 (FSPEC §8.2, F-14) and a failed M3 does **not** cancel M4 (FSPEC §8.3) — the write
runs on whichever branch `HEAD` is left on. `mergeStatus` stays `merged` through every one of these
failures; none of them may downgrade it, which §13.2 asserts directly rather than by inspection.

### 7.2 M2 — remote branch deletion

`deleteRemoteBranch({ feature, _git })` runs one command through the existing git seam:
`git push origin --delete feat-{feature}` (`featureBranchName`, `orchestrate-dev.js:211`). The
**local** branch is never touched, in either configuration (FSPEC §6.4). A failure yields a plain
note, never an escalation, and never changes `mergeStatus`. `deleteBranchOnPdlcMerge: false` issues no
command at all; GitHub's own `deleteBranchOnMerge` (read by `O4`) is reported and never acted on.

### 7.3 `evidenceCellFor(mergeSha, prNumber)`

```js
export function evidenceCellFor(mergeSha, prNumber) {
  return typeof mergeSha === "string" && mergeSha.length >= 7
    ? `${mergeSha.slice(0, 7)} #${prNumber}`
    : `merged #${prNumber}`;
}
```

A **fixed 7-character truncation** of the full oid, never `git rev-parse --short` (FSPEC §6.2): the
cell is then a pure function of the observed value and an assertion on it cannot flake on repository
size. `merged` is a literal token, never a SHA-shaped placeholder. The full oid is what
`mergeSha` reports; only this cell is truncated.

### 7.4 M3 — `updateDefaultBranch`, the command sequence (O-M8)

Every command goes through the injected `_git(argv)` seam (`defaultGit`, `:4252`), whose contract is
`{ ok, stdout, stderr }` and which never throws — so each step below is a plain `if (!r.ok)` and
there is no `try/catch` in this function. `argv` arrays, never command strings (a branch name is
untrusted input at the seam boundary).

| # | Command (`argv`) | On `!ok` |
|---|---|---|
| 0 | — | `defaultBranch == null` ⇒ return `{ ok: false, reason: "default branch name unavailable" }` before any command (§5.5) |
| 1 | `["status", "--porcelain"]` | fail; and a **non-empty stdout** is also a failure: `reason: "working tree is dirty"` — nothing is checked out over uncommitted work |
| 2 | `["fetch", "origin", defaultBranch]` | `reason: "git fetch failed: {firstLine(stderr)}"` |
| 3 | `["rev-parse", "--verify", "--quiet", "refs/heads/" + defaultBranch]` | not a failure — `!ok` simply means the local branch does not exist yet |
| 4a | branch absent: `["checkout", "-B", defaultBranch, "FETCH_HEAD"]` | `reason: "checkout failed: …"` |
| 4b | branch present: `["checkout", defaultBranch]` | `reason: "checkout failed: …"` |
| 5 | branch present only: `["rebase", "--empty=drop", "FETCH_HEAD"]` | run `["rebase", "--abort"]` (result ignored) and return `reason: "replay of local queue-row commits onto {defaultBranch} conflicted: …"` |
| 6 | `["merge-base", "--is-ancestor", mergeSha ?? "FETCH_HEAD", "HEAD"]` | `reason: "merge commit is not an ancestor of HEAD after update"` |

Then `{ ok: true, branch: defaultBranch }`. On any failure the function additionally runs
`["rev-parse", "--abbrev-ref", "HEAD"]` to report **where the tree actually is** (`branch`), falling
back to `"unknown"` — the escalation names the branch the operator must deal with, so it cannot be
the branch the step *intended* to reach.

**Why one `rebase` covers both of FSPEC §8.3's bullets.** When the local default branch has no
commits the remote lacks, `git rebase FETCH_HEAD` fast-forwards — the ordinary case. When M4/M5 of an
earlier run left local queue-row commits on top, the same command replays them onto the fetched tip.
Two commands would have to agree about which case they are in; one command cannot disagree with
itself.

**How an already-upstream commit is detected as empty.** `git rebase` computes patch-ids and drops a
commit whose change is already present upstream — the exact case of a queue-row commit that reached
the remote inside a later feature's PR. `--empty=drop` is passed **explicitly** rather than relying on
the backend default, so the behaviour does not depend on which rebase backend the operator's git
selects. This requires **git ≥ 2.26** (`--empty` on non-interactive rebase); recorded in §12 as the
one new platform assumption, per DC-02, to be measured on both CI platforms rather than assumed.

**Failure detection is exit-status only.** No stdout of these commands is parsed for meaning; step 6
is the positive confirmation that the sequence achieved its purpose, and it is the step that turns a
silently-wrong outcome (checked out, but not containing the merge) into a reported one.

### 7.5 M4 — the queue write-back call

One call, always, on the `merged` path — including §11 row 3's already-merged path, which is what
makes AC-5.2's recovery idempotent:

```js
const rec = await _recordQueueRow({ feature, status: "done", evidence: evidenceCellFor(mergeSha, prNumber) });
```

`rec.queueRow` becomes the outcome's `queueRow` (§10.1). `"error"` — the row is absent — pushes the
AC-5.2 escalation; `"recorded (uncommitted)"` pushes a plain note; `"none"` and `"recorded"` are
silent (FSPEC §7.4). The `pending`/`blocked`/`halted` non-overwrite case is decided **inside**
`updateQueueStatus` (§8.4), reported as `"recorded"` with a detail naming the status found, and
surfaces as a plain note here — so `orchestrate-dev` still never learns the queue's grammar.

## 8. The recording seam and the queue write-back (O-M1, O-M2)

Implements FSPEC §7 and discharges O-M1 and the second half of O-M2. **One channel, extended — not
duplicated** (FSPEC §7.4): the four touch points below are the shipped ones, and no fifth path to
`QUEUE.md` is created.

### 8.1 The four touch points

| # | Site | Today | After |
|---|---|---|---|
| 1 | `main()`'s seam declaration, `orchestrate-dev.js:4321` | `_recordHalt: recordHaltFn = defaultRecordHalt` | `_recordQueueRow: recordQueueRowFn = defaultRecordQueueRow` |
| 2 | default implementation, `:4286` | `defaultRecordHalt` → `{ queueRow: "none" }` | renamed `defaultRecordQueueRow`, body unchanged |
| 3 | `QUEUE_ENTRY` closure, `build-runtime.mjs:182` | `_recordHalt: async ({feature,status}) => __queue.rewriteStatus(…, 6 args)` | `_recordQueueRow: async ({feature,status,evidence}) => __queue.rewriteStatus(…, evidence)` |
| 4 | `DEV_ENTRY` closure, `build-runtime.mjs:212` | same, at `DEFAULT_QUEUE_PATH` | same change |
| 5 | shared row transform, `orchestrate-queue.js:331` | `updateQueueStatus(md, feature, status)` | 4th parameter `evidence = null` |

### 8.2 O-M1 — the disposition catalogue migration

The shipped catalogue `"halted" | "halted (uncommitted)" | "none" | "error"` is a *disposition* named
after the only status it ever wrote. It becomes
**`"recorded" | "recorded (uncommitted)" | "none" | "error"`** — same four members, same meanings.

| Role | Site | Change |
|---|---|---|
| Producer | `commitQueueRow`, `orchestrate-queue.js:946` and `:956` | `return { queueRow: "recorded" }` |
| Producer | `uncommitted`, `:967` | `queueRow: "recorded (uncommitted)"` |
| Producer | `rewriteStatus`, `:889` / `:900` | `"none"` / `"error"` unchanged |
| Producer | `defaultRecordQueueRow`, `orchestrate-dev.js:4286` | `"none"` unchanged |
| Reader | `main()`'s halt path, `orchestrate-dev.js:5162`–`:5175` | reads the value opaquely — pushes `Queue row {queueRow}: {detail}`; **no code change**, but its output text changes from `Queue row halted (uncommitted): …` to `Queue row recorded (uncommitted): …` |
| Reader | `buildFinalReport`, `:5294` | pass-through, no change |
| Reader | `haltAndQueue.test.js:831`, `:837`, `:857`, `:860` | assertions updated to the new members (§13.4) |
| Doc | `rewriteStatus` docblock, `:872` | catalogue restated, plus the new `evidence` parameter |
| New | `QUEUE_ROW_DISPOSITIONS` frozen array in `orchestrate-queue.js` | DC-01 — the catalogue exists as a value tests can enumerate, not only as prose |

A repo-wide search for the two retiring literals confirms there is **no other production reader**:
the only occurrences of `"halted (uncommitted)"` outside tests are the producer at `:970` and the
docblock at `:872`. The word `halted` survives everywhere it means *a status* (`QUEUE_STATUSES:74`,
`runPicked`'s `newStatus`, the halt commit message) — only the *disposition* vocabulary moves.

**The seam is renamed** (O-M1 asks explicitly). `_recordHalt` writing a `done` row is a name that
lies, and the same rename motivation as the catalogue's applies. The rename has one non-obvious
cost, stated so it is reviewed rather than discovered: `runtimeBundle.test.js:1038`'s
`RLH-AT-64: _recordHalt is wired, not exempt` **opens with `if (!recordHalt) return;`**, so a rename
that does not update the test makes it silently vacuous rather than red. §13.4 makes updating that
test a named task, and the updated test additionally asserts that a seam by the old name is *not*
present, so the vacuity trap cannot be re-entered.

### 8.3 `rewriteStatus`'s new parameter

```js
export async function rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn, gitFn = defaultGit, evidence = null)
```

**Appended, positional, defaulted `null`.** Appending is what keeps the five existing call sites
(`runPicked`'s three, and both entrypoint closures) byte-identical in behaviour; a reshuffle into an
options object would touch every one of them and the bundle closures for no behavioural gain. The
`evidence` value is an opaque string to this function — it is *placed*, never parsed.

### 8.4 `updateQueueStatus`'s new parameter, and the byte-identity property

```js
export function updateQueueStatus(markdown, feature, newStatus, evidence = null)
```

Control flow:

1. `evidence == null` → **exactly today's code path**, character for character: column resolution,
   row match, `newCells[statusCol] = newStatus`, `| ${newCells.join(" | ")} |`. No migration, no
   sixth cell, no re-emission of any other row. This is FSPEC §7.4's required property — an
   evidence-free call produces today's bytes for the `in-progress` / `awaiting-merge` / `halted`
   writes — and §13.2 pins it as a **differential test** against a frozen expected output, not as a
   claim.
2. `evidence != null` →
   a. `ensureEvidenceColumn(markdown)` first (§8.5);
   b. locate the target row by feature, as today;
   c. **the §2.5 non-overwrite rule**: if the row's current status is not one of
      `in-progress` / `awaiting-merge` / `done`, return
      `{ markdown, matched: true, written: false, foundStatus }` — the file is unchanged and the
      caller reports `"recorded"` with a note naming the status found (FSPEC §2.5, §11 row 18's
      exception). This lives here, with the table grammar, not in `orchestrate-dev`;
   d. otherwise set the status cell to `newStatus` and the evidence cell to
      `mergeEvidenceCell(existingCell, evidence)`;
   e. re-emit the row canonically.

`rewriteStatus` skips the write and the commit entirely when `written === false`, so a non-overwrite
case touches neither disk nor git.

### 8.5 The two new pure helpers

**`ensureEvidenceColumn(markdown) => { markdown, migrated }`** — FSPEC §7.3's exactly three
structural changes, and no fourth:

1. header row (the row whose cells include `status` and one containing `feature`): append
   `` ` Evidence ` ``. If a cell already contains `evidence`, return `{ markdown, migrated: false }`
   — an already-migrated queue is never migrated twice;
2. the **separator row** immediately following it: append one `---` cell (recognised as "every cell
   is a dash run or empty", the same predicate `parseQueue:145` and `updateQueueStatus:357` already
   use);
3. every other data row: append **one empty cell**.

Rows that are not part of the table (prose, blank lines, anything not starting with `|`) are
untouched, and no other cell of any row is rewritten. `Evidence` is safe against the header lookup:
`parseQueue`'s `colIndex` resolves columns by substring over `order`/`#`, `status`, `feature`,
`req path`/`req`/`path`, `depends`/`deps`, and `evidence` contains none of those tokens — verified
against `orchestrate-queue.js:133`–`:137`. A sixth cell therefore round-trips unchanged.

**`mergeEvidenceCell(prev, next) => string`** — FSPEC §7.2's no-downgrade rule:
if `prev` is a non-empty string and `next` matches `/^merged #/`, return `prev`; otherwise return
`next`. So a cell already holding `abc1234 #42` is never downgraded to `merged #42` by a re-entry
that could not resolve the oid, while a real SHA always wins over a placeholder.

**Idempotence, honestly scoped.** Byte-identity on re-entry holds for rows already in the canonical
`| a | b |` form — what this transform emits and what this repo's `QUEUE.md` uses. A consumer queue
with column-aligned padding is re-emitted canonically on the first write to that row and produces a
real commit; the guarantee is **no semantic change** (FSPEC §7.4). `commitQueueRow`'s
`nothing to commit` branch (`:953`) already makes the no-change case silent and non-faulty.

## 9. The queue driver's post-pipeline transition

Implements FSPEC §7.5 and §9.5. Three edits, all in `orchestrate-queue.js`, none of them structural.

### 9.1 `runPicked`'s status derivation (`:818`–`:836`)

```js
const succeeded = report && report.outcome === "success";
const merged = succeeded && report.mergeStatus === "merged";        // NEW
const newStatus = merged ? "done" : succeeded ? "awaiting-merge" : "halted";
await rewriteStatus(queuePath, entry.feature, newStatus, readFileFn, writeFileFn, gitFn);
```

The driver still **always writes something** — the change is only that its value now derives from
`mergeStatus` as well as `outcome` (FSPEC §7.5). It passes **no evidence**: Phase MERGE already wrote
the `Evidence` cell at M4, and a second writer for the same cell is exactly the divergence FSPEC §7.4
forbids. Writing `done` over `done` is idempotent and produces no commit (`:953`).

`report.mergeStatus` is read defensively — a pipeline report without the field (an older bundle, a
throw-path stub) is `undefined`, which is not `"merged"`, so the driver falls back to today's
behaviour. Fail-safe direction: the failure mode is "left `awaiting-merge`", never "wrongly `done`".

### 9.2 The operator message (`:829`–`:833`)

| Case | Message |
|---|---|
| `merged` | `` `"${feature}" complete and merged (${report.mergeSha ?? "sha unknown"}) — status set to done.` `` |
| `succeeded`, not merged | unchanged: `…complete — status set to awaiting-merge. Merge the PR, then set it to done to unblock dependents.` |
| halted | unchanged |

The "merge the PR, then set it to done" sentence is **not emitted** on the merged path (AT-M4). It is
suppressed by branching, not by string surgery, so a test can assert its absence by substring and no
partial variant survives.

### 9.3 `buildQueueReport` pass-through (`:994`)

**No change is required.** `pipelineReport` is already carried whole (`:1010`), so `mergeStatus`,
`mergeSha`, `mergeMethod` and every `MERGE ESCALATION: ` notice inside `report.notices` are visible
from the queue's run report the moment `orchestrate-dev` puts them there (FSPEC §9.5). §13.2 asserts
the pass-through positively anyway — a future `buildQueueReport` that projected selected fields would
silently drop the escalations, and this is the assertion that would catch it.

### 9.4 What does **not** change

`QUEUE_STATUSES` (`:74`) already contains `done`; `parseQueue` already ignores unrecognised columns;
`selectNextPending` (`:382`) already selects on `status === "pending"` and treats `done` as terminal;
`precheckDependencies` (`:429`) already compares the lowercased status by exact string. So AC-6.3's
end-to-end effect — the dependent becomes selectable the moment the row reads `done` — needs **no
queue-selection change at all**, only the write. That is why FSPEC §7.2 forbids decorating the status
cell: `done (abc1234)` would fail every one of those exact-string comparisons.

## 10. Reporting — report fields, notices, phase row

Implements FSPEC §9.

### 10.1 `buildFinalReport` (`orchestrate-dev.js:5281`) gains three always-present fields

```js
mergeStatus = "skipped", mergeSha = null, mergeMethod = null
```

Declared as **defaulted parameters and emitted unconditionally**, alongside `queueRow`,
`postmortemStatus` and `haltPhase` — not conditionally spread like `prUrl`/`ciStatus` (`:5314`). The
reason is the one already recorded at `:5308`: a conditionally-spread field cannot express "no merge
was considered", which is exactly what §11 row 23 (a run that halted before Phase MERGE) must report.
Both call sites pass them; the halt path (`:5188`) passes the defaults, giving row 23's
`mergeStatus: "skipped"` with no code at the halt site beyond the literal.

`queueRow`'s success-path value changes from the hardcoded `"none"` (`:5213`) to
`mergeOutcome.queueRow ?? "none"` — carrying the §7.4 disposition on a `merged` run and `"none"`
everywhere else (FSPEC §9.1's fourth field). The halt path's `queueRow` is untouched.

`prUrl` and `ciStatus` keep Phase PUB's values; the merge-time CI evidence is **not** re-reported as
`ciStatus` (FSPEC §5).

### 10.2 Notices and escalations

`main()` already owns a `notices` array (`:4386`) whose entries reach the report verbatim. Phase
MERGE contributes to it in one place, in FSPEC §9.3's table order:

```js
for (const line of merge.escalations) notices.push(line);   // already prefixed
for (const note of merge.notes) notices.push(note);
```

Ordering within `merge.escalations` is fixed by `phaseMerge`'s straight-line construction: guard, CI,
queue-write, tree-update — the §9.3 table order, because that is the order the code that produces
them runs in. Accumulation is therefore structural, and AT-M6 (rows 20 + 22 together) asserts both
lines and their order.

The `MERGE ESCALATION: ` prefix is applied **once**, at the construction site of each of the four
lines, and the four templates live in one frozen object `MERGE_ESCALATIONS` so the prefix cannot
drift and the catalogue is enumerable by tests (DC-01).

The §9.4 merge-deferred note — one plain line, emitted for `deferred` and `refused` only, never for
`skipped`, `merged` or a run that never reached the phase — is produced by `phaseMerge` from the same
`reason` string that rides the phase row, so the two cannot disagree.

### 10.3 The phase row

```js
recordPhase("MERGE", "Merge PR", glyph, detail)
```

`glyph` is `✅` for `merged`, `⏭` for `skipped`, `⚠️` for `deferred` and `refused` (FSPEC §2.1).
`detail` is the one-line reason, or for a merge `` `Merged ${prUrl} (${mergeMethod}, ${shortSha})` ``.
Never `❌`: `main()`'s halt path derives the failed phase from the recorded rows
(`const failedRow = […].reverse().find(r => r.status === "❌")`, `:5158`), so a `❌` here would make a
non-merge look like the halting phase. This is the second structural reason Phase MERGE never halts,
and it is worth stating because it is invisible from the FSPEC.

### 10.4 The wiring in `main()`

Placed immediately after the Phase PUB block (`:5115`), inside the same `pipelineFn` body so it is
covered by the same guarded try (`:5117`) — and reaching that catch is precisely what §5.2's internal
`try/catch` prevents.

```js
const mergeOutcome = await phaseMerge({
  feature: featureName, prUrl,
  _observations: mergeObservationsFn, _git: gitFn, _readFile: readFileFn,
  _recordQueueRow: recordQueueRowFn, _log: emit, _now, _sleep,
  _enabled: phaseMergeEnabled,
});
```

`main()` gains exactly **two** new seam parameters:

| Seam | Default | RLH-AT-64 classification |
|---|---|---|
| `_phaseMergeEnabled` | `PHASE_MERGE_ENABLED` | **exempt**, E-1 module-level constant — identical in shape to `_phaseDodEnabled` (`:4313`), which ships green today |
| `_mergeObservations` | `defaultMergeObservations` | **wired**, in `rtDevInjections` (§11.3). Not exempt: E-3 resolves only for a default function declaring `_agent` (`runtimeBundle.test.js:855`–`:857`), and this default is a frozen object of `execFn`-taking functions |

`phaseMerge` is deliberately **not** a `main()` seam. A `_phaseMerge = phaseMerge` parameter would be
neither wired nor E-3-exempt — `phaseMerge` declares no `_agent`, and it must not (NFR-4: no new
reasoning dispatch) — so RLH-AT-64 would red it. Tests reach `phaseMerge` through `main()` via the
seams above, and directly by importing it. Recorded because "add a seam for the new phase function"
is the obvious move and it is the wrong one here.

## 11. Runtime, bundle, and adapter changes

### 11.1 The await discipline

**Every injected IO call is `await`ed.** The adapter's implementations are async while the test
doubles are sync, so a missing `await` is green in jest and broken in production. The rule is
machine-enforced: `runtimeBundle.test.js`'s `RLH-SCAN-01` scan (`:577`) classifies every seam call
site in both modules and fails on any that is neither awaited nor covered by a §8.5 ruling. New await
sites, exhaustively: `_readFile` (§3.2), the six observation calls (§5.2), `_sleep` (§5.2),
`_git` × up to 7 (§7.4), `_recordQueueRow` (§7.5), `phaseMerge` itself (§10.4).

`decideMerge`, `guardVerdict`, `mergeCandidates`, `parseMergeConfig`, `effectiveGuardPaths`,
`evidenceCellFor`, `ensureEvidenceColumn` and `mergeEvidenceCell` are synchronous by design — a pure
function that returns a promise is a seam waiting to be forgotten.

### 11.2 `build-runtime.mjs`

| Site | Change |
|---|---|
| `devModule` `exportedNames`, `:87`–`:94` | no addition required — the entrypoints reach only `main`/`meta`; the new functions live inside the IIFE. **Except** `defaultMergeObservations`, which the adapter's `rtMergeObservations` wraps: add it, plus `checkPrCi` is already there |
| `queueModule` `exportedNames`, `:101` | unchanged — `rewriteStatus` and `updateQueueStatus` are already published |
| `QUEUE_ENTRY`, `:182` | `_recordHalt` → `_recordQueueRow`, and the closure forwards `evidence` as `rewriteStatus`'s 7th argument |
| `DEV_ENTRY`, `:212` | same two changes |
| `DEV_META.phases`, `:146`–`:157` | append `{ title: "Phase MERGE", detail: "merge the PR + advance the queue row" }`. The bundle's `meta` is hand-written and dead-copies the module's (`:126`), so this is the only place the operator-visible phase list can be updated |

**Rebuild in the same commit.** `node pdlc/workflows/build-runtime.mjs` regenerates the three tracked
artifacts under `pdlc/workflows/dist/` plus `distribution-manifest.json`; CI's *Generated artifacts
are in sync* job runs `--check` and then a rebuild that must produce no diff. A source change without
the rebuild is a red PR, not a follow-up.

### 11.3 `runtime-adapter.js`

One new function and one new key. `rtMergeObservations(devModule)` returns the six-key object,
each entry an agent-transported command whose **parsing is delegated to the module's own classifier**
via a sync `execFn` closure — literally `rtMakeCheckCi`'s shape (`:838`–`:850`), which exists for
exactly this reason: the none/pending/passed/failed/unknown mapping stays in one place.

```js
const raw = await RT.agent(
  `Run exactly: {command}\n` +
  `Return ONLY the raw JSON it prints — no commentary, no code fences.\n` +
  `If the command fails, return exactly: ${RT_MISSING}\n` +
  `Do not retry, do not repair, and do not run any other command.`,
  { label: `merge:{surface}`, model: RT_IO_MODEL });
return devModule.observeX(prUrl, { execFn: () => raw });     // one place parses
```

The final prompt line is **not decoration**. `rtGit` (`:927`) and `rtMergeWorktree` (`:954`) already
carry it; for `O6` it is load-bearing: an agent that "helpfully" retried `gh pr merge` after a
transport hiccup would attempt a second merge, which NFR-2 forbids. The `O6` prompt additionally
states that the command is a mutation and must be issued at most once.

Does the existing adapter already cover these shapes? **`git` yes, `gh` no.** `rtGit` covers every
argv in §7.4 unchanged. `gh` is reachable today only through `rtMakeCheckCi`'s single hard-coded
`gh pr view … --json statusCheckRollup` string, so the five other `gh` shapes (`gh pr view --json
state,…`, `gh api graphql`, `gh repo view --json`, `gh api --paginate --slurp`, `gh pr merge`) are
genuinely new adapter commands and are enumerated as a frozen catalogue in the adapter, one entry per
surface, with no string interpolation beyond `prUrl`, `owner`, `repo`, `number` and `cursor`.

`rtDevInjections` (`:980`) gains `_mergeObservations: rtMergeObservations(devModule)`. `_recordHalt`
stays deliberately absent (its comment at `:1004` explains why) and is renamed in that comment to
`_recordQueueRow`.

### 11.4 The runtime's structural constraints

Nothing in this feature introduces `process.`, `fetch(`, a static `import`, a second `export`, or a
`meta` that is not the first statement — the four things `runtimeBundle.test.js` (`:461`–`:485`,
`:938`) asserts. The dynamic `import("child_process")` inside `ghJson`'s default `execFn` follows the
existing precedent (`checkPrCi:3486`, `defaultGit:4253`): the bundle never evaluates it because the
adapter always supplies `execFn`, and the scan's "leaves dynamic imports alone" ruling (`:454`)
already covers that shape.

### 11.5 Pacing and dispatch budget

Phase MERGE adds **no agent dispatch of any kind** (NFR-4) — every agent turn it causes is an
adapter-mediated mechanical IO turn that already exists as a class. The 180-second no-progress
watchdog therefore has no new authoring dispatch to threaten, and the `PACING_CONTRACT_CLAUSE`
(`:2556`) is not extended. The only new *latency* is §3.3's config read and §4.3's retry waits, both
bounded and both injectable to zero in tests.

## 12. Error handling catalogue

Every failure scenario, its detection, and its behaviour. **No row halts the pipeline** — that is the
whole of FSPEC §2.1, and the rows below are the enumeration behind the claim.

| # | Failure | Detected by | Behaviour |
|---|---|---|---|
| E1 | Config file absent / unreadable | `readMergeConfigSafely` → `null` | all defaults; `mergeMode: "off"` ⇒ `skipped`, silent |
| E2 | Config not JSON, or not an object | `parseMergeConfig` `try/catch` | as E1, silent |
| E3 | `merge` section present but not an object | `parseMergeConfig` step 3 | defaults + one plain note (suppressed on row 1 by construction, §3.3) |
| E4 | One config key wrong type / value | per-key validator | that key defaults; the others honoured; silent |
| E5 | `_readFile` throws | `readMergeConfigSafely`'s `try/catch` | treated as E1 |
| E6 | `gh` binary missing / not authenticated | `ghJson` `catch` → `{ok:false,"command-failed"}` | the observation is `unknown`; §3.2's fail-closed row applies to that surface |
| E7 | `gh` prints non-JSON (a login prompt, a warning banner) | `JSON.parse` throws → `"unparseable"` | as E6 |
| E8 | `O1.state` unrecognised | `classifyPrState` | row 4, `refused`, **no** escalation |
| E9 | `O1.mergeable`/`mergeStateStatus`/`number` unrecognised | sentinel + 7c | row 11a, `refused` |
| E10 | `mergeable: UNKNOWN` persists | retry loop exhausted | row 13, `deferred`, reason interpolates `o1Count` |
| E11 | Re-read fails mid-retry | `!ok` ends the loop | row 11a, `refused` — never a retry-worthy `UNKNOWN` |
| E12 | CI rollup unretrievable | `checkPrCi` → `"unknown"` | row 11, `refused`, no escalation |
| E13 | No checks, `mergeRequiresCi` | §5.4 | row 9, `refused` + escalation |
| E14 | `prUrl` malformed ⇒ no owner/repo/number | `parsePrRef` → `null` | `O3` and `O5`'s fallback are `unknown`; guard fires (row 5) or 7d refuses, per §4.6 |
| E15 | `O3` exceeds `MERGE_MAX_THREAD_PAGES` | page counter | `{ok:false}` ⇒ 7d `refused` |
| E16 | `O5` list truncated / paginated | §4.6 completeness rule | fallback; still incomplete ⇒ guard **fires**, row 5 + escalation |
| E17 | `O4` unretrievable | `classifyRepoCaps` | row 15, `refused` (AC-2.5a) |
| E18 | Repository forbids every permitted method | empty chain | row 16, `deferred`, "no permitted merge method" |
| E19 | `gh pr merge` exits non-zero | `executeMerge` | that attempt fails; chain continues; all failed ⇒ row 17 `deferred` |
| E20 | `gh pr merge` exits zero but read-back is not `MERGED` | read-back check | treated as E19 — never report a merge not observed |
| E21 | Remote branch deletion fails | `deleteRemoteBranch` `!ok` | plain note; `mergeStatus` stays `merged` |
| E22 | Working tree dirty at M3 | `git status --porcelain` non-empty | escalation (row 22); `merged` stands; M4 still runs |
| E23 | Fetch / checkout / rebase fails at M3 | `!ok` per step; `rebase --abort` on step 5 | as E22, reason names the step |
| E24 | Merge commit not an ancestor after M3 | `merge-base --is-ancestor` | as E22 |
| E25 | Default branch name unavailable (row-5 path, `O4` unknown) | §5.5 | as E22, reason "default branch name unavailable" |
| E26 | No `QUEUE.md` | `rewriteStatus` → `"none"` | write-back skipped without error (AC-5.4); silent |
| E27 | `QUEUE.md` present, row absent | `"error"` | escalation (row 20); `merged` stands |
| E28 | Row written, `git` refuses | `"recorded (uncommitted)"` | plain note; **not** an escalation (FSPEC §7.4) |
| E29 | Row in `pending`/`blocked`/`halted` | §8.4 step 2c | file unchanged, plain note naming the status found |
| E30 | Anything in `phaseMerge` throws | its outer `try/catch` (§5.2) | `refused`, `row: "internal"`; the pipeline does **not** halt |
| E31 | Pipeline halts before Phase MERGE | phase never runs | report carries `mergeStatus: "skipped"` (row 23); the §9.4 note is not emitted |

**Two invariants the table encodes.** (1) `mergeStatus: merged` is never downgraded by any post-merge
failure — E21 through E29 all keep it. (2) Nothing that is only an *observation* failure mutates
anything: the sole mutating call is E19/E20's, reached only after every precondition passed.

## 13. Test strategy

Jest, run with `cd pdlc/workflows && npm test` (never bare `npx jest`). **No network, no `gh`, no
`git`, no filesystem, no clock in any test**: every interaction reaches production code through
`execFn`, `_git`, `_readFile`/`_writeFile`, `_recordQueueRow`, `_sleep` or `_now`, all injectable.

### 13.1 Test doubles

| Double | Shape | Replaces |
|---|---|---|
| `fakeExec(map)` | `(cmd) => map[matchKey(cmd)]`; throws for a key marked `fail` | `child_process.execSync` at every observation |
| `fakeObservations(overrides)` | `{...passingSix, ...overrides}` — a frozen "everything passes" baseline with per-surface override | `_mergeObservations` |
| `fakeGit(script)` | `(argv) => script[argv[0]] ?? {ok:true,stdout:"",stderr:""}`, recording every `argv` in order | `_git` |
| `fakeQueueFs()` | in-memory `{path: contents}` for `_readFile`/`_writeFile` | the filesystem |
| `recordingRecordQueueRow()` | captures `{feature,status,evidence}` calls, returns a scripted disposition | `_recordQueueRow` |
| `_sleep: async () => {}`, `_now: () => fixed` | — | the clock |

`fakeObservations`' passing baseline is the single most load-bearing fixture: every §11 row is that
baseline plus **one** override, which is what makes the row table a parameterised suite rather than
23 hand-built fixtures, and what makes "this row is caused by this input" a property of the test data.

### 13.2 New test files

| File | Covers |
|---|---|
| `__tests__/mergeDecision.test.js` | `decideMerge` — **FSPEC §11 rows 1–18 + 11a as one `it.each` over the row table**, asserting `{row, mergeStatus, queueWritten, escalated, reason}`; the two §2.3 tie-break pairs; short-circuit assertions (an override on a surface the run must not reach is never demanded); the demand loop's termination bound; §5.2's never-throws guarantee via a double that throws |
| `__tests__/mergeObservations.test.js` | `classify*` purely over raw strings — §3.2's whole table, one case per recognised value and per failure mode; `parsePrRef`; §3.3's observation counts for `mergeableRetries` ∈ {0,1,3} including the `after 1 observations` wording; `O3` pagination (1 page, 3 pages, over-bound); `O5`'s four completeness verdicts and the rename/deletion paths; `O6`'s zero-exit-but-not-merged case |
| `__tests__/mergeGuard.test.js` | §4.2's five near-miss rows and two positives; `effectiveGuardPaths` additivity (empty, absent, non-list, non-string members, a removal-shaped entry); the trailing-slash normalisation; **AT-M3 both arms** (§6.4); the no-override source scan |
| `__tests__/mergeQueueWriteback.test.js` | `ensureEvidenceColumn`, `mergeEvidenceCell`, `evidenceCellFor`; **AT-M1, AT-M2, AT-M2a**; §8.4's byte-identity differential (`updateQueueStatus` with no evidence vs a frozen golden); the §2.5 non-overwrite statuses; the disposition catalogue's four members |
| `__tests__/mergePhase.test.js` | `phaseMerge` and its wiring through `main()`: M1–M4 ordering asserted on `fakeGit`'s recorded argv sequence; rows 19–22 as composable annotations; **AT-M6**; report fields on success, on every non-merge, and on the halt path (row 23); the phase-row glyphs; `mergeStatus: merged` surviving E21–E29 |
| `__tests__/mergeQueueDriver.test.js` | `runPicked`'s `done` transition and message suppression (**AT-M4**); the `undefined mergeStatus` fallback; `buildQueueReport` pass-through of `mergeStatus`/`mergeSha`/escalations; **AT-M5** end-to-end selection, with the drift gate satisfied by `distribution.checkEnabled: false` so the assertion is about this feature and not about drift |

### 13.3 The §11 row table → parameterised test mapping

One `it.each` row per FSPEC §11 row, keyed by row number, each asserting the FSPEC table's own four
columns plus the reason line's subject. Fixture constraints stated in the file header so they cannot
be edited away:

- rows 1–2 assert that **no observation function was called at all** (the strongest form of "nothing
  later runs"), and row 1 additionally that `_readFile` was never called (§3.3);
- row 3 (already merged) asserts zero merge attempts, no guard evaluation, `mergeMethod: "unknown"`,
  and — per §5.5 — that `O4` **was** observed and no other precondition was;
- **row 11a's fixture keeps `O5` step 1 complete** (`files.length < 100`, parseable) so an unparseable
  `O1.number` cannot instead resolve at row 5 via the paginated fallback (TE-v3 N-01); the row-5
  fixture forces the fallback deliberately. Both constraints are asserted, not just documented;
- rows 19–22 are applied as annotation overlays **on top of** row 18's and row 3's fixtures, and one
  case applies all four at once to assert the subset property;
- row 23 is driven through `main()` with a halt injected before Phase PUB.

### 13.4 Superseded and updated existing tests

| Test | Change |
|---|---|
| `haltAndQueue.test.js:809` **`RLH-AT-32-orch`** | **Re-expressed, not removed** (FSPEC §7.5, F-13). Its assertion becomes "a successful direct run **that did not merge** records no status" — same three `not.toContain` assertions, plus `mergeStatus` pinned to a non-`merged` value in the fixture so the premise is explicit. A **sibling case** `RLH-AT-32-orch-merged` asserts that a successful direct run reporting `mergeStatus: "merged"` records `done` and reports `queueRow: "recorded"`. Deleting the original would lose an invariant that still holds on the majority path |
| `haltAndQueue.test.js:831`, `:837`, `:857`, `:860` | `"halted (uncommitted)"` → `"recorded (uncommitted)"`, `"halted"` → `"recorded"` (§8.2) |
| `orchestrateQueue.test.js` | `rewriteStatus`/`commitQueueRow` disposition assertions updated to the new catalogue; a new case asserts the 7-argument call with `evidence` and the 6-argument call without |
| `runtimeBundle.test.js:1038` | `_recordHalt` → `_recordQueueRow`, **plus** a new assertion that no seam named `_recordHalt` remains — closing the `if (!recordHalt) return;` vacuity trap (§8.2) |
| `runtimeBundle.test.js` RLH-AT-64 | passes unchanged for the two new seams by construction (§10.4); no edit expected, and if one is needed the classification in §10.4 is wrong and must be fixed rather than the test |
| `pipelineWiring.test.js`, `reportTemplates.test.js` | extended for the three new report fields being present on **every** report |

### 13.5 Property-based and mutation obligations

- **Property (guard).** For any file list and any configured path set, `guardVerdict` fires whenever
  some path has a shipped default as a prefix — the additivity property, checked over generated
  inputs rather than the five table rows alone.
- **Property (write-back idempotence).** Applying `updateQueueStatus(…, evidence)` twice to a
  canonical queue is a fixed point.
- **Property (no-evidence identity).** For every status in `QUEUE_STATUSES`, the no-evidence call is
  byte-identical to the shipped implementation's output on the same input.
- **Mutation targets** named for the DoD phase: the guard's `startsWith`, the §5.3 row order, the CI
  rule's single relaxed cell, and `evidenceCellFor`'s truncation length. Each has at least one test
  that a plausible mutant reds (§6.4 does this explicitly for the guard).

## 14. Requirements traceability

| REQ / FSPEC | Technical component | Tests |
|---|---|---|
| REQ-MERGE-01 / FSPEC §2 | `phaseMerge` + `decideMerge` (§5), wired at `main():5115` (§10.4) | `mergeDecision`, `mergePhase` |
| AC-1.2 / FSPEC §3.1 | `observePrState`, `observeCi`, `observeReviewThreads`, `observeRepoCaps`, `observeChangedFiles`, `executeMerge` (§4) | `mergeObservations` |
| AC-1.2a / FSPEC §3.3 | the retry demand in `decideMerge` + `_sleep` (§4.3) | `mergeObservations`, `mergeDecision` |
| AC-1.2b / FSPEC §3.2 | `classify*`'s shared `{ok:false,reason}` shape (§4.1) | `mergeObservations` |
| AC-1.3 | never-throws (§5.2) + `⚠️` glyph, never `❌` (§10.3) | `mergePhase` |
| AC-1.6 / FSPEC §2.2 | `decideMerge`'s ordered guard sequence (§5.3) | `mergeDecision` (row table) |
| REQ-MERGE-02 / FSPEC §6 | `mergeCandidates` (§5.6), `executeMerge` (§4.7) | `mergeObservations`, `mergeDecision` |
| AC-2.5a/b | `classifyRepoCaps` fail-closed; empty chain ⇒ row 16 | `mergeDecision` |
| AC-2.6 / 2.6a | `deleteRemoteBranch` (§7.2) | `mergePhase` |
| REQ-MERGE-03 / NFR-3 | `guardVerdict`, `effectiveGuardPaths` (§6) | `mergeGuard` |
| AC-3.4 | `ok !== true` ⇒ `fired` (§6.3) | `mergeGuard` |
| AC-3.5 | the two-arm design (§6.4) | `mergeGuard` (AT-M3) |
| AC-3.6 | `startsWith` semantics (§6.2) | `mergeGuard` |
| REQ-MERGE-04 / FSPEC §5 | the CI rule (§5.4), reusing `checkPrCi` | `mergeDecision` |
| REQ-MERGE-05 / FSPEC §7 | `rewriteStatus` + `updateQueueStatus` + the two helpers (§8) | `mergeQueueWriteback` |
| AC-5.2 | row-3 recovery + the queue-write escalation (§5.5, §10.2) | `mergeQueueWriteback` (AT-M2a) |
| AC-5.3 / Q-02 | `ensureEvidenceColumn` (§8.5) | `mergeQueueWriteback` (AT-M1) |
| AC-5.6 | `runPicked` (§9.1) | `mergeQueueDriver` (AT-M4) |
| AC-5.7 / FSPEC §8 | `updateDefaultBranch` (§7.4) | `mergePhase` |
| AC-5.8 | `nothing to commit` branch, untouched (§8.5) | `mergeQueueWriteback` (AT-M2) |
| REQ-MERGE-06 / FSPEC §9 | `buildFinalReport` fields + notices (§10) | `mergePhase`, `reportTemplates` |
| AC-6.3 | `buildQueueReport` pass-through (§9.3), no selection change (§9.4) | `mergeQueueDriver` (AT-M5) |
| REQ-MERGE-07 / FSPEC §10 | `parseMergeConfig`, `readMergeConfigSafely` (§3) | `mergeObservations` (config block) |
| NFR-1 / NFR-4 | raw-output-only transport; no agent decides (§4.1, §11.3, §11.5) | `mergeObservations`, adapter scan |
| NFR-2 | one mutating call, reachable from one branch (§4.7, §5.2) | `mergeDecision` |
| NFR-5 | row 5 / §11 row 3 (§5.5) | `mergeDecision`, `mergeQueueWriteback` |

## 15. Obligations discharged, risks, and the DECISIONS verdict

### 15.1 Obligations

| ID | Discharge |
|---|---|
| O-M1 | §8.2 — catalogue migrated to `recorded` / `recorded (uncommitted)` / `none` / `error`; every producer and reader named; the seam **is** renamed to `_recordQueueRow`, with the `runtimeBundle.test.js:1038` vacuity trap named and closed |
| O-M2 | §4 (six observation names, signatures, `{ execFn }` injection, the `_mergeObservations` seam) and §8.1/§8.3/§8.4 (the four touch points + the row transform, with the evidence-free byte-identity property pinned as a differential test) |
| O-M3 | §4.4 — the GraphQL query text, `-F`/`-f` typing, cursor pagination bounded at 10 pages fail-closed, `parsePrRef` plus the `O1.number` cross-check; `reviewDecision` appears nowhere |
| O-M4 | §4.6 — the four-verdict completeness procedure, the `< 100` completeness criterion, the `--paginate --slurp` fallback, and empty-list ≠ unretrievable |
| O-M5 | §3.3 — read once at the top of `phaseMerge`, after the enable check by construction; local `const`, **no module-level cache**, with the in-process queue→dev call as the reason |
| O-M6 | PLAN-owned; §13.4 states the exact re-expression and the sibling case so the PLAN task has a specification to reference |
| O-M7 | §4.3 — `_sleep`/`_now` defaulted **in `phaseMerge`'s own parameter list**, the `raisePrAndVerifyCi:3899` pattern; wait is `mergeableRetryDelaySeconds × 1000` |
| O-M8 | §7.4 — the seven-step argv sequence, `--empty=drop` as the already-upstream detection, exit-status-only failure detection, and the ancestry confirmation |
| SE-v3 advisory / TE-v3 N-02 | §5.5 — row 5 observes `O4` for the branch name only; an unknown `O4` there does not refuse, it produces row 22 |
| TE-v3 N-01 | §4.6 + §13.3 — resolved as a stated fixture constraint on the row-11a and row-5 cases, asserted rather than documented |

### 15.2 Risks and costs, named

| Risk | Assessment |
|---|---|
| **Six new `gh` command shapes cross the adapter** (§11.3) | The largest new surface. Each is a fixed command with an exact-reply contract and one parser; but every one is agent-transported, so a transport that mangles a *value* inside its recognised set is undetectable — the same residual `validateDriftRecord` records (`orchestrate-queue.js:1163` block comment). Mitigated by fail-closed parsing everywhere and by the fact that only `O6` mutates |
| **`git rebase --empty=drop` needs git ≥ 2.26** (§7.4) | The one new platform assumption. Per DC-02 it must be **measured** on both CI runners (`git --version` on ubuntu-latest and macos-latest) during implementation, not inferred; if either is older, fall back to a plain `rebase` and record the change |
| **The `_recordHalt` rename touches four files and one vacuous test** (§8.2) | Mechanical but wide. The mitigation is the added negative assertion, without which the rename can silently disable a guard test |
| **Permanent `refused` in this repo** (FSPEC §4.5, BL-04) | Accepted and unavoidable: every PR this repo's queue raises touches `pdlc/workflows/` or `pdlc/skills/`. The `merged` path is therefore evidenced entirely through tests driving the observation points. Stated here so the first operator to see `refused` in `yumo-plugins` reads it as designed behaviour, not a defect |
| **`decideMerge`'s demand loop is an unusual shape** for this codebase | No precedent in `pdlc/workflows/` — the cost is one reviewer's unfamiliarity. The benefit is that purity and short-circuiting stop competing; §5.1 states the alternative that was rejected and why |

### 15.3 Feasibility

No infeasible requirement was found. Every capability this design needs already exists in the
codebase and is cited: `{ execFn }` observation, `defaultGit`'s argv seam, the `_recordHalt` channel,
the notices array, the phase-flag pattern, and the adapter's fixed-command discipline. The one
genuinely new capability — a `gh` command catalogue in the adapter — is an extension of
`rtMakeCheckCi`, not a new mechanism. Nothing here is routed back to the product side.

### 15.4 DECISIONS verdict

**Not warranted.** The FSPEC pinned every load-bearing product alternative before this document
started: the positional tie-break (Q-01), the `Evidence` migration timing (Q-02), squash's exclusion,
`mergeMode`'s three values with no bypass, the M1–M5 ordering, and the AC-2.7a supersession are all
decided there with their rejected alternatives recorded. What this TSPEC decided is engineering
shape — demand-driven core (§5.1), appended positional parameters (§8.3), seam rename (§8.2), row 5
observing `O4` (§5.5) — and each of those states its rejected alternative **in place**, next to the
design it explains, which is where a future reader will be standing when the question arises. A
separate DECISIONS document would duplicate those paragraphs without adding a decision.

`DECISIONS_WARRANTED: no`

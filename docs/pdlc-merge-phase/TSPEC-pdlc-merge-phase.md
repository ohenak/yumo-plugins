# TSPEC — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-FSPEC-v3.md`, `CROSS-REVIEW-test-engineer-FSPEC-v3.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-02 |

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
no decision beyond "which observation the core just demanded". That split is what makes §11's
23-row table a pure-function suite (§13.2) rather than an integration suite.

### 2.2 New constants — `orchestrate-dev.js`, alongside the existing phase flags (`:19`–`:35`)

| Name | Value | Note |
|---|---|---|
| `PHASE_MERGE_ENABLED` | `true` | FSPEC §2.4 row 1; same shape as `PHASE_DOD_ENABLED` (`:22`) |
| `MERGE_CONFIG_PATH` | `".claude/pdlc.config.json"` | §3 |
| `MERGE_GUARD_DEFAULTS` | `Object.freeze(["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"])` | FSPEC §4.3; frozen so no code path can remove a default |
| `MERGE_DEFAULTS` | `Object.freeze({ mergeMode: "off", mergeRequiresCi: true, allowSquashMerge: false, deleteBranchOnPdlcMerge: true, mergeableRetries: 3, mergeableRetryDelaySeconds: 10, guardPaths: [] })` | FSPEC §10.1 |
| `MERGE_MODES` | `Object.freeze(["off", "gated", "on"])` | closed catalogue (DC-01) |
| `MERGE_STATUSES` | `Object.freeze(["merged", "deferred", "refused", "skipped"])` | FSPEC §9.1 |
| `MERGE_FILES_PAGE_LIMIT` | `100` | §4.6 — GitHub's `files` page size |
| `MERGE_THREAD_PAGE_LIMIT` | `100` | §4.4 |
| `MERGE_MAX_THREAD_PAGES` | `10` | §4.4 — bounded, fail-closed |
| `MERGE_MAX_DECISION_STEPS` | `24` | §5.2 — termination bound on the demand loop |

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
| `observePrState` | `async (prUrl, { execFn }) => O1Observation` | IO |
| `observeCi` | `async (prUrl, { execFn, _checkCi }) => CiStatus` | IO — delegates to `checkPrCi` |
| `observeReviewThreads` | `async (ref, { execFn }) => O3Observation` | IO |
| `observeRepoCaps` | `async ({ execFn }) => O4Observation` | IO |
| `observeChangedFiles` | `async (prUrl, ref, { execFn }) => O5Observation` | IO |
| `executeMerge` | `async (prUrl, method, { execFn }) => O6Observation` | IO, mutating |
| `defaultMergeObservations` | `Object.freeze({ prState, ci, reviewThreads, repoCaps, changedFiles, merge })` | the six-key seam value |
| `guardVerdict` | `(changed: O5Observation, guardPaths: string[]) => { fired, kind, matched }` | pure |
| `mergeCandidates` | `(caps: O4Observation, config) => Array<"rebase" \| "merge" \| "squash">` | pure |
| `decideMerge` | `(record: ObservationRecord, config) => Demand \| Resolution` | pure, total |
| `deleteRemoteBranch` | `async ({ feature, _git }) => { ok, reason }` | IO |
| `updateDefaultBranch` | `async ({ defaultBranch, mergeSha, _git }) => { ok, branch, reason }` | IO |
| `evidenceCellFor` | `(mergeSha: string \| null, prNumber: number) => string` | pure |
| `phaseMerge` | `async ({ feature, prUrl, config?, _observations, _git, _readFile, _recordQueueRow, _log, _now, _sleep, _configPath }) => MergeOutcome` | orchestrator |

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
  mergeMethod: "rebase" | "merge" | "squash" | "unknown" | null,
  row: number | string,            // the §11 row that resolved — reported, and asserted by tests
  reason: string | null,           // FSPEC §9.2, one line
  escalations: string[],           // each already prefixed "MERGE ESCALATION: "
  notes: string[],                 // plain, non-escalating notices
  queueRow: "recorded" | "recorded (uncommitted)" | "none" | "error" | null,
}
```

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
| `mergeableRetries`, `mergeableRetryDelaySeconds` | `Number.isInteger(v) && v >= 0` | the default |
| `guardPaths` | an array; **each member** that is a non-empty string is kept, others dropped | contributes nothing |

`0` is honoured for both integers, so a deterministic suite that sets `mergeableRetryDelaySeconds: 0`
tests its own value (FSPEC §10.3). The `distribution` section is never touched, read or re-emitted.

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

## 5. The pure decision core — `decideMerge`

## 6. The self-modification guard

## 7. Merge execution and the post-merge sequence M1–M5 (O-M8)

## 8. The recording seam and the queue write-back (O-M1, O-M2)

## 9. The queue driver's post-pipeline transition

## 10. Reporting — report fields, notices, phase row

## 11. Runtime, bundle, and adapter changes

## 12. Error handling catalogue

## 13. Test strategy

## 14. Requirements traceability

## 15. Obligations discharged, risks, and the DECISIONS verdict

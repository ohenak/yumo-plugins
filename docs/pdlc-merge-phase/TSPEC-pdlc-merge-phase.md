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

Implements FSPEC §3. Each surface is **one function** that issues **one fixed command shape** and
classifies its raw output against a closed value set. Every one takes `{ execFn }` exactly as
`checkPrCi` does (`orchestrate-dev.js:3485`): `execFn` defaults to `child_process.execSync` resolved
through the module's existing dynamic `import()` — the one construct the runtime forbids and never
reaches, because in the bundle `execFn` is always supplied by the adapter (§11.3).

### 4.1 The shared transport and the shared failure shape

```js
function ghJson(command, execFn) {          // module-private, not exported
  let raw; try { raw = execFn(command, { stdio: "pipe", encoding: "utf8" }); }
  catch { return { ok: false, reason: "command-failed" }; }
  try { return { ok: true, json: JSON.parse(raw) }; }
  catch { return { ok: false, reason: "unparseable" }; }
}
```

Split from the classifiers deliberately: every `classify*` function is pure and takes the **raw
string**, so the §3.2 fail-closed table is a pure-function suite with no `execFn` at all, and the
`observe*` wrappers contain nothing but the command string and the delegation. This is `checkPrCi`'s
own shape (`:3485`–`:3520`) generalised, not a new pattern.

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
  The wait is `config.mergeableRetryDelaySeconds * 1000` milliseconds, computed at the call site.

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

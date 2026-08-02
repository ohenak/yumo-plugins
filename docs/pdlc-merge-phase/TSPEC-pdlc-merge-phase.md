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

## 9. The queue driver's post-pipeline transition

## 10. Reporting — report fields, notices, phase row

## 11. Runtime, bundle, and adapter changes

## 12. Error handling catalogue

## 13. Test strategy

## 14. Requirements traceability

## 15. Obligations discharged, risks, and the DECISIONS verdict

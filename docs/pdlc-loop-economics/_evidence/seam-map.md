# seam-map.md — pdlc-loop-economics (M1a/M1b/M1c/M1d, M2, M3)

Verified `file:line` map of the seams a loop-economics change would touch, in
`pdlc/workflows/orchestrate-dev.js` and `pdlc/workflows/lib/document-oracles.mjs`,
plus the two most representative test-seam files. Every line number below was
re-verified against the current working tree with `grep -n` / `sed -n` immediately
before this file was written (see `## Verification`). Quotes are verbatim source
bytes (checked with `sed -n '<n>,<m>p'`), not the lossy compressed text that some
tool outputs in this session rendered with words dropped — do not trust a quote
from anywhere else without re-running `sed -n` yourself.

---

## 1. Approval-anchor append dispatch (M1a)

**Finding up front: there is no dispatch-prompt text in `orchestrate-dev.js` that
asks a reviewer/author agent to hand-copy `APPROVAL-HASH:` / `REVIEWED-COMMIT:` /
`UPSTREAM-STATE:` anchors.** `grep -n "asked to append\|do so verbatim\|APPEND_ANCHOR\|ANCHOR_CLAUSE"
pdlc/workflows/orchestrate-dev.js` returns no matches. The engine already appends
the anchors itself via an injected IO seam (item 1c below) and never dispatches an
agent to do it. The sentence "If you are asked to append them, do so verbatim" that
appears in `pdlc/skills/pm-review/SKILL.md:265`, `pdlc/skills/se-review/SKILL.md:293`
and `pdlc/skills/te-review/SKILL.md:317` is conditional/defensive language for a
path that is not currently reachable from this module. `pdlc/OPERATIONS.md:289`'s
phrase "performed by the workflow's IO agents" refers to the injected seam
functions (`_appendFile`, `_git`), not an LLM agent dispatch.

### (a) Anchor strings constructed / parsed

- `pdlc/workflows/orchestrate-dev.js:7108-7109`
  ```js
  const APPROVAL_ANCHOR_LINE =
    /^(APPROVAL-HASH(-NORMALIZED)?|REVIEWED-COMMIT|UPSTREAM-STATE):/;
  ```
  The single regex `parseVerdict` uses to recognise "a line the append step is
  allowed to put here" so it is skipped rather than fed to `JSON.parse`.

- `pdlc/workflows/orchestrate-dev.js:7141` (function start) through the
  `UPSTREAM-STATE:` row parse:
  ```js
  export function parseApprovalHash(fileText) {
  ```
  and, inside it (`sed -n '7147,7167p'`):
  ```js
    const h = /^\s*APPROVAL-HASH:\s*(\S*)\s*$/.exec(line);
    ...
    const n = /^\s*APPROVAL-HASH-NORMALIZED:\s*(\S*)\s*$/.exec(line);
    ...
    const c = /^\s*REVIEWED-COMMIT:\s*(\S*)\s*$/.exec(line);
    ...
    const u = /^\s*UPSTREAM-STATE:\s*([A-Z]+)\s+(\S*)\s*$/.exec(line);
  ```
  This is the sole reader of anchor bytes off disk — the parser side.

- `pdlc/workflows/orchestrate-dev.js:9305-9391` — `appendApprovalAnchors` (see 1c),
  the sole writer.

- `pdlc/workflows/orchestrate-dev.js:9901-9951` — `refreshReviewState`, the
  staleness-walk-adjacent reader that opens each round file and calls
  `parseApprovalHash(text)` at line 9943 to populate `reviewFiles`'s
  `anchorHash`/`anchorNormalizedHash`/`anchorUpstreamState` fields:
  ```js
  const anchor = parseApprovalHash(text);
  reviewFiles.set(`${parsed.role}:${parsed.round}`, {
  ```

- `pdlc/workflows/orchestrate-dev.js:14068` — `phaseGate`, whose body (from
  ~14148) is the byte/normalized-hash/cascade freshness walk that consumes the
  anchor fields `refreshReviewState` populated (see item 6 below for the walk
  itself).

- The harvest reader of anchors is **not** in `orchestrate-dev.js`: `harvestPrompt`
  at `pdlc/workflows/orchestrate-dev.js:11347-11364` dispatches only a generic
  "harvest learnings" instruction with no anchor-copy text; the "copy, never
  recompute" instruction for `APPROVAL-HASH:`/`REVIEWED-COMMIT:` lives entirely in
  `pdlc/skills/harvest-learnings/SKILL.md:53-56`.

### (b) Dispatch prompt text asking the agent to write the anchors

**None found in `orchestrate-dev.js`.** Confirmed by exhaustive grep (see above)
across `reviewerPrompt` (`:10826`), `optimizerPrompt` (`:10885`), `creatorPrompt`
(`:10974`), `erratumAuthorPrompt` (`:10996`), `erratumConfirmPrompt` (`:11073`),
`erratumRestatementPrompt` (`:11115`), `cascadeConfirmPrompt` (`:11209`) — none of
these prompt builders reference `APPROVAL-HASH`, `REVIEWED-COMMIT`, or
`UPSTREAM-STATE`. If M1a needs the agent-hand-copy path removed, there is nothing
to remove here; if M1a needs the SKILL.md conditional sentences tightened/removed,
that is a SKILL.md-only change, not a workflow-source change.

### (c) Harness IO path — engine performs the approval write itself

- `pdlc/workflows/orchestrate-dev.js:9305-9317` — `appendApprovalAnchors` signature:
  ```js
  async function appendApprovalAnchors({
    paths,
    hash,
    normalizedHash = null,
    upstreamState = [],
    commit,
    _readFile,
    _probeDoc,
    _appendFile,
    _git,
    emit,
    provenance = NO_PROVENANCE,
  }) {
  ```
  This is the engine self-write mechanism (c) the task asks about — it takes
  the injected `_appendFile`/`_readFile`/`_probeDoc`/`_git` seams and writes the
  anchor block directly, no agent dispatch involved.

- `pdlc/workflows/orchestrate-dev.js:9370-9376` — the actual append call:
  ```js
        await _appendFile(
          path,
          `\nAPPROVAL-HASH: ${hash}\n` +
            (normalizedHash ? `APPROVAL-HASH-NORMALIZED: ${normalizedHash}\n` : "") +
            `REVIEWED-COMMIT: ${commit}\n` +
  ```
  followed by `upstreamStateLines(upstreamState)` appended last (`:9376`).

- `pdlc/workflows/orchestrate-dev.js:9396-9401` — best-effort `git add` + `git
  commit` of the anchored paths through the same `_git` seam:
  ```js
    await _git(["add", ...paths]); // t6
    ...
    await _git(["commit", "-m", message]);
  ```

- Call sites (three, all inside `main()`'s nested functions):
  `pdlc/workflows/orchestrate-dev.js:9152` (inside `reviewLoop`'s PASS branch,
  `sed -n '9142,9160p'` shows the t4→t5→t6 sequence comment), `:14684` (inside
  `cascadeDownstream`'s re-confirm branch), `:15346` (inside the erratum
  confirmation's own re-anchor branch).

**Hook for M1a**: since (c) already exists and (b) does not, an M1a change here is
about *hardening/documenting* the existing engine-only write path (e.g. removing
the now-redundant defensive sentence from the three review SKILL.md files), not
about building a new self-write seam.

---

## 2. Upstream-hash snapshot dispatch construction (M1b)

### SHA computed and carried into dispatches

- `pdlc/workflows/orchestrate-dev.js:9032-9064` — inside `reviewLoop`, captured
  **before** reviewers are dispatched (t0–t2), reading the live working tree via
  `_probeDoc`/`_hashFile`/`_git`, never a stale in-memory value:
  ```js
      const probe = await probeDocument(_probeDoc, doc, roundDocType);
      anchorHash = (probe ? probe.hash : await _hashFile(doc)) ?? null; // t0–t1
      ...
      anchorUpstreamState = await deriveApprovalUpstreamState({
        feature,
        docType: roundDocType,
        _probeDoc,
        _hashFile,
      });
      anchorCommit = await headCommitSha(_git); // t2
  ```

- `pdlc/workflows/orchestrate-dev.js:8413-8427` — `deriveApprovalUpstreamState`,
  the function that walks `erratumDocTypesAbove(docType)` and hashes each via
  `_probeDoc`/`_hashFile` (live disk, not a committed-HEAD snapshot object):
  ```js
  async function deriveApprovalUpstreamState({ feature, docType, _probeDoc, _hashFile }) {
  ```

- `pdlc/workflows/orchestrate-dev.js:9241-9250` — `headCommitSha`, the sole
  `_git` read used to stamp `REVIEWED-COMMIT:`:
  ```js
  async function headCommitSha(_git) {
    if (typeof _git !== "function") return "unavailable";
    try {
      const result = await _git(["rev-parse", "HEAD"]);
  ```

### The SHA embedded literally into dispatch prompt TEXT

- `pdlc/workflows/orchestrate-dev.js:11181-11197` — `erratumSupersetClause`,
  which is the one place an upstream hash is rendered into agent-visible prompt
  bytes:
  ```js
  function erratumSupersetClause({ docType, upstreamState = [] }) {
    const rows =
      Array.isArray(upstreamState) && upstreamState.length > 0
        ? `The upstream documents, at their current version as of this dispatch:\n` +
          upstreamState.map((entry) => `- ${entry.docType}: ${entry.path} (${entry.hash})`).join("\n") +
  ```
  Called from both `erratumConfirmPrompt` (`:11073`, invoked via `basePrompt` at
  `:14958`) and implicitly through the `upstreamState` param `cascadeConfirmPrompt`
  (`:11209`) also receives.

### Snapshot vs. fresh-at-dispatch — the mint-time / re-derive machinery

- `pdlc/workflows/orchestrate-dev.js:14435-14439` — `erratumDocHash(docType)`,
  the live-disk read every hash in this module ultimately goes through:
  ```js
  async function erratumDocHash(docType) {
    const path = erratumDocPath(docType);
    const probe = await probeDocument(probeDocFn, path, docType);
    return (probe ? probe.hash : await hashFileFn(path)) ?? null;
  }
  ```

- `pdlc/workflows/orchestrate-dev.js:14449-14455` — `snapshotErratumDocs`, the
  **mint-time** snapshot (DEC-ERR-03) a routed erratum batch is dated against —
  this is the "committed-earlier-phase-state" object the task description points
  at:
  ```js
  async function snapshotErratumDocs() {
    const snapshot = new Map();
    for (const docType of ERRATUM_DOC_TYPES) {
      snapshot.set(docType, await erratumDocHash(docType));
    }
    return snapshot;
  }
  ```

- `pdlc/workflows/orchestrate-dev.js:14982-15019` — inside the erratum
  confirmation flow: the confirm dispatch is built from `confirmUpstreamState`
  (initially the caller-supplied `upstreamState`, i.e. the state the AUTHOR was
  re-grounded on), then explicitly **re-derived and drift-checked** after the
  confirmers return:
  ```js
      let confirmUpstreamState = upstreamState;
      let responses = await dispatchConfirmers(round, confirmPaths, confirmUpstreamState);
      ...
      const reDerived = await deriveUpstreamState(target, null);
      if (upstreamStateLines(reDerived.upstreamState) !== upstreamStateLines(confirmUpstreamState)) {
  ```
  This is PLAN §3.3's confirmation-window-freeze machinery — a sibling erratum
  landing mid-window forces one bounded re-dispatch at the next round index. **Note
  for M1b**: this path is already fresh-at-dispatch and drift-guarded; it is NOT
  a stale committed-HEAD bug. The likelier M1b hook is `snapshotErratumDocs`
  (`:14449`) and its mint-time semantics (DEC-ERR-03), or the `erratumSupersetClause`
  rendering (`:11181`) if the change is about *what* gets shown to the agent, not
  *when* it is computed.

- `pdlc/workflows/orchestrate-dev.js:14572-14586` — `cascadeDownstream`, the
  same-pass cascade that reads `targetHash = await erratumDocHash(target)` fresh
  at call time and compares it against each downstream document's recorded
  `UPSTREAM-STATE` row (`row.hash === targetHash`, `:14596` in `sed -n
  '14590,14597p'` — own-hash comparison for item 4/5 below too).

---

## 3. DoD CODE_REVIEW version pick (M1c)

- `pdlc/workflows/orchestrate-dev.js:12080` — `dodVerifyLoop` signature/loop:
  ```js
  export async function dodVerifyLoop({
  ```
  with `for (let iteration = 1; iteration <= maxIterations; iteration++)` opening
  the loop body (`sed -n '12085,12086p'`).

- `pdlc/workflows/orchestrate-dev.js:12092` — the version number IS the raw loop
  counter, no separate "next version" derivation function exists:
  ```js
          dodVerifyPrompt(feature, iteration)
  ```

- `pdlc/workflows/orchestrate-dev.js:12120` — the CODE_REVIEW path literal built
  from the same `iteration`:
  ```js
      const codeReviewPath = `docs/${feature}/CODE_REVIEW-${feature}-v${iteration}.md`;
  ```

- `pdlc/workflows/orchestrate-dev.js:11661-11665` and `:11712` — `dodVerifyPrompt`
  / `dodReVerifyPrompt`, the prompt builders that interpolate `version` into the
  `CODE_REVIEW-{feature}-v{version}.md` path told to the `dod-verify` agent.

**Note**: there is no round-window derivation (`deriveRoundWindow`-style,
content-addressed from a directory listing) for CODE_REVIEW versions — the number
is a bare in-memory loop counter, reset to 1 on every fresh `dodVerifyLoop`
invocation. If M1c is about making CODE_REVIEW versioning branch-derived the way
cross-review rounds are, `dodVerifyLoop`'s `iteration` (`:12080-12092`) is the seam
to replace, and `deriveRoundWindow` (`pdlc/workflows/orchestrate-dev.js:9585`, see
item 7) is the precedent to follow.

### FINDING: collection, dedup/normalization

- `pdlc/workflows/orchestrate-dev.js:11868-11884` — `classifyDodFindings`, routes
  each parsed finding to a doc-type bucket or `codeFindings`, in `ERRATUM_DOC_TYPES`
  pipeline order:
  ```js
  export function classifyDodFindings(codeReviewText, feature) {
  ```

- `pdlc/workflows/orchestrate-dev.js:11897-11949` — `parseDodFindings`, the
  markdown-table-row parser (block-segmented like `parsePlanTasks`) that produces
  the raw `{id, criterion, severity, fileLine, problem, requiredFix, scope}`
  records `classifyDodFindings` buckets. **This is a table-row grammar, distinct
  from the line-leading `FINDING:` grammar** used by erratum confirmations. The
  actual `FINDING:` grammar text is `findingGrammarClause`,
  `pdlc/workflows/orchestrate-dev.js:11152-11166`:
  ```js
  function findingGrammarClause() {
    return (
      `Tag every finding you raise. One finding per line, outside any fenced block, ` +
      `above your VERDICT trailer:\n` +
      `FINDING: {High|Medium|Low} | {delta|inherited} | {local|nonlocal} | {section anchor} | {what is wrong}\n` +
  ```
  — see `parseConfirmationFindings`, `pdlc/workflows/orchestrate-dev.js:6502-6520`+
  (`export function parseConfirmationFindings(text) {`), for the per-round
  `FINDING:` line collection/dedup path referenced in the task prompt; its
  callers are at `:15114` (per-confirmer response parse) and `:15122` (per-file
  parse).

---

## 4/5. Round budgets, cascade re-confirmation, own-hash comparison, pin-check slot (M1d/M2)

- `pdlc/workflows/orchestrate-dev.js:1902` — per-invocation review-round budget:
  ```js
  const MAX_REVIEW_ROUNDS = 5;
  ```

- `pdlc/workflows/orchestrate-dev.js:1935` — the lifetime cap (DEC-ROUNDS-02,
  operator decision 2026-08-10), exported because it is operator-facing:
  ```js
  export const MAX_LIFETIME_ROUNDS = 15;
  ```

- `pdlc/workflows/orchestrate-dev.js:8439` — `const MAX_ERRATUM_ROUNDS_PER_DOC = 1;`
  ("One erratum round per upstream doc per phase … Not config").

- `pdlc/workflows/orchestrate-dev.js:8454` — `const MAX_ERRATUM_FOLLOWUP_ROUNDS = 1;`
  (a distinct, separate budget from the constant above — bounds re-dispatches
  after a routed erratum set's own confirmers said the edit missed).

- `pdlc/workflows/orchestrate-dev.js:14570-14625` — `cascadeDownstream`: for each
  document below an edited `target`, compares `row.hash` (the document's recorded
  `UPSTREAM-STATE` entry for `target`) against `targetHash` (target's CURRENT hash)
  to decide whether a cascade re-confirmation round is owed:
  ```js
  async function cascadeDownstream({ phaseId, target, editedIn }) {
    const targetHash = await erratumDocHash(target);
    ...
        const row = (record.upstreamState ?? []).find((e) => e.docType === target);
        if (!row || row.hash === targetHash) continue;
        if (lifetimeCapReached(window.startIndex)) {
  ```

- `pdlc/workflows/orchestrate-dev.js:14958-14980` — the erratum-side re-confirm
  dispatch construction (`erratumConfirmPrompt`, with `upstreamState: state` at
  `:14968-14969` documented as "the SAME upstream state the author was
  re-grounded on").

**No `cascade.pinCheck` config-gated slot exists yet.** `grep -n "pinCheck\|pin-check\|pin_check"`
across `pdlc/workflows/orchestrate-dev.js` and `pdlc/workflows/lib/*.mjs` returns
zero matches. If M1d/M2 introduces a config-gated pin-check, it has no
precedent to extend and must be added net-new; the nearest existing "batched
confirmer dispatch" slot to hook a pin-check into is `dispatchConfirmers`:
```js
    const dispatchConfirmers = (atRound, paths, state) =>
      parallelFn(
        reviewers.map((skill, i) =>
          wrappedDispatch({
            skill,
            basePrompt: erratumConfirmPrompt({
```
(`pdlc/workflows/orchestrate-dev.js:14953-14958`) inside the erratum flow, or the
parallel dispatch at `cascadeDownstream`'s `responses = await parallelFn(...)`
(`:14628`).

---

## 6. Convergence / termination decision (M3)

- `pdlc/workflows/orchestrate-dev.js:8176-8231` — `checkConverged`, the
  non-convergence halt/report path (fires when `loopResult.converged === false`):
  ```js
  function checkConverged(
    loopResult,
    phaseId,
    phaseLabel,
    recordPhase,
    feature,
    startIndex,
    endIndex
  ) {
  ```

- `pdlc/workflows/orchestrate-dev.js:14003-14010` — `recordPhase`, the report-row
  writer every phase outcome (converged, halted, skipped, refused) funnels through:
  ```js
    function recordPhase(phaseId, label, status, detail, iterations) {
      phases.push({
        phase: phaseId,
        label,
        status,
        ...(iterations !== undefined ? { iterations } : {}),
        ...(detail ? { detail } : {}),
      });
    }
  ```

- `pdlc/workflows/orchestrate-dev.js:15580` — `converge`, the phase driver that
  calls `checkConverged` then records the success row:
  ```js
    async function converge({
  ```
  and, at `:15670`, the ✅ report row on the converged path:
  ```js
      recordPhase(phaseId, dispatch.label, "✅", forcedDetail(detail, gate.forced), loop.iterations);
  ```

- Status glyphs already in use as report-row outcome values (grep across the
  module): `"✅"` (converged/approved), `"❌"` (non-convergence / refused), `"⏭"`
  (skipped on a recorded approval, e.g. `:14232`, `:14284`). **No
  `"converged-by-derivative-stop"` (or any distinct glyph/string for a
  derivative-stop outcome) exists yet** — `grep -n "converged-by-derivative-stop\|derivativeStop"`
  returns zero matches. M3's new outcome slot has no existing status value to
  reuse; it needs either a new glyph or a `detail`-string convention layered onto
  the existing `recordPhase(phaseId, label, status, detail, iterations)` call
  shape at `:15670`, following the same pattern `MAX_LIFETIME_ROUNDS`'s "ACCEPTED
  AS-IS, not approved, not failed" notice already establishes at
  `:14549-14556` (`sed -n '14549,14557p'` — the lifetime-cap notice text is the
  closest existing precedent for a third, non-✅/❌ outcome).

- The lifetime-cap "accepted as-is" notice (closest existing 3rd-outcome
  precedent), `pdlc/workflows/orchestrate-dev.js:14600-14607`:
  ```js
        const notice =
          `Phase ${phaseId}: LIFETIME REVIEW CAP REACHED for ${docPath} — the upstream cascade ` +
          `re-confirmation is skipped, nothing dispatched. ${onDisk} review round` +
          `${onDisk === 1 ? "" : "s"} for ${downstream} are on disk and the cap is ` +
          `${MAX_LIFETIME_ROUNDS}. Its approval was anchored against an EARLIER ${target}, which ` +
  ```

---

## 7. Config parse pattern (`parseLearningsConfig`) — precedent for new keys

- `pdlc/workflows/orchestrate-dev.js:48` — the shared config path constant:
  ```js
  export const MERGE_CONFIG_PATH = ".claude/pdlc.config.json";
  ```

- `pdlc/workflows/orchestrate-dev.js:2196-2200` — `LEARNINGS_DEFAULTS`, the
  per-key default object every field falls back to independently:
  ```js
  export const LEARNINGS_DEFAULTS = Object.freeze({
    enabled: true,
    maxDocuments: 5,
    maxBytesPerDocument: 6000,
    maxTotalBytes: 20000,
  });
  ```

- `pdlc/workflows/orchestrate-dev.js:2252-2292` — `parseLearningsConfig(text)`,
  the fail-open, per-key-independent parser shape (pure, total, never throws):
  ```js
  export function parseLearningsConfig(text) {
    const degraded = (sectionMalformed) => ({
      config: LEARNINGS_DEFAULTS,
      sectionMalformed,
      invalidKeys: [],
    });
    if (text == null) return degraded(false);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return degraded(false);
    }
    if (!isPlainObject(parsed) || !("learningsInjection" in parsed)) return degraded(false);
  ```
  and, further down (`:2270-2283`), the per-key `boolField`/`nonNegativeInt`
  validators that push onto `invalidKeys` rather than throwing.

- `pdlc/workflows/orchestrate-dev.js:2313-2318` — `readLearningsConfigSafely`,
  the never-throwing file read paired with the parser:
  ```js
  export async function readLearningsConfigSafely(readFileFn, path) {
    try {
      return await readFileFn(path);
    } catch {
      return null;
    }
  }
  ```

- `pdlc/workflows/orchestrate-dev.js:14315` — the one call site inside
  `main()`, read once per run:
  ```js
    const learningsConfigText = await readLearningsConfigSafely(readFileFn, LEARNINGS_CONFIG_PATH);
    const learningsConfigParsed = parseLearningsConfig(learningsConfigText);
  ```

**This is the precedent to clone for `cascade.pinCheck.enabled` and
`review.derivativeStop { enabled, rounds: 2 }`**: a new `{SECTION}_DEFAULTS`
frozen object, a new `parse{Section}Config(text)` following the same
`degraded()`/per-key-independent-fallback shape, reading the SAME
`MERGE_CONFIG_PATH` file, called once in `main()` alongside the existing
`learningsInjection` read at `:14315-14316`. A second, structurally-identical
precedent (not read in full here, but present) is `parseAdvisoryConfig` at
`pdlc/workflows/orchestrate-dev.js:2074` (referenced in `parseLearningsConfig`'s
own docblock at `:2242` as "Modelled on `parseAdvisoryConfig` (dev:1964)").

---

## 8. Report-row pattern (phase/round outcomes surfaced to the operator)

Already covered mechanically in item 6 (`recordPhase`, `:14003-14010` and its ✅/❌/⏭
call sites). Two additional surfacing points:

- `pdlc/workflows/orchestrate-dev.js:14034-14039` — the run-scoped `notices`
  array (`main()`'s own instance; two other, unrelated `const notices = []`
  locals exist at `:441` and `:12880` in smaller helper scopes — do not confuse
  them), the ADDITIVE report channel (distinct from `phases`) that carries
  operator-facing lines not tied to one phase row — e.g. the lifetime-cap
  "ACCEPTED AS-IS" notice (`:14600`), the cascade-re-confirmed notice (`:14697`),
  and the two learnings config read notices (around `:14320`):
  ```js
  /**
   * §4.7's report LINES — the skip notice's siblings. Additive on every report,
   * so a note ("this anchor was UNEVALUABLE") reaches the operator without being
   * smuggled into a phase row's `detail`, which other oracles pin verbatim.
   */
  const notices = [];
  ```

- `pdlc/workflows/orchestrate-dev.js:14232`, `:14254`, `:14284`, `:14525` — the
  other `recordPhase(phaseId, label, status, detail...)` call sites (skip, refuse,
  skip, halt), confirming `phases.push(...)` (`:14004`) is the single funnel every
  phase-level outcome — including a future derivative-stop outcome — must go
  through.

---

## 9. Test seam-stubbing pattern (2 representative files) + baseline-guard

### Representative file 1 — `pdlc/workflows/__tests__/loopQueueDriver.test.js`

- `pdlc/workflows/__tests__/loopQueueDriver.test.js:63-76` — `baseSeams`, the
  sync-double bundle every test in the file starts from and overrides piecemeal:
  ```js
  function baseSeams(overrides = {}) {
    const { readFileFn } = makeReadFileFn({});
    return {
      _log: (m) => logMessages.push(m),
      _phase: () => {},
      _agent: async () => "TRIAGE: ready",
      _readFile: readFileFn,
      _writeFile: async () => {},
      _appendFile: async () => {},
      _git: async () => ({ ok: true, stdout: "", stderr: "" }),
      ...overrides,
    };
  }
  ```
  Every IO/agent/git call is a scripted async function returning a fixed shape —
  never live git or fs.

### Representative file 2 — `pdlc/workflows/__tests__/helpers/loopDoubles.js`

- `pdlc/workflows/__tests__/helpers/loopDoubles.js:103-117` — `makeGitFn`, the
  argv-keyed responder double (the canonical `_git` stub pattern referenced by the
  commit-f325016 fix note):
  ```js
  export function makeGitFn(script = {}) {
    const calls = [];
    const gitFn = async (argv) => {
      calls.push(argv);
      let key = Array.isArray(argv) ? argv[0] : argv;
      if (Array.isArray(argv)) {
        let i = 0;
        while (argv[i] === "-C" || argv[i] === "-c") i += 2;
        key = argv[i];
      }
      if (Object.prototype.hasOwnProperty.call(script, key)) {
        return script[key];
      }
      return { ok: true, stdout: "", stderr: "" };
    };
    return { calls, gitFn };
  }
  ```
  Keyed by `argv[0]` subcommand (mirroring `mergeQueueDriver.test.js`'s
  `helpers/mergeDoubles.js`'s `fakeGit`), unscripted subcommands succeed trivially,
  every call recorded on `.calls` for assertion.

### Byte-identity baseline guard — `pdlc/workflows/__tests__/learningsBaselineGuard.test.js`

- `pdlc/workflows/__tests__/learningsBaselineGuard.test.js:70` — `EXPECTED_DIGESTS`,
  the hand-transcribed digest literal per `{caseId}` (DC-14), never derived from
  `MANIFEST.json` or recomputed from the fixture files themselves:
  ```js
  const EXPECTED_DIGESTS = Object.freeze({
  ```
  Compared against both recomputed file digests AND `MANIFEST.json`'s own entries,
  with the `{caseId}` key set compared by set-equality (never containment) per the
  file's header docblock (`:8-14`). This is the pattern to clone for any
  loop-economics fixture (e.g. a derivative-stop trace) that needs a
  drift-resistant "before" baseline.

### `reviewLoop`/staleness-walk test coverage

- No file named `staleness*.test.js` exists (`ls pdlc/workflows/__tests__/ | grep -i staleness`
  returns nothing). The staleness/cascade walk (`phaseGate`, item 6/2 above) is
  exercised through `pdlc/workflows/__tests__/approvalSearch.test.js` and
  `pdlc/workflows/__tests__/approvalHash.test.js` (625 lines) and
  `pdlc/workflows/__tests__/approvalNormalization.test.js`, not a dedicated
  staleness file. `pdlc/workflows/__tests__/reviewLoop.test.js` (1401 lines) covers
  `reviewLoop` itself (imported at its `:1401` top, `import { reviewLoop } from
  "../orchestrate-dev.js";`) but does not stub `_git` explicitly anywhere in the
  file (`grep -n "_git\b" pdlc/workflows/__tests__/reviewLoop.test.js` returns no
  matches) — tests that omit `_git` rely on `headCommitSha`'s own `typeof _git !==
  "function"` guard (`:9242`) to degrade to `"unavailable"` rather than needing a
  stub.

---

## Constants reference (PHASE_DISPATCH, MODEL_*, deriveRoundWindow)

- `pdlc/workflows/orchestrate-dev.js:5142-5155` — `PHASE_DISPATCH`, the per-phase
  dispatch table (`creator`/`creatorInputs`/`creatorOutputPath`/`reviewers`/
  `optimizer`/`grounding`), start of the `R` (REQ) entry shown:
  ```js
  export const PHASE_DISPATCH = {
    R: {
      phase: "R",
      label: "REQ Cross-Review",
      creator: null,
  ```

- `pdlc/workflows/orchestrate-dev.js:1872` — `const MODEL_DEFAULT = "opus"; // all phases except Phase I`
- `pdlc/workflows/orchestrate-dev.js:1966` — `const MODEL_IMPLEMENTATION = "sonnet"; // Phase I se-implement batches only`
- `pdlc/workflows/orchestrate-dev.js:1972` — `const MODEL_ADVISORY = "fable"; // BL-01 — see TSPEC §3.3`
- `pdlc/workflows/orchestrate-dev.js:1973` — `const MODEL_ADVISORY_FALLBACK = "opus"; // === MODEL_DEFAULT's literal, deliberately a separate constant`

- `pdlc/workflows/orchestrate-dev.js:9585` — `deriveRoundWindow(basenames, docType)`,
  the content-addressed round-derivation precedent cited for item 3's "should
  CODE_REVIEW versioning become content-addressed too" question:
  ```js
  export function deriveRoundWindow(basenames, docType) {
  ```
  Synchronous, total, takes no seam (per its own docblock at `:9575`, "Synchronous,
  total, and takes no seam (§3.7)").

- `pdlc/workflows/lib/document-oracles.mjs:69` — `const WALK_SKIP_DIRS = new Set([".git", "node_modules"]);`
- `pdlc/workflows/lib/document-oracles.mjs:150-169` — `coveredViolations(root)`,
  which walks the **entire** tree under `root` (via `listAllFiles`, skipping only
  the two dirs above) and flags any file whose text matches one of five
  pre-distribution-convention patterns:
  ```js
  export function coveredViolations(root) {
    const allRelPaths = listAllFiles(root);
    const violations = [];
    for (const relPath of allRelPaths) {
      if (isExempt(relPath, allRelPaths)) continue;
  ```
  Reused as-is by `pdlc/workflows/__tests__/documentOracles.test.js:99` (filtered
  by `ignoredByGit`) — an untracked local file under `root` can still fail this
  oracle even after that filter, per the file's own AT-22 test comment.

---

## Verification

- Commit at time of this map: `9dfaef19784aeee6d1a92070e336459e8ac9349f` (`git rev-parse HEAD`).
- Branch: `feat-pdlc-loop-economics`.
- Date map taken: 2026-08-27.
- Every `file:line` citation above was re-verified against the working tree with
  `grep -n` (to locate) and `sed -n '<start>,<end>p'` (to quote verbatim) in the
  same session that produced this file, after this session's tool output was
  observed to sometimes render compressed/lossy text (dropped function-word
  tokens) for `Read`/`grep` results — `sed -n` output was cross-checked with
  `cat -A` once and found byte-accurate, so all quotes above were taken through
  `sed -n`, not through the potentially-lossy `Read` tool.

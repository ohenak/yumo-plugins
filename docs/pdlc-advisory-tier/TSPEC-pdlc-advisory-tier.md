---
feature: pdlc-advisory-tier
---

# TSPEC — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{pm,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-03 |

## 1. Scope, baseline pin, and what this TSPEC decides

### 1.1 Citation pin — the feature-branch tree at HEAD, not the REQ behavioral pin

Every `file:line` in this document is read at the **feature-branch working tree, HEAD `5d66c48`**
(`git rev-parse HEAD` on `feat-pdlc-advisory-tier`), where `pdlc/workflows/orchestrate-dev.js` is
**8,642** lines and `pdlc/workflows/orchestrate-queue.js` is **1,587** lines. Every symbol this TSPEC
names resolves at that HEAD; a reader should verify each citation by **symbol name** (`grep -n`),
treating the line number as a navigation hint against a ~8,600-line file that churns.

**This citation pin is deliberately distinct from REQ BL-02 / FSPEC §2's `26c3f1c`.** That commit is
REQ's *behavioral* baseline — the tree whose observable "Today" pipeline behavior the REQ rows were
measured against — and it is an **ancestor of this HEAD** (`git merge-base --is-ancestor 26c3f1c HEAD`
⇒ true), so the behavioral baseline still holds. But `26c3f1c` **predates Phase PUB's
`raisePrAndVerifyCi`** (introduced by `4d5e4dc`, on the branch tree but not at `26c3f1c`), so §7/§8's
*source-line* citations cannot resolve there. The two pins serve two purposes: REQ pins behavior at
`26c3f1c`; this TSPEC pins source lines at the branch HEAD that actually carries the code being
extended. Both are true simultaneously.

Implementation still rebases `feat-pdlc-advisory-tier` onto the latest default branch before Phase I
— Phase DOD step-0 does exactly this (`ship-pr`, CLAUDE.md) — but that is release hygiene, not a
precondition for these citations to resolve: the branch tree already carries `computeWaves`,
`parseImplementationConfig`, `phaseMerge`, `MERGE_ESCALATIONS`, `raisePrAndVerifyCi` and
`defaultAppendFile`, all cited below.

### 1.2 What FSPEC left to this document

FSPEC §1 names six things as TSPEC's: module and constant placement, seam and function signatures,
the literal advisory model alias, prompt text, byte-level file formats, and code order. FSPEC §13
adds one substantive open question, OQ-3. This TSPEC resolves each:

| # | Left open by | Resolved here |
|---|---|---|
| 1 | FSPEC §1 | module and constant placement — §2 |
| 2 | FSPEC §1 | seam and function signatures — §4, §6, §7, §8 |
| 3 | FSPEC §1, REQ BL-01 / OQ-1 | the literal advisory alias — §3.3 |
| 4 | FSPEC §1 | prompt text — §4.4, §6.3, §7.2, §8.2 |
| 5 | FSPEC §1 | byte-level file formats — §9.1, §10.1 |
| 6 | FSPEC §13 OQ-3 | what restores a verified state after an A5 push — §8.5 |
| 7 | FSPEC §1 | code order — deferred to PLAN |

### 1.3 What this TSPEC does not decide

Whether a given consuming repo can read the default branch's check history (BL-05) or re-run a
workflow run (BL-06) is a per-repo runtime fact, not a design choice. §8.3 specifies capability
probes whose *absence* is a first-class, tested outcome; it does not assume either capability.

### 1.4 Notation

`dev` = `pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`,
`adapter` = `pdlc/workflows/runtime-adapter.js`, `build` = `pdlc/workflows/build-runtime.mjs`, all at
the feature-branch HEAD pinned in §1.1. FSPEC rule ids (`V-5`, `A5-3`, `X-a`, …) are used verbatim; this document never restates
a rule it is only implementing.

## 2. Architecture — where the code lives, and the bundle constraint

### 2.1 The constraint that decides placement

FSPEC M-5 requires each rung to be **named once** and referenced from every advisory dispatch site in
*both* pipelines; FSPEC C-3 requires the config to be read **once per run**; FSPEC §5.1 E-R3 requires
envelope enforcement in the pipeline's own control flow. All three want one implementation shared by
two modules. The workflow runtime forbids the obvious mechanism:

| Constraint | Evidence |
|---|---|
| The runtime loads a single flat script — `import` does not exist there, so `stripModuleSyntax` removes every `import …;` line before bundling | `build:45`, `build:67-79` |
| Each module is wrapped in an IIFE that returns **only an explicitly listed export set** | `wrapModule(varName, body, exportedNames, prelude)`, `build:55-66` |
| A cross-module reference is expressed as a **free identifier bound by a prelude** — the shipped precedent is `queueModule`'s `"const realMain = __dev.main;"` | `build:96-103`; the consumer is `_runPipeline: runPipelineFn = realMain` at `queue:764` |
| **Both** shipped bundles already contain `devModule` **and** `queueModule` | `build:281` (queue bundle), `build:288` (dev bundle) |

The last row is the decisive one: because `devModule` is present in both artifacts, anything exported
from `orchestrate-dev.js` is reachable from the queue module at runtime through `__dev.*` — with no
new build source, no new inlining order, and no change to `build.mjs`'s three-source structure
(`build:83-85`).

### 2.2 Placement decision

| Component | Home | Reached from the queue by |
|---|---|---|
| Advisory constants (`MODEL_ADVISORY`, `MODEL_ADVISORY_FALLBACK`, `ADVISORY_CONFIG_PATH`, `ADVISORY_DEFAULTS`, `ADVISORY_REFUSAL_REASONS`, `ENVELOPE_DEFAULTS`, `ADVISORY_SEAMS`) | `orchestrate-dev.js` | prelude binding |
| Pure advisory core (`parseAdvisoryConfig`, `parseAdvisoryVerdict`, `classifyEnvelope`, `refusalReasonFor`, `advisorySummaryRows`, `renderAdvisoryEntry`, `renderEscalationEntry`) | `orchestrate-dev.js` | prelude binding |
| The invocation driver (`runAdvisorySeam`) | `orchestrate-dev.js` | prelude binding |
| A1/A2 seam wiring (trigger, evidence gathering, verdict handling) | `orchestrate-queue.js` | — |
| A3/A4/A5 seam wiring | `orchestrate-dev.js` | — |

Rejected alternatives are recorded in §16; the one worth naming here is a fourth build source
(`pdlc/workflows/advisory.js`). It is *possible* — `build.mjs` would gain a `readFileSync`, a
`wrapModule` call and two array insertions — but it changes the artifact composition rule that
`__tests__/runtimeBundle.test.js` and `distribution-manifest.json` are written against, for a
benefit (`orchestrate-dev.js` staying at 8,527 lines instead of ~9,300) that no requirement asks for.

### 2.3 The prelude edit

One edit to `build.mjs`, additive, in the existing shape:

```js
// build:87 — the dev module's export list gains the advisory surface
const devModule = wrapModule("__dev", stripModuleSyntax(devSource), [
  "main", "meta", "checkPrCi", "mergeWorktree", "checkFileNonEmpty", "parsePlanTasks",
  // advisory tier — consumed by queueModule's prelude below
  "runAdvisorySeam", "parseAdvisoryConfig", "readAdvisoryConfigSafely",
  "resolveAdvisoryRung", "advisorySummaryRows", "ADVISORY_DEFAULTS",
]);

// build:96-103 — the queue module's prelude gains the same names
const queueModule = wrapModule("__queue", stripModuleSyntax(queueSource),
  ["main", "meta", "DEFAULT_QUEUE_PATH", "rewriteStatus", "updateQueueStatus"],
  "const realMain = __dev.main;\n" +
  "const runAdvisorySeam = __dev.runAdvisorySeam;\n" +
  "const parseAdvisoryConfig = __dev.parseAdvisoryConfig;\n" +
  "const readAdvisoryConfigSafely = __dev.readAdvisoryConfigSafely;\n" +
  "const resolveAdvisoryRung = __dev.resolveAdvisoryRung;\n" +
  "const advisorySummaryRows = __dev.advisorySummaryRows;\n" +
  "const ADVISORY_DEFAULTS = __dev.ADVISORY_DEFAULTS;"
);
```

In `orchestrate-queue.js` these are **free identifiers with injection-seam defaults**, exactly as
`realMain` is at `queue:764`:

```js
_runAdvisorySeam: runAdvisorySeamFn = runAdvisorySeam,
```

Under jest the identifiers are unbound, so every queue-side test **must** inject them — which is the
behaviour we want (§13.3), and is why `realMain` has never needed a module-level fallback.

### 2.4 Dependency graph

```
                       ADVISORY_DEFAULTS · ADVISORY_REFUSAL_REASONS · ENVELOPE_DEFAULTS
                                              │  (frozen literals, no deps)
        ┌─────────────────────────────────────┼──────────────────────────────────┐
        ▼                                     ▼                                  ▼
parseAdvisoryConfig(text)          classifyEnvelope(proposal|diff, ctx)   parseAdvisoryVerdict(raw)
        │  pure                             │  pure                            │  pure
        └───────────────┬───────────────────┴────────────────┬─────────────────┘
                        ▼                                    ▼
              readAdvisoryConfigSafely(_readFile)     refusalReasonFor(signals)
                        │                                    │  pure, ordered
                        └──────────────┬─────────────────────┘
                                       ▼
                              runAdvisorySeam({ seam, ctx, seamOps, … })
                                       │   the ONLY impure component
        ┌──────────────────────────────┼───────────────────────────────┐
        ▼                              ▼                               ▼
  seamOps (per-seam)          _appendFile / _git (record)        _writeFile (escalation log)
  A1/A2 in queue.js           dev:4482 / dev:4540                dev:4482
  A3/A4/A5 in dev.js
```

Every leaf above the driver is a **pure function of its arguments**, testable with no doubles at all —
the same discipline `parseMergeConfig` (`dev:101`), `decideMerge` (`dev:835`) and `classifyPrState`
(`dev:380`) already follow, and the reason Phase MERGE's decision ladder is unit-testable without a
GitHub double.

### 2.5 Integration points in existing code

| # | Where | Existing symbol | Change |
|---|---|---|---|
| I-1 | `queue:890-898` | `precheckDependencies` result handling | unchanged — a blocked pre-check still skips before triage (A1-2 is unreachable by construction) |
| I-2 | `queue:653-668` | `triagePrompt` | emits a seam token alongside the verdict (AC-5.5) |
| I-3 | `queue:302` | `parseTriageVerdict` | returns `{ verdict, reason, seamToken }` |
| I-4 | `queue:912-921` | the `needs-human` skip branch | routes to A1/A2 when the tier is on |
| I-5 | `queue:758-767` | `main` parameter list | gains the advisory injection seams |
| I-6 | `dev:8276-8290` | Phase DOD step-0 rebase conflict halt | A4 fires before `haltError` |
| I-7 | `dev:8294-8305` | DoD not-passed halt | A3 fires before `haltError` |
| I-8 | `dev:6337-6403` | `raisePrAndVerifyCi` | A5 fires on the `status === "failed"` branch (`dev:6371-6373`) |
| I-9 | `dev:8595` | `buildFinalReport` | gains `advisory` (summary rows + rung) |
| I-10 | `dev:1321-1328` | `MERGE_ESCALATIONS` | **untouched** (N-1); a sibling `ADVISORY_ESCALATIONS` is added |
| I-11 | `dev:8316-8360` | Phase H harvest + guard-block detection | untouched; the advisory distil is a new post-PUB step (§9.3) |
| I-12 | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35,43,52-59` | the delete guard | token set gains `ADVISORY`; message gains the class (§9.4) |
| I-13 | `dev:6976-7015` | `main` parameter list | gains `_advisory*` seams |
| I-14 | `build:87`, `build:96-103` | bundle composition | §2.3 |

## 3. Configuration and model-rung resolution (FSPEC-ADV-01)

### 3.1 Constants

```js
// Placement: orchestrate-dev.js, immediately after MODEL_IMPLEMENTATION (dev:1621),
// so all four rungs read as one block (AC-1.5).
const MODEL_ADVISORY = "fable";          // BL-01 — see §3.3
const MODEL_ADVISORY_FALLBACK = "opus";  // === MODEL_DEFAULT's literal, deliberately a separate constant

export const ADVISORY_CONFIG_PATH = MERGE_CONFIG_PATH;  // ".claude/pdlc.config.json" (dev:43)

// The permitted-action set — the whole envelope, shipped. A seam's own
// `permittedActions` is a SUBSET of this (§4.3, §8.3); this frozen literal is the
// operand T-03-8 transcribes for its set-equality assertion. Frozen exactly as
// ADVISORY_REFUSAL_REASONS (§5.3) is; the members are FSPEC E-1…E-4 verbatim.
export const ENVELOPE_DEFAULTS = Object.freeze(["E-1", "E-2", "E-3", "E-4"]);

export const ADVISORY_DEFAULTS = Object.freeze({
  enabled: false,
  attemptBudget: 3,
  seamBudgetMinutes: 10,
  envelope: ENVELOPE_DEFAULTS,   // the four-member literal above
});

export const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5"]);
```

`MODEL_ADVISORY_FALLBACK` is a **separate constant** whose literal happens to equal
`MODEL_DEFAULT`'s. Aliasing them would make AC-1.3's "always distinguishable" claim depend on an
accident: if a future change repoints `MODEL_DEFAULT`, an aliased fallback would move with it and the
declared substitution would silently name a different rung.

### 3.2 `parseAdvisoryConfig(text)` — pure, total, never throws

Modelled on `parseImplementationConfig` (`dev:181-231`) rather than `parseMergeConfig`
(`dev:101-151`), because that is the shipped precedent for the exact contract FSPEC C-2 asks for:
independent per-key fallback **plus** an `invalidKeys` list the caller reports.

```js
/**
 * @param {string|null} text  raw file contents, or null (absent/unreadable)
 * @returns {{ config: object, sectionMalformed: boolean, invalidKeys: string[] }}
 */
export function parseAdvisoryConfig(text) { … }
```

| FSPEC rule | Implementation |
|---|---|
| C-1 — absent section / absent file / unreadable JSON ⇒ defaults, never a run failure | the three early returns of `parseImplementationConfig` (`dev:188-197`), verbatim shape |
| C-2 — one bad key falls back alone, substitution reported | each key validated independently; the key's name is pushed to `invalidKeys` |
| C-3 — read once per run, before the first seam can fire | `readAdvisoryConfigSafely` is called once in each `main()` (§6.1, §7.1) and the result threaded, never re-read |
| C-4 — no agent may write the file, no agent output may change a value | the config object is frozen after parse; no code path passes it to `_writeFile`, and §5 reads only from it |

**One deliberate deviation from C-2, resolving an FSPEC conflict (see the erratum in §16.4).**
When `advisory.enabled` degrades to its `false` default, the run is a *disabled* run, and D-5/S-4/T-10-4
require a disabled run to carry **no** advisory content on the report. The reporting half of C-2 is
therefore suppressed exactly when the effective `enabled` is `false`:

```js
// caller, in main()
if (advisory.config.enabled && advisory.invalidKeys.length) {
  emit(`Advisory config: using defaults for ${advisory.invalidKeys.join(", ")}`);
}
```

The parse itself still records every degraded key — the suppression is at the *emit*, so
`parseAdvisoryConfig` stays pure and its `invalidKeys` contract stays uniform and unit-testable.

### 3.3 The advisory alias, and why the fallback is the shipped path

REQ BL-01 / FSPEC OQ-1 leave the literal to this document. Two facts bound the choice:

1. Every rung the runtime resolves today is a **bare alias** — `"opus"`, `"sonnet"` (`dev:1578`,
   `dev:1621`, `queue:69`) — passed straight through by the adapter to `RT.agent(..., { model })`
   (`runtime-adapter.js:56-62`). The runtime, not this repo, owns the alias table.
2. The Fable rung exists as an API model (`claude-fable-5`). **Whether the workflow runtime resolves
   the bare alias `"fable"` is not verifiable from this repo** — the alias table is runtime-side and
   there is no local probe for it.

So: **`MODEL_ADVISORY = "fable"`**, pinned here, and the AC-1.2/AC-1.3 fallback path is treated as a
**shipped, tested path — not an error path**. The PLAN carries a one-line manual verification step
(dispatch one trivial advisory agent on `"fable"` in a real runtime and record which branch fired);
the tier ships correctly either way, which is what "non-fatal by construction" means.

### 3.4 `resolveAdvisoryRung` — lazy, once per run

```js
/**
 * Resolve the advisory rung at the FIRST advisory dispatch of a run (§15.2 — lazy).
 * @param {{ _agent, _log, _state }} deps
 * @returns {Promise<{ model: string, fallback: boolean }>}
 * @throws  haltError when neither rung resolves (M-3)
 */
export async function resolveAdvisoryRung({ _agent, _log, _state }) { … }
```

- `_state` is the per-run memo (`{ resolved: null }`). A non-null memo returns immediately — that is
  M-4 ("decided once per run") and F-1, and it is why a run in which no seam fires resolves nothing
  at all (T-01-7).
- **Non-resolution is detected by classifying the rejection, not by a probe dispatch.** M-1 defines it
  as "the runtime rejected the dispatch with a model/alias error **before the agent produced any
  output**". The implementation therefore wraps the *real* first dispatch:

```js
const MODEL_ERROR_RE = /\b(unknown|unrecognis|unrecogniz|invalid|unsupported)\b[^\n]*\b(model|alias)\b/i;

export function isModelResolutionError(err) {
  return MODEL_ERROR_RE.test(String(err?.message ?? err ?? ""));
}
```

`isModelResolutionError` is a **pure, exported, separately-tested predicate** — it is the single
place M-1's definition lives, so T-01-5 (a dispatch that starts and then fails mid-flight) is a unit
test over it rather than an integration fixture. A rejection it does not match is an ordinary
invocation failure and goes to §4's lifecycle, never to the ladder.

- On a matched rejection: emit `ADVISORY_MODEL_FALLBACK: "fable" did not resolve — substituting "opus"`,
  set `{ model: MODEL_ADVISORY_FALLBACK, fallback: true }`, and **re-dispatch the same prompt**.
- If the fallback dispatch is *also* rejected as a model error: `throw haltError(...)` (`dev:1755`).
  There is no third rung (M-3), and no advisory agent has run.

### 3.5 Why the resolution memo is a parameter, not module state

`_state` is threaded from `main()` rather than held in a module-level `let`. The bundle inlines
`devModule` into **both** artifacts (`build:281`, `build:288`), and jest runs every test against one
imported module instance — a module-level memo would leak resolution across tests and across a
queue invocation's delegated `orchestrate-dev` run. Threading it also makes M-4 assertable directly:
a test passes one `_state` object through two seams and asserts one dispatch-classification occurred.

## 4. The advisory core — types, protocols, invocation lifecycle (FSPEC-ADV-02)

### 4.1 A note on "interfaces" in this codebase

The workflow modules are ES modules with **JSDoc typedefs**, not TypeScript — there is no compiler in
this pipeline, and the bundle's `stripModuleSyntax` (`build:45`) removes nothing but `import`/`export`
lines, so a `.d.ts` would be dead weight. Every service boundary below is therefore expressed as a
JSDoc `@typedef` — a JSDoc form the runtime's `stripModuleSyntax` leaves untouched. It extends the
shipped documentation convention, JSDoc `@param`/`@returns` contract annotations, which
`parsePlanTasks` (`dev:2039`), `decideMerge` (`dev:835`) and `dodVerifyLoop` (`dev:6273`) already
carry (see e.g. `dev:98-99`, `dev:626-629`, `dev:6271-6273`); the module carries no `@typedef` block
today, so these are the feature's own, for its richer data types.
The boundaries are real regardless of the notation: `SeamOps` below is injected, has one
implementation per seam, and is faked wholesale in tests.

### 4.2 Data types

```js
/**
 * @typedef {Object} AdvisoryVerdict          AC-2.1 / FSPEC §4.2. The agent's product.
 * @property {"A1"|"A2"|"A3"|"A4"|"A5"} seam
 * @property {string}   diagnosis             non-empty
 * @property {string}   proposedAction        non-empty; may be the literal "nothing"
 * @property {"high"|"low"} confidence
 * @property {boolean}  withinEnvelope        ADVISORY ONLY — never the membership decision (V-3)
 * @property {string[]} evidence              non-empty; file:line / log citations
 */

/**
 * @typedef {Object} AdvisoryDisposition      V-7. Exactly three terminal values.
 * @property {"resolved"|"escalated"|"no-action"} outcome
 * @property {string|null} reason             one §5.3 reason iff outcome === "escalated"
 * @property {AdvisoryVerdict|null} verdict   last well-formed verdict, if any
 * @property {number}  attempts               attempts consumed
 * @property {string}  model                  the rung actually used (§3.4)
 * @property {boolean} fallback
 */
```

`parseAdvisoryVerdict(raw)` is pure and total, returning `{ verdict, malformed, why }`. It enforces
every well-formedness rule of §4.4 in one place — wrong seam, empty `evidence`, empty `diagnosis`,
absent/`"nothing"`-only handling, an out-of-enum `confidence` — so V-4's five error rows are five
unit cases over one function, not five integration fixtures. It follows `parseDodStatus`
(`dev:6059`) and `parseVerdict` (`dev:2445`): parse the agent's trailer, never trust its shape.

### 4.3 The `SeamOps` protocol — one implementation per seam

`runAdvisorySeam` owns the lifecycle, the budgets, the envelope gate, the refusal ladder, the record
and the escalation. It knows **nothing** seam-specific. Everything seam-specific is behind this
injected protocol, which is why A1/A2 can live in `orchestrate-queue.js` while the driver lives in
`orchestrate-dev.js` (§2.2).

```js
/**
 * @typedef {Object} SeamOps
 * @property {() => Promise<string>}            gatherEvidence   seam evidence for the prompt
 * @property {(evidence: string) => string}     prompt           the dispatch prompt
 * @property {() => Promise<boolean>}           conditionHolds   step 3b RE-CHECK (V-7 no-action)
 * @property {(v: AdvisoryVerdict) => Promise<{ok: boolean, why?: string}>} apply
 * @property {() => Promise<string[]>}          producedPaths    paths the apply touched (E-R2)
 * @property {() => Promise<void>}              revert           restore the pre-invocation state
 * @property {() => Promise<{passed: boolean, detail?: string}>} verifyGate  §5.4's gate row
 * @property {string[]}                         declaredScope    X-d's file set
 * @property {string[]}                         permittedActions subset of {E-1..E-4} for this seam
 */
```

Per-seam bindings: A1 §6.3, A2 §6.4, A3 §7.2, A4 §7.3, A5 §8.2. A seam with no permitted action
(A1, A3) supplies `permittedActions: []` and an `apply` that is never reached — the §5.1 gate refuses
first — which is how A1-4 and A3-6 ("changes no file") become structural rather than aspirational.

### 4.4 `runAdvisorySeam` — the one impure component

```js
export async function runAdvisorySeam({
  seam, feature, seamOps, config, rungState,
  _agent, _appendFile, _writeFile, _readFile, _git, _log, _now,
}) { … }   // → Promise<AdvisoryDisposition>
```

The loop, mapped to FSPEC §4.1's numbered steps:

| Step | Implementation note |
|---|---|
| entry | `config.enabled === false` ⇒ returns **before** any dispatch and before `resolveAdvisoryRung` (D-1, D-2). §11 asserts this is the only enabled-check in the path. |
| 1 DIAGNOSE | `_agent("se-review", seamOps.prompt(await seamOps.gatherEvidence()), { model: rung.model })`. `se-review` is the skill: every seam is judgment-under-evidence, which is that skill's declared lens. |
| 2 VALIDATE | `parseAdvisoryVerdict` (§4.2). Malformed ⇒ consume an attempt, loop or terminate. |
| 3 GATE | `classifyEnvelope` (§5.1) **and** `verdict.confidence === "high"` — both required (V-1, BR-2). |
| 3b RE-CHECK | `await seamOps.conditionHolds()`; false ⇒ `no-action`, consuming no attempt (§4.4 last row). |
| 4 ACT | `seamOps.apply(verdict)`. |
| 5 CHECK | `classifyEnvelope` again over `await seamOps.producedPaths()` (E-R2, BR-3). Outside ⇒ `revert`, refuse. |
| 6 VERIFY | `seamOps.verifyGate()`. Fails ⇒ `revert`, refuse `post-action-verification-failed`. |
| 7 RECORD | `appendAdvisoryEntry` (§9.2). Throws ⇒ `revert`, refuse `record-write-failed` (R-2). |

**The A5 and A2 step re-orderings are a `SeamOps` concern, not a driver branch.** FSPEC §4.1 says
that at A5 steps 5 and 7 complete *before* the push and step 6 (the re-poll) follows it. Rather than
special-casing A5 inside the driver, `apply` is defined as *"do everything up to but not including
the irreversible act"* and `verifyGate` as *"perform the irreversible act, then run the gate"*. At
A5 that means `apply` = write the fix locally, `verifyGate` = push + re-poll. At A2 it means
`apply` = rewrite the REQ, `verifyGate` = commit the REQ **and** the advisory record in one
pathspec-scoped commit, then confirm the branch head carries both. The driver's step order is then
uniform across all five seams, and BR-5's two-tree-states invariant is asserted against the
pre-`verifyGate` tree everywhere.

**This resolves an FSPEC gap** (erratum, §16.4): FSPEC A2-6 requires an applied re-grounding to be
*committed* before the invocation ends, while R-2 requires a failed record write to un-take the
action — an ordering FSPEC never reconciles, and which naively demands undoing a commit. Under the
split above, at A2 the record is written at step 7 and **the commit does not exist yet**: step 7's
failure reverts a working-tree edit only. §6.4 gives the exact call order.

### 4.5 Budgets

```js
export function budgetExceeded({ attempts, attemptBudget, elapsedMs, waitMs, seamBudgetMinutes })
```

Pure, so V-5's arithmetic — including the rollup-wait carve-out — is unit-tested without a clock.
`waitMs` is the accumulated check-rollup wait the seam reports (A5 only; zero elsewhere), and the
wall-clock comparison is `elapsedMs - waitMs >= seamBudgetMinutes * 60_000` (NFR-4).

- **Preemption (V-5, T-02-5).** The bound must end an in-flight attempt, so the driver races the
  dispatch against a deadline rather than checking between attempts:
  `await Promise.race([dispatch, deadline(_now, _sleep, remainingMs)])`. `_now`/`_sleep` are already
  injected seams on both `main()`s (`dev:6995-6996`, and `raisePrAndVerifyCi` threads them at
  `dev:6342-6343`), so no new capability is introduced and tests drive a fake clock.
- **Termination-condition ordering (§5.3's opening clause).** The reason is computed **once, at
  termination**, from the condition that ended the invocation — never accumulated across attempts.
  `refusalReasonFor(signals)` (§5.3) takes the terminating signal set and returns the first match in
  the ordered catalogue; that is why "malformed on every attempt, budget then exhausted" reports
  `budget-exhausted` (§4.4 row 1) with no special-casing.
- **Sequencing (V-6, F-2).** `runAdvisorySeam` is `await`ed at each seam's call site inside the
  already-sequential phase body; nothing wraps it in `parallel` (`dev:7359`). One invocation per seam
  condition per run (F-3) follows from each call site being reached at most once per run.

### 4.6 Error handling inside the lifecycle

| Scenario | Behaviour | Where enforced |
|---|---|---|
| dispatch throws, not a model error | ordinary invocation failure: consumes an attempt, loops or terminates `escalated` | `runAdvisorySeam` try/catch; `isModelResolutionError` false (§3.4) |
| `parseAdvisoryVerdict` malformed | consume attempt; reason `malformed-verdict` **only if it terminates the invocation** | §4.5 termination-condition rule |
| `seamOps.apply` returns `{ok: false}` | `revert`, refuse `post-action-verification-failed` | driver step 4 |
| `seamOps.revert` itself throws | rethrown as a halt — an unrevertable tree is not a state this feature may leave silently; BR-5 admits exactly two states | driver |
| `_appendFile` throws (step 7) | `revert`, refuse `record-write-failed` | driver step 7 |
| escalation-log write throws (§10) | escalation **stands**; the failure is a report notice | outside the try that governs the action (§10.2) — the deliberate asymmetry of T-09-8 |

The last two rows are the asymmetry FSPEC calls out: the record is a precondition of an action
*surviving*, the escalation log is not, because an escalation is the pipeline doing strictly less.

## 5. Envelope enforcement, refusal ladder, prohibitions (FSPEC-ADV-03, ADV-04)

### 5.1 `classifyEnvelope` — one pure function, evaluated twice

```js
/**
 * @param {{ action: string, paths: string[] }} candidate  proposal (step 3) or produced diff (step 5)
 * @param {{ seam: string, permittedActions: string[], declaredScope: string[],
 *           guardPaths: string[], capabilities: object }} ctx
 * @returns {{ inside: boolean, reason: string|null, matched: string[] }}
 *          reason ∈ {"prohibited-action","revert-on-test-touch","out-of-envelope"} | null
 */
export function classifyEnvelope(candidate, ctx)
```

Pure and total — no IO, no clock, no agent. E-R3/NFR-1 are satisfied structurally: the only caller is
`runAdvisorySeam` steps 3 and 5, and no prompt text participates in the decision. E-R2/BR-3 are
satisfied by **calling the same function twice with different `candidate`s** rather than by two
code paths that could drift.

Evaluation order inside `classifyEnvelope` — deliberately the §5.3 order, so a candidate that
satisfies two exclusions yields the earlier reason without the caller re-deriving it:

| # | Check | Implementation |
|---|---|---|
| 1 | P-1…P-4 prohibitions | `isProhibited(candidate, ctx)` — §5.4 |
| 2 | X-a test artifacts | `touchesTestArtifact(paths, action)` — §5.2 |
| 3 | X-e self-modification guard paths | **`guardVerdict(changed, ctx.guardPaths)` reused verbatim** (`dev:731`), with `ctx.guardPaths = effectiveGuardPaths(mergeConfig.guardPaths)` (`dev:708`) |
| 4 | X-d declared scope | every path ∈ `ctx.declaredScope` |
| 5 | X-b DoD criteria / thresholds | path-and-content predicate, §5.2 |
| 6 | X-c / membership | `candidate.action ∈ ctx.permittedActions` and the action's decidable rule holds |

**Row 3 is a cite-and-reuse, not a new mechanism.** Phase MERGE already ships the exact predicate
X-e needs — an anchored, `/`-delimited, non-globbing `startsWith` match over a frozen default set
plus additive config (`dev:716-737`, `dev:47-53`) — including the fail-closed `ok !== true` branch
that makes an unretrievable file list a guard *hit*. Building a second matcher for X-e would let the
two disagree about, say, `pdlc/workflowsX/`; reusing it makes T-03-10 and Phase MERGE's own guard
tests describe one behaviour. The advisory tier passes a synthesised `{ ok: true, files }`, so it
takes the same matcher without inheriting the `gh`-observation shape.

### 5.2 The two predicates this feature does own

```js
export const TEST_PATH_RE = /(^|\/)(tests?|__tests__|spec)\//i;
export const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$|^conftest\.py$|_test\.py$|^test_.*\.py$/i;
export const TEST_CONFIG_RE = /(^|\/)(jest\.config|pytest\.ini|\.coveragerc|setup\.cfg|vitest\.config|mutmut\.ini)/i;

export function touchesTestArtifact(paths, action)   // X-a — path OR operation
export function touchesDodCriterion(paths, action)   // X-b
```

X-a is **path-based *and* operation-based**, because AC-3.5 enumerates operations ("narrowing a
parametrised case list", "adding a skip/xfail/only marker", "lowering a coverage threshold") that a
path test alone cannot catch — a threshold lives in `package.json` or `pyproject.toml`, neither of
which matches a test path. `action` therefore carries the seam's structured description of the edit,
and each of T-03-3's seven enumerated operations maps to one clause. **This is the hardest-enforced
rule in the feature and the one the PLAN gives its own batch**: the seven operations are seven named
tests, and a dropped clause fails the suite by construction (§13.4).

`declaredScope` (X-d) is computed per seam, never inferred by an agent:

| Seam | `declaredScope` | Source |
|---|---|---|
| A1 | `[]` — A1 changes no file (A1-4) | constant |
| A2 | `[reqPath]` exactly (A2-5) | the candidate's own REQ path from the queue row (`queue:116` `parseQueue`) |
| A3 | `[]` — A3 changes no file (A3-6) | constant |
| A4 | PLAN-named files ∪ `git diff --name-only {mergeBase}..{preRebaseHead}` | `parsePlanTasks` (`dev:2039`) + `_git` (`dev:6822`) |
| A5 | PLAN-named files ∪ `git diff --name-only {mergeBase}..HEAD` | same |

### 5.3 The refusal ladder as a frozen, ordered catalogue

```js
export const ADVISORY_REFUSAL_REASONS = Object.freeze([
  "prohibited-action",
  "revert-on-test-touch",
  "out-of-envelope",
  "post-action-verification-failed",
  "record-write-failed",
  "malformed-verdict",
  "low-confidence",
  "budget-exhausted",
]);

// The exclusion set — the second operand of T-03-8's set-equality, frozen and
// exported exactly as the reasons above are, so the test transcribes a literal
// rather than scraping §5.1's prose table. The members are FSPEC X-a…X-e verbatim;
// the ARRAY ORDER is §5.1's evaluation order (X-a test artifacts, X-e guard paths,
// X-d declared scope, X-b DoD criteria, X-c/membership), so a single frozen constant
// pins both "which exclusions exist" (set identity) and "in what order they fire".
export const ADVISORY_EXCLUSIONS = Object.freeze(["X-a", "X-e", "X-d", "X-b", "X-c"]);

/** @param {Object<string,boolean>} signals  the conditions true AT TERMINATION
 *  @returns {string} the first matching reason, in catalogue order */
export function refusalReasonFor(signals)
```

`classifyEnvelope`'s §5.1 evaluation loop iterates `ADVISORY_EXCLUSIONS` in order
(after the P-1…P-4 prohibition check), so the table in §5.1 and this constant cannot
drift: the table documents what the constant drives.

Frozen exactly as `MERGE_MODES` / `MERGE_STATUSES` / `LIST_FAILURES` are (`dev:54-55`, `dev:1600`) —
the shipped convention for a closed set, and what makes T-03-5's set-equality assertion a one-liner
against the exported constant rather than a scrape of the source. `refusalReasonFor` returning the
**first** match is the whole of "the first matching trigger wins"; T-03-4 is a direct unit test over
it with two signals set.

`signals` is built once, at termination, from the terminating condition — never accumulated (§4.5).

### 5.4 Prohibitions — structural, not asserted

| # | Prohibition | How code makes it unreachable |
|---|---|---|
| P-1 | never mark a DoD criterion satisfied / weaken one / reduce the iteration count | `DOD_MAX_ITERATIONS` (`dev:25`) and `dodVerifyLoop`'s `maxIterations` (`dev:6273-6275`) are never passed anything advisory-derived; A3's `permittedActions` is `[]`; X-b refuses any diff touching a criterion |
| P-2 | never set `ready: true` on a REQ | A2's `apply` rewrites **citation lines only**; the frontmatter block that `parseReqFrontmatter` reads (`queue:232`) is excluded from the rewritable region, and a produced diff touching it fails X-d (scope is the REQ but the *action* is not E-4) |
| P-3 | never declare CI passed | `ciStatus` continues to come only from `checkPrCi` (`dev:5927`) via `raisePrAndVerifyCi` (`dev:6337-6369`); no advisory value is ever assigned to it. §8.4 |
| P-4 | never merge a PR, never alter a queue `Status` cell | no advisory path calls `executeMerge` (`dev:1130`), `phaseMerge` (`dev:1361`), `rewriteStatus` (`queue:1086`) or `updateQueueStatus` (`queue:358`); the queue-side `SeamOps` are constructed without `_writeFile` bound to `queuePath` |

Each row is also a **negative-and-positive** test per AC-4.6 / T-03-6: the prohibited thing does not
happen **and** the §4.3 V-8 triple holds on the same path. A test asserting only the negative would
pass against a build where the seam never fired at all, which is the accident AC-4.6 names.

NFR-5 (no new credentials) is structural too: the advisory tier's only outward-facing capabilities
are `_ghRun` (`dev:581`) and `_git` (`dev:6822`), both already held and both already injected — it
introduces no new transport. What it *does* newly require of those existing transports is §8.3's two
capability probes.

### 5.5 The gate that re-runs, per seam

`SeamOps.verifyGate` (§4.3) is the only place a gate is named, and every implementation delegates to
an existing gate rather than reimplementing one:

| Seam | `verifyGate` implementation | Existing symbol reused |
|---|---|---|
| A1 | `async () => ({ passed: true })` — A1 has no post-action gate (§5.4's "—" row); its safety is A1-3's escalate-when-unsettled, and `permittedActions: []` means the gate is unreachable anyway | — |
| A2 | commit the REQ + record, then confirm the branch head carries them | `commitPaths` (`dev:6905`), pathspec-scoped |
| A3 | unreachable (`permittedActions: []`) | — |
| A4 | complete the rebase, then run the branch's test command | `rebaseOntoDefault` (`dev:6254`), `_runCommand` (`dev:7012`) |
| A5 | push, then re-read the rollup | `_git`, `checkPrCi` (`dev:5927`) |

BR-6 ("a gate, not an agent, ends a seam") is therefore not a rule the code must remember: the
driver's only route to `resolved` runs through `verifyGate`, and no `verifyGate` consults an agent.

## 6. Seams A1 and A2 — the queue module (FSPEC-ADV-04)

### 6.1 Wiring into `orchestrate-queue.js`

`main` (`queue:758-767`) gains the injection seams and one config read, placed **after** the drift
gate (`queue:786-799`) and **before** `QUEUE.md` is read — so §6.5's "drift gate blocks first" row is
structural, and C-3's once-per-run read holds:

```js
export default async function main({
  queuePath = DEFAULT_QUEUE_PATH,
  _agent: rawAgentFn = agent,
  … existing seams …
  _appendFile: appendFileFn = defaultAppendFile,      // NEW — the advisory record
  _runAdvisorySeam: runAdvisorySeamFn = runAdvisorySeam,          // free ident, §2.3
  _readAdvisoryConfig: readAdvisoryConfigFn = readAdvisoryConfigSafely,
} = {}) {
```

`_appendFile` is new to the queue module; `defaultAppendFile` already exists in dev (`dev:6805`) and
crosses on the same prelude as the rest of §2.3, so the queue gains no new Node capability.

**The advisory dispatch does not go through the queue's `agentFn` wrapper** (`queue:773-774`), which
pins `MODEL_QUEUE = "sonnet"`. `runAdvisorySeam` receives `rawAgentFn` and applies the advisory rung
itself (§3.4) — otherwise `{ model: MODEL_QUEUE, ...opts }`'s spread would be overridden but the
intent would be invisible at the call site, and M-5's "one edit changes the rung" would be false for
the queue.

### 6.2 Routing: the seam token (AC-5.5)

Two edits, both small and both required before A2 has a testable precondition:

**`triagePrompt` (`queue:653-668`)** gains a token on each verdict line. The existing three-verdict
grammar is preserved exactly; the token is appended, so an agent that omits it still parses:

```
TRIAGE: needs-human [SEAM:A1] <one-line reason>   — ambiguous; a human must decide
TRIAGE: needs-human [SEAM:A2] <one-line reason>   — the REQ's file:line citations have drifted
```

The prompt also gains A2's obligation, which the baseline does **not** contain (B-3): *"Check whether
the REQ's `file:line` citations still resolve at HEAD. If some have drifted but every cited symbol
still exists, return `needs-human [SEAM:A2]`."* This is the "introduced, not routed" work OQ-2 names.

**`parseTriageVerdict` (`queue:302-323`)** gains a third return field. Its shape is preserved —
same last-line-wins scan, same fail-closed `needs-human` fallback (`queue:303-306`), which already
gives an absent token the A1 default FSPEC §6.2 requires:

```js
const m = /^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(?:\[SEAM:(A1|A2)\]\s*)?(.*)$/i.exec(trimmed);
return { verdict: m[1].toLowerCase(), seamToken: (m[2] || "").toUpperCase() || null, reason: … };
```

`seamToken` is `null` for an absent **or** unrecognised token — an unrecognised one simply fails the
alternation and falls into `reason`, which is exactly §6.5's "routed to A1" row with no extra branch.
"Both tokens on one stop" (§6.5) fails the anchored single-group match and yields `seamToken: null`
plus a reason beginning `[SEAM:` — the driver treats a reason with a leading unconsumed `[SEAM:` as
malformed (V-4), which is one predicate, `hasResidualSeamToken(reason)`.

### 6.3 A1 — `SeamOps` for triage adjudication

| Member | Implementation |
|---|---|
| `gatherEvidence` | the triage reason, the candidate's `dependsOn` union, and `precheckDependencies(dependsOn, entries)`'s result (`queue:630-649`) — a **pre-condition already computed**, passed as evidence, never re-derived by the agent |
| `prompt` | asks for `run-candidate` / `hold` / `escalate`, mapped onto `AdvisoryVerdict.proposedAction`; the `AdvisoryVerdict` shape is unchanged (one contract, five seams) |
| `conditionHolds` | `async () => true` — a triage stop cannot evaporate mid-invocation |
| `permittedActions` | `[]` — A1-4. Any proposal is `out-of-envelope`; the seam's whole product is a verdict, a record, and possibly an escalation |
| `declaredScope` | `[]` |
| `apply` / `producedPaths` / `revert` | unreachable; implemented as throwing stubs so a future change that made them reachable fails loudly rather than silently acting |
| `verifyGate` | `async () => ({ passed: true })` — §5.5 |

**A1-2 as defence in depth.** `run-candidate` is honoured by `honourA1Verdict(verdict, precheck)`, a
**pure exported function** that refuses when `precheck.blocked` is true. On the production path that
state is unreachable — `queue:890-898` skips a blocked candidate before triage runs — so T-04-3b is a
unit test over `honourA1Verdict` and T-04-3 is the reachable integration assertion. Splitting them is
why an unreachable rule can still be tested without faking an impossible pipeline state.

**A1-3 (presence in base is unsettled ⇒ escalate)** is enforced in the same function: a dependency
absent from `entries` yields `escalate` regardless of the agent's verdict, because
`precheckDependencies` is one-sided by construction (`queue:621-624`, `queue:645`). No agent
adjudicates presence in base — the pipeline decides, from the queue rows.

**A1-5 (one pick per invocation)** needs no new mechanism: `runPicked` (`queue:961`) `return`s out of
the candidate loop (`queue:924`). A `hold` verdict `continue`s the existing loop; a `run-candidate`
verdict falls into the existing `return runPicked(...)`. The serial guarantee is the loop's, not the
advisory tier's.

### 6.4 A2 — `SeamOps` for stale-REQ re-grounding

| Member | Implementation |
|---|---|
| `gatherEvidence` | the REQ text and, per load-bearing citation, whether the cited symbol resolves at HEAD (`_git grep -n` through the existing `_git` seam) |
| `prompt` | asks for a re-grounding proposal: one row per drifted citation, `{ oldLocation, newLocation, symbol, symbolStillExists }` |
| `conditionHolds` | re-reads the REQ; `false` if it changed under us |
| `permittedActions` | `["E-4"]`, and E-4's decidable rule — *every* drifted citation's symbol still exists — is checked in `classifyEnvelope`, not in the prompt (A2-3) |
| `declaredScope` | `[reqPath]` only (A2-5) |
| `apply` | rewrite **citation location text only** in the working tree; the frontmatter region and every requirements sentence are outside the rewritable span (P-2, A2-3) |
| `producedPaths` | `git diff --name-only` — must equal `[reqPath]`, else E-R2 reverts whole |
| `revert` | `git checkout -- {reqPath}` — a working-tree restore, because nothing is committed yet |
| `verifyGate` | §6.4.1 |

#### 6.4.1 The A2 durability order — resolving FSPEC's A2-6 / R-2 gap

Per §4.4, the irreversible act belongs in `verifyGate`, after the record write. The exact order:

```
4  apply         rewrite the REQ in the working tree
5  CHECK         producedPaths === [reqPath]           → else revert (checkout), refuse
7  RECORD        append docs/{feature}/ADVISORY-{feature}.md   → else revert, refuse record-write-failed
6  verifyGate    commitPaths({ paths: [reqPath, recordPath], … })   ← ONE commit, both files
                 then re-read the branch head and confirm both are present
                 → else revert (git reset --hard the commit if it landed; checkout otherwise), escalate
```

Step 7 precedes step 6 **only at the seams whose act is irreversible** (A2, A5); §4.4 states the rule
once and both seams inherit it. The consequence is the one FSPEC leaves undefined: a failed record
write at A2 reverts a *working-tree edit*, never a commit, so BR-5's two-tree-states invariant holds
without the tier ever needing to rewrite history.

Both A2-6 and H-2b demand durability, and both are satisfied by the **same commit**: the re-grounded
REQ and the advisory record land together, pathspec-scoped and unpushed, exactly as `commitQueueRow`
(`queue:1162`) already commits `QUEUE.md` alone. `commitPaths` (`dev:6905`) is reused verbatim,
including its `gitWithLockRetry` behaviour (`dev:6862`) — index-lock contention during a queue run is
a real condition this seam inherits a solution for rather than rediscovers.

**A2-4 (applying does not pick the candidate)** is a `continue`, not a `return`: after a resolved A2
the loop moves to the next queue entry. Triage re-runs on the corrected REQ in the **next** invocation,
which is a fresh process reading the branch head — which is precisely why the commit is required and
why T-04-6 asserts a *subsequent* invocation sees it.

### 6.5 Error handling, queue-side

| Case | Behaviour | Enforced by |
|---|---|---|
| drift gate blocks the invocation | no seam fires; `blocked` outcome stands | config read placed after the gate (§6.1) |
| triage returns `blocked` | never adjudicable; existing skip (`queue:907-911`) untouched | routing runs only on the `needs-human` branch |
| unrecognised seam token | `seamToken: null` ⇒ A1 | the regex alternation (§6.2) |
| both tokens on one stop | malformed (V-4) | `hasResidualSeamToken` |
| REQ has no citations | empty proposal ⇒ `no-action`, recorded, not resolved | `parseAdvisoryVerdict` treats an empty proposal row set as `proposedAction: "nothing"`; §4.4 row 4 |
| two drifted citations now point at one symbol | still inside E-4 — the rule is per citation | `classifyEnvelope` iterates rows, never targets |
| REQ not writable / write fails | `apply` returns `{ok:false}` ⇒ revert, `post-action-verification-failed` | driver step 4 |
| the commit fails (hook, identity, lock) | `verifyGate` fails ⇒ revert, escalate | `commitPaths`'s existing failure shape |

## 7. Seams A3 and A4 — Phase DOD (FSPEC-ADV-05, ADV-06)

### 7.1 Wiring into `orchestrate-dev.js`

`main` (`dev:6976-7015`) gains `_runAdvisorySeam` and `_readAdvisoryConfig`; the config is read once,
before the phase loop, and the resolution memo `{ resolved: null }` is created beside it (§3.5). The
Phase DOD body (`dev:8276-8305`) gains two insertion points, both **immediately before an existing
`throw haltError(...)`**, which is what makes L-3 ("escalation never changes control flow") a
structural property: on every path the original `haltError` still executes.

```js
// dev:8281 — A4, before the rebase-conflict halt
if (rebaseStatus === "conflict") {
  const a4 = await runAdvisorySeamFn({ seam: "A4", … });
  advisory.record(a4);
  if (a4.outcome !== "resolved") {
    recordPhase("DOD", …, "❌", "Rebase onto default branch conflicted — resolve manually");
    throw haltError(…);                      // dev:8283-8287, byte-identical
  }
  // resolved ⇒ the branch is rebased and green; fall through to the DoD loop
}

// dev:8294 — A3, before the DoD not-passed halt
if (!dodResult.passed) {
  const a3 = await runAdvisorySeamFn({ seam: "A3", … });
  advisory.record(a3);
  recordPhase("DOD", …, "❌", `Failed after ${dodResult.iterations} iterations — ${detail}`);
  throw haltError(`${…} ${a3.classificationSummary ?? ""}`);   // dev:8300-8303 + AC-6.3's diagnosis
}
```

A3 **cannot** resolve — `permittedActions: []` — so its branch has no `if (resolved)` at all; the
halt is unconditional, which is A3-3 ("halts exactly as it does today") written as code rather than
as a rule to remember. The only difference is the appended classification, per AC-6.3.

### 7.2 A3 — `SeamOps` for DoD exhaustion

| Member | Implementation |
|---|---|
| `gatherEvidence` | `dodResult.lastStatus` (`dev:6306`, the `parseDodStatus` shape at `dev:6059`) plus the text of `CODE_REVIEW-{feature}-v{DOD_MAX_ITERATIONS}.md` read through `_readFile` |
| `prompt` | classify **every** remaining finding as `real-defect` / `mis-scoped-criterion` / `deferral-candidate`, each with evidence, and bind every `deferral-candidate` to a named successor |
| `conditionHolds` | `async () => true` |
| `permittedActions` | `[]` (A3-6) |
| `declaredScope` | `[]` |
| `verifyGate` | unreachable |

`parseA3Classification(raw)` is a pure function returning `{ classes: Array<{finding, class, evidence, successor?}>, complete: boolean }`:

- **A3-1** — `complete` is false when the classified-finding count is below the finding count in the
  evidence; an incomplete classification is malformed (V-4), so it consumes an attempt and, on budget
  exhaustion, the pipeline halts as today.
- **A3-2** — the three classes are a frozen exported array, set-equality tested like §5.3's reasons.
- **A3-7** — `governingClass(classes)` is pure and ordered: `real-defect` > `mis-scoped-criterion` >
  `deferral-candidate`. T-05-6 (a mixed run halts rather than escalating) is a unit test over it.
- **A3-4** — a `deferral-candidate` with no `successor` makes the proposal incomplete; the invocation
  escalates naming the unbound finding, and **no path writes a deferral row anywhere**. The tier holds
  no reference to `QUEUE.md` on the dev side, so "never enacts a deferral" is structural (P-4, §5.4).
- **§7.3's unreadable-verifier row** — `parseDodStatus` already returns `status: "unknown"` and the
  loop already treats that as failed (`dev:6304-6306`); A3 fires on the same not-passed branch and
  names the unreadable status as its evidence. The conservative baseline is not weakened.

**T-05-5 (the working tree is byte-identical after any A3 invocation)** is the assertion that catches
an A3 that quietly acquired a capability: it is a tree comparison, not a claim about `permittedActions`.

### 7.3 A4 — `SeamOps` for rebase conflict

| Member | Implementation |
|---|---|
| `gatherEvidence` | the conflicting-file list and, per file, the E-3 determination computed **by the pipeline**: `git cat-file -e {mergeBase}:{path}` and `git cat-file -e {defaultTip}:{path}` through `_git` |
| `prompt` | resolve each conflict in a branch-created file, reporting per file which side was taken and why (A4-5) |
| `conditionHolds` | re-read the rebase state; an empty conflict set ⇒ `no-action` (§8.3's first row) |
| `permittedActions` | `["E-3"]` |
| `declaredScope` | PLAN files ∪ `git diff --name-only {mergeBase}..{preRebaseHead}` — the **pre-rebase** head (A4-3), captured before `rebaseOntoDefault` is called |
| `apply` | write the resolutions into the conflicted working tree |
| `producedPaths` | `git diff --name-only`; must be a subset of the conflict set |
| `revert` | `git rebase --abort`, restoring the pre-seam head exactly as the halt would have left it (B-6) |
| `verifyGate` | `git rebase --continue`, then the branch's test command; §7.4 |

**A4-1 (*branch-created* is a property of the file, not of who edited it)** is computed by two
`git cat-file -e` probes, never by the agent — `branchCreated(path, mergeBase, defaultTip, _git)` is a
small exported function so E-3's rule is one testable predicate shared with `classifyEnvelope`.

**A4-2 / §8.3's mixed-set row.** A conflict set containing any non-branch-created file escalates
*before* anything is applied: the check is a precondition inside `gatherEvidence`'s determination, and
`classifyEnvelope` refuses the proposal. Partial resolution is therefore not merely discouraged — the
seam never reaches `apply` with a mixed set, which is what A4-6's "no third tree state" requires.

**X-a outranks E-3 (§8.3's branch-created-test-file row)** without a special case: `classifyEnvelope`
evaluates X-a at position 2 and E-3 membership at position 6 (§5.1), so a branch-created test file
resolves to `revert-on-test-touch`, not to a permitted E-3 action.

### 7.4 A4's verification, and the repo that has no test command

`verifyGate` runs `_runCommand(implConfig.testCommand)` — the **same** seam and the same config key
Phase I's script-owned wave gate already uses (`dev:8061`, `dev:8101`, `dev:8113`), read by
`parseImplementationConfig` (`dev:181`) with `testCommand: null` as its shipped default
(`dev:158-161`). Reusing it means a repo configures its suite once and both gates obey it.

Where `testCommand` is `null` or `_runCommand` is not a function — the same two-part check Phase I
makes at `dev:8061` — the resolution **cannot be verified**, so per FSPEC §8.3 the seam reverts and
escalates. An unverified resolution is never reported as resolved. Note the asymmetry with Phase I,
which *degrades* to a self-report scan in that case: degradation is acceptable for a gate over an
agent's own claim, and unacceptable for a gate that would otherwise let an unverified advisory
resolution stand.

**"Tests pass but the tree is dirty" (§8.3)** is caught by the step-5 produced-change check re-running
after `verifyGate`'s rebase completes: `producedPaths` is re-read post-gate and any path outside the
conflict set fails E-R2, reverting whole. This is the one place the driver evaluates membership a
third time, and it is why `classifyEnvelope` takes the candidate as an argument rather than reading
state.

## 8. Seam A5 — Phase PUB (FSPEC-ADV-07)

### 8.1 Wiring into `raisePrAndVerifyCi`

The seam fires on exactly one branch — `status === "failed"` (`dev:6371-6373`) — and nowhere else:

```js
// dev:6371, inside the poll loop
if (status === "failed") {
  const a5 = await _runAdvisorySeam({ seam: "A5", … });
  _advisoryRecord(a5);
  if (a5.outcome === "resolved") continue;      // the re-poll already returned green
  throw haltError(`Error: Phase PUB — GHA checks failed for PR ${prUrl}`);   // byte-identical
}
```

Three baseline paths are deliberately **untouched**, each a named FSPEC rule:

| Path | Baseline | Rule |
|---|---|---|
| `status === "none"` past the no-checks window → `{ ciStatus: "no-checks" }` (`dev:6389-6397`) | pass | A5-6 — the seam does not fire; the summary names the outcome |
| completion cap → `haltError` (`dev:6383-6388`) | halt | A5-9 — no failing check to diagnose; the summary names the outcome |
| `status === "passed"` (`dev:6367-6369`) | success | — |

`raisePrAndVerifyCi` gains two parameters, `_runAdvisorySeam` and `_advisoryRecord`, both defaulting
to no-ops, so every existing test of the function is unchanged and T-07-9/T-07-10 assert the
untouched paths directly.

### 8.2 A5 — `SeamOps`

| Member | Implementation |
|---|---|
| `gatherEvidence` | the failing job's log via `gh run view --log-failed` through `_ghRun` (`dev:581`); **plus** the two §8.3 capability determinations and the default-branch comparison, all computed before the agent is dispatched |
| `prompt` | name the failing step and the cause; classify as E-1 (flaky, re-run) / E-2 (branch-introduced lint/format/type) / neither |
| `conditionHolds` | re-read `checkPrCi(prUrl)`; anything other than `"failed"` ⇒ `no-action` (CI turned green on its own) |
| `permittedActions` | computed per invocation from §8.3's probes — `["E-1","E-2"]`, a subset, or `[]` |
| `declaredScope` | PLAN files ∪ `git diff --name-only {mergeBase}..HEAD` |
| `apply` | E-2: write the minimal fix and `git commit` locally. E-1: no-op (nothing to write) |
| `producedPaths` | `git diff --name-only {preSeamHead}..HEAD` |
| `revert` | `git reset --hard {preSeamHead}` — **pre-push only**; see A5-8 below |
| `verifyGate` | E-2: `git push`, then re-poll. E-1: `gh run rerun --failed`, then re-poll. Either way the verdict is the rollup's |

**A5-5 (no log ⇒ escalate)** is a `gatherEvidence` precondition: an unretrievable log short-circuits
to `escalated` before any dispatch, so no diagnosis is ever produced from a guess.

**A5-4 / P-3.** `ciStatus` is assigned only from `checkPrCi`'s return (`dev:6369`, `dev:6397`), which
reads GitHub's own `statusCheckRollup` (`dev:5933`). No advisory value reaches it, and T-07-7's "no
path exists by which an agent verdict sets it" is a grep-shaped assertion over the assignment sites.

**A5-8 — "revert" after a push.** The record write (step 7) and the produced-change check (step 5)
both complete **before** `verifyGate` pushes (§4.4). A red re-poll therefore escalates with the fix
commit still on the branch: nothing is force-pushed, no history is rewritten, and BR-5's invariant is
asserted on the pre-push tree. The escalation entry and the report both name the pushed commit, which
is what makes the operator's inherited state legible.

**A5-3 — attempts and the wait carve-out.** One attempt is one act → re-poll cycle, including E-1's
push-free re-run. The re-poll accumulates `waitMs`, which `budgetExceeded` (§4.5) subtracts from the
wall-clock bound, so the 10-minute default cannot end the invocation inside its first CI wait
(T-07-12). A re-poll that reaches Phase PUB's own completion cap **returns** rather than throwing when
called from inside the seam — `verifyGate` catches the cap and reports `{passed:false}` — so it
consumes an attempt instead of escalating separately (T-07-11).

### 8.3 Capability probes for BL-05 and BL-06

Both are per-repo runtime facts (§1.3), probed once per A5 invocation through the existing `_ghRun`
seam — no new credential, no new transport (NFR-5):

```js
export async function probeDefaultBranchChecks(defaultBranch, { _ghRun })  // BL-05
export async function probeWorkflowRerun(runId, { _ghRun })                // BL-06
```

| Probe | Command | Absent ⇒ |
|---|---|---|
| BL-05 | `gh run list --branch {defaultBranch} --json conclusion,workflowName,headSha` | A5-2: the comparison is undone, `permittedActions` loses **both** E-1 and E-2 (E-2's *introduced* rule needs the default-branch tip), and the seam escalates attempting no fix |
| BL-06 | `gh run rerun --failed {runId} --dry-run`, or the absence of the `actions: write` scope in `gh auth status` | E-1 drops out of `permittedActions`; E-2 may remain |

**These are reads that classify a failure, not new capabilities that can act.** BL-06's probe is the
exception — a `--dry-run` against a *write* surface — and it is the only place the tier touches an
Actions write; the write itself happens only inside `verifyGate` under E-1.

**T-03-8's set-equality is not capability-parameterised.** `ENVELOPE_DEFAULTS` always contains
`{E-1, E-2, E-3, E-4}`; a probe's absence removes the action from *this invocation's*
`ctx.permittedActions`, never from the shipped set. That separation is why the shipped envelope can be
compared as a literal while a capability-poor repo still refuses correctly.

**A5-1 — ordering.** The default-branch comparison runs **before** E-2's *introduced* test, inside
`gatherEvidence`, and its verdict is authoritative on the reading it gets: a check observed failing at
the default-branch tip escalates as pre-existing. Ordering the two is not a preference; running them
in the other order lets a flaky default-branch signal be re-classified as branch-introduced and fixed.

### 8.4 OQ-3 resolved: report the verified commit, do not re-verify and do not halt

FSPEC A5-7 leaves the restoration path to this document. **Chosen: report-only.** The final report
names the DoD-verified commit and marks any branch head beyond it `unverified`; Phase PUB neither
re-runs the DoD gate nor halts on the divergence.

| Alternative | Rejected because |
|---|---|
| Re-verify DoD inside Phase PUB | Phase H runs **before** PUB (B-15) and harvest deletes the `CODE_REVIEW-*` files `dodVerifyLoop` writes and reads (`dev:6298`). A DoD re-run in PUB would author a fresh `CODE_REVIEW-{feature}-v1` **after** the harvest that was supposed to consume it, leaving an un-harvestable artifact and a `LEARNINGS` file that no longer describes the branch. It also puts an evaluator→optimizer loop with its own 3-iteration budget inside a phase already bounded by a CI clock. |
| Halt on the divergence | Negates A5 entirely: every successful A5 resolution would end in a halt, so the seam could never produce the outcome it exists for (US-01). |
| Report-only (**chosen**) | Satisfies AC-8.3 exactly as written — "the report's DoD status names the verified commit, and a branch head beyond it is reported unverified" — costs one report field, and leaves the decision with the operator, who is the only party who can weigh whether a lint fix needs a fresh DoD pass. |

Implementation: `recordPhase("DOD", …)` already carries a detail string; the DoD row gains the
verified commit sha (`git rev-parse HEAD` at the moment `dodResult.passed` becomes true), and
`buildFinalReport` (`dev:8595`) gains `dodVerifiedCommit` plus a derived `dodHeadUnverified` boolean.
Phase MERGE reads neither — it applies its own preconditions to whatever head it finds (H-2).

### 8.5 Error handling, A5

| Case | Behaviour |
|---|---|
| several checks fail | in-envelope only if **every** failing check is; a mixed set escalates — `classifyEnvelope` is called once over the union |
| a re-run surfaces a *different* failure | a new diagnosis inside the same invocation, drawing on the same attempt budget |
| the push is rejected (branch moved) | `verifyGate` fails ⇒ revert to `preSeamHead`, retry or escalate on budget; the fix is never left half-applied |
| CI turns green mid-diagnosis | `conditionHolds` false ⇒ `no-action`; the phase continues from its own rollup read |
| the proposed fix touches a test file | X-a ⇒ reverted whole, `revert-on-test-touch`. Asserted directly (T-03-3, §9.3's row) — this is the single most likely way an agent "fixes" red CI |
| the repo has no CI | the no-checks path; the seam never fires |

## 9. Advisory record, harvest, delete guard, run-report summary (FSPEC-ADV-08)

### 9.1 File format — `docs/{feature}/ADVISORY-{feature}.md`

Append-only Markdown; one `##` entry per invocation, in occurrence order (R-3). Seven fields,
matching §10.1's table one-for-one so T-08-1 is a field-presence assertion:

```markdown
## 2026-08-03T14:21:07Z — A5 — escalated

| Field | Value |
|---|---|
| Seam | A5 |
| Confidence | high |
| Envelope | out — no permitted action matched (E-2 requires the default-branch tip) |
| Disposition | escalated — budget-exhausted |
| Model | opus (fallback for "fable") |

**Diagnosis.** …one paragraph…

**Evidence.**
- `.github/workflows/pr-tests.yml:31` — the failing step
- run 1892…, job "Unit tests (ubuntu-latest, node 20)"
```

`renderAdvisoryEntry(disposition, { now })` is **pure** — it takes the timestamp rather than reading a
clock, so the rendered bytes are testable exactly. Written via `_appendFile` (`dev:6805`), which is
already the append transport and already creates nothing implicitly: a missing feature directory
makes the append throw, which is §10.5's row and R-2's refusal path (T-08-2), not a silent `mkdir`.

The `Model` row carries M-2's declaration, which is why T-08-7 can read it off the record as well as
off the summary.

### 9.2 `appendAdvisoryEntry` — the step-7 primitive

```js
export async function appendAdvisoryEntry({ feature, disposition, _appendFile, _now })
```

Throws on write failure; the driver's step 7 catches and refuses `record-write-failed` (§4.4).
**R-4** — invocations that took no action are recorded too — needs no code: the driver calls step 7
on every terminal disposition including `no-action`, and only the *escalation log* (§10) is
escalation-only.

### 9.3 Harvest: a post-PUB distil step, and the guard extension

**H-1's placement.** A new step runs after Phase PUB and before Phase MERGE — i.e. between
`dev:8386` and `dev:8389`. Phase H (`dev:8307-8360`) is **untouched**: it neither distils nor deletes
`ADVISORY-*`, because at that point A5 has not run yet (B-15).

```js
// dev:8388 — Phase H2: distil the advisory record (dev-side only)
if (advisory.enabled && advisory.recordExists) {
  await agentFn("harvest-learnings", advisoryDistilPrompt(featureName));   // appends to LEARNINGS
  const del = await gitFn(["rm", "--", advisoryPath]);                      // through the guard
  if (guardRefused(del)) { notices.push(`ADVISORY record retained: ${firstLine(del)}`); }
  else { await commitPaths({ paths: [learningsPath, advisoryPath], … }); await gitFn(["push", …]); }
}
```

The delete goes through the **guard-covered channel** (`git rm`, matched by the guard's
`\bgit\s+rm\b` alternative at `guard-harvest-before-delete.sh:37`) rather than around it — H-3's
"the guard is the control, not a courtesy".

**The guard-script edit, and the coupling it must not break.** Three lines change:

| Line | Change |
|---|---|
| `:35` | `if "CROSS-REVIEW" not in cmd and "CODE_REVIEW" not in cmd and "ADVISORY" not in cmd:` |
| `:43` | `re.findall(r'\S*(?:CROSS-REVIEW\|CODE_REVIEW\|ADVISORY)-[\w.\-]*', cmd)` |
| `:57-59` | the refusal message gains the artifact class that actually matched |

> ⚠️ **`orchestrate-dev.js` parses that message.** `dev:8342-8344` tests for the literal
> `"pdlc guard: refusing to delete CROSS-REVIEW files"` and `dev:8348-8350` extracts the blocked path
> with `/pdlc guard: refusing to delete CROSS-REVIEW files in \[([^\]]+)\]/`. A naive rewrite to
> "refusing to delete ADVISORY files in […]" makes Phase H stop recognising a guard block — it would
> proceed as if the delete succeeded. The message is therefore extended, not rewritten:
>
> ```
> pdlc guard: refusing to delete CROSS-REVIEW files in [docs/x] — no LEARNINGS-*.md exists there yet.
> … (unchanged) … This guard also covers CODE_REVIEW-* and ADVISORY-* files. [class: ADVISORY]
> ```
>
> The prefix and the bracketed directory keep their exact bytes, so both `dev:8342` and `dev:8348`
> keep matching; the class is a **suffix token** the new distil step reads. This coupling is a named
> integration risk (§15) and gets its own regression test asserting the existing detection still fires.

**H-2b (queue-side records persist).** No queue-side code path deletes or distils an advisory record;
the record's durability is the §6.4.1 commit. H-2's absence observable is scoped to dev-side runs
(T-08-8), and no dev-side run can reach A1/A2, so the two never contend.

**H-4.** A run that halts before the distil step leaves the record on disk complete up to the halt —
free, because the halt throws before `dev:8388` is reached.

### 9.4 The advisory summary on the final report

```js
export function advisorySummaryRows(dispositions)   // pure
// → { rows: [{seam, invocations, resolved, escalated, noAction}, …five…], total: {…} }
```

- **S-1.** `ADVISORY_SEAMS` (§3.1) drives the row list, so five rows always appear and a seam that
  never fired is visibly zero. The per-row and total identity `invocations === resolved + escalated +
  noAction` is asserted by the function itself and re-asserted by T-08-10's literal six-row table.
- **On every report, including a halt's.** `buildFinalReport` (`dev:8595`) is called on both the halt
  path (`dev:8490-8496`) and the success path (`dev:8514-8520`); `advisory` rides the same way
  `notices` and `queueRow` already do (`dev:8494`, `dev:8517`). T-08-9 follows directly.
- **S-2.** the row carries `model` and `fallback` from the rung state (§3.4).
- **S-3.** `noChecks` and `completionCap` booleans are threaded from `raisePrAndVerifyCi` (§8.1) and
  named on the summary — A5-6 and A5-9.
- **S-4.** with the tier disabled, `buildFinalReport` receives `advisory: null` and emits nothing.
- **S-5.** `buildQueueReport` (`queue:1221`) gains the same summary for A1/A2. A dev-side report's
  A1/A2 rows are structurally zero, because no dev-side call site constructs those seams.

## 10. Escalation log and report notices (FSPEC-ADV-09)

### 10.1 `docs/_queue/ESCALATIONS.md`

New artifact (B-16). Append-only, newest-last, one `##` entry per escalation, eight fields with the
decision sentence **first** (L-2):

```markdown
## 2026-08-03T14:21:07Z — pdlc-advisory-tier — A5

**Decide:** whether the lint failure on `pdlc/workflows/orchestrate-dev.js` is the feature's to fix,
given it also fails on the default branch.

| Field | Value |
|---|---|
| Feature | pdlc-advisory-tier |
| Seam | A5 |
| Refusal reason | out-of-envelope |
| Pipeline state | PUB — halted |
…Diagnosis / Proposed action / Evidence sections…
```

`renderEscalationEntry(disposition, ctx, { now })` is pure, mirroring `renderAdvisoryEntry` (§9.1).
*Pipeline state* is the phase id and that phase's outcome — both already on hand at every call site,
since the seam fires inside the phase body.

`appendEscalationEntry` uses `_appendFile` (`dev:6805`) and creates `docs/_queue/` when absent
(§11.3's last row): `mkdirSync(dirname(path), { recursive: true })` inside `defaultAppendFile`'s
existing try, which is a strictly-additive change to a function whose contract is already
"throws on failure". A consumer repo with no queue still gets its escalations.

**L-1 (append-only, newest-last).** No code path reads `ESCALATIONS.md`, and nothing rewrites it —
the file is a log for `pdlc-engineering-loop`, never state for this tier (§17.2's "nothing in the tier
reads its own prior escalations"). T-09-2's "the first entry is unmodified" is therefore guaranteed by
the absence of a reader, not by an update rule.

**T-09-8's asymmetry.** `appendEscalationEntry` is called **outside** the try/catch that governs the
action (§4.6): a throw is caught, pushed onto `notices`, and the disposition stays `escalated`. A
failed log write can never upgrade an escalation to a resolution, because by then nothing is left to
apply.

### 10.2 Report notices — a sibling catalogue, not a widened one

```js
// dev:1330 — immediately after MERGE_ESCALATIONS, deliberately adjacent so the two read together
export const ADVISORY_ESCALATIONS = Object.freeze({
  seam: ({ seam, feature, reason }) =>
    `ADVISORY ESCALATION: seam ${seam} for ${feature} — ${reason}; see docs/_queue/ESCALATIONS.md`,
});
```

| Rule | Implementation |
|---|---|
| N-1 — the merge catalogue is left exactly as it is | `MERGE_ESCALATIONS` (`dev:1321-1328`) is not edited. T-09-5 compares it before and after — a frozen object's own-property snapshot |
| N-2 — a distinct advisory prefix naming the seam and pointing at the log | the literal above; `ADVISORY ESCALATION:` |
| N-3 — one grep finds both | both prefixes contain the substring `ESCALATION:` |
| N-4 — the notice channel is unchanged | notices are pushed onto the same `notices` array the merge phase uses (`dev:8406-8407`) and ride the same report field (`dev:8494`, `dev:8517`) |

**L-3 / F-5 (escalation never changes control flow)** is structural, not asserted: at every seam the
advisory call sits immediately before the pre-existing `throw haltError(...)` or `continue`, and only
an `outcome === "resolved"` branch bypasses it (§7.1, §8.1). A6/A3 have no such branch at all.

## 11. Disabled-tier equivalence (FSPEC-ADV-10)

### 11.1 One check, at one place, per pipeline

D-1/D-2 hold because `config.enabled === false` returns from `runAdvisorySeam` **before**
`resolveAdvisoryRung` is called and before any dispatch (§4.4's entry row). That single early return
is the only `enabled` test on the dispatch path; the two others in the codebase are (a) the config
notice suppression (§3.2) and (b) the §9.3 distil-step guard, neither of which can dispatch or
resolve. A grep for `advisory.enabled` returning exactly three sites is itself a maintainable
assertion.

D-2's stronger claim — *no model resolution is attempted* — is why resolution is lazy (§3.4): even
with the tier **on**, a run in which no seam fires resolves nothing (T-01-7). Disabled is then the
trivially stronger case.

### 11.2 D-6's literal expected set

D-6 requires the created-file set of a disabled run to equal a **transcribed literal** — the
created-file set of a pre-feature run at `26c3f1c` — never a value re-derived by the code under test.
Implementation: a checked-in fixture `__tests__/fixtures/created-files-26c3f1c.json`, produced once by
instrumenting the `_writeFile`/`_appendFile`/`_git` seams of a baseline run and **hand-reviewed into
the repo**. The test compares the disabled run's observed set against that JSON by value.

This is the one place in the feature where a fixture is authored rather than computed, and the reason
is stated in D-6 itself: a comparison whose expected value is produced by the system under test cannot
fail. The fixture's provenance (the commit, the command, the date) is recorded in its own header so a
later reader can regenerate it deliberately rather than refresh it reflexively.

### 11.3 Disabled-mode edge cases

| Case | Behaviour | Implementation |
|---|---|---|
| other advisory keys set while disabled | inert | the master switch is tested first, before any other key is read |
| enabled but no seam fires | five zero rows on the summary — *not* the disabled case | S-1 always emits five rows when `advisory != null` |
| config file absent | disabled | C-1's `text == null` early return |
| config file malformed JSON | disabled | C-1's `JSON.parse` catch |
| `enabled` itself malformed | disabled, **and no substitution notice** | §3.2's deliberate C-2 deviation |

## 12. Error handling — every failure scenario

This section is the index; each row cites the section that owns the behaviour, so no rule is stated
twice. Every row is a **closed** disposition — one of `resolved` / `escalated` / `no-action` / an
explicit halt — because §17.3's rule ("the unenumerated case escalates") is implemented as the
driver's terminal `catch`, which maps any unclassified throw to `escalated` with the last computed
reason, never to `resolved`.

| # | Failure | Disposition | Owner |
|---|---|---|---|
| E-01 | config file absent / unreadable / malformed | tier disabled, run unaffected | §3.2 C-1 |
| E-02 | one config key out of range | that key defaults; reported iff enabled | §3.2 C-2 |
| E-03 | advisory rung rejected as a model/alias error | fallback rung, declared | §3.4 |
| E-04 | fallback rung also rejected | run fails loudly (`haltError`) | §3.4 M-3 |
| E-05 | dispatch fails mid-flight (not a model error) | ordinary invocation failure; attempt consumed | §4.6 |
| E-06 | verdict absent / wrong seam / no evidence | malformed; attempt consumed | §4.2, §4.6 |
| E-07 | agent proposes "nothing" at high confidence | escalated with the diagnosis — the good US-02 outcome | §4.6 |
| E-08 | proposal outside the envelope | `out-of-envelope`, nothing applied | §5.1 |
| E-09 | produced diff reaches outside the envelope | reverted whole, escalated | §5.1 E-R2 |
| E-10 | produced diff touches a test artifact | reverted whole, `revert-on-test-touch` | §5.2 |
| E-11 | produced diff touches a guard path | reverted whole, `out-of-envelope` | §5.1 row 3 |
| E-12 | seam gate fails after an applied action | reverted, `post-action-verification-failed` | §4.4 step 6 |
| E-13 | record write fails | action does not survive; `record-write-failed` | §4.4 step 7, §9.2 |
| E-14 | `revert` itself throws | halt — an unrevertable tree is not a permitted state | §4.6 |
| E-15 | escalation-log write fails | escalation stands; failure on the report | §10.1 |
| E-16 | attempt or wall-clock budget reached | `budget-exhausted`; in-flight attempt preempted | §4.5 |
| E-17 | seam condition gone at re-check | `no-action`; no attempt, no log entry | §4.4 step 3b |
| E-18 | run interrupted mid-attempt | not recoverable here; the record holds every completed attempt | §9.2 R-3 |
| E-19 | queue drift gate blocks the invocation | no seam fires | §6.1 |
| E-20 | both/unrecognised seam tokens on a triage stop | malformed / routed to A1 | §6.2 |
| E-21 | A2 commit refused (hook, identity, index lock) | reverted, escalated | §6.4.1 |
| E-22 | A3 classifies no finding / leaves a deferral unbound | malformed / escalated naming the finding | §7.2 |
| E-23 | A4 conflict set mixes branch-created and shared files | escalated before `apply` | §7.3 A4-2 |
| E-24 | A4 repo has no `testCommand` | reverted, escalated — unverifiable ≠ resolved | §7.4 |
| E-25 | A5 failing job's log unretrievable | escalated without a cause diagnosis | §8.2 A5-5 |
| E-26 | A5 default-branch check history unreadable (BL-05) | escalated, comparison undone, no fix | §8.3 |
| E-27 | A5 workflow re-run unavailable (BL-06) | E-1 out of envelope this invocation | §8.3 |
| E-28 | A5 push rejected (branch moved) | reverted to pre-seam head; retry or escalate | §8.5 |
| E-29 | A5 re-poll hits Phase PUB's completion cap | consumes an attempt, does not halt separately | §8.2 A5-3 |
| E-30 | distil-step delete refused by the guard | record survives; refusal on the report | §9.3 H-3 |
| E-31 | feature directory missing at first record write | append throws ⇒ E-13 | §9.1 |
| E-32 | anything not enumerated above | escalated | §17.3, driver terminal catch |

## 13. Test strategy and test doubles

### 13.1 The runner, and the one way to invoke it

Jest, ESM, `node --experimental-vm-modules` — `cd pdlc/workflows && npm test`. Filters go **after
`--`** (`npm test -- advisory`); a bare `npx jest` misses the ESM flag and the
`globalSetup`/`globalTeardown` this suite depends on. One file per concern under
`pdlc/workflows/__tests__/`, matching the shipped naming (`mergeGuard.test.js`, `dodPhase.test.js`,
`queueDriftGate.test.js`).

### 13.2 Test categories, and why most of this feature is a unit test

| Category | What it covers | Doubles needed |
|---|---|---|
| **Pure-function unit** | `parseAdvisoryConfig`, `parseAdvisoryVerdict`, `classifyEnvelope`, `refusalReasonFor`, `touchesTestArtifact`, `touchesDodCriterion`, `branchCreated`, `budgetExceeded`, `governingClass`, `honourA1Verdict`, `isModelResolutionError`, `advisorySummaryRows`, `renderAdvisoryEntry`, `renderEscalationEntry` | **none** |
| **Driver unit** | `runAdvisorySeam` against a fake `SeamOps` and fake IO | `SeamOps` fake + `_agent`/`_appendFile`/`_now` fakes |
| **Seam unit** | each real `SeamOps` against fake `_git` / `_ghRun` / `_readFile` | transport fakes |
| **Phase integration** | the wiring at `dev:8281`, `dev:8294`, `dev:6371`, `queue:912` — that the halt/skip still happens | `_runAdvisorySeam` fake returning a scripted disposition |
| **Set-equality / catalogue** | `ADVISORY_REFUSAL_REASONS`, `ENVELOPE_DEFAULTS`, `ADVISORY_EXCLUSIONS`, `ADVISORY_SEAMS`, `MERGE_ESCALATIONS` unchanged | none — compare exported frozen objects |

The proportion is deliberate: §2.4's dependency graph puts every decision in a pure leaf and leaves
exactly one impure component. `decideMerge` (`dev:835`) is the precedent — Phase MERGE's entire
ladder is unit-tested with no GitHub double, and the same shape applies here.

### 13.3 Test doubles

**Reuse the shipped doubles rather than authoring parallel ones.** `__tests__/mergeDoubles.test.js`
and `__tests__/helpers/` already carry the `_ghRun`, `_git` and `_agent` fakes Phase MERGE and Phase
DOD are tested through; the advisory tests take the same fakes with additional scripted responses.

| Seam | Double |
|---|---|
| `_agent` | returns a scripted trailer string per call, with an optional throw whose message drives `isModelResolutionError` |
| `_git` / `_ghRun` | command-string → scripted result map, the shipped shape |
| `_appendFile` / `_writeFile` | in-memory map; a `throwOn` set drives E-13 and T-08-2 |
| `_now` / `_sleep` | fake clock, already injected on both `main()`s (`dev:6995-6996`) — required for V-5 preemption and the A5 wait carve-out |
| `SeamOps` | a hand-rolled object literal per case; **this is the double that makes the driver testable without any seam** |
| queue-side free identifiers | `_runAdvisorySeam` etc. **must** be injected — they are unbound under jest (§2.3), which is a feature: a queue test that forgets to inject fails loudly rather than silently exercising a stale default |

### 13.4 What the suite is required to pin

Beyond one-per-acceptance-test coverage of FSPEC §18.1's 81 cases, five obligations shape the suite:

1. **X-a's seven operations are seven named tests** (T-03-3). Assertion edit, test-file delete,
   test-case delete, rename out of the collected set, skip/xfail/only marker, parametrised-list
   narrowing, coverage/mutation threshold lowered — each with its own fixture diff. A single
   "touches a test file" test would pass while five of the seven slipped through.
2. **Every prohibition asserts the positive triple too** (T-03-6, AC-4.6). `expect(criterionUnchanged)`
   alone is satisfied by a build where the seam never fired; the test must also assert
   `outcome === "escalated"`, exactly one reason, and the unchanged pre-advisory behaviour.
3. **The closed sets are compared as sets** (T-03-5, T-03-8). An invented or deleted member fails even
   where no individual path changed.
4. **The disabled-run created-file set is a transcribed literal** (T-10-3, §11.2), never re-derived.
5. **The guard-message coupling has its own regression test** (§9.3): after the guard edit,
   `dev:8342`'s literal test and `dev:8348`'s regex both still fire on a `CROSS-REVIEW` refusal.

### 13.5 Property-based candidates

PROPERTIES owns the final call; three functions are the natural candidates because each has an
invariant that quantifies over inputs rather than enumerating them:

| Function | Property |
|---|---|
| `refusalReasonFor` | for any signal set, the result is a member of `ADVISORY_REFUSAL_REASONS` and is the first member whose signal is true |
| `advisorySummaryRows` | for any disposition list, `invocations === resolved + escalated + noAction` on every row and on the total |
| `classifyEnvelope` | for any candidate whose paths include a guard path or a test artifact, `inside === false` — the exclusions are absorbing |

### 13.6 Build and PLAN obligations

- `pdlc/workflows/dist/` must be rebuilt (`node pdlc/workflows/build-runtime.mjs`) **in the same
  commit** as any source edit; `--check` and `runtimeBundle.test.js` both fail otherwise.
- `runtimeBundle.test.js` additionally asserts the runtime's structural constraints — `export const
  meta` first, no other `export`, no `import` — which the §2.3 prelude edit must not break.
- **The PLAN's first task is the §1.1 rebase onto `26c3f1c`-or-later.** Every symbol this document
  cites postdates this branch's base; a batch that runs before the rebase edits a file that does not
  contain the code it is patching.
- One additional manual step (§3.3): dispatch one trivial advisory agent on `"fable"` in a real
  runtime and record which branch of §3.4's ladder fired.

## 14. Requirement → component traceability

### 14.1 FSPEC section → TSPEC section → component

| FSPEC | Requirement | TSPEC | Primary components |
|---|---|---|---|
| ADV-01 | REQ-ADV-01 | §3 | `MODEL_ADVISORY`, `MODEL_ADVISORY_FALLBACK`, `ADVISORY_DEFAULTS`, `parseAdvisoryConfig`, `readAdvisoryConfigSafely`, `resolveAdvisoryRung`, `isModelResolutionError` |
| ADV-02 | REQ-ADV-02 | §4 | `AdvisoryVerdict`, `AdvisoryDisposition`, `parseAdvisoryVerdict`, `SeamOps`, `runAdvisorySeam`, `budgetExceeded` |
| ADV-03 | REQ-ADV-03 | §5 | `classifyEnvelope`, `ENVELOPE_DEFAULTS`, `ADVISORY_EXCLUSIONS`, `touchesTestArtifact`, `touchesDodCriterion`, `guardVerdict` (reused), `ADVISORY_REFUSAL_REASONS`, `refusalReasonFor` |
| ADV-03 | REQ-ADV-04 | §5.4, §5.5 | structural non-calls + `SeamOps.verifyGate` |
| ADV-04 | REQ-ADV-05 | §6 | `triagePrompt`, `parseTriageVerdict`, `honourA1Verdict`, A1/A2 `SeamOps`, `commitPaths` (reused) |
| ADV-05 | REQ-ADV-06 | §7.2 | A3 `SeamOps`, `parseA3Classification`, `governingClass` |
| ADV-06 | REQ-ADV-07 | §7.3, §7.4 | A4 `SeamOps`, `branchCreated`, `rebaseOntoDefault` (reused), `_runCommand` (reused) |
| ADV-07 | REQ-ADV-08 | §8 | A5 `SeamOps`, `probeDefaultBranchChecks`, `probeWorkflowRerun`, `checkPrCi` (reused) |
| ADV-08 | REQ-ADV-09 | §9 | `renderAdvisoryEntry`, `appendAdvisoryEntry`, the post-PUB distil step, the guard-script edit, `advisorySummaryRows` |
| ADV-09 | REQ-ADV-10 | §10 | `renderEscalationEntry`, `appendEscalationEntry`, `ADVISORY_ESCALATIONS` |
| ADV-10 | AC-1.6, NFR-3 | §11 | the single `enabled` early return, the D-6 fixture |

### 14.2 Non-functional

| NFR | Where discharged | Nature of the discharge |
|---|---|---|
| NFR-1 — envelope in the workflow, not a prompt | §5.1 | `classifyEnvelope` is pure and has exactly two callers, both in the driver; no prompt participates |
| NFR-2 — every prohibition has a failing test | §5.4, §13.4(2) | four rows, each with a positive-triple test |
| NFR-3 — additive when disabled | §11 | one early return + a transcribed literal |
| NFR-4 — per-seam wall-clock bound | §4.5 | `budgetExceeded` with the rollup-wait carve-out; preemption via `Promise.race` on injected `_now`/`_sleep` |
| NFR-5 — no new credentials, never merges | §5.4 P-4, §8.3 | only `_ghRun` and `_git`, both pre-existing; no call to `executeMerge`/`phaseMerge` |

### 14.3 New and modified files

| File | Change |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` | constants, advisory core, `SeamOps` for A3/A4/A5, Phase DOD and Phase PUB wiring, the post-PUB distil step, report fields |
| `pdlc/workflows/orchestrate-queue.js` | injection seams, config read, seam-token routing, `SeamOps` for A1/A2, queue-report summary |
| `pdlc/workflows/build-runtime.mjs` | §2.3's export-list and prelude edit |
| `pdlc/hooks/scripts/guard-harvest-before-delete.sh` | §9.3's three-line extension |
| `pdlc/workflows/dist/*` | **generated** — rebuilt in the same commit, never hand-edited |
| `pdlc/workflows/__tests__/advisory*.test.js` | new |
| `pdlc/workflows/__tests__/fixtures/created-files-26c3f1c.json` | new (§11.2) |
| `docs/_queue/ESCALATIONS.md` | new at runtime, in consuming repos — not tracked here |

## 15. Feasibility, cost, and risks

Named here because a surfaced risk is a shared decision.

| # | Risk | Assessment | Mitigation |
|---|---|---|---|
| R-1 | **`orchestrate-dev.js` grows to ~9,300 lines.** It is already 8,527 (`26c3f1c`) and is the single largest file in the repo. | Real, and worsened by §2.2's decision to keep the core there. | The alternative (a fourth build source) was weighed and rejected in §16.1 on artifact-composition grounds. The mitigation is structural, not cosmetic: everything but `runAdvisorySeam` is a pure exported leaf, so the file's *testable surface* grows in unit-shaped pieces rather than in the phase body. |
| R-2 | **The guard-message coupling** (`dev:8342`, `dev:8348`) breaks silently if the message is rewritten rather than extended. | High impact, low likelihood once named. | §9.3's extend-don't-rewrite rule plus §13.4(5)'s regression test. |
| R-3 | **BL-01 is unresolved and unresolvable from this repo.** | Non-fatal by construction, but it means the fallback path ships as the likely production path. | §3.3 treats the fallback as a tested path, not an error path; §13.6's manual step records which branch fires. |
| R-4 | **BL-05/BL-06 are per-repo facts** that decide whether E-1/E-2 are ever usable. | A consuming repo without them gets an A5 that only ever escalates — still an improvement on today's bare halt, but less than the REQ implies. | §8.3's probes make the degradation observable and tested rather than surprising. |
| R-5 | **This branch is based on a pre-`26c3f1c` tree** (§1.1). | Would cause every implementation batch to patch code that is not there. | The PLAN's first task is the rebase; §13.6 states it. |
| R-6 | **A5's push moves the branch head past the DoD-verified commit.** | Inherent to fixing CI after harvest; not removable. | §8.4's report-only resolution, with the divergence named on the report. |
| R-7 | **Phase MERGE will decline more often** on runs where a seam fired (H-2's extra post-PUB commit). | A deliberate trade — a truthful record against an automatic merge. | Visible as a deferral on the report, never silent; out of scope for this feature's tests. |
| R-8 | **Cost.** Every seam invocation is one or more Opus/Fable dispatches on top of an already-expensive pipeline. | Bounded by `attemptBudget` (3) and `seamBudgetMinutes` (10) per seam, at most five seams per run, and only on runs that would otherwise have *halted* — i.e. the spend replaces an operator's turn, not a successful run's. | The budgets are config, not constants; the summary makes the spend legible per run. |

**Feasibility verdict.** No new platform capability is required: every transport (`_agent`, `_git`,
`_ghRun`, `_readFile`, `_writeFile`, `_appendFile`, `_runCommand`, `_now`, `_sleep`) already exists
and is already injected. The only genuinely new capabilities are two `gh` **reads** and one `gh`
**write** (§8.3), each behind a probe whose absence is a first-class outcome. The expensive parts are
the X-a operation matrix (§13.4(1)) and the D-6 fixture (§11.2), both of which are one-time authoring
costs rather than ongoing complexity.

## 16. Decisions warranting a DECISIONS record

Six load-bearing choices where a real alternative was weighed and rejected. A future agent will
otherwise reconsider each of them confidently.

### 16.1 Advisory core in `orchestrate-dev.js`, reached from the queue by prelude binding

**Rejected:** a fourth build source `pdlc/workflows/advisory.js`. Feasible, and it would keep
`orchestrate-dev.js` ~800 lines smaller — but it changes the artifact-composition rule that
`runtimeBundle.test.js` and `distribution-manifest.json` are written against, for a benefit no
requirement asks for. **Rejected:** duplicating the constants in both modules — that is exactly what
M-5 forbids. Reversibility: **easy** (extracting to a fourth source later is mechanical).

### 16.2 One `runAdvisorySeam` driver behind an injected `SeamOps`, not five per-seam functions

**Rejected:** a function per seam. It would put the budget arithmetic, the envelope gate, the refusal
ladder, the record write and the escalation in five places, and V-8's "every escalation produces the
same observable triple" would become five things to keep in step rather than one. The cost is the
`apply`/`verifyGate` split (§4.4), which is less obvious than a per-seam branch.

### 16.3 The irreversible act lives in `verifyGate`, so RECORD precedes it

**Rejected:** the literal FSPEC §4.1 order with an A5 special case in the driver. That leaves A2's
commit/record ordering undefined (the erratum in §16.4) and would eventually require undoing a commit
to satisfy R-2. **Rejected:** writing the record *before* the action — the record carries the
disposition, which is not known until the action's outcome is. Reversibility: **hard** — it shapes
the `SeamOps` contract.

### 16.4 Errata raised against FSPEC (not fixed here)

Two upstream defects were found while grounding this document. Both are routed as errata, not folded
into this TSPEC's own verdict, and both have a TSPEC-side resolution recorded above so implementation
is unblocked either way:

1. **A2-6 / R-2 ordering gap** — A2-6 requires an applied re-grounding to be *committed* before the
   invocation ends; R-2 requires a failed record write to un-take the action. FSPEC never reconciles
   them, and the literal reading demands undoing a commit, which BR-5 does not sanction. Resolved
   here by §4.4/§6.4.1's `apply`/`verifyGate` split.
2. **C-2 / D-5 conflict** — C-2 unconditionally reports a degraded key on the run report; D-5, S-4
   and T-10-4 require a *disabled* run to carry no advisory content. A malformed `advisory.enabled`
   satisfies both, contradictorily. Resolved here by §3.2's emit-side suppression.

### 16.5 Report-only for the post-A5 DoD divergence (OQ-3)

**Rejected:** re-verifying DoD inside Phase PUB — harvest has already deleted the `CODE_REVIEW-*`
inputs (B-15), so a re-run would author an un-harvestable artifact after its harvest.
**Rejected:** halting on the divergence — it would negate every successful A5 resolution.
Reversibility: **easy** (report-only is a strict subset of either alternative).
Re-evaluation trigger: if Phase H ever moves after Phase PUB, re-verification becomes cheap.

### 16.6 Reuse `guardVerdict`/`effectiveGuardPaths` for X-e; own only two new predicates

**Rejected:** a purpose-built X-e matcher. Phase MERGE's shipped matcher already has the exact
semantics — anchored, `/`-delimited, non-globbing, fail-closed on an unretrievable list — and a second
one would eventually disagree with it about a path like `pdlc/workflowsX/`. The two predicates this
feature does own (`touchesTestArtifact`, `touchesDodCriterion`) have no shipped precedent, which is
why they are owned rather than reused.


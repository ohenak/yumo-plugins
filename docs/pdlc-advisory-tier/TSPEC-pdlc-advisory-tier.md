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

### 1.1 Baseline pin — and a warning about this branch's tree

Every `file:line` in this document is read at **default-branch commit `26c3f1c`**, the commit REQ
BL-02 pins and FSPEC §2 cites by baseline id. That pin is load-bearing here in a way it is not in
most features:

> `feat-pdlc-advisory-tier` is branched from a **pre-`26c3f1c`** default branch. At this branch's
> head, `pdlc/workflows/orchestrate-dev.js` is 2,139 lines and `pdlc/workflows/orchestrate-queue.js`
> is 735 lines; at `26c3f1c` they are **8,527** and **1,587** lines respectively. Every symbol this
> TSPEC names exists at `26c3f1c` and many do not exist on this branch's current tree.

Implementation therefore begins with a rebase onto `26c3f1c`-or-later, before any task in the PLAN
runs. This is not a nicety: `computeWaves`, `parseImplementationConfig`, `phaseMerge`,
`MERGE_ESCALATIONS` and `defaultAppendFile` — all integration points below — postdate this branch's
base. PLAN owns that as its first gate (§13.6).

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
`26c3f1c`. FSPEC rule ids (`V-5`, `A5-3`, `X-a`, …) are used verbatim; this document never restates
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
the same discipline `parseMergeConfig` (`dev:101`), `decideMerge` (`dev:1197`) and `classifyPrState`
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
| I-6 | `dev:8161-8173` | Phase DOD step-0 rebase conflict halt | A4 fires before `haltError` |
| I-7 | `dev:8179-8188` | DoD not-passed halt | A3 fires before `haltError` |
| I-8 | `dev:6222-6287` | `raisePrAndVerifyCi` | A5 fires on the `status === "failed"` branch (`dev:6256-6258`) |
| I-9 | `dev:8480` | `buildFinalReport` | gains `advisory` (summary rows + rung) |
| I-10 | `dev:1321-1328` | `MERGE_ESCALATIONS` | **untouched** (N-1); a sibling `ADVISORY_ESCALATIONS` is added |
| I-11 | `dev:8203-8246` | Phase H harvest + guard-block detection | untouched; the advisory distil is a new post-PUB step (§9.3) |
| I-12 | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35,43,52-59` | the delete guard | token set gains `ADVISORY`; message gains the class (§9.4) |
| I-13 | `dev:6861-6903` | `main` parameter list | gains `_advisory*` seams |
| I-14 | `build:87`, `build:96-103` | bundle composition | §2.3 |

## 3. Configuration and model-rung resolution (FSPEC-ADV-01)

### 3.1 Constants

```js
// Placement: orchestrate-dev.js, immediately after MODEL_IMPLEMENTATION (dev:1621),
// so all four rungs read as one block (AC-1.5).
const MODEL_ADVISORY = "fable";          // BL-01 — see §3.3
const MODEL_ADVISORY_FALLBACK = "opus";  // === MODEL_DEFAULT's literal, deliberately a separate constant

export const ADVISORY_CONFIG_PATH = MERGE_CONFIG_PATH;  // ".claude/pdlc.config.json" (dev:43)

export const ADVISORY_DEFAULTS = Object.freeze({
  enabled: false,
  attemptBudget: 3,
  seamBudgetMinutes: 10,
  envelope: ENVELOPE_DEFAULTS,   // §5.2
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
JSDoc `@typedef`, which is the shipped convention (`dev:6155-6157`, `dev:98-99`, `dev:626-629`) and
is what `parsePlanTasks`, `decideMerge` and `dodVerifyLoop` already document their contracts with.
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
(`dev:5944`) and `parseVerdict` (`dev:2390`): parse the agent's trailer, never trust its shape.

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
  injected seams on both `main()`s (`dev:6880-6881`, and `raisePrAndVerifyCi` threads them at
  `dev:6262-6263`), so no new capability is introduced and tests drive a fake clock.
- **Termination-condition ordering (§5.3's opening clause).** The reason is computed **once, at
  termination**, from the condition that ended the invocation — never accumulated across attempts.
  `refusalReasonFor(signals)` (§5.3) takes the terminating signal set and returns the first match in
  the ordered catalogue; that is why "malformed on every attempt, budget then exhausted" reports
  `budget-exhausted` (§4.4 row 1) with no special-casing.
- **Sequencing (V-6, F-2).** `runAdvisorySeam` is `await`ed at each seam's call site inside the
  already-sequential phase body; nothing wraps it in `parallel` (`dev:6567`). One invocation per seam
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
| A4 | PLAN-named files ∪ `git diff --name-only {mergeBase}..{preRebaseHead}` | `parsePlanTasks` (`dev:1130`) + `_git` (`dev:6707`) |
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

/** @param {Object<string,boolean>} signals  the conditions true AT TERMINATION
 *  @returns {string} the first matching reason, in catalogue order */
export function refusalReasonFor(signals)
```

Frozen exactly as `MERGE_MODES` / `MERGE_STATUSES` / `LIST_FAILURES` are (`dev:54-55`, `dev:1600`) —
the shipped convention for a closed set, and what makes T-03-5's set-equality assertion a one-liner
against the exported constant rather than a scrape of the source. `refusalReasonFor` returning the
**first** match is the whole of "the first matching trigger wins"; T-03-4 is a direct unit test over
it with two signals set.

`signals` is built once, at termination, from the terminating condition — never accumulated (§4.5).

### 5.4 Prohibitions — structural, not asserted

| # | Prohibition | How code makes it unreachable |
|---|---|---|
| P-1 | never mark a DoD criterion satisfied / weaken one / reduce the iteration count | `DOD_MAX_ITERATIONS` (`dev:25`) and `dodVerifyLoop`'s `maxIterations` (`dev:6158-6160`) are never passed anything advisory-derived; A3's `permittedActions` is `[]`; X-b refuses any diff touching a criterion |
| P-2 | never set `ready: true` on a REQ | A2's `apply` rewrites **citation lines only**; the frontmatter block that `parseReqFrontmatter` reads (`queue:232`) is excluded from the rewritable region, and a produced diff touching it fails X-d (scope is the REQ but the *action* is not E-4) |
| P-3 | never declare CI passed | `ciStatus` continues to come only from `checkPrCi` (`dev:5812`) via `raisePrAndVerifyCi` (`dev:6250-6254`); no advisory value is ever assigned to it. §8.4 |
| P-4 | never merge a PR, never alter a queue `Status` cell | no advisory path calls `executeMerge` (`dev:6747`), `phaseMerge` (`dev:6850`), `rewriteStatus` (`queue:1086`) or `updateQueueStatus` (`queue:358`); the queue-side `SeamOps` are constructed without `_writeFile` bound to `queuePath` |

Each row is also a **negative-and-positive** test per AC-4.6 / T-03-6: the prohibited thing does not
happen **and** the §4.3 V-8 triple holds on the same path. A test asserting only the negative would
pass against a build where the seam never fired at all, which is the accident AC-4.6 names.

NFR-5 (no new credentials) is structural too: the advisory tier's only outward-facing capabilities
are `_ghRun` (`dev:581`) and `_git` (`dev:6707`), both already held and both already injected — it
introduces no new transport. What it *does* newly require of those existing transports is §8.3's two
capability probes.

### 5.5 The gate that re-runs, per seam

`SeamOps.verifyGate` (§4.3) is the only place a gate is named, and every implementation delegates to
an existing gate rather than reimplementing one:

| Seam | `verifyGate` implementation | Existing symbol reused |
|---|---|---|
| A1 | `async () => ({ passed: true })` — A1 has no post-action gate (§5.4's "—" row); its safety is A1-3's escalate-when-unsettled, and `permittedActions: []` means the gate is unreachable anyway | — |
| A2 | commit the REQ + record, then confirm the branch head carries them | `commitPaths` (`dev:6790`), pathspec-scoped |
| A3 | unreachable (`permittedActions: []`) | — |
| A4 | complete the rebase, then run the branch's test command | `rebaseOntoDefault` (`dev:6139`), `_runCommand` (`dev:6897`) |
| A5 | push, then re-read the rollup | `_git`, `checkPrCi` (`dev:5812`) |

BR-6 ("a gate, not an agent, ends a seam") is therefore not a rule the code must remember: the
driver's only route to `resolved` runs through `verifyGate`, and no `verifyGate` consults an agent.

## 6. Seams A1 and A2 — the queue module (FSPEC-ADV-04)

## 7. Seams A3 and A4 — Phase DOD (FSPEC-ADV-05, ADV-06)

## 8. Seam A5 — Phase PUB (FSPEC-ADV-07)

## 9. Advisory record, harvest, delete guard, run-report summary (FSPEC-ADV-08)

## 10. Escalation log and report notices (FSPEC-ADV-09)

## 11. Disabled-tier equivalence (FSPEC-ADV-10)

## 12. Error handling — every failure scenario

## 13. Test strategy and test doubles

## 14. Requirement → component traceability

## 15. Feasibility, cost, and risks

## 16. Decisions warranting a DECISIONS record

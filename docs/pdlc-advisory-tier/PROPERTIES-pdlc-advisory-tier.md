---
feature: pdlc-advisory-tier
---

# PROPERTIES — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/advisory*.test.js`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-04 |

## 1. Overview — scope, sources, and how to read this document

This document is the proof system for the advisory tier: the observable invariants an implementer
must be able to falsify, stated precisely enough that every one of PLAN §3's 36 tasks knows which
properties its test file carries.

**Sources.** REQ §3 (AC-1.1 … AC-10.5) and §4 (NFR-1 … NFR-5); FSPEC's rule families
(C-*, M-*, V-*, E-R*, E-1…E-4, X-a…X-e, P-1…P-4, A1-*…A5-*, R-*, H-*, S-*, L-*, N-*, D-*, F-*,
BR-1…BR-6) and its 81 acceptance cases T-01-1 … T-10-5; TSPEC §§3–11 (the shipped signatures and
constants); PLAN §3 (tasks), §4 (file ownership), §6.5 (the nine generator-driven properties) and
§8 (case → file → task map).

**Grounding.** Every claim about *existing* behaviour below cites the working tree. Verified while
authoring, at branch head:

| Cited symbol | Location | Used by |
|---|---|---|
| `guardVerdict`, `effectiveGuardPaths` | `pdlc/workflows/orchestrate-dev.js:731`, `:708` | X-e reuse (§6) |
| `commitPaths` (module-private at HEAD), `gitWithLockRetry` | `orchestrate-dev.js:6905`, `:6862` | A2 `verifyGate` (§7) |
| `checkPrCi` | `orchestrate-dev.js:5927` | A5 gate + `ciStatus` provenance (§8) |
| `raisePrAndVerifyCi`, `rebaseOntoDefault` | `orchestrate-dev.js:6337`, `:6254` | Phase PUB / A4 gate |
| `dodVerifyLoop`, `parseDodStatus`, `DOD_MAX_ITERATIONS = 3` | `orchestrate-dev.js:6273`, `:6059`, `:25` | A3 evidence + P-1 prohibition |
| `defaultAppendFile` | `orchestrate-dev.js:6805` | record + escalation append |
| `MERGE_ESCALATIONS` | `orchestrate-dev.js:1321` | N-1 unchanged-snapshot |
| `MODEL_DEFAULT`, `MODEL_IMPLEMENTATION` | `orchestrate-dev.js:1578`, `:1621` | constant placement |
| `buildFinalReport` (module-private) | `orchestrate-dev.js:8595` | advisory summary |
| `parsePlanTasks`, `parseImplementationConfig` | `orchestrate-dev.js:2039`, `:181` | `declaredScope`, A4 gate command |
| Phase I wave gate `const gate = await runCommandFn(implConfig.testCommand)` | `orchestrate-dev.js:8113` | why no property may ship red (§2) |
| wave prompt `You own EXACTLY these files` / `Do NOT run git add or git commit` | `orchestrate-dev.js:5850`, `:5851` | test-file ownership discipline |
| `parseTriageVerdict`, `triagePrompt`, `precheckDependencies`, `parseQueue` | `orchestrate-queue.js:302`, `:653`, `:630`, `:116` | A1/A2 routing |
| `parseReqFrontmatter`, `updateQueueStatus`, `rewriteStatus`, `buildQueueReport` | `orchestrate-queue.js:232`, `:358`, `:1086`, `:1221` | P-2/P-4 prohibitions, S-5 |
| guard hook: early-exit test, token regex, refusal message | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43`, `:57-59` | §9 harvest guard |
| guard-message consumers in the pipeline | `orchestrate-dev.js:8342`, `:8348` | the coupling regression |

**Property form.**

> **PROP-{DOMAIN}-{NN}** — {component} must / must not {observable behaviour} {given condition}.

Each row carries: **Category** (Functional / Contract / Error Handling / Data Integrity /
Integration / Security / Idempotency / Observability), **Level** (Unit / Integration / E2E),
**Traces** (REQ AC or NFR, FSPEC rule, FSPEC acceptance case where one exists), and **Home**
(the test file from PLAN §4 and the 🔴/🟢 task pair that owns it). A property with no FSPEC case id
in `Traces` is a PLAN- or PROPERTIES-level obligation and says so.

**What this document does not do.** It does not restate PLAN §5.2's per-batch gates, PLAN §6.4's
coverage floor, or PLAN §9's Definition of Done; those are execution mechanics and belong there. It
does not choose the framework (jest 29.7.0, pinned in `pdlc/workflows/package.json`) or invent a
generator (`__tests__/helpers/driftGenerators.js` already ships one — §2).

**Test-pyramid budget for this feature.** 78 of the properties below are Unit, 21 Integration, and
**zero E2E** — deliberately. The feature has no UI and no deployable surface; its "end to end" is a
whole-pipeline run of the workflow module against injected seams, which is exactly what the
Integration level already means here (PLAN §6.2's three harnesses). Anything that would be an E2E
test is instead PLAN A-34's *manual* runtime verification, which is a recorded fact, not a suite
member.

## 2. Fixtures, generators, and test doubles

### 2.1 The canonical doubles — one module, no local equivalents

Every double comes from `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` (PLAN A-02, §6.1),
whose export signatures are fixed there:

```js
export function makeAgentDouble({ script, throwOn })   // → (skill, prompt, opts) => Promise<string>
export function makeSeamOps(overrides)                 // → SeamOps, every member a spy with a default
export function makeFileDouble({ seed, throwOn })      // → { _readFile, _writeFile, _appendFile, files }
export function makeFakeClock({ start, autoAdvanceMs })// → { _now, _sleep, advance }
export function makeAdvisoryConfig(overrides)          // → a parsed config at ADVISORY_DEFAULTS
export function makeAdvisoryGenerators(seed)           // → { verdictText, configObject, envelopeCtx, classText, entryFields }
```

`_git` and `_ghRun` are **re-exported from the shipped `__tests__/helpers/mergeDoubles.js`**, not
re-authored (TSPEC §13.3). `helpers/seams.js`, `helpers/guardFixtures.js` and
`fixtures/tmpGitFixture.js` are shipped today and are composed with, not duplicated.

**PROP-INFRA-01** — No advisory test file must define its own `SeamOps` literal, agent double, file
double, clock or PRNG; every double must resolve to `advisoryDoubles.js` (or through it to
`mergeDoubles.js` / `driftGenerators.js`).
*Category: Contract · Level: Unit · Traces: PLAN AC-INFRA-1, TSPEC §16.2 · Home: reviewer-enforced
across `advisory*.test.js`; a locally-defined equivalent is a High finding.* A second `SeamOps` fake
is precisely how the driver's contract and the seams' contract drift apart.

### 2.2 The generator, and the seeding discipline

`pdlc/workflows/__tests__/helpers/driftGenerators.js` ships `seeded(seed)` (xorshift32, `:76`),
`resolveSeed(literalSeed)` honouring `PDLC_PROP_SEED` (`:134`) and `enumerateLeaves()` (`:158`), and
is already consumed by thirteen suites. §11's properties reuse it through `advisoryDoubles.js`; no
advisory file declares a PRNG and no task edits `driftGenerators.js`.

**PROP-INFRA-02** — Every generator-driven property must carry a literal seed, must honour
`PDLC_PROP_SEED` through `resolveSeed`, and must report the failing seed in its assertion message.
*Category: Observability · Level: Unit · Traces: PLAN §6.5 seeding discipline · Home: each §11
property's own file.* A property that fails without naming its seed is unreproducible and therefore
un-actionable.

### 2.3 The authored fixture — D-6's expected set

`pdlc/workflows/__tests__/fixtures/created-files-26c3f1c.json` (PLAN A-15) is the one fixture in
this feature that is **authored, never computed by the system under test** (DEC-ADV-10, TSPEC §11.2).
It carries a `scenario` header with nine fields — `baselineCommit` (`26c3f1c`), `reqPath`,
`forcePhases`, `agentDoubles`, `config`, `phasesReached`, `seamsInstrumented`, `command`, `date`.

**PROP-INFRA-03** — The disabled-run comparison must re-assert the fixture's `scenario` header
field-for-field **before** comparing created-file sets, and a header mismatch must fail as a
*fixture-staleness* failure distinct in message from a created-file diff.
*Category: Data Integrity · Level: Integration · Traces: FSPEC D-6 / T-10-3, TSPEC §11.2 · Home:
`advisoryDisabled.test.js` (A-16 🔴 / A-33 🟢).* Without the header the oracle can go false-red on
scenario drift or vacuously green on a narrowed scenario.

### 2.4 Fixture strings are transcribed literals, never derived

Four closed sets and one record grammar are compared against **transcribed literals**, not against
values read back out of the implementation:

| Literal | Normative source | Where transcribed |
|---|---|---|
| `ADVISORY_REFUSAL_REASONS` — the eight reasons in order | TSPEC §5.3 / REQ AC-3.6 | `advisoryEnvelope.test.js` |
| `ADVISORY_EXCLUSIONS` = `["X-a","X-e","X-d","X-b","X-c"]` | TSPEC §5.3 | `advisoryEnvelope.test.js` |
| `ENVELOPE_DEFAULTS` = {E-1, E-2, E-3, E-4} | FSPEC §5.2 / REQ AC-3.3 | `advisoryEnvelope.test.js` |
| `ADVISORY_SEAMS` = {A1, A2, A3, A4, A5} | TSPEC §3.1 | `advisoryEnvelope.test.js`, driver registry |
| the seven `ADVISORY-*` record fields and their order | TSPEC §9.1 | `advisoryRecord.test.js` |
| the eight `ESCALATIONS.md` fields, decision sentence first | TSPEC §10.1 | `advisoryEscalationLog.test.js` |

**PROP-INFRA-04** — Each of the four closed sets must be compared by **set equality** against its
transcribed literal, so both an invented and a deleted member fail.
*Category: Contract · Level: Unit · Traces: T-03-5, T-03-8, FSPEC §18.2 · Home:
`advisoryEnvelope.test.js` (A-06 🔴 / A-20 🟢).*

### 2.5 One constraint the suite's *shape* must respect

Phase I's script-owned gate runs the whole configured suite after every wave and throws on failure
(`orchestrate-dev.js:8113`), so a genuinely-failing new case ends the run rather than colouring a
batch red. Every property below is therefore authored inside a `describe.skip(...)` block named for
the 🟢 task that lands the last symbol its cases exercise, and un-skipped by exactly that task
(PLAN §3 steps 1–3). This is a *packaging* rule, not a weakening: a skipped case that is never
un-skipped is caught by PLAN §9.1's zero-skips-remaining check.

## 3. Oracles — the falsifiability rules every property below obeys

Five oracles recur throughout this feature. Each is defined once here and referenced by name, so no
property below has to re-derive it and no implementer can satisfy a weakened form of it.

### O-1 — The escalation triple (never an absence check)

REQ AC-3.6 and FSPEC V-8 say every escalation produces "the same observable triple". Asserting
`outcome != "resolved"` alone is unfalsifiable — `no-action`, a thrown error or an unset field would
all pass. **O-1 is three positive conjuncts, asserted together on one path:**

1. `disposition.outcome === "escalated"` (exact value, not a negation);
2. `disposition.reason` is **one** member of `ADVISORY_REFUSAL_REASONS`, and the *same* string
   appears in the `ADVISORY-{feature}.md` entry's `Disposition` row **and** in the
   `ESCALATIONS.md` entry's `Refusal reason` row — one reason, three places, byte-equal;
3. the seam's pre-advisory behaviour happened: at A1/A2 the candidate was skipped (the queue's
   `needs-human` branch still `continue`s), at A3/A4/A5 the pre-existing `throw haltError(...)` still
   fired with a byte-identical message.

Conjunct 3 is what makes O-1 falsifiable against a build where the seam silently swallowed the halt.

### O-2 — Two tree states, never three (byte-identity with a positive-presence conjunct)

FSPEC BR-5 admits exactly two post-invocation tree states. A bare "output == input" comparison is
vacuous on a fixture that never contained the content in the first place, so **O-2 is two conjuncts**:

1. a *positive-presence* pre-condition — the fixture demonstrably contains the content whose survival
   is being asserted (the conflicted hunk, the REQ citation line, the guarded file's bytes), asserted
   before the seam runs;
2. the state comparison itself — `git status --porcelain` and `git rev-parse HEAD` taken before and
   after over a real temporary repo (`__tests__/fixtures/tmpGitFixture.js`), equal on the revert
   branch, and on the resolved branch equal to the verified post-resolution state and to nothing else.

O-2 is asserted **on a real tree** only where a real tree exists: PLAN §6.2 restricts it to A-10 and
A-11. `advisoryDriver.test.js` (A-07) drives a *fake* `SeamOps`, so its revert obligation is the
behavioural one — `revert` invoked exactly once, before the disposition is returned (O-3), not a git
comparison that would assert nothing.

### O-3 — Identical-envelope behaviours are counted, not shaped

`revert`, a re-poll, a re-run and a retry can all leave a result envelope that looks the same whether
or not they happened. Every such property's oracle is a **spy call-count**, and symmetrically for
every member of the family:

| Behaviour | Counted oracle |
|---|---|
| revert on out-of-envelope produced diff, on gate failure, on record-write failure | `seamOps.revert` called exactly once, and `seamOps.apply` called before it |
| A5 re-poll after `apply` | `checkPrCi` (`orchestrate-dev.js:5927`) spy called ≥ 1 time **after** `apply`, and the reported `ciStatus` byte-equal to the spy's **last return value** |
| E-1 flaky re-run | the workflow-rerun transport called exactly once per attempt, on a commit sha byte-equal to the pre-seam head |
| attempt budget | dispatch spy called exactly `attemptBudget` times — never "at most" |
| disabled tier | dispatch spy and rung-resolution spy called **zero** times (the one place a zero count is the assertion, and it is paired with a positive: the pre-advisory outcome occurred) |

### O-4 — Routing branches get a workflow-level property, not only a guard unit test

Four routing decisions in this feature are coverage-mode gates in the FSPEC sense — the seam-token
router (A1 vs A2), the `enabled` master switch, the `status === "failed"` branch inside
`raisePrAndVerifyCi` (`orchestrate-dev.js:6337`), and the capability probes (BL-05 / BL-06). For each,
**at least one Integration-level property drives the real phase body end to end and asserts the
terminal disposition and the phase outcome** — a guard-only unit test cannot see the routing path.
These are PROP-A12-01, PROP-DIS-01, PROP-A5-09 and PROP-A5-04/05.

### O-5 — Precedence-defeating fixtures

Several properties assert a *new* blocking cause behind an existing precedence chain. A fixture in
which an earlier branch preempts the new cause would pass even if the feature were unimplemented, so
each such property names the earlier outcomes its fixture must defeat:

| Property | Earlier branch that must not fire |
|---|---|
| `revert-on-test-touch` ahead of `out-of-envelope` (T-03-4) | the fixture must satisfy **both** triggers, and the assertion is on the *earlier* reason |
| A5's pre-existing-failure escalation (T-07-2) | the E-2 "introduced" test must not have been reached — assert the default-branch probe ran **first** |
| A4's mixed conflict set (T-06-4) | the branch-created check must not have resolved the branch-created subset first — assert `apply` was never called |
| A1 refusing a blocked pre-check (T-04-3b) | the reachable production path skips before triage, so the unit-scoped property drives `honourA1Verdict` directly |
| A2's durable commit observed by a *subsequent* invocation (T-04-6) | assert across a **reload** of the branch head, not from an in-memory prior |

### O-6 — A `resolved` outcome is reachable only through a gate

FSPEC BR-6. For every member of `ADVISORY_SEAMS`, a property asserts that with the seam's
`verifyGate` stubbed to fail the disposition is never `resolved`, and that **replacing the gate with
`async () => ({ passed: true })` makes the case fail** — so a silently-removed or stubbed gate cannot
pass. See §13 item 1 for the one seam where the upstream documents disagree about what A1's gate is.

## 4. Properties — configuration and model rung

Home for all of these: `advisoryConfig.test.js` (A-03 🔴 / A-17 🟢) and `advisoryRung.test.js`
(A-04 🔴 / A-18 🟢), per PLAN §8.1.

### 4.1 Configuration (`parseAdvisoryConfig`, `readAdvisoryConfigSafely`)

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-CFG-01 | `parseAdvisoryConfig(text)` must return `{ config, sectionMalformed, invalidKeys }` and must never throw, for **any** input including `null`, `""`, non-JSON bytes, JSON that is not an object, and an object with no `advisory` key. | Error Handling | Unit | AC-1.7, C-1, T-01-1 | `advisoryConfig.test.js` |
| PROP-CFG-02 | Given no `advisory` section, an absent file (`text === null`), or unparseable JSON, `config` must deep-equal `ADVISORY_DEFAULTS` — `{enabled:false, attemptBudget:3, seamBudgetMinutes:10, envelope:["E-1","E-2","E-3","E-4"]}` — transcribed as a literal, and `invalidKeys` must be `[]`. | Functional | Unit | AC-1.7, C-1, T-10-4 | `advisoryConfig.test.js` |
| PROP-CFG-03 | Given exactly one out-of-range key *k*, the returned config must carry `ADVISORY_DEFAULTS[k]` for *k*, the **configured** value for every key ≠ *k*, and `invalidKeys` must equal `[k]` exactly. Per-key fallback is independent; one bad key must not reset the section. | Data Integrity | Unit | AC-1.7, C-2, T-01-6 | `advisoryConfig.test.js` |
| PROP-CFG-04 | The degraded-key notice must be emitted **iff** the effective `enabled` resolves `true`; with `enabled` false (or itself malformed) `invalidKeys` must still be populated by the parser while **no** notice is emitted. The suppression must live at the emit site, not in the parser. | Observability | Unit | C-2, DEC-ADV-08, TSPEC §3.2 | `advisoryConfig.test.js` (mechanism only; the disabled-run artifact claim is T-10-4's, whose single home is `advisoryDisabled.test.js`) |
| PROP-CFG-05 | `readAdvisoryConfigSafely` must be called **exactly once per run**, before the first seam can fire, and its result threaded thereafter — a second read must not occur even when five seams fire. Asserted by an `_readFile` call-count spy scoped to `ADVISORY_CONFIG_PATH` (O-3). | Contract | Integration | C-3, F-1, AC-1.7 | `advisoryConfig.test.js` + the phase-integration harness |
| PROP-CFG-06 | No advisory code path must write `ADVISORY_CONFIG_PATH`, and no agent output must change any resolved config value: the config object must be frozen after parse and must never be passed to `_writeFile`. | Security | Unit | C-4, AC-3.1, NFR-1 | `advisoryConfig.test.js` |
| PROP-CFG-07 | `advisory.envelope` must be read as the per-seam allow-list and must **not** be widenable at runtime: a verdict, prompt or agent text proposing an unlisted action must leave `config.envelope` deep-equal to its parsed value. | Security | Unit | AC-3.1, E-R1, BR-1 | `advisoryConfig.test.js` |

`ADVISORY_CONFIG_PATH` is `.claude/pdlc.config.json` — the same per-repo config home Phase MERGE and
the distribution gate already use (`orchestrate-dev.js:43`, aliased at TSPEC §3.1).

### 4.2 Model rung (`isModelResolutionError`, `resolveAdvisoryRung`)

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-RUNG-01 | Exactly one constant must name each rung — `MODEL_ADVISORY` (`"fable"`) and `MODEL_ADVISORY_FALLBACK` (`"opus"`) — placed with `MODEL_DEFAULT` (`orchestrate-dev.js:1578`) and `MODEL_IMPLEMENTATION` (`:1621`), and every advisory dispatch site in **both** modules must reference those constants rather than a literal. Asserted by a source scan for a bare `"fable"`/advisory-model literal outside the constant declarations. | Contract | Unit | AC-1.1, AC-1.5 | `advisoryRung.test.js` |
| PROP-RUNG-02 | `MODEL_ADVISORY_FALLBACK` must be a **separate** constant, not an alias of `MODEL_DEFAULT`: repointing `MODEL_DEFAULT` in the fixture must not move the fallback rung. | Data Integrity | Unit | AC-1.2, TSPEC §3.1 | `advisoryRung.test.js` |
| PROP-RUNG-03 | `isModelResolutionError(err)` must return `true` for a rejection naming an unknown/unrecognised/invalid/unsupported **model or alias**, and `false` for every other rejection — including a mid-flight failure of a dispatch that had already produced output. | Error Handling | Unit | AC-1.2, M-1, T-01-5 | `advisoryRung.test.js` |
| PROP-RUNG-04 | Given `MODEL_ADVISORY` is rejected as a model error, `resolveAdvisoryRung` must (a) emit an `ADVISORY_MODEL_FALLBACK` notice naming **both** the unresolvable value and the substitute, (b) return `{ model: MODEL_ADVISORY_FALLBACK, fallback: true }`, (c) re-dispatch the same prompt exactly once, and (d) proceed. The record's `Model` row and the report summary must both show the substitution. | Functional | Unit | AC-1.3, M-2, T-01-3, T-08-7 | `advisoryRung.test.js` |
| PROP-RUNG-05 | Given a rejection `isModelResolutionError` does **not** match, no fallback ladder must be entered: the fallback dispatch spy must be called zero times, `fallback` must stay `false`, and the failure must be dispositioned as an ordinary invocation failure consuming one attempt. | Error Handling | Unit | M-1, T-01-5 | `advisoryRung.test.js` |
| PROP-RUNG-06 | Given **both** rungs are rejected as model errors, the run must fail with a model-resolution halt, no advisory agent must have produced output, and there must be no third fallback and no revert to `MODEL_DEFAULT` — asserted positively by the halt's message naming both attempted rungs, plus a dispatch-count spy showing exactly two dispatches. | Error Handling | Unit | AC-1.4, M-3, T-01-4 | `advisoryRung.test.js` |
| PROP-RUNG-07 | Rung resolution must be **lazy and memoised per run**: with the tier enabled and no seam condition arising, the classification dispatch count must be zero and the report must still carry five zero rows; with two seams firing, one `_state` object must yield exactly one resolution. | Idempotency | Integration | M-4, F-1, T-01-7, T-10-5 | `advisoryRung.test.js` |
| PROP-RUNG-08 | The resolution memo must be a **threaded parameter**, never module state: two `runAdvisorySeam` invocations given two distinct `_state` objects must each resolve independently, and no resolution must leak between them. | Contract | Unit | DEC-ADV-05, TSPEC §3.5 | `advisoryRung.test.js` |

**Negative properties in this domain.** PROP-RUNG-05 and PROP-RUNG-06 are the two paths where a
weaker oracle would silently pass: a test asserting only "the run failed" is satisfied by any throw,
so PROP-RUNG-06 pins the message content and the dispatch count, and PROP-RUNG-05 pins a *zero*
fallback count against a *positive* ordinary-failure disposition (O-3's symmetry rule).

## 5. Properties — verdict contract, invocation lifecycle, budgets

Two homes, and the split is load-bearing: the **unit** surface of `parseAdvisoryVerdict` and
`budgetExceeded` lives in `advisoryVerdict.test.js` (A-05 🔴 / A-19 🟢); every property provable only
against the driver lives in `advisoryDriver.test.js`, block `A-22 — driver lifecycle` (A-07 🔴 /
A-22 🟢). PLAN §8.1 places all six FSPEC T-02 cases in the driver file.

### 5.1 The verdict contract (`parseAdvisoryVerdict`) — unit surface

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-VER-01 | `parseAdvisoryVerdict(raw)` must be pure and total, returning `{ verdict, malformed, why }` for **any** string — empty, whitespace, prose with no trailer, truncated JSON, a trailer repeated twice — and must never throw. | Error Handling | Unit | V-4, TSPEC §4.2 | `advisoryVerdict.test.js` |
| PROP-VER-02 | A well-formed verdict must carry exactly the six declared fields — `seam` ∈ `ADVISORY_SEAMS`, non-empty `diagnosis`, non-empty `proposedAction`, `confidence` ∈ {`high`,`low`}, boolean `withinEnvelope`, non-empty `evidence[]` — and a parse must reject any input missing or mistyping one. | Contract | Unit | AC-2.1, FSPEC §4.2 | `advisoryVerdict.test.js` |
| PROP-VER-03 | The five malformedness rules must each be falsifiable in isolation: (a) `seam` ≠ the dispatched seam, (b) empty `evidence`, (c) empty `diagnosis`, (d) absent `proposedAction`, (e) `confidence` outside the two-value enum. Each must set `malformed: true` with a `why` naming that rule. | Error Handling | Unit | V-4, FSPEC §4.4, AC-2.3 | `advisoryVerdict.test.js` |
| PROP-VER-04 | `confidence` must be exactly two-valued: a third value (`"medium"`, `"HIGH"`, `1`) must be malformed, never coerced to `high`. | Contract | Unit | AC-2.1 | `advisoryVerdict.test.js` |
| PROP-VER-05 | A verdict's `withinEnvelope` field must never be read as the membership decision: a parse must preserve it as data, and the driver must reach the same disposition whether it is `true` or `false` when the pipeline's own classification is unchanged. | Security | Unit | AC-2.1, V-3, BR-1 | `advisoryVerdict.test.js` (field) + `advisoryDriver.test.js` (behaviour, T-02-3) |

### 5.2 Budgets (`budgetExceeded`) — unit surface

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-BUD-01 | `budgetExceeded({attempts, attemptBudget, elapsedMs, waitMs, seamBudgetMinutes})` must be pure — no clock, no IO — and must return `true` iff `attempts >= attemptBudget` **or** `elapsedMs - waitMs >= seamBudgetMinutes * 60_000`. | Functional | Unit | AC-2.4, NFR-4, V-5 | `advisoryVerdict.test.js` |
| PROP-BUD-02 | The wall-clock comparison must **exclude** accumulated check-rollup wait: adding any `waitMs` must never flip a `false` result to `true`, for any fixed `elapsedMs`. | Data Integrity | Unit | NFR-4, A5-3, T-07-12 | `advisoryVerdict.test.js` |
| PROP-BUD-03 | `waitMs` must be zero for every seam but A5 — a non-zero `waitMs` at A1–A4 is a defect and must be asserted against at the seam's own `SeamOps`. | Contract | Unit | NFR-4, TSPEC §4.5 | `advisoryVerdict.test.js` |
| PROP-BUD-04 | Whichever bound is reached first must end the invocation, and the reason must be computed **once at termination** from the terminating condition — never accumulated across attempts. A run whose earlier attempts were malformed and which ends on the attempt bound must report `budget-exhausted`, not `malformed-verdict`. | Functional | Unit | V-5, FSPEC §5.3 opening clause, T-02-4 | `advisoryVerdict.test.js` (arithmetic) + `advisoryDriver.test.js` (the terminating reason) |

### 5.3 The invocation lifecycle (`runAdvisorySeam`) — driver surface

| # | Property | Category | Level | Traces | Home (block) |
|---|---|---|---|---|---|
| PROP-LIFE-01 | With `config.enabled === false` the driver must return **before** any dispatch and before `resolveAdvisoryRung`: agent-dispatch and rung-resolution spies must both read zero, and the returned disposition must be the seam's declared pre-advisory no-op. | Integration | Unit | D-1, D-2, AC-1.6, TSPEC §4.4 entry row | `A-22 — driver lifecycle` |
| PROP-LIFE-02 | The seven steps must execute in TSPEC §4.4's order — DIAGNOSE, VALIDATE, GATE, RE-CHECK, ACT, CHECK, VERIFY, RECORD — with `apply` never called before both gates pass and `verifyGate` never called before `producedPaths` has been re-classified. Asserted by an ordered call log over a fake `SeamOps`. | Contract | Unit | V-1, BR-2, BR-3, TSPEC §4.4 | `A-22 — driver lifecycle` |
| PROP-LIFE-03 | Autonomous action must require **both** in-envelope **and** `confidence === "high"`: with either false, `apply` must never be called and the disposition must satisfy O-1 with reason `out-of-envelope` / `low-confidence` respectively. | Functional | Unit | AC-2.2, V-1, BR-2, T-02-1, T-02-2 | `A-22 — driver lifecycle` |
| PROP-LIFE-04 | A verdict claiming `withinEnvelope: true` for an action the configured envelope excludes must be refused, and the **disagreement** must appear in the advisory record as a positive field (the recorded envelope determination naming both the agent's claim and the pipeline's finding) — not merely as the absence of an action. | Data Integrity | Unit | AC-2.2, V-3, T-02-3 | `A-22 — driver lifecycle` |
| PROP-LIFE-05 | Step 3b RE-CHECK: when `conditionHolds()` returns false the disposition must be `no-action`, **no attempt must be consumed** (`attempts` unchanged), nothing must be applied, and the record must still carry an entry. | Functional | Unit | V-7, R-4, T-02-6 | `A-22 — driver lifecycle` |
| PROP-LIFE-06 | `seamOps.apply` returning `{ok:false}` must trigger `revert` exactly once (O-3) before the disposition is returned, and the disposition must satisfy O-1 with reason `post-action-verification-failed`. | Error Handling | Unit | TSPEC §4.6, T-03-7 | `A-22 — driver lifecycle` |
| PROP-LIFE-07 | A step-7 record-write failure must revert the action and satisfy O-1 with reason `record-write-failed`; the action must not survive. | Error Handling | Unit | AC-9.2, R-2, T-08-2 | `A-22 — driver lifecycle` |
| PROP-LIFE-08 | `seamOps.revert` itself throwing must be rethrown as a halt — an unrevertable tree must never be left silently, because BR-5 admits exactly two states. | Error Handling | Unit | BR-5, TSPEC §4.6 | `A-22 — driver lifecycle` |
| PROP-LIFE-09 | Exactly `attemptBudget` attempts must be made when every response is unparseable — asserted as a dispatch **call count equal to** `attemptBudget` (never "at most"), followed by an escalation. | Functional | Unit | AC-2.4, V-5, T-02-4 | `A-22 — driver lifecycle` |
| PROP-LIFE-10 | An invocation whose elapsed time passes `seamBudgetMinutes` **during its first and only attempt** must have that in-flight attempt preempted on the injected clock, must escalate with reason `budget-exhausted`, must start no further attempt, and must report `attempts === 1`. | Functional | Unit | NFR-4, V-5, T-02-5 | `A-22 — driver lifecycle` (fake clock, `makeFakeClock`) |
| PROP-LIFE-11 | The terminal disposition set must be closed and total: every path must return exactly one of `resolved` / `escalated` / `no-action`, and an **unclassified throw** anywhere in the lifecycle must map to `escalated`, never to `resolved`. | Error Handling | Unit | V-7, TSPEC §17.1, §17.3 | `A-22 — driver lifecycle` |
| PROP-LIFE-12 | For **every** member of `ADVISORY_REFUSAL_REASONS`, an escalating invocation must satisfy O-1 in full. Parameterised off the exported constant, so a newly-added reason fails the suite until it has a case. | Contract | Unit | AC-3.6, V-8, T-02-6, FSPEC §18.2 | `A-22 — driver lifecycle` |
| PROP-LIFE-13 | Attempts within one invocation must be sequential and no invocation must be concurrent with itself or with another seam: the driver must be `await`ed at each call site and must never be wrapped in `parallel`. Asserted by an overlap detector over the dispatch spy's start/end timestamps on the fake clock. | Contract | Unit | V-6, F-2 | `A-22 — driver lifecycle` |
| PROP-LIFE-14 | Each seam condition must yield **at most one** invocation per run — the budgets bound attempts inside an invocation, not the number of invocations. | Idempotency | Integration | F-3, V-5 | phase-integration harness (A-10, A-11, A-12) |

## 6. Properties — envelope, refusal ladder, prohibitions

Home: `advisoryEnvelope.test.js` (A-06 🔴 / A-20 🟢) for the pure classifier and the ladder;
`advisoryDriver.test.js` for the prohibitions and gate exclusivity (blocks per PLAN §8.2). This is
the hardest-enforced part of the feature: it is what makes REQ US-03's "un-widenable boundary" a
control rather than a promise.

### 6.1 The classifier (`classifyEnvelope`) — enforcement in code, not in a prompt

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-ENV-01 | `classifyEnvelope(candidate, ctx)` must be pure and total — no IO, no clock, no agent — and must return `{ inside, reason, matched }` for every generated input. | Contract | Unit | E-R3, NFR-1, TSPEC §5.1 | `advisoryEnvelope.test.js` |
| PROP-ENV-02 | No prompt text must participate in the membership decision: a `candidate` whose `action` string argues for permission (e.g. `"this is clearly in scope"`) must classify identically to the same candidate with an empty argument. | Security | Unit | E-R1, NFR-1, BR-1, V-2 | `advisoryEnvelope.test.js` |
| PROP-ENV-03 | Membership must be evaluated **twice** — on the proposal (step 3) and on the produced diff (step 5) — by **the same function**, not by two code paths. Asserted by a call-count spy showing two `classifyEnvelope` calls per applied invocation with different `candidate`s and identical `ctx`. | Contract | Unit | E-R2, BR-3, AC-3.2 | `advisoryEnvelope.test.js` + `A-22 — driver lifecycle` |
| PROP-ENV-04 | The evaluation order must be exactly TSPEC §5.1's six checks — prohibitions, X-a, X-e, X-d, X-b, X-c/membership — and must iterate `ADVISORY_EXCLUSIONS` (`["X-a","X-e","X-d","X-b","X-c"]`) in its declared array order, so the constant drives the table rather than documenting it. | Functional | Unit | AC-3.6, TSPEC §5.1/§5.3 | `advisoryEnvelope.test.js` |
| PROP-ENV-05 | A produced change reaching outside the envelope must be reverted **whole**, never trimmed: after the revert the tree must satisfy O-2 (positive-presence pre-condition plus byte-identity), and no partial application must survive. | Data Integrity | Unit + Integration | AC-3.2, E-R2, BR-3, T-03-2 | `advisoryEnvelope.test.js` (classification) + `advisoryDodSeams.test.js` / `advisoryPubSeam.test.js` (tree, per PLAN §6.2) |
| PROP-ENV-06 | An out-of-envelope **proposal** must leave the tree byte-identical to its pre-invocation state and `apply` uncalled — the refusal must happen before anything is written. | Data Integrity | Integration | AC-3.2, T-03-1 | `advisoryDodSeams.test.js` (O-2 on `tmpGitFixture.js`) |
| PROP-ENV-07 | X-d (declared scope) must be computed per seam from a non-agent source and must never be inferred by an agent: A1 `[]`, A2 `[reqPath]`, A3 `[]`, A4 PLAN-named files ∪ `merge-base..preRebaseHead`, A5 PLAN-named files ∪ `merge-base..HEAD` — PLAN names coming from `parsePlanTasks` (`orchestrate-dev.js:2039`). | Security | Unit | AC-3.4(d), TSPEC §5.2, T-03-9 | `advisoryEnvelope.test.js` |
| PROP-ENV-08 | X-e must **reuse** the shipped `guardVerdict` (`orchestrate-dev.js:731`) with `guardPaths = effectiveGuardPaths(...)` (`:708`); no second matcher must exist. A diff touching a guard path must be reverted whole with reason `out-of-envelope` and the guarded file must be byte-identical afterwards (O-2). | Security | Unit + Integration | AC-3.4(e), REQ-MERGE-03, T-03-10, DEC-ADV-06 | `advisoryEnvelope.test.js` |
| PROP-ENV-09 | X-b (`touchesDodCriterion`) must refuse any diff touching a Definition-of-Done criterion or threshold, by path **and** by operation — a threshold lowered inside `package.json` or `pyproject.toml` matches no test path and must still be caught. | Security | Unit | AC-3.4(b), AC-4.1, P-1 | `advisoryEnvelope.test.js` |
| PROP-ENV-10 | X-c: a rebase conflict outside E-3's branch-created files must be out of envelope, for every conflict set containing at least one non-branch-created member. | Functional | Unit | AC-3.4(c), T-06-4 | `advisoryEnvelope.test.js` |
| PROP-ENV-11 | `branchCreated(path)` must be true iff the path is absent from the merge-base tree **and** absent from the default-branch tip — both conjuncts required, so a file added on the default branch since the merge base is not "branch-created". | Data Integrity | Unit | AC-3.3 E-3 | `advisoryEnvelope.test.js` |
| PROP-ENV-12 | `ENVELOPE_DEFAULTS` must equal `{E-1,E-2,E-3,E-4}` and `ADVISORY_EXCLUSIONS` must equal `{X-a,X-b,X-c,X-d,X-e}` **as sets**, against transcribed literals, and the comparison must **not** be parameterised by capability probes: where BL-05/BL-06 are unavailable the action stays a member and is refused at membership. | Contract | Unit | AC-3.3, AC-3.4, T-03-8 | `advisoryEnvelope.test.js` |

### 6.2 X-a — the seven operations, each its own named property

X-a is the feature's most dangerous exclusion: fixing a red test by editing the test. AC-3.5 requires
each enumerated operation to be asserted by its own test, so a dropped clause fails the suite rather
than degrading silently into "we check test paths".

| # | Property (each: an advisory diff performing this operation must be reverted whole, reason `revert-on-test-touch`, run not reported resolved) | Level | Traces |
|---|---|---|---|
| PROP-XA-01 | editing an assertion inside an existing test | Unit | AC-3.4(a), T-03-3 |
| PROP-XA-02 | deleting a test **file** | Unit | AC-3.4(a), T-03-3 |
| PROP-XA-03 | deleting a test **case** within a retained file | Unit | AC-3.4(a), T-03-3 |
| PROP-XA-04 | renaming a test out of the collected set (a name or path that `testPathIgnorePatterns` / the collection pattern no longer matches) | Unit | AC-3.4(a), T-03-3 |
| PROP-XA-05 | adding a skip / xfail / only marker | Unit | AC-3.4(a), T-03-3 |
| PROP-XA-06 | narrowing a parametrised case list | Unit | AC-3.4(a), T-03-3 |
| PROP-XA-07 | lowering a coverage or mutation threshold | Unit | AC-3.4(a), T-03-3 |

All seven live in `advisoryEnvelope.test.js` (A-06 🔴 / A-20 🟢). Each is **both** path-based and
operation-based: `touchesTestArtifact(paths, action)` receives the seam's structured description of
the edit, because PROP-XA-06 and PROP-XA-07 touch files that match no test-path regex. Each property
asserts the positive triple (O-1) as well as the revert, so it cannot pass against a build where the
seam never fired.

**PROP-XA-08** — The seven clauses must be enumerable: a source-level assertion that
`touchesTestArtifact` recognises exactly the seven declared operations, compared as a set, so a
deleted clause fails.
*Category: Contract · Level: Unit · Traces: FSPEC §18.2 T-03-3, PLAN §8.2.*

### 6.3 The refusal ladder (`refusalReasonFor`)

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-REF-01 | `ADVISORY_REFUSAL_REASONS` must equal, **as an ordered list**, the eight reasons of REQ AC-3.6 / TSPEC §5.3: `prohibited-action`, `revert-on-test-touch`, `out-of-envelope`, `post-action-verification-failed`, `record-write-failed`, `malformed-verdict`, `low-confidence`, `budget-exhausted`. Set-equality catches an invented or deleted member; order is asserted separately because it is observable. | Contract | Unit | AC-3.6, T-03-5 | `advisoryEnvelope.test.js` |
| PROP-REF-02 | Every refusal must carry **exactly one** reason — never zero, never two — in the disposition, the record and the escalation entry. | Contract | Unit | AC-3.6, V-8 | `advisoryEnvelope.test.js` |
| PROP-REF-03 | Given a refusal satisfying two triggers at termination, the reported reason must be the **earlier** in catalogue order. The fixture must genuinely satisfy both (O-5): a low-confidence verdict whose diff also touches a test artifact must report `revert-on-test-touch`, not `low-confidence`. | Functional | Unit | AC-3.6, T-03-4 | `advisoryEnvelope.test.js` |
| PROP-REF-04 | `refusalReasonFor(signals)` must be total (a reason for every non-empty signal set) and **first-match stable**: permuting the non-matching signals must never change the result, so the ordering claim is about the catalogue's own order and nothing else. | Functional | Unit | AC-3.6, PLAN P-5 | `advisoryEnvelope.test.js` |
| PROP-REF-05 | The signal set must be built **once at termination** from the terminating condition, never accumulated across attempts. | Data Integrity | Unit | FSPEC §5.3, TSPEC §4.5 | `advisoryVerdict.test.js` + `A-22 — driver lifecycle` |

### 6.4 Prohibitions — negative **and** positive on the same path

AC-4.6 is explicit that a negative assertion alone is satisfied by accident (it passes against a build
where the seam never fired). Each of the four properties below therefore asserts the prohibited thing
did not happen **and** O-1 holds on the same execution.

| # | Property | Category | Level | Traces | Home (block) |
|---|---|---|---|---|---|
| PROP-PROH-01 | The tier must never mark a DoD criterion satisfied, weaken one, or reduce the iteration requirement: `DOD_MAX_ITERATIONS` (`orchestrate-dev.js:25`) and `dodVerifyLoop`'s `maxIterations` (`:6273-6275`) must never receive an advisory-derived value, A3's `permittedActions` must be `[]`, and X-b must refuse any criterion-touching diff — plus O-1. | Security | Unit | AC-4.1, P-1, T-03-6 | `A-22 — driver lifecycle` |
| PROP-PROH-02 | The tier must never set `ready: true` on a REQ: an A2 diff touching the frontmatter block `parseReqFrontmatter` reads (`orchestrate-queue.js:232`) must fail at **membership** — the edit is inside `reqPath` so it passes X-d, but rewriting frontmatter is not the E-4 action — observably `out-of-envelope`, plus O-1. The falsifying fixture must be a frontmatter edit *inside* the REQ, not a scope-violating path (O-5). | Security | Unit | AC-4.2, P-2, T-03-6 | `A-22 — driver lifecycle` |
| PROP-PROH-03 | The tier must never declare CI passed: `ciStatus` must derive only from `checkPrCi` (`orchestrate-dev.js:5927`) via `raisePrAndVerifyCi` (`:6337`), and no advisory value must ever be assigned to it — asserted **behaviourally** per O-3 (spy call-count plus last-return-value identity), with the source grep kept only as a cheap secondary. Plus O-1. | Security | Unit + Integration | AC-4.3, P-3, T-03-6, T-07-7 | `A-22 — driver lifecycle` + `advisoryPubSeam.test.js` |
| PROP-PROH-04 | The tier must never merge a PR and never alter a queue `Status` cell: no advisory path may call `executeMerge`, `phaseMerge` (`orchestrate-dev.js:1361`), `rewriteStatus` (`orchestrate-queue.js:1086`) or `updateQueueStatus` (`:358`), and the queue-side `SeamOps` must be constructed without `_writeFile` bound to `queuePath`. Plus O-1. | Security | Unit | AC-4.4, NFR-5, P-4, T-03-6 | `A-22 — driver lifecycle` |
| PROP-PROH-05 | The tier must hold **no** credential the pipeline does not already hold: its only outward-facing capabilities must be the already-injected `_ghRun` and `_git`, and no new transport may appear. Asserted as a set-equality over the seams the advisory code paths receive. | Security | Unit | NFR-5, E-R4 | `advisoryEnvelope.test.js` |

### 6.5 Gate exclusivity — one property per seam (O-6)

**PROP-GATE-01 … PROP-GATE-05** — For each member of `ADVISORY_SEAMS`, a `resolved` outcome must be
reachable **only** through that seam's declared `verifyGate`: with the gate stubbed to fail the
disposition must never be `resolved`, and replacing the gate with `async () => ({ passed: true })`
must make the case fail.
*Category: Functional · Level: Unit · Traces: AC-4.5, BR-6, T-03-6(b), TSPEC §5.5 · Home: all five in
`advisoryDriver.test.js`, generated by iterating one in-file registry, split across blocks
`A-23 — A3/A4 gate exclusivity`, `A-24 — A5 gate exclusivity`, `A-31 — A1/A2 gate exclusivity`
(PLAN §8.2).*

**PROP-GATE-06** — The registry's key set must equal `ADVISORY_SEAMS` by set equality, in one place,
so a sixth seam fails the suite until it has a case and a deleted case means a deleted registry row.
*Category: Contract · Level: Unit · Traces: FSPEC §18.2, PLAN §8.1 · Home: `A-22 — driver lifecycle`.*

The A1 row of PROP-GATE-01…05 is the one place the upstream documents disagree on what is being
asserted — see §13 item 1.

## 7. Properties — seams A1 and A2 (queue module)

Home: `advisoryQueueSeams.test.js` (A-12 🔴 / A-29, A-30, A-31 🟢). These seams live in
`orchestrate-queue.js` and reach the driver through the bundle prelude, so every queue-side property
injects `_runAdvisorySeam` rather than relying on a free identifier.

### 7.1 Routing — the seam token (the gate that gives A2 a precondition)

Today's stop is one free-text signal (`parseTriageVerdict`, `orchestrate-queue.js:302`;
`triagePrompt`, `:653`) and no A2 gate exists at all, so routing is introduced work, not rewiring.

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-A12-01 | A `needs-human` triage result must carry a machine-readable seam token, and the queue must route `[SEAM:A1]` to the A1 adjudicator and `[SEAM:A2]` to the re-grounding seam — asserted at the **workflow level** by driving the real `needs-human` branch to a terminal disposition (O-4), not only by unit-testing the regex. | Integration | Integration | AC-5.5, T-04-9 | `advisoryQueueSeams.test.js` |
| PROP-A12-02 | `parseTriageVerdict` must preserve its existing contract while gaining `seamToken`: same last-line-wins scan, same fail-closed `needs-human` fallback, same `verdict`/`reason` values for every input that parsed before. Asserted against the shipped cases unmodified. | Contract | Unit | AC-5.5, TSPEC §6.2 | `advisoryQueueSeams.test.js` |
| PROP-A12-03 | An **absent** token must yield `seamToken: null` and route to A1; an **unrecognised** token must do the same by failing the alternation rather than by a special branch. Each alternation branch needs its own positive control — a fixture that actually produces `A1`, one that produces `A2`, and one that produces `null` — so the regex cannot pass by never matching. | Error Handling | Unit | AC-5.5, T-04-2, TSPEC §6.5 | `advisoryQueueSeams.test.js` |
| PROP-A12-04 | **Both** tokens on one stop must be malformed (V-4): the anchored single-group match must yield `seamToken: null` with a `reason` beginning `[SEAM:`, and `hasResidualSeamToken(reason)` must return `true`, escalating rather than routing. | Error Handling | Unit | AC-5.5, T-04-3b family, TSPEC §6.5 | `advisoryQueueSeams.test.js` |
| PROP-A12-05 | `triagePrompt` must preserve the three-verdict grammar byte-for-byte and **append** the token plus A2's citation-drift obligation — a prompt rewrite that changed the grammar must fail. | Contract | Unit | AC-5.5, TSPEC §6.2 | `advisoryQueueSeams.test.js` |
| PROP-A12-06 | The advisory config read must be placed **after** the drift gate and **before** `QUEUE.md` is read: when the drift gate blocks, no seam must fire, no config read must occur, and the `blocked` outcome must stand unchanged. | Integration | Integration | TSPEC §6.1/§6.5, AC-1.6 | `advisoryQueueSeams.test.js` |

### 7.2 Seam A1 — adjudicating a triage abstention

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-A1-01 | Only a `needs-human` **abstention** must be adjudicable: a triage verdict of `blocked` must produce no advisory invocation at all, the candidate must be skipped exactly as today (`orchestrate-queue.js:890-897` unchanged), and the summary must report zero A1 invocations. | Functional | Integration | AC-5.1, T-04-1, T-04-3 | `advisoryQueueSeams.test.js` |
| PROP-A1-02 | The advisory verdict set at A1 must be exactly `{run-candidate, hold, escalate}`, compared as a set — a fourth value must fail. | Contract | Unit | AC-5.1 | `advisoryQueueSeams.test.js` |
| PROP-A1-03 | `honourA1Verdict(verdict, precheck)` must refuse `run-candidate` whenever `precheck.blocked` is true, and the seam must escalate. Because the production path skips a blocked candidate before triage, this is asserted **unit-scoped over the function** (O-5), with T-04-3 carrying the reachable integration assertion. | Security | Unit | AC-5.1, A1-2, T-04-3b | `advisoryQueueSeams.test.js` |
| PROP-A1-04 | Where presence-in-base is unsettled — a declared dependency absent from the queue entries — the verdict must be `escalate` **regardless of the agent's verdict**, and no agent must have adjudicated presence in base. The pre-check is one-sided by construction; the pipeline decides from the queue rows. | Security | Unit | AC-5.1, A1-3, T-04-4 | `advisoryQueueSeams.test.js` |
| PROP-A1-05 | A1 must change **no file**: `permittedActions` must be `[]`, `declaredScope` must be `[]`, `apply`/`producedPaths`/`revert` must be throwing stubs, and after any A1 invocation the repository must satisfy O-2 (no file created, modified or deleted). | Data Integrity | Integration | AC-5.1, A1-4, T-04-2 | `advisoryQueueSeams.test.js` |
| PROP-A1-06 | `needs-human` candidates must be adjudicated **in queue order** and **at most one** candidate picked per invocation: given three such candidates adjudicated `hold`, `run-candidate`, `run-candidate`, exactly one pick must occur and it must be the second candidate. | Functional | Integration | AC-5.4, A1-5, T-04-5 | `advisoryQueueSeams.test.js` |
| PROP-A1-07 | The A1 dispatch must go through the raw agent seam with the advisory rung, **not** through the `MODEL_QUEUE` wrapper — asserted on the `model` option the dispatch spy observes. | Contract | Unit | AC-1.5, PLAN A-30 | `advisoryQueueSeams.test.js` |

### 7.3 Seam A2 — re-grounding a stale REQ

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-A2-01 | Given the re-grounding gate fires, the seam must produce a proposal listing **each drifted citation** with its corrected location and whether the cited symbol still resolves at HEAD — evidence gathered through the existing `_git` seam, never asserted by the agent alone. | Functional | Unit | AC-5.2, T-04-6 | `advisoryQueueSeams.test.js` |
| PROP-A2-02 | A proposal containing **only** location corrections where every cited symbol still exists must be inside the envelope (`permittedActions: ["E-4"]`), and E-4's decidable rule must be checked in `classifyEnvelope`, never in the prompt. | Functional | Unit | AC-5.3, A2-3 | `advisoryQueueSeams.test.js` |
| PROP-A2-03 | A proposal containing **any** citation whose symbol no longer exists must escalate with nothing applied — a REQ whose premise evaporated needs a human, not a patch. The fixture must contain at least one still-resolving citation too, so the property falsifies a blanket refusal. | Error Handling | Unit | AC-5.3, T-04-7 | `advisoryQueueSeams.test.js` |
| PROP-A2-04 | A proposal that also edits an acceptance criterion — or any requirements sentence — must be reverted **whole** with reason `out-of-envelope`, and the REQ must satisfy O-2 afterwards. | Security | Unit | AC-5.3, T-04-8 | `advisoryQueueSeams.test.js` |
| PROP-A2-05 | `declaredScope` must be exactly `[reqPath]` and `producedPaths` must equal `[reqPath]`; a diff touching any second file must revert whole under E-R2. | Data Integrity | Unit | AC-3.4(d), A2-5, T-04-8 | `advisoryQueueSeams.test.js` |
| PROP-A2-06 | The A2 step order must be `apply → CHECK → RECORD → verifyGate`: the record must be written **before** the commit, so a failed record write reverts a working-tree edit and never undoes a commit. Asserted by an ordered call log. | Data Integrity | Unit | AC-9.2, R-2, A2-6, DEC-ADV-03 | `advisoryQueueSeams.test.js` |
| PROP-A2-07 | `verifyGate` must make **one** pathspec-scoped commit over `[reqPath, recordPath]` via the reused `commitPaths` (`orchestrate-dev.js:6905`, including its `gitWithLockRetry` at `:6862`), never `-a` and never pushed, then confirm the branch head carries both. | Contract | Unit | A2-6, H-2b, T-04-6 | `advisoryQueueSeams.test.js` |
| PROP-A2-08 | Applying a re-grounding must **not** pick the candidate: triage must not re-run in the same invocation, the loop must `continue`, and a **subsequent** invocation reading the branch head must re-run the pre-check and triage on the corrected citations. Asserted across a reload of the branch head, never from an in-memory prior (O-5). | Idempotency | Integration | AC-4.5 (A2 row), AC-5.4, A2-4, T-04-6 | `advisoryQueueSeams.test.js` |
| PROP-A2-09 | A REQ with no citations must yield `no-action` — recorded, counted in `invocations`, and in neither `resolved` nor `escalated`. | Functional | Unit | V-7, TSPEC §6.5 | `advisoryQueueSeams.test.js` |
| PROP-A2-10 | Two drifted citations resolving to one symbol must stay inside E-4 — the rule is per citation, so the classifier must iterate rows, never targets. | Functional | Unit | TSPEC §6.5 | `advisoryQueueSeams.test.js` |
| PROP-A2-11 | A failed commit (hook, missing identity, index lock) must make `verifyGate` fail, revert, and escalate — never leave a half-committed state. | Error Handling | Unit | TSPEC §6.5, BR-5 | `advisoryQueueSeams.test.js` |
| PROP-A2-12 | The A1/A2 advisory record must be written under the **candidate feature's** directory, and a `hold`/`escalate` adjudication after which no pipeline runs must leave it on disk for that feature's next run to harvest. | Data Integrity | Integration | AC-9.1, H-2b, T-08-8 | `advisoryQueueSeams.test.js` |
| PROP-A2-13 | The queue's own run report must carry the advisory summary for A1/A2, and a dev-side report's A1/A2 rows must be structurally zero. | Observability | Integration | AC-9.4, S-5, T-08-8 | `advisoryQueueSeams.test.js` |

**Negative property for this domain.** PROP-A1-01 and PROP-A12-06 are the two places where the tier
must do *nothing*; both pair the zero dispatch count with a positive assertion that the pre-advisory
skip actually occurred (O-3's disabled-tier rule), so neither passes against a build where the queue
never reached the candidate at all.

## 8. Properties — seams A3, A4 and A5 (dev module)

Homes: `advisoryDodSeams.test.js` (A-10 🔴 / A-23, A-25 🟢) for A3 and A4;
`advisoryPubSeam.test.js` (A-11 🔴 / A-24, A-26 🟢) for A5. These two files are also where O-2's
real-tree comparisons live (`__tests__/fixtures/tmpGitFixture.js`), per PLAN §6.2.

### 8.1 Seam A3 — DoD exhaustion (classify, never fix)

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-A3-01 | A3 must fire only when `dodVerifyLoop` (`orchestrate-dev.js:6273`) exhausts its `DOD_MAX_ITERATIONS = 3` (`:25`) with findings remaining, and must classify **every** remaining finding as `real-defect` / `mis-scoped-criterion` / `deferral-candidate`, each with evidence, in the advisory record. | Functional | Unit | AC-6.1, T-05-1 | `advisoryDodSeams.test.js` |
| PROP-A3-02 | The three classes must be a frozen exported set, compared by set equality — an invented or deleted class fails. | Contract | Unit | A3-2 | `advisoryDodSeams.test.js` |
| PROP-A3-03 | `parseA3Classification(raw)` must be total over arbitrary agent text and must return `complete: false` whenever the classified-finding count is below the finding count in the evidence; an incomplete classification must be malformed (V-4), consuming an attempt. | Error Handling | Unit | A3-1, PLAN P-8 | `advisoryDodSeams.test.js` |
| PROP-A3-04 | `governingClass(classes)` must implement a **total order** `real-defect > mis-scoped-criterion > deferral-candidate` over every non-empty multiset, so "highest class wins" is well-defined including on ties. The empty input is deliberately out of scope — no seam path reaches it (§13 item 2). | Functional | Unit | A3-7, T-05-6, PLAN P-9 | `advisoryDodSeams.test.js` |
| PROP-A3-05 | Given any finding classified `real-defect`, the pipeline must halt **exactly** as it does with the tier disabled — the pre-existing DoD-not-passed `haltError` byte-identical — with the classification attached to the halt. | Integration | Integration | AC-6.3, T-05-2 | `advisoryDodSeams.test.js` (A-25 phase wiring) |
| PROP-A3-06 | Given a **mixed** `real-defect` + `deferral-candidate` finding set, the outcome must be the halt of PROP-A3-05, not the escalation of PROP-A3-07 — the precedence-defeating fixture required by O-5. | Functional | Unit | A3-7, T-05-6 | `advisoryDodSeams.test.js` |
| PROP-A3-07 | Given every finding classifies `deferral-candidate`, the seam must **escalate** with the proposed deferral rows and their named successors in the escalation entry, and must **never enact** a deferral: no queue row must change and no deferral row must be written anywhere. | Security | Integration | AC-6.2, A3-4, T-05-3 | `advisoryDodSeams.test.js` |
| PROP-A3-08 | A `deferral-candidate` with no named successor must make the proposal incomplete: the invocation escalates naming the unbound finding. | Error Handling | Unit | A3-4 | `advisoryDodSeams.test.js` |
| PROP-A3-09 | A classification of `mis-scoped-criterion` must escalate with **no DoD criterion or threshold changed** — asserted positively (the criterion file byte-identical) plus O-1. | Security | Unit | AC-6.4, AC-4.1, T-05-4 | `advisoryDodSeams.test.js` |
| PROP-A3-10 | After **any** A3 invocation the working tree must be byte-identical to its state when the seam fired (O-2) — a tree comparison, not a claim about `permittedActions`, so it catches an A3 that quietly acquired a capability. | Data Integrity | Integration | A3-6, T-05-5 | `advisoryDodSeams.test.js` (`tmpGitFixture.js`) |
| PROP-A3-11 | An unreadable DoD verifier status (`parseDodStatus` ⇒ `status: "unknown"`, `orchestrate-dev.js:6059`) must keep the conservative baseline: A3 fires on the same not-passed branch and names the unreadable status as evidence; the loop's treatment of `unknown` as failed must be unchanged. | Error Handling | Unit | TSPEC §7.2 | `advisoryDodSeams.test.js` |

### 8.2 Seam A4 — rebase conflict

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-A4-01 | A4 must fire on `ship-pr`'s `REBASE_STATUS: conflict` and must determine, **per file and by the pipeline**, whether each conflict is confined to branch-created files — via `git cat-file -e` probes against the merge base and the default-branch tip through `_git`, never by the agent's claim. | Security | Unit | AC-7.1, A4-1 | `advisoryDodSeams.test.js` |
| PROP-A4-02 | Given every conflict is branch-created and `confidence === "high"`, the conflict must be resolved, the rebase completed, the branch's test command run green, and the record must name **each resolved file with the side taken**. | Functional | Unit | AC-7.2, T-06-1 | `advisoryDodSeams.test.js` |
| PROP-A4-03 | Given any conflict touches a file present at the merge base, nothing must be resolved, the escalation entry must summarise the conflicting hunks, and the pipeline must halt exactly as with the tier disabled. | Functional | Integration | AC-7.3, T-06-2 | `advisoryDodSeams.test.js` |
| PROP-A4-04 | Given a **mixed** conflict set, the seam must escalate **before `apply` is ever called** — asserted by an `apply` call count of zero (O-3) plus O-5's precedence note: the branch-created subset must not have been resolved first. | Data Integrity | Unit | AC-3.4(c), A4-2, T-06-4 | `advisoryDodSeams.test.js` |
| PROP-A4-05 | A branch-created **test** file in the conflict set must resolve to `revert-on-test-touch`, not to a permitted E-3 action — X-a is evaluated at position 2 and E-3 membership at position 6, so this needs no special case — and the branch must be unchanged (O-2). | Security | Unit | AC-3.5, T-06-5 | `advisoryDodSeams.test.js` |
| PROP-A4-06 | A resolution whose test run then fails must revert to the **pre-seam head** (`git rebase --abort`) with reason `post-action-verification-failed`, and the branch must be byte-identical to its pre-seam state (O-2). | Error Handling | Unit | AC-7.4, T-06-3 | `advisoryDodSeams.test.js` |
| PROP-A4-07 | After **any** A4 outcome the branch must be in exactly one of two states — rebased with green tests, or unchanged from the pre-seam head. No third state (partially resolved, rebase in progress, dirty tree) is admissible. | Data Integrity | Integration | BR-5, A4-6, T-06-6 | `advisoryDodSeams.test.js` (`tmpGitFixture.js`) |
| PROP-A4-08 | `declaredScope` at A4 must be PLAN-named files ∪ `git diff --name-only {mergeBase}..{preRebaseHead}` — the **pre-rebase** head, captured before `rebaseOntoDefault` (`orchestrate-dev.js:6254`) is called. | Data Integrity | Unit | AC-3.4(d), A4-3 | `advisoryDodSeams.test.js` |
| PROP-A4-09 | Where `implementation.testCommand` is `null` or `_runCommand` is not a function (the same two-part check Phase I makes), the resolution **cannot be verified**, so the seam must revert and escalate — never degrade to a self-report as Phase I does. Covered twice, deliberately: the routing decision as a Seam-unit property over the real `verifyGate`, and the phase wiring as an Integration property driving the real Phase DOD body to the pre-existing rebase-conflict `haltError`. **Neither carries an FSPEC case id** — this is a TSPEC/PLAN-level obligation and no `T-06-7` is invented for it (§13 item 3). | Error Handling | Unit + Integration | TSPEC §7.4, PLAN §8.3 note 1 | `advisoryDodSeams.test.js` (A-10 🔴 → A-23 unit, A-25 integration) |
| PROP-A4-10 | "Tests pass but the tree is dirty" must be caught: `producedPaths` must be re-read **after** `verifyGate`'s rebase completes and any path outside the conflict set must fail E-R2 and revert whole. | Data Integrity | Unit | TSPEC §7.4, E-R2 | `advisoryDodSeams.test.js` |
| PROP-A4-11 | An empty conflict set at `conditionHolds` must yield `no-action` — recorded, counted, and leaving the phase to continue from its own re-read. | Functional | Unit | V-7, TSPEC §7.3 | `advisoryDodSeams.test.js` |

### 8.3 Seam A5 — CI failure

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-A5-01 | Given Phase PUB observes a failing check, the seam must retrieve the failing job's log via `gh run view --log-failed` through `_ghRun` and produce a diagnosis naming the failing **step** and the cause. | Functional | Unit | AC-8.1, T-07-1 | `advisoryPubSeam.test.js` |
| PROP-A5-02 | An unretrievable log must short-circuit to `escalated` **before any dispatch** — asserted by a dispatch count of zero (O-3) plus O-1 — so no diagnosis is ever produced from a guess. | Error Handling | Unit | AC-8.5, A5-5, T-07-5 | `advisoryPubSeam.test.js` |
| PROP-A5-03 | The default-branch comparison must run **before** E-2's *introduced* test, inside `gatherEvidence`; a check observed failing at the default-branch tip must escalate as pre-existing with no fix attempted. The fixture must make the E-2 rule *otherwise satisfiable* (O-5), so the property falsifies an implementation that ordered the two the other way. | Security | Unit | AC-8.4, A5-1, T-07-2 | `advisoryPubSeam.test.js` |
| PROP-A5-04 | Where `probeDefaultBranchChecks` (BL-05) reports the capability absent, `permittedActions` for that invocation must lose **both** E-1 and E-2, the seam must escalate with the comparison explicitly named as undone, and no fix must be attempted. Carries a workflow-level integration property (O-4), not only a probe unit test. | Error Handling | Unit + Integration | AC-8.4, BL-05, A5-2, T-07-3 | `advisoryPubSeam.test.js` |
| PROP-A5-05 | Where `probeWorkflowRerun` (BL-06) reports the capability absent, E-1 must drop out of that invocation's `permittedActions` while E-2 may remain, and a flaky diagnosis must escalate as out of envelope. | Error Handling | Unit + Integration | BL-06, T-07-4 | `advisoryPubSeam.test.js` |
| PROP-A5-06 | A probe's absence must remove an action from **this invocation's** `ctx.permittedActions` only, never from the shipped `ENVELOPE_DEFAULTS` — the set-equality of PROP-ENV-12 must stay capability-independent. | Contract | Unit | T-03-8, TSPEC §8.3 | `advisoryPubSeam.test.js` |
| PROP-A5-07 | One attempt must be one **act → re-poll** cycle, and E-1's push-free re-run must consume one attempt on the same budget as E-2's pushed fix. Given `attemptBudget` cycles all ending red, exactly that many cycles must have occurred (O-3), the reason must be `budget-exhausted`, the pushed fix commits must remain on the branch, and the pipeline must halt as today. | Functional | Unit | AC-8.2, A5-3, T-07-6 | `advisoryPubSeam.test.js` |
| PROP-A5-08 | A re-poll reaching Phase PUB's own completion cap must **consume an attempt** rather than escalating separately: with `attemptBudget: 2`, a capped first re-poll followed by a red second cycle must not halt at the cap, must consume exactly two attempts, and must end `escalated` / `budget-exhausted`. | Functional | Unit | AC-8.2, A5-3, T-07-11 | `advisoryPubSeam.test.js` |
| PROP-A5-09 | Re-poll wait must be excluded from the wall-clock bound: an invocation whose re-poll waits alone exceed `seamBudgetMinutes` while its act work does not must reach its full `attemptBudget` cycles, must not escalate `budget-exhausted` on the first cycle, and must end on whatever its last re-poll earned. | Functional | Unit | NFR-4, A5-3, T-07-12 | `advisoryPubSeam.test.js` |
| PROP-A5-10 | `ciStatus` must derive **only** from `checkPrCi` (`orchestrate-dev.js:5927`, reading `statusCheckRollup` at `:5933`): with a call-count spy, a run driving A5 to `resolved` must show the spy called at least once **after** `apply` and the reported `ciStatus` byte-equal to the spy's **last return value** (O-3). The source grep over assignment sites is a cheap secondary, never the sole oracle. | Security | Unit + Integration | AC-4.3, P-3, A5-4, T-07-7 | `advisoryPubSeam.test.js` |
| PROP-A5-11 | "Revert" after a push must never rewrite published history: steps 5 and 7 must complete **before** `verifyGate` pushes, a red re-poll must escalate with the fix commit still on the branch, no force-push must occur, and BR-5's invariant must be asserted on the **pre-push** tree. The escalation entry and the report must both name the pushed commit. | Data Integrity | Unit | A5-8, BR-5, T-07-6 | `advisoryPubSeam.test.js` |
| PROP-A5-12 | A rejected push (branch moved) must fail `verifyGate`, revert to `preSeamHead`, and retry or escalate on budget — the fix must never be left half-applied. | Error Handling | Unit | TSPEC §8.5 | `advisoryPubSeam.test.js` |
| PROP-A5-13 | Given a fix is pushed during Phase PUB, the report must name the **DoD-verified commit** and report a branch head beyond it as `unverified`; Phase PUB must neither re-run the DoD gate nor halt on the divergence. | Observability | Integration | AC-8.3, OQ-3, DEC-ADV-07, T-07-8 | `advisoryPubSeam.test.js` |
| PROP-A5-14 | Given no check registers within Phase PUB's existing no-checks window, the seam must **not fire**, the phase's existing pass must stand unchanged, and the no-checks outcome must be **named** in the advisory summary — distinguishable from a repo with no CI. | Integration | Integration | AC-8.6, A5-6, T-07-9 | `advisoryPubSeam.test.js` |
| PROP-A5-15 | Given checks that register and never complete so Phase PUB reaches its completion cap, no A5 invocation must occur, the halt must happen exactly as with the tier disabled, and the summary must name the outcome. | Integration | Integration | A5-9, T-07-10 | `advisoryPubSeam.test.js` |
| PROP-A5-16 | Several failing checks must be classified as a union: in-envelope only if **every** failing check is, and a mixed set must escalate — `classifyEnvelope` called once over the union, never per check. | Functional | Unit | TSPEC §8.5 | `advisoryPubSeam.test.js` |
| PROP-A5-17 | CI turning green mid-diagnosis must yield `no-action` via `conditionHolds`, with the phase continuing from its own rollup read. | Functional | Unit | V-7, TSPEC §8.5 | `advisoryPubSeam.test.js` |
| PROP-A5-18 | A proposed CI fix that touches a test file must be reverted whole with reason `revert-on-test-touch` — the single most likely way an agent "fixes" red CI, and therefore asserted at the seam as well as in §6.2. | Security | Unit | AC-3.5, T-03-3 | `advisoryPubSeam.test.js` |
| PROP-A5-19 | The A5 wiring must fire **only** on `raisePrAndVerifyCi`'s `status === "failed"` branch (`orchestrate-dev.js:6337`): the `passed` path, the no-checks path and the completion cap must be untouched, and every pre-existing `raisePrAndVerifyCi` test must pass without modification (the two new parameters default to no-ops). | Integration | Integration | AC-10.3, TSPEC §8.1 | `advisoryPubSeam.test.js` |

## 9. Properties — advisory record, escalation log, summary, harvest

## 10. Properties — disabled-tier equivalence and regression

## 11. Generator-driven properties (P-1 … P-9)

## 12. Coverage matrix

## 13. Gaps, negative space, and errata

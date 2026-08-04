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

**Test-pyramid budget for this feature.** The budget is stated as a **shape**, and the count below is
the count against it — not an estimate. This document defines **195 distinct `PROP-*` ids** (183 in
tables, 12 stated in prose: `PROP-INFRA-01…04`, `PROP-XA-08`, `PROP-GATE-01…06`, `PROP-REG-08`),
levelled as:

| Level | Count | Share |
|---|---|---|
| Unit | 148 | 76% |
| Integration | 40 | 21% |
| Unit **and** Integration (one property, asserted at both levels) | 7 | 3% |
| E2E | **0** | 0% |

The budget those numbers are measured against is: **Unit ≥ 70%, Integration ≤ 30%, E2E = 0.** The
count satisfies it. The share that needs an Integration harness is the union of the last two rows —
**47 properties**, against PLAN §6.2's three harnesses (`advisoryDodSeams.test.js` and
`advisoryPubSeam.test.js` for the real-tree fixtures, plus the phase-integration harness). That is a
real cost signal for A-10 / A-11 / A-12 sizing, and §13.3 item 3 names it as the suite's slowest
part; it is not a budget breach.

**Zero E2E is deliberate, not an omission.** The feature has no UI and no deployable surface; its
"end to end" is a whole-pipeline run of the workflow module against injected seams, which is exactly
what the Integration level already means here. Anything that would be an E2E test is instead PLAN
A-34's *manual* runtime verification, which is a recorded fact, not a suite member.

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

The doubles backing the `_git` and `_ghRun` seams are **re-exported from the shipped
`__tests__/helpers/mergeDoubles.js`**, not re-authored (TSPEC §13.3). The shipped export names are
`fakeGhRun` (`pdlc/workflows/__tests__/helpers/mergeDoubles.js:75`) and `fakeGit` (`:189`) —
`mergeDoubles.js` exports no `_git` / `_ghRun` symbol, so A-02 re-exports those two names under
whatever advisory-facing aliases it declares and imports nothing that does not exist.
`helpers/seams.js`, `helpers/guardFixtures.js` and `fixtures/tmpGitFixture.js` are shipped today and
are composed with, not duplicated.

**PROP-INFRA-01** — No advisory test file must define its own `SeamOps` literal, agent double, file
double, clock or PRNG; every double must resolve to `advisoryDoubles.js` (or through it to
`mergeDoubles.js` / `driftGenerators.js`).
*Category: Contract · Level: Unit · Traces: PLAN AC-INFRA-1, TSPEC §16.2 · Home:
`advisoryPreflight.test.js` (A-01 🔴 / A-17 🟢), asserted mechanically — see the oracle below.*
A second `SeamOps` fake is precisely how the driver's contract and the seams' contract drift apart.

**Its oracle is a source-text scan, not a review checklist** (DC-03: a load-bearing assertion that
cannot be falsified is not trusted). The property is a shipped case that reads **every**
`pdlc/workflows/__tests__/advisory*.test.js`, its own file included, and asserts for each:

1. no object literal carrying two or more `SeamOps` member names
   (`gatherEvidence`, `prompt`, `conditionHolds`, `apply`, `producedPaths`, `revert`, `verifyGate`,
   `declaredScope`, `permittedActions`) as keys — that shape is a locally-built `SeamOps`;
2. no `jest.fn()` / `jest.mock` binding named as an agent, file, clock or PRNG double
   (`/\b(agent|_agent|_readFile|_writeFile|_appendFile|_now|_sleep|rand|prng|seeded)\b\s*[:=]\s*jest\s*\.\s*fn\b/`);
3. every `import` naming any of `makeAgentDouble`, `makeSeamOps`, `makeFileDouble`, `makeFakeClock`,
   `makeAdvisoryConfig`, `makeAdvisoryGenerators` resolves to `helpers/advisoryDoubles.js` and to no
   other module.

Falsifiability is proved the same way PROP-REG-08(a) proves its own: the case is run once against a
fixture string containing each of the three shapes and must report all three, so a scan that matches
nothing cannot pass vacuously. Positive control included — a fixture importing correctly from
`advisoryDoubles.js` must report clean.

### 2.2 The generator, and the seeding discipline

`pdlc/workflows/__tests__/helpers/driftGenerators.js` ships `seeded(seed)` (xorshift32, `:76`),
`resolveSeed(literalSeed)` honouring `PDLC_PROP_SEED` (`:134`) and `enumerateLeaves()` (`:158`), and
is already consumed by sixteen suites under `pdlc/workflows/__tests__/`. §11's properties reuse it through `advisoryDoubles.js`; no
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

Four closed sets and **two record grammars** are compared against **transcribed literals**, not
against values read back out of the implementation:

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

**The same bar applies to the two grammars, not a weaker one.** Field *presence* is satisfied by an
entry carrying a ninth invented field, and §13.3(2) makes these grammars a byte-exact operator /
`pdlc-engineering-loop` contract. PROP-REC-02 and PROP-ESC-01 therefore assert **set equality** over
the emitted field-name set against the transcribed literal — an added field and a deleted field each
fail — **plus** the declared order as a separate assertion, because order is observable in the
rendered bytes.

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
`verifyGate` stubbed to fail the disposition is **`escalated` with reason
`post-action-verification-failed`, satisfying O-1 in full** — the positive outcome AC-4.6 requires,
not the absence check "never `resolved`" — and that **replacing the gate with
`async () => ({ passed: true })` makes the case fail**, so a silently-removed or stubbed gate cannot
pass. See §6.5 for the two conjuncts stated in full, and §13 item 1 for the one seam where the upstream documents disagree about what A1's gate is.

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
| PROP-CFG-05 | `readAdvisoryConfigSafely` must be called **exactly once per run**, before the first seam can fire, and its result threaded thereafter — a second read must not occur even when five seams fire. Asserted by a call-count spy on **`readAdvisoryConfigSafely` itself** — or on the `_readAdvisoryConfig` seam it is injected through — never on `_readFile` scoped to `ADVISORY_CONFIG_PATH` (O-3). | Contract | Integration | C-3, F-1, AC-1.7 | `advisoryConfig.test.js` + the phase-integration harness |
| PROP-CFG-06 | No advisory code path must write `ADVISORY_CONFIG_PATH`, and no agent output must change any resolved config value: the config object must be frozen after parse and must never be passed to `_writeFile`. | Security | Unit | C-4, AC-3.1, NFR-1 | `advisoryConfig.test.js` |
| PROP-CFG-07 | `advisory.envelope` must be read as the per-seam allow-list and must **not** be widenable at runtime: a verdict, prompt or agent text proposing an unlisted action must leave `config.envelope` deep-equal to its parsed value. | Security | Unit | AC-3.1, E-R1, BR-1 | `advisoryConfig.test.js` |

`ADVISORY_CONFIG_PATH` is `.claude/pdlc.config.json` — the same per-repo config home Phase MERGE and
the distribution gate already use (`orchestrate-dev.js:43`, aliased at TSPEC §3.1).

**Why PROP-CFG-05 counts the reader and not the path.** That path is already read twice more on a
full run, by code this feature does not touch: `readMergeConfigSafely(readFileFn, MERGE_CONFIG_PATH)`
in the Phase I wiring (`orchestrate-dev.js:8040`) and `phaseMerge`'s `_configPath = MERGE_CONFIG_PATH`
default (`:1373`), both resolving to the same `.claude/pdlc.config.json` literal (`:43`). A spy scoped
to the *path* can therefore never read 1 against a correct build — it would fail as a defect on a
build with no defect in it. The count is over the advisory reader, which is the surface the property
is actually about.

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
| PROP-RUNG-09 | **The no-fallback positive control.** Given `advisory.enabled` true and `MODEL_ADVISORY` resolving on the first dispatch, a run in which a seam fires must produce a summary that names `MODEL_ADVISORY` as the model used **and** reports the substitution absent — asserted as the exact rendered value (`fallback: false` and the summary's model cell byte-equal to `MODEL_ADVISORY`), never as the absence of a fallback string — while the fallback-dispatch spy reads zero and the record's `Model` row carries the same value. Driven at the workflow level so the summary is the one the report actually carries. | Observability | Integration | AC-1.1, AC-1.3, M-2, T-01-2 | `advisoryRung.test.js` (A-04 🔴 / A-18 🟢) |

PROP-RUNG-09 is what makes PROP-RUNG-04's fallback assertion falsifiable: without a run that
demonstrably does **not** substitute, a build that reported the fallback unconditionally would pass
PROP-RUNG-04 and be caught by nothing. It is stated as two positive conjuncts (exact model value,
`fallback: false`) rather than as "no fallback text appears", per O-1's rule against absence-only
oracles.

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
| PROP-BUD-03 | `waitMs` must be zero for every seam but A5. Asserted against a surface that exists: the **driver's accumulated `waitMs`**, captured at the argument the driver passes into `budgetExceeded` (spy on `budgetExceeded`, read `arg.waitMs`), must be `0` on every call of an A1, A2, A3 or A4 invocation — including one whose seam performed IO — and must be `> 0` on an A5 invocation that re-polled at least once. The A5 conjunct is the positive control: without it the property passes against a build that never accumulates wait anywhere. | Contract | Unit | NFR-4, TSPEC §4.5 | `advisoryVerdict.test.js` (arithmetic) + `A-22 — driver lifecycle` (the accumulated value) |
| PROP-BUD-04 | Whichever bound is reached first must end the invocation, and the reason must be computed **once at termination** from the terminating condition — never accumulated across attempts. A run whose earlier attempts were malformed and which ends on the attempt bound must report `budget-exhausted`, not `malformed-verdict`. | Functional | Unit | V-5, FSPEC §5.3 opening clause, T-02-4 | `advisoryVerdict.test.js` (arithmetic) + `advisoryDriver.test.js` (the terminating reason) |

**Why PROP-BUD-03 does not assert against `SeamOps`.** TSPEC §4.3's `SeamOps` typedef declares nine
members — `gatherEvidence`, `prompt`, `conditionHolds`, `apply`, `producedPaths`, `revert`,
`verifyGate`, `declaredScope`, `permittedActions` — and **no** `waitMs` member or accessor, while
TSPEC §4.5 (`TSPEC:474`) describes `waitMs` as "the accumulated check-rollup wait the seam reports".
There is therefore nothing on the seam object to assert against. Whether that reporting surface
becomes a tenth `SeamOps` member or stays a driver-side accumulator is the TSPEC author's to settle
and is routed upstream as an erratum; PROP-BUD-03 above is stated at the one surface that exists
either way — the argument the driver hands `budgetExceeded` — so it is implementable today and stays
correct under either resolution.

### 5.3 The invocation lifecycle (`runAdvisorySeam`) — driver surface

| # | Property | Category | Level | Traces | Home (block) |
|---|---|---|---|---|---|
| PROP-LIFE-01 | With `config.enabled === false` the driver must return **before** any dispatch and before `resolveAdvisoryRung`: agent-dispatch and rung-resolution spies must both read zero, and the returned disposition must be the seam's declared pre-advisory no-op. | Integration | Unit | D-1, D-2, AC-1.6, TSPEC §4.4 entry row | `A-22 — driver lifecycle` |
| PROP-LIFE-02 | The lifecycle must execute in TSPEC §4.4's order. The expected call log is a transcribed literal of **exactly eight** elements — `["DIAGNOSE","VALIDATE","GATE","RE-CHECK","ACT","CHECK","VERIFY","RECORD"]` (TSPEC §4.4 steps 1, 2, 3, 3b, 4, 5, 6, 7) — asserted by `toEqual` against the ordered log of a fake `SeamOps`, never by containment. TSPEC §4.4's `entry` row is **not** a member: it is the `config.enabled` early return, it precedes every observable seam call, and PROP-LIFE-01 owns it. With `apply` never called before both gates pass and `verifyGate` never called before `producedPaths` has been re-classified. | Contract | Unit | V-1, BR-2, BR-3, TSPEC §4.4 | `A-22 — driver lifecycle` |
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
| PROP-ENV-13 | **The operator's narrowing lever must be live.** With `advisory.envelope` parsed as the narrowed literal `["E-1"]` — not `ENVELOPE_DEFAULTS` — an otherwise-decidable **E-2** candidate must classify `inside: false` with reason `out-of-envelope`, and the invocation carrying it must satisfy O-1 in full; **and on the same fixture with the same `ctx`, an E-1 candidate must still classify `inside: true`**. | Security | Unit | AC-3.1, AC-1.7, US-03, E-R1, BR-1 | `advisoryEnvelope.test.js` |

**PROP-ENV-13 is the property that makes `advisory.envelope` a control rather than a comment.** Every
other envelope property here is written against the **default** set: PROP-ENV-12 pins
`ENVELOPE_DEFAULTS` against a transcribed literal, PROP-CFG-07 asserts only that `config.envelope` is
not *mutated* at runtime, PROP-LIFE-04 refuses a false `withinEnvelope: true` claim without ever
varying the configuration, and PROP-A5-04/05/06 vary `ctx.permittedActions` by **capability probe**,
explicitly not by config. An implementation that read `ENVELOPE_DEFAULTS` and ignored the parsed
`config.envelope` entirely would satisfy all of them, and the operator's only narrowing lever — the
whole of US-03's "hard, declared boundary" (AC-3.1) — would be silently dead. Both of PROP-ENV-13's
conjuncts are load-bearing: the first falsifies that build, the second stops the property passing
against one that refuses everything.

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
reachable **only** through that seam's declared `verifyGate`. Two conjuncts, both required:

1. **The positive outcome, not the absence of one.** With the gate stubbed to fail, the disposition
   must be `escalated` with reason `post-action-verification-failed` — the exact reason REQ AC-3.6
   row 4 assigns to an in-envelope action whose AC-4.5 gate then failed (`REQ:159`) — satisfying
   **O-1 in full**: the exact outcome value, that one reason byte-equal in the disposition, the
   `ADVISORY-{feature}.md` `Disposition` row and the `ESCALATIONS.md` `Refusal reason` row, and the
   seam's pre-advisory behaviour still having happened. "Never `resolved`" alone is satisfied by a
   thrown error, by `no-action`, or by an unset field, and AC-4.6 says in as many words that a
   negative assertion alone is satisfied by accident.
2. **The gate is genuinely consulted.** Replacing the gate with `async () => ({ passed: true })` must
   make the case fail — so a silently-removed or stubbed gate cannot pass.

Conjunct 1 is the AC-4.6 positive triple on the same path; conjunct 2 is the mutation control. Neither
substitutes for the other: 2 proves the gate is read, 1 proves what happens when it says no.
*Category: Functional · Level: Unit · Traces: AC-4.5, AC-4.6, NFR-2, AC-3.6, BR-6, T-03-6(b), TSPEC §5.5 · Home: all five in
`advisoryDriver.test.js`, generated by iterating one in-file registry, split across blocks
`A-23 — A3/A4 gate exclusivity`, `A-24 — A5 gate exclusivity`, `A-31 — A1/A2 gate exclusivity`
(PLAN §8.2).*

**PROP-GATE-06** — The registry's key set must equal `ADVISORY_SEAMS` by set equality, in one place,
so a sixth seam fails the suite until it has a case and a deleted case means a deleted registry row.
*Category: Contract · Level: Unit · Traces: FSPEC §18.2, PLAN §8.1 · Home: `A-22 — driver lifecycle`.*

The A1 row of PROP-GATE-01…05 is the one place the upstream documents disagree on what is being
asserted — see §13 item 1. Conjunct 1's `post-action-verification-failed` disposition is asserted at
the four seams that can apply an action (A2…A5); at A1, whose `permittedActions` is `[]` and which
therefore never reaches step 4, the row asserts the stronger positive — `resolved` is unreachable on
**every** path, and each A1 path terminates in `escalated` or `no-action` with its own O-1 triple.

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
| PROP-A5-20 | **E-2's decidable rule, all three conjuncts.** A failing check is *introduced* — and therefore an E-2 member — iff the same check **passes at the merge-base commit**, **passes at the default-branch tip**, and **fails at the branch head** (`REQ:130`). All three must be probed by the pipeline through `_git` / `_ghRun`, never taken from the agent's claim, and each must be independently falsifiable: one fixture per dropped conjunct — (i) the check failing at the **merge base** ⇒ `inside: false`, reason `out-of-envelope`, O-1 in full; (ii) the check failing at the **default-branch tip** ⇒ the pre-existing escalation of PROP-A5-03, which is evaluated first; (iii) the check **passing at the branch head** ⇒ `conditionHolds()` false ⇒ `no-action`, nothing applied. Each of the three is paired with the **same positive in-envelope control** — the all-conjuncts-hold fixture that classifies `inside: true` with `permittedActions` containing `E-2` — so no case can pass by refusing everything. | Security | Unit | AC-3.3 (E-2), AC-8.4, A5-1, T-07-2 | `advisoryPubSeam.test.js` (A-11 🔴 / A-24 🟢) |

**Why E-2 gets its own three-conjunct property.** AC-3.3 gives each permitted action a decidable
rule, and three of the four are already proved here: E-3 by PROP-ENV-11 (absent from the merge-base
tree **and** from the default-branch tip), E-4 by PROP-A2-02/03 (the cited symbol still exists), E-1
by O-3's counted oracle (a re-run on a sha byte-equal to the pre-seam head) plus PROP-A5-07's
push-free accounting. Before PROP-A5-20, E-2's rule was asserted nowhere: PROP-A5-03 asserts only the
**ordering** of the default-branch probe, PROP-A5-04 the BL-05-absent path. An implementation that
probed only the default-branch tip and dropped the merge-base conjunct satisfied every property in
this section. That matters most at E-2 because it is the sole envelope member that lets the tier
commit and push to the branch unattended.

## 9. Properties — advisory record, escalation log, summary, harvest

Homes: `advisoryRecord.test.js` (A-08 🔴 / A-21 🟢), `advisoryEscalationLog.test.js`
(A-09 🔴 / A-21 🟢), `advisoryHarvest.test.js` (A-13 🔴 / A-27, A-28 🟢).

### 9.1 The advisory record — `docs/{feature}/ADVISORY-{feature}.md`

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-REC-01 | `renderAdvisoryEntry(disposition, { now })` must be **pure** — it takes the timestamp rather than reading a clock — so the rendered bytes are testable exactly against a transcribed literal. | Contract | Unit | TSPEC §9.1 | `advisoryRecord.test.js` |
| PROP-REC-02 | Every entry must carry **exactly** the seven declared fields — timestamp, seam, diagnosis, confidence, envelope determination, action taken or escalated, evidence citations (REQ AC-9.1's list verbatim) — asserted as **set equality** of the emitted field-name set against the transcribed literal of TSPEC §9.1, so an invented eighth field fails and a deleted one fails, **plus** a separate assertion that the emitted order equals the literal's order. Field-presence alone is satisfied by an entry carrying a ninth invented field, which §13.3(2) makes a contract break. | Contract | Unit | AC-9.1, T-08-1 | `advisoryRecord.test.js` |
| PROP-REC-03 | The record must be **append-only** and in occurrence order: N invocations must produce N entries, newest last, and no earlier entry's bytes may change. | Data Integrity | Unit | R-3, AC-9.1 | `advisoryRecord.test.js` |
| PROP-REC-04 | An entry must be written for **every** terminal disposition, including `no-action` — the record is not escalation-only. | Observability | Unit | R-4, AC-9.1 | `advisoryRecord.test.js` |
| PROP-REC-05 | An advisory **action** taken with no record written must be a defect, asserted directly: with `_appendFile` scripted to throw, `appendAdvisoryEntry` must throw, the driver must revert, and the disposition must satisfy O-1 with reason `record-write-failed`. | Error Handling | Unit | AC-9.2, R-2, T-08-2 | `advisoryRecord.test.js` |
| PROP-REC-06 | A missing feature directory must make the append **throw** (`defaultAppendFile`, `orchestrate-dev.js:6805`, creates nothing implicitly for this path), taking the R-2 refusal path — never a silent `mkdir`. | Error Handling | Unit | TSPEC §9.1, T-08-2 | `advisoryRecord.test.js` |
| PROP-REC-07 | The `Model` row must carry the rung actually used and, on a fallback run, mark it as the substitution — so the fallback is readable off the record as well as off the summary. | Observability | Unit | AC-1.3, M-2, T-08-7 | `advisoryRecord.test.js` |
| PROP-REC-08 | No field body may contain an unescaped newline, which would corrupt the append-only record's line grammar. | Data Integrity | Unit | PLAN P-6 | `advisoryRecord.test.js` |

### 9.2 The escalation log — `docs/_queue/ESCALATIONS.md`

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-ESC-01 | `renderEscalationEntry(disposition, ctx, { now })` must be pure and must emit **exactly** the eight declared fields — the one-sentence decision statement **first**, then feature, seam, refusal reason, diagnosis, proposed action, evidence, pipeline state (phase id **and** that phase's outcome). Asserted as **set equality** of the emitted field-name set against the transcribed literal of TSPEC §10.1 — an added ninth field fails, a deleted one fails — **plus** a separate order assertion, of which the decision sentence's first position is the head. | Contract | Unit | AC-10.1, AC-10.2, L-2, T-09-1 | `advisoryEscalationLog.test.js` |
| PROP-ESC-02 | The log must be append-only and newest-last: two escalations for the same feature **and** seam must produce two entries under their own headings, and the first must be byte-unmodified — never an in-place update. | Data Integrity | Unit | AC-10.4, L-1, T-09-2 | `advisoryEscalationLog.test.js` |
| PROP-ESC-03 | Nothing in this tier may **read** `ESCALATIONS.md`: the append-only guarantee must follow from the absence of a reader, asserted as a source-level property that no advisory path opens the file for reading. | Contract | Unit | L-1, DEC-ADV-09, TSPEC §17.2 | `advisoryEscalationLog.test.js` |
| PROP-ESC-04 | Given neither `ESCALATIONS.md` nor `docs/_queue/` exists, both must be created and the entry written — the recursive `mkdirSync` living inside `defaultAppendFile`'s existing try. | Functional | Unit | AC-10.1, T-09-7 | `advisoryEscalationLog.test.js` |
| PROP-ESC-05 | A **failed** escalation-log write must be asymmetric with a failed record write: the seam must still report `escalated`, the disposition must **not** be `resolved`, nothing must be applied, the pre-advisory halt or skip must still happen, and the failed write must be named on the run report. Asserted positively on all five conjuncts. | Error Handling | Unit | T-09-8, R-2 asymmetry | `advisoryEscalationLog.test.js` |
| PROP-ESC-06 | Escalation must never change control flow: at a halting seam the halt must still happen; at a skipping seam the skip must still happen; both byte-identical to the tier-disabled run. | Integration | Integration | AC-10.3, F-5, L-3, T-09-3, T-09-4 | `advisoryDodSeams.test.js`, `advisoryQueueSeams.test.js` |
| PROP-ESC-07 | `MERGE_ESCALATIONS` (`orchestrate-dev.js:1321`) must be **byte-identical** to its pre-feature value — asserted as a frozen object's own-property snapshot, so widening the merge catalogue instead of adding a sibling fails. | Contract | Unit | AC-10.5, N-1, T-09-5 | `advisoryEscalationLog.test.js` |
| PROP-ESC-08 | The advisory notice must use its own distinct prefix, name the seam and point at its `ESCALATIONS.md` entry; and **one grep for `ESCALATION:` must find both** the merge notice and the advisory notice. Asserted with one merge escalation and one advisory escalation present on the same report. | Observability | Unit | AC-10.5, N-2, N-3, T-09-6 | `advisoryEscalationLog.test.js` |
| PROP-ESC-09 | Advisory notices must ride the **existing** notice channel — the same `notices` array and the same report field the merge phase already uses — so the operator watches one place. | Contract | Unit | AC-10.5, N-4 | `advisoryEscalationLog.test.js` |

### 9.3 The advisory summary on the final report

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-SUM-01 | `advisorySummaryRows(dispositions)` must be pure and must always emit **five** rows — one per `ADVISORY_SEAMS` member, zero counts included — driven off the exported constant. | Observability | Unit | AC-9.4, S-1, T-08-6 | `advisoryRecord.test.js` |
| PROP-SUM-02 | `invocations === resolved + escalated + noAction` must hold on **every** row and on the total row; the literal six-row table of T-08-10 (A1 0/0/0/0, A2 0/0/0/0, A3 1/0/0/1, A4 1/1/0/0, A5 1/0/1/0, total 3/1/1/1) must match by value. | Data Integrity | Unit | AC-9.4, V-7, S-1, T-08-10 | `advisoryRecord.test.js` |
| PROP-SUM-03 | The summary must name the **advisory model actually used** and whether it was the configured rung or the declared fallback. | Observability | Unit | AC-9.4, S-2, T-08-7 | `advisoryRecord.test.js` |
| PROP-SUM-04 | The summary must appear on **every** report, including a halted run's: a run halting at A3 or A4 must carry the summary for the seams reached so far, and the record must still be on disk un-distilled. | Observability | Integration | AC-9.4, S-1, H-4, T-08-9 | `advisoryHarvest.test.js` |
| PROP-SUM-05 | `noChecks` and `completionCap` must be threaded from `raisePrAndVerifyCi` and **named** on the summary, so a repo with no CI and a repo whose checks never completed are distinguishable. | Observability | Integration | AC-8.6, S-3, A5-6, A5-9 | `advisoryPubSeam.test.js` |
| PROP-SUM-06 | With the tier disabled, `buildFinalReport` (`orchestrate-dev.js:8595`) must receive `advisory: null` and the report must carry **no** advisory section at all. The `null` must be **derived from the advisory `_state` never having been armed**, not from a fourth read of `advisory.enabled` at the report site (PROP-DIS-06) — asserted positively: with the tier enabled and no seam firing, the same code path must produce the five zero rows of PROP-DIS-05 without any additional `enabled` read. | Observability | Unit | S-4, NFR-3, AC-1.6, TSPEC §11.1 | `advisoryDisabled.test.js` |

### 9.4 Harvest of the record, and the delete guard

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-HARV-01 | The distil-and-delete step must run **after Phase PUB and before Phase MERGE** — not at Phase H, because at Phase H seam A5 has not run yet. Phase H itself must be untouched. Asserted on the step's position in the phase sequence and on the A5 entry being included in what was distilled. | Integration | Integration | AC-9.3, H-1, T-08-5 | `advisoryHarvest.test.js` |
| PROP-HARV-02 | On a completed dev-side run in which seams fired, `ADVISORY-{feature}.md` must be **absent** at end of run, its content must be present in `LEARNINGS-{feature}.md`, both must be committed and pushed on the feature branch, and the PR must show the commit. | Data Integrity | Integration | AC-9.3, H-2, T-08-3 | `advisoryHarvest.test.js` |
| PROP-HARV-03 | The delete must go through the **guard-covered channel** (`git rm`, matched by the guard's `\bgit\s+rm\b` alternative), never around it. | Security | Unit | H-3, AC-9.3 | `advisoryHarvest.test.js` |
| PROP-HARV-04 | Reaching the distil step with **no** `LEARNINGS-{feature}.md` must produce a refusal that **names the artifact class it refused**, must leave `ADVISORY-{feature}.md` on disk with its entries intact, and must name the refusal on the run report. | Security | Integration | AC-9.3, H-3, T-08-4 | `advisoryHarvest.test.js` |
| PROP-HARV-05 | A **direct** delete of `ADVISORY-{feature}.md` with no sibling `LEARNINGS-{feature}.md` must be refused by the hook itself, the refusal must name the artifact class, and the file must still exist — unit-scoped over the guard, distinct from and not subsumed by PROP-HARV-04's production-path assertion. | Security | Unit | AC-9.3, T-08-4b | `advisoryHarvest.test.js` |
| PROP-HARV-06 | The guard-message coupling must not break: after the hook's message is extended, `orchestrate-dev.js:8342`'s literal test and `:8348`'s extraction regex must **both still fire** on a `CROSS-REVIEW` refusal. The message must be extended with a trailing `[class: …]` token while the `CROSS-REVIEW` prefix and the bracketed directory keep their exact bytes. This is the feature's highest-consequence regression — a silent break makes Phase H proceed as if a refused delete had succeeded. | Contract | Unit | AC-9.3, TSPEC §9.3, PLAN §5.4(3) | `advisoryHarvest.test.js` |
| PROP-HARV-07 | Queue-side records must persist by design: no queue-side path distils or deletes them, a `hold`/`escalate` adjudication must leave the record committed on the queue's branch and **not pushed**, a second process reading that branch head must find it, no `LEARNINGS` must be required, and no distil must have run. | Data Integrity | Integration | AC-9.1, H-2b, T-08-8 | `advisoryHarvest.test.js` |
| PROP-HARV-08 | A run that halts before the distil step must leave the record on disk, complete up to the halt. | Data Integrity | Integration | H-4, T-08-9 | `advisoryHarvest.test.js` |
| PROP-HARV-09 | `docs/_queue/ESCALATIONS.md` must **not** be harvested or deleted — it is the feature's durable output, retained for `pdlc-engineering-loop`. Asserted as the negative complement of PROP-HARV-02 on the same run. | Data Integrity | Integration | AC-10.4, PLAN §6.3 | `advisoryHarvest.test.js` |

## 10. Properties — disabled-tier equivalence and regression

Homes: `advisoryDisabled.test.js` (A-16 🔴 / A-33 🟢) and `advisoryBundle.test.js`
(A-14 🔴 / A-32 🟢), plus the pre-existing suites that must pass unmodified.

### 10.1 Disabled-tier equivalence — inertness stated on named artifacts

NFR-3 deliberately states equivalence as an equality on **named artifacts**, not on report text
(which varies by timestamp and iteration count). Every property here pairs its zero-count conjunct
with a positive one, per O-3's disabled-tier rule.

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-DIS-01 | With `advisory.enabled` false and a seam condition present at **each** of A1…A5 in turn, every seam must produce its pre-advisory outcome (skip at A1/A2, halt at A3/A4/A5) and **no** advisory agent must be dispatched. Asserted per seam, driving the real phase/queue body (O-4). | Integration | Integration | AC-1.6, NFR-3, D-1, T-10-1 | `advisoryDisabled.test.js` |
| PROP-DIS-02 | With the tier disabled and an advisory rung that does not resolve, the run must be unaffected and **no model resolution** must be attempted — so a missing Fable alias cannot break a run with the tier off. | Integration | Integration | AC-1.6, D-2, T-10-2 | `advisoryDisabled.test.js` |
| PROP-DIS-03 | With the tier disabled, no `ADVISORY-*` file must exist, `ESCALATIONS.md` must have gained no entry, the report must carry no advisory summary, and the set of files the run created must equal — element for element — the transcribed literal of `created-files-26c3f1c.json`, with its `scenario` header re-asserted first (PROP-INFRA-03). **The red direction is named:** any file created outside that literal set fails, whether or not this feature named it. | Data Integrity | Integration | NFR-3, D-6, T-10-3 | `advisoryDisabled.test.js` |
| PROP-DIS-04 | An absent `advisory` section and a malformed config file must each behave exactly as PROP-DIS-03 — including no substitution notice when the malformed key is `enabled` itself. This is T-10-4's single home. | Error Handling | Integration | C-1, C-2, T-10-4 | `advisoryDisabled.test.js` |
| PROP-DIS-05 | With the tier **enabled** and no seam condition arising, the report must carry an advisory summary with **five zero rows** — distinguishing an enabled-but-quiet run from a disabled one. | Observability | Integration | S-1, D-5, T-10-5, T-01-7 | `advisoryDisabled.test.js` |
| PROP-DIS-06 | A source-text scan for a read of `advisory.enabled` must find **exactly three** sites, over a **named file set**: `pdlc/workflows/orchestrate-dev.js` and `pdlc/workflows/orchestrate-queue.js` only — never `pdlc/workflows/dist/*.bundle.js`, which inlines both modules and would double every hit. The three are: (1) the driver's early return, (2) the config-notice emit gate, (3) the distil-step guard. A fourth read is a defect. The report field of PROP-SUM-06 is **not** a fourth read and must not become one: the disabled/enabled-but-quiet distinction is made from the advisory `_state`, which is `null` when the driver never armed and a five-row zero summary when it armed and no seam fired — so `buildFinalReport` decides from `_state`, never by re-reading `enabled`. | Contract | Unit | D-1, TSPEC §11.1, DEC-ADV-05 | `advisoryDisabled.test.js` |
| PROP-DIS-07 | Other advisory keys set while disabled must be inert: the master switch must be tested **first**, before any other key is read. | Functional | Unit | TSPEC §11.3 | `advisoryDisabled.test.js` |

### 10.2 Regression — what must still be true of the pipeline that existed before

| # | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-REG-01 | The Phase DOD rebase-conflict halt and DoD-not-passed halt must still fire with **byte-identical messages** on every non-resolved outcome, and the advisory call must sit immediately **before** each pre-existing `throw haltError(...)` rather than replacing it. | Integration | Integration | AC-10.3, PLAN §5.4(1) | `advisoryDodSeams.test.js` |
| PROP-REG-02 | Phase PUB's `passed`, no-checks and completion-cap paths must be unchanged, and every pre-existing `raisePrAndVerifyCi` test must pass **without modification**. | Integration | Integration | AC-10.3 | `advisoryPubSeam.test.js` |
| PROP-REG-03 | The queue's blocked-pre-check skip (`orchestrate-queue.js:890-897`) and its `blocked`-verdict skip must be unchanged, and a `needs-human` candidate with the tier off must be skipped exactly as today. | Integration | Integration | AC-10.3, T-04-1 | `advisoryQueueSeams.test.js` |
| PROP-REG-04 | The dev export list must carry the advisory names **and** `commitPaths`, the queue prelude must bind each, and both shipped bundle artifacts must still satisfy the runtime's structural constraints — `export const meta` first, no other `export`, no `import` — with the artifact count still **three** and no manifest row added. | Contract | Unit | TSPEC §2.3, §13.6 | `advisoryBundle.test.js` |
| PROP-REG-05 | Adding `commitPaths` to the export list must not change `gitWithLockRetry`'s privacy: it stays module-private and is reached through the shared module scope inside the bundle. | Contract | Unit | TSPEC §6.4.1 | `advisoryBundle.test.js` |
| PROP-REG-06 | The pre-flight baseline must hold at HEAD: every `BL-PREREQ` symbol of PLAN §2.2 must exist — exported symbols by import, `commitPaths` / `buildFinalReport` / `gitWithLockRetry` by source-text presence, guard-script tokens by reading the hook. Existence only; never the shape a later task creates. | Contract | Unit | PLAN §2.2, A-01 | `advisoryPreflight.test.js` |
| PROP-REG-07 | `bash -n` must pass over `guard-harvest-before-delete.sh` and its index mode must remain `100755` after the guard edit — the shipped CI job asserts both, and the hook must stay executable by bare path. | Contract | Unit | PLAN §9.1 | CI `Shell scripts parse` job + `advisoryHarvest.test.js` |

### 10.3 One property about the suite itself

**PROP-REG-08** — No `describe.skip` block may remain in any `advisory*.test.js` file at the end of
implementation. The oracle is **one** check, not two: a shipped source-text case that reads every
`pdlc/workflows/__tests__/advisory*.test.js` **including its own file** and asserts no match for
`/\b(describe|it|test)\s*\.\s*skip\b/`, `/\bx(describe|it|test)\b/`, or a binding assigned from any of
those. A bare grep for the literal `describe.skip` does not suffice — the scan catches an alias by
shape, which is the evasion that actually happens. Falsification is proved in-file: the same matcher
run against a fixture string containing each of the three shapes must report all three, and against a
clean fixture must report none, so a scan that has stopped matching cannot pass vacuously.
*Category: Contract · Level: Unit · Traces: PLAN §5.2 batch 18, §9.1 · Home: `advisoryDisabled.test.js`
(A-16 🔴 / A-33 🟢).* A case left skipped is a case that never ran, and this feature's whole red
discipline depends on that not happening silently.

**Why there is no second, behavioural clause.** The obvious companion — "every block of every
advisory path reports `pending === 0`" — cannot be asserted from inside a test file.
`docs/_decisions/DECISIONS-test-oracle-mechanics.md` **DEC-ORACLE-01** settles exactly this case: jest
gives every test *file* its own module registry and may fork workers, so a whole-run observation made
from inside one file "can only ever hold that file's own contributions … trivially true forever —
vacuous by construction, not by oversight", and it names the `pdlc-workflow-distribution` skip
comparator as the precedent that shipped that way. A run-wide pending count belongs in a
`globalTeardown` or a custom reporter, and per the same decision that transport would itself need
falsifying — a cost this feature does not buy, because the source scan above catches the same defect
earlier and deterministically. The zero-skips-remaining obligation is additionally enforced outside
the suite by PLAN §9.1's own check, which is where a run-wide claim can legitimately live.

## 11. Generator-driven properties (P-1 … P-9)

PLAN §6.5 names nine properties over the feature's parameterisable leaves and binds each to a 🔴/🟢
task pair. They are restated here in the form the implementer tests, with the generator each draws
from. All nine reuse `__tests__/helpers/driftGenerators.js` through `advisoryDoubles.js`'
`makeAdvisoryGenerators(seed)`; none declares its own PRNG (PROP-INFRA-01, PROP-INFRA-02).

| # | Leaf | Statement (as tested) | Generator | Owner (🔴 / 🟢) | Home |
|---|---|---|---|---|---|
| P-1 | `parseAdvisoryConfig` | **Total** over arbitrary JSON values (never throws); every returned key is a member of `ADVISORY_DEFAULTS`' key set; **per-key independence** — corrupting key *k* leaves every key ≠ *k* equal to the value parsed from the uncorrupted input, and puts exactly *k* into `invalidKeys`. | `configObject` | A-03 / A-17 | `advisoryConfig.test.js` |
| P-2 | `parseAdvisoryVerdict` | **Total** over arbitrary strings; the five malformedness rules **partition** the input space — every generated input matches exactly one rule or parses cleanly, never two, never none. | `verdictText` | A-05 / A-19 | `advisoryVerdict.test.js` |
| P-3 | `budgetExceeded` | **Monotone in elapsed time** (true at *t* ⇒ true at every *t′ > t*, same budget) and **invariant under the A5 rollup carve-out** (adding `waitMs` never flips `false` → `true`). | bounded numeric draws | A-05 / A-19 | `advisoryVerdict.test.js` |
| P-4 | `classifyEnvelope` | Three conjuncts over the real signature `classifyEnvelope(candidate, ctx) ⇒ {inside, reason, matched}`: **determinism and purity** (two calls deep-equal; neither argument mutated — a real falsifier for a classifier that memoises into `ctx`); **closure** — `reason ∈ {"prohibited-action","revert-on-test-touch","out-of-envelope"} ∪ {null}`, the three-member enum TSPEC declares for this function's return, **not** the full eight-member `ADVISORY_REFUSAL_REASONS` (§13 item 3); **coherence** (`inside === (reason === null)`). No claim is made about `matched`'s contents — the upstream documents declare its type and nothing more. | `envelopeCtx` | A-06 / A-20 | `advisoryEnvelope.test.js` |
| P-5 | `refusalReasonFor` | **Total**; **first-match stable** — permuting the non-matching signals never changes the returned reason, so the ordering claim is about `ADVISORY_EXCLUSIONS`' / the catalogue's own order and nothing else. | signal sets | A-06 / A-20 | `advisoryEnvelope.test.js` |
| P-6 | `renderAdvisoryEntry` | **Total** over the generated verdict × disposition space; always emits exactly the seven fields in the declared order; **no field body contains an unescaped newline** (which would corrupt the record's line grammar). | `entryFields` | A-08 / A-21 | `advisoryRecord.test.js` |
| P-7 | `renderEscalationEntry` | **Total** over reason × seam × disposition; always emits **exactly** the eight declared fields (set equality, so an invented ninth fails on some draw) in the declared order, the decision sentence always first; **append-safe** — rendering N entries and concatenating equals appending them one at a time, so newest-last is a property of the renderer, not of the caller. | `entryFields` | A-09 / A-21 | `advisoryEscalationLog.test.js` |
| P-8 | `parseA3Classification` | **Total** over arbitrary agent text; the returned class is always a member of the declared closed set; unparseable text yields the fail-closed class, never `undefined`. | `classText` | A-10 / A-23 | `advisoryDodSeams.test.js` |
| P-9 | `governingClass` | A **total order** over the generated class set — antisymmetric and transitive, ordering `real-defect > mis-scoped-criterion > deferral-candidate` — so "highest class wins" is well-defined for every **non-empty** multiset, ties included. The empty input is deliberately out of the property (§13 item 2). | `classText` | A-10 / A-23 | `advisoryDodSeams.test.js` |

**Hypothesis-style hygiene, applied to the seeded generator.** Three of these draw numbers or
compute magnitudes and must be bounded so the property tests behaviour rather than overflow:

- **P-3** bounds `elapsedMs`, `waitMs` and `seamBudgetMinutes` to finite, non-negative ranges and
  rejects any draw where `seamBudgetMinutes * 60_000` is not finite; boundary-adjacent draws are
  constructed by a **relative** offset from the bound (`bound * (1 ± ε)`), never by an absolute
  delta, so the property cannot accidentally land inside a tolerance band.
- **P-1** bounds generated JSON depth and key count, so a pathological draw does not turn a totality
  property into a timeout.
- **P-6 / P-7** bound generated field lengths, and generate newline-bearing bodies deliberately (the
  falsifying class) rather than by chance.

**Properties are additional to, never a replacement for, the named example cases.** A property that
subsumed an FSPEC case would hide which case failed — the 81 cases stay, each in the file PLAN §8.1
assigns it.

## 12. Coverage matrix

**Four** directions are audited: every REQ acceptance criterion and NFR has ≥1 property (§12.1);
every PLAN §3 task has ≥1 property it must satisfy (§12.2); every named test file exists or is
explicitly planned as new (§12.3); and every FSPEC §18.1 acceptance case is cited by ≥1 property
(§12.4). The fourth direction is the one that catches a case with a home in PLAN §8.1 but no property
stating what its oracle asserts — a gap the other three are structurally unable to see.

### 12.1 REQ acceptance criteria and NFRs → properties

| REQ | Properties |
|---|---|
| AC-1.1 | PROP-RUNG-01, PROP-RUNG-09 |
| AC-1.2 | PROP-RUNG-02, PROP-RUNG-03, PROP-RUNG-05 |
| AC-1.3 | PROP-RUNG-04, PROP-RUNG-09, PROP-REC-07, PROP-SUM-03 |
| AC-1.4 | PROP-RUNG-06 |
| AC-1.5 | PROP-RUNG-01, PROP-A1-07 |
| AC-1.6 | PROP-LIFE-01, PROP-DIS-01, PROP-DIS-02, PROP-SUM-06 |
| AC-1.7 | PROP-CFG-01 … PROP-CFG-05, PROP-BUD-01, PROP-ENV-13 (the operator's `envelope` knob is exercised, not only defaulted) |
| AC-2.1 | PROP-VER-02, PROP-VER-04, PROP-VER-05 |
| AC-2.2 | PROP-LIFE-03, PROP-LIFE-04 |
| AC-2.3 | PROP-VER-01, PROP-VER-03, PROP-LIFE-09 |
| AC-2.4 | PROP-BUD-01, PROP-BUD-04, PROP-LIFE-09, PROP-LIFE-10 |
| AC-3.1 | PROP-CFG-06, PROP-CFG-07, PROP-ENV-02, PROP-ENV-13 |
| AC-3.2 | PROP-ENV-03, PROP-ENV-05, PROP-ENV-06 |
| AC-3.3 | PROP-ENV-11 (E-3), PROP-ENV-12, PROP-A2-02 (E-4), PROP-A4-01, PROP-A5-03, PROP-A5-05, PROP-A5-07 (E-1), PROP-A5-20 (E-2) |
| AC-3.4 | PROP-XA-01 … PROP-XA-08 (a), PROP-ENV-09 (b), PROP-ENV-10 (c), PROP-ENV-07 (d), PROP-ENV-08 (e), PROP-A2-05, PROP-A4-08 |
| AC-3.5 | PROP-XA-01 … PROP-XA-08, PROP-A4-05, PROP-A5-18 |
| AC-3.6 | PROP-REF-01 … PROP-REF-05, PROP-LIFE-12, and O-1 wherever referenced |
| AC-4.1 | PROP-PROH-01, PROP-A3-09, PROP-ENV-09 |
| AC-4.2 | PROP-PROH-02 |
| AC-4.3 | PROP-PROH-03, PROP-A5-10 |
| AC-4.4 | PROP-PROH-04 |
| AC-4.5 | PROP-GATE-01 … PROP-GATE-06, PROP-A2-08, PROP-A3-05, PROP-A4-02, PROP-A5-10 |
| AC-4.6 | PROP-PROH-01 … PROP-PROH-04 and PROP-GATE-01 … PROP-GATE-05 (each asserts the negative **and** the AC-3.6 positive triple on one path — AC-4.6 quantifies over AC-4.1 through AC-4.5, so AC-4.5's gate properties are members of this row) |
| AC-5.1 | PROP-A1-01 … PROP-A1-05 |
| AC-5.2 | PROP-A2-01 |
| AC-5.3 | PROP-A2-02, PROP-A2-03, PROP-A2-04 |
| AC-5.4 | PROP-A1-06, PROP-A2-08 |
| AC-5.5 | PROP-A12-01 … PROP-A12-05 |
| AC-6.1 | PROP-A3-01, PROP-A3-02, PROP-A3-03 |
| AC-6.2 | PROP-A3-07, PROP-A3-08 |
| AC-6.3 | PROP-A3-05, PROP-A3-06 |
| AC-6.4 | PROP-A3-09 |
| AC-7.1 | PROP-A4-01 |
| AC-7.2 | PROP-A4-02 |
| AC-7.3 | PROP-A4-03, PROP-A4-04 |
| AC-7.4 | PROP-A4-06, PROP-A4-09 |
| AC-8.1 | PROP-A5-01 |
| AC-8.2 | PROP-A5-07, PROP-A5-08 |
| AC-8.3 | PROP-A5-13 |
| AC-8.4 | PROP-A5-03, PROP-A5-04 |
| AC-8.5 | PROP-A5-02 |
| AC-8.6 | PROP-A5-14, PROP-SUM-05 |
| AC-9.1 | PROP-REC-02, PROP-REC-03, PROP-REC-04, PROP-A2-12 |
| AC-9.2 | PROP-REC-05, PROP-REC-06, PROP-LIFE-07 |
| AC-9.3 | PROP-HARV-01 … PROP-HARV-06 |
| AC-9.4 | PROP-SUM-01 … PROP-SUM-05 |
| AC-10.1 | PROP-ESC-01, PROP-ESC-04 |
| AC-10.2 | PROP-ESC-01 (decision sentence first) |
| AC-10.3 | PROP-ESC-06, PROP-REG-01, PROP-REG-02, PROP-REG-03 |
| AC-10.4 | PROP-ESC-02, PROP-HARV-09 |
| AC-10.5 | PROP-ESC-07, PROP-ESC-08, PROP-ESC-09 |
| NFR-1 | PROP-ENV-01, PROP-ENV-02, PROP-ENV-13, PROP-CFG-06 |
| NFR-2 | PROP-PROH-01 … PROP-PROH-04, PROP-GATE-01 … PROP-GATE-05 |
| NFR-3 | PROP-DIS-01 … PROP-DIS-07, PROP-SUM-06 |
| NFR-4 | PROP-BUD-01, PROP-BUD-02, PROP-BUD-03, PROP-LIFE-10, PROP-A5-09 |
| NFR-5 | PROP-PROH-04, PROP-PROH-05, PROP-A5-04, PROP-A5-05 |

**No unexplained gap.** Every AC and NFR of REQ §3–§4 appears above with at least one property, and
every property above traces to at least one AC/NFR or to a named FSPEC rule (the O-* oracles and the
PROP-INFRA-*/PROP-REG-* rows trace to PLAN and TSPEC obligations, and say so in their own rows).

### 12.2 PLAN §3 tasks → properties

All 36 tasks of PLAN §3's table are listed; none is without a property obligation.

| Task | Properties it must satisfy |
|---|---|
| A-01 | PROP-REG-06 (baseline symbols), PROP-INFRA-01 (the doubles-hygiene source scan, homed here so it runs from the first batch; plus the `implementation.testCommand` pin, which is a PLAN §2.4 operator concern, not a property here) |
| A-02 | PROP-INFRA-02 (the generator seeding discipline); the doubles module it ships is what PROP-INFRA-01 asserts every advisory file resolves to |
| A-03 🔴 | PROP-CFG-01 … PROP-CFG-07, P-1 |
| A-04 🔴 | PROP-RUNG-01 … PROP-RUNG-09 |
| A-05 🔴 | PROP-VER-01 … PROP-VER-05, PROP-BUD-01 … PROP-BUD-04, P-2, P-3 |
| A-06 🔴 | PROP-ENV-01 … PROP-ENV-13, PROP-XA-01 … PROP-XA-08, PROP-REF-01 … PROP-REF-05, PROP-PROH-05, PROP-INFRA-04, P-4, P-5 |
| A-07 🔴 | PROP-LIFE-01 … PROP-LIFE-13, PROP-PROH-01 … PROP-PROH-04, PROP-GATE-01 … PROP-GATE-06 (authored across the four blocks) |
| A-08 🔴 | PROP-REC-01 … PROP-REC-08, PROP-SUM-01 … PROP-SUM-03, P-6 |
| A-09 🔴 | PROP-ESC-01 … PROP-ESC-09, P-7 |
| A-10 🔴 | PROP-A3-01 … PROP-A3-11, PROP-A4-01 … PROP-A4-11, PROP-ENV-05/06 (tree half), P-8, P-9 |
| A-11 🔴 | PROP-A5-01 … PROP-A5-20, PROP-PROH-03 (behavioural half) |
| A-12 🔴 | PROP-A12-01 … PROP-A12-06, PROP-A1-01 … PROP-A1-07, PROP-A2-01 … PROP-A2-13 |
| A-13 🔴 | PROP-HARV-01 … PROP-HARV-09, PROP-SUM-04 |
| A-14 🔴 | PROP-REG-04, PROP-REG-05 |
| A-15 | PROP-INFRA-03 (the authored fixture and its `scenario` header) |
| A-16 🔴 | PROP-DIS-01 … PROP-DIS-07, PROP-REG-08 |
| A-17 🟢 | PROP-CFG-01 … PROP-CFG-07, P-1, and `commitPaths`' one `export` (PROP-REG-04/05 depend on it) |
| A-18 🟢 | PROP-RUNG-01 … PROP-RUNG-09 |
| A-19 🟢 | PROP-VER-01 … PROP-VER-05, PROP-BUD-01 … PROP-BUD-04, P-2, P-3 |
| A-20 🟢 | PROP-ENV-01 … PROP-ENV-13, PROP-XA-01 … PROP-XA-08, PROP-REF-01 … PROP-REF-05, P-4, P-5 |
| A-21 🟢 | PROP-REC-01 … PROP-REC-08, PROP-ESC-01 … PROP-ESC-09, PROP-SUM-01 … PROP-SUM-03, P-6, P-7 |
| A-22 🟢 | PROP-LIFE-01 … PROP-LIFE-13, PROP-PROH-01 … PROP-PROH-04, PROP-GATE-06 |
| A-23 🟢 | PROP-A3-01 … PROP-A3-11, PROP-A4-01 … PROP-A4-11, PROP-GATE (A3, A4 rows), P-8, P-9 |
| A-24 🟢 | PROP-A5-01 … PROP-A5-12, PROP-A5-16 … PROP-A5-18, PROP-A5-20, PROP-GATE (A5 row) |
| A-25 🟢 | PROP-A3-05, PROP-A3-07, PROP-A4-03, PROP-A4-09 (integration half), PROP-REG-01, PROP-ESC-06 |
| A-26 🟢 | PROP-A5-13, PROP-A5-14, PROP-A5-15, PROP-A5-19, PROP-SUM-05, PROP-REG-02 |
| A-27 🟢 | PROP-HARV-01 … PROP-HARV-04, PROP-HARV-07 … PROP-HARV-09, PROP-SUM-04, PROP-SUM-06 |
| A-28 🟢 | PROP-HARV-03, PROP-HARV-05, PROP-HARV-06, PROP-REG-07 |
| A-29 🟢 | PROP-A12-01 … PROP-A12-05 |
| A-30 🟢 | PROP-A12-06, PROP-A1-01 … PROP-A1-07, PROP-REG-03 |
| A-31 🟢 | PROP-A2-01 … PROP-A2-13, PROP-GATE (A1, A2 rows) |
| A-32 🟢 | PROP-REG-04, PROP-REG-05 |
| A-33 🟢 | PROP-DIS-01 … PROP-DIS-07, PROP-REG-08 |
| A-34 | No suite property — its output is a recorded runtime fact in one of two admissible forms; an inferred result is mock data (PLAN §9.4). The only assertion this document makes about it is §13 item 4. |
| A-35 | No suite property — documentation. The two `RELEASE-CHECKLIST.md` commitments it adds correspond to PROP-INFRA-03 (fixture scenario still accurate) and PROP-HARV-06 (guard-message coupling). |
| A-36 | No suite property — the version bump is asserted by the shipped `advertisedVersionViolation` oracle (`pdlc/workflows/lib/document-oracles.mjs`), not by this feature's suite. |

Three tasks (A-34, A-35, A-36) carry no property by design, and each row says why rather than
leaving the reader to infer it.

### 12.3 Test files — every one exists or is explicitly new

Verified against the working tree while authoring: `pdlc/workflows/__tests__/` contains **no**
`advisory*` file today, so all fourteen below are **new**, created by the 🔴 task named in PLAN §4's
manifest. The two shipped helper modules the new files compose with — `helpers/mergeDoubles.js`,
`helpers/driftGenerators.js` — and `fixtures/tmpGitFixture.js`, `helpers/seams.js`,
`helpers/guardFixtures.js` all **exist today** and are reused, not re-authored.

| Test file (all new) | Creating task | Level mix | Property families |
|---|---|---|---|
| `advisoryPreflight.test.js` | A-01 | Unit | PROP-REG-06, PROP-INFRA-01 |
| `helpers/advisoryDoubles.js` (helper, not collected) | A-02 | — | PROP-INFRA-01, -02 |
| `advisoryConfig.test.js` | A-03 | Unit + 1 Integration | PROP-CFG-*, P-1 |
| `advisoryRung.test.js` | A-04 | Unit + Integration | PROP-RUNG-* |
| `advisoryVerdict.test.js` | A-05 | Unit | PROP-VER-*, PROP-BUD-*, P-2, P-3 |
| `advisoryEnvelope.test.js` | A-06 | Unit | PROP-ENV-*, PROP-XA-*, PROP-REF-*, P-4, P-5 |
| `advisoryDriver.test.js` | A-07 | Unit | PROP-LIFE-*, PROP-PROH-*, PROP-GATE-* |
| `advisoryRecord.test.js` | A-08 | Unit | PROP-REC-*, PROP-SUM-01…03, P-6 |
| `advisoryEscalationLog.test.js` | A-09 | Unit | PROP-ESC-*, P-7 |
| `advisoryDodSeams.test.js` | A-10 | Unit + Integration (real tree) | PROP-A3-*, PROP-A4-*, P-8, P-9 |
| `advisoryPubSeam.test.js` | A-11 | Unit + Integration (real tree) | PROP-A5-* |
| `advisoryQueueSeams.test.js` | A-12 | Unit + Integration | PROP-A12-*, PROP-A1-*, PROP-A2-* |
| `advisoryHarvest.test.js` | A-13 | Unit + Integration | PROP-HARV-*, PROP-SUM-04 |
| `advisoryBundle.test.js` | A-14 | Unit | PROP-REG-04, -05 |
| `fixtures/created-files-26c3f1c.json` (fixture) | A-15 | — | PROP-INFRA-03 |
| `advisoryDisabled.test.js` | A-16 | Unit + Integration | PROP-DIS-*, PROP-SUM-06, PROP-REG-08 |

**Level totals.** 195 distinct properties: **148 Unit, 40 Integration, 7 asserted at both levels, 0
E2E** — the count restated from §1's budget table, computed over the property tables and the twelve
prose-stated ids, not estimated. It satisfies §1's budget shape (Unit ≥ 70%, Integration ≤ 30%,
E2E = 0), and the 47 properties needing an Integration harness are concentrated exactly where O-2 and
O-4 require a real tree or a real phase body: `advisoryDodSeams.test.js`, `advisoryPubSeam.test.js`,
`advisoryQueueSeams.test.js`, `advisoryHarvest.test.js` and `advisoryDisabled.test.js`.

### 12.4 FSPEC acceptance cases → properties

FSPEC §18.1 declares **81** acceptance cases, `T-01-1` … `T-10-5`. The audit is a set comparison, run
mechanically over this document: every one of the 81 ids must appear in at least one property's
`Traces` cell or in a property's prose. **All 81 are cited.** The audit is stated as set equality in
both directions — an FSPEC case cited by no property is a coverage gap, and a `T-nn-n` cited here
that FSPEC §18.1 does not declare is an invented case.

This direction exists because the other three cannot see this class of gap. §12.1 audits REQ→property
and would pass with a whole FSPEC case family uncovered, since the AC above it has other properties.
§12.2 audits PLAN task→property and would pass because PLAN §8.1 homes every case in a file whether or
not a property states its oracle. §12.3 audits only file existence. Delegating case coverage to PLAN
§8.1 is **not** sufficient: PLAN §8.1 says which file a case lives in, never what its oracle asserts.

One case was uncovered at v1 and is closed here:

| Case | FSPEC text | Home (PLAN §8.1) | Property |
|---|---|---|---|
| T-01-2 | "`advisory.enabled` true and the advisory rung resolvable · when a seam fires · then the run's advisory summary names the advisory rung and **reports no fallback**" (`FSPEC:195`) | `advisoryRung.test.js`, A-04 🔴 / A-18 🟢 | **PROP-RUNG-09** (§4.2) |

T-01-2 is not cosmetic: it is the positive control that makes PROP-RUNG-04's fallback assertion
falsifiable. Without a run that demonstrably does not substitute the rung, a build reporting the
fallback unconditionally passes PROP-RUNG-04 and nothing catches it. PROP-RUNG-09 is homed in the file
PLAN §8.1 assigns the case, and is levelled Integration because the summary it asserts is the one the
report actually carries.

## 13. Gaps, negative space, and errata

### 13.1 Upstream defects — routed, not absorbed

Three defects found while deriving these properties belong to upstream documents. They are named
here and emitted as `ERRATUM:` lines to their owning author; this document does not edit those
documents and does not treat the defects as its own.

1. **A1's `verifyGate` — PLAN §8.2 contradicts TSPEC.** PLAN §8.2 (and its §3 A-31 row) says "A1
   declares **no** gate, so its case asserts `verifyGate == null`". TSPEC §5.5 and §6.3 both declare
   A1's `verifyGate` as `async () => ({ passed: true })` — which is exactly the stub PLAN's own
   T-03-6(b) says must make the gate-exclusivity case **fail**. As written, A1's shipped `SeamOps`
   fails PLAN's own case. The substantive rule is agreed and is what PROP-GATE-01…05 assert: A1 has
   **no post-action gate**, its `permittedActions` is `[]`, and `resolved` is unreachable at A1 at
   all. Which of the two representations ships — a null member, or a trivially-passing stub that is
   unreachable — is the PLAN author's to settle; PROP-GATE's A1 row asserts the unreachability, which
   holds either way, and defers the representation.
2. **`governingClass([])` — resolved upstream, recorded here.** TSPEC §7.2 now states that the empty
   input is unreachable by construction (A3-1 rejects as malformed any classification whose classified
   count is below the finding count) and deliberately names no return value. P-9 and PROP-A3-04 are
   scoped to non-empty multisets accordingly. **No erratum** — this is a closed item, listed so a
   reviewer does not re-raise it.
3. **P-4's closure conjunct is weaker than the declared return type.** PLAN §6.5 states P-4's closure
   as `result.reason ∈ ADVISORY_REFUSAL_REASONS ∪ {null}` — eight reasons. TSPEC §5.1's JSDoc declares
   `classifyEnvelope`'s return as `reason ∈ {"prohibited-action","revert-on-test-touch","out-of-envelope"} | null`
   — three. An implementation returning `low-confidence` or `budget-exhausted` from the classifier
   would satisfy PLAN's P-4 while violating TSPEC's contract, so the property as stated cannot
   falsify a real defect class. §11 states the stronger, three-member form.

### 13.2 Deliberate negative space — what has no property, and why

| Area | Why no property |
|---|---|
| The `advisory` prompt texts | Prompt wording is not a control (NFR-1); every rule it describes is asserted against the pipeline's behaviour with an agent that proposes the forbidden thing. Only PROP-A12-05 pins prompt *structure*, because the triage grammar is parsed. |
| Widening the envelope beyond E-1…E-4 | Deferred (D-ADV-01) pending advisory-record evidence. Asserting a future member would enshrine a decision no document has made. |
| Per-seam model selection | Deferred (D-ADV-05). PROP-RUNG-01 asserts a *single* rung constant, which is the shipped decision. |
| Phase MERGE behaviour after an advisory run | Out of scope (REQ §5). PLAN open item 4 accepts that MERGE will defer more often with a generic reason; widening MERGE's reason catalogue is explicitly not this feature's (AC-10.5, PROP-ESC-07). |
| `advisory.enabled` true on a repo with no `gh` at all | Reduces to PROP-A5-02/04/05 — every capability absence is already a first-class tested outcome, so a repo with none of them gets an A5 that only escalates. |
| A re-run surfacing a *different* CI failure | Not a separate property: TSPEC §8.5 makes it a new diagnosis **inside the same invocation**, drawing on the same budget, which is exactly what PROP-A5-07's attempt accounting asserts. |
| A-34's manual runtime verification | Not a suite member — a recorded runtime fact in one of two admissible forms. The honest `RESULT: unverified — no runtime available` is a **pass**, and an inferred result is mock data (PLAN §9.4). No property can substitute for a real runtime dispatch, and inventing one would be the exact defect that rule exists to prevent. |

### 13.3 Risks this property set knowingly carries

1. **BL-01 is open.** `MODEL_ADVISORY = "fable"` may not resolve in the shipped runtime. The property
   set is written so the fallback rung is a **tested path, not an error path** (PROP-RUNG-04), so the
   suite is green on either branch; what stays unproven until A-34 runs is which branch production
   takes.
2. **The record and escalation grammars are pinned byte-exact** (PROP-REC-02, PROP-ESC-01). That is
   deliberate — the operator and `pdlc-engineering-loop` read these files — but it means a cosmetic
   format change is a test change. The transcribed literals are the contract; changing them is a
   decision, not a refactor.
3. **O-2's real-tree properties are the slowest in the suite.** They are confined to
   `advisoryDodSeams.test.js` and `advisoryPubSeam.test.js` (PLAN §6.2) precisely to keep the cost
   bounded; pushing them into the driver file, where the `SeamOps` is fake, would make them assert
   nothing at all.
4. **`orchestrate-dev.js` grows past 9,000 lines** with this feature (PLAN open item 3). No property
   here constrains file size; the coverage floor is computed over an enumerated 24-function surface
   (PLAN §6.4) rather than over the file, so a later extraction into a fourth build source does not
   invalidate any property above.


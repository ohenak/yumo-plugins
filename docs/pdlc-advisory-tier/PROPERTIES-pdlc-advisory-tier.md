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

## 6. Properties — envelope, refusal ladder, prohibitions

## 7. Properties — seams A1 and A2 (queue module)

## 8. Properties — seams A3, A4 and A5 (dev module)

## 9. Properties — advisory record, escalation log, summary, harvest

## 10. Properties — disabled-tier equivalence and regression

## 11. Generator-driven properties (P-1 … P-9)

## 12. Coverage matrix

## 13. Gaps, negative space, and errata

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

## 4. Properties — configuration and model rung

## 5. Properties — verdict contract, invocation lifecycle, budgets

## 6. Properties — envelope, refusal ladder, prohibitions

## 7. Properties — seams A1 and A2 (queue module)

## 8. Properties — seams A3, A4 and A5 (dev module)

## 9. Properties — advisory record, escalation log, summary, harvest

## 10. Properties — disabled-tier equivalence and regression

## 11. Generator-driven properties (P-1 … P-9)

## 12. Coverage matrix

## 13. Gaps, negative space, and errata

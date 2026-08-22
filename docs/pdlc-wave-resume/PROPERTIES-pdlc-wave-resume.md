# PROPERTIES — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | te-author |
| Version | 1.0 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/`) |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md` |

## Overview

### What this document is

The falsifiable form of the contract REQ §1 asks for: **the oracle is an observed resume, never
the presence of a code path.** Every property below is asserted on one of four observable classes —
a dispatched or undispatched wave (counted), an announced sentence, a report row, or the bytes
written to `WAVE_STATE_PATH` — plus two repo-state observables (`.gitignore`, this feature's own
PLAN ownership manifest). No property is discharged by grepping the module for a symbol, and no
property is discharged by an absence alone.

### Scope

| In scope | Out of scope |
|---|---|
| The resume decision at Phase I entry: `parseWaveLedger` → `classifyWaveLedger` → `main()`'s announcement and report row | The wave gate's own semantics (`M-WG-*`, `pdlc-wave-gate-baseline.md`) |
| The record's write site, cadence, guard and failure posture | Advisory wave-gate remediation's internals (`pdlc-advisory-wave-gate`) |
| The three closed catalogues (`RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS`) and `IMPLEMENTATION_DEFAULTS`' key set | Phase PT's V-wave behaviour, except the one conjunct that proves it still replays (PROP-SKIP-03) |
| Queue/direct parity at the delegation boundary, as DEC-WVR-07 scopes it | A real delegated Phase I resolving a record (DEC-WVR-07: not honestly assertable) |
| The record's exclusion from tracked content | Concurrency (FSPEC EC-19), `version` field semantics (TSPEC §5.6) |

### The tree these properties are written against

Two grounding facts, verified in this working tree at authoring time rather than assumed, because
they change what "existing test" means for every row below:

| Fact | Command | Result |
|---|---|---|
| This branch is behind the default branch | `git rev-list --count HEAD..origin/main` | `1637` |
| The mechanism under test is absent **here** | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` |
| It is present at `origin/main` | `git show origin/main:pdlc/workflows/orchestrate-dev.js \| grep -n 'export const WAVE_STATE_PATH'` | `:12214` |
| The ignore rule exists only at `origin/main` | `git show origin/main:.gitignore \| grep -n pdlc-wave-state` | `:41 /.claude/pdlc-wave-state.json` |
| `fast-check`, `c8`, `test:coverage` exist only at `origin/main` | `git show origin/main:pdlc/workflows/package.json` | `c8 ^10.1.3`, `fast-check ^4.9.0`, `test:coverage` present; this tree's manifest has `jest` only |

Consequence, and it is the same one PLAN §1.2 draws: **every property below is red in this tree and
is expected to be**, until REQ BL-04 / FSPEC OB-F1 / TSPEC §6.2's rebase lands. PLAN T-01 is the
gate that proves it landed; PROP-PRE-01/02 are its properties. Weakening any property so that it
passes pre-rebase — in particular relaxing PROP-REPO-01 to a `some(line => line.includes(...))` —
is forbidden by TSPEC §5.4 AT-14 and would be a defect, not an accommodation.

Shipped-behaviour claims in this document are cited against `git show origin/main:...`. Where a
line number appears it is a locator only; the stable citation is the enclosing exported symbol,
`describe`/`it` title, or verbatim string (DEC-DOC-01).

### Test levels and the pyramid budget

| Level | Count | Files | Why here |
|---|---|---|---|
| Unit — pure | 14 | `waveResume.test.js` (new, T-02/T-10) | `classifyWaveLedger`, `parseWaveLedger`, `formatWaveLedger` and the three catalogues are pure and total; every guard arm is cheapest here |
| Unit — generative | 4 | `waveResumeProperties.test.js` (new, T-08) | four laws over a parser, a serialiser, a hash and a total classifier (TSPEC §5.7) |
| Integration — through `main()` | 20 | `waveExecution.test.js` (existing, T-07/T-10) | every announcement, report row, dispatch count and written byte lives in `main()`'s Phase I branch and is reachable only through `makeLedgerArgs` |
| Integration — queue | 1 | `waveResumeQueueParity.test.js` (new, T-04) | the delegation boundary, scoped by DEC-WVR-07 |
| Repo-state | 4 | `waveResumeRepoState.test.js` (new, T-03) | `.gitignore`, `git check-ignore`, this PLAN's manifest, the promoted `M-WVR-*` facts |
| Pre-flight | 2 | `waveResumePreflight.test.js` (new, T-01) | the baseline-existence and script-owned-gate gate that must red **before** any dependent wave dispatches |
| **E2E** | **0** | — | there is no E2E tier in `pdlc/workflows`; `main()`-level integration *is* the top of this pyramid, and the budget of 3–5 E2E tests is therefore spent at zero |

Six test files, five of them new. Exactly one exists today —
`pdlc/workflows/__tests__/waveExecution.test.js`, 2,761 lines at `origin/main` — and it is
**extended in place, never duplicated**; the other five are declared new by the PLAN rows that own
them (§3.3 of the PLAN), and none of the five resolves anywhere under
`pdlc/workflows/__tests__/` in this tree or at `origin/main` (verified by `ls`).

### Property-id scheme

`PROP-{DOMAIN}-{NN}`, one domain per behavioural cluster: `PRE` (pre-flight), `RESUME`
(outcome b), `DISREGARD` (outcome a and the ignore catalogue), `SKIP` (outcome c), `OVERRIDE`
(operator pointer), `SAFETY` (verification independence), `RECORD` (write site, cadence, failure),
`PARITY` (queue), `REPO` (untracked/ownership), `LAW` (generative), `COV` (coverage and mutation
duty). Ids are stable and are never reused if a property is retired.

## Properties

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Risks and Routed Findings

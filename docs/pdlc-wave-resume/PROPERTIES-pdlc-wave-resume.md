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

Every row is a testable statement of the form *{component} {must / must not} {observable
behaviour} {when / given}*. `Traces` names the FSPEC AT, business rule or REQ criterion the row
derives from; `Owner` names the PLAN task that lands it and the physical file it lands in. Oracle
form — the assertion that makes each row falsifiable — is in **§ Oracles**, one entry per id.

**Legend.** Level: `U` pure unit · `UG` unit/generative · `I` integration through `main()` ·
`Q` queue integration · `R` repo-state · `P` pre-flight · `C` coverage/mutation duty.

### 1. Pre-flight — the gate that must red before any dependent wave dispatches

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-PRE-01 | The pre-flight suite must fail when any of `WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `IMPLEMENTATION_DEFAULTS` is absent from `orchestrate-dev.js`'s exports, or `docs/_constraints/pdlc-wave-gate-baseline.md` is untracked, or `pdlc/workflows/package.json` lacks any of `test:coverage`, `c8`, `fast-check` — existence only, never the shape T-02 creates. | Contract | P | PLAN T-01(a), §3.2 | T-01 · `waveResumePreflight.test.js` |
| PROP-PRE-02 | The pre-flight suite must fail when the resolved `implementation.testCommand` is not string-equal to the literal transcribed in PLAN §3.4; when `.claude/pdlc.config.json` is absent it must instead assert `process.env.GITHUB_ACTIONS === "true"`, so a locally missing or drifted config reds rather than passing vacuously. | Contract | P | PLAN T-01(b), RK-6 | T-01 · `waveResumePreflight.test.js` |

### 2. Outcome (b) — resume mid-plan on the record

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-RESUME-01 | Given a run halted at wave N>1 of an M-wave plan, the same feature, an unchanged PLAN and no resume configuration, a re-invocation must dispatch exactly the tasks of waves N..M and must dispatch none of waves 1..N-1. | Functional | I | AT-01, REQ-WVR-01 | T-07 · `waveExecution.test.js` |
| PROP-RESUME-02 | That re-invocation must emit exactly one resume banner, beginning `Resuming at wave N of M (wave ledger `, ending with the literal ` (provenance: automatic)`, and containing `Delete .claude/pdlc-wave-state.json to force a full run.` | Observability | I | AT-01, BR-06, BR-07, TSPEC §2.4 row (b)/record | T-07 · `waveExecution.test.js` |
| PROP-RESUME-03 | For every wave k < N that re-invocation must emit the whole line `Wave k/M: skipped (wave ledger: waves 1–(N-1) already green)`, rendered from the decision's `lastGreenWave`, carrying **no** provenance suffix. | Observability | I | TSPEC §3.2 (`lastGreenWave` consumer), AT-01 | T-07 · `waveExecution.test.js` |
| PROP-RESUME-04 | The Phase I report row of a run that started at wave N>1 must carry status `✅` and detail string-equal to `Waves N–M complete, waves 1–(N-1) skipped as previously completed (wave mode, {gate}) (provenance: {p})`; a run that starts at wave 1 must keep the shipped detail `All M waves complete (wave mode, {gate})` byte-identically. | Contract | I | AT-01 (D-3), TSPEC §2.4 report table | T-07 · `waveExecution.test.js` |
| PROP-RESUME-05 | Completion must accumulate across invocations: a plan halted at wave 2, resumed, then halted at wave 4 must make the third invocation announce wave **4** and skip waves 1–3 individually — never a wave number relative to what the previous run itself executed. | Data Integrity | I | AT-18, BR-08 | T-07 · `waveExecution.test.js` |
| PROP-RESUME-06 | A wave whose tasks own no changed path must still be recorded completed, and the next invocation of the same plan must announce the **next** wave as its resume point; adding or removing an unrelated commit must leave the announced resume point identical. | Data Integrity | I | AT-10, REQ-WVR-06, OF-2 | T-07 · `waveExecution.test.js` |

### 3. Outcome (a) — the disregard catalogue

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-DISREGARD-01 | `Object.keys(WAVE_IGNORE_REASONS)` must be **set-equal** to the seven codes `unreadable-json`, `not-an-object`, `wrong-shape`, `feature-mismatch`, `plan-changed`, `head-unreachable`, `over-count`, transcribed from TSPEC §3.1 — a containment check must not be used, so a deleted code fails a test instead of passing one. | Contract | U | AT-02, OB-F5, REQ-WVR-02 | T-02 · `waveResume.test.js` |
| PROP-DISREGARD-02 | For each of the seven codes, a run over its fixture must resolve outcome (a): every wave of the plan dispatched from wave 1, and exactly one notice equal to `Notice: the wave ledger .claude/pdlc-wave-state.json was ignored — {reason}. Running every wave from 1. (provenance: automatic)`, the reason transcribed as a literal from TSPEC §3.1/§2.4. | Error Handling | I | AT-02, BR-02, BR-07 | T-07 · `waveExecution.test.js` |
| PROP-DISREGARD-03 | An absent, empty or `{}` record (IG-6) must produce **no** announcement — asserted positively: no log line contains `wave ledger`, **and** `dispatchedTaskIds` equals the whole plan, **and** no line starts with `Resuming at wave`. | Error Handling | I | AT-02 (PM F-04), BR-02, EC-01, EC-02 | T-07 · `waveExecution.test.js` |
| PROP-DISREGARD-04 | `parseWaveLedger` must return exactly `{state: null, reason: null}` for each of the three transcribed no-record inputs `null`, `""` and `"{}"` — this is where IG-6's membership in the closed six lives, so a change that made an absent record announce, or made `{}` fall through to IG-1, reds here. | Contract | U | AT-02, DEC-WVR-04, EC-02 | T-02 · `waveResume.test.js` |
| PROP-DISREGARD-05 | `parseWaveLedger`'s three rejecting arms must return their exact shipped sentences — `it is not readable JSON`, `it is not a JSON object`, `its fields are not the shape this workflow writes` — as `reason` with `state: null`. | Contract | U | AT-02, TSPEC §3.1 | T-02 · `waveResume.test.js` |
| PROP-DISREGARD-06 | A record failing **both** ancestry and the wave count must classify `head-unreachable`, never `over-count` — guard 5 precedes guard 6, which is the one pair where TSPEC §3.2's order diverges from the REQ's IG numbering. | Functional | U | AT-03, BR-03, FSPEC §3.2 | T-02 · `waveResume.test.js` |
| PROP-DISREGARD-07 | The ancestry probe must be lazy: on a feature-mismatch fixture and on a plan-hash-mismatch fixture the `_git` call list filtered to `merge-base` must equal `[]`, and on the ancestry fixture it must equal `[["merge-base", "--is-ancestor", HEAD_SHA, "HEAD"]]` — equality, never containment. | Performance | I | AT-03, AT-11, DEC-WVR-08, TSPEC §2.2 | T-07 · `waveExecution.test.js` |
| PROP-DISREGARD-08 | A well-formed record naming **no** commit must be honoured with **zero** `merge-base` calls, because `headCorroborated` returns before reaching the transport. | Performance | I | AT-11, EC-21, TSPEC V-7 | T-07 · `waveExecution.test.js` |
| PROP-DISREGARD-09 | A record whose ancestry probe is unanswerable — no transport, or a transport that throws — must be **honoured**, not disregarded: an unavailable probe is not a staleness claim. Positive conjunct: the resume banner is present and the resumed subset is dispatched. | Error Handling | I | AT-11, EC-07, BR-12 | T-07 · `waveExecution.test.js` |
| PROP-DISREGARD-10 | No state of the record may make the pipeline refuse to run: over all seven code fixtures plus the IG-6 fixture, `result.outcome` must equal `"success"` and must never be `"halted"` or `"blocked"`. | Error Handling | I | BR-12, REQ C-2, REQ-WVR-02 | T-07 · `waveExecution.test.js` |
| PROP-DISREGARD-11 | The **set** of TSPEC §2.4 announcement rows observed to announce must be set-equal to the five announcing rows transcribed from that table, with the IG-6 row asserting silence positively — so a deleted announcement reds set equality rather than depending on some other property happening to name it. | Contract | I | AT-13 (TE F-14), BR-01, BR-07 | T-07 · `waveExecution.test.js` |

### 4. Outcome (c) — Phase I skipped in full

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-SKIP-01 | Given a valid record for this feature and unchanged plan recording every wave complete, the implementation wave loop must perform **zero** agent dispatches and **zero** gate invocations, and must emit a banner beginning `Skipping Phase I (wave ledger ` that names both the reason and the literal `to force a full run`. | Functional | I | AT-12, REQ-WVR-08, BR-11 | T-07 · `waveExecution.test.js` |
| PROP-SKIP-02 | That run's Phase I report row must carry status `⏭` and detail string-equal to `Skipped — all M waves previously committed and recorded green (wave ledger) (provenance: automatic)` — one row with a distinguishing status, never a second row. | Contract | I | AT-12 (TE F-09), EC-09, D-3 | T-07 · `waveExecution.test.js` |
| PROP-SKIP-03 | Under outcome (c) Phase PT's V-wave must still dispatch exactly **one** agent and invoke the gate exactly **once**: the skip is scoped to the wave loop, and the V-wave replays on every invocation. This is the positive conjunct that keeps PROP-SKIP-01 from being an absence-only oracle. | Integration | I | AT-12 (fourth conjunct), EC-20, BR-11 | T-07 · `waveExecution.test.js` |
| PROP-SKIP-04 | Under outcome (c) the implementation wave loop must land **no** commit: the `_git` spy's `add` argv list must contain no path owned by any wave task, and the V-wave's own commit must be the only Phase-I-adjacent commit observed. | Security | I | REQ-WVR-08, BR-11, AT-12 | T-07 · `waveExecution.test.js` |

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Risks and Routed Findings

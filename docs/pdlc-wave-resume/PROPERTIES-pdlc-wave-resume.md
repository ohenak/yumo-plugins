# PROPERTIES — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | te-author |
| Version | 1.2 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/`) |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`, `CROSS-REVIEW-product-manager-PROPERTIES-v2.md`, `CROSS-REVIEW-software-engineer-PROPERTIES-v2.md` |
| LEARNINGS | `docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md` |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. |
| 1.1 | Round-1 delta. Every candidate upstream defect raised in the first drafting pass was re-verified against its parent document at HEAD: three had been closed by their owners and were withdrawn, one (TSPEC §5.7's run count vs. PLAN T-08's `numRuns: 500`) was still open and was routed as an `ERRATUM: TSPEC` line. The retired PLAN ids `T-05`/`T-06`/`T-09` are called out so the seven-row task trace reads as complete. No property, oracle, fixture or matrix row changed. |
| 1.2 | Round-2 cross-review revision. **PROP-SKIP-04 re-expressed** (SE F-01): the script issues no `git add` in the V-wave, so the pathspec-equality oracle and the "V-wave's own commit" premise are replaced by a flattened whole-`add`-list assertion paired with a positive dispatch-identity conjunct; the retired premise is routed as an `ERRATUM: TSPEC` line against AT-12's fourth conjunct. **Queue fixture 2's rationale corrected** (SE F-02): the `distribution.checkEnabled` drift gate no longer exists in `orchestrate-queue.js`, so the precondition is re-anchored on the dispositions that still fire; routed upstream against TSPEC AT-16 and PLAN T-04. **H-1 restated as a wrapper** over the caller-supplied `git`/`runCommand` doubles, and its two consumers gained a both-axes-present precondition (SE F-03). **PROP-COV-01 scoped and grounded** on measured per-file numbers (SE F-04). PROP-REPO-02's dangling `G-3` anchor now points at the new gap **G-5** (SE F-05). This revision-history block added (PM F-02). |

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

| Level | Properties | Files | Why here |
|---|---|---|---|
| Pre-flight (`P`) | 2 | `waveResumePreflight.test.js` (new, T-01) | the baseline-existence and script-owned-gate gate that must red **before** any dependent wave dispatches |
| Unit — pure (`U`) | 11 | `waveResume.test.js` (new, T-02/T-10) | `classifyWaveLedger`, `parseWaveLedger`, `formatWaveLedger` and the three catalogues are pure and total; every guard arm is cheapest here |
| Unit — generative (`UG`) | 4 | `waveResumeProperties.test.js` (new, T-08) | four laws over a parser, a serialiser, a hash and a total classifier (TSPEC §5.7) |
| Integration — through `main()` (`I`) | 34 | `waveExecution.test.js` (existing, T-07/T-10) | every announcement, report row, dispatch count and written byte lives in `main()`'s Phase I branch and is reachable only through `makeLedgerArgs` |
| Integration — queue (`Q`) | 4 | `waveResumeQueueParity.test.js` (new, T-04) | the delegation boundary, scoped by DEC-WVR-07 |
| Repo-state (`R`) | 3 | `waveResumeRepoState.test.js` (new, T-03) | `.gitignore`, `git check-ignore`, this PLAN's manifest, the promoted `M-WVR-*` facts |
| Coverage / mutation duty (`C`) | 3 | measured by T-10; mutation runs recorded by T-02 and T-07 | the floor and the delta oracle are measured over the complete diff, not per wave |
| **E2E** | **0** | — | there is no E2E tier in `pdlc/workflows`; `main()`-level integration *is* the top of this pyramid, and the budget of 3–5 E2E tests is therefore spent at zero |

**58 properties.** Four carry both a unit and an integration half (PROP-OVERRIDE-04,
PROP-SAFETY-02, PROP-RECORD-07 and — across files — PROP-REPO-02/03), so the level column sums
above 58 by four; every property has exactly one owning task per half.

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
| PROP-SKIP-04 | Under outcome (c) the script must issue **zero** `git add` invocations for wave work: the flattened `add` argv list observed on the `_git` double must be set-equal to `[]`, and the same run must positively show (i) the branch-guard `["rev-parse", "--abbrev-ref", "HEAD"]` call on that same `_git` double — proving the git seam was wired and live, not disconnected — and (ii) exactly one agent dispatch, whose prompt is the V-wave's `propertiesTestPrompt` for this feature. The V-wave's own commit is made by the dispatched agent, not by the script, so it is **not** an observable of this suite (SE F-01; the `add`-list conjunct in TSPEC §5.4 AT-12 is routed upstream). | Security | I | REQ-WVR-08, BR-11, AT-12 (first three conjuncts) | T-07 · `waveExecution.test.js` |

### 5. Operator override and the single hatch

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-OVERRIDE-01 | With both a valid record and `implementation.startWave: 2`, the run must start at wave 2 and must emit **no** line matching `wave ledger … was ignored` — the record was never consulted. The single log line beginning `Resuming at wave 2 of 3 (implementation.startWave)` must end with the literal ` (provenance: operator-set)`; a token found on any other line does not satisfy this property. | Functional | I | AT-05 (TE F-05), BR-04, REQ-WVR-04 | T-07 · `waveExecution.test.js` |
| PROP-OVERRIDE-02 | Two runs of the same config differing **only** in `startWave: 1` present versus the key omitted must produce whole-array-equal logs and an equal Phase I report row. Positive conjunct so two equally-broken runs cannot compare equal: in both runs the banner beginning `Resuming at wave 2 of 3 (wave ledger` is present with ` (provenance: automatic)` and `dispatchedTaskIds` equals `["T2", "T3"]`, not the whole plan. | Functional | I | AT-06 (TE F-03, PM F-02), BR-05 | T-07 · `waveExecution.test.js` |
| PROP-OVERRIDE-03 | `startWave: 99` on a three-wave plan must emit the past-the-end notice ending ` (provenance: operator-set)`, dispatch all three waves, announce no wave as skipped, and **not read the record at all** — the `_readFile` call list must contain no entry for `WAVE_STATE_PATH`. | Functional | I | AT-07, BR-05, EC-11 | T-07 · `waveExecution.test.js` |
| PROP-OVERRIDE-04 | The force-a-full-run hatch must be exactly one and must be named where it is needed: (i) the outcome (b) and (c) banners each contain `to force a full run`; (ii) the same fixture with the record removed resolves outcome (a) — the hatch works; (iii) `Object.keys(IMPLEMENTATION_DEFAULTS)` is **set-equal** to the four keys `testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave`, so a fifth key (in particular a `forceFullRun`) reds. | Contract | I + U | AT-08, BR-06, BR-17, OQ-1 | T-07 (i)(ii) · T-02 (iii) |
| PROP-OVERRIDE-05 | The config-validation notice `Notice: implementation.startWave in {cfg} is not a valid value — using the default.` must **not** gain a provenance token: it precedes any resume decision and is about a rejected value, not a resolved start point. This is the one excluded notice, and the property that keeps the announcement catalogue's count of changed shipped assertions at three. | Contract | I | TSPEC §2.4 exclusion table, BR-07 | T-07 · `waveExecution.test.js` |

### 6. Verification independence and the closed outcome catalogue

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-SAFETY-01 | Over the enumerated fixture set — resume at wave 2, resume at the last wave, `head` = tip, `head` = an earlier ancestor — the wave gate command must be invoked **before** the first commit call, asserted on the interleaving of the `_runCommand` and `_git` doubles through the H-1 ordered event sink, never on two independent call logs. | Security | I | AT-04, BR-10, REQ-WVR-03 | T-07 · `waveExecution.test.js` |
| PROP-SAFETY-02 | `RESUME_OUTCOMES` must be set-equal to the three transcribed literals `full-run`, `resume`, `skip-phase`, and three integration fixtures must each resolve exactly one of them and announce it — so a deleted outcome fails a test. | Contract | U + I | AT-13, BR-01, REQ-WVR-08 | T-02 (set equality) · T-07 (fixtures) |
| PROP-SAFETY-03 | `classifyWaveLedger` must resolve each of the eight rows of TSPEC §3.2's guard table to exactly the transcribed decision, must never throw, and must perform no IO — it receives ancestry as an already-resolved boolean and returns a description, never an `emit` or a probe. | Functional | U | TSPEC §3.2, DEC-WVR-02, C-3 | T-02 · `waveResume.test.js` |
| PROP-SAFETY-04 | `RESUME_PROVENANCE` must be set-equal to the two transcribed literals `operator-set`, `automatic`, and every decision `classifyWaveLedger` returns must carry `automatic` — the `operator-set` provenance never originates in the classifier, because an explicit pointer means it is not called at all. | Contract | U | TSPEC §3.1/§3.2, BR-07 | T-02 · `waveResume.test.js` |

### 7. The record: write site, cadence and failure posture

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-RECORD-01 | A run whose gates are all green but which has **no** git transport must write nothing — `ledgerWrites(writes)` is empty — and the next invocation must start at that same wave and announce it as not previously completed. Completion means committed, never merely verified. | Data Integrity | I | AT-09, REQ-WVR-09, EC-13, BR-08 | T-07 · `waveExecution.test.js` |
| PROP-RECORD-02 | The companion: the same run **with** a transport must record normally under **each** gate mode in turn — script-owned and self-report — proving the write's guard is the transport, not the gate mode. | Data Integrity | I | AT-09 companion, TSPEC §2.5 item 1 (V-8) | T-07 · `waveExecution.test.js` |
| PROP-RECORD-03 | For every recorded wave the record write must occur **after** that wave's pathspec-scoped commits, asserted on the H-1 event sink's ordering, never beside the gate. | Data Integrity | I | BR-08, TSPEC §2.5 item 2 | T-07 · `waveExecution.test.js` |
| PROP-RECORD-04 | Each write must carry `lastGreenWave` as the **plan-absolute** wave number, never a count of the waves this run executed — the discriminator is PROP-RESUME-05's three-invocation sequence, which every single-halt fixture passes under the run-relative mutation. | Data Integrity | I | AT-18, BR-08, TSPEC §2.5 item 5 | T-07 · `waveExecution.test.js` |
| PROP-RECORD-05 | When **every** write throws, each failure must be announced as a notice beginning `Notice: could not record wave `, the run must still complete (`outcome === "success"`), and the next invocation must resolve outcome (a). | Error Handling | I | AT-15 arm 1, BR-15, EC-15 | T-07 · `waveExecution.test.js` |
| PROP-RECORD-06 | When the wave-1 write succeeds and the wave-M write throws, the run must complete and the next invocation must resolve outcome **(b)** at the wave after the last **successfully** written record — the discriminator against an implementation that discards the record on any failure. | Error Handling | I | AT-15 arm 2 (D-6), EC-15a | T-07 · `waveExecution.test.js` |
| PROP-RECORD-07 | `head` must be stamped from `git rev-parse HEAD` after the wave's commits when the transport answers, and must be **absent** from the written bytes when it does not; a record with no `head` must still be honoured by the reader (paired with PROP-DISREGARD-08). | Data Integrity | I + U | TSPEC §2.5 item 4, V-7, EC-21 | T-07 · T-02 |
| PROP-RECORD-08 | `formatWaveLedger` must produce exactly two shapes — with and without `head` — each pretty-printed at two-space indent and newline-terminated, asserted as transcribed whole strings, and `version` must be the literal `1` in both. | Contract | U | TSPEC §4.1, V-4, §5.6 | T-02 · `waveResume.test.js` |
| PROP-RECORD-09 | The record must carry **no** provenance field: the parsed key set of any written record must be set-equal to `{version, feature, planHash, lastGreenWave}` or `{version, feature, planHash, lastGreenWave, head}` and nothing else. Provenance is announced content, never persisted state. | Data Integrity | U | TSPEC §2.5 (PM Q-02), §4.1 | T-02 · `waveResume.test.js` |
| PROP-RECORD-10 | A run that halts at **wave 1** must write no record at all, and the next invocation must therefore be a silent full run (IG-6) — the halt REQ §1 names as the one this feature is meant to resume from, and the one that pays no replay tax. | Data Integrity | I | EC-12, REQ §1, OF-1 | T-07 · `waveExecution.test.js` |

### 8. Queue parity, at the boundary it can honestly carry

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-PARITY-01 | `orchestrate-queue`'s `_runPipeline` must be left at its default on the delegation path, and that fact must be asserted — an unconfigured queue call reaches `orchestrate-dev`'s exported default. | Integration | Q | AT-16 (i), DEC-WVR-07, BR-16 | T-04 · `waveResumeQueueParity.test.js` |
| PROP-PARITY-02 | The delegation payload's key set must equal `["reqPath"]`, asserted with `toEqual` against a spy — so any queue-side resume configuration, seam override or `startWave` forwarding reds. | Contract | Q | AT-16 (ii), BR-16, V-15 | T-04 · `waveResumeQueueParity.test.js` |
| PROP-PARITY-03 | The direct run's `_readFile` call list, filtered to the ledger path, must be string-equal to `WAVE_STATE_PATH`, and the queue must add nothing that could change it. | Contract | Q | AT-16 (iii), REQ-WVR-07 | T-04 · `waveResumeQueueParity.test.js` |
| PROP-PARITY-04 | The falsification arm must be executed and its output recorded: mutating the queue to forward any additional key must red PROP-PARITY-02 while PROP-RESUME-01 … PROP-OVERRIDE-01 all still pass. A parity net that cannot be shown to fail is not a net. | Contract | Q | AT-16 falsification arm, PLAN T-04 | T-04 · task report |

### 9. The record never becomes tracked content

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-REPO-01 | `.gitignore` must contain a line **equal** to `/.claude/pdlc-wave-state.json`; that matched line must be root-anchored (leading `/` asserted on it); and `git check-ignore -v .claude/pdlc-wave-state.json` must resolve to **that** line, not to a broader pattern. `some(line => line.includes(...))` and "no churn observed" are forbidden weakenings. | Security | R | AT-14, BR-14, REQ-WVR-10, C-1 | T-03 · `waveResumeRepoState.test.js` |
| PROP-REPO-02 | Over **this feature's PLAN**, no row of the §3.3 ownership manifest and no `implementation.postWavePathspecs` value may name `WAVE_STATE_PATH` — a finite check by name, so no advisory remediation envelope of this run can authorise touching the record. | Security | R | AT-17 (repo-state half), OB-F6, EC-16, D-9 | T-03 · `waveResumeRepoState.test.js` |
| PROP-REPO-03 | No commit a run produces may contain the record: across every wave of a full run the `_git` `add` argv list must contain no entry naming `.claude/pdlc-wave-state.json`. This is the run-side conjunct that PROP-REPO-01's repo-side rule cannot supply. | Security | I | REQ-WVR-10, BR-14 | T-07 · `waveExecution.test.js` |
| PROP-REPO-04 | `docs/_constraints/pdlc-wave-gate-baseline.md` must carry `M-WVR-1` and `M-WVR-2` in a **new**, next-unoccupied section, each with a Measured-by command; the file's `Version` must be strictly above the version found at promotion time; and the new section must record `M-WG-6` as reviewed-and-left, not missed. | Observability | R | D-10, OB-F4, REQ OB-2 | T-03 · `waveResumeRepoState.test.js` |
| PROP-REPO-05 | Advisory wave-gate remediation must compose without coordination: a wave that goes green after remediation commits and records normally; a failed remediation leaves the identical halt and a record still naming the wave **below**. | Integration | I | AT-17 (integration half), EC-16, REQ OB-3 | T-07 · `waveExecution.test.js` |

### 10. Generative laws

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-LAW-01 | **ROUND-TRIP.** For all `(feature, planHash, lastGreenWave, head)` with `feature` and `planHash` non-empty strings and `lastGreenWave` an integer ≥ 1, `parseWaveLedger(formatWaveLedger(...)).state` must deep-equal `{feature, planHash, lastGreenWave, head: head ?? null}` and `.reason` must be `null`. | Data Integrity | UG | P-1, TSPEC §5.7 | T-08 · `waveResumeProperties.test.js` |
| PROP-LAW-02 | **TOTALITY (reader).** For arbitrary strings — including arbitrary JSON values and non-string inputs — `parseWaveLedger` must never throw and must return exactly one of the three shapes of TSPEC §4.2. | Error Handling | UG | P-2, V-2 | T-08 · `waveResumeProperties.test.js` |
| PROP-LAW-03 | **TOTALITY (classifier).** For arbitrary `ClassifyInput`, `outcome` must be a member of `RESUME_OUTCOMES`, `provenance` a member of `RESUME_PROVENANCE`, and `code`, where present, must be `null` or a member of `Object.keys(WAVE_IGNORE_REASONS)`. This is what makes BR-01's closure mechanically checkable rather than asserted in prose. | Contract | UG | P-3, BR-01, TSPEC §2.2 | T-08 · `waveResumeProperties.test.js` |
| PROP-LAW-04 | **HASH DISCRIMINATION.** For generated pairs of wave layouts differing in wave order, task ids, task-to-wave assignment or owned paths, `computePlanHash` must differ across the generated corpus. The suite must state the bounded-corpus caveat: FNV-1a over 32 bits is not injective, so a generated collision is a finding about the corpus, not a failed law. | Data Integrity | UG | P-4, TSPEC §4.3 | T-08 · `waveResumeProperties.test.js` |

### 11. Coverage and mutation duty

| # | Property | Category | Level | Traces | Owner |
|---|---|---|---|---|---|
| PROP-COV-01 | `npm run test:coverage` from `pdlc/workflows` must exit 0, and the measured per-file branch number for **`orchestrate-dev.js`** — the one c8-included module this feature edits — must be **≥ 85 and ≥ the baseline recorded below**, pasted into the owning task's report. This is a *regression guard scoped to the module the feature touches*, not an inherited gate over the other three included modules: a per-file red in `orchestrate-queue.js`, `build-runtime.mjs` or `scripts/capture-learnings-baseline.mjs` is a blocked task to be reported and routed, never a reason to weaken this property or the threshold. | Performance | C | RT-7, TSPEC §5.8, PLAN T-10 | T-10 |
| PROP-COV-02 | c8's per-file uncovered-line list for `orchestrate-dev.js` must contain no line inside the ranges this feature introduces, and PLAN §4.5.1's mapping table must be **complete** — every branch class named, every row naming a covering test. A deleted case must fail that table's set equality rather than move a percentage by 0.05. | Observability | C | RT-7, PLAN §4.5.1 (F-05) | T-10 |
| PROP-COV-03 | Each of PLAN §4.3's four mutations must be **applied, observed RED against its named oracle, reverted, and its failure output recorded** in the owning task's report — a believed mutation is not an observed one. | Contract | C | PLAN §4.3 (F-04), TSPEC §5.5 | T-02, T-07 |

**Measured baseline (SE F-04) — the numbers PROP-COV-01 rides on, measured, not assumed.**
`test:coverage` is two stages: stage 1 runs `c8 npm test -- --runInBand` under the `c8` block's
aggregate floors (`branches 85 / lines 90 / functions 90 / statements 90`), stage 2 re-reports with
`--check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0`. The c8 `include`
set is **four** modules, not three: `**/pdlc/workflows/orchestrate-dev.js`,
`**/pdlc/workflows/orchestrate-queue.js`, `**/pdlc/workflows/build-runtime.mjs` and
`**/scripts/capture-learnings-baseline.mjs` (`pdlc/workflows/package.json`, `c8.include`).

Measured on this branch on **2026-08-23** (`npx c8 --temp-directory=/tmp/c8tmp npm test -- --runInBand`,
then the stage-2 `c8 report --check-coverage --per-file --branches 85 …`, which exited **0**):

| Included module | % Branch | Against the 85 per-file floor |
|---|---|---|
| `orchestrate-dev.js` | **88.75** | +3.75 — this is PROP-COV-01's baseline; the feature's ~20 new branches must not drive it below 85 |
| `orchestrate-queue.js` | 88.75 | +3.75 — untouched by this feature; recorded so a red here is legible as inherited |
| `build-runtime.mjs` | 88.23 | +3.23 — untouched |
| `scripts/capture-learnings-baseline.mjs` | 89.47 | +4.47 — untouched |

No included module is under the floor today, so PROP-COV-01 starts from a green gate rather than
inheriting a red one — which is the fact that makes it a usable regression guard. Two caveats the
implementer must carry: (i) none of the four CI checks in the repo's `CLAUDE.md` table runs
`test:coverage`, so this floor is held green only by the owning task actually running it (RK-2, PLAN
T-10); (ii) in *this pre-rebase tree* the run has a known unrelated red — `documentOracles.test.js`
fails because build artifacts under `pdlc/workflows/coverage/` and the machine-local
`.claude/pdlc-wave-state.json` / `.claude/pdlc.config.json` are tracked on this branch (see G-4).
Those failures are repo-state, not coverage; the numbers above are from the c8 report itself, whose
stage-2 check exited 0.

## Oracles

### The four rules every oracle below is held to

Restated rather than assumed, because they are what makes the property set falsifiable
(TSPEC §5.1, PLAN §4.2):

1. **No implementation echoes.** Every expected value — the seven reason codes, the three
   outcomes, the two provenance tokens, the four config keys, every announcement sentence — is a
   literal **transcribed from the TSPEC or the FSPEC into the test**. An expected announcement is
   never obtained by calling `WAVE_IGNORE_REASONS[code](ctx)`: that would make every renderer
   trivially agree with itself.
2. **No absence-only oracles.** "No commit was produced" cannot distinguish a skipped wave from a
   wave that ran with nothing to add. Every skip assertion is a **call count on a spy** paired with
   a positive conjunct — PROP-SKIP-01's zero dispatches is paired with PROP-SKIP-03's
   exactly-one V-wave dispatch; PROP-DISREGARD-03's silence is paired with a full dispatch list.
3. **No matcher is relaxed.** Replacing `toContain(exactString)` with
   `some(m => m.startsWith(…))` is forbidden. `toEqual` on the filtered `merge-base` call list is
   load-bearing, not stylistic: `toContainEqual` **passes** under the eager-probe mutation
   (TSPEC §5.5 row 4).
4. **Set equality, never containment**, for all four closed catalogues (OB-F5): the seven ignore
   codes, the three outcomes, the two provenance tokens, and the four `implementation.*` keys.

### Oracle per property

| # | Oracle (the assertion that fails) | Falsifiability note |
|---|---|---|
| PROP-PRE-01 | Named-export presence assertions over the module; `git ls-files --error-unmatch docs/_constraints/pdlc-wave-gate-baseline.md` exits 0; three key-presence assertions over `pdlc/workflows/package.json`. | Existence-only by design. Not tautological post-rebase: it reds if a later change removes a symbol `classifyWaveLedger` depends on. It deliberately carries **no** `.gitignore` arm — PROP-REPO-01 owns that in its strict form, and a second `includes`-shaped restatement here would be the exact weakening PROP-REPO-01 forbids. |
| PROP-PRE-02 | `expect(resolved.testCommand).toBe(<PLAN §3.4 literal>)`; when `.claude/pdlc.config.json` is absent, `expect(process.env.GITHUB_ACTIONS).toBe("true")`. | The absent-file arm is a guard, not an escape: a *locally* missing or drifted config still reds. Without this property every batch-gate wording in PLAN §2.2 is an agent's claim about itself. **Contributor cost, stated rather than left implicit (SE Q-03):** a contributor running `npm test` in a clone that never carried a consumer-local `.claude/pdlc.config.json` gets a red pre-flight suite, and the only way to green it is to author that config. That is deliberate — the alternative, skipping the arm when neither the config nor CI is present, is exactly the vacuous pass RK-6 names — but the failure message must say so and must name the file to create. |
| PROP-RESUME-01 | `expect(dispatchedTaskIds(record)).toEqual(["T2","T3"])` — equality over the ordered list, not containment. | Paired positive for the skip: the *presence* of waves N..M in the list is what stops "nothing was dispatched" from passing. |
| PROP-RESUME-02 | `logs.filter(m => m.startsWith("Resuming at wave 2 of 3 (wave ledger"))` has length **1**; that element `.endsWith(" (provenance: automatic)")` and `.toContain("Delete .claude/pdlc-wave-state.json to force a full run.")`. | Length 1 kills a duplicate banner. `endsWith` on the token is asserted **on the filtered element**, so a token emitted on some other line does not satisfy it. |
| PROP-RESUME-03 | `expect(logs).toContain("Wave 1/3: skipped (wave ledger: waves 1–1 already green)")` — array element equality, transcribed whole. | The shipped whole-string form. It carries no provenance suffix, so this assertion is a control on the suffix rule: if the implementation sprays the token onto every line, this one reds. |
| PROP-RESUME-04 | `expect(phaseDetail(result, "I")).toBe("Waves 2–3 complete, waves 1–1 skipped as previously completed (wave mode, script-owned gate) (provenance: operator-set)")`, and a wave-1 run asserts `.toBe("All 3 waves complete (wave mode, script-owned gate)")` byte-identically. | Whole-string equality both ways. The second half is the control that the `N > 1` condition exists: an unconditional rewrite of the detail reds the wave-1 assertion. |
| PROP-RESUME-05 | Three sequential `main()` runs against one accumulating `writes` array; the third run's banner asserted `startsWith("Resuming at wave 4 of ")` and per-wave skip lines asserted for k = 1,2,3 individually. | This is the **only** oracle that kills the run-relative mutation (TSPEC §5.5 row 3): every single-halt fixture passes under it. The three-leg shape is required — a two-leg fixture cannot distinguish absolute from relative. |
| PROP-RESUME-06 | A wave whose tasks own no changed path: assert `ledgerWrites(writes)` contains a record with `lastGreenWave` equal to that wave, **and** the next run's banner names the next wave. Then re-run with an unrelated commit added and assert the announced resume point is unchanged. | Positive-presence conjunct on both sides: the record is asserted *written*, not merely "no error". The unrelated-commit leg is what falsifies a regression to commit archaeology. |
| PROP-DISREGARD-01 | `expect(new Set(Object.keys(WAVE_IGNORE_REASONS))).toEqual(new Set([...seven transcribed literals]))`. | Set equality, so both a deletion and an addition red. Transcribed from TSPEC §3.1, never read back out of the module. |
| PROP-DISREGARD-02 | For each code, `expect(logs).toContain(<transcribed whole notice>)` plus `expect(dispatchedTaskIds(record)).toEqual(["T1","T2","T3"])`. | The dispatch conjunct is the positive half: a notice with no run behind it would otherwise pass. Each reason sentence is a literal — building it from `WAVE_IGNORE_REASONS` would be rule 1's echo. |
| PROP-DISREGARD-03 | `expect(logs.some(m => m.includes("wave ledger"))).toBe(false)` **and** `expect(dispatchedTaskIds(record)).toEqual(["T1","T2","T3"])` **and** `expect(logs.some(m => m.startsWith("Resuming at wave"))).toBe(false)`. | Silence alone is unfalsifiable — a pipeline that crashed before Phase I is also silent. The dispatch-list equality is the positive conjunct that makes it a real oracle. |
| PROP-DISREGARD-04 | `expect(parseWaveLedger(x)).toEqual({state: null, reason: null})` for `x` ∈ `null`, `""`, `"{}"` — three transcribed literals, deep equality on the whole return. | Deep equality on the return, not `state === null` alone: a change that made `{}` fall through to IG-1 would set `reason` and red here. This is where IG-6's membership in REQ-WVR-02's closed six lives. |
| PROP-DISREGARD-05 | Three `expect(parseWaveLedger(fixture)).toEqual({state: null, reason: "<exact shipped sentence>"})`. | Shipped sentences are reused as renderers precisely so no shipped assertion changes; asserting them here is what pins that. |
| PROP-DISREGARD-06 | Unit: `classifyWaveLedger({parsed: <record with unreachable head AND lastGreenWave 9>, waveCount: 3, headOk: false})` → `code === "head-unreachable"`. | The one pair where TSPEC §3.2's order diverges from the REQ's IG numbering. A fixture failing only one guard cannot detect a reordering. |
| PROP-DISREGARD-07 | `expect(gitCalls.filter(a => a[0] === "merge-base")).toEqual([])` on the feature-mismatch and plan-changed fixtures; `.toEqual([["merge-base","--is-ancestor",HEAD_SHA,"HEAD"]])` on the ancestry fixture. | `toEqual`, never `toContainEqual`: the shipped ancestry test's `toContainEqual` passes under the eager-probe mutation. The zero-arm and the exactly-one arm are a matched pair — the zero-arm alone would pass if the probe were deleted outright. |
| PROP-DISREGARD-08 | Well-formed record with `head` omitted: `expect(gitCalls.filter(a => a[0] === "merge-base")).toEqual([])` **and** the resume banner present. | Absence of a probe paired with a positive behavioural conjunct, so "the run died early" cannot pass. |
| PROP-DISREGARD-09 | Two arms — no transport, and a transport whose `merge-base` call throws — each asserting the resume banner is present and `dispatchedTaskIds` equals the resumed subset. | Fail-open is asserted **positively** (the record was honoured), never as "no ignore notice appeared". |
| PROP-DISREGARD-10 | Over all eight fixtures, `expect(result.outcome).toBe("success")`. | A single shared assertion across the whole fixture table, so a new ignore path that halts cannot slip in behind a per-code test that only checks its own notice. |
| PROP-DISREGARD-11 | One table-driven case over TSPEC §2.4's six rows; the **set** of rows observed to announce asserted equal to the five announcing rows transcribed from that table, with the IG-6 row asserting silence per PROP-DISREGARD-03. | Set equality over the announcement table means a deleted announcement reds *here* rather than depending on some other property happening to name it. |
| PROP-SKIP-01 | Counting spies: `expect(dispatchedTaskIds(record)).toEqual([])` for the wave loop **and** a gate-invocation counter equal to the V-wave's one call; `expect(logs.some(m => m.startsWith("Skipping Phase I (wave ledger"))).toBe(true)` and that banner contains `to force a full run`. | Zero-count assertions are paired with PROP-SKIP-03's positive conjunct. Without the pairing, a pipeline that never reached Phase I would pass. |
| PROP-SKIP-02 | `expect(row.status).toBe("⏭")` and `expect(row.detail).toBe("Skipped — all 3 waves previously committed and recorded green (wave ledger) (provenance: automatic)")` — whole-string equality on the transcribed literal. | Whole-string, so deleting the provenance clause from the skip row reds here rather than nowhere. The shipped substring `recorded green (wave ledger)` stays intact because the token goes **outside** the parenthesis. |
| PROP-SKIP-03 | Phase PT: exactly one agent dispatch and exactly one gate invocation, asserted as counts. | The positive conjunct of PROP-SKIP-01 and the oracle for EC-20's "the V-wave replays". |
| PROP-SKIP-04 | `expect(gitCalls.filter(a => a[0] === "add").flat()).toEqual([])` — flattened exactly as PROP-REPO-03 flattens, so a multi-pathspec `add` cannot hide behind `a[2]` and an `add -A` cannot read as `undefined`. Paired **in the same test** with two positive assertions on live seams: `expect(gitCalls).toContainEqual(["rev-parse", "--abbrev-ref", "HEAD"])` — every run issues exactly this argv through `ensureFeatureBranch`'s `readHeadBranch` (`origin/main:pdlc/workflows/orchestrate-dev.js`, `main()`'s `await ensureFeatureBranch({ feature: featureName, _git: gitFn, _log: emit })`) — and, on the shipped `makeAgent(record)` double, `expect(record.filter(c => c.skill === "se-implement").map(c => c.prompt.split("\n")[0])).toEqual([<the V-wave `propertiesTestPrompt` first line>])`, which is also `expect(dispatchedTaskIds(record)).toEqual([])` because that prompt matches no `Implement task (T\d+):`. | `[]` alone cannot distinguish "the wave loop committed nothing" from "the git double was never wired", so the empty-list claim is carried by the live-seam and single-dispatch conjuncts beside it (rule 2). The dispatch conjunct is what REQ-WVR-08 actually wants observed: no wave task's work ran, and the only thing that did run was the V-wave. |
| PROP-OVERRIDE-01 | `logs.filter(m => m.startsWith("Resuming at wave 2 of 3 (implementation.startWave)"))` has length 1 and that element ends with ` (provenance: operator-set)`; `expect(logs.some(m => m.includes("was ignored"))).toBe(false)`. | The token is asserted **on the named announcement**, per AT-05's TE F-05 clause. A token found anywhere else does not satisfy the property. |
| PROP-OVERRIDE-02 | Whole-array equality of the two runs' `logs`, plus equality of the Phase I report row, plus the positive conjunct (banner present with ` (provenance: automatic)`, `dispatchedTaskIds` equal to `["T2","T3"]`). | Whole-array equality alone would be satisfied by two equally-broken runs — for instance two runs that both degraded to the self-report gate. Both fixtures therefore carry `testCommand`, and the positive conjunct pins that the record was honoured in both. |
| PROP-OVERRIDE-03 | Past-the-end notice asserted as a transcribed element ending ` (provenance: operator-set)`; `dispatchedTaskIds` equals the whole plan; `expect(logs.some(m => m.includes("skipped (implementation.startWave"))).toBe(false)`; `expect(readCalls.filter(p => p === WAVE_STATE_PATH)).toEqual([])`. | The read-call assertion is what makes "the record was suppressed" observable — outcome alone cannot distinguish suppression from a record that happened to be absent. |
| PROP-OVERRIDE-04 | (i) `toContain("to force a full run")` on both banners; (ii) the same fixture with `ledger` omitted resolves outcome (a) — asserted as the full dispatch list; (iii) `expect(new Set(Object.keys(IMPLEMENTATION_DEFAULTS))).toEqual(new Set(["testCommand","postWaveCommand","postWavePathspecs","startWave"]))`. | (iii) is what makes "no config value can force a full run" falsifiable: a `forceFullRun` key added later reds the set equality instead of quietly shipping. |
| PROP-OVERRIDE-05 | `expect(logs.filter(m => m.includes("is not a valid value — using the default."))).toHaveLength(1)` and that element `.not.toContain("provenance:")`. | A negative asserted **on a positively-located line** — the notice must be present *and* token-free, so a run that never emitted it cannot pass. |
| PROP-SAFETY-01 | With H-1's `events` array supplied, **first** the shape precondition — `expect(events.some(e => e[0] === "git")).toBe(true)` and `expect(events.some(e => e[0] === "runCommand")).toBe(true)` — **then** the ordering claim: the index of the first `["runCommand", <testCommand>]` event is less than the index of the first `["git", "commit", ...]` event, asserted per fixture. | Two independent call logs cannot express interleaving; H-1 exists for exactly this oracle. A "gate was called" count would pass under a commit-then-gate reordering. The both-axes precondition is what stops the ordering claim from being trivially satisfied by a one-axis `events` array: an unwired seam reds on the precondition instead of passing an ordering assertion over a list that only ever had `runCommand` entries in it (SE F-03). |
| PROP-SAFETY-02 | `expect(new Set(RESUME_OUTCOMES)).toEqual(new Set(["full-run","resume","skip-phase"]))` plus three fixtures each resolving one outcome and announcing it. | Set equality plus a witness per member: the set alone could be satisfied by a catalogue no code path reaches. |
| PROP-SAFETY-03 | Eight table-driven unit cases, one per guard row of TSPEC §3.2, each asserting the whole returned decision object with `toEqual` against a transcribed literal. | Whole-object equality catches a decision that gets the outcome right and the `code`, `startWave` or `silent` flag wrong — a per-field assertion would not. |
| PROP-SAFETY-04 | `expect(new Set(RESUME_PROVENANCE)).toEqual(new Set(["operator-set","automatic"]))`, and over the eight guard rows every returned `provenance` is `"automatic"`. | The "never `operator-set` from the classifier" half is asserted over the full guard table, not on one row. |
| PROP-RECORD-01 | `expect(ledgerWrites(writes)).toEqual([])` on the no-transport run, **paired** with the positive conjunct that all gates passed (`runCommand` call count equals the wave count) and that the next run's dispatch list starts at that same wave. | The empty-writes assertion alone is absence-only; the gate-count conjunct is what proves the run got far enough to have recorded something had the guard been wrong. This is the only oracle that kills "move the write outside the transport branch" (TSPEC §5.5 row 2). |
| PROP-RECORD-02 | The same fixture **with** a transport, run twice — once with `testCommand` present (script-owned gate) and once without (self-report gate) — asserting `ledgerWrites(writes)` is non-empty and records the expected `lastGreenWave` in both. | Two gate modes is the discriminator: a single-mode companion cannot distinguish "guarded by the transport" from "guarded by the gate mode", which is the misreading REQ §1 records. |
| PROP-RECORD-03 | On the H-1 event sink, the same both-axes-present precondition PROP-SAFETY-01 asserts (`events` carries at least one `"git"` entry **and** at least one `"runCommand"` entry) is asserted first; then, for each recorded wave, the index of that wave's `writeFile` event exceeds the index of its last `["git","commit",...]` event. | Ordering, not membership. "Both happened" passes under a write that precedes the commit, which is the shape REQ-WVR-09 forbids — and an ordering claim over a sink that never received a `git` event is vacuous in the same way, which the precondition forecloses (SE F-03). |
| PROP-RECORD-04 | Parsed `lastGreenWave` of each written record equals the plan-absolute wave number, asserted against transcribed integers over the three-leg sequence of PROP-RESUME-05. | Single-leg fixtures agree under the run-relative mutation; only the third leg diverges. |
| PROP-RECORD-05 | H-2 `failWriteOn` matching every call: `logs.filter(m => m.startsWith("Notice: could not record wave "))` length equals the wave count; `expect(result.outcome).toBe("success")`; the next run's dispatch list is the whole plan. | Notice **count** equals wave count, not "at least one" — a single swallowed failure would otherwise pass. |
| PROP-RECORD-06 | H-2 `failWriteOn(path, callIndex)` scripted to succeed on wave 1 and throw on wave 3: assert one notice, `outcome === "success"`, and that the next run resolves outcome (b) at wave 2. | The discriminator against an implementation that discards the whole record on any write failure — arm 1 alone cannot see that bug, because both behaviours end in a full run. |
| PROP-RECORD-07 | With a transport answering `rev-parse HEAD`: the written bytes parse to an object whose `head` equals the transcribed sha. With a transport that cannot answer: the parsed key set excludes `head` entirely, and a reader fixture built from those bytes is honoured. | Positive on both branches — `formatWaveLedger`'s two shapes are a real branch (TSPEC §5.6), and asserting only the presence branch leaves the omission branch uncovered. |
| PROP-RECORD-08 | `expect(formatWaveLedger("f","3fa91c07",4,"4f0c…")).toBe(<transcribed whole string, trailing newline included>)` and the same for the no-`head` shape. | Whole-string with the terminal `\n`, so indentation drift or a lost newline reds. `version: 1` is pinned here rather than by a field-read test, per TSPEC §5.6. |
| PROP-RECORD-09 | `expect(new Set(Object.keys(JSON.parse(written)))).toEqual(new Set(["version","feature","planHash","lastGreenWave","head"]))` (and the four-key set for the no-`head` shape). | Set equality is what makes "the record carries no provenance field" falsifiable; a `toMatchObject` shape assertion would pass with an extra field present. |
| PROP-RECORD-10 | Gate scripted red on wave 1: `expect(ledgerWrites(writes)).toEqual([])`, `expect(result.outcome).toBe("halted")` with `haltReason` containing `Wave 1 test gate failed`, then a second run asserted against PROP-DISREGARD-03's silent-full-run oracle. | Two legs, because the first leg's empty-writes assertion is absence-shaped on its own; the second leg is the positive conjunct that the absence *meant* a fresh run rather than a lost record. |
| PROP-PARITY-01 | Assert `orchestrate-queue`'s delegation resolves to `orchestrate-dev`'s exported default — the module's `_runPipeline` is not overridden anywhere on the default path. | Structural by necessity (DEC-WVR-07): injecting `_runPipeline` would replace the very thing under test. |
| PROP-PARITY-02 | `expect(Object.keys(arg)).toEqual(["reqPath"])` against a delegation spy. | `toEqual` on the key array, so an extra forwarded key — a `startWave`, a ledger-path override — reds. |
| PROP-PARITY-03 | The direct run's `_readFile` call list filtered to the ledger path compared for **string equality** against `WAVE_STATE_PATH`. | Pins the one thing both paths share. What it does **not** prove is stated in § Gaps, not implied by silence. |
| PROP-PARITY-04 | Mutate the queue to forward one additional key; observe PROP-PARITY-02 red while PROP-RESUME-01 … PROP-OVERRIDE-01 stay green; revert; paste the failure header into the task report. | A characterisation net that has never been shown to fail is indistinguishable from a net that cannot fail. |
| PROP-REPO-01 | (i) `expect(lines).toContain("/.claude/pdlc-wave-state.json")` — element equality over `.gitignore`'s lines; (ii) `expect(matched.startsWith("/")).toBe(true)` asserted on that matched line; (iii) `git check-ignore -v .claude/pdlc-wave-state.json` output parsed and its rule field asserted equal to that same line. | Three conjuncts, falsifiable in both directions. `some(l => l.includes(...))` would be satisfied by an **unanchored** rule that also reaches the checked-in fixture trees — which is the failure the anchor exists to prevent, so the weaker matcher is forbidden. |
| PROP-REPO-02 | Parse this feature's PLAN §3.3 manifest and the `implementation.postWavePathspecs` value; assert `WAVE_STATE_PATH` appears in neither — a finite check by name over a finite document. | Finite and mechanical. The **general** claim (no PLAN may ever own consumer-local state) is unfalsifiable per-feature and is routed to Phase P (§ Gaps, **G-5**). |
| PROP-REPO-03 | Across a full run, `expect(gitCalls.filter(a => a[0] === "add").flat()).not.toContain(".claude/pdlc-wave-state.json")`, paired with the positive conjunct that the expected wave pathspecs **are** in that list. | The negative is paired with a positive-presence assertion on the same list, so an empty list cannot satisfy it. |
| PROP-REPO-04 | Read `docs/_constraints/pdlc-wave-gate-baseline.md`: assert `M-WVR-1` and `M-WVR-2` are present with a Measured-by cell each; assert the `Version` cell parses to a version strictly greater than the one recorded in the PLAN as found (`1.2 · 2026-08-20`); assert the new section's text contains the `M-WG-6` reviewed-and-left statement. | Strictly-greater rather than equal to a fixed number: pinning `1.3` would silently downgrade the file if it has moved again by promotion time, which is the baseline's own control rule. |
| PROP-REPO-05 | Two arms through the A6 seam: green-after-remediation asserts the wave's commits **and** its record write; failed remediation asserts the identical halt reason **and** that the last written record still names the wave below. | Both arms assert on the record, not merely on the halt — "composes without coordination" is otherwise an absence claim about an interaction. |
| PROP-LAW-01 | `fc.assert(fc.property(genFeature, genHash, genWave, genHeadOrNull, …), { numRuns: 500 })` with a deep-equality assertion on the round trip. | Generators bounded: `feature`/`planHash` non-empty strings, `lastGreenWave` an integer in `[1, 10_000]`, `head` either a 40-hex string or `null`. Bounding is what keeps the law about normalisation drift rather than about generator exhaustion. |
| PROP-LAW-02 | `fc.assert(fc.property(fc.anything().map(v => …), …), { numRuns: 500 })` asserting no throw and shape membership in the three §4.2 shapes. | The input space deliberately includes non-strings and arbitrary JSON — the mechanical form of a claim that is today a doc comment carried by three hand-picked inputs. |
| PROP-LAW-03 | `fc.assert(fc.property(genClassifyInput, …), { numRuns: 500 })` asserting `RESUME_OUTCOMES.includes(outcome)`, `RESUME_PROVENANCE.includes(provenance)` and the `code` membership. | The generator must reach all three `ParsedWaveLedger` shapes, not only the well-formed one; a generator that only produces valid records makes the law vacuous on the arms that matter. |
| PROP-LAW-04 | `fc.assert(fc.property(genWaveLayoutPair, …), { numRuns: 500 })` asserting `computePlanHash(a) !== computePlanHash(b)` over pairs differing in wave order, task ids, assignment or owned paths. | The suite states the caveat in its own preamble: FNV-1a over 32 bits is not injective, so a generated collision is a finding about the corpus, not a failed law. |
| PROP-COV-01 | `npm run test:coverage` exits 0, **and** the stage-2 per-file branch number for `orchestrate-dev.js` read out of that run is `>= 85` and `>= 88.75` (the 2026-08-23 baseline recorded in § 11), pasted into the task report. | A floor plus a measured baseline, so the property is a module-level regression guard rather than an unquantified re-assertion of the threshold. It is explicitly **not** the feature's own coverage oracle — see PROP-COV-02 — and it is scoped to the single included module the feature edits, so an inherited red elsewhere is a blocked task, not a softened property. |
| PROP-COV-02 | c8's per-file uncovered-line list for `orchestrate-dev.js` is reported and asserted to intersect none of this feature's introduced line ranges, against PLAN §4.5.1's mapping table; the table's completeness is asserted as set equality over its five branch classes. | `orchestrate-dev.js` is 16,336 lines at `origin/main` and this feature adds ~20 branches — about one percent of the denominator — so **every** new branch could be uncovered and PROP-COV-01 would still pass. Completeness of the map, not a percentage, is the checkable thing. |
| PROP-COV-03 | For each of the four mutations: apply in the working tree, run only the named oracle's file, paste the failure header into the task report, `git checkout --` the file. Nothing is committed in the mutated state. | An asserted mutation is a prediction; a run one is evidence. Row 4 (eager probe) is the one that most needs it: it is invisible to every behavioural assertion and is killed only by PROP-DISREGARD-07's `toEqual`. |

### Mutation → oracle map

Four mutations, each with the property that must red and the task that must **run** it
(PLAN §4.3, TSPEC §5.5):

| Mutation | Property that must red | Applied and observed by |
|---|---|---|
| Delete the ancestry guard | PROP-DISREGARD-01 (the `head-unreachable` code disappears from the set) **and** PROP-DISREGARD-07/-09 | unit half T-02, integration half T-07 |
| Move the record write outside the `if (waveGit)` transport branch | PROP-RECORD-01 (`ledgerWrites(writes)` no longer empty) | T-07 |
| Record a run-relative wave number instead of the plan-absolute one | PROP-RESUME-05 / PROP-RECORD-04 only | T-07 |
| Resolve the ancestry probe eagerly for every well-formed record | PROP-DISREGARD-07 and PROP-DISREGARD-08, and only because they use `toEqual` on the filtered call list | T-07 |


## Fixtures

### Reuse, do not reinvent

The shipped ledger `describe` in `pdlc/workflows/__tests__/waveExecution.test.js` already carries
the harness this feature needs, and it is reused rather than rebuilt. All four helpers resolve at
`origin/main` (`git show origin/main:pdlc/workflows/__tests__/waveExecution.test.js`):

| Helper | Role | Located by |
|---|---|---|
| `makeLedgerArgs` | builds a full `main()` argument set for the ledger cases; its `ledger` option **is the raw byte string** the `WAVE_STATE_PATH` read returns, which is why every one of the seven codes is expressible as a fixture | `function makeLedgerArgs({` |
| `ledgerWrites` | filters a captured `writes` array to the ledger path | `const ledgerWrites = (writes) =>` |
| `PLAN_THREE_WAVES` | the three-wave, three-task plan every ledger case runs against (`T1`, `T2`, `T3` owning `src/one.js`, `src/two.js`, `src/three.js`) | `const PLAN_THREE_WAVES = [` |
| `CONFIG_WITH_TEST_COMMAND` | the config that makes `scriptGate === true`, so no case is silently graded by a self-report gate | `const CONFIG_WITH_TEST_COMMAND = JSON.stringify({` |

The enclosing suite is `describe("Phase I — the INTERIM wave ledger resumes a halted run
unattended")`; the fingerprint block this feature extends in place is
`describe("computePlanHash — the ledger's plan fingerprint")`. **Neither is duplicated**: the
`computePlanHash` block already carries a determinism arm and three sensitivity arms, and the only
arm this feature owes it is hashing the same PLAN *text* twice through
`parsePlanTasks`/`computeWaves`.

### The two harness extensions this feature owns

Both are **additive and default-off**: with neither option supplied, `makeLedgerArgs` returns
exactly what it returns today, which is what keeps the shipped `describe` a regression net
(TSPEC RT-2).

| # | Extension | Consumed by |
|---|---|---|
| H-1 | Optional `events` array. `makeLedgerArgs` owns no doubles of its own — its `git` and `runCommand` are **caller-supplied parameters**, spread in conditionally (`...(git ? { _git: git } : {})`), with `git` having no default at all and `runCommand` defaulting to a green stub. H-1 therefore **wraps** whichever double the caller passed: when `events` is supplied, each seam is replaced by a wrapper that appends `["runCommand", cmd]` / `["git", …argv]` to `events` and then delegates to the caller's double (or, on the git axis with no caller double, records the call and returns a green result), leaving that double's own log unchanged. Wrapping, not owning, is what keeps the extension a single change to `makeArgs` and keeps the git axis instrumented in the cases that pass no `git`. | PROP-SAFETY-01, PROP-RECORD-03 |
| H-2 | Optional `failWriteOn(path, callIndex)` predicate over the `_writeFile` double; the default keeps today's always-capture behaviour. | PROP-RECORD-05, PROP-RECORD-06 |

### Ledger fixtures — one per reason code, plus the honoured shapes

The `ledger` option's value, verbatim. Confirmed reachable through `main()` against the shipped
reader (`export function parseWaveLedger` at `origin/main:pdlc/workflows/orchestrate-dev.js:12267`).

| Code / shape | `ledger` value | Why it lands there |
|---|---|---|
| IG-6 (silent) | option omitted, `""`, or `"{}"` | `parseWaveLedger` returns `{state: null, reason: null}` for all three — the `text == null`, `trimmed === ""` and `trimmed === "{}"` arms |
| `unreadable-json` | `"{"` | `JSON.parse` throws → `"it is not readable JSON"` |
| `not-an-object` | `"\"x\""` (or `"[]"`) | parses to a string/array → `isPlainObject` false → `"it is not a JSON object"` |
| `wrong-shape` | `{version:1, feature: FEATURE, planHash: <this plan's>, lastGreenWave: "1"}` | `lastGreenWave` is not an integer → the shipped `wellFormed` conjunction fails |
| `feature-mismatch` | well-formed, `feature: "other-feature"` | guard 3 |
| `plan-changed` | well-formed, `planHash: "00000000"` | guard 4 |
| `head-unreachable` | well-formed for this plan, `head: HEAD_SHA`, `_git` scripted to answer `merge-base --is-ancestor` with `{ok: false}` | guard 5, exactly one probe |
| `over-count` | well-formed for this plan, `lastGreenWave: 9`, **`head` omitted** | guard 6 — with no `head`, `headCorroborated` returns `true` without touching the transport, so guard 5 passes and guard 6 is the first failure |
| honoured, mid-plan | the wave-1 record written by a first run, taken from `ledgerWrites(firstWrites)[0]` | outcome (b) |
| honoured, complete | the record with `lastGreenWave === 3`, taken from a completed first run | outcome (c) |
| honoured, no `head` | well-formed for this plan, `head` omitted | outcome (b) with zero `merge-base` calls (PROP-DISREGARD-08) |

**The `over-count` row is the one that needs care.** With a `head` present *and* unreachable,
guard 5 fires first — that is the PROP-DISREGARD-06 pair, not an `over-count` fixture. Omitting
`head` is what makes the fixture exercise the guard it names.

**Records are produced by a real first run wherever possible**, not hand-built: `makeLedgerArgs`
already models the write path, so the mid-plan and complete fixtures are captured envelopes
(`ledgerWrites(firstWrites)[0]`) rather than synthetic JSON. Hand-built literals are used only for
the rejection fixtures, where the point *is* that the bytes are not something this workflow wrote.

### Config fixtures

| Fixture | Value | Used by |
|---|---|---|
| `CONFIG_WITH_TEST_COMMAND` | shipped | every integration property, so `scriptGate === true` in all of them |
| `configWithStartWave(n)` | shipped | PROP-OVERRIDE-01 (`2`), PROP-OVERRIDE-03 (`99`) |
| `startWave: 1` **present** vs. the key **omitted** | two variants of `CONFIG_WITH_TEST_COMMAND`, differing in exactly one key | PROP-OVERRIDE-02 — both must carry `testCommand`, so neither run degrades to the self-report gate |
| config with an **invalid** `startWave` (e.g. `"two"`) | one variant | PROP-OVERRIDE-05, the excluded notice |
| no `testCommand` | one variant | PROP-RECORD-02's self-report-gate arm only — never as the default for any other property |

### Queue fixtures (two required, and the one that is not)

Two fixtures are load-bearing; without either, `orchestrate-queue` returns before the delegation
seam PROP-PARITY-01…04 read, which is a vacuous pass rather than a failure:

1. a `QUEUE.md` table with exactly one `pending` row for this feature and **no** `in-progress` row —
   an `in-progress` row short-circuits `selectNextPending` to `{ kind: "blocked-active" }` and
   `runQueue` returns `outcome: "blocked"` before any candidate is triaged, and a table whose only
   rows are `done`/`awaiting-merge`/`blocked`/`halted` returns `outcome: "idle"` for the same reason
   (`origin/main:pdlc/workflows/orchestrate-queue.js`, `selectNextPending` and the `blocked-active`
   / `empty` arms of `runQueue`'s selection block);
2. a Phase-0 readiness-triage `_agent` double whose last line is `TRIAGE: ready` — the queue reads
   that verdict with `/^TRIAGE:\s*(ready|blocked|needs-human)\b/` and escalates anything else.

**A `.claude/pdlc.config.json` carrying `distribution.checkEnabled: false` is *not* required, and
earlier drafts of this section were wrong to say it was.** The distribution drift gate that opt-out
addressed has been retired from `orchestrate-queue.js`: `git grep parseDistributionCheckEnabledOptOut
origin/main` resolves only inside `docs/completed/**`, and `orchestrateQueue.test.js` now asserts the
module's own source contains neither `"distribution" + ".checkEnabled"` nor `"DRIFT_STATE" + "_PATH"`.
The fixture is inert rather than harmful, so it may be supplied or omitted; what it must not do is
carry the *reason* the fixture set is complete. This premise is inherited from TSPEC §5.4 AT-16 and
PLAN T-04 and is routed upstream as an erratum rather than corrected there from here.

The queue properties therefore assert `expect(result.outcome).toBe(<the outcome the case expects>)`
positively — never merely `!== "blocked"` — so a fixture regression that returns `blocked` or `idle`
reds on the outcome value itself instead of silently emptying the delegation assertions.

### Generative generators (PROP-LAW-01…04)

| Generator | Bounds | Why bounded |
|---|---|---|
| `genFeature`, `genHash` | non-empty strings, length ≤ 64, no leading/trailing whitespace | `parseWaveLedger`'s `wellFormed` requires non-empty after `trim()`; whitespace-only draws would test the rejection arm, which PROP-DISREGARD-05 already owns |
| `genWave` | integer in `[1, 10_000]` | the reader requires `Number.isInteger` and `>= 1`; the upper bound keeps the corpus finite without changing the law |
| `genHeadOrNull` | 40-hex string, or `null` | matches what `formatWaveLedger` writes and what `parseWaveLedger` normalises; blank and non-string draws are pinned by unit cases instead |
| `genClassifyInput` | must reach **all three** `ParsedWaveLedger` shapes and both `headOk` values | a generator producing only well-formed records makes PROP-LAW-03 vacuous on exactly the arms that matter |
| `genWaveLayoutPair` | ≤ 6 waves, ≤ 6 tasks per wave, ids and paths from a small alphabet | keeps the corpus small enough that a 32-bit collision is diagnosable as a corpus finding rather than a flake |

Run depth: `fc.assert(fc.property(…), { numRuns: 500 })` for all four laws, no pinned seed, one
`describe` per subject with the law named in the title (`ROUND-TRIP:`, `TOTALITY:`). The precedent
is `pdlc/workflows/__tests__/advisoryHelperProperties.test.js`, whose
`describe("PROP-CTR-05 (generative): citesGateOutput …")` block declares `const runs = { numRuns:
500 }` and applies it at five `fc.assert` sites. **Note the divergence, and it is routed rather
than resolved here:** TSPEC §5.7's convention paragraph says "at fast-check's default run count",
while PLAN T-08 and PLAN §4.5 pin 500 on that same precedent. This document follows the PLAN;
the TSPEC clause is raised as an erratum.

### String and fixture ownership

Every announcement, report detail and reason sentence asserted anywhere in this document is
transcribed **verbatim from TSPEC §2.4 / §3.1** into the test as a literal. Where TSPEC §2.4 gives
a template (`Waves N–M complete, …`), the test transcribes the *instantiated* string for its
fixture — `Waves 2–3 complete, waves 1–1 skipped as previously completed (wave mode, script-owned
gate) (provenance: operator-set)` — never a template rebuilt at runtime from the same interpolation
the implementation performs. The en-dash in `Waves 1–1` and in `waves 1–1 already green` is the
shipped character (U+2013), verified in
`git show origin/main:pdlc/workflows/orchestrate-dev.js`; a hyphen-minus substitution is a silent
whole-string mismatch and is called out here because it is the cheapest way to fail these
properties for the wrong reason.


## Coverage Matrix

### FSPEC acceptance tests → properties (all 18, plus the four laws)

| FSPEC AT | Properties | Owning task |
|---|---|---|
| AT-01 automatic resume at the failed wave | PROP-RESUME-01, -02, -03, -04 | T-07 |
| AT-02 disregard catalogue complete and closed | PROP-DISREGARD-01, -02, -03, -04, -05 | T-02 (unit), T-07 (integration) |
| AT-03 ordering of disregard causes | PROP-DISREGARD-06, -07 | T-02 (unit), T-07 (call counts) |
| AT-04 verification independence | PROP-SAFETY-01 | T-07 |
| AT-05 operator override wins | PROP-OVERRIDE-01 | T-07 |
| AT-06 pointer at default is not a setting | PROP-OVERRIDE-02 | T-07 |
| AT-07 pointer past the end | PROP-OVERRIDE-03 | T-07 |
| AT-08 the hatch is named, and is the only one | PROP-OVERRIDE-04 | T-07 (i)(ii), T-02 (iii) |
| AT-09 verified-but-uncommitted is never completed | PROP-RECORD-01, -02 | T-07 |
| AT-10 a no-change wave is still completed | PROP-RESUME-06 | T-07 |
| AT-11 ancestry is falsification, not archaeology | PROP-DISREGARD-07, -08, -09 | T-07 |
| AT-12 complete record skips the wave loop in full | PROP-SKIP-01, -02, -03, -04 | T-07 |
| AT-13 outcome catalogue closed at three | PROP-SAFETY-02, PROP-DISREGARD-11 | T-02 (set equality), T-07 (closure) |
| AT-14 the record never becomes tracked content | PROP-REPO-01 (repo-state), PROP-REPO-03 (run-side) | T-03, T-07 |
| AT-15 failed writes are notices, bounded | PROP-RECORD-05, -06 | T-07 |
| AT-16 queue parity | PROP-PARITY-01, -02, -03, -04 | T-04 |
| AT-17 advisory remediation composes | PROP-REPO-02 (manifest), PROP-REPO-05 (integration) | T-03, T-07 |
| AT-18 completion accumulates across invocations | PROP-RESUME-05, PROP-RECORD-04 | T-07 |
| P-1 … P-4 (TSPEC §5.7) | PROP-LAW-01 … -04 | T-08 |

No AT is without a property, and no property is without an AT, a business rule, an edge case or a
PLAN obligation. The three properties with no FSPEC AT of their own — PROP-PRE-01/-02 and
PROP-COV-01/-02/-03 — trace to PLAN T-01, RT-7 and PLAN §4.3 respectively, which is where those
obligations are owned.

### REQ acceptance criteria → properties

| REQ criterion | Properties |
|---|---|
| REQ-WVR-01 automatic resume at the failed wave | PROP-RESUME-01, -02, -03, -04 |
| REQ-WVR-02 fresh runs and foreign state unaffected | PROP-DISREGARD-01 … -11 (the IG-1..6 set-equality obligation is PROP-DISREGARD-01 + -04) |
| REQ-WVR-03 verification independence | PROP-SAFETY-01, PROP-RECORD-03, PROP-SKIP-04 |
| REQ-WVR-04 operator override precedence | PROP-OVERRIDE-01 … -05 |
| REQ-WVR-05 retention with invalidation | PROP-DISREGARD-02 (feature-mismatch, plan-changed rows), -06, -07; PROP-SKIP-01 (retention past a completed Phase I) |
| REQ-WVR-06 completion is never commit presence | PROP-RESUME-06; carve-out: PROP-DISREGARD-07, -08 |
| REQ-WVR-07 unattended queue parity | PROP-PARITY-01 … -04 |
| REQ-WVR-08 all waves recorded ⇒ Phase I skipped in full | PROP-SKIP-01 … -04 |
| REQ-WVR-09 verified-but-uncommitted never recorded | PROP-RECORD-01, -02, -03, -10 |
| REQ-WVR-10 the record never becomes tracked content | PROP-REPO-01, -03 |
| C-1 consumer-local state | PROP-REPO-01, -02 |
| C-2 fail open, never halt | PROP-DISREGARD-09, -10; PROP-RECORD-05, -06 |
| C-3 no new runtime capabilities | PROP-OVERRIDE-04 (iii), PROP-SAFETY-03 |
| G-2 correctness independent of the record | PROP-SAFETY-01, PROP-SKIP-04 |

REQ-WVR-05's "honest cost" clause asks that the feature key, PLAN hash and ancestry checks be
treated as the **highest-value oracles**. They are the three carrying the most conjuncts in this
document: the feature-key and plan-hash arms each get a unit guard row (PROP-SAFETY-03), an
integration notice (PROP-DISREGARD-02), a zero-probe call-count control (PROP-DISREGARD-07) and a
generative totality law (PROP-LAW-03); ancestry additionally gets PROP-DISREGARD-06's ordering
pair, -08's no-`head` arm, -09's fail-open pair, and a mutation run (PROP-COV-03 row 1).

### FSPEC business rules → properties

| BR | Properties | | BR | Properties |
|---|---|---|---|---|
| BR-01 | PROP-SAFETY-02, PROP-LAW-03 | | BR-10 | PROP-SAFETY-01 |
| BR-02 | PROP-DISREGARD-01, -03 | | BR-11 | PROP-SKIP-01, -03, -04 |
| BR-03 | PROP-DISREGARD-06 | | BR-12 | PROP-DISREGARD-10 |
| BR-04 | PROP-OVERRIDE-01 | | BR-13 | PROP-SKIP-01, PROP-RESUME-05 |
| BR-05 | PROP-OVERRIDE-02, -03 | | BR-14 | PROP-REPO-01, -03 |
| BR-06 | PROP-OVERRIDE-04 | | BR-15 | PROP-RECORD-05, -06 |
| BR-07 | PROP-RESUME-02, PROP-SKIP-02, PROP-OVERRIDE-01, PROP-SAFETY-04 | | BR-16 | PROP-PARITY-01, -02, -03 |
| BR-08 | PROP-RECORD-01, -03, -04, PROP-RESUME-05 | | BR-17 | PROP-OVERRIDE-04 (iii) |
| BR-09 | PROP-RESUME-06, PROP-DISREGARD-07 | | | |

### FSPEC edge cases → properties

| EC | Property | EC | Property |
|---|---|---|---|
| EC-01, EC-02 | PROP-DISREGARD-03, -04 | EC-13 | PROP-RECORD-01 |
| EC-03 | PROP-DISREGARD-02 (three IG-1 arms), -05 | EC-14 | PROP-RESUME-06 |
| EC-04, EC-05, EC-06, EC-08 | PROP-DISREGARD-02 | EC-15 | PROP-RECORD-05 |
| EC-07 | PROP-DISREGARD-09 | EC-15a | PROP-RECORD-06 |
| EC-09 | PROP-SKIP-02 | EC-16 | PROP-REPO-02, -05 |
| EC-10 | PROP-OVERRIDE-01 | EC-17 | *(gap G-2 below — worktree absence is not reproducible in-suite)* |
| EC-11 | PROP-OVERRIDE-03 | EC-18 | *(gap G-1 below — bounded by PROP-SAFETY-01, not directly assertable)* |
| EC-12 | PROP-RECORD-10 | EC-19 | out of scope (TSPEC §5.6) |
| | | EC-20 | PROP-SKIP-03 |
| | | EC-21 | PROP-DISREGARD-08, PROP-RECORD-07 |

### PLAN tasks → properties (every task in PLAN §2.1 is traced)

| PLAN task | Properties it lands | Files |
|---|---|---|
| T-01 pre-flight gate | PROP-PRE-01, -02 | `waveResumePreflight.test.js` *(new)* |
| T-02 pure-unit suite, then the extraction | PROP-DISREGARD-01, -04, -05, -06; PROP-SAFETY-02 (unit half), -03, -04; PROP-OVERRIDE-04 (iii); PROP-RECORD-07 (unit half), -08, -09; PROP-COV-03 (unit half) | `waveResume.test.js` *(new)*, `orchestrate-dev.js` |
| T-03 repo-state suite, then the constraints promotion | PROP-REPO-01, -02, -04 | `waveResumeRepoState.test.js` *(new)*, `docs/_constraints/pdlc-wave-gate-baseline.md` |
| T-04 queue-parity suite | PROP-PARITY-01, -02, -03, -04 | `waveResumeQueueParity.test.js` *(new)* |
| T-07 integration suite, then the announcements | PROP-RESUME-01 … -06; PROP-DISREGARD-02, -03, -07, -08, -09, -10, -11; PROP-SKIP-01 … -04; PROP-OVERRIDE-01, -02, -03, -04 (i)(ii), -05; PROP-SAFETY-01, -02 (integration half); PROP-RECORD-01 … -07, -10; PROP-REPO-03, -05; PROP-COV-03 | `waveExecution.test.js` *(existing)*, `orchestrate-dev.js` |
| T-08 generative property suite | PROP-LAW-01 … -04 | `waveResumeProperties.test.js` *(new)* |
| T-10 coverage floor and delta oracle | PROP-COV-01, -02 | `waveResume.test.js`, `waveExecution.test.js` |

Retired PLAN ids `T-05`, `T-06`, `T-09` appear in no row above: they were merged into their red
predecessors at PLAN v1.1 and are not reused.

### Test files → status

| File | Status | Verified |
|---|---|---|
| `pdlc/workflows/__tests__/waveExecution.test.js` | **exists**, extended in place, never duplicated | `git show origin/main:…` resolves; 2,761 lines |
| `pdlc/workflows/__tests__/waveResume.test.js` | **new** (PLAN T-02) | no match at `origin/main` or in this tree |
| `pdlc/workflows/__tests__/waveResumeRepoState.test.js` | **new** (PLAN T-03) | no match at `origin/main` or in this tree |
| `pdlc/workflows/__tests__/waveResumeQueueParity.test.js` | **new** (PLAN T-04) | no match at `origin/main` or in this tree |
| `pdlc/workflows/__tests__/waveResumeProperties.test.js` | **new** (PLAN T-08) | no match at `origin/main` or in this tree |
| `pdlc/workflows/__tests__/waveResumePreflight.test.js` | **new** (PLAN T-01) | no match at `origin/main` or in this tree; ships permanently, deleted by no task |
| `pdlc/workflows/__tests__/advisoryHelperProperties.test.js` | **exists at `origin/main`**, cited as precedent only — no property lands in it | absent in this tree (pre-rebase), present at `origin/main` |


## Gaps, Risks and Routed Findings

### Gaps — obligations this document knowingly does not cover

**G-1 · EC-18 "stale but passing" is bounded, not asserted.** EC-18 describes a record that survives
every disregard check yet no longer describes the tree — the PLAN is byte-identical, the feature key
matches, and the recorded head is still an ancestor, but the wave's *content* was amended in a way
ancestry cannot see. No property asserts EC-18 directly, because no in-suite fixture can produce a
tree that is simultaneously ancestry-clean and semantically stale without reaching for real git
history. What bounds the risk instead is PROP-SAFETY-01: the gate re-runs on every executed wave and
the run's correctness never depends on the record being accurate, so an EC-18 record costs a skipped
wave, not a wrong result. This is a deliberate residual, and it is the reason REQ-WVR-06 forbids
treating commit presence as completion.

**G-2 · EC-17 (record absent because the worktree is fresh) is covered only in its run-facing half.**
PROP-DISREGARD-03 asserts the silent full run when no record is readable, which is EC-17's observable
consequence. What is not asserted is the *cause* — that a Claude-created worktree does not carry
`.claude/pdlc-wave-state.json` because `.worktreeinclude` does not list it. That is a property of the
consumer's worktree configuration, not of `orchestrate-dev.js`, and asserting it in this suite would
be testing git rather than the feature. Routed to the repo-level worktree decision (D-DIST-07) rather
than fabricated here.

**G-3 · No E2E tier.** `pdlc/workflows` has no end-to-end harness at `origin/main`, and this feature
does not introduce one; `main()`-level integration is the top of the pyramid, exactly as TSPEC §5.1
states. The consequence is honest: nothing in this suite proves that a *real* interrupted pipeline,
resumed by a *real* operator, lands where PROP-RESUME-01 says it lands. The pre-flight properties
(PROP-PRE-01/-02) exist partly to compensate — they assert the shipped constant and the shipped
ignore path in the built artifact, which is the nearest thing to an end-to-end anchor available.

**G-4 · PROP-REPO-01 is expected RED before the rebase.** It asserts `/.claude/pdlc-wave-state.json`
in `.gitignore`, which exists at `origin/main:.gitignore:41` but not in this pre-rebase tree. The
property is written against the post-rebase state and must not be weakened to pass locally; a green
PROP-REPO-01 in this tree would mean the assertion had been softened, which is the failure mode
REQ BL-04 and FSPEC OB-F1 were opened to prevent. Measured on 2026-08-23, this tree is worse than "the ignore
rule is absent": `.claude/pdlc-wave-state.json` and `.claude/pdlc.config.json` are **tracked** here,
and the shipped repo-level oracle already forbids it — `__tests__/documentOracles.test.js`'s
`` `.claude/` machine-local state is untracked and stays untracked (CODE_REVIEW v1 §1-1) `` block
fails on both paths in this tree and passes at `origin/main`. Build artifacts under
`pdlc/workflows/coverage/` are tracked here too and are absent from `origin/main`. Both are pre-rebase
branch state, not feature behaviour; they are reported to the orchestrator rather than fixed from this
document, and they are the reason a local `npm test` in this tree is red in ways PROP-REPO-01 and
PROP-COV-01 must not be softened to accommodate.

**G-5 · "No PLAN may ever own consumer-local state" is asserted for this feature only.**
PROP-REPO-02 parses *this* feature's PLAN §3.3 ownership manifest and its
`implementation.postWavePathspecs` value and asserts `WAVE_STATE_PATH` appears in neither. The
general rule the FSPEC states — that no PLAN, in any feature, may put consumer-local state under a
wave's ownership — is not falsifiable by a per-feature test: a future PLAN authored after this suite
ships could break it without reddening anything here. The compensating control is Phase P review of
each new PLAN, and the routing target for the general claim is that review, not this document. This
gap is what PROP-REPO-02's falsifiability note points at (SE F-05; the note previously pointed at
G-3, which covers the absent E2E tier and is a different obligation entirely).

### Risks in the oracles themselves

**R-1 · Whole-string announcement assertions are brittle by construction.** PROP-RESUME-04,
PROP-SKIP-03 and PROP-OVERRIDE-05 assert exact announcement text, including the U+2013 en-dash in
`Waves 1–1`. That is intentional — an announcement is a contract with the operator and a substring
match would let a truncated or mis-numbered line pass — but it means any copy edit to those strings
is a test change, and a copy edit made with an ASCII hyphen will fail in a way whose diff is hard to
read. The mitigation is in `## Fixtures`: announcement expectations are built from named constants,
so the dash lives in exactly one place per string.

**R-2 · Captured-envelope fixtures can encode a bug as an expectation.** Honoured-record fixtures are
captured from a first run (`ledgerWrites(firstWrites)[0]`) rather than hand-written, which keeps the
record's shape truthful as the writer evolves. The cost is that if the writer emits a wrong record,
the reader's test will faithfully accept it. This is why every *rejection* fixture is a hand-built
literal instead, and why PROP-LAW-01 and PROP-LAW-02 check the round-trip generatively rather than
against captured bytes: the two styles falsify each other.

**R-3 · Call-count controls are absence-shaped.** PROP-DISREGARD-07's "no ancestry probe was
attempted" is proved by a zero call count on the git seam. A zero count is an absence, and absence
oracles pass when the seam is never wired at all. Each such property therefore carries a positive
companion in the same test — an ancestry-dependent code in the same table that asserts a count of
exactly one — so a disconnected seam fails the pair rather than passing the absence.

### Findings routed upstream, not fixed here

Each candidate defect in a document this one derives from was **re-verified against those documents
at HEAD** before being routed, because three of the four raised in this document's first drafting
pass have since been absorbed by their owners and re-raising a settled question is itself a defect
(`docs/_decisions/DECISIONS-review-severity-bars.md`, DEC-ERR-01).

| Candidate | State at HEAD | Routed? |
|---|---|---|
| TSPEC §5.7 leaves the generative run count at "fast-check's default run count" while PLAN T-08 pins `fc.assert(fc.property(…), { numRuns: 500 })` on the same precedent (`advisoryHelperProperties.test.js`) | **Still open.** TSPEC §5.7's closing convention paragraph says *default*; no `numRuns` or `500` appears anywhere in TSPEC. PLAN T-08 pins 500 and says round-1 F-06 required it. | **Yes** — one `ERRATUM: TSPEC` line. |
| TSPEC §5.4 files AT-14 at a level that disagrees with FSPEC | **Closed by the owner.** TSPEC §5.4's AT-14 row now reads `repo-state`, matching FSPEC's `AT-14 — the record never becomes tracked content (REQ-WVR-10)`. | No. |
| PLAN §4.1 inherits an AT-14 mis-filing | **Closed by the owner.** PLAN §4.1 maps `AT-14 → T-03 → waveResumeRepoState.test.js`, and PLAN §3.2 T-03 carries AT-14's three strict conjuncts verbatim. | No. |
| TSPEC §2.4's config-validation treatment of `implementation.startWave` disagrees with §5.4's | **Not reproducible at HEAD.** §2.4's excluded-notice row and §5.4 AT-06 agree that a rejected value is discarded before any resume decision and that `startWave: 1` is indistinguishable from unset; TSPEC v1.2's erratum round names this as the change that closed it. | No. |
| TSPEC §5.4 AT-12's fourth conjunct asserts the V-wave's own commit and a wave-task pathspec list on the `add` argv seam | **Open, and newly raised this round.** At `origin/main` the V-wave block in `orchestrate-dev.js` dispatches `agentFn("se-implement", propertiesTestPrompt(featureName), …)`, calls `evaluateWaveDispatch`, and runs `runCommandFn(implConfig.testCommand)` — it issues no `commitPaths` and no `_git(["add", …])`; the enclosing comment says so in as many words ("the V-wave is the one wave-mode dispatch that still commits its OWN work"), and that commit is made by the dispatched agent, which the `makeAgent(record)` double replaces. So no oracle in this suite can observe it. | **Yes** — one `ERRATUM: TSPEC` line. PROP-SKIP-04 is re-expressed here in the meantime (SE F-01). |
| TSPEC §5.4 AT-16 and PLAN T-04 justify the queue fixture set by the `distribution.checkEnabled` drift gate | **Open, and newly raised this round.** That gate has been retired from `orchestrate-queue.js`: `git grep parseDistributionCheckEnabledOptOut origin/main` resolves only under `docs/completed/**`, and `orchestrateQueue.test.js` asserts the module's source contains neither `"distribution" + ".checkEnabled"` nor `"DRIFT_STATE" + "_PATH"`. The stated reason the three-fixture set is complete is therefore false, though the surplus fixture is inert rather than harmful. | **Yes** — one `ERRATUM: TSPEC` line and one `ERRATUM: PLAN` line. § Fixtures is re-anchored here on the dispositions that still fire (SE F-02). |

**What this document does with the open items.** PROP-LAW-01…PROP-LAW-04 pin `numRuns: 500`,
following PLAN T-08 rather than TSPEC §5.7, because 500 is the depth the cited precedent actually
runs and a law suite that runs 5× shallower than the block it is modelled on is the weaker of the two
readings. `## Fixtures` already records this divergence at its run-depth paragraph and names the
precedent it is measured against, so if the erratum resolves the other way the change is one
run-depth decision applied to four `fc.assert` calls in a single new file, not a redesign.

**AT-14's two-property split is this document's own choice, not a routed defect.** PROP-REPO-01
(repo-state: the ignore rule) and PROP-REPO-03 (run-side: no `add` argv names the record) split
AT-14 because its two conjuncts are falsifiable at different levels and by different fixtures; TSPEC
§5.4 files the AT as a whole at `repo-state` and folds the run-side conjunct into the same row. Both
readings assert the same behaviour, and the split is recorded here only so a reader tracing AT-14
from TSPEC finds two ids rather than one.

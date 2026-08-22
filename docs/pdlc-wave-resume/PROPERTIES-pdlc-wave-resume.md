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

| Level | Properties | Files | Why here |
|---|---|---|---|
| Pre-flight (`P`) | 2 | `waveResumePreflight.test.js` (new, T-01) | the baseline-existence and script-owned-gate gate that must red **before** any dependent wave dispatches |
| Unit — pure (`U`) | 11 | `waveResume.test.js` (new, T-02/T-10) | `classifyWaveLedger`, `parseWaveLedger`, `formatWaveLedger` and the three catalogues are pure and total; every guard arm is cheapest here |
| Unit — generative (`UG`) | 4 | `waveResumeProperties.test.js` (new, T-08) | four laws over a parser, a serialiser, a hash and a total classifier (TSPEC §5.7) |
| Integration — through `main()` (`I`) | 33 | `waveExecution.test.js` (existing, T-07/T-10) | every announcement, report row, dispatch count and written byte lives in `main()`'s Phase I branch and is reachable only through `makeLedgerArgs` |
| Integration — queue (`Q`) | 4 | `waveResumeQueueParity.test.js` (new, T-04) | the delegation boundary, scoped by DEC-WVR-07 |
| Repo-state (`R`) | 3 | `waveResumeRepoState.test.js` (new, T-03) | `.gitignore`, `git check-ignore`, this PLAN's manifest, the promoted `M-WVR-*` facts |
| Coverage / mutation duty (`C`) | 3 | measured by T-10; mutation runs recorded by T-02 and T-07 | the floor and the delta oracle are measured over the complete diff, not per wave |
| **E2E** | **0** | — | there is no E2E tier in `pdlc/workflows`; `main()`-level integration *is* the top of this pyramid, and the budget of 3–5 E2E tests is therefore spent at zero |

**57 properties.** Four carry both a unit and an integration half (PROP-OVERRIDE-04,
PROP-SAFETY-02, PROP-RECORD-07 and — across files — PROP-REPO-02/03), so the level column sums
above 57 by four; every property has exactly one owning task per half.

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
| PROP-COV-01 | `npm run test:coverage` from `pdlc/workflows` (`--per-file --branches 85`) must exit 0, with the measured per-file branch number for `orchestrate-dev.js` recorded in the task report. | Performance | C | RT-7, TSPEC §5.8, PLAN T-10 | T-10 |
| PROP-COV-02 | c8's per-file uncovered-line list for `orchestrate-dev.js` must contain no line inside the ranges this feature introduces, and PLAN §4.5.1's mapping table must be **complete** — every branch class named, every row naming a covering test. A deleted case must fail that table's set equality rather than move a percentage by 0.05. | Observability | C | RT-7, PLAN §4.5.1 (F-05) | T-10 |
| PROP-COV-03 | Each of PLAN §4.3's four mutations must be **applied, observed RED against its named oracle, reverted, and its failure output recorded** in the owning task's report — a believed mutation is not an observed one. | Contract | C | PLAN §4.3 (F-04), TSPEC §5.5 | T-02, T-07 |

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Risks and Routed Findings

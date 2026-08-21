# TSPEC — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.0 |
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

## 1. Overview

This TSPEC discharges FSPEC OB-F2: it **ratifies the shipped interim wave-ledger contract and
formalises it**, rather than inventing a second mechanism alongside it (REQ BL-03, R-4). The
mechanism that implements automatic Phase I wave resume already exists on the default branch,
marked INTERIM in its own comments and deliberately contained so this feature could replace it
cleanly. This document names that contract, states the **delta** between it and the behaviour
FSPEC specifies, and owns the location, encoding, matching procedure and write mechanics the FSPEC
deliberately left unstated (REQ OB-1).

**Nothing here is a new product decision.** Every behavioural clause traces to an FSPEC BR/EC/AT
and thence to a REQ criterion; where the shipped code and the FSPEC disagree, this TSPEC changes
the code, not the spec.

### 1.1 Grounding, and the prerequisite that is not met

REQ BL-04 requires the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` to be
readable in the authoring tree. They are **not**. This branch is 1,637 commits behind the default
branch (`git rev-list --count HEAD..origin/main` → 1637) and contains neither: `grep -n
WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` returns nothing in this tree, and
`docs/_constraints/pdlc-wave-gate-baseline.md` does not exist here.

Every claim below about shipped behaviour is therefore verified against **`origin/main` at
`345ae358`**, by name — exported symbol, function name, comment text or config key, per DEC-DOC-01
— so that it re-verifies after the rebase that OB-F1 owes. Commands are given in the form
`git show origin/main:<path> | grep -n <symbol>`, which a reviewer can run from this tree today.

| # | Claim about shipped behaviour | Verified by (all against `origin/main`) |
|---|---|---|
| V-1 | The record's path is a single exported constant, `.claude/pdlc-wave-state.json` | `WAVE_STATE_PATH` in `pdlc/workflows/orchestrate-dev.js` |
| V-2 | Reading the record is total and never throws: three outcomes — silent no-record, ignored-with-reason, well-formed | `parseWaveLedger`, whose doc comment enumerates the three; `{}` and `""` both return `{state: null, reason: null}` |
| V-3 | The plan fingerprint is FNV-1a over wave order, task ids and owned paths, 8 hex digits, explicitly "not a cryptographic digest" | `computePlanHash` |
| V-4 | The written record is `{version: 1, feature, planHash, lastGreenWave}` plus optional `head` | `formatWaveLedger` |
| V-5 | An operator pointer is judged explicit **before** the out-of-range clamp, so a past-the-end pointer still suppresses the record | `const explicitPointer = startWave > 1;`, evaluated above the `if (startWave > waves.length)` clamp |
| V-6 | The record is consulted only when no explicit pointer is in force | the `if (!explicitPointer) {` block that wraps the whole read/decide chain |
| V-7 | Ancestry is corroborated by `git merge-base --is-ancestor`, and both "no commit recorded" and "no transport to ask" return `true` | `headCorroborated`, whose two early returns are commented "pre-`head` record: honoured as before" and "no transport to ask — not evidence of absence" |
| V-8 | Commits **and** the record write are guarded by the git transport, not by the gate mode | the `if (waveGit)` branch opening under the comment "Only now — verified — does anything get committed (M-6)", with the `writeWaveLedger(formatWaveLedger(...))` call as its last statement |
| V-9 | The write is per wave, best-effort, and a failure is a notice | `writeWaveLedger`'s `try/catch` emitting "Notice: could not …. The run continues" |
| V-10 | The record survives a completed Phase I | the comment "The record is KEPT" above the `allWavesRecorded` report row |
| V-11 | The complete-record case skips every wave and records a `⏭` Phase I row | `allWavesRecorded = true; startWave = waves.length + 1;` and the `recordPhase("I", "Implementation", "⏭", …)` arm |
| V-12 | Exactly one force-a-full-run hatch is announced, in both banners | the string `to force a full run` in the mid-plan resume banner and, wrapped across a line break, in the `Skipping Phase I (wave ledger` banner |
| V-13 | The recognised `implementation.*` keys are exactly four | `IMPLEMENTATION_DEFAULTS` — `testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave` |
| V-14 | The record's exclusion is anchored by a root-anchored ignore rule with a stated rationale | `.gitignore` line `/.claude/pdlc-wave-state.json`, under the comment block explaining why the anchor matters for the checked-in fixture tree |
| V-15 | The queue path delegates the whole pipeline in-process | `orchestrate-queue.js` imports `orchestrate-dev`'s default export as `realMain` and returns the delegated report as `pipelineReport` |
| V-16 | Behaviour is exercised today by integration tests through `main()` | the `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` block in `pdlc/workflows/__tests__/waveExecution.test.js` |
| V-17 | Phase PT's V-wave dispatches one agent and, under a script-owned gate, invokes the gate once, unconditionally after the wave loop | `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`, its single `withDispatchRetry(() => agentFn("se-implement", propertiesTestPrompt(...)))`, and the `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); … }` arm |

### 1.2 The delta this feature implements

The shipped mechanism satisfies most of the FSPEC already. What follows is the complete list of
places where it does not, each with the clause that fails and the change owed. **These rows are
the feature's scope**; everything else is ratification plus tests.

| # | Gap | Clause that fails | Change owed |
|---|---|---|---|
| D-1 | The block is marked INTERIM and describes itself as contained "so that feature can replace it cleanly". Leaving the marker after this feature ships is exactly R-4's "interim/final divergence". | REQ BL-03, R-4 | Replace the INTERIM commentary with the formalised contract, citing this TSPEC. No behavioural change. |
| D-2 | No announcement carries a **provenance** token. The banners name the *source* (`implementation.startWave`, `wave ledger …`); an operator or a test must infer `operator-set` / `automatic` from it. | FSPEC BR-07, §2 "Announcement" | Emit provenance as announced content in every announcing outcome (§2.4, §3.3). |
| D-3 | The **executed** Phase I report row reads `All N waves complete (wave mode, …)` — it states neither the resume point nor its provenance. Only the `⏭` skip row names the record. | REQ-WVR-01 ("the run log **and final report** state the resume point and its provenance"), FSPEC AT-01 | Extend the `✅` row's detail with resume point and provenance (§2.4). |
| D-4 | The `{}` "cleared" shape is tolerated by the reader and written by nothing. | FSPEC OB-F3 | Decided in §6: **keep the read tolerance, add no writer**. No code change; the decision is recorded and tested. |
| D-5 | `parseWaveLedger`, `computePlanHash` and `formatWaveLedger` are reachable only through `main()` for the resume decision itself: there is no unit-level test of `parseWaveLedger`'s reason strings, and no set-equality assertion over the ignore reasons or the three outcomes. | FSPEC OB-F5, AT-02, AT-13 | Extract the decision as a pure classifier (§2.2) and add the three transcribed set-equality suites (§5). |
| D-6 | No test covers EC-15a — a run where an early write succeeds and a later one fails. | FSPEC AT-15 arm 2 | Add the discriminating test (§5). |
| D-7 | Nothing asserts the ignore rule itself, nor the record's absence from any commit. | FSPEC AT-14, REQ-WVR-10 | Add the ignore-rule assertion (§5); RED in this tree until OB-F1's rebase. |
| D-8 | Nothing asserts queue/direct parity of resume point and provenance. | FSPEC AT-16, REQ-WVR-07 | Add the parity test over `realMain` (§5). |
| D-9 | Nothing asserts that this feature's PLAN claims the record in no wave's owned-path set. | FSPEC OB-F6, EC-16 | Add the per-feature ownership assertion (§5). |
| D-10 | `docs/_constraints/pdlc-wave-gate-baseline.md` carries no `M-WVR-*` section. | FSPEC OB-F4, REQ OB-2 | Append a new section at the next unoccupied number with `M-WVR-1..2` and bump the file's `Version` (§6). |

**What is explicitly *not* changed.** The path constant, the record's field names and version, the
FNV-1a fingerprint, the evaluation order of the disregard causes, the transport-guarded write site,
the fail-open posture of every read, and the retention of a complete record. Each is ratified as
specified; changing any of them would be a re-litigation of a decision the REQ already closed.

### 1.3 Scope boundaries carried from upstream

- *Phase I* means the **implementation wave loop**. Phase PT's V-wave (V-17) is outside the resume
  record's scope and replays on every invocation (FSPEC §2, EC-20, BR-11).
- Worktrees fail open. A Claude-created worktree does not carry `.claude/pdlc-wave-state.json`, so
  the record is absent there and the run is a silent full one (FSPEC EC-17). This is a consequence
  of consumer-local state, not of any rule this TSPEC adds; see §6 for the citation defect the REQ
  carries about it.
- Wave halts write **no POSTMORTEM** (`pdlc-wave-gate-baseline.md` `M-WG-5`), so there is no
  `RESOLVED:` lifecycle for this feature to coordinate with. Stated here rather than assumed, per
  REQ OB-1.
- The queue row lifecycle is orthogonal: a human resets `halted → pending`; the record governs
  only where the re-run's Phase I starts (REQ OB-1).

## 2. Architecture

### 2.1 Where the code lives, and why it stays there

All of it is in `pdlc/workflows/orchestrate-dev.js`: three module-level pure functions plus one
read-site and one write-site inside `main()`'s Phase I wave branch. No new module, no new file, no
new host capability (REQ C-3, FSPEC BR-17).

The module is a **restricted dialect** (project CLAUDE.md, `pdlc/workflows/*.js`): no `import`, no
`fs`, no `process`, no `fetch`. Everything that touches the world arrives as an injected seam. That
is why `computePlanHash` is FNV-1a arithmetic rather than a digest — there is no crypto seam in
this module — and why the record is read through `readMergeConfigSafely` and written through
`writeFileFn` rather than through any direct IO. **Cite-and-reuse:** `readMergeConfigSafely` is the
shipped never-throwing reader the merge and implementation configs already use; this feature reuses
it rather than adding a second total reader, and `parseWaveLedger`'s total, never-throwing,
per-key-independent shape is modelled on `parseImplementationConfig`, as that function's own doc
comment records.

The built artifacts under `pdlc/workflows/dist/` are **generated**. Every change lands in the
source module; `node pdlc/workflows/build-runtime.mjs` regenerates the artifacts, and
`pdlc/hooks/scripts/sync-workflows.sh` copies them into the untracked consumer tree. A wave whose
tasks edit the source module owns the regenerated artifacts through `implementation.postWavePathspecs`,
which is why the post-wave command runs before the gate (`M-WG-2`).

### 2.2 The decision, extracted as a pure classifier

Today the decision is an `if/else if` chain inline in `main()`, interleaved with `emit` calls and
one `await`ed ancestry probe. It is correct, and every arm is reachable only through a full
`main()` run. That is what makes AT-02's set equality over **announced reasons** and AT-13's set
equality over **outcomes** impossible to write honestly: a test would have to enumerate what the
chain happens to emit, which is reading the expectation back out of the mechanism under test.

**The chain is therefore extracted, unchanged in behaviour, into one pure total function**
(`classifyWaveLedger`, §3.2). The extraction is deliberately minimal:

- **What moves:** the ordered decision — feature match, plan-hash match, ancestry verdict,
  over-count, complete, mid-plan — and the choice of reason code for each rejection.
- **What does not move:** the `await`ed `git merge-base --is-ancestor` probe, the `emit` calls, and
  the report row. The classifier receives ancestry as an already-resolved boolean (`headOk`) and
  returns a *description* of the outcome; `main()` performs the IO and the announcing.

This keeps every seam where it is (no new injection point) while making the decision a value a
unit test can assert over. `parseWaveLedger` keeps its current job — turning bytes into
`{state, reason}` — so the two functions compose as *shape* then *match*.

The classifier is **total**: every input resolves to exactly one of the three outcomes of FSPEC
BR-01, which is what makes BR-01's closure mechanically checkable rather than asserted in prose.

### 2.3 Control flow at Phase I entry

Ordering below is normative and matches the shipped chain; FSPEC §3.2 already ratified that this
order — ancestry (IG-5) **before** over-count (IG-4) — is the specification, not the REQ's IG
numbering (FSPEC BR-03, AT-03).

```
waves := computeWaves(parsePlanTasks(PLAN), parsePlanOwnership(PLAN))
planHash := computePlanHash(waves)

startWave := implConfig.startWave                       # parseImplementationConfig, default 1
explicitPointer := startWave > 1                        # judged BEFORE the clamp (V-5)
if startWave > waves.length:                            # out of range → full run, still explicit
    emit(pointer-past-end notice, provenance=operator-set)
    startWave := 1

if not explicitPointer:                                 # V-6: the record is consulted only here
    raw    := readMergeConfigSafely(_readFile, WAVE_STATE_PATH)
    parsed := parseWaveLedger(raw)                      # → {state, reason}
    headOk := parsed.state ? await headCorroborated(parsed.state.head) : true
    d      := classifyWaveLedger(parsed, {feature, planHash, waveCount: waves.length, headOk})
    apply d:                                            # §3.2 return shape
        outcome "full-run"   → startWave stays 1; emit d.reason unless d.silent
        outcome "resume"     → startWave := d.startWave; ledgerResume := true; emit resume banner
        outcome "skip-phase" → startWave := waves.length + 1; allWavesRecorded := true; emit skip banner

for waveIndex in 0 .. waves.length-1:
    if allWavesRecorded: break
    if waveNum < startWave: emit per-wave skip line (naming the source); continue
    dispatch → post-wave command → gate → (only if green) commit → write record
```

`headCorroborated` stays exactly as shipped, including both fail-open returns (V-7): a record with
no `head` and a run with no transport both answer `true`, because an unanswerable probe is not a
staleness finding (FSPEC EC-07, EC-21).

### 2.4 Announcements and the report row (D-2, D-3)

FSPEC BR-07 makes provenance **announced content**, and FSPEC §2 lets a test assert that an
announcement *conveys* `operator-set` or `automatic`. The shipped banners convey the source but
never those words, so this TSPEC introduces a frozen two-member vocabulary (`RESUME_PROVENANCE`,
§3.1) and composes it into each announcement as a parenthesised suffix, leaving the existing
sentence — and therefore every assertion in the shipped test block — intact:

| Outcome | Announcement (existing text, unchanged) | Suffix added |
|---|---|---|
| (a) full run, operator pointer past the end | `Notice: implementation.startWave=N … is past the last wave …` | `(provenance: operator-set)` |
| (a) full run, disregarded record | `Notice: the wave ledger … was ignored — {reason}. Running every wave from 1.` | `(provenance: automatic)` |
| (a) full run, no record (IG-6) | *(nothing)* | *(nothing — silence is the specification, FSPEC BR-02)* |
| (b) resume mid-plan, operator pointer | `Resuming at wave N of M (implementation.startWave). …` | `(provenance: operator-set)` |
| (b) resume mid-plan, record | `Resuming at wave N of M (wave ledger …). … Delete … to force a full run.` | `(provenance: automatic)` |
| (c) skip Phase I | `Skipping Phase I (wave ledger …): all M waves … Delete … to force a full run.` | `(provenance: automatic)` |

The suffix is **content, not wording**: FSPEC's "announcement content, not wording" note governs,
and PROPERTIES asserts that the announcement conveys the token, not that the sentence is
byte-identical.

The **report** carries the same two facts on one Phase I row (FSPEC EC-09's "one row with a
distinguishing status, not a second row"):

| Case | Status | Detail |
|---|---|---|
| Executed from wave 1, no resume | `✅` | `All M waves complete (wave mode, {gate})` — unchanged |
| Executed from wave N > 1 | `✅` | `Waves N–M complete, waves 1–(N-1) skipped as previously completed (provenance: {p}; wave mode, {gate})` |
| Skipped in full | `⏭` | `Skipped — all M waves previously committed and recorded green (wave ledger; provenance: automatic)` |

The `⏭` row's existing text is preserved as a prefix so the shipped assertion on
`recorded green (wave ledger)` keeps passing; the change is additive.

### 2.5 What the run writes, and when

Unchanged from shipped, and ratified here as the contract:

1. The write happens **inside** the `if (waveGit)` branch (V-8) — the same branch that guards the
   commits. A run with no git transport commits nothing and therefore records nothing, which is
   REQ-WVR-09 and FSPEC EC-13. The guard is the **transport**, not the gate mode: a self-report-gate
   run with a transport records normally (FSPEC AT-09's companion arm).
2. It happens **after** the wave's pathspec-scoped commits, never beside the gate, so a wave is
   recorded only once its work is on the branch (FSPEC BR-08).
3. It is **per wave** and **best-effort**: `writeWaveLedger` catches, emits a notice, and continues
   (V-9). A run in which some writes succeed and a later one fails leaves the last successfully
   written record in place, so the next invocation resumes from there (FSPEC EC-15a, AT-15 arm 2).
4. `head` is stamped from `git rev-parse HEAD` after those commits, best-effort: a transport that
   cannot answer yields `head: null`, which the reader honours (V-7).
5. Each write carries `lastGreenWave = waveNum`, the **plan-absolute** wave number, not a count of
   waves this run executed — which is what makes completion the high-water property FSPEC BR-08
   requires and AT-18 discriminates on.

**One interaction the FSPEC does not state, recorded here and routed upstream.** The write site is
outside the `!explicitPointer` guard, so a run started at wave N by an operator pointer records
`lastGreenWave = N` for a wave the *operator*, not the pipeline, asserted the predecessors of. The
damage is bounded exactly as FSPEC BR-10 bounds it — the first executed wave's gate verifies the
whole tree, so an un-run predecessor reds the gate rather than shipping — but the behaviour is
unspecified upstream. Ratified as-is (changing it would make an operator-pointer run unable to
record anything, losing resume for the very recovery path the feature serves); raised as an
erratum against the FSPEC so the clause exists.

### 2.6 Requirement → component map

| Requirement | Component |
|---|---|
| REQ-WVR-01 | `classifyWaveLedger` `resume` outcome; resume banner; `✅` report detail (§2.4) |
| REQ-WVR-02 | `parseWaveLedger` reasons + `WAVE_IGNORE_REASONS` codes (§3.1); classifier's rejection arms |
| REQ-WVR-03 | unchanged wave loop: gate before commit; skipping skips dispatch only |
| REQ-WVR-04 | `explicitPointer`, evaluated above the clamp; `RESUME_PROVENANCE` |
| REQ-WVR-05 | retention — no clearing write; reader-side invalidation in the classifier |
| REQ-WVR-06 | classifier reads only the record; `headCorroborated` is falsification, not archaeology |
| REQ-WVR-07 | no queue-specific code: `orchestrate-queue` delegates to `realMain` (V-15) |
| REQ-WVR-08 | `skip-phase` outcome, `allWavesRecorded` break, `⏭` row |
| REQ-WVR-09 | write site nested in the `if (waveGit)` transport branch (V-8) |
| REQ-WVR-10 | `WAVE_STATE_PATH` under the root-anchored `.gitignore` rule (V-14); no pathspec names it |

## 3. Interfaces

## 4. Data Model

## 5. Test Strategy

## 6. Open Questions

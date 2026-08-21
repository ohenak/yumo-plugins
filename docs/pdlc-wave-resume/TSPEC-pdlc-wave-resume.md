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

## 3. Interfaces

## 4. Data Model

## 5. Test Strategy

## 6. Open Questions

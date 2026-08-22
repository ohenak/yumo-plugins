# PLAN — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.0 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | *(none yet — round 1 pending)* |
| LEARNINGS | `docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md` |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. |

## 1. Overview

### 1.1 What is being built

TSPEC §1.2 scopes this feature to **eleven delta rows (D-1 … D-11)** against a mechanism that
already ships on the default branch. Nothing here designs a second resume mechanism; the work is
(a) one behaviour-preserving extraction, (b) two announcement changes, (c) one comment
replacement, (d) one constraints-file promotion, and (e) the test suites that make the ratified
contract falsifiable.

| Delta | Landed by |
|---|---|
| D-1 remove the INTERIM commentary, cite the TSPEC | T-05 |
| D-2 provenance token on every announcing outcome | T-09 |
| D-3 resume point + provenance on the executed Phase I report row | T-09 |
| D-4 keep the `{}` read tolerance, add no writer (DEC-WVR-04) | T-02 (asserted; no code change) |
| D-5 extract the decision as a pure classifier; add the set-equality suites | T-05 (code), T-02 (suites) |
| D-6 EC-15a discriminating test (early write succeeds, later write fails) | T-07 |
| D-7 the ignore-rule assertion | T-03 |
| D-8 queue/direct parity | T-04 |
| D-9 this PLAN claims the record in no wave's owned-path set | T-03 (§3.3 is the subject) |
| D-10 `M-WVR-1..2` in `docs/_constraints/pdlc-wave-gate-baseline.md` | T-06 |
| D-11 the three shipped whole-string assertions | T-07 |

### 1.2 The one precondition this PLAN is built around

REQ BL-04 / FSPEC OB-F1 / TSPEC §6.2 are **not met in this tree**, and that is verified rather
than assumed:

| Fact | Command run in this tree | Result |
|---|---|---|
| The branch is behind the default branch | `git rev-list --count HEAD..origin/main` | `1637` |
| The shipped mechanism is absent here | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` |
| The wave-gate baseline is absent here | `ls docs/_constraints/` | no `pdlc-wave-gate-baseline.md` |
| The ignore rule is absent here | `grep -n 'wave-state' .gitignore` | no match (only `/.claude/workflows/`, line 29) |
| `fast-check` / `c8` / `test:coverage` are absent here | `grep -nE '"test\|fast-check\|c8' pdlc/workflows/package.json` | only `test` and `test:watch` |

All five are present at `origin/main` (`345ae358`), verified by name:
`WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `writeWaveLedger`,
`headCorroborated` and `IMPLEMENTATION_DEFAULTS` all resolve in
`git show origin/main:pdlc/workflows/orchestrate-dev.js`; `classifyWaveLedger` and
`RESUME_OUTCOMES` resolve **nowhere** (they are this feature's new exports);
`docs/_constraints/pdlc-wave-gate-baseline.md` is tracked; `.gitignore` line 41 is
`/.claude/pdlc-wave-state.json`; and `pdlc/workflows/package.json` line 9 defines
`test:coverage` with `--per-file --branches 85` alongside the `c8` and `fast-check` devDependencies.

**Consequence for this PLAN, and it is structural, not a caveat.** TSPEC §5.4 AT-14 and §6.2 OB-F1
state that in wave mode a red gate halts the wave *and every wave after it*, so the wave carrying
AT-14 must not be dispatched before the rebase. This PLAN discharges that mechanically rather than
in prose: **T-01 is the first task, it is a pre-flight gate over exactly those baseline facts, and
every other task depends on it** (directly or transitively). A pre-rebase run therefore fails at
T-01 — the cheapest possible wave — instead of at T-03's ignore-rule assertion three waves in.

### 1.3 Scope boundaries this PLAN inherits

- The extraction is **behaviour-preserving** and lands alone, before any announcement change
  (TSPEC RT-2). T-05 leaves `pdlc/workflows/__tests__/waveExecution.test.js` byte-unchanged; that
  shipped `describe` block *is* the extraction's regression net, and a task that edits its net in
  the same diff has no net.
- The record is **consumer-local and untracked**. It appears in no task's owned-path set and in no
  `implementation.postWavePathspecs` value (§3.3, FSPEC OB-F6, TSPEC AT-17).
- Phase PT's V-wave is outside this feature's scope (TSPEC §1.3); no task changes it.
- `pdlc/workflows/dist/` is **generated**. No task owns it; it is carried per wave by
  `implementation.postWavePathspecs` (§3.4, TSPEC RT-5).

## 2. Batches

## 3. Dependencies

## 4. Verification

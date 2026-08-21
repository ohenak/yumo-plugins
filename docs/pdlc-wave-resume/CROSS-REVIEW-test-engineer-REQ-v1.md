# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** REQ-pdlc-wave-resume §1–§10, testing lens (testability, edge-case completeness, oracle falsifiability, traceability)

## Verification Method

Every existing-behaviour claim below was checked against code, not against documents.

- **This branch (`feat-pdlc-wave-resume`) HEAD.** `grep -rn startWave` over the repo returns
  *only* the REQ itself — the manual pointer named in BL-01 does not exist on this branch.
- **`refs/heads/feat-pdlc-consolidation-agent`** (where BL-01/BL-03 actually live, queue row 2
  status `halted`, `docs/_queue/QUEUE.md`): read `pdlc/workflows/orchestrate-dev.js` §§8523–8641
  (`WAVE_STATE_PATH`, `WAVE_LEDGER_CLEARED`, `computePlanHash`, `parseWaveLedger`,
  `formatWaveLedger`) and §§10434–10630 (the read site, the skip loop, the per-wave write, the
  end-of-phase clear).
- **Wave layout re-derived mechanically.** I ran this branch's own
  `parsePlanTasks` + `parsePlanOwnership` + `computeWaves`
  (`pdlc/workflows/orchestrate-dev.js:3730`, `:3948`, `:8451`) over
  `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md` at HEAD. Result: 34 tasks,
  34 manifest rows, **16 waves**; W1 = `[T00]` (one task), W2 = `[T01..T05]`, W3 = `[T06]`,
  W4 = `[T07..T11]`; waves 1–3 hold **7** tasks. This is the arithmetic OF-1..3 assert, so the
  facts are checkable rather than testimonial — and two of the numbers do not land (F-03, F-04).
- **Gate-before-commit ordering** confirmed at `pdlc/workflows/orchestrate-dev.js:10321-10335`
  on this branch: the test gate throws `haltError` before the `if (waveGit)` commit loop is
  reached, so OF-3's "a halted wave's own work is uncommitted" is true by construction here.
- **No POSTMORTEM on wave halts** confirmed: `docs/pdlc-consolidation-agent/` carries
  POSTMORTEM-D/-F/-P/-PR/-R/-T and no `POSTMORTEM-I-*`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | REQ-WVR-04's precedence rule has no stated outcome at its only interesting boundary — an operator who *explicitly* sets the manual resume point to its default value (1, i.e. "run everything"). The "When" of the acceptance test cannot be written. | §7 REQ-WVR-04, §9 OQ-1 |
| F-02 | High | Local | The safety property that actually prevents data loss — a wave that ran green but whose work was **not** committed must never be skipped — appears only in §8 R-2 as a risk, with its acceptance test deferred to the FSPEC. No AC states it, so no AT traces to a requirement and a conforming implementation may drop it. | §8 R-2, §7 REQ-WVR-01 |
| F-03 | Medium | Cross-Feature | OF-1's "15-wave plan" does not reproduce: re-deriving the wave layout from the cited PLAN at HEAD yields **16** waves. OB-2 promotes OF-1 into `docs/_constraints/pdlc-wave-gate-baseline.md` as a measured `M-*` fact, so a number that does not reproduce becomes a bad oracle source. | §4 OF-1, §9 OB-2 |
| F-04 | Medium | Cross-Feature | OF-1's "**each** re-invocation paid seven no-op agent dispatches (waves 1–3)" is true only for the wave-4 halt. Re-entry after the wave-2 halt replays W1 = `[T00]` — **one** dispatch, not seven. The replay-cost claim that motivates the feature is overstated for one of the two observations. | §4 OF-1, §1 |
| F-05 | Medium | Local | REQ-WVR-06 is an absence-only oracle in both clauses ("does not consult commit presence or commit messages", "never causes its wave to be treated as incomplete"). Neither is falsifiable by black-box observation, and the first clause names implementation mechanics rather than an outcome. | §7 REQ-WVR-06 |
| F-06 | Medium | Local | REQ-WVR-02's ignore-reason set is open-ended prose ("a different feature, a since-changed plan, or an out-of-range state"), so no set-equality oracle over the rejection catalogue is possible and a deleted rejection case would pass a containment-style test. | §7 REQ-WVR-02 |
| F-07 | Medium | Local | C-1 (consumer-local, untracked state) has no acceptance criterion, and the precedent it cites does not transfer: the drift-state record is untracked because `/.claude/workflows/` is gitignored, a rule that covers no sibling path. Nothing in §7 fails if the record becomes a tracked file. | §4 C-1 |
| F-08 | Low | Local | REQ-WVR-05's "no resume state survives" invites a file-absence oracle that the mechanism at HEAD does not satisfy (it writes a cleared-but-present record). Only the second clause is behaviourally testable. | §7 REQ-WVR-05 |
| F-09 | Low | Local | BL-01 and BL-03 say the prerequisites exist "at HEAD" without naming which HEAD; they do not exist on this feature branch. The prerequisite check is therefore not mechanical, and the §1 sentence "A manual resume pointer now exists" reads as a claim about the reader's tree. | §5 BL-01/BL-03, §1 |
| F-10 | Low | Local | REQ-WVR-07 states its outcome by reference ("resumes exactly as a direct invocation would"), which is a restatement, not an oracle — it names no queue-specific observable that could fail while REQ-WVR-01..05 pass. | §7 REQ-WVR-07 |

## Questions

## Positive Observations

## Recommendation


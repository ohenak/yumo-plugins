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

## Questions

## Positive Observations

## Recommendation


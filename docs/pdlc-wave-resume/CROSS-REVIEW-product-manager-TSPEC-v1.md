# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Every claim below about existing behaviour is verified against `origin/main` at
`345ae358`, because this branch is 1,637 commits behind it
(`git rev-list --count HEAD..origin/main` → 1637) and carries neither the mechanism nor
`docs/_constraints/pdlc-wave-gate-baseline.md`.

## Grounding Ledger

The TSPEC's §1.1 verification table is the substance of this review's first pass: I re-ran every
row rather than reading it. **V-1 through V-17 all hold**, by name, against `origin/main`:

| Row | Re-derivation | Result |
|---|---|---|
| V-1 | `WAVE_STATE_PATH = ".claude/pdlc-wave-state.json"`, `pdlc/workflows/orchestrate-dev.js` | holds |
| V-2 | `parseWaveLedger` doc comment enumerates three outcomes; `text == null`, `""` and `"{}"` all return `{state: null, reason: null}` | holds |
| V-3 | `computePlanHash` — FNV-1a `0x811c9dc5`/`0x01000193`, `padStart(8, "0")`, doc comment "Not a cryptographic digest" | holds |
| V-4 | `formatWaveLedger` — `{version: 1, feature, planHash, lastGreenWave}` plus `head` when non-blank | holds |
| V-5 | `const explicitPointer = startWave > 1;` sits **above** `if (startWave > waves.length)` | holds |
| V-6 | `if (!explicitPointer) {` wraps the whole read/decide chain | holds |
| V-7 | `headCorroborated`'s two early returns, commented "pre-`head` record: honoured as before" and "no transport to ask — not evidence of absence" | holds |
| V-8 | `if (waveGit) {` opens under "Only now — verified — does anything get committed (M-6)", and `writeWaveLedger(formatWaveLedger(...))` is its last statement | holds |
| V-9 | `writeWaveLedger`'s `try/catch` emits "Notice: could not … The run continues" | holds |
| V-10 | comment "The record is KEPT" above the `allWavesRecorded` report row | holds |
| V-11 | `startWave = waves.length + 1; ledgerResume = true; allWavesRecorded = true;` and the `recordPhase("I", "Implementation", "⏭", …)` arm | holds |
| V-12 | `to force a full run` in the mid-plan banner, and wrapped across a line break in the `Skipping Phase I (wave ledger` banner | holds |
| V-13 | `IMPLEMENTATION_DEFAULTS` — exactly `testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave` | holds |
| V-14 | `.gitignore` `/.claude/pdlc-wave-state.json`, under the anchoring-rationale comment block, beside `/.claude/workflows/` | holds |
| V-15 | `orchestrate-queue.js` imports `orchestrate-dev`'s default export as `realMain` and returns `pipelineReport` | holds |
| V-16 | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` in `waveExecution.test.js` | holds |
| V-17 | `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`, one `withDispatchRetry(() => agentFn("se-implement", propertiesTestPrompt(…)))`, `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); … }`, reached unconditionally after the wave loop | holds |

Every `M-WG-*` fact the TSPEC cites also holds at `pdlc-wave-gate-baseline.md` `Version | 1.2 ·
2026-08-20`: `M-WG-2` (post-wave command before the gate), `M-WG-5` (a wave halt writes no
POSTMORTEM), `M-WG-8`/`M-WG-9`/`M-WG-13`/`M-WG-14` (the transcribed set-equality discipline the
frozen catalogues of §3.1 are modelled on).

**Traceability sweep.** All ten REQ criteria (REQ-WVR-01..10) carry a component in §2.6, and all
eighteen FSPEC acceptance tests (AT-01..AT-18) carry an oracle in §5.4. No P0 or P1 criterion is
dropped, narrowed or reinterpreted, and no product decision is taken that belongs upstream — the
provenance vocabulary of D-2 is FSPEC BR-07's own two words, the report-row change of D-3 is
REQ-WVR-01's "and final report" clause, and §3.5 adds no configuration key, which is REQ OQ-1's
decision honoured. The findings below are all about the **oracles** the document commits to, not
about what it specifies.

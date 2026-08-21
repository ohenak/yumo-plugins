# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** testability, edge-case completeness, test-strategy soundness, oracle falsifiability

## Grounding

Every claim below is verified against the repository, not against the TSPEC's prose. Because this
tree does not carry the mechanism (`grep -n WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`
returns nothing; `git rev-list --count HEAD..origin/main` -> `1637`), I verified against
`origin/main` at `345ae358` exactly as §1.1 instructs, via
`git show origin/main:<path>`. Line numbers below are line numbers in the `origin/main` blob.

**The §1.1 verification table holds.** I re-ran all seventeen rows and every one is accurate:

| Row | Verified |
|---|---|
| V-1 | `export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` — `orchestrate-dev.js:12214` |
| V-2 | `parseWaveLedger` `:12267`; doc comment enumerates the three outcomes `:12253-12262`; `""` and `"{}"` both short-circuit at `:12271` |
| V-3 | `computePlanHash` `:12230`; "Not a cryptographic digest and not trying to be" `:12220`; FNV-1a offset/prime `:12244-12248`; `padStart(8, "0")` `:12250` |
| V-4 | `formatWaveLedger` `:12325`; `{version: 1, feature, planHash, lastGreenWave}` +/- `head` `:12327-12330` |
| V-5 | `const explicitPointer = startWave > 1;` `:15236`, above `if (startWave > waves.length)` `:15237` |
| V-6 | `if (!explicitPointer) {` `:15263` wraps the whole read/decide chain through `:15346` |
| V-7 | `headCorroborated` `:15280`; `return true; // pre-\`head\` record` `:15281`; `return true; // no transport to ask` `:15283` |
| V-8 | `// Only now — verified — does anything get committed (M-6).` `:15530`, `if (waveGit) {` `:15531`, and `writeWaveLedger(formatWaveLedger(...))` `:15600-15603` as its last statement. The guard is **not** nested under `scriptGate` (`if (scriptGate)` closes well above, `:15432`), so AT-09's companion arm is reachable. |
| V-9 | `writeWaveLedger`'s `try/catch` `:15348-15359`, "The run continues" `:15357` |
| V-10 | `// Every implementation wave is green and committed. The record is KEPT` `:15607` |
| V-11 | `startWave = waves.length + 1; ledgerResume = true; allWavesRecorded = true;` `:15325-15327`; `recordPhase("I", "Implementation", "⏭", …)` `:15616-15622` |
| V-12 | `to force a full run` in both banners — `:15331` and `:15342` |
| V-13 | `IMPLEMENTATION_DEFAULTS` `:169`, four keys |
| V-14 | `.gitignore:41` `/.claude/pdlc-wave-state.json` under the anchoring rationale block `:24-32`. **Absent from this tree's `.gitignore`** (only `/.claude/workflows/` at `:29`) — F-10 turns on this. |
| V-15 | `import realMain … from "./orchestrate-dev.js"` `orchestrate-queue.js:45`; `pipelineReport: report` `:1637` |
| V-16 | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended", …)` `waveExecution.test.js:2239` |
| V-17 | `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` `:15655`; single `withDispatchRetry(() => agentFn("se-implement", propertiesTestPrompt(...)))` `:15657-15665`; `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); … }` `:15672-15682`, unconditionally after the wave loop and reached on the `allWavesRecorded` break `:15372` |

§6.2's OB-F4 recipe also checks out: `pdlc-wave-gate-baseline.md` on `origin/main` is at
`| Version | 1.2 · 2026-08-20 |` (`:7`), has sections through `## 4` (`:67`), ids through `M-WG-14`
(`:78`), and `M-WG-6` exists (`:45`). §6.3 item 4 checks out: `git ls-tree -r --name-only
origin/main | grep worktreeinclude` is empty.

Every test-harness symbol §5.2 cites is real: `makeLedgerArgs` `waveExecution.test.js:2204`,
`ledgerWrites` `:2236`, `PLAN_THREE_WAVES` `:2052`, `CONFIG_WITH_TEST_COMMAND` `:161`, `makeArgs`
`:164`, and the complete-ledger zero-dispatch test `:2313`.

**This is unusually well-grounded engineering work.** The findings below are, with one exception,
not about what the TSPEC claims the code does — they are about what the *test strategy* can
actually prove, and about two places where a stated-as-safe change is not safe.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

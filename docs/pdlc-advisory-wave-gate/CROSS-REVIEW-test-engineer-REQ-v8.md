# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.9)
**Date:** 2026-08-19
**Iteration:** 8
**Scope:** Delta re-review of v7. Decision freeze in force — only delta-introduced defects and
factual contradictions with HEAD can block. Changed sections only; unchanged sections not re-litigated.

## Delta under review

Two commits touch the REQ since v7 (`8911d217..HEAD`): `680efb0c` (restores the five round-3 sites
reverted by the rebase, v7 F-01..F-05) and `e619b6d6` (v1.9 bump, §1 ledger citations, NFR-4, v7
F-06/F-07). Net **+34 / −8** lines. Every one of v7's four High findings is closed at HEAD:

| v7 finding | Site | State at HEAD | Verified |
|---|---|---|---|
| F-01 High | §5 C-2 (`REQ:237`, `:239`) | default is `1`; gloss reads "operator decision recorded under Q-1 (2026-08-13); the earlier proposal of `2` is superseded" | Resolved — now agrees with R-3 (`:525`), Q-1 (`:575`), and the three approved downstream docs pinning `1` |
| F-02 High | §8 (`REQ:558`) | O-7 restored verbatim, owner `pdlc-engineering-loop` (queue row 6), with the "must not be modelled as a widened A6" scope constraint | Resolved — AC-1.2 (`:270`), Q-2 (`:576`) and the v1.3 changelog (`:72`) now cite a live obligation |
| F-03 High | Header Upstream row (`REQ:11`) | `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` | Resolved — path exists at HEAD (26.7 K) |
| F-04 High | §1 M-WG-6 row (`REQ:109`) | row rewritten; no longer restates the claim the correction paragraph beneath retracts | Resolved — see F-01 below for a residual precision point, non-gating |
| F-05 Medium | §1 (`REQ:154`–`:166`) | 2026-08-11 `iv-snapshot-store-postgres` incident restored in full | Resolved — §6's reference and D-AWG-06 (`:615`) again have a referent |
| F-06 Medium | §1 (`REQ:114`–`:122`) | line anchors replaced by exported `WAVE_STATE_PATH` / `parseWaveLedger` and the "Notice: the wave ledger … was ignored" string; `scriptGate` described rather than cited | Resolved and verified against source (below) |
| F-07 Medium | NFR-4 (`REQ:503`–`:505`) | "the window closes at the attempt's verdict, and the gate runs after that verdict" replaces "the gate runs between attempts" | Resolved — consistent with AC-4.1's *applies*/*resolves* split, where the re-gate follows the repair |

## Source verification of the rewritten §1 citations

Every symbol the new §1 text names exists at HEAD and behaves as described:

- `WAVE_STATE_PATH` — exported, `pdlc/workflows/orchestrate-dev.js:11322`.
- `parseWaveLedger` — exported, `orchestrate-dev.js:11375`.
- "Notice: the wave ledger … was ignored" — emitted at `orchestrate-dev.js:14221`, inside the resume block.
- `scriptGate` "requires both `implementation.testCommand` and a `_runCommand` transport" — exact:
  `const scriptGate = Boolean(implConfig.testCommand) && typeof runCommandFn === "function"` (`:14147`).
- "The write sits inside the `if (scriptGate)` branch" — confirmed: the sole `writeWaveLedger` call
  (`:14450`) is lexically inside `if (scriptGate)` (`:14364`). A self-report-gate run records nothing.
- `implementation.startWave` — real config key (`:173`, `:235`–`:250`), documented at `:166` as the
  resume knob after a wave-gate halt.

The claim that survives this round is therefore the strong one, and it holds.

# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 2

## Review basis

Delta re-review. Base for the diff is `9cf48051` — the tree state v1 was measured in. Diff run as
`git diff 9cf48051 -- docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`; only the
changed hunks were scanned for new issues, plus the two sibling files the changes depend on
(`docs/_queue/QUEUE.md`, `docs/_constraints/pdlc-wave-gate-baseline.md`). Branch verified
`feat-pdlc-advisory-wave-gate`; `git rev-parse HEAD` equals `git rev-parse
origin/feat-pdlc-advisory-wave-gate` (`756bafa5`) after `git fetch` — no stale base, no pull taken
in the shared tree.

Changed hunks in this round: frontmatter `ready`, §1 version/changelog, §1 drift sentence, C-5's
baseline version pointer, AC-1.2's anchor, AC-2.4's zero-budget conjunct, AC-3.5 and AC-4.1
test-decomposition phrases, O-4's E-6 conjunct, and the v1.4 changelog's historical baseline
citation (`756bafa5`).

## Prior-finding disposition

| Prior | Severity | Status | Evidence re-measured this round |
|---|---|---|---|
| F-01 | High | **Resolved** | Frontmatter reads `ready: true`; `docs/_queue/QUEUE.md` row 19 reads `done`. The pre-check that blocked rows 6 and 20 (`pdlc/workflows/orchestrate-queue.js:881-884`, `match.status !== "done"`) no longer fires for `pdlc-advisory-wave-gate`. |
| F-02 | Medium | **Resolved (routed, as recommended)** | `docs/_constraints/pdlc-wave-gate-baseline.md` is v1.2, verified-at line extended with `§4 at 11420461`, new §4 adds M-WG-13 / M-WG-14. Recipes re-run: `ADVISORY_SEAMS` six-member at `pdlc/workflows/orchestrate-dev.js:1952`, `ENVELOPE_DEFAULTS` six-member at `:1942`; transcriptions six at `advisoryEnvelope.test.js:317`, `advisoryHarvest.test.js:580`, `advisoryRecord.test.js:496`, and `advisoryEnvelope.test.js:284`. AC-1.1 and R-5 correctly left citing M-WG-8 as the pre-change fact. |
| F-03 | Low | **Resolved** | AC-1.2's raw `orchestrate-dev.js:12331-12343` anchor is gone, replaced by the symbol conjuncts `failed: "post-wave"` early return and the wave loop's `haltError`. Both resolve at HEAD: `pdlc/workflows/orchestrate-dev.js:3308` (`return { failed: "post-wave", … }` inside `runWaveGateSequence`) and the consuming branch at `:15337` (`if (gateOutcome.failed === "post-wave")`). Runs-exactly-once still holds: the single `runCommandFn(implConfig.postWaveCommand)` call at `:3306` has no retry. |
| F-04 | Low | **Resolved** | §1 now says exactly what reproduces: `build-runtime.mjs --check` re-run here prints `in-sync pdlc/workflows/dist/pdlc-cli.mjs`, exit `0`; `cmp .claude/workflows/pdlc-cli.mjs pdlc/workflows/dist/pdlc-cli.mjs` differs at line 7. The unreproducible "three rows stale and one missing" count is withdrawn and the observation is labelled working-tree-only. |

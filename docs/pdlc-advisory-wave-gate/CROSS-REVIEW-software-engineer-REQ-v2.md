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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Process | C-5 states the size bound as the hard ceiling only (700 lines / 61,440 bytes). At 647 lines the document is past the hook's **soft** threshold, so `check-req-size.sh` warns on every edit while C-5, read literally, says "in budget". | §5 C-5 |
| F-02 | Low | Local | The v1.12 changelog attributes the block on queue rows 6 and 20 to "the pair" (`ready: false` **and** the `pending` row). Only the QUEUE row status feeds the successors' pre-check; `ready: false` gates this row's own pickup. | §1 v1.12 changelog |

### F-01 (Low, Process) — C-5 quotes the hard ceiling, but the hook's soft threshold is the one now firing

`pdlc/hooks/scripts/check-req-size.sh:41-48` carries two bounds, not one: `LINE_LIMIT=700` /
`BYTE_LIMIT=61440` and `SOFT_LINE_LIMIT=630` / `SOFT_BYTE_LIMIT=55296`. Under the hard ceiling the
script still emits its soft-threshold `additionalContext` when **either** soft bound is exceeded
(`:53-66`). Measured now: `wc -l -c` → 647 lines / 52,156 bytes. Bytes are inside the soft bound;
lines are not (647 > 630), so every Write/Edit to this REQ now produces the soft warning whose text
is *"Relocate shared baselines, thresholds and catalogue rows to `docs/_constraints/` now, before
the next review round"* — advice this round in fact followed (F-02's routing to
`pdlc-wave-gate-baseline.md` v1.2).

This is not a size violation and does not block: the document is inside the hard ceiling with 53
lines and 9,284 bytes of headroom. It is a statement-of-constraint defect — C-5 is the sentence a
future author or reviewer measures the document against, and as written it under-reports the bound
that is actually active. **Change:** extend C-5's parenthetical to name both bounds
(`700 lines / 61,440 bytes hard, 630 / 55,296 soft`), so the next round's measurement matches what
the hook reports rather than contradicting it. Tagged `Process` because the mismatch is in how the
size constraint is stated, and every pdlc REQ that quotes only the hard ceiling inherits it.

### F-02 (Low, Local) — `ready: false` never blocked a successor; the QUEUE row did

The v1.12 changelog reads: *"`ready: true` (merged, PR #66 `bb4d36fb`) and QUEUE row 19 `done` — the
pair blocked rows 6 and 20 on the queue's not-done dependency pre-check"*. Both edits were correct
and F-01 of v1 is resolved by them; the causal attribution is what overstates. The successors'
pre-check reads only the queue row's `status` field
(`pdlc/workflows/orchestrate-queue.js:879-886`: `if (match && match.status !== "done")` →
`dependency ${dep} is ${match.status} in queue (not done)`), and never consults the dependency's
REQ frontmatter. The `ready` flag gates one thing: whether **this** row is itself auto-picked
(`:257` — *"Absent or non-true means 'not pickable'"*; `:1341` — `Skip "${entry.feature}": REQ not
marked ready: true (still a draft).`).

**Change:** one clause — *"QUEUE row 19 `done`, which is what blocked rows 6 and 20 on the queue's
not-done dependency pre-check; `ready: true` unblocks only this row's own pickup"*. Local because
it is a provenance sentence in this document's changelog, not a reusable constraint.

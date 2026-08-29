---
feature: pdlc-decision-ledger
---

# PLAN — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` (`REQ-pdlc-decision-ledger.md` v1.9, `FSPEC-pdlc-decision-ledger.md` v1.3, `TSPEC-pdlc-decision-ledger.md` v0.7, `DECISIONS-pdlc-decision-ledger.md`) |
| Downstream | PROPERTIES, IMPL |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 0.1 | 2026-08-28 |

## Overview

**What is being built.** A config-gated *decision ledger*: one line per already-closed decision,
plus adjacent rule text, appended to the review loop's reviewer-dispatch prompt. Off by default;
with the flag off the dispatch stream is byte-identical to the committed merge-base baseline
(REQ-DECLEDGER-02, FSPEC AT-04).

**Where it lands.** All new production symbols go into the single file
`pdlc/workflows/orchestrate-dev.js` (TSPEC D-6 / `DEC-DECLEDGER-08`; the engine's
`pdlc/engine/scripts/prepack.mjs` vendors a frozen `MODULE_NAMES` list at line 20, and REQ NG-6
forbids editing `pdlc/engine/` runtime, so no new `pdlc/workflows/lib/` module is available even
though `lib/` exists and already holds `document-oracles.mjs`, `escalation-view.mjs`,
`loop-session.mjs`). **That one-file constraint is the dominant shape of this PLAN:** every green
task writes the same physical file, so under batch-safety rule 2 the six green tasks are
serialised one-per-batch by real `Deps` edges. Two files outside it change: the tracked
`.claude/pdlc.config.example.json` disclosure (FSPEC Q-3, explicitly preserved by REQ NG-6) and a
new `pdlc/engine/__tests__/decision-ledger-config-example.test.js`.

**Shipped code this extends, verified at HEAD.**

| Symbol / artefact | Location at HEAD | Role here |
|---|---|---|
| `parseLearningsConfig`, `readLearningsConfigSafely` | `pdlc/workflows/orchestrate-dev.js` (inside the sentinel-bounded `// === LEARNINGS INJECTION REGION START/END ===` block) | `parseDecisionLedgerConfig` clones its shape; the config text is already read **once** and shared with `parsePinCheckConfig` / `parseDerivativeStopConfig` — this feature adds a fourth consumer, not a fourth read |
| `LEARNINGS_CORPUS_ARGV`, `gatherLearningsCorpus`, `selectLearnings`, `renderLearningsBlock`, `buildLearningsInjector` | same module | the corpus/select/render/inject shell `DECISION_CORPUS_ARGV` and friends clone |
| `reviewLoop` (exported), `reviewerPrompt` (module-private, called twice from inside `reviewLoop`) | same module | gain `_injectDecisionLedger` and a trailing `ledgerBlock` parameter, both defaulting to the shipped state (TSPEC §4.5) |
| `runCaptureScript` | `scripts/capture-learnings-baseline.mjs` | the byte-identity capture harness, reused unchanged |
| `loopEconomicsBaselineGuard.test.js` (`EXPECTED_MERGE_BASE_SHA` literal, `git merge-base --is-ancestor` weaker second signal) | `pdlc/workflows/__tests__/` | the guard shape T-02 clones verbatim |
| `loopEconomicsAnchorGuard.test.js` (`ANCHOR_TOKENS`, `bodyOf`) | `pdlc/workflows/__tests__/` | the declaration-anchored source-census precedent T-11 clones |
| `advisoryDisabled.test.js`'s `sourceExcludingParser` / PROP-DIS-06 | `pdlc/workflows/__tests__/` | the brace-matching slicer, and the reason the enablement read must be **destructured**, not dotted (`DEC-DECLEDGER-09`) |
| `loop-config-example.test.js` | `pdlc/engine/__tests__/` | the containment-plus-set-equality disclosure shape; the example file carries exactly eight top-level blocks today (`dispatch`, `advisory`, `implementation`, `learningsInjection`, `cascade`, `review`, `loop`, `merge`) |

**Every file this PLAN names is either verified to exist at HEAD (the table above, plus
`pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md`, `.claude/pdlc.config.example.json`,
`pdlc/.claude-plugin/plugin.json` at version `0.23.6`, `pdlc/workflows/dist/pdlc-cli.mjs`) or is
declared `[new]` in its task row.** No task names a file that exists under a different path.

**Two RED-terminal batches.** Batches 1–2 create fixtures and failing tests only; the greens land
in batches 3–8. Per the wave-gate contract already followed by
`pdlc/engine/__tests__/loop-config-example.test.js`, every `[red]` block is committed **skipped**,
titled with the id of the `[green]` task that un-skips it, and each block is run un-skipped once
first and observed to fail for the stated reason before being skipped. Gate wording for batches
1–2: *new tests are committed skipped with their observed-red reason recorded in the file header,
and the pre-existing suite is green.*

## Batches

*(pending)*

## Dependencies

*(pending)*

## Verification

*(pending)*

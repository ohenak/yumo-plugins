# Cross-Review: software-engineer — FSPEC (round 7, delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.4)
**Date:** 2026-08-19
**Iteration:** 7

## Scope of this round

Delta only, frozen round. `git diff c3ae2087..HEAD -- FSPEC-pdlc-advisory-wave-gate.md` is
**empty**: the FSPEC is byte-identical to the revision approved in v6. The delta this round is
entirely **upstream** — REQ moved v1.8 → v1.9 (erratum round 5, `680efb0c` + `e619b6d6`), which
restored five round-3 sites a rebase had reverted and landed two Medium corrections. So the review
question is narrow: does the unchanged FSPEC still hold against REQ at HEAD and against the shipped
source at HEAD?

Verified against HEAD, not against documents alone:

- REQ v1.9's new ledger citations are true symbols, not drifted line numbers:
  `export const WAVE_STATE_PATH` (`pdlc/workflows/orchestrate-dev.js:11322`),
  `export function parseWaveLedger` (`:11375`), consumed by the resume block that emits
  `Notice: the wave ledger … was ignored` (`:14218`, `:14221`). No erratum owed upstream.
- The five restored sites the FSPEC leans on all exist at REQ HEAD: C-2's
  `advisory.waveBudgetPerRun` default `1` per Q-1 (`REQ:237`, `:239`, `:575`), O-7 (`REQ:558`),
  M-WG-6 (`REQ:109`), and the Upstream row's `docs/completed/…` path, which resolves on disk
  (`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`).
- FSPEC's dependent references are consistent with those restorations: O-7 at `FSPEC:146` and
  `:494`, M-WG-6 at `:497`, default `1` at `:296`, `:350`, `:456`.
- All seven canonical top-level sections are present (`§1`…`§7`), and the v1.4 sites approved in
  v6 survive at HEAD: AT-04-1a/AT-04-1b (3 occurrences), AT-01-5 (`:329`), A-1 (`:505`),
  A-4 (`:512`). The rebase that damaged REQ did not touch this document.

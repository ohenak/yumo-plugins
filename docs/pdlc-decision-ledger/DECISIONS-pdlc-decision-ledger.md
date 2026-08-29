---
Status: Draft
Author: se-author
Version: 1.0
Feature: pdlc-decision-ledger
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` v1.1, cited by `M-*` id, never restated |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

# DECISIONS — pdlc-decision-ledger

## Context

This document is the **rejected half** of the pdlc-decision-ledger design. What was decided *for*
is in `TSPEC-pdlc-decision-ledger.md`; recorded here is what was decided *against*, and why, for
the choices a later agent could otherwise confidently reconsider — each one is a place where a
plausible, cheaper-looking alternative exists and the reason it was refused is not visible from the
shipped code.

**The envelope the design had to fit.** Four constraints, none of them this feature's to relax,
fix the shape of nearly every decision below:

| Constraint | Where it comes from | What it forecloses |
|---|---|---|
| No engine-runtime edit under `pdlc/engine/` | REQ NG-6 | A new `pdlc/workflows/lib/` module: `MODULE_NAMES` in `pdlc/engine/scripts/prepack.mjs:20` is a frozen vendoring list, and adding a module means editing it (`DEC-LOOPECON-08`) |
| The disabled path is byte-identical | REQ C-2 | Any mechanism whose text cannot be config-gated — notably a `SKILL.md` edit |
| `/\.enabled\b/` is source-count-pinned outside one sentinel region | `pdlc/workflows/__tests__/advisoryDisabled.test.js` PROP-DIS-06, whose `sourceExcludingParser` slices between the literals `// === LEARNINGS INJECTION REGION START ===` and `... END ===` (lines 717–719) | Both a dotted `enabled` read at the new gate, and hiding the new symbols inside the sliced region |
| The rendered extent must equal the Baseline's measured extent | REQ-DECLEDGER-01 against `M-1d` / `M-2e` | Any recognition rule tuned by taste rather than executed against the standing corpus |

**Precedents adopted rather than reinvented**, all in `pdlc/workflows/orchestrate-dev.js`:
`parseLearningsConfig` (line 2252) and its non-negative-int field validator (2283) for per-key
fail-open config; `findingGrammarPart` (11453) for a gated clause contributing zero bytes when off;
`buildLearningsInjector` (2825) wired through `wrapperSeams._injectLearnings` (15186) for the
build-once/call-per-dispatch injector; `LEARNINGS_CORPUS_ARGV` (2230) for `git ls-files`
enumeration through the `_git` seam; and
`pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js` with
`scripts/capture-learnings-baseline.mjs` for the committed byte-identity baseline. Reusing these is
not itself a decision needing a record — refusing to reuse one would have been.

**Project-level decisions honoured and not re-litigated:** `DEC-DOC-01` (cite content, not line
number — the raw `file:line` anchors above are position claims about test slicing that a test
asserts, which is the exemption that decision names), `DEC-ANCHOR-01`, `DEC-ERRROUTE-04`,
`DEC-TERM-01`. `DEC-LOOPECON-08` is a completed feature's decision, not a promoted one, but it is
binding here for the same mechanical reason it was binding there, and is cited rather than
re-derived.

**Measurements are cited, never restated.** Corpus extents live in
`docs/_constraints/pdlc-decision-corpus-baseline.md` (`M-*` ids) and byte figures in TSPEC §3.6;
this document names them and does not carry second copies, so a re-measurement moves one site.

## Options Considered

## Decision

## Consequences

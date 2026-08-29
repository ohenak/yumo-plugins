# PROPERTIES — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES**` (`REQ-pdlc-decision-ledger.md` v1.9, `FSPEC-pdlc-decision-ledger.md` v1.3, `TSPEC-pdlc-decision-ledger.md` v0.7, `DECISIONS-pdlc-decision-ledger.md`, `PLAN-pdlc-decision-ledger.md` v0.3) |
| Downstream | IMPL tests |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | te-author | 0.1 | 2026-08-29 |

## Overview

**What this document is.** The proof system for the decision ledger: a set of falsifiable
properties dense enough that an implementer can write every test in `PLAN` §Batches without asking
a further question, and a reader can audit coverage against `REQ` §5, `FSPEC` §4/§5/§6 and
`TSPEC` §6.1 mechanically.

**What the feature is.** `TSPEC` §1.1 places every new production symbol in one file,
`pdlc/workflows/orchestrate-dev.js` — verified at HEAD as the module already exporting
`parseLearningsConfig` (`orchestrate-dev.js:2252`), `readLearningsConfigSafely` (`:2313`),
`parsePinCheckConfig` (`:2363`), `parseDerivativeStopConfig` (`:2414`), `LEARNINGS_CORPUS_ARGV`
(`:2230`), `renderLearningsBlock` (`:2731`), `gatherLearningsCorpus` (`:2771`),
`buildLearningsInjector` (`:2825`) and `reviewLoop` (`:9194`). `reviewerPrompt` is **module-private**
(declared at `:11433`, not exported), which is why `TSPEC` §1.1 names `reviewLoop` as its exported
caller and why every prompt-byte property below is asserted through `reviewLoop` or `main()`, never
by importing `reviewerPrompt`. The shipped gate shape this feature clones is live at
`orchestrate-dev.js:11453` (`const findingGrammarPart = findingGrammar ? \`\\n${findingGrammarClause()}\` : ""`),
consumed on both return paths (`:11483`, `:11506`).

### The three obligations this document exists to discharge

`REQ` §7 and `FSPEC` §7 route three items to te-author by name, and `TSPEC` §8.2 confirms they are
the only upstream items left open to this layer. Each is discharged in a named section below, and
nothing else in this document is a prerequisite for them:

| Id | Owner | Substance | Discharged by |
|---|---|---|---|
| **O-5** | te-author | Cross-file precedence has **no HEAD instance** (`M-5a` records zero ids held as records in two files), so it is coverable only by construction: a synthetic two-file corpus recording one id both project-level and feature-level | Fixture **FX-PRECEDENCE** (§Fixtures); PROP-PRE-01…04 |
| **O-6** | te-author | `FSPEC` E-2, E-3 and E-4 likewise have no HEAD instance, and `M-4e` records that an empty file and a failed read are separable only by construction; the frozen corpus copy `AT-01` asserts against, and `AT-16`'s recorded round of reviewer outputs, are owed as constructed fixtures too | Fixtures **FX-CORPUS**, **FX-FAILOPEN**, **FX-REPLAY**, **FX-BASELINE** (§Fixtures); PROP-FAIL-01…08, PROP-INV-01…04 |
| **O-8** | te-author | `BR-12`/`BR-13`'s bounds invariant is universally quantified while `AT-13` exercises two examples; it is owed as a **property** parameterised over set size × line sizes × both bounds | PROP-BND-01…06 (`TSPEC` §7.5's four conjuncts, each with its own falsifying mutation) |

`TSPEC` §7.5 additionally promotes two further quantified claims to properties — **P-REC**
(recognition/resolution) and **P-LINE** (one physical line per decision). They are not upstream
obligations on this layer but they are load-bearing for §Oracles' transcribed byte literals, so they
are carried here as PROP-REC-08…11 and PROP-REND-05…07.

### Scope, and the two things deliberately out of it

**In scope:** every observable this feature creates — resolved config, recognised records, selected
records, rendered block bytes, dispatch prompt bytes, the driver-internal
`failedSources`/`emptySources` split (`TSPEC` §6.3), the report field and the notice set.

**Out of scope, stated so no property is invented for them:**

1. **Reviewer compliance with the rule text.** `REQ` R-3 accepts this as unenforceable by
   construction and `TSPEC` §7.7 records the compensating control. Every rule-text property below
   asserts a property of **the emitted text**, never of anyone's classification — which is what
   `FSPEC` AT-07 means by "no human is in the oracle".
2. **`REQ` G-4's retrospective trend.** Non-binding by REQ design, no acceptance criterion, and
   `TSPEC` §2.5 records that its denominator is strictly wider than this mechanism's injection
   surface. Nothing here asserts it.

### Test pyramid

`FSPEC` has eighteen acceptance tests and `TSPEC` §6.1 fourteen failure rows; pushing them to the
cheapest falsifying level is what keeps the suite runnable per wave (`PLAN` T-18 runs it per batch).

```
        /  E2E  \          0 — there is no end-to-end journey; the composition root is the top
       /----------\
      / Integration \      3 seams — reviewLoop composition, main() composition root, replay
     /----------------\
    /    Unit + property  \  the rest — 4 pure functions, 3 properties, 2 corpus oracles,
   /______________________\   1 baseline guard, 1 source census, 1 engine disclosure
```

The composition root (`PLAN` T-10a) is the single most expensive level used, and it is used because
`TSPEC` §7.2 (DC-07) records that a source census proves a string is present and never that a line
runs. No property below is assigned E2E.

### Reading conventions

- **Level** is the cheapest level that can falsify the property, per `TSPEC` §7.2's category table.
- **Fixture** names a `FX-*` entry in §Fixtures. Every property that needs constructed data names
  one; a property naming none is over literals.
- **Task** is the `PLAN` task that owns the property. Red-before-green pairs are written
  `T-05 → T-14`, the `[red]` test task first.
- Every citation is stable content — a spec id, a section anchor, an exported symbol or a verbatim
  quote — per `DEC-DOC-01`. The one exception is a `file:line` anchor where the **position is the
  claim** (the census and the shipped-gate reads above), which `DEC-DOC-01` permits.
- Statement, citation and byte literals quoted below are transcribed from **data** — the frozen
  fixture or the normative spec text — never captured from a renderer, per `PLAN` §Anti-echo
  commitments.

## Properties

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Risks and Routed Items

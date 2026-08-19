---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# FSPEC — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | **REQ** — `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.4); `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Downstream | TSPEC, PROPERTIES |
| Cross-Reviews | *(none yet — v1 draft)* |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-19 |

> **Scope in one line.** The behaviour of the injection step that `orchestrate-dev` performs when it
> composes an authoring dispatch: which corpus documents are eligible, how they are ordered and
> bounded, what the author is told about them, what the run report records, and what happens in
> every corpus state that is not the happy one.

## Overview

`orchestrate-dev` composes every dispatch it makes from a fixed set of parts: the skill prompt, the
phase's grounding manifest, the upstream documents, and the pacing contract. This feature adds one
more part — a **prior-learnings block** — to the dispatches the pipeline already classifies as
authoring, and to no others.

The block is assembled by a **selection step** that runs once per authoring dispatch, immediately
before the dispatch is composed. The step is a pure function of repository state and configuration:
it enumerates the LEARNINGS corpus, discards what it must not use, orders what remains by a stated
key, takes documents until a declared bound binds, and hands the composer a block plus a record of
what it did. It never asks a model anything, never writes to disk, and never returns an error to its
caller — every state it can encounter, including its own failure to enumerate, resolves to a block
(possibly empty) and a reason record.

**What is new, in one paragraph.** Today an author writing `{f}`'s REQ, TSPEC or PROPERTIES sees
`{f}`'s own upstream documents and nothing from the features that shipped before it. After this
feature, that author also sees up to `learningsInjection.maxDocuments` prior LEARNINGS documents,
labelled advisory, in a deterministic order, with the selection and the non-selection both written
into the run report. Nothing else about the run changes: the same dispatches are made, the same
documents are demanded of the same roles, the same completeness criteria score them, and the same
verdicts move the pipeline forward.

**What this specification owns.** The observable behaviour of the selection step and of the block it
produces: eligibility, ordering, bounding, section choice, labelling, reporting, and the outcome of
every corpus state. It binds REQ O-2 (the ordering key, §BR-4) and REQ O-4 (which part of a document
is injected, §BR-6) from measurements taken at HEAD.

**What this specification does not own.** Where the selection step lives in the codebase, what its
signature is, how the block is threaded to the composer, what the report's serialised form is, and
how the corpus predicate is pinned to `consolidate-learnings.js` (REQ O-7). Those are TSPEC's.

### Vocabulary

| Term | Meaning in this document |
|---|---|
| **corpus** | The set of LEARNINGS documents defined by REQ C-3 — under `docs/{feature}/` or `docs/completed/{feature}/`, tracked or untracked but not ignored, excluding `docs/discarded/`. |
| **candidate** | A corpus document after the corpus has been enumerated, before eligibility is decided. |
| **eligible** | A candidate that survives every exclusion rule in BR-2 and is readable and parseable (BR-3). |
| **selected** | An eligible document whose material appears in the composed block. |
| **the block** | The delimited prior-learnings region added to an authoring dispatch's prompt. |
| **the record** | The per-dispatch and run-level data the selection step produces for the run report (§BR-8). |
| **`{f}` / `{p}`** | The feature being authored / a prior feature, as in the REQ. |

## Linked Requirements

Every behavioural rule in this document traces to a REQ acceptance criterion, and every REQ
acceptance criterion is covered by at least one rule and one acceptance test.

| FSPEC id | Behaviour | REQ coverage |
|---|---|---|
| FSPEC-LRN-01 | Which dispatches carry a block | AC-1.1, AC-1.2 |
| FSPEC-LRN-02 | Corpus eligibility and exclusions | AC-1.3, AC-2.6 |
| FSPEC-LRN-03 | Ordering key and total tiebreak | AC-2.2, AC-2.5 |
| FSPEC-LRN-04 | Count bound | AC-2.1, AC-2.2 |
| FSPEC-LRN-05 | Per-document and total byte bounds | AC-2.3, AC-2.4 |
| FSPEC-LRN-06 | Which part of a document is injected | AC-2.3 (binds O-4) |
| FSPEC-LRN-07 | Block labelling and dispatch composition order | AC-1.4 |
| FSPEC-LRN-08 | Per-dispatch record | AC-3.1 |
| FSPEC-LRN-09 | Non-selection reasons, per-document and corpus-level | AC-3.2 |
| FSPEC-LRN-10 | Hand-reproducibility record | AC-3.3 |
| FSPEC-LRN-11 | No erratum channel for injected material | AC-3.4 |
| FSPEC-LRN-12 | Fail-open under every corpus state | AC-4.1, AC-4.2 |
| FSPEC-LRN-13 | Gate-input isolation | AC-4.3 |
| FSPEC-LRN-14 | Admits-nothing configuration | AC-4.4 |
| FSPEC-LRN-15 | Disabled and malformed configuration | AC-5.1a, AC-5.1b |
| FSPEC-LRN-16 | Filesystem footprint | AC-5.2 |
| FSPEC-LRN-17 | Pipeline semantics preserved | AC-5.3 |

### Reverse trace — REQ criterion to acceptance test

| REQ AC | FSPEC rule | Acceptance test |
|---|---|---|
| AC-1.1 | BR-1 | AT-01 |
| AC-1.2 | BR-1, BR-11 | AT-02, AT-03 |
| AC-1.3 | BR-2 (E-SELF) | AT-04 |
| AC-1.4 | BR-7 | AT-05, AT-06 |
| AC-2.1 | BR-5 | AT-07 |
| AC-2.2 | BR-4, BR-5 | AT-08, AT-09, AT-10 |
| AC-2.3 | BR-6 | AT-11, AT-12 |
| AC-2.4 | BR-6 | AT-13 |
| AC-2.5 | BR-4, BR-6 | AT-14 |
| AC-2.6 | BR-2 (E-DISCARDED), BR-2 note | AT-15, AT-16 |
| AC-3.1 | BR-8 | AT-17, AT-18 |
| AC-3.2 | BR-9 | AT-19, AT-20, AT-21 |
| AC-3.3 | BR-10 | AT-22 |
| AC-3.4 | BR-13 | AT-23 |
| AC-4.1 | BR-9 (RSN-EMPTY), BR-12 | AT-24 |
| AC-4.2 | BR-3, BR-12 | AT-25, AT-26, AT-27, AT-28 |
| AC-4.3 | BR-11 | AT-03, AT-29 |
| AC-4.4 | BR-5, BR-14 | AT-30 |
| AC-5.1a | BR-14 | AT-31 |
| AC-5.1b | BR-14 | AT-32 |
| AC-5.2 | BR-15 | AT-33, AT-34 |
| AC-5.3 | BR-16 | AT-35 |
| AC-6.1 | §Acceptance Tests preamble | all ATs |
| AC-6.2 | §Acceptance Tests preamble, AT-31, AT-32 | AT-31, AT-32 |

### Binding constraints inherited

`DC-01` (contracts crossing a component boundary are closed and total) governs the reason-id
catalogues in BR-9: each is a closed set with a completeness test. `DC-05` (every named behavioural
branch has an acceptance test) governs the Acceptance Tests section: the branch inventory in
§Edge Cases and Error Scenarios is the checklist that section is scored against. `DC-18` (a claim
carried by N documents needs an N-document guard) applies to the threshold values of REQ §4.1, which
this document deliberately references by name rather than transcribing by value.

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

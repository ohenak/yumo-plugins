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

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

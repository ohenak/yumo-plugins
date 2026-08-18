# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.4, bytes unchanged since v4 approval)
**Upstream trigger:** REQ v0.12 erratum, `cc009367` (REQ sha256:41fb21e8…)
**Date:** 2026-08-18
**Iteration:** 5 (delta confirmation — not a full re-review)

## Context

Scope of this round: **one question only** — does DECISIONS v0.4 still hold against the REQ as it
now stands? DECISIONS' own bytes are unchanged since the v4 approval (`APPROVAL-HASH`
sha256:8d0c2b02…, `REVIEWED-COMMIT` `8281ef70`). The recorded upstream anchor was REQ
sha256:1038b816… (commit `68e72db2`, REQ v0.11). HEAD's REQ is sha256:41fb21e8… (commit `cc009367`,
REQ v0.12), so the v4 approval was taken against a REQ that no longer exists.

The erratum is +16/−1 lines and lands in exactly one place of substance: a new **"Held classes and
the interim state"** paragraph under C-7 (`REQ-pdlc-plugin-retirement.md:264`–`:275`), plus the
version row and changelog line. It disposes of the held-branch interim state as follows:

- C-7 governs **repo CI checks at each commit**; it does **not** govern this REQ's completion
  criteria, which are evaluated when the sweep is complete (`:265`–`:266`).
- While a deletion class is held, AC-1.1 being unsatisfied is "an incomplete feature on an unmerged
  branch — it is **not** a C-7 red, it is **not** registered anywhere as an expected or tolerated
  failure, and it does not forbid the ungated classes from landing as their own commits"
  (`:267`–`:269`).
- "There is no skip-list, no expected-failure inventory and no tolerated-red register in this
  feature" (`:270`–`:271`).
- "Where a check that observes a held class would otherwise run red in repo CI before that class
  lands, the resolution is **ordering** — the check becomes live with the class it covers — never
  registration" (`:272`–`:274`).
- "The branch does not merge on a green subset: completion is all criteria satisfied at HEAD, held
  classes included" (`:274`–`:275`).

This paragraph is the upstream answer to my own v4 **Q-02** ("do the gated ATs sit behind an edge as
registered expected failures, or as rows simply not authored yet?"). The answer is neither: they are
authored to become live with their class. That answer is now binding on DECISIONS, because DECISIONS
is the document PLAN and PROPERTIES mine for whether a gated oracle may exist red on the branch.

What I re-read at the current version: REQ §C-7/C-8 in full (`:256`–`:281`), and every DECISIONS
sentence that leans on C-7, on "red", or on the gated/held interim state — DEC-07's blocking clause
(`:95`), DEC-10's price paragraph (`:150`), the Decision-table cells for DEC-01 (`:162`) and DEC-07
(`:168`), cross-cutting rule 1 (`:177`), the Consequences class-6 row (`:235`), the gated-merge
paragraph (`:237`), and the PLAN/PROPERTIES obligation sentence (`:281`). Nothing else in DECISIONS
cites C-7 or the interim state, so the confirmation surface is those eight sites.

## Options Considered

Three dispositions were available for this confirmation, and the choice between them is a testing
call, not a bookkeeping one:

- **A — re-affirm unchanged.** The erratum adds no new criterion, deletes none, and changes no
  literal, no count and no ordering fact. Every mechanical claim DECISIONS makes (class closure
  7–12, the batch-DAG edge set, the FSPEC ordering quotes, the M-8 host claim for DEC-09's
  assertion) survives the erratum untouched. Rejected as the whole answer: faithfulness is measured
  against the upstream text as it now reads, not against the item list, and the erratum re-words
  precisely the concept three DECISIONS sites lean on.
- **B — treat the divergence as a fresh substantive conflict.** Rejected: DECISIONS' *conclusions*
  are the erratum's conclusions. "The branch does not merge on a green subset" appears in both
  documents in almost the same words (`REQ:274`, `DECISIONS:237`), and DECISIONS registers nothing
  as an expected failure anywhere — the shape C-8 and the new paragraph forbid is absent from the
  document. There is no decision to reopen.
- **C — confirm the substance, file the transcription divergence (chosen).** DECISIONS says
  "red" for a state the REQ now expressly says is **not** a red, and it nowhere carries the
  erratum's positive rule (ordering, never registration; the check becomes live with the class it
  covers). Under DECISIONS' own cross-cutting rule 2 — transcribe, don't re-measure — the wording
  of a load-bearing upstream term is the contract, and PLAN/PROPERTIES author test rows from this
  document, not from REQ §C-7.

## Findings

## Questions

## Positive Observations

## Decision

## Consequences

## Verdict

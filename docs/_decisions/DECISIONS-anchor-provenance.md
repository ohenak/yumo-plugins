# DECISIONS — anchor provenance

Project-level decisions about who computes and who transcribes the dispatch-hash and
approval-anchor state a review round quotes as "current". Promoted 2026-08-27 by
`/pdlc:consolidate-learnings`, cross-repo consolidation pass `2026-08-27-2`.

Read by `orchestrate-dev` (dispatch construction) and reviewer/author skills that emit
`APPROVAL-HASH`, `REVIEWED-COMMIT`, or `UPSTREAM-STATE` lines.

---

## DEC-ANCHOR-01: a dispatch's quoted hash is harness-computed, never agent-transcribed

**Decision.** The `APPROVAL-HASH`, `REVIEWED-COMMIT`, and `UPSTREAM-STATE` values a dispatch quotes as
"current" are computed by the engine from committed tree state and written into the dispatch verbatim.
No agent — author, reviewer, or orchestrator — hand-copies or retypes one of these values from prose,
a prior document, or its own memory of an earlier round. A value that must be transcribed by an agent
is a value that can drift, and drift here reads as "the document is stale" when the actual defect is
that the harness let a human-shaped step stand in for a content-addressed one.

**Rationale.** Every observed failure in this family is provenance loss, not judgment loss: the
reviewer or author was not wrong about the document, it was quoting a hash that the harness itself had
already superseded, or retyping a value with a shape a downstream parser rejected. Neither failure is a
review defect; both are dispatch-construction defects. Making the anchor harness-computed removes the
transcription step entirely, so there is nothing left for an agent to get wrong.

**Origin.** Cross-repo. `yumo-plugins`: `pdlc-engineering-loop` — a stale dispatch-hash was re-filed as
a Low finding across 54 separate reviews, none of them owed an edit; the round only ever needed the
harness to quote the current hash. `regime-ledger` (external corpus, relayed cross-session 2026-08-27):
`structure-directional-options-scoring` — approval-anchor state was subject to manifest-transcription
drift (a CRLF-shaped value was rejected), re-filed across four separate reviews, with nine approving
rounds on the same document carrying no anchors at all; `longhorizon-daily-baseline` — engine dispatches
quoted a stale FSPEC sha (`ace3aa35…`) as "current" in two separate delta re-confirmations. See
the regime-ledger corpus's harvest summaries (its surviving primary source post-harvest) for the
regime-ledger side.

Note: this decision supersedes the anchor-provenance clause of `CONSOLIDATION-PROPOSAL-2026-08-27-1.md`
row R6 ("compute APPROVAL-HASH/UPSTREAM-STATE anchors harness-side at write time"). R6's other two
clauses — DoD round-index derivation from disk state, and staleness-finding dedup — remain proposal
rows, not promoted by this decision.

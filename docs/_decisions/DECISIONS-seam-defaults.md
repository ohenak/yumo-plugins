# DECISIONS — seam defaults

Project-level decisions about the default value of an injected seam. Promoted 2026-08-19 by
`/pdlc:consolidate-learnings` from LEARNINGS `pdlc-advisory-tier`, `pdlc-headless-engine` and
`pdlc-merge-phase`.

Read by `se-author` (before TSPEC/DECISIONS that introduce a seam) and `te-author`.

---

## DEC-SEAM-01: A seam's default is chosen for what the consumer does with it, not for reading inert

**Decision.** When a function takes an injected seam, its default is the value that **preserves the
pre-feature control flow at the consumer**. "Neutral-looking" is not a criterion; the criterion is
what the branch that reads the seam does with the value.

Every seam ships with a paired guard asserting that the un-injected path is not silently taken —
typically a conjunct on `seam.model !== undefined`, or an explicit "seam never dispatched" assertion
in the covering property.

**Rationale.** Three features paid for the same mistake in three shapes.

- `pdlc-advisory-tier`: `raisePrAndVerifyCi`'s `_runAdvisorySeam` defaulted to `no-action`. The A5
  branch reads that as "the seam observed CI green" and re-polls — so with no seam injected and a
  persistently red CI, the process **spun forever**, with a jest worker pinned at 100% CPU. The
  behaviour-preserving default was `escalated`, which falls through to the byte-identical
  pre-existing halt.
- `pdlc-headless-engine`: `parsePlanOwnership` returning `null` did not fail — it silently
  *downgraded* Phase I to same-tree execution, so the PLAN's ownership manifest stopped being
  enforced without anything going red.
- `pdlc-merge-phase`: the default test double returned `"none"`, which made the membership assertion
  over `QUEUE_ROW_DISPOSITIONS` pass vacuously — the rename that the assertion existed to catch went
  green.

The common shape: an inert-looking default is read by exactly one branch, and that branch's
interpretation of it is a behaviour, not an absence.

**Consequences.**
- A seam's TSPEC entry states the default **and the consumer branch that reads it**, and names why
  that default preserves the pre-feature flow.
- Introducing a seam is a negative-control obligation: prove that with no injection the shipped path
  is byte-identical to the pre-seam path, by mutation (DC-06).
- A seam's terminal `catch` never constructs the terminal value directly; it routes through the one
  builder that owns it, or it will emit a value outside the closed catalogue the spec declares
  (`pdlc-advisory-tier` DoD v1 finding 3 — one `catch` falsified three acceptance criteria on one
  path).

**Testability.** Two cases per seam: (i) seam injected, asserts the new behaviour; (ii) seam absent,
asserts the pre-feature terminal value *positively* — not merely "did not do the new thing" (DC-14).

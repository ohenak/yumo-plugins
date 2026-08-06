# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 7
**Scope:** Local (delta re-review — v6 findings + changed sections only)
**Baseline diffed:** `00fe885..HEAD` (5 revision commits, +178/−213; 663 lines, down from 698)

## Prior-Finding Disposition

All five v6 findings, checked against the revision.

| v6 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Resolved — the derivation basis moved** | AC-5.1 now derives `failure-mode-id` "from the promotion's `phase` and its target `artifact`, and from **nothing else** — not from the pass, not from its consumed set, and **not** from `symptom`" (`:362-363`), and `symptom` is retitled "one line, human-readable and explicitly **non-keying**" (`:364`). The new "Why those inputs" paragraph (`:368-372`) states the finding's own argument back — "Determinism of the derivation is not stability of its inputs … `symptom` is a line the pass's own model writes under no vocabulary, so two passes recognising one failure mode from different corpora would word it differently and slug differently" — and names the case it must survive (AC-3.8b's larger-consumed-set abandonment). This is v6 Q-02's narrow variant, taken whole, including its stated cost. The key now fires across the abandonment it was moved to close. |
| F-02 | Medium | **Resolved, and the downstream restatement came with it** | AC-5.1's "Uniqueness, scoped" paragraph (`:374-379`) picks the first of the three resolutions and states both halves: unique **within one pass** (two promotions deriving one id "are one failure mode, and are recorded once — the pass never mints a suffixed variant, which would break derivation purity"), deliberately repeating **across** passes, with log records keyed `(failure-mode-id, passId)` and promotions keyed on the id alone. Crucially it did what v6 Q-03 asked: AC-5.2's set-equality sentence moved with it — "exactly one row per **distinct `failure-mode-id`** recorded in prior passes — records sharing an id are one promotion carrying one standing verdict, not two rows" (`:414-415`) — and AC-5.3 ("counted per `failure-mode-id`", `:423`) and AC-5.4 ("The unit retired is a `failure-mode-id` (AC-5.1), not one of its records", `:432`) were both restated in the same terms. The referent is unambiguous. That restatement is also what makes v7 F-01/F-02 decidable — see below. |
| F-03 | Medium | **Resolved, and by removing the write rather than arguing about it** | Two changes. (a) The marker left the log: it is now "a single `IN-PROGRESS: {passId} {ISO-8601}` line in a file of its **own**, `docs/_decisions/.consolidation-lock` — deliberately **not** in `.consolidation-log.md`, because taking and releasing it are in-place rewrites of a whole small file and every write to the *log* must stay an append" (`:166-169`). (b) The granularity obligation is stated as an obligation, not implied: "Every write to `.consolidation-log.md`, by any pass, is a single **append of one whole record at end of file**. A whole-file read-modify-write of the log is **forbidden**, not merely unnecessary: it is the one shape that loses a concurrent append" (`:191-193`), and the two writes that would have violated it are named and disposed of — the marker moved out, the consumed pair "emitted **complete, in one append**, its consumed set being fixed at step 1 of the tick order before any promotion work" (`:194-195`). The comma splice is gone and the conclusion now follows its premise. NFR-5 was updated to match (`:526-527`), so the two statements of the block's write agree. This is the stronger of the two fixes I offered. |
| F-04 | Low | **Resolved** | Step 1 now names the directories inline — "`docs/completed/pdlc-merge-phase/`, `docs/completed/pdlc-review-loop-hardening/` and `docs/completed/pdlc-workflow-distribution/` each hold one LEARNINGS — so depth-1 hides 3 of the 5 at HEAD" (`:130-132`). All three confirmed on disk (row 4 below). The dangling "named below" is gone. |
| F-05 | Low | **Resolved** | `duplicate-suppressed` is removed from AC-3.5's failure-class table and replaced by an explicit non-membership statement — "`duplicate-suppressed` is **not** a member of this table: it is decided per promotion before any PR is attempted, fires no fallback, and is stated in NFR-4" (`:274-275`). §4b's row followed (`Used by` is now `NFR-4` alone, `:576`), and the only remaining "Fallback fires?" values are the four `yes` rows, so the table no longer carries a member its own `Given` excludes. |

Five of five resolved. The document also shrank by 35 lines under TE F-41's size pressure without,
as far as this pass can tell, dropping a checkable fact — every compression I spot-checked either
kept the claim or delegated it to an AC that states it (AC-1.4's streak note now points at AC-5.3
and AC-5.5, and both do state it: `:424-425` and `:436-438`).

The three findings below are **new**. All three are consequences of the F-01/F-02 fix: making
`failure-mode-id` stable and promotion-scoped is right, and it puts that id into contact with
NFR-4's key set in ways the previous, unstable id hid.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict

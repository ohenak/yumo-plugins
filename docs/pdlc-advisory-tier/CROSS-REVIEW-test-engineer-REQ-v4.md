# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (v1.4)
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** delta confirmation of the v1.4 erratum only (`b81d7d4..HEAD`). I approved this REQ at v1.3 (`APPROVAL-HASH` in v3, `REVIEWED-COMMIT: b81d7d4`); this round asks one question — does the erratum resolve the routed items without breaking what was approved. Unchanged sections are not re-read or re-litigated. Not product strategy, not architecture.

## Erratum Item Closure

The routed items deduplicate to six distinct defects (the list carries each once per reviewer who
raised it). All six are closed. Each row names the changed text and the oracle it now makes writable.

| # | Item (raised by) | Closed by | Status |
|---|---|---|---|
| 1 | §1 seam-table row A2 describes the stale-REQ re-grounding obligation as already living inside the Phase-0 triage prompt (se-review, pm-author, te-review) | The row now reads "Stale-REQ re-grounding — **no such gate exists today**; this feature introduces A2's trigger", with the Today column "nothing fires; a stale REQ runs unnoticed" (`:35`). Verified against the pinned base: `26c3f1c:pdlc/workflows/orchestrate-queue.js` triage prompt carries only `Also flag if the REQ references subsystems that do not yet exist` and `Do NOT modify any files` — no re-grounding obligation, and no verdict token distinguishing staleness from a dependency stop. AC-5.5 was updated in the same edit to match ("Today's stop is one free-text signal and A2's gate does not exist"), so §1 and REQ-ADV-05 now agree. | **Closed** |
| 2 | AC-4.5's A1 gate row is vacuous — the named gate is a pure function of unchanged inputs (se-review, pm-author; my own v3 **F-21**) | The A1 row is now `**none** — A1 changes no file, so no gate's inputs change and no re-run could differ; the dependency pre-check runs **before** the adjudication (AC-5.1)`, state-to-reach `n/a — pre-condition, not post-action gate` (`:181`). AC-5.1's matching clause changed from "is the gate AC-4.5 re-runs" to "runs before any advisory agent as a pre-condition, not as an AC-4.5 post-action gate" (`:198`). This is F-21's suggested resolution taken: the tautological oracle is gone, and the A1 safety property a test can actually falsify is AC-5.1's `escalate`-when-unsettled routing. | **Closed** (F-21 closed) |
| 3 | AC-1.7's `seamBudgetMinutes` default of 10 is below the pipeline's own 30-minute CI completion cap, so `attemptBudget` can never bind at A5 (se-review, pm-author) | AC-1.7's cell now reads "advisory working time per seam invocation, **excluding** check-rollup wait (NFR-4)" (`:100`), and NFR-4 (`:328-331`) carries the carve-out plus the arithmetic that makes it load-bearing. The two now say the same thing as FSPEC V-5 / A5-3, so REQ and FSPEC no longer disagree on what the ten minutes measures. | **Closed** |
| 4 | AC-8.2 defines one attempt as *fix → push → re-poll*, which does not cover E-1's re-run-only cycle (te-review, pm-author) | AC-8.2 now reads "One attempt is one **act→re-poll** cycle, the act being either a pushed fix (E-2) or a re-run on the unchanged commit (E-1, which pushes nothing) — so E-1's re-run-only cycle counts as one attempt on the same budget" (`:250-252`), and AC-1.7's budget row was changed to "act→re-poll" in the same edit (`:99`). E-1's own decidable rule already caps on `advisory.attemptBudget` (`:129`), so the three statements are now consistent and the budget-counting oracle for an E-1-only invocation is determinate: N re-runs on an unchanged sha consume N attempts. | **Closed** |
| 5 | AC-9.3 binds distil-and-delete to "after Phase PUB" but Phase MERGE runs after PUB and merges the PR raised there (se-review) | AC-9.3 now states "MERGE runs after PUB and merges the PR raised there, so the distil-and-delete is pushed **before** MERGE evaluates the PR: the merged branch carries the LEARNINGS content, not the record" (`:283-285`). That is an assertable property of the merged tree, not just of the working tree at end of run. | **Closed** |
| 6 | AC-9.1 requires a record for A1/A2 but AC-9.3's harvest presumes a run that reaches Phase PUB, which a `hold`/`escalate` candidate never has (se-review) | AC-9.1 now states the record is written under the **candidate feature's** directory and that a `hold`/`escalate` adjudication "leaves it for that feature's next run to harvest at Phase PUB (AC-9.3)" (`:273-275`). The record has a named location and a named (conditional) end of life; see Q-11 for the residual case where that next run never comes. | **Closed** |

## Regression Check

Does the delta break anything I approved at v1.3? I checked each touched anchor against what my v1–v3
approvals rested on.

| Approved property | Effect of the v1.4 delta |
|---|---|
| **F-14 resolution (one-sided pre-check, `escalate` when presence-in-base is unsettled)** — AC-5.1 | Intact. The one-sidedness sentence and the `escalate` routing are byte-identical; only the pre-check's *role* label changed (gate → pre-condition). The AC-5.1 acceptance test is unaffected. |
| **F-16 resolution (E-2's two-baseline `introduced` test, AC-8.4 evaluated first)** — E-2, AC-8.4 | Untouched by the delta. AC-8.2's generalisation to *act→re-poll* does not weaken E-2's rule; E-2 still requires a push, E-1 still requires "identical commit sha with no push between them" (`:129`), so the two envelope entries remain mutually exclusive and a fixture can still target exactly one. |
| **F-17 resolution (single deletion oracle for AC-9.3)** — AC-9.3 | Strengthened, not replaced: one terminal observable, now with an explicit ordering relative to Phase MERGE. The guard sentence (refusal message + file survives) is unchanged. |
| **F-19 resolution (ordered refusal table)** — AC-3.6 | Unchanged. Row 4 (`post-action-verification-failed`) still names "the AC-4.5 gate or the AC-7.4 test re-run"; with A1 now having no gate, row 4 is simply unreachable at A1 — consistent, not contradictory, and the set-equality test is over the reason catalogue, not per-seam reachability. |
| **AC-4.4 (never alters a queue `Status` cell)** | Reinforced — it is the premise the new A1 row reasons from ("A1 changes no file"). |
| **NFR-4 measurability** | Changed but still black-box assertable: an A5 invocation whose rollup wait exceeds the default while its working time does not must *not* escalate as `budget-exhausted`. That is a falsifiable oracle at REQ altitude; how working time is instrumented is TSPEC's. |
| **Round size / structure** | The erratum is +21/−13 lines with a v1.4 lineage line at `:20`; no section was removed and no AC renumbered, so every prior traceability reference still resolves. |

No approved property is broken. One new inconsistency was introduced by item 2's fix (F-24 below),
and two of my v3 Lows (F-22, F-23) were out of scope for this erratum and remain open.

## Findings

One new Low, introduced by the item-2 fix; two carried Lows the erratum did not scope. Nothing High
or Medium. Numbering continues from v3.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-24 | Low | Local | **AC-4.5's lead sentence is now falsified by its own A1 row, and AC-4.6 turns that into a test that cannot be written.** The lead reads "Given a resolution is applied, Then a gate **re-runs** and reaches its own verdict" — universally quantified over seams — while the A1 row now reads `**none**`. AC-4.6 then requires that "each of AC-4.1 through AC-4.5 has a failing test proving the prohibition holds, and each such test asserts the AC-3.6 positive triple on the same path". For AC-4.5 at A1 there is no gate to prove re-runs and no refusal triple to assert, so the AC-4.6 obligation for that cell has no realisable fixture — the same vacuity F-21 removed, displaced one sentence upward. **Resolution:** one clause on the lead — "Given a resolution is applied **that changes state**, Then a gate re-runs …; A1 applies no state change and is excepted, its safety resting on AC-5.1's routing" — so AC-4.6's per-seam obligation reads over the four seams that have gates. | AC-4.5 (lead sentence + A1 row), AC-4.6 |
| F-22 | Low | Local | **Carried unchanged from v3 — AC-3.6 does not say what the triggers are matched against, and on A5's main path rows 4 and 8 both match with opposite expected values.** The AC-8.2 rewording does not touch it: an *act→re-poll* cycle that exhausts `attemptBudget` still matches row 4 over the invocation's history and row 8 over its terminating condition, leaving the reason cell of the most-exercised A5 test under-determined. **Resolution** (unchanged): one sentence above the table — "a trigger is matched against the condition on which the invocation terminates, not against conditions encountered earlier in it". | AC-3.6 (rows 4, 8), AC-8.2, AC-2.4 |
| F-23 | Low | Local | **Carried from v3, and the delta widens it slightly — AC-9.3's terminal observable is still stated unconditionally but is false on the halt path.** v1.4 adds "the merged branch carries the LEARNINGS content, not the record", which is a second completion-path-only claim: a run that escalates at A3/A4/A5 halts before Phase H, so no LEARNINGS is written, no delete occurs (correctly — the extended guard refuses it), and no PR is merged. A test author writing the escalation-path acceptance test from this sentence asserts absence and gets a red for the right behavior. **Resolution** (unchanged): qualify with "at the end of a run that reaches completion; a run that halts leaves the record in place, which the extended guard enforces anyway since no `LEARNINGS-{feature}.md` exists yet." Note AC-9.1's new sentence supplies exactly this qualifier for the A1/A2 `hold`/`escalate` case — AC-9.3 needs the A3/A4/A5 halt equivalent. | AC-9.3, AC-9.1 |

## Questions

Q-10 from v3 stays open and TSPEC-answerable. One new question from the AC-9.1 change; neither blocks
a REQ-level acceptance test.

| ID | Question |
|----|---------|
| Q-11 | AC-9.1 now ends a `hold`/`escalate` advisory record's life at "that feature's next run … at Phase PUB". For a candidate that is held repeatedly — or held and never picked again — that next run may never occur, so the record persists and each subsequent queue invocation appends to the same `ADVISORY-{feature}.md`. Is unbounded append the intended behavior (records are append-only evidence, so growth is fine), or should a re-adjudication of the same candidate be expected to find and extend the prior record? The answer decides whether the A1/A2 acceptance test asserts *one* record per adjudication with no upper bound, or a merge/idempotence property across invocations. |

## Positive Observations

- **Item 2 is the right kind of fix.** The v1.3 A1 row named a real function and a real state, and
  was still untestable; deleting the gate rather than inventing a plausible one is the answer that
  leaves the test author with an oracle that can go red (AC-5.1's routing) instead of one that
  cannot. AC-5.1 was changed in the same edit, so the two do not drift.
- **NFR-4 states its own arithmetic.** "(without that carve-out the CI completion window, which
  exceeds the default, ends every A5 invocation inside attempt 1 and `advisory.attemptBudget` never
  binds)" is the reason the exclusion exists, written into the requirement. The next reviewer does
  not have to re-derive it, and a future edit that drops the carve-out has to argue with it.
- **AC-8.2's generalisation preserves the discriminator.** Widening one attempt to *act→re-poll*
  could have blurred E-1 and E-2; instead both decidable rules still pivot on whether a push
  occurred, so the two branches remain separately fixturable and the attempt counter is one shared,
  determinate integer.
- **Five of the six items were closed by changing text in two or more places.** §1↔AC-5.5,
  AC-1.7↔NFR-4, AC-1.7↔AC-8.2↔E-1 — each pair was updated together rather than leaving a stale
  sibling. That is what kept this round's regression surface as small as it is.

## Recommendation

## Verdict

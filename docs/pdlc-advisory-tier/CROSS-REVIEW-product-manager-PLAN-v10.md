# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md
**Date:** 2026-08-04
**Iteration:** 10 (delta re-review)

**Scope of this round:** delta only. Base `06040a4` (PLAN v1.9, the bytes this reviewer approved at
v9) → head `10d875d`. `git diff 06040a4 HEAD -- docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md`
returns **empty**, and `git log 06040a4..HEAD -- <PLAN>` lists **no commit**: the PLAN is byte-identical
to the version approved last round. The 26 commits in that window touch cross-review files, the
approval-anchor record (`10d875d`) and **`PROPERTIES-pdlc-advisory-tier.md`** (`218 ++++---`,
`git diff 06040a4 HEAD --stat -- docs/pdlc-advisory-tier/`) — the last of which is the only change
that can reach this document, because the PLAN cites PROPERTIES by line range. That, and re-grounding
of the anchors the v1.9 cell relies on, is this round's whole scope. Unchanged sections already
approved are not re-reviewed.

## Prior findings — disposition

No prior finding is open. v9 recorded **zero** findings at any severity and closed with
`VERDICT: Approved` (`CROSS-REVIEW-product-manager-PLAN-v9.md:114`); the Medium it cleared (v8 F-01,
§3's A-07 row) was verified resolved at that round and the bytes have not moved since, so it cannot
have regressed. Re-confirmed rather than assumed: `PLAN:258` clause (b) still reads "each need that
seam's gate *representation* to exist — its `verifyGate` for A2/A4/A5, its `verifyGate: null` for A1
**and A3**", and the three upstream anchors it cites all still resolve at HEAD —
`FSPEC:378` = "| A3 | **none.** A3's product is a classification only: its `permittedActions` is
`[]`…", `TSPEC:657` = "| A3 | **`null`** — same shape as A1: `permittedActions: []`, step 6
unreachable, `resolved` never reached |", `DECISIONS:698` = "## DEC-ADV-11: A3 has no post-action
gate…". Block assignment is untouched (A3+A4 ⇒ `A-23`, A5 ⇒ `A-24`, A1+A2 ⇒ `A-31`).

## Findings

One Low, arising entirely from movement in a *cited* document rather than from any edit to this one.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **The `PROPERTIES:570-572` line-range citation, used twice, no longer points at the passage it names.** `PLAN:258` (§3, A-07, end of clause (b)) and `PLAN:1027` (§10, the v1.9 changelog row) both justify the install-the-stub form with "…undiagnosed until A-23, per `PROPERTIES:570-572`". At the time v1.9 was written those lines opened "Asserting conjunct 1 at A3 would require stubbing a gate A3 never reaches…". PROPERTIES was revised in this window (`git diff 06040a4 HEAD --stat` → `PROPERTIES-pdlc-advisory-tier.md \| 218 ++++---`) and that passage now sits at **`PROPERTIES:622-627`** ("Asserting conjunct 1 of the A2/A4/A5 form at A1 or A3 would instead require stubbing a gate they never reach … would fail against a correct build, in the RED batch (A-07) that authors it"). `PROPERTIES:570-572` now lands mid-paragraph in the *A2/A4/A5* O-1 discussion ("the `ADVISORY-{feature}.md` `Disposition` row and the `ESCALATIONS.md` `Refusal reason` row…") — adjacent, same section, not contradictory, but not the sentence the PLAN says it is. **Why it is only Low:** the rule the citation supports is stated in full and correctly in the PLAN itself at both sites and does not depend on the pointer; an A-07 author who follows it lands in the right section of the right document. **Fix (two cells, no structural change):** replace both occurrences of `PROPERTIES:570-572` with the stable anchor the PLAN already uses one clause earlier — **PROPERTIES §6 (PROP-GATE-01…05)** — optionally with the current range in parentheses. PROPERTIES is still in its own review loop, so any line range pinned now will drift again; §6/PROP-GATE-NN will not. Note the reciprocal cite already survives the churn in the other direction: `PROPERTIES:623` points at "`PLAN:869`, `PLAN:258`", both correct at HEAD. | AC-4.5 (REQ), FSPEC §18.2 |

The changed-and-cited surface was scanned for anything above Low; nothing was found.

- **The rule itself did not diverge from the revised PROPERTIES — it converged.** PROPERTIES §6 now
  states the two-conjunct form explicitly (`PROPERTIES:605-618`: conjunct 1 the per-path positive
  O-1 triple, conjunct 2 `verifyGate === null` asserted directly, "the mutation control, and at these
  two seams it is the *only* one available"), and the direction warning at `PROPERTIES:620-623` —
  "at A2/A4/A5 the mutation is to **replace** the declared gate…; at A1/A3 it is to **install** that
  same stub" — is word-for-word the contract `PLAN:258` and `PLAN:869` already carry. The revision
  strengthened the upstream statement of the very rule this PLAN cell encodes; no reinterpretation,
  no narrowing, nothing for the PLAN to chase beyond the pointer in F-01.
- **No acceptance criterion moved.** AC-4.5's five-row gate table is still quantified over in full at
  `PLAN:869` ("**One parameterised case per `ADVISORY_SEAMS` member** — driven off the exported
  constant, so a new seam fails the suite until it has a case"), and §3's set-equality driver is
  intact at `PLAN:258` ("the union of per-seam gate-case names registered in this file equals
  `ADVISORY_SEAMS` as a set"). Completeness is by set-equality over the exported enumeration, not by
  containment: a deleted case fails, a sixth seam with no case fails.
- **No absence-only oracle was introduced.** Every negative in the cited cells is paired on the same
  path — "`resolved` is unreachable on every path" is carried with "terminates in `escalated` or
  `no-action` with its own O-1 triple", and the P-1…P-4 prohibition cases each assert "the negative
  *and* the V-8 positive triple on the same path" (`PLAN:258`).
- **No implementation echo.** Expected values in both cells are literal transcriptions from the
  product contract (`escalated`, `no-action`, `verifyGate === null`, `async () => ({ passed: true })`
  as the mutant), traced to `FSPEC:378` / `TSPEC:657` / `DECISIONS:698`, never derived from the code
  under test.

Structural invariants re-verified at HEAD rather than carried over: the task table still enumerates
**36** distinct task IDs, A-01…A-36 with no gap and no duplicate
(`grep -oE '^\| (A-[0-9]{2}) \|' … | sort -u`), matching the 36 ownership rows; the file the changed
row names, `pdlc/workflows/__tests__/advisoryDriver.test.js`, is still correctly declared **new** by
A-07's 🔴 RED role — `ls pdlc/workflows/__tests__/` at HEAD lists 68 test files and no
`advisoryDriver.test.js`. (`advisoryPreflight.test.js` *has* appeared there, untracked, since v9; it
is not a file any task row claims as pre-existing, so no row is falsified by it.)

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v8/v9, unchanged and still purely informational. §8.2's registry names "A3's `SeamOps`" as A-23's un-skipper while §3's A-23 row (`PLAN:274`) lands both A3's `SeamOps` and A4's `verifyGate` in that one task. One task lands both symbols, so the block assignment is unambiguous either way; the note is only that a *future* split of A-23 would move the un-skip point under §3's stated rule without any text needing to change. No edit requested. |
| Q-02 | **Closed this round.** v8 and v9 both recorded that `PROPERTIES` framed A1's gate row as "the one place the upstream documents disagree" and cited stale `TSPEC:638`/`:640` offsets. The PROPERTIES revision in this window resolved both: §6 now states the settled two-conjunct contract (`PROPERTIES:605-618`) and cites `TSPEC:434-439` for step-6 unreachability, with the disagreement framing gone. Recorded here so harvest reads it as closed rather than open. |
| Q-03 | New, and not a blocker — a process observation for the operator rather than a request to the author. The PLAN is byte-identical to v1.9 yet has now consumed a tenth review round, because iteration 10 was dispatched against an unchanged document. Everything this round could find had to come from *other* documents moving underneath it (F-01 is exactly that). If the phase is converging on an unchanged artifact, the cheaper signal is the empty `git diff` itself. |

## Positive Observations

- **The document held still while its neighbours moved.** Between v9 and v10 the branch took 26
  commits, including a 218-line rewrite of PROPERTIES §6, and the PLAN absorbed none of it. Nothing
  was opportunistically re-touched, no citation was "refreshed" speculatively, no task, edge,
  ownership row or batch label drifted. A plan that stays still while the reviews around it churn is
  the state you want going into Phase I.
- **The contract survived an upstream rewrite unchanged — which is the real test of it.** PROPERTIES
  §6 was substantially re-authored this window, and the rule it now states
  (`PROPERTIES:620-623`: replace at A2/A4/A5, install at A1/A3) is the same rule `PLAN:258` and
  `PLAN:869` have carried since v1.7 and v1.9. When two documents are re-derived independently and
  land on the same sentence, the contract is settled rather than merely copied.
- **The reciprocal citation is the durable one.** `PROPERTIES:623` pins its rationale to
  `PLAN:869`, `PLAN:258` — both still exact at HEAD — while the PLAN's pin into PROPERTIES drifted
  (F-01). The asymmetry is instructive: the PLAN's line numbers are stable because the PLAN is
  frozen; PROPERTIES' are not because it is still in loop. Citing the stable document by line and the
  in-flight one by section is the pattern worth keeping.
- **A1 and A3 are still named symmetrically, over the full enumeration.** "its `verifyGate` for
  A2/A4/A5, its `verifyGate: null` for A1 **and A3**" covers all five seams rather than a rule plus
  an exception list, so a sixth seam cannot quietly fall outside it — and the set-equality driver
  against `ADVISORY_SEAMS` is what makes that structural rather than aspirational.
- **36/36 still holds, verified not assumed.** Task IDs A-01…A-36, no gap, no duplicate, matched
  one-for-one by ownership rows, with the one file the last-changed row names correctly declared new.

## Recommendation

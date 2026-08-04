# Cross-Review: test-engineer — PLAN (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md (v1.9)
**Date:** 2026-08-04
**Iteration:** 9
**Scope:** Delta re-review of PLAN v1.9 against the bytes I approved at v8 (`279bc38`), diff
`279bc38..HEAD` (fix commit `06040a4`) — I carried no open finding out of v8, so the whole question
is whether this round's edit broke anything. Unchanged sections are not re-reviewed.

## 1. Prior findings — disposition

My v8 review closed with **Approved, 0H/0M/0L** — no finding was carried out of it, and v7's single
Low (F-01, the `TSPEC §5.4` → `FSPEC §5.4` label slip at `PLAN:869`) was verified resolved there.
There is therefore no prior-finding backlog to re-check at v9; the disposition table below records
that state explicitly rather than leaving it implied.

| Item | Disposition | Evidence I checked |
|---|---|---|
| **v8** — no findings filed | **Nothing open.** `CROSS-REVIEW-test-engineer-PLAN-v8.md:41` files "None", `:78` records `{"high": 0, "medium": 0, "low": 0}` | — |
| **v7 F-01 (Low)** — wrong document label on §8.2's gate-row quantifier | **Still resolved.** `PLAN:869` continues to read "every gate row of **FSPEC §5.4**" with the FSPEC/TSPEC disambiguation in-line; this round's diff does not touch §8.2 at all | `PLAN:869`; diff `279bc38..HEAD` contains no §8.2 hunk |

## 2. What changed, and does it hold up

The diff since the bytes I approved at v8 contains exactly three hunks — the version stamp
(`PLAN:16`, 1.8 → 1.9), the **§3 A-07 row's item column** (`PLAN:258`), and a new §10 changelog row
1.9 (`PLAN:1027`). The working tree carries no uncommitted edit to the PLAN
(`git status --porcelain` is clean for `docs/`). The substantive hunk is one clause and one
parenthetical inside a single table cell, applying pm `-v8` F-01: §3's A-07 row had said the per-seam
gate-exclusivity cases "each need that seam's `verifyGate` to exist" and named **A1** as the only
gateless seam — a claim §8.2 had already stopped making at v1.7.

**The correction is factually right, and I re-verified every anchor it cites against the upstream
bytes rather than against the changelog:**

- `DECISIONS:698` is indeed `## DEC-ADV-11: A3 has no post-action gate — the FSPEC ⟷ TSPEC divergence
  resolved in TSPEC's favour`.
- `FSPEC:378` is the gate table's A3 row, reading "**none.** A3's product is a classification only:
  its `permittedActions` is `[]` (A3-6, §7.2) … A3 has no independent post-action gate", inside the
  §5.4 table already established as `FSPEC:361-380`.
- `TSPEC:657` is the A3 row of §5.5's `verifyGate` table: "**`null`** — same shape as A1:
  `permittedActions: []`, step 6 unreachable, `resolved` never reached". `TSPEC:655` gives A1 the
  same `null`, and explicitly states it is "deliberately **not** `async () => ({ passed: true })`:
  that is the trivially-passing stub FSPEC T-03-6(b) treats as a falsifying mutation".
- `PROPERTIES:570-574` carries the mutation-direction rationale the new clause paraphrases: "For
  **both** rows the assertion is therefore: `resolved` is unreachable on **every** path, and each path
  terminates in `escalated` or `no-action` with its own O-1 triple. Asserting conjunct 1 at A3 would
  require stubbing a gate A3 never reaches and would fail against a correct build, in the RED batch
  (A-07) that authors it, and not be diagnosed until A-23."

**The testing substance of the edit is the part that matters, and it is correct.** A-07 is the RED
task that *authors* the per-seam gate-exclusivity cases, so the stale clause was not a cosmetic
mislabel: an implementer reading only §3 would have written A3's case in the **replace-the-gate**
form, stubbing a gate A3 never reaches, and that case fails against a *correct* build inside its own
RED batch — the worst failure mode a RED task can have, because a RED batch expects red and the
signal is indistinguishable from the intended one until A-23 lands the real seam at batch 10. The
revised clause (b) now reads "each need that seam's gate *representation* to exist — its `verifyGate`
for A2/A4/A5, its `verifyGate: null` for A1 **and A3**", and the parenthetical spells out the
install-the-stub form for both gateless seams.

**Oracle quality of the corrected cell (this is the check I actually care about):**

- **No absence-only oracle.** Each gateless case is specified as four conjuncts, not one negative:
  `verifyGate === null`; `resolved` unreachable **on every path**; the seam **terminates in
  `escalated` or `no-action` with its own O-1 triple** (the positive assertion on the same path); and
  the mutation conjunct. The v1.7 §8.2 wording had exactly this shape and §3 now matches it.
- **The mutation direction is stated in both directions and is falsifiable.** Declaring seams (A2,
  A4, A5) mutate by **replacing** the gate with `async () => ({ passed: true })`; gateless seams (A1,
  A3) mutate by **installing** it, and the case must fail when it is installed. That is a real
  mutation check, not an assertion about source text.
- **Set-equality survives unchanged.** The tail of the cell — the single case asserting that the union
  of per-seam gate-case names registered in the file equals `ADVISORY_SEAMS` **as a set**, written
  over an in-file registry rather than over case results because it is un-skipped at batch 9 ahead of
  the per-seam blocks — is byte-identical to the version I approved at v8. A sixth seam still fails
  the suite until it has a case; a deleted case still means a deleted registry row, which the
  set-equality case then fails.
- **Block assignment did not move**, which is what keeps the un-skipper rule intact: A3+A4 ⇒ `A-23`
  (batch 10, and `PLAN:274` confirms A-23 is the task landing "A3's `permittedActions: []` with
  throwing `apply`/`revert` stubs"), A5 ⇒ `A-24`, A1+A2 ⇒ `A-31`, prohibitions + set-equality ⇒
  `A-22`.

**Consistency sweep for residue.** I grepped every line of the PLAN mentioning A3 together with a
gate. Nothing left in the document claims A3 has a post-action gate: `PLAN:258` (the edited cell),
`PLAN:274` (A-23, gateless stubs), `PLAN:855` and `PLAN:869` (§8.1/§8.2, both already carrying the
A1-and-A3 form since v1.7) all agree, and §3 no longer contradicts `PLAN:869`.

**Mechanical contract re-derived over the current bytes**, with the shipped parsers in
`pdlc/workflows/orchestrate-dev.js` — `parsePlanTasks` (`:2039`), `parsePlanOwnership` (`:2257`),
`validatePlanContract` (`:2344`), `computeTopologicalBatches` (`:6533`): **36** tasks, **36**
ownership rows, `validatePlanContract ⇒ {"ok":true}`, **20** topological batches — identical to v6,
v7 and v8. The enlarged parenthetical introduced no stray `|` that could re-shape the §3 task table;
the 36/36 bijection re-deriving cleanly is the mechanical proof of that. Test-file paths named by the
edited row (`pdlc/workflows/__tests__/advisoryDriver.test.js`) are unchanged and remain declared-new
by A-07's row and its §4 manifest entry (`PLAN:329` gives A-22 the same file); no file claim moved.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

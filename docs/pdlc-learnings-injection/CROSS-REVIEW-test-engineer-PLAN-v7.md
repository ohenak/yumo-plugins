# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md
**Upstream that moved:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.12 → v0.13)
**Date:** 2026-08-20
**Iteration:** 7 (upstream-cascade confirmation; PLAN's own bytes unchanged)

## Overview

**Question answered.** Does PLAN v0.4 still hold as approved (TE PLAN v6, "Approved with minor
changes") measured against its upstream **at HEAD**, given that FSPEC moved v0.12 → v0.13 after that
approval was recorded? PLAN's own bytes have not changed; my v6 approval was taken against FSPEC
`sha256:fb18dbda…` and the FSPEC at HEAD is `sha256:ae75fa62…`.

**What the erratum changed** (`git diff c1d7218e..HEAD -- FSPEC`), three decisions plus bookkeeping:

1. **BR-6's byte-accounting basis is now material-only.** A document's *contributed bytes* are the
   section headings and bodies taken, and framing — identification line, per-document delimiters and
   source-path label, block preamble — is charged to no threshold (REQ AC-2.3, "the material taken").
2. **`maxBytesPerDocument: 0` is decided.** New edge **E-36**: no document yields material, every one
   carries `RSN-NO-MATERIAL` and **consumes no slot**, and the run is BR-14's enabled, empty-selection
   run. **AT-30 grows a third case** and a new conjunct; `RSN-NO-MATERIAL`'s catalogue meaning and
   D-12's question are restated over "yields material" rather than "carries a section".
3. **F-O-1 now owns two heading-recognition rules** — the BR-3 document-shape predicate **and** the
   rule by which a heading counts as one of BR-6's named sections (numbered form / bare title /
   prefix) — both bytes-only and model-free, both discharged to TSPEC.

**Answer in one line.** PLAN mostly holds — change 1 moved FSPEC **toward** PLAN and closes a
divergence I recorded in v6 — but change 2 leaves PLAN's compression of AT-30 a **proper subset** of
upstream's: no PLAN task schedules E-36's branch and no red test pins it. That is a coverage gap, not
stale prose, so this confirmation cannot approve as-is.

## Batches

Task rows read against the three changes, not re-read from scratch.

**LI-08 (RED block/material suite, batch 3) — strengthened by the edit, no change needed.** The row
already computes expected byte counts "from the fixture over **material only**, ignoring every
delimiter (§D.5)". Under FSPEC v0.12 that was PLAN siding with TSPEC §D.5 against FSPEC's
framing-inclusive basis; under v0.13 it is a literal compression of FSPEC's own basis. The
divergence I flagged in earlier rounds is now closed **upstream**, and `LI-AT-12`'s
character-safe-cut oracle (ASCII fixture ⇒ expected count is the bound exactly, plus the multi-byte
`≤` case) keeps its falsifiability: with framing charged to nothing, a fixture-derived expected
count is still exactly computable, so the test can still fail.

**LI-12 (RED configuration suite, batch 5) — now under-covers its own AT.** The row enumerates
`LI-AT-30` exhaustively as two cases: "`maxDocuments: 0`, `maxTotalBytes: 0` ⇒ an **enabled** run
whose BR-8 rows are present and empty". FSPEC AT-30 at HEAD names **three** thresholds and adds a
conjunct the two-case form does not carry: *"in the `maxBytesPerDocument: 0` case every corpus
document carries `RSN-NO-MATERIAL` (E-36)"*. Nothing in PLAN schedules that case, and E-36 appears in
no PLAN table. See F-01.

The repair is bounded and disturbs no structure: TSPEC §T.5's suite map counts **ATs** per file
(`learningsConfig.test.js` → AT-30, AT-32, count 2), so adding a third case to an existing AT leaves
`LI-T-SUITEMAP`'s partition, the batch column and every dependency edge untouched. It is one string
in LI-12 plus one edge-map row — but it is a missing red test, not a stale sentence.

**LI-16 (GREEN the pure selection core, batch 8) — behaviourally fine, unowned rule.** Two notes:

- E-36's mechanics are already implied by what LI-16 builds: `extractInjectableMaterial(text, 0)`
  admits no section, the document yields nothing, `selectLearnings` drops it before the bounds with
  `RSN-NO-MATERIAL` (BR-9) so it takes no slot. So the green side likely passes E-36 by
  construction — which is exactly why the **red** test matters: an implementation that took a
  zero-byte first-section cut and still counted the document as a contribution would consume a slot
  and no planned test would go red.
- F-O-1 now carries a second rule (which heading forms count as BR-6's named sections). PLAN's
  obligations table still maps `F-O-1 → LI-16`, and `extractInjectableMaterial` is indeed LI-16's, so
  the mapping still lands in the right task. But TSPEC's §I.3 signature block discharges only the
  BR-3 predicate; no upstream text yet fixes the heading-form rule, and no PLAN row authors a test
  over heading-form variance. See F-03.

**Everything else.** No other task row cites BR-6's byte basis, the reason catalogue's wording or
F-O-1. Batch numbers, `[Fake first]` ordering, the file-ownership manifest and the same-new-file
guard are untouched by this edit and stand as approved in v6.

## Dependencies

**Batch DAG.** Re-derived nothing new: the edit adds no task, no file and no edge, so every
`batch == max(dep batch) + 1` relation I verified in v6 is arithmetically untouched. The E-36 repair
lands inside LI-12 (batch 5, deps LI-02 batch 2 / LI-06 batch 4) and is greened by LI-21 (batch 13,
deps LI-20 / LI-12 / LI-23) — both already in the graph, both already ordered red-before-green. No
new batch, no new same-batch same-new-file collision: `learningsConfig.test.js` is LI-12's alone.

**Upstream precedence.** PLAN's own contract — "where a row and the TSPEC disagree, the TSPEC wins" —
now points at a TSPEC that has **not** absorbed the v0.13 erratum. At HEAD, TSPEC §T.5's AT-30 note
("AT-30 owns none of them … an enabled run whose BR-8 rows are present and empty") and its reason
table (`No BR-6 section present ⇒ RSN-NO-MATERIAL`, AT-28) both still carry the pre-erratum, narrower
readings. So F-01 and F-02 below are not PLAN inventing something: PLAN is a faithful compression of
**TSPEC**, and the unlanded absorption sits one level up. That is where the repair should start —
absorb E-36 and the broadened `RSN-NO-MATERIAL` into TSPEC, then take the one-touch PLAN edit — and
it is why I do not ask for a full PLAN revision loop.

**Version citations.** PLAN's Upstream field still reads `TSPEC (v0.6)` / `FSPEC (v0.10)`, and
§Overview still says "Behaviour lives in REQ v0.9 / FSPEC v0.10 / TSPEC v0.6". HEAD is FSPEC v0.13 /
TSPEC v0.7. This was v6's F-03, unresolved and now two erratum rounds further behind (F-04).

## Verification

**Oracle falsifiability under the new byte basis.** The edit removes framing from every threshold, so
each planned byte oracle stays falsifiable in both directions and gets *more* deterministic, not
less: `LI-AT-12`'s ASCII fixture makes the expected count equal the bound exactly (no delimiter
arithmetic to get wrong), `LI-AT-07`'s two `BYTES-BINDING` regimes still bind on material sums, and
LI-21's `ruleInputs.thresholds` set equality is a key-set assertion untouched by what the values
measure. No planned assertion becomes vacuous, and none becomes uncomputable.

**Where falsifiability is now missing.** E-36's branch has no oracle anywhere in the PLAN. The
correct oracle is positive on three conjuncts, per the absence-based-oracle rule — not
`selection is empty` alone, which a disabled run, a refusal or a crashed injector would also satisfy:

1. the report **key is present** with BR-8 rows present and empty (enabled, not the absent key of a
   disabled run);
2. **every** corpus document appears in `rejected[]` with reason exactly `RSN-NO-MATERIAL` — set
   equality over paths, not "at least one";
3. **no slot consumed** — no document carries `RSN-COUNT`, which is the conjunct that falsifies the
   plausible wrong implementation (zero-byte cut counted as a contribution, slots burned, later
   documents rejected for count rather than material).

Conjunct 3 is the one that makes the test able to fail; without it the case is nearly a tautology
next to the existing `maxTotalBytes: 0` case.

**Mutation check on the planned suite.** Revert the guarded behaviour — make `extractInjectableMaterial`
treat a zero bound as "take the first section anyway" — and the PLAN's twelve `learnings*.test.js`
suites as currently specified stay **green**: no fixture configures `maxBytesPerDocument: 0`, and
LI-23's arm inventory asserts reason-code set equality over arms it drives, not over this one. A
load-bearing branch that survives its own mutation is the definition of uncovered.

**DoD.** Clauses 1–3 and 5–13 are unaffected by this edit. Clause 4's baseline byte-identity promise
still reads wider than FSPEC's AT-03/AT-29 and TSPEC §A.2 ("outside BR-1's rule") — v6's F-04,
inherited and untouched by this round; the v0.13 edit neither worsens nor repairs it, and I do not
re-raise it as new. The DoD's coverage floor (`--per-file --branches 85`) is unchanged and still
enforced by LI-23's inventory suite over the fail-open region.

**Traceability.** FSPEC's own branch-coverage check now reads "E-01 … E-36, less retired E-05" and
routes E-36 to AT-30. PLAN's fail-open-arm table and coverage map still stop at the pre-erratum edge
set and the narrower `RSN-NO-MATERIAL` meaning (F-02), so a DoD verifier walking FSPEC → AT → task
lands on a task row that does not name the branch it is supposed to own.

## Positive Observations

- The byte-basis erratum resolves a genuine FSPEC↔TSPEC↔PLAN three-way divergence **in PLAN's
  favour**: LI-08's "material only, ignoring every delimiter" was the correct compression all along
  and is now literally what upstream says. One less place where an implementer had to know which
  document wins.
- FSPEC's zero-bound decision explicitly names the *"consumes no slot"* consequence rather than
  leaving it to inference — that is what let me state a three-conjunct falsifiable oracle above
  instead of asking a clarifying question.
- No batch, edge, fixture, file-ownership row or `[Fake first]` ordering moved. An erratum that
  leaves the DAG arithmetic untouched is an erratum a PLAN can absorb in one edit.

## Recommendation

**Needs revision** (one High finding, F-01).

Exactly what must change, in order:

1. **TSPEC first** (owning phase): absorb E-36 into §T.5's AT-30 note and broaden the reason table's
   `RSN-NO-MATERIAL` row to FSPEC's wording ("yields no material — no BR-6 section, **or** the
   per-document bound is zero"). PLAN's precedence rule makes TSPEC the document PLAN compresses.
2. **PLAN, one touch**: extend LI-12's `LI-AT-30` enumeration to three thresholds with the
   three-conjunct oracle above, add the E-36 row to the fail-open-arm / coverage tables, and refresh
   the three stale version labels (Upstream field, §Overview, §Dependencies' LI-01 reason).

No task needs to move batch, no fixture is invalidated, no red test is mis-ordered, and no oracle
this PLAN already schedules became unfalsifiable. Everything else I approved in v6 still holds
against FSPEC v0.13.

## Delta-Confirmation Findings

## Verdict

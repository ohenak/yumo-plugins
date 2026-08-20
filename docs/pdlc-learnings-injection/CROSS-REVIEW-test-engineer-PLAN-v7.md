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

## Verification

## Delta-Confirmation Findings

## Verdict

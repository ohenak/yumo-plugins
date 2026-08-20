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

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict

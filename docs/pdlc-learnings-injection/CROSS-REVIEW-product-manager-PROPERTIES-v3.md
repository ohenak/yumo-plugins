# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation — PROPERTIES bytes unchanged, FSPEC changed)

## Overview

**Question answered.** Does PROPERTIES, whose own bytes have not changed since my v2 approval,
still hold as a faithful compression of FSPEC as FSPEC now stands?

**What moved.** My v2 approval recorded `UPSTREAM-STATE: FSPEC sha256:fb18dbda…`, which is FSPEC
v0.12 at commit `c1d7218e`. FSPEC at HEAD is `sha256:ae75fa6291f1…` — v0.13, six commits
(`eeafa236` … `cfb3d4d6`) of one erratum round. REQ (`ff605dd3…`), TSPEC (`f629d29d…`),
DECISIONS (`85888c03…`) and PLAN (`20f574e2…`) at HEAD are byte-identical to what my v2 approval
recorded, so **FSPEC is the only upstream that moved**, and REQ did not move underneath it — the
erratum absorbed no new product decision, it settled three questions PROPERTIES itself had routed
upward.

**The three decisions the erratum landed** (`git diff c1d7218e..HEAD` on FSPEC):

1. **Byte-accounting basis is material only.** BR-6's *The byte-accounting basis* paragraph is
   rewritten: a document's **contributed bytes** are "its **material** — the section headings and
   bodies taken from it, and nothing else"; the identification line, per-document delimiters,
   source-path label and block preamble "count toward none of the three quantities", grounded on
   REQ AC-2.3, which bounds "the material taken". The pre-round text charged the identification
   line and delimiters to the document.
2. **`maxBytesPerDocument: 0` is decided.** New edge **E-36**; BR-6 gains a *Where the bound is
   zero* clause; BR-9's catalogue entry for `RSN-NO-MATERIAL` widens to "carries none of BR-6's
   priority sections, **or** the per-document bound is zero and admits none"; D-12 is restated as
   "Does the document yield any material?"; **AT-30** gains a third arm and the extra assertion
   that every corpus document carries `RSN-NO-MATERIAL` in that arm; the branch-coverage check
   now reads E-01 … E-36.
3. **F-O-1 owns both heading-recognition rules** — the document-shape predicate *and* the rule by
   which a heading counts as one of BR-6's named sections.

**Method.** I re-read my own v1 and v2 cross-reviews of PROPERTIES, took the FSPEC diff above,
then re-read every PROPERTIES passage that leans on the changed upstream text at its current
version — Group D's `PROP-BOUND-03…08`, `PROP-CONFIG-04`, §C.1's AT-30 row, §F.3's heading-forms
note, §G.2's known gaps and §G.3's routed errata. Per DEC-ERR-03, my scope is this document
measured against upstream at HEAD, not the routed item list.

**Answer in one line.** PROPERTIES' *properties* still hold — none is contradicted by the new
FSPEC, and the byte-accounting decision landed on the side PROPERTIES already asserts, which
retires a contradiction rather than creating one. What no longer holds is PROPERTIES' **account of
upstream**: two of its three §G.2 known gaps and two §G.3 routed errata describe FSPEC questions
that FSPEC has now answered, and the newly decided `maxBytesPerDocument: 0` arm of AT-30 has no
property asserting it. Those are Medium — no REQ acceptance criterion lost its property coverage —
so the round confirms with minor changes rather than routing back.

## Properties

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

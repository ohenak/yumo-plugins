# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1, bytes unchanged)
**Date:** 2026-08-29
**Iteration:** 3 (upstream-cascade confirmation — TSPEC moved, PROPERTIES did not)

## Overview

**Question answered:** does PROPERTIES v1.1, approved unchanged at round 2, still hold as a faithful
compression of TSPEC as TSPEC now stands? **No.** Three of its properties transcribe operand wording
that TSPEC has since retired *as unsatisfiable*, and one TSPEC assertion newly designated as a
field's sole proof has no property at all.

**Scope of the cascade, measured rather than assumed.** My round-2 approval recorded
`UPSTREAM-STATE: TSPEC sha256:28d25518…`. That blob is TSPEC at `1a2d78cba~1` (v0.8). TSPEC at HEAD
is `sha256:b1b603a8…` (v1.0). Four content commits sit between them, not one:

| Commit | TSPEC version | Sections touched |
|---|---|---|
| `1a2d78cba` | 0.9 (in progress) | §7, §7.2 — re-measured subject file; re-homed the flag-off `report` referent |
| `4b28af44a` | 0.9 (in progress) | §7.3 — census made satisfiable over its whole token set (TE F-01, F-02, both High) |
| `588f4323e` | 0.9 (in progress) | §5.4 — report field pointed at its sole proof (PM Q-01) |
| `452d72c07` | 1.0 (erratum) | §7.3 — the three census constants given a stated home as test-file declarations, removed from the owned-declaration list |

So this confirmation is **not** scoped to the v1.0 erratum alone. The erratum's own three edits are
narrow and, taken by themselves, leave PROPERTIES untouched — no property names
`DECISION_LEDGER_CENSUS_EXEMPT` or `DECISION_LEDGER_OWNED_DECLS`, so nothing in PROPERTIES asserts
the membership the erratum corrected. The damage is in v0.9, which landed between my approval and
this dispatch and which PROPERTIES has never been measured against. Per DEC-ERR-03 I review this
document against upstream **at HEAD**, so those items are findings of this round.

**Why the divergence is High rather than a re-pin chore.** TSPEC v0.9's changelog states that the
operand pair PROPERTIES still transcribes "could not go green on a conforming implementation" —
`gatherDecisionCorpus`, §5.2's three catalogues and every intra-feature mention inside a sibling
declaration all sat in the scanned remainder, so four of the six tokens would have occurred there on
correct code. PROP-INV-06 and PROP-INV-07 are the pre-repair wording verbatim. An implementer
working from PROPERTIES alone — which is the document's job — would build a census that cannot pass,
and the ✖ marks on those rows say a red-first test is owed for exactly that shape. This is the
falsifiability failure mode PROPERTIES exists to prevent, inherited from a stale pin.

Nothing here re-opens a settled decision. Every fix below is a re-transcription of TSPEC's current
operand text into rows that already exist, plus two rows for assertions TSPEC newly makes
load-bearing. No product scope moves: `REQ` BR-11 / NG-4 and `REQ` C-2 are unchanged, and PROPERTIES
still adds no behaviour the REQ does not ask for.

## Properties

_TBD_

## Oracles

_TBD_

## Fixtures

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_

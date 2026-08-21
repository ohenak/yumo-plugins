# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation, round v3)

## Overview

**Scope of this round.** An upstream-cascade confirmation. PROPERTIES' own bytes have not moved
since my v2 approval (`REVIEWED-COMMIT: 32a459ef`). What moved is **REQ**: `0cef7148..30d8bf7b`
took it v1.15 → v1.16 (`sha256:c62cfc35…` → `sha256:f97f4f66…`, +12/−2 lines), landing DEC-A6-03's
operator-facing halt-message obligation into **AC-6.3**. DECISIONS also moved since my v2 anchor
(`sha256:84deee10…` → `sha256:ef59893d…`, `3143290a` reconciling the v1.10 note with v1.11's
re-grounding); FSPEC (`91ef2557`), TSPEC (`3fa21acf`) and PLAN (`f7de7fc…`) are byte-identical to
the versions I approved against.

**The one question, answered:** **no** — PROPERTIES no longer holds as approved. It is still a
faithful compression of everything REQ said at v1.15, and I re-litigate none of it. But AC-6.3 at
HEAD carries a **second, independently falsifiable conjunct** that did not exist when I approved:

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture (DEC-A6-03).

That conjunct has **no property home anywhere in this document**, and — because FSPEC, TSPEC and
PLAN did not cascade — no home downstream either. §G-4 still closes with "None. Every REQ acceptance
criterion and NFR yielded at least one falsifiable property (matrix C-1)", which was true at v1.15
and is now true only at AC granularity, not at conjunct granularity. That is F-01, High.

A second, narrower consequence follows from where the warning could physically go: both candidate
carriers are already pinned by properties I approved (F-02, Medium). And the document's own grounding
pins name REQ v1.15 (F-03, Low).

**What I did not do.** I did not re-read the 40 property rows, the oracle catalogue or the fixture
table from scratch, and I raise nothing about them beyond what the REQ delta touches. My v2 findings
(F-01/F-02 PLAN task-id drift, F-03 PROP-ENV-13's routed run-level conjuncts) are unchanged by this
edit and are not re-filed here — they remain open, non-gating, in the v2 record.

## Properties

*(pending)*

## Oracles

*(pending)*

## Fixtures

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Recommendation

*(pending)*

# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (bytes unchanged since v4 approval)
**Upstream that moved:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.10 → v0.12)
**Date:** 2026-08-20
**Iteration:** 5 (upstream-cascade confirmation)

## Overview

**Question answered.** PLAN's own bytes have not moved since the v4 approval anchor (`a7aa181e`).
FSPEC moved twice under it — the v0.11 and v0.12 erratum rounds, ten commits, +54/−26 lines. I read my
v4 cross-review, diffed FSPEC across `a7aa181e..HEAD`, and measured only the PLAN material that leans on
the changed FSPEC text. I did not re-open the batch DAG, the file-ownership manifest, the expected-red
ledger, or the three Medium/Low findings v4 left open — none of them touches FSPEC's changed sections.

**What FSPEC now says that it did not say at approval time.**

| FSPEC section | Before (v0.10) | After (v0.12) |
|---|---|---|
| BR-1 | "consumes the pipeline's classification, it does not restate the membership" — one conjunct | Two conjuncts: authoring-classified **and** target document among REQ C-1's six types |
| D-2 | "Is this an authoring dispatch? yes / no" | Three branches, the third being authoring-classified with a non-C-1 target |
| AT-02 | universe fixtures: no-DECISIONS run, creatorless Phase R, five optimizer rounds | plus a run carrying an authoring-classified dispatch with **no C-1 target**; reverting BR-1's second conjunct must red |
| AT-03 / AT-29 | "every **non-authoring** dispatch prompt is byte-identical to baseline" | "every dispatch **outside BR-1's rule**" — strictly wider |
| BR-15 | expected read set = corpus-root enumeration **plus** per-document open attempts | enumeration and candidate paths **contribute no member**; expected set is exactly the per-document attempts |

**Direction of travel is toward PLAN, not away from it.** Both v0.11/v0.12 corrections land the two
defects PLAN itself routed as unresolved errata (§Errata rows). LI-11's AT-02 and AT-33 rows were written
to TSPEC's reading; FSPEC now agrees with TSPEC on both. So no task row's oracle changes, no fixture is
invalidated, no batch moves. What does not survive the edit is PLAN's **description of upstream**: two
errata rows assert a defect "still lives at HEAD" that no longer does, and one DoD clause compresses the
old, narrower byte-identity promise. Three Mediums, no High. PLAN still holds as approved.

## Batches

_pending_

## Dependencies

_pending_

## Verification

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_

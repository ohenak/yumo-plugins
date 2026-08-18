# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-18
**Iteration:** 11
**Scope:** Upstream-cascade confirmation only. TSPEC bytes unchanged since the v10 approval
(`REVIEWED-COMMIT: f6643915`). REQ moved from `sha256:1038b816…` (v0.11) to
`sha256:41fb21e8…` (v0.12, commit `cc009367`). The single question answered here: does the
approved TSPEC remain a faithful compression of the REQ as it now stands? Settled TSPEC
decisions are not re-litigated.

## Overview — what changed upstream

`git diff 68e72db2..cc009367` on the REQ is one erratum, 16 insertions / 1 deletion:

| Where | Change |
|---|---|
| Header / changelog | Status row to `0.12 | 2026-08-18`; a v0.12 changelog line naming the one correction |
| C-7 (`Repo CI stays green at every commit`) | New paragraph **"Held classes and the interim state"** — C-7 governs the repo's own CI checks per commit, not this REQ's completion criteria (AC-1.1's *given* evaluates at sweep completion); while a class is held pending an upstream disposition, an unsatisfied AC-1.1 is an incomplete feature on an unmerged branch, **not** a C-7 red and **not** registered anywhere as an expected or tolerated failure; ungated classes may still land as their own commits; there is no skip-list, no expected-failure inventory and no tolerated-red register in this feature (C-8 forbids that shape, and "a criterion allowed to be red by registration stops being a criterion"); where a check observing a held class would otherwise run red before that class lands, the resolution is **ordering** — the check goes live with the class it covers — **never registration**; the branch does not merge on a green subset |

No acceptance criterion was added, removed, narrowed or re-scoped. No new obligation lands on
engineering beyond a naming rule for a state the TSPEC already designed for.

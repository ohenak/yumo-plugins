# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.10, sha256:90464289a6f32ed39f13ffe30aca693f7d033e96c0bc1a08311a53b964b876e4 — bytes unchanged since the v10 approval)
**Upstream at dispatch:** REQ sha256:41fb21e82be8b5c5622da7638abde6694890703ec72bf257fbefa7f52dda9c51 (v0.12); FSPEC sha256:dccb45d6fb253d197b7a197288a3381b330903fc4ac49efbf0c99b410c79ade0 (unchanged from the v10 `UPSTREAM-STATE` anchor)
**Date:** 2026-08-18
**Iteration:** 11

## Overview

This is an upstream-cascade confirmation, not a re-review. The TSPEC's own bytes are byte-identical to the version approved at v10 (`REVIEWED-COMMIT: f6643915`). The REQ moved from v0.11 to v0.12 in erratum commit `cc009367`, a 16-insertion/1-deletion edit that (a) bumps the header row and adds a v0.12 changelog line and (b) appends one paragraph, **"Held classes and the interim state"**, to constraint C-7.

The single question answered here: **does the TSPEC still hold against the REQ as it now stands?**

Answer: **yes.** The C-7 addition is additive and clarifying; it names a discipline the TSPEC already spells out per-commit under BR-SWEEP-3 and BR-SWEEP-4, and it changes no clause the TSPEC compresses. One Medium is filed against a wording collision the erratum introduces with the REQ's own AC-1.3 registered-skip exemption, which the TSPEC leans on directly for TT-1b — the TSPEC is right and the erratum's absolute phrasing is the loose end, so nothing in the TSPEC needs to change.

FSPEC bytes did not move, so no FSPEC-derived citation in the TSPEC is at risk this round.

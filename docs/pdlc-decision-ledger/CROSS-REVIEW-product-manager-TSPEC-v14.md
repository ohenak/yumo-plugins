# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 14 (delta confirmation)
**Upstream at dispatch:** REQ v1.10 `sha256:9bc8bc32…05f10d`, FSPEC v1.4 `sha256:48691453…a11256`, Baseline v1.2

## Overview

I approved this TSPEC at v13 (`Approved with minor changes`, `REVIEWED-COMMIT: 3a17387d6`). The delta
I measured for this confirmation is `3a17387d6..HEAD`, two commits:

- `df2b10154` — TSPEC v1.3, re-grounding the header pin on REQ v1.10 / FSPEC v1.4 and adding the v1.3
  changelog entry.
- `757922341` — the round's targeted erratum: three citations rewritten from `FSPEC v1.3's E-7` /
  `FSPEC v1.3's cases` to `FSPEC E-7`, in §4.1, §6.1's F-13 row and §7.6's AT-14 row. Three
  insertions, three deletions, nothing else.

**The routed item does not land here, and it is stale.** The dispatch routes "PLAN v0.7 contradicts
TSPEC §7.3's census pin in all six routed places (fifteen-member owned list, production home for
`DECISION_LEDGER_CENSUS_TOKENS`)" to PLAN's phase, not to this document — so this TSPEC correctly
makes no edit for it, and its non-landing is not a `delta` fault of these bytes. But I re-measured
`PLAN-pdlc-decision-ledger.md` at HEAD, as I did at v13, and the premise is false: PLAN is at
**v0.9**, and all six sites are corrected. That falsity is now restated inside this document's own
v1.3 changelog, which is delta bytes, and that is F-01 below. It is the same defect I raised as v13
F-01 against PLAN v0.8; PLAN has since advanced again and the entry has not.

**Upstream fidelity re-check (DEC-ERR-03).** I did not take the item list as the scope. I re-measured
both upstream documents at HEAD and re-read the text this TSPEC now leans on:

- `shasum -a 256` on both files returns exactly the dispatch digests — REQ `9bc8bc32…05f10d`, FSPEC
  `48691453…a11256`. The header's pin row reads REQ **v1.10** / FSPEC **v1.4** / Baseline **v1.2**,
  and the status rows in those files read 1.10 and 1.4. The pin is true at HEAD, not merely re-typed.
- FSPEC **E-7** is unmoved and is faithfully compressed. The clause this document now cites by id
  reads, at FSPEC:342, "**Either** bound resolves to `0` … Treated as zero in-scope decisions —
  E-6's outcome, for both keys. **Not an error**, not a fallback to the default, not a halt", with
  the `maxBytes` axis also reachable by E-8 then E-6. §4.1's admits-nothing sentence and §6.1's F-13
  row restate that, both directions, without narrowing it.
- No acceptance criterion moved, no product decision was re-opened, and none of the four corpus
  literals (6,305 / 10,859 / 12,059 / 441) was touched.

**Bottom line.** The delta does what it says and breaks nothing I previously approved — decoupling a
citation from a version numeral is strictly an improvement in staleness resistance, and it is the
right lesson to apply. It does not resolve the routed item, correctly, because that item is PLAN's;
but the changelog paragraph that explains the non-landing asserts something false about PLAN at
HEAD. Four findings, no High: two Medium and two Low, of which one Medium and one Low are inherited
from v13 and untouched here.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

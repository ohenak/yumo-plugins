# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.8)
**Date:** 2026-08-19
**Iteration:** 9 (delta confirmation)

## Overview

This is a **delta confirmation**, not a full re-review. FSPEC was approved at v0.7. A targeted
erratum landed as v0.8 (`a6b42bae`, +10/-2 lines, header + one new erratum note only). I read the
erratum diff, then re-read the upstream REQ at HEAD
(`sha256:ff605dd3…e84dd`, v0.9 — matches the dispatch sha exactly) to answer the confirmation
question and, per DEC-ERR-03, to check that this FSPEC is still a faithful compression of what its
upstream *currently* says.

**Answer to the confirmation question:** the delta resolves the routed item correctly and breaks
nothing previously approved. **But the scope of this confirmation is FSPEC-vs-upstream at HEAD, not
the item list**, and the re-read surfaced two places where FSPEC still compresses REQ acceptance
criteria that upstream has since re-scoped. Both are **inherited** (present in pre-round bytes; the
erratum did not touch them) and **nonlocal** (outside the sections the edit changed). Both are High,
so the round is **Needs revision** on the DEC-ERR-03 channel rather than on the routed item.

## Routed-Item Disposition

| Routed item | Disposition | Evidence |
|---|---|---|
| §I.2/§I.4/§OQ.2 gate on `present && config.enabled && !sectionMalformed`; ERR-4 shipping default left open; re-ground on REQ v0.9 / FSPEC v0.7; close OQ.2 | **Resolved — correctly recorded as out of scope for this document** | The cited section ids (`§I.2`, `§I.4`, `§OQ.2`) are TSPEC numbering; this FSPEC carries no such sections (`grep` for them returns nothing). The erratum note says exactly that and re-affirms the settled behaviour rather than silently deferring. |

I verified the re-affirmation is true of the bytes, not just of the note:

- **Step 0(2)** — "Absent section, absent config file, or a misspelt section name → the configuration
  reads as REQ §4.1's declared defaults, which leave `enabled` at `true`, and the flow continues at
  (4)". No second gate. Matches REQ AC-5.1a's "absent must read as §4.1's declared defaults, which
  leave `enabled` at `true` … there is no second gate beyond this key (G-1)".
- **BR-14's five-state table** — absent / misspelt / absent-file, `enabled: false`, malformed,
  wrong-typed key, admits-nothing thresholds. Four of the five compose the **enabled** composition;
  only explicit `enabled: false` disables. Matches AC-5.1a/b/c and AC-4.4 member for member.
- **Malformed fails open with `NTC-MALFORMED`** (BR-14, BR-9 notice catalogue), matching AC-5.1b's
  decided fail-open. The `ERR-4` "shipping default open" question is therefore already closed in this
  document and was closed before this erratum.
- The precedent citations BR-14 leans on are real: `parseAdvisoryConfig`, `parseMergeConfig` and
  `sectionMalformed` all exist in `pdlc/workflows/orchestrate-dev.js` (verified by grep, not trusted
  from the doc). REQ v0.9 newly names `parseImplementationConfig` for the same behaviour; that symbol
  also exists, and FSPEC's citation of the sibling readers is compatible rather than contradictory —
  it is a wider precedent set, not a different claim.

So the gate correction really is TSPEC's to land, and this FSPEC needed no behavioural change for it.

## Upstream Re-Verification at HEAD

<!-- pending -->

## Findings

<!-- pending -->

## Questions

<!-- pending -->

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->

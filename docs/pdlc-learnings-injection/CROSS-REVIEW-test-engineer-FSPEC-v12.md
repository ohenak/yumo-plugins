# Cross-Review: test-engineer — FSPEC (delta confirmation, round v12)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.10)
**Date:** 2026-08-19
**Iteration:** 12

## Overview

Delta confirmation of the v0.10 erratum (`9a4b7593`, +8/-2, header only) against the FSPEC I
approved at v11. I read the diff, the header block it rewrote (FSPEC:9-18), the revision-note block
it appended to (FSPEC:20-49), and re-read upstream REQ v0.9 at HEAD
(sha256 `ff605dd…92e84dd`, matching the dispatch digest exactly; last REQ commit `a2353445`, the
v0.9 erratum this FSPEC was already re-grounded on at v0.8/v0.9). No section carrying behaviour,
rules, edge cases or acceptance-test oracles was touched, so nothing I approved at v10/v11 is at
risk from this delta.

**Routed item.** The header Cross-Reviews row enumerated `v{1…9}` while
`CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v10/v11` exist on this branch, and the v0.9
revision note claimed a correction that had not landed. **Resolved.** FSPEC:12 now reads
`…-FSPEC-v{1,2,3,4,5,6,7,8,9,10,11}.md`; both v10 and v11 files exist for both reviewer roles
(`ls docs/pdlc-learnings-injection/CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v1{0,1}.md`
→ four files), so the row is now an exact enumeration of what exists at HEAD, not an over- or
under-claim. The version cell moved 0.9 → 0.10 and a v0.10 erratum note (FSPEC:44-49) records the
inaccuracy of the v0.9 claim in place, rather than silently rewriting the older note — the
changelog stays an append-only record, which is what makes it auditable.

The v0.9 note's own sentence ("Header Cross-Reviews row … corrected") is left standing and is still
false of the bytes it prefaced; that is correct changelog practice given the v0.10 note directly
above it names the error, and it is not a finding.

## Linked Requirements

REQ v0.9 at HEAD is byte-identical to the dispatch digest, so no upstream sentence has moved under
this FSPEC since I approved it. Spot-checking the citations the recent notes lean on:

- `enabled: true` default (FSPEC v0.6/v0.8 notes, BR-14) — REQ:223 still shows
  `learningsInjection.enabled` defaulting `true`, cited to AC-1.1/AC-5.1a/AC-5.1b/AC-5.1c.
- per-dispatch corpus locus (v0.9 note) — REQ AC-3.2 (REQ:320) still says "**per authoring
  dispatch**", and AC-3.1's closure is still scoped to each selected document's row with AC-3.2 and
  AC-3.3 items sitting outside that set, "each closed by its own completeness test at the loci
  AC-3.2 and AC-3.3 name" (REQ:317-319, 345) — the exact wording FSPEC BR-9/BR-10 and AT-20/21/22
  compress.
- disabled-run baseline (AC-6.2 row, repaired at v0.9) — REQ:379 and REQ:415 still require
  byte-identity against the *recorded* baseline, matching the `## Acceptance Tests` preamble the
  row now points at.
- malformed-section fail-open with a notice — REQ:373, AC-5.1a/AC-5.1b unchanged.

No citation in this FSPEC points at text upstream no longer carries.

## Behavioral Flow

Untouched by this delta. `git diff 523e2df9..9a4b7593 --stat` is confined to the header table and
the revision-note block; no Step 0-N text, no ordering or bounding step, changed a byte. The flow I
approved at v10/v11 stands as approved.

## Business Rules

Untouched. BR-9's per-document catalogue, BR-10's two-locus table with its "Once per run" §4.1
threshold row, BR-14's default-enabled reading of an absent section — all outside the diff hunks
and all still consistent with REQ v0.9 as checked above.

## Edge Cases and Error Scenarios

Untouched. E-13's measured two-repository provenance, E-26's routing of the three §4.1 thresholds
to the run-level record, and the `RSN-EMPTY` / `RSN-UNLISTABLE` / `NTC-MALFORMED` outcomes are all
outside the delta and still match REQ:74, REQ:357, REQ:362, REQ:373.

## Acceptance Tests

Untouched, and this is the part of a header erratum most likely to go wrong indirectly — a version
bump can strand a traceability row. It does not here: no traceability row references a version
number, the AC-6.2 row still points at `§Acceptance Tests preamble` (the heading that exists), and
AT-20/AT-21/AT-22 still name their BR-10 locus and assert **set equality** per locus, so deleting a
member of either catalogue still reds. AT-22's anti-echo clause (expected selection transcribed by
hand into the fixture, "neither calls the production selector nor reimplements it") and AT-32's
positive-presence conjunct — the two oracles whose falsifiability I most cared about across this
document's history — are byte-identical to the bytes I approved at v11.

## Open Questions

No new question. My one carried `DEFERRED:` item is unchanged and still non-blocking: BR-9's notice
catalogue leaves its emission locus unstated, routed to TSPEC. This delta neither addresses nor
disturbs it.

## Delta-Confirmation Findings

No findings.

## Positive Observations

- The erratum is minimal and honest: it fixes the row *and* records that the earlier note
  overclaimed, instead of quietly editing the older entry. That is the behaviour that keeps a
  revision history usable as evidence.
- Upstream was genuinely re-read rather than asserted: REQ at HEAD hashes to the dispatch digest,
  and every citation the recent notes lean on still resolves to live upstream text.

## Recommendation

**Approved**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

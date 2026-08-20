# Cross-Review: software-engineer — FSPEC (delta confirmation, round v12)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.10)
**Erratum commit:** 9a4b7593
**Date:** 2026-08-19
**Iteration:** 12
**Round type:** delta confirmation (previously approved at v11, `REVIEWED-COMMIT: cb220f5a`)
**Upstream state:** REQ `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` v0.9, sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd

## Overview

**Question answered:** does the v0.10 erratum resolve the routed item without breaking anything approved at v11?

**Answer: yes.** The delta is header-only and lands the routed correction exactly. Commit 9a4b7593 touches two lines of substance and adds one revision-history note:

- Header `Cross-Reviews` row: `v{1,2,3,4,5,6,7,8,9}` → `v{1,2,3,4,5,6,7,8,9,10,11}`. Verified on disk: `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v10.md` and `-v11.md` both exist on `feat-pdlc-learnings-injection`, and no FSPEC cross-review beyond v11 existed when the erratum landed. The row is now accurate as of its own commit.
- Version cell `0.9` → `0.10`, consistent with the new revision-history entry.
- New `> **v0.10 erratum (header only).**` note, placed after the v0.9 note in chronological order, which states plainly that the v0.9 entry's claim of having corrected the row was inaccurate. That is the honest form: the erratum does not quietly overwrite the false claim, it records it. The pm-review item is discharged both in the row and in the changelog.

Nothing else in the 64.7 KB document changed. `git show 9a4b7593` is +8/−2 in a single hunk pair confined to the header block above `## Overview`; no BR, E-*, AC, AT, flow step, or traceability row is touched, so nothing I approved at v11 can have been broken by construction.

## Linked Requirements

**Upstream re-read at HEAD (DEC-ERR-03 obligation).** The dispatch pins REQ at sha256:ff605dd…e84dd. That is byte-identical to the `UPSTREAM-STATE` anchor recorded on my v11 approval, so upstream has not moved under this document since I last verified its compression. I re-verified the citations the header block itself makes, plus a sample of the load-bearing body citations, rather than resting on the sha alone:

| FSPEC citation | Upstream at HEAD | Verdict |
|---|---|---|
| Header `Upstream` row — REQ (v0.9) | `REQ:18` version cell reads `0.9` | Accurate |
| v0.10 note — "REQ v0.9, unchanged" | sha matches v11's `UPSTREAM-STATE` | Accurate |
| v0.6/v0.8 notes — §4.1 declares `enabled: true`; absent section is a default-enabled run | `REQ:223` (`learningsInjection.enabled` \| `true` \| consumer config); `REQ:378-383` AC-5.1a | Accurate |
| v0.6/v0.8 notes — malformed section fails open with a notice | `REQ:385-390` AC-5.1b ("stays **enabled** on §4.1's declared defaults **and** the report carries a" notice) | Accurate |
| v0.9 note — corpus outcomes / per-document reasons / ordering keys recorded per authoring dispatch | `REQ:317-319`, `REQ:320`, `REQ:336-345` | Accurate |
| §Behavioral Flow (4) — three bounds from REQ §4.1 | `REQ:224-226` (`maxDocuments` 5, `maxBytesPerDocument` 6,000, `maxTotalBytes` 20,000) | Accurate |
| `:306` — discarded-direct-path document is a corpus member on ordinary terms | `REQ:369-372` AC-2.6 ("directly at `docs/discarded/LEARNINGS-*.md`, it is a corpus member on ordinary terms") | Accurate, verbatim-aligned |
| `:337` / `:547` — per-document bounded flag and AC-3.2 catalogue membership | `REQ:290-300` AC-2.3/AC-2.4; `REQ:320-335` AC-3.2 | Accurate |

No citation in this FSPEC points at text the REQ no longer carries, and none paraphrases it in a way that changes its force. The document remains a faithful compression of REQ v0.9.

## Behavioral Flow

Unchanged by this delta and re-confirmed against upstream by sampling, not re-read in full (delta protocol).

Step 0(2)'s three configuration branches — absent section → §4.1 defaults with `enabled` at `true` and the flow continuing at (4); present-but-malformed → default-enabled plus `NTC-MALFORMED`; explicit `false` → today's byte-identical dispatch with no injection record — still map one-to-one onto `REQ:378-395` (AC-5.1a/b/c). The v0.8 note's claim that there is "no second gate beyond that key" continues to hold at REQ HEAD: AC-5.1a conditions disablement on `enabled` being *explicitly* `false`, and AC-5.1b/AC-5.1c both resolve to enabled, so no configuration state other than the explicit key suppresses injection. That claim was the subject of an earlier erratum and it is the one I would expect a header-only edit to be able to disturb; it is intact.

Step (4)'s threshold resolution still reads all three bounds from REQ §4.1 with the defaults quoted above.

## Business Rules

Untouched by the delta. Two carried observations from v11 remain open and remain non-blocking:

- **BR-9** (`:509`) — the per-document prose lost the "exactly one" quantifier that AT-19's set-equality oracle actually asserts. Wording only; the oracle is the contract and it is unambiguous. Inherited, nonlocal, Low.
- **BR-14** (`:619`) — re-verified against `REQ:385-393`: the decision against an unknown-top-level-key registry, the misspelt-key reading, and the deliberate divergence of this feature's default from the surrounding config convention all still match the REQ text at HEAD, including `REQ:650`'s counterpart rationale. No drift.

No business rule cites a REQ id that has moved, been renumbered, or changed force since v11.

## Edge Cases and Error Scenarios

Untouched. E-13's measured two-repository provenance, restored at v0.7 and confirmed at v7/v9, is unchanged in these bytes and its upstream basis (`REQ:74`, `RSN-UNLISTABLE` failing open) is unchanged at HEAD. The corpus-state edge cases (`RSN-EMPTY`, `RSN-UNLISTABLE`, `RSN-COUNT`, `RSN-NO-MATERIAL`) still match `REQ:332-362`'s catalogue membership, including the point that truncation is *not* a catalogue member.

One structural note on the delta's own class of defect: a header row that enumerates rounds is an error surface that regenerates. It was wrong at v0.9, was asserted corrected while still wrong, and is accurate now only until the next round lands — this very review, v12, makes it stale again the moment it is committed. That is documentation hygiene, not behaviour, and I recorded it at v11 as a deferred item; I record it again below at Low because the erratum chose to re-enumerate rather than adopt a glob, so the failure mode is re-armed rather than retired.

## Acceptance Tests

Untouched by the delta. Re-checked the two anchors this document type has previously got wrong:

- The AC-6.2 traceability row still resolves to `§Acceptance Tests preamble` (`:748`/`:750`), the heading fixed at v11, and still names AT-31, AT-32. Both tests exist (`:899`, `:902`).
- AT-32 retains the positive-presence conjunct added at v0.7, so its equality check cannot go vacuously green — the defect class recorded in project memory as the consolidation-agent vacuous-green lesson.
- AT-20/AT-21/AT-22 still name the per-dispatch locus and still exercise AT-18's changing-corpus fixture, matching `REQ:336-345`.

AT-22's subject/predicate slip (it describes the rule-input record where it means the reproduced selection) is carried forward unresolved from v10/v11. Wording only; the no-production-selector clause pins the intent unambiguously.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Will the next non-frozen FSPEC edit convert the header `Cross-Reviews` row to a glob (`…-FSPEC-v*.md`)? Re-enumerating through v11 discharges the routed item but leaves the row structurally unable to stay accurate across rounds — it is stale again as of this review. No answer is required to approve. |

No open question here gates the confirmation; the decision freeze is respected and neither item requires an upstream decision.

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_

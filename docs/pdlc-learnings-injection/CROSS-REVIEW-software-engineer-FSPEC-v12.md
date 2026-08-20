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

_pending_

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_

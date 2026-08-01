---
feature: pdlc-approval-record-tier2
ready: false
depends-on: [pdlc-review-convergence]
---

# REQ — pdlc-approval-record-tier2

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` — R-3, N-5, AC-3.6 |
| Downstream | `FSPEC-pdlc-approval-record-tier2.md` |
| Cross-Reviews | *(none yet — this is a stub)* |
| LEARNINGS | `docs/pdlc-approval-record-tier2/LEARNINGS-pdlc-approval-record-tier2.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | stub | Claude + operator | 0.1 | 2026-07-31 |

> **This is a successor stub, not a specified feature.** It exists so that
> `pdlc-review-convergence`'s deferral of tier-2 approval records for verifier rounds is **bound to a
> named successor REQ file** as DC-08 requires. It is `ready: false` and is not queue-eligible until an
> operator specifies it and sets `ready: true`.

## 1. Problem (inherited)

The LEARNINGS approval record — tier 2 — writes one six-column row per *approving cross-review*, and
its reader (`tier2ApprovalRecord`, `pdlc/workflows/orchestrate-dev.js:2528`) encodes the same
"two reviewers" assumption three other call sites encode. `pdlc-review-convergence` AC-3.6 permits
tier 2 to record **no row** for a round approved by a single verifier, provided the limitation is
documented in the LEARNINGS file and in the run report, and explicitly scopes the extension out
(N-5). The residue is a known, documented gap in a best-effort record that is deliberately excluded
from the cross-review completeness criterion.

## 2. What this feature would deliver

| # | Deliverable |
|---|---|
| D-1 | Tier 2 records an approval row for a verifier-approved round, carrying that round's `APPROVAL-HASH:` / `REVIEWED-COMMIT:` anchors copied verbatim, as it already does for dual rounds |
| D-2 | The row is distinguishable as a verifier-round approval — the `Role` column carries the verifier slug and the record states the review mode |
| D-3 | The documented-limitation text AC-3.6 requires is removed once D-1 and D-2 ship, in the same change |

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | `pdlc-review-convergence` shipped | `REVIEW-MODE: verification` written by `appendApprovalAnchors` at HEAD | Must hold before authoring — D-2 is stated over that marker |

## 4. Status

Unspecified. The operator authors §5 (acceptance criteria) when this is scheduled. Until then this
file is the binding surface DC-08 requires and nothing more.

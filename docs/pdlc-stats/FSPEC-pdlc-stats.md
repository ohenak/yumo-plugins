---
feature: pdlc-stats
---

# FSPEC pdlc-stats

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.2) |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{role}-FSPEC[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-31 |

**ID:** `FSPEC-STATS-01`

## 1. Overview

`pdlc stats` is a read-only reporting command over artifacts the pipeline has already written.
It adds no instrumentation, no persisted state and no new mechanism: it reads the files that are
on disk under a feature's artifact directory and prints four metrics — review rounds per document
type, DoD rounds, halts by phase with resolution state, and the process-to-spec byte ratio.

This FSPEC exists because the behavior branches enough that an implementer should not decide it
alone. The branching is not in the arithmetic; it is in the *state* each metric can be in. Every
one of the four metrics can be a number, and three of them can instead be a non-numeric state —
`harvested` (the evidence was deleted by `harvest-learnings`), `unmeasurable` (the artifact
convention refuses an answer), `n/a` (the denominator is zero) — and the same metric set has to
render in two output modes with two different audiences. A behavior spec is what keeps those
states from being re-invented per metric, and what keeps the human table and the JSON document
from drifting apart.

**What this document decides.** The command surface and its closed flag set; the two output modes
and their exact tokens and field spellings; the row set and ordering of the human table; the
top-level key set of the JSON document; the decision points in single-feature and fleet flows;
exit codes; and every edge case with its observable outcome. REQ O-1 assigns the JSON field
spellings, the table column layout, the ratio's rendering precision and the not-available /
harvested tokens to this document; §4 fixes them.

**What this document does not decide.** Whether the command reuses the pipeline driver's existing
parsing or implements its own read path (REQ O-2), whether it registers as a subcommand of the
`pdlc` entry point or ships standalone (REQ O-3), and every internal — module boundaries, data
shapes, seam design, traversal strategy. Those are TSPEC's. Where this document needs a
classification (is this basename a malformed cross-review? is this post-mortem resolved?) it
names the *outcome the operator sees* and defers the rule itself to REQ C-5, which binds the
command to the pipeline driver's own classification of the same bytes.

**Fidelity anchor.** REQ C-5's "no independent parsing rules" is the load-bearing constraint of
the whole feature: a stats command whose idea of "round 5" disagrees with the driver's is worse
than no stats command, because it produces confident wrong numbers. The classifications this
command re-reads are all already made in one place in the shipped pipeline —
`parseReviewFilename` and `deriveRoundWindow` for cross-review basenames and round indices,
`deriveDodRoundIndex` for the `CODE_REVIEW-{feature}-v{N}.md` grammar, and `parseResolvedMarker`
for the post-mortem `RESOLVED:` marker, all in `pdlc/workflows/orchestrate-dev.js`. §4's rules
name observable outcomes of those classifications and never restate their internals.

**Audiences.** The human mode's reader is a pipeline operator scanning for convergence
regressions across a feature or a fleet. The JSON mode's reader is a future automated caller
(REQ NG-1 keeps that integration out of scope, but REQ-STATS-02 requires the surface be stable
enough to consume when it lands). The two modes report the identical metric set; they differ
only in rendering.

## 2. Linked Requirements

*(pending)*

## 3. Behavioral Flow

*(pending)*

## 4. Business Rules

*(pending)*

## 5. Edge Cases and Error Scenarios

*(pending)*

## 6. Acceptance Tests

*(pending)*

## 7. Open Questions

*(pending)*

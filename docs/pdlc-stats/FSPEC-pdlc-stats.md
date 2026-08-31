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

This FSPEC links exactly one requirements document: `docs/pdlc-stats/REQ-pdlc-stats.md`.

### 2.1 Acceptance criteria coverage

Every REQ acceptance criterion is discharged by at least one business rule and at least one
acceptance test. No row is empty; a criterion with no behavioral surface here would mean the FSPEC
under-specifies the command.

| REQ criterion | Behavioral surface | Business rules | Acceptance tests |
|---|---|---|---|
| REQ-STATS-01 single-feature human-readable stats | §3.1 Flow A; §4.3 human rendering | BR-01, BR-02, BR-03, BR-16, BR-17 | AT-01, AT-02, AT-03 |
| REQ-STATS-02 machine-readable `--json` | §3.3 Flow C; §4.4 JSON document | BR-18, BR-19, BR-20, BR-21 | AT-04, AT-05, AT-06 |
| REQ-STATS-03 review rounds by document type | §3.1 step 5; §4.2 | BR-05, BR-06, BR-07, BR-08, BR-09 | AT-07, AT-08, AT-09, AT-10 |
| REQ-STATS-04 DoD-round count | §3.1 step 6; §4.2 | BR-10, BR-11 | AT-11, AT-12 |
| REQ-STATS-05 halts by phase and resolution | §3.1 step 7; §4.2 | BR-12, BR-13 | AT-13, AT-14 |
| REQ-STATS-06 process-to-spec byte ratio | §3.1 step 8; §4.2 | BR-14, BR-15, BR-16 | AT-15, AT-16, AT-17 |
| REQ-STATS-07 fleet mode, gaps explicit | §3.2 Flow B | BR-22, BR-23, BR-24, BR-25 | AT-18, AT-19, AT-20 |
| REQ-STATS-08 read-only, no network, no git writes | §3.4; §4.5 | BR-26, BR-27 | AT-21, AT-22 |
| REQ-STATS-09 unknown feature reported | §3.1 step 3; §5 EC-01 | BR-04, BR-28 | AT-23, AT-24 |

### 2.2 Constraint coverage

| REQ constraint | Where honored |
|---|---|
| C-1 read-only surface | BR-26, BR-27; AT-21, AT-22 |
| C-2 feature-directory discovery, never summed | BR-02; AT-02, EC-02 |
| C-3 spec-document set, fixed | BR-14 (spec side enumeration) |
| C-4 process-artifact set, fixed | BR-14 (process side enumeration) |
| C-5 parsing fidelity, no independent rules | BR-05, BR-06, BR-10, BR-12; §1 fidelity anchor |

### 2.3 Goal coverage

| REQ goal | Where honored |
|---|---|
| G-1 single-feature stats | §3.1, BR-01 |
| G-2 machine-readable mode | §3.3, BR-18 |
| G-3 fleet mode with explicit gaps | §3.2, BR-22, BR-25 |
| G-4 read-only, always | §3.4, BR-26 |

### 2.4 Non-goals restated as behavioral silence

The following produce **no** output field, **no** table column and **no** JSON key. They are listed
because a reviewer should be able to check the JSON key set against them: any key outside §4.4's
enumeration would be one of these leaking in.

- Per-dispatch payload size (REQ NG-3) — no `payloadBytes` field.
- Dispatch count (REQ NG-8) — no `dispatches` field; erratum events surface only where they
  produced a post-mortem, and then only as a halt entry.
- Cross-repo aggregation (REQ NG-2) — fleet mode's scope is the repository the command runs in.
- Any write-side integration with `harvest-learnings` / `consolidate-learnings` (REQ NG-1),
  the decision ledger or convergence config (REQ NG-4), or the `RESOLVED:` lifecycle (REQ NG-5).

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

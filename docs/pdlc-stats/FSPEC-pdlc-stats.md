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

Three flows share one metric computation. Flow A is the single-feature run, Flow B the fleet run,
Flow C the rendering fork that both take. §3.4 is the read-only invariant that holds across all of
them, on every path including error paths.

### 3.1 Flow A — `pdlc stats {feature}` (single feature)

| Step | Action | Decision point | Outcome |
|---|---|---|---|
| A1 | Read the invocation: subcommand `stats`, at most one positional (the feature name), flags. | Is every flag in BR-01's closed set, and does every value flag carry a value? | No → usage error, exit 1, nothing on stdout (EC-08). Yes → A2. |
| A2 | Resolve the repository root and the `docs/` root (BR-01's `--cwd`). | Is the `docs/` root readable? | No → EC-09, exit 1. Yes → A3. |
| A3 | Resolve the feature's artifact directory. | Does `docs/{feature}/` exist? | Yes → use it, do not look further (BR-02). No → does `docs/completed/{feature}/` exist? Yes → use it. No → EC-01 not-found, exit 1. |
| A4 | List the artifact files directly in the resolved directory (BR-03: no subdirectory traversal). | — | A5. |
| A5 | Compute review rounds per document type (BR-05…BR-09). | Per document type: any well-formed cross-review? a round-1 collision? a `LEARNINGS-{feature}.md` present? | A number, `unmeasurable`, `harvested`, or `0`. Malformed basenames accumulate separately (BR-06). |
| A6 | Compute the DoD-round count (BR-10, BR-11). | Any `CODE_REVIEW-*` file present? | Highest version found, `harvested`, or `0`. |
| A7 | Compute halts by phase (BR-12, BR-13). | Per post-mortem file: what does the driver's `RESOLVED:` rule classify it as? | One entry per phase, tagged `resolved` or `open`. No files → an empty halt set, not an error. |
| A8 | Compute the process-to-spec byte ratio (BR-14…BR-16). | Is either process family entirely absent alongside a `LEARNINGS-{feature}.md`? Is the spec total zero? | `harvested`, `n/a`, or a rendered ratio. Harvested is checked before the zero-denominator test (BR-16). |
| A9 | Render (Flow C) and exit 0. | — | Exactly one report on stdout. |

Steps A5–A8 are independent of one another: none consumes another's result, so a state in one
metric never propagates into another. That independence is REQ-STATS-03/04/06's per-metric
harvested discipline stated as flow — a feature whose cross-reviews were harvested but whose DoD
reviews survive reports `harvested` rows *and* a measured DoD number in the same report.

### 3.2 Flow B — `pdlc stats` (no feature argument, fleet mode)

| Step | Action | Decision point | Outcome |
|---|---|---|---|
| B1 | Validate flags as A1. | — | Usage error → exit 1. |
| B2 | Read the `docs/` root. | Readable? | No → EC-09, exit 1 (the one non-zero exit fleet mode has). Yes → B3. |
| B3 | Discover candidate features: immediate **directories** under `docs/`, minus BR-22's exclusion set; plus the immediate directories under `docs/completed/`. | Is this entry a directory? Is its name in the exclusion set? | Loose files at either root are never candidates (BR-23). |
| B4 | Assert the exclusion set is set-equal to the non-feature directories actually present at the `docs/` root. | Equal? | No → EC-10: the report still prints, and the unexpected directory is reported as an unclassified entry rather than silently joining or silently vanishing. |
| B5 | For each candidate, run A4–A8. | Did the feature's computation fail to produce a metric set (unreadable directory, no artifacts at all)? | Yes → a gap row naming the feature and the reason (BR-25). No → a normal row. |
| B6 | Render (Flow C) and exit 0. | — | Gap rows are rows, not failures: fleet mode exits 0 whenever it produced its report (BR-24). |

A feature that appears under both `docs/` and `docs/completed/` is reported **once**, from
`docs/{feature}/`, per BR-02 — never summed and never listed twice.

### 3.3 Flow C — rendering fork

| Step | Action | Decision point | Outcome |
|---|---|---|---|
| C1 | Choose a mode. | Was `--json` supplied? | Yes → C3. No → C2. |
| C2 | Human mode: render §4.3's table(s) to stdout. | Single feature or fleet? | One feature block, or one row per feature plus the gap rows. |
| C3 | JSON mode: serialize §4.4's document to stdout. | Single feature or fleet? | The 5-key single-feature document, or the 2-key fleet document. |
| C4 | Emit. | Is there any diagnostic to say? | Diagnostics go to stderr in **both** modes; in JSON mode stdout carries the JSON document and nothing else (BR-18). |

The two renderings consume the same computed metric set. That is what makes REQ-STATS-02's
set-equality checkable: a metric that reached the human table without reaching the JSON document
would have to have been computed twice.

### 3.4 The read-only invariant (all flows)

The command performs no filesystem write, no deletion, no directory creation, no temporary file
anywhere (including outside the repository), no network request and no `git` write command, on
every path — success, usage error, not-found, unreadable root, or an unexpected failure. Byte
sizes come from the working tree as it is on disk, never from `git show` or any other history
read (REQ R-3). The invariant is stated here as a flow property because it must hold on paths that
have no other flow: an invocation that exits at A1 with a usage error is still bound by it.

REQ-STATS-08 pairs this with a liveness conjunct: leaving the tree untouched never suffices on its
own. The same invocation must also do its job — exit 0 having emitted the metric set, or exit
non-zero having emitted the not-found report. A command that printed nothing would satisfy the
read-only half and fail the criterion. AT-21 and AT-22 assert both halves against one invocation.

## 4. Business Rules

*(pending)*

## 5. Edge Cases and Error Scenarios

*(pending)*

## 6. Acceptance Tests

*(pending)*

## 7. Open Questions

*(pending)*

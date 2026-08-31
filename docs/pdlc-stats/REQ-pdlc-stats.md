---
feature: pdlc-stats
ready: true
depends-on:
---

# REQ pdlc-stats

| Field | Value |
|---|---|
| Upstream | **REQ** (root). Design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §4 (CLI surface), §5.2 (measurement closes the loop). Proposal source: `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §5, "Measurement plan" |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.1 | 2026-08-31 |

## 1. Problem / Context

The pipeline already emits everything a measurement query needs — cross-review round history, DoD
review versions, halt post-mortems, and per-document byte sizes — but nothing reads it back. Every
number in `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §5's savings model is
an *estimate derived from two corpora, not a measurement*; the proposal's own last paragraph in
that section says a baseline requires a query, not new instrumentation, naming three series: round
counts per document type (derivable from `CROSS-REVIEW-{role}-{doc}-v{N}` basenames already on
disk), per-dispatch payload size, and erratum events/halts (countable from POSTMORTEM files).
`docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §8 (Rollout order) sequences this as the
second step, immediately after the decision ledger (M4): "small, mechanical... nothing
attributable" — a read-only reporting command, not a new pipeline mechanism. Without it, every
claim about round-count regressions, ratio drift, or config-gated-experiment wins (M2/M3-style,
per DESIGN §5) is asserted from memory of individual cross-review files rather than computed from
what is already on disk, and §5.2's self-review loop — "measurement closes the loop" — has no
concrete surface to close through.

## 2. Goals

**G-1 (single-feature stats).** `pdlc stats {feature}` computes and prints, for one named feature,
review-round counts per document type, DoD-round count, halts by phase with resolution state, and
the feature's process-to-spec byte ratio — read from artifacts already on disk under
`docs/{feature}/` or `docs/completed/{feature}/`.

**G-2 (machine-readable mode).** A `--json` flag on the same invocation emits the identical metric
set as a single well-formed JSON document on stdout, so another skill or script can consume it
without re-deriving anything from raw filenames.

**G-3 (fleet mode with explicit gaps).** Invoked with no feature argument, `pdlc stats` reports the
same metrics across every discoverable feature, and any feature whose expected artifacts are
missing or fail to parse is reported explicitly as missing/malformed — never silently dropped from
the output.

**G-4 (read-only, always).** The command never writes, moves, or deletes a file, never issues a
network call, and never runs a `git` write command, in either mode, on success or failure — a
measurement tool that mutates state is not trustworthy input to the loop it measures.

## 3. Non-Goals

**NG-1** This REQ does not modify `harvest-learnings` or `consolidate-learnings` SKILL.md to
consume `pdlc stats --json` output or embed it into `LEARNINGS-{feature}.md` metadata. That
integration, if pursued, is a separate future REQ; this REQ only guarantees the JSON exists and is
stable enough to be consumed later.

**NG-2** Cross-repo or fleet-wide aggregation across multiple consuming repositories is out of
scope. `pdlc stats` (with or without a feature argument) operates only over the repository it runs
in.

**NG-3** Per-dispatch payload size (the proposal §5 series sourced from `report.learningsInjection`)
is out of scope for this REQ. Only the three series named in this REQ's scope — review rounds, DoD
rounds, halts, and byte ratio — are computed; payload-size reporting may be added in a later REQ.

**NG-4** No changes to `decisionLedger`, `cascade.pinCheck`, or `review.derivativeStop` config
semantics, or to any review-loop convergence logic. `pdlc stats` reads artifacts those mechanisms
already produce; it does not change when or how a document converges.

**NG-5** No changes to the `POSTMORTEM-*` `RESOLVED:` lifecycle, the erratum channel, or the
fail-closed gate. `pdlc stats` reports on their observable output; it never writes a `RESOLVED:`
line or otherwise participates in clearing a halt.

**NG-6** No retroactive recovery of metrics for artifacts already deleted (for example, cross-review
files removed by `harvest-learnings` after `guard-harvest-before-delete`'s condition is met).
`pdlc stats` reports only on what is currently on disk for a feature.

**NG-7** No new decision-ledger, glossary, or size-tiering mechanism (`docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html`
moves M4/R3-3/R3-5) is introduced or altered by this REQ.

## 4. Constraints

**C-1 (read-only surface).** `pdlc stats` performs no filesystem write, no file deletion, and no
network I/O in any code path, including error paths. If it inspects `git` state at all, it is
limited to read-only inspection (for example, resolving a commit hash already required by an
existing artifact convention) — never a write command (`commit`, `push`, `add`, `checkout`, or
similar).

**C-2 (feature-directory discovery).** A feature's artifacts are looked up under `docs/{feature}/`
if that directory exists, else under `docs/completed/{feature}/` if that exists — never both summed
together for one feature. This preference order is **this REQ's own decision**, not an inherited
convention: `CLAUDE.md`'s Artifact convention section names only `docs/{feature}/`. The archive
location is verifiable elsewhere — `pdlc/OPERATIONS.md` (learnings-injection bullet "Where the
material comes from", naming `docs/completed/*/LEARNINGS-*.md`) and the archive marker
`docs/completed/REQ-completed.md`, which documents the archive convention and its `coveredViolations`
interaction. When neither directory exists, REQ-STATS-09 governs.

**C-3 (spec-document set — fixed, not operator-configurable).** The "spec" side of the
process-to-spec byte ratio (REQ-STATS-06) is the byte total of whichever of these document types are
present for the feature: `REQ-{feature}.md`, `FSPEC-{feature}.md`, `TSPEC-{feature}.md`,
`PLAN-{feature}.md`, `PROPERTIES-{feature}.md`, `DECISIONS-{feature}.md`. This set is fixed by this
REQ; it is not a config key because it names a document-type enumeration this repo's artifact
convention already defines, not a per-operator preference.

**C-4 (process-artifact set — fixed, not operator-configurable).** The "process" side of the same
ratio is the byte total of every file matching the already-documented cross-review, post-mortem, and
DoD-review basename grammars for that feature: `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`,
`POSTMORTEM-{phase}-{feature}.md`, `CODE_REVIEW-{feature}-v{N}.md`. Fixed for the same reason as
C-3.

**C-5 (parsing fidelity — no independent parsing rules).** For **every** artifact-parsing rule this
command re-reads — the `CROSS-REVIEW-*` basename grammar and round derivation, the
`CODE_REVIEW-*-v{N}` version grammar, and the POSTMORTEM `RESOLVED:` marker — the classification
`pdlc stats` reports must never diverge from the classification the pipeline's own driver derives
from the same bytes, per the conventions documented in `pdlc/OPERATIONS.md` (review loop mechanics;
post-mortem lifecycle). This REQ defines no new, separate parsing rule for any of them, and no AC
below restates one: where an AC needs a classification, it names the observable outcome and defers
the rule itself to this constraint. Notably, this makes the `RESOLVED:` marker's case-insensitivity,
its single-marker requirement, and its outside-a-fenced-block requirement binding on this command
without this REQ restating them.

## 5. Acceptance Criteria

### REQ-STATS-01 Single-feature human-readable stats (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** a feature argument naming a directory
present under `docs/{feature}/` or `docs/completed/{feature}/`. **When:** the operator runs
`pdlc stats {feature}`. **Then:** the command prints a human-readable table listing, for that
feature: review-round count per document type present (REQ-STATS-03), DoD-round count
(REQ-STATS-04), halts by phase with resolution state (REQ-STATS-05), and the process-to-spec byte
ratio (REQ-STATS-06); the command issues no network call and writes no file to disk.

### REQ-STATS-02 Machine-readable `--json` mode (P0)
**Source:** US-02. **Who:** pipeline operator, or an automated caller such as `harvest-learnings` /
`consolidate-learnings`. **Given:** the same feature argument as REQ-STATS-01 plus a `--json` flag.
**When:** `pdlc stats {feature} --json` runs. **Then:** stdout is exactly one well-formed JSON
document containing the same metric set as REQ-STATS-01, under stable field names; no other text is
mixed into stdout in this mode.

### REQ-STATS-03 Review rounds by document type (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** the feature directory contains
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` files for one or more document types. **When:** the
command computes the round count for a document type. **Then:** the reported count equals the round
window the review-loop driver would derive from those same basenames for that document type per
C-5; any basename that fails the already-documented well-formed cross-review grammar is excluded
from the count and reported separately as malformed, never silently folded into a document type's
count.

### REQ-STATS-04 DoD-round count (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** the feature directory contains zero or
more `CODE_REVIEW-{feature}-v{N}.md` files. **When:** the command computes the DoD-round count.
**Then:** the reported count equals the highest version `N` found on disk, or `0` when no such file
is present.

### REQ-STATS-05 Halts by phase and resolution state (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** the feature directory contains zero or
more `POSTMORTEM-{phase}-{feature}.md` files. **When:** the command computes halts. **Then:** it
reports one entry per distinct phase with a post-mortem file present, each tagged resolved (a
`RESOLVED: yes` line is present per the already-documented POSTMORTEM lifecycle convention) or open
(that line is absent, says anything other than `yes`, or the file cannot be parsed); absence of any
post-mortem file for the feature is reported as zero halts, never as an error.

### REQ-STATS-06 Process-to-spec byte ratio (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** the feature directory contains any subset
of the spec document types (C-3) and any subset of the process artifact types (C-4). **When:** the
command computes the ratio. **Then:** it reports process bytes (C-4 set, present files only) divided
by spec bytes (C-3 set, present files only); when spec bytes total zero (no spec document present),
the command reports the ratio as not-available rather than dividing by zero or crashing.

### REQ-STATS-07 Fleet mode reports every feature, flags gaps explicitly (P1)
**Source:** US-03. **Who:** pipeline operator. **Given:** `pdlc stats` invoked with no feature
argument. **When:** the command runs. **Then:** it discovers every feature directory under
`docs/{feature}/` and `docs/completed/{feature}/` (excluding the non-feature-scoped directories this
repo's `CLAUDE.md` and `pdlc/OPERATIONS.md` already name — `docs/_queue/`, `docs/_constraints/`,
`docs/_decisions/`, `docs/design/`, `docs/requirements/`, `docs/ideas/`, `docs/discarded/`),
computes REQ-STATS-01's metric set for each, and for any feature whose expected artifacts are
missing or fail to parse, reports that feature by name as missing/malformed in the output rather
than omitting it.

### REQ-STATS-08 Read-only, no network, no git writes (P0)
**Source:** US-01, US-02, US-03. **Who:** pipeline operator or automated caller. **Given:** any
invocation of `pdlc stats`, in either mode, on success or on failure. **When:** the command runs to
completion or exits with an error. **Then:** it creates, modifies, or deletes no file on disk;
issues no network request; and runs no `git` write command (`commit`, `push`, `add`, `checkout`, or
similar) — a read-only `git` inspection is permitted only where limited to read commands.

### REQ-STATS-09 Unknown feature reported, not silently empty (P1)
**Source:** US-01. **Who:** pipeline operator. **Given:** a feature argument naming a directory
absent under both `docs/{feature}/` and `docs/completed/{feature}/`. **When:** `pdlc stats
{feature}` runs. **Then:** the command exits non-zero and reports the feature as not found, in both
human-readable and `--json` modes; the `--json` mode emits an error object rather than a truncated
or partial success document.

## 6. Risks

**R-1** A permissive basename parser could silently include malformed cross-review files in a round
count, inflating it. Mitigated by REQ-STATS-03's requirement to exclude and separately report
malformed basenames rather than fold them into a count.

**R-2** A feature present under both `docs/{feature}/` and `docs/completed/{feature}/` mid-archival
move could be double-counted. Mitigated by C-2: the two locations are checked in a fixed preference
order and never summed.

**R-3** An implementation could reach for `git log`/`git show` to compute byte sizes or history and
inadvertently perform a network fetch or a write. Mitigated by C-1 and REQ-STATS-08: filesystem
`stat`/read only; any `git` use is read-only inspection, never write, never network.

**R-4** The process-to-spec ratio's denominator can be legitimately zero for a feature with no spec
document yet on disk (for example, mid-authoring). Mitigated by REQ-STATS-06's explicit
not-available reporting instead of a divide-by-zero failure.

**R-5** Consumers of `--json` output (a future `harvest-learnings`/`consolidate-learnings`
integration, per NG-1) could depend on field names this REQ has not fixed, causing later breakage.
Mitigated by deferring exact JSON schema to FSPEC/TSPEC (O-1) rather than letting an
implementation detail harden as an accidental contract now.

## 7. Obligations / Open Questions

**O-1** The exact JSON field names/schema, human-readable table column layout, and the precise
non-feature-scoped directory exclusion list (REQ-STATS-07) are FSPEC/TSPEC material, not specified
here.

**O-2** Whether `pdlc stats` reuses shared parsing logic already present in `pdlc/workflows/` (for
example, via a shared module) or implements an independent read path is a TSPEC-level design
choice. This REQ requires only the outcome C-5 states: the counts `pdlc stats` reports never diverge
from what the review-loop driver would compute from the same basenames.

**O-3** Whether `pdlc stats` becomes a new CLI subcommand of the existing `pdlc` engine entry point
or a standalone script is a TSPEC-level design choice; `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md`
§4 names `pdlc stats [feature]` as the intended surface alongside `pdlc dev`, `pdlc queue`, `pdlc
decide`, and `pdlc doctor`.

**O-4** Per-dispatch payload-size reporting (NG-3) and cross-repo aggregation (NG-2) are named as
explicitly out of scope, not deferred capabilities of this REQ — neither is promised here, so
neither requires a bound successor under the deferral-binding obligation; either may become its own
future REQ.

**Assumptions.**

- **A-1** The `feature` argument is the literal directory basename used under `docs/` or
  `docs/completed/` (matching the convention this repo's other REQs and the queue already use — see
  `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md`'s own frontmatter `feature:` field for
  precedent). No fuzzy or partial-name matching is required.
- **A-2** Metrics are always computed fresh from current on-disk state at invocation time — no
  caching, no persisted stats file — consistent with this REQ's read-only stance (G-4, C-1) and with
  the "index reflects records that exist at construction time, never a stale snapshot" currency
  posture already used elsewhere in this pipeline (see `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md`
  G-3).
- **A-3** This REQ was authored in an orchestrated (non-interactive) dispatch; the choices above are
  explicit, operator-vetoable assumptions, not blocking open questions.

## User Stories

- **US-01** As a pipeline operator, I want per-feature round/DoD/halt/byte-ratio metrics on demand,
  so that I can identify convergence regressions without manually reading every cross-review file.
  → REQ-STATS-01, REQ-STATS-03, REQ-STATS-04, REQ-STATS-05, REQ-STATS-06, REQ-STATS-09
- **US-02** As an automated caller (a future `harvest-learnings`/`consolidate-learnings` integration),
  I want a stable machine-readable form of the same metrics, so that I can consume them without
  re-deriving anything from raw filenames myself. → REQ-STATS-02
- **US-03** As a pipeline operator running the command with no feature named, I want a report across
  every feature with gaps called out explicitly, so that a missing or malformed feature is never
  silently absent from the picture. → REQ-STATS-07, REQ-STATS-08

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

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
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v{N}.md`, `CROSS-REVIEW-test-engineer-REQ-v{N}.md` (harvested to LEARNINGS at Phase H) |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.7 | 2026-08-31 |

Erratum (v1.7): one clause decided, no rule added. REQ-STATS-06's "a grammatical basename outside
the driver's catalogue is a survivor" contradicted its own preceding rationale and C-5's fidelity
rule, and dissented from every downstream reading of the same file. It is withdrawn: a basename the
catalogue does not recognise counts as no file of its family remaining, so a feature carrying only
those reports **harvested**. No other change.

Round 7 (v1.6): REQ-STATS-05's harvested halt state withdrawn and `0` restored. Both universal
readings of what harvest does to post-mortems were falsified in turn, so the AC no longer rests on
either: it reports what is on disk and R-6 records the resulting `0` conflation as an accepted
residual. NG-6 scopes the harvested states to the two families harvest removes; REQ-STATS-02 and R-6
propagated. No other change.

## 1. Problem / Context

The pipeline already emits everything a measurement query needs — cross-review round history, DoD
review versions, halt post-mortems, per-document byte sizes — but nothing reads it back. Every
number in `docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html` §5's savings model is an
*estimate derived from two corpora, not a measurement*; that section says a baseline needs a query,
not new instrumentation. `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §8 sequences this
second, after the decision ledger: "small, mechanical" — a read-only reporting command, not a new
mechanism. Without it, every claim about round-count regressions or ratio drift is asserted from
memory of individual cross-review files, and §5.2's "measurement closes the loop" has no surface to
close through.

## 2. Goals

**G-1 (single-feature stats).** `pdlc stats {feature}` computes and prints, for one named feature,
review-round counts per document type, DoD-round count, halts by phase with resolution state and the
process-to-spec byte ratio — from artifacts already on disk under `docs/{feature}/` or
`docs/completed/{feature}/`.

**G-2 (machine-readable mode).** A `--json` flag emits the identical metric set as one well-formed
JSON document on stdout, so a skill or script can consume it without re-deriving anything.

**G-3 (fleet mode with explicit gaps).** Invoked with no feature argument, `pdlc stats` reports the
same metrics across every discoverable feature; any feature whose directory cannot be read is
reported by name with the reason, never silently dropped, while absent or unparseable artifacts
surface inside their own metric's value, not as a feature-level label.

**G-4 (read-only, always).** The command never writes, moves or deletes a file, never issues a
network call and never runs a `git` write command, in either mode, on success or failure — a
measurement tool that mutates state is not trustworthy input to the loop it measures.

## 3. Non-Goals

**NG-1** This REQ does not modify `harvest-learnings` or `consolidate-learnings` SKILL.md to
consume `--json` output or embed it into `LEARNINGS-{feature}.md`. That integration is a separate
future REQ; this REQ only guarantees the JSON exists and is stable enough to consume later.

**NG-2** Aggregation across multiple consuming repositories is out of scope: `pdlc stats` operates
only over the repository it runs in.

**NG-3** Per-dispatch payload size (the proposal §5 series sourced from `report.learningsInjection`)
is out of scope. Only review rounds, DoD rounds, halts and the byte ratio are computed.

**NG-4** No changes to `decisionLedger`, `cascade.pinCheck` or `review.derivativeStop` config
semantics, or to any convergence logic: `pdlc stats` only reads what those mechanisms produce.

**NG-5** No changes to the `POSTMORTEM-*` `RESOLVED:` lifecycle, the erratum channel or the
fail-closed gate: `pdlc stats` never writes a `RESOLVED:` line or participates in clearing a halt.

**NG-6** No retroactive recovery of metrics for artifacts no longer on disk. The harvested states
cover the two families `harvest-learnings` removes — cross-reviews and DoD reviews; an absent
post-mortem is reported as REQ-STATS-05's measured `0`, not recovered and not relabelled.
`pdlc stats` reports only what is on disk — but says so where it applies, per the harvested states.
`LEARNINGS-{feature}.md` is only ever the discriminator separating harvested from a genuine zero —
its `Harvested from` row is never parsed to reconstruct a deleted count.

**NG-7** No new decision-ledger, glossary or size-tiering mechanism (proposal moves M4/R3-3/R3-5) is
introduced or altered here.

**NG-8** Dispatch count is out of scope, though `DESIGN-pdlc-minimal-loop-2026-08-30.md` §4
("rounds, dispatches, payload bytes, halts") and §5.2 ("dispatch count") name it: a dispatch leaves
no on-disk artifact C-1's read-only stance can count. Erratum events are likewise counted only as
post-mortem halts (REQ-STATS-05), never from erratum changelog rows.

## 4. Constraints

**C-1 (read-only surface).** `pdlc stats` performs no filesystem write, no deletion and no network
I/O in any code path, including error paths. Any `git` use is read-only inspection — never a write
command (`commit`, `push`, `add`, `checkout`, or similar).

**C-2 (feature-directory discovery).** A feature's artifacts are looked up under `docs/{feature}/`
if it exists, else `docs/completed/{feature}/` — never both summed for one feature. This preference order is **this REQ's own decision**, not an inherited
convention: `CLAUDE.md`'s Artifact convention section names only `docs/{feature}/`. The archive
location is verifiable elsewhere: `pdlc/OPERATIONS.md`'s learnings-injection bullet "Where the
material comes from" names `docs/completed/*/LEARNINGS-*.md`, and the archive marker
`docs/completed/REQ-completed.md` documents the archive convention. When neither directory exists,
REQ-STATS-09 governs.

**C-3 (spec-document set — fixed, not operator-configurable).** The "spec" side of the ratio
(REQ-STATS-06) is the byte total of whichever of these are present: `REQ-{feature}.md`,
`FSPEC-{feature}.md`, `TSPEC-{feature}.md`, `PLAN-{feature}.md`, `PROPERTIES-{feature}.md`,
`DECISIONS-{feature}.md`. Fixed by this REQ, not a config key: it names a document-type enumeration
the artifact convention already defines, not a per-operator preference.

**C-4 (process-artifact set — fixed, not operator-configurable).** The "process" side is the byte
total of every file matching the documented cross-review, post-mortem and DoD-review basename
grammars: `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, `POSTMORTEM-{phase}-{feature}.md`,
`CODE_REVIEW-{feature}-v{N}.md`. Fixed for C-3's reason.

**C-5 (parsing fidelity — no independent parsing rules).** For **every** artifact-parsing rule this
command re-reads — the `CROSS-REVIEW-*` basename grammar and round derivation, the
`CODE_REVIEW-*-v{N}` version grammar and the POSTMORTEM `RESOLVED:` marker — the classification
`pdlc stats` reports must never diverge from the classification the pipeline's own driver derives
from the same bytes, per the conventions documented in `pdlc/OPERATIONS.md` (review loop mechanics;
post-mortem lifecycle). This REQ defines no new, separate parsing rule for any of them, and no AC
below restates one: where an AC needs a classification, it names the observable outcome and defers
the rule itself to this constraint. Notably, this makes the `RESOLVED:` marker's case-insensitive
*value* matching, its single-marker requirement, and its outside-a-fenced-block requirement binding
on this command without this REQ restating them. Discovering *which* phases have a post-mortem is carved out: the driver builds
that path from a phase it already holds and classifies no `POSTMORTEM-*` basename, so there is
nothing to defer to. That listing is this REQ's own (REQ-STATS-05); fidelity binds the `RESOLVED:`
marker, not the discovery. Fidelity binds the driver's
per-file rejection reason, not its coarser aggregate reject list: a basename it rejects as not a cross-review is not
malformed here (REQ-STATS-03).

## 5. Acceptance Criteria

### REQ-STATS-01 Single-feature human-readable stats (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** a feature argument naming a directory
present under `docs/{feature}/` or `docs/completed/{feature}/`. **When:** the operator runs
`pdlc stats {feature}`. **Then:** it prints a human-readable table listing, for that feature:
review-round count per document type present (REQ-STATS-03), DoD-round count (REQ-STATS-04), halts
by phase with resolution state (REQ-STATS-05) and the process-to-spec byte ratio (REQ-STATS-06),
under REQ-STATS-08's read-only stance.

### REQ-STATS-02 Machine-readable `--json` mode (P0)
**Source:** US-02. **Who:** pipeline operator, or an automated caller (`harvest-learnings` /
`consolidate-learnings`). **Given:** REQ-STATS-01's feature argument plus a `--json` flag.
**When:** `pdlc stats {feature} --json` runs. **Then:** stdout is exactly one well-formed JSON
document whose top-level key set is set-equal to REQ-STATS-01's printed metric set plus one
schema-version field — REQ-STATS-03's malformed and unmeasurable states and REQ-STATS-03/04/06's
harvested state ride in their own metric's value, never as extra top-level keys — so a metric added
to human mode without a JSON field fails; nothing else is mixed into stdout in this mode.

### REQ-STATS-03 Review rounds by document type (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** the feature directory contains
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` files. **When:** the command computes a document type's
round count. **Then:** the reported count is **the highest
round index present on disk for that document type, taken across all roles** — one number per
document type, not per role, and not a range: a document type whose test-engineer review reached
round 5 and whose product-manager review reached round 3 reports `5`. A basename that begins
`CROSS-REVIEW-` but fails the grammar (per C-5) is excluded and reported separately as malformed. Malformed names exclusion
from the count under the driver's grammar, not damage to a file, and so covers the
grammatical-but-out-of-catalogue names the pipeline writes
(`CROSS-REVIEW-{role}-REVIEW-v{N}.md`); one label stands: a third bucket would be an independent
rule C-5 forbids. A file not claiming that prefix — the feature's own REQ, LEARNINGS or POSTMORTEM — is neither counted
nor called malformed. Where the convention refuses a round for a document type at all (one role
carrying two files both claiming round one), that document type is reported **unmeasurable**, naming
the colliding role. A document type with no cross-review file on disk reports `0`, or **harvested**
where `LEARNINGS-{feature}.md` is present. That test is per document type, not per feature: a
partially harvested feature reports `harvested` per row for types whose files are gone, and a
measured index for types whose files survive. Harvested is distinct from a measured `0`, since harvest deleted the evidence
(NG-6) and a harvested feature must never print an unreviewed one's number.

### REQ-STATS-04 DoD-round count (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** the feature directory contains zero or
more `CODE_REVIEW-{feature}-v{N}.md` files. **When:** the command computes the DoD-round count.
**Then:** the reported value is the **highest version `N` found on disk** — the last DoD round
index, deliberately not a file count, because harvest deletes DoD reviews (NG-6) and a count would
understate a partially harvested feature — or `0` when none is present. A basename beginning
`CODE_REVIEW-` that does not match the version grammar simply does not contribute, exactly as an
unrelated file: the driver draws no malformed distinction on the DoD side, so neither does this (C-5). The harvested state applies only when this metric's own evidence is absent:
where `LEARNINGS-{feature}.md` is present **and** no `CODE_REVIEW-{feature}-v{N}.md` file matching
the version grammar remains, this metric reports **harvested** rather than `0`; where any survives, the measured highest version wins.

### REQ-STATS-05 Halts by phase and resolution state (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** the feature directory contains zero or
more `POSTMORTEM-{phase}-{feature}.md` files. **When:** the command computes halts. **Then:** it
reports one entry per distinct phase with a post-mortem file present, each tagged resolved or open
**exactly as the pipeline's own `RESOLVED:` marker rule classifies that file (C-5)** — this REQ
states no marker-matching rule of its own, so case, duplicate markers and fenced-block placement are
decided in one place. Where no `POSTMORTEM-{phase}-{feature}.md` file is present, halts report `0`.
No harvested state is drawn here: the post-mortem family is not one this REQ treats as
harvest-removed (NG-6). A `0` therefore means only that no halt evidence is on disk, and
deliberately does not distinguish a feature that never halted from one whose post-mortem files are
gone; R-6 records that accepted residual. Neither is an error, and any surviving post-mortem yields
measured entries as above.

### REQ-STATS-06 Process-to-spec byte ratio (P0)
**Source:** US-01. **Who:** pipeline operator. **Given:** any subset of the spec document types
(C-3) and of the process artifact types (C-4) is present. **When:** the command computes the
ratio. **Then:** it reports process bytes (C-4 set, present files only) divided
by spec bytes (C-3 set, present files only); when spec bytes total zero, it reports the ratio as
not-available rather than dividing by zero or crashing. Where `LEARNINGS-{feature}.md` is present and at least one of the two
review families named next is entirely absent — no file matching C-4's
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar remains, or no file matching its
`CODE_REVIEW-{feature}-v{N}.md` grammar does, or neither — the ratio is **harvested**, not measured:
a family harvest deletes is gone from the numerator, so a computed value would silently undercount
rather than be absent. How much of the numerator harvest removes is not asserted here.
The predicate is evaluated over exactly the file set whose bytes the process side sums, so a
basename the driver's document-type catalogue does not recognise — the same one REQ-STATS-03 reports
malformed (C-5) — contributes no process bytes and counts as no file of its family remaining: a
feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured
ratio that would silently undercount. The rendering precision
and the exact not-available / harvested tokens per mode are FSPEC material (O-1).

### REQ-STATS-07 Fleet mode reports every feature, flags gaps explicitly (P1)
**Source:** US-03. **Who:** pipeline operator. **Given:** `pdlc stats` invoked with no feature
argument. **When:** the command runs. **Then:** it discovers every feature directory under
`docs/{feature}/` and `docs/completed/{feature}/`, computes REQ-STATS-01's metric set for each, and
for any feature whose directory cannot be read, reports it by name with the reason rather than
omitting it; a readable but empty directory is not a gap but a normal row whose metrics report
their zero states. Discovery considers **directories only** — a loose file
at the `docs/` root is never a feature — and skips this fixed, this-REQ-owned exclusion set,
asserted set-equal so a directory added later fails rather than silently joining the report:
`docs/_queue/`, `docs/_constraints/`, `docs/_decisions/`, `docs/design/`, `docs/requirements/`,
`docs/ideas/`, `docs/discarded/`, `docs/completed/`. `docs/completed/` is a **container of**
features: traversed for its children, never itself reported — which is what stops the archive marker
`docs/completed/REQ-completed.md` presenting a phantom feature `completed` that would pass a
has-a-REQ heuristic. A gap-flagged feature is a row, not a failure: fleet mode exits zero whenever it
produced its report, non-zero only when it could not read the `docs/` root.

### REQ-STATS-08 Read-only, no network, no git writes (P0)
**Source:** US-01, US-02, US-03. **Who:** pipeline operator or automated caller. **Given:** any
invocation of `pdlc stats`, in either mode, on success or on failure. **When:** the command runs to
completion or exits with an error. **Then:** on the **same** invocation the command both
(a) does its job — exits zero having emitted REQ-STATS-01's metric set, or, on REQ-STATS-09's path,
exits non-zero having emitted the not-found report — and (b) leaves the working tree set-equal
before and after by path and modification time, issues no network request, and runs no `git` write
command (`commit`, `push`, `add`, `checkout`, or similar); read-only `git` inspection is permitted.
Conjunct (b) never suffices alone: a binary that prints nothing, or crashes, fails this criterion.

### REQ-STATS-09 Unknown feature reported, not silently empty (P1)
**Source:** US-01. **Who:** pipeline operator. **Given:** a feature argument naming a directory
absent under both `docs/{feature}/` and `docs/completed/{feature}/` (including a repository with no
`docs/completed/` at all), in a repository whose `docs/` root is present and readable — a missing or
unreadable `docs/` root is not this criterion's case but a root failure. **When:** `pdlc stats {feature}` runs. **Then:** it exits non-zero and
reports the feature as not found in both modes; `--json` emits an error object, never a truncated or
partial success document.

## 6. Risks

**R-1** A permissive basename parser could silently fold malformed cross-review files into a round
count, inflating it. Mitigated by REQ-STATS-03: exclude and report separately, never fold in.

**R-2** A feature present in both locations mid-archival move could be double-counted. Mitigated by
C-2's fixed preference order, never summed.

**R-3** An implementation could reach for `git log`/`git show` for byte sizes or history and
inadvertently fetch or write. Mitigated by C-1/REQ-STATS-08: reads only.

**R-4** The ratio's denominator can be legitimately zero mid-authoring. Mitigated by
REQ-STATS-06's explicit not-available reporting instead of a divide-by-zero failure.

**R-5** Consumers of `--json` (a future `harvest-learnings`/`consolidate-learnings` integration,
per NG-1) could depend on field names that later drift. Mitigated by REQ-STATS-02's two observable
guarantees — the top-level key set is set-equal to the printed metric set, and a schema-version
field is present — while the field spellings themselves stay FSPEC material (O-1).

**R-6** A harvested feature's deleted evidence could read as a genuine zero, corrupting any baseline
over `docs/completed/`, where most features are already harvested. Mitigated by
REQ-STATS-03/04/06's harvested state, reported distinctly from a measured value. For halts the
residual is **accepted, not mitigated**: REQ-STATS-05 reports `0`, which unions "never halted" with
"post-mortem files no longer on disk". A consumer baselining halts over `docs/completed/` must not
read `0` as evidence a feature ran clean.

## 7. Obligations / Open Questions

**O-1** The exact JSON field spellings, the human-readable table column layout, and the ratio's
rendering precision and every metric's not-available / harvested tokens are FSPEC/TSPEC material,
not specified
here. The directory exclusion set is **not** among them: REQ-STATS-07 fixes it.

**O-2** Whether `pdlc stats` reuses parsing logic already in `pdlc/workflows/` or implements its own
read path is a TSPEC design choice; this REQ requires only C-5's outcome — no divergence from the
driver's classification of the same bytes.

**O-3** Whether `pdlc stats` becomes a subcommand of the existing `pdlc` entry point (registering
its flag set there, so `--json` is accepted) or a standalone script is a TSPEC design choice;
`DESIGN-pdlc-minimal-loop-2026-08-30.md` §4 names `pdlc stats [feature]` alongside `pdlc dev`,
`queue`, `decide` and `doctor`.

**O-4** Payload size (NG-3), cross-repo aggregation (NG-2) and dispatch count (NG-8) are out of
scope, not deferred capabilities: nothing is promised here, so no bound successor is owed; any may
become its own future REQ.

**Assumptions.**

- **A-1** The `feature` argument is the literal directory basename used under `docs/` or
  `docs/completed/`, as this repo's REQ frontmatter `feature:` fields and the queue already use it.
  No fuzzy or partial-name matching is required.
- **A-2** Metrics are always computed fresh from on-disk state at invocation time — no caching, no
  persisted stats file — consistent with G-4 and C-1.
- **A-3** Authored in an orchestrated (non-interactive) dispatch; the choices above are explicit,
  operator-vetoable assumptions, not blocking open questions.

## User Stories

- **US-01** As a pipeline operator, I want per-feature round/DoD/halt/byte-ratio metrics on demand,
  so that I can spot convergence regressions without reading every cross-review file.
  → REQ-STATS-01, REQ-STATS-03, REQ-STATS-04, REQ-STATS-05, REQ-STATS-06, REQ-STATS-09
- **US-02** As an automated caller (a future `harvest-learnings`/`consolidate-learnings`
  integration), I want a stable machine-readable form of the same metrics. → REQ-STATS-02
- **US-03** As a pipeline operator running the command with no feature named, I want a report across
  every feature with gaps called out explicitly, so a missing or malformed feature is never silently
  absent. → REQ-STATS-07, REQ-STATS-08

Roll-up recorded in `docs/requirements/traceability-matrix.md`.

---
feature: pdlc-stats
---

# FSPEC pdlc-stats

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7) |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{role}-FSPEC[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.8 | 2026-08-31 |

Erratum round (v1.8): re-grounded on REQ v1.7; **no rule changed**. The raised item was the
contradiction between REQ-STATS-06's "a grammatical basename outside the driver's catalogue is a
survivor" and BR-16's `harvested` on the same `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file. REQ v1.7
withdrew that clause and decided the case BR-16's way — an unrecognised basename counts as no file
of its family remaining — so the item is **absorbed**, not open: BR-16, BR-14 and REQ-STATS-06 now
read one file set, and PROP-RATIO-08's fourth leg asserts that same outcome. The stale `Upstream`
pin (REQ v1.4) is corrected to v1.7, the version this document is re-grounded against. No other
change.

Revision (v1.7): three record corrections, no rule changed. BR-16's citation of
`docs/completed/pdlc-advisory-wave-gate/` said "two" out-of-catalogue cross-reviews; it holds four,
as BR-06 and AT-09 already state. §8's BR-16 trace row gains AT-15, whose *Then* asserts BR-16.
§7.3 row E-5 now cites AT-20 and AT-26, the oracles §8's BR-27 row names, instead of AT-19.

Revision (v1.6): two carried findings. BR-16 now cites
`docs/completed/pdlc-advisory-wave-gate/` for the malformed *basename shape* only — that directory
holds grammar-matching cross-reviews too and reports a measured ratio. AT-15's neither-list gains a
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` file, pinning the BR-16 half no test reached: bytes of a
`CROSS-REVIEW-`-prefixed basename outside BR-09's types reach neither side. No rule changed.

Erratum round (v1.5): the raised item was §7.3's two entries against REQ-STATS-09 (no-`docs/`-root
case) and REQ-STATS-07 (zero-state row), stale because REQ v1.4 already carries both carve-outs.
Re-grounding on REQ v1.4 found the same staleness in the section's other three entries — C-5 now
carves out post-mortem discovery and REQ-STATS-03 now settles the `-REVIEW-v{N}` label — so **all
five are closed** and §7.3 is now a settled-record table (E-1…E-5). The same stale framing was
carried at five sibling sites, corrected here so no site outlives the fix: §1's fidelity anchor,
BR-06, BR-12, BR-27, EC-09 and §7.1's D-8/D-9 rationales now cite REQ v1.4's carve-outs instead of
describing live disagreements. **No behavioural change**: every rule, exit code and acceptance test
is unaltered. No other change.

Erratum round (v1.4): re-grounded on REQ v1.4. BR-11 and BR-16 state their harvested conditions over
the basename grammars REQ-STATS-04/06 name, not bare globs, so BR-16 and BR-14 read one file set;
BR-25 names the archive root's second loose file; §7.3's harvested errata are absorbed.
No other change.

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

One classification is **not** among them, and the boundary matters. `parseResolvedMarker`
classifies a post-mortem's *contents*; nothing in the driver classifies a `POSTMORTEM-*` **listing**
— the driver constructs `docs/{feature}/POSTMORTEM-{phase}-{feature}.md` from a phase id it already
holds and probes that one path. Selecting which files in a directory are this feature's post-mortems
is therefore a match this command makes itself, against the artifact convention's documented
basename form (BR-12). That is not a C-5 divergence, and C-5 itself now says so: it carves the
discovery of *which* phases have a post-mortem out of fidelity, because the driver classifies no
`POSTMORTEM-*` basename and there is nothing to defer to. C-5 binds the resolution tagging, which is
`parseResolvedMarker`'s, and this document states no marker-matching rule of its own.

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
| REQ-STATS-01 single-feature human-readable stats | §3.1 Flow A; §4.3 human rendering | BR-01, BR-02, BR-03, BR-17 | AT-01, AT-02, AT-03 |
| REQ-STATS-02 machine-readable `--json` | §3.3 Flow C; §4.4 JSON document | BR-20, BR-21, BR-22, BR-24 | AT-04, AT-05, AT-06 |
| REQ-STATS-03 review rounds by document type | §3.1 step 5; §4.2 | BR-05, BR-06, BR-07, BR-08, BR-09 | AT-07, AT-08, AT-09, AT-10, AT-25 |
| REQ-STATS-04 DoD-round count | §3.1 step 6; §4.2 | BR-10, BR-11 | AT-11, AT-12, AT-28 |
| REQ-STATS-05 halts by phase and resolution | §3.1 step 7; §4.2 | BR-12, BR-13 | AT-13, AT-14, AT-14b |
| REQ-STATS-06 process-to-spec byte ratio | §3.1 step 8; §4.2 | BR-14, BR-15, BR-16 | AT-15, AT-16, AT-17 |
| REQ-STATS-07 fleet mode, gaps explicit | §3.2 Flow B | BR-18, BR-23, BR-25, BR-26, BR-27 | AT-18, AT-19, AT-20, AT-26, AT-27 |
| REQ-STATS-08 read-only, no network, no git writes | §3.4; §4.5 | BR-28, BR-29 | AT-21, AT-22 |
| REQ-STATS-09 unknown feature reported | §3.1 step 3; §5 EC-01 | BR-04, BR-30 | AT-23, AT-24, AT-27 (root leg, per D-9) |

### 2.2 Constraint coverage

| REQ constraint | Where honored |
|---|---|
| C-1 read-only surface | BR-28, BR-29; AT-21, AT-22 |
| C-2 feature-directory discovery, never summed | BR-02; AT-02, EC-02 |
| C-3 spec-document set, fixed | BR-14 (spec side enumeration) |
| C-4 process-artifact set, fixed | BR-14 (process side enumeration) |
| C-5 parsing fidelity, no independent rules | BR-05, BR-06, BR-10, BR-12; §1 fidelity anchor |

### 2.3 Goal coverage

| REQ goal | Where honored |
|---|---|
| G-1 single-feature stats | §3.1, BR-01 |
| G-2 machine-readable mode | §3.3, BR-20 |
| G-3 fleet mode with explicit gaps | §3.2, BR-25, BR-27 |
| G-4 read-only, always | §3.4, BR-28 |

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
| A2 | Resolve the repository root and the `docs/` root (BR-01's `--cwd`). | Is the `docs/` root readable? | No → EC-09: the refusal renders through Flow C, exit 1. Yes → A3. |
| A3 | Resolve the feature's artifact directory. | Does `docs/{feature}/` exist? | Yes → use it, do not look further (BR-02). No → does `docs/completed/{feature}/` exist? Yes → use it. No → EC-01 not-found: the refusal renders through Flow C, exit 1. |
| A4 | List the artifact files directly in the resolved directory (BR-03: no subdirectory traversal). | — | A5. |
| A5 | Compute review rounds per document type (BR-05…BR-09). | Per document type: any well-formed cross-review? a round-1 collision? a `LEARNINGS-{feature}.md` present? | A number, `unmeasurable`, `harvested`, or `0`. Malformed basenames accumulate separately (BR-06). |
| A6 | Compute the DoD-round count (BR-10, BR-11). | Any `CODE_REVIEW-{feature}-v{N}.md` file present? | Highest version found, `harvested`, or `0`. |
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
| B2 | Read the `docs/` root. | Readable? | No → EC-09: the refusal renders through Flow C, exit 1 (the one non-zero exit fleet mode has). Yes → B3. |
| B3 | Discover candidate features: immediate **directories** under `docs/`, minus BR-25's exclusion set; plus the immediate directories under `docs/completed/`. | Is this entry a directory? Is its name in the exclusion set? | Loose files at either root are never candidates (BR-25). |
| B4 | Assert the exclusion set is set-equal to the non-feature directories actually present at the `docs/` root. | Equal? | No → EC-10: the report still prints, and the unexpected directory is reported as an unclassified entry rather than silently joining or silently vanishing. |
| B5 | For each candidate, run A4–A8. | Could the directory not be **read** (permissions, or it is not a readable directory)? | Yes → a gap row naming the feature and the reason (BR-27). No → a normal row, including for a directory that is readable and empty (EC-03: emptiness is a measurable state, not a gap). |
| B6 | Render (Flow C) and exit 0. | — | Gap rows are rows, not failures: fleet mode exits 0 whenever it produced its report (BR-27). |

A feature that appears under both `docs/` and `docs/completed/` is reported **once**, from
`docs/{feature}/`, per BR-02 — never summed and never listed twice.

### 3.3 Flow C — rendering fork

| Step | Action | Decision point | Outcome |
|---|---|---|---|
| C1 | Choose a mode. | Was `--json` supplied? | Yes → C3. No → C2. |
| C2 | Human mode: render §4.3's table(s) to stdout. | Single feature or fleet? | One feature block, or one row per feature plus the gap rows. |
| C3 | JSON mode: serialize §4.4's document to stdout. | Single feature, fleet, or a refusal? | The 5-key single-feature document, the 3-key fleet document, or — on the not-found, `docs/`-root and single-feature unreadable-feature paths — BR-30's 3-key error object. A refusal reaches this step: BR-20 leaves stdout empty on the usage-error path alone. |
| C4 | Emit. | Is there any diagnostic to say? | Diagnostics go to stderr in **both** modes; in JSON mode stdout carries the JSON document and nothing else (BR-20). |

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

### 4.1 Command surface

**BR-01 (surface and closed flag set).** The command is `pdlc stats [feature] [--json] [--cwd <path>]`.
It takes at most one positional argument. `--json` is a boolean flag; `--cwd` is a value flag naming
the repository to report on, defaulting to the process working directory. Any other flag is a usage
error, and a value flag with no value is a usage error — the same closed-flag-surface behavior the
existing commands have (`FLAGS_BY_COMMAND` / `validateFlags`, `pdlc/engine/bin/cli.mjs`), so
`pdlc stats --dry-run` is refused rather than ignored. A second positional is a usage error: two
feature names have no defined meaning, and silently taking the first would report on a feature the
operator did not ask about. `stats` takes the closed-flag *mechanism* the existing commands use, not
their flag *lists*: it deliberately does not join the `--plugin-root` / `--allow-api-key-billing`
common set those commands carry, because neither has meaning for a read-only report, so
`pdlc stats foo --dev` is a usage error even though `pdlc doctor --dev` is not.

**BR-02 (directory resolution, preference not union).** A feature's artifact directory is
`docs/{feature}/` when that directory exists, otherwise `docs/completed/{feature}/`. The two are
never summed and never both scanned for one feature. When `docs/{feature}/` exists the archived copy
is not consulted at all, even if it holds artifacts the live directory lacks — a mid-archival tree
reports the live location's truth, not a merge of two snapshots (REQ C-2, REQ R-2).

**BR-03 (scan depth: the directory itself, not its subtree).** Only files directly in the resolved
directory are considered. Subdirectories are not traversed. This is load-bearing rather than
incidental: feature directories in this repository do carry subdirectories — `docs/completed/pdlc-loop-economics/_evidence/`
is one — and a recursive scan would fold evidence files into the byte ratio's numerator or
denominator depending on their names.

**BR-04 (the feature argument is a literal directory basename).** The argument is matched exactly
against directory names, with no fuzzy, prefix or case-insensitive matching (REQ A-1). A name that
matches no directory under either root is not-found (BR-30), never a near-miss suggestion that the
command then reports on.

### 4.2 Metric rules

**BR-05 (review rounds: highest index across roles, one number per document type).** For a document
type, the reported round count is the highest round index present on disk for that type, taken
across every role. A type whose test-engineer review reached round 5 and whose product-manager
review reached round 3 reports `5` — not `8`, not a per-role breakdown, not a range. The
un-suffixed basename form `CROSS-REVIEW-{role}-{DOCTYPE}.md` denotes round 1, identically to
`-v1.md`; that equivalence is the driver's (REQ C-5), and it matters because historical branches in
this repository carry the un-suffixed form. As in BR-10, the near-miss is named so an implementer
does not rediscover it: the driver's round-window derivation answers "which round runs next" and so
returns highest-plus-one, and `1` for a type with no files at all; this metric reports the highest
round **present**, so a never-reviewed document type reads `0` or `harvested` (BR-08), never `1`.

**BR-06 (malformed cross-reviews are excluded and reported, never folded in).** A basename that
begins `CROSS-REVIEW-` but fails the grammar is excluded from every round count and reported
separately as malformed, naming the basename. Whether a given basename fails is the driver's
classification, not a rule this document restates. A file that does not claim the `CROSS-REVIEW-`
prefix — the feature's own REQ, LEARNINGS, POSTMORTEM, a `HANDOFF-PROMPT.md`, a
`MUTATION-EVIDENCE-*.md` — is neither counted nor called malformed; it is simply not a cross-review
(REQ R-1).

Grammatical-but-out-of-catalogue basenames are included in "fails the grammar", and one of them
occurs in this repository today: Phase CR writes `CROSS-REVIEW-{role}-REVIEW-v{N}.md` when its
target has no document type, and the driver's own basename parse rejects that doc type as outside
its six-type catalogue. Four such files sit in `docs/completed/pdlc-advisory-wave-gate/`. They are
reported as malformed, by name, and contribute to no row — the driver's classification of those
bytes, taken unchanged (REQ C-5), and REQ-STATS-03's disposition for it applied literally. That a
pipeline-authored artifact lands in a list an operator reads as "malformed" is the upstream
criterion's decision, not a divergence introduced here: REQ-STATS-03 names those basenames and
settles the label, one label standing because a third bucket would be an independent rule C-5
forbids (§7.3 E-3). AT-09 pins the disposition on that real directory.

**BR-07 (unmeasurable).** Where the artifact convention refuses a round for a document type — one
role carrying two files that both claim round 1 — that document type reports `unmeasurable` and
names the colliding role. `unmeasurable` is not `0` and not an error: the rest of the report is
computed and printed normally, and the command still exits 0.

**BR-08 (zero versus harvested, per document type).** A document type with no cross-review file on
disk reports `0` when no `LEARNINGS-{feature}.md` is present, and `harvested` when one is. The test
is applied **per document type, not per feature**: a partially harvested directory reports
`harvested` for the types whose files are gone and a measured index for the types whose files
survive, in the same table. Harvested is distinct from a measured `0` because harvest deleted the
evidence (REQ NG-6); collapsing them would make an archive of harvested features read as an archive
of unreviewed ones, which is exactly the baseline REQ R-6 protects.

**BR-09 (row set and order).** The review-rounds metric always carries one row per document type in
the pipeline's cross-review doc-type catalogue — `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`,
`DECISIONS` — in that order, in both modes. That catalogue is the closed set the driver *validates a
cross-review basename against*, which is what makes a row's round index the driver's own; it is not
the set of spellings the pipeline can *write* (BR-06's `REVIEW` case). A fixed row set is what makes `harvested` and `0`
expressible at all: a row set derived from the files present could not report a type whose files
were deleted. Ordering is fixed so two runs over an unchanged tree produce byte-identical output.

**BR-10 (DoD rounds: highest version, deliberately not a count and not the next index).** The
reported value is the highest version `N` among the feature's `CODE_REVIEW-{feature}-v{N}.md`
files, or `0` when none is present. Two near-misses are ruled out explicitly. It is **not a file
count**, because harvest deletes DoD reviews and a count would understate a partially harvested
feature (REQ NG-6). And it is **not the next round index**: the pipeline's own derivation answers
"which DoD round runs next" and therefore returns highest-plus-one (`deriveDodRoundIndex`,
`pdlc/workflows/orchestrate-dev.js`), whereas this metric reports the last round that happened.
An implementation that reports the driver's return value unchanged is off by one on every feature,
including reporting `1` for a feature that never ran DoD.

**BR-11 (DoD harvested).** The DoD metric reports `harvested` when `LEARNINGS-{feature}.md` is
present **and** no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains
(REQ-STATS-04). Where any survives, the measured highest version wins — the harvested state never
displaces evidence this metric can actually read. The qualifier decides the leftovers: a basename
beginning `CODE_REVIEW-` that does not match — a `-draft` suffix, another feature's name —
contributes nothing to BR-10's value and counts as nothing remaining here, so it neither raises the
number nor suppresses `harvested`.

**BR-12 (halts: one entry per phase, resolution as the driver classifies it).** One entry is
reported per distinct phase that has a `POSTMORTEM-{phase}-{feature}.md` file, each tagged
`resolved` or `open` exactly as the pipeline's `RESOLVED:` marker rule classifies that file. This
document states no marker-matching rule: case, duplicate markers and fenced-block placement are
decided in one place (REQ C-5), and an unreadable or absent marker classifies as `open`, because
that is what the driver's fail-closed reading yields.

Which files are post-mortems **is** this command's own match, carved out of C-5 by the constraint
itself: the driver constructs the path from a phase it already knows and never parses a listing, so
there is no classification to inherit (§7.3 E-2). The match is the artifact convention's documented
form — a basename `POSTMORTEM-{phase}-{feature}.md` whose `{feature}` is exactly the feature being
reported, its `{phase}` the segment between. The phase is taken as it appears; this command holds no
catalogue of valid phase ids and rejects none (the driver's force-phase token list omits `I`, yet
`POSTMORTEM-I-pdlc-headless-engine.md` exists on disk). Because that form admits at most one file
per phase per feature, a phase never carries two conflicting entries.

**BR-13 (no halts is zero halts).** A feature with no post-mortem file reports an empty halt set —
never an error, never a missing metric, never a gap row. Halt entries are ordered
lexicographically by phase identifier, ascending — stated because the phase ids on disk include a
two-character id (`PR`) whose position depends on the choice, and BR-13's stability claim is
checkable only once the collation is named.

**BR-14 (ratio: which files are on each side).** The **spec** side is the byte total of whichever of
`REQ-{feature}.md`, `FSPEC-{feature}.md`, `TSPEC-{feature}.md`, `PLAN-{feature}.md`,
`PROPERTIES-{feature}.md`, `DECISIONS-{feature}.md` are present. The **process** side is the byte
total of every file matching the cross-review, post-mortem and DoD-review basename grammars:
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, `POSTMORTEM-{phase}-{feature}.md`,
`CODE_REVIEW-{feature}-v{N}.md`. Both sets are fixed by the REQ and are not operator-configurable
(REQ C-3, C-4); no configuration key widens or narrows either side. Files present in the directory
but on neither list — `LEARNINGS-*.md`, `HANDOFF-PROMPT.md`, `MUTATION-EVIDENCE-*.md`, anything
else — contribute to neither side. Bytes are file sizes on disk, not character counts.

**BR-15 (rendering and the zero denominator).** The ratio is process bytes divided by spec bytes,
rendered to **two decimal places** in both modes' human-facing form; in JSON it is a number rounded
to the same two decimal places, so the two modes never disagree on a displayed value. When the spec
total is zero — legitimately reachable mid-authoring (REQ R-4) — the ratio is reported as the token
`n/a`, never a division by zero, an infinity, or a crash.

**BR-16 (ratio harvested, and its precedence).** The ratio reports `harvested` when
`LEARNINGS-{feature}.md` is present **and at least one of the two harvest-deleted process families
is entirely absent** — that is, either no file matching BR-14's
`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar remains, or no file matching its
`CODE_REVIEW-{feature}-v{N}.md` grammar remains, or neither (REQ-STATS-06). It is evaluated over
exactly the file set BR-14's numerator sums, so the two never disagree: a basename failing a grammar
contributes no bytes to the process side and counts as no file remaining. A directory whose only
`CROSS-REVIEW-` basenames are the out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` files BR-06 reports as malformed reports `harvested`, not a
measured ratio. That basename shape is cited from `docs/completed/pdlc-advisory-wave-gate/`, which
carries four of them **alongside** grammar-matching cross-reviews and so reports a measured ratio
itself; only the shape is borrowed, not the verdict. A
stray `CODE_REVIEW-{feature}-draft.md` or foreign `CODE_REVIEW-` file does not hold the DoD family
open. Post-mortems survive harvest while cross-reviews and DoD reviews do not, so a
numerator computed over a partially deleted process set would silently undercount rather than be
visibly absent. This test is evaluated **before** BR-15's zero-denominator test: a harvested feature
whose spec documents are also gone reports `harvested`, not `n/a`, because the more specific
explanation is the true one.

### 4.3 Human-readable rendering

**BR-17 (single-feature layout).** Human mode prints one block per feature: a header naming the
feature and the artifact directory it was read from (so BR-02's preference is visible, not
inferred), then the four metrics in REQ-STATS-01's order — review rounds, DoD rounds, halts, byte
ratio. Review rounds render as a two-column table, document type and value, one row per BR-09
document type in catalogue order. Malformed basenames render as a labelled list under that table,
omitted entirely when there are none. Halts render as a two-column table, phase and resolution,
replaced by an explicit "none" line when the halt set is empty — a blank region would be
indistinguishable from a metric that failed to render. The ratio line carries the rendered value
and, in parentheses, the two byte totals it came from, so an operator can sanity-check a surprising
ratio without re-deriving it.

```
Feature: pdlc-loop-economics   (docs/completed/pdlc-loop-economics)

Review rounds
  REQ           3
  FSPEC         harvested
  TSPEC         unmeasurable (colliding role: test-engineer)
  PLAN          harvested
  PROPERTIES    harvested
  DECISIONS     harvested
  malformed: CROSS-REVIEW-pm-REQ-v01.md

DoD rounds      2
Halts           none
Byte ratio      1.42  (process 123456 B / spec 87000 B)
```

The block above is illustrative of layout and token spelling, not a fixture: the numbers are not a
measurement of that directory.

**BR-18 (fleet layout).** Fleet mode prints one row per feature: the feature name, one column per
BR-09 document type, then DoD rounds, halts, the ratio, and a malformed count. Two reductions
against the single-feature block are deliberate and are the only ones (D-7): the malformed
*basenames* become a count, because a fleet row cannot carry a list, and the halt entries render as
`{n} ({r} resolved)` rather than one line per phase. Both preserve the signal an operator scans for
— that a round count is wrong rather than merely absent, and that a halt is still open — and neither
drops a metric. Unclassified entries (BR-26) print in the same list, in the same order, marked as
such in place of the metric columns, exactly as gap rows do. Features are ordered
lexicographically by name so two runs over an unchanged tree agree byte for byte. Gap features are
printed in the same list, in the same order, with the reason in place of the metric columns and a
visible marker — never in a separate section an operator could skim past, and never omitted
(REQ-STATS-07).

**BR-19 (the tokens are fixed).** The non-numeric states render as exactly `harvested` and
`unmeasurable` in both modes, in every metric. The zero-denominator state is the one token that
differs by mode: `n/a` in human mode, `unavailable` as the JSON `state` value (BR-22), because the
human token is an abbreviation no JSON consumer should have to special-case. No other state has a
mode-specific spelling. Fixing the spellings here is what lets a consumer and a test agree on them
without either re-deriving the vocabulary; REQ O-1 assigns that choice to this document.

### 4.4 JSON rendering

**BR-20 (stdout carries the document and nothing else).** In `--json` mode stdout is exactly one
well-formed JSON document on **every** path but one: a report and every BR-30 refusal —
not-found, `docs/`-root failure, unreadable feature (EC-11, D-10) — all emit one. The single
exception is a usage error, where stdout is empty (EC-08, BR-01): the command has not accepted the invocation, so
there is nothing it could be a report *of*, and a caller that mis-spelled a flag learns it from exit
1 and stderr rather than from a document body. The rule is stated as always-but-one rather than
path-by-path because the enumeration is what rots: a failure path added later with no stdout
decision silently breaks the guarantee this rule exists to give. Progress notes, warnings and error
text go to stderr in both modes, so a caller can parse stdout unconditionally on any path it did not
itself mis-invoke. The human table never appears in JSON mode, and the JSON
document never appears in human mode.

**BR-21 (single-feature top-level key set).** The single-feature JSON document has exactly five
top-level keys: `schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio` — REQ-STATS-01's
four printed metrics plus one schema-version field, set-equal and no longer. A metric added to
human mode without a JSON field breaks this equality, which is the point (REQ R-5). The feature name
is not echoed as a top-level key: the caller supplied it, and adding it would break set-equality
with the printed metric set.

**BR-22 (states ride inside their metric's value).** `harvested`, `unmeasurable`, `n/a` and the
malformed list are all carried **within** the value of the metric they belong to — never as sibling
top-level keys, which would widen the schema silently as states are added. Each metric that can hold
a non-numeric state — `reviewRounds` per document type, `dodRounds`, `byteRatio` — has an object
value carrying a `state` field alongside its measurement. `halts` is the exception and needs no
state: BR-13 makes emptiness expressible as the empty array, so its value is an array of per-phase
entries, as the example below renders it.

```json
{
  "schemaVersion": 1,
  "reviewRounds": {
    "byDocType": {
      "REQ":        { "state": "measured",     "rounds": 3,    "collidingRole": null },
      "FSPEC":      { "state": "harvested",    "rounds": null, "collidingRole": null },
      "TSPEC":      { "state": "unmeasurable", "rounds": null, "collidingRole": "test-engineer" }
    },
    "malformed": ["CROSS-REVIEW-pm-REQ-v01.md"]
  },
  "dodRounds":  { "state": "measured", "rounds": 2 },
  "halts":      [ { "phase": "PR", "resolution": "open" } ],
  "byteRatio":  { "state": "measured", "ratio": 1.42, "processBytes": 123456, "specBytes": 87000 }
}
```

`byDocType` always carries all six BR-09 document types. `rounds` is `null` in every non-`measured`
state and `collidingRole` is `null` outside `unmeasurable`, rather than the key being absent: a
consumer reads a fixed shape and distinguishes states by the `state` field alone. `state` for
`byteRatio` is one of `measured`, `harvested`, `unavailable` — `unavailable` being the JSON form of
the `n/a` token, with `ratio` `null`; `processBytes` and `specBytes` are still reported in the
`unavailable` state, since they are what explains it.

**BR-23 (fleet document, and the gap discriminant).** The fleet JSON document has exactly three
top-level keys: `schemaVersion`, `features` and `unclassified`. `unclassified` is an array of
directory names — BR-26's entries, empty when there are none. It is a sibling of `features` rather
than an entry inside it precisely because an unclassified directory is *not* a discovered feature:
giving it a `features` entry would assert the thing BR-26 exists to deny. `features` maps each discovered feature name to
either the four-metric object (BR-21's document minus its hoisted `schemaVersion`) or, for a gap
feature, an object whose single key is `gap`, a string naming the reason. Key presence is the
discriminant, so a consumer never has to distinguish a gap by a sentinel value inside a metric.

**BR-24 (schema version).** `schemaVersion` is an integer, `1` at first release. It increments when
a released field is removed or its meaning changes; adding a field to a metric's value does not
increment it. Its presence is one of REQ R-5's two observable stability guarantees.

### 4.5 Discovery, exits and the read-only stance

**BR-25 (fleet discovery: directories only, fixed exclusion set).** Discovery considers immediate
**directories** only. A loose file at either root is never a feature, whatever its basename claims:
`docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/completed/REQ-completed.md` and
`docs/completed/QUEUE-HISTORY-rows-0-1.md` are all present here and none is a feature.
The excluded directory names, fixed by REQ-STATS-07 and not configurable, are `_queue`,
`_constraints`, `_decisions`, `design`, `requirements`, `ideas`, `discarded` and `completed`.
`completed` is excluded **as a feature** and traversed **as a container**: its children are
discovered, it is never itself reported. That is what stops the archive marker
`docs/completed/REQ-completed.md` presenting a phantom feature named `completed`.

**BR-26 (the exclusion set is asserted, not assumed).** The exclusion set is checked set-equal
against the non-feature directories present at the `docs/` root. A directory added later that
belongs on neither list surfaces as an unclassified entry in the report rather than silently
joining the feature list with meaningless metrics or silently vanishing from it.

**BR-27 (gap rows are rows).** A feature whose directory **cannot be read** is reported
by name with a reason. Missing artifacts are not a gap: a readable but empty directory is a normal
row whose every metric reports its zero state (EC-03), because emptiness is a measurement and a gap
row is the admission that no measurement was possible. This is REQ-STATS-07's own wording: the criterion
states that a readable but empty directory "is not a gap but a normal row whose metrics report their
zero states", and reserves the gap branch for a directory that cannot be read. Nothing the criterion
protects is lost — no feature is omitted, which is what it forbids (§7.3 E-5). A gap row does not
affect the exit code. Fleet mode exits 0 whenever it produced its
report; the only non-zero fleet exit is failure to read the `docs/` root itself.

**BR-28 (read-only, on every path).** No filesystem write, no deletion, no directory creation, no
temporary file anywhere, no network request, and no `git` write command (`commit`, `push`, `add`,
`checkout`, or similar) on any path, including error paths. Read-only `git` inspection is permitted
but is not required by any rule here: every metric derives from the working tree as it stands.

**BR-29 (exit codes).** `0` — the report was produced, including a report containing gap rows,
malformed entries or non-numeric states. `1` — the command refused or could not report: usage error,
unknown feature, missing or unreadable `docs/` root, unreadable feature directory in single-feature
mode. `2` is never emitted: the existing CLI reserves it for a
pipeline halt (`pdlc/engine/bin/cli.mjs`, exit-code header), and a reporting command has no halt to
signal.

**BR-30 (refusals are reported in both modes, under one error shape).** An unknown feature exits 1
and says so by name; so does a `docs/`-root failure (EC-09). In human mode that is a message on
stderr. In `--json` mode stdout carries a well-formed error object with exactly three top-level
keys — `schemaVersion`, `error`, `feature` — set-equal and no longer, never a truncated document and
never a partial success document with empty metrics. `error` is an object with exactly `reason` and
`message`; `reason` is one of `not_found`, `no_docs_root` and `unreadable_feature`
(EC-11's single-feature path, D-10). `feature` is the name the caller supplied, `null` where none was (a fleet-mode root failure). Two things follow, and both are the
point: a caller can tell "this feature does not exist" from "there is no `docs/` root here" without
parsing prose, and can tell both from "this feature has no artifacts" — which is a *success*
document with zero states, not an error. `schemaVersion` is hoisted exactly as BR-21 hoists it, so a
consumer reads the version before it branches on shape; the error object is a released shape under
REQ R-5 and BR-24's increment rule governs it as it governs the success document.

## 5. Edge Cases and Error Scenarios

Every row states an observable outcome and an exit code. No row's outcome is "undefined" or
"implementation's choice": an edge case with no decided behavior is a defect generator, and the
non-numeric states exist precisely so that none of these has to be a crash.

| ID | Situation | Behavior | Exit |
|---|---|---|---|
| EC-01 | Feature argument matches no directory under `docs/{feature}/` or `docs/completed/{feature}/`, including a repository with no `docs/completed/` at all. | Reported by name as not found. Human mode: message on stderr. JSON mode: BR-30's error object on stdout with `reason` `not_found` — never a partial success document. | 1 |
| EC-02 | The feature exists under **both** `docs/{feature}/` and `docs/completed/{feature}/`, mid-archival. | Reported once, from `docs/{feature}/`. The archived copy is not read (BR-02). The header names the directory used, so the operator can see which snapshot the numbers came from. | 0 |
| EC-03 | Feature directory exists but is empty. | Every metric reports its zero state: all six review-round rows `0`, DoD `0`, halts none, ratio `n/a` (spec bytes are zero). Not a gap and not an error — an empty directory is a real, reportable state. | 0 |
| EC-04 | Feature directory contains a subdirectory (for example `_evidence/`). | Ignored entirely; no file inside it contributes to any metric (BR-03). | 0 |
| EC-05 | A basename begins `CROSS-REVIEW-` but fails the grammar (`-v0`, `-v01`, an unknown role, trailing junk, **or a document type outside BR-09's six** — including the pipeline's own `CROSS-REVIEW-{role}-REVIEW-v{N}.md`, BR-06). | Excluded from every round count, listed as malformed under the review-rounds metric, naming the basename (BR-06). The rest of the report is unaffected. | 0 |
| EC-06 | One role has two files claiming round 1 for the same document type (the un-suffixed form and `-v1` together). | That document type reports `unmeasurable`, naming the colliding role. Other document types in the same feature still report their measured values (BR-07). | 0 |
| EC-07 | `LEARNINGS-{feature}.md` present, some cross-reviews deleted and others surviving (an interrupted or partial harvest). | Per-document-type split: `harvested` for the types with no file, a measured index for the types with one (BR-08). The DoD metric and the ratio are evaluated on their own evidence, independently (BR-11, BR-16). | 0 |
| EC-08 | An unknown flag, or a value flag with no value, or a second positional argument. | Usage error naming the offending token on stderr. Nothing on stdout in either mode — a JSON-mode caller must not receive half a document (BR-01). | 1 |
| EC-09 | The `docs/` root is missing or unreadable. | Reported as such on stderr, in both modes and in both conditions — one message, naming the root and whether it was absent or unreadable. In `--json` mode stdout additionally carries BR-30's error object with `reason` `no_docs_root`. This is fleet mode's only non-zero exit (BR-27). Single-feature mode does **not** re-spell a merely-absent root as EC-01's not-found: the operator asked about a feature, and "there is no `docs/` root here" is the true and more useful answer. REQ-STATS-09's *Given* agrees: it scopes itself to a repository whose `docs/` root is present and readable, and names a missing or unreadable root a root failure rather than its own case. D-9 records the reasoning (§7.3 E-4). | 1 |
| EC-10 | A directory appears at the `docs/` root that is in neither the exclusion set nor recognizable as a feature. | The report still prints, and the directory is reported as an unclassified entry naming it (BR-26): in human mode a marked row in the feature list (BR-18), in JSON mode a member of the top-level `unclassified` array (BR-23). It is neither silently excluded nor silently counted as a feature. | 0 |
| EC-11 | A feature directory exists but cannot be read (permissions). | Fleet mode: a gap row naming the feature and the reason (BR-27), exit unchanged. Single-feature mode: reported on stderr, exit 1 — a caller that asked about one feature gets no report rather than one with a silently missing metric; under `--json` stdout carries BR-30's error object, `reason` `unreadable_feature` (D-10). | 0 / 1 |
| EC-12 | Spec-side byte total is zero while process-side files exist (mid-authoring, or a harvested tree with the spec documents archived elsewhere). | Ratio is `n/a` (JSON `unavailable`), with both byte totals still reported (BR-15). Never a division by zero, an infinity or `NaN`. | 0 |
| EC-13 | `LEARNINGS-{feature}.md` present **and** spec bytes are zero. | `harvested`, not `n/a`: BR-16's test is evaluated first, because it is the more specific explanation of the same absence. | 0 |
| EC-14 | A post-mortem file whose `RESOLVED:` marker is absent, duplicated, or unparseable. | The halt is tagged `open`, matching the driver's fail-closed reading (BR-12). Not an error and not a malformed entry: this command never adjudicates a marker. | 0 |
| EC-15 | A `POSTMORTEM-` file whose basename does not match `POSTMORTEM-{phase}-{feature}.md` (for example a post-mortem carrying another feature's name). | Contributes no halt entry, exactly as an unrelated file. Halts have no malformed bucket — REQ-STATS-05 defines none, so a basename that does not match BR-12's form is simply not this feature's post-mortem, exactly as an unrelated file is not. | 0 |
| EC-16 | A `CODE_REVIEW-` basename that does not match the version grammar. | Contributes nothing, exactly as an unrelated file, and is **not** reported as malformed: the driver draws no malformed distinction on the DoD side, so neither does this command (REQ-STATS-04, REQ C-5). The asymmetry against EC-05 is deliberate. | 0 |
| EC-17 | A feature directory holding artifacts but no `REQ-{feature}.md` (this repository has one: `docs/pdlc-halt-hardening/` carries only a PLAN). | Reported as a normal feature with whatever metrics its files support — a missing REQ is not a discovery criterion. Its spec-side total simply omits the absent documents. | 0 |
| EC-18 | Two features whose names differ only in case, on a case-insensitive filesystem. | Whatever the filesystem presents as distinct directory entries are distinct features; the command performs no case folding of its own (BR-04). Ordering stays lexicographic and therefore stable. | 0 |
| EC-19 | A file in the feature directory that is a symbolic link. | Its byte size is the size of the **link itself**, not of its target — the size a non-dereferencing stat reports — so the two sides of the ratio total what the feature directory occupies rather than what it points at, and a link into a large document cannot inflate a side by orders of magnitude. Links are not followed outside the feature directory to gather additional files, because discovery is by directory listing (BR-03), not by traversal. | 0 |
| EC-20 | Fleet mode over a repository with `docs/` present but containing only excluded directories. | An empty report — a header and no feature rows — and exit 0. Empty is a valid measurement; the operator sees that the query ran. | 0 |
| EC-21 | Any unexpected failure while computing one feature's metrics in fleet mode. | Degrades to that feature's gap row; the remaining features are still reported (BR-27). One unreadable feature never suppresses the fleet report. | 0 |

## 6. Acceptance Tests

Each test names Who / Given / When / Then. Fixtures are constructed artifact directories unless a
test names a real path in this repository; where it does, the named path is what makes the
expectation checkable against a tree that already exists. A real-path test states its expectation as
a **literal**, never as "whatever the mechanism derives" — an expectation computed by the code under
test agrees with a wrong implementation. Those literals are measurements of the archive as it stands
and are permitted to be re-measured when the archive changes; what is not permitted is replacing the
literal with a derivation to avoid re-measuring it.

### 6.1 Single-feature reporting

**AT-01 — the four metrics print.**
*Who:* pipeline operator. *Given:* a feature directory holding cross-reviews, `CODE_REVIEW` files
and a post-mortem. *When:* `pdlc stats {feature}`. *Then:* stdout carries one block naming the
feature and the directory it was read from, followed by review rounds (six document-type rows in
catalogue order), DoD rounds, halts, and the byte ratio, in that order; exit 0.

**AT-02 — the live directory wins over the archive.**
*Who:* pipeline operator. *Given:* the same feature name exists under both `docs/{feature}/` and
`docs/completed/{feature}/`, with different artifacts in each. *When:* `pdlc stats {feature}`.
*Then:* the report is byte-identical to the report for the same tree with
`docs/completed/{feature}/` absent, and the header names `docs/{feature}/` (EC-02). Byte-identity is
the assertion, not a negative probe: the likeliest way BR-02 is violated is a merged read that
deduplicates by basename, which no "the total is not the sum" check would catch.

**AT-03 — a subdirectory contributes nothing.**
*Who:* pipeline operator. *Given:* a feature directory containing a subdirectory whose files carry
artifact-shaped names. *When:* `pdlc stats {feature}`. *Then:* the report is byte-identical to the
report for the same directory with that subdirectory absent (EC-04).

### 6.2 JSON mode

**AT-04 — stdout is exactly one JSON document.**
*Who:* automated caller. *Given:* any reportable feature. *When:* `pdlc stats {feature} --json`.
*Then:* stdout parses as a single JSON document with no surrounding text; any diagnostic output
appeared on stderr; exit 0.

**AT-05 — top-level key set is set-equal to the printed metric set plus the schema version.**
*Who:* automated caller. *Given:* a feature whose report exercises a malformed basename and at least
one non-numeric state. *When:* `pdlc stats {feature} --json`. *Then:* the top-level keys are exactly
`schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio` — five, no more — and the
malformed list and the `harvested` / `unmeasurable` states appear **inside** their own metric's
value, not as additional top-level keys (BR-21, BR-22).

**AT-06 — human and JSON agree metric for metric.**
*Who:* automated caller. *Given:* the same feature. *When:* both modes are run over an unchanged
tree. *Then:* every value shown in the human table is recoverable from the JSON document, and the
ratio's two-decimal rendering matches the JSON number (BR-15); a metric present in one mode and
absent from the other fails this test. *And:* the same comparison over a **fleet** run, where the
row is permitted to differ from the JSON entry in exactly the two ways D-7 records — malformed
basenames as a count rather than a list, halts as `{n} ({r} resolved)` rather than per-phase entries
— and in no other way: every remaining field is recoverable from the row, and the JSON document's
`unclassified` array is set-equal to the marked rows.

### 6.3 Review rounds

**AT-07 — highest index across roles, not a sum and not per role.**
*Who:* pipeline operator. *Given:* a document type with a test-engineer cross-review at round 5 and
a product-manager cross-review at round 3. *When:* the report is produced. *Then:* that row reads
`5`; no `8` and no per-role breakdown appear anywhere in either mode (BR-05).

**AT-08 — the un-suffixed form is round 1.**
*Who:* pipeline operator. *Given:* a document type whose only cross-review is
`CROSS-REVIEW-{role}-{DOCTYPE}.md`, with no `-v` suffix. *When:* the report is produced. *Then:*
that row reads `1`, not `0` (BR-05).

**AT-09 — malformed is excluded and named; a non-cross-review is neither.**
*Who:* pipeline operator. *Given:* a directory containing one grammatical cross-review, one
`CROSS-REVIEW-`-prefixed basename that fails the grammar, and unrelated artifacts
(`LEARNINGS-*.md`, `HANDOFF-PROMPT.md`). *When:* the report is produced. *Then:* the round count
reflects only the grammatical file; the failing basename is listed as malformed by name; and no
unrelated artifact appears in the malformed list (BR-06, EC-05). *And:* over
`docs/completed/pdlc-advisory-wave-gate/`, whose files include
`CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` written by the pipeline's own
Phase CR, all four basenames appear in the malformed list by name, no row of the six-type table
counts them, and the `TSPEC` row still reads `6` — the highest index among that directory's
grammatical TSPEC cross-reviews.

**AT-10 — partial harvest splits per document type.**
*Who:* pipeline operator. *Given:* `docs/completed/pdlc-headless-engine/` — `LEARNINGS` present,
one surviving TSPEC cross-review, no cross-review for the other five types. *When:*
`pdlc stats pdlc-headless-engine`. *Then:* the TSPEC row reads exactly `13` — the surviving file is
`CROSS-REVIEW-software-engineer-TSPEC-v13.md` — and the other five rows read `harvested`; no row
reads `0` (BR-08, EC-07).

### 6.4 DoD rounds

**AT-11 — highest version, not the next round index and not a file count.**
*Who:* pipeline operator. *Given:* `docs/completed/pdlc-loop-economics/`, which carries
`CODE_REVIEW-pdlc-loop-economics-v1.md` and `-v2.md`. *When:* the report is produced. *Then:* DoD
rounds reads `2` — not `3` (the pipeline's next-round derivation) and not a count that would
disagree with the highest version on a partially harvested directory (BR-10).

**AT-12 — DoD harvested only when its own evidence is gone.**
*Who:* pipeline operator. *Given:* two directories, both with `LEARNINGS-{feature}.md`: one with a
surviving `CODE_REVIEW-{feature}-v4.md` and no other, one with none. *When:* both are reported.
*Then:* the first reads exactly `4` and the second reads `harvested`; neither reports `0` in place
of the other's state. A third directory, holding `LEARNINGS` plus only
`CODE_REVIEW-{feature}-draft.md` and another feature's `CODE_REVIEW-{other}-v2.md`, also reads
`harvested`: neither leftover matches the grammar, so neither is evidence (BR-11).

### 6.5 Halts

**AT-13 — one entry per phase, resolution as the driver classifies it.**
*Who:* pipeline operator. *Given:* `docs/completed/pdlc-wave-resume/` **copied into a temporary
root**, carrying `POSTMORTEM-PR-pdlc-wave-resume.md`, whose line-leading marker reads
`RESOLVED: yes`, with `POSTMORTEM-P-some-other-feature.md` added to the copy. The two extra files
are added to the copy and never to the repository: the `resolved` literal below is carried over from
the real bytes, and the real directory stays exactly as the other real-path tests (AT-09, AT-10,
AT-18) measure it. *When:* the
report is produced. *Then:* the halt set is exactly one entry, `{phase: "PR", resolution:
"resolved"}` — the literal, not a re-derivation; the foreign-feature basename contributes nothing
and appears in no list (EC-15). *And:* the companion fixture, the same file with
`RESOLVED: no`, yields `{phase: "PR", resolution: "open"}`. The pair is what makes the test
falsifying: an implementation that returns one classification for every input passes either half
alone and fails the two together (BR-12).

**AT-14 — no post-mortem is zero halts, and an unreadable marker is `open`.**
*Who:* pipeline operator. *Given:* one feature with no post-mortem file, and three whose
post-mortems carry a `RESOLVED:` marker that is respectively absent, duplicated, and unparseable.
*When:* all four are reported. *Then:* the first shows an explicit "none" (human) / empty array
(JSON) and exits 0; each of the other three shows that phase tagged `open` and exits 0. All three of
EC-14's conditions are asserted: absent is the one a naive implementation reads as `resolved`, the
opposite of the driver's fail-closed rule (BR-12, BR-13, EC-14).

**AT-14b — multiple halts render in BR-13's order, asserted as a literal sequence.**
*Who:* pipeline operator. *Given:* `docs/completed/pdlc-headless-engine/`, which carries
`POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md` — four post-mortems, four distinct phases. *When:*
the report is produced in both modes. *Then:* the halt entries are exactly four and their **sequence**
is the literal `D, F, I, T`, in that order, in the human table and in the JSON array alike. The
sequence is the assertion, not the set: BR-13's collation is this rule's only falsifiable content,
and an implementation ordering by directory-listing or insertion order passes any set-shaped oracle.
*And:* over a constructed fixture carrying phases `P` and `PR`, the rendered sequence is the literal
`P, PR` — the two-character identifier BR-13 names as the case whose position depends on the
collation, so the rule's stated reason for naming one is itself asserted (BR-13).

### 6.6 Byte ratio

**AT-15 — the ratio is process over spec, over the fixed sets.**
*Who:* pipeline operator. *Given:* a directory carrying **all six** BR-14 spec documents
(`REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS`) and **all three** process families
(a cross-review, a post-mortem, a `CODE_REVIEW`) — one process-side member being a symbolic link
whose target is far larger than the link — every one of the nine a distinct size, plus files
on neither list (`LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`, `SIZING-*.md`, and — the case that
separates the two sides of BR-16's agreement claim — a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file,
`CROSS-REVIEW-`-prefixed but outside BR-09's six document types). *When:* the report is
produced. *Then:* the two totals equal the literal sums of their members; adding a file on neither
list leaves both unchanged — including the out-of-catalogue cross-review, whose bytes reach neither
side, so an implementation that globs `CROSS-REVIEW-*` into the process total fails here (BR-14,
BR-16); **and** removing any one of the nine changes its side's total by exactly
that file's size. The link contributes its own size, not its target's (EC-19). The symbolic-link leg
is the one leg here permitted to be skipped where the filesystem cannot carry a link; the
enumeration and removal-probe legs are **not** skippable and run with a regular file in that
member's place, because AT-15 is the only test asserting BR-14's enumeration by removal and a
skipped platform must not take that probe with it. The removal probe is
what makes the assertion set-equality rather than containment
— without it, an implementation that omits `DECISIONS-{feature}.md` or the post-mortem family from
its enumeration still passes (BR-14).

**AT-16 — zero denominator is `n/a`, not a crash.**
*Who:* pipeline operator. *Given:* a directory with cross-reviews but no spec document. *When:* the
report is produced. *Then:* the ratio reads `n/a` (JSON `state: "unavailable"`, `ratio: null`), both
byte totals are still reported, and exit is 0 (BR-15, EC-12).

**AT-17 — harvested wins over `n/a`, and fires on either family's absence.**
*Who:* pipeline operator. *Given:* four directories, each with `LEARNINGS-{feature}.md`: one with
cross-reviews intact and no `CODE_REVIEW` file; one with `CODE_REVIEW` files intact and no
cross-review; one with neither and no spec documents either; and one holding `CODE_REVIEW` files
intact plus, as its only `CROSS-REVIEW-` basenames, the out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` form BR-16 names. *When:* all four are reported. *Then:* all four report `harvested` — the third not `n/a`,
the fourth not a measured ratio, because files whose bytes BR-14 refuses are equally files BR-16
does not count as remaining (BR-16, EC-13).

### 6.7 Fleet mode

**AT-18 — every feature directory is discovered, and only directories are.**
*Who:* pipeline operator. *Given:* this repository's `docs/`, which holds feature directories, the
eight excluded directories, and the loose file `docs/PLAN-pdlc-integration-boundary-gates.md`.
*When:* `pdlc stats`. *Then:* every feature directory under `docs/` and under `docs/completed/`
appears exactly once — including `docs/pdlc-halt-hardening/`, which carries only a PLAN and is a
row like any other (EC-17); no excluded directory appears as a feature; no phantom feature named
`completed` appears; and the loose file produces no row (BR-25). *And*, over two constructed roots:
one holding only excluded directories yields a header and no feature rows at exit 0 (EC-20); one
holding two directories whose names differ only in case yields two distinct rows, in lexicographic
order, with no case folding of its own (EC-18, BR-04).

**AT-19 — the exclusion set is asserted, not assumed.**
*Who:* pipeline operator. *Given:* a new directory at the `docs/` root that is neither in the
exclusion set nor a feature. *When:* `pdlc stats` and `pdlc stats --json`. *Then:* the human run
still prints its report and carries that directory as a marked row naming it (BR-18); the JSON run's
top-level keys are exactly `schemaVersion`, `features`, `unclassified` — three, no more — with
`unclassified` set-equal to `["{that directory}"]` and `features` carrying no key of that name. In
neither mode is it silently reported as a feature or silently dropped (BR-23, BR-26, EC-10).

**AT-20 — gap rows are rows, and one bad feature does not sink the fleet.**
*Who:* pipeline operator. *Given:* a fleet in which one feature directory cannot be read. *When:*
`pdlc stats`. *Then:* that feature appears as a named gap row with a reason, every other feature is
reported normally, and exit is 0 (BR-27). *And:* a second leg over a fleet in which one feature's
directory is readable but computing its metrics fails unexpectedly: that feature carries a gap row
with a reason, every other feature is reported normally, and exit is 0 (EC-21). B5's read failure
and EC-21's catch-all are different paths: only this leg fails an implementation whose guard is
around the read alone.

### 6.8 Read-only stance

**AT-21 — the tree is unchanged and the job was done, on the same invocation.**
*Who:* pipeline operator. *Given:* a snapshot of every path under the repository root except
`.git/`, recorded by path and modification time immediately before the run. *When:*
`pdlc stats {feature}` runs to completion. *Then:* a snapshot taken immediately after is set-equal
to the first **and** stdout carried the metric set and exit was 0. Both conjuncts are asserted
against the one invocation: a run that printed nothing would satisfy the first and fail this test
(REQ-STATS-08). The snapshot spans untracked paths deliberately — they must be unchanged too, since
BR-28 permits no write anywhere — and the comparison is between two snapshots of the same tree, not
against a fixed literal, so a developer machine carrying a tool cache is not a source of flake.

**AT-22 — read-only holds on the failure path too.**
*Who:* pipeline operator. *Given:* the same snapshot discipline. *When:* the command is run once
with an unknown feature and once with an unknown flag. *Then:* both leave the snapshot set-equal,
both exit 1, and both emitted their report or usage error; no network request was issued and no
`git` write command was run on either path (BR-28, BR-29).

### 6.9 Not found and usage

**AT-23 — unknown feature is reported by name in both modes.**
*Who:* pipeline operator, then an automated caller. *Given:* a feature name matching no directory
under either root, in a repository with no `docs/completed/` at all. *When:* `pdlc stats {feature}`
and `pdlc stats {feature} --json`. *Then:* both exit 1; the human run names the feature on stderr;
the JSON run's stdout parses and its top-level keys are exactly `schemaVersion`, `error`, `feature` —
three, no more — with `error.reason` exactly `not_found`, `error` carrying exactly `reason` and
`message`, and `feature` the name supplied. *And:* the same document compared against a real
feature with no artifacts (AT-26's empty directory) under `--json`: the two are distinguishable by
key set alone, not by inspecting a message string (BR-30, EC-01).

**AT-24 — the flag set is closed, and a usage error prints nothing to stdout.**
*Who:* automated caller. *Given:* `pdlc stats {feature} --dev`, `pdlc stats {feature} --plugin-root
{path}`, `pdlc stats {feature} --dry-run`, `pdlc stats {feature} --cwd` with no value, and
`pdlc stats a b`. *When:* each is run. *Then:* each exits 1 with a usage error on stderr naming the
offending token, and stdout is empty in every case — including under `--json`, so a caller never
parses half a document (BR-01, EC-08). `--dev` and `--plugin-root` are named deliberately: they are
the tokens BR-01 singles out as accepted elsewhere and refused here, and the likely implementation —
a `FLAGS_BY_COMMAND` row copied from a neighbour, `doctor`'s being
`["plugin-root","cwd","allow-api-key-billing","dev"]` — accepts both while still refusing
`--dry-run`, which `doctor`'s row does not carry. A test carrying only the never-anywhere token cannot
fail in the one way this rule exists to prevent.

### 6.10 States and edge cases

**AT-25 — a round-1 collision is `unmeasurable`, and only for its own row.**
*Who:* pipeline operator. *Given:* a directory where one role carries both
`CROSS-REVIEW-{role}-TSPEC.md` and `CROSS-REVIEW-{role}-TSPEC-v1.md`, and the other five document
types carry grammatical cross-reviews at these indices: `REQ` 3, `FSPEC` 2, `PLAN` 5, `PROPERTIES` 1,
`DECISIONS` 4. *When:* the report is produced in both modes. *Then:* the TSPEC row reads exactly
`unmeasurable` and names that role (JSON: `state: "unmeasurable"`, `rounds: null`, `collidingRole`
the role's slug); the other five rows read exactly `3`, `2`, `5`, `1`, `4` respectively; and exit is
0. The five are stated as literals, not as "unchanged", so the conjunct is a transcription rather
than a tautology and the real risk — one role's collision poisoning rows it does not belong to — can
fail the test (BR-07, BR-19, BR-22, EC-06).

**AT-26 — an empty feature directory is a measurement, not a gap.**
*Who:* pipeline operator. *Given:* a readable, empty `docs/{feature}/`. *When:* `pdlc stats
{feature}` and `pdlc stats` are both run. *Then:* all six review-round rows read `0`, DoD rounds
reads `0`, halts is empty, the ratio reads `n/a`; exit is 0; and in fleet mode the feature is a
normal row, carrying no gap marker and no reason string (EC-03, BR-27).

**AT-27 — an unreadable feature directory gaps the fleet and fails the single run.**
*Who:* pipeline operator. *Given:* a feature directory that cannot be read. *When:* `pdlc stats
{feature}`, then `pdlc stats`. *Then:* the single-feature run emits no report, names the feature and
the reason on stderr, and exits 1; the fleet run carries that feature as a gap row with the same
reason, reports every other feature normally, and exits 0. Both halves are asserted, because D-6's
decision is precisely that the two modes differ here (EC-11). *And:* the single-feature run repeated under
`--json` has stdout asserted: it parses as BR-30's error object, `error.reason` exactly
`unreadable_feature`, `feature` the supplied name — not empty stdout (BR-20, D-10). *And:*
over the eight root-failure runs — {`docs/` root absent, `docs/` root unreadable} × {single-feature,
fleet} × {human, `--json`} — every run exits 1 and every conjunct is positive: each stderr message
names the root; each carries the clause matching its own condition (absent in the absent runs,
unreadable in the unreadable runs, so the two messages are **not** byte-identical); no message is
EC-01's not-found message; and in the four `--json` runs stdout parses as BR-30's error object with
top-level keys exactly `schemaVersion`, `error`, `feature`, `error.reason` exactly `no_docs_root`,
and `feature` the supplied name in the single-feature runs and `null` in the fleet runs — D-9's
carve-out turns on that name, so hardcoding `null` on every root failure must fail here. Stdout's *content* is asserted, not
merely its non-report-ness: this is the first invocation a new caller mis-runs, and "prints no
report" is satisfied by both an empty stdout and an error object (EC-09, BR-20, BR-30).

**AT-28 — a non-matching `CODE_REVIEW-` basename is silent, not malformed.**
*Who:* pipeline operator. *Given:* a directory holding `CODE_REVIEW-{feature}-v2.md` and
`CODE_REVIEW-{feature}-draft.md`. *When:* the report is produced. *Then:* DoD rounds reads `2`, and
the non-matching basename appears in no malformed list in either mode — the asymmetry against EC-05
is asserted, not merely stated, because an implementer symmetrising the two sides gets exactly this
wrong (EC-16, BR-06).

### 6.11 Test-to-rule traceability

| Rule | Covered by |
|---|---|
| BR-01 | AT-24 |
| BR-02 | AT-02 |
| BR-03 | AT-03 |
| BR-04 | AT-23 |
| BR-05 | AT-07, AT-08 |
| BR-06 | AT-09, AT-28 |
| BR-07 | AT-25 |
| BR-08 | AT-10 |
| BR-09 | AT-01 |
| BR-10 | AT-11 |
| BR-11 | AT-12 |
| BR-12 | AT-13 |
| BR-13 | AT-14, AT-14b |
| BR-14 | AT-15 |
| BR-15 | AT-16, AT-06 |
| BR-16 | AT-15, AT-17 |
| BR-17 | AT-01 |
| BR-18 | AT-18, AT-20, AT-06, AT-19 |
| BR-19 | AT-06, AT-10, AT-16, AT-25 |
| BR-20 | AT-04, AT-24, AT-27 |
| BR-21 | AT-05 |
| BR-22 | AT-05, AT-25 |
| BR-23 | AT-19, AT-20 |
| BR-24 | AT-05 |
| BR-25 | AT-18 |
| BR-26 | AT-19 |
| BR-27 | AT-20, AT-26, AT-27 |
| BR-28 | AT-21, AT-22 |
| BR-29 | AT-22, AT-24, AT-27 |
| BR-30 | AT-23, AT-27 |

Every edge case in §5 is likewise traced. The table below is the one whose absence let §3.2's B5 and
EC-03 contradict each other through authoring: a rule-only matrix cannot show that an edge case has
no oracle.

| EC | Covered by | EC | Covered by |
|---|---|---|---|
| EC-01 | AT-23 | EC-12 | AT-16 |
| EC-02 | AT-02 | EC-13 | AT-17 |
| EC-03 | AT-26 | EC-14 | AT-14 |
| EC-04 | AT-03 | EC-15 | AT-13 (foreign-feature basename in fixture) |
| EC-05 | AT-09 | EC-16 | AT-28 |
| EC-06 | AT-25 | EC-17 | AT-18 (`docs/pdlc-halt-hardening/`) |
| EC-07 | AT-10, AT-12 | EC-18 | AT-18 (case leg) |
| EC-08 | AT-24 | EC-19 | AT-15 (symbolic-link member) |
| EC-09 | AT-27 (root leg) | EC-20 | AT-18 (empty-root leg) |
| EC-10 | AT-19 | EC-21 | AT-20 |
| EC-11 | AT-27 | | |

## 7. Open Questions

### 7.1 Questions this FSPEC decided that the REQ left to it

| # | Question | Decision | Rationale |
|---|---|---|---|
| D-1 | Does REQ-STATS-08's working-tree comparison span untracked and ignored paths, or only tracked ones? (SE cross-review v3 Q-01, explicitly routed here.) | It spans every path under the repository root except `.git/` — untracked paths included. | The comparison is between two snapshots of the same tree taken around one invocation, not against a fixed literal, so the untracked-file flake this repository has seen before (`coveredViolations`) does not arise. Including untracked paths is the stronger and the safer assertion: BR-28 permits no write anywhere, so an untracked path changing is a real violation. (AT-21) |
| D-2 | Does the DoD metric report the pipeline's next-round index or the last round that happened? (SE cross-review v3 Q-02, explicitly routed here.) | The last round that happened: the highest version present. | The pipeline's derivation answers a different question ("which round runs next") and returns highest-plus-one; reporting it unchanged would be off by one on every feature and would report `1` for a feature that never ran DoD. BR-10 states the near-miss so an implementer does not rediscover it. |
| D-3 | JSON field spellings, the human table layout, the ratio's precision, and the not-available / harvested token spellings (REQ O-1). | Fixed in §4.3 and §4.4. | REQ O-1 assigns these here. Fixing them in one place is what makes REQ-STATS-02's set-equality and REQ R-5's stability guarantee checkable. |
| D-4 | Is the review-rounds row set derived from the files present, or fixed? | Fixed: the six-document-type catalogue, always, in catalogue order (BR-09). | A row set derived from files present cannot express `harvested` for a type whose files were deleted — which is the state REQ R-6 exists to protect. |
| D-5 | Does the single-feature JSON document echo the feature name? | No (BR-21). | REQ-STATS-02 requires the top-level key set be set-equal to the printed metric set plus one schema-version field; a `feature` key would break that equality. The caller supplied the name. Fleet mode carries names as the keys of `features`, inside the metric container, not as extra top-level keys. |
| D-6 | Does an unreadable feature directory in single-feature mode degrade to a gap or fail? | It fails, exit 1 (EC-11). | Fleet mode's gap row exists so one bad feature does not suppress the other rows. In single-feature mode there are no other rows, and a report with a silently missing metric is worse than a refusal. |

| D-7 | Does fleet human mode carry the same metric set as the JSON document, or a summary? | The same set, with exactly two reductions: malformed basenames as a count, halts as `{n} ({r} resolved)` (BR-18). | REQ-STATS-07 requires REQ-STATS-01's metric set per feature, so no metric may be dropped — but a row cannot carry a list. A count and a resolved-tally preserve the two signals an operator scans a fleet for (a round count that is *wrong* rather than absent; a halt still open) while staying one line. AT-06's fleet half pins the reduction as exactly these two. |
| D-8 | A `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file, written by the pipeline's own Phase CR, is rejected by the driver's basename parse. Malformed, or its own bucket? | Malformed, named, counted in no row (BR-06). | REQ-STATS-03 disposes of every `CROSS-REVIEW-`-prefixed basename that fails the grammar as malformed, and C-5 binds this command to the driver's per-file rejection. A third bucket would be an independent rule and a divergence in one move. The cost — a pipeline-authored artifact reading as "malformed" — was raised upstream and REQ v1.4 accepted it, naming these basenames and settling the label (§7.3 E-3). |
| D-9 | A repository with no `docs/` root at all was, under REQ v1.3's *Given*, a feature absent under both roots — so the criterion appeared to demand a not-found report. Not-found, or a root failure? | A root failure: EC-09's message and `no_docs_root` error object, not EC-01's not-found (§3.1 A2 exits before A3 can resolve a feature). | REQ-STATS-09's *Given* swept this case in without meaning to: its subject is a feature that does not exist in a repository that does, and "there is no `docs/` root here" is both true and more useful than "feature X not found", which invites the operator to check a spelling when the repository is the problem. The behaviour is the better one and stands; the criterion's wording was what needed the carve-out, and REQ v1.4 carries it — the *Given* now scopes itself to a present, readable `docs/` root (§7.3 E-4). BR-30's `reason` values keep both answers machine-distinguishable, so a caller loses nothing by the choice. |
| D-10 | EC-11's single-feature exit-1 path is neither usage error nor not-found: BR-20 obliges a JSON document, BR-30's enum had no value for it. Third `reason`, or a second BR-20 exception? | A third `reason`, `unreadable_feature` (BR-30), stdout asserted at AT-27. | A second exception would make BR-20's guarantee path-by-path again — the rot it was rewritten to prevent. One enum value keeps "cannot be read" distinguishable from "does not exist" without parsing prose. |

### 7.2 Open — for TSPEC

| # | Item | Owner |
|---|---|---|
| O-1 | Whether the command reuses the pipeline driver's existing parsing or implements its own read path. This FSPEC requires only REQ C-5's outcome — no divergence from the driver's classification of the same bytes — and states no rule that would constrain the choice. | TSPEC (REQ O-2) |
| O-2 | Whether `stats` registers as a subcommand of the existing `pdlc` entry point or ships standalone. BR-01 fixes the flag surface and BR-29 the exit codes either way, so this choice changes no observable behavior specified here. | TSPEC (REQ O-3) |
| O-3 | How byte totals are obtained. BR-14 fixes *which* files are on each side and that the number is the file's size on disk; the mechanism is TSPEC's, bounded only by BR-28's read-only stance. | TSPEC |
| O-4 | Whether fleet mode's per-feature computation is sequential or concurrent. BR-18's lexicographic ordering and §3.4's read-only invariant hold either way; nothing in this document requires one. | TSPEC |

### 7.3 Upstream errata raised, not folded in — all closed

This section carried five errata against REQ *wording*. **All five are closed at REQ v1.4**; this
FSPEC routes nothing upstream. No behaviour changed in closing them — in every case the REQ adopted
the reading this FSPEC had already implemented, so the business rules and acceptance tests named
below stand exactly as written. The entries are kept as a record of what was raised and how it
settled.

| # | Erratum raised | Closed by | FSPEC sites that stand unchanged |
|---|---|---|---|
| E-1 | REQ-STATS-04's and REQ-STATS-06's harvested predicates read as bare globs (three related findings) | REQ v1.3/v1.4 scoped both to the documented basename grammars | BR-11, BR-16, AT-12, AT-17 |
| E-2 | REQ-STATS-05 requires a post-mortem listing C-5 defines nowhere (software-engineer FSPEC v1 F-03, High) | REQ v1.4: C-5 states the carve-out — post-mortem *discovery* is REQ-STATS-05's own, fidelity binds the `RESOLVED:` marker, not the listing | §1, BR-12 |
| E-3 | REQ-STATS-03's malformed disposition swallows pipeline-authored `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files (test-engineer FSPEC v1 F-01, High) | REQ v1.4: REQ-STATS-03 decides the label explicitly — those names are malformed, one label stands, a third bucket would be an independent rule C-5 forbids | D-8, BR-06 |
| E-4 | REQ-STATS-09's *Given* sweeps in the no-`docs/`-root case (software-engineer FSPEC v2 F-02, Medium) | REQ v1.4: the *Given* now scopes itself to a repository whose `docs/` root is present and readable, and names a missing or unreadable root a root failure | D-9, EC-09, BR-30 |
| E-5 | REQ-STATS-07's gap wording does not describe a zero-state row (software-engineer FSPEC v2 F-04, Medium) | REQ v1.4: the criterion now states a readable but empty directory "is not a gap but a normal row whose metrics report their zero states" | BR-27, AT-20, AT-26 |

Two Low findings remain recorded but route nowhere: **REQ-STATS-02's state enumeration
over-distributes across the ACs it names** (test-engineer v3 F-03) and **REQ-STATS-08's conjunct (b)
lost its list separator** (both reviewers). BR-22 and §3.4 state the intended readings; no FSPEC
behaviour turns on either.

### 7.4 Assumptions

- **A-1** Authored in an orchestrated (non-interactive) dispatch. §7.1's decisions are explicit and
  operator-vetoable, not silent defaults.
- **A-2** Metrics are computed fresh at invocation time; no cache and no persisted stats file
  exists, consistent with REQ G-4, C-1 and A-2.
- **A-3** The reviewer **role** catalogue that BR-05 depends on is the pipeline's own, not a set this
  feature defines: a role added to the pipeline is inherited here without an FSPEC change. The
  document-type catalogue is not inherited that way. BR-09 enumerates its six types literally and in
  order, because D-4 fixes the row set and ordering as observable output; a seventh type reaching the
  driver's catalogue therefore requires an FSPEC edit, and D-8's `REVIEW` case shows that is not
  hypothetical.

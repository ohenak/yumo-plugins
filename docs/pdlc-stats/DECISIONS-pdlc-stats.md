---
feature: pdlc-stats
---

# DECISIONS — pdlc-stats

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` (`docs/pdlc-stats/REQ-pdlc-stats.md`, `docs/pdlc-stats/FSPEC-pdlc-stats.md`, `docs/pdlc-stats/TSPEC-pdlc-stats.md`) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-DECISIONS[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 1.0 | 2026-08-31 |

Records the three load-bearing alternatives TSPEC §8.4 routes here: module placement,
`schemaVersion`'s home, and how the driver's parsers reach the new module. Each is stated once here
and cited by reference downstream; no downstream document restates the text.

## Context

Three choices in `TSPEC-pdlc-stats.md` are not derivable from the requirement they serve: each had a
defensible alternative that a later reader would otherwise re-open. `pdlc stats` is a small,
read-only reporting command (REQ G-4), so the code it adds is modest; what is not modest is the
co-change surface one of these choices buys, and the way another binds a published JSON contract
(REQ R-5) to a module-internal type. All three are recorded here so the reasoning survives the
review artifacts that carried it.

### Why placement is a decision and not a detail (DEC-STATS-01)

REQ C-5 requires that every artifact classification `pdlc stats` makes be the classification the
pipeline driver already makes over the same bytes. The four classifiers it needs are shipped exports
of `pdlc/workflows/orchestrate-dev.js` — `parseResolvedMarker`, `parseReviewFilename`,
`deriveRoundWindow`, `deriveDodRoundIndex`, all `export function` declarations in that file. So the
new module's correctness is a question about its relationship to a file in `pdlc/workflows/`, which
argues for co-location; but `pdlc/workflows/lib/` members that the shipped CLI can reach at runtime
are vendored into the published engine at pack time, and that vendored member list is transcribed at
several independent sites. Co-location is therefore not free, and the price is paid in a *completed
sibling feature's* frozen enumerations: `pdlc/engine/__tests__/_tspec-packed-set.mjs` states in its
own header comment that its `WORKFLOW_MEMBERS` list is co-changed with
`docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 `PK-*` table and FSPEC §5.2's per-class
counts, "never this file alone".

That coupling is the repo-wide pattern `docs/completed/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md`
records — a completed feature's approved enumerations are live coupling, not a closed record — and
`docs/completed/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md` records the opposite decision
(DEC-LOOPECON-08) taken under a REQ that forbade touching `pdlc/engine/`. This REQ carries no such
non-goal, so the trade is open here and has to be decided rather than inherited.

### Why `schemaVersion`'s home is a decision (DEC-STATS-02)

REQ-STATS-02 requires the JSON document's top-level key set to be set-equal to the printed metric
set plus one schema-version field, and REQ R-5 rests a consumer-stability guarantee on that field
existing. FSPEC turns this into BR-21/BR-23/BR-24/BR-30's exact key sets, and TSPEC §6.3 pins them
with a cross-mode oracle that derives both modes' metric sets from one `StatsReport`. `schemaVersion`
is the one field that must appear in JSON and must *not* appear in the human table, so wherever it is
stored decides whether that oracle is clean or carries a standing exception.

### Why the parser seam is a decision (DEC-STATS-03)

TSPEC §2.5 injects the four classifiers as a `StatsParsers` bundle rather than importing
`orchestrate-dev.js` from `lib/stats.mjs`. Injection is what makes the `ok: false` branches reachable
in a unit test and keeps an 816 KB module (`pdlc/workflows/orchestrate-dev.js`, 816.5 KB at HEAD) out
of the unit path — but injection is also exactly the capability that lets a green suite hide a
production divergence from REQ C-5, which is the constraint the whole design exists to satisfy.
`docs/_decisions/DECISIONS-seam-defaults.md` (DEC-SEAM-01) already governs the shape of an injected
seam's default and its paired guard; this decision records which *kind* of guard discharges C-5.

## Options Considered

Every cost below was measured against the tree at HEAD, not estimated.

### DEC-STATS-01 — where the pure metric logic lives

| Option | Location | Enumeration co-change (verified) | Coverage gate (verified) |
|---|---|---|---|
| **A (chosen)** | `pdlc/workflows/lib/stats.mjs`, thin `cmdStats` in `pdlc/engine/bin/cli.mjs` | five edit sites; vendored class 5 → 6 | in `pdlc/workflows/package.json`'s `c8.include`, subject to `test:coverage`'s second `--per-file --branches 85` pass |
| B | `pdlc/engine/lib/stats.mjs` | engine `lib/*.mjs` class 15 → 16 (`LIB_MODULES_AT_HEAD` 12 + `LIB_MODULES_FROM_THIS_FEATURE` 3), plus the same `tspecPackedCount` amendment | **none** — `pdlc/engine/package.json`'s only test script is `node __tests__/_run-suite.mjs`; the package declares no `c8` block and no coverage dependency at all |
| C | inline in `pdlc/engine/bin/cli.mjs` | none | **none**, same reason as B |
| D | `pdlc/workflows/lib/stats.mjs`, **not vendored** | none | same as A |

**Option A's five sites**, each confirmed to contain the member list it is claimed to contain:

| Site | Symbol | Members at HEAD |
|---|---|---|
| `pdlc/engine/scripts/prepack.mjs` | `MODULE_NAMES` | `orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs` |
| `pdlc/engine/scripts/publish-preflight.mjs` | `WORKFLOW_MEMBERS` | the same four, `vendor/workflows/`-prefixed, plus `VENDOR-MANIFEST.json` |
| `pdlc/engine/scripts/fixture-machine.mjs` | `WORKFLOW_MODULE_NAMES` | the same four |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | `WORKFLOW_MEMBERS` and `tspecPackedCount` | the five; `tspecPackedCount` returns `4 + 15 + 5 + 1 + (licence ? 1 : 0)` |
| `pdlc/workflows/package.json` | `c8.include` | seven `**/`-anchored entries, including both existing `lib/*.mjs` members |

**B rejected.** It pays a co-change of the same order — `_tspec-packed-set.mjs`'s count conjunct has
to move either way, since `tspecPackedCount` sums the `lib` class and the vendored class in one
expression — and buys nothing back: the engine package measures no coverage, so the new module's
branch coverage would be unenforced. It also still has to load the vendored driver across the
`resolveWorkflowRoot()` seam, so the C-5 relationship is no closer.

**C rejected.** `pdlc/engine/bin/cli.mjs` is 57.0 KB at HEAD and is in no coverage include set;
adding a few hundred lines of pure computation to it puts the feature's entire correctness surface
outside every gate the repo has.

**D rejected — and it is the option worth naming, because a `pdlc/workflows/lib/` member can in fact
skip the vendoring co-change.** `pdlc/workflows/lib/document-oracles.mjs` is such a member: it
appears in none of the four vendoring enumerations, only in `pdlc/workflows/package.json`'s
`c8.include`. The reason it can is that its only importers are tests
(`pdlc/workflows/__tests__/documentOracles.test.js`) — it is never reached by a shipped code path.
`lib/stats.mjs` is reached by `pdlc stats` on an installed engine, where `resolveWorkflowRoot()`
resolves to the vendor tree; unvendored, the command would work in a checkout and fail only for
installed users. D is therefore not a cheaper A, it is a broken A, and the asymmetry with
`document-oracles.mjs` is explained by runtime reachability, not by precedent for skipping.

### DEC-STATS-02 — where `schemaVersion` lives

| Option | Shape | Consequence for TSPEC §6.3's cross-mode oracle |
|---|---|---|
| **A (chosen)** | a `renderJson` obligation; module constant `SCHEMA_VERSION`, hoisted identically into all three documents | oracle stays exception-free: every key it compares across modes is a metric |
| B | a field on `StatsReport` | the human renderer reads a value carrying a JSON-only key; the oracle needs a permanent per-key exception, and BR-21's set-equality would have to be restated as set-equality-minus-one |
| C | a field on `FeatureStats` | worse than B: it would also appear per fleet entry, contradicting BR-23's "BR-21's document minus its hoisted `schemaVersion`" |

### DEC-STATS-03 — how the driver's classifiers reach `computeFeatureStats`

| Option | Mechanism | Why it does or does not discharge REQ C-5 |
|---|---|---|
| **A (chosen)** | injected `StatsParsers` bundle + an identity oracle asserting `===` against `orchestrate-dev.js`'s exports at the single production construction site | identity cannot be satisfied by a re-implementation at all, so C-5 holds for every input, not just tested ones |
| B | direct static `import` in `lib/stats.mjs` | discharges C-5 structurally, but forces every unit test to evaluate an 816.5 KB module and leaves `deriveRoundWindow`'s `ok: false` branch reachable only by constructing a colliding-filename fixture |
| C | injection + behavioral-equivalence tests over a corpus | passes for a re-implementation that agrees on today's corpus; C-5 is about agreement on *all* bytes, so this is the one option that cannot enforce it |

## Decision

### DEC-STATS-01: The pure metric logic lives in `pdlc/workflows/lib/stats.mjs`; the operator surface is a `stats` case in `pdlc/engine/bin/cli.mjs`

**Decision.** Option A. `computeFeatureStats`, `discoverFeatures`, `parseStatsArgv`, `runStats` and
both renderers land in a new `pdlc/workflows/lib/stats.mjs`. `pdlc/engine/bin/cli.mjs` gains a
`cmdStats` that builds the four `StatsIo` seams and the `StatsParsers` bundle, reaching the new
module through the same `resolveWorkflowRoot()`-then-dynamic-`import()` arrangement its existing
`loopSessionModule()` and `escalationViewModule()` helpers use. `resolveWorkflowRoot()` itself is
unchanged: it probes for `orchestrate-dev.js` and `orchestrate-queue.js` to pick a root, and
`lib/stats.mjs` loads from whichever root that returns.

**Constraint that forced the shape.** Two, pulling the same way. REQ C-5 makes agreement with
`orchestrate-dev.js`'s classifiers *the* correctness property, so the consumer should be versioned,
vendored and tested as one unit with the producer. And the only per-file branch floor in the repo is
the second stage of `pdlc/workflows/package.json`'s `test:coverage`
(`--per-file --branches 85`), which exists precisely so a small module cannot hide inside
`orchestrate-dev.js`'s aggregate; a new module of a few hundred lines wants that gate.

**Carve-out against a completed sibling feature — stated once, here.** Adding
`vendor/workflows/lib/stats.mjs` to `pdlc/engine/__tests__/_tspec-packed-set.mjs`'s
`WORKFLOW_MEMBERS`, and moving `tspecPackedCount`'s vendored term from `5` to `6`, amends
enumerations that `docs/completed/pdlc-engine-distribution/` approved and froze (its TSPEC §5.4
`PK-*` table and FSPEC §5.2's per-class counts). This paragraph is that amendment's single site.
Downstream documents — PLAN, PROPERTIES, the implementation's tests — **cite `DEC-STATS-01` and do
not restate this text**: `pdlc-engineering-loop`'s LEARNINGS records verbatim restatement of one
clause across three documents as a defect generator, and a carve-out is exactly the clause shape
that attracts it. The growth path is precedented rather than novel: the same class already went from
three members to five when `lib/loop-session.mjs` and `lib/escalation-view.mjs` were added, recorded
as `PK-24`/`PK-25` in that helper's own comments.

**Reversibility: hard.** Undoing it means amending the five enumerations and the sibling feature's
frozen table a second time. Not a one-way door — no data or published contract is committed — but
each reversal costs what the original cost.

**Re-evaluation triggers.**
- `pdlc/workflows/lib/` becomes a routinely-growing directory (a third runtime-reachable member
  added after `stats.mjs`). At that point the transcription stops being amortisable and the four
  vendoring enumerations should be *derived* from a directory listing at pack time, with the
  packed-set test asserting the derived set rather than a literal.
- A future REQ forbids editing `pdlc/engine/`, as `pdlc-loop-economics`'s NG-3 did. Under that
  constraint option A is unavailable and DEC-LOOPECON-08's inverse trade applies instead.
- `pdlc/engine/package.json` gains a coverage gate with a per-file floor, which would remove option
  B's disqualifying asymmetry.

### DEC-STATS-02: `schemaVersion` is a `renderJson` obligation, not a field on `StatsReport` or `FeatureStats`

**Decision.** Option A. `SCHEMA_VERSION` is a module constant in `lib/stats.mjs`, and `renderJson`
hoists it identically into all three emitted documents (single success, fleet success, refusal).
Neither `StatsReport` nor `FeatureStats` carries it. `renderJson` stays a **projection** of
`StatsReport`, not a serialisation of it — the same reason `FeatureStats.feature` and
`FeatureStats.dir` exist for the human header and BR-02's live-before-archive preference yet reach
no document.

**Constraint that forced the shape.** BR-21's set-equality between the JSON top-level key set and
the printed metric set. A report-level `schemaVersion` breaks it in the human direction: the value
the human renderer reads would carry a key with no printed counterpart, and TSPEC §6.3's cross-mode
oracle would need a standing per-key exception — a permanent hole in the one check REQ-STATS-02's
guarantee rests on.

**Reversibility: easy.** One constant and one hoist site.

**Re-evaluation trigger.** A second JSON-only field appears. Two hoists is where an explicitly named
envelope type (`JsonEnvelope<T>`) becomes cheaper than repeating the hoist, and the oracle can then
be stated over the envelope's payload rather than over an exception list.

### DEC-STATS-03: The driver's four classifiers are injected as a bundle and pinned by an identity oracle

**Decision.** Option A. `computeFeatureStats` receives `parseReviewFilename`, `deriveRoundWindow`,
`deriveDodRoundIndex` and `parseResolvedMarker` in an injected `StatsParsers` bundle.
`statsParsers()` in `pdlc/engine/bin/cli.mjs` is the **single production construction site**, and one
test asserts that the functions it returns are `===`-identical to `orchestrate-dev.js`'s own
exports. Unit-test doubles default to the real parsers (so a test opts *out* of fidelity explicitly,
never into it by omission), consistent with `DECISIONS-seam-defaults.md` DEC-SEAM-01's rule that a
seam's default is chosen for what the consumer does with it.

**Constraint that forced the shape.** REQ C-5 is a claim about all inputs, not a corpus. Reference
identity is the only guard that is total over inputs while still leaving the seam injectable;
behavioral equivalence (option C) is a sample, and a sample cannot discharge a universal.

**Reversibility: easy.** Switching to a static import is a local change in `lib/stats.mjs` and
deletes the oracle rather than requiring a new one.

**Re-evaluation trigger.** The driver exports gain state — a closure over configuration, a cache, a
module-level mutable. Sharing a function reference stops being sufficient the moment two callers can
observe each other through it, and the seam would need to share the state, not the function.

## Consequences

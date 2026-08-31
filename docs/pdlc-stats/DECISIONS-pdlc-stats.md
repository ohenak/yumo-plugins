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

## Consequences

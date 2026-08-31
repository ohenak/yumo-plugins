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

## Decision

## Consequences

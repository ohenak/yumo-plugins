# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

Delta re-review. Base for the diff is `113492625` (the commit carrying my v1
cross-review); the document moved across seven commits, `83c1e2c9c` → `90cc02fe9`,
+82/−21 lines. I re-read my v1 findings first, diffed the document, verified every
*new* factual claim against the tree at HEAD, and scanned only the changed sections
for new issues. Sections untouched by the revision were approved in v1 and are not
re-litigated — with the one exception the delta itself forced me back into, recorded
as F-01.

## Prior findings — disposition

| v1 finding | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — carve-out claims to be "that amendment's single site" while the helper's co-change rule demands two sibling-document edits it does not own | High | **Resolved** | The paragraph now separates *justification* from *execution* and hands the edits to a new `K-7` row with an owning PLAN task. It no longer claims to override the rule; it claims to comply, spec-first |
| F-02 — Option D's evidence sentence said `document-oracles.mjs` sits in `c8.include` | Medium | **Resolved, and correctly** | The corrected sentence says it appears in no vendoring enumeration **and no coverage include set**. Verified: `c8.include` holds seven entries and `document-oracles.mjs` is not among them |
| F-03 — the unenforceable second-construction-site risk was not among Standing costs accepted | Medium | **Resolved** | New `### Residuals — obligations with no oracle at HEAD` table; K-4 gains a construction-site count conjunct routed to TSPEC §6.4 as an erratum |
| F-04 — re-evaluation trigger not checkable or directional | Low | **Resolved** | Trigger now names a detector (`MODULE_NAMES.length` exceeding five) and enumerates the six lists still literally transcribed |

All four are closed. The revision did the work asked of it, and did it by verifying
against the tree rather than by softening the claims — F-02 in particular was
corrected *upward* in strength, which is the right instinct.

## Verification Performed

Every claim the revision newly introduces, checked against HEAD:

| New claim | Where | Verified |
|---|---|---|
| `document-oracles.mjs` is in none of the four vendoring enumerations **and** in no coverage include set | Option D | Confirmed — `c8.include` is seven `**/`-anchored entries, none of them `document-oracles.mjs` |
| The completed sibling's PLAN file-state table records the same state | Option D | Confirmed — `docs/completed/pdlc-engineering-loop/PLAN-pdlc-engineering-loop.md:64` says `lib/document-oracles.mjs` is **not** in the include list |
| Runtime-reachable `lib/` members at HEAD are `loop-session.mjs` and `escalation-view.mjs`, exactly the two `lib/` entries in `MODULE_NAMES`; `stats.mjs` is the third; detector is `MODULE_NAMES.length` exceeding five | DEC-STATS-01 trigger | Confirmed — `prepack.mjs:20-25` holds exactly four entries, two of them `lib/`. Four at HEAD, five after this feature, six on the trigger. Arithmetic is right and the trigger is now directional |
| c8 opens only what `include` matches; `all` is not set | Option table row A, K-3 | Confirmed — the `c8` block declares no `all` key |
| The P9-02 test asserts `c8.include` set-equal to a transcribed literal in both directions | K-3 | Confirmed — `coverageInstrumentation.test.js:264` uses `toEqual` against a fully transcribed array, so a deleted entry reds as loudly as a missing one |
| `bin-guard-structure.test.js` pins `bin/pdlc.mjs` with zero static imports, exactly three top-level statements, zero `await` tokens | K-4 | Confirmed — that is verbatim the file's stated three-conjunct contract, and it is a positive structural count over source, exactly the precedent K-4 claims |
| The sibling's 0.15 changelog row records a versioned co-change amendment adding `PK-24`/`PK-25`, correcting the note three → five, moving the derived total, amending FSPEC §5.2 in the same change, touching no other row | K-7 | Confirmed — matches `docs/completed/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md:32` point for point, including the "No other `PK-*` row, class, or oracle is touched" clause |
| FSPEC §5.2's "Workflow members" per-class count reads five at HEAD | K-7 | Confirmed — `FSPEC-pdlc-engine-distribution.md:583` reads "**five vendored workflow members**", so `five → six` is the right edit |

Eight for eight. The document's standing promise — *"Every cost below was measured
against the tree at HEAD, not estimated"* — held for every claim the revision added.
It did not hold for something the revision did not add, and that is F-01.

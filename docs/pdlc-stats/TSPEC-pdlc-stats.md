---
feature: pdlc-stats
---

# TSPEC — pdlc-stats

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (`docs/pdlc-stats/REQ-pdlc-stats.md`, `docs/pdlc-stats/FSPEC-pdlc-stats.md`) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-TSPEC[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 1.0 | 2026-08-31 |

## 1. Overview

`pdlc stats` is a read-only reporting command over artifacts the pipeline has already written. It
adds no instrumentation and no persisted state: it lists one directory, sizes the files in it, and
prints four metrics — review rounds per document type, DoD rounds, halts with resolution state, and
the process-to-spec byte ratio (FSPEC §1).

**The one technical constraint that shapes everything below is REQ C-5.** Every artifact
classification this command makes must be the classification the pipeline driver already makes over
the same bytes. That is not a coding-style preference here: the driver's classifiers are shipped,
exported functions, and this design reaches them by **importing and calling them**, never by
re-implementing their grammars. The four it needs all exist today in
`pdlc/workflows/orchestrate-dev.js` and are all `export`ed:

| Driver export | What it decides | Verified shape |
|---|---|---|
| `parseReviewFilename(basename)` | cross-review basename grammar: role, doc type, round, and the rejection reason | returns `{ok: true, role, docType, round, suffixed}` or `{ok: false, reason}`; `reason` is `not_cross_review` when the `CROSS-REVIEW-` prefix is absent, and `bad_role` / `bad_doc_type` / `bad_round` / `trailing_junk` otherwise |
| `deriveRoundWindow(basenames, docType)` | per-doc-type round history from one listing | returns `{ok: true, startIndex, endIndex, present, skipped}` or `{ok: false, reason: "malformed_round_one_duplicate", role}` |
| `deriveDodRoundIndex(basenames, feature)` | `CODE_REVIEW-{feature}-v{N}.md` grammar, feature name escaped before matching | returns the **next** index: `max(existing) + 1`, `1` when nothing matches |
| `parseResolvedMarker(fileText)` | a POSTMORTEM's `RESOLVED:` marker, fenced regions excluded | returns `{ok: true, resolved}` or `{ok: false, reason}` for absent/duplicated/unparseable |

Three consequences follow directly from those signatures, and they are the whole arithmetic of two
of the four metrics:

- **BR-05's "highest round present" is `startIndex - 1`.** `deriveRoundWindow` computes
  `startIndex = max(indices) + 1`, and `1` when the doc type has no files at all. Subtracting one
  therefore yields the highest index present, and `0` for a never-reviewed type — exactly BR-05's
  stated near-miss, discharged by construction rather than by a re-derivation.
- **BR-10's "highest version" is `deriveDodRoundIndex(...) - 1`.** The driver answers "which DoD
  round runs next"; BR-10 asks which one last happened. One subtraction, at one call site.
- **BR-07's `unmeasurable` is `deriveRoundWindow`'s `ok: false` branch.** Its `reason`
  (`malformed_round_one_duplicate`) and its `role` field are precisely the state and the colliding
  role BR-07 asks the report to name.

**Where the code lives.** The pure computation lands in a new workflow-tree module,
`pdlc/workflows/lib/stats.mjs`, alongside the existing `lib/loop-session.mjs` and
`lib/escalation-view.mjs`. The operator surface lands as a new `stats` case in
`pdlc/engine/bin/cli.mjs`, which reaches the new module through the same
`resolveWorkflowRoot()`-then-dynamic-`import()` arrangement its `loopSessionModule()` and
`escalationViewModule()` helpers already use. §2 argues that placement and §8 records the
alternatives; the cost it carries — a co-change across four vendoring enumerations and a carve-out
against a completed sibling feature's frozen packed-set table — is named here rather than
discovered during implementation.

**What this document decides.** Module boundaries and the seam design; the injected-parser bundle
and the wiring oracle that keeps it honest; the filesystem seams and the `lstat`-not-`stat` choice;
the discovery predicate for fleet mode; the render functions and their purity; the test strategy.
FSPEC §7.2's four TSPEC-owned open items (O-1 reuse-vs-reimplement, O-2 subcommand-vs-standalone,
O-3 how bytes are obtained, O-4 sequential-vs-concurrent) are all answered, each at its own section
and each cross-referenced in §8.

**What this document does not decide.** No observable behavior. Every token spelling, key set, exit
code, row order and edge-case outcome is fixed by FSPEC §4 and §5, and this document restates none
of them as rules of its own — it names the function that produces each and the test that pins it.

## 2. Architecture

## 3. Interfaces

## 4. Data Model

## 5. Error Handling

## 6. Test Strategy

## 7. Traceability

## 8. Open Questions

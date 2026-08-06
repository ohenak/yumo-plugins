# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 12
**Scope:** Local (delta re-review — v11 findings + changed sections only)
**Baseline diffed:** `e54ee26..HEAD` (v11's `REVIEWED-COMMIT`). `git diff e54ee26..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is **empty**: the document under review is byte-identical to the one I approved at v11 (637 lines / 61,109 bytes, unchanged). `git diff e54ee26..HEAD -- . ':(exclude)docs/'` is likewise empty — no production code, script, workflow or config changed in the interval, so every `file:line` anchor verified at v11 is verified at HEAD by construction.

## Prior-Finding Disposition

This is the first round in this document's history in which the REQ did not move. The 66 commits
between `e54ee26` and HEAD are Phase F work — the FSPEC, its ten cross-review files, the Phase F
POSTMORTEM and its resolution, one new project-level decision, and two queue-status commits. Not one
of them touches the REQ. So the disposition below is not a judgment about a revision; it is a record
that no revision was attempted.

| v11 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-02 | Low | **Open — unchanged** | The baseline file's change-control clause still reads "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect" (`pdlc-advisory-corpus-baseline.md:19-20`), the `Cited by` row still carries the `§5` entry added in the same commit as that clause (`:6`), and `Version` is still `1.0 · 2026-08-06` (`:7`). Neither of the two fixes I offered was taken: the clause is not narrowed to "a change to any **stated fact**", and the file is not bumped to 1.1. The asymmetry with the vocabularies file's row-scoped clause (`pdlc-consolidation-vocabularies.md:26-27`) therefore stands. |
| F-03 | Low | **Open — unchanged** | §4b still opens "This REQ owns every section of each `docs/_constraints/` file it authors — **§1–§4 entire in both**" and follows it, with no change of subject, with "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (REQ `:558-562`). The baseline still says the opposite about itself — "All four sections are **owned normative prose** … no set-equality oracle ranges over this file" (`pdlc-advisory-corpus-baseline.md:18-20`) — and its §1 is still the three-row `Record \| Where \| Fate` table (`:24-30`) a literal reading of §4b would drag under a row oracle. The ~60-byte subject-scoping clause I proposed was not written. |

Both were Low at v11 and are Low now: nothing changed that could have raised or lowered either. I
have re-verified both against the files rather than restating v11's text, because the two governed
files *could* have moved without the REQ moving — `git diff e54ee26..HEAD -- docs/_constraints/` is
empty, and the line numbers above are current at HEAD.

## Standing-Decision Check

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict

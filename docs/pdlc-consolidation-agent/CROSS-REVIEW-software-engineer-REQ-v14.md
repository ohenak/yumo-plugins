# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 14
**Scope:** Local (delta re-review — v13 findings + changed sections only)
**Baseline diffed:** `1cebcce..HEAD` (v13's `REVIEWED-COMMIT`; HEAD = `22564a6`).

## Prior-Finding Disposition

`git diff 1cebcce..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is
**empty**. For the third consecutive round the document under review is byte-identical to the one I
approved — 637 lines / 61,109 bytes,
`sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17`, the same digest v12 and
v13 both recorded as their `APPROVAL-HASH`. `git diff 1cebcce..HEAD -- . ':(exclude)docs/'` is
likewise empty: across all 145 intervening commits no source file, script, workflow bundle or config
moved, so every `file:line` anchor verified at v13 is verified at HEAD by construction rather than by
sampling.

The 145 commits are Phase T work — the TSPEC, five PM and five TE cross-reviews, a `POSTMORTEM-T`
and its resolution, two amendments to `docs/_decisions/`, and queue-status commits. Not one touches
the REQ or `docs/_constraints/`.

| v13 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-02 | Low | **Open — unchanged** | The baseline's change-control clause still reads "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect" (`pdlc-advisory-corpus-baseline.md:19-20`); the `Cited by` row still carries the `§5` entry added by the same commit (`:6`); `Version` is still `1.0 · 2026-08-06` (`:7`). Neither offered fix was taken. The asymmetry against the vocabularies file's **row**-scoped clause (`pdlc-consolidation-vocabularies.md:27-28`) stands. |
| F-03 | Low | **Open — unchanged** | §4b still reads "§1–§4 entire in both" and, with no change of subject, "§1, §2 and §4 are enumerations … §3 is owned normative prose" (REQ `:560-563`). The baseline still says the opposite about itself — "All four sections are **owned normative prose** … no set-equality oracle ranges over this file" (`pdlc-advisory-corpus-baseline.md:17-19`) — and its §1 is still the three-row `Record \| Where \| Fate` table (`:24-28`). The ~60-byte subject-scoping clause was not written. |

I re-derived both from the two governed files at HEAD rather than copying v13's text, because those
files could have moved without the REQ moving. `git diff 1cebcce..HEAD -- docs/_constraints/` is
empty and the line numbers above are current.

## Standing-Decision Check

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict

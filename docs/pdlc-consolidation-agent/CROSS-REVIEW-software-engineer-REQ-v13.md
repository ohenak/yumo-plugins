# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 13
**Scope:** Local (delta re-review — v12 findings + changed sections only)
**Baseline diffed:** `455929d..HEAD` (v12's `REVIEWED-COMMIT`; HEAD = `1cebcce`).

## Prior-Finding Disposition

`git diff 455929d..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is
**empty**. For the second consecutive round the document under review is byte-identical to the one I
approved — 637 lines / 61,109 bytes, `sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17`,
the same digest v12 recorded as its `APPROVAL-HASH`. `git diff 455929d..HEAD -- . ':(exclude)docs/'`
is likewise empty: no source file, script, workflow bundle or config moved in the interval, so every
`file:line` anchor verified at v12 is verified at HEAD by construction rather than by sampling.

The 112 commits between `455929d` and HEAD are Phase F work — the second FSPEC review window (rounds
6–10), ten more cross-review files, a second `POSTMORTEM-F` and its resolution, four freeze-mandated
FSPEC deletions, two new project-level decisions and three queue-status commits. Not one touches the
REQ, `docs/_constraints/`, or any production file.

| v12 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-02 | Low | **Open — unchanged** | The baseline's change-control clause still reads "Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect" (`pdlc-advisory-corpus-baseline.md:19-20`); the `Cited by` row still carries the `§5` entry added by the same commit (`:6`); `Version` is still `1.0 · 2026-08-06` (`:7`). Neither offered fix was taken. The asymmetry against the vocabularies file's **row**-scoped clause (`pdlc-consolidation-vocabularies.md:27-28`) stands. |
| F-03 | Low | **Open — unchanged** | §4b still reads "This REQ owns every section of each `docs/_constraints/` file it authors — **§1–§4 entire in both**" and, with no change of subject, "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (REQ `:560-563`). The baseline still says the opposite about itself — "All four sections are **owned normative prose** … no set-equality oracle ranges over this file" (`pdlc-advisory-corpus-baseline.md:17-19`) — and its §1 is still the three-row `Record \| Where \| Fate` table (`:24-28`). The ~60-byte subject-scoping clause was not written. |

Both were Low at v11 and v12 and are Low now. I re-verified them against the two governed files
rather than restating v12's text, because those files *could* have moved without the REQ moving —
`git diff 455929d..HEAD -- docs/_constraints/` is empty, and the line numbers above are current at
HEAD. Where a line number above differs by one or two from v12's citation of the same sentence, the
files have not moved — the bytes are identical and the diffs are empty; v12's span was simply drawn a
line or two wide. I re-derived every number here from the files at HEAD rather than copying v12's.

## Standing-Decision Check

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict

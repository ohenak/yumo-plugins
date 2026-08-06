# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 12
**Scope:** Local (Scope tags per finding below)
**Delta base:** `e54ee26` (the tree v11 reviewed) → HEAD

Delta re-review, and the delta is empty. `git diff e54ee26..HEAD --
docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` produces **no output**, and the
file's digest at HEAD is `sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17`
— byte-for-byte the `APPROVAL-HASH` I recorded in v11. The same diff over `docs/_constraints/` is
also empty, so neither governed file moved either. The REQ's last content commit is `6c025bb`
(`git log -1 -- …REQ-…md`), which is an ancestor of the tree v11 reviewed; the ~120 commits since
are Phase F work (FSPEC v1→v6, its ten cross-reviews, `POSTMORTEM-F`) plus two queue rows, none of
which touched this document.

Two consequences for this round, stated plainly rather than inferred:

1. **Nothing can have been broken.** There is no changed section to scan for new issues, so this
   review opens no new finding ids. F-57+ is unused.
2. **Nothing can have been fixed either.** All three v11 Lows are re-verified against the tree
   below and all three are still open, in exactly the state v11 left them.

## Prior findings

Each v11 finding is re-checked against the file it was about, not against its own prose.

| v11 ID | Sev | Disposition | Evidence at HEAD |
|---|---|---|---|
| F-54 | Low/Cross-Feature | **Open — unchanged** | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `| Version | 1.0 · 2026-08-06 |`, while the change-control paragraph that makes an unbumped content change a defect is still the inserted `:15-20` text ("Consumers cite this file **at its `Version`**; a content change that is not accompanied by a version bump is itself a defect") and the `Cited by` row at `:6` still carries the `§5` the same diff added. The three REQ citations still pin the unbumped version: AC-1.5 (`:202`, "**`docs/_constraints/pdlc-advisory-corpus-baseline.md` §3** (at `Version` 1.0)"), REQ-CONS-06's preamble (`:448`, "(at `Version` 1.0)") and the honest-limit line (`:474`, "The honest limit (baseline §4)"). Still Low for the reason v11 gave and DEC-SEV-01 records: no value a downstream test transcribes moved, and the file declares itself outside any row oracle. |
| F-55 | Low/Local | **Open — unchanged** | §4b still widens ownership across both files — "**This REQ owns every section of each `docs/_constraints/` file it authors — §1–§4 entire in both**" (`:558-559`) — and the classification sentence that follows still says "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (`:560-563`) without naming which file's owned sections it ranges over. The oracle range still ends "§1, §2 and §4 entire at Version 1.4" (`:564-565`), which is the pin that lets a careful reader resolve it, since only the vocabularies file is at 1.4 (`pdlc-consolidation-vocabularies.md:7`) and the baseline is at 1.0. §5 still lists both files in identical words, "(§1–§4 entire, per §4b)" for each (`:585-586`), so it still distinguishes nothing. |
| F-56 | Low/Process | **Open — measurement unchanged** | `wc -l -c` at HEAD: **637 lines / 61,109 bytes**, identical to v11, against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) and past both soft thresholds `SOFT_LINE_LIMIT=630` / `SOFT_BYTE_LIMIT=55296` (`:47-48`). Margin **331 bytes**. Worth one correction on the record: `6c025bb`'s commit message states the margin moved "344 → 437 bytes"; the tree says 331. The message is describing a different measurement than `check-req-size.sh` performs, and the script's own limits are the ones that matter. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

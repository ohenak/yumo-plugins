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

No new findings. The three carried forward are F-54, F-55 and F-56, re-verified above and restated
here so the table is complete on its own terms; ids are not renumbered across rounds.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-54 | Low | Cross-Feature | The baseline file's content changed under a frozen `Version`, and the clause that makes that a defect is the paragraph the same commit added, so the file breaches its own rule; the REQ pins the unbumped `1.0` in three places. Fix: `1.0` → `1.1` in the baseline header and in the REQ's two version-pinned citations. | `docs/_constraints/pdlc-advisory-corpus-baseline.md:6-7`, `:15-20`; REQ `:202`, `:448`, `:474` |
| F-55 | Low | Local | §4b's ownership sentence spans both governed files, but the enumeration/prose classification and the oracle range built on it were written for one. Read literally it puts the baseline file's §1 table under a set-equality oracle at a `Version` that file does not carry, while the baseline file says all four of its sections are prose under no row oracle. Decidable today only via the `Version 1.4` pin. Fix: name the vocabularies file in the classification sentence, and add to §5 that the baseline's four owned sections carry no row oracle. | REQ §4b (`:558-565`), §5 (`:585-586`); `docs/_constraints/pdlc-advisory-corpus-baseline.md:17-19`, `:24-30`, `:46` |
| F-56 | Low | Process | The REQ sits at 61,109 / 61,440 bytes — a 331-byte margin against a warn-only budget — and the trend across rounds 9→12 is 387 → 344 → 331 → 331. Not a delivery risk: `check-req-size.sh` emits a `PostToolUse` `additionalContext` line and `exit 0` on every path (final block), so nothing is blocked. Filed to keep the headroom visible to whoever lands F-54/F-55 (~44 bytes together, which fit). | Whole document; `pdlc/hooks/scripts/check-req-size.sh:41-42`, `:47-48` |

**Why no finding was upgraded on a no-change round.** The Challenger default is that a document
that did not move does not thereby earn a better verdict — but it does not earn a worse one either,
and severity is a property of the defect, not of how many rounds it has survived. `DEC-SEV-01`
(`docs/_decisions/DECISIONS-review-severity-bars.md:10`) settles exactly this class: "a
version-pin-detectable governance-scope gap is Low; Medium is reserved for gaps that block a
downstream author today." I applied the test rather than the label. F-54: a PROPERTIES or TSPEC
author transcribing an expected value from the baseline file transcribes §1's fate table, §2's
absent-at-HEAD facts, §3's ladder or §4's limit — all byte-identical across the diff that broke the
version rule, and all outside any row oracle by the file's own declaration (`:17-19`), so no
expected value is wrong today. F-55: the range clause pins `Version 1.4`, only one of the two files
carries 1.4, and the other states the answer in its own words — the oracle's subject is
recoverable, just not from one sentence. Neither blocks a fixture being written today. They stay
Low.

## Questions

## Positive Observations

## Recommendation

## Verdict

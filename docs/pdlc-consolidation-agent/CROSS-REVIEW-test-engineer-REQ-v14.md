# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 14
**Scope:** Local (Scope tags per finding below)
**Delta base:** `d2160dd` (the tree v13 reviewed) → HEAD `22564a6`

## Delta

Delta re-review, and the delta over the document under review is **empty for the third consecutive
round**. `git diff d2160dd..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
produces no output, and `shasum -a 256` over the REQ at HEAD returns
`0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17` — byte-identical to the
`APPROVAL-HASH` recorded in v13 (`CROSS-REVIEW-test-engineer-REQ-v13.md:192`), v12 and v11. The REQ
has now been unchanged across four consecutive reviewer rounds (v11–v14).

`git diff --stat d2160dd..HEAD -- pdlc/` is likewise **empty**: no shipped code moved, so every
`file:line` claim the REQ makes about existing behaviour resolves to the same bytes by construction.
I re-ran the three load-bearing ones anyway (Positive Observations) rather than inferring them from
the stat.

`git diff --stat d2160dd..HEAD -- docs/_constraints/` is **also empty** — neither governed constraints
file moved. That is what pins all three carried findings to their prior state: F-54 and F-55 are
findings *about* those files, and their subjects did not change.

What did change in the interval, and is therefore the only material this round has to scan:

| Changed path | Nature |
|---|---|
| `docs/pdlc-consolidation-agent/TSPEC-…md` (+2555) and ten TSPEC cross-reviews | Phase T work — downstream of this REQ, not reviewable here |
| `docs/pdlc-consolidation-agent/POSTMORTEM-T-…md` (+532) | Phase T halt postmortem (rounds 1–5) |
| `docs/pdlc-consolidation-agent/CROSS-REVIEW-*-{REQ,FSPEC}-v13/v11` | the v13 round's own outputs, including this reviewer's |
| `docs/_decisions/DECISIONS-review-severity-bars.md` | **+26 lines** — DEC-SEV-03 appended |
| `docs/_decisions/DECISIONS-spec-layer-boundary.md` | **+7 lines** — companion paragraph appended to DEC-LAYER-01 |

The two decision deltas are project-level rules a reviewer is instructed to read at dispatch, so I
read and applied them rather than noting their existence:

- **DEC-SEV-03** (`DECISIONS-review-severity-bars.md:62-84`) is a *demotion* rule: a downstream
  document that makes a layer-owned decision colliding with an enumerated upstream artifact drops
  from High to **Low** provided it names the artifact, states what it ships instead, and raises the
  erratum; it stays High only when the collision is absorbed silently. It can only lower a severity,
  never raise one, and its subject is *downstream* documents (TSPEC, PROPERTIES, PLAN) — not the root
  REQ. Doubly inert here: wrong layer, and all three carried findings are already Low.
- **DEC-LAYER-01's companion** (`DECISIONS-spec-layer-boundary.md:49-55`) only routes the cost DEC-
  LAYER-01 already priced through the DEC-SEV-03 channel. It adds no obligation to the REQ layer and
  moves no finding.

Two consequences, stated rather than inferred:

1. **Nothing can have been broken.** There is no changed section of the REQ for a new finding to be
   about, so this review opens no new finding ids. F-57+ remains unused.
2. **Nothing can have been fixed either.** The three v13 Lows are re-verified below against the files
   they are about — not against v13's prose — and all three are open exactly as v13 left them.

## Prior findings

Each carried finding was re-checked this round against the file it is about, at HEAD.

| ID | Sev | Disposition | Evidence at HEAD |
|---|---|---|---|
| F-54 | Low/Cross-Feature | **Open — unchanged** | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `\| Version \| 1.0 · 2026-08-06 \|`, while the change-control clause that makes an unbumped content change a defect is still the text at `:19` ("Consumers cite this file **at its `Version`**; a content change that is not accompanied by a version bump is itself a defect"). The three REQ citations still pin the unbumped `1.0`: AC-1.5 (`:202`), REQ-CONS-06's preamble (`:448`), the honest-limit line (`:474`). Still Low on DEC-SEV-01's test, re-derived below. |
| F-55 | Low/Local | **Open — unchanged** | §4b still widens ownership across both governed files (`:558-559`) while the classification sentence that follows (`:560-563`) names neither, and the set-equality oracle range still resolves only through the `Version 1.4` pin (`:564-565`). That pin is still decidable: `pdlc-consolidation-vocabularies.md:7` carries `1.4`, `pdlc-advisory-corpus-baseline.md:7` carries `1.0`. §5 (`:585-586`) still describes both files in identical words. |
| F-56 | Low/Process | **Open — measurement unchanged** | `wc -l -c` at HEAD: **637 lines / 61,109 bytes**, identical to v11–v13, against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) and past both soft thresholds `SOFT_LINE_LIMIT=630` / `SOFT_BYTE_LIMIT=55296` (`:47-48`). Margin **331 bytes**, flat across rounds 11→14. |

The dispositions match v13's because the inputs match: neither the REQ nor either governed
constraints file moved. I record that as a re-verification, not a carry-over — every row above was
re-read at HEAD this round, and each cited line was printed rather than recalled.

## Findings

No new findings — there is no changed text in the document under review for a new finding to be
about. The three carried forward are restated so this table stands on its own; ids are never
renumbered across rounds.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-54 | Low | Cross-Feature | The baseline file's content changed under a frozen `Version`, and the clause making that a defect is the paragraph the same commit added, so the file breaches its own rule; the REQ pins the unbumped `1.0` in three places. Fix: `1.0` → `1.1` in the baseline header and repin the REQ's two version-pinned citations. | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7`, `:19`; REQ `:202`, `:448`, `:474` |
| F-55 | Low | Local | §4b's ownership sentence spans both governed files, but the classification sentence and the set-equality oracle range built on it were written for one. Read literally it puts the baseline file's §1 under a row oracle at a `Version` that file does not carry. Decidable today only via the `Version 1.4` pin. Fix: name the vocabularies file in the classification sentence, and add to §5 that the baseline's four owned sections carry no row oracle. | REQ §4b (`:558-565`), §5 (`:585-586`); `pdlc-advisory-corpus-baseline.md:17-19` |
| F-56 | Low | Process | The REQ sits at 61,109 / 61,440 bytes — a 331-byte margin against a warn-only budget; the trend across rounds 9→14 is 387 → 344 → 331 → 331 → 331 → 331. Not a delivery risk: `check-req-size.sh` emits a `PostToolUse` `additionalContext` line and `exit 0` on every path. Filed to keep the headroom visible to whoever lands F-54/F-55 (~44 bytes together, which fit). | Whole document; `pdlc/hooks/scripts/check-req-size.sh:41-42`, `:47-48` |

**Why no finding moved on a fourth no-change round.** Severity is a property of the defect, not of
how many rounds it has survived. I re-applied `DEC-SEV-01`'s test
(`DECISIONS-review-severity-bars.md:24-30`) — "does this leave a downstream author unable to make a
decision today?" — and, this round, checked it against a real downstream author's output rather than
against my own reasoning: the TSPEC (+2555 lines) was authored in this interval on top of exactly
these three open Lows, and none of the five TSPEC review rounds' blocking findings is any of them.
That is direct evidence, not argument, that none blocks a downstream layer.

- **F-54.** A TSPEC or PROPERTIES author transcribing an expected value from the baseline file
  transcribes §1's fate table, §2's absent-at-HEAD facts, §3's ladder or §4's limit. All are
  byte-identical across the diff that broke the version rule, and the file declares itself outside
  any row oracle (`:17-19`), so no expected value is wrong today. A governance self-breach, not
  observable drift.
- **F-55.** The range clause pins `Version 1.4`; only the vocabularies file carries 1.4 (`:7`), and
  the baseline states the answer in its own words (`:17-19`). The oracle's subject is recoverable by
  cross-reading two documents — friction, not a block. The TSPEC landing without tripping on it
  corroborates that.
- **F-56.** A headroom measurement inside a budget that cannot fail a build.

`DEC-SEV-03` (`:62-84`), new since v13, is inert on all three: it demotes findings from High and its
subject is a downstream document colliding with an enumerated upstream artifact. Wrong direction and
wrong layer for anything in this table. No rule in the intervening diff raises any severity.

## Questions

## Positive Observations

## Recommendation

## Verdict

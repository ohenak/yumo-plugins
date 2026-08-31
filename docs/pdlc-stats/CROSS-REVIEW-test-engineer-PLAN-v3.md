# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3 (upstream-cascade confirmation — PLAN bytes unchanged, TSPEC moved)

## Overview

**This is an upstream-cascade confirmation, not a re-review.** PLAN's own bytes are unchanged since
my v2 approval save for one status cell (`T-01` `⬚` → `✅`), which is wave-ledger bookkeeping and
carries no claim. What moved is `TSPEC-pdlc-stats.md`, from the version my v2 anchor pinned
(`sha256:512a9fcf…`) to HEAD (`sha256:a06a6032…`, TSPEC v1.4 → v1.7 across four erratum rounds). The
single question answered here: **does PLAN still hold as approved against TSPEC as it now stands?**

**What the TSPEC delta actually contains** (read from `git diff 628cf244..HEAD --
docs/pdlc-stats/TSPEC-pdlc-stats.md`), and what each item touches in PLAN:

| TSPEC change | PLAN surface it could reach | Held? |
|---|---|---|
| §2.1 `coverageInstrumentation.test.js` row: c8 include-set move corrected from *six → seven* to **seven → eight**; comment arithmetic restated as `REQUIRED_INCLUDES`' four entries + `CAPTURE_SCRIPT_INCLUDE` + three `lib/` modules | PLAN's "Claims verified at HEAD" row for `pdlc/workflows/package.json`; T-24; the anti-drift claim at §Verification | **Yes — PLAN was already right.** I re-measured HEAD: `pdlc/workflows/package.json` `c8.include` holds **seven** `**/`-anchored entries, and `coverageInstrumentation.test.js:260-264` still prints the stale words `six`. PLAN records "seven `**/`-anchored entries" and T-24 says "correcting the stale count words in P9-02's title and comment" **without printing a number**. TSPEC converged onto PLAN's measurement, not away from it |
| §4.3 / §8.3: REQ-STATS-06 (v1.6) versus FSPEC BR-16 (v1.7) now disagree on the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basename; §4.3 implements BR-16 and routes the conflict; AT-17's fourth leg named as the one site where the contested scoping becomes an assertion | T-04 (owns AT-17), T-26 (the `unmeasurable`/`harvested` mutant) | **Yes, with a Low.** PLAN never states AT-17's expected *value* — it delegates to "branch-order conjuncts of TSPEC §4.3 asserted explicitly", so it contradicts nothing. But the re-stamp site is now live and PLAN's row does not name it (F-02) |
| §4.3: `docs/completed/pdlc-advisory-wave-gate/` re-read as a basename *shape*, not a harvested verdict; the directory reports a **measured** ratio (62 `CROSS-REVIEW-*`, 4 out-of-catalogue, 58 grammatical) | T-18's AT-09 real-path leg | **Yes.** T-18 asserts `TSPEC` row = `6` plus four malformed basenames — a *measured* expectation, never `harvested`. I re-measured the archive at HEAD: 62 / 4. TSPEC §7.2's AT-09 row is byte-unchanged this round |
| §1, §6.4, RK-1: sibling-feature document edits re-scoped **outside** the ten co-change sites; §6.4's "four enumerations" renamed "the four enumerations `assertAdditiveOnly` reads" (sites 1–4) | PLAN's ten-row co-change table; T-22 (sibling docs); the batch-10 first-red narration | **Mostly.** PLAN's table has exactly ten rows and excludes the sibling documents, which T-22 owns separately — that is the corrected scoping already. The batch-10 first-red sentence is looser than §6.4 now is (F-01) |
| §5's types survive REQ v1.6's halt withdrawal unchanged; no type, signature, exit code, oracle or code sketch changed in any of v1.4–v1.7 | every test-shape claim in PLAN | **Yes.** PLAN carries no version pins and no type transcriptions, so nothing to re-stamp |

**Scope discipline.** I did not re-derive the batch column, re-check the same-new-file guard, or
re-litigate the AT set-equality — all approved at v1/v2 and untouched by this delta. I re-read only
the PLAN surfaces the TSPEC delta could reach, and I re-measured every HEAD claim those surfaces
rest on rather than trusting either document.

## Batches

_pending_

## Dependencies

_pending_

## Verification

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_

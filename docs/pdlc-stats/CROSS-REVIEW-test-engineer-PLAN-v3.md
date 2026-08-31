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

Nothing in this delta moves a task's ownership, its test file, or the work it names. Two rows deserve
the re-read the delta invites, and one narration line is now looser than its upstream.

**T-24 (`K-3`, the c8 include-set edit) — held, and this is the round's main question.** TSPEC v1.7's
correction is a correction *of TSPEC*, not of PLAN. Measured at HEAD myself, independently of both
documents:

- `pdlc/workflows/package.json` → `c8.include` = seven entries (`orchestrate-dev.js`,
  `orchestrate-queue.js`, `build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs`,
  `scripts/capture-learnings-baseline.mjs`, `lib/loop-session.mjs`, `lib/escalation-view.mjs`).
- `coverageInstrumentation.test.js:264` still titles P9-02 "the include set is exactly the **six**
  modules the feature owns", and the comment at `:260-261` still calls the literal six-member and
  `REQUIRED_INCLUDES` three-entry. Both are stale **at HEAD**, before this feature touches anything —
  exactly what TSPEC v1.7 now says.

PLAN's "Claims verified at HEAD" row reads "seven `**/`-anchored entries" and T-24's instruction is
"correcting the stale count words in P9-02's title and comment" — a *behaviour*, not a transcribed
number. That phrasing is what makes T-24 survive the correction untouched: had PLAN written "six →
seven" the way TSPEC v1.3 did, this cascade would have left a task instructing an implementer to
write a wrong literal. It did not. No finding.

**T-04 (AT-17's four directories) — held, with a Low.** TSPEC §4.3 now carries a live REQ-versus-FSPEC
conflict whose *only* assertion site is AT-17's fourth leg: BR-16 v1.7 says `harvested`, REQ-STATS-06
v1.6 says `measured`, and §4.3 writes the sketch against BR-16 while §8.3 routes the reconciliation
upstream. T-04 owns that leg. PLAN states no expected value for it and points the implementer at
"branch-order conjuncts of TSPEC §4.3", so PLAN is not wrong — but an implementer reaching T-04 in
batch 2 will write an assertion whose expected value is under active dispute, and PLAN gives no
signal to check §8.3 first. One clause on the T-04 row naming AT-17's fourth leg as a re-stamp site
(alongside §4.3's contested paragraph and its BR-16 pin) closes it. **F-02, Low, delta, nonlocal** —
non-gating: the leg still exists, still belongs to T-04, and still has a defined expectation today.

**T-18's real-path legs — held, re-measured.** TSPEC §4.3's re-read of
`docs/completed/pdlc-advisory-wave-gate/` as a *shape* citation rather than a harvested verdict is
the change that could have falsified T-18's AT-09 leg, had that leg expected `harvested`. It does
not: T-18 expects `TSPEC` row = `6` with four malformed `…-REVIEW-v{1,2}.md` basenames — a measured
ratio. I re-counted the directory at HEAD: 62 `CROSS-REVIEW-*` files, of which 4 match the
out-of-catalogue form, so `crossReviews.length` is 58 and the harvested disjunct does not fire,
precisely as TSPEC now records. TSPEC §7.2's AT-09/AT-10/AT-11/AT-13/AT-14b/AT-18 baseline table is
byte-unchanged across this delta, and every one of T-18's literals still matches it.

**T-22 / T-23 / T-25 (the vendoring clusters) — held.** TSPEC v1.5 re-scoped the two sibling-feature
document edits to sit **outside** the ten co-change sites. PLAN's co-change table already has exactly
ten rows and does not include the sibling documents; they are T-22's work under `DEC-STATS-01`'s
`K-7`. The corrected scoping is the one PLAN already encodes.

## Dependencies

_pending_

## Verification

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_

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

**Batch column and dependency edges: untouched by this delta, not re-derived.** The TSPEC delta
changes no seam, no test level, no fixture ownership and no "reds first" mechanism, so no edge in the
PLAN DAG has a new predecessor. The batch arithmetic I checked mechanically at v1 and confirmed
unmoved at v2 still stands.

**One narration line is now looser than its upstream — F-01.** PLAN's batch-10 gate note reads that
on entry to the batch, `loop-distribution.test.js`'s `assertAdditiveOnly` "goes red as soon as the
first enumeration moves", and calls that `K-1`'s expected mid-batch red signal. TSPEC §6.4, as edited
at v1.4/v1.5, now names that trigger precisely: the oracle fires on **the four enumerations
`assertAdditiveOnly` reads** — §2.1's sites 1–4, `prepack.mjs`, `publish-preflight.mjs`,
`fixture-machine.mjs` and `_tspec-packed-set.mjs` — and TSPEC adds, in the same edit, the sentence
"'Four' here is the subset this oracle reaches, not §2.1's ten-site total". It made that edit
*because* the unqualified phrasing was being misread.

PLAN's unqualified "the first enumeration" now reads wider than its upstream: batch 10 also contains
T-24, which moves `package.json`'s `c8.include` — an enumeration in every ordinary sense, and one
`assertAdditiveOnly` does **not** read. An implementer who lands T-24 first and sees green would be
reading a green that PLAN's sentence told them to expect red.

The consequence is bounded, which is why this is Low and not Medium:

- The tasks that move sites 1–4 — T-21 (`prepack.mjs`), T-22 (`_tspec-packed-set.mjs`), T-25
  (`publish-preflight.mjs`, `fixture-machine.mjs`) — are **all** in batch 10 alongside T-24, so the
  red does arrive within the batch whatever the intra-batch order.
- The batch is a green gate measured at its **end**, not per-task, so a transiently-green
  `assertAdditiveOnly` cannot let a partial co-change through.

The fix is one parenthetical on the batch-10 row: name the subset (sites 1–4 / T-21, T-22, T-25) the
way §6.4 now does. **F-01, Low, delta, nonlocal.**

**Batch 9's split gate — held.** T-20's `stats-vendoring.test.js` is still the only permitted red,
still for the single stated reason (no enumeration names `lib/stats.mjs` yet). §6.4's rename of the
four-enumeration subset does not change which oracle is permitted red in batch 9, nor the ordering
argument that puts the HEAD-resident `assertAdditiveOnly` ahead of the new derived oracle.

**T-26's mutation task — held.** TSPEC §6.6's `unmeasurable`/`harvested` mutant and its
single-owner fixture (T-04's `LEARNINGS`-sibling configuration, the only one in which the two branch
orders disagree) are untouched by this delta. The BR-16/REQ-STATS-06 dispute is about which *files*
count as surviving cross-reviews, not about the branch **order** the mutant probes, so T-26's killer
survives either reconciliation outcome.

## Verification

**What I re-measured at HEAD** rather than reading off either document — the confirmation rests on
these, not on TSPEC's or PLAN's narration of them:

| Claim | Command | Result | Verdict |
|---|---|---|---|
| `c8.include` size at HEAD | `python3 -c "json.load(open('pdlc/workflows/package.json'))['c8']['include']"` | **seven** `**/`-anchored entries | PLAN's "seven" row correct; TSPEC v1.7's correction lands on PLAN's existing number |
| P9-02's printed count word | `grep -n 'six\|REQUIRED_INCLUDES' pdlc/workflows/__tests__/coverageInstrumentation.test.js` | title at `:264` and comment at `:260-261` both still print `six`; stale at HEAD | T-24's "correcting the stale count words" is the right instruction and carries no number to go stale |
| AT-09 fixture | `ls docs/completed/pdlc-advisory-wave-gate/ \| grep -c '^CROSS-REVIEW-'` and the out-of-catalogue form | 62 total, **4** out-of-catalogue → 58 grammatical | matches TSPEC §4.3's new measurement and TSPEC §7.2's unchanged AT-09 row; T-18's literal holds |
| PLAN bytes since approval | `git diff 628cf244..HEAD -- docs/pdlc-stats/PLAN-pdlc-stats.md` | one hunk, T-01's status cell `⬚` → `✅` | no claim changed; the confirmation premise is sound |
| PLAN's upstream pins | `grep -n 'TSPEC v1\|FSPEC v1\|REQ v1\|sha256' docs/pdlc-stats/PLAN-pdlc-stats.md` | no matches | PLAN transcribes no upstream version or hash, so no pin went stale in this cascade |

**Falsifiability of the confirmation itself.** The way this confirmation could be wrong is if PLAN
had transcribed a number TSPEC has now corrected. I looked for exactly that, and the only candidate —
the c8 include-set count — resolves the other way: PLAN measured seven, TSPEC printed six, and v1.7
moved TSPEC to seven. Every other count PLAN carries (the ten co-change rows, `4 + 15 + 5 + 1` →
`4 + 15 + 6 + 1`, the `5` → `"six"` word map, the four post-mortems' `D, F, I, T` sequence, the DoD
`2`, the `TSPEC` rows `6` and `13`) sits in a TSPEC section this delta did not touch, and I spot-read
§7.2's baseline table to confirm it is byte-unchanged.

**One inherited observation, recorded and not gating.** PLAN's T-23 counts **nine** assertion edits on
`loop-distribution.test.js` while TSPEC §2.1's row for the same file still says **eight**. This is
not a delta of this round — it predates my v2 approval, where I credited PLAN's ninth edit
(P7-02's `postFixMembers` concatenation and `assertAdditiveOnly`'s hard-coded message) as the fix for
my round-1 F-09. PLAN is the *superset* and names the extra edit with its rationale, so no coverage
is lost by the disagreement; it is a transcription divergence in the upstream, not a PLAN defect. I
record it here so a later reader does not read it as this cascade's damage. **F-03, Low, inherited,
nonlocal.**

**DoD checklist and coverage floor — unchanged.** T-24 still carries the per-file obligation
(`lib/stats.mjs` branch coverage ≥ 85, remedied by adding tests inside the batch and never by
lowering the floor), and the batch-10 green gate still measures it at batch end. The TSPEC delta
touches neither the floor nor the gate command.

**Verdict on the one question asked.** PLAN is still a faithful compression of TSPEC as it now
stands. Every routed item in the TSPEC delta either lands on a PLAN surface that already encoded the
corrected reading (the c8 count, the ten-site scoping, the AT-09 measured expectation) or on a
surface PLAN deliberately delegates upstream rather than transcribing (AT-17's expected value). No
High finding, delta or inherited, is open. The two Lows are worth folding in before batch 10 and
batch 2 respectively, and neither blocks the wave.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | nonlocal | Batch-10 gate note says `assertAdditiveOnly` reds "as soon as the first enumeration moves"; TSPEC §6.4 now scopes that trigger to the four enumerations the oracle *reads* (sites 1–4), and batch 10 also contains T-24's `c8.include` edit, which it does not read | PLAN §Batch gates, batch 10 |
| F-02 | Low | delta | nonlocal | T-04 owns AT-17, whose fourth leg is now the single assertion site of a live REQ-STATS-06 v1.6 versus FSPEC BR-16 v1.7 dispute (TSPEC §8.3, second open erratum); the row gives the implementer no signal that its expected value re-stamps if the reconciliation lands the other way | PLAN §Batches, T-04 |
| F-03 | Low | inherited | nonlocal | T-23 counts nine assertion edits on `loop-distribution.test.js`; TSPEC §2.1's row for the same file says eight. PLAN is the superset and names the extra edit, so no coverage is lost — a transcription divergence predating this round | PLAN §Batches, T-23 |

FINDING: Low | delta | nonlocal | PLAN §Batch gates, batch 10 | "reds as soon as the first enumeration moves" reads wider than TSPEC §6.4's edited scope (the four enumerations `assertAdditiveOnly` reads, sites 1-4); T-24's `c8.include` edit sits in the same batch and does not trigger it, so an implementer landing T-24 first sees a green PLAN told them to expect red. Bounded: T-21, T-22 and T-25 are all in batch 10 and the gate is measured at batch end. Fix: name the subset the way §6.4 now does.
FINDING: Low | delta | nonlocal | PLAN §Batches, T-04 | AT-17's fourth leg is now the only place TSPEC's live REQ-STATS-06 v1.6 vs FSPEC BR-16 v1.7 dispute becomes an assertion (§4.3 writes it against BR-16, §8.3 routes the reconciliation). T-04 states no expected value so it contradicts nothing, but it should name the leg as a re-stamp site so the implementer checks §8.3 before writing the expectation.
FINDING: Low | inherited | nonlocal | PLAN §Batches, T-23 | T-23 says nine assertion edits on `loop-distribution.test.js` where TSPEC §2.1 says eight. Predates this cascade; PLAN is the superset and names the ninth edit with its rationale, so it costs no coverage — recorded so it is not misread as this round's damage.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

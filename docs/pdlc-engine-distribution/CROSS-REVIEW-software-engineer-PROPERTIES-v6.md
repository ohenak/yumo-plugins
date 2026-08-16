# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.8)
**Date:** 2026-08-16
**Iteration:** 6
**Scope:** Delta re-review against my v5 review (`REVIEWED-COMMIT: f09ac6e7`). Decision
freeze in force: only a defect this delta introduced, or a load-bearing claim false at
HEAD, can block. Everything else is recorded, not gating.

## 1. The delta

`git diff f09ac6e7..HEAD -- …/PROPERTIES-…md` is 10 insertions / 5 deletions across four
hunks, landed by `59548390` (§4 prose) and `3a5ca4b6` (v0.8 changelog + monotonic swap).
The `0.7` row was already present at `f09ac6e7`'s tree and shows in the range only because
the swap re-ordered its neighbours.

| Hunk | Change | My prior finding it closes |
|---|---|---|
| `:12` | Version cell `0.6` → `0.8`, date `2026-08-16` | — |
| `:19-25` | 0.6 row moved below 0.5; 0.7 and 0.8 rows appended | **F-02 (v5)** |
| `:152` PROP-PUB-1 | premise re-worded count-free: "the whole set as §5.1's table stands, whatever its row count" | — (v0.7 sweep) |
| `:233` PROP-GATE-5 | now names FSPEC §5.1 **row 6** and scopes the discrimination to PROP-PUB-6's `pr-tests.yml` rows | — (v0.7 sweep) |
| `:322-327` §4 prose | "the triple … is AT-1.6's" → names AT-1.6's three members and states **PROP-LAUNCH-5 alone** is its carrier | **F-03 (v5)** |

No property added, removed or re-scoped; no oracle, carrier, level, category or trace cell
changed beyond the two premise re-wordings above.

## 2. Prior findings — state at HEAD

| Prior finding | Severity | State | Verified how |
|---|---|---|---|
| **F-01** Upstream cell pins PLAN v0.8 | Low | **Open, and now further behind.** Cell (`:5`) still reads `PLAN … (v0.8)`; PLAN's header reads **0.15** (`PLAN:12`) | Read both cells directly; see §3 for the mechanical check that nothing derived is stranded |
| **F-02** Changelog non-monotonic (0.6 above 0.5) | Low | **Closed.** Table now reads 0.1 → 0.8 in order (`:18-25`) | Read the region; the 0.6 row's text is byte-identical to v0.6's, so the swap moved no content |
| **F-03** §4 says PROP-LAUNCH-4's state (b) reports the triple that "is AT-1.6's" | Low | **Closed, and correctly.** `:325-327` names the three members and pins the carrier | Members transcribed match FSPEC AT-1.6 verbatim (`FSPEC:719-722`: engine version, declared range, installed plugin version); carrier matches §4's own AT-1.6 row (`:287`, `PROP-LAUNCH-5 | T15, T46 | version-doctor.test.js`) |

Two of three closed; the third is unchanged bookkeeping.

## 3. New-issue scan over the delta, grounded at HEAD

**Both re-worded premises are true at HEAD, checked against the workflow files, not the docs.**

- FSPEC §5.1's table has **six** rows, row 6 being `fixture-machine.yml` with rendered name
  `Fixture machine (install/upgrade, launcher, container, two-repo)` (`FSPEC:465`-region).
  That string is the job's authored `name:` at `.github/workflows/fixture-machine.yml:43`,
  and the file is `pull_request`-triggered (`:18-19`), so it really is a PR-gate member —
  PROP-GATE-5's "row 6" claim is exact, not approximate.
- PROP-PUB-6's and PROP-REGR-2's **"five rendered job names"** for `pr-tests.yml` remain
  correct and were deliberately left alone: that file has exactly five jobs — `unit-tests`,
  `engine-tests`, `artifact-freshness`, `fresh-clone-bootstrap`, `script-syntax`
  (`pr-tests.yml:27, 83, 117, 143, 201`). The v0.7 edit's split — whole-table premise for
  PROP-PUB-1, file-scoped set for PROP-PUB-6 — is the right cut, and it keeps the
  can't-both-pass-by-editing-one-file discrimination PROP-GATE-5 exists for.
- PROP-PUB-1's count-free premise is the stronger form: a further widening of §5.1 cannot
  re-open this defect. That is a genuine fix to the *class* of finding, not just its instance.

**No oracle degraded by the re-wordings.** PROP-PUB-1 still asserts a publish count `=== 1`
plus the recorded version (not "a publish happened"); PROP-PUB-6 still asserts the two
set-equalities with per-job matrix expansion and named `unexpandable` verdicts, each with its
own fixture (`:158`, `:413`); PROP-REGR-2's byte-identity is still paired with PROP-PUB-6's
positive set-equality over the same file (`:240`, `:412`), so neither negative stands alone.

**Set-equality re-verified mechanically, not asserted.** Extracted every `AT-` id from §4's
table and from PLAN §2.1 and diffed the sets: **35 ids each side, symmetric difference
empty** — this holds despite PLAN having moved v0.9 → v0.15 in the interval. Same method on
the two other transcription surfaces: every `T\d\d` task id named anywhere in PROPERTIES
appears in PLAN §2's task table, and every test/workflow/script filename named in PROPERTIES
appears in PLAN. All three checks come back empty. The stale Upstream pin is therefore
exactly what F-01 said it was — a wrong version number that is not wrong about anything
derived.

**Delta hazards specific to this review's bar:** no implementation echo entered (the AT-1.6
member list is transcribed from FSPEC's prose, not derived from `version-doctor` output); no
absence-only oracle was created (PROP-GATE-5's "outside PROP-PUB-6's set" is a scoping
statement, and the positive — row 6 is a required check whose red means DoD unmet — sits in
the same clause); no enumerated contract lost its set-equality.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Local | *(Carried forward from rounds 4 and 5, unaddressed; not raised as new.)* The Upstream cell pins `PLAN-pdlc-engine-distribution.md` **(v0.8)**; PLAN's header reads **0.15** at HEAD (`PLAN:12`). Every other pin in the cell is exact — REQ v0.11, FSPEC v0.7, TSPEC v0.12, DECISIONS v0.3. Nothing derived is stranded: §4's 35-row set-equality against PLAN §2.1 re-verified empty this round, and every task id and filename this document names still exists in PLAN. The cost is to DEC-ERR-01's re-grounding step, which diffs `Version` cells to decide what to absorb: a seven-version gap read as a no-op is a false negative there. Re-pin to v0.15 whenever this document is next opened | §1 Upstream cell, `:5` |

No High. No Medium. One Low, carried, cosmetic-plus-bookkeeping.

DEFERRED: Re-pin §1's Upstream cell to PLAN v0.15 (and add the 0.9 changelog row) at the next edit of this document — not opened for this alone under freeze.
DEFERRED: PROP-GATE-5's "sees six workflows where it saw five" says *workflows* where `statusCheckRollup` returns *checks*; pre-existing wording, not delta-introduced.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | *(Carried from round 5, still open, still not a defect here.)* The two TSPEC errata this document is explicitly conditional on — `node.below-floor`'s registration (§9 Q-1, PROP-CAT-2 / PROP-CAT-4) and the fixture-machine legs' home (§9 Q-2, PROP-GATE-5) — gate T45 and T50. Sequencing question for the orchestrator: discharged in a TSPEC edit before the first wave, or are those tasks dispatched with the conditionality live? The properties state the conditionality correctly either way |

## 6. Positive Observations

- **Both of my round-4/5 findings were closed by the edit that was cheapest to verify.** The
  changelog swap moved no text — I diffed the 0.6 row's bytes against v0.6 and they are
  identical — so the fix carries zero risk of a content regression smuggled in as formatting.
- **The §4 prose fix chose the stronger repair.** It would have been enough to delete the
  offending sentence; instead it kept the shape statement (which a reader genuinely needs) and
  added the carrier disclaimer, so the paragraph now answers the question it previously
  provoked. Prose and the `AT-` table give one answer, and the answer is checkable from the
  table alone.
- **The v0.7 sweep generalised its own premise.** Replacing "five-row" with "whatever its row
  count" is the difference between fixing a citation and retiring a defect class; the next
  widening of FSPEC §5.1 will not strand PROP-PUB-1 again. The changelog is also honest about
  why CI never caught it — PROP-PUB-1's carrier drives a stub that configures its own gate
  members rather than reading §5.1 — which is exactly the kind of note that saves the next
  reader an hour.
- **Set-equality survived seven upstream PLAN versions untouched.** PLAN moved v0.8 → v0.15
  while this document sat still, and the 35/35 diff is still empty. That is evidence about
  construction, not luck: §1's reading rules give each fact exactly one upstream home, so
  rewording in one home cannot silently contradict a transcription here.

## 7. Recommendation

**Approved with minor changes**

The delta closes two of my three prior findings, introduces no new assertion, and both
re-worded premises check out against the shipped workflow files at HEAD — six rows in FSPEC
§5.1 with row 6 matching `fixture-machine.yml:43`, five jobs in `pr-tests.yml`, and the
positive/negative pairings intact. §4's 35-row set-equality against PLAN §2.1 re-verified
mechanically and empty. One Low remains, the stale PLAN version pin carried from round 4;
it strands nothing and is a one-line sweep at the next edit. No High open. Nothing in this
round meets the freeze bar for blocking.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

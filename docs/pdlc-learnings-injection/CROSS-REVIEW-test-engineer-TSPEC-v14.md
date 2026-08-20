# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.9)
**Reviewed range:** `4e16392d..HEAD` (5 commits, +138 −11)
**Date:** 2026-08-20
**Iteration:** 14 (delta re-review, DECISION FREEZE in force)

## Overview

The four items I raised in v13 are all landed, and each landed with the measurement behind it
rather than a bare assertion. I re-derived every factual claim the delta adds rather than reading
it.

- **F-01 (High, inherited) — closed.** §I.3's `extractInjectableMaterial` JSDoc now says
  `sections` is "a SUPPORTING assertion, NOT AT-11's operand", and §T.5 gains a three-row oracle
  table that states AT-11's three FSPEC conjuncts over the **rendered block**, names the mutation
  that reds each, and keeps `sections[]` as an additional equality. I checked the conjuncts against
  FSPEC's AT-11 (`FSPEC §Acceptance Tests`, AT-11's third sentence): "the set of section names
  appearing in its block material **equals** BR-6's five injected names in priority order, and the
  Approval Record's distinctive fixture text is absent **while** all five injected sections' texts
  are present". All three are now owned, in one test, in `learningsBlock.test.js`. The absence
  conjunct is explicitly paired with the positive on the same instrument ("so an all-empty block
  cannot pass the absence half") — the DC-03 pairing bar, satisfied by construction rather than by
  reminder.
- **F-04 (Medium) — closed.** §D.3 gains *How the taken extents are assembled into `material`*: a
  three-step rule (normalise each extent by dropping trailing blank/whitespace-only lines and the
  trailing newline; join in priority order with `"\n\n"`; cut once over the assembled string), plus
  the arithmetic consequence — `bytes` = sum of normalised section lengths + 2 per join. §D.5
  restates the same formula where the hand-computed literals live. A fixture author now has a
  procedure, not a judgement.
- **F-02 (Low) — closed.** Rule 2's E-33 argument is narrowed to substring/token-overlap/fuzzy
  matching (where it holds), and the prefix candidate is rejected separately on its own ground
  (it admits `## Process`, `## Open Items`, `## Cross-Feature` as full sections and needs a
  same-priority tiebreak nobody wants to own). Correct on both halves now.
- **F-03 (Low) — closed as ERR-8.** The upstream sequencing gap is recorded against FSPEC with a
  suggested fix, and §D.5 states the rule the implementer follows. I re-verified it at HEAD:
  FSPEC Step 5 item 15 drops on the *structural* condition and applies the count bound, item 16
  extracts "for each taken document" — so the zero-bound drop is unobservable for count-cut
  documents if the procedure is read literally. ERR-8's description is exact.

**Repository claims in the delta, re-measured.** Every one holds:

- `pdlc/workflows/__tests__/helpers/learningsFixtures.js` exists; `buildLearningsDocument`
  (`:92`) ends `return lines.join("\n")` (`:112`), so §D.3's claim that fixture text is
  `\n`-joined is true of the real helper, not just of intent.
- The `\r\n` claim: `git grep -Il $'\r' -- ':(glob)docs/*/LEARNINGS-*.md'
  ':(glob)docs/completed/*/LEARNINGS-*.md'` exits 1 with no match at HEAD — no corpus document
  carries `\r\n`, exactly as §D.3 states, and the command it cites is the command that proves it.
- The Approval-Record marker conjunct is constructible with the real helper: `renderSection`'s
  `section.body` is documented as "literal body text" (`learningsFixtures.js:60`) and
  `spec.extraLines` appends "raw text ... verbatim after the last section" (`:88-89`), so the
  distinctive marker §T.5 asks for needs no new fixture affordance.
- `DC-14` is real and says what the delta quotes: *"An oracle never sources its expected value from
  the code under test"* (`docs/_constraints/DOMAIN-CONSTRAINTS.md:379`); `DC-03` is *"Every
  load-bearing assertion is falsified before it is trusted"* (`:79`).
- Upstream is unchanged this round, as the changelog claims: no commit touches
  `FSPEC-pdlc-learnings-injection.md` or `REQ-pdlc-learnings-injection.md` in `4e16392d..HEAD`.

Nothing the delta touched broke a section I had previously approved. What it did do is make
`sections[]` **bound-dependent** — that is the right definition, and it is the one place where a
neighbouring obligation (T-O-6's corpus conjunct) was not carried along with the change. That is
F-01 below, Medium and non-gating.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict

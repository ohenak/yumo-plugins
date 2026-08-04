# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** Delta re-review of commit `1950734` (v1.3 → v1.4) against my v4 confirmation
(`CROSS-REVIEW-software-engineer-FSPEC-v4.md`, which reviewed `3bbf934`).

## 1. Delta under review

`git diff 3bbf934 HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` returns exactly three
hunks:

| Locus | Change |
|---|---|
| Header table (line 16) | version `1.3` → `1.4` |
| §12.1 **D-6** (line 835) | the disabled-run created-file baseline is restored to `26c3f1c` — the "feature branch's pre-feature base / fork point" wording introduced by erratum `3bbf934` is withdrawn in full, along with its justifying clause ("that pin … may sit ahead of the branch's pre-feature base") |
| §10-adjacent **T-10-3** (line 855) | the paired oracle follows D-6 back to `26c3f1c`; the "not §2's citation pin" clause is dropped |

Nothing else moved. Erratum items 2 (§4.1 step-7 / A2-6 vs R-2 ordering) and 3 (§5 C-2 gated on the
tier resolving to enabled) — both of which I confirmed resolved in v4 — are untouched by this diff
and remain exactly as approved. So this is a single-issue delta: **is the withdrawal correct?**

## 2. Correction of my own prior finding

This section exists because the withdrawn erratum cited *my* v3 questions as corroboration, and my v4
confirmation endorsed it on the strength of a git-history claim I made and did not verify. I am
retracting that claim.

**What I wrote (v4, disposition table, row 1):** "the pin is not an ancestor of
`feat-pdlc-advisory-tier` (the branch forks at `7cdfbb0`)."

**What is actually true at HEAD:**

```
git merge-base --is-ancestor 26c3f1c HEAD          ⇒ true
git merge-base HEAD main                           ⇒ 6a4548d
git merge-base --is-ancestor 26c3f1c 6a4548d       ⇒ true
git log --oneline 26c3f1c..6a4548d | wc -l         ⇒ 3
```

`26c3f1c` is an ancestor of this branch **and** of its fork point from the default branch. The fork
point is `6a4548d`, not `7cdfbb0`. The three commits between the pin and the fork point are
`dd13490` (branch-guard rev-parse re-observation), `d186bfa` (spec completeness gate by containment)
and `6a4548d` (distribution-manifest version stamp) — none of them adds, removes, or reroutes a
file-creating path in the pipeline, so the created-file set is identical at both commits.

My v3 Q-08/Q-09 and my v4 endorsement were therefore wrong on the fact, and the erratum built on
them was wrong on the same fact. `POSTMORTEM-T-pdlc-advisory-tier.md:119-131` reaches the same
conclusion independently and by the same commands. The withdrawal is a correction of my error as
much as of the author's.

## 3. Verification of the restored baseline

The erratum's load-bearing premise was that `26c3f1c` *predates* Phase PUB's file-creating path
`raisePrAndVerifyCi`, so a disabled branch-HEAD run would create files the baseline run does not.
I checked the pinned tree directly rather than reasoning from commit subjects:

```
git show 26c3f1c:pdlc/workflows/orchestrate-dev.js | grep -n raisePrAndVerifyCi
  6222: export async function raisePrAndVerifyCi({
  6875:   _raisePrAndVerifyCi: raisePrAndVerifyCiFn = raisePrAndVerifyCi,
  8250:   // … The poll-timing logic lives in raisePrAndVerifyCi.
  8257:   const pubResult = await raisePrAndVerifyCiFn({
```

Four occurrences, the definition among them — the premise is false. At HEAD the same symbol sits at
`pdlc/workflows/orchestrate-dev.js:6337` (definition), `:6990`, `:8365`, `:8372`: the same four
sites, moved by intervening churn, not added since. So Phase PUB's file-creating path is on **both**
sides of D-6's equality at `26c3f1c`, which is precisely the condition the erratum claimed was
violated.

Combined with §2's ancestry finding — `26c3f1c` is an ancestor of the fork point, and the three
commits between them touch no file-creating path — the restored baseline is sound on both counts:

| Requirement of a valid D-6 right-hand side | At `26c3f1c` |
|---|---|
| Carries every pipeline change already merged to the default branch that creates files | yes — `raisePrAndVerifyCi` defined at `26c3f1c:6222`; `26c3f1c` is an ancestor of `main` |
| Carries none of this feature's changes | yes — it is an ancestor of this branch's fork point `6a4548d`, so no branch commit is in it |
| Is not produced by running the system under test | yes — D-6 still says "observed once and transcribed into the test, never re-derived by running the code under test" |

The restored text also keeps the two properties I care about most in this oracle, unchanged from the
version I approved at v3: the expected value is a **transcribed literal**, not a re-derivation (no
implementation echo), and T-10-3 asserts **set equality** — "equals, element for element … any file
created outside that literal set fails the test, whether or not this feature named it" — not
containment, so a file the feature adds silently, or a baseline file it drops, both go red.
`TSPEC:1213-1227` independently reaches and implements the same baseline (fixture
`__tests__/fixtures/created-files-26c3f1c.json`, hand-reviewed, provenance in its header), so the
FSPEC and the TSPEC now agree again — the erratum had put them in conflict.

## 4. Non-regression check

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

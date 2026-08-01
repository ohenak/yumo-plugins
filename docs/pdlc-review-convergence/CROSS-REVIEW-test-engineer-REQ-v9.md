# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 9
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v8.md` (baseline `af5359c`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `8c198e6`, clean.

## 1. Delta scan

```
git rev-parse af5359c:docs/.../REQ-pdlc-review-convergence.md → f86d9a1…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → e7b4dc6…
git diff --stat af5359c HEAD -- …/REQ-…md → 158 insertions(+), 41 deletions(-)
bytes: 268,264 → 288,942   (+20,678)
```

The revision is v1.6 → v1.7 and it answers round 8 from both panels, across ten document commits
(`d574b35` … `8c198e6`). Changed sections, and the only ones scanned below: the header (Cross-Reviews
row, the version cell, the new v1.7 revision note, the v1.6 note's counting bases), §5 (the *reset
region* row's repair preference, the new **phase refusal** meanings row, the S-16 row's *line* wording
and its one-notice rule, the S-17 row's two corrected pointers), AC-1.4's *refusal is not a halt*
paragraph (the phase-refusal naming and the ❌-row / queue-row scoping), AC-1.5(4) (the *only effect*
bullet's scoping, the *returns* bullet's termination semantics, the per-reason repair table's
correct-over-delete preference and its arithmetic paragraph, step 4's one-notice rule and its new
**unconditional** paragraph), AC-1.5(5) clause 5's re-flow, AC-3.2 (the approval-refusal naming and the
new *what a garbled range costs is a sequence* paragraph), AC-3.5's closing paragraph, AC-4.7 row B's
`round` cell, §6 (the S-16 and S-17 rows), §9 (R-5 widened, R-9 extended to rounds 6–7), O-10 (the
counts-mismatch bullet and the S-17 bullet), §10.11's lead-in, and new §10.12. Sections that did not
change — §1–§4, AC-1.1–1.3, AC-1.5(1)–(3), AC-2 in full, AC-3.1, AC-3.3–3.4, AC-3.6–3.7, AC-4.1–4.6,
AC-5, AC-6, §7, §10.1–§10.10 — are not re-litigated, except where a changed section is stated *over* one
of them: §6's `WINDOW-START:` row (`:2142`, unchanged) is read below as the receiver of AC-1.5(4)'s
widened repair set, because the widened text is stated against the exemption that row carries.

Growth into this round is +20,678 bytes. Two of the changes are `new-mechanism` under AC-4.2 rather
than clarification — step 4's refusal is newly **unconditional** (a rule widening, not a restatement),
and a phase refusal now has stated invocation-level consequences (❌ row, terminate, queue row
`halted`) that no prior version asserted. That is six consecutive `new-mechanism` rounds; R-9 carries
the observation and I do not re-file it.

## 2. Disposition of round-8 findings

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict

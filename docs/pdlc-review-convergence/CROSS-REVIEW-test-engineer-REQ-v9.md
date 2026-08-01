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

Three of mine were open (0 High, 1 Medium, 2 Low). **All three are resolved**, each checked against the
document rather than against §10.12's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The universal is scoped exactly as asked: O-10's counts-mismatch bullet now reads *"**no** window granted on that entry, **and none on a later entry that has not performed the sanctioned repair**"*, with the scoping reason stated inline (*"because AC-1.5(4) now states a repair for this reason and the recovery leg below asserts that it works"*). The recovery leg is then restated as the refusal leg's **mutation pair** — *"an implementation that refuses permanently fails the recovery leg, and one that grants a window on a corrupt region fails the refusal leg, so neither leg is green on both"* — which is the falsifiability property the bullet lacked, not merely the removal of a contradiction. The revision went one step further than the finding required and sequenced the recovery leg with **two** clearances per my Q-14, naming the arithmetic (`H = A = 0` ⇒ the gate's `A < H` conjunct is false ⇒ the re-creating halt strips the marker again). A PROPERTIES author can now build both legs from the bullet alone. |
| F-02 | Low | **Resolved** | All four statements say *line*. §5's S-16 row: *"the offending **line** — the whole line as it appears in the region, not the value alone"*; AC-1.5(4) step 4: *"the offending **line**"*; the specimen is unchanged; and §6's row no longer restates the parts at all — it points at §5's specimen (*"the specimen is §5's S-16 row and is not repeated here, so the two homes cannot drift apart again"*), which removes the drift channel rather than re-synchronising it. That is the better of the two fixes available and it was not the one I proposed. |
| F-03 | Low, Cross-Feature | **Resolved.** Both halves | The *"costs one round"* claim is gone, replaced by AC-3.2's new **sequence** paragraph, which states the whole cycle (refusal ⇒ `disposition-missing` ⇒ an optimizer dispatch against feedback naming no document defect ⇒ a plausible byte-identical revision ⇒ AC-2.8's zero-delta halt attributed to the author ⇒ clearance ⇒ the same dispatch again) and names the two properties that make it survivable — the diagnostic repeats under one name, and the cap is absolute. O-10 asks for **two** consecutive garbled dispatches with the reason stated (*"an obligation that asserts only the single round is green against an implementation that never converges"*). The AC half is fully resolved. The O-10 half is resolved as to *count* and defective as to *sequencing* — F-03 below, a new finding in the new text, not a carry. |

Mechanical fixes MF-20 (§10.11's counting bases), MF-21 (AC-4.7 row B's gloss scoped to a mid-window
refusal, with the exhausted-branch case named as the one where the gloss is false), MF-22 (§5's two
S-17 pointers now resolve — I checked both: *"AC-3.2's receive-side bullet for the range"* is the bullet
that exists, and *"AC-3.2's `## Disposition` receive-side table, first row"* is `:1470`) and MF-23 (the
re-flow) are applied; MF-23 with one residue recorded as MF-27 below. Q-13 and Q-14 are both answered
in the document rather than only in §10.12 — Q-13 in step 4's new *unconditional* paragraph, Q-14 in
O-10's recovery leg. **Q-13's answer is where this round's first finding is**: the widening is stated
correctly and the reason given for it is false on a reachable branch.

**MR-08 is answered, and I verified the answer against the shipped code rather than accepting it.** The
document asserts that a phase refusal terminates on step G's path and that the shipped `orchestrate-dev`
halt path therefore rewrites the queue row to `halted` and commits it. At the working tree: step G's
gate throws `haltError` (`pdlc/workflows/orchestrate-dev.js:4178-4184`, `if (gate.status ===
"unresolved")`, literal `Refused — unresolved POSTMORTEM at`), and the halt catch calls
`recordHaltFn({ feature: featureName, status: "halted" })` (`:4838-4841`). So a refusal that terminates
the way step G does does reach the queue write, and the document's claim holds. Note that **not** every
`outcome: "halted"` return does — the entry-validation halts at `:4225-4293` call `buildFinalReport`
directly and never touch `recordHaltFn` — so the claim is true *because* the refusal is stated as
step-G-shaped, and it would be false of a literal early `return`. That is exactly the distinction
AC-1.5(4) now draws, so the AC is right; it is right without a citation, which is MF-25.

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict

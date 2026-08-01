# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 6
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v5.md` (baseline `4f5be4f`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `fb9ac66`, clean.

## 1. Delta scan

```
git rev-parse 4f5be4f:docs/.../REQ-pdlc-review-convergence.md → c9343be…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → 97682c5…
git diff --stat 4f5be4f HEAD -- …/REQ-…md → 342 insertions(+), 131 deletions(-)
bytes: 178,410 → 209,953   (+31,543)
```

The revision is v1.3 → v1.4 and it answers round 5 from both panels. Changed sections, and the only
ones scanned below: the header (Cross-Reviews row, the *Citation baseline* row's new re-verification
paragraph, the v1.4 revision note), §5 (*current window*, the new **reset region** entry, *zero-delta*
restated over `N > W`; three durability rows rewritten and one added; the catalogue lead-in now
**fourteen**; the kind ordering; the `HALT-REASON:` paragraph; new **S-12, S-13, S-14**), AC-1.4
(rewritten — two clauses, the strip, the loop-maintained region), AC-1.5(4) (rewritten over `H`/`A`
plus the four-step ordered algorithm), AC-1.5(5) (rewritten — `WINDOW-RESUMED:`, the three-row table
with its new third column), AC-2.6's lead-in, AC-2.7 (new duplicated-`VERDICT:` row plus its
paragraph), AC-2.8 (row 4 restated over `N ≤ W`, the report-row paragraph, the S-11 clearance
paragraph, the digest citations), AC-3.1 (restated over windows, plus the new justifying paragraph),
AC-3.2 (*Given* and clause 1 scoped to the window, plus the new paragraph), AC-3.4 steps 1–5 and the
stopping-scan paragraph, AC-4.1 step 1 and the first-round-of-a-window paragraph, AC-4.5's *Given*,
AC-4.7's `growth-bytes` / `classification` cells and the AC-2.8 halt-row paragraph, §6 (four new
rows, `DOC-SHA256:`'s corrected citations), N-4, O-5, O-9(d), O-10 (bulleted, nine new obligations),
O-12, R-9, and new §10.9 plus §10.8's closing convention note. Sections that did not change — §1–§4,
AC-1.1–1.3, AC-2.1–2.5, AC-3.3, AC-3.5–3.7, AC-4.2–4.4, AC-4.6, AC-5, AC-6 — are not re-litigated,
except where a changed section is stated *over* one of them: AC-1.1's cap, AC-2.1's window scoping
and AC-2.2's `; `-joined `HALT-REASON:` sentence are read below only as the receivers of the new
`H`/`A` accounting and of §6's new rows.

Growth into this round is +31,543 bytes — `new-mechanism` under AC-4.2, and under AC-3.1 that would
escalate **this** round to the full panel, which is what it got.

## 2. Disposition of round-5 findings

Seven were open (3 High, 3 Medium, 1 Low). **All seven are resolved**, each checked against the
document — and, where the finding was about the codebase, against `9486c81` — rather than against
§10.9's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-1.5(5) now writes `WINDOW-RESUMED: {W}` (S-14) on the S-11 path, and AC-1.5(4) counts `H` (halts) against `A` (`WINDOW-START:` + `WINDOW-RESUMED:`). I re-traced the banking scenario end to end: S-11 halt ⇒ `H=1, A=0`; clearance ⇒ `WINDOW-RESUMED: 1` ⇒ `A=1=H`; the later S-4 halt ⇒ `H=2, A=1` **with the `RESOLVED:` line stripped by AC-1.4**, so re-entry is refused until the operator clears again. The free window is gone, in both the direct and the deferred form. The mechanism is also *better* than the paired-line fix I proposed: counting the loop's own halts rather than the human's marker sidesteps `parseResolvedMarker`'s single-value contract entirely, which my proposed `R`/`S`-plus-`WINDOW-RESUMED:` fix did not. |
| F-02 | High | **Resolved** | AC-1.4 clause 2 strips any prior `RESOLVED:` line on every halt that finds an existing post-mortem, so the marker cannot outlive the halt it cleared. I verified the three shipped readers the paragraph cites at the baseline: `parseResolvedMarker` (`:953`, `values.length > 1 ⇒ duplicated` at `:961`), `checkPostmortem` (`:2440`, `:2446-2447`) and the step-G refusal (`:3895-3901`, literal *"Phase … refused: unresolved POSTMORTEM at …"*). Both failure directions the finding named — fail-open on one preserved marker, permanent `duplicated` on two — are closed, and N-4 is amended rather than left claiming the marker is "untouched". |
| F-03 | High | **Resolved** | AC-3.1 is restated over windows: round `W` is the full panel, `N > W` is the verifier. AC-3.2's *Given* is now `N > W` and clause 1 is scoped to *"every prior blocking finding **of the current window**"*, which makes the `## Disposition` content derivable on every round a verifier actually opens on. AC-4.1 step 1 is gated on `N > W`; AC-4.5's *Given* follows; §5's *current window*, AC-2.6's lead-in and AC-4.7's two cells all agree. The reset-without-revision path now reads: AC-2.8 row 4 not evaluated, no growth measured, **full panel**, and the following round's zero-delta test compares against round `W`'s own `DOC-BYTES:` — so a still-unrevised document halts at `W+1`. That is option (a) of the fix I proposed, taken whole. |
| F-04 | Medium | **Resolved** | AC-1.5(4)'s table is replaced by a four-step ordered algorithm — collect, validate every line, any failure ⇒ `W = 1`, else the greatest. My round-5 counter-example (`WINDOW-START: 4` then `9`, highest round 6) now has exactly one answer, and it is an O-10 bullet. I also checked the new `WINDOW-RESUMED:` validity clause against the reachable regions: repeated `WINDOW-RESUMED: 1` from consecutive S-11 halts is valid (the rule is positional — *"equal to the greatest `WINDOW-START:` **before it**, or 1 if there is none"*), which is the case a naive "strictly increasing" rule would have bricked. |
| F-05 | Medium | **Resolved, and verified exhaustively rather than by sample.** | I extracted every `orchestrate-dev.js:{line}` citation in the document (42 distinct locators) and read each at `9486c81`. All resolve, including the five v1.3 got wrong: `sha256Hex` `:696`, `canonicaliseForDigest` `:615`, its JSDoc `:600-614` (the cited literal is at `:605`, inside the block), `approvalHashOf` `:797`, and the post-mortem prompt as `reviewLoop` (`:1623`) / `postmortemPrompt` (`:1725-1730`, literal `` `Write ${postmortemPath}.` ``). The fabricated `writePostmortem` is gone from AC-1.4, O-9(d) and §10.9. Spot-checks of the older §4 rows also hold (`:52` `MAX_REVIEW_ROUNDS = 5`, `:393` `parseVerdict`, `:569` `scanLines`, `:1436` `selectMode`, `:1915` `approvalAnchorPreCount`, `:1934` `appendApprovalAnchors`, `:2151` `deriveRoundWindow`, `:2215-2217` `windowEnd`, `:2358` `refreshReviewState`, `:2824` `recoverVerdict`), so the header's universal claim survives the check it now makes. |
| F-06 | Medium | **Resolved** | `HALT-REASON:` has one grammar, stated in one place with a §6 row: one line per halt, value = the `; `-joined render in AC-4.7's precedence order. AC-2.2's pre-existing *"the same `; `-joined string"* sentence now agrees with §5 and AC-1.5(5) instead of contradicting them, and AC-1.5(5)'s receive side reads the **leading** reason with the non-co-occurrence of S-11 given as the reason that is exact. `WINDOW-START:` and `WINDOW-RESUMED:` got §6 rows too, and `## Reset Region` — which answers Q-07 in the same edit. |
| F-07 | Low | **Resolved** | R-9's demonstration is restated over counts obtainable from the branch. I re-derived them from the files: rounds 1–2 carry no `{"high": …}` line in either panel's file, round 3 carries one only in the SE file (`3+2`), round 4 = `1+4` + `2+2` = **9**, round 5 = `1+4` + `3+3` = **11**. Every number in the row checks out, including both panels' self-reported trajectories, and the *unavailable* rounds are now named as such — which is R-7 measured on this document, exactly as the row says. |

Mechanical fixes MF-08 (*"since the last **granted** window"*), MF-09 (*"on any entry"*), MF-10
(AC-2.6's lead-in restated over the growth into the round in the row) and MF-11 (the §10.8 freeze
convention) are all applied. Q-07 is answered by §5's *reset region* and §6's `## Reset Region` row;
Q-08 is answered *"no, not deliberately"* and declined, with AC-4.1 stating the first-round-of-window
rule instead. MR-03 and MR-04 are carried; **MR-05 is closed** — AC-1.4 makes the loop re-apply the
region deterministically around the agent's write, so no AC depends on an agent preserving bytes any
more. That was the right call and it is the single most load-bearing decision in this revision.

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict

# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 5
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v4.md` (baseline `4df1199`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `4f5be4f`, clean.

## 1. Delta scan

```
git rev-parse 4df1199:docs/.../REQ-pdlc-review-convergence.md → 5258bbb…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → c9343be…
git diff --stat 4df1199 HEAD -- …/REQ-…md → 328 insertions(+), 105 deletions(-)
bytes: 151,011 → 178,410   (+27,399)
```

The revision is v1.2 → v1.3 and it answers round 4 from both panels. Changed sections, and the only
ones scanned below: the header (Cross-Reviews row, v1.3 revision note), §5 (*round growth*, new
*current window*, *zero-delta*; three durability rows plus a new one; the two-writer table; the
catalogue lead-in, the new `HALT-REASON:` paragraph, S-4 and S-10), AC-1.4 (the new preservation
paragraph), AC-1.5(1), AC-1.5(4) restated over counts with a five-row receive side, **new
AC-1.5(5)**, AC-2.1, AC-2.2, AC-2.6's *When* column, AC-2.7 rows 4–5, AC-2.8 (window scoping, the
report row, the digest paragraph), AC-3.1, AC-3.4's five-step reader, AC-4.1 (rewritten), AC-4.2,
AC-4.5, AC-4.7 (`classification` column, the AC-2.8 row, the precedence table now seven rows), §6's
`DOC-SHA256:` row, O-5/O-9/O-10/O-12, **new R-9**, §9.3's new row, and new §10.8. Sections that did
not change — §1–§4, AC-1.1–1.3, AC-2.3–2.5, AC-3.2/3.3/3.5/3.6/3.7, AC-4.3/4.4/4.6, AC-5, AC-6 — are
not re-litigated, except where a changed section is stated *over* one of them: AC-3.2 and AC-1.4's
re-entry gate are read below only as the receivers of AC-1.5(5) and AC-3.1's new window semantics.

Growth into this round is +27,399 bytes — new-mechanism under this REQ's own AC-4.2, and under
**v1.3's** AC-3.1 that classification now escalates *this* round rather than the next, which is the
correct call for a revision that adds a new clause (AC-1.5(5)), a new durable line (`HALT-REASON:`),
a new §5 term (*current window*) and a new risk (R-9).

## 2. Disposition of round-4 findings

Six were open (2 High, 2 Medium, 2 Low). **All six are resolved**, each checked against the document
rather than against §10.8's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-4.1 is rewritten as one round-open read at `t0` yielding `n` and `h`, then three ordered steps: classify `growth = n − DOC-BYTES(N−1)` and select **round N's own** panel, dispatch, then persist. AC-4.2's *When* is *"it selects **round N's** panel, before dispatching it"* and its third column is retitled `Round N's panel`. AC-4.5 is restated over *"the growth into round N ≥ 2"*. AC-3.1's exception now reads *"the growth into round N"* and gains the paragraph *"the classified revision is the one round N's reviewers are about to read"*. §5's *round growth* entry agrees, and round 1 is explicitly *"not measured and raises no notice"* — which closes the second half of the finding (round 2 is no longer forced to `no-anchor` ⇒ full panel). The fix is the one I asked for, taken at the boundary rather than at the writer. |
| F-02 | High | **Resolved as stated, with a new consequence — F-01 and F-02 below** | AC-1.4 gains an explicit obligation: a halt that rewrites an existing post-mortem *"preserves its reset region verbatim"*, with the HEAD prompt cited (`orchestrate-dev.js:1912-1918`, `writePostmortem`) and both halves routed — O-9(d) the prompt clause, O-5 the write confirmation. AC-1.5(4) is restated over the **counts** `R` and `S` with `R > S` as the unconsumed predicate, which is the right shape for a file that accumulates. The lifecycle question I raised is answered. What the answer *introduces* is the subject of my two new Highs: the counting invariant is broken by the new clause 5, and the preserved `RESOLVED: yes` now satisfies AC-1.4's re-entry gate forever. |
| F-03 | Medium | **Resolved** | AC-4.7's precedence table splits S-3 (row 2) and S-4 (row 3), the *"at most one of the two"* clause is deleted, and row 3 states *"**S-3 and S-4 can appear together**, on the last admitted round, in this order"*. AC-2.2 keeps its co-occurring paragraph and adds that S-11 *"never co-occurs with either of them"* because it is decided at round-open. O-10 adds the two-halt row. The cell is now derivable in both directions. |
| F-04 | Medium | **Resolved** | AC-2.1's *Given* and AC-2.8's *Given* are both scoped to *"round N ≥ 2 **of the current window**"* with the `N − 1 ≥ W` test made explicit, §5 defines *current window*, AC-2.8's receive-side row 4 covers `N − 1 < W` with the deliberate-reset rationale, and AC-1.5(5) states that an S-11 halt is cleared **without** consuming the reset. Every part of the composition I asked for is now stated. F-03 below is about a *third* AC that was not scoped alongside these two. |
| F-05 | Low | **Resolved** | AC-1.5(1) renders `rounds {W}..{W+2} of 3` with both specimens; §5's S-4 row gives the format string `rounds {first}..{last} of {MAX_REVIEW_ROUNDS}` plus the reset-window example. |
| F-06 | Low | **Resolved, and generalised** | AC-3.4 now states the trailer reader **once**, as a five-step algorithm whose skip-set is *"**§5's catalogue** … **by reference**; this REQ enumerates it nowhere else, so it has exactly one membership"*. AC-2.7's row 4 is restated as *"contains **nothing but anchor lines**"* so the table classifies exactly the algorithm's outputs. I re-checked: no second enumeration of the anchor keys survives anywhere in the file. |

Mechanical fixes MF-04 (AC-4.7 row 7 now *"last of the seven"*), MF-05 (§5's writer row now names
AC-2.1, with the AC-2.8 ordering spelled out), MF-06 (§10.7's *"noted below"* dropped) and MF-07
(AC-2.8's anchor condition moved out of *Given* into the receive-side table) are all applied. Q-05 is
answered in two places consistently — §5's writer row and AC-4.1 step 3 both say *"into each of the
round's files **that exist** — zero files on a wholly crashed round, one on a partly crashed one"*.
Q-06 is answered by AC-4.1's *"one read"* and AC-2.8's *"there is exactly one read per round-open and
both ACs use it"*. MR-03 is carried; MR-04 is carried and correctly declared not to block.

I checked the five citations v1.3 adds against the stated baseline `9486c81` and **none of them
resolves there** — see F-05. The *claims* they support are nonetheless true, which I verified by
symbol rather than by line: `canonicaliseForDigest` (`:615` at the baseline) does normalise inside
`sha256Hex` (`:696`) and never in a caller, so SE G-03's correction is right — `DOC-SHA256:` is a
digest of the canonical form, not of the bytes `DOC-BYTES:` counts. And AC-1.4's premise holds: the
post-mortem prompt at the baseline is `Write ${postmortemPath}.` plus a section list, with no
preservation obligation of any kind (`pdlc/workflows/orchestrate-dev.js:1724-1731`, inside
`reviewLoop`, literal `postmortemPrompt`). F-05 is about the locators, not about the claims.

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict

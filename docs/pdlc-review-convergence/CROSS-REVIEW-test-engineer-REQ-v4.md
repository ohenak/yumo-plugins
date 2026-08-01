# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 4
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v3.md` (baseline `2e1ccec`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `4df1199`, clean.

## 1. Delta scan

This round is the opposite of round 3: the document really changed, and substantially.

```
git rev-parse 2e1ccec:docs/.../REQ-pdlc-review-convergence.md → ab4d55f…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → 5258bbb…
git diff --stat 2e1ccec HEAD -- …/REQ-…md → 354 insertions(+), 75 deletions(-)
bytes: 116,569 → 151,011   (+34,442)
```

The revision is v1.1 → v1.2 and it answers both panels' round-2/3 lists. Changed sections, and the
only ones scanned below: the header (Citation-baseline paragraph, Cross-Reviews row, revision note),
§3 BL-01, §4.3 M-3d, §4.7, §5 (*panel shape*, *crashed*, *round growth*, new *zero-delta*; the
durability table; the closed catalogue, now eleven strings with a two-writer table), AC-1.5(4),
AC-2.2, AC-2.4, AC-2.7, **new AC-2.8**, AC-3.2(2), AC-3.3, AC-3.4, AC-3.5(a)/(e), **AC-4.1**,
AC-4.7, AC-6.4, §6 (three rows changed, one added), N-3/N-7, O-4/O-10 and **new O-12**, R-5, **new
R-8**, §9.3, and new §10.7. Sections I approved earlier and that did not change — §1, §2, AC-1.1–1.4,
AC-2.1/2.3/2.5/2.6, AC-3.1/3.6/3.7, AC-4.2–4.6, AC-5, AC-6.1–6.3/6.5–6.8 — are not re-litigated,
except where a changed section is stated *over* one of them (AC-3.1 and AC-4.2 are read in §3 F-01
only as the receivers of AC-4.1's restated formula).

Growth into this round is +34,442 bytes — under this REQ's own AC-4.2 that is **new-mechanism**
(> 12,000), and AC-3.1 would therefore have escalated round 4 to the full panel. It did, which is
the right outcome for a revision that adds a new AC (AC-2.8), a new writer, two new catalogue strings
and a new clause to AC-1.5.

## 2. Disposition of round-3 findings

Seven were open (3 High, 2 Medium, 2 Low). **All seven are resolved**, and each was checked against
the document rather than against §10.7's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-4.1 names `appendRoundAnchors`, an unconditional per-round writer that runs *"after every round's reviewers return, whatever verdict they returned"*; `appendApprovalAnchors` keeps only `APPROVAL-HASH:`/`REVIEWED-COMMIT:`. §5 gains a normative two-writer table; §6's `DOC-BYTES:` and `REVIEW-MODE:` rows are re-assigned. The read instant (`t0`, round-open) is separated from the persist instant (after the round's files exist), which was the second half of the finding. A failing round now carries the anchor, so AC-3.1's single-verifier path is no longer structurally dead *on this axis* — but see F-01 below, which is about the **boundary the classification is taken across**, not about the writer. |
| F-02 | High | **Resolved** | AC-1.5(4) adds `WINDOW-START: {N}`, written by the loop to the resolved POSTMORTEM, with an explicit one-shot consumption rule and a fail-closed receive side (absent / non-integer / duplicated-unequal ⇒ no reset). §5's durability table gains both rows, with the fail-closed default *"treated as 1"*. The admitted-round set of a reset document is now derivable: `{N … N+2}` where `N` is the marker's value. The residual defect is the *file* the marker lives in — F-02 below. |
| F-03 | High | **Resolved** | AC-3.2(2) chooses reading 2 explicitly: the verifier excludes the finding from *its own* trailer, *"the loop performs no subtraction and parses no findings table"*, and `blocking(N)` is stated to have *"exactly one definition everywhere in this REQ"*. §5's S-9 receiver column, N-3 (*"the findings table is not a parsed data contract"*) and R-5 all agree. The expected `blocking(N)` of a verifier round is now derivable from the trailer alone. R-5 also states the failure *direction* (an ignored clause raises the count, so AC-2 can only halt earlier) — that is the right thing for a test author to know about an unenforceable clause. |
| F-04 | Medium | **Resolved** (with a new contradiction — F-03 below) | AC-4.7's `notice` column is now *"a possibly-empty, ordered list"* with a six-row precedence table, and O-10 names the crashed-round row as a required PROPERTIES case. The cell for a crashed round is derivable. |
| F-05 | Low | **Resolved** | AC-3.5(e) reads *"all six cases below"* over a six-row table; §5's S-1 row says *"all **six** rows"*. |
| F-06 | Low | **Resolved** | AC-6.4 adds two exempt regions: fenced blocks (adopting `scanLines`) and a catalogue row's own `Example` cell. I re-ran the extraction over the whole v1.2 file: the only backticked colon-digit token that is not C-1/C-2 is `` `:1574` `` at line 1215, inside the C-4 row — exempt. The document is no longer a counter-example to its own rule. |
| F-07 | Medium | **Resolved** | AC-2.8 makes a zero-delta round a halt with its own reason (S-11), on a byte-**and**-hash test (`DOC-SHA256:`, S-10), with a total, fail-**open** receive side and an explicit *"not counted against AC-1's budget"*. R-8 records the authoring-side residue and §9.3 binds it. This is a better answer than the one I asked for: the SHA endpoint removes the false-positive I did not raise (two revisions of equal length). Its composition with AC-1.4/AC-1.5 is where F-04 below lands. |

Mechanical fixes MF-01 (§4.7 restated at `9486c81`), MF-02 (*"four inputs, three reasons"* in S-2 and
AC-4.1) and MF-03 (the header now states the baseline is a fixed ancestor and that navigation at a
later commit is by symbol + literal) are all applied. I re-verified MF-03's premise rather than the
prose: at `9486c81`, `appendApprovalAnchors`'s call site **is** `pdlc/workflows/orchestrate-dev.js:1845`,
so v1.1's citations were correct at the stated baseline and the header's new paragraph is the right
fix. MR-03 is carried unchanged. Q-01 → N-7/AC-3.3, Q-02 → AC-2.2, Q-03 → AC-3.4/AC-2.7 row 4,
Q-04 → R-8: all four are now answered in the document.

I also verified the two new citations in AC-6.4's exemption 1 at the stated baseline: `scanLines` is
at `pdlc/workflows/orchestrate-dev.js:569` and the JSDoc carrying *"a quoted example anchor cannot
fabricate an ambiguity"* is at `pdlc/workflows/orchestrate-dev.js:1907-1910`. Both exact.

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict

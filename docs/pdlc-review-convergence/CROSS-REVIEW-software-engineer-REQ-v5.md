# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 5
**Scope:** REQ-pdlc-review-convergence v1.3, delta re-review against the v1.2 tree reviewed at iteration 4 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

- Baseline: `087d5d6` (*"docs(pdlc-review-convergence): SE REQ v4 — verdict"*), the commit carrying my
  v4 cross-review. `git diff 087d5d6 HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+328 / −105** across 9 commits (`7084517` … `4f5be4f`), tree clean.
- The version row reads **1.3**, there is a *Revision note (v1.3)*, and **§10.8** maps every round-4
  finding from both panels to where it is answered.
- Scanned sections: the header Cross-Reviews row, §5 (*round growth*, the new *current window* row,
  *zero-delta*, the durability table's five changed/added rows, the two-writer table, the catalogue
  lead-in, the new `HALT-REASON:` paragraph, S-4 and S-10), **AC-1.4's new preservation paragraph**,
  AC-1.5(1), **AC-1.5(4) rewritten**, **AC-1.5(5) new**, AC-2.1's window scoping, AC-2.2, AC-2.6's
  table, AC-2.7's rows 4–5 and their commentary, **AC-2.8 rewritten**, AC-3.1, **AC-3.4's reader
  algorithm**, **AC-4.1 rewritten**, AC-4.2, AC-4.5, AC-4.7's schema, halt-row paragraph and precedence
  table, §6's `DOC-SHA256:` row, O-5, O-9, O-10, O-12, R-9, §9.3, §10.7, §10.8. Unchanged sections I
  approved earlier are not re-litigated.
- Verification pass this round: v1.3 adds **one** new existing-code citation (the post-mortem write
  prompt) and restates the `sha256Hex` family. I checked both against the declared citation baseline
  `9486c81` in a single pass, and additionally checked the two shipped functions the new AC-1.4 / AC-1.5(4)
  mechanism must coexist with — `parseResolvedMarker` and `extractFileVerdict` — which the REQ does not
  cite. Results are in G-07, G-09 and MF-1.

## Round-4 disposition

**All five prior findings are closed.** Each was checked at the surface it named, not at the revision
note or §10.8 row that claims it.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| G-01 — AC-2.2 and AC-4.7 contradict each other on S-3/S-4 co-occurrence | High | **closed** | AC-4.7's precedence table now gives S-3 and S-4 **two rows** (3 and 4 of seven) and the "at most one of the two can appear on a round" clause is gone; row 3 states the co-occurrence explicitly and names the case AC-2.2 constructs. AC-2.2 additionally binds the render to the `HALT-REASON:` line (*"the same `; `-joined string"*), answering Q-07's second half, and a new paragraph states that S-11 never co-occurs with either — which is the correct consequence of deciding S-11 at round-open. O-10 gains the two-halt row. |
| G-02 — AC-2.8's S-11 notice has no report row | Medium | **closed** | Both AC-2.8 (*"What the run report shows for the undispatched round"*) and AC-4.7 (*"The AC-2.8 halt row is the one row with no dispatch behind it"*) state the row: `round` = N, four cells **empty**, `notice` = S-11 alone. Stated twice on purpose and identically. O-10 asserts it. The reasoning — empty cells say "not run", the mechanical derivation would report an authoring failure as a reviewer crash — is right. One residue in the *justification*, not in the prescribed cells: G-12. |
| G-03 — `DOC-SHA256:` does not digest the bytes `DOC-BYTES:` counts | Medium | **closed**, and closed the way I recommended | AC-4.1's heading is now *"…from the same read — but not over the same bytes"*; the digest is `sha256Hex`'s over `canonicaliseForDigest`'s output, cited at `pdlc/workflows/orchestrate-dev.js:848`, `:767` and JSDoc `:752-759`; the "same bytes" claim is withdrawn in terms. AC-2.8 gains *"Which bytes are digested, precisely"* and derives the line-endings-only consequence in the safe direction. §6's row and §5's S-10 row both carry the provenance and the bare-vs-prefixed rendering difference against `approvalHashOf` (`:950`). All four citations verify at `9486c81`. |
| G-04 — the reset anchor is not protected from the halt path | Medium | **closed as asked, and the chosen fix has a new consequence** | AC-1.4 gains the preservation paragraph; O-9 gains clause (d) (prompt amendment); O-5 gains the write confirmation. This is option (a) of the two I offered, and it is the right one at REQ altitude. It also puts a preserved `RESOLVED: yes` in front of a shipped reader neither AC cites — see **G-07**, which is a new finding against the new mechanism, not a re-raise of G-04. |
| G-05 — AC-3.4 and AC-2.7 define the trailer reader as two different total functions | Medium | **closed in substance** (two residues, G-08 and G-09) | AC-3.4 now states one five-step algorithm; AC-2.7's row 4 is restated as *"contains **nothing but anchor lines**"*; the anchor set is given **by reference** to §5's catalogue and enumerated nowhere else, which closes MF-2 with it. The two clauses now classify the same observations. The algorithm's own internal statement is not yet single-valued (G-08) and omits one branch the shipped reader already returns (G-09). |
| G-06 — a count-only fixed point cannot see finding turnover | Low/Cross-Feature | **closed as recorded signal** | **R-9** is new and states the mechanism, the demonstration (10, 5, 5, 5), the disagreement with AC-4.2's classification of the same round, and why it is accepted rather than fixed; §9.3 gains a binding row to the calibration successor, which gains a fourth question. That is exactly what a Low/Cross-Feature finding is for. |

Also closed: **MF-1** (§5's S-4 now shows the format string plus two specimens, including a reset
window's), **MF-2** (folded into G-05's fix), **MF-3** (§5's catalogue lead-in names the four kinds in
row order), **MF-4** (the header's Cross-Reviews row carries round 4 and declares itself per-round
maintenance, so it is not re-raised).

The findings below are **all new in v1.3** — every one is in text this revision added, and every one
except G-12 is in the three mechanisms v1.3 introduced to close G-04, G-05 and TE F-04. None
re-litigates a section I approved.

## Findings

## Findings in detail

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict

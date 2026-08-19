# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.12)
**Date:** 2026-08-18
**Iteration:** 15 (delta confirmation — ASM-2 follow-up)
**Scope:** Local

## Scope

Delta confirmation only, under the existing decision freeze. Commit `86d65b0d` (FSPEC
v0.11 → v0.12) makes a single-literal correction: §7.1 ASM-2's derivation of L-5's
post-sweep count changes from the stale `119 − 22 = 97` to `119 − 21 + 1 = 99`. This is
exactly the F-01 (Medium) finding both round-14 cross-reviews raised against v0.11
(`CROSS-REVIEW-software-engineer-FSPEC-v14.md`, `CROSS-REVIEW-test-engineer-FSPEC-v14.md`):
ASM-2 still carried pre-correction arithmetic after L-5 itself (`FSPEC:405`) and §7.2 row 7
(`FSPEC:870`, landed in v0.11 via `07ba02e0`) had already moved to 99.

This round's question: **does `86d65b0d` resolve F-01 without needing a preceding
SE/TE-routed round?**

## Method

Diffed `86d65b0d` against its parent `07ba02e0` (v0.11, the state both round-14 reviews
examined) with `git show 86d65b0d -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`.
Confirmed the only substantive edit is ASM-2's arithmetic (`FSPEC:844`); the header version
bump (0.11 → 0.12) is the sole other change. Cross-checked the corrected value against the
shipped test suite: `ls pdlc/workflows/__tests__/*.test.js | wc -l` returns `99` at HEAD,
matching L-5, §7.2 row 7, and the now-corrected ASM-2.

## Answer to the framing question

**Yes, resolved, and no preceding SE/TE-routed round was needed.** F-01 was a pure
value-correcting literal fix: ASM-2's veto-path text already described the exact condition
that had fired (TSPEC §4.4 diverged from the stale FSPEC literal, and L-5 was corrected in
v0.11), but ASM-2's own supporting arithmetic hadn't been updated to match. `86d65b0d`
closes that internal contradiction with a single-line edit that introduces no new design
decision, no new test-construction detail, and no behavioral change — it brings ASM-2 into
agreement with L-5 (`FSPEC:405`), §7.2 row 7 (`FSPEC:870`), and the ground-truthed test count
(99, independently reproduced via `ls pdlc/workflows/__tests__/*.test.js | wc -l`). This is
the same class of DoD-sourced, non-behavioral erratum the FSPEC's own §7.3 ledger convention
already covers for six prior rows, and §7.2's new row 7 (landed v0.11) explicitly previewed
this exact follow-up ("ASM-2's derivation ... is corrected in this follow-up (§7.1) to
119 − 21 + 1 = 99"). The follow-up now matches that preview exactly.

## Findings

None. F-01 is closed by this delta.

F-02 (Low, from round 14: §7.2 row 7's "already carried the corrected 99" wording describes
a value present only in `preflight-baseline.test.js`'s explanatory comment, not in any
mechanically-enforced assertion) is **not addressed** by `86d65b0d` — that commit touches
only ASM-2 and the version header. This is unchanged from round 14: a wording nit, non-
blocking, carried forward rather than newly introduced.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-02 (carried forward, unresolved) | Low | Local | §7.2 row 7's "already carried the corrected 99" is accurate only against `preflight-baseline.test.js`'s explanatory comment (lines ~238–249); no assertion in that file or elsewhere in `pdlc/engine/__tests__/` parses or checks the literal 99 mechanically. Wording nit, not a defect in this round's correction. | §7.2, row 7 |

## Questions

None.

## Observations

- The fix is minimal and behavior-preserving: a single arithmetic string, no other prose,
  no TSPEC/PROPERTIES-level change required.
- Value-correctness re-verified independently against the shipped test suite
  (`ls pdlc/workflows/__tests__/*.test.js | wc -l` = 99) rather than trusting FSPEC's own
  prose, closing the existing-code-claim-verification obligation for this round.
- ASM-2, L-5, and §7.2 row 7 are now mutually consistent at 99; no other pinned-literal row
  in the document references the superseded 97.

## Recommendation

**Approved with minor changes.** F-02 (Low, carried forward, non-blocking) remains open for a
future pass; no other findings.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:dac89dbc272c387a69ae09d5e036722bbf677de493ee6fcdda8fa933fa574142
APPROVAL-HASH-NORMALIZED: sha256:d01c48a6cf478097a348909e36b942a1acdce368ecbc3029809bc72615742b63
REVIEWED-COMMIT: 86d65b0d7940230ff024176ca41ccbf95adaa80c
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c

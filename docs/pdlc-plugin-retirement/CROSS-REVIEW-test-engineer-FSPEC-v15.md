# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.12)
**Date:** 2026-08-18
**Iteration:** 15 (delta confirmation — ASM-2 follow-up)
**Scope:** Local

## Scope

Delta-confirmation round under the existing decision freeze. Commit `86d65b0d` (FSPEC
v0.11 → v0.12) corrects §7.1 ASM-2's stale derivation of L-5's post-sweep test-module count
from `119 − 22 = 97` to `119 − 21 + 1 = 99`. This is exactly F-01 (Medium), which both
round-14 cross-reviews raised independently against v0.11
(`CROSS-REVIEW-software-engineer-FSPEC-v14.md`, `CROSS-REVIEW-test-engineer-FSPEC-v14.md`):
ASM-2 still contradicted L-5 and §7.2 row 7 after those had already moved to 99 in v0.11
(`07ba02e0`).

Round's question: **does `86d65b0d` resolve F-01 cleanly, from a testing/oracle lens, without
needing a preceding SE/TE-routed round first?**

## Method

`git show 86d65b0d -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` isolates
the delta from parent `07ba02e0` (v0.11, the state round 14 reviewed): only ASM-2's arithmetic
and the version header change. Re-derived the suite count independently rather than trusting
either FSPEC's prose or the diff: `ls pdlc/workflows/__tests__/*.test.js | wc -l` → `99` at
HEAD. Checked whether any assertion (not comment) in `pdlc/engine/__tests__/` mechanically
enforces this count, to see if the correction is falsifiable beyond documentation review.

## Answer to the framing question

**Acceptable, resolved cleanly, no process gap.** From a testing lens this is a
value-correcting literal fix to an observable-outcome integer (test-module count), not a
change to test construction, oracle design, or coverage. The corrected value is independently
re-derivable — `119` pre-sweep minus `21` deletions (M-8's 20 plus `runtimeProvenanceWiring.test.js`,
per TSPEC §6.1 erratum 6's disposition of `hookCompatibility.test.js` as reduced-not-deleted)
plus `1` addition (`consumerCleanup.test.js`, TSPEC §5.2) equals `99` — and matches both L-5
(`FSPEC:405`) and the live `ls pdlc/workflows/__tests__/*.test.js | wc -l` output at HEAD. No
new testability question is introduced: ASM-2 was already a non-testable prose assumption
before this edit (no assertion in `pdlc/engine/__tests__/` parses ASM-2's arithmetic), and it
remains one after — the correction just removes an internal contradiction between ASM-2 and
the rest of the document, it does not change what's tested or how.

## Findings

None new. F-01 is closed.

F-02 (Low, from round 14) is unchanged and not addressed by this commit: §7.2 row 7's "already
carried the corrected 99" is grounded only in `preflight-baseline.test.js`'s explanatory
comment block (`:238`–`:249`), not in any assertion. `preflight-baseline.test.js`'s T13
assertions (`:261`–`:280`) check the C7-block deletion and drift-hook non-invocation in
`hookCompatibility.test.js`; none of them check the suite-size literal. This remains a
documentation-only invariant with no mechanical oracle — same conclusion as round 14, carried
forward rather than re-raised as new.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-02 (carried forward, unresolved) | Low | Local | §7.2 row 7's "already carried the corrected 99" is accurate only against an explanatory comment in `preflight-baseline.test.js`, not an assertion; no test in `pdlc/engine/__tests__/` fails if FSPEC's count literal drifts again. Non-blocking, project-level preference for falsifiable oracles over documentation-only invariants. | §7.2, row 7 |

## Questions

None.

## Value verification

Suite-size arithmetic re-derived independently at HEAD:
`ls pdlc/workflows/__tests__/*.test.js | wc -l` → `99`, matching FSPEC L-5, §7.2 row 7, and
the now-corrected ASM-2 (`119 − 21 + 1 = 99`) exactly.

## Positive Observations

- The erratum stays exactly at REQ/FSPEC altitude: it corrects an observable-outcome integer,
  not a test-construction detail, and required no TSPEC/PROPERTIES-level rework to land.
- The corrected value is independently re-derivable against the live test tree rather than
  trusting FSPEC's own prose — closing this round's existing-code/existing-spec
  claim-verification obligation cleanly.
- ASM-2, L-5, and §7.2 row 7 are now mutually consistent; §7.2 row 7's own text (landed in
  v0.11) explicitly previewed this exact follow-up, and the follow-up matches that preview.

## Recommendation

**Approved with minor changes.** F-02 (Low, carried forward, non-blocking) remains open; no other
findings against this delta.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:dac89dbc272c387a69ae09d5e036722bbf677de493ee6fcdda8fa933fa574142
APPROVAL-HASH-NORMALIZED: sha256:d01c48a6cf478097a348909e36b942a1acdce368ecbc3029809bc72615742b63
REVIEWED-COMMIT: 86d65b0d7940230ff024176ca41ccbf95adaa80c
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c

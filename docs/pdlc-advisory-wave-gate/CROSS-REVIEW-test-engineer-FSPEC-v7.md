# Cross-Review: test-engineer — FSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 7
**Scope:** Delta only, frozen round. `git diff c3ae2087..HEAD` on the FSPEC is **empty** — the
document has not changed a byte since the v6 review. What did change upstream is the REQ
(`c3ae2087..HEAD`, 19 insertions / 7 deletions, v1.9 erratum round 5: five round-3 restorations plus
two Medium corrections, F-06 ledger citations by symbol and F-07 NFR-4 window wording). This round is
therefore a re-derivation check: does every FSPEC claim still hold against REQ at HEAD
(`sha256:817b6745…`, matching the anchor in commit 98cc007d)? Unchanged-and-unaffected sections are
not re-litigated.

## Prior findings — disposition

| Prior ID | Severity | Status | Evidence |
|----------|----------|--------|----------|
| v6 F-01 | Medium | **Open (unchanged)** | AT-04-1b's Then still reads "the wave halts: not resolved, resolved-wave count `0`" (FSPEC:394-398) with no named terminal disposition or halt reason, where sibling AT-04-1 pins `escalated` plus the pre-A6 gate-failure literal (FSPEC:389-390). No FSPEC bytes changed this round, so the finding is carried forward unmodified. Non-gating then, non-gating now; it is a strengthening, not a defect the delta introduced. |

## Upstream re-derivation checks (REQ v1.8 → v1.9)

| REQ change | FSPEC exposure | Result |
|------------|----------------|--------|
| F-06 — §1 ledger citations moved from line numbers to stable symbols (`WAVE_STATE_PATH`, `implementation.startWave`, `implementation.testCommand`) because line numbers had drifted ~2 000 lines | Does the FSPEC carry any inherited `orchestrate-dev.js:NNNN` anchor that drifted with them? | **Clean.** `grep -n "orchestrate-dev\.js\|:[0-9]\{4,\}"` over the FSPEC returns nothing; the only ledger-adjacent citation is E-13's symbolic `testCommand` (FSPEC:270). Nothing to sweep. |
| F-05 / F-04 / F-03 / F-02 / F-01 — restorations of round-3 wording (2026-08-11 incident, M-WG-6, `docs/completed/…` upstream row, C-2's `advisory.waveBudgetPerRun` default `1` with Q-1 provenance, O-7) | Every FSPEC site that cites them | **Clean.** BR-5 still names the 2026-08-11 consumer-repository incident as unaffected (FSPEC:173); §3.1 and O-7 still attribute the post-wave-command exclusion to a decision, not oversight (FSPEC:146, 494); D-AWG-03 still cites M-WG-5/M-WG-6 (FSPEC:497); E-33 and AT-07-2b still read the default as `1` and the validator as non-negative (FSPEC:296, 456), matching restored REQ C-2 (REQ:235-240). |
| F-07 — NFR-4's exclusion rationale restated: the window "closes at the attempt's verdict, and the gate runs **after that verdict**, not within the measured span" (REQ:503-506) | BR-11's and AT-02-7's inherited "between attempts" / "between dispatches" phrasing | **Diverged — see F-01 below.** Conclusion (structural exclusion, no subtraction) is identical; the stated mechanism is not. |

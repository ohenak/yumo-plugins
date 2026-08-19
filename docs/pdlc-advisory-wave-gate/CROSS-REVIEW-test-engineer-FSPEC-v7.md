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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **BR-11 and AT-02-7 still carry the "between attempts" mechanism REQ v1.9 replaced, and it is false for the terminal gate pass.** BR-11 reads "the gate runs between attempts, never inside a dispatch→verdict window" (FSPEC:218-219) and AT-02-7's companion says "the companion's slow gate command sits between dispatches, outside every measured window" (FSPEC:361). REQ NFR-4 at HEAD deliberately no longer says this: it says the window "closes at the attempt's verdict, and the gate runs after that verdict, not within the measured span" (REQ:503-506). The change matters at the boundary the FSPEC's own fixture occupies: AT-02-7's companion resolves on a **green re-gate**, i.e. one dispatch followed by the gate pass that ends the invocation, with no second dispatch for the gate to sit "between". The load-bearing consequence — gate time outside every measured window, so no subtraction and no carve-out — is unaffected and remains true under either phrasing, and no Given/When/Then value or fixture changes. What is wrong is the justification sentence an implementer reads to build the companion fixture: taken literally it implies the companion needs two dispatches to be valid, which would be a fixture that does not exist. Suggested revision: sweep both sites to REQ's verdict-relative wording ("the gate runs after the attempt's verdict, outside the measured span"), leaving the oracles untouched. | §4 BR-11 (FSPEC:218-219), §6.2 AT-02-7 (FSPEC:355-361), cf. REQ NFR-4 (REQ:503-506) |
| F-02 | Medium | Local | **Carried forward from v6 F-01, unresolved because the FSPEC did not change: AT-04-1b's oracle names no disposition value.** "The wave halts: not resolved, resolved-wave count `0`" (FSPEC:394-398) has one negative conjunct, one exact-value conjunct, and one conjunct that names no terminal state or reason literal, while the fixture deliberately mutates shipped control flow to suppress the re-gate. Any other halt cause — restoration path, dispatch error, an earlier precedence branch — satisfies all three assertions, so the test can green without ever exercising the prohibition it exists to falsify. Sibling AT-04-1 shows the fix shape: a named terminal disposition plus a halt reason attributable to the wave's own gate, alongside the `0` count (FSPEC:389-390). Recorded, not gating: it is a pre-existing strengthening opportunity, not a defect this round introduced. | §6.4 AT-04-1b (FSPEC:394-398) |

DEFERRED: sweep BR-11 and AT-02-7 to REQ NFR-4's verdict-relative wording, and give AT-04-1b a named disposition and halt reason, in the next non-frozen FSPEC revision.

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-02-7's companion is described as "slow gate command, every dispatch→verdict window inside budget". Under REQ's corrected wording, is the intended fixture one dispatch plus one slow green re-gate, or two dispatches with the slow gate between them? Both prove the exclusion; only the first matches the `resolved`-on-green-re-gate disposition the Then asserts. Naming which one is intended removes the ambiguity F-01 describes at its source. |

# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the `feat-pdlc-advisory-wave-gate` implementation, delta `616dc0b8` → `e30f90bc` (`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs`, `pdlc/workflows/__tests__/{advisoryEnvelope,advisoryWaveGateMain,waveExecution}.test.js`), against `REQ-pdlc-advisory-wave-gate.md` and `FSPEC-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-21
**Iteration:** 2

## Scope and Method

**Delta re-review, per the protocol.** v1 was written against `616dc0b8`; exactly one commit has
touched code since, `e30f90bc` ("fix(advisory): wire AC-6.3's warning to the halt report and default
the seam clock"), +215/−10 across five files. I re-read my own v1 (five findings: F-01, F-02 High;
F-03, F-04 Medium; F-05 Low), diffed `616dc0b8..e30f90bc`, and scanned only what that diff changed.
Sections of the branch I approved in v1 — the A6 seam, snapshot/restore pair, envelope, record and
escalation carriers, the `.gitignore` boundary case, PROP-REST-10's interleaving oracle — are not
re-litigated here.

**One production behaviour changed, and it is a real fix, not a test-only edit.**
`runWaveGateSeam` now defaults its clock (`orchestrate-dev.js:3404`, `_now = () => Date.now()`),
matching `runAdvisorySeam`. `main` carries no default for `_now`, so on the capture-failure branch —
which calls `appendAdvisoryEntry` / `appendEscalationEntry` directly, both of which invoke `_now()`
unguarded — E-34's ADVISORY record and its `ESCALATIONS.md` entry were being replaced by two "write
failed" notices on every real run. That is an AC-6.4 countability defect (a class that never reaches
the durable carrier is not countable) that no seam-level test could see, because every seam unit
test injects a clock. It was found by the new report-surface arm the round added, which is the
strongest available evidence that the round's fixes are the right shape.

**What I verified in this window, mechanically.**

1. **Every fix falsified by mutation, not read for plausibility.** Three mutations, each reverted:
   - Severing `_notice: advisoryNotice` at the wave-loop A6 call site (`orchestrate-dev.js:15463`) →
     `advisoryWaveGateMain.test.js`'s real-seam escalation case goes RED (`1 failed, 10 passed`).
     This is precisely the mutation that left the whole suite green in v1.
   - Reversing `ADVISORY_ROOT_CAUSES` (`orchestrate-dev.js:1955-1960`) → the new ordered
     deep-equal goes RED (`1 failed, 49 passed`), and the sorted set check stays green, so a
     *renamed* member still fails distinctly from a *reordered* one, as F-02 asked.
   - Removing the new `_now` default → AT-06-4b's report arm goes RED on the
     `write failed for seam A6` conjunct.
2. **Delivery hygiene.** `node build-runtime.mjs --check` → `in-sync pdlc/workflows/dist/pdlc-cli.mjs`;
   `dist/pdlc-cli.mjs` carries both new production changes (`ADVISORY_ROOT_CAUSE_MEANINGS` present,
   `_now = () => Date.now()` at the seam). Targeted suites green: 159/159 across the three edited
   test files.
3. **AC-2.2's Meaning column transcribed, not paraphrased.** Compared
   `ADVISORY_ROOT_CAUSE_MEANINGS` (`orchestrate-dev.js:1968-1977`) row-by-row against REQ
   §AC-2.2's table (`REQ-pdlc-advisory-wave-gate.md:360-363`): all four meanings match verbatim
   (only markdown emphasis on "later" is flattened to `LATER`).
4. **Project-level context re-read** — `docs/_constraints/DOMAIN-CONSTRAINTS.md` and
   `docs/_decisions/DECISIONS-*.md`. No standing constraint is violated by this delta; DC-07's
   builder-not-wired rule is what F-01 asked for and what the round now satisfies.

## Prior Findings — Disposition

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_

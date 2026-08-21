# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Technical lens — delta re-review of the v1.3 revision against my v1 findings.
**Base verified:** branch `feat-pdlc-wave-resume` @ `005dc47d` (24 commits ahead of merge-base
`c8aa22a4`, still 1,637 behind `main`); all code claims cross-checked against `main`
(`pdlc/workflows/orchestrate-dev.js`, 16,336 lines) since the mechanism does not exist in this tree.
**Delta base:** v1 reviewed the document at `d1ebb22f`; the revision is commits
`835ea011 → 005dc47d` (7 commits touching the REQ).

## Prior Findings — Disposition

Every v1 finding was addressed. Verification is against `main`, not this tree, per the REQ's own
v1.3 note; each row below states the check I ran.

| v1 | Sev | Disposition | Evidence |
|----|-----|-------------|----------|
| F-01 | High | **Resolved (document)** | `835ea011` restores the v1.2 base from the default branch and the v1.3 header states the v1.2 amendments are *not* withdrawn. The document no longer regresses settled ground. The branch-base half survives as G-01 below — a Medium, not a document defect. |
| F-02 | High | **Resolved** | §1's stale "exists at HEAD of the pdlc-consolidation-agent branch" paragraph now carries its 2026-08-13 correction, §5 carries the BL-01/BL-02/BL-03 correction, and frontmatter flips `ready: true`. Both depended-on features are archived (`main:docs/completed/pdlc-consolidation-agent/`, `main:docs/completed/pdlc-advisory-wave-gate/`). |
| F-03 | High | **Resolved** | REQ-WVR-05 is restated as *retention with invalidation*, matching `main:pdlc/workflows/orchestrate-dev.js:15607-15613` ("The record is KEPT — … so a later invocation of this same plan … skips Phase I"). G-4 is re-worded to match ("the record may survive a completed Phase I"). The residual tense problem is F-03 below, Low. |
| F-04 | High | **Resolved** | REQ-WVR-06 is narrowed to "the presence, absence, or message of a task's commit", gains a positive conjunct (the no-commit wave is treated as complete and the *next* wave is announced — no absence-only oracle), and adds an explicit carve-out for ancestry corroboration. That matches `headCorroborated` at `:15280`, applied at `:15307`. R-1 (§8) is re-attributed to IG-4 and downgraded to Low. |
| F-05 | Medium | **Resolved** | §4 now cites `M-WG-4`, `M-WG-6`, `M-WG-12` instead of restating them. All three exist: `main:docs/_constraints/pdlc-wave-gate-baseline.md` rows for M-WG-4, M-WG-6 (§1/§2) and M-WG-12 (§3). OB-2 is narrowed to the two genuinely new observations. Version-citation residue is G-02 below. |
| F-06 | Medium | **Resolved** | REQ-WVR-08 adds the all-green outcome, states its announcement, its own `⏭` phase row, and — the part I asked for — *how* REQ-WVR-03 is discharged when no wave runs. Both halves verify: the skip emit at `:15318-15334`, the `⏭` `recordPhase("I", …)` at `:15615-15621`, distinct from the `✅` row at `:15623-15630`. The three-outcome catalogue is closed with a set-equality obligation on PROPERTIES. |
| F-07 | Medium | **Resolved** | OQ-1 resolves to record deletion as the sole hatch, with the `startWave: 1` non-expressibility argument recorded. Corroborated: `const explicitPointer = startWave > 1` at `:15236`, and the ledger read is gated `if (!explicitPointer)` at `:15263`, so `startWave: 1` provably defers to the ledger. |
| F-08 | Low | **Resolved** | C-1 now cites the root-anchored ignore rule and its comment, and REQ-WVR-10 turns C-1 into a failing observable rather than an unverifiable constraint. |
| F-09 | Low | **Resolved** | OF-1 and OF-2 carry *Re-derive* commands; OF-3 is replaced by an `M-WG-*` citation, whose own baseline row carries a Measured-by command. |

My v1 questions are also answered in the revision: Q-01 by OB-1's "queue parity is free and TSPEC
owes only a test" plus REQ-WVR-07's new same-working-directory observable; Q-02 by the shipped
per-wave skip emit at `:15373-15380`, which does announce each skipped wave (my v1 premise was
wrong, and the REQ's original wording was right); Q-03 by REQ-WVR-08's explicit discharge
paragraph; Q-04 by R-1's re-attribution to IG-4 as *required*, not merely permitted; Q-05 by OB-3's
answer against the shipped A6 seam.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

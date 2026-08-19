# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.6, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 4
**Scope:** Delta re-review. Round-3 findings F-15, F-16, F-17 and the v1.5→v1.6 diff only.
Reviewed on `feat-pdlc-advisory-wave-gate` at `6565080a`; diffed from round-3 base `afa55439`.

## Round-3 Disposition

| v3 finding | Sev | Disposition | Evidence checked |
|---|---|---|---|
| F-15 — AC-4.4's re-gate oracle stated in a unit that cannot hold (set equality), with the red-post-wave path unenumerated and the per-attempt arithmetic wrong | High | **Resolved**, all three parts | AC-4.4 now reads "equals, **as a sequence**, the shipped sequence concatenated once per gate pass — passes = 1 + attempts, the first pass not being an attempt (AC-2.4) — each pass truncated at its first failing command", enumerates `[post-wave, test, post-wave, test]`, `[post-wave, test, post-wave]` and `[test, test]`, and states outright that set equality "collapses the duplicates and admits a resolution declared on one invocation, the defect this criterion excludes". Arithmetic re-checked against AC-2.4's attempt definition and against the shipped order (build before gate, `orchestrate-dev.js:14345-14352` comment and code): the one-attempt literal is now reachable, and the truncated form is sanctioned rather than a defect |
| F-16 — §9 said BL-06 owns reissuing the drifted recipes, but BL-06's own cells did not | Medium | **Resolved**, and widened beyond what I asked | BL-06's Dependency cell now names two enumerations and the Gating-logic cell splits the phases ("Set-equality enumeration before implementation planning; reissue and BL-03 measurement before FSPEC authoring"). The prose no longer confines the drift to the three rows AC-4.2/4.4/4.6 rest on |
| F-17 — AC-4.2's closing clause stated unconditionally what the preceding sentence had just made conditional | Low | **Resolved** | AC-4.2 now reads "Where both writers are configured — as in this repo — … otherwise those artifacts are uncommitted too and fall to O-8 alike". Re-verified at HEAD: the build-output commit is gated on `postWaveRan && implConfig.postWavePathspecs.length > 0` (`pdlc/workflows/orchestrate-dev.js:14417`) |
| Q-08 — did the restored tree carry first-pass build outputs? | — | **Answered in the text** | AC-4.4 now ends "which is the tree as it stood before A6 acted, first-pass build outputs included" |
| Q-09 — pick one unit and say why | — | **Answered** | v1.6's changelog and AC-4.4 both state the unit and the reason for it |

Size discipline (C-5) re-checked this round: 574 lines / 45,913 bytes, inside the 700 / 61,440 budget.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.5, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 3
**Scope:** Delta re-review. Round-2 findings F-10…F-14 and the sections the v1.4→v1.5 diff touched, only.
Reviewed on `feat-pdlc-advisory-wave-gate` at `afa55439`; diffed against the round-2 base `99d3eb50`.

## Round-2 Disposition

| v2 finding | Sev | Disposition | Evidence checked |
|---|---|---|---|
| F-10 — AC-4.4's revert contract written in two incompatible units (per-path vs whole-tree) | High | **Resolved** | AC-4.4 now says a red re-gate "restores the **whole working tree** (AC-5.1), never the repair's paths alone", and states the reason (the re-run post-wave command writes at paths no envelope rule ranges over). One unit, and it is AC-5.1's. Re-measured: the shipped post-wave command here is `node pdlc/workflows/build-runtime.mjs` writing `pdlc/workflows/dist/` (`.claude/pdlc.config.json`), paths no wave task owns |
| F-11 — AC-4.2's "sole writer" claim contradicted M-WG-4 | High | **Resolved** | AC-4.2 now names both writers. Verified against HEAD: per-task `commitPaths` at `pdlc/workflows/orchestrate-dev.js:14405` over `task.files`, build-output `commitPaths` at `:14417` gated on `postWaveRan && implConfig.postWavePathspecs.length > 0`. Both sit below the gate block (`:14345-14369`), so "reached only by a green gate" holds |
| F-12 — §9's drift reassurance was false | Medium | **Resolved as to the false claim, incomplete as to the gate (F-16)** | §9 now states the recipes did not survive. Re-measured: `sed -n '10301,10319p'` (M-WG-2) lands in DoD finding-table parsing, `sed -n '10334,10364p'` (M-WG-4) in a findings-return block; the wave gate lives at `:14311-14430`. The withdrawal is correct |
| F-13 — AC-3.1's three-field envelope shape was not the shipped shape | Low | **Resolved** | AC-3.1 now says the set-equality is over member **ids** alone and that action/rule are the document's presentation. Verified: `ENVELOPE_DEFAULTS = Object.freeze(["E-1", "E-2", "E-3", "E-4"])` (`orchestrate-dev.js:1938`) — ids only |
| F-14 — AC-1.5's notice named no set | Low | **Resolved** | AC-1.5 now requires the notice to name **every** absent prerequisite, both where both are absent. Cardinality (one per run) unchanged |
| Q-05, Q-06, Q-07 | — | Q-05 answered inside AC-4.4 ("the run then ends on the wave's own gate halt, from that restored tree"). Q-06/Q-07 carried forward untouched; neither was gating and neither is re-raised |

Size discipline (C-5) re-checked at this round: 563 lines / 44,915 bytes, inside the 700 / 61,440 budget.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

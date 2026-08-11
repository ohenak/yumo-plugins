# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.1)
**Upstream read:** `REQ-pdlc-headless-engine.md` v0.9; `FSPEC-pdlc-headless-engine.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v1.md` (4 High, 2 Medium, 1 Low)
**Diff reviewed:** `27e77f93..HEAD` on `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (+551/−90)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** Local

## Disposition of v1 findings

Delta scope: only the sections the diff touched were re-read. Every v1 finding was answered in the
document; two of the answers do not yet hold up against HEAD, and those are re-raised below as new
findings against the *new* text rather than as unresolved old ones.

| v1 | Subject | v1.1's answer | Status |
|---|---|---|---|
| F-01 High | AC-1.3's two stop reasons had no carrier | §4.5's `loop` sub-block with `stopReason: "exhausted" \| "bound-reached"`, the two catalogue ids in §3.5, and §5.4's new paragraph stating that the exit code deliberately cannot carry the distinction | **Resolved.** The `run.mjs` citations check out: the `idle`/`no-queue` return is `:279-281` and `max-passes` is `:282`. One completeness gap remains on a path AC-1.3 does not cover — F-03 below |
| F-02 High | §4.5's `engine` block not checkable against FSPEC §12.2 | row-by-row table, nine rows, three marked "added in v1.1" (`startupAuth`, `retries[]`, `tunables`, `permissionMode`) | **Resolved as an enumeration.** I checked it against `FSPEC:1149-1160` row by row and the mapping is faithful and complete, including the six/three split. One row — per-phase dispatch counts — is not yet *satisfiable*, which is F-02 below |
| F-03 High | AC-3.3 had no owning mechanism, only verbatim pass-through | a fourth §7.4 harness row: the adapter records each descriptor's `{skill, label, model}`; observed `(phase, model)` pairs ≡ M-ENG-07's seven rows, both directions | **Not resolved.** The harness is the right shape but keys on a field no module supplies — F-01 below |
| F-04 High | AC-1.2 mapped to a section that observes nothing | new §7.7: an in-process `fs` recorder installed by the bootstrap, three clauses over one recording, two falsifying controls, a *populated* `.claude/workflows/` fixture | **Resolved, and well beyond the minimum.** See Positive Observations |
| F-05 Medium | §8.1's AC-1.5 row pointed at the CI job | repointed to §2.4 with `run.mjs:52`, `:58` and the two test citations; AC-1.2's row rewritten to §7.7 | **Resolved.** `WORKFLOW_MODULE_URLS` is at `run.mjs:52` as cited |
| F-06 Medium | two of REQ §4.1's five tunables never named | new §4.6: all five, with defaults, owner, resolution point, and three rules | **Resolved.** I re-checked each HEAD column: `adapter.mjs:57-60` (3 / 30 s / 15 min / 1 s jitter), `bin/pdlc.mjs:305` (`Infinity` when the flag is omitted), `run.mjs:273` (`maxPasses = 100` as a parameter default). The table is accurate. One reporting detail — F-04 below |
| F-07 Low | `transport` scalar vs AC-4.5's per-dispatch wording | §3.4 rewritten: no selector, `kind` constant, `"cli"` reachable only by direct unit construction, `R-TRANS-1` renamed as TSPEC-introduced after `BR-TRANS-6` was found not to exist upstream | **Resolved.** `FSPEC:193-196` says exactly what §3.4 now says |

## Findings

<!-- filled below -->

## Questions

<!-- filled below -->

## Positive Observations

<!-- filled below -->

## Recommendation

<!-- filled below -->

## Verdict

<!-- filled last -->

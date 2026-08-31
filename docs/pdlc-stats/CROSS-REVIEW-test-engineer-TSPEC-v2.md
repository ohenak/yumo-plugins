# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

## Summary

Delta re-review of TSPEC v1.1 against the commit reviewed in v1 (`b182bb1d5`), scoped to the
sections the revision touched: §3.3/§3.4 (renderer signatures, `statsParsers` export, `cmdStats`
wrapper), §4.2.1 (new — JSON key sets), §4.3 (DoD harvested reading, halt matcher), §4.4
(provisional predicate), §6.1–§6.6 (measured baselines, process-level exit-code hygiene, key-set
conjuncts, repaired anti-drift oracles, snapshot isolation, PROP-3, named mutations), §7.1, §8.2–§8.4.

**All four v1 High findings are resolved, and each repair is verified against HEAD rather than
against the document's prose.** Three new Medium findings remain, all about whether a *newly added*
oracle conjunct can actually be written in the runner it will live in; none is gating.

## Prior-Finding Disposition

| v1 finding | Severity | Disposition | Evidence at HEAD |
|---|---|---|---|
| F-01 doc-type probe used the reviewer **skill id** `se-review` | High | **Resolved** | §6.4 now spells the probe `CROSS-REVIEW-software-engineer-{T}-v1.md` and states why. Verified: `REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP))` is `software-engineer`/`product-manager`/`test-engineer` and is checked before the doc-type check (`pdlc/workflows/orchestrate-dev.js`, `MAP` and `parseReviewFilename`, §"closed role catalogue"). The probe is now green-on-correct. |
| F-02 vendoring oracle asserted equality with `MODULE_NAMES` | High | **Resolved in substance** (see F-02 below for the residue) | §6.4 restates the invariant as `MODULE_NAMES.length + 1`, with the manifest named as the `+ 1`. Verified: `pdlc/engine/scripts/prepack.mjs` `MODULE_NAMES` has **4** entries; `pdlc/engine/__tests__/_tspec-packed-set.mjs` `WORKFLOW_MEMBERS` has **5**, the extra being `vendor/workflows/VENDOR-MANIFEST.json`; `tspecPackedCount` returns `4 + 15 + 5 + 1`. The `+ 1` is the right invariant. |
| F-03 catalogue oracle was fixed-probe containment | High | **Resolved** | §6.4 now specifies **set-equality** between `REVIEW_DOC_TYPE_ROWS` and the accepted-type set computed by probing a candidate superset (`REVIEW`, `IMPLEMENTATION`, `LEARNINGS`, `POSTMORTEM`, `CODE_REVIEW`, `QUEUE`, `DOD`, `HANDOFF`), and names the residue and the alternative it declined. Every candidate is expressible under `CROSS_REVIEW_RE`'s `[A-Z][A-Z_]*` doc-type group, so `CODE_REVIEW` really can be probed. |
| F-04 whole-tree snapshot vs the suite's own in-tree writes | High | **Resolved** | §6.5 adds the declared-scratch-prefix exclusion (one exported constant in `__tests__/helpers/`, which exists) plus a guard conjunct that the constant is non-empty and nothing pre-existed under it. Verified: the only in-tree scratch is `mkdtempSync(path.join(SCRATCH_ROOT, ".tmp-capture-driver-"))` at `pdlc/workflows/__tests__/learningsCaptureScript.test.js:215` with `SCRATCH_ROOT = path.resolve(__dirname, "..")` (`:212`); `.baseline-worktree` is created inside a `mkdtempSync(tmpdir(), …)` throwaway repo (`:70`), not the checkout, so `.tmp-*` really is today's complete set. `test` has no `--runInBand`, `test:coverage` does (`pdlc/workflows/package.json:7-9`) — the parallel-worker premise holds. |
| F-05 `statsParsers` module-private | Medium | **Resolved** | §3.4's edit table adds `export async function statsParsers()` as the single production construction site. |
| F-06 `try`/`catch` described, not written | Medium | **Resolved** | §3.4 now writes the wrapper into the sketch and names it as the function the injected-throw test drives. |
| F-07 `schemaVersion` absent from the data model | Medium | **Resolved** | New §4.2.1 states it as a `renderJson` obligation with `SCHEMA_VERSION = 1`, and §6.3 asserts the literal `1`, not the module constant. Transcription checked verbatim against FSPEC BR-21 (five keys), BR-23 (three), BR-30 (three, `error` exactly `{reason, message}`) — the TSPEC's table matches the FSPEC's words. |
| F-08 grammatical vs literal `CROSS-REVIEW-*` in the harvested test | Medium | **Resolved** | §4.3 decides the grammatical reading, grounds it in REQ C-4, names the disagreeing shape (the four `CROSS-REVIEW-{role}-REVIEW-v{1,2}.md` files in `docs/completed/pdlc-advisory-wave-gate/` — verified present), pins a fixture, and routes the ambiguity as an erratum (§8.3). |
| F-09 PROP-3 could not falsify | Medium | **Resolved** | PROP-3 is restated over a **generated permutation** of the listing with a second conjunct pinning key/row order to `REVIEW_DOC_TYPE_ROWS`. That is falsifiable where the two-identical-calls form was not. |
| F-10 exclusion set asserted in prose only | Medium | **Resolved** | §6.4 adds the exclusion-set oracle with an *independent* witness (an artifact named `-{dirname}.md`, or no files). Re-derived over the live tree: all eight names are present at `docs/`, and every one of the 13 remaining directories satisfies the witness — the oracle is green at HEAD and would go red on a bare-named `docs/_evidence/`. |
| F-11 halt matcher's open phase capture | Medium | **Resolved**, with a new upstream-fidelity residue (F-03 below) | §4.3 changes the capture to `[^-]+` and adds the negative test (`POSTMORTEM-D-pdlc-stats.md` under feature `stats` yields no halt). Verified safe at HEAD: `FORCE_PHASE_TOKENS = ["R","F","T","P","D","PR"]`, every construction site spells `POSTMORTEM-${phase}-${feature}.md` (`orchestrate-dev.js:8618`, `:9402`, `:10600`, `:15293`, `:18243`), and all 21 post-mortems on disk carry hyphen-free phases (`D`, `F`, `I`, `P`, `PR`, `R`, `T`). |
| F-12 `malformed` "deduped" | Low | **Resolved** | §4.1's comment now says "in listing order (no dedup step …)". |
| F-13 `cwd` spelling drift | Low | **Resolved** | §3.4 fixes `argv`, the single `cwd` resolution at the edge, and the `await`. |
| F-14 inventories, not baselines | Low | **Resolved** | §6.1 adds the asserted-value table. Re-measured at HEAD: AT-09 `TSPEC` = **6** (`…-TSPEC-v1…v6.md` present under `docs/completed/pdlc-advisory-wave-gate/`), AT-10 = **13** (`CROSS-REVIEW-software-engineer-TSPEC-v13.md` is the sole survivor), AT-11 = **2** (`CODE_REVIEW-pdlc-loop-economics-v{1,2}.md`), AT-14b = `D, F, I, T` exactly, AT-13's marker reads `RESOLVED: yes` at line 3. Every literal in the table is correct. |
| Q-03 shared `process.exitCode` | — | **Answered** | §6.2 names `captureRun` in `pdlc/engine/__tests__/loop-cli.test.js:386` and its extension. Verified: the helper saves `process.exitCode` before the call, reads it after, restores it, and swaps `console.log`/`console.error` — so the stated extension (also swapping `process.stdout.write`/`process.stderr.write`) is exactly the delta needed. |

## Findings

<!-- pending -->

## Questions

<!-- pending -->

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->

## Verdict

<!-- pending -->

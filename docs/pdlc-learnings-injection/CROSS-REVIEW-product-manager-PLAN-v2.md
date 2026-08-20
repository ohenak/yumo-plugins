# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.2)
**Date:** 2026-08-20
**Iteration:** 2
**Mode:** delta re-review — prior findings PM F-01…F-06 (v1, commit `6d12d4ba`) against the current PLAN at HEAD; changed sections only.

## Prior findings — disposition

| Prior | Severity | Status at v0.2 | Evidence |
|---|---|---|---|
| F-01 — AC-3.3's run-level `ruleInputs.thresholds` locus had no owning green task | High | **Resolved** | §Batches LI-21 now builds `learningsInjection.ruleInputs.thresholds` "**once per run** from the parsed config — the three REQ §4.1 values actually in force (`maxDocuments`, `maxBytesPerDocument`, `maxTotalBytes`) … its completeness test is set equality over `Object.keys(learningsInjection.ruleInputs.thresholds)`". The record an operator needs to reproduce a selection by hand (REQ AC-3.3) is now scheduled, named, and given a set-equality oracle rather than a containment one |
| F-02 — `learningsRecord.test.js`'s BR-10 run-level completeness test was attributed to a green task that could not green it | High | **Resolved** | §Batches LI-10 now splits the two BR-10 loci explicitly — locus 1 greened by LI-19 at batch 11, locus 2 (`ruleInputs.thresholds`) greened by **LI-21** at batch 13 — and §Traceability carries a dedicated `AT-22 (L3, split green — BR-10's two loci)` row. The `learningsRecord` suite is now split the same way `learningsDispatchSet` already was |
| F-03 — FSPEC AT-15's report clauses had no green task that could satisfy them | High | **Resolved** | LI-07 now states AT-15 is "written whole, and is therefore not greened whole by LI-16", names all three FSPEC clauses, and pins the scoping sentence I asked for: "'Eligibility/ordering/count only' scopes which *rules* this suite asserts, never a licence to drop AT-15's report clauses". LI-19 lists `learningsSelect.test.js` as a second green target and gains the `LI-19 → LI-07` red-before-green edge in §Dependencies. REQ AC-2.6's `docs/discarded/` rule is now tested in both halves |
| F-04 — the batch 7–14 full-suite-green gate contradicted the PLAN's own red-first schedule | High | **Resolved** | §Verification's "two gate wordings" is now three, and batches 7–13 carry a **per-batch expected-red ledger** stated in test names where a suite is split (`LI-AT-15`, `LI-AT-22` locus 2, `LI-AT-23`/`LI-AT-24`/`LI-AT-31`). The ledger shrinks monotonically and reaches empty after batch 13, so batch 14's unqualified gate is a restatement. Deliberately-red suites can no longer read as batch failures |
| F-05 — the fixture helper's declared surface omitted AC-2.6's corpus path shapes | Medium | **Resolved** | LI-02 now declares "declared repository paths — path shape is part of the spec surface, because AC-2.6's eligibility rule is a path rule" and ships the three named corpora `DISCARDED-NESTED`, `DISCARDED-DIRECT`, `COMPLETED-MIXED` for AT-15/AT-16 |
| F-06 — raw `file:line` anchors (DEC-DOC-01) | Low | **Resolved** | The §Overview change-surface table now resolves every symbol by name (`MERGE_CONFIG_PATH`, `parseAdvisoryConfig`, `reviewLoop`, `dispatchAndVerify`, `main`, `buildFinalReport`, `LS_FILES_ARGV`, `enumerateCorpus`, `fakeFs`, `fakeGit`); no `:NNNN` anchor survives in the document |

Verified independently at HEAD on `feat-pdlc-learnings-injection`: `pdlc/workflows/__tests__/` contains **no** file matching `learnings` (case-insensitive), so all fourteen new test files are correctly declared new; the repository root has no `scripts/` directory; `git check-ignore -v .baseline-worktree` exits 1; `pdlc/workflows/package.json`'s `c8.include` is exactly `["orchestrate-dev.js", "orchestrate-queue.js", "build-runtime.mjs"]` and `test:coverage` is the two-stage `&&` script the PLAN describes; `buildFinalReport` takes a `notices = []` parameter (`pdlc/workflows/orchestrate-dev.js`, the `buildFinalReport` signature); a literal grep for `dispatchKind: "authoring"` in `orchestrate-dev.js` returns **3**, exactly as LI-01's TE F-12 phrasing now says; `__tests__/consumerCleanup.test.js` does assert over `git status --porcelain`.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

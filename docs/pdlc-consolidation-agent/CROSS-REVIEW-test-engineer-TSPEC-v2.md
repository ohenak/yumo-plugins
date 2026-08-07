# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.1)
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Delta re-review. Baseline `e323aa2` (the bytes v1 reviewed) → HEAD; 594 insertions, 89
deletions. Two passes only: (1) each of v1's fifteen findings, verified resolved against the file and
against the code it cites; (2) the changed sections, read for new issues. Unchanged sections already
approved are not re-litigated. The approval bar is unchanged — any open High or Medium means
**Needs revision**.

## Disposition of v1 findings

All fifteen are resolved. Each was re-verified against the repository, not against the revision's
prose.

| v1 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | High | **Resolved** | §7.1 now enumerates through `_git(["ls-files", "--cached", "--others", "--exclude-standard", "--", ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"])`. I ran it: **5** hits at HEAD, and the `:(glob)` claim is exact — without the magic prefix the same pathspec returns **7**, the two extras being `docs/discarded/pdlc-rcv-budget-stop/` and `docs/discarded/pdlc-review-convergence/`, precisely as §7.1 states. `rtGit` (`runtime-adapter.js:945-957`) shell-quotes each argv element (`:949`), so the pathspec rides through intact. §13.1 row 10 records the decision |
| F-02 | High | **Resolved** | §5.1 transcribes the real `ListReply` union verbatim, and §11.2 marks `fakeListFiles` "wired for protocol completeness only. **No consolidation test drives it**". §10.3 row 1a gives the unlistable corpus its own row with the three-conjunct observable (status `failed`, the pathspec and `stderr` in the report body, never `no-op`) |
| F-03 | High | **Resolved (in part — see F-02 below)** | §5.6(a) states the widening, §9.2 withdraws "no new capability is needed", §11.3(e) states the pinning assertion and §11.6 withdraws the exemption. The `_writeFile` half is right: `runtime-adapter.js:805` does read "relative to the repository root". The `_readFile` half is not — F-02 below |
| F-04 | High | **Resolved, and verifiably** | I enumerated the FSPEC's AT register (`| AT-…` rows) and §12.3's file table independently and diffed them: **96 ids each, set-equal in both directions, zero on either side of the difference.** AT-C1b, AT-Q7b and AT-Q7c all now have a file. `consolidationTraceability.test.js` makes the equality a test with an injected `root` — the right fix, since it fails on the *next* suffixed AT too |
| F-05 | High | **Resolved** | §7.1 adds the env-gated `PDLC_PENDING:` stderr line and §11.3(f) specifies AT-P7's oracle with a third conjunct (each set equals a literal transcription), so two implementations both returning `∅` no longer agree. The hook citations are all correct: `THRESHOLD = 5` at `:25`, the predicate at `:41`, `n >= THRESHOLD` at `:43`, the message at `:44-48`, `PY_BIN` at `:13-20`. The snippet is implementable as written — `pending` exists at `:41` and both `os` and `sys` are imported at `:23`. §13.1 row 12 records it and makes row 6 conditional on it |
| F-06 | Medium | **Resolved** | §11.3(c) now grows **both** axes and names them: `AWAIT_SCAN_SOURCES` (`runtimeBundle.test.js:1040`) and `AT19_SEAM_NAMES` (`:215-223`) — I confirmed neither `_envPresent` nor `_makeTempDir` is on the shipped list, so the extension is necessary and not decorative |
| F-07 | Medium | **Resolved** | §7.3's take is now `read → verdict → write → read back → parseMarker → confirm passId`, §10.3 row 5a carries it, and the AT is positive on both sides (terminal status **and** the marker's content on disk). The adapter comment it leans on is real — `runtime-adapter.js:798` |
| F-08 | Medium | **Resolved** | `read-remote` and `read-index` are now their own verbs; §9.3 withdraws the fold on its own terms and §13.1 row 9 no longer asserts the opposite |
| F-09 | Medium | **Resolved** | `resolveSeamDomain` is exported and total, returns `"git-clone"` for the prefix-free `clone` call by name, and §11.3(a) adds the **partition** assertion as a fourth — which was the part that mattered |
| F-10 | Medium | **Resolved** | T-07 is discharged by `consolidationBuild.test.js` reading the tracked `.gitignore`; §12.2's row says why a maintainer check is not one |
| F-11 | Medium | **Resolved** | §11.4's second table pairs each invariance with a positive conjunct, and names `mergeProposals` as the subject rather than `failureModeId` |
| F-12 | Medium | **Resolved** | §11.3(b) gains the authority-file leg with three-way set equality and the `Version` 1.4 pin, parser as a pure function of an injected `root` |
| F-13 | Low | **Resolved** | §5.6(b) reclassifies `_now` as a module-level default and states the host-timezone consequence and the `TZ` pin |
| F-14 | Low | **Resolved** | §3.3's fixture clause is deleted; the gitignore(5) ground stands alone |
| F-15 | Low | **Resolved** | `:1820-1826` |

## Findings

Five new, all in changed sections.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §12.2's new T-11/T-12 rows bind six of their nine named ATs to FSPEC register ids whose text asserts something else entirely — and §12.3's set-equality oracle structurally cannot see it | §12.2 |
| F-02 | Medium | Local | `rtReadFile` carries no "relative to the repository root" clause; §11.3(e)'s oracle pins text that does not exist in one of the "both prompts" it names | §5.6(a), §5.5, §9.2, §11.3(e) |
| F-03 | Medium | Local | The F-01 fix split T-08's two implementations at the *enumeration* seam, and AT-P7 feeds both from one basename list — so the new divergence is invisible to the only test pinning T-08 | §7.1, §11.3(f), §12.2 T-08 |
| F-04 | Medium | Local | §10.1's normative `finishPass` is sync-declared with two `await`s and an un-awaited seam-backed append; §10.2 returns it un-awaited. §11.3(c)'s audit cannot see any of it | §10.1, §10.2 |
| F-05 | Medium | Local | "`routeOf`'s outcome set is FIVE-valued" is wrong — the reachable set is four; `"degraded"` is unreachable from either routing function, and no name exists to write the set-equality oracle against | §7.6 |
| F-06 | Low | Local | `runtime-adapter.js:806-807` cited three times for a clause that is at `:805` | §5.5, §5.6(a), §9.2 |
| F-07 | Low | Local | §11.1's "asserts once, unconditionally, that the probe either found an interpreter or recorded the notice" is a tautology over the harness's own branch — it can only pass | §11.1 |

## Detail

## Detail

## Questions

## Positive Observations

## Recommendation

## Verdict

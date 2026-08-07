# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.2)
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Local (per-finding tags in the table)
**Delta base:** `ea5be5a` (the commit carrying my v2 review) → HEAD `e75feca`; `git diff` over the document is 251 insertions / 62 deletions across §1.1 (T-08), §3.1, §3.2, §4.1, §5.5, §5.6, §7.1, §7.3, §7.6, §8.3, §10.1, §10.2, §10.3, §10.4, §11.1, §11.2, §11.3(e)/(f), §11.4, §12.2, §12.3, §12.4, §13.1 and §13.3. Only changed sections are re-read; unchanged sections approved earlier are not re-litigated.

## Prior findings — disposition

| v2 ID | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-07 | Medium | **Resolved** | The read-side widening is withdrawn, and withdrawn on measurement rather than by softening the prose. §5.5 now splits the one row into two — `_writeFile` "repo-root-relative today, and that is a blocker", `_readFile` "**already absolute-safe; no change**" — §5.6(a) is retitled "One adapter contract this feature changes, one it deliberately leaves alone", §9.2 states "Only the **write** prompt changes", §13.1 row 11 records widening `rtWriteFile` **alone** with "widen both prompts for symmetry" as the rejected alternative, and §13.3's PLAN hand-off says "§5.6(a)'s **one** prompt widening (`rtWriteFile`; `rtReadFile` is not edited)". Every empirical claim behind that verifies at HEAD: `relative to the repository root` occurs in `pdlc/workflows/runtime-adapter.js` **exactly once**, at `:805`, inside `rtWriteFile` (`:802-811`); `rtReadFile` is `:493` and its transport carries the *cwd* instruction "Run this exact command from the repository root" at `:374`, which resolves an absolute path verbatim. §11.3(e) is re-scoped to `rtWriteFile`'s prompt with two conjuncts — the widened clause verbatim, **and** an occurs-exactly-once count that falsifies the opposite mistake — and states positively why no `rtReadFile` assertion exists ("an assertion there could only pin text that does not exist — which reds on a correct tree and gets 'fixed' by deletion"). That is a stronger repair than the one I asked for. **My v2 sub-claim (iii) was wrong and I withdraw it:** I reported the shipped bytes as `relative to repository root`; they are `relative to the repository root`, exactly as this document quotes. The document's transcription was right and my correction of it was not. |
| F-08 | Low | **Resolved** | All six pointers corrected and re-verified at HEAD: `build-runtime.mjs:44` is `stripModuleSyntax`'s doc comment (`:45` the declaration) and `:54`/`:55` the same for `wrapModule`; the `rtWriteFile` prompt clause is `:805`; the function is `:802-811`; `rtListFiles`'s transport line is `:915` (`:913` is the `__PDLC_NOT_A_DIRECTORY__` arm); the reply validator's separator rejection is `:929-931`; and the `Route` row is `docs/_constraints/pdlc-consolidation-vocabularies.md:57`, inside §1's `:38-65` table, with `Version` `1.4` at `:7`. §13.1 row 10 and §12.4 carry the corrected forms too. |
| F-09 | Low | **Resolved** | §10.1's snippet is `async function finishPass(state)` with all three steps awaited, and a new normative paragraph states that `main()` writes `return await finishPass(state)` at **every** terminating branch; §4.1 and §10.2's two `catch`/`kind` returns are updated to match. Better than the minimum: the revision explains why §11.3(c)'s identifier scan and every sync-double suite are structurally blind to this, and mints T-13 plus `consolidationLifecycle.test.js` and §11.2's `asAsync` wrapper to make it falsifiable — an oracle read **after** `main()`'s promise resolves, with a positive conjunct (terminal row present) beside the negative (marker absent). |

Questions Q-04, Q-05 and Q-06 are all answered. Q-04: §7.1's new paragraph routes the `PDLC_PENDING:` stderr line as **production code** owned by the hook's implementation task, and names the release note. Q-05: §8.3 states that no AC owns the drift-gate interruption and argues why an AC would be the wrong home, leaving §13.3's release-note obligation as the whole discharge — an acceptable answer, since the mechanic is the shipped gate's, not this feature's. Q-06: §7.6 and §12.4 now specify the two-fixture control in `consolidationReport.test.js` (routed propose-only vs. `branch-exists`-degraded, identical `route: "degraded"`, reason code present in one report body and absent in the other, both directions), so the ER-6 discriminator is asserted rather than asserted-about.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

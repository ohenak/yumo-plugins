# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.2)
**Date:** 2026-08-19
**Iteration:** 2

Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v1.md`. Diff read over
`c61443d5..HEAD` (eight commits touching this document). Scan limited to changed sections;
unchanged sections already reviewed in v1 are not re-litigated.

## Previous findings — disposition

| v1 ID | Severity | Status | Evidence in v0.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | DEC-LI-02's Constraints row now states the two channels disagree: `defaultGit` converts a non-zero exit into `{ok: false}` inside `try` (`orchestrate-dev.js:11666`), `rtGit` awaits `RT.agent` with no `try` (`runtime-adapter.js:1004`) and so rejects. The doc also disposes of the misleading docblock ("never throws", `runtime-adapter.js:995`) correctly — it describes `rtParseTransportReply`'s totality over a reply that arrives, not the transport. DEC-LI-04's Constraints row follows: `ok`-check **and** a `catch` around the enumeration call. `D-O-7` obliges a **rejecting** `_git` double, which is the missing test double v1 named. |
| F-02 | High | **Resolved** | DEC-LI-09 now makes the recorded sha an oracle surface: `git merge-base --is-ancestor <recorded-sha> HEAD` plus a symbol-absence check via `git show <sha>:pdlc/workflows/orchestrate-dev.js`, with the entry naming conjunct 2 as load-bearing and conjunct 1 as insufficient alone. `D-O-2` carries both assertions, owner widened to PLAN + PROPERTIES so the ordering promise now has a named oracle. (One refinement below, F-01.) |
| F-03 | High | **Resolved** | `D-O-6` adds the positive call-count oracle: `_git` enumeration calls equal the number of injecting dispatches, `_readFile` calls likewise, **plus** the two E-32 behavioural cases, with the doc stating explicitly that the count conjunct is required on its own because "the behavioural case alone is satisfiable by a memo keyed on something that happens to change". That is the exact argument v1 asked for, and the Consequences bullet now ties it to the Hard-to-reverse ranking. |
| F-04 | Medium | **Resolved** | DEC-LI-03 gains "The funnelling premise needs its own guard" plus `D-O-8`. The producer set is correct at HEAD: three `dispatchKind: "authoring"` literals (`orchestrate-dev.js:13515` phase creator in `converge`, `:12821` erratum author, `:12915` land-proof retry) and one positional `"authoring"` to `runWrapped` (`:7663`, `reviewLoop`'s optimizer round) — four members, as transcribed. |
| F-05 | Medium | **Resolved** | `D-O-3` extended with totality properties over `parseLearningsConfig`, `looksLikeLearningsDocument` and `parseHarvestDate`, and the per-key invariant is stated as "either the configured value or its REQ §4.1 default and never `undefined`". The added rationale — `parseLearningsConfig`'s output is the feature's sole gate under DEC-LI-07, so a throw takes the dispatch down — is the right reason. |
| F-06 | Low | **Resolved** | Every re-evaluation trigger in DEC-LI-03/-05/-06/-07/-10 is now labelled *Mechanically detected* or *Review-time judgement*, and the two judgement triggers that admit a cheap proxy carry one with a number: corpus document count ~30 (DEC-LI-06) and ~15 catalogue members (DEC-LI-10). The 2 MiB `RT_READ_CACHE_MAX_BYTES` ceiling (`runtime-adapter.js:124`) is used as the second prompt, which answers v1's Q-01 in passing. (One label is overstated — F-02 below.) |

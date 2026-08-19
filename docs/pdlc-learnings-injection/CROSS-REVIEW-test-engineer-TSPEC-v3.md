# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-19
**Iteration:** 3

**Scope:** delta re-review of `217444e3..HEAD` (147 insertions, 23 deletions), the seven commits
addressing my v2 findings plus PM-routed edits. Sections untouched by that diff are not
re-litigated.

## Resolution of v2 findings

| v2 | Finding | Verdict | Evidence in v0.4 |
|----|---------|---------|------------------|
| F-01 | High — AT-30/AT-32 in an L1 suite that cannot falsify their clauses; wrong AT ids in prose | **Resolved** | §T.5's table now reads `learningsConfig.test.js … 2 … **L3** (seam-driven whole run)`, and a new paragraph states why each clause needs a whole run (AT-30's "BR-8 rows present and empty" is only distinguishable from a disabled run by the presence of the `learningsInjection` key in the finished report; AT-32 needs the report's notice channel *and* a composed prompt). The cited pattern is real: `advisoryDisabled.test.js` drives the pipeline entrypoint at `:530` and `:591`. AT counts are unchanged and still sum to 35, because the pure `parseLearningsConfig` assertions are declared AT-less supporting tests. |
| F-02 | High — §A.2's per-dispatch invariant owned by no AT, and AT-23 miscited as its owner | **Resolved** | §A.2 now says plainly that no FSPEC AT owns it, withdraws the AT-23 claim, and §T.6 adds the `RETRY-ITERATION` case with three assertions. Assertion 2 (exactly one `LEARNINGS_CORPUS_ARGV` `_git` call, read off the double's call log) is the one I wanted and it is implementable as written: `seams.js`'s `fakeGit` records every call on `git.invocations` (`pdlc/workflows/__tests__/helpers/seams.js:425-441`), with `callCount`/`commands` alongside. The fixture's premise also holds — the PLAN-lint feed-forward mutates `opener` inside the retry loop at `orchestrate-dev.js:8972-8977` and the prompt is composed from the mutated `opener` at `:8978`. |
| F-03 | Medium — AT-29's fixture-provenance sentence repeated the ERR-5 defect | **Resolved** | The claim is now "token occurrences … every one of them inline … **zero** occur line-initial at HEAD", and the fixture is declared a deliberate strengthening rather than a transcription. I re-measured the nine corpus documents (`docs/*/LEARNINGS-*.md` + `docs/completed/*/LEARNINGS-*.md`, the P-4 pathspec, which excludes `docs/discarded/`): six carry at least one occurrence, `LEARNINGS-pdlc-review-loop-hardening.md` carries occurrences on seven lines, and line-initial occurrences are zero across all nine even allowing leading whitespace. The falsifiability argument (trailer-sensitive parsers ⇒ line-initial is the contaminating shape) is the right justification. |
| F-04 | Medium — three swapped AT citations and a stale "three-notice" count | **Resolved** | §I.2 now assigns row 1 to AT-31, rows 2–3 to AT-32's two cases, and states "AT-30 owns none of them". That matches FSPEC's own traceability (`AC-5.1a → AT-31`, `AC-5.1b/AC-5.1c → AT-32`, `AC-4.4 → AT-30`, FSPEC `:115-118`; E-21/E-22 → AT-31, E-23/E-34 → AT-32). The closure is now a **two**-notice set equality against the frozen `LEARNINGS_NOTICES` literal, and §T.7's arm table reads `AT-32 (second case)`. |
| F-05 | Medium — porcelain instrument would be relaxed into uselessness against the checkout | **Resolved, and better than asked** | The check now runs in a dedicated temp git repository that is the L3 run's `cwd`, with fixture inputs committed before the capture and **no exemption list at all** — which also answers PM Q-01's "an exemption list is where the defect gets parked". The instrument is sound for this module: `orchestrate-dev.js` contains no `process.cwd()` and no `import.meta.url`, so its file paths are cwd-relative and an accidental write does land inside the temp repo where the delta can see it. |
| F-06 | Medium — `docType` conjunct diverges from FSPEC BR-1, undocumented route | **Resolved** | §A.2 now names the divergence and routes it as **ERR-7**, and the errata section states the AT-02 double-reading explicitly. FSPEC BR-1 is unchanged at HEAD (`:239` onward still reads "consumes the classification, it does not restate the membership"), so the erratum is still live — I re-route it below. |
| F-07 | Low — duplicated word in §D.4 | **Resolved** | Line 603 now reads "prefix. The `\b`-anchored prefix match…". |
| Q-02 | first-dispatch `corpusDiverged` | **Answered** | `false`, never `null`, with the `.every(r => r.corpusDiverged === false)` assertion named as the reason. |
| Q-03 | guard-test digest assertion: set equality or containment | **Answered** | Set equality on `{caseId}` keys, with the deleted-baseline-case failure mode spelled out. |

Both blocking findings are discharged by structural changes, not by argument. The findings below
are new and all sit inside sections this revision rewrote.

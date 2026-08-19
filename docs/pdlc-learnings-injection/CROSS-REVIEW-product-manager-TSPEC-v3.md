# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-19
**Iteration:** 3
**Scope:** Delta re-review of prior findings F-01…F-03 (`CROSS-REVIEW-product-manager-TSPEC-v2.md`), plus new issues in the sections changed between `b5335f34` and `0dc24641`.

## Prior findings disposition

| Prior | Severity | Status | Evidence in v0.4 |
|---|---|---|---|
| F-01 | High | **Resolved** | The `notices` key is gone from §D.2's record literal. In its place TSPEC:537-539 carries an explicit negative comment ("NO `notices` key here — see §I.2 …"), and §D.5 adds a paragraph ("Notices are not a member of this record", TSPEC:553-560) that states *why* in AC terms: AC-5.1b's state must produce AC-5.1a's behaviour (`learningsInjection` absent) **and** a report carrying `NTC-MALFORMED`, which is unsatisfiable if the notice's only home is the absent key. The three config states are now byte-distinguishable in the report, which is what AC-5.1a/b/c together require (REQ:366-372). §I.2 and §D.2 no longer specify two incompatible record shapes. |
| F-02 | Medium | **Resolved** | §A.5 gains "Scoping AC-3.3, and what is left to REQ" (TSPEC:283-296): on a stable corpus the run-level record *is* AC-3.3's locus and last-write-wins is an identity, so AC-3.3 holds as written; the per-dispatch `{corpusOutcome, orderKeys, corpusDiverged}` fields are named an **extension** for the divergent case, explicitly additive, explicitly not a reinterpretation. Whether AC-3.3's locus should be restated is routed as **ERR-6** against REQ (TSPEC:1144-1154) rather than settled here. That is exactly the routing I asked for, and the extension is honest about the design being invariant under either resolution. |
| F-03 | Low | **Resolved** | TSPEC:603 now reads "prefix. The `\b`-anchored prefix match…" — the duplicated article is gone. |

No prior finding is unresolved, and none was resolved by narrowing a claim rather than by meeting it.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | `Local` | **§A.5 mis-describes what AC-3.3's completeness test asserts over.** TSPEC:296 closes the scoping paragraph with "the design does not change under either resolution — only which rows AC-3.3's completeness test is asserted over." AC-3.3's set-equality test is over its **two members** — the per-document ordering key value and the §4.1 thresholds in force ("Those two members are a closed set: a completeness test asserts set equality over them", `REQ-pdlc-learnings-injection.md:331-332`) — not over dispatch rows. What a divergent run changes is *which record those two members are read from*, never the membership of the set. As written the sentence invites a PLAN task to widen a closed two-member set-equality into a per-row assertion, which would weaken exactly the completeness oracle AC-3.3 buys. Fix: restate as "only which record AC-3.3's two-member completeness test reads its inputs from". No design change. | AC-3.3 |

No High or Medium findings. Both prior blocking concerns are closed, and every new claim in the changed sections that I could check against the repository holds (see Positive Observations).

## Questions

| ID | Question |
|----|---------|
| Q-01 | §T.6's porcelain instrument now runs in a temp git repository that is the L3 run's `cwd`, with no exemption list — which answers my v2 Q-01 cleanly. It is `cwd`-scoped by construction, so a write to an absolute path outside the temp repo is invisible to it; TSPEC already says the static seam scan is what "proves it for every run" (TSPEC:987-989), so I read the pair as complete. Confirming for PLAN: is the static scan's diagnostic (naming the offending symbol) the intended primary failure signal for NG-4, with the porcelain delta as the corroborating one? |

## Positive Observations

- **Every new grounded claim in this round checks out against the repository, including the ones that cost the author their previous sentence.** I re-measured the corpus predicate myself (`ls-files … :(glob)docs/*/LEARNINGS-*.md`, `:(glob)docs/completed/*/LEARNINGS-*.md`, TSPEC:316-320): it selects exactly 9 documents at HEAD; exactly 6 of them contain `VERDICT:`/`ERRATUM:`/`REVISION-COMPLETE:` occurrences; `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` carries exactly 7; and **zero** occurrences are line-initial in any of the 9. The revised AT-29 §1 states precisely that, and then says the fixture is a *deliberate strengthening* rather than a transcription — the ERR-5 lesson applied to the author's own prose without being asked twice.
- **The AT-30/31/32 re-attribution is a correction toward FSPEC, not away from it.** FSPEC's traceability rows read AC-4.4 → AT-30, AC-5.1a → AT-31, AC-5.1b → AT-32, AC-5.1c → AT-32 (`FSPEC-pdlc-learnings-injection.md:115-118`), and AT-32's own text already carries the **two**-member set-equality closure over `NTC-MALFORMED`/`NTC-KEYTYPE` (`:870-871`), matching the notice catalogue (`:496-501`) and TSPEC's `LEARNINGS_NOTICES = Object.freeze(["NTC-MALFORMED", "NTC-KEYTYPE"])` (TSPEC:499). The earlier "three-notice closure" would have red-lined a correct implementation on day one; the row-by-row ownership table now says which AT proves each config state, and AT-31's home suite (`learningsDispatchSet.test.js`, §T.5) is consistent with it.
- **The `learningsConfig.test.js` L1→L3 reclassification is argued from the acceptance criteria, not from test taste.** AT-30 requires BR-8 rows "present and empty, **not** the absent key of a disabled run" (`FSPEC:855-858`) — a distinction only a finished report exhibits — and AT-32 requires a byte-for-byte composition match plus a run-level notice. A unit test over `parseLearningsConfig` can falsify neither. The named precedent exists (`pdlc/workflows/__tests__/advisoryDisabled.test.js`), and the AT count is untouched (2 + 9 + 3 + 3 + 6 + 12 = 35), so the closure argument survives the move.
- **`RETRY-ITERATION` names a real hazard and gives it a non-vacuous oracle.** The cited seam is genuine: `dispatchAndVerify` (`pdlc/workflows/orchestrate-dev.js:8862`) composes inside `for (;;)` (`:8938`), the PLAN-lint feed-forward mutates `opener` (`:8972-8977`), and the prompt is built from the mutated opener at `:8978`. TSPEC also does the harder thing — it shows *no* existing AT is sensitive to the bug (AT-02 is set equality over which dispatches carry a block, AT-33 over read paths, AT-14 over two whole runs) — and then pairs a negative (no duplicate `dispatches[]` row) with a positive count assertion (exactly one `LEARNINGS_CORPUS_ARGV` `_git` call), so the fixture fails fast even when a moved corpus happens to select identically.
- **`corpusDiverged: false` on the first dispatch makes the stable-corpus claim assertable.** `dispatches.every(r => r.corpusDiverged === false)` is now a total predicate rather than one with a `null` hole, which is what lets AC-3.3's stable-corpus case be proved rather than assumed (TSPEC:270).
- **The guard-test digest assertion moved to set equality over `{caseId}` keys.** Containment would let a silently deleted baseline case pass — and a deleted case is exactly how a byte-identity failure disappears instead of surfacing. This is the completeness bar applied to the fixture manifest itself.
- **Both upstream conflicts are routed, not absorbed.** ERR-6 (REQ AC-3.3 locus) and ERR-7 (FSPEC BR-1's `docType` conjunct) are recorded with the evidence a document author needs. I verified ERR-7's premise independently: Phase CR calls the shared `reviewLoop` with `docType: null` over a directory target (`orchestrate-dev.js:14551-14556`), the `null` survives as `roundDocType` (`:7306`) and reaches `dispatchAndVerify` with `dispatchKind: "authoring"` (`:7342-7358`), while BR-1 as written forbids restating the membership (`FSPEC:241-243`). An `se-author` optimizer round remediating shipped code is authoring-classified and is exactly what C-1 excludes, so AT-02 does have two contradictory readings today. TSPEC is right that it cannot amend BR-1.

## Recommendation

**Approved with minor changes**

The single High finding from v2 is resolved, and resolved with a stated reason rather than a silent deletion — §D.5's new paragraph means a future editor who re-adds `notices` to the record will read why it cannot live there. F-02's routing is correct and F-03 is gone. One Low finding remains (F-01, a one-sentence restatement in §A.5); it is not gating and can be folded into the next edit of any section.

Change to make:

1. **F-01 (Low)** — TSPEC:296: restate "which rows AC-3.3's completeness test is asserted over" as "which record AC-3.3's two-member completeness test reads its inputs from", per `REQ:331-332`.

## Verdict
VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AT-32's byte-identity operand is unnamed, and the L1→L3 relabel silently widened the baseline matrix without saying so.** FSPEC AT-32 requires the composition to match **AT-31's byte-for-byte**, but AT-31 now lives in a different suite (`learningsDispatchSet.test.js`, §T.5) from AT-32 (`learningsConfig.test.js`), and no section says what AT-32 compares against. Two readings, with different strengths: (a) the committed pre-feature baseline at `__tests__/fixtures/learnings-baseline/{caseId}/{dispatchIndex}.txt`, which is a genuine external oracle; (b) a sibling disabled-run prompt produced in the same suite by the same post-feature code, which derives the expected value from the code under test — a mutation appending bytes to *every* authoring prompt passes it. Reading (b) is the one an implementer reaches for, because §T.3 describes the capture harness as driving "the L3 fixture matrix … from `learningsDispatchSet.test.js`" and never says `learningsConfig.test.js`'s config-state cases are in the matrix at all. AT-31 would still red under that mutation, so this is not a hole in the feature's coverage — but it is a hole in this suite's oracle. Fix in one sentence: state that AT-32 asserts byte-identity against the recorded baseline `{caseId}` for its own case, and that the config-state cases are members of §T.3's capture matrix (which also extends the guard test's hand-transcribed `{caseId}` set-equality by those constants). | §T.5, §T.3 |
| F-02 | Medium | Local | **`RETRY-ITERATION` is fully specified but has no suite file and no row in the table PLAN derives tasks from.** §T.5 states its own contract: "Every AT listed individually appears in exactly one row … so PLAN can derive per-suite tasks mechanically and a reviewer can check completeness by counting". `RETRY-ITERATION` deliberately carries no AT id ("not counted in the 35-AT closure"), which is right — but it therefore appears in no row of that table, and §T.6 names the fixture without naming the file the three assertions live in. The mechanical PLAN derivation produces six suite tasks and no owner for this case; nothing in the 35-AT closure or the `learningsSuiteMap` assertion reds if it is never written, which is the same unowned-invariant failure v2 F-02 raised, one level down. Give it a home: a named file (or an explicit "lives in `learningsDispatchSet.test.js` as an AT-less case"), plus a §T.5 note that the suite map's disjointness/equality assertion is over AT-bearing tests only so the extra case does not red it. | §T.6 (`RETRY-ITERATION`), §T.5 |
| F-03 | Low | Local | **Mis-citation in the new §T.5 paragraph: `advisoryDisabled.test.js` has no default export.** The text reads "on the `advisoryDisabled.test.js` pattern (that file's default export runs the pipeline the same way)". The file exports nothing; what it does is `import mainDev, * as dev from "../orchestrate-dev.js"` and call `mainDev({…})` at `:530` and `:591` — the default export of **`orchestrate-dev.js`**. The pattern claim is correct and the anchor is the right file; only the possessive is wrong. Worth fixing because a PLAN author following the sentence literally will look for an export that is not there. | §T.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | `RETRY-ITERATION`'s assertion 3 compares iteration 2's prompt to iteration 1's, "differs only inside `opener`". How does the test *partition* the prompt into `opener` and the rest — by locating the block substring and the `PACING_CONTRACT_CLAUSE` sentinel, or by re-deriving the expected opener? The second construction would re-implement `planLintFeedForwardClause` inside the test; the first is a pure structural check on captured bytes and is what I would expect the wording to mean. One clause naming the partition would settle it. |
| Q-02 | The porcelain instrument now chdirs the L3 run into a temp repository. Is the cwd restored in teardown, and is the case guaranteed not to run concurrently with another suite in the same worker (`process.chdir` is process-global under Jest)? Not a correctness objection — the design is right — but a flaky-teardown note in §T.6 would save the PLAN author from discovering it. |

## Positive Observations

- **Both High findings were answered by changing the design, not by defending the text.** The L1→L3 relabel is the honest fix rather than the cheap one: it concedes that a suite named for configuration must be instrumented as a whole run, and it keeps the file name because the *subject* really is the config states. That distinction — subject versus instrument — is worth carrying into the PLAN's task titles.
- **`RETRY-ITERATION`'s assertion 2 is the strongest single assertion added in this feature so far.** A call-count oracle on the enumeration argv fails fast under the loop-placement bug *even when the moved corpus happens to select identically*, which is exactly the case a bytes-comparison alone would false-green. The document says so in as many words ("assertion 2 is the one that fails fast … assertion 3 is the one that fails when it does not"), which is a falsifiability argument rather than a stronger assertion.
- **The F-05 fix went past what I asked for.** I asked for a temp repo; the revision also deleted the exemption list entirely and explained *why* the list is the hazard ("that list is exactly where someone would eventually park a state file NG-4 forbids"). An instrument with no judgement call in it cannot be quietly relaxed. I verified the premise that makes it work — `orchestrate-dev.js` resolves paths cwd-relatively, with no `process.cwd()` or `import.meta.url` anywhere in the module.
- **The AT-29 provenance sentence is now the model for how to state a fixture's relationship to reality.** "Six documents carry token occurrences, all inline, zero line-initial; the fixture is deliberately stronger, and here is why line-initial is the contaminating shape" is checkable, was checked, and holds at HEAD. Compare the v0.3 sentence it replaced, which asserted the corpus contained something it does not.
- **ERR-6 is a good erratum.** It separates cleanly what TSPEC decided (per-dispatch rows, additive, design unchanged under either resolution) from what only REQ can decide (which rows AC-3.3's completeness test asserts over), and it says which is which. The phase does not stall on it, and the test author is not left guessing on a stable-corpus fixture.

## Recommendation

**Approved with minor changes** — no High findings. Both v2 blockers are discharged. The two
Mediums are one sentence each and both are about *where a test lives or what it compares against*,
not about the design: F-01 names AT-32's baseline operand and puts the config cases in the capture
matrix; F-02 gives `RETRY-ITERATION` a file so the PLAN derivation cannot drop it. F-03 is a
one-word citation fix. None of them need to gate the phase — but F-02 in particular should reach
PLAN, because a case with no suite and no AT id is a case that quietly does not get written.

Two errata are routed from this review: **FSPEC BR-1** (still unamended at HEAD, so AT-02 retains
two contradictory readings of its expected set) and **REQ AC-3.3** (the record's locus on a
divergent run), both already documented as ERR-7 and ERR-6 in the TSPEC's own errata section.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

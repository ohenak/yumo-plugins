# Cross-Review: product-manager — REVIEW (Phase CR, Codebase Review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/` — the feature's implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 3
**Scope:** Product lens only — requirements traceability (REQ-CONS-01…07, AC-1.1…AC-7.2), scope compliance, acceptance-criteria fidelity. Technical design, test strategy and code quality belong to the SE and TE lenses.

## Method

Delta re-review, third round. I read my own v2 (`CROSS-REVIEW-product-manager-REVIEW-v2.md`), diffed the tree I reviewed there against HEAD (`401f41d0..HEAD`, HEAD `4ef6fe71` before this file), and asked the two convergence questions only: is my one blocking finding closed on the **production** path, and did the revision break anything I had already approved. I did not re-open v1 or v2 approved surface.

Two commits landed in the window:

| Commit | Subject | Reach |
|---|---|---|
| `d0e19888` | bar rejections are a filter, not a degradation (CR round 2) | `consolidate-learnings.js` (+65/-8), 5 test files, `dist/consolidate-learnings.bundle.js`, `dist/distribution-manifest.json` |
| `4ef6fe71` | record that `result.writeSet` has no production reader (TE F-14) | comment only, `consolidate-learnings.js` +5 |

Every claim below is cited at `file:line` on HEAD. For each claimed fix I traced **AC → production caller → operator-visible artifact**, then checked that a test drives that caller rather than the pure function beside it.

Suite state: `npm test` in `pdlc/workflows` — 3893 passed / 1 failed, 101 suites. The single failure is `documentOracles.test.js` AT-22, receiving only untracked local files (`.serena/`, `.tokensave/tokensave.db`) — the false-red `CLAUDE.md` documents ("an untracked local file makes the document oracle red for reasons nothing in the diff can fix"). Same failure, same cause, same two paths as in v2: not a regression and not a defect. `build-runtime.mjs --check` is green on all five `dist/` rows, so the fixes are in the shipped artifacts and not only in source.

## Delta: v2 findings on HEAD

All three closed on the production path. Evidence per row.

| v2 ID | Severity | Status on HEAD | Evidence |
|---|---|---|---|
| G-01 — the AC-2.3 diversion mislabels a clean pass `promoted-degraded` | High | **Closed** | The status derivation now reads a narrowed set: `const degraded = deferred.filter((d) => !(d && d.declined === true))` (`consolidate-learnings.js:952`), then `state.status = degraded.length > 0 ? "promoted-degraded" : "promoted"` (`:954`). `declined: true` is set at exactly one site — the bar rejection at `:799` — and nowhere else in the module (grep: `:791`, `:799`, `:952`, `:2481`, `:2483-2487`). The two other `deferred.push` sites are untouched and still darken the status: the AC-5.4 propose-only diversion (`:808`) and `degradeAll`'s reason-carrying deferral (`:826`). So the narrowing is exactly the vocabularies §1 join I cited — a verdict decided per proposal *before* routing, firing no §6.3 fallback class — and not a blanket removal. |
| G-02 — the proposal file gains a fourth cause REQ does not enumerate | Medium | **Closed in code; the REQ half is routed as an erratum** | `renderProposalFile` now renders the two causes under two headings: undeclined items first (`:2481`), then `DECLINED_HEADING` — `"# Declined at the AC-2.3 pattern bar (not a degraded promotion)"` (`:2492`) — and the declined items below it (`:2483-2488`). The operator can now tell work the pass *could not land* from work it *deliberately declined*, which is what I asked for. The upstream enumeration is unamended; see **Errata**. |
| G-03 — substring matching over-cites a promotion's sources | Medium | **Closed** | `promotionSources` no longer calls bare `includes`; it delegates to `matchesFeatureToken` (`:1071`, defined `:1088-1094`), which reads the whole `LEARNINGS-{feature}.md` slot (`:1090-1091`, exact case-insensitive equality on the captured group) and falls back to a `[a-z0-9-]`-bounded token match for a basename outside that grammar (`:1093`). Both prefix cases I named are rejected: `feat-a` vs `LEARNINGS-feat-alpha.md` (slot `feat-alpha ≠ feat-a`) and `pdlc-consolidation-agent` vs `…-agent-v2.md`. The `new RegExp` construction has precedent in the shipped runtime (`orchestrate-dev.js:8773` uses the identical shape), so it introduces no new runtime-capability risk. |

### Why I accept G-01's fix rather than re-argue it

The fix does the narrow thing. My v2 argument was that a bar rejection matches `duplicate-suppressed`'s shape — decided per proposal before any route is attempted, fires no fallback, is not a failure (`FSPEC-pdlc-consolidation-agent.md:1143-1144`) — and FSPEC §7.3's own gloss confirms the boundary the fix respects: it is *"a degraded promotion"* that forces `promoted-degraded` (`:901-903`), and a declined item is not one. I checked that no spec text pins the old `deferred.length > 0` formula: FSPEC's status tables (`:1156`, `:2033`, AT-K7 at `:2186`) are all written in terms of a promotion that *hit a §6.3 failure class*, never in terms of the deferred array's length. The code now says what the specs said.

Nothing is lost by not degrading. The declined pair still reaches both other operator channels: `renderDeferredEntry` (`:2192-2200`) renders it into report item 8 and the terminal row's `deferred:` field (`:2322-2327`) carrying its detail text, and the proposal file is still written whenever `deferred.length > 0` (`:937-941`), declined-only passes included.

### Test quality on the new rows

I applied the three oracle demands to the four rows `d0e19888` added, since the fix hangs on them.

- **No implementation echoes.** Every expected value is a literal transcription: `expect(result.status).toBe("promoted")` and the heading string is spelled out in the test (`consolidationOperatorChannels.test.js:568`, `:583`), not imported from `DECLINED_HEADING`. A test that imported the constant would go green on a renamed heading; this one would not.
- **No absence-only oracles.** The mixed-pass row pairs its negative with positives on the same path: a non-vacuity pre-check that the pass really did both things (`:552-554`), then `status === "promoted"` *and* the log text matching `status: promoted` *and* item 8 still naming `pattern bar unmet (AC-2.3)` *and* the proposal-file pointer (`:557-565`). The `not.toContain("promoted-degraded")` never stands alone.
- **The degraded control is the row that matters most.** `:571-608` runs a second cluster that clears the bar, takes the PR route, and degrades with a reason code, then asserts `promoted-degraded` and `deferred[0].reason` truthy (`:605-607`). Without it, `d0e19888` could have deleted the derivation outright and stayed green. This is the control I asked for.
- **G-02's row asserts the discrimination, not containment.** It splits the file on the heading and asserts the declined text is below it *and* absent above it (`:619-622`), which a whole-file `toContain` would not catch. The comment says so in as many words.
- **G-03's row drives `main()` with three consumed features, two of them prefix-related** (`:637-643`), and asserts the cited pair present and the third absent on the same rendered `source:` line (`:670-672`). It reads the PR body write, not `promotionSources` directly — the AC → production caller → artifact traversal.

## Findings

**No High findings.** My one blocker is closed on the production path, no approved surface regressed, and the two items below are both consequences of the G-02 fix landing in the code before the enumeration it widens landed upstream. Neither gates.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| H-01 | Low | Local | **The proposal file now separates declined from degraded; the report and the terminal row still do not.** `renderProposalFile` gained the `DECLINED_HEADING` split (`consolidate-learnings.js:2481-2488`), but `renderDeferredEntry` (`:2192-2200`) renders one flat comma-joined list into both report item 8 and the terminal row's `deferred:` field (`:2322-2327`), and its own docblock states the design intent that "both operator channels render from `state.deferred` through this one function, so the row and the report can never disagree" (`:2186-2188`). With the file now a third channel that *does* discriminate, an operator reading `status: promoted` beside `deferred: X:promote (…), Y:promote (…)` has to parse detail prose to learn that one was declined and one degraded. The information is present — `pattern bar unmet (AC-2.3)` versus a reason code — so this is legibility, not loss. | AC-7.1, AC-3.4 |
| H-02 | Low | Local | **`matchesFeatureToken`'s docblock understates its own boundary class.** The comment says the fallback is a `` `[a-z0-9]`-bounded token match `` (`:1082`), while the regex it describes is `` `(^|[^a-z0-9-])…([^a-z0-9-]|$)` `` (`:1093`) — hyphen included. The hyphen is exactly what makes the fix work on this feature's own naming grammar (`feat-a` vs `feat-alpha` turns on it), and it matches the word-boundary discipline the pipeline already applies to heading concepts. The code is right and the sentence describing it is not, which is the direction that misleads a later maintainer into "simplifying" the class. | AC-3.2(i) |

### H-01 — why I am filing it Low rather than asking for a change now

I am not asking for the row format to change in this pass. The v2 ask was that the operator be able to tell the two causes apart, and on the artifact where the two causes are *acted on* — the proposal file, the thing a human opens to judge — they now are. The terminal row is a one-line index, and the detail string already carries the discriminator verbatim.

The reason I file it at all is that the design comment at `:2186-2188` now asserts a symmetry the feature no longer has, and this feature's whole product claim (REQ §1) is that an operator can read a pass's outcome without reconstructing it. If a later change makes the row terser — dropping `detail` in favour of `reason`, say — the declined items would become indistinguishable from degraded ones on both the row and the report at once, silently. A `(declined)` marker on the entry, or a sentence in that docblock recording that the proposal file is deliberately the discriminating channel, would close it. Either is a one-line change; neither is worth another round on its own.

## Errata routed upstream

Two upstream documents now enumerate the proposal file's causes as a closed list that the shipped behaviour exceeds. Neither is a defect in the implementation in front of me, so neither is a finding above — both are emitted as `ERRATUM:` lines in this round's hand-off for the owning author to make a targeted versioned edit.

**REQ AC-3.4** (`REQ-pdlc-consolidation-agent.md:272-274`) states the file "is written when, and only when, the pass has something to propose that it does not enact (AC-3.5, AC-5.4, AC-6.3)". An AC-2.3 bar decline is a fourth cause: it is decided at `consolidate-learnings.js:796`, lands in `deferred` at `:797-802`, and triggers the write at `:937-941`. The leading clause is true of it; the parenthetical enumeration is not. I raised this in v2 and it was filed as an erratum then (`d0e19888`'s message says so), but REQ is unmodified in the `401f41d0..HEAD` window — `git log 401f41d0..HEAD -- REQ…` is empty — so the erratum has not yet been routed. I re-emit it rather than let it lapse.

Worth noting for whoever amends it: AC-3.5's own text already contains the paragraph pattern this needs, in the sentence excluding `duplicate-suppressed` from the failure-class table ("decided per promotion before any PR is attempted, fires no fallback", `REQ:285-286`). A bar decline takes the same shape and can be recorded the same way.

**FSPEC §5.3's proposal-file table** (`FSPEC-pdlc-consolidation-agent.md:895-900`) has the identical gap one layer down, and it bites slightly harder because it is written as an exhaustive four-row table over passes: two `no-op` rows that write nothing, one `no-op` row that writes (AC-4.3's degraded pass), and `promoted-degraded` with a degraded promotion. A pass whose **only** cluster is bar-declined reaches `no-op` — `enacted` is empty, so `:956` — and **writes the file** (`:937`). That is a fifth pass shape the table does not carry, and the prose beneath it (`:902-905`) explicitly reasons about which `no-op` causes AC-1.4 does and does not enumerate, so the omission reads as a considered exclusion rather than an oversight. The behaviour is pinned by an existing test — `consolidationOperatorChannels.test.js:242-256` asserts `no-op` with one deferred item and the cause named in the body — so this is the document trailing the code, not the reverse.

This gap predates round 2; it is not something `d0e19888` introduced. I did not raise it in v2 because I had located the enumeration in REQ only.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v2 Q-01, still open and still not a blocker. If a prior pass's corpus reconstruction comes back empty — members `.gitignore`d or moved since — `:1727` skips the empty consumed set and the streak silently stops accruing. Should item 5 flag that, so the operator can tell "no promotion recurred" from "the evidence of the passes is gone"? Answered as a design question this round: the code's comment at `:673-679` states the deleted-member case deliberately, so the behaviour is chosen rather than accidental. The reporting half is what remains. |
| Q-02 | Carried from v2 Q-03. AC-6.3's consumer-local operator action is re-rendered on every pass where a widening candidate exists (`:2202-2206`). Under `/loop`, that is the same sentence on every tick until the operator edits an untracked config file. Should a later pass mark it "already recommended"? Not a blocker in three rounds now; recording it so it survives into harvest rather than lapsing. |
| Q-03 | New, and purely a product-policy question for the queue owner rather than for this branch. With G-01 landed, a pass that promotes two patterns and declines five coincidences reads `promoted` with a seven-line `deferred:` field. That is the correct status by the rule we just fixed. Is there a count at which the *volume* of declined items is itself a signal worth surfacing — a prompt that is over-clustering, say — or is the proposal file the right and only place for that judgment? I lean to the latter, which is why it is a question and not a finding. |

## Positive Observations

## Recommendation

## Verdict

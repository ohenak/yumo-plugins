# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/` + the feature diff against `main`
**Scope:** implementation review of pdlc-learnings-injection (Phase CR, iteration 1)
**Date:** 2026-08-21
**Iteration:** 1

## Method

Every claim below was checked against the working tree at `feat-pdlc-learnings-injection`
(`6b72d587`), not against the documents. Three instruments were used:

1. **Full-suite run on a clean tree** — `cd pdlc/workflows && npm test`:
   `Tests: 3 failed, 70 skipped, 3956 passed, 4029 total`. The three reds are recorded in
   `## Evidence` (E-1); one of them is this feature's own.
2. **Mutation of load-bearing predicates** — each mutation applied to
   `pdlc/workflows/orchestrate-dev.js`, the suite re-run, the file restored from a backup, and
   `git status --porcelain` confirmed clean afterwards. A surviving mutant is reported only where
   the mutant is *not* behaviour-equivalent; one candidate (adding `"LEARNINGS"` to
   `LEARNINGS_TARGET_DOCTYPES`) survived and was **discarded** as an equivalent mutant, because
   Phase H dispatches with `dispatchKind: "harvest"` (`orchestrate-dev.js:15510`) and the
   two-conjunct rule blocks it on the other conjunct.
3. **Direct execution of the shipped exports** — `selectLearnings`, `extractInjectableMaterial`
   and `renderLearningsBlock` driven from `node --input-type=module` against the real module, to
   read what a prompt would actually carry rather than what a fixture asserts.

Production-path tracing for the "operator-visible artifact contains X" ACs: the composition site
is `dispatchAndVerify` (`orchestrate-dev.js:9444-9448`), the block is appended at
`orchestrate-dev.js:9549`, and the report field is assembled at `orchestrate-dev.js:13046` and
spread at `orchestrate-dev.js:15953`. `learningsDispatchSet.test.js` does drive the real
`mainDev` default export, so the wiring itself is genuinely exercised — the findings below are
about what its oracles can and cannot falsify, not about builder-only coverage.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-4.3's falsifiable form is vacuous.** `LI-AT-29` compares five "observables" read as `r.result.report.verdicts ?? null`, `.completenessScores`, `.roundWindows`, `.approvalAnchors`, `.erratumRoutes` (`learningsDispatchSet.test.js:381-393`). `buildFinalReport` (`orchestrate-dev.js:15924-15954`) emits none of those five keys, and no other site assigns them (`grep` returns only unrelated locals at `:13335`, `:13737`). Both arms therefore evaluate to `{verdicts:null, completeness:null, roundWindows:null, approvalAnchors:null, erratumRoutes:null}` and the assertion is `null === null`, five times. The same defect voids `LI-AT-23`'s negative oracle: `JSON.stringify(report.erratumRoutes ?? [])` is the literal `"[]"`, which cannot contain a source path. AC-4.3 — the AC that says no injection-derived value reaches a gate input — has no live oracle. | AC-4.3, AC-3.4; `learningsDispatchSet.test.js:380-403` |
| F-02 | High | Local | **BR-1's second conjunct has no falsifying test.** Mutating `orchestrate-dev.js:9444` from `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` to `dispatchKind === "authoring"` leaves the entire repository green (`4029 total`, the same 3 pre-existing reds, zero new). AC-1.2 names the unprotected case explicitly — "any dispatch the pipeline tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer at HEAD" — and requires it byte-identical to the disabled run. `LI-AT-02` cannot catch it because it approximates BR-1 by `AUTHORING_SKILLS` membership (`learningsDispatchSet.test.js:283-294`), which is the *first* conjunct restated. The composition-site test that was written for this job cannot catch it either (F-08). Needed: one assertion that the `docType: null` authoring dispatch's prompt carries no block. | AC-1.2; `orchestrate-dev.js:9444` |
| F-03 | High | Local | **"Byte-identical to the recorded pre-feature baseline" is asserted nowhere.** The committed fixture `pdlc/workflows/__tests__/fixtures/learnings-baseline/` (MANIFEST + 3 prompt captures) is read by exactly two suites — `learningsBaselineGuard.test.js`, which re-hashes the fixture against hand-transcribed digests of *itself*, and `learningsCaptureScript.test.js`, which tests the capture script and the ignore rule. No test compares any composed prompt against those bytes. `LI-AT-03`, `LI-AT-24`, `LI-AT-29` and `LI-AT-31` all substitute "the disabled arm of the same run" (`learningsDispatchSet.test.js:307-315`, `:373`, `:398-403`, `:421`) — which AC-5.1a rules out in those words: "that committed pre-feature fixture, **not a second branch of this run**". A regression that changed base-prompt composition on both arms passes every one of them, and AC-6.2 is unmet on its own terms. | AC-5.1a, AC-6.2; `learningsBaselineGuard.test.js:61` |
| F-04 | High | Local | **`RSN-NO-MATERIAL` carries an undocumented extra conjunct, and a zero-material document reaches the prompt.** `orchestrate-dev.js:2368` rejects only when `extraction.sections.length === 0 && hasAnySectionHeadingLine(entry.text)`. TSPEC §D.3 states the rule without the second conjunct ("empty intersection ⇒ empty `sections[]` ⇒ `RSN-NO-MATERIAL`") and TSPEC's §T.6 row is explicit that at any non-zero bound "*yields no material*" and "*carries no BR-6 heading*" are the same predicate; FSPEC BR-6 gives the reason the rule exists ("otherwise it would take a `maxDocuments` slot while injecting zero bytes"). Shipped behaviour, executed (E-2): a `# LEARNINGS` document with no level-2 headings is **selected**, takes the only slot, pushes a genuine contributor out with `RSN-COUNT`, records `bytesInjected: 0`, and renders an empty `<<< … >>> / <<< end … >>>` pair into the authoring prompt. Worse, `LI-AT-04`, `LI-AT-09` and `LI-AT-10` build their corpora with `buildLearningsDocument` and **no** `sections` key (`helpers/learningsFixtures.js:108`), i.e. exactly such documents, and assert them `selected` — so AC-2.2's two ordering ATs never order a document that contributes a byte, and removing the extra conjunct reds those three tests and nothing else (E-3). | AC-2.2, AC-3.2; `orchestrate-dev.js:2368` |
| F-05 | High | Local | **The shipped runtime artifact is drifted, and a committed test is red at HEAD.** On a clean tree, `node pdlc/workflows/build-runtime.mjs --check` exits non-zero ("Bundles are out of date"), and `consolidationBuild.test.js` › "build-runtime.mjs --check is clean" fails deterministically. Rebuilding rewrites `pdlc/workflows/dist/pdlc-cli.mjs` — and the drifted hunk is this feature's own `isLearningsSelfPath` (E-1). Per CLAUDE.md / DEC-08 `dist/` is tracked, is what consumers run, and must be regenerated and staged in the same wave that touches `pdlc/workflows/*.js`. Ship gate: rebuild and commit. | DoD; `pdlc/workflows/dist/pdlc-cli.mjs` |
| F-06 | Medium | Local | **The multi-section per-document cut is untested, and it emits a mangled heading.** Both `LI-AT-12` cases use single-section fixtures (`learningsBlock.test.js:103-146`). Executed against two sections at a bound that lands inside the second (E-4), the shipped material ends `…\n\n## 3. Non-Convergen` — a truncated section heading injected into an author's prompt. This is also the one place FSPEC and TSPEC disagree (see `ERRATUM: FSPEC`), so it is precisely the behaviour that needed a pinned oracle. Add a two-section AT-12 case asserting the literal cut. | AC-2.3; `orchestrate-dev.js:2290-2340` |
| F-07 | Medium | Local | **`propagateBytes` is an implementation-invented rule, and AT-13's fixture was tuned to it.** `orchestrate-dev.js:2400` gives out-of-window documents `RSN-BYTES` iff `firstByteFailIndex < window.length - 1`, else `RSN-COUNT`. No upstream document states a reason id for a document that is both below the count cut and behind a binding total-byte bound (`grep -n 'propagat'` over REQ/FSPEC/TSPEC/PLAN/PROPERTIES: no match). `LI-AT-13`'s own comment records the tuning — "4973 is therefore what lands each document's material on exactly 5000 bytes … at 5000 … the byte failure would move off the window's last slot and propagate RSN-BYTES onto the overflow the expectations below record as RSN-COUNT" (`learningsSelect.test.js:259-265`). That is an expected value chosen to fit the code, not transcribed from a spec. Bind the rule upstream, then re-derive the fixture from it. | AC-3.2; `learningsSelect.test.js:259` |
| F-08 | Medium | Local | **The composition-site set-equality test's second clause cannot fail.** Its comment says "(b) the accepted set — docTypes for which `injectHere` returned true" (`learningsDispatchSet.test.js:509`), but `acceptedDocTypes` is built inside the test's own `_recordDocType` by re-applying `HAND_TRANSCRIBED_TARGET_DOCTYPES.includes(docType)` (`:466`). `_recordDocType` is called unconditionally on both arms by design (`orchestrate-dev.js:9445`), so clause (b) asserts the intersection of the test's literal with the observed docTypes against the test's literal — a tautology that never consults `injectHere`. This is the proximate reason F-02's mutant survives. Give the probe seam the *decision* (`_recordDocType(docType, injectHere)`) and assert on that. | AC-1.2; `learningsDispatchSet.test.js:458-513` |
| F-09 | Low | Local | **A null ordering key renders as the literal `null` in the prompt.** `renderLearningsBlock` interpolates `doc.orderKey` unguarded (`orchestrate-dev.js:2444`), so a document with material but no parseable `Date Completed` — `LI-AT-10`'s own E-13 case — opens with `… — feature x, completed null >>>`. TSPEC §OQ.1 fixes no rendered form for the null key (see `ERRATUM: TSPEC`) and no test covers it. | AC-1.4; `orchestrate-dev.js:2444` |

## Evidence

## Questions

## Positive Observations

## Recommendation

## Verdict

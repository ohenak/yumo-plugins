# Cross-Review: test-engineer — IMPLEMENTATION (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/` — the feature's full diff against `main`
**Date:** 2026-08-10
**Iteration:** 1
**Scope:** Final Codebase Review, testing lens — oracle falsifiability, production-path coverage, property traceability

## Method

What I did, so a later round can re-derive rather than re-trust:

1. **Ran the suite.** `cd pdlc/workflows && npm test` — 100 suites, 3851 passed, 1 failed, 70 skipped.
2. **Discharged the one red as environmental.** `documentOracles.test.js:246` (`coveredViolations(LIVE_ROOT)` is
   empty) fails on untracked `.serena/cache/*.pkl` and `.tokensave/tokensave.db` in my tree. CLAUDE.md names this
   exact case ("a document oracle red locally but green in CI — check untracked files"). **Not a finding.**
3. **Discharged the 70 skips as out of scope.** All are `guardMatrix.test.js`'s BLOCK rows, gated by
   `isLive` (`guardMatrix.test.js:310`) pending an unrelated guard rewrite. `guardMatrix.test.js` is not in this
   feature's diff. **Not a finding.** Within this feature's 16 `consolidation*.test.js` files there is **zero**
   live `.skip(` — every RED block PLAN declared is un-skipped. That is a real achievement; see Positives.
4. **Checked artifact freshness.** `node pdlc/workflows/build-runtime.mjs --check` → exit 0, all five rows in-sync.
5. **Traced oracles to production.** For each finding below I read the production line and the test line and
   compared them, rather than trusting the AT register or the trailer titles.

The register is large (99 FSPEC ATs, 118 PROPERTIES ids) and mostly well discharged. The findings below are
concentrated in one failure mode: **a handful of ATs whose oracle does not assert what its own title and the
FSPEC row claim it asserts.** Because the AT register is the completeness gate, each of those reads as covered.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AT-M9's oracle discharges none of AT-M9's obligations.** FSPEC:2140 requires seven conjuncts (terminal `failed`, no reason code, the §8.3 table **is** appended, exactly one failure-mode record — routed only, the §5.4 commit runs, marker released, error verbatim in the body plus the routed/unrouted split). The test body (`consolidationPass.test.js:510-517`) asserts exactly one thing: `expect(result.status).not.toBe("refused")` — an absence-only oracle. Worse, the fixture is inert: `throwOn: new Set([1])` never fires because `NOTHING_FOUND_REPLY` means the second dispatch never happens, as the test's own comment concedes. FSPEC:2136 states AT-M6's negative "is asserted on the same path as AT-M9's positive and is the paired half of it: without it, an implementation that emitted a table on every pass regardless of where it terminated passes both rows." That implementation passes today. | `consolidationPass.test.js:503-517`; FSPEC:2136, 2140 |
| F-02 | High | Local | **BR-23 / E-22 / AT-N4 is unimplemented, and its oracle hides that.** FSPEC:2618 and :2713 require a **non-null** `pluginRepository` that does not resolve to yield `repository-unresolved`. `openClone` does the opposite: the `repository-unresolved` return is reachable **only** on the `pluginRepository == null` branch (`consolidate-learnings.js:2185-2188`); a configured value is interpolated unconditionally into `https://github.com/${cfg.pluginRepository}.git` (`:2192`) and the resulting clone failure is classified `api-failure` (`:2196`). No test covers it — all three `openClone` calls pass `{ pluginRepository: null }` (`consolidationRoute.test.js:306, 329, 351`). AT-N4's only test hand-builds `reasons: new Set(["repository-unresolved"])` into a `state` and asserts `renderReportBody` echoes it (`consolidationReport.test.js:412-433`) — it proves the renderer echoes a reason it was handed, never the condition that sets it. | `consolidate-learnings.js:2185-2197`; `consolidationReport.test.js:412`; FSPEC:2618, 2713 |
| F-03 | High | Local | **`consolidationReport.test.js` drives no production path, and its fabricated notice shape diverges from production's.** The file never calls `main()` — it imports render functions only (`:51`). Its local `notesFromConfigParse` (`:643-656`) mints `{subject: "consolidation.${key}", missingField: key, detail: "fell back to default …"}`. `main()` emits `{subject: "config", detail: "consolidation section malformed — defaults used"}` and `{subject: "config", detail: "${key} invalid — fell back to ${config[key]}"}` (`consolidate-learnings.js:528, 531`) — different subject, no `missingField`. AT-N3's discriminator (`malformedBody` matches `/not an object/`, `:407`) holds only because the *test* wrote "present but not an object" into `detail`; production never emits that string. So AT-N1…N3's report claims are proven against test-authored data. This is the builder-not-wired shape (DC-07): the renderer is unit-tested, the assembly it renders is not. | `consolidationReport.test.js:51, 368-410, 643-656`; `consolidate-learnings.js:528-532, 2069-2075` |
| F-04 | High | Local | **AT-M5 claims set-equality and asserts exclusion.** Title: "the observed pathspec set of every commit is set-equal to the §5.4 write set, and never contains the lock path". Body: `commitCalls.length > 0`, then per call `expect(pathspec).not.toContain(MARKER_PATH)`. The set-equality against the §5.4 write set — the half that catches a **dropped** pathspec — is absent, and the surviving half is absence-only. A commit that silently omitted the log path, or `state.writeSet` losing a member, stays green. PROPERTIES O-2 ("set-equality, never containment, wherever a dropped member is invisible") is exactly this case, and `state.writeSet` (`consolidate-learnings.js:511`) is right there to compare against. | `consolidationPass.test.js:450-462`; PROPERTIES §O-2 |
| F-05 | Medium | Local | **Absence-only oracles on `effectivenessTable`'s `state`.** "an empty consumed-set pass advances neither streak" (`consolidationEffectiveness.test.js:290-303`) asserts only `not.toBe("unmeasurable")` and `not.toBe("ineffective")` — no positive conjunct on that path. AT-F12's first arm (`:262`) is the same shape. The healthy value is literal and available: `let state = null` (`consolidate-learnings.js:1576`), so `expect(row.state).toBeNull()` falsifies both a novel state string and an `undefined` from a mis-shaped row, which the current pair does not. | `consolidationEffectiveness.test.js:262, 302-303` |
| F-06 | Medium | Local | **AT-M11 is all negative.** Three assertions, all absence: `not.toBe("refused")`, `not.toContain("reclaimed-stale-lock")`, `not.toContain("consolidation-in-progress")`. Its own title promises "**taken** and the pass proceeds" — neither is asserted positively. No terminal status is pinned (a `no-op` is expected here and is asserted positively elsewhere in the same file at `:241`, `:441`, `:486`), and no marker write is checked, though AT-M2/AT-M3 next door do exactly that (`:386`, `:399`). A mutant that made a `RELEASED:` marker fall through to `skipped-cadence` without taking the lock passes all three. | `consolidationPass.test.js:412-428` |
| F-07 | Medium | Local | **AT-M7/AT-M8 assert a test-local tee, not `main()`'s.** The `describe` title says "through the tee `main()` builds", but the block builds its own `makeTee` and drives `dev.resolveAdvisoryRung` directly (`consolidationRung.test.js:119-157`); `main()` is never called. Production's tee is correct today (`consolidate-learnings.js:514-520` → passed as `_log` at `:606-612`), so this is a coverage gap rather than a live defect — but §8.4's stated obligation is that the retained line reaches the **report body**, and no test asserts `result.body` contains an `ADVISORY_MODEL_FALLBACK:` line on a real pass. AT-M6 proves the dispatch-error half of that path through `main()` (`consolidationPass.test.js:470`); the fallback half has no equivalent. | `consolidationRung.test.js:119-157`; `consolidate-learnings.js:514-520, 606-612` |
| F-08 | Medium | Process | **The property→file/task maps in PROPERTIES §12.2/§12.3 carry no mechanical guard, and no test cites a PROP id.** PROP-TRC-01's test guards FSPEC §13 ↔ TSPEC §12.3 only (`consolidationTraceability.test.js:1-26`). Of the 118 `PROP-*` ids in PROPERTIES, 15 appear anywhere in the 16 `consolidation*.test.js` files. Traceability is therefore doc-mediated and hand-maintained across two 20-row tables. F-01 and F-04 are precisely the failure this permits: an id registered as green whose block asserts something else. A cheap fix in the spirit of PROP-TRC-01: parse §12.2's table and assert every named file exists and every `PROP-*` id in §§4–11 appears in exactly one row. | PROPERTIES §12.2, §12.3; `consolidationTraceability.test.js` |
| F-09 | Low | Local | **Dead RED-phase scaffold left in production.** `notImplemented` (`consolidate-learnings.js:1065-1067`) is defined and never called, and the section comment above it still reads "§7/§9 exports one throwing stub per name" — there are no stubs. Delete both. | `consolidate-learnings.js:1063-1067` |
| F-10 | Low | Local | **Stale "not yet landed" comments now contradict HEAD.** Seven comment sites still describe T21/T30/T31 as unlanded: `consolidationPass.test.js:345, 497, 512-513`; `consolidationRung.test.js:24`; `consolidationReport.test.js:641`; `consolidationRoute.test.js:16, 28, 241`. `deriveProposals` (`consolidate-learnings.js:928`) and `main()` (`:450`) both exist. These comments are how F-01 and F-03 stayed invisible — each one reads as a justification for a weak oracle that is no longer justified. | see cited lines |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-02: is BR-23 the intended behaviour, or has it been superseded? If a configured-but-unresolvable `pluginRepository` should degrade as `api-failure`, then FSPEC BR-23/E-22 and REQ:285 are the things to change and this becomes an erratum rather than a code fix. If BR-23 stands, `openClone` needs a resolve probe on the non-null branch before the clone. Either way the current state — spec says one thing, code does another, no test drives the branch — cannot ship. |
| Q-02 | For F-03: was `main()` ever intended to emit the `{subject: "consolidation.${key}", missingField}` shape the report test transcribes, with `renderReportBody`'s `missingField` fallback (`consolidate-learnings.js:2073`) as its consumer? If so, `main():528-532` is the defect and the test is right; if not, the test helper is the defect. `missingField` is read by the renderer and written by no production caller, which suggests the former. |
| Q-03 | For F-01: does a fixture that actually reaches step 13 exist anywhere in the suite? I could not find one — `deriveProposals` (`:928`) has unit coverage, but I found no `main()` fixture whose clustering reply yields a routable proposal *and* fails the authoring dispatch. If that fixture is genuinely expensive to build, say so and I will discuss a narrower oracle; but the current row should not claim AT-M9. |

## Positive Observations

- **Every RED block is un-skipped.** Sixteen new test files, ~5,500 lines, and not one live `.skip(` — the
  skipped-block discipline PLAN §2 set up, plus the wave-gate un-skip guard (`9c510245`), actually held. This
  is the failure mode that silently guts a TDD pipeline and it did not happen here.
- **Set-equality is the house style, not the exception.** `consolidationLifecycle.test.js:317` asserts the
  fixture map's key set equals `TERMINAL_STATUSES`; `consolidationParse.test.js:138` asserts a parsed record's
  key set equals the eight field names in both directions; `consolidationBuild.test.js:288, 300` closes
  CLAUDE.md ↔ manifest ↔ `BUNDLES` three ways; `consolidationRoute.test.js:80` pins `routeOf` set-equal to
  `MERGE_GUARD_DEFAULTS` rather than a subset. F-04 stands out precisely because it is atypical.
- **Paired negatives are done properly where they matter most.** AT-M6 (`consolidationPass.test.js:463-475`)
  is a model of the form: positive terminal status, exact reason-code count, verbatim body text, exact append
  count, and the marker-release check — the negative ("nothing step 11 would have appended") rides on five
  positives on the same path.
- **The non-disclosure sweep is the right oracle.** `accumulatedText(doubles)` swept for `SECRET_VALUE` across
  every double (`consolidationCredential.test.js:394, 412, 436`) is a falsifier that survives future code that
  threads the value somewhere new — much stronger than asserting the redaction function was called.
- **AT-Q7 leads with a runtime oracle and labels the source-grep as supplementary**
  (`consolidationRoute.test.js:388-407`), explicitly refusing to let the static check be sole evidence. That is
  the right instinct and it is written down.
- **PROPERTIES §O-1…O-6 exist at all.** Naming the falsifiability rules made this review mechanical: every
  High above is a citation of the feature's own rule back at it, not a taste argument.

## Recommendation

**Needs revision**

Four High findings. This is not a verdict on the body of work — the suite is large, the discipline held where
it is hardest to hold, and the oracle rules are written down and mostly obeyed. It is a verdict on four
specific rows that read green and are not.

Exactly what to change, in the order I would do it:

1. **F-02 first, because it is the only one where production is wrong.** Either add a resolve probe to
   `openClone`'s non-null branch so a configured-but-unresolvable repository returns
   `{failure: "repository-unresolved", detail: <the configured value verbatim>}`, or route the erratum and
   change BR-23/E-22. Then drive it: an `openClone` test with `{pluginRepository: "some-owner/does-not-exist"}`
   and a failing clone reply, asserting the reason code and the verbatim value — not through `renderReportBody`.
2. **F-01: give AT-M9 a fixture that reaches step 13**, and assert its seven conjuncts. If Q-03's answer is
   that the fixture is genuinely out of reach, the row must say so and the register must stop claiming AT-M9 —
   a documented gap in PROPERTIES §13.1 is honest; a green row asserting `not.toBe("refused")` is not.
3. **F-03: reconcile the notice shape, then drive one report assertion through `main()`.** Answer Q-02, fix
   whichever side is wrong, and add a single case that runs `main()` with a malformed `consolidation` section
   and asserts the resulting `result.body` — one production-path case retires the whole fabrication.
4. **F-04: replace AT-M5's exclusion with the set-equality its title promises** — compare the union of observed
   commit pathspecs against `state.writeSet`, keeping the marker-exclusion conjunct alongside it.
5. **F-05, F-06, F-07** are one-line-each strengthenings: `toBeNull()` on `state`; a positive terminal status
   and a marker-taken assertion on AT-M11; one `main()`-level assertion that the `ADVISORY_MODEL_FALLBACK:`
   line reaches `result.body`.
6. **F-08** is the durable one — a §12.2 table guard in the shape of PROP-TRC-01 would have caught F-01 and
   F-04 mechanically, and will catch their successors. Worth doing even though nothing blocks on it.
7. **F-09, F-10** are cleanup, but do F-10 with the rest: those comments are load-bearing in the wrong
   direction, and leaving them invites the next reader to re-justify a weak oracle.

Nothing here requires re-litigating a settled design decision. Every fix is additive to work that is already
structurally sound.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 4, "low": 2}

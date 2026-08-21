# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** testing lens only — testability of each decision, observability of its re-evaluation
triggers, falsifiability of every oracle a decision prescribes, and re-derivation of every counted
cost the document stakes an alternative's rejection on.

## Verification Method

This branch carries neither the mechanism (`grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`
→ `0`) nor the wave-gate baseline, and is 1,637 commits behind (`git rev-list --count HEAD..origin/main`
→ `1637`) — both exactly as the document's own **Verification frame** states. I therefore re-derived
every counted claim against `origin/main` at `345ae358` (`git cat-file -t 345ae358` → `commit`), the
same ref the document names, and cite by enclosing test, exported symbol or comment text per DEC-DOC-01.

Line numbers below are locators against `origin/main` at `345ae358`; the enclosing test or exported
symbol is the stable citation.

**Re-derived and confirmed accurate** — these are the load-bearing claims the decisions rest on, and
they hold:

| Document claim | Command / anchor | Result |
|---|---|---|
| Three module-level pure functions, one read site, one write site | `computePlanHash` `:12230`, `parseWaveLedger` `:12267`, `formatWaveLedger` `:12325`; read `readMergeConfigSafely(readFileFn, WAVE_STATE_PATH)` `:15264`; sole `writeWaveLedger(` call `:15600` | ✅ exactly as stated |
| The shipped INTERIM comment miscounts its own surface | `:12196-12198` reads "one path constant, two pure functions, one read site and two write sites" | ✅ DEC-WVR-01's correction is right |
| Ancestry is the **third** arm; feature-mismatch and plan-changed issue zero `merge-base` calls | `recorded.feature !== featureName` `:15302`, `recorded.planHash !== planHash` `:15306`, `!(await headCorroborated(recorded.head))` `:15307`, over-count `:15313` | ✅ O-4's rejection is correctly grounded |
| The shipped ancestry test asserts by containment, so an extra call is unfalsifiable | `expect(calls).toContainEqual(["merge-base","--is-ancestor",HEAD_SHA,"HEAD"])` in `it("a complete ledger whose commit is NOT an ancestor of HEAD is ignored, and every wave runs")` | ✅ the strongest argument in the document |
| The queue's delegation payload key set is exactly `{reqPath}` | `orchestrate-queue.js`: `import realMain` `:45`, `_runPipeline: runPipelineFn = realMain` `:1240`, `runPipelineFn({ reqPath: entry.reqPath })` `:1582` | ✅ DEC-WVR-07 is honestly grounded |
| The adapter already binds the `_git` transport twice | `runtime-adapter.js:1162`, `:1202` — `_git: rtGit` | ✅ O-3's "second adapter binding" cost is real |
| `main()` carries ~35 injected seams, `_git: gitFn = defaultGit` among them | 34 underscore-prefixed params in the destructured list at `:12992`; `_git` present | ✅ hedged and accurate |
| `.gitignore` pins the path by a root-anchored rule at line 41 | `/.claude/pdlc-wave-state.json`, line 41 | ✅ |
| Nothing writes `{}` | the sole write site passes `formatWaveLedger(...)` `:15601`, whose output always carries `version`, `feature`, `planHash`, `lastGreenWave` `:12325-12338` | ✅ the premise of DEC-WVR-04 holds |
| Seven reason codes; **three** interpolate | `parseWaveLedger` arms `:12290,12296,12305` are fixed sentences; `plan-changed` `:15306-15311` is fixed; feature-mismatch, head-unreachable and over-count interpolate | ✅ DECISIONS is right and TSPEC §3.1 is wrong (erratum, already self-flagged) |

**Re-derived and NOT confirmed** — three counted claims do not survive the command the document
gives for them. They are F-01, F-03 and F-04 below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | "44 shipped tests" is not the count the cited test file produces — the real figure is **26** test cases (`18 / 4 / 4`, not `32 / 8 / 4`). The number is the whole cost basis for rejecting O-1 and is restated as DEC-WVR-02's regression net. | Context measured-surface table; O-1; DEC-WVR-01 |
| F-02 | High | Local | DEC-WVR-03's rule ("append to **each** announcing outcome") and its Consequences count ("**exactly three** shipped whole-string assertions change") cannot both hold: the invalid-pointer notice is a fourth announcing full-run under FSPEC BR-07 and is pinned by whole-string equality today. The risk register treats a fourth as an unforeseeable mid-wave discovery when it is discoverable now. | DEC-WVR-03; O-5; Consequences; Risks |
| F-03 | Medium | Local | The "~81 lines" chain measurement does not match the anchor the document gives for it. From `if (ledger.reason) {` through the final `else`'s closing brace is **48** lines; 81 is the enclosing `if (!explicitPointer) {` block. | Context measured-surface table; DEC-WVR-02 Context |
| F-04 | Medium | Local | "The module the feature edits is the largest tracked file in the repo" is falsified by the very command cited: `pdlc/workflows/dist/pdlc-cli.mjs` is 738,924 bytes vs `orchestrate-dev.js` at 734,711. The stated runner-up ("a document at 314,472 bytes") is third, not second. | Context measured-surface table; Risks |
| F-05 | Medium | Local | DEC-WVR-04's write-side consequence — "the absence of any `{}` writer is asserted over the write site" — is an absence-only oracle with no positive conjunct named. A run that writes nothing at all satisfies it, so it cannot fail for the reason it exists. | Consequences, DEC-WVR-04 row |
| F-06 | Medium | Local | DEC-WVR-08 prescribes call-count equalities for feature-mismatch, plan-changed and ancestry, but names no oracle for the **over-count × unreachable-head** path — the only case where the lazy scheme's correctness is non-obvious, and the one no shipped fixture covers. Its re-evaluation trigger is also one-directional. | DEC-WVR-08; Consequences |
| F-07 | Low | Process | DEC-WVR-02's and DEC-WVR-05's re-evaluation triggers are stated as design intentions, not as conditions a test or monitor could detect. DEC-WVR-06, -07 and -08 show the observable form in the same document. | DEC-WVR-02, DEC-WVR-05 |

### F-01 (High) — the "44 shipped tests" cost basis does not re-derive

The Context table and O-1 both count the regression net as 32 + 8 + 4 = 44, and O-1 rejects the
`WaveResumeStore` rewrite on the strength of "invalidates the 44 shipped tests that reach them".
Counted against `origin/main` at `345ae358`, in the only test file that mentions any of these
symbols (`git grep -l` over `pdlc/workflows/__tests__/` returns `waveExecution.test.js` alone):

| Block | Document | Actual | Evidence |
|---|---|---|---|
| `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` | 32 | **18** | 15 `it` statements, one of which is a 4-member `it.each` ⇒ 14 + 4 = 18 cases |
| `describe("Phase I — implementation.startWave resumes a halted run")` | 8 | **4** | 4 `it` statements, no `it.each` |
| `describe("computePlanHash — the ledger's plan fingerprint")` | 4 | **4** | ✅ correct |
| **Total** | **44** | **26** | 23 `it` statements / 26 cases — no reading of "test" yields 44 |

Note the document also names the second block as "8 tests in the `implementation.startWave` block
(which asserts the *interaction* of the operator pointer with the record)". Only one of its four
tests involves the record at all; the interaction test the sentence describes —
`it("an explicit implementation.startWave outranks the ledger")` — lives in the *ledger* `describe`,
so the two blocks are also mischaracterised, not only miscounted.

**Why this is High rather than a nit.** The document's stated method is its warrant: "Where a *cost*
is claimed below it is a counted cost, and the count is stated with the command that produced it,
not asserted from intuition." Two of the three counts in the sentence that rejects O-1 fail that
standard by ~1.7×. Three consequences follow, all of them testing consequences:

1. **A downstream oracle transcribed from this number is born red.** DEC-WVR-02's Consequences row
   makes the ledger `describe` "the extraction's regression net", kept "entirely unchanged by that
   task". A PLAN or PROPERTIES author writing the natural gate — *the extraction task leaves N
   ledger tests green and unchanged* — transcribes 32 from here and gets a failure that says nothing
   about the extraction.
2. **The rejection of O-1 loses its measured footing.** O-1 is still correctly rejected — 26
   invalidated tests plus the `.gitignore` anchor plus the no-`import` dialect is ample — but as
   written the argument is carried by a number that does not exist, which is precisely the
   "asserted from intuition" failure the Verification frame promises to avoid.
3. **It is the one class of error this document cannot absorb.** A DECISIONS record whose counts are
   approximate is indistinguishable, to a future reader, from one whose counts are wrong in a way
   that flips a decision.

**Required change.** Replace `32 / 8 / 4 = 44` with `18 / 4 / 4 = 26` in both the Context table and
O-1, state the counting rule used (test **cases**, with `it.each` members counted individually — the
choice matters, since `it` statements give 23), and correct the parenthetical describing the
`implementation.startWave` block. If a different, defensible counting rule yields a different number,
state the rule and the command; what must not survive is a figure no command reproduces.

## Questions

## Positive Observations

## Recommendation

## Verdict

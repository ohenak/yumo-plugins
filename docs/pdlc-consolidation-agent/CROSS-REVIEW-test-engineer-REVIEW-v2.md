# Cross-Review: test-engineer — REVIEW (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/` and the feature's implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 2
**Scope:** Delta re-review of the Final Codebase Review — testing lens only (oracle falsifiability, production-path coverage, property traceability)

## Method

Round-2 protocol: I did not re-review from scratch. I read my own round-1 file, diffed the tree
against the commit I reviewed at, and re-verified only the findings that blocked.

1. **Located the round-1 baseline.** My round-1 review closed at `495e62a8`
   (`docs(review): IMPLEMENTATION v1 — recommendation and verdict`).
2. **Diffed the tree since then.** `git log --oneline 495e62a8..HEAD --stat` returns exactly three
   commits — `cdde436a`, `5a8be438`, `aed31561` — and all three touch one file only,
   `CROSS-REVIEW-product-manager-IMPLEMENTATION-v1.md`. **No production file, no test file, and no
   specification document changed between round 1 and round 2.** The working tree is clean apart
   from untracked `.claude/` and `.serena/` (the tool-cache case CLAUDE.md names; not a code signal).
3. **Re-verified each blocking finding at HEAD rather than trusting round 1.** Every citation below
   was re-read at HEAD, not copied forward.
4. **Naming check.** Phase CR passes a directory, so `docTypeFromPath` yields no doc type and the
   round window keys on the literal `REVIEW` (`pdlc/workflows/orchestrate-dev.js:5812-5813`). Round 1
   was filed as `CROSS-REVIEW-test-engineer-IMPLEMENTATION-v1.md`, which is outside that window.
   This file uses the window's name. See F-11.

## Delta: status of round-1 findings

Because no code or spec changed, no round-1 finding could have been addressed, and none was. The
table below is the re-verification, not a restatement — each row cites the line I re-read at HEAD.

| Round-1 ID | Severity | Status at HEAD | Re-verified at |
|---|---|---|---|
| F-01 | High | **Open — unchanged.** AT-M9's body is still the single line `expect(result.status).not.toBe("refused")`, and the test's own comment still concedes the fixture never reaches step 13. | `consolidationPass.test.js:503-517` |
| F-02 | High | **Open — unchanged.** `repository-unresolved` is still reachable only on the `cfg.pluginRepository == null` branch; the configured value is still interpolated unconditionally and a failed clone is still classified `api-failure`. | `consolidate-learnings.js:2185-2196` |
| F-03 | High | **Open — unchanged.** `notesFromConfigParse` still emits the `{subject: "consolidation.${key}", missingField}` shape and its own docblock still says `main()` will assemble these "once T31 lands it"; `main()` still pushes the different `{subject: "config", detail}` shape. | `consolidationReport.test.js:640-656`; `consolidate-learnings.js:525-534` |
| F-04 | High | **Open — unchanged.** AT-M5's body is still `commitCalls.length > 0` plus a per-call `expect(pathspec).not.toContain(MARKER_PATH)`. No set-equality against `state.writeSet` appears. | `consolidationPass.test.js:450-462` |
| F-05 – F-08 | Medium | Open — unchanged (no test file changed). | as filed in round 1 |
| F-09, F-10 | Low | Open — unchanged. | as filed in round 1 |

## Findings

Round-2 scope is convergence: are the blocking findings resolved, and did the revision break
anything? There was no revision, so nothing broke. The four round-1 Highs carry forward unresolved.
One new finding (F-11) is filed — it is about this round's own bookkeeping, not about the code.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **Carried forward, unresolved. AT-M9 asserts one absence and nothing else.** The title promises seven conjuncts (failed status, no reason code, §8.3 effectiveness table appended, marker released, error verbatim in body). The body asserts `expect(result.status).not.toBe("refused")` — an absence-only oracle that passes for every non-`refused` status, including the `no-op` the inert fixture actually produces. `throwOn: new Set([1])` never fires because `NOTHING_FOUND_REPLY` derives no proposals, so the second dispatch never happens. The row is registered green against an AT it does not exercise. | `consolidationPass.test.js:503-517`; FSPEC:2136, 2140 |
| F-02 | High | Local | **Carried forward, unresolved. BR-23 / E-22 / AT-N4 remain unimplemented behind an echo oracle.** FSPEC:2618 and :2713 require a configured-but-unresolvable `pluginRepository` to yield `repository-unresolved`. `openClone` returns that code only on the `cfg.pluginRepository == null` branch (`consolidate-learnings.js:2185-2188`); a configured value is interpolated straight into the clone URL (`:2192`) and the resulting failure is classified `api-failure` (`:2196`). All three `openClone` call sites in test pass `{pluginRepository: null}`. AT-N4 hand-builds `reasons: new Set(["repository-unresolved"])` into `state` and asserts the renderer echoes it (`consolidationReport.test.js:412-433`) — proof the renderer echoes what it is handed, never proof of the condition. This is the one row where production, not just the oracle, is wrong. | `consolidate-learnings.js:2185-2197`; `consolidationReport.test.js:412-433`; FSPEC:2618, 2713 |
| F-03 | High | Local | **Carried forward, unresolved. Builder-not-wired (DC-07) on the config-notice shape.** `notesFromConfigParse` emits `{subject: "consolidation.${key}", missingField: key, detail}` and its docblock still states the notices are "assembled by the caller, exactly as they will be inside `main()` once T31 lands it" (`consolidate-learnings.js:640-656` region). `main()` pushes a different shape — `{subject: "config", detail}` — with no `missingField` (`consolidate-learnings.js:525-534`). The AT-N1…N3 tests transcribe the builder's shape, so the assembled production report is not what any test renders. The comment naming an unlanded task is itself the admission. | `consolidationReport.test.js:51, 368-410, 643-656`; `consolidate-learnings.js:525-534, 2069-2075` |
| F-04 | High | Local | **Carried forward, unresolved. AT-M5 promises set-equality, asserts exclusion.** Title: "the observed pathspec set of every commit is set-equal to the §5.4 write set, and never contains the lock path". Body: `expect(commitCalls.length).toBeGreaterThan(0)` plus a per-call `expect(pathspec).not.toContain(MARKER_PATH)`. The exclusion half is real; the set-equality half is absent, so a commit that silently drops a pathspec — `state.writeSet` losing a member — stays green. PROPERTIES §O-2 names exactly this ("set-equality, never containment, wherever a dropped member is invisible"); `state.writeSet` (`consolidate-learnings.js:511`) is the right thing to compare against. | `consolidationPass.test.js:450-462`; PROPERTIES §O-2 |
| F-05 | Medium | Local | Carried forward. Absence-only oracles on `effectivenessTable`'s `state` — `not.toBe("unmeasurable")` / `not.toBe("ineffective")` with no positive conjunct, where `expect(row.state).toBeNull()` is available and falsifiable. | `consolidationEffectiveness.test.js:262, 290-303` |
| F-06 | Medium | Local | Carried forward. AT-M11 is three negations with no positive terminal-status or marker-taken conjunct. | `consolidationPass.test.js:412-428` |
| F-07 | Medium | Local | Carried forward. AT-M7/AT-M8 exercise `dev.resolveAdvisoryRung` test-locally; no assertion proves the `ADVISORY_MODEL_FALLBACK:` line reaches `result.body` on a pass, as §8.4 obliges. | `consolidationRung.test.js:119-157`; `consolidate-learnings.js:514-520, 606-612` |
| F-08 | Medium | Process | Carried forward. PROPERTIES §12.2/§12.3 property→file maps have no mechanical guard; PROP-TRC-01 guards FSPEC §13 ↔ TSPEC §12.3 only. A set-equality guard over §12.2 would have caught F-01 and F-04 mechanically. | PROPERTIES §12.2, §12.3; `consolidationTraceability.test.js:1-26` |
| F-09 | Low | Local | Carried forward. Dead RED-phase scaffold `notImplemented` defined and never called. | `consolidate-learnings.js:1063-1067` |
| F-10 | Low | Local | Carried forward. Seven "not yet landed" comments (T21/T30/T31) contradict HEAD and act as standing justifications for the weak oracles in F-01 and F-03. | `consolidationPass.test.js:345, 497, 512-513`; `consolidationRung.test.js:24`; `consolidationReport.test.js:641`; `consolidationRoute.test.js:16, 28, 241` |
| F-11 | Medium | Process | **New. Round-1's CR review file is outside the round window the loop derives.** Phase CR passes a directory target, so `roundDocType` resolves to null and `reviewFileType` becomes the literal `"REVIEW"` (`pdlc/workflows/orchestrate-dev.js:5812-5813`). Round 1 was filed as `CROSS-REVIEW-test-engineer-IMPLEMENTATION-v1.md` (and PM's as `...-product-manager-IMPLEMENTATION-v1.md`), which `deriveRoundWindow` will not count as CR round 1 — the round history for this phase reads as empty. This file uses `REVIEW-v2` to re-enter the window, which leaves a deliberate `v1` gap rather than a silently mis-keyed history. Durable fix belongs in the CR reviewer prompt: name the phase's file type explicitly rather than letting the role infer it from the artifact under review. | `orchestrate-dev.js:5812-5813`; this feature's `CROSS-REVIEW-*-IMPLEMENTATION-v1.md` pair |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round 1's Q-01 is unanswered and still gates F-02: is a configured-but-unresolvable `pluginRepository` meant to land on `api-failure` (in which case FSPEC BR-23/E-22 needs an erratum) or on `repository-unresolved` (in which case `openClone`'s non-null branch needs a resolve probe)? The spec and the code disagree and no test drives the branch; either answer is shippable, the disagreement is not. |
| Q-02 | Round 1's Q-02 is unanswered and still gates F-03: is `main()`'s `{subject: "config", detail}` the intended notice shape, or is `notesFromConfigParse`'s `{subject: "consolidation.${key}", missingField}` shape the one T31 was meant to wire in? The `missingField` key is read by the renderer and written by no production caller, which points at the latter. |
| Q-03 | Round 1's Q-03 is unanswered and still gates F-01: does a fixture that actually reaches step 13 exist anywhere in the suite? If it is genuinely out of reach, AT-M9's row should say so rather than claim the AT. |
| Q-04 | Was any remediation attempted between rounds? The diff `495e62a8..HEAD` shows only PM's review file, so from the testing lens this round had nothing to converge on. If remediation was expected and did not land, that is worth knowing before round 3 spends a budget slot. |

## Positive Observations

- The round-1 positives all survive re-verification unchanged, because nothing changed: every RED
  block still un-skipped across sixteen new test files, set-equality as house style in
  `consolidationLifecycle.test.js:317` / `consolidationParse.test.js:138` / `consolidationBuild.test.js:288, 300`,
  the non-disclosure sweep's whole-transcript falsifier, AT-Q7's runtime oracle with source-grep
  demoted to supplementary, and PROPERTIES §O-1…§O-6 existing at all.
- The working tree is clean and `build-runtime.mjs --check` was green at round 1 with no artifact
  touched since, so nothing in this round's verdict is about drift or staleness.
- PM's round-1 review landed in parallel without touching code, which kept the delta clean enough to
  diff in one command. That is the cheap case for a re-review and it worked as designed.

## Recommendation

## Verdict

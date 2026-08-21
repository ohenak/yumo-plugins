# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review. Prior findings from `CROSS-REVIEW-test-engineer-FSPEC-v1.md`, plus new issues in the changed sections only.

## Delta Base and Verification Method

Base of the delta: `ff55d9ea` (the commit at which v1 was written). Diff:
`git diff ff55d9ea..HEAD -- docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md` — 159 insertions,
48 deletions across §2, §3.1, §3.2, §3.4, §3.5, §4 (BR-07, BR-08, BR-11, BR-15), §5 (EC-09,
EC-15/EC-15a, EC-16, EC-20, EC-21) and §6 (AT-02, AT-03, AT-04, AT-08, AT-10, AT-12, AT-13,
AT-14, AT-15, AT-17, AT-18), plus §7 (OB-F5, OB-F6, round-1 note).

Every claim the delta newly asserts about shipped behaviour was re-verified against
`origin/main:pdlc/workflows/orchestrate-dev.js` (the tree is still 1637 commits behind
`origin/main`, so the mechanism is not readable at `HEAD` — OB-F1 remains undischarged).

| New claim in the delta | Verification | Result |
|---|---|---|
| §3.2 / EC-21: a record naming no commit **passes** question 5, arm commented "pre-`head` record: honoured as before" | `headCorroborated` at `:15280`; `if (!recordedHead) return true; // pre-\`head\` record: honoured as before` at `:15281` | verbatim, holds |
| §3.2: shipped order is feature → plan → **ancestry** → over-count, i.e. IG-5 before IG-4, diverging from the REQ's numbering | chain at `:15300` (feature), `:15305` (planHash), `:15307` (`!(await headCorroborated(...))`), `:15313` (`lastGreenWave > waves.length`) | holds — AT-03's fixture pair is the discriminating one |
| BR-15 / EC-15a: recording is **per wave**, so a failed write costs only the waves after the last successful one | `writeWaveLedger(formatWaveLedger(featureName, planHash, waveNum, waveHead), ...)` is called inside the `for (let waveIndex...)` loop, under `if (waveGit)` (`:15531` opens, write at `:15600`) | holds |
| BR-08 / §3.4 / AT-18: completion is a **high-water property of the plan**, counted from the plan's first wave | the recorded number is `waveNum = waveIndex + 1`, plan-absolute, not run-relative; skipped waves `continue` at `:15381` before any write | holds — AT-18's discriminating value is real |
| EC-20 / AT-12: the V-wave is reached **unconditionally** after the wave loop, outside `allWavesRecorded` | `if (allWavesRecorded) break` at `:15372` exits the loop only; `recordPhase("I", ..., "⏭")` at `:15615`; `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` at `:15656` is unguarded | holds |
| AT-12: under a script-owned gate the V-wave invokes the gate command exactly once | `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); }` at `:15672-15673` | holds |
| AT-08: the recognised `implementation.*` keys are exactly {`testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave`} | `parseImplementationConfig`'s return shape at `:12245-12250`; no fifth key is read anywhere (`grep -n "implConfig\."`) | **exact** — the literal in AT-08 is transcribable as written |
| EC-20: the V-wave "**commits** on every invocation" | the script commits nothing for the V-wave; the commit is an instruction in `propertiesTestPrompt` ("All tests must pass before committing. Commit and push.", `:10565`) and is never verified | **overstated** — see F-01 |
| AT-14's branch precondition: the ignore rule is absent from this tree | `grep -n pdlc-wave-state .gitignore` → no match at `HEAD` | holds; correctly stated as a branch-state consequence |

## Prior Findings — Disposition

| v1 ID | Sev | Disposition | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | §2 Vocabulary now defines *Phase I* as the implementation wave loop and excludes Phase PT's V-wave; BR-11, EC-09 and D-5 are restated in those terms; EC-20 states the V-wave's replay explicitly; AT-12 is rewritten with a **call-count** oracle (zero agent dispatches, zero gate invocations on the wave loop) instead of the absence-shaped "no commit". The upstream half was routed as an erratum rather than absorbed — correct handling. |
| F-02 | High | **Resolved** | AT-08's "absence of such a key from the config surface" is replaced by set equality over the four recognised `implementation.*` keys, transcribed literally and explicitly "never read back out of the config parser", plus a positive conjunct (record removed ⇒ outcome (a) announced) proving the named hatch is the hatch that works. The literal set is exact against `parseImplementationConfig`. |
| F-03 | Medium | **Resolved** | §2 defines *Announcement* as the run log, names the report as a second observable where a criterion names it, and states that provenance is announced content a test may assert on. AT-05/06/07/16 are now readable. |
| F-04 | Medium | **Resolved (routed)** | AT-02's set-equality target moves from the six IG **labels** to the **announced reasons**, and states explicitly that IG-1 covers more than one distinguishable arm; the enumeration of those arms is assigned to the TSPEC (OB-F2). See F-03 below — the routing is right, but the AT is not executable until the TSPEC lands. |
| F-05 | Medium | **Resolved** | AT-04's "adversarial bytes" is replaced by a named, finite fixture set (second wave, last wave, named commit = tip, named commit = earlier ancestor), with the reason the old phrasing was vacuous stated in-line. |
| F-06 | Medium | **Resolved** | AT-13 now names one fixture per outcome and asserts set equality over the observed outcomes. |
| F-07 | Medium | **Resolved** | §3.4 and EC-09 split the retention benefit by whether history was rewritten; the DOD step-0 rebase case is routed to EC-06, and §5 carries one row for each. The collision I flagged is gone. |
| F-08 | Medium | **Resolved** | AT-17 and EC-16 narrow the ownership claim to *this feature's PLAN* (a finite check over its manifest) and route the general form to Phase P's ownership gate via OB-F6. |
| F-09 | Medium | **Resolved (recorded)** | AT-14 now carries an explicit branch precondition: the rule exists on the default branch, not here, so the test is RED until OB-F1 is discharged, and te-author is told not to weaken the arm to observed quiet. That is the right disposition for a branch-state fact. |
| F-10 | Low | **Resolved** | AT-10's negative arm gains its positive conjunct on the same path — the announced resume point is *the same wave*, not merely unchanged. |
| F-11 | Low | **Partially resolved** | AT-08, AT-12, AT-13 and AT-18 gained *Who*; AT-03, AT-04, AT-09, AT-10, AT-11, AT-14, AT-15, AT-16 and AT-17 still lack it. Re-filed as F-04. |
| F-12 | Low | **Resolved** | §3.5's raw `orchestrate-queue.js:45` anchor is replaced by a symbol description (`imports orchestrate-dev`'s `main` as `realMain`). The remaining `file:line` anchors are confined to §1's grounding table, where position is itself the evidence under test — the DEC-DOC-01 carve-out. |

Both v1 High findings are resolved, and neither resolution introduced a weaker oracle: F-01's
replacement is a call-count oracle over two seams and F-02's is a set-equality check over a
literal I could verify against the parser, which is stronger than what it replaced.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | EC-20 says the V-wave "dispatches, gates and **commits** on every invocation" and AT-12's fourth conjunct asserts "its commit is the run's only Phase-I-adjacent commit". The dispatch and the gate are script-owned and mechanically true; the **commit is not**. The script commits nothing for the V-wave — the commit is an instruction inside the dispatch prompt ("All tests must pass before committing. Commit and push.", `propertiesTestPrompt`, `origin/main:pdlc/workflows/orchestrate-dev.js:10565`) and is never verified afterwards. Under outcome (c) with the PROPERTIES suite already written and green, the agent may correctly add nothing, so a test asserting "the V-wave produces a commit" is flaky by construction. Restate the conjunct over the two script-owned seams only, and demote the commit to "may commit, agent-dependent". | EC-20, AT-12 |
| F-02 | Medium | Local | AT-12's V-wave count "dispatches exactly **one** agent" is measured through `withDispatchRetry` (`:8068-8077`), which re-dispatches once on a transport fault and would make the count 2 without any behaviour change in this feature. The literal 1 is only correct under the precondition "the first dispatch does not fault". Name that precondition in AT-12, so te-author pins a non-faulting agent seam rather than writing a count that a retry can turn red for an unrelated reason. | AT-12 |
| F-03 | Low | Local | AT-02 is now correctly targeted at the **announced reasons** rather than the six IG labels, but the enumeration those reasons come from is deferred to the TSPEC (OB-F2), so the AT is not executable at this altitude and PROPERTIES cannot write the set-equality check until the TSPEC lands. That is legitimate routing, not a defect — but the dependency is currently implicit. State it: AT-02's oracle is blocked on OB-F2, and OB-F5 should say the same, so a te-author reaching PROPERTIES before the TSPEC names the arms does not silently fall back to containment over the five announced-cause rows §3.2 already carries. | AT-02, OB-F2, OB-F5 |
| F-04 | Low | Local | *Who/Given/When/Then* is still uneven across §6. AT-08, AT-12, AT-13 and AT-18 gained a *Who* in this revision; AT-03, AT-04, AT-09, AT-10, AT-11, AT-14, AT-15, AT-16 and AT-17 still omit it, against §6's own stated format. Carried over from v1 F-11 (partially addressed). | §6 |
| F-05 | Low | Local | AT-15's arm 2 requires a fixture in which the wave-1 write succeeds and the write at a later wave M fails — i.e. a write seam that fails **selectively by call ordinal**, not a uniformly read-only location. The discriminating value claimed ("fails an implementation that discards the whole record on any write failure") depends entirely on that fixture shape, and nothing in AT-15 or EC-15a says so. One clause naming the ordinal-selective write seam makes the arm writable without a round-trip. | AT-15, EC-15a |

**No High findings.** Both v1 Highs are resolved by stronger oracles, and the delta introduced no
new claim that a test could only pass. F-01 and F-02 are precision defects in an oracle that is
otherwise correct — the two seam counts AT-12 leans on are both real and both verifiable — and
neither changes what the feature must do.

## Questions

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review. Prior cross-review `CROSS-REVIEW-software-engineer-FSPEC-v1.md`;
document diffed `f84dae68..HEAD`. Only my own v1 findings and the changed sections are in scope.

## Prior Findings — Disposition

Every v1 finding is resolved. Each row states the change and the check I ran against the tree the
FSPEC cites (`origin/main`, since the authoring tree still predates the mechanism — §1's standing
caveat, unchanged and still correct).

| v1 ID | Sev | Disposition | Verification |
|---|---|---|---|
| F-01 | High | **Resolved.** §3.4 gains "Completion is a high-water property of the plan, not of the run" with the two-halt worked example; BR-08 carries the monotonicity clause; AT-18 is the new two-halt acceptance test with a stated discriminating value. | The high-water reading is the shipped one: `formatWaveLedger(featureName, planHash, waveNum, waveHead)` is called with the loop's **absolute** `waveNum` (`orchestrate-dev.js:15600-15603`), and the reader resumes at `recorded.lastGreenWave + 1` (`:15335`). AT-18's "waves 1–3 **each** announced as skipped" is observable: the skip announcement is emitted per wave inside the loop (`:15373-15381`), not once. |
| F-02 | High | **Resolved.** EC-15 is narrowed to "**no** write succeeds"; new EC-15a carries the reachable partial case; BR-15 states the bound; AT-15 splits into two arms with arm 2 named as the discriminating one. | The partial shape is exactly the reachable one: `writeWaveLedger` catches per call (`:15350-15360`) and is invoked once per wave (`:15600`), so a later failure leaves the earlier record standing. EC-15a's cost bound — "the number of consecutive failed writes at the end of the run" — is right, because each write overwrites with an absolute wave number, so an interior failure costs nothing once a later write lands. |
| F-03 | Medium | **Resolved.** §3.2 now states question 5 has **three** answers and EC-21 carries the no-commit case as its own row, with the accepted cost named and bounded by BR-10 as EC-18 is. | `headCorroborated`'s absent-commit arm is `if (!recordedHead) return true; // pre-head record: honoured as before` (`:15281`), and `parseWaveLedger` makes `head` optional on read (`:12297-12302`). The FSPEC quotes the comment and names the symbol without a bare line anchor. |
| F-04 | Medium | **Resolved.** §3.2 states in bold that its order deliberately is not REQ-WVR-02's IG numbering, and forbids a downstream reader "correcting" it; AT-03's fixture is now the IG-5 × IG-4 pair with the reason it is the discriminating one. | The shipped chain is `feature` → `planHash` → `headCorroborated` → `lastGreenWave > waves.length` (`:15300-15317`), i.e. ancestry **before** over-count. AT-03's expectation (IG-5 announced) matches the shipped order and fails under the REQ's numbering — the test now discriminates. |
| F-05 | Medium | **Resolved.** AT-08 carries two positive conjuncts: the hatch is shown to function (record removed ⇒ outcome (a)), and set equality over the recognised `implementation.*` keys against a literal. | The literal is correct against the tree: `parseImplementationConfig` recognises exactly `testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave` (`:191-252`, `IMPLEMENTATION_DEFAULTS` `:169-174`) — the four the AT names, no more. A `forceFullRun` key would land in `invalidKeys` and fail the set equality. |
| F-06 | Medium | **Resolved.** BR-07 is scoped to runs that start anywhere other than the plan's first wave, plus operator-pointer and announced-disregard full runs; the IG-6 silent full run is named as "the absence of a resume", not an unattributed start. | Matches EC-01/EC-02 and the shipped silence: `parseWaveLedger` returns `{state: null, reason: null}` for absent, empty and `{}` content (`:12268-12271`), and only `ledger.reason` reaches `ignore()` (`:15297`). No contradiction with AT-02's IG-6 arm remains. |
| F-07 | Low | **Resolved.** §3.5's bare `orchestrate-queue.js:45` anchor is replaced by the symbol-named form ("imports `orchestrate-dev`'s `main` as `realMain`"). | `import realMain, { … } from "./orchestrate-dev.js";` — `orchestrate-queue.js`, single-line import as its own comment requires. DEC-DOC-01 satisfied. |
| F-08 | Low | **Resolved.** D-4/D-5 no longer render as malformed question rows: D-3 now carries both arms and the two terminal actions are bullets below the table. | Presentational; the routing is unchanged and still matches `allWavesRecorded` / `startWave` (`:15318-15344`). |

## Findings

No High findings. All three below are new, confined to sections this revision changed, and each is
a one-sentence or one-clause fix.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | EC-15a states the correct partial-write behaviour but pins nothing about the notice's **content**, and the shipped notice asserts the opposite ("a later invocation will simply start from wave 1"). An implementer who lands EC-15a's behaviour while keeping today's wording ships a run that announces a false cost — and every AT passes. | EC-15a, EC-15, BR-15, AT-15 |
| F-02 | Medium | Local | AT-18's *discriminating value* sentence mis-computes the counterfactual: a per-run record would resume at wave 3 and skip waves 1–2, not "skip only wave 3". The oracle itself is right; the rationale a te-author reads while building the negative arm is not. | AT-18 |
| F-03 | Low | Local | AT-12's V-wave conjunct counts "exactly **one** agent dispatch", but the V-wave dispatch is wrapped in a retry envelope, so the count is one only for a fixture whose transport does not fail. The fixture condition is unstated. | AT-12 |

### F-01 (Medium) — EC-15a fixes the behaviour but leaves the announcement free to contradict it

This is the residue of my v1 F-02, and the revision got the substantive half right: EC-15/EC-15a
now split all-writes-fail from some-write-succeeds, BR-15 bounds the cost, and AT-15 arm 2 is
named as the discriminating arm. What neither row constrains is what the notice *says*.

The shipped notice is:

> `Notice: could not ${what} the wave ledger ${WAVE_STATE_PATH} — ${err}. The run continues; a
> later invocation will simply start from wave 1.`

(`pdlc/workflows/orchestrate-dev.js:15354-15359`, inside `writeWaveLedger`.) Under EC-15a that
sentence is false: the later invocation resolves outcome (b) at the last successfully recorded
wave. The announcement is an observable this FSPEC otherwise governs closely — §2's *Announcement*
vocabulary entry, BR-07's provenance rule, EC-09's "announced with the reason and the hatch" all
constrain announced content — so leaving this one unconstrained is an inconsistency in the
document's own discipline, not a TSPEC-altitude omission.

**What must change.** One clause on EC-15a (or BR-15): the failed-write notice states the cost it
actually imposes — that the waves recorded after the last successful write will be re-executed —
and does not promise a full run from wave 1 unless no write in the run succeeded. Then AT-15's two
arms have distinct announcement oracles as well as distinct next-invocation oracles, and arm 2
fails an implementation that lands the right resume with the wrong sentence.

### F-02 (Medium) — AT-18's counterfactual arithmetic is wrong

AT-18's fixture: halted at wave 2, re-invoked and halted at wave 4, re-invoked a third time; the
expectation is resume point wave 4, provenance `automatic`, waves 1–3 each announced as skipped.
That is correct and I verified it against the mechanism (absolute `waveNum` written at
`:15600-15603`; resume at `lastGreenWave + 1`, `:15335`; per-wave skip emit, `:15373-15381`).

The stated discriminating value is not. Under a per-run record, run 2 executes waves 2 and 3, so a
run-scoped counter records 2, the third invocation resumes at wave **3**, and it skips waves **1
and 2**. The FSPEC says such an implementation "would announce a resume point of wave 3 and skip
only wave 3" — the resume point is right by coincidence of arithmetic, the skip set is not, and no
reading of a per-run record produces "skip only wave 3".

This matters because the discriminating-value sentence is the part a te-author transcribes when
building the negative arm. Fix the sentence to name the wrong skip set (waves 1–2) alongside the
wrong resume point; the *Then* clause needs no change.

### F-03 (Low) — AT-12's dispatch count is fixture-conditional

AT-12's fourth conjunct asserts the V-wave "dispatches exactly **one** agent". The V-wave call is
`withDispatchRetry(() => agentFn("se-implement", propertiesTestPrompt(featureName), …), { label:
"V-wave … PROPERTIES tests" })` (`pdlc/workflows/orchestrate-dev.js:15658-15666`), so a transport
failure produces more than one call on the counting spy the AT prescribes. The count is exactly
one for a fixture whose agent seam succeeds first time, which is certainly what te-author will
build — but the AT states an unconditional count, and a fixture that exercises retry (a plausible
neighbouring property) would fail a correct implementation. One clause — "with a seam that
succeeds on first call; the dispatch-retry envelope is out of this criterion's scope" — closes it.

## Questions

## Positive Observations

## Recommendation

## Verdict

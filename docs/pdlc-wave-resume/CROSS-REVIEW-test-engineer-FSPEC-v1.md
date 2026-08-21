# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** testing lens only — testability, oracle falsifiability, edge-case completeness, AT derivability

## Grounding

Every claim below was checked against the repository, not against the FSPEC's prose. Because
this authoring tree does not contain the resume mechanism (FSPEC OB-F1 — confirmed:
`git rev-list --count origin/main ^HEAD` -> 1637, and `git grep WAVE_STATE_PATH` on `HEAD`
returns nothing), verification was done against `origin/main`, naming the symbol in each case.

| FSPEC claim | Verification | Result |
|---|---|---|
| §1 anchors `WAVE_STATE_PATH` :12214, `parseWaveLedger` :12267, `explicitPointer` :15236, clamp :15237-15244, `if (waveGit)` :15531, ledger write :15600, retention comment :15607-15615 | each line read on `origin/main:pdlc/workflows/orchestrate-dev.js` | all eight anchors resolve exactly as cited |
| §1 "ignore rule at `.gitignore:41`" | `git show origin/main:.gitignore` line 41 = `/.claude/pdlc-wave-state.json` | holds on `origin/main`; **absent from `HEAD`** (see F-09) |
| §1 "queue delegates in-process" | `origin/main:pdlc/workflows/orchestrate-queue.js:45` imports `realMain` from `./orchestrate-dev.js` | holds |
| §1 "commits and the record write are guarded by the transport, not the gate mode" | `if (scriptGate)` opens at :15432 and closes at :15494; `if (waveGit)` at :15531 is its **sibling**, not its child | holds — AT-09's companion arm is sound |
| §3.2 six questions, in that order | `parseWaveLedger` reason (:15364) -> feature (:15310) -> `planHash` (:15315) -> `headCorroborated` (:15317) -> `lastGreenWave > waves.length` (:15322) | order matches the spec exactly |
| §3.2 Q1 silent on absent/empty/`{}` | `parseWaveLedger` returns `{state:null, reason:null}` for `null`, `""` and `"{}"` (:12268-12272), and the caller only emits under `ledger.reason` | holds — EC-01/EC-02 correct |
| EC-06 unavailable probe is not staleness | `headCorroborated` returns `true` when `branchGuardTransport` yields nothing and on `catch` | holds — EC-07 correct |
| EC-13 gate green + no transport records nothing | ledger write is inside `if (waveGit)` (:15531/:15600) | holds |
| EC-14 no-change wave is still completed | a task with `paths.length === 0` `continue`s, yet `writeWaveLedger` still runs for the wave | holds |
| AT-12 "one row, not two" | `if (allWavesRecorded) recordPhase("I", ..., "⏭", ...)` else `recordPhase("I", ..., "✅", ...)` at :15615-15631 | one row, distinguishing status — holds |
| AT-12 "no gate executes, Phase I produces no commit" | **falsified** — see F-01 | does not hold |


## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | Outcome (c) is specified as "Phase I dispatches nothing, executes no gate, and produces no commit", but the FSPEC never states whether Phase PT's V-wave is inside "Phase I". Against the shipped mechanism the claim is false, so AT-12 is unwritable as stated and RED if written literally. | §3.1 D-5, BR-11, EC-09, AT-12 |
| F-02 | High | Local | AT-08's second arm — "no configuration value anywhere in the pipeline forces a full run — asserted as the absence of such a key from the config surface" — is an absence-only oracle over an unenumerated domain. It can only pass. | AT-08, BR-06, BR-17 |
| F-03 | Medium | Local | No announcement in the FSPEC names its observable channel, and `operator-set`/`automatic` are defined as vocabulary but never as anything a test can read. AT-05, AT-06, AT-07 and AT-16 all assert provenance and none can be written without inventing the oracle. | §2 Vocabulary, BR-07, AT-05/06/07/16 |
| F-04 | Medium | Local | AT-02's set-equality is declared over {IG-1..IG-6}, but IG-1 ("readable as a record this pipeline wrote") is one FSPEC cause covering three distinct shipped rejection reasons. A set-equality check over six causes cannot fail when one of the three sub-branches is deleted. | §3.2 row 2, AT-02, OB-F5 |
| F-05 | Medium | Local | AT-04's negative arm is a universally quantified negative ("no record content produces a commit that precedes a whole-tree verification") with no named fixture set and no bound on "any record content, including bytes chosen adversarially". | AT-04 |
| F-06 | Medium | Local | AT-13 is not an acceptance test: it carries an *Oracle form* line and nothing else — no Who, Given, When or Then — and "a fixture suite covering all three" names no fixtures. It is the only stated proof of BR-01, the FSPEC's headline closure rule. | AT-13, BR-01 |
| F-07 | Medium | Local | §3.4 sells retention on the CR/DOD/PUB re-invocation case, but EC-06 lists Phase DOD step 0's rebase as an IG-5 disregard cause. The document's headline benefit case and its disregard catalogue collide, and no AT covers "halt in DOD, re-invoke". | §3.4, EC-06, EC-09, AT-12 |
| F-08 | Medium | Cross-Feature | AT-17's "the record is in no wave's owned-path set, so no remediation envelope can authorise touching it" is a claim over every PLAN this pipeline will ever run, asserted as a test. As written it is either unfalsifiable or true only of this feature's own PLAN. | EC-16, AT-17, OB-F6 |
| F-09 | Medium | Local | AT-14 asserts the exclusion is "anchored by an ignore rule, asserted against the rule itself". Verified: no `pdlc-wave-state` rule exists in `HEAD`'s `.gitignore` — it exists only at `origin/main:.gitignore:41`. AT-14 is RED in the authoring tree, which OB-F1 flags as a branch problem but no AT records as a test consequence. | AT-14, BR-14, OB-F1 |
| F-10 | Low | Local | AT-10's negative arm ("completion does not change when a stray unrelated commit is added or removed from history") states no positive conjunct on that same path. EC-14 supplies one — the announced next wave — but the AT does not carry it. | AT-10, EC-14 |
| F-11 | Low | Local | AT-01 and AT-02 carry *Who*; AT-03 through AT-17 drop it. The FSPEC's stated AT format is Who/Given/When/Then. | §6 |
| F-12 | Low | Process | §3.5 cites `pdlc/workflows/orchestrate-queue.js:45` as a bare `file:line` in body prose with no accompanying symbol name, while §1's table cites the same fact by symbol (`realMain`). Per DEC-DOC-01 the bare anchor is a Process/Low finding, not a nit. | §3.5 |

### F-01 — outcome (c) and the V-wave (detail)

The FSPEC states four times that outcome (c) executes no gate and lands no commit. Against
`origin/main`:

- `if (allWavesRecorded) break;` (`orchestrate-dev.js:15372`) exits the wave loop at index 0, so
  no *implementation* wave dispatches. That half of the claim holds.
- Control then reaches `recordPhase("I", ..., "⏭", ...)` (`:15615`) and falls straight through to
  `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` (`:15656`), which is **not guarded by
  `allWavesRecorded`**. It dispatches `se-implement`, sets `vWaveNum = waves.length + 1`, and
  under `scriptGate` runs `runCommandFn(implConfig.testCommand)` as a gate.
- The V-wave is the one dispatch that commits its own work — the block's own comment at
  `:15646-15650` says so explicitly.
- The completeness test the record is matched against is `recorded.lastGreenWave === waves.length`
  (`:15326`), and `waves.length` excludes the V-wave, which the ledger write site inside the loop
  can never record.

So under outcome (c) the shipped mechanism dispatches an agent, runs the full test command, and
produces a commit — and does so on *every* re-invocation, because the V-wave is structurally
unrecordable. The REQ itself counts the V-wave as a wave ("**16** waves (17 counting Phase PT's
appended V-wave)", REQ OF-1), which is what makes the omission a gap rather than a reading.

Two things are needed, and only the second is this FSPEC's to fix:

1. REQ-WVR-08's "no gate runs and Phase I produces no new commit" needs an erratum — raised
   separately in this review's final message, not folded into the verdict below.
2. This FSPEC must define, in §2's Vocabulary, whether "Phase I" in D-5/BR-11/EC-09/AT-12 means
   the implementation wave loop or the loop plus the V-wave, and restate AT-12's Then in those
   terms. If the V-wave is in scope, AT-12 needs a *fourth* conjunct covering it; if it is out of
   scope, AT-12's "Phase I produces **no commit**" must be narrowed to "no implementation-wave
   commit" and an EC row must record that the V-wave replays under outcome (c).

**Suggested oracle either way:** a call-count spy on the agent seam plus a spy on `_runCommand`,
asserting the exact number of dispatches and gate invocations under outcome (c) — a literal from
the spec, not a value derived from the code under test. An absence-shaped "no commit" oracle
alone cannot distinguish "the V-wave was skipped" from "the V-wave ran and had nothing to add".

### F-02 — AT-08's config-surface arm (detail)

"the absence of such a key from the config surface" names no surface and no enumeration. Any key
whose name the test author fails to guess passes the assertion, and the assertion also passes on
a pipeline that has no config at all. To make it falsifiable:

- enumerate the config keys Phase I reads (`implementation.startWave`, `implementation.testCommand`,
  `implementation.postWaveCommand`, `implementation.postWavePathspecs` are the ones this feature
  touches) and assert **set equality** over that enumeration, so an added forcing key fails;
- pair it with the positive conjunct on the same path that BR-06 already implies: removing the
  record produces outcome (a) with its announcement, i.e. the one hatch that does exist works.

The expected key set must be transcribed literally from the spec, never read back out of the
config parser.


## Questions

## Positive Observations

## Recommendation

## Verdict

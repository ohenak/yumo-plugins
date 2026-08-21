# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** testability, edge-case completeness, test-strategy soundness, oracle falsifiability

## Grounding

Every claim below is verified against the repository, not against the TSPEC's prose. Because this
tree does not carry the mechanism (`grep -n WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`
returns nothing; `git rev-list --count HEAD..origin/main` -> `1637`), I verified against
`origin/main` at `345ae358` exactly as §1.1 instructs, via
`git show origin/main:<path>`. Line numbers below are line numbers in the `origin/main` blob.

**The §1.1 verification table holds.** I re-ran all seventeen rows and every one is accurate:

| Row | Verified |
|---|---|
| V-1 | `export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` — `orchestrate-dev.js:12214` |
| V-2 | `parseWaveLedger` `:12267`; doc comment enumerates the three outcomes `:12253-12262`; `""` and `"{}"` both short-circuit at `:12271` |
| V-3 | `computePlanHash` `:12230`; "Not a cryptographic digest and not trying to be" `:12220`; FNV-1a offset/prime `:12244-12248`; `padStart(8, "0")` `:12250` |
| V-4 | `formatWaveLedger` `:12325`; `{version: 1, feature, planHash, lastGreenWave}` +/- `head` `:12327-12330` |
| V-5 | `const explicitPointer = startWave > 1;` `:15236`, above `if (startWave > waves.length)` `:15237` |
| V-6 | `if (!explicitPointer) {` `:15263` wraps the whole read/decide chain through `:15346` |
| V-7 | `headCorroborated` `:15280`; `return true; // pre-\`head\` record` `:15281`; `return true; // no transport to ask` `:15283` |
| V-8 | `// Only now — verified — does anything get committed (M-6).` `:15530`, `if (waveGit) {` `:15531`, and `writeWaveLedger(formatWaveLedger(...))` `:15600-15603` as its last statement. The guard is **not** nested under `scriptGate` (`if (scriptGate)` closes well above, `:15432`), so AT-09's companion arm is reachable. |
| V-9 | `writeWaveLedger`'s `try/catch` `:15348-15359`, "The run continues" `:15357` |
| V-10 | `// Every implementation wave is green and committed. The record is KEPT` `:15607` |
| V-11 | `startWave = waves.length + 1; ledgerResume = true; allWavesRecorded = true;` `:15325-15327`; `recordPhase("I", "Implementation", "⏭", …)` `:15616-15622` |
| V-12 | `to force a full run` in both banners — `:15331` and `:15342` |
| V-13 | `IMPLEMENTATION_DEFAULTS` `:169`, four keys |
| V-14 | `.gitignore:41` `/.claude/pdlc-wave-state.json` under the anchoring rationale block `:24-32`. **Absent from this tree's `.gitignore`** (only `/.claude/workflows/` at `:29`) — F-10 turns on this. |
| V-15 | `import realMain … from "./orchestrate-dev.js"` `orchestrate-queue.js:45`; `pipelineReport: report` `:1637` |
| V-16 | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended", …)` `waveExecution.test.js:2239` |
| V-17 | `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` `:15655`; single `withDispatchRetry(() => agentFn("se-implement", propertiesTestPrompt(...)))` `:15657-15665`; `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); … }` `:15672-15682`, unconditionally after the wave loop and reached on the `allWavesRecorded` break `:15372` |

§6.2's OB-F4 recipe also checks out: `pdlc-wave-gate-baseline.md` on `origin/main` is at
`| Version | 1.2 · 2026-08-20 |` (`:7`), has sections through `## 4` (`:67`), ids through `M-WG-14`
(`:78`), and `M-WG-6` exists (`:45`). §6.3 item 4 checks out: `git ls-tree -r --name-only
origin/main | grep worktreeinclude` is empty.

Every test-harness symbol §5.2 cites is real: `makeLedgerArgs` `waveExecution.test.js:2204`,
`ledgerWrites` `:2236`, `PLAN_THREE_WAVES` `:2052`, `CONFIG_WITH_TEST_COMMAND` `:161`, `makeArgs`
`:164`, and the complete-ledger zero-dispatch test `:2313`.

**This is unusually well-grounded engineering work.** The findings below are, with one exception,
not about what the TSPEC claims the code does — they are about what the *test strategy* can
actually prove, and about two places where a stated-as-safe change is not safe.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | The provenance suffix of §2.4 breaks three shipped assertions; §2.4 and RT-3 both state that it breaks none. The regression net RT-2 relies on is not the net the design leaves standing. | §2.4, RT-2, RT-3 |
| F-02 | High | Local | §2.3's control flow hoists the `git merge-base --is-ancestor` probe above the feature and plan-hash guards, so the probe fires on records shipped code never probes. §2.2 says the probe "does not move" and RT-2 says the extraction is behaviour-preserving; no oracle in §5.4 discriminates. | §2.2, §2.3, RT-2 |
| F-03 | High | Local | AT-06's oracle compares a `startWave: 1` run against "the same run with no `implementation` section at all". Those two runs differ in gate mode, so the comparison cannot pass — and the only way to make it pass is to weaken it. | §5.4 AT-06 |
| F-04 | High | Cross-Feature | AT-16's queue-parity oracle names no harness and does not forbid the one seam that would falsely green it: `_runPipeline` defaults to `realMain`, and all nine shipped queue tests inject it. A parity test that injects it proves nothing about parity (DC-07's higher-level-fake rule). | §5.2, §5.3, §5.4 AT-16 |
| F-05 | Medium | Local | §2.3 is declared normative and "matches the shipped chain", but omits the shipped operator-pointer resume banner between the clamp and the ledger read. | §2.3 |
| F-06 | Medium | Local | No property-based strategy for the three pure parameterisable functions, though `fast-check` is a devDependency and this exact module already carries a property suite added as a CODE_REVIEW remediation. | §5.3, §5.4 |
| F-07 | Medium | Cross-Feature | The per-file 85% branch-coverage gate on `orchestrate-dev.js` is a CI merge gate but is not the wave gate's command, so this feature's new branches fail coverage at Phase PUB — after Phase I is green. §5 and §6.4 do not mention it. | §5, RT-5 |
| F-08 | Medium | Local | §5.2 says new doubles are "limited to fixtures, not machinery", but AT-04's interleaving oracle and AT-15 arm 2 each need machinery `makeLedgerArgs` does not provide. | §5.2, §5.4 AT-04/AT-15 |
| F-09 | Medium | Local | D-3's change to the `⏭` row detail has no oracle: AT-12 asserts the row without its provenance, AT-01 covers only the `✅` row. A scope row with no test. | §2.4, §5.4 AT-12 |
| F-10 | Medium | Local | AT-14 is specified to land RED. In wave mode a red suite is a wave-gate halt, so the ordering that keeps it from halting Phase I must be a stated PLAN precondition, not RT-4's narrative. | §5.4 AT-14, RT-4 |
| F-11 | Low | Local | `ReasonContext` is declared but unreachable from `ClassifyInput`, and `recordedWaves` names the same value the over-count sentence calls `lastGreenWave`. | §3.2 |
| F-12 | Low | Local | The `resume` decision carries `lastGreenWave`, which §2.3's apply step never reads — a field no test can falsify. | §3.2, §2.3 |
| F-13 | Low | Local | AT-02's per-code integration sentences are the place an implementation echo is most tempting; §5.1's general rule should be restated at AT-02 as "transcribed literal, never the renderer's output". | §5.1, §5.4 AT-02 |
| F-14 | Low | Local | §2.4's six announcement rows and three report rows are an enumerated contract with containment-only oracles; deleting a row fails nothing. | §2.4, §5.4 |

### F-01 (High) — the provenance suffix is not assertion-neutral

§2.4 states the suffix leaves "the existing sentence — and therefore every assertion in the shipped
test block — intact", and RT-3's whole mitigation is "shipped assertions use `startsWith` /
`toContain` on the existing prefixes". Both are false. Three shipped assertions are whole-log-line
equality or a substring that ends at the closing parenthesis:

| Assertion | Location | Why the suffix breaks it |
|---|---|---|
| `expect(logs).toContain(\`Notice: implementation.startWave=9 … — running every wave from 1.\`)` | `waveExecution.test.js:2138-2141` | `toContain` on an **array** is element equality. Appending ` (provenance: operator-set)` makes no element equal. |
| `expect(logs).toContain(\`Notice: the wave ledger ${WAVE_STATE_PATH} was ignored — ${reason}. Running every wave from 1.\`)` | `:2653-2656`, inside the four-member parameterised `it.each` "%s is ignored with a notice, and every wave runs" (`:2645`) | Same array-equality problem, on all four members — the suite that most needs to stay green under a change to the ignore notice. |
| `expect(row.detail).toContain("recorded green (wave ledger)")` | `:2682` | §2.4 proposes `recorded green (wave ledger; provenance: automatic)`. The `)` no longer follows `wave ledger`, so this substring is absent. §2.4's own claim that "the `⏭` row's existing text is preserved as a prefix" is not true of the string §2.4 specifies — the token is interpolated *inside* the parenthesis, not appended after it. |

Why this is High rather than a nit: RT-2's named mitigation for the extraction risk is "the shipped
ledger `describe` block is kept green **unchanged** as the regression net". If the announcement
change reds three of those assertions, the implementer must edit the net in the same feature that
relies on it being untouched — and the cheapest edit (relaxing `toContain` to a `some(m =>
m.startsWith(...))`) silently removes the exact-wording oracle that today pins those notices.

**To resolve.** Either (a) specify the suffix as a genuinely appended clause outside the existing
punctuation — `… recorded green (wave ledger) (provenance: automatic)` and `… Running every wave
from 1. (provenance: automatic)` — and state that the three assertions above are then untouched,
naming them; or (b) accept that the three assertions change, list them by `file:line`, and specify
the replacement assertion for each so the round's diff to the regression net is reviewable rather
than incidental. Either way §2.4's neutrality claim and RT-3's mitigation must be rewritten to
match what the code actually asserts.

### F-02 (High) — the extraction moves the ancestry probe, and nothing catches it

Shipped, the probe is the **third** arm of the `else if` chain: it runs only after
`recorded.feature === featureName` (`:15301`) and `recorded.planHash === planHash` (`:15305`) have
both passed (`:15307`). §2.3's normative flow instead computes it eagerly:

```
headOk := parsed.state ? await headCorroborated(parsed.state.head) : true
d      := classifyWaveLedger(parsed, {…, headOk})
```

For a well-formed record naming a *different feature* or a *changed plan*, shipped code issues zero
`merge-base` subprocess calls; §2.3's flow issues one. That is a real behavioural delta — a git
subprocess on a path that had none — and it is exactly the class of change §2.2 promises does not
happen ("What does not move: the `await`ed `git merge-base --is-ancestor` probe") and RT-2 promises
is caught ("extraction, unchanged in behaviour").

No oracle in §5.4 discriminates it. AT-03 is unit-only and asserts over the classifier, which by
construction receives `headOk` already resolved and therefore cannot see when it was resolved. The
shipped ancestry test asserts `expect(calls).toContainEqual(["merge-base","--is-ancestor",HEAD_SHA,
"HEAD"])` (`:2447`) — **containment**, so an extra call on the mismatch paths passes it.

**To resolve.** Pick one and say so: (a) keep the probe lazy — pass a thunk or have the classifier
return a "needs ancestry" continuation — and add a call-count oracle: *zero* `merge-base`
invocations on a feature-mismatch fixture and on a plan-hash-mismatch fixture, paired with the
positive conjunct of *exactly one* on the ancestry fixture; or (b) ratify the eager probe
explicitly in §1.2's "what is not changed" list as a stated delta, with the same call-count oracle
pinning the new contract at one per well-formed record. Silence plus a containment assertion is the
one option that leaves the change unfalsifiable.

### F-03 (High) — AT-06's two runs are not comparable

§5.4 AT-06: "`startWave: 1` with a valid record → identical logs and report row to the same run
with **no `implementation` section at all**."

A run with no `implementation` section has `testCommand: null` (`IMPLEMENTATION_DEFAULTS`,
`orchestrate-dev.js:169`), therefore `scriptGate === false`, therefore: the gate-degradation notice
is emitted (`:15196-15205`), the wave gate is the self-report scan rather than `_runCommand`, and
the Phase I report detail reads `self-report gate` instead of `script-owned gate` (`:15629`). The
two runs cannot have identical logs or an identical report row, and the record's own resume
behaviour is not what differs between them.

FSPEC AT-06 says "byte-identical in outcome to **having set nothing**" — i.e. not setting the
*key*. The shipped analog test does exactly that: it runs `CONFIG_WITH_TEST_COMMAND` (which carries
`testCommand` and no `startWave`) and asserts no banner and no mention of `implementation.startWave`
(`waveExecution.test.js:2146-2167`). The TSPEC has widened "the key" into "the section", and the
oracle is unsatisfiable as written.

**To resolve.** Restate AT-06 as: same config *with* `testCommand`, differing only in the presence
of `startWave: 1`; assert log-array equality between the two runs **and** the positive conjunct
that the record was honoured on both (the resume banner with `provenance: automatic` appears in
both, and `dispatchedTaskIds` is the resumed subset, not all three) — otherwise two equally-broken
runs also compare equal.

### F-04 (High) — the queue-parity test's falsifying condition is unstated

`orchestrate-queue.js:1240` declares `_runPipeline: runPipelineFn = realMain`. `_runPipeline` is an
injected seam, and every one of the nine references in `orchestrateQueue.test.js` supplies it — so
the repo has **no** precedent for a queue test that exercises real delegation, and the obvious way
to write `waveResumeQueueParity.test.js` is to inject a fake pipeline, which would assert parity
between a real run and a stub and pass under every mutation this feature could introduce. That is
DC-07's higher-level-fake failure verbatim.

§5.2 compounds it by asserting that this feature's new doubles are "limited to fixtures, not
machinery". A test that drives `orchestrate-queue`'s real `main()` needs queue-level machinery the
ledger harness does not have: a `QUEUE.md` fixture, a satisfied or configuration-disabled drift
gate (`distribution.checkEnabled`), and a Phase-0 readiness-triage agent double — the drift gate
refuses the whole invocation before `QUEUE.md` is read, so a parity test that does not address it
returns `blocked` and asserts nothing.

**To resolve.** State in §5.3/§5.4 that AT-16 (i) leaves `_runPipeline` at its default and asserts
that fact, (ii) enumerates the queue-side fixtures it needs by name, and (iii) carries a
falsification arm: a deliberately mutated resume point on one path must red the test. If real
delegation proves infeasible, say so and replace AT-16's oracle with one that is honest about what
it proves — but do not leave the seam unnamed.

## Questions

## Positive Observations

## Recommendation

## Verdict

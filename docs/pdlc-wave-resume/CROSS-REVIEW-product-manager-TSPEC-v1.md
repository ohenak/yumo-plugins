# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Every claim below about existing behaviour is verified against `origin/main` at
`345ae358`, because this branch is 1,637 commits behind it
(`git rev-list --count HEAD..origin/main` → 1637) and carries neither the mechanism nor
`docs/_constraints/pdlc-wave-gate-baseline.md`.

## Grounding Ledger

The TSPEC's §1.1 verification table is the substance of this review's first pass: I re-ran every
row rather than reading it. **V-1 through V-17 all hold**, by name, against `origin/main`:

| Row | Re-derivation | Result |
|---|---|---|
| V-1 | `WAVE_STATE_PATH = ".claude/pdlc-wave-state.json"`, `pdlc/workflows/orchestrate-dev.js` | holds |
| V-2 | `parseWaveLedger` doc comment enumerates three outcomes; `text == null`, `""` and `"{}"` all return `{state: null, reason: null}` | holds |
| V-3 | `computePlanHash` — FNV-1a `0x811c9dc5`/`0x01000193`, `padStart(8, "0")`, doc comment "Not a cryptographic digest" | holds |
| V-4 | `formatWaveLedger` — `{version: 1, feature, planHash, lastGreenWave}` plus `head` when non-blank | holds |
| V-5 | `const explicitPointer = startWave > 1;` sits **above** `if (startWave > waves.length)` | holds |
| V-6 | `if (!explicitPointer) {` wraps the whole read/decide chain | holds |
| V-7 | `headCorroborated`'s two early returns, commented "pre-`head` record: honoured as before" and "no transport to ask — not evidence of absence" | holds |
| V-8 | `if (waveGit) {` opens under "Only now — verified — does anything get committed (M-6)", and `writeWaveLedger(formatWaveLedger(...))` is its last statement | holds |
| V-9 | `writeWaveLedger`'s `try/catch` emits "Notice: could not … The run continues" | holds |
| V-10 | comment "The record is KEPT" above the `allWavesRecorded` report row | holds |
| V-11 | `startWave = waves.length + 1; ledgerResume = true; allWavesRecorded = true;` and the `recordPhase("I", "Implementation", "⏭", …)` arm | holds |
| V-12 | `to force a full run` in the mid-plan banner, and wrapped across a line break in the `Skipping Phase I (wave ledger` banner | holds |
| V-13 | `IMPLEMENTATION_DEFAULTS` — exactly `testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave` | holds |
| V-14 | `.gitignore` `/.claude/pdlc-wave-state.json`, under the anchoring-rationale comment block, beside `/.claude/workflows/` | holds |
| V-15 | `orchestrate-queue.js` imports `orchestrate-dev`'s default export as `realMain` and returns `pipelineReport` | holds |
| V-16 | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` in `waveExecution.test.js` | holds |
| V-17 | `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`, one `withDispatchRetry(() => agentFn("se-implement", propertiesTestPrompt(…)))`, `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); … }`, reached unconditionally after the wave loop | holds |

Every `M-WG-*` fact the TSPEC cites also holds at `pdlc-wave-gate-baseline.md` `Version | 1.2 ·
2026-08-20`: `M-WG-2` (post-wave command before the gate), `M-WG-5` (a wave halt writes no
POSTMORTEM), `M-WG-8`/`M-WG-9`/`M-WG-13`/`M-WG-14` (the transcribed set-equality discipline the
frozen catalogues of §3.1 are modelled on).

**Traceability sweep.** All ten REQ criteria (REQ-WVR-01..10) carry a component in §2.6, and all
eighteen FSPEC acceptance tests (AT-01..AT-18) carry an oracle in §5.4. No P0 or P1 criterion is
dropped, narrowed or reinterpreted, and no product decision is taken that belongs upstream — the
provenance vocabulary of D-2 is FSPEC BR-07's own two words, the report-row change of D-3 is
REQ-WVR-01's "and final report" clause, and §3.5 adds no configuration key, which is REQ OQ-1's
decision honoured. The findings below are all about the **oracles** the document commits to, not
about what it specifies.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §2.4's `⏭` report-row text breaks the shipped assertion the same paragraph claims it preserves | REQ-WVR-08, FSPEC AT-12/EC-09 |
| F-02 | Medium | Local | §5.4 AT-06's comparison baseline is unsatisfiable — removing the `implementation` section also removes `testCommand`, which changes the gate mode | REQ-WVR-04 boundary, FSPEC AT-06 |
| F-03 | Medium | Local | §5.4 AT-16's discriminating arm is not writable as designed: the queue delegates `{reqPath}` only and forwards no seams | REQ-WVR-07, FSPEC AT-16 |
| F-04 | Medium | Local | AT-02's IG-6 arm is absence-only, and IG-6 sits outside the set-equality catalogue, so REQ-WVR-02's six-cause closure is not closed at six | REQ-WVR-02 |
| F-05 | Medium | Local | §2.3 resolves the ancestry probe eagerly for every well-formed record; the shipped chain resolves it lazily. An unstated behavioural delta in a document whose delta table claims to be the feature's whole scope | REQ-WVR-06, REQ C-3 |
| F-06 | Medium | Local | §6.5 A-2 rests on an "existing `computePlanHash` unit block" that does not exist anywhere in the suite | REQ-WVR-01, G-1 |
| F-07 | Low | Process | §5.2 cites "DC-08's cite-and-reuse rule"; this repo's DC-08 is about successor surfaces, and the constraints file's own preamble flags exactly this cross-repo `DC-07/08/09` confusion | REQ §4 grounding |
| F-08 | Low | Local | Five FSPEC business rules (BR-04, BR-05, BR-12, BR-14, BR-16) are covered in substance but carry no id-level citation, so BR→component traceability is by inference | FSPEC §4 |
| F-09 | Low | Process | Inline `M-WG-*` citations omit the baseline `Version` the file's own control rule requires a consumer to cite it at; only §6.2 carries it | REQ OB-2, baseline §control rule |

### F-01 (Medium, Local) — the `⏭` row change is not additive, and one shipped assertion proves it

§2.4 specifies the skip row's detail as:

> `Skipped — all M waves previously committed and recorded green (wave ledger; provenance: automatic)`

and then states: *"The `⏭` row's existing text is preserved as a prefix so the shipped assertion on
`recorded green (wave ledger)` keeps passing; the change is additive."* RT-3 leans on the same
claim ("The `⏭` row keeps its current text as a prefix").

The claim is false. The shipped assertion is
`expect(row.detail).toContain("recorded green (wave ledger)")` —
`pdlc/workflows/__tests__/waveExecution.test.js`, in the ledger `describe`, on the complete-record
fixture — and it matches on the **closing parenthesis**. The proposed detail reads
`recorded green (wave ledger;`, which does not contain that substring. The banner suffixes really
are additive (the shipped banner assertions use `startsWith("Skipping Phase I (wave ledger")` and
`toContain("Delete … to force a full run.")`, both of which survive a trailing suffix); the report
row is the one place the pattern does not hold, and it is the place the document asserts it does.

*What to change:* either put the provenance token outside the existing parenthetical — e.g.
`… recorded green (wave ledger) — provenance: automatic` — which keeps the claim true literally, or
strike the "keeps passing" sentence from §2.4 and RT-3 and record the assertion update as an
in-scope edit. Please do not leave the document asserting a compatibility that a named test
refutes; RT-3's mitigation is what a wave author will trust when the test reds.

### F-02 (Medium, Local) — AT-06 compares against a baseline that cannot be identical

§5.4 AT-06's oracle: *"`startWave: 1` with a valid record → identical logs and report row to the
same run with no `implementation` section at all."*

FSPEC AT-06 asks for byte-identical outcome to **having set nothing for the pointer**. The TSPEC
widens that to removing the whole section, which also removes `testCommand`. The shipped gate mode
is `const scriptGate = Boolean(implConfig.testCommand) && typeof runCommandFn === "function";`
(`pdlc/workflows/orchestrate-dev.js`), so a run with no `implementation` section resolves
`scriptGate === false`: it emits the inapplicability notice naming the missing test command, runs
the self-report gate rather than the script-owned one, and lands a report row reading
`All M waves complete (wave mode, self-report gate)` instead of `script-owned gate`. Logs and
report row therefore differ for reasons that have nothing to do with `startWave`.

As written, the test either reds for the wrong reason or gets quietly weakened — and it is the only
oracle for a boundary the REQ added deliberately (REQ-WVR-04's "the manual point set to its
default", TE F-01).

*What to change:* state the baseline as *the same config with the `startWave` key omitted*
(`CONFIG_WITH_TEST_COMMAND` unchanged otherwise), so the only varying input is the one under test.

### F-03 (Medium, Local) — the queue-parity discriminator has no way to be discriminating

FSPEC AT-16's whole value is its discriminating arm: *"the record resolves against the same working
directory on both paths — a resume point differing between the two fails this test while AT-01..05
all still pass."* §5.3 homes it in a new `waveResumeQueueParity.test.js` running "direct run vs
`orchestrate-queue` delegation over the same feature, plan and record", and §5.2 states that "new
doubles are limited to fixtures, not machinery".

The delegation call is `report = await runPipelineFn({ reqPath: entry.reqPath });` in
`pdlc/workflows/orchestrate-queue.js` — `reqPath` and nothing else. No `_readFile`, `_writeFile`,
`_git` or `_runCommand` crosses the boundary, so a test cannot put a record in front of the
delegated pipeline through the queue's own wiring. The two available routes both dissolve the
oracle: injecting `_runPipeline` replaces `realMain` (so the queue's delegation is no longer under
test), or wrapping `realMain` with the seams supplies the working directory from the test itself —
at which point "same working directory on both paths" is true by construction of the double, which
is precisely the vacuous oracle §5.1 forbids.

Note this is a **verification** gap, not a product one: REQ-WVR-07 is satisfied structurally,
because the queue delegates in-process with no queue-specific configuration (§2.6, V-15). But
§5.4's stated contract is "no AT is left without a home", and AT-16's home does not exist yet.

*What to change:* name what the parity test can honestly assert — e.g. that the queue forwards
`{reqPath}` and no seam overrides, and that both paths request exactly `WAVE_STATE_PATH` from the
read seam, with the recorded path strings compared for equality — or add seam forwarding to §1.2's
delta table as in-scope work, so the discriminating arm becomes writable rather than asserted.

### F-04 (Medium, Local) — IG-6 is outside the closed set, and its only integration arm is absence-only

REQ-WVR-02 is explicit about the shape of its proof: *"PROPERTIES owes a **set-equality** check over
IG-1..6 rather than a containment check, so a deleted cause fails a test instead of passing one."*
The catalogue §3.1 freezes is `WAVE_IGNORE_REASONS`, seven codes covering IG-1a/b/c, IG-2, IG-3,
IG-4, IG-5 — IG-6 "is silent and carries no code". So the set-equality assertion of AT-02 ranges
over a set from which IG-6 is structurally absent, and deleting IG-6's behaviour (a silent absent
record starting to announce, or `{}` falling through to IG-1) cannot red it.

The compensating arm is *"one asserting IG-6 emits nothing matching `wave ledger`"* — an
absence-only oracle, and the document's own §5.1 rules it out: *"Wherever the FSPEC asks for a
skip, the assertion is a call count on a spy paired with a positive conjunct."* No positive
conjunct is stated for the IG-6 arm.

Partial cover exists — §5.3's unit row asserts `parseWaveLedger`'s three arms, which pins
absent/empty/`{}` to `{state: null, reason: null}` positively — but the document never says that
this is where IG-6's closure lives, so the six-cause closure REQ-WVR-02 demands is discharged
nowhere in particular.

*What to change:* (i) pair the IG-6 integration arm with its positive conjunct on the same path —
all M waves dispatched, from wave 1, outcome (a) resolved — so the assertion says what *does*
happen; and (ii) state in §5.4 that IG-6's membership in the closed six is carried by the
`parseWaveLedger` three-arm unit assertion, with the three no-record inputs transcribed as
literals, so the six-cause enumeration has a named home.

### F-05 (Medium, Local) — the extracted classifier resolves ancestry eagerly; the shipped chain does not

§1.2 closes with a list of what is *"explicitly not changed"*, including "the evaluation order of
the disregard causes", and the delta table above it is declared to be "the feature's scope". §2.3's
normative control flow then reads:

```
headOk := parsed.state ? await headCorroborated(parsed.state.head) : true
d      := classifyWaveLedger(parsed, {…, headOk})
```

The probe is resolved for **every** well-formed record, before the feature and plan-hash guards run.
The shipped chain resolves it lazily — `if (recorded.feature !== featureName) … else if
(recorded.planHash !== planHash) … else if (!(await headCorroborated(recorded.head)))` — so a record
naming a foreign feature, or a record written against a different plan, never causes a
`git merge-base --is-ancestor` call at all. Under §2.3 both now do.

The *outcome* order is preserved (§3.2's guard table is faithful, and the announced reason is
unchanged), so this is not a correctness defect. It is a behavioural delta — one extra git
subprocess invocation per rejected record, on records the shipped code rejects without asking git —
that is absent from §1.2's scope table, and RT-2's regression net will not catch it: the shipped
ancestry tests assert `expect(calls).toContainEqual([...])`, i.e. containment, which an extra call
cannot fail.

*What to change:* either keep the probe lazy (pass a thunk, or resolve ancestry after the cheap
guards and re-enter the classifier), or add a row to §1.2 stating the change and its cost, and give
AT-11 an arm asserting the git call list for a feature-mismatch record — otherwise "no new
capability, no new IO" (§3.4, REQ C-3) is narrower than the design in fact is.

### F-06 (Medium, Local) — A-2 cites a unit block that does not exist

§6.5 A-2: *"This is a property of the shipped parser, asserted by the existing `computePlanHash`
unit block."* There is no such block. Scanning every file under
`pdlc/workflows/__tests__/` on `origin/main` for `computePlanHash`, `parseWaveLedger` and
`formatWaveLedger` returns **zero** matches — which is also what makes D-5 correct that these
functions are reachable only through `main()`. The two statements cannot both be true, and D-5 is
the accurate one.

This matters beyond bookkeeping: A-2 is the assumption that `computePlanHash` answers "same plan?"
stably across invocations, and the failure mode it names — "IG-3 would fire on every re-invocation
and the feature would degrade to a full run" — is the silent, total loss of G-1's zero-action
resume. Marking it as already-asserted retires an assumption that nothing has falsified (DC-03).

*What to change:* restate A-2 as resting on the **new** unit coverage §5.3 introduces, and add the
determinism arm explicitly — the same PLAN text parsed and hashed twice yields the same 8 hex
digits — alongside the sensitivity arms §5.3 already names. (AT-01's two-run integration fixture
exercises this incidentally today; say so, rather than citing a block that is not there.)

### F-07 / F-08 / F-09 (Low)

- **F-07 (Process).** §5.2 attributes a "cite-and-reuse rule" to DC-08. This repo's DC-08 is
  *"An unresolved item needs a named successor surface, not prose intent"*, and no constraint in
  `docs/_constraints/DOMAIN-CONSTRAINTS.md` carries the phrase "cite-and-reuse". The file's own
  preamble names this trap: skill prompts citing `DC-07 / DC-08 / DC-09` point into a *different
  consuming repo's* constraint file. Tagged `Process`, not `Local`, because it is the recurring
  numbering collision the constraints file already tracks — cite the behaviour without the id, or
  cite the consuming repo explicitly. The engineering practice itself (reuse
  `readMergeConfigSafely` and the shipped harness rather than adding a second reader) is right and
  is called out below as a positive.
- **F-08 (Local).** §2.6 maps the ten REQ criteria to components, which is the load-bearing half.
  BR-04, BR-05, BR-12, BR-14 and BR-16 are each covered in substance (§3.5, §2.3, the fail-open
  posture of §3.4, §2.6's REQ-WVR-10 row, §2.6's REQ-WVR-07 row) but carry no id-level citation
  anywhere in the document, so a reader checking FSPEC §4 coverage has to reconstruct it. One
  BR→component column, or five ids added to §2.6's rows, closes it.
- **F-09 (Process).** `pdlc-wave-gate-baseline.md`'s control rule is that a consumer cites the file
  *at its `Version`*. §6.2's OB-F4 row does (`Version | 1.2 · 2026-08-20`); the inline citations in
  §1.3 (`M-WG-5`), §2.1 and RT-5 (`M-WG-2`), and §3.1 (`M-WG-8`/`9`/`13`/`14`) do not. All four
  facts check out at 1.2 today — this is about the citations staying checkable after the file moves.

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-WVR-01 asks the run log **and final report** to state the resume point and its provenance. §2.4's report table covers the two rows a run that *finishes* Phase I produces (`✅`, `⏭`). A resumed run that halts again — AT-18's middle run — produces neither, since both `recordPhase("I", …)` calls sit after the wave loop. Is the halt path's report deliberately out of scope (the run log still carries the banner), or is a resume-point statement owed on the halted report too? Either answer is fine; the document currently leaves it to inference. |
| Q-02 | §2.5's operator-pointer interaction is ratified as-is and routed upstream as an erratum — correctly, in my reading. One product consequence worth stating in the FSPEC clause you are asking for: after an operator-pointer run at wave N, the record claims waves 1..N complete on the operator's assertion rather than on any run having committed them, which is a different provenance of "completed" from BR-08's. It stays safe (the first executed wave's gate verifies the whole tree, so a missing predecessor reds rather than ships), but should the record carry that provenance, or is announcement-only sufficient? |
| Q-03 | DEC-WVR-06 replaces FSPEC AT-02's stated oracle form ("set equality over the **announced reasons**") with set equality over reason **codes**, plus a per-code integration assertion on the rendered sentence. I read that as at least as strong — the codes enumerate IG-1's three arms, which is the property AT-02 was protecting — but it is a substitution of an FSPEC-specified oracle form. Confirm with te-review that PROPERTIES is expected to transcribe codes, not sentences, so the two documents do not diverge at authoring time. |

## Positive Observations

- **The ratify-don't-reinvent posture is executed, not just declared.** §1.2's delta table names ten
  gaps and §1.2's closing paragraph freezes the path constant, field names, fingerprint, evaluation
  order, write site and retention. That is REQ BL-03 and R-4 discharged the way the REQ asked —
  R-4's "new code alongside" outcome is structurally unavailable to an implementer following this
  document.
- **§1.1's verification table is the right response to an unmet BL-04.** Seventeen claims, each
  citing an exported symbol, a comment string or a config key rather than a line number, each
  re-runnable from this tree with `git show origin/main:<path> | grep -n <symbol>`. I re-ran all
  seventeen and all seventeen hold. This is what makes a review of a branch 1,637 commits behind
  possible at all, and it is the pattern I would want repeated whenever an authoring tree lags.
- **§5.1 states the oracle rule the REQ demanded and then applies it.** "The oracle is an observed
  resume, never the presence of a code path" is REQ §1's own sentence, and §5.4's map honours it:
  every row is a dispatch count, an announced sentence, a report row or written bytes. AT-12's
  fourth conjunct (Phase PT dispatches exactly one agent and gates exactly once) is exactly the
  positive pairing a "zero dispatches" claim needs — please keep it.
- **§5.5's three named mutations are the most valuable half of the test strategy.** Each names the
  test that kills it and, more usefully, the tests that do *not* — "recording a run-relative wave
  number … killed only by AT-18; every single-halt test passes under it" is precisely the
  discrimination FSPEC AT-18 was written to buy.
- **§4.4 ("what is deliberately not modelled") reasons from product consequence, not preference.**
  Rejecting a per-wave set because "storing one would invite a reader that honours a non-prefix set
  and skips a wave whose predecessor never ran" ties a data-model decision straight to R-2's
  unrecoverable failure mode. Same for rejecting timestamps against G-4's reader-proves-staleness.
- **The erratum discipline is right.** Four upstream defects (§6.3) are raised rather than silently
  patched, including the one against the REQ that the TSPEC itself depends on. I independently
  confirmed all four (see the trailer of this review); raising rather than editing is the correct
  handling and it kept this document honest about §2.5's unspecified interaction.
- **No scope creep.** Every behavioural addition traces upstream: the provenance token to FSPEC
  BR-07's own vocabulary, the report-row detail to REQ-WVR-01's "and final report", the frozen
  catalogues to OB-F5, the classifier extraction to the impossibility of an honest AT-02/AT-13
  oracle. Nothing here is a product decision taken in an engineering artifact, and §3.5 explicitly
  declines to add the config key REQ OQ-1 rejected.

## Recommendation

**Approved with minor changes**

No P0 or P1 requirement is omitted, narrowed or reinterpreted; all ten REQ criteria and all
eighteen FSPEC acceptance tests carry a home, and the document takes no product decision that
belongs upstream. The six Medium findings are all about oracle quality and grounding accuracy —
three tests that cannot pass or cannot discriminate as written (F-01, F-02, F-03), one closure that
is not closed over its full enumeration (F-04), one unstated behavioural delta (F-05), and one
citation to a test block that does not exist (F-06). None blocks the phase; each should be closed
before PROPERTIES authoring, since te-author will otherwise transcribe the unworkable oracles
verbatim.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 6, "low": 3}

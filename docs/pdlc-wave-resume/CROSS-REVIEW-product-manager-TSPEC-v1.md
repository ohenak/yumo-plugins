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

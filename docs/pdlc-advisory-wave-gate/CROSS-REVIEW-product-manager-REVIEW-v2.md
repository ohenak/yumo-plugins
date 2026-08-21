# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the `feat-pdlc-advisory-wave-gate` implementation, delta `616dc0b8` → `e30f90bc` (`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs`, `pdlc/workflows/__tests__/{advisoryEnvelope,advisoryWaveGateMain,waveExecution}.test.js`), against `REQ-pdlc-advisory-wave-gate.md` and `FSPEC-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-21
**Iteration:** 2

## Scope and Method

**Delta re-review, per the protocol.** v1 was written against `616dc0b8`; exactly one commit has
touched code since, `e30f90bc` ("fix(advisory): wire AC-6.3's warning to the halt report and default
the seam clock"), +215/−10 across five files. I re-read my own v1 (five findings: F-01, F-02 High;
F-03, F-04 Medium; F-05 Low), diffed `616dc0b8..e30f90bc`, and scanned only what that diff changed.
Sections of the branch I approved in v1 — the A6 seam, snapshot/restore pair, envelope, record and
escalation carriers, the `.gitignore` boundary case, PROP-REST-10's interleaving oracle — are not
re-litigated here.

**One production behaviour changed, and it is a real fix, not a test-only edit.**
`runWaveGateSeam` now defaults its clock (`orchestrate-dev.js:3412`, `_now = () => Date.now()`),
matching `runAdvisorySeam`. `main` carries no default for `_now`, so on the capture-failure branch —
which calls `appendAdvisoryEntry` / `appendEscalationEntry` directly, both of which invoke `_now()`
unguarded — E-34's ADVISORY record and its `ESCALATIONS.md` entry were being replaced by two "write
failed" notices on every real run. That is an AC-6.4 countability defect (a class that never reaches
the durable carrier is not countable) that no seam-level test could see, because every seam unit
test injects a clock. It was found by the new report-surface arm the round added, which is the
strongest available evidence that the round's fixes are the right shape.

**What I verified in this window, mechanically.**

1. **Every fix falsified by mutation, not read for plausibility.** Three mutations, each reverted:
   - Severing `_notice: advisoryNotice` at the wave-loop A6 call site (`orchestrate-dev.js:15463`) →
     `advisoryWaveGateMain.test.js`'s real-seam escalation case goes RED (`1 failed, 10 passed`).
     This is precisely the mutation that left the whole suite green in v1.
   - Reversing `ADVISORY_ROOT_CAUSES` (`orchestrate-dev.js:1956-1961`) → the new ordered
     deep-equal goes RED (`1 failed, 49 passed`), and the sorted set check stays green, so a
     *renamed* member still fails distinctly from a *reordered* one, as F-02 asked.
   - Removing the new `_now` default → AT-06-4b's report arm goes RED on the
     `write failed for seam A6` conjunct.
2. **Delivery hygiene.** `node build-runtime.mjs --check` → `in-sync pdlc/workflows/dist/pdlc-cli.mjs`;
   `dist/pdlc-cli.mjs` carries both new production changes (`ADVISORY_ROOT_CAUSE_MEANINGS` present,
   `_now = () => Date.now()` at the seam). Targeted suites green: 159/159 across the three edited
   test files.
3. **AC-2.2's Meaning column transcribed, not paraphrased.** Compared
   `ADVISORY_ROOT_CAUSE_MEANINGS` (`orchestrate-dev.js:1967-1976`) row-by-row against REQ
   §AC-2.2's table (`REQ-pdlc-advisory-wave-gate.md:360-363`): all four meanings match verbatim
   (only markdown emphasis on "later" is flattened to `LATER`).
4. **Project-level context re-read** — `docs/_constraints/DOMAIN-CONSTRAINTS.md` and
   `docs/_decisions/DECISIONS-*.md`. No standing constraint is violated by this delta; DC-07's
   builder-not-wired rule is what F-01 asked for and what the round now satisfies.

## Prior Findings — Disposition

Full suite at `e30f90bc`: **102 suites, 4162 passed, 70 skipped, 0 failed** (up 3 from v1's 4159 —
the ordered catalogue assertion, the AC-2.2 prompt oracle, and AT-06-4b's report arm).

| v1 ID | Severity | Status | Evidence |
|-------|----------|--------|----------|
| F-01 | High | **Resolved** | `advisoryWaveGateMain.test.js:411-413` now reads the served artifact: `result.notices.find((n) => n.includes("refs/pdlc/a6-snapshot-1"))`, then asserts `/overwrites that capture/i` on **that same element**. Driven by `mainDev` through the real seam (`runPipeline`, `:162-176`), so it traverses `_notice: advisoryNotice` at `orchestrate-dev.js:15463`. Mutation-confirmed RED when that argument is severed. |
| F-02 | High | **Resolved** | `advisoryEnvelope.test.js:334-346` adds the ordered deep-equal beside the retained sorted set check, transcribed from REQ AC-2.2's table order (`REQ:360-363`). Mutation-confirmed: reversing the catalogue reds this case only. |
| F-03 | Medium | **Resolved** | `waveExecution.test.js:952-958` widens `NO_HALT_FIELDS` to the five-key production sentinel including `snapshotRef: null`, matching `orchestrate-dev.js:3417-3423`, with the DC-03 rationale stated in place. |
| F-04 | Medium | **Resolved** | The dispatch prompt now renders AC-2.2's Meaning column and the first-match rule from a frozen `ADVISORY_ROOT_CAUSE_MEANINGS` (`orchestrate-dev.js:1967-1976`), walked in catalogue order (`:3160-3162`), with an oracle over the **real dispatched prompt** (`advisoryWaveGateMain.test.js:425-448`) that asserts the four meanings as spec-side literals and that their offsets are strictly increasing. |
| F-05 | Low | **Resolved** | `snapshotRef` documented on the seam's `@returns` with both null-returning cases named (`orchestrate-dev.js:3380-3382`). |

**Did the revision break anything?** No. Three checks:

- The new production code paths are both wired and executed: `ADVISORY_ROOT_CAUSE_MEANINGS` has a
  production consumer at `orchestrate-dev.js:3160` (not dead config), and the `_now` default sits on
  the seam every production A6 call goes through. Neither is test-only.
- The `_now` default is strictly widening — callers that pass a clock are unaffected (every seam
  unit test still injects one and all 4162 tests pass), and callers that passed `undefined` (i.e.
  `main`) move from *throwing inside `appendAdvisoryEntry`* to *recording*. No AC is narrowed.
- The tightened `/overwrites that capture/i` predicate at `waveExecution.test.js:1346-1352`
  strengthens the positive arm — the inverted sentence "never overwrites that capture" no longer
  satisfies it — while the paired negative arm keeps the broader `/overwrit/i` stem
  (`waveExecution.test.js:1366`), which is the correct asymmetry: a broad stem is right where
  absence is asserted and wrong where presence is.

## Findings

All five v1 findings are resolved and mutation-confirmed. Two new Low findings, both about the new
constant this round introduced; neither is gating.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-06 | Low | Local | `ADVISORY_ROOT_CAUSE_MEANINGS` is `export`ed (`orchestrate-dev.js:1967`) although no call site outside the module reads it — its only consumer is the prompt builder two thousand lines below in the same file (`:3160`), and the oracle deliberately does **not** import it (`advisoryWaveGateMain.test.js:438-439`, "not read back off `ADVISORY_ROOT_CAUSE_MEANINGS`, which would make the assertion unfalsifiable"). TSPEC §3.1 states the project's own rule for exactly this case, for `ADVISORY_SEAM_PHASES`: *"Exporting it would be a widening this feature has no use for: no call site outside the module reads it, and the only reason to export would be to let a unit test import the constant — which is the oracle shape §5.6 and PROPERTIES both reject."* The fix is one keyword: drop `export`, keeping the `Object.freeze`. The behavioural oracle is unaffected, since it reads the dispatched prompt. | REQ-AWG-02 AC-2.2 |
| F-07 | Low | Local | The new catalogue has no frozen-ness oracle, unlike all three of its siblings (`advisoryEnvelope.test.js:349-351` asserts `Object.isFrozen(devModule.ADVISORY_ROOT_CAUSES)`; `ADVISORY_REFUSAL_REASONS` and `ADVISORY_EXCLUSIONS` carry the same). `ADVISORY_ROOT_CAUSE_MEANINGS` is written `Object.freeze({...})` at `orchestrate-dev.js:1967`, but nothing fails if a later edit drops that call, and this object is what the operator-facing class definitions are rendered from. Its *key set* is already covered — a missing key renders `undefined` into the prompt and reds the four literal assertions at `advisoryWaveGateMain.test.js:439-442` — so this is the mutability half only. If F-06 is taken, the natural home is a one-line `Object.isFrozen` conjunct in the prompt describe block; if the export stays, the sibling shape in `advisoryEnvelope.test.js` applies unchanged. | REQ-AWG-02 AC-2.2 |

### Why neither is more than Low

Both concern the *shape of a new internal constant*, not whether any acceptance criterion reaches
the operator. AC-2.2's product claim — that the class an operator later counts (AC-6.4) was asked
for against a stated definition, in the stated order — is now proven on the real dispatched prompt
by an oracle that transcribes the REQ's own Meaning column and asserts the four offsets are strictly
increasing (`advisoryWaveGateMain.test.js:425-448`). That is the assertion F-04 asked for, and it is
falsifiable in both the content and the ordering direction. F-06 and F-07 are hygiene on the
constant behind it, worth folding into any later touch of this file rather than a round of their
own.

### Upstream drift (routed as errata, not counted here)

Two facts about the shipped module are now true and unstated in TSPEC. Per the reviewer protocol I
do not edit that document and do not fold these into this verdict; they are emitted as `ERRATUM:`
lines for its author:

- TSPEC §3.1's export block (`TSPEC:805-816`) enumerates the module's exported catalogues and does
  not mention `ADVISORY_ROOT_CAUSE_MEANINGS`, which this round added and exported. Whichever way
  F-06 goes, §3.1 should say so — the same section already documents `ADVISORY_SEAM_PHASES`'s
  private-by-construction status precisely so the export list can be read as complete.
- TSPEC §3.2's `runWaveGateSeam` signature (`TSPEC:855-869`) lists `_now` as an ordinary injected
  dependency. It now carries a default (`orchestrate-dev.js:3412`), and that default is
  load-bearing rather than cosmetic: `main` supplies no clock, and E-34's branch calls
  `appendAdvisoryEntry` / `appendEscalationEntry` directly, so without it AC-6.2's escalation entry
  and AC-6.1's record never reach disk on a real run.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The prompt now states each class's *meaning* and the first-match rule, but not what each class *authorises* — TSPEC §4.2's binding table (`plan-ordering-defect` → E-6, `wave-internal-defect` → E-5, the other two diagnosis-only). The refusal path is total on the receiving side either way, so this is not a finding; but is withholding the consequence deliberate — so the agent classifies on evidence rather than on the action it would prefer to be allowed? If so, that is worth one sentence in TSPEC §4.2, because the next reader of `buildA6SeamOps` will otherwise be tempted to "complete" the prompt. |
| Q-02 | The `_now` default fixes E-34's durable trace on real runs. Was that path ever exercised in a real pipeline run before this round — i.e. is there a shipped feature whose `ESCALATIONS.md` is missing an A6 capture-failure entry it should have? If the tier has only ever run with an injected clock, the answer is no and nothing needs backfilling; if not, the harvest phase may want to know. |
| Q-03 | v1's Q-03 stands, unanswered and still not blocking: the suite reports 70 skipped tests run-wide (`102 suites, 4162 passed, 70 skipped`). None belong to this feature — it ships no `.skip` — but is that standing figure tracked anywhere an operator would see it drift? |

## Positive Observations

- **F-01's fix landed in the exact shape DC-07 asks for, and the round proved it rather than
  asserting it.** The new oracle selects the single `result.notices` element carrying the ref and
  asserts the overwrite phrase on *that same element* (`advisoryWaveGateMain.test.js:411-413`), so
  splitting the two halves across two notices fails. I re-ran the mutation myself: replacing
  `_notice: advisoryNotice` at `orchestrate-dev.js:15463` with `() => {}` turns the case RED and
  nothing else in the file. The commit message states the same mutation was run before the fix
  shipped — that is the standard of evidence I want to see on a wiring finding.
- **The round found a shipped production defect by fixing a test-shape finding, and fixed the
  defect rather than the symptom.** TE F-02's report-surface companion for E-34 surfaced that
  `main` passes no clock and both `append*` calls on the capture-failure branch invoke `_now()`
  unguarded, so AC-6.1's record and AC-6.2's escalation entry were being replaced by two "write
  failed" notices on every real run. The fix defaults the clock at the seam (`orchestrate-dev.js:3412`),
  matching `runAdvisorySeam`, and the comment at the parameter names the failure it prevents and why
  no unit test could see it. That is a genuine product save: AC-6.4's countability rests on entries
  that were not being written.
- **The predicate tightening respects the asymmetry between presence and absence oracles.** The
  positive arms moved from `/overwrit/i` to `/overwrites that capture/i` — the inverted sentence
  "never overwrites that capture" no longer passes — while the negative arms deliberately keep the
  broad stem (`waveExecution.test.js:1366`, `advisoryWaveGateMain.test.js:495`), so a warning
  phrased any other way still fails an absence claim. Getting that direction backwards is the common
  error; this round got it right in both places and said why in the comment.
- **AC-2.2's Meaning column is transcribed, not paraphrased, and the ordering claim is falsifiable
  in the right direction.** All four meanings match `REQ:360-363` verbatim; the prompt oracle asserts
  the classes' offsets are strictly increasing rather than merely present; and the catalogue's own
  ordered deep-equal now sits *beside* the sorted set check, so a rename and a reorder fail
  distinctly (mutation-confirmed).
- **Every new negative assertion is paired.** AT-06-4b asserts no ref and no overwrite notice
  anywhere in `result.notices`, and then asserts what *does* happen on that same path — one A6
  invocation escalated (`advisory.rows`), both durable artifacts created through the real transports,
  the five-key `haltAdvisory` set-equal to a spec-side literal, and zero dispatches. No absence-only
  oracle was added this round.

## Recommendation

**Approved with minor changes**

Both v1 High findings are closed, each mutation-confirmed by me rather than taken on report:
severing the wave-loop `_notice` wiring now reds `advisoryWaveGateMain`'s real-seam escalation case,
and reversing `ADVISORY_ROOT_CAUSES` now reds the ordered deep-equal. The three Medium/Low findings
are closed too, and the round additionally caught and fixed a shipped production defect — the
undefaulted seam clock that was silently swallowing AC-6.1's record and AC-6.2's escalation entry on
every real run. Nothing in the delta narrows, reinterprets or drops an acceptance criterion; the
suite is 4162 green with `dist/pdlc-cli.mjs` regenerated and `build-runtime.mjs --check` in-sync.

Two Low findings remain, neither gating and both one-line edits worth folding into any later touch
of `orchestrate-dev.js`:

1. **F-06** — drop `export` from `ADVISORY_ROOT_CAUSE_MEANINGS` (`orchestrate-dev.js:1967`); no
   out-of-module caller reads it and TSPEC §3.1 states the rule for exactly this case.
2. **F-07** — add the sibling `Object.isFrozen` conjunct for the new catalogue.

Separately, two upstream TSPEC statements are now out of date and are routed as errata rather than
counted against this document: §3.1's export list and §3.2's `_now` parameter.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

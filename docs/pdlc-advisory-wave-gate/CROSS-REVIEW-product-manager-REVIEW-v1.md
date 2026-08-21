# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the `feat-pdlc-advisory-wave-gate` implementation diff against `main` (`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs`, `pdlc/workflows/__tests__/**`), read against `REQ-pdlc-advisory-wave-gate.md` and `FSPEC-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-21
**Iteration:** 1

## Scope and Method

**What the diff actually is.** `git merge-base main HEAD` is `9cf4805`, and the branch's production
footprint against it is small: `pdlc/workflows/orchestrate-dev.js` (+56/-1), its regenerated
`dist/pdlc-cli.mjs`, `package.json`'s engine bump to `^0.2.2`, and ~500 lines of test change across
eight `__tests__` files. Only two of the 488 branch commits touch the production module —
`6593b633` (A6-21) and `16a478ae` (the `snapshotRef` wiring). Everything else in A6 — the seam, the
snapshot/restore pair, the envelope, the record and escalation carriers — was already at the merge
base, so this round's product surface is: **FSPEC BR-14 / REQ AC-6.3's co-located overwrite
warning**, plus the test-only tasks A6-08 (AC-2.2's two-class arm), A6-10 (AC-5.1's `.gitignore`
boundary) and the PROP-REST-10 ordering case.

**What I verified, and how.**

1. Read the full production diff and walked each AC it claims to serve back through the shipped call
   chain: `runWaveGateSeam` (`orchestrate-dev.js:3361`) → `_notice` (`:3383`) → the run's one sink
   `const advisoryNotice = (line) => notices.push(line)` (`:14676`) → the wave-loop wiring
   `_notice: advisoryNotice` (`:15432`) → the halt-path `buildFinalReport({ … notices, … })`
   (`:16119`) → `...(haltAdvisory ? { haltAdvisory } : {})` (`:16303`).
2. For every AC that claims an **operator-visible artifact** contains something, I looked for a test
   that drives the *production assembler* (`main` / `mainDev`), not the builder alone. That sweep is
   what F-01 records.
3. Ran the suites: `cd pdlc/workflows && npm test` → **102 suites, 4159 passed, 70 skipped, exit 0**;
   `node pdlc/workflows/build-runtime.mjs --check` → `in-sync pdlc/workflows/dist/pdlc-cli.mjs`,
   exit 0 (PLAN DoD line 622 satisfied).
4. Read `docs/_constraints/DOMAIN-CONSTRAINTS.md` and `docs/_decisions/DECISIONS-*.md`, and the prior
   `CROSS-REVIEW-*` rounds for this feature, before tagging severities — F-02 below is reconciled
   against the software-engineer's still-open FSPEC v2 F-01 rather than re-tagged independently.

Citations are `file:line` only where the position **is** the evidence (a shipped call site, a
shipped oracle); everything else is cited by symbol, spec id or verbatim quote per DEC-DOC-01.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | BR-14's **seam arm** is never observed on the production halt report. The seam pushes the notice at `orchestrate-dev.js:3579-3581`, the wiring that carries it to the operator is `_notice: advisoryNotice` (`:15432`) → `notices.push` (`:14676`) → the halt-path `buildFinalReport({ … notices … })` (`:16119`). No test asserts any element of that report's `notices` on a run that drives the real seam. Delete `_notice: advisoryNotice` at `:15432` and the whole 4 159-test suite stays green while AC-6.3's warning silently stops reaching the operator. | REQ-AWG-06 AC-6.3 |
| F-02 | High | Local | `ADVISORY_ROOT_CAUSES` is still asserted by **sorted set-equality** (`advisoryEnvelope.test.js:329-330`), so AC-2.2's *ordered* "first matching class winning" semantics has no oracle at all. PLAN §DoD leg 3 requires ordered-sequence equality for this catalogue by name, and PLAN changelog v1.11 records it as PM F-01 (High). Both sibling catalogues already comply. | REQ-AWG-02 AC-2.2 (P0) |
| F-03 | Medium | Local | `NO_HALT_FIELDS` (`waveExecution.test.js:947-952`) is an ad-hoc four-key stand-in for the five-key production sentinel `noHaltFields` (`orchestrate-dev.js:3385-3391`); the A6 fake at the wave-loop call site therefore returns a shape production never returns. | REQ-AWG-06 AC-6.3 |
| F-04 | Medium | Local | The A6 dispatch prompt hands the agent four bare class labels — `` `Classify with a trailer line ROOT-CAUSE: one of ${ADVISORY_ROOT_CAUSES.join(", ")}.` `` (`orchestrate-dev.js:3144`) — with neither AC-2.2's Meaning column nor its first-match rule. The classification AC-6.4 makes countable is produced with no statement of what the classes mean. | REQ-AWG-02 AC-2.2, REQ-AWG-06 AC-6.4 |
| F-05 | Low | Local | `runWaveGateSeam`'s JSDoc `@returns` (`orchestrate-dev.js:3358`) still documents the four-key `haltFields` shape; `snapshotRef` is missing from the one place a reader looks for the seam's contract. | REQ-AWG-06 AC-6.3 |

### F-01 — the co-located warning is proven at the seam, never on the report

AC-6.3's observable is the **halt report**: *"the halt report carries the diagnosis and the
root-cause class … Where the halt report points the operator at a captured pre-A6 tree state, it
also warns, in the same place …"*. FSPEC BR-14 sharpens it: *"Co-location is the observable — a
pointer in the halt report and the warning in a runbook does not satisfy it."* TSPEC §4.5 names the
carrier and, crucially, the wiring claim: the notice is pushed *"through the sink the tier already
owns — `const advisoryNotice = (line) => notices.push(line)` … and that same `notices` array is
spread onto the **halt** report, not only the success one"*.

Walking AC → production caller → served artifact for each of the three arms:

| Arm | Production push site | Test that drives the production assembler | Verdict |
|---|---|---|---|
| Ordinary A6 escalation (BR-14's primary arm) | seam, `orchestrate-dev.js:3579-3581` | **none** | gap |
| E-34 capture failure (negative arm) | none, by design | seam-level only (`advisoryWaveGate.test.js:1926`) | acceptable — nothing to assemble |
| Post-gate un-skip halt | wave loop, `orchestrate-dev.js:15485` | `waveExecution.test.js:1340-1342`, driving `main` and reading `result.notices` | wired and proven |

Every assertion on the primary arm reads a **test-owned sink** rather than the report:
`advisoryWaveGate.test.js:1834-1836` and `:1853-1855` (PROP-REC-08) pass `_notice: (m) => notices1.push(m)`
straight into `runWaveGateSeam`; `advisoryEscalationLog.test.js:827` reads `runA6Escalation`'s local
`notices` array (helper at `:633-665`), not a report. The one test that reaches the real seam from
`mainDev` and halts — `advisoryWaveGateMain.test.js:347-388` — asserts `result.haltAdvisory`'s five
keys and never touches `result.notices`. So the run that *does* exercise `:15432` makes no claim
about its effect.

This is the DC-14 pattern whose origin line is literally *"`pdlc-advisory-tier` (§4 —
`refusalReasonFor`'s precedence had zero production callers)"*: a helper proven pure and a seam
proven to push, with nothing asserting the two ever meet the artifact the operator reads. The repo
already has the proof shape for a sibling seam — `advisoryDodSeams.test.js:1185` asserts
`result.notices.some((n) => /^ADVISORY ESCALATION: seam A3 for test-feat/.test(n))` on a report — so
this is a one-assertion gap, not a design problem.

**What must change.** In `advisoryWaveGateMain.test.js`'s escalation case (the real-seam `mainDev`
halt), add the same co-location oracle the un-skip arm already uses, on `result.notices`: pick the
single element containing `"refs/pdlc/a6-snapshot-" + waveNum` and assert `/overwrit/i` **on that
same element**, both halves spec-side literals. The fixture already establishes the ref is
`refs/pdlc/a6-snapshot-1` (its own `haltAdvisory` oracle asserts exactly that), so no new fixture
and no new double is needed.

### F-02 — AC-2.2's ordering is a P0 semantic with no oracle

AC-2.2 defines the classification as a *"closed, **ordered** set, the first matching class winning
so a failure matching two still has one class"*, and the order decides product-visible authority: a
failure classified `plan-ordering-defect` may be repaired through E-6 (promoting a later task's
symbol), while `wave-internal-defect` routes to E-5 (the wave's own owned set). The shipped oracle
sorts both sides:

```js
expect([...devModule.ADVISORY_ROOT_CAUSES].sort()).toEqual(
  ["environmental", "plan-ordering-defect", "unclassified", "wave-internal-defect"].sort()
);
```

Reversing the catalogue in source leaves that assertion green. The order is not inert in
production — it is rendered into the agent's prompt verbatim by
`ADVISORY_ROOT_CAUSES.join(", ")` (`orchestrate-dev.js:3144`) — so a reordering changes what the
model is shown, with no test to catch it.

Both sibling catalogues already carry the ordered assertion, which is what makes this an omission
rather than a house-style question: `ADVISORY_REFUSAL_REASONS` deep-equals its ordered literal
(`advisoryEnvelope.test.js:260`), and `ADVISORY_EXCLUSIONS` carries **both** the set check and a
separate ordered check with the reason stated in place (`:288` and `:292`, *"order is observable and
load-bearing"*). PLAN §DoD leg 3 names all three together and requires ordered-sequence equality for
each; PLAN changelog v1.11 records this as an accepted High from an earlier round. It was not
landed: `advisoryEnvelope.test.js` does not appear in this branch's diff at all.

**What must change.** Add the ordered conjunct beside the existing set check, in `ADVISORY_EXCLUSIONS`'s
shape — `expect(devModule.ADVISORY_ROOT_CAUSES).toEqual(["plan-ordering-defect", "wave-internal-defect",
"environmental", "unclassified"])`, transcribed from REQ AC-2.2's table, with the set check kept so a
*renamed* member still fails distinctly from a *reordered* one.

### F-03 — the call-site A6 double no longer matches the contract it stands in for

`orchestrate-dev.js:3385-3391` is the disabled-tier sentinel and now carries five keys, `snapshotRef:
null` among them. The wave-loop suite's own stand-in was not widened with it
(`waveExecution.test.js:947-952`, four keys), so every case using `makeA6Fake({ haltFields:
NO_HALT_FIELDS })` exercises the call site against a return shape the seam can no longer produce.

Nothing false-greens **today** — both users pass `disposition: null`, so `haltFields` never reaches
`haltError` — but this is exactly DC-03's recorded corollary: *"A test double for a gate is
canonical, never ad-hoc. A per-test stub silently diverges from the real component's return protocol
and produces false passes."* The next case that gives that fake a non-null disposition would assert
a four-key `haltAdvisory` against a five-key production reality. Widen the literal to five keys
(`snapshotRef: null`), matching `advisoryWaveGate.test.js:1067-1075`'s already-widened sentinel
equality.

### F-04 — the class the operator counts is requested without its definitions

AC-2.2 gives each class a Meaning, and AC-6.4 rests the feature's durable signal on the class being
right (*"a recurring wave-ordering defect becomes a visible signal rather than a repeated
surprise"*). The receiving side is faithful and total — `parseA6RootCause`
(`orchestrate-dev.js:2378-2391`) accepts only catalogue members and defaults to `unclassified` — but
the *emitting* side is asked for a class with no definitions and no first-match instruction:
`orchestrate-dev.js:3140-3148` sends the four labels joined by `", "`, one E-6-specific sentence,
and nothing else. The Meaning column appears nowhere in `orchestrate-dev.js` (`grep
plan-ordering-defect` returns the catalogue member, that one prompt line, and two comments).

This is the shipped state at the merge base, not something this branch changed, and the
software-engineer reviewer already carries the document-altitude half of it as an open Medium
(`CROSS-REVIEW-software-engineer-FSPEC-v2` F-01, *"BR-2's first-match rule needs a classifier to be
falsifiable"*, still open per v3). I tag it Medium to reconcile with that rather than inflate: the
concrete change is to render AC-2.2's table — class, meaning, and the first-match sentence — into
the prompt from the same frozen catalogue, so the classification an operator later counts was asked
for against a stated definition.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `haltAdvisory.snapshotRef` now rides the report as a bare pointer with no warning beside it (`orchestrate-dev.js:16303` spreads it; nothing renders it). BR-14's co-location clause is satisfied by the `notices` entry, and TSPEC §4.5 answers the design question directly (*"Why a field and not a prose string in `diagnosis`"*), so I am not filing this — but is the field intended to stay machine-only, or will an operator-facing renderer eventually print `haltAdvisory` and need the warning carried alongside it there too? |
| Q-02 | A wave A6 **resolves** leaves `refs/pdlc/a6-snapshot-{waveNum}` live and deliberately emits no warning (`orchestrate-dev.js:3577-3581`, *"Never pushed on a resolution — there is nothing to warn about re-running yet"*). If that run later halts for a reason other than the un-skip guard — a wave commit failure, or a halt in a subsequent phase — the capture is live, the report points at nothing, and the next re-run overwrites it silently. AC-6.3 conditions the warning on the report *pointing* at a capture, so the shipped behaviour is compliant as written. Is that the intended product read, or is the resolved-then-halted-elsewhere case worth an explicit line in the REQ's honest-limits language? |
| Q-03 | 70 tests are reported skipped by the full suite (`102 suites, 4159 passed, 70 skipped`). I confirmed none of them are A6's — this feature ships no `.skip` and its one former `test.todo` was converted to a live case this round — but is the standing 70 tracked anywhere an operator would see it? |

## Positive Observations

- **The un-skip arm is exactly the proof shape F-01 asks for elsewhere.** `waveExecution.test.js:1305-1343`
  drives the production `main`, halts on the un-skip guard, and reads the co-location oracle off
  `result.notices` — the served artifact, not a builder's sink — with its paired negative
  immediately below (`:1345-1357`) asserting `a6.calls.length === 0`, the halt outcome, `haltAdvisory`
  undefined **and** no `/overwrit/i` element. That negative is what stops an unconditional push from
  passing, and PLAN's DoD leg names precisely that hazard.
- **The anti-echo discipline held everywhere I checked.** Every new expectation transcribes its
  value spec-side rather than reading it back from the module under test — the ref transcribed as a
  literal at `advisoryWaveGateMain.test.js:382` and composed from the fixture's own wave number at
  `waveExecution.test.js:1313`, `/overwrit/i`
  as the weakest discriminating stem rather than `toContain(devModule.SOME_WARNING)`, and Oracle G's
  diagnosis sentence transcribed verbatim (`advisoryWaveGate.test.js:1891-1897`). Given DC-14's
  origin — a garbled catalogue that left a ~2 930-test suite green — this is the discipline that
  matters most, and it is visibly applied.
- **The `.gitignore` boundary case was upgraded honestly rather than ticked.** The former
  `test.todo` marker is gone and the case is live (`advisoryWaveGate.test.js:527-572`), and it does
  not rest on the hash map alone: `hashDomain` is introduced with a written rationale for why the
  filesystem-blind `hashTree` is the wrong oracle here, and the case adds the two positive-presence
  conjuncts (`output.txt` content unchanged, `new-output.txt` still present) that actually falsify a
  `-fdx`-shaped implementation. That is DC-14's absence-only rule applied without being asked twice.
- **PROP-REST-10 asserts the ordering, not merely the outcome.** `advisoryWaveGate.test.js:3924-3990`
  merges the git transport's call log and the `_appendFile` log into one order-preserving timeline
  and asserts every append lands strictly after restoration's terminal `reset --mixed` — the exact
  observation point AC-5.1 pins, proven rather than reasoned about.
- **The delivery hygiene the plugin's own rules turn on is intact.** `build-runtime.mjs --check`
  reports `in-sync pdlc/workflows/dist/pdlc-cli.mjs` and the regenerated `dist/pdlc-cli.mjs` is
  committed in the same window as the source change; the full suite is green at 4 159 passing.

## Recommendation

**Needs revision**

Two High findings, both narrow and both with a named one-file fix:

1. **F-01** — add the report-surface co-location assertion to `advisoryWaveGateMain.test.js`'s
   real-seam escalation case, so BR-14's primary arm is observed on `result.notices` and not only on
   a test-owned sink. Until it exists, deleting `_notice: advisoryNotice` at `orchestrate-dev.js:15432`
   leaves the suite green and AC-6.3 unmet.
2. **F-02** — add the ordered-sequence assertion for `ADVISORY_ROOT_CAUSES` beside the existing
   sorted set check (`advisoryEnvelope.test.js:327-333`), in the shape `ADVISORY_EXCLUSIONS` already
   uses, so P0 AC-2.2's first-match ordering has an oracle and PLAN's DoD leg 3 becomes tickable.

F-03 (widen `NO_HALT_FIELDS` to the five-key shape) and F-05 (the JSDoc `@returns`) are one-line
edits worth folding into the same pass. F-04 is recorded for the product decision it names and is
not a blocker for this round.

Everything else I checked in this window is faithful to the requirements: BR-14's three arms are
each pushed from the correct site, E-34's `null` correctly suppresses both the pointer and the
warning, the five-key halt-field widening reached every set-equality surface TSPEC §5.1 enumerated,
and no scope beyond the approved documents appears in the diff.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 2, "low": 1}

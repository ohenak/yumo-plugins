# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/ (full feature diff `main...feat-pdlc-advisory-wave-gate`)
**Date:** 2026-08-21
**Iteration:** 1

## Scope and Method

Reviewed the feature's **full code diff** against the default branch, not the documents alone:

```
git diff --stat main...HEAD -- ':!docs'
 pdlc/workflows/orchestrate-dev.js                 |  57 ++-
 pdlc/workflows/dist/pdlc-cli.mjs                  |  57 ++-
 pdlc/workflows/__tests__/advisoryWaveGate.test.js | 390 +++++++++++++++--
 pdlc/workflows/__tests__/waveExecution.test.js    |  54 +++
 pdlc/workflows/__tests__/advisoryWaveGateMain.test.js |   5 +
 (+7 single-line test touch-ups, package.json, package-lock.json)
 15 files changed, 561 insertions(+), 39 deletions(-)
```

The production delta is three things: the fifth `haltFields` key `snapshotRef`
(`orchestrate-dev.js:3383-3392`, `:3479-3484`, `:3570-3595`), the pure renderer
`renderSnapshotOverwriteNotice` (`:3823-3841`), and the un-skip-halt carry
(`:15393-15399`, `:15445-15448`, `:15475-15487`).

Verification performed, in this order:

| Check | Command / site | Result |
|---|---|---|
| Branch is the feature branch, in sync with remote | `git rev-parse HEAD` vs `origin/feat-…` | identical (`c89695d8`) |
| Named suites green | `npm test -- advisoryWaveGate advisoryWaveGateMain waveExecution` | 313 passed, 3 suites |
| Generated runtime not drifted | `node pdlc/workflows/build-runtime.mjs --check` | `in-sync  pdlc/workflows/dist/pdlc-cli.mjs` |
| Every PROPERTIES id is named by some test | 78 ids extracted from PROPERTIES, grepped over `__tests__/` | 0 uncovered |
| Load-bearing oracles falsifiable | four source mutations, below | all RED |

**Mutation results** (each mutation applied to `orchestrate-dev.js`, targeted test
re-run, source restored):

| # | Mutation | Test | Outcome |
|---|---|---|---|
| M1 | `if (!resolved)` → `if (false)` at `:3579` (seam never pushes the notice) | `PROP-REC-08` | **RED** |
| M2 | `git clean -fd` → `-fdx` at `:12685` | `PROP-REST-03` | **RED** |
| M3 | un-skip-site push disabled at `:15484` | `AT-06-4` | **RED** |
| M4 | `${snapshotRef}` dropped from the rendered string at `:3838` (co-location broken, overwrite sentence kept) | `PROP-REC-08` | **RED** |

M4 is the one that matters most: BR-14's whole content is that the ref pointer and
the overwrite warning are **co-located in one `notices` element**. The oracle picks
the single element matching the ref and asserts `/overwrit/i` on *that same element*
(`advisoryWaveGate.test.js` PROP-REC-08 arm), so splitting the two halves across two
notices fails. A presence-anywhere oracle would have passed the mutant.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | AT-06-4 conjunct (3) is never proven on a **halt report**. Both shipped arms stop short of the production path, and the line that joins them is unprotected: replacing `_notice: advisoryNotice` with `() => {}` leaves the whole suite green. | FSPEC AT-06-4, BR-14, REQ AC-6.3, PROP-REC-08 |
| F-02 | Medium | Local | AT-06-4b (the E-34 no-warning companion) is proven at seam-unit level only, so it inherits F-01's dead sink and would pass vacuously if the notice never reached a report at all. | FSPEC AT-06-4b, E-34, PROP-REC-09 |
| F-03 | Low | Local | The overwrite oracle matches `/overwrit/i`, which a negated sentence ("re-running never overwrites…") would also satisfy. | `advisoryWaveGate.test.js` PROP-REC-08 arm; `waveExecution.test.js:1342`, `:1356` |

### F-01 (High) — AT-06-4's operator-facing conjunct has no production-path oracle

AT-06-4's *Who* is "an operator reading a **halt report**"
(`FSPEC-pdlc-advisory-wave-gate.md:475-478`), and the halt report's carrier for the
warning is the `notices` array, which rides the halt branch of `buildFinalReport`
(`orchestrate-dev.js:16119`). Two arms ship, and neither closes that loop:

| Arm | Where proven | Why it is not the production path |
|---|---|---|
| Ordinary A6-escalation halt (BR-14's primary case) | `advisoryWaveGate.test.js`, PROP-REC-08 arm | Calls `runWaveGateSeam` **directly**, collecting `_notice` into a local array. No report is built; `result.notices` is never read. |
| Post-gate un-skip halt | `waveExecution.test.js:1305-1343` | Does read `result.notices` — but injects `_runWaveGateSeam: a6.fn`, a **fake seam** (`:1336`). It exercises the call-site push at `:15484`; the seam's own push at `:3579-3581` never runs. |

So the seam's push is proven without a report, and the report is proven without the
seam. The single line joining them is `_notice: advisoryNotice`
(`orchestrate-dev.js:15432`).

**Falsification performed.** I replaced that argument with `() => {}`, rebuilt
`dist/` so runtime drift could not be the signal, and ran the full suite:

```
Test Suites: 1 failed, 101 passed, 102 total
Tests:       1 failed, 70 skipped, 4158 passed, 4229 total
  ● T30: cleanup-consumer-workflows.sh contract › AT-4.1: full-set cleanup …
```

The one failure is `T30 … AT-4.1`, which asserts "tracked files unchanged" and fails
only because the mutation itself left a modified tracked file in the tree — it is
unrelated to A6 and would fail for any source edit. **Every advisory test stayed
green.** The wave-gate seam's notice sink can be severed with no test noticing, which
is precisely the DC-07 builder-not-wired shape: a component unit-tested but never
proven assembled at the composition root.

Contrast the four oracles that *are* falsifiable (M1–M4 in Scope and Method) — the
gap is narrow and specific, not systemic. It is the seam→report hop alone.

**What must change.** The host already exists.
`advisoryWaveGateMain.test.js:365-388` (the `TE F-06` escalation case) drives the
**real** seam from `mainDev` to an unresolved halt, and already asserts
`snapshotRef: "refs/pdlc/a6-snapshot-1"` on `result.haltAdvisory` (`:377-383`). It
simply never reads `result.notices`. Add there, with the same co-location shape and
the same spec-side literals the other arms use:

```js
// AT-06-4 conjunct (3) on the REPORT, from the real seam (DC-07).
const overwriteNotice = result.notices.find((n) => n.includes("refs/pdlc/a6-snapshot-1"));
expect(overwriteNotice).toBeTruthy();
expect(overwriteNotice).toMatch(/overwrit/i);
```

Re-run the `_notice: advisoryNotice` mutation afterwards and confirm it goes RED; that
is the acceptance criterion for this finding, not the presence of the assertion.

### F-02 (Medium) — AT-06-4b's negative arm inherits the same dead sink

AT-06-4b exists expressly to make conjunct (3) "falsifiable rather than a string
always present" (`FSPEC…:483-486`). Its shipped oracle
(`advisoryWaveGate.test.js`, PROP-REC-09 arm) asserts over a **locally collected**
notices array on a direct `runWaveGateSeam` call. That is a sound seam-level oracle
and its positive conjuncts are complete — `haltFields` is asserted by full
`toEqual` with all five keys including `snapshotRef: null`, plus record and
escalation-log content — so this is not an absence-only oracle. The gap is only that,
like F-01, it never observes a report.

While F-01 stands, the E-34 arm cannot discriminate "the implementation correctly
suppressed the warning" from "no warning ever reaches a report on any path".

**What must change.** Once F-01's positive arm lands under `main()`, add the E-34
companion beside it: same `mainDev` harness, `_git` double failing the capture verb
(`write-tree`), then assert the halt report carries the diagnosis and root-cause class
and that `result.notices` contains no element matching either overwrite predicate —
asserted over the whole array, as the seam-level arm already does.

### F-03 (Low) — the overwrite predicate admits a negated sentence

FSPEC deliberately declines to pin the wording, requiring only "the presence of the
overwrite statement, never the capture's name — that is O-1's" (`FSPEC…:477-478`), so
a substring predicate is the right *shape*. But `/overwrit/i` matches a notice reading
"re-running this feature never overwrites that capture" — the inverted meaning — which
makes the oracle weaker than the clause it guards.

Anchoring on the spec-side phrase `overwrites that capture` keeps the wording free of
the capture's name while excluding the negation. Cheap, and it strengthens M4's
already-RED result. Not gating.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `resolvedSnapshotRef` guards the un-skip push (`orchestrate-dev.js:15484`), but `resolved === true` appears to imply a successful capture — E-34 escalates rather than resolving, so `resolved && snapshotRef === null` looks unreachable. Is the guard defensive-only? If so it is correct as written and needs no test; if a reachable path exists (a future disabled-tier or budget arm returning `resolved: true` without capture), it needs the third fixture. Confirming the reachability answer in TSPEC §4.5 would close it either way. |
| Q-02 | AT-06-4's un-skip negative arm discriminates on "A6 never fired" (`waveExecution.test.js:1347`, `a6.calls.length === 0`). Given Q-01, is that the intended discriminator, or was "A6 fired but captured nothing" meant to be the companion? The former is what ships and is consistent with the reachability reading above. |

## Positive Observations

- **The oracles that exist are genuinely falsifiable.** Four independent source
  mutations (M1–M4) each produced a RED test. In particular M4 — dropping the ref
  from the rendered string while keeping the overwrite sentence — is killed, which
  means BR-14's *co-location* clause is actually enforced rather than approximated by
  a presence-anywhere check. The oracle picks the single `notices` element matching
  the ref and asserts the overwrite predicate on **that same element**. This is the
  right shape and it is worth keeping as the pattern for the F-01 fix.
- **`test.todo` retired into a real, mutation-proven case.** PROP-REST-03 was a
  pending marker; it now ships as a live case whose new `hashDomain` helper reads
  BR-9's domain out of the repo itself (`git ls-files` ∪
  `git ls-files --others --exclude-standard`) instead of re-implementing gitignore
  matching in the test. Mutation M2 (`git clean -fd` → `-fdx`) goes RED, so the
  boundary the todo deferred is now genuinely observed — and the case carries a
  positive-presence conjunct (the ignored file's content survives restore) alongside
  the map-equality half, exactly as the falsifiability bar requires.
- **Anti-echo discipline is consistent.** Every expected value in the new tests is a
  literal written spec-side — `"refs/pdlc/a6-snapshot-1"`, the verbatim Oracle G
  diagnosis sentence, the two-class root-cause literal. Nothing is imported from or
  derived off the module under test, so the expectations can fail.
- **Set-equality, not containment, on the enumerated contract.** The `haltFields`
  key set is asserted by sorted `Object.keys` over all five keys
  (`advisoryWaveGate.test.js`, PROP-REC-05 arm), and the halt-fields payloads are
  asserted with `toEqual`, not `toMatchObject`. A silently dropped `snapshotRef`
  fails rather than passes.
- **PROP-REST-10 asserts ordering, not coincidence.** The new case merges the git
  transport's call log and the `_appendFile` log into one order-preserving timeline
  and compares ordinals, rather than checking that content happens to match at the
  end. That is the correct answer to BR-9's "observation point" clause.
- **The negative arms carry positive conjuncts.** PROP-REC-09's no-notice assertion
  is paired with a full five-key `toEqual` on `haltFields` plus record and
  escalation-log content; the un-skip negative is paired with `outcome === "halted"`,
  `haltAdvisory === undefined` and `a6.calls.length === 0`. No absence-only oracles
  were found in this diff.
- **The coverage gate is honest.** `test:coverage` is two-stage, and stage 2 re-reports
  `--per-file --branches 85`, so a small module cannot hide under
  `orchestrate-dev.js`'s 15k-line aggregate. It passes: branch 88.45% on
  `orchestrate-dev.js`, above the 85 floor, with the full suite green
  (102 suites, 4159 passed).
- **Generated runtime is in sync.** `build-runtime.mjs --check` reports
  `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`, and the 57-line `dist/` delta matches
  the 57-line source delta — the rebuild-and-stage obligation was honoured.

## Recommendation

**Needs revision**

One High finding (F-01). The production delta itself is correct — I found no defect in
the shipped behaviour, and the wiring at `orchestrate-dev.js:15432` and `:15484` is
right. What is missing is the oracle that would keep it right: AC-6.3 / AT-06-4 is an
explicitly operator-facing claim about a **halt report**, and no test reads a report
produced by the real seam. The mutation evidence is unambiguous — the sink can be
severed with the suite green.

The fix is small and the host test already exists (`advisoryWaveGateMain.test.js:365-388`
already drives the real seam to an unresolved halt and already asserts `snapshotRef`).
Add the three-line `result.notices` assertion there, add F-02's E-34 companion beside
it, and re-run the `_notice: advisoryNotice` mutation to confirm it goes RED. F-03 is
a one-token strengthening and is not gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}

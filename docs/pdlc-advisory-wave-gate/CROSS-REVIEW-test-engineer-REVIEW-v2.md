# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/ (full feature diff `main...feat-pdlc-advisory-wave-gate`)
**Date:** 2026-08-21
**Iteration:** 2

## Scope and Method

Delta re-review. The base I approved-against in v1 is `c89695d8`; the remediation commit is
`e30f90bc` ("fix(advisory): wire AC-6.3's warning to the halt report and default the seam clock").
Everything after it on this branch is cross-review prose. The code delta under review:

```
git diff --stat c89695d8..HEAD -- ':!docs'
 pdlc/workflows/orchestrate-dev.js                      | 37 +++-   (+34 -3)
 pdlc/workflows/__tests__/advisoryWaveGateMain.test.js  | 124 +++-  (+121 -3)
 pdlc/workflows/__tests__/advisoryEnvelope.test.js      | 15 ++
 pdlc/workflows/__tests__/waveExecution.test.js         | 12 +-
 pdlc/workflows/dist/pdlc-cli.mjs                       | 37 +++-
```

Three production changes, all narrow: a frozen `ADVISORY_ROOT_CAUSE_MEANINGS` map rendered into the
A6 dispatch prompt in catalogue order (`orchestrate-dev.js:1967-1978`, `:3160-3162`); a `_now`
default on `runWaveGateSeam` (`:3412`); and JSDoc for `haltFields.snapshotRef`
(`:3376-3377`, `:3380-3382`). No behavioural change to the seam's returns, the halt path, or the un-skip carry —
so per the delta protocol I re-read only these sections plus the four new/edited oracles, and did
not re-litigate what v1 already cleared.

Verification performed, in order:

| Check | Command / site | Result |
|---|---|---|
| Branch | `git rev-parse --abbrev-ref HEAD` | `feat-pdlc-advisory-wave-gate` |
| Local vs remote | `HEAD` vs `origin/feat-pdlc-advisory-wave-gate` | identical (`cf1b32ed`) |
| Named suites green | `npm test -- advisoryWaveGateMain advisoryEnvelope waveExecution advisoryWaveGate` | 365 passed, 4 suites, 0 failed |
| Generated runtime | `node pdlc/workflows/build-runtime.mjs --check` | `in-sync pdlc/workflows/dist/pdlc-cli.mjs` |
| Load-bearing oracles falsifiable | five source mutations, table below | four RED, one **GREEN** (F-04) |

**Working-tree note (not a finding).** On first inspection `build-runtime.mjs --check` reported
`STALE` and `git status` showed `M pdlc/workflows/orchestrate-dev.js` — an uncommitted leftover
mutation (`...[...ADVISORY_ROOT_CAUSES].reverse().map(`) from someone's own mutation check, still
sitting in the shared tree. Committed state is clean: after `git checkout --` on that one file,
`--check` reports `in-sync` and the whole named-suite set is green. Nothing on the branch is
affected; flagging it only so the next agent in this tree is not misled by the same `STALE`.

**Mutation results** (each applied to `orchestrate-dev.js`, targeted suite re-run, source restored):

| # | Mutation | Test | Outcome |
|---|---|---|---|
| M1 | `_notice: advisoryNotice` → `_notice: () => {}` at the wave-loop A6 call site (`:15463`) | AT-06-4 report arm | **RED** |
| M2 | `_now = () => Date.now(),` → `_now,` on `runWaveGateSeam` (`:3412`) | AT-06-4b report arm | **RED** |
| M3 | catalogue reversed before the prompt render (`:3160`) | AC-2.2 prompt-order arm | **RED** |
| M4 | `${snapshotRef}` dropped from the rendered notice (`:3868`) | AT-06-4 report arm | **RED** |
| M5 | `"Re-running this feature overwrites that capture"` → `"...never overwrites that capture"` (`:3869`) | — | **GREEN** across all three advisory suites (315 passed) |

M1 is the v1 F-01 mutation, and it now turns the suite red — the seam→report hop is closed. M2 is
the defect the new AT-06-4b arm surfaced, and it is guarded. M5 is F-04 below.

## Status of v1 Findings

| v1 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `advisoryWaveGateMain.test.js:411-413` now reads `result.notices` on the real-seam escalation case driven through `mainDev`, selects the single element carrying `refs/pdlc/a6-snapshot-1`, and asserts the overwrite phrase on that same element. Mutation M1 (severing `_notice: advisoryNotice` at `orchestrate-dev.js:15463`) turns it RED — the exact mutation that was silently green in v1. |
| F-02 | Medium | **Resolved** | `advisoryWaveGateMain.test.js:461-507` adds AT-06-4b's E-34 companion on the same `mainDev` harness, with a `gitFailVerb: "write-tree"` lever (`:116-118`) that fails the capture and nothing else. |
| F-03 | Low | **Partially resolved** | The positive predicates moved from `/overwrit/i` to `/overwrites that capture/i` (`advisoryWaveGateMain.test.js:413`, `waveExecution.test.js:1352`). This narrows the admitted set, but the negated sentence I named in v1 still satisfies it — see F-04 below. |

### F-01 — closed, and closed the right way

The fix is the three-line assertion I suggested, landed on the host I named
(`advisoryWaveGateMain.test.js`'s real-seam escalation case), and it preserves the co-location
shape: `result.notices.find((n) => n.includes("refs/pdlc/a6-snapshot-1"))` picks one element and
both further assertions land on *that* element, so splitting the ref and the warning across two
notices fails. Both halves are spec-side literals — the ref is composed from the fixture's own wave
number, never read back off `result.haltAdvisory` — so there is no implementation echo.

Two independent mutations confirm it is load-bearing rather than incidentally passing: M1 (the sink
severed) and M4 (`${snapshotRef}` dropped from `renderSnapshotOverwriteNotice` while the overwrite
sentence is kept). M4 is the sharper of the two — it proves the oracle enforces BR-14's
*co-location* clause, not a presence-anywhere check.

### F-02 — closed, and it caught a real production defect

This is the most valuable outcome of the round, and it is exactly the argument for putting the
negative arm on the production surface rather than the seam. The new arm asserts, alongside the
`toEqual` on `haltAdvisory` and both absence predicates, that E-34's durable trace actually landed:

```js
expect([...harness.created]).toContain(`docs/${FEATURE}/ADVISORY-${FEATURE}.md`);
expect([...harness.created]).toContain("docs/_queue/ESCALATIONS.md");
expect(result.notices.some((n) => /write failed for seam A6/.test(n))).toBe(false);
```

That conjunct failed on first run, and the cause is shipped behaviour, not fixture noise: `main`
carries no default for `_now`, and the capture-failure branch calls `appendAdvisoryEntry` /
`appendEscalationEntry` directly, both of which call `_now()` unguarded — so on every real E-34 run
the record and the ESCALATIONS.md entry were being replaced by two "write failed" notices. The fix
defaults `_now` on the seam (`orchestrate-dev.js:3412`), matching `runAdvisorySeam`. Mutation M2
reverts the default and the arm goes RED, so the guard is falsifiable. No seam-level oracle could
have seen this — every unit arm injects a clock — which is the DC-07 lesson restated at the clock
rather than the sink, and is why I have tagged F-05 below `Cross-Feature`.

### Collateral checks on the revision

The revision also touched two oracles that were not mine (PM F-02's ordered `toEqual` on
`ADVISORY_ROOT_CAUSES` at `advisoryEnvelope.test.js:334-345`, and PM F-03's widened
`NO_HALT_FIELDS` at `waveExecution.test.js:952-957`). Both are sound from the testing lens and
neither weakens an existing oracle: the ordered deep-equal is added *beside* the sorted set check,
not in place of it, so a rename and a reorder still fail distinctly; and the widened sentinel is
transcribed, not imported. The new AC-2.2 prompt oracle
(`advisoryWaveGateMain.test.js:425-444`) reads the prompt the real driver dispatched rather than
the builder's return value, transcribes the meaning fragments spec-side rather than reading them
back off `ADVISORY_ROOT_CAUSE_MEANINGS`, and checks order by strictly-increasing offsets —
falsified by M3. Nothing in the delta regressed a v1-approved oracle.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-04 | Low | Local | The narrowed overwrite predicate `/overwrites that capture/i` still admits the negated sentence v1 F-03 named: mutating the rendered string to "Re-running this feature **never** overwrites that capture" leaves all three advisory suites green (315 passed). The predicate excludes a *reworded* warning but not an *inverted* one. | `orchestrate-dev.js:3866-3869`; `advisoryWaveGateMain.test.js:413`, `waveExecution.test.js:1352`, `advisoryWaveGate.test.js:1836`, `:1855` |
| F-05 | Medium | Cross-Feature | `mainDev` destructures `_now` with **no default** (`orchestrate-dev.js:13020`), so the production driver hands `undefined` to every seam it dispatches. Four seam entrypoints self-default (`:1627`, `:3412`, `:4014`, `:11434`), but the two durable-write helpers they call directly do not (`appendAdvisoryEntry` `:3717`, `appendEscalationEntry` `:3848`). Nothing asserts the invariant; this round's E-34 arm caught one instance by accident, not by design. | `orchestrate-dev.js:13020`, `:3717`, `:3848`, `:14758` |

### F-04 (Low) — the semantic-inversion mutant still survives

v1 F-03 asked for a predicate that excludes the inverted sentence. The revision moved from the
bare stem `/overwrit/i` to the phrase `/overwrites that capture/i` at the two report-level arms
(`advisoryWaveGateMain.test.js:413`, `waveExecution.test.js:1352`), which is a real narrowing —
a warning reworded to "this ref will be clobbered" now fails. But the phrase is a *substring* of
the negation, so the inversion passes straight through. Falsification performed this round (M5 in
Scope and Method): I edited `orchestrate-dev.js:3869` from

```
"Re-running this feature overwrites that capture — copy the ref first if you intend to inspect it."
```

to `"Re-running this feature never overwrites that capture — …"`, ran
`npm test -- advisoryWaveGateMain waveExecution advisoryWaveGate`, and got **3 suites passed, 315
tests passed**. An operator-facing warning that now tells the operator the opposite of BR-14 is
green.

Two of the four sites were not narrowed at all and still carry the bare stem
(`advisoryWaveGate.test.js:1836`, `:1855`), so the seam-level PROP-REC-08 arm remains as weak as
it was in v1.

**What would close it.** Assert the sentence's *directive* half rather than its verb, since that
half cannot survive inversion coherently — e.g. anchoring on `copy the ref first`, or on the
whole clause `overwrites that capture — copy the ref first`. Either keeps the capture's name out
of the predicate (that half is O-1's, per `FSPEC-pdlc-advisory-wave-gate.md:477-478`) while
killing M5. Apply it at all four sites, including the two seam-level arms. Not gating: the shipped
string is correct, and the co-location clause — the observable BR-14 actually asserts — is
enforced and mutation-proven (M4).

### F-05 (Medium, Cross-Feature) — nothing guards "every clock consumer reachable from `mainDev`"

This is the general shape of the defect this round's F-02 arm surfaced, and it is worth recording
because the fix landed at one call site rather than at the invariant.

`mainDev`'s parameter list defaults nearly every injected dependency (`_hashFile`, `_phase`,
`_runAdvisorySeam`, `_git`, `_appendFile`, … all carry `= default…` at `:12995-13030`) — but
`_now` and `_sleep` are bare (`:13020-13021`). Every seam call site therefore forwards `undefined`
(`:14758`, `:15461`, `:15767`, `:15825`), and correctness depends entirely on each callee
defaulting the clock for itself. The four seam entrypoints do. The two helpers that write the
durable artifacts do not: `appendAdvisoryEntry({ … _now })` (`:3717`) and
`appendEscalationEntry({ … _now })` (`:3848`) destructure it bare, and both are invoked *directly*
— not through a seam — at `:3470` and `:3485`, and again at `:4158`. Before `:3412` gained its
default this round, that combination silently replaced E-34's record and ESCALATIONS.md entry with
two "write failed" notices on every real run.

The class of bug is not "one seam forgot a default"; it is that the injected-clock contract is
unstated and unoracled, so it is re-decidable at each new call site. Every unit arm injects a
clock, so no seam-level test can ever see it — the DC-07 builder-not-wired lesson restated at the
clock rather than at the sink. Only two suites drive `mainDev` at all
(`advisoryWaveGateMain.test.js`, `advisoryDisabled.test.js`), and neither asserts the invariant
generally.

**What would close it.** Either default `_now` on `mainDev` itself (`_now = () => Date.now()`), so
no callee can inherit `undefined` — one line, and it makes every self-default redundant rather than
load-bearing — or add the two missing defaults on the `append*` helpers. Then add the oracle that
keeps it: one `mainDev`-driven case per seam family with `_now` omitted, asserting the durable
artifact was created and that `notices` carries no `/write failed for seam/` element, exactly as
`advisoryWaveGateMain.test.js:504-507` now does for A6. Tagged `Cross-Feature` because the
constraint — *a dependency the production entrypoint does not default must be defaulted by every
consumer, and that is an invariant, not a per-call-site choice* — outlives this feature and belongs
in `docs/_constraints/DOMAIN-CONSTRAINTS.md` beside DC-07.

## Questions

| ID | Question |
|----|---------|
| Q-01 | (carried from v1, still open and still non-blocking) `resolvedSnapshotRef` guards the un-skip push at the wave-loop call site. Is `resolved === true && snapshotRef === null` reachable, or is the guard defensive-only? E-34 escalates rather than resolving, so it still reads unreachable to me — in which case it is correct as written and needs no fixture. If a future disabled-tier or budget arm can return `resolved: true` without a capture, that arm needs its own case. A one-line reachability note in TSPEC §4.5 closes it either way; nothing in this round's delta changed the answer. |
| Q-02 | Was `mainDev`'s bare `_now` (`orchestrate-dev.js:13020`) a deliberate "the driver has no clock of its own, every seam owns its default" contract, or an omission? The answer decides F-05's fix: if deliberate, the two `append*` helpers (`:3717`, `:3848`) are the bugs and should default; if an omission, defaulting `mainDev` once is the smaller and safer change. I have no evidence either way in TSPEC or DECISIONS. |
| Q-03 | The AC-2.2 prompt oracle (`advisoryWaveGateMain.test.js:437-444`) checks catalogue order by strictly-increasing offsets over four `"<class> —"` markers. That is falsified by a reorder (M3, RED) — but does the spec require the four to be *exhaustive* in the prompt as well as ordered? If a fifth class were added to `ADVISORY_ROOT_CAUSES` and omitted from `ADVISORY_ROOT_CAUSE_MEANINGS`, this oracle would stay green. `advisoryEnvelope.test.js:334-345` pins the catalogue itself by set-equality, so the gap is only in the *rendered prompt*; a `Object.keys(ADVISORY_ROOT_CAUSE_MEANINGS)`-vs-`ADVISORY_ROOT_CAUSES` set-equality check (spec-side literals on both sides) would close it. Not filed as a finding because the catalogue is frozen and its set-equality check exists; flagging in case the catalogue is expected to grow. |

## Positive Observations

## Recommendation


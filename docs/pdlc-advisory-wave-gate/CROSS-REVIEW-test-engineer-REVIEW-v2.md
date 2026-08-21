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
A6 dispatch prompt in catalogue order (`orchestrate-dev.js:1963-1974`, `:3159-3163`); a `_now`
default on `runWaveGateSeam` (`:3404-3412`); and JSDoc for `haltFields.snapshotRef`
(`:3376-3382`). No behavioural change to the seam's returns, the halt path, or the un-skip carry —
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
| M3 | catalogue reversed before the prompt render (`:3159`) | AC-2.2 prompt-order arm | **RED** |
| M4 | `${snapshotRef}` dropped from the rendered notice (`:3868`) | AT-06-4 report arm | **RED** |
| M5 | `"Re-running this feature overwrites that capture"` → `"...never overwrites that capture"` (`:3869`) | — | **GREEN** across all three advisory suites (315 passed) |

M1 is the v1 F-01 mutation, and it now turns the suite red — the seam→report hop is closed. M2 is
the defect the new AT-06-4b arm surfaced, and it is guarded. M5 is F-04 below.

## Status of v1 Findings

| v1 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `advisoryWaveGateMain.test.js:461-463` now reads `result.notices` on the real-seam escalation case driven through `mainDev`, selects the single element carrying `refs/pdlc/a6-snapshot-1`, and asserts the overwrite phrase on that same element. Mutation M1 (severing `_notice: advisoryNotice` at `orchestrate-dev.js:15463`) turns it RED — the exact mutation that was silently green in v1. |
| F-02 | Medium | **Resolved** | `advisoryWaveGateMain.test.js:474-508` adds AT-06-4b's E-34 companion on the same `mainDev` harness, with a `gitFailVerb: "write-tree"` lever (`:112-118`) that fails the capture and nothing else. |
| F-03 | Low | **Partially resolved** | The positive predicates moved from `/overwrit/i` to `/overwrites that capture/i` (`advisoryWaveGateMain.test.js:463`, `waveExecution.test.js:1352`). This narrows the admitted set, but the negated sentence I named in v1 still satisfies it — see F-04 below. |

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
`NO_HALT_FIELDS` at `waveExecution.test.js:951-956`). Both are sound from the testing lens and
neither weakens an existing oracle: the ordered deep-equal is added *beside* the sorted set check,
not in place of it, so a rename and a reorder still fail distinctly; and the widened sentinel is
transcribed, not imported. The new AC-2.2 prompt oracle
(`advisoryWaveGateMain.test.js:415-441`) reads the prompt the real driver dispatched rather than
the builder's return value, transcribes the meaning fragments spec-side rather than reading them
back off `ADVISORY_ROOT_CAUSE_MEANINGS`, and checks order by strictly-increasing offsets —
falsified by M3. Nothing in the delta regressed a v1-approved oracle.

## Findings

## Questions

## Positive Observations

## Recommendation


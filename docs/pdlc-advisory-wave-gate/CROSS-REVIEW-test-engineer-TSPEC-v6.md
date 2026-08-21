# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.15)
**Date:** 2026-08-20
**Iteration:** 6

## Overview

Delta re-review of v1.14 → v1.15 (`6f00074c..HEAD`, five content commits, +76/−13). Scope is the
changed material only: §1's changelog, §4.5's carrier row (line ~1459), the new **Where the push
happens** row, the "why not the halt message" row, the AT-05-3 survival paragraph, §4.5's un-skip
table's new *Overwrite notice* row, §5.1's superset sentence and three table cells (the
`advisoryWaveGate.test.js` cell, the new `advisoryWaveGateMain.test.js` row, the
`advisoryEscalationLog.test.js` cell), §5.2's capture-failure inventory, and §5.6's AT-06-4 cell.
Sections settled in rounds v1.2–v1.14 are not re-litigated.

**All three v5 findings are resolved**, and each remedy is grounded in code I checked rather than in
the document's own prose. Two v5 questions (Q-01 export shape, Q-02 un-skip arm) are answered inside
the document. What remains is one Medium about a fixture-wiring detail the push-site paragraph
overstates, and one Low numeral. Neither blocks.

**Prior findings (v5).**

| v5 | Severity | State at v1.15 | Evidence |
|---|---|---|---|
| F-01 five-key set-equality collides with shipped four-key set-equalities | High | **Resolved** | §5.1's `advisoryWaveGate.test.js` cell now names the shipped whole-object oracles and marks them *widened by the same task*; §5.1 gains the `advisoryWaveGateMain.test.js` row for the real-seam `haltAdvisory` oracle; §5.2 states the five-key equality **replaces** the four-key one and names the false-green trap. Verified at HEAD: `advisoryWaveGate.test.js:1699` (Oracle G's own literal), `:2676` (escalation path), `:2714` (`Object.keys(result.haltFields).sort()`), `:3425`/`:3462` against `ORACLE_G_HALT_FIELDS` (`:3369`), `advisoryWaveGateMain.test.js:373`. The "`waveExecution.test.js` needs no widening" carve-out is correct: `:1094` compares against the fixture's own `haltFields`, and `:1274` against the fake-supplied `a6HaltFields` (`:1251-1256`) |
| F-02 push site unnamed | Medium | **Resolved (with one imprecision, F-01 below)** | §4.5's new row places the push **inside `runWaveGateSeam`** through `_notice`. Verified: the parameter exists (`orchestrate-dev.js:3382`), the head guard is verbatim `const notice = typeof _notice === "function" ? _notice : () => {}` (`:3385`), the call site passes `_notice: advisoryNotice` (`:15386`), and the sink `const advisoryNotice = (line) => notices.push(line)` (`:14635`) is in the same function scope as both the seam call and the un-skip halt (`:15433`) — no intervening function declaration between `:14600` and `:15450`. The named consequence is exact and exhaustive: `advisoryEscalationLog.test.js:821` is the **only** exact `notices` count that an A6 escalation over a real repo reaches (`:497` is a pure two-element array unit; `waveExecution.test.js:590`, `:749`, `:2648` count *filtered logs*, not the notice array; `waveExecution.test.js:803-817` are `checkWaveUnskips` unit returns) |
| F-03 `TEST_GATE_MESSAGE` is not a symbol | Low | **Resolved** | §4.5 now names the per-wave `testGateMessage` template built at the call site (`orchestrate-dev.js:15359-15361`, thrown at `:15398`), marks the upper-case name as §2.3 shorthand, and restates AT-05-3's oracle as **containment** in the shipped form (`advisoryWaveGateMain.test.js:368`, `waveExecution.test.js:1091`) |

## Architecture

The delta moves one architectural decision from open to closed: **where the overwrite notice is
pushed**. §4.5 answers "inside `runWaveGateSeam`, through its own `_notice` parameter, on every
unresolved return whose `snapshotRef` is non-`null`", and the reasoning it gives — that the seam is
where `snapshotRef` is known and where §5.6's arms observe — matches the code. `runWaveGateSeam`'s
signature already carries `_notice` (`orchestrate-dev.js:3382`) and normalises it to a no-op at the
head (`:3385`), so the push needs no new parameter, no new plumbing hop, and no report knowledge
inside the seam. The wave loop's `if (!a6.resolved) throw haltError(testGateMessage, …)` (`:15398`)
is exactly the set of returns the row quantifies over, and the sink the call site hands in
(`_notice: advisoryNotice`, `:15386`) is the same array the halt-path `buildFinalReport` spreads.

The **un-skip arm** is the one push that genuinely cannot live in the seam, and §4.5's new row says
so for the right reason: that halt fires after the seam has returned *resolved* (`:15402` records
`resolvedAdvisoryFields = a6.haltFields`; the throw is at `:15433`). I checked the scoping claim the
row depends on — `advisoryNotice` is declared at `:14635` and the un-skip throw at `:15433` sit in
the same enclosing function (no function declaration intervenes), so the helper and the sink are
both in scope at that site. The two push sites are also **disjoint by construction**, which the
document does not state but which matters for double-emission: the seam pushes only on *unresolved*
returns, the un-skip site only after a *resolved* one, so no single wave can emit the notice twice.
That disjointness is what keeps `advisoryEscalationLog.test.js:821`'s widening 2→3 rather than 2→4.

Nothing else moves. No new module, no new file, no new test double; the `renderSnapshotOverwriteNotice`
helper still does not exist at HEAD (`grep -rn renderSnapshotOverwriteNotice pdlc/` matches only the
TSPEC), which is correct — it is what PLAN mints — while both named siblings do and are exported
(`export function renderAdvisoryEntry`, `orchestrate-dev.js:3605`; `export function
renderEscalationEntry`, `:3743`), so §1.2's "no new module" claim survives.

## Interfaces

Two interface facts were pinned this round; both check out.

- **`renderSnapshotOverwriteNotice` is exported** (§4.5, answering v5 Q-01). This is the answer that
  buys the most test leverage: it makes a direct purity assertion available in the shape
  `PROP-ESC-01` already uses on `renderEscalationEntry` (`advisoryEscalationLog.test.js:177-181`),
  *in addition to* the seam-level observation, so PLAN's red test does not have to choose. The
  sibling claim is accurate — both cited renderers are `export function` declarations
  (`orchestrate-dev.js:3605`, `:3743`).
- **`runWaveGateSeam`'s `_notice` contract.** §4.5 quotes the head guard verbatim and it is verbatim
  correct (`orchestrate-dev.js:3385`). One consequence the document leans on without stating: because
  the guard swallows a missing `_notice` into a no-op, a fixture that forgets to wire a collector
  produces an empty array rather than a throw — which is exactly the hazard behind F-01 below. The
  seam's return shape is unchanged by this round (`noHaltFields` at `:3386` is still the four-key
  sentinel; widening it is the task §5.1 and §5.2 now name).

No interface is contested, and none of the delta's text refines an implementation contract that
belongs downstream of the TSPEC.

## Data Model

The five-key halt-field set is unchanged from v1.14 and remains internally consistent; this round
only reconciled it with the **oracles** that pin the old four-key shape, which is a test-strategy
change, not a data-model one. The one genuinely new data-model statement is §4.5's un-skip row
asserting that the un-skip halt's `snapshotRef` is non-`null` — consistent with the same table's
"Value when A6 resolved this wave" row and with `orchestrate-dev.js:15402`, where the resolved
wave's `a6.haltFields` is what rides through to `:15434`'s `{ advisory: resolvedAdvisoryFields }`.

The AT-05-3 paragraph's correction is a data-model improvement too: the halt reason is now described
as the per-wave `testGateMessage` template (`Error: Wave ${waveNum} test gate failed — …`,
`orchestrate-dev.js:15359-15361`) rather than a module constant that does not exist, and the oracle
is restated as containment, matching what the suite ships (`advisoryWaveGateMain.test.js:368`,
`waveExecution.test.js:1091`). The behavioural claim — the warning rides `notices`, never the
message — is unchanged and still correct: `haltError` builds the `Error` from `message` alone and
`Object.assign`s the rest, and the handler sets `haltReason = err.message`.

## Test Strategy

## Open Questions

## Findings

## Questions

## Positive Observations

## Recommendation

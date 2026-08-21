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

**v5 F-01 is fully discharged, and the remedy is stronger than what I asked for.** I asked for three
things; all three landed, and §5.2 added a fourth that I did not ask for and that matters most: it
names the *false-green route* an implementer under a red wave gate would otherwise take — "the cheap
way green would be to leave `snapshotRef` off the capture-failure `fields`, which deletes the only
positive oracle for the `null` value and false-greens both AT-06-4 arms". That sentence converts a
mechanical widening instruction into a rule an implementer cannot satisfy by deletion.

The counterparty inventory is **complete**, which I verified by enumerating rather than trusting.
Every whole-object or key-set assertion over `haltFields` / `haltAdvisory` in the suite is either
named as widened or correctly carved out:

| HEAD assertion | Disposition in v1.15 | Correct? |
|---|---|---|
| `advisoryWaveGate.test.js:2714` — `Object.keys(result.haltFields).sort()` | named; "the only place a key *set* is asserted" | yes — no other `Object.keys` over `haltFields` exists in the suite |
| `advisoryWaveGate.test.js:1699` — Oracle G's own literal | named as §5.2's fixture itself | yes |
| `advisoryWaveGate.test.js:3425`, `:3462` + the `ORACLE_G_HALT_FIELDS` literal `:3369` | named | yes |
| `advisoryWaveGate.test.js:2676` — escalation-path literal | named | yes |
| `advisoryWaveGateMain.test.js:373` — real-seam `haltAdvisory` (DC-07 production-path test) | new §5.1 row; widened, `haltReason` containment deliberately untouched | yes |
| `waveExecution.test.js:1094`, `:1274` | carved out: compare against fields the A6 **fake** was handed (`:1251-1256`) | yes — `toEqual` against a fixture-supplied object follows the fixture's width |
| `advisoryWaveGate.test.js:1059`, `:1282`, `:2253` — `.repairPaths` only | unmentioned | correct to omit: single-field reads are width-insensitive |

**v5 F-02's consequence claim is exact.** §4.5 and §5.1 name `advisoryEscalationLog.test.js:821`'s
`expect(failed.notices).toHaveLength(2)` as the one exact count that becomes three, and add that the
two `arrayContaining` content assertions (`:822-827`) are unaffected. I checked every other candidate:
`advisoryEscalationLog.test.js:497` counts a hand-built two-element array in a pure unit
(`PROP-ESC-08`), `waveExecution.test.js:590`/`:749`/`:2648` count *filtered log lines*, not the
notice array, and `waveExecution.test.js:803-817` are `checkWaveUnskips`' own returns. There is no
unnamed counterparty. The `:821` fixture does satisfy the row's premise — `runA6Escalation` runs over
a real temp repo where the capture succeeds, so `snapshotRef` is non-`null` and a third notice is
genuinely due.

**The one thing the push-site paragraph overstates (F-01, Medium).** §4.5 says both of §5.6's arms
"are seam-level runs that already wire `_notice`, e.g. `_notice: (m) => notices.push(m)` in
`advisoryWaveGate.test.js`'s Oracle-G runs". The cited collector form is real — `:3412`, `:3452`,
`:3494` — but it belongs to a *different* describe than either of AT-06-4's / AT-06-4b's named hosts.
AT-06-4b's host, §5.2's capture-failure fixture, is the Oracle-G block at `:1671-1705`; AT-06-4's
host, the two-red-wave PROP-REST-07 run, is at `:1623-1668`. **Both build their args through
`makeA6RunArgs`, whose default is `_notice: () => {}` (`:996`), and neither overrides it.** Combined
with the seam's swallowing head guard (`orchestrate-dev.js:3385`), the failure mode is the one this
lens exists to catch: an implementer who declares `const notices = []` and asserts AT-06-4b's
whole-array negative over it, without also passing `_notice: (m) => notices.push(m)`, gets a green
from an array that was never populated — a vacuous negative. AT-06-4's positive arm on the *other*
fixture would still red if the collector were missing there, so the design is not broken and the
discriminating pair still exists; what is missing is one clause. Fix: in §4.5's push-site row (or
§5.6's AT-06-4b cell), state that both host fixtures currently take `makeA6RunArgs`' no-op default
and **must override it with a collector**, and that AT-06-4b's negative is only meaningful over an
array the run actually wrote to. Medium, not High: the oracle is not absence-only — the same run
carries the five-key equality, the diagnosis and the class as positives — and the gap is a fixture
instruction, not a missing falsifier.

**AT set-equality is unchanged.** §5.6's un-skip clause explicitly declines to mint a new AT id, and
`grep -c '^| AT-'` over the TSPEC still returns 48, matching the "forty-eight" the document states at
lines 52 and 1894. Folding the third arm under AT-06-4's task is the right call: the predicates are
identical, and a witness id would have forced a PLAN row for a path whose only difference is the push
site.

**Anti-echo and set-equality discipline hold across the delta.** AT-06-4's spec-side predicates
(`/overwrit/i`, `"refs/pdlc/a6-snapshot-" + waveNum`) are unchanged and still forbid
`toContain(devModule.SOME_WARNING)` by name; §5.2's inventory is a set-equality, not containment; and
the one numeral this round removed ("six positive assertions") was removed rather than corrected,
which is the right move — a count that drifts every round is a liability, and the claim it carried
survives without it.

## Open Questions

Both of v5's questions are answered in the document, and neither answer forecloses a testing approach
§5 needs. Q-01's answer (the helper is exported) *adds* a testing option rather than removing one.
Q-02's answer (the un-skip arm is in scope, covered by AT-06-4's predicates under the same PLAN task)
closes the quantifier gap I flagged as an implicit assumption last round.

One residual assumption, stated here rather than filed: the two push sites are disjoint — the seam
pushes only on unresolved returns, the un-skip site only after a resolved one — so a wave can emit
the overwrite notice at most once. The document does not say this, and it is what makes
`advisoryEscalationLog.test.js:821`'s widening exactly 2→3. It is true at HEAD by construction
(`orchestrate-dev.js:15398` vs `:15433`), so I am not filing it; a one-clause note would make the
count arithmetic self-evident to whoever writes that edit.

Nothing in §6 changed this round, and nothing in the delta contradicts a promoted decision or a
standing constraint (DC-07's production-path rule is *strengthened* by §5.1's new
`advisoryWaveGateMain.test.js` row, which is precisely the real-seam test DC-07 asks for).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §4.5's push-site row says both of §5.6's arms "already wire `_notice`", citing `_notice: (m) => notices.push(m)`. That collector form exists (`advisoryWaveGate.test.js:3412`, `:3452`, `:3494`) but in a different describe than either named host: AT-06-4b's host is the Oracle-G capture-failure block at `:1671-1705` and AT-06-4's is the two-red-wave PROP-REST-07 run at `:1623-1668`, and **both take `makeA6RunArgs`' default `_notice: () => {}` (`:996`)**. Because the seam swallows a missing sink into a no-op (`orchestrate-dev.js:3385`), an implementer who declares a `notices` array but forgets the override gets a vacuous green on AT-06-4b's whole-array negative. Fix: one clause requiring a collector override on both host fixtures, and stating that AT-06-4b's negative is only meaningful over an array the run actually wrote to | §4.5 ("Where the push happens"); §5.6 (AT-06-4b) |
| F-02 | Low | Local | §5.1's `advisoryWaveGate.test.js` cell opens "**Four** shipped halt-field oracles in this file are set-equalities…" and then enumerates **five** assertion sites — `:2714`, `:1699`, `:3425`, `:3462`, `:2676` — plus the `ORACLE_G_HALT_FIELDS` literal at `:3369`. The enumeration is complete and correct; only the numeral is wrong (it counts *kinds*, not sites). Fix: drop the numeral, as §5.2 did with "six positive assertions" this round, or say "five assertion sites in four shapes" | §5.1 (`advisoryWaveGate.test.js` row) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Should the un-skip halt site's push be guarded against the case where `resolvedAdvisoryFields` is present but its `snapshotRef` is `undefined` rather than `null` — i.e. a halt whose advisory fields came from a fake or an older shape (`waveExecution.test.js:1251-1256` supplies exactly such an object)? §4.5's condition is stated as "non-`null`", and `undefined !== null`, so a literal reading pushes a notice rendered from `undefined`. A truthiness guard rather than a `!== null` guard is almost certainly intended; naming it in §4.5 would keep the two shipped un-skip fixtures (`waveExecution.test.js:1240`, `:1291`) green without a fixture edit |

## Positive Observations

- **The five-key remedy names the false-green route, not just the edit.** §5.2's "the cheap way green
  under a red wave gate would be to leave `snapshotRef` off the capture-failure `fields`" is the
  sentence that makes the widening un-gameable. An instruction to widen can be satisfied by deletion;
  an instruction that names deletion as the trap cannot.
- **"Counterparties, not bystanders" is the right framing, and it is mechanically true.** `toEqual`
  fails on an extra key exactly as on a missing one, so the red test and the shipped-oracle edit are
  one step. Stating that they land in the *same* task forecloses the follow-up-PR reading that would
  have left the suite red between tasks.
- **The carve-out is as valuable as the inventory.** Saying `waveExecution.test.js` needs no widening
  *and why* (its assertions compare against fields the A6 fake was handed) prevents a widening that
  would have broken two passing tests. I verified both sites; the reasoning holds.
- **`advisoryWaveGateMain.test.js` earns its own row for the DC-07 reason.** The new row keeps the
  real-seam production-path oracle widened while explicitly protecting its `haltReason` containment
  assertion as AT-05-3's surviving oracle — two assertions in one test, one widened and one frozen,
  each labelled.
- **The un-skip answer explains why that one push cannot live in the seam.** "The seam has already
  returned by then" is the correct mechanism, and the choice not to mint an AT id keeps §5.6's
  set-equality at forty-eight rather than trading a coverage claim for a bookkeeping churn.
- **`TEST_GATE_MESSAGE` was corrected in the honest direction.** Rather than defending the name, §4.5
  marks it as §2.3 pseudocode shorthand and restates the oracle in the form the suite ships —
  containment, not equality. A spec that quietly upgrades a shipped containment oracle to an equality
  oracle would have produced an implementer surprise at exactly the wrong moment.

## Recommendation

**Approved with minor changes**

The v5 High is resolved, and resolved in code-checkable terms rather than by assertion: every oracle
the widening touches is named, every carve-out is justified, and every count claim I re-derived from
the suite came out right. Nothing previously approved was reopened. The two remaining findings are
non-gating and both are one-clause edits, best folded into whichever revision PLAN's author touches
next rather than driving a round of their own:

1. **F-01 (Medium)** — state in §4.5 (or §5.6's AT-06-4b cell) that both host fixtures currently take
   `makeA6RunArgs`' `_notice: () => {}` default (`advisoryWaveGate.test.js:996`) and must override it
   with a collector, since AT-06-4b's whole-array negative is vacuous over an array the run never
   wrote to.
2. **F-02 (Low)** — drop or correct the "Four shipped halt-field oracles" numeral in §5.1; the
   enumeration beneath it is complete and lists five sites.

Optionally, answer Q-01 by phrasing §4.5's push condition as a truthiness guard rather than
`!== null`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.14)
**Date:** 2026-08-20
**Iteration:** 5

## Overview

Delta re-review of v1.13 → v1.14 (`033cd093..HEAD`, four content commits, +66/−10), scoped to what
changed: §1 changelog, §2.5's count sentence (line 336), §4.5's artifact table (line 1387), the
five-field bullet (line 1394), the `snapshotRef` render row and its two new contrast rows plus the
AT-05-3 paragraph (lines 1419–1427), §5.2's capture-failure inventory (lines 1571–1581) and the
two-red-wave inventory (line 1647), and §5.6's AT-06-4 / AT-06-4b rows (lines 1879–1880). Sections
approved in rounds v1.2–v1.13 are not re-litigated.

**All three of my v4 findings are resolved**, and the PM's High (unnamed rendering carrier) is
answered with a carrier that exists at HEAD. But the remedy to my own F-01 — turning §5.2's
capture-failure transcription into a **set-equality over five halt-field keys** — collides head-on
with a **shipped set-equality over four keys** in the very fixture file §5.2 names, and nothing in
the document names that shipped assertion as an edit. That is one new High (F-01 below); it is a
defect of this round's delta, not a re-opening of settled ground.

**Prior findings (v4).**

| v4 | Severity | State at v1.14 | Evidence |
|---|---|---|---|
| F-01 stale "four fields" / no positive oracle for `snapshotRef: null` | Medium | **Resolved (text), new consequence** | §2.5 line 336, §4.5 line 1394 and §5.2 line 1575 all read five; §5.2 states set-equality over halt-field keys. See F-01 below for the HEAD collision this creates |
| F-02 conjunct (3) predicate unspecified / echo hazard | Medium | **Resolved** | §5.6 line 1879 pins `expect(notice).toMatch(/overwrit/i)` and `expect(notice).toContain("refs/pdlc/a6-snapshot-" + waveNum)` as **spec-side literals written in the test**, with the `toContain(devModule.SOME_WARNING)` echo named and forbidden |
| F-03 §5.2's mechanical-assertion inventory omits the two arms | Low | **Resolved** | §5.2 line 1581 hosts AT-06-4b; line 1647 hosts AT-06-4 on the two-red-wave run — which also answers my Q-01 |

**Delta code claims, re-verified at HEAD (all true).** `export function renderAdvisoryEntry`
(`pdlc/workflows/orchestrate-dev.js:3605`) and `export function renderEscalationEntry` (`:3743`) are
both present, so a pure sibling adds no module and no file; the sink `const advisoryNotice = (line)
=> notices.push(line)` is at `:14635`; the **halt-path** `buildFinalReport` call does spread
`notices` and does forward `haltAdvisory: err && err.advisory ? err.advisory : undefined`
(`:16049`, `:16068`, `:16072`); `haltError(message, fields)` builds the `Error` from `message` alone
and `Object.assign`s the rest (`:4539-4546`); `haltReason = err.message` (`:15966`). The claim that
no report-to-text renderer exists in `pdlc/workflows` holds — `buildFinalReport` (`:16169`) returns
a plain object, and the shipped halt assertions read it as data
(`waveExecution.test.js:1094`, `advisoryWaveGateMain.test.js:373`). The carrier choice is sound.

## Architecture

The delta moves one thing architecturally: conjunct (3)'s observable surface, from an unnamed
"rendered report string" to a **halt-report `notices` entry** produced by
`renderSnapshotOverwriteNotice(snapshotRef)`. From a test-architecture standpoint this is the right
surface — it is a string (so "adjacent" is meaningful), it rides a field that already exists on the
halt report, and it leaves `haltReason` untouched, so no existing message oracle is disturbed.
`renderSnapshotOverwriteNotice` does **not** exist at HEAD (`grep -rn renderSnapshotOverwriteNotice
pdlc/` returns only this TSPEC), which is correct: it is the thing the PLAN mints. Its two named
siblings do exist, at the line numbers cited above, so the "no new module, no new file" claim (§1.2)
survives.

**The one architectural question the delta leaves open is the push site**, and it is not cosmetic
for testing. §4.5 line 1419 says the notice "is pushed through the sink the tier already owns —
`const advisoryNotice = (line) => notices.push(line)`". That sink reaches A6 as the `_notice`
parameter of `runWaveGateSeam` (`orchestrate-dev.js:3383`, `:15387`), so "pushed through
`advisoryNotice`" reads most naturally as *pushed from inside the seam*. But the document never says
so, and the two readings have different test consequences:

- **Pushed inside the seam.** Then every seam-level fixture that counts notices sees one more.
  `advisoryEscalationLog.test.js:821` asserts `expect(failed.notices).toHaveLength(2)` on a
  `runA6Escalation` run built over a **real** temp repo (`makeRealRepoFixture`, `:634`, `:655`) with
  the tier on and `waveNum: 2`. `captureTreeSnapshot` runs unconditionally before dispatch on that
  path (`orchestrate-dev.js:3403`, guarded only by the tier gate at `:3392`), so the capture
  succeeds, `snapshotRef` is non-`null`, and §4.5's "Every A6-touched halt whose `snapshotRef` is
  non-`null`" makes a third notice due — that shipped exact-count oracle reddens.
- **Pushed at `main`'s halt handler.** Then the seam-level count is safe, but §5.2's capture-failure
  fixture — where the delta puts AT-06-4b — is a **seam-level** run at HEAD (it asserts
  `result.haltFields` off `runWaveGateSeam`: `advisoryWaveGate.test.js:1699`, `:3425`), and a
  seam-level run has no halt report to read `notices` off at all.

Either reading needs a sentence in §4.5 and a consequent edit named in §5.1/§5.2. Filed as F-02.

The rest of the architecture is unmoved: no new double, no new test file, both arms still land in
`advisoryWaveGate.test.js` (§5.1 line 1481), so the same-batch same-new-file authoring guard is
still satisfied — PLAN A6-15 remains the single writer.

## Interfaces

One interface is added by the delta and one is re-asserted; neither is contested.

- **`renderSnapshotOverwriteNotice(snapshotRef)`** (§4.5 line 1419) — pure, one argument, returns
  one string, no call on `null`. As a signature this is testable in isolation and its purity claim
  is checkable the way `PROP-ESC-01` already checks `renderEscalationEntry`'s
  (`advisoryEscalationLog.test.js:177-181`). Two things the TSPEC leaves unstated but which do not
  block: whether it returns `null`/`""` on a `null` argument or is simply not called (line 1419 says
  "no notice is rendered and none is pushed", which reads as *not called* — fine, and AT-06-4b's
  whole-array negative assertion covers both), and whether it is exported (its siblings are; a
  non-exported helper would still be reachable through the seam, which is where both ATs observe it,
  so no finding).
- **`runWaveGateSeam`'s return type** (§4.2 line 826) still carries
  `haltFields: { rootCause, diagnosis, repairApplied, repairPaths, snapshotRef: string | null }` —
  unchanged since v1.12, five members, closed, with `null` (not `undefined`) as the absent value.
  That is the contract F-01 below is about: at HEAD the same seam returns a **four**-key
  `noHaltFields` literal (`orchestrate-dev.js:3386`), which is the implementation the PLAN will
  widen — expected. What is *not* expected is that the shipped tests pin the four-key shape by
  set-equality; see Test Strategy.

`haltError`'s interface is untouched by the design (message + fields), which is precisely why
AT-05-3's message oracle survives — verified at `orchestrate-dev.js:4539-4546` and `:15966`.

## Data Model

§4.5's halt-field set is now internally consistent at five members in all three places I flagged at
v4: the artifact-table row (line 1388) enumerates
`{rootCause, diagnosis, repairApplied, repairPaths, snapshotRef}`, the bullet (line 1394) reads
"five fields", §2.5's back-reference (line 336) carries the correction, and the per-field literal
table gives `snapshotRef` its value on the capture-failure path — `null` (line 1405). The
new artifact-table row for the notice (line 1387) is correctly scoped by a positive **and** a
negative condition ("Every A6-touched halt whose `snapshotRef` is non-`null`; never on `null`
(E-34)"), which is exactly the pair AT-06-4 / AT-06-4b assert.

One data-model claim in the delta is loose enough to note. Line 1427 states the halt reason "stays
byte-identical to `TEST_GATE_MESSAGE`". No such symbol exists in `pdlc/workflows` — `grep -rn
TEST_GATE_MESSAGE pdlc/` matches only this TSPEC (line 531) and two cross-review files. At HEAD the
message is an inline template and the shipped oracles are **containment**, not equality
(`expect(result.haltReason).toContain("Wave 1 test gate failed")`,
`advisoryWaveGateMain.test.js:370`; `.toContain("Error: Wave 1 test gate failed")`,
`waveExecution.test.js:1091`). The argument the paragraph makes is still correct — the warning rides
`notices`, never the message — but it rests on a name the reader cannot resolve, and it calls
AT-05-3 an equality oracle where the shipped ones are containment. Low, filed as F-03.

## Test Strategy

**What the delta got right.** AT-06-4 (line 1879) is now a writable test: it names the surface (the
one `notices` element matching the ref pattern), the mechanics ("assert the overwrite predicate **on
that same element**"), the falsifying condition ("a run in which the two halves land on two
different notices reddens"), the two spec-side predicates verbatim, and the fixture. The anti-echo
rule is stated in exactly the terms my v4 F-02 asked for and names the failure mode it prevents —
`toContain(devModule.SOME_WARNING)` "cannot fail on wording and would neuter AT-06-4b". AT-06-4b
(line 1880) now asserts its negatives **over the whole array** ("so a notice pushed elsewhere cannot
hide") while keeping two positives on the same run, so it is a falsifying arm, not an absence-only
oracle. Fixture homes are stated for both arms, which closes v4 F-03 and answers v4 Q-01 with the
discriminating choice (two-red-wave, where wave-scoping is observable).

**The new problem: the five-key set-equality contradicts shipped four-key set-equalities.**

§5.2 line 1575 now requires the capture-failure fixture to transcribe `rootCause`, `diagnosis`,
`repairApplied`, `repairPaths` **and `snapshotRef: null`** "as a **set-equality over the halt-field
keys**, not a containment check". §5.1 line 1481 assigns that fixture to
`advisoryWaveGate.test.js`. That file is on disk at HEAD (§5.1's own status caveat says so), and it
already contains the opposite oracle:

| HEAD assertion | What it pins |
|---|---|
| `advisoryWaveGate.test.js:2714` | `expect(Object.keys(result.haltFields).sort()).toEqual(["diagnosis","repairApplied","repairPaths","rootCause"])` — a **set-equality over exactly four keys**, on a real-repo run |
| `advisoryWaveGate.test.js:1699` | `expect(result.haltFields).toEqual({rootCause:"unclassified", diagnosis:"snapshot capture failed (snapshot-unavailable); …", repairApplied:false, repairPaths:[]})` — **this is the capture-failure fixture itself**, Oracle G, pinned by `toEqual` to four keys |
| `advisoryWaveGate.test.js:3425`, `:3462` | `expect(result.haltFields).toEqual(ORACLE_G_HALT_FIELDS)`, the same four-key literal declared at `:3369-3375` |
| `advisoryWaveGate.test.js:2676` | `expect(result.haltFields).toEqual({rootCause:"plan-ordering-defect", …})` — four keys, escalation path |
| `advisoryWaveGateMain.test.js:373` | `expect(result.haltAdvisory).toEqual({rootCause, diagnosis, repairApplied, repairPaths})` — four keys, on the **real seam reached from `mainDev`** (the DC-07 production-path test) |

`toEqual` fails on an extra `snapshotRef: null` key exactly as it fails on a missing one — that is
what makes it a set-equality, and it is why these are not incidental. So an implementer who writes
§5.2's red test as specified lands five keys and turns five shipped assertions red, in files whose
required edits the TSPEC does not name (§5.1 gives `advisoryWaveGateMain.test.js` **no row at all**,
and gives `advisoryEscalationLog.test.js` a row covering only AT-06-3 / AT-06-5 / AT-06-6). The
predictable resolution under a red wave gate is the wrong one: keep `snapshotRef` off the
capture-failure `fields` object so the shipped oracles stay green — which deletes the single
positive oracle for `snapshotRef: null` that AT-06-4b's negative arm rests on, and false-greens both
arms. A contract change that is set-equality on both sides has to name its counterparties; this one
does not. **High (F-01).**

The fix is bounded and does not require re-opening the design: add to §5.1 a row for
`pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` (`edited` — the real-seam halt oracle at
`:373` gains `snapshotRef`), extend `advisoryWaveGate.test.js`'s "Carries" cell to say the shipped
four-key halt-field oracles at `:1699`, `:2676`, `:2714`, `:3369` are **widened to five in the same
task that widens the production `fields` object**, and state in §5.2 that the five-key set-equality
replaces the four-key one rather than joining it. Naming them is also what keeps the widening
honest: `:2714` is the only place a *key set* is asserted, so it is the assertion that must move.

**Push-site consequence (F-02).** As §Architecture sets out, the document does not say whether the
notice is pushed inside `runWaveGateSeam` (through its `_notice` parameter, `:3383`) or at `main`'s
halt handler. On the first reading `advisoryEscalationLog.test.js:821`'s
`expect(failed.notices).toHaveLength(2)` — an exact count on an A6 escalation over a real repo where
the capture succeeds (`orchestrate-dev.js:3403`) — becomes a third-notice failure that no §5.1 row
owns. On the second reading, AT-06-4b's stated home is a seam-level fixture with no report to read.
One sentence in §4.5 naming the push site, plus the consequent §5.1 note, resolves both. Medium: it
does not by itself defeat an oracle, but it decides which shipped test the wave breaks.

**Unchanged and still sound.** §5.6's set-equality claim over the AT set is unaffected by this round
(no AT was added or removed; `grep -c '^| AT-'` over FSPEC §6 and §5.6 still agree at forty-eight /
forty-seven-plus-AT-06-4b). §5.2's snapshot/restore hash-map oracle, the `commit-tree === 1`
capture-uniqueness count, and AT-07-1's BR-partition set-equality are untouched and were approved in
earlier rounds. No delta row introduces an implementation echo, an absence-only oracle, or a
containment check where the enumeration demands equality — with the single exception that F-01 is
the mirror image of: an equality check the document demands without reconciling the equality checks
already in the file.

## Open Questions

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

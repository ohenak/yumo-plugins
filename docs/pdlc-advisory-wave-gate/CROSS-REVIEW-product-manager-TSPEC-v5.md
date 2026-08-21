# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.14)
**Date:** 2026-08-20
**Iteration:** 5 (delta re-review)
**Delta reviewed:** `033cd093..HEAD` (5 commits, 66 insertions / 10 deletions)

## Scope

This is a delta re-review, not a fresh read. My v4 closed **Needs revision** on one High
(F-01, §5.6's AT-06-4 stated conjunct (3)'s oracle over a "rendered report string" that did not
exist at HEAD) and one Medium (F-02, "§4.5's four fields" stale in three places while the table
enumerates five). This round is five commits — `fb39c088`, `40835acb`, `0ffb72af`, `e3fcbce8`,
`6f00074c` — touching only §2.5's changelog line, §4.5's artifact and `snapshotRef` contract
tables, §5.2's two fixture inventories, §5.6's AT-06-4 / AT-06-4b rows, and the lineage header /
changelog. I read only those sections plus the production code they now cite; sections approved in
earlier rounds that this delta did not touch are not re-litigated.

Every production symbol the new prose names was checked against HEAD rather than against the
document's own account of it.

## Prior findings disposition

Both resolved, and the High is resolved on the merits rather than by reword — the carrier the
delta names is a real, reachable seam at HEAD.

| Prior | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| v4 F-01 | High | **Resolved** | §4.5 now names the surface: a halt-report `notices` entry produced by `renderSnapshotOverwriteNotice(snapshotRef)`, "a pure sibling of `renderEscalationEntry` / `renderAdvisoryEntry`" (TSPEC `:1419`). Both siblings exist and are exported: `export function renderAdvisoryEntry` (`pdlc/workflows/orchestrate-dev.js:3605`), `export function renderEscalationEntry` (`:3743`) — so the "no new module, no new file" §1.2 constraint holds. The sink exists: `const advisoryNotice = (line) => notices.push(line)` (`orchestrate-dev.js:14635`), over `notices` declared in `main` (`:13051`). It is **reachable from the A6 path specifically**: the wave-gate seam call site passes `_notice: advisoryNotice` (`:15387`), and the halt it guards throws four lines later (`:15389-15399`). And the array reaches the **halt** report, not only the success one: the halted-path `buildFinalReport({ … notices, … })` call inside the top-level catch (`catch (err)` at `:15957`, call at `:16049`, `notices` at `:16059`) passes the same array. The claim that no report-to-text renderer exists is also still true, so the contrast rows are honest. |
| v4 F-02 | Medium | **Resolved** | §4.5's bullet now reads "five fields … count corrected from four at v1.14" (TSPEC `:1393`), and §5.2's load-bearing fixture line now enumerates all five at their literal values with `snapshotRef: null` explicit (`:1573-1576`). The one surviving "four fields" string (`:335`) is a historical changelog line about the v1.11 finding and now carries an inline correction parenthetical — that is the honest form, not residue. |

## New findings in changed sections

Nothing in the delta reopens an approved section, and no product decision was invented at TSPEC
altitude: the carrier is a mechanism choice (the "same report, same place" observable FSPEC
`:476-478` states is unchanged), and TE Q-01's answer still stands — no verbatim sentence is minted
here, only a `/overwrit/` stem predicate written test-side. Two Low citation/arithmetic items.

### `TEST_GATE_MESSAGE` is cited as a symbol that HEAD does not have (F-01, Low)

The new AT-05-3 survival paragraph asserts the halt reason "stays byte-identical to
`TEST_GATE_MESSAGE`" (TSPEC `:1427`). At HEAD there is no such constant anywhere in `pdlc/` —
`grep -rn TEST_GATE_MESSAGE pdlc/` returns nothing. The real thing is a function-local template
literal, `const testGateMessage = \`Error: Wave ${waveNum} test gate failed — …\`
(`orchestrate-dev.js:15359-15361`), thrown at `:15399`. The substance of the claim is correct —
`haltError` builds the `Error` from `message` alone and the handler sets `haltReason = err.message`,
so a `notices` push cannot touch it — and §2.3's pseudocode (`:531`) already uses the upper-case
name as a stand-in, so this is a naming convention carried into prose, not a wrong claim about
behavior. Still worth one word: prose that names a symbol reads as a citation, and an implementer
grepping for `TEST_GATE_MESSAGE` finds nothing. Fix: write "the wave's own
`Wave N test gate failed` literal (`testGateMessage`, built per-wave)" or mark the pseudocode name
as such.

### §5.2's "Six positive assertions" count is stale after this round's additions (F-02, Low)

The capture-failure fixture bullet still concludes "Six positive assertions on one fixture, not an
absence check" (TSPEC `:1582-1583`) after this round added, to that same fixture, (a) the
set-equality over the five halt-field keys and (b) AT-06-4b's whole negative arm over `notices`
(`:1573-1582`). This document maintains its arithmetic elsewhere — v1.13 updated §5.6's
"forty-seven → forty-eight" in the same edit that added a row — so the stale six is a local
exception, not the house style. It is also mildly self-undercutting: the sentence's point is that
the fixture proves things happen rather than that nothing happened, and the round just strengthened
exactly that. Fix: restate the count, or drop the numeral and keep the claim.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §4.5's new AT-05-3 survival paragraph (`:1427`) cites `TEST_GATE_MESSAGE` as a production symbol; no such constant exists at HEAD (`grep -rn TEST_GATE_MESSAGE pdlc/` — no matches). The message is a per-wave local template literal, `orchestrate-dev.js:15359-15361`, thrown at `:15399`. The behavioral claim is correct; the symbol name is not. Fix: name the literal as §2.4/§5.6 do, or mark the upper-case name as pseudocode shorthand. | AC-6.3 (REQ v1.16), AT-05-3 |
| F-02 | Low | Local | §5.2's capture-failure bullet still ends "Six positive assertions on one fixture" (`:1582`) after this round added the five-key set-equality and AT-06-4b's negative arm to that fixture (`:1573-1582`). Fix: recount or drop the numeral. | AC-6.3, FSPEC E-34 / AT-06-4b (`FSPEC:479-483`) |

## Questions

## Positive Observations

## Recommendation

## Verdict

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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

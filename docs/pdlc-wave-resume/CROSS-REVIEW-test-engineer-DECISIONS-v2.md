# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1)
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review — my v1 findings, the sections the v1.1 diff changed, and nothing else.

## Verification Method

Delta scope: `git diff 2819618b..HEAD -- docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md`
(111 insertions, 35 deletions), where `2819618b` is the commit carrying my v1 review. The branch
still carries neither the mechanism nor the wave-gate baseline, so — as in v1, and as the document's
own Verification frame states — every counted claim was re-derived against `origin/main` at
`345ae358` (`git cat-file -t 345ae358` -> `commit`), citing by exported symbol, enclosing test or
comment text per DEC-DOC-01, with line numbers as locators only.

**Every counted claim the revision restates now re-derives.** These are the claims my v1 Highs and
Mediums were about; each was re-run, not read:

| Restated claim (v1.1) | Command / anchor at `origin/main` `345ae358` | Result |
|---|---|---|
| Regression net is **26 cases (18 / 4 / 4)**, `it.each` members counted individually | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")`: 14 `it` + one four-member `it.each` = 18; `describe("Phase I — implementation.startWave resumes a halted run")`: 4 `it`; `describe("computePlanHash — the ledger's plan fingerprint")`: 4 `it`. 23 statements / 26 cases | correct |
| The `implementation.startWave` block is the pointer's own four cases, and `it("an explicit implementation.startWave outranks the ledger")` lives in the ledger `describe` | the four titles are skip-before-pointer, past-the-end, default, invalid; the interaction test sits inside the ledger block | correct — the v1 mischaracterisation is gone |
| The decision chain is **48 lines** | `if (ledger.reason) {` at `:15297` through the final `else`'s closing brace at `:15344` = 48 | correct |
| The enclosing read block is **84 lines** | `if (!explicitPointer) {` `:15263` through its close `:15346` = 84 | correct — **and it corrects my own v1 figure of 81**, which was three short |
| `main()` destructures **36 parameters, 34 of them injected seams** | the destructured list at `export default async function main({` `:12992`: `reqPath`, `forcePhases`, then 34 underscore-prefixed entries ending `_provenance` | correct; the "35th seam / 37th parameter" denominator in O-3 and DEC-WVR-02 follows |
| `orchestrate-dev.js` is the largest tracked **source module**, second overall behind generated `dist/pdlc-cli.mjs` | `git ls-tree -r -l origin/main \| sort -k4 -n -r \| head -3` -> 738,924 `dist/pdlc-cli.mjs`; 734,711 `orchestrate-dev.js`; 314,472 a document | correct |
| `formatWaveLedger` always emits `{version, feature, planHash, lastGreenWave}` (+ `head`) | `:12325-12331`, the two literal record shapes | correct |
| `parseWaveLedger` never reads `parsed.version`; well-formedness is over `feature`, `planHash`, `lastGreenWave` only | `:12281-12295` | correct — DEC-WVR-05's new "written, not gated on" sentence is exact |
| `over-count` is **not** in `ANCESTRY_INDEPENDENT_CODES`, so an over-count record re-classifies to `head-unreachable` | TSPEC `:168` and `:445-447` list `{null, "unreadable-json", "not-an-object", "wrong-shape", "feature-mismatch", "plan-changed"}`; shipped guard order puts ancestry `:15307` above over-count `:15313` | correct |

New claims introduced by the revision, all re-derived and all accurate: the invalid-value notice is
emitted by a **key-generic** loop (`for (const key of implParsed.invalidKeys)` at `:15093` and
`:15185`, one templated `emit` shared by every `implementation` key) and `parseImplementationConfig`
replaces a rejected `startWave` with `IMPLEMENTATION_DEFAULTS.startWave` (`:234-242`), so
`const explicitPointer = startWave > 1` (`:15236`) is **false** by the time the ledger block runs;
the past-the-end path keeps `explicitPointer` **true** because it is computed before the clamp; and
`describe("Phase I — the script-owned test gate")` really does carry two whole-string `phaseDetail`
equalities on wave-1 runs (`All 1 waves complete (wave mode, script-owned gate)` and
`(wave mode, self-report gate)`), which the `N > 1` condition is what keeps green. TSPEC §2.4's
report-row table already carries the same `N > 1` condition ("Executed from wave 1, no resume …
unchanged"), so the decision and its upstream agree rather than diverge.

## Resolution of v1 Findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

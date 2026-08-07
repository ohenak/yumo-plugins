# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md (v1.8)
**Date:** 2026-08-06
**Iteration:** 9
**Type:** Delta confirmation — erratum round 8 only
**Scope:** the erratum edit `a3049d1f..HEAD` (§3.2's `CLAUDE.md` row, §11.3(c)'s third scan axis, §12.2's T-11/T-12/SKILL.md/CLAUDE.md rows, §12.3's register re-measurement and three id assignments). Sections outside that diff are not re-reviewed and stand approved from v8.

## 1. Erratum items — disposition

Every item was checked against the sources it cites, not against the document's account of them.

| # | Erratum item (raiser) | Disposition | Evidence I re-derived |
|---|---|---|---|
| 1 | §12.3 omits AT-M11 / AT-Q13 / AT-R7 (pm-review, se-author, te-review) | **Resolved** | All three now appear in §12.3's assignment table, each in exactly **one** file row: `AT-M11` → `consolidationPass.test.js` (`TSPEC:2446`), `AT-Q13` and `AT-R7` → `consolidationRoute.test.js` (`:2451`). No id is assigned twice. |
| 2 | §12.3 fixes the register at "96 ids, measured at v11.1"; FSPEC is v11.3 (pm-review, se-author, te-review) | **Resolved, and independently confirmed** | I re-enumerated `AT-…` tokens over FSPEC §13 (`:2041-2191`), de-duplicated: **99**. I then extracted the ids from §12.3 (`TSPEC:2426-2488`), de-duplicated: **99**, and diffed the two sets — **empty in both directions**. The claimed number and the claimed set equality both hold at HEAD. |
| 3 | §12.3 leaves three registered ATs with no test level and no test file (te-review) | **Resolved for two of three; see F-01 for AT-M11** | AT-Q13 and AT-R7 have a file, a level (L2) and a stated fixture set. AT-M11 has a file and a level, but no fixture that can pass — F-01. |
| 4 | §3.2 omits `CLAUDE.md` (se-author, twice) | **Resolved** | §3.2 gains the row (`TSPEC:145`). The premise checks out at HEAD: `git ls-files pdlc/workflows/dist/` returns four paths, `CLAUDE.md:58-60` enumerates three, and `:62` reads "Those three are the tracked, shipped outputs". |
| 5 | §3.2's two `SKILL.md` edits have no falsifying test (se-author) | **Resolved** | §12.2 gains the row assigning four verbatim source-text conjuncts (two per file) to `consolidationBuild.test.js`, located by heading rather than line index. The premise checks out: `__tests__/skillFiles.test.js:13-17` is a three-member `reviewSkills` literal covering `se-review` / `te-review` / `pm-review` only, and every assertion in that file is about `VERDICT` trailers these two authoring skills do not carry — the reason given for not widening it is correct. |
| 6 | §11.3(c) names two scan axes and misses `BUNDLES` (se-author) | **Resolved; every citation verified** | `runtimeBundle.test.js:26` is the two-member `BUNDLES` literal. It drives `describe.each` at `:503` (launcher constraint) and `:509` (structural), `it.each` at `:549` (sole output directory) and `:1044` (`RLH-AT-19` no-`process`/no-`fetch`), the drift-perturbation loop at `:1290`, and is spread at `:1584` (`ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]`). "Exempt from all six" is accurate. |

Two structural properties of the edit are also worth recording, because they are the ones an
erratum landing most often gets wrong:

- **T-11 and T-12's interim `(no FSPEC AT)` cases were re-labelled, not duplicated.** §12.3's
  `consolidationRoute.test.js` row no longer carries a `(no FSPEC AT)` clause, and neither AT-Q13
  nor AT-R7 is written twice. This is exactly what the v1.7 rows said would happen, so the round
  trip closed as designed.
- **The register-size number is stated as a reader's summary, not as the mechanism.**
  `consolidationTraceability.test.js` re-derives both sides at run time, so a fourth drift reds
  rather than requiring another erratum. That is the right place to put the guarantee.

## 2. Findings

## 3. Questions

## 4. Positive Observations

## Verdict

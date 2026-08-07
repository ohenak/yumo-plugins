# Cross-Review: product-manager — TSPEC (delta confirmation, erratum round 8)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Delta confirmation only — the erratum-round-8 edit (`a3049d1f..HEAD`, TSPEC v1.7 → v1.8). Sections untouched by that diff were approved at v8 and are not re-reviewed.

## Delta verified

Each erratum item, checked against the diff and against the cited primary sources rather than against the edit's own summary.

| # | Erratum item (raiser) | Where it landed | Independent check | Resolved |
|---|---|---|---|---|
| E-1 | §12.3 omits `AT-M11`, `AT-Q13`, `AT-R7` (pm-review, te-review, se-author — four raises, one defect) | §12.3 file table: `AT-M11` added to `consolidationPass.test.js`, `AT-Q13` + `AT-R7` added to `consolidationRoute.test.js` (`TSPEC:2445`, `:2451`) | Extracted the `AT-…` token set from FSPEC §13 (`:2041-2191`, de-duplicated) and from §12.3's file table, and diffed the two sets **both directions**: `comm` returns empty on both sides. Set equality holds at 99, so no register id is unassigned and no file claims an id the register does not carry | Yes |
| E-2 | `:2395` fixes the register at "96 ids, measured at v11.1"; FSPEC is v11.3 (`:12`) and re-enumeration gives 99 (pm-review, se-author, te-review) | `TSPEC:2436-2442` now reads "**99** ids, measured at **v11.3**", names the three added ids, dates the measurement, and states the number is a reader's summary that `consolidationTraceability.test.js` re-derives at run time | FSPEC's `Version` cell reads `11.3` (`:12`); my own de-duplicated enumeration over `:2041-2191` returns exactly 99. No stale `96` survives anywhere in the TSPEC except the two places that explicitly label it as the superseded measurement (`:15`, `:2437`) — which is the correct treatment, not residue | Yes |
| E-3 | AC traceability of the three new ids | §12.2 T-11 cites `AT-Q13` at `FSPEC:2126` → AC-3.2 (`:2320`); T-12 cites `AT-R7` at `FSPEC:2106` → AC-1.4 (`:2312`); §12.3's `consolidationPass.test.js` row cites `AT-M11` → AC-1.3 | Read all three FSPEC register rows and all three §15 map rows. Every citation is correct as written — AC-1.3 lists `AT-M11`, AC-1.4 lists `AT-R7` "(the 'only when' half of §5.3)", AC-3.2 lists `AT-Q13` "(the body obligations)" | Yes |
| E-4 | The two interim `(no FSPEC AT)` cases must become the new ids, not duplicates of them | §12.2 T-11/T-12 re-label their interim cases `AT-Q13`/`AT-R7` in place; §12.3's route row states "This row's `(no FSPEC AT)` clause is therefore gone" | Neither id is written twice: the route row carries each once, and no second case for the same subject survives elsewhere in §12.2/§12.3. This is the outcome the v1.7 rows themselves predicted, so the round trip closed as designed rather than by re-litigation | Yes |
| E-5 | §3.2 omits `CLAUDE.md`, whose `:62` is already false at HEAD (se-author, ×2) | New §3.2 row (`TSPEC:148`) — adds the missing bullet **and** rewrites `:62` to a count-free sentence, with the reasoning that a `three` → `four` substitution would go stale on the next artifact | `git ls-files pdlc/workflows/dist/` returns **four** paths (`distribution-manifest.json`, both bundles, `pdlc-cli.mjs`) against three bullets at `CLAUDE.md:57-59`, and `:62` reads "Those three are the tracked, shipped outputs". The premise is exactly as stated; the count-free rewrite is the fix that does not recur | Yes |
| E-6 | Both `SKILL.md` production edits have no falsifying test (se-author) | New §12.2 row (`TSPEC:2401`) — four verbatim conjuncts, two per file, located by surrounding heading and never by line index, asserted to occur exactly once each; assigned to `consolidationBuild.test.js` in §12.3 (`:2457`) | `__tests__/skillFiles.test.js:12-16` is indeed a three-member `reviewSkills` literal (`se-review`, `te-review`, `pm-review`), and every assertion in it is about `VERDICT` trailers. The TSPEC's reason for *not* widening that list — these are authoring skills that must not carry a `VERDICT` trailer, so widening would force a per-member conditional — is correct on the shipped source | Yes |
| E-7 | §11.3(c) names two L3 scan axes and misses the `BUNDLES` third (se-author) | §11.3(c) opener rewritten to "a set over **three** axes, and all three must grow" (`:2187`), plus a new paragraph enumerating the six suites `BUNDLES` drives (`:2199-2216`) and the set-equality falsifier for the omission | `__tests__/runtimeBundle.test.js:26` is the two-member constant as described. The consequence the TSPEC states — a shipped bundle absent from `BUNDLES` is exempt from all six suites because none of them ever names it — follows from the constant being the `describe.each` key, and the fix is asserted (manifest ↔ `BUNDLES` set equality) rather than left as an instruction | Yes |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **§12.2's closing paragraph (`:2417-2424`) still describes the superseded state.** The paragraph immediately below the corrected one reads "Both register gaps above describe things an operator reads directly … so each **now carries a (no FSPEC AT) case**". After this erratum both gaps carry register ids (`AT-Q13`, `AT-R7`), and §12.3's route row states in terms that "This row's `(no FSPEC AT)` clause is therefore gone". The preceding paragraph (`:2409-2415`) was correctly rewritten to record the landing; this one was not, so the section now says both things about the same two cases. No product consequence — the id-bearing rows are the ones a PLAN task reads, coverage is unchanged either way, and §12.3's set equality is unaffected — but an implementer who reads only the summary paragraph would write the two cases without claiming their ids, which is the exact state the erratum removed. Suggested repair: re-cast the paragraph in the past tense (the gaps *were* covered by local cases while the erratum was outstanding; the cases now carry the ids), preserving the principle it exists to state | AC-1.4, AC-3.2 |

Nothing else. No High or Medium finding — no acceptance criterion is narrowed, dropped, or reinterpreted by this delta, and no previously approved section is contradicted on substance.

## Questions

## Positive Observations

## Recommendation

## Verdict

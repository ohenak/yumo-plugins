# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.4)
**Upstream re-read:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10, HEAD)
**Date:** 2026-08-19
**Iteration:** 6 (delta re-review)

## Scope

Delta re-review of the single v5 finding (F-01, High) and the two Low findings, against the one
commit that landed them: `ff07bc84` "docs(decisions): re-derive both literal enumerations from
HEAD (v5 findings)". Taken from `git diff 082be248 HEAD` on the document — 56 insertions, 30
deletions, all inside the "Consequences / sizing" bullet block (lines 348–411). The four decisions
(DEC-A6-01 … DEC-A6-04) are byte-identical to the round I approved on substance; I did not
re-litigate them.

I re-read my v5 cross-review first, then re-derived every repository claim the changed block makes
against HEAD: both literal enumerations by grep, the five envelope transcriptions read in context
to test the new "none of these is an oracle" claim, `advisoryConfig.test.js`'s use of its own
`ADVISORY_DEFAULTS`, and TSPEC §1.3's drift table. Where the document asserts a test is or is not
red today, I ran the suite rather than reasoning about it.

All three v5 findings are resolved, including the blocking one: the seam enumeration is now
re-derived and set-equal to HEAD. What blocks this round is new: the round's own new material —
the "only one oracle" bullet and the already-migrated bullet — asserts that
`advisoryConfig.test.js`'s six-member envelope "is never compared to anything" and that
`advisoryEnvelope.test.js` carries the only envelope oracle that fails on drift. Both are false at
HEAD, and measurably so: `PROP-CFG-02` deep-equals that literal against production output and is
red today on `E-5`/`E-6`.

## Verification performed (measured at HEAD)

| Claim in the changed block | Measured at HEAD | Verdict |
|---|---|---|
| Seam literal `["A1" … "A5"]` survives at **exactly one** site: `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` in `PROP-SUM-01` (line 359–363) | `grep` finds one test-side five-member site, `advisoryRecord.test.js:496`, inside the `PROP-SUM-01` describe opened at `:491` | holds |
| The five sites v1.2 listed beside it already read `["A1" … "A6"]` | `advisoryEnvelope.test.js:317`, `advisoryRecord.test.js:544` (`test.each`), `advisoryHarvest.test.js:580`, `consolidationProperties.test.js:250`, `helpers/advisoryDoubles.js:354` — set-equal, no sixth | holds |
| TSPEC §1.3's per-seam-report-rows row singles that site out as "the one test-side literal not yet transcribed" | `TSPEC…md:304` reads exactly that | holds |
| Envelope: production definition `ENVELOPE_DEFAULTS` in `orchestrate-dev.js` | `orchestrate-dev.js:1942`, four members | holds |
| Envelope: **five** four-member test-side transcriptions — `advisoryDisabled`'s `disabledConfig()` fixture and its inline enabled-config object, `advisoryHarvest`'s config fixture, `ADVISORY_DEFAULTS_SHAPE` and the generator shuffle in `advisoryDoubles` | `advisoryDisabled.test.js:136` (`disabledConfig()` at `:131`), `:623` (inline `runScenario` config), `advisoryHarvest.test.js:203` (`makeDevReadFile`), `helpers/advisoryDoubles.js:325`, `:423` — set-equal, no sixth | holds |
| Envelope: a **sixth site is prose**, the `advisoryDoubles` hand-sync comment | `helpers/advisoryDoubles.js:317` | holds |
| **"None of those five transcriptions is an oracle" — each is an input** (line 375–377) | Read in context: `:136`/`:623`/`:203` are config text fed to the code under test; `:325` is a frozen double shape; `:423` is a generator's shuffle input. None appears on the expected side of an assertion | holds |
| **"The only envelope oracle that fails on drift is `advisoryEnvelope.test.js`'s `[...ENVELOPE_DEFAULTS].sort()` equality"** (line 378–379) | `advisoryConfig.test.js:135` and `:143` also compare production output against a six-member envelope literal (`:51`) and fail on drift | **fails** (F-01) |
| **"`advisoryConfig`'s six-member envelope is never compared to anything — `PROP-CFG-01` asserts that file's key set, its `waveBudgetPerRun` value, and key-set equality against `parseAdvisoryConfig(null)`, never the envelope's members"** (line 392–394) | `PROP-CFG-01 (A6-02)` (`:103`–`:119`) is described correctly, but `PROP-CFG-02` (`:127`–`:147`) deep-equals the whole literal, envelope included | **fails** (F-01) |
| "Only the first of those two asserts against production and is therefore red today" (line 391–392) | `node --experimental-vm-modules node_modules/jest/bin/jest.js __tests__/advisoryConfig.test.js`: all five `PROP-CFG-02` cases red, diff reads `- "E-5", - "E-6"` — red *on the envelope members* | **fails** (F-01) |
| TSPEC §1.3's `ADVISORY_DEFAULTS` row records a *different* drift and says nothing about that file's envelope member | `TSPEC…md:303` records only `waveBudgetPerRun: 1` vs an absent production key | holds (and see ERRATUM) |
| "Three production constants" — `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS` | `orchestrate-dev.js:1951`, `:1942`; `ADVISORY_DEFAULTS` not yet exported (A-17), as the doc's own §3.1 pointer says | holds |

## Resolution of v5 findings

| v5 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-01 — seam enumeration stale, five of six sites already migrated | High | **Resolved** (`ff07bc84`) | Lines 359–363 now say "survives at one site, not six" and name `advisoryRecord.test.js`'s `rows.map` equality; the five migrated sites are folded into the already-migrated bullet at lines 385–389. I re-grepped: set-equal to HEAD, no seventh site. Line 405–408 also re-states the old "roughly a dozen transcriptions" figure as re-derived and says why the old one was inflated — more than I asked for |
| F-02 — "§1.3 records them as drift rows" over-attributed | Low | **Resolved** (`ff07bc84`) | Lines 394–398 now attribute the `ENVELOPE_DEFAULTS` row alone to §1.3 and mark the `advisoryConfig` observation as "this record's own and not §1.3's". Verified against `TSPEC…md:302`–`:304` |
| F-03 — "seven, not six" holds over a differently-composed seven | Low | **Resolved** (`ff07bc84`) | Lines 372–374: "The count is unchanged at seven since v1.2 but its members are not — the production definition enters as the already-migrated `advisoryEnvelope` assertion leaves" |
| v5 Q-01 — defer live counts to §1.3's tables | — | Answered by choosing the other option | The round kept site-by-site counts and re-derived them instead. That is a legitimate answer; F-01 below is the cost of it landing again |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

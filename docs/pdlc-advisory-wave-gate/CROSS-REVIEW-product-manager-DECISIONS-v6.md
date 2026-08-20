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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The round's two new "oracle" claims are false at HEAD: `advisoryConfig.test.js`'s six-member envelope *is* compared against production, and it *is* red today on exactly the envelope members.** Line 378–379 states "the only envelope oracle that fails on drift is `advisoryEnvelope.test.js`'s `[...ENVELOPE_DEFAULTS].sort()` equality, and that one is already at six", and lines 391–394 state "Only the first of those two asserts against production and is therefore red today (TE v5 F-02); `advisoryConfig`'s six-member envelope is never compared to anything — `PROP-CFG-01` asserts that file's *key set*, its `waveBudgetPerRun` value, and key-set equality against `parseAdvisoryConfig(null)`, never the envelope's members." The `PROP-CFG-01` description is accurate as far as it goes (`advisoryConfig.test.js:103`–`:119`), but it is not the only consumer of that literal: `PROP-CFG-02` deep-equals the whole object — `expect(config).toEqual(ADVISORY_DEFAULTS)` at `:135` and `:143`, against the six-member literal declared at `:51` — for five inputs (absent file, no advisory section, unparseable JSON, top-level array, non-object section). Run at HEAD, all five are red and the diff is precisely `- "E-5", - "E-6"`. So both already-migrated envelope sites assert against production, both are red today, and both go green when `ENVELOPE_DEFAULTS` grows — not one. Two consequences for the reader this record is written for. First, it is the second sentence of a bullet whose job is to tell PLAN which surfaces gate A6; a decision record that names the gating oracles and misses one is exactly the "partial edit the set-equality discipline exists to catch" that the bullet below warns about — an implementer who lands A6 and sees `advisoryConfig` go from red to green has no entry here that predicted it. Second, it undercuts the immediately preceding bullet's genuinely useful distinction (five inputs, no gate demands their edit) by pairing it with a false "only one oracle" absolute: the input/oracle split is right, the enumeration of oracles is not. Note this is the same defect class as v5 F-01 and v4 F-03 — a live repository count re-asserted in this paragraph without re-derivation — and my v5 verification table had already recorded `advisoryConfig.test.js:51` as "deep-equalled against production output `:135`, `:143`", so the correct reading was on the record before this edit. **Fix:** at lines 378–379, say the envelope has **two** oracles that fail on drift, `advisoryEnvelope.test.js:284` and `advisoryConfig.test.js`'s `PROP-CFG-02` deep-equal (`:135`, `:143`), both already at six; at lines 391–394, replace "Only the first of those two asserts against production … never the envelope's members" with the measured statement — both assert against production, both are red today, `advisoryConfig`'s by way of `PROP-CFG-02`'s deep equality rather than a dedicated envelope assertion. The sizing arithmetic in the closing bullet (three production constants, one gated test-side literal edit, six hand-copy surfaces) survives unchanged: neither oracle needs an edit. | TSPEC §1.3, §3.1; Team Principle 3 (traceability) |
| F-02 | Low | Process | **Third consecutive round in which this one paragraph shipped a repository claim that grep or a test run falsifies.** v4 F-03 (envelope enumeration), v5 F-01 (seam enumeration), now F-01 (oracle enumeration) — each time the surrounding prose was re-derived and one adjacent assertion was carried over on memory. The document is a decision record whose durable content is the *reasoning* (co-movement of three constants, shared-double coupling, one-task sequencing); the live counts belong to TSPEC §1.3, which is regenerated as the repo moves. Worth a harvest note: when a DECISIONS bullet restates counts a sibling doc already carries, every count in the bullet must be re-derived in the same edit, or the bullet should cite the sibling instead. This is the reusable half of my v5 Q-01. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The input/oracle distinction this round introduces (line 375–384) is the most useful thing in the bullet — it separates "a gate demands this edit" from "a later editor must not misread this copy". Would you carry it into the closing size line as an explicit two-column hand-off, e.g. *gated edits: three production constants + `advisoryRecord.test.js:496`; ungated hand-copies: five envelope inputs + one comment; oracles that flip red→green with no edit: `advisoryEnvelope.test.js:284`, `advisoryConfig.test.js` `PROP-CFG-02`*? The third column is the one F-01 is about, and naming it as its own category would make the omission structurally hard to repeat. |
| Q-02 | Carried from v5 Q-02, still not a finding: `pdlc/workflows/dist/pdlc-cli.mjs` carries the same literals but moves by regeneration under the wave gate's `postWaveCommand` (CLAUDE.md, DEC-08). A single clause saying so would stop a PLAN reader who sees `dist/` in the A6 diff from wondering whether it was a missed hand-edit. |
| Q-03 | All four decisions (DEC-A6-01 dangling-commit capture, DEC-A6-02 separate `commitPaths` call, DEC-A6-03 wave-scoped ref, DEC-A6-04 `nonNegativeInt`) are unchanged for the third round. I re-checked each against TSPEC v1.10: no rejected option has become reachable, no chosen mechanism has lost its upstream basis. OQ-7 remains the single live upstream dependency. No question — recorded so the next reviewer need not re-derive it. |

## Positive Observations

- **The blocking finding was closed by fixing the cause, not the sentence.** v5 F-01 asked for the
  seam half to be re-derived; the round re-derived both halves, then said in-line *why* the two
  tenses diverged ("v1.2 sized the seam half against a pre-`e3b9d5a3` repository, and v1.3
  re-derived only the envelope half"). Naming the failure mode in the record is what stops it
  recurring — which is why F-01 above is worth raising rather than waving through.
- **The input/oracle split is a real product insight, not a bookkeeping fix.** "None of those five
  transcriptions is an oracle … so when `ENVELOPE_DEFAULTS` grows to six members all five stay
  green and no gate demands their edit" is the sentence that changes what PLAN does: it converts
  five apparent edits into five read-and-check surfaces, and it says what goes wrong if they are
  skipped ("a stale copy silently re-scopes a fixture instead of reddening a suite"). I verified
  all five in context and the claim holds exactly.
- **"An implementer sizing A6 off the older wording would budget five edits no gate asks for."**
  The record now states the cost of its own previous revision in user terms. That is the standard
  I want decision records held to, and it is rarer than it should be.
- **The re-derived total replaced the old figure honestly.** Line 408 does not quietly drop
  "roughly a dozen transcriptions"; it names it as v1.3's figure and says what inflated it. A
  reader who remembers the old number learns why it changed instead of wondering which is right.

## Recommendation

## Verdict

# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-merge-phase/PROPERTIES-pdlc-merge-phase.md` (v1.0, commit `bbd22e0`)
**Read against:** FSPEC v1.3, TSPEC v1.2, PLAN v1.1 (all approved)
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** Technical lens only — implementability of each property through the TSPEC's declared
seams and exports, soundness and cost of the stated domains, fidelity of the seeded-generator design
to the `driftGenerators.js` idiom it cites, whether each named mutation target would actually red,
and whether any oracle is circular. Test-pyramid placement and product framing are out of my lens.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **`D_core`'s stated product and its stated size differ by 34×, and the product is not affordable.** §2 defines the shared axis product as `mergeMode 3 × prUrl 2 × o1 7 × ci 5 × o3 4 × o4 3 × o5 4 × caps 8 × attempt 2` — that is **161 280** cases, not §7's `enum(≈4 800)` (or `≈3 000` for PROP-M-03). The two cannot both stand, because §1.2 rule 2 makes the case count a **mandatory assertion** ("each `enum(n)` row states its *n* and the suite asserts its own case count"), so an implementer cannot write the assertion at all. The gap is not cosmetic: at face value PROP-M-02 clones and double-evaluates every case, PROP-M-03 crosses each reaching case with five degradations and PROP-M-04 decides each twice, so the five decision-core properties come to ~1.6 M `decideMerge` evaluations plus jest matchers — the "suite-breaking cost" bar. Either state the reachability-pruning rule that reduces the product to ≈4 800 (and say it is *proved* by the pruning predicate rather than by enumerating what §2 currently promises to enumerate), or narrow the axes and restate the numbers | §2, §7 rows M-01…M-05 |
| F-02 | Medium | Local | **Named mutation target 3 — "the CI rule's single relaxed cell" — is killed by no property in this document.** The relaxed cell exists only at `(ci: none, mergeRequiresCi: false)` (FSPEC §5, TSPEC §5.4), but `mergeRequiresCi` is **not an axis of `D_core`** (§2 lists nine axes, all from TSPEC §2.4's *record* shape plus `mergeMode`), so PROP-M-01/-03/-04/-05 never evaluate the CI rule with it `false`. The one property that does vary it, PROP-M-06, fixes `O5` to a guard-matching path, so every case resolves at row 4 — TSPEC §5.3 guard 7 — **before** guard 11 evaluates the CI rule at all. A mutant that relaxes `pending` (or `failed`) instead of `none` therefore survives the whole suite. §8.5 states "a survivor is a defect in the property"; this one is predictable from the document. Cheapest fix: give the CI rule its own exhaustive 5 × 2 sub-domain (10 cases) with an expected column transcribed from FSPEC §5's table, or add `mergeRequiresCi ∈ 2` to `D_core` — noting the interaction with F-01 | §2, §8.5 target 3; TSPEC §5.4 |
| F-03 | Medium | Local | **`ROW_IDS` is not an export the TSPEC declares, and the obvious fix makes two oracles circular.** §1.2 says `ROW_IDS` and `MERGE_STATUSES` "are read from the exported frozen catalogues (DC-01)". `MERGE_STATUSES` is real (TSPEC §2.2). `ROW_IDS` appears **nowhere in the TSPEC** — the 25 identifiers exist only as prose in §2.4's `row` rule — so PROP-M-01's `row ∈ ROW_IDS` and PROP-M-20's `row ∈ ROW_IDS ∪ {"internal"}` have no source. Adding the export to satisfy them would be worse than the gap: a membership oracle read from the implementation's own catalogue passes vacuously under exactly the row-id mutation (§8.5 target 2) it exists to catch. State instead that `ROW_IDS` is a **test-local frozen transcription of FSPEC §11's 25 row ids**, and keep the "catalogue gains a member" red as a comparison against the FSPEC-derived list | §1.2, §7 M-01/M-20; TSPEC §2.2, §2.4 |
| F-04 | Medium | Local | **PROP-M-19's closure conjunct cannot pass over its stated domain.** It asserts the observed union covers **every** member of `MERGE_NOTES` across PROP-M-16's and PROP-M-17's runs. TSPEC §10.2's seven notes include the **§2.5 non-overwrite note** ("row present in a status §2.5 does not overwrite"), and neither domain varies the queue row's *prior* status — PROP-M-16 varies dispositions (`error`, `recorded (uncommitted)`), PROP-M-17 varies §11 rows. The §10.3 malformed-`merge`-section note is likewise producible only if PROP-M-17's row-2 fixture is *malformed* rather than merely `mergeMode: "off"`, which §7's row does not say, and the missing-`prNumber` note needs a merged run whose `O1.number` is unreadable — a combination row 11a refuses before reaching. As written the property reds for domain reasons rather than code reasons. Name the three extra generator cases, or scope the closure conjunct to the members these runs produce and pin the remainder in TSPEC §13.2's examples | §6 PROP-M-19; TSPEC §10.2 |
| F-05 | Low | Local | **Two more declared `enum(n)` counts do not follow from their own domains.** PROP-M-06 lists `mergeMode 2 × mergeRequiresCi 2 × ci 5 × o3 3 × caps 3 × guardPaths 6` = **1 080**, not the declared `enum(360)`; PROP-M-19's domain is PROP-M-16's 32 runs plus PROP-M-17's 29 = **61**, not `enum(57)`. Cost is fine either way (1 080 double-driven phase runs is affordable); the defect is that §1.2 requires the suite to assert a count the document states two ways. Say which axes are crossed and which are varied one-at-a-time, then state the number that will be asserted | §3 PROP-M-06, §6 PROP-M-19, §7 |
| F-06 | Low | Local | **The step loop is not an exported seam, so three conjuncts describe harness code rather than production code.** TSPEC §2.3's inventory exports `decideMerge` (pure) and `phaseMerge` (orchestrator); §5.2's `for (let step …)` loop lives **inside `phaseMerge`'s body** and is not separately callable. A `P`-kind property therefore has to re-drive `decideMerge` from its own loop — which is the right design and the only one available, but it makes PROP-M-01's "the loop's exit `throw` is never reached", "`row === "internal"` never occurs" and the step-count bound assertions about the *harness's* counter. Say so explicitly, and leave the production throw to PROP-M-20 and TSPEC §12 E30, which do exercise `phaseMerge` | §2 preamble, PROP-M-01; TSPEC §2.3, §5.2 |
| F-07 | Low | Cross-Feature | **Say "import", not "the shape it ships" — and note that `helpers/` is not collected by jest.** `pdlc/workflows/__tests__/helpers/driftGenerators.js` already exports `seeded(seed)` (xorshift32, `int`/`pick`/`shuffle`/`bytes`) and `resolveSeed()` (the `PDLC_PROP_SEED` override §1.2 rule 1 names), and its header states that no consumer "may re-declare a generator this file already exports". §1.2 cites it as a *shape*, which reads as licence to re-implement a second PRNG and a second override path in `mergeDoubles.js`. Requiring the import costs one clause and removes a divergence risk. Separately, for the F1 widening §8.6 already routes to the PLAN: `package.json`'s jest `testPathIgnorePatterns` contains `/__tests__/helpers/`, so PLAN F1's `__tests__/helpers/mergeDoubles.test.js` **would never be collected** — the "red first" self-test of the doubles and goldens would silently not run. No existing helper has a colocated test for exactly this reason; the self-test belongs in `__tests__/` proper | §1.2, §8.6; `driftGenerators.js:1-55`, `pdlc/workflows/package.json` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: is `D_core` meant to be the full cross product with unreachable combinations *enumerated* (§2's "enumerating the product proves that"), or a reachability-pruned enumeration? The two give very different suites, and §7's `≈4 800` only matches the second |
| Q-02 | F-03: if the TSPEC is to gain a `MERGE_ROW_IDS` export anyway (for `phaseMerge`'s own validation), say so here — but the property's oracle should still compare against the FSPEC-derived transcription, not the export |

## Positive Observations

- **PROP-M-12 is not circular, and is the strongest property in the document.** The golden arm is
  captured from `updateQueueStatus` **at HEAD before the change** and committed as a fixture (PLAN F1
  owns `__tests__/fixtures/queue-goldens/`), so the reference is prior bytes, independent of the new
  code; the three-way equality keeps the self-comparison arm without letting it carry the proof, and
  the "each golden contains the target row and differs from the other statuses' goldens" conjunct
  closes the empty-golden hole. This is exactly TSPEC §13.5's TE F-11 design, correctly instantiated.
- **PROP-M-08's reference predicate is genuinely independent.** `p.slice(0, g.length) === g` is a
  different expression from the `startsWith` under test, so the named mutant reds, and the
  per-mutation-class "at least one firing and one non-firing case, asserted by count" rule stops any
  class from being covered only negatively. Domain and oracle both check out against FSPEC §4.2.
- **PROP-M-03's five fail-closed rows are exactly right.** `o1 | ci | o3 | o5 | o4 := unknown` →
  rows `8 / 11 / 13a / 5 / 15` matches TSPEC §5.3 guards 4, 11, 17, 8 and 20 one for one, and naming
  the row rather than asserting "not 18" is what makes a mis-routed fail-closed branch red. The
  declared exception — `O4` as observation-not-precondition on row 3 (TSPEC §5.5) — is asserted as a
  positive case rather than filtered out, which is the correct handling.
- **PROP-M-05's demand order is verbatim TSPEC §5.3.** `O1, O5, O2, O1*, O3, O4` is the order the
  guard table actually demands slots in (guards 3, 6, 10, 13, 16, 19); the prefix-and-truncation
  oracle is the cheapest possible expression of NFR-2 and needs no new seam.
- **PROP-M-16's 2⁴ × 2 = 32 is sound and complete** over §11's four composable annotations across
  rows 18 and 3, and the empty-subset arm ("no notice beginning `MERGE ESCALATION: `") plus the
  all-four arm (AT-M6, ordered) give it both a floor and a ceiling.
- **PROP-M-20's fault domain is grounded, not guessed.** TSPEC §11.1 does enumerate the new await
  sites exhaustively (`_readFile`, the three `_ghRun` sites, six `observe*`, `_sleep`, `_git` × up to
  7, `_recordQueueRow`, `phaseMerge`), which supports the `≈56` figure; single-point injection over
  reachable *k* with a no-fault positive control is the right shape and is cheap.
- **PROP-M-19's cardinalities are right** — TSPEC §10.2 does define exactly four escalation templates
  and exactly seven plain notes, both frozen — so only the *coverage* half (F-04) needs work.
- Rule 4 (positive-presence conjuncts mandatory) and §8.4's named negative-property set are the
  discipline that keeps this suite from passing on a system that does nothing; they are applied
  consistently, including in the two properties where it is easiest to forget (M-11, M-18).

## Recommendation

**Needs revision** — one High and three Medium findings. F-01 is the one that blocks work: the
decision-core domain is stated two incompatible ways and the larger reading is not affordable, and
§1.2's own case-count assertion cannot be written until the number is settled. F-02 and F-04 are
false claims the document makes about its own coverage (a named mutant no property kills; a closure
conjunct no run in the stated domain can satisfy), and F-03 is a missing export whose obvious fix
would quietly make two membership oracles vacuous. All four are local edits to §1.2, §2, §6 and §7 —
none contests the property set, the classification or any TSPEC decision, and F-05 through F-07 close
with a sentence each.

## Verdict

VERDICT: REVISE
{"high": 1, "medium": 3, "low": 3}

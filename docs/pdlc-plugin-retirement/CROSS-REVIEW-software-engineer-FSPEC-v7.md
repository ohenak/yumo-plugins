# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-17
**Iteration:** 7
**Scope:** delta re-review against `f8283ee3` (the commit v5 reviewed; no SE FSPEC v6 round
was run, so `CROSS-REVIEW-software-engineer-FSPEC-v6.md` does not exist and the delta base
is v5's `REVIEWED-COMMIT`). Diff read with
`git diff f8283ee3 HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
(45 insertions, 57 deletions), spanning: header upstream pin, §1.2 class 7, §4.5 BR-CLN-3a,
§5 E-16a/E-21, §6 AT-4.3/AT-5.2, §7 O-C and the rewritten §7.2. Sections untouched by that
diff are not re-litigated.

## Disposition of v5's findings

| v5 ID | Subject | Status | Evidence checked this round |
|----|---------|--------|------------------------------|
| F-01 (Medium) | BR-CLN-3a's name-only expectation vs BR-CLN-5/E-18 for a *tracked* file at an *expected* name | **Open, untouched** | BR-CLN-3a (`:507`–`:514`) still classifies by name alone; E-18 (`:578`) still says a tracked file is "treated as unexpected"; BR-CLN-5 (`:523`) still forbids touching tracked files. The round edited BR-CLN-3a's last clause for the REQ v0.11 scoping but did not add the index probe. Re-filed below as F-01 (inherited). |
| F-02 (Low) | E-16b's rationale contradicted by the retired channel's own `.pdlc-` namespace reservation | **Open, untouched** | E-16b (`:576`) still reasons only from "no post-sweep artifact proves the residue is junk". Re-filed below as F-02 (inherited). |
| Q-01 | L-11 leftovers likelier, not less, in the field | Answered by construction | AT-4.1 now builds the directory holding **every** L-11 entry, and AT-4.3 reuses that construction, so no test assumes a partially-synced consumer. |

## Verification performed this round

All three §7.2 claims about REQ v0.11 were checked against the REQ at HEAD, not taken on trust:

- **Erratum 1 (manifest).** REQ O-3 now states the manifest "does **not** survive for that one
  row … and AC-1.1's set-equality of the `dist/` entry set with `{M-9}` holds without exception"
  (`REQ-pdlc-plugin-retirement.md:562`–`:566`). FSPEC O-C (`:794`) and §1.2 class 7 (`:159`)
  transcribe exactly that, and AT-1.1 (`:640`) keeps only the branch REQ AC-1.1 (`:281`–`:287`)
  still leaves open — *which* surviving path holds M-9 — which remains TSPEC's, correctly.
- **Erratum 2 (AC-5.2).** REQ AC-5.2 (`:466`–`:478`) enumerates the two provenance values plus
  eight run-variable collections: `authSources`, `startup`, `dispatches`, `retries`, `pauses`,
  `denials`, `loop`, `outcomes`. AT-5.2 (`:772`–`:779`) and E-21 (`:581`) list the same eight
  names in the same order, and the count word "eight" agrees with the enumeration in all three
  places. **All eight are real report keys**, not invented ones: `pdlc/engine/lib/report.mjs:82`
  (`authSources`), `:84` (`startup`), `:85` (`dispatches`), `:86`–`:88` (`retries`, `pauses`,
  `denials`), `:91` (`loop`), `:92` (`outcomes`). The engine block's remaining keys are covered
  by REQ's other exemptions or are stable between two correct runs: `engineVersion`/`pluginVersion`
  are the two provenance fields (`:78`–`:79`), `pluginRoot` is a path (`:80`), `startedAt`/
  `finishedAt` are timestamps (`:93`–`:94`), and `startupAuth`, `transport`, `baseUrl`, `tunables`,
  `permissionMode` (`:81`, `:83`, `:89`–`:90`) are config-derived. So the criterion AT-5.2 states
  is passable on a correct sweep — the defect v5 raised upstream is genuinely closed, not papered over.
- **Erratum 3 (AC-4.3).** REQ AC-4.3 (`:446`–`:454`) now carries both halves the FSPEC cites: the
  whole-directory post-refusal state ("every expected entry the directory held before the run is
  still present and byte-identical after it") and "Hand-modification of an expected entry is
  **not** covered (C-9)"; C-9 (`:264`–`:267`) matches. BR-CLN-3a (`:512`–`:514`) and E-16a (`:575`)
  restate that scope rather than reinterpreting it, which is the right altitude.
- **AT-4.3's second construction.** The `.pdlc-tmp.<pid>.<rand>` grammar is the shipped one:
  `pdlc/hooks/scripts/lib/pdlc-drift.sh:1444` (`${dir}/.pdlc-tmp.$$.${RANDOM}`) and `:1658`
  (`${destDir}/.pdlc-tmp.$$.${RANDOM}`).
- **ASM-4's path.** `pdlc/engine/bin/pdlc.mjs` exists at HEAD.
- **No dangling erratum references.** The only surviving mention of `7.2` is the section heading
  itself (`:812`); the two body sites that used to route to "§7.2's erratum" (BR-CLN-3a, E-16a)
  were both rewritten in the same edit.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | *(inherited, nonlocal — carried from v5 F-01, unchanged by this round.)* **A tracked file at an expected name is classified two ways.** BR-CLN-3a (`:507`) makes expectation name-only and explicitly not content-based, so a consumer who committed `.claude/workflows/orchestrate-dev.bundle.js` — an expected name at an expected path — is deleted; E-18 (`:578`) says a tracked file is treated as unexpected and refused; BR-CLN-5 (`:523`) forbids touching tracked files at all. Two of the three rules cannot both bind. Cheapest fix, still inside step 2's "no repo artifact consulted" spirit because it consults *git*, not a deleted manifest: state in BR-CLN-3a that the expectation predicate is name-in-L-11 **and** path-untracked (`git ls-files --error-unmatch` or an equivalent index probe), so the TSPEC author implements one decidable test rather than choosing between two FSPEC rules. | BR-CLN-3a; BR-CLN-5; E-18; §3.5 step 2 |
| F-02 | Medium | Local | *(delta, local.)* **AT-5.2's field-set equality does not say how deep it recurses, and the only reading that is safe is unstated.** Clause 1 requires field sets equal "over the whole report" (`:773`); clause 2 exempts the eight collections from *value* comparison but says they are compared "for presence and shape" (`:779`). If clause 1's field-set walk descends into those collections, a correct sweep can red the gate on shape alone — `dispatches` is `{bySkill, byPhase}` whose inner keys are per-run skill names (`pdlc/engine/lib/report.mjs:64`, `:85`), and `loop` is `null` when no loop ran but an object otherwise (`:70`, `:91`), so its nested key set is run-dependent by construction. One clause fixes it: field-set equality is asserted over the report's top-level keys and over the fixed key sets of non-exempt objects, while inside the eight exempt collections only the collection's own presence is asserted. Leaving "shape" undefined hands the TSPEC author a coin flip on a P0 gate. | §6.5 AT-5.2 (1)–(2); E-21 |
| F-03 | Low | Local | *(inherited, nonlocal — carried from v5 F-02.)* **E-16b's stated reason is weaker than the shipped evidence.** E-16b (`:576`) refuses on `.pdlc-tmp.*` because "no post-sweep artifact proves the residue is junk rather than an operator's file". The retired channel reserved the whole `.pdlc-` prefix and enforced it in both directions: consumer-directory enumeration drops any `.pdlc-*` basename unconditionally (`pdlc/hooks/scripts/sync-workflows.sh:299`, `:323`), and the manifest validator fails (`M10`) when a `consumerPath` or `retires` remainder starts with `.pdlc-` (`pdlc/hooks/scripts/lib/pdlc-drift.sh:735`). The outcome E-16b picks is still the conservative one; only the rationale sentence needs the citation swap. | §5 E-16b |
| F-04 | Low | Local | *(delta, local.)* **The header's Cross-Reviews row is stale by three files.** It stops at v4 (`:11`) while `CROSS-REVIEW-software-engineer-FSPEC-v5.md`, `CROSS-REVIEW-test-engineer-FSPEC-v5.md` and `CROSS-REVIEW-test-engineer-FSPEC-v6.md` are all tracked in `docs/pdlc-plugin-retirement/`. The same header row was edited this round for the v0.11 upstream pin, so the omission is now a round-old miss rather than an inherited one; a reader reconstructing which findings this document answers is pointed at the wrong set. | Header metadata table |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-5.2 names the TSPEC's "comparison list" as the home of the stable subset, but AT-4.4 (`:743`) also compares field sets "values compared only over AT-5.2's stable subset". Is the intent that one list, authored once in the TSPEC, is consumed by both tests? If so, saying so in AT-4.4 would stop two lists being written and drifting. |

## Positive Observations

- **All three errata were closed upstream and re-traced, not relaxed downstream.** §7.2 was rewritten
  from a list of open defects into a resolution table, and every row of it survives a check against
  REQ v0.11's actual text. The version pin travelled: header (`:9`), traceability sentence (`:75`),
  BR-CLN-3a (`:512`), E-16a (`:575`), AT-5.2 (`:779`) and O-C (`:794`) all now say v0.11, with no
  v0.9 or v0.10 reference left anywhere in the document.
- **AT-4.3 was rebuilt from a single-assertion test into a four-clause one, and the added clauses are
  the ones that matter.** The previous version asserted only that the *unexpected* file was unchanged —
  an oracle a step that deleted every expected entry before refusing would still pass. Clause (a) now
  asserts every L-11 entry is still present and byte-identical, and the document says why in the test
  itself: "a directory holding only the unexpected entry passes a not-modified check vacuously". That
  is the absence-only oracle closed with a positive assertion on the same path, and it discharges REQ
  AC-4.3's new whole-directory sentence exactly.
- **The second construction on AT-4.3 covers the class, not the example.** Refusing a channel-written
  `.pdlc-tmp.<pid>.<rand>` residue on the same four clauses as an operator's file means the property
  author cannot write a test that passes for operator files and coin-flips on channel junk.
- **AT-5.2's excluded set is pinned as identical to REQ's, in both directions.** "No field is exempted
  here that the REQ does not exempt, and none it exempts is value-compared here" is a set-equality
  claim about the exemption list, not a containment one — the shape that makes a dropped or smuggled
  exemption fail rather than slip through.

## Recommendation

**Approved with minor changes**

No High findings, old or new. The three upstream errata this FSPEC has been carrying since v5 are
genuinely closed in REQ v0.11, and the two acceptance tests that changed (AT-4.3, AT-5.2) both got
stronger: AT-4.3 gained the positive survivor assertion it was missing, AT-5.2 gained an exemption
set that matches the REQ's exactly and is passable against the report shape the engine actually
writes. F-02 is the only new finding and it is one clause of depth-scoping in AT-5.2; F-01 is v5's
open collision, still one clause in BR-CLN-3a; F-03 and F-04 are a citation swap and a metadata row.
None changes what the TSPEC implements once F-01's and F-02's clauses are written. Fold all four into
the next edit; the document does not need another review round before TSPEC authoring.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

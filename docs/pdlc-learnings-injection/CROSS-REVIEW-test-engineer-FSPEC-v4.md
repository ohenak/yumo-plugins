# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-19
**Iteration:** 4
**Scope:** delta re-review of `eb326e7f..HEAD`; testing lens only — testability, oracle falsifiability, edge-case completeness. Sections unchanged since v3 are not re-litigated.

## Disposition of v3 findings

| ID | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-9 is now "three closed catalogues" with a named notice catalogue — `NTC-MALFORMED`, `NTC-KEYTYPE` (FSPEC:498-503) — and AT-32 carries the matching oracle: "a **completeness test asserts set equality** over `NTC-MALFORMED` and `NTC-KEYTYPE`" (FSPEC:872-873). Every prose site that said "a catalogued notice" now names the id instead: flow step 3 (FSPEC:141-144), BR-14's state table (FSPEC:589-590), BR-14's rationale (FSPEC:605), E-23 and E-34 (FSPEC:687, 690). A third notice cannot now be emitted without failing the set-equality test, which is what REQ C-9 asks for. |
| F-02 | Medium | **Resolved** | AT-32's wrong-typed conjunct now names the key and its literals: `maxDocuments: "five"` with the other two thresholds configured, BR-10's record showing `maxDocuments` "at its §4.1 default literal 5" while the others show configured values, selection equal to a fixture literal (FSPEC:868-871). Same discipline as AT-11/AT-22; no implementation echo left. |
| F-03 | Medium | **Resolved** | The `docs/discarded/LEARNINGS-x.md` class now has an outcome ("corpus member on ordinary terms", FSPEC:270-271), an edge row (E-35, FSPEC:661) and a fixture-bearing AT conjunct — a one-file fixture holding exactly that path, asserted a corpus member, selected, carrying no exclusion reason (AT-15, FSPEC:800-802). A test can now fail on it. |
| F-04 | Low | **Resolved** | D-1's branch column reads "absent / disabled / malformed / wrong-typed key / enabled" (FSPEC:220), and the coverage line's D-1 → AT-30/31/32 mapping covers all five: absent and disabled by AT-31, malformed / wrong-typed / misspelt by AT-32, enabled by AT-30. |

Nothing approved in v3 was broken by the revision. The erratum-carrying additions are correct against HEAD: `pdlc/workflows/consolidate-learnings.js:1344-1345` pins `:(glob)docs/*/LEARNINGS-*.md`, which does match `docs/discarded/LEARNINGS-x.md`, and `git ls-files 'docs/discarded/LEARNINGS-*.md'` is still empty. REQ AC-3.2 does list `RSN-TRUNCATED` and does omit `RSN-NO-MATERIAL` (REQ:312-318), so BR-3's new erratum line (FSPEC:299) states a real divergence rather than covering one.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **E-35's new outcome collides with E-07's and AT-15's fixture phrasing, so one sentence of AT-15 can falsify the other.** AT-15's first clause is "*Given* a fixture whose only LEARNINGS documents lie under `docs/discarded/`, *then* nothing is selected, the report carries corpus-level `RSN-EMPTY`" (FSPEC:798-800), and its new second clause is "*And given* a one-file fixture holding exactly `docs/discarded/LEARNINGS-x.md`, *then* it is a corpus member, is selected" (FSPEC:800-802). The second fixture satisfies the first clause's description verbatim — its only LEARNINGS document does lie under `docs/discarded/` — so a test author who builds the first fixture at the direct path writes a passing `RSN-EMPTY` assertion for a case E-35 says must be selected. E-07's row carries the same phrase ("Corpus contains only documents under `docs/discarded/`", FSPEC:660). BR-2 disambiguates correctly — the never-candidate class is `docs/discarded/{feature}/`, one directory deeper than the glob reaches (FSPEC:262-265) — so this is wording, not a design gap, but the wording sits in the fixture-defining sentence. Fix: narrow both to `docs/discarded/{feature}/LEARNINGS-*.md` (nested), leaving the direct path to E-35. | AT-15, E-07, E-35, BR-2 |
| F-02 | Low | Local | **AT-20's cross-catalogue disjointness oracle still speaks of two catalogues, while BR-9 now binds three.** BR-9's rule reads "no id is used in another catalogue's position" over all three sets (FSPEC:509), but its only oracle is AT-20's "neither catalogue's ids appear in the other's position" (FSPEC:820-822), which by construction ranges over the per-document and corpus-level sets alone. Nothing fails if `NTC-KEYTYPE` were emitted in a per-document reason position. Each catalogue's own set-equality test does not close this, since those assert membership of the declared set, not exclusivity across sets. Fix: extend AT-20's second conjunct to all three catalogues, or add the conjunct to AT-32. | BR-9, AT-19, AT-20, AT-32 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | When two declared keys are wrong-typed in the same config, does the report carry two `NTC-KEYTYPE` entries (one per key) or one naming both? AT-32 pins the single-key case with literals; the multi-key shape is still free, and it is the shape a set-equality-over-notices test cannot decide by itself. |
| Q-02 | Does a wrong-typed `enabled` key (e.g. `enabled: "false"`) fall to the `true` default and run **enabled** with `NTC-KEYTYPE`? BR-14's table treats `enabled` as one of the declared keys, which reads that way, but no AT pins it, and the per-key fallback turning the feature *on* against apparent operator intent is the one case worth a named fixture. (Carried from v3 Q-02, unanswered.) |

## Positive Observations

- **The notice catalogue was added at the right altitude.** BR-9 gained two ids and a membership rule; the serialised shape stayed out (F-O-3, TSPEC's). Every prose site that previously said "a catalogued notice" was rewritten to the id, so the reader of E-23, E-34, BR-14's table and the flow all reach the same two-member set — the usual failure mode of a late catalogue is one site left saying "a notice", and none survives here.
- **AT-32 is now the strongest AT in the document.** Named key, named default literal, the other two thresholds configured so the defaulted one is distinguishable, selection as a fixture literal, named notice id, plus the misspelt-section negative that asserts *indistinguishability from AT-31* rather than the absence of a notice. That is a positive oracle on a negative behaviour, which is the shape absence-only oracles usually miss.
- **AT-12 and AT-13 closed the last implementation-echo doors without being asked.** AT-12's bounded byte count and AT-13's dropped set and byte counts are now "fixture literals, never derived" (FSPEC:780-781, 788-790), matching AT-11's wording. That was Low-hanging in v3's F-02 and the author generalised it instead of patching the one AT cited.
- **The REQ divergences are stated, not smoothed.** BR-3's new line says outright that AC-3.2 lists `RSN-TRUNCATED` and omits `RSN-NO-MATERIAL` while BR-9 differs on both (FSPEC:299), and BR-14's rationale says AC-5.1b's own typo example no longer holds (FSPEC:606). Both check out against REQ:312-318 and REQ:364-367. A spec that reports its own upstream conflicts is cheaper to test than one that quietly resolves them.

## Recommendation

**Approved with minor changes**

All four v3 findings are resolved, and the High one at the right altitude: a third closed catalogue with named members, a set-equality oracle in AT-32, and every "a catalogued notice" site converted to an id. Nothing approved in v3 regressed. The two findings left are wording-level: F-01 asks that AT-15's and E-07's fixture phrase be narrowed to the nested `docs/discarded/{feature}/` form so that E-35's direct-path case cannot be built against the `RSN-EMPTY` oracle, and F-02 asks that AT-20's disjointness conjunct range over all three catalogues rather than two. Neither blocks TSPEC and PROPERTIES authoring; both are single-sentence edits that can ride the next revision.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:0ae549da7d496c284d4d64301aa71c9c6837564ff502414ec4f9ed577301d687
APPROVAL-HASH-NORMALIZED: sha256:0ae549da7d496c284d4d64301aa71c9c6837564ff502414ec4f9ed577301d687
REVIEWED-COMMIT: f005e6ed64688904c5f747c989cfb5d1696f0569
UPSTREAM-STATE: REQ sha256:0110298fd9f864a67213a3aa816da70c6295de63d93e68915dfed89ab832cedb

# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3

## Scope of this round

Delta re-review under decision freeze. Baseline: `aa7e06626` (the commit reviewed at v2).

**The document under review did not change.** `git diff aa7e06626..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is empty. The delta this round is entirely **upstream**: REQ v1.4 → v1.6, FSPEC v1.5 → v1.7, TSPEC v1.4 → v1.7, PLAN v1.1 → v1.2, plus the first implementation waves landing (`statsPreflight`, `statsArgv`, `statsMetrics`, `statsDiscovery`, `statsRender`, `statsOutcome`, `statsAntiDrift`, `helpers/statsDoubles.js`, and the three `pdlc/engine/__tests__/stats-*` suites).

So the only question this round can answer is the one it should: **does anything PROPERTIES pins become false now that its upstream moved?** I re-derived every claim the upstream delta could have invalidated against HEAD rather than against the v2 record. Sections untouched by the upstream delta are not re-litigated.

The four upstream moves that could reach PROPERTIES, and what each did to it:

| Upstream move | Reaches PROPERTIES at | Verdict |
|---|---|---|
| **REQ v1.6** withdraws REQ-STATS-05's harvested halt state, restores a measured `0`; NG-6 rescoped to the two families harvest removes; R-6 records the `0` conflation as an accepted residual | PROP-HALT-07, PROP-NEG-04 | **Survives unchanged.** PROP-HALT-07 already required an empty halt set / `[]` / the `none` line and exit `0` for a feature with no post-mortem — exactly what REQ now mandates; it never asserted a harvested halt state. PROP-NEG-04's "no measured `0` for a harvested document type, DoD metric or ratio" names three metrics and **not** halts, so REQ's new accepted-`0` residual does not contradict it. No edit owed. |
| **FSPEC v1.7** corrects BR-16's citation of `docs/completed/pdlc-advisory-wave-gate/` from two to **four** out-of-catalogue cross-reviews, and re-scopes it to the malformed *basename shape* only — that directory reports a **measured** ratio | PROP-RR-05, PROP-RATIO-08, §Fixtures real-path table | **Survives, and was already right.** PROP-RR-05 and the fixture table both already said "exactly **four**" and both scope the directory to the malformed-basename claim; neither ever attributed a `harvested` verdict to it. Re-measured at HEAD: 62 `CROSS-REVIEW-*`, of which 4 are `-REVIEW-v{1,2}.md` — FSPEC's corrected count and TSPEC §4.3's 62/4/58 both check out. |
| **FSPEC v1.7** adds a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file to AT-15's neither-list and routes **BR-16 → AT-15, AT-17** in §8 | PROP-RATIO-03 (AT-15's owner), §Traceability AT-15 / BR-16 rows | **Substance covered, mapping stale.** See F-01. The behaviour is pinned by PROP-RATIO-06; the AT-15 fixture transcription and the two matrix rows do not show it. |
| **REQ v1.6** calls a grammatical-but-out-of-catalogue basename **a survivor**, contradicting BR-16 on the same file | PROP-RATIO-08 leg 4 | **PROPERTIES chose correctly; it just doesn't say so.** See F-02 and the erratum below. |

Claims re-derived at HEAD this round (not carried over from v2):

| Claim | Checked at HEAD | Verdict |
|---|---|---|
| `docs/` root holds twenty-one directories | `git ls-tree -d --name-only HEAD docs/` → 21 | ✅ still 21 — this round added ~29 files under `docs/pdlc-stats/` but no directory |
| `docs/completed/pdlc-advisory-wave-gate/` carries exactly four `-REVIEW-v{1,2}.md` basenames | `git ls-tree … \| grep -c -- "-REVIEW-v"` → 4; total `CROSS-REVIEW-*` → 62 | ✅ PROP-RR-05, PROP-RATIO-06's shape, FSPEC v1.7's corrected count and TSPEC's 62/4/58 all agree |
| PLAN still names `statsRealPaths.test.js` as a new file owned by T-18 | `PLAN:110` (T-18 row), `PLAN:179` (File Ownership Manifest, wave 9, "new") | ✅ PROPERTIES' T-18 trace row and level table resolve; the suite is legitimately absent from HEAD because wave 9 has not run |
| Every test file PROPERTIES names is either shipped or planned-new | T-01…T-11's suites exist at HEAD; T-18's is manifest-declared for wave 9 | ✅ no property traces to an unplanned file |
| PLAN's task ids PROPERTIES traces (T-04, T-05, T-06, T-07, T-10, T-18, T-26) survived the v1.2 renumber | PLAN v1.2 changed row *contents*, not ids | ✅ no trace dangles |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | AT-15's neither-list gained a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` member at FSPEC v1.7, and §8 now routes BR-16 → AT-15. The behaviour is pinned (PROP-RATIO-06), but PROP-RATIO-03 — the AT-15 fixture transcription — still lists the old three plus `HANDOFF-PROMPT.md`, and the §Traceability AT-15 and BR-16 rows do not name PROP-RATIO-06. Coverage is real; the map to it is stale. | §Properties → PROP-RATIO-03, PROP-RATIO-06; §Traceability → AT-15, BR-16 |
| F-02 | Medium | delta | nonlocal | REQ-STATS-06 v1.6 now calls a grammatical-but-out-of-catalogue basename **a survivor**, which contradicts FSPEC BR-16 v1.7 on the same file and inverts PROP-RATIO-08's fourth leg. PROPERTIES asserts the BR-16 reading — the correct choice, matching TSPEC §4.3 — but records the dispute nowhere, and PROP-RATIO-08's Traces column still cites `REQ-STATS-06` as authority for the leg REQ-STATS-06 now contradicts. | §Properties → PROP-RATIO-08; §Gaps |

Both are Medium and neither gates. Provenance is `delta` because the upstream edits of this round left these items unlanded in PROPERTIES; locality is `nonlocal` because PROPERTIES itself has no changed sections this round.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | AT-15's neither-list gained a member and BR-16 gained an AT-15 trace at FSPEC v1.7; PROP-RATIO-03's transcription and the AT-15 / BR-16 matrix rows do not reflect it, though PROP-RATIO-06 pins the behaviour | §Properties → PROP-RATIO-03, PROP-RATIO-06; §Traceability |
| F-02 | Medium | Cross-Feature | PROP-RATIO-08 leg 4 carries an assertion its own cited authority (REQ-STATS-06 v1.6) now contradicts; the REQ-versus-FSPEC dispute is unrecorded in §Gaps | §Properties → PROP-RATIO-08; §Gaps |

### F-01 (Medium) — AT-15's new leg is covered, but not by the property that owns AT-15

FSPEC v1.7 added a fourth member to AT-15's neither-list: a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file, "`CROSS-REVIEW-`-prefixed but outside BR-09's six document types" (`FSPEC:727`), whose *Then* now reads that adding it "leaves both unchanged — including the out-of-catalogue cross-review, whose bytes reach neither side, so an implementation that globs `CROSS-REVIEW-*` into the process total fails here (BR-14, BR-16)" (`FSPEC:730`). §8's trace table moved with it: `BR-16 | AT-15, AT-17` (`FSPEC:894`).

My first read had this as a coverage hole, and it is not — worth stating plainly, because the conclusion changes the severity. **PROP-RATIO-06 already pins exactly this behaviour**: "A grammatically-failing `CROSS-REVIEW-` basename must contribute to **neither** side … Asserted over the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape." That is the same mutant FSPEC's new clause names, at the same level (`unit-seamed`), in the same task (T-04). The implementer who follows PROPERTIES writes the test FSPEC wants. TSPEC reached the same reading independently: AT-15's byte half "is unaffected by the dispute, since neither reading gives the file spec-side bytes."

What is stale is the map, in three places:

1. **PROP-RATIO-03**, the property whose text *is* AT-15's neither-list, lists `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`, `SIZING-*.md`, `HANDOFF-PROMPT.md`. FSPEC's list is now `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`, `SIZING-*.md`, `CROSS-REVIEW-{role}-REVIEW-v{N}.md`. The two diverge in both directions — PROPERTIES carries an extra (`HANDOFF-PROMPT.md`, harmless, additive, and present since v1) and is missing the one FSPEC declared load-bearing.
2. **§Traceability AT-15 → PROP-RATIO-01…04** does not include PROP-RATIO-06, so the row understates its own coverage.
3. **§Traceability BR-16 → PROP-RATIO-08, PROP-RATIO-09** predates FSPEC routing BR-16 through AT-15 as well; PROP-RATIO-06's Traces cites `BR-14, BR-06` and not BR-16.

Why Medium and not Low: PROP-RATIO-03 is the AT-15 fixture transcription, and a fixture transcription that has drifted from the normative fixture body is the thing a later reader trusts instead of re-reading FSPEC. Why Medium and not High: no behaviour goes unasserted, so nothing an implementer builds from this document is wrong.

**What resolves it** — add the out-of-catalogue cross-review to PROP-RATIO-03's list (keeping `HANDOFF-PROMPT.md`, which is a fine local addition), and add PROP-RATIO-06 to the AT-15 and BR-16 matrix rows with `BR-16` in its Traces column. Three line edits, no new property, no decision.

### F-02 (Medium) — a contested assertion is carried without being marked contested

REQ v1.6 rewrote REQ-STATS-06's predicate: "The predicate is set-membership over C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor even where REQ-STATS-03 reports it malformed" (`REQ:203`). FSPEC BR-16 v1.7 classes the same file as no file remaining, and a directory holding only those as `harvested` (`FSPEC:367`). Both cannot hold, and the file they disagree about is the one PROP-RATIO-08's fourth leg is built on.

**PROPERTIES made the right call.** It asserts the BR-16 reading, which is its immediate upstream, and that is the same choice TSPEC made and defended: "the sketch below is written against BR-16, the immediate upstream, and §8.3 routes the reconciliation to the owning phase" (`TSPEC:796`), naming AT-17's fourth leg as "the single place the contested scoping above becomes an assertion." I am not asking PROPERTIES to switch sides, and under this round's freeze I would not entertain re-deciding it here.

Two smaller things follow from it, both inside PROPERTIES' own conventions:

- **PROP-RATIO-08's Traces column reads `REQ-STATS-06, BR-16, AT-17`.** REQ-STATS-06 at HEAD no longer supports leg 4; it contradicts it. Citing it as authority for the leg is a claim about an upstream document that is false at HEAD.
- **§Gaps has no row for this**, although the document already has the right pattern for exactly this situation: G-1 marks the discovery predicate "provisional", says which property does and does not assert it, and names TSPEC §8.3 as the owner. The byte-ratio dispute is the same shape and deserves the same row — TSPEC names three sites that re-stamp when it settles, and PROP-RATIO-08 leg 4 is effectively a fourth.

**What resolves it** — a G-8 row saying leg 4's expected value is provisional on the REQ/FSPEC reconciliation TSPEC §8.3 routes, and either dropping `REQ-STATS-06` from PROP-RATIO-08's Traces or marking it "(BR-16's reading; REQ-STATS-06 v1.6 contests — see G-8)". This is bookkeeping on a dispute that already exists upstream, not a new decision.

I have not folded this into the verdict on PROPERTIES; the defect is in the upstream pair, and it is raised as an erratum instead.

DEFERRED: PROP-RATIO-03's `HANDOFF-PROMPT.md` is a PROPERTIES-local addition to AT-15's neither-list that FSPEC does not carry — harmless and arguably good coverage, but it means the two lists will keep needing manual reconciliation.

## Questions

## Positive Observations

## Recommendation


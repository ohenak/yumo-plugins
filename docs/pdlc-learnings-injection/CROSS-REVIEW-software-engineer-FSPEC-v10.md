# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.9)
**Date:** 2026-08-19
**Iteration:** 10 (decision freeze)

Scope: delta `a6b42bae..cbb0a63e` (42 insertions, 32 deletions) — BR-9 corpus-level catalogue
re-located to per-authoring-dispatch, BR-10 split into two loci, Step 21, AT-20/AT-21/AT-22,
header cross-review list, AC-6.2 traceability row, v0.9 erratum note. Re-measured against
REQ HEAD.

## Prior findings

| Prior | Status | Evidence |
|---|---|---|
| v9 F-01 (High) — BR-9/BR-10/Step 21/AT-20-22 specified a run-level locus where REQ v0.9 AC-3.2/AC-3.3 put a per-dispatch one | **Resolved** | BR-9 per-document catalogue now "Recorded **per authoring dispatch**, alongside BR-8's rows" (`:501-502`); corpus-level catalogue "recorded **per authoring dispatch** too" (`:511-512`); the empty-rows rule is scoped to that dispatch (`:535-536`); BR-10 is a two-locus table — ordering key values per dispatch, thresholds once per run (`:546-551`) — closed by **two** completeness tests (`:553-554`); Step 21 follows (`:237-238`); BR-8's cross-reference reads "closed at its own two loci" (`:498`). Matches `REQ:319-344` clause for clause. |
| v9 Q-01 — do run-level singletons survive, and as what? | **Answered in text** | "A run-level mirror of either catalogue, if carried, is **additive, not the oracle**: nothing asserts on it (AC-3.2)" (`:537-538`), repeated for BR-10's values (`:554-555`). This is REQ AC-3.2's own wording (`REQ:326-328`), so TSPEC's parked question at `TSPEC:343-354` now has an FSPEC answer to re-ground on. |
| v9 F-02 (Low) — header cross-review list three rounds stale | **Resolved** | `:13` now reads `v{1,2,3,4,5,6,7,8,9}`. |
| v9 F-03 (Low) — AC-6.2 carried test ids in the rule column | **Resolved** | `:143` now reads `§Acceptance-test preamble \| AT-31, AT-32`. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | `delta` `local` — BR-9's per-document catalogue lost the word "exactly": v0.8 read "carries exactly one reason id from this closed set", v0.9 reads "carries one reason id from this set" (`:502-503`). The uniqueness claim is still pinned by AT-19 ("carries **exactly one** per-document reason id", `:846-847`) and by REQ AC-3.2's "each with a **per-document** reason" (`REQ:320-321`), so nothing downstream is unowned — but the rule text is now weaker than the test that enforces it, which is the wrong direction for a rule/test pair. **Fix:** restore "exactly one" when BR-9 is next touched. | §BR-9 (`:502`) |
| F-02 | Low | Local | `inherited` `local` — AT-22's subject and predicate no longer agree after the rewrite: "*when* the rule-input record of a named dispatch is read … *then* **it** equals an expected selection … (paths, in order)" (`:856-859`). A rule-input record (ordering key values plus thresholds) does not equal a selection; the reproduction *derived from* it does. The referent slip predates this round (v0.8 had the same shape with "run-level" in place of "of a named dispatch"), and the transcribed-by-hand fixture and the no-production-selector clause make the intent unambiguous, so TSPEC/PROPERTIES can implement it — but a reader mapping AT-22 to an oracle has to repair the sentence first. **Fix:** "*then* reproducing the selection from it yields the expected order, transcribed literally by hand and committed in the fixture." | §AT-22 (`:856`) |

## Questions

None. v9's Q-01 is answered in the document text.

## Positive Observations

- **The fix landed at every site the finding named, not just the loudest one.** BR-9's two catalogues, BR-10's table, BR-8's cross-reference (`:498`), Step 21 (`:237-238`) and three acceptance tests all moved in one edit. The failure mode I was watching for — the rule tables moving while the flow step or a stale cross-reference keeps the old locus — did not happen; `grep "once per run"` now returns exactly the two thresholds sites and the erratum note.
- **AT-20 and AT-22 gained a positive discrimination, not just a relocated noun.** Both now bind to AT-18's changing-corpus run and assert that each dispatch reads back its own outcome *and* that a single run-level field/set fails on it (`:852-853`, `:859-861`). That is the test that would have caught the very contradiction this round closed, and it is expressed as "one run-level set reproduces at most one of them" — a positive statement about what the wrong design does, not an absence-only oracle.
- **The two-locus split is asymmetric for a stated reason.** BR-10 does not mechanically push both members per-dispatch; it keeps thresholds run-level "the configuration being read once" and says so at the point of the split (`:546`), matching `REQ:340-342`. Copying REQ's asymmetry rather than smoothing it is what keeps the completeness tests honest — two loci, two tests, neither test able to pass by accident on the other's fields.
- **The erratum note names the criteria it re-grounded on.** `:32-35` cites AC-3.2/AC-3.3 and records that mirrors are additive, closing Q-01/Q-02 in the same block. The v0.6/v0.7/v0.8 notes are preserved beneath rather than overwritten, so the locus's whole migration is reconstructible from the document alone.

## Deferred

DEFERRED: TSPEC §I.2/§OQ.2's parked run-level rule-input question (`TSPEC:343-354`) should be re-grounded on FSPEC v0.9's two loci at the next TSPEC round — downstream of this document, out of scope here.

## Recommendation

**Approved**

The one blocking finding from v9 is resolved at every site it named, and resolved against REQ HEAD
rather than against a paraphrase: BR-9's corpus-level catalogue, BR-10's ordering keys, Step 21 and
AT-20/21/22 now sit per authoring dispatch, thresholds stay run-level, mirrors are declared additive
and non-oracular, and BR-10 closes with two completeness tests instead of one. Both v9 Lows landed
in the same edit. Nothing outside the delta moved — BR-1 through BR-8, BR-11 through BR-14, the
edge-case inventory and the remaining thirty acceptance tests are byte-identical to the approved
v0.8 text.

The two findings recorded here are Low and non-gating: a "exactly one" dropped from BR-9's prose
that AT-19 still enforces, and an inherited subject/predicate slip in AT-22 that does not change
what the test must do. Both are fold-into-next-edit items, not revision triggers. Under the
decision-freeze bar, no delta-introduced defect and no contradiction with the repository or
upstream REQ at HEAD remains open.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:256537d8208acce044d199dbd66f35b4888140d6253a1f09e9b91dc82b7c4b18
APPROVAL-HASH-NORMALIZED: sha256:256537d8208acce044d199dbd66f35b4888140d6253a1f09e9b91dc82b7c4b18
REVIEWED-COMMIT: cbb0a63e21ddc64b59a95dc227f4d940934d47a1
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd

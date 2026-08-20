# Cross-Review: test-engineer — FSPEC (delta re-review, frozen round)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.9)
**Date:** 2026-08-19
**Iteration:** 10

## Scope

Delta re-review of `a6b42bae..cbb0a63e` (+42/-32, one commit: FSPEC v0.8 → v0.9). Convergence
question: are my own v9 blocking findings resolved, and did the revision break anything that
worked before. Sections the diff did not touch were approved earlier and were not re-litigated;
I re-read them only far enough to check the delta did not contradict them.

## Disposition of v9 findings

| v9 finding | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 — BR-9 recorded corpus-level outcomes and per-document reasons at the wrong locus ("once per run") against REQ AC-3.2's **per authoring dispatch** | High | **Resolved** | BR-9 per-document catalogue now reads "Recorded **per authoring dispatch**, alongside BR-8's rows: every corpus document known to *that dispatch* but not contributing to it" (FSPEC:502-503); corpus-level catalogue now "recorded **per authoring dispatch** too" (FSPEC:511-512); the empty-rows rule is scoped "for that dispatch" (FSPEC:535-536). Matches REQ AC-3.2 verbatim on locus (REQ:327-328, "recorded **per authoring dispatch**, alongside AC-3.1's rows for that dispatch"). |
| F-01(b) — AC-3.2's "run-level mirror … additive, not the oracle, nothing asserts on it" had no FSPEC counterpart (Q-02) | High (same row) | **Resolved** | New BR-9 bullet: "A run-level mirror of either catalogue, if carried, is **additive, not the oracle**: nothing asserts on it (AC-3.2)" (FSPEC:537-538), and the same sentence for BR-10's values (FSPEC:554-555). This is the upstream's own wording, not a new decision. |
| F-02 — BR-10 collapsed AC-3.3's two loci into one run-level record; AT-22 could green while failing AC-3.3 | High | **Resolved** | BR-10 now splits the record into a two-row locus table — ordering key values "Per authoring dispatch, alongside BR-8's rows", thresholds "Once per run" (FSPEC:548-551) — closes with "**two** completeness tests assert set equality, one per locus" (FSPEC:553-554), and restates the behavioural claim per dispatch ("reproduce *a dispatch's* selection … against the corpus as it stood at that dispatch", FSPEC:557-558). Matches REQ AC-3.3 (REQ:336-345), including its stated reason (corpus may move mid-run). BR-8's closing cross-reference was corrected in the same edit: "separate and closed at its own two loci" (FSPEC:498). Flow step 21 was corrected too (FSPEC:237-238). |
| F-03 — Cross-Reviews header field stale at v{1..6} | Low | **Resolved** | Header now `…-FSPEC-v{1,2,3,4,5,6,7,8,9}.md` (FSPEC:13). |

## Falsifiers added by the delta (the part I care most about)

The v9 finding was not only a wording drift: an implementation could have satisfied the old AT-20
and AT-22 with a single run-level field and still violated AC-3.2/AC-3.3. The revision closes that
false-green with named, failing-by-construction clauses rather than with restated intent:

- **AT-20** (FSPEC:849-853) now reuses AT-18's changing-corpus run — listing failing for the first
  dispatch, succeeding for the second — and asserts "both outcomes are read back per dispatch; **one
  run-level field fails**". That is a positive two-dispatch oracle with an explicit statement of what
  the rejected design does, not an absence assertion.
- **AT-22** (FSPEC:855-862) likewise: "each dispatch reproduces from its own ordering key values; one
  run-level set reproduces at most one of them and fails", plus "**two** completeness tests assert set
  equality, one per BR-10 locus". Set-equality-per-locus is preserved, so deleting a member of either
  locus still reds — containment was not substituted for equality anywhere in the delta.
- AT-22's anti-echo clause survived the rewrite intact: expected selection "**transcribed literally by
  hand and committed in the fixture**", and "the test neither calls the production selector nor
  reimplements it" (FSPEC:858-862).
- The fixture this rests on already exists in the document: AT-18 carries the changing-corpus run
  (FSPEC:843-845), so the new clauses cost no new fixture and cannot be discharged by prose.

## Delta did not break approved material

- Catalogue count is unchanged: BR-9 still carries three catalogues with three set-equality tests
  (FSPEC:531-532, AT-19/AT-20/AT-32), matching REQ AC-3.2's "Three set-equality tests, one per
  catalogue" (REQ:333-334). The notice catalogue (`NTC-MALFORMED`, `NTC-KEYTYPE`) was not touched and
  its set-equality test still lands at AT-32 (FSPEC:912-913).
- Locus-agnostic downstream rows stayed correct without edits: E-02 (`RSN-UNLISTABLE`, FSPEC:686) and
  E-26 (three thresholds in BR-10's record, FSPEC:721) make no run-level claim, so the split did not
  strand them. I checked for leftover "once per run" phrasing on corpus-level outcomes across the
  whole document and found none.
- The only remaining traceability edit — AC-6.2's rules column dropping "AT-31, AT-32" (FSPEC:143) —
  leaves the row with one rule (§Acceptance-test preamble) and two tests, satisfying the table's own
  stated invariant; it removes a test id from a rules column where it did not belong.
- Constraint citations still resolve at HEAD: DC-01, DC-05 and DC-18 exist in
  `docs/_constraints/DOMAIN-CONSTRAINTS.md` (lines 20, 143, 506).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings. No High finding is open; the delta introduced no defect and I found no claim in it that contradicts the repository or upstream REQ v0.9 at HEAD. | — |

DEFERRED: BR-9's notice catalogue is the one catalogue whose locus is left unstated (per-dispatch vs once-per-run); upstream AC-3.2 is silent too, and the config read happens once per run, so TSPEC can pin it without an FSPEC change.

## Questions

| ID | Question |
|----|---------|
| — | v9's Q-01 (are per-dispatch differing corpus-level outcomes representable?) and Q-02 (does the run-level mirror need an explicit non-oracle statement?) are both answered inside the document: yes, and yes — BR-9:511-512 and BR-9:537-538. No open questions. |

## Positive Observations

- **The fix landed at the locus, not at the adjective.** The revision could have satisfied the finding
  by sprinkling "per dispatch" through prose. Instead BR-10 grew a locus column, the closure count went
  from one test to two, and the two ATs grew a falsifying second scenario. The structure now makes the
  wrong implementation red rather than making the right one describable.
- **Upstream's own words were reused rather than paraphrased.** "Additive, not the oracle: nothing
  asserts on it" is AC-3.2's phrasing carried across intact, which keeps the downstream TSPEC author
  from re-deriving a weaker version of the same constraint.
- **The cheapest available fixture was reused.** AT-20 and AT-22 both hang their new clauses on AT-18's
  existing changing-corpus run instead of inventing a third fixture — less to maintain, and it forces
  the three observability tests to agree about one mid-run corpus change.
- **Set-equality discipline is uniform.** Every enumerated contract in the delta closes with set
  equality over a named full enumeration (BR-9's three catalogues, BR-10's two loci); no containment
  check crept in during the restructure.

## Recommendation

**Approved**

Both v9 High findings are resolved at the level they were raised — locus, closure count and
falsifying test clause — and the delta introduced no defect and contradicts nothing at HEAD.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

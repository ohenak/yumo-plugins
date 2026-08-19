# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 5

Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v4.md`, over
`git diff f005e6ed..HEAD` on the FSPEC — 3 insertions, 2 deletions, one commit
(`bc603aa0`). The document delta is small; the **upstream** delta is not: the same commit
rewrote the REQ from v0.4 to v0.6 (43 insertions, 32 deletions), landing four of the errata
this FSPEC had riding. Both were re-read against HEAD.

## What the round changed

| Site | Change | Assessment |
|---|---|---|
| Coverage map (FSPEC:90) | `FSPEC-LRN-15` gains `AC-5.1c` | Correct — REQ now carries AC-5.1c at `REQ-…md:373-375` |
| Traceability table (FSPEC:118) | `AC-5.1c → BR-14 → AT-32` | Correct and non-vacuous: BR-14's fourth row states the wrong-typed-key behaviour (FSPEC:594), and AT-32's second clause is a full positive oracle for it — enabled run, `maxDocuments` at literal 5 while the other two keep configured values, selection equal to a fixture literal, `NTC-KEYTYPE` naming the key (FSPEC:868-876) |
| BR-14 heading (FSPEC:585) | `AC-5.1c` added to the criterion list | Correct |

Nothing else in the document moved. That is the defect below: the REQ moved under it.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (O-4 abbreviated section names) | Medium | **Open** | O-4's discharge line still reads "Cross-Feature Patterns, Non-Convergences, Rejected Proposals, Process Learnings, Open Items" (FSPEC §Open Questions, O-4 row) against BR-6's full titles (FSPEC:384-390). Non-gating in a frozen round; carried below as `DEFERRED`. |
| F-02 (BR-9's third catalogue vs AC-3.2's "two set-equality tests") | Medium | **Resolved upstream** | REQ AC-3.2 now legislates the third catalogue itself and says "Three set-equality tests, one per catalogue" (`REQ-…md:322-325`). No divergence remains to route. |
| F-03 (E-07 / E-35 collision on `docs/discarded/`) | Medium | **Open** | E-07 still reads "only documents under `docs/discarded/`" (FSPEC:663) against E-35's selectable direct-path document (FSPEC:664), both pinned on AT-15 (FSPEC:800-803). Carried below as `DEFERRED`. |
| F-04 (BR-5's 5-byte accounting gap) | Low | **Open** | FSPEC:360 still quotes max 41,180; re-measured 41,175. Carried below as `DEFERRED`. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **inherited / nonlocal — Five load-bearing claims about the upstream REQ are now false at HEAD, and four of them still emit a live `ERRATUM: REQ`.** The REQ this FSPEC quotes is v0.6; every quotation is of v0.4. Site by site: (1) BR-2:270-272 — "the case REQ C-3 and AC-2.6 legislate against … `ERRATUM: REQ` rides"; AC-2.6 now states the opposite of "legislate against", verbatim agreeing with E-35: "given one directly at `docs/discarded/LEARNINGS-*.md`, it is a corpus member on ordinary terms" (`REQ-…md:300-303`). (2) BR-3:300 — "REQ AC-3.2's catalogue lists `RSN-TRUNCATED` and omits `RSN-NO-MATERIAL`"; AC-3.2 now lists `RSN-NO-MATERIAL` and says "Truncation is **not** a member" (`REQ-…md:315-319`). (3) BR-4:346-352 — "Where REQ AC-2.2 offered directory-rename rank-invariance … this rule supersedes it"; AC-2.2 no longer offers it, and states the superseding property in BR-4's own words: "the ordering is a pure function of (ordering key value, repository-relative path) and nothing else. Rank invariance under a directory rename is **not** claimed" (`REQ-…md:281-285`). (4) BR-5:366-369 — "REQ AC-2.1 still asserts the count *equals* the threshold for any corpus above it"; AC-2.1 now reads "equality above it is **not** claimed" (`REQ-…md:271-275`). (5) BR-14:606-607 — "REQ AC-5.1b's example makes that typo the detectable case and no longer holds — `ERRATUM: REQ` rides"; AC-5.1b now reads "A **misspelt section name** reads as absent and is AC-5.1a's state" (`REQ-…md:368-372`). This blocks under criterion (ii): each is a factual contradiction with the upstream document at HEAD, and they are not decorative. A live `ERRATUM: REQ` line is routed by the workflow, so four discharged errata re-fire against a REQ that already agrees — the erratum loop cannot converge while the FSPEC keeps asking for corrections that landed. A TSPEC author reading BR-2 or BR-14 is also told there is an open REQ/FSPEC conflict where there is none, and the natural resolution of a conflict is to re-open the decision. The fix is deletion, not re-decision: strike the five stale sentences (and the parenthetical at FSPEC:351-352 pointing at the report's ERRATUM line), leaving each rule's *behaviour* exactly as written — every one of the five now matches REQ v0.6 on the merits. | BR-2 (FSPEC:270-272), BR-3 (FSPEC:300), BR-4 (FSPEC:346-352), BR-5 (FSPEC:366-369), BR-14 (FSPEC:606-607) |
| F-02 | Medium | Local | **REQ v0.6's new O-8 has no counterpart in this FSPEC's obligation table.** O-8 records that under §4.1's defaults the byte bounds bind first, so the count cap and `RSN-COUNT` "have no exercise under default thresholds", and owes TSPEC "a named non-default-threshold fixture that makes the count cut the binding one" (`REQ-…md:455-457`). BR-5 states the same measured fact (FSPEC:358-366) and BR-9 keeps `RSN-COUNT` in the closed per-document catalogue (FSPEC:485), but the F-O table (F-O-1…F-O-6) carries no obligation for that fixture. Since BR-9's completeness test is set equality over the catalogue, `RSN-COUNT` will be *named* by a passing suite while no test ever drives a run into it — the AT set has no non-default-threshold count fixture either. One F-O row restating O-8 keeps the gap visible where TSPEC reads for its obligations. Non-gating this round. | F-O table (§Open Questions), BR-5 (FSPEC:358-366), BR-9 (FSPEC:485), `REQ-…md:455-457` |

DEFERRED: O-4's discharge line abbreviates two of BR-6's five section titles (`Rejected Proposals`, `Open Items`); BR-6's full titles are the measured basis (v4 F-01).
DEFERRED: E-07's "only documents under `docs/discarded/`" is not qualified to `docs/discarded/{feature}/`, so it and E-35 both claim AT-15's first clause (v4 F-03).
DEFERRED: BR-5 quotes max 41,180 where re-measurement at HEAD gives 41,175; the byte-accounting convention (heading line, trailing newline) is unnamed (v4 F-04).

## Questions

| ID | Question |
|----|---------|
| Q-01 | With errata (1)–(5) discharged upstream, is any `ERRATUM: REQ` still owed from this FSPEC? My reading of REQ v0.6 is no — the erratum ledger for this pair is empty, and the next dispatch's report should carry no ERRATUM line at all. Worth confirming, since a report that keeps emitting them is how the round after this one gets spent. |

## Positive Observations

- The AC-5.1c wiring is the good kind of small: three lines, and each one lands where a reader
  looks. The traceability row is not a paper entry — BR-14's fourth row already carried the
  behaviour and AT-32's second clause already asserted it positively (enabled run, named default,
  literal selection, `NTC-KEYTYPE` on the key), so the round closed a map gap over an
  implemented branch rather than promising coverage it would owe later.
- The upstream corrections went the direction this review argued for four rounds running, and they
  went there by adopting the FSPEC's *measured* position rather than by softening it: AC-2.1's
  "equality is not claimed", AC-2.2's pure-function-of-(key, path), AC-3.2's `RSN-NO-MATERIAL`
  and third catalogue, AC-2.6's direct-path corpus member. The FSPEC's rules need no change on the
  merits — only the sentences that describe a disagreement that no longer exists.
- BR-9's three catalogues survived the upstream round intact and are now legislated at both
  altitudes, which is the cheapest possible outcome for the completeness tests: `AT-32`'s set
  equality over the notice catalogue is now a REQ-level requirement too, not an FSPEC extension.

## Recommendation

**Needs revision**

One High, and it is a delete-only edit: five sentences quote REQ v0.4 at a HEAD that carries v0.6,
and four of them keep a discharged `ERRATUM: REQ` in flight. No rule, table, edge or AT changes —
every behaviour the five sentences surround already matches the corrected REQ. Strike them (BR-2:272,
BR-3:300, BR-4:346-352, BR-5:366-369, BR-14:606-607), optionally add the F-O row for REQ O-8, and the
document is done; the three deferred items and F-02 need no re-measurement and none of them blocks
TSPEC authoring.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}

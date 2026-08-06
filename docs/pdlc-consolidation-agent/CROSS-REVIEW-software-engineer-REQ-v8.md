# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Local (delta re-review — v7 findings + changed sections only)
**Baseline diffed:** `9c5ea35..HEAD` (9 revision commits, +122/−102; 683 lines, up from 663)

## Prior-Finding Disposition

All five v7 findings, checked against the revision.

| v7 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved — by the `action` discriminator, and the consequence is stated where a reader will hit it** | NFR-4 is now keyed "on the pair `(failure-mode-id, action)`" (`:527-528`) and states the rejected alternative in its own words: keying on the id alone "would let a merged `promote` PR suppress the `revise` and `retire` proposals AC-5.3 requires, making the remediation of an `ineffective` promotion unreachable and the §1 `Unfalsifiability` problem unsolved" (`:531-533`) — the finding's own argument, written down as the reason for the key rather than as a patch to it. `merged` stays in the key set with the qualification the finding asked for: "deliberately, and now harmlessly … with `action` in the key it suppresses only a re-`promote`, never a remediation" (`:536-538`). AC-5.1 carries the visible consequence in a new "Action, and what it discriminates" paragraph (`:390-394`): "a merged `promote` PR bars a second `promote` for that `(phase, artifact)` pair forever and bars **nothing else**". AC-5.4 restates it at the remediation site (`:448-449`). The AC-5.3 route is reachable. |
| F-02 | Medium | **Resolved, both halves, with one grammar** | The trailer is redefined as `PDLC-CONSOLIDATION-PROMOTIONS: {sorted id:action pairs}`, "one `{failure-mode-id}:{action}` pair per proposal the PR enacts … and **set-equal** to the proposals the PR enacts: a revision or a retirement (AC-5.4) sharing the PR is enumerated here like any other, under its own action" (`:246-248`) — so the membership question the finding said was undecided is now answered explicitly, in the direction that keeps the trailer set-equal. AC-3.3's "its own id" is gone: the retirement commit "carries the **retired promotion's own `failure-mode-id`** under the `revise` or `retire` action — AC-5.1 mints no second id for it" (`:263-264`), and the commit trailer moved to `PDLC-PROMOTION-ID: {id}:{action}` (`:261`) so the commit key and the PR key are one grammar. A PROPERTIES author now has exactly one enumeration to transcribe. |
| F-03 | Medium | **Resolved by the first of the two offered fixes, and the §4b row came with it** | AC-7.2's biconditional is scoped: "Its `pr:` field carries the URL of a PR **this pass opened**, when and only when this pass opened one — the biconditional is scoped to *this pass's own* PR, so an all-suppressed `no-op` (AC-1.4's second cause) leaves `pr:` empty and carries its evidence in the distinct `suppressed-by:` field instead (NFR-4, §4b); the two fields are never merged and a row may carry both" (`:507-509`). That last clause disposes of the mixed case the finding raised (a pass that opened one PR and suppressed another) without inventing a rule for telling two URLs apart. NFR-4 was updated to the same field name and states the negative half positively — the URL goes "in its log row's `suppressed-by:` field (§4b) … and **never** in AC-7.2's `pr:` field, which stays empty for a pass that opened nothing" (`:534-536`) — and both fields got §4b rows (`:605-606`), which is what Q-03 asked for. `suppressed-by:`'s permitted statuses (`promoted`, `promoted-degraded`, `no-op`) are set-equal to `duplicate-suppressed`'s own row (`:596`); I checked, they agree. |
| F-04 | Low | **Resolved** | The exempt record's field list now reads "status, trigger, `credential:`, reason code, and the held marker's passId and ISO-8601 timestamp, which AC-1.3 requires it to name, and only those" (`:36-37`), set-equal to AC-1.3's own requirement. The "never a basename" argument was kept and strengthened rather than dropped — it is restated as a property of the whole field set ("**no field it carries is ever a basename**") and then discharged for the two new members: "A passId is `{YYYY-MM-DD}-{n}` and a timestamp is neither a `LEARNINGS-*.md` basename" (`:38`). |
| F-05 | Low | **Resolved, and the mechanism is named rather than implied** | AC-1.3 now carries the complementary clause: "Because a standalone untracked file in a tracked directory is committable by any actor that is not pathspec-scoped, 'working tree only' is guaranteed against actors other than the pass too: this feature adds `docs/_decisions/.consolidation-lock` to the repository `.gitignore` (§5), which today carries no pattern matching it" (`:72-75`), with the HEAD `.gitignore` contents transcribed inline (verified, row 3 below) and the cost of omitting it stated ("a committed lock reaches every fresh clone and refuses every pass with `consolidation-in-progress` until `staleLockMinutes` elapses, per clone", `:75-76`). §5's in-scope list gained the matching row (`:632-633`), so the edit is scoped as work rather than assumed. |

Five of five resolved. No v7 fix regressed, and the F-01/F-02 fixes propagated into the four places
that depend on them without being asked twice — NFR-4, the REQ-CONS-03 trailer preamble, AC-3.3 and
AC-3.8b's "PR route under the same abandonment" paragraph (`:202-204`) all now say
`(failure-mode-id, action)` in the same words.

The three findings below are **new**, and two of the three are consequences of this round's own
edits: the `action` key (F-01) and the narrowed `artifact` definition (F-02). That is the same
pattern as v7 — a sharpening makes a previously-fuzzy contract collide visibly with a neighbour.
Neither is a regression in quality; both are the next contradiction down.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict

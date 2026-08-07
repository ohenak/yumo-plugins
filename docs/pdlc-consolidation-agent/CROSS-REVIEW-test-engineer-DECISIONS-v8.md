# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 8
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v7.md`. Diff base `50e28b23`
(the commit v7 reviewed) → HEAD; four revision commits touched this document (`eaf5c744`,
`cde34287`, `9fe8f762`, `d8a297e1`), +48/−11 lines confined to §9's Context paragraph, §9's
accepted-cost paragraph, §9's first Alternatives bullet, §11.2 conjunct 4 item (i), §11.2's
Anchor-provenance paragraph (continuation-anchor note + FSPEC-warranty scope note), and §11.3
item 1. Testing lens only: whether v7's two findings are closed, and whether the changed text
introduced a claim that is red on correct code or green on a regression. Unchanged sections
approved in v1–v7 are not re-litigated.

## Disposition of v7 findings

| v7 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | Medium | **Resolved** | I asked for §9's first Alternatives bullet — "treat an empty marker as `reclaim` — rejected. A *released* marker **is** an empty file" — to be annotated in place the way its sibling was, marked as the shipped behaviour, with `TSPEC:1940` / `:2640` cited and a pointer to the supersession note. All four landed (`eaf5c744`). The bullet now carries a parenthetical reading "**Rejected on a premise the `RELEASED:` sentinel removes — and this alternative is now the shipped behaviour.** Do **not** transcribe this bullet as current direction", spells the false premise out ("the sentence 'a *released* marker **is** an empty file' is false at HEAD"), names the shipped route ("an empty marker is a **truncated** one and reaches `markerVerdict`'s `reclaim` arm, recording `reclaimed-stale-lock` with abandoned id `unknown`"), names the oracle it would have produced (`"" ⇒ free`, no `reclaimed-stale-lock`) and calls it red, and points at the supersession note's *Consequence* bullet. Re-measured every anchor: `TSPEC:974-977` is the in-place `RELEASED: {passId} {ISO-8601}` write (`releaseMarker` is `await _writeFile(markerPath, "RELEASED: …")` at `:977`); `TSPEC:1940` is §10.3 row 4, "Marker present and **unparseable** — either **empty** … ⇒ `markerVerdict` ⇒ `reclaim` … `reclaimed-stale-lock`, abandoned id `unknown`"; `TSPEC:2640` is the four-fixture sentence, "the `""` and the neither-verb fixtures reclaim, the two `RELEASED:` fixtures do not, at either age". `DECISIONS:733-742`'s *Consequence* bullet does name this alternative by its own words, as the annotation claims. The Alternatives block is now uniformly annotated — no bullet reads as current that isn't |
| F-02 | Low | **Resolved** | I asked §11.2 item (i) to stop calling the seven-verb union "that domain's permitted set" and to use §5 domain 1's phrasing. Done (`cde34287`): it now reads "contained in that domain's **whole verb set (obliged ∪ permitted) as TSPEC §9.3 states it at `TSPEC:1724`** — obliged `add` and `commit`, plus permitted `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`". Re-measured `TSPEC:1724`: the `git, invoking tree` row carries `add`, `commit` in the **Obliged** column and the five reads in the **Permitted, not obliged** column, so the new label matches the cited table cell-for-cell and the column split is now stated rather than flattened. The two passages the document calls "the same set by construction" (`DECISIONS:292-297` and `:906-910`) are now worded alike |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **§11.2's new continuation-anchor note publishes a pair of self-referential counts that the commit publishing them falsified: it says "at this revision the pattern above returns **92** prefixed sites, while `` grep -onE '`:[0-9]+(-[0-9]+)?`' `` returns **122** bare tokens" (`DECISIONS:952-954`); at the revision that carries the sentence the two patterns return **98** and **132**.** I ran both published patterns over the document at every commit in this round: HEAD ⇒ 98 / 132; `d8a297e1` (the commit that wrote the sentence) ⇒ 98 / 132; `9fe8f762` ⇒ 96 / 121; `cde34287` ⇒ 96 / 122; `eaf5c744` ⇒ 96 / 122; `50e28b23` ⇒ **92 / 122** — exactly the published pair. So the numbers are a correct measurement of *the revision v7 reviewed*, carried forward into a revision whose own edits (this note names six continuation anchors inline, and §9/§11.3 added prefixed ones) moved both. The claim is not decorative: the sentence states its own purpose as a completeness self-check — "both counts belong to any re-sweep **so a re-runner can tell whether they have the whole set**" — and a re-runner at HEAD gets 98/132 against a published 92/122 and cannot distinguish "the document grew anchors" from "my pattern is wrong", which is precisely the discrimination the pair was added to provide. The fix is one clause, and the same paragraph already demonstrates it two sentences later: the older pair pins its measurement point — "returned **40** of the **42** sites present at the **sweep commit (`01624628`)**" — and that pair still reproduces exactly (I re-ran it: 42 wide / 40 narrow at `01624628`, differing in the two `TSPEC §7.1:806` sites). Do the same here: either restate as 98/132 **and** name the commit, or drop the absolute pair and state the invariant instead (wide-pattern count + bare-token count are both revision-local; re-derive both, never inherit them). Low, not Medium: nothing downstream transcribes these numbers into an oracle, and the failure mode is a spurious red for a re-sweeper, never a false green — but it is the third round in which a published count in this paragraph did not survive the edit that published it, so the durable fix is the pinned-commit form, not a re-count | §11.2, *Anchor provenance*, continuation-anchor note (`DECISIONS:952-954`) |

## Questions

## Positive Observations

## Recommendation

## Verdict

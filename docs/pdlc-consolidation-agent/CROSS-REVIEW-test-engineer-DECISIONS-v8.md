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

| ID | Question |
|---|---|
| Q-01 | §11.2's new scope note says "**This warranty covers `TSPEC:` anchors only.** The `FSPEC:` set was never swept mechanically" and publishes the equivalent recipe without running it (`DECISIONS:970-975`). I ran it: the document carries **27** `FSPEC:` sites over **11** distinct values, and at HEAD every live one resolves to the content its sentence describes — `:435-436` the two lifetime rows, `:441-442` the why-a-write paragraph, `:476` the `RELEASED:` row, `:479` the empty-or-neither-form row, `:1060-1063` the two-`∅`-conjuncts paragraph, `:2585` BR-14a, `:2678` E-11, `:2679` E-11b, `:2154` AT-Q7c (stale in its *content*, not its position — see the erratum). The only two stale values, `:415` and `:442`, now appear solely inside the retargeting record on `DECISIONS:973-974`. So the unswept set is in fact clean at this revision. Worth saying so — "swept by hand at this revision; all 11 distinct values resolve" — so the note records a *measured* state rather than an open exposure a later reader feels obliged to re-open? Not filed as a finding: understating a warranty is the safe direction. |
| Q-02 | Carried from v7 Q-02 and unchanged by this round: §11.2's "What is deliberately unasserted" table still holds one struck-through row annotated "**row withdrawn; this arm IS asserted**". A struck row is a member of neither the live set nor a separate withdrawn set, so the table cannot be checked by set-equality as it stands. A two-row split (live absences above, withdrawn absences below) would restore that. Still not a finding — no oracle depends on it — but it is now the only place in the document where an enumeration is not a clean set. |

## Positive Observations

- **The annotation asked for in v7 F-01 was applied at the width of the defect, not the width of the
  request.** I asked for the bullet to be marked as superseded; the revision also names the oracle a
  transcriber would have written (`"" ⇒ free`, no `reclaimed-stale-lock`), says why it is red
  (`TSPEC:1940`), names what it would be blind to (`reclaimed-stale-lock`, an AC-1.3
  operator-visible outcome), and adds an explicit "Do **not** transcribe this bullet as current
  direction". That is the difference between recording a supersession and preventing the test it
  would have produced. Every anchor in the new parenthetical resolves at HEAD.
- **The §9 Context rewrite fixed a stale upstream quotation by re-quoting, not by paraphrasing.** The
  paragraph now past-tenses the old FSPEC §4.1 row and quotes the replacement verbatim — I checked
  `FSPEC:441-442` character by character against the document's rendering of it ("a lifetime that
  said 'removed at step 16' would state a capability the runtime does not have, so release is
  specified as the one operation available: an in-place write of the same path") and it reproduces
  exactly. `grep -nc "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` still returns **0** at
  HEAD, so the premise the whole entry rests on is re-verified, not inherited.
- **The FSPEC §4.2 row renumbering was handled as a renumbering, with the cause stated.** The
  accepted-cost paragraph now says "`FSPEC:479` — the table's *fifth* row at HEAD; it was the fourth
  before the `RELEASED:` row at `FSPEC:476` was inserted, which is why this entry called it the
  fourth". I counted the table at HEAD: rows are `File absent` (475), `RELEASED:` (476),
  `IN-PROGRESS:` younger (477), `IN-PROGRESS:` older (478), `Present but empty, or neither form`
  (479). Both the ordinal and the cause are right. This matters for a test author, because the
  fourth row at HEAD is the *stale-lock reclaim* row and an AT written from a bare "fourth row"
  reference would fixture the wrong state.
- **v7 F-02's fix imported the source's column structure, not just its wording.** "obliged `add` and
  `commit`, plus permitted `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`,
  ⊕ `read-index`" is now readable straight off `TSPEC:1724`'s two columns, so a property author who
  follows the citation to check the phrase finds the phrase, not a five-verb column that argues with
  it.
- **The continuation-anchor discovery is a genuine method improvement, independent of F-01's
  arithmetic.** The observation that the published `grep` cannot see a bare `` `:684` `` — and that
  the fourteenth stale site in the last sweep was exactly such a token — is the kind of finding that
  only comes from re-running one's own recipe against one's own claim. The counts attached to it are
  stale; the mechanism it documents is correct and I verified it (`:1699`, `:2201-2202`, `:841-842`,
  `:850` are all TSPEC continuations invisible to the prefixed pattern).

## Recommendation

**Approved with minor changes** (0 High, 0 Medium, 1 Low).

Both v7 findings are closed on the merits, and neither was closed narrowly. F-01's Alternatives
bullet now carries the supersession, the false premise, the shipped route, the oracle it would have
produced, and a do-not-transcribe instruction — every anchor in it (`TSPEC:974-977`, `:1940`,
`:2640`) resolves at HEAD to the content the sentence claims. F-02's item (i) now says "whole verb
set (obliged ∪ permitted)" and splits the columns the way `TSPEC:1724` splits them, so the two
passages the document calls the same set by construction are finally the same words.

Nothing in the revision broke an unchanged section, and I checked each changed one against the
upstream file rather than against the document's account of it:

- §9's Context past-tenses the removed FSPEC lifetime row and quotes the replacement verbatim
  (`FSPEC:435-436`, `:441-442` — both reproduce exactly); the no-unlink grep still returns 0.
- §9's accepted-cost paragraph re-quotes the empty-or-neither-form row from `FSPEC:479` verbatim and
  explains the fourth⇒fifth renumbering by naming the row inserted at `FSPEC:476`. I counted the
  table; the ordinal and the cause are both right.
- §11.3 item 1's rewrite states the same three retargets and stays a closed record, not a live queue.
- §11.2's FSPEC-warranty scope note is honest about an unswept set. I swept it: 27 sites, 11 distinct
  values, every live one resolving at HEAD (Q-01).

One Low remains, and it is bookkeeping rather than direction: §11.2's new continuation-anchor note
publishes "92 prefixed sites / 122 bare tokens" for "this revision", which are the counts at
`50e28b23` — the revision v7 reviewed — while this revision measures 98/132. The pair's stated job
is to let a re-sweeper confirm they have the whole set, so a stale pair makes the check misfire in
the one direction it exists to serve. The remedy is the form the same paragraph already uses for its
40/42 pair: pin the commit the counts were measured at. It does not block approval — no oracle,
PLAN task or PROPERTIES row transcribes these numbers, and the failure mode is a spurious red for a
human re-runner, never a green on a regression.

Three upstream defects are emitted as ERRATUM lines in my final message; none is a defect of this
document, and this document transcribes none of them. Two are unchanged from v7 and still open at
HEAD (`FSPEC:2154`'s pre-widening AT-Q7c bound, and the TSPEC's own stale internal anchors at
`TSPEC:1405` / `:52` / `:2578` — I re-confirmed the citing lines are untouched by this round). The
third is new and was surfaced by this revision's own renumbering work: `TSPEC:1940` and `TSPEC:2590`
both call the empty-marker arm "FSPEC §4.2's **fourth** row", which at HEAD is the stale-lock reclaim
row (`FSPEC:478`); the empty arm is the fifth (`FSPEC:479`). An AT author fixturing "the fourth row"
from the TSPEC builds a stale-`IN-PROGRESS:` marker instead of an empty one and proves nothing about
E-11.

## Verdict

VERDICT: Approved with minor changes

APPROVAL-HASH: sha256:286797a97ad68d3986c38bc63b860a59133a6b479838d0a2a20079e899846c21
REVIEWED-COMMIT: d8a297e164e9cbd13aad2e1740c757615ffda9f4

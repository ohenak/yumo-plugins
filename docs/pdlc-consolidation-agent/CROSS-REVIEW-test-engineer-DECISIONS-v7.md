# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 7
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v6.md`. Diff base `01624628`
(the commit v6 reviewed) → HEAD; seven revision commits touched this document (`d5ed31a5`,
`da869757`, `c9b710f9`, `8ae08458`, `d0265525`, `e7d7d865`, `c42654f8`, `50e28b23`), +194/−79 lines
confined to the §2 index rows for DEC-CONS-01 and DEC-CONS-07, §3's Decision paragraph and residual,
§9 in full (heading, Decision preamble, both cost paragraphs, the supersession note, the second
Alternatives bullet, Reversibility, Re-evaluation triggers, Testability), §10's boundary paragraph,
§11.1's DEC-CONS-04/07 row, §11.2's marker bullet and Anchor-provenance note, §11.2's unasserted
table, and §11.3's preamble and items 1 and 3. Testing lens only: whether v6's three findings are
closed, and whether the changed text introduced an oracle that is red on correct code or green on a
regression. Unchanged sections approved in v1–v6 are not re-litigated.

## Disposition of v6 findings

| v6 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | I asked for §11.2 conjunct 4 item (i) to take the invoking-tree upper bound from `TSPEC:1724` rather than `FSPEC:2154`, to cite the TSPEC for it, and to cross-reference §5 domain 1. All three landed (`d5ed31a5`). Item (i) now spells the bound `add`, `commit`, `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`, says in bold "**Take the upper bound from `TSPEC:1724`, not from `FSPEC:2154`**", explains the widening with the table, and points at `DECISIONS:293-297`. Re-measured: `TSPEC:1724` carries exactly those seven verbs across its Obliged and Permitted columns; `TSPEC:1716-1719` reads "records **exactly four widenings** … each marked ⊕ below" **word-for-word** as quoted; `TSPEC:1743-1745` maps `read-object`⇒`git cat-file -e HEAD:{path}`, `read-remote`⇒`git remote get-url origin`, `read-index`⇒`git ls-files --cached --others --exclude-standard -- :(glob)…`; `TSPEC:672` is the `enumerateCorpus(_git)` signature. The red-on-correct-code transcription is gone |
| F-02 | High | **Resolved** | I asked for §11.3 item 3 to be retired to a resolved/superseded note recording both halves as applied upstream, and to state the chosen lane. Done (`da869757`). Item 3 is struck through and labelled "**CLOSED upstream; retained as a record, not as a live erratum**"; the preamble now reads "**Only item 2 is still live.**" Re-measured every anchor it now cites: `TSPEC:1685-1687` is the "**The push half is different, and an earlier draft of this section was wrong about it**" paragraph with `rtShellQuote` at `runtime-adapter.js:668-670`; `TSPEC:1675-1681` is scoped to the `gh` half ("That statement is exact for the `gh` half … `_ghRun` takes a **command string**", and `rtGhRun(command)` is indeed a command-string signature at `runtime-adapter.js:995`); `TSPEC:1693-1698` is the **Chosen** bullet carrying the `credential.helper=!f(){ … password=$PDLC_PLUGIN_REPO_TOKEN; };f` argv element; `TSPEC:1699+` records the command-string-seam and `gh`-for-both alternatives as rejected; `TSPEC:1405` reads "non-disclosure **on the outbound path** is structural … It is **not** structural inbound, and this row does not claim it is"; the changelog round is at `TSPEC:51-60`. The narrower anchor-level residue the item now raises is real and I verified it independently (see the Erratum note) |
| F-03 | Low | **Resolved, and strengthened past what I asked for** | I asked for 11/14 or an explanation of the `:618`/`:684` collapse. The revision (`c42654f8`) states **eleven** distinct values across **fourteen** sites and spells the split out inline ("`:618`⇒`:672` and `:684`⇒`:738` — two anchors in one sentence, counted as two"), which matches my own count of the same diff. It also publishes the extraction recipe at the width of the claim, and that claim is mechanically checkable — so I checked it. At `01624628`, `grep -on 'TSPEC[^ ]*:[0-9]\+\(-[0-9]\+\)\?'` returns **40** matches and `grep -onE 'TSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'` returns **42**; the diff between them is exactly two lines, both `TSPEC §7.1:806` (file lines 444 and 489). The 40/42 claim and the "missing exactly the two `TSPEC §7.1:806` sites" claim both reproduce verbatim |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§9's first Alternatives bullet still presents the shipped behaviour as rejected, on a premise that is false at HEAD — and it is the one bullet in that block the revision did not annotate.** The bullet reads: "**Preserve FSPEC §4.2's empty arm — treat an empty marker as `reclaim`** — rejected. A *released* marker **is** an empty file, so it records `reclaimed-stale-lock` on every steady-state pass after the first" (`DECISIONS:752`). Under the shipped release form that premise is simply untrue: release is an in-place write of `RELEASED: {passId} {ISO-8601}` (`TSPEC:974-977`), so a released marker is parseable and non-empty, and an *empty* marker is a truncated one that **must** reach `markerVerdict`'s `reclaim` arm (`TSPEC:987-991`, §10.3 row 4 at `TSPEC:1940`, fixture set at `TSPEC:2640`). The document knows this — §9's own supersession note says so in terms, naming this very bullet: "this entry's *rejected* first alternative is the shipped behaviour … That is verbatim the alternative rejected below" (`DECISIONS:722-728`). What makes this a finding rather than a nitpick is the asymmetry the revision itself introduced: the **second** bullet got an inline supersession parenthetical in this same edit ("(**Still rejected upstream, on a reason that outlived the empty payload** …, `TSPEC:987-994`)"), and the **third** needs none, so a reader scanning the Alternatives block — which is exactly what a PROPERTIES or PLAN author does when asking "what was ruled out?" — sees two bullets carrying current-state annotations and one carrying none, and reasonably reads the unannotated one as still current. Transcribed, it yields the oracle `"" ⇒ free, no reclaimed-stale-lock`, which is red against `TSPEC:1940` and blind to `reclaimed-stale-lock`, an AC-1.3 operator-visible outcome — the same failure class as v6's F-01, one section away from where it was just fixed. It is Medium rather than High only because the correct direction is stated loudly in four other places (§9's note, §9's Testability (ii), §11.1's DoD row, §11.2's marker bullet (c)) and nothing addressed to a downstream author now carries the wrong version. Fix: annotate the bullet in place the way its sibling was — mark it **rejected on a premise the `RELEASED:` sentinel removed, and now the shipped behaviour**, cite `TSPEC:2640` / `:1940`, and point at the supersession note | §9, Alternatives, bullet 1 (`DECISIONS:752`) |
| F-02 | Low | Local | **§11.2 item (i) labels the seven-verb union "that domain's permitted set", but `TSPEC:1724`'s Permitted column is the five reads alone — and §5 domain 1, the passage item (i) cross-references, gets the label right.** Item (i) now reads "contained in that domain's permitted set **as TSPEC §9.3 states it at `TSPEC:1724`** — `add`, `commit`, `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`" (`DECISIONS:890-891`). The **set** is right: the upper bound on an observed set is obliged ∪ permitted, and those are exactly the seven cells `TSPEC:1724` carries. The **label** is not: at `TSPEC:1724` `add` and `commit` sit in the *Obliged* column and the *Permitted, not obliged* column holds the five reads, so an author who follows the citation to check the phrase reads a five-verb Permitted column and may drop `add`/`commit` from the bound — which is red on correct code, since AT-Q7c's Given obliges both. The phrase "its permitted set" is inherited from `FSPEC:2154`, the very rendering item (i) declares stale two sentences later, so it is the last surviving fragment of the thing being corrected. §5 domain 1 shows the fix already: "Asserted as containment against that domain's **whole** verb set as TSPEC §9.3 states it (`TSPEC:1724`): obliged `add` and `commit` … plus the five permitted reads" (`DECISIONS:292-297`). Low because the operative seven-verb list is spelled inline and correct, and an author who did drop the obliged verbs would collide immediately with the same sentence's lower bound `{add, commit}`. Fix: say "whole verb set (obliged ∪ permitted)" as §5 does, so the two statements the document declares "the same set by construction" are also the same words | §11.2, DEC-CONS-03 bullet, conjunct 4 item (i) (`DECISIONS:890`) |

## Questions

| ID | Question |
|---|---|
| Q-01 | §11.3's preamble still opens "Three items **were** handed up … so a reader of *this* document knows the corresponding entry is **provisional**", and only the following sentence narrows it to item 2. With items 1 and 3 closed and DEC-CONS-01's index row now saying "Both halves are settled", the word *provisional* in the preamble applies to exactly one of the three. Worth one clause ("— item 2's entry, DEC-CONS-05, is the only one still provisional") so the preamble and the index row cannot be read against each other? Not filed as a finding: no oracle depends on it. |
| Q-02 | The revision withdrew a row from §11.2's "What is deliberately unasserted" table by striking it through in place and adding "**row withdrawn; this arm IS asserted**". That is legible, and I would rather have it than a silent deletion. But the table's contract is a set — "these, and only these, are the absences a PROPERTIES author inherits" — and a struck row is a member of neither side. Is it worth a two-row split (live absences above, withdrawn absences below) so the live table stays a clean enumeration a set-equality check could be written against? |

## Positive Observations

- **The supersession is the strongest thing in this revision, and it was found by re-measurement
  rather than by being told.** The note does the thing v6's Q-02 asked for and more: it withdraws its
  own earlier claim in terms ("An earlier draft of this note said the `present` half 'carried' and
  only the payload moved; that is **withdrawn** — it is exactly backwards about the probe"), then
  separates payload, probe, consequence and what-carried into four labelled bullets. Every anchor
  reproduces at HEAD: `TSPEC:974-977` is BR-14a's in-place `RELEASED:` write, `TSPEC:987-988` is
  "reads **`file_missing` alone as absent**, and treats `{ok:true}` and `file_empty` alike as
  **present**" verbatim, `TSPEC:1026` restates it, `TSPEC:2590` is §13.1 row 13, `TSPEC:1940` is
  §10.3 row 4, `TSPEC:2640` is the four-fixture sentence, `TSPEC:951` is `parseMarker`'s two-form
  arm, `TSPEC:998-1003` the read-back conjunct, `TSPEC:1036`/`:2658-2660` the residue line,
  `FSPEC:2585`/`:2678`/`:2679` BR-14a / E-11 / E-11b. Getting the probe half backwards would have
  cost an oracle, and the note says so.
- **The four-fixture pairing is stated as a falsifiability argument, not as a fixture list.** §9's
  Testability (ii) and §11.2's bullet (c) both carry the reason the pairing exists — "an
  implementation that reclaims on every take passes the reclaim fixtures alone, and one that never
  reclaims passes the `RELEASED:` fixtures alone, so only the pairing falsifies both" — which is the
  correct form of the check and matches `TSPEC:1940`'s own wording. §11.1's DoD row was updated to
  name the same four, and the ownership-manifest claim ("all four sit in **one** case in the marker
  file's single owning task") is verified against `TSPEC:2636-2640`.
- **The withdrawn unasserted row was withdrawn with a positive replacement, not just deleted.** The
  row now reads "**row withdrawn; this arm IS asserted** … and it is asserted by the `""` fixture in
  the four-fixture marker case (`TSPEC:1940`, `:2640`). A PROPERTIES author must **not** read this
  row as licence to omit it." Turning an absence into a named positive assertion, in place, is
  exactly the treatment an absence-only oracle deserves.
- **The anchor recipe is now a claim I could execute rather than one I had to trust.** v6's F-03 was
  a bookkeeping complaint; the answer replaced the disputed counts with a stated `grep -onE` pattern,
  a stated site count, a stated commit, and a stated failure mode of the narrower pattern. I ran both
  patterns at `01624628`: 40 and 42, differing in exactly the two `TSPEC §7.1:806` sites. That is a
  reproducible method, and "the site count is a function of the revision, not a constant" is the
  right warning to attach to it.
- **Both remaining findings are in one direction and neither is a decision defect.** Nothing in this
  revision reopened a settled question, no decision recorded here is wrong, and every downstream
  direction addressed to a PLAN or PROPERTIES author now points at the shipped form.

## Recommendation

**Needs revision** (0 High, 1 Medium, 1 Low).

All three v6 findings are closed on the merits. F-01's bound is taken from `TSPEC:1724` with the
widening argument and the §5 cross-reference; F-02's item 3 is retired with the credential-helper
lane named and both TSPEC rounds cited; F-03's counts are restated at 11/14 with a published recipe
whose two headline numbers I reproduced exactly. The DEC-CONS-07 supersession that arrived alongside
them is correct in every anchor I resolved, and it corrects its own prior draft rather than defending
it.

One Medium blocks approval, and it is small and local:

1. **F-01** (Medium) — §9's first Alternatives bullet ("treat an empty marker as `reclaim` —
   rejected. A *released* marker **is** an empty file") is the behaviour the TSPEC now ships
   (`TSPEC:1940`, `:2640`), stated on a premise `TSPEC:974-977` falsifies, and it is the only bullet
   in that block the revision left unannotated while annotating its neighbour. Annotate it in place
   the way bullet 2 was annotated. This is a two-sentence edit, not a rework.
2. **F-02** (Low) — §11.2 item (i) calls the seven-verb union "that domain's permitted set as
   `TSPEC:1724` states it"; at `TSPEC:1724` the Permitted column is the five reads and `add`/`commit`
   are Obliged. Use §5 domain 1's phrasing ("whole verb set") so the two passages the document calls
   the same set by construction are also worded alike.

Nothing else in the revision broke an unchanged section. §2's two index rows, §3's Decision and
residual, §10's boundary paragraph, §11.1's DoD row and §11.2's unasserted table all changed only to
carry the two upstream closures, and each of their new anchors resolves to the content the
surrounding sentence describes. §11.3's preamble and items 1 and 3 read as a settled record rather
than as a live queue, which is what v6 asked for.

Two upstream defects are emitted as ERRATUM lines in my final message. The first is unchanged from v6
and still open at HEAD: `FSPEC:2154`'s AT-Q7c row spells the invoking-tree upper bound
`{add, commit, read-branch, read-status}` and calls it "(its permitted set)", which is FSPEC §6.5's
pre-widening set — an AT written from that row as it stands is red on correct code, since a
`promoted` pass observes `read-index` through `enumerateCorpus(_git)` on AT-Q7c's own Given. This
document no longer transcribes it, so this is FSPEC's to correct, not this document's. The second is
the anchor-level residue §11.3 item 3 now raises and I verified independently: `TSPEC:1405` cites
`TSPEC:1832` for §10.3 row 1a and `TSPEC:1522` for `openClone`, whose HEAD positions are `:1937` and
`:1602`, and the changelog entry at `TSPEC:52` cites the NFR-2 row as `:1325`, which is a blank line
at HEAD. Those are the TSPEC's own carriers; this document's inherited copies were corrected in the
v5 sweep.

## Verdict

VERDICT: Needs revision

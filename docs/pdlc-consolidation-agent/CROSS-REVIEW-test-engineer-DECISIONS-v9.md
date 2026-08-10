# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 9
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v8.md`. Base commit
`d8a297e1` (the commit v8 reviewed) → HEAD `eb0abde7`; seven revision commits touched the document
(`f960053b`, `41fc0f6e`, `d7663912`, `395eaf4f`, `1db99e8a`, `70d75471`, `eb0abde7`), +131/−41 lines,
confined to the version cell, §2's index table and numbering paragraph, §9's and §10's and §11's
FSPEC anchors, §11.2's AT-Q7c conjunct-4 item and anchor-provenance paragraph, and one wholly new
top-level section (§12, DEC-CONS-08). Testing lens only: whether v8's finding is closed, and whether
what changed introduces a claim that would make a test red on correct code or green on a regression.
Sections unchanged since v8 are not re-litigated.

## Disposition of v8 findings

| v8 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | Low | **Open, unchanged** — and now further from true | v8 asked that §11.2's continuation-anchor pair ("**92** prefixed sites … **122** bare tokens") either be pinned to the commit it was measured at, the way the older `40`/`42` pair is pinned to `01624628`, or be restated as an invariant. The sentence is byte-identical at HEAD (`DECISIONS:969-971`); no commit in this round touched it. Re-measured at HEAD: `grep -onE 'TSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'` returns **99**, and `` grep -onE '`:[0-9]+(-[0-9]+)?`' `` returns **157** — against the published 92/122. Still Low for the reason v8 gave (nothing transcribes these numbers into an oracle; the failure mode is a spurious red for a human re-sweeper, never a false green), and re-filed below as F-04 because the same paragraph gained a *second* published pair this round that misses in the same direction (F-01) |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The new FSPEC-sweep paragraph publishes a count that does not reproduce at the revision it claims to have been measured at, and an enumeration ("one site") that its own recipe falsifies.** The paragraph states: "The recipe is `` grep -onE 'FSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?' ``; run at this revision it returned **27** citation sites over **nine** distinct stale values" (`DECISIONS:987-992`). I ran exactly that recipe twice: at HEAD it returns **29** sites, and at `70d75471` — the commit that wrote the sentence — it also returns **29**. So the number was not off because a later commit moved it; it did not hold when written. The nine retargets themselves are **all correct** (I resolved every one against the FSPEC at HEAD — see Positive Observations), which is precisely why the count matters: the count is the only part a re-runner can check mechanically, and it is the part that misses. Same paragraph, second miss: "**One site is deliberately left carrying the old value** — §11.2's quotation of its own withdrawn warning" (`DECISIONS:996-998`). The recipe returns **four** sites carrying pre-sweep values: `FSPEC:2154` twice (`:918`, `:1001` — the withdrawn-warning quotation *and* the §11.2 "What is deliberately unasserted" region), `FSPEC:415` (`:989`) and `FSPEC:442` (`:990`) in the history sentence two lines above the claim. Three of the four are explained by their surrounding prose, so nothing here is *wrong* about the FSPEC; what is wrong is that a re-runner told to expect one exception and finding four cannot tell "the sweep was incomplete" from "the prose accounts for these". Fix in the same shape the paragraph already knows: pin both numbers to the commit measured (`70d75471`) or drop the absolutes, and state the exception as the set of values deliberately retained (`{2154, 415, 442}`) rather than as a count. Medium, not High: no PROPERTIES row, AT or fixture transcribes these numbers, so the failure mode is a spurious red for a human, never a false green — but this is the second consecutive round in which a published self-check count did not survive its own edit (F-04), and the paragraph's own new lesson says "the counts they return are a function of the revision, never a constant" while publishing one that was already wrong | §11.2, *Anchor provenance*, FSPEC-sweep paragraph (`DECISIONS:987-998`) |
| F-02 | Medium | Local | **§12 is the one section carrying code anchors, and it is the one section no anchor warranty covers — both of its `orchestrate-dev.js` anchors miss at HEAD, and one missed when written.** The commit table cites "One `crossReviewPath` builder (`orchestrate-dev.js:6311-6325`)" (`DECISIONS:1128`) and "A matching complete wave ledger skips Phase I whole (`:10836-10847`, `:10883`)" (`DECISIONS:1129`). At HEAD, `crossReviewPath` is defined at `orchestrate-dev.js:6526-6528`; lines 6311-6325 are the optimizer dispatch inside the review loop, unrelated code. At `41fc0f6e` — the commit that wrote §12 — `crossReviewPath` was at `:6330`, so this anchor never resolved, even at authoring time. The ledger anchor *did* resolve at `41fc0f6e` (`:10836` was `let ledgerResume = false; … allWavesRecorded`) and has since drifted: at HEAD the ledger resume block is `orchestrate-dev.js:11043-11156`. The behavioural claims are both true independently of the anchors — I confirmed the single-builder property by grep (every cross-review path at HEAD is spelled through `crossReviewPath`: `:6100`, `:7666`, `:7677`, and the definition at `:6526`), and the complete-ledger skip exists at `:11043-11156`. §11.2's warranty is explicitly scoped to `TSPEC:` and (as of this revision) `FSPEC:` anchors; the third anchor class this revision introduced — `orchestrate-dev.js:` — is swept by nothing. Either re-measure the two and extend the warranty sentence to name the code-anchor class, or locate them the way §11.3(e) already prescribes for hand-edited files ("located by the surrounding named heading and never by line index", `TSPEC:2449`) — `crossReviewPath` and `parseWaveLedger` are both exported names that grep finds exactly | §12, commit table (`DECISIONS:1128-1129`) |
| F-03 | Medium | Local | **§12's evidence is two commit shas that no branch contains, which makes its Reversibility claim unverifiable from the branch it is written on.** The table keys both rows on `202f92e1` and `98b7429e` (`DECISIONS:1128-1129`), and the Reversibility field rests on them: "Both are additive, separately revertable commits with their own tests" (`DECISIONS:1152`). `git branch -a --contains 202f92e1` and `… 98b7429e` both return **empty**, and `git merge-base --is-ancestor <sha> HEAD` exits 1 for each: the objects survive only as rebased-away duplicates, reachable from no ref. The changes themselves *are* on this branch, under different shas — `git log -S "export function crossReviewPath"` names **`9a1c5222`**, and `git log -S "allWavesRecorded"` names **`26e51d1c`**, both ancestors of HEAD, and `git diff origin/main...HEAD -- pdlc/workflows/orchestrate-dev.js` shows +970/−25, so the decision's substance holds. What does not hold is its checkability: a reviewer on a fresh clone who runs `git show 202f92e1` to test "separately revertable" gets *unknown revision*, and the one claim in §12 that a human is most likely to verify before merging a scope-widening PR is the one that cannot be verified as cited. Retarget both shas to `9a1c5222` / `26e51d1c` and say they are branch-local and rebase-fragile, or cite them by subject line, which survives rebase — the subjects are stable (`fix(pdlc): CR F-11 — reviewer prompts name the exact cross-review path…`, `feat(pdlc): honour a complete wave ledger…`). Medium: the underlying record is true and the tests it names exist, so nothing downstream is mis-specified | §12, commit table and *Reversibility* (`DECISIONS:1128-1129`, `:1152`) |
| F-04 | Low | Local | **Carried from v8 F-01, unresolved and now wider.** §11.2's continuation-anchor note still publishes "**92** prefixed sites … **122** bare tokens" "at this revision" (`DECISIONS:969-971`); HEAD returns **99** and **157**. The published-count history across rounds is 98/132, 98/132, 96/121, 96/122, 96/122, 92/122, 92/122 — the pair has been re-measured five times and pinned zero times, while the older `40`/`42` pair in the same paragraph, which *is* pinned to its sweep commit (`01624628`), still reproduces exactly (I re-ran it: 42 wide / 40 narrow at that commit). The fix is the one the paragraph already demonstrates two sentences later, and it is one clause. Still Low: spurious red for a human re-sweeper only | §11.2, *Anchor provenance*, continuation-anchor note (`DECISIONS:969-971`) |

## Questions

| ID | Question |
|---|---|
| Q-01 | §12's *Consequence* says the durable guard TE F-05 names — a PROPERTIES row for the wave-ledger resume contract — "is raised as an erratum in this phase rather than minted here", and grounds the gap in `consolidationTraceability.test.js`'s register covering "`AT-…` ids only". I confirmed the ground: that suite matches on `AT_TOKEN_RE = /AT-[A-Za-z0-9]+/g` (`consolidationTraceability.test.js:45`) over the FSPEC's AT register (`:77`), so no non-`AT-` change is reachable from any row — the claim is exact. The open question is where the erratum lands: `PROPERTIES` is this feature's document, but the row §12 asks for is filed "against `pdlc/workflows/` rather than against this feature". An ERRATUM line routed to this feature's PROPERTIES author will produce either a row that does not belong to this feature or no row at all. Would §12 be better served naming the destination explicitly (a queue row / a REQ of its own, which its own first re-evaluation trigger already contemplates) rather than a phase-local erratum? Not filed as a finding — the decision to *not* mint the row here is right, and mis-routing is the orchestrator's to resolve, not this document's. |
| Q-02 | Carried from v8 Q-02, unchanged for a third round: §11.2's "What is deliberately unasserted" table still holds one struck-through row annotated "**row withdrawn; this arm IS asserted**" (`DECISIONS:1047`). A struck row is a member of neither the live set nor a separate withdrawn set, so the table cannot be checked by set-equality as it stands; a two-row split (live absences above, withdrawn absences below) would restore that. Still not a finding — no oracle depends on this table — but with §12 added, the document now has two enumerations a reader might reasonably want to check mechanically and one of them still cannot be. |

## Positive Observations

- **All nine FSPEC retargets resolve at HEAD, and each one lands on the content the document says it
  lands on.** I checked every target line against the FSPEC rather than trusting the list:
  `:449-450` are the two lifetime rows ("Released … **in-place rewrite** … `RELEASED: {passId}
  {ISO-8601}`" / "Removed | **never by the pass**"); `:455-456` are the reason the FSPEC gives;
  `:490` is the `RELEASED:` row; `:493` is the empty-or-neither-form row, and it is the table's
  *fifth* exactly as claimed; `:1075-1077` are the two `∅` equalities and the "weakening them to
  containment would leave that row nothing to catch" warning; `:2169` is AT-Q7c; `:2600` is BR-14a;
  `:2693` / `:2694` are E-11 / E-11b. The paragraph's claim that "the offsets differ per region
  (+14 in §4.1/§4.2, +15 elsewhere), so a uniform re-base would have been wrong" is arithmetically
  true of the nine pairs. This is a real sweep, not a constant added to a list.
- **The v8 AT-Q7c erratum was answered upstream and the withdrawal is written the right way round.**
  §11.2's conjunct 4 no longer says "take the upper bound from `TSPEC:1724`, **not** from
  `FSPEC:2154`"; it *quotes* that warning, marks it withdrawn as of FSPEC v11.5, and says it was
  correct when written. I verified both halves at HEAD: `FSPEC:2169` now states the bound as "§6.5's
  frozen `{add, commit, read-branch, read-status}` ∪ every widening TSPEC has recorded against it
  under DEC-LAYER-01 … ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`", spells the seven-verb set
  out in full, and carries the oracle reason in its own voice ("a test transcribing §6.5's
  pre-widening literal is red on correct code"); `TSPEC:1724`'s *invoking tree* row carries the same
  two columns. The two upstream sources are now the same set by construction, which is what makes
  "either upstream source may be transcribed now" a safe instruction rather than a relaxation. The
  standing direction — transcribe the *recorded* set, never §6.5's frozen literal — survives the
  withdrawal intact, so a property author who read the v8 text and one who reads this one write the
  same assertion.
- **The document quotes the FSPEC changelog for its own erratum's disposition instead of asserting
  it.** `FSPEC:14-22` is the v11.5 erratum-round entry, and it states the defect in the same terms
  this entry used, including "`read-index` is observed on AT-Q7c's own `promoted` Given via §7.1's
  corpus enumeration — so an AT transcribing the row as it stood was red on correct code". An
  erratum closed by pointing at the upstream's own record of closing it is checkable by a reader who
  trusts neither document.
- **§12's testing content is the part I most expected to be hand-waved, and it is the most exact part
  of the section.** Three claims, three checks. The traceability gap: `AT_TOKEN_RE` at
  `consolidationTraceability.test.js:45` is `/AT-[A-Za-z0-9]+/g`, so a non-`AT-` change is indeed
  unreachable from every row — the section does not overstate the coverage it lacks. The tests: the
  CR F-11 block runs `reviewLoop.test.js:1302-1401` (1302 is its `─── CR F-11 …` header, 1401 its
  closing `});`), and the complete-ledger case is at `waveExecution.test.js:1624` with the assertion
  §12 relies on — `expect(dispatchedTaskIds(record)).toEqual([])` on a `success` outcome, which is a
  set-equality on the empty dispatch set paired with a positive terminal-status assertion, not an
  absence-only oracle. The merge guard: `MERGE_GUARD_DEFAULTS` at `orchestrate-dev.js:48-53` is
  `["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"]`, so "Phase MERGE will
  not auto-merge this PR under any `mergeMode`" is true of the shipped constant, and the section is
  right that a human read is the review the split PR would have bought.
- **The "two lessons" paragraph names the right lesson for the wrong-count problem, even though the
  count beside it is wrong.** "The upstream that moves is the one nobody sweeps" and "a retarget is
  not a fix — it is a measurement with a shelf life" are exactly the generalisations this round's
  evidence supports: the TSPEC spot-checks all reproduce at HEAD (I re-ran `:974-977`, `:987-988`,
  `:1405`, `:1602`, `:1724`, `:1937`, `:1940`, `:2640`, plus `:951`, `:672`, `:2203` — all resolve to
  the content cited), while every FSPEC anchor in the document had moved. The lesson is durable and
  belongs in the harvest; F-01 is about the arithmetic sitting next to it, not about the lesson.
- **§2 and §10 absorbed DEC-CONS-08 without breaking either enumeration.** §2's numbering paragraph
  now says DEC-CONS-01…07 are the `TSPEC §13.1` rows and DEC-CONS-08 was taken later in Phase CR,
  and §10 says "Seven are promoted above, as DEC-CONS-01…07 (DEC-CONS-08 in §12 is not a §13.1
  row)". Thirteen rows = seven promoted + six dispositioned still adds up, which is the arithmetic a
  reader checks first when a table gains an eighth member. Appending §12 rather than renumbering also
  keeps every `DECISIONS:§N` cite downstream valid — the stated reason, and the correct one.

## Recommendation

**Approved with minor changes** (0 High, 3 Medium, 1 Low)

No blocking finding. The one substantive thing this round had to get right — whether the withdrawal
of the "take the bound from `TSPEC:1724`, not `FSPEC:2154`" warning leaves a property author writing
the same assertion as before — is right, and is checkable at both upstreams: `FSPEC:2169` and
`TSPEC:1724` now carry the same seven-verb recorded set, and the instruction that survives
("transcribe the *recorded* set, never §6.5's frozen literal") is the instruction that was there
before. Nothing in the revision loosens an oracle.

Nothing in the revision broke an unchanged section either. I re-resolved every FSPEC anchor the
round moved (nine retargets, all correct, all landing on the claimed content), spot-checked the
eleven TSPEC anchors the document says did not move (all reproduce), and re-derived §10's
thirteen-row arithmetic after DEC-CONS-08 (still seven + six).

The three Mediums are all one class — published evidence that does not resolve as cited — and none
of them reaches an oracle:

- F-01: the FSPEC-sweep paragraph's "27 sites" does not reproduce at the commit that wrote it (29
  there, 29 at HEAD), and its "one site deliberately left carrying the old value" is four by its own
  recipe. The nine retargets it reports are all correct; it is the mechanically checkable part that
  misses.
- F-02: §12's two `orchestrate-dev.js` anchors both miss at HEAD, and the `crossReviewPath` one
  missed at authoring time. Code anchors are a third anchor class that §11.2's warranty does not
  cover; the behaviours they point at are true, so this is a locator defect.
- F-03: §12 keys its evidence on two shas no branch contains — the branch carries the same work as
  `9a1c5222` and `26e51d1c` — which makes "separately revertable commits" unverifiable exactly where
  a human reviewer of a scope-widening PR would go to check it.

F-04 is v8's Low carried unchanged: 92/122 published, 99/157 at HEAD, still unpinned after five
re-measurements, while the pinned `40`/`42` pair in the same paragraph still reproduces at
`01624628`. Together with F-01 it is the same one-clause fix applied to two sentences.

One upstream defect is emitted as an ERRATUM line in the final message. It is not a defect of this
document, which transcribes it nowhere: `TSPEC:1940` and `TSPEC:2590` both still call the
empty-or-neither-form arm "FSPEC §4.2's **fourth** row", which at FSPEC HEAD is the older
`IN-PROGRESS:` stale-lock row (`:492`) — the empty arm is the **fifth** (`:493`). This document gets
the ordinal right (§9 says "the table's *fifth* row at HEAD" and explains the renumbering); the TSPEC
does not, and an AT built from "the fourth row" constructs a stale-`IN-PROGRESS:` fixture instead of
an empty one and proves nothing about E-11. Carried from v8, re-confirmed untouched this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}

APPROVAL-HASH: sha256:fbd08c3639247fe3637ed1de6c40d7fe11db59a5610d1d96861617221ed6dfcf
REVIEWED-COMMIT: eb0abde7d977b3aa81d3f20d567e64d392152cba

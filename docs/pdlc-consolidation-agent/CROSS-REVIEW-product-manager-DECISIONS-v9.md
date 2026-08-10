# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 9
**Scope:** Local (per-finding tags in the table)

## Delta

Re-review of `d8a297e1..HEAD`, six document commits (131 insertions, 41 deletions), plus the
merge commit `809dd114` that carries PR #39 into this branch's history:

- `f960053b` / `41fc0f6e` — **DEC-CONS-08 is minted**: a new §2 index row and a new top-level §12
  recording that the two mid-phase `orchestrate-dev.js` changes stay on this branch (TE CR F-05 /
  Q-03). This is the only *new decision* in the delta and takes most of this review.
- `d7663912` — §10's "Seven are promoted above" disambiguated to "as DEC-CONS-01…07 (DEC-CONS-08 in
  §12 is not a §13.1 row)".
- `395eaf4f` / `1db99e8a` / `70d75471` / `eb0abde7` — the **FSPEC anchor sweep**: nine distinct
  stale FSPEC values retargeted across the document, §11.2 conjunct 4's AT-Q7c warning **withdrawn**
  because the erratum was answered upstream in FSPEC v11.5, and the *Anchor provenance* warranty
  widened from `TSPEC:` to both upstreams.

Changed spans: §2's table and numbering note (`DECISIONS:58-63`); §9's Context, accepted-cost and
re-evaluation-trigger paragraphs (`:664`, `:688-696`, `:803-807`); §10's promotion count (`:838-839`)
and boundary paragraph (`:856`); §11.2 conjunct 4 (`:905-943`); §11.2's not-asserted table row
(`:1047`); *Anchor provenance* (`:987-1009`); §11.3 item 1 (`:1063-1068`); and the whole of §12
(`:1119-1174`). Nothing else re-litigated.

My one open finding from v8 was F-18 (Low, the self-published anchor counts). Its status is below.

## Verification of the changed sections

I re-resolved every anchor the delta publishes, against the FSPEC, TSPEC and
`pdlc/workflows/orchestrate-dev.js` at HEAD, and checked the two commit hashes §12 names.

- **All nine FSPEC retargets resolve, and the offsets really are non-uniform.** I read each one:
  `:449-450` is the two lifetime rows ("Released | … an **in-place rewrite** … `RELEASED: {passId}
  {ISO-8601}`" / "Removed | **never by the pass**"), `:455-456` the FSPEC's own reason, `:490` the
  `RELEASED:` row, `:493` the empty-or-neither-form row quoted verbatim in §9, `:1075-1077` the
  "equalities, with the empty set rather than with a permitted set" passage, `:2169` AT-Q7c,
  `:2600` BR-14a, `:2693` E-11, `:2694` E-11b. The document's claim that the offsets differ by
  region (+14 in §4.1/§4.2, +15 elsewhere) holds on the numbers it publishes, so the paragraph's
  warning that a uniform re-base would have been wrong is earned, not decorative.
- **The AT-Q7c withdrawal is correct and the quotation is exact.** `FSPEC:2169` at HEAD states the
  bound as "§6.5's frozen `{add, commit, read-branch, read-status}` ∪ every widening TSPEC has
  recorded against it under DEC-LAYER-01, which at TSPEC §9.3 is ⊕ `read-object`, ⊕ `read-remote`,
  ⊕ `read-index`", spells the seven-verb set out, and carries the reason in its own voice — "a test
  transcribing §6.5's pre-widening literal is red on correct code". The changelog entry the document
  cites at `FSPEC:14-22` is erratum (1) of the v11.5 Phase D round and uses the same words the
  document quotes. `TSPEC:1724` still carries the same set. So "either upstream source may be
  transcribed now" is true, and the standing instruction — transcribe the *recorded* set, never the
  frozen literal — survives the withdrawal. This closes the larger of the two errata this document
  has carried since v5, and it closes it by upstream repair rather than by local restatement.
- **The TSPEC has indeed not moved.** I re-resolved every anchor in the document's own spot-check
  list at HEAD — `:951`, `:672`, `:974-977`, `:987-988`, `:1405`, `:1602`, `:1719`, `:1724`,
  `:1743-1745`, `:1937`, `:1940`, `:2640` — and each lands on the content the document claims. The
  "the upstream that moves is the one nobody sweeps" lesson is therefore a measured observation
  about this branch, not a slogan.
- **DEC-CONS-08's substance is true.** Both changes are present at HEAD and neither is on `main`:
  `crossReviewPath` exists as the single path builder (`orchestrate-dev.js:6526`, doc comment from
  `:6513`), the complete-ledger skip exists (`:11047` `ledgerResume`, `:11105-11122`, and the
  operator-visible `Skipping Phase I (wave ledger …)` notice), and `git show origin/main:` finds no
  `crossReviewPath` builder at all. So "Phase PUB will carry them into this feature's PR" is
  accurate — they are unmerged, and they sit after the `809dd114` PR-#39 merge on this branch.
- **The self-modification-guard claim holds.** `guardVerdict` (`orchestrate-dev.js:959`) matches
  changed files against the effective guard-path set by prefix (`:963`), and Phase MERGE resolves
  its verdict through it (`:1126-1127`). Both changed files are under `pdlc/workflows/`, so the
  "a human reads it before it lands" consequence §12 leans on is real.
- **The consequence paragraph is honest about its own hole, and the hole is real.**
  `consolidationTraceability.test.js` extracts ids with `AT_TOKEN_RE = /AT-[A-Za-z0-9]+/g` (`:45`)
  and asserts set-equality in both directions over the FSPEC register and TSPEC §12.3 (`:130`,
  `:135`). Nothing in that test can see a pipeline change. "Neither change is reachable from any
  traceability row" is exactly right.
- **The test cites resolve, one loosely.** `reviewLoop.test.js:1302-1401` starts on the literal
  `// ─── CR F-11: the reviewer prompt names the exact cross-review file to write ───` banner and
  runs to the end of file — a clean range. `waveExecution.test.js:1621-1779` starts mid-way through
  the preceding ledger test rather than on a boundary; the test §12 is actually pointing at ("a
  complete ledger skips every wave without a single implementation dispatch") begins at `:1772`.

Three things in the changed spans do not verify, and one carried item recurs. They are F-19 through
F-22 below. Nothing approved in an earlier round was weakened: I re-checked DEC-CONS-07's
supersession note and its rejected-alternative annotation, §11.2 conjunct 4 items (ii) and (iii),
§11.6(e)'s six-status set-equality, DEC-CONS-01's credential-helper lane and DEC-CONS-03's verb
sets, and found no silent trade.

## Findings

v8's F-18 recurs in the new paragraph (F-22). No High finding is open, old or new: nothing in the
delta can steer the PLAN or PROPERTIES author to a wrong oracle, and I checked that specifically —
§12 explicitly declines to mint the PROPERTIES row and hands it up as an erratum instead, which is
the right call and the one that keeps this document out of PROPERTIES' way.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-19 | Medium | Local | **DEC-CONS-08's two commit hashes are not on this branch, and after merge they will not exist in the remote repository at all.** §12's table keys both rows on `202f92e1` and `98b7429e`; `git merge-base --is-ancestor` says **NO** for both, and `git branch --contains 202f92e1` returns nothing. What the branch actually carries is `9a1c5222` ("fix(pdlc): CR F-11 — reviewer prompts name the exact cross-review file the round window derives") and `26e51d1c` ("feat(pdlc): honour a complete wave ledger — skip Phase I whole …"), plus a third the record does not mention: `90df91c8` ("fix(pdlc): corroborate the wave ledger against the tree; pin the skip's safety claim"). The originals were rebased or cherry-picked away; they resolve on my machine only because the objects are still in the local store, and a reviewer with a fresh clone gets `unknown revision`. This matters because of what §12 is *for*: its own text says the self-modification guard means "a human reads it before it lands, which is the review the split PR would otherwise have bought", and the Reversibility paragraph promises "additive, separately revertable commits". A human handed two unresolvable hashes cannot run `git show` on either, cannot `git revert` either, and cannot tell whether a third pipeline commit belongs to the same decision. The decision itself is sound and I am not asking for it to change — I am asking for the identifiers to be the ones that ship. Fix: key the table on `9a1c5222` and `26e51d1c`, say whether `90df91c8` rides with them, and prefer describing each by subject line as well as hash so the record survives the next rebase. | AC-3.8 |
| F-20 | Medium | Cross-Feature | **§12's first re-evaluation trigger has already fired, and the record reads as though it has not.** The trigger says the row becomes history when "the wave-ledger resume contract acquires a PROPERTIES row (**or a REQ of its own**)", and the consequence paragraph says "the row is raised as an erratum in this phase rather than minted here". But `docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md` exists **on this branch** — it is `QUEUE.md` row 20, `pending`, `depends-on: [pdlc-consolidation-agent, pdlc-advisory-wave-gate]` — and its §1 is precisely this contract: "A re-invocation of the pipeline re-enters Phase I at wave 1 and re-dispatches implementation agents over every wave whose work is already committed", citing "the pdlc-consolidation-agent run of 2026-08-09". So `98b7429e`/`26e51d1c` is not an unowned pipeline change; it is a **down payment on a queued feature that has not run yet**, shipped from a branch that feature depends on. That is a genuinely different scope story from the one §12 tells, and it changes what the deciding reader should do: not "wait for someone to file it", but "row 20's author will find part of their contract already implemented and must not re-implement or revert it". Nothing here makes the decision wrong — keeping the change is still right, and the dependency edge points the correct way — but a record whose stated trigger is already satisfied will never be re-evaluated by anyone. Fix: name the REQ and the queue row in the trigger, and say plainly that the resume contract is partly implemented ahead of its own feature. | AC-3.8 |
| F-21 | Low | Local | **Two of §12's four code anchors do not resolve at HEAD, and the sweep's own warranty does not cover them.** `orchestrate-dev.js:6311-6325` was the `crossReviewPath` doc comment at the now-unreachable `202f92e1`; at HEAD the builder is `:6526` and its comment starts `:6513` (at the commit that wrote §12, `41fc0f6e`, it was already `:6330` — so this anchor was stale the moment it was written). `:10836-10847` / `:10883` *did* resolve at `41fc0f6e` onto the `ledgerResume` block, but `88079fee` and `76476315` have since pushed it to `:11047`-`:11122`. The document's *Anchor provenance* section is scrupulous about `TSPEC:` and now `FSPEC:` anchors and silent about `pdlc/workflows/` ones, which is how a section written after the warranty came to carry the very defect the warranty exists to prevent — and §12 is the one section of this document whose anchors point at code rather than at spec. The paragraph's own lesson applies verbatim: a retarget is a measurement with a shelf life. Fix: re-measure both, and extend the warranty sentence to name the code-anchor set as a third sweep target (`grep -onE 'orchestrate-dev\.js:[0-9]+(-[0-9]+)?'`). Both anchors are content-addressed in prose, so no reader is misled about *what* the change is — only about where to look. | AC-3.8 |
| F-22 | Low | Local | **F-18 recurs: the sweep paragraph publishes "27 citation sites" and the file measures 29.** The new *Anchor provenance* text says "The recipe is `grep -onE 'FSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'`; **run at this revision** it returned **27** citation sites over **nine** distinct stale values". I ran it at every commit in the delta: `d8a297e1`, `395eaf4f` and `1db99e8a` all return 27; the revision that publishes the sentence (`70d75471`) returns **29**, and HEAD returns 29 — the sweep's own retargets and the new changelog cite added sites. So 27 is the honest *pre-sweep* count wearing the words "at this revision", which is the third round in a row a self-measured integer in this document has been off by the edit that publishes it (v6's "ten across twelve", v8's 92/122, now 27). The sting is that this paragraph is the one that gets the general rule right two sentences later — "the counts they return are a function of the revision, never a constant" — and then publishes a constant anyway. Nothing downstream transcribes these integers into a test and every *anchor* the paragraph certifies does resolve (I re-resolved all nine), so it is Low for the same reason as last round. Fix, and it is the paragraph's own rule applied to itself: say "the pre-sweep run found nine distinct stale values across the FSPEC citation set" and drop the site count, or write 29 and accept it re-stales. | AC-3.8 |

## Questions

## Positive Observations

## Recommendation

## Verdict

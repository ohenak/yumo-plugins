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

## Questions

## Positive Observations

## Recommendation

## Verdict

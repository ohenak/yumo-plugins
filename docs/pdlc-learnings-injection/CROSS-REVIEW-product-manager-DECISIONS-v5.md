# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 5 (upstream-cascade confirmation; DECISIONS bytes unchanged)
**Scope:** Local

## Context

I approved DECISIONS at v4 (`Approved with minor changes`, 0 High / 2 Medium / 2 Low) with
`REVIEWED-COMMIT: 82bd5869`, `APPROVAL-HASH: sha256:85888c03…` and `UPSTREAM-STATE: TSPEC
sha256:eff5a19b…` — TSPEC **v0.6**, commit `ccc739d1`. TSPEC at HEAD is `sha256:f629d29d…`
(**v0.7**, commit `bfe58851`). REQ (`sha256:ff605dd3…`) and FSPEC (`sha256:fb18dbda…`) are
byte-identical to the versions my v4 approval was recorded against, so the whole cascade this round
lives in TSPEC.

DECISIONS' own bytes have not moved since `42515b3e` (`sha256:85888c03…`, unchanged across v3, v4
and this round). The only question is whether it is still a faithful compression of upstream as
upstream now stands. Per DEC-ERR-03 I re-read the entire span `ccc739d1..bfe58851`, not the last
commit, because my approval was recorded against the older blob:

| TSPEC commit | What moved |
|---|---|
| `e33425a6` | Header re-grounded: `Upstream` row now pins **FSPEC v0.12** (was v0.9), version bumped 0.6 → **0.7**, and a `v0.7 erratum` note added to the front matter summarising the round. |
| `4fe44ecb` | `P-2a` and `P-10` ground-truth anchors restated as symbol/call-shape citations per `DEC-DOC-01`; the previous `orchestrate-dev.js:NNNN` line anchors were stale at HEAD. |
| `2c8b880c` | §D.1's domain-membership tests scoped to **non-`null`** values, so `corpusOutcome`'s healthy `null` (§D.2) no longer contradicts the catalogue membership assertion. `LEARNINGS_CORPUS_OUTCOMES` set-equality unchanged at `["RSN-UNLISTABLE", "RSN-EMPTY"]`. |
| `cb4dae90`, `35dc817f` | **Substantive.** §A.2 stops routing the `docType` conjunct as a divergence from FSPEC `BR-1` — v0.11/v0.12 restated BR-1 as the two-conjunct rule, so §I.3's gate now *implements* BR-1 rather than diverging from it. **ERR-7** and **ERR-3** marked **CLOSED**; `ERR-2`'s citation de-anchored. |
| `dfd8c1ff`, `bfe58851` | `P-2b` and the `ERR-2` land-proof-retry citation de-anchored to symbol form; evidence-cell wording cleaned. No claim change. |

The load-bearing observation for this confirmation: every substantive move in the TSPEC delta is a
*closure* — TSPEC retiring its own routed divergences now that FSPEC has absorbed them. Nothing
TSPEC decides changed, and the one design element DECISIONS shares with it (§I.3's two-conjunct
`injectHere` gate) is byte-identical at HEAD to `DEC-LI-03`'s decision. So the confirmation question
is again the narrow DEC-ERR-03 one: does anything DECISIONS *says about* TSPEC no longer match what
TSPEC says, or no longer say it the same way.

## Options Considered

Three readings of this cascade were live before I traced the text.

**Reading A — the delta closes TSPEC's errata, therefore it closes DECISIONS' business with TSPEC
too; confirm clean.** Tempting, because the two documents' open items rhyme: TSPEC v0.7 retires
`ERR-3` and `ERR-7`, and DECISIONS' outstanding obligation `D-O-9` is also a TSPEC erratum ask.
**Rejected on evidence.** They are different errata. `D-O-9` / `DEC-ERR-01` asks TSPEC to close
`OQ.2`, retire `ERR-4`, and drop the `present`/`sectionMalformed` conjuncts from §I.3 — and that ask
landed two rounds ago, in **TSPEC v0.6**, not in this round's edit. This round closed the *FSPEC*
-routed pair. Reading the item lists as interchangeable would have re-dated an already-stale finding
and hidden the fact that `D-O-9` has been discharged since v0.6.

**Reading B — §A.2 no longer routing the `docType` conjunct as a divergence makes `DEC-LI-03`'s
rationale obsolete; the entry should be retired.** If TSPEC now says the two-conjunct gate simply
*is* `BR-1`, does DECISIONS still have a decision to record? **Rejected.** `DEC-LI-03`'s decision was
never "add a second conjunct" — it was **where the gate is written** (`dispatchAndVerify`, once,
because it is the only function seeing both parts at composition time) and **why the three cheaper
attachments were rejected** (per-call-site, `dispatchKind` alone, `docType` alone, a new flag). That
argument is untouched by BR-1's restatement; if anything the closure of ERR-7 removes the last
reason a future agent might have thought the conjunct was TSPEC's invention rather than the
contract. The entry gets stronger, not obsolete.

**Reading C — the decisions hold; a small number of sentences *about* upstream have gone stale, and
this round adds one more of that same shape.** This is what the trace supports, and it is now the
third consecutive confirmation with that finding profile. The three inherited defects from v3/v4
(F-01 AC-3.3 locus, F-02 the DEC-LI-07 divergence paragraph, F-03 version pins) are still on the
page because DECISIONS' bytes have not moved; F-04 (the `A-2` paraphrase) likewise. This round's own
addition is the **Upstream version note**: its premise — "TSPEC v0.5 was authored against FSPEC v0.5
/ REQ v0.7 … this document is grounded on the *current* upstream, so `DEC-LI-07` decides what TSPEC
still carries provisionally" — described a real asymmetry when written, but commit `e33425a6`
re-grounded TSPEC's own header on **FSPEC v0.12 / REQ v0.9**. The two documents now stand on the
same upstream, so the note describes a gap that no longer exists in any version of either document.

I considered filing that last item as Medium rather than Low. **Rejected**: unlike F-01 and F-02 it
does not tell a downstream author that a settled question is open — it is a framing sentence whose
justification has evaporated, and the paragraph it introduces (`DEC-LI-07`'s divergence narrative)
is already carried as its own Medium finding. Filing it Medium would double-count one edit.

I also considered whether the version-pin finding (F-03) should be re-tagged `delta`, since this
round is what moved TSPEC from v0.6 to v0.7 and widened the gap against the pinned v0.5. **Rejected
for tag stability**: the defect was in the pre-round bytes and this edit did not touch DECISIONS, so
`inherited` is the honest provenance; the widening is recorded in the finding text instead. Prior
rounds tagged it the same way, and per tag-selection discipline I reconcile rather than flip.

## Decision

**DECISIONS still holds as approved against TSPEC as it now stands.** No decision it takes is
contradicted by TSPEC v0.7; the round's substantive move (ERR-7 closed, §A.2 restated as
BR-1-conformant) lands on the same side of the argument `DEC-LI-03` already made. One new citation
defect from this delta, four inherited from v3/v4, all non-gating.

### Clause-by-clause re-verification against TSPEC at HEAD

| DECISIONS claim | TSPEC v0.7 at HEAD | Holds? |
|---|---|---|
| `DEC-LI-03` decision: gate is `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` | §I.3's `injectHere` is the identical expression, over the identical frozen six-name catalogue | Yes — byte-identical |
| `DEC-LI-03` rejection of `dispatchKind` alone, citing Phase CR's `reviewLoop({docType: null})` surviving into `dispatchAndVerify` | §A.2 and `P-2b` state the same trace, now cited by symbol and call shape rather than line; the conclusion is unchanged | Yes |
| `DEC-LI-03` rejection of `docType` alone: *"admits every reviewer round and violates `BR-1`'s exclusion list"* | FSPEC `BR-1`'s **Excluded** bullet is intact at HEAD (every review dispatch, implementation, DoD, harvest, ship, advisory seams); TSPEC §A.2 defers to it | Yes |
| `G-B`: four `dispatchKind: "authoring"` sites — *"the three object-literal sites plus `reviewLoop`'s positional `\"authoring\"` argument to `runWrapped`"* | `P-2a` as rewritten enumerates exactly that decomposition, in the same terms, de-anchored per `DEC-DOC-01` | Yes — the delta moved TSPEC **toward** DECISIONS' citation style |
| `G-C`: Phase CR's `reviewLoop({doc: \`docs/${featureName}/\`, phase: "CR", docType: null, …})` | `P-2b` at HEAD, same call shape, line anchors removed | Yes |
| `DEC-LI-10`: three closed catalogues, hand-transcribed expectations, set equality per `DC-01`/`DC-14` | §D.1's edit scopes the *domain* tests to non-`null` values; the catalogue **set-equality** test is explicitly unchanged (`["RSN-UNLISTABLE", "RSN-EMPTY"]`), and `null` is deliberately not a member | Yes — the instrument DECISIONS relies on is the one left untouched |
| `DEC-LI-06` constraints: `BR-15`'s no-index/no-cache/no-state-file clause and `E-32` per-dispatch observation | `ERR-3`'s closure concerns `BR-15`'s **expected read set**, not the no-artefact clause; `E-32` untouched | Yes |
| `DEC-LI-08` / §Consequences citing TSPEC `T-O-3` (read-cost measurement) and `T-O-1` (serial PLAN, file-ownership manifest) | Both obligations present and unchanged at HEAD | Yes |
| §Scope: *"no behaviour rule (FSPEC `BR-1` … `BR-16`) is re-decided here"* | §A.2 now says the two-conjunct gate implements BR-1 as written; DECISIONS decides attachment point, not membership | Yes — strengthened |
| Non-decision row: AC-3.3 record locus *"open, routed to REQ via TSPEC `ERR-6`"* | `ERR-6` recorded **CLOSED** since TSPEC v0.6; §369 states the settled locus | **No** — F-01 (inherited, v3) |
| `DEC-LI-07` + `D-O-9` + the `DEC-LI-07` summary row: TSPEC *"still builds the injector on `present && config.enabled && !sectionMalformed`"*, *"still carries `OQ.2` and `ERR-4` open"*, `DEC-ERR-01` outstanding | `ERR-4` and `ERR-6` CLOSED, `OQ.2` closed, §I.3 gates on `config.enabled` alone, `LEARNINGS_DEFAULTS` aligned — all since v0.6 | **No** — F-02 (inherited, v3) |
| Header/upstream-note pins: `TSPEC v0.5`, `FSPEC v0.7`; `DEC-LI-07`'s *"FSPEC v0.7 `BR-14`"* | TSPEC **v0.7**, FSPEC **v0.12** | **No** — F-03 (inherited, widened again) |
| `DEC-LI-03` trigger paraphrasing FSPEC `A-2` as *"authoring in spirit but not so classified"* | `A-2` at HEAD: *"satisfies **neither** conjunct … yet is authoring in spirit"* | **No** — F-04 (inherited, v4) |
| **Upstream version note**: *"TSPEC v0.5 was authored against FSPEC v0.5 / REQ v0.7. Upstream has since moved … this document is grounded on the **current** upstream, so `DEC-LI-07` decides what TSPEC still carries provisionally"* | TSPEC v0.7's header is pinned to **FSPEC v0.12 / REQ v0.9** and its erratum note records the re-grounding explicitly | **No** — F-05, this round's own |

F-01 through F-04 were raised at v3/v4 against bytes that have not moved since; they are recorded
here as `inherited` so this round routes back to the owning phase rather than halting. F-05 is this
round's own and is Low: it is a framing sentence whose premise the delta dissolved, not a false
statement about what any rule requires.

## Consequences

**For this round.** The confirmation approves. TSPEC v0.7 closed two errata it had routed to FSPEC
and de-anchored four citations; it re-decided nothing DECISIONS owns, and its §I.3 gate remains the
expression `DEC-LI-03` chose. Five findings stand, all citation or framing defects, none blocking:
PLAN and PROPERTIES read DECISIONS for rationale and read FSPEC/TSPEC for contract, and those two
documents agree with each other at HEAD.

**For the next authoring pass on DECISIONS**, the edits I would make — items 1–4 unchanged from v4,
item 5 new:

1. Replace the AC-3.3 locus row in *"Decisions deliberately NOT taken here"* with the settled
   answer: FSPEC `BR-10` fixes two loci — ordering-key values per authoring dispatch, §4.1
   thresholds once per run — one completeness test each, run-level mirror additive and unasserted.
   Keep the row; change what it says. (F-01)
2. Rewrite `DEC-LI-07`'s *"divergence from TSPEC"* paragraph in the past tense, and the
   `DEC-LI-07` summary-table row that calls the `present` gate *"TSPEC's provisional reading"*:
   `DEC-ERR-01` landed in TSPEC v0.6, `ERR-4` is CLOSED, the gate is `config.enabled` alone, and
   `D-O-9` is **discharged** — it should be struck from the obligations table or marked closed with
   the landing version, not left as an open ask against TSPEC. (F-02)
3. Repin: header `Upstream` row and **Upstream version note** to TSPEC **v0.7** / FSPEC **v0.12**;
   `DEC-LI-07`'s *"FSPEC v0.7 `BR-14`"* to v0.12 (the cited `BR-14` text is unchanged, so this is a
   pin edit only). (F-03)
4. Align `DEC-LI-03`'s re-evaluation trigger with `A-2` as reworded: the excluded-by-construction
   default now covers a dispatch failing **either** conjunct, and the authoring-classified non-C-1
   target is named by `BR-1` itself. One clause. (F-04)
5. Rewrite the **Upstream version note** premise, or delete it. Its work was to explain why
   DECISIONS and TSPEC disagreed; TSPEC v0.7 is now pinned to the same REQ v0.9 / FSPEC v0.12 this
   document is grounded on, so there is no asymmetry left to explain. If the note is kept, it should
   record the *history* ("TSPEC v0.5 lagged; re-grounded at v0.7") rather than assert a live gap.
   (F-05)

**For the pipeline.** Third consecutive confirmation where every finding against DECISIONS is a
stale sentence about a sibling document and none is a wrong decision — and the count is now growing
(2 → 4 → 5) purely because the bytes cannot move between confirmation rounds while siblings keep
moving. That is a structural property worth harvesting, not a run of bad luck. Two `Process`
candidates, restated from v4 because they have now been demonstrated a third time:

- **An upstream-quote convention for DECISIONS**: cite the **spec id** and the claim, never the
  version-pinned sentence or the sibling's *current status*. Note that every clause that survived
  this delta cleanly (`DEC-LI-03`'s gate, `DEC-LI-10`'s C-1 transcription, `G-B`/`G-C`'s source
  citations) was written that way, and every finding is a clause that was not.
- **A cascade check that re-reads DECISIONS' explicit "still open / owned there" pointers** against
  the named owner's current status. All of F-01, F-02 and F-05 are exactly that shape, and all three
  went false silently.

A third candidate is now visible: **an erratum that discharges an obligation should close the
obligation row in the document that raised it.** `D-O-9` was satisfied by TSPEC v0.6 and has been
carried as outstanding through two confirmations since, because the discharge happened in the
*target* document and nothing routes back to the *raising* one.

**On this confirmation itself.** The routed item list was TSPEC's ERR-3/ERR-7 closure and four
`DEC-DOC-01` de-anchorings — none of which names DECISIONS, and all of which land in DECISIONS'
favour. Confirming on the item list alone would have returned a clean approval over five stale
sentences, four of them already outstanding. Re-reading the upstream text this document leans on, at
HEAD, across the whole span since the recorded `UPSTREAM-STATE`, is what DEC-ERR-03 asks for and is
what surfaced F-05.

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

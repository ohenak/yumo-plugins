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

## Consequences

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

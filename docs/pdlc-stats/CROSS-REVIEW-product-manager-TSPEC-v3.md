# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)
**Scope:** does the approved TSPEC still hold against FSPEC v1.4 and REQ v1.4 as they now stand?

## Overview

The TSPEC's own bytes have not moved since I approved it: `docs/pdlc-stats/TSPEC-pdlc-stats.md` is
byte-identical at `66c4049ac` (my v2 `REVIEWED-COMMIT`) and at HEAD. What moved is both upstream
documents. My v2 approval anchors recorded `UPSTREAM-STATE: REQ sha256:c4588c8b…` and
`UPSTREAM-STATE: FSPEC sha256:c142bfa8…`; I re-derived those two hashes from `66c4049ac` and they
match exactly, so the delta below is the whole of the upstream change and nothing is being read
against a guessed base.

Upstream now stands at REQ `sha256:60a516fb…` (v1.4) and FSPEC `sha256:0b8864d6…` (v1.4), the two
hashes this dispatch names. The diff is small and single-themed:

| Upstream edit | What it changed |
|---|---|
| REQ v1.4 | REQ-STATS-06's harvested predicate is now stated over C-4's documented basename grammars (`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, `CODE_REVIEW-{feature}-v{N}.md`) rather than bare `CROSS-REVIEW-*` / `CODE_REVIEW-*` globs |
| FSPEC BR-11 | DoD harvested condition narrowed to "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains", with the leftover disposition (`-draft` suffix, foreign feature) spelled out |
| FSPEC BR-16 | Ratio harvested condition restated over BR-14's grammars and explicitly evaluated over "exactly the file set BR-14's numerator sums" |
| FSPEC BR-25 | Now names `docs/completed/QUEUE-HISTORY-rows-0-1.md` alongside `docs/completed/REQ-completed.md` as loose files that are not features |
| FSPEC AT-12 / AT-17 | Each gains a leg pinning the narrowed reading — AT-12 a third directory, AT-17 a fourth |
| FSPEC §7.3 | The three harvested-predicate errata are declared **closed**, not routed upstream any more |

The single question I have to answer is whether the TSPEC is still a faithful compression of that
text. On **behaviour**, the answer is an unqualified yes, and better than yes: every one of these
FSPEC edits moves the FSPEC onto the reading the TSPEC had already chosen and defended. Not one line
of §4.3's branch tables, §4.2.1's types, §4.4's discovery or §6's oracles needs to change.

On **what the TSPEC says about its upstream**, the answer is no in three places. §4.3 twice asserts
that the FSPEC says something the FSPEC no longer says, and §8.3 routes three errata that FSPEC §7.3
has now explicitly closed. Per DEC-ERR-03 these are findings of this confirmation whether or not
they appear on the dispatch's item list: they are citations of upstream text that no longer exists.
None of them narrows, broadens or reinterprets a product guarantee, so none is High.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | **§4.3's DoD paragraph misquotes FSPEC BR-11 as it now stands.** The TSPEC reads "FSPEC BR-11's wording is looser (\"no `CODE_REVIEW-*` file remains in the directory\"), and the two readings disagree". At HEAD, BR-11 reads "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains (REQ-STATS-04)" and then names the very leftovers the TSPEC's sentence says the FSPEC would count — `-draft` suffix, another feature's name — as contributing nothing. The two readings no longer disagree; the FSPEC has adopted the TSPEC's. The implemented branch (`n > 0` before the harvested test) is unchanged and correct; what is stale is the justification and the "routed as an erratum (§8.3)" clause hanging off it. | §4.3, DoD rounds (BR-10, BR-11) |
| F-02 | Medium | delta | nonlocal | **§4.3's ratio paragraph asserts an FSPEC ambiguity that FSPEC v1.4 removed.** The heading sentence "The harvested test reads \"no `CROSS-REVIEW-*` remains\" grammatically, and that is a choice" and the body's "FSPEC BR-16 and REQ-STATS-06 both phrase the condition over `CROSS-REVIEW-*`, and the two readings genuinely disagree" are both false against HEAD. BR-16 now phrases the condition over BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar, states it is "evaluated over exactly the file set BR-14's numerator sums", and names the `docs/completed/pdlc-advisory-wave-gate/` shape as reporting `harvested` — the exact fixture and the exact answer §4.3 argues for. REQ-STATS-06 v1.4 carries the same scoping. The grammatical reading is no longer a TSPEC choice needing defence; it is the specified behaviour, and the closing "The FSPEC's ambiguity is routed as an erratum (§8.3), not resolved by silence" is now untrue. | §4.3, byte ratio (BR-14…BR-16) |
| F-03 | Medium | delta | nonlocal | **§8.3 routes three errata that FSPEC §7.3 has closed, so the two documents now disagree about what is open upstream.** FSPEC §7.3 states "The three harvested-predicate errata this section carried are **closed** … nothing about them is routed upstream now", and BR-25 now names the second loose file. Against that, §8.3 still carries: the BR-16 `CROSS-REVIEW-*` bullet (closed — see F-02), the BR-11 "wording should be narrowed to match" bullet (closed — BR-11 *was* narrowed, see F-01), and the BR-25 bullet asking the FSPEC to name `docs/completed/QUEUE-HISTORY-rows-0-1.md` (closed — BR-25 names it; I confirmed both loose files are present at that root). Only the first bullet, FSPEC BR-26/EC-10's missing feature-recognition predicate, is still genuinely open. The erratum channel is machinery, not prose: leaving satisfied items in it costs a round on questions upstream has already answered. | §8.3, upstream errata |
| F-04 | Low | delta | nonlocal | **§4.3's boundary fixture is now FSPEC-owned and should cite its owner.** §4.3 says "A dedicated fixture pins the boundary: a directory with `LEARNINGS-*.md`, one `CROSS-REVIEW-{role}-REVIEW-v1.md`, and no grammar-passing cross-review, asserted `harvested`" — invented locally because the FSPEC had no such leg. AT-17 now has one (its fourth directory, same shape, same expected `harvested`), and AT-12 gains a third directory pinning BR-11's leftover disposition. §6.1's baseline table lists AT-09/10/11/13/14b/18 and does not mention either. No coverage gap results — §6.2's seamed-unit level reaches both branches — but the TSPEC should cite AT-17's fourth leg and AT-12's third rather than present the fixture as its own, so that a later FSPEC edit to those legs is visibly a TSPEC concern. | §4.3 / §6.1 |

FINDING: Medium | delta | nonlocal | §4.3 DoD paragraph misquotes FSPEC BR-11, whose divergence FSPEC v1.4 closed
FINDING: Medium | delta | nonlocal | §4.3 ratio paragraph asserts an FSPEC BR-16 / REQ-STATS-06 ambiguity that v1.4 removed
FINDING: Medium | delta | nonlocal | §8.3 routes three errata FSPEC §7.3 declares closed (BR-16, BR-11, BR-25)
FINDING: Low | delta | nonlocal | §4.3's locally-invented harvested boundary fixture is now AT-17's fourth leg and should cite it

All four are documentation-of-provenance defects in a document whose specified behaviour I re-checked
line by line and found unchanged and upstream-faithful. Scope tags, for the harvest phase: F-01, F-02
and F-04 are `Local`; **F-03 is `Process`** — an erratum bullet whose upstream answer has landed
should be closed by the cascade confirmation that observes it landing, and no step in the phase graph
currently owns that sweep. That is a pipeline lesson, not a pdlc-stats one.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | FSPEC §7.3's closure notice covers the three harvested-predicate errata. My v2 review left three Medium test-governance findings open against §6.5/§4.3 (the `.tmp-*` snapshot exclusion, the guard conjunct, the halt negative test), and the first of those asked for an FSPEC erratum against AT-21/AT-22's *Given*. That erratum is not in FSPEC §7.3 at HEAD and the TSPEC's §8.3 does not carry it either. Is it expected to land in the TSPEC's next ordinary revision round, or was it dropped? I am not raising it as a finding of this confirmation — it is inherited from v2 and belongs to the TSPEC's own loop, not to the cascade — but it should not fall through the gap between the two. |
| Q-02 | FSPEC BR-16 now says a directory holding only out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files "reports `harvested`, not a measured ratio". Those same files are simultaneously reported to the operator as **malformed** by BR-06 (TSPEC §6.1's AT-09 row pins four of them with `reason: "bad_doc_type"`). Both are right per the rules, but is the combined operator-facing story — "this feature's process bytes are harvested" *and* "here are four malformed files that are the only process files present" — the reading the FSPEC intends? It is an FSPEC/REQ presentation question, not a TSPEC one, which is why it is a question rather than a finding. |

## Positive Observations

- **The cascade moved upstream toward this document, not away from it.** Every substantive FSPEC
  edit in this round — BR-11's grammar qualifier, BR-16's "exactly the file set BR-14's numerator
  sums", AT-12's third directory, AT-17's fourth — lands on the reading the TSPEC had already taken
  and argued for from REQ C-4. That is the erratum channel working exactly as designed: the TSPEC
  declined to reinterpret upstream silently, routed the ambiguity, and the ambiguity got resolved in
  the TSPEC's favour. The three stale citations in F-01…F-03 are the *cost of success*, not a defect
  of judgement.
- **No product guarantee moved.** I checked each REQ criterion the edits touch. REQ-STATS-04 and
  REQ-STATS-06 narrowed *which files count as evidence*, not what the operator is promised: a
  harvested feature still reports `harvested` rather than a misleading `0` or a phantom ratio, which
  is the whole user-facing point. The TSPEC's `n > 0` DoD branch, its `crossReviews.length === 0 ||
  dodReviews.length === 0` ratio branch, and its harvested-before-zero-denominator ordering all
  implement the narrowed text unchanged.
- **BR-25's new loose file is a no-op for the design, and the TSPEC already had it right.** I listed
  `docs/completed/` at HEAD: `QUEUE-HISTORY-rows-0-1.md` and `REQ-completed.md` are both there.
  §4.4's `isDirectory`-only discovery drops both without knowing either name, and §6.1's AT-18 row is
  deliberately stated as invariants rather than counts — so the archive gaining a second loose file
  cannot falsify it. This is the `doc-moves-break-pinned-tests` hazard the TSPEC declined to walk
  into, and it paid off within one round.
- **The approval anchors did their job.** Both recorded `UPSTREAM-STATE` hashes re-derived exactly
  from `REVIEWED-COMMIT`, which is what let this confirmation read a precise 46/33-line delta instead
  of re-reading a 76 KB FSPEC. Worth saying out loud, because it is the mechanism that keeps cascade
  confirmations cheap.

## Recommendation

**Approved with minor changes**

The TSPEC still holds against FSPEC v1.4 and REQ v1.4. Nothing it specifies has to change: every
branch table, type, oracle and traceability row remains a faithful compression of the upstream text
as it now stands, and on the four points upstream edited, upstream moved to meet this document.

Four non-gating changes, none touching specified behaviour, all confined to prose that describes
upstream:

1. **§4.3, DoD rounds** — replace the "FSPEC BR-11's wording is looser … routed as an erratum (§8.3)"
   passage with a statement that BR-11 v1.4 and REQ-STATS-04 now agree on the grammar-matching
   reading the branch implements. (F-01)
2. **§4.3, byte ratio** — retire "and that is a choice" and "the two readings genuinely disagree";
   BR-16 v1.4 specifies the grammatical membership and names the `pdlc-advisory-wave-gate` shape
   itself. Keep the REQ C-4 grounding — it is now the FSPEC's grounding too. (F-02)
3. **§8.3** — delete the BR-16, BR-11 and BR-25 bullets; all three are closed upstream, per FSPEC
   §7.3 and BR-25's own text. Keep the BR-26/EC-10 feature-recognition-predicate bullet, which is
   still open. (F-03)
4. **§4.3 / §6.1** — cite AT-17's fourth leg (and AT-12's third) instead of presenting the harvested
   boundary fixture as a locally-invented one. (F-04)

Because these are all Medium/Low, this confirmation is approving: the TSPEC does not need to
re-enter its review loop for them, and they can be folded into whatever edit it next receives.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}

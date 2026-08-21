# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 14 (delta re-review under DECISION FREEZE — PROPERTIES v0.8 → v0.9)

## Overview

**What this round is.** A delta re-review, under decision freeze, of PROPERTIES **v0.8 → v0.9**. My
v13 approved v0.8 with one Medium (the stale PLAN pin) and one Low. This round the document moved in
three commits — `28de4ad4` (header), `1f1400ab` (§G.3), `cb09985d` (§C.4) — totalling **17 insertions,
12 deletions** across `git diff --stat c575cdc3 HEAD` on the document. I judge only whether my own
prior blocking findings are resolved and whether this revision broke anything.

**The delta, measured.** `git diff c575cdc3 HEAD` on the document returns **three hunks**, and all
three land in regions I named in v13 F-01:

| Region | Lines | What moved |
|---|---|---|
| Header / upstream row | `:11`, `:18` | PLAN pin `v0.8` → **`v1.3`**; case C re-quoted; a v0.9 paragraph explaining the re-pin and its two consequences; version cell `0.8` → `0.9` |
| §C.4 P-A-7 paragraph | `:1123`–`:1138` | case A's window re-quoted as *"before batch 9 (which includes batches 7 and 8)"*; case C re-quoted; the case-C limb restated as record (*"had to be green at the commit that landed it"*) with PLAN v1.2's *"records an outcome, not a pending expectation"* |
| §G.3 struck bullet | `:1326`–`:1336` | *"PLAN at HEAD"* re-pinned `v0.8` → **`v1.3`**; all three case windows re-quoted verbatim; case C's limb given PLAN v1.2's record wording |

No hunk touches §Properties (Groups A–J), §Oracles (§O.1–§O.9), §Fixtures (§F.1–§F.4), §C.1, §C.2,
§C.3, §C.4's inventory table or reversal table, or §G.2. The header's claim — *"No property, oracle,
fixture, AT mapping or coverage row moves at v0.9 either"* — is therefore true by construction of the
diff, and I checked it that way rather than taking the assertion.

**What the revision does, and whether it does it.** This delta exists to discharge my v13 F-01 and PM
v13 F-01/F-02. It resolves **two of the three** consequences I named:

| v13 F-01 limb | Status at v0.9 |
|---|---|
| (a) case C quoted as *"after batch 13, the case that is live at HEAD"*, `grep -cF` **0** against PLAN | **Resolved.** Re-quoted at `:11`, `:1129` and `:1332` as *"batch 13 or later, the case that is live at HEAD"*; `grep -cF` against PLAN returns **1** |
| (b) case A paraphrased as *"before batch 7"* | **Resolved.** `:1127` and `:1331` now quote *"before batch 9 (which includes batches 7 and 8)"*; `grep -cF` returns **2** in PLAN |
| (c) `:1181` still offers case B's *"amended into the ledger by name first"* fallback, retired by PLAN v1.1's P-A-6 | **Not resolved.** `grep -n "amended into the ledger by name"` still returns `:1181`; PLAN `:663` still reads *"the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* |

**Verification method — repository, not documents.** `git diff --stat` and full `git diff` on the
document against `c575cdc3`; `grep -cF` on six load-bearing PLAN quotations the delta writes; the PLAN
version cell read from `PLAN-pdlc-learnings-injection.md:18`; PLAN's changelog rows `:680`–`:684` for
the v0.9→v1.3 chain the header enumerates; PLAN `:559`, `:561`, `:663` read in full for the three case
rows and P-A-6; `git merge-base --is-ancestor 09c7c62f HEAD` for the pinned measurement commit; and a
grep sweep of the document for residual `after batch 13` / `v0.8` pins.

**Conclusion up front.** The delta is a net improvement and broke nothing: PLAN is at **v1.3**
(`PLAN:18`), every version in the chain the header names exists (`PLAN:680`–`:684`), and every one of
the six PLAN quotations the delta writes resolves verbatim at HEAD. One **Medium** stands: the header's
new completeness claim — *"every ruling this document cites is still present at v1.3, so the finding
was pin freshness, not fidelity"* — is **false in two places the re-pin did not visit**, and one of
them is my unresolved v13 F-01(c). Under the freeze it does not block, for the same reason it did not
block in v13: no property, oracle, fixture, AT mapping or coverage row turns on it, and §C.4's own
case-C paragraphs state the correct obligation twice, twenty lines above the stale sentence.

## Properties

**No property statement moved, and the diff proves it rather than the prose.** The three hunks are
confined to the header upstream row, §C.4's P-A-7 paragraph and one struck bullet in §G.3. §Properties'
Groups A–J, §C.1's 35-of-35, §C.2, §C.3's 23-of-23 and §C.4's inventory and reversal tables are
byte-identical to the bytes I approved at v0.8. The seventy `PROP-` statements, their AT partitions,
levels and owning tasks therefore stand exactly where my v11/v13 approvals left them, and nothing in
this round can have disturbed them. This is the third consecutive round in which the document's scope
claim survives being diffed.

**Every PLAN task the table lists still traces, because the trace did not move.** §C.3 reconciles
PLAN's 23 task rows against properties; no row of it is inside the delta, and PLAN's task table is
itself unchanged in the relevant respect — `PLAN:310` still reconciles the tree at eighteen tracked
`learnings*` test-side entities, and `git log --oneline main..HEAD` still returns a non-zero commit
count for every id LI-01…LI-23. The four properties §C.4 routes (PROP-BOUND-03's zero case,
PROP-BOUND-05/07/08) are named identically before and after the delta; only the *case wording* under
which they are ruled changed, and the ruling itself — empty ledger, green at landing — is byte-identical
across PLAN v0.8 → v1.3.

**The re-quoted case windows are literal transcriptions, checked one at a time.** The delta's whole
content is quotation, so the no-implementation-echo discipline reduces here to: is each quoted string
actually in PLAN at HEAD? I ran `grep -cF` on each rather than reading around them:

| Quotation the delta writes | `grep -cF` in PLAN at HEAD |
|---|---|
| *"batch 13 or later, the case that is live at HEAD"* | 1 (`PLAN:561`) |
| *"before batch 9 (which includes batches 7 and 8)"* | 2 (`PLAN:559`, `:682`) |
| *"batch 9 through batch 12"* | 1 |
| *"this row records an outcome, not a pending expectation"* | 1 (`PLAN:561`) |
| *"the ledger stays empty and the amendment must be green at the commit that lands it — and it was."* | 1 (`PLAN:561`) |
| *"the first point the suite is green, which in practice is after LI-21 (batch 13)"* (context, unchanged) | 1 (`PLAN:663`) |

Six for six. The one quotation that does **not** return 1 is `:1131`'s *"under case C they owe no ledger
row, and they owe green."* — PLAN `:561` reads *"…and they owe green — which PROPERTIES §C.4 records as
discharged…"*, so the words are verbatim but the terminal period is the document's, not PLAN's. That is
inherited context, not delta text, and it is Low (F-02).

**The version chain the header asserts is real.** *"PLAN has since passed through v0.9, v1.0, v1.1, v1.2
and v1.3"* — `grep -n "^| 0\.9 \|^| 1\.0 \|^| 1\.1 \|^| 1\.2 \|^| 1\.3 "` on PLAN returns rows at
`:680`, `:681`, `:682`, `:683`, `:684`, in that order and with those version cells, and `PLAN:18` reads
`| pdlc | Draft | Claude | 1.3 | 2026-08-21 |`. A five-version enumeration is exactly the kind of claim
that silently drops a member; this one is a closed set against PLAN's changelog, with no gap and no
invented version.

**Where the re-pin's completeness claim fails — two sites, neither of which moves a property.** The
header now asserts *"every ruling this document cites is still present at v1.3, so the finding was pin
freshness, not fidelity."* Two rulings this document cites are **not** present at v1.3:

1. **`:1181` cites case B's retired fallback.** *"…or, if it lands red, its rows are amended into the
   ledger by name first, under the same P-A-7 rule."* PLAN `:663` (P-A-6) at HEAD routes a red
   PROPERTIES suite through *"**P-A-7's governing case** — which at HEAD is case C, where no ledger
   remains to amend into and the obligation is green-at-landing; the amend-into-the-ledger-by-name route
   is case B's, and case B closed at batch 12 (TE v11 F-03)."* This is my v13 F-01(c), unresolved, and
   the re-pin sharpened it: at v0.8 the sentence was stale against a pin the document did not claim to
   hold; at v0.9 it is stale against a pin the document explicitly claims to hold.
2. **`:1185` says P-A-6 is *"(byte-unchanged at v0.8)"*.** True as provenance about v0.8 — and the header
   pre-authorises exactly that reading (*"attributions of the form 'PLAN v0.8' … are provenance, not
   pins"*) — but P-A-6 **did** change at PLAN v1.1 (`PLAN:682`: *"P-A-6's PROPERTIES fallback stops
   offering case B's amend-into-the-ledger route unconditionally"*), and a reader arriving from a header
   pinned at v1.3 will read the parenthetical as currency.

Both are Medium, not High, and for the reason I gave in v13: **no property, oracle, fixture, AT mapping
or coverage row depends on which fallback a hypothetical red PROPERTIES suite takes.** §C.4's own
case-C paragraphs state the correct obligation twice above the stale sentence — *"the ledger stays empty
and the amendment had to be green at the commit that landed it"* (`:1130`) and *"no `learningsBlock`
ledger row was owed and none exists"* — and the delta *strengthened* the first of those from expectation
to record. The document's operative conclusion is the one PLAN v1.3 reaffirms; what is stale is its last
un-updated echo of case B.

## Oracles

**No oracle section moved.** §O.1–§O.9 and §G.1's obligation table are byte-identical; no hunk lands
between `:600` and `:820`. What this delta carries is *quotation*, and quotation in this document is
load-bearing evidence, so I applied the three test-discipline checks to it.

**No implementation echoes.** Every expected value in the delta is a literal transcription from PLAN,
not a value derived from anything downstream. The six `grep -cF` results in §Properties above are the
proof: each quoted string was checked against PLAN's bytes independently, not inferred from what §C.4
concluded. The delta could have paraphrased case A's new window as "before batch 9" and left it there;
instead it quotes *"before batch 9 (which includes batches 7 and 8)"* including the derivation clause,
which is the form that can be falsified with a fixed-string grep. That is the right call and it is what
made this round cheap to verify.

**No absence-only oracles, and one negative got its positive counterpart strengthened.** The delta's
substantive change beyond re-quoting is the case-C limb: *"the amendment is expected to land green"*
became *"the amendment had to be green at the commit that landed it"*, with PLAN v1.2's *"this row
records an outcome, not a pending expectation"* attached. That converts a forward-looking expectation
into a recorded positive outcome on the same path — the direction the discipline asks for. The
accompanying negative (*"no ledger row was owed and none exists"*) already carried its positive
counterpart in §C.4's next paragraph (the 26-of-26 green with a 0 skip count), and that paragraph is
untouched. `git merge-base --is-ancestor 09c7c62f HEAD` confirms the commit that measurement is pinned
to is still reachable, so the evidence behind the positive half has not become unresolvable.

**The failure limb is still recorded as unexercised, not waived.** `:1170` still reads *"no ledger row,
green at landing, fix-before-batch-14 untriggered"*, and PLAN `:561` independently records *"case C's
failure limb below is **unexercised, not waived**, and PROPERTIES §C.4 records the same discharge."*
The two documents now agree in the same words on the same distinction. The delta did not take the
comfortable option of calling the obligation discharged in the abstract; it named which limb fired and
which did not.

**Set-equality on the enumerations the delta touches.** Two enumerations are inside the delta and both
are closed sets, not containment claims:

- **The three-case table.** §C.4 and §G.3 each now name all three cases with all three windows quoted
  (`before batch 9…` / `batch 9 through batch 12` / `batch 13 or later…`). PLAN `:559`, `:560`, `:561`
  are exactly three rows. A deleted case would leave a hole in the batch line, and the windows tile it
  with no gap — which is precisely what PLAN v1.1 was written to achieve (`PLAN:682`).
- **The version chain.** Five versions asserted, five changelog rows found, no sixth. Checked above.

**One enumeration outside the delta went stale while the delta re-pinned the section around it.**
§G.3's *"Newly routed this round"* item (`:1357`–`:1367`) still asserts *"PLAN's §File-ownership
manifest lists fourteen new test files; eighteen `learnings*` files are tracked at `09c7c62f`… it is
PLAN's manifest that is now incomplete."* That is **false at PLAN v1.3**: `PLAN:683` (v1.2 changelog,
item 3) records all four by name — *"`helpers/learningsBaselineScenarios.js`,
`helpers/learningsComposition.js`, `learningsDisclosure.test.js`, `learningsErratumBinding.test.js` …
are now recorded"* — in a new **§Post-batch remediation** subsection at `PLAN:244`, and `PLAN:310`
reconciles the tree at eighteen. `grep -c` for the four names in PLAN returns **6**, where at v0.8 it
returned 0. The item is answered upstream and should be struck, not left open; the delta re-pinned the
struck bullet ten lines above it to v1.3 and did not visit it. Same finding family as the `:1181`
staleness, folded into F-01. Non-blocking: it is a routing-list entry, no property or oracle depends on
it, and its worst cost is one redundant round-trip to PLAN for something PLAN has already done.

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

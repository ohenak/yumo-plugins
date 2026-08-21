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

**§F.1–§F.4 are byte-identical.** No hunk lands in the fixture region, so the fourteen-row corpus
fixture table, §F.2's byte-identity baseline rules, §F.3's verbatim-fixture-string rule and §F.4's seam
doubles are untouched. §C.4's inventory table — including the `fixtures/learnings-baseline/` row and
its `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18 files, which I set-equality-checked at v13 — is also
outside the delta. Nothing this round could have moved a fixture, and nothing did.

**§F.3's verbatim-string rule is again what made the round checkable.** The rule that a quoted string
in this document must be the normative string, not a paraphrase, is why six `grep -cF` calls settled
the whole delta. The one place the delta *chose* to paraphrase rather than quote is `:1340`, inside a
struck bullet — *"an amendment landing **after** batch 13"* — where PLAN v1.3's case C reads *"batch 13
or later"*, which **includes** batch 13. Narrower by one batch, in a struck bullet attributed to PLAN
v0.8 as provenance, and the same bullet's live half (`:1332`) carries the correct quoted form ten lines
above. Low (F-03), inherited, and it costs nothing operationally because batch 13's pre-LI-21 slot is
unreachable at HEAD (`PLAN:561`).

**The fixture-adjacent gap this document reported is now closed upstream, which is the good news
inside F-01.** At v0.8 this document found four `learnings*` files no `LI-*` task owned and routed them
to PLAN rather than absorbing them into its own fixture accounting — a call I endorsed at v13 as the
harder and more correct of the two options. PLAN acted on it: `PLAN:244` now carries a §Post-batch
remediation subsection whose rows carry a **landing commit** instead of an `Owner` cell (because *"the
dispatcher parses `Owner` as a task id and no LI task owns these files"*, `PLAN:683`), and it also
picked up the P-A-5 second-owner rows for `fixtures/learnings-baseline/**` and
`learningsBaselineGuard.test.js`. The routing worked exactly as designed. The only defect is that this
document has not yet noticed the reply. That is a strictly better failure mode than the alternative,
and it is why F-01 reads as pin-lag rather than as a fidelity problem.

**The count-convention imprecision from v13 F-02 is unchanged and now has an upstream counterpart.**
§G.2 gap 5 still says the re-measurement *"finds **eighteen** `learnings*` files under
`pdlc/workflows/__tests__`"* where `git ls-files … | grep learnings` returns 39 paths and eighteen is
the inventory-row count. PLAN `:310` now uses the same convention and spells out its derivation
(*"the ladder's thirteen … plus `2fc6fcd3`'s five added files"*), so the two documents at least agree
on the number and on what it counts. Still Low, still inherited, now shared — I carry it as F-04 rather
than dropping it, because a shared imprecision is the kind that hardens into a fact.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The re-pin's completeness claim is false at two sites the re-pin did not visit.** The header's new v0.9 paragraph asserts *"every ruling this document cites is still present at v1.3, so the finding was pin freshness, not fidelity"*, and enumerates exactly **two** consequences taken with the pin (case C's name, §G.3's case-A window). There are two more. **(a)** `:1181` still offers case B's retired fallback — *"if it lands red, its rows are amended into the ledger by name first, under the same P-A-7 rule"* — where PLAN `:663` (P-A-6) reads *"the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* and routes instead to *"P-A-7's governing case — which at HEAD is case C … the obligation is green-at-landing"*. This is my v13 F-01(c), unresolved; the re-pin sharpens it, because the sentence is now stale against a pin the document claims to hold. `:1185`'s *"P-A-6 (byte-unchanged at v0.8)"* compounds it — true as v0.8 provenance, but P-A-6 changed at v1.1 (`PLAN:682`). **(b)** §G.3's *"Newly routed this round"* item (`:1357`) still asserts PLAN's manifest *"is now incomplete"* by four files; PLAN v1.2 recorded all four in a new §Post-batch remediation subsection (`PLAN:244`, `PLAN:683` item 3) and `PLAN:310` reconciles the tree at eighteen — `grep -c` for the four names in PLAN returns **6**, up from 0. The item is answered and should be struck. **Non-blocking under the freeze**: no property, oracle, fixture, AT mapping or coverage row turns on either site; §C.4's case-C paragraphs state the correct obligation twice above `:1181` (and this delta *strengthened* the first from expectation to record); and (b)'s worst cost is one redundant round-trip to PLAN for work PLAN has already done. Fix at the next ordinary touch: delete `:1181`'s case-B clause in favour of P-A-7's governing case, drop or date `:1185`'s parenthetical, strike §G.3's routed item with a pointer to `PLAN:244`, and narrow the header's claim to the rulings it actually re-checked. | Header `:11`; §C.4 `:1181`, `:1185`; §G.3 `:1357`–`:1367` |
| F-02 | Low | Local | **A quotation carries a terminal period PLAN does not have.** `:1131` quotes PLAN as *"under case C they owe no ledger row, and they owe green."*; PLAN `:561` reads *"…and they owe green — which PROPERTIES §C.4 records as discharged…"*. The words are verbatim; the sentence-ending period inside the quotation marks is the document's. `grep -cF` on the quoted form including the period returns **0**, which costs a verifier one failed check before they find the match. Inherited context, not delta text. Fix: close the quotation before the period, or extend it through the em-dash clause. | §C.4 `:1131` |
| F-03 | Low | Local | **A struck bullet paraphrases case C one batch narrower than PLAN.** `:1340` reads *"an amendment landing **after** batch 13 owes no ledger row at all"*; PLAN v1.3's case C is *"batch 13 **or later**"*, which includes batch 13. Provenance about PLAN v0.8, inside a struck bullet, and the same bullet's live half at `:1332` carries the correct quoted form — so it costs nothing operationally (batch 13's pre-LI-21 slot is unreachable at HEAD, `PLAN:561`). Inherited. Fix: say "in batch 13 or later". | §G.3 `:1340` |
| F-04 | Low | Local | **"Eighteen files" is still an inventory-row count, not a file count** (carried from v13 F-02, unresolved). §G.2 gap 5 says the re-measurement *"finds eighteen `learnings*` files"*; `git ls-files pdlc/workflows/__tests__ \| grep learnings` returns **39 paths** (14 suites, 3 helpers, 22 fixture files). Eighteen is the count of §C.4 inventory rows, which treat `fixtures/learnings-baseline/` as one row. PLAN `:310` now uses the same convention but spells out the derivation, so the two documents agree on the number and on what it counts. Fix: say "eighteen tracked entities" and borrow PLAN's derivation clause. | §G.2 gap 5 |

**Prior-round findings.** My v13 carried no High, one Medium (F-01, the stale PLAN pin, in three limbs)
and one Low (F-02, the file-count convention). **F-01 limbs (a) and (b) are resolved** — case C is
re-quoted and case A's window is corrected, both verbatim against PLAN at HEAD. **Limb (c) is not
resolved** and is re-filed above as F-01(a) together with a second site of the same kind that the
re-pin left behind. **v13 F-02 is not resolved** and is re-filed at Low as F-04.

**Freeze accounting.** No finding meets the blocking bar. F-02, F-03 and F-04 are wording and
convention, all inherited from bytes I approved at v0.8 or earlier. F-01 is a factual contradiction with
an upstream document — the one category that *can* block — but the claims it falsifies are not
load-bearing: no property, oracle, fixture, AT mapping or coverage row depends on which fallback a
hypothetical red PROPERTIES suite would take, or on whether a routed erratum has been answered, and
this document's operative conclusion (case C governs, ledger empty, green at landing, discharged) is
exactly the conclusion PLAN v1.3 reaffirms in the same words. It is the *same substance* I recorded as
non-blocking at v13; the freeze forbids escalating unchanged substance, and I have not. Recorded, not
gated.

DEFERRED: the header's v0.9 paragraph enumerates the two consequences the re-pin took; a third bullet naming the sites it deliberately did *not* re-quote (the `PLAN v0.8` provenance attributions at `:1172`, `:1379`) would make the "provenance, not pins" rule auditable rather than asserted.
DEFERRED: §G.3 has no mechanism for noticing that a routed item was answered upstream; a one-line "re-checked against PLAN at {version}" stamp per open item would have caught F-01(b) at authoring time.
DEFERRED: the six PLAN quotations this delta rests on could carry their `grep -cF` provenance inline, the way §C.4's reversal table carries `sed -n {N}p` anchors — the technique already exists in this document and is not applied to its own upstream quotations.
DEFERRED: this is the fourth consecutive round in which the PLAN pin was the only finding; PLAN has moved five versions in one day, so a pin-by-content-hash (as the `UPSTREAM-STATE` anchors already do) would decouple the two documents' round cadence.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The header now pins PLAN at v1.3 while deliberately leaving `PLAN v0.8` attributions in place as *provenance, not pins*. That is the right distinction, but it is carried in one header sentence and nowhere near the attributions themselves. Would a short inline marker at each provenance site — *"(as ruled at PLAN v0.8; unchanged at v1.3)"* — be worth the four words, given that the next reviewer will otherwise re-raise them every round? |
| Q-02 | PLAN answered §G.3's routed manifest item with a §Post-batch remediation subsection carrying landing commits instead of `Owner` cells (`PLAN:244`). When §G.3 strikes the item, does §C.4's eighteen-row inventory keep its four unowned rows as-is, or re-attribute them to PLAN's new subsection? I read "keep and cite `PLAN:244`" as the better answer — the inventory's value is that it is the output of a command — but it is a choice worth stating once rather than re-deciding. |

## Positive Observations

- **The delta is exactly as wide as the finding it discharges.** Three commits, three hunks, 17
  insertions, 12 deletions — and every one of them inside a region I named in v13 F-01. A revision that
  answers a finding without touching anything else is what makes a delta re-review a diff-read rather
  than a re-read, and this is the third consecutive round where the scope claim survived being diffed.

- **It re-quoted rather than re-paraphrased.** The easy discharge of "your quotation no longer matches"
  is to drop the quotation marks. This revision instead pulled the current strings verbatim, including
  case A's derivation clause *"(which includes batches 7 and 8)"* which it did not need to quote —
  and that is the clause that makes the window falsifiable with a fixed-string grep rather than a
  reading. Six quotations, six `grep -cF` hits at HEAD.

- **It named the *reason* a pin update forces quotation updates.** *"A pin at HEAD may not carry a
  quotation that is no longer verbatim at HEAD."* That sentence is the general rule behind the specific
  fix, written down where the next person re-pinning this document will read it. Most re-pin commits
  update the number and leave the reader to rediscover the rule.

- **It separated pins from provenance explicitly instead of doing it silently.** Re-pinning a header
  to v1.3 while leaving nine `PLAN v0.8` attributions alone looks like an incomplete edit unless the
  document says why. It says why, in one sentence, and attributes the distinction to the review that
  asked for it. That converts what would read as an omission into a stated policy.

- **It upgraded a limb from expectation to record.** *"The amendment is expected to land green"* →
  *"the amendment had to be green at the commit that landed it"*, with PLAN v1.2's *"records an
  outcome, not a pending expectation"* attached. The document was already correct; it is now correct in
  the tense that matches what happened, which is what stops a discharged obligation from reading as a
  live risk two rounds from now.

- **The routing it did at v0.8 worked.** The four unowned remediation files this document declined to
  absorb are now rowed in PLAN's new §Post-batch remediation subsection with the second-owner P-A-5 rows
  beside them. F-01(b) is the cost of that success not yet being reflected back — a strictly better
  failure mode than the alternative, and worth saying out loud in a round whose findings are otherwise
  about staleness.

## Recommendation

**Approved with minor changes**

The revision does what PM v13 F-01/F-02 and my v13 F-01 asked, for two of three limbs, and does it in
the checkable form: PLAN re-pinned v0.8 → **v1.3** (`PLAN:18`), the five intervening versions all
present in PLAN's changelog (`PLAN:680`–`:684`), case C re-quoted as *"batch 13 or later, the case that
is live at HEAD"* and case A's window as *"before batch 9 (which includes batches 7 and 8)"* — six PLAN
quotations written, six `grep -cF` hits at HEAD. No property, oracle, fixture, AT mapping or coverage
row moved, and I verified that from the three-hunk diff rather than from the assertion.

Four findings, none blocking. **F-01 (Medium)** — the header's new completeness claim overreaches: the
case-B fallback at `:1181` (my v13 F-01(c), unresolved) and §G.3's routed manifest item are both stale
against PLAN v1.3, and the re-pin did not visit either. It does not block: the substance is unchanged
from what I recorded as non-blocking at v13, nothing downstream of the document turns on it, and §C.4
already states the correct obligation twice. **F-02/F-03 (Low)** — a quotation period and a struck
bullet's one-batch-narrow paraphrase. **F-04 (Low)** — the inventory-row-versus-file count, carried.

Under the decision freeze I have opened no new decision and escalated no unchanged substance. Four
observations that would improve the document but are not defects are recorded as `DEFERRED:` lines
above rather than folded into the verdict. No upstream defect was found: PLAN at v1.3 is internally
consistent with every claim this document makes of it, so I emit no `ERRATUM:` line this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

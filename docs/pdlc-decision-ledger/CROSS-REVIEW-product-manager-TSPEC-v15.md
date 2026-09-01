# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v1.4)
**Date:** 2026-09-01
**Iteration:** 15 (delta confirmation of an erratum round on an approved document)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v14.md` (`Approved minor changes`, v1.3)

## Overview

I approved v1.3 at round 14. This round is a **delta confirmation** of a v1.3 → v1.4 erratum
carrying exactly two self-correction items — both landing *against this document*, both bringing the
spec into line with code that is already shipped and DoD-verified (`e707bb119`, CODE_REVIEW round 2).
My question is narrow and I kept it narrow: did the two routed items land faithfully at their loci,
does the delta introduce any new defect or contradiction, and do my round-14 conclusions still hold?

I measured the delta against the diff supplied, then verified every claim it makes about the shipped
code directly in `pdlc/workflows/orchestrate-dev.js` rather than trusting the changelog's account of
it. **Both items landed faithfully. No High.** One new Low about the erratum paragraph's own upstream
digests (they are `git hash-object` blob ids, not the `sha256` pins the sentence says they are), one
new Low about an optionality mismatch the widening introduces between §4.4/§4.5 and §5.1, and my four
round-14 findings all carry forward untouched (the delta did not enter their sections).

## Product-lens framing: why a spec-catches-up-to-code erratum still gets a product read

Neither item moves a requirement. Nothing is minted, retired or re-scoped; no `BR-`, `AC-`, `E-`,
`M-`, `O-` or `ERR-` id changes; no threshold, byte literal or measured value moves; §3, §5, §6, §7
and §8 are untouched. So the product exposure here is not "did the feature change" — it is **"can the
next implementer still read this document and build the approved behaviour"**. On both items the
answer got materially better, because in each case the document was previously asserting something
about the shipped seam that is false, and false specification is the failure mode that silently
narrows a requirement two features from now.

## Item 1 — the injector seam payload: landed, and verified against code

The claim is that §4.4 and §4.5 typed `_injectDecisionLedger` as `(args: { feature: string }) =>
Promise<string>` while the shipped call site passes four fields. I verified the shipped side rather
than the account of it:

| Locus | Shipped reality | v1.4 text |
|---|---|---|
| Production call site | `orchestrate-dev.js`:9997 — `await _injectDecisionLedger({ feature, phaseId: phase, docType: roundDocType, round: iteration })` | §4.5's snippet is now the same four bindings |
| Injector closure | `injectDecisionLedger({ feature, phaseId, docType, round } = {})`, copying all four onto the pushed record | §4.4's return type now `{ feature, phaseId?, docType?, round? }` |
| Record shape | `DecisionLedgerDispatchRecord` — `phaseId: string \| null`, `docType: string \| null`, `round: number` | §5.1 unchanged, and correctly so |

All five declared loci carry the widened payload: both §2.1 call-graph nodes (:428, :432), §4.4's
return type, §4.5's seam declaration and §4.5's call-site snippet. The document previously
**contradicted itself** — §5.1 promised three populated fields that §4.4's own type made
unreachable — and that contradiction is now gone. This is the item I would have raised myself had it
not already been routed: a seam typed narrower than it ships reads as an instruction to the next
implementer to stop passing the context, which would hollow out §5.1's record and, downstream, the
observability the report field exists to give.

The added prose at :1097–1100 is the part I most wanted: it says *why* the four arguments are the
enclosing loop's own bindings and that `docType` is `null` on the Phase CR dispatches. That is
faithful — `roundDocType` is exactly what the code passes, and §5.1's `string | null` typing is what
makes the `null` legal rather than a defect.

## Item 2 — the ninth `reviewerPrompt` parameter: landed, and the mechanism is stated correctly

This item is the more interesting one, because it is a claim about *where a block lands in a
delivered prompt* — which is the closest thing this feature has to a user-visible surface. The old
text specified a ninth `reviewerPrompt` parameter and said the block is "appended last". I checked
whether the new text's account of the shipped path is true end to end:

- `reviewerPrompt` (`orchestrate-dev.js`:11906) takes **eight** parameters, ending at
  `findingGrammar`. No ledger parameter. §4.5's `// reviewerPrompt is UNCHANGED` declaration and the
  §2.1 diagram's `[SHIPPED, unchanged]` annotation are both accurate.
- `wrapped` (:9759) and `runWrapped` (:9785) each take a trailing `ledgerBlock = ""`, and `wrapped`
  forwards it into `dispatchAndVerify` (:9777).
- `dispatchAndVerify` declares `ledgerBlock = ""` (:11485) and builds
  `` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` ``
  (:11616).

So §2.4's rewritten sentence — appended last, *after* the pacing-contract clause, the opener and
`learningsBlock` — is literally true of the delivered prompt, which the old text was not. **This is
the substantive product improvement in the round**, and I want to name it as such rather than treat
it as bookkeeping: FSPEC's placement obligation is about the prompt the reviewer actually receives,
and the old spec would have satisfied itself by appending to a builder's return value that the
wrapper then buried under its own suffix. The requirement is now stated at the hop that can actually
discharge it.

The scope re-wordings follow correctly. §2.5 now says the index attaches to "the review-loop reviewer
dispatch — the two `runWrapped` calls that carry a `reviewerPrompt` body", and §9.1's D-2 mirrors it.
**The scope itself is unchanged** — still the two review-loop reviewer dispatches, still explicitly
not the delta-confirmation prompt and not the finding-restatement prompt, with the same rejected
alternative and the same reason. I checked this specifically, because a re-wording of a decision row
is exactly where a scope can quietly widen; it did not. §1.2's reuse row and §2.3's flag-off recital
also name the new hop, and §2.3's disabled path still resolves to `""` threaded through the same
closures — REQ C-2's byte-identical-when-off promise is undisturbed.

The parenthetical at :527 ("Corrected in v1.4: v1.0–v1.3 specified a ninth `reviewerPrompt`
parameter… nothing about where the block lands in the delivered prompt changed") is the right
disclosure. It tells a future reader that this is a spec correction, not a redesign, which is the
distinction that decides whether they go re-open the decision.

## Does the delta introduce a new defect or contradiction?

Three checks, two of which produced a Low.

**Upstream re-grounding: the conclusion is true, the digests are in the wrong namespace (F-01).** The
v1.4 paragraph says upstream re-grounding "found **nothing moved** — REQ **v1.10** (`5efd4fd3…`),
FSPEC **v1.4** (`cccaae60…`), Baseline **v1.2** are exactly the pins the header already names". The
*conclusion* is correct and I verified it independently: `shasum -a 256` at HEAD returns
`9bc8bc32…05f10d` for REQ and `48691453…a11256` for FSPEC — byte-identical to the pins the v1.3 entry
records, so nothing moved and the header pin does stand as written. But `5efd4fd3…` and `cccaae60…`
are **`git hash-object` blob ids** (I reproduced both), not `sha256` digests, so the sentence asserting
they "are exactly the pins the header already names" is false as written — the header names sha256
digests, and no prefix comparison a reader makes will succeed. Low: revision-history-confined, no
normative section or measured value touched, and the substantive re-grounding claim survives. But it
is the same *class* as my round-14 F-01 and my Q-02 — a cross-document state claim whose measurement
basis is not stated — which is why I am recording it rather than waving it through.

**Optionality mismatch between §4.4/§4.5 and §5.1 (F-02).** The widened type marks `phaseId`,
`docType` and `round` optional, and the new prose says rendering-only unit callers may omit them. The
shipped closure destructures with `= {}`, so an omitting caller pushes a record whose `phaseId`,
`docType` and `round` are `undefined` — which §5.1 does not admit (`string | null`, `string | null`,
`number`). The document is right that production supplies all four, and this is a unit-caller-only
shape, so it is Low, not a contract defect. One clause in §4.4 saying so would close it.

**No new contradiction anywhere else.** I checked the surviving `reviewerPrompt` mentions the erratum
did not rewrite (:252, :1095, :1353–1356) and none of them re-asserts the removed parameter — they
describe the injector's placement relative to the reviewer-prompt calls and the defect classes the
source census cannot catch, both still true. §5.1, §7 and the AT tables are byte-unmoved. The
declared touched-section list (header, §1.2, §2.1, §2.3, §2.4, §2.5, §4.4, §4.5, §9.1's D-2,
changelog) matches the diff exactly — I checked line by line, as I did last round.

## Do my round-14 conclusions still hold?

Yes, all four findings carry forward unaddressed, and the delta correctly did not enter their
sections:

- **v14 F-01** (v1.3 changelog asserts PLAN v0.7 carries the retired fifteen-member owned list and a
  production home for `DECISION_LEDGER_CENSUS_TOKENS`, :78–79, :92–93) — still present, and now
  *further* stale: PLAN is at **v1.1** at HEAD, two versions past the v0.9 I measured last round.
  Carried at Medium as F-03 below.
- **v14 F-02** (§7.6's AT-14 row, :1785, hangs all three cases on `FSPEC E-7`; the zero-decision-set
  case is E-6's) — byte-unmoved. Carried at Low as F-04.
- **v14 F-03** (§4.3's enforcement rationale over-claims the census guard) — untouched. Carried at
  Medium as F-05.
- **v14 F-04** (§7.3's *Forbidden token set* row carries the same over-claim) — untouched. Carried at
  Low as F-06.

Everything I approved at round 14 on the product axis is intact: the two thresholds still typed as
REQ types them, the four corpus literals (6,305 / 10,859 / 12,059 / 441) byte-unmoved, the Baseline
pin at v1.2, §7.3's census contract unmoved, REQ-DECLEDGER-07 and REQ-DECLEDGER-08 still traced end to
end. No acceptance criterion is narrowed, broadened or re-triggered; no decision is re-opened.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Should the upstream re-grounding formality (DEC-ERR-03) name the hash function it used? Two consecutive rounds have now produced a revision-history sentence whose measurement basis a reader cannot reconstruct — v14's F-01 (a version numeral measured against an unstated commit) and this round's F-01 (blob ids presented as the header's sha256 pins). "`sha256:` prefix, or state the tool" is a one-word fix per site. |
| Q-02 | v14's F-01 is now three PLAN versions stale (v0.7 asserted, PLAN at v1.1). The disposition remains right — it is PLAN's phase to own, and it appears to have been owned — but the sentence keeps re-presenting a closed item to every subsequent round. Is there an erratum-withdrawal step, or does the sentence simply get corrected in the next edit that opens the revision history? |

## Positive Observations

- **The item that mattered most was the one about the delivered prompt, and it was fixed at the right
  hop.** Moving the block from a builder's return value to `dispatchAndVerify`'s trailing parameter is
  the difference between "last in something" and "last in what the reviewer reads". §2.4 now states
  the mechanism that makes the obligation discharge, and §1.2's reuse row explains why the shipped
  `findingGrammarPart` precedent is followed *one hop later* rather than copied literally. That is the
  kind of correction that stops a future reimplementation from regressing quietly.
- **Every claim the erratum makes about shipped code checked out against the code.** Four call sites,
  two signatures and the prompt-concatenation expression — I verified each rather than reading the
  changelog's account, and found no overstatement. When a document says "the code is right and was
  left untouched", that claim is only worth what an independent check makes it worth; it held.
- **The self-correction is disclosed, not silently rewritten.** §2.4's parenthetical tells the reader
  v1.0–v1.3 said something else, why it was wrong, and that the behaviour never changed. A reader who
  finds a v1.2 copy will now reconcile it instead of re-opening the decision.
- **Scope re-wording without scope drift.** §2.5 and D-2 changed their subject from `reviewerPrompt`
  to the review-loop reviewer dispatch while keeping the same two-dispatch scope, the same exclusions
  and the same rejected alternative. This is where a widening would have been easiest and cheapest to
  slip in; it did not happen.
- **The declared touched-section list was exact, again.** Second consecutive round where the changelog
  names its own blast radius and the diff agrees line for line. That discipline is why these
  confirmations stay cheap.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | v1.4's re-grounding paragraph cites REQ v1.10 as `5efd4fd3…` and FSPEC v1.4 as `cccaae60…` and says these "are exactly the pins the header already names". They are `git hash-object` blob ids (both reproduced), not sha256 digests; the header and the v1.3 entry name `sha256:9bc8bc32…05f10d` and `sha256:48691453…a11256`, which is what `shasum -a 256` returns at HEAD. The conclusion (nothing moved, header pin stands) is **true and independently verified**; only the identity assertion is false as written, and a reader comparing prefixes will wrongly conclude upstream moved. Fix: quote the sha256 prefixes, or label the values as blob ids. | Revision history, v1.4 entry, :19–23 |
| F-02 | Low | delta | local | The widened seam type marks `phaseId`, `docType`, `round` optional and the new prose says rendering-only unit callers may omit them, but §5.1's `DecisionLedgerDispatchRecord` types the corresponding fields `string \| null` / `string \| null` / `number`. The shipped closure destructures `{ feature, phaseId, docType, round } = {}`, so an omitting caller pushes `undefined` in three fields §5.1 does not admit. Production supplies all four, so this is unit-caller-only. Fix: one clause noting omission is a unit-level shape whose records are not §5.1-conformant, or type the fields required. | §4.4 return type and §4.5 seam declaration, :1035–1045, :1060–1066 |
| F-03 | Medium | inherited | nonlocal | v1.3's changelog still states in present tense that `PLAN` v0.7 carries the retired fifteen-member owned list and a production home for `DECISION_LEDGER_CENSUS_TOKENS` (:78–79, :92–93). PLAN is at **v1.1** at HEAD — three versions past the v0.7 named, two past the v0.9 I measured at round 14, where all six routed sites were already corrected. The disposition (route to PLAN's phase) was right; the tense and version are wrong, and the sentence keeps re-presenting a closed item. Confined to revision history — no normative section, count, contract or acceptance criterion affected. Carried from v14 F-01 (and v13 F-01); delta did not touch the v1.3 entry. | Revision history, v1.3 entry, :78–79, :92–93 |
| F-04 | Low | inherited | nonlocal | §7.6's AT-14 row hangs all **three** cases on `FSPEC E-7`; E-7 covers only the two zero-bound cases, the zero-decision-set case is E-6's, and FSPEC's own AT-14 cites `E-6, E-7`. Behavioural assertion unchanged and still faithful — pointer only. Fix: cite `FSPEC AT-14`, or `E-6, E-7`. Carried from v14 F-02; byte-unmoved across the delta. | §7.6, AT-14 row, :1785 |
| F-05 | Medium | inherited | nonlocal | §4.3's framing paragraph still claims that hoisting the sentinel strings to a top-level `const` would be caught by §7.3's classify-or-redden guard. It would not: the set equality ranges over *members of* the frozen owned list, a non-member is never compared, and an inert sentinel string constant carries none of the six forbidden tokens. The normative rule ("ship inline string literals") is correct and unaffected; the stated enforcement is not, and a future editor relying on it would conclude the pin is self-enforcing. Carried from v14 F-03 (and v13 F-02); §4.3 untouched by the delta. | §4.3 framing paragraph, :936–938 |
| F-06 | Low | inherited | nonlocal | §7.3's *Forbidden token set* row asserts that a symbol added later "must be classified into one list or the other or the test reddens" — the same over-claim as F-05, and its source. An added declaration reddens only if it carries a forbidden token. Cheaper to fix in the same edit as F-05. Carried from v14 F-04 (and v13 F-03); untouched by the delta. | §7.3, *Forbidden token set* row, :1475 |

FINDING: Low | delta | local | Revision history, v1.4 entry, :19-23 | v1.4's re-grounding cites REQ v1.10 as 5efd4fd3 and FSPEC v1.4 as cccaae60 and calls them "exactly the pins the header already names"; both are git hash-object blob ids, while the header names sha256:9bc8bc32...05f10d and sha256:48691453...a11256, which is what shasum -a 256 returns at HEAD. Conclusion (nothing moved) verified true; only the identity assertion is false. Fix: quote the sha256 prefixes or label the values as blob ids.
FINDING: Low | delta | local | §4.4 return type and §4.5 seam declaration, :1035-1045, :1060-1066 | Widened seam types phaseId, docType, round as optional and invites unit callers to omit them, but §5.1's DecisionLedgerDispatchRecord types those fields string|null, string|null, number; the shipped closure destructures with = {} so an omitting caller pushes undefined in three fields §5.1 does not admit. Production supplies all four. Fix: one clause scoping omission to unit-level callers, or type the fields required.
FINDING: Medium | inherited | nonlocal | Revision history, v1.3 entry, :78-79, :92-93 | v1.3's changelog still asserts in present tense that PLAN v0.7 carries the retired fifteen-member owned list and a production home for DECISION_LEDGER_CENSUS_TOKENS; PLAN is at v1.1 at HEAD, three versions past, with all six routed sites corrected as of v0.9. Confined to revision history, no normative section or acceptance criterion affected. Carried from v14 F-01; delta did not touch this entry.
FINDING: Low | inherited | nonlocal | §7.6, AT-14 row, :1785 | Row hangs all three cases on FSPEC E-7, but E-7 covers only the two zero-bound cases and the zero-decision-set case is E-6's; FSPEC's own AT-14 cites E-6, E-7. Behavioural assertion unchanged and still faithful; pointer only. Carried from v14 F-02, byte-unmoved across the delta.
FINDING: Medium | inherited | nonlocal | §4.3 framing paragraph, :936-938 | Claim that hoisting the sentinel strings to a top-level const would be caught by §7.3's classify-or-redden guard does not hold: the set equality ranges over members of the frozen owned list, a non-member is never compared, and an inert sentinel string carries none of the six forbidden tokens. Normative rule stands; stated enforcement does not. Carried from v14 F-03, §4.3 untouched by the delta.
FINDING: Low | inherited | nonlocal | §7.3 Forbidden token set row, :1475 | Row's claim that a later-added symbol must be classified into one list or the other or the test reddens carries the same over-claim as the §4.3 sentence and is its source; an added declaration reddens only if it carries a forbidden token. Carried from v14 F-04, untouched by the delta; fix with F-05 in one edit.

## Recommendation

**Approved minor changes**

Both routed items landed faithfully at all their declared loci, and every claim the erratum makes
about the shipped seam and the shipped ledger threading checks out against `orchestrate-dev.js`. The
delta removes a genuine self-contradiction (§4.4's narrow type versus §5.1's populated record) and
re-states the prompt-placement obligation at the hop that can actually discharge it, without moving
any requirement, id, threshold or measured value. Nothing I approved at round 14 is disturbed. No
High; the two new findings are Low and both are one-clause fixes in sections this round already
touched, and the four inherited ones are unchanged carry-forwards that do not gate this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 4}

APPROVAL-HASH: sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d
APPROVAL-HASH-NORMALIZED: sha256:6970093e3d880f7169d8f73a76bee4f5030adfa7f570fb30e68520c940e5c164
REVIEWED-COMMIT: 648a05255df3be3806bc279420a84a82f60f9dbe
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256

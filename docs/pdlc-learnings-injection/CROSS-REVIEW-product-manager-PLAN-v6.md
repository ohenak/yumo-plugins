# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4, bytes unchanged)
**Date:** 2026-08-20
**Iteration:** 6
**Mode:** upstream-cascade confirmation — TSPEC moved under a recorded approval

## Overview

My v5 approval of PLAN v0.4 was recorded against TSPEC `sha256:eff5a19b…` (commit `ccc739d1`,
TSPEC v0.6). TSPEC at HEAD is `sha256:f629d29d…` (commit `bfe58851`) — TSPEC v0.7, seven commits
later. PLAN's own bytes have not moved (`REVIEWED-COMMIT: 1f8a90be`, still current for this file).
The one question here: is PLAN v0.4 still a faithful compression of TSPEC as it now stands?

The delta is 66 insertions / 37 deletions across eight loci. Two are cosmetic-by-intent
(DEC-DOC-01 de-anchoring), one is a wording scope fix, and **two retire the routing that PLAN's
§Errata section is built on**:

| TSPEC locus | Before (the version I approved against) | After (HEAD) |
|---|---|---|
| **§Open Questions ERR-7** | Open. "FSPEC BR-1 as written forbids this conjunct … a test written to FSPEC reds a correct implementation" | **CLOSED**, resolved by FSPEC v0.11/v0.12. "no question remains routed to FSPEC on this point" |
| **§Open Questions ERR-3** | Open. "As written, AT-33's set equality cannot hold" | **CLOSED**, resolved by FSPEC v0.11. "AT-33 tracks the correction; nothing in this TSPEC changes" |
| **§A.2** | The `docType` conjunct is "a divergence from BR-1 … routed as ERR-7, not resolved silently in code" | "This is FSPEC BR-1 as it now stands, **not a divergence from it**"; §I.3's predicate "implements BR-1 directly" |
| **§A.2 complement** | "AC-4.3's byte-identity for **non-authoring** dispatches" | "AC-4.3's byte-identity for the dispatches **outside BR-1's rule**" |
| **§D.1** | Each domain test asserts every value it carries is a catalogue member | Each asserts every **non-`null`** value is; the test reads `v === null \|\| catalogue.includes(v)`; the non-`null` scoping is named load-bearing for both corpus-outcome domains |
| **P-2a** | "Four code sites carry `dispatchKind: \"authoring\"`", cited by four line anchors | Same four sites, restated as **three object-literal properties plus one positional argument**, cited by enclosing symbol and call shape per DEC-DOC-01 |
| **P-2b, P-10, §T.6, ERR-2** | Line anchors (`:14551-14556`, `:7306`, `:15167`, `:12915`) | Symbol/call-shape citations per DEC-DOC-01 |

**The headline:** this delta moved TSPEC **toward** this PLAN on every substantive locus. TSPEC's
new P-2a wording is, almost verbatim, the structural key LI-01 already commissions; TSPEC's new
§D.1 non-`null` scoping is, verbatim, what LI-23 and §Traceability already carry (both from TE
F-01). No task row's instruction is falsified, no row is added, split or re-ordered, and PLAN
carries **no raw `file:line` anchors at all**, so the DEC-DOC-01 de-anchoring cannot have stranded
a citation here.

What the delta does falsify is PLAN's **prose about upstream**. §Errata routes two items to FSPEC
"first raised by TSPEC v0.6 (as ERR-3 and ERR-7)" and describes both as still live; TSPEC has now
retired both by name, and describes §A.2's conjunct as implementing BR-1 rather than diverging from
it. PLAN is now the only document in the chain still asserting the divergence. That is the same
family as v5's F-01/F-03 — which PLAN has not yet had a revision pass to absorb — now compounded by
the second upstream. Nothing here is High: no implementer reading PLAN builds anything different.

No finding is High. **PLAN still holds as approved.**

## Batches

I walked the four task rows that carry material this delta touched. **None of their instructions
changes.** Three of them were already written to the reading TSPEC has now adopted.

**LI-01 (batch 1, the premise pre-flight) — TSPEC P-2a has come to LI-01's wording, not the other
way round.**

At approval time TSPEC P-2a said "Four code sites carry `dispatchKind: \"authoring\"`" and listed
four line anchors. That phrasing is literally false as a grep — a search for `dispatchKind:
"authoring"` returns three, because the fourth site is a positional argument. LI-01 already said so
and already fixed it, on TE F-12: it commissions "P-2a as **three object-literal `dispatchKind:
\"authoring\"` sites plus one positional `\"authoring\"` argument at the review-loop optimizer
call** — measured at HEAD, and the phrasing matters because a literal grep … returns 3, not 4".
TSPEC P-2a at HEAD now reads "three object-literal `dispatchKind: \"authoring\"` properties …
plus one positional argument, `reviewLoop()`'s optimizer call `runWrapped(optimizer, optPrompt,
doc, \"authoring\", …)`". That is LI-01's sentence. The row is now the faithful reading of both
documents rather than a correction of one.

The same holds for LI-01's four-member structural key. PLAN keys the set equality by *(enclosing
named function, prompt-source symbol)* — `(erratumRound, erratumAuthorPrompt)`, `(erratumRound,
the land-proof-retry inline template)`, `(converge, creatorPrompt)`, `(reviewLoop, optimizerPrompt
— positional argument 4 of runWrapped)`. TSPEC's new P-2a names exactly those four by enclosing
symbol and call shape. The key remains injective over them, and LI-01's premise suite stays green
at batch 1 by construction.

**LI-01's P-10 assertion survives the de-anchoring.** PLAN commissions "`buildFinalReport` takes a
`notices = []` parameter and spreads `advisory` conditionally" — a structural claim, never
positional, and PM F-07's "existence and shape only" rule. TSPEC P-10 dropped `:15167` and now
cites `buildFinalReport`'s returned object literal by symbol. LI-01 asserts the same fact and never
transcribed the anchor.

**LI-23 and §Traceability's arm table (batch 5) — TSPEC §D.1 has come to PLAN's non-`null`
scoping.**

| Locus | TSPEC at approval | TSPEC at HEAD | Effect on PLAN |
|---|---|---|---|
| §D.1 domain tests | "one test per domain asserts that **every value** it ever carries is a member of that field's catalogue" | "every **non-`null`** value"; `v === null \|\| catalogue.includes(v)`; `null` deliberately not a catalogue member; scoping vacuous for `rejected[].reason` and `notices[].id` | LI-23 already asserts "every **non-`null`** `corpusOutcome` value … set-equal to the frozen catalogue", and already gives TSPEC's own reason (`null` is §D.2's healthy value; `RSN-COUNT`/`RSN-BYTES`/`RSN-SELF` cannot be driven without observing it) and already forbids the wrong repair (`LEARNINGS_CORPUS_OUTCOMES ∪ {null}`). Doubly grounded now |

Before this delta, LI-23's non-`null` scoping was a PLAN-local departure from a literal reading of
§D.1, justified by TE F-01 and by §D.2. It is now what §D.1 asks for verbatim. A test author
working from TSPEC at HEAD and one working from PLAN write the same three set equalities.

**LI-11 (batch 5, the RED dispatch-universe suite) — unchanged, and its AT-02/AT-33 oracles are now
grounded in an upstream that no longer routes them as contested.** The composition-site probe
(accepted set `= LEARNINGS_TARGET_DOCTYPES`, observed set `= LEARNINGS_TARGET_DOCTYPES ∪ {null,
\"LEARNINGS\"}`) is what §A.2's `docType` conjunct requires; §A.2 at HEAD calls that conjunct an
implementation of BR-1 rather than a divergence. AT-33's hand-transcribed read set with the
enumeration excluded is what ERR-3's closure text now states outright. Both oracles were already
written this way.

**LI-11's fourth run shape (§T.6) — one loose thread, and it is not PLAN's to pull.** TSPEC §T.6
still says the erratum land-proof retry is "A fourth [run shape] added **that FSPEC's inventory
does not carry**", and this delta only de-anchored its citation. FSPEC at HEAD carries four shapes
of its own, the fourth being a different shape (authoring-classified, non-C-1 target). PLAN line
539 repeats TSPEC's claim. That mismatch is already routed as **v5 F-02** against this PLAN, and
the TSPEC-side half belongs to TSPEC's own confirmation round; I do not re-raise it here, and I
reconcile my Scope tag with v5 rather than double-counting the same defect.

## Dependencies

**No edge in the batch ladder changes.** The delta touched no obligation, no ordering constraint,
and no integration point that PLAN's §Dependencies leans on. I checked the four edges whose
justification quotes TSPEC.

| Edge | Justification PLAN gives | TSPEC at HEAD | Verdict |
|---|---|---|---|
| everything → LI-01 | "a premise that has moved **since TSPEC v0.6** must become blocking work before any task builds on it" | The premise table is still §Measured premises P-1…P-12, same twelve claims, same substance; P-2a/P-2b/P-10 were restated as symbol citations with "No behavioural change" recorded in the v0.7 erratum note | Edge holds. The **version pin is stale** — see F-03 |
| LI-04, LI-05 → LI-03 | "both obligations of **TSPEC §T.3**" | §T.3 untouched by this delta | Holds |
| LI-15 → LI-06 | **T-O-2**, the first production edit may not precede the baseline capture | §Named obligations untouched | Holds |
| LI-21 → LI-23 | LI-21 is the task after which all twelve §T.7 arms are reachable | §T.7's twelve-arm inventory untouched | Holds |

**§Integration points is unaffected.** Its six rows name `readAdvisoryConfigSafely` /
`MERGE_CONFIG_PATH`, `dispatchAndVerify`'s `basePrompt` + `PACING_CONTRACT_CLAUSE` + `opener`,
`wrapperSeams`/`reviewLoop`/`wrapped` at "five hand-written hops", `buildFinalReport`'s conditional
`advisory` spread and `notices = []` channel, `consolidate-learnings.js`'s
`LS_FILES_ARGV`/`enumerateCorpus`, and `prepack.mjs`'s `MODULE_NAMES` — every one of them a symbol
name, not a line anchor. The DEC-DOC-01 sweep that rewrote TSPEC's P-2a, P-2b, P-10, §T.6 and ERR-2
citations therefore has no counterpart to fix here: **PLAN cites nothing positionally.** I grepped
the whole document for `{file}:{line}` forms and found none.

**§Upstream and downstream documents holds.** PROPERTIES still owes T-O-4, T-O-5 and T-O-6; TSPEC's
§Named obligations still carries all three; `depends-on` is still empty and no queue row binds this
feature.

**The one §Dependencies defect is the version pin, and it recurs in four places.** PLAN's front
matter reads "`TSPEC-pdlc-learnings-injection.md` (v0.6); `FSPEC-…` (v0.10)"; §Overview repeats
"Behaviour lives in REQ v0.9 / FSPEC v0.10 / TSPEC v0.6"; the LI-01 edge says "since TSPEC v0.6";
the changelog's 0.1 row says "First draft from REQ v0.9 / FSPEC v0.10 / TSPEC v0.6". TSPEC is v0.7
and FSPEC is v0.12 at HEAD. This is Low, not Medium: no reading of a version number changes what a
task builds, and unlike §Errata it makes no substantive claim about what upstream says. But it is
the field a later reviewer uses to decide whether an approval is current, so it should not be left
behind by the same pass that fixes F-01 and F-02.

## Verification

I re-read §Verification's five closure claims, §Traceability's three tables, and §Errata against
TSPEC at HEAD.

**Claim 2 (TSPEC-local cases) holds and is now better grounded.** It requires green on
`LI-T-PIN-1`, "the composition-site set equality on **both** operands", `LI-T-RETRY-1…3`,
`LI-T-IGNORE`, `LI-T-WORKTREE`, the baseline digest guard, the porcelain write-delta and the static
seam scan. Every one of those is a TSPEC-local case TSPEC still carries; the composition-site probe
is precisely the oracle §A.2's now-endorsed `docType` conjunct needs.

**Claim 3 (twelve fail-open arms) holds verbatim.** It already reads "asserted by
`learningsArmInventory.test.js` (LI-23) as set equality against the three frozen catalogues", and
§Traceability's arm table already carries the non-`null` scoping with §D.2 as its reason. TSPEC
§D.1 now states that scoping itself. PLAN's compression and TSPEC's text agree word for word.

**Claim 4 is the one §Verification defect, and it is the second upstream to falsify it.** PLAN
scopes baseline byte-identity to "every **non-authoring** dispatch (AC-4.3)". At approval time that
was TSPEC §A.2's own phrase ("AC-4.3's byte-identity for non-authoring dispatches"). §A.2 at HEAD
says "AC-4.3's byte-identity for the dispatches **outside BR-1's rule**" — deliberately widened,
because Phase CR's optimizer round is authoring-classified and *is* covered by the promise. FSPEC
AT-03/AT-29 made the same move one round earlier, which is why I raised this as **v5 F-03**. I
re-raise it here rather than deferring to v5: v5 recorded FSPEC as the falsifying upstream, and the
correcting pass now has to satisfy both, so the finding's evidence changes even though its fix does
not. The Scope tag is reconciled with v5's (Local, Medium), not escalated.

**§Traceability's three tables hold.** The 35-AT partition, the TSPEC-local case list and the
twelve-arm map all key on TSPEC ids that this delta did not renumber, retire or re-own. §"TSPEC
obligations and open questions → where they land" maps F-O-1…F-O-7 to tasks — all seven still
discharged in TSPEC, none reopened — and its OQ.3 row still matches TSPEC's disposition.

**§Errata is where PLAN now misdescribes TSPEC, and this is the round's substantive finding.** The
section's preamble says the two defects "were first raised by **TSPEC v0.6** (as ERR-3 and ERR-7)
and are re-raised because FSPEC v0.10 … does not carry a correction for either". TSPEC v0.7 marks
**both CLOSED by name**: ERR-3 "CLOSED, resolved by FSPEC v0.11 … AT-33 tracks the correction;
nothing in this TSPEC changes"; ERR-7 "CLOSED, resolved by FSPEC v0.11 and v0.12 … no question
remains routed to FSPEC on this point". PLAN is now the last document in the chain still routing
them.

The BR-1 row is worse than stale, because it makes a claim **about TSPEC** that TSPEC contradicts:
"TSPEC §A.2 **adds** the load-bearing `docType ∈ LEARNINGS_TARGET_DOCTYPES` conjunct" that BR-1
forbids, with the consequence "LI-11's AT-02 has two contradictory expected sets … a reviewer
scoring it against BR-1 would reject a correct test". §A.2 at HEAD says the opposite in terms:
"This is FSPEC BR-1 as it now stands, **not a divergence from it** … §I.3's `docType ∈
LEARNINGS_TARGET_DOCTYPES` predicate implements BR-1 directly." There is no longer a second
expected set, and a reviewer scoring LI-11 against BR-1 at HEAD now *accepts* the test. The row's
stated risk is extinct, and leaving it standing invites a future pass to "resolve" a conflict that
no longer exists.

**§"TSPEC's remaining open errata (ERR-1, ERR-2, ERR-5)" is now the wrong list.** With ERR-3 and
ERR-7 closed, ERR-4 and ERR-6 already closed in TSPEC v0.5, TSPEC's live set is exactly ERR-1,
ERR-2 and ERR-5 — which is what PLAN says, so that sentence survives by luck. The sentence above it
does not.

None of this reaches a task row. LI-11's instruction, its fixture list and its two contested
oracles are unchanged and correct; §Errata's function was to warn a test author away from writing
LI-11 from FSPEC, and that hazard has been removed upstream rather than by any edit here. The
correction is to record the resolution, not to change the work.

## Positive Observations

- **PLAN was ahead of TSPEC on two loci, and TSPEC came to it.** LI-01's P-2a phrasing ("three
  object-literal sites plus one positional argument", TE F-12) and LI-23's non-`null` corpus-outcome
  scoping (TE F-01) were both PLAN-local corrections of a literal reading of TSPEC v0.6. TSPEC v0.7
  now states both itself. That is the review loop working in the direction it is supposed to: a
  downstream document's precision propagating back up rather than being flattened.
- **PLAN cites nothing positionally.** The DEC-DOC-01 sweep that rewrote four TSPEC citations found
  no work to do here, because every PLAN reference to code is a symbol, a parameter name or a call
  shape — LI-01 goes further and forbids positional assertions outright ("one **structural** (never
  positional) assertion per premise"). A PLAN written with line anchors would have needed a
  correcting pass this round.
- **The §Errata section did its job and can now be retired on the record.** It existed to stop a
  test author writing LI-11 from FSPEC and reddening a correct implementation. Both routed items
  were fixed upstream, in the documents that owned them, without PLAN editing FSPEC or resolving
  anything silently in a task row. Retiring it is a bookkeeping act, not a retreat.
- **Nothing in the delta reaches the batch ladder.** Fourteen batches, twenty-two rows, four
  ordering obligations — zero re-ordering, zero re-scoping, zero new rows. An upstream erratum round
  that leaves the work breakdown untouched is the cheap kind, and it is worth saying so.

## Recommendation

**Approved with minor changes**

PLAN v0.4 still holds as approved against TSPEC v0.7. No task row's instruction, dependency edge or
verification gate is falsified; the delta moved TSPEC toward this PLAN on every substantive locus.
Three corrections should be folded into PLAN's next pass, alongside v5's still-unaddressed F-01/F-02
(this PLAN has had no revision round since):

1. **F-01** — rewrite §Errata: TSPEC v0.7 marks ERR-3 and ERR-7 CLOSED, and the BR-1 row's claim
   that "TSPEC §A.2 adds" a conjunct BR-1 forbids is contradicted by §A.2's current text. Record
   FSPEC v0.11/v0.12 as the resolving versions and keep one provenance line for harvest.
2. **F-02** — widen §Verification claim 4 from "every non-authoring dispatch" to the complement both
   upstreams now state, "every dispatch outside BR-1's rule, including an authoring-classified
   dispatch with no C-1 target". Same defect as v5 F-03, now with TSPEC §A.2 as a second witness.
3. **F-03** — refresh the four stale version pins (front matter, §Overview, the LI-01 edge
   rationale, the changelog 0.1 row) to TSPEC v0.7 / FSPEC v0.12.

F-01 and F-02 sit in sections this TSPEC edit changed the ground under, so both are `delta` and
`local` and route back to this document's ordinary revision loop. F-03 is `delta`/`local` on the
version field the erratum bumped. No finding halts the phase.

## Delta-Confirmation Findings

_pending_

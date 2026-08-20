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

_pending_

## Verification

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

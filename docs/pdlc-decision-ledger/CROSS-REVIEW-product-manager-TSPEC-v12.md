# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.1)
**Date:** 2026-08-29
**Iteration:** 12 (delta confirmation — round 11's routed items)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…3c7b7c`, FSPEC v1.3 `sha256:2bd5c3ef…5aed39`

## Overview

I approved this TSPEC at v0.7, v0.8, v0.9 (minor) and v1.0 (minor, round 11). This round is a
**delta confirmation** on the two routed items — se-review's six-place and te-author's five-place
report that `PLAN` v0.7 states the census constants' home and cardinality against TSPEC §7.3.

What I did: re-read my v11 findings, ran `git diff 452d72c07..HEAD` over the TSPEC (the commit v11's
`REVIEWED-COMMIT:` anchor names), re-measured both upstream documents at HEAD, then re-read §7.3
whole and grepped every count word in the document rather than only the changed cells, per
DEC-ERR-03. I also read `PLAN` and `PROPERTIES` at HEAD, because the routed items are statements
*about* those documents and "landed" cannot be judged from the TSPEC alone.

**Upstream is byte-unmoved.** I hashed both files at HEAD: `REQ-pdlc-decision-ledger.md` is
`sha256:ce6b133f0c1d…0d3c7b7c` and `FSPEC-pdlc-decision-ledger.md` is `sha256:2bd5c3ef055f…735aed39`
— digit-for-digit the dispatch pins and the document's own v1.1 recital. Nothing this TSPEC cites
upstream has moved, so DEC-ERR-03 yields no finding on that axis: the compression is still faithful
because the compressed text is unchanged. The four corpus literals (6,305 / 10,859 / 12,059 / 441)
are untouched, no AT row moved, no traceability row moved.

**Scope of the edit.** 54 insertions, 3 deletions, across exactly two regions — the revision-history
changelog and §7.3 — as the commit sequence claims. No product decision was re-opened, no acceptance
criterion narrowed, nothing added that the REQ does not ask for.

**Bottom line up front.** The routed items are landed on the side this document controls, and landed
well. The defect they name, however, lives in `PLAN`, which this TSPEC cannot edit — and `PLAN` at
HEAD is still stale in all six places. That is F-01, tagged `inherited` so it routes back to PLAN's
own phase rather than halting this one.

## Architecture

**How the delta resolves the two routed items.** Both items report the same collision from two
directions: `PLAN` v0.7 declares `DECISION_LEDGER_CENSUS_TOKENS` production code, declared in
`orchestrate-dev.js` by T-18, a member of both `DECISION_LEDGER_OWNED_DECLS` and
`DECISION_LEDGER_CENSUS_EXEMPT`, with the partition six ∪ **nine** = **fifteen**; TSPEC v1.0 makes
all three census constants declarations of the census *test file* with a **fourteen**-member owned
list. `PLAN`'s T-11 row goes further and names the adopted TSPEC form the "**rejected**" resolution
(`PLAN`:19). Two approved documents therefore asserted mutually exclusive designs, and the one
implementation reads was the wrong one.

The author's resolution is the structurally right one for a document at this position in the graph.
Rather than restating the arithmetic at every site that touches it — which is what produced the
divergence in the first place — §7.3 gains one paragraph, *The size of the owned list, stated once*
(:1375–1382), which does three distinct jobs:

1. **States the count once, with its decomposition.** `DECISION_LEDGER_OWNED_DECLS` has fourteen
   members — §4.1–§4.4's six functions plus the eight top-level constants the *Scanned source* row
   enumerates — so the partition is six ∪ eight = fourteen.
2. **Declares the single-siting rule.** Any other section, and any downstream document, cites the
   count rather than restating it, with the stated reason: a count restated at several sites is a
   one-row edit that goes stale at all but one of them. The `pdlc-wave-resume` lesson is named as
   the precedent.
3. **States the correction direction explicitly.** A downstream document carrying a fifteen-member
   owned list, or assigning any of the three census constants a home in `orchestrate-dev.js`, is
   **stale against this section and not a competing design**; the correction runs downstream-to-here,
   never the reverse.

Item 3 is the load-bearing one and I want to be clear about why I credit it. A TSPEC cannot re-pin a
PLAN — that is PLAN's phase's work. What a TSPEC *can* do, and what this one now does, is remove the
ambiguity that let a downstream editor read the conflict as a live design choice. Before this edit,
a reader of `PLAN`:19 saw a reasoned argument that TSPEC's form was rejected; after it, that
argument is explicitly out of contract with its own upstream. The erratum has converted a
two-sided disagreement into a one-sided staleness, which is exactly the shape a downstream re-pin
round can close mechanically.

**Two prior findings of mine also closed, correctly and in scope.** My v11 F-04 (the cloned
`DECL_RE` matches `function` declarations only, while eight of the fourteen owned members are
top-level `const`s) is landed in the *Scanned source* row: the clone's regex must cover `const`/`let`
bindings and `export`-prefixed forms, and the row states the consequence — the non-empty-slice
conjunct is what catches a regex that missed a declaration form. My v11 F-02 (PROPERTIES still
encoding the retired PROP-INV-06/07 shapes) is closed in `PROPERTIES` at HEAD, which now carries the
fourteen-member owned list at PROP-INV-07 and PROP-INV-11 and flags the `PLAN` divergence itself.
Two of three downstream documents are now converged on fourteen; `PLAN` alone dissents.

## Interfaces

**The correction-direction contract, measured against `PLAN` at HEAD.** The routed items assert six
and five stale sites respectively. I checked each against `PLAN-pdlc-decision-ledger.md` at HEAD and
every one is still present:

| Site | What `PLAN` still says | TSPEC v1.1 §7.3 |
|---|---|---|
| `PLAN`:19 (revision history) | "The design's intent is **production**"; "**No count moved**: six ∪ nine = fifteen stands"; TSPEC's form is the "**rejected**" resolution | test-file home, six ∪ eight = fourteen, and the fifteen-member form is *stale, not competing* |
| `PLAN`:152 (T-11) | `CENSUS_TOKENS` "declared in `orchestrate-dev.js` as a production top-level constant, written by T-18"; `CENSUS_EXEMPT` "the **nine** plumbing declarations"; `OWNED_DECLS` "the **fifteen** top-level declarations" | test-file constant, never a member of the owned list; exempt is eight; owned is fourteen |
| `PLAN`:158 (T-18) | "**Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to `pdlc/workflows/orchestrate-dev.js`** … it is production code, not a test operand" | it is a test operand, and the census never scans the file it is declared in |
| `PLAN`:207 (manifest, census test file) | "the third census operand … is **not** a test-file constant — it is production" | all three are declarations of the census test file |
| `PLAN`:219 (manifest, `orchestrate-dev.js`) | claims "**and the `DECISION_LEDGER_CENSUS_TOKENS` declaration** — the one member of `DECISION_LEDGER_OWNED_DECLS` no earlier batch writes" | not a member at all |
| `PLAN`:490–495 (§Definition of Done) | six ∪ **nine** = **fifteen**, "All fifteen owned…", "`CENSUS_TOKENS` is **production**" | six ∪ eight = fourteen |

So the routed items are **factually accurate and still unresolved in the document they describe**.
They are, however, *landed against this TSPEC*: the erratum was routed here, and what was asked of
this document — re-pin to the v1.0 test-file home and the fourteen partition, and say so
authoritatively — is done. I record the residue as F-01 rather than treating the round as unlanded,
because the unlanded work is not this document's to do. Tagging it `inherited` is the honest call
and is what keeps it routing to PLAN's phase instead of halting Phase P.

**Why this matters in product terms, not just document-hygiene terms.** §7.3 is the oracle for
BR-11 / REQ-DECLEDGER-08 / NG-4 — a P0 traceability obligation. `PLAN` is what the implementing
agents read; TSPEC is not. If batches 3–8 run against `PLAN` v0.7, T-18 writes a production
`DECISION_LEDGER_CENSUS_TOKENS` and T-11 freezes a fifteen-member owned list, and §7.3's
resolves-to-exactly-one and partition conjuncts red on conforming code — the exact defect round 10's
erratum removed, rebuilt from the instructions. The requirement would not be *served* by the code
that gets written. That is the severity driver for F-01, and it is why I have escalated it from the
Medium I gave it at v11: at v11 it was a foreseeable downstream re-pin; a full round later, with
`PROPERTIES` re-pinned and `PLAN` not, it is an observed cascade miss with a P0 oracle downstream of
it.

## Data Model

**I re-derived the partition rather than taking the paragraph's word for it.** Reading the two
operand rows at HEAD and counting members by hand:

- **Forbidden (`DECISION_LEDGER_CENSUS_TOKENS`) — six:** `selectDecisions`,
  `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus` (four functions),
  `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES` (two of §5.2's catalogues).
- **Exempt (`DECISION_LEDGER_CENSUS_EXEMPT`) — eight:** `parseDecisionLedgerConfig`,
  `buildDecisionLedgerInjector` (two functions), `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`,
  `DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`,
  `DECISION_LEDGER_NOTICES` (six constants, the last being §5.2's third catalogue).
- **Union — fourteen, disjoint.** No name appears in both lists; I checked pairwise.
- **Owned (`DECISION_LEDGER_OWNED_DECLS`) — fourteen:** six functions (§4.1–§4.4, with the
  renderer's §4.3 home now called out so TE F-02's mis-citation cannot reappear) plus eight top-level
  constants (`DECISION_CORPUS_ARGV` §3.1, `DECISION_HEADING_RE` §3.2, `DECISION_LEDGER_DEFAULTS`
  §4.1, `DECISION_LEDGER_PREAMBLE` and `DECISION_LEDGER_RULE_TEXT` §4.3, §5.2's three catalogues).

Set equality holds, disjointness holds, and each of the fourteen resolves to a module-surface
declaration site I can point at. The three census constants are correctly outside all of this, per
the *Where the three census constants live* paragraph v1.0 added. The arithmetic is sound.

**Where the edit under-delivers on its own promise (F-02).** The paragraph says the arithmetic "is
stated here and nowhere else in this document: any other section … cites it rather than restating
it". Grepping every count word in the file, that is not true as written:

- `:1388` (*Scanned source*, the row immediately below) states "**eight of this feature's fourteen
  owned declarations are top-level `const`s**" — a bare restatement of both operand sizes, not a
  citation.
- `:1387` (*Forbidden token set*) refers to "the fourteen the paragraph above counts" — closer to a
  citation, but it still carries the numeral.
- `:31` and `:53` in the revision history restate "eight … fourteen owned declarations" and
  "six ∪ eight = fourteen".

The paragraph half-concedes this in its last sentence ("this paragraph **and the row below** are the
pin"), which is a two-site pin, not a one-site pin — and the changelog sites are not covered by that
concession at all. This is not an arithmetic error and nothing is currently inconsistent; the count
reads fourteen everywhere. It is a defect in the *anti-staleness mechanism* the erratum sells: the
next edit to the partition must touch four sites, and the paragraph tells its editor there is one.
Given that this whole erratum exists because a count went stale across documents, the mechanism
being weaker than advertised is worth a Medium. The fix is one sentence — either rephrase the pin as
"§7.3 is the sole authority for this count, and the operand rows below are its enumeration" and
strike "nowhere else", or replace `:1388`'s numerals with a back-reference.

## Test Strategy

Product lens only here — I am not reviewing the test design, only whether the requirement it serves
is still provable as the REQ asks.

- **BR-11 / REQ-DECLEDGER-08 / NG-4 remain served.** §7.3 is still the oracle, the traceability rows
  at :1644 and :1666 still point at it, and the edit makes the oracle *more* provable, not less: with
  the census constants outside the owned list and the clone's `DECL_RE` widened to `const`/`let`, the
  resolves-to-exactly-one and non-empty-slice conjuncts are satisfiable on conforming code. Round
  10's repair is now stated in a way a downstream editor cannot silently reverse.
- **No acceptance criterion moved.** I diffed the changed regions against the AT and traceability
  tables: no AT row, no BR/E/AC mapping, and no corpus literal is touched. The REQ and FSPEC are
  byte-identical to the dispatch pins, so nothing this TSPEC compresses has drifted.
- **The proof path that concerns me is the one that runs through `PLAN`.** The census is a `[red]`
  task (T-11) un-skipped by a `[green]` task (T-18). Both rows currently encode the retired design.
  A P0 oracle whose implementing instructions contradict its specification is not a testable
  obligation at implementation time — it is a guaranteed wave halt at best, and a silently wrong
  frozen list at worst. This is the substance of F-01; I am flagging the missing *instruction*, not
  a missing test.
- **`PROPERTIES` is now the positive control that the cascade can work.** PROP-INV-07 and
  PROP-INV-11 at HEAD both read fourteen, and PROPERTIES' own revision history records the `PLAN`
  divergence explicitly. That the same cascade reached PROPERTIES and not PLAN is what makes me
  treat F-01 as an observed miss rather than a pending one.
- **v11 F-03 (§4.3's "four constants", :864) is still open** and this round was right not to open
  §4.3 — the round was frozen to the routed items. Recording it again so it survives the version
  bump: §4.3 pins "the four constants together must render to ≤ 1,200 bytes" but names two. If the
  header and trailer ship as top-level constants they are feature-introduced declarations absent
  from the fourteen-member owned list, and §7.3's classify-or-redden guard fires on conforming code —
  which would move the count this erratum just pinned. One sentence in §4.3 resolves it.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Is the `PLAN` re-pin (F-01) scheduled? At v11 I raised the same divergence as Medium and asked this; one round later `PROPERTIES` has converged on fourteen and `PLAN` has not, which reads as the cascade reaching PROPERTIES only. Given `PLAN`:19 argues *affirmatively* for the retired design and calls TSPEC's form "rejected", a PLAN revision round looks required — a pin refresh alone will not remove that paragraph. |
| Q-02 | Does §4.3's header/trailer ship as top-level constants or inline literals (v11 F-03)? The answer changes the fourteen this erratum just single-sited, so it is worth resolving before `PLAN` is re-pinned rather than after — otherwise the re-pin lands a number that moves again. |

## Positive Observations

- **The author solved the general problem instead of the reported one.** The routed items ask for a
  re-pin; the edit asks *why the pin drifted* and installs a single-siting rule with a named
  precedent. That is the difference between closing a finding and closing a failure mode.
- **Stating the correction direction is the sharpest thing in this edit.** "Stale against this
  section and not a competing design … downstream-to-here, never the reverse" is precisely the
  sentence that was missing, because `PLAN`:19's argument is articulate enough to be mistaken for a
  considered override. Naming the direction removes the ambiguity without overreaching into a
  document this one does not own.
- **Scope discipline under a frozen decision set was complete.** Two regions touched, 54/3 lines, no
  corpus literal moved, no upstream pin advanced, no AT or traceability row disturbed, and my two
  open non-routed findings left alone rather than opportunistically edited. I verified each of those
  claims and every one held.
- **The changelog is honest about what it could not fix.** It states plainly that the downstream
  document still carries the fifteen-member list, rather than implying the erratum resolved it. A
  changelog that had claimed closure would have cost me a round to disprove.
- **v11 F-04 landed with its consequence stated.** The `DECL_RE` widening is paired with *why* the
  non-empty-slice conjunct is the backstop, so a future editor who narrows the regex learns what
  breaks. Same discipline as round 10's "a test-file constant can never be a member" sentence.

## Recommendation

**Needs revision**

To be precise about what that verdict is and is not saying: **this TSPEC's own bytes are correct.**
The routed items are landed on the side this document controls, the arithmetic closes, upstream is
unmoved and faithfully compressed, and the edit is better than the repair it was asked for. Nothing
in the delta is wrong.

The verdict is driven by F-01, which is tagged `inherited` / `nonlocal` precisely so it does **not**
halt this phase: `PLAN` v0.7 still contradicts this pin in all six places, argues affirmatively for
the retired design, and is the document implementation reads for a P0 oracle. The route is back to
PLAN's phase, not a further edit here.

What must change, in order:

1. **`PLAN` re-pin (F-01, owned by PLAN's phase).** All six sites — `:19`, `:152`, `:158`, `:207`,
   `:219`, `:490–495` — to TSPEC v1.1 §7.3's test-file home and six ∪ eight = fourteen. `:19`'s
   "rejected resolution" paragraph must be withdrawn, not merely re-numbered, and T-18 must lose its
   instruction to declare `DECISION_LEDGER_CENSUS_TOKENS` in `orchestrate-dev.js`. This must land
   before batches 3–8 run.
2. **§7.3 single-siting claim (F-02, one sentence, this document).** Reconcile "stated here and
   nowhere else" with `:1388`, `:1387`, `:31` and `:53` — either soften the claim to name §7.3 as the
   authority and the operand rows as its enumeration, or strike the numerals below it.
3. **§4.3 "four constants" (F-03, one sentence, this document).** Say whether the header and trailer
   are top-level constants or inline literals; the answer feeds the count in item 1.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | inherited | nonlocal | `PLAN` v0.7 still contradicts this TSPEC's census pin in all six routed places at HEAD — `:19` (revision history, which calls TSPEC's adopted form the "rejected" resolution and asserts "six ∪ nine = fifteen stands"), `:152` (T-11: production home, nine exempt, fifteen owned), `:158` (T-18: "Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to `pdlc/workflows/orchestrate-dev.js` … it is production code"), `:207` and `:219` (both file-ownership manifest rows) and `:490–495` (§Definition of Done). TSPEC v1.1 §7.3 makes all three census constants declarations of the census test file with a fourteen-member owned list and states the correction direction as downstream-to-here. `PLAN` is what implementing agents read; §7.3 is the oracle for BR-11 / REQ-DECLEDGER-08 / NG-4 (P0). Left as-is, batches 3–8 rebuild the exact defect round 10's erratum removed, from the instructions. Pre-round bytes, untouched by this edit, and not this document's to fix — hence `inherited`, routing to PLAN's phase rather than halting Phase P. Raised from Medium at v11 because `PROPERTIES` has since converged on fourteen and `PLAN` has not: this is now an observed cascade miss, not a foreseeable one. | `PLAN`:19, :152, :158, :207, :219, :490–495 vs TSPEC §7.3 |
| F-02 | Medium | delta | local | The new *The size of the owned list, stated once* paragraph claims the arithmetic "is stated here and nowhere else in this document: any other section … cites it rather than restating it". Four other sites in the file carry the numerals: `:1388` ("eight of this feature's fourteen owned declarations are top-level `const`s"), `:1387` ("the fourteen the paragraph above counts"), and `:31` / `:53` in the revision history. The paragraph's own closing sentence concedes a two-site pin ("this paragraph and the row below"), which contradicts "nowhere else" and does not cover the changelog. No count is currently inconsistent — everything reads fourteen — but the anti-staleness mechanism this erratum is built on is weaker than it states, and this erratum exists because a count went stale. One sentence fixes it: name §7.3 the sole authority and the operand rows its enumeration, or replace `:1388`'s numerals with a back-reference. | §7.3, :1375–1382 vs :1387–1388, :31, :53 |
| F-03 | Medium | inherited | nonlocal | §4.3 pins "the **four** constants together must render to ≤ 1,200 bytes" but names only two — `DECISION_LEDGER_PREAMBLE` and `DECISION_LEDGER_RULE_TEXT`; the header and trailer appear only as literals inside the rendered-form block. If they ship as top-level constants they are feature-introduced declarations absent from the now-fourteen-member `DECISION_LEDGER_OWNED_DECLS`, and §7.3's classify-or-redden guard fires on conforming code — moving the very count this erratum just single-sited. Open since v11 (F-03); this round was correctly frozen to the routed items and did not touch §4.3. Resolve before `PLAN` is re-pinned, so the re-pin does not land a number that moves again. | §4.3 framing constants, :864 |

FINDING: High | inherited | nonlocal | PLAN:19, :152, :158, :207, :219, :490-495 vs TSPEC §7.3 | PLAN v0.7 still declares DECISION_LEDGER_CENSUS_TOKENS production in orchestrate-dev.js (T-18), a member of DECISION_LEDGER_OWNED_DECLS, and pins six ∪ nine = fifteen, calling TSPEC's adopted test-file/fourteen form the "rejected" resolution — contradicting TSPEC v1.1 §7.3 in all six routed places at HEAD; PLAN drives implementation of the P0 census oracle for BR-11/REQ-DECLEDGER-08/NG-4, so batches 3-8 would rebuild the defect round 10 removed. Pre-round bytes, not this document's to fix — routes to PLAN's phase.
FINDING: Medium | delta | local | §7.3 "The size of the owned list, stated once", :1375-1382 | The paragraph claims the six ∪ eight = fourteen arithmetic is "stated here and nowhere else in this document", but :1388, :1387, :31 and :53 all restate the numerals, and its own closing sentence concedes a two-site pin; the single-siting mechanism the erratum relies on is weaker than advertised.
FINDING: Medium | inherited | nonlocal | §4.3 framing constants, :864 | §4.3 pins "the four constants together must render to ≤ 1,200 bytes" while naming only two; if the header and trailer ship as top-level constants they are unclassified feature-introduced declarations that red §7.3's classify-or-redden guard and move the fourteen this erratum just pinned.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}

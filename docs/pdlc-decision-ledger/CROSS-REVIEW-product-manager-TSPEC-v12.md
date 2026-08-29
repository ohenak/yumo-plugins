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

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_

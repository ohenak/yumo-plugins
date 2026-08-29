# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-29
**Iteration:** 6 (delta re-review of v0.6 against v0.5)

## Overview

**Confirmation question:** did v0.6 land the item v5 routed, and did it break anything already approved?

**Answer: both routed items landed, and the re-grounding is faithful to TSPEC v0.9 — but the new
partition material carries one member the design never declares, which reddens T-11 by construction
again.** The root is upstream in TSPEC §7.3, not in the PLAN's transcription; it is routed as an
erratum, and the PLAN-side residue (an owned declaration no task creates) is filed as F-01.

The v5 round reviewed `a408375a6`. Five commits landed on the PLAN since:

| Commit | Subject |
|---|---|
| `8434787a1` | re-pin TSPEC to v0.9 and record the re-grounding pass |
| `f4b582678` | re-ground T-11's census operands on TSPEC v0.9 §7.3 |
| `b7c968be0` | correct the Definition of Done census bullet to TSPEC v0.9's partition |
| `a2bad6db6` | give the two new frozen census lists an owning task in the file-ownership manifest |
| `c937f1a7b` | align T-11's token-set gloss with TSPEC v0.9's declaration-based partition |

The whole diff is 34 insertions / 11 deletions across four sites: the header upstream pin, the
revision-history paragraph, the `T-11` row, the file-ownership manifest row for
`decisionLedgerCensus.test.js`, and the §Definition of Done census bullet. Both v5 findings are
closed on their own terms — the version bump is honest, the digest is re-derived correctly, and the
scanned-source and companion operands now say what TSPEC v0.9 §7.3 says.

What the round did not catch is that TSPEC v0.9's own owned-declaration list contains
`DECISION_LEDGER_CENSUS_TOKENS`, a constant that no TSPEC module-surface section (§3, §4, §5)
declares and that no PLAN green task writes into `orchestrate-dev.js`. Two of T-11's conjuncts —
"each member of `DECISION_LEDGER_OWNED_DECLS` resolves to exactly one top-level declaration at HEAD"
and "each slice asserted non-empty before counting" — both red on that member for a conforming
implementation. This is the same defect class round 9 repaired for `gatherDecisionCorpus` and §5.2's
catalogues, surviving in one place the repair did not reach.

## Batches

### The routed item landed (v5 F-01)

v5 asked for four things. All four are present, and the write-up is consistent across every site:

| Asked | HEAD | Verdict |
|---|---|---|
| Re-ground the scanned source on `DECISION_LEDGER_OWNED_DECLS`, sliced over *all* top-level declarations | `T-11` (PLAN:150): source minus "(a) the body of **every** member of `DECISION_LEDGER_OWNED_DECLS` — not a hand-picked three" and "(b) the `main()` wiring run bounded by the literal … sentinels"; slices "from a declaration's own line to the **next top-level declaration of any name**, boundaries from *all* of the module's top-level declarations … `bodyOf` over `allTopLevelDecls`" | ✅ matches TSPEC:1297 clause for clause |
| Replace exports set-equality with the disjoint partition | `T-11`: "`DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`, the two sub-sets disjoint"; the exports form named as **rejected**, "§7.3 names it red by construction" | ✅ matches TSPEC:1296 |
| Name whichever task declares the two new frozen lists | File-ownership manifest (PLAN:202): `decisionLedgerCensus.test.js` "(also the sole home of the two frozen test-file lists `DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS`, TSPEC §7.3)" → T-11, batch 2 | ✅ owner in the manifest, not only in prose |
| Keep the non-empty-slice conjunct and add v0.9's red-on-rename conjunct | `T-11`: "**Each slice asserted non-empty before counting**" retained; "each member of `DECISION_LEDGER_OWNED_DECLS` resolves to exactly one top-level declaration at HEAD" added | ✅ both present |

The six token members are unchanged from v0.8 to v0.9 and the PLAN still lists exactly those six; the
`decisionLedger`-is-not-a-token rationale survives and now carries the extra v0.9 clause that the
field "is a `report` field rather than a declaration", so it is absent from `OWNED_DECLS` too and the
partition is unaffected in both directions — which is exactly right, and is the conjunct that keeps
the new set-equality from quietly acquiring a sixteenth member.

Two additions I did not ask for and rate as genuine improvements: the token gloss now reads
"top-level declaration names … that carry or produce decision-record **data**" rather than "exported
names" (removing the last trace of the repudiated exports framing), and the row pins that the owned
list is "enumerated, never derived from a `/Decision/i` name pattern", citing five shipped
declarations (`MERGE_MAX_DECISION_STEPS`, `renderDecisionEntry`, `escalationDecision`,
`erratumGateDecision`, `parseDecisionsWarranted`) such a rule would wrongly exclude. I verified those
five exist in `pdlc/workflows/orchestrate-dev.js` at HEAD — they do.

### The partition arithmetic, re-derived

The PLAN asserts 6 ∪ 9 = 15. Re-deriving from TSPEC:1297's definition of `OWNED_DECLS`:

| Group | Members | Count |
|---|---|---|
| §4.1/§4.2/§4.4's six functions | `parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus` | 6 |
| Top-level constants | `DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT` | 5 |
| §5.2's three catalogues (TSPEC:909) | `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES` | 3 |
| Plus | `DECISION_LEDGER_CENSUS_TOKENS` itself | 1 |
| **Total** | | **15** |

The counts are internally consistent: tokens take 4 functions + 2 catalogues = 6; exempt takes 2
functions + 5 constants + 1 catalogue + `CENSUS_TOKENS` = 9; union 15, intersection empty. The PLAN's
nine-member exempt enumeration matches TSPEC:1296 name for name, and each carries its reason as §7.3
requires. **The set-equality is a real completeness check, not containment** — a symbol added later
must be classified or the test reddens. That is the property v5 asked for and it is correctly stated.

### Where it breaks: the fifteenth member (F-01)

Of the fifteen, fourteen have an owning green task that declares them in `orchestrate-dev.js`: T-13
(`DECISION_LEDGER_DEFAULTS`, `parseDecisionLedgerConfig`, `DECISION_LEDGER_NOTICES`), T-14
(`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `recogniseDecisionRecords`), T-15
(`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, `renderDecisionLedgerBlock`), T-16
(`selectDecisions`), T-17 (`gatherDecisionCorpus`, `DECISION_LEDGER_CORPUS_OUTCOMES`,
`buildDecisionLedgerInjector`) and T-18's wiring run. `DECISION_LEDGER_OMIT_REASONS` sits with the
selection layer. **`DECISION_LEDGER_CENSUS_TOKENS` has no such task.**

It has none because it is not production code. It is the census test's own operand, cloned from the
precedent's `ANCHOR_TOKENS`, which is declared at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:114`
and appears nowhere under `pdlc/workflows/*.js`. TSPEC confirms this by omission: `CENSUS_TOKENS`
occurs seven times in the document, all of them in §7.3 or the changelog, and never in §3, §4 or §5
where the module's declared surface is specified. The PLAN's own manifest edit says the same thing
from the other side — it names `CENSUS_EXEMPT` and `OWNED_DECLS` as test-file constants "as the
precedent's `ANCHOR_TOKENS` is", which is precisely what `CENSUS_TOKENS` is too.

So T-11 as written cannot go green on a conforming implementation, by two independent conjuncts:

1. **Red-on-rename conjunct.** "Each member of `DECISION_LEDGER_OWNED_DECLS` resolves to exactly one
   top-level declaration at HEAD." `CENSUS_TOKENS` resolves to *zero* declarations in
   `orchestrate-dev.js`. Red.
2. **Non-empty-slice conjunct.** "Each slice asserted non-empty before counting." The slice for
   `CENSUS_TOKENS` is empty, there being no declaration to slice from. Red.

TSPEC:1297's stated reason for including it — "the token strings live inside its own declaration, so
the census would otherwise red on its own literal" — is void under the test-file reading: the census
scans `orchestrate-dev.js`, the test file is not scanned, and no self-reddening is possible. The
reason only holds if `CENSUS_TOKENS` were a production declaration, which nothing in the design makes
it. This is a genuine upstream error, and the PLAN transcribed it faithfully.

I am not asking the PLAN to unilaterally drop the member — that would put the PLAN out of contract
with its freshly-pinned upstream, which is the failure mode this round just repaired. The root is
routed as `ERRATUM: TSPEC`. What the PLAN owes on its own account is F-01: no task creates a
declaration its central red test requires to exist, and the manifest that carefully assigns the other
two lists is silent on this one. Once TSPEC settles the member's home, three PLAN sites move
together — the `T-11` row, the manifest parenthetical (which becomes "three frozen test-file lists"),
and the §Definition of Done bullet's **fifteen**/**nine** literals.

## Dependencies

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

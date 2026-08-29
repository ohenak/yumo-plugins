# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1, bytes unchanged)
**Date:** 2026-08-29
**Iteration:** 3 (upstream-cascade confirmation — TSPEC moved, PROPERTIES did not)

## Overview

**Question answered:** does PROPERTIES v1.1, approved unchanged at round 2, still hold as a faithful
compression of TSPEC as TSPEC now stands? **No.** Three of its properties transcribe operand wording
that TSPEC has since retired *as unsatisfiable*, and one TSPEC assertion newly designated as a
field's sole proof has no property at all.

**Scope of the cascade, measured rather than assumed.** My round-2 approval recorded
`UPSTREAM-STATE: TSPEC sha256:28d25518…`. That blob is TSPEC at `1a2d78cba~1` (v0.8). TSPEC at HEAD
is `sha256:b1b603a8…` (v1.0). Four content commits sit between them, not one:

| Commit | TSPEC version | Sections touched |
|---|---|---|
| `1a2d78cba` | 0.9 (in progress) | §7, §7.2 — re-measured subject file; re-homed the flag-off `report` referent |
| `4b28af44a` | 0.9 (in progress) | §7.3 — census made satisfiable over its whole token set (TE F-01, F-02, both High) |
| `588f4323e` | 0.9 (in progress) | §5.4 — report field pointed at its sole proof (PM Q-01) |
| `452d72c07` | 1.0 (erratum) | §7.3 — the three census constants given a stated home as test-file declarations, removed from the owned-declaration list |

So this confirmation is **not** scoped to the v1.0 erratum alone. The erratum's own three edits are
narrow and, taken by themselves, leave PROPERTIES untouched — no property names
`DECISION_LEDGER_CENSUS_EXEMPT` or `DECISION_LEDGER_OWNED_DECLS`, so nothing in PROPERTIES asserts
the membership the erratum corrected. The damage is in v0.9, which landed between my approval and
this dispatch and which PROPERTIES has never been measured against. Per DEC-ERR-03 I review this
document against upstream **at HEAD**, so those items are findings of this round.

**Why the divergence is High rather than a re-pin chore.** TSPEC v0.9's changelog states that the
operand pair PROPERTIES still transcribes "could not go green on a conforming implementation" —
`gatherDecisionCorpus`, §5.2's three catalogues and every intra-feature mention inside a sibling
declaration all sat in the scanned remainder, so four of the six tokens would have occurred there on
correct code. PROP-INV-06 and PROP-INV-07 are the pre-repair wording verbatim. An implementer
working from PROPERTIES alone — which is the document's job — would build a census that cannot pass,
and the ✖ marks on those rows say a red-first test is owed for exactly that shape. This is the
falsifiability failure mode PROPERTIES exists to prevent, inherited from a stale pin.

Nothing here re-opens a settled decision. Every fix below is a re-transcription of TSPEC's current
operand text into rows that already exist, plus two rows for assertions TSPEC newly makes
load-bearing. No product scope moves: `REQ` BR-11 / NG-4 and `REQ` C-2 are unchanged, and PROPERTIES
still adds no behaviour the REQ does not ask for.

## Properties

I re-read every property that leans on a changed TSPEC section (§7.3, §7.2 conjunct 3, §5.4, §7) at
its current version. Ten rows touch that surface; six still hold, four do not.

| Property | Holds at TSPEC v1.0? | Evidence |
|---|---|---|
| PROP-INV-06 | **No** | Transcribes the retired exclusion set |
| PROP-INV-07 | **No** | Transcribes the retired companion check |
| PROP-INV-08 | Yes, but under-covers | §7.3's honesty rule gained a second conjunct |
| PROP-INV-09 | Partly | Rationale survives; the two named homes do not |
| PROP-INV-10 | Yes | `REQ` NG-5 pins unmoved |
| PROP-INV-01…05 | Yes | §7.7 / §5.5 untouched by the delta |
| PROP-WIRE-04, -05 | Yes | §7.2 conjuncts 1 and 2 unchanged |
| PROP-WIRE-11 | Yes | §5.4's conditional-spread discipline unchanged, and now explicitly re-stated there |
| PROP-OFF-05 | **No** | Names a referent §7.2 now expressly rejects |
| PROP-DISC-07 | Yes | Unrelated to the delta (repo-hygiene census, not the source census) |

**PROP-INV-06 — the exclusion set is the pre-repair one (F-01).** The row scopes the census to
"anywhere in `orchestrate-dev.js` **outside** the four regions this feature owns: the three function
bodies sliced by brace-matching from their declarations, and the `main()` wiring run". TSPEC §7.3 now
subtracts "the body of **every** declaration this feature introduces — the frozen list
`DECISION_LEDGER_OWNED_DECLS`, i.e. §4.1/§4.2/§4.4's six functions plus every top-level constant it
declares: §3.1's `DECISION_CORPUS_ARGV`, §3.2's `DECISION_HEADING_RE`, §4.1's
`DECISION_LEDGER_DEFAULTS`, §4.3's `DECISION_LEDGER_PREAMBLE` and `DECISION_LEDGER_RULE_TEXT`, and
§5.2's three catalogues". Two divergences, not one:

1. **Membership.** Three bodies versus roughly fourteen. TSPEC states in terms what the three-body
   form costs: `gatherDecisionCorpus` and the three catalogues are top-level declarations that carry
   the token strings, so they land in the remainder and the "zero occurrences" assertion reds on
   conforming code.
2. **Slicing method.** PROP-INV-06 says "brace-matching from their declarations"; TSPEC now says
   "from a declaration's own line to the **next top-level declaration of any name**, boundaries taken
   from *all* of the module's top-level declarations", i.e.
   `loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls`. Brace-matching is not a
   detail here — three of the newly-owned members (`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`,
   the preamble strings) are constants with no brace body, so the method PROPERTIES names cannot
   slice the members TSPEC now requires be sliced.

**PROP-INV-07 — the companion check is the one TSPEC calls red by construction (F-02).** The row
requires `DECISION_LEDGER_CENSUS_TOKENS` be "**set-equal** to the module's exported decision-ledger
symbol names". TSPEC §7.3's *How it is kept honest* column now opens by rejecting precisely that:
"Not set equality against *all* of the module's decision-ledger exports — that comparison is red by
construction, since §3.1/§4.1/§4.2/§4.4/§5.2 declare roughly a dozen and only these six are
data-carrying." The replacement is a stated **partition**: `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` =
`OWNED_DECLS`, the two sub-sets **disjoint**. No property states the partition, the disjointness, or
the erratum's own correction — that the three census constants are declarations of the census test
file and therefore members of neither sub-set. The document that is supposed to make the census's
non-vacuity falsifiable currently states its non-vacuity guard in a form TSPEC has retired.

**PROP-INV-08 — true but now under-covers (F-04).** "Every census slice must be asserted non-empty"
is still TSPEC's text. But §7.3's honesty column now carries a second, separable conjunct the delta
introduced: "`DECISION_LEDGER_OWNED_DECLS` is frozen and each member must resolve to **exactly one**
top-level declaration at HEAD, so a rename or a deletion reddens rather than silently shrinking the
exclusion." Non-emptiness does not catch a member resolving to *two* declarations, and a member
resolving to *zero* is what the erratum round was convened over. That conjunct is exactly the one
the v1.0 erratum found violated in the spec itself; leaving it unmapped means no test would have
caught what a review round did.

**PROP-INV-09 — rationale survives, both pointers are stale (F-05).** Its quoted reason (the
`learningsInjectionField` analogue is named at call sites far outside the wiring sentinels, so a
`decisionLedger` token would red on conforming code) is still verbatim TSPEC. Its closing clause —
"What the field is owed instead is behavioural — PROP-OFF-05 and PROP-WIRE-11" — is not. TSPEC now
names "exactly two named homes", both inside §7.2's live composition-root arm, and adds that "§7.6's
AT rows are **not** a home for it". PROP-OFF-05 is the FX-BASELINE guard (owner T-02), not that arm.

**The supporting rationale paragraph is now the retired argument (F-06).** The prose under the INV
table opens "PROP-INV-06's two operands are both frozen and both set-equality-checked, which is the
whole reason the census is implementable", then recounts an *earlier* failure (the ubiquitous `id`
token, the non-existent sentinel regions). Both halves are pre-v0.9. Implementability now rests on
slicing every owned declaration and on the satisfiability predicate §7.3 states in terms — *a token
is unsatisfiable exactly when a conforming implementation mentions it in the scanned remainder* —
and the second operand is no longer "set-equality-checked" against exports at all. A reader auditing
BR-11 through this paragraph is told the census is safe for a reason TSPEC has withdrawn.

## Oracles

_TBD_

## Fixtures

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_

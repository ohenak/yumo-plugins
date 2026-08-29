# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1, bytes unchanged)
**Date:** 2026-08-29
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)

## Overview

**Question answered.** Does `PROPERTIES-pdlc-decision-ledger.md` (v1.1, own bytes unchanged since my
v2 approval) still hold against the TSPEC as it now stands? **No, in one family.** The INV family's
two census contract properties — **PROP-INV-06** and **PROP-INV-07** — describe a census design
`TSPEC` §7.3 no longer specifies, and in PROP-INV-07's case describe the exact assertion §7.3 names
**red by construction** and rejects. Both are High. Both are tagged `inherited`, for the reason set
out below, so this confirmation routes back to the owning phase rather than halting.

**How far upstream actually moved.** My v2 approval anchor pins `UPSTREAM-STATE: TSPEC
sha256:28d25518…cb32cb49`, which is commit `cc2c09e53`, **TSPEC v0.8**. TSPEC at HEAD is
`sha256:b1b603a8…18d31a0` — **v1.0**. Five commits separate them, and two of them rewrote §7.3's
census specification:

| Commit | TSPEC | What it did to §7.3 |
|---|---|---|
| `cc2c09e53` | v0.8 | **my approval pin** |
| `1a2d78cba` | — | §7/§7.2 re-measure, re-home the flag-off referent |
| `4b28af44a` | — | **census made satisfiable over its whole token set** — the substantive §7.3 rewrite |
| `588f4323e` | — | §5.4 points-field proof (PM Q-01) |
| `5189b73fb` | v0.9 | changelog for round 9 |
| `452d72c07` | v1.0 | **the erratum edit named in this dispatch** — the three census constants given a test-file home, `DECISION_LEDGER_CENSUS_TOKENS` dropped from `DECISION_LEDGER_CENSUS_EXEMPT` and from `DECISION_LEDGER_OWNED_DECLS` |

So the item list in this dispatch is, as `DEC-ERR-03` anticipates, **necessary but not sufficient**.
The v1.0 erratum on its own is a narrow, internally coherent edit. The divergence I am reporting
entered at **v0.9** (`4b28af44a`) — after my approval was taken and before this round — and the v1.0
edit lands inside the very §7.3 cells that carry it. I re-read §7.3 at HEAD in full rather than
diffing only the routed items, which is why both findings are here.

**What §7.3 specifies at HEAD.** The scanned source is the whole of `orchestrate-dev.js` minus (a)
the body of **every** member of the frozen `DECISION_LEDGER_OWNED_DECLS` — §4.1/§4.2/§4.4's six
functions plus eight top-level constants — and (b) the sentinel-bounded `main()` wiring run. Slices
are taken **from a declaration's own line to the next top-level declaration of any name**, boundaries
from *all* the module's top-level declarations, cloning `loopEconomicsAnchorGuard.test.js`'s `bodyOf`
over `allTopLevelDecls`. The token-set operand is kept honest **not** by set equality against the
module's exports — §7.3 says that comparison "is red by construction" — but by the partition
**`DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`**,
the two sub-sets disjoint, plus a resolves-to-exactly-one-top-level-declaration conjunct per owned
member and a non-empty-slice conjunct per slice. After v1.0 the partition is six ∪ eight = **fourteen**,
all fourteen module declarations.

**Scope.** I did not re-read PROPERTIES from scratch and I re-litigate nothing settled. My v2
Mediums (F-01 DISC task attribution, F-02 the missing set-equality property for `PLAN` T-12a) and
Low (F-03 stale BND range in §Overview) were open at approval and remain open; they are not repeated
here and are not part of this verdict. Every other family — CFG, REC, PRE, REND, BND, FAIL, WIRE,
OFF, TEXT, DISC — I re-checked only for dependence on the moved §7.3 text and found none.

## Properties

Only the **INV** family leans on the moved text. `PROPERTIES`:367 declares INV's trace set as
`TSPEC` §5.5, **§7.3** — §7.3 is the section the erratum edited, so this family is where a cascade
confirmation has to look.

### PROP-INV-06 — the exclusion regions no longer match §7.3

`PROPERTIES`:377 states the census as zero occurrences of any `DECISION_LEDGER_CENSUS_TOKENS` member

> *"anywhere in `orchestrate-dev.js` **outside** the four regions this feature owns: the three
> function bodies sliced by brace-matching from their declarations, and the `main()` wiring run…"*

§7.3 at HEAD specifies neither operand that way, and the gap is not cosmetic:

| Axis | `PROPERTIES`:377 | `TSPEC` §7.3 at HEAD |
|---|---|---|
| What is excluded | **three** function bodies | the body of **every** member of `DECISION_LEDGER_OWNED_DECLS` — six functions **plus eight top-level constants** |
| How a body is sliced | **brace-matching** from the declaration | declaration's own line → **next top-level declaration of any name**, boundaries from *all* top-level declarations (`bodyOf` over `allTopLevelDecls`) |
| Why | — | *"Slicing **every** owned declaration, not a hand-picked three, is what makes the census satisfiable"* |

§7.3 does not merely prefer the wider exclusion — it names the narrow one as the defect it fixed.
A test built to `PROPERTIES`:377 is **red by construction on conforming code**: `gatherDecisionCorpus`
and `renderDecisionLedgerBlock` are named by their sibling declarations, and
`DECISION_LEDGER_OMIT_REASONS` / `DECISION_LEDGER_CORPUS_OUTCOMES` are named inside
`DECISION_LEDGER_DEFAULTS` and the §5.2 catalogues — none of which sit inside any of the three
function bodies, all of which land in the scanned remainder. The slicing mechanism compounds it:
**brace-matching cannot slice a constant at all**. `DECISION_HEADING_RE` and `DECISION_CORPUS_ARGV`
have no brace body, so the very declarations that must be excluded are unreachable by the mechanism
`PROPERTIES` names. This is the precise false-green-vs-false-red hazard PROP-INV-08 exists to guard,
arriving through the operand definition instead.

`PROPERTIES` also still carries "the three function bodies" implicitly in its post-table paragraph
(`PROPERTIES`:383–384), which says PROP-INV-06's two operands "are both frozen and both
set-equality-checked". The first conjunct survives v1.0; the second does not — see PROP-INV-07.

**What must change:** restate PROP-INV-06's excluded regions as *the body of every member of the
frozen `DECISION_LEDGER_OWNED_DECLS` (fourteen at TSPEC v1.0), sliced declaration-line-to-next-top-level-declaration
over all the module's top-level declarations, plus the sentinel-bounded `main()` wiring run*. Drop
"three" and drop "brace-matching".

### PROP-INV-07 — states the assertion §7.3 rejects

`PROPERTIES`:378:

> *"`DECISION_LEDGER_CENSUS_TOKENS` must be **set-equal** to the module's exported decision-ledger
> symbol names, so a symbol added later cannot escape the census by not being listed."*

§7.3 at HEAD, on that exact comparison:

> *"**Not** set equality against *all* of the module's decision-ledger exports — that comparison is
> red by construction, since §3.1/§4.1/§4.2/§4.4/§5.2 declare roughly a dozen and only these six are
> data-carrying."*

`PLAN`:152 names the same form "the **rejected** form". PROP-INV-07 is therefore not a stale
paraphrase of the contract — it is the contract's explicitly rejected alternative, standing as an
owned property. An implementer discharging PROP-INV-07 literally writes a test that cannot pass.

The replacement §7.3 specifies has **no property behind it anywhere in `PROPERTIES`**. Nothing in the
INV table asserts the partition `CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS` with the two sub-sets
disjoint, and nothing asserts §7.3's red-on-rename conjunct (*each owned member resolves to exactly
one top-level declaration at HEAD*). PROP-INV-08 covers only the non-empty-slice conjunct. So the
family simultaneously owns an unsatisfiable assertion and is missing the two that carry the design's
anti-drift guarantee — the same shape as my v2 F-02, one level up.

The second site is the upstream-obligation table at `PROPERTIES`:893, which discharges **BR-11 / NG-4**
partly via *"PROP-INV-07 (token-set equality)"*. That gloss inherits the defect and must move with it.

**What must change:** replace PROP-INV-07 with the partition property (union equals `OWNED_DECLS`,
sub-sets disjoint, over the frozen fourteen-member list), add a property for the
resolves-to-exactly-one-top-level-declaration conjunct, and re-word `PROPERTIES`:893's parenthetical
from "token-set equality" to the partition. The `PROPERTIES`:383–384 paragraph's "both
set-equality-checked" then needs the same correction: at v1.0 the owned list is kept honest by
resolves-to-one, not by set equality.

### What still holds

- **PROP-INV-08** (every census slice asserted non-empty before counting) is exactly §7.3's
  non-empty-slice conjunct at HEAD. Unaffected.
- **PROP-INV-09** (`decisionLedger` must not be a census token) still matches §7.3, which retains the
  `learningsInjectionField`-analogue rationale — `buildFinalReport` names the field far outside the
  wiring sentinels, so including it would red the census on conforming code. Unaffected.
- **PROP-INV-10**, and PROP-INV-01…05, are replay/driver properties that do not read §7.3's census
  operands. Unaffected.
- The six **token members** themselves are unchanged across v0.8 → v1.0, so PROP-INV-06's token list
  is still correct; only its exclusion regions are wrong.

## Oracles

I re-read ORC-01…ORC-06 against §7.3 at HEAD. **None of the six reads the census operands**, so the
oracle section survives the cascade intact:

| Oracle | Reads moved §7.3 text? | Note |
|---|---|---|
| ORC-01 corpus oracle | No | whole-line equality over FX-CORPUS; §5.3/§5.5 territory |
| ORC-02 citation resolution chain | No | starts at the rendered line |
| ORC-03 shipped-default assertions | No | §4.1 defaults |
| ORC-04 byte-identity baseline guard | No | pins `mergeBaseSha`; §7.2 |
| ORC-05 bounds model | No | O-8, must not reuse the renderer |
| ORC-06 replay oracle | No | FX-REPLAY anchoring; discharges PROP-INV-01…04 |

Worth stating positively because it bounds the blast radius: the census is specified in `PROPERTIES`
**entirely inside the INV property table**, with no oracle of its own. That is why the repair is two
table rows plus two prose glosses and touches nothing else — and also why the defect survived a full
approval round, since no oracle section restates the operands in a place a reader would cross-check.

The census's non-vacuity story is split across PROP-INV-08 (non-empty slices) and the §7.7
compensating-control note at `PROPERTIES`:390–395, which pairs the census with PROP-INV-01…04 for
couplings routed through generically-named locals. That pairing is unchanged by v1.0 and remains
faithful to §7.7.

## Fixtures

No fixture moves. The census is a **source census** — its operand is `orchestrate-dev.js` at HEAD,
not a recorded fixture — so FX-CORPUS, FX-REPLAY, FX-BASELINE, FX-FAILOPEN and FX-PRECEDENCE are all
untouched by the erratum. I confirmed the four corpus literals (6,305 / 10,859 / 12,059 / 441) are
explicitly unchanged in TSPEC's own v1.0 changelog, so ORC-01's transcribed expectations and
PROP-DISC-10's per-file digest pin need no re-transcription.

One fixture-adjacent consequence is worth naming, because it is where the repair will be felt at
implementation time rather than in this document: with `DECISION_LEDGER_CENSUS_TOKENS` now a
**test-file** constant of `decisionLedgerCensus.test.js`, all three census operands live in that one
test file, and the census's scanned source is a file that declares none of them. That is the
precedent's arrangement exactly — `ANCHOR_TOKENS` is a top-level constant of
`loopEconomicsAnchorGuard.test.js`, not of the module it scans — and it removes the circularity the
old wording needed the "token strings live inside its own declaration" exclusion to escape. The
design is cleaner after v1.0; `PROPERTIES` simply has not caught up with it.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | inherited | local | PROP-INV-06 excludes **three brace-matched function bodies**; §7.3 at HEAD excludes the body of **every** member of `DECISION_LEDGER_OWNED_DECLS` (fourteen: six functions + eight constants), sliced declaration-line-to-next-top-level-declaration. §7.3 names the narrow form the defect it fixed ("not a hand-picked three"). A test built to PROP-INV-06 is red by construction on conforming code, and brace-matching cannot slice a constant such as `DECISION_HEADING_RE` at all. | `PROPERTIES`:377, PROP-INV-06 |
| F-02 | High | inherited | local | PROP-INV-07 asserts `DECISION_LEDGER_CENSUS_TOKENS` **set-equal to the module's exported decision-ledger symbol names** — the comparison §7.3 calls "red by construction" and `PLAN`:152 calls "the **rejected** form". §7.3's actual contract, the partition `CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS` (disjoint) plus the resolves-to-exactly-one-top-level-declaration conjunct, has no property behind it anywhere in the document. Second site: the BR-11 / NG-4 row's "(token-set equality)" gloss. | `PROPERTIES`:378 and :893, PROP-INV-07 |
| F-03 | Medium | delta | local | The census module's owner split — `decisionLedgerCensus.test.js`, T-11 (2) → T-18 (8) — rests on a red→green edge `PLAN` grounds in T-18 writing `DECISION_LEDGER_CENSUS_TOKENS` into `orchestrate-dev.js`. The v1.0 erratum makes that constant a test-file declaration, voiding the stated rationale. The edge itself survives via the module declarations landing in batches 3–8, so the mapping is salvageable, but its justification is now upstream-contested. | `PROPERTIES`:847, module manifest |

FINDING: High | inherited | local | PROP-INV-06 (`PROPERTIES`:377) — exclusion regions specify three brace-matched function bodies where TSPEC §7.3 at HEAD specifies every member of DECISION_LEDGER_OWNED_DECLS sliced declaration-to-next-declaration
FINDING: High | inherited | local | PROP-INV-07 (`PROPERTIES`:378, :893) — states the export-set-equality assertion TSPEC §7.3 rejects as red by construction, and the partition contract that replaced it has no owning property
FINDING: Medium | delta | local | `PROPERTIES`:847 module manifest — the census module's T-11 to T-18 red-green rationale is voided by the constant's move to a test-file home

**On the `inherited` tag for F-01 and F-02.** I want to be explicit, because the tag decides whether
this phase halts. Neither High was introduced by the `452d72c07` erratum edit. Both entered when
`4b28af44a` rewrote §7.3 to make the census satisfiable over its whole token set — after my v2
approval was taken against TSPEC v0.8, and before this round opened. The erratum edit lands *inside*
the same §7.3 cells (which is why both are `local`, not `nonlocal`), but it neither created nor
touched the divergence: it removed one member from two lists and gave three constants a home.
Tagging them `delta` would halt the phase for a defect this round's author did not cause; tagging
them `inherited` routes them back to the owning phase, which is the honest and the correct
disposition. I am reporting them here rather than deferring them because `DEC-ERR-03` measures
PROPERTIES against upstream **at HEAD**, not against the routed-item list.

## Questions

## Positive Observations

## Recommendation

## Verdict

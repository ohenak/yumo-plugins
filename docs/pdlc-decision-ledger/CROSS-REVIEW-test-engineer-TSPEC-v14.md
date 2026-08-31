# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md
**Date:** 2026-08-31
**Iteration:** 14 (delta confirmation, round v14)
**Prior round:** CROSS-REVIEW-test-engineer-TSPEC-v13.md (Approved with minor changes; REVIEWED-COMMIT 3a17387d61fdf8fd454094277f982d9d4d277f20)

## Overview

**Scope of this round.** Delta confirmation only. I previously approved this TSPEC at v1.2
(`REVIEWED-COMMIT 3a17387d6`). Since then two commits touched it — `df2b10154` (v1.3, re-ground on
REQ v1.10 / FSPEC v1.4) and `757922341` (cite FSPEC E-7 by id). I read the diff of those two
commits, re-read the upstream text this document now leans on at its current version, and answer
one question: does the delta resolve the routed item without breaking what I approved?

**Routed item.** *PLAN v0.7 contradicts TSPEC §7.3's census pin in all six routed places
(fifteen-member owned list, production home for `DECISION_LEDGER_CENSUS_TOKENS`) — routes to PLAN's
phase.* This item has **no locus in this document**: §7.3 is the authority the contradiction is
measured against, and the correction direction it states is downstream-to-here. The v1.3 changelog
correctly declines to edit §7.3 and records the route. That disposition is right.

**Upstream is unmoved since my approval.** I re-measured both pins at HEAD:

| Upstream | Dispatch hash | Measured at HEAD | Version numeral |
|---|---|---|---|
| REQ | `sha256:9bc8bc32…05f10d` | identical | v1.10 |
| FSPEC | `sha256:48691453…a11256` | identical | v1.4 |

The header pin now names that pair, replacing the superseded `REQ v1.9 / FSPEC v1.3`. That is
mechanically correct.

**Answer.** Yes with one recorded defect — a Medium, bookkeeping-only staleness in the new v1.3
changelog paragraph about PLAN's state (F-01). It is the recurrence of my v13 F-01 in new bytes.
No High. No approved contract is disturbed.

## Architecture

Nothing architectural moved. The delta is 33 insertions / 5 deletions, and every deleted line is a
pointer numeral, not a claim:

| Site | Before | After | Verdict |
|---|---|---|---|
| Header *Upstream* row | `REQ v1.9`, `FSPEC v1.3` | `REQ v1.10`, `FSPEC v1.4` | correct at HEAD |
| §4.1 admits-nothing sentence | `FSPEC v1.3's E-7` | `FSPEC **E-7**` | id-cited, DEC-DOC-01 conformant |
| §6.1 `F-13` row | `(FSPEC v1.3's E-7)` | `(FSPEC **E-7**)` | same |
| §7.6 `AT-14` row | `FSPEC v1.3's cases` | `FSPEC **E-7**'s cases` | same, and stronger — it now names the clause, not the document |
| Changelog | — | new v1.3 entry | see F-01 |

**Design surfaces untouched.** §3 (corpus gathering), §4 (parser / selector / renderer), §5 (module
surfaces), §7.3 (the census contract) are byte-identical outside the two one-line citation edits.
The fourteen-member pin at §7.3 (*The size of the owned list, stated once* — six functions ∪ eight
constants) stands unmoved, as does the 1,200-byte pin and the sentinel-bounded slice contract. No
seam, no injection point, no oracle placement changed, so nothing I approved on the testability axis
can have regressed.

**Version-numeral sweep.** I grepped the whole document for residual `FSPEC v1.` / `REQ v1.`
pointers. The remaining hits are all inside **historical changelog entries** (v0.5, v0.6, v1.2,
§9.2's ERR-1/ERR-2 resolution notes) where the numeral is the subject of the sentence — "FSPEC v1.3
widened E-7", "Resolved in REQ v1.8". Those are history, not live pointers, and a future upstream
bump cannot invalidate them. No live body citation names upstream by numeral any more. The routed
churn class is closed.

## Interfaces

No interface, protocol or seam in this document was edited. I re-checked the three that the routed
citation edits sit adjacent to, to confirm the id-swap did not change what they oblige:

- **§4.1 `parseDecisionLedgerConfig`** — the admits-nothing clause still says `0` is a *valid* value
  on **either** `maxEntries` or `maxBytes`, still routes the `maxBytes` axis through E-8 ⇒ E-6, and
  still cross-checks against REQ C-5's non-negative typing. Swapping `FSPEC v1.3's E-7` for
  `FSPEC E-7` changed the pointer, not the obligation.
- **§6.1 `F-13`** — the failure row's three conjuncts (block is `""`; not an error; not a fallback;
  not a halt) are unchanged. The row still carries a positive oracle (`""`), not an absence-only
  one, which is why I approved it.
- **§7.6 `AT-14`** — still a positive assertion over all three cases, byte-identical to AT-04's
  stream. The wording change is an improvement: `FSPEC E-7`'s cases is a falsifiable pointer (E-7
  enumerates exactly those three), where `FSPEC v1.3's cases` named no clause at all.

**Upstream fidelity of the swapped citations.** I read FSPEC E-7 at v1.4 (`FSPEC:342`) directly.
It reads: *Either bound resolves to `0` — `maxEntries` `0`, or `maxBytes` `0` → treated as zero
in-scope decisions — E-6's outcome, for both keys. Not an error, not a fallback to the default, not
a halt. `0` is a valid operator value on either key (REQ C-5 types both non-negative); on the
`maxBytes` axis the same outcome also follows from E-8 then E-6.* Every one of the three TSPEC
sites is a faithful compression of that clause, and E-7 is intact at v1.4 — the changelog's claim
that "E-7 itself is unmoved at FSPEC v1.4" is true, not asserted. No nonexistent-authority citation.

## Data Model

No type, enum, numeric range or measured literal moved. I diffed the values this document pins
against their upstream definitions at the **current** upstream version, not against the changelog's
assurance:

| Value | TSPEC | Upstream at HEAD | Match |
|---|---|---|---|
| `decisionLedger.maxEntries` default | `70`, non-negative integer | REQ C-5 (`REQ:193`) `70`, non-negative | yes |
| `decisionLedger.maxBytes` default | `12500`, non-negative integer | REQ C-5 (`REQ:194`) `12500`, non-negative | yes |
| Corpus literals | 6,305 / 10,859 / 12,059 / 441 | Baseline v1.2 `M-*`, cited by id | unmoved (Baseline pin unchanged) |
| Owned-declaration count (§7.3) | six functions ∪ eight constants = **fourteen** | TSPEC-local pin, no upstream operand | unmoved |
| Census partition (§7.3) | six data-carrying ∪ eight plumbing = fourteen | TSPEC-local pin | unmoved |
| Wiring-region reserve | 1,200 bytes | TSPEC-local, derived from Baseline `M-7c` | unmoved |

REQ v1.10's own changelog confirms the three edits it made are REQ-local (C-5's slack **rationale**
reworded, the REQ's *Cross-Reviews* row corrected, a v1.9 note re-sited); FSPEC v1.4's changelog
confirms it advanced only its own upstream pin. Neither introduces a new `BR-`, `E-` or `AC-` id and
neither moves a measured value. So the TSPEC's "nothing is absorbed" claim is verified, not taken on
trust, and this document remains a faithful compression of both upstreams at their current version.

**Census pin vs. PLAN at HEAD.** PLAN is now at **v0.9**, not v0.7. Its v0.8 round already homed all
three census constants in `decisionLedgerCensus.test.js` and restated the owned list as
**fourteen** (`PLAN:25`, `PLAN:162`, `PLAN:168`, `PLAN:217`, `PLAN:503–514`), explicitly recording
that `T-18` writes **no** census constant. The contradiction §7.3 was pinned against is therefore
**resolved downstream**, in the direction §7.3 mandated. Nothing in this TSPEC needs to change for
that — which is exactly why F-01 below is bookkeeping, not contract.

## Test Strategy

The delta touches no test-strategy surface. I re-verified the parts of §7 that the edited citations
reach into, plus the ones a stale-pointer sweep could plausibly have damaged.

- **§7.6 AT-14 is still falsifiable.** It asserts a *positive* byte-identity against AT-04's stream
  across all three E-7 cases (zero-decision set, `maxEntries` `0`, `maxBytes` `0`). This is the
  preservation oracle with a positive-presence conjunct that I asked for in an earlier round — it is
  intact, and the id-swap makes its case enumeration traceable to the clause that defines it.
- **§7.3's census oracle is untouched.** The declaration-anchored slice, the widened `DECL_RE`
  covering `const`/`let` bindings, the set-equality partition, and the zero-occurrence assertion all
  stand. The precedent clone (`loopEconomicsAnchorGuard.test.js`'s `bodyOf` / `allTopLevelDecls`) is
  unchanged, so the mutation story I approved — rename an owned declaration, expect RED — still
  holds.
- **§6.1's failure table** keeps every row's positive terminal-state conjunct. F-13 in particular
  asserts `""` (an exact value), never `!= error`, so no absence-only oracle was introduced.
- **AT budget and traceability rows** are unchanged in count and membership; no AT lost an owner and
  no AC lost its AT. Nothing in the delta could understate a batch or reorder a red-before-green
  edge, since no PLAN-facing task ordering lives in this document.

**No new testability debt.** The delta adds prose to the changelog and rewrites three pointers. It
adds no new behavior, no new component, no new parameterisable surface — so there is no new
property-based-testing obligation and no new coverage floor to check. The property strategies and
the ≥85% branch floor I approved at v1.2 apply unchanged.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | The v1.3 changelog's PLAN-state paragraph is now the **second** round in which this document has described a sibling document's state and been overtaken by it (v13 F-01, and F-01 below). Is a changelog the right place to assert a sibling's *current* version at all? A route-record that names the item and the owning phase — without reciting the sibling's version, list size and constant siting — would be immune to this class of staleness. Consider that form on the next touch. |

**Assumptions I am carrying forward, unchanged from v13:**

1. §7.3 remains the single home of the owned-declaration count; downstream documents cite the
   paragraph rather than restating the arithmetic as their own assertion.
2. The freeze is in force for this document: Medium and Low findings are recorded, not gating.
3. Erratum-round scope is the delta plus upstream fidelity, not a fresh full read (DEC-ERR-03).

**Risks:** none that gate. The single recorded defect is inert — no operand, count, budget, oracle,
AT row or traceability edge reads the changelog paragraph in question, so an implementer following
this TSPEC cannot be misled by it. The correct downstream state (PLAN v0.9, fourteen members, all
three census constants test-file-homed) is already what PLAN carries, and §7.3 — which is the
authority — agrees with it.

## Recommendation

**Approved with minor changes**

The delta lands the header re-grounding and the three id-citations cleanly, is verified faithful to
REQ v1.10 and FSPEC v1.4 at HEAD, and breaks nothing I previously approved. The routed PLAN item is
correctly declined here and correctly routed, and it is in fact already resolved downstream at PLAN
v0.9. The one defect is a stale recital of PLAN's version and list size inside the new changelog
paragraph — the same bookkeeping staleness I recorded at v13, restated in this round's bytes. It is
Medium, `delta`/`local`, and non-gating under the freeze. Fix it on the next touch of this document
by deleting the sibling-state recital and keeping only the route record (see Q-01).

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | The new v1.3 changelog paragraph asserts that `PLAN` v0.7 "carries the retired fifteen-member owned list and a production home for `DECISION_LEDGER_CENSUS_TOKENS`" and that the item "remains routed to PLAN". PLAN is at **v0.9** at HEAD: its v0.8 round homed all three census constants in `decisionLedgerCensus.test.js`, restated the owned list as fourteen, and recorded that T-18 writes no census constant (`PLAN:25`, `PLAN:162`, `PLAN:168`, `PLAN:217`). The route was correct to take; the recital of the sibling's state is stale. Bookkeeping only — no operand, count, budget, oracle, AT or traceability row reads it. This is my v13 F-01 recurring in new bytes. Fix: drop the version/list-size recital, keep the bare route record. | Changelog, v1.3 entry — "PM F-01 (High, `inherited`/`nonlocal`) remains routed to PLAN" paragraph |

FINDING: Medium | delta | local | Changelog v1.3 entry, "PM F-01 remains routed to PLAN" paragraph | The paragraph recites PLAN as v0.7 carrying a fifteen-member owned list and a production home for DECISION_LEDGER_CENSUS_TOKENS; PLAN is at v0.9 at HEAD and resolved both in its v0.8 round (fourteen members, all three census constants homed in decisionLedgerCensus.test.js, T-18 writes no census constant). The route itself is correct and §7.3 is untouched, so this is bookkeeping-only staleness — recurrence of v13 F-01 in new bytes; drop the sibling-state recital and keep the bare route record.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}

APPROVAL-HASH: sha256:2c84d5250d13c57573eae0fde9ef1c00dd128ddd07169f5b7570c6c3911be49b
APPROVAL-HASH-NORMALIZED: sha256:1ed10561d748c20e72325920d2e71c6af2655abc3b2d90e13bbc7f95e0cb12a1
REVIEWED-COMMIT: 1c0881daeb296436090656d3a816439271eae78e
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256

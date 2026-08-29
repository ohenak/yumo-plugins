# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md (v0.8)
**Date:** 2026-08-29
**Iteration:** 9 (delta confirmation)

## Scope

A **delta confirmation**, not a re-review. I previously approved this PLAN; v0.8 is an erratum round
carrying three routed items. I read the routed item list, diffed the erratum edit
(`3fb153a87~1..HEAD`, 23 insertions / 14 deletions, one file), and re-read the upstream text this
PLAN now leans on at its current version.

**Upstream re-grounding (DEC-ERR-03).** All four dispatch hashes verify byte-for-byte at HEAD:

| Upstream | Version at HEAD | `shasum -a 256` | PLAN header pin | Agrees |
|---|---|---|---|---|
| REQ | 1.9 | `ce6b133f…3c7b7c` | v1.9 `ce6b133f…3c7b7c` | ✅ |
| FSPEC | 1.3 | `2bd5c3ef…5aed39` | v1.3 `2bd5c3ef…5aed39` | ✅ |
| TSPEC | **1.1** | `21c913b4…9c8e49` | **v1.1** `21c913b4…9c8e49` | ✅ |
| DECISIONS | — | `13aba061…4fb89a` | `13aba061…4fb89a` | ✅ |

This matters more than usual on this round. The routed items were written by reviewers reading TSPEC
**v1.0**, and TSPEC has since advanced to **v1.1**. v0.8's own revision history states it re-derived
the round against v1.1 before touching any raised item, and the header pin confirms it — the PLAN is
not answering a superseded upstream. v1.1 does not reverse v1.0; §7.3's *The size of the owned list,
stated once* paragraph single-sites the count at **six ∪ eight = fourteen** and declares the
correction direction downstream-to-here. So the routed items are still live at HEAD and this
document was the stale side, exactly as the round asserts.

**Verdict of this confirmation in one line.** Routed items 2 and 3 — the census-constant home and
cardinality — land cleanly and completely, at every site they touch. Routed item 1 — T-10a's
conjunct 3 — is **entirely unlanded**: the erratum edit never touched T-10a's row, and the retired
referents it names are still on disk, at two sites.

## Tasks

Per-routed-item landing audit. "Landed" means I checked the bytes on disk, not the revision history's
claim about them.

### Item 2 + Item 3 — census-constant home and cardinality — **LANDED, all six sites**

Items 2 and 3 are the same correction stated by two reviewers, so I audited them as one sweep. TSPEC
v1.1 §7.3 requires: all three census constants are declarations of the census **test file**; none is
production; none is a member of the owned list; the partition is **six ∪ eight = fourteen**. Every
site v0.7 got wrong now agrees:

| Site | v0.7 (stale) | v0.8 (on disk) | OK |
|---|---|---|---|
| Header pin | TSPEC **v0.9** `eef45ef3…` | TSPEC **v1.1** `21c913b4…` | ✅ |
| Revision history (`:19`–`:23`) | six ∪ nine = fifteen "stands"; fourteen "rejected" | v0.7 entry marked *superseded*, retained as history not contract | ✅ |
| T-11 row (`:158`) | six ∪ nine = fifteen | **six** ∪ **eight** = **fourteen**; "All three are declarations of this task's own test file" | ✅ |
| T-18 row (`:164`) | "Add frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration" | "This task writes **no census constant** … there is no production declaration to add here" | ✅ |
| Manifest row, census test file (`:213`) | sole home of **two** lists; tokens "**not** a test-file constant — it is production" | "the sole home of **all three** frozen census lists" | ✅ |
| Manifest row, `orchestrate-dev.js` T-18 (`:225`) | "**and the `DECISION_LEDGER_CENSUS_TOKENS` declaration**" | "it declares **no** census constant — all three are test-file constants owned by T-11" | ✅ |
| §Definition of Done census bullet | nine / fifteen; tokens "is **production**, declared by T-18" | eight / fourteen; "none is production code or a member of the owned list" | ✅ |

Two things I checked beyond the literal find-and-replace, because a count edit is exactly where a
document goes half-stale:

- **The eight exempt members are enumerated, and the enumeration is eight.** T-11 names
  `parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`,
  `DECISION_HEADING_RE`, `DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`,
  `DECISION_LEDGER_RULE_TEXT`, `DECISION_LEDGER_NOTICES` — eight, matching TSPEC §7.3's exempt row
  after `DECISION_LEDGER_CENSUS_TOKENS` was removed from it. The count and the list agree; the
  document did not update one and leave the other.
- **`fifteen` still appears at `:99`, and that is correct.** It is the *new test/fixture path* count
  (twelve `decisionLedger*` modules + `helpers/decisionLedgerDoubles.js` + two fixture trees), an
  unrelated cardinality. Not a missed replacement.

The corollary the round also had to absorb landed too: T-11 now carries §7.3's **widened declaration
regex** conjunct ("eight of this feature's fourteen owned declarations are top-level `const`s", so
the precedent's `function`-anchored `DECL_RE` must be widened, not cloned), and keeps the
non-empty-slice and resolves-to-exactly-one conjuncts that stop the census going vacuous. That is the
falsifiability half of the census, and it survived the count edit intact.

### Item 1 — T-10a conjunct 3 — **UNLANDED**

The erratum edit does not touch T-10a's row. `git diff 3fb153a87~1 HEAD` mentions `T-10a` seven
times, every one of them inside the *bodies* of the rewritten T-11 and T-18 rows; the T-10a row
itself is byte-identical to v0.7. Both retired referents are still on disk, verbatim — see
`## Delta-Confirmation Findings` F-01 and F-02.

## Dependencies

_pending_

## Verification

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_

# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.6, se-author)
**Date:** 2026-08-29
**Iteration:** 6 (delta re-review)
**Scope:** Local

## Overview

Delta re-review of `PLAN-pdlc-decision-ledger.md` at **v0.6**, against my v5 delta re-review
(`CROSS-REVIEW-product-manager-PLAN-v5.md`, verdict *Needs revision*, reviewed `a408375a6`).

Five commits touched the document since:

| Commit | Message | What changed |
|---|---|---|
| `8434787a1` | re-pin TSPEC to v0.9 and record the re-grounding pass | Header Upstream row, revision-history block |
| `f4b582678` | re-ground T-11's census operands on TSPEC v0.9 §7.3 | T-11 |
| `b7c968be0` | correct the Definition of Done census bullet to TSPEC v0.9's partition | §Definition of Done |
| `a2bad6db6` | give the two new frozen census lists an owning task in the manifest | §Per-phase file-ownership manifest |
| `c937f1a7b` | align T-11's token-set gloss with TSPEC v0.9's declaration-based partition | T-11 |

Aggregate `git diff a408375a6..HEAD`: **34 insertions, 11 deletions**, one file. Sections changed:
Header Upstream row (`PLAN`:9), revision history (`PLAN`:14-32), **T-11** (`PLAN`:150), the
`decisionLedgerCensus.test.js` row of §Per-phase file-ownership manifest (`PLAN`:205), and the
census bullet of §Definition of Done (`PLAN`:485-496). Everything else is byte-unchanged and is
not re-litigated.

**The single open v5 High (F-01, superseded-upstream grounding) is resolved on all four of its
sub-items**, verified mechanically against disk — detail in §Resolution of v5 findings and
§Grounding checks. One new **Medium** is recorded (where `DECISION_LEDGER_CENSUS_TOKENS` is
declared); it does not gate. Nothing previously approved is broken: T-11 keeps its BR-11 / REQ NG-4
citation, its `decisionLedger`-is-not-a-token rationale, its non-empty-slice anti-vacuity conjunct
and its PROP-DIS-06 sentinel disambiguation; T-00a, T-12a and T-19's terminal-`102` ownership split
(the v4 High) are untouched.

## Resolution of v5 findings

**F-01 (High, v5) — resolved.** My v5 finding had four limbs; each is closed, and I checked each on
disk rather than in the revision-history prose.

1. **The pin (`PLAN`:9).** The Upstream row now reads `TSPEC-pdlc-decision-ledger.md` **v0.9**
   `sha256:eef45ef3…0623c8`. `shasum -a 256` over
   `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` at HEAD measures
   `eef45ef32f0dd394…c08feece0623c8` — the pin is the real digest of the file on disk, not a
   transcription of the TSPEC's self-report, and `TSPEC-pdlc-decision-ledger.md`:17 carries version
   **0.9**.

2. **T-11's first operand — the partition (`PLAN`:150).** The gloss I flagged as red-by-construction
   ("held to set equality against the module's exported decision-ledger symbol names") is gone.
   T-11 now states TSPEC v0.9 §7.3's companion assertion verbatim in substance:
   `DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`,
   the two sub-sets disjoint, **and** names the old form as the rejected one ("§7.3 names it red by
   construction"). This matches `TSPEC-pdlc-decision-ledger.md`:1296 clause for clause.

3. **T-11's second operand — the scanned source (`PLAN`:150).** "minus four owned regions — three
   sliced by brace-matching" is replaced by "minus (a) the body of **every** member of
   `DECISION_LEDGER_OWNED_DECLS` — not a hand-picked three; slicing every owned declaration is what
   makes the census satisfiable … and (b) the `main()` wiring run bounded by the literal … sentinels
   (that run only, not the whole of `main()`)". That is `TSPEC`:1297's text, including its
   satisfiability rationale and the `bodyOf` / `allTopLevelDecls` boundary rule. §7.3's red-on-rename
   conjunct (each owned member resolves to exactly one top-level declaration at HEAD) is carried too,
   as is the enumerate-don't-pattern-match rationale.

4. **Owning task and manifest row for the two new catalogues.** §Per-phase file-ownership manifest
   (`PLAN`:205) now reads `pdlc/workflows/__tests__/decisionLedgerCensus.test.js` "(also the sole
   home of the two frozen test-file lists `DECISION_LEDGER_CENSUS_EXEMPT` and
   `DECISION_LEDGER_OWNED_DECLS`, TSPEC §7.3) | T-11 | 2", agreeing with T-11's own body. The
   homelessness that made BR-11's instrument unownable is closed.

**§Definition of Done (`PLAN`:485-496) follows the same movement**: the census bullet now requires
every slice non-empty, the scanned source as `orchestrate-dev.js` minus every `OWNED_DECLS` member
plus the sentinel-bounded run, the partition with its cardinalities (**six** ∪ **nine** =
**fifteen**, disjoint), the red-on-rename conjunct, and it names set-equality-against-all-exports as
the rejected form. The DoD and the task table now say the same thing — in v5 they did not.

## Grounding checks

**Upstream pins re-measured at HEAD** (`shasum -a 256`, first-8…last-6, the abbreviation the header
uses):

| Upstream | Header pin (`PLAN`:9) | Measured at HEAD | |
|---|---|---|---|
| `REQ` v1.9 | `ce6b133f…3c7b7c` | `ce6b133f…3c7b7c` | ✓ |
| `FSPEC` v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef…5aed39` | ✓ |
| `TSPEC` **v0.9** | `eef45ef3…0623c8` | `eef45ef3…0623c8` | ✓ |
| `DECISIONS` | `13aba061…4fb89a` | `13aba061…4fb89a` | ✓ |

All four match. The revision history's claim that the other three were re-measured in this pass and
found unchanged is true as stated.

**Files named by the changed rows.**

- `pdlc/workflows/__tests__/decisionLedgerCensus.test.js` — absent from disk and tagged `[new]` in
  T-11's file column and by the manifest row. Correctly declared new.
- `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` — exists; the precedent T-11 clones is
  real, and the two symbols cited are at `loopEconomicsAnchorGuard.test.js`:63 (`allTopLevelDecls`)
  and `:114` (`ANCHOR_TOKENS`), with `bodyOf`'s boundary rule at `:124-127` ("boundaries come from
  `allTopLevelDecls`, not just the census subset", `:119-120`) — exactly the discipline T-11
  transcribes.
- `pdlc/workflows/orchestrate-dev.js` — exists. Every shipped declaration T-11 cites as a
  false-positive of a `/Decision/i` name rule is really there:
  `MERGE_MAX_DECISION_STEPS` (`orchestrate-dev.js`:88), `renderDecisionEntry` (`:4640`),
  `escalationDecision` (`:4738`), `erratumGateDecision` (`:6914`), `parseDecisionsWarranted`
  (`:7044`). The enumerate-don't-pattern-match rationale is grounded in code, not asserted.

**Cardinality check on the partition** (this is the arithmetic that decides whether the instrument
can go green, so I did it rather than trusting the count words). T-11's `CENSUS_TOKENS` lists six
names; `CENSUS_EXEMPT` lists nine (`parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`,
`DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`, `DECISION_CORPUS_ARGV`,
`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, `DECISION_LEDGER_NOTICES`,
`DECISION_LEDGER_CENSUS_TOKENS`); the two are disjoint; their union is fifteen names, which is
exactly `TSPEC`:1297's enumeration of `DECISION_LEDGER_OWNED_DECLS` (§4.1/§4.2/§4.4's six functions
+ `DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`,
`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT` + §5.2's three catalogues +
`DECISION_LEDGER_CENSUS_TOKENS` itself). Six + nine = fifteen, and the sets agree name-for-name. The
set equality is satisfiable, and it is a set equality, not a containment — a later symbol
unclassified into either list reddens.

**Anti-vacuity and absence-pairing survive the rewrite.** "Each slice asserted non-empty before
counting, so the census cannot go vacuous" is retained; the negative census assertion (zero
occurrences in the remainder) is paired with positive assertions on the same paths — the non-empty
slice check, and, for the `decisionLedger` field excluded from the token set, T-10a's positive
`report.decisionLedger` assertion on a real `main()`-driven run with the flag-off arm pairing
absence with a set-equality on the report's key set (`PLAN`:150). No absence-only oracle is
introduced by this round's edit.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

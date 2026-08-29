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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

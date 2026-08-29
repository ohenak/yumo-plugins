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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | T-11 (`PLAN`:150) never states **where** `DECISION_LEDGER_CENSUS_TOKENS` is declared, and the two cues around it point opposite ways. It opens by "cloning `loopEconomicsAnchorGuard.test.js`'s `ANCHOR_TOKENS`" — a **test-file** constant (`loopEconomicsAnchorGuard.test.js`:114) — and its parenthetical marks only the *other* two lists as test-file ("neither is production code and neither is a member of `DECISION_LEDGER_OWNED_DECLS`"), implying by contrast that `CENSUS_TOKENS` is production. The partition forces that reading: `CENSUS_TOKENS` is listed inside `CENSUS_EXEMPT` ⊆ `DECISION_LEDGER_OWNED_DECLS`, and §7.3's red-on-rename conjunct requires every owned member to resolve to exactly one top-level declaration **in `orchestrate-dev.js` at HEAD**, with its slice non-empty. The only instruction that would place it there is T-18's dangling three-word fragment "Add `DECISION_LEDGER_CENSUS_TOKENS`." (`PLAN`:156), which names no home and completes no sentence. An implementer who follows the `ANCHOR_TOKENS` analogy and declares it in `decisionLedgerCensus.test.js` makes two T-11 conjuncts unsatisfiable, and BR-11 / REQ NG-4's only falsifying instrument is red at batch 2 for a reason no one planned. **Fix:** in T-11 say `DECISION_LEDGER_CENSUS_TOKENS` is declared in `pdlc/workflows/orchestrate-dev.js` (unlike the precedent's test-file `ANCHOR_TOKENS`, and unlike this task's two test-file lists), and complete T-18's sentence to "Add the `DECISION_LEDGER_CENSUS_TOKENS` declaration to `orchestrate-dev.js`". Medium, not High: the failure is loud, local to batch 2, and cheap to correct; the cardinality arithmetic already forces the correct reading for a careful reader. | BR-11 / REQ NG-4 |

**Note on F-01's severity and gating.** This is recorded, not gating. It is the only new material
this round raises, and it does not undo the re-grounding: the partition and the scanned-source
operand are now faithful to `TSPEC` v0.9 §7.3, which is what my v5 High demanded.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `PROPERTIES-pdlc-decision-ledger.md`:377-378 still carries the pre-v0.9 census contract — PROP-INV-06 scans "the four regions this feature owns: the three function bodies sliced by brace-matching", and PROP-INV-07 requires `DECISION_LEDGER_CENSUS_TOKENS` to be "set-equal to the module's exported decision-ledger symbol names", the exact form `TSPEC`:1296 now names red by construction. This is **not** a defect of the PLAN — PROPERTIES is downstream of it, and no erratum is owed from this review — but it is now the last document in the feature still describing the superseded census. Does the orchestrator intend PROPERTIES to be re-grounded on `TSPEC` v0.9 before implementation begins, so T-11's test is not written against two contradictory contracts? |
| Q-02 | T-11 says the two new frozen lists are "declared in this task's own test file", and the manifest row calls `decisionLedgerCensus.test.js` their "sole home". T-18 nonetheless edits `orchestrate-dev.js` and mentions `DECISION_LEDGER_CENSUS_TOKENS` (see F-01). Is the intended split "TOKENS in production, EXEMPT and OWNED_DECLS in the test file"? If so, saying it in one clause closes F-01 outright. |

## Positive Observations

- **The re-grounding is a real re-derivation, not a label change.** All four pins measure correctly
  at HEAD, and the two clauses that actually moved in `TSPEC` v0.9 §7.3 — the partition and the
  every-owned-declaration slice — were rewritten in T-11, the DoD bullet **and** the manifest row
  together. A pin bump without the body edit is the common failure here; this pass avoided it.
- **The count words are load-bearing and correct.** Six ∪ nine = fifteen reconciles name-for-name
  with `TSPEC`:1297's enumeration. Carrying the cardinalities in the DoD bullet as well as the task
  row gives the wave gate an arithmetic check a reviewer can redo in thirty seconds.
- **The rejected forms are recorded, not silently dropped.** T-11 names set-equality-against-all-
  exports as rejected and says why, and keeps the `decisionLedger`-is-not-a-token rationale with its
  behavioural discharge routed to T-10a. A future reader meeting the narrower token set will not
  read it as an oversight.
- **Code-grounded rationale.** The five shipped `/Decision/i` collisions T-11 cites are all real
  declarations in `orchestrate-dev.js` (`:88`, `:4640`, `:4738`, `:6914`, `:7044`). The plan argues
  from the codebase, which is what makes the enumerate-don't-pattern-match choice checkable.
- **Nothing previously approved regressed.** The v4 High's fix — the terminal `102` positive control
  owned by T-19, the set census owned by T-12a, T-00a's one-sided batch-1 acceptance — is
  byte-unchanged and still consistent across task table, manifest and DoD.

## Recommendation

**Approved with minor changes**

The one open High from v5 — the PLAN grounded on superseded `TSPEC` v0.8 while v0.9 had rewritten
the census contract T-11 compresses — is resolved on all four limbs, verified against the files on
disk. No High finding is open anywhere in the document. F-01 (Medium) should be folded into the next
touch of this PLAN, or into T-11's implementation brief, but it does not gate the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}

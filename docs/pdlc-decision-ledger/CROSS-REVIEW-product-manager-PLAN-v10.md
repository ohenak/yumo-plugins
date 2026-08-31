# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.9)
**Date:** 2026-08-30
**Iteration:** 10 (erratum delta confirmation, not a full re-review)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Overview

**Answer to the one question asked: yes.** The delta lands the routed item, and the document is
still a faithful compression of its upstream at HEAD.

**Upstream re-grounding (DEC-ERR-03), re-measured by me at this dispatch.** I re-derived all four
upstream hashes with `shasum -a 256` rather than trusting the header row, and re-read the sections
this PLAN leans on at their current bytes:

| Upstream | Header-row pin | Measured at HEAD | Verdict |
|---|---|---|---|
| REQ v1.9 | `ce6b133f…3c7b7c` | `ce6b133f0c1d…0d3c7b7c` | match |
| FSPEC v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef055f…1735aed39` | match |
| TSPEC **v1.2** | `fc57bc56…d4c27504` | `fc57bc56e0b5…8fdd4c27504` | match — **advanced this round**, pin correctly moved |
| DECISIONS | `13aba061…4fb89a` | `13aba06127b4…b0bb4fb89a` | match |

TSPEC v1.1 → v1.2 touched exactly three regions (§4.3, §7.3, changelog — the changelog says so and
the diff confirms it). Both §7.3 and §4.3 are regions this PLAN compresses, so both were re-read at
HEAD, not assumed; §4.3's outcome is reported under **Verification** below.

**Routed-item disposition.** The routed item was a six-site contradiction between PLAN v0.7's
census contract and TSPEC §7.3. Five of the six sites (`:19` revision history, T-18's production
census-constant instruction, both file-ownership-manifest rows, §Definition of Done) were closed in
v0.8 and I confirmed them still closed at HEAD; I re-checked them because a later edit can re-open
a closed site, not because they were in doubt. The sixth — T-11 and its T-10a companion clause,
the site my v9 F-01 (High) held open — is closed by this round. `grep` for the retired count over
the whole document returns only the three revision-history entries, each explicitly marked history
(`v0.7` carries *superseded in part by v0.8 … retained as history*), which is the form TSPEC §7.3's
v1.2 changelog expressly permits: "the changelog records counts as history of an edit rather than as
claims about HEAD." No contract site carries fifteen.

## Batches

Two task rows moved in this round — T-10a and T-11 — plus the §Definition of Done bullets that
mirror them (reported under **Verification**). No batch number, task id, ownership or dependency
assignment moved; I verified that claim rather than accepting it (see **Dependencies**).

**T-10a conjunct 3 — my v9 F-01 is closed, and closed with the referent upstream actually names.**
My v9 finding was that conjunct 3 asserted (a) `report`'s key set "set-equal to the flag-off key
set" — a tautology on the flag-off run, unfalsifiable — and (b) `notices` "set-equal to the baseline
notices array", where the only baseline this PLAN owns is T-02's recording, which holds
reviewer-prompt bytes and no notices array at all. The revision is not a patch over that phrasing;
it adopts TSPEC §7.2's own two forms verbatim in substance:

- the **symmetric difference** between the arm's flag-off and flag-on `report` key sets is exactly
  `{decisionLedger}`, asserted as a set equality in **both** directions;
- the emitted `NTC-DECLEDGER-*` notice set is **set-equal to empty**.

Both are falsifiable, and both are self-contained within the arm's own paired runs. The row now
states that referent explicitly — "the referent for both clauses is the paired flag-off/flag-on runs
inside this arm, never a stored artefact" — and re-scopes the §7.4 citation to the prompt clause
alone. That is the exact defect my v9 F-01 named: §7.4's recording was being cited for an obligation
it cannot discharge. It is now cited only for the one it can.

**Product fidelity of the replacement.** This is where a stronger-looking assertion could quietly
narrow an acceptance criterion, so I checked it against the requirement rather than against the
TSPEC alone. REQ-DECLEDGER-02 (P0) is *"the dispatch stream is byte-identical to the pre-feature
baseline; no index text or rule text is ever rendered"*, and FSPEC AT-04 is the byte-identity of the
disabled dispatch against **the committed fixture baseline, not a same-branch before/after
comparison**. Conjunct 3's **first** clause — prompt byte-identical to T-02's committed merge-base
recording — is the clause that carries that P0, and it is untouched by this edit, including the
"not a string computed by subtracting the block from the flag-on prompt" guard that keeps AT-04's
independent-referent requirement intact. What changed is only the two *side-effect* conjuncts
(report field, notices), which are the no-observable-residue guard around the P0, not the P0 itself.
So the acceptance criterion is preserved as written; it is the guard that got sharper.

**T-11 — the census row.** Two edits. (1) The companion assertion now names its operands inline —
`CENSUS_TOKENS`'s **six data-carrying names** ∪ `CENSUS_EXEMPT`'s **eight plumbing declarations** =
the owned list's **fourteen** — and cites §7.3's *The size of the owned list, stated once* as the
authority for the count. I checked the reason given for naming the nouns, and it is upstream's own:
§7.3 v1.2 now reads *six functions ∪ eight constants = fourteen* and states inline that its
*Forbidden token set* row carries a second, numerically identical but membership-different
partition, "so a bare 'six ∪ eight = fourteen' cited elsewhere could be wired to the wrong
operands." The PLAN carries the *census* partition at every site, and now says so at every site.
The apparent asymmetry — upstream calls the census partition "second", the PLAN calls the
functions/constants partition "second" — is each document naming the one it does *not* carry, not a
disagreement. (2) The closing pointer that summarised T-10a's flag-off arm is re-read to the
corrected both-directions form, so the two rows no longer describe the same conjunct differently.

The self-refuting "stated nowhere else in this document" clauses my v9 F-02 (Low) flagged are gone,
replaced by an explicit citation of the authority paragraph — which is the *stronger* of the two
resolutions I offered, and matches how §7.3 v1.2 restated its own single-siting claim.

## Dependencies

**Unchanged, and mechanically confirmed.** The round's own changelog claims "no batch, dependency,
ownership, task-id or count assignment changes in this round." I did not take that on trust: I
diffed the trailing columns of both moved rows across the round's base commit and HEAD.

| Row | Test file / owner | Prod file | Batch | Depends on | Pre-round | At HEAD |
|---|---|---|---|---|---|---|
| T-10a | `decisionLedgerMain.test.js` `[new]` | — | 2 | T-01, T-02, T-03 | as shown | identical |
| T-11 | `decisionLedgerCensus.test.js` `[new]` | — | 2 | T-00, T-01 | as shown | identical |

The two structural edges the census contract rests on are also intact at HEAD:

- **T-11 red until batch 8.** T-11 is committed skipped in batch 2 and un-skipped by T-18 in batch 8,
  because the fourteen owned members it resolves against are written across batches 3–8. The row
  still says so, and T-18's row still lists T-11 among the tests it un-skips. This is the ordinary
  red-before-green edge, unchanged.
- **T-18 writes no census constant.** The reversal landed in v0.8 holds at HEAD: T-18's row states
  the task "writes **no** census constant … there is no production declaration to add here," and its
  production column is the wiring run and loop/prompt parameters only. The file-ownership manifest
  agrees — `decisionLedgerCensus.test.js` is named "the sole home of **all three** frozen census
  lists," owned by T-11 at batch 2, and no `orchestrate-dev.js` row claims any of the three.

Because the moved bytes are confined to task *prose* and the §Definition of Done checklist, the
phasing question a PM has to ask — does P0 work still precede P1 work, and does every P0/P1
requirement still own a task — is unaffected by this round, and I did not re-litigate it. It was
settled in the rounds that approved the batch structure.

One ordering property worth restating because this round depends on it: T-10a is the **only** live
execution of the composition root, and the flag-off arm is where REQ-DECLEDGER-02 (P0) is proved.
Its dependency on T-02 (the committed merge-base recording) is therefore load-bearing for a P0, not
a convenience — and that dependency is unchanged.

## Verification

**The §Definition of Done checklist now matches the task rows.** The v9 round's real hazard was a
half-fix: correcting T-10a while leaving the DoD bullet an implementer signs off against carrying
the two retired referents. Both flag-off bullets were restated in the same edit, and the census
bullet carries the same operand nouns and the same §7.3 citation as T-11. I checked the three
mirrored sites against each other — T-10a's row, the flag-off DoD bullet, and the census DoD bullet
— and they now state one contract in one vocabulary. That matters beyond tidiness: a checklist that
disagrees with its own plan is the artefact that gets signed off, and the disagreement surfaces at
batch 8 with a confusing diagnosis.

**Upstream faithfulness at HEAD, beyond the item list (DEC-ERR-03).** TSPEC v1.2 touched §7.3 and
§4.3. §7.3 is covered above. §4.3 is the one the item list does *not* mention, so I re-read it and
traced it downstream:

- §4.3 v1.2 answers "four constants" normatively: `DECISION_LEDGER_PREAMBLE` and
  `DECISION_LEDGER_RULE_TEXT` are top-level constants, while the header and trailer sentinel lines
  **ship as inline string literals inside `renderDecisionLedgerBlock`'s body**, not as top-level
  bindings — because hoisting either would introduce a feature-declared name absent from
  `DECISION_LEDGER_OWNED_DECLS` and fire §7.3's classify-or-redden guard.
- The PLAN does not contradict this at any site. T-15's owned declarations are `PREAMBLE` and
  `RULE_TEXT` only — no header or trailer constant is assigned to any task. T-06 and the DoD budget
  bullet speak of "header + preamble + rule text + trailer" as rendered **pieces** measured against
  the ≤ 1,200-byte literal, never as four top-level constants. The fourteen therefore stands
  unmoved downstream, which is exactly the invariant §4.3 v1.2 was protecting.

So the one upstream movement outside the routed item's scope lands in this PLAN as a no-op, and it
is a no-op for the right reason rather than by luck.

**Requirement traceability re-checked on the moved bytes only.**

| Moved site | Requirement it serves | Preserved? |
|---|---|---|
| T-10a conjunct 3, clause 1 (prompt byte-identity vs T-02's committed recording) | REQ-DECLEDGER-02 (P0), FSPEC AT-04 | Untouched, including the anti-subtraction guard AT-04's "not a same-branch comparison" demands |
| T-10a conjunct 3, clauses 2–3 (symmetric difference, empty notice set) | REQ-DECLEDGER-02's no-residue guard; TSPEC §7.2 | Replaced with falsifiable forms; nothing narrowed |
| T-10a conjuncts 1–2 (`_git` call-count spy; prompt ends with the block) | DC-07 builder-not-wired; REQ-DECLEDGER-03's rendered rule text | Untouched |
| T-11 companion assertion | BR-11 / REQ NG-4 (the driver never reads a decision id) | Untouched in substance; operands named, authority cited |
| §DoD flag-off + census bullets | as above | Restated to match, no criterion dropped |

No requirement lost a task, no out-of-scope behaviour appeared, and no acceptance criterion was
narrowed, broadened or re-triggered by this edit. My **builder-not-wired** concern for this feature
is discharged by T-10a rather than weakened by it: the arm still drives the real `main()`, still
asserts `gatherDecisionCorpus`'s `_git` seam is invoked **≥ 1** on the served reviewer flow, and is
still named the home file for T-18's `report.decisionLedger` assertion — so the flag-on direction of
the symmetric-difference clause is pinned by a positive presence assertion, not left to the set
identity alone.

## Delta-Confirmation Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_

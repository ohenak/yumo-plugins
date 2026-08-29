# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.7, bytes unchanged)
**Upstream that moved:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` v0.9 → v1.0 (`452d72c07`)
**Date:** 2026-08-29
**Iteration:** 8 (upstream-cascade confirmation)

## Overview

**The one question:** does PLAN v0.7 still hold as approved against TSPEC as it now stands at
`sha256:b1b603a8…d31a0` (v1.0)? **Answer: no.** The erratum reversed the exact contract PLAN v0.7
compresses, and PLAN v0.7's revision history names the now-upstream resolution as the **rejected**
one, in those words.

What moved upstream (`452d72c07`, sections touched: §7.3 + changelog):

| TSPEC §7.3 at v0.9 (the base of my v7 approval) | TSPEC §7.3 at v1.0 (HEAD) |
|---|---|
| `DECISION_LEDGER_CENSUS_TOKENS` is a member of `DECISION_LEDGER_OWNED_DECLS` — so it must resolve to exactly one top-level declaration of `orchestrate-dev.js` with a non-empty slice | New paragraph *"Where the three census constants live"*: all three constants are declarations **of the census test file itself**, not of `orchestrate-dev.js`; a test-file constant is **never** a member of the owned list |
| `CENSUS_TOKENS` is listed inside `DECISION_LEDGER_CENSUS_EXEMPT` | Removed from `CENSUS_EXEMPT` |
| `CENSUS_TOKENS` is listed in the owned-declaration enumeration, with the rationale *"the token strings live inside its own declaration, so the census would otherwise red on its own literal"* | Removed from the owned enumeration; that rationale sentence is **deleted**, on the ground that it only held for a production constant |
| Partition arithmetic: six ∪ nine = fifteen | Partition arithmetic: six ∪ eight = fourteen |

My v7 approval was recorded against `UPSTREAM-STATE: TSPEC sha256:eef45ef3…0623c8`. That version no
longer exists, and the delta is not additive: it inverts the home of the load-bearing operand.

This is a genuine cascade defect, not a bookkeeping nit — an implementer reading PLAN at HEAD writes
a production constant TSPEC now forbids, and the census's companion partition assertion reds on
conforming code. The items landing upstream is necessary but not sufficient (DEC-ERR-03); what
fails here is the PLAN's fidelity to the upstream text as it now reads.

## Batches

Five PLAN sites carry the reversed contract. All five were written by v0.7 in direct response to my
v7-round predecessor finding, and all five now contradict upstream.

| # | Site | PLAN text at HEAD | TSPEC v1.0 §7.3 |
|---|---|---|---|
| 1 | `T-11` (PLAN:152) | `CENSUS_TOKENS` "is itself **declared in `pdlc/workflows/orchestrate-dev.js` as a production top-level constant, written by T-18**… That home is what makes it a member of `DECISION_LEDGER_OWNED_DECLS` — and therefore of `DECISION_LEDGER_CENSUS_EXEMPT`" | test-file constant of the census test; "a test-file constant is never a member of it" |
| 2 | `T-11` (PLAN:152) | `CENSUS_EXEMPT` = "the **nine** plumbing declarations", enumerated with `DECISION_LEDGER_CENSUS_TOKENS` itself as the ninth; `OWNED_DECLS` = "the **fifteen** top-level declarations… all fifteen declared in `orchestrate-dev.js` by a `[green]` task of batches 3–8 (T-13…T-18)" | eight exempt members (`CENSUS_TOKENS` removed), fourteen owned |
| 3 | `T-18` (PLAN:158) | "**Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to `pdlc/workflows/orchestrate-dev.js`** as a top-level constant… production code, not a test operand" | the constant belongs in `decisionLedgerCensus.test.js`; no module-surface section (§3/§4/§5) declares it, and §5.2's frozen-catalogue table lists only `OMIT_REASONS`, `CORPUS_OUTCOMES`, `NOTICES` |
| 4 | File-ownership manifest (PLAN:207, :219) | test-file row **disclaims** the third operand ("`DECISION_LEDGER_CENSUS_TOKENS` is **not** a test-file constant"); the `orchestrate-dev.js` row **claims** it for T-18, batch 8 | ownership is exactly inverted |
| 5 | §Definition of Done census bullet (PLAN:487–502) | "`DECISION_LEDGER_CENSUS_TOKENS` (**six**) ∪ `DECISION_LEDGER_CENSUS_EXEMPT` (**nine**) = `DECISION_LEDGER_OWNED_DECLS` (**fifteen**)… but `DECISION_LEDGER_CENSUS_TOKENS` is **production**, declared by T-18 — which is what makes its slice non-empty and its resolves-to-one conjunct satisfiable" | six ∪ eight = fourteen; the non-empty-slice / resolves-to-one conjuncts no longer apply to `CENSUS_TOKENS` at all |

The testing consequence, stated as the test that reds: T-11's companion assertion is an **exact set
equality**. Written to PLAN's fifteen-member owned list and nine-member exempt list, against an
implementation built to TSPEC v1.0 (where `CENSUS_TOKENS` is never declared in `orchestrate-dev.js`),
two conjuncts fail on conforming code — the partition equality (a fifteenth member that does not
exist) and §7.3's resolves-to-exactly-one-top-level-declaration conjunct for that member. This is
red-by-construction, the precise failure mode §7.3 exists to prevent, and it is not detectable by
the green gate because T-11 is committed skipped and un-skipped by T-18 in batch 8.

The second-order effect is on T-18's scope: T-18's `[green]` instruction currently orders an edit
to production `orchestrate-dev.js` that TSPEC v1.0 forbids. That instruction must be deleted, not
merely re-worded, and the batch-8 un-skip edge it justifies re-examined — with `CENSUS_TOKENS`
test-file-local, T-11's three operands are all resolvable at T-11's own landing, so the row's
stated reason for the un-skip-at-T-18 timing ("the two conjuncts that read the owned list against
HEAD are satisfied at **T-18's** landing, not before") is now only true of the *other* fourteen
owned members, not of `CENSUS_TOKENS`. That is a real, if narrower, justification; it needs
restating rather than deleting.

## Dependencies

**Upstream pins.** The PLAN header pins `TSPEC-pdlc-decision-ledger.md` **v0.9**
`sha256:eef45ef3…0623c8`. HEAD is v1.0 `sha256:b1b603a8…d31a0` (re-derived with `shasum -a 256`).
The other three pins are unchanged and correct at HEAD, re-measured in this round:

| Upstream | PLAN pin | HEAD | Status |
|---|---|---|---|
| REQ v1.9 | `ce6b133f…3c7b7c` | `ce6b133f…3c7b7c` | ✅ |
| FSPEC v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef…5aed39` | ✅ |
| TSPEC | **v0.9 `eef45ef3…0623c8`** | **v1.0 `b1b603a8…d31a0`** | ❌ stale |
| DECISIONS | `13aba061…4fb89a` | `13aba061…4fb89a` | ✅ |
| Baseline v1.2 | v1.2 | v1.2 | ✅ |

Five in-body citations additionally name the superseded version explicitly — "TSPEC **v0.9** §7.3"
at T-11 (twice: the `decisionLedger`-is-not-a-token clause and the scanned-source operand) and at
the §Definition of Done bullet (twice), plus "v0.9 §7.3 rewrote the census contract T-11
compresses" in the v0.6 revision history. A version-qualified citation that names a version whose
text no longer says what is being cited is the failure mode DEC-ERR-03 is written against; these
must move to v1.0 **together with** the substance, never the pin alone.

**Task-graph dependencies are unaffected.** I re-derived the batch column for every task touching
the census: T-11 (batch 2, deps T-00, T-01), T-18 (batch 8, deps include T-11), T-00a (batch 1),
T-10a, T-12a, T-19. `batch == max(dep batch) + 1` holds throughout, ids are unique, the graph is
acyclic, and no dependency edge changes under TSPEC v1.0 — the constant simply moves from T-18's
file to T-11's own file, and T-11 already owns that file. No same-batch same-new-file collision is
introduced or removed. **No batch, dependency or ownership edge needs to move**; the fix is
textual, confined to the five sites in §Batches above plus the header pin. That is worth stating
plainly so the revision does not over-reach into the settled task graph.

**One prior finding is resolved by upstream, not by the author.** My v7 F-01 (Medium) flagged
`DECISION_LEDGER_CENSUS_TOKENS` as a production declaration with **no production consumer** — a
dead-config export a DoD sweep could delete, re-opening the closed homeless-member defect. TSPEC
v1.0 removes the production declaration entirely, so that finding is moot at HEAD and must not be
carried forward into the revision. I raise no successor to it.

## Verification

What I did, so the next round can reproduce it:

1. Re-read my own prior round, `CROSS-REVIEW-test-engineer-PLAN-v7.md` — verdict *Approved with
   minor changes*, `{"high":0,"medium":1,"low":1}`, `REVIEWED-COMMIT: 5ffa27135`,
   `UPSTREAM-STATE: TSPEC sha256:eef45ef3…0623c8`.
2. `git log --oneline -- TSPEC…` → one commit since that approval: `452d72c07`
   *"erratum v1.0 — home the census constants, drop them from owned decls"*. Read its full diff
   (48 lines changed, +44/−4, §7.3 body + changelog only).
3. Confirmed PLAN's own bytes are unchanged since `5ffa27135` (no PLAN commit follows it).
4. `shasum -a 256` over all four upstream documents; compared against the PLAN header pin table and
   against the hashes carried in this dispatch. All four dispatch hashes reproduce.
5. Grepped PLAN for every occurrence of `CENSUS`, `OWNED_DECLS`, `§7.3` (40 matches) and read each
   in full — the five sites in §Batches are the complete set of contradicted loci.
6. Re-derived the partition arithmetic from TSPEC v1.0's own text rather than trusting either
   document's stated count: six tokens (`selectDecisions`, `recogniseDecisionRecords`,
   `renderDecisionLedgerBlock`, `gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`,
   `DECISION_LEDGER_CORPUS_OUTCOMES`) ∪ eight exempt (`parseDecisionLedgerConfig`,
   `buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`,
   `DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`,
   `DECISION_LEDGER_NOTICES`) = fourteen owned (six §4.1/§4.2/§4.4 functions + five constants +
   §5.2's three catalogues). **Fourteen, not fifteen** — independently derived, and it agrees with
   the erratum's own arithmetic.
7. Re-derived the batch column from declared dependency edges for every census-touching task; no
   desync, no cycle, no unresolved dependency (see §Dependencies).

**What the revision must do to earn approval.** Re-pin TSPEC to v1.0 `b1b603a8…d31a0`, then correct
the five sites to the v1.0 contract in one pass: all three census constants are test-file constants
of `decisionLedgerCensus.test.js`; six ∪ eight = fourteen; delete T-18's "add the frozen
`DECISION_LEDGER_CENSUS_TOKENS` declaration to `orchestrate-dev.js`" instruction and the manifest
row that claims it; invert the two file-ownership disclaimers; drop the quoted "token strings live
inside its own declaration" rationale, which upstream no longer contains; and restate T-11's
un-skip-at-T-18 justification over the fourteen *module* owned members. The v0.7 revision history
should record that the resolution it named "rejected" was subsequently adopted upstream — leaving
that paragraph as written would put the PLAN's own history in contradiction with its body.

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_

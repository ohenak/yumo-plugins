# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md`
**Date:** 2026-08-29
**Iteration:** 7 (delta re-review of v0.7 against v0.6)

## Overview

**Confirmation question:** does v0.7 land the one item v6 routed, and did it break anything already approved?

**Answer: the routed item landed, at all four sites, consistently, and nothing already approved moved.** My v6 F-01 (High) is closed. What remains is non-gating: one Medium about a production declaration with no production consumer, one Low about the census test's operand import direction, and one `ERRATUM: TSPEC` for the residual upstream gap the PLAN itself correctly declines to decide.

The v6 round reviewed `a2bad6db6`. Four commits have landed on the PLAN since:

| Commit | Subject |
|---|---|
| `b22b1c0a0` | name `orchestrate-dev.js` as `DECISION_LEDGER_CENSUS_TOKENS`'s home in T-11 |
| `9f1d6ede6` | complete T-18's `DECISION_LEDGER_CENSUS_TOKENS` instruction |
| `68317ce6e` | give `DECISION_LEDGER_CENSUS_TOKENS` a manifest owner |
| `5ffa27135` | align DoD census bullet and record v0.7 revision history |

The diff is 20 changed lines across five hunks and exactly the four sites v6 named, plus the version bump and revision-history paragraph: `T-11` (PLAN:152), `T-18` (PLAN:~161), the file-ownership manifest rows for `decisionLedgerCensus.test.js` (PLAN:207) and `orchestrate-dev.js` (PLAN:~219), and the §Definition of Done census bullet (PLAN:489–495). No `Batch` column, no `Depends on` column and no file-ownership assignment moved.

v6 offered the author two acceptable resolutions and named a third as unacceptable. The author took the second — keep the member, give it a production home — and said so explicitly, naming my proposed first resolution as **rejected** with a reason I accept: dropping the member would put the PLAN out of contract with the TSPEC it had just re-pinned, and would void §7.3's own stated reason for the exclusion. That is the right call, and it is the resolution the PLAN was already half-carrying in T-18's three-word fragment.

## Batches

### The routed item landed (v6 F-01 — closed)

v6's High said: the partition names fifteen owned declarations while the design declares fourteen, because `DECISION_LEDGER_CENSUS_TOKENS` had no home — no PLAN green task created it, and T-11's own opening cloned the precedent's *test-file* `ANCHOR_TOKENS`. Both of T-11's HEAD-reading conjuncts were therefore red on conforming code. v0.7 answers by giving the member a production home. Site by site:

| Site | HEAD text | Verdict |
|---|---|---|
| `T-11` (PLAN:152) | `CENSUS_TOKENS` "is itself **declared in `pdlc/workflows/orchestrate-dev.js` as a production top-level constant, written by T-18**"; "unlike the precedent's `ANCHOR_TOKENS`, which is test-file-local … and unlike this task's two test-file lists below"; the two HEAD-reading conjuncts "are therefore satisfied at **T-18's** landing, not before, which is the ordinary red-before-green edge rather than red-by-construction" | ✅ names the home, names the timing, and names why the timing is legal |
| `T-18` (PLAN:158) | the three-word fragment is now a full instruction: "**Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to `pdlc/workflows/orchestrate-dev.js`** as a top-level constant holding T-11's six token strings … it is production code, not a test operand, because TSPEC §7.3 makes it a member of `DECISION_LEDGER_OWNED_DECLS` precisely so that its own declaration is sliced out" | ✅ the implementer now has an executable instruction |
| File-ownership manifest, test file (PLAN:207) | "the third census operand, `DECISION_LEDGER_CENSUS_TOKENS`, is **not** a test-file constant — it is production, declared in `orchestrate-dev.js` by T-18, see the batch-8 row" | ✅ an explicit disclaimer, not silence |
| File-ownership manifest, module (PLAN:219) | T-18's row now claims "**and the `DECISION_LEDGER_CENSUS_TOKENS` declaration** — the one member of `DECISION_LEDGER_OWNED_DECLS` no earlier batch writes" | ✅ owner recorded where the gate reads it |
| §Definition of Done (PLAN:489–495) | "All fifteen owned members are declarations in `orchestrate-dev.js` written by a `[green]` task of batches 3–8; … `DECISION_LEDGER_CENSUS_TOKENS` is **production**, declared by T-18 — which is what makes its slice non-empty and its resolves-to-one conjunct satisfiable" | ✅ same contract, same words |

The counts are unchanged and still internally consistent: tokens **six** ∪ exempt **nine** = owned **fifteen**, disjoint. I re-checked the claim that carries the whole fix — *every* owned member has a `[green]` owner — mechanically, by grepping each of the fifteen names against the task table rather than trusting the prose:

| Member | Green owner | Member | Green owner |
|---|---|---|---|
| `parseDecisionLedgerConfig` | T-13 | `DECISION_LEDGER_PREAMBLE` | T-15 |
| `DECISION_LEDGER_DEFAULTS` | T-13 | `DECISION_LEDGER_RULE_TEXT` | T-15 |
| `DECISION_LEDGER_NOTICES` | T-13 | `renderDecisionLedgerBlock` | T-15 |
| `DECISION_CORPUS_ARGV` | T-14 | `selectDecisions` | T-16 |
| `DECISION_HEADING_RE` | T-14 | `DECISION_LEDGER_OMIT_REASONS` | T-16 |
| `recogniseDecisionRecords` | T-14 | `gatherDecisionCorpus` | T-17 |
| `buildDecisionLedgerInjector` | T-17 | `DECISION_LEDGER_CORPUS_OUTCOMES` | T-17 |
| `DECISION_LEDGER_CENSUS_TOKENS` | **T-18** | | |

Fifteen members, fifteen owners, all in batches 3–8, no member owned twice and none homeless. v6's High is closed on its own terms.

### The red-before-green edge is real, not asserted

The fix only works if T-11 stays skipped until T-18 lands. I checked the columns rather than the sentence: T-11 is `[red]`, batch 2, `Depends on` T-00, T-01; T-18 is `[green]`, batch 8, `Depends on` T-10, T-10a, T-11, T-17, and its row ends "Un-skips T-10, T-10a and T-11." So the un-skip edge is declared in the dependency column, not only in prose, and the batch column re-derives (`max(dep batch) + 1` with T-17 at 7 → 8). This is the same red-before-green shape T-10/T-10a already use and which earlier rounds approved.

### One thing the fix creates, which the PLAN does not name (F-01, Medium)

`DECISION_LEDGER_CENSUS_TOKENS` is now a production top-level constant of `orchestrate-dev.js` whose only consumer is a test — T-11's `decisionLedgerCensus.test.js`. Nothing in the production module reads it: it exists so that its own declaration is a sliceable region, i.e. its purpose is to be *removed* from the census's scanned source. I grounded the "no production consumer" reading in the module's shape: `orchestrate-dev.js` exports inline (`export const` / `export function`, `pdlc/workflows/orchestrate-dev.js:48`, `:52`, `:88`, `:106`) with no trailing `export { … }` block, so a declaration that no other production site references is genuinely dead outside tests, and there is no export-surface or unused-export guard in `pdlc/workflows/__tests__/` that would notice.

This is not a High. It does not red anything, the six literals are pinned (below), and the choice is TSPEC §7.3's, not the PLAN's. But it is the dead-config shape my lens flags at Medium: a frozen constant introduced in production with no production caller. The cheap fix is one clause in T-18 saying so deliberately — that the constant is production *solely* to be sliced, that its only importer is the census test, and that this is intended rather than an unwired integration — so that a DoD sweep reading the diff does not file it as an unwired artifact and "fix" it by deleting it, which would silently re-open the exact failure v0.7 just closed.

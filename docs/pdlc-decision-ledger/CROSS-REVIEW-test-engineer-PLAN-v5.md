# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-29
**Iteration:** 5 (delta re-review of v0.5 against my v4)

## Overview

**Confirmation question:** did v0.5 land the item v4 routed, and did it break anything approved?

**Answer: the routed item landed cleanly — and the same round left the document grounded on a
TSPEC that has since been superseded, in the one task that derives from the superseded section.**

My v4 round reviewed `36cd34d4d`. Two commits have landed on the PLAN since:

| Commit | Time | Subject |
|---|---|---|
| `4950ea00c` | 08:50 | PLAN v0.5 operator pass — land erratum items, RESOLVED: yes |
| `a408375a6` | 08:51 | name T-19's terminal `102` control in the file-ownership manifest |

The whole diff is 19 insertions / 12 deletions across seven sites: the header upstream pin, the
revision-history paragraph, `T-00a`, `T-12a`, `T-11`, `T-19`, the file-ownership manifest row for
`documentOracles.test.js`, and two §Definition of Done bullets. Every v4 finding is closed. The
new material is correct on its own terms.

The problem is what happened *around* the edit. `TSPEC-pdlc-decision-ledger.md` advanced from
**v0.8 to v0.9** at 08:44 — six minutes before the PLAN v0.5 commit — and **§7.3 is one of the
five sections v0.9 rewrote**. §7.3 is the section `T-11` is derived from, cited by, and re-pointed
*to* by this very round. v0.5 re-pointed the citation from §5.5 to §7.3 (correctly, closing my
v4 F-02) without re-reading what §7.3 now says. What it now says is that `T-11`'s specified test,
as written in the PLAN, is red on a conforming implementation.

That is a High: the PLAN currently instructs an implementer to write a `[red]` test that can
never go green, and `T-11` is a batch-2 blocker for `T-18`.

## Batches

### The routed item landed — v4 F-01 is closed

v4's High was that no task id owned the terminal `102` count assertion: `T-00a`'s second
acceptance conjunct was quantified over a world state that does not exist at batch 1, and `T-12a`
explicitly disclaimed the count. v0.5 takes shape (2) from my v4 write-up and executes it at four
sites, consistently:

| Site | HEAD text | Verdict |
|---|---|---|
| `T-00a` (line 120) | "Acceptance is **one-sided and evaluable at batch 1**: the exclusion lands and the pre-existing suite is green at `102`." Terminal re-check "is **owned by T-19** (batch 9, the first point at which it is evaluable)" | ✅ evaluable when the task is accepted |
| `T-12a` (line 125) | its namespace census is narrowed to "a **set census** (set equality against the twelve names, not a count)"; the count is handed to T-19 by name | ✅ disclaimer now points at a real owner |
| `T-19` (line 141) | "**Terminal `102` positive control (T-00a's deferred conjunct, owned here):** with all twelve `decisionLedger*` modules on disk, `documentOracles.test.js`'s `*.test.js` census still counts `102`" | ✅ the assertion has an owner |
| file-ownership manifest | `documentOracles.test.js` → `T-19 | 9 (un-skip; also the terminal 102 positive control)` | ✅ traceable from the manifest, not only the prose |
| §Definition of Done | excludes the namespace "(landed by T-00a at batch 1) and still counts `102` with all twelve modules on disk (the terminal positive control, owned by T-19)" | ✅ both halves credited separately |

Batch consistency re-derived: all twelve `decisionLedger*` modules exist from batch 2 (three in
batch 1, nine in batch 2), so T-19 at batch 9 satisfies the "batch ≥ where the twelfth module
lands" constraint with room. The count is evaluable when T-19 is accepted, and it cannot red
mid-feature. Exactly what I asked for.

### F-01 (High, new) — T-11 is specified against TSPEC v0.8 §7.3, which v0.9 replaced

TSPEC v0.9's changelog (`TSPEC-pdlc-decision-ledger.md:26`) opens:

> **TE F-01 (High) — §7.3's census could not go green on a conforming implementation.** Its scanned
> source excluded three function bodies plus the wiring block, leaving `gatherDecisionCorpus`
> (§4.4's sixth function), §5.2's three frozen catalogues, and every intra-feature mention of a
> token inside a sibling declaration in the scanned remainder: **four of the six tokens would have
> occurred there on correct code.**

"Excluded three function bodies plus the wiring block" is a verbatim description of what `T-11`
still instructs (PLAN:134):

> The census's second operand: `orchestrate-dev.js`'s source **minus** four owned regions — three
> sliced by brace-matching from their declarations (`parseDecisionLedgerConfig`,
> `buildDecisionLedgerInjector`, and the
> `selectDecisions`/`recogniseDecisionRecords`/`renderDecisionLedgerBlock` group) and the `main()`
> wiring run bounded by the literal sentinels.

Under that slicing rule, `gatherDecisionCorpus`'s own declaration body is never excluded, so its
name occurs in the scanned remainder — and `gatherDecisionCorpus` is a census token. Same for
`DECISION_LEDGER_OMIT_REASONS` and `DECISION_LEDGER_CORPUS_OUTCOMES`, §5.2's catalogues, whose
declarations are not among the three sliced regions. The task as written produces a test that is
**red by construction on a correct implementation** — the strongest form of the "a test that can
only fail is not yet a test" defect, and it sits on a `[red]` row that batch-2 `T-18` depends on.

TSPEC v0.9 §7.3 (line 1297) repairs this generally rather than by another exception: the scanned
source is now the module minus **the body of every declaration this feature introduces**, a new
frozen list `DECISION_LEDGER_OWNED_DECLS` (§4.1/§4.2/§4.4's six functions plus every top-level
constant — `DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`,
`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, §5.2's three catalogues, and
`DECISION_LEDGER_CENSUS_TOKENS` itself), sliced `bodyOf`-style over **all** top-level declarations,
plus the sentinel-bounded wiring run. None of `DECISION_LEDGER_OWNED_DECLS` appears anywhere in the
PLAN (`grep -n "OWNED_DECLS" PLAN` → no match).

Second divergence in the same row. `T-11` holds the token set

> to **set equality** against the module's exported decision-ledger symbol names so a later symbol
> cannot escape by omission

TSPEC v0.9 §7.3:1296 explicitly repudiates that comparison —

> Not set equality against *all* of the module's decision-ledger exports — **that comparison is red
> by construction**, since §3.1/§4.1/§4.2/§4.4/§5.2 declare roughly a dozen and only these six are
> data-carrying.

— and replaces it with a **partition** assertion: `DECISION_LEDGER_CENSUS_TOKENS ∪
DECISION_LEDGER_CENSUS_EXEMPT = DECISION_LEDGER_OWNED_DECLS`, the two sub-sets disjoint, with
`DECISION_LEDGER_CENSUS_EXEMPT` enumerated member-by-member with reasons. `grep -n
"CENSUS_EXEMPT" PLAN` → no match. So `T-11`'s companion oracle is the one v0.9 names as red-by-
construction, and the completeness guarantee the PLAN claims from it ("a later symbol cannot escape
by omission") is now delivered by a mechanism the PLAN does not describe.

Note this is a real loss of coverage, not just a citation nit: v0.9's partition is the set-equality
that makes a *newly added* symbol force a classification decision. Dropping it for an
exports-based equality that cannot go green means, in practice, the implementer will weaken or
delete the companion assertion to get to green — and nothing in the PLAN will notice.

**What the revision must state.** Re-ground `T-11` on TSPEC v0.9 §7.3: name
`DECISION_LEDGER_OWNED_DECLS` as the frozen owned-declaration list and the slicing basis (every
owned declaration, boundaries from *all* top-level declarations, the `bodyOf`/`allTopLevelDecls`
precedent already cited); name `DECISION_LEDGER_CENSUS_EXEMPT`; state the companion assertion as
the union-equals-`OWNED_DECLS` partition with disjointness, replacing the exports set-equality;
keep the existing non-empty-slice conjunct (v0.9 keeps it, PLAN:134 already has it) and the
"each member resolves to exactly one top-level declaration" red-on-rename conjunct v0.9 adds. The
six token members are unchanged between v0.8 and v0.9 (v0.9:1296 lists the same six), and the
`decisionLedger`-is-not-a-token rationale survives verbatim (v0.9:1321–1330) — so this is a
scanned-source and companion-oracle edit, not a re-write of the row.

Whether `T-11`'s owned test file also needs a new frozen-list task in batch 1 is the author's
call; `DECISION_LEDGER_OWNED_DECLS` and `DECISION_LEDGER_CENSUS_EXEMPT` are production constants
in `orchestrate-dev.js` under v0.9's reading, so `T-00`/`T-01`'s dependency edge may already cover
them. I flag only that the PLAN must say which task declares them.

### Nothing else in the changed rows moved

`T-19`'s re-pinning budget paragraph, `T-12a`'s derived-not-transcribed set-equality assertions and
its `~:625` confinement conjunct, and `T-00a`'s complement-pin explanation are all byte-identical to
the version I approved structurally at v3. Batch columns for the five touched rows are unchanged
(`T-00a` 1, `T-11` 2, `T-12a` 2, `T-19` 9), dependency edges unchanged, `[red]`/`[green]` labels
unchanged, owned test files unchanged. No new file is introduced into any batch, so the same-batch
same-new-file guard is undisturbed.

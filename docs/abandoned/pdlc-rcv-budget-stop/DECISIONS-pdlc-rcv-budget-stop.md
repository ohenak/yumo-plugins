---
Status: Draft
Author: se-author
Version: 1.0
Feature: pdlc-rcv-budget-stop
---

| Field | Value |
|---|---|
| Upstream | REQ v3.1 → FSPEC v1.3 → TSPEC v1.0 → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Scope | Architectural decisions settled during TSPEC authoring: in-module placement of the region code, the new `_statFile` seam, the one-update rule for clauses 1 and 2, and the width-reachability / report-row-carrier pair |
| Cross-Reviews | — |
| LEARNINGS | docs/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md |

# DECISIONS — pdlc-rcv-budget-stop

Four load-bearing alternatives were weighed and rejected during TSPEC authoring (TSPEC §11.2).
Each is a decision a future agent will otherwise confidently reconsider; the "do" is in the TSPEC
and code, this document preserves the "didn't do, and why."

---

## DEC-BUD-01: Region parser/writer live inside `orchestrate-dev.js`, not in `lib/`

**Context:** The feature adds a region parser, a region writer and a clearance gate — pure logic
of exactly the shape this repo already ships in `pdlc/workflows/lib/document-oracles.mjs`. A
reader coming from that precedent will propose `pdlc/workflows/lib/reset-region.mjs`.

**Decision:** All pipeline-executed symbols are **module-scope functions in
`pdlc/workflows/orchestrate-dev.js`**, grouped into a pure read-model cluster and a pure
write-model cluster (TSPEC §3.1), exported for direct test import.

**Alternative considered — a `lib/reset-region.mjs` module:** Rejected as **not viable**:
`build-runtime.mjs` inlines exactly three named sources (`build-runtime.mjs:83`–`:85`) and
`import` does not exist in the workflow runtime (TSPEC C-1, C-2), so a `lib/` module is invisible
to the shipped pipeline — the runtime would throw on the first call. Adding a fourth inlined
source is a change to the distribution mechanism, owned by the `pdlc-workflow-distribution` line
of work, with its own manifest row, freshness gate and sync semantics. The pure/impure separation
the split would have bought is bought instead by the in-module pure clusters, which take no seam.

**Constraints that forced this shape:** The runtime-build constraint C-1 is binding, not a
preference. `document-oracles.mjs` is precedent for repo scanners (never runtime-loaded), which is
why §8's `budget-sites.mjs` **does** go to `lib/` — it is a scanner, not pipeline code.

**Reversibility:** Hard — reversing it means changing the distribution mechanism.
**Re-evaluation trigger:** the day `build-runtime.mjs` gains a general module-inlining step, at
which point the pure clusters move to `lib/` unchanged.

---

## DEC-BUD-02: A new `_statFile` seam discriminates creating from existing halts

**Context:** FSPEC §7.2's discriminator between a *creating* and an *existing* halt is file
presence, and §7.4 fixes the safe rule: when the discriminator cannot be evaluated, take the
**existing** path. The module already has two file-probing seams.

**Decision:** A **new seam `_statFile(path) → {exists:true}|{exists:false}|{unevaluable:true}`**
(TSPEC §5.2), whose default answers `absent` on exactly one errno (`ENOENT`) and `unevaluable` on
every other failure.

**Alternatives considered:**

- **Reuse `_readFile`:** returns `null` for absent **and** unreadable, so an unreadable
  post-mortem would read as absent and be re-authored over — erasing a live region and the
  operator's `## Recommendation`. This is the harm FSPEC §7.2 exists to prevent.
- **Reuse `_checkFile`:** collapses an IO fault into `{ok:false, reason:"file_missing"}`
  (`orchestrate-dev.js:377`–`:379`) — the same conflation under a different name.

**Constraints that forced this shape:** FSPEC §7.4's safe rule needs a third answer,
`unevaluable`, which neither shipped seam can express.

**Reversibility:** Easy — local to one function and one seam-table row.
**Re-evaluation trigger:** none known; a false `absent` for a present file is declared out of
scope (FSPEC §7.2, TSPEC ND-1).

---

## DEC-BUD-03: Clauses 1 and 2 are one read-modify-whole-file-write

**Context:** AC-1.4's halt path must append this halt's `HALT-REASON:` line (clause 1) and strip
every unfenced `RESOLVED:` line (clause 2). `_appendFile` exists (`orchestrate-dev.js:4235`) and
is the shape `appendApprovalAnchors` already uses.

**Decision:** Clauses 1 and 2 are **one pure transform producing one write**
(`applyHaltUpdate`, TSPEC §4.3), confirmed by two content conjuncts against a single read-back:
this halt's line present in the region and `H` incremented, and no unfenced `RESOLVED:` line
anywhere in the file.

**Alternative considered — two ordered writes with `_appendFile`:** Cheaper and precedented.
Rejected: a separately losable strip leaves a readable `RESOLVED: yes` beside an incremented `H`,
which the clearance gate reads as an unconsumed clearance — re-granting a window on every later
halt while the fault lasts, the fail-open AC-1.1 abolishes (split §5.8). An append also cannot
express the strip at all.

**Constraints that forced this shape:** AC-1.4's one-update rule is normative: "no reachable
state in which this halt's line is present and an unfenced `RESOLVED:` line survives" must be true
by construction, not by ordering luck.

**Reversibility:** Easy — local to one function.
**Re-evaluation trigger:** a runtime atomic multi-write primitive would not change the decision;
only a change to AC-1.4 itself would.

---

## DEC-BUD-04: Width reachability by export; report rows on a new `reviewRows` field

**Context:** (a) AC-1.2 requires exactly one hand-maintained executable declaration of the budget,
repo-wide, while AC-1.3 requires tests asserted over the constant — today the constant is
unexported and two test suites keep their own copies. (b) Catalogue §3 requires a fixed-column
report row (rows B and C) that two later features extend cell by cell.

**Decision:** (a) `orchestrate-dev.js:52` becomes `export const MAX_REVIEW_ROUNDS = 3;` —
feasible because `stripModuleSyntax` removes the `export ` prefix, so the bundle is byte-identical
in effect (TSPEC C-3, §8.1). (b) The final report gains a **new `reviewRows` field** carrying
catalogue §3's schema (TSPEC §4.4), `[]` on every run producing neither row.

**Alternatives considered:**

- **Keep two width copies with a cross-check test:** a third hand-maintained site that can itself
  be forgotten; the failure it guards against is a **green** suite asserting the old width while
  the pipeline runs the new one — the defect moved into the oracle.
- **`process.env` or a config file for the width:** neither exists in the workflow runtime (C-2).
- **Carry rows in `notices` or a phase-row `detail` string:** existing oracles pin `detail`
  values verbatim (`orchestrate-dev.js:4384`), and catalogue §3 needs a schema two later features
  must extend without re-parsing prose.

**Reversibility:** Easy — each is local to one declaration or one report field.
**Re-evaluation triggers:** the bundle's `wrapModule` export list is deliberately **not**
extended (the runtime never needs the value); reconsider only if a runtime consumer appears.

# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.11)
**Date:** 2026-08-20
**Iteration:** 2

Delta re-review. Base for the diff is `3604d465` (the v1.10 closing-pass commit my v1 review read);
the changed sections are the header block, the v1.10 note's item 1, the new v1.11 note, `## Context`
constraints 1–2, DEC-01's option B and D rows, DEC-A6-01's ignored-path and reversibility passages,
DEC-A6-02's decision sentence, DEC-A6-03's routing paragraph, and four `## Consequences` bullets.
Unchanged sections are not re-litigated.

## Prior Findings — Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | Context constraint 1 re-grounded on the shipping channel |
| F-02 | Medium | **Resolved** | Per-promoted-task cardinality now stated in the decision sentence, the option-C row and the Consequences bullet |
| F-03 | Medium | **Resolved** | The transport constraint now cites TSPEC §1.2 and says plainly that no requirement closes the set |
| F-04 | Low | **Resolved** | Provenance cell names the harvested rounds rather than enumerating dead files |

### F-01 (High) — resolved, and re-grounded on a channel that exists

The replacement bullet ("The shipping channel vendors a fixed list of module files") is accurate in
every clause I could check at HEAD:

- `pdlc/engine/scripts/prepack.mjs:20` is verbatim `const MODULE_NAMES = ["orchestrate-dev.js",
  "orchestrate-queue.js"];`, and `:39` maps it into the copy step, as the bullet says.
- The three-list claim holds: `MODULE_NAMES` (`prepack.mjs:20`), `WORKFLOW_MEMBERS`
  (`pdlc/engine/scripts/publish-preflight.mjs:220`, three `vendor/workflows/…` members feeding
  `expectedPackedSet`'s member-for-member set at `:239`), `WORKFLOW_MODULE_NAMES`
  (`pdlc/engine/scripts/fixture-machine.mjs:426`, consumed at `:449`). A file added beside
  `orchestrate-dev.js` is invisible to the published package until all three are edited — the
  bullet's count is right and each list is a real hardcoded literal, not a glob.
- The retired premises are named as retired, correctly: `build-runtime.mjs`'s header records the
  three per-module bundles as retired with the workflow runtime and says the builder "now emits a
  single artifact: `pdlc-cli.mjs`", and the consumer copy is swept —
  `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`'s `EXPECTED_ENTRIES` carries
  `orchestrate-dev.bundle.js` as a *deletion* entry, not a sync target.

The change I care about most as a PM is the one the author made without being asked: "add a module"
stops being an impossibility claim and is re-rejected **on merit**. That is the honest shape. The
merit argument is checkable too — `buildA4SeamOps` (`orchestrate-dev.js:2784`), `buildA5SeamOps`
(`:2909`) and `buildA6SeamOps` (`:3063`) are genuinely co-located, so "splitting it out would buy
nothing while paying the three-list edit" is a cost comparison against the tree rather than an
intuition. Option-space pruning is now auditable, which is what the finding asked for.

The v1.10 note's item 1 is marked *superseded* in place rather than rewritten, with the reason
retained. That is the right call for a decision record: the round's actual reasoning stays legible.

### F-02, F-03, F-04 — resolved

- **F-02.** The decision sentence, DEC-02's chosen option C row and the Consequences bullet all now
  say **per promoted task**. The shipped shape matches: `orchestrate-dev.js:15471` is
  `for (const promo of waveResolvedPromotions)` with one `commitPaths` call per iteration
  (`:15472`), the message template carrying `${promo.taskId}` (`:15474`), and
  `waveResolvedPromotions` is the return of `groupPromotedPaths` (`:3329`, assigned at `:15403`).
  The Consequences bullet's "Kinds, not counts" gloss is the sentence an operator reading `git log`
  needed.
- **F-03.** The bullet now cites the clause that actually closes the set — TSPEC §1.2, line 301,
  quoted accurately ("No new module, no new file, no new transport, no new credential (NFR-3)") —
  states NFR-3's narrower content, and then says the thing I most wanted said: "no requirement
  closes the transport set; TSPEC's design envelope does, and this feature adopts it as an
  engineering constraint." Pruning stays honest.
- **F-04.** The cell names the harvest (`9cf48051`, "docs(learnings): delete harvested cross-reviews
  and DoD code reviews" — the commit exists with that subject) and states the numbering restart. The
  adopted convention (index rounds *responded to*; name harvested rounds as harvested) is better
  than the enumeration I asked for, because it does not rot again on the next harvest.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

Delta re-review. Base for the diff is `113492625` (the commit carrying my v1
cross-review); the document moved across seven commits, `83c1e2c9c` → `90cc02fe9`,
+82/−21 lines. I re-read my v1 findings first, diffed the document, verified every
*new* factual claim against the tree at HEAD, and scanned only the changed sections
for new issues. Sections untouched by the revision were approved in v1 and are not
re-litigated — with the one exception the delta itself forced me back into, recorded
as F-01.

## Prior findings — disposition

| v1 finding | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — carve-out claims to be "that amendment's single site" while the helper's co-change rule demands two sibling-document edits it does not own | High | **Resolved** | The paragraph now separates *justification* from *execution* and hands the edits to a new `K-7` row with an owning PLAN task. It no longer claims to override the rule; it claims to comply, spec-first |
| F-02 — Option D's evidence sentence said `document-oracles.mjs` sits in `c8.include` | Medium | **Resolved, and correctly** | The corrected sentence says it appears in no vendoring enumeration **and no coverage include set**. Verified: `c8.include` holds seven entries and `document-oracles.mjs` is not among them |
| F-03 — the unenforceable second-construction-site risk was not among Standing costs accepted | Medium | **Resolved** | New `### Residuals — obligations with no oracle at HEAD` table; K-4 gains a construction-site count conjunct routed to TSPEC §6.4 as an erratum |
| F-04 — re-evaluation trigger not checkable or directional | Low | **Resolved** | Trigger now names a detector (`MODULE_NAMES.length` exceeding five) and enumerates the six lists still literally transcribed |

All four are closed. The revision did the work asked of it, and did it by verifying
against the tree rather than by softening the claims — F-02 in particular was
corrected *upward* in strength, which is the right instinct.

## Verification Performed

Every claim the revision newly introduces, checked against HEAD:

| New claim | Where | Verified |
|---|---|---|
| `document-oracles.mjs` is in none of the four vendoring enumerations **and** in no coverage include set | Option D | Confirmed — `c8.include` is seven `**/`-anchored entries, none of them `document-oracles.mjs` |
| The completed sibling's PLAN file-state table records the same state | Option D | Confirmed — `docs/completed/pdlc-engineering-loop/PLAN-pdlc-engineering-loop.md:64` says `lib/document-oracles.mjs` is **not** in the include list |
| Runtime-reachable `lib/` members at HEAD are `loop-session.mjs` and `escalation-view.mjs`, exactly the two `lib/` entries in `MODULE_NAMES`; `stats.mjs` is the third; detector is `MODULE_NAMES.length` exceeding five | DEC-STATS-01 trigger | Confirmed — `prepack.mjs:20-25` holds exactly four entries, two of them `lib/`. Four at HEAD, five after this feature, six on the trigger. Arithmetic is right and the trigger is now directional |
| c8 opens only what `include` matches; `all` is not set | Option table row A, K-3 | Confirmed — the `c8` block declares no `all` key |
| The P9-02 test asserts `c8.include` set-equal to a transcribed literal in both directions | K-3 | Confirmed — `coverageInstrumentation.test.js:264` uses `toEqual` against a fully transcribed array, so a deleted entry reds as loudly as a missing one |
| `bin-guard-structure.test.js` pins `bin/pdlc.mjs` with zero static imports, exactly three top-level statements, zero `await` tokens | K-4 | Confirmed — that is verbatim the file's stated three-conjunct contract, and it is a positive structural count over source, exactly the precedent K-4 claims |
| The sibling's 0.15 changelog row records a versioned co-change amendment adding `PK-24`/`PK-25`, correcting the note three → five, moving the derived total, amending FSPEC §5.2 in the same change, touching no other row | K-7 | Confirmed — matches `docs/completed/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md:32` point for point, including the "No other `PK-*` row, class, or oracle is touched" clause |
| FSPEC §5.2's "Workflow members" per-class count reads five at HEAD | K-7 | Confirmed — `FSPEC-pdlc-engine-distribution.md:583` reads "**five vendored workflow members**", so `five → six` is the right edit |

Eight for eight. The document's standing promise — *"Every cost below was measured
against the tree at HEAD, not estimated"* — held for every claim the revision added.
It did not hold for something the revision did not add, and that is F-01.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Cross-Feature | **A sixth co-change site is missing from the option-A cost table, and it is the one that goes red.** The table under *"Option A's five sites, and what they contain"* names five files. A sixth exists at HEAD: `pdlc/engine/__tests__/loop-distribution.test.js`, four live (un-`skip`ped) tests, which pins **four of those same five sites with exact-length assertions**. Its `assertAdditiveOnly` helper (`loop-distribution.test.js:66-79`) ends in `assert.equal(actual.length, baseline.length + added.length, ...)` — a set-size equality, not containment — and `loop-distribution.test.js:135` applies it to `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` and `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`. Adding `lib/stats.mjs` to any of them makes `actual.length` exceed `baseline.length + added.length` and reds that conjunct. The same test also hard-pins the count K-2 exists to move: `assert.equal(packedSetNs.tspecPackedCount({ licence: false }), 4 + 15 + 5 + 1, "…vendored class size must be 5")` (`loop-distribution.test.js:159-163`), and again at `loop-distribution.test.js:205-208`. So the feature cannot do the thing DEC-STATS-01 chooses without editing a file no K-row owns. This matters three ways on the product lens. (1) The cost table's headline for the chosen option — *"five edit sites"* — is understated against a table whose section promises measurement at HEAD; the count is at least six. (2) PLAN derives its task set from the K-table, and an unowned required edit means the wave lands a red `Engine tests (ubuntu-latest)` — a required check per this repo's CI table — which is a shipping-blocking outcome discovered at the gate rather than at planning. (3) K-1's *falsifier* column, rewritten this round, now makes a positive claim about which oracles assert these sites and names only TSPEC §6.4's vendoring oracle and the fixture machine's install leg; the oracle that will actually fire first is unnamed, so a reader debugging the red check is sent to the wrong place. Note the file is `Cross-Feature`: it is the completed `pdlc-engineering-loop`'s enforcement of exactly this class of co-change, so any future `lib/` member hits it too. **Fix:** add the sixth row to the site table, give it an owning `K-*` obligation (or extend K-1's set from four to five plus this file), correct the option-A cell from "five edit sites" to six, and name `loop-distribution.test.js` in K-1's falsifier column as the conjunct that reds first. | REQ O-2, REQ C-5 |
| F-02 | High | Local | **The third residual asserts the absence of an oracle that exists at HEAD, and dispositions it "Accepted" on that basis.** The new Residuals table's third row states that K-7's sibling-document edits *"have no mechanical falsifier: `_tspec-packed-set.mjs` and the packed tarball can agree while `docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 and FSPEC §5.2 stay at five"*, with the reason *"nothing compares a shipped enumeration to a completed feature's prose table"* and the disposition *"Accepted. Building that oracle is a repo-wide mechanism, not this feature's scope."* That oracle was already built, by the sibling feature, and is live: `loop-distribution.test.js:182` — *"P7-02: docs/completed/pdlc-engine-distribution/ TSPEC §5.4, FSPEC §5.2 and AT-3.8b agree with tspecPackedCount's vendored class size"* — derives `vendoredClassSize` from `tspecPackedCount` **at test time** (`loop-distribution.test.js:186`) and `assert.match`es both documents against it. Its own header comment states the intent verbatim: *"derived from the live constant, never compared against a literal transcribed here."* The sibling's PLAN says the same in prose: `docs/completed/pdlc-engineering-loop/PLAN-pdlc-engineering-loop.md:271` records that the open window *"is now closed by an oracle, not by argument"*. This is good news for the design — K-7's document half **is** mechanically gated, and the residual should be struck rather than accepted — but the record as written tells PLAN and the DoD reviewer to carry a risk that is already closed, which is precisely the inverse of the residuals section's stated purpose. There is a sharp consequence hiding under it, which is why this is High and not Medium: the oracle's word mapping is `vendoredClassSize === 5 ? "five" : String(vendoredClassSize)` (`loop-distribution.test.js:187`), so at 6 it searches for the **digit** `6` — `names the vendored 6` and `**6 vendored workflow members**` — while K-7 prescribes editing the sibling documents to read *"six"* in words. K-7's edit as currently specified therefore leaves P7-02 red. **Fix:** replace the residual's "no mechanical falsifier / Accepted" content with a pointer to P7-02 as the falsifier, and extend K-7's prescribed edit to include P7-02's word mapping so the derived word and the document text agree at 6. | REQ C-5 |
| F-03 | Low | Local | K-7 says the two sibling-document edits land *"in the same change as `_tspec-packed-set.mjs`"* and calls this *"the same route"* the 0.15 amendment used, *"exactly as that document's 0.15 row records"*. The precedent actually decoupled the two halves: that row closes with *"`tspecPackedCount`'s vendored-class literal moves separately, in a later task, per this feature's own TSPEC §7 D-3"*, and `PLAN-pdlc-engineering-loop.md:271` puts the spec edit in batch 1 while `tspecPackedCount` moves in P7-02 at batch 10. K-7's tighter bundling is defensible and arguably better — it is what the header rule's "in one change" literally asks — but it is not what the cited row records, and the citation is doing evidentiary work ("precedented rather than novel"). Either soften to "the same versioned route, bundled more tightly than 0.15 did" or drop the "exactly as" clause. | REQ O-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01/F-02: once `loop-distribution.test.js` is edited, is the intent that its baselines grow (`NEW_LIB_MEMBERS_*` gaining `stats.mjs`, so it keeps asserting exact-set additivity over a three-member delta), or that the additive-only conjuncts are re-derived so a future `lib/` member does not re-open this? The first keeps the oracle strict and costs a line per future member; the second is the "derive rather than transcribe" move DEC-STATS-01's own re-evaluation trigger contemplates, and this feature is the third member that trigger counts. Naming which, in K-1 or the trigger, would stop the next feature re-deciding it. |
| Q-02 | Q-02 from v1 is still open and unaddressed by the revision: is the refusal document's `schemaVersion` presence part of REQ R-5's consumer-stability promise, or an FSPEC-level convenience? The answer decides whether a future change to the refusal shape is a contract break. Not gating — DEC-STATS-02 traces cleanly to FSPEC BR-30 either way — but it is the kind of thing that is cheap now and expensive after a consumer ships. |

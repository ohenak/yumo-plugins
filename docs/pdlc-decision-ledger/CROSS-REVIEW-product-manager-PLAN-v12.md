# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v1.0, re-grounded on REQ v1.10 / FSPEC v1.4 / TSPEC v1.3 / DECISIONS v1.6)
**Date:** 2026-08-31
**Iteration:** 12 (delta confirmation, frozen round)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Overview

The delta since the commit I last reviewed (`78981215`) is `9 insertions(+), 7 deletions(-)` across three loci, and it is **two different rounds landing in one diff**, which matters for what follows:

1. **The v1.0 re-grounding pass** (commits `f47c47009`, `521aa6681`) — the header pin row (`:9`) advances all four upstream pins, the status row (`:17`) reads `1.0 | 2026-08-31`, and a new v1.0 revision-history paragraph is prepended above the preserved v0.9 entry (`:19`).
2. **An implementation commit** (`724116d75`, *"T-19 un-skip decisionLedger disclosure PROPERTIES tests"*) that flipped four task rows' Status cells from `⬚` to `✅` — T-00 (`:149`), T-12 (`:154`), T-12a (`:155`), T-19 (`:171`). Its own message says *"Marks T-12/T-12a/T-19 done in the PLAN."*

**The re-grounding half is clean and I confirmed it mechanically.** All four re-pinned hashes match `shasum -a 256` at HEAD, the version labels match each upstream's status row, and the immateriality claim ("no measured value moves") holds where I sampled it. Details in §Verification.

**The status half does not hold up against the repository.** Three of the four flips are true; T-12a's is not, and T-19's is true only in substance, not at the locus this PLAN names. `pdlc/workflows/__tests__/documentOracles.test.js` — the file T-12a's Test File column and the red-before-green table both name as the home of the `decisionLedger` disclosure oracle — carries **zero** `DECISION_LEDGER_*` references at HEAD (`grep -c` returns `0`; the only two `decisionLedger` hits are the census-exclusion comment at `:412` and the filter at `:424`). The disclosure family actually landed in `pdlc/workflows/__tests__/decisionLedgerConfig.test.js:375–449`, where five `T-19: …` blocks assert exactly what T-12a specifies and pass (45/45 green when I ran the module). The coverage exists; the PLAN's claim about *where* it exists is false, and a `✅` on that row now asserts it as a fact about HEAD.

That is the one blocking item, and it is small to fix: re-point T-12a's Test File column and the red-before-green row at `decisionLedgerConfig.test.js` (the substitution the implementer's own comment block at `:354–368` argues for — the swept-surface orphan-freedom oracle rejects a committed planned-work `test.skip` in `documentOracles.test.js`), or drop the `✅` until the family lands where the row says. I have not made either edit; the choice is the author's.

No requirement was dropped, no acceptance criterion narrowed, and no scope was added in this round.

## Batches

**No batch, ownership, task-id or count assignment moved.** The task table's substantive columns are byte-identical to the set I approved at v10 and re-confirmed at v11; the only cells that changed are four Status cells. I re-read each flipped row against HEAD rather than against its own text:

| Row | Flipped to | What HEAD shows | Verdict |
|---|---|---|---|
| T-00 (`:149`) | `✅` | `pdlc/workflows/__tests__/decisionLedgerPreflight.test.js` exists and asserts exactly the nine named symbols (eight from `orchestrate-dev.js` plus `runCaptureScript`), existence only, un-skipped | true |
| T-12 (`:154`) | `✅` | `pdlc/engine/__tests__/decision-ledger-config-example.test.js` exists, un-skipped, `node --test` reports `pass 3 / fail 0`; `.claude/pdlc.config.example.json` carries `"decisionLedger":{"enabled":false,"maxEntries":70,"maxBytes":12500}` — C-5's three keys, set-equal, hand-transcribed | true |
| T-12a (`:155`) | `✅` | The named test file `documentOracles.test.js` has **no** `decisionLedger` disclosure family (zero `DECISION_LEDGER_OMIT_REASONS` / `_NOTICES` / `_DEFAULTS` references; `:412`/`:424` are census-exclusion only). The family is in `decisionLedgerConfig.test.js:375–449` | **false as written** |
| T-19 (`:171`) | `✅` | Config-example block ✓; `pdlc/OPERATIONS.md:26,:31` carries the recognition rule, both bounds, both fail-open legs and the two notice ids ✓; `pdlc/README.md:137` and `CLAUDE.md:108` carry pointers, not restatements ✓. The un-skips it claims were performed in `decisionLedgerConfig.test.js`, not in the `documentOracles.test.js` half of its own Test File column | substance true, locus false |

**Why the T-12a mismatch is a product finding and not a filing quibble.** T-12a exists *because* of an earlier product finding of mine (PM F-03, with TE F-04): three of T-19's four deliverables — `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` — stood on a manual DoD checkbox with no falsifying assertion anywhere, so "an implementer writing one sentence and one writing the full mechanics both pass" (the row's own words, `:155`). The PLAN closed that gap by naming a specific file that would carry the oracle. A `✅` on a row whose named file is empty re-opens exactly the failure mode the row was written to close — for the next reader, the DoD checklist at `:468` ("All 24 tasks `✅`") and the red-before-green table at `:296` both now certify a locus that carries nothing.

**The substance is not at risk, and I want that on the record.** I ran the module: the five landed blocks assert the omission-reason list set-equal to `DECISION_LEDGER_OMIT_REASONS`, the notice-id list set-equal to the keys of `DECISION_LEDGER_NOTICES`, the config-key list set-equal to the keys of `DECISION_LEDGER_DEFAULTS` — all three **derived from the production constants by dynamic import**, never transcribed, so no implementation echo and no absence-only oracle; the README/CLAUDE.md conjunct pairs its negative (no key-by-key restatement) with a positive (each names `decisionLedger` and defers to `pdlc/OPERATIONS.md`); and the twelve-module manifest conjunct is a set equality, so a deleted module fails. This is a bookkeeping defect in the PLAN, not a coverage hole in the feature.

## Dependencies

**No dependency edge, batch number or `Deps` cell moved** — the diff touches lines 9, 17, 19 and four Status cells only, and every `Deps` list sits in an untouched column. Phasing therefore still tracks product priority exactly as approved at v10: P0 work (the flag-off byte-identity guarantee, `REQ-DECLEDGER-02`) precedes the P1 disclosure surface, and every P0/P1 requirement still owns a task.

**But the Status ledger is now internally inconsistent, and the partial flip is what made it so.** T-19 reads `✅` while its own `Deps` cell names `T-12, T-12a, T-18` and **T-18 reads `⬚` Not Started**. T-18's wiring is in fact landed — the `// === DECISION LEDGER WIRING START ===` / `END ===` sentinels are at `pdlc/workflows/orchestrate-dev.js:15688` and `:15709`, `wrapperSeams._injectDecisionLedger` is set at `:15704`, `reviewLoop`'s `_injectDecisionLedger = null` parameter is at `:9680` and the awaited per-round read at `:9992`. Batch-2 production is landed too: `DECISION_LEDGER_DEFAULTS` at `:2468`, `DECISION_LEDGER_NOTICES` at `:2477`, `DECISION_LEDGER_OMIT_REASONS` at `:2654` — while T-04 and T-13, which own them, both read `⬚`.

So the four flips are a slice of a much larger completed set, and the ledger now reads *worse* than an all-`⬚` column would: a reader who trusts it concludes T-19 shipped ahead of its dependency. I record this as Medium rather than blocking, because no dependency **edge** changed and no ordering contract was violated in the code — the real ordering was respected; only the document's record of it is partial. The fix is a sweep of the Status column against HEAD, not a re-plan.

**Upstream faithfulness of the v1.0 entry (DEC-ERR-03).** The entry claims each of the four upstream changelogs declares itself bookkeeping *and nothing else*, and that "no `BR-`/`E-`/`AC-` id, no vocabulary row and no measured value moves in any of the four". I spot-checked the load-bearing half of that claim rather than accepting it: the numerals that this PLAN's tasks depend on are unmoved — `12,500`, `1,200`, `11,300`, `9,296`, `3,204` and `M-6b`'s `441` all appear on both sides of the upstream diffs in unchanged assertions. REQ's C-5 change is a rationale reword exactly as described (`3,204` is preserved verbatim; only the gloss moves from "50 bytes per record of framing allowance" to "the allowance covering the rendered index's per-line *and* block framing"), which is the per-line/block framing point the entry names. The ids that appear in the upstream diffs (`E-7`, `C-5`, `M-6b`, `M-7b/c`, `DEC-DECLEDGER-10/-12`) appear as *citations inside re-grounded prose*, not as definitions moved or renamed. The entry's compression is faithful.

**The TE F-01 correction rode along correctly.** The v0.9 sweep passage now names **both** subtraction forms — `6,305 ≤ maxBytes − 1200` and `10,859 ≤ maxBytes − 1200` — which is exactly the enumeration gap I recorded as `DEFERRED` at v11. It was closed without changing the conformance verdict the passage reaches, which is the right shape for an erratum: the claim was short by one operand, not wrong.

## Verification

Every row below was re-derived at HEAD, not read off the document.

| Check | Method | Result |
|---|---|---|
| Delta scope | `git diff --stat 78981215..HEAD -- PLAN-*.md` | `1 file changed, 9 insertions(+), 7 deletions(-)`; lines 9, 17, 19 and four Status cells |
| Delta attribution | `git log -S'\| ✅ \|' 78981215..HEAD`, `git show --stat` on each commit | Status flips are `724116d75` (implementation); pin + entry are `f47c47009` / `521aa6681` |
| REQ pin | `shasum -a 256` | `9bc8bc32d698…cc05f10d` — matches header; status row reads `1.10 · 2026-08-30` |
| FSPEC pin | `shasum -a 256` | `48691453921c…9da11256` — matches header; status row reads `1.4 · 2026-08-31` |
| TSPEC pin | `shasum -a 256` | `2c84d5250d13…c3911be49b` — matches header; status row reads `1.3 · 2026-08-31` |
| DECISIONS pin | `shasum -a 256` | `48e73a411481…2fa1d5b9880240` — matches header |
| Baseline unmoved | `Version` field of `pdlc-decision-corpus-baseline.md` | `1.2 · 2026-08-28`, as claimed |
| Measured values unmoved | numeral diff of all four upstream diffs; targeted read of REQ C-5 | `12,500` / `1,200` / `11,300` / `9,296` / `3,204` / `441` all unchanged; C-5's change is rationale prose |
| T-00 done | read `decisionLedgerPreflight.test.js` | nine existence assertions, un-skipped — true |
| T-12 done | `node --test decision-ledger-config-example.test.js` | `pass 3, fail 0`; example config carries the `decisionLedger` block — true |
| T-12a done | `grep -c 'DECISION_LEDGER_OMIT_REASONS' documentOracles.test.js` | `0`; only `decisionLedger` hits are `:412` / `:424` census exclusion — **false at the named locus** |
| Disclosure family's real home | `grep -n 'T-19' decisionLedgerConfig.test.js`; `npm test -- __tests__/decisionLedgerConfig.test.js` | five `T-19: …` blocks at `:375–449`; `45 passed, 45 total` |
| T-19 doc deliverables | read `pdlc/OPERATIONS.md:26,:31`, `pdlc/README.md:137`, `CLAUDE.md:108` | mechanics in OPERATIONS.md; pointers only in README/CLAUDE.md — true |
| T-18 status vs code | `grep -n 'DECISION LEDGER WIRING' orchestrate-dev.js` | sentinels at `:15688` / `:15709`; row still reads `⬚` |

**Requirement traceability, re-checked at the two sites the delta disturbs.** `REQ-DECLEDGER-02` (P0, byte-identical dispatch stream when the flag is off) is still proved by T-10a's flag-off arm — untouched by this round, and the shipped default in `.claude/pdlc.config.example.json` is `"enabled": false`, so the off-by-default promise is what actually ships. The P1 disclosure requirement (REQ NG-6's no-SKILL.md-edits constraint plus the config-catalogue-freshness lesson) is proved by the five landed `T-19:` assertions — the requirement is *covered*; only the PLAN's pointer to that cover is stale.

**Test-discipline checks, on the assertions this round touches.** No implementation echoes: the three disclosure set-equalities import `DECISION_LEDGER_OMIT_REASONS` / `_NOTICES` / `_DEFAULTS` from production and compare them to the *documents*, which is derivation from the spec-bearing side, not from the code under test; T-12's engine-side literal is hand-transcribed from C-5 with the reason stated in-file. No absence-only oracles: the README/CLAUDE.md "no key-by-key restatement" negative is paired on the same path with the positive that each names `decisionLedger` and defers to `pdlc/OPERATIONS.md`. Completeness is set-equality, not containment, at all four enumerated sites (omission reasons, notice ids, config keys, the twelve-module manifest), so a deleted case fails.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | T-12a is marked `✅` Done, but its Test File column and the red-before-green table both name `pdlc/workflows/__tests__/documentOracles.test.js`, which carries no `decisionLedger` disclosure family at HEAD (zero `DECISION_LEDGER_*` references; `:412`/`:424` are census-exclusion only). The family landed in `decisionLedgerConfig.test.js:375–449` and passes. Re-point the row and the red-before-green table at the real file, or drop the `✅` until it lands where the row says. T-19's `✅` inherits the same defect through its "Un-skips T-12 and T-12a" clause. | §Task table T-12a (`:155`), T-19 (`:171`), §Red-before-green edges (`:296`) |
| F-02 | Medium | delta | local | The v1.0 revision entry asserts "no task row, batch, dependency, ownership, task-id or count assignment changes in this round", but four task rows changed in the same round (`724116d75` flipped T-00, T-12, T-12a, T-19 from `⬚` to `✅`). The contract columns are indeed unmoved; the sentence as written is falsified by its own round's bytes. Narrow it to the contract columns and name the status flips. | §Revision history, v1.0 entry (`:19`) |
| F-03 | Medium | delta | local | The Status column is now partially updated and therefore misleading: T-19 reads `✅` while its declared dependency T-18 reads `⬚`, though T-18's wiring is landed (`orchestrate-dev.js:15688–15709`), as is batch 2's production (`:2468`, `:2477`, `:2654`) whose owners T-04/T-13 also read `⬚`. Sweep the column against HEAD in one pass rather than flipping the rows a wave happens to touch. | §Task table Status column (`:149–:172`) |

FINDING: High | delta | local | §Task table T-12a (:155) / T-19 (:171) / §Red-before-green edges (:296) | T-12a marked ✅ Done but its named test file documentOracles.test.js carries no decisionLedger disclosure family at HEAD; the family lives in decisionLedgerConfig.test.js:375–449 — re-point the row and the red-before-green table, or drop the ✅
FINDING: Medium | delta | local | §Revision history v1.0 entry (:19) | The entry claims "no task row … changes in this round" while the same round flipped four task rows' Status cells
FINDING: Medium | delta | local | §Task table Status column (:149–:172) | Partial status sweep: T-19 ✅ with dependency T-18 ⬚, and T-04/T-13 ⬚ though their production constants are landed

DEFERRED: `PROPERTIES-pdlc-decision-ledger.md`'s header still pins `PLAN` v0.7 and `TSPEC` v1.0 — now two re-groundings stale; that is the PROPERTIES phase's re-grounding to make, not a defect in the document under review.
DEFERRED: The DoD checklist's "All 24 tasks ✅" (`:468`) is the only place the Status column becomes load-bearing at ship time; once F-03's sweep happens, consider whether that bullet wants a mechanical check rather than a manual read.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Was the move of T-12a's oracle out of `documentOracles.test.js` a considered substitution or an incidental one? The implementer's comment at `decisionLedgerConfig.test.js:354–368` gives a real reason — a committed planned-work `test.skip` in `documentOracles.test.js` is an unregistrable orphan under the swept-surface orphan-freedom oracle — which reads as deliberate and correct. If so, F-01's fix is a re-point, and the reason belongs in the row so the next reader does not "restore" the original placement. |

## Positive Observations

- **The re-grounding was done before the entry was closed, and it says what it checked.** Four pins moved, four were re-measured with `shasum -a 256`, each is named with both its version label and its hash, and the entry states *why* the movement is immaterial rather than asserting that it is. The "no measured value moves — `12500 − 1200 = 11,300`, the project-level headroom and `M-6b`'s `441` are the same at TSPEC v1.3 as at v0.7" sentence is the falsifiable kind: I checked it in a minute and it held.
- **The v11 `DEFERRED` item was picked up without being asked.** The sweep passage now names both subtraction forms. Nothing obliged the author to close a deferred, non-gating enumeration gap in a re-grounding round; doing it there is exactly where it costs least.
- **The disclosure oracle that did land is the shape the PLAN argued for.** Derived from production constants rather than transcribed, set-equal rather than containment, negative conjunct paired with a positive. The coverage promise behind T-12a is kept — which is precisely why the one blocking finding is a pointer fix and not a rebuild.

## Recommendation

**Needs revision** — one High finding, and a narrow one.

Exactly what to change:

1. **F-01 (blocking).** Re-point T-12a's Test File column (`:155`) and the `T-12, T-12a → T-19` row of §Red-before-green edges (`:296`) at `pdlc/workflows/__tests__/decisionLedgerConfig.test.js`, carrying the one-clause reason (the swept-surface orphan-freedom oracle rejects a committed planned-work `test.skip` in `documentOracles.test.js`), and reconcile the file-ownership manifest with it. Alternatively, revert T-12a's and T-19's `✅` until the family lands in the named file. Either resolves the finding; the first matches what shipped.
2. **F-02 (non-gating).** Narrow the v1.0 entry's "no task row … changes" clause to the contract columns it means, and note the four status flips.
3. **F-03 (non-gating).** Sweep the whole Status column against HEAD in one pass.

Nothing in the re-grounding half needs to change: the four pins, the immateriality argument and the TE F-01 correction all stand as written, and no requirement, acceptance criterion or scope boundary moved in this round.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}

# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-31
**Iteration:** 13 (delta confirmation)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I approved PLAN v1.0 at `REVIEWED-COMMIT: 1362568d8` with three Low findings (F-01 a stale `:66` anchor written stale, F-02 T-19 flipped `✅` above `⬚` dependencies, F-03 T-00a's `154 files` census figure outgrown by HEAD). `git diff 1362568d8..HEAD` on the document is **51 insertions / 43 deletions across nine hunks**, all from three se-author commits (`7f1341ff9`, `b62df6cb6`, `0869ce263`); no other file in the repository moved in that range (`git diff --stat` names the PLAN alone).

The delta answers the PM's High (F-01, re-point T-12a to its real host), the PM's two Mediums (v1.0 scope clause, Status sweep) and my three Lows. Four things moved that a testing lens has to check mechanically rather than read:

| # | Change | Commit |
|---|---|---|
| 1 | **T-12a re-hosted** from `documentOracles.test.js` to `decisionLedgerConfig.test.js` — Test File column, red-before-green edges table, T-19's Test File column, the ownership manifest, the disjointness premise and the multi-owner paragraph | `7f1341ff9` |
| 2 | **T-12a's batch moves 2 → 4** with a new `Deps` edge on T-13, and the batch re-derivation paragraph is rewritten to match | `7f1341ff9` |
| 3 | **Status column swept** — all 24 rows now read `✅`; T-00a's census prose re-labelled a pre-feature baseline with the HEAD figure alongside | `b62df6cb6` |
| 4 | **Revision history v1.1 entry** added, v1.0's scope clause narrowed, the stale `:66` anchor retired for a content anchor | `0869ce263` |

Change 2 is the only one that touches batch-safety arithmetic, so I re-derived the whole DAG rather than the moved row. Change 3 turns every row into a claim about HEAD, so I checked all of them by running the suites, not by reading the ticks.

## Re-grounding: the four pins, re-measured

The v1.1 entry's first claim is that **no** upstream moved since v1.0, so no pin is rewritten. A no-op re-grounding is the cheapest kind of claim to assert and the cheapest to get wrong, so per DEC-ERR-03 I re-measured all four with `shasum -a 256` at HEAD rather than accepting the assertion:

| Upstream | Version claimed in header | Version at HEAD | `shasum -a 256` tail at HEAD | Header tail | Agrees |
|---|---|---|---|---|---|
| REQ | **v1.10** | `1.10` | `…05f10d` | `9bc8bc32…05f10d` | yes |
| FSPEC | **v1.4** | `1.4` | `…a11256` | `48691453…a11256` | yes |
| TSPEC | **v1.3** | `1.3` | `…1be49b` | `2c84d525…1be49b` | yes |
| DECISIONS | **v1.6** | `1.6` (`Version: 1.6`, `DECISIONS…:4`) | `…880240` | `48e73a41…880240` | yes |

Baseline: `docs/_constraints/pdlc-decision-corpus-baseline.md:7` reads `1.2 · 2026-08-28`, quoted verbatim in the entry and unmoved. Four pins byte-identical to the v1.0 header, so the entry's "nothing is owed absorption" is a measured fact, not an assumption, and no upstream-derived task instruction can have gone stale in this round.

## Did the delta land what it claims?

**(1) The re-point is true of HEAD, not just of the document.** `pdlc/workflows/__tests__/decisionLedgerConfig.test.js:347` opens the *"Roots for the relocated T-12a disclosure family"*, `:354` carries the `PLAN T-12a` header comment, `:375` is the `pdlc/OPERATIONS.md decisionLedger disclosure family constants (PLAN T-12a / T-19)` describe block and `:416` the `T-19: pdlc/README.md and CLAUDE.md …` block — so the disclosure family really lives in the new host. The old host is clean: `grep -n decisionLedger pdlc/workflows/__tests__/documentOracles.test.js` returns exactly two hits, `:412` (the comment) and `:424` (`!name.startsWith("decisionLedger")`), i.e. T-00a's census exclusion **only**. The document's §Overview sentence (`:106`) now says exactly that, and no stale "T-12a's disclosure oracle" attribution to `documentOracles.test.js` survives anywhere (`grep -n documentOracles` returns ten sites, each either T-00a's census, T-19's positive-control re-run, or the v1.1 entry describing the move).

**The stated reason for the move checks out.** `pdlc/workflows/__tests__/consumerCleanup.test.js:373`–`:381` freezes `SWEPT_SURFACE_MODULES` and `documentOracles.test.js` is a member (`:377`), so a committed planned-work `test.skip` there would have been an unregistrable orphan in the skip-join oracle. This is my own memory's *swept-surface bare-skip orphan halt* lesson applied prospectively rather than after a halt — the right resolution, and the same one the lesson prescribes (host in a non-swept `decisionLedger*` module, titles byte-identical).

**(2) The batch arithmetic re-derives correctly.** T-12a's row (`:157`) now reads `Deps` `T-00, T-00a, T-13` and `Batch` `4`. Mechanically `max(T-00=1, T-00a=1, T-13=3) + 1 = 4` ✓. The only row that could have moved with it is T-19, whose deps are `T-12, T-12a, T-18` ⇒ `max(1, 4, 8) + 1 = 9` — unchanged, exactly as the derivation paragraph says. I re-ran the whole chain: T-13 = 3, T-14 = 4, T-15 = 5, T-16 = 6, T-17 = 7, T-18 = 8, T-20 = 10, every edge strictly increasing, ids unique, every dep resolving. **Same-new-file authoring guard:** `decisionLedgerConfig.test.js` now has four owning rows in the manifest (T-04 b2, T-13 b3, T-12a b4, T-19 b9) — four distinct batches, so no batch contains two writers of it; batch 4's other task, T-14, owns `decisionLedgerRecognise.test.js` and does not touch it. No same-batch same-file collision anywhere in the manifest.

**(3) The Status sweep is true row by row, and I did not take the ticks on trust.** Every claim in the v1.1 entry re-measured:

| Claim in the entry | How I checked | Result |
|---|---|---|
| all twelve `decisionLedger*.test.js` modules exist, plus `helpers/decisionLedgerDoubles.js` and both fixture trees | `ls` | 12 modules present |
| zero committed skips remain | `grep -rE '^\s*(describe\|test\|it)\.skip'` over the twelve | **0** — every `[red]` block un-skipped by its `[green]` owner |
| *"12 suites, 236 tests, all pass"* | `npm test -- __tests__/decisionLedger` in `pdlc/workflows` | **12 suites, 236 tests, 236 pass** — the figure is exact, not rounded |
| engine leg green | `node --test __tests__/decision-ledger-config-example.test.js` | pass 3, **fail 0** |
| six production symbols exported | `grep -c 'export function …'` on `orchestrate-dev.js` | all five named functions exported once each; `main()` wiring + `wrapperSeams._injectDecisionLedger` present |
| T-20 landed: `--check` clean, `plugin.json` `0.23.7` | `node pdlc/workflows/build-runtime.mjs --check`; `pdlc/.claude-plugin/plugin.json:4` | bundle in-sync, version reads `0.23.7`, working tree clean |
| T-00a's load-bearing half | `ls __tests__/*.test.js \| wc -l`; same minus the five excluded prefixes | **166** files, **exactly 102** after exclusions — the re-labelled prose is right on both halves |
| the `102` positive control still green | `npm test -- __tests__/documentOracles.test.js` | 35/35 pass |

`node --test __tests__/docs-uniqueness.test.js` in `pdlc/engine` also reports fail 0, so T-19's documentation edits have not disturbed the doc oracles. The ledger no longer understates completion, which retires my v12 F-02.

## Did the delta break anything previously approved?

No. The oracle designs earlier rounds turned on are byte-identical in this diff — the only task-instruction bytes that moved are T-12a's Test File column, T-12a's `Deps`/`Batch` cells and T-00a's census prose. Specifically, re-read at HEAD: T-09's expected literals are still hand-transcribed from the fixture's own heading text and never captured from the renderer (`:161`); T-07's property model still carries its own formatter transcribed from TSPEC §4.3 rather than calling `renderDecisionLedgerBlock` (`DEC-DECLEDGER-11`); T-03's fixture guard is still set equality over a 25-element hand-transcribed path array; T-02's `mergeBaseSha` is still asserted against a hand-transcribed literal, never read from the manifest it checks; T-04 still asserts C-3's key enumeration as **set equality**, and T-13's `DECISION_LEDGER_NOTICES` likewise. No implementation echo is introduced by the move.

The three testing invariants I am asked to hold this artifact to survive the delta intact:

- **No implementation echoes.** The relocated T-12a family derives its expectations from the production constants (`DECISION_LEDGER_OMIT_REASONS` and friends) exactly as the pre-move text specified — the §Verification bullet at `:489` still says *"every expectation **derived** from `DECISION_LEDGER_OMIT_REASONS`"*, and the host change did not weaken it to a restatement.
- **No absence-only oracles.** T-12a's README/`CLAUDE.md` block (`decisionLedgerConfig.test.js:416`) pairs its negative conjunct (*no key-by-key restatement*) with two positive ones (names `decisionLedger`, defers to `pdlc/OPERATIONS.md` — `:428` asserts `stringContaining("pdlc/OPERATIONS.md")`). The delta neither added nor relaxed an absence-shaped assertion.
- **Completeness as set equality.** The red-before-green edges table (`:294`–`:300`) still enumerates every `[green]` with its `[red]` and the shared file; T-19's row now names `decision-ledger-config-example.test.js`, `decisionLedgerConfig.test.js` and matches T-19's Test File column at `:173` — the two enumerations agree element-for-element, so a deleted case would show up as a mismatch rather than silently pass.

**Red-before-green ordering is preserved by the move, and strengthened.** Before, T-12a's `[red]` blocks sat in a file whose only other owner was T-00a; now they sit behind a real `Deps` edge on T-13, which as the row itself notes also guarantees T-13's un-skip sweep cannot reach blocks written after it. That is a genuine ordering improvement, not just relocation.

Two bookkeeping inconsistencies came in with the batch move; neither is load-bearing and both are recorded below rather than as blocking items.

## Positive Observations

- The re-point was made **for a mechanical reason, verified at HEAD** — `SWEPT_SURFACE_MODULES` membership (`consumerCleanup.test.js:377`), not a preference — and the entry cites the constraint rather than asserting the conclusion. This is the swept-surface orphan hazard being designed around *before* a wave halt instead of after one.
- The move carried its batch consequence with it: a new `Deps` edge on T-13 rather than a prose promise of serialisation. Edges are what the gate reads; prose is not. The multi-owner paragraph says exactly this (*"serialised by edges rather than prose"*).
- The Status sweep is stated with its evidence attached — suite counts, a skip grep, a `--check` run and a commit sha — so it is falsifiable by re-running the same commands. Every figure I re-ran matched to the unit (236 tests, 166 files, 102 after exclusions, `0.23.7`).
- My v12 F-01 was answered the right way: the stale `:66` line anchor is replaced by a **content** anchor (*the §Overview mention*) per DEC-DOC-01, which cannot drift, rather than by a corrected line number that would go stale on the next insertion.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | delta | local | The batch-move left one sentence behind it: `:188` still reads *"T-10a and T-12a sit in batch **2** under greens (T-18, T-19) that already sat above batch 2"*, four lines below the derivation that now correctly puts T-12a at **4** and below the row's own `Batch` column, which reads `4`. The authoritative derivation (`:182`–`:184`) and the task table agree on 4, and the sentence's *conclusion* — no other row's batch moves — is independently true (T-19 re-derives to 9 because `max` is still T-18's 8), so nothing an implementer batches from is wrong. But the document now contradicts itself on T-12a's batch within one subsection, and batch numbers are exactly the field a wave planner reads fast. Re-word to *"T-10a sits in batch 2 and T-12a in batch 4"*. | §Batch column re-derivation, closing paragraph (`:188`) |
| F-02 | Low | delta | local | `:255` calls `decisionLedgerConfig.test.js` a file *"whose **three** owners sit in batches 2, 3 and 4"* while the same sentence goes on to name T-19's batch-9 un-skip as a fourth link in the chain (`T-04 → T-13 → T-12a → T-19`) and the ownership manifest carries **four** rows for the file (T-04 b2, T-13 b3, T-12a b4, T-19 b9). The count word is one short of its own enumeration. No safety consequence — all four batches are distinct, which is what the disjointness premise needs — but the count word is the kind of figure a later reviewer re-derives. | §Disjointness premise, multi-owner paragraph (`:255`) |

DEFERRED: T-00a's `154 files` baseline census now needs a "verified at {commit}" pin if it is to stay re-derivable once more modules land — worth doing in whichever round next touches that row, not this one.

FINDING: Medium | delta | local | §Batch column re-derivation, closing paragraph (:188) | stale sentence still places T-12a in batch 2 while its own row and the derivation four lines above read batch 4; conclusion (no other row moves) is independently true and T-19 still re-derives to 9
FINDING: Low | delta | local | §Disjointness premise, multi-owner paragraph (:255) | decisionLedgerConfig.test.js described as having "three owners" while the same sentence and the manifest enumerate four (T-04 b2, T-13 b3, T-12a b4, T-19 b9); all four batches distinct, so disjointness holds

## Verdict

The PM's High (T-12a pointing at a file that does not host it) is landed and verified at HEAD, both the re-point and its batch consequence; my three v12 Lows are all retired; the four upstream pins re-measure byte-identical; every `✅` in the swept Status column is backed by a suite I re-ran. The two findings above are bookkeeping inside the delta's own paragraphs, neither gating.

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:4d40cfb228cd181571ad9d6247a23f0cc8974542f9c249a0e0f0fd26015fd8e3
APPROVAL-HASH-NORMALIZED: sha256:844eccde81bffb3254f4a824f7b0319d751179b0ff5d29ad2d5e6f8270653a57
REVIEWED-COMMIT: 0869ce263baaba1134e8aaaab63cd1d527bddab4
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:2c84d5250d13c57573eae0fde9ef1c00dd128ddd07169f5b7570c6c3911be49b
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240

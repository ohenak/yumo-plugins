# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.3)
**Date:** 2026-08-21
**Iteration:** 15

## Overview

**What changed, and against what base.** `git diff 95098af5..HEAD` on the PLAN — 95098af5 being the
v1.2 commit I reviewed at v14 — is **74 insertions, 35 deletions**: the version cell (`1.2` → `1.3`),
the upstream pin cell (FSPEC `v0.13` → `v0.14`, REQ `v0.9` → `v0.10`, DECISIONS `v0.3` → `v0.5`) and
three prose pins that carry the same versions, a qualified §Overview change-surface sentence, the
`package.json` row of the change-surface table, the §Production and generated `package.json` bullet,
a rewritten and much longer §Post-batch remediation subsection (six rows → **nineteen**), one
sentence in §The arithmetic, DoD 11 and DoD 12, case A's derivation quote, a changelog row swap, one
changelog credit, and a new 1.3 row. No task row's `Owner`, `Batch` or `Deps` cell moved.

**Verdict up front: all six of my v14 findings are resolved, and I resolved each against the
repository rather than against the changelog's account of it.** The two Highs — the under-recorded
`2fc6fcd3` manifest amendment (F-01) and the false "`package.json` is **not** modified" premise
(F-02) — are closed with material I could verify line by line: the subsection is now derived from
`git show --name-status 2fc6fcd3` and its 45-path accounting reconciles exactly, and the
`package.json` prose now matches the shipped `c8` block byte for byte. The Medium (F-03, the
eighteenth `learnings*` file) has its own row. The three Lows (F-04 changelog credit, F-05 changelog
order, F-06 case A's stale quote) are all fixed. **Nothing I previously approved broke.** Two new
Lows, both cosmetic, neither gating. **Approved with minor changes.**

**Scope of this pass, under DECISION FREEZE.** I measured only the changed regions, and I asked of
each only the two questions a frozen round admits: did this delta break something that worked, and
does any load-bearing claim in the changed bytes contradict the repository at HEAD or an upstream
document. I re-derived every commit pin, every file enumeration, every diffstat number and the whole
`c8` block from the tree at HEAD (`6792fa5f`) and at the measurement anchor `09c7c62f`. Upstream
pins were re-read from the documents themselves, not from this PLAN's header.

## Batches

**No task row moved, and I checked mechanically rather than by eye.** I extracted the `Owner`,
`Batch` and `Deps` columns of every `| LI-NN |` row from both revisions and diffed them: identical.
The only edit inside a task row is LI-12's prose pin (`FSPEC v0.13's AT-30` → `v0.14's`, twice), and
the per-batch expected-red ledger for batches 7–13 is byte-identical between the two revisions. The
1.3 changelog row's claim — "no task moved batch, no `Deps` edge changed, no AT partition, fixture
or ledger row was touched" — is true against the diff.

### F-01 (High, v14) is resolved: the subsection now reconciles with the commit

My v14 High was that §Post-batch remediation described `2fc6fcd3` as "six test-side surfaces" and
recorded two of nine second writes, while P-A-5 requires "one added row per file". The rewritten
subsection states its own provenance — "derived from `git show --name-status 2fc6fcd3`, not from any
prior description of the commit" — and I re-ran that command. Its accounting reconciles exactly:

| The subsection's claim | Measured at `2fc6fcd3` |
|---|---|
| lists **45 paths** | 45 |
| 18 added fixture prompts under `PIPELINE-NON-AUTHORING-PROMPTS/` | `0.txt`…`17.txt`, 18 added |
| **five added test-side files** | `helpers/learningsBaselineScenarios.js`, `helpers/learningsComposition.js`, `learningsDisclosure.test.js`, `learningsErratumBinding.test.js`, `pdlc/engine/__tests__/learnings-config-example.test.js` |
| nine modified files under `pdlc/workflows/__tests__/` | `coverageInstrumentation`, `fixtures/learnings-baseline/MANIFEST.json`, `learningsArmInventory`, `learningsBaselineGuard`, `learningsCaptureScript`, `learningsConfig`, `learningsCorpus`, `learningsDispatchSet`, `learningsSelect` — nine |
| one modified pre-existing engine suite | `pdlc/engine/__tests__/docs-uniqueness.test.js` |
| four modified production/configuration files | `orchestrate-dev.js`, `scripts/capture-learnings-baseline.mjs`, `pdlc/workflows/package.json`, `pdlc/workflows/.gitignore` |
| the regenerated `dist/pdlc-cli.mjs` | modified |
| seven pipeline/document files | `REQ`, `FSPEC`, `TSPEC`, `CLAUDE.md`, `pdlc/OPERATIONS.md`, `pdlc/README.md`, `.claude/pdlc.config.example.json` |

18 + 5 + 9 + 1 + 4 + 1 + 7 = **45**. The partition is exhaustive and disjoint, which is the property
that makes "one added row per file" checkable rather than assertable.

**Every second-writer row's owner and batch is correct against the manifest table above it.** I
checked each against the file-ownership manifest's own rows: `learningsCaptureScript.test.js` →
LI-03 / batch 2 (manifest line 231), `learningsSelect.test.js` → LI-07 / 3 (line 233),
`learningsCorpus.test.js` → LI-09 / 3 (line 235), `learningsDispatchSet.test.js` → LI-11 / 5
(line 239), `learningsConfig.test.js` → LI-12 / 5 (line 240), `learningsArmInventory.test.js` →
LI-23 / 5 (line 241), `scripts/capture-learnings-baseline.mjs` → LI-05 / 3 (line 199). Not one is
mis-attributed.

**The three production-side row bodies are exact.** `git show --numstat 2fc6fcd3` gives
`orchestrate-dev.js` 15/6, `scripts/capture-learnings-baseline.mjs` 74/19,
`pdlc/workflows/package.json` 13/6 and `pdlc/workflows/.gitignore` 1/0 — matching the rows' "15
insertions, 6 deletions", "74 insertions, 19 deletions" and "one ignore line" verbatim. The
`.gitignore` row's disambiguation is true: the commit touches `pdlc/workflows/.gitignore` (adding
`/.tmp-capture-driver-*/`) and does **not** touch the root `.gitignore` LI-04 owns. And the
`selectLearnings` signature claim is true at HEAD — `pdlc/workflows/orchestrate-dev.js:2426` reads
`export function selectLearnings({ entries, thresholds })`, with no `feature` parameter.

### F-03 (Medium, v14) is resolved, and the count now reconciles from two directions

The eighteenth file has its own row: `pdlc/engine/__tests__/learnings-config-example.test.js`,
"new — no LI owner", cause F9. I counted the tree at the measurement anchor: `git ls-tree -r
09c7c62f` yields **fourteen** `pdlc/workflows/__tests__/learnings*.test.js` suites, **three**
helpers (`learningsFixtures.js`, `learningsBaselineScenarios.js`, `learningsComposition.js`) and the
one engine-side file — eighteen. §Overview's new sentence states exactly that decomposition, and
§The arithmetic reaches the same eighteen by the other route (ladder's thirteen + `2fc6fcd3`'s five
added). Both are true, and they agree.

## Dependencies

**No `Deps` edge changed.** The column diff above is mechanical, not impressionistic: the `Deps`
cells of all 23 `LI-*` rows are byte-identical between `95098af5` and HEAD. This delta scheduled
nothing and re-ordered nothing.

**The upstream re-pin is a pin refresh, and the pins are right.** The header now reads REQ v0.10 /
FSPEC v0.14 / TSPEC v0.9 / DECISIONS v0.5. I read each document's own version row rather than
trusting the PLAN's header:

| Document | Version row at HEAD | PLAN's pin |
|---|---|---|
| `REQ-pdlc-learnings-injection.md` | `0.10` (line 18) | v0.10 ✓ |
| `FSPEC-pdlc-learnings-injection.md` | `0.14` (line 18) | v0.14 ✓ |
| `TSPEC-pdlc-learnings-injection.md` | `0.9` (line 18) | v0.9 ✓ |
| `DECISIONS-pdlc-learnings-injection.md` | `0.5` (line 18) | v0.5 ✓ |

The three prose pins that moved with the header are LI-12's `LI-AT-30` cell, the `RSN-NO-MATERIAL`
arm row and the F-O-1 obligations row — all three are version references to text whose substance did
not change (REQ v0.10 is AC-2.4's attribution erratum, FSPEC v0.14 restates BR-6's window and the
same attribution; DECISIONS v0.5 re-grounds DEC-LI-08's byte formula and explicitly records that
"v0.14's window restatement and AC-2.4's attribution clause leave the byte-accounting basis, `E-36`
and `AT-30` untouched"). So the cited claims — E-36's third `LI-AT-30` case, the two-disjuncts-one-
branch `RSN-NO-MATERIAL` arm, F-O-1's second heading rule — are unmoved beneath the new pin numbers.
A pin refresh with no cascade is the correct handling and the 1.3 row says so in those words.

**P-A-7's case table is unchanged in substance.** The only edit inside it is case A's derivation
quoting `"before batch 9"` instead of the superseded `"before batch 7"` — my v14 F-06. The *When*
cell it now agrees with has read "before batch 9 (which includes batches 7 and 8)" since v1.1, so
the quotation and the cell are finally the same string. Case B's span (9–12), case C's domain
(batch 13 or later), the commit triple `e7fa8d87` / `be2456c8` / `a4998e13` and the 26/26 discharge
record are all byte-identical to the bytes I approved at v14.

**Downstream is untouched by this delta**, and the one PROPERTIES-side lag I recorded at v14 (§C.4
still offering case B's amend-into-the-ledger route) is still downstream's field to advance. I
record it again here rather than charging it to this document.

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-31
**Iteration:** 12 (delta confirmation)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I approved PLAN v0.9 at `REVIEWED-COMMIT: 789812155` with one Low finding (F-01, an under-counted enumeration in the v0.9 sweep passage). `git diff 789812155..HEAD` on the document is **9 insertions / 7 deletions across six hunks** — small, and two of the six come from an implementation commit rather than the author:

| Hunk | Line | What moved | Author |
|---|---|---|---|
| 1 | `:9` | All **four** upstream pins re-grounded: REQ v1.9 → **v1.10**, FSPEC v1.3 → **v1.4**, TSPEC v1.2 → **v1.3**, DECISIONS v1.5 → **v1.6** | `f47c47009` (se-author) |
| 2 | `:17` | Version row `0.9` → **`1.0`**, date `2026-08-31` | `f47c47009` |
| 3 | `:19`–`:21` | New **v1.0** revision-history entry; the v0.9 entry demoted to a continuation and its sweep enumeration corrected to name **both** T-09 subtraction forms | `521aa6681` |
| 4–6 | `:149`, `:154`–`:155`, `:171` | Status column only: **T-00, T-12, T-12a, T-19** flip `⬚` → `✅` | `724116d75` (implementation, "T-19 un-skip") |

No task instruction, batch column, dependency edge, ownership row, test-file name or AT text is inside the diff. The round therefore reduces to three questions: do the four new pins agree with disk; is the "immaterial movement" claim true rather than assumed; and are the four `✅` marks backed by the repository.

## Tasks

The delta touches four task rows and only in their **Status** column, so the standing test-design review is unchanged. What *has* changed since v11 is the world around the document: the twelve `decisionLedger*` modules the table declares `[new]` now exist, because implementation waves have run. I re-checked the four flipped rows against HEAD rather than trusting the mark.

| Row | Claimed `✅` | Evidence at HEAD | Verdict |
|---|---|---|---|
| T-00 | pre-flight symbol gate | `pdlc/workflows/__tests__/decisionLedgerPreflight.test.js` exists; `test.each` carries the eight `orchestrate-dev.js` symbols **plus** `runCaptureScript` — nine entries, exactly the row's "eight … plus" | backed |
| T-12 | engine config disclosure | `pdlc/engine/__tests__/decision-ledger-config-example.test.js` exists, blocks titled `T-19: …` as the row requires, now **un-skipped**; 3/3 pass under `node --test` | backed |
| T-12a | documentation disclosure oracle | `pdlc/engine/__tests__/docs-uniqueness.test.js` amended in the same commit; 6/6 pass | backed |
| T-19 | disclosure + docs | `.claude/pdlc.config.example.json` parses and its `decisionLedger` section is exactly `{enabled: false, maxEntries: 70, maxBytes: 12500}` — C-5's three keys, no fourth; `pdlc/OPERATIONS.md` (2 hits), `pdlc/README.md` (1), `CLAUDE.md` (1) all carry the block, README/CLAUDE.md as pointers rather than restatements | backed |

The `102` census literal T-00a owns is live and green: `pdlc/workflows/__tests__/documentOracles.test.js:424` carries `!name.startsWith("decisionLedger")` and `:426` asserts `expect(count).toBe(102)`; I measured the directory independently — 166 `*.test.js` files, **exactly 102** after the five namespace exclusions. The one stale figure is in the row's prose, not its oracle (F-03).

## Dependencies

The delta's substantive risk is upstream fidelity: **all four** pins moved at once, and a bulk re-pin is the cheapest place for a stale re-grounding to hide. Per DEC-ERR-03 I re-measured every one mechanically at HEAD before reading the entry that claims them.

| Upstream | Version claimed in header | Version at HEAD | `shasum -a 256` at HEAD | Agrees |
|---|---|---|---|---|
| REQ | **v1.10** `sha256:9bc8bc32…05f10d` | `1.10` | `9bc8bc32…cc05f10d` | yes |
| FSPEC | **v1.4** `sha256:48691453…a11256` | `1.4` | `48691453…9da11256` | yes |
| TSPEC | **v1.3** `sha256:2c84d525…1be49b` | `1.3` | `2c84d525…911be49b` | yes |
| DECISIONS | **v1.6** `sha256:48e73a41…880240` | `1.6` | `48e73a41…b9880240` | yes |
| Baseline | **v1.2**, `Version` field reads `1.2 · 2026-08-28` | — | `docs/_constraints/pdlc-decision-corpus-baseline.md:7` reads `1.2 · 2026-08-28` | yes, verbatim |

Four byte-exact, and the Baseline quote is verbatim rather than paraphrased. But agreeing hashes only prove the pin was re-measured; they say nothing about whether the movement was material. The entry asserts it was not — *"a checked claim rather than an assumption"* — so I diffed each of the four across the same range and compared the **multiset of numerals** on removed against added lines, which is the cheap falsifier for a silently moved measured value:

| Upstream | Diff | Ids touched | Numerals removed → added | Matches the entry's characterisation |
|---|---|---|---|---|
| REQ | 16/4 | none | `1,2,3,4,5,6` → `1,2,3,4,5,6,7,8,9`; `3,204`, `8,000`, `9,296`, `12,500`, `12500` identical on both sides | yes — the one numeral change is the *Cross-Reviews* row the entry names, and the C-5 slack reword keeps every figure |
| FSPEC | 13/2 | none | `12500` identical | yes — REQ pin moved, plus a changelog entry stating nothing follows |
| TSPEC | 33/5 | `E-7` cited **by id** in place of `FSPEC v1.3's E-7` (×2) and in AT-14 | `6,305`, `10,859`, `12,059`, `441`, `12500` identical | yes — DEC-DOC-01 de-versioning, no value moves |
| DECISIONS | 18/4 | none | `11,300`, `1200`, `12500`, `4,995`, `441`, `8,000` identical (added side recites them once more in the changelog) | yes — two stale `TSPEC v0.7` HEAD recitals retired, replaced by "at HEAD" |

No `BR-`/`E-`/`AC-` id is added, removed or renumbered in any of the four; `E-7` is the only id whose *citation form* changes, and it changes from version-numeral to id, which strengthens the pointer rather than moving it. `maxEntries` `70`, `maxBytes` `12500`, `12500 − 1200 = 11,300`, the ~4,995-byte project headroom and `M-6b`'s `441` are identical at TSPEC v1.3 and at v0.7. The entry's central claim holds, and it holds by measurement rather than by assertion.

One consequence the entry draws is worth confirming separately, because it is the kind of claim that is true today and quietly false tomorrow: *"no task row, batch, dependency, ownership, task-id or count assignment changes in this round."* The diff bears that out — hunks 4–6 are Status-column bytes only, and I re-derived nothing else moved.

## Verification

**Was my v11 F-01 landed?** Yes, and precisely — not over-corrected. The v0.9 entry now reads *"the only bound assertions it carries are T-09's **two** subtraction forms `6,305 ≤ maxBytes − 1200` and `10,859 ≤ maxBytes − 1200`"*. Re-running the same four greps that produced the finding:

| Claim in the swept passage | Mechanical check | Result at HEAD |
|---|---|---|
| Both bound assertions enumerated, both in subtraction form | `grep -oE '[0-9,]+ ≤ maxBytes − 1200'` | 5 hits: `:19` (the v1.0 entry quoting the *old*, short enumeration), `:21` (v0.9, now **both**), `:161` (T-09, **both**) — operands and forms agree at every site |
| "no addition form is asserted anywhere" | `grep -cE '\+ ?1,?200\|1,?200 ?\+'` | **0** — still no `measured + ceiling` assertion |
| "`12,059` is explicitly **not** asserted as an equality" | `grep -c '12,059'` | 2, unchanged; T-09 `:161` still labels it *deliberately not equality (`DEC-DECLEDGER-16`)* |
| "`441` appears only as the worst-case figure" | `grep -c '441'` | 4 (was 2); the two new sites are prose in the v1.0/v0.9 entries stating the margin is *unchanged* across TSPEC v0.7 → v1.3 — a statement about a margin, not a ceiling entering an assertion, so `DEC-DECLEDGER-16`'s directional predicate is not engaged |

The enumeration is now complete and the conformance verdict it reaches is the one I re-derived independently: `12500 − 1200 = 11,300`; `11,300 − 10,859 = 441`; `6,305 ≤ 11,300`.

**Did the delta break anything I previously approved?** No. I re-read the oracle designs the earlier rounds turned on and they are byte-identical to v10: T-09's expected literals are hand-transcribed and never captured from the renderer (`:161`); T-03's fixture integrity guard is **set equality against a 25-element hand-transcribed path array**, not a count and not a manifest-derived list; T-02's `mergeBaseSha` is a hand-transcribed literal never read from the manifest it checks; T-10a's conjunct 3 still asserts the `report` key-set **symmetric difference** as `{decisionLedger}` in both directions and the notice set as set-equal to empty, rather than the retired tautology; AT-18 keeps its positive conjunct. No absence-only oracle crept in, no set-equality was relaxed to containment, and no expected value became derived from code under test.

**Green at HEAD, not merely asserted.** Because the four `✅` marks are new, I ran the oracles that back them rather than reading the column: `npm test -- __tests__/decisionLedgerConfig.test.js __tests__/decisionLedgerPreflight.test.js __tests__/documentOracles.test.js` in `pdlc/workflows` → **3 suites, 89 tests, all pass** (50.8 s); `node --test __tests__/decision-ledger-config-example.test.js` → 3/3; `node --test __tests__/docs-uniqueness.test.js` → 6/6. The census oracle passing at `102` is the load-bearing one: it proves T-00a's exclusion landed with the right prefix even though T-00a's own row still reads `⬚`.

**Two bookkeeping inaccuracies, neither load-bearing.** (1) The v1.0 entry anchors the first of the three TSPEC-version body citations at `:66`; that line now sits at `:68`, because the entry's own two added lines shifted the body down — the anchor went stale in the act of being written. The substance is right: `grep 'TSPEC v[0-9]'` finds exactly three body sites (`:68`, T-05 `:157`, T-06 `:158`) and all three are provenance-of-an-edit (*"promoted at TSPEC v0.8"*, *"TSPEC v0.8's other three items … were already absorbed"*), not claims about HEAD, so §7.3's permitted history form is correctly invoked. (2) T-19 now reads `✅` while its declared dependencies T-17 and T-18 still read `⬚` — but T-18's wiring is in fact present at HEAD between the sentinels (`pdlc/workflows/orchestrate-dev.js:15688`–`:15709`, with the required destructured `const { enabled: decisionLedgerEnabled }` at `:15692` and `wrapperSeams._injectDecisionLedger` at `:15704`), and `reviewLoop`'s awaited `ledgerBlock` is at `:9992`. So the ledger **understates** completion; nothing was executed out of order and no work is skipped by the mark.

## Positive Observations

- Four pins moved at once and every one was re-measured with `shasum -a 256` before the entry was closed, not after. All four agree with disk byte-for-byte, and the Baseline's `Version` field is quoted verbatim (`1.2 · 2026-08-28`) rather than paraphrased — which is what let me check it in one command.
- The entry does not merely claim the movement is immaterial; it names *what each of the four changelogs did* in checkable terms. Every one of those four characterisations survived a diff, including the awkward one (REQ's `v{1,2,3,4,5,6}` → `v{1,2,3,4,5,6,7,8,9}` numeral change, which the entry pre-empts by naming the *Cross-Reviews* row).
- Correcting my v11 Low finding **inside the round it was raised against**, without reopening anything else, is the right disposition: the enumeration was short by one, it now names both operands, and the verdict the passage reaches did not have to move.
- TSPEC v1.3 replacing `FSPEC v1.3's E-7` with `FSPEC E-7` is the same lesson this feature keeps re-learning, applied upstream: a version numeral in a pointer is guaranteed staleness. Finding (1) below is that lesson's own counter-example, one document down.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Low | delta | local | The v1.0 entry anchors the first TSPEC-version body citation at `:66`; the entry's own two added lines shifted it to `:68`. All three sites verified provenance-of-an-edit, so the conformance conclusion is unaffected — only the anchor is off by two. | Revision history, v1.0 entry (`:19`); cited site now at `:68` |
| F-02 | Low | delta | local | T-19 flips to `✅` while its declared dependencies T-17 and T-18 remain `⬚`, although T-18's wiring is present at HEAD (`pdlc/workflows/orchestrate-dev.js:15688`–`:15709`). The ledger understates completion; no work is skipped and nothing ran out of order. | Task table, Status column (`:171`) |
| F-03 | Low | inherited | nonlocal | T-00a's prose reads *"the live directory measures 154 files and exactly 102 after those exclusions"*; the directory now measures **166** (the twelve `decisionLedger*` modules landed). The load-bearing half — exactly `102` after the five exclusions — is true at HEAD and green (`documentOracles.test.js:426`). | T-00a row (`:150`) |

DEFERRED: T-00a's "154 files" figure is a pre-feature census that HEAD has outgrown; re-measure it (or restate it as "at the pre-feature baseline") in whichever later round next opens the row.

FINDING: Low | delta | local | Revision history, v1.0 entry (:19) | The entry anchors the first TSPEC-version body citation at `:66`, but the entry's own two added lines moved that site to `:68`; substance verified (three sites, all provenance-of-an-edit), only the anchor is stale
FINDING: Low | delta | local | Task table Status column (:171) | T-19 marked `✅` while declared deps T-17/T-18 still read `⬚`, though T-18's wiring is present at HEAD (orchestrate-dev.js:15688–15709) — the ledger understates completion rather than overstating it
FINDING: Low | inherited | nonlocal | T-00a row (:150) | "the live directory measures 154 files" is stale at HEAD (166 after the twelve decisionLedger modules landed); the load-bearing "exactly 102 after those exclusions" is measured true and green

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

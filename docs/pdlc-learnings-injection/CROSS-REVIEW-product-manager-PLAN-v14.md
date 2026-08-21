# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.2)
**Date:** 2026-08-21
**Iteration:** 14 (delta confirmation, erratum round)

## Overview

**What changed, and against what base.** `git diff aca213a9..HEAD` on the PLAN is **36 insertions,
5 deletions**: the version cell (`1.1` → `1.2`), a new `### Post-batch remediation (CODE_REVIEW v1)
— outside the batch ladder` subsection inside §File-ownership manifest, one appended sentence
scoping §The arithmetic to the two dispatcher-parsed tables, a rewritten P-A-7 case-C row, commit
re-pins inside the v0.8 and v1.1 changelog rows, and a new 1.2 changelog row. No other byte moved.

**Verdict up front: three of the four routed items land cleanly; the fourth lands only in part, and
the part it left behind is a High.** Items 1 (commit re-pins), 2 (case C recorded as discharged) and
3 (the four unowned remediation files recorded) are resolved, and I verified each against the
repository rather than against the changelog's account of it. Item 4 — the second-owner rows P-A-5
requires for `2fc6fcd3` — records **two** second writes. The commit actually makes **nine**, one of
them to production `orchestrate-dev.js`, the file the manifest owns with eight ladder rows. The new
section states as fact that the commit "touched six test-side surfaces"; at HEAD that is false, and
the manifest still does not reconcile with the tree. **One High, one Medium, four Lows. Needs
revision.**

**Scope of this pass.** Per DEC-ERR-03 I measured the changed regions against upstream at the
version pinned in this dispatch, not against the item list. I re-hashed all four upstream documents:
REQ `32cb8b7d…`, FSPEC `ef230199…`, TSPEC `1ddfdbc3…`, DECISIONS `87ec8ebc…` — all four match the
dispatch pins exactly, so no upstream text this PLAN leans on has moved underneath it since the
round opened. Every commit pin, file inventory and test count in the new bytes I resolved myself.

## Batches

**No task row moved, and none could have.** The diff touches no `LI-*` row, no `Batch` cell, no
`Deps` cell and no AT partition. Both dispatcher-parsed manifest tables are byte-unchanged — I
diffed them column by column against `aca213a9`. The new material is one subsection appended after
them plus one sentence appended to §The arithmetic. That containment decision is the right one and I
say so in Positive Observations: the dispatcher parses `Owner` as a task id, and a row reading
`2fc6fcd3` or `none` would have been a stale-row contract violation.

### The routed manifest item lands, but only for two of the nine second writes

The new §Post-batch remediation opens with a factual claim about the tree: `2fc6fcd3` "landed after
batch 13 and touched **six test-side surfaces**". I resolved the commit and enumerated it
(`git show --name-status 2fc6fcd3`). It touched **twenty** files, and the discrepancy is not
bookkeeping — it changes which of the manifest's own rules are still satisfied at HEAD:

| Surface at `2fc6fcd3` | Status | Manifest owner | Recorded by this delta? |
|---|---|---|---|
| `helpers/learningsBaselineScenarios.js` | added | none | **yes** |
| `helpers/learningsComposition.js` | added | none | **yes** |
| `learningsDisclosure.test.js` | added | none | **yes** |
| `learningsErratumBinding.test.js` | added | none | **yes** |
| `fixtures/learnings-baseline/**` | modified | LI-06 / batch 4 | **yes** (second writer) |
| `learningsBaselineGuard.test.js` | modified (70/130) | LI-06 / batch 4 | **yes** (second writer) |
| `pdlc/workflows/orchestrate-dev.js` | **modified (15/6) — production** | LI-15…LI-22, eight rows | **no** |
| `scripts/capture-learnings-baseline.mjs` | **modified (74/19) — production** | LI-05 / batch 3 | **no** |
| `pdlc/workflows/.gitignore` | modified (1/0) | one ladder row | **no** |
| `learningsSelect.test.js` | modified (39/16) | LI-07 / batch 3 | **no** |
| `learningsCaptureScript.test.js` | modified (222/1) | LI-03 / batch 2 | **no** |
| `learningsConfig.test.js` | modified (235/2) | LI-12 / batch 5 | **no** |
| `learningsDispatchSet.test.js` | modified (113/24) | LI-11 / batch 5 | **no** |
| `learningsArmInventory.test.js` | modified (0/7) | LI-23 / batch 5 | **no** |
| `learningsCorpus.test.js` | modified (0/3) | LI-09 / batch 3 | **no** |
| `pdlc/engine/__tests__/learnings-config-example.test.js` | **added** | none | **no** |
| `pdlc/workflows/package.json` | **modified (13/6)** | declared *"not modified"* in prose | **no** |
| `pdlc/workflows/dist/pdlc-cli.mjs` | modified | no owner, by design | covered by existing prose |
| `coverageInstrumentation.test.js`, `pdlc/engine/__tests__/docs-uniqueness.test.js` | modified | outside this feature's manifest | n/a |

The section's own stated rule is the one it under-applies. It says two of the surfaces "are **second
writes** to files the batch ladder already owns, which is exactly the case P-A-5 says must be
recorded as a manifest amendment rather than left in a completion note." P-A-5's answer cell is
explicit about the form: **"one added row per file, naming the causing task and its batch."** Nine
files that the manifest assigns to a named `LI-*` owner received a second write in this commit; two
of them got a row. The remaining seven — including a **production** write to `orchestrate-dev.js`,
the file the manifest protects with its most emphatic single-writer paragraph ("Eight source edits,
eight batches, one writer each") — are in exactly the state P-A-5 says enforces nothing.

The `orchestrate-dev.js` write is not cosmetic. `2fc6fcd3` changes `selectLearnings`'s **signature**
(dropping the `feature` parameter), updates its caller in `buildLearningsInjector`, rewrites the
`RSN-COUNT` mixed-case comment from *"routed as `ERRATUM: FSPEC`"* to *"stated upstream as of FSPEC
v0.14's BR-6 … there is nothing left routed"*, and wires a live `_log` emitter into `main()` for
CODE_REVIEW v1 F2. That is a production behaviour change to a ladder-owned file, landing outside the
ladder, invisible to the manifest. Filed as F-01, High.

### The prose claim that package.json is not modified is false at HEAD

§Production and generated states, as one of two deliberate no-owner exceptions:
"`pdlc/workflows/package.json` is **not** modified: `scripts/capture-learnings-baseline.mjs` is
deliberately left outside `c8.include`, exactly because `orchestrate-dev.js`, `orchestrate-queue.js`
and `build-runtime.mjs` are resolved relative to `pdlc/workflows/`." At HEAD `package.json` **is**
modified by `2fc6fcd3`: `allow-external: true` is set, all four include entries are rewritten as
`**/`-anchored paths, `**/scripts/capture-learnings-baseline.mjs` is now **inside** `c8.include`,
and an `exclude` block for capture worktrees is added. The commit message region records this as
CODE_REVIEW v1 F4, second round. So the exemption this paragraph justifies no longer exists, and
DoD 11's "silence" rationale rests on a premise the tree contradicts. These bytes are pre-round, and
this edit did not touch them — but they sit inside the very section this edit was dispatched to
reconcile with `2fc6fcd3`, so the reconciliation is where the correction belongs. Filed as F-02,
High, tagged `inherited` so it routes back rather than halts.

### The eighteenth file

Changelog item (3) states the arithmetic it is closing: "fourteen test rows against **eighteen**
`learnings*` files tracked at `09c7c62f`." I counted at HEAD: seventeen under
`pdlc/workflows/__tests__/` (thirteen `learnings*.test.js`, three helpers, plus the fixtures
directory carried as its own row) and one more — `pdlc/engine/__tests__/learnings-config-example.test.js`,
**added by the same `2fc6fcd3`**. The four rows this delta adds close thirteen-plus-four = seventeen.
The eighteenth is the engine-side file, and it is owned by no `LI-*` row and appears in no manifest
row, which is the same defect the routed item named. Filed as F-03, Medium.

## Dependencies

**No `Deps` edge changed.** The diff contains no line inside §Dependencies and no `Deps` cell. This
delta scheduled nothing.

**Item 1 — the commit re-pins — is fully resolved, and I resolved every pin myself.** The three
pre-rebase hashes I raised at v12 are gone from the document; `git log` confirms `92b7ea0c`,
`d462ddd8` and `2cbacada` are all unreachable from HEAD, and the three replacements resolve to the
right tasks on the branch:

| Pin | Resolves to | Reachable from HEAD |
|---|---|---|
| LI-21 `e7fa8d87` | `feat(pdlc-learnings-injection): LI-21 — GREEN the run wiring and the report key` | yes |
| LI-16 `be2456c8` | `feat(pdlc-learnings-injection): LI-16 — GREEN pure core (TSPEC §I.3, §D.3–§D.6)` | yes |
| LI-17 `a4998e13` | `feat(pdlc-learnings-injection): LI-17 — GREEN renderer, renderLearningsBlock({selected})` | yes |

The re-pin is applied consistently: case C's *When* and outcome cells, the v0.8 changelog row and
the v1.1 changelog row all carry the new triple, so no reader lands on a hash they cannot resolve.
Re-pinning the historical changelog rows rather than leaving them "correct as of the day" is the
right call and the 1.2 row explains why in one sentence — those rows assert what is landed *at
HEAD*, so an unresolvable pin falsifies the claim rather than dating it. These are the same commits
under post-rebase identity; no historical claim changed. Item 1: closed.

**PROPERTIES agrees from its end.** §C.4 of PROPERTIES pins the same three commits (`e7fa8d87`,
`be2456c8`, `a4998e13`) and the same measurement anchor `09c7c62f`, so the two documents now name
one set of commits between them. That was the asymmetry my v12 raise was about, and it is closed.

**One PROPERTIES-side lag, recorded rather than raised.** §C.4's closing paragraph still offers case
B's route — "or, if it lands red, its rows are amended into the ledger by name first, under the same
P-A-7 rule" — which is the wording this PLAN's P-A-6 cell corrected at v1.1 by routing to "P-A-7's
governing case" instead. At HEAD that governing case is C, where no ledger remains to amend into.
The PLAN's side is right; the lag is downstream's field to advance, and recording it here keeps the
finding with its owner rather than charging this document for it.

**No upstream drift.** DEC-ERR-03 asks whether this PLAN is still a faithful compression of upstream
at upstream's current version. I re-hashed all four: REQ, FSPEC, TSPEC and DECISIONS match the
dispatch pins byte for byte, so nothing the changed regions cite has moved. The one upstream-facing
claim the new bytes make is case C's production paragraph (an optional ordinal stripped via
`SECTION_HEADING_RE`, an optional trailing gloss stripped, case-sensitive comparison against
`BR6_SECTION_NAMES`, `###` never matching `^##[ \t]+`), carried byte-identical from the bytes I
approved at v13. I re-derived it from shipped source at HEAD: `SECTION_HEADING_RE` is
`/^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/` at `orchestrate-dev.js`, `canonicalSectionName` tests
`BR6_SECTION_NAMES.includes(title)` before its gloss loop, and no `###` line can match a
`^##[ \t]+` anchor. All four clauses hold. Note in passing that `2fc6fcd3` also rewrote the
`RSN-COUNT` comment in the same file from "routed as `ERRATUM: FSPEC`" to "stated upstream as of
FSPEC v0.14's BR-6 … there is nothing left routed" — code and specification agree at HEAD, which is
consistent with the FSPEC I hashed, and is a further reason that production write deserved a row.

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict

# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.1)
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** Local (F-01, F-02, F-03)
**Prior review:** `CROSS-REVIEW-product-manager-PLAN-v1.md` (4 High, 1 Medium, 1 Low)
**Diff reviewed:** `git diff 46f59e0a..HEAD -- docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md`

## Disposition of v1 findings

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved (with residue — see F-01 below)** | `advisoryDisabled.test.js:622` folded into batch-1 `A6-03`, with the ownership manifest row extended and the batch-1 gate wording naming the new red. |
| F-02 | High | **Resolved (with residue — see F-01 below)** | `advisoryQueueSeams.test.js:627` likewise folded into `A6-03` and the manifest. |
| F-03 | High | **Resolved** | `A6-18` now states the tier gate is implemented by receiving the resolved `advisoryTierOn` (`orchestrate-dev.js:13678`) with no new `.enabled` read, preserving PROP-DIS-06's count of three. Verified today: `orchestrate-dev.js:3258`, `:13678`, `orchestrate-queue.js:1318`. |
| F-04 | High | **Resolved** | `A6-15` now allocates AC-1.5 as a disjunction: BL-03-absent alone, BL-04-absent alone, both-absent (one statement, never two). AT coverage row updated to match. |
| F-05 | High | **Resolved** | Arm (iv), the zero-count discriminator on a run where A6 *does* apply, is named in `A6-15`, in the AT coverage row and in the DoD checklist. |
| F-06 | Low | **Addressed, but the fix introduced F-02 below** | `A6-06` now writes the whole `advisory` section including `enabled` — good — and additionally directs a line into `pdlc/README.md`, which no task owns. |

Also confirmed resolved, though not mine to gate: the coverage claim is now correct as
written — `pdlc/workflows/package.json`'s `c8.include` is exactly
`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, and stage 2 applies
`--per-file --branches 85` to all three, so "cannot fail" was rightly withdrawn.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The v1 F-01/F-02 remediation landed two of the four bare row-count surfaces; `advisoryHarvest.test.js` still carries two, and one of them is invisible to the very instruction `A6-03` gives its implementer.** The revised §"Two facts" claims batch 1's set "is derived by grepping the suite for `advisory.rows` and `toHaveLength` as well as for seam members" and that "Batch 1 retargets all eight". Running exactly that grep today returns **four** bare row-count sites, not two: `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, **`advisoryHarvest.test.js:571`** and **`advisoryHarvest.test.js:726`** — all four `expect(...advisory.rows).toHaveLength(5)`, all four cardinality-coupled to `ADVISORY_SEAMS` through `advisorySummaryRows` (`orchestrate-dev.js:2989`–`:2992`). The `:571` site sits one line above a seam-name literal (`:573` `toEqual(["A1","A2","A3","A4","A5"])`), so an implementer retargeting seam literals will meet it. **`:726` does not**: its neighbourhood is `result.advisory.rows.find((r) => r.seam === "A1")` — a member *lookup*, not a member *list* — so the instruction `A6-03` actually carries for this file ("`advisoryHarvest.test.js` and `consolidationProperties.test.js` retarget their seam literals") does not reach it. The consequence is the one v1 F-01 named, unchanged: `advisoryHarvest.test.js` has exactly one owning task, `A6-03` in **batch 1**; once `A6-05` adds `A6` in batch 2, `:726` reads `6 !== 5` and reddens batch 2, whose gate declares "Whole `pdlc/workflows` suite green", and batch-safety rule 2 forbids any batch-2 task from touching the file. **Fix:** name all four sites explicitly in `A6-03`'s task text (it already names two by `file:line` — do the same for `advisoryHarvest.test.js:571` and `:726`), and add them to batch 1's gate wording, which today says "the two bare `toHaveLength(5)` row counts now reading `6`". No manifest change is needed: `A6-03` already owns the file. | AC-1.4, AC-1.6-equivalent (AT-01-6); PLAN §Overview "all eight", batch-1 and batch-2 gate wording |
| F-02 | High | Local | **`A6-06` directs a write into `pdlc/README.md`, which appears in no Source File cell, no ownership-manifest row, and no upstream file map — so the one operator-facing sentence the feature owes cannot be committed.** The task text reads: "Since JSON admits no comments, the affordance is carried by the key pairing plus one line in `pdlc/README.md`'s advisory section." `A6-06`'s Source File cell is `.claude/pdlc.config.example.json` alone, and the ownership manifest's `A6-06` row is the same single path. The wave loop commits strictly `task.files` (`orchestrate-dev.js:14398` `const paths = Array.isArray(task.files) ? task.files : []`, committed at `:14405`) plus `implementation.postWavePathspecs` (`:14417`, which is `pdlc/workflows/dist/`), so a README edit in batch 2 is written and then **never committed** — it strands in the working tree for the remaining twelve batches and reaches neither the branch nor the PR. This also breaks the PLAN's own stated manifest rule ("One row per file. Every file appears in exactly one row"), and TSPEC §5.1's file map names no README row either, so the write is unsourced from the spec chain as well as unowned. Two secondary facts against the sentence as written: `pdlc/README.md` has **zero** occurrences of `advisory` today, so "`pdlc/README.md`'s advisory section" names a section that does not exist; and no REQ acceptance criterion demands documentation, which is why v1 F-06 was Low and offered "or drop the word 'documented' upstream" as an equally acceptable close. **Fix:** pick one and make it whole — either (a) add `pdlc/README.md` to `A6-06`'s Source File cell **and** its manifest row, and say the line creates a new advisory subsection rather than joining one, raising an erratum so TSPEC §5.1's file map carries the row; or (b) drop the README clause and let the `enabled` + `waveBudgetPerRun: 0` pairing in the example config carry the affordance alone, which is what v1 F-06 asked for and what the rest of the task already delivers. | AC-1.4; TSPEC §4.4, E-33; TSPEC §5.1 file map; PLAN §File-ownership manifest |
| F-03 | Low | Local | **The Overview's file count and the ownership manifest can only be reconciled by knowing which reading is intended.** "Eleven test-side files under `pdlc/workflows/__tests__`, ten of which already exist" is true if and only if `__tests__/helpers/advisoryDoubles.js` is excluded (it is a fixture, not a `*.test.js`); the manifest lists twelve paths under that directory. Verified: the eleven `*.test.js` files are exactly the manifest's set minus the helper, and `advisoryWaveGate.test.js` is genuinely absent today. Non-gating, but the sentence was already edited this round and a reader checking it against the manifest gets a mismatch. **Fix:** "Eleven test-side `*.test.js` files … plus one shared fixture helper". | PLAN §Overview vs §File-ownership manifest |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's residue suggests the enumeration bar should be mechanical rather than narrated: would `A6-03` be safer stated as "every `expect(*.advisory.rows).toHaveLength(N)` and every seam-name literal in `pdlc/workflows/__tests__`, enumerated by `grep -rn 'advisory.rows\|SEAMS\|"A5"' __tests__`", with the current list as the *expected output* of that grep rather than as the contract itself? A per-file line-numbered list that the batch-1 gate re-derives is falsifiable; a prose count of "eight" is not. |
| Q-02 | On F-02(a): if `pdlc/README.md` becomes an owned path in batch 2, does anything else in the repo's own delivery chain need it — e.g. does the DoD document-drift scan or `ci-arrangement.test.js`'s neighbours assert on README content today? I found nothing, but the answer decides whether option (a) costs one manifest row or a second expectation. |

## Positive Observations

- **`A6-04`'s re-homing is the strongest change in this round, and it is right for a product reason, not just a testing one.** `pdlc/engine/__tests__/ci-arrangement.test.js` declares itself at `:1`–`:21` the single oracle for FSPEC §5.1's CI arrangement and carries zero `advisory` occurrences (both verified). Hanging a config-schema assertion there would have let an unrelated example-config edit redden `Engine tests (ubuntu-latest)` — a delivery-blocking required check — for a reason no operator reading the check name could diagnose. Moving it to a purpose-named new file, and saying so in the task text with the reason attached, protects the delivery path rather than just the file.
- **The `test.todo` reasoning is grounded, not asserted.** `A6-09` now names `scanSkipTokens`'s exact regex behaviour and `checkWaveUnskips`' halt path as the reason `.skip` is unusable for OQ-7's pending marker. Verified at `orchestrate-dev.js:11146` (`/\b(describe|test|it)\.skip\s*\(/g`), `:11213`, `:11285`. A pending marker that would silently halt wave 5 is exactly the kind of defect that surfaces mid-implementation and looks like a mystery.
- **`A6-00`'s `pathsCollide` withdrawal is stated with its own failure mode.** `function pathsCollide(a, b)` at `orchestrate-dev.js:4726` carries no `export` and is referenced only at `:10961` — verified — so an import-based existence assertion would have opened batch 1 on a red whose own gate wording ("red there means the baseline moved and this PLAN is invalid") would have misdiagnosed. Naming that misreading in the task text is what makes the removal safe rather than merely convenient.
- **The AC-1.5 correction went further than the finding asked.** v1 F-04 asked for the disjunction and F-05 for the discriminator; the revision delivers both plus the sentence that makes arm (iv) load-bearing ("without it a carrier that emits the notice unconditionally satisfies (i)–(iii) and nothing catches it"), and propagates the four arms into the AT coverage row and the DoD checklist rather than leaving them in one cell. A P0 acceptance criterion's central observable is now falsifiable in both directions.
- **Every code citation added this round verifies.** `orchestrate-dev.js:2989`–`:2992`, `:3258`, `:13675`–`:13678`, `:4726`, `:10961`, `:11146`–`:11150`, `:11213`, `:11285`, `orchestrate-queue.js:41`/`:1318`, `pdlc/workflows/package.json`'s `test:coverage` and its three-file `c8.include`, and the absence of both `advisoryWaveGate.test.js` and `pdlc/engine/__tests__/advisory-config-example.test.js` all land where claimed. F-01 and F-02 are enumeration gaps, not citation looseness — the document remains unusually careful for its size.

## Recommendation

**Needs revision**

All four v1 Highs are genuinely resolved, and the AC-1.5 and PROP-DIS-06 repairs are better
than the findings asked for. Two Highs remain, both narrow and both consequences of this
round's edits rather than new territory:

1. **Name all four bare row-count sites in `A6-03`**, not two: add
   `advisoryHarvest.test.js:571` and `:726` to the task text and to batch 1's gate wording.
   `:726` is the one a member-literal reading of the instruction cannot reach, and
   `advisoryHarvest.test.js` has no owner after batch 1 — so leaving it unnamed reproduces
   exactly the batch-2 halt v1 F-01 described. (F-01)
2. **Close `A6-06`'s `pdlc/README.md` hole** one of two ways: own the file (Source File cell
   + manifest row + TSPEC §5.1 erratum, and say the line *creates* an advisory subsection,
   since none exists), or drop the README clause and let the `enabled` + `waveBudgetPerRun`
   pairing carry the affordance alone. As written the sentence directs a write that the
   wave loop cannot commit. (F-02)

*(Non-gating)* Reconcile the Overview's "eleven test-side files" with the manifest's twelve
paths by naming the fixture helper separately. (F-03)

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 0, "low": 1}

---
feature: pdlc-workflow-distribution
---

# PLAN — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-…md` v17.0 (approved) → `FSPEC-…md` v5.1 (dual-approved) → `TSPEC-…md` v2.1 (dual-approved) → `PROPERTIES-…md` v2.1 (dual-approved) → **PLAN** |
| Downstream | implementation (`se-implement` batches dispatched by `tech-lead`), DoD, PR |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PLAN-v1.md`, `CROSS-REVIEW-test-engineer-PLAN-v1.md`, `CROSS-REVIEW-product-manager-PLAN-v2.md`, `CROSS-REVIEW-test-engineer-PLAN-v2.md` |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 2.1 | 2026-07-28 |

> **Altitude.** The TSPEC says *how it is built and how it is proved*. This PLAN says **in what order,
> by how many concurrent agents, and against which failing test each unit of work is written**. It
> invents no behavior: every task cites the TSPEC section, the named `it()` blocks, or the PROPERTIES
> property ids that gate it. Where a task's content is fully specified upstream, this document names
> the section rather than restating it.

---

## 0a. Revision note — v2.0 (2026-07-28)

Addresses `CROSS-REVIEW-product-manager-PLAN-v1.md` (1H / 3M / 3L + 4 questions) and
`CROSS-REVIEW-test-engineer-PLAN-v1.md` (3H / 4M / 3L + 3 questions). Every High and Medium is
fixed; every Low is fixed. Upstream REQ/FSPEC/TSPEC/PROPERTIES are approved and **untouched** — where
a fix exposed an upstream tension it is recorded as a PLAN-level note (PL-05), not as an edit.

### High

| ID | Disposition |
|---|---|
| **PM F-01** | **Fixed — Phase 7 resequenced.** Order is now `L-02 → L-03 → L-04 → L-07 → L-08 → L-06 → L-01 → L-05 → L-09`: every additive/preparatory task first, the destructive `git rm --cached` + gitignore **second-to-last**. Batch numbers, `Deps` and §4.1's manifest all re-derived. Each landing row now states its **halt state** (disk, index, one-line recovery), and §1 adds the compensating control that makes every halt safe: **batches 14–21 do not commit**, so `HEAD` keeps the four bundles tracked throughout. |
| **TE F-01** | **Fixed — AT-7's `driftClassify.test.js` half is T-22's**, with the `unverifiedRow` fixture, the `unverified` classification and the `--check` exit-2 conjunct spelled out; T-38 keeps the queue half. §9's "39 ATs" line now shows the derivation from the task table, including all four split ATs. The straddle (classification observable at batch 8, exit code only at batch 11) is recorded as **PL-05**; no TSPEC edit is proposed. |
| **TE F-02** | **Fixed — the mutation-pair prose is replaced by §3.1's falsification ledger**, a checkable mechanism that does not depend on a per-property `Falsifies` column (the review is right: PROPERTIES has none, and the v1.0 citation is withdrawn). Each green property needs a recorded triple — mutation **named before the run**, red observed with a case count and first failure message, revert observed green with `git diff --exit-code` clean. Wired into **§5's batch 12/13 gate**, **§8's Phase-CR row** and **§9's DoD**. Properties with no nameable mutation are filed as residuals, not green. Ledger ownership is fragment-per-task (T-40 header → T-41…T-49 fragments → T-50 concatenates), so batch-safety rule 2 holds. Flagged as **PL-04**. |
| **TE F-03** | **Fixed — honestly, on both legs.** The false claim ("each layer independently red-testable") is withdrawn from §3 note 1 and PL-03. Layers 2–5 genuinely had no observable, so v2.0 adds **T-39**, a sourced-probe driver on TSPEC §11.2's own `backup-grammar.sh` precedent, and gives each layer a real sourced green — tabulated per batch in Phase 4's preamble, with the entrypoint-mediated residual named per layer. §5's batch 6–10 gate is now two conjuncts: the layer's **new green** must pass **and** the enumerated red list must strictly shrink. |

### Medium

| ID | Disposition |
|---|---|
| **PM F-02** | **Fixed — one commit, assembled across eight batches.** §1 states it as a task instruction ("defer-commit"), every L-* row repeats "do not commit", §5's batch 14–21 gate states it, L-09 makes the commit, and §8's one-commit Phase-CR check is therefore satisfiable. Answers **PM Q-02**. |
| **PM F-03** | **Fixed** — T-14 now names per-row `artifactVersion` and top-level `pluginVersion`, both read from `plugin.json` (TSPEC §2.3 point 2's dropped sentence), and §9 gains a **REQ-DIST-05** line covering AC-5.1/5.2/5.4 with AC-5.3 explicitly left as R-12. |
| **PM F-04** | **Fixed** — new **§6.3** enumerates L-06's second half as three rows (D-1 `CLAUDE.md` build section, D-2 `CLAUDE.md` plugin/hooks tables, D-3 `pdlc/README.md`), each with a per-file oracle that does **not** route through `coveredViolations`, plus a §9 DoD line. The two pending-queue REQs are **decided out**, with the reason (editing another feature's approved REQ from this landing commit is unreviewed) and a compensating control at the right seam: `QUEUE.md` `Notes` lines, recorded as obligation **PQ-1** in §7. |
| **TE F-04** | **Fixed** — **L-06 runs `build-runtime.mjs` itself** and stages the regenerated `dist/` in its own batch, so there is no stale-bundle window and no fifth expected red. §4.1's `dist/**` row gains `L-06→19` (batch differs from L-05's 21, so rule 2 holds); §1 constraint 2 and §5's landing gate updated. |
| **TE F-05** | **Fixed, with the counts re-derived from the documents.** §14.1 is **18** rows (2+5+3+1+4+3). PROPERTIES holds **63 distinct ids** (8 CLS, 6 RSN, 8 BSL, 13 BKP, 7 MTM, 8 SEAM, 6 DET, 7 NEG) = **75 placement rows** in §12 counting split halves — v1.0's 65 matched neither, and the review's 55 omitted the eight `PROP-SEAM-*`. §9's floor bullet is restructured into set-equality floors vs reached-once floors vs remediation-class pairings, and the **message-catalogue `distinct()` floor** (AT-30, T-28) is added. |
| **TE F-06** | **Fixed** — L-01's two negative conjuncts run `git check-ignore -v --no-index`; the index-consulting form is kept only for the third conjunct, which is correct there because L-01 untracks first. Verified empirically 2026-07-28: with `b/` ignored and `a/b/f.txt` tracked, `git check-ignore -v a/b/f.txt` exits 1 silently while `--no-index` prints `.gitignore:1:b/`. §8 and §9 updated. |
| **TE F-07** | **Fixed** — T-01's scope is extended (it is exactly the file PL-02 exists for) into four labelled clauses: (a) capability/harness, (b) **T-15's** fixture-builder contracts, (c) **T-16's** trace/ordering contracts, (d) **T-18's and T-39's** driver contracts. T-15/T-16/T-18/T-39 now cite `driftHelpers.test.js` with the clause that gates them, and add `T-01` to `Deps`. T-18 no longer cites `driftBackups.test.js`, which is a consumer, not a gate. |

### Low, and the questions

| ID | Disposition |
|---|---|
| **PM F-05** | Fixed — §9 gains a **REQ-DIST-04** line naming AC-4.1's outcome table (incl. row 2 above the blocking rows), AC-4.3's announced opt-out, the one-read rule and §12.3's returned report. |
| **PM F-06** | Fixed — a "**do not merge from batch 3 until L-05**" note sits under §5's gate table, with the AC-6.6 reason. |
| **PM F-07** | Fixed — §3 note **10** records the choice as a deliberate product trade-off (a vacuous property halts at 100% built / 0% landed), notes that v2.0's resequencing bounds the blast radius, and states the manual fallback. |
| **TE F-08** | Fixed — PL-01's rationale is corrected: `.gitignore` never affects an already-tracked path, so the "uncommittable without `git add -f`" reason is withdrawn. The real hazards are a **future** `dist/` artifact being silently unstageable and `git status` losing AC-6.6's working-tree observation point. Resolution unchanged. |
| **TE F-09** | Fixed — L-05 now states **which value at which point**: the batch gate reads `"green"` **pre-commit**, on the working tree where `plugin.json` differs from `HEAD` *and* `dist/` carries L-06's uncommitted changes (guaranteed by §1's defer-commit rule); §9's and L-09's `!== "red"` is the **post-commit** reading. |
| **TE F-10** | Fixed — T-07 exports the whole skip inventory (TSPEC §1.3 ∪ PROPERTIES §11.1) as frozen records plus a `REGISTERED_SKIPS` set, and T-01 asserts membership and non-empty invariant lists. "Zero unexpected skips" is now a comparator, not an eyeball pass. |
| **PM Q-01** | **Answered: ten, not eleven.** REQ v17.0 §6's in-scope list carries exactly **10** bullets — counted mechanically from the approved file (`build-runtime.mjs`; `runtimeBundle.test.js`; `plugin.json`; `hooks.json`; managed set/classification; hook + writer + sync + backups + retirement; queue integration + version stamping; execute bits ×5; the landing step; document corrections). Nothing was dropped between v16.0 and v17.0. The PLAN never states a count for §6, and every occurrence of "eleven" in this document refers to the **eleven bash suites** of Phase 3, which is correct and unrelated. |
| **PM Q-02** | Answered in **PM F-02**: one commit, assembled across eight non-committing batches, made at L-09. |
| **PM Q-03** | Answered: `git check-ignore -v --no-index` **is** the whole contract (PL-01, L-01). No consumer of TSPEC §10.1 expects a `/pdlc/workflows/dist/` pattern to exist — §10.1's requirement binds *anchoring*, conditional on such a pattern ever being added, and nothing in the plan adds one. |
| **PM Q-04** | Answered: **nothing in the plan runs `sync-workflows.sh` against the live repo.** AT-24 proves build-then-sync in a fresh clone; the live repo's `.claude/workflows/` is left as-is (its four copies stay on disk when L-01 untracks them) and re-established by the operator via L-08's documented bootstrap. Stated so DoD does not look for a live sync run. |
| **TE Q-01** | Answered: TSPEC §11.3's four pinned rows are the complete authoring source for `driftBackups.test.js`'s **example** half. The `nnExhausted ⇒ operation: backup`, exit-4 conjunct is asserted **in both places on purpose** — T-30 asserts it as §11.3's own row-4-adjacent case, and T-26 asserts it as part of `driftWriteFailure.test.js`'s `writeFailures.operation` meta-oracle, which is where §1.4's floor is counted. Different subjects (backup grammar vs the closed operation domain), so neither is redundant. |
| **TE Q-02** | Answered: **no batch gate reads wall clock, and R-3 is never asserted.** PROPERTIES P-R-7's ≈180-spawn / ≈27–45 s budget is a serial *design* budget behind the batched-driver decision, not a gate. Concurrent dispatch of batch 12's ten tasks means jest workers run those spawns in parallel, which can only reduce wall clock; the budget's purpose (keep `npm test` fast enough that a maintainer keeps running it — TSPEC §1.1 consequence 2) is assessed once, by observation, at L-09, and recorded, never asserted (same treatment as NFR-2). |
| **TE Q-03** | Answered: this repo has **no batch-report artifact**, so the ledger is it — `docs/…/FALSIFICATION-LEDGER.md`, tracked, in the diff, and an explicit Phase-CR input in §8's batches 12–13 row. See §3.1 and **PL-04**. |

### Also changed

- **§0's batch count is still 22.** T-39 lands in batch 4 beside the other helper tasks and adds no batch; Phase 7's reordering is a permutation, not a resize.
- **New PLAN-level notes:** **PL-04** (the ledger is a PLAN-added artifact) and **PL-05** (the AT-7 straddle — an upstream tension recorded, deliberately not edited into the TSPEC).

---

## 0b. Revision note — v2.1 (2026-07-28)

Addresses `CROSS-REVIEW-product-manager-PLAN-v2.md` (0H / 2M / 4L) and
`CROSS-REVIEW-test-engineer-PLAN-v2.md` (0H / 1M / 5L). Both Mediums and all nine Lows are
disposed below, by reviewer-qualified id. Upstream REQ/FSPEC/TSPEC/PROPERTIES remain **untouched**.
The batch column was re-derived after every edit: still **61 tasks / 22 batches**, and every row's
`Batch` still equals `max(Deps batch) + 1`.

### Medium

| ID | Disposition |
|---|---|
| **PM F-01** | **Fixed — the control moved to a field the queue parser reads.** §6.3's "pending-queue REQs" paragraph, §7's **PQ-1** row and §9's DoD line all now say the same thing: L-06 adds `pdlc-workflow-distribution` to row 8 (`pdlc-review-loop-hardening`)'s `Depends-On` cell in `docs/_queue/QUEUE.md` — a one-cell edit inside the file L-06 is already editing (it is §6.2 row 1) — which arms `orchestrate-queue`'s **existing** re-grounding gate (SKILL.md selection step 3d) rather than relying on a `Notes` column the shipped parser drops (`extra columns are ignored`, SKILL.md §1). Row 4 (`pdlc-consolidation-agent`) already declares `pdlc-workflow-distribution` in `Depends-On` and needs no edit — the gate already covers it. §9's DoD line no longer claims a `Notes` line is present; it asserts the `Depends-On` edit instead, so DoD cannot record an inert mitigation as discharged. |
| **PM F-02** | **Fixed — the landing gate and the per-row halt states are now cumulative.** §5's 14–21 gate is reworded: "each row's stated halt state, read as the **union of this row's delta and every prior landing row's uncommitted delta back to L-02**, must match what `git status` actually shows before the batch closes — never the row's delta in isolation." Every L-* row's halt-state sentence is restated cumulatively (L-03 through L-05 now name the accumulated prior deltas rather than "nothing else"/an isolated delta), and "nothing else" is dropped everywhere it appeared. §1's recovery text is split into two named modes: **resume** (per-row, unchanged — undoes only that row's delta, correct for continuing the window) and **abort-the-window** (the composite from L-02 through the halting row), and the abort's `git clean` is pathspec-scoped to the two untracked paths the window itself creates (`.worktreeinclude`, `RELEASE-CHECKLIST.md`) — `git clean -fd -- .worktreeinclude pdlc/RELEASE-CHECKLIST.md` — rather than a repo-wide `clean -fd`. |
| **TE F-01** | **Fixed — the oracles are on the row the dispatcher reads.** T-02's task row (§2 Phase 1) now enumerates D-1, D-2 and D-3 explicitly, alongside its existing AT list, so `se-implement` receives the obligation from the row it is dispatched, not from §6.3 alone. Phase 7's precondition paragraph (§2 Phase 7 preamble) now lists the §6.3 oracles as a **fifth** L-06-owned expected-red class alongside AT-22, so batches 14–18 do not halt on an unlisted red. |

### Low

| ID | Disposition |
|---|---|
| **PM F-03** (folds into TE F-01) | **Fixed by the same edit as TE F-01.** T-02's row now names D-1/D-2/D-3, so §6.3's table-header attribution ("asserted… by T-02") is no longer contradicted by §4.2's sole-ownership rule. §4.1's two rows for the same physical files (`pdlc/README.md, CLAUDE.md` and "the §6.3 `dist/`-path documents") are merged into one row. |
| **PM F-04** | **Fixed** — §3.1's "Where it is recorded" paragraph drops the stale first sentence ("a tracked file created by the first property task to run in batch 12…"); it now opens directly with the T-40-creates / fragment-append / T-50-concatenates design, matching T-40's row, §4.4 and §5's gate. |
| **PM F-05** | **Fixed** — PL-04 gains a lifecycle disposition: the ledger is **not** harvested or deleted by `harvest-learnings` (it matches neither the `CROSS-REVIEW-*` nor `CODE_REVIEW-*` pattern `guard-harvest-before-delete.sh` guards) and is **deliberately retained** post-Phase-CR as the project's falsification record, staying in `docs/pdlc-workflow-distribution/` beside `LEARNINGS-…md`. Stated once in PL-04 and once in §7's PL-04 row so a future reader does not have to infer it. |
| **PM F-06** | **Fixed** — §5's do-not-merge note is corrected: red through batch 21, and **mergeable only after L-09's landing commit** (batch 22), not after L-05 (batch 21) — L-05 commits nothing under defer-commit, so the version bump and the final `dist/` bytes enter history only at L-09. |
| **TE F-02** | **Fixed** — D-1's and D-3's negative conjuncts in §6.3 are restated as greppable predicates instead of semantic prose: D-1 — "no line in the section matches both `build-runtime` and `.claude/workflows/`"; D-3 — "no line in `pdlc/README.md` matches `.claude/workflows/` followed by `bundle`". Both now describe a mechanical string/regex check an implementer can assert directly, and neither contradicts D-1's own edit (which *adds* the string `.claude/workflows/` as the untracked-consumer-copy description). |
| **TE F-03(a)** | **Fixed by the same edit as PM F-04** — the stale §3.1 sentence is deleted (see above). |
| **TE F-03(b)** | **Fixed** — §4.4's ledger-fragment table gains a row for **T-50**: `docs/…/FALSIFICATION-LEDGER-T-50.md` at batch 13, appended by T-50 itself before it concatenates, covering PROP-MTM-05's, PROP-NEG-04's and PROP-BSL-05's queue halves. T-50's task row (§2 Phase 6) now states it writes its own fragment before concatenating. |
| **TE F-04** | **Fixed** — §5's merge note and Phase 7's precondition paragraph are corrected: the hazard is that `advertisedVersionViolation(LIVE_ROOT)` becomes **undetectable**, not loudly red, once a batch-6–20 state is committed (batches 7–18 read `"green"` pre-commit, per TSPEC §10.3's branch (a)); the note now leads with undetectability as the reason merging is unsafe, matching AC-6.6's accepted residual and `RELEASE-CHECKLIST.md` row 2, rather than claiming the oracle is red throughout. |
| **TE F-05** | **Fixed** — PL-03 now states that T-39's probe work inserts PLAN-authored `it()` blocks into **seven** TSPEC-owned suites (`driftRepoRoot`, `driftBaseline`, `driftClassify`, `driftSync`, `driftFault`, `driftBackups`, and the layer-5 reuse in `driftMessages`), declared the same way PL-02 declares `driftHelpers.test.js`'s normative-but-unplaced contracts, so a Phase-CR reviewer does not mistake a probe case for a TSPEC-mandated one and §8's batch-5 "every AT has a real `it()`" check is not read as an exhaustive-contents check. |

---

## 0. Summary

Ship the plugin-distribution mechanism: a sourced bash library (**C1**) plus two executable scripts
(**C2** the SessionStart drift hook, **C3** the sync/check entrypoint), a retargeted bundle builder
(**C5**, `dist/` + a distribution manifest), a queue-side drift gate (**C6**), a second SessionStart
hook registration (**C7**), three root-parameterised jest oracles, and a one-time, order-sensitive
landing step that untracks `.claude/workflows/`, fixes execute bits, bumps the plugin version and
corrects seven documents.

**Verification surface.** `cd pdlc/workflows && npm test` is the only automated surface (TSPEC §1.1;
REQ §0 fact 10 — `.github/` does not exist). Every assertion in this feature is a jest test under
`pdlc/workflows/__tests__/`; bash is exercised as a black box through `runScript()` (TSPEC §3.1).

**Blocking assumption BL-01 is discharged.** Nested `dist/` survives plugin packaging — measured
true 2026-07-28 (`${CLAUDE_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json` readable and
byte-equal to the repo copy in a locally installed package). **No spike batch is planned.** P0-00
re-records the measurement so a reviewer can see it was not assumed.

**Shape of the plan.** 22 batches. The critical path is **C1**, which TSPEC §2.1 fixes as a *single
physical file* (`pdlc/hooks/scripts/lib/pdlc-drift.sh`): the batch-safety single-writer rule
therefore forbids parallelising it, and its five layers occupy batches 6–10 on their own. Everything
that can run beside that chain does — the node-side track (C5, C6, the oracles) completes by batch 6,
and eleven RED suite-authoring tasks fan out in batch 5.

---

## 1. Conventions

**Status key:** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

**`[Fake first]` / RED-first.** Every green implementation task lists its red-test task in `Deps`.
RED-authoring tasks create a test file whose cases fail for a *named, specified* reason (usually
"the module/function does not exist yet"); they are labelled `[RED]`. Batches whose only content is
RED tasks are **RED-terminal** and carry the split gate wording in §5.

**`Batch` is a dispatcher contract.** Every row's batch is `max(batch of its Deps) + 1`; source rows
are batch 1. No two tasks in one batch create or append the same physical file — source **or** test.
The per-batch file-ownership manifest is §4.

**Paths are repo-root-relative and fully qualified.** `pdlc/workflows/__tests__/driftSync.test.js`,
never `driftSync.test.js`. Within the table the `pdlc/workflows/` prefix is elided **only** in the
`__tests__/…` forms, which are unambiguous; §4's manifest carries the full paths.

**Two repo constraints bind several tasks (CLAUDE.md).**

1. **Every injected IO call in a workflow source must be `await`ed** — the runtime adapter's
   implementations are async while the module test doubles are sync. This binds **T-13**
   (`readDriftStateSafely` and its call site in `main`).
2. **Bundles are rebuilt in the same commit as any workflow-source change**, via
   `node pdlc/workflows/build-runtime.mjs`; `__tests__/runtimeBundle.test.js` asserts freshness and
   the runtime's structural constraints. This binds **T-14** (which *moves* the output directory),
   **T-11 / T-12 / T-13** (which change `orchestrate-queue.js`), and **L-06** (the landing comment
   edits to `orchestrate-dev.js` / `orchestrate-queue.js` — **L-06 runs the rebuild itself**, in its
   own batch; TE F-04). `.claude/workflows/*.bundle.js` and `pdlc/workflows/dist/*.bundle.js` are
   **generated — never hand-edited**.

**Commit granularity (PM F-02, PM Q-02 — answered).** Batches 1–13 commit per batch, the dispatcher
default. **Batches 14–21 do not commit.** The landing is **one logical commit assembled across eight
batches**: each landing task edits the working tree and index, runs its own gate, and **defers the
commit**; the single landing commit is made at **L-09** (batch 22) after its checklist passes. This
is a task instruction, not a caption — every L-* row below repeats "**do not commit**", §5's batch
14–21 gate states it, and §8's Phase-CR "one commit" check is therefore satisfiable rather than in
conflict with the per-batch gates. Two consequences the plan depends on:

- **Halt safety.** A halt anywhere in batches 14–21 leaves an *uncommitted* working tree. `HEAD` is
  still the batch-13 state, in which `.claude/workflows/`'s four paths are **tracked** — so a
  worktree created from any commit still carries the bundles and the pipeline that is running these
  batches keeps working. Recovery has **two modes** (v2.1, PM F-02 — the halt states below are
  cumulative from batch 15 on, and one recovery composite does not serve both cases):
  - **Resume** (continue the window from the halted row): undo only the halting row's own delta,
    per that row's one-line recovery in §2 Phase 7, and re-run it. This is what each L-* row's
    stated recovery line means.
  - **Abort the window** (give up and return to the batch-13 state): `git reset && git checkout --
    . && git clean -fd -- .worktreeinclude pdlc/RELEASE-CHECKLIST.md` — the `reset` and `checkout`
    undo every landing row's tracked-file and index changes back to L-02 (safe repo-wide, since
    nothing outside the landing window is touched by batches 14–21), and the `clean` is
    **pathspec-scoped to the two untracked paths the window itself creates**, not a repo-wide
    `clean -fd` — an unscoped `clean -fd` would also remove any unrelated untracked file the
    operator has sitting in the tree.
- **The `dist/` working-tree window.** Because nothing in batches 14–21 is committed,
  `advertisedVersionViolation(LIVE_ROOT)` sees genuine working-tree changes under `dist/` at L-05,
  which is the branch its `"green"` value is defined over (§10.3). See L-05 and TE F-09.

---

## 2. Phased task list

### Phase 0 — Pre-flight gate

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| P0-00 | **Pre-flight gate (must be the first task).** Assert at HEAD, and record the outputs in the batch report: (a) `cd pdlc/workflows && npm test` is green; (b) node ≥ 18 and jest 29 resolve; (c) `git ls-files .claude/` returns exactly the four tracked paths `orchestrate-{dev,queue}.js` and `orchestrate-{dev,queue}.bundle.js`; (d) `pdlc/hooks/scripts/` contains exactly the three sibling scripts and `git ls-files -s` reports **`100644`** for all three (REQ §0 fact 11); (e) the live `coveredViolations` set is the **seven** files of §6.2 — measured by grep of the five patterns minus the four exemptions; (f) `pdlc/.claude-plugin/plugin.json` `version` is `0.10.0`; (g) **BL-01 is recorded discharged (measured true 2026-07-28, nested `dist/` survives packaging)** — no spike. The gate asserts **existence of the baseline only**; it asserts nothing about any symbol this feature creates. Halt and promote to blocking work on any mismatch. | *(gate — no test file)* | *(gate — no source file)* | 1 | — | ✅ |

### Phase 1 — RED scaffolds for the surfaces that need no bash (batch 2)

RED-terminal. Every file below is created failing; none is expected green at the end of the batch.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-01 | `[RED]` Author the helper-contract suite. **(a) Capability + harness contracts:** `describeOrSkip`/`itOrSkip` **throw** on an empty or absent `unverifiedInvariants` (TSPEC §1.3 contract 2) and take **four** parameters, name first (PROPERTIES §11.1); `makeToolDir` **throws** when a requested tool cannot be resolved (TSPEC §3.2.1); `readDriftState` returns `null` for absent and **throws** on unparseable (TSPEC §3.4 rule 2); `inodeOf` returns `bigint` (rule 3); `runGrammar` and `runProbe` each throw unless input and output line counts are equal (TSPEC §11.2). **(b) Fixture-builder contracts (T-15's gate — TE F-07(c)):** `makeConsumerTree`'s **eight** clauses of TSPEC §3.3, asserted one `it()` per clause against the returned paths (in particular `home` is a **sibling**, never an ancestor, of `consumerRoot`, both `realpathSync`d); `makePluginTree` **throws** when `manifestOverride` and `manifestRaw` are both given; `setRowState` **throws** when the tree it built re-derives to a different state (§3.3's self-oracle); `cleanup()` is idempotent (two calls, no throw) and succeeds over a `chmod 000` directory (§13.6). **(c) Trace/ordering contracts (T-16's gate — TE F-07(b)):** the §4.1 percent codec round-trips `%`, tab, newline and a byte outside `0x20`–`0x7E`; `parseTrace` **throws** on a record whose `phase` label violates §4.2's rule; `assertPhaseOrder` rejects a trace whose collapsed prefix is out of order; `assertPostCopyNarrow` is **multiset** equality (a duplicated row id must fail — TE F-01); `assertTreeUnchanged` ignores a mutation under a `.git/` segment and reports one outside it (TE F-12, R-8). **(d) Driver contracts (T-18's and T-39's gates — TE F-07(a)):** `backup-grammar.sh` round-trips a `format` case through `pdlc_backup_parse` and returns `err` for a malformed `parse` case; `lib-probe.sh` returns one result line per input case and `err` for an unknown function name. *PLAN-added file — TSPEC §14 names no home for these helper contracts, which are nonetheless normative TSPEC statements; flagged for reviewer attention as **PL-02**.* | `__tests__/driftHelpers.test.js` | — | 2 | P0-00 | ✅ |
| T-02 | `[RED]` Author `documentOracles.test.js` in full: AT-19, AT-20, AT-21, AT-22, AT-23, AT-28, AT-29 (TSPEC §14), the two-root independence assertion (§10), the `LIVE_ROOT/pdlc/workflows/dist/` write guard in `beforeAll`/`afterAll` (§10.2), the `advertisedVersionViolation(LIVE_ROOT) !== "red"` assertion (§10.3), the literal `EXEMPTIONS` four-member assertion and `EXPECTED_SEVEN` (§10.1), the **split** fixture guard: on-disk presence (every runner) + `itOrSkip("git", …)` tracked-ness via `git ls-files --error-unmatch` (§10.1, TE Q-04), **and §6.3's D-1, D-2 and D-3 oracles** (v2.1, TE F-01 — this row is the one the dispatcher hands `se-implement`, so the three cases live here, not only in §6.3's table): D-1's and D-2's two conjuncts each, and D-3's two conjuncts, all against `LIVE_ROOT`'s live document text; red from this batch until L-06. Fails on the missing module. | `__tests__/documentOracles.test.js` | — | 2 | P0-00 | ✅ |
| T-03 | `[RED]` Author `driftRecordShape.test.js`: the **sixteen** rows of TSPEC §12.1, one mutation per row off a frozen deep-cloned `VALID_RECORD`, each asserting the **clause id** (not merely `ok:false`), including row 4's re-wrapped envelope ⇒ `"D2"`, row 10's array-replaced-by-scalar, rows 12/13 and 14/15's split forms, row 16's tolerated `delete syncCommand` ⇒ `ok:true`, and §12.1's single-level envelope rule (`{"result":42}` ⇒ `"D3"`). Discharges **O-19(b)** — the implementer writes *this* table, not a new one. | `__tests__/driftRecordShape.test.js` | — | 2 | P0-00 | ✅ |
| T-04 | `[RED]` Author `queueDriftGate.test.js`'s **pure** half: TSPEC §12.2's ten `mapDriftState` rows (each fixture defeating every higher row, asserting `{outcome,row}`), the structural `report` Manifest/Row/Run split for rows 3/4/7, §12.3's three-way `_readFile` injection table (throw / `null` / `42` ⇒ row 1 `blocked`, asserting a **returned report**, never an abort), §12.4's one-read gate-placement test, and AT-36. Fixture-backed rows are **not** in this task (see T-38). | `__tests__/queueDriftGate.test.js` | — | 2 | P0-00 | ✅ |
| T-05 | `[RED]` Repoint `runtimeBundle.test.js` at `pdlc/workflows/dist/`: freshness via `build-runtime.mjs --check`, both bundle paths, **and** the new `dist/distribution-manifest.json` as a `--check` subject (TSPEC §2.3 point 3). Keep the existing structural constraints (first-statement `export const meta`, no other `export`, no `import`/`process`/`fs`). Fails until T-14 moves `OUT_DIR`. | `__tests__/runtimeBundle.test.js` | — | 2 | P0-00 | ✅ |
| T-06 | `[RED]` Author `bootstrap.test.js`: AT-24's **seven** assertions (TSPEC §9.2 — including assertion 7's string-equal `syncCommand` expansion with the no-`$`/no-`{` and W-5-agreement companions), §9.3's two independent mode-bit objects over **all five** scripts (index `100755` on `LIVE_ROOT`, `accessSync(X_OK)` on the clone; `lib/pdlc-drift.sh` **excluded**, OQ-4), and the dedicated `status !== 126` bare-path `it()`. | `__tests__/bootstrap.test.js` | — | 2 | P0-00 | ✅ |
| T-19 | `[RED]` Append to the existing `hookCompatibility.test.js`: `pdlc/hooks/hooks.json` carries a **second** `SessionStart` entry whose command invokes `check-workflow-drift.sh` through the same `${CLAUDE_PLUGIN_ROOT}` form the three shipped hooks use, and the first entry is unchanged (C7, FSPEC §5.1, BL-03). | `__tests__/hookCompatibility.test.js` | — | 2 | P0-00 | ✅ |

### Phase 2 — Node-side track and shared prerequisites (batches 3–6)

Runs to completion **beside** the C1 chain; nothing in it touches a bash source.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-07 | `[Fake first]` Implement the capability helpers: `describeOrSkip(name, capability, unverifiedInvariants, body)` and `itOrSkip(…)` — four capabilities (`bash`, `git ≥ 2.7.0`, `hash`, `uid-nonroot`), probed once per file and memoised via `execFileSync`/`process.getuid`, **throwing** on an empty invariant list, printing TSPEC §7.3's skip string to stderr **and** registering a `test.skip`. Encode the **named uid-0 skip inventory** of TSPEC §1.3 (AT-14b, AT-16, AT-27, AT-32(a), AT-34, `plugin-artifact-unreadable`, `consumer-artifact-unreadable`) as exported invariant-string constants so no call site hand-writes one. **Also export the inventory itself** as a machine-readable frozen array of `{capability, unverifiedInvariants[]}` records — the union of TSPEC §1.3's rows and PROPERTIES §11.1's — and have `describeOrSkip`/`itOrSkip` register each skip they emit into an exported, module-level `REGISTERED_SKIPS` set. T-01 asserts the two agree: **every registered skip is a member of the inventory, and its invariant list is non-empty**. This is what makes §5's and §9's "zero unexpected skips" a mechanical comparator instead of an eyeball pass over stderr (TE F-10). | `__tests__/driftHelpers.test.js` | `__tests__/helpers/driftCapabilities.js` | 3 | T-01 | ✅ |
| T-08a | `[Fake first]` Implement the harness core: `runScript(entrypoint, opts)` over `spawnSync` with `status ?? -1`; the **constructed** (never inherited) `sandboxEnv` of TSPEC §3.2; `makeToolDir(names)` single-directory `PATH` with memoised resolution and throw-on-unresolvable; the four entrypoint→invocation mappings (`bash <path>` form everywhere except §9); `RunResult` incl. `tracePath`; the read-back set `readDriftState` / `readSyncManifest` / `listBackups` / `inodeOf` / `indexMode` (TSPEC §3.4, `JSON.parse` only — never a subprocess); and `runGrammar(cases)` with its line-count equality check (§11.2). | `__tests__/driftHelpers.test.js` | `__tests__/helpers/driftHarness.js` | 3 | T-01 | ✅ |
| T-09 | `[Fake first]` Implement `document-oracles.mjs` — **production code, no side effects, pure functions of a root** (TSPEC §2.1a): `coveredViolations(root)` (five literal patterns, one entry per file with `patterns[]`, `LC_ALL=C` path sort) with the frozen four-member `EXEMPTIONS` literal in FSPEC §7.5 clause order — (i) carries **both** generated trees in **one** string (TE F-10); `packagingViolations(root)` (clauses 6.2(a)–(d), sorted by `(clause, path)`); `advertisedVersionViolation(root)` with the pinned probe order (b)→(c)→(d)→(a) and the four verbatim exported strings `S_GIT_ABSENT` / `S_NO_GIT_DIR` / `S_UNBORN_HEAD` / `S_NOTHING_STAGED`; and the exported `M6_ID_REGEX` (TSPEC §11.3 row 1) shared with C1's validator and PROPERTIES' generator. | `__tests__/documentOracles.test.js` | `pdlc/workflows/lib/document-oracles.mjs` | 3 | T-02 | ⬚ |
| T-10 | `[Fake first]` Create the **checked-in** fixture tree of TSPEC §10.1 — twelve literal files: the seven expected violations (`docs/_queue/QUEUE.md`, `docs/design/MASTER-PLAN.md`, `docs/PLAN-top-level.md`, both orchestrator `SKILL.md`s, both `pdlc/workflows/orchestrate-*.js` comments) and the five exempt ones (the `docs/<X>/` pair carrying `REQ-<X>.md`, the nested `.claude/workflows/` bundle, the nested `pdlc/workflows/dist/` bundle **and** `distribution-manifest.json`, and the `__tests__/` file). Generated at runtime is **forbidden** (§10.1 reason 1). | `__tests__/documentOracles.test.js` | `__tests__/fixtures/covered-violations/**` (12 files) | 3 | T-02 | ✅ |
| T-14 | `[Fake first]` **C5** — retarget and manifest emission (TSPEC §2.3): `OUT_DIR` from `resolve(REPO_ROOT, ".claude", "workflows")` to `resolve(HERE, "dist")`, `mkdirSync` and the `--check`/write loop unchanged in shape; emit `dist/distribution-manifest.json` with `pluginSha1` computed by `node:crypto` **over the same in-memory `contents` string the loop just wrote**; **per-row `artifactVersion` and top-level `pluginVersion`, both read from `pdlc/.claude-plugin/plugin.json` at build time** (TSPEC §2.3 point 2's second sentence; FSPEC M3/M4 make `artifactVersion` a mandatory manifest key, and AC-5.3's operator-facing `pluginArtifactVersion` line has no other source — PM F-03); make the manifest itself a `--check` subject; fixed key order, `JSON.stringify(obj, null, 2) + "\n"`, `rows` sorted by `id` `LC_ALL=C`, `retired` = sorted unique union of every row's `retires`; retarget the `in-sync`/`wrote`/`STALE` log lines. **Run the builder and commit the regenerated bundles in the same commit** (CLAUDE.md). The four stale tracked `.claude/workflows/*` files are left on the index until L-01 and are read by no test after T-05. | `__tests__/runtimeBundle.test.js`, `__tests__/documentOracles.test.js` (AT-19) | `pdlc/workflows/build-runtime.mjs`, `pdlc/workflows/dist/**` (generated) | 3 | T-05 | ✅ |
| T-08b | `[Fake first]` Extend the harness with the message layer: the `MESSAGES` matcher table of TSPEC §7.2 — every remediation-bearing matcher capturing its remediation text to end of line (`remediation`/`cmd` groups) — plus `remediationOf()`, `allOf()`, `countOf()`, `distinct()`, `expectRemediationClass()` over §7.4's classes with their `mustName`/`mustNotName` halves (including `permissions`' positive stem, TE L-02), `expectFailOpen({operation})` (§6.3) and `expectHookSilent(run)` with **all five** conjuncts of §1.4a, conjunct 5 including `record.generatedBy === "hook"` (TE L-06). | `__tests__/driftHelpers.test.js` | `__tests__/helpers/driftHarness.js` | 4 | T-08a | ⬚ |
| T-15 | `[Fake first]` Implement the fixture builders: `makeConsumerTree(spec)` (all eight clauses of TSPEC §3.3, `mkdtempSync` under `realpathSync(tmpdir())`, `home` a **sibling** never an ancestor), `makePluginTree(spec)` with `manifestOverride` **xor** `manifestRaw` (throwing when both are given), `setRowState` implementing §3.3's six-state table **and re-deriving the classification as its own first oracle**, `makePackagingFixture({break})` with its asserted green baseline, and §13.5's backup fixtures (`sameSecondBackups`, `shuffledMtimes` via `utimesSync`, `decoyBackupDir`, `nnExhausted`). Every builder returns an idempotent, never-throwing `cleanup()` that `chmod`s back before `rmSync` (§13.6). | `__tests__/driftHelpers.test.js` (T-01 clause (b) — every builder contract this row implements has a named case there) | `__tests__/helpers/driftFixtures.js` | 4 | T-01, T-08a | ⬚ |
| T-16 | `[Fake first]` Implement the trace/ordering helpers: the percent codec of TSPEC §4.1 (over `%`, tab, newline and every byte outside `0x20`–`0x7E`), `parseTrace` enforcing §4.2's `phase` rule and **throwing** on a mislabelled record, `assertPhaseOrder` (run-length-collapsed prefix check + grammar conjunct), `assertRecordedPassIs(trace, record, phase)`, `assertPostCopyNarrow` (**multiset** equality — TE F-01), and `assertTreeUnchanged(root)` excluding any path with a `.git/` segment (TE F-12, R-8). | `__tests__/driftHelpers.test.js` (T-01 clause (c) — codec, `parseTrace` throw, `assertPhaseOrder`, multiset `assertPostCopyNarrow`, `.git/`-excluding `assertTreeUnchanged`) | `__tests__/helpers/driftOrdering.js` | 4 | T-01, T-08a | ⬚ |
| T-17 | `[Fake first]` Implement `makeFreshClone()` — TSPEC §9.1's five steps: `cp -R` of the **working tree** excluding `.git/`, `node_modules/` and `.claude/workflows/` (and **not** excluding `pdlc/workflows/dist/`); index-mode replay from `git ls-files -s`; `git init -b main` + one commit with `-c` config only; a sibling `mkdtemp` `HOME`; `realpathSync` on every returned path. Built once per describe in `beforeAll`. | `__tests__/bootstrap.test.js` | `__tests__/helpers/freshClone.js` | 4 | T-06, T-08a | ⬚ |
| T-18 | `[Fake first]` Implement the batched grammar driver `backup-grammar.sh` (TSPEC §11.2): sources C1, reads `format`/`parse` cases from stdin one per line, writes `ok`/`err` results one per line — **one spawn per property run**. No execute bit needed (run via `bash`). Its gate is **T-01**'s `runGrammar` line-count-equality case plus the two new `driftHelpers.test.js` cases T-01 owns for this driver (TE F-07(a)): a `format` case whose `ok` line round-trips through `pdlc_backup_parse`, and a malformed `parse` case yielding `err` — both authored in batch 2, both red until this row lands. `driftBackups.test.js` (T-30→5) is a *consumer*, not this row's gate, and is no longer cited as one. | `__tests__/driftHelpers.test.js` (T-01 clause (d)) | `__tests__/helpers/bin/backup-grammar.sh` | 4 | T-01, T-08a | ⬚ |
| T-39 | `[Fake first]` **Sourced-probe driver** — `bin/lib-probe.sh` on the **§11.2 precedent** (`backup-grammar.sh`): sources C1, reads `<fnName> TAB <arg>…` cases from stdin one per line, invokes the named C1 function and writes one tab-delimited, percent-encoded result line per case (`ok TAB <status> TAB <stdout-fields…>` \| `err TAB <reason>`), plus a `dump TAB <varName>` form for the `PDLC_*` scalars and parallel arrays C1 populates. `driftProbe.js` exports `runProbe(cases, opts)`, reusing `driftHarness`'s `sandboxEnv` and `makeToolDir` and asserting line-count equality exactly as `runGrammar` does. **This is what gives C1 layers 2–5 an observable before the entrypoints land (TE F-03)** — see §3 note 1. Two constraints: the driver **calls `pdlc_fault_active` nowhere** (so PROPERTIES §8.1's three-shipped-file static scan and PROP-SEAM-02's call-site closure are untouched), and it is a **test helper**, excluded from jest by the existing `testPathIgnorePatterns`, never shipped. | `__tests__/driftHelpers.test.js` (T-01 clause (d)) | `__tests__/helpers/bin/lib-probe.sh`, `__tests__/helpers/driftProbe.js` | 4 | T-01, T-08a | ⬚ |
| T-11 | `[Fake first]` **C6 (1/3)** — export `validateDriftRecord(value)` from `orchestrate-queue.js` returning `{ok:true,record}` or `{ok:false,clause:"D1".."D8"}`, implementing every clause of FSPEC §6.2 plus §12.1 row 4's **single-level** known-envelope rejection rule (stated as a TSPEC test-design decision, not an FSPEC amendment). Pure — no filesystem. Rebuild both bundles in the same commit. | `__tests__/driftRecordShape.test.js` | `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/dist/**` (generated) | 4 | T-03, T-14 | ⬚ |
| T-12 | `[Fake first]` **C6 (2/3)** — export `mapDriftState(record)` returning `{outcome, row: 1..10, reasons, report:{manifest,row,run}}`. The **row number is a required test affordance** (TSPEC §2.4): asserting `blocked` alone cannot tell row 3 from row 6. Rebuild both bundles in the same commit. | `__tests__/queueDriftGate.test.js` | `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/dist/**` | 5 | T-04, T-11 | ⬚ |
| T-13 | `[Fake first]` **C6 (3/3) — O-19(d) and the gate wiring.** Export `readDriftStateSafely(readFileFn, path)` = `try { return await readFileFn(path); } catch { return null; }`. Wire the gate inside `main` **before** the existing `QUEUE.md` read at `orchestrate-queue.js:504…523`, so a blocked drift state costs no queue work; return `buildQueueReport({outcome:"blocked", …})` on `blocked`. **The injected read is `await`ed at the call site** and the pre-existing unwrapped `await readFileFn(queuePath)` is **left alone** (FSPEC §6.1; residual R-6). Add **O-19(c)**'s code comment recording that the seam is LLM-mediated and that `runtime-adapter.js:85–96` propagates (no `try`/`catch`), so the wrapper is load-bearing — a comment with no assertable observable (R-7); it is a review item on the diff. Rebuild both bundles in the same commit. | `__tests__/queueDriftGate.test.js` | `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/dist/**` | 6 | T-04, T-12 | ⬚ |

### Phase 3 — RED authoring for the eleven bash suites (batch 5)

RED-terminal, and the widest batch in the plan: eleven agents, eleven distinct test files, no shared
writer. Every case is authored from TSPEC §14 / §14.1's **named `it()` blocks** and fails because C1,
C2 and C3 do not exist yet. The file-level guard is `describeOrSkip("hash", …)` wherever FSPEC §12's
standing precondition applies.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-20 | `[RED]` Repo-root suite: AT-2, AT-33, §8.2's five fixtures (`nonGitWithClaude`, `nonGitNoClaude`, `gitTreeBrokenProbe`, `nonGitClaudeAtHome`, `git`-absent via `PATH`), §8.3's `expectRepoRootUnresolved` oracle (**stderr W-1 + `--check` exit 3 + filesystem-emptiness over the fixture root**, never a drift-state field) with N-8 absent for `repo-root-unresolved` and **required** for AT-33's `manifest-empty`, and §8.4's `$HOME`-guard co-holding case. **Plus the layer-2 sourced-probe cases (`runProbe`, T-39):** `pdlc_resolve_repo_root` returns the fixture root for `git`/`nonGit` trees, **rejects `$HOME`**, and sets the documented failure status on `gitTreeBrokenProbe`; `pdlc_resolve_plugin_root` prefers `CLAUDE_PLUGIN_ROOT` and falls back to the `build-runtime.mjs` maintainer marker, dumping `PDLC_PLUGIN_ROOT_REASON`. These are the assertions that make **batch 7 independently green** (§3 note 1). | `__tests__/driftRepoRoot.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ⬚ |
| T-21 | `[RED]` Baseline suite: AT-3 (incl. v2.1's `expectRemediationClass(remediationOf(stderr,"W-1"),"pluginUpdate")`), §14.1 **B-1** and **B-4**, **M-3**'s eight reason→remediation-class `it()`s (`manifest-*` and `drift-state-invalidated` asserting `mustNotName:[SYNC_CMD]`), the eight baseline fixtures of §13.1 (`manifestClauseBroken`, `manifestUnparseable`, `pluginRootUnset`, …), and the **baseline-reason meta-oracle**: a module-level `Set` asserted set-equal to the literal eight-member list (§1.4 — a failing assertion, not a checklist). **Plus the layer-2 sourced-probe cases (T-39):** `pdlc_load_manifest` over the eight §13.1 fixtures, dumping `PDLC_BASELINE_STATUS` / `PDLC_BASELINE_REASON` / the `PDLC_ROWS_*` parallel arrays and the `PDLC_EVIDENCE_*` triple, plus `PDLC_CHECK_ENABLED` resolved on an *unresolved* path — the batch-7 observable that does not need an entrypoint. | `__tests__/driftBaseline.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ⬚ |
| T-22 | `[RED]` Classify suite: AT-1, AT-6, **AT-7's `driftClassify.test.js` half** — the `unverifiedRow` fixture (consumer bytes ≠ plugin, **no** sync-manifest entry) classifies `unverified` and `--check` exits **2**; TSPEC §14 places AT-7 in **both** files, "asserted as **both** halves in one test file each", and the queue half is T-38's (TE F-01) — AT-25, AT-32(a) (`itOrSkip("uid-nonroot")`, full-`rows` comparison against a listable twin), AT-34 as **three** `it()`s over three separately-run fixtures (TE F-09), §14.1 **V-4**, §2.5's `touch`-invariance test, and the **row-state** (6) and **row-reason** (4) meta-oracles as set-equality assertions — all four row reasons reachable without root via §5.2 tokens 15/16 (TE F-03), so neither floor skips on a uid-0 runner. **Plus the layer-3 sourced-probe cases (T-39):** `pdlc_classify_row <phase> …` over the six-state ladder and the four `unknown` reasons, and `pdlc_classify_all` dumping `PDLC_ROWS` **by index**, the `LC_ALL=C`-sorted `not-managed` enumeration and the absence of `.pdlc-`-prefixed files from both lists — the batch-8 observable. AT-7's `--check` exit-2 conjunct still needs C3 and lands green at batch 11; its classification conjunct is probe-observable at batch 8. | `__tests__/driftClassify.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ⬚ |
| T-23 | `[RED]` Sync suite: AT-8a, AT-8b, AT-9, AT-10, AT-12, AT-13, AT-26, §14.1 **B-2**, **M-2**'s six R-state remediation `it()`s, **V-1** (retire → resurrect → retire, two backups with distinct `(stamp,nn)`), **F-3** (the backup-id fault selector), and the exit-code floor for sync (0, 2, 3, 4 — **never 1**, FSPEC §5.8). **Plus the layer-4 sourced-probe cases (T-39):** the drift-state writer routine, `pdlc_copy_artifact`, the backup-then-verify-then-destroy order and `pdlc_prune_backups` driven directly against a `makeConsumerTree` fixture and read back with `readDriftState` / `listBackups` / `inodeOf` — the batch-9 observable. Exit codes and stderr routing are **entrypoint** behaviour and stay red until batch 11. | `__tests__/driftSync.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ⬚ |
| T-24 | `[RED]` Hook suite: AT-5(a)/(b), AT-11, AT-32(b), §14.1 **S-1** (`expectHookSilent` — the suite's one strict `stderr === ""` site), **S-2** (the negative direction, `expect(() => expectHookSilent(run)).toThrow()` over `staleRow`), **B-3**, **V-2**, and AC-2.4's "hook exits 0 always". | `__tests__/driftHook.test.js` | — | 5 | T-08b, T-15, T-16 | ⬚ |
| T-25 | `[RED]` Ladder suite: AT-14 (§6.5's five assertions on the `jsonToolAbsent` tree, incl. `mapDriftState ⇒ row 4`; **no `classify` record exists on this fixture** — the ordering claim is `mkdir` precedes `write`, TE L-01), AT-14b (`itOrSkip("uid-nonroot")`, inode **unchanged**, `row: 2`, plus the sync-run form), AT-15 (inode **changed** via `inodeOf` bigint; stderr names `drift-state-replace` and `drift-state-invalidate` and **not** `drift-state-unlink`), AT-16 (byte-unchanged pre-existing record; fault form runs on every runner), and §14.1 **V-3**. | `__tests__/driftLadder.test.js` | — | 5 | T-08b, T-15, T-16 | ⬚ |
| T-26 | `[RED]` Write-failure suite: AT-17 (drift-state line **first**, asserted by index), AT-27 (`expectFailOpen({operation:"backup-verify"})`, consumer bytes byte-identical), AT-35 (**both** red directions — exit 4 not 1, post-run `unverified` not `local-edit`), §6.3's per-surface fail-open conjuncts, §6.4's removal-only sync-manifest fixture, and the **`writeFailures.operation` meta-oracle**: the 5 recordable values asserted present, the 4 stderr-only values asserted **absent** from the record and present on stderr. | `__tests__/driftWriteFailure.test.js` | — | 5 | T-08b, T-15, T-16 | ⬚ |
| T-27 | `[RED]` Fault-seam suite: AT-18a (`countOf(stderr,"N-7") === 1`, byte-equivalence to the seam-unset run, **and "N-7 and nothing else"**), AT-18b (`--check` exit **4**; record byte-identical modulo `generatedAtUtc`), §14.1 **F-1** (three `malformedSpec` forms, one `it()` each) and **F-2** (`M6_ID_REGEX` rejects `,`, `:`, tab, newline). **Plus the layer-1 sourced-probe cases (T-39):** `pdlc_fault_active` over recognised, unrecognised and malformed specs (N-7 once, whole spec text), `pdlc_trace` exiting **0** with an unwritable `PDLC_TRACE_FILE`, `pdlc_sha1` / `pdlc_probe_hash_tool` / `pdlc_json_read`'s 0/10/11/12, and a `dump PDLC_FAULT_TOKENS` case asserting sixteen members in §5.2 order — the batch-6 observable, alongside `backup-grammar.sh`'s. | `__tests__/driftFault.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ⬚ |
| T-28 | `[RED]` Message suite: AT-30's pairwise `distinct()` over S1/S2/S3 rendered through the **real** `pdlc_msg_*` functions via the §11.2 batched-driver pattern (never JS copies of the strings), and §14.1 **M-1**'s four row-reason→remediation-class `it()`s with their `mustNotName` halves. The AT-30 driver is the §11.2 pattern, so **this suite is already sourced-observable**: it is the batch-10 observable, and the same `runProbe` path covers the `<pluginRoot>`-expanded `syncCommand` and its `null` fallback. | `__tests__/driftMessages.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ⬚ |
| T-29 | `[RED]` Ordering suite: §4.3's four conjuncts as the AC-2.9(1) oracle (multiset positive-presence over **every** manifest row id; `max(seq of as-found classify) < min(seq of any create/write op)`; no `mkdir`/`write` before the first `classify`; no globbing), §14.1 **PH-1** (all three classify phases on one retiring sync run, `assertPhaseOrder` named as the call site, every non-`classify` record carrying `run`), and §4.4's unwritable-trace red test over `blockedTrace` (exit and stderr byte-identical to the writable run; the **test** then fails because the trace is empty). | `__tests__/driftOrdering.test.js` | — | 5 | T-08b, T-15, T-16 | ⬚ |
| T-30 | `[RED]` Backup suite: §11.3 row 4's retention binding (`sameSecondBackups` + `shuffledMtimes` — the pruned member is `-01`, red against any mtime-based selector), row 2's separate assertion that **C1's own `export LC_ALL=C`** holds under an injected `LC_ALL=en_US.UTF-8`, `decoyBackupDir`'s identity-on-unknown-ids requirement, and `nnExhausted` ⇒ `operation: backup`, exit 4. | `__tests__/driftBackups.test.js` | — | 5 | T-08b, T-15, T-16 | ⬚ |

### Phase 4 — C1, the sourced library (batches 6–10, serial by construction)

**C1 is one physical file** (TSPEC §2.1). The single-writer rule therefore forbids parallelising it;
these five layers are the plan's critical path and each is one batch. Each layer is `[Fake first]`
only in the sense that its red tests already exist (batch 5) — no layer authors a test.

**What each layer's batch actually turns green (TE F-03 — corrected in v2.0).** C1 is a **sourced**
library with no execute bit (TSPEC §2.1, OQ-4), and TSPEC §3.1 fixes `runScript`'s four entrypoints
as C2/C3, which land in **batch 11**. So *entrypoint-mediated* observables — exit codes, stderr
routing, stdin handling, the `--check` precedence — are **not** available per layer, and v1.0's
claim that every layer was independently red-testable through the entrypoint suites was false. v2.0
closes it by adding **T-39**'s sourced-probe driver on TSPEC §11.2's own precedent
(`backup-grammar.sh` already reaches C1 this way for the O-18 grammar properties and for AT-30's
real-`pdlc_msg_*` rendering). Each layer therefore has a real, *sourced* green:

| Layer | Batch | Sourced-observable green in that batch | Still red until batch 11 |
|---|---|---|---|
| T-31 primitives | 6 | `backup-grammar.sh` grammar cases; T-27's probe cases (`pdlc_fault_active`, `pdlc_trace` exit 0, `pdlc_sha1`, `pdlc_json_read`, the 16-member `PDLC_FAULT_TOKENS` dump) | N-7 **on stderr of a run**, trace-file production by a real run |
| T-32 resolution/baseline | 7 | T-20's and T-21's probe cases (`pdlc_resolve_repo_root`/`_plugin_root`, `pdlc_load_manifest`, the baseline selector's status/reason/evidence dumps, `PDLC_CHECK_ENABLED`) | W-1 on stderr, `--check` exit **3**, §8.3's `expectRepoRootUnresolved` |
| T-33 classifier | 8 | T-22's probe cases (six-state ladder, four `unknown` reasons with side attribution, by-index iteration, `not-managed` sort) | `--check` exit 2, the on-disk record, AT-7's exit conjunct |
| T-34 writers/ladder/backups | 9 | T-23's probe cases (writer routine, copy, backup→verify→destroy order, prune) read back with `readDriftState`/`listBackups`/`inodeOf` | exit 4, fail-open stderr, `expectFailOpen` |
| T-35 messages | 10 | T-28's AT-30 batched-driver rendering and the `syncCommand` expansion — already a §11.2-shaped observable | M-1/M-2/M-3's per-run stderr routing |

The residual is stated rather than claimed away: **the probe observes C1 sourced, not as the shipped
consumer sees it.** Everything in the right-hand column is genuinely first-observable at batch 11,
and §5's gate for batches 6–10 names it as such (a shrinking, *enumerated* red list plus the
layer's own new green), not as "full suite green".

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-31 | **C1 layer 1 — seams and primitives.** The **idempotent-source guard** at the top of the file (`[[ -n ${PDLC_DRIFT_LIB_SOURCED:-} ]] && return 0; readonly PDLC_DRIFT_LIB_SOURCED=1`) **before** any `readonly` assignment (PROPERTIES §8.0, SE F-05); `export LC_ALL=C` (§2.5); the **`PDLC_FAULT_TOKENS` bash array** declared once here, adjacent to `pdlc_fault_active`, in TSPEC §5.2's table order, **sixteen** members, with **no** JS mirror and **no** generated side-artifact (PROPERTIES §8.0); `pdlc_fault_active <token> [scopeKey]` per §5.1/§5.1.1 (argument 1 always a bare literal at call sites; no trim, no case-folding; unrecognised spec ⇒ N-7 once with the whole spec text); `pdlc_trace <phase> <op> <rowId> <arg>` — tab-delimited, percent-encoded, **always exits 0** (`{ printf … >>"$PDLC_TRACE_FILE"; } 2>/dev/null \|\| true`); `pdlc_probe_json_tool`, `pdlc_json_read` (0/10/11/12), `pdlc_probe_hash_tool`, `pdlc_sha1`; and the backup grammar `pdlc_backup_format` / `pdlc_backup_parse` (fixed 24-byte tail) / `pdlc_prune_backups <dir> <knownIds…>` (**always 0**, TSPEC §11.1). | `__tests__/driftFault.test.js`, `driftOrdering.test.js`, `driftLadder.test.js`, `driftBackups.test.js` | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 6 | T-18, T-25, T-27, T-29, T-30 | ⬚ |
| T-32 | **C1 layer 2 — resolution and baseline.** `pdlc_resolve_repo_root` (`$PWD` walk, `$HOME` **rejected**, one fault token per guard: `git-worktree-list` and `walk-stat`); `pdlc_resolve_plugin_root` (`CLAUDE_PLUGIN_ROOT`, then the `pdlc/workflows/build-runtime.mjs` maintainer marker) with `PDLC_PLUGIN_ROOT_REASON`; `pdlc_load_manifest` with the M1–M10 validator sharing `M6_ID_REGEX` and populating the parallel `PDLC_ROWS_*` arrays in **manifest order**; config read (E7) and `PDLC_CHECK_ENABLED` resolved on **every** path including unresolved ones; the baseline selector over evidence E1–E7 producing `PDLC_BASELINE_STATUS` / `PDLC_BASELINE_REASON` (all **eight** reasons) and the `PDLC_EVIDENCE_*` `holds`/`does-not-hold`/`indeterminate` triple; the **no-write-target** rule keyed on evidence, not on selection. | `__tests__/driftRepoRoot.test.js`, `driftBaseline.test.js` | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 7 | T-20, T-21, T-31 | ⬚ |
| T-33 | **C1 layer 3 — the classifier.** `pdlc_classify_row <phase> …` — **the phase is a parameter**, and this is the *only* site that sets a trace phase label (TSPEC §2.2's structural rule, on which §4.3's oracle depends); the six-state ladder in FSPEC §3.3's declared precedence; the four `unknown` reasons with **side attribution**, including the `plugin-artifact-read` / `consumer-artifact-read` guards (tokens 15/16) placed **after** the existence `stat` (TE L-07); `pdlc_classify_all` iterating `PDLC_ROWS` **by index, never by glob** (AC-0.1); the `not-managed` enumeration reported `LC_ALL=C`-sorted, with `.pdlc-`-prefixed files absent from **both** `rows` and `not-managed`; equal bytes ⇒ `in-sync` regardless of provenance (O-8/R-4); no mtime anywhere. | `__tests__/driftClassify.test.js` | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 8 | T-22, T-32 | ⬚ |
| T-34 | **C1 layer 4 — writers, the ladder and backups.** The **single** drift-state writer routine (AC-2.7) with the T1 `printf` emitter (no interpreter needed — NFR-5) and the T2 path; the three-rung invalidation ladder at per-rung fault granularity (`drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink`) preserving `checkEnabled: false` at rung (i); `generatedAtUtc` as ISO-8601 `Z`; the sync-manifest update (temp + `mv`, so the failure surface is the **parent directory**, TE F-06) and its removal-only path; `pdlc_copy_artifact`; the backup-then-verify-then-destroy order for both `--force` overwrite and retirement (AC-2.9(4)) with `pdlc_prune_backups` retention by **descending filename**, never mtime; `pdlc_retire` gated on post-copy `in-sync` with `retire-skipped` naming R's state; `PDLC_WRITE_FAILURES[]` over the closed nine-value `operation` domain — 5 recordable, 4 stderr-only. | `__tests__/driftSync.test.js`, `driftWriteFailure.test.js`, `driftLadder.test.js`, `driftBackups.test.js` | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 9 | T-23, T-25, T-26, T-30, T-33 | ⬚ |
| T-35 | **C1 layer 5 — the message catalogue.** `pdlc_msg_*` emitting FSPEC §8's W-*/N-* lines, pairwise distinct across S1/S2/S3, each remediation-bearing line carrying its remediation to end of line so §7.2's matchers can capture it; the `<pluginRoot>`-expanded `syncCommand` (no `$`, no `{`) and its `null` fallback describing the shipped script rather than a fake path; `manifest-*` and `drift-state-invalidated` remediations naming **no** sync command (FSPEC §8.1). | `__tests__/driftMessages.test.js`, `driftHook.test.js`, `driftBaseline.test.js`, `driftSync.test.js` | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 10 | T-24, T-28, T-34 | ⬚ |

### Phase 5 — The two entrypoints (batch 11)

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-36 | **C2 — `check-workflow-drift.sh`** (SessionStart hook). Sources C1, reads the SessionStart JSON on stdin, runs the writer routine with `generatedBy: "hook"`, emits only what FSPEC §5.1 specifies, and **always exits 0** (AC-2.4). Silence means *verified*, never *skipped* (AC-2.2). Created `100755` and staged with `git add --chmod=+x`; the index-mode assertion itself lands in L-03. | `__tests__/driftHook.test.js`, `driftFault.test.js`, `driftLadder.test.js` | `pdlc/hooks/scripts/check-workflow-drift.sh` | 11 | T-19, T-24, T-35 | ⬚ |
| T-37 | **C3 — `sync-workflows.sh`** (`--check`, sync, `--force`). Sources C1; `--check` is read-only with exits 0/1/2/3/4 per AC-3.3's precedence; sync copies, backs up, retires, rewrites the sync manifest and writes the record, exiting 0/2/3/4 and **never 1** (FSPEC §5.8); `--force` overwrites only after a verified backup; usage errors on `--check --force`. Optional `SKILL.md` (FSPEC §5.4), if shipped, must avoid all five `coveredViolations` patterns (R-10). Created `100755` and staged with `git add --chmod=+x`. | `__tests__/driftSync.test.js`, `driftBaseline.test.js`, `driftClassify.test.js`, `driftWriteFailure.test.js`, `driftRepoRoot.test.js`, `driftOrdering.test.js` | `pdlc/hooks/scripts/sync-workflows.sh` | 11 | T-21, T-23, T-35 | ⬚ |

### Phase 6 — Queue integration cases and the property suites (batches 12–13)

**Every property task in this phase also writes its own §3.1 falsification-ledger fragment** —
`docs/pdlc-workflow-distribution/FALSIFICATION-LEDGER-{task}.md`, one file per task, never a shared
one — and may not mark a property green without an entry in it. T-40 created the ledger header at
batch 7; **T-50 concatenates the fragments into `FALSIFICATION-LEDGER.md` and deletes them** (batch
13, single writer). §5's batch 12/13 gate and §9's DoD both read the ledger; §4.4 is its ownership
manifest.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-38 | Append the **fixture-backed** queue cases to `queueDriftGate.test.js`: AT-4, AT-5(c), AT-7's queue half, AT-11's queue half (`row: 7`), AT-31 as **two** `it()`s (a: write-failure ⇒ row 3, naming `drift-state-invalidated` and the `syncCommand: null` fallback; b: retired-present ⇒ row 7, naming the retired path), and §14.1 **B-5** — `readDriftStateSafely(root)` returning `null` **from the filesystem** over a real `preManifestOptOut` tree (TE L-05), which is what backs the NFR-1 citation. | `__tests__/queueDriftGate.test.js` | — | 12 | T-04, T-13, T-36, T-37 | ⬚ |
| T-40 | `[Fake first]` Implement the generator library (PROPERTIES §1.3): seeded, dependency-free, explicit shrink order (§2.5); `genId` over `M6_ID_REGEX`; §2.3's eleven leaves and §2.4's two **unconstructible** exclusions (`hash-tool-absent` on a row subset; a `stale` row whose bytes equal the plugin's); §1.4's spawn-budget packing (axes packed into rows, not runs); and **`readFaultTokens()`** — one `execFileSync` of `bash -c 'source <C1>; printf "%s\n" "${PDLC_FAULT_TOKENS[@]}"'` that asserts the child's **exit status zero before** it asserts anything about the array, plus the sanity conjunct (exactly **16** entries, all distinct, each matching `M6_ID_REGEX`) so a silently-empty read cannot make PROP-SEAM-01 vacuous. Also **creates `docs/pdlc-workflow-distribution/FALSIFICATION-LEDGER.md`** with its header and column layout (§3.1), empty of entries — it is the single owning creator so batch 12's ten concurrent tasks each append only their own fragment. | *(consumed by every property task below)* | `__tests__/helpers/driftGenerators.js`, `docs/…/FALSIFICATION-LEDGER.md` (header) | 7 | T-15, T-31 | ⬚ |
| T-41 | Classifier properties: PROP-CLS-01…08, PROP-RSN-01…06, PROP-DET-01, -02, -04, -05, PROP-NEG-01, PROP-NEG-05 (**including draw (5), `syncManifest[id].pluginHash`** — the field whose misuse flips US-03's direction answer). Wire PROPERTIES §11.1's skip rows for leaves **L3/L4** and the L3/L4 half of PROP-CLS-03 / PROP-RSN-04 through `itOrSkip("uid-nonroot", …)` with the invariant strings from T-07. | `__tests__/driftClassify.test.js` | — | 12 | T-22, T-33, T-36, T-37, T-40 | ⬚ |
| T-42 | Baseline properties: PROP-BSL-01, -02, -03, -04, -08; PROP-BSL-05's record half; PROP-DET-06; PROP-MTM-02's `--check` half; PROP-RSN-05's baseline half; PROP-NEG-07's M10 half. `git`-routed vectors of PROP-BSL-03/-04/-06 gated by `itOrSkip("git", …)`. | `__tests__/driftBaseline.test.js` | — | 12 | T-21, T-32, T-37, T-40 | ⬚ |
| T-43 | Ordering/trace properties: PROP-BSL-07, PROP-CLS-04's trace half, PROP-MTM-03's trace half, PROP-SEAM-05's trace-file half, PROP-SEAM-07 (percent-codec round-trip, batched via a one-off encoder driver on the §11.2 pattern), PROP-SEAM-08 (`seq` gapless permutation), PROP-DET-03. | `__tests__/driftOrdering.test.js` | — | 12 | T-16, T-29, T-37, T-40 | ⬚ |
| T-44 | Sync/measurement-time properties: PROP-MTM-01, -03, -04's sync half, -05's sync half, -06, **-07**; PROP-NEG-03's forward half; PROP-NEG-06 (quantified over **all six** R-states, `unknown` over all four reasons); PROP-NEG-07's blast-radius half. | `__tests__/driftSync.test.js` | — | 12 | T-23, T-34, T-37, T-40 | ⬚ |
| T-45 | Hook properties: PROP-MTM-02's hook half, PROP-MTM-04's hook half, PROP-NEG-04's hook half (a degraded run is never silent, with the **two** enumerated positive exceptions). | `__tests__/driftHook.test.js` | — | 12 | T-24, T-36, T-40 | ⬚ |
| T-46 | Write-failure properties: PROP-NEG-03's converse half — target bytes byte-identical, operation reported skipped, exactly one `writeFailures` entry with `operation ∈ {backup, backup-verify}`, exit **4**; plus the `missing`-row exception (**no** `backup` record). | `__tests__/driftWriteFailure.test.js` | — | 12 | T-26, T-34, T-37, T-40 | ⬚ |
| T-47 | Repo-root properties: PROP-BSL-06, PROP-NEG-02 (nothing written under `$HOME` or `/`, over the adversarial `.claude/`-at-`$HOME` and deleted-`$PWD` fixtures; three positive conjuncts, never "nothing bad happened"). | `__tests__/driftRepoRoot.test.js` | — | 12 | T-20, T-32, T-36, T-40 | ⬚ |
| T-48 | Seam-closure properties: PROP-SEAM-01 (recognition == enumeration; (b)'s **four classes, one draw each**), PROP-SEAM-02 (static call-site closure over the **three** shipped bash sources, argument **1** only, excluding the definition site, the `PDLC_FAULT_TOKENS` declaration, comments and heredocs — the two oracles must stay independent), PROP-SEAM-03 (7 bearing / 9 non-bearing partition read from TSPEC §5.1.1, incl. the malformed-selector exception), PROP-SEAM-04, PROP-SEAM-05's fault half, PROP-SEAM-06. | `__tests__/driftFault.test.js` | — | 12 | T-27, T-31, T-36, T-37, T-40 | ⬚ |
| T-49 | Backup-grammar properties: PROP-BKP-01…13, all through the **batched** driver (one spawn per property run, 500 cases), asserting round-trip, injectivity, total side-effect-free rejection, `NN` exhaustion as a write failure, `LC_ALL=C` descending == `(stamp,nn)` descending == reverse-chronological, subject-side (not caller-side) locale, and prune clauses (a)–(d) incl. identity on unknown ids and mtime never read. | `__tests__/driftBackups.test.js` | — | 12 | T-18, T-30, T-34, T-37, T-40 | ⬚ |
| T-50 | Queue-side properties: PROP-MTM-05's queue half, PROP-NEG-04's queue half, PROP-BSL-05's queue half. Separate batch from T-38 solely because both write `queueDriftGate.test.js`. **Writes its own `docs/…/FALSIFICATION-LEDGER-T-50.md` fragment for these three properties** (v2.1, TE F-03(b) — T-50 is a property-owning task like T-41…T-49, and is the sole batch-13 writer, so it appends its own entry before concatenating), **then concatenates every `FALSIFICATION-LEDGER-{task}.md` fragment (T-41…T-49 and its own T-50) into `FALSIFICATION-LEDGER.md` in task order and deletes the fragments** (§3.1, §4.4) — the single-writer step that keeps ten concurrent batch-12 tasks off one physical file. | `__tests__/queueDriftGate.test.js` | `docs/…/FALSIFICATION-LEDGER.md` | 13 | T-38, T-40, T-41, T-42, T-43, T-44, T-45, T-46, T-47, T-48, T-49 | ⬚ |

### Phase 7 — The landing step (batches 14–22, **strictly serial and order-sensitive**)

FSPEC §7.5 items 1–8 plus TSPEC §2.1a. Every task here is a separate batch **by design**, not by
file collision: each one changes the state the next one's precondition is stated over, and several
turn assertions green that were legitimately red for the whole feature.

**Order is halt-safety-driven (PM F-01 — resequenced in v2.0).** v1.0 ran the destructive
`git rm --cached` + gitignore **first** (L-01 at batch 14) and landed every replacement afterwards,
so a halt in batches 15–19 left a branch with untracked consumer copies, no `.worktreeinclude`, an
unregistered non-executable hook and no documented recovery — the exact state REQ §1 exists to
prevent, on the very repo whose `.claude/workflows/orchestrate-queue.bundle.js` is driving the
pipeline. v2.0 runs **every additive/preparatory task first** and makes the destructive untrack the
**last** state-changing task before the version bump:

```
L-02 (.worktreeinclude) → L-03 (execute bits) → L-04 (hooks.json) → L-07 (RELEASE-CHECKLIST)
  → L-08 (bootstrap docs) → L-06 (document corrections + rebuild) → L-01 (untrack + gitignore)
  → L-05 (version bump + final build) → L-09 (verify + the single landing commit)
```

An inert `.worktreeinclude` (L-02 before the paths are untracked) is harmless — it is read only when
a worktree is created, and while the paths are still tracked the worktree gets them anyway. That was
v1.0's stated reason for the old order and it does not survive contact with the halt case.

**Nothing in batches 14–21 commits** (§1, PM F-02 / PM Q-02). Each row edits the working tree and
index, runs its gate, and defers; **L-09 makes the one landing commit**. Every row below therefore
states its **halt state** — what is on disk, what is in the index, and the one-line recovery. In all
cases `HEAD` is still the batch-13 commit, in which the four `.claude/workflows/` paths are
**tracked**, so no halt can strand a consumer.

**Preconditions for entering batch 14 (assert before L-02 runs):** every suite green except the
**five** assertions this phase turns green — AT-22 (`coveredViolations(LIVE_ROOT) == ∅`), §9.3's
index-mode object for the **five** scripts, `advertisedVersionViolation(LIVE_ROOT) !== "red"`,
T-19's `hooks.json` second-entry assertion, and **§6.3's D-1/D-2/D-3 oracles** (v2.1, TE F-01 —
these three cases are red from batch 2, once T-02 authors them, until L-06, and are grouped here
with AT-22 as L-06-owned so batches 14–18 do not halt on an unlisted red). (There is no sixth
expected red: L-06 rebuilds the bundles in its own batch, so `build-runtime.mjs --check` is clean at
every batch boundary — TE F-04.)

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| L-02 | **`.worktreeinclude`** (§7.5 item 7, OQ-3 Option B) at the repo root, listing `.claude/workflows/`, so a Claude-created worktree carries the bundles once L-01 untracks them. Landed **first** because it is purely additive and inert until L-01 (v2.0, PM F-01). Record the OQ-3 worktree observation in the batch report. **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02 — this is the first landing row, so its own delta is the whole accumulated state):* one untracked file (`.worktreeinclude`); the four bundles are still tracked at `HEAD`. *Resume recovery:* `git clean -fd -- .worktreeinclude`. | *(no automated test — FSPEC §11.1)* | `.worktreeinclude` | 14 | T-05, T-38, T-41, T-42, T-43, T-44, T-45, T-46, T-47, T-48, T-49, T-50 | ⬚ |
| L-03 | **Execute bits on five scripts** (§7.5 item 4, REQ §0 fact 11). `chmod 755` **and** `git update-index --chmod=+x` for `check-workflow-drift.sh`, `sync-workflows.sh`, `check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh`. `lib/pdlc-drift.sh` stays **non-executable** (sourced; OQ-4). Both objects are independent and both are required: index mode `100755` **and** on-disk `X_OK`. Turns §9.3's index-mode half of `bootstrap.test.js` green. **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02):* L-02's untracked `.worktreeinclude` **plus** five mode changes in the index and on disk from this row. *Resume recovery:* `git reset && git checkout -- .` (undoes this row's mode changes; `.worktreeinclude` is untouched and stays). Strictly an improvement over `HEAD` — the three siblings' latent exit-126 class is already closed. | `__tests__/bootstrap.test.js` (§9.3) | `pdlc/hooks/scripts/*.sh` *(mode only for the three siblings)* | 15 | L-02 | ⬚ |
| L-04 | **`hooks.json` second `SessionStart` entry** (§7.5 item 3, C7). Registers `check-workflow-drift.sh` via the same `${CLAUDE_PLUGIN_ROOT}` form the three shipped hooks use; the existing entry is unchanged. Sequenced after L-03 so the script it points at is already executable — registering a `100644` script is the exact exit-126 class this feature exists to close. Turns T-19 green. **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02):* L-02's untracked `.worktreeinclude`, L-03's five mode changes, **plus** one modified tracked file (`hooks.json`) from this row. *Resume recovery:* `git checkout -- pdlc/hooks/hooks.json` (undoes only this row's delta; L-02/L-03's state is unaffected and stays). | `__tests__/hookCompatibility.test.js` | `pdlc/hooks/hooks.json` | 16 | L-03 | ⬚ |
| L-07 | **Create `pdlc/RELEASE-CHECKLIST.md`** (TSPEC §2.1a, §16). Three rows, enumerated so a reviewer can check them off: (1) **AC-6.2a** — after publishing a release and installing it, assert `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` contains both bundles **and** `distribution-manifest.json`, in the runnable form `node -e` over `packagingViolations(installedPluginParentRoot)` from the **shipped** `pdlc/workflows/lib/document-oracles.mjs`; (2) **AC-6.6's accepted residual** — before publishing, confirm `plugin.json` `version` differs from the previously published release whenever `git log` shows any `dist/` change since it; (3) **NFR-2** — the one-off p95 ≤ 500 ms observation (entrypoint, artifact count, wall clock), recorded, never asserted. **Constraint the document itself carries:** it lives under `pdlc/`, which no §7.5 exemption covers, so its wording must avoid all five `coveredViolations` patterns or AT-22 goes red on the landing commit; a false positive is fixed by **rephrasing**, never by narrowing a pattern (R-10). **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02):* L-02's untracked `.worktreeinclude`, L-03's five mode changes, L-04's one modified `hooks.json`, **plus** one untracked file (`RELEASE-CHECKLIST.md`) from this row. *Resume recovery:* `git clean -fd -- pdlc/RELEASE-CHECKLIST.md` (undoes only this row's delta). | `__tests__/documentOracles.test.js` (AT-22, via L-06) | `pdlc/RELEASE-CHECKLIST.md` | 17 | L-04 | ⬚ |
| L-08 | **Bootstrap and worktree documentation** (§7.5 items 6 and 8). `CLAUDE.md` and `pdlc/README.md` state the two-command fresh-clone bootstrap (`node pdlc/workflows/build-runtime.mjs`; `pdlc/hooks/scripts/sync-workflows.sh` — bare path) and the manual-worktree limitation (a `git worktree add` tree is not a supported consumer until D-DIST-07 / queue row 6; work from the main worktree or a Claude-created one). Same wording constraint as L-07 — both documents are inside the scan. Sequenced after L-07 so L-06 sweeps the final text of all three. **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02):* L-02's untracked `.worktreeinclude`, L-03's five mode changes, L-04's one modified `hooks.json`, L-07's untracked `RELEASE-CHECKLIST.md`, **plus** two modified tracked files (`CLAUDE.md`, `pdlc/README.md`) from this row. *Resume recovery:* `git checkout -- CLAUDE.md pdlc/README.md` (undoes only this row's delta). | `__tests__/bootstrap.test.js` (AC-6.5 sequence), `documentOracles.test.js` (AT-22, via L-06) | `CLAUDE.md`, `pdlc/README.md` | 18 | L-07 | ⬚ |
| L-06 | **Document corrections and the `dist/` path sweep** (§7.5 item 5) — the **last** document task, because its done-criterion is `coveredViolations(LIVE_ROOT) == ∅` over the *final* text of every document, including L-07's and L-08's. Two halves, both enumerated (PM F-04): **(a)** the **seven** live `coveredViolations` files of §6.2; **(b)** the `dist/` path updates in the already-correct normative documents, enumerated in **§6.3** with a per-file oracle each. Archived per-feature spec history under other features' `docs/` dirs is **not** edited — exemption (ii) covers it; §6.3 states the disposition of the two *pending-queue* REQs explicitly rather than letting the exemption decide silently. Two of the seven are `pdlc/workflows/orchestrate-{dev,queue}.js` **comments**, which are workflow sources: **this row runs `node pdlc/workflows/build-runtime.mjs` itself and stages the regenerated `dist/`**, so `--check` is clean at this batch boundary and there is no stale-bundle window (TE F-04; §1 constraint 2). **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02):* L-02's untracked `.worktreeinclude`, L-03's five mode changes, L-04's one modified `hooks.json`, L-07's untracked `RELEASE-CHECKLIST.md`, L-08's two modified `CLAUDE.md`/`pdlc/README.md`, **plus** the seven §6.2 files (`CLAUDE.md` and `pdlc/README.md` already counted above; the other five newly modified), §6.3's files (already `CLAUDE.md`/`pdlc/README.md`) and `dist/**` modified in the working tree from this row. *Resume recovery:* `git checkout -- .` (restores this row's document and `dist/` changes; L-02/L-03/L-04/L-07/L-08's state is unaffected and stays). | `__tests__/documentOracles.test.js` (AT-22), `runtimeBundle.test.js` (freshness) | the 7 files of §6.2; the §6.3 files; `pdlc/workflows/dist/**` (generated) | 19 | T-09, L-08 | ⬚ |
| L-01 | **Untrack and anchor** (§7.5 item 1) — the **last state-changing landing task**, because it is the only destructive one: until it runs, the four bundles are tracked at `HEAD` *and* in the index, and every consumer path still works (PM F-01). `git rm --cached` the **four** tracked paths under `.claude/workflows/` (`orchestrate-{dev,queue}.js`, `orchestrate-{dev,queue}.bundle.js`); add the **anchored** pattern `/.claude/workflows/` to the root `.gitignore` — anchored because an unanchored `.claude/workflows/` matches at **every** depth and would silently swallow the checked-in fixture's nested directory, turning AT-23's `== 7` into `== 0` with no diff to explain it (TSPEC §10.1). Verify mechanically, **with `--no-index` on the two negative conjuncts** (TE F-06 — `git check-ignore` consults the index by default and reports nothing for a *tracked* path, so without the flag both conjuncts pass identically under an anchored and an unanchored pattern and falsify nothing; measured 2026-07-28): `git check-ignore -v --no-index` reports **nothing** for `pdlc/workflows/__tests__/fixtures/covered-violations/.claude/workflows/*` and **nothing** for `pdlc/workflows/dist/*`, and `git check-ignore -v` (index-consulting, and correct here because this row has just untracked them) reports the pattern for the four real `.claude/workflows/*` paths. **Do not gitignore `pdlc/workflows/dist/`** — see **PL-01** in §7. **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02):* L-02 through L-06's accumulated document/`dist/`/mode/hook-registration changes (all still in the working tree and index, none committed), **plus** this row's four index deletions (files still on disk) and a modified `.gitignore`. *Resume recovery:* `git reset && git checkout -- .gitignore` restores tracking (undoes only this row's delta; the prior rows' changes are unaffected and stay). This is the only landing row whose own delta a plain `checkout` alone does not undo, which is why it is last. | `__tests__/documentOracles.test.js` (tracked-ness guard) | `.gitignore`, *(index only)* `.claude/workflows/**` | 20 | L-06 | ⬚ |
| L-05 | **Version bump and final build** (§7.5 item 2, AC-6.6). Bump `pdlc/.claude-plugin/plugin.json` `version` `0.10.0` → `0.11.0`, then run `node pdlc/workflows/build-runtime.mjs` and stage `dist/` (a no-op rebuild if L-06's is current — run it anyway, so the advertised version demonstrably covers the final bytes). **Which value the oracle reads, and when (TE F-09):** this batch's gate runs `advertisedVersionViolation(LIVE_ROOT)` **before the landing commit exists**, on a working tree where `plugin.json`'s version differs from `HEAD`'s *and* `dist/` carries uncommitted changes (L-06's, still uncommitted per §1) — that is §10.3's `"green"` branch, and `"green"` is what this gate requires. §9's and L-09's weaker `!== "red"` is the **post-commit** reading, taken by L-09 after the commit, when the working tree is clean and §10.3 is on a different branch. **Do not commit.** *Halt state (cumulative through this row, v2.1 PM F-02):* every prior landing row's accumulated change (L-02 through L-01, all still uncommitted), **plus** `plugin.json` and `dist/**` modified from this row. *Resume recovery:* `git checkout -- .` (restores this row's version-bump and rebuild delta only; the prior rows' state is unaffected and stays). | `__tests__/documentOracles.test.js` (§10.3), `runtimeBundle.test.js` | `pdlc/.claude-plugin/plugin.json`, `pdlc/workflows/dist/**` | 21 | L-01 | ⬚ |
| L-09 | **Landing verification, then the single landing commit.** Run the checklist against the *uncommitted* tree first: `node pdlc/workflows/build-runtime.mjs --check` exits 0 (bundles **and** manifest fresh); full `cd pdlc/workflows && npm test` green with **zero unexpected skips** — every skip printed carries a named unverified invariant; `coveredViolations(LIVE_ROOT)` is `[]`; `packagingViolations(LIVE_ROOT)` is `[]`; `advertisedVersionViolation(LIVE_ROOT)` is `"green"`; `indexMode` is `100755` for all five scripts and `100644` for `lib/pdlc-drift.sh`; the `covered-violations` fixture is tracked (`git ls-files --error-unmatch` over the 12 paths). **Then commit — once — every landing change** (§1, §8's Phase-CR check). Post-commit, re-run: `advertisedVersionViolation(LIVE_ROOT) !== "red"`, `git status --porcelain` shows no unintended untracked file under `.claude/workflows/` beyond the four now-ignored consumer copies, and the full suite is green. | *(whole suite)* | *(verification + the landing commit)* | 22 | L-05 | ⬚ |

---

## 3. Dependency notes — why the graph has the shape it has

1. **C1 is the critical path and cannot be widened.** TSPEC §2.1 makes `lib/pdlc-drift.sh` a single
   sourced file. Batch-safety rule 2 forbids two same-batch tasks writing one file, so T-31…T-35 are
   five consecutive batches. **The layering is chosen so each layer has a *sourced* observable, not
   an entrypoint-mediated one** (corrected in v2.0, TE F-03): C1 is sourced and has no execute bit,
   and `runScript`'s four entrypoints (TSPEC §3.1) do not exist until batch 11, so no layer can turn
   an exit code, a stderr line or an `expectRepoRootUnresolved` assertion green. What each layer
   *does* turn green is the probe-driven slice tabulated in Phase 4's preamble, reached through
   **T-39**'s `lib-probe.sh` on TSPEC §11.2's `backup-grammar.sh` precedent. Everything
   entrypoint-mediated is a **stated residual** of batches 6–10 and lands at batch 11; §5's gate for
   those batches names the enumerated red list plus the layer's own new green, and does not claim
   "full suite green". Splitting C1 into several sourced files would parallelise this — it is **not**
   done, because TSPEC §2.1's inventory and PROPERTIES §8.1's three-file static scan both name the
   file set, and changing it here would be a TSPEC amendment smuggled in through a PLAN.
2. **The node-side track is fully independent of bash** and finishes at batch 6. `document-oracles.mjs`,
   `build-runtime.mjs` and `orchestrate-queue.js` share no file with any bash task, so batches 3–6
   carry both tracks concurrently.
3. **`orchestrate-queue.js` is serialised across T-11 → T-12 → T-13** for the same single-writer
   reason, and each of the three re-emits `pdlc/workflows/dist/**`. The `dist/` artifacts are
   therefore owned by **six** tasks across six different batches (T-14→3, T-11→4, T-12→5, T-13→6,
   L-06→19, L-05→21) and never by two tasks in one batch. L-06 joined the list in v2.0 because it
   rebuilds after its own comment edits (TE F-04).
4. **T-14 precedes every `orchestrate-queue.js` task deliberately.** If the queue changes landed
   first, their rebuilds would write into `.claude/workflows/` and then be re-emitted into `dist/`,
   leaving two divergent generated copies mid-feature and a `runtimeBundle.test.js` that is red for
   two different reasons at once.
5. **Red-before-green is an edge, never id order.** Every green task's `Deps` names its red-test
   task: T-07←T-01, T-08a←T-01, **T-15←T-01, T-16←T-01, T-18←T-01, T-39←T-01** (added in v2.0 — TE F-07),
   T-09←T-02, T-11←T-03, T-12←T-04, T-14←T-05, T-17←T-06, T-31←T-25/27/29/30, T-36←T-24/T-19,
   T-37←T-21/T-23, L-03←(T-06's §9.3 assertions), L-04←T-19.
6. **Shared prerequisites are batch-1-style singletons with explicit downstream edges.** The helpers
   (`driftCapabilities`, `driftHarness`, `driftFixtures`, `driftOrdering`, `freshClone`,
   `bin/backup-grammar.sh`, `bin/lib-probe.sh` + `driftProbe` (T-39), `driftGenerators`) each have
   exactly **one** owning task, and every task
   that consumes one lists it in `Deps`. `driftHarness.js` is the only helper with two owners, split
   across batches 3 and 4 (core, then the message layer) because it is one file.
7. **PROPERTIES adds no test file.** Its properties land in TSPEC §14's existing suites (PROPERTIES
   §12) plus the one new helper. That is why every property task in batch 12 depends on the batch-5
   task that created the suite it appends to.
7a. **The property suites are appended *after* their subjects are green, and this is a deliberate
   deviation from red-first — stated, not hidden.** `driftGenerators.js` obtains the fault-token set
   by **sourcing C1 at runtime** (PROPERTIES §8.0 forbids a JS mirror and forbids a generated
   side-artifact), so no property that consumes it can be authored before T-31 exists, and the
   harness-mode properties additionally need an entrypoint (T-36/T-37). The red-first guarantee is
   therefore recovered **per property, by a recorded falsification run** — the mechanism is defined
   in §3.1 below, is a conjunct of §5's batch 12/13 gate and of §9's Definition of Done, and is not
   prose (TE F-02).

8. **T-50 exists only to avoid a same-batch collision** with T-38 on `queueDriftGate.test.js`. It
   carries no other reason to be its own batch.
9. **The landing chain is serial by state, not by file, and additive-before-destructive.** Its
   ordering constraints are: execute bits before hook registration (L-03→L-04); all document text
   final before the `coveredViolations` sweep (L-07, L-08 → L-06); the sweep before the untrack
   (L-06→L-01) so no landing task after the destructive one edits a document; every `dist/` change
   complete before the version bump and final build (L-01→L-05, with L-06 the last `dist/` writer
   before it); everything before verification-and-commit (L-05→L-09). `.worktreeinclude` leads
   (L-02) because it is additive and inert. See Phase 7's preamble for why v1.0's order was unsafe.
10. **The whole landing is gated behind the thirteen property tasks, deliberately** (PM F-07). L-02
   — and therefore every landing row — lists T-38 and T-41…T-50 in `Deps` even though it shares no
   file with any of them. The trade-off is stated rather than implied: **a single vacuous property
   in batch 12 halts the pipeline with the feature 100% built and 0% landed.** It is taken because
   the landing is the one irreversible step (it untracks the mechanism the repo currently runs on)
   and because §3.1's ledger makes "batch 12 green" a real claim rather than a formality. v2.0's
   resequencing bounds the blast radius: the halt now happens *before* anything destructive, at a
   `HEAD` that is fully functional. **Manual fallback if the operator chooses to land anyway:** run
   the Phase 7 rows in the stated order by hand, and file the unverified properties as residuals in
   §3.1's ledger — the landing has no technical dependency on batches 12–13, only a quality one.


### 3.1 The falsification ledger (batches 12–13)

v1.0 required each property task to "apply the property's own named mutation … and record the pair
in the batch report". That was unenforceable and rested on a false premise: **PROPERTIES has no
per-property `Falsifies` column.** A named mutation exists only in §7's conjunct table ("the wrong
implementation it is red against") and §8.1's class table — PROP-CLS-01, all 13 `PROP-BKP-*`, all 8
`PROP-BSL-*`, all 6 `PROP-RSN-*` and all 6 `PROP-DET-*` name none. v2.0 replaces the citation with a
mechanism that does not depend on one:

**Definition.** A property is **green** only when a **falsification run** for it has been recorded.
A falsification run is the ordered triple *(mutation, red, revert)*:

1. **Name the mutation first.** Before running anything, the implementer writes the mutation into
   the ledger as a one-line diff description against the *subject* (C1, C2/C3 or
   `orchestrate-queue.js`) — e.g. `pdlc_classify_row: drop the sync-manifest-entry guard`. Where
   PROPERTIES §7 or §8.1 already names one, that is the mutation and the ledger cites the section;
   where it does not, the implementer names it. Naming it **before** running is what stops a
   post-hoc rationalisation of a green.
2. **Apply it, observe red, record the failing case count and the first failure message.**
3. **Revert, observe green, record it.** The revert is verified by `git diff --exit-code` over the
   subject file before the batch closes — the ledger cannot be satisfied by a subject left mutated.

**Where it is recorded.** `docs/pdlc-workflow-distribution/FALSIFICATION-LEDGER.md`, a tracked file.
It is in the diff, so it is a Phase CR input (§8, batches 12–13) — answering TE Q-03: the "batch
report" is not an artifact this repo has, so the ledger *is* the artifact. Ownership: the file is
append-only and its batch-12 writers are concurrent, so **T-40 creates it** (batch 7, empty with its
header) and each property task appends **its own** `docs/…/FALSIFICATION-LEDGER-{task}.md` fragment;
**T-50 (batch 13) appends its own fragment for its three queue-side properties, then concatenates
every fragment into the ledger and deletes them.** This keeps
batch-safety rule 2 (no two batch-12/13 tasks write one physical file) without prose. *(v2.1, PM F-04
/ TE F-03(a) — the stale v1.0 sentence claiming "a tracked file created by the first property task
to run in batch 12" is deleted; it described the rejected mechanism batch-safety rule 2 forbids.)*

**Fallback for a property with no nameable mutation.** If the implementer cannot name a mutation
that makes the property red, the property is **not** marked green: it is filed in the ledger as a
**residual** with the reason, and it counts against §9's property total as unverified. A property no
mutation can falsify is vacuous, and a vacuous property is exactly what this ledger exists to catch.

---

## 4. File-ownership manifest

Every physical file this feature creates or modifies, with its owning task(s) and their batch. Two
tasks may appear against one file **only** when their batches differ. This table is the mechanical
audit of batch-safety rule 2.

### 4.1 Production sources

| File | Owner(s) → batch |
|---|---|
| `pdlc/hooks/scripts/lib/pdlc-drift.sh` | T-31→6, T-32→7, T-33→8, T-34→9, T-35→10 |
| `pdlc/hooks/scripts/check-workflow-drift.sh` | T-36→11 (mode: L-03→15) |
| `pdlc/hooks/scripts/sync-workflows.sh` | T-37→11 (mode: L-03→15) |
| `pdlc/hooks/scripts/{check-scope-field,guard-harvest-before-delete,nudge-consolidation}.sh` | L-03→15 (**mode only**) |
| `pdlc/hooks/hooks.json` | L-04→16 |
| `pdlc/workflows/build-runtime.mjs` | T-14→3 |
| `pdlc/workflows/lib/document-oracles.mjs` | T-09→3 |
| `pdlc/workflows/orchestrate-queue.js` | T-11→4, T-12→5, T-13→6, L-06→19 (comment correction) |
| `pdlc/workflows/orchestrate-dev.js` | L-06→19 (comment correction) |
| `pdlc/workflows/dist/**` *(generated)* | T-14→3, T-11→4, T-12→5, T-13→6, **L-06→19** (rebuild after the comment edits — TE F-04), L-05→21 |
| `pdlc/.claude-plugin/plugin.json` | L-05→21 |
| `pdlc/RELEASE-CHECKLIST.md` | L-07→17 |
| `pdlc/README.md`, `CLAUDE.md` *(L-08's bootstrap/worktree text, then L-06's §6.3 D-1/D-2/D-3 `dist/`-path corrections over the same final text — one row; v2.1 PM F-03 merges this with the former duplicate "§6.3 `dist/`-path documents" row, which named the identical two files)* | L-08→18, L-06→19 |
| `.gitignore` | L-01→20 |
| `.worktreeinclude` | L-02→14 |
| `.claude/workflows/**` *(index only — `git rm --cached`)* | L-01→20 |
| the 5 `coveredViolations` documents of §6.2 rows 1–5 (`QUEUE.md`, `MASTER-PLAN-engineering-loop.md`, `PLAN-pdlc-integration-boundary-gates.md`, both orchestrator `SKILL.md`s) | L-06→19 |

### 4.2 Test files

| File | Owner(s) → batch |
|---|---|
| `pdlc/workflows/__tests__/driftHelpers.test.js` | T-01→2 |
| `pdlc/workflows/__tests__/documentOracles.test.js` | T-02→2 |
| `pdlc/workflows/__tests__/driftRecordShape.test.js` | T-03→2 |
| `pdlc/workflows/__tests__/queueDriftGate.test.js` | T-04→2, T-38→12, T-50→13 |
| `pdlc/workflows/__tests__/runtimeBundle.test.js` | T-05→2 |
| `pdlc/workflows/__tests__/bootstrap.test.js` | T-06→2 |
| `pdlc/workflows/__tests__/hookCompatibility.test.js` | T-19→2 |
| `pdlc/workflows/__tests__/driftRepoRoot.test.js` | T-20→5, T-47→12 |
| `pdlc/workflows/__tests__/driftBaseline.test.js` | T-21→5, T-42→12 |
| `pdlc/workflows/__tests__/driftClassify.test.js` | T-22→5, T-41→12 |
| `pdlc/workflows/__tests__/driftSync.test.js` | T-23→5, T-44→12 |
| `pdlc/workflows/__tests__/driftHook.test.js` | T-24→5, T-45→12 |
| `pdlc/workflows/__tests__/driftLadder.test.js` | T-25→5 |
| `pdlc/workflows/__tests__/driftWriteFailure.test.js` | T-26→5, T-46→12 |
| `pdlc/workflows/__tests__/driftFault.test.js` | T-27→5, T-48→12 |
| `pdlc/workflows/__tests__/driftMessages.test.js` | T-28→5 |
| `pdlc/workflows/__tests__/driftOrdering.test.js` | T-29→5, T-43→12 |
| `pdlc/workflows/__tests__/driftBackups.test.js` | T-30→5, T-49→12 |

### 4.3 Helpers and fixtures (excluded from jest by the existing `testPathIgnorePatterns`)

| File | Owner(s) → batch |
|---|---|
| `pdlc/workflows/__tests__/helpers/driftCapabilities.js` | T-07→3 |
| `pdlc/workflows/__tests__/helpers/driftHarness.js` | T-08a→3, T-08b→4 |
| `pdlc/workflows/__tests__/helpers/driftFixtures.js` | T-15→4 |
| `pdlc/workflows/__tests__/helpers/driftOrdering.js` | T-16→4 |
| `pdlc/workflows/__tests__/helpers/freshClone.js` | T-17→4 |
| `pdlc/workflows/__tests__/helpers/bin/backup-grammar.sh` | T-18→4 |
| `pdlc/workflows/__tests__/helpers/bin/lib-probe.sh` | T-39→4 |
| `pdlc/workflows/__tests__/helpers/driftProbe.js` | T-39→4 |
| `pdlc/workflows/__tests__/helpers/driftGenerators.js` | T-40→7 |
| `pdlc/workflows/__tests__/fixtures/covered-violations/**` (12 files) | T-10→3 |

### 4.4 Process artifacts (§3.1's falsification ledger)

| File | Owner(s) → batch |
|---|---|
| `docs/…/FALSIFICATION-LEDGER.md` (header only) | T-40→7 |
| `docs/…/FALSIFICATION-LEDGER-T-4{1..9}.md` (one fragment per task) | T-41…T-49→12 *(each writes only its own)* |
| `docs/…/FALSIFICATION-LEDGER-T-50.md` (T-50's own fragment, its three queue-side properties) | T-50→13 *(v2.1, TE F-03(b))* |
| `docs/…/FALSIFICATION-LEDGER.md` (fragments concatenated in, all ten fragments deleted) | T-50→13 |

Fragment-per-task is what keeps ten concurrent batch-12 writers off one physical file; the
concatenation is a single-writer step in batch 13. Batch-safety rule 2 holds without a prose caveat.

**No file appears twice against one batch.** The three multi-owner clusters (`pdlc-drift.sh`,
`orchestrate-queue.js`, `dist/**`) are serialised by real `Deps` edges, not by prose.

---

## 5. Batch gates

| Batches | Gate wording |
|---|---|
| 1 | P0-00's seven assertions hold and are recorded; the pre-existing suite is green. |

| **2, 5** (RED-terminal) | **The new tests fail for the specified reason** — the named module, export or script does not exist — **and every pre-existing test is still green.** A blanket "full suite green" is unsatisfiable here by design. Each batch report names, per file, the count of failing cases and the failure reason string. |
| 3, 4, 11 | The full suite is green **except** the cases whose gating implementation has not yet landed, enumerated by name in the batch report. Additionally, batches 3–6 must leave `node pdlc/workflows/build-runtime.mjs --check` exit 0 (bundles rebuilt in the same commit as the source change). |
| **6–10** (C1 layers) | Two conjuncts, both required (v2.0, TE F-03). **(a) New green:** the layer's own **sourced-probe** assertions — the row of Phase 4's preamble table for this batch — pass. This is what makes the batch observable at all; C1 is sourced and the entrypoints do not exist until batch 11, so there is no entrypoint-mediated green to claim. **(b) Shrinking, enumerated red:** every still-failing case is named in the batch report with its gating task, and the list is a strict subset of the previous batch's. "The red list got shorter" is not sufficient on its own — without (a) it is unchecked. `build-runtime.mjs --check` stays clean (no workflow source is touched in these batches). |
| 12, 13 | Full suite green with **zero unexpected skips**: every printed skip is one of PROPERTIES §11.1's inventory rows or TSPEC §1.3's, and carries a non-empty named-invariant list. The four meta-oracles (baseline reasons, row states, row reasons, `writeFailures.operation`) and the ten-row queue-mapping floor are hard set-equality assertions and must be **green, not skipped**, on a uid-0 runner. **And (v2.0, TE F-02): every property this batch marks green has a recorded falsification run in §3.1's ledger** — mutation named *before* the run, red observed with a case count and first failure message, revert observed green, and `git diff --exit-code` clean over the mutated subject. Any property without one is filed as a **residual**, not marked green. The ledger fragment is part of the batch's diff. |
| 14–21 (landing) | **No batch in this range commits** (§1): each row leaves its change in the working tree and index and the single landing commit is made at L-09. Gate: the full suite is green **except** the five assertions this phase turns green, which are enumerated in Phase 7's precondition paragraph and must go green in the batch that owns them (L-03: §9.3 index modes; L-04: T-19; L-06: AT-22 **and** §6.3's D-1/D-2/D-3 oracles; L-05: §10.3, read as `"green"` pre-commit). `build-runtime.mjs --check` is clean at **every** boundary in this range — L-06 rebuilds in its own batch, so there is no sixth expected red (TE F-04). **Each row's stated halt state, read cumulatively** — the union of this row's own delta and every prior landing row's still-uncommitted delta back to L-02 — **must match what `git status` actually shows before the batch closes** (v2.1, PM F-02); a row's delta in isolation is not what `git status` shows from batch 15 on. |
| 22 | L-09's checklist, all conjuncts. |

> **Do not merge from batch 3 until L-09 has landed** (v2.1, PM F-06 / TE F-04). T-14, T-11, T-12 and T-13 each re-emit `dist/` with **no** version bump, so `advertisedVersionViolation(LIVE_ROOT)` reads `"red"` at the **pre-commit** gates of batches 3–6, `"green"` pre-commit from batch 7 through batch 18 (per-batch commits leave `dist/` clean, TSPEC §10.3 branch (a)), `"red"` again at batches 19–20 (L-06's uncommitted rebuild under an unbumped version), and `"green"` from batch 21. The hazard is **not** that the oracle is loudly red throughout — for most of that span it is not. The hazard is that once any of those working-tree states is **committed**, the stale-version-under-new-`dist/`-bytes condition becomes **undetectable** by this oracle: that is AC-6.6's accepted residual, which is exactly why `RELEASE-CHECKLIST.md` row 2 exists as a pre-publish manual check. Under defer-commit (§1), `plugin.json`'s bump and the final `dist/` bytes enter history together only at **L-09** (batch 22) — L-05 (batch 21) commits nothing. The branch is therefore mergeable only **after L-09's landing commit**, not after L-05.

---

## 6. Integration points

### 6.1 Existing code this feature touches

| Surface | Where | How it is touched |
|---|---|---|
| Bundle builder | `pdlc/workflows/build-runtime.mjs:27` (`OUT_DIR`), `~:158` (`mkdirSync`) | T-14 retargets `OUT_DIR` to `resolve(HERE, "dist")` and appends manifest emission; the `--check`/write loop keeps its shape |
| Queue entrypoint | `pdlc/workflows/orchestrate-queue.js:504` (`main`), `:523` (`await readFileFn(queuePath)`) | T-13 inserts the gate **before** line 523; the pre-existing read is left unwrapped (FSPEC §6.1, R-6) |
| Runtime adapter | `pdlc/workflows/runtime-adapter.js:85–96` (`rtReadFile`) | **Not modified.** It has no `try`/`catch`, so a throwing agent turn propagates — which is *why* `readDriftStateSafely` exists (O-19(d)). Hardening it is O-19(a)–(c), Cross-Feature |
| Bundle freshness test | `pdlc/workflows/__tests__/runtimeBundle.test.js:78–86` | T-05 repoints the freshness assertion at `dist/` and adds the manifest as a `--check` subject |
| Hook harness precedent | `pdlc/workflows/__tests__/hookCompatibility.test.js:46–58` (`runHookScript`) | T-08a generalises it into `runScript`; T-19 appends the C7 registration assertion to the same file |
| Meta-oracle precedent | `__tests__/helpers/guardRowIds.js` + `guardMatrix.test.js` | **Cited and reused**, not reinvented: the module-level `Set` + set-equality pattern is the form every coverage floor in T-21/T-22/T-26 takes (TSPEC §1.4) |
| Jest config | `pdlc/workflows/package.json:16-20` (`testPathIgnorePatterns`) | Unchanged — `/__tests__/helpers/` and `/__tests__/fixtures/` are already excluded, which is what lets T-10's fixture tree and every helper live where TSPEC puts them |

### 6.2 The seven live `coveredViolations` files (measured 2026-07-28, L-06's work list)

| # | Path | Pattern carried |
|---|---|---|
| 1 | `docs/_queue/QUEUE.md` | `.claude/workflows/orchestrate-queue.js` |
| 2 | `docs/design/MASTER-PLAN-engineering-loop.md` | `managed manually` / bundle-copy phrasing |
| 3 | `docs/PLAN-pdlc-integration-boundary-gates.md` | `.claude/workflows/*.js` |
| 4 | `pdlc/skills/orchestrate-dev/SKILL.md` | `.claude/workflows/orchestrate-dev.js` |
| 5 | `pdlc/skills/orchestrate-queue/SKILL.md` | bundle-copy phrasing |
| 6 | `pdlc/workflows/orchestrate-dev.js` | `.claude/workflows/orchestrate-dev.js` (comment) |
| 7 | `pdlc/workflows/orchestrate-queue.js` | `managed manually` (comment) |

Everything under `docs/orchestrate-dev-workflow/` and `docs/pdlc-workflow-distribution/` also matches
the raw patterns and is **exempt (ii)** (the directory contains `REQ-<X>.md`). P0-00 re-measures this
set; if it has moved, the count and TSPEC §10.1's mirror both change and the fixture stays at 7.

### 6.3 L-06's second half — the `dist/` path updates (PM F-04)

REQ §6's document-corrections bullet is **two** obligations. §6.2 is (a): whatever
`coveredViolations(repoRoot)` returns, with `coveredViolations(LIVE_ROOT) == []` as its oracle.
(b) — "`dist/` path updates to the already-correct normative documents" — is invisible to that
oracle **by construction**: these documents carry none of the five patterns, so an unenumerated (b)
would have no done-criterion at all. It is therefore enumerated here, with a per-file oracle that
does not route through `coveredViolations`. Measured against the live tree 2026-07-28.

| # | File | Edit | Oracle (asserted in `documentOracles.test.js` by **T-02** — added to T-02's task row in v2.1, TE F-01 — red until L-06) |
|---|---|---|---|
| D-1 | `CLAUDE.md` — *Workflow scripts and the runtime build* section (the two generated-artifact bullets, currently `.claude/workflows/orchestrate-{dev,queue}.bundle.js`) | restate the build's output as `pdlc/workflows/dist/` + `distribution-manifest.json`, and describe `.claude/workflows/` as the **untracked consumer copy produced by `sync-workflows.sh`** | the section names `pdlc/workflows/dist/` **and** `distribution-manifest.json` (positive, mechanical); **no line in the section matches both `build-runtime` and `.claude/workflows/`** (v2.1, TE F-02 — a greppable predicate; the section is still allowed, and expected, to contain the bare string `.claude/workflows/` on its own in the untracked-consumer-copy sentence, so the check is a **co-occurrence** match, not a bare-string-absence match) |
| D-2 | `CLAUDE.md` — *Plugins in this repo* / plugin table and the `pdlc specifics` preamble | add the two new scripts (C2, C3) and the second `SessionStart` hook row so the table matches `hooks.json` after L-04 | the hooks table has a row whose script is `check-workflow-drift.sh`; the skills/scripts inventory names `sync-workflows.sh` |
| D-3 | `pdlc/README.md` — model-selection section's `workflows/orchestrate-*.js` references and any generated-artifact mention | point generated-artifact references at `workflows/dist/`; the *source* references (`workflows/orchestrate-dev.js` for `MODEL_DEFAULT`) are correct and are **not** changed | `pdlc/README.md` mentions `workflows/dist/` (positive, mechanical); **no line in `pdlc/README.md` matches `.claude/workflows/` followed by `bundle`** (v2.1, TE F-02 — a greppable predicate replacing the semantic "no longer describes a generated artifact" phrasing) |

D-1 and D-3 also carry L-08's bootstrap and worktree-limitation text, so L-06 sweeps their final
wording — which is why L-06 follows L-08 and precedes nothing but L-01.

**Disposition of the two pending-queue REQs (decided, not left to the exemption).**
`docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` and
`docs/pdlc-review-loop-hardening/REQ-pdlc-review-loop-hardening.md` each reference
`.claude/workflows/` once and are covered by exemption (ii) (`docs/<X>/` containing `REQ-<X>.md`),
so `coveredViolations` will not flag them. They are **out of scope for this PLAN** — and the reason
is stated rather than inherited from the exemption:

- Editing an approved, queued REQ from inside a different feature's landing commit would silently
  amend another feature's approved upstream artifact. That is the class of change the PDLC review
  loop exists to prevent, and no reviewer of *those* REQs would see it.
- The risk PM F-04 names is real but is a **queue-time** risk, not a landing-time one: a future
  feature implemented from a stale REQ could re-create the drift. It is closed at the right seam —
  **`docs/_queue/QUEUE.md` is §6.2 row 1 and *is* corrected by L-06** — but **not** with a `Notes`
  line (v2.1, PM F-01): `pdlc/skills/orchestrate-queue/SKILL.md` §1 states that "extra columns are
  ignored", the live `QUEUE.md` table has exactly its five parsed columns, and a `Notes` column would
  be parsed away before Phase-0 triage ever sees it. The control is placed instead in a field the
  parser and the triage both read: L-06 adds `pdlc-workflow-distribution` to row 8
  (`pdlc-review-loop-hardening`)'s `Depends-On` cell — a one-cell edit inside the same `QUEUE.md`
  edit L-06 is already making. This arms `orchestrate-queue`'s **existing** re-grounding gate
  (selection step 3d): a queued REQ whose declared dependency merged after the REQ's authoring date
  is re-diffed against HEAD, emitting `needs-human` on any stale dependency-surface claim. Row 4
  (`pdlc-consolidation-agent`) already declares `pdlc-workflow-distribution` in `Depends-On` and needs
  no edit — the gate already covers it; row 8 (`Depends-On: —`) was the only row genuinely exposed.
- Recorded as an obligation in §7 (row **PQ-1**) so DoD does not read it as an unhandled deferral.

---

## 7. Obligations carried into implementation

Every hand-off row the upstream documents route to "the implementation phase", with the task that
owns it. A reviewer checking completeness should find each here.

| Obligation | Source | Owning task |
|---|---|---|
| **O-19(d)** — wrap the drift-state read so a throwing `_readFile` maps to row 1 `blocked` | TSPEC §12.3, §16 | **T-13** (impl) + **T-04** (the three-way injection table, asserting a **returned report**) |
| **O-19(c)** — record the seam's LLM mediation in `orchestrate-queue.js` | TSPEC §16, R-7 | **T-13** — a code comment with no assertable observable; a review item on the diff, explicitly re-checked at Phase CR |
| **O-19(a)** — add no second agent-mediated read | TSPEC §12.4 | **T-04**'s single-call gate-placement test; **T-13** must not introduce another |
| **O-19(b)** — unit-test D1–D8 against mangled-relay fixtures | TSPEC §12.1 | **T-03** — the implementer writes TSPEC's **sixteen-row** table, all six mandated relay shapes, not a new one |
| **`PDLC_FAULT_TOKENS`** — a bash array in **C1**, TSPEC §5.2 order, behind an idempotent-source guard; **no** JS mirror, **no** generated side-artifact | PROPERTIES §8.0 | **T-31** (declaration + guard) and **T-40** (`readFaultTokens()` via `bash -c 'source …; printf'`, exit-status-checked, 16-entry sanity conjunct) |
| **uid-0 skip inventory wiring** — every permission-constructed fixture skips *loudly* with named unverified invariants | TSPEC §1.3, PROPERTIES §11.1 | **T-07** (helper + exported invariant strings, throwing on an empty list) → call sites in **T-22** (AT-32a), **T-25** (AT-14b, AT-16), **T-26** (AT-27), **T-22** (AT-34), **T-41** (leaves L3/L4) |
| **`pdlc/RELEASE-CHECKLIST.md`'s three commitments** — AC-6.2a's installed-package assertion, AC-6.6's landed-violation fallback, NFR-2's one-off observation | TSPEC §2.1a, §16 | **L-07** (a deliverable in §4.1's inventory, not an intention) |
| **Anchored gitignore** | TSPEC §16, §10.1 | **L-01** (batch 20 — the last state-changing landing task), with a mechanical `git check-ignore -v` verification whose two **negative** conjuncts carry `--no-index` (TE F-06) |
| **Worktree observation** — observe once whether a Claude-created worktree copies untracked `.claude/workflows/` content | TSPEC §16, FSPEC §11.1 | **L-02** records the observation in its batch report; documentation-scope, no test |
| **R-12's successor** — AC-5.3's rendered version lines have no assertion | TSPEC §16 (v2.1, PM F-03), R-12 | **Not this PLAN's** — routed at DoD to either a follow-up REQ against FSPEC §8.2 or a `consolidate-learnings` entry. Restated here so DoD does not read it as an unhandled deferral |
| **O-13** — REQ-scope stopping rule → `docs/_constraints/DOMAIN-CONSTRAINTS.md`, which must be **created** (it does not exist in this repo) | TSPEC §16 | `consolidate-learnings`; carried so it is not lost |
| **PQ-1** — the two pending-queue REQs (`pdlc-consolidation-agent`, `pdlc-review-loop-hardening`) reference `.claude/workflows/` and are exempt (ii); their REQs are **not** edited by this feature | §6.3 (PM F-04, revised v2.1 PM F-01) | **L-06** — adds `pdlc-workflow-distribution` to row 8 (`pdlc-review-loop-hardening`)'s `Depends-On` cell in `docs/_queue/QUEUE.md` (QUEUE.md is §6.2 row 1, already in L-06's work list), arming `orchestrate-queue`'s existing re-grounding gate (SKILL.md selection step 3d); row 4 (`pdlc-consolidation-agent`) already declares the dependency and needs no edit |
| **Harvest rule** — *a checklist-owned AC needs a checklist artifact in the deliverable inventory* | TSPEC §16 | `harvest-learnings` |
| **Ledger lifecycle** — `docs/…/FALSIFICATION-LEDGER.md` is retained, not harvested/deleted, after Phase CR | §3.1, §7.1 PL-04 (v2.1, PM F-05) | Stands as a permanent process artifact; no owning task past T-50 |

### 7.1 PLAN-level findings for the reviewer

| # | Finding |
|---|---|
| **PL-01** | **TSPEC §10.1 and §2.1 disagree about `pdlc/workflows/dist/`.** §10.1's landing note says the landing step writes anchored patterns "(`/.claude/workflows/`, `/pdlc/workflows/dist/`)", while §2.1's inventory lists `dist/*.bundle.js` and `dist/distribution-manifest.json` as **"generated, tracked"** and FSPEC §7.5 item 1 gitignores only `.claude/workflows/`. **The real hazard, restated correctly (TE F-08):** `.gitignore` never affects an *already-tracked* path, so the existing `dist/` artifacts would keep committing fine — v1.0's "uncommittable without `git add -f`" rationale was wrong and is withdrawn. What a `dist/` ignore would actually break is (1) any **future** bundle or manifest added under `dist/` would be silently unstageable, and (2) `git status` would stop reporting an unexpected `dist/` artifact — which is AC-6.6's working-tree observation point and the signal a stale or hand-edited generated file depends on. AC-6.2a/AC-6.6 both depend on `dist/` shipping, so the resolution is unchanged; only the reason is. **Resolution taken by L-01:** write the anchored `/.claude/workflows/` entry only; add **no** `dist/` ignore pattern, and verify with `git check-ignore -v` that neither the real `dist/` nor the fixture's nested `pdlc/workflows/dist/` is ignored. §10.1's *anchoring* requirement is honoured — it binds any such pattern **if one is ever added**. Flagged rather than silently chosen. |
| **PL-02** | **`__tests__/driftHelpers.test.js` is a PLAN-added file.** TSPEC §14's inventory names no home for the helper contracts TSPEC itself states normatively (§1.3 contract 2, §3.2.1's throw, §3.3's `setRowState` self-oracle, §3.4 rules 2–3, §11.2's line-count check). Leaving them unasserted would make five stated contracts unenforced; putting them in a consuming suite would give that suite a second unrelated subject. If a reviewer prefers, they fold into `driftHelpers`' consumers with no change to the dependency graph. |
| **PL-03** | **C1's five-layer split is a PLAN decision, not a TSPEC one.** TSPEC §2.2 states one surface table; the layering here is purely an execution ordering. **Corrected in v2.0 (TE F-03):** v1.0 justified the split by claiming each layer has an independently red-testable observable. That was false for layers 2–5 — C1 is sourced (§2.1, OQ-4) and every entrypoint-mediated observable belongs to C2/C3, which land at batch 11. The split now stands on two honest legs: (1) the single-writer rule forbids parallelising one physical file, so *some* serial split is forced, and the five-way cut follows TSPEC §2.2's own functional grouping; (2) each layer has a **sourced** observable via T-39's probe driver, tabulated per batch in Phase 4's preamble, with the entrypoint-mediated residual named per layer. It still creates no production file and changes no function boundary; T-39 adds one test helper and one test driver, both already-excluded paths. **Declared (v2.1, TE F-05):** beyond the helper and driver, T-39's probe work also inserts PLAN-authored `it()` blocks into **seven** TSPEC-owned suites — `driftRepoRoot.test.js`, `driftBaseline.test.js`, `driftClassify.test.js`, `driftSync.test.js`, `driftFault.test.js`, `driftBackups.test.js`, and the layer-5 reuse in `driftMessages.test.js` — on the same PL-02 precedent (a normative-but-unplaced case declared explicitly rather than left for a Phase-CR reviewer to mistake for a TSPEC-mandated `it()`), so §8's batch-5 "every AT in §14 has a real `it()`" check is not read as an exhaustive-contents check on those seven files. |
| **PL-04** | **`docs/…/FALSIFICATION-LEDGER.md` is a PLAN-added process artifact** (§3.1, from TE F-02). No upstream document names it; TE Q-03 asked which artifact the "batch report" is, and this repo has none, so the ledger is it. It is tracked and in the diff so Phase CR can read it. A reviewer who prefers it untracked can make it a batch-report convention with no change to the dependency graph — but then §5's batch 12/13 gate loses its only checkable object. **Lifecycle disposition (v2.1, PM F-05):** the ledger is **not** harvested or deleted by `harvest-learnings` — it matches neither the `CROSS-REVIEW-*` nor `CODE_REVIEW-*` glob `guard-harvest-before-delete.sh` guards — and is **deliberately retained** after Phase CR as the project's permanent falsification record, sitting in `docs/pdlc-workflow-distribution/` beside `LEARNINGS-…md`. |
| **PL-05** | **Upstream tension recorded, not edited (TSPEC §14, AT-7).** §14's AT-7 row names both `driftClassify.test.js` and `queueDriftGate.test.js` and says the asymmetry is "asserted as **both** halves in one test file each", but AT-7's stated claim bundles a *classification* fact (`unverified`) with an *entrypoint* fact (`--check` exits 2) and a *queue* fact (queue proceeds). The classify-side half therefore straddles two batches: the classification conjunct is probe-observable at batch 8, the exit conjunct only at batch 11. T-22 owns both conjuncts and T-38 owns the queue half; **no TSPEC edit is proposed** — the split is an execution detail, and §14's file placement is honoured exactly. |

---

## 8. What Phase CR (final codebase review) should verify, per batch

| Batch(es) | Phase CR checks |
|---|---|
| 1 | P0-00's measurements are recorded in the diff or the batch report — in particular the live seven-file `coveredViolations` set and BL-01's discharge — and not merely asserted in prose. |
| 2 | Every RED file's cases fail for the **stated** reason (missing module/export), not for a typo; no case was authored `.skip`ped or `todo`; `driftRecordShape.test.js` carries **sixteen** rows with **one** mutation each and asserts the **clause id**, never `ok:false`. |
| 3 | `document-oracles.mjs` is **side-effect-free** and reads no ambient state (no `process.cwd()`, no `import.meta.url`-relative path) — the two-root structure depends on it; `EXEMPTIONS` has **exactly four** members with (i)'s two trees inside one string; the four `S_*` strings are exported, not duplicated in the test; `build-runtime.mjs` computes `pluginSha1` over the **same in-memory `contents`** it wrote, not by re-reading the file; the manifest serialisation is byte-deterministic; the bundles in the diff are regenerated, not hand-edited. |
| 3–6 | Every `orchestrate-queue.js` change ships with a regenerated bundle in the **same commit**; `build-runtime.mjs --check` is clean at each batch boundary; **`readDriftStateSafely` is `await`ed at its call site** and no other injected IO call was left unawaited. |
| 4 | **`lib-probe.sh` (T-39) calls `pdlc_fault_active` nowhere** and is not a shipped bash source, so PROP-SEAM-02's three-file scan and PROPERTIES §8.1's static scan are untouched; `runProbe` asserts line-count equality like `runGrammar`; `sandboxEnv` **constructs** the child environment (no `...process.env` anywhere in `driftHarness.js`); `makeToolDir` throws rather than degrading; `setRowState` re-derives and throws; `makePluginTree` throws when `manifestRaw` and `manifestOverride` are both given; `assertTreeUnchanged` excludes `.git/` segments; `assertPostCopyNarrow` is **multiset**, not set, equality; `inodeOf` returns `bigint`. |
| 5 | Every AT in TSPEC §14 and every row in §14.1 has a real `it()` — none discharged by review; the four split ATs are actually split (AT-5 → 3, AT-31 → 2, AT-34 → 3, AT-14b → 2); the meta-oracles are **failing set-equality assertions** against literal lists, not checklists; no test hard-codes an argv (all go through `runScript`'s entrypoint mapping); no test spawns a JSON interpreter to read back an artifact. |
| 6–10 | Each batch's **sourced-probe** assertions (Phase 4's preamble table) are real `it()`s that were red in the previous batch — a layer that turned nothing green is a gate failure, not a bookkeeping note (TE F-03); the still-red list in the batch report is a strict subset of the previous batch's; C1 is **sourced-only** and carries no execute bit; the idempotent-source guard precedes every `readonly`; `pdlc_trace` returns 0 on every path; `pdlc_classify_row` is the **only** site that sets a trace phase label; no `stat -c %Y`, no `find -newer`, no `ls -t` anywhere in C1/C3; rows are iterated **by index**, never globbed; `export LC_ALL=C` is present in C1 (and not relied on from the harness); `pdlc_prune_backups` has the single signature `<dir> <knownIds…>` and always exits 0; every `pdlc_fault_active` call site passes a **bare literal** as argument 1. |
| 11 | Both scripts are `100755` in the index and executable on disk at creation; C2 exits 0 on every path; C3 never exits 1; neither script runs a VCS command during sync; the optional `SKILL.md`, if shipped, carries none of the five patterns. |
| 12–13 | **§3.1's falsification ledger is in the diff and complete**: one entry per property marked green, each naming the mutation *before* the run, the observed red (case count + first failure message) and the observed green after revert; no subject file is left mutated (`git diff --exit-code`); every property without an entry is filed as a **residual** and is not marked green (TE F-02, TE Q-03). PROPERTIES' two seam oracles are genuinely **independent** — PROP-SEAM-01 reads the runtime array, PROP-SEAM-02 reads the three files as text and **excludes** the array declaration, the definition site, comments and heredocs; `readFaultTokens()` checks the child's exit status **before** the array; PROP-SEAM-01(b) draws **one case per class** from four classes; PROP-NEG-05 includes draw (5) (`syncManifest[id].pluginHash`); every property's "reached the subject" conjunct is present so no invariance property is vacuous; every skip is in PROPERTIES §11.1's inventory. |
| 14–22 | The landing commit is **one** commit containing all of §4.1's landing rows — verifiable because batches 14–21 defer committing and L-09 makes it (§1, PM F-02); the **order** is the v2.0 one (additive first, `git rm --cached` second-to-last), and each row's stated halt state matched `git status` at its boundary; L-06's diff contains **both** the document edits **and** the regenerated `dist/` (no stale-bundle window — TE F-04); §6.3's D-1…D-3 edits are present and each meets its stated oracle, asserted by T-02; `docs/_queue/QUEUE.md` row 8 (`pdlc-review-loop-hardening`) carries `pdlc-workflow-distribution` in its `Depends-On` cell (v2.1, PM F-01 — not a `Notes` line) (§7 PQ-1); `.gitignore`'s pattern is anchored and `git check-ignore -v --no-index` proves the fixture and `dist/` are not swallowed (**the flag is the check** — without it the two negative conjuncts are vacuous for tracked paths, TE F-06); all five scripts are `100755` in the **index** (not just on disk) and `lib/pdlc-drift.sh` is `100644`; `hooks.json` has exactly two `SessionStart` entries; `RELEASE-CHECKLIST.md` exists, names all three commitments, and carries none of the five patterns; the seven document corrections are real edits and no archived per-feature spec history was touched; the version bump is in the same commit as the final `dist/` bytes; `coveredViolations(LIVE_ROOT)` is `[]` **as run**, not as claimed. |
| all | No production code path reads `PDLC_FAULT` or `PDLC_TRACE_FILE` for anything but fault injection and tracing; no test asserts timing (NFR-2 is structural); nothing in `pdlc/workflows/dist/` was written by a test. |

---

## 9. Definition of Done

- [ ] `cd pdlc/workflows && npm test` is green, with **zero unexpected skips** — asserted **mechanically**, not by eye: `driftHelpers.test.js` compares `REGISTERED_SKIPS` against T-07's exported inventory (TSPEC §1.3 ∪ PROPERTIES §11.1) and fails on any member of the former absent from the latter, or with an empty invariant list (TE F-10).
- [ ] All **39** acceptance tests (AT-1…AT-36 incl. AT-8a/8b, AT-14b, AT-18a/18b) exist as real `it()` blocks in the files TSPEC §14 names — and the claim is **derivable from §2's task table**: every AT appears in exactly the task(s) owning the file(s) §14 places it in. v1.0 had one orphan, AT-7's `driftClassify.test.js` half, which §14 places in **both** files; it is now T-22's (classification + `--check` exit 2) with the queue half T-38's (TE F-01). The four split ATs are split in the tasks that own them: AT-5 → T-24 (a, b) + T-38 (c); AT-31 → T-38 (a, b); AT-34 → T-22 (×3); AT-14b → T-25 (×2).
- [ ] All **18** §14.1 cases exist — S-1/2 (2), B-1…5 (5), M-1/2/3 (3), PH-1 (1), V-1…4 (4), F-1/2/3 (3) = **18**, which is what TSPEC §14.1's table actually holds. (v1.0 said 21; nothing upstream states 21 — TE F-05(a).)
- [ ] All **63 distinct** PROPERTIES ids exist in the files PROPERTIES §12 names — 8 CLS, 6 RSN, 8 BSL, 13 BKP, 7 MTM, 8 SEAM, 6 DET, 7 NEG = **63**, counted from the property definitions and cross-checked against §12's placement table. Counted as **placement rows** (each independently-falsifiable half of the eleven split properties, plus CLS-02(a)/(b), as its own row) the same set is **75** rows across ten files. (v1.0 said 65; no upstream document states a total and 65 matches neither count — TE F-05(b). The reviewer's 55 omitted the eight `PROP-SEAM-*`.)
- [ ] Every TSPEC §1.4 coverage floor is present, green on a uid-0 runner, **in the form §1.4 states for it** (v1.0 asserted set-equality for all of them, which is false for four — TE F-05(c)):
  - **Set-equality meta-oracles** (module-level `Set` asserted set-equal to a literal list, on the `helpers/guardRowIds.js` + `guardMatrix.test.js` precedent): 8 baseline reasons; 6 row states; 4 row reasons; 9 `writeFailures.operation` values (5 recordable present / 4 stderr-only absent-from-record); 10 queue-mapping rows; 3 trace phases.
  - **Reached-at-least-once floors** (not set-equality): exit codes 0–4, each asserted once **per entrypoint that can produce it** (`--check` 0,1,2,3,4; sync 0,2,3,4, never 1; hook 0 only); 3 ladder rungs, each discriminated; **≥2** hook-silence sites, **≥1** with strict `stderr === ""`; **≥1** `syncCommand` string-equal expansion plus its `null` cases.
  - **Remediation-class pairings** (class assertion per row, with the stated `mustNotName` halves): 4 row reasons, 6 R-states, 8 baseline reasons.
  - **Message catalogue** (v1.0 omitted it entirely — TE F-05(c)): AT-30's pairwise `distinct()` over S1/S2/S3, rendered through the **real** `pdlc_msg_*` functions via the §11.2 batched driver. Owner: **T-28**, `driftMessages.test.js`.
- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits 0; both bundles **and** `dist/distribution-manifest.json` are fresh and committed.
- [ ] Every `orchestrate-queue.js` change shipped with its regenerated bundles in the same commit; every injected IO call is `await`ed.
- [ ] `coveredViolations(LIVE_ROOT) == []` and `packagingViolations(LIVE_ROOT) == []`; `advertisedVersionViolation(LIVE_ROOT) !== "red"`.
- [ ] `coveredViolations(FIXTURE_ROOT)` returns exactly the 7 enumerated paths and `EXEMPTIONS` equals the literal four-member array.
- [ ] Index mode `100755` **and** on-disk `X_OK` for all five scripts; `100644` for `lib/pdlc-drift.sh`.
- [ ] `.claude/workflows/**` is untracked and covered by an **anchored** gitignore pattern, proved by `git check-ignore -v --no-index` on the two negative conjuncts (TE F-06); the `covered-violations` fixture's 12 files are tracked.
- [ ] `.worktreeinclude` exists at the repo root listing `.claude/workflows/`; the worktree observation is recorded.
- [ ] `pdlc/hooks/hooks.json` registers the second `SessionStart` entry; `hookCompatibility.test.js` is green.
- [ ] `pdlc/RELEASE-CHECKLIST.md` exists with the three §2.1a rows and carries none of the five patterns.
- [ ] `CLAUDE.md` and `pdlc/README.md` document the two-command bootstrap and the manual-worktree limitation; **§6.3's D-1, D-2 and D-3 each meet their stated oracle**, asserted by **T-02** (the half of REQ §6's document-corrections bullet `coveredViolations` is blind to — PM F-04); `docs/_queue/QUEUE.md` row 8 (`pdlc-review-loop-hardening`) carries `pdlc-workflow-distribution` in its `Depends-On` cell (v2.1, PM F-01 — **not** a `Notes` line, which the shipped queue parser drops).
- [ ] `pdlc/.claude-plugin/plugin.json` `version` bumped in the landing commit — **one** commit, containing every Phase-7 change (§1, PM F-02).
- [ ] **REQ-DIST-05 (version stamping, reporting only)** — PM F-03: `dist/distribution-manifest.json` carries per-row **`artifactVersion`** and top-level **`pluginVersion`**, both read from `pdlc/.claude-plugin/plugin.json` at build time (AC-5.1); no module or bundle gained a version field and no `meta` literal changed; **no semver comparator exists anywhere in the diff** — versions are compared for equality only and content hash is authoritative (AC-5.2); `pluginVersion` is never an input to a state decision and is `null` when unreadable (AC-5.4). AC-5.3's *rendered* report lines remain the stated residual **R-12**, routed in §7.
- [ ] **REQ-DIST-04 (queue gate)** — PM F-05: `mapDriftState` implements AC-4.1's outcome table in precedence order, all ten rows asserted with `{outcome, row}` (row 2 — `checkEnabled: false` — proceeding *above* the blocking rows, so the opt-out stays reachable), and AC-4.3's announced opt-out is asserted: a proceeding-with-skip run **names the skip in the report**. The gate performs exactly **one** injected read (AC-4.1, §12.4) and a throwing/`null`/non-object read returns a **report** with row 1 `blocked`, never an abort (§12.3).
- [ ] **§3.1's falsification ledger is complete** — one entry per green property (mutation named first, red observed, revert observed green), and every property without one filed as a residual.
- [ ] Every §7 obligation has a landed owner; **R-12** is routed (follow-up REQ or `consolidate-learnings` entry) rather than left as a bare deferral.

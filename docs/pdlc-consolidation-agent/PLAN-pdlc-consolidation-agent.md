# PLAN — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.6 | 2026-08-09 |

> **1.6 (one rule stated, four cells reverted, one row grounded — no design change, no graph change).**
> Round 5's two open items, both about the `Status` column's meaning. (i) **The column had become a
> ledger for four rows and a baseline for thirty** (PM F-13, TE F-01). T03 and T17 read `🔴` and T27
> and T28 read `✅`, while rows whose work is equally landed at HEAD read `⬚` — so `⬚` meant "not
> started" on one row and "nobody updated this" on another, and no rule in the document told the two
> apart. Resolved in the direction both reviewers named as cheaper and equally honest, and resolved as
> a **rule** rather than as a reconciliation that would drift again by the next wave: §2 now states
> that the column is a Phase-P baseline owned by nobody during Phase I, and §4's four out-of-band
> cells are reverted to a uniform `⬚`. The rule is grounded, not asserted — `parsePlanTasks`
> (`orchestrate-dev.js:3761`) reads the id, `Deps` and batch cells and nothing else (the description
> and batch columns are marked "LOOSE … cosmetic" at `:3764`; the id/deps headers match exactly at
> `:3797-3798`), and resume is already owned by the wave ledger at `WAVE_STATE_PATH` (`:8860`,
> `parseWaveLedger` `:8916`). A second hand-kept ledger could only disagree with the first. This
> answers PM Q-08 and TE Q-01 with the same sentence. (ii) **T13's "both axes in the same commit" rule
> now survives finding the work already done** (PM F-14). Re-measured at HEAD through `git show HEAD:`,
> *both* halves are present — `runtimeBundle.test.js:230` carries `"_envPresent", "_makeTempDir"` and
> `:1057` carries `"consolidate-learnings.js"` — where v5 measured only the first. The row therefore no
> longer reads as if neither axis had moved: it says the implementer's job is to **assert** both, since
> a task that finds one half done and drops the pairing is how a half-widened scan becomes permanent.
> Gate re-run over the revised text: **34** tasks (`errors: []`), **34** ownership rows,
> `validatePlanContract` `{"ok":true}`, **15** ready-sets, **15** waves, **0** batch-column mismatches
> — every number identical to v1.4's and v1.5's, as a Status-only diff must leave them.
> The three v5 items not listed here were already closed by v1.5 and were re-checked, not rewritten:
> §5's "Twelve" census (PM F-12, TE F-02) and T33's fourth-row wording (TE F-03) both stand as landed.

> **1.5 (three prose-against-measurement corrections — no design change, no graph change).** Round 4's
> two findings and its one question, all inside §5, §4.2 and §6.1. (i) **§5's writer census was a
> containment check over 11 of 12.** The sentence read "**Eleven** further test files" and enumerated
> eleven; deriving multi-writer entries from §5's own rows returns **16**, of which four are itemised
> in the cluster table above, leaving **twelve**. `consolidationLifecycle` (T23 → T31) was in neither.
> It now reads "Twelve", names the file, and closes with the set-equality the rest of the document
> demands of its own oracles — four plus twelve is sixteen, and sixteen is what the manifest returns.
> No batch hazard hid in the omission (3 → 10 is strictly increasing; the collision count is 0 either
> way), which is why this was never gating: the defect was that the audit a reader performs from the
> paragraph could not have caught it. (ii) **T33 said the manifest gains its "fifth artifact"; it gains
> its fourth row.** Measured at HEAD: `git ls-files pdlc/workflows/dist/` returns **four** paths while
> `distribution-manifest.json` carries **three** rows (`orchestrate-dev`, `orchestrate-queue`,
> `pdlc-cli`), because the manifest carries no row for itself. T32 takes it to five files and four
> rows — the vocabulary the same row already used two sentences earlier, and the exact distinction
> T33's oracle turns on (`TSPEC:2450`). (iii) **§6.1 now records the rejected alternative ordering.**
> Round 4 asked whether moving T07/T08 to the front of the build-suite cluster had been considered.
> It was, and the answer is measured rather than argued: the alternative returns the same **15**
> ready-sets and **15** waves and merely swaps which pair waits (T07/T08 to waves 4 and 7, T10/T12 out
> to 8 and 9), while costing one legible edge — `T10 → T08` relates a `.gitignore` entry to a skill
> prompt. Gate functions re-run over this revision: 34 tasks, 34 ownership rows,
> `validatePlanContract` `{"ok":true}`, 15 ready-sets, 15 waves, 0 batch mismatches, 0 same-batch file
> collisions.

> **1.4 (carry v1.3's un-skip discovery into ownership, batching and the DoD — no design change).**
> v1.3 noticed that §9.1's errata 1 and 3 had landed and that T07, T08 and T33 therefore have
> executable oracles, but wrote that discovery into the task descriptions and `Test File` columns
> only. Four consequences are repaired here. (i) **Ownership** — `consolidationBuild.test.js` is now
> named in §5's rows for T07, T08 and T33; without it the un-skip is written and never committed,
> because the wave commit is pathspec-scoped to the task's owned paths and never `-a`
> (`pdlc/workflows/orchestrate-dev.js:10186-10194` — `const paths = Array.isArray(task.files) ?
> task.files : []` handed to `commitPaths`), and for T33 — alone in the last batch, with no co-batch
> owner of the file — the loss would be total and would surface only at §8.3's zero-`describe.skip`
> row, after every wave had run. (ii) **One block per green owner** — T03's `T07/T08 — skill prompts`
> block is split into `T07 — skill prompt` and `T08 — skill prompt`, because a single `describe.skip(`
> token cannot be half-removed; §2's and §9.4's "a partial un-skip is visible by grep" is only true of
> blocks with one green owner each. (iii) **Serialisation** — with the file owned, T07 and T08 joined
> the `consolidationBuild.test.js` cluster, where T10 (batch 3) and T12 (batch 4) already write. They
> are serialised onto the end of that chain by real `Deps` edges (T07 deps T12, T08 deps T07 ⇒
> batches 5 and 6), which is what §2's single-writer-per-batch rule requires; §5's cluster row and its
> stale `Batch` cells (2, against §4's 3) are re-derived. (iv) **The DoD stops mis-stating itself** —
> §1's "no oracle of any kind" paragraph and §8.3's "no executable oracle exists" heading described
> the pre-erratum world; both now read "reviewer read **in addition to** the source-text case owned by
> T03". T07/T08's `[Docs, review-gated]` label goes with them: the label named the *absence* of a
> test, which no longer holds.

> **1.3 (FSPEC re-pin — locators only, no design change and no re-authoring).** The FSPEC moved
> **11.3 → 11.5** (two erratum rounds that changed, in their own words, "no rule, AC, BR, AT or
> fixture" — `FSPEC:14`), which shifted §13's register range and every row locator this PLAN cites
> without changing the register's membership. Re-measured at v11.5: the register still carries
> **99** ids and `AT-M11` / `AT-Q13` / `AT-R7` are still present, so §4's task assignments and T05's
> expected cardinality are unchanged. What is repaired is the pin and the locators, because T05's
> **version pin** conjunct asserts the FSPEC `Version` cell literally: left at `11.3` it would have
> failed in batch 2 on a correct tree, reading "the code is wrong" when the truth is "the register
> moved" — the exact failure mode the pin exists to make legible. Updated: the upstream-version
> table (`11.5`, erratum history `:44-45`), T05's pin and register range (`:2089-2239`), T20/T21's
> register-row and §15 trace cites (`AT-M3 :2132`, `AT-M11 :2133`, `AT-R7 :2154`, `AT-Q13 :2174`;
> AC-1.3 `:2359`, AC-1.4 `:2360`, AC-3.2 `:2368`), the retirement note (`FSPEC:44-45`), §8.3's DoD
> row and §10's risk row. Two v1.2 quotations of FSPEC prose that v11.5 deleted ("without the pair…")
> are replaced by cites to the rows that now carry the reasoning. Statements describing what earlier
> revisions measured *at the time* are left as written, being history rather than live claims.

> **1.2 (re-pin + two cosmetic repairs — no re-authoring).** The TSPEC moved to **2.0** (the marker's
> release form re-decided on FSPEC BR-14a), so every upstream pin below and in §4.2 T05, §8.3 and §9's
> risk row is re-taken; T05's design is unchanged — both sides are still re-derived at run time and no
> count is transcribed. Plus the two Lows from the v2 reviews: T05's headline label now agrees with its
> own precondition, and §8.1's counting paragraph now agrees with the table above it.

**Upstream versions this PLAN is derived from** (carried in the header so a stale transcription is
detectable by inspection rather than by re-measurement — the defect v1.0 shipped):

| Upstream | Version read | Where |
|---|---|---|
| `REQ-pdlc-consolidation-agent.md` | 2.1 | header table `:18` |
| `FSPEC-pdlc-consolidation-agent.md` | **11.5** | header table `:12`; erratum note `:14-26`; AT-register erratum history `:44-45` |
| `TSPEC-pdlc-consolidation-agent.md` | **2.0** | header table `:12` |
| `DECISIONS-pdlc-consolidation-agent.md` | 1.1 | header table `:12` |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | 1.4 · 2026-08-06 | `:7` |

Every count, register id and "(no FSPEC AT)" claim below was re-measured against those versions on
2026-08-06. Where a count is stated, the command that produced it is stated beside it.

## 1. Overview

Build the consolidation pass specified by `TSPEC-pdlc-consolidation-agent` v2.0: **one new workflow
module** (`pdlc/workflows/consolidate-learnings.js`), the two adapter seams it needs, a **third**
built bundle, and sixteen jest suites that falsify it. Twenty-five of the thirty-four tasks below
touch only files this feature creates; the remaining **nine** edit shipped files (T07, T08, T09, T10,
T11, T12, T13, T32, T33), and each of those is a **single** owning task for the reason TSPEC §13.3
gives — one physical file, one writer.

**The `dist/` vocabulary, stated once and used unchanged everywhere below.** `runtimeBundle.test.js`
keeps bundles and artifacts apart and this PLAN follows it: `BUNDLES` (`:26`) is the `*.bundle.js`
list — two members today, **three** after T32 — and `ARTIFACTS` (`:1584`) is `[...BUNDLES,
"pdlc-cli.mjs"]`. So after T32 `pdlc/workflows/dist/` holds **five files**: three `*.bundle.js`,
`pdlc-cli.mjs`, and `distribution-manifest.json`; the manifest carries **four** artifact rows
(`orchestrate-dev`, `orchestrate-queue`, `consolidate-learnings`, `pdlc-cli`) against three at HEAD.
"Third bundle", "five `dist/` files", "four manifest rows" are the only forms used below.

**What ships**

| Deliverable | Where | TSPEC |
|---|---|---|
| the pass | `pdlc/workflows/consolidate-learnings.js` (new) | §3.1, §4, §7, §9, §10 |
| two new seams + a composition root | `pdlc/workflows/runtime-adapter.js` (`rtEnvPresent`, `rtMakeTempDir`, `rtConsInjections`, `rtWriteFile`'s absolute-path widening) | §5.3, §5.6(a) |
| the resolver widening | `pdlc/workflows/orchestrate-dev.js` (`resolveAdvisoryRung`'s optional `skill`, `gitWithLockRetry` exported, two `mergeCommandFor` surfaces) | §8.1, §4.2, §9.2 |
| a third bundle | `pdlc/workflows/build-runtime.mjs` → `dist/consolidate-learnings.bundle.js` + a `distribution-manifest.json` row (fourth) | §8.2, §8.3 |
| the hook's observation channel | `pdlc/hooks/scripts/nudge-consolidation.sh` (`CORPUS_GLOBS`, the two-region predicate, the `pending` fall-through, the env-gated `PDLC_PENDING:` stderr line) | §3.2, §7.1, §13.1 row 12 |
| the ignore rule | `.gitignore` (`docs/_decisions/.consolidation-lock`, comment line adjacent) | §3.3 |
| two prompt contracts | `pdlc/skills/consolidate-learnings/SKILL.md`, `pdlc/skills/harvest-learnings/SKILL.md` | §3.2 |
| sixteen suites + one doubles module | `pdlc/workflows/__tests__/consolidation*.test.js`, `__tests__/helpers/consolidationDoubles.js` | §11, §12.3 |

**Verified against HEAD before this PLAN was written.** Every file in the table above either exists
today (confirmed by `ls`) or is declared new by the task that creates it, and the §5 manifest marks
which is which. The four reused symbols TSPEC §4.2 names are present at HEAD:
`resolveAdvisoryRung` (`pdlc/workflows/orchestrate-dev.js:1833`, already `export`ed),
`MERGE_GUARD_DEFAULTS` (`:48`), `mergeCommandFor` (`:319`, already `export`ed) and
`gitWithLockRetry` (`:8617`, **not** exported today — T11 exports it). `ADVISORY_RUNG_SKILL` is at
`:1797`. On the adapter side `rtShellQuote` is at `runtime-adapter.js:668`, `rtWriteFile` at `:802`,
`rtCheckFile` at `:817`, `rtAppendFile` at `:863`, `rtListFiles` at `:905`, `rtGit` at `:945` and
`rtDevInjections` at `:1086` — the placements TSPEC §5.2 and §13.1 row 13 cite. In
`build-runtime.mjs`, `stripModuleSyntax` is at `:45`, `wrapModule` at `:55`, `QUEUE_META` at `:127`,
`QUEUE_ENTRY` at `:185` and the `bundles` array at `:448`, so T32's edit lands beside existing
declarations rather than inventing machinery.

**Two coverage claims checked against the current suite layout, not assumed — each with the command
that measured it, so the next reader re-runs rather than re-derives.**
(a) `git ls-files 'pdlc/workflows/__tests__/*.test.js' | wc -l` returns **83** at HEAD (83 on disk
too — nothing untracked in that directory), and `ls pdlc/workflows/__tests__/ | grep -c
'^consolidation'` returns **0**. The load-bearing half is the zero: all sixteen suites in §4 are new
files with no merge hazard against a shipped suite. (b) The two static-scan sets this feature must widen exist where TSPEC §11.3(c) says:
`AT19_SEAM_NAMES` is declared at `__tests__/runtimeBundle.test.js:215` and consumed at `:427`, and
`AWAIT_SCAN_SOURCES` at `:1040` (`["orchestrate-dev.js", "orchestrate-queue.js"]`) and consumed at
`:1054` — neither carries `consolidate-learnings.js`, `_envPresent` or `_makeTempDir` today, which is
exactly the gap T13 closes.

**One coverage claim checked and found *false*, raised upstream, and since repaired upstream.**
When v1.0 was written, TSPEC §3.2 made two `SKILL.md` files production edits and §12.2/§12.3 assigned
them no falsifying test; the nearest shipped candidate does not reach them either, since
`__tests__/skillFiles.test.js` ranges over a hard-coded three-member list — `se-review`, `te-review`,
`pm-review` (`:13-17`) — and asserts only their VERDICT-trailer text. §9.1 raised it as erratum 1, and
it **landed at TSPEC v1.8**: §12.2 now assigns the two-`SKILL.md` four-verbatim-conjunct source-text
case (`TSPEC:166-167`, `:2449-2450`), which T03 authors as two blocks and T07 and T08 each un-skip.
The same is true of `CLAUDE.md` (erratum 3, landed at TSPEC v2.0, `TSPEC:169`), un-skipped by T33. So
none of the three is review-only any more: each carries a machine-checked source-text case **and** a
reviewer read of the semantics against the FSPEC, and §8.3 lists the two obligations separately.

## 2. Ground rules — status key, RED discipline, batch derivation

**Status key.** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

**The `Status` column is a Phase-P baseline, not a live ledger — nobody owns it during Phase I.**
It is authored once, uniformly `⬚`, and it is never reconciled against the tree afterwards. Landed
state is read from git and from the wave ledger, never from this table. This is a rule and not a
description of neglect, for two measured reasons. (i) **No runtime reads it.** `parsePlanTasks`
(`pdlc/workflows/orchestrate-dev.js:3761`) consumes only the id cell, the `Deps` cell and the batch
cell — the id and deps headers are matched exactly against `PLAN_ID_HEADER_CELLS` /
`PLAN_DEPS_HEADER_CELLS` (`:3797-3798`) while the description and batch columns are explicitly
"LOOSE … cosmetic" (`:3764`); no parser, gate or dispatcher reads a `Status` cell at all. (ii)
**Something else already owns resume.** Phase I resumes from the wave ledger at `WAVE_STATE_PATH`
= `.claude/pdlc-wave-state.json` (`:8860`), parsed by `parseWaveLedger` (`:8916`) — a file the waves
write, against a table they do not. A hand-maintained second ledger could only ever disagree with
the first, and a *selectively* maintained one is worse than a blank one: a uniformly `⬚` column
honestly reports "no ledger is kept here", whereas a column with some rows filled invites the reader
to conclude the unfilled rows are untouched. That is the failure mode this rule closes. Editing a
`Status` cell mid-flight is therefore **out of band** and is to be reverted, not extended — the
question "is T*n* landed?" is answered by `git cat-file -e HEAD:{path}` and the ledger, both of which
are current by construction.

**Batch derivation is mechanical.** `Batch == max(batch of Deps) + 1`; a task with no `Deps` is
batch 1. The dispatcher validates the column against the `Deps` edges and halts on a mismatch, so
the number is a contract, not a lane label. Every number in §4 was re-derived from the row's own
`Deps` cell after the table was written.

**Single-writer-per-batch, source and test alike.** No two tasks carrying the same `Batch` number
create or append to the same physical file. Where a file has several writers — most of all
`pdlc/workflows/consolidate-learnings.js`, which **eight** tasks write (T02, then T25 … T31) — they are serialised by real
`Deps` edges, which forces the batch split by the rule above. §5's manifest is what makes the
disjointness mechanically auditable.

**How red is carried without a red wave, and why it has to be.** Phase I's gate is script-owned and
unconditional: after every wave the script runs `.claude/pdlc.config.json` →
`implementation.testCommand` and throws a halt when it does not pass
(`pdlc/workflows/orchestrate-dev.js:10136-10143` — `const gate = await
runCommandFn(implConfig.testCommand); if (!gate || gate.ok !== true) { throw haltError(…) }`; the
V-wave repeats it at `:10225-10234`). `testCommand` is one string covering the whole suite — this
repo's is `cd pdlc/workflows && npm test -- --testPathIgnorePatterns …` — so a wave that ends with
any red test **ends the run**, and a genuinely RED-terminal batch is unavailable here.

The discipline is therefore the one this repo already shipped for the advisory tier
(`docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md:207-216`): a 🔴 task **authors its cases inside
`describe.skip` blocks**, one block per green owner, named for that owner
(`describe.skip("T25 — corpus and predicate", …)`). Skipped cases are *reported as skipped*, not as
passed, so the wave gate stays green and truthful. The 🟢 owner's **first** obligation is to
un-skip its own block, and its **last** is that the block passes. A 🟢 task that un-skips a block it
does not own is a rule violation, because that block's symbols do not exist yet.

Red-before-green is therefore still real and still an explicit edge: **every 🟢 row lists its 🔴 row
in `Deps`**, and the 🔴 row references the same test file and names the ATs it authors. The
falsification is observed at un-skip time — the green owner un-skips before implementing, sees the
block fail, then implements. Where a row owes a stronger demonstration (T23's mutation check) the
row says so.

**`[Fake first]`.** Test-double and skeleton creation precede every production-implementation task
for the same component. T01 (the doubles module) and T02 (the module's export surface, frozen
catalogues and throwing stubs) are batch 1 and are edges of everything downstream, per batch-safety
rule 4.

**Paths are subpackage-qualified.** Every `Test File` / `Source File` / manifest cell is written
from the repository root (`pdlc/workflows/__tests__/consolidationPass.test.js`, never
`consolidationPass.test.js`), so the cells are machine-parseable and no bare basename appears.

**The five `dist/` files are not owned by any task** (§1's vocabulary: three `*.bundle.js`,
`pdlc-cli.mjs`, `distribution-manifest.json`). `pdlc/workflows/dist/` is a per-wave chore
commit driven by `.claude/pdlc.config.json` → `implementation.postWavePathspecs`
(`["pdlc/workflows/dist/"]`, with `postWaveCommand` = `node pdlc/workflows/build-runtime.mjs`), which
is exactly what TSPEC §13.3 asks for. Putting them in a task's `files` cell would double-commit them,
since the wave commit stages `task.files` pathspec-scoped (`orchestrate-dev.js:10151`).

## 3. Pre-flight gate and baseline status

This feature extends a prior-phase baseline: TSPEC §4.2 reuses four `orchestrate-dev.js` symbols
rather than re-authoring them, §11.2 reuses seven shipped test doubles rather than writing new ones,
and §11.3(c) widens two frozen sets that live in a shipped suite. Every one of those is a
**BL-PREREQ**: absent at HEAD, the task that depends on it fails for a reason that looks like its own
bug. **T00 is therefore the first task in the table** and asserts existence only — never the shape a
later task creates.

| BL-PREREQ | Asserted how | Present at HEAD |
|---|---|---|
| `resolveAdvisoryRung`, `mergeCommandFor`, `MERGE_GUARD_DEFAULTS` | imported from `pdlc/workflows/orchestrate-dev.js`; each is already `export`ed | yes — `:1833`, `:319`, `:48` |
| `gitWithLockRetry` | **source-text presence**, not import: it is declared `async function` with no `export` at `:8617`, so T11 must add the keyword before T30 can import it | yes as a declaration, **no** as an export |
| `ADVISORY_RUNG_SKILL` | source-text presence — T11's widening defaults `skill` to it | yes — `:1797` |
| `rtWriteFile`, `rtCheckFile`, `rtAppendFile`, `rtListFiles`, `rtGit`, `rtShellQuote`, `rtDevInjections` | source-text presence in `pdlc/workflows/runtime-adapter.js` (the file is inlined by the build and exports nothing) | yes — `:802`, `:817`, `:863`, `:905`, `:945`, `:668`, `:1086` |
| `stripModuleSyntax`, `wrapModule`, `QUEUE_META`, `QUEUE_ENTRY`, the `bundles` array | source-text presence in `pdlc/workflows/build-runtime.mjs` | yes — `:45`, `:55`, `:127`, `:185`, `:448` |
| `AT19_SEAM_NAMES`, `AWAIT_SCAN_SOURCES` | source-text presence in `pdlc/workflows/__tests__/runtimeBundle.test.js`, **plus** the negative T13 turns positive: neither set carries `consolidate-learnings.js`, `_envPresent` or `_makeTempDir` today | yes — `:215`, `:1040` |
| `fakeFs`, `fakeListFiles`, `fakeGit`, `LIST_FAILURE_VALUES` | imported from `__tests__/helpers/seams.js` | yes — `:243`, `:132`, `:389`, `:58` |
| `fakeGhRun`, `matchKey`, `fakeNow`, `FIXED_NOW_MS`, `fakeSleep`, `GH_SURFACE_NAMES` | imported from `__tests__/helpers/mergeDoubles.js` | yes — `:75`, `:45`, `:259`, `:256`, `:258`, `:181` (six names, six lines, in the order the names are listed, so the row is checkable member-by-member) |
| `makeAgentDouble` | imported from `__tests__/helpers/advisoryDoubles.js` | yes — `:53` |
| `seeded`, `resolveSeed` | imported from `__tests__/helpers/driftGenerators.js` | yes — `:76`, `:134` |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` `Version` cell reads `1.4` | file read, cell matched | yes — `:7` (`1.4 · 2026-08-06`) |

**One BL-PREREQ is already known-absent, and that is the point of asserting it.** `gitWithLockRetry`
is not exported. T30 imports it (TSPEC §4.2), so T11 adds `export` to the declaration at
`orchestrate-dev.js:8617`. T00 records the absence as **blocking work already scheduled** rather
than promoting it — the promotion rule applies to a symbol nothing in this PLAN repairs.

**The gate branches on `.claude/pdlc.config.json` and asserts a positive in each branch.**
`git ls-files .claude` returns nothing at HEAD: the file is **untracked**, so CI's fresh clone does
not have it while the maintainer's tree does. An unguarded read would go red on
`.github/workflows/pr-tests.yml`'s matrix and halt Phase PUB for a reason unrelated to the diff. So
T00 asserts: (i) file present ⇒ `implementation.postWavePathspecs` contains
`pdlc/workflows/dist/` and `implementation.postWaveCommand` is `node pdlc/workflows/build-runtime.mjs`
— the two settings §2's dist rule depends on; (ii) file absent ⇒ the documented degradation, i.e.
Phase I falls back to the legacy self-report gate, asserted through the shipped parser rather than
skipped. Neither branch is vacuous and neither depends on the operator's tracking decision.

**The gate asserts existence, never shape.** It does not assert that `resolveAdvisoryRung` accepts a
`skill` parameter (T11 creates that), that `rtConsInjections` exists (T12 creates it), or that the
scan sets carry the new members (T13 adds them). A pre-flight that asserted the post-condition of a
task in its own PLAN would be red on a correct tree until that task landed.

## 4. Batches — task table

The `Batch` column **is** the decomposition: batch *N* is the set of rows carrying *N*. `Test File`
and `Source File` name what the task drives and what it changes; a row that creates a file says
**(new)** the first time that file appears, so "confirm it exists or declare it new" is answerable
from the table alone. Every file not marked **(new)** was confirmed present at HEAD (§1, §3).

### 4.1 Batches 1–3

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T00 | **Pre-flight gate.** Assert every §3 BL-PREREQ exists at HEAD — exported symbols by import, `gitWithLockRetry` / the seven `runtime-adapter.js` functions / the five `build-runtime.mjs` declarations / the two scan sets by source-text presence, the vocabularies `Version` cell by read. Existence only, never the shape a later task creates. Branch on `.claude/pdlc.config.json` presence with a positive assertion in **both** arms (§3). Record `gitWithLockRetry`'s missing `export` as scheduled-blocking (T11), not as promoted work. | `pdlc/workflows/__tests__/consolidationPreflight.test.js` **(new)** | — | 1 | — | ⬚ |
| T01 | **[Fake first] The doubles module.** Create the one canonical double module for this feature (TSPEC §3.1, §11.2): the two **new** factories `fakeEnvPresent(presentNames)` and `fakeMakeTempDir(path)` (a path, or `null`) (their seams do not exist yet); the `asAsync(fn)` wrapper, whose deferral **must** be a macrotask (`setTimeout(…, 0)`) and which defers **recording as well as resolution** — TSPEC §11.2's table is only discriminating in that form; re-exports (never re-declarations) of `fakeFs`, `fakeListFiles`, `fakeGit`, `fakeGhRun`, `matchKey`, `makeAgentDouble`, `fakeNow`, `FIXED_NOW_MS`, `fakeSleep`, `seeded`, `resolveSeed`; the fixture builders (log builder, corpus builder, `ESCALATIONS.md` builder) so no suite concatenates a log by hand; and the literal transcription of `pdlc-consolidation-vocabularies.md` §1 at `Version` 1.4 that §11.3(b) compares three ways. The builder's **header states the rule**, not only this PLAN: no fixture may depend on git visibility (an ignored file, a staged-but-deleted file), because `classifyCorpus` is driven directly and such a fixture would read as coverage of the enumeration half. Excluded from jest by the shipped `testPathIgnorePatterns` (`pdlc/workflows/package.json:18`, whose three members run `:19-21` and whose array closes at `:22`). Batch-safety rule 4: one owning task in the first working batch, downstream edges from every consumer. | — (helper module) | `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` **(new)** | 2 | T00 | ⬚ |
| T02 | **[Fake first] Module skeleton.** Create the pass module with its **export surface only**: `export default async function main({…seams})` carrying every defaulted injection parameter of TSPEC §5.1 and §5.5 (`_ghRun`, `_envPresent`, `_makeTempDir` default to `null`; `_now` is a module-level `Date.now` default and **not** a seam; `defaultCheckFile` **throws** on I/O failure and never returns a `CheckReply`, per §5.5); §6.4's frozen catalogues (`TERMINAL_STATUSES`, `REASON_CODES`, `TRIGGERS`, `ROUTES`, `ACTIONS`, `VERDICTS`, `PROMO_STATES`, `CREDENTIAL_VALUES`, `PHASE_CATALOGUE`, `REASON_CODE_STATUSES`) as `Object.freeze([…])`; `UNAVAILABLE = "(unavailable)"` (§6.5); §6's JSDoc `@typedef`s; and one throwing stub per §7/§9 export so every downstream suite can import the name it will drive. No behaviour. | — | `pdlc/workflows/consolidate-learnings.js` **(new)** | 2 | T00 | ⬚ |
| T03 | 🔴 **RED (`describe.skip`, one block per green owner) — build and source text.** Seven blocks: `T10 — gitignore text` (§3.3: the comment line and `docs/_decisions/.consolidation-lock` **verbatim and adjacent** in the tracked `.gitignore`, in the shape `runtimeBundle.test.js` already uses for source-text reads); `T12 — adapter prompt` (§11.3(e): the widened absolute-path clause verbatim inside `rtWriteFile`, **and** `"relative to the repository root"` occurring in `runtime-adapter.js` **exactly once** — no assertion over `rtReadFile`, which carries no such clause and gains none); `T12 — rtConsInjections` (§12.2: the key set of `rtConsInjections()` **set-equal** to §5.1's seam names minus `_now` — equality, never containment, because containment is the assertion that still passes with `_checkFile` missing, which is the failure `adapterProbe.test.js:253-258` shapes but does not reach); `T32 — bundle` (T-02: `build-runtime.mjs --check` clean, the manifest row stamped, no `import(` in the emitted bundle, `meta` first and literal); `T07 — skill prompt` and `T08 — skill prompt` (TSPEC §12.2's two-`SKILL.md` four-verbatim-conjunct source-text case, **written as two blocks, one per green owner, two conjuncts each**: the block/legacy predicate sentence and the `{topic} = failure-mode-id` route in `consolidate-learnings/SKILL.md` in the first, the `Phases exercised` row and the verbatim-copy `failure-mode-id` line in `harvest-learnings/SKILL.md` in the second, each asserted verbatim in the shape the other source-text blocks use. One block carrying all four conjuncts would have two green owners and could not be half-un-skipped: a `describe.skip(` token is removed or it is not, so the first owner to run would either red the other's not-yet-landed conjuncts or leave its own case skipped); `T33 — CLAUDE.md ↔ manifest` (TSPEC §12.2's set-equality case: the artifact paths `CLAUDE.md` enumerates **minus the manifest itself**, set-equal in both directions to the manifest's `rows[]` `pluginPath`s read repo-relative, plus the `BUNDLES` axis — never containment). | `pdlc/workflows/__tests__/consolidationBuild.test.js` **(new)** | — | 2 | T00 | ⬚ |
| T04 | 🔴 **RED (`describe.skip`) — hook parity.** Three blocks. `T09 — CORPUS_GLOBS and the no-regression pair` (**L3 + L4**, §7.1 pin (b)): (i) the hook's `CORPUS_GLOBS` declaration, located **by name and never by line index**, carries exactly two glob-pattern literals and no third, with the conjunct that `glob.glob(` occurs once and inside the comprehension over it; (ii) the **no-regression pair**, which replaces the byte-identity claim v1.0 carried — that claim was absence-only and passed vacuously on this repo, where HEAD's pending count is 1 of 2 and the widened count 3 of 5, both below `THRESHOLD = 5` (`:25`, `:43`), so both sides print the empty string and identity holds for the wrong reason. Two fixture corpora, each built in a temp directory and reached through `CLAUDE_PROJECT_DIR`, each run against **HEAD's hook** (a `git show HEAD:pdlc/hooks/scripts/nudge-consolidation.sh` copy written into the temp tree) and against the edited hook: **(a) the positive-identity fixture** — ≥ 5 pending under `docs/*/` alone, none under `docs/completed/*/`, on which the emitted `additionalContext` **text** is compared byte-for-byte between the two hooks and additionally equals the message transcribed literally from the shipped template (`:44-46`) at that `n`, so the row cannot pass on two empty strings; **(b) the divergence fixture** — pending members under `docs/completed/*/` that only the widened `CORPUS_GLOBS` reaches, crossing the threshold, on which the two hooks' outputs must **differ** and the edited hook's output equals the transcribed message at the **new** `n`, never "whatever HEAD printed". (a) and (b) sit in the same block so neither arm can pass vacuously: an implementation that widened nothing fails (b), and one that broke the message fails (a). Both rows are `PY_BIN`-gated and counted exactly like the AT-P7 rows below. `T25 — AT-P7` (**L4**): the differential harness of §11.3(f) — one fixture corpus in a temp directory, the hook pointed at it through `CLAUDE_PROJECT_DIR`, the JS through `classifyCorpus` over the same basenames and log text; **three conjuncts per row** (JS ≡ hook, both directions, **and** each ≡ the literally transcribed expected set, without which two implementations returning `∅` agree perfectly); rows for the truncated block (E-04), the stray closer (E-05), the basename collision (E-09), the legacy/block boundary, one row above `THRESHOLD = 5` so the shipped `additionalContext` count is compared, and a zero-corpus row asserting `PDLC_PENDING:` is emitted with an empty value. `T25 — pathspec semantics` (**L4**, no FSPEC AT): pin (a)'s exact argv through a real `git` in a temp repository the case builds itself (`git init`, three LEARNINGS under `docs/{f}/`, `docs/completed/{f}/`, `docs/discarded/{f}/`, `git add -A`), reached with `_git`'s own `["-C", dir, …]` form — zero results under `docs/discarded/`, at least one under `docs/completed/`; it pins the `:(glob)` half only, **not** `--exclude-standard`, which is inert under `--cached` and is the sub-question §9 hands upstream. The `PY_BIN` probe (`pdlc/hooks/scripts/nudge-consolidation.sh:13-20`) runs **once at module scope**; finding no interpreter declares every differential row `test.skip` and emits a `console.warn` naming `python3`, `python`, `py` — there is no degraded path on which a subset still runs. The executed-row counter is incremented by each row **as its last statement** and read by its **own unconditional top-level `test()` declared last in the file — never an `afterAll`**, which jest does not run when every test in a block is skipped; the assertion is that `executed` equals either `TABLE.length` or `0`. The pathspec case is **outside** the fixture table and outside that counter. | `pdlc/workflows/__tests__/consolidationHookParity.test.js` **(new)** | — | 2 | T00 | ⬚ |
| T05 | 🟢 **Traceability set-equality (no skip; green once §9.1 erratum 4 lands — landed at TSPEC v2.0).** L3: parse the FSPEC's AT register and TSPEC §12.3's own table and assert **set equality in both directions** — every register id has exactly one file, no file claims an id the register does not carry. Ids are extracted by matching the `AT-…` token grammar over the whole cell and **de-duplicated**, so `(no FSPEC AT)` prose contributes nothing unless it names an id and the report row's deliberate citation of AT-L5 is idempotent. The parser takes an injected `root` (DC-04) and consults no ambient state. **The count is read, never hard-coded.** The oracle is the set equality itself; beside it sit two conjuncts that make a failure legible instead of merely red: (i) a **version pin** — FSPEC's `Version` cell reads `11.5` and TSPEC's reads `2.0`, in the shape T24 pins the vocabularies cell at `1.4`, so a later erratum round fails as *"the register moved"* rather than as *"the code is wrong"*; (ii) a **non-vacuity floor** — the parsed register is non-empty and its size is reported in the failure message, so two empty parses cannot agree perfectly. Measurement of record, 2026-08-06: enumerating `AT-…` tokens over FSPEC §13's register range (`:2089-2239`) de-duplicated gives **99** ids at FSPEC v11.5, against v1.0's transcribed 96 at FSPEC v11.1. **Precondition, stated because it is the one thing that could halt a wave — and it is now met:** §9.1 erratum 4 has **landed**; TSPEC §12.3 assigns all three of `AT-M11`, `AT-Q13`, `AT-R7` and its table is at 99 at TSPEC v2.0, so the case is green the moment it is written. The erratum channel repairs upstream documents **after Phase P converges and before Phase I dispatches**, which is the ordinary path this row now sits on. If a wave nonetheless reaches T05 with §12.3 short of the register, the task **halts and reports the missing ids** — it does not weaken the oracle to containment, which is the assertion that would still pass with the ids missing. This row needs no module symbol, and it guards the table from batch 2 onward. | `pdlc/workflows/__tests__/consolidationTraceability.test.js` **(new)** | — | 2 | T00 | ⬚ |
| T06 | 🔴 **RED (`describe.skip`) — rung reuse.** Two blocks. `T11 — AT-M10`: the shipped `resolveAdvisoryRung` call site is unchanged by the widening — the default `skill` is `ADVISORY_RUNG_SKILL` on **every** path, memoised and two-rung alike, asserted beside the existing `advisoryRung.test.js` expectations rather than by copying them. `T31 — AT-M7/AT-M8`: the `_log` tee of §8.4 captures the resolver's `ADVISORY_MODEL_FALLBACK:` line **verbatim** while still forwarding to the caller's sink (nothing swallowed), and the unresolved-model error message reaches the report verbatim. | `pdlc/workflows/__tests__/consolidationRung.test.js` **(new)** | — | 2 | T00 | ⬚ |
| T07 | **[Docs] `consolidate-learnings` prompt.** `:56` (was the `Date Completed` date boundary) now carries the block/legacy predicate (FSPEC §3.2); `:62`'s `DECISIONS-{topic}.md` route gains `{topic} = failure-mode-id` (FSPEC §5.2). Both anchors are re-measured at HEAD by `consolidationSkillAnchors.test.js`, not asserted by hand. **Un-skips T03's `T07 — skill prompt` block** — its own block, not half of a shared one: since TSPEC v1.8, §12.2/§12.3 assign both `SKILL.md` edits the four-verbatim-conjunct source-text case in `consolidationBuild.test.js` (§9.1 erratum 1, landed), and T03 authors it as one block per green owner. This task therefore **owns `consolidationBuild.test.js` for its wave** (§5), which is what commits the un-skip; `Deps: T12` places it after the file's earlier writers (T03 → T10 → T12) rather than beside T10 in batch 3, per §2's single-writer-per-batch rule. The reviewer read against FSPEC §3.2 and §5.2 is the semantic half of this row's Definition of Done, **in addition to** the executable block. | `pdlc/workflows/__tests__/consolidationBuild.test.js` | `pdlc/skills/consolidate-learnings/SKILL.md` | 5 | T12 | ⬚ |
| T08 | **[Docs] `harvest-learnings` prompt.** A `Phases exercised` row in the metadata table, placed after the `Harvested from` row (confirmed at `:77` at HEAD, inside the `:70-79` table); a `failure-mode-id` line in the §5 Open Items convention, stated as a **verbatim copy from the handed open-promotion list** (FSPEC §8.3, §8.4). Additive only: `LEARNINGS_SECTIONS` and the `Harvested from` completeness row are untouched, so `isComplete`'s LEARNINGS criterion is unaffected. **Un-skips T03's `T08 — skill prompt` block** — its own block, and it owns `consolidationBuild.test.js` for its wave (§5) so the un-skip is committed. `Deps: T07` is the serialising edge: T07 writes the same file one batch earlier, and two same-batch writers of one file is exactly what `computeWaves` partitions to prevent. Same reviewer read as T07 (against FSPEC §8.3 and §8.4), in addition to the executable block. | `pdlc/workflows/__tests__/consolidationBuild.test.js` | `pdlc/skills/harvest-learnings/SKILL.md` | 6 | T07 | ⬚ |
| T09 | 🟢 **Hook edits — four, in one shipped file.** (1) `:28`'s single `os.path.join` glob becomes a named two-literal `CORPUS_GLOBS` tuple plus a comprehension over it, widening the corpus to `docs/completed/*/` and giving §7.1 pin (b) a declaration to read; (2) `:41`'s substring predicate scoped to the two §3.2 regions; (3) `:29-30`'s early `sys.exit(0)` replaced by a `pending = []` fall-through so the zero-corpus row still emits; (4) an **env-gated** debug line emitting the pending **set** on stderr as `PDLC_PENDING:`, without which AT-P7 has no oracle — the shipped message is a count and only above `THRESHOLD = 5` (`:25`, `:43`), blind on every discriminating fixture. All four are production edits to one file ⇒ one owning task. Un-skips T04's `T09 — CORPUS_GLOBS and the no-regression pair` block only — including the two no-regression rows, which need no JS side; AT-P7 stays skipped until T25 supplies it. The script must still `bash -n` clean and keep its advisory-only role (`:47-48` print `additionalContext` and exit 0). | `pdlc/workflows/__tests__/consolidationHookParity.test.js` | `pdlc/hooks/scripts/nudge-consolidation.sh` | 3 | T04 | ⬚ |
| T10 | 🟢 **The ignore rule.** Append the comment line `# pdlc consolidation in-progress marker — working tree only (AC-1.3)` and, adjacent to it, the single pattern `docs/_decisions/.consolidation-lock`. Repository-root-relative, **containing a separator**, written without a leading slash and without `**/` — per gitignore(5) such a pattern is already anchored to its own `.gitignore`'s directory, which the shipped `/.claude/workflows/` entry documents at length in the file's last comment block. A slash-free or `**/`-prefixed form would match at every depth. Un-skips T03's `T10 — gitignore text` block. | `pdlc/workflows/__tests__/consolidationBuild.test.js` | `.gitignore` | 3 | T03 | ⬚ |
| T11 | 🟢 **`orchestrate-dev.js` — the three writers, serialised into one task** (TSPEC §13.3): (a) `resolveAdvisoryRung` (`:1833`) gains an optional `skill` parameter defaulting to `ADVISORY_RUNG_SKILL` (`:1797`), threaded to `dispatchAt`'s `_agent` call and therefore to both the memoised and the two-rung paths; (b) `gitWithLockRetry` (`:8617`) gains the `export` keyword — a declaration-only change, no body edit, so `commitPaths` (`:8669`) and its two existing call sites (`:8670`, `:8690`) are untouched; (c) `mergeCommandFor`'s `switch` (`:319`) gains the two `gh` surfaces §9.2 needs, rather than a second command builder — two builders in one bundle would falsify the audit property the shipped comment at `:273` claims. Un-skips T06's `T11 — AT-M10` block. `commitPaths` is **not** reused by the pass: its commit is a plain `git commit -m` with no pathspec (`:8690`), which FSPEC §5.4 forbids here. | `pdlc/workflows/__tests__/consolidationRung.test.js` | `pdlc/workflows/orchestrate-dev.js` | 3 | T06 | ⬚ |
| T13 | 🟢 **Widen the two static-scan axes, in one shipped suite** (TSPEC §13.3(ii), §11.3(c)). `AWAIT_SCAN_SOURCES` (`:1040`) gains `"consolidate-learnings.js"`; `AT19_SEAM_NAMES` (`:215`) gains `_envPresent` and `_makeTempDir`. **Both, in the same commit**: widening only the source set leaves the scan green on exactly the seams this feature invents, and `RLH-SCAN-01` (`:626`) would report green over them. **Read the tree before assuming either half is outstanding, and assert both regardless.** Per §2 the `⬚` on this row is a Phase-P baseline and says nothing about HEAD; re-measured at HEAD both halves are in fact already present — `runtimeBundle.test.js:230` carries `"_envPresent", "_makeTempDir"` and `:1057` reads `AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js", "consolidate-learnings.js"]`, both confirmed through `git show HEAD:` rather than from the working tree. The implementer's job on this row is then to **assert** both axes, not to re-add them: a task that finds one half done and quietly drops the pairing is how the half-widened state — the exact state this row exists to prevent — becomes permanent. `_now` is deliberately **not** added — it is sync by contract and awaiting a number is noise. The scan passes immediately (T02's skeleton makes no seam call) and is the standing guard for every module task from batch 4 on, which is why it lands before the first behaviour. | `pdlc/workflows/__tests__/runtimeBundle.test.js` | `pdlc/workflows/__tests__/runtimeBundle.test.js` | 3 | T02 | ⬚ |
| T14 | 🔴 **RED (`describe.skip`) — the predicate suite (L1).** Block `T25 — corpus and predicate`: AT-P1 (**both** conjuncts — the first *is* §7.1's pin (a), the literal element-by-element assertion of the argv handed `_git`, both `:(glob)` prefixes included, so the `docs/discarded/` exclusion is decided by the pathspec and not by a fixture; the second is the positive membership case), AT-P2, AT-P3, AT-P4, AT-P5, AT-P6, AT-P8, AT-P9, AT-P10, AT-P11. §7.1 states why "a discarded line is filtered out" is deliberately not asserted. | `pdlc/workflows/__tests__/consolidationPredicate.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T15 | 🔴 **RED (`describe.skip`) — identity (L1).** Block `T26 — identity and merge`: AT-R6, AT-R6b, AT-F1, AT-F2, AT-F3, AT-F4, AT-F5 over `failureModeId`, `targetFor` and `mergeProposals`. Reserves the seats FSPEC §14.5's LD-2 (the `target`-follows clause) and LD-3 (two actions, one subject) land in — PROPERTIES owns their fixtures, this file owns their home (TSPEC §11.5). | `pdlc/workflows/__tests__/consolidationIdentity.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T16 | 🔴 **RED (`describe.skip`) — the record reader (L1).** Block `T26 — parseLogRecords`: AT-F19, AT-F20, AT-F21. The writer emits all eight fields on every kind and on the `degraded` route (AT-F20); the reader is **total over any subset**, yielding a partial record plus the notice list and never a filled default. Reserves LD-1, LD-4 and LD-5's seats (TSPEC §11.5). | `pdlc/workflows/__tests__/consolidationParse.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T17 | 🔴 **RED (`describe.skip`) — effectiveness (L1).** Block `T27 — effectiveness and remediation`: AT-F6 … AT-F18 over `phasesExercised`, `effectivenessTable`, `openPromotionList` and `remediationChoice`. A row with no `artifact` renders `(unavailable)` — never blank, never a guessed path — and a `null` `remediation` means the field is **absent**, not empty. | `pdlc/workflows/__tests__/consolidationEffectiveness.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T18 | 🔴 **RED (`describe.skip`) — the advisory corpus (L1).** Block `T27 — escalations`: AT-A1 … AT-A7 over `parseEscalations` (table rows, **never** the heading) and `seamCandidates`. Standing caution, from TSPEC §11.5: no fixture may be written against REQ AC-6.3's "across the consumed window" wording — FSPEC §9.5 / BR-37a is the settled contract, `seamCandidates` ranges over **every** entry, and a REQ-derived fixture would red a conforming implementation. | `pdlc/workflows/__tests__/consolidationAdvisory.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T19 | 🔴 **RED (`describe.skip`) — properties (L5).** Six blocks, one per green owner, all drawn from `driftGenerators.js`'s seeded xorshift32 — **no property-testing dependency is added**. `T25`: the two-region predicate (totality; every enumerated file in exactly one set) and the config parse (uncorrupted keys keep their value, corrupted keys take their default, `invalidKeys` set-equal to the corrupted subset). `T26`: `passId` (strictly greater than every parseable `{today}` id; unparseable rows change nothing; invariant under row permutation) and `mergeProposals` — whose shared id is **derived** by calling `failureModeId(phase, artifact)` on one drawn pair, never assigned independently, because an assigned triple is an input no pass constructs — with the **positive conjunct** that one ordering's folded `kind`/`artifact`/`target`/`elidedKinds`/`elidedArtifacts` equal values transcribed literally from §7.4's fold table. `T27`: the escalation count (attributed total equals the entries carrying both rows; nothing attributed to an absent key) and `effectivenessTable` (order-invariant, **and** row count equals distinct ids, **and** each row's verdict equals the arm §7.5 assigns). Order-invariance alone is satisfied by a constant function, so each determinism property carries its positive conjunct. | `pdlc/workflows/__tests__/consolidationProperties.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T20 | 🔴 **RED (`describe.skip`) — the pass, end to end (L2).** Two blocks. `T28 — marker predicates`: `parseMarker` and `markerVerdict` driven **directly** on literal inputs (pure, no `main`) — including **AT-M11's pure half**: `markerVerdict` returns `free` for a `RELEASED: {passId} {ISO-8601}` marker in **both** of AT-M11's fixtures (`FSPEC:2133`), one written seconds ago and one older than `staleLockMinutes`, the older one being what stops an implementation routing every non-`IN-PROGRESS:` file through the `reclaim` arm. `T31 — pass lifecycle`: AT-C1, AT-C1b, AT-C2 … AT-C8, AT-M1 … AT-M6, AT-M6b, AT-M9, **AT-M11** through `main()` with every seam doubled; plus the **(no FSPEC AT)** obligation TSPEC §12.2 records — (i) below, the only remaining unregistered obligation in this row now that AT-M11 is assigned and (ii) is AT-M3's own fixture (a). **AT-M11's pass-level half** also sits in this block, beside AT-M3, which is the pairing that makes it an oracle rather than a second happy path: on both released-marker fixtures the marker is taken, the pass proceeds, and the log row carries **no** `reclaimed-stale-lock` and **no** `consolidation-in-progress` — against AT-M3's two fixtures in the same block — the empty one and the neither-verb one — which *do* record `reclaimed-stale-lock`. Without that pair an implementation recording `reclaimed-stale-lock` on every take passes AT-M3 (`FSPEC:2132`, whose row sits immediately above AT-M11 at `:2133`). Both AT-M11 halves live in this one file, so T05's "exactly one file per register id" is undisturbed. The two obligations: (i) The unreadable-corpus-entry case: **one fixture carrying both an unreadable and a readable member**, asserting that the **un-consolidated count** counts **both**, that `renderConsumedPair`'s output contains **both** basenames, and that the report body names the unreadable basename and **not** the readable one — the readable member is the control that stops (1) and (3) passing on a fixture where nothing was readable. (ii) **AT-M3's fixture (a), the empty marker, written inside the AT-M3 case** beside AT-M11, because the pairing *is* the oracle: a `""` marker asserts a normal terminal status **and** `reclaimed-stale-lock` recorded with the abandoned id `unknown` (E-11), against AT-M11's `RELEASED:` fixtures in the same block, which record neither reason code at either age (E-11b). `fakeFs` supports it unchanged — a value trimming to `""` returns `{ok:false, reason:"file_empty"}` (`__tests__/helpers/seams.js:296-299`) while `_readFile` returns `""`, which is exactly the present-but-unparseable state TSPEC §7.3 routes to `reclaim`. **AT-M3's full *Given* is written**, both arms: FSPEC BR-14a releases by writing a `RELEASED:` sentinel rather than truncating, so the truncated arm is reachable (E-11) and nothing here is red on correct code. Note that this obligation is no longer unregistered — it is AT-M3's own fixture (a) — so the only remaining `(no FSPEC AT)` obligation in this row is (i). | `pdlc/workflows/__tests__/consolidationPass.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T21 | 🔴 **RED (`describe.skip`) — routing and the PR route (L2).** Three blocks. `T28 — routing predicates`: `routeOf` (over the **imported** `MERGE_GUARD_DEFAULTS`, read and never copied), `routeProposal`, `enactedByLog`, `enactedByPr`, driven directly. `T30 — clone and seams`: AT-Q1, AT-Q7, AT-Q7b, AT-Q7c under §11.3(a)'s spy — a recording wrapper classifying each `_git`/`_ghRun` call with **both of the module's own** classifiers (`resolveSeamDomain`, `resolveSeamVerb`), handed the directory `fakeMakeTempDir` returned; **four** set assertions (partition, containment `observed ⊆ permitted`, obligation `obliged ⊆ observed`, and AT-Q7c's two `∅` equalities), compared over a `Set` and never a multiset. `T31 — routes end to end`: AT-R1 … AT-R5, **AT-R7**, AT-Q2, AT-Q3, AT-Q4, AT-Q5, AT-Q6, AT-Q8, AT-Q9, AT-Q10, AT-Q11, AT-Q12, **AT-Q13**. The last two carry register ids as of FSPEC v11.5 and are **no longer "(no FSPEC AT)"** — `FSPEC:44-45` retired both labels ("AC-3.2's body obligation gains AT-Q13"; "§5.3's 'only when' negative half gains AT-R7"), and FSPEC §15 traces them to AC-3.2 (`:2368`) and AC-1.4 (`:2360`). **AT-Q13** (`FSPEC:2174`) is AC-3.2's three PR-**body** obligations on **both** of the register's fixtures — (a) a promotion derived from two named features, (b) a single-occurrence promotion cleared under AC-2.3's standing-invariant argument — asserting on each that the body names its source LEARNINGS by **feature name, set-equal** to the features the promotion was derived from, carries the targeted failure mode's `symptom` line verbatim, and carries the AC-2.3 evidence in the form that fixture cleared the bar with. Fixture (b) is the arm that stops an unconditional recurrence list; AT-Q2's oracle is the trailer set only, and a body carrying nothing but the three trailers is green under AT-Q2 and red here. Expected values are transcribed **from the fixture LEARNINGS corpus the pass was handed and never read off the produced record** (reading them off the record greens the case even when pass and renderer drop the same field together). **AT-R7** (`FSPEC:2154`) is FSPEC §5.3's "and only when" half over **three** fixtures with `docs/_decisions/` listed before and after each pass: (a) a `promoted` pass with no §5.3 cause and (b) a `no-op` pass whose promotions were all duplicate-suppressed both leave the set of `docs/_decisions/CONSOLIDATION-PROPOSAL-*.md` files **unchanged** — in particular none exists for that `passId` — while (c), the positive control, is a single promotion degraded on an absent credential and yields exactly one, named for that `passId`. (b) sits beside (a) deliberately: the two reach "no cause" by different routes and §5.3 decides both on causes rather than on terminal status. Asserted through the write double's recorded path set. `fakeGhRun` with the suite's own script map — **not** `passingGh`, and `GH_SURFACE_NAMES` does not grow. | `pdlc/workflows/__tests__/consolidationRoute.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T22 | 🔴 **RED (`describe.skip`) — credentials (L2).** Two blocks. `T30 — resolution order`: AT-K1 … AT-K7 over `_envPresent`'s boolean-only contract (fail-closed on **any** unparseable reply, including the empty one — never onto a claimed credential), the `local-gh` probe, and the `absent` fall-through. `T31 — non-disclosure`: no log record, artifact, PR body or report field carries the variable's value on any path, asserted over the accumulated output of every write double in the case. | `pdlc/workflows/__tests__/consolidationCredential.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T23 | 🔴 **RED (`describe.skip`) — lifecycle (L2), two cases, no register id.** Block `T31 — await discipline` (T-13): drive `asAsync(fakeAppendFile)` / `asAsync(fakeWriteFile)` / `asAsync(fakeGit)` and assert **after `main()`'s promise resolves** that (i) the terminal row is present in the log double's accumulated text and (ii) the marker is **released** — the write double's **last** recorded contents for `docs/_decisions/.consolidation-lock` match `RELEASED: {passId} {ISO-8601}` (TSPEC §7.3's sentinel, FSPEC BR-14a), **having been** the `IN-PROGRESS: {passId} …` line earlier in the same recorded history. The take-side precondition is load-bearing: bare absence is equally true of a `refused` fixture. Hygiene, both required of this row: every double is constructed **per case, inside the case body**, and the loop is drained in a **`finally`** (`try { …assertions… } finally { await new Promise((r) => setTimeout(r, 0)); }`) — after the assertions is the one place it cannot run, because on the broken implementation the first assertion throws. Block `T31 — release across the terminal statuses`: one arm per status over a table **keyed on the module's own frozen `TERMINAL_STATUSES`** (a runtime value; §6.1's `TerminalStatus` is a `ts`-fence type with no runtime existence), legitimate only because §11.3(b)'s fourth leg independently pins that catalogue against the authority file — cite that chain in the case. The oracle is **set equality over the catalogue, not containment**: `promoted`, `promoted-degraded`, `no-op`, `failed` ⇒ taken **and** released; `refused` and `skipped-cadence` ⇒ **neither**, which cannot pass vacuously because the four positive arms sit in the same table. The `refused` modelled here is the observed-fresh-marker refusal (AT-M1), **not** §10.3 row 5a's failed-take `refused`, whose observed pair is `{taken: true, released: false}` and which is row 5a's own obligation. | `pdlc/workflows/__tests__/consolidationLifecycle.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |
| T24 | 🔴 **RED (`describe.skip`) — rendering and the report (L1 + L2).** Two blocks. `T29 — renderers`: AT-L1 … AT-L5 and AT-N1 … AT-N4 over the seven render functions, driven directly. AT-L5 carries §11.3(b)'s vocabulary oracle in **four** legs — values observed ≡ the doubles' transcription (both directions), the free-form class excluded **by name** so narrowing cannot silently drop a direction, §6.4's frozen catalogues ⊆/⊇ that transcription, and the fourth leg that reads the **authority file itself**: a three-way set equality against `docs/_constraints/pdlc-consolidation-vocabularies.md` §1's table plus a pin that its `Version` cell still reads `1.4`. Without the fourth leg the first three are two transcriptions compared with each other. The parser takes an injected `root` (DC-04). AT-L5 also carries the **dropped-code** arm: two fixtures over one code, one whose `(status, code)` pair is legal at 1.4 and appears in the row, one whose pair is illegal and is dropped, with the report body's notice naming it — and `no-cadence-datum` as the **control** that must never be dropped, since §1 permits it with `refused` and REQ-CONS-01 decides it before the marker check. `T31 — ER-6 discriminator` (no FSPEC AT): the two-fixture control — a `revise` on a `DOMAIN-CONSTRAINTS.md` target (routed propose-only) against a `branch-exists` degradation — asserting the **sameness** that is the ER-6 loss (`route: "degraded"` in both records, asserted rather than hidden) and the **difference** that stands in for it (the degraded body names a vocabularies §1 reason code, the routed body names none), in both directions. | `pdlc/workflows/__tests__/consolidationReport.test.js` **(new)** | — | 3 | T01, T02 | ⬚ |

### 4.2 Batches 4–12

`pdlc/workflows/consolidate-learnings.js` has **eight** writers in total — T02's skeleton in §4.1 and
the **seven** below (T25 … T31); nothing else writes it, the build only reads it. They are one
physical file, so batch-safety rule 2 forbids two of them sharing a batch; the `Deps` chain
T02 → T25 → T26 → T27 → T28 → T29 → T30 → T31 is what enforces it, and the
`Batch` column is the arithmetic consequence, not a separate decision.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T12 | 🟢 **`runtime-adapter.js` — the four writers, serialised into one task** (TSPEC §13.3(i)). (a) `rtEnvPresent(name)`: transports `[ -n "${<name>:-}" ]`, echoing `PRESENT` on success and `ABSENT` otherwise, returns `true` **iff** the reply is exactly `PRESENT`; any other reply, including an unparseable one, is `false` — fail-closed onto AC-4.3's degradation, never onto a claimed credential. It **never** returns the value, because a value-returning seam puts the secret in the JS process *and* in the agent transcript that transported it, a surface NFR-2 cannot redact. (b) `rtMakeTempDir(passId)`: transports `mktemp -d -t pdlc-consolidation-<passId>`, returns the trimmed reply when it is a single absolute POSIX path and `null` otherwise; the `-t` form is chosen over a hand-built `/tmp/…` literal because `/tmp` is world-writable and a `passId`-derived path is both a symlink-attack surface and a cross-user collision, and `-t` is honoured on both legs of the CI matrix. (c) `rtConsInjections()` beside `rtDevInjections` (`:1086`), handing over **exactly** §5.1's protocol. (d) §5.6(a)'s **one** prompt widening: `rtWriteFile` (`:802-811`) accepts an absolute path; its prompt today says `relative to the repository root` at `:805`, the only occurrence of that string in the file. **`rtReadFile` is not edited** — it reaches disk through `rtReadProbe` (`:369`) and a chunk read, both transporting a shell command under a *cwd* instruction (`:374`), which resolves an absolute path verbatim; there is no clause to widen and an assertion there could only pin text that does not exist. Un-skips T03's `T12 — adapter prompt` and `T12 — rtConsInjections` blocks. | `pdlc/workflows/__tests__/consolidationBuild.test.js` | `pdlc/workflows/runtime-adapter.js` | 4 | T03, T10 | ⬚ |
| T25 | 🟢 **Corpus, predicate, configuration.** `enumerateCorpus` (**one** `_git(["ls-files", "--cached", "--others", "--exclude-standard", "--", ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"])` read — never a directory walk, because `rtListFiles` transports `ls -p -A` piped through `grep -v '/$'` (`:915`) and rejects any line carrying a separator (`:929-931`), so a walk finds zero feature subdirectories in production while `fakeListFiles` hides it in every test), returning `{files}` or `{unlistable: true, detail}` — an in-module control value that is **never rendered** and mints no vocabulary row; `parseCorpusListing`; `classifyCorpus` (the two-region predicate, reporting `basenameCollisions`); `renderConsumedPair`; and `parseConsolidationConfig` (§7.8, per-key independent fallback in `parseAdvisoryConfig`'s shape). Un-skips T14's block, T04's `T25 — AT-P7` and `T25 — pathspec semantics` blocks, and T19's `T25` property blocks. **No consolidation test drives `_listFiles`**: the seam stays in the protocol for completeness, and a test reaching for it re-introduces exactly the hazard this task removes — **a double more capable than the seam it doubles**. `fakeListFiles` returns whatever the fixture hands it, while the shipped `rtListFiles` transports `ls -p -A` piped through `grep -v '/$'` (`runtime-adapter.js:915`) and rejects any line carrying a separator (`:929-931`), so a walk that greens under the double finds **zero** feature subdirectories in production. (No `DC-NN` id is cited: this repo's `docs/_constraints/DOMAIN-CONSTRAINTS.md` DC-07 (`:184`) is an unrelated constraint about work that skips a pipeline phase, and that file's own header caveat (`:11-16`) records the cross-repo `DC-07/08/09` numbering collision. The hazard is stated here rather than referred to.) | `pdlc/workflows/__tests__/consolidationPredicate.test.js`, `pdlc/workflows/__tests__/consolidationHookParity.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | `pdlc/workflows/consolidate-learnings.js` | 4 | T09, T13, T14, T19 | ⬚ |
| T26 | 🟢 **Trigger, identity, merge, the record reader.** `cadenceDatum`, `triggerFor`, `mintPassId` (derived from the log, not from a counter or a clock); `failureModeId`, `targetFor`, `mergeProposals` (§7.4's fold, with `elidedKinds` / `elidedArtifacts` as the compensation the report's item 4 reads); `parseLogRecords`, total over any subset and returning `{records, notices}` — a partial record plus a notice, never a filled default, so the reader's type cannot drift into the writer's. Un-skips T15's and T16's blocks and T19's `T26` property blocks. | `pdlc/workflows/__tests__/consolidationIdentity.test.js`, `pdlc/workflows/__tests__/consolidationParse.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | `pdlc/workflows/consolidate-learnings.js` | 5 | T15, T16, T25 | ⬚ |
| T27 | 🟢 **Effectiveness and the advisory corpus.** `phasesExercised`, `effectivenessTable`, `openPromotionList`, `remediationChoice`; `parseEscalations` (table rows only, never the heading; `corpusState` ∈ `absent`/`empty`/`present`) and `seamCandidates` over **every** entry in `ESCALATIONS.md`. Un-skips T17's and T18's blocks and T19's `T27` property blocks. | `pdlc/workflows/__tests__/consolidationEffectiveness.test.js`, `pdlc/workflows/__tests__/consolidationAdvisory.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | `pdlc/workflows/consolidate-learnings.js` | 6 | T17, T18, T26 | ⬚ |
| T28 | 🟢 **The marker and routing — the pure halves.** `parseMarker` (both one-line verbs — `IN-PROGRESS:` and BR-14a's `RELEASED:` — and `null` for everything else), `markerVerdict` (`free` / `refuse` / `reclaim`; a `RELEASED:` marker is `free` at any age, E-11b, and a present-but-empty one is `reclaim`, E-11), `takeMarker` (observe-then-write: `_checkFile`, `_readFile`, `_writeFile` — **`present` reads `file_missing` alone as absent, `{ok:true}` and `file_empty` alike as present, and is never derived from `_readFile(...) !== null`**, whose single `null` cannot name the reason that decides the arm), `releaseMarker` (an in-place `_writeFile(markerPath, "RELEASED: {passId} {ISO-8601}")` — FSPEC BR-14a's sentinel, TSPEC §7.3; no seam in this protocol removes a file, and truncating would collapse E-11 into E-11b); `routeOf` and `routeProposal` over the **imported** `MERGE_GUARD_DEFAULTS`, `enactedByLog`, `enactedByPr`. `routeOf`'s `"proposal-file"` outcome is an in-module control value that is never rendered; until ER-6 lands the record carries `route: "degraded"`, which fails safe because `enactedByLog` does not enact on a `degraded` record. Un-skips T20's `T28 — marker predicates` and T21's `T28 — routing predicates` blocks. | `pdlc/workflows/__tests__/consolidationPass.test.js`, `pdlc/workflows/__tests__/consolidationRoute.test.js` | `pdlc/workflows/consolidate-learnings.js` | 7 | T20, T21, T27 | ⬚ |
| T29 | 🟢 **Rendering.** `renderFailureModeRecord`, `renderEffectivenessTable`, `renderTerminalRow` (returning `{text, dropped}` — the renderer checks each reason code against `REASON_CODE_STATUSES` and **drops** an illegal one with a notice rather than writing an illegal row, and sorts the `Set` into catalogue declaration order so the row is byte-stable across runs), `renderReportBody`, `renderPrBody`, `renderProposalFile`, `renderPromotionCommitMessage`. `UNAVAILABLE` is a *rendering* of a missing field at display time and is **never written into a failure-mode record** — records are appended as written and never repaired. Un-skips T24's `T29 — renderers` block. | `pdlc/workflows/__tests__/consolidationReport.test.js` | `pdlc/workflows/consolidate-learnings.js` | 8 | T24, T28 | ⬚ |
| T30 | 🟢 **The pull-request route.** `openClone` (cut from `origin`'s URL, never from the working-tree path, which may be mid-pipeline on a `feat-*` branch; `null` from `_makeTempDir` degrades with `api-failure` and the pass **never** falls back to working in the invoking tree, which AC-3.8 forbids outright); the branch/commit/body/PR calls through the two `mergeCommandFor` surfaces T11 added; `resolveSeamDomain` and `resolveSeamVerb`, both **exported** so §11.3(a)'s spy computes neither half itself — which is what puts the `clone` call, carrying no `-C` prefix, in the clone domain by the contract's own rule rather than by a special case in test code; the four §9.3 widenings (`read-auth` on the PR seam; `read-object`, `read-remote`, `read-index` in the invoking tree), **one verb per read**, never folded into an existing verb; `commitConsumingRepoPaths` in `commitQueueRow`'s two-call pathspec-scoped form (`orchestrate-queue.js:1576-1595`, add then commit, sharing its `NOTHING_TO_COMMIT_RE` treatment at `:1554`) over the imported `gitWithLockRetry`, and **never** `commitPaths`. `docs/_decisions/.consolidation-lock` appears in no pathspec of any pass. The credential's value never becomes a JS string: it reaches `gh` by shell expansion inside the transported command and `git` one process lower through a credential helper, because `rtShellQuote` (`runtime-adapter.js:668-670`) single-quotes every `_git` argv element so no `$VAR` in an argv can expand at transport time. Un-skips T21's `T30 — clone and seams` and T22's `T30 — resolution order` blocks. | `pdlc/workflows/__tests__/consolidationRoute.test.js`, `pdlc/workflows/__tests__/consolidationCredential.test.js` | `pdlc/workflows/consolidate-learnings.js` | 9 | T11, T22, T29 | ⬚ |
| T31 | 🟢 **The driver.** `main()` — the **only** impure function — threading one `PassState` through §4.1's sequence; `finishPass` as a single exit, so every terminating branch is `return await finishPass(state, …)` and not an exception, with **every** step and **every** call site `await`ed; `dispatchClustering` through the imported `resolveAdvisoryRung`, called with the new `skill` argument; §8.4's `_log` **tee** — a buffer that forwards to the caller's sink *and* retains the text, so nothing is swallowed and the pass holds what it must render; the §10.3 failure table's degradations; and the four one-record appends of §7.9 (one whole record per `_appendFile` call — the seam appends without read-modify-write, which is what makes the write-granularity rule implementable at all). Un-skips the `T31` blocks in T06, T20, T21, T22, T23 and T24 — six suites, one batch, and the last un-skip in the PLAN. **This row owes the mutation check TSPEC §11.2 states**: delete one `await` inside `finishPass`, observe T23's case RED, restore. A test whose falsifier has never been observed is a claim. | `pdlc/workflows/__tests__/consolidationPass.test.js`, `pdlc/workflows/__tests__/consolidationRoute.test.js`, `pdlc/workflows/__tests__/consolidationCredential.test.js`, `pdlc/workflows/__tests__/consolidationLifecycle.test.js`, `pdlc/workflows/__tests__/consolidationReport.test.js`, `pdlc/workflows/__tests__/consolidationRung.test.js` | `pdlc/workflows/consolidate-learnings.js` | 10 | T12, T23, T30 | ⬚ |
| T32 | 🟢 **The third bundle.** `build-runtime.mjs` gains: `consolidate-learnings.js` read alongside the other two sources (beside `:83-85`); a `CONS_META` / `CONS_ENTRY` pair beside `QUEUE_META` (`:127`) and `QUEUE_ENTRY` (`:185`); one new row in the `bundles` array (`:448-471`); and the four `const X = __dev.X;` prelude lines that re-bind `resolveAdvisoryRung`, `MERGE_GUARD_DEFAULTS`, `mergeCommandFor` and `gitWithLockRetry` inside the consolidation IIFE — the mechanism `queueModule`'s prelude already uses (`:113-123`) — with `devModule`'s export list (`:87-…`) gaining **three** of those four names: `resolveAdvisoryRung` is already published, and already re-bound by the queue prelude at `:119`, so only `MERGE_GUARD_DEFAULTS`, `mergeCommandFor` and `gitWithLockRetry` are new to the list. The bundle **cannot** `import`, which is why inlining is the only option. Then rebuild: `pdlc/workflows/dist/consolidate-learnings.bundle.js` is new and the other **four** `dist/` files — `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`, `distribution-manifest.json` — are re-stamped, **all in this one wave**, because the widened resolver's bytes live in every tracked artifact and a partial rebuild fails CI's sync job. After this task `dist/` holds §1's five files and the manifest four rows. Also widens `runtimeBundle.test.js`'s bundle lists to cover the new artifact — an edit deferred to this batch precisely because asserting a bundle that does not exist would red every earlier wave. Un-skips T03's `T32 — bundle` block. | `pdlc/workflows/__tests__/consolidationBuild.test.js`, `pdlc/workflows/__tests__/runtimeBundle.test.js` | `pdlc/workflows/build-runtime.mjs` | 11 | T03, T31 | ⬚ |
| T33 | **[Docs] Repository documentation and the release commitment.** `CLAUDE.md`: the "Workflow scripts and the runtime build" section lists the tracked, shipped outputs, names only `orchestrate-dev.bundle.js` (`:58`), `orchestrate-queue.bundle.js` (`:59`) and `distribution-manifest.json` (`:60`), and closes "**Those three** are the tracked, shipped outputs" (`:62`) — a sentence that is **already false at HEAD**, because `pdlc/workflows/dist/pdlc-cli.mjs` is tracked (`git ls-files pdlc/workflows/dist/`) and carries a manifest row. So this row repairs a live error and adds the consolidation bundle to it: five tracked files, four manifest rows (§1's vocabulary). **The counts in this row describe the resulting state; they are not text to write.** TSPEC §3.2 (`TSPEC:318`) requires `:62`'s closing sentence to be **rewritten to a count-free form** — "not a `three` → `four` substitution that would be stale again on the next artifact" — and the missing `pdlc-cli.mjs` bullet added. Writing "Those five are the tracked, shipped outputs" is the substitution TSPEC rejects, and **this row's own oracle cannot catch it**: §12.2 asserts the enumerated paths set-equal to `rows[]` and states that "the prose count itself is **not** asserted … precisely so there is no number left for a test to pin" (`TSPEC:2841`). A renumbered sentence therefore ships green and drifts again on the next artifact, which is the whole defect this row exists to end. Also note in the skills table that `/pdlc:consolidate-learnings` now resolves to a **skill and a bundle sharing one name**, the `orchestrate-queue` shape REQ §5 names. `pdlc/RELEASE-CHECKLIST.md`: state that the **first queue invocation after this feature lands is blocked by the drift gate** until `pdlc/hooks/scripts/sync-workflows.sh` runs (TSPEC §8.3, §13.3(iii)) — a new artifact row meeting the shipped `distribution.checkEnabled` gate, owned by no AC because it is a distribution consequence rather than a behaviour. Last in the PLAN because it describes the artifact T32 produces. **Un-skips T03's `T33 — CLAUDE.md ↔ manifest` block** (TSPEC §12.2's set-equality case, §9.1 erratum 3, landed — the case is red at today's HEAD by design and greens on this row's edit). This row therefore also **owns `consolidationBuild.test.js`** (§5): it is alone in the last batch, so no co-batch task's pathspec would carry the un-skip and the edit would be written and never committed — the failure §8.3's zero-`describe.skip` row would report after every wave had run. The block stays `describe.skip`-ed through T32's wave and is un-skipped in this one, in the same wave as the `CLAUDE.md` edit that greens it, so no wave gate ever sees it red: a skipped block does not run, and the manifest gains its **fourth row** (T32, batch 11) — `dist/`'s **fifth tracked file** — one wave before this document records it. The two numbers differ by one because the manifest carries no row for itself: at HEAD `git ls-files pdlc/workflows/dist/` returns four paths while `distribution-manifest.json` carries three rows (`orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`). That is the same five-files/four-rows vocabulary this row states two sentences earlier, and it is what T33's oracle turns on — the enumeration is compared to `rows[]` *minus the manifest itself* (TSPEC §12.2, `TSPEC:2450` — "**minus `pdlc/workflows/dist/distribution-manifest.json` itself**, asserted **set-equal** to the manifest's own `rows[]`"; re-read at HEAD, where that row also records `rows[].id` as exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`). `pdlc/.claude-plugin/plugin.json`'s `version` is **not** bumped here — that is the release step's, and the manifest's `pluginVersion` stamp follows it. | `pdlc/workflows/__tests__/consolidationBuild.test.js` | `CLAUDE.md`, `pdlc/RELEASE-CHECKLIST.md` | 12 | T32 | ⬚ |

## 5. File-ownership manifest

Every task in §4 has exactly one row here, and every row names a task in §4 — the correspondence
`validatePlanContract` checks before Phase I runs. The wave commit stages **only** these paths,
pathspec-scoped (`pdlc/workflows/orchestrate-dev.js:10151`), so a file a task creates and does not
list is created and never committed.

`pdlc/workflows/dist/` appears in **no** row, by §2's rule: it is the per-wave chore commit driven by
`implementation.postWavePathspecs`.

| Task | Files owned | Batch |
|---|---|---|
| T00 | `pdlc/workflows/__tests__/consolidationPreflight.test.js` | 1 |
| T01 | `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` | 2 |
| T02 | `pdlc/workflows/consolidate-learnings.js` | 2 |
| T03 | `pdlc/workflows/__tests__/consolidationBuild.test.js` | 2 |
| T04 | `pdlc/workflows/__tests__/consolidationHookParity.test.js` | 2 |
| T05 | `pdlc/workflows/__tests__/consolidationTraceability.test.js` | 2 |
| T06 | `pdlc/workflows/__tests__/consolidationRung.test.js` | 2 |
| T07 | `pdlc/skills/consolidate-learnings/SKILL.md`, `pdlc/workflows/__tests__/consolidationBuild.test.js` | 5 |
| T08 | `pdlc/skills/harvest-learnings/SKILL.md`, `pdlc/workflows/__tests__/consolidationBuild.test.js` | 6 |
| T09 | `pdlc/hooks/scripts/nudge-consolidation.sh`, `pdlc/workflows/__tests__/consolidationHookParity.test.js` | 3 |
| T10 | `.gitignore`, `pdlc/workflows/__tests__/consolidationBuild.test.js` | 3 |
| T11 | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/__tests__/consolidationRung.test.js` | 3 |
| T12 | `pdlc/workflows/runtime-adapter.js`, `pdlc/workflows/__tests__/consolidationBuild.test.js` | 4 |
| T13 | `pdlc/workflows/__tests__/runtimeBundle.test.js` | 3 |
| T14 | `pdlc/workflows/__tests__/consolidationPredicate.test.js` | 3 |
| T15 | `pdlc/workflows/__tests__/consolidationIdentity.test.js` | 3 |
| T16 | `pdlc/workflows/__tests__/consolidationParse.test.js` | 3 |
| T17 | `pdlc/workflows/__tests__/consolidationEffectiveness.test.js` | 3 |
| T18 | `pdlc/workflows/__tests__/consolidationAdvisory.test.js` | 3 |
| T19 | `pdlc/workflows/__tests__/consolidationProperties.test.js` | 3 |
| T20 | `pdlc/workflows/__tests__/consolidationPass.test.js` | 3 |
| T21 | `pdlc/workflows/__tests__/consolidationRoute.test.js` | 3 |
| T22 | `pdlc/workflows/__tests__/consolidationCredential.test.js` | 3 |
| T23 | `pdlc/workflows/__tests__/consolidationLifecycle.test.js` | 3 |
| T24 | `pdlc/workflows/__tests__/consolidationReport.test.js` | 3 |
| T25 | `pdlc/workflows/consolidate-learnings.js`, `pdlc/workflows/__tests__/consolidationPredicate.test.js`, `pdlc/workflows/__tests__/consolidationHookParity.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | 4 |
| T26 | `pdlc/workflows/consolidate-learnings.js`, `pdlc/workflows/__tests__/consolidationIdentity.test.js`, `pdlc/workflows/__tests__/consolidationParse.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | 5 |
| T27 | `pdlc/workflows/consolidate-learnings.js`, `pdlc/workflows/__tests__/consolidationEffectiveness.test.js`, `pdlc/workflows/__tests__/consolidationAdvisory.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | 6 |
| T28 | `pdlc/workflows/consolidate-learnings.js`, `pdlc/workflows/__tests__/consolidationPass.test.js`, `pdlc/workflows/__tests__/consolidationRoute.test.js` | 7 |
| T29 | `pdlc/workflows/consolidate-learnings.js`, `pdlc/workflows/__tests__/consolidationReport.test.js` | 8 |
| T30 | `pdlc/workflows/consolidate-learnings.js`, `pdlc/workflows/__tests__/consolidationRoute.test.js`, `pdlc/workflows/__tests__/consolidationCredential.test.js` | 9 |
| T31 | `pdlc/workflows/consolidate-learnings.js`, `pdlc/workflows/__tests__/consolidationPass.test.js`, `pdlc/workflows/__tests__/consolidationRoute.test.js`, `pdlc/workflows/__tests__/consolidationCredential.test.js`, `pdlc/workflows/__tests__/consolidationLifecycle.test.js`, `pdlc/workflows/__tests__/consolidationReport.test.js`, `pdlc/workflows/__tests__/consolidationRung.test.js` | 10 |
| T32 | `pdlc/workflows/build-runtime.mjs`, `pdlc/workflows/__tests__/consolidationBuild.test.js`, `pdlc/workflows/__tests__/runtimeBundle.test.js` | 11 |
| T33 | `CLAUDE.md`, `pdlc/RELEASE-CHECKLIST.md`, `pdlc/workflows/__tests__/consolidationBuild.test.js` | 12 |

**The four shared-file clusters, and the edge that serialises each.**

| File | Writers, in order | Serialised by |
|---|---|---|
| `pdlc/workflows/consolidate-learnings.js` | T02 → T25 → T26 → T27 → T28 → T29 → T30 → T31 | the `Deps` chain in §4.2; batches 2, 4, 5, 6, 7, 8, 9, 10 |
| `pdlc/workflows/__tests__/consolidationBuild.test.js` | T03 → T10 → T12 → T07 → T08 → T32 → T33 | T10 deps T03; **T12 deps T10** — the edge exists for this reason alone, T12 needing nothing else from `.gitignore`; **T07 deps T12** and **T08 deps T07** — the same kind of edge, existing only to serialise the two un-skips, since neither skill prompt needs anything from the adapter or from the other prompt; T32 deps T03 and T31; T33 deps T32. Seven writers, batches 2, 3, 4, 5, 6, 11, 12 — strictly increasing, which is the property that makes the cluster safe |
| `pdlc/workflows/__tests__/consolidationRoute.test.js` | T21 → T28 → T30 → T31 | the module chain, which each un-skipper already sits on |
| `pdlc/workflows/__tests__/runtimeBundle.test.js` | T13 → T32 | T32 deps T31, which transitively deps T13 through T25 |

Twelve further test files carry two to four writers each — `consolidationHookParity` (T04 → T09 →
T25), `consolidationPass` (T20 → T28 → T31), `consolidationCredential` (T22 → T30 → T31),
`consolidationLifecycle` (T23 → T31), `consolidationReport` (T24 → T29 → T31),
`consolidationRung` (T06 → T11 → T31),
`consolidationPredicate` (T14 → T25), `consolidationIdentity` (T15 → T26), `consolidationParse`
(T16 → T26), `consolidationEffectiveness` (T17 → T27), `consolidationAdvisory` (T18 → T27),
`consolidationProperties` (T19 → T25 → T26 → T27). Every one of those pairs sits in a strictly
increasing batch, which is checkable from the manifest's own `Batch` column without reading §4.

**The census is set equality, not containment.** The cluster table's four files plus these twelve are
**sixteen**, and sixteen is exactly what deriving multi-writer entries from §5's own rows returns —
group the manifest by file, keep the files with more than one owning task. A reader auditing this
paragraph should count to sixteen and find no leftovers on either side; an enumeration that merely
lists files the manifest also contains is the containment-shaped oracle §4.1's T03 and T05 rows
refuse.

**No row names a directory.** A directory entry collides with everything beneath it, so a manifest
carrying `pdlc/workflows/` would make every module task collide with every test task. Files only.

## 6. Dependencies and ordering notes

**This section was checked mechanically, not by eye.** `parsePlanTasks` over this document returns
**34** tasks and `parsePlanOwnership` **34** manifest rows; `validatePlanContract` returns
`{ok: true}`; `computeTopologicalBatches` returns without a cycle; every row's `Batch` cell
re-derives to `max(batch of Deps) + 1` with **zero** mismatches; and no two tasks sharing a `Batch`
number own a file in common. The same four functions are the Phase P gate
(`pdlc/workflows/orchestrate-dev.js`), so this is the gate's own answer and not a paraphrase of it.

**The run, so the numbers are reproducible rather than asserted** (v1.0 stated them without one).
Importing the four exports from `pdlc/workflows/orchestrate-dev.js` and applying them to this file:
`parsePlanTasks(md).tasks.length` = **34**, `parsePlanOwnership(md).ownership.length` = **34**,
`validatePlanContract(...)` = `{"ok":true}`, `computeTopologicalBatches(tasks).length` = **15**,
batch-column mismatches = **0**, same-batch file collisions across the §5 manifest = **0**, and
`T25.dependencies` = `["T09","T13","T14","T19"]` (the edge §6.1 added in v1.1). **Re-run at v1.4**,
after T07 and T08 gained ownership of `consolidationBuild.test.js` and the serialising edges that go
with it: 34 tasks, 34 ownership rows, `{"ok":true}`, **15** ready-sets, 0 batch mismatches, 0
same-batch collisions, `T07.dependencies` = `["T12"]` at batch 5 and `T08.dependencies` = `["T07"]`
at batch 6. The collision count is now measured against a manifest that declares the file, which is
what makes the zero meaningful: at v1.3 the same zero was returned over rows that under-declared.
**Re-run again at v1.5**, whose diff touches only prose in §5, §4.2 and §6.1 and no `Deps`, `Batch` or
ownership cell: 34 tasks, 34 ownership rows, `{"ok":true}`, **15** ready-sets, `computeWaves` **15**
waves, 0 batch mismatches, 0 same-batch collisions — identical to v1.4, which is the expected result
and is recorded because "the diff should not have moved the graph" is a claim worth falsifying rather
than assuming. The same run derives **16** multi-writer files, which is the number §5's census is now
set-equal to. Two parser facts
worth knowing before editing a task cell: the graph is read from `dependencies` and `planBatch`, and
a **raw `|` inside a description cell shifts every column to its right** — writing a shell pipeline
literally in a `Task` cell silently turns the `Deps` cell into the `Batch` cell and the gate then
reports a dependency cycle. Describe pipes in words inside the table.

**One warning worth pre-empting.** `computeTopologicalBatches` returns **15** ready-sets, not 12 —
it splits a wide level into several dispatch waves. That is the dispatcher's width policy, not a
disagreement with the `Batch` column; the column is validated against the `Deps` edges, which is the
check that returned zero mismatches above.

### 6.1 Why each cross-cutting edge exists

| Edge | Why it is real, and not bookkeeping |
|---|---|
| everything → **T00** | §3's BL-PREREQs. A task that imports `gitWithLockRetry` before T11 exports it fails for a reason indistinguishable from its own bug |
| T14 … T24 → **T01, T02** | batch-safety rule 4: a shared test prerequisite may only be depended on by tasks strictly downstream of its creator. Every suite imports the doubles module and at least one module symbol |
| **T25 → T09** | AT-P7 is a *differential*. Without the hook's `PDLC_PENDING:` channel there is no oracle at all — the shipped message is a count and only above `THRESHOLD = 5`, blind on every discriminating fixture. The edge is what makes TSPEC §13.1 row 6 conditional on row 12 |
| **T25 → T19** | red-before-green, made explicit. T25 un-skips T19's two `T25` property blocks, so §2's rule ("every 🟢 row lists its 🔴 row in `Deps`") requires the edge — and T19 is reachable from T25 by **no** other path (T25's closure was T09, T13, T14, T04, T02, T01, T00). Without it the ordering held only because T19 and T14 land in the same ready-set, which is arithmetic coincidence rather than a declared contract, and the dispatcher validates the column against edges it can see. T26 and T27 inherit the edge through T25. Adding it changes no `Batch` number: T19 is batch 3 and T25 was already batch 4 |
| **T31 → T06, T20, T21, T22, T24 (transitive)** | T31 un-skips a block in each, and each is already in T31's transitive closure: T06 through T30 → T11 → T06; T20 and T21 through T30 → T29 → T28; T22 through T30; T24 through T29. Recorded here so the same re-derivation the T25 → T19 gap needed is not repeated on the next reading |
| **T25 → T13** | the `await` audit must be live before the first seam call is written, not after. T13 costs nothing at batch 3 (the skeleton makes no seam call) and reds the moment a module task writes an un-awaited one |
| **T12 → T10** | the only reason is the shared file: both un-skip a block in `consolidationBuild.test.js`, and rule 2 forbids two same-batch writers. Stated so a reader does not hunt for a semantic dependency that is not there |
| **T07 → T12**, **T08 → T07** | the same kind of edge as T12 → T10, and added for the same reason: once T07 and T08 own `consolidationBuild.test.js` (the ownership their un-skips need in order to be committed), they join that file's writer cluster, and rule 2 forbids two same-batch writers. Neither prompt needs anything from the adapter or from the other prompt — the edges are serialisation and nothing else, which is why they are recorded here rather than left to be re-derived as a semantic dependency that does not exist. **The front-of-cluster alternative was considered and rejected, measured rather than argued.** Putting the prompt edits first instead (T03 → T07 → T08 → T10 → T12, with `T10 deps T08` replacing `T07 deps T12`) serialises the cluster identically at the same edge count, and re-running `computeTopologicalBatches` and `computeWaves` over the alternative graph returns **15 ready-sets and 15 waves, exactly as today** — it is a swap, not a saving: T07 and T08 move to waves 4 and 7 while T10 and T12 move from 4 and 7 to 8 and 9. Nothing downstream shortens, because T31 (the driver, batch 10) takes its batch from T30 either way and neither prompt has a dependent outside the pair. What the alternative does cost is real: it re-points `T10 → T08`, an edge between a `.gitignore` entry and a skill prompt with no relationship of any kind, replacing one reviewed serialisation edge with a less legible one. Waves are dispatched unattended, so "the cheapest work lands early" buys a reader's satisfaction and no wall-clock; the current shape keeps every pre-existing edge intact |
| **T30 → T11** | T30 imports `gitWithLockRetry` (needs the `export` keyword) and builds its two `gh` command strings through `mergeCommandFor`'s widened `switch` |
| **T31 → T12** | the driver's default seam wiring is the protocol `rtConsInjections()` hands over; T03's set-equality case is what keeps the two in step |
| **T32 → T31** | the bundle inlines the finished module. Building it earlier would stamp a manifest row over a skeleton |
| **T33 → T32** | the documentation describes the artifact T32 produces, including the drift-gate consequence an operator meets on the next queue invocation |

### 6.2 Ordering constraints that are *not* expressible as edges

- **The rebuild is a wave concern, not a task concern.** The five `dist/` files T32 leaves behind are
  re-stamped by `implementation.postWaveCommand` and committed under `postWavePathspecs`. A task that
  also listed them would double-commit. The exposure TSPEC §13.2 names — a partial rebuild leaving
  one file stale and failing CI's sync job — is closed by the rebuild being one command over the whole
  `bundles` array rather than four hand edits.
- **T31's mutation check is a step inside the task, not a successor task.** Delete one `await`
  inside `finishPass`, observe T23's case RED, restore. There is no artifact to depend on, so the
  obligation lives in the row and in §8's checklist.
- **The `describe.skip` blocks are named for their green owner, which is what makes un-skipping
  auditable.** A reviewer can grep for `describe.skip("T31` and see exactly which blocks are still
  parked. This is a naming convention, not a dependency, and it is the only thing standing between
  "the wave gate is green" and "the wave gate is green *and* the cases ran".

### 6.3 The two places where a task could be tempted to over-reach

1. **T25 must not drive `_listFiles`.** The seam is in the protocol for completeness (TSPEC §5.1),
   but `fakeListFiles` is **more capable than the seam it doubles**: it returns whatever the fixture
   hands it, while shipped `rtListFiles` transports `ls -p -A | grep -v '/$'`
   (`runtime-adapter.js:915`) and rejects any line carrying a separator (`:929-931`), so a
   directory-walk enumeration greens under the double and finds **zero** feature subdirectories in
   production. That divergence is the hazard the `git ls-files` enumeration exists to remove, and a
   test that reaches for the seam re-introduces it. The hazard is stated rather than cited: this
   repo's `DOMAIN-CONSTRAINTS.md` DC-07 (`:184`) is an unrelated constraint, and the file's header
   caveat (`:11-16`) records the cross-repo `DC-07/08/09` numbering collision that produced the
   mis-citation v1.0 carried.
2. **T09 must not widen the hook's user-visible behaviour.** The `PDLC_PENDING:` line is
   **env-gated** and goes to **stderr**; `:47-48` keep printing `additionalContext` and exiting 0.
   The hook stays advisory-only — no hook can start a pass (FSPEC §2.1). The no-regression claim is
   **not** stated as byte-identity with HEAD, which on this repository is vacuously true (HEAD
   pending 1 of 2, widened 3 of 5, both under `THRESHOLD = 5` at `:25`/`:43`, so both sides print
   nothing). T04's `T09` block states it positively instead: on an above-threshold fixture the
   `additionalContext` text of both hooks is compared **and** equals the message transcribed from
   the shipped template, and a second fixture requires the widening to actually change `n`.

## 7. Integration points

Ten shipped files are touched. Each row below names the exact seam, the line it is at **today**, and
what the surrounding code does — so an implementer can confirm the landing site before editing and a
reviewer can confirm the claim without re-deriving it.

| Shipped surface | At HEAD | What the feature does to it | Owner |
|---|---|---|---|
| `resolveAdvisoryRung` | `pdlc/workflows/orchestrate-dev.js:1833`, exported; its doc comment at `:1800` calls it "the **one** ladder the tier ships" | gains an optional `skill` defaulting to `ADVISORY_RUNG_SKILL` (`:1797`). Restating the two rungs instead would create the second copy that comment forbids | T11 |
| shipped call site of the resolver | `orchestrate-dev.js:3132` — `resolveAdvisoryRung({ _agent, _log: log, _state: rungState, prompt: promptText })` | untouched, and AT-M10 is the regression that says so: no argument added, default behaviour identical on the memoised and two-rung paths | T11 (assert), T06 (author) |
| `gitWithLockRetry` | `orchestrate-dev.js:8617`, `async function`, **not exported**; called at `:8670` and `:8690` inside `commitPaths` | gains `export`. Body untouched, so both existing callers are unaffected | T11 |
| `commitPaths` | `orchestrate-dev.js:8669`; its commit is a plain `git commit -m` with **no** pathspec (`:8690`, and the comment at `:8658-8661` explains why the add is what scopes the change set) | **not reused.** FSPEC §5.4 requires the pass's commit to be pathspec-scoped, so `commitConsumingRepoPaths` follows `commitQueueRow` instead | T30 |
| `commitQueueRow` / `commitAdvisoryRecord` | `pdlc/workflows/orchestrate-queue.js:1576` and `:1615`, sharing `NOTHING_TO_COMMIT_RE` at `:1554` | the **shape** reused (add, then commit, both pathspec-scoped, idempotent on "nothing to commit"), not the code | T30 |
| `mergeCommandFor` | `orchestrate-dev.js:319`; the comment at `:273` names it "the single place every literal `gh` command string is built", and its `switch` throws on an unrecognised surface at `:350` | gains two surfaces. A consolidation-local builder would put two builders in one bundle and falsify the audit that comment claims | T11 |
| `rtWriteFile` | `runtime-adapter.js:802`; its prompt says `relative to the repository root` at `:805` — the **only** occurrence of that string in the file | widened to accept an absolute path. `rtReadFile` (`:493`) is deliberately untouched: it transports shell commands under a *cwd* instruction (`:374`), which already resolves an absolute path verbatim | T12 |
| `rtDevInjections` | `runtime-adapter.js:1086`; the comment at `:1098-1100` records a shipped adapter function that existed and was never wired | `rtConsInjections()` lands beside it, and T03's set-equality case is the guard that the same mistake does not repeat — `_checkFile` is the member whose silent omission would turn AC-1.3's mutual exclusion off in production while every L2 fixture stayed green | T12 |
| `rtCheckFile` vs `fakeFs.checkFile` | `runtime-adapter.js:823` decides emptiness by **byte size** (`test -s`); `__tests__/helpers/seams.js:298` decides it by **trimmed content** | the divergence is real and **unreachable here**: the only marker states this feature produces are `""` and absent, on which the two agree. Recorded so it stays unreachable — no row may assert *which* `reason` came back | T20, T28 |
| the `bundles` array | `pdlc/workflows/build-runtime.mjs:448`, with `QUEUE_META` at `:127`, `QUEUE_ENTRY` at `:185`, `stripModuleSyntax` at `:45`, `wrapModule` at `:55` and the prelude pattern at `:113-123` | one new row plus a `CONS_META`/`CONS_ENTRY` pair; the four reused symbols reach the IIFE through `const X = __dev.X;` prelude lines, because the runtime forbids `import` entirely | T32 |
| `BUNDLES` / `ARTIFACTS` | `__tests__/runtimeBundle.test.js:26` (`["orchestrate-queue.bundle.js", "orchestrate-dev.bundle.js"]`) and `:1584` (`[...BUNDLES, "pdlc-cli.mjs"]`); `BUNDLES` is consumed at `:503`, `:509`, `:549`, `:1044`, `:1290` and `:1584` | `BUNDLES` gains the third bundle, which is what puts it inside all six of those assertions; `ARTIFACTS` follows automatically. This is §9.1 erratum 2's local cover | T32 |
| `AT19_SEAM_NAMES` / `AWAIT_SCAN_SOURCES` | `__tests__/runtimeBundle.test.js:215` and `:1040`; consumed at `:427` and `:1054`; `RLH-SCAN-01` at `:626` | both widened in one commit. Widening only the source axis leaves the scan green on exactly the seams this feature invents | T13 |
| `nudge-consolidation.sh` | `pdlc/hooks/scripts/nudge-consolidation.sh` — `PY_BIN` probe `:13-20`, `CLAUDE_PROJECT_DIR` `:26`, `THRESHOLD = 5` `:25`, glob `:28`, early exit `:29-30`, predicate `:41`, `n >= THRESHOLD` `:43`, output `:47-48` | four edits, one task. The `PY_BIN` probe's silent `exit 0` is inherited by the L4 harness as a **reported skip**, never a pass | T09 |
| the shipped double set | `seams.js` (`fakeFs:243`, `fakeListFiles:132`, `fakeGit:389`, `LIST_FAILURE_VALUES:58`), `mergeDoubles.js` (`fakeGhRun:75`, `matchKey:45`, `passingGh:163`, `GH_SURFACE_NAMES:181`, `fakeNow:259`, `FIXED_NOW_MS:256`), `advisoryDoubles.js` (`makeAgentDouble:53`, re-exports at `:25`), `driftGenerators.js` (`seeded:76`, `resolveSeed:134`) | re-exported, never re-declared. **`passingGh` is not widened and `GH_SURFACE_NAMES` does not grow** — that set is what `passingGh` is obliged to answer, and this feature adds no obligation to it | T01 |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | `Version` cell reads `1.4 · 2026-08-06` at `:7`; §1's table is the authority | read by two oracles — §11.3(b)'s fourth leg and the `Version` pin. Never edited by this feature | T24 |
| `.claude/pdlc.config.json` | **untracked** (`git ls-files .claude` is empty); carries `implementation.testCommand`, `postWaveCommand` and `postWavePathspecs: ["pdlc/workflows/dist/"]` | read by the wave gate, not edited. T00 branches on its presence with a positive assertion in each arm, because CI's fresh clone does not have it | T00 |

**One integration point the feature deliberately does not create.** There is no `_runCommand` seam
for the pass. Everything it does through a shell is a `git` argv or a `gh` command string, and
`rtRunCommand` (`runtime-adapter.js:1034`) returns a trailer plus an output tail — the wrong shape
for a call whose stdout must be parsed (a PR URL, a `gh pr list --json` payload).

**Consumer-visible surface, unchanged except by addition.** `pdlc/hooks/hooks.json` is not edited:
no hook can start a pass. `/pdlc:consolidate-learnings` already resolves to a skill; after T32 it
also resolves to a workflow bundle — the `orchestrate-queue` shape REQ §5 names, where one name
carries both.

## 8. Verification and Definition of Done

### 8.1 What runs, at which level

| Level | Suites | Shells out? |
|---|---|---|
| L1 pure | `consolidationPredicate`, `consolidationIdentity`, `consolidationEffectiveness`, `consolidationParse`, `consolidationAdvisory` (+ the L1 half of `consolidationReport`) | no |
| L2 orchestration | `consolidationPass`, `consolidationRoute`, `consolidationCredential`, `consolidationRung`, `consolidationLifecycle` (+ the L2 half of `consolidationReport`) | no — every seam doubled |
| L3 build and source text | `consolidationBuild`, `consolidationTraceability`, `consolidationPreflight`, and the two widened sets in the shipped `runtimeBundle` | no |
| L4 differential | `consolidationHookParity` | **yes** — a real `python3`/`bash`, and a real `git` in a temp repository the case builds |
| L5 property | `consolidationProperties` | no |

**Sixteen** new suites, counted off this table: 5 (L1) + 5 (L2) + 3 (L3, excluding the shipped
`runtimeBundle`) + 1 (L4) + 1 (L5) + `consolidationReport`, which is split across L1 and L2 and so is
named **only parenthetically** in both rows and counted in neither row's five. Sixteen is the number
§1 and §8.3 use.

L4 is the only level that shells out, and it **never touches this repository's own `docs/` tree**:
the differential harness writes its fixture corpus into a temp directory and points the hook at it
through `CLAUDE_PROJECT_DIR`, and the pathspec case builds its own throwaway repository. Both are
pure functions of an injected root (DC-04), so neither can drift as this repo's `docs/` grows.

### 8.2 Per-wave gate

After every wave the script runs `.claude/pdlc.config.json` → `implementation.testCommand` and halts
on failure, then `postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`), then commits each
task's owned files pathspec-scoped plus `postWavePathspecs`. §2's `describe.skip` discipline is what
keeps every one of those gates green **and** truthful: a parked case is reported as skipped, never
as passed.

### 8.3 Definition of Done

**Mechanical — all must pass.**

- [ ] `cd pdlc/workflows && npm test` is green on both CI legs (ubuntu, macos, node 20); no
      `consolidation*` case is still `describe.skip`, verified by grepping the **sixteen** suites
      (`pdlc/workflows/__tests__/consolidation*.test.js`) for `describe.skip(` and finding none. The
      grep is scoped to that glob and to the token `describe.skip(` only — T04's `PY_BIN`-gated
      `test.skip` is a **runtime** skip on a leg with no interpreter, is not matched by this row, and
      must not be deleted to satisfy it (its non-vacuity is the counter row below).
- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits 0, and a rebuild produces no diff.
- [ ] `pdlc/workflows/dist/` carries §1's **five files** — three `*.bundle.js`
      (`orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`,
      `consolidate-learnings.bundle.js`, i.e. `BUNDLES` after T32's widening), `pdlc-cli.mjs`, and
      `distribution-manifest.json` — and the manifest holds **four** rows, the new one for
      `consolidate-learnings` carrying its sha1 and the plugin version those bytes were built at.
- [ ] `pdlc/hooks/scripts/sync-workflows.sh --check` classifies the new artifact rather than
      ignoring it.
- [ ] `bash -n pdlc/hooks/scripts/nudge-consolidation.sh` is clean and the file keeps mode `100755`.
      The no-regression obligation is T04's `T09` block, **not** a byte-identity claim: on the
      above-threshold fixture the edited hook's `additionalContext` text equals HEAD's **and** the
      message transcribed from the shipped template at that `n`; on the divergence fixture the two
      differ and the edited hook's text equals the transcribed message at the **new** `n`. (Identity
      alone is vacuous here — on this repository both hooks print nothing.)
- [ ] `consolidationTraceability.test.js` reports set equality in both directions between the FSPEC
      v11.5 register and TSPEC §12.3's table, with the version pin (FSPEC `11.5`, TSPEC `2.0`) and
      the non-vacuity floor green. Measurement of record at authoring: **99** register ids
      (FSPEC §13, `:2089-2239`, `AT-…` tokens de-duplicated). §9.1 erratum 4 has landed — TSPEC §12.3
      assigns all 99 at v2.0 — so the row is tickable.
- [ ] `parsePlanTasks` / `parsePlanOwnership` / `validatePlanContract` /
      `computeTopologicalBatches` over this PLAN return 34 / 34 / `{ok:true}` / no cycle — the Phase P
      gate's own answer (§6).
- [ ] The `await` audit ranges over `consolidate-learnings.js` **and** scans for `_envPresent` and
      `_makeTempDir` (T13), and reports green.

**Demonstrated, not merely asserted.**

- [ ] **T31's mutation check** (TSPEC §11.2): delete one `await` inside `finishPass`, observe
      `consolidationLifecycle.test.js` RED on **both** conjuncts, restore. A test whose falsifier has
      never been observed is a claim.
- [ ] **T03's `rtConsInjections` case fails with `_checkFile` removed** — the failure it exists to
      catch. Set equality, not containment, is what makes that true.
- [ ] **T04's counter is observed in the all-skip world too**: with `PY_BIN` forced empty the suite
      reports skips and the counter test still runs and passes at `0`.
- [ ] **T24's dropped-code control**: `no-cadence-datum` is **not** dropped, on the same fixture set
      where the illegal pair is.

**Reviewer-read — the semantic half, in addition to the executable case each row already carries.**
Three of these rows were review-only when §9.1's errata 1 and 3 were open; both have landed (TSPEC
v1.8 and v2.0), so T07, T08 and T33 each un-skip a source-text block in `consolidationBuild.test.js`
that pins the edit's **text**. What a reviewer still owes is the reading a verbatim-text case cannot
do: that the pinned text says what the FSPEC decided. T12's two rows are the exception — they remain
review-only, and say why.

- [ ] T07's two `consolidate-learnings/SKILL.md` edits read against FSPEC §3.2 and §5.2 — in addition
      to T03's `T07 — skill prompt` block, which pins both lines verbatim.
- [ ] T08's two `harvest-learnings/SKILL.md` edits read against FSPEC §8.3 and §8.4, with
      `LEARNINGS_SECTIONS` and the `Harvested from` row confirmed untouched — in addition to T03's
      `T08 — skill prompt` block.
- [ ] T12's `rtEnvPresent` and `rtMakeTempDir` **prompts** read for transport correctness — they are
      agent prompts and nothing here executes a real agent (TSPEC §11.6). The prompt *text* is pinned
      by T03 for `rtWriteFile` only; the two new prompts are reviewed, which is the same posture every
      other adapter transport takes.
- [ ] T33's `CLAUDE.md` and `pdlc/RELEASE-CHECKLIST.md` edits read for accuracy against the shipped
      artifact set — in addition to T03's `T33 — CLAUDE.md ↔ manifest` block, which decides the
      artifact enumeration by set equality against the manifest. The `RELEASE-CHECKLIST.md` half is
      the review-only one: no case reads it.

**Not in scope of this PLAN's Done.** `pdlc/.claude-plugin/plugin.json`'s version bump and the
manifest's `pluginVersion` stamp are the release step's. The first queue invocation after this lands
is expected to be **blocked by the drift gate** until `sync-workflows.sh` runs — that is the designed
behaviour T33 documents, not a defect.

## 9. Handed downstream and open items

### 9.1 Errata raised against upstream documents

**Five** defects were found in the TSPEC while deriving this PLAN — three at v1.0 and two more found
by re-measuring against FSPEC **v11.3** for v1.1. **All five have since landed in the TSPEC's
erratum round 8 (v1.8) and the v2.0 sentinel adoption; the table is retained as the measurement
record, not as a list of open defects.** Errata 4 and 5 are the
root cause of the two High findings against v1.0 of this PLAN: v1.0 transcribed TSPEC §12.3, and
§12.3 is itself derived from FSPEC v11.1.

| # | Upstream defect | Measured how | Covered meanwhile by |
|---|---|---|---|
| 1 | TSPEC §3.2 makes `pdlc/skills/consolidate-learnings/SKILL.md` and `pdlc/skills/harvest-learnings/SKILL.md` **production edits**, and §12.2 / §12.3 assign them no falsifying test of any kind | the nearest shipped candidate is `pdlc/workflows/__tests__/skillFiles.test.js`, whose subject list is hard-coded to `se-review`, `te-review`, `pm-review` (`:13-17`) and which asserts only VERDICT-trailer text | **Landed at TSPEC v1.8**: §12.2 assigns the two-`SKILL.md` four-verbatim-conjunct case (`TSPEC:166-167`, `:2449-2450`), authored by T03 as **two** blocks — `T07 — skill prompt` and `T08 — skill prompt`, one per green owner — and un-skipped by T07 and T08 respectively, each owning `consolidationBuild.test.js` for its own batch (§5); the reviewer read (§8.3) remains the semantic half |
| 2 | TSPEC §11.3(c) widens the L3 scan on **two** axes (`AWAIT_SCAN_SOURCES`, `AT19_SEAM_NAMES`) and misses a third: `runtimeBundle.test.js:26` declares `const BUNDLES = ["orchestrate-queue.bundle.js", "orchestrate-dev.bundle.js"]`, which drives the launcher-constraint suite (`:503`), the structural suite (`:509`), the sole-output-directory assertion (`:549`), `RLH-AT-19`'s no-`process`/no-`fetch` scan (`:1044`), the drift-perturbation set (`:1290`) and the artifact list at `:1584`. A third bundle not added to `BUNDLES` ships **exempt from every one of them** | read at HEAD | T32, which widens the bundle lists in the same task that emits the bundle — deferred to that batch precisely because asserting an artifact that does not exist yet would red every earlier wave |
| 3 | TSPEC §3.2's modified-files table omits `CLAUDE.md`, which enumerates the tracked runtime artifacts by name (`:58-60`) and closes "**Those three** are the tracked, shipped outputs" (`:62`). That sentence is **already false at HEAD** — `pdlc/workflows/dist/pdlc-cli.mjs` is tracked and carries a manifest row — and the third bundle makes it false a second time when T32 lands | read at HEAD; `git ls-files pdlc/workflows/dist/` returns four paths | **Landed at TSPEC v2.0**: §12.2's `CLAUDE.md` ↔ manifest set-equality case (manifest itself excluded, never containment), owned by T03's `T33 — CLAUDE.md ↔ manifest` block and un-skipped by T33 — which repairs the live error as well as the coming one |
| 4 | **TSPEC §12.3's traceability table omits three FSPEC register ids** — `AT-M11`, `AT-Q13`, `AT-R7`. All three are register rows in FSPEC v11.5 §13 (`:2133`, `:2174`, `:2154`) and all three are traced to an AC by FSPEC §15 (AC-1.3 `:2359`, AC-3.2 `:2368`, AC-1.4 `:2360`). Two of them are the sole oracle for an acceptance criterion's negative half: AT-M11 is AT-M3's explicitly named paired negative (`FSPEC:2133`, the row itself: a released marker is free at any age, and the older fixture is what stops every non-`IN-PROGRESS:` file being routed through the stale-lock arm), and AT-Q13 is the only test that reads the PR **body** for AC-3.2 (`FSPEC:2174` — a body carrying nothing but the three trailers is green under AT-Q2) | `grep -c` over `TSPEC-pdlc-consolidation-agent.md` returned **0** for each of the three (at TSPEC v1.8) | T20 (AT-M11, both halves) and T21 (AT-Q13, AT-R7). **Landed at TSPEC v2.0**: all three ids are assigned in §12.3, so T05's set equality is green — it never degraded to containment |
| 5 | **TSPEC §12.3 fixes the register size at a stale measurement.** `TSPEC:2395` read "The FSPEC's AT register carries **96** ids, measured at v11.1" (at TSPEC v1.8; since v2.0 `TSPEC:2485` reads 99 at v11.3). FSPEC is at **v11.5** (`:12`), whose own erratum note records the two additions that made 96 wrong (`:44-45`) | re-enumerating `AT-…` tokens over FSPEC §13 (`:2089-2239`), de-duplicated, gives **99** | T05, whose count is now **read** from the register rather than transcribed, with a version pin so a later move fails as "the register moved" |

Errata 2, 3 and 5 are the same class — a shipped enumeration that a later member falsifies, whether
that member is the third bundle (2), the tracked `pdlc-cli.mjs` (3) or the three register ids the
FSPEC gained at v11.3 (5) — and all three are the reason §7's integration table cites line numbers rather than describing surfaces: an
enumeration is only auditable if the reader can see how many members it has today.

### 9.2 Handed to PROPERTIES

- **§11.4's six properties**, in the files TSPEC §11.5 names, and authored under this PLAN's T19
  block structure so each lands with its green owner. The four T-09 rows are the parameterisable
  components; the two determinism rows each carry a **positive conjunct**, because order-invariance
  alone is satisfied by a function returning a constant, `[]` or `null`.
- **FSPEC §14.5's register, LD-1 … LD-5.** LD-1 (three `artifact` arms), LD-4 (the `passId` arm) and
  LD-5 (the four remaining short-record arms) range over `parseLogRecords` and its readers ⇒
  `consolidationParse.test.js`, beside AT-F21 (T16 authors, T26 un-skips). LD-2 (the `target`-follows
  clause) and LD-3 (two actions, one subject) range over `mergeProposals` ⇒
  `consolidationIdentity.test.js`, beside AT-R6b (T15 authors, T26 un-skips). This PLAN decides only
  **which task's file** each lands in; nothing about the fixtures is decided here.
- **One standing caution, carried forward verbatim.** No AT-A fixture may be written against REQ
  AC-6.3's "across the consumed window" wording: FSPEC §9.5 / BR-37a is the settled contract,
  `seamCandidates` ranges over **every** entry, and a REQ-derived fixture would red a conforming
  implementation. T18's row repeats it where the author will be working.
- **Coverage floors and mutation budgets** are PROPERTIES', per `DEC-LAYER-01`. This PLAN names
  exactly one mutation (T31's `await` deletion) because TSPEC §11.2 makes it an obligation of the row
  that writes the test, not a coverage policy.

### 9.3 Known-open, decided upstream, not re-litigated here

These are already recorded in TSPEC §13.3 and are listed only so a PLAN reader does not read them
as unowned work.

- **AT-M3's truncated arm — no longer open, and no longer listed as open.** FSPEC v11.3 decided the
  release form (BR-14a's `RELEASED:` sentinel), TSPEC v2.0 §7.3 adopts it, and the truncated arm is
  reachable again (E-11): a zero-byte marker is *present* and resolves `reclaim`. T20 writes AT-M3's
  full *Given*, both fixtures, paired against AT-M11.
- **The enumeration relaxation** (REQ `:115-116`'s "one enumeration") and the `--exclude-standard`
  sub-question are open upstream. T04's pathspec case pins the `:(glob)` half only, deliberately
  leaving the flag half unpinned so the erratum decides it rather than the test.
- **ER-6** — the `Route` union has no proposal-file member — stays interim as `route: "degraded"`,
  and T24's two-fixture discriminator is what makes the interim falsifiable rather than merely
  argued.

### 9.4 Risks this PLAN carries, and where each is held

| Risk | Held by |
|---|---|
| a partial rebuild of the five `dist/` files fails CI's sync job | the rebuild is `postWaveCommand` over the whole `bundles` array, never four hand edits (§2, T32) |
| `mktemp -d -t` differs between macOS and GNU coreutils | the seam returns the path the tool reported and the pass uses it verbatim; nothing constructs a path. Both platforms are already CI matrix legs |
| the pass calls the resolver bare, so a hung dispatch is bounded only by the runtime watchdog, and a wedged pass holds the marker | §7.3's stale-lock reclaim, with `staleLockMinutes` configurable — T28 owns it |
| an agent-transported `gh pr list --search` may return a truncated page | `--limit 100` plus the trailer key; a miss re-opens a proposal, which is the safe direction — T30 owns it |
| the `describe.skip` discipline degrades into "green because nothing ran" | §8.3's first checklist row greps all sixteen suites for `describe.skip(` and requires zero, and the blocks are named for their green owner so a partial un-skip is visible by grep |
| an FSPEC or TSPEC erratum round moves the AT register mid-implementation and reds T05 inside a halt-on-red wave | T05's **version pin** (FSPEC `11.5`, TSPEC `2.0`), which fails first and names the cause — the failure reads "the register moved", not "the code is wrong". The repair is then a one-line pin bump plus whatever task the new id belongs to, decided by a reader rather than by a hunt |

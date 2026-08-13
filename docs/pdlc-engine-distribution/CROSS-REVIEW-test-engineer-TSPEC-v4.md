# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.4)
**Date:** 2026-08-13
**Iteration:** 4

**Scope:** Testing lens only — oracle falsifiability, expected-set completeness, production-path
vs unit-path proof, implementation echoes, TDD order. Delta re-review: v0.3's six findings
verified against the revision, and only the sections the revision changed scanned for new
defects. Sections not touched are not re-opened.

## Delta

Diffed `ca3559be..HEAD` on the TSPEC (six authoring commits, v0.3 → v0.4) and re-read every
`file:line` the changed sections newly cite. Every claim below is grounded in code read at
HEAD, not in the TSPEC's prose. Re-verified at HEAD this round: `rewriteStatus`'s seven
parameters and its five call routes (`orchestrate-queue.js:1522-1530`; callers `:1426`,
`:1439`, `:1464`, `build-runtime.mjs:274`, `:307`); `updateQueueStatus`'s two row-write paths
(`orchestrate-queue.js:444-450` quick path, `:462` → `writeEvidenceCarryingRow` at `:491`);
`colIndex`'s containment-first-match (`:154-160`) and `updateQueueStatus`'s re-implementation
(`:423-435`); `buildA5SeamOps` (`orchestrate-dev.js:2743`), its bare `_git` commit
(`:2837-2841`) and its single `main()` call site (`:11718`); `appendApprovalAnchors`
(`:6660`), `appended = true` (`:6721`), both call sites (`:6516` in `reviewLoop`'s PASS
branch, `:11336` in `erratumRound` at `:11123`); `reviewLoop` (`:6183`) and both its callers
(`:11532`, `:12532`); `artifactPaths` (`:11659`) and the file's only push (`:11507`);
`commitPaths` (`:10408`) and its three wave callers (`:12390`, `:12401`, `:12801`).

## Round-3 disposition

| Prior | Severity | Status |
|---|---|---|
| F-22 | High | **Resolved, and the arithmetic checks.** §5.4 now carries `lib/resolve-version.mjs`, `lib/store.mjs` and `lib/provenance.mjs` as literal rows E-17…E-19, vendor rows renumbered E-20…E-22, `postinstall` E-23. I re-derived the totals from the table itself: 4 manifest/`bin` members (E-1, E-2, E-4, E-4b) + 15 `lib/*.mjs` + 3 vendor + 1 postinstall = **23**, +`LICENSE` = **24** — matching the restated sentence. V-03 now reads "twelve at HEAD, fifteen after §3.1", so the two statements cannot drift. The glob fix I warned against was not taken; the "added by hand, as a visible edit" note makes that explicit |
| F-23 | High | **Resolved.** §7.4's "It does" is replaced by "It does not do this at HEAD", the four-step route is named at kind 3's precision, and every line it cites is correct at HEAD (see Delta). Step 4's "both pushes are conditional on the append having succeeded" keeps P-5's rule intact, so a failed append still enumerates nothing. §13's AC-4.5 row now says "work this feature builds" |
| F-24 | Medium | **Resolved on the substance; the new clause 3 needs a mechanism.** Top-level `await` is gone, the guard is a promise chain, the floor is honestly stated as Node 12.17 (dynamic `import()` in ESM), and §3.1's guard row was reconciled in the same pass. Clause 3 itself is now the falsifier the section needed — but it names no parser the repo has. See F-30 |
| F-25 | Medium | **Resolved.** The five-row route table is the right shape and every row is true at HEAD: C-b's two call sites and their differing seam names (`readFileFn`/`gitFn`), C-d's `(recordPath, feature, gitFn, emit)` signature reached from `:1300`, C-e's single `main()` call site. The closing sentence — "without this table AT-5.3 is unimplementable for three of the five" — is the honest statement of why the table exists |
| F-26 | Medium | **Resolved.** C-e is marked in place rather than routed through `commitPaths`, and the reasoning is grounded: the bare `_git(["commit", …])` at `:2837-2841` really does commit whatever is staged with no `git add`, so re-routing would change committed content and message. The set-equality's right-hand side is now unconditional over five enclosing named functions, so the row is red or green on code shape and not on a sibling task's merge order |
| F-27 | Low | **Resolved.** §7.2 now says containment-first-match with the `:169` fixed-position fallback named, and the round-trip test asserts the `Engine` header literal so a later rename that contains a matcher token goes red |

No prior finding is re-litigated below. The one High is new, lands in a section this revision
rewrote, and is the same defect class one level further out than F-25 reached.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-28 | High | Local | **The seam is now routed all the way to five helpers inside two modules, but nothing routes a real `Provenance` from the engine into either module's `main()` — and the shipped seam set-equality makes that omission the path of least resistance.** §7.2 says "`main()` in both workflow modules gains one keyword parameter" and S-6 (§11) names the provider as "the engine's `run.mjs`". That is the last unnamed hop in an otherwise fully named chain. Verified at HEAD: the engine hands the modules exactly two frozen seam objects — `devInjection(adapter)` (`pdlc/engine/lib/run.mjs:80-91`, seven keys) and `queueInjection(adapter, runPipeline)` (`:114-123`, five keys: `_agent`, `_log`, `_phase`, `_git`, `_runPipeline`) — and **both key sets are pinned by a shipped no-more-no-less set-equality**, `PROP-PARITY-12` (`pdlc/engine/__tests__/seam-contract.test.js:65-73`, expected constants at `:47-63`). Two consequences, both test-visible: (1) an implementer who adds `_provenance` to either injection turns PROP-PARITY-12 **red** unless the same task edits `TSPEC_3_1_DEV_SEAMS`/`TSPEC_3_1_QUEUE_SEAMS`, and no §12 row or §12.4 sequencing constraint schedules that edit; (2) an implementer who does **not** wire it leaves every named oracle **green** — §12.1's module-side tests inject a populated `Provenance` directly into the modules, so kinds 1–4 all pass while a real engine-driven run emits `NO_PROVENANCE` everywhere. The queue side is the sharper half: kind 3's rows (R-3, R-5) and C-d are written by `orchestrate-queue.js`, whose `main()` is only ever reached in production through `queueInjection`'s five keys. That is builder-not-wired exactly as §7.4 was corrected for, one level further out. Needed: name `devInjection` and `queueInjection` as the production carriers in §3.1/§7.2, schedule the PROP-PARITY-12 constant edit as part of the same task, and give §12.3's oracle 2 one production-path leg that reaches the module through the engine's injection rather than through a hand-built parameter object | §7.2 (C-d, kind 3), §11 S-6, §12.1, §12.3 oracle 2, §3.1 |
| F-29 | Medium | Local | **Oracle 2's new green-path positives have an unstated fixture precondition, and one of them is vacuous under the shipped default.** §12.3 now says "the green *direct* run's only rewrite is Phase MERGE's, which takes `updateQueueStatus`'s evidence-carrying path". Verified: the only evidence-carrying `_recordQueueRow` call is Phase MERGE's `{feature, status: "done", evidence}` (`orchestrate-dev.js:1753`), and Phase MERGE returns `skipped` before reaching it whenever `mergeMode === "off"` (`:1064-1070`, `:1659`) — which is the **shipped default** (`MERGE_DEFAULTS.mergeMode: "off"`, `:61`). So a green direct fixture built on default config produces no kind-3 artifact at all, and since equality is over the kinds a run *actually produced* (BR-9.2), that leg passes while asserting nothing — and `writeEvidenceCarryingRow`, the second row-write path §12.1 promises to cover, is never entered. State the precondition literally (the green direct fixture sets `mergeMode: "on"` in its `.claude/pdlc.config.json`) and assert the produced-kind set is non-empty, so the leg cannot go quiet | §12.3 oracle 2, §12.1 |
| F-30 | Medium | Local | **Structural-oracle clause 3 names no parser the engine suite can run, and its second half is not checkable by the means available.** §9.3 clause 3 asks that the guard "contains no top-level `await` and no construct outside the declared syntax subset — i.e. the file parses under a parser configured for the ES version Node 12.17 supports". The first half is a source-level check any suite can do; the second half needs a real parser with a configurable `ecmaVersion`. The engine ships one dependency, `@anthropic-ai/claude-agent-sdk` (`pdlc/engine/package.json:15-17`), runs on `node --test` (`:12-14`), and has no parser — and adding one is not free here, since §5.4's packed-set equality and the package's dependency posture are both under test in this same feature. Either name the mechanism and schedule it (a `devDependency` such as `acorn` with `ecmaVersion: 2020`, plus the §5.4 row it does or does not add), or reduce clause 3 to the falsifiable half the suite can actually run — "no top-level `await`", asserted over the source — and drop the broader subset claim rather than shipping an oracle whose implementation is left to the test author to invent. As written, the section's own subject (falsifiability) is undercut by its newest clause | §9.3, §12.1 |
| F-31 | Low | Local | **R-2's Status cell mislabels what that route writes.** §7.2's route table gives R-2 (`build-runtime.mjs:307`'s direct-invocation closure) the status `halted`, with the parenthetical "(`orchestrate-dev.js:12913` → `:1753`, and Phase MERGE)". The two line refs write **different** statuses: `:12913` writes `halted`, `:1753` writes `done` with an evidence cell. Since §12.3's green-direct-run leg turns on precisely that second status, the cell should read `halted` **or** `done` (evidence-carrying), so the table and the oracle agree on what R-2 can produce | §7.2 (R-2), §12.3 |

## Questions

| ID | Question |
|----|---------|
| Q-12 | F-28's cheapest fix may be to *not* extend `queueInjection` at all: `orchestrate-queue.js`'s `main()` could receive provenance through `_runPipeline`'s wrapper, or the queue module could take it as a sixth injected seam. Which shape does the design intend? The answer changes whether PROP-PARITY-12's queue constant gains a member, and PLAN needs the answer before the task is writable |
| Q-13 | §12.1 puts the kind-3 assertions in `pdlc/workflows/__tests__/`, which runs in the repo's jest suite, while the engine-side wiring lives in `pdlc/engine/__tests__/` under `node --test`. Is any single test allowed to span both, or does F-28's production-path leg have to be an engine-suite test that imports the workflow module directly? Naming the suite avoids a PLAN task with no home |
| Q-14 | The `Engine` column is written by `ensureEngineColumn` on both `updateQueueStatus` paths. `writeEvidenceCarryingRow` (`orchestrate-queue.js:491`) re-locates the row in the *migrated* table after `ensureEvidenceColumn` runs — does the round-trip test cover the two-migration case (a table lacking **both** columns, written once with evidence and provenance), or only the one-column-at-a-time cases? That interaction is where a column-index off-by-one would live |

## Positive Observations

- **The kind-3 correction is the best measurement in the document so far.** The earlier draft
  named one route because one route was the one being looked at; this revision counted five,
  found that the two a *green* queue-driven run produces were among the four that would have
  been missed, and then moved the mark to the single writer rather than patching call sites.
  I re-derived the route set independently (`grep -n rewriteStatus` over both modules and
  `build-runtime.mjs`) and got exactly R-1…R-5. The conclusion — mark one writer, not five
  callers — is the correct testing conclusion as well as the correct design one, because it
  makes the property inherited by construction rather than asserted five times.
- **The `updateQueueStatus` "second look" paragraph is the habit generalising.** Having found
  a one-of-five gap at the caller level, the author went looking for the same shape one level
  down and found the `evidence == null` quick path versus `writeEvidenceCarryingRow`. That is
  a defect found by method rather than by review, which is what the last three rounds have
  been trying to install.
- **F-26's fix chose the honest cheap move over the tidy one.** Marking C-e in place, with the
  reason stated (`commitPaths` stages a pathspec, C-e deliberately commits what is staged, and
  an advisory-tier assertion may pin its message), leaves the expected set unconditional. An
  oracle whose right-hand side no longer depends on merge order is worth more than a uniform
  commit path.
- **§9.3's `await` catch is exactly the class of defect this section exists to prevent.** A
  guard that cannot parse on the runtime it promises to refuse on is the AC-2.4 failure
  relocated, not removed. Naming Node 12.17 rather than a rounder number is the right instinct;
  F-30 is only about giving clause 3 a mechanism, not about the reasoning.

## Recommendation

**Needs revision** — one High finding.

All six of v0.3's findings are genuinely resolved, and two of them (F-22's packed set, F-26's
unconditional expected set) are resolved in the way that makes the oracle stronger rather than
the sentence safer. The document is close.

What blocks approval is one hop, and it is the last one: §7.2 now routes `provenance` to five
helpers across two modules with call-site precision, but neither module's `main()` has a named
production caller that supplies it. The engine reaches the modules through exactly two frozen
seam objects (`devInjection`, `queueInjection`), both pinned by a shipped no-more-no-less
set-equality that no §12 row or §12.4 constraint schedules an edit to — so wiring the seam
turns a green test red, and *not* wiring it leaves every oracle in §12 green while a real
engine-driven run emits `NO_PROVENANCE` into every one of the four kinds. That is the same
false-green §7.4 was corrected for, one level further out.

Concretely, to reach approval: name `devInjection` and `queueInjection` (`pdlc/engine/lib/run.mjs:80-91`,
`:114-123`) as kind 1–4's production carriers, schedule the `PROP-PARITY-12` constant edit
(`seam-contract.test.js:47-63`) inside the same task, and give §12.3's oracle 2 one leg that
reaches a workflow module through the engine's injection rather than through a hand-built
parameter object — a leg that goes red if either injection forgets the key. The three lesser
findings are worth taking in the same pass: F-29 in particular, because a `mergeMode: "off"`
fixture makes the green-direct-run leg assert nothing at all, and the second `updateQueueStatus`
path §12.1 promises to cover is never entered.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}

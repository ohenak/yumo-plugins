# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.2)
**Upstream read:** `REQ-pdlc-engine-distribution.md` (AC-1.4, AC-4.5, AC-5.3), `FSPEC-pdlc-engine-distribution.md` (§5.2, §5.3, BR-9.1…BR-9.3)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v1.md` (Needs revision — 4 High, 3 Medium, 2 Low)
**Diff reviewed:** `cea38e59..HEAD` on `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Delta re-review, product lens only — whether v1's blocking findings are resolved and whether the revision broke anything. Unchanged sections already approved are not re-litigated.

## 1. Prior findings — disposition

| v1 ID | Severity | Status | Evidence in v0.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.4 drops `README.md` from `files`, states the literal expected packed set (E-1…E-20), and §5.1 authors `pdlc/engine/README.md` as a new file. The disagreement with FSPEC §5.2 is raised as an erratum instead of being papered over — the outcome asked for |
| F-02 | High | **Resolved** | §7.2 now carries a four-row placement table, one per AC-5.3 kind, each with a named carrier and site; §13's AC-5.3 row agrees with it. Kind 4's literal scope is raised against the REQ rather than assumed. Two residues below (F-01, F-05) |
| F-03 | High | **Resolved, and better than asked** | §8.2 **rejects** the reusable-workflow extraction outright rather than demoting it to a fallback, and §8.5 makes a `uses:` job fail the arrangement gate — so the rejected path is mechanically unavailable, not merely discouraged. `pr-tests.yml` is untouched, so V-18's rendered names cannot move |
| F-04 | High | **Partly resolved** | The exemption now exists in §6.2, §11 and §13 and R-B names the diagnostic path. But what the exempt commands report *when resolution succeeds* is now wrong against AC-1.4 — see F-03 below |
| F-05 | Medium | **Resolved** | The scope is N-6, operator-owned; PF-3 asserts against the recorded decision, §9.1's README ships the resolved literal |
| F-06 | Medium | **Resolved** | §10.1's S-4 commentary makes `NO_PROBE` return `{unavailable, reason}` and the run state E-12 unconditionally; §11's E-12 row (`:1011`) and §10.3's `update.unavailable` id agree |
| F-07 | Medium | **Resolved** | §9.2 names the observed value as the resolved store entry `$PDLC_HOME/versions/<v>/`, explicitly not the launcher's `PATH` location, and §12.3's leg 3 and §13's AC-2.3 row carry the same pair |
| F-08 | Low | **Resolved** | §8.1 states `engine-v*` is a convention this TSPEC establishes, with the zero-tags measurement and the reason for the prefix |
| F-09 | Low | **Resolved** | §6.3's `EngineLocation` record makes branch 1's conjuncts decidable in-memory and branch 2's "which conjunct failed" derivable from data |

No prior finding is unresolved on its own terms. The three High findings below are defects in
the **new** text, two of them in the sections written to close F-02 and F-04.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§7.2's kind-4 guarantee rests on a claim that is false at HEAD, and kind 3 has no path for the mark to reach its carrier.** §7.2 says "Every script-owned commit already funnels through `commitPaths` — the Phase I wave commits (`:12390`, `:12401`, `:12801`) and the queue row's own commit — so `line` is composed into the message *inside* the helper", and calls this structural rather than dependent on "nobody forgetting". Three script-owned commit sites do **not** go through `commitPaths`: the approval-anchor commit (`pdlc/workflows/orchestrate-dev.js:6735-6736`, `_git(["commit", "-m", "chore(pdlc): record approval anchors …"])`), `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js:1603`) and `commitAdvisoryRecord` (`:1645`). Composing `line` in `commitPaths` alone therefore leaves three commit kinds unmarked, and AT-5.3's "none is unmarked" goes red against a correct implementation of this design — the same failure mode §7.4 was corrected for. Compounding it, kind 3's carriers are queue-side (`rewriteStatus`, `commitQueueRow`) while `_provenance` is a parameter of `orchestrate-dev`'s `main()`; the queue-side writer is reached through a fixed closure (`build-runtime.mjs:273-274` → `__queue.rewriteStatus(...)`) that this TSPEC does not extend, and §7.2 does not say *where in the row* the mark goes (the row is a table cell, not free text). Fix: enumerate the marked commit sites as a closed set (or route all four through one helper and say which change makes that true), and state how `line` reaches the queue-side writer and which part of the row carries it. | AC-5.3, FSPEC BR-9.1, BR-9.2 |
| F-02 | High | Local | **§7.4's corrected class list is still short, and short in a way that reddens AT-4.5 for the same reason LEARNINGS did.** The new table enumerates ten classes and marks four as "must be added". It omits `CROSS-REVIEW-*`, and those files are **modified in place by the script**: the approval-anchor path appends `APPROVAL-HASH:` / `REVIEWED-COMMIT:` lines to an existing cross-review file and commits them (`pdlc/workflows/orchestrate-dev.js:6716-6721` append, `:6735-6736` commit). AC-4.5 asks that every file under `docs/{feature}/` that existed before the run hashes identically **except** those the report enumerates — an anchor-appended cross-review is a pre-existing file whose hash changes and which no `artifactPaths` push covers, so the set-equality this section builds fails against correct code. (FSPEC BR-9.3 excludes cross-reviews from AC-5.3's *mark* set; that is a different set from AC-4.5's enumeration, and the exclusion does not carry across.) `QUEUE.md` is outside `docs/{feature}/` and so outside AC-4.5, but is worth a sentence for the same reason. Fix: add `CROSS-REVIEW-*` (anchor-append path) to the table with its disposition, or state the reason it is excluded against AC-4.5's wording rather than against BR-9.3's. | AC-4.5, BR-5.3 |
| F-03 | High | Local | **The §6.2 exemption written to close v1's F-04 narrows AC-1.4: under a resolvable pin, `pdlc --version` would report the wrong engine version.** AC-1.4 requires "the same triple the startup banner and the run report carry". §6.2 states unconditionally that "`--version` and `doctor` run the **launcher's own** `bin/pdlc.mjs` in place. They do not `exec` a resolved child", and then specifies only the empty-store case. In a project pinned to a version other than the launcher's own — the AC-5.1/AC-5.2 world this whole feature exists to create — the run report carries the **resolved** engine version (§7.1, AC-4.1/AC-4.3) while `--version` reports the launcher's. The two triples then disagree, which is precisely what AC-1.4 forbids, and the operator debugging a pin is misled by the one command they would reach for. The exemption AC-1.1 asks for is *never refuse*, not *never resolve*. Fix: state that the exempt commands **resolve for reporting** and report the resolved triple when resolution succeeds, falling back to the launcher's own with `mode: unresolved` and the refusal text as a notice only when it does not — which keeps R-B's diagnostic intact and restores AC-1.4's "same triple". | AC-1.4, AC-1.1, AC-4.4 |
| F-04 | Medium | Local | **E-3 lets the packed-set equality derive part of its expected value from the tree under test.** §5.4 makes `LICENSE` "parameterised on one boolean the repo can read (does `pdlc/engine/LICENSE` exist)". PF-4 is a both-directions equality whose point (AC-1.3, and v1's F-01) is that a member appearing or disappearing fails. With E-3 computed from the source tree, deleting `LICENSE` deletes it from both sides at once and the check stays green — the deletion-tolerant weakness the both-directions rule exists to remove, and a derived expected value rather than a literal transcription. N-2 makes the licence an operator gate, which is the right handling of the *decision*; the *oracle* should not float with it. Fix: keep the expected set literal in two shipped states (pre-N-2 and post-N-2), selected by an explicit switch the PLAN flips when N-2 lands, so the flip is a visible edit rather than an inference. | AC-1.3, BR-8.1, N-2 |
| F-05 | Low | Local | **The erratum raised against AC-5.3's kind 4 may already be answered upstream.** §7.2 asks the REQ to settle whether "every commit the run makes" includes agent-made commits. FSPEC BR-9.3 already excludes cross-review and `CODE_REVIEW-*` files from the set on exactly the offered ground — "authored by dispatched agents rather than by the run harness" — and REQ AC-5.3 repeats it. The raise is not wrong (the *commit* kind is not literally the *file* kind), but the question would be cheaper answered by citing BR-9.3's principle and stating the reading, with the erratum reduced to a wording confirmation. Worth one sentence, not a revision on its own. | AC-5.3, FSPEC BR-9.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §9.3 moves everything currently in `bin/pdlc.mjs` behind `await import("./cli.mjs")`. The shipped `cli.test.js` exercises `bin/pdlc.mjs` directly (§6.2 says so). Is the intent that those oracles keep pointing at the `bin` entry (and so now exercise the guard plus the dynamic import), or that they move to `cli.mjs`? AC-2.1's "the CLI is on `PATH`" is unaffected either way, but the answer decides whether an existing green suite still proves what it proved. |
| Q-02 | §5.1 authors `pdlc/engine/README.md` as a new file and §9.1 adds the operator commands to `pdlc/README.md:132`. Which of the two is the operator-facing page for install/upgrade/pairing — or is the engine README a stub whose job is only to make E-2 intentional? AT-2.2's uniqueness rule ("a second copy of either engine command anywhere else in the tree is a defect") makes this a real question rather than a stylistic one. |
| Q-03 | §7.2 kind 3 marks both the `QUEUE.md` row text and its commit message. The row is a fixed-column table row that `updateQueueStatus`/`rewriteStatus` rewrite and that the queue's own parser reads back (`orchestrate-queue.js:415` `updateQueueStatus`, called from `rewriteStatus` at `:1544`). Is the mark intended to land in an existing cell (Evidence?) or to add a column — and has the round-trip through the parser been considered, given the queue table is also operator-edited by hand? |

## Positive Observations

- **The revision corrected its own measurements rather than defending them.** V-14's `converge()`-only scope, V-17's queue-side writer and V-18's per-job axes were each re-measured, and all three re-measurements hold: `:11507`'s push is the only one and is guarded by `pushArtifact` (`:11498`); LEARNINGS is authored outside it at `:12690-12704`; `defaultRecordQueueRow` is a stub returning `{queueRow: "none"}` (`:10490`) with the real writer at `orchestrate-queue.js:1572`; `unit-tests` declares `os` and `node` (`pr-tests.yml:40-41`) while `engine-tests` declares `os` only (`:86-87`) and three jobs declare none. §7.4 got *larger and less convenient* as a result, and says so ("the honest size").
- **§8.2 is the strongest section in the document.** v1's F-03 asked for a promotion of the fallback; the revision went further and removed the risk, then made the rejected arrangement fail the gate mechanically. "An oracle that cannot detect the failure it is nominated against is not a mitigation" is the right standard, and K-1 was rewritten to price the choice that was actually taken rather than the one that was abandoned.
- **Three disagreements with upstream are raised, not absorbed.** FSPEC §5.2's expected packed set, FSPEC's `[blocked on O-9]` marking and REQ AC-5.3's kind-4 scope each travel as errata with the corrected reason attached. §14.4 records the discipline as part of the definition of done, which is what stops the next round quietly resolving a disagreement in this layer.
- **§10.3's catalogue-registration constraint is a genuine product-visible catch.** Registering ids ahead of their emitters would redden the whole suite (`__tests__/_assert-suite-wide.mjs:195-205`, `assert-suite-wide.test.js:183`), and the section additionally refuses to let id-equality stand in for rendered content — naming AC-5.5, E-10 and AC-2.4 as the three criteria that need the substituted values asserted. That is the difference between a message existing and a message being useful to an operator.
- **§9.3's guard correction is grounded in the real import graph** (`pdlc/engine/bin/pdlc.mjs:22-30`, six static imports) and AT-2.5 is given a named below-floor runner rather than being left to a `node: ['20']` gate where it would have been silently skipped.

## Recommendation

**Needs revision** — three High findings, all in text added by this revision.

Every v1 blocking finding is closed, two of them more thoroughly than asked. The document is
now materially more honest about its own size, and nothing settled in round 1 has been
re-opened. Exactly three things need to change:

1. **F-01** — §7.2's "every script-owned commit funnels through `commitPaths`" is false
   (`orchestrate-dev.js:6736`, `orchestrate-queue.js:1603`, `:1645`), and kind 3's mark has no
   stated route to the queue-side writer or to a named place in the row.
2. **F-02** — §7.4's class list omits `CROSS-REVIEW-*`, which the script appends to and commits
   (`orchestrate-dev.js:6716-6721`, `:6735-6736`), so AC-4.5's set-equality still fails against
   correct code.
3. **F-03** — §6.2 must let `--version`/`doctor` resolve *for reporting* so AC-1.4's "same triple
   the run report carries" survives a pin; never refusing is the exemption AC-1.1 asks for,
   never resolving is not.

F-04 (E-3's derived expected member) and F-05 (the AC-5.3 kind-4 erratum) are worth a pass in
the same revision but do not gate on their own.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 1, "low": 1}


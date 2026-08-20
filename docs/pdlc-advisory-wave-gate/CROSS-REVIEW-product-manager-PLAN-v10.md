# Cross-Review: product-manager — PLAN (delta re-review, round 10)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.9)
**Date:** 2026-08-19
**Iteration:** 10
**Scope:** Delta re-review of `52885fb1..HEAD` (v1.8 → v1.9, three commits `0a89d61b`, `9b4c6ad3`, `b902f40b`; +28/−10 lines). Round-9 findings F-01…F-04 checked for closure; only the sections those commits touched were scanned for new defects; every repository claim in the changed text was re-measured at HEAD.

## Round-9 findings disposition

| Round-9 finding | Landed? | Evidence |
|---|---|---|
| F-01 High — DoD's residual set-equality mis-fires on the pipeline's own cross-review output | **Yes, and the fix is measurably correct** | `0a89d61b` splits the positive check by class: class 2 checked by set-equality over the four named `.claude/workflows/` artifacts, class 3 checked as a *membership* predicate (`docs/pdlc-advisory-wave-gate/**`), `.pdlc-backups/*.bak` excluded in both directions; the "a fifteenth class member is a regression" sentence is gone. Re-measured at HEAD by replaying the oracle's own logic (`git ls-files` → `grep -rln` over L-2's seven terms minus A-1's 15 globs, `documentOracles.test.js:461-503,538-575`): residual is now **30** — 14 `.bak` blobs, the same 4 runtime artifacts, and **12** feature documents (two more than round 9, exactly the two cross-review files round 9 committed). Under v1.8's wording today's tree would read as a regression; under v1.9's wording it reads as expected growth, and a genuinely new residual class still fails. The fix does the thing it claims. |
| F-02 Medium — DoD's `28`/`14` undated while the Overview's were dated | **Yes** | The DoD bullet now names the Overview's HEAD-drift note as the single owner of the figures and carries the dating and growth rule inline ("measured 2026-08-19 on a clean tree, class 3 growing by one per *committed* cross-review file"). A verifier reading the DoD alone now has the staleness signal. |
| F-03 Low — `--diff-filter=A` recipe contradicts its own conclusion | **Yes** | `9b4c6ad3` names `git ls-tree` at merge-base `1efb9a3b` as the deciding leg and marks the log leg corroborating-with-a-caveat. Re-verified all four claims at HEAD: `git ls-tree 1efb9a3b -- .claude/workflows/` is empty; `--diff-filter=A` prints **two** adds for each `.bundle.js` (`e3b9d5a3` 2026-08-19 and `3991b4d5` 2026-07-27) and one for `.pdlc-drift-state.json` / `pdlc-cli.mjs`; `git merge-base --is-ancestor 3991b4d5 1efb9a3b` succeeds; the delete is at `1fb6cbec` (2026-07-29). The document's caveat is byte-accurate. |
| F-04 Low Process — completeness gate supplies PLAN headings on the cross-review invocation | **No** (not this document's fix) | Recurs unchanged in round 10's invocation; re-filed below for harvest routing. |

The changelog row's own claim that no task row, batch, wave, dependency edge or ownership cell changed also checks out mechanically: replaying the shipped parsers on the document at HEAD gives **11 tasks** (`A6-00, A6-01, A6-04, A6-05, A6-06, A6-08, A6-10, A6-12, A6-14, A6-18, A6-21`), 11 ownership rows with 0 near-misses, `validatePlanContract` → `{"ok": true}`, and `computeWaves` → **7 waves** in the same shape as v1.8.

## Findings

No High, no Medium. Two Lows, neither gating; the round's routed items all landed and nothing in the delta broke behaviour that worked before.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **The DoD bullet restates `28 total / 14 closable here` in the same sentence that tells the reader not to read counts from this bullet.** The revised text says *"The figures live in one place: the Overview's HEAD-drift note owns them (28 total / 14 closable here, measured 2026-08-19 …). Read the count there rather than from this bullet"*. The parenthetical is dated, so F-02's blocking defect is closed and this is no longer a staleness trap — but the number it instructs readers to distrust is repeated inline two clauses earlier, and today's measured residual is already 30, not 28. A pure pointer ("the Overview's HEAD-drift note owns the current figures and their measurement date") would carry the same information with nothing to re-date next round. Non-blocking; fold in only if the document is touched again. | PLAN Definition of Done; Overview HEAD-drift note |
| F-02 | Low | Process | **The completeness gate still supplies PLAN top-level headings (`## Overview`, `## Batches`, `## Dependencies`, `## Verification`) on a cross-review invocation — seventh consecutive round.** A cross-review file has the fixed reviewer schema (`## Findings` / `## Questions` / `## Positive Observations` / `## Recommendation` / `## Verdict`); the reviewed *document*'s heading set is being applied to the *review* artifact. Harmless because the review format is written into the role definition, but it is a standing mis-dispatch worth one harvest line against the workflow's completeness gate, not against this document. | Process (workflow completeness gate) |

**Scope-tag reconciliation:** F-01 is `Local` — it is about wording in this document only and implicates no sibling feature and no `DOMAIN-CONSTRAINT`. The durable lesson from round 9's F-01 (a DoD criterion stated as set-equality over a set the pipeline is designed to grow will mis-fire at the ship boundary) remains a LEARNINGS-worthy line rather than a `Cross-Feature` promotion, consistent with how I tagged it last round. F-02 stays `Process`, matching its tag in rounds 5–9.

DEFERRED: replace the DoD bullet's inline `28 total / 14 closable here` parenthetical with a bare pointer to the Overview's HEAD-drift note, so only one site ever carries a number.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v8-v9, now answered by measurement rather than by the document: the DoD's full-suite leg names two failing test titles, and both are verbatim transcriptions of source — `documentOracles.test.js:75` (`AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing`) and `:575` (`PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty — AC-1.2's required-empty gate`). No change requested; recording the verification so a future reader need not re-run it. |
| Q-02 | Carried from v7-v9, still non-blocking: A6-00's untrack step is a non-file act (`git rm --cached` on the 14 `.bak` paths) while the wave commit arm iterates exactly `task.files`. The `.gitignore` half lands cleanly through the manifest; does the un-tracking half land in the same commit given that none of the 14 `.bak` paths appear in the task's `files` list? If not, worth one line marking it a manual step the implementer performs before the wave's commit arm runs. |
| Q-03 | Carried from v3-v9: the shipped example commits `{"enabled": false, "waveBudgetPerRun": 1}` with no README row in scope, so the feature ships with no operator-facing discoverability beyond the example file itself. This is upstream's explicit decision and correctly followed here; still worth one LEARNINGS line so a future operator-documentation pass picks it up. |

## Positive Observations

- **The class-split fix is the right shape, and I could prove it on today's tree rather than reason about it.** Class 2 is genuinely closed (four artifacts, stable across three rounds of measurement); class 3 is genuinely open (10 to 12 documents in two rounds, growing at exactly the rate the document predicts). Matching each check's shape to its class's shape means the ship-boundary gate now fails for the reasons a verifier would want it to and passes for the reasons the pipeline guarantees. The closing clause — "any criterion that set-equals a snapshot of it mis-fires by construction" — states the general rule, not just the instance, which is what makes the fix survive future edits.
- **The provenance note now separates a deciding measurement from a corroborating one.** A small edit with an outsized effect: the previous text handed a reader a command whose last line reversed the finding. Naming `ls-tree`-at-merge-base as the leg that decides, and spelling out why the log leg misleads (added at `3991b4d5`, dropped at `1fb6cbec`, re-added on this branch), means the note survives being re-run by a skeptic. I re-ran all four legs; every claim holds byte-for-byte.
- **The changelog row is honest about what did not change.** "No task row, batch, wave, dependency edge or file-ownership cell changed" is a checkable claim, and it checks: 11 tasks, `ok: true`, 7 waves, 0 ownership near-misses at HEAD. A prose-only round that says so plainly is cheap for the next reviewer to verify and cheap for Phase I to trust.
- **Three rounds of findings closed without collateral.** F-01 (High), F-02 (Medium) and F-03 (Low) landed as three separate single-purpose commits, each addressing the finding and nothing adjacent. No section I had already approved was re-opened or re-argued.

## Recommendation

**Approved with minor changes**

The round-9 High is closed, and closed correctly rather than nominally — the criterion now distinguishes the closed class from the growing one, which is exactly the distinction the ship boundary needs. The Medium and both Lows are closed too. Neither remaining finding is a defect this revision introduced, nor a contradiction with the repository at HEAD, so neither blocks. F-01 is a one-clause tidy-up for whenever the document is next touched; F-02 belongs to the workflow's completeness gate, not to this PLAN.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

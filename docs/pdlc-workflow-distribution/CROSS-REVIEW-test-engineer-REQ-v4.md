# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md`
**Date:** 2026-07-27
**Iteration:** 4
**Scope:** testability, edge-case completeness, oracle falsifiability. Not product strategy, not architecture choice.
**Delta base:** `ac2a6e4` (the tree my v3 review was written against) → `ef4d402` (`REQ v4 — content revision`). Diff: +469 / −149 lines.

> **Iteration index.** The orchestrator dispatched this as "iteration 2", but
> `CROSS-REVIEW-test-engineer-REQ-v{1,2,3}.md` all exist on this branch, so this is iteration 4 and
> is filed as v4. This is the third consecutive dispatch with a wrong index (v3 review, F-23(ii)) —
> the guard the author adopted in §10 ("derive the index from the highest cross-review file on the
> branch") is correct and is now also needed on the orchestrator side.

## Delta summary

Unlike v3 this is a genuine content revision: §0 grew from 8 to 12 grounded facts, REQ-DIST-00
gained AC-0.3a / AC-0.6 / AC-0.7, REQ-DIST-02 gained AC-2.7, REQ-DIST-03 gained AC-3.9,
REQ-DIST-05 was rewritten end to end, REQ-DIST-06 gained AC-6.2/AC-6.2a/AC-6.3, AC-4.1's freshness
clause was deleted, NFR-5 moved from POSIX `sh` to bash, and §10 records disposition. I re-reviewed
only the changed sections.

## Disposition of my v3 findings

| v3 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-14 | High | **Resolved** | AC-1.2 adds reason `plugin-artifact-missing`; AC-1.8(i) axes rewritten to `{baseline resolvable} × {plugin bytes} × {consumer bytes} × {equal} × {manifest entry}`; AC-1.8(ii) fixes precedence `unknown > missing > in-sync > unverified > stale > local-edit`; AC-3.1 puts the row in the skip set. I re-derived totality across all axis combinations against that precedence — every combination lands on exactly one of the six states. Satisfiable as stated. |
| F-15 | High | **Resolved** | AC-4.1 deletes the freshness clause and records why, so it cannot be reintroduced; AC-2.7's always-refresh contract plus row 1 (absent/unparseable/`schemaVersion` != 1) supersedes it. Every AC-4.1 row now has an input a test can vary. |
| F-16 | Medium | **Resolved** | AC-0.1 narrowed to "sole authority for the **managed set**"; AC-0.6 makes consumer-directory enumeration report-only, excludes `.pdlc-*` basenames, and bars `not-managed` from `.pdlc-drift-state.json`'s `rows`. No oracle is self-referential. |
| F-17 | Medium | **Resolved in principle** | AC-0.3a makes the maintainer repo's baseline the local `dist/`, so exit 0 / hook silence are reachable on real inputs. The *mechanism* is misstated — see F-02 below. |
| F-18 | Medium | **Resolved** | AC-2.7: one shared writer, invoked by hook, `--check` and sync; whole-file atomic temp+`mv`; §4 corrected. In-session remediation loop closes. |
| F-19 | Medium | **Resolved** | AC-6.2 is an in-`npm test` packaging oracle running on every commit; BL-02 re-gated on AC-6.1+AC-6.2 rather than on a published release. |
| F-20 | Low | **Resolved** | AC-1.1 names `consumerHash` in both rows plus a paragraph making it the single discriminator. |
| F-21 | Low | **Obsolete** | Nothing is extracted from a bundle any more (AC-5.1). |
| F-22 | Low | **Resolved** | §0 row A′ labelled as the tracked pre-feature path; §1 carries both diagrams. |
| F-23 | Medium | **Resolved (author side)** | Version-bump rule stated in the header; §10 records the delta. Orchestrator-side index guard still unmet (see note above) — not the author's to fix, so not re-filed. |
| Q-01–Q-04 | — | Answered (AC-0.6, AC-2.7, AC-4.3 scope paragraph, AC-3.3 asymmetry gloss). |

All ten v3 findings are closed. The findings below are **new**, and all of them live in text this
revision introduced.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The distribution manifest has two mutually exclusive locations, and the entrypoint of every surface in this feature is therefore unplaceable in a fixture.** AC-0.1 and §4 put it at `${CLAUDE_PLUGIN_ROOT}/workflows/distribution-manifest.json`. AC-5.1 emits it at `pdlc/workflows/dist/distribution-manifest.json`, and AC-6.1 / AC-6.2 both name it `dist/distribution-manifest.json`. §0 fact 12 fixes the package root at `pdlc/`, so what actually ships is `${CLAUDE_PLUGIN_ROOT}/workflows/**dist/**distribution-manifest.json` — one directory below where AC-0.1 says the check reads it. §4 asserts "No AC may cite a value absent from this table" and then carries the wrong value itself ("shipped; built to `pdlc/workflows/dist/`" papers over a path change, it does not state one). Consequence: the first read performed by the hook, by `--check`, by sync and by AC-6.2's packaging oracle is at a path I cannot pin, and the fixture for `manifest-absent` vs `manifest-malformed` (AC-1.2, AC-2.4) is unwritable — a test that creates the file at AC-0.1's path against an implementation that reads AC-5.1's path yields `manifest-absent` and *passes* the AC-2.4 fail-open assertion, a textbook false green. Pick one path and state it identically in AC-0.1, AC-5.1, AC-6.1, AC-6.2 and §4. | AC-0.1 vs AC-5.1, AC-6.1, AC-6.2; §4 row 2; §0 fact 12 |
| F-02 | High | Local | **AC-0.3a's maintainer baseline double-nests `pluginPath` and so cannot be implemented or tested as written.** AC-0.1 defines `pluginPath` as *relative to `${CLAUDE_PLUGIN_ROOT}`*, and AC-0.2 fixes the two values as `workflows/dist/orchestrate-dev.bundle.js` / `workflows/dist/orchestrate-queue.bundle.js`. AC-0.3a then says that in the maintainer repo "the baseline is the **local build output** `pdlc/workflows/dist/`". Joining a row's `pluginPath` onto that baseline gives `pdlc/workflows/dist/workflows/dist/orchestrate-dev.bundle.js`, which never exists. For the join to work the maintainer substitution must be **root = `pdlc/`** (the package root, per §0 fact 12), not `pdlc/workflows/dist/`. This is not pedantry: AC-0.3a is the entire fix for my v3 F-17 — it is what makes AC-3.3 exit 0 and AC-2.2 silence reachable on real inputs — and as worded every maintainer-repo row resolves to a nonexistent `pluginPath`, i.e. `unknown` / `plugin-artifact-missing` (AC-1.2) forever, which is the exact failure F-17 filed. Restate AC-0.3a as "the resolved plugin root is `<repoRoot>/pdlc` instead of `${CLAUDE_PLUGIN_ROOT}`; `pluginPath` joins unchanged", and say the same for where the *distribution manifest* is read from in the maintainer repo (F-01 compounds here). | AC-0.3a vs AC-0.1, AC-0.2; §0 fact 12; §4 row `plugin-root resolution` |
| F-03 | Medium | Local | **`retired-present` breaks hook silence but no AC makes the hook say anything, so the state is observable only as the absence of an assertion.** AC-2.2 now conditions silence on "no retired path is present (AC-3.9)". But REQ-DIST-02's warning ACs are exhaustive by state: AC-2.1 covers `stale`/`missing`, AC-2.3 `local-edit`, AC-2.5 `unknown`/`unverified`. A consumer whose managed rows are all `in-sync` but which still holds `.claude/workflows/orchestrate-dev.js` is therefore specified as "not silent" with no specified output — and the natural implementation (an `else` that emits nothing) satisfies every warning AC while violating AC-2.2. This is structurally identical to the v1 F-09 gap that AC-2.5 was written to close. I cannot write the hook test: I have no expected string, no expected reason token, and no way to distinguish "warned about retirement" from "warned about something else". Add an AC-2.x: retired-present warns, is textually distinct from `stale`, names the retired path and the remediation command. | AC-2.2 vs AC-2.1, AC-2.3, AC-2.5; AC-3.9 |
| F-04 | Medium | Local | **AC-6.4's grep oracle is red on the current tree and has no stated exclusion set, so it is either unwritable or will be written to pass vacuously.** AC-6.4 requires "a test asserts it by grepping for the superseded form" over "no file in the repository". Measured at HEAD, `grep -rl '\.claude/workflows/orchestrate-dev\.js'` returns **17 files**, not the two AC-6.4 names: the archived `docs/orchestrate-dev-workflow/` spec set (7 files), `docs/PLAN-pdlc-integration-boundary-gates.md`, four cross-review files in this feature's own directory, **this REQ itself** (§0 rows A″/C, §1's diagram, AC-0.7's `retired` array), and the two generated bundles under `.claude/workflows/`. The shipped distribution manifest will *also* contain the superseded string by construction — AC-0.7 mandates it in `retired`. So the oracle as specified must fail on its own required data. An implementer facing a red grep will narrow the pattern or the path set until it goes green, and the resulting test proves nothing. State the exclusion set normatively (archived `docs/{feature}/` trees, `docs/pdlc-workflow-distribution/`, `.claude/workflows/**`, the `retired` array itself) and state the file set the grep *does* cover, so the test has a falsifying case: add a document stating the superseded convention ⇒ RED. | AC-6.4; AC-0.7 |
| F-05 | Medium | Local | **The queue can never see `retired-present`, so BL-05's worst case is undefended at the seam that halts work.** AC-3.3 makes a retired path present contribute exit `1` — "same class as `stale`: a real, sync-fixable divergence". AC-4.1's table has no such row, and it cannot acquire one: AC-2.6 fixes `rows` at "exactly one entry per manifest row and nothing else", and a retired path is expressly not a manifest row (AC-0.7). So the drift state file is structurally incapable of carrying the fact, and a consumer holding a stale `orchestrate-dev.js` beside a fresh `.bundle.js` proceeds **silently** under AC-4.1's last row. If BL-05 resolves the way AC-3.9 warns it might ("if the legacy `.js` wins … AC-3.9 is a correctness fix and P0 blocking"), that consumer is running the stale artifact and the queue reports all-clear — the precise false green this feature exists to prevent, reintroduced one layer up. Either add a top-level `retiredPresent: [paths]` field to AC-2.6's schema plus an AC-4.1 precedence row, or state explicitly and with reasoning that the queue is not a retirement detector so the test suite records the boundary rather than silently inheriting it. | AC-4.1 vs AC-3.3, AC-2.6, AC-0.7; BL-05 |
| F-06 | Low | Local | AC-1.1's **Given** clause ("a manifest row whose `pluginPath` resolves under `${CLAUDE_PLUGIN_ROOT}` **and whose `consumerPath` exists**") excludes the preconditions of two of the six rows in its own table — `missing` requires `consumerPath` absent, `unknown` requires the baseline unresolvable. A Given/When/Then whose Given contradicts three rows of its Then gives the test author two readings of every negative case. Drop the qualifier: "Given a manifest row, When the check runs, Then …". | AC-1.1 |
| F-07 | Low | Local | AC-3.9 backs up retired files under AC-3.4's rules "with `id` = the retired basename", but AC-3.4's prune rule "never touches a file whose name does not match `{id}.{stamp}[-N].bak` for an `id` **in the current manifest**" — and AC-0.7 states a retired path is *not* a manifest row. Retirement backups are therefore outside the retention rule: unprunable and, strictly, ineligible for the newest-5 invariant a property test would assert over `.pdlc-backups/`. Say whether `retired` basenames count as `id`s for AC-3.4's purposes. | AC-3.9 vs AC-3.4, AC-0.7 |
| F-08 | Low | Local | AC-2.6 emits `pluginVersion` and AC-5.4 requires it in the report, but §4 — which declares "No AC may cite a value absent from this table" — has no row for where the plugin version is read from. The location differs by baseline (`${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` for a consumer, `pdlc/.claude-plugin/plugin.json` under AC-0.3a), and AC-5.3's "renders as `unknown`" covers only `pluginArtifactVersion`/`consumerArtifactVersion`, not `pluginVersion`. Add the §4 row and state the absent-value rendering. | AC-2.6, AC-5.4, AC-5.3; §4 |
| F-09 | Low | Local | AC-3.9's retirement deletes `.claude/workflows/orchestrate-dev.js` and `orchestrate-queue.js`, which are **git-tracked in this repo** (§0: "`git ls-files .claude/` returns all four paths"). So in the maintainer repo the AC-3.3-exit-0 / AC-2.2-silence path is only reachable after a sync run deletes tracked files, and the AC-3.7 idempotence test's result depends on git working-tree state at the time it runs. Note the one-time `git rm` as part of this feature's landing so the test fixture is not silently coupled to it. | AC-3.9; §0 facts 7–8; AC-3.7 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under AC-0.3a, is the **distribution manifest** also read from the local `dist/` in the maintainer repo, or still from `${CLAUDE_PLUGIN_ROOT}`? F-01 and F-02 collapse into one answer if it is the former. |
| Q-02 | Is `.claude/workflows/*.bundle.js` still git-tracked after AC-6.1 makes it a sync target? If yes, `git status` becomes a second, uncontrolled drift signal for the maintainer repo; if no, the `git rm` belongs in scope alongside F-09's. |
| Q-03 | AC-6.2 defines the packaged set as "everything under `pdlc/` minus the repo's ignore rules". `.gitignore` ignores only `node_modules/`, so the packaged set includes `pdlc/workflows/__tests__/`, `package.json` and `package-lock.json`. Is that intended, and does AC-6.2's assertion (a) need a converse — "no build input is packaged" — to have teeth? |

## Positive Observations

- AC-1.8(ii)'s explicit precedence order is what turned the totality property from unsatisfiable (v3 F-14) into mechanically checkable — I re-derived every axis combination against it and the mapping is total and disjoint. That precedence line is the single most valuable sentence added in v4 and must survive verbatim into the FSPEC.
- AC-4.1's "No freshness clause" paragraph does not merely delete the defect, it records *why* the clause had no observable input. That is the right way to prevent a reviewer-fixed hole from being re-dug at FSPEC.
- AC-2.7's atomic temp+`mv` single-writer contract removes the merge rule entirely rather than specifying one — fewer states, and "last complete write wins" is directly assertable.
- AC-3.4's `LC_ALL=C` fixed-width-stamp prune rule with an explicit mtime prohibition makes retention deterministic; the `-N` collision suffix closes the same-second case a property test would otherwise find.
- NFR-2 now tells the reader not to write a timing test, and says why. That is a rare and correct piece of anti-guidance.
- §0's twelve measured facts, each with hashes and file:line citations, made this the first iteration where I could verify claims against the tree instead of taking them on trust. §0 fact 9 in particular corrects a mechanism the previous two versions asserted backwards.

## Recommendation

**Needs revision**

Blocking changes before FSPEC:

1. **F-01** — one location for `distribution-manifest.json`, stated identically in AC-0.1, AC-5.1, AC-6.1, AC-6.2 and §4.
2. **F-02** — restate AC-0.3a as a *plugin-root* substitution (`<repoRoot>/pdlc`) so `pluginPath` joins without double-nesting; this is the only thing making the maintainer green path reachable.
3. **F-03** — add the hook AC for `retired-present`, with a distinct message and reason token.
4. **F-04** — give AC-6.4's grep a normative exclusion set and covered file set; as written it is red on 17 files at HEAD including this REQ and the manifest's own `retired` array.
5. **F-05** — either carry `retired-present` into AC-2.6's schema and AC-4.1's precedence table, or state the queue's non-coverage of it as a documented boundary.

Low findings F-06–F-09 fold into the same revision but do not independently gate.

VERDICT: Needs revision
{"high": 2, "medium": 3, "low": 4}

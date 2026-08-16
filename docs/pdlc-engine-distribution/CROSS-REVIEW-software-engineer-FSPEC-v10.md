# Cross-Review: software-engineer — FSPEC (round 10, frozen round)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 10
**Scope:** Delta only. FSPEC moved 0.7 → 0.8 (`730aa0b6`, `063fdd39`, `c7267d28`) since the v9
confirmation at `e63bcad0`. Decision freeze in force: only a defect this delta introduced, or a
load-bearing claim false at HEAD, can block. Settled sections not re-litigated.

## 1. What changed

`git diff e63bcad0..HEAD` on the FSPEC: 36 insertions, 21 deletions, in seven places — front-matter
upstream cell and version row plus a 0.8 changelog paragraph; a 0.7 changelog correction; F-5
step 2's "absent" gloss; BR-7.1's plural tail; BR-7.6 moved above BR-7.7; BR-8.2 and E-22 renamed
to **Workflow members**; AT-1.6's value-comparison conjunct; AT-3.4's two new set-equalities.

## 2. Verification against HEAD

Every load-bearing claim the delta introduces was checked in the tree, not in documents:

- **Upstream pointer now correct.** `REQ v0.12, 3605092b` — `3605092b` is in fact the last commit
  touching the REQ (`git log -1 -- REQ-…md`), and the REQ's own version row reads `0.12`. The
  parenthetical `v0.11 re-grounded 2026-08-13, 01c27ee4` also now matches: `01c27ee4` is dated
  2026-08-13, where v9's text said 2026-08-14. My v9 `F-01` is resolved, and resolved with the
  date defect fixed rather than merely the hash bumped.
- **F-5's dated baseline is true.** `git ls-tree 89babe8e .github/workflows/` returns exactly
  `pr-tests.yml`; `89babe8e` is dated 2026-08-13. Rewriting "Nothing of this kind exists at HEAD"
  into a dated observation was the right repair — the present-tense form is false at today's HEAD,
  which now holds three files.
- **F-5 step 2's path-filter carve-out matches the shipped workflows.** `fixture-machine.yml:19-23`
  declares `pull_request:` with a `paths:` filter on `pdlc/engine/**`, so a PR outside those paths
  legitimately never runs it; `publish.yml:151-183` carries a fixture-machine leg that runs the
  commands directly at the tag. The spec sentence and the two files agree.
- **AT-3.4's two new conjuncts have carriers at HEAD.**
  `pdlc/engine/__tests__/ci-arrangement.test.js:552` re-derives §5.1's file scope from the files'
  own `on:` blocks (`isPullRequestTriggered`, `:92-105`, reading only the top-level block), and
  `:666` asserts the `publish.yml`/PR-gate gate-command set-equality. Both are set-equalities over
  full enumerations, not containment: a deleted member fails.
- **BR-7.1's plural tail is now accurate.** "any addition to **either file** fail" matches
  `PR_GATE_FILES` (`ci-arrangement.test.js:65-68`), which keys `pr-tests.yml` and
  `fixture-machine.yml`. The `~16` step-level `name:` figure is hedged and holds (22 `name:`
  occurrences total, 6 of them file/job-level).
- **AT-1.6's value comparison is the correct oracle.** `buildBanner`
  (`pdlc/engine/lib/handshake.mjs:208-210`) emits `pdlc-engine v${engineVersion}` and
  `plugin: pdlc v${pluginVersion ?? "not found"}`, so a text comparison against the version query
  would have been red on the `v` alone. Comparing values, not rendered text, is what the shipped
  banner actually permits.
- **0.7's changelog correction is true.** `8980ffe7` touches PLAN and PROPERTIES, which is what the
  sentence now claims the routed errata were discharged in.
- **BR-7.6/BR-7.7 ordering** is now numeric, and no count word (`five`/`six`) survives anywhere in
  the FSPEC — membership reads as trigger-derived throughout, consistent with REQ v0.12's O-B.

## 3. Findings

No High findings. Nothing in this delta broke anything that worked at v9, and no delta sentence
contradicts HEAD. One Low precision nit, delta-introduced, non-gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Local | **AT-1.6's parenthetical over-generalises the `v` prefix.** The clause reads "(the banner prefixes each with `v`)", but the triple's middle member — the declared compat range — is rendered `(engine requires ${pluginCompat})` with no prefix (`handshake.mjs:210`), and a range literal such as `^0.23.0` would not take one. Only the engine and plugin versions are `v`-prefixed. The conjunct itself is right and the oracle it licenses is right; only the stated *reason* is broader than the code. "(the banner `v`-prefixes the two version members)" would be exact. Costs nothing to carry as-is — the test compares values either way. | `FSPEC` AT-1.6 |

Carried forward from v8/v9 and untouched by this delta, still non-gating: `F-02` (two obligations
without their own AT row), `F-04` (BR-7.7 numbered out of order — **now resolved** by `063fdd39`),
`F-05`–`F-07` (v7 carry-forwards). v9's `F-01` is closed.

DEFERRED: AT-1.6's `v`-prefix parenthetical is broader than `buildBanner` — fold the exact wording in at the next FSPEC touch.

## 4. Questions

None. The one open question from v9 (`Q-01`, how Phase PUB treats a path-filtered row-6 non-run)
is answered in this delta by F-5 step 2's new sentence and BR-7.7.

## 5. Positive Observations

- **The stale-pointer class was fixed, not just the instance.** The upstream cell now carries both
  the current version/commit and the prior re-grounding, with the prior date corrected. That is the
  shape that survives the next erratum instead of going stale again.
- **Dating the baseline is the durable repair.** "Nothing of this kind exists at HEAD" was a
  sentence guaranteed to rot the moment this feature landed its own workflow file; "existed at
  feature start (`89babe8e`, 2026-08-13)" cannot rot at all. Same move §5.1's BR-7.1 made for file
  scope and REQ v0.12's O-B made for the check count — three sites, one doctrine, now uniform.
- **AT-1.6's repair names the failure mode it prevents.** Comparing rendered text would have been
  red on the banner's `v`, and the spec now says so inline, so the next author cannot re-tighten it
  back into a text comparison by accident.
- **AT-3.4 grew conjuncts that already have real oracles.** The file-scope and gate-command
  set-equalities are not aspirational: both are live tests that re-derive from the workflows' own
  triggers rather than from a hand-maintained list, so a new PR-gating file cannot join the repo
  without joining §5.1.

## 6. Recommendation

**Approved with minor changes** — the delta is well-grounded and self-consistent, and every claim
it makes about the repository is true at HEAD.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

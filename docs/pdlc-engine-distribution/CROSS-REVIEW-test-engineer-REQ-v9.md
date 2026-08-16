# Cross-Review: test-engineer — REQ (delta re-review, frozen round)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md
**Date:** 2026-08-16
**Iteration:** 9
**Scope:** Delta only. Diff `20c87cd3..HEAD` on the REQ is a single hunk, +11/-0, at
`REQ:194-204` — a new NG-5 sub-bullet recording the engine's own version bump. Bytes
approved at v8 are not re-litigated; this pass checks the new bullet's factual claims
against HEAD and checks that no approved oracle was weakened.

## Routed items

| Item | Landed? | Evidence |
|---|---|---|
| CODE_REVIEW v4 §3-1: HEAD claimed `0.1.0`, a number already published as immutable bytes; REQ should record the bump and the guard | **Yes** | `REQ:194-204` records `pdlc/engine/package.json` 0.1.0 → 0.2.0, names the guard test, and is explicit that this is *not* itself an NG-5 exception (version number, not pipeline semantics) |

## Delta checks

1. **Version claim true at HEAD.** `pdlc/engine/package.json:3` is `"version": "0.2.0"`.
2. **Published-set claim true.** `docs/pdlc-engine-distribution/EVIDENCE-BR-3.9.md:7-8`
   records `@kaneho/pdlc-engine@0.1.0` from tag `engine-v0.1.0` at commit
   `30773d0cf5399b5c2191ea0d76a29851cb99e09f`. The bullet's assertion that the evidence
   file is a dated record and was not edited holds: the diff touches only the REQ.
3. **"Packed members changed after publish" is true, not asserted.**
   `git log 30773d0c..HEAD -- pdlc/engine/bin pdlc/engine/lib pdlc/engine/scripts/postinstall.mjs`
   returns ten commits including `1e910919` (T48), `6ae256b3` (T46), `10659774`, `57345f02`,
   `2bf0efae`, `3605092b`. The named task ids are consistent with the log.
4. **The guard exists and does what the sentence says.**
   `pdlc/engine/__tests__/version-skew.test.js:78` asserts `!published.has(pkg.version)`
   (the "equals" arm) and `:94` asserts `compareSemver(pkg.version, highest) === 1`
   (the "fails to exceed" arm). Both arms are positive assertions on a named value, not
   absence-only oracles: the failure messages name the offending version and the recorded
   published set. Suite run at HEAD: 3/3 pass.
5. **The guard is in the CI gate, not merely in-tree.** `pdlc/engine/package.json:21`
   `"test": "node __tests__/_run-suite.mjs"`, and the runner spawns `node --test` over the
   whole `__tests__/` directory (`_run-suite.mjs:50-52`) — directory discovery, so the new
   file is collected by the `Engine tests (ubuntu-latest)` required check with no
   registration step to forget. The REQ's word "mechanically" is earned.
6. **No approved oracle weakened.** The hunk is purely additive inside NG-5's recorded-
   exception list; AC-2.1/AC-2.2's testable surface is unchanged, and the sibling
   plugin-side bullet (`REQ:184-193`, `plugin.json` 0.23.0 → 0.23.1, verified at
   `pdlc/.claude-plugin/plugin.json:4`) still reads true, with `pdlcPluginCompat: "^0.23.0"`
   (`pdlc/engine/package.json:18`) still containing it.
7. **NG-5 scope claim is honest.** The bullet declines to call itself an exception and says
   why. That is the correct reading: a manifest version is not phase graph, review bar,
   completeness criterion, queue lifecycle or report shape. It does not widen NG-5.

DEFERRED: `publishedVersions` harvests `engine-vX.Y.Z` from *any* tracked `EVIDENCE-*.md` prose, so a future evidence file that names a planned-but-unpublished tag would red the gate before that tag exists; consider narrowing the harvest to a declared field rather than free prose.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | None. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The bullet does the thing this round exists to reward: it states a fact, then names the
  test that keeps the fact from going stale silently. A prose-only "we bumped it" note
  would have gone stale at the next publish; `version-skew.test.js` makes the next
  recurrence red instead of unnoticed, and it does so hermetically (tracked evidence, no
  registry call), so the gate stays deterministic per FSPEC §5.1's CI-determinism premise.
- Both guard arms are needed and neither is redundant: equality catches re-claiming a
  published number, ordering catches a downgrade where `@latest` would resolve to bytes
  newer than HEAD. Testing the two separately means a regression names which one broke.
- Declining to edit `EVIDENCE-BR-3.9.md` is the right call and is stated as such — the
  evidence is a dated observation, and the oracle depends on it staying that way.

## Recommendation

**Approved**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

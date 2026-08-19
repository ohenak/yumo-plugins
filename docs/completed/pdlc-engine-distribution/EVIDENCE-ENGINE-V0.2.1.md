# EVIDENCE-ENGINE-V0.2.1 — the pdlc-plugin-retirement successor-tag publish

**Task:** RELEASE-CHECKLIST §7's pattern, applied to the retirement release.
**Criterion:** the engine changes merged by PR #65 (`pdlc-plugin-retirement`) are published to the
registry under a successor tag, and the manifest version moves strictly past the published value
in the same change (`version-skew.test.js`).
**Recorded:** 2026-08-19.

Published package: **`@kaneho/pdlc-engine@0.2.1`**, from tag **`engine-v0.2.1`** at commit
**`168fc83726536fbc67866ea44fc0c0475ea7a237`** on the default branch `main`, two commits after
the PR #65 merge commit (`6b12b6e8`).

## 1. Tag cut and published

- Tag `engine-v0.2.1` was first cut at `2c802df1` and the publish run **failed at the gate**:
  the engine suite's T01 pre-flight baseline gate resolved its "pre-sweep ancestor" via
  `git merge-base origin/main HEAD`, which degenerates to HEAD itself once the sweep is merged
  to main — so swept baseline paths failed both arms. The gate was re-semanticized to the
  history arm (`git rev-list -1 HEAD -- <path>` — path exists at HEAD or was ever tracked in
  HEAD's history) in `168fc837`, and the tag was deleted and re-cut there. Nothing had been
  published by the failed run (the Publish job was skipped).
- Two shallow-checkout fixes ride in this release's history: `3ecdad06` (pr-tests.yml Engine
  tests job) and `2c802df1` (publish.yml gate job) both add `fetch-depth: 0`, which the
  pre-flight gate's history queries require.
- Publish workflow run at `168fc837`: **success** (Gate → Preflight → Publish all green).

## 2. Registry verification

```
$ npm view @kaneho/pdlc-engine version pdlcPairing
version = '0.2.1'
pdlcPairing = {
  engineVersion: '0.2.1',
  pluginCompat: '^0.23.0',
  pluginVersionAtTag: '0.23.2',
  tag: 'engine-v0.2.1',
  commit: '168fc83726536fbc67866ea44fc0c0475ea7a237'
}
```

## 3. Same-change version bump

`pdlc/engine/package.json` bumped `0.2.1` → `0.2.2` in the same commit that adds this file,
keeping HEAD's manifest strictly ahead of every published version this directory records
(`version-skew.test.js` harvests them from tracked `EVIDENCE-*.md` files).

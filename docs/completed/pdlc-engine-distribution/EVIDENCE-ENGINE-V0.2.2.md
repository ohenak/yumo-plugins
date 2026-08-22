# EVIDENCE-ENGINE-V0.2.2 — the plugin-0.23.3 pairing publish

**Task:** RELEASE-CHECKLIST §7's pattern, applied to the 0.23.3 plugin-advertise release.
**Criterion:** the engine bytes at the `engine-v0.2.2` tag are published to the registry, and the
manifest version moves strictly past the published value in a follow-up change
(`version-skew.test.js`).
**Recorded:** 2026-08-22.

Published package: **`@kaneho/pdlc-engine@0.2.2`**, from tag **`engine-v0.2.2`** at commit
**`114204612474483777701b8f3505b9a412de72b1`** on the default branch `main` — the PR #67 merge
commit (`chore-plugin-version-0.23.3`), which advertised plugin `0.23.3` alongside the engine's
already-bumped `0.2.2` manifest (bumped in `5a080c7a`, the EVIDENCE-ENGINE-V0.2.1 commit).

## 1. Tag cut and published

- Tag `engine-v0.2.2` cut at `11420461` and pushed 2026-08-20; the publish workflow ran green
  first try (Gate → Preflight → Publish), registry `modified` timestamp
  `2026-08-20T15:33:13.802Z`.

## 2. Registry verification

```
$ npm view @kaneho/pdlc-engine version pdlcPairing
version = '0.2.2'
pdlcPairing = {
  engineVersion: '0.2.2',
  pluginCompat: '^0.23.0',
  pluginVersionAtTag: '0.23.3',
  tag: 'engine-v0.2.2',
  commit: '114204612474483777701b8f3505b9a412de72b1'
}
```

## 3. Version bump

Unlike the 0.2.1 record, the bump past the published value did not ride in the publish's own
change: `pdlc/engine/package.json` stayed at `0.2.2` after the tag, and this file is being
recorded belatedly by the successor release — whose same commit bumps the manifest
`0.2.2` → `0.2.3`, restoring HEAD's manifest strictly ahead of every published version this
directory records (`version-skew.test.js` harvests them from tracked `EVIDENCE-*.md` files).

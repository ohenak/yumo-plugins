# EVIDENCE-ENGINE-V0.2.3 — the plugin-0.23.4 pairing publish

**Task:** RELEASE-CHECKLIST §7's pattern, applied to the 0.23.4 plugin-advertise release.
**Criterion:** the engine bytes at the `engine-v0.2.3` tag are published to the registry, and the
manifest version moves strictly past the published value in a follow-up change
(`version-skew.test.js`).
**Recorded:** 2026-08-26.

Published package: **`@kaneho/pdlc-engine@0.2.3`**, from tag **`engine-v0.2.3`** at commit
**`4d11b9c9f8e661edbf2e78913fa08facdc81e3bc`** on branch `main` — the PR #71 merge commit
(`chore-engine-v0.2.3`), which advertised plugin `0.23.4` alongside the engine manifest's bump
to `0.2.3` in the same change (the EVIDENCE-ENGINE-V0.2.2 commit).

## 1. Tag cut and published

Tag `engine-v0.2.3` cut at `4d11b9c9` and pushed 2026-08-22; the publish workflow ran green
first try (Gate → Preflight → Publish, run 32563403376), registry `modified` timestamp
`2026-08-22T09:04:04.346Z`.

## 2. Registry verification

```
$ npm view @kaneho/pdlc-engine version pdlcPairing
version = '0.2.3'
pdlcPairing = {
  engineVersion: '0.2.3',
  pluginCompat: '^0.23.0',
  pluginVersionAtTag: '0.23.4',
  tag: 'engine-v0.2.3',
  commit: '4d11b9c9f8e661edbf2e78913fa08facdc81e3bc'
}
```

## 3. Version bump past the published value

Like the 0.2.1 record and unlike the 0.2.2 one, the manifest bump to the published version rode
in the publish's own change: PR #71 moved `pdlc/engine/package.json` from `0.2.2` to `0.2.3`
and the tag was cut at its merge commit, so after the tag HEAD's manifest equalled the
published value. This file is being committed together with the follow-up bump `0.2.3` →
`0.2.4`, restoring HEAD's manifest strictly ahead of every published version this directory
records (`version-skew.test.js` harvests them from tracked `EVIDENCE-*.md` files). The next
tag, when cut, follows the `0.2.4` manifest by RELEASE-CHECKLIST §7's pattern; deliberately, no
tag name or packaged-version string for it appears in this file — the harvester reads
`engine-v{X.Y.Z}` and `@kaneho/pdlc-engine@{X.Y.Z}` mentions as published facts, and `0.2.4`
is not published as of this recording.

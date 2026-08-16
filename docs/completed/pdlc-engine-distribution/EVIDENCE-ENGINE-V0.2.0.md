# EVIDENCE-ENGINE-V0.2.0 — the successor-tag publish

**Task:** RELEASE-CHECKLIST §7. **Criterion:** the post-merge successor-tag cut and publish
that discharges REQ AC-2.1/AC-2.2 (CODE_REVIEW v5 §2 rows 1–2), the README's "until a
successor tag is cut" caveat, and `docs/_queue/QUEUE.md` row 23
(`pdlc-engine-v0.2.0-release`, CODE_REVIEW v5 §3-1).

**Recorded:** 2026-08-16. Published package: **`@kaneho/pdlc-engine@0.2.0`**, from tag
**`engine-v0.2.0`** at commit **`a9885dc86bc52b3ac5e55e1aa5d32da3046e2c3e`** — the merge
commit for PR #63 (`pdlc-engine-distribution`), on the default branch `main`.

## 1. What was cut and published

- Tag `engine-v0.2.0` was cut at the merge commit `a9885dc86bc52b3ac5e55e1aa5d32da3046e2c3e`
  and pushed, per RELEASE-CHECKLIST §7's first checklist item.
- `.github/workflows/publish.yml` ran green for the tag push on 2026-08-16 — the workflow
  re-runs the PR gate checks at the tag before publishing, per
  `pdlc/engine/scripts/publish-preflight.mjs`.
- The publish job completed successfully; the package was published to the public npm
  registry under the `@kaneho` scope (DEC-DIST-06), MIT licence (DEC-DIST-07).

## 2. Registry read-back (AC-1.5's operator path, no download or install)

```
$ npm view @kaneho/pdlc-engine version
0.2.0
$ npm view @kaneho/pdlc-engine pdlcPairing
{ engineVersion: '0.2.0',
  pluginCompat: '^0.23.0',
  pluginVersionAtTag: '0.23.1',
  tag: 'engine-v0.2.0',
  commit: 'a9885dc86bc52b3ac5e55e1aa5d32da3046e2c3e' }
```

The commit reported in `pdlcPairing` matches the tag target exactly, and `pluginCompat`
(`^0.23.0`) is satisfied by `pluginVersionAtTag` (`0.23.1`) — the pairing record is
internally consistent (REQ AC-1.5).

## 3. What this discharges

- **REQ AC-2.1/AC-2.2** (CODE_REVIEW v5 §2 rows 1–2): HEAD's engine version no longer
  claims a version number already recorded as published. This record, combined with the
  follow-on manifest bump to `0.2.1` (same commit as this evidence file, per
  `version-skew.test.js`'s requirement that HEAD stay strictly ahead of every published
  version harvested from tracked `EVIDENCE-*.md` files), closes the residue that
  `version-skew.test.js` and RELEASE-CHECKLIST §7 existed to track.
- **`pdlc/README.md`'s "until a successor tag is cut" caveat**: `@latest` now resolves to
  `0.2.0`, the bytes published from `engine-v0.2.0`, which include this feature's full pin
  ladder, doctor routing and launcher hop. The caveat prose was updated in the same change
  that adds this evidence file to state that `0.2.0` is live.
- **`docs/_queue/QUEUE.md` row 23** (`pdlc-engine-v0.2.0-release`): set to `done`, with an
  Evidence note naming the `engine-v0.2.0` tag and this file, in the same change.

## 4. Stated limit

This is a dated, one-time record of the `engine-v0.2.0` successor-tag publish. It does not
claim anything about future publishes; the next release act (whenever `pdlc/engine` next
changes shipped bytes) needs its own dated evidence file, the way this one followed
`EVIDENCE-BR-3.9.md`'s precedent for `engine-v0.1.0`.

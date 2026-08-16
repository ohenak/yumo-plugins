# EVIDENCE-BR-3.9 — the one-time real-channel publish

**Task:** PLAN T52. **Criterion:** BR-3.9's one-time real-channel publish, recorded and dated:
tag pushed, gate and preflight green, pairing record readable via
`npm view … pdlcPairing` (AT-3.1's real-channel leg, REQ AC-1.5's published pairing record).

**Recorded:** 2026-08-16. Published package: **`@kaneho/pdlc-engine@0.1.0`**, from tag
**`engine-v0.1.0`** at commit **`30773d0cf5399b5c2191ea0d76a29851cb99e09f`** on branch
`feat-pdlc-engine-distribution`. Publishing workflow run:
<https://github.com/ohenak/yumo-plugins/actions/runs/31921705766> — conclusion `success`.
Performed by Claude (Fable 5) at the operator's request; the operator personally provisioned
every credential and account resource (npm token via `gh secret set NPM_TOKEN`, npm
organization `kaneho`).

## 1. What the run proved (F-5 / §8.4's fixed sequence, observed live)

1. **Preflight (PF-1…PF-5)** green on the unmutated tree (~10 s): tag/version agreement,
   plugin-compat range (`^0.23.0` vs plugin `0.23.0`), publishable manifest against
   DEC-DIST-06's recorded scope, packed-set equality on a real `npm pack`, vendor-manifest
   hashes.
2. **Gate (the five PR-gate job bodies re-run at the tag)** green on `ubuntu-latest`
   (~2 m) — including the engine suite, which requires the per-platform M-ENG-09
   guard-deny row; the linux row was measured live for this release (see §3).
3. **Publish job:** pairing record written into the packed manifest (O-6's single writer),
   prepack vendored the workflow modules, PF-4/PF-5 re-asserted over the packed tarball,
   then the channel published with `--access public`. No human step inside the run.
4. **Registry read-back (AC-1.5's operator path, no download or install):**

   ```
   $ npm view @kaneho/pdlc-engine version
   0.1.0
   $ npm view @kaneho/pdlc-engine pdlcPairing
   { engineVersion: '0.1.0',
     pluginCompat: '^0.23.0',
     pluginVersionAtTag: '0.23.0',
     tag: 'engine-v0.1.0',
     commit: '30773d0cf5399b5c2191ea0d76a29851cb99e09f' }
   ```

## 2. Tag history (recorded because the tag moved before any publish)

The tag was created three times before the successful run, each time re-pointed **before
anything had been published against it** (npm's immutability was never in play; version
0.1.0 was first consumed by the successful publish):

| Tag target | Why it moved |
|---|---|
| `2ff9cc11` | First run: gate red — no linux M-ENG-09 row (by design; see §3) |
| `8beb2661` | Linux row recorded; publish step then failed on npm's scoped-tarball filename-report variant |
| `f05f38a2` | `tarballPathFromPackResult` fixed; publish step still failed — `runPublish` synthesized the channel argument instead of using the resolved path |
| `30773d0c` (final) | `tarballPath` threaded through `runPublish`; published from here |

Two real defects in the publish path were found and fixed by this release attempt
(commits `f05f38a2`, `30773d0c`), each with hermetic regression tests, including the
previously missing assertion on exactly which path the channel is handed.

## 3. Operator steps consumed by this release (out of band, as designed)

- **M-ENG-09 linux measurement:** run live on `Linux aarch64` (Docker `node:20`, non-root,
  real agent-sdk dispatch, deny fired), row `| 2026-08-16 | linux | agent-sdk | 0.3.226 |
  yes |` recorded in `docs/_constraints/pdlc-engine-baseline.md` (commit `8beb2661`).
- **npm credentials:** `NPM_TOKEN` repo secret set by the operator (three iterations: the
  first token was OTP-bound, per the account's 2FA-for-writes setting; the final token
  bypasses 2FA for automation). The first token attempt was exposed in a session
  transcript and was flagged for revocation.
- **npm scope:** the `@kaneho` scope did not exist on the registry (`404 Scope not found`
  on first authenticated publish); the operator created the `kaneho` organization, after
  which the publish succeeded with no further changes.

## 4. Stated limit

This is a dated, one-time record of BR-3.9's real-channel leg. The repeatable halves —
green-gate-⇒-publish, collision refusal, sentinel absence, tag/range agreement — are
continuously asserted over the stub channel (`publish-channel.test.js`); nothing re-runs
the real-channel publish, and this document does not claim the channel's future behaviour.
T52 owns exactly this file.

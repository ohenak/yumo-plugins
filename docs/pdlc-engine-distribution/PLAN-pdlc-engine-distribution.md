# PLAN — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `FSPEC-pdlc-engine-distribution.md` (v0.2), `TSPEC-pdlc-engine-distribution.md` (v0.11), `DECISIONS-pdlc-engine-distribution.md` (v0.3) |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase P) | Claude | 0.1 | 2026-08-13 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft |

## 1. Summary

### 1.1 What gets built

Five streams of work, each traceable to a TSPEC section, landing in one branch:

| Stream | What lands | TSPEC |
|---|---|---|
| A — Version resolution | `lib/store.mjs`, `lib/resolve-version.mjs`, the three-way `readEngineConfig`, the two-root workflow-module resolver, the inert `UpdateProbe`, and the twelve catalogue ids they emit | §6, §10.1, §10.3 |
| B — Launcher | The E-4b split (`bin/pdlc.mjs` becomes a dependency-free Node-floor guard; the body moves to `bin/cli.mjs` with an exported `main(argv, deps)` and an exported five-key `deps` seam), then the resolution entry, the `spawnSync` hop, and the `--version`/`doctor` resolve-but-never-refuse exemption | §6.2, §9.3 |
| C — Packaging & publish | Manifest edits, `prepack` vendoring plus `.gitignore`/`.npmignore`, `postinstall` store population, the restated anti-fork oracle (AF-1…AF-3), the packed-set equality (PF-4), the two READMEs, and `.github/workflows/publish.yml` with PF-1…PF-5 | §5, §8, §9.1, §9.2 |
| D — Provenance carriers | `lib/provenance.mjs`, the `_provenance` seam on **both** workflow modules, AC-5.3's four kinds across five commit helpers and five `rewriteStatus` routes, §7.4's `artifactPaths` classes 7–11, the `devInjection`/`queueInjection` wiring, and the regenerated `dist/` bundles | §7, §12.1 |
| E — Fixture machine & manual | The install/upgrade legs, the launcher pass-through and signalled-child legs, AT-2.5 on a below-floor image, and the two `[manual]` recorded observations | §12.1, §12.3 |

### 1.2 What is deliberately **not** built here

Per TSPEC §14.3: AC-6.2's bundle-side load root (N-1), BL-03's transcription (N-3), the
range-widening cadence (N-4) and M-ENG-10's change-control tail (N-5). Two operator
obligations *are* scheduled, as gate tasks rather than code tasks: the npm scope (N-6, T02)
and the licence (N-2, T05).

### 1.3 Three properties this plan is arranged around

1. **The catalogue is a shared serialisation point.** `pdlc/engine/lib/catalogue.mjs` is
   written by six tasks (T28, T32, T37, T41, T43, T45). The suite-wide equality
   (`__tests__/_assert-suite-wide.mjs:196-210`, verified at HEAD) fails on a **registered but
   never emitted** id, so TSPEC §10.3 forbids `[Fake first]` registration ahead of emitters.
   Each of the six therefore registers its ids **and** ships their emitter, and the six sit in
   six consecutive batches (3, 4, 5, 6, 7, 8) so no batch has two writers of that file.
2. **The two workflow modules are the other serialisation point.** `orchestrate-dev.js` has
   four writers (T29, T35, T38, T42) and `orchestrate-queue.js` three (T30, T36, T39); each set
   is spread across distinct batches with real `Deps` edges, never prose.
3. **Wiring is asserted at the level that introduces it.** The three engine-side levels TSPEC
   §12.1 names — module-side, production-path and process-entry — are separate tasks with
   separate red rows, because a green module-side suite is exactly what a `builder-not-wired`
   defect looks like (§7.2).

### 1.4 Status key

⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

## 2. Task list

## 3. File-ownership manifest

## 4. Task dependency notes

## 5. Integration points

## 6. Batch-safety rules honoured

## 7. Definition of Done

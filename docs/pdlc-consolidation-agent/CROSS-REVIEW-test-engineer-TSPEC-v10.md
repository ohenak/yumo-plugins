# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md (v2.0)
**Date:** 2026-08-07
**Iteration:** 10
**Type:** Delta re-review
**Scope:** the diff `569578d0..HEAD` (the v1.8 bytes I reviewed at v9 → the v2.0 mechanism change).
Sections outside that diff are not re-reviewed and stand approved from v8/v9.

## 1. Prior findings — disposition

Each was checked against the sources it turns on, not against the document's account of them.

| ID (v9) | Sev | Disposition | Evidence I re-derived |
|---|---|---|---|
| F-01 | High | **Resolved — at the mechanism, not by disclosure** | §7.3 adopts the `RELEASED:` sentinel. `parseMarker` now accepts two forms and returns a `state` discriminant (`TSPEC:943-955`); `markerVerdict` maps `released` ⇒ `free` **without consulting the age** (`:956-961`); `releaseMarker` writes `RELEASED: {passId} {ISO-8601}` (`:977`). Both AT-M11 fixtures are now satisfiable at this layer and the erratum raised from §12.3's cell is withdrawn (`:2497`). The upstream is exactly as cited: `FSPEC:2585` BR-14a ("in-place write of `RELEASED: …` — never by removing the file … taken like an absent one, at any age, with no reason code"), `FSPEC:2679` E-11b, `FSPEC:2678` E-11, `FSPEC:435-436` the lifetime rows, `FSPEC:476` the `RELEASED:` outcome row. §7.3's approved premise survives untouched — `grep -c "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` is still `0`, and a sentinel write needs no unlink. |
| F-02 | Medium | **Resolved** | §13.3's marker bullet is re-cast as closed (`:2645-2660`): it names BR-14a / E-11b / E-11, states the product answer in terms (*must the log witness a pass that died inside its own take? — yes*), and tells the PLAN not to re-raise the erratum. The companion §13.1 row 13 (`:2590`) is re-decided in the same direction, and §13.3's DECISIONS bullet (`:2608-2612`) restates row 13's new alternative set. No text anywhere in the document still hands the question downstream — I grepped `zero-byte`, `empty marker`, `file_empty`, `row 4a` and `released form` and every hit is on the new side. §10.3's rows 4/4a are collapsed into one reclaim row (`:1940`) with no dangling cross-reference left to 4a. |
| F-03 | Medium | **Resolved, and the arithmetic now closes** | §12.2's `CLAUDE.md` row (`:2450`) names the exclusion — the enumeration **minus `distribution-manifest.json` itself**, set-equal to the manifest's `rows[]` read as `pdlc/` + `pluginPath`. Verified at HEAD: `rows[].id` is exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`, and `pluginPath` is repo-relative-minus-`pdlc/` (`workflows/dist/orchestrate-dev.bundle.js`), so the stated join is the right one. Post-feature both sides are four members — §3.2's row (`:170`) adds both the `consolidate-learnings.bundle.js` bullet and the missing `pdlc-cli.mjs` one, and this feature's `bundles` row adds the matching manifest row (`:162`). Set equality is achievable on correct code, and it stayed set equality rather than degrading to containment. |

Two structural properties of a mechanism change this size, checked because they are what such a
change usually gets wrong:

- **Nothing downstream of §7.3 still assumes the old form.** T-13's conjunct (ii) (`:1881`), §12.2's
  release-across-the-status-set row (`:2447`) and §10.1's step-16 comment (`:1856`) all now read the
  sentinel; the take-side read-back conjunct gained `parsed.state === "in-progress"` and added a
  `RELEASED:` line to its failed-take list (`:1067-1068`, `:1079`). No oracle in the document is
  stated against `""` any more.
- **The register was not perturbed.** I re-extracted the `AT-…` ids from FSPEC §13 and from §12.3
  and diffed both directions: **empty, 99 each side**. The delta re-labels prose and retires two
  `(no FSPEC AT)` cases into ids already assigned; it mints, moves and drops nothing.

## 2. Findings

## 3. Questions

## 4. Positive Observations

## Recommendation

## Verdict

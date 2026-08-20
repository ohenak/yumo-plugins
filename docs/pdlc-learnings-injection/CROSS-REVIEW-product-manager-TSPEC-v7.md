# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 7

**Scope — delta re-review, frozen round.** TSPEC moved this round: `sha256:72712bd8…` (the state
reviewed at v6) → `sha256:eff5a19b…` at HEAD, version 0.5 → 0.6, across 13 commits
(`6e2d3f17` … `ccc739d1`), +251/−139 lines. Upstream is unmoved since v6 and therefore is a stable
oracle for this round: REQ `sha256:ff605dd3…` (v0.9) and FSPEC `sha256:256537d8…` (v0.9), both
byte-identical to the hashes my v6 recorded. Every claim below is checked against the diff
`850efa47..HEAD` and, where it asserts repository behaviour, against `pdlc/workflows/` at HEAD
rather than against the TSPEC's prose.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (v6) — §I.2 gate contradicted REQ v0.9 AC-5.1a/AC-5.1b | High | **Resolved** | The gate is now `config.enabled` alone: "There is no `present` conjunct and no `!sectionMalformed` conjunct … a malformed section fails **open**" (`TSPEC:441-446`); `grep "present &&"` over the document returns nothing. The divergence row now reads "an absent section leaves `enabled` at that declared default, so the feature ships **on** in a bare repository" (`TSPEC:439`), transcribing `REQ:223` and AC-5.1a's "there is no second gate key" (`REQ:378-385`). The config-state table is now four rows with the two corrected outcomes — absent/enabled ⇒ key **present**, malformed ⇒ key **present** + `NTC-MALFORMED` (`TSPEC:464-467`) — and their AT ownership matches FSPEC v0.9 row-for-row: E-21 ⇒ AT-32, E-22 ⇒ AT-31, E-23 ⇒ AT-32, E-34 ⇒ AT-32 (`FSPEC:716-722`). §I.4's byte-identity claim is narrowed to explicitly-`false` runs, with "A bare repository and a malformed section are *not* disabled states" stated in the same breath (`TSPEC:551-556`). `OQ.2` and `ERR-4` are closed as settled upstream, not silently deleted (`TSPEC:1227-1244`, `TSPEC:1271-1278`). |
| F-02 (v6) — record locus stated run-level against REQ v0.9 AC-3.2/AC-3.3 | High | **Resolved** | §A.5's rule table now makes `dispatches[i].corpusOutcome` BR-9's oracle locus and `dispatches[i].orderKeys` BR-10's locus 1, thresholds run-level as locus 2, and the run-level pair an explicitly unasserted mirror (`TSPEC:322-337`) — a transcription of `REQ:325-330` and `REQ:336-345`, and of FSPEC's two-loci table (`FSPEC:544-555`). §D.2's schema comments carry the same: locus-2 thresholds "read ONCE PER RUN", `runMirror` "ADDITIVE, NOT THE ORACLE … an implementation that omitted `runMirror` entirely conforms" (`TSPEC:600-612`), per-dispatch fields marked "ORACLE LOCUS" (`TSPEC:628-633`). The single BR-10 closure row is **split into two set-equality rows**, one per locus (`TSPEC:645-648`), which is what REQ AC-3.3's "two completeness tests … one per locus" requires and what a containment-shaped merged closure could not deliver. `DIVERGENT-CORPUS` is re-pointed to per-dispatch assertions with determinate expected values and asserts "**nothing about `runMirror`**" (`TSPEC:987-992`). `ERR-6` is closed against REQ v0.9's answer (`TSPEC:1288-1296`). |
| F-03 (v6) — "four hand-written hops" vs a five-row table | Low | **Resolved** | Now "all five hand-written hops" over a five-row table (`TSPEC:219-233`). All five verified in code: `main`'s destructured params (`orchestrate-dev.js:11982`) beside the `_recordQueueRow` defaulted-recorder precedent (`orchestrate-dev.js:12013`); the `wrapperSeams` object literal (`orchestrate-dev.js:12381`, spread at `:12406`); `reviewLoop`'s destructured params (`orchestrate-dev.js:7266`); `reviewLoop`'s `wrapped` closure re-listing seven seams by hand (`orchestrate-dev.js:7343-7357`); `dispatchAndVerify`'s fixed seven-seam destructure (`orchestrate-dev.js:8862-8877`). |
| F-04 (v6) — symbol named `mainDev`, not `main` | Low | **Resolved** | Corrected at all three sites; `TSPEC:963-964` now reads "the function is named `main` … under the local alias `mainDev`" and quotes `import mainDev, * as dev from "../orchestrate-dev.js"`, which is verbatim the import at `pdlc/workflows/__tests__/advisoryDisabled.test.js:70`. The default export is `export default async function main({` at `orchestrate-dev.js:11982`. |
| Q-01 (v6) — what becomes of the honesty sentence | — | **Answered** | Kept as a historical record inside a closed `OQ.2` rather than deleted, so the thread three prior cross-reviews cited stays followable (`TSPEC:1227-1244`). |

Both v6 High findings are closed by transcription of decisions REQ v0.9 and FSPEC v0.9 had already
taken. No new product decision was opened by the revision, and nothing that was approved at v5
regressed: the delta touches only the sections the two findings named, plus the four errata and
cross-review front-matter rows.

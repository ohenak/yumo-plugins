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

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **FINDING: Low \| delta \| nonlocal \| TSPEC:1237, TSPEC:1277 \| The closure notes point a reader at "§I.3's gate", but the gate lives in §I.2.** `OQ.2`'s record of what the resolution changed says "§I.3's gate drops `present` and `!sectionMalformed`" (`TSPEC:1237`) and `ERR-4`'s closure says "§I.3 and §D.2 are written on that answer" (`TSPEC:1277`). The corrected gate paragraph is at `TSPEC:441-448`, inside **§I.2 Configuration** (`TSPEC:417`); **§I.3** is "The pure selection core" (`TSPEC:486`) and contains no gate. The pre-delta text said "§I.2's gate", so this round moved the pointer the wrong way — my own v6 write-up used "§I.3 gate" loosely and likely seeded it, which is why this is recorded rather than argued. Behaviourally nothing is affected; the cost is a PLAN or PROPERTIES author following the pointer into the selection core and finding no gate there. **Fix:** restore "§I.2" at both sites. | REQ AC-5.1a, AC-5.1b |
| F-02 | Low | Local | **FINDING: Low \| delta \| local \| TSPEC:359-361 \| §A.5's new closing sentence cites §T.2 for the loci, but §T.2 is the doubles table.** "only which rows the completeness tests are asserted over, which is what §T.2 and §D.2 now state" (`TSPEC:359-361`). §D.2 does state it (`TSPEC:639-652`), but §T.2 (`TSPEC:799`) is "The doubles" — a table of `fakeGit`/`fakeFs`/scripted-`_agent` fixtures that says nothing about loci. The section that carries the per-dispatch assertions is **§T.6**'s `DIVERGENT-CORPUS` (`TSPEC:987-992`). **Fix:** cite §T.6 and §D.2. | REQ AC-3.2, AC-3.3 |
| F-03 | Low | Local | **FINDING: Low \| inherited \| nonlocal \| TSPEC:1241-1244 \| `OQ.2` says "the bare-repository case in §T.6 now carries the settled expected value — a non-empty block", but §T.6 carries no bare-repository case.** §T.6 (`TSPEC:977-1010`) enumerates AT-02's three-plus-one run shapes, `DIVERGENT-CORPUS`, `RETRY-ITERATION` and AT-29. The bare-repository state is FSPEC E-21, owned by **AT-32** in `learningsConfig.test.js` (`FSPEC:716`; `TSPEC:952-958`). The wording predates this round — it was in the v0.5 text and was carried through — so it is not a regression, but it is now the only stale pointer left in an otherwise-closed OQ. The claim it makes is correct on the merits: with 9 corpus documents at HEAD (P-5) and no `learningsInjection` section, the settled reading does produce a non-empty block. **Fix:** name the AT-32 case, or say "§T.5's `learningsConfig` suite". | REQ G-1, AC-1.1, AC-5.1a |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §D.1 makes the run-level mirror a **fourth** field domain with its own membership test (`TSPEC:588-594`), while §D.2 says an implementation that omitted `runMirror` entirely still conforms (`TSPEC:607-610`). Both can be true — a membership test over an absent field is vacuously green — but that means one of the four domain tests can pass without ever observing a value. That is a testability question rather than a product one, so I am not raising it as a finding; I flag it only so the PROPERTIES author decides deliberately whether the mirror's domain test is worth authoring at all, or whether §D.1's "four domains" should be three domains plus a documented non-oracle. Upstream permits either (`REQ:325-330` "if carried"). |

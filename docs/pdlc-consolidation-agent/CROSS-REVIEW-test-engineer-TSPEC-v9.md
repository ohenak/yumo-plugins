# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md (v1.8)
**Date:** 2026-08-06
**Iteration:** 9
**Type:** Delta confirmation — erratum round 8 only
**Scope:** the erratum edit `a3049d1f..HEAD` (§3.2's `CLAUDE.md` row, §11.3(c)'s third scan axis, §12.2's T-11/T-12/SKILL.md/CLAUDE.md rows, §12.3's register re-measurement and three id assignments). Sections outside that diff are not re-reviewed and stand approved from v8.

## 1. Erratum items — disposition

Every item was checked against the sources it cites, not against the document's account of them.

| # | Erratum item (raiser) | Disposition | Evidence I re-derived |
|---|---|---|---|
| 1 | §12.3 omits AT-M11 / AT-Q13 / AT-R7 (pm-review, se-author, te-review) | **Resolved** | All three now appear in §12.3's assignment table, each in exactly **one** file row: `AT-M11` → `consolidationPass.test.js` (`TSPEC:2446`), `AT-Q13` and `AT-R7` → `consolidationRoute.test.js` (`:2451`). No id is assigned twice. |
| 2 | §12.3 fixes the register at "96 ids, measured at v11.1"; FSPEC is v11.3 (pm-review, se-author, te-review) | **Resolved, and independently confirmed** | I re-enumerated `AT-…` tokens over FSPEC §13 (`:2041-2191`), de-duplicated: **99**. I then extracted the ids from §12.3 (`TSPEC:2426-2488`), de-duplicated: **99**, and diffed the two sets — **empty in both directions**. The claimed number and the claimed set equality both hold at HEAD. |
| 3 | §12.3 leaves three registered ATs with no test level and no test file (te-review) | **Resolved for two of three; see F-01 for AT-M11** | AT-Q13 and AT-R7 have a file, a level (L2) and a stated fixture set. AT-M11 has a file and a level, but no fixture that can pass — F-01. |
| 4 | §3.2 omits `CLAUDE.md` (se-author, twice) | **Resolved** | §3.2 gains the row (`TSPEC:145`). The premise checks out at HEAD: `git ls-files pdlc/workflows/dist/` returns four paths, `CLAUDE.md:58-60` enumerates three, and `:62` reads "Those three are the tracked, shipped outputs". |
| 5 | §3.2's two `SKILL.md` edits have no falsifying test (se-author) | **Resolved** | §12.2 gains the row assigning four verbatim source-text conjuncts (two per file) to `consolidationBuild.test.js`, located by heading rather than line index. The premise checks out: `__tests__/skillFiles.test.js:13-17` is a three-member `reviewSkills` literal covering `se-review` / `te-review` / `pm-review` only, and every assertion in that file is about `VERDICT` trailers these two authoring skills do not carry — the reason given for not widening it is correct. |
| 6 | §11.3(c) names two scan axes and misses `BUNDLES` (se-author) | **Resolved; every citation verified** | `runtimeBundle.test.js:26` is the two-member `BUNDLES` literal. It drives `describe.each` at `:503` (launcher constraint) and `:509` (structural), `it.each` at `:549` (sole output directory) and `:1044` (`RLH-AT-19` no-`process`/no-`fetch`), the drift-perturbation loop at `:1290`, and is spread at `:1584` (`ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]`). "Exempt from all six" is accurate. |

Two structural properties of the edit are also worth recording, because they are the ones an
erratum landing most often gets wrong:

- **T-11 and T-12's interim `(no FSPEC AT)` cases were re-labelled, not duplicated.** §12.3's
  `consolidationRoute.test.js` row no longer carries a `(no FSPEC AT)` clause, and neither AT-Q13
  nor AT-R7 is written twice. This is exactly what the v1.7 rows said would happen, so the round
  trip closed as designed.
- **The register-size number is stated as a reader's summary, not as the mechanism.**
  `consolidationTraceability.test.js` re-derives both sides at run time, so a fourth drift reds
  rather than requiring another erratum. That is the right place to put the guarantee.

## 2. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AT-M11 is assigned a file but has no fixture that can pass against this TSPEC's own §7.3.** Both of AT-M11's fixtures are a marker carrying `RELEASED: {passId} {ISO-8601}`, and its *Then* forbids `reclaimed-stale-lock`. §7.3 (`TSPEC:926-930`) decides `parseMarker` accepts *exactly* `IN-PROGRESS: …` and maps **present-but-unparseable ⇒ `reclaim`**; `present` is `_checkFile(...).ok === true`, which is **true** for a `RELEASED:`-carrying file (exists, non-empty). So a §7.3-conformant implementation records `reclaimed-stale-lock` on both AT-M11 fixtures — the exact outcome AT-M11 exists to forbid — and there is no `RELEASED:` branch anywhere to prevent it (`grep RELEASED TSPEC` returns only `:27` and `:2446`, both prose about the divergence). The §12.3 note calls this a "spelling" the id assignment is "indifferent to", which is true of `consolidationTraceability.test.js`'s set equality and **false of the PLAN task that must write the case**: T05 will author AT-M11 and it is red on arrival, which is the failure mode the register erratum was raised to prevent. The other two ids landed with satisfiable fixtures; this one landed as bookkeeping only. **Required:** either §7.3 gains the `RELEASED:` sentinel (making it the release form and the take-side free case, with §12.2's empty-marker conjunct and T-13's release oracle restated on that form), or §12.3's AT-M11 row states which arm is satisfiable at this layer and which is not — the shape §12.3 already uses for AT-M3, which is the precedent the row should have followed. What it must not do is assert coverage the mechanism cannot deliver. | §12.3 (`:2446`), §7.3 (`:917-956`), FSPEC AT-M11 (`:2085`), BR-14a (`:2551`), E-11b (`:2645`) |
| F-02 | Medium | Local | **§13.3's marker erratum bullet is stale against the FSPEC v11.3 this very edit re-measured.** `TSPEC:2592-2608` still hands the removal-verb question downstream as *open* ("The question the FSPEC owns is…", "Until it is answered…") and still asserts "release is an in-place write of `""`". FSPEC v11.3 has **answered** it: BR-14a (`FSPEC:2551`) decides "marker released **in-place write** `RELEASED: {passId} {ISO-8601}` — never removing the file", and E-11b (`:2645`) decides a `RELEASED:` marker is taken like an absent one at any age with no reason code. The edit re-read FSPEC §13 to re-count the register but did not re-read §4.1/§4.2's answer into §13.3, so the PLAN reads an open question that is closed against it and will hand the implementer the losing side. This is the same defect as F-01 seen from the hand-off channel rather than the traceability table; fixing F-01 without fixing §13.3 leaves the contradiction live in the document the PLAN actually reads for downstream obligations. | §13.3 (`:2592-2608`) vs FSPEC `:2551`, `:2645` |
| F-03 | Medium | Local | **The new `CLAUDE.md` ↔ manifest oracle is red on correct code as specified.** §12.2's new row asserts "the artifact paths `CLAUDE.md` enumerates … asserted **set-equal** to the artifact ids in `pdlc/workflows/dist/distribution-manifest.json`". The manifest carries **no row for itself** — `rows[]` at HEAD is `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`, and nothing else — while `CLAUDE.md:58-60`'s enumeration includes a `distribution-manifest.json` bullet and must keep it (it is a shipped artifact a reader needs named). After §3.2's fix the enumeration is five members (three bundles + `pdlc-cli.mjs` + the manifest) against four manifest rows, so set equality fails on the corrected document. The `BUNDLES` half of the same case states its exclusion explicitly (`.mjs`, not `.bundle.js`); the `CLAUDE.md` half states none. **Required:** name the self-describing-row exclusion in the row, the way the `BUNDLES` half already does, so the oracle is set equality over a defined pair of sets rather than over two sets that structurally cannot be equal. Left as written, the implementer either writes a red test or silently weakens it to containment — and containment is precisely the assertion that would have stayed green through the drift this row exists to catch. | §12.2 `CLAUDE.md` row (`:2402`), §3.2 (`:145`), `distribution-manifest.json` |

No finding is raised against §11.3(c)'s third axis, §12.2's `SKILL.md` row, or the AT-Q13 / AT-R7
assignments: I checked each cited line and each oracle's falsifiability, and all three hold.

## 3. Questions

## 4. Positive Observations

## Verdict

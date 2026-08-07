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

| ID | Question |
|----|---------|
| Q-01 | F-01's repair is a choice between two release forms, and the two are not equal in test cost. Adopting FSPEC §4.1's `RELEASED:` sentinel makes AT-M11 satisfiable but changes §12.2's empty-marker conjunct (a `""` marker would then mean *truncated*, not *released*, and AT-M3 fixture (a)'s reclaim arm becomes reachable again) and changes T-13's release oracle from "last recorded contents are `""`" to "last recorded contents match `RELEASED: {passId} …`". Keeping §7.3's empty form leaves AT-M11 unsatisfiable and needs the §12.3 disclosure F-01 asks for. Which way does §7.3 intend to go, and has the knock-on to those two oracles been priced? |
| Q-02 | Nothing in this review is a re-litigation of §7.3's reasoning, which I approved at v8 on the evidence that no seam can unlink. Does the FSPEC's `RELEASED:` sentinel actually contradict that argument, or does it satisfy it (an in-place write of a non-empty sentinel is as writable as an in-place write of `""`, and the `file_empty ≡ absent` equivalence §7.3 leans on is then no longer load-bearing)? If the latter, F-01 and F-02 close together with no cost to §7.3's premise. |

## 4. Positive Observations

- **The register measurement is now falsifiable rather than transcribed.** Stating 99/v11.3 as a
  reader's summary and pointing at `consolidationTraceability.test.js`'s run-time re-derivation is
  the right division of labour — this is the third erratum round in which a hand-carried count went
  stale, and this edit removes the class rather than the instance.
- **The set equality genuinely holds.** I derived both sides independently (FSPEC §13 `:2041-2191`
  de-duplicated, §12.3 `:2426-2488` de-duplicated) and diffed them in both directions: empty. Each
  of the three new ids lands in exactly one file row. This is the first round in which I could
  confirm §12.3's central claim mechanically rather than by inspection.
- **AT-Q13 and AT-R7 both carry positive controls in the same case.** AT-R7's negative ("no proposal
  file") is asserted against a one-degraded-promotion fixture that *does* write exactly one named
  for that `passId`, and its fixture (b) reaches "no cause" by the other route (all-suppressed
  `no-op`). AT-Q13's second fixture is a single-occurrence promotion, so an implementation that
  emits a recurrence list unconditionally reds. Neither is an absence-only oracle — which is what
  I would have flagged had the interim `(no FSPEC AT)` cases simply been re-badged.
- **The `SKILL.md` row refuses the easy widening for the right reason.** Adding a fourth member to
  `skillFiles.test.js:13-17`'s `reviewSkills` would have forced a per-member conditional on a list
  whose every assertion is about `VERDICT` trailers these two authoring skills must not carry. Siting
  the four verbatim conjuncts in this feature's own L3 suite, located by heading rather than line
  index, is the more durable placement.
- **§11.3(c)'s third axis is stated with its blast radius, not just its name.** Enumerating the six
  suites `BUNDLES` keys and noting the `:1584` spread makes "exempt from every one" checkable in a
  minute; I checked all six and they are where the document says.

## Recommendation

**Needs revision.**

The delta resolves five of the six erratum items outright, and I confirmed the sixth's arithmetic
myself. It does **not** resolve the AT-M11 item in the sense the erratum meant: the id has a file,
but no fixture at that file can pass against §7.3, so the PLAN task the erratum was raised to
unblock is still red on arrival (F-01). §13.3 additionally still hands the resolved question
downstream as open (F-02), and one of the two new oracles the edit introduces cannot green as
specified (F-03). None of these breaks anything I previously approved — §7.3, §11.3(c), §12.1,
§12.4 and the unchanged §12.2 rows all stand — but the Challenger bar is unchanged: one High and
two Medium findings means the delta is not confirmable as it stands.

Smallest sufficient revision: (a) settle the release form or, failing that, state AT-M11's
satisfiable arm in §12.3 the way AT-M3's is already stated; (b) re-read FSPEC BR-14a / E-11b into
§13.3's marker bullet; (c) name the manifest-self-row exclusion in §12.2's `CLAUDE.md` oracle.
None of the three requires restructuring, and none touches a section outside this erratum's scope.

## Verdict

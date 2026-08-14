# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.9)
**Date:** 2026-08-14
**Iteration:** 8 (delta re-review, decision freeze)

**Scope:** Delta only, `6030d7e3..HEAD` — eleven hunks, 14 insertions / 13 deletions.
Prior review: `CROSS-REVIEW-product-manager-PLAN-v7.md` (Approved with minor changes,
`6030d7e3`). Frozen round: a finding blocks only if the revision broke something or
contradicts the repository at HEAD.

## 1. Prior findings — disposition

All four findings I carried into v7 are discharged at HEAD, and each was verified against
the artefact it points at rather than against the changelog's account of it.

- **v7 F-02 / v6 F-01 (Medium) — §4's red-interval paragraph licensed work §3 forbids.**
  Resolved (`PLAN:369`). The passage no longer says an implementer "may land the
  comparator's module ahead of T50, and the plan does not forbid it". It now states that
  §3 assigns the module to T50 alone, that §6 Rule 2 and the Phase-I wave gate are enforced
  against that manifest rather than against the prose, and that shortening the interval is a
  **plan change** — a new earlier task with its own manifest row — not an implementation
  choice. Grounded: `pdlc/engine/scripts/fixture-machine.mjs` appears in §3 exactly once, on
  T50's row (`PLAN:320`), and §6 Rule 2 is where the paragraph says it is (`PLAN:434`). ✅
- **v7 F-03 / v6 F-02 (Low) — item-12 gloss.** Resolved. The v0.6 row now reads "item 12 is
  the AT-2 fixture-machine item … the coverage floor is item 4". Both hold: item 4 is the
  branch-coverage floor (`PLAN:457`), item 12 is the AT-2 machine-level item (`:468`), item
  16 is the licence record (`:475`). ✅
- **v7 F-04 / v6 F-03 (Low) — §2.1's pre-split "writable classes" label.** Resolved
  (`PLAN:223`). The label now states the two-sided source (members from TSPEC §5.4, classes
  and per-class counts from FSPEC §5.2, count conjunct against the transcribed list). The
  `AT-3.8a` id and the `Carried by` cell (`T16, T25, T49`) are byte-unchanged, so §2 ↔ §2.1
  transposition is untouched. ✅
- **v7 F-05 / v6 F-04 (Low) — discharge provenance off by one version.** Resolved in all
  three places (`:22`, T16 at `:150`, §7 at `:481`), each now crediting FSPEC **v0.3**'s
  erratum round with removing the literal. Checked against FSPEC itself: its v0.3 changelog
  entry reads "the packed-member enumeration (§5.2 CLI-entry and engine-module rows, AT-3.8a)
  no longer restates a member list of its own" (`FSPEC:69-72`). `grep` finds no surviving
  "discharged at FSPEC v0.5" or "v0.4/v0.5 removed" wording. ✅
- **v7 F-01 (Low) — AT-1.1's containment-vs-equality distinction not recorded in T15.**
  Not addressed; not claimed to be. T15 (`PLAN:149`) still pins (e) as "not AT-1.1's
  `not found` message" without recording that AT-1.1's own assertion is *containment* on
  refusal text while AT-1.6's is *equality* on a triple member. Carried forward below as
  F-04, unchanged in severity.

## 2. What the delta changed, and whether it holds at HEAD

Eleven hunks. Nine are the round-6 revisions the v0.9 row announces; two are not announced
(see F-01, F-02).

**Announced and verified.** (a) §4's red-interval fix, above. (b) T59 gains both arms of
T50's capability discriminator as named legs (`PLAN:163`) — this is the delta's one piece of
new test substance, and it is specified in the shape I ask for: both arms assert on the
**returned classification**, the `absent` arm asserts positively on the recorded skip entry
"naming its capability … not on the absence of a run", and the `unprobeable` arm asserts the
run-failing verdict rather than merely "no skip". No absence-only oracle, no implementation
echo — the classifications are literals from T50's own prose, and the seam is the injected
spawn T59 already owns. (c) DoD items 14/15 narrow the hermetic claim (`:473`/`:474`).
(d) item-12 gloss, (e) §2.1's AT-3.8a label, (f) the three-place provenance correction,
(g) the v0.6 "task table byte-unchanged" restatement and T50's "pinned `ubuntu-latest`" →
"GitHub-hosted `ubuntu-latest` runner" (`:190`), which answers my v7 Q-01 correctly: no task
in §2 states a `runs-on` image pin, and item 15's skip-coverage obligation is what absorbs
the moving-label risk.

**Upstream still where the lineage cell says.** No upstream document moved since `6030d7e3`
(`git log 6030d7e3..HEAD` touches no `REQ-`, `FSPEC-`, `TSPEC-` or `DECISIONS-` file for this
feature), so the v7 re-grounding stands: REQ v0.11, FSPEC v0.7, TSPEC v0.12, DECISIONS v0.3.
The one upstream claim the delta newly asserts — FSPEC v0.3 as the removal point — I re-read
in FSPEC directly and it holds. No erratum is warranted from this round.

**Product coverage unmoved.** No acceptance criterion gained, lost or changed a carrier. The
only `Carried by` cells in §2.1 touched are none; the AT-3.8a row's cell is byte-identical.
T59's new legs add observation of a behaviour AC-2.2's opt-out predicate already required and
nothing else. Counts 23/24 untouched on all three sides.

## 3. Nothing previously approved broken

- **Batch arithmetic, ownership manifest, §2.1's set-equality:** byte-unchanged; the diff
  bears the claim out. §2 ↔ §2.1 transposition still closes in both directions.
- **Task table structure:** no row added, removed, re-batched or re-scoped. Three cells
  changed — T59's and T50's Descriptions (announced), T16's Description (the provenance
  correction, announced under item (f) but contradicting the row's own "only cells edited"
  clause) and T01's **Status** (not announced at all).
- **T01's `⬚` → `✅` is true, and I verified it rather than taking it.**
  `pdlc/engine/__tests__/preflight-baseline.test.js` exists at HEAD (commit `fb91316f`) and
  passes 9/9 under `node --test`. Its two halves match the row: real `import` +
  `typeof === "function"` for the exported symbols, source-anchored presence for the four
  module-internal ones, each negative (`doesNotMatch` on an `export` form) paired with a
  positive (`match` on the declaration). No implementation echo — every expected value is a
  literal. The marker is honest; only its silence in the changelog is the defect (F-02).
- **§7's erratum ledger:** still exactly two open TSPEC errata (T45's below-floor emission,
  T50's fixture-machine home). TSPEC has not moved; neither is stale.
- **Repo-state caveat, not a finding.** `cd pdlc/engine && npm test` is red locally
  (14 failures), but every failure traces to **untracked or uncommitted** working-tree files
  — `provenance.test.js`, `resolve-version.test.js`, `store.test.js`,
  `plugin-root-notice.test.js` (all `??`) and a modified `engine-config.test.js`. Running
  HEAD's tracked `engine-config.test.js` gives 9/9 pass. The committed branch is not red, and
  nothing in the PLAN is falsified by the local tree.

## Findings

No High. Two Mediums are defects this revision introduced; both are in the changelog's
account of itself, not in the plan's content, and neither touches a requirement, a carrier or
a batch. Two Lows carried or newly observed. Nothing gates Phase I.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Process | **The v0.9 row repeats the overclaim it was written to fix.** It states "the only task-table cells edited are **T59's and T50's Descriptions**" (`PLAN:26`), and the diff `6030d7e3..HEAD` edits **three** Description-or-Status cells beyond that pair: T16's Description (`:150`, the provenance correction — disclosed in the same row's item (f), so the row contradicts itself) and T01's Status (`:135`, disclosed nowhere). This is precisely the class TE round-6 F-02 raised against v0.6 and this round fixed: a reader is again told a region is unchanged and will skip diffing it. Fix: restate the clause as "T16's, T59's and T50's Descriptions, and T01's Status". | — |
| F-02 | Medium | Local | **T01's `⬚` → `✅` is a plan-state change with no changelog line.** Commit `fb91316f` landed `pdlc/engine/__tests__/preflight-baseline.test.js` and flipped T01's Status in the same commit, during Phase P. The marker is truthful (file exists, 9/9 pass, oracles match the row), but a Done task is read by the Phase-I wave planner as work not to dispatch, so a status flip is a materially different kind of edit from a wording fix and belongs in the changelog beside them. Fix: one clause in the v0.9 row — T01 landed and is Done, with the commit named. | AC-2.5 |
| F-03 | Low | Local | **Item 14's AT-2.1 hermetic residue drops T46 silently.** The new sentence gives the residue as "T11, T41, T53, T34 plus T14's non-spawning S-3 descriptor leg" (`PLAN:473`), while the very next sentence lists §2.1's AT-2.1 carriers as "T11, T14, T41, T46, T53, T34 and T50". T46's exclusion is defensible — it is the green task over T14's legs, and its `launcher.test.js` spawn work is `real-spawn`-gated — but T46 also owns hermetic `version-doctor.test.js` legs (`:187`), so the omission is unexplained and understates coverage. Direction is conservative (it strengthens the gate), which is why this is Low. Fix: one clause saying why T46 is out. | AC-2.1 |
| F-04 | Low | Local | **Carried forward from v7 F-01.** FSPEC's contains-vs-equals distinction on the `not found` literal still has not reached T15: `FSPEC:678-681` makes AT-1.1 a *containment* assertion on refusal text and AT-1.6 Q-1 an *equality* on a version-triple member; T15(e) and (g) pin the triple half correctly, but nothing in T15 or §2.1 records that AT-1.1's own oracle is containment, so an implementer reaching for `assert.equal` on refusal text goes red against correct code. | AC-1.1, AC-1.4 |

DEFERRED: T50 now opens two consecutive sentences with "On the GitHub-hosted `ubuntu-latest` runner" (`PLAN:190`) — the second is the pre-existing "all three probes succeed and no leg skips" line and reads as a duplicate; merge them in the next substantive edit, not in a frozen round.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is T01 landing during Phase P an intended pattern for pure pre-flight gates, or a one-off? If intended, §6 should say so in one line, since the wave planner and the DoD both read the Status column and neither expects it to move before Phase I opens. |

## Positive Observations

- **Every one of the four carried findings was closed at the artefact, not at the changelog.**
  I checked all four against the file they point at — §3's manifest for F-01, DoD items 4/12/16
  for F-02, §2.1's cell for F-03, FSPEC's own v0.3 changelog for F-04 — and all four held. The
  provenance fix in particular landed in all three places it was wrong, which is the version
  of that fix that stays fixed.
- **T59's new legs are specified the way I want acceptance work specified.** Both arms assert
  on a returned classification; the `absent` arm names its positive ("asserted on the recorded
  entry, not on the absence of a run"); the reason each arm was previously unpinned is stated
  from the gate's own text — item 14(b) admits any registered skip, item 14(c) never reaches
  the branch. That is a gap argued from the mechanism rather than asserted.
- **The round-6 revisions were not folded into the erratum rounds.** v0.7/v0.8 scoped
  themselves to literal alignment and said so; v0.9 picks the seven findings up and says they
  were carried forward unaddressed. Keeping erratum rounds narrow and paying the debt visibly
  afterwards is the right ordering, and it is why the delta here was reviewable in one pass.
- **DoD item 14's narrowing goes in the honest direction.** The revision makes the hermetic
  claim *smaller* and the gate no weaker — "a reader reconciling this paragraph with §2.1
  should tighten the sentence, never relax the gate" survives intact.

## Recommendation

**Approved with minor changes.**

Every finding I carried into this round is discharged, verified at the artefact rather than
at the changelog, and nothing previously approved is broken: batch arithmetic, ownership
manifest and §2.1's set-equality are byte-unchanged, no row moved batch or scope, no
acceptance criterion changed carriers, and §7's ledger still declares the same two open TSPEC
errata. The delta's one piece of new substance — T59's discriminator legs — closes a real
hole in AC-2.2's opt-out predicate and is written with positive oracles and literal
expectations.

The two Mediums are both the document mis-describing its own diff: the v0.9 row's "only cells
edited" clause is false against three cells, and T01's Status flip to Done is unrecorded. Both
are one-clause fixes, neither changes plan content, and per the freeze neither is worth another
round on its own — but F-01 is a repeat of the exact defect this round fixed for v0.6, so it is
worth noticing that changelog self-description is where this document keeps slipping. F-03 and
F-04 are nits, one new and conservative in direction, one carried.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

# Cross-Review: test-engineer — PLAN (delta re-review, round 10)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.12)
**Date:** 2026-08-14
**Iteration:** 10
**Scope:** Delta re-review of v0.11 → v0.12 (`c6f0253c`, `3bbd375d`, `9d34a157`, `7bce054e`), against my v9 at `1c769612`. Decision freeze in force: only a defect this delta introduced, or a load-bearing claim false at HEAD, blocks. Not a whole-document re-review.

## 1. What changed

Blast radius from the diff, not from the changelog: `git diff -U0 1c769612..HEAD -- {plan}` is
**8 insertions, 7 deletions**, eight single-line hunks, four commits.

| Hunk | Change | Class |
|---|---|---|
| `:12` | version cell 0.11 → 0.12 | header |
| `:26` | v0.9 row's scope clause corrected in place — adds T16's Description and T01's Status to the list of cells that window edited | changelog |
| `:29` | new v0.12 row | changelog |
| `:166` (T06) | Status `⬚` → `✅` | task-table cell |
| `:169` (T09) | Status `⬚` → `✅` | task-table cell |
| `:189` (T59) | **new third arm**: `exit 0 ⇒ present ⇒ no skip recorded`, plus the partition rationale (my v8 F-01) | task-table cell |
| `:216` (T50) | duplicated "On the GitHub-hosted `ubuntu-latest` runner…" sentence removed (my v8 F-03) | task-table cell |
| `:503` (DoD item 14) | **new sentences**: why T46 is out of AT-2.1's hermetic residue (PM round-8 F-03) | DoD |

Nothing else moved. §2.1's carrier table, §3's ownership manifest, §4's wave notes, §5.1's
count floors and §6's rule derivations are outside every hunk — the v0.12 row's
"batch arithmetic, §3's ownership manifest and §2.1's set-equality are byte-unchanged"
is verified against the hunk list, not taken on the document's word. No row added,
removed, re-batched or re-scoped; T59's `Batch 2` / `Deps T03` and T50's `Batch 10` cells
are untouched, so Rule 1 needs no re-derivation.

Two of the four commits close findings I filed in round 8 (T59's third arm, T50's duplicate
sentence). The other two are changelog work.

## 2. Status of my v9 findings

| v9 finding | Severity | State at HEAD | Evidence |
|---|---|---|---|
| F-01 — preservation floors stated over `# tests`, which the skipped-block convention inflates, so the "i.e. all N HEAD tests present" gloss no longer holds | Medium | **Open, unaddressed** | `:440` (§5.1) and `:485` (DoD item 2) are outside every hunk. Stays deferred under the freeze. Worth noting the v0.12 row's own T01 evidence cites `# tests 9 # pass 9 # fail 0` — both numbers, which is exactly the discipline the floors themselves still lack. |
| F-02 — §2's carve-out cites `resolve-version.test.js:397`, a line inside a `.skip` block, for an exemplar it calls "left running" | Medium | **Open, unaddressed** | `:141` still reads `resolve-version.test.js:397`; `:27` repeats it. Not touched by the delta. |
| F-03 — "gates every wave exit on `implementation.testCommand` unconditionally" overstates a conditional gate | Low | **Open, unaddressed** | `:130`, `:27` unchanged. |
| F-04 — item 17's "§5.1" reads as FSPEC §5.1 (the job-name contract) where §5 point 1 (count floors) is meant | Low | **Open, unaddressed** | `:509` unchanged. |

All four were recorded non-gating under the round-9 freeze and none of them was the round's
work; carrying them is consistent, not a regression. Both of my *round-8* findings — the
ones the freeze had also deferred — were closed this round.



## 3. Load-bearing claims verified at HEAD

Every claim the delta makes about the repository, checked against the tree rather than against
a document.

**(a) T01 → `✅` is true, and its cited evidence reproduces exactly.**
`pdlc/engine/__tests__/preflight-baseline.test.js` is tracked at HEAD (`git ls-files`), and
`node --test __tests__/preflight-baseline.test.js` reports `# tests 9 / # pass 9 / # fail 0 /
# skipped 0` — the changelog's transcription is character-accurate, and this file is the one
task whose green is real green rather than convention-green.

**(b) T06 → `✅` is true under v0.10's convention, and the delivered blocks match what the row
promises.** `store.test.js` is tracked and carries exactly nine `test.skip` blocks, all nine
titled `"T26: …"` (`:76`, `:91`, `:99`, `:109`, `:131`, `:147`, `:162`, `:168`, `:175`), all in
statement position. T26 is the `[green]` owner of that file per §3 (`:322`) and §4's red/green
pairing (`:369`). The row's three named legs each have a carrier: sorted enumeration via
`handshake.compare` at `:76` (with the explicit "not lexicographically" oracle), the
skip-**and-report** conjunct at `:109` and `:131` (`every unparseable entry is reported, not
just the first` — a set-shaped assertion, not a first-sample one), and `rootFor` at `:162`–`:175`.
`:147` adds a leg the row does not claim (non-directory entry excluded and *not* reported as
skipped) — that is the negative paired to `:109`'s positive, which is the right shape.

**(c) T09 → `✅` is true and the four-row oracle is four blocks, not three.**
`plugin-root-notice.test.js` is tracked and carries exactly four `test.skip` blocks, all titled
`"T32: …"` (`:90`, `:111`, `:121`, `:161`), one per row of AC-5.6's table: honour, honour-unset,
ignore, ignore-unset. T32 is the `[green]` owner (§3 `:328`, §4 `:372`). The ignore direction
asserts the notice **by catalogue id** (`:145`, `env.plugin-root-ignored`) and not by text alone,
which is what the row's "by id **and** rendered text" promises — see F-02 below on how the text
half is asserted.

**(d) T59's new third arm is stated as a positive, and is the arm my v8 F-01 asked for.**
`:189` now reads "a probe result with a readable **zero exit status** classifies as `present`
and records **no** skip entry — asserted on the recorded set (no entry names that capability)
**and** on the leg's own ran-marker being present, never on the absence of a record alone."
That is a paired oracle in the required direction: the absence conjunct (no inventory entry)
carries a positive conjunct on the same path (the leg ran). The row also names the defect the
arm exists to catch — an off-by-one in a `status === 0` predicate — and where that defect would
otherwise surface (item 14(c), on CI). Three outcomes, three asserted arms: partition, not
containment. This closes v8 F-01 / v7 F-01, open since round 7.

**(e) T50's duplicated runner sentence is gone, and nothing true went with it.**
`:216` now contains two `ubuntu-latest` mentions, neither of them the removed one: the
`runs-on`/moving-label discussion, and item 14's empty-recorded-set assertion. The deleted
sentence ("all three probes succeed and no leg skips") restated the preceding sentence's
content; the surviving text still states that both discriminator branches are off the expected
path on the hosted runner. Same claim, once. Closes v8 F-03.

**(f) DoD item 14's new T46 sentences are consistent with §2.1 and with §4's pairing.**
The paragraph says T46 is out of AT-2.1's hermetic residue "by construction": it is the
`[green]` row satisfying T14's legs (§4 `:377`–`:378` pairs T14→T46), so its AT-2.1 observation
is the same observation, gated with T14's `real-spawn` legs. §2.1 `:236` is unchanged and still
lists seven carriers including T46; the paragraph explicitly cedes authority to it and says a
reader reconciling the two "should tighten the sentence, never relax the gate". The residue
list (T11, T41, T53, T34 + T14's S-3 leg) is byte-identical to v0.9's — the delta explains it,
it does not shrink it.

**(g) The v0.9 scope-clause correction is itself accurate.** v0.9's window did edit T16's
Description and T01's Status beyond T59's and T50's — that matches what I verified in round 8 —
and v0.12's own scope clause names T59, T50, T06 and T09, which is exactly the hunk list in §1.
The self-description defect this correction is about did not recur in the row that corrects it.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **T59 now pins three arms of the discriminator; T50, which ships it, still states only two.** `:216` names `non-zero exit ⇒ absent` and `no readable exit status ⇒ unprobeable`, and leaves the present arm implicit in the probe definitions ("`docker version` exits 0"). The delta made the test side a partition without making the specification side one. This is not a contradiction — the implicit arm is the only remaining outcome, and T59 is the `[red]` task whose assertions define the contract T50 must satisfy, so an implementer reading both gets the whole predicate. It is asymmetry an implementer reading only T50's cell (which is the cell they transcribe into the workflow YAML) would have to close by inference. *Fix, one clause in T50 (i):* "a probe that executes and exits 0 means the capability is **present** ⇒ the leg runs and records no skip". | `PLAN:216` (T50, item (i)); `:189` (T59) |
| F-02 | Medium | Local | **T09's delivered ignore-direction block derives its expected notice text from the code under test.** `plugin-root-notice.test.js:150-153` asserts `notice.text === message("env.plugin-root-ignored", {value: envValue})` — the expectation calls the catalogue that renders the value, so a wrong-but-consistent rendering passes. The block's own comment states this is deliberate ("must come from `lib/catalogue.mjs`'s `message(id, params)`, not be re-derived inline"), and the echo is partly redeemed by the two following `assert.match` legs (`:155`, `:156`) which pin the ignored value and the `--dev` remedy as literals. So the row's "by id **and** rendered text" promise is met in substance. But the id conjunct is already the structural check; the text conjunct's job is to catch a catalogue entry that renders the wrong words, and an echo cannot do that. *Fix (T32's green, not the PLAN):* assert the rendered text against a literal transcribed from FSPEC/TSPEC's message table, keeping `message()` out of the expectation. Recording here because the PLAN's Status flip is what asserts this leg is delivered. | `PLAN:169` (T09); `pdlc/engine/__tests__/plugin-root-notice.test.js:150-156` |
| F-03 | Low | Local | **v0.12's "three one-passage edits plus two changelog corrections" undercounts its own cell edits.** Two of the five task-table/DoD touches in this window are Status flips, which the same sentence then lists correctly ("the task-table cells edited are T59's and T50's Descriptions, and T06's and T09's Statuses"). The arithmetic and the enumeration in one sentence disagree by two; the enumeration is the accurate half and is what a reviewer diffs against, so nothing is hidden. Noting it only because the immediately preceding row (v0.9, item (d)) is a correction of exactly this class of self-description slip. *Fix:* "three one-passage edits, two Status flips, two changelog corrections". | `PLAN:29` (v0.12 row) |

No High findings. Nothing in this delta broke a claim that held at `1c769612`, and every
claim the delta makes about the tree reproduces at HEAD (§3). F-01 and F-03 are precision, not
defect; F-02 is a real oracle weakness but lives in shipped implementation, is disclosed by the
test's own comment, and is not something this delta introduced — the delta only records that the
task is done, which it is.

## 5. Questions

None. Nothing in the delta needs clarification before Phase I resumes.

## 6. Positive Observations

- **The third arm is written as a partition argument, not as an extra assertion.** `:189` does
  not just add a leg; it states *why* two arms were not enough ("covered by containment, not
  partitioned"), names the concrete defect that slips through — an off-by-one in a `status === 0`
  predicate — and names where that defect would otherwise be caught (item 14(c), on CI, after
  the gated apparatus was built precisely to stop depending on CI). A reader who later wonders
  whether the arm is redundant has the falsification story in front of them.
- **The arm's oracle is stated in the paired form, unprompted.** "asserted on the recorded set
  (no entry names that capability) **and** on the leg's own ran-marker being present, never on
  the absence of a record alone." My finding asked for the arm; the author supplied the arm
  *and* pre-empted the absence-only shape it would most naturally have taken. That is the
  no-absence-only-oracle rule applied without being cited at.
- **The status flips are recorded with reproducible evidence rather than asserted.** T01 carries
  its runner output verbatim (`# tests 9 # pass 9 # fail 0`) — both the count and the pass count,
  which is more discipline than §5.1's own floors currently show — and T06/T09 carry the block
  counts and the titles (`nine test.skip blocks all titled "T26: …"`, `four all titled "T32: …"`).
  Every one of those numbers reproduces at HEAD. The row also says *why* it exists: "so no future
  reviewer has to discover them by diffing §2". That is the correct instinct — a Status column
  moving silently is how a reviewer loses track of what the plan is claiming.
- **The T46 explanation strengthens the gate while narrowing a sentence.** The easy way to close
  PM F-03 would have been to add T46 to the residue list, which would have made the residue look
  larger and the required check look less necessary. Instead the paragraph explains the omission
  as double-count avoidance, restates that §2.1 is the authority on carriers, and instructs the
  reader to "tighten the sentence, never relax the gate". A conservative asymmetry, made explicit.
- **T50's collapse removed a duplicate without removing a claim.** Both surviving `ubuntu-latest`
  mentions carry distinct content (the moving-label caveat; item 14's empty-set assertion). The
  cell an implementer transcribes into a predicate is now free of copy-paste residue.
- **The changelog corrects itself in place rather than appending a correction row.** v0.9's scope
  clause now names all four cells that window touched, with the correction attributed and dated
  to v0.12 — so a reader who trusts the v0.9 row's "batch arithmetic and §2.1 byte-unchanged"
  claim to skip diffing gets a scope list that is actually complete.

## 7. Deferred

DEFERRED: State T50's present arm explicitly in item (i), so the cell an implementer transcribes carries all three outcomes rather than two plus an inference (F-01).
DEFERRED: Assert T09's ignore-direction notice text against a literal transcribed from the message table rather than against `message(id, params)` itself (F-02).
DEFERRED: Reconcile v0.12's "three one-passage edits" count with its own enumeration of four edited cells plus DoD item 14 (F-03).
DEFERRED: State §5.1's and DoD item 2's preservation floors over `# pass` rather than `# tests`, which the skipped-block convention inflates (carried v9 F-01, still open).
DEFERRED: Correct §2's carve-out anchor `resolve-version.test.js:397` → `:400`, in both `:141` and `:27` (carried v9 F-02, still open).
DEFERRED: Narrow the v0.10 description of the wave test gate — it degrades to self-report where `implementation.testCommand` is absent (carried v9 F-03, still open).
DEFERRED: Disambiguate DoD item 17's "§5.1" from FSPEC §5.1, used everywhere else in the document (carried v9 F-04, still open).
DEFERRED: No counter covers the blocks the convention adds, so a `[green]` task that deletes rather than un-skips its predecessor's blocks is caught only by diff reading (carried v9).
DEFERRED: The guard's `ownersByFile` fallback means an untitled skipped block in a completed task's own file is a violation while one in a file owned by nobody complete is silently ignored — worth a sentence in §2 (carried v9).

## 8. Recommendation

**Approved.**

The two findings I filed in round 8 are both closed, and closed at the level they were raised
at rather than at the wording level. T59's discriminator is now a three-way partition with the
present arm asserted positively and paired against a ran-marker — the exact shape that makes an
off-by-one in `status === 0` red at unit level instead of on CI. T50's duplicate sentence is
gone with no claim lost.

Everything the delta asserts about the repository reproduces at HEAD: `preflight-baseline.test.js`
runs 9/9, `store.test.js` carries nine `T26`-titled skipped blocks covering all three of T06's
named legs plus the negative paired to the skip-and-report positive, `plugin-root-notice.test.js`
carries four `T32`-titled blocks, one per AC-5.6 row, and all three files are tracked. The
green/red pairings and file ownership behind those flips match §3 and §4 unchanged. §2.1's
carrier table, §3's manifest and every batch cell are outside the diff, so round 6's set-equality
approval and Rule 1's derivation stand without re-checking.

Three findings, none High, none of them a defect this delta introduced. F-02 is the only one
with testing-lens weight and it concerns a shipped test's expectation, not the plan's contract —
the leg it weakens is redeemed by two literal `assert.match` conjuncts on the same path. F-01
and F-03 are one-clause precision items. All three, plus six older observations, belong to the
next document that touches those passages, not to a round of their own.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:eb087db310652bbd21be04c5849eecef4569790c2bad02619c32f561dabac105
APPROVAL-HASH-NORMALIZED: sha256:350801f9917de7449fe31aca57b9bc4d411fa0231dca299a88b880e073f52a96
REVIEWED-COMMIT: 7bce054eb48846d51dee364f487a5a00c156f619

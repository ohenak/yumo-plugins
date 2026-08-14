# Cross-Review: test-engineer — PLAN (delta re-review, frozen round)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.9)
**Date:** 2026-08-14
**Iteration:** 8
**Scope:** Delta re-review of v0.8 → v0.9 (`5b380e4a`, `d0e6e75d`, `9520b139`, `dc2486ad`, `5870f95b`, `fefce120`, `06f76667`) plus the one task-status flip that landed alongside them (`fb91316f`). Decision freeze in force: only a defect this delta introduced, or a load-bearing claim false at HEAD, can block. Not a whole-document re-review.

## 1. What changed, and what did not

Blast radius measured, not read off the changelog: `git diff 6030d7e3..HEAD -- <plan>` is
**14 insertions, 13 deletions in one file**. Every hunk accounted for:

| Hunk | Change | Class |
|---|---|---|
| `:12` | version cell 0.8 → 0.9 | header |
| `:22`, `:23` | v0.5 row re-attributes the AT-3.8a discharge to FSPEC v0.3; v0.6 row withdraws its "task table byte-unchanged" claim | changelog |
| `:26` | new v0.9 row | changelog |
| `:133` (T01) | **Status `⬚` → `✅`** | task table — status only |
| `:159` (T16) | discharge provenance v0.5 → v0.3 | task table — Description |
| `:188` (T59) | **two new assertion legs** (TE round-6 F-01) | task table — Description |
| `:190` (T50) | "pinned `ubuntu-latest` image" → "GitHub-hosted `ubuntu-latest` runner" + Q-01 gloss | task table — Description |
| `:223` (§2.1) | AT-3.8a **label** restated | trace table — label cell |
| `:369` (§4) | red-interval paragraph withdraws the land-early licence | prose |
| `:386` (§4) | item-12 gloss corrected | prose |
| `:473`, `:474` (DoD 14/15) | "hermetic carriers" narrowed for AT-2.1 | prose |
| `:481` (§7) | discharge provenance v0.5 → v0.3 | prose |

What the delta did **not** touch, re-confirmed by diff rather than by the changelog's word:
no task id added, removed or renamed; every `Batch`, `Deps`, `Test File` and `Source File`
cell byte-unchanged; §3's ownership manifest byte-unchanged; §2.1's `Carried by` cells
byte-unchanged in all 35 rows — the AT-3.8a hunk edits the label cell only, so the §2 ↔ §2.1
set-equality I approved in round 6 cannot have moved. **No batch arithmetic to re-derive.**

The v0.9 changelog's own scope claim is the honest version of the one it corrects: it says
plainly that **two** Description cells were edited (T59, T50) rather than repeating v0.6's
"task table byte-unchanged", so a reader is not told to skip diffing §2. That claim is true —
though T01's Status cell is a third task-table cell edited in the same window, arriving from a
different commit; see §7.

## 2. Prior findings

My v7 carried one finding, `F-01` (Low): the class-rename sweep left two §2.1 labels behind.

| v7 finding | Half | State at HEAD | Evidence |
|---|---|---|---|
| F-01 | AT-3.8a label "equals §5.2's **writable** classes" | **Resolved** | `:223` now reads "packed set equals the expected set member-for-member (members from TSPEC §5.4, classes and per-class counts from FSPEC §5.2), count conjunct against the transcribed list" — the two-sided ownership FSPEC v0.7 fixed. Fixed via PM round-6 F-03, not via my finding, but fixed. |
| F-01 | AT-3.8b label "packed workflow **modules** equal §5.2's class" | **Open** | `:224` byte-unchanged. FSPEC §5.2's class is titled **Workflow members** (`FSPEC:537`) and FSPEC AT-3.8b reads "its workflow **members** are …" (`FSPEC:780`). |

Carried forward as `F-02` below at the same severity it had. It is an index label, no
implementer transcribes it into a test, and AT-3.8b's `Carried by` cell (T16, T33, T11, T41, T49)
is untouched — so nothing downstream of it moves.

## 3. Grounding checks on the delta

Every load-bearing new claim checked against the repository, not against a sibling document.

**(a) §4's withdrawal of the land-early licence — true.** The paragraph now says shortening the
T59 → T50 red interval is a plan change because §3 assigns `scripts/fixture-machine.mjs` to T50
alone. Verified: `grep -n "fixture-machine.mjs"` over the PLAN returns exactly one ownership-manifest
hit, `:320` (`T50 | …, pdlc/engine/scripts/fixture-machine.mjs`). No second task owns it. The old
wording genuinely did license an edit the Phase-I wave gate would have rejected, since the gate
reads the manifest and not §4's prose; the correction is right and is stated in the right
direction (tighten the prose, not widen the manifest).

**(b) The item-12 gloss — true.** DoD item 4 is the branch-coverage floor (`:457`,
"Branch coverage floor on the modules this plan creates from nothing"); item 12 is not. The
operative pointer to item 16 was already correct and is unchanged, so this is a gloss fix with
no oracle behind it.

**(c) The AT-3.8a discharge re-attributed to FSPEC v0.3 — true, in all three places.**
`FSPEC:68-73` is the v0.3 erratum-round note: "the packed-member enumeration (§5.2 CLI-entry and
engine-module rows, AT-3.8a) no longer restates a member list of its own — the members are named
downstream in TSPEC §5.4's `PK-*` table". v0.4/v0.5 added the class rows, the count and the
authoritative/sub-assertion split on top (`FSPEC:44-46`). The discharge was always correct against
HEAD; only its provenance was off by one version, and `:22`, T16 and §7 now agree on v0.3.

**(d) T50's runner wording — true.** `grep -n "runs-on"` over the PLAN returns two hits, both
inside the new disclaimer text itself (`:26`, `:190`). No task in §2 states an image pin, so
"pinned `ubuntu-latest` image" was indeed loose wording and the correction does not contradict
anything else in the document.

**(e) The v0.6 changelog restatement — true.** `git diff df4d1c44^ df4d1c44` over the PLAN
touches exactly one task row, `T50`. The restated claim ("one task-table cell is edited, T50's
Description") matches the commit it describes.

**(f) DoD 14/15's narrowed hermetic claim — true, and conservative.** T14's row (`:148`) does
carry a "real-spawn pass-through leg" and a "signalled-child leg" alongside the non-spawning S-3
descriptor assertions, and T50 (`:190`) puts the launcher pass-through and signalled-child legs
under the `real-spawn` capability. So calling all of AT-2.1's retained carriers hermetic was
wrong, and the new residue — T11, T41, T53, T34 plus T14's descriptor leg — is right. §2.1's
AT-2.1 row (`:210`) still reads T11, T14, T41, T46, T53, T34, T50, and item 14 still quotes that
list verbatim before narrowing, so the two are reconcilable. The residue also drops T46; that is
conservative rather than wrong (T46 is the `[green]` production row whose observations are T14's
legs), and it narrows the claim rather than the gate.

**(g) T01's status flip — true at HEAD.** `pdlc/engine/__tests__/preflight-baseline.test.js`
exists (`fb91316f`) and `node --test` reports `# tests 9 / # pass 9 / # fail 0`. The file
discharges the row as written: half (a) is a real `import` plus `typeof === "function"` over all
fifteen exported symbols the row names, split five tests by module, with the cited line numbers
carried as comments; half (b) is source-anchored presence over the four module-internal symbols,
each asserting `match(/\bfunction X\b/)` **and** `doesNotMatch(/export … function X\b/)` — the
negative paired with a positive on the same source text, which is the shape this review asks for
rather than an absence-only oracle. Nothing about argument lists or return shapes is asserted,
so the gate is existence-only as the row promises.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **T59's new discriminator legs pin two of the classifier's three outcomes, so the enumeration is covered by containment, not set-equality.** The addition is a real improvement — v0.8 pinned neither arm — and it does exactly what my round-6 F-01 asked for on the fail-closed arm. But the predicate T50 specifies classifies on the probe process's exit status into **three** outcomes, and T59 now names two: readable **non-zero** ⇒ `absent` + registered skip, and **no readable** status ⇒ `unprobeable` + run-failing verdict. The third, **exit 0 ⇒ capability present ⇒ the leg runs**, is stated in T50 ("all three probes exit 0 there") and asserted by nothing. Consequence: a classifier that returns `absent` for *every* readable exit status — the single most likely off-by-one in a `status === 0` predicate — passes both new legs green, and reddens only later, at DoD item 14(c)'s empty-skip-set assertion on CI, which is exactly the observation the whole gated-leg apparatus exists to stop depending on. *Fix, one clause on the same seam T59 already has:* a probe result with a readable **zero** exit status classifies as `present` and records **no** skip entry (asserted on the recorded set, e.g. the entry for that capability is absent **and** the leg's ran-marker is present), so the three outcomes are pinned as a partition rather than two samples. | `PLAN:188` (T59), `:190` (T50), DoD item 14(c) `:473` |
| F-02 | Low | Local | **§2.1's AT-3.8b label still carries the retired "modules" wording** (carried from v7 F-01, whose AT-3.8a half is now fixed). `:224` reads "AT-3.8b *(AC-1.3)* packed workflow **modules** equal §5.2's class"; FSPEC §5.2 titles the class **Workflow members** (`FSPEC:537`) and AT-3.8b itself reads "its workflow **members** are …" (`FSPEC:780`), the rename FSPEC v0.7 made because `PK-22` is a JSON manifest. T16's body already adopted the new name, so this is the last occurrence in the document. It is an index label, not an oracle — no implementer transcribes §2.1 into a test — and the `Carried by` cell is untouched, so §2.1's set-equality is unaffected. *Fix, one word:* "packed workflow **members** equal §5.2's Workflow-members class". | `PLAN:224`, `FSPEC:537`, `FSPEC:780` |
| F-03 | Low | Local | **The PM Q-01 edit left T50 opening two consecutive sentences with the same clause.** After "pinned `ubuntu-latest` image" became "GitHub-hosted `ubuntu-latest` runner", the cell reads "On the GitHub-hosted `ubuntu-latest` runner both branches are off the expected path … since all three probes exit 0 there" and then, two clauses later, "On the GitHub-hosted `ubuntu-latest` runner all three probes succeed and **no leg skips**." The second sentence pre-dates the edit and was previously distinguished by the first saying "pinned image". Not a contradiction and not an oracle change — both say the same true thing — but the repetition now reads as a copy-paste residue in the cell an implementer transcribes the predicate from. *Fix:* drop the trailing sentence, whose content the earlier one already carries. | `PLAN:190` (T50) |

Severity note under the freeze: **F-01 is recorded, not gating.** It is a completeness gap in
material the delta *added*, not a regression the delta introduced — v0.8 asserted strictly less
about the discriminator than v0.9 does — and it contradicts nothing at HEAD or upstream. Under
this round's bar it is therefore not a blocking finding, and I have not opened it as one.

## 5. Questions

None. Nothing in the delta needs clarification before Phase I.

## 6. Positive Observations

- **My round-6 F-01 came back as assertions on a returned value, not as a prose promise.** T59's
  new legs say the classification is asserted on the returned classification and, for the `absent`
  arm, "on the recorded entry, **not on the absence of a run**". That is the parenthesis I would
  have had to write as a follow-up finding, written by the author instead. The `unprobeable` arm's
  "never a skip" is a negative, but it is paired with the positive run-failing verdict on the same
  path, so it is not an absence-only oracle.
- **The v0.6 changelog correction is the rare kind that costs the author something.** Withdrawing
  a "byte-unchanged" claim tells every future reviewer they must diff §2 for that round after all.
  It would have been cheaper to leave it and quieter to soften it; the row instead names the cell
  and the reason a reader should not skip the diff.
- **§4 now points at the artefact the machine actually reads.** The old paragraph reasoned about
  what "the plan does not forbid"; the new one names §3's manifest, §6 Rule 2 and the Phase-I wave
  gate, and says the gate would reject the edit. That is the difference between a plan that is
  merely consistent and one that is consistent *with its enforcement*.
- **DoD item 14 was narrowed without touching the gate.** The correction removes an overclaim
  about AT-2.1's hermetic carriers and leaves the required check, the fail-closed comparator and
  the empty-skip-set positive exactly as they were — the direction item 14 itself instructs a
  reader to take ("tighten the sentence, never relax the gate"), now demonstrated on itself.
- **The discharge provenance was corrected rather than quietly restated.** All three occurrences
  move together and each says the discharge was always correct and only the version attribution
  was wrong, so nobody re-opens T16 wondering whether the erratum came back.

## 7. Deferred

DEFERRED: T59 should pin the `exit 0 ⇒ present ⇒ no skip recorded` arm so the classifier's three outcomes are a partition rather than two samples (F-01).
DEFERRED: §2.1's AT-3.8b label should adopt FSPEC v0.7's "Workflow members" wording, closing the class rename (F-02).
DEFERRED: T50's duplicated "On the GitHub-hosted `ubuntu-latest` runner" sentence should collapse to one (F-03).
DEFERRED: T01's Status is `✅` while the PLAN is still in Phase P and every other row is `⬚` — the claim is true at HEAD (test present, 9/9 green, faithful to the row) but the document now mixes plan and progress state, and no section says who maintains the column or what it means for a plan under review.
DEFERRED: DoD item 14's AT-2.1 hermetic residue omits T46 without saying why; the omission is conservative, but a reader transposing it against §2.1's seven-carrier row will notice the gap.

## 8. Recommendation

**Approved with minor changes.**

All seven round-6 edits land where they were asked to, and each load-bearing claim in the delta
holds against the repository rather than against a sibling document: the ownership manifest does
assign `scripts/fixture-machine.mjs` to T50 alone, `FSPEC:68-73` does carry the v0.3 removal, the
v0.6 round did touch exactly T50's row, no task states a `runs-on` pin, T14's real-spawn legs are
capability-gated, and T01's test file exists and passes as its row describes. My v7 F-01's
AT-3.8a half is closed. Structure is untouched: no id, batch, dependency edge or ownership row
moved, and §2.1's `Carried by` cells are byte-identical, so the set-equality and the batch
arithmetic I approved in round 6 stand without re-derivation.

Three findings, none High. F-01 is a genuine testing-lens gap — the new discriminator legs cover
the classifier's outcomes by containment rather than as a partition — but it is a gap in material
this delta *added*, not a regression it introduced, and under this round's freeze it is recorded
rather than gating. F-02 and F-03 are one-word and one-sentence label edits with no oracle behind
them. None of the three warrants a round of its own; all four deferred items belong to the next
touch of this document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.12)
**Date:** 2026-08-14
**Iteration:** 10 (delta re-review, decision freeze)

**Scope:** Delta only, `1c76961..HEAD`, 8 insertions / 7 deletions across 7 lines.
Prior review: `CROSS-REVIEW-product-manager-PLAN-v9.md` (Approved with minor changes,
reviewed commit `1c76961`). Frozen round: a finding blocks only if the revision broke
something that worked, or a load-bearing claim contradicts HEAD.

## 1. What changed

Seven lines, all of them accounted for by the new v0.12 changelog row (`PLAN:29`):

- **Version cell** `0.11 → 0.12` (`PLAN:12`).
- **v0.9 changelog row's scope clause corrected in place** (`PLAN:26`) — it now names
  T16's, T59's and T50's Descriptions and T01's Status instead of only T59's and T50's.
- **New v0.12 row** (`PLAN:29`) recording this round's three passage edits and two
  changelog corrections.
- **T59's Description** (`PLAN:189`) gains a third discriminator arm: exit 0 ⇒ `present`
  ⇒ no skip recorded, asserted on the recorded set *and* on the leg's own ran-marker.
- **T50's Description** (`PLAN:216`) loses the duplicated trailing "On the GitHub-hosted
  `ubuntu-latest` runner all three probes succeed and **no leg skips**" sentence.
- **T06's and T09's Status cells** flip `⬚ → ✅` (`PLAN:166`, `:169`).
- **DoD item 14** (`PLAN:503`) gains one sentence saying why T46 is out of AT-2.1's
  hermetic residue.

No row added, removed, re-batched or re-scoped; §2.1's set-equality block and §3's
ownership manifest carry no hunk at all in this delta.

## 2. Prior findings disposition

The revision addresses my **v8** findings (its item labels read "PM round-8"), so it is
one review round behind my v9 list. Net effect on the open set:

- **v9 F-05 / v8 F-03 — T46 unexplained in AT-2.1's hermetic residue. Resolved.**
  DoD item 14 now states the reason (`PLAN:503`): T46 is the `[green]` row satisfying
  T14's legs, so its AT-2.1 observation is the same one and is gated with them, and
  §2.1 stays the authority on carriers. Checked: §2.1 carries AT-2.1 on seven tasks
  including T46, and T46's row (`PLAN:213`) is indeed the green row over
  `launcher.test.js` and `version-doctor.test.js` owning `bin/cli.mjs`. ✅
- **v9 F-01 — Status ledger stale for the whole of wave 2. Partly resolved.**
  T06 and T09 now read `✅`. Five rows whose test files are tracked at HEAD still read
  `⬚` — T03 (`_doubles.mjs`), T04 (`provenanceDoubles.js`), T07
  (`resolve-version.test.js`), T08 (`provenance.test.js`), T10
  (`engine-config.test.js`), all confirmed present in `git ls-files`. Carried below as
  F-01, still non-gating.
- **v9 F-02 — DoD item 17's deletion gap. Unchanged, and correctly so under freeze.**
  Item 17 (`PLAN:510`) still asserts only what `checkWaveUnskips` proves. Carried as
  F-02, recorded not gating.
- **v9 F-03 (anchor `resolve-version.test.js:397`) and F-04 ("unconditionally").
  Unchanged.** Both re-verified at HEAD and carried below as F-04 and F-05.
- **v9's second DEFERRED (T50's duplicated runner sentence). Resolved** — the trailing
  sentence is gone from `PLAN:216` and the same claim survives once, upstream in the
  cell ("all three probes exit 0 there").

## 3. Delta verification against HEAD

Every factual claim the delta adds was checked against the tree, not against the
document:

- **T06 → ✅.** `pdlc/engine/__tests__/store.test.js` is tracked at HEAD and carries
  exactly **nine** `test.skip` blocks, **all nine** titled `"T26: …"` — the count and the
  single owning title the v0.12 row claims. Under §2's skipped-block convention that is
  what a `[red]` task delivers: assertions committed in statement position, owned by the
  named `[green]` task. ✅
- **T09 → ✅.** `plugin-root-notice.test.js` is tracked and carries **four** `test.skip`
  blocks, all titled `"T32: …"`. Matches the row exactly, and T32 is the green row that
  owns `lib/skills.mjs`, `lib/handshake.mjs`, `lib/catalogue.mjs` (`PLAN:198`). ✅
- **T01's evidence line.** `preflight-baseline.test.js` exists at HEAD and
  `node --test __tests__/preflight-baseline.test.js` reports `# tests 9 # pass 9
  # fail 0` — the transcription is literal, not approximate. ✅
- **The suite is green with the new red inventory.** `cd pdlc/engine && npm test` at
  HEAD: **663 tests, 600 pass, 0 fail, 63 skipped** (v9 measured 588/0/37 — the growth is
  the wave-2 red blocks the two flipped rows describe). No skipped block is a
  now-failing assertion in disguise. ✅
- **T59's third arm is specified as a positive, not an absence.** The new leg asserts
  "no inventory entry names the capability **and** the leg's own ran-marker is present"
  (`PLAN:189`) — the pairing my role's oracle bar requires, and the stated motive (an
  off-by-one in a `status === 0` predicate passing both existing arms) is a real partition
  gap, not a stylistic one. The other two arms and the `absent` / `unprobeable`
  vocabulary are byte-unchanged. ✅
- **T50's collapse removed a duplicate, not a claim.** The deleted sentence's content
  survives in the preceding sentence ("since all three probes exit 0 there; … a *skip* on
  `ubuntu-latest` is a red DoD item 14 regardless"). No acceptance criterion, capability
  name or gating rule left the cell. ✅
- **DoD item 14's new sentence does not weaken the gate.** It narrows only the
  *residue* discussion and explicitly re-points at §2.1 as the authority; the required-check
  obligation, the four-part `skipSink` adoption and the empty-skip-set positive
  (`(c)`) are untouched. ✅
- **Upstream versions unmoved.** `git diff 1c76961..HEAD -- docs/pdlc-engine-distribution/REQ-* FSPEC-* TSPEC-* DECISIONS-*` is empty; the header still grounds on REQ v0.11 / FSPEC v0.7 / TSPEC v0.12 / DECISIONS v0.3, so no re-grounding obligation is triggered by this delta.

## 4. What the delta did not disturb

- **Batch arithmetic, §3's ownership manifest and §2.1's set-equality** carry no hunk;
  the only task-table cells touched are two Descriptions and two Status cells, exactly as
  the v0.12 row self-describes. Every AT row keeps its `Carried by` set.
- **The red-before-green rule and the two `[standing guard]` carve-outs** (T19, T57) are
  untouched.
- **The skipped-block convention** (§2 `PLAN:127-142`, §4 kind 1, §6 rule 3, DoD item 17)
  is unedited; this round only applies it to two rows' Status cells.
- **No acceptance criterion changed carrier, wording or severity**, and no product scope
  moved: nothing in the delta adds behaviour REQ/FSPEC do not ask for, and nothing drops
  a criterion they do.

## Findings

No High. Nothing the revision introduced broke something that worked, and no
load-bearing claim in the delta contradicts HEAD. Two Mediums and three Lows, none
gating.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **Status ledger is now half-flipped, which reads worse than uniformly stale.** T06 and T09 are `✅` (`PLAN:166`, `:169`), but five further rows whose deliverable is tracked at HEAD still read `⬚`: T03 (`pdlc/engine/__tests__/_doubles.mjs`), T04 (`pdlc/workflows/__tests__/helpers/provenanceDoubles.js`), T07 (`resolve-version.test.js`), T08 (`provenance.test.js`), T10 (`engine-config.test.js`) — all five confirmed in `git ls-files` at HEAD. A reader who sees two ticks reasonably infers the column is maintained and that the other five have not started. Phase I's resume pointer is script-owned (`.claude/pdlc-wave-state.json`), so nothing mechanical depends on this, but the human-facing signal is now actively misleading rather than merely absent. Fix (one edit): flip the five, or state in §1.4 that the column is authored at plan time and not maintained during Phase I. | AC-2.5 |
| F-02 | Medium | Cross-Feature | **Carried from v9 F-02, unchanged and correctly deferred.** The skipped-block convention leaves a `[red]` task's assertions inert until the `[green]` task un-skips them, and the only mechanical check is `checkWaveUnskips`, which — as DoD item 17 (`PLAN:509`) admits in its own text — reports zero violations if a green task *deletes* the predecessor's blocks. §5's floors cover only the five extended suites (`PLAN:440`), never the new engine files. With 63 skipped blocks at HEAD (up from 37 at v9) the exposure grows each wave: AT rows carried solely by skipped blocks could lose coverage while the gate stays green. Recorded, not gating — the convention is an operator decision of 2026-08-14 and the freeze forbids re-opening it. Cheapest durable fix once the freeze lifts: a per-file test-count floor in §5, the instrument that already protects the extended suites. | AC-1.1, AC-2.5 |
| F-03 | Low | Local | **v0.12 item (d) over-widens the v0.9 window it corrects.** The corrected clause (`PLAN:26`) names "T16's Description and T01's Status" as also edited in v0.9's window. T01's Status flip is genuinely in that window (`fb91316f`, between the v0.8 erratum commits and `06f76667`). T16's Description, however, was edited by `6030d7e3` — "docs(plan): erratum v0.8 T16 — absorb FSPEC v0.7 class rename" — which is one of the three commits the **v0.8** row itself describes, so it belongs to v0.8's window, not v0.9's. The correction is in the right direction (v0.9's original clause was too narrow) but now attributes one cell to the wrong row. One-word fix, or drop T16 from the list. | — |
| F-04 | Low | Local | **Carried from v9 F-03, unchanged.** §2's carve-out cites "`resolve-version.test.js:397`'s seed-replay" (`PLAN:141`); at HEAD `:397` is the `assert.equal(asserted, DRAWS)` generator-hygiene line and the seed-replay test (`PROP-VER-16`) opens at `:400`. The sibling anchor `provenance.test.js:124` is exact. `Process` scope, Low, per `DEC-DOC-01`: the block is unambiguous by name, the line number is off by three. | — |
| F-05 | Low | Local | **Carried from v9 F-04, unchanged.** §2 and §6 rule 3 say the engine "gates wave exit on `implementation.testCommand` unconditionally" (`PLAN:131`, `:466`). True for this repo, which sets the key, but the runtime treats an absent `testCommand` as a degradation, not an error (`orchestrate-dev.js:159-166`, gate at `:12150`). The convention's whole safety argument rests on that gate; one clause ("configured here, so …") would stop a reader in a repo that has not set it from importing the convention with the guarantee silently missing. | — |

DEFERRED: DoD item 10 (`PLAN:496`) still reads "no vendored copy of the workflow **modules**" while v0.11 declared the members/modules rename sweep complete — defensible in the anti-fork sense, but the "sweep is complete" claim invites the next reviewer to skip it.
DEFERRED: The changelog's item labels are one review round behind (v0.12 answers "PM round-8", i.e. my v8 review); harmless here but worth re-syncing before harvest reads the round attributions.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Who owns the Status column during Phase I — the implementing wave, or the author at each changelog revision? v0.12 item (e) implies the latter ("recorded here rather than left to the diff"), which is defensible, but then F-01's five untouched rows are a standing debt each revision inherits. One sentence in §1.4 settles it for every future reader. |

## Positive Observations

- **The status flips are evidenced, not asserted.** Item (e) does not say "T06 is done";
  it says nine `test.skip` blocks titled `"T26: …"` are in `store.test.js` and four titled
  `"T32: …"` are in `plugin-root-notice.test.js`, which is a claim a reviewer can falsify
  in one command — and which falsified true. Recording the *shape* of the delivery rather
  than a tick is exactly what makes the skipped-block convention auditable at all.
- **T59's third arm is the right kind of finding to accept under freeze.** It converts
  three outcomes from containment ("both arms pass") to a partition, and the plan says
  why in terms of the defect it catches — an off-by-one in `status === 0` that would
  otherwise redden only on CI, at item 14(c). The plan is buying back exactly the
  early-red property the gated-leg apparatus exists to provide, and it does so with a
  positive assertion plus a ran-marker rather than an absence check.
- **The T46 explanation strengthens a boundary instead of blurring it.** It could have
  quietly added T46 to the residue list and made the sentence agree with §2.1 by
  inflation. Instead it says the omission was deliberate, names the mechanism
  (double-counting one observation seen through T14's gated legs), and re-asserts §2.1 as
  the single authority on carriers — the narrower list stays narrow, and the gate keeps
  its strength.
- **The v0.9 correction owns a repeat offence by name.** Item (d) points out that the row
  committed "precisely the class of self-description defect its own item (g) had just
  fixed one paragraph earlier". A document that names its own recurring failure mode is
  cheaper to review than one that silently patches it.

## Recommendation

**Approved with minor changes.**

The one finding I carried into this round that the revision targeted (v9 F-05 / v8 F-03,
T46's absence from AT-2.1's hermetic residue) is discharged, and discharged with a reason
rather than a patch. Every new factual claim in the delta was verified against HEAD: the
two status flips match the tracked files' skip-block counts and titles exactly, T01's
`node --test` transcription is literal, the engine suite is green at 600 pass / 0 fail /
63 skipped, and upstream REQ / FSPEC / TSPEC / DECISIONS are byte-unchanged since
`1c76961`. Batch arithmetic, §3's ownership manifest and §2.1's set-equality carry no
hunk; no acceptance criterion changed carrier; the red-before-green rule and both
`[standing guard]` carve-outs are untouched. Nothing in the delta broke something that
worked.

The two Mediums are scoping, not defects the delta introduced. F-01 is the direct
consequence of the partial fix: a column that is now two-sevenths accurate reads as
maintained, which is worse for a human than a column that is uniformly stale — five rows
and one sentence in §1.4 close it. F-02 is the residual coverage gap the skipped-block
convention opens, which the plan names against itself in DoD item 17; the operator settled
the convention on 2026-08-14 and the freeze holds, so I record it rather than re-open it,
with the concrete instrument (per-file count floors in §5) waiting for Phase I. The three
Lows are one mis-attributed changelog cell, one anchor off by three lines and one
over-strong word, none of which changes what an implementer builds.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}

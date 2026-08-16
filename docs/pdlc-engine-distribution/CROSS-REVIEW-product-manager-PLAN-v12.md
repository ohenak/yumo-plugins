# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.17)
**Date:** 2026-08-16
**Iteration:** 12 (delta re-review, frozen round)

**Scope:** Delta only, `1eea225..HEAD` on this file (11 insertions / 5 deletions),
two revisions: v0.16 (Phase CR round-4 revisions) and v0.17 (round-10 revisions).
Prior review: `CROSS-REVIEW-product-manager-PLAN-v11.md` (Approved with minor
changes, reviewed commit `1eea225`). Frozen round: a finding blocks only if the
delta broke something that worked, or a load-bearing claim contradicts HEAD.

## 1. What changed

Header cell `0.15 → 0.17`, phase cell `Phase P → Phase CR`, two new changelog
rows, one task-table Description cell, one new §4 paragraph, one rewritten DoD
item-4 tail. No `Status`, `Deps`, `Batch`, `Test File` or `Source File` cell
moved; §2.1 and §3 carry no hunk (confirmed on the diff).

- **v0.16(a)** — §4 rule 4 gains a paragraph naming
  `pdlc/engine/__tests__/_tspec-packed-set.mjs` and its co-change obligation
  (`PLAN:484`).
- **v0.16(b)** — DoD item 4's concession is re-enumerated: eight modules with
  branch numbers, `publish-preflight.mjs` added as a second function-coverage
  residue (`PLAN:507`).
- **v0.17(a)** — T50's item (i) states the third arm of the capability
  discriminator, `exit 0 ⇒ present ⇒ no skip` (`PLAN:228`).
- **v0.17(b)** — the v0.9 row's scope clause is re-corrected, dropping T16's
  Description from the edited-cell list (`PLAN:24`).
- **v0.17(c)** — the v0.12 row's edit count is restated to match its own
  enumeration (`PLAN:27`).

## 2. Disposition of my v11 findings

- **v11 F-01** (stale `4 516 pass` in two places). **Unchanged.** Re-measured at
  HEAD this round: `pdlc/workflows` reports **4 524 passed / 1 failed / 70
  skipped**, the one failure being `documentOracles.test.js:246` on this
  checkout's untracked trees. Carried below as F-02, still non-gating.
- **v11 F-02** (`§5.1` over-generalised in v0.15(d)). **Unchanged.** Carried
  below as F-03.
- **v11 F-03** (v0.12's item (d) over-widens the v0.9 window). **Addressed in
  v0.17(b) — and my finding was wrong.** See F-01: the fix landed, and it made
  the row false. My apologies; the finding I filed is the cause.
- **v11 F-04** (deletion-gap owner, scheduled-later). **Unchanged**, correctly so
  under freeze. Carried below as F-04.
- **v11 F-05** (changelog round labels). **Effectively answered.** v0.17 labels
  its round "Round-10" against `CROSS-REVIEW-product-manager-PLAN-v10.md`, and
  its finding ids (PM F-01 half-flipped ledger, F-03 v0.9 window, F-04 anchor,
  F-05 "unconditionally") all resolve correctly against that file. The
  convention is *cross-review file version*, used consistently. Withdrawn.

## 3. Delta claims checked against HEAD

Every load-bearing claim the delta adds, checked against the tree rather than
against the document:

- **v0.16(b)'s eight branch numbers are exact.** `npm test --
  --experimental-test-coverage` in `pdlc/engine` at HEAD: `bin/cli.mjs` 85.98,
  `lib/provenance.mjs` 100, `lib/resolve-version.mjs` 97.14, `lib/store.mjs`
  94.44, `scripts/postinstall.mjs` 100, `scripts/prepack.mjs` 91.67,
  `scripts/publish-preflight.mjs` 88.61, `scripts/fixture-machine.mjs` 88.57.
  All eight ≥ 85. ✅
- **The new second residue reproduces.** `publish-preflight.mjs` reports
  **63.33 % functions / 88.61 % branch**, uncovered `40-46`, `353-370`,
  `395-414`, `452-549` — the delta's transcription, exact. `fixture-machine.mjs`
  still 57.71 / 88.57 / 40.74. ✅
- **"The remaining six meet both measures" holds.** Function coverage for the
  other six in the enumeration: `cli.mjs` 88.24, `provenance` 100,
  `resolve-version` 100, `store` 100, `postinstall` 100, `prepack` 100. ✅
- **The enumeration's boundary is defensible.** Two engine modules sit below
  85 % functions outside it (`bin/pdlc.mjs` 50.00, `lib/transport-cli.mjs`
  77.78), but neither is a module "this plan creates from nothing" — both
  predate the branch (`008acc26`, `39787a82`), so item 4's eight-module scope is
  unaffected. ✅
- **v0.16(a) verifies file-by-file.** `pdlc/engine/__tests__/_tspec-packed-set.mjs`
  exists at HEAD; its importers are exactly `packaging.test.js:31` and
  `publish-channel.test.js:80`; it appears nowhere in §3's manifest (its only
  three mentions in the PLAN are the two changelog rows and `:484`); and its own
  header carries the co-change statement the paragraph attributes to it
  (`_tspec-packed-set.mjs:14,17`). ✅
- **v0.17(a) matches the shipped classifier.** `scripts/fixture-machine.mjs:234-236`
  is `if (no readable status) return "unprobeable"; return probeResult.status === 0
  ? "present" : "absent"` — a three-way partition, and `:255`/`:262` route
  `unprobeable` to a throw and `absent` to a registered skip. T50's cell now
  states what the code does and what T59 already asserts (`PLAN:203`). ✅
- **v0.17(c)'s arithmetic is right.** The v0.12 row enumerates four task-table
  cells (T59, T50 Descriptions; T06, T09 Statuses) plus DoD item 14; "three
  one-passage edits, two Status flips and two changelog corrections" now agrees
  with it. ✅
- **v0.17(b) does not verify — see F-01.** Its stated premise is true
  (`59ccddb5` is an ancestor of v0.9's `b754075f`), but not exclusive: `b2d160d1`
  edited T16 again, inside the v0.9 window.
- **Upstream is unmoved for this document's purposes.** No REQ/FSPEC/TSPEC/
  DECISIONS text the delta relies on changed in a way the delta misstates; the
  delta adds no upstream citation.

## 4. Product-lens read

- **No acceptance criterion moved.** §2.1's set-equality, §3's ownership
  manifest and every batch/dep cell are byte-unchanged; the delta records
  evidence and corrects self-description only.
- **The one substantive product statement is v0.16(b)'s** — it widens an
  accepted coverage concession from one module to two. That is the honest
  direction: the reader who meets `publish-preflight.mjs` at DoD item 14 now
  meets a residue the record already accounts for, rather than an unexplained
  second case. Nothing about what ships changes.
- **v0.17(a) reduces implementer inference on a cell that becomes a predicate**,
  which is the right place to spend words.

## Findings

One Medium regression introduced by the delta, three carried Lows and one new
Low. No High: nothing the revision changed affects what ships, and no acceptance
criterion, task, batch or manifest row moved.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **v0.17(b) makes the v0.9 scope clause false, and my v11 F-03 is why.** The row now says v0.9's window edited "T59's and T50's Descriptions, and T01's Status", on the grounds that T16's Description was edited in `59ccddb5` (a v0.8 commit). That commit did edit T16 — but so did **`b2d160d1`, "docs(plan): attribute AT-3.8a literal removal to FSPEC v0.3 in all three places (PM round-6 F-04)"**, one of v0.9's own seven commits. The row contradicts itself two sentences later: its item (f) says the attribution was fixed "in all three places (`:22`, **T16**, §7)". So v0.12's four-cell list was correct, and the re-correction removed a cell that belonged. A reader who trusts this scope clause to skip diffing §2 is now told a cell did not move that did — strictly worse than the incomplete list this class of fix exists to repair. My round-10 F-03 asserted the ancestry without checking whether T16 was touched again in-window; the finding was mine, the fix followed it faithfully. Fix (one edit, no other cell): restore **T16's Description** to the v0.9 list, name both commits (`59ccddb5` in v0.8, `b2d160d1` in v0.9), and record that the v0.17 re-correction was itself corrected. | AC-2.5 |
| F-02 | Medium | Local | **Carried from v11 F-01, unchanged.** DoD item 2's confirmation recipe still tells the reader to "confirm the count is otherwise `4 516 pass / 1 fail`" (`PLAN:497`), and v0.13's paragraph repeats the figure (`PLAN:30`). Re-measured at HEAD this round: **4 524 passed / 1 failed / 70 skipped**. The drift is legitimate — tests landed since the figure was taken — which is exactly why v0.14(a) removed the engine side's absolute totals one revision earlier; the same reasoning has still not been carried across. Not load-bearing (the item rests on "one failure, and it names an untracked path", which reproduces exactly at `documentOracles.test.js:246`), but a DoD reader hits a mismatch at the moment the recipe exists to reassure. Fix, in v0.14(a)'s form: "the suite is otherwise green with the one documented untracked-stray red", no absolute total. | AC-2.5 |
| F-03 | Low | Local | **Carried from v11 F-02, unchanged.** v0.15(d)'s rationale for renaming DoD item 17's `§5.1` says "every other `§5.1` in this document means **FSPEC** §5.1" (`PLAN:22`); `PLAN:174` cites TSPEC §5.1 for PF-3. The edit is right, the generalisation is one word too strong. Fix: "the other `§5.1` citations in the DoD section". | — |
| F-04 | Low | Cross-Feature | **Carried from v11 F-04, unchanged and correctly so under freeze.** The skipped-block convention still cannot distinguish a `[green]` task that deletes its `[red]` predecessor's blocks from one that un-skips them; DoD item 17 names the holder and records the per-file `# pass` floor as the durable instrument, unscheduled. Recorded so harvest sees a convention-level constraint rather than a one-feature detail. | AC-1.1, AC-2.5 |
| F-05 | Low | Local | **v0.16(b)'s new paragraph leaves numbered item 4's indentation.** `PLAN:505` (the concession) is indented three spaces as a list continuation; `PLAN:507` ("**The enumeration of what carries that residue…**") sits at column 0, so it renders as a document-level paragraph between item 4 and item 5 rather than as part of the item it qualifies. Content is right; the reader who scans DoD items sees the enumeration detached from the floor it enumerates. Fix: indent the paragraph to match `:505`. | — |

DEFERRED: a durable fix for `pdlc/workflows`' untracked-stray false red (one shared ignore list rather than per-oracle defences) — correctly scoped out of this feature by DoD item 2, and worth a queue row.
DEFERRED: `scripts/fixture-machine.mjs`'s and `scripts/publish-preflight.mjs`'s function-coverage residue — option (b) is recorded with its cost and a not-a-precedent clause; re-open only if a third module wants the same exemption.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The changelog now carries three corrections-of-corrections in the same class (v0.12(d), v0.17(b), and F-01's fix above). Would one line in §2's preamble — "changelog scope clauses are derived from `git log -p` over the row's commit range, not from recollection" — retire the class? Not for this round. |

## Positive Observations

- **v0.16(b) is the best kind of concession edit: it made the record worse for
  the author and better for the reader.** The item could have kept saying "this
  module alone" and nobody downstream would have caught it before `main`. Instead
  it went and measured, found `publish-preflight.mjs` carrying 63.33 % functions
  with residue of exactly the same shape, and restated the decision as two
  modules for one reason. Every number in it reproduces at HEAD to the decimal —
  I re-ran the coverage command and checked all eight — which is what makes it a
  completion record rather than an assertion.
- **v0.17(a) closed an asymmetry at the cell an implementer actually
  transcribes.** T59 had all three arms; T50 had two plus an inference. The
  shipped `classifyProbeResult` at `fixture-machine.mjs:234-236` is a genuine
  three-way partition, and now all three carriers — code, test cell and
  predicate cell — say the same thing without a reader having to derive the
  third from the other two.
- **§4 rule 4's new paragraph gives an orphaned file an owner in the right
  place.** `_tspec-packed-set.mjs` arrived as a Phase CR remediation with its
  obligation stated only in its own header, where nobody looking for a plan-level
  owner would find it. The paragraph names the file, states the obligation as
  co-change rather than parallelism, says why it has no §3 row, and says what a
  future wave task touching it would owe — and it verifies: exactly two
  importers, no manifest row, header consistent.
- **Both revisions kept the freeze honestly.** Two rounds of edits, and §2.1,
  §3, every batch cell and every `Status` cell are byte-unchanged. The routing
  discipline is visible too: v0.16 sent TE F-01 upstream as a PROPERTIES
  erratum with its premise re-measured, and left TE F-02 with implementation
  rather than folding a test change into a plan row.

## Recommendation

**Approved with minor changes.**

The delta's substantive work verifies against HEAD without exception: eight
branch figures exact, a second function-coverage residue transcribed correctly,
a shared helper whose importers and manifest absence are as described, and a
third discriminator arm that matches the shipped classifier line for line. No
acceptance criterion, task row, batch, dependency edge or manifest cell moved.

One regression, and it is mine as much as the author's. v0.17(b) acted on my
round-10 F-03 and, in doing so, made the v0.9 row's scope clause false — T16's
Description *was* edited in that window, by `b2d160d1`, as the same row's item
(f) states two sentences later. It is a changelog self-description defect, not a
product one: nothing about what ships, what is tested, or what a DoD reader
gates on depends on it, so it is Medium and does not block a frozen round. It
does want the next single edit, together with F-02's stale `4 516 pass` figure,
which is now two rounds old and measurably wrong at HEAD (4 524 / 1 / 70).

The three remaining Lows are carried or cosmetic. Nothing here opens a decision
the freeze closed.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}

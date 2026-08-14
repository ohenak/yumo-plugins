# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.11)
**Date:** 2026-08-14
**Iteration:** 9 (delta re-review, decision freeze)

**Scope:** Delta only, `06f7666..HEAD`, 38 insertions / 5 deletions over ten hunks.
Prior review: `CROSS-REVIEW-product-manager-PLAN-v8.md` (Approved with minor changes,
reviewed commit `06f7666`). Frozen round: a finding blocks only if the revision broke
something that worked, or if a load-bearing claim contradicts the repository at HEAD.

## 1. Prior findings — disposition

- **v8 F-04 / v7 F-01 (Low) AT-1.1's contains-vs-equals distinction absent from T15.**
  **Resolved, and grounded rather than asserted.** T15 gains leg (h) (`PLAN:172`) stating
  both operators and citing the shipped precedent. Both halves check out: FSPEC AT-1.1
  reads "The surface pinned here is the **refusal reason text**, which *contains* that
  literal; AT-1.6 and Q-1 pin the separate **version-triple member**, which *equals* it"
  (`FSPEC:679-681`), and `pdlc/engine/__tests__/handshake.test.js:110-118` splits them
  exactly as the row claims — `assert.equal(out.pluginVersion, "not found")` at `:113`,
  `assert.match(out.reason, /not found/)` at `:115`. Leg (d)'s `notEqual` is untouched. ✅
- **v8 F-01 (Medium, Process) v0.9's changelog under-reported its own diff.** Not
  re-litigated by v0.11 and not re-offended: v0.11's "the only task-table cell edited is
  **T15's Description**" is exactly true of `06f7666..HEAD` — the one task-table hunk in the
  delta is T15's row. The v0.8 row's "only place this PLAN names the class" overclaim is
  additionally corrected in place (`PLAN:25`), which is the same self-description defect
  fixed at its source rather than argued about. ✅
- **v8 F-02 (Medium) T01's plan-state.** Still open and now broader; restated as F-01 below
  rather than carried silently, because wave 2 has since landed.
- **v8 F-03 (Low) item 14's AT-2.1 residue drops T46.** Untouched by this delta and not
  claimed fixed; carried forward unchanged as F-05.

## 2. What the delta changed, verified against HEAD

Two announced revisions: **v0.10**, the skipped-block convention for `[red]` tasks (an
operator decision arising from the Phase I wave-2 gate halt, not a cross-review finding),
and **v0.11**, round-7's two one-passage edits plus one changelog correction.

**v0.10 — the convention, checked against the guard it rests on.** Every load-bearing
mechanism claim in §2's new paragraph (`PLAN:127-142`), §4 kind 1 (`:365`), §6 rule 3
(`:466`) and DoD item 17 (`:508`) is true of `checkWaveUnskips` at HEAD:

- "reads only a `.skip` token that opens its own statement, never one mid-expression" —
  `orchestrate-dev.js:9825-9841`: the scan requires nothing but whitespace before the token
  on its line and a statement-opening character (`;{})` or start of file) before that, which
  is why the `(canRun ? test : test.skip)(…)` form is deliberately invisible to it.
- "treats a skipped block owned by a later wave's task as legitimate, and reddens only once
  that owning task completes with the block still skipped" — `:9950-9956`: owners come from
  the title (`titleNamesTask`, `:9874`) with the file's manifest owners as fallback, and a
  token is a violation **iff** it has ≥1 owner and *every* owner is in `complete`, which is
  built from waves `wi <= waveIndex` (`:9914`).
- "an incidental mention of a second id silently widens ownership and is forbidden" —
  correct in direction: a second named id adds an owner, and `owners.every(complete)` then
  defers the violation until both are done, so the block goes unwatched for longer rather
  than reddening early.
- DoD item 17's own admission — a green task that **deleted** the blocks also reports zero
  violations — matches the guard exactly (it scans tokens that exist, `:9949`), and the
  claim that "§5.1's test-count floors … do not cover the blocks this convention adds" is
  true: §5's item 1 states floors only for the five *extended* suites (`PLAN:439`), never
  for the eighteen new files.

**The convention is already visible in the tree, and matches the plan.**
`pdlc/engine/__tests__/provenance.test.js` commits thirteen blocks as
`test.skip("T27: …")` (`:37`, `:43`, `:51`, `:58`, `:114`, `:142`…`:202`) under the green
task §2 assigns `lib/provenance.mjs` to (T27, `PLAN:192`), and §2's one carve-out is
honoured to the line: `provenance.test.js:124`'s recorder positive control is left running,
which is exactly the block whose skipping would make `:114`'s zero-call assertion vacuous.
`cd pdlc/engine && npm test` at HEAD: **588 pass, 0 fail, 37 skipped**.

**v0.10's §4 correction is the delta's most substantive claim, and it is true.** The
paragraph now retracts "the gate would reject it" and records what Phase I wave 2 actually
did (`PLAN:396`). Verified: T06 and T08 carry `—` in their Source File cells (`PLAN:165`,
`:167`), `lib/store.mjs` and `lib/provenance.mjs` belong to T26 and T27 at batch 3
(`:191`, `:192`, and §3 `:321`, `:322`), neither module exists in the tree or in
`git ls-files pdlc/engine/lib/` at HEAD, and the wave gate is
`_runCommand(implConfig.testCommand)` with no authorship diff (`orchestrate-dev.js:12367`)
while the wave commit is pathspec-scoped to owned files. A document that corrects its own
earlier overclaim against observed pipeline behaviour is the outcome this phase wants.

**v0.11 — round-7 edits.** (a) T15 leg (h), verified in §1. (b) §2.1's AT-3.8b row now reads
"packed workflow **members** equal §5.2's Workflow-members class" (`PLAN:249`), matching
FSPEC AT-3.8b's "three members and **not** three modules" (`FSPEC:780-782`); the `AT-3.8b`
id and `Carried by` cell are byte-identical in the diff, so §2.1's set-equality against §2
does not move. (c) The v0.8 changelog correction is in place (`PLAN:25`).

**Upstream unmoved.** `git log 06f7666..HEAD -- REQ-*/FSPEC-*/TSPEC-*/DECISIONS-*` for this
feature is empty, so the Upstream cell's REQ v0.11 / FSPEC v0.7 / TSPEC v0.12 /
DECISIONS v0.3 (`PLAN:5`) still holds. **No erratum is warranted this round.**

**Product coverage.** No acceptance criterion gained, lost or changed carrier. §2.1's
`Carried by` cells are byte-unchanged across the delta; T15 gains coverage of AC-1.1's
operator distinction, DoD gains item 17, and nothing is removed. Counts 23/24 untouched.

## 3. Nothing previously approved is broken

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

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

- **Batch arithmetic, ownership manifest, §2.1's set-equality:** byte-unchanged in the
  diff — no row added, removed, re-batched or re-scoped, no `Deps` edge or `Files` cell
  moved. §3's manifest has no hunk at all. The v0.11 row's claim to that effect is the
  first changelog self-description in three rounds that the diff supports without
  qualification.
- **§4's kind-1 pairing table and the two `[standing guard]` carve-outs** (T19, T57) are
  untouched, and §4's new paragraph says so explicitly — the convention writes no skipped
  block for a row that is green at authoring time.
- **§2.1's AT-3.8a row** (the one PM round-6 F-03 rewrote) is byte-unchanged; only AT-3.8b's
  title moved, and only its prose half.
- **The red-before-green rule survives in substance.** The red observation is relocated into
  the `[green]` task ("un-skip, observe red, implement until green", `PLAN:141`), not
  removed, and §6 rule 3's edge requirement is unchanged. This is a change in *where* the
  red is observed, which the operator decided; it is not a weakening of the rule the earlier
  rounds approved.
- **Repo state agrees with the plan where the plan speaks about it.** Engine suite green at
  HEAD; the two unowned modules §4 now discusses are gone; working tree carries only
  untracked local state (`.claude/pdlc-wave-state.json`, `.claude/settings.json`,
  `.serena/`), so no document oracle is falsified by anything in this delta.

## Findings

No High. Nothing the revision introduced broke anything that worked, and no load-bearing
claim contradicts the repository at HEAD. Two Mediums and three Lows, none gating.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§2's Status ledger is now stale for the whole of wave 2, not just T01.** v8 F-02 flagged T01's `✅` as unrecorded; since then wave 2 landed (`342a8cf2`, "wave-2 red tests, committed skipped under owning green task ids") and §2 still reads `⬚ Not Started` for every task whose committed test file is tracked at HEAD — T03 (`_doubles.mjs`), T04 (`provenanceDoubles.js`), T06 (`store.test.js`), T07 (`resolve-version.test.js`), T08 (`provenance.test.js`), T09 (`plugin-root-notice.test.js`), T10 (`engine-config.test.js`), all verified with `git ls-files`. Only T01 carries `✅` (`PLAN:160`). §1.4's key offers `🔴 Red` for exactly this state (`PLAN:114`), so the ledger has a value for it and is simply not being written. Non-gating because Phase I's resume pointer is script-owned (`.claude/pdlc-wave-state.json`), not this column — but a reader who opens the PLAN to ask "where are we" is told nothing has started when seven tasks have. Fix: mark the landed `[red]` rows `🔴`, or state once in §1.4 that the column is authored at plan time and never updated during Phase I. | AC-2.5 |
| F-02 | Medium | Cross-Feature | **DoD item 17's deletion gap is named honestly and carried by nothing but reading.** The convention makes a `[red]` task's assertions inert until its `[green]` task un-skips them, and the only mechanical check is `checkWaveUnskips`, which — as item 17 states and `orchestrate-dev.js:9949` confirms — sees only tokens that still exist. A green task that deletes its predecessor's blocks reports zero violations, and §5's floors cover only the five extended suites (`PLAN:439`), never the eighteen new files. Product exposure is concrete: several AT rows in §2.1 are carried *solely* by blocks that are skipped today, so a silent deletion removes acceptance-criterion coverage while every gate stays green. Item 17's mitigation ("each `[green]` task's diff must show `.skip` removed … a block that vanished is a finding") is a human obligation with no owner named in §2. Recorded, not gating, per the freeze — the convention is an operator decision of 2026-08-14 and I am not re-opening it. Cheapest durable fix, when the freeze lifts: give each new test file a count floor in §5, the same instrument that already protects the extended suites. | AC-1.1, AC-2.5 |
| F-03 | Low | Process | **One citation anchor in the delta is off by three lines.** §2's carve-out cites "`resolve-version.test.js:397`'s seed-replay determinism check" (`PLAN:136`); at HEAD `:397` is `asserted += 1;` inside PROP-VER-15's loop, and the seed-replay test `PROP-VER-16 is reproducible: replaying the same seed draws the same generated sequence` opens at `:400`. Its sibling citation, `provenance.test.js:124`, is exact. The descriptor identifies the block unambiguously, so this is an anchor nit under `DEC-DOC-01`, not a coverage claim. | — |
| F-04 | Low | Local | **"Unconditionally" overstates the wave gate by one case.** §2 and §6 rule 3 say the engine "gates every wave exit on `implementation.testCommand` unconditionally" (`PLAN:129`, `:466`). True in this repo — `.claude/pdlc.config.json` sets it — but the runtime states that `testCommand` has **no default** and that its absence "is not an error: it degrades" (`orchestrate-dev.js:159-166`, gate at `:12150`). Since the convention's safety argument rests entirely on that gate, one clause ("configured here, and the convention presumes it") makes the dependency explicit for a reader in a repo where it is not set. | — |
| F-05 | Low | Local | **Carried forward from v8 F-03, unchanged.** DoD item 14's AT-2.1 hermetic residue still lists "T11, T41, T53, T34 plus T14's non-spawning S-3 descriptor leg" while §2.1's AT-2.1 carriers include T46; the exclusion is conservative (it tightens the gate) but remains unexplained. | AC-2.1 |

DEFERRED: T50's two consecutive "On a GitHub-hosted `ubuntu-latest` runner" sentences (`PLAN:190`) still read as a duplicate — carried from v8, merge in the next substantive edit.
DEFERRED: v0.11 calls the class-rename sweep "completed", but DoD item 10 (`PLAN:495`) still reads "no vendored copy of the workflow **modules**" in an AT-3.8a/AT-3.8b sentence; defensible in the anti-fork sense (the two vendored `.js` modules), yet it is the wording an "only place / now complete" claim invites the next reviewer to skip.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Who owns the un-skip *reading* obligation in DoD item 17 — the `[green]` task's own implementer, the wave gate's reviewer, or Phase DOD? The item states the obligation without naming a holder, and F-02's exposure turns on the answer. Not a blocker; a one-clause answer in the next substantive edit closes it. |

## Positive Observations

- **The §4 correction is the kind of revision that makes a plan trustworthy.** The document
  had a clean opportunity to leave "the gate would reject it" standing — no reviewer had
  challenged it, and it read plausibly. Instead v0.10 records what wave 2 actually did, names
  the two modules, says review caught them, and narrows the guarantee to what §3 plus §6
  rule 2 really deliver. Every part of that account checks out against the tree and the
  runtime. A plan that corrects itself against observed behaviour is worth more than one that
  was never wrong on paper.
- **T15 leg (h) is specified the way acceptance work should be.** It names both operators,
  attributes each to its FSPEC surface, and cites a *shipped* precedent that already splits
  them (`handshake.test.js:110-118`) rather than inventing a convention — so the implementer
  copies a pattern that is green today instead of guessing which assertion FSPEC meant.
- **The carve-out is the detail that shows the convention was thought through.** Skipping
  `provenance.test.js:124`'s positive control along with everything else would have left
  `:114`'s zero-call assertion vacuous — an absence-only oracle with its own falsifier
  switched off. §2 anticipates exactly that and names both sites; the tree honours it.
- **DoD item 17 claims only what the guard proves.** It states the necessary-but-not-
  sufficient boundary in its own text and names the gap it does not cover. An honest gate is
  more useful than a confident one, and it is why F-02 could be written as a scoping question
  rather than as a discovery.
- **The v0.8 changelog's "only place" overclaim was corrected in place, not footnoted.**
  That is the right response to the class of defect this document kept committing: an
  inaccurate "only place" is precisely what stops the next reviewer looking.

## Recommendation

**Approved with minor changes.**

The one finding carried into this round (v8 F-04, AT-1.1's operators) is discharged and
verified against FSPEC and shipped test code rather than against the changelog. Nothing
previously approved is broken: batch arithmetic, the ownership manifest and §2.1's
set-equality are byte-unchanged, no acceptance criterion changed carrier, and the two
`[standing guard]` carve-outs are untouched. Every mechanism claim the new convention rests
on is true of `checkWaveUnskips` at HEAD, and the convention is already visible in the tree
in the form the plan describes, with the engine suite green.

The two Mediums are scoping, not defects in the delta. F-01 is a bookkeeping column that has
fallen behind the branch — non-gating because the script owns the resume pointer, but it
misleads a human reader about where the feature stands. F-02 records the residual coverage
gap the skipped-block convention opens; the plan names it itself, the operator decided it,
and under the freeze I record rather than re-open it — with a concrete instrument (per-file
count floors in §5) for whoever picks it up after Phase I. The three Lows are an anchor off
by three lines, one over-strong word, and one nit carried unchanged from v8.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}

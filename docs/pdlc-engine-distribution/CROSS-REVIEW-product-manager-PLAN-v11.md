# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.15)
**Date:** 2026-08-16
**Iteration:** 11 (delta re-review, decision freeze)

**Scope:** Delta only, `7bce054..HEAD` (83 insertions / 67 deletions), covering three
revisions: v0.13 (ledger reconciliation), v0.14 (Phase CR round-3 revisions), v0.15
(round-9 cross-review revisions). Prior review: `CROSS-REVIEW-product-manager-PLAN-v10.md`
(Approved with minor changes, reviewed commit `7bce054`). Frozen round: a finding blocks
only if the delta broke something that worked, or a load-bearing claim contradicts HEAD.

## 1. What changed

Five substantive passages plus the `Status` column, all accounted for by the three new
changelog rows (`PLAN:30`, `:31`, `:32`):

- **Header version cell** `0.12 → 0.15`, date `2026-08-16` (`PLAN:12`).
- **v0.13 — the full ledger reconciliation.** 53 `⬚` rows flip to `✅` (`PLAN:174`–`:232`),
  on stated evidence: all §3 manifest paths exist at HEAD, both suites run, the two
  `[gate]` rows checked against their own records.
- **v0.14 — three CR-round passages**: v0.13's engine evidence drops its absolute counts;
  DoD item 2 defines what "green" means for `pdlc/workflows` on a working checkout;
  DoD item 4 records the `scripts/fixture-machine.mjs` coverage decision (option (b)).
- **v0.15(a)** — preservation floors restated over the runner's `# pass` line rather than
  `# tests`, in both carriers (§5's point 1 at `:452`, DoD item 2 at `:497`).
- **v0.15(b)** — §2's carve-out cites its two exemplars by **test name** instead of line
  anchor (`:149-157`), and the v0.10 changelog row's copy of the same anchor is corrected
  in place (`:28`).
- **v0.15(c)** — "unconditionally" retired from §2's account of the wave gate (`:134-140`).
- **v0.15(d)** — DoD item 17 gains a holder for its reading obligation and disambiguates
  `§5.1` → `§5's point 1` (`:523-525`).
- **v0.15(e)** — DoD item 10 completes the workflow-**members** sweep (`:510`).

## 2. Prior findings

- **v10 F-01 (Status ledger half-flipped). Resolved, and more than asked.** I asked for
  five rows or one sentence; v0.13 reconciled all 59. No `⬚` remains in the task table —
  the only two occurrences of the glyph at HEAD are the legend (`:118`) and v0.13's own
  narration (`:30`). ✅
- **v10 F-02 (DoD item 17's deletion gap). Addressed as far as a frozen round can.**
  Item 17 now names the holder — `[green]` implementer first, Phase DOD backstop,
  explicitly *not* the wave gate's reviewer — and records the per-file `# pass` floor as
  the durable instrument rather than scheduling it. The gap itself is still open by
  decision, not by oversight. Carried below as F-04, Low, non-gating. ✅ (as scoped)
- **v10 F-03 (v0.12 item (d) over-widens the v0.9 window). Unchanged.** Carried below as
  F-03.
- **v10 F-04 (`resolve-version.test.js:397` anchor). Resolved, and the revision found more
  than I did.** I reported the anchor as off by three lines; the revision establishes it
  pointed *inside* the then-skipped `T37:` block — a carve-out asserting "left running"
  citing a skipped line. Both exemplars now cited by test name per `DEC-DOC-01`. ✅
- **v10 F-05 ("unconditionally"). Resolved.** ✅
- **v10 DEFERRED (DoD item 10's `[modules]` wording). Resolved** in v0.15(e). ✅
- **v10 DEFERRED (changelog round labels one round behind). Unchanged**, and now slightly
  mixed. Carried below as F-05.

## 3. Delta claims checked against HEAD

Every load-bearing claim the delta adds, checked against the tree rather than the document:

- **The five preservation floors, re-measured.** `node --test __tests__/<file>` at HEAD:
  `engine-config` 16/16, `run` 25/25, `ci-arrangement` 28/28, `seam-contract` 12/12,
  `skills-composition` 33/33, every one `# skipped 0`. Exactly the five pairs v0.15(a)
  states, every file at or above its floor, and the `# tests`/`# pass` readings do
  coincide as claimed. ✅
- **The carve-out's two test names are exact.** `provenance.test.js:124` opens
  `"PROP-PROV-1 positive control: the recorder observes calls a deliberately impure
  variant makes"`; `resolve-version.test.js:400` opens `"PROP-VER-16 is reproducible:
  replaying the same seed draws the same generated sequence"`. Both transcribed verbatim,
  both un-skipped and running. ✅
- **The `scriptGate` account is true of the shipped runtime.** `orchestrate-dev.js:14142`
  computes `scriptGate = Boolean(implConfig.testCommand) && typeof runCommandFn ===
  "function"`, `:14144` emits the one-time degradation notice, `:14359` runs the test
  command under `if (scriptGate)` with `evaluateBatchGate` in the `else`. The
  `checkWaveUnskips` call at `:14376` sits **after that if/else closes**, so the delta's
  load-bearing safety claim — the un-skip guard fires even where the test gate degraded —
  holds at HEAD. ✅
- **The ledger flip is auditable, and it audits.** §3's manifest carries **59** task rows
  over 61 unique paths; every one of the 61 exists at HEAD (checked mechanically, none
  missing). `cd pdlc/engine && npm test` → **825 tests, 823 pass, 0 fail, 2 skipped** —
  v0.13's corrected form ("0 fail / 2 skipped") reproduces exactly, which is the point of
  v0.14(a)'s removal of absolute totals. The two `[gate]` rows check out against their own
  records: `DEC-DIST-06` at `DECISIONS-plugin-distribution.md:143`, `**N-2 recorded:**
  yes` at `:176`, `pdlc/engine/LICENSE` present, `package.json:19` `"license": "MIT"`. ✅
- **DoD item 2's false-red diagnosis is correct.** `cd pdlc/workflows && npm test` at HEAD
  fails exactly once, at `documentOracles.test.js:246`, on `coveredViolations(LIVE_ROOT)`
  naming untracked local trees — the failure mode the item now documents and forbids
  closing by widening the oracle. The item's *shape* is right; its stated total is not
  (F-01). ✅ for the diagnosis
- **Upstream unmoved.** No REQ/FSPEC/TSPEC/DECISIONS bytes changed in this window, so no
  re-grounding obligation is triggered by the delta; the header's upstream cells still
  bind. ✅

## 4. What the delta did not disturb

- **Batch arithmetic, §2.1's set-equality and §3's ownership manifest carry no hunk.**
  The diff touches the `Status` cell of 53 rows and nothing else in §2's table — no id,
  `Batch`, `Deps`, `Test File` or `Source File` cell moves, exactly as v0.13 and v0.15
  self-describe. Verified against the hunk list, not the prose.
- **No acceptance criterion changed carrier, wording or severity.** Nothing in the delta
  adds behaviour REQ/FSPEC does not ask for, and nothing drops a criterion. The two
  decisions the delta *records* (DoD item 4's coverage residue, DoD item 17's holder) are
  scope-neutral: they name who observes what, not what is built.
- **The red-before-green convention and its `[standing guard]` carve-outs are unchanged**
  in substance; v0.15(b) and (c) sharpen the citations and the gate's description without
  moving the rule.

## Findings

No High. Nothing the revision introduced broke something that worked, and no load-bearing
claim in the delta contradicts HEAD. One Medium and four Lows, none gating.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The `4 516 pass` figure for `pdlc/workflows` is stale at HEAD, in the two places the delta added it** — v0.13's method paragraph (`PLAN:30`) and DoD item 2's confirmation recipe (`PLAN:497`, "confirm the count is otherwise `4 516 pass / 1 fail`"). Measured at HEAD: **4 524 pass / 1 fail / 70 skipped**, the single fail being the documented untracked-stray red. The drift is legitimate — `fb9e1220` and `7d9add88` added workflow tests after the figure was taken — which is precisely why v0.14(a) removed the engine side's absolute totals one revision earlier for being unreproducible. The same reasoning applies here and was not carried across, so a DoD reader following item 2's recipe literally meets a mismatch at the exact moment the item exists to reassure them. Not load-bearing: the reconciliation rested on 0 fail plus the named false red, both of which reproduce. Fix (one edit, same shape as v0.14(a)): state "all suites pass apart from the documented untracked-stray red", no absolute total. | AC-2.5 |
| F-02 | Low | Local | **v0.15 item (d)'s rationale over-generalises the `§5.1` disambiguation.** The changelog says the item's `§5.1` was changed "since every other `§5.1` in this document means **FSPEC** §5.1's frozen `pr-tests.yml` job-name set". Two of the three other occurrences do (`PLAN:464`, `:517`); the third, T02's row at `PLAN:174` ("Unblocks PF-3, §5.1's `name` and §9.1's README literal"), means **TSPEC** §5.1 *Manifest changes* (`TSPEC:199`), where the package `name` field lives — FSPEC §5.1 (`FSPEC:465`) is the required-check set and has no `name` field. The edit to DoD item 17 is correct and its own parenthetical says only "cites elsewhere for", which is true; it is the changelog's stronger "every other" that is not. Fix: soften to "the other `§5.1` citations in the DoD section". | — |
| F-03 | Low | Local | **Carried from v10 F-03, unchanged under freeze.** v0.12's item (d) (`PLAN:31`) still lists "T16's Description and T01's Status" as edits inside the v0.9 window. T01's Status flip is in that window; T16's Description was edited by `59ccddb5` — "docs(plan): erratum v0.8 T16 — absorb FSPEC v0.7 class rename" — one of the three commits the **v0.8** row describes. The correction runs in the right direction; one cell sits under the wrong row. | — |
| F-04 | Low | Cross-Feature | **Carried from v10 F-02, now with an owner rather than a fix.** The skipped-block convention still leaves a `[green]` task that *deletes* its `[red]` predecessor's blocks indistinguishable from one that un-skips them, under any counter the plan runs; item 17 (`PLAN:523`) says so and v0.15(d) assigns the reading obligation and names the instrument (per-file `# pass` floor recorded at the `[red]` commit) as follow-on. That is the right disposition for a frozen round, and the residue is now a scheduled-later gap rather than an unowned one. Recorded so harvest sees it as a convention-level constraint, not a one-feature detail. | AC-1.1, AC-2.5 |
| F-05 | Low | Process | **Carried from v10's deferral, and the round labels are now mixed rather than merely lagging.** v0.15 bills itself as "Round-9 cross-review revisions (PM F-02…F-04 …)" — those ids are from `CROSS-REVIEW-product-manager-PLAN-v9.md` — while its closing paragraph disposes of "PM F-01 (the `Status` ledger stale for wave 2)", which is a **v10** finding id. Both dispositions are correct; the numbering in one row spans two review rounds without saying so, and harvest reads these attributions to route findings. Fix: qualify each id with its review version. | — |

DEFERRED: the durable `pdlc/workflows` fix for the untracked-stray false red (one shared ignore list rather than per-oracle defences) — correctly scoped out of this feature by DoD item 2, worth a queue row.
DEFERRED: `scripts/fixture-machine.mjs`'s 40.74% function coverage — option (b) is recorded with its cost and its non-precedent clause; re-open only if a second module wants the same exemption.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v0.13 reconciled the `Status` column once, before ship. If this PLAN is re-opened after Phase I (an erratum wave, a follow-on slice), does the column get reconciled again, or is v0.13 the terminal snapshot? One clause in §2's preamble would stop the next reader re-deriving 59 rows to find out. Not for this round. |

## Positive Observations

- **The ledger reconciliation states its method, so I could re-run it instead of trusting it.** "All 59 manifest paths exist, both suites run, the two `[gate]` rows checked against their own records" is a falsifiable recipe, and it survived falsification: 61 paths present, engine 0 fail / 2 skipped, `DEC-DIST-06` and `**N-2 recorded:** yes` both where the row says. A completion record that hands the reviewer the commands is worth more than one that hands them a verdict — and v0.14(a) then removing the absolute totals, because a re-runner could not reproduce them, is the same instinct applied to its own evidence.
- **The `# tests` → `# pass` correction is the round's best catch, and it is mine to have missed.** Under a convention that deliberately lands skipped blocks, a `# tests` floor can be satisfied entirely out of new skips while every assertion it guards is deleted — the floor inverted into cover for the deletion it exists to redden. It is stated in both carriers, needs no new machinery, and the re-measurement shows the two readings currently coincide, so nothing moves today and the guard is right tomorrow.
- **The carve-out anchor fix went past the finding.** I reported an off-by-three line number; the revision established the anchor pointed inside a *skipped* block, making a "left running" carve-out cite a line that was not running — a self-contradiction, not a typo — and then switched both exemplars to test names, which stay stable across the un-skipping the convention schedules. Fixing the class rather than the instance is what stops the anchor rotting again at the next wave.
- **DoD item 4 states a cost instead of hiding behind a met floor.** The branch floor is met; the item says so and then says the part that is uncomfortable — roughly 60% of that module's functions first execute on `main` — names why (they drive real machines, and `fixture-machine.yml` cannot run on the PR gate per BR-7.5), and declares it not a precedent for the other seven modules. A recorded, scoped, reversible exemption is a product decision a reader can audit; an unstated one is a surprise at item 14.
- **DoD item 17 names who holds the obligation, including who does not.** "The wave gate's reviewer is deliberately *not* the holder, since `checkWaveUnskips` is the counter this item has just called insufficient" closes the loop that made the gap feel unowned. An obligation with a named holder and a named backstop is a process artifact; the same words without a holder are a wish.

## Recommendation

**Approved with minor changes.**

All five of my v10 findings are resolved or dispositioned, two of them beyond what I asked
for: the `Status` ledger went from a five-row patch to a 59-row reconciliation with a
stated, reproducible method, and the carve-out anchor fix uncovered that the old anchor
contradicted the state it asserted. Every new factual claim in the delta verifies against
HEAD — the five re-measured floors match to the test, both carve-out test names are exact
transcriptions, the `scriptGate`/`checkWaveUnskips` structural claim holds at
`orchestrate-dev.js:14142`/`:14376`, all 61 manifest paths exist, the engine suite reports
0 fail / 2 skipped, and DoD item 2's false-red diagnosis reproduces exactly once at
`documentOracles.test.js:246`. Batch arithmetic, §2.1's set-equality and §3's ownership
manifest carry no hunk; no acceptance criterion changed carrier or wording; upstream
documents are byte-unchanged, so no re-grounding is owed. Nothing in the delta broke
something that worked.

The one Medium is a stale absolute count in the delta's own new prose — the very defect
class v0.14(a) removed from the engine evidence one revision earlier, left standing for
the `pdlc/workflows` number in two places. It costs a DoD reader a moment of doubt at the
exact sentence written to remove doubt, and it is one edit of the shape already
demonstrated. The four Lows are two carried citation defects, one over-general changelog
rationale, and a round-label mismatch that matters only to harvest. None of them gate
this round, and none opens a decision the freeze closed.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 4}

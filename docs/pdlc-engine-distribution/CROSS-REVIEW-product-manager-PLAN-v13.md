# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.18)
**Date:** 2026-08-16
**Iteration:** 13 (delta re-review, frozen round)

**Scope:** Delta only, `9fb555dd..HEAD` on `feat-pdlc-engine-distribution`
(9 insertions / 8 deletions, one file, five commits). Prior review:
`CROSS-REVIEW-product-manager-PLAN-v12.md` (Approved with minor changes,
reviewed commit `9fb555dd`). Frozen round: a finding blocks only if the delta
broke something that worked, or a load-bearing claim contradicts HEAD.

## 1. What changed

Version cell `0.17 → 0.18`; the v0.9, v0.13 and v0.17 changelog rows edited in
place; one new v0.18 row; DoD item 2's confirmation recipe; item 4's two
residue lists plus the indentation of the second paragraph; item 17's `§5.1`
gloss. **No task row added, removed, re-batched or re-scoped, and no
task-table cell of any kind edited** — confirmed against the diff, which
carries no hunk in §2, §2.1 or §3.

- **(a)** v0.9's edited-cell list restored to four cells, with both commits named (`PLAN:24`).
- **(b)** v0.17's re-correction recorded as reverted rather than left silent (`PLAN:33`).
- **(c)** DoD item 2 date-stamps the `pdlc/workflows` total and states the conclusion as the oracle (`PLAN:502`); the v0.13 row's copy date-stamped in place (`PLAN:29`).
- **(d)** DoD item 17's `§5.1` gloss narrowed to the DoD section (`PLAN:520`).
- **(e)** Item 4's two residue lists labelled *principal / coalesced*, omitted ranges named (`PLAN:506,508`).
- **(f)** Item 4's second residue paragraph indented into the item (`PLAN:508`).

## 2. Prior findings

- **v12 F-01** (Medium, the v0.9 scope clause made false by v0.17(b)). **Resolved, and resolved correctly.** Re-derived independently this round: `git log --oneline 59ccddb5..b754075f -- {plan}` returns seven commits, one of which is **`b2d160d1`** "docs(plan): attribute AT-3.8a literal removal to FSPEC v0.3 in all three places (PM round-6 F-04)", and `git show b2d160d1 -- {plan}` touches T16. T16 carries that text at HEAD (`PLAN:191`, "**FSPEC v0.3's erratum round removed the stale literal**"). The v0.9 row now names four cells with both commits, and v0.17's row records its own reversion — no silent third state. ✅
- **v12 F-02** (Medium, stale `4 516 pass / 1 fail`). **Resolved.** Re-measured this round: `4524 passed / 1 failed / 70 skipped`, `118 passed / 1 failed / 119 total` suites, the failure `documentOracles.test.js:246`. Item 2 now states the conclusion (*exactly one* failure, naming an untracked path) as the recipe and date-stamps the total as context. ✅
- **v12 F-03** (Low, `§5.1` over-generalisation). **Resolved** — gloss scoped to "this DoD section", with the TSPEC §5.1 case named. ✅
- **v12 F-04** (Low, Cross-Feature, deletion gap has no counter). **Unchanged, correctly** — v0.18 records it as carried-not-addressed and unscheduled under the freeze. Recorded again below.
- **v12 F-05** (Low, item-4 paragraph indentation). **Resolved** (`PLAN:508` now indented three spaces, matching `:506`). ✅

## 3. Delta claims checked against HEAD

Every load-bearing number the delta adds or re-states, re-measured:

- **`pdlc/workflows`.** `4524 passed / 1 failed / 70 skipped`, 119 suites, one failure at `documentOracles.test.js:246`. Delta exact, including the suite count. ✅
- **The eight branch figures "none moved".** Re-run at HEAD: `cli.mjs` 85.98, `provenance.mjs` 100, `resolve-version.mjs` 97.14, `store.mjs` 94.44, `postinstall.mjs` 100, `prepack.mjs` 91.67, `publish-preflight.mjs` 88.61, `fixture-machine.mjs` 88.57. All eight ≥ 85 and identical to v0.16(b)'s transcription. ✅
- **`fixture-machine.mjs` 57.71 / 88.57 / 40.74** and **`publish-preflight.mjs` … 88.61 branch / 63.33 functions**. Exact. ✅
- **The named omitted ranges reproduce.** `publish-preflight.mjs`'s runner line carries `301-303 305-307 309-311` and `553-554` beyond the four principal ranges — the delta's `301-311` and `553-554`. `fixture-machine.mjs`'s carries `53`, `387-393 395-397 399-401 403-405`, `641-655`, `735-746`, `824-825 829-830` — the delta's `53`, `387-405`, `641-655`, `735-746`, `824-830`. ✅
- **v0.9's provenance claim, per-commit.** Verified above; the "twice, once per window" reading is what git shows. ✅
- **Upstream unmoved for this document's purposes.** The delta adds no new upstream citation; no REQ/FSPEC/TSPEC/DECISIONS text it relies on changed.

## 4. Product-lens read

- **No acceptance criterion, task, batch, dependency edge or manifest cell moved.** The whole delta is self-description and DoD evidence hygiene. Nothing about what ships changed.
- **Item 2's rewrite is the right product move.** The confirmation recipe now hands a DoD reader an oracle that stays true as legs land — "exactly one failure, no other suite red, the failing path is untracked, read CI" — instead of an absolute total that was wrong twice in a row. That is the durable form; it should not need a third round.
- **Item 4's "principal / coalesced" labelling** protects the one item whose subject is stating an enumeration exactly, without pretending the abbreviation elsewhere was dishonest.

## Findings

No High. One new Low, one carried Low.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Item 4's `fixture-machine.mjs` supplementary list mixes two kinds of range.** `PLAN:506` names the omitted ranges as `53`, `387-405`, `553-595`, `598-631`, `641-655`, `735-746`, `824-830`. Five of those are genuinely outside the four principal ranges, but `553-595` and `598-631` sit **inside** the already-quoted principal range `524-631`, so a reader reconstructing "principal ∪ omitted" double-counts that span and may read the principal list as under-stating what it covers. Every figure is true — the runner does report those ranges — so this is legibility, not accuracy. Fix (one edit, no other cell): drop `553-595`/`598-631` from the supplementary list, or say that the principal `524-631` is itself the coalescence of `524-545 553-595 598-631`. | — |
| F-02 | Low | Cross-Feature | **Carried from v12 F-04, unchanged and correctly so under the freeze.** The skipped-block convention still cannot distinguish a `[green]` task that deletes its `[red]` predecessor's blocks from one that un-skips them; DoD item 17 names the gap and the per-file `# pass` floors are the only instrument, covering five of the twenty-three files. Recorded for harvest as a convention-level constraint, not a defect of this feature. | AC-1.1, AC-2.5 |

DEFERRED: the durable fix for `pdlc/workflows`' untracked-stray false red (one shared ignore list rather than per-oracle defences) — outside this feature, worth a queue row.
DEFERRED: `scripts/fixture-machine.mjs`'s and `scripts/publish-preflight.mjs`'s function-coverage residue — option (b) is recorded with its cost and a not-a-precedent clause; re-open only if a third module wants the exemption.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The v0.9 row now carries three layers of correction history (v0.12 widened, v0.17 narrowed, v0.18 restored). Post-ship, is the changelog's job the scope list that is true at HEAD, or the audit trail of how it got there? If the former, harvest could collapse these to the verified four-cell list with one provenance footnote. Not a change request for this round. |

## Positive Observations

- **The v0.9 fix was made the way a scope claim should be made — from `git log`, per commit, not from inference.** Round 10 reasoned from one commit to "no other"; round 12 named the missing commit; this round re-derived the whole seven-commit window and quotes the command it used, so the next reader can re-run it in one line. I re-ran it independently and got the same answer, including that `b2d160d1` is v0.9's own item (f). That closes the defect and the method that produced it.
- **Recording the v0.17 re-correction as reverted, in the v0.17 row itself, is the honest choice.** The alternative — silently restoring v0.9 and leaving v0.17 claiming a correction it no longer holds — would have left the changelog with a third false state and no way to notice.
- **Item 2 finally states an oracle that does not decay.** Two rounds of a stale absolute total became one date-stamped context figure plus a conclusion that survives new legs landing. This is v0.14(a)'s precedent applied to the half that was missing it, and it is the last such figure in the document.
- **The freeze held.** Two rounds of findings, five commits, and §2, §2.1 and §3 are byte-unchanged — no task row, batch, dependency or manifest cell moved, exactly as the v0.18 row claims and as the diff confirms.

## Recommendation

**Approved with minor changes.**

All four of my round-12 findings that were open are resolved, and each is
resolved against verifiable state rather than by assertion: the v0.9 provenance
re-derives per-commit, the workflows totals reproduce to the test, and all
eight coverage figures plus both residue lists reproduce to the decimal at HEAD.
Nothing in the delta introduced a defect, and no load-bearing claim contradicts
the repository. The remaining two findings are a legibility nit in a
supplementary range list and a carried Cross-Feature note for harvest — neither
gates, and neither opens a decision the freeze closed.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:d2c3356a750662030b8a8d4a5bf2e767d115af6702bb781981b902c0eba16ae6
APPROVAL-HASH-NORMALIZED: sha256:225942d7c2f513ec0685878e81a26fd43f32a961358735818ac468f17bfaa77d
REVIEWED-COMMIT: c3f8d624e600d9ccb4864585c01ea284d406a199
UPSTREAM-STATE: REQ sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f
UPSTREAM-STATE: FSPEC sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06
UPSTREAM-STATE: TSPEC sha256:440711317830ec2cc111e58be51a5610ba174906eb1cd6c206e68e508b703833
UPSTREAM-STATE: DECISIONS sha256:05d305f8699fa494c368ddd9e383ab3b34f4fd02a139ae99914886d53c5c7f66

# Cross-Review: product-manager — PLAN (delta re-review, round 8)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.7)
**Date:** 2026-08-19
**Iteration:** 8
**Scope:** Delta re-review of `d0b7d308..HEAD` (v1.6 → v1.7, ten commits `e60e77e6`…`0bb9d279`).
Round-7 findings F-01…F-05 checked for closure; only the sections those commits touched scanned for
new defects; every repository claim in the changed text re-measured on a clean tree at HEAD.

## Round-7 findings — disposition

| Round-7 finding | Landed? | Evidence |
|---|---|---|
| F-01 High — `PROP-SWEEP-2(b)` disposition mis-sized at 14, DoD unsatisfiable | **Yes** | The HEAD-drift note now carries a three-class partition table with named owners, A6-00 closes only the `.bak` class, and the DoD reads the full-suite legs as "no red outside the named inherited set", saying outright that a bare exit-0 "would make this Definition of Done unsatisfiable by construction". The mechanism checks out where it matters: `PROP-SWEEP-2(b)` sweeps `gitTrackedFiles(LIVE_ROOT)` (`git ls-files`) before filtering by A-1's globs, so `git rm --cached` on the 14 blobs really does remove them from the oracle's input. Residual arithmetic is off by two; re-filed as Medium F-01. |
| F-02 High — A6-04 named a new file that already exists | **Yes, and grounded** | A6-04 now reads "**RED at HEAD, discharged by verification — do not re-author**", names `e3b9d5a3`'s *two* added test files, and instructs verify-not-write on the A6-00/A6-01 pattern. Measured: `pdlc/engine/__tests__/advisory-config-example.test.js` exists and its assertions are what A6-04 now says the implementer verifies — `typeof advisory.enabled === "boolean"`, `waveBudgetPerRun` an integer `>= 0`, plus the header comment carrying the "not hung on `ci-arrangement.test.js`" rationale the plan tells the implementer not to lose by re-creating the file. The Overview's "the second of which is new" is corrected in place and marked as measured wrong. |
| F-03 Medium — whole-suite figure stated unconditionally | **Yes** | The Overview now carries a two-row table keyed on tree state, and batch 1's gate wording repeats it. Re-measured this round from a clean tree (`git status --porcelain` empty): **8 suites failed, 27 tests failed, 3847 passed** — exactly the clean row, and the failing set partitions as stated (24 advisory + 3 in `documentOracles.test.js`, with `consumerCleanup.test.js`'s AT-4.1 green). AT-4.1's body confirms the dirty-tree mechanism the plan asserts: it runs `git status --porcelain` with `cwd` resolved to the repo root and asserts `""`. |
| F-04 Medium — A6-21's bare `:14364` pin | **Yes** | Re-anchored to "the wave loop's `if (scriptGate)` arm still carries the unconditional `throw haltError(…)`". `grep -nE ':[0-9]{2,}'` over the whole document now returns only the v1.7 changelog row's "28 paths, not 14" prose — no surviving pin in either form. The v1.5 row's over-broad completeness claim is corrected in place, with the recipe that catches bare pins. |
| F-05 Low Process — completeness gate supplies PLAN headings on a cross-review invocation | **No** (not this document's fix) | Recurs unchanged; re-filed as F-05 for harvest routing. |

Everything routed last round landed, and both Highs landed with their mechanism checkable rather
than asserted. What follows is the result of re-measuring the claims this round *added*.

## Findings

No High findings. Two Mediums, both bookkeeping inside text this round rewrote; three Lows.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The re-measured residual is 26, not 28 — the "this feature's own artifacts" class is 8, not "10 and growing".** The HEAD-drift note's partition table and the DoD both say 28 residual paths, "the other 14" inherited. Re-measured this round (`cd pdlc/workflows && npm test`, clean tree), `PROP-SWEEP-2(b)`'s residual is **26**: 14 `.bak` blobs + 4 consumer-runtime artifacts (`.pdlc-drift-state.json`, two `.bundle.js`, `pdlc-cli.mjs`) + **8** of this feature's own tracked documents (`TSPEC`, `PLAN`, `DECISIONS`, `PROPERTIES`, and four `CROSS-REVIEW-*`: pm-PLAN-v7, se-PROPERTIES-v1, te-PLAN-v6, te-PLAN-v7). So A6-00 closes 14 of **26**, and the inherited remainder is **12**, not 14. This does not disturb the disposition — the partition, the owners and the "not closable here" reading are all correct, and the growth caveat is already written — but it is the same class of claim that has been re-filed each round, and an implementer reconciling the plan against a live run will find two paths they cannot account for. Related precision point for the same sentence: the sweep reads `git ls-files`, so a cross-review round adds paths only once its files are **committed**, and a full round commits two (PM + TE), not one. **Fix:** restate as 26 / 14 closed / 12 inherited with the measurement date, and change "every further cross-review round adds one" to "each committed cross-review file adds one". | AC-1.2 (coupled sweep); PLAN DoD |
| F-02 | Medium | Local | **The Overview's file count no longer matches the file-ownership manifest this round changed.** The Overview says "**Eleven** test-side files under `pdlc/workflows/__tests__`, all eleven of which exist at HEAD … The manifest's **twelfth** path under that directory is the shared fixture `__tests__/helpers/advisoryDoubles.js`". Round 7 added `pdlc/workflows/__tests__/documentOracles.test.js` to A6-00's owned set (TE v7 F-03's T15 literal/title/comment bump), so the manifest now names **twelve** `*.test.js` files under that directory and the fixture is the **thirteenth** path. All thirteen exist at HEAD (verified), so nothing is unbuildable — but a count reconciliation between Overview and manifest was already a finding once (v1.2's PM F-03), and leaving them two different numbers invites the same re-measurement next round. **Fix:** say twelve test files plus the fixture, and note that the twelfth, `documentOracles.test.js`, is owned for its count literal rather than for advisory content. | TSPEC §5.1; PLAN file-ownership manifest |
| F-03 | Low | Local | **"Unconditional `throw haltError(…)`" is two arms away from unique, and it is not literally unconditional.** The Overview and A6-21's red-before-green row both anchor on "the wave loop's `if (scriptGate)` arm, today an unconditional `throw haltError(…)`". At HEAD `orchestrate-dev.js` has two `if (scriptGate)` arms that throw `haltError` — the wave loop's and the V-wave's — and in both the throw sits inside `if (!gate \|\| gate.ok !== true)`, i.e. conditional on gate failure; "unconditional" means "no repair path intervenes", which is right but reads as a code claim. The Overview does quote the wave-loop halt literal, and the plan elsewhere states the V-wave's gate is unchanged, so the intent survives; the A6-21 row alone does not carry that disambiguation. **Fix:** in A6-21's row, quote the `Error: Wave ${waveNum} test gate failed` literal alongside the arm, and say "throws with no repair path" rather than "unconditional". | DEC-DOC-01; AT-05-3 |
| F-04 | Low | Local | **`.gitignore` is now an edited source file but does not appear in the Overview's "Where it lands".** The Overview still says "One production file: `pdlc/workflows/orchestrate-dev.js`" and lists only the test-side files and the second-channel pair, while round 7 gave A6-00 a `.gitignore` edit in its `Source File` cell and manifest row. A reader sizing the change from the Overview alone will miss a repo-root file edit that has tree-wide effect. **Fix:** one clause in "Where it lands" naming `.gitignore` and its reason (keeps `.claude/workflows/.pdlc-backups/` from re-dirtying the tree at later wave boundaries). | PLAN file-ownership manifest |
| F-05 | Low | Process | **The completeness gate still supplies PLAN headings on a cross-review invocation — fifth consecutive round.** The invocation supplies `## Overview` / `## Batches` / `## Dependencies` / `## Verification` as the accepted top-level section set. Those are the reviewed document's headings, not a cross-review's (`## Findings` / `## Questions` / `## Positive Observations` / `## Recommendation` / `## Verdict`). Flagged in v5, v6, v7 and here; a defect that survives four routings is a wiring defect, not an observation. | — |

Tagging note: F-01 stays `Local` this round. Last round I tagged the same site `Cross-Feature`
because the constraint it revealed — that a feature's own in-flight artifacts fall outside the
coupled sweep's frozen glob list — needed promoting. That promotion is now written into the plan's
own disposition and routed to the sweep's owner; what remains here is arithmetic in this document,
which is `Local`. The durable constraint should still be picked up at harvest from the round-7 file.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The DoD's inherited-red set is now named in prose ("`AT-22 [red-until-L-06]` and `PROP-SWEEP-2(b)`'s … unclosable residual paths"). Would it be worth adding the one-line command that re-derives it at DoD time (`npm test -- documentOracles` and read the residual array), so the verifier checks *set membership* rather than a count that will have moved by then? The count is the part that keeps rotting; the set of *test names* does not. Non-blocking. |
| Q-02 | Carried from v7 and still non-blocking: A6-00's untrack step is a non-file act (`git rm --cached`), and the wave commit arm iterates exactly `task.files`. `.gitignore` is now in A6-00's owned set, so the ignore half commits cleanly — but does the *removal* of the 14 tracked paths land in that commit, given none of the `.bak` paths appear in any task's `files` list? If not, worth marking as a manual step the implementer performs before the wave's commit arm runs. |
| Q-03 | Carried from v3–v7: the shipped example now commits `{"enabled": false, "waveBudgetPerRun": 1}` with no README row in scope, so the feature ships no operator-facing discoverability beyond the example file itself. Upstream's explicit decision, correctly followed here; still worth one line in this feature's LEARNINGS so a future operator-documentation pass picks it up. |

## Positive Observations

- **The two Highs were closed at the mechanism, not at the wording.** I expected to have to take the
  `PROP-SWEEP-2(b)` disposition on trust; instead the oracle's input turned out to be
  `gitTrackedFiles(LIVE_ROOT)`, which means the "untrack and ignore" act genuinely removes those 14
  paths from the sweep, and the plan's insistence on *both halves* (untrack **and** `.gitignore`,
  because `git check-ignore` returns nothing for that directory today — verified) is the difference
  between closing 14 paths and permanently reddening AT-4.1. That is the right product answer and it
  is written so an implementer can execute it without re-deriving it.
- **A6-04's restatement matches the landed file line for line.** The plan says the verification
  target is "`advisory` parses and carries **both** `enabled` and `waveBudgetPerRun`, the latter a
  non-negative integer"; the landed file asserts exactly that, including the E-33 comment on the
  `>= 0` bound. The instruction "do not re-create the file — re-authoring loses the landed header
  rationale" is the specific, actionable form of the finding, not a restatement of it.
- **The conditional whole-suite table is the right shape for a number that moves.** Two rows, one
  variable named (tracked-file dirtiness), the extra member identified (AT-4.1), and the mechanism
  that causes it (the `SessionStart` hook rewriting `.pdlc-drift-state.json`). Re-measuring returned
  the clean row exactly. A future reader who gets 28/9 now knows what to check first.
- **The stale-name discipline is applied to the plan's own new edit.** A6-00's T15 bump requires the
  assertion, the title *and* the block comment to move together, with the reason recorded — the same
  trap the plan makes A6-05 fix in the advisory suites. Applying your own rule to the item you just
  added is the thing that usually gets skipped.

## Recommendation

**Approved with minor changes.** Both round-7 Highs are closed, and closed at the level where they
were wrong — the residual disposition is now mechanically correct against the oracle's actual input,
and A6-04 matches the file that exists. Nothing in this round's edits touched batching, ownership
edges, the wave map, or the AT coverage table, and the 47-row AT set-equality claim and the clean-tree
suite figures both re-measured clean.

Two Mediums are worth folding into the next revision, each a single-clause edit:

1. **Residual arithmetic.** 26 measured, not 28: 14 closed by A6-00, 12 inherited (the class of this
   feature's own documents is 8, not 10). Date the measurement and note that paths enter the sweep
   only once committed. (F-01)
2. **Overview/manifest file count.** Twelve test files under `pdlc/workflows/__tests__` now that
   `documentOracles.test.js` joined A6-00's owned set; the fixture is the thirteenth path. (F-02)

Three Lows: disambiguate A6-21's `if (scriptGate)` anchor with the halt literal and drop
"unconditional" as a code claim (F-03); name `.gitignore` in the Overview's "Where it lands" (F-04);
F-05 is a cross-review dispatcher wiring defect, not a PLAN defect, and is routed to harvest.

## Verdict

FINDING: Medium | delta | local | Overview (HEAD-drift note, residual partition table) + DoD | Residual re-measured 26, not 28 — feature-artifact class is 8 not "10 and growing"; A6-00 closes 14 of 26, inherited remainder is 12; sweep reads `git ls-files` so only committed cross-review files enter
FINDING: Medium | delta | local | Overview ("Where it lands") vs file-ownership manifest | Overview says eleven test files + fixture as twelfth path; manifest now names twelve `*.test.js` after `documentOracles.test.js` joined A6-00 this round, fixture is thirteenth
FINDING: Low | delta | local | Red-before-green table (A6-21 row) | "the wave loop's `if (scriptGate)` arm … unconditional `throw haltError(…)`" matches two arms at HEAD (wave loop and V-wave) and the throw is inside the gate-failure branch; row lacks the halt-literal disambiguation the Overview carries
FINDING: Low | delta | local | Overview ("Where it lands") | `.gitignore` became an edited source file in A6-00 this round but is absent from the Overview's landing surface list
FINDING: Low | inherited | nonlocal | Process | Completeness gate supplies PLAN headings on a cross-review invocation, fifth consecutive round

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}

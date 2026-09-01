# Cross-Review: product-manager — PLAN (delta confirmation, iteration 13)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 13 (delta confirmation, frozen round)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Overview

The delta since the commit I last reviewed (`521aa6681`) is `51 insertions(+), 43 deletions(-)` in one
file, spread over three commits — `7f1341ff9` (re-point T-12a), `b62df6cb6` (Status sweep, T-00a census
re-base), `0869ce263` (v1.1 revision entry, narrow the v1.0 scope clause). All three are responses to
findings I raised in v12; nothing else moved.

**My one blocking finding is resolved, and resolved the way the round said it would be.** PM F-01 asked
that T-12a stop naming `documentOracles.test.js` as the host of its disclosure oracle, because the
family in fact landed elsewhere. v1.1 re-points it to
`pdlc/workflows/__tests__/decisionLedgerConfig.test.js` at **every** site the stale name occupied — the
task row's Test File column (`:155`), T-19's Test File column (`:171`), the §Red-before-green edges table
(`:300`), the file-ownership manifest (`:222`, `:237`), the disjointness premise (`:244`), the
multi-owner paragraph (`:255–260`), the §Coverage prose (`:107`) and both Definition-of-Done bullets
(`:489`, `:533`). I checked the module at HEAD: `decisionLedgerConfig.test.js` carries six line-leading
`T-19: …` blocks (`:395`, `:402`, `:409`, `:416`, `:435`), un-skipped, and `documentOracles.test.js`
still carries only the census exclusion and the terminal `102` control (`:398`, `:426`) — which is
precisely the split the revised text now claims.

**The two Medium findings are closed too.** PM F-03's partial Status ledger is swept: all 24 rows read
`✅`, and every one of them is true at HEAD (evidence table in §Verification). PM F-02's over-broad v1.0
scope clause now reads *"no task **instruction**, batch, dependency, ownership, task-id or count
assignment changes"* and adds a parenthetical naming the four flipped Status cells and the implementation
commit that wrote them (`:21`) — the correction is narrower *and* attributed, which is better than the
deletion I would have accepted.

No requirement was dropped, no acceptance criterion narrowed, no scope added. The re-point is bookkeeping
plus one genuine dependency edge (T-12a gains `T-13`, moving batch 2 → 4); I checked that edge is real
rather than cosmetic, and that it changes no other row's batch. Under the frozen-round bar I find no
delta defect and no contradiction with the repository at HEAD.

## Batches

**One task moved batch, and the move is load-bearing rather than cosmetic.** T-12a's `Deps` cell goes from
`T-00, T-00a` to `T-00, T-00a, T-13`, and its Batch from `2` to `4`. The reason is stated in the row and
holds mechanically: the new host module is shared with T-04 (`[red]` matrix, batch 2) and T-13 (its
un-skip, batch 3), and the PLAN's own single-writer-per-batch rule then forces T-12a past batch 3. The
batch arithmetic paragraph is updated in place (`:182–186`) — `T-12a on T-00(1), T-00a(1), T-13(3) ⇒ 4`
— and carries the one derivation a reader would otherwise have to redo themselves: `T-19 on T-12(1),
T-12a(4), T-18(8) ⇒ 9`, unchanged because `max` is still T-18's 8. I re-derived both by hand; both are
right.

**No other batch, ownership or task-id moved,** and no task instruction changed. The substantive columns
of every other row are byte-identical to the text approved at v10 and re-confirmed at v11 and v12.

**Product priority ordering is untouched.** P0 work still precedes P1: the flag-off byte-identity
guarantee (`REQ-DECLEDGER-02`) is carried by T-02's baseline recording at batch 1 and T-10's four
not-enabled spellings at batch 2, both ahead of the P1 disclosure surface at batch 9. Every P0 and P1
requirement still owns at least one task; T-12a's move within the middle of the graph does not reorder
any requirement against any other.

**The disjointness premise was updated rather than left to rot.** The old text asserted "T-12a is the only
batch-2 writer of that file"; with T-12a out of batch 2 that sentence would have been true-but-stranded,
so v1.1 replaces it with "batch 4's second writer is T-12a, whose disclosure blocks go into
`decisionLedgerConfig.test.js`, which T-14 (the other batch-4 task) does not touch" (`:246–248`). I
checked batch 4's membership: T-14 writes `decisionLedgerRecognise.test.js` plus `orchestrate-dev.js`,
T-12a writes `decisionLedgerConfig.test.js` — disjoint, so the premise survives the move intact.

**The multi-owner paragraph now describes the right two files.** `decisionLedgerConfig.test.js` gets three
owners at batches 2 / 3 / 4, serialised by the real edges T-04 → T-13 → T-12a → T-19;
`documentOracles.test.js` drops back to a single writer, T-00a at batch 1, plus T-19's batch-9 *re-run*
of the `102` control, which the text is careful to say re-pins no literal (`:255–260`). That distinction
between writing a file and re-running an assertion in it is the one an implementer could get wrong, and
the document draws it explicitly.

## Dependencies

**Exactly one dependency edge was added, and it is a true edge.** T-12a → T-13 exists because T-12a's
disclosure blocks assert set-equality against three production constants (`DECISION_LEDGER_OMIT_REASONS`,
`DECISION_LEDGER_NOTICES`, `DECISION_LEDGER_DEFAULTS`) that T-13 is the task that lands; hosting the
blocks in T-04's module without depending on T-13 would have left a red that no `[green]` task owned. The
edge closes that, and it is recorded in the `Deps` cell rather than only in prose.

**No edge was removed, reversed or weakened.** The `[red]` → `[green]` predecessor relation for T-12a is
unchanged: T-19 still un-skips it, T-19's `Deps` still names `T-12, T-12a, T-18`, and the
§Red-before-green edges table still pairs `T-12, T-12a → T-19` — only the file named in that row's third
column changed (`:300`). The revised §Red-before-green prose says so in as many words: *"the predecessor
relation and the `T-19: …` block titles are unchanged by the move, only the file is"* (`:305–307`). I
verified the titles at HEAD are byte-identical `T-19: …` strings, so T-19's un-skip obligation binds the
same blocks it always did.

**The Status ledger is now internally consistent, which is what F-03 asked for.** At v12 the column read
four `✅` against twenty `⬚` while T-19's own dependency T-18 read `⬚` despite having shipped — a reader
would have concluded T-19 landed ahead of its dependencies. All 24 rows now read `✅`, and since every one
of them is true at HEAD (§Verification), no row is `✅` ahead of a `⬚` dependency. The Definition of Done
bullet "All 24 tasks ✅" (`:475`) is now a claim a reader can check against the column rather than one the
column contradicts.

**Requirement coverage is unchanged by all of this.** No task that owned a P0 or P1 requirement stopped
owning it; the re-point changes where an assertion lives, not what it asserts. `REQ-DECLEDGER-02`'s
flag-off byte-identity, the off-by-default config-example obligation, and REQ NG-6's no-`SKILL.md`-edits
constraint each still trace to a named task with a named falsifying assertion.

## Verification

Every claim below was run against the working tree at HEAD on branch `feat-pdlc-decision-ledger`.

| Claim under test | How checked | Result |
|---|---|---|
| Delta scope | `git diff --stat 521aa6681..HEAD -- PLAN-*.md` | `1 file changed, 51 insertions(+), 43 deletions(-)`; three commits `7f1341ff9`, `b62df6cb6`, `0869ce263` |
| F-01: T-12a's new host carries the family | `grep -n 'T-19:' __tests__/decisionLedgerConfig.test.js` | six blocks at `:395`, `:402`, `:409`, `:416`, `:435`, none skipped |
| F-01: the old host no longer claimed to carry it | `grep -c 'DECISION_LEDGER_OMIT_REASONS' __tests__/documentOracles.test.js` | `0` — matches the revised text, which now claims only the census exclusion and the `102` control there |
| F-01: no stale `documentOracles` reference left at a T-12a site | read `:107`, `:155`, `:171`, `:222`, `:237`, `:244`, `:255–260`, `:300`, `:489`, `:533` | all re-pointed; remaining mentions are T-00a's and the `102` control's, both correct |
| F-03: Status sweep is true — suites | `npm test -- __tests__/decisionLedger` in `pdlc/workflows` | **12 suites, 236 tests, all pass** — exactly the figure the v1.1 entry states |
| F-03: no `[red]` block left skipped | `grep -Ec '^\s*(describe\|test\|it)\.skip' __tests__/decisionLedger*.test.js` | zero across all twelve |
| F-03: T-12 (engine) done | `node --test __tests__/decision-ledger-config-example.test.js` | `pass 3 / fail 0` |
| F-03: T-19's config-example deliverable | read `.claude/pdlc.config.example.json` | carries `"decisionLedger":{"enabled":false,"maxEntries":70,"maxBytes":12500}` — off by default, C-5's three keys, set-equal |
| F-03: T-18 done | `grep -n 'DECISION LEDGER WIRING' orchestrate-dev.js` | sentinels at `:15688` / `:15709` |
| F-03: T-20 done | `git log -1 c49527fd4`; `node pdlc/workflows/build-runtime.mjs --check`; `plugin.json` | commit exists; `in-sync pdlc/workflows/dist/pdlc-cli.mjs`, exit `0`; `"version": "0.23.7"` — the constrained target the row names |
| T-00a's re-based census figure | `ls __tests__/*.test.js \| wc -l`; `npm test -- __tests__/documentOracles` | `166` raw at HEAD, matching the row's new parenthetical; suite green with the filtered count still `102` |
| T-12a's twelve-module manifest is set-equal to the PLAN's | compare `decisionLedgerConfig.test.js:447–459` against the file-ownership manifest (`:210–222`) | same twelve names, both directions |
| F-02: v1.0 clause narrowed | read `:21` | now *"no task **instruction**, batch, dependency, ownership, task-id or count assignment changes"*, with the four Status flips named and attributed to `724116d75` |

**Test-discipline checks, on the assertions this round touches.** *No implementation echoes:* the three
disclosure set-equalities derive their expected sets from the production constants by dynamic import and
compare them against the *documents*, so the spec-bearing side is never captured from the code under
test; T-12's engine-side literal is hand-transcribed. *No absence-only oracles:* the README/`CLAUDE.md`
block pairs its negative ("no key-by-key restatement") with a positive on the same path (both files name
`decisionLedger` and defer to `pdlc/OPERATIONS.md`). *Completeness is set-equality, not containment:* all
four enumerated sites — omission reasons, notice ids, config keys, and the twelve-module manifest — use
set equality, so a deleted case reds. The re-point moved these assertions between files without
weakening any of them; I diffed the block bodies to confirm.

**Upstream faithfulness (DEC-ERR-03).** The v1.1 entry claims all four pins were re-measured and are
byte-identical to v1.0's header. I re-derived them: REQ v1.10, FSPEC v1.4, TSPEC v1.3, DECISIONS v1.6,
Baseline `1.2 · 2026-08-28` — unmoved, so nothing is owed absorption and no pin needed rewriting. The
entry says exactly that rather than silently re-stamping.

## Delta-Confirmation Findings

No findings.

DEFERRED: `PROPERTIES-pdlc-decision-ledger.md` still pins older `PLAN` / `TSPEC` versions than the v1.1 header now carries — a PROPERTIES-phase re-grounding to make, not a defect in the document under review.
DEFERRED: the Definition of Done's "All 24 tasks ✅" (`:475`) is now true but still verified by a manual read of the Status column; a mechanical check would suit it better once the feature ships.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With T-12a hosted in `decisionLedgerConfig.test.js` and its blocks un-skipped, is anything still owed to `documentOracles.test.js` beyond T-00a's exclusion and T-19's `102` re-run? My reading of the manifest says no, and I raise this only so the answer is on the record for the DoD reviewer. |

## Positive Observations

- **The fix was made everywhere, not where the finding pointed.** I named four sites in F-01; the author
  found ten, including the two Definition-of-Done bullets and the §Coverage prose I had not enumerated. A
  half-applied re-point would have been worse than none, because the surviving mentions would have looked
  deliberate.
- **The batch move was reasoned through rather than papered over.** Re-hosting T-12a into a shared module
  created a real dependency; the author recorded the edge, re-derived the batch, checked that T-19's batch
  is unmoved, and repaired the disjointness premise and the multi-owner paragraph that the move
  invalidated. That is four consequences of one edit, all followed.
- **The Status sweep is evidenced, not asserted.** The v1.1 entry states the commands and their outputs —
  twelve modules, zero skips, 236 passing tests, `fail 0` on the engine side, `--check` in-sync, plugin at
  `0.23.7`. I re-ran each; every figure held. Writing the sweep in a falsifiable form is what made this
  review cheap.
- **F-02's correction is better than the fix I proposed.** I would have accepted deleting the over-broad
  clause; the author narrowed it to the columns it actually governs *and* attributed the four Status flips
  to the implementation commit that wrote them, which preserves the provenance a later reader will want.

## Recommendation

**Approved** — no findings. All three of my v12 findings (F-01 High, F-02 and F-03 Medium) are resolved
and independently verified at HEAD; the revision introduced no defect and contradicts nothing in the
repository or in the four upstream documents.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:4d40cfb228cd181571ad9d6247a23f0cc8974542f9c249a0e0f0fd26015fd8e3
APPROVAL-HASH-NORMALIZED: sha256:844eccde81bffb3254f4a824f7b0319d751179b0ff5d29ad2d5e6f8270653a57
REVIEWED-COMMIT: 0869ce263baaba1134e8aaaab63cd1d527bddab4
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:2c84d5250d13c57573eae0fde9ef1c00dd128ddd07169f5b7570c6c3911be49b
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240

# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.2)
**Date:** 2026-08-20
**Iteration:** 2
**Base of the delta:** `5acb37f6` (the commit at which v1 was written) → `94539626` (HEAD)

## Overview

**Scope of this round.** Delta re-review of the twelve commits between `5acb37f6` and `94539626`
(+185 / −67 lines on the PLAN). I read my v1 file, diffed the document against the commit I
reviewed, verified each of my twelve prior findings against the revised text and the repository,
and scanned only the changed material for new issues. Sections I approved in v1 and that the diff
did not touch — LI-08, LI-09, LI-11, LI-12, LI-16…LI-18, LI-20, the read-only manifest, P-Q-1…4 —
were not re-litigated.

**Disposition of the twelve v1 findings.** All five Highs are resolved, all four Mediums are
resolved, all three Lows are resolved.

| v1 | Sev | What v0.2 does | Resolved |
|---|---|---|---|
| F-01 | High | §Verification replaces the "full suite green" gate for batches 7–13 with a per-batch expected-red ledger, stated in `LI-AT-` test names wherever a suite splits across two green tasks, shrinking to empty at batch 13 | ✅ |
| F-02 | High | LI-14 is restated **green-terminal** (static parse of six suite files, no symbol under test); LI-15's "Greens `LI-T-SUITEMAP`" clause is deleted and replaced by "**only** `LI-T-PIN-1`"; batch 6's terminal state and the §Traceability row agree | ✅ |
| F-03 | High | LI-03 now names the instrument: a dedicated temp git repository as the script's `cwd`, **real** `git`, the throw injected through the script's fixture/import seam rather than `_git`, and the `worktree list` conjunct read from the temp repo's real `.git/worktrees/` state, explicitly not degradable to an argv assertion | ✅ |
| F-04 | High | LI-06 carries a three-step mutation proof — byte flip, deleted `{caseId}`, spurious `{caseId}` — each targeting a different clause, performed before the commit, recorded verbatim in the completion note, "a step that does not red is a halt, not a pass" | ✅ |
| F-05 | High | LI-01 owns `__tests__/learningsPremises.test.js`, one structural assertion per premise, in the file-ownership manifest at batch 1; the engine-failure triage is separated out as a written CI-evidence record | ✅ |
| F-06 | Med | `LI-T-IGNORE` becomes three conjuncts — root ignored, nested `.baseline-worktree` **not** ignored, `fixtures/learnings-baseline/` **not** ignored — which is the paired oracle LI-04's root anchoring lacked | ✅ |
| F-07 | Med | New **LI-23** authors `learningsArmInventory.test.js`: the twelve arms driven in one file, observed reason codes asserted **set-equal** to the three frozen catalogues; DoD 3 is discharged by the suite, LI-22's walk demoted to a human cross-check | ✅ |
| F-08 | Med | New DoD 12 states the capture script's coverage exemption, why `c8.include` cannot reach a root-level script, and the three oracles standing in for a floor | ✅ |
| F-09 | Med | §The measured baseline now carries the stage-2 per-file numbers and the finding that the bare `npm run test:coverage` never reaches stage 2; DoD 11 and new H-8 are stated against 88.14 % | ✅ |
| F-10 | Low | The change-surface table names all fourteen new test files and both LI-06 artifacts | ✅ |
| F-11 | Low | The arithmetic is restated as 24 rows over 17 files and reconciles with the tables | ✅ |
| F-12 | Low | P-2a is restated as "three object-literal sites plus one positional argument at the review-loop optimizer call" | ✅ |

**Everything above was re-measured, not read.** P-2a's shape is exactly as v0.2 now states it:
`dispatchKind: "authoring"` object literals at `pdlc/workflows/orchestrate-dev.js:12861`, `:12955`
and `:13657`, and the positional `"authoring"` argument at `:7663`, which is the `runWrapped(
optimizer, optPrompt, doc, "authoring", authorSessionKey(...))` call inside `reviewLoop`'s FAIL
path — the review-loop optimizer call, as the row says. `MODULE_NAMES` is
`["orchestrate-dev.js", "orchestrate-queue.js"]` at `pdlc/engine/scripts/prepack.mjs:20` (P-1).
`git check-ignore -v .baseline-worktree` still exits 1 at the root, so LI-03's conjunct (1) is red
at HEAD as claimed.

**Verdict of this round: Approved with minor changes.** Four Medium and two Low findings, none
gating. The four Mediums are all in material the revision newly added — three of them are one-
clause transcription fixes an implementer would otherwise have to decide alone, and the fourth is
a gate row that is missing the conjunct its three sibling rows carry.

## Batches

**What changed in the task table.** One new task (LI-23), seven rows rewritten (LI-01, LI-02,
LI-03, LI-06, LI-07, LI-10, LI-14, LI-15, LI-19, LI-21, LI-22), and the row ids lost their bold
markers so the manifest parser does not near-miss them. I checked each rewritten row against the
repository and against the upstream text it transcribes.

| Row | Claim checked | Result |
|---|---|---|
| LI-01 | `learningsPremises.test.js` is new; P-1, P-2a, P-3, P-4, P-10 hold at HEAD in the shape the row now states | ✅ — no `learnings*` file exists under `pdlc/workflows/__tests__/`; the four `"authoring"` sites are `:12861`, `:12955`, `:13657` (object literal) and `:7663` (positional), exactly as restated |
| LI-02 | The three AC-2.6 corpora match the requirement they serve | ✅ — `DISCARDED-NESTED`, `DISCARDED-DIRECT` and `COMPLETED-MIXED` are a literal transcription of REQ AC-2.6's three limbs (`REQ:304–307`) and of FSPEC E-07/E-35/E-20 (`FSPEC:699`, `:700`, `:718`) |
| LI-02 | "No jest globals in this helper" | ✅ — this is the right answer to my Q-04: LI-05's script imports the helper from a plain node process, and `jest.fn` would throw there |
| LI-03 | Temp-repo instrument, real `git`, fixture/import seam for the throw, three ignore conjuncts | ✅ — resolves F-03 and F-06 together, and answers Q-03 for both probes |
| LI-06 | Three-step mutation proof, each step targeting a different clause | ✅ — byte flip hits the digest literal, deletion hits set equality, spurious directory hits set equality from the other side; the row says all three are required and a non-red step halts |
| LI-07 | AT-15's clause split | ⚠️ — see F-03 below: the row calls AT-15 "three clauses", but `FSPEC:836–841` has a fourth (E-35's directly-pathed document is a corpus member, is selected, and carries no exclusion reason) |
| LI-10 | BR-10's two loci, locus 2 attributed to LI-21 | ✅ — matches TSPEC §D.2's split; the row explains why writing both and attributing both to LI-19 would halt batch 11 on a correct-but-early test |
| LI-14 | Green on authoring, read by static parse | ✅ — resolves F-02 and answers Q-02 explicitly ("never by importing the suite"), which is what makes the assertion well-defined before any production symbol exists |
| LI-23 | The three set equalities are *achievable* against the frozen catalogues | ⚠️ — the `rejected[].reason` and notice equalities close exactly; the `corpusOutcome` one does not. See F-01 |
| LI-21 | The report-shape rows are named | ✅ — `LI-AT-23`, `LI-AT-24`, `LI-AT-31`, which answers Q-01 and is what makes the batch-12 ledger row evaluable |

**LI-23's catalogue arithmetic, checked member by member.** This is the new task's load-bearing
claim, so I re-derived it from TSPEC §D.1 (`TSPEC:581–585`) against the twelve-arm table:

- `LEARNINGS_REJECT_REASONS` has six members — `RSN-COUNT`, `RSN-BYTES`, `RSN-SELF`,
  `RSN-UNREADABLE`, `RSN-UNPARSEABLE`, `RSN-NO-MATERIAL`. The twelve arms enter exactly those six
  (`RSN-UNREADABLE` twice, via `null` and via throw). **Set equality is satisfiable and tight** —
  no member is unreachable from the inventory's own fixtures, and no arm contributes a value
  outside the catalogue.
- `LEARNINGS_NOTICES` has two members, both entered by AT-32 cases 2 and 3. **Tight.**
- `LEARNINGS_CORPUS_OUTCOMES` has two members, both entered — but the observed *field* also carries
  `null` on every healthy dispatch (`TSPEC:612`, `corpusOutcome: null`), and an inventory that
  drives `RSN-COUNT`/`RSN-BYTES`/`RSN-SELF` **must** run healthy dispatches to reach them. The
  observed set is therefore `{null, "RSN-UNLISTABLE", "RSN-EMPTY"}`. **Not satisfiable as
  written** — F-01.

**No same-batch same-new-file collision was introduced.** Batch 5 grows from three tasks to four
(LI-10, LI-11, LI-12, LI-23) over four distinct new files; batch 1 is LI-01 alone over its own new
file. LI-19 and LI-21 now name suites in their `Test File` column that they green but do not write
(`learningsSelect`, `learningsRecord`, `learningsArmInventory`) — the document's own note that
`Test File` means "the suite the task greens, not the suite it writes" keeps that from reading as a
second writer, and the file-ownership manifest is the authority that agrees.

**Every implementation task still has a preceding red-test row referencing the same suite.** The
two new green attributions come with their edges: LI-19 → LI-07 for `LI-AT-15`'s corpus-level
clauses, LI-21 → LI-23 for the arm inventory. LI-06 remains the one oracle with no red predecessor,
and is now the one oracle with an explicit falsification proof instead.

## Dependencies

**Batch-DAG re-derivation, redone from scratch over all 23 rows.** The task table gained a row and
three edges, so I did not trust the v1 derivation — I recomputed `batch == max(dep batch) + 1` for
every row from its declared `Deps`:

| Task | Deps (batch) | Derived | Column | |
|---|---|---|---|---|
| LI-01 | — | 1 | 1 | ✅ |
| LI-02, LI-03, LI-13 | LI-01 (1) | 2 | 2 | ✅ |
| LI-04 | LI-03 (2) | 3 | 3 | ✅ |
| LI-05 | LI-02 (2), LI-03 (2) | 3 | 3 | ✅ |
| LI-07, LI-08, LI-09 | LI-02 (2) | 3 | 3 | ✅ |
| LI-06 | LI-04 (3), LI-05 (3) | 4 | 4 | ✅ |
| LI-10, LI-11, LI-12 | LI-02 (2), LI-06 (4) | 5 | 5 | ✅ |
| **LI-23** | LI-02 (2), LI-06 (4) | 5 | 5 | ✅ |
| LI-14 | LI-07…LI-12 (max 5) | 6 | 6 | ✅ |
| LI-15 | LI-06 (4), LI-13 (2), LI-14 (6) | 7 | 7 | ✅ |
| LI-16 | LI-15 (7), LI-07 (3) | 8 | 8 | ✅ |
| LI-17 | LI-16 (8), LI-08 (3) | 9 | 9 | ✅ |
| LI-18 | LI-17 (9), LI-09 (3) | 10 | 10 | ✅ |
| **LI-19** | LI-18 (10), LI-10 (5), **LI-07 (3)** | 11 | 11 | ✅ |
| LI-20 | LI-19 (11), LI-11 (5) | 12 | 12 | ✅ |
| **LI-21** | LI-20 (12), LI-12 (5), **LI-23 (5)** | 13 | 13 | ✅ |
| LI-22 | LI-21 (13) | 14 | 14 | ✅ |

Twenty-three rows, ids unique, every dependency resolves to a declared row, graph acyclic, and
every derived batch equals its column. The three added edges are all *slack* edges — none of them
moves a batch — which is the right shape: they exist to make an obligation structural, not to
reorder work.

**The two new red-before-green edges are correctly directed.** `LI-19 → LI-07` exists because LI-19
greens clauses that live in LI-07's suite; without it, a green would be attributed to a task that
could run before the red exists. `LI-21 → LI-23` exists because LI-21 is the last task after which
all twelve arms are reachable — I checked that against the twelve-arm table: the last arms to
become reachable are AT-32's two notice arms, which the table itself attributes to `LI-12 / LI-21`.
The edge is therefore not merely conservative, it is exact.

**`LI-15 → LI-14` is correctly re-labelled as ordering, not red-before-green.** This was the second
half of my F-02, and the edge-rationale table now says so in the row itself, with the reason (the
suite map is the closure check and must be authored before the source lane starts moving names).

**One edge rationale does not survive the new row it was extended to cover.** The row
`LI-10, LI-11, LI-12, LI-23 → LI-06 | data | the L3 byte-identity claims (AT-23, AT-24, AT-31)
compare against committed baseline prompts` had `LI-23` appended to its subject list without its
justification being extended: LI-23 carries **no** FSPEC AT and makes no byte-identity claim — its
three tests are `LI-T-ARMS-1…3` over reason-code sets. The edge is harmless (LI-23 sits in batch 5
either way, alongside the suites whose fixtures it shares) but the stated reason is not its reason.
Filed as F-06, Low. See F-06 for the wording that would make it true.

**Batch-safety rule 2 still holds after the file-ownership rewrite.** The manifest is now one row
per (file, owning task) — 24 rows over 17 distinct files, ten production rows over three files and
fourteen test rows over fourteen files. I counted the rows and the distinct paths in both tables and
both figures reconcile, which closes F-11. Every one of the 23 tasks owns at least one row (LI-01
now does, which was F-05; LI-06 owns two, its guard and its guarded subtree). No two rows share a
batch and a file.

## Verification

**I re-ran the coverage measurement the revision added, and it reproduces to the digit.** On a
committed tree at `94539626`:

```
cd pdlc/workflows
npx c8 npm test -- --runInBand --testPathIgnorePatterns \
  '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'
Test Suites: 98 passed, 98 total
Tests:       70 skipped, 3828 passed, 3898 total

npx c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0
All files             |   96.84 |    88.21 |    92.2 |   96.84
 build-runtime.mjs    |   98.12 |    88.23 |     100 |   98.12
 orchestrate-dev.js   |   97.27 |    88.14 |   95.02 |   97.27
 orchestrate-queue.js |   93.18 |    88.75 |   71.42 |   93.18     → exit 0
```

Every number in §The measured baseline's new block is exact, including the 3.14-point headroom on
`orchestrate-dev.js` that DoD 11 and H-8 are stated against. The claim that the bare
`npm run test:coverage` cannot be the gate is also correct at the mechanism level:
`pdlc/workflows/package.json`'s `test:coverage` is `c8 npm test -- --runInBand && c8 report
--check-coverage --per-file --branches 85 …`, two stages joined by `&&`, and stage 1 has no
`--testPathIgnorePatterns`, so it inherits `documentOracles` and exits 1 before stage 2 runs. F-09
is fully closed, and closed with a measurement rather than an assertion.

**The `c8.include` exemption in DoD 12 is accurate.** `pdlc/workflows/package.json`'s `c8.include`
is exactly `["orchestrate-dev.js", "orchestrate-queue.js", "build-runtime.mjs"]` and the block is
rooted at `pdlc/workflows/`, so a repository-root `scripts/*.mjs` genuinely cannot be added without
re-rooting it. Naming the three oracles that stand in for a floor — `LI-T-IGNORE`'s three
conjuncts, `LI-T-WORKTREE`'s two, and the baseline guard computed over the script's own output — is
the right disposition for a human-invoked one-shot, and it is now stated rather than silent. F-08
closed.

**The expected-red ledger is evaluable batch by batch, which was the whole of F-01.** I walked it
against the green claims in the task rows:

| After | Task's green claim | Ledger row | Agree |
|---|---|---|---|
| 7 | `LI-T-PIN-1` only | seven whole suites still red | ✅ |
| 8 | `learningsSelect` except AT-15's report clauses | `learningsSelect → LI-AT-15 only`, plus six suites | ✅ |
| 9 | `learningsBlock` | `LI-AT-15`; five suites | ✅ |
| 10 | `learningsCorpus` | `LI-AT-15`; four suites | ✅ |
| 11 | `learningsRecord` per-dispatch rows + AT-15's clauses | `learningsRecord → LI-AT-22 locus 2 only`; three suites; "`LI-AT-15` greens here" | ✅ |
| 12 | `learningsDispatchSet` except report-shape rows | `LI-AT-22` locus 2; `LI-AT-23`/`LI-AT-24`/`LI-AT-31`; two suites | ✅ |
| 13 | config, arm inventory, AT-22 locus 2, remaining dispatch-set rows | **empty** | ✅ |

It shrinks monotonically, it shrinks by exactly what each task claims, it reaches empty one batch
before the unqualified gate, and it is stated in test names wherever a suite is split. A dispatcher
can evaluate every one of these rows without reading prose. The stipulation that "a suite dropping
out of the ledger early is as much a failure as one lingering" is what keeps it from being a
containment check — it is the set-equality form of a gate, and it is the right form.

**The green-terminal gate row is the one gate wording that lost a conjunct.** The RED-terminal row
carries "*and* every pre-existing test's status is unchanged from the baseline above"; the
batches 7–13 row carries "no other test's status moves from the measured baseline"; batch 14's row
carries the arrangement's exclusions "and no others". The new green-terminal row (batches 1, 4, 6)
carries only "the batch's new suite is green on authoring" and a prohibition on inventing a red for
it. Nothing in it can fail on a regression those batches could cause — and batch 4 is the batch
that commits an entire new fixture subtree into a tree that `coveredViolations` walks in full
(`pdlc/workflows/lib/document-oracles.mjs`, skipping only `.git/` and `node_modules/`). Filed as
F-02, Medium: the fix is one conjunct, copied from the row above it.

**DoD 3 is now discharged by an oracle rather than by a reading**, which was F-07, and DoD 4's
strengthening over REQ is now declared as a strengthening rather than smuggled in as a restatement.
DoD 11/12 are measured. H-8 is a new halt row with a number in it. The Definition of Done as a whole
is now falsifiable at every numbered item except item 10, which is explicitly outside this PLAN's
task rows (PROPERTIES, Phase P) and correctly marked so.

**One factual correction inside the new baseline prose.** The revision adds: "`consumerCleanup.test.js`
asserts `git status --porcelain` over **tracked** files is empty (`AT-4.1`)". The test at
`pdlc/workflows/__tests__/consumerCleanup.test.js:149` runs `git status --porcelain` at the
repository root with no `-uno`, so its output includes untracked entries as `??` — I verified this
by touching a file at the root and reading the porcelain output. The operative conclusion the PLAN
draws is right and in fact understated; the mechanism as stated is not, and the difference matters
for a feature that authors fourteen new files. Filed as F-04, Medium.

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

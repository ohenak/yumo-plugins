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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | LI-23's `corpusOutcome` set equality is unsatisfiable as written: the observed field carries `null` on every healthy dispatch, and the inventory must run healthy dispatches to reach `RSN-COUNT`/`RSN-BYTES`/`RSN-SELF`. Scope the assertion to non-`null` observed values | LI-23; §Traceability twelve-arm table |
| F-02 | Medium | Local | The green-terminal gate row (batches 1, 4, 6) omits the "every pre-existing test's status is unchanged from the baseline" conjunct its three sibling gate rows carry, so those batches have no oracle for a regression they could cause — batch 4 commits a fixture subtree into a tree `coveredViolations` walks in full | §Verification, the three gate wordings |
| F-03 | Medium | Local | LI-07 calls FSPEC AT-15 "three clauses"; it has four — E-35's directly-pathed document is a corpus member, is selected, and carries no exclusion reason. An implementer transcribing the row drops a positive-selection clause | LI-07; §Traceability AT-15 split-green row |
| F-04 | Medium | Local | §The measured baseline states `consumerCleanup.test.js`'s `AT-4.1` asserts porcelain "over **tracked** files"; the call has no `-uno`, so untracked `??` entries red it too — the likelier dirt in a feature that authors fourteen new files | §Verification, the measured baseline |
| F-05 | Low | Local | `LI-T-SUITEMAP` static-parses six named suite files, so an `LI-AT-` name registered in any of the other eight new suites escapes the closure check. Set equality over the directory rather than over a hardcoded six would close it | LI-14; DoD 1 |
| F-06 | Low | Local | The `→ LI-06` edge rationale cites "the L3 byte-identity claims (AT-23, AT-24, AT-31)", which LI-23 does not carry; LI-23's real reason for the edge is the shared L3 fixture matrix | §Dependencies, why each edge exists |

### F-01 (Medium) — the arm inventory's corpus-outcome equality cannot pass as stated

LI-23 is the right answer to F-07 and I want it to ship. Its arithmetic is also better than it
needed to be: I checked all three catalogues member by member against the twelve-arm table and two
of them close **exactly** — the six `LEARNINGS_REJECT_REASONS` members are each entered by a named
arm and no arm contributes anything outside them, and the two `LEARNINGS_NOTICES` members likewise.
That is a genuinely tight set equality, and it is why the suite is worth having.

The third does not close. TSPEC §D.2 pins the healthy value of the field explicitly —
`corpusOutcome: null, // | "RSN-UNLISTABLE" | "RSN-EMPTY"` (`TSPEC:612`, repeated at `:626`) — and
three of the twelve arms (`RSN-COUNT`, `RSN-BYTES`, `RSN-SELF`) are *rejection* arms that fire on
runs whose corpus **is** listable and non-empty. Driving them necessarily observes
`corpusOutcome === null`. The observed set is `{null, "RSN-UNLISTABLE", "RSN-EMPTY"}` and
`LEARNINGS_CORPUS_OUTCOMES` has two members, so `LI-T-ARMS-{n}` reds at batch 13 for a reason that
is not a defect in the implementation — and the batch-13 ledger row says the ledger is empty there,
so the wave halts on a correct implementation.

**What to change:** one clause in LI-23 and the matching clause in the twelve-arm table's closing
paragraph — *"every **non-`null`** `corpusOutcome` value observed"*. Do not fix it by adding `null`
to the expected literal: `null` is not a catalogue member, and a test whose expected value is
"catalogue ∪ {null}" no longer transcribes the frozen literal it exists to pin. The non-`null`
scoping keeps the assertion a literal transcription of `LEARNINGS_CORPUS_OUTCOMES`. Worth stating
in the row too that the healthy `null` is separately asserted by the record suite, so scoping it out
here is not a coverage loss.

*(TSPEC §D.1's own domain wording has the same gap — "one test per domain asserts that every value
it ever carries is a member of that field's catalogue" (`TSPEC:589–592`) is false for the
`corpusOutcome` domain as `TSPEC:612` defines it. Routed as an erratum, not charged to this PLAN.)*

### F-02 (Medium) — the green-terminal gate cannot fail on a regression

The revision correctly split one gate wording into three. Two of the three carry a
pre-existing-status conjunct and the third does not:

- RED-terminal (2, 3, 5): "…**and** every pre-existing test's status is unchanged from the baseline
  above."
- Mixed (7–13): "…no other test's status moves from the measured baseline."
- Green-terminal (1, 4, 6): "The batch's new suite is **green on authoring** … None has a red
  episode, and none may be *given* one by inventing a symbol for it to miss."

The third states only what the batch's own new file does. A batch that greened its own suite and
reddened three others satisfies it as written. That is not hypothetical for batch 4: LI-06 commits
`__tests__/fixtures/learnings-baseline/**` — an entire new subtree of prompt text — into a tree
that `coveredViolations` walks in full, skipping only `.git/` and `node_modules/`
(`pdlc/workflows/lib/document-oracles.mjs`), and that the porcelain instrument of
`consumerCleanup.test.js:149` reads at the repository root. Batch 1 and batch 6 are lower risk but
free to cover.

**What to change:** append the conjunct from the row above it — *"…and every pre-existing test's
status is unchanged from the measured baseline"* — to the green-terminal row. One clause, and all
three gate wordings then share the same invariant.

### F-03 (Medium) — AT-15's fourth clause is not in the clause enumeration

LI-07's new passage is a good piece of work: it is precisely right that AT-15 cannot be greened
whole by LI-16, that it must stay one test in one suite so the partition survives, and that
"eligibility/ordering/count only" scopes rules rather than licensing a dropped clause. The
enumeration it hangs that on is short by one.

`FSPEC:836–841` gives AT-15 as: *Given* nested `docs/discarded/{feature}/LEARNINGS-*.md`, *then*
(1) nothing is selected, (2) the report carries corpus-level `RSN-EMPTY`, (3) no discarded document
appears in any record. ***And given*** *a one-file fixture holding exactly
`docs/discarded/LEARNINGS-x.md`, then* (4) it is a corpus member, is selected, and carries no
exclusion reason (E-35). The PLAN names (1), (2), (3) and says "only the first is the pure core's".
Clause (4) is also the pure core's, and it is the *positive* half of the pair — the assertion that
keeps clause (1) from being an absence-only oracle over path handling.

The coverage is not actually lost: LI-02 ships `DISCARDED-DIRECT` explicitly "for AT-15 and AT-16",
so the fixture exists and its purpose is named. The defect is that the row an implementer
transcribes from enumerates three of four clauses, and a set-equality reader would conclude the
fourth is out of scope.

**What to change:** state AT-15 as four clauses, with (1) and (4) greened by LI-16 and (2)/(3) by
LI-19, and carry the same split into §Traceability's AT-15 row ("LI-16 for the eligibility clauses
— both the nested exclusion and E-35's direct-path inclusion").

### F-04 (Medium) — porcelain is not tracked-only

`pdlc/workflows/__tests__/consumerCleanup.test.js:144–154` runs
`execFileSync("git", ["status", "--porcelain"], {cwd: <repo root>})` and asserts the output is `""`.
No `-uno`, so the default `-unormal` applies and untracked files appear as `??`. I confirmed this
empirically: touching a file at the repository root produces `?? <path>` in that exact invocation.

The PLAN's conclusion ("any uncommitted edit anywhere in the repository … reds it") is therefore
correct and understated, but the mechanism it gives is wrong in the direction that matters here.
This feature authors fourteen new files; the state an implementer will most often be in mid-batch is
"new file written, not yet added", which the PLAN's wording implies is safe and which in fact reds a
pre-existing suite that all three gate wordings measure against.

**What to change:** *"asserts `git status --porcelain` at the repository root is empty — untracked
files included, since the call carries no `-uno`, so a new test file that has been written but not
committed reds it exactly as an uncommitted edit does."*

### F-05 (Low) — the closure check is closed over six files, not over the directory

`LI-T-SUITEMAP` asserts the six AT-bearing suites' lists are pairwise disjoint and set-equal to the
35-member literal, read by static parse of those six files. Nine other new test files exist by the
end of the feature (`premises`, `captureScript`, `predicatePin`, `baselineGuard`, `suiteMap`,
`armInventory` and the helper). An `LI-AT-` name registered in one of those is invisible: the six
lists still partition 35, and the duplicate ships. This is not new in v0.2 — LI-23 makes it one file
wider, which is what brought it back into view. Cheap fix: enumerate `__tests__/learnings*.test.js`
from disk, assert the *set of files carrying `LI-AT-` names* equals the six, then partition. That
makes the closure a set equality over the directory rather than over a hardcoded list.

### F-06 (Low) — an edge rationale extended to a task it does not describe

`§Dependencies` → *why each edge exists* now reads
`LI-10, LI-11, LI-12, LI-23 → LI-06 | data | the L3 byte-identity claims (AT-23, AT-24, AT-31)
compare against committed baseline prompts`. LI-23 carries no FSPEC AT and asserts nothing about
bytes; its tests are `LI-T-ARMS-1…3` over reason-code sets. Its real reason for depending on LI-06
is the L3 fixture matrix and the batch-5 co-location with the suites whose fixtures it shares.
Split the row, or extend the justification: *"…and LI-23 for the L3 fixture matrix the twelve arms
are driven through"*. The batch column is unaffected either way.

## Questions

All five of my v1 questions are answered in v0.2 — Q-01 by LI-21 naming the report-shape rows as
`LI-AT-23`/`LI-AT-24`/`LI-AT-31`, Q-02 by LI-14 declaring static parse over import, Q-03 by LI-03's
temp-repo instrument, Q-04 by LI-02's no-jest-globals rule, Q-05 by batch 3's per-suite gate reading.
Two new questions, neither gating.

| ID | Question |
|----|---------|
| Q-01 | LI-23 drives all twelve arms "in-file over its own fixtures", and its `rejected[].reason` equality is tight against the six-member catalogue. Does it therefore need its own AC-2.6-shaped path fixtures for `RSN-SELF`, or does `buildLearningsCorpus`'s spec surface (LI-02, now carrying declared repository paths) already cover every arm's fixture need? If a thirteenth fixture shape is required, LI-02 is where it belongs and its row does not currently name it |
| Q-02 | P-A-1 says a mid-feature re-capture becomes "a second owner row in the manifest for both files, in the batch that needs it". Does that row get added to the PLAN at the time (making the manifest a live document the dispatcher re-reads), or is the amendment recorded only in the task's completion note? The dispatcher's manifest check is what enforces single-writer, so the answer decides whether a re-capture is auditable by the same mechanism as everything else |

## Positive Observations

- **Every one of my five High findings was answered at the mechanism, not at the wording.** F-05 did
  not become a stronger sentence about pre-flight rigour — it became a suite with an owner, a batch,
  a manifest row and a stated failure mode ("it reds the moment a rebase moves a premise mid-wave").
  F-04 did not become a promise to be careful — it became three named mutations, each targeting a
  different clause, with "a step that does not red is a halt, not a pass". That is the difference
  between a document that has absorbed a review and one that has deflected it.
- **The expected-red ledger is the best artifact in this revision.** It is stated in test names
  where suites split, it shrinks by exactly what each task claims and no more, and it reaches empty
  one batch before the unqualified gate so batch 14 has something green to refactor against. The
  stipulation that early-greening is as much a failure as lingering-red is what makes it a set
  equality rather than a containment check — a dispatcher can evaluate all seven rows mechanically.
- **The coverage baseline was measured, not asserted, and it reproduces to the digit.** I re-ran
  both stages: 98 suites, 3828 passed, `orchestrate-dev.js` at 88.14 % branch. The finding that the
  bare `npm run test:coverage` never reaches stage 2 (stage 1 has no ignore patterns and inherits
  `documentOracles`) is the kind of thing a document usually discovers during implementation. H-8
  turning the 3.14-point headroom into a named halt condition, with "lowering the floor to fit the
  code is the repair that must not be made", is exactly the right shape for a coverage claim.
- **LI-23's two tight set equalities.** Six reject reasons, six arms, no member unreachable and no
  arm outside the catalogue; two notices, two arms. That the third equality has a `null` problem
  does not diminish this — the inventory was designed so that the catalogues and the arms are the
  same twelve facts counted two ways, which is what makes "an arm silently stops being entered" red
  a test instead of surviving a reading.
- **LI-14's disposition is the honest one.** The easy fix to F-02 was to invent a symbol for the
  suite map to miss so it could have a red episode like everything else. The revision refused that
  explicitly — "none may be *given* one by inventing a symbol for it to miss" — and instead stated
  what the suite actually is: green on authoring, valuable as regression pressure. A PLAN that
  declines a false red to preserve a uniform-looking table is a PLAN I trust on the other rows.
- **The split greens are modelled rather than hidden.** AT-15 across LI-16/LI-19 and AT-22 across
  LI-19/LI-21 each get a §Traceability row, an edge, a ledger entry and a restated count
  (`(8+1) + 3 + 3 + (5+1) + 12 + 2 = 35`, "a split green is two green tasks for one test, never two
  tests"). The alternative — attributing both loci to LI-19 — would have halted batch 11 on a
  correct test, and the row says so.
- **P-A-1 and P-A-2 answer the two questions a task actually depends on**, and answer them with a
  bar rather than a preference: a re-capture is an amendment to LI-06 owned by the task that caused
  it, with the mutation proof re-run because re-transcription is exactly the operation whose slips
  it catches; and a moved premise halts first, then classifies on "does fixing it decide something
  REQ has not decided". Both are testable distinctions, not judgement calls.
- **Nothing regressed.** The batch column re-derives cleanly over 23 rows including three new edges,
  no same-batch same-new-file collision was introduced, every implementation task still has a
  preceding red-test row naming the same suite, and the manifest arithmetic now reconciles with the
  tables it summarises.

## Recommendation

**Approved with minor changes**

All five v1 High findings are resolved, and resolved structurally: LI-01 has an owned falsifiable
artifact, LI-14's terminal state matches what its assertion can actually do, LI-03 names a real
instrument in a real temp repository, LI-06's unfalsifiable guard has three named mutations, and
batches 7–13 have a ledger a dispatcher can evaluate. The four Mediums and three Lows are resolved
too. I re-derived the batch DAG over all 23 rows and re-ran the coverage measurement; both check out
exactly as documented.

Six new findings, none gating. Three are one-clause fixes to material the revision newly added and
should be made before implementation begins, because each is a decision an implementer would
otherwise have to make alone at the point of authoring:

1. **F-01** — scope LI-23's `corpusOutcome` equality to **non-`null`** observed values; as written
   it reds at batch 13 against a correct implementation, on an empty ledger row.
2. **F-02** — append the pre-existing-status conjunct to the green-terminal gate row, so batches 1,
   4 and 6 can fail on a regression they cause.
3. **F-03** — state AT-15 as four clauses, with E-35's direct-path inclusion greened by LI-16.
4. **F-04** — correct the porcelain mechanism to include untracked files.
5. **F-05**, **F-06** — the suite map's closure over the directory, and one edge rationale.

One upstream defect this PLAN correctly does not own is routed as an erratum: TSPEC §D.1's
domain-membership wording (`TSPEC:589–592`) is false for the `corpusOutcome` domain as §D.2 defines
it (`TSPEC:612`), which is the same `null` gap F-01 describes one level down. It is charged to the
TSPEC, not to this verdict.

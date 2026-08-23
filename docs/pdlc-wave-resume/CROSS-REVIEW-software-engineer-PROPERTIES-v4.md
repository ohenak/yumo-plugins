# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md` (Version 1.3)
**Date:** 2026-08-23
**Iteration:** 4
**Scope:** delta re-review — my own v3 findings, plus new issues in the sections this revision
changed. Sections unchanged since v3 are not re-litigated.

## Prior findings — disposition

Diffed `de843006..HEAD` on the document: 100 insertions, 43 deletions across nine commits
(`a431143c` … `91ce118c`). Every prior finding was re-checked by re-running the command in this
tree, not by reading the revision's account of itself.

| v3 finding | Severity | Disposition |
|---|---|---|
| F-06 — the "pre-rebase tree" premise is false; G-4 routes a remediation that does not exist | High | **Resolved** |
| F-07 — § 11's local-red enumeration omits `PROP-SWEEP-2(b)`, which halts every wave gate | High | **Resolved** |
| F-08 — triage fixture obligation stated stricter than the seam | Low | **Resolved** |

### F-06 — re-verified command by command

The revision replaced the grounding table wholesale. I re-ran every row:

| Row as now stated | My run | Verdict |
|---|---|---|
| `git rev-list --count HEAD..origin/main` → `0`; `merge-base --is-ancestor origin/main HEAD` exit 0 | `0`; exit 0 | ✓ |
| `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` → `10`; `:12864 export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` | `10`; exact line and number | ✓ |
| `.gitignore:46 /.claude/pdlc-wave-state.json` (and `:30`, its comment) | both present, at those numbers | ✓ |
| `test:coverage` `:9`, `c8` `:12`, `fast-check` `:13` in `pdlc/workflows/package.json` | all three, at those numbers | ✓ |
| `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json` and `pdlc/workflows/coverage/**` tracked, introduced by `b1b846bd` on this branch | `git ls-files .claude/` returns those two plus `pdlc.config.example.json` and `settings.json`; `git log --oneline -1 -- .claude/pdlc-wave-state.json` → `b1b846bd` | ✓ |

The corrected consequence is the important half and it is stated correctly: the rebase *has* landed,
T-01's pre-flight is expected **green** here, and PROP-REPO-01's failure is its **third** conjunct
only — `check-ignore` skipping tracked paths — with `git rm --cached` as the remedy and no rebase
clearing it. G-4 now says that plainly, and says the earlier diagnosis was wrong rather than quietly
overwriting it. The `advisoryHelperProperties.test.js` row in § Test files → status was corrected in
the same pass; the file is present here (verified). **F-06 is closed.**

### F-07 — re-verified by running the suite

`npm test -- --runInBand __tests__/documentOracles.test.js` in this tree: **3 failed, 32 passed**,
and the three are exactly the three the revised § 11 now enumerates —
`none of the six machine-local artifacts are tracked`,
``the only tracked files under `.claude/` are the two shared, reviewable ones``, and
`PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty`. I re-checked the
cause: `A1_GLOBS` (`documentOracles.test.js:712`) carries `docs/pdlc-plugin-retirement/**`,
`docs/pdlc-advisory-wave-gate/**` and `docs/pdlc-learnings-injection/**` and **not**
`docs/pdlc-wave-resume/**`, and `docs/_constraints/pdlc-retirement-baseline.md` has no row for this
feature's directory. The new § 11 red table names both reds, separates their owners, and states the
`docs/pdlc-advisory-wave-gate/**` precedent verbatim; the missing owner is routed as an
`ERRATUM: PLAN` row in § Findings routed upstream. **F-07 is closed.**

### F-08 — closed at the seam

Queue fixture 2 now reads "whose last **`TRIAGE:` line** is `TRIAGE: ready`", spells out the
bottom-up scan and the `/^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i` match, and says why the
stricter phrasing was a hazard. That is the seam's behaviour, not a paraphrase of it. **Closed.**

### Questions carried into this round

Q-06 and Q-07 were both answered in the document rather than deferred: § 11 gained an explicit
"which reading of the threshold is intended" block (see F-01 below for what is still missing from
it), and the § Overview consequence now states that the pre-implementation properties are **green**
here and why that is a different, still-worthwhile claim. AT-12's traceability row was annotated
partial and PROP-SKIP-04 re-traced to "fourth conjunct, less the commit clause"; I checked
`TSPEC:755` — AT-12's fourth conjunct is indeed "Phase PT dispatches exactly one agent, invokes the
gate exactly once, and its commit is the only Phase-I-adjacent commit", and PROP-SKIP-03 covers the
first two clauses while PROP-SKIP-04 covers the `add`-list. The labelling is accurate.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | PROP-COV-01's re-measured delta guard has no executable procedure at the task that owns it: T-10 runs in batch 4, *after* T-07 has changed `orchestrate-dev.js`, so "the number T-10 measures immediately before applying this feature's diff" cannot be measured in the tree T-10 runs in, and the stated fallback condition — "if T-10 finds the module unchanged since" — can never be literally true, because this feature is what changes the module. | § 11 → "Which reading of the threshold is intended" |
| F-02 | Medium | Local | The untrack remedy for the first local red is named as "orchestrator-owned repo hygiene, reported from this document" but is routed through prose only, while its sibling red — with the same halting consequence — is routed as an `ERRATUM: PLAN` row. The channel the pipeline actually reads is the routed-findings table, so as written the item has a correct diagnosis and no mechanical owner. | § Gaps G-4; § 11 red table row 1 |
| F-03 | Low | Local | The grounding table's "`git rev-list --count origin/main..HEAD` → `478`" is `487` in this tree today — drifted by the document's own subsequent commits. A commit-count is self-invalidating in a table whose stated discipline is reproducibility; cite the measured HEAD sha instead. | § The tree these properties are written against |

### F-01 (Medium) — the delta guard is stated but not made measurable

The new block reads: PROP-COV-01's floor is `≥ 85` **and** `≥ the number T-10 measures on
`orchestrate-dev.js` immediately before applying this feature's diff`, with `88.75` as the value
measured on 2026-08-23 "and the figure to use if T-10 finds the module unchanged since". The
*intent* is right and it is the right answer to my Q-06 — an unrelated upstream commit that drops the
module to 88.60 should not block T-10, a drop caused by this feature's own ~20 branches should. Two
mechanics are missing to make it executable:

1. **The pre-diff measurement has no home.** PLAN `T-10` (§2.1) runs in batch 4 with
   `Deps: T-07, T-08, T-03, T-04`; T-07 has already written the announcement and classifier branches
   into `orchestrate-dev.js` by then. Measuring the module "immediately before applying this
   feature's diff" therefore needs a second tree — and the precedent exists in this very package:
   `pdlc/workflows/package.json`'s `//c8` note records that `exclude` drops "the merge-base worktrees
   the capture tests materialise", i.e. `scripts/capture-learnings-baseline.mjs` already materialises
   a merge-base worktree for exactly this class of before/after measurement. One clause naming that
   mechanism (or naming `git worktree add` at `merge-base(origin/main, HEAD)`) turns a stated
   intention into a runnable step.
2. **"Unchanged since" cannot fire as written.** The module is changed by this feature, so an
   implementer reading the condition literally never reaches the `88.75` fallback and is left with an
   unmeasurable floor; one reading it loosely uses `88.75` unconditionally and the delta guard
   evaporates. The condition you want is "unchanged **by commits other than this feature's**", i.e.
   the module as it stands at the merge-base — say that, and the fallback becomes well-defined.

Neither problem invalidates a property: the `≥ 85` arm is hard, checkable and independently
sufficient as a floor, and `88.75` remains a reproducible recorded fact (I re-derived all four
per-file numbers at v3 and they held). This is a "make the stated guard runnable" finding, not a
"the guard is wrong" finding — hence Medium.

### F-02 (Medium) — the correct diagnosis has no mechanical owner

G-4 and § 11 now diagnose the tracked-`.claude/` red exactly, and the remedy is a one-line command,
which is why this is not High: an implementer or orchestrator who reads either section can execute
it. What is asymmetric is the routing. Both local reds halt Phase I identically — the wave gate runs
`implementation.testCommand` over the whole `pdlc/workflows` suite, so *any* red in
`documentOracles.test.js` halts wave 1 before a property here is ever evaluated. The sweep red is
routed as a row in § Findings routed upstream with an `ERRATUM: PLAN` disposition. The tracked-state
red is routed as a sentence in a gap ("reported to the orchestrator rather than fixed from this
document"). Prose in G-4 is not a channel any downstream phase reads.

Concretely, PROP-REPO-01's third conjunct and PLAN T-03 (batch 2, which owns AT-14's three strict
conjuncts) are both unsatisfiable until the untrack happens, and batch 2's gate is "full suite
green". So the ordering constraint is real: the untrack must land **before batch 2**, and nothing in
PLAN §2.1 or §2.2 says so. Give it the same treatment as its sibling — a row in § Findings routed
upstream with an `ERRATUM: PLAN` disposition, stating the ordering constraint (before batch 2) and
the command — so it reaches an owner the way the pipeline routes things rather than the way a reader
notices things. I am emitting that erratum line myself below so the item moves this round regardless.

### F-03 (Low) — a commit count is not a reproducible citation

`git rev-list --count origin/main..HEAD` returns `487` here, against the table's `478`; the nine
commits this revision itself added account for the difference. The row's *claim* — this branch is
ahead, not behind — is true and is what the section needs, so nothing downstream is affected. But
the table is the document's exhibit of "verified in this working tree rather than assumed", and a
figure that its own next commit falsifies weakens that exhibit. Either drop the ahead-count (the
`--is-ancestor` exit code carries the whole claim on its own) or qualify it as "≥ 478 as of
`<sha>`".

## Questions

| ID | Question |
|----|---------|
| Q-08 | Still open from v2 Q-04 / v3 Q-05, and untouched by this round: H-2's `failWriteOn(path, callIndex)` — is `callIndex` counted over *all* `_writeFile` calls or over calls to the ledger path only? PROP-RECORD-06 scripts "succeed on wave 1, throw on wave 3", which is only well defined once that is pinned, and the shipped `makeLedgerArgs` `_writeFile` double captures every path. The predicate taking `path` as its first argument suggests "all calls, filtered by the predicate itself" — if that is the intent, one clause in § The two harness extensions saying so closes it, and it is the last unpinned thing I can see in the harness design. |
| Q-09 | Given F-02's ordering point: is the untrack expected to happen before PLAN batch 1's gate, or before batch 2's? T-01's gate is "full suite green, including T-01" (PLAN §2.2), and the whole suite includes `documentOracles.test.js` — so on my reading batch **1** already cannot pass in this tree, one batch earlier than T-03's own conjunct needs it. If that is right it is worth stating, because it means the untrack is a precondition of the very first wave rather than of the repo-state task. |

## Positive Observations

- **Both High findings were closed by re-measuring, not by re-wording.** The grounding table was
  replaced row for row with commands I could re-run, and all five rows reproduced exactly, down to
  `:12864`, `:46` and `b1b846bd`. The `check-ignore` subtlety — exit 1 with no output on a *tracked*
  path, versus `--no-index` resolving to `.gitignore:46` — is now stated in both § Overview and G-4,
  which is precisely the trap an implementer would otherwise fall into.
- **The revision says it was wrong, in the document, in both places.** "The earlier version of this
  section described a pre-rebase tree; that premise is now false and the correction is recorded here
  rather than silently overwritten," and G-4's "that diagnosis was wrong". A spec that keeps a record
  of its own corrected claims is worth more to the next reader than one that reads as though it was
  always right, and it is what makes a round-4 delta review cheap.
- **F-07's remedy was researched, not just accepted.** The § 11 red table cites `A1_GLOBS`' actual
  membership, names `docs/_constraints/pdlc-retirement-baseline.md`'s glob table as the second half of
  the change, and carries the `docs/pdlc-advisory-wave-gate/**` precedent with its rationale — so the
  eventual PLAN task can be written from the row without re-deriving anything. I re-ran the suite and
  got the same three failures the table predicts.
- **G-4's third consequence is the observation I would have wanted a reviewer to make.**
  "REQ-WVR-10's own failure mode is occurring live on the feature branch that implements the guard
  against it." That is the sentence that turns a repo-hygiene chore into something an orchestrator
  will actually prioritise.
- **AT-12's partial trace is honest about a coverage hole rather than papering it.** The coverage
  matrix row now says which conjunct is uncovered, why it is unobservable through the `makeAgent`
  double, and where it went instead. I verified the conjunct numbering against `TSPEC:755` and
  confirmed PROP-SKIP-03 carries the dispatch-once/gate-once half, so "partial" is exactly the right
  word — not "uncovered", not silently "covered".
- **Q-06 was answered by making the guard *more* precise rather than by picking the easy reading.**
  Choosing the delta over the literal constant is the harder commitment to implement (see F-01), and
  it is the right one: a coverage floor that an unrelated upstream commit can red is a floor that
  teams learn to ignore.

## Recommendation

**Approved with minor changes**

Both of my blocking findings from v3 are closed, and closed by measurement I reproduced independently:
the grounding table's five rows all re-derive in this tree, and `documentOracles.test.js` fails
exactly the three tests § 11 now enumerates. F-08 is closed at the seam. Nothing in the property set,
the oracles, the fixtures or the traceability is contested — that material has been stable since v2
and this round did not weaken it (no property was added, deleted or weakened, and I checked the diff
rather than taking the revision-history row's word for it).

The three findings this round are all improvements to executability and routing, none of them
blocking:

1. **F-01 (Medium):** name the merge-base measurement mechanism T-10 uses for the pre-diff number,
   and restate the fallback condition as "unchanged by commits other than this feature's", so the
   delta guard is runnable rather than only intended.
2. **F-02 (Medium):** give the tracked-`.claude/` untrack the same routing its sibling red got — a
   row in § Findings routed upstream — and state the ordering constraint (before the first batch
   gate, per Q-09).
3. **F-03 (Low):** drop or sha-qualify the ahead-count.

All three can be made in a single pass and none of them changes a property, an oracle or a fixture.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

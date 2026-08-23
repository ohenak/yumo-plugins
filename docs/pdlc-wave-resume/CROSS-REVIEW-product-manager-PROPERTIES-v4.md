# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`
**Date:** 2026-08-23
**Iteration:** 4
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review: prior findings plus the changed sections only.

## Grounding

**Tree and base.** `git rev-parse --abbrev-ref HEAD` prints `feat-pdlc-wave-resume`. The branch is
content-ahead of `origin/main` (`git rev-list --count HEAD..origin/main` → `0`,
`git rev-list --count origin/main..HEAD` → `487`), so I reviewed this tree rather than reporting a
stale base.

**Delta reviewed.** `git diff 753aaa54 HEAD -- docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`
— `753aaa54` is the commit carrying my v3 cross-review — is 211 diff lines across nine commits
(`a431143c` … `91ce118c`). It touches: the header/revision-history block, § Overview's grounding
table and its consequence paragraph, PROP-SKIP-04's requirement trace, § 11's threshold paragraph and
local-red enumeration, PROP-COV-02's denominator note, § Fixtures' queue fixture 2, the AT-12
coverage-matrix row, the test-file status table's `advisoryHelperProperties` row, gap G-4, and two new
routed-findings rows. **No property was added, deleted or weakened**, which I checked directly rather
than taking from the revision history: the only property-row diff in the whole delta is
PROP-SKIP-04's `Requirement ref` cell, and the only oracle-row diff is PROP-COV-02's rationale cell.
That is what keeps this a delta review and not a fresh one.

**I re-ran the delta's factual claims rather than reading them.** Every one of the following is a
claim this revision newly asserts, and every one reproduces in this tree:

| Claim (PROPERTIES) | My check | Result |
|---|---|---|
| Rebase has landed; branch ahead, not behind | `git rev-list --count HEAD..origin/main`; `git rev-list --count origin/main..HEAD` | `0`; `487` ✓ |
| `WAVE_STATE_PATH` present here at `:12864` | `grep -n 'export const WAVE_STATE_PATH' pdlc/workflows/orchestrate-dev.js` | `12864:export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";` ✓ |
| Ignore rule here at `.gitignore:46` (comment at `:30`) | `grep -n pdlc-wave-state .gitignore` | `30:` comment, `46:/.claude/pdlc-wave-state.json` ✓ |
| `c8`/`fast-check`/`test:coverage` present here | `pdlc/workflows/package.json` | `test:coverage` script, `"c8": "^10.1.3"`, `"fast-check": "^4.9.0"` ✓ |
| Two `.claude/` paths + coverage report tracked, by `b1b846bd` on this branch | `git ls-files .claude/ pdlc/workflows/coverage`; `git log --oneline -1 -- .claude/pdlc-wave-state.json` | `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json` (+ the two shared files), `pdlc/workflows/coverage/**`; `b1b846bd` ✓ |
| `orchestrate-dev.js` is 17,176 lines here and at `origin/main` | `wc -l`; `git diff --stat origin/main HEAD -- …orchestrate-dev.js` | `17176`; empty diff ✓ |
| `advisoryHelperProperties.test.js` present here, not only at `origin/main` | `ls pdlc/workflows/__tests__/advisoryHelperProperties.test.js` | present ✓ |
| `documentOracles.test.js` fails **three** tests, and exactly the three named | full run of that file | `3 failed, 32 passed, 35 total`; the two `.claude/`-tracking tests and `PROP-SWEEP-2(b)` ✓ |
| `docs/pdlc-wave-resume/**` is not on `A1_GLOBS`, while three sibling feature dirs are | `documentOracles.test.js:712–724` | `docs/pdlc-plugin-retirement/**`, `docs/pdlc-advisory-wave-gate/**`, `docs/pdlc-learnings-injection/**`; no wave-resume entry ✓ |
| Queue triage reads the last *matching* `TRIAGE:` line, case-insensitively | `pdlc/workflows/orchestrate-queue.js:341–355` | `parseTriageVerdict` scans `for (let i = lines.length - 1; i >= 0; i--)` against `/^TRIAGE:\s*(ready\|blocked\|needs-human)\b\s*(.*)$/i` ✓ |

The last row is the one I most expected to find over-claimed and did not: the fixture's restatement
("the last **`TRIAGE:` line**", `:468–473`) is exactly what the seam implements, and the earlier "last
line" wording really was stricter than the code.

## Prior findings

All three of my v3 findings are closed. None was High, so nothing was gating; I checked them anyway,
because a Medium closed in words rather than in bytes is the way a traceability defect survives a
round.

| v3 finding | Status at HEAD |
|---|---|
| **F-01 (Medium, Local)** — the AT-12 coverage-matrix row claimed complete coverage after the delta conceded one conjunct is unobservable | **Resolved, and in the stronger of the two forms I suggested.** `PROPERTIES:538` now reads `PROP-SKIP-01, -02, -03, -04 — **partial**: AT-12's fourth conjunct also asserts that the V-wave's commit is the only Phase-I-adjacent commit, which is not an observable of this suite (the V-wave issues no `add` and its commit is made by the dispatched agent, which the `makeAgent(record)` double replaces). That clause is routed upstream, not covered here — see § Gaps / Findings routed upstream`. A reader consulting the matrix for AT-12 coverage now meets the gap and its reason in the same cell, without having to find the routed-findings table first. Committed `61207b09`. |
| **F-02 (Medium, Local)** — TSPEC §5.8's three-module `c8.include` list was corrected locally instead of routed, breaking the erratum discipline the same delta applied twice | **Resolved.** A routed-findings row now exists (`:738`), naming `TSPEC:838`'s three-entry list against `package.json`'s four `**/`-anchored entries, marked `Open, and newly raised this round (PM F-02)` and carrying `**Yes** — one `ERRATUM: TSPEC` line`. I re-verified the underlying fact: `TSPEC:838` still reads `include: ["orchestrate-dev.js", "orchestrate-queue.js", "build-runtime.mjs"]`, and `pdlc/workflows/package.json`'s `c8.include` still carries the fourth `**/scripts/capture-learnings-baseline.mjs` entry. The local correction at § 11 was left standing, which is what I asked for. Committed `8ed988c1`. |
| **F-03 (Low, Local)** — PROP-SKIP-04's trace pointed at conjuncts it does not assert | **Resolved, exactly as suggested.** `PROPERTIES:165` now traces `AT-12 (fourth conjunct, less the commit clause — routed)` where it read `AT-12 (first three conjuncts)`. The three conjuncts PROP-SKIP-01 owns are no longer double-claimed, and the routed clause is legible from the row itself — which was the point of doing F-01 and F-03 together. Committed `61207b09`. |

**Nothing I approved in v3 was broken by the revision.** The two things I would have caught if it
had been: the property set is byte-identical apart from PROP-SKIP-04's trace cell (checked above),
and PROP-COV-01's measured baseline table at `:245–250` — the four figures I reproduced by running
c8 in v3 — is unchanged, so the verification I did last round still stands for this one.

## Findings

The delta answers my three findings and both of my open questions, and it does it by re-measuring
rather than by re-asserting — the § Overview grounding table, G-4 and § 11 are now the strongest part
of the document. One thing the answer to Q-03 introduced does not hold up, and it is the only new
finding I have.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **PROP-COV-01's threshold now has two incompatible readings, and the one this delta added cannot be executed at the point it names.** Three places state the same gate. `:232` (property): `≥ 85 and ≥ the baseline recorded below`. `:368` (oracle, the falsifiable form the document itself designates in § Overview): `>= 85` and `>= 88.75` (the 2026-08-23 baseline recorded in § 11)`. `:254–261` (new this delta): `88.75` is *a recorded baseline, not a frozen constant*, the floor is `≥ the number T-10 measures on `orchestrate-dev.js` immediately before applying this feature's diff`, and *T-10 therefore re-measures at task start*. The first two are consistent with each other; the third is not consistent with either, and its own instruction is unperformable where it lands. PLAN puts T-10 in **batch 4**, downstream of T-02, T-07, T-08, T-03 and T-04 (`PLAN:121`, `:199` — `{T-07,T-08,T-03,T-04} → T-10`), so at *T-10's task start* the feature's diff to `orchestrate-dev.js` is already applied: re-measuring the working tree then yields a number derived from the code under test, and `measured ≥ measured` is a tautology. The guard degrades from a regression gate to a no-op precisely in the case it exists to catch — a drop caused by this feature's own ~20 new branches. The product intent stated at `:259–261` is right and worth keeping (an unrelated upstream drop to 88.60 must not block T-10; the feature's own drop must). What is needed is a source for the baseline that is not the post-diff tree: state that T-10 re-measures against the **merge-base content** (`git worktree add` on `origin/main`, or c8 over `git show origin/main:pdlc/workflows/orchestrate-dev.js`), records both numbers, and gates on the delta — and align `:368`'s literal `>= 88.75` to that same wording so the oracle and § 11 read as one gate. I verified the baseline is currently sound either way: `git diff origin/main HEAD -- pdlc/workflows/orchestrate-dev.js pdlc/workflows/package.json` is empty, so `88.75` measured today **is** the pre-diff number. | RT-7, TSPEC §5.8, PLAN T-10 |
| F-02 | Low | Local | **The new threshold paragraph's markdown nests backticks and will not render.** `:255–256` reads ``≥ the number T-10 measures on `orchestrate-dev.js` immediately before applying this feature's diff`` — a code span opened at `≥` and containing a second pair around the filename, which closes the outer span early and leaves the tail as literal backticks. The sentence carrying the reading an implementer is meant to act on is the one that renders as noise. Suggested fix: drop the inner pair (`≥ the number T-10 measures on orchestrate-dev.js immediately before applying this feature's diff`), or unwrap the outer span entirely. Purely presentational; no content change, and it falls out of F-01's rewrite anyway. | RT-7 |

**Scope tags.** Both are `Local`: each is fixed inside this document, and neither reveals a durable
product constraint or a recurring process defect. F-01 is the closer call — "a baseline re-measured
after the change under test is applied is not a baseline" is a reusable lesson — but the pipeline
already carries it as the no-implementation-echoes rule in the review contract, so promoting it would
duplicate standing guidance rather than add to it.

**Nothing here is High.** No P0 or P1 requirement is dropped, narrowed or reinterpreted by this
delta. The one behavioural gate it touches, PROP-COV-01, is a self-imposed guard *stricter* than the
`85` floor TSPEC §5.8 and RT-7 actually mandate (`TSPEC:918`), and both `:232` and `:368` still carry
that mandated floor unconditionally — so even on the worst reading of F-01, the requirement-level gate
holds and only the extra baseline conjunct goes soft.

## Questions

Both of my v3 questions were answered in the delta — Q-01 by re-measuring `orchestrate-dev.js` at
17,176 lines (`:369`, which I confirmed with `wc -l`) and Q-03 by the threshold paragraph that F-01
now addresses. One new question, and it is a question rather than a finding because the answer may
already exist outside this document.

| ID | Question |
|----|---------|
| Q-01 | § 11's second local red — `PROP-SWEEP-2(b)` reddening on this feature's own artifacts — is routed as an `ERRATUM: PLAN` line because no PLAN task owns adding this feature's docs directory to `A1_GLOBS` and to `docs/_constraints/pdlc-retirement-baseline.md`'s glob table. I confirmed the red (3 failed / 32 passed in `documentOracles.test.js`) and the missing glob (`documentOracles.test.js:712-724` lists the three sibling feature dirs and not this one). The document also observes, correctly, that the wave gate runs the whole suite, so this red halts Phase I *before any property here is reached* (`:280-282`). That makes it a **blocker on the feature's own implementation phase**, not just a documentation gap — and it is currently carried only as an erratum against PLAN. Is one routed line the right weight for something that will stop the first wave, or should it also appear in § Gaps as a named precondition on T-01/T-07 so an implementer meets it before the gate does? |

## Positive Observations

- **The correction of a wrong diagnosis is recorded, not silently overwritten.** § Overview `:46-48`
  and G-4 `:665-667` both say in as many words that the earlier "pre-rebase tree" premise was false
  and that the earlier gap text was wrong. A revision that quietly fixes its own bad diagnosis leaves
  the next reader unable to tell which of the two readings the surrounding text was written against;
  this one makes it impossible to get wrong.
- **G-4's rewrite turns a red into a diagnosis with an owner.** The distinction it draws — the red is
  `check-ignore` skipping a **tracked** path, not a missing ignore rule, so untracking on this branch
  is the remedy and no rebase clears it (`:663-676`) — is exactly the misreading an implementer would
  otherwise make, and it is named before they can make it. The observation at `:678-681` that
  REQ-WVR-10's own failure mode is occurring live on the branch built to prevent it is the sharpest
  sentence in the document.
- **Both local reds are enumerated with owner and remedy, and the count is right.** § 11's table
  (`:270-279`) says three failing tests in one file, names each, and assigns each a different owner.
  I ran it: `3 failed, 32 passed, 35 total`, and the three names match. A properties document that
  tells the implementer which reds are theirs and which are not is doing the job the pipeline needs
  it to do.
- **The fixture restatement is a genuine tightening.** Queue fixture 2 moved from "last line" to
  "last **`TRIAGE:` line**, trimmed and case-insensitive" (`:468-473`) with the reason stated: the
  stricter form would invite a brittle fixture *and* a reader who mistakes a passing fixture for a
  malformed one. It matches `parseTriageVerdict`'s bottom-up scan at `orchestrate-queue.js:351-355`.
- **Erratum discipline is now applied uniformly.** Four upstream defects, four routed rows, zero
  fixed-in-place-and-not-routed — which is what my v3 F-02 asked for, and the reason I have no
  process finding this round.

## Recommendation

**Approved with minor changes**

All three v3 findings are closed in bytes, not in prose, and I verified each closure against the
document and — where it made a factual claim — against the tree. No High finding is open, old or new:
no P0 or P1 requirement is dropped, narrowed or reinterpreted by this delta, the property set is
unchanged apart from one requirement-trace cell, and the mandated `85` per-file floor is carried
unconditionally in both the property and the oracle.

Two non-gating items to fold into the next touch of this document:

- **F-01 (Medium, Local)** — give PROP-COV-01's re-measured baseline a source that is not the
  post-diff tree (merge-base worktree or `git show origin/main:…`), since T-10 sits in batch 4 and
  `measured >= measured` is a tautology; then align `:368`'s literal `>= 88.75` to that same wording
  so § 11 and the oracle state one gate rather than two.
- **F-02 (Low, Local)** — unnest the backticks at `:255-256` so the sentence renders. Falls out of
  F-01's rewrite.

Four upstream defects travel as `ERRATUM:` lines in my response rather than as findings against this
document, because in each case this document behaved correctly given a defective parent and already
routes them in its own routed-findings table. I re-verified all four are still open at HEAD:
`TSPEC:830` still reads "at fast-check's default run count" while PLAN T-08 pins `numRuns: 500`;
`TSPEC:755` AT-12's fourth conjunct still asserts "its commit is the only Phase-I-adjacent commit",
which the V-wave provably never issues; `TSPEC:838` still lists three `c8.include` modules where
`package.json` carries four; `TSPEC:759` and `PLAN:118` still justify the queue fixture set by the
retired `distribution.checkEnabled` gate; and no PLAN task owns this feature's missing `A1_GLOBS`
entry. I re-emit them so the routing survives regardless of how this round closes.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

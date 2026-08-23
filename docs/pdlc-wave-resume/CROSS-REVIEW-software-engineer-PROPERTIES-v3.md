# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md` (Version 1.2)
**Date:** 2026-08-23
**Iteration:** 3
**Scope:** delta re-review — my own v2 findings, plus new issues in the sections the revision
changed. Unchanged sections already reviewed at v2 are not re-litigated.

## Prior findings — disposition

Diffed `de65bc84..HEAD` on the document (95 insertions, 25 deletions across seven commits,
`2905403a` … `de843006`). Every prior finding was re-checked against source at `origin/main` and
against this working tree, not against the revision's own account of itself.

| v2 finding | Severity | Disposition | Evidence I re-derived |
|---|---|---|---|
| F-01 — PROP-SKIP-04 expects V-wave pathspecs the script never stages | High | **Resolved** | See below; all three conjuncts verified against source |
| F-02 — queue fixture set justified by the retired drift gate | Medium | **Resolved** | `orchestrate-queue.js` `selectNextPending` returns `{kind:"blocked-active"}` on any `in-progress` entry and `{kind:"empty", reason:"no pending entries (all done, awaiting-merge, blocked, or halted)"}` otherwise; `runQueue`'s selection block maps those to `outcome:"blocked"` and `outcome:"idle"` **before** the triage phase — exactly the two dispositions the revised § Fixtures now names. The `TRIAGE:` verdict is read by `parseTriageVerdict` with `/^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i` |
| F-03 — H-1's `events` array can be silently empty on the git axis | Medium | **Resolved** | `makeLedgerArgs`'s signature at `origin/main:pdlc/workflows/__tests__/waveExecution.test.js` is `{ ledger, config, writes, record, logs, git, runCommand = async () => ({ ok: true, output: "green" }) }` — `git` has no default, exactly as the revision now states, and `makeArgs` spreads both conditionally (`...(git ? { _git: git } : {})`). H-1 is restated as a wrapper; PROP-SAFETY-01 and PROP-RECORD-03 both gained the both-axes-present precondition |
| F-04 — PROP-COV-01 pins a gate whose current value is unrecorded | Medium | **Resolved, and it corrected me** | The `c8.include` set is **four** entries, not the three I named: `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, `**/scripts/capture-learnings-baseline.mjs` (`pdlc/workflows/package.json`, `c8.include`). I re-ran the measurement — see the row below |
| F-05 — dangling `§ Gaps, G-3` anchor | Low | **Resolved** | PROP-REPO-02's note now routes to **G-5**, and G-5 exists in § Gaps, ordered after G-4, and states the general claim it is the routing target for |

**The measured baseline, independently re-measured.** I did not take the § 11 table on trust. Running
`npx c8 --temp-directory=/tmp/c8tmp3 --reporter=text npm test -- --runInBand` from `pdlc/workflows`
in this tree today reproduces all four numbers to the digit:

| Included module | % Branch, my run | § 11's recorded value |
|---|---|---|
| `orchestrate-dev.js` | **88.75** | 88.75 ✓ |
| `orchestrate-queue.js` | 88.75 | 88.75 ✓ |
| `build-runtime.mjs` | 88.23 | 88.23 ✓ |
| `capture-learnings-baseline.mjs` | 89.47 | 89.47 ✓ |

The suite itself was `115 passed, 2 failed` of 117 — and the second failure
(`consumerCleanup.test.js`) is **mine**, not the tree's: I had a second jest process running against
the same working tree, and `consumerCleanup.test.js` passes 23/23 when run alone. So the document's
caveat is exact: `documentOracles.test.js` is the one genuinely red suite here. That is the best
kind of measured fact — one a reviewer can reproduce and does.

## Findings

### F-01's resolution, checked conjunct by conjunct

PROP-SKIP-04 now reads as an empty flattened `add` list paired with two positive assertions. I
verified each against `origin/main:pdlc/workflows/orchestrate-dev.js`:

| Conjunct | Check | Result |
|---|---|---|
| `gitCalls.filter(a => a[0] === "add").flat()` is `[]` | the V-wave block issues no `commitPaths` and no `_git(["add", …])`; it dispatches, evaluates, then runs `runCommandFn(implConfig.testCommand)` | holds — and `.flat()` now matches PROP-REPO-03's decoding, so the `a[2]` bug I raised is gone |
| `gitCalls` contains `["rev-parse", "--abbrev-ref", "HEAD"]` | `main()` calls `await ensureFeatureBranch({ feature: featureName, _git: gitFn, _log: emit })` **unconditionally, inside the top-level `try`, before `pipelineFn` runs any phase**; `ensureFeatureBranch` → `readHeadBranch(git)` → `await git(["rev-parse", "--abbrev-ref", "HEAD"])` | holds on every outcome including (c), and the shipped `makeGit`/`makeShaGit` doubles push the raw argv array (`calls.push(argv)`), so `toContainEqual` on that literal triple is exact |
| exactly one `se-implement` dispatch, prompt = the V-wave's | `propertiesTestPrompt(featureName)` begins `Implement PROPERTIES tests for feature ${featureName}.` | holds, and the document's parenthetical is right: that first line does not match `dispatchedTaskIds`' `/^Implement task (T\d+):/`, so the `[]` and the single-dispatch claim are two readings of one record rather than two independent assumptions |

The "V-wave's own commit" premise is gone from the property and routed upstream as an
`ERRATUM: TSPEC` line instead of contested here. That is the right disposition and it is executed
correctly. **F-01 is closed.**

### New findings this round

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-06 | High | Local | § Gaps G-4 and § 11's caveat (ii) are dated **2026-08-23** and describe a "pre-rebase tree", but the rebase has landed: `git rev-list --count HEAD..origin/main` is **0**, `origin/main` is an ancestor of HEAD, `.gitignore` carries the rule here, and `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` is **10**. The tracked `.claude/` files were committed **on this branch**, so no rebase clears them — the remediation the document routes does not exist. | § Gaps G-4; § 11 measured-baseline caveat (ii) |
| F-07 | High | Cross-Feature | § 11's newly added enumeration of this tree's local reds is incomplete, and the missing item is a hard gate blocker: `documentOracles.test.js`'s `PROP-SWEEP-2(b)` reds because **this feature's own tracked docs** hit the retirement sweep terms and `docs/pdlc-wave-resume/**` is not on A-1's frozen glob list. The wave gate's `testCommand` is the whole jest suite, so **every** wave gate reds and Phase I cannot pass a single wave. | § 11 measured-baseline caveat (ii); PROP-COV-01 |
| F-08 | Low | Local | § Fixtures says the triage double's fixture requirement is "a Phase-0 readiness-triage `_agent` double **whose last line is** `TRIAGE: ready`". `parseTriageVerdict` scans bottom-up for the last line that *matches*, so trailing blank or non-matching lines are tolerated. The stated fixture obligation is stricter than the seam's. | § Fixtures → "Queue fixtures (two required, and the one that is not)" |

### F-06 (High) — the "pre-rebase tree" the new text measures against is not this tree

Two blocks added this round rest on the premise that the rebase has not landed:

- § 11: *"in **this pre-rebase tree** the run has a known unrelated red … Those failures are
  repo-state, not coverage"*.
- § Gaps G-4: *"Measured on 2026-08-23, this tree is worse than 'the ignore rule is absent':
  `.claude/pdlc-wave-state.json` and `.claude/pdlc.config.json` are **tracked** here … Both are
  **pre-rebase branch state**, not feature behaviour."*

The tracked-file half is true — I reproduced it, and `documentOracles.test.js`'s
`` `.claude/` machine-local state is untracked and stays untracked (CODE_REVIEW v1 §1-1) `` block
fails on exactly those two paths. The framing around it is not. Measured today, in this tree:

| Claim | Command | Result |
|---|---|---|
| "this branch is behind `origin/main` by 1637" | `git rev-list --count HEAD..origin/main` | **0** — and `git merge-base --is-ancestor origin/main HEAD` succeeds; the branch is 467 commits **ahead** |
| "the mechanism under test is absent here" | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | **10** |
| "the ignore rule exists only at `origin/main` (`:41`)" | `grep -n pdlc-wave-state .gitignore` | present **here** at `:46` — and at `origin/main` at `:46` too, so the `:41` locator is stale as well |
| "`fast-check`, `c8`, `test:coverage` exist only at `origin/main`" | `grep -n 'c8\|fast-check' pdlc/workflows/package.json` | all three present **here** |

Two consequences, and the second is the one that matters:

1. The § Overview grounding table and its conclusion — *"every property below is red in this tree and
   is expected to be"* — are false today. That table is inherited text I approved at v2, so I raise
   it only because this round's new material re-derives from it; but a document whose stated
   discipline is "shipped-behaviour claims are cited against `git show origin/main:…`" cannot leave a
   stale tree fact in the section that decides what "red" means for every row below it.
2. **The routing G-4 gives is wrong, and it is the actionable half.** `.claude/pdlc-wave-state.json`,
   `.claude/pdlc.config.json` and `pdlc/workflows/coverage/**` were tracked by commit `b1b846bd`
   *on this branch* (`git log --oneline -- .claude/pdlc-wave-state.json` → `b1b846bd`, preceded only
   by `c5ce8d56`, the advisory-wave-gate commit that **untracked** them). They are absent from
   `origin/main` (`git ls-tree origin/main pdlc/workflows/coverage` is empty). Calling them
   "pre-rebase branch state" tells the implementer the red self-clears; it does not. The fix is
   `git rm --cached` on this branch, and until it happens PROP-REPO-01's third conjunct is
   *unsatisfiable for a reason the document has mis-diagnosed*: `git check-ignore -v
   .claude/pdlc-wave-state.json` exits **1 with no output** in this tree — not because the rule is
   missing, but because `check-ignore` skips tracked paths. An implementer who believes G-4 reads
   that red as inherited and ships it.

This is REQ-WVR-10's own failure mode occurring live on the feature branch, which makes the
mis-diagnosis worse than a documentation nit: the feature exists to keep this file untracked, and the
branch implementing it is tracking it.

**What must change.** Re-measure the four rows of § Overview's grounding table and § Gaps G-4 in this
tree and restate both; then say plainly that the tracked `.claude/` and `pdlc/workflows/coverage/`
paths were introduced by a commit on this branch and must be untracked here, named as an
orchestrator-owned action with a task or an erratum behind it rather than as weather. If some
properties are in fact green pre-implementation now, say which and why that does not weaken them — a
property that has always been green is a different artifact from one pre-registered as red.

### F-07 (High) — the enumeration of local reds omits the one that blocks every wave gate

§ 11's caveat (ii) names one red suite and attributes it to tracked build artifacts and `.claude/`
state. I ran the suite: `115 passed, 2 failed` of 117, and the second failure is my own concurrency
artefact (`consumerCleanup.test.js` passes 23/23 alone). So `documentOracles.test.js` is indeed the
one red suite — but it fails **three** tests, not the one the document accounts for. The unaccounted
one is `PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty`, whose residual
is eight paths, all of them this feature's own artifacts:

```
docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md
docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
docs/pdlc-wave-resume/CROSS-REVIEW-*-v*.md   (five of them, including my own v2)
```

The mechanism is exact and reproducible: `L2_TERMS` in `documentOracles.test.js` includes the
distribution opt-out key, the sweep greps every tracked file for those seven terms, and `minusA1`
subtracts A-1's frozen glob list — which carries `docs/pdlc-plugin-retirement/**`,
`docs/pdlc-advisory-wave-gate/**` and `docs/pdlc-learnings-injection/**` but **not**
`docs/pdlc-wave-resume/**`. PROPERTIES hits the term three times (§ Fixtures' correction, the
§ Findings-routed table, the v1.2 revision-history row); TSPEC and PLAN hit it three times each. Note
that the shipped test file writes every term split across a `+` concatenation for exactly this
reason — the sweep must not find its own source.

Why this is High rather than a curiosity: `.claude/pdlc.config.json`'s `implementation.testCommand`
is `cd pdlc/workflows && npm test -- --testPathIgnorePatterns …`, i.e. the whole suite, and the
script-owned wave gate runs it after **every** wave. A red `documentOracles.test.js` therefore reds
wave 1's gate, halts Phase I before any wave commits, and does so for a reason that has nothing to do
with the wave-resume mechanism. PROP-COV-01's *"`npm run test:coverage` must exit 0"* is likewise
unsatisfiable today — the script is `c8 npm test && c8 report …`, so a red jest run short-circuits
the `&&` and stage 2 never runs at all. That is also why § 11's baseline had to be measured out of
band with a direct `npx c8` invocation rather than through the script the property names; the numbers
are right (I reproduced all four to the digit), but the property's own command cannot produce them in
this tree.

The remedy is not this document's to *make* — the precedent is a row in
`docs/_constraints/pdlc-retirement-baseline.md`'s glob table plus the matching `A1_GLOBS` entry, and
`docs/pdlc-advisory-wave-gate/**`'s row states the rationale verbatim ("its subject matter *is* the
wave gate's rebuild-and-stage discipline … editing them to drop the names would falsify the
specification of a shipped behaviour"), which applies word for word to a feature whose PROPERTIES
must discuss the retired drift-gate key. But it **is** this document's to name: § 11's caveat list is
where a reader learns what is red here and why, and no task in PLAN §2.1 owns the glob-list addition.
I am routing the missing task upstream as an `ERRATUM: PLAN` line and asking § 11 to record the
second red with its cause and its owner.

### F-08 (Low) — the triage fixture obligation is stated stricter than the seam

§ Fixtures now requires "a Phase-0 readiness-triage `_agent` double **whose last line** is
`TRIAGE: ready`". `parseTriageVerdict` iterates `for (let i = lines.length - 1; i >= 0; i--)` and
returns on the first line matching `/^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i` — the last
*matching* line, trimmed, case-insensitive. A double that appends a trailing newline or a sign-off
line still triages `ready`. Say "whose last `TRIAGE:` line is `TRIAGE: ready`" so the fixture is
written against the seam rather than a stricter reading of it; as written it invites a brittle
fixture and, worse, invites an implementer to read a passing fixture as malformed.

## Questions

| ID | Question |
|----|---------|
| Q-05 | Q-04 from v2 is still open in my reading: H-2's `failWriteOn(path, callIndex)` — is `callIndex` counted over *all* `_writeFile` calls or over ledger-path writes only? PROP-RECORD-06 scripts "succeed on wave 1, throw on wave 3", which is only well defined once that is pinned, and `makeLedgerArgs`'s `_writeFile` captures every path, not just `WAVE_STATE_PATH`. One clause in H-2 settles it. |
| Q-06 | PROP-COV-01 now pins `>= 88.75`. That number is a property of `orchestrate-dev.js` at today's HEAD; the feature's own ~20 branches will move it, and so will any unrelated commit that lands before T-10 runs. Is the intent "≥ the number recorded on the day the task runs, re-measured at task start" or "≥ 88.75 literally"? If the latter, a wholly unrelated upstream commit that drops the module to 88.60 blocks T-10 with no feature-side cause; if the former, say re-measure and record both numbers, since the guard is then a delta, not a constant. |
| Q-07 | Given F-06: are the pre-implementation properties actually red in this tree at all? PROP-PRE-01's five exports resolve **here**, not only at `origin/main`, and `test:coverage`/`c8`/`fast-check` are present. If T-01's pre-flight is green before a line is written, what does T-01 still prove — that the rebase happened, or that it has not been undone? The second is a real and worthwhile claim, but it is a different one from the pre-registration § Overview currently makes. |

## Positive Observations

- **Every one of my five findings was addressed at the right altitude, and two were addressed by
  correcting me rather than complying with me.** F-04's revision points out that `c8.include` is
  four modules, not the three I named — `**/scripts/capture-learnings-baseline.mjs` is in the set and
  I missed it. That is what a review loop is supposed to produce.
- **The measured baseline is genuinely measured.** I re-ran the coverage measurement independently
  and got 88.75 / 88.75 / 88.23 / 89.47 — all four to the digit, including the two identical values
  that looked like a transcription slip until I reproduced them. A document that states a number a
  reviewer can reproduce in one command is worth more than a page of reasoning about the number.
- **PROP-SKIP-04's rewrite is better than either fix I proposed.** It takes both: the flattened
  whole-list equality *and* the dispatch-identity conjunct, and then adds the branch-guard call as
  the live-seam witness. The observation that `propertiesTestPrompt`'s first line cannot match
  `dispatchedTaskIds`' `/^Implement task (T\d+):/` — so `[]` and "exactly one V-wave dispatch" are
  two readings of the same record — is the detail that makes the pairing non-redundant rather than
  decorative. I checked it against the shipped prompt builder; it holds.
- **H-1's restatement is now implementable without re-reading `makeArgs`.** Spelling out that `git`
  has no default and `runCommand` has a green one, that the spread is conditional, and that the
  extension therefore *wraps* rather than owns, converts a helper description that needed archaeology
  into one an implementer can execute. The both-axes precondition added to PROP-SAFETY-01 and
  PROP-RECORD-03 closes the vacuous-ordering hole exactly.
- **§ Fixtures' queue rewrite does the harder, more honest thing.** It could have dropped the
  sentence; instead it says *"earlier drafts of this section were wrong to say it was"*, keeps the
  fixture as explicitly optional, replaces `!== "blocked"` with positive `toBe(<expected outcome>)`
  assertions, and cites the two dispositions that can still fire. I verified `selectNextPending` and
  `runQueue`'s selection block: `blocked-active → outcome:"blocked"` and `empty → outcome:"idle"`,
  both before the triage phase, exactly as described.
- **Both upstream defects were routed, not absorbed.** The § Findings-routed table gained two rows
  with the evidence attached and an explicit `ERRATUM` disposition, and the properties were
  re-expressed to stand without the upstream premise in the meantime. That is the correct handling of
  a defect in a parent document and it is rarer than it should be.

## Recommendation

**Needs revision**

My one blocking finding from v2 is closed, and closed well — I re-derived all three of PROP-SKIP-04's
conjuncts from source and they hold. All four non-blocking findings are also closed. If the only
question were "did the revision resolve what I raised", this would be an approval.

It is not an approval because the revision's new material introduced two High findings of its own,
both in the freshly written grounding text and both mechanical to check:

1. **F-06:** the "pre-rebase tree" premise the new § 11 and § Gaps G-4 text is built on is false in
   this tree today (`HEAD..origin/main` is 0, the ignore rule is present, `WAVE_STATE_PATH` resolves
   locally), and the remediation G-4 implies — that a rebase clears the tracked `.claude/` files —
   does not exist: those files were tracked by a commit on this branch and must be untracked here.
2. **F-07:** § 11's new enumeration of local reds misses `PROP-SWEEP-2(b)`, which reds because this
   feature's own tracked docs hit the retirement sweep terms while `docs/pdlc-wave-resume/**` is not
   on A-1's frozen glob list. Since the wave gate's `testCommand` is the whole suite, that red halts
   Phase I at wave 1 — a blocker no property in this document can see and no task in the PLAN owns.

Both are corrections to the document's account of the tree it runs in, not to its property set. The
properties, oracles, fixtures and traceability I reviewed at v2 and again here are sound; nothing in
the mechanism half of this document is contested. Concretely, to converge:

1. **F-06 (must fix):** re-measure § Overview's grounding table and § Gaps G-4 in this tree; state
   that the tracked `.claude/` and `pdlc/workflows/coverage/` paths came from a commit on this branch
   and are untracked here, not by rebasing; restate what PROP-REPO-01's red actually means today.
2. **F-07 (must fix):** record `PROP-SWEEP-2(b)` as the second local red, with its cause (the
   feature's own docs vs. A-1's glob list), its precedent (`docs/pdlc-advisory-wave-gate/**`), and
   its owner — which is a PLAN task, routed as an erratum below, not a property here.
3. **F-08:** restate the triage fixture obligation as "the last `TRIAGE:` line".

One upstream defect is routed as an erratum rather than folded into this verdict: no PLAN task owns
adding `docs/pdlc-wave-resume/**` to A-1's frozen glob list, without which every wave gate reds.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 0, "low": 1}

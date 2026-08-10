# Cross-Review: product-manager — IMPLEMENTATION

**Reviewer:** product-manager
**Document reviewed:** `pdlc/workflows/consolidate-learnings.js` and the feature diff `main...feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 1
**Scope:** Local
**Phase:** CR (final codebase review)

## Method

Product lens only: does the shipped code deliver the acceptance criteria the approved REQ states,
and can an operator observe them? Three passes:

1. **AC → production caller → served artifact.** For each REQ-CONS-05/06/07 obligation I traced the
   named behaviour from `main()` (`pdlc/workflows/consolidate-learnings.js:450`) to the value the
   operator actually reads — the report body (`:2021`) and the log row (`:1980`). Where a function
   implements an AC, I counted its production call sites, not its tests.
2. **Spec-to-code diff.** REQ §5's in-scope list, item by item, against the diff
   (`git diff main...HEAD`, 62 files, +26821).
3. **Suite state.** `npm test` in `pdlc/workflows`: 99/100 suites green, 3851 passing. The single
   red suite is `documentOracles.test.js` AT-22, and it is the untracked-file false-red CLAUDE.md
   documents (`.serena/`, `.tokensave/`, `.claude/` in my working tree) — not a finding. The 70
   skipped tests are `guardMatrix.test.js`'s pre-existing BLOCK rows, untouched by this branch
   (last touched `53985cf3`) — also not a finding.

The five High findings below share one shape and I want to name it once: **the code that computes an
acceptance criterion exists, is well written, and is thoroughly unit-tested — but `main()` never
calls it, or calls it with an input that cannot produce the AC's outcome.** Every one is green in
CI today. That is the failure mode this repo already knows as a vacuous green, and it is why I read
call-site arity rather than test names.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | The effectiveness fold is given one pass, so `ineffective` and `unmeasurable` are unreachable in production | AC-5.3, AC-5.5, AC-1.4 |
| F-02 | High | Local | `remediationChoice` has zero production callers — the revision/retirement ladder never fires | AC-5.3, AC-5.4 |
| F-03 | High | Local | `seamCandidates` has zero production callers — the advisory seam candidate is never derived | AC-6.2, AC-6.3 |
| F-04 | High | Local | The `deferred:` field is the literal `none` in both the log row and the report body | AC-7.1, AC-2.4, AC-3.5 |
| F-05 | High | Local | Report item 7 is the literal `advisory: none`; `state.advisory` is read at step 10 and then discarded | AC-7.1, AC-6.1 |
| F-06 | Medium | Cross-Feature | The PR base branch is the hardcoded string `"main"` at the only `consolidationCreate` call site | AC-3.6, AC-3.8 |
| F-07 | Medium | Process | `consolidate-learnings/SKILL.md` still reads "Cadence: Manually invoked"; CLAUDE.md claims the `orchestrate-queue` shape | AC-1.1, REQ §5 |
| F-08 | Low | Local | The module's own `meta` (`:29`) diverges from the bundle's `CONS_META` — no `direct` input, no `whenToUse`, no `phases` | AC-1.1 |

### F-01 — the effectiveness fold receives exactly one pass (High, Local)

`main()` calls the fold with a single-element array holding **this pass and only this pass**
(`consolidate-learnings.js:651-655`):

```js
state.effectiveness = effectivenessTable(
  priorRecords,
  [{ passId: state.passId, consumed: consumedBodies.map((b) => b.text)… }],
  config
);
```

Inside `effectivenessTable` the two streaks fold over that array (`:1550-1571`) and the states are
gated on them: `ineffective` needs `ineffectiveStreak >= 2` (`:1577`) and `unmeasurable` needs
`unmeasurableStreak >= unmeasurablePasses`, default 3 (`:1518-1519`, `:1578`). With one element in
the array, neither counter can exceed 1. **Both states are therefore unreachable on every production
path**, and `state` is `null` in every row `main()` ever renders.

What this costs, in REQ's own terms:

- **AC-5.3** ("a promotion whose verdict was `recurred` on two consecutive counted passes … is
  flagged `ineffective`") can never be satisfied. FSPEC §8.5 states the streak explicitly as a fold
  across passes, with a table of which pass kinds count — a table that is meaningless over one pass.
- **AC-5.5** (`insufficient-evidence` on `unmeasurablePasses` consecutive evaluated passes) likewise.
  Note `consolidation.unmeasurablePasses` is a configured key whose value can change nothing today.
- **AC-1.4** requires a `no-op` pass to restate "each prior promotion's **standing** verdict and
  state (including an `unmeasurable` already reached)". FSPEC §8.7 says the same: "Once reached,
  `unmeasurable` stands until a verdict resets it, and a `no-op` pass restates it meanwhile." Nothing
  in the shipped code carries a state across passes: `renderFailureModeRecord` (`:1942-1954`) writes
  eight fields and none of them is the streak or the standing state, and `LOG_RECORD_FIELD_MAP`
  (`:1369-1378`) parses back the same eight. So the state is neither recomputed nor persisted.

This is the falsifiability loop — REQ-CONS-05 is the requirement that distinguishes this feature from
the skill it replaces ("every promotion recording the failure mode it targets and the next pass
reporting, by a deterministic rule, whether that failure mode recurred", REQ §1). Shipping it
unreachable means the pass can promote forever and never once tell the operator a promotion did not
work.

The function itself is correct — `consolidationEffectiveness.test.js:224` (AT-F9) proves
`ineffective` on a hand-built four-pass input, and `:262-269` proves the two-pass boundary. The
production caller simply never builds that input.

**What to change:** at `:651`, reconstruct the prior passes before folding. The log already carries
what is needed — one `<!-- pdlc:consumed -->` block per pass, written by `renderConsumedPair`
(`:1162`) and parsed by the same region split `classifyCorpus` uses (`:1106`) — so the pass can read
each prior pass's consumed basenames, read those bodies through `readFileFn`, and pass the list
oldest-first with the current pass last. `effectivenessTable` needs no change; it already folds
"every pass's consumed set, in file order" exactly as its own docstring at `:1509` says.

### F-02 — `remediationChoice` has zero production callers (High, Local)

`remediationChoice` is defined at `:1631` and referenced exactly once more in the whole module — in
a comment, at `:1510`. There is no call:

```
$ grep -n "remediationChoice" pdlc/workflows/consolidate-learnings.js
1510: * neither `prStates` nor `headExists`, so choosing it is the caller's job (`remediationChoice`).
1631:export function remediationChoice(id, records, prStates, headExists) {
```

The docstring names the obligation and then it is dropped: `effectivenessTable` sets
`remediation: null` unconditionally (`:1584`) precisely because "choosing it is the caller's job",
and the caller does not choose. Consequently `renderEffectivenessTable`'s remediation branch
(`if (row.remediation) parts.push(…)`, `:1974`) is dead code in production.

AC-5.3 does not stop at the flag — it requires the pass to propose one of revision or retirement, and
FSPEC §8.5 gives a four-row top-down decision table for which. AC-5.4 then routes the retirement
through the same promotion machinery. Neither happens. Even if F-01 were fixed and a row went
`ineffective`, the operator would be told a promotion failed and offered nothing to do about it —
the loop would detect ineffectiveness and never close it.

**What to change:** after the effectiveness table is built at `:655`, for each row whose `state` is
`ineffective`, call `remediationChoice(row.failureModeId, priorRecords, prStates, headExists)` and
write the answer onto the row. Two inputs need sourcing: `prStates` is already polled at `:665` (it
would need to move above the table, or the table's remediation pass to move below the poll), and
`headExists` is a `checkFileFn` call on the row's `artifact`, which FSPEC §8.5 row 3 defines as "a
file-existence test and nothing else". Then feed the chosen action back through `routeProposal` so
AC-5.4's "same route as any other promotion" holds.

### F-03 — `seamCandidates` has zero production callers (High, Local)

Same shape. `seamCandidates` is defined at `:1788` and never called:

```
$ grep -n "seamCandidates" pdlc/workflows/consolidate-learnings.js
1788:export function seamCandidates(counts) {
```

`main()` does read the corpus — `parseEscalations` at `:634-637` — and does record the two corpus
states as reason codes (`no-advisory-corpus`, `advisory-corpus-empty`), and stores the parse on
`state.advisory`. Then the analysis stops. AC-6.2 ("a seam whose escalation count … spans at least
two distinct features and exceeds the other seams' …") and AC-6.3 have no production path at all.

I want to be precise about the mitigation, because it is real but partial: BL-01a records that
`ESCALATIONS.md` is absent at HEAD and is not expected to exist, and REQ notes AC-6.2/AC-6.3 are
"inert without a corpus". That justifies the *candidates being empty*; it does not justify the
*derivation being absent*. The difference is observable and matters to the operator: with the code
wired, the day the advisory tier is enabled the first pass reports its candidate; unwired, that day
produces nothing and no error, and the gap is invisible until someone re-reads this file. AC-6.1's
three corpus states are specified as first-class precisely so this ships and is exercisable with the
tier off.

**What to change:** call `seamCandidates(escalations.counts)` at `:637` and carry the result on
`state.advisory` for the report (see F-05, which is the other half of the same missing wire).

### F-04 — `deferred:` is a hardcoded literal in both operator surfaces (High, Local)

The log row ends with a constant (`:2008`):

```js
lines.push(`deferred: none`);
```

and the report body's item 8 is the same constant (`:2065`):

```js
lines.push(`8. deferred: none`);
```

Neither reads `state.deferred`, which `main()` populates at `:856` from the `deferred` accumulator
and immediately uses for something else: `if (deferred.length > 0)` writes
`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` (`:858-862`) and drives the terminal status to
`promoted-degraded` (`:866`). So on the exact path where deferral is the story, the pass writes a
proposal file naming the deferred items, sets a status that means "some promotions were deferred",
and then tells the operator `deferred: none` — twice, on both channels.

This contradicts three ACs. AC-7.1 requires the report to carry "what was deferred to human
judgment". AC-2.4 requires the log to record "promoted and deferred items". AC-3.5's degraded path is
only useful if the operator learns there is a proposal file to read. FSPEC §10.4 item 8 is "what it
deferred for human judgment", and FSPEC's field table (`:1861`) reads `| deferred: | what the pass
left for human judgment | AC-7.1 |` — a data field, not a fixed word. FSPEC §10.3 classifies
`deferred:` as **free-form** ("the value is data, not a vocabulary", `:1841`), which is exactly why
no vocabulary test catches this.

I checked whether any test would: none does. `consolidationReport.test.js:235` names `deferred` only
in the list of free-form field names excluded from the vocabulary comparison, and no case asserts the
field's value against a state carrying deferrals. A test that did would be a one-line fix's oracle.

**What to change:** render both fields from `state.deferred` — the identifier and reason per entry,
`none` only when the array is empty (FSPEC §10.4's receive-side totality rule already says an empty
section is rendered as an explicit empty statement, so `none` stays correct in the empty case).

### F-05 — report item 7 is the hardcoded literal `advisory: none` (High, Local)

`:2064`:

```js
lines.push(`7. advisory: none`);
```

`state.advisory` is set at `:637` from `parseEscalations` and never read again. FSPEC §10.4 item 7 is
"the §9 advisory notes: the corpus state, any §9.4 / §9.5 candidate, and any operator action" — three
things, none of them rendered. The corpus state is the part that stings: the pass *does* determine it
and *does* record it as a reason code, so the information exists and reaches the log's `reason:`
field but not the report item that AC-7.1 assigns to it. An operator reading item 7 on a run with a
populated `ESCALATIONS.md` would conclude the advisory corpus was empty.

Paired with F-03, REQ-CONS-06 has no observable output whatsoever: nothing derives the candidate and
nothing would print it if it did.

**What to change:** render item 7 from `state.advisory` — corpus state always, candidate when
F-03's call produces one, operator action when one is implied.

### F-06 — the PR base branch is hardcoded to `"main"` (Medium, Cross-Feature)

`:833`:

```js
let createCmd = mergeCommandFor("consolidationCreate", {
  repo, head, base: "main", …
});
```

`mergeCommandFor` parameterises `base` correctly (`orchestrate-dev.js:379`), and `openClone`
(`:2195`) deliberately does **not** hardcode a branch — `git clone --depth 1 --single-branch` takes
whatever the remote's HEAD is, which is what AC-3.8's "cut from the fetched default branch" asks for.
The call site then throws that generality away.

No spec fixes the literal: TSPEC §8's row is `_ghRun(mergeCommandFor("consolidationCreate", {…}))`
(`:1637`) with the params elided, and neither FSPEC nor REQ names `main` (I grepped all three). So
this is an implementation choice with no document behind it. On a consuming repo whose default branch
is `master` or `develop`, `gh pr create --base main` fails, `classifyPrFailure` (`:877`) routes it to
`api-failure`, and the promotion degrades to a proposal file — no data loss, but a silently lost
promotion on a class of repo the feature claims to support, reported as an API failure rather than as
a misconfiguration.

I tag this **Cross-Feature** rather than Local because the repository's own `mergeCommandFor`
("repoCaps", `orchestrate-dev.js:348`) already requests `defaultBranchRef` for Phase MERGE — the
codebase has a settled way to learn this and one call site did not use it. That is a reusable lesson
about default-branch assumptions in the plugin, not a fact about this feature.

**What to change:** derive the base from the clone (`git -C {dir} symbolic-ref --short HEAD`, which
`--single-branch` has already resolved) or from `defaultBranchRef`, and pass it. A regression test
would set the double's default branch to something other than `main` and assert the `--base` argument
follows.

### F-07 — the operator-facing entry point still documents the old, manual behaviour (Medium, Process)

`pdlc/skills/consolidate-learnings/SKILL.md:12` at HEAD still reads:

> **Cadence:** Manually invoked. A `SessionStart` nudge hook reminds when ≥5 un-consolidated
> LEARNINGS exist, but you may be run any time.

The branch changed exactly two lines of that file (`:35` predicate, `:41` topic) — both in REQ §5's
in-scope list, both correct. But the cadence line is now false: the feature's headline is a
cadence-and-volume-triggered pass with `consolidation.cadenceHours` (default 168) and
`consolidation.volumeThreshold` (default 5) evaluated **by the pass**, not by the hook (AC-1.2).
Meanwhile CLAUDE.md's diff on this branch asserts the new shape:

> `/pdlc:consolidate-learnings` now resolves to a skill and a runtime bundle sharing one name, the
> same shape `orchestrate-queue` already has

In that shape the skill is a pointer: `pdlc/skills/orchestrate-queue/SKILL.md:8` opens "This skill
delegates to a workflow script. It does not run the pipeline itself." `consolidate-learnings/SKILL.md`
is still the full manual human procedure and mentions neither the workflow nor the config keys. So an
operator (or an agent) typing `/pdlc:consolidate-learnings` reads a document that tells it to do the
work by hand.

I am deliberately not calling this High. REQ §5 puts "retiring the manual `/pdlc:consolidate-learnings`
entry point" **out of scope**, so keeping a manual procedure is intended, and the workflow is reachable
on its own (the bundle ships, `distribution-manifest.json:6-8` carries its row, and `sync-workflows.sh`
is manifest-driven so the consumer copy lands without a script change — I checked). What is missing is
the sentence that tells a reader both exist and which is which.

**What to change:** update the Cadence line to state the automatic trigger and its two config keys,
and add a pointer to the workflow — including how a manual run reaches `direct: true`, since that is
the input the bundle declares for exactly this purpose.

### F-08 — the module's `meta` and the bundle's `CONS_META` disagree (Low, Local)

`consolidate-learnings.js:29-35` declares `inputs: []` and carries no `whenToUse` and no `phases`.
The bundle's hand-written copy (`build-runtime.mjs:163-185`) declares the `direct` boolean input,
a `whenToUse`, and four phases. The bundle's copy is the one the runtime reads, so nothing is broken
— this is the same situation `DEV_META`'s own comment already documents ("the module's own
`meta.inputs` is dead in this artifact … Keep it in step", `build-runtime.mjs:191-194`).

It is Low because it misleads only a reader of the source. It is worth a line because AC-1.1's manual
entry point lives entirely in the copy that is easy to forget, and the module's `meta` is where
someone will look first.

**What to change:** either mirror the bundle's inputs/phases in the module's `meta`, or carry the
`DEV_META`-style comment there pointing at `CONS_META` as the live channel.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Were F-02 and F-03 conscious deferrals for a later slice? If so I could not find the record — PLAN's task table names no task for wiring `remediationChoice` or `seamCandidates` into `main()`, and neither appears in REQ §7's deferral table. If they were deferred, they need a D-CONS row and a bound successor; if they were missed, the fixes are small and belong here. |
| Q-02 | For F-01's fix: is reading prior passes' LEARNINGS bodies acceptable cost per pass? The corpus is small today, but the fold is over *all* prior passes and grows monotonically. If not, the alternative is persisting the standing state as a ninth record field — which would need a vocabularies §1 row and so a change-controlled edit to `pdlc-consolidation-vocabularies.md`. I have no product preference between them; I flag it because one is a code change and the other is a contract change, and only the second needs a document round. |
| Q-03 | On F-06, what *is* the supported set of consuming repos? If the answer is "this repository only, forever", the hardcode is defensible with a comment saying so and the finding drops to Low. AC-3.8's two-repo configuration reads as though it is not. |

## Positive Observations

- **The falsifiability machinery is genuinely well built.** `effectivenessTable` (`:1514`),
  `effectivenessVerdict` (`:1498`) and `remediationChoice` (`:1631`) implement FSPEC §8.3/§8.5/§8.7
  faithfully, including the parts that are easy to get wrong — the three verdict arms evaluated in
  order and total, `insufficient-evidence` skipped by the `ineffective` streak but counted by the
  `unmeasurable` one, empty-consumed passes advancing neither, and `revise` resetting the streak. My
  High findings are about wiring, not about this logic, and none of them requires rewriting it.
- **The set-equality obligations were taken seriously where they were taken.** The effectiveness
  table is one row per distinct id with first-seen keying and an explicit sort so the table is
  invariant under record order (`:1587-1589`); `routeOf` ranges over the *imported*
  `MERGE_GUARD_DEFAULTS` rather than a local copy (`:1661`), which is exactly what AC-3.1's
  "**exactly** `MERGE_GUARD_DEFAULTS`" asks for; and the PR trailer is derived from `enacted` itself
  rather than assembled beside it (`:2085-2088`), so AC-3.3's set-equality holds by construction
  instead of by discipline.
- **The credential never becomes a string.** AC-4.2 and NFR-2 are met in a way I did not expect to
  see done properly: only the variable's *name* is held, the boolean crosses the seam (`:797`),
  expansion happens one process below the transport in git's own credential helper (`:816-819`), and
  `--body-file` is used instead of `--body` specifically so the body is never an argv element a
  failure log could capture (`orchestrate-dev.js:376-379`). That is careful work.
- **AC-3.8's "no branch operation in the invoking tree" is honoured literally.** The clone is cut
  with `--single-branch` from the remote's own HEAD (`:2195`) rather than from a named branch, and
  the invoking tree sees no checkout, switch, stash or reset anywhere in the module.
- **`skipped-cadence` really is cheap.** It exits before minting a passId, before the marker, and
  before any body read (`:553-557`) — which is what makes AC-7.2's no-log-row exemption honest under
  `/loop` rather than a log that grows once per tick.
- **The empty-datum bootstrap is right.** `triggerFor` treats a null datum as elapsed and the caller
  adds `no-cadence-datum` (`:1199-1200`, `:559-561`), so a fresh repo's first tick runs and is
  distinguishable from an ordinary one — the never-fires failure AC-1.1 names is closed.

## Recommendation

**Needs revision.**

Five High findings, and I want to be clear that this is not a verdict on the quality of the work —
the module is careful, the specs are unusually well served in the places that were wired, and the
credential handling and clone isolation are better than the ACs strictly demanded. The problem is
narrow and mechanical: **three ACs' worth of computed behaviour never reaches the operator.** In
REQ's own framing, REQ-CONS-05 is what makes this a consolidation *agent* rather than a consolidation
*script* — a promotion that cannot be measured, remediated or retired is the failure this feature was
written to end, and today it ships unmeasured.

To move to Approved, exactly this:

1. **F-01** — at `consolidate-learnings.js:651`, build the pass list from the log's
   `<!-- pdlc:consumed -->` blocks (oldest first, current pass last) and fold over it, so
   `ineffective` and `unmeasurable` can be reached. `effectivenessTable` itself needs no change.
2. **F-02** — call `remediationChoice` for each `ineffective` row, write `revision`/`retirement` onto
   the row, and route the resulting proposal like any other (AC-5.4).
3. **F-03** — call `seamCandidates(escalations.counts)` at `:637` and carry the result on
   `state.advisory`.
4. **F-04** — render `deferred:` from `state.deferred` in both `renderTerminalRow` (`:2008`) and
   `renderReportBody` (`:2065`); keep `none` for the genuinely empty case.
5. **F-05** — render report item 7 (`:2064`) from `state.advisory`: corpus state, candidate,
   operator action.
6. **F-06** — derive the PR base from the clone's resolved default branch instead of the literal
   `"main"` at `:833`.

F-07 and F-08 are Medium and Low and do not gate the verdict; please fold them in while the file is
open, since both are a few lines.

One request that costs little and is worth more than any single fix above: **each of F-01 through
F-05 should land with a test that exercises `main()`, not the helper.** Every one of these functions
is already unit-tested and every one of those tests is green — the tests are correct and the calls
are absent, so an L1 oracle cannot see the defect. For F-04 specifically, a case that gives `main()`
a state with a non-empty `deferred` and asserts the rendered field is not `none` would have caught it
at authoring time; today no test asserts that field's value at all, because FSPEC §10.3 classifies it
free-form and the vocabulary comparison excludes it by name.

## Verdict

VERDICT: Needs revision
{"high": 5, "medium": 2, "low": 1}

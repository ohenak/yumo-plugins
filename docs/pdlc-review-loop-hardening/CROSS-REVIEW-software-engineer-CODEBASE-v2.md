# CROSS-REVIEW — software-engineer — CODEBASE (Phase CR) — v2

**Feature:** `pdlc-review-loop-hardening`
**Reviewer:** se-review (Final Codebase Review, Phase CR — remediation round)
**Scope:** Cross-Feature
**Branch:** `feat-pdlc-review-loop-hardening` @ `579758f`
**Diff range:** `c563687..579758f` (the three remediation commits only)
**Predecessor:** `CROSS-REVIEW-software-engineer-CODEBASE-v1.md` — Needs revision, 0 High / 3 Medium / 3 Low
**Date:** 2026-07-30

---

## 1. Round Bound and Method

**R-5 bound.** This round reviews the three remediation commits and nothing else:

| Commit | Finding | Surface |
|---|---|---|
| `6e611a0` | F-1 | `build-runtime.mjs` `DEV_META`, `__tests__/runtimeBundle.test.js`, rebuilt `dist/` |
| `52f21c1` | F-2 | `orchestrate-dev.js` `isComplete`, `__tests__/completeness.test.js`, `__tests__/pacingWrapper.test.js`, rebuilt `dist/` |
| `579758f` | F-3 | `CLAUDE.md` |

Diff total: 9 files, +262 −7 excluding the v1 review file itself. Round 1 already cleared the priority
surfaces (C-2 await discipline over all 27 seam call sites, RLH-32 ordering, the three adapter seams,
the runtime structural constraints, the `RLH-AT-64` exemption predicate) and none of them is touched
here — no seam call site, no injection table, no bundle composition array, no adapter function.
I did not re-derive them.

F-4, F-5 and F-6 were deliberately left unfixed with named successors and are not re-raised. The
§5.9-vs-§16.3 verdict wording drift and the `VALID_VERDICTS` hoist are closed and not relitigated.
**R-6:** no `file:line` citation drift is reported at any severity.

**DC-02 method — measured, not inferred.** Every claim below is derived from the bytes at a named
construct or from command output. Falsifiability claims are established by **mutation**: I applied a
targeted mutant, ran the assertion, restored the tree, and confirmed `git status --porcelain` empty
after each. Six mutants in total, listed at §3, §5 and §6.

Commands run (the full suite was verified independently by the orchestrator and is not re-run here —
`1 failed / 70 skipped / 1166 passed / 1237 total`, the single red being the permanent, `H-k`-protected
`AT-22 [red-until-L-06]`):

```
npm test -- __tests__/completeness.test.js __tests__/runtimeBundle.test.js -t "RLH-CR-F"
  → 2 suites passed, 6 passed / 44 skipped
    (exactly the 2 new RLH-CR-F1 + 4 new RLH-CR-F2 cases the suite delta accounts for)
npm test -- __tests__/pacingWrapper.test.js -t "RLH-AT-49" / -t "RLH-AT-51"   → 1 passed each
node pdlc/workflows/build-runtime.mjs --check                                  → exit 0, three rows in-sync
```

## 2. F-1 — `DEV_META` declares `inputs`

**Resolved. `forcePhases` is now reachable through the shipped artifact, and the round-1 premise about
`DEV_ENTRY` is confirmed correct.**

**The premise held: only the meta needed changing.** `6e611a0` touches exactly one hunk of
`build-runtime.mjs` — 20 added lines, all inside `DEV_META`. `DEV_ENTRY` is byte-identical to its
pre-fix form, and it already read

```js
const __reqPath =
  typeof args === "string" && args.trim()
    ? args.trim()
    : args && typeof args === "object" && args.reqPath
      ? args.reqPath
      : null;
```

so the bare-string invocation `/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md` and the
named-input object form are both accepted by the same ternary. `__forcePhases` reads the object arm
only, which is the correct and unchanged behaviour. Nothing about the entrypoint had to move.

**The two `meta.inputs` copies are consistent.** `dist/orchestrate-dev.bundle.js` carries three
`inputs: [` literals. Compared by extracted byte-slice:

| # | Line | Owner | Result |
|---|---|---|---|
| 0 | 10 | `DEV_META` — the `meta` the runtime reads | — |
| 1 | 430 | `orchestrate-dev.js`'s own `meta`, inside the `__dev` IIFE (dead) | **byte-identical to #0** |
| 2 | 5086 | `orchestrate-queue.js`'s `meta` (`queuePath`) — unrelated | differs, correctly |

Both dev copies declare `reqPath` (required) and `forcePhases` (optional, `type: "string"`), with the
same description text and the same catalogue string `R, F, T, P, D, PR, all` — which matches
`FORCE_PHASE_TOKENS` (`orchestrate-dev.js:813`, six tokens) plus `all`, and therefore matches the halt
message rendered from the same array at `:3969`.

**Falsifiability, by mutation.** Both new `RLH-CR-F1` cases red under a targeted mutant:

| Mutant applied to `build-runtime.mjs` | Result |
|---|---|
| delete the `inputs` array from `DEV_META` | test 1 **red**, test 2 green |
| `DEV_ENTRY`'s `typeof args === "string" && args.trim()` → `false && args.trim()` | test 1 green, test 2 **red** |

Each mutant reds exactly its own case, so neither passes vacuously and the pair discriminates the two
halves independently. One caveat about *what* the tests are asserting against is raised as **F-8**.

**Not re-raised:** the round-1 note that `QUEUE_ENTRY`'s `_runPipeline` does not forward `forcePhases`
is now documented in `CLAUDE.md` (§4), and `build-runtime.mjs:162` confirms the closure still passes
`{ reqPath }` only — the documented behaviour is the actual behaviour.

## 3. F-2 — the `Harvested from` conjunct

**Resolved, and resolved in the direction I recommended second-best but which is better argued than my
recommendation was.** All four sub-questions I was asked to check come back correct.

**(a) The criterion is now FSPEC §16.5's conjunction.** §16.5 states it as "the metadata table
including its `Harvested from` row, and its five numbered sections each with a non-empty body". The
`LEARNINGS` arm now appends the metadata conjunct to `missing`, so `complete` requires both. The
authoring choice is recorded where a future reader will hit it — the doc comment on
`HARVESTED_FROM_ROW` states the ruling (FSPEC §16 owns structural completeness and governs; the TSPEC
§5.9 narrowing is documentation drift for Harvest) and the same ruling appears in the commit message
and the test-file preamble. That is the "record the narrowing" half my finding asked for, applied to
whichever document lost, which is the part that matters.

**(b) The clause is appended last, and `firstUnwrittenSection` still names a section first.** The push
happens after `missing` is built from the five numbered sections, so the ordering is positional, not
incidental. `firstUnwrittenSection` (`orchestrate-dev.js:2248`) reaches `missing[0]` only at its
step 4, after step 3's `sections.find(isEmptyBody)` has already returned any unwritten section — so
there are two independent reasons a section is named ahead of the row. §16.5's mapping row ("when all
five are satisfied") is now reachable and asserted directly: `RLH-CR-F2` case 1 checks
`missing === [HARVESTED_FROM_CLAUSE]`, and case 2 checks that with a section short the section is
`missing[0]` and the clause is *absent* from `missing` entirely. The clause literal matches FSPEC
§16.5's mapping row byte for byte: `(the metadata table's "Harvested from" row)`.

**(c) The AC-4.2c approval-record exclusion is preserved.** `RLH-CR-F2` case 4 asserts completeness
both with and without `## 6. Approval Record`. Nothing in the added code inspects section 6, and the
positional walk still collects only `1.`…`5.`.

**(d) Matching is correctly scoped.** `HARVESTED_FROM_ROW` is `/^\s*\|\s*harvested\s+from\s*\|/i`,
applied through `scanLines`, which skips fenced regions (`orchestrate-dev.js:569`). This is exactly
the shape §16.4's `Scope:` marker uses, and it matters here specifically because
`harvest-learnings/SKILL.md:76` carries the row inside a fenced template — a LEARNINGS that quotes the
SKILL's format block must not score its own table from the quotation. Case 3 asserts both the
case-insensitive match and the fenced-quotation rejection.

**Prompt side agrees with the criterion.** `harvest-learnings/SKILL.md`'s output format already emits
`| Harvested from | {list …, now deleted} |` in the metadata table, so a conforming harvest produces a
complete document on its first dispatch and the criterion does not tighten the loop for correct
output. One asymmetry on the checklist is raised as **F-9**.

**Falsifiability, by mutation.** Deleting the single added line
`if (!hasHarvestedFromRow(fileText)) missing.push(HARVESTED_FROM_CLAUSE);` from `isComplete` reds
**3 of the 4** `RLH-CR-F2` cases; case 4 (the approval-record exclusion) correctly stays green, since
it asserts a property the mutant does not change. The conjunction is therefore falsifiable in both
directions and no case is vacuous.

## 4. F-3 — `CLAUDE.md` operator contracts

**Resolved. Judged for accuracy against the code, not for style: every factual claim in the added text
checks out, and the section is complete for the three contracts F-3 named plus F-1's operator half.**

Nine claims, each checked against the construct that implements it:

| Claim in the added text | Verified against | Verdict |
|---|---|---|
| POSTMORTEM `RESOLVED:` line is read "outside any fenced block" | `orchestrate-dev.js:939–956` — `/^\s*RESOLVED:\s*(\S*)\s*$/` under the fence-skipping scan | accurate |
| `RESOLVED: no`, absent, or unparseable all refuse the phase (fail closed) | `:946` doc + `checkPostmortem` `:2428`, `status: "unresolved"` | accurate |
| the refusal "reports the POSTMORTEM's `## Recommendation`" | `:3888` interpolates `gate.recommendation`, produced by `extractRecommendation` `:988` | accurate |
| the marker is human-written only — no agent, no script writes `yes` | no write site exists in `pdlc/workflows/`, `pdlc/hooks/` or any SKILL; the only occurrences are the *instruction* at `:3888` and `orchestrate-dev/SKILL.md:40` | accurate |
| the `Harvested from` row is required and its absence makes the file structurally incomplete | §3 above | accurate as of `52f21c1` |
| `## 6. Approval Record` is best-effort — reported, never a halt | `RLH-AT-51`, and the exclusion asserted by `RLH-CR-F2` case 4 | accurate |
| its six columns, in the stated order | `harvest-learnings/SKILL.md:107` — identical order and names | accurate |
| anchors are `APPROVAL-HASH: sha256:{64 hex}` / `REVIEWED-COMMIT: {sha}`, copied verbatim and never recomputed | `orchestrate-dev.js:815–817`, append at `:1975`; `harvest-learnings/SKILL.md:55` states copy-never-recompute | accurate |
| exactly one `VERDICT:` line; a second is read fail-closed and the approval is not honoured | `extractFileVerdict`'s pre-count, and `se-review/SKILL.md:238` says the same thing to the reviewer | accurate |

Two judgement calls in the wording are the right ones:

- **"The heading must be exactly `## Verdict`."** This is stricter than `crossReviewComplete`'s
  `normaliseHeadingTitle` test but exactly matches `extractFileVerdict`'s. Documenting the stricter of
  two live predicates is correct operator guidance — it is the form under which both agree, and it
  keeps F-6 (which stands unfixed, with its own successor) from becoming an operator-visible trap.
- **The `forcePhases` paragraph.** "Forcing overrides a recorded **approval** only — an unresolved
  POSTMORTEM still refuses the phase" is verified structurally, not just textually: the phase gate's
  step G runs `checkPostmortem` on the path taken by forced *and* unforced phases
  (`orchestrate-dev.js:3874–3891`, "Every exit that leads to running the phase arrives here, forced or
  not"). "An unrecognised token halts with a message naming the catalogue" matches `:3966–3979`, which
  returns a final report with `outcome: "halted"` before any phase runs, rendering the catalogue from
  `FORCE_PHASE_TOKENS` itself.

**No claim overstates the code.** In particular the text does *not* say `forcePhases` is available from
the queue — it says the opposite, and `build-runtime.mjs:162` agrees. What the text describes as
"optional" tier-1 anchors is a mild understatement (the workflow appends them itself; the reviewer need
not), but the operator-facing consequence — a cross-review may or may not carry them, and harvest
writes `unavailable` when it does not — is stated correctly.

*Falsifier for this section:* any claim in the added text whose implementing construct behaves
otherwise. I looked for one at each of the nine rows and found none.

## 5. Did the Fixes Break or Weaken Anything

**No. Existing coverage was updated, not deleted, and the one fixture that changed came out stronger.**

The `pacingWrapper.test.js` change is the only edit to pre-existing test code in the three commits, and
it is confined to the `learningsDoc` fixture: a `LEARNINGS_METADATA` constant, a `harvestedFrom` knob
defaulting to `true`, and a `String.replace` that inserts the table between the `# ` title and the
first `## ` section. **Not one assertion line in the file is added, removed or altered** — the diff
touches lines 192–227 only, and every `expect` in `RLH-AT-49`, `RLH-AT-51` and `RLH-AT-58` is
byte-identical to its pre-fix form.

That leaves the real question: did the *fixture* change weaken what those assertions discriminate? I
mutated the fixture — `harvestedFrom` forced to never insert the table — and ran each against the
**unmutated** module:

| Case | Under the fixture mutant | Reading |
|---|---|---|
| `RLH-AT-51` | **red** | The metadata row was **required** for this test to keep passing, and it now depends on it. AT-51's claim ("the missing §4.4 record does not make the episode incomplete") is only meaningful if the document is otherwise complete — which, post-F-2, requires the row. The fixture change is what preserves the test's discrimination; without it AT-51 would have been passing for the wrong reason. **Strengthened.** |
| `RLH-AT-49` | green | Leg (c) asserts `prompt` contains `LEARNINGS_HEADINGS[4]`, which holds whether or not the clause also sits in `missing`, and the dispatch-count assertion is `>= 2`. So AT-49 is insensitive to the row in both directions — it asserts precisely what it asserted before, neither more nor less. **Unchanged.** |

So the fixture edit is the minimum needed to keep an existing test honest under a tightened criterion,
which is the correct shape for this kind of change. The new conjunct's own coverage lives in
`RLH-CR-F2`, not smuggled into AT-49.

**One residue, not a finding.** `pacingWrapper.test.js`'s new `harvestedFrom` parameter is never passed
`false` anywhere in that file (grep: the identifier appears only at its own declaration, doc comment
and guard). It is an unexercised fixture branch. It costs nothing, it makes the fixture symmetric with
`completeness.test.js`'s, and the `false` direction *is* exercised — in `RLH-CR-F2`, which owns it. I
record it so the next reader does not mistake it for coverage.

**Nothing else regressed.** No production construct outside `isComplete`'s `LEARNINGS` arm changed;
`orchestrate-dev.js`'s diff across all three commits is +46/−2, entirely the new constant, the
`hasHarvestedFromRow` helper, one pushed clause and comment. The rebuilt `dist/` artifacts are
consistent (`build-runtime.mjs --check` exits 0 with three in-sync rows), and I confirmed the working
tree is byte-clean after every mutation experiment in this review.

## 6. Findings

All three v1 Medium findings are closed. Three new Low findings, all documentation or test-claim
hygiene introduced by the fixes themselves; none blocks Phase DOD and none requires a code change in
this feature.

| ID | Severity | Surface | Summary |
|---|---|---|---|
| F-7 | Low | TSPEC §3.1 / Q-07, `pipelineWiring.test.js` | the fix reverses a recorded TSPEC decision; the decision and a test comment still assert the opposite, and the duplication Q-07 refused is now real and unguarded |
| F-8 | Low | `runtimeBundle.test.js` `RLH-CR-F1` | the test's stated guarantee — asserted against the shipped bytes — does not hold; it asserts against the builder source |
| F-9 | Low | `harvest-learnings/SKILL.md` | the Quality Checklist lists the non-mandatory approval record but not the now-mandatory `Harvested from` row |

### F-7 — Low — Q-07 is now contradicted by the code, and its stated cost is unmitigated

TSPEC Q-07 asks "should `forcePhases` be declared in `DEV_META`?" and answers **"No."**, with the
rationale "Adding one creates a second declaration to keep in sync … The module's `meta.inputs` (§3.1)
is the canonical documented surface." TSPEC §3.1 repeats it: "`DEV_META` in `build-runtime.mjs` is
**not** edited". `6e611a0` does the opposite — correctly, because Q-07's premise is false for the
artifact the runtime loads (the module's `meta.inputs` is inside the `__dev` IIFE and is read by
nothing), which is precisely what v1 F-1 measured.

Two residues:

1. **The reversal is unrecorded on the TSPEC side.** Compare F-2, where the losing document's
   narrowing is argued in the code comment, the commit message and the test preamble. F-1's fix has
   the "why" only in a code comment in `build-runtime.mjs`; TSPEC §3.1 and Q-07 still read as standing
   decisions, so a later reader reconciling code to spec finds a contradiction with no ruling attached.
2. **`pipelineWiring.test.js:471` still says `// build-runtime.mjs is deliberately NOT edited (TSPEC
   §3.1, Q-07)`** — a comment inside a green test that asserts the opposite of what ships. That is the
   actively misleading half.
3. **Q-07's stated cost is now incurred and unguarded.** The two `inputs` copies in
   `dist/orchestrate-dev.bundle.js` are byte-identical *today* (§2), but nothing asserts that they stay
   so: `RLH-CR-F1` reads only the leading `DEV_META`; `RLH-WIRE-01` and `orchestrate-dev.test.js:39`
   read only the module's `meta`; no test compares them. Nor is the catalogue derived —
   `RLH-CR-F1` hard-codes `["R","F","T","P","D","PR","all"]` rather than importing
   `FORCE_PHASE_TOKENS`, so a change to the token set would leave the operator-facing description
   silently stale in both copies. This is exactly the drift class v1 §9 flagged.

*Recommend:* no code change required in this feature. The one-line comment at
`pipelineWiring.test.js:471` should be corrected whenever that file is next touched, since it is
currently false. The rest is a spec reconciliation.

*Successor surface (DC-08):* `LEARNINGS-pdlc-review-loop-hardening.md` §3 (Rejected Proposals) for the
Q-07 reversal and its reason, and §5 (Open Items for Consolidation) for a `docs/_constraints/` entry —
"`DEV_META` and the module's `meta` are two hand-maintained copies; derive the catalogue and assert
their equality" — which is the same successor v1 F-4 and F-5 name.

*Falsifier:* a TSPEC amendment recording the Q-07 reversal, or a test that reds when the two `inputs`
literals diverge.

### F-8 — Low — `RLH-CR-F1` does not assert against the shipped bytes it claims to

The test's own preamble states: "Both halves are asserted against `dist/orchestrate-dev.bundle.js` —
the bytes the runtime loads — **not** against the builder's source." Measured, that is not what
happens. `runtimeBundle.test.js:18` does `import { stripModuleSyntax } from "../build-runtime.mjs";`,
and `build-runtime.mjs` is a top-level script with no entry guard — importing it **performs a full
build and writes `pdlc/workflows/dist/`** before any assertion runs.

Demonstrated: I removed the `inputs` array from the tracked `dist/orchestrate-dev.bundle.js` only
(confirmed `--check` then exits 1 with a `STALE` row, so the mutation was real), ran
`npm test -- __tests__/runtimeBundle.test.js -t "RLH-CR-F1"` — **both cases passed**, and the file's
`inputs` literal count went 2 → 3 across the run. The test read regenerated bytes.

Consequence, and its bound: the property F-1 needed is still genuinely asserted — §2's mutation table
shows both cases red against `build-runtime.mjs`'s source, which is where `DEV_META` and `DEV_ENTRY`
actually live. So this is a claim defect, not a coverage hole. But a reader who trusts the preamble
would believe the *tracked artifact* is pinned by this test, and it is not.

The import side-effect itself **predates this feature** (`git log -S` puts it at `3991b4d`, on `main`),
so it is outside the R-5 bound and I raise no finding against it here; see §7.

*Recommend:* reword the preamble to say what it does — the assertion is on the freshly built bundle,
and tracked-artifact freshness is `--check`'s job — or capture the bundle bytes before the import runs.
No behaviour change either way.

*Falsifier:* a run in which perturbing only `dist/orchestrate-dev.bundle.js` reds `RLH-CR-F1`.

### F-9 — Low — the harvest checklist does not list the row it is now gated on

`52f21c1` moved the `Harvested from` row from "part of the template" to "part of the completeness
criterion", but `harvest-learnings/SKILL.md`'s Quality Checklist was not updated. The checklist now has
it backwards: it carries an explicit item for `## 6. Approval Record`, which is deliberately **excluded**
from the criterion, and no item for the metadata row, which is now half of it.

The document format section (`:76`) does emit the row, so a harvester following the template produces a
complete file, and if one does not, the resume clause names the row by §16.5's exact string — the loop
self-corrects within the episode. So the impact is one wasted dispatch, not a stuck pipeline. It is
worth naming only because the checklist is the harvester's own self-check, and it currently points at
the wrong one of the two.

*Recommend:* one checklist line — "`| Harvested from | … |` row present in the metadata table (it is
the record of what step 8 deleted, and the file is structurally incomplete without it)". Prompt-side
only, no rebuild.

*Successor surface (DC-08):* if not taken now, `LEARNINGS-pdlc-review-loop-hardening.md` §4 (Process
Learnings) — "when a completeness criterion moves, the authoring SKILL's checklist moves with it".

*Falsifier:* a Quality Checklist item naming the `Harvested from` row.

## 7. Recorded for Harvest (outside the round bound)

## 8. Recommendation

## Verdict

# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.1)
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Delta re-review. Baseline `e323aa2` (the bytes v1 reviewed) → HEAD; 594 insertions, 89
deletions. Two passes only: (1) each of v1's fifteen findings, verified resolved against the file and
against the code it cites; (2) the changed sections, read for new issues. Unchanged sections already
approved are not re-litigated. The approval bar is unchanged — any open High or Medium means
**Needs revision**.

## Disposition of v1 findings

All fifteen are resolved. Each was re-verified against the repository, not against the revision's
prose.

| v1 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | High | **Resolved** | §7.1 now enumerates through `_git(["ls-files", "--cached", "--others", "--exclude-standard", "--", ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"])`. I ran it: **5** hits at HEAD, and the `:(glob)` claim is exact — without the magic prefix the same pathspec returns **7**, the two extras being `docs/discarded/pdlc-rcv-budget-stop/` and `docs/discarded/pdlc-review-convergence/`, precisely as §7.1 states. `rtGit` (`runtime-adapter.js:945-957`) shell-quotes each argv element (`:949`), so the pathspec rides through intact. §13.1 row 10 records the decision |
| F-02 | High | **Resolved** | §5.1 transcribes the real `ListReply` union verbatim, and §11.2 marks `fakeListFiles` "wired for protocol completeness only. **No consolidation test drives it**". §10.3 row 1a gives the unlistable corpus its own row with the three-conjunct observable (status `failed`, the pathspec and `stderr` in the report body, never `no-op`) |
| F-03 | High | **Resolved (in part — see F-02 below)** | §5.6(a) states the widening, §9.2 withdraws "no new capability is needed", §11.3(e) states the pinning assertion and §11.6 withdraws the exemption. The `_writeFile` half is right: `runtime-adapter.js:805` does read "relative to the repository root". The `_readFile` half is not — F-02 below |
| F-04 | High | **Resolved, and verifiably** | I enumerated the FSPEC's AT register (`| AT-…` rows) and §12.3's file table independently and diffed them: **96 ids each, set-equal in both directions, zero on either side of the difference.** AT-C1b, AT-Q7b and AT-Q7c all now have a file. `consolidationTraceability.test.js` makes the equality a test with an injected `root` — the right fix, since it fails on the *next* suffixed AT too |
| F-05 | High | **Resolved** | §7.1 adds the env-gated `PDLC_PENDING:` stderr line and §11.3(f) specifies AT-P7's oracle with a third conjunct (each set equals a literal transcription), so two implementations both returning `∅` no longer agree. The hook citations are all correct: `THRESHOLD = 5` at `:25`, the predicate at `:41`, `n >= THRESHOLD` at `:43`, the message at `:44-48`, `PY_BIN` at `:13-20`. The snippet is implementable as written — `pending` exists at `:41` and both `os` and `sys` are imported at `:23`. §13.1 row 12 records it and makes row 6 conditional on it |
| F-06 | Medium | **Resolved** | §11.3(c) now grows **both** axes and names them: `AWAIT_SCAN_SOURCES` (`runtimeBundle.test.js:1040`) and `AT19_SEAM_NAMES` (`:215-223`) — I confirmed neither `_envPresent` nor `_makeTempDir` is on the shipped list, so the extension is necessary and not decorative |
| F-07 | Medium | **Resolved** | §7.3's take is now `read → verdict → write → read back → parseMarker → confirm passId`, §10.3 row 5a carries it, and the AT is positive on both sides (terminal status **and** the marker's content on disk). The adapter comment it leans on is real — `runtime-adapter.js:798` |
| F-08 | Medium | **Resolved** | `read-remote` and `read-index` are now their own verbs; §9.3 withdraws the fold on its own terms and §13.1 row 9 no longer asserts the opposite |
| F-09 | Medium | **Resolved** | `resolveSeamDomain` is exported and total, returns `"git-clone"` for the prefix-free `clone` call by name, and §11.3(a) adds the **partition** assertion as a fourth — which was the part that mattered |
| F-10 | Medium | **Resolved** | T-07 is discharged by `consolidationBuild.test.js` reading the tracked `.gitignore`; §12.2's row says why a maintainer check is not one |
| F-11 | Medium | **Resolved** | §11.4's second table pairs each invariance with a positive conjunct, and names `mergeProposals` as the subject rather than `failureModeId` |
| F-12 | Medium | **Resolved** | §11.3(b) gains the authority-file leg with three-way set equality and the `Version` 1.4 pin, parser as a pure function of an injected `root` |
| F-13 | Low | **Resolved** | §5.6(b) reclassifies `_now` as a module-level default and states the host-timezone consequence and the `TZ` pin |
| F-14 | Low | **Resolved** | §3.3's fixture clause is deleted; the gitignore(5) ground stands alone |
| F-15 | Low | **Resolved** | `:1820-1826` |

## Findings

Five new, all in changed sections.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §12.2's new T-11/T-12 rows bind six of their nine named ATs to FSPEC register ids whose text asserts something else entirely — and §12.3's set-equality oracle structurally cannot see it | §12.2 |
| F-02 | Medium | Local | `rtReadFile` carries no "relative to the repository root" clause; §11.3(e)'s oracle pins text that does not exist in one of the "both prompts" it names | §5.6(a), §5.5, §9.2, §11.3(e) |
| F-03 | Medium | Local | The F-01 fix split T-08's two implementations at the *enumeration* seam, and AT-P7 feeds both from one basename list — so the new divergence is invisible to the only test pinning T-08 | §7.1, §11.3(f), §12.2 T-08 |
| F-04 | Medium | Local | §10.1's normative `finishPass` is sync-declared with two `await`s and an un-awaited seam-backed append; §10.2 returns it un-awaited. §11.3(c)'s audit cannot see any of it | §10.1, §10.2 |
| F-05 | Medium | Local | "`routeOf`'s outcome set is FIVE-valued" is wrong — the reachable set is four; `"degraded"` is unreachable from either routing function, and no name exists to write the set-equality oracle against | §7.6 |
| F-06 | Low | Local | `runtime-adapter.js:806-807` cited three times for a clause that is at `:805` | §5.5, §5.6(a), §9.2 |
| F-07 | Low | Local | §11.1's "asserts once, unconditionally, that the probe either found an interpreter or recorded the notice" is a tautology over the harness's own branch — it can only pass | §11.1 |

## Detail

## Detail

### F-01 — T-11 and T-12 name ATs that assert something else (High)

The two new §12.2 rows are the traceability that binds the PR body and the proposal file to
falsifiers. I read every AT they name in the FSPEC's register (`FSPEC-…:2064-2077`). Six of the nine
bindings are wrong — not imprecise, but attached to a Given/Then about a different subject:

| Row's claim | The FSPEC's actual AT (`:line`) |
|---|---|
| T-11: **AT-Q3** — "body cites source LEARNINGS by feature name, the failure mode, the AC-2.3 evidence" | `:2066` AT-Q3 — a pair on an **open** PR; nothing is opened, `duplicate-suppressed` names the pair in `suppressed-by:`, `pr:` stays empty |
| T-11: **AT-Q4** — "round-trip — `enactedByPr` reads back the trailer `renderPrBody` wrote" | `:2067` AT-Q4 — the same pair on a **closed-unmerged** PR; the proposal is re-opened as a new PR |
| T-11: **AT-Q5** — "trailer set-equal to `enacted`, both directions" | `:2068` AT-Q5 — a merged `promote` now `ineffective`; the `revise`/`retire` proposal is **not** suppressed by it |
| T-11: **AT-Q2** — "per-commit `PDLC-PROMOTION-ID`" | `:2065` AT-Q2 — correct, **and it is also the only AT that carries the trailer set-equality** T-11 attributes to AT-Q5 |
| T-12: **AT-Q9** — "each degradation class writes the file with the diff inline and its reason code by name" | `:2074` AT-Q9 — a PR whose invoking branch is **deleted without merging**; the trailer survives and still suppresses. The second degradation class T-12 wants is AT-Q6 (`:2069`, `branch-exists`), not AT-Q9 |
| T-12: **AT-Q11** — "the file is written **only** when something is not enacted" | `:2076` AT-Q11 — two runs over an unchanged corpus; `DOMAIN-CONSTRAINTS.md` is **byte-identical** after the second. Nothing about the proposal file's existence condition |
| T-12: **AT-Q8** | `:2073` — correct |

Why this is High rather than bookkeeping. §12.2's Falsified-by column is the *only* thing that says
which test owes an obligation; §13.3 hands the PLAN a manifest keyed on the files §12.3 names, and a
PLAN task reads these rows to know what it must assert. So the practical outcome is that AC-3.2's
three body citations, AC-3.4's second clause and FSPEC §5.3's "when, and only when" each end up with
a *named* falsifier that will be written to a different specification and will pass while the
obligation is unimplemented. That is worse than an empty cell, which at least reads as a gap.

And the compensating control cannot catch it. §12.3's `consolidationTraceability.test.js` asserts set
equality between the FSPEC's register and §12.3's file table — an assertion over **ids**. AT-Q3,
AT-Q4, AT-Q5, AT-Q9 and AT-Q11 are all in the register and all assigned to `consolidationRoute.test.js`,
so the oracle is green over a mis-binding it was never built to see. There is no test anywhere that
compares a §12.2 row's *description* of an AT against the register's text.

**Required:** re-bind every AT in T-11 and T-12 to the register's actual text. Where the obligation
has no AT — AC-3.2's citation clause is the clear case, since the FSPEC's own AC→AT map (`:2269`)
binds AC-3.2 to AT-Q2, which asserts only the trailers — say so and raise it upstream rather than
naming an id that happens to be nearby. An erratum for that gap is in my final message.

### F-02 — half of §11.3(e)'s oracle pins text that does not exist (Medium)

The `_writeFile` half of the v1 F-03 repair is correct and I confirm it: the clause is real, at
`runtime-adapter.js:805`, and an absolute `dir` from `mktemp -d` genuinely contradicts it.

The `_readFile` half is not. §5.6(a) says "The shipped prompts say the opposite of what that needs
(`runtime-adapter.js:806-807`, `:493`)"; §5.5's new row says "`rtReadFile` (`:493`) is framed the
same way"; §9.2 repeats it. I grepped the whole adapter: **`"relative to the repository root"` occurs
exactly once, at `:805`, inside `rtWriteFile`.** `rtReadFile` (`:493`) reaches the filesystem through
`rtReadProbe` (`:369`), whose prompt is `Run this exact command from the repository root and report
its output:` followed by `if [ ! -f "${path}" ] || [ ! -r "${path}" ]; …` (`:374-378`) — a shell test
on the path as given, which resolves an absolute path verbatim today. The read path needs no
widening; it already works.

The testing consequence is direct, and it lands on the oracle that answers v1 F-03. §11.3(e) says the
assertion "pins the widened clause in **both** prompts verbatim, so a future edit that reverts them to
'relative to the repository root' reds". For `rtReadFile` there is no clause to widen and none to
revert. The implementer has two ways out and both are bad: assert against text that is not there
(red on a correct tree, and it will be "fixed" by deleting the assertion), or add a gratuitous clause
to a read prompt every shipped workflow depends on, purely so a test has something to match — a
prompt edit to `runtime-adapter.js` with no behavioural motive, on the file §13.3 already flags as a
serialised single-writer.

**Required:** scope the widening and §11.3(e)'s assertion to `rtWriteFile` alone, and state
positively why `_readFile` needs nothing — the probe's `[ -f "${path}" ]` form is the reason, and it
is worth recording so a later reader does not "harmonise" the two prompts. §5.5's row, §5.6(a) and
§9.2 all carry the same wrong claim and all three need the edit.

### F-03 — T-08's two implementations now differ where AT-P7 cannot look (Medium)

T-08 is "one corpus, one predicate" (§12.2), and AT-P7 is its sole falsifier. Before this revision
both implementations enumerated the same way (a directory glob), so a differential over the predicate
covered the pair. §7.1's repair changed the JS side's *enumeration* to
`git ls-files --cached --others --exclude-standard`, while the hook keeps
`glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))` (`nudge-consolidation.sh:28`) plus the
`docs/completed/*/` arm §7.1 adds. The two now answer different questions about the same tree.

The divergence is concrete, not theoretical, and runs in both directions:

- A LEARNINGS file matched by `.gitignore` is in the **hook's** set (`glob.glob` does not consult
  git) and out of the pass's (`--exclude-standard`). The operator is nudged every session about a
  file no pass will ever consolidate, and no pass can clear the nudge.
- A LEARNINGS file **staged but deleted from the worktree** is in the **pass's** set (`--cached`
  lists it) and out of the hook's. The pass then carries a corpus entry whose body `_readFile`
  returns `null` for — a state §10.3 has no row for, since row 1 is about the *log*.

Neither can be caught by AT-P7 as §11.3(f) specifies it: the harness "writes one fixture corpus into
a temp directory, points both implementations at it (the hook through `CLAUDE_PROJECT_DIR`, `:26`;
the JS through `classifyCorpus` over the same enumerated basenames and log text)". Feeding both sides
one basename list is exactly what makes the enumeration seam untestable — it is the same shape as the
leaky `fakeListFiles` double v1 F-01 objected to, moved one function to the left. It is also not
obviously runnable otherwise: the fixture temp directory is not a git repository, so
`enumerateCorpus`'s `ls-files` cannot be pointed at it without a `git init` and an index the section
does not mention.

**Required:** either narrow T-08 to the *predicate* explicitly in §12.2 and add a separate stated
control for the enumeration pair (the honest option — say the two enumerations are held equal by
inspection, and record the two divergence classes above as accepted, the way §10.4 item 1 records the
marker race), or extend AT-P7 to cover it: have the harness `git init` its fixture root, stage a
subset, ignore another, and assert the two enumerated **sets** are equal before the predicate runs.
Whichever is chosen, §13.1 row 6's "held equal by a differential test" must say which half is held.

### F-04 — the `finishPass` sketch violates §5.1's own invariant, unfalsifiably (Medium)

§10.1's normative code:

```js
function finishPass(state) {
  if (state.status === "skipped-cadence") return report(state);
  appendTerminalRow(state);                                       // step 14
  if (state.status !== "refused") await commitConsumingRepoPaths(...);  // step 15
  if (state.markerHeld) await releaseMarker(state);               // step 16
  return report(state);
}
```

Three defects, and they compound. The function is declared **sync** and contains two `await`
expressions — as literally written this is a `SyntaxError`, which is the harmless part.
`appendTerminalRow` is the step-14 `_appendFile` write and is **not** awaited, against §5.1's "Every
seam call is `await`ed without exception". And §10.2's call sites are `return finishPass(fail(state,
"advisory-model-unresolved"));` and `return finishPass(failNoReason(state, err));` — un-awaited, so
once `finishPass` is made `async` (as it must be) `main()` resolves its report while the terminal
row, the §9.4 commit and the marker release are still pending.

The reason this is a finding rather than a typo is that **nothing in §11 can falsify it**. §11.3(c)'s
audit scans call sites of *injected seam identifiers*; `finishPass`, `appendTerminalRow`,
`commitConsumingRepoPaths` and `releaseMarker` are module functions, so the scan is green.
Every L2 test drives sync doubles (`seams.js`'s header names this as the central hazard), under which
an un-awaited promise settles before the assertion runs and the suite is green too. The failure
appears only against the async adapter, in production, as a pass that returns a report claiming a
terminal row it has not yet written — and AC-1.3's marker release is in the same tail.

**Required:** make `finishPass` `async`, `await` all three steps including
`appendTerminalRow`, and `await` it at both §10.2 call sites and at every `return finishPass(state)`
§10.1 describes. Then state the oracle: an L2 assertion that reads the log double **after** `main()`
resolves and finds the terminal row present is the falsifier, and it is worth naming because it is
the only one that distinguishes "written" from "scheduled".

### F-05 — `routeOf`'s outcome set is four-valued, not five (Medium)

§7.6 declares:

```ts
// routeOf's outcome set is FIVE-valued; Route (6.1) has four members. See below.
type RouteOutcome = Route | "proposal-file";
```

`Route` is `"constraints" | "decisions" | "PR" | "degraded"` (§6.1, transcribed correctly from
`pdlc-consolidation-vocabularies.md`). So `RouteOutcome` has five members — but `routeOf`'s **range**
has four. `"degraded"` is a *record* value describing an attempted PR that reached only the proposal
file; §7.6's own inline comment on the very next line enumerates the range correctly as
`"PR" | "constraints" | "decisions" | "proposal-file"`, and `routeProposal`'s three branches can
return only those four. Two adjacent lines contradict each other, and the prose one is wrong.

This matters at exactly the point this document is strictest. §6 makes every enumerated union a
closed set with a set-equality oracle, and the review standard here requires enumerated contracts to
be checked by set-equality over the full enumeration rather than containment. A test author writing
that oracle for the routing functions has one named type to assert against, `RouteOutcome`, and it is
wider than the range by a member no conforming implementation can produce — so the set-equality reds
on correct code, and the predictable repair is to weaken it to containment, which then no longer
fails when a route is deleted. The document needs a *named* four-member type
(`RouteDecision = "PR" | "constraints" | "decisions" | "proposal-file"`) for the two functions'
signatures, with `RouteOutcome`/`Route` reserved for the record field, and the comment corrected.

### F-06 — `:806-807` for a clause at `:805` (Low)

§5.5's new row, §5.6(a) and §9.2 each cite `runtime-adapter.js:806-807` for
`"…relative to the repository root…"`. The clause is on **`:805`**; `:806-807` are
`replacing the file's current contents exactly. Do not reformat, re-wrap,` and
`summarise, or add anything.` The `:798-801` citation in §7.3 is fine (the sentence starts at `:798`;
`:801` is the comment's closer). Same class as v1 F-15 and equally cheap.

### F-07 — the L4 skip assertion cannot fail (Low)

§11.1's answer to my Q-01 is mostly right and I accept it: jest's `test.skip` reports as *skipped*
rather than *passed*, which is a real distinction in the run summary and is the falsifier that
matters. But the sentence continues: "and additionally asserts once, unconditionally, that the probe
either found an interpreter or recorded the notice; the notice is a `console.warn` line naming the
probed candidates". Since the harness itself emits that `console.warn` in the branch where the probe
found nothing, the disjunction is a tautology over its own control flow — the assertion can only
pass, in every possible world. Treat it as no test at all (it is decorative, not harmful, hence Low)
and either delete it or replace it with the one thing that is falsifiable: assert the count of
executed differential rows is either the full fixture table or zero, so a harness that silently ran
*some* rows is red.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The hook exits at `nudge-consolidation.sh:29-30` (`if not learnings: sys.exit(0)`) **before** the point §7.1 places the `PDLC_PENDING:` line, so a fixture with no LEARNINGS at all emits no line and the harness must infer `∅` from silence — an absence-only reading of the one channel the whole differential rests on. §11.3(f)'s fixture table has no zero-corpus row today, so nothing is broken; is that deliberate, and should the debug line move above the early exit so "the hook computed ∅" and "the hook did not run" stay distinguishable? |
| Q-02 | §11.3(e) cites `runtimeBundle.test.js:1573-1580` (and §3.3 cites `:1570-1584`) as the precedent for a source-text assertion over `runtime-adapter.js`. That range is the **C0-control-byte** scan — `runtime-adapter.js` is a member of its `SOURCES` array at `:1573-1578`, so the file is read, but the shape being cited is a byte-class check, not a prompt-text match. Nothing turns on it (the assertion is trivially writable either way) — do you want the citation to name a closer precedent, or to say plainly that this is a new shape? |
| Q-03 | §12.2's new unnumbered row for the dropped-code arm describes "an AT-L-series row" in `consolidationReport.test.js` with two fixtures over one code. §12.3 assigns that file AT-L1…AT-L5 and AT-N1…AT-N4 exhaustively, and the traceability test asserts set equality against the FSPEC register — so this row cannot mint a new `AT-L6`. Which existing id carries it, and does that id's FSPEC text already oblige the two-fixture control? |
| Q-04 | §11.4's `mergeProposals` property generates "a group of ≥2 proposals sharing `(failureModeId, action)`, in a random permutation". `failureModeId(phase, artifact)` is derived, so a generator that *assigns* the id independently of `(phase, artifact)` can produce inputs no pass can construct. Is the generator obliged to derive the shared id from a shared `(phase, artifact)` pair, so the property ranges over the reachable input space? |

## Positive Observations

- **Every v1 finding is closed, and closed at the mechanism rather than at the wording.** F-01 is the
  clearest case: the repair did not soften the claim, it changed the seam, and the `:(glob)` argument
  is measured rather than asserted — I re-ran it and got exactly the 7→5 and 2→0 numbers §7.1 states.
  F-05 and F-09 are the same shape: the hook gained an observation channel and the module gained
  `resolveSeamDomain`, rather than the oracles being re-described.
- **F-04's repair is stronger than what I asked for.** I asked for an explicit enumeration; §12.3
  delivered the enumeration *and* `consolidationTraceability.test.js` asserting set equality against
  the FSPEC's register in both directions with an injected `root`. I verified the enumeration
  independently — 96 ids on both sides, empty difference each way. That table now fails on the next
  suffixed AT rather than dropping it silently.
- **The revision argues against its own earlier text by name, and gives the cost.** §9.3's withdrawal
  of the `read-remote` fold ("that is withdrawn, and it was wrong on its own terms … a later
  `git remote add` would classify as the already-permitted `read-object` and pass containment") and
  §11.3(c)'s "extending only the source set leaves the scan green on exactly the seams this feature
  invents" are both the kind of correction that survives into a LEARNINGS file. So is §12.3's
  paragraph explaining why the range notation could not have worked.
- **§11.3(b)'s authority leg is the reusable fix, and it is stated as one.** Three-way set equality
  plus the `Version` pin, parser as a pure function of an injected root — and the note that "every
  feature that transcribes a project-level shared reference has the same two-copies problem" is why
  I tagged it Cross-Feature. It is worth harvesting in that form.
- **§10.1's guard table is a genuine correction, not a defence.** "That is wrong twice, and both
  errors are load-bearing", followed by three guards each tied to a named FSPEC clause and to why a
  row-per-tick would falsify AC-1.3's datum rule — the reasoning is what makes the guards testable.
  F-04 above is about the code block's form, not this analysis.
- **ER-6 is raised rather than papered over,** and §12.4 says the honest thing about the earlier
  draft: "the claim, not the gap, was this layer's defect". The `route: "degraded"` interim is
  argued in the safe direction (`enactedByLog` does not enact on it, so the item is re-proposed) with
  the residual loss named and a stated discriminator.

## Recommendation

**Needs revision**

One High and four Medium are open. The blocking set, in the order I would fix it:

1. **F-01** — six of nine AT bindings in the two new traceability rows point at ATs about other
   subjects, and the set-equality oracle that guards that table is blind to it by construction. This
   is the one that will reach the PLAN and produce tests written to the wrong specification.
2. **F-02** — scope the adapter widening and its pinning assertion to `rtWriteFile`; `rtReadFile`
   carries no such clause and needs no edit. Fixing this *removes* work rather than adding it.
3. **F-03** — decide whether AT-P7 covers the enumeration pair or only the predicate, and say so in
   §12.2 and §13.1 row 6.
4. **F-04** — `finishPass` must be `async` and awaited at every call site; name the after-`main()`
   assertion that falsifies it, since neither the audit nor the sync doubles can.
5. **F-05** — a named four-member type for the routing functions' range.

The two Lows (F-06, F-07) are one-line edits and are not blocking on their own.

This is a substantial revision that fixed every prior finding at the mechanism. Four of the five new
findings are in text that did not exist at v1, and three of them (F-02, F-03, F-05) are consequences
of the repairs themselves — the enumeration seam moved, the widening was stated one prompt too wide,
and a new union was introduced. F-01 is the one I would not have expected: it is a mis-transcription
of upstream ids in the section whose whole job is to bind obligations to falsifiers.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 4, "low": 2}


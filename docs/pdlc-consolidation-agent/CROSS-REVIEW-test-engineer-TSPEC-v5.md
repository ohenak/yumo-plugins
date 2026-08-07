# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.4)
**Date:** 2026-08-06
**Iteration:** 5
**Scope:** Delta re-review. Baseline `74f990a` (the bytes v4 reviewed) → HEAD; 188 insertions, 38
deletions across seven commits. Two passes: (1) each of v4's four findings and three questions,
verified against the repository rather than against the revision's prose; (2) the changed sections
only, read for new issues. Unchanged sections already approved are not re-litigated. The approval
bar is unchanged — any open High or Medium means **Needs revision**.

## Disposition of v4 findings

All four are resolved, each checked at the mechanism rather than at the revision's account of it.
All three questions are answered in the document.

| v4 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | Medium | **Resolved** | §7.3 now decides both halves and states why they are one decision. `releaseMarker` is `await _writeFile(markerPath, "")` — added to the §7 signature block and to the §12.1 CONS-03 row — and `present` is `(await _checkFile(markerPath)).ok === true`, *only* that. I checked the seam it now depends on: `rtCheckFile` (`runtime-adapter.js:817-831`) does return `{ok:true}` / `{ok:false, reason:"file_empty"}` / `{ok:false, reason:"file_missing"}` exactly as quoted, so the empty released form reads as absent and cannot re-enter §7.3's `reclaim` arm. `_checkFile` was added to §5.1's protocol and to §5.3's defaults row; `fakeFs` already doubles it (`__tests__/helpers/seams.js:292`, exposed at `:313`), so no new double is owed. T-13's conjunct (ii) is restated against the observable that decision produces — the write double's **last** recorded contents for the marker path, having been the `IN-PROGRESS:` line earlier in the same history — and `fakeFs` supports the history half (`:281` pushes every write into `self.writes`) |
| F-02 | Medium | **Resolved, exactly as asked** | §12.2 carries a new unnumbered `(no FSPEC AT)` row for the unreadable corpus entry, §12.3 assigns it to `consolidationPass.test.js`, and §7.1 back-references both ("These three obligations are not left to inspection either"). All three observables are asserted, each against the readable control in the **same fixture**: the count includes both, the consumed pair contains both basenames, and the report body names the unreadable one and **not** the readable one. That is the pair-not-absence shape I asked for, and the control is what stops (1) and (3) passing on a fixture where nothing was readable |
| F-03 | Low | **Resolved, and the anchor problem was solved rather than worked around** | The pin is no longer over a line index. §7.1 specifies the hook edit that gives it a nameable anchor — `CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")` plus a comprehension using `*g.split("/")` — and states the pin over the *declaration*, located by name. I verified the premise at HEAD: `nudge-consolidation.sh:28` is `learnings = glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))`, neither literal occurs anywhere in the file, and `glob.glob(` occurs **exactly once**, so the added "occurs once, inside the comprehension" conjunct is a real falsifier and not a tautology. The proposed comprehension is behaviour-preserving: `"docs/*/LEARNINGS-*.md".split("/")` splats to the shipped `("docs", "*", "LEARNINGS-*.md")` argument list, so portability is unchanged |
| F-04 | Low | **Resolved beyond the suggestion** | §11.1 adds the L4 pathspec-semantics case and §12.3 lists it. Better than what I asked for: I proposed running the argv in *this* repository, which would have drifted as `docs/` grows; the revision runs it against a temp repository the case builds itself (`git init`, three LEARNINGS under `docs/{f}/`, `docs/completed/{f}/`, `docs/discarded/{f}/`, `git add -A`) and keeps DC-04. It is explicitly held outside the differential fixture table so `executed === TABLE.length` still means what §11.1 says it means. The oracle discriminates: drop `:(glob)` and `*` crosses `/`, so the `docs/discarded/` conjunct reds |

**Questions.** Q-01 is answered in §11.2 by two named constraints on the PLAN task (per-case double
construction, and a drain after the assertions) — see F-03 below for the one residue. Q-02 is
answered in §11.1: the `PY_BIN` probe is performed **once at module scope** and skips every
differential row or none, so the "rows run against a degraded probe" world I asked about does not
exist by construction. Q-03 is answered in §12.3, and answered the right way — by explaining why the
converse assertion is not implementable (it would red the report row that deliberately cites AT-L5)
and by bounding the residual exposure, rather than by inventing a parser that reads intent.

## Findings

Three, all in text that did not exist at v4, and all three are consequences of the same good repair:
`_checkFile` was promoted to a protocol seam, and the document has not finished following that
promotion through to the composition root and to the take sequence.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | Nothing asserts that `rtConsInjections()` supplies `_checkFile` — or any other §5.1 member. §5.3 says the module default gives "ordinary operation", which is false in the runtime for every one of these seams, and this is the one omission the repo has already shipped once | §5.1, §5.3, §8.2, §12.2, §12.3 |
| F-02 | Medium | Local | §7.3's take sequence — the line an implementer and any call-order oracle will transcribe — is still `read → verdict → write → read back`, with no `_checkFile` probe, and `verdict` is exactly where `present` is consumed. The one paragraph above it forbids deriving `present` from the read | §7.3, §4 call graph |
| F-03 | Low | Local | §11.2's timer drain is specified to run *after* the case's assertions, so it is skipped on precisely the failing path (the mutation check) it exists to keep quiet | §11.2 |

## Detail

### F-01 — the composition root that must supply `_checkFile` is asserted by nothing (Medium)

Adding `_checkFile` to §5.1 was the right call and I am not asking for it back. But a seam in the
protocol is only a seam if the production entry point actually hands it over, and the document names
that entry point (§8.2: `CONS_ENTRY` "spreads `rtConsInjections()`") without owing anyone an
assertion about its contents. I looked for the owner and there is none: `rtConsInjections` appears
at §3's file-touch table, §5.1, §8.2 and §13.2's PLAN-facing list, and in **no** row of §12.2 and no
file of §12.3. `consolidationBuild.test.js`'s §12.3 entry is "T-02's build assertions, §3.3's
`.gitignore` text, §11.3(e)'s adapter-prompt text" — none of which reads the injections object.

Three things make that a Medium rather than a nit:

1. **§5.3 now makes a claim about `_checkFile` that is not true in the runtime.** The row reads
   `_agent, _readFile, _writeFile, _appendFile, _checkFile, _listFiles, _git, _log, _phase` →
   "the module's own `default*` (the `orchestrate-queue.js:1034-1046` pattern)" → **"ordinary
   operation"**. I checked that pattern: `defaultReadFile` is
   `const { readFileSync } = await import("fs")` (`orchestrate-queue.js:948-955`). `import()` does
   not exist in the workflow runtime, so "ordinary operation" is what these defaults do **under
   jest**, and what they cannot do in the bundle. For the seams the pass uses on every path
   (`_readFile`, `_git`) that is harmless in practice, because the pass dies at step 1 and someone
   notices. `_checkFile` is the one seam whose only consumer is a **safety check that is supposed to
   be negative most of the time**, so a broken default is indistinguishable from a quiet tree.
2. **The failure mode is exactly the one the repo already shipped.** `runtime-adapter.js:1098-1100`
   carries the note in its own words: *"`_writeFile`'s adapter existed since the first bundle but
   was never in this object; the other three are new with RLH-32."* An adapter function that exists
   and is never wired is the demonstrated bug in this exact file, and the precedent test for the
   repair already exists — `adapterProbe.test.js:253-258` ("wires all three into `rtDevInjections`").
3. **If the omission happens, the direction it fails in is decided by an unspecified choice.** The
   document does not say what shape `consolidate-learnings.js`'s own `defaultCheckFile` takes, and
   the two shapes in the repo behave oppositely. `checkFileNonEmpty`
   (`orchestrate-dev.js:3674-3693`) evaluates `{ fsMod = fs }` against a module-level binding that
   the build does not carry — I confirmed the shipped bundle has `checkFileNonEmpty` at
   `dist/orchestrate-dev.bundle.js:3219` and no definition of `fs` anywhere in the file — so it
   throws loudly. But its **internal** contract, and the one a careful author is likeliest to copy,
   is "never throw": every I/O failure returns `{ok:false, reason:"file_missing"}` (`:3690-3692`).
   Copy that catch outward and the runtime failure becomes `present === false` on every probe ⇒
   §7.3's `markerVerdict` returns `free` ⇒ **AC-1.3's mutual exclusion is off in production while
   every L2 fixture with `fakeFs` stays green**, because the `refused` path is exercised only
   through the double. That is a safety property that can only pass.

**Required — one assertion and one sentence:**

- a `(no FSPEC AT)` row in §12.2 with a §12.3 file (`consolidationBuild.test.js` is the natural
  owner, or `consolidationPass.test.js` if it is written at L2), asserting **set equality** between
  the keys of `rtConsInjections()` and §5.1's declared seam names, minus the members §5.6 excludes
  by name (`_now`). Set equality, not containment, is the point: containment would still pass with
  `_checkFile` missing, which is the whole failure. `adapterProbe.test.js:253-258` is the shape;
  its per-name form would need to be an equality here because §5.1 is an enumerated contract.
- one sentence in §5.3 stating what the module defaults do **in the runtime** rather than under
  jest, and — for `_checkFile` specifically — that its default must fail loudly rather than return
  a legal `{ok:false}`, so an unwired seam cannot be mistaken for an absent marker.

### F-02 — the take sequence still omits the probe that produces `present` (Medium)

§7.3's new decision 2 is unambiguous and I agree with it: `present` is
`(await _checkFile(markerPath)).ok === true` and *"is never derived from `_readFile(...) !== null`"*.
§4's call graph agrees — `takeMarker ←_checkFile/_readFile/_writeFile`. But the line that reads as
the spec of record for the operation, two paragraphs later, still says:

```
read → verdict → write → read back → parseMarker → confirm parsed.passId === state.passId
```

and the paragraph above it opens "Take is `_readFile` then `_writeFile`". `verdict` there is
`markerVerdict(parsed, present, …)` — the step that *consumes* `present` — and the sequence supplies
nothing before it except the read. An implementer transcribing that line writes exactly the
derivation decision 2 forbids, and the document then contains both instructions.

This is not only a wording clash, because the sequence is testable text: `fakeFs` accumulates an
ordered `calls` array whose intended use is advertised in its own header
(`__tests__/helpers/seams.js:241` — `expect(fs.calls.map((c) => c.op)).toEqual(["read", "check",
"append"])`), so a call-order oracle over `takeMarker` is a natural L2 assertion and there are now
two incompatible expected values for it. One of them re-opens the `reclaim`-on-every-steady-state-
pass bug that decision 2 exists to close.

**Required:** make the sequence line and its lead-in agree with decision 2 —
`check → read → verdict → write → read back → parseMarker → confirm …`, and "Take is `_checkFile`,
then `_readFile`, then `_writeFile`". If the intended order is different (probe after read, say),
say which, because the `read-then-write` race paragraph that follows now prices a two-call take and
the operation has three.

### F-03 — the drain is specified where it cannot run on the path that needs it (Low)

§11.2's new hygiene paragraph is right on both counts and I asked for it. The residue is placement:
*"the case drains the loop before it returns (`await new Promise(r => setTimeout(r, 0))` **after its
assertions**)"*. On the broken implementation — which is the only world where a timer is still
pending, and precisely the world the mandated mutation check ("delete one `await` inside
`finishPass`, expect RED") puts the suite in — the first assertion throws and the drain never
executes. So the drain is present in every run that did not need it and absent from every run that
did.

**Suggested (not blocking):** state it as `try { …assertions… } finally { await new Promise(r =>
setTimeout(r, 0)); }`, or use jest's fake timers and `runAllTimers()` in an `afterEach`. Per-case
double construction — the other half of the paragraph — already bounds the damage to a stray
warning, which is why this is Low and not Medium.

## Questions

## Positive Observations

## Recommendation

## Verdict

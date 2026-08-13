# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-13
**Iteration:** 3

**Scope:** Testing lens only — oracle falsifiability, expected-set completeness, implementation
echoes, TDD order. Delta re-review: v0.2's eight findings verified against the revision, then
only the sections this revision changed scanned for new defects. Unchanged sections not
re-opened except where new text re-derives a number from them.

## Delta method

Diffed `0e99fb7c..HEAD` on the TSPEC (eight authoring commits, v0.2 → v0.3) and re-read every
`file:line` the changed sections newly cite, plus the two the new arithmetic depends on. Every
claim below cites what I read at HEAD, not the TSPEC's prose.

## Round-2 disposition

| Prior | Severity | Status |
|---|---|---|
| F-14 | High | **Resolved for `bin/`.** The guard keeps the name `bin/pdlc.mjs`, the body becomes `bin/cli.mjs` (E-4b), §3.1 carries two rows and §5.4 enumerates both. The manifest's `bin` field (`pdlc/engine/package.json:6-8`, verified) and `cli.test.js`'s target are genuinely untouched. See F-22: the *same* expected set has the identical defect one row lower, in `lib/` |
| F-15 | High | **Resolved.** E-3's boolean now reads N-2's recorded decision, and the two-state table plus the "a `LICENSE` lost to a bad merge shrinks both sides" paragraph states the reason in oracle terms rather than as a preference |
| F-16 | Medium | **Resolved, and better than asked.** The false "one helper" claim is replaced by a measured four-site enumeration. I re-grepped both modules: `commitPaths` (`orchestrate-dev.js:10429`), `appendApprovalAnchors` (`:6736`), `commitQueueRow` (`orchestrate-queue.js:1603`), `commitAdvisoryRecord` (`:1645`) — the table is exactly right, and the source-level set-equality makes the closure assertable. See F-26 for the fifth site's conditional membership |
| F-17 | Medium | **Resolved.** Branch 0's no-pin consequence is stated, given a three-row ladder table, and §11's error row now carries "this holds whether or not a pin was ever declared" |
| F-18 | Medium | **Resolved.** The structural oracle (zero static imports, dynamic import only) is exactly the in-process falsifier the container leg lacks, and §12.1 carries it. See F-24: the guard's *own* specified syntax defeats the section's Node-12 claim |
| F-19 | Medium | **Resolved.** `--version`/`doctor` resolve for reporting, and both states — pinned-and-resolved, empty-store-unresolved — are named as assertions, not left to the test author |
| F-20 | Medium | **Resolved for kind 3.** The four-step route (`_recordQueueRow` → 8th `rewriteStatus` parameter → `build-runtime.mjs`'s closure → row cell + message) is correct: `rewriteStatus` takes seven parameters at HEAD (`orchestrate-queue.js:1522-1530`), so `provenance` is genuinely the 8th, and the generated closure is at `:273-274` as cited. See F-25: kinds routed to C-b and C-d got no equivalent |
| F-21 | Low | **Resolved.** §12.1's module-side row is split per module and names both the 8th-parameter pass-through and the `ensureEngineColumn` round trip |

No prior finding is re-litigated below. Everything that follows is new, and each lands in a
section this revision changed or in a number this revision newly asserted.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | High | Local | **§5.4's expected packed set omits the three `lib/*.mjs` modules §3.1 creates, and this revision's new count sentence hard-codes the omission — PF-4/AT-3.8a red by construction.** Row E-5…E-16 reads "the twelve `lib/*.mjs` (V-03)" (`:298`), and V-03 (`:54`) is an explicit **HEAD measurement**: `adapter, auth, catalogue, guard-measurement, handshake, outcome, report, run, skills, startup, transport-cli, transport` — I re-counted `pdlc/engine/lib/` at HEAD and it is exactly those twelve. But §3.1 adds `lib/resolve-version.mjs`, `lib/store.mjs` and `lib/provenance.mjs` as **new** components, and the `files` entry `lib/` packs whatever is there. After this feature lands, a real `npm pack` yields **fifteen** `lib` members against an expected set naming twelve, so the both-directions equality fails against a *correct* implementation. The new prose makes it explicit and wrong: "The expected set is 20 members before N-2 and 21 after" should be 23 and 24. This is F-14's shape, in the same table, one row down: a member the design creates that the expected set does not list. The tempting fix is again the wrong one — globbing `lib/*.mjs` at test time reads the tree under test and reintroduces exactly what F-15 was fixed to remove. Enumerate the three new modules as literal members (E-17…E-19, renumbering the vendor rows) and restate V-03 as "twelve at HEAD, fifteen after §3.1" so the two statements cannot drift | §5.4 (E-5…E-16), §3.1, V-03 |
| F-23 | High | Local | **§7.4's new class 11 asserts an `artifactPaths` push that does not exist at HEAD and that the code's scoping cannot deliver without a seam this TSPEC does not name.** The prose says the set-equality holds "unless the anchor path enumerates the file it touched. It does: `appendApprovalAnchors` pushes the cross-review path onto `artifactPaths` at the point the append succeeds (`appended = true`), which is script-owned and cannot be forgotten by an agent." Verified at HEAD: it does not. `appendApprovalAnchors` is a **module-scope** function (`orchestrate-dev.js:6660`) whose destructured parameter object is `{paths, hash, normalizedHash, commit, _readFile, _probeDoc, _appendFile, _git, emit}` — no collector; its body sets `appended = true` (`:6721`) and pushes nothing. `artifactPaths` is a `const` **local to `main()`** (`:11659`), and the only push in the file is `:11507`, inside `main()`'s nested `runPhase`. The two call sites are both outside that closure (`:6516` in the review-round body, `:11336` in the erratum-confirmation body, which passes differently-named seams `readFileFn`/`gitFn`). So class 11's coverage rests on a mechanism that must be built through two call sites in two scopes, and the section instead reports it in the present tense as already true — the reader most likely to trust that sentence is the one writing AT-4.5. Name the route as precisely as §7.2 names kind 3's (which collector reaches `appendApprovalAnchors`, at which of the two call sites, and what the erratum path passes), and put class 11 in the "must be added" work the PLAN schedules rather than in the settled column | §7.4 (class 11), §13 AC-4.5 |
| F-24 | Medium | Local | **The guard's own specified statement defeats §9.3's Node-12 claim, and no oracle in the document can see it.** §9.3 says the entry's only top-level statements are the comparison and `await import("./cli.mjs")`, and one bullet later that the file "parses on Node 12 so that it can refuse on Node 12". Top-level `await` is a Node **14.8+** parse-level feature; on Node 12 the guard is a `SyntaxError` before its first statement — the precise AC-2.4 failure (stack trace, no named floor) the redesign exists to remove, now relocated from `lib/` into the guard. Nothing catches it: AT-2.5's runner is `node:18-alpine`, which parses it happily, and the structural oracle as specified counts statements and static imports, not syntax level. Two changes make the claim true and falsifiable: specify the body as a promise-chain (`import("./cli.mjs").then(…)` with the refusal on the other branch, no top-level `await`), and add a third clause to the structural oracle — the source contains no top-level `await` and no construct outside the declared subset. Alternatively, drop the Node-12 sentence and state the real floor the guard parses on; an unfalsifiable claim in a section whose whole point is falsifiability is the thing to avoid | §9.3, §12.1 |
| F-25 | Medium | Local | **Kind 4 is now four helpers, but only one has a named route to `_provenance` — the other two are in scopes the named route does not reach.** §7.2 says "All four compose `line` internally", then specifies plumbing for kind 3 only. C-b `appendApprovalAnchors` (`orchestrate-dev.js:6660`) is module-scope and takes no provenance parameter; both its callers would have to thread one, and the erratum caller (`:11336`) uses a different seam-naming convention. C-d `commitAdvisoryRecord` (`orchestrate-queue.js:1637`) takes `(recordPath, feature, gitFn, emit)` and is reached from the queue module's advisory path at `:1300` — not from `rewriteStatus`, so the 8th-parameter route carries nothing to it, and `orchestrate-queue.js` has no `_provenance` seam of its own at HEAD (grepped: no match in that file). AT-5.3's "none is unmarked" therefore cannot be implemented as specified for half the closed set. Give C-b and C-d the same four-step treatment kind 3 got — the section already proves the author can write it | §7.2 (C-b, C-d), §14.1 K-3 |
| F-26 | Medium | Local | **The commit-site set-equality's expected side is conditional, so its round-1 state is undefined, and the routing it depends on is a behaviour change with no falsifying test.** §7.2 closes the set at four, then parenthesises the fifth: `orchestrate-dev.js:2839` (the advisory A5 seam's `apply`) "is covered by C-a's rule below only if routed through `commitPaths`, and the PLAN carries that routing". An enumerated-contract oracle whose right-hand side depends on a sibling task landing is red or green depending on merge order, not on correctness. It is also not a free move: at HEAD A5's `apply` issues a bare `_git(["commit", "-m", "advisory(A5): …"])` over whatever is staged (`:2837-2841`), whereas `commitPaths` does a pathspec-scoped `git add` then commit with its own composed message — routing changes both what is committed and the message an advisory-tier assertion may pin. State the expected set unconditionally (four, with the A5 routing as a precondition task the equality depends on), and name the test that proves A5 still commits the same content under the new route | §7.2, §12.1 |
| F-27 | Low | Local | **§7.2's "resolve columns by header name" is stronger than the code, though `Engine` is safe.** `parseQueue`'s `colIndex` matches by **substring containment on the first matching column** (`orchestrate-queue.js:154-160`: `names.some((n) => cols[i].includes(n))`), not by name equality, and falls back to fixed positions when no header row is found (`:169`, `pick(cells, idx, N)`). `Engine` collides with none of `order`/`#`/`status`/`feature`/`req`/`path`/`depends`/`deps`, so the round-trip claim holds — but it holds because of the literal string chosen, not because resolution is by name. Say containment-first-match, and have the `ensureEngineColumn` round-trip test assert the header literal, so a later rename to something containing a matched substring goes red rather than silently shadowing a column | §7.2 |

## Questions

| ID | Question |
|----|---------|
| Q-09 | F-22 changes the packed-set cardinality by three. Does the FSPEC §5.2 erratum (already raised for `README.md`, `LICENSE`, `bin/cli.mjs`, `postinstall.mjs`) grow to include the three new `lib` modules, or does FSPEC §5.2's "the twelve `lib/*.mjs`" read as a seed that this TSPEC is entitled to extend? One erratum naming all seven divergences is easier to confirm than two. |
| Q-10 | §7.2's `Engine` column is added to `QUEUE.md` by `ensureEngineColumn`. `QUEUE.md` is a **human-edited** table and §7.4 explicitly scopes it out of AC-4.5. Is the column's presence asserted anywhere as an *operator-visible* contract (a documented column in the queue's own README/skill), or is it purely a machine artifact? A column that appears on the next write and is never documented will be deleted by the next hand edit, and the round-trip test will not see that. |
| Q-11 | The structural oracle parses `pdlc/engine/bin/pdlc.mjs` in the repo. AT-2.5 exercises the **packed** artifact in a container. Is anything asserting the two are the same bytes — i.e. that `prepack`/`files` does not transform the guard — or is PF-4's set-equality (membership only, not content) the whole of it? |

## Positive Observations

- **The commit-site correction was made by measurement, not by argument.** §7.2 replaced a claim
  I flagged as false with a four-row table produced by grepping both modules, named the one
  site that does not fit, and then turned the closure into an assertion instead of a promise.
  §14.4 records the method. I re-ran the same grep and the enumeration is exactly right —
  including `appendApprovalAnchors`, which is the site the earlier draft's reasoning would never
  have found. That is the difference between a corrected sentence and a corrected habit.
- **E-3's two-state table is the clearest statement of the deletion-tolerant-hole problem in
  this document.** "A `LICENSE` lost to a bad merge would shrink *both* sides of the equality
  together" is the general form of the implementation-echo rule, written where an implementer
  will actually read it, and the table makes the flip a visible edit to one record.
- **§12.3's oracle 2 was split into its two halves rather than reworded.** Marked commit,
  unmarked file, asserted separately, with the reason ("conflating them is how one of them goes
  untested") stated. That is the right response to a boundary between two sets — assert both
  sides, not the one that happens to be easier.
- **K-3 was repriced against the evidence rather than defended.** "Not as small as the earlier
  draft priced it" — two modules, four helpers, a generated-artifact hop, a new column — is the
  kind of correction that makes the rest of §14.1 believable.

## Recommendation

**Needs revision** — two High findings.

Both are the same failure mode the last two rounds have been converging on, and both are in
material this revision added. F-22 is an expected set that omits members the design creates
(the three new `lib/*.mjs`), with the new "20 members / 21 after" sentence pinning the wrong
arithmetic — PF-4 goes red against correct code, and the tempting glob fix would undo F-15.
F-23 is a present-tense claim about `artifactPaths` that HEAD does not support and that the
code's scoping cannot deliver without a seam this TSPEC has not named, which leaves AT-4.5's
newest class covered on paper only.

Concretely, to reach approval: enumerate `lib/resolve-version.mjs`, `lib/store.mjs` and
`lib/provenance.mjs` as literal members of §5.4's expected set and restate V-03's count and the
20/21 totals to match; and either name the route by which the anchor-append path reaches
`artifactPaths` (as §7.2 names kind 3's) or move class 11 into the scheduled "must be added"
work and drop the "It does" claim. The three Mediums are worth taking in the same pass — F-24
in particular, since a guard that cannot parse on the runtime it promises to refuse on is the
hazard §9.3 exists to close, and nothing in the current test set can see it.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 3, "low": 1}

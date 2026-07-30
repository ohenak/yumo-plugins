# CROSS-REVIEW — software-engineer — CODEBASE (Phase CR) — v1

**Feature:** `pdlc-review-loop-hardening`
**Reviewer:** se-review (Final Codebase Review, Phase CR)
**Scope:** Cross-Feature
**Branch:** `feat-pdlc-review-loop-hardening` @ `c563687`
**Diff range:** `2763eecb913104a912fd6e06aaba3186daa0f00c..c563687` (`git merge-base main HEAD`..HEAD)
**Date:** 2026-07-30

---

## 1. Review Bound and Method

**R-5 bound.** The diff is 104 files / +39,351 −1,926. Reviewed surface is the *production* surface only:

| In scope | Why |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` (+2,803) | the feature's centre of gravity |
| `pdlc/workflows/orchestrate-queue.js` (+230) | `_git` seam, drift gate, `rewriteStatus` |
| `pdlc/workflows/runtime-adapter.js` (+102) | three new seams, the only untested file |
| `pdlc/workflows/build-runtime.mjs` (+40) | the RLH-32 ordering hazard |
| `pdlc/workflows/dist/*` (generated) | verified as artifacts, not read as source |
| `pdlc/skills/*/SKILL.md` (9 files) | the prompt-side half of every new data contract |
| `pdlc/.claude-plugin/plugin.json`, `CLAUDE.md` | shipped operator-facing surface |

Out of scope, deliberately: the 50 `CROSS-REVIEW-*` round files, the six spec documents (read as
authorities, not reviewed), `docs/_queue/QUEUE.md`, `docs/requirements/traceability-matrix.md`, and the
~7,500 lines of new test code (read where it *is* the mechanism — §2, §6 — not audited as a whole).

**DC-02 method.** Every claim below is derived from command output or from the bytes at a named
construct. Where a claim is a universal ("no un-awaited seam call"), its falsifier is stated.

**Commands run:**

```
node pdlc/workflows/build-runtime.mjs --check      → exit 0, three rows in-sync
git merge-base main HEAD                            → 2763eecb…
```

Plus a parse harness that reconstructs the runtime's evaluation shape (§5) and three mechanical
alias/await scans over the two module sources (§2).

**R-6.** No citation or `file:line` drift is reported at any severity, per the review discipline.

## 2. Priority Surface — C-2 Await Discipline

**Result: clean. No un-awaited injected IO call exists in either module source.**

Three independent derivations, because this is the one defect class the green suite cannot see.

**(a) Direct call-site enumeration.** Every call of the nine seam names and their `main()`-level aliases
(`readFileFn`, `writeFileFn`, `appendFileFn`, `checkFileFn`, `listFilesFn`, `gitFn`, `recordHaltFn`,
`checkCiFn`, `mergeWorktreeFn`) across both files — 27 sites total — is lexically preceded by `await`.
Helper functions (`reviewLoop`, `refreshReviewState`, `appendApprovalAnchors`, `checkPostmortem`,
`tier2ApprovalRecord`, `dispatchAndVerify`) destructure the seams **shorthand** (`_readFile`, not
`_readFile: rf`), so the seed names themselves are the call-site names there — no alias to miss.

**(b) Reachability of every async helper.** I derived the set of `async function` / `async` arrow
declarations in both modules and located every call site not preceded by `await`. Three survive, all
correct:

| Site | Form | Why correct |
|---|---|---|
| `orchestrate-dev.js:1609` `dispatchAndVerify({…})` | entire body of the `wrapped` arrow | returned promise; `runWrapped:1632` awaits it |
| `orchestrate-dev.js:1765–1766` `runWrapped(…)` | elements of `await _parallel([…])` | awaited combinator argument |
| `orchestrate-dev.js:4264` `agentFn(…)` | element of `await parallelFn(batch.map(…))` | awaited combinator argument |

`orchestrate-queue.js:723` `return runPicked({…})` is a returned promise inside an `async` function,
awaited by `main`'s caller.

**(c) The in-repo scanner.** `__tests__/runtimeBundle.test.js` now carries `scanAwaitDiscipline`, run as
`RLH-AT-19` over both sources with a vacuity guard (`sites.length > 0`) and a named-failure assertion.
Its mechanism is sound and better than my (a): `maskLiterals` first, a thirteen-name seed set
(`AT19_SEAM_NAMES`) that is deliberately *not* derived from `main()` (`_now`, `_phaseDodEnabled` would
red correct source), a fixed-point wrapper closure so `agentFn` enters via `rawAgentFn`, and a
combinator set that excludes `Promise.race`/`Promise.any` because they settle on one element. The
returned-promise ruling tests **both** halves (`return`/`=>` before, whole-expression after), so
`return _checkFile(p) || fallback` is not exempted. This is a durable regression barrier, not a
one-time check.

**Falsifier for the whole section:** a call of any of the thirteen names, or of a local rebinding of
one, that reaches the runtime without `await` — i.e. `scanAwaitDiscipline` returning a site with
`ruling: "unclassified"`, or a seam aliased under a new name inside a non-`main` function's parameter
list. The first is asserted in CI; the second is F-4 below.

## 3. Priority Surface — RLH-32 Build Ordering and Seam Wiring

**Result: correct on both entrypoints. No unwired seam on the production queue path.**

**Ordering.** `build-runtime.mjs` joins the dev bundle as
`[DEV_META, BANNER, adapter, devModule, queueModule, DEV_ENTRY]`. The emitted artifact confirms the
order actually holds — this is the check that matters, because the hazard is invisible in the builder:

| Artifact | `const __dev = (function ()` | `const __queue = (function ()` | `const realMain = __dev.main;` |
|---|---|---|---|
| `dist/orchestrate-dev.bundle.js` | line 322 | line 4977 | line 4978 |
| `dist/orchestrate-queue.bundle.js` | line 317 | line 4972 | line 4973 |

`__queue`'s prelude reads `__dev.main` at IIFE-evaluation time, and `__dev` is initialised ~4,650 lines
earlier in both. A TDZ `ReferenceError` on load is therefore impossible. `--check` exits 0, so the
tracked `dist/` bytes are the ones this order produces.

**`_recordHalt` on both paths.** The adapter deliberately omits it (`runtime-adapter.js:288–290`), so
each entrypoint supplies it:

- `DEV_ENTRY` → `__queue.rewriteStatus(__queue.DEFAULT_QUEUE_PATH, feature, status, rtReadFile, rtWriteFile, rtGit)`
- `QUEUE_ENTRY`, inside the `_runPipeline` closure → the same call at `__queuePath` (the operator's path, not the default)

Both call shapes match `rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn, gitFn)`
positionally and in arity. `wrapModule` was widened to publish `rewriteStatus` and `updateQueueStatus`
from `__queue`, and the emitted `return { main, meta, DEFAULT_QUEUE_PATH, rewriteStatus, updateQueueStatus };`
is present at the tail of both bundles' `__queue` IIFE — so the closures reach real functions, not
`undefined`.

**Full injection coverage.** `rtDevInjections` supplies thirteen keys; `main()` declares twenty-one
`_`-prefixed parameters. The remainder are the policy values and pass-throughs
(`_phaseDodEnabled`, `_phasePubEnabled`, `_now`, `_sleep`) and the three agent-composites
(`_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`), each of which resolves to a module
function that itself takes `_agent` — none reaches Node. `_git` was added to `QUEUE_ENTRY`'s own
injection object too, so `orchestrate-queue`'s three `rewriteStatus` calls commit through the adapter
rather than falling back to `defaultGit`'s `await import("child_process")`.

**Falsifier:** `queueModule` appearing before `devModule` in either emitted bundle; `__queue`'s returned
object omitting `rewriteStatus`; or an entrypoint `.main({…})` object missing `_recordHalt`. All three
are asserted by `RLH-AT-64` (see §6), derived from the shipping sources rather than hand-listed.

## 4. Priority Surface — runtime-adapter.js New Seams

**Result: all three correct. This is the only unit-tested-by-proxy file in the diff, and it holds up.**

**`rtAppendFile`.** Append-shaped **by prompt construction**, exactly as required. It issues one
`RT.agent` call whose instruction is "APPEND … to the END of", explicitly forbids reading, rewriting,
reformatting or altering existing content, and specifies create-with-content-only when absent. It is
*not* `rtWriteFile(path, existing + text)` — there is no read in the function at all, so the
read-modify-write failure mode (re-emitting the reviewer's prose through a model and silently rewriting
a cross-review) is structurally unavailable, not merely discouraged. The `<<<PDLC_CONTENT_BEGIN` /
`PDLC_CONTENT_END` delimiters match `rtWriteFile`'s, keeping one payload convention.

**`rtListFiles`.** Closed vocabulary, correct in both directions:

| Reply | Result |
|---|---|
| empty/whitespace `dirPath` | `{ok:false, reason:"bad_argument"}` — decided *before* calling out, mirroring `rtCheckFile` |
| non-string / `null` agent reply | `{ok:false, reason:"unreadable"}` |
| `""` | `{ok:true, files:[]}` — the genuine empty directory |
| one of the three sentinels | mapped via `RT_LIST_SENTINELS` |
| anything with `/` or whitespace on any line | `{ok:false, reason:"unreadable"}` |

The last row is the load-bearing one: prose the prompt did not permit becomes "I could not find out",
never an empty list. `!lines.every(l => !/[\/\s]/.test(l) && !RT_LIST_SENTINELS[l])` also rejects a
sentinel appearing *among* filenames, so a partial reply cannot be read as a listing. The shell command
distinguishes `dir_missing` / `not_a_directory` / `unreadable` before `ls`, and `ls -p -A | grep -v '/$'`
drops directories — matching the "regular files, non-recursive" contract. Four `LIST_FAILURES` members
are declared in `orchestrate-dev.js:62–67`; all four are producible here.

**`rtGit`.** Argv transport, `{ok, stdout, stderr}`, never throws. The `JSON.parse` is inside
`try/catch` and the catch returns `{ok:false, stdout:"", stderr:"unparseable adapter response"}`. Every
field is type-guarded (`parsed.ok === true`, `typeof … === "string"`), so a well-formed-but-wrong reply
degrades rather than propagating `undefined`. The prompt pins "and nothing else", "do not retry, do not
repair, do not run any other command" — appropriate for a seam that runs `git commit`. Consumed by
`commitQueueRow`, whose `NOTHING_TO_COMMIT_RE` idempotence check reads both `stdout` and `stderr`,
which `rtGit` always supplies as strings.

**Falsifier:** an `rtAppendFile` implementation containing a read; an `rtListFiles` path that returns
`{ok:true, files:[]}` for a reply it did not recognise; an `rtGit` input that escapes the `try`.

## 5. Priority Surface — Runtime Structural Constraints

**Result: satisfied on both shipped artifacts.**

Measured on `dist/`, which is what the runtime loads:

| Constraint | `orchestrate-dev.bundle.js` | `orchestrate-queue.bundle.js` |
|---|---|---|
| `export const meta` is the first statement | line 1 | line 1 |
| `meta` is a pure literal | yes — hand-written `DEV_META` / `QUEUE_META`, no computed members | same |
| exactly one `export` in the file | 1 | 1 |
| no static `import` statement | 0 | 0 |
| `\bprocess\s*\.` / `\bfetch\s*\(` | 0 / 0 | 0 / 0 |
| ends in a top-level `return` | yes | yes |

I additionally reconstructed the runtime's evaluation shape — compiling each bundle (with the single
`export` keyword removed) as an `AsyncFunction` body whose only parameters are the eleven documented
host globals. **Both parse.** Top-level `return` is legal in that shape, no identifier outside the host
set is referenced at top level, and `const RT = { agent, parallel, pipeline, phase, log }` binds before
either IIFE runs.

The residual Node references (`fs.readFileSync` in `defaultReadFile`, `await import("child_process")`
in `defaultGit` / `mergeWorktree` / `checkPrCi`) survive `stripModuleSyntax` but sit only in default
seam implementations that the entrypoints override. They are parse-safe and unreachable. See F-5.

## 6. Priority Surface — RLH-AT-64 Exemption Predicate

**Result: predicate genuinely unmodified. The ruling stands; not relitigated.**

`git diff b1b7ab1..d14119f -- __tests__/runtimeBundle.test.js` is **17 lines added, 1 removed, all
inside the `_recordHalt` `it(…)` block**. `classifyExemption`, `e2ForwardCallees`, `resolveOneHop`,
`moduleFunctionParams`, `moduleValueInit`, `looksLikeFunction`, `rtDevInjectionKeys`,
`entrypointInjectionKeys` and `underscoreKeysOfObject` are byte-identical across that commit. The
E-1/E-2/E-3 forms are unchanged, no name is special-cased, and no regex was widened. The removed line
was `expect(report(recordHalt)).toBe("_recordHalt: wired=true exemption=none")`; the added assertions
are `toContain("wired=true")` plus `toMatchObject({ exempt: false })` — strictly the two conjuncts
TSPEC §8.5 and PLAN §9.3 state.

The anti-rot clauses that make the predicate load-bearing are all still present and still derived:
seams from `parseMainParams(devMasked)`, `wired` from `rtDevInjections` ∪ the entrypoint objects,
anti-rot 1 (exempt **and** wired is a failure), anti-rot 2 (unresolved evidence is a failure, including
E-2). Nothing here admits a real seam.

## 7. Findings

## 8. Assessed and Cleared

## 9. Documentation Drift for Harvest

## 10. Recommendation

## Verdict

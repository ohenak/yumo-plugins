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

| ID | Severity | Surface | Summary |
|---|---|---|---|
| F-1 | Medium | `build-runtime.mjs` / `CLAUDE.md` | `forcePhases` ships with no reachable, documented invocation channel |
| F-2 | Medium | `orchestrate-dev.js` `isComplete` | LEARNINGS criterion drops FSPEC §16.5's `Harvested from` conjunct; FSPEC's resume-clause row becomes unreachable |
| F-3 | Medium | `CLAUDE.md` | three new operator-facing contracts undocumented in the repo's operator manual |
| F-4 | Low | `__tests__/runtimeBundle.test.js` | await scanner's alias resolution covers `main()` only — a renamed seam in a helper's parameter list is invisible |
| F-5 | Low | `dist/*.bundle.js` | dangling `fs` / `await import()` in default seam implementations survive into the shipped artifacts |
| F-6 | Low | `orchestrate-dev.js` | two different `## Verdict` heading predicates for the same section |

---

### F-1 — Medium — `forcePhases` has no reachable, documented invocation channel

`orchestrate-dev.js:96–103` declares `forcePhases` in the module's `meta.inputs`, and `main()` accepts
it at `:3672`. But `build-runtime.mjs`'s `DEV_META` — the `meta` that actually ships, hand-written
because the runtime demands a pure literal first statement — **declares no `inputs` array at all**.
`meta.inputs` in the module is dead: `stripModuleSyntax` keeps it inside the `__dev` IIFE, where
nothing reads it, and the bundle's own `meta` never mentions the input.

Second half: `DEV_ENTRY` reads it as
`args && typeof args === "object" && args.forcePhases ? args.forcePhases : null`. The invocation form
`CLAUDE.md` documents — `/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md` — passes `args` as a
**string**, on which `typeof args === "object"` is false. So on the documented invocation path
`forcePhases` is permanently `null`. Reaching it requires `{ reqPath, forcePhases }`, a form stated
nowhere the operator will see it.

This is not a spec violation — TSPEC §7.2 edit 1's "no other channel into the bundle" is satisfied by
`args.forcePhases`, and §5.7's `parseForcePhases` is correct and well tested (six tokens, `all`,
message derived from `FORCE_PHASE_TOKENS` so catalogue and text cannot desynchronise). It is a
**delivery** gap: a feature-sized capability with no discoverable way to use it.

*Recommend:* add `inputs` to `DEV_META` (naming `reqPath` and `forcePhases`) and one CLAUDE.md line
giving the object-arg form. Both are in `build-runtime.mjs` / `CLAUDE.md` — no module change, no
rebuild risk beyond a `--check` refresh.

*Falsifier:* `DEV_META` containing an `inputs` entry for `forcePhases`, **or** a documented invocation
in which `args` is an object.

*Note:* `QUEUE_ENTRY`'s `_runPipeline` does not forward `forcePhases`, so queue-driven runs cannot
force. That reads as intentional (the queue is unattended) and I raise no finding, but it is
undocumented and should be stated wherever F-1 is closed.

### F-2 — Medium — LEARNINGS completeness drops FSPEC §16.5's `Harvested from` conjunct

FSPEC §16.5 states the criterion as a conjunction: "the metadata table including its `Harvested from`
row, **and** its five numbered sections each with a non-empty body". `isComplete`'s `LEARNINGS` arm
(`orchestrate-dev.js:1319–1338`) implements only the second conjunct — it collects `## N.` headings for
`N ∈ 1..5` with non-empty bodies and returns complete when all five are present. Nothing in the module
matches `Harvested from`; `grep -rn 'Harvested from' pdlc/workflows/` returns zero hits.

TSPEC §5.9's table restates the criterion as "its own required headings; the approval record section is
excluded" — silently dropping the metadata-table conjunct. The code follows TSPEC. So this is an
FSPEC↔TSPEC conflict that the implementation resolved in TSPEC's favour without either document
recording the narrowing (unlike §16.5's approval-record exclusion, which *is* argued at length).

Two consequences, both real:

1. A LEARNINGS carrying five populated sections but no metadata table reaches terminal and reports
   success. The wrapper then permits `harvest-learnings` step 8's deletion of every `CROSS-REVIEW-*`
   and `CODE_REVIEW-*` — and `hooks/scripts/guard-harvest-before-delete.sh` only checks that
   `LEARNINGS-{feature}.md` exists, so nothing else catches it. The record of *what was deleted* is
   exactly the row that went missing.
2. FSPEC §16.5's per-class resume-clause mapping ("when all five are satisfied,
   `(the metadata table's "Harvested from" row)` if that is what is missing") is **unreachable**: under
   this implementation, five satisfied sections means `missing === []` means complete, so the branch
   that would emit that string cannot be entered.

*Recommend:* pick one and make both documents say it. Either add the conjunct (a `scanLines` predicate
for a `Harvested from` table row, cheap and symmetric with §16.4's `Scope:` marker) and keep FSPEC
§16.5 as written, or amend FSPEC §16.5 and its mapping row to match TSPEC §5.9 and record the reason.
The second is smaller and defensible on the same AC-4.2c grounds the approval-record exclusion uses.

*Falsifier:* a `LEARNINGS-{feature}.md` with sections 1–5 populated and no `| Harvested from | … |` row
that `isComplete("LEARNINGS", …)` reports `{complete: false}` for.

### F-3 — Medium — CLAUDE.md omits three new operator-facing contracts

`CLAUDE.md` is this repo's shipped operator manual and the file every consuming session loads. It
receives **no change in this diff**, while the feature adds three contracts an operator must know:

1. **POSTMORTEM `RESOLVED:` lifecycle.** `checkPostmortem` refuses a phase whose POSTMORTEM carries no
   readable `RESOLVED: yes`, and the marker is human-written only. `CLAUDE.md:134` still describes
   post-mortems as merely a filename convention. Without the lifecycle documented there, a halted
   pipeline is unrecoverable-looking: the operator has no stated way to clear it.
2. **`## 6. Approval Record` in LEARNINGS**, and the tier-1 `APPROVAL-HASH:` / `REVIEWED-COMMIT:`
   anchors appended to cross-review files. `CLAUDE.md`'s "Artifact convention (for consuming repos)"
   section enumerates the artifacts and now under-describes two of them.
3. **The mandatory trailing `## Verdict` section** on `CROSS-REVIEW-*` files, which is now a parsed
   data contract (`extractFileVerdict`) and not just prose. The `Scope:`-field convention is documented
   there; its new sibling is not.

The SKILL.md files carry all three correctly (`orchestrate-dev/SKILL.md`'s new "POSTMORTEM Lifecycle"
section, `harvest-learnings/SKILL.md`'s Approval Record table and checklist row, the six author/review
SKILLs' `## Verdict` sections). The gap is only in the repo-level manual — but that is the document a
human reads before running anything.

*Recommend:* close before the PR. It is three short paragraphs in an existing file, it costs no rebuild,
and F-1's one line lands in the same edit.

*Falsifier:* `grep -n 'RESOLVED\|forcePhases\|Approval Record' CLAUDE.md` returning hits.

### F-4 — Low — the await scanner's alias resolution is `main()`-only

`buildScanSet` (`__tests__/runtimeBundle.test.js`) grows the thirteen seed names by (i) `main()`'s own
destructured aliases and (ii) a fixed point over whole-body arrow wrappers. It does **not** resolve an
alias introduced in any *other* function's parameter list. A future helper written as
`async function f({ _readFile: read }) { … read(p) … }` would put `read(…)` outside the scan set
entirely, so a missing `await` there is classified by nothing and reported by nothing.

I verified this is latent, not live: every helper in both modules destructures its seams **shorthand**,
so the seed names are the call-site names throughout (§2a). The risk is that the convention is
undocumented — nothing tells the next author that renaming a seam parameter disables the guard for that
function.

*Successor surface (DC-08):* this belongs in `LEARNINGS-pdlc-review-loop-hardening.md` §5 (Open Items
for Consolidation) as a candidate `docs/_constraints/` entry — "seams are destructured shorthand
outside `main()`" — with the scanner extension (walk every function's destructuring pattern, not just
`main`'s) as the alternative. Harvest owns it; no code change is warranted in this feature.

*Falsifier:* a helper in either module whose parameter list contains `_seam: alias`.

### F-5 — Low — dangling `fs` / `await import()` reach the shipped bundles

`stripModuleSyntax` removes `import * as fs from "fs";` but leaves `fs.readFileSync(path, "utf8")` in
`defaultReadFile`, and `{ fsMod = fs }` defaults in `defaultListFiles` / `defaultWriteFile` /
`defaultAppendFile`; `defaultGit`, `mergeWorktree` and `checkPrCi` retain `await import("child_process")`.
Six such sites per bundle. All are parse-safe (§5) and all are unreachable, because every corresponding
seam is injected by the entrypoints.

The reason this is worth naming rather than ignoring: **the injection table is the entire safety net**,
and RLH-32 exists precisely because one entry (`_writeFile`) was missing from it for the whole life of
the previous bundle. The failure mode is a bare `ReferenceError: fs is not defined` mid-phase, not a
halt with a diagnosis. RLH-AT-64 now derives the wired-or-exempt set from `main()`, which closes the
class properly — so this is a note on the residue, not a request to change it.

*Recommend:* no change in this feature. Optionally, a future `stripModuleSyntax` could replace stripped
import bindings with a throwing stub so the failure names itself. Successor surface: the same
`docs/_constraints/` entry as F-4.

*Falsifier:* a runtime code path that reaches any `default*` seam implementation — i.e. an entrypoint
`.main({…})` object that omits a seam `main()` declares, which RLH-AT-64 now reds on.

### F-6 — Low — two `## Verdict` heading predicates for one section

`crossReviewComplete` (`:1244–1254`) locates the section with
`normaliseHeadingTitle(m[1]) === "verdict"`, which accepts `## 5. Verdict`, `## VERDICT`, and extra
internal whitespace. `extractFileVerdict` (`:892–896`) locates the same section with the strict
`/^\s*##\s+Verdict\s*$/`. A cross-review headed `## 6. Verdict` is therefore **structurally complete**
(the episode reaches terminal) but yields `{ok:false, reason:"no_verdict_section"}` on the approval
read, so the phase silently re-runs next invocation.

The direction is safe — more work, never less, per FSPEC §1.2 rule 4 — and every shipped SKILL mandates
the exact `## Verdict` form, so a conforming reviewer never hits it. But the two predicates answer "is
this the verdict section?" differently for the same bytes, which is the shape that rots.

*Recommend:* have `crossReviewComplete` reuse `extractFileVerdict`'s regex, or extract one shared
`isVerdictHeading`. Low cost, no behaviour change on conforming input.

*Falsifier:* a fixture headed `## 6. Verdict` on which `crossReviewComplete` and `extractFileVerdict`
agree.

## 8. Assessed and Cleared

**`refreshReviewState`'s read narrowing — correct, and the narrowing is the point.**
It opens exactly the files of round `window.startIndex - 1`, not every matched basename. Under §5.2's
`startIndex = max(present) + 1`, that candidate **is** the highest round on the branch — precisely the
round `selectMode` rule 2 evaluates for same-round dual approval. So the narrowing costs rule 2 nothing
while holding §5.4's two-`_readFile` fan-out and keeping the approval search from descending to rounds
`RLH-AT-09` / `RLH-AT-57` forbid. `matched` still carries every round for `dispatchAndVerify`'s naming,
derived from the listing at no read cost. Rule 2's `dualApproved` treats a round with no `reviewFiles`
entry as not-approved, so the narrowing can only push an episode *into* revision — the safe direction.
*Falsifier:* a `startIndex` derivation under which the highest present round ≠ `startIndex - 1` and rule
2 consequently reads an absent record for the round it selects.

**`tier2ApprovalRecord`'s near-unreachability — accepted, and honestly documented.**
The code states the reasoning itself: under `startIndex = max(present) + 1`, `candidate` is a round some
role holds, so post-harvest `present` is empty, `candidate` is 0, and §5.4's `candidate < 1` exit fires
before tier 2 is consulted. It survives for a listing that changes under the run. That is a real
scenario (the queue commits `QUEUE.md` mid-run; nothing pins `docs/{feature}/`), the grammar it parses
is the one `harvest-learnings/SKILL.md` now writes, and `__tests__/approvalSearch.test.js` covers it.
Keeping it is right; deleting it would leave the tiers' exclusivity claim untestable. One benign detail:
the section terminator `/^\s*#{1,2}\s/` does not fire on a `###` sub-heading, so a `###` inside the
Approval Record keeps the scan in-section — harmless, because only six-cell table rows are collected.

**Queue halt path double-write — not a defect.** On a halt reached inside `orchestrate-dev` under the
queue, `_recordHalt` writes and commits `halted`, then `runPicked` writes and commits `halted` again.
The second is absorbed by `commitQueueRow`'s `NOTHING_TO_COMMIT_RE` on either stream, so it produces no
extra commit and no warning. Idempotent by construction, as §6.5 intends.

**`VALID_VERDICTS` hoist and the `RLH-AT-64` assertion change** — both previously ruled on; confirmed
consistent with the code as it stands and not re-raised.

**The §16.3 / §5.1 "one verdict" split — verified coherent, not a finding.** The two questions are
answered by two functions and they should differ: `crossReviewComplete` (the *terminal* test) accepts at
least one catalogue `VERDICT:` line after the last `## Verdict` heading, per FSPEC §16.3;
`extractFileVerdict` (the *approval* read) pre-counts and fails closed on more than one, which is what
`se-review/SKILL.md`'s new "a second one is read as fail-closed and your approval will not be honoured"
describes. The SKILL text is therefore accurate. Scoping the duplicate count to the trailing section
rather than the whole file is what lets a cross-review quote the grammar — including this one.

## 9. Documentation Drift for Harvest

Recorded here for `harvest-learnings`, not raised as code findings:

| Drift | Detail |
|---|---|
| TSPEC §5.9:1722 vs FSPEC §16.3:2439 | "exactly one well-formed `VERDICT:` field" vs "at least one … in the catalogue". §16.3 owns the terminal test and governs; the implementation follows it. The TSPEC wording is stale and should be reconciled at consolidation. |
| TSPEC §5.9:1724 vs FSPEC §16.5 | The LEARNINGS criterion, per F-2. If F-2 is closed by amending FSPEC, this row is the record of why. |
| `orchestrate-dev.js` `meta.inputs` | Dead in the shipped artifact (F-1). The module-level `meta` and `DEV_META` are two hand-maintained copies with no consistency check between them — a candidate `docs/_constraints/` entry. |

## 10. Recommendation

The engineering core of this feature is strong and I want to say so plainly: the await-discipline
scanner, the derived wired-or-exempt check, the append-shaped adapter seam, and the closed
`rtListFiles` vocabulary are all better than the defects they were written against. Every high-risk
surface I was pointed at came back clean, including the two that are green-at-L2-and-false-in-production
by construction.

The three Medium findings are all **delivery and documentation**, not logic, and all three are cheap:

1. **F-1 + F-3 are one edit.** Add `inputs` to `DEV_META`, rebuild, and add three paragraphs to
   `CLAUDE.md` (POSTMORTEM `RESOLVED:` lifecycle, `## 6. Approval Record` + tier-1 anchors, the trailing
   `## Verdict` contract) plus one line for the object-arg invocation form. Note there that the queue
   path does not forward `forcePhases`.
2. **F-2 needs a decision, then one edit.** Either add the `Harvested from` predicate to `isComplete`'s
   LEARNINGS arm, or amend FSPEC §16.5 and its §16.5 mapping row to match TSPEC §5.9 and record the
   narrowing. I lean to the second — it is consistent with the approval-record exclusion already argued
   on AC-4.2c grounds — but the choice is the author's, and the mapping row must not be left describing
   an unreachable branch either way.

F-4, F-5 and F-6 need no action in this feature. F-4 and F-5 have a named successor surface (harvest →
`docs/_constraints/`); F-6 is a two-line tidy whenever that file is next touched.

Nothing here blocks Phase DOD on logic. Verdict is `Needs revision` because two Medium findings stand
under the mandatory approval rule, not because the implementation is unsound.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 3, "low": 3}

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

## 4. F-3 — `CLAUDE.md` operator contracts

## 5. Did the Fixes Break or Weaken Anything

## 6. Findings

## 7. Recorded for Harvest (outside the round bound)

## 8. Recommendation

## Verdict

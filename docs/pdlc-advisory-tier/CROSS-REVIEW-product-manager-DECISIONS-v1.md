# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** product lens — traceability to REQ/FSPEC, scope compliance, acceptance-criteria fidelity, and whether each recorded decision rests on a premise that is true against the branch.

## Grounding method

The document opens with a grounding pin and invites verification by symbol name. I took that
invitation literally and re-ran every mechanical claim in it against the working tree, plus the two
upstream documents it derives from. What reproduced exactly:

| Claim in the document | Verified against |
|---|---|
| five `outcome: "halted"` sites in dev, one halt + two `blocked` in queue | `pdlc/workflows/orchestrate-dev.js:7635,7650,7673,7695,8498`; `pdlc/workflows/orchestrate-queue.js:794,847,1012` |
| file sizes 8,642 / 1,587 / 383 lines | `wc -l` on the three files — exact |
| `MODEL_DEFAULT` / `MODEL_IMPLEMENTATION` / `MODEL_QUEUE` are bare aliases | `orchestrate-dev.js:1578`, `:1621`, `orchestrate-queue.js:69` |
| pure-function-plus-injected-seam idiom | `orchestrate-dev.js:101,181,380,708,731,835,1361,6862,6905` — all present at the cited lines |
| `stripModuleSyntax` deletes `import` lines; `wrapModule` publishes an explicit export set | `build-runtime.mjs:44-52`, `:54-65` |
| `devModule` **and** `queueModule` are inlined into **both** bundles; ordering hazard documented | `build-runtime.mjs:281`, `:288`, hazard comment `:285-287` |
| queue prelude `const realMain = __dev.main;` consumed at `queue:764` | `build-runtime.mjs:102`; `orchestrate-queue.js:764` |
| `AWAIT_SCAN_SOURCES` is a hand-written two-element literal | `__tests__/runtimeBundle.test.js:997`, driven at `:1011` |
| `commitPaths` and `gitWithLockRetry` are module-private | `orchestrate-dev.js:6905`, `:6862` — neither carries `export` |
| manifest rows are per **artifact**, three today; a fourth source adds none | `build-runtime.mjs:277-296` — the `bundles` array has exactly three entries |
| Phase H precedes Phase PUB in `main()` | `orchestrate-dev.js:8307` (Phase H), `:8363` (Phase PUB) |
| `MERGE_GUARD_DEFAULTS`, `MERGE_DEFAULTS.mergeMode === "off"`, skipped outcome | `orchestrate-dev.js:47`, `:60`, `:1407` |
| adapter passes `model` through untouched | `runtime-adapter.js:58`, `:61` |
| `advertisedVersionViolation`; plugin at `0.20.2`; fifteen skills | `lib/document-oracles.mjs:575`; `pdlc/.claude-plugin/plugin.json:4`; `ls pdlc/skills` ⇒ 15 |
| all four DEC-ADV-10 baseline checks | `26c3f1c` is an ancestor of HEAD ⇒ true; `4d5e4dc` ("Add Phase PUB…") is an ancestor of `26c3f1c` ⇒ true; `git grep -c raisePrAndVerifyCi 26c3f1c` ⇒ 4, defined at `26c3f1c:pdlc/workflows/orchestrate-dev.js:6222`; 8,527 lines at that pin |
| DC-01/03/04/08, DEC-DIST-01/02 exist as cited | `docs/_constraints/DOMAIN-CONSTRAINTS.md:20,79,122,216`; `docs/_decisions/DECISIONS-plugin-distribution.md:15,38` |

That is an unusually high hit rate and it is the document's chief strength. The findings below are
the residue: three places where a premise is stale against the upstream documents on this branch,
and four smaller precision gaps.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

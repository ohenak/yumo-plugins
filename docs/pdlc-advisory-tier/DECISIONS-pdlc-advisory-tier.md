---
feature: pdlc-advisory-tier
---

# DECISIONS — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-03 |

## Scope, grounding pin, and how to read this document

This document records the **"didn't do, and why"** for pdlc-advisory-tier. The "do" is in
`TSPEC-pdlc-advisory-tier.md` and, later, in code; nothing here restates a design that document
already carries. Each entry exists because a real alternative was weighed and rejected, and a future
agent would otherwise reconsider it confidently and at cost.

**Grounding pin.** Every `file:line` below was read at `feat-pdlc-advisory-tier` HEAD
`22b310e`, where `pdlc/workflows/orchestrate-dev.js` is 8,642 lines,
`pdlc/workflows/orchestrate-queue.js` is 1,587 lines and `pdlc/workflows/build-runtime.mjs` is 383
lines. Verify a citation by **symbol name** (`grep -n`); the line number is a navigation hint against
files that churn. Where an entry claims an alternative is cheaper or more expensive, the claim was
checked against the files that alternative would actually touch, and the check is stated in the
entry — not left as intuition.

**Notation.** `dev` = `pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`,
`build` = `pdlc/workflows/build-runtime.mjs`, `bundleTest` =
`pdlc/workflows/__tests__/runtimeBundle.test.js`. FSPEC rule ids (`M-5`, `X-a`, `R-2`, …) and TSPEC
section numbers are used verbatim.

**Project-level decisions this feature inherits and does not re-litigate:** DEC-DIST-01 (the workflow
runtime's limits are binding), DEC-DIST-02 (tested source → built artifact → untracked consumer copy),
DC-01 (a boundary-crossing contract is closed and total), DC-04 (an oracle is a pure function of an
injected root). Several entries below are direct applications of those; none contradicts one.

## DEC-ADV-01: The advisory core lives in `orchestrate-dev.js`, reached from the queue by prelude binding

**Context.** FSPEC M-5 requires each model rung to be named **once** and referenced from every advisory
dispatch site in *both* pipelines; C-3 requires the config read once per run. Two modules need one
implementation, and the workflow runtime has no `import`: `stripModuleSyntax` deletes every
`import …;` line before bundling (`build:45-52`), and each module is wrapped in an IIFE publishing only
an explicitly listed export set (`wrapModule`, `build:55-66`).

**Decision.** The constants, the pure advisory core and the `runAdvisorySeam` driver live in
`orchestrate-dev.js` and are exported. The queue reaches them as **free identifiers bound by
`queueModule`'s prelude**, extending the shipped `"const realMain = __dev.main;"` line (`build:102`,
consumed as `_runPipeline: runPipelineFn = realMain` at `queue:764`). A1/A2 seam wiring stays in
`orchestrate-queue.js`; A3/A4/A5 wiring stays in `orchestrate-dev.js` (TSPEC §2.2, §2.3).

**Why this is even possible** — the decisive verified fact: **both shipped bundles already inline
`devModule` *and* `queueModule`** (`build:278-290`, and the ordering hazard is already documented at
`build:285-287`: "queueModule's prelude references `__dev.main`, so devModule must precede it"). So
anything `orchestrate-dev.js` exports is reachable from the queue module at runtime with **no new
build source and no change to bundle composition**.

**Alternatives considered.**

- **A fourth build source, `pdlc/workflows/advisory.js` — rejected.** Its claimed cost was checked
  against the files it would touch, not assumed:
  - `build.mjs`: one `readFileSync` (the shipped precedent is `cliSource`, `build:256`), one
    `wrapModule` call with its own export list, **and prelude bindings added to both existing
    `wrapModule` calls** (`build:87-95`, `build:96-103`) because both bundles inline both modules —
    plus an insertion into each bundle's `contents` array (`build:281`, `build:288`) under the stated
    ordering hazard. Roughly a dozen lines, not two.
  - `bundleTest`: `AWAIT_SCAN_SOURCES` is a hand-written literal, `["orchestrate-dev.js",
    "orchestrate-queue.js"]` (`bundleTest:997`). A new source **not** added there escapes the
    await-discipline scan entirely and silently — and the advisory core is precisely the code where a
    missed `await` on an injected seam is dangerous. This is the real cost, and it is a correctness
    cost, not a bookkeeping one.
  - **`distribution-manifest.json` is *not* affected.** Its rows are per **artifact**, not per source
    — three rows today (`orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`), built from the `bundles`
    array at `build:278-297`. A fourth *source* inlined into existing bundles adds no row; it only
    changes their `pluginSha1`, which every source change does. TSPEC §16.1's contrary claim is
    overstated and is routed as an erratum.
  So the honest summary is: the fourth source is **feasible and modest in `build.mjs`**, and its real
  price is the test-coverage seam above plus a second inlining-order constraint. It buys
  `orchestrate-dev.js` staying ~800 lines shorter — a benefit no requirement asks for. Rejected on
  that balance, not on an inflated cost.
- **Duplicating the constants in both modules — rejected.** This is literally what M-5 forbids: two
  copies of `MODEL_ADVISORY` means "one edit changes the rung" is false.
- **Putting the core in `orchestrate-queue.js` instead — rejected.** The reverse binding does not
  exist: `devModule` carries no prelude (`build:87-95` passes no fourth argument to `wrapModule`), and
  the ordering hazard at `build:285-287` runs the other way. Adding a `__queue`-to-`__dev` prelude
  would create a cycle between the two IIFEs.

**Constraints that forced this shape.** The runtime's no-`import`, single-flat-script execution model
(DEC-DIST-01); `wrapModule`'s explicit export set; the existing both-modules-in-both-bundles
composition.

**Reversibility: easy.** Extracting the core to a fourth source later is mechanical — the code is
already a set of pure exported leaves plus one driver, with no `orchestrate-dev.js` internals reached
except through injected seams.

**Re-evaluation triggers.**
1. `orchestrate-dev.js` passing ~10,000 lines, or a second feature wanting the same cross-module
   treatment — at two consumers the fourth source starts paying for itself.
2. `build.mjs` gaining a mechanism that derives `AWAIT_SCAN_SOURCES` (or any per-source test list)
   from the sources it reads, which removes this entry's main objection.
3. Any change that stops inlining `devModule` into the queue bundle — that would delete the mechanism
   this decision rests on and force a re-decision immediately.

## DEC-ADV-02: One `runAdvisorySeam` driver behind an injected `SeamOps`, not five per-seam functions

## DEC-ADV-03: The irreversible act lives in `verifyGate`, so RECORD precedes it

## DEC-ADV-04: The advisory rung is a literal alias with a separate fallback constant, and the fallback is a shipped path

## DEC-ADV-05: Rung resolution is lazy and its memo is a threaded parameter, never module state

## DEC-ADV-06: X-e reuses Phase MERGE's shipped guard matcher; only two new predicates are owned

## DEC-ADV-07: The post-A5 DoD divergence is reported, not re-verified and not halted (OQ-3)

## DEC-ADV-08: A disabled run suppresses the degraded-key notice at the emit, not in the parser

## DEC-ADV-09: The escalation log has no reader inside this tier

## DEC-ADV-10: D-6's expected set is a hand-reviewed fixture captured at `26c3f1c`, not a re-derived value

## Decisions deliberately NOT taken here

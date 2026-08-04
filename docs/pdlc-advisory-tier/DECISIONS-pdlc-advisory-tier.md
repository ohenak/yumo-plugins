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

**Grounding pin.** Every `file:line` below was read at or after `feat-pdlc-advisory-tier` commit
`22b310e` — a **floor**, not a fixed HEAD; the citations were re-confirmed at `4db9b4a`, of which
`22b310e` is an ancestor. At that floor `pdlc/workflows/orchestrate-dev.js` is 8,642 lines,
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

## Context

The context shared by every entry below, stated once so no entry has to restate it.

**What the feature changes.** Today every judgment call in the pipeline is a full stop with no
attempt at resolution (REQ §1). That is not rhetoric — it is countable in the shipped code:
`orchestrate-dev.js` returns `outcome: "halted"` at five distinct sites (`dev:7635`, `dev:7650`,
`dev:7673`, `dev:7695`, `dev:8498`), and `orchestrate-queue.js` adds one halt (`queue:1012`) plus
two pre-`QUEUE.md` `outcome: "blocked"` returns (`queue:794`, `queue:847`). At each of those the
operator arrives at an unexplained stop and reconstructs the situation from scratch. The advisory
tier does not remove a single one of those gates; it inserts a diagnose-and-either-resolve-or-
escalate step *before* the stop, at five named seams (A1…A5), and leaves the gate itself intact.
REQ US-05 is the load-bearing constraint on the whole design: **the tier can never declare a gate
passed.**

**Four properties of the ground the design has to stand on**, each verified rather than assumed,
each responsible for more than one entry below:

1. **The workflow runtime has no `import`.** `stripModuleSyntax` deletes every `import …;` line
   before bundling (`build:45-52`) and `wrapModule` wraps each module in an IIFE publishing only an
   explicitly listed export set (`build:55-66`). Cross-module reuse is therefore a *build*
   question, not a language question — which is what DEC-ADV-01 and DEC-ADV-05 turn on.
2. **Model rungs are bare aliases pinned in code, one per phase class.** `MODEL_DEFAULT = "opus"`
   (`dev:1578`), `MODEL_IMPLEMENTATION = "sonnet"` (`dev:1621`), `MODEL_QUEUE = "sonnet"`
   (`queue:69`). There is no local table mapping an alias to a model and no probe for one; the
   runtime owns resolution. DEC-ADV-04 is the direct consequence.
3. **Config parsing already has a shipped shape, and it is per-key fallback plus a defect list.**
   `parseMergeConfig` (`dev:101`) and `parseImplementationConfig` (`dev:181`) are pure, total, and
   never fail a run on a bad key. `advisory.*` is modelled on them (DEC-ADV-08), which is also why
   REQ AC-1.6's "disabled ⇒ exactly today's behavior" is expressible at all.
4. **Composition in these modules is pure-function-plus-injected-seam, uniformly.** `parseMergeConfig`
   (`dev:101`), `classifyPrState` (`dev:380`), `effectiveGuardPaths` (`dev:708`), `guardVerdict`
   (`dev:731`), `decideMerge` (`dev:835`) are pure; `phaseMerge` (`dev:1361`), `commitPaths`
   (`dev:6905`) and `gitWithLockRetry` (`dev:6862`) take their IO as parameters. There is no class
   hierarchy in either module. DEC-ADV-02 adopts that idiom rather than introducing a second one.

**What makes these decisions worth recording rather than obvious.** Three of the five seams act on
the git tree or the remote, so an ordering mistake is not recoverable by re-running (DEC-ADV-03).
Two FSPEC rules that *look* like they pull against each other on the paths this feature must
implement — A2-6 versus R-2, and C-2 versus D-5/S-4 — are in fact already reconciled by FSPEC itself
(§10.1's preamble at `FSPEC:232-237` and A5-8 at `FSPEC:635`; C-2 at `FSPEC:145`), and the entries
below record the **TSPEC-side expression** of those settled rules rather than a resolution of a live
conflict — a distinction that matters, because a future reader who reads either entry as a deviation
will write a test pinned to a deviation that does not exist (DEC-ADV-03, DEC-ADV-08). And the
feature's central safety claim, D-6, is an equivalence between a disabled run and a pre-feature
run, which is falsifiable only against evidence captured outside the system under test
(DEC-ADV-10). Every entry below exists because a real alternative was weighed, was defensible, and
would be re-proposed by a competent agent who had not seen the reason it lost.

## Decision

**The tier-level decision, stated once.** The advisory tier is built as a **seam layer inside the
two existing workflow modules** — one driver plus five injected `SeamOps`, reached from the phase
bodies that already own each halt — and not as a new skill, a new plugin, or a new build source.
Every entry below is a consequence of that one choice or a resolution of a conflict it exposes.

Two verified facts settle it, and both are about where the halt *lives*. First, each of the five
seams sits at a site that is already inside these modules: A1 at the queue's Phase-0 triage
(`queue:794`, `queue:847` are its sibling pre-gate returns and `queue:1012` its halt), A3 in
`dodVerifyLoop`'s iteration budget (`DOD_MAX_ITERATIONS = 3`, `dev:25`, used at `dev:6275`), A4 in
the Phase DOD rebase, A5 in Phase PUB's CI poll — sites reachable only from module-internal
control flow, not from a skill prompt. Second, a skill is a prompt file loaded by name
(`pdlc/skills/*/SKILL.md`, fifteen today), with no ability to observe a return value, thread a
per-run memo, or refuse an action; the tier's whole point is the envelope and the refusal ladder,
which are code, not prose. Adding a sixteenth skill would move the *analysis* out of the module but
leave the gate, the budget and the record behind — the expensive half stays put.

**The register.** Ten load-bearing decisions, each detailed below with its own alternatives,
constraints and re-evaluation triggers.

| ID | What was decided | Reversibility |
|---|---|---|
| DEC-ADV-01 | The advisory core lives in `orchestrate-dev.js`; the queue reaches it by prelude binding, not a fourth build source | easy |
| DEC-ADV-02 | One `runAdvisorySeam` driver behind an injected `SeamOps`, not five per-seam functions | hard |
| DEC-ADV-03 | The irreversible act lives in `verifyGate`, so RECORD precedes it | hard |
| DEC-ADV-04 | `MODEL_ADVISORY` is a literal alias; `MODEL_ADVISORY_FALLBACK` is a *separate* constant and its path is shipped, not an error path | easy |
| DEC-ADV-05 | Rung resolution is lazy; its memo is a threaded parameter, never module state | easy |
| DEC-ADV-06 | X-e reuses Phase MERGE's `guardVerdict`; only `touchesTestArtifact` and `touchesDodCriterion` are newly owned | easy / hard-in-consequence |
| DEC-ADV-07 | The post-A5 DoD divergence is reported, not re-verified and not halted | easy |
| DEC-ADV-08 | A disabled run suppresses the degraded-key notice at the emit, not in the parser | easy |
| DEC-ADV-09 | The escalation log has no reader inside this tier | easy / hard-in-consequence |
| DEC-ADV-10 | D-6's expected set is a hand-reviewed fixture captured at `26c3f1c`, not a re-derived value | one-way in spirit |

Three of these (02, 03, 06) shape a contract other code is written against, so their reversibility
is "hard" in the sense that unwinding them means rewriting the seams and their suites — not that
they are wrong to revisit. The other seven are single constants, single `if`s, or single fields.

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

**The detector this decision needs, and does not have today.** The load-bearing fact —
`devModule` and `queueModule` are both inlined into both bundles, `devModule` first — is asserted by
**nothing**. `bundleTest` names the bundle files at `bundleTest:23` but never loads, evaluates or
scans one for unresolved free identifiers: there is no `new Function`, no `eval`, and no assertion
that the queue prelude's `__dev.<name>` references resolve against `devModule`'s published export
list (`grep -n realMain pdlc/workflows/__tests__/runtimeBundle.test.js` returns only `:446`, a
`stripModuleSyntax` unit case on an unrelated string). Today's single prelude binding
(`const realMain = __dev.main;`) is a *shipped* binding, so a composition change breaks it at
runtime, in a queue run, in the consumer's untracked copy — and after this feature the prelude
carries the whole advisory core, so the blast radius is the seam layer. The PLAN therefore carries a
bundle-composition assertion in the shape `bundleTest` already uses: for each bundle, **every
`__dev.<name>` referenced by that bundle's prelude appears in that bundle's `devModule` export
list**, and `devModule` precedes `queueModule` in the `contents` array (`build:281`, `build:288`).
Mutation check for whoever writes it: delete `devModule` from the queue bundle's `contents` array and
confirm the test goes **red**. A substring assertion (“the bundle text contains `__dev`”) is not
sufficient — it passes on a bundle where the binding is present and the definition is not.

**Reversibility: easy** — *conditional on that detector existing*. Extracting the core to a fourth
source later is mechanical: the code is already a set of pure exported leaves plus one driver, with
no `orchestrate-dev.js` internals reached except through injected seams. Until the composition
assertion above ships, the premise can be deleted silently, and a decision whose premise can vanish
without a red test is easy to *break*, not easy to reverse.

**Re-evaluation triggers.**
1. `orchestrate-dev.js` passing ~10,000 lines, or a second feature wanting the same cross-module
   treatment — at two consumers the fourth source starts paying for itself.
2. `build.mjs` gaining a mechanism that derives `AWAIT_SCAN_SOURCES` (or any per-source test list)
   from the sources it reads, which removes this entry's main objection.
3. Any change that stops inlining `devModule` into the queue bundle — that would delete the mechanism
   this decision rests on and force a re-decision immediately. **Observable via** the
   bundle-composition assertion above: that test going red *is* this trigger firing. Without it the
   trigger has no detector and the first symptom is an undefined identifier during a queue run.

## DEC-ADV-02: One `runAdvisorySeam` driver behind an injected `SeamOps`, not five per-seam functions

**Context.** Five seams (A1…A5) share one lifecycle — diagnose, validate, gate, act, check, verify,
record — plus one attempt/wall-clock budget, one refusal ladder, one record format and one escalation
format. They differ only in evidence, prompt, what "act" means, and what gate ends them.

**Decision.** One driver, `runAdvisorySeam`, owns the whole lifecycle and knows nothing seam-specific;
everything seam-specific is behind the injected `SeamOps` protocol (TSPEC §4.3, §4.4). This is also
what lets A1/A2's `SeamOps` live in `orchestrate-queue.js` while the driver lives in
`orchestrate-dev.js` (DEC-ADV-01).

**Alternatives considered.**

- **A function per seam — rejected.** It would place the budget arithmetic, the envelope gate, the
  refusal ladder, the record write and the escalation write in five places. FSPEC V-8 ("every
  escalation produces the same observable triple") would then be five things to keep in step instead
  of one structural fact, and the same is true of V-7's three-value disposition set and R-4's
  record-even-on-no-action rule.
- **A shared base with per-seam overrides (template method) — rejected.** These modules are plain ES
  modules with no class hierarchy anywhere: the shipped composition idiom throughout is a pure
  function plus injected function-valued parameters — `parseMergeConfig` (`dev:101`), `decideMerge`
  (`dev:835`), `classifyPrState` (`dev:380`), `phaseMerge`'s injected seams (`dev:1361`). An
  injected record of closures is the same idiom; a class hierarchy would be the only one in the file.
- **Branching on `seam` inside one driver — rejected.** It reintroduces per-seam divergence without
  the type separation, and makes A5's and A2's step re-ordering a driver `if`, which DEC-ADV-03
  deliberately avoids.

**The cost, stated plainly.** The uniform driver forces the `apply` / `verifyGate` split
(DEC-ADV-03), which is less obvious at a reading than an explicit per-seam branch would be. That cost
is accepted because it buys a single place where every FSPEC tier-wide invariant is enforced.

**Constraints that forced this shape.** FSPEC V-7/V-8's tier-wide invariants; DC-01 (a
boundary-crossing contract is closed and total) — `SeamOps` and `AdvisoryDisposition` are exactly such
contracts; the two-module split imposed by DEC-ADV-01.

**Reversibility: hard.** `SeamOps` is the contract every seam, every test double and every unit test
is written against; unwinding it means rewriting all five seams and their suites.

**Re-evaluation triggers.**
1. A sixth seam whose lifecycle genuinely differs at more than `apply`/`verifyGate` — at that point
   the uniform driver is being bent rather than used.
2. Two or more seams needing a driver-level `if (seam === …)`; the first such branch is the signal
   the abstraction stopped paying.

## DEC-ADV-03: The irreversible act lives in `verifyGate`, so RECORD precedes it

**Context.** FSPEC §4.1 numbers the lifecycle 1…7 with RECORD last, while two seams make their action
durable through git — A2 by a commit (A2-6, `FSPEC:454`), A5 by a push — and R-2 requires a failed
record write to **un-take** the action. **FSPEC has already fixed that order, for both seams**: the
§4.1 preamble (`FSPEC:232-237`) states that at A2 and A5 alike "steps 5 and 7 complete **before**
that durable git operation … an A2 re-grounding whose record cannot be written is reverted before it
is committed, and an A5 fix whose record cannot be written is reverted before it is pushed"; A5-8
(`FSPEC:635`) says the same independently ("the produced-change check and the record write both
complete **before** the push"), and R-2 (`FSPEC:690`) carries the matching clause. There is no live
contradiction to resolve. What is *not* settled upstream is how a **uniform** driver expresses that
order without a per-seam branch, given DEC-ADV-02 — and that is what this entry decides.

**Decision.** `SeamOps.apply` is defined as *"do everything up to but not including the irreversible
act"*, and `SeamOps.verifyGate` as *"perform the irreversible act, then run the gate"*. RECORD (step 7)
therefore runs **before** the commit/push at exactly the seams whose act is irreversible (A2, A5), and
a step-7 failure reverts a **working-tree edit only** (TSPEC §4.4, §6.4.1). The driver's step order
stays uniform across all five seams. At the three seams whose act is *not* irreversible (A1, A3, A4)
`verifyGate` runs the gate alone — the split is a partition of one lifecycle, not two lifecycles.
The split is **asserted, not merely documented**: the PLAN carries a test that no `SeamOps.apply`
implementation reaches a git-mutating seam (set-equality over the seams `apply` is passed, per the
`AWAIT_SCAN_SOURCES` scan idiom), because without it R-2's "a step-7 failure reverts a working-tree
edit only" guarantee is a convention that the first seam committing inside `apply` breaks silently.

**Alternatives considered.**

- **A per-seam driver branch — the step numbering taken literally, with A2 and A5 special-cased in
  the driver — rejected.** It reaches the same observable behaviour FSPEC's preamble mandates, by
  restating the rule in two `if (seam === …)` arms instead of one contract, which is exactly the
  divergence DEC-ADV-02 exists to prevent; and it leaves the rule enforceable only by inspection —
  a sixth seam that forgets the arm commits before it records, and nothing structural stops it.
- **Writing the record *before* the action — rejected on a hard fact, not a preference.** The record
  carries the `Disposition` field (TSPEC §9.1's `| Disposition | escalated — budget-exhausted |` row),
  and the disposition is not known until the action's outcome is. A record written first would have to
  be rewritten, which contradicts the append-only rule R-3.
- **Making the record write non-fatal (best-effort, like the escalation log) — rejected.** The
  asymmetry is deliberate and directional: the record is a precondition of an action *surviving*, the
  escalation log is not, because an escalation is the pipeline doing strictly less (TSPEC §4.6,
  §17.2). Downgrading the record would let a resolution exist with no evidence that it happened.

**Verified cost of the chosen shape — and one thing the TSPEC assumes that is not true today.**
A2's `verifyGate` is specified as reusing `commitPaths` "verbatim, including its `gitWithLockRetry`
behaviour" (TSPEC §6.4.1). Both are **module-private** in `orchestrate-dev.js`: `commitPaths` at
`dev:6905` and `gitWithLockRetry` at `dev:6862` carry no `export` keyword, and neither appears in
TSPEC §2.3's proposed prelude/export list. Since A2's `SeamOps` lives in `orchestrate-queue.js`
(DEC-ADV-01), the reuse requires exporting `commitPaths` and adding it to the dev export list and the
queue prelude — a real, small, additive edit that the PLAN must carry. The queue's own
`commitQueueRow` (`queue:1162`) is **not** a substitute: it is a fixed two-invocation add/commit for
one path with no lock retry. This is routed as an erratum against **TSPEC** (the one live upstream
defect this document found); it does not change the decision, only its task list.

**Constraints that forced this shape.** BR-5 (a seam leaves exactly one of two tree states); R-2
(a failed record un-takes the action); R-3 (append-only record); A2-6 / A5-8 (durability of an applied
fix); DC-01.

**Reversibility: hard.** It shapes the `SeamOps` contract itself — every seam implementation and every
driver test encodes this split.

**Re-evaluation triggers.**
1. FSPEC re-stating the step-5/7-before-the-durable-act rule (`FSPEC:232-237`, A5-8, R-2) in some
   other way — the ordering this split expresses would then have moved upstream, and this entry is
   superseded, not silently kept.
2. A future seam whose irreversible act cannot be expressed as "one call at the end of `verifyGate`"
   (e.g. one requiring two commits with a gate between them).

## DEC-ADV-04: The advisory rung is a literal alias with a separate fallback constant, and the fallback is a shipped path

**Context.** REQ BL-01 / FSPEC OQ-1 leave the literal advisory model alias to engineering. Two facts
bound it, both verified: every rung this repo pins today is a **bare alias** — `MODEL_DEFAULT = "opus"`
(`dev:1578`), `MODEL_IMPLEMENTATION = "sonnet"` (`dev:1621`), `MODEL_QUEUE = "sonnet"` (`queue:69`) —
and the adapter passes it straight through untouched (`const { model, … } = opts`,
`...(model ? { model } : {})`, `runtime-adapter.js:58-61`). The alias table is owned by the workflow
runtime, not by this repo, and **there is no local probe for it**.

**Decision.** `MODEL_ADVISORY = "fable"`, with `MODEL_ADVISORY_FALLBACK = "opus"` as a **separate
constant whose literal merely happens to equal `MODEL_DEFAULT`'s**. Non-resolution is detected by
classifying the rejection of the *real* first dispatch (`isModelResolutionError`, TSPEC §3.4), never by
a probe dispatch, and the fallback path is treated as a **shipped, tested path — not an error path**
(TSPEC §3.3).

**Alternatives considered.**

- **Alias the fallback to `MODEL_DEFAULT` — rejected.** AC-1.3 requires the advisory rung to be
  "always distinguishable" from the pipeline default. Aliasing makes that claim depend on an accident:
  a future change repointing `MODEL_DEFAULT` would silently move the declared substitution to a
  different rung, and no test would notice, because the two would still be equal.
- **Pin `MODEL_ADVISORY = "opus"` and skip the fallback machinery entirely — rejected.** It makes the
  advisory tier indistinguishable from every other phase, which defeats M-2's declaration requirement
  and AC-1.3; and the fallback machinery is needed anyway for the case where a *future* rung name is
  pinned.
- **A dedicated pre-flight probe dispatch to test the alias — rejected.** It costs a dispatch on every
  run that fires a seam, and it cannot be made to mean what M-1 means: M-1 defines non-resolution as
  "the runtime rejected the dispatch with a model/alias error **before** the agent produced any
  output", which is a property of the real dispatch. Classifying the real rejection is both cheaper
  and strictly more faithful.
- **Resolve the alias from a config key — rejected.** C-4 forbids agent-writable model selection, and
  a per-repo rung would make M-5's "one edit changes the rung" false across repos.

**Constraints that forced this shape.** BL-01 is **unresolvable from this repo** — the alias table is
runtime-side. The design's response is to make either outcome correct rather than to guess: the tier
ships working whichever branch fires, which is what "non-fatal by construction" means. The PLAN carries
a one-line manual verification (dispatch one trivial advisory agent on `"fable"` in a real runtime and
record which branch fired); it is a **record**, not a gate.

**Reversibility: easy.** One constant, referenced once (M-5).

**Re-evaluation triggers.**
1. The manual verification recording that `"fable"` does not resolve — then the alias is a known-dead
   literal kept only for the day the runtime learns it, and that trade should be re-argued.
2. The runtime gaining a queryable alias table, which would make a cheap real probe possible.
3. `MODEL_DEFAULT` changing — the separate-constant rationale becomes load-bearing at that moment.

## DEC-ADV-05: Rung resolution is lazy and its memo is a threaded parameter, never module state

**Context.** M-4 requires the rung to be decided **once per run**; D-2 requires a **disabled** run to
attempt no model resolution at all. Both need a memo. The obvious home for a per-run memo is a
module-level `let`.

**Decision.** Resolution happens at the **first advisory dispatch of a run** (not at start-up), and the
memo `_state` is a parameter threaded from `main()` into `resolveAdvisoryRung` (TSPEC §3.4, §3.5).

**Alternatives considered.**

- **A module-level `let resolvedRung` — rejected on a verified bundling fact.** `devModule` is inlined
  into **both** shipped bundles (`build:281`, `build:288`), and under jest every test imports one
  module instance. A module-level memo would therefore leak resolution (a) across tests in a file, and
  (b) across a queue invocation and the `orchestrate-dev` run it delegates to via `realMain`
  (`build:102`, `queue:764`) — the two would share one memo inside a single process. Threading it also
  makes M-4 *directly* assertable: pass one `_state` through two seams, assert one classification.
- **Eager resolution at pipeline start — rejected.** It contradicts D-2: a disabled run must resolve
  nothing, and the stronger form of the same property is that even an **enabled** run in which no seam
  fires resolves nothing (T-01-7). Laziness gives both from one mechanism; an eager resolve would need
  its own `enabled` check, adding a second `enabled` test on the dispatch path and weakening the
  single-early-return structure that makes D-1/D-2 grep-checkable (TSPEC §11.1).
- **A resolution cache keyed by run id — rejected as unnecessary machinery**: there is exactly one run
  per process, so the parameter *is* the key.

**Constraints that forced this shape.** The both-modules-in-both-bundles composition; jest's
single-module-instance semantics; D-1/D-2's "a disabled tier is a no-op" equivalence claim; DC-04's
preference for state passed in over ambient state.

**Reversibility: easy.** The memo is one parameter with a default.

**Re-evaluation triggers.** A runtime that hosts more than one pipeline run per process (the memo would
then need explicit scoping rather than implicit per-call threading), or a change that stops inlining
`devModule` into the queue bundle.

## DEC-ADV-06: X-e reuses Phase MERGE's shipped guard matcher; only two new predicates are owned

**Context.** Envelope exclusion X-e refuses any advisory change touching a self-modification guard
path. Phase MERGE already refuses to merge a PR touching the same paths, so the repo has two consumers
of one concept.

**Decision.** X-e calls `guardVerdict(changed, ctx.guardPaths)` (`dev:731`) with
`ctx.guardPaths = effectiveGuardPaths(mergeConfig.guardPaths)` (`dev:708`), **verbatim**, passing a
synthesised `{ ok: true, files }` observation. The tier owns only the two predicates with no shipped
precedent: `touchesTestArtifact` (X-a) and `touchesDodCriterion` (X-b) (TSPEC §5.1 row 3, §5.2).

**Why reuse, verified rather than assumed.** `guardVerdict`'s documented and implemented semantics are
exactly what X-e needs and are non-obvious in four independent ways (`dev:716-737`): matching is
`String.prototype.startsWith`, case-sensitive, position-0 anchored, `/`-delimited (every guard path is
normalised to a trailing `/` by `effectiveGuardPaths`, `dev:710-713`), with **no globbing, regex or
substring search**; and anything that is not exactly `{ ok: true, … }` fails **closed** as
`kind: "unretrievable"` (`dev:732-734`). The default set is the frozen `MERGE_GUARD_DEFAULTS`
(`dev:47-52`) plus additive config.

**Alternatives considered.**

- **A purpose-built X-e matcher — rejected.** A second implementation would eventually disagree with
  the first on a path like `pdlc/workflowsX/` (which the anchored, `/`-delimited rule excludes but a
  naive `startsWith("pdlc/workflows")` includes), or on the fail-closed branch. Two matchers for one
  concept means the advisory tier could permit a change Phase MERGE would then refuse to merge — the
  pipeline contradicting itself, discovered at the last phase.
- **Reusing the whole Phase MERGE guard *step* rather than the pure predicate — rejected.** That step
  is built around O5's `gh`-derived changed-file observation; the advisory tier's file list comes from
  `git diff --name-only` inside a seam. Taking the pure predicate and synthesising the observation
  shape gets the semantics without inheriting the transport.
- **Reusing something for X-a / X-b too — rejected after looking.** No shipped predicate matches a test
  artifact by path *or* by operation, and none matches a DoD criterion; X-a in particular must catch
  operations a path test cannot see (lowering a coverage threshold in `package.json`, adding a
  skip/xfail marker), per AC-3.5. These are genuinely new and are therefore owned, tested per
  enumerated operation, rather than approximated by a reused matcher.

**Constraints that forced this shape.** The se-author cite-and-reuse rule for cross-cutting
obligations; the fact that a guard disagreement between two phases is silent until it bites.

**Reversibility: easy** for the reuse direction (a wrapper could be introduced), **hard** in the sense
that diverging later re-opens the disagreement this entry exists to prevent.

**Re-evaluation triggers.**
1. X-e needing semantics Phase MERGE's guard does not have (globs, per-seam guard sets) — at that
   point extend `guardVerdict` for **both** consumers, never fork it.
2. `MERGE_GUARD_DEFAULTS` gaining a path that should not bind advisory changes, which would be the
   first real evidence the two concepts are not one.

## DEC-ADV-07: The post-A5 DoD divergence is reported, not re-verified and not halted (OQ-3)

**Context.** A5 fixes red CI in Phase PUB by pushing a commit. That moves the branch head **past** the
commit Phase DOD verified, so the run ends with a head no DoD gate has seen. FSPEC A5-7 leaves the
restoration path to engineering (OQ-3).

**Decision.** **Report-only.** The final report names the DoD-verified commit (`git rev-parse HEAD` at
the moment `dodResult.passed` becomes true) and marks any branch head beyond it `unverified`;
`buildFinalReport` (`dev:8595`) gains `dodVerifiedCommit` and a derived `dodHeadUnverified`. Phase PUB
neither re-runs the DoD gate nor halts on the divergence (TSPEC §8.4).

**Alternatives considered.**

- **Re-verify DoD inside Phase PUB — rejected on a verified phase-ordering fact.** Phase H runs
  **before** Phase PUB in `main()`: harvest is at `dev:8307-8360`, Phase PUB at `dev:8363` onward. Harvest
  deletes the `CODE_REVIEW-*` files that `dodVerifyLoop` writes and reads (`dev:6298`). A DoD re-run in
  PUB would therefore author a fresh `CODE_REVIEW-{feature}-v1` **after** the harvest that was supposed
  to consume it — an un-harvestable artifact and a `LEARNINGS` file that no longer describes the
  branch. It would also nest an evaluator→optimizer loop with its own `DOD_MAX_ITERATIONS = 3` budget
  (`dev:25`, `dev:6275`) inside a phase already bounded by a CI clock.
- **Halt on the divergence — rejected.** It negates A5 entirely: *every* successful A5 resolution would
  end in a halt, so the seam could never produce the outcome it exists for (US-01). A feature whose
  success path always ends in failure is not a feature.
- **Re-order the pipeline so Phase H follows Phase PUB — rejected as out of scope.** It is the change
  that would make re-verification cheap, and it is exactly this entry's re-evaluation trigger; but it
  re-times harvest for every run, including runs with no advisory tier at all, which is far more than
  this feature is entitled to change.
- **Force-push or amend so the verified commit stays the head — rejected.** It rewrites history on a
  branch with an open PR, and BR-5's two-tree-states invariant does not sanction it.

**Constraints that forced this shape.** B-15's phase order (harvest before PUB), verified above; the
CI clock bounding Phase PUB; AC-8.3's wording, which report-only satisfies exactly ("the report's DoD
status names the verified commit, and a branch head beyond it is reported unverified"); and the fact
that only an operator can weigh whether a lint fix warrants a fresh DoD pass.

**Reversibility: easy.** Report-only is a strict subset of either rejected alternative — the report
field remains correct if re-verification is added later.

**Re-evaluation triggers.**
1. Phase H moving after Phase PUB — re-verification becomes cheap and the first alternative should win.
2. A5 being permitted a class of fix large enough that "unverified head" stops being a formality.
3. Phase MERGE ever gaining a precondition on `dodVerifiedCommit` — today it reads neither field and
   applies its own preconditions to whatever head it finds (H-2).

## DEC-ADV-08: A disabled run suppresses the degraded-key notice at the emit, not in the parser

**Context.** FSPEC C-2 says a malformed config key falls back alone **and the substitution is reported**
on the run report. FSPEC D-5 / S-4 / T-10-4 say a **disabled** run carries **no** advisory content on
the report. A malformed `advisory.enabled` satisfies both antecedents at once: it degrades to
`enabled: false`, which is a disabled run that owes a report line it may not print. FSPEC never
reconciles the two.

**Decision.** `parseAdvisoryConfig` stays pure, total and uniform — it records **every** degraded key in
`invalidKeys` regardless of the effective `enabled` — and the suppression happens at the **caller's
emit**: the notice is printed only when `advisory.config.enabled` is true (TSPEC §3.2). The conflict is
routed upstream as an erratum against FSPEC; this is the TSPEC-side resolution that unblocks
implementation either way.

**Alternatives considered.**

- **Suppress inside the parser (return an empty `invalidKeys` when disabled) — rejected.** It makes the
  parser's contract conditional on one of its own outputs, so `invalidKeys` would mean different things
  in different runs and every unit test over it would need the `enabled` case duplicated. The parser is
  modelled on `parseImplementationConfig` (`dev:181`), whose value is precisely that its
  per-key-fallback-plus-`invalidKeys` contract is unconditional.
- **Report the degraded key anyway and let D-5 lose — rejected.** D-6's equivalence claim (a disabled
  run is byte-for-byte the pre-feature run) is the feature's central safety property; a report line is
  a cheap thing to give up, and an equivalence claim with an exception is not an equivalence claim.
- **Fail the run on a malformed `enabled` — rejected.** C-1 is explicit that no config defect may fail
  a run, and failing closed here would make the tier *more* dangerous disabled than enabled.
- **Emit the notice only for keys other than `enabled` — rejected.** It splits the rule by key name,
  which is a special case with no principle behind it; the effective-`enabled` test is one condition
  and covers every key.

**Constraints that forced this shape.** C-1 (a config defect never fails a run); D-5/S-4/T-10-4; D-6's
byte-equivalence claim; DC-01 (a closed, total contract for `parseAdvisoryConfig`).

**Reversibility: easy.** One `if` at one call site; the parser is untouched either way — which is the
point of putting the choice there.

**Re-evaluation triggers.** FSPEC resolving the C-2 / D-5 conflict differently via the erratum channel;
or a decision to give disabled runs a diagnostic channel that is not the run report (a log line, say),
which would let both rules hold literally.

## DEC-ADV-09: The escalation log has no reader inside this tier

**Context.** `docs/_queue/ESCALATIONS.md` is a new append-only artifact. The tempting next step is to
read it back — to avoid re-escalating something a previous run already escalated, or to let a seam see
its own history.

**Decision.** **Nothing in the advisory tier ever reads it.** It is written by `appendEscalationEntry`
through `_appendFile` (`dev:6805`) and consumed only downstream, by a human operator or by
`pdlc-engineering-loop`. No seam consults its own or another seam's prior escalations; every invocation
decides from live evidence alone (TSPEC §17.2, §10.1).

**Alternatives considered.**

- **Deduplicate escalations by reading prior entries — rejected.** It converts a log into state. Two
  contracts then become code that can be wrong rather than facts that cannot: L-1 / T-09-2 ("append-only,
  newest-last; the first entry is unmodified") is guaranteed **by the absence of a reader** — there is
  no code path that opens the file for anything but append — and T-09-8's asymmetry (a failed log write
  is downgraded to a report notice while the `escalated` disposition stands) is only safe **because**
  a failed write can never feed back into a decision. With a reader, a partially-written or unreadable
  log becomes an input to a decision, and a write failure becomes consequential.
- **Suppress a repeat escalation using in-memory state — rejected as unnecessary.** F-3 already bounds
  invocations to one per seam condition per run, so within a run there is nothing to deduplicate; across
  runs, a repeat escalation is *information* (the condition persisted), not noise.
- **Make the log machine-parsed with a strict schema so it can be read later — rejected for now.** The
  entry format is stable and documented (TSPEC §10.1), so a future reader is not blocked; committing to
  a parse contract today would add a data contract with no consumer, which DC-08 treats as the wrong
  shape for deferred work — the named successor surface is `pdlc-engineering-loop`.

**Constraints that forced this shape.** L-1's immutability requirement; T-09-8's deliberate asymmetry
between the record (a precondition of an action surviving) and the log (not one); the fact that an
escalation is the pipeline doing strictly less, so a log failure must never upgrade it.

**Reversibility: easy** to add a reader mechanically, **hard** in consequence — the moment one exists,
L-1 and T-09-8 stop being structural and must be re-argued as behaviour.

**Re-evaluation triggers.** `pdlc-engineering-loop` (or any consumer) needing the tier itself to react
to escalation history; or operator evidence that repeat escalations across runs are actually noise
rather than signal.

## DEC-ADV-10: D-6's expected set is a hand-reviewed fixture captured at `26c3f1c`, not a re-derived value

**Context.** D-6 is the feature's central safety claim: a run with the tier disabled creates exactly the
files a pre-feature run creates. A comparison whose expected value is produced by the system under test
cannot fail, so the expected set must come from outside that system.

**Decision.** A checked-in fixture, `pdlc/workflows/__tests__/fixtures/created-files-26c3f1c.json`,
produced once by instrumenting the `_writeFile` / `_appendFile` / `_git` seams of a run at REQ's
behavioral pin `26c3f1c`, **hand-reviewed into the repo**, and compared by value. Its header records
provenance — the commit sha, the command, the date — so a later reader regenerates it deliberately
rather than refreshing it reflexively (TSPEC §11.2).

**Why `26c3f1c` is the right pin, verified.** It is an **ancestor of the branch HEAD**
(`git merge-base --is-ancestor 26c3f1c HEAD` ⇒ true) and it already carries every file-creating
pipeline path a disabled run at HEAD exercises — Phase PUB included: `4d5e4dc` ("Add Phase PUB…") is an
ancestor of it (`git merge-base --is-ancestor 4d5e4dc 26c3f1c` ⇒ true) and `raisePrAndVerifyCi` is
defined at `26c3f1c:6222` (`git grep -c raisePrAndVerifyCi 26c3f1c -- pdlc/workflows/orchestrate-dev.js`
⇒ 4). So a set captured there is a faithful pre-feature baseline, and the comparison isolates exactly
the additivity D-6 asserts. (`orchestrate-dev.js` is 8,527 lines at `26c3f1c` and 8,642 at HEAD; the
delta is this feature's own docs-and-spec churn, not pipeline behavior.)

**Alternatives considered.**

- **Compute the expected set by running the pipeline with the feature code absent — rejected.** That is
  the tautology D-6 exists to forbid: the expected value would be produced by the same code under the
  same doubles as the observed value, and any shared defect cancels out.
- **Assert only a *subset* relation (no new files) — rejected.** It is one-sided: it would pass a build
  where the disabled tier suppressed a file the baseline creates. D-6 is an equality claim in both
  directions, so the oracle must be too.
- **Regenerate the fixture on each run and diff against the previous — rejected.** It makes the oracle
  self-refreshing, so a real regression is "fixed" by the next regeneration; and it reintroduces the
  system under test as the source of truth.
- **Pin the fixture at the branch HEAD instead — rejected.** HEAD already contains this feature's
  branch; a baseline captured there is not a *pre-feature* baseline. The distinction between REQ's
  behavioral pin (`26c3f1c`) and TSPEC's citation pin (branch HEAD) is deliberate, and D-6 belongs to
  the behavioral one.

**Constraints that forced this shape.** DC-03 (a load-bearing assertion is falsified before it is
trusted); DC-04 (an oracle is a pure function of an injected root — the fixture is that root's expected
image); D-6's own wording, which fixes the baseline commit.

**Reversibility: easy** mechanically (regenerate at a new pin), **one-way in spirit**: once the fixture
is refreshed against a tree that contains the feature, the property it protects is gone and cannot be
recovered from the repo alone. Regeneration is therefore a reviewed act with a recorded reason, never
a routine one.

**Re-evaluation triggers.** A change to a **pre-feature** file-creating path (a new pipeline artifact
unrelated to this feature) — then the fixture must be re-pinned at the commit that introduced it, with
the provenance header updated and the reason stated in the commit that changes it.

## Options Considered

Each entry above carries its own alternatives. This section holds the options weighed at the
**tier level** — shapes for the whole feature that no single entry owns, and that a future agent is
most likely to re-propose because they sound cheaper than they are. Every cost claim below was
checked against the files the option would actually touch.

- **A sixteenth skill, `pdlc:advise`, dispatched at each halt — rejected.** Cheap where it is
  visible, expensive where it is not. A skill is a prompt file under `pdlc/skills/*/SKILL.md`
  (fifteen today); adding one costs a directory and a `SKILL.md`. But the seam's obligations are
  not prompt-shaped: the envelope exclusions are predicates over a changed-file list, X-e is a
  verbatim reuse of `guardVerdict` (`dev:731`) which no prompt can call, the attempt/wall-clock
  budget is arithmetic the caller must own, and the record write is a precondition of the action
  surviving (DEC-ADV-03). Those all stay in the module regardless. The skill would carry only the
  analysis text — which is what the advisory *dispatch* already is. Net effect: one more file to
  keep in step, no obligation removed.
- **A separate plugin under a new top-level directory — rejected as strictly worse than the
  skill option.** It inherits every objection above and adds a second `.claude-plugin/plugin.json`
  version to bump, its own `hooks.json`, and a second row class in the distribution manifest.
  Meanwhile the seams still live in `pdlc/workflows/`, so the plugin boundary would run straight
  through the middle of the feature.
- **Implement the tier in the `pdlc-cli` bundle instead of the workflow bundles — rejected on a
  verified reachability fact.** `pdlc-cli.mjs` is a real third artifact (`build:289-295`), so the
  option is not imaginary; but it reaches `orchestrate-dev.js` through an explicit eleven-name
  allow-list, `CLI_DEV_EXPORTS` (`build:243-254`), and it runs **out of band** as a Node CLI, not
  inside a pipeline run. A seam has to fire *during* Phase DOD or Phase PUB, with the run's
  `_state`, its config and its seams in hand. The CLI has none of those, and giving it them means
  re-entering the pipeline — which is the thing it exists not to do.
- **Widen the authority of the agents already dispatched (let `se-implement` fix red CI, let
  `dod-verify` clear its own findings) — rejected on REQ US-05.** This is the naive fix REQ §1
  names explicitly: the model would be deciding the very gates that exist to catch it. The design's
  whole structure — a separate rung, a declared envelope, a refusal ladder, a record — exists to
  keep *diagnosis* and *authorization* apart. Reusing the existing agents merges them again and
  deletes the feature's reason to exist.
- **Prompt the operator for approval at each seam instead of shipping an envelope — rejected on
  US-01.** The seams fire in `orchestrate-queue` runs driven by `/loop`, which are unattended by
  construction; a run that blocks on a prompt is a halt with extra steps. The envelope is what
  makes unattended resolution safe, and US-02 covers the case where a human is genuinely needed —
  an escalation with the analysis already done, not a modal question.
- **Ship one seam first (A5 only) and add the rest later — rejected as sequencing, not
  architecture, and rejected anyway on the shared cost.** The driver, `SeamOps`, the envelope, the
  budget, the record and the escalation log are built once and are ~all of the work (DEC-ADV-02);
  a single seam pays that whole cost for one fifth of the value, and the four deferred seams would
  each need their own re-entry into a design already frozen around one caller. Batch ordering
  within the PLAN remains free to land them in any order — see the table below.
- **Make `advisory.enabled` default to true — rejected.** Shipping off is what makes D-6 (a
  disabled run is byte-for-byte a pre-feature run) the *default* experience for every consuming
  repo rather than an opt-out, and it matches the shipped precedent for a phase that acts on the
  remote: `mergeMode` ships `off` in `MERGE_DEFAULTS` (`dev:60`) and Phase MERGE returns a skipped
  outcome on it (`dev:1407`) until an operator opts in per repo.

## Decisions deliberately NOT taken here

Four things a reader may expect to find in this document, and where they actually live. Recording them
here stops a future agent from concluding the question was overlooked.

| Question | Why it is not a decision | Where it is settled |
|---|---|---|
| Whether a consuming repo can read the default branch's check history (BL-05) or re-run a workflow run (BL-06) | A per-repo **runtime fact**, not a choice this design gets to make. The design's obligation is to make the absence a first-class, tested outcome rather than an assumption | TSPEC §1.3, §8.3 — two capability probes through the existing `_ghRun` seam (`dev:581`), each with a defined degradation |
| Whether the runtime resolves the bare alias `"fable"` | Same class of fact, and unresolvable from this repo at all — the alias table is runtime-side | DEC-ADV-04; the PLAN's one-line manual verification records which branch fired |
| Code order — which constant, function and wiring edit lands in which batch | Sequencing, not architecture; deciding it here would duplicate the PLAN and go stale the first time a batch is split | FSPEC §1 item 6 → PLAN |
| Whether Phase MERGE should tolerate the extra post-PUB commit an advisory run produces | A Phase MERGE policy question, owned by that feature's decision record; this tier only makes the deferral **visible** on the report, never silent | TSPEC §15 R-7; Phase MERGE's own preconditions (`dev:1361`) are unchanged by this feature |

**Two upstream defects are recorded but not decided here.** The A2-6 / R-2 ordering gap and the
C-2 / D-5 conflict are FSPEC defects; DEC-ADV-03 and DEC-ADV-08 record the TSPEC-side resolutions that
unblock implementation, and the defects themselves are routed through the erratum channel to FSPEC's
author. If FSPEC resolves either differently, the corresponding entry above is **superseded by a new
entry**, not edited into agreement.

## Consequences

What these ten decisions oblige the implementation — and every later change to it — to keep doing.
These outlive the entries that produced them, so they are stated here rather than buried in one.

**Structural consequences.**

| Consequence | Follows from | Verified anchor |
|---|---|---|
| `orchestrate-dev.js` (8,642 lines) absorbs the constants, the pure core and `runAdvisorySeam`, and its published export set grows | DEC-ADV-01 | `wrapModule`'s export list is explicit and per-call (`build:55-65`, `build:87-93`) |
| `orchestrate-queue.js`'s prelude grows past the shipped `"const realMain = __dev.main;"` line | DEC-ADV-01 | `build:102`, consumed at `queue:764` |
| Both shipped bundles' bytes change; **the manifest stays at three rows** | DEC-ADV-01 | rows are per artifact from the `bundles` array (`build:278-296`) — `orchestrate-queue.bundle.js`, `orchestrate-dev.bundle.js`, `pdlc-cli.mjs` |
| `commitPaths` (`dev:6905`) must gain `export` and enter the dev export list and queue prelude | DEC-ADV-03 | it is module-private today; routed as a TSPEC erratum |
| One new tracked test fixture, hand-reviewed, with a provenance header | DEC-ADV-10 | `pdlc/workflows/__tests__/fixtures/created-files-26c3f1c.json` |
| No new build source, no new plugin, no new skill directory | Options Considered | fifteen skills under `pdlc/skills/`, three bundles at `build:278-296` |

**Standing obligations on anyone who touches this code later.**

1. **Every injected IO call in the advisory core must be `await`ed.** The await-discipline scan runs
   over a hand-written source list, `AWAIT_SCAN_SOURCES = ["orchestrate-dev.js",
   "orchestrate-queue.js"]` (`bundleTest:997`, driven at `bundleTest:1011`). Keeping the core inside
   those two files is precisely what keeps it in scope (DEC-ADV-01); moving it out silently removes
   the check.
2. **Any commit that changes `pdlc/workflows/dist/` must bump the plugin version.** The oracle is
   `advertisedVersionViolation` (`pdlc/workflows/lib/document-oracles.mjs:575`), and the manifest
   stamps the version those bytes were built at; `pdlc/.claude-plugin/plugin.json` is at `0.20.2`
   today. Every wave of this feature that rebuilds the bundles inherits that rule.
3. **The disabled-run equivalence is a permanent test obligation, not a one-off.** Because the
   fixture is pinned at `26c3f1c` (DEC-ADV-10), any *future* change that adds a pre-feature
   file-creating path forces a deliberate re-pin with a stated reason — a refresh without one
   silently destroys the property D-6 asserts.
4. **The escalation log stays writer-only.** L-1's immutability and T-09-8's downgrade-a-failed-log
   asymmetry are guaranteed by the absence of a reader (DEC-ADV-09); the first `readFile` against
   `docs/_queue/ESCALATIONS.md` converts both from structural facts into behaviour that can be
   wrong.
5. **X-e and Phase MERGE share one matcher, permanently.** If X-e ever needs semantics
   `guardVerdict` (`dev:731`) lacks, extend it for **both** consumers — a fork re-opens the
   possibility of the advisory tier permitting a change Phase MERGE then refuses to merge
   (DEC-ADV-06).

**Costs accepted, stated plainly.** The uniform driver makes the `apply` / `verifyGate` split less
obvious at a reading than a per-seam branch would be (DEC-ADV-02, DEC-ADV-03). The advisory rung's
literal is unverifiable from this repo, so one PLAN task is a *recorded manual observation* rather
than a gate (DEC-ADV-04). A successful A5 leaves the branch head past the DoD-verified commit, and
the design's answer is a report field, not a re-verification (DEC-ADV-07). Each is a shared
decision with a named re-evaluation trigger above, not an oversight.

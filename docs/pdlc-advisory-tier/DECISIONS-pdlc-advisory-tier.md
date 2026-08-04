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

**Context.** FSPEC §4.1 numbers the lifecycle 1…7 with RECORD last, but two of its own rules pull the
other way: A2-6 requires an applied re-grounding to be **committed** before the invocation ends, and
R-2 requires a failed record write to **un-take** the action. Read literally, a failed record write
after an A2 commit demands undoing a commit — which BR-5's two-tree-states invariant does not
sanction. A5 has the same shape with a push instead of a commit.

**Decision.** `SeamOps.apply` is defined as *"do everything up to but not including the irreversible
act"*, and `SeamOps.verifyGate` as *"perform the irreversible act, then run the gate"*. RECORD (step 7)
therefore runs **before** the commit/push at exactly the seams whose act is irreversible (A2, A5), and
a step-7 failure reverts a **working-tree edit only** (TSPEC §4.4, §6.4.1). The driver's step order
stays uniform across all five seams.

**Alternatives considered.**

- **The literal FSPEC §4.1 order with an A5 special case in the driver — rejected.** It leaves A2's
  commit/record ordering undefined (the same defect, unfixed), reintroduces the per-seam branch
  DEC-ADV-02 exists to avoid, and eventually forces a `git reset` of a landed commit to satisfy R-2.
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
one path with no lock retry. This is routed as an erratum against TSPEC; it does not change the
decision, only its task list.

**Constraints that forced this shape.** BR-5 (a seam leaves exactly one of two tree states); R-2
(a failed record un-takes the action); R-3 (append-only record); A2-6 / A5-8 (durability of an applied
fix); DC-01.

**Reversibility: hard.** It shapes the `SeamOps` contract itself — every seam implementation and every
driver test encodes this split.

**Re-evaluation triggers.**
1. FSPEC reconciling A2-6 and R-2 explicitly in some other way — the erratum may land a different
   resolution, in which case this entry is superseded, not silently kept.
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

## Decisions deliberately NOT taken here

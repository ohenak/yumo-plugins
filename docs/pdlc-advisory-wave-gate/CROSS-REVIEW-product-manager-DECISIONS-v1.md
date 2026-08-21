# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.10)
**Date:** 2026-08-20
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Cross-Feature | Context's first constraint — the one the document says shaped all four decisions — is grounded on an artifact that no longer exists and a delivery step that is not in the repo | REQ O-1; Context constraint 1 (frames DEC-A6-01…04) |
| F-02 | Medium | Local | `DEC-A6-02`'s decision sentence and its Consequences bullet are singular ("one additional `commitPaths` call", "the promotion commit"); the shape is one call **per promoted task** | FSPEC BR-8; TSPEC O-8 |
| F-03 | Medium | Local | Context's "No new transport" constraint cites NFR-3, which states something else (credentials and network surface, not the injected-IO set) | REQ NFR-3 |
| F-04 | Low | Local | The `Cross-Reviews` provenance cell enumerates rounds v1–v9; rounds v10 and v11 also ran | Header provenance |

### F-01 (High, Cross-Feature) — the "One module, one bundle" constraint is false at HEAD

Context states:

> **One module, one bundle.** The workflow runtime loads a single built artifact per workflow —
> `orchestrate-dev.bundle.js`, produced by inlining `pdlc/workflows/orchestrate-dev.js`
> (`build-runtime.mjs` reads that one file as `devSource`) and delivered to a consumer's
> `.claude/workflows/` by the maintainer sync step […]

Three of those clauses are falsified by the tree:

1. **No such artifact is produced.** `build-runtime.mjs`'s own header records that the per-module
   runtime bundles — "three per-module runtime artifacts, one apiece for `orchestrate-dev.js`,
   `orchestrate-queue.js`, `consolidate-learnings.js`" — were "retired along with the Claude Code
   workflow runtime", and that the runtime that executes the pipeline "lives in the published
   `@kaneho/pdlc-engine` package". The builder "now emits one artifact: `pdlc-cli.mjs`". Its
   `bundles` array carries exactly that one entry, and `ls pdlc/workflows/dist/` returns exactly
   `pdlc-cli.mjs`.
2. **No maintainer sync step exists.** `pdlc/hooks/scripts/` contains no `sync-workflows.sh`; the
   only surviving mention of the step is the stale comment `build-runtime.mjs:25`, which the
   document quotes as if it were evidence of a live channel. The live references to
   `orchestrate-dev.bundle.js` in the workflows tree are **deletion allowlists** —
   `pdlc/hooks/scripts/cleanup-consumer-workflows.sh:26` and
   `pdlc/workflows/__tests__/consumerCleanup.test.js:61` name it as an entry to remove from a
   consumer's `.claude/workflows/` — plus a retired-artifact note at
   `pdlc/workflows/__tests__/documentOracles.test.js:203` ("the `.claude/workflows/` copy of the
   retired per-module bundle artifact: that tree is no longer a generated-tree exemption").
   `runtimeBundle.test.js`, the suite that used to assert over the bundle list, is gone.
3. **The actual delivery mechanism is different in kind.** `pdlc/engine/scripts/prepack.mjs` copies
   the module **verbatim** — `copyFileSync` over `MODULE_NAMES = ["orchestrate-dev.js",
   "orchestrate-queue.js"]` from `pdlc/workflows/` into `pdlc/engine/vendor/workflows/`, recording
   a `VENDOR-MANIFEST.json`. `pdlc/OPERATIONS.md:97` states it directly: "Workflow modules are
   **vendored into the package** at pack time; the engine never loads `.claude/workflows/`."
   There is no inlining, no bundle, and no consumer-tree copy in the path A6 actually ships on.

**Why this is High rather than a stale-citation nit.** This is not a passing reference: it is the
first of four constraints the document introduces with "Constraints that shaped all four, none of
them this feature's to change", and it is the sole stated ground for the sentence "A new file is
not an option, so 'add a module' never appears as an alternative below" — i.e. it is what prunes
the option space for every entry in `## Options Considered`. A reader auditing whether DEC-A6-01's
option set was complete cannot check that pruning against anything real. The document's own stated
standard is the one being missed: "The rejection reason is stated against shipped code, not
intuition."

It is also the second consecutive round in which this exact bullet was edited and left wrong. The
v1.10 preamble states repair (1) as: Context "cited the bundle as
`pdlc/workflows/dist/orchestrate-dev.bundle.js`" and "the path is corrected and the load-bearing
half — one module, inlined from `pdlc/workflows/orchestrate-dev.js` — restated". The correction
moved the *path* and invented a *channel*, while keeping the retired artifact and the inlining
premise. That makes this the same defect class POSTMORTEM-D §5 names and that v1.8/v1.9/v1.10 each
claim to be closing.

**What resolves it.** The decision outcome survives — a new module file is still not an option —
but for a reason the document does not state and should: `MODULE_NAMES` in
`pdlc/engine/scripts/prepack.mjs` is a hardcoded two-name list, so a file added beside
`orchestrate-dev.js` is never vendored into the published package and never resolves at runtime.
Restate the constraint as: *every advisory-tier symbol A6 reuses lives in
`pdlc/workflows/orchestrate-dev.js`, which the engine vendors verbatim at pack time from a
hardcoded module list; a new file would not be vendored, so "add a module" is not an alternative.*
That is checkable against `prepack.mjs` and it does not move with the next build change. No
decision entry needs to change.

### F-02 (Medium, Local) — the promotion commit is one call per promoted task, not one call

`DEC-A6-02`'s decision sentence reads "makes one additional `commitPaths` call after the per-task
loop", and the Consequences bullet says a resolved wave with a promotion produces "**three** commit
kinds […] per-task commits, the promotion commit, and […] the build-output commit".

The shipped shape is a loop: `for (const promo of waveResolvedPromotions)`, one `commitPaths` call
per iteration, in `pdlc/workflows/orchestrate-dev.js` immediately after the per-task loop and inside
the same `if (waveGit)` block. `waveResolvedPromotions` is the return of `groupPromotedPaths(...)`,
which groups by owning task id, so it can hold more than one row. The code's own comment states the
cardinality the document does not: "one further `commitPaths` call **per promoted task**". The
`message` template the document fixes — `chore({feature}): wave {N} advisory promotion ({taskId})` —
carries a single `{taskId}` slot, which is only coherent under the per-task reading.

**Product impact.** The Consequences bullet exists to describe what an operator sees in `git log`
("the intended legibility"). Under a two-promotion wave the operator sees two promotion commits, not
one, and a reader implementing the decision literally would produce one commit naming only one of
the two tasks in its message — quietly losing the per-task attribution that DEC-A6-02 rejected
option A to protect.

**What resolves it.** Change "makes one additional `commitPaths` call" to "makes one additional
`commitPaths` call **per promoted task**", and the Consequences bullet's "the promotion commit" to
"one promotion commit per promoted task". No design change; the rejection of option A is unaffected.
The same singular appears upstream in TSPEC's O-8 row and is routed as an erratum rather than folded
into this verdict.

### F-03 (Medium, Local) — "No new transport" is traced to the wrong requirement

Context's second constraint reads: "**No new transport.** A6 gets `_git`, `_runCommand`,
`_readFile`, `_appendFile` and `_agent` already threaded through Phase I (NFR-3). Anything a
decision needs, it needs from those."

REQ NFR-3 states: "A6 holds no credentials the pipeline does not already hold, and reaches no
network surface Phase I does not already reach." That is a credentials-and-network constraint. It
does not say the injected-IO set is closed, and it would not be violated by, say, a sixth injected
transport over the local filesystem — which is precisely the thing this constraint is invoked to
forbid (it is the stated ground for rejecting DEC-01 option B, "a filesystem path this workflow does
not otherwise own").

The constraint itself is real and I am not disputing it — `buildA4SeamOps` and the wave loop thread
exactly the transports named. The defect is the trace: a constraint that prunes an option must cite
the clause that actually forbids the option, or an auditor cannot confirm the pruning was legitimate
rather than convenient.

**What resolves it.** Either cite the clause that does own the injected-IO contract (TSPEC's
transport/IO contract for Phase I) alongside NFR-3, or state NFR-3's actual content and add the
separate ground for closure. If no upstream clause closes the transport set, that is worth saying
plainly — "no requirement forbids a sixth transport; this is an engineering constraint the feature
adopts" — which keeps the option-space pruning honest.

### F-04 (Low, Local) — the provenance cell under-counts the rounds

The `Cross-Reviews` header cell enumerates `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1`
through `-v9`. Git history records eleven rounds per reviewer: the harvest commit `9cf48051`
("docs(learnings): delete harvested cross-reviews and DoD code reviews") deletes
`…-DECISIONS-v1.md` through `…-v11.md` for both reviewers. The v1.9 note says the cell "records the
round-9 reviews" and it was not advanced for v1.10.

This is Low because the cited files are all deleted, so nothing downstream resolves through the
cell; it is worth a line because the cell is the only surviving record of how many rounds this
document took, and LEARNINGS reads round counts. Extending the enumeration through v11 — or
replacing the enumeration with a count plus the harvest commit — resolves it.


## Questions

| ID | Question |
|----|---------|
| Q-01 | `DEC-A6-04` says `waveBudgetPerRun: 0` "means 'keep the tier on, keep A6 off' **at the dispatch level, not at the mechanism level**", and that every red wave still captures — so an operator who set `0` to mean "off" still accumulates one dangling ref and one commit object per red wave, forever, in a namespace the feature never prunes (DEC-A6-03's third Consequences bullet). The document justifies the ordering as leaving that operator "a pre-repair snapshot to inspect". Is that the right default for someone whose configured intent was *off*? The two entries are individually well-argued but their interaction is the one place a `0`-configured repo pays an unbounded cost for a feature it opted out of. If the answer is "yes, and the cost is bounded by re-runs", say so in DEC-A6-04 with DEC-A6-03's accumulation named — the reader currently has to compose the two entries to discover it. |
| Q-02 | `DEC-A6-03`'s "Known gap in the remedy's reach" routes a halt-message obligation to REQ/FSPEC and says "the PM is routing it". Read at HEAD, FSPEC E-28 still says only that the halt "names the failed restoration", and AT-05-5 asserts only that the halt names the failed restoration and that no commit is reached — neither carries the "re-running destroys this ref" sentence. So the routing has not landed. Is it still open, or was it dispositioned somewhere this entry does not cite? The entry reads as if a routing is in flight; nine rounds later, an uncited in-flight routing is indistinguishable from a dropped one. Naming the destination (REQ item id, or "raised and declined") would close it either way. |
| Q-03 | `DEC-A6-01` argues at length that a `-m`-less `commit-tree` fails silently and that "the literal belongs in the implementing task's argv, not in its judgement" — i.e. deliberately no test asserts the message text. The shipped literal is `A6 snapshot: wave {N} pre-repair tree ({feature})`, and it is the only thing that tells an operator inspecting a dangling ref which wave and feature the object belongs to. Since the entry's own argument is that the operator-facing legibility of that message is "the whole point of capturing it", is leaving it unasserted the intended trade? This is a question rather than a finding because the entry states the trade explicitly and it is a test-strategy call, not a product one — but the *product* asset at risk (operator recoverability) is this document's own stated stake. |


## Positive Observations

## Recommendation

## Verdict

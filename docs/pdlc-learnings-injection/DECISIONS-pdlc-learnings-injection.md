---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# DECISIONS — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** — `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.5); REQ v0.9; FSPEC v0.7; `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 0.1 | 2026-08-19 |

## Scope, grounding pin, and how to read this document

This document records the **"didn't do, and why"** for pdlc-learnings-injection. The "do" lives in
`TSPEC-pdlc-learnings-injection.md`; nothing here restates a design that document already carries,
and no behaviour rule (FSPEC `BR-1` … `BR-16`) is re-decided here. Each entry exists because a real
alternative was weighed and rejected, and a future agent reading only the code would otherwise
reconsider it confidently and at cost.

**Grounding pin.** Every code claim below was read on `feat-pdlc-learnings-injection` at HEAD on
2026-08-19, before any production edit for this feature had landed — so every citation describes the
*pre-feature* codebase this design attaches to. Citations name **exported symbols and file paths**
rather than line numbers, per `docs/_decisions/DECISIONS-review-severity-bars.md` `DEC-DOC-01`; a
line number appears only where the position itself is the claim.

**Upstream version note.** TSPEC v0.5 was authored against FSPEC v0.5 / REQ v0.7. Upstream has since
moved: REQ v0.9 and FSPEC v0.7 settled the shipping-default question TSPEC recorded as open
(`OQ.2`, `ERR-4`). This document is grounded on the **current** upstream, so `DEC-LI-07` decides
what TSPEC still carries provisionally; the divergence is raised as a TSPEC erratum rather than
resolved silently.

**How to read an entry.** Each `DEC-LI-NN` carries Context, Decision, Alternatives considered (each
with the reason it was rejected and, where the rejection turns on cost, the *measured* cost),
Constraints that forced the shape, Reversibility, and Re-evaluation triggers. An entry's decision is
binding on PLAN and IMPL; its alternatives are closed unless a re-evaluation trigger fires.

## Context

`orchestrate-dev` composes every dispatch from a fixed set of parts and hands it to a role. LEARNINGS
documents harvested from *earlier* features already exist in the repository (9 of them at HEAD under
the corpus predicate) and are read by nothing at authoring time: a lesson paid for once is
re-discovered by the next author. REQ asks that those documents reach every authoring dispatch
in-run, bounded, deterministic, and fail-open (G-1 … G-5); FSPEC fixes the behaviour; TSPEC fixes the
shape. What remains — and what this document records — is the set of engineering choices where a
plausible cheaper or more obvious alternative existed and was rejected.

Four properties of the pre-feature codebase constrain nearly every entry below:

| # | Property | Evidence (HEAD, pre-feature) |
|---|---|---|
| G-A | The engine vendors **exactly two** workflow modules into consumer repositories | `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`, `pdlc/engine/scripts/prepack.mjs` |
| G-B | Four code sites carry `dispatchKind: "authoring"`, and all four funnel through **one** function that sees both the classification and the target document type at composition time | `dispatchAndVerify` (`pdlc/workflows/orchestrate-dev.js`); the three object-literal sites plus `reviewLoop`'s positional `"authoring"` argument to `runWrapped` |
| G-C | `dispatchKind` alone is **wider** than REQ C-1: Phase CR calls the shared `reviewLoop` with `docType: null` over a directory target, and that `null` survives to `dispatchAndVerify` | Phase CR's `reviewLoop({doc: \`docs/${featureName}/\`, phase: "CR", docType: null, …})`, `orchestrate-dev.js` |
| G-D | The repository already ships the two mechanisms this feature needs — a config reader with per-key fallback plus an invalid-key notice, and a `git ls-files` corpus predicate | `parseAdvisoryConfig` / `parseImplementationConfig` (`orchestrate-dev.js`); `LS_FILES_ARGV` consumed by `enumerateCorpus` (`pdlc/workflows/consolidate-learnings.js`) |

G-A and G-D between them set the default posture of this document: **reuse the shipped mechanism, add
no distribution surface.** Where an entry departs from that posture (DEC-LI-04's restatement rather
than import), the departure is itself forced by G-A.

## Options Considered

The ten decisions below were each taken against a named alternative. This table is the index; the
reasoning, the constraints and the reversibility are in the entry.

| # | Question | Chosen | Leading alternative, rejected |
|---|---|---|---|
| DEC-LI-01 | Where does the code live? | inside `orchestrate-dev.js` | a new `pdlc/workflows/learnings-injection.js` — not vendored (G-A) |
| DEC-LI-02 | How is the rule made testable? | pure selection core + one IO shell | a selector that reads files itself |
| DEC-LI-03 | Where does the block attach? | `dispatchAndVerify`, on two conjuncts | the four call sites individually; or the classification alone |
| DEC-LI-04 | How is the corpus enumerated? | `_git` with a restated pathspec + a pinning test | `_listFiles`; or importing `consolidate-learnings.js` |
| DEC-LI-05 | How does the block reach the prompt? | appended suffix, `""` when empty | inserted before the pacing contract |
| DEC-LI-06 | Is the corpus cached? | no feature-owned cache | a run-scoped memo |
| DEC-LI-07 | What does an absent config section mean? | an enabled run on declared defaults | a second `present` gate (TSPEC's provisional reading) |
| DEC-LI-08 | How is prompt growth bounded? | static caps only | a dynamic budget that shrinks under pressure |
| DEC-LI-09 | How is the pre-feature baseline captured? | committed fixture pinned to a recorded sha | recompute the merge-base at test time |
| DEC-LI-10 | How are reason and notice ids registered? | frozen literals, hand-transcribed in tests | derive expected sets from the constants |

## Decision

In one sentence: **the feature is a pure selection rule plus a twelve-line IO shell, added to the one
module the engine already vendors, attached at the one function that sees both the dispatch
classification and the target document type, appended to the prompt as a suffix that is the empty
string whenever nothing is selected, and disabled only by an explicit `enabled: false`.**

Each `DEC-LI-NN` below is binding on PLAN and IMPL. Where a decision is provisional or blocked, the
entry says so in its own Reversibility row rather than in prose elsewhere.

## DEC-LI-01: The feature ships inside `orchestrate-dev.js`, not as a new workflow module

**Context.** The feature adds roughly a dozen symbols — a config parser, four pure predicates/
extractors, a selector, an IO shell, a renderer and an injector factory. `orchestrate-dev.js` is
already the repository's largest module, so the instinct is to give the new region its own file.

**Decision.** All of it lands in `pdlc/workflows/orchestrate-dev.js`, in one contiguous region placed
immediately after `parseAdvisoryConfig` / `readAdvisoryConfigSafely`, so the two config readers a
reviewer must compare sit adjacent.

**Alternatives considered.**

- **A new `pdlc/workflows/learnings-injection.js`** — rejected, and the rejection is mechanical, not
  stylistic. `pdlc/engine/scripts/prepack.mjs` vendors exactly `MODULE_NAMES = ["orchestrate-dev.js",
  "orchestrate-queue.js"]` into `pdlc/engine/vendor/workflows/`. A third file is present in this
  repository's test run and **absent from every consumer repository the engine installs into**: the
  feature would be green in CI and missing in production, in the failure mode that is hardest to
  notice because nothing errors — the injector simply never exists.
- **Extend `MODULE_NAMES` to three** — rejected. That is an edit to the engine's distribution
  contract, whose blast radius is every consumer repository and whose own oracles live in
  `pdlc/engine/__tests__/`. Paying a distribution-contract change for one feature's file layout
  inverts the cost: the thing being bought is reviewer convenience, and the thing being risked is
  the install path of every plugin consumer.
- **Put the pure half in a new file and the shell in `orchestrate-dev.js`** — rejected for the same
  reason as the first alternative; the pure half is where every FSPEC rule lives, so vendoring it is
  not optional.

**Constraints that forced the shape.** G-A (two-module vendoring) is a hard compatibility constraint
of the engine channel, not a preference.

**Reversibility.** Easy in one direction, hard in the other. Extracting the region into its own
module later is a mechanical move *if and only if* `MODULE_NAMES` is extended in the same change;
extracting it without that is the rejected alternative wearing a refactor's clothes.

**Re-evaluation triggers.** `prepack.mjs` gains a glob-based or directory-based vendoring rule;
`orchestrate-dev.js` is split for reasons unrelated to this feature; the engine ships a plugin
mechanism that lets a consumer repository load workflow modules by name.

## DEC-LI-02: A pure selection core with one twelve-line IO shell, not an IO-carrying selector

**Context.** The selection rule (eligibility, ordering, bounding, section choice, labelling) is
FSPEC's `BR-3` … `BR-10`, and REQ asks for the whole of it to be verified without live model calls
(AC-6.1) and for `selectLearnings` to be total (C-7). The obvious shape — one `injectLearnings()`
that enumerates, reads and selects — makes every rule reachable only through the filesystem.

**Decision.** Split at the IO boundary: `selectLearnings({entries, feature, thresholds})` and its
helpers (`looksLikeLearningsDocument`, `parseHarvestDate`, `extractInjectableMaterial`,
`orderCorpus`, `renderLearningsBlock`, `parseLearningsConfig`) are **pure and never throw**;
`gatherLearningsCorpus({feature, _git, _readFile})` is the only impure member and does nothing but
turn two seam calls into the array the pure functions consume.

**Alternatives considered.**

- **One IO-carrying selector** — rejected. Every FSPEC rule would then need a filesystem fixture to
  exercise, and the totality property C-7 asks for (`selectLearnings` returns for *any* generated
  input) becomes a property over a filesystem rather than over a function. The cost is paid three
  times: in PROPERTIES' generators, in the unit suite's setup, and in every future debugging session.
- **Inject a `Corpus` protocol object rather than raw `_git`/`_readFile` seams** — rejected as
  redundant. `dispatchAndVerify` already receives `_readFile`, `_listFiles`, `_git` and `_log`
  (`orchestrate-dev.js`), and both channels already implement them (`defaultGit` / `defaultReadFile`
  in `orchestrate-dev.js`, `rtGit` / `rtReadFile` in `pdlc/workflows/runtime-adapter.js`). A new
  protocol would add a second seam vocabulary for one caller, and every test double would have to
  implement it in addition to the seams it already fakes.
- **A class with injected collaborators** — rejected: the module is function-plus-injected-seams
  throughout (`parseMergeConfig`, `parseAdvisoryConfig`, `decideMerge`), and one class in it would be
  a second architecture in the same file.

**Constraints that forced the shape.** REQ AC-6.1 (no live model calls in the verification of
Groups 2–4) and C-7 (totality) are testability constraints stated upstream, not chosen here. Seam
behaviour is fixed by the channels: `_git(argv)` returns `{ok, stdout, stderr}` and never throws on
either channel, while `_readFile` returns `null` for an absent file and **may throw** on the runtime
channel — so the shell, not the pure core, owns the `try`.

**Reversibility.** Easy. The split is internal to one module; collapsing it later costs only the
tests written against the pure names.

**Re-evaluation triggers.** The pure core acquires a genuine need for IO (e.g. a rule that depends
on file mtime rather than a document's own bytes) — which would itself be an FSPEC change, since
`BR-3` fixes that the predicate consults only the document's bytes.

## DEC-LI-03: One attachment point (`dispatchAndVerify`), gated on two conjuncts, not four call sites

**Context.** Four code sites carry the authoring classification: the phase creator inside `converge`,
`reviewLoop`'s optimizer round (which passes `"authoring"` positionally to `runWrapped`), the erratum
author, and the erratum land-proof retry. All four reach `dispatchAndVerify`, which composes the
prompt from `basePrompt`, `PACING_CONTRACT_CLAUSE` and `opener`.

**Decision.** Attach once, in `dispatchAndVerify`, behind

```js
const injectHere =
  dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType);
```

When `injectHere` is false the injector is **not called at all**: no enumeration, no read, no report
row, and an empty block.

**Alternatives considered.**

- **Attach at each of the four call sites** — rejected. It restates by hand a membership the pipeline
  already computes, and it drifts silently the moment a fifth authoring site appears: the new site
  simply does not inject, and no test fails, because the oracle (`AC-1.2`) is a set equality *against
  the run that happened*. A rule that cannot notice its own omission is not a rule.
- **Gate on `dispatchKind === "authoring"` alone** — rejected on measured grounds. `reviewLoop` is
  shared, and Phase CR calls it with `doc: \`docs/${featureName}/\``, `phase: "CR"`, `docType: null`;
  the `null` survives `reviewLoop`'s `roundDocType` derivation and is forwarded to
  `dispatchAndVerify`. So the classification alone admits Phase CR's optimizer — `se-author`
  remediating **shipped code**, with no target document at all — which is exactly what REQ C-1 and
  NG-5 exclude. The single-conjunct gate is not simpler in effect; it is wrong.
- **Gate on `docType` alone** — rejected: review dispatches for a document also carry a `docType`, so
  this admits every reviewer round and violates `BR-1`'s exclusion list.
- **Add a new `injectLearnings: true` flag at each authoring site** — rejected: it is the
  four-call-site alternative with an extra field, and it introduces a second classification that can
  disagree with the pipeline's own.

**Constraints that forced the shape.** REQ C-1 is a two-part rule (authoring-classified **and**
target document ∈ six types). `dispatchAndVerify` is the only function that sees both parts at
composition time, which makes it the only place the two-conjunct gate can be written once.

**Reversibility.** Easy. The gate is one expression and one frozen array; widening to review roles
(REQ O-6) is an edit to the conjunction, not to the architecture.

**Re-evaluation triggers.** A fifth authoring code site appears that does **not** funnel through
`dispatchAndVerify`; REQ O-6 widens injection to review roles; the pipeline introduces a dispatch
kind that is authoring in spirit but not so classified (FSPEC A-2's stated default is that it is
excluded, and widening must be explicit).

## DEC-LI-04: Corpus enumeration goes through `_git` with a restated pathspec, not `_listFiles` and not an import

**Context.** REQ C-3 pins corpus membership to the enumeration the consolidation side already
performs: two location globs over tracked **and untracked-but-not-ignored** files. That predicate
ships, as `LS_FILES_ARGV` in `pdlc/workflows/consolidate-learnings.js`, consumed by `enumerateCorpus`.

**Decision.** Restate the pathspec literally as a frozen `LEARNINGS_CORPUS_ARGV` inside
`orchestrate-dev.js`, run it through the injected `_git` seam, and add a **pinning test** that fails
if the two argv literals diverge.

**Alternatives considered.**

- **`import { LS_FILES_ARGV } from "./consolidate-learnings.js"`** — rejected, and this is the one
  place where the preferred posture (reuse, don't restate) loses to a hard constraint. G-A:
  `consolidate-learnings.js` is not in `MODULE_NAMES`, so the import resolves in this repository and
  is **absent** in every consumer repository — a module-load failure of `orchestrate-dev.js` itself,
  i.e. the pipeline fails to start rather than degrading. The pinning test is the compensating
  control, and it is the reason the restatement is honest rather than a fork.
- **Enumerate with `_listFiles`** — rejected on measured behaviour, not taste. `defaultListFiles`
  does a single non-recursive `readdirSync`, filters directories out and returns **basenames only**
  (`orchestrate-dev.js`); it has no gitignore knowledge and no glob. Reproducing C-3 on it would mean
  walking `docs/` and `docs/completed/` by hand and re-implementing the ignore rules — a *different*
  predicate wearing C-3's name, which is worse than either alternative because it would pass a
  same-shape test while disagreeing with consolidation about which documents exist.
- **Walk the filesystem directly with `fs`** — rejected: it bypasses the seams, so AC-6.1's
  model-free suites could not fake it, and it inherits the `_listFiles` predicate problem.

**Constraints that forced the shape.** G-A again (no third vendored module); REQ C-3's
tracked-or-untracked-but-not-ignored requirement, which only `git ls-files` decides correctly; and
the seam contract that `_git` never throws on either channel, so the shell's failure handling is a
check of `ok`, not a `catch`.

**Reversibility.** Easy. If `MODULE_NAMES` ever grows to include `consolidate-learnings.js`, the
restatement collapses into an import and the pinning test becomes redundant — a deletion, not a
migration.

**Re-evaluation triggers.** `MODULE_NAMES` gains `consolidate-learnings.js`; the consolidation-side
predicate changes (the pinning test is what surfaces this, by design); REQ C-3 stops being defined by
reference to the consolidation enumeration.

## DEC-LI-05: The block is an appended suffix that is `""` when empty, not an insertion

**Context.** REQ AC-4.1 and AC-5.1a demand byte-identity: a dispatch that carries nothing must be
byte-identical to the same dispatch composed with injection disabled. `dispatchAndVerify` composes
`prompt` as `` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}` ``.

**Decision.** Compose as `prompt + block`, where `block` is `""` whenever the selection is empty and
`"\n\n" + rendered` otherwise. Byte-identity then holds **by construction**: concatenating the empty
string is the identity operation, so there is no code path on which an empty selection can perturb a
prompt.

**Alternatives considered.**

- **Insert the block before `PACING_CONTRACT_CLAUSE`, or between `basePrompt` and the pacing
  contract** — rejected. It reorders existing content relative to itself, so byte-identity stops
  being structural and becomes a property that must be *tested* on every disabled path — and tested
  forever, since any future edit to the composition can break it. It also puts advisory context ahead
  of the contract the role must obey, inverting the priority the prompt communicates.
- **Have the injector return the whole prompt (a transform, not a suffix)** — rejected: it gives the
  new code the ability to modify existing content, which is precisely the capability REQ C-8's
  non-displacement half asks it not to have. Returning a suffix makes the guarantee a type-level
  fact.
- **Emit a placeholder block ("no prior learnings") when the selection is empty** — rejected: it
  breaks AC-4.1/AC-5.1a outright, and it spends prompt bytes to tell an author nothing.

**Constraints that forced the shape.** AC-4.1 and AC-5.1a; REQ C-8's non-displacement half; and
FSPEC `BR-7`, which fixes what the block must convey but not where it sits.

**Reversibility.** Easy — a one-line change in `dispatchAndVerify` — but any move that stops the
block being a **suffix** forfeits the structural guarantee and must bring its own tests.

**Re-evaluation triggers.** Evidence that role compliance degrades when advisory context is last in
the prompt; a future prompt-composition refactor that stops building `prompt` by concatenation.

## DEC-LI-06: No feature-owned cache or run-scoped memo

**Context.** A run makes many authoring dispatches. Each one re-enumerates the corpus and re-reads
the selected documents, so the naive cost is *O(dispatches × corpus bytes)*. A run-scoped memo would
reduce that to one enumeration and one read per document per run.

**Decision.** The feature owns **no** cache, memo or index. Every dispatch enumerates and reads
afresh, over the repository state *that dispatch* observed.

**Alternatives considered.**

- **A run-scoped memo of the corpus** — rejected on two grounds, one behavioural and one about what
  the tests would then prove. Behaviourally it contradicts FSPEC E-32: selection is per-dispatch over
  the state that dispatch observed, so a LEARNINGS document landing mid-run, or an enumeration that
  fails at dispatch 5 after succeeding at dispatch 1, must be visible. Evidentially, a memo would let
  the determinism test pass **because the second call never happened** — green on a cache rather than
  on the rule, which is the vacuous-oracle failure this repository has paid for before
  (`docs/_decisions/DECISIONS-test-oracle-mechanics.md`).
- **A persisted index or cache file under `docs/` or `.claude/`** — rejected outright: REQ NG-4 and
  FSPEC `BR-15` state that the run creates no index, cache or state file anywhere, and AC-5.2's
  filesystem-footprint oracle asserts it.
- **Memoise only the enumeration, not the reads** — rejected: it is the same E-32 violation on the
  cheaper half, and it splits the observed-state story across two different moments in the run,
  which makes the per-dispatch record harder to reason about than the cost it saves.

**Constraints that forced the shape.** FSPEC E-32 (per-dispatch observation), REQ NG-4 and `BR-15`
(no new artefacts), AC-5.2 (positive-membership filesystem oracle).

**Cost, stated plainly.** The re-read is not free, and this entry does not pretend otherwise. On the
Claude Code channel the platform read seam already carries a revalidating cache (`rtReadFile` in
`pdlc/workflows/runtime-adapter.js`), so an unchanged document usually costs a size+sha probe rather
than a full chunked read — but the cache is **shared across every read the run makes**, is capped at
`RT_READ_CACHE_MAX_BYTES` (2 MiB) and evicts oldest-inserted, so residency is not guaranteed to this
corpus. That is why the read cost, not the injected-byte cost, is the term flagged to REQ O-1's live
measurement (TSPEC `T-O-3`): the injection is bounded, the read is not.

**Reversibility.** Hard, not because the code is hard to add but because a cache changes observable
behaviour that oracles depend on. Adding one later means revisiting E-32 and AC-5.2 upstream first.

**Re-evaluation triggers.** REQ O-1's measurement shows read cost dominating a run; the corpus grows
past the point where per-dispatch re-reading is affordable; FSPEC relaxes E-32 to a run-scoped
observation.

## DEC-LI-07: An absent configuration section is an enabled run, and no configuration mistake disables the feature

## DEC-LI-08: The injection is bounded by static caps only; there is no dynamic prompt budget

## DEC-LI-09: The pre-feature baseline is a committed fixture pinned to a recorded sha, not a recomputed merge-base

## DEC-LI-10: Reason and notice ids are frozen literals, hand-transcribed in tests

## Decisions deliberately NOT taken here

## Consequences

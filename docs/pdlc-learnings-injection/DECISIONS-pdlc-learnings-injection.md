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

## DEC-LI-05: The block is an appended suffix that is `""` when empty, not an insertion

## DEC-LI-06: No feature-owned cache or run-scoped memo

## DEC-LI-07: An absent configuration section is an enabled run, and no configuration mistake disables the feature

## DEC-LI-08: The injection is bounded by static caps only; there is no dynamic prompt budget

## DEC-LI-09: The pre-feature baseline is a committed fixture pinned to a recorded sha, not a recomputed merge-base

## DEC-LI-10: Reason and notice ids are frozen literals, hand-transcribed in tests

## Decisions deliberately NOT taken here

## Consequences

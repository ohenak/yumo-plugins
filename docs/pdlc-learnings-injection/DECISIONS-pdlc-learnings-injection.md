---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# DECISIONS — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** — `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.9); REQ v0.10; FSPEC v0.14; `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft — round 7 revision: replaces `DEC-LI-08`'s two framing literals (694 / 1,012) — which came from two different fixtures and were not reproducible on the shipped renderer — with the cost's actual shape, a 477-byte block constant plus `49 + 2·len(path) + len(feature) + len(orderKey)` per selected document plus the `ABRIDGED` clause, worked over a named fixture (this repository's corpus: 684 at one document, 1,607 at five; 718 / 1,777 abridged), and states the ceiling as a function of the corpus rather than a constant; makes `D-O-4` cite that formula instead of restating literals a report author could transcribe; scopes the grounding pin so post-implementation *shipped-code confirmations* are distinguished from the pre-feature reads that ground the decisions; re-pins upstream on FSPEC v0.14 / REQ v0.10 and records that v0.14's window restatement and AC-2.4's attribution clause leave the byte-accounting basis, `E-36` and `AT-30` untouched. Round 6 revision: restates DEC-LI-08 over FSPEC v0.13's material-only byte-accounting basis (the caps bound material, framing is charged to no threshold; framing's measured constant recorded), splits `D-O-4` into realised material bytes and realised block bytes so the C-8 gap's closing condition compares commensurable quantities, and adds `D-O-3`'s zero-bound conjunct (`maxBytesPerDocument: 0` ⇒ no material, `RSN-NO-MATERIAL`, no slot, no `bounded` flag) with an explicit bound domain for the property. Round 5 revision: re-pins the header on TSPEC v0.9 / FSPEC v0.13 / REQ v0.9, records DEC-LI-07's TSPEC erratum as **landed** and `D-O-9` as discharged, restates the AC-3.3 non-decision on the per-dispatch oracle locus REQ v0.9 settled, re-grounds DEC-LI-06's Hard reversibility on E-32 and `D-O-6` rather than AC-5.2, re-quotes FSPEC A-2 in DEC-LI-03's re-evaluation trigger, and records `D-O-6`'s new role as the sole falsifier of a `null` corpus outcome | Claude | 0.5 | 2026-08-21 |

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
line number appears only where the position itself is the claim. **Two kinds of citation, kept
distinct.** Citations that ground a *design choice* are the pre-feature reads pinned above.
Citations added in later revision rounds that confirm the shipped implementation matches what an
entry decided — `renderLearningsBlock`'s framing inventory and formula in `DEC-LI-08`,
`extractInjectableMaterial`'s `maxBytes <= 0` early return and `selectLearnings`'s
`sections.length === 0` branch in `D-O-3` — are read on **post-implementation HEAD** and are named
as *shipped* in the text. They are confirmations, not grounds: no decision here rests on them.

**Upstream version note.** This document is grounded on upstream **at HEAD**: TSPEC v0.9, FSPEC
v0.14, REQ v0.10. Both moved since round 6 without touching anything decided here: FSPEC **v0.14**
restates `BR-6`'s *total* bound over the window the count bound leaves and states the mixed
count/byte attribution (a document past the window carries `RSN-COUNT` whatever the window's byte
outcome), and REQ **v0.10** carries the matching AC-2.4 attribution clause. Neither touches the
**byte-accounting basis** `DEC-LI-08` restates — FSPEC §"The byte-accounting basis" is still
material-only, and `E-36` and `AT-30`, which `D-O-3`'s zero-bound conjunct cites, are unchanged. The
history matters only because `DEC-LI-07` reads as a divergence otherwise: TSPEC
v0.5 was authored while REQ contradicted itself on the shipping default and carried a provisional
second gate with `OQ.2` and `ERR-4` open; REQ v0.9 settled the question, this document was written on
the settled answer, and TSPEC has since landed it (§I.3 gates on `config.enabled` alone, `OQ.2` and
`ERR-4` CLOSED, `LEARNINGS_DEFAULTS.enabled === true`). **No live upstream gap remains** — TSPEC and
this document now stand on the same REQ and FSPEC, and `DEC-LI-07` records a *closed* divergence.

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
behaviour is fixed by the channels, and the two channels do **not** agree, so the shell's guard is
written to the weaker one. On the Node channel `defaultGit` (`orchestrate-dev.js`) wraps its
`execFileSync` in `try` and converts a non-zero exit into `{ok: false, stdout, stderr}`, so it never
throws. On the Claude Code channel `rtGit` (`pdlc/workflows/runtime-adapter.js`) awaits `RT.agent`
with **no** `try` — unlike its siblings `rtReadChunk`, `rtReadProbe`, `rtHashFile` and `rtCliQuery`
in the same file, all of which wrap the `await` — so a rejected host `agent()` call **rejects
`rtGit`**. (Its docblock says "never throws"; the docblock describes `rtParseTransportReply`'s
total behaviour on a reply that *arrives*, not the transport that delivers it.) `_readFile` likewise
returns `null` for an absent file and **may throw** on the runtime channel. Therefore the shell, not
the pure core, owns a `try` that covers **both** seam calls — enumeration as well as read — and a
throw from either is converted to the same fail-open outcome the `{ok: false}` path produces.

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

**The funnelling premise needs its own guard.** The argument against the four-call-site alternative —
that a rule which cannot notice its own omission is not a rule — applies unchanged to this design's
own premise that every authoring site funnels through `dispatchAndVerify`. `AC-1.2` cannot detect a
violation, because it is a set equality computed over the run that happened, so a non-funnelling
fifth site is invisible to it exactly as it would be to the rejected alternative. DEC-LI-04 already
ships the right shape for this class of premise (a pinning test over a source-level literal), so the
same instrument applies here: a **source-level test over `orchestrate-dev.js`** asserting that the
set of authoring-classified dispatch producers is exactly the set that reaches `dispatchAndVerify`.
At HEAD that set is four members — three `dispatchKind: "authoring"` object literals (the phase
creator in `converge`, the erratum author, and the erratum land-proof retry) plus `runWrapped`'s
positional `"authoring"` from `reviewLoop`'s optimizer round — and the expected set is
**hand-transcribed**, per DEC-LI-10's rule, not derived from the source it checks. A fifth site then
reds the guard on the commit that adds it, which is what turns the first re-evaluation trigger below
from a hope into a mechanism.

**Reversibility.** Easy. The gate is one expression and one frozen array; widening to review roles
(REQ O-6) is an edit to the conjunction, not to the architecture.

**Re-evaluation triggers.** *Mechanically detected* — a fifth authoring code site appears that does
**not** funnel through `dispatchAndVerify`: the source-level producer-set guard above reds on the
commit that introduces it. *Review-time judgement* — REQ O-6 widens injection to review roles; the
pipeline introduces a dispatch that BR-1's two conjuncts exclude. FSPEC `BR-1` at HEAD states the
rule as *authoring-classified **and** a target document among REQ C-1's six types*, so there are two
distinct exclusion shapes and only one of them is a classification question: a dispatch satisfying
**neither** conjunct (FSPEC `A-2`: "If a future phase introduces a dispatch that satisfies neither
conjunct in the pipeline's own terms yet is authoring in spirit, BR-1 excludes it by construction"),
and an **authoring-classified dispatch whose target document type is none of the six**, which BR-1
now names directly and which Phase CR's `docType: null` already instantiates (G-C). Both are excluded
by construction and A-2 states that this is the correct default: widening is explicit, never
implicit. The trigger is a judgement call in either shape, because no oracle can distinguish a
deliberate exclusion from an oversight.

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
- **Widen the enumeration to include consolidation's project-level artefacts** (`docs/_constraints/`,
  `docs/_decisions/`) — rejected, and recorded here because REQ G-6's second clause makes it the
  natural next thought for an agent reading only the code. C-3 defines the corpus by reference to
  consolidation's **pass-side** predicate, which is LEARNINGS-only; project-level constraints and
  decisions reach authoring roles by a different route entirely — the role prompts already instruct
  every author to read `docs/_constraints/DOMAIN-CONSTRAINTS.md` and `docs/_decisions/` before
  writing. G-6's second clause is therefore already discharged, and adding those globs here would
  double-deliver the same material at per-dispatch cost while breaking the pinning test's premise
  that the two argv literals are the same predicate.

**Constraints that forced the shape.** G-A again (no third vendored module); REQ C-3's
tracked-or-untracked-but-not-ignored requirement, which only `git ls-files` decides correctly; and
the seam contract as corrected in DEC-LI-02 — `_git` returns `{ok, stdout, stderr}` without throwing
on the Node channel (`defaultGit`), but **may reject on the runtime channel** (`rtGit` awaits
`RT.agent` unguarded). So the shell's failure handling is a check of `ok` **and** a `catch` around
the enumeration call, not a check of `ok` alone. One `try` around the twelve-line shell covers both
seams; it costs nothing on the channel where the no-throw contract does hold, and it is the only
thing standing between a transport rejection and a halted authoring dispatch, which REQ C-7/G-4 and
FSPEC `BR-12` forbid unconditionally. A design whose fail-open guarantee holds on one channel only
is not the guarantee this feature exists to give.

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

**Re-evaluation triggers.** *Review-time judgement* — evidence that role compliance degrades when
advisory context is last in the prompt. *Mechanically detected* — a future prompt-composition
refactor that stops building `prompt` by concatenation, which reds AC-4.1/AC-5.1a's byte-identity
oracle, since the empty-block identity holds by construction only under concatenation.

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
behaviour that oracles depend on. The ground is **E-32 plus `D-O-6`'s call counts**, and precisely
not AC-5.2: FSPEC `BR-15` compares the observed and expected footprints as **sets of paths**, "not as
counts, so a document opened more than once neither adds a member nor changes the verdict", and a
read memo removes repeat opens without removing a member — AT-33 stays green under an in-process
memo, so the filesystem-footprint oracle cannot detect one. What a memo *does* break is FSPEC `E-32`
("Each dispatch selects over the state **it** observed") and the per-dispatch call-count conjunct of
`D-O-6`, which is exactly why that obligation carries a positive count assertion rather than only a
behavioural case. Adding a cache later therefore means revisiting **E-32** upstream first, and
retiring or restating `D-O-6`'s count conjunct — not amending AC-5.2, which would not have to move.
(A cache *file* is a different matter: that one is caught by AC-5.2's no-new-artefact half, per the
second rejected alternative above.)

**Re-evaluation triggers.** *Mechanically detected* — FSPEC relaxes E-32 to a run-scoped observation
(the per-dispatch call-count oracle of `D-O-6` reds). *Review-time judgement, with an observable
prompt* — REQ O-1's measurement shows read cost dominating a run; the corpus grows past the point
where per-dispatch re-reading is affordable, for which the cheap proxy is the corpus document count
returned by `LEARNINGS_CORPUS_ARGV` (**9** at HEAD): treat a review of this entry as due when that
count passes ~30, or when measured bytes read per authoring dispatch pass the 2 MiB
`RT_READ_CACHE_MAX_BYTES` ceiling, beyond which the platform cache cannot hold the corpus at all.

## DEC-LI-07: An absent configuration section is an enabled run, and no configuration mistake disables the feature

**Context.** REQ §4.1 declares `learningsInjection.enabled` with a default of `true`. TSPEC v0.5 was
authored while REQ carried a contradiction (G-1's "no configuration change required" against an
earlier AC-5.1a that read an **absent** section as the disabled state), and it therefore implemented
a provisional second gate — `present && config.enabled && !sectionMalformed` — recording the
question as open (`OQ.2`, `ERR-4`). REQ v0.9 has since settled it: AC-5.1a is now scoped to an
**explicit** `enabled: false`, states that an absent section reads as §4.1's declared defaults, and
says in terms that "there is no second gate beyond this key (G-1)". FSPEC `BR-14` (v0.13 at HEAD) carries the
same five states.

**Decision.** The gate is `config.enabled` alone:

| Config state | Behaviour | Record |
|---|---|---|
| section absent / file absent / section name misspelt | enabled, on declared defaults | `BR-8` rows, no notice |
| `enabled: false` (explicit) | byte-identical to the recorded pre-feature baseline | **no injection key at all** |
| section present, not an object | enabled, on declared defaults | `NTC-MALFORMED` |
| declared key wrong-typed | enabled, that key at its default | `NTC-KEYTYPE` |
| enabled, thresholds admitting nothing | enabled, empty selection | `BR-8` rows, present and empty |

The `present` flag survives as a **reported** field — AC-5.1a's "absent, not present-and-empty"
report-key distinction still needs it — but it is no longer a gate.

**Alternatives considered.**

- **Keep TSPEC's `present` gate** — rejected because it now contradicts settled upstream. Its only
  merit was that, while REQ was self-contradictory, it was the reading that made *something*
  testable; that merit expired with REQ v0.9. Concretely it would ship the feature **off** in this
  repository, which holds no `.claude/pdlc.config.json` at all and 9 corpus documents — i.e. off in
  exactly the case G-1 exists to serve.
- **Copy `parseAdvisoryConfig`'s posture wholesale** — rejected on a *measured* distinction that an
  earlier FSPEC draft got backwards. `ADVISORY_DEFAULTS.enabled` is `false`, so an absent advisory
  section is a disabled advisory tier; this feature's declared default is `true`, so the two readers
  share their **shape** (per-key independent fallback, `invalidKeys`, `sectionMalformed` meaning
  present-and-not-an-object) and deliberately differ in their **default value**. The nearer
  precedent for fail-open-on-malformed is `parseImplementationConfig`, whose malformed section
  yields `IMPLEMENTATION_DEFAULTS` plus a caller-reported degradation.
- **Treat a malformed section, or a wrong-typed threshold, as a disable** — rejected. Disablement is
  an explicit act (G-1, G-4); turning an advisory feature off over one mistyped number is a silent
  behaviour change an operator did not ask for, and it diverges from both shipped siblings for no
  stated reason.
- **Detect a misspelt section name via a registry of legal top-level keys** — rejected. No such
  registry exists in `.claude/pdlc.config.json`, and one would misfire on every key a later feature
  adds. A misspelt section is a stray top-level key, therefore absent, therefore default-enabled.

**Constraints that forced the shape.** REQ G-1, G-4, C-7 and AC-5.1a/b/c as of v0.9; FSPEC `BR-14`;
DC-01's closed-catalogue rule for the two notices.

**Reversibility.** Easy — one conjunct — but it is a **product** lever, not an engineering one:
changing it means changing REQ §4.1's declared default, not the parser.

**The divergence from TSPEC was a recorded erratum, and it has landed.** For one round TSPEC and
this document disagreed in writing: TSPEC v0.5 built the injector on
`present && config.enabled && !sectionMalformed` (§I.3) and carried `OQ.2` and `ERR-4` open, because
it was authored while REQ contradicted itself. That mattered beyond bookkeeping — **PROPERTIES and
PLAN authors read TSPEC, not this document**, so an `AT-31`/`AT-32` written against the provisional
§I.3 would have been red against the correct implementation — so the divergence was raised as
**DEC-ERR-01 against TSPEC** rather than resolved silently. TSPEC has since made all four edits: at
HEAD (v0.9) §I.3's gate drops `present` and `sectionMalformed`, `OQ.2` is settled, `ERR-4` is
recorded **CLOSED, resolved REQ v0.9**, and `LEARNINGS_DEFAULTS.enabled` is `true` with an absent
section leaving it there. `D-O-9` is therefore **discharged**, and this entry and TSPEC §I.3 now
state the same gate. `D-O-5` remains live for a different reason: it is an IMPL-side prohibition on
reintroducing `present` as a condition, which no upstream edit discharges.

**Re-evaluation triggers.** *Mechanically detected* — REQ changes the declared default (the
five-state configuration table is transcribed from FSPEC `BR-14`, so a `BR-14` change reds the
transcription). *Review-time judgement* — operators report unwanted injection in repositories that
never opted in; a future feature introduces the top-level-key registry that would make a misspelt
section detectable.

## DEC-LI-08: The injection is bounded by static caps only; there is no dynamic prompt budget

**Context.** REQ C-8 has two halves: the block must not displace existing prompt content, and "when
the bound cannot be honoured alongside them, less is injected". The first half is discharged
structurally by DEC-LI-05. The second half names a mechanism.

**Decision.** Bound the addition with REQ §4.1's static thresholds only — per-document bytes, total
bytes, document count — applied unconditionally, whatever else the prompt carries. The design does
**not** measure the rest of the prompt and shrink the injection when a dispatch is already large.

**What the caps bound (decided at FSPEC v0.13; unchanged at v0.14, whose restatement moves the
*total* bound's window, not the accounting basis).** The three quantities bound a document's
**material** — the
priority-section headings and bodies taken — and nothing else. FSPEC `BR-6` §"The byte-accounting
basis" charges **framing** to no threshold: the identification line, the per-document delimiters and
source-path label, and the block preamble (`BR-7`) count toward none of the three, grounded on REQ
AC-2.3's "the material taken". The shipped renderer agrees — `renderLearningsBlock`
(`pdlc/workflows/orchestrate-dev.js`) concatenates `LEARNINGS_BLOCK_HEADER`,
`LEARNINGS_BLOCK_PREAMBLE`, the per-document `<<< … >>>` / `<<< end … >>>` pair and
`LEARNINGS_BLOCK_TRAILER` around `doc.material`, and only `material` was ever measured into
`bytes`. This entry's decision is unaffected — *which* quantities bound is what it decides, and a
static bound stays static under either accounting basis — but the wording below is stated over
material, because the caps are not a bound on the block's size. Framing is **not a constant**: as
TSPEC §D.5 already says, it is a block term plus one opener/closer pair per selected document, and
each pair embeds that document's path twice, its feature name and its `orderKey`. Read off the
shipped `renderLearningsBlock` at HEAD, framing is a **block constant of 477 bytes** (the `\n\n`
prefix, the 50-byte header, the preamble, the separators and the 35-byte trailer) plus, per selected
document, `49 + 2·len(path) + len(feature) + len(orderKey)` bytes, plus a further
`30 + len(String(bytes))` when the document is `bounded` and carries the
` (ABRIDGED: bounded at N bytes)` clause. Evaluated over a named fixture — this repository's own
corpus at HEAD, the first five of `git ls-files | grep -E 'LEARNINGS-.*\.md$'`, with a ten-character
`orderKey` — that is **684 bytes** at one document and **1,607** at five (718 / 1,777 when every
selected document is abridged, which at §4.1's 6,000-byte per-document default is the common case).
So at REQ §4.1's defaults a fully-conforming block over *this* corpus occupies up to roughly
**21,600 bytes** against a `maxTotalBytes` of 20,000. The overshoot is a known, bounded growth term
rather than a leak, but it is a **function of the corpus**, not a fixed number: any reader can
re-evaluate the formula against their own paths. That is why `D-O-4` reports the two quantities
separately rather than pinning either to a literal.

**Alternatives considered.**

- **A dynamic budget: measure `basePrompt + PACING_CONTRACT_CLAUSE + opener` and inject only what
  remains under a ceiling** — rejected, and the reason is authority, not difficulty. Nothing in
  `orchestrate-dev.js` knows a prompt ceiling to budget against; inventing one means deciding *which*
  content yields under pressure, and degradation order is a product decision REQ has not made. A
  number invented here would be load-bearing, undiscoverable and wrong in a way no test could catch.
- **Cap the injection as a fraction of the composed prompt's size** — rejected for the same reason
  plus a determinism cost: the selected set would then depend on the length of unrelated upstream
  documents, so two dispatches over an identical corpus could select differently, weakening the
  determinism claim (`AC-4.2`) for a bound nobody has justified.
- **Refuse to compose when the prompt exceeds a threshold** — rejected: it converts an advisory
  feature into a run-halting one, contradicting fail-open (G-4).

**Constraints that forced the shape.** REQ §4.1 owns the threshold values — a layer boundary
(`DEC-LAYER-01`), not `DC-18`, which is an oracle-surface rule about glob-ranged guards and says
nothing about who owns tunable numbers; REQ has not decided a displacement order; determinism (`AC-4.2`) forbids selection depending on unrelated
prompt content.

**Stated honestly.** C-8's second half is satisfied in the **weak** sense — the injected **material**
is bounded a priori, and the block's framing adds a bounded constant on top (above) — not the strong
sense that it yields under pressure. If REQ O-1's live measurement shows
realised **material** crowding the caps — or realised **block** bytes, framing included, crowding a
prompt — or a correlation between injection size and degraded output,
then either the caps move (a REQ §4.1 change, no code change) or REQ decides the displacement order
and a dynamic budget arrives as a follow-on. Neither outcome requires this design to change shape,
which is why the gap is recorded rather than pre-solved.

**Reversibility.** Easy: a dynamic budget slots in at `renderLearningsBlock`'s caller without
touching the selection rule, once REQ says what yields.

**Re-evaluation triggers.** REQ O-1's measurement lands; REQ decides a degradation order; a channel
introduces a hard prompt ceiling the module can read rather than invent.

## DEC-LI-09: The pre-feature baseline is a committed fixture pinned to a recorded sha, not a recomputed merge-base

**Context.** REQ AC-6.2 wants byte-identity asserted against a baseline captured at **pre-feature
HEAD**, committed, and never regenerated to make a failing test pass. There is a circularity: the
capture harness (the L3 fixture matrix, the scripted `_agent` cases) does not exist at the
merge-base, so "check out the merge-base and run the capture" is not an executable instruction.

**Decision.** Capture from the **branch** working tree against a **merge-base checkout of the
subject module only** — a `git worktree` at the merge-base, from which the capture script imports
`main`, driving it through fixtures that live on the branch. Write prompts plus a `MANIFEST.json`
recording the resolved merge-base sha and a SHA-256 per file, and pin the guard test to
**hand-transcribed digest literals**, asserted as **set equality** over case ids.

The recorded sha is itself an oracle surface, and the guard checks it rather than trusting the
moment of capture. A sha recorded *after* a production edit landed is a commit that already contains
feature code, and the byte-identity test then compares the feature against itself and passes
vacuously — the same failure this entry rejects the recomputed merge-base for. Ordering the capture
first (D-O-2) is necessary but not falsifiable on its own, so the guard additionally asserts, against
the sha in `MANIFEST.json`:

1. `git merge-base --is-ancestor <recorded-sha> HEAD` succeeds — the recorded commit is genuinely an
   ancestor of the branch, not a detached or re-pointed one; and
2. a **positive absence** check: the subject module at that sha carries none of this feature's
   exported symbols — `git show <recorded-sha>:pdlc/workflows/orchestrate-dev.js` contains no
   `selectLearnings`, `gatherLearningsCorpus` or `LEARNINGS_CORPUS_ARGV`. Absence of the symbols is
   what makes the commit *pre-feature*; the sha's provenance is what the manifest claims, and this is
   the check that the claim is true.

Conjunct 2 is the load-bearing one: conjunct 1 alone passes for any ancestor, including one captured
late. Together they make the vacuity detectable by the guard itself rather than by the discipline of
whoever ran the capture.

**Alternatives considered.**

- **Recompute the merge-base at test time** — rejected. The merge-base moves under rebase or a merge
  from `main`, so a recomputed baseline can silently re-point at a commit that already contains
  feature code — the byte-identity test then compares the feature against itself and passes
  vacuously. Recording the resolved sha at capture time removes the moving part.
- **Have the guard test compare the fixture directory against `MANIFEST.json` alone** — rejected: the
  script writes both halves, so a re-capture rewrites them in step and the check passes exactly when
  it should fail. It catches hand-edited fixtures and nothing else. The hand-transcribed literal is
  the falsifying anchor outside the script's own output (DC-03, DC-14), and re-capture then reds the
  guard until a human edits a constant in a reviewable diff.
- **Assert containment rather than set equality over case ids** — rejected: containment lets a
  *silently deleted* baseline case pass, and a deleted case is precisely how a byte-identity failure
  would be made to disappear instead of surface.
- **Check out the merge-base over the branch working tree** — rejected: it destroys the harness the
  capture needs, which is the circularity this entry exists to dissolve.
- **Remove the worktree with `rm -rf`** — rejected on measured behaviour: it satisfies "the path is
  gone" while leaving a stale administrative entry under `.git/worktrees/` that reds the next
  `git worktree add` at the same path. Removal is `git worktree remove --force`, in a `finally`.

**Constraints that forced the shape.** Two are measured at HEAD and both are load-bearing:
`git check-ignore -v .baseline-worktree` exits **non-zero** today — no rule covers it — so an
interrupted capture leaves a full untracked checkout at the repository root; and `coveredViolations`
walks the entire tree under `root`, skipping only `.git` and `node_modules`
(`WALK_SKIP_DIRS = new Set([".git", "node_modules"])`, `pdlc/workflows/lib/document-oracles.mjs`),
so that leftover — a second copy of every `docs/**` artifact — would be scanned as live documents by
a shipped gate. Hence both a root-anchored `/.baseline-worktree/` ignore rule (anchored the way
`/.claude/pdlc.config.json` is in `.gitignore`) **and** `finally`-block removal, each with its own
oracle, because the capture's happy path passes without either.

**Not an NG-4 violation.** NG-1/NG-4 and AC-5.2 forbid the *run* from creating an index, cache or
state file. The baseline directory and `MANIFEST.json` are committed test fixtures written by a
script a human invokes; `main()` never touches them, and the write-side instrument asserts the run's
working-tree delta is empty.

**Reversibility.** Hard. Once the baseline is committed and the digest literals are transcribed, the
capture cannot be legitimately re-run except when the L3 fixture matrix itself changes — and that
re-capture must add or replace whole case directories while leaving every retained file's digest
unchanged.

**Re-evaluation triggers.** The L3 fixture matrix gains or changes a case; the repository adopts a
different byte-identity instrument; `document-oracles.mjs` gains a skip rule that makes the ignore
obligation redundant (it would still not make the `finally` redundant).

## DEC-LI-10: Reason and notice ids are frozen literals, hand-transcribed in tests

**Context.** The feature emits three closed catalogues: per-document rejection reasons (`RSN-*`),
corpus-level outcomes, and configuration notices (`NTC-MALFORMED`, `NTC-KEYTYPE`). REQ C-9 and
FSPEC require each catalogue to be closed, with a completeness test asserting set equality.

**Decision.** Each catalogue is a frozen literal in `orchestrate-dev.js`, and every completeness test
asserts against a **hand-transcribed** expected set — not against the constant it is testing. The
same applies to `LEARNINGS_TARGET_DOCTYPES`, whose expected membership is transcribed from REQ C-1's
six names.

**Alternatives considered.**

- **Derive the expected set from the exported constant** — rejected: the assertion becomes
  `X === X` and passes for any edit, including deleting a member. This is the vacuous-oracle pattern
  DC-14 exists to prevent, and the repository has shipped it accidentally before
  (`docs/_decisions/DECISIONS-test-oracle-mechanics.md`).
- **Use free-form strings at each emit site, with no catalogue** — rejected: closure is then
  unassertable, and a typo produces a new "reason" no report reader can group.
- **Derive the id from an enum-like object keyed by the reason** — rejected as the first alternative
  with indirection: the test still reads its expectation from the implementation.

**Constraints that forced the shape.** REQ C-9 (closed catalogues), DC-01 (set-equality completeness
tests), DC-14 (hand-transcribed expectations for closed sets).

**What the completeness tests do *not* falsify, and who covers the gap.** TSPEC §D.1 scopes each
domain-membership test to **non-`null`** values, correctly: `null` is the *healthy* value of
`dispatches[i].corpusOutcome` — "documents were known" — and is deliberately not a member of
`LEARNINGS_CORPUS_OUTCOMES`, so an unscoped assertion would red on every happy-path run. The
consequence this entry owes the reader: the scoped test can no longer falsify a `corpusOutcome` that
is `null` **where a catalogued reason was required** — an implementation that swallowed an
enumeration failure and recorded `null` passes both the membership test and the set-equality test.
The sole surviving falsifier is `D-O-6`'s **positive behavioural case** (an enumeration failing at
dispatch 5 records `RSN-UNLISTABLE` at 5). That is a real dependency between two obligations, not a
redundancy: transcription closes the catalogue, and only the behavioural case ties a given run state
to the member it must produce. Weakening `D-O-6` therefore silently weakens this entry.

**Reversibility.** Easy per catalogue, but adding a member is deliberately a two-file edit — the
constant and the transcribed expectation — which is the reviewable diff the decision is buying.

**Re-evaluation triggers.** *Review-time judgement, with an observable prompt* — a catalogue grows
past the size where hand transcription is maintainable; the cheap proxy is catalogue member count,
and the threshold worth reviewing at is ~15 members in any one catalogue (the notices catalogue has
two and the reasons catalogue is small, so this is not near). *Review-time judgement* — the
repository adopts a generated-catalogue mechanism with its own falsifying anchor.

## Decisions deliberately NOT taken here

Four questions that a reader might expect in this document are **not** decided here, and each is
placed rather than left dangling:

| Question | Owner, and why not here |
|---|---|
| The threshold *values* (`maxBytesPerDocument`, `maxTotalBytes`, document count) | REQ §4.1, per the layer boundary `DEC-LAYER-01`. Engineering owns the mechanism, product owns the numbers; DEC-LI-08 depends on their existence, not on their values. |
| The ordering key, the section subset, and the eligibility rule | FSPEC `BR-4`, `BR-6`, `BR-3`. These are behaviour, and this document does not re-decide behaviour. |
| Widening injection to review roles | REQ O-6. DEC-LI-03's gate is an expression, so the widening is cheap — but it is a product decision about what a reviewer should see. |
| Whether AC-3.3's reproduction record belongs at run level or per dispatch on a divergent run | REQ, which **has now settled it** (v0.9); TSPEC `ERR-6` is CLOSED and this document does not re-raise it. The settled answer, which PROPERTIES must be written on: the ordering key value per document is recorded **per authoring dispatch**, alongside AC-3.1's rows for that dispatch, and the §4.1 thresholds in force **once per run** — **two** loci, **two** completeness tests, one per locus (REQ AC-3.3; FSPEC `BR-10`). AC-3.2 settles the corpus-level outcome the same way: `dispatches[i].corpusOutcome` is the **oracle locus**, and the run-level mirror is additive, explicitly **not** an oracle, with a deliberately unconstrained last-write-wins value that no fixture may assert on (TSPEC §D.2). A completeness or membership assertion aimed at the run-level mirror is therefore the wrong target — it is green on a single-dispatch fixture and silently wrong on AT-18's divergent run. Which locus each test asserts over was a contract decision, taken upstream, not an implementation one taken here. |

One further non-decision is worth naming because its absence is easy to mistake for an oversight:
**there is no retry, backoff or degraded-mode ladder** for a failed enumeration or an unreadable
document. Fail-open (G-4) plus a catalogued reason row is the whole error strategy; adding a retry
would make the per-dispatch observation (E-32) depend on timing, which is what determinism forbids.

## Consequences

**What these decisions make cheap.**

- Widening (REQ O-6), retuning (§4.1), and moving the block's position are each one-expression edits,
  because DEC-LI-03 and DEC-LI-05 concentrated the variability at single points.
- Every FSPEC rule is exercisable without a filesystem or a model (DEC-LI-02), so the unit and
  property suites are fast and the totality property C-7 asks for is writable as stated.
- Byte-identity (AC-4.1, AC-5.1a) holds by construction rather than by vigilance (DEC-LI-05).

**What they make expensive, stated so nobody discovers it later.**

- **PLAN is nearly serial.** Every production task in this feature writes `orchestrate-dev.js`
  (DEC-LI-01), and the batch rule is single-writer-per-batch for both source and test files. PLAN
  owes an explicit per-phase **file-ownership manifest** making that visible, not a prose note, and
  should expect a long batch chain rather than wide waves (TSPEC `T-O-1`).
- **The read cost is unbounded where the injection is bounded** (DEC-LI-06), and because the entry
  refuses a cache, the refusal needs a positive call-count oracle to defend it (`D-O-6`) — the
  Hard-to-reverse decision must not be the undefended one. REQ O-1's live measurement must report
  bytes read per authoring dispatch and probe-vs-full-read counts on the Claude Code channel,
  alongside realised prompt sizes (`T-O-3`); that term, not the injected bytes,
  is the one most likely to move the thresholds.
- **The baseline is a one-way artefact** (DEC-LI-09). Capture must land **before** the first
  production edit, as an ordering obligation with a gate moment that binds — PLAN owes this as a
  `P2-00`-style pre-flight, not a step someone remembers (`T-O-2`).
- **Two `.gitignore`/cleanup obligations are repo-wide in blast radius** (DEC-LI-09), each with its
  own named oracle, because the capture's happy path is green without either.

**Obligations this document hands downstream.**

| # | Obligation | Owner |
|---|---|---|
| D-O-1 | Per-phase file-ownership manifest and a serialised batch chain over `orchestrate-dev.js` | PLAN |
| D-O-2 | Baseline capture ordered before the first production edit, as a binding gate — **and the ordering asserted, not promised**: the guard test checks `git merge-base --is-ancestor <recorded-sha> HEAD` and that `orchestrate-dev.js` at the recorded sha contains none of `selectLearnings`, `gatherLearningsCorpus`, `LEARNINGS_CORPUS_ARGV` (DEC-LI-09) | PLAN + PROPERTIES |
| D-O-3 | Properties over `orderCorpus` (permutation + strict weak ordering), `selectLearnings` (totality; every path appears exactly once across `selected ∪ rejected`), and `extractInjectableMaterial` (byte bound, whole-character prefix, `bounded` exactly when cut **for a bound > 0**) — **plus the zero-bound conjunct**: at `maxBytesPerDocument: 0` the function yields no material and sets no `bounded` flag, and `selectLearnings` drops the document `RSN-NO-MATERIAL` before the count and total bounds so it consumes no slot (FSPEC `BR-6` §"How the per-document bound binds", `E-36`, `AT-30`; shipped as `extractInjectableMaterial`'s `maxBytes <= 0` early return and `selectLearnings`'s `sections.length === 0` branch in `pdlc/workflows/orchestrate-dev.js`). The property must state its bound domain explicitly: a generated bound including `0` under the cut-and-flag rule alone reds against a correct implementation, and one excluding `0` loses the edge with `AT-30` as its only oracle and none at the unit level — **plus totality properties over the three parameterisable parsers DEC-LI-02 declares never-throwing**: `parseLearningsConfig`, `looksLikeLearningsDocument` and `parseHarvestDate` each return for arbitrary generated text, and `parseLearningsConfig` additionally satisfies a per-key invariant that every declared key resolves to either the configured value or its REQ §4.1 default and never to `undefined`. `parseLearningsConfig`'s totality is load-bearing because DEC-LI-07 makes its output the feature's sole gate, so a throw there takes the dispatch down | PROPERTIES |
| D-O-4 | Read-cost reporting alongside prompt-size reporting, and realised sizes reported as **two quantities, not one**: (a) realised **material** bytes per dispatch — the sum of BR-8's *bytes injected*, the only quantity commensurable with REQ §4.1's `maxBytesPerDocument`/`maxTotalBytes`, which FSPEC `BR-6` measures over material alone; and (b) realised **block** bytes — material plus the framing FSPEC charges to no threshold — which is the growth term any future displacement decision would act on. Reporting (b) against §4.1's caps compares incommensurable quantities and would make every conforming block look over-cap by framing, whose size `DEC-LI-08` states as a formula — a 477-byte block constant plus `49 + 2·len(path) + len(feature) + len(orderKey)` per selected document, plus the `ABRIDGED` clause when present — and not as a literal. Neither quantity has a transcribable expected constant: (b) is derived per corpus from that formula, so a report assertion pins the formula's evaluation over the fixture under test, never a number copied from here. This obligation is where the acknowledged C-8 gap is owned; without both quantities the gap has no closing condition | REQ O-1 / operator |
| D-O-5 | The `present` field is reported but never gated on (DEC-LI-07) — IMPL must not reintroduce it as a condition | IMPL |
| D-O-6 | A **positive call-count oracle** over a multi-dispatch run defending the no-cache decision (DEC-LI-06), which is Hard to reverse and otherwise undefended: `_git` enumeration calls **equal** the number of injecting dispatches, and `_readFile` calls for a selected document likewise. Plus the E-32 behavioural cases — a LEARNINGS document landing between dispatch 1 and dispatch 2 appears in dispatch 2's selection, and an enumeration succeeding at dispatch 1 but failing at dispatch 5 records `RSN-UNLISTABLE` at 5. The count conjunct is required on its own: the behavioural case alone is satisfiable by a memo keyed on something that happens to change. Counts are asserted over the **injected Node-channel seams**, not the platform read cache. **This obligation is load-bearing twice over:** because TSPEC §D.1 scopes the corpus-outcome membership test to non-`null` values, the behavioural conjunct here is the **sole falsifier** of a `null` corpus outcome recorded where a catalogued reason was required (DEC-LI-10) — so neither conjunct may be dropped as redundant | PROPERTIES |
| D-O-7 | A `_git` test double that **rejects** (not one returning `{ok: false}`), asserting the dispatch still composes and the corpus outcome records `RSN-UNLISTABLE` (DEC-LI-02, DEC-LI-04). Every double specified elsewhere returns `{ok: false}`, so without this one the fail-open guarantee ships green and untested on the channel that actually runs the pipeline | PROPERTIES + PLAN |
| D-O-8 | A source-level guard over `orchestrate-dev.js` pinning the set of authoring-classified dispatch producers to the set reaching `dispatchAndVerify`, expected set hand-transcribed (DEC-LI-03) | PLAN |
| D-O-9 | ~~TSPEC closes `OQ.2`, retires `ERR-4`, drops the `present`/`sectionMalformed` conjuncts from §I.3 and aligns `LEARNINGS_DEFAULTS` with REQ §4.1 (DEC-LI-07)~~ — **DISCHARGED at TSPEC v0.9**: all four edits landed (§I.3 gates on `config.enabled` alone, `OQ.2` settled, `ERR-4` CLOSED, `LEARNINGS_DEFAULTS.enabled === true`). `AT-31`/`AT-32` may now be authored against §I.3 as written. Retained as a row rather than deleted so the erratum's trace survives | TSPEC (closed) |

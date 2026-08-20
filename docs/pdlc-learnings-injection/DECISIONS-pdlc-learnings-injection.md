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

## DEC-LI-02: A pure selection core with one twelve-line IO shell, not an IO-carrying selector

## DEC-LI-03: One attachment point (`dispatchAndVerify`), gated on two conjuncts, not four call sites

## DEC-LI-04: Corpus enumeration goes through `_git` with a restated pathspec, not `_listFiles` and not an import

## DEC-LI-05: The block is an appended suffix that is `""` when empty, not an insertion

## DEC-LI-06: No feature-owned cache or run-scoped memo

## DEC-LI-07: An absent configuration section is an enabled run, and no configuration mistake disables the feature

## DEC-LI-08: The injection is bounded by static caps only; there is no dynamic prompt budget

## DEC-LI-09: The pre-feature baseline is a committed fixture pinned to a recorded sha, not a recomputed merge-base

## DEC-LI-10: Reason and notice ids are frozen literals, hand-transcribed in tests

## Decisions deliberately NOT taken here

## Consequences

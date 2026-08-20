---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# PROPERTIES — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** — `REQ-pdlc-learnings-injection.md` (v0.9); `FSPEC-pdlc-learnings-injection.md` (v0.10+); `TSPEC-pdlc-learnings-injection.md` (v0.6); `PLAN-pdlc-learnings-injection.md` (v0.4); `DECISIONS-pdlc-learnings-injection.md` |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/learnings*.test.js`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES[-v{N}].md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-20 |

## Overview

**What this document is.** The falsifiable proof system for pdlc-learnings-injection: 47 properties
over the region PLAN §Batches builds, each traced to a REQ acceptance criterion, an FSPEC business
rule or acceptance test, and the PLAN task that reds and greens it. It restates no behaviour —
behaviour lives in REQ v0.9 / FSPEC / TSPEC v0.6 and is referenced by id (`AC-`, `BR-`, `E-`, `AT-`,
`§`). What this document adds is the **oracle**: for each property, the instrument, the operand, the
positive control that proves the instrument fires, and the mutation that must red it.

**Subject, verified at HEAD on `feat-pdlc-learnings-injection` (2026-08-20).** Every premise the
properties below stand on was re-measured against the repository, not read off a document:

| Premise | Measured |
|---|---|
| The attachment point sees both conjuncts | `dispatchAndVerify` destructures `dispatchKind` and `docType` (`pdlc/workflows/orchestrate-dev.js`, `async function dispatchAndVerify({...})`) |
| Four authoring dispatch sites exist, three object-literal and one positional | three `dispatchKind: "authoring"` object-literal sites (`erratumRound`'s `erratumAuthorPrompt` dispatch, `erratumRound`'s land-proof retry, `converge`'s creator) plus one positional `"authoring"` argument at `reviewLoop`'s `runWrapped(optimizer, optPrompt, doc, "authoring", …)` — a literal grep for `dispatchKind: "authoring"` returns **3**, not 4 |
| Phase CR reaches the composition site with `docType: null` | `reviewLoop` call site carrying `phase: "CR"`; `wrapped` re-lists its seams by hand and forwards `docType: roundDocType` |
| Phase H reaches it with `docType: "LEARNINGS"` | the `harvest-learnings` `wrappedDispatch` in `main()`'s Phase H block |
| The corpus predicate is module-private on the sibling side | `consolidate-learnings.js` keeps `LS_FILES_ARGV` module-private and exports `enumerateCorpus(_git)`; the engine vendors only `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` (`pdlc/engine/scripts/prepack.mjs`) |
| Both `_readFile` failure shapes are real | `orchestrate-dev.js`'s `defaultReadFile` returns `null` on a caught error; `runtime-adapter.js`'s `rtReadFile` **throws** on an exhausted probe |
| `buildFinalReport` already carries a run-level notice channel and a conditional spread | its parameter list includes `notices = []`, and its return spreads `...(advisory ? { advisory } : {})` |
| The config path is shared | `export const MERGE_CONFIG_PATH = ".claude/pdlc.config.json"`; `parseAdvisoryConfig` / `readAdvisoryConfigSafely` are the sibling readers |
| The corpus at HEAD is 9 documents, all well-formed | the predicate's own `git ls-files` returns 9 paths; **all 9** open with `# LEARNINGS — {feature}` and **all 9** carry a bare ISO `Date Completed` value |
| Zero line-initial gate tokens in the shipped corpus | no corpus document carries a line-initial `VERDICT:`, `ERRATUM:` or `REVISION-COMPLETE:` line — so PROP-ISOLATE-01's fixture is a deliberate strengthening, never a transcription |
| The baseline worktree is unignored today | `git check-ignore -v .baseline-worktree` exits **1**; `.gitignore` anchors `/.claude/pdlc.config.json` at the root, the idiom PROP-META-02 follows |
| The document-oracle walk sees everything | `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` (`pdlc/workflows/lib/document-oracles.mjs`) |
| No test file of this feature exists yet | a case-insensitive `learnings` listing of `pdlc/workflows/__tests__/` is empty; the repository root has no `scripts/` directory |

**Test pyramid, and why it lands where it does.** TSPEC §T.1's four layers are the shape:

```
        /   L3   \        12 + 2 + 4 ATs — main() under a scripted _agent; no live model
       /----------\       (dispatch universe, config states, footprint, gate isolation)
      /     L2     \      3 ATs — gatherLearningsCorpus / buildLearningsInjector over seams.js doubles
     /--------------\
    /       L1       \    12 ATs + supporting units — pure functions over literal fixtures
   /__________________\   plus L4: one cross-module pin against consolidate-learnings.js
```

There are **no E2E tests and no live model calls at any layer** (AC-6.1). The L3 tier is large for a
feature this size, and deliberately so: five of this feature's claims — the dispatch-universe set
equality, byte-identity against the recorded baseline, the report key's presence/absence, the
filesystem footprint and gate-input isolation — are *whole-run* claims that no injectable unit can
falsify. Pushing them down would produce green tests over a structurally unfalsifiable seam, which
is the failure mode the oracle checklist names. Everything that *can* be falsified at L1 is at L1.

**Scope boundary.** These properties cover the region between LI-15's sentinel comments in
`pdlc/workflows/orchestrate-dev.js`, the four hand-plumbed seam hops, `.gitignore`'s one added rule,
`scripts/capture-learnings-baseline.mjs`, and the fourteen new test files PLAN §File-ownership
manifest names. `consolidate-learnings.js` is **driven, never edited** — it is the pin's subject.
No SKILL.md text moves (BR-16).

**Property id grammar.** `PROP-{DOMAIN}-{NN}`, domains being `DISPATCH`, `CORPUS`, `ORDER`,
`BOUND`, `BLOCK`, `RECORD`, `FAILOPEN`, `CONFIG`, `ISOLATE`, `FOOTPRINT`, `META`. `META` properties
are the ones whose subject is the test apparatus itself (the baseline, the pin, the suite-map
closure, the arm inventory) — they are properties because PLAN gives each an owning task and an
oracle, and because three of them guard oracles that would otherwise silently stop firing.

## Properties

Every row carries: the property, its **Category** and **Test level**, the upstream ids it traces to,
and the PLAN task that **reds** it and the task that **greens** it. A property with no owning task is
a defect in this document or in the PLAN, not a nice-to-have.

### Group A — The dispatch universe *(BR-1, AC-1.1, AC-1.2, AC-1.4; TSPEC §A.2)*

- **PROP-DISPATCH-01:** `dispatchAndVerify` **must** compose a prior-feature LEARNINGS block when,
  and only when, **both** `dispatchKind === "authoring"` **and** `docType ∈ LEARNINGS_TARGET_DOCTYPES`
  (`REQ`, `FSPEC`, `TSPEC`, `PLAN`, `DECISIONS`, `PROPERTIES`) hold at composition time.
  *Contract / Integration · L3 · AC-1.1, AC-1.2, BR-1, AT-01, AT-02 · red LI-11 · green LI-20.*
- **PROP-DISPATCH-02:** The set of `docType` values observed **at the composition site** over a full
  scripted run **must equal** `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}`, and the set for which
  `injectHere` returned true **must equal** `LEARNINGS_TARGET_DOCTYPES` — both as equality, never
  containment, both operands hand-transcribed.
  *Contract · L3 · AC-1.2, NG-5, TSPEC §A.2 consequence (b) · red LI-11 · green LI-20.*
- **PROP-DISPATCH-03:** Every dispatch **outside** BR-1's rule — reviews, implementation, DoD
  verification and remediation, harvest, ship, advisory seams, **and** the authoring-classified Phase
  CR optimizer whose `docType` is `null` — **must** compose a prompt byte-identical to the recorded
  pre-feature baseline.
  *Contract · L3 · AC-1.2, AC-4.3, BR-11, AT-03 · red LI-11 · green LI-20.*
- **PROP-DISPATCH-04:** The injector **must** be invoked exactly **once per authoring episode**, before
  `dispatchAndVerify`'s `for(;;)` loop — never once per loop iteration — even where the corpus moves
  between iterations.
  *Idempotency · L3 · TSPEC §A.2 property 2, §T.6 `RETRY-ITERATION` · red LI-11 · green LI-20.*
- **PROP-DISPATCH-05:** A dispatch carrying a block **must** carry its existing `basePrompt`,
  `PACING_CONTRACT_CLAUSE` and `opener` unchanged, in their existing relative order, with the block
  appended as a pure suffix; nothing existing is shortened, reordered or removed.
  *Contract · L3 · AC-1.4, C-8, BR-7, AT-06 · red LI-11 · green LI-20.*
- **PROP-DISPATCH-06:** `renderLearningsBlock({selected})` **must** return **exactly** `""` — not a
  header, not a marker, not whitespace — when `selected` is empty, so that an empty corpus, an
  unlistable corpus and an admits-nothing configuration each yield a character-for-character
  pre-feature prompt.
  *Functional · L1 · AC-4.1, AC-4.4, AT-24, TSPEC §A.2 property 3 · red LI-08 · green LI-17.*
- **PROP-DISPATCH-07:** The `_recordDocType` probe seam **must** be plumbed through all five
  hand-written hops (`main`'s params, the `wrapperSeams` object literal, `reviewLoop`'s params,
  `reviewLoop`'s `wrapped` closure, `dispatchAndVerify`'s params) and **must** default to a no-op at
  each, so an uninstrumented run is byte-unchanged.
  *Integration · L3 · TSPEC §A.2 consequence (d), AC-4.3 · red LI-11 · green LI-20.*

### Group B — Corpus enumeration, eligibility and read outcomes *(BR-2, BR-3, C-3, O-7)*

- **PROP-CORPUS-01:** `LEARNINGS_CORPUS_ARGV`, the argv `consolidate-learnings.js`'s `enumerateCorpus`
  actually hands `_git`, and `consolidationPredicate.test.js`'s own transcribed literal **must** be
  mutually equal — a three-way agreement, never two-way.
  *Contract · L4 · C-3, O-7, F-O-4, TSPEC §I.1 `LI-T-PIN-1` · red LI-13 · green LI-15.*
- **PROP-CORPUS-02:** `gatherLearningsCorpus` **must** make exactly **one** `_git(LEARNINGS_CORPUS_ARGV)`
  enumeration call per authoring dispatch, and **must not** reach the filesystem by any path other than
  `_git` and `_readFile`.
  *Contract · L2 · AC-5.2, BR-15, TSPEC §A.3 · red LI-09 · green LI-18.*
- **PROP-CORPUS-03:** A LEARNINGS document nested at `docs/discarded/{p}/LEARNINGS-*.md` **must not** be
  selected and **must not** appear in any record — *and* a document directly at
  `docs/discarded/LEARNINGS-x.md` **must** be a corpus member, be selected, and carry **no** exclusion
  reason. The two clauses are one property: the second is the positive control for the first.
  *Data Integrity · L1 (clauses 1, 4) + L2/L3 (clauses 2, 3) · AC-2.6, E-07, E-35, AT-15 · red LI-07 ·
  green LI-16 (eligibility clauses), LI-19 (`RSN-EMPTY` and no-record clauses).*
- **PROP-CORPUS-04:** A document under `docs/completed/{p}/` **must** be eligible on terms identical to
  one under `docs/{p}/`; archival location **must** affect rank only through BR-4's path tiebreak.
  *Data Integrity · L1 · AC-2.6, E-20, AT-16 · red LI-07 · green LI-16.*
- **PROP-CORPUS-05:** `{f}`'s own LEARNINGS **must** be excluded by feature directory
  (`docs/{f}/…` or `docs/completed/{f}/…`), decided from the path **before any read**; it **must**
  appear as an `RSN-SELF` row, its path **must never** be passed to `_readFile`, and the dispatch
  **must not** record corpus-level `RSN-EMPTY` — a document *was* known.
  *Data Integrity / Security-of-scope · L1 + L2 · AC-1.3, C-2, E-06, E-31, AT-04, TSPEC §D.6 ·
  red LI-07 · green LI-16.*
- **PROP-CORPUS-06:** Each surviving candidate **must** resolve to exactly one of three outcomes and no
  other: eligible; `RSN-UNREADABLE` where `_readFile` returns `null` **or** throws (both shapes are
  real); `RSN-UNPARSEABLE` where it reads but does not present a LEARNINGS document.
  *Error Handling · L2 · AC-4.2, BR-3, E-03, E-04, E-08, AT-26, AT-27 · red LI-09 · green LI-18.*
- **PROP-CORPUS-07:** `looksLikeLearningsDocument` **must** accept a document missing later sections and
  a document truncated mid-body (its first line survives), and **must** reject a file whose first
  non-blank line is not a level-1 `LEARNINGS` heading. No `RSN-TRUNCATED` id **must** ever be emitted.
  *Functional · L1 · BR-3, E-19, E-33, F-O-1, TSPEC §D.3 · red LI-07 · green LI-16.*
- **PROP-CORPUS-08:** `gatherLearningsCorpus` **must never** throw past `dispatchAndVerify`: an
  exception raised anywhere inside it — including from a seam — **must** resolve to
  `{unlistable: true}` and corpus-level `RSN-UNLISTABLE`.
  *Error Handling · L2 · C-7, BR-12 last row, TSPEC §T.7 · red LI-09 · green LI-18.*

### Group C — Ordering *(BR-4, AC-2.2, AC-2.5, C-5)*

- **PROP-ORDER-01:** `orderCorpus` **must** order by `orderKey` **descending with `null` last**, then by
  **UTF-8 byte order over the repository-relative path ascending** — compared with `Buffer.compare`,
  not JavaScript's `<`/`>` code-unit comparison — yielding a **total** order over the eligible set.
  *Functional · L1 · AC-2.2, BR-4, E-11, AT-09, TSPEC §D.4 · red LI-07 · green LI-16.*
- **PROP-ORDER-02:** `parseHarvestDate` **must** return the ISO `YYYY-MM-DD` prefix of the harvest
  metadata `Date Completed` cell — including where trailing free text follows it — and `null` where the
  row is absent or the value is not an ISO prefix. A `null` key **must never** make a document
  ineligible.
  *Data Integrity · L1 · BR-4, E-12, E-13, E-14, AT-10 · red LI-07 · green LI-16.*
- **PROP-ORDER-03:** The ordering **must** be a pure function of `(orderKey value, path)` and nothing
  else: permuting every corpus file's mtime, reversing git commit order and ctime order against the
  `Date Completed` order, and moving the wall clock between two compositions **must** leave the selected
  set and its order identical.
  *Idempotency · L1 · AC-2.2, AC-2.5, C-5, BR-4 negative invariants, AT-10 · red LI-07 · green LI-16.*
- **PROP-ORDER-04:** The ordering **must not** construct a `Date` object, read a clock, or consult git
  history, filesystem timestamps or a model's judgement. Keys are compared as **strings**.
  *Security-of-determinism · L1 · C-5, NG-2, BR-4, TSPEC §D.4 · red LI-07 · green LI-16.*
- **PROP-ORDER-05:** Two compositions of the same document type over an identical repository state, made
  in **two separate process invocations**, **must** produce byte-identical blocks including order.
  *Idempotency · L3 · AC-2.5, AT-14 · red LI-11 · green LI-20.*

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Obligations and Routed Errata

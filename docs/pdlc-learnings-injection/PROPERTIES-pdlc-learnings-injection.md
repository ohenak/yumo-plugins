---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# PROPERTIES — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** — `REQ-pdlc-learnings-injection.md` (v0.9); `FSPEC-pdlc-learnings-injection.md` (v0.13 — this revision is grounded on the v0.13 erratum: E-36, BR-6's material-only accounting basis and zero-bound clause, F-O-1's two heading rules); `TSPEC-pdlc-learnings-injection.md` (v0.9 — §D.3's section matcher and extent-assembly rule absorbed here); `PLAN-pdlc-learnings-injection.md` (v0.7 — LI-12's three-case AT-30 still matches PROP-CONFIG-09; the *Amendment commits on landed suites (P-A-7)* two-case table was added at **v0.6** and is unchanged at v0.7, whose own changelog row instead names LI-16 the owner of TSPEC §D.5's zero-bound production half, gives LI-AT-30 conjunct (iii) its fixture precondition, records ERR-8 and relocates LI-08's amendment note; both absorbed in §C.4 and §G.3); `DECISIONS-pdlc-learnings-injection.md` |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/learnings*.test.js`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES[-v{N}].md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.6 | 2026-08-21 |

## Overview

**What this document is.** The falsifiable proof system for pdlc-learnings-injection: **70 properties**
over the region PLAN §Batches builds, each traced to a REQ acceptance criterion, an FSPEC business
rule or acceptance test, and the PLAN task that reds and greens it. It restates no behaviour —
behaviour lives in REQ v0.9 / FSPEC v0.13 / TSPEC v0.9 and is referenced by id (`AC-`, `BR-`, `E-`, `AT-`,
`§`). What this document adds is the **oracle**: for each property, the instrument, the operand, the
positive control that proves the instrument fires, and the mutation that must red it.

**Subject, verified at HEAD on `feat-pdlc-learnings-injection` (2026-08-20).** Every premise the
properties below stand on was re-measured against the repository, not read off a document. The table
is a **capture-time measurement, not a standing invariant**: two of its rows are falsified on schedule
by this PLAN's own tasks (LI-04 adds the `/.baseline-worktree/` ignore rule; LI-07…LI-14 create the
`learnings*` test files), which is exactly why PROP-META-01 forbids the premises suite from asserting
any absence claim of this table.

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
        /   L3   \        16 ATs — main() under a scripted _agent; no live model
       /----------\       (learningsDispatchSet 12 + learningsConfig 2 + AT-20/AT-22)
      /     L2     \      3 ATs — gatherLearningsCorpus over seams.js doubles (learningsCorpus)
     /--------------\
    /       L1       \    16 ATs + supporting units — pure functions over literal fixtures
   /__________________\   (learningsSelect 9 + learningsBlock 3 + learningsRecord's remaining 4)
                          plus L4: one cross-module pin against consolidate-learnings.js
```

The split is TSPEC §T.5's, taken suite by suite: 16 / 3 / 16 = 35. `learningsRecord.test.js`
**straddles** — §T.5 puts AT-20 and AT-22 at L3 over the `DIVERGENT-CORPUS` run and its other four
ATs at L1/L2 — which is why no single row of §C.1's partition maps one-to-one onto a layer.

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
- **PROP-DISPATCH-03:** Every dispatch that **reaches the composition site** and is **rejected** by
  `injectHere` — reviews, harvest, and the authoring-classified Phase CR optimizer whose `docType` is
  `null` — **must** compose a prompt byte-identical to the recorded pre-feature baseline. The operand
  is the set of `dispatchAndVerify` episodes whose `(dispatchKind, docType)` pair fails `injectHere`,
  observed on the `_recordDocType` probe of PROP-DISPATCH-07 — **not** an enumeration of pipeline
  phases. Implementation, DoD verification and remediation, and ship dispatches are **excluded from
  this property by construction** and are covered by PROP-DISPATCH-08 instead: the code composing the
  block is not on their path, so asserting byte-identity for them is a tautology rather than an
  oracle.
  *Contract · L3 · AC-1.2, AC-4.3, BR-11, AT-03 · red LI-11 · green LI-20.*
- **PROP-DISPATCH-08** *(structural, replaces the tautological half of PROP-DISPATCH-03):* The
  wave-mode `se-implement`/`se-author` dispatches, the DoD verify/remediate pair and the `ship-pr`
  rebase/PR calls **must not** reach `dispatchAndVerify` at all: `dispatchAndVerify` **must** have
  exactly **two** call sites — `reviewLoop`'s `wrapped` closure and `main()`'s `wrappedDispatch` —
  asserted as a hand-transcribed set equality keyed by `(enclosing named function, call-site form)`
  over a static parse of `orchestrate-dev.js`, and the four outside dispatch families **must** each be
  shown to call `agentFn` directly. Measured at HEAD: the wave path calls
  `agentFn("se-implement", waveImplementPrompt(task, featureName), …)` directly, and the module's own
  `PHASE_DISPATCH` comment names the four families that "sit outside" the `converge()` primitive. This
  converts four unfalsifiable byte-identity conjuncts into one invariant: if a later change routes
  implementation or DoD through `dispatchAndVerify`, this property reds and someone must decide
  whether those dispatches inherit injection.
  *Contract · L3 (static) · AC-4.3, BR-11, NG-5 · red LI-11 · green LI-20.*
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

- **PROP-CORPUS-01** *(home: `__tests__/learningsPredicatePin.test.js`, new at LI-13; subject:
  `consolidationPredicate.test.js`, existing and **never edited** — editing it would collapse the
  three-way agreement into a two-way one):* `LEARNINGS_CORPUS_ARGV`, the argv `consolidate-learnings.js`'s `enumerateCorpus`
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
- **PROP-CORPUS-09** *(totality, generated — discharges TSPEC T-O-5):* For **any**
  `{entries, feature, thresholds}` drawn from the fixture generators — including an empty corpus, an
  all-self corpus, all-unreadable entries and zero-valued thresholds — `selectLearnings` **must** return
  without throwing, and every input path **must** appear **exactly once** across `selected ∪ rejected`:
  the two sets partition the input, never overlapping and never losing a path silently.
  *Data Integrity · L1 (parameterised) · C-7, BR-12, TSPEC T-O-5, §D.6 · red LI-07 · green LI-16.*

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
- **PROP-ORDER-06** *(generated — discharges TSPEC T-O-4):* For **any** permutation of a fixed
  `(orderKey, path)` multiset including `null` keys and duplicate keys, `orderCorpus`'s output **must**
  be a **permutation of its input** (same multiset, no loss, no duplication) and its comparator **must**
  be a strict weak ordering — irreflexive, antisymmetric and transitive — so the result is invariant
  under input permutation. This is the mechanical form of BR-4's "total order over the eligible set";
  PROP-ORDER-01 pins the *direction* of that order by example, this one pins its *algebra*.
  *Functional · L1 (parameterised) · AC-2.2, BR-4, TSPEC T-O-4, §D.4 · red LI-07 · green LI-16.*

### Group D — Bounds *(BR-5, BR-6, AC-2.1, AC-2.3, AC-2.4)*

- **PROP-BOUND-01:** The number of documents contributing to any dispatch **must** be at most
  `maxDocuments` for every corpus size `N`. Under the `COUNT-BINDING` fixture (8 documents, one
  200-byte priority section each, `maxDocuments: 3`) exactly **3** documents **must** contribute and
  exactly **5** **must** carry `RSN-COUNT`.
  *Functional · L1 · AC-2.1, BR-5, E-09, E-10, AT-07, AT-08, F-O-7, TSPEC §T.4 · red LI-07 ·
  green LI-16.*
- **PROP-BOUND-02:** Under the mirror `BYTES-BINDING` fixture (8 documents of 7,000 injectable bytes
  under §4.1's declared values) the contributing count **must** be strictly below `maxDocuments`, with
  `RSN-BYTES` rows and **no** `RSN-COUNT` row — so each bound is asserted where it binds *and* asserted
  not to bind where the other does.
  *Functional · L1 · AC-2.1, BR-5, AT-07 · red LI-07 · green LI-16.*
- **PROP-BOUND-03** *(stated over every non-negative `maxBytesPerDocument`, zero included)*: A document
  whose material exceeds a **positive** `maxBytesPerDocument` **must** contribute material of at most that
  bound, **must** carry `bounded: true` decided at the cut, and the cut **must** be character-safe — the
  longest character prefix whose UTF-8 length is ≤ the bound, never splitting a codepoint. **At
  `maxBytesPerDocument <= 0` the carve-out conjunct holds instead, and it is positive rather than an
  exclusion:** `extractInjectableMaterial(text, maxBytes)` tests the bound *before* the cut and **must**
  return `{material: "", bounded: false, bytes: 0, sections: []}` for every `text`, including one carrying
  all five priority sections (TSPEC §I.3's `extractInjectableMaterial` JSDoc contract, "`maxBytes <= 0`
  short-circuits BEFORE the cut"; TSPEC §D.5 states the same return). No cut occurs, so `bounded` is
  **false** — the "bounded exactly when cut" conjunct holds precisely because nothing was taken — and no
  `maxDocuments` slot question arises at this altitude at all: the drop and its `RSN-NO-MATERIAL` reason
  (FSPEC E-36, BR-9) are the **caller's** decision, observable only in a finished report. That run-level
  half is owned by **PROP-CONFIG-09**. The two properties **partition** §D.5's inputs rather than
  duplicating each other: this one owns the unit's return shape at a zero bound, PROP-CONFIG-09 owns the
  reason id and the unconsumed slot. §O.9's generated T-O-6 arm keeps `0` in its domain for the same
  reason (TSPEC, Named obligations carried forward, T-O-6: "State the zero conjunct, keep `0` in the domain"). The zero case costs one
  added case in `pdlc/workflows/__tests__/learningsBlock.test.js` (landed, 7.6 K) under the **existing**
  LI-08 red / LI-17 green tasks — no new fixture, no new PLAN task, no new AT id, no new property id.
  *Data Integrity · L1 · AC-2.3, AC-4.4, BR-6, E-15, E-16, E-36, AT-11, AT-12, TSPEC §D.5, §I.3 · red LI-08 · green LI-17.*
- **PROP-BOUND-04:** Where the accumulated material would exceed `maxTotalBytes`, whole documents
  **must** be dropped from the **low end** of BR-4's order with `RSN-BYTES`; no document is ever cut
  mid-document to make the total fit; the selected set **must** be a **prefix** of the ordered eligible
  set; and no count-cut document **must** be back-filled into a freed slot.
  *Data Integrity · L1 · AC-2.4, BR-5 no-back-fill, BR-6, E-17, E-18, AT-13 · red LI-07 · green LI-16.*
- **PROP-BOUND-05:** The material taken from an unbounded document **must** be exactly BR-6's five
  priority sections that the document carries, **as an ordered sequence in priority order**
  (`Cross-Feature Patterns`, `Non-Convergences`, `Rejected Proposals (with rationale)`,
  `Process Learnings`, `Open Items for Consolidation` — FSPEC BR-6's names verbatim), and
  the Approval Record's text **must** be absent while all five present sections' texts **must** be
  present — both conjuncts, so the oracle is not vacuous on a fixture that never carried the excluded
  section. **The oracle reads the rendered block, not the extractor's own report** (TSPEC v0.9):
  scan `renderLearningsBlock`'s output for `SECTION_HEADING_RE` lines, map each through §D.3's
  matching rule to a canonical name, and assert the resulting list equals — as an **ordered** list —
  the **priority-ordered intersection** of `BR6_SECTION_NAMES` with the headings the fixture document
  actually carries, hand-transcribed for the fixture at hand rather than derived at runtime. On AT-11's
  fixture, which carries all five, that intersection *is* the full `BR6_SECTION_NAMES` catalogue
  (TSPEC states it that way for AT-11); on any narrower fixture it is the proper sub-list. "In priority
  order" is part of the claim, not a presentation detail. The
  Approval Record conjunct is asserted on a marker string occurring nowhere else in the corpus, and
  the five presence conjuncts on each section's **body** marker rather than its heading, so a
  renderer that emits a taken section's heading without its body reds. `sections[]` is asserted
  **in addition**, as a supporting equality, **never instead**: it is the producer's own report, and
  per DC-14 an oracle does not take its expected value from the code under test.
  *Data Integrity · L1 · AC-2.3, BR-6, E-19, AT-11, TSPEC §D.3, §T.5 · red LI-08 · green LI-17.*
- **PROP-BOUND-06:** A document that **yields no material** — BR-9's stated meaning, in both its
  disjuncts: it "carries none of BR-6's priority sections, **or** the per-document bound is zero and
  admits none" — **must** carry `RSN-NO-MATERIAL`, **must** consume no `maxDocuments` slot, **must
  not** be flagged bounded, and the rest of the corpus **must** be used normally. Both disjuncts
  **must** be driven, by the paired fixtures §F.1 names: `NO-MATERIAL` (all five sections absent,
  Approval Record present) drives the carries-no-section arm, and `ZERO-BOUND` (a document that
  **carries** material, run at `maxBytesPerDocument: 0`) drives the zero-bound arm. The pairing is
  what makes the reason id's *meaning* falsifiable rather than one of its routes: an implementation
  reaching `RSN-NO-MATERIAL` by testing "document carries no section" greens on `NO-MATERIAL` and
  reds on `ZERO-BOUND`, and the run-level shape of the second arm is PROP-CONFIG-09's.
  *Functional · L1 · BR-6, BR-9, D-12, E-33, E-36, AT-28, AT-30 · red LI-07 · green LI-16.*
- **PROP-BOUND-07:** All three §4.1 byte thresholds **must** range over one pool — **material only**.
  `bytesInjected` for a row **must** equal the **hand-computed literal** byte count of that document's
  declared sections in the fixture, transcribed at fixture-authoring time; `totalBytesInjected`
  **must** equal the hand-computed sum of those literals; and per-document framing (opener, `ABRIDGED`
  annotation, closer) and block framing (header, preamble, trailer) **must** be charged to **no** bound
  and to no row. Neither expected value may be written as an expression over the implementation's own
  output — `bytesInjected === Buffer.byteLength(material)` where `material` is what the extractor
  returned is an identity no implementation can fail, and an implementation charging framing to every
  row **and** to the total satisfies it, which is exactly mutation M-5. The framing cost of the fixture
  is stated as its own literal beside the material counts, so the test proves the two numbers **differ**
  — that difference is what M-5 reds. FSPEC BR-6 and TSPEC §D.5 now **agree** on this basis — BR-6's
  *byte-accounting basis* paragraph makes contributed bytes "its **material** — the section headings
  and bodies taken from it, and nothing else", with framing counting "toward none of the three
  quantities" — so this property is a compression of both, and M-5 is a mutation away from both.
  **The hand-computed literal is now a mechanical sum, not a judgement call** (TSPEC v0.9 §D.3):
  each taken extent is normalised (trailing blank/whitespace-only lines dropped, no trailing
  newline, interior blank lines preserved verbatim), the normalised texts are joined **in priority
  order** with exactly `"\n\n"`, and the character-safe cut applies **once, to the assembled
  string** — never per extent. So `bytes` **must** equal the sum of each taken section's normalised
  byte length **plus 2 bytes per join** (`n` sections ⇒ `n − 1` joins), with neither a leading nor a
  trailing newline inside `material`. A fixture author recomputing the literal follows that
  procedure; two conforming implementations cannot differ on it, which is what keeps a literal
  fixture from redding a correct implementation.
  *Data Integrity · L1 · AC-2.3, AC-2.4, BR-6, TSPEC §D.3, §D.5 · red LI-08 · green LI-17.*
- **PROP-BOUND-08** *(real-corpus arm — the recognition rule):* Driven over a **real** corpus document
  read from the live `LEARNINGS_CORPUS_ARGV` `git ls-files` output (first path in UTF-8 byte order, not
  a synthetic fixture), the canonical section set recovered from the **rendered block** — per
  PROP-BOUND-05's oracle, with `extractInjectableMaterial`'s `sections[]` asserted only as the
  supporting equality TSPEC §T.5 demotes it to — **must** equal the intersection of BR-6's five names
  with the headings that document actually carries under §D.3's matching rule, and **must** exclude
  its `## 6. Approval Record`. The observed set **must** be non-empty, and the
  document's own heading lines **must** be asserted present in the fixture text — the positive-presence
  conjunct that stops the property greening over a document whose headings the matcher never saw.
  Measured at HEAD: all 9 corpus documents carry `## 1. Non-Convergences`, `## 2. Cross-Feature
  Patterns`, `## 3. Rejected Proposals (with rationale)`, `## 4. Process Learnings` and
  `## 5. Open Items for Consolidation`. This is the arm that defeats the fixture-and-matcher-drift
  mutation: a matcher written against a wrong heading spelling greens on every synthetic fixture
  written to the same wrong spelling, and yields `RSN-NO-MATERIAL` on every real document. A synthetic
  fixture structurally cannot falsify it. Carries **no** FSPEC AT id — a supporting test in
  `learningsBlock.test.js`, so §T.5's 35-member partition and `LI-T-SUITEMAP`'s disjointness are
  unchanged.
  *Data Integrity · L1 (real corpus, read-only) · AC-2.3, BR-6, F-O-1, TSPEC §D.5 · red LI-08 ·
  green LI-17.*

### Group E — The rendered block *(BR-7, AC-1.4, F-O-2, TSPEC §OQ.1)*

- **PROP-BLOCK-01:** The block's header and four-sentence advisory preamble **must** be byte-equal to
  TSPEC §OQ.1's fixed wording, transcribed literally into the test — never keyword-matched — and that
  wording **must** state BR-7's three things: prior-feature context, neither a requirement of `{f}` nor
  an upstream document to be traced, and disregardable without leaving a gap.
  *Contract · L1 · AC-1.4, C-4, BR-7, AT-05, F-O-2 · red LI-08 · green LI-17.*
- **PROP-BLOCK-02:** Each contributing document **must** be delimited by
  `<<< {path} — feature {p}, completed {d} >>>` and `<<< end {path} >>>`, carrying the
  `(ABRIDGED: bounded at {n} bytes)` annotation **iff** that document's row carries `bounded: true` —
  asserted in both directions, so neither a missing annotation on a bounded document nor a spurious one
  on an unbounded document passes.
  *Observability · L1 · AC-2.3, BR-6, BR-7, AT-05, AT-11 · red LI-08 · green LI-17.*
- **PROP-BLOCK-03:** A non-empty block **must** be prefixed with `\n\n`, and the source path in every
  delimiter **must** be the document's repository-relative path — the trace AC-3.4 and BR-13 give an
  operator in place of an erratum channel.
  *Observability · L1 · AC-3.4, BR-7, BR-13, TSPEC §OQ.1 · red LI-08 · green LI-17.*

### Group F — The report record *(BR-8, BR-9, BR-10, AC-3.1, AC-3.2, AC-3.3, C-9)*

- **PROP-RECORD-01:** The key set of each selected-document row **must equal** exactly
  `{sourcePath, position, bytesInjected, bounded}` — set equality over `Object.keys(rows[i])`, never
  containment; `phaseId`, `docType`, `mode`, `corpusOutcome`, `orderKeys` and `corpusDiverged` sit
  outside it by construction.
  *Contract · L1/L2 · AC-3.1, BR-8, AT-17, DC-01 · red LI-10 · green LI-19.*
- **PROP-RECORD-02:** A dispatch that injected nothing **must** carry an **empty set of rows** and a
  present `totalBytesInjected` of `0` — never a missing field. "Nothing was selected" and "nothing was
  recorded" **must** be distinguishable in a serialised report.
  *Observability · L1/L2 · AC-3.1, BR-8, AT-18, AT-21, AT-30 · red LI-10 · green LI-19.*
- **PROP-RECORD-03:** `rejected[]` **must** be **total over the entries the dispatch knew**, including
  entries the shell never opened: every known document **must** appear either as a BR-8 row or as
  exactly one per-document reason row, `excluded` **must** be tested before `readOk` so a self document
  is never mis-reported as `RSN-UNREADABLE`, and the set of reason ids the whole suite ever observes
  **must equal** `LEARNINGS_REJECT_REASONS` — six members, hand-transcribed.
  *Contract / Observability · L1/L2 · AC-3.2, BR-9, AT-19, C-9 · red LI-10, LI-23 · green LI-19, LI-21.*
- **PROP-RECORD-04:** `dispatches[i].corpusOutcome` **must** be the per-dispatch oracle locus for
  corpus-level outcomes; the set of **non-`null`** values ever observed **must equal**
  `LEARNINGS_CORPUS_OUTCOMES` (`RSN-UNLISTABLE`, `RSN-EMPTY`), and the **healthy** value **must** be
  asserted positively as `null` — not merely "not one of the two" — on `DIVERGENT-CORPUS` dispatches
  **1, 2 and 4**, so an implementation recording `undefined`, `""` or omitting the key reds.
  *Observability · L2/L3 · AC-3.2, BR-9, AT-20, TSPEC §D.1, §D.2 · red LI-10, LI-23 · green LI-19, LI-21.*
- **PROP-RECORD-05:** Where a corpus-level outcome is recorded for a dispatch, **that dispatch's** BR-8
  rows **must** be present and empty; a corpus-level outcome **must never** suppress the rows key.
  *Observability · L2/L3 · AC-3.2, BR-9, AT-21 · red LI-10 · green LI-19.*
- **PROP-RECORD-06:** `dispatches[i].orderKeys` **must** carry one entry per corpus document **as that
  dispatch observed it**, with key set equality over `Object.keys(orderKeys[j])` = `{path, orderKey}`,
  and `orderKey: null` **must** be a **present key carrying JSON `null`** — never an omitted key — so
  "absent or unparseable" and "not recorded" stay distinguishable.
  *Contract · L1/L2 · AC-3.3, BR-10 locus 1, AT-22 · red LI-10 · green LI-19.*
- **PROP-RECORD-07:** `learningsInjection.ruleInputs.thresholds` **must** be built **once per run** from
  the parsed configuration, and its key set **must equal** exactly
  `{maxDocuments, maxBytesPerDocument, maxTotalBytes}` — BR-10's second locus, with its own completeness
  test.
  *Contract · L3 · AC-3.3, BR-10 locus 2, AT-22, E-26 · red LI-10 · green LI-21.*
- **PROP-RECORD-08:** The three catalogues **must** be disjoint **in kind** across **four** field
  domains — `rejected[].reason`, `dispatches[i].corpusOutcome`, `runMirror.corpusOutcome`,
  `notices[].id` — and no id **must** appear in another domain's position. The two corpus-outcome
  domains' membership tests read `v === null || catalogue.includes(v)`; the other two carry no `null`.
  *Contract · L1/L2 · AC-3.2, BR-9, AT-20, TSPEC §D.1 · red LI-10 · green LI-19.*
- **PROP-RECORD-09** *(negative, about the test suite — instrumented as a static scan):* **No** test
  **must** assert on `runMirror`'s value. It is additive by upstream decision, its value is
  deliberately unconstrained, and an implementation omitting it entirely conforms — a test pinning it
  reds a conforming implementation. **Instrument:** the same static directory walk PROP-META-05 and
  PROP-META-06 use in `learningsSuiteMap.test.js` — enumerate `__tests__/learnings*.test.js` from disk,
  parse each file's text, and assert **no** file contains a `runMirror` reference in an assertion
  position. Its positive control is the walk's own non-empty file set, asserted set-equal to the
  enumerated suites (PROP-META-05's operand), so a walk that finds no files reds rather than passing
  over zero bytes. Its subject is the suite, not the production code, which is why it is green on
  authoring at LI-14 and has no red predecessor.
  *Contract · L1 (static) · AC-3.2, AC-3.3, BR-9, BR-10, TSPEC §D.2, §T.6 · red — (green on
  authoring) · green LI-14.*
- **PROP-RECORD-10:** An operator holding **only** the report **must** be able to reproduce a named
  dispatch's selection: the expected selection (paths, in order) is transcribed by hand and committed
  with the fixture, and the test **must** neither call the production selector nor reimplement it.
  `corpusDiverged` **must** be `true` on exactly `DIVERGENT-CORPUS` dispatches 3 and 5, and **`false`,
  never `null`,** on the first dispatch of a run.
  *Observability · L3 · AC-3.3, BR-10, E-32, AT-18, AT-22, TSPEC §A.5, §T.6 · red LI-10 · green LI-19.*
- **PROP-RECORD-11** *(negative):* **No** erratum round **must** be opened against any upstream document
  of `{f}` on account of an injected LEARNINGS document, and the set of author-emitted channels the run
  requires **must equal** the recorded pre-feature baseline set — no new channel appears. The only trace
  of an injected document is BR-8's rows naming source paths.
  *Contract · L3 · AC-3.4, C-6, BR-13, AT-23 · red LI-11 · green LI-21.*

### Group G — Fail-open under every corpus state *(BR-12, C-7, AC-4.1, AC-4.2)*

- **PROP-FAILOPEN-01:** All **twelve** fail-open arms of TSPEC §T.7 **must** be entered by the suite,
  and the arms' observed vocabulary **must** be set-equal to the three frozen catalogues:
  non-`null` `corpusOutcome` values = `LEARNINGS_CORPUS_OUTCOMES`, `rejected[].reason` values =
  `LEARNINGS_REJECT_REASONS`, `notices[].id` values = `LEARNINGS_NOTICES`. Set equality in every case,
  so an arm that silently stops being entered **and** an invented code both red.
  *Error Handling / Observability · L2/L3 · C-7, C-9, BR-12, TSPEC §T.7, DoD 3 · red LI-23 · green LI-21.*
- **PROP-FAILOPEN-02:** **No** corpus state — directory absent, listing failing, one document unreadable,
  every document unreadable, unparseable, truncated, no priority section, or exceeding every bound —
  **must** produce an exception escaping to the pipeline, a halt, a POSTMORTEM, or a changed convergence
  outcome. The run **must** reach the same terminal outcome as the disabled run over the same fixture.
  *Error Handling · L3 · G-4, C-7, AC-4.2, BR-12, AT-25 · red LI-11 · green LI-21.*
- **PROP-FAILOPEN-03:** `RSN-UNLISTABLE` and `RSN-EMPTY` **must** stay distinct: a failed listing
  **must** record `RSN-UNLISTABLE`, an empty successful listing **must** record `RSN-EMPTY`, and neither
  **must** be substitutable for the other. "I could not find out" **must never** collapse into "there is
  nothing". Both are observed on the same fixture family, so the distinction is a positive result rather
  than an absence.
  *Error Handling · L2/L3 · C-7, BR-12, E-01, E-02, AT-24, AT-25 · red LI-09, LI-11 · green LI-18, LI-20.*
- **PROP-FAILOPEN-04:** Documents were-known states **must not** produce a corpus-level id: a corpus
  containing only `{f}`'s own LEARNINGS, and a corpus every document of which is unreadable, **must**
  record per-document rows with `corpusOutcome === null`, not `RSN-EMPTY`.
  *Error Handling · L1/L2 · E-06, E-08, AT-04, AT-26 · red LI-07, LI-09 · green LI-16, LI-18.*

### Group H — Configuration *(BR-14, AC-4.4, AC-5.1a, AC-5.1b, AC-5.1c)*

- **PROP-CONFIG-01:** An **absent** `learningsInjection` section, an **absent** config file, and a
  **misspelt** section name (`learningsInjectoin`) **must** each yield an **enabled** run on §4.1's
  declared defaults with **no** notice, whose composition equals the enabled-run composition — and that
  comparison target **must itself** be asserted to carry the C-4-delimited block, so the equality is not
  vacuously true against an empty injection.
  *Contract · L3 · AC-5.1a, AC-5.1b, BR-14, E-21, AT-32 · red LI-12 · green LI-21.*
- **PROP-CONFIG-02:** A section **present and not an object** **must** yield an enabled run on §4.1's
  defaults, the `learningsInjection` report key **present**, and `NTC-MALFORMED` on the run-level notice
  channel — three positive conjuncts, so the state is distinguishable from a deliberate disable.
  *Error Handling / Observability · L3 · AC-5.1b, BR-14, E-23, AT-32 · red LI-12 · green LI-21.*
- **PROP-CONFIG-03:** A **wrong-typed declared key** (`maxDocuments: "five"`, the other two configured)
  **must** yield an enabled run, that key at its default, `ruleInputs.thresholds.maxDocuments` equal to
  the literal `5` beside the two configured values, a selection equal to a fixture literal, and
  `NTC-KEYTYPE` **naming** `maxDocuments`.
  *Error Handling / Observability · L3 · AC-5.1c, BR-14, E-26, E-34, AT-32 · red LI-12 · green LI-21.*
- **PROP-CONFIG-04:** The three thresholds **must** validate as **non-negative** integers
  (`Number.isInteger(v) && v >= 0`): `0` is a **valid** admits-nothing value, a negative or non-integer
  value is `NTC-KEYTYPE`. `maxDocuments: 0` and `maxTotalBytes: 0` **must** each yield an **enabled** run
  with BR-8's rows present and empty — never AC-5.1a's absent key, never a refusal to run. AT-30's
  **third** zero, `maxBytesPerDocument: 0`, reaches the same run-level shape by a different route and
  carries an extra per-document conjunct; it is asserted by **PROP-CONFIG-09**, so the two properties
  partition the AT rather than overlapping on it.
  *Error Handling · L3 · AC-4.4, BR-14, E-24, E-25, AT-30 · red LI-12 · green LI-21.*
- **PROP-CONFIG-05:** `enabled: false`, **explicitly**, **must** be the only disabling state:
  `buildLearningsInjector` **must** return `null` on `config.enabled === false` **alone** — no `present`
  conjunct, no `!sectionMalformed` conjunct — the report **must** carry **no** `learningsInjection` key
  at all, and every composed dispatch **must** be byte-identical to the recorded pre-feature baseline.
  *Contract · L3 · AC-5.1a, AC-6.2, BR-14, E-22, AT-31, TSPEC §I.4 · red LI-12 · green LI-21.*
- **PROP-CONFIG-06:** `NTC-*` notices **must** be carried on `buildFinalReport`'s existing run-level
  `notices` channel, **never** inside `learningsInjection` — so an explicitly disabled run, which carries
  no such key, still has a home for a configuration defect.
  *Contract · L3 · AC-5.1b, AC-5.1c, TSPEC §I.2, §D.2 · red LI-12 · green LI-21.*
- **PROP-CONFIG-07:** `LEARNINGS_NOTICES` **must** have exactly **two** members, and AT-32's completeness
  test **must** assert set equality over exactly `NTC-MALFORMED` and `NTC-KEYTYPE`. A test written for a
  three-member set reds the frozen literal on day one.
  *Contract · L3 · C-9, BR-9, AT-32, TSPEC §D.1 · red LI-12 · green LI-21.*
- **PROP-CONFIG-08:** The configuration **must** be read **once per run** via
  `readLearningsConfigSafely`, which **must never** throw, and `LEARNINGS_CONFIG_PATH` **must** be
  `MERGE_CONFIG_PATH` — no second config file, no per-phase override, no per-feature allow-list (NG-7).
  *Contract · L3 · §4.1, NG-7, AC-3.3, TSPEC §I.2 · red LI-12 · green LI-21.*
- **PROP-CONFIG-09** *(the zero per-document bound — AT-30's third arm):* Over a corpus fixture whose
  documents **do** carry BR-6 priority sections, run at `maxBytesPerDocument: 0` with the other two
  thresholds at §4.1's declared non-zero values, the run **must** be **enabled** with BR-8's rows
  **present and empty**, and **every** corpus document **must** carry `RSN-NO-MATERIAL` — the exact
  reason id, not merely "not selected" — with the contributing count at **0**, **no** `maxDocuments`
  slot consumed, and **no** document flagged `bounded`. Four positive conjuncts, because the
  distinguishing observable is the reason id and the unconsumed slot, not the empty selection: an
  empty selection is what `maxDocuments: 0` and `maxTotalBytes: 0` produce too, so PROP-RECORD-02's
  generic empty-selection oracle cannot tell the three apart. The fixture **must** carry material
  (that is the `ZERO-BOUND` fixture's whole point) — a fixture of section-less documents would green
  through PROP-BOUND-06's first disjunct even if the zero bound were unimplemented, which is exactly
  the precedence-defeating requirement of §O.7. The oracle discriminates the three plausible wrong
  answers FSPEC's edge table rules out: `RSN-BYTES` rows, a zero-byte contribution flagged
  `bounded: true` occupying a slot, and AC-5.1a's absent report key. Lands as one case in
  `learningsConfig.test.js` beside PROP-CONFIG-04, adding **no** PLAN task and **no** AT id.
  *Error Handling / Data Integrity · L3 · AC-4.4, BR-6, BR-9, BR-14, D-12, E-36, AT-30 ·
  red LI-12 · green LI-21.*

### Group I — Gate-input isolation, footprint and preserved semantics *(BR-11, BR-15, BR-16)*

- **PROP-ISOLATE-01:** Over two scripted runs differing **only** in `learningsInjection.enabled`, the
  five recorded gate inputs — parsed verdicts, structural completeness scores, round-window counters,
  approval anchors, erratum routes — **must** be equal member for member, asserted as set equality over
  the five names **and** value equality per member. Contamination **must be made possible** in the
  fixture: the corpus carries **line-initial** `VERDICT:`, `ERRATUM:` and `REVISION-COMPLETE:` lines, and
  the scripted `_agent` echoes the final 200 bytes of the prompt it was handed into its response.
  *Security / Integration · L3 · AC-4.3, G-5, BR-11, AT-29 · red LI-11 · green LI-21.*
- **PROP-ISOLATE-02:** Over the same two scripted runs PROP-ISOLATE-01 drives, the **five named**
  scored artefacts — completeness criteria, required headings, verdict grammar tokens, round-window
  bounds, approval anchors — **must** be **set-equal member for member** between the enabled and the
  disabled arm, **and each of the five sets must be asserted non-empty on both arms**, so a run that
  produced no documents, or an instrument that read an empty criteria set on both arms, reds instead of
  passing. The SKILL.md conjunct is a **digest equality**: the SHA-256 of every file under
  `pdlc/skills/**`, enumerated by `git ls-files` and asserted set-equal by path and equal by digest
  across the two arms and against a hand-transcribed manifest — not a prose "no text moves" (BR-16).
  *Contract · L3 · AC-5.3, G-5, NG-3, BR-16, AT-35 · red LI-11 · green LI-20.*
- **PROP-FOOTPRINT-01:** On an enabled run, the set of paths under `docs/` the run opens **must equal**
  BR-15's expected set — exactly one attempt per report-named document other than the `RSN-SELF` ones —
  where the expected set is **hand-transcribed** from the fixture's scripted `ls-files` stdout minus the
  self paths, never derived from `gatherLearningsCorpus`. The observed set **must** be non-empty.
  *Security / Observability · L3 · AC-5.2, BR-15, AT-33 · red LI-11 · green LI-20.*
- **PROP-FOOTPRINT-02:** On a disabled run observed on the **same instrument in the same test file**,
  **no** corpus path **must** be touched at all, the composed dispatches **must** be byte-identical to
  the recorded baseline, and the run **must** reach completion — the absence claim carrying weight only
  because PROP-FOOTPRINT-01's non-empty positive shows the instrument firing.
  *Security · L3 · AC-5.2, BR-15, AT-34 · red LI-11 · green LI-21.*
- **PROP-FOOTPRINT-03:** The working-tree delta of a full run, captured as `git status --porcelain`
  before and after in a **dedicated temporary git repository that is the run's `cwd`**, **must** be
  set-equal — an empty delta, **with no exemption list at all**. Nothing under `docs/_constraints/` or
  `docs/_decisions/`, no LEARNINGS document, no skill prompt, and no index, cache or state file is
  written anywhere.
  *Security · L3 · AC-5.2, NG-1, NG-4, BR-15, TSPEC §T.6 · red LI-11 · green LI-20/LI-21.*
- **PROP-FOOTPRINT-04:** The source span between LI-15's two sentinel comments **must** reference **no
  filesystem module under any name** — not `fs.`, `node:fs`, `fs/promises`, a destructured
  `{ writeFileSync }` bound at module top and called bare, an aliased `fsp.writeFile`, `require("fs")`,
  nor `mkdirSync`/`appendFileSync` — stated as "no filesystem module reference is reachable from this
  span", which does not silently narrow the way an enumerated token list does. Asserted by a static
  scan scoped to that span: the check that covers every run, not only the runs a fixture exercises, and
  the **only** oracle covering AC-5.2 / NG-4 on paths no fixture reaches. It carries **two conjuncts
  that give the instrument an oracle**, because a pure absence over a span the scanner failed to locate
  passes over zero bytes:
  1. **Positive control — the span is non-empty and is the right span.** The extracted region **must**
     contain the anchor `LEARNINGS_TARGET_DOCTYPES`, which LI-15 places inside the sentinels. A scan
     that returns an empty or mislocated region (a reworded sentinel, a later refactor moving the
     region, a regex anchored on a drifted string) **must** red, never pass.
  2. **Negative control — the scanner reds on a planted token.** The same scanner run over a synthetic
     span containing `fs.writeFileSync` **must** report a violation, proving the matcher and the
     reference rule work rather than being asserted to.
  *Security · L3 (static) · AC-5.2, NG-4, TSPEC §T.6 · red LI-11 · green LI-15.*

### Group J — Properties of the test apparatus itself

These have owning tasks and oracles because each guards an oracle that would otherwise stop firing
silently — the failure mode a coverage percentage cannot see.

- **PROP-META-01** *(`__tests__/learningsPremises.test.js`, LI-01):* The premises suite **must** assert each of P-1…P-10 **structurally, never
  positionally**, and **must never** assert an absence that this PLAN's own tasks are scheduled to
  falsify. The four authoring call sites **must** be asserted as **set equality** keyed by
  `(enclosing named function, prompt-source symbol)` — `(erratumRound, erratumAuthorPrompt)`,
  `(erratumRound, land-proof-retry inline template)`, `(converge, creatorPrompt)`,
  `(reviewLoop, optimizerPrompt — positional argument 4 of runWrapped)` — never by
  `(enclosing function, argument position)`, which is not injective over these four. A **fifth**
  authoring site reds this suite at batch 1.
  *Observability · L1 (static) · TSPEC §A.2 property 1, H-1 · red — · green LI-01 (green on authoring).*
- **PROP-META-02** *(`__tests__/learningsCaptureScript.test.js`, LI-03/LI-04):* `.gitignore` **must** ignore `/.baseline-worktree/` **root-anchored**: three
  conjuncts — the root path **is** ignored, a nested
  `pdlc/workflows/__tests__/fixtures/x/.baseline-worktree` is **not**, and
  `pdlc/workflows/__tests__/fixtures/learnings-baseline/` is **not**. Conjuncts 2 and 3 are what give
  root-anchoring an oracle; a bare `.baseline-worktree`, `*` or `.baseline*` rule passes conjunct 1
  alone while un-tracking fixture material this feature commits.
  *Contract · L1 (against a dedicated temp git repo with real `git`) · TSPEC §T.3 obligation 1 ·
  red LI-03 · green LI-04.*
- **PROP-META-03** *(`__tests__/learningsCaptureScript.test.js`, LI-03/LI-05):* A forced throw injected **between** materialise and remove — through the capture
  script's fixture/import seam, `git` staying real — **must** leave the `.baseline-worktree` path
  **absent** *and* the temp repo's `git worktree list` showing **no entry** for it. The second conjunct
  is what distinguishes `git worktree remove` from `rm -rf` and **must not** be dropped or degraded to
  an argv assertion.
  *Error Handling · L1 (temp git repo) · TSPEC §T.3 obligation 2 · red LI-03 · green LI-05.*
- **PROP-META-04** *(`__tests__/learningsBaselineGuard.test.js`, LI-06):* The baseline guard **must** anchor on **hand-transcribed** SHA-256 literals — one per
  `{caseId}`, copied by a human from the first capture — asserted against both the recomputed file
  digests **and** `MANIFEST.json`'s entries, with **set equality over the `{caseId}` keys**, never
  containment. Its falsification is LI-06's recorded three-step mutation proof: flip one byte, delete one
  whole `{caseId}` directory, add a spurious one — each step reds a **different** clause, and a step that
  does not red is a halt.
  *Data Integrity · L1 · AC-6.2, TSPEC §T.3, DC-14 · red — (authored green) · green LI-06.*
- **PROP-META-05** *(`__tests__/learningsSuiteMap.test.js`, LI-14):* The suite-map closure **must** be taken over the **directory**, not over a hardcoded
  six: enumerate `__tests__/learnings*.test.js` from disk by **static parse of the file text** (never by
  importing the suite), compute the set of files registering at least one `LI-AT-` jest test **title**,
  assert that set **equal** to the six AT-bearing suites, then assert the six declared AT lists pairwise
  **disjoint** and **set-equal** to the 35-member literal `AT-01 … AT-35`.
  *Contract · L1 (static) · TSPEC §T.5 closure, DoD 1 · red — (green on authoring) · green LI-14.*
- **PROP-META-06** *(`__tests__/learningsSuiteMap.test.js`, LI-14):* **No suite of this feature reaches
  a live agent.** Over the same static directory walk PROP-META-05 takes — enumerate
  `__tests__/learnings*.test.js` from disk, parse each file's text, never import it — every enumerated
  file **must** construct its agent through the scripted double (a `_agent` injection or
  `makeAgentDouble`-shaped helper) and **no** enumerated file **must** reference a live transport
  symbol. Asserted as **set equality** over the enumerated suite files — every file accounted for,
  never containment — so a newly added suite that skips the double reds rather than being silently
  missed, and the walk's non-empty file set is the positive control that the instrument fired. This is
  the mechanised half of AC-6.1's "no live model calls" clause; its determinism clause is discharged by
  PROP-ORDER-05's two-process comparison. No new PLAN task and no new file: the assertion rides LI-14's
  existing directory walk in the suite it already owns.
  *Security / Contract · L1 (static) · AC-6.1, TSPEC §T.5, DoD 1 · red — (green on authoring) ·
  green LI-14.*

## Oracles

This section is where the falsifiability checklist is applied. Each subsection names a checklist
failure mode, the properties exposed to it, the oracle that defeats it, and — where the property
would otherwise be unfalsifiable — the **mutation that must red it**. A property whose mutation is
not stated here has not been shown to have an oracle.

### O.1 Absence-based oracles carry three positive conjuncts

Every blocked/held/degraded invariant in this feature is stated as an exact id **plus** a positive
retention or record conjunct, never as `!= X`:

| Property | Exact value | Named reason | Retention / audit conjunct |
|---|---|---|---|
| PROP-CORPUS-05 | `rejected[]` contains the self path | `RSN-SELF` | `_readFile` call log **excludes** that path *and* `corpusOutcome === null` |
| PROP-RECORD-05 | `corpusOutcome === "RSN-UNLISTABLE"` | corpus catalogue | that dispatch's `rows` key **present** and `[]`, `totalBytesInjected === 0` |
| PROP-CONFIG-02 | `notices` contains `NTC-MALFORMED` | notice catalogue | `learningsInjection` key **present**, composition equal to the enabled composition |
| PROP-CONFIG-03 | `notices` contains `NTC-KEYTYPE` naming `maxDocuments` | notice catalogue | `ruleInputs.thresholds.maxDocuments === 5` beside the two configured values |
| PROP-CONFIG-05 | injector `=== null` | `enabled: false` | report carries **no** `learningsInjection` key *and* prompts byte-equal the baseline |
| PROP-BOUND-06 | `rejected[]` reason `RSN-NO-MATERIAL` | reject catalogue | contributing count unchanged — the slot was **not** consumed, asserted as a count |

| PROP-FOOTPRINT-04 | the scanned span contains **no** filesystem module reference | AC-5.2 / NG-4 | the span **contains** `LEARNINGS_TARGET_DOCTYPES` (right span, non-empty) *and* the same scanner reds on a planted `fs.writeFileSync` |
| PROP-ISOLATE-02 | five named scored artefacts set-equal across the two arms | AC-5.3 / BR-16 | each of the five sets asserted **non-empty on both arms** *and* a SHA-256 digest equality over `git ls-files pdlc/skills/**` |
| PROP-RECORD-09 | no enumerated suite references `runMirror` in an assertion | TSPEC §D.2 | the walk's enumerated file set is non-empty and set-equal to PROP-META-05's operand |
| PROP-META-06 | no enumerated suite references a live transport symbol | AC-6.1 | every enumerated file shown to construct a **scripted double**, asserted as set equality over the same file set |

**The three static-scan absences share one instrument and one positive control.**
PROP-FOOTPRINT-04, PROP-RECORD-09 and PROP-META-06 are absences over *source text* rather than over a
run, so their vacuity mode is not an unexercised branch — it is a scan that located nothing. Each
therefore names the region or file set it scanned and asserts that operand non-empty and correct
(the sentinel-anchored span for PROP-FOOTPRINT-04; the enumerated `learnings*.test.js` set, shared
with PROP-META-05, for the other two), and PROP-FOOTPRINT-04 additionally carries a planted-token
negative control proving the matcher fires. A scan that finds nothing **reds**; it never passes.

**The healthy value is asserted too.** PROP-RECORD-04's `corpusOutcome === null` on `DIVERGENT-CORPUS`
dispatches 1, 2 and 4 is the load-bearing half: `null` is the value the field carries on the
overwhelming majority of runs, so without it an implementation recording `undefined`, `""` or omitting
the key is green everywhere. It is asserted **positively** in `learningsRecord.test.js` rather than
folded into `learningsArmInventory.test.js`, whose catalogue equality is deliberately scoped to
non-`null` observations — `null` is not a catalogue member, and widening the expected value to
`LEARNINGS_CORPUS_OUTCOMES ∪ {null}` would stop it being a literal transcription of the frozen
catalogue, which is the whole point of that assertion.

### O.2 Preservation and byte-identity oracles carry a positive-presence conjunct

PROP-DISPATCH-03, PROP-DISPATCH-05, PROP-CONFIG-05 and PROP-FOOTPRINT-02 all compare bytes against the
recorded pre-feature baseline. Each is vacuous on a fixture whose dispatch never had the content in
question. The paired positives:

| Preservation property | Its positive control |
|---|---|
| PROP-DISPATCH-03 (rejected-at-the-site prompts byte-identical) | PROP-DISPATCH-01 asserts the **accepted** set carries a block on the same run and the same instrument; the rejected population itself is enumerated by the `_recordDocType` probe, so it is asserted **non-empty** rather than assumed. Dispatch families that never reach the site are out of this property's scope — PROP-DISPATCH-08 asserts their absence from the call graph structurally |
| PROP-DISPATCH-05 (manifest/upstream/pacing unchanged) | assert each of the three regions is **present** in the fixture prompt *and* present in the output, then assert its order index |
| PROP-CONFIG-05 (disabled = baseline) | PROP-CONFIG-01 asserts the enabled comparison target **itself carries** the C-4-delimited block |
| PROP-FOOTPRINT-02 (zero corpus reads) | PROP-FOOTPRINT-01's non-empty observed set on the **same instrument in the same test file** |

**The baseline itself is guarded** (PROP-META-04), because a byte-identity oracle whose expected side
can be regenerated by the branch under test proves nothing. Legitimate re-capture — an added L3 matrix
case — adds or replaces whole `{caseId}` directories while leaving every retained digest unchanged; any
re-capture that alters a retained prompt reds the guard whatever the commit message says.

### O.3 Identical-envelope behaviours get behavioural call-counts, not shape assertions

Three behaviours in this feature leave an identical result envelope whether or not they happened. Each
gets a spy/call-count oracle, and the treatment is applied to **every** member of the family:

| Behaviour | Why the envelope is identical | Call-count oracle |
|---|---|---|
| PROP-DISPATCH-04 — one selection per **episode**, not per `for(;;)` iteration | a per-iteration selector over a static corpus produces the same bytes | exactly **one** `dispatches[]` row for the dispatch; exactly **one** `LEARNINGS_CORPUS_ARGV` `_git` call on the double's log; and iteration 2's prompt differs from iteration 1's **only inside `opener`**, its block substring byte-identical |
| PROP-CORPUS-02 — one enumeration per dispatch | a re-enumeration returns the same listing | `_git` invocation count filtered to `LEARNINGS_CORPUS_ARGV`, per dispatch |
| PROP-CORPUS-05 — the self document is **never opened** | a self document contributes nothing either way | the self path's **absence from the `_readFile` call log**, paired with PROP-FOOTPRINT-01's positive set equality over the paths that *were* opened |

Assertion 2 of PROP-DISPATCH-04 fails fast under the loop-placement bug even when the moved corpus
happens to select identically; assertion 3 fails when it does not. Neither alone is sufficient.

### O.4 Exact-value oracles over a multi-node run derive counts from a dispatch-count spy

PROP-DISPATCH-02's expected value is **not** hand-counted from the phase list. The operand is the
`_recordDocType(docType)` probe seam, called once per episode on **both** arms of `injectHere`,
immediately before it is evaluated. Two operands, both hand-transcribed, both **equality**:

- observed at the composition site = `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}`
- accepted (`injectHere === true`) = `LEARNINGS_TARGET_DOCTYPES`

**Why the report is the wrong operand** (and this is the mutation that motivates the probe): a seventh
authoring phase whose `docType` reaches `dispatchAndVerify` and is **rejected** by `injectHere` produces
no `dispatches[]` row at all, so a report-sourced set equality stays green through exactly the drift it
was written to detect. The probe is the only instrument that sees a `docType` the feature declined.
Transcribing the accepted-set literal at the composition site would red a correct implementation on its
first run, and the predictable repair under time pressure is to relax equality to containment — which is
the weakening that lets a seventh phase inherit injection silently. **Set equality stands on both
sides; containment is never the fix.**

### O.5 Derived and absence-shaped conjuncts sit at the whole-pipeline seam

Six claims are placed at L3 because no injectable unit can falsify them, and this placement is a
deliberate cost:

| Claim | Why not L1/L2 |
|---|---|
| PROP-DISPATCH-01/02/03 | the dispatch **universe** is a property of the run, not of a function |
| PROP-CONFIG-04/05 | "rows present and empty" versus "key absent" is a distinction only a finished report carries; an L1 unit over `parseLearningsConfig` sees the parse result and never the report key set |
| PROP-CONFIG-09 | only the **run-level** half of the zero bound is L3: the `RSN-NO-MATERIAL` reason id and the unconsumed `maxDocuments` slot are decisions of the caller that only a finished report records. The unit-level half is **not** L3 and is not placed here — `extractInjectableMaterial(text, 0)`'s four-field return is directly falsifiable at L1 and is owned by PROP-BOUND-03 (TSPEC §I.3; TSPEC, Named obligations carried forward, T-O-6) |
| PROP-RECORD-07/10 | the once-per-run threshold record and per-dispatch reproducibility span the whole run |
| PROP-FOOTPRINT-01…04 | AC-5.2's window is "the whole run"; a seam log cannot see a direct `fs.writeFileSync` |
| PROP-ISOLATE-01 | gate inputs are produced by the convergence machinery, not by this feature's units |

**Real captured envelopes over synthetic fixtures at the contract boundary.** The byte-identity
baseline is captured from the **merge-base checkout of `orchestrate-dev.js` itself**, driven by
branch-side harness code — the subject is old, the harness is new — rather than hand-built from a
guess about what a pre-feature prompt looks like.

### O.6 Regex and alternation branches each carry a positive control

| Branch | Positive control |
|---|---|
| `LEARNINGS_HEADING_RE` accepting `# LEARNINGS — {f}` | a fixture whose first non-blank line is exactly that, asserted eligible; **and** a non-LEARNINGS file asserted `RSN-UNPARSEABLE` |
| `DATE_ROW_RE` + `ISO_DATE_RE` bare-date branch | all 9 HEAD corpus documents carry a bare ISO value — the measured shape |
| the annotated-cell branch (`2026-06-09 (Phase H harvest…)`) | a synthetic fixture, **declared synthetic**: zero HEAD documents in this repository exhibit it |
| `orderKey === null` branch | a fixture document with **no** `Date Completed` row, asserted eligible and ranked by tiebreak |
| `ABRIDGED` annotation present / absent | asserted in **both** directions on one fixture carrying one bounded and one unbounded document |
| `bounded` cut on ASCII vs multi-byte | ASCII fixture pins `bytes === bound` **exactly**; a separate multi-byte case pins `bytes <= bound` |

**Whitespace-normalise before substring matching.** PROP-BLOCK-01's preamble is four sentences spanning
hard newlines; the oracle is byte-equality against the transcribed literal, not a substring search for a
multi-word sentinel that would straddle a newline and silently match zero.

### O.7 New blocking causes must defeat every earlier branch

`RSN-COUNT` is behind a precedence chain — self-exclusion, then read/parse outcomes, then
`RSN-NO-MATERIAL`, then the count cut, then the byte cut — and under §4.1's declared thresholds the
**byte** bound binds first on measured corpora, so a default-threshold fixture would satisfy
PROP-BOUND-01 with `RSN-COUNT` unimplemented. The "87 of 89 documents exceed `maxBytesPerDocument`
alone" figure is **inherited from FSPEC BR-5**, whose basis is a two-repository measurement (most of
that corpus lives in `regime-ledger`) and is therefore not re-derivable here; a different re-derivation
under strict BR-6 title matching is on record in the FSPEC v2 TE review. The argument does not rest on
that number. The **locally checkable** form is the one this document relies on: all **9** documents in
this repository's corpus run 19,340–50,695 bytes of source against a 6,000-byte `maxBytesPerDocument`,
so the per-document bound binds for **9 of 9** here. The
`COUNT-BINDING` fixture (§Fixtures) exists exactly to defeat the earlier branches: 8 documents × one
200-byte section, `maxDocuments: 3`, total far under `maxTotalBytes`, so the **only** cut is the count
cut and the expected split is exactly 3 contributing / 5 `RSN-COUNT`.

**Disk-mediated carry-forward is proven with a reload, not an in-memory prior.** PROP-ORDER-05's two
compositions are made in **two separate process invocations**, so a block cached in-process across
dispatches cannot pass as determinism.

### O.8 Mutation ledger — what must red

Stated for the properties whose power is otherwise asserted rather than checkable:

| # | Mutation | Must red |
|---|---|---|
| M-1 | Drop the `docType` conjunct from `injectHere` | PROP-DISPATCH-01 (superset), PROP-DISPATCH-02 (accepted set), PROP-DISPATCH-03 (Phase CR prompt) |
| M-2 | Move the injector call inside `dispatchAndVerify`'s `for(;;)` loop | PROP-DISPATCH-04 assertions 1 and 2 |
| M-3 | Compose the block into `basePrompt` ahead of the verdict-grammar instructions | PROP-ISOLATE-01 (erratum routes gain members from the fixture's line-initial `ERRATUM:` lines) |
| M-4 | Have the verdict parser scan prompt+response instead of the response trailer | PROP-ISOLATE-01 (parsed verdict differs between the enabled and disabled runs) |
| M-5 | Charge per-document framing to `maxBytesPerDocument` | PROP-BOUND-07 (`bytesInjected` no longer equals the hand-computed material count) |
| M-6 | Test `readOk` before `excluded` in `selectLearnings` | PROP-RECORD-03 (a self document reported `RSN-UNREADABLE`) |
| M-7 | Replace `Buffer.compare` with `<`/`>` on paths | PROP-ORDER-01's supplementary-plane path case |
| M-8 | Emit `""` for `orderKey` instead of JSON `null` | PROP-RECORD-06 |
| M-9 | Return `null` from `buildLearningsInjector` when `sectionMalformed` | PROP-CONFIG-02 (key absent, notice unreachable) |
| M-10 | `rm -rf` the baseline worktree instead of `git worktree remove` | PROP-META-03 conjunct 2 |
| M-11 | Relax any catalogue test from set equality to containment | PROP-FAILOPEN-01, PROP-RECORD-03, PROP-CONFIG-07 |
| M-12 | Add a seventh authoring `docType` to `converge` without deciding injection | PROP-DISPATCH-02 |

### O.9 Property-based and mutation testing posture

Hypothesis-style generation has no natural home here: the input space is documents and paths, not
numeric magnitudes, and the load-bearing invariants are set equalities over closed catalogues rather
than algebraic laws. Two exceptions are worth parameterising, and both are cheap:

- **PROP-ORDER-01 / PROP-ORDER-06 totality** — generate permutations of a fixed 8-document `(orderKey, path)` multiset
  (including `null` keys and duplicate keys) and assert `orderCorpus` is a **total order**: irreflexive,
  antisymmetric, transitive, and invariant under input permutation. No unbounded generator, no products,
  no float magnitudes, so no `assume(math.isfinite(...))` hazard arises.
- **PROP-BOUND-03 character-safety (TSPEC T-O-6)** — generate documents whose first priority section straddles the
  bound with multi-byte codepoints and assert `Buffer.byteLength(material) <= maxBytes` **and** that
  `material` round-trips through UTF-8 decode without a replacement character. Boundary-adjacent draws
  are pinned by construction relative to the bound, not by an absolute offset. **The generator's
  domain is every non-negative `maxBytes`, `0` included, stated explicitly rather than left to the
  draw** (TSPEC, Named obligations carried forward, T-O-6: "The bound domain includes `0`, and the property must state its carve-out
  … State the zero conjunct, keep `0` in the domain"). The zero bound is **not** absence-shaped at this
  unit and so does not meet §O.5's L3 test: it is a four-field positive return value that
  `extractInjectableMaterial(text, 0)` produces directly (`material === ""`, `bounded === false`,
  `bytes === 0`, `sections.length === 0` — TSPEC §I.3), which the unit both can and must falsify.
  **Answering the shape question explicitly (SE Q-01):** the zero conjunct rides as a **guarded branch
  inside the same property body** — at `maxBytes <= 0` the body asserts the four-field return, otherwise
  the cut-and-flag conjuncts — and `0` is additionally **pinned as a distinguished example case** in the
  same suite rather than left to sampling frequency, so LI-08's red is reproducible on any seed. Running
  the generator with `0` unguarded, against the un-amended cut-and-flag rule, is the failure TSPEC names:
  it would red a conforming implementation on a `bounded: true` clause the spec never asks it to satisfy.
  PROP-CONFIG-09 remains the **run-level** arm and is unchanged: it owns the reason id (`RSN-NO-MATERIAL`,
  E-36) and the unconsumed `maxDocuments` slot, which are the genuinely report-level observables and the
  reason that property, not this one, sits at L3 in §O.5's table.

Mutation coverage is carried by O.8's ledger rather than by a mutation-testing tool: the region is
~300 lines inside a 15,311-line file, and `--per-file --branches 85` is enforced against the whole
module's aggregate (`orchestrate-dev.js` sits at 88.14 %, 3.14 points of headroom), so a substantially
uncovered new region would not move it. PROP-FAILOPEN-01 **is** the coverage obligation, mechanised.

## Fixtures

All fixtures live under `pdlc/workflows/__tests__/`. Corpus fixtures are **materialised into a
per-test temporary directory** by `helpers/learningsFixtures.js` and removed in `afterEach`; none are
committed as loose LEARNINGS documents inside `docs/`, because a committed `docs/**/LEARNINGS-*.md`
would be enumerated by the real `LEARNINGS_CORPUS_ARGV` glob in every other test and would join the
repository's own corpus.

### F.1 Corpus case fixtures (`helpers/learningsFixtures.js`)

| Case id | Shape | Defeats |
|---|---|---|
| `DISCARDED-NESTED` | `docs/discarded/some-feature/LEARNINGS-some-feature.md` | a glob that excludes discarded documents only at one nesting depth |
| `DISCARDED-DIRECT` | `docs/discarded/LEARNINGS-x.md` — the **direct** child, the positive control paired with the row above | an exclusion written against the nested path shape alone |
| `COMPLETED-MIXED` | two `docs/completed/{f}/LEARNINGS-{f}.md` plus two `docs/{f}/LEARNINGS-{f}.md` | a catalogue that enumerates only the live tree, or only the completed tree |
| `COUNT-BINDING` | 8 documents × one 200-byte Cross-Feature Patterns section | the `RSN-COUNT` precedence problem of §O.7 — byte cuts binding first |
| `BYTES-BINDING` | **8 documents of 7,000 injectable bytes each** under §4.1's declared values (`maxDocuments: 5`, `maxBytesPerDocument: 6000`, `maxTotalBytes: 20000`) — the mirror of `COUNT-BINDING`, matching PROP-BOUND-02 and TSPEC §T.4. Expected split, stated as a literal beside `COUNT-BINDING`'s 3/5: each document bounded to 6,000, so exactly **3 contribute**, **5 carry `RSN-BYTES`**, **0 carry `RSN-COUNT`** — the contributing count strictly below `maxDocuments`, and document 4 left unpromoted behind document 3 | a whole-document drop where a per-document bound was specified; **back-fill** (only a corpus with a document ranked below the byte cut can exhibit it — two documents cannot); and a count bound asserted where it does not bind |
| `DIVERGENT-CORPUS` | 4 dispatches, dispatch 3 alone enumerating unlistable | `corpusOutcome` recorded run-wide instead of per dispatch; and the healthy `null` |
| `RETRY-ITERATION` | one dispatch driven to a second `for(;;)` iteration | per-iteration re-selection (PROP-DISPATCH-04) |
| `MALFORMED-CONFIG` | `learningsInjection` present but not an object | `NTC-MALFORMED` conflated with disablement |
| `KEYTYPE-CONFIG` | `maxDocuments: "5"` beside two valid numbers | a wrong-typed key silently coerced or silently disabling |
| `NO-MATERIAL` | one document with all five BR-6 sections **absent** and an Approval Record present — the *carries-no-section* disjunct of BR-9's `RSN-NO-MATERIAL`, paired with the row below | `RSN-NO-MATERIAL` implemented as "document empty" |
| `ZERO-BOUND` | a multi-document corpus whose documents **do** carry BR-6 priority sections, run at `maxBytesPerDocument: 0` with the other two thresholds at §4.1's declared non-zero values — the **positive control** for `RSN-NO-MATERIAL`'s second disjunct, and the mirror of `NO-MATERIAL` in the same pairing discipline as `DISCARDED-NESTED`/`DISCARDED-DIRECT` and `COUNT-BINDING`/`BYTES-BINDING`. A threshold override on an existing corpus fixture, not a new corpus shape | `RSN-NO-MATERIAL` implemented as "document carries no section" — which greens on `NO-MATERIAL` alone; also `RSN-BYTES` rows, and a zero-byte contribution flagged `bounded: true` occupying a slot |
| `GATE-GRAMMAR` (AT-29) | a LEARNINGS document whose material carries **line-initial** `FINDING:`, `ERRATUM:` and `VERDICT:` lines | PROP-ISOLATE-01 vacuity — contamination must be *possible* for non-contamination to mean anything |
| `MULTIBYTE-BOUND` | material straddling `maxBytesPerDocument` mid-codepoint | a naive `slice` producing a replacement character |
| `SUPPLEMENTARY-PATHS` | two paths equal in `orderKey`, differing above U+FFFF | JS code-unit comparison masquerading as byte order (M-7) |

Every fixture's expected values are **hand-transcribed literals** in the test file, computed from the
fixture's declared content, never re-derived at assertion time by calling the function under test.

### F.2 Byte-identity baseline (`__tests__/fixtures/learnings-baseline/`)

`{caseId}/{dispatchIndex}.txt` holds prompts captured from the **merge-base checkout** of
`orchestrate-dev.js`, driven by branch-side harness code in a `git worktree` at
`.baseline-worktree`. `MANIFEST.json` records, per file, the capture commit (the merge-base SHA), the
case id, the dispatch index, the `docType`, and a SHA-256 of the file's bytes — hand-transcribed at
capture time and re-verified by PROP-META-04, which reds if a retained digest changes.

`.baseline-worktree` is **not** ignored by `.gitignore` (`git check-ignore -v .baseline-worktree` exits
1). This is deliberate and is why PROP-META-03 exists: the worktree must be removed with
`git worktree remove --force` inside a `finally`, so that a throw between materialise and remove leaves
the path absent and `git status --porcelain` empty. An ignore entry would have hidden the leak instead
of preventing it, and `document-oracles.mjs`'s `WALK_SKIP_DIRS` (`.git`, `node_modules` only) walks the
whole tree, so a stray worktree would reach the document oracles in CI.

### F.3 Fixture strings match normative sources verbatim

Three families of literal are transcribed, not paraphrased:

- **The C-4 block delimiters and preamble** — transcribed from FSPEC §C.4's normative text, asserted by
  byte-equality (PROP-BLOCK-01), whitespace-normalised only where the spec itself wraps.
- **The five BR-6 section headings**, transcribed from **FSPEC BR-6's priority table verbatim** —
  `Cross-Feature Patterns`, `Non-Convergences`, `Rejected Proposals (with rationale)`,
  `Process Learnings`, `Open Items for Consolidation`, plus `Approval Record`, which is **never**
  injected. FSPEC BR-6 states that these names identify sections by the conventional titles the
  harvest skill writes, **where they carry numeric prefixes** — `## 2. Cross-Feature Patterns`,
  `## 6. Approval Record` (`pdlc/skills/harvest-learnings/SKILL.md`, "LEARNINGS Document Format").
  Re-measured at HEAD, all 9 corpus documents write the headings in that numbered form and in exactly
  that spelling: `## 1. Non-Convergences`, `## 2. Cross-Feature Patterns`,
  `## 3. Rejected Proposals (with rationale)`, `## 4. Process Learnings`,
  `## 5. Open Items for Consolidation` — **9 of 9** for every one of the five, and **0 of 9** carry a
  bare `Rejected Proposals` or a bare `Open Items`. Fixtures are written to the numbered form, and
  **which heading forms count as which section is F-O-1's, not this document's to decide — and it is
  now decided.** FSPEC v0.13 widened F-O-1 to own **both** heading-recognition rules, and TSPEC v0.8
  discharged the second in §D.3, so the question earlier revisions routed as an erratum is closed.
  The decided matcher, which fixtures and expected sets are now written to:

  1. **The ordinal prefix is optional and carries no meaning** — `## 2. Cross-Feature Patterns` and
     `## Cross-Feature Patterns` are the same section; the number is stripped and discarded. It is
     **not** the priority: priority comes from `BR6_SECTION_NAMES`'s index alone. This is
     load-bearing for fixtures, because the corpus's own numbering is *not* BR-6's priority order —
     every document numbers `1. Non-Convergences`, `2. Cross-Feature Patterns`, while BR-6 ranks
     Cross-Feature Patterns first. A fixture whose expected order was read off the ordinals would
     invert the first two sections of every corpus document.
  2. **Comparison is exact and case-sensitive** after trimming — no prefix, substring, token-overlap
     or fuzzy match, no case folding. Forced by E-33, not chosen for strictness: the measured
     `RSN-NO-MATERIAL` document carries `## Cross-Feature Findings` and `## Process Findings`, which
     a substring or token rule would match to `Cross-Feature Patterns` and `Process Learnings`,
     making E-33 and AT-28 unreachable by construction. The **prefix** candidate is rejected on its
     own separate ground (neither name is a prefix of the other, so E-33 does not reach it): it
     would admit `## Process`, `## Open Items` and `## Cross-Feature` as full sections and create
     same-priority collisions needing a tiebreak.
  3. **A trailing parenthetical gloss is optional**, and only that — `## 3. Rejected Proposals`
     matches priority 3 exactly as `## 3. Rejected Proposals (with rationale)` does. Stated as a
     defensive tolerance, **not** measured: 9 of 9 corpus documents write the glossed form.

  Heading recognition is `SECTION_HEADING_RE` on **exactly two** `#` characters, so a `###`
  sub-heading inside a section is body text, not a boundary. Fixtures remain written to the numbered
  glossed form the corpus actually uses, and PROP-BOUND-08's real-corpus arm still drives extraction
  over a real document — but it now checks a matcher upstream **specifies** rather than bounding
  exposure to one upstream left open. What this document can and does pin is the consequence: PROP-BOUND-08
  drives extraction over a **real** corpus document, so a matcher and a synthetic fixture written to
  the same wrong spelling red instead of greening together.
- **The three frozen catalogues** — `LEARNINGS_REJECT_REASONS`, `LEARNINGS_CORPUS_OUTCOMES`,
  `LEARNINGS_NOTICES` — transcribed member-for-member from TSPEC §D.2 into the arm-inventory test as
  set-equality expectations (PROP-FAILOPEN-01, PROP-RECORD-03, PROP-CONFIG-07).

### F.4 Seam doubles

L2 properties drive `helpers/seams.js`'s exported `fakeFs` and `fakeGit`, re-exported by name through
`helpers/consolidationDoubles.js`. Call logs on those doubles are the operands for every call-count
oracle in §O.3 and for PROP-FOOTPRINT-01/02. The `_recordDocType` and `_readFile` probe seams are
injected on `advisoryDisabled.test.js`'s pattern — that file imports `orchestrate-dev.js`'s default
export under the local alias `mainDev` (`import mainDev, * as dev from "../orchestrate-dev.js"`) and
calls it directly; no property in this document reads a private module binding directly.
`learningsPredicatePin.test.js` is the **one** suite that takes `fakeGit` from
`helpers/consolidationDoubles.js` rather than `helpers/seams.js`, because its subject is the sibling
module and the two doubles are different shapes (PLAN LI-13).

## Coverage Matrix

### C.1 FSPEC acceptance tests → properties (35 of 35 covered)

| AT | Subject | Properties |
|---|---|---|
| AT-01 | Injection on an authoring REQ dispatch | PROP-DISPATCH-01, PROP-META-05 |
| AT-02 | Injection across all six target doctypes | PROP-DISPATCH-01 |
| AT-03 | Review dispatch prompt unchanged | PROP-DISPATCH-03 |
| AT-04 | Self document excluded | PROP-CORPUS-05, PROP-FAILOPEN-04 |
| AT-05 | Rendered block form | PROP-BLOCK-01, PROP-BLOCK-02 |
| AT-06 | Existing prompt regions preserved | PROP-DISPATCH-05 |
| AT-07 | maxDocuments cut | PROP-BOUND-01, PROP-BOUND-02 |
| AT-08 | RSN-COUNT on the excess | PROP-BOUND-01 |
| AT-09 | Descending orderKey | PROP-ORDER-01 |
| AT-10 | Null orderKey last; byte tiebreak | PROP-ORDER-02, PROP-ORDER-03 |
| AT-11 | BR-6 section-set selection | PROP-BLOCK-02, PROP-BOUND-03, PROP-BOUND-05 |
| AT-12 | Character-safe per-document cut | PROP-BOUND-03 |
| AT-13 | maxTotalBytes drop, no back-fill | PROP-BOUND-04 |
| AT-14 | Two-process byte identity | PROP-ORDER-05 |
| AT-15 | docs/discarded/ nested + direct | PROP-CORPUS-03 |
| AT-16 | docs/completed/ parity | PROP-CORPUS-04 |
| AT-17 | BR-8 row field set | PROP-RECORD-01 |
| AT-18 | Rows name source paths and byte counts | PROP-RECORD-02, PROP-RECORD-10 |
| AT-19 | Reject reasons recorded | PROP-RECORD-03 |
| AT-20 | Per-dispatch corpusOutcome | PROP-RECORD-04, PROP-RECORD-08 |
| AT-21 | Unlistable dispatch records empty rows | PROP-RECORD-02, PROP-RECORD-05 |
| AT-22 | BR-10 rule-input completeness (both loci) | PROP-RECORD-06, PROP-RECORD-07, PROP-RECORD-10 |
| AT-23 | No erratum round opened | PROP-RECORD-11 |
| AT-24 | Empty corpus ⇒ empty block | PROP-DISPATCH-06, PROP-FAILOPEN-03 |
| AT-25 | !reply.ok ⇒ RSN-UNLISTABLE, run proceeds | PROP-FAILOPEN-02, PROP-FAILOPEN-03 |
| AT-26 | Unreadable document ⇒ RSN-UNREADABLE | PROP-CORPUS-06, PROP-FAILOPEN-04 |
| AT-27 | Unparseable document ⇒ RSN-UNPARSEABLE | PROP-CORPUS-06 |
| AT-28 | No material ⇒ RSN-NO-MATERIAL | PROP-BOUND-06 |
| AT-29 | Gate-input isolation under contamination | PROP-ISOLATE-01 |
| AT-30 | Zero thresholds ⇒ enabled, rows present and empty (all **three** arms: `maxDocuments: 0` and `maxTotalBytes: 0` by PROP-CONFIG-04; `maxBytesPerDocument: 0` and its every-document `RSN-NO-MATERIAL` conjunct, E-36, by PROP-CONFIG-09) | PROP-CONFIG-04, PROP-CONFIG-09, PROP-RECORD-02 |
| AT-31 | enabled: false ⇒ baseline prompts | PROP-CONFIG-05 |
| AT-32 | Config absent / malformed / wrong-typed | PROP-CONFIG-01, PROP-CONFIG-02, PROP-CONFIG-03, PROP-CONFIG-07 |
| AT-33 | Read footprint set equality | PROP-FOOTPRINT-01 |
| AT-34 | Zero reads when disabled | PROP-FOOTPRINT-02 |
| AT-35 | Preserved pipeline semantics | PROP-ISOLATE-02, PROP-META-05 |

**Every one of TSPEC §T.5's 35 ATs is claimed by at least one property, and no property claims an AT
that §T.5 does not list.** The suite-level split (2 + 9 + 3 + 3 + 6 + 12 = 35) is itself asserted by
PROP-META-05 against `LI-T-SUITEMAP`, so a drifting partition reds rather than being noticed by
reading. Properties carrying no AT id — PROP-DISPATCH-02, PROP-DISPATCH-04, PROP-DISPATCH-07,
PROP-CORPUS-01/02/07/08/09, PROP-ORDER-04, PROP-BOUND-07, PROP-BLOCK-03, PROP-RECORD-08/09,
PROP-CONFIG-06/08, PROP-FAILOPEN-01, PROP-FOOTPRINT-03/04, PROP-META-01…05 — are TSPEC-local or
apparatus obligations, each named in a PLAN task row (LI-11, LI-12, LI-13, LI-23 and the LI-01…LI-06
apparatus block) and each carrying **no** AT id by design, so §T.5's counts are unchanged.

### C.2 REQ acceptance criteria → properties

**This matrix is bidirectional.** An AC may list a property only if that property's own trace line
carries the AC id; a property whose trace names only `BR-`, `E-`, `C-` or `§` ids is covered by the
BR/AT matrices, not padded into an AC row here. Five rows carrying such padding at v1 were struck in
this revision (PROP-CORPUS-08 under AC-2.2/AC-2.5, PROP-BLOCK-03 under AC-3.1…AC-3.3, PROP-ORDER-05
under AC-2.1/AC-2.3/AC-2.4, PROP-RECORD-11 under AC-4.1/AC-4.2, PROP-FAILOPEN-04 under
AC-4.4/AC-5.1a/b/c); **no AC lost its last property** in the process, and PROP-ORDER-05 gained the
genuine row it was missing under AC-6.1.

| AC | Properties |
|---|---|
| AC-1.1 | PROP-DISPATCH-01 |
| AC-1.2 | PROP-DISPATCH-01, PROP-DISPATCH-02, PROP-DISPATCH-03 |
| AC-1.3 | PROP-CORPUS-05 |
| AC-1.4 | PROP-BLOCK-01, PROP-BOUND-07, PROP-DISPATCH-05 |
| AC-2.1 | PROP-BOUND-01, PROP-BOUND-02 |
| AC-2.2 | PROP-ORDER-01, PROP-ORDER-03 |
| AC-2.3 | PROP-BLOCK-02, PROP-BOUND-03, PROP-BOUND-05, PROP-BOUND-07, PROP-BOUND-08 |
| AC-2.4 | PROP-BOUND-04, PROP-BOUND-07 |
| AC-2.5 | PROP-ORDER-03, PROP-ORDER-05 |
| AC-2.6 | PROP-CORPUS-03, PROP-CORPUS-04 |
| AC-3.1 | PROP-RECORD-01, PROP-RECORD-02 |
| AC-3.2 | PROP-RECORD-03, PROP-RECORD-04, PROP-RECORD-05, PROP-RECORD-08, PROP-RECORD-09 |
| AC-3.3 | PROP-CONFIG-08, PROP-RECORD-06, PROP-RECORD-07, PROP-RECORD-09, PROP-RECORD-10 |
| AC-3.4 | PROP-BLOCK-03, PROP-RECORD-11 |
| AC-4.1 | PROP-DISPATCH-06 |
| AC-4.2 | PROP-CORPUS-06, PROP-FAILOPEN-02 |
| AC-4.3 | PROP-DISPATCH-03, PROP-DISPATCH-07, PROP-DISPATCH-08, PROP-ISOLATE-01 |
| AC-4.4 | PROP-CONFIG-04, PROP-DISPATCH-06 |
| AC-5.1a | PROP-CONFIG-01, PROP-CONFIG-04, PROP-CONFIG-05 |
| AC-5.1b | PROP-CONFIG-01, PROP-CONFIG-02, PROP-CONFIG-06 |
| AC-5.1c | PROP-CONFIG-03, PROP-CONFIG-06 |
| AC-5.2 | PROP-CORPUS-02, PROP-FOOTPRINT-01, PROP-FOOTPRINT-02, PROP-FOOTPRINT-03, PROP-FOOTPRINT-04 |
| AC-5.3 | PROP-ISOLATE-02 |
| AC-6.1 | **clause 1 (no live model calls):** PROP-META-06 — every enumerated `learnings*.test.js` suite shown by static parse to drive a scripted double, with no live transport symbol, asserted as set equality over the suite files. **clause 2 (determinism asserted by comparing two compositions):** PROP-ORDER-05, two compositions in two separate process invocations. PROP-META-05 supports both by keeping the suite set closed; the partition alone is **not** the discharge |
| AC-6.2 | PROP-CONFIG-05, PROP-META-04 |


### C.3 PLAN task table → properties (23 of 23 tasks accounted for)

Read as: the task that **reds** a property writes its failing test; the task that **greens** it makes
that test pass. `PROP-CORPUS-03` and `PROP-BOUND-01` are red LI-07 / green LI-16.

| Task | Reds | Greens |
|---|---|---|
| LI-01 | — | PROP-META-01 (green on authoring — a static scan of the injector's call site) |
| LI-02 | — | *fixture helper; no property of its own, but every corpus property's operand and F-O-7's owner* |
| LI-03 | PROP-META-02, PROP-META-03 | — |
| LI-04 | — | PROP-META-02 |
| LI-05 | — | PROP-META-03 |
| LI-06 | — | PROP-META-04 |
| LI-07 | PROP-CORPUS-03/04/05/07/09, PROP-ORDER-06, PROP-ORDER-01/02/03/04, PROP-BOUND-01/02/04/06, PROP-FAILOPEN-04 | — |
| LI-08 | PROP-DISPATCH-06, PROP-BOUND-03/05/07/08, PROP-BLOCK-01/02/03 | — |
| LI-09 | PROP-CORPUS-02/06/08, PROP-FAILOPEN-03/04 | — |
| LI-10 | PROP-RECORD-01…08, PROP-RECORD-10 | — |
| LI-11 | PROP-DISPATCH-01/02/03/04/05/07/08, PROP-ORDER-05, PROP-RECORD-11, PROP-FAILOPEN-02/03, PROP-ISOLATE-01/02, PROP-FOOTPRINT-01/02/03/04 | — |
| LI-12 | PROP-CONFIG-01…09 | — |
| LI-13 | PROP-CORPUS-01 | — |
| LI-14 | — | PROP-META-05, PROP-META-06, PROP-RECORD-09 (all three green on authoring — one static directory walk over `learnings*.test.js`, no production symbol under test) |
| LI-15 | — | PROP-CORPUS-01, PROP-FOOTPRINT-04 |
| LI-16 | — | PROP-CORPUS-03/04/05/07/09, PROP-ORDER-06, PROP-ORDER-01/02/03/04, PROP-BOUND-01/02/04/06, PROP-FAILOPEN-04 |
| LI-17 | — | PROP-DISPATCH-06, PROP-BOUND-03/05/07/08, PROP-BLOCK-01/02/03 |
| LI-18 | — | PROP-CORPUS-02/06/08, PROP-FAILOPEN-03/04 |
| LI-19 | — | PROP-RECORD-01…06, PROP-RECORD-08/10 |
| LI-20 | — | PROP-DISPATCH-01…05, PROP-DISPATCH-07/08, PROP-ORDER-05, PROP-FAILOPEN-03, PROP-FOOTPRINT-01/03, PROP-ISOLATE-02 |
| LI-21 | — | PROP-CONFIG-01…09, PROP-FAILOPEN-01/02, PROP-RECORD-03/04/07/11, PROP-FOOTPRINT-02/03, PROP-ISOLATE-01 |
| LI-22 | — | *refactor-and-close; adds no assertion, owns no property by design* |
| LI-23 | PROP-FAILOPEN-01, PROP-RECORD-03, PROP-RECORD-04 | — |

**Split ownership is deliberate, not a bookkeeping slip.** Three properties are red by one task and
green by two, and each split is named in the PLAN row that carries it:

- **PROP-RECORD-03 / PROP-RECORD-04** — red by both LI-10 (per-dispatch rows, including the healthy
  `null`) and LI-23 (the twelve-arm catalogue equality, scoped to non-`null`). The two halves are
  complementary by TE F-01 and neither alone is sufficient.
- **PROP-RECORD-07** — BR-10's **locus 2**, the run-level `ruleInputs.thresholds` key set, is red at
  LI-10 but cannot go green until the report key exists at LI-21; it sits in the expected-red ledger
  for batches 11–12. PROP-RECORD-06 (locus 1) greens earlier at LI-19.
- **PROP-FAILOPEN-03 / PROP-FAILOPEN-04 / PROP-FOOTPRINT-03** — each spans two layers (L1/L2 and L3),
  so each is red and green at two tasks; the L3 half of PROP-FOOTPRINT-03 stays red until LI-21
  because the disabled-run arm needs the configuration reader.

### C.4 Reconciliation

| Count | Value | Source |
|---|---|---|
| Properties in this document | 70 | Groups A–J (66 at v1, plus PROP-DISPATCH-08, PROP-BOUND-08, PROP-META-06, PROP-CONFIG-09) |
| FSPEC acceptance tests | 35 | TSPEC §T.5's partition, asserted by PROP-META-05 |
| ATs covered by ≥1 property | 35 | §C.1 |
| PLAN tasks | 23 | LI-01…LI-23 |
| Tasks owning ≥1 property | 21 | §C.3 (LI-02 and LI-22 own none, both by design) |
| Properties with **no** owning task | 0 | §C.3 |
| Fail-open arms | 12 | TSPEC §T.7, mechanised by PROP-FAILOPEN-01 |

**Test-file inventory — a measurement, pinned to a commit (SE F-02, SE Q-01).** This document
depends on twelve `learnings*.test.js` suites plus the fixture helper and the baseline fixture
directory — **fourteen** rows over fourteen files, exactly PLAN §File-ownership manifest's fourteen
new test rows. This table is a **snapshot, not a live claim**: it is the output of
`git ls-files pdlc/workflows/__tests__` run at commit **`21edb7c5`** on
`feat-pdlc-learnings-injection`, and each row carries the commit that added the file, so a reader can
tell a stale reading from a current one without re-running anything. Earlier revisions recorded that
none of these files existed, then that seven of them did; **both readings are now superseded** —
at `21edb7c5` the command returns **fourteen of fourteen**, and the rows below are restated against
that output rather than carried forward (PM F-01, SE F-01):

| File | Owning task | At `21edb7c5` | Added by |
|---|---|---|---|
| `helpers/learningsFixtures.js` | LI-02 | **exists** (landed) | `1920f281` |
| `learningsPremises.test.js` | LI-01 | **exists** (landed) | `cdeb1509` |
| `learningsCaptureScript.test.js` | LI-03 | **exists** (landed) | `688a5651` |
| `learningsPredicatePin.test.js` | LI-13 | **exists** (landed) | `07af8f52` |
| `learningsSelect.test.js` | LI-07 | **exists** (landed) | `1544fdbd` |
| `learningsBlock.test.js` | LI-08 | **exists** (landed) | `5e522a52` |
| `learningsCorpus.test.js` | LI-09 | **exists** (landed) | `b79b7859` |
| `learningsBaselineGuard.test.js` | LI-06 | **exists** (landed) | `4a6c1816` |
| `learningsRecord.test.js` | LI-10 | **exists** (landed) | `2fe07964` |
| `learningsDispatchSet.test.js` | LI-11 | **exists** (landed) | `c3e723e5` |
| `learningsConfig.test.js` | LI-12 | **exists** (landed) | `eb32d7d2` |
| `learningsArmInventory.test.js` | LI-23 | **exists** (landed) | `100e3d9c` |
| `learningsSuiteMap.test.js` | LI-14 | **exists** (landed) | `960c229c` |
| `fixtures/learnings-baseline/` | LI-06 | **exists** (landed) — `MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/{0,1}.txt` | `4a6c1816` |

**Fourteen of fourteen, and which task ids stand behind them.** Every one of the fourteen rows is
tracked at `21edb7c5`. The task ids with commits on this branch are **LI-01…LI-21 and LI-23**;
**LI-22 is the only id with no commit**, and it owns none of the fourteen — its row is the
🔵 REFACTOR-and-close task, whose artifact is a full-suite green run and the human cross-check of
LI-23's arm inventory, not a file (PLAN, LI-22 row). Two further committed ids also own none of the
fourteen: LI-04, whose artifact is the `/.baseline-worktree/` ignore rule (the `.gitignore` rule `/.baseline-worktree/`, landed
`ae2af1da`), and LI-05, whose artifact is the capture script (below). Earlier revisions of this
paragraph said seven had landed and "the remaining seven are explicitly planned and unstarted"; that
was true when written and is not now — `learningsBaselineGuard.test.js` and
`fixtures/learnings-baseline/` landed at `4a6c1816`, `learningsRecord.test.js` at `2fe07964`,
`learningsDispatchSet.test.js` at `c3e723e5`, `learningsConfig.test.js` at `eb32d7d2`,
`learningsArmInventory.test.js` at `100e3d9c` and `learningsSuiteMap.test.js` at `960c229c`.

**On the re-red of landed suites (SE Q-02), restated against `21edb7c5` (PM F-02, PM F-03).**
PROP-BOUND-03's zero case and PROP-BOUND-05/07/08's amendments — **four** properties, not three —
land in `learningsBlock.test.js`. That suite is not merely landed but **greened**: its red owner
LI-08 landed at `5e522a52` and its green owner LI-17 at `2cbacada`, and LI-16 — the task PLAN v0.7
names as the owner of TSPEC §D.5's zero-bound production half — landed at `d462ddd8`. So of PLAN's
two-case table, **case B is the live case and case A is unreachable**: case A is scoped to a
follow-up commit landing *before batch 7*, and batch 9 is behind us. Any commit carrying these four
cases re-reds committed green code, which is exactly what case B governs — the ledger gains the named
row `learningsBlock` → `LI-AT-11`'s heading-form cases, stated in test names, for every batch from
the landing batch through the batch that greens them. **None of the four is present in the landed
suite**: at `21edb7c5` `learningsBlock.test.js` declares one `describe` naming three ATs
(`describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)")`, `learningsBlock.test.js:38`),
carries none of `LI-AT-11`'s variant heading-form arms — no un-glossed `## Rejected Proposals`
(the builder renders the canonical glossed `"Rejected Proposals (with rationale)"`), no `###`-as-body
case and no `## Process Findings` near-miss. The un-numbered `## Cross-Feature Patterns` spelling
*does* appear — as LI-AT-05's material and as LI-AT-12's fixture text, with
`expect(result.sections).toEqual(["Cross-Feature Patterns"])` proving the matcher accepts it — so
what is owed there is the variant fixture as a whole, not that spelling (SE v8 F-02). Its only
*binding* `maxBytes` literals are `40` (`const maxBytes = 40`, beside the "Hand-computed (never
derived here)" comment) and `66` (`const maxBytes = 66`); the third call passes a deliberately
non-binding `100000` under the comment "Unbounded: large enough that maxBytes never binds". There is
no `extractInjectableMaterial(text, 0)` case. All four are
therefore **property-owed cases with no red-owning task remaining ahead of them**: they land into
green committed code, not into a scheduled red, and two gaps in case B's wording follow from that —
its named row covers `LI-AT-11`'s heading-form cases only, so PROP-BOUND-03's `maxBytes <= 0` case
has no named row, and its span ends at "the batch that greens them", which no remaining batch is.
Both are PLAN's call, not this document's, and both are routed as errata rather than decided here.

**And the deferral this document previously leaned on is spent, not pending.** Earlier revisions
concluded that this document's own four properties "travel under P-A-6's rule … so they enter no
ledger row unless that commit is brought forward." P-A-6 holds the PROPERTIES **suite**'s commit to
"the first point the suite is green, which in practice is after LI-21 (batch 13)" (PLAN, P-A-6). LI-21
landed at `92b7ea0c`, so that point has **arrived**: the window P-A-6 deferred into is open now
rather than ahead, and the suite may be committed as soon as it is green — or, if it lands red, its
rows are amended into the ledger by name first, under the same P-A-7 rule. The conclusion that **no
property of this document changes either way** is unaffected; what changes is only when its cases may
land and which case of the table governs them. The two mechanisms stay distinct, as this document has
held since v0.3: **P-A-7 case B** governs the amendment commit against the landed *implementation*
suite `learningsBlock.test.js`, while **P-A-6** governs this document's own PROPERTIES suite — the
restatement above moves neither rule, only the point in the run each is read from.

**No property in this document names a test
file the PLAN does not create**, and none names one that exists but is owned by no task. The
properties this revision adds or amends now all land in **landed** files — PROP-CONFIG-09 in
`learningsConfig.test.js` (LI-12), which landed at `eb32d7d2` and already carries LI-AT-30's three
cases (the `test("LI-AT-30: maxDocuments: 0 …")`, `test("LI-AT-30: maxTotalBytes: 0 …")` and
`test("LI-AT-30: maxBytesPerDocument: 0 ⇒ every non-self corpus path RSN-NO-MATERIAL, none
RSN-COUNT, no slot consumed (E-36)")` titles in `learningsConfig.test.js`, the third asserting
`RSN-NO-MATERIAL` on every non-self path and no document carrying `RSN-COUNT`), and the Group D amendments in
`learningsSelect.test.js` (LI-07, `1544fdbd`) and `learningsBlock.test.js` (LI-08, `5e522a52`). Every
one of them is therefore an amendment applied to committed code rather than a suite written fresh;
none is a file the PLAN has yet to create. PLAN records the
same thing in its own note that LI-02/LI-08's heading-form cases are "an amendment to landed
suites". The two
**existing** files this document names are the pin's subject `consolidationPredicate.test.js` and the
seam helpers `helpers/seams.js` / `helpers/consolidationDoubles.js`, none of which any task edits.
Likewise
`scripts/capture-learnings-baseline.mjs` was new to this feature and has since **landed by LI-05**
at `scripts/capture-learnings-baseline.mjs` (`ced75955`, "LI-05 — GREEN the capture script"): it is
tracked at HEAD (`git ls-files scripts/` returns exactly that one path), so the root-level `scripts/`
directory this feature created now exists. Earlier revisions of this sentence recorded the absence,
which was true when written and is not now.

## Gaps, Obligations and Routed Errata

### G.1 Carried TSPEC obligations, discharged here

| Obligation | Discharged by |
|---|---|
| **T-O-4** — `orderCorpus` output is a permutation of its input and the comparator is a strict weak ordering | **PROP-ORDER-06**, parameterised per §O.9 |
| **T-O-5** — `selectLearnings` is total: no throw, every input path exactly once across `selected ∪ rejected` | **PROP-CORPUS-09**, parameterised per §O.9 |
| **T-O-6** — `extractInjectableMaterial`: `bytes === Buffer.byteLength(material)`, `bytes <= maxBytes`, whole-character prefix, `bounded` true exactly when cut | **PROP-BOUND-03** (example arm, AT-11/AT-12) **plus** §O.9's generated arm, which is the half that makes the all-inputs claim of §D.5 checkable. Both are stated over **every non-negative `maxBytes`, `0` included**, per TSPEC's T-O-6 instruction (TSPEC, Named obligations carried forward) ("State the zero conjunct, keep `0` in the domain"). The partition is by **observable, not by input**: PROP-BOUND-03 owns the whole domain of the unit's return value — the cut-and-flag conjuncts at `maxBytes > 0` and the four-field zero return `{material: "", bounded: false, bytes: 0, sections: []}` at `maxBytes <= 0` (TSPEC §I.3) — while **PROP-CONFIG-09** owns the run-level consequences that no unit can produce: the `RSN-NO-MATERIAL` reason id and the unconsumed `maxDocuments` slot (FSPEC E-36). No input of §D.5 is unclaimed, and no observable is claimed twice |

All three land on tasks that already exist (LI-07 red / LI-16 green for T-O-4 and T-O-5; LI-08 red /
LI-17 green for T-O-6's example arm, with the generated arm folded into the same suites). **No new
PLAN task is required**, and no obligation is deferred to implementation.

### G.2 Known gaps in this document

1. **`maxBytesPerDocument: 0` — resolved upstream, now asserted (not a gap).** This entry recorded a
   deliberate omission: at the time, no upstream text decided the third zero, and the entry said the
   property "belongs in Group H beside PROP-CONFIG-04 and costs one case in `learningsConfig.test.js`"
   once FSPEC spoke. **FSPEC v0.13 decided it** — E-36, BR-6's *Where the bound is zero* clause, and
   AT-30's third arm — and the property landed exactly where this entry predicted: **PROP-CONFIG-09**,
   in Group H, one case in `learningsConfig.test.js` under LI-12 (red) / LI-21 (green), with the
   `ZERO-BOUND` fixture as its positive control and PROP-BOUND-06 widened to BR-9's second disjunct.
   PROP-BOUND-03 and §O.9's generated arm keep `0` in their domain and state TSPEC §I.3's zero
   carve-out as a positive conjunct — an earlier revision of this document briefly excluded `0` from
   both, which TSPEC v0.9 §T.5 had already rejected in terms; that exclusion is retracted, and the
   unit-level and run-level arms now partition §D.5's inputs (§G.1's T-O-6 row). The entry is retained
   rather than deleted because the *episode* is the point: declining to guess cost one confirmation round and no
   retracted property, where a guessed answer would have frozen a wrong expected value into the suite.
2. **Byte accounting of framing — resolved upstream, no recomputation owed (not a gap).** This entry
   recorded a live contradiction: TSPEC §D.5 said material only, while FSPEC BR-6's worked example
   charged the identification line and delimiters, and PROP-BOUND-07 / PROP-BLOCK-02 were written to
   **TSPEC's** reading with the blast radius named. **FSPEC v0.13 closed it in that direction** — a
   document's contributed bytes are "its **material** — the section headings and bodies taken from it,
   and nothing else", and framing counts "toward none of the three quantities". The conditional this
   entry carried ("both properties' expected counts change and LI-08's row changes with them")
   therefore resolves to **no change**: no expected value in Group D moves, `BYTES-BINDING`'s 3/5/0
   literal stands, and PLAN LI-08's row keeps its arithmetic. PROP-BOUND-07 now cites BR-6 beside
   §D.5, and mutation M-5 (§O.8) is a mutation away from **both** specs rather than toward one.
3. **`runMirror` is deliberately unasserted** (PROP-RECORD-09). This is a gap by decision, not by
   oversight: upstream leaves its value unconstrained, an implementation omitting it entirely conforms,
   and a test pinning it would red a conforming implementation. The **decision** is a gap; the
   **property is not uninstrumented** — as of this revision it is enforced by the static
   `learnings*.test.js` walk in `learningsSuiteMap.test.js` (LI-14), the same instrument PROP-META-05
   and PROP-META-06 use, so a later suite that pins the field reds rather than being noticed by a
   reviewer. §G.2.3's prose statement of the same constraint stands, now as commentary on a mechanised
   property rather than as its only home. If a later revision constrains `runMirror`, this negative
   property must be retired in the same change.
4. **Mutation testing is not mechanised.** §O.8's ledger is a written obligation checked by a reviewer,
   not by a tool. The `--per-file --branches 85` gate cannot see a ~300-line region inside a
   15,311-line module (`orchestrate-dev.js` sits at 88.14 %), which is precisely why PROP-FAILOPEN-01
   exists as the mechanical substitute for the coverage claim. The residual risk — a mutation in O.8's
   list that no test catches — is not currently detected by CI. **PROP-META-04's three-step mutation
   proof belongs in this paragraph too**: it is a one-time *human* procedure, performed by hand before
   LI-06's commit and recorded verbatim in that task's completion note (flip one byte; delete one whole
   `{caseId}` directory; add a spurious one — each reds a different clause, and a step that does not
   red is a halt). It is the right discipline for an oracle authored after its subject, and it is not
   mechanised: it guards the *expected* side of every byte-identity oracle in the feature, so a reader
   auditing residual risk should find it listed here rather than derive it from a property's
   parenthetical. Its standing counterpart — a legitimate re-capture leaves every **retained** digest
   unchanged (§F.2, §O.2) — is the rule a reviewer of a future re-capture PR applies, and it is
   checkable.
5. **Real-agent behaviour is out of scope.** Every property is asserted against scripted `_agent`
   replies. Whether an author agent's *output quality* improves from an injected block is unfalsifiable
   here, and REQ's non-goals say so; PROP-ISOLATE-01/02 assert only that the block cannot change gate
   inputs or pipeline semantics.

### G.3 Routed errata

Emitted as line items in this dispatch's final message; **no upstream document was edited.**

**Answered by FSPEC v0.13, no longer routed** — retained as a record of where each landed:

- ~~FSPEC's BR-6 worked example versus TSPEC §D.5 on framing bytes~~ — **answered**. BR-6 is now
  material-only and framing is charged to nothing; the two specs agree and PROP-BOUND-07 compresses
  both (gap 2 above).
- ~~FSPEC's missing edge decision for `maxBytesPerDocument: 0`~~ — **answered** as E-36, with BR-6's
  zero-bound clause and AT-30's third arm; asserted here by PROP-CONFIG-09 (gap 1 above).
- ~~FSPEC BR-6's *delegation* of the section-heading recognition rule~~ — **the ownership half
  answered**: F-O-1 now explicitly owns both heading-recognition rules. What remains is the TSPEC
  item below.

**Also answered — by TSPEC v0.8/v0.9, which moved after this round's reviews were dispatched:**

Both reviewers of this round recorded `UPSTREAM-STATE: TSPEC sha256:f629d29d…` (v0.7) and read TSPEC
as byte-identical. It is not: TSPEC at HEAD is `sha256:22dee8ce…`, **v0.9**, and it closed the two
items this list still carried as open. They are struck rather than re-routed:

- ~~TSPEC's AT-11 hand-computed byte count~~ — **answered** by TSPEC v0.9's §D.3, which fixes how
  taken extents are assembled into `material`: normalise each extent, join in priority order with
  `"\n\n"`, then cut once. The count is now a mechanical sum — section lengths plus 2 bytes per
  join — rather than a judgement two conforming implementations could split. Absorbed into
  PROP-BOUND-07.
- ~~TSPEC's undischarged section matcher~~ — **answered** by TSPEC v0.8's §D.3, which specifies
  `BR6_SECTION_NAMES`, the optional-ordinal matcher, exact case-sensitive comparison, the optional
  trailing gloss and the section extent, and records F-O-1's second rule as discharged where the
  obligation sits. Absorbed into §F.3 and PROP-BOUND-05/08.

**Also answered — by PLAN v0.6/v0.7, which moved after this round's reviews were dispatched:**

- ~~PLAN's expected-red ledger does not name rows for the re-red of the landed `learningsBlock.test.js`
  that PROP-BOUND-03's zero case and PROP-BOUND-05/07/08's amendments cause; P-A-7 requires the naming
  to be an edit to the PLAN, committed before the batch it governs~~ — **answered.** §C.4 asserted this
  routing and this list did not carry it, so it reached no author from here (PM v5 F-01); it is recorded
  now in the form it actually resolved. PLAN at HEAD (v0.7) carries *Amendment commits on landed suites
  (P-A-7)* with the two-case table — case A (before batch 7) adds no row because `learningsBlock` is
  already a whole-suite red there, case B (batch 9 or later) adds the named row for every batch from the
  landing batch through the greening one. Re-routing it would be DEC-ERR-01's anti-pattern of raising a
  question the upstream has decided. Absorbed into §C.4.

**Still open — three items:**

- PLAN's P-A-7 **case B** names one ledger row for the re-red of the landed `learningsBlock.test.js`
  — `LI-AT-11`'s heading-form cases — but PROP-BOUND-03's `maxBytesPerDocument <= 0` case re-reds the
  same landed suite and is covered by no named row. At `21edb7c5` that suite carries no
  `extractInjectableMaterial(text, 0)` call at all (§C.4), so the case lands into green committed
  code with nothing in the ledger standing for it. Whether case B's row is widened or a new row is
  added is PLAN's call; this document routes the gap and decides nothing.
- PLAN's P-A-7 **case B** scopes its named row to "every batch from the landing batch through the
  batch that greens them", and with LI-17 (`2cbacada`) and LI-21 (`92b7ea0c`) landed no remaining
  batch greens them — the span as worded has no terminus for an amendment commit landing now.
  Whether the intended reading is LI-22's REFACTOR-and-close batch or a self-greening amendment
  commit is PLAN's call; this document routes the gap and decides nothing.
- TSPEC's suite assignment for AT-15, whose clauses 2–3 (corpus-level `RSN-EMPTY`, no discarded document
  in any record) are asserted at L2/L3 while §T.5 lists AT-15 wholly under the L1 selection suite
  (TSPEC §T.5's suite table, `learningsSelect.test.js` row, level `L1`, at HEAD) — the mismatch PLAN
  LI-07/LI-19 already work around by carrying an expected-red ledger entry. The v0.2 revision struck the
  two items TSPEC v0.9 answered and wrote "**Still open:** nothing" above this bullet, which left it
  orphaned and the sentence untrue; it is re-labelled here and re-emitted as a routed erratum line.
  (This is the item re-routed in the v0.2 round; the two P-A-7 case-B items above are new to this
  revision and are emitted as `ERRATUM: PLAN` lines from this dispatch.)

Every **other** item this document routed upward has been answered, and the absorptions are recorded
above and in §G.2. One upstream item is *already routed by TSPEC and needs no duplicate from here*:
TSPEC v0.9 records **ERR-8** against FSPEC — Step 5's items 15/16 sequence extraction after the count
cut while §D.5 requires the drop before it. Outcomes agree at every bound, so no property of this
document changes, and §O.7's precedence argument is unaffected; re-raising it here would be the
DEC-ERR-01 anti-pattern of routing a question already routed.

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

**What this document is.** The falsifiable proof system for pdlc-learnings-injection: **68 properties**
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
  *Functional · L1 · AC-2.1, BR-5, E-09, E-10, AT-07, AT-08, F-O-7/O-8, TSPEC §T.4 · red LI-07 ·
  green LI-16.*
- **PROP-BOUND-02:** Under the mirror `BYTES-BINDING` fixture (8 documents of 7,000 injectable bytes
  under §4.1's declared values) the contributing count **must** be strictly below `maxDocuments`, with
  `RSN-BYTES` rows and **no** `RSN-COUNT` row — so each bound is asserted where it binds *and* asserted
  not to bind where the other does.
  *Functional · L1 · AC-2.1, BR-5, AT-07 · red LI-07 · green LI-16.*
- **PROP-BOUND-03:** A document whose material exceeds `maxBytesPerDocument` **must** contribute material
  of at most that bound, **must** carry `bounded: true` decided at the cut, and the cut **must** be
  character-safe — the longest character prefix whose UTF-8 length is ≤ the bound, never splitting a
  codepoint.
  *Data Integrity · L1 · AC-2.3, BR-6, E-15, E-16, AT-11, AT-12, TSPEC §D.5 · red LI-08 · green LI-17.*
- **PROP-BOUND-04:** Where the accumulated material would exceed `maxTotalBytes`, whole documents
  **must** be dropped from the **low end** of BR-4's order with `RSN-BYTES`; no document is ever cut
  mid-document to make the total fit; the selected set **must** be a **prefix** of the ordered eligible
  set; and no count-cut document **must** be back-filled into a freed slot.
  *Data Integrity · L1 · AC-2.4, BR-5 no-back-fill, BR-6, E-17, E-18, AT-13 · red LI-07 · green LI-16.*
- **PROP-BOUND-05:** The material taken from an unbounded document **must** be exactly BR-6's five
  priority sections that the document carries, **as an ordered sequence in priority order** (Cross-Feature
  Patterns, Non-Convergences, Rejected Proposals, Process Learnings, Open Items for Consolidation), and
  the Approval Record's text **must** be absent while all five present sections' texts **must** be
  present — both conjuncts, so the oracle is not vacuous on a fixture that never carried the excluded
  section.
  *Data Integrity · L1 · AC-2.3, BR-6, E-19, AT-11 · red LI-08 · green LI-17.*
- **PROP-BOUND-06:** A document carrying **none** of BR-6's five priority sections **must** carry
  `RSN-NO-MATERIAL`, **must** consume no `maxDocuments` slot, **must not** be flagged bounded, and the
  rest of the corpus **must** be used normally.
  *Functional · L1 · BR-6, BR-9, E-33, AT-28 · red LI-07 · green LI-16.*
- **PROP-BOUND-07:** All three §4.1 byte thresholds **must** range over one pool — **material only**.
  `bytesInjected` for a row **must** equal `Buffer.byteLength(material, "utf8")` for that document;
  `totalBytesInjected` **must** equal the sum of the rows' `bytesInjected`; and per-document framing
  (opener, `ABRIDGED` annotation, closer) and block framing (header, preamble, trailer) **must** be
  charged to **no** bound and to no row.
  *Data Integrity · L1 · AC-2.3, AC-2.4, TSPEC §D.5 · red LI-08 · green LI-17.*

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
- **PROP-RECORD-09** *(negative, about the test suite):* **No** test **must** assert on `runMirror`'s
  value. It is additive by upstream decision, its value is deliberately unconstrained, and an
  implementation omitting it entirely conforms — a test pinning it reds a conforming implementation.
  *Contract · L1–L3 · AC-3.2, AC-3.3, BR-9, BR-10, TSPEC §D.2, §T.6 · red LI-10 · green LI-19.*
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
  with BR-8's rows present and empty — never AC-5.1a's absent key, never a refusal to run.
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

### Group I — Gate-input isolation, footprint and preserved semantics *(BR-11, BR-15, BR-16)*

- **PROP-ISOLATE-01:** Over two scripted runs differing **only** in `learningsInjection.enabled`, the
  five recorded gate inputs — parsed verdicts, structural completeness scores, round-window counters,
  approval anchors, erratum routes — **must** be equal member for member, asserted as set equality over
  the five names **and** value equality per member. Contamination **must be made possible** in the
  fixture: the corpus carries **line-initial** `VERDICT:`, `ERRATUM:` and `REVISION-COMPLETE:` lines, and
  the scripted `_agent` echoes the final 200 bytes of the prompt it was handed into its response.
  *Security / Integration · L3 · AC-4.3, G-5, BR-11, AT-29 · red LI-11 · green LI-21.*
- **PROP-ISOLATE-02:** On an enabled run, the completeness criteria, required headings, verdict grammar,
  round windows and approval anchors scoring the documents produced **must** be exactly those in force
  without the feature. No required section, no new heading, no new verdict token, no new approval
  condition, and no SKILL.md text moves.
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
- **PROP-FOOTPRINT-04:** The source span between LI-15's two sentinel comments **must** contain no
  reference to `fs.`, `writeFileSync`, `mkdirSync`, `appendFileSync` or `require("fs")`, asserted by a
  static scan scoped to that span — the check that covers every run, not only the runs a fixture
  exercises.
  *Security · L3 (static) · AC-5.2, NG-4, TSPEC §T.6 · red LI-11 · green LI-15.*

### Group J — Properties of the test apparatus itself

These have owning tasks and oracles because each guards an oracle that would otherwise stop firing
silently — the failure mode a coverage percentage cannot see.

- **PROP-META-01:** The premises suite **must** assert each of P-1…P-10 **structurally, never
  positionally**, and **must never** assert an absence that this PLAN's own tasks are scheduled to
  falsify. The four authoring call sites **must** be asserted as **set equality** keyed by
  `(enclosing named function, prompt-source symbol)` — `(erratumRound, erratumAuthorPrompt)`,
  `(erratumRound, land-proof-retry inline template)`, `(converge, creatorPrompt)`,
  `(reviewLoop, optimizerPrompt — positional argument 4 of runWrapped)` — never by
  `(enclosing function, argument position)`, which is not injective over these four. A **fifth**
  authoring site reds this suite at batch 1.
  *Observability · L1 (static) · TSPEC §A.2 property 1, H-1 · red — · green LI-01 (green on authoring).*
- **PROP-META-02:** `.gitignore` **must** ignore `/.baseline-worktree/` **root-anchored**: three
  conjuncts — the root path **is** ignored, a nested
  `pdlc/workflows/__tests__/fixtures/x/.baseline-worktree` is **not**, and
  `pdlc/workflows/__tests__/fixtures/learnings-baseline/` is **not**. Conjuncts 2 and 3 are what give
  root-anchoring an oracle; a bare `.baseline-worktree`, `*` or `.baseline*` rule passes conjunct 1
  alone while un-tracking fixture material this feature commits.
  *Contract · L1 (against a dedicated temp git repo with real `git`) · TSPEC §T.3 obligation 1 ·
  red LI-03 · green LI-04.*
- **PROP-META-03:** A forced throw injected **between** materialise and remove — through the capture
  script's fixture/import seam, `git` staying real — **must** leave the `.baseline-worktree` path
  **absent** *and* the temp repo's `git worktree list` showing **no entry** for it. The second conjunct
  is what distinguishes `git worktree remove` from `rm -rf` and **must not** be dropped or degraded to
  an argv assertion.
  *Error Handling · L1 (temp git repo) · TSPEC §T.3 obligation 2 · red LI-03 · green LI-05.*
- **PROP-META-04:** The baseline guard **must** anchor on **hand-transcribed** SHA-256 literals — one per
  `{caseId}`, copied by a human from the first capture — asserted against both the recomputed file
  digests **and** `MANIFEST.json`'s entries, with **set equality over the `{caseId}` keys**, never
  containment. Its falsification is LI-06's recorded three-step mutation proof: flip one byte, delete one
  whole `{caseId}` directory, add a spurious one — each step reds a **different** clause, and a step that
  does not red is a halt.
  *Data Integrity · L1 · AC-6.2, TSPEC §T.3, DC-14 · red — (authored green) · green LI-06.*
- **PROP-META-05:** The suite-map closure **must** be taken over the **directory**, not over a hardcoded
  six: enumerate `__tests__/learnings*.test.js` from disk by **static parse of the file text** (never by
  importing the suite), compute the set of files registering at least one `LI-AT-` jest test **title**,
  assert that set **equal** to the six AT-bearing suites, then assert the six declared AT lists pairwise
  **disjoint** and **set-equal** to the 35-member literal `AT-01 … AT-35`.
  *Contract · L1 (static) · TSPEC §T.5 closure, DoD 1 · red — (green on authoring) · green LI-14.*

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
| PROP-DISPATCH-03 (outside-set prompts byte-identical) | PROP-DISPATCH-01 asserts the **inside** set carries a block on the same run and the same instrument |
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

Five claims are placed at L3 because no injectable unit can falsify them, and this placement is a
deliberate cost:

| Claim | Why not L1/L2 |
|---|---|
| PROP-DISPATCH-01/02/03 | the dispatch **universe** is a property of the run, not of a function |
| PROP-CONFIG-04/05 | "rows present and empty" versus "key absent" is a distinction only a finished report carries; an L1 unit over `parseLearningsConfig` sees the parse result and never the report key set |
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
**byte** bound binds first on measured corpora (87 of 89 documents exceed `maxBytesPerDocument` alone),
so a default-threshold fixture would satisfy PROP-BOUND-01 with `RSN-COUNT` unimplemented. The
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
  are pinned by construction relative to the bound, not by an absolute offset.

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
| `BYTES-BINDING` | 2 documents, the second's material straddling `maxTotalBytes` | a whole-document drop where a per-document bound was specified, and back-fill |
| `DIVERGENT-CORPUS` | 4 dispatches, dispatch 3 alone enumerating unlistable | `corpusOutcome` recorded run-wide instead of per dispatch; and the healthy `null` |
| `RETRY-ITERATION` | one dispatch driven to a second `for(;;)` iteration | per-iteration re-selection (PROP-DISPATCH-04) |
| `MALFORMED-CONFIG` | `learningsInjection` present but not an object | `NTC-MALFORMED` conflated with disablement |
| `KEYTYPE-CONFIG` | `maxDocuments: "5"` beside two valid numbers | a wrong-typed key silently coerced or silently disabling |
| `NO-MATERIAL` | one document with all five BR-6 sections **absent** and an Approval Record present | `RSN-NO-MATERIAL` implemented as "document empty" |
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
- **The five BR-6 section headings** — `Cross-Feature Patterns`, `Non-Convergences`,
  `Rejected Proposals`, `Process Learnings`, `Open Items` — transcribed from the harvest-learnings
  skill's "LEARNINGS Format" section, the source the real corpus is written against. All 9 HEAD
  corpus documents were checked to carry them in this spelling.
- **The three frozen catalogues** — `LEARNINGS_REJECT_REASONS`, `LEARNINGS_CORPUS_OUTCOMES`,
  `LEARNINGS_NOTICES` — transcribed member-for-member from TSPEC §D.2 into the arm-inventory test as
  set-equality expectations (PROP-FAILOPEN-01, PROP-RECORD-03, PROP-CONFIG-07).

### F.4 Seam doubles

L2 properties drive `helpers/seams.js`'s `fakeFs` (`:245`) and `fakeGit` (`:413`), re-exported through
`helpers/consolidationDoubles.js` (`:35`). Call logs on those doubles are the operands for every
call-count oracle in §O.3 and for PROP-FOOTPRINT-01/02. The `_recordDocType` and `_readFile` probe
seams are injected the same way `advisoryDisabled.test.js:70` injects `mainDev`; no property in this
document reads a private module binding directly.

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
| AT-30 | Zero thresholds ⇒ enabled, rows present and empty | PROP-CONFIG-04, PROP-RECORD-02 |
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

| AC | Properties |
|---|---|
| AC-1.1 | PROP-DISPATCH-01 |
| AC-1.2 | PROP-DISPATCH-01, PROP-DISPATCH-02, PROP-DISPATCH-03 |
| AC-1.3 | PROP-CORPUS-05 |
| AC-1.4 | PROP-BLOCK-01, PROP-BOUND-07, PROP-DISPATCH-05 |
| AC-2.1 | PROP-BOUND-01, PROP-BOUND-02, PROP-ORDER-05 |
| AC-2.2 | PROP-CORPUS-08, PROP-ORDER-01, PROP-ORDER-03 |
| AC-2.3 | PROP-BLOCK-02, PROP-BOUND-03, PROP-BOUND-05, PROP-BOUND-07, PROP-ORDER-05 |
| AC-2.4 | PROP-BOUND-04, PROP-BOUND-07, PROP-ORDER-05 |
| AC-2.5 | PROP-CORPUS-08, PROP-ORDER-03, PROP-ORDER-05 |
| AC-2.6 | PROP-CORPUS-03, PROP-CORPUS-04 |
| AC-3.1 | PROP-BLOCK-03, PROP-RECORD-01, PROP-RECORD-02 |
| AC-3.2 | PROP-BLOCK-03, PROP-RECORD-03, PROP-RECORD-04, PROP-RECORD-05, PROP-RECORD-08, PROP-RECORD-09 |
| AC-3.3 | PROP-BLOCK-03, PROP-CONFIG-08, PROP-RECORD-06, PROP-RECORD-07, PROP-RECORD-09, PROP-RECORD-10 |
| AC-3.4 | PROP-BLOCK-03, PROP-RECORD-11 |
| AC-4.1 | PROP-DISPATCH-06, PROP-RECORD-11 |
| AC-4.2 | PROP-CORPUS-06, PROP-FAILOPEN-02, PROP-RECORD-11 |
| AC-4.3 | PROP-DISPATCH-03, PROP-DISPATCH-07, PROP-ISOLATE-01 |
| AC-4.4 | PROP-CONFIG-04, PROP-DISPATCH-06, PROP-FAILOPEN-04 |
| AC-5.1a | PROP-CONFIG-01, PROP-CONFIG-04, PROP-CONFIG-05, PROP-FAILOPEN-04 |
| AC-5.1b | PROP-CONFIG-01, PROP-CONFIG-02, PROP-CONFIG-06, PROP-FAILOPEN-04 |
| AC-5.1c | PROP-CONFIG-03, PROP-CONFIG-06, PROP-FAILOPEN-04 |
| AC-5.2 | PROP-CORPUS-02, PROP-FOOTPRINT-01, PROP-FOOTPRINT-02, PROP-FOOTPRINT-03, PROP-FOOTPRINT-04 |
| AC-5.3 | PROP-ISOLATE-02 |
| AC-6.1 | PROP-META-05 (suite-map closure), PROP-META-01 (no live-run comparison), and every L1/L2 row above — AC-6.1 is a statement *about* the suite, discharged by the partition rather than by a behaviour |
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
| LI-08 | PROP-DISPATCH-06, PROP-BOUND-03/05/07, PROP-BLOCK-01/02/03 | — |
| LI-09 | PROP-CORPUS-02/06/08, PROP-FAILOPEN-03/04 | — |
| LI-10 | PROP-RECORD-01…10 | — |
| LI-11 | PROP-DISPATCH-01/02/03/04/05/07, PROP-ORDER-05, PROP-RECORD-11, PROP-FAILOPEN-02/03, PROP-ISOLATE-01/02, PROP-FOOTPRINT-01/02/03/04 | — |
| LI-12 | PROP-CONFIG-01…08 | — |
| LI-13 | PROP-CORPUS-01 | — |
| LI-14 | — | PROP-META-05 |
| LI-15 | — | PROP-CORPUS-01, PROP-FOOTPRINT-04 |
| LI-16 | — | PROP-CORPUS-03/04/05/07/09, PROP-ORDER-06, PROP-ORDER-01/02/03/04, PROP-BOUND-01/02/04/06, PROP-FAILOPEN-04 |
| LI-17 | — | PROP-DISPATCH-06, PROP-BOUND-03/05/07, PROP-BLOCK-01/02/03 |
| LI-18 | — | PROP-CORPUS-02/06/08, PROP-FAILOPEN-03/04 |
| LI-19 | — | PROP-RECORD-01…06, PROP-RECORD-08/09/10 |
| LI-20 | — | PROP-DISPATCH-01…05, PROP-DISPATCH-07, PROP-ORDER-05, PROP-FAILOPEN-03, PROP-FOOTPRINT-01/03, PROP-ISOLATE-02 |
| LI-21 | — | PROP-CONFIG-01…08, PROP-FAILOPEN-01/02, PROP-RECORD-03/04/07/11, PROP-FOOTPRINT-02/03, PROP-ISOLATE-01 |
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
| Properties in this document | 66 | Groups A–J |
| FSPEC acceptance tests | 35 | TSPEC §T.5's partition, asserted by PROP-META-05 |
| ATs covered by ≥1 property | 35 | §C.1 |
| PLAN tasks | 23 | LI-01…LI-23 |
| Tasks owning ≥1 property | 21 | §C.3 (LI-02 and LI-22 own none, both by design) |
| Properties with **no** owning task | 0 | §C.3 |
| Fail-open arms | 12 | TSPEC §T.7, mechanised by PROP-FAILOPEN-01 |

Two named test files this document depends on **do not yet exist** — `learningsSelect.test.js`,
`learningsBlock.test.js`, `learningsCorpus.test.js`, `learningsRecord.test.js`,
`learningsDispatchSet.test.js`, `learningsConfig.test.js`, `learningsArmInventory.test.js`,
`learningsCaptureScript.test.js`, `helpers/learningsFixtures.js` and
`fixtures/learnings-baseline/` are all **planned new** files (PLAN §Manifest rows; a
`ls pdlc/workflows/__tests__ | grep learnings` on `HEAD` returns nothing). Every one is explicitly
planned; **no property in this document names a test file the PLAN does not create.** Likewise
`scripts/capture-learnings-baseline.mjs` is new — the repository has no root-level `scripts/`
directory today, and LI-05's row says so.

## Gaps, Obligations and Routed Errata

### G.1 Carried TSPEC obligations, discharged here

| Obligation | Discharged by |
|---|---|
| **T-O-4** — `orderCorpus` output is a permutation of its input and the comparator is a strict weak ordering | **PROP-ORDER-06**, parameterised per §O.9 |
| **T-O-5** — `selectLearnings` is total: no throw, every input path exactly once across `selected ∪ rejected` | **PROP-CORPUS-09**, parameterised per §O.9 |
| **T-O-6** — `extractInjectableMaterial`: `bytes === Buffer.byteLength(material)`, `bytes <= maxBytes`, whole-character prefix, `bounded` true exactly when cut | **PROP-BOUND-03** (example arm, AT-11/AT-12) **plus** §O.9's generated arm, which is the half that makes the all-inputs claim of §D.5 checkable |

All three land on tasks that already exist (LI-07 red / LI-16 green for T-O-4 and T-O-5; LI-08 red /
LI-17 green for T-O-6's example arm, with the generated arm folded into the same suites). **No new
PLAN task is required**, and no obligation is deferred to implementation.

### G.2 Known gaps in this document

1. **`maxBytesPerDocument: 0` is undecided upstream and therefore untested here.** AT-30 exercises
   `maxDocuments: 0` and `maxTotalBytes: 0` only. §4.1 admits `0` as a valid non-negative threshold, so
   the third zero is reachable by configuration, and REQ AC-4.4's "zero bytes" branch does not say
   whether the outcome is `RSN-NO-MATERIAL`, `RSN-BYTES`, or a zero-byte contribution. **No property
   asserts it**, deliberately: inventing the answer here would freeze a guess into the suite. Routed as
   an erratum below; when FSPEC decides, the property belongs in Group H beside PROP-CONFIG-04 and
   costs one case in `learningsConfig.test.js`.
2. **Byte accounting of framing is specified two ways.** TSPEC §D.5 says material only, framing never
   charged; FSPEC BR-6's worked example charges the identification line and delimiters. PROP-BOUND-07
   and PROP-BLOCK-02 are written to **TSPEC's** reading, because PLAN LI-08's hand-computed AT-11/AT-12
   counts are computed that way and the fixtures follow. If FSPEC's reading is the intended one, both
   properties' expected counts change and LI-08's row changes with them. Routed as an erratum.
3. **`runMirror` is deliberately unasserted** (PROP-RECORD-09). This is a gap by decision, not by
   oversight: upstream leaves its value unconstrained, an implementation omitting it entirely conforms,
   and a test pinning it would red a conforming implementation. If a later revision constrains it, this
   negative property must be retired in the same change.
4. **Mutation testing is not mechanised.** §O.8's ledger is a written obligation checked by a reviewer,
   not by a tool. The `--per-file --branches 85` gate cannot see a ~300-line region inside a
   15,311-line module (`orchestrate-dev.js` sits at 88.14 %), which is precisely why PROP-FAILOPEN-01
   exists as the mechanical substitute for the coverage claim. The residual risk — a mutation in O.8's
   list that no test catches — is not currently detected by CI.
5. **Real-agent behaviour is out of scope.** Every property is asserted against scripted `_agent`
   replies. Whether an author agent's *output quality* improves from an injected block is unfalsifiable
   here, and REQ's non-goals say so; PROP-ISOLATE-01/02 assert only that the block cannot change gate
   inputs or pipeline semantics.

### G.3 Routed errata

Emitted as line items in this dispatch's final message; **no upstream document was edited.**

- FSPEC's BR-6 worked example versus TSPEC §D.5 on framing bytes (gap 2 above).
- FSPEC's missing edge decision for `maxBytesPerDocument: 0` (gap 1 above).
- TSPEC's AT-11 byte count, which inherits FSPEC's framing arithmetic and so cannot be right if §D.5 is.
- TSPEC's suite assignment for AT-15, whose clauses 2–3 (corpus-level `RSN-EMPTY`, no discarded document
  in any record) are asserted at L2/L3 while §T.5 lists AT-15 wholly under the L1 selection suite — the
  mismatch PLAN LI-07/LI-19 already work around by carrying an expected-red ledger entry.

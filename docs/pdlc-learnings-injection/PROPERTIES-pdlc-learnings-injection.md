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

## Fixtures

## Coverage Matrix

## Gaps, Obligations and Routed Errata

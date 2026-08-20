---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# TSPEC — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** — `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.5); `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v1.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1.md`, `CROSS-REVIEW-product-manager-TSPEC-v2.md`, `CROSS-REVIEW-test-engineer-TSPEC-v2.md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.4 | 2026-08-19 |

## Scope

This TSPEC owns the seven questions FSPEC §Open Questions hands it (F-O-1 … F-O-7) plus the
implementation shape they imply: **where the selection step lives, what its signature is, how the
block reaches the composer, what the record's serialised form is, and how each catalogue id is
registered.** Behaviour — eligibility, ordering, bounding, section choice, labelling, and the
outcome of every corpus state — is FSPEC's and is referenced by rule id (BR-1 … BR-16), never
restated.

### What is being built, in one paragraph

One new region of `pdlc/workflows/orchestrate-dev.js`: a pure selector (`selectLearnings`) over an
already-read corpus, a thin IO shell (`gatherLearningsCorpus`) that reaches the filesystem through
seams the module already injects, a config parser (`parseLearningsConfig`) modelled on the
`parseAdvisoryConfig` sibling three hundred lines above it, and a per-run closure
(`buildLearningsInjector`) that `main()` hangs off `wrapperSeams` so that every dispatch REQ C-1
names — `dispatchKind: "authoring"` **and** a target document type in C-1's six — picks it up at one
place, `dispatchAndVerify`, rather than at each of its four call sites. The block is appended to the composed prompt as a
suffix that is the empty string whenever nothing is selected, which is what makes AC-4.1's and
AC-5.1a's byte-identity claims hold by construction rather than by test.

### Grounded premises

Every claim below was checked against this repository at HEAD on 2026-08-19.

| # | Claim | Evidence |
|---|---|---|
| P-1 | The engine vendors exactly two workflow modules, so a *new file* under `pdlc/workflows/` would not reach a consumer repository | `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`, `pdlc/engine/scripts/prepack.mjs:20` |
| P-2a | **Four code sites** carry `dispatchKind: "authoring"` at HEAD | `orchestrate-dev.js:13515` (phase creator, in `converge`), `:7663` (review-loop optimizer, positional argument to `runWrapped`), `:12821` (erratum author), `:12915` (erratum land-proof retry) |
| P-2b | Those four code sites produce **five run-time dispatch shapes**, because `reviewLoop` is shared: `converge()`'s document phases call it with a `docType`, and Phase CR calls it with `docType: null` over a directory target | Phase CR's call passes `doc: "docs/{feature}/"`, `phase: "CR"`, `docType: null`, `orchestrate-dev.js:14551-14556`; `roundDocType = docType === undefined ? docTypeFromPath(doc) : docType` (`:7306`) therefore stays `null`, and `wrapped` forwards it as `dispatchAndVerify`'s `docType` (`:7342-7358`) |
| P-2c | `dispatchKind` alone is therefore **wider** than REQ C-1: C-1's rule is authoring-classified **and** target document ∈ {REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES}, which Phase CR's optimizer (`se-author` remediating shipped code) does not satisfy | REQ C-1 ("whose target document is REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES"), NG-5 |
| P-3 | All four funnel through one function, which already receives every seam this feature needs | `dispatchAndVerify({… dispatchKind, feature, _readFile, _listFiles, _git, _log})`, `orchestrate-dev.js:8862-8878`; that function composes `prompt` from `basePrompt`, `PACING_CONTRACT_CLAUSE` and `opener` at `:8978` |
| P-4 | The corpus predicate is a single `git ls-files` argv, not a directory walk | `LS_FILES_ARGV`, `pdlc/workflows/consolidate-learnings.js:1338-1346`, consumed by `enumerateCorpus` at `:1349-1355` |
| P-5 | That predicate, run at HEAD, yields 9 documents, 9 of which carry a `Date Completed` row whose value is a bare ISO date | `git ls-files --cached --others --exclude-standard -- ':(glob)docs/*/LEARNINGS-*.md' ':(glob)docs/completed/*/LEARNINGS-*.md'`, cross-checked against each file's line 7 |
| P-6 | Every corpus document's first line is `# LEARNINGS — {feature}`, and the section headings are the `## N. Title` form | measured over all 9; the form is what `pdlc/skills/harvest-learnings/SKILL.md` §"LEARNINGS Document Format" writes |
| P-7 | `_git(argv)` returns `{ok, stdout, stderr}` and never throws, on both channels | `defaultGit`, `orchestrate-dev.js:11658-11676`; `rtGit`, `pdlc/workflows/runtime-adapter.js:1003` |
| P-8 | `_readFile(path)` returns `null` for an absent file and may **throw** on transport failure | `defaultReadFile`, `orchestrate-dev.js:11513-11519` (returns `null` on any error); `rtReadFile`, `runtime-adapter.js:493-505` (returns `null` for absent, rethrows an exhausted probe) |
| P-9 | The runtime read seam already carries a revalidating cache, so a re-read of an unchanged document costs one probe rather than a full chunked read — but the budget is **shared across every read the run makes**, with oldest-inserted eviction, so cache residency is not guaranteed to this corpus | `rtReadFile`'s `rtCacheGet`/size+sha revalidation, `runtime-adapter.js:494-522`; `RT_READ_CACHE_MAX_BYTES = 2097152`, `:124`; `rtCachePut`'s eviction loop, `:459-465` |
| P-10 | A conditionally-spread report key is the shipped way to express "absent, not present-and-empty" | `...(advisory ? { advisory } : {})` in `buildFinalReport`, `orchestrate-dev.js:15167` |
| P-11 | The malformed-section reading this feature copies is "present and not a plain object" | `parseAdvisoryConfig`: `if (!isPlainObject(parsed) \|\| !("advisory" in parsed)) return degraded(false); … if (!isPlainObject(section)) return degraded(true)`, `orchestrate-dev.js:1980-1983` |
| P-12 | Per-key independent fallback plus an `invalidKeys` list is that same sibling's shape | `parseAdvisoryConfig`'s `boolField`/`positiveInt`/`positiveNumber` helpers, `orchestrate-dev.js:1985-2010` |

### Out of scope for this TSPEC

Threshold *values* (REQ §4.1 owns them; this document references them by name only — DC-18), the
ordering key's choice (FSPEC BR-4), the section subset (FSPEC BR-6), and any widening to review
roles (REQ O-6).

## Architecture

### A.1 Placement — one module, four functions, no new file *(discharges F-O-6)*

Everything ships **inside `pdlc/workflows/orchestrate-dev.js`**. P-1 forces it: `prepack.mjs`
vendors exactly `orchestrate-dev.js` and `orchestrate-queue.js` into `pdlc/engine/vendor/workflows/`,
so a new sibling module would be present in this repository's test run and absent from every
consumer repository the engine installs into — the feature would pass CI and be missing in
production. The alternative (extend `MODULE_NAMES`) is a change to the engine's distribution
contract for one feature's convenience and is rejected; see DECISIONS.

New region, placed immediately after `parseAdvisoryConfig`/`readAdvisoryConfigSafely`
(`orchestrate-dev.js:1964-2050`) so the two config readers a reviewer must compare sit adjacent:

| Symbol | Kind | Purity |
|---|---|---|
| `LEARNINGS_CORPUS_ARGV` | frozen literal | — |
| `LEARNINGS_DEFAULTS`, `RSN_*`, `NTC_*` catalogues | frozen literals | — |
| `parseLearningsConfig(text)` | pure | no IO, never throws |
| `readLearningsConfigSafely(readFileFn, path)` | IO | never throws |
| `looksLikeLearningsDocument(text)` | pure | — |
| `parseHarvestDate(text)` | pure | — |
| `extractInjectableMaterial(text, maxBytes)` | pure | — |
| `orderCorpus(entries)` | pure | total order |
| `selectLearnings({entries, feature, thresholds})` | pure | the whole selection rule |
| `gatherLearningsCorpus({feature, _git, _readFile})` | IO shell | never throws |
| `renderLearningsBlock(selection)` | pure | — |
| `buildLearningsInjector({config, sink, _git, _readFile, _log})` | factory | returns an async closure or `null` |

(BR-14's notices are pushed by `main()` onto the same `sink` before the injector is built, so the
injector takes no `notices` parameter; §I.4's signature is the one signature, and §A.2's diagram
agrees with it.)

The split is the testability contract: **every rule FSPEC states is in a pure function**, and the
only impure member is the twelve-line shell that turns two seam calls into the array the pure
functions consume. AC-6.1's "no live model calls" then holds for the whole of Groups 2–4 without a
harness, because those tests never touch the shell.

### A.2 Control flow, and the one place it attaches

```
main()
 ├─ readLearningsConfigSafely(readFileFn, LEARNINGS_CONFIG_PATH)   ← ONCE per run
 ├─ parseLearningsConfig(text) → {config, sectionMalformed, invalidKeys}
 ├─ sink.notices.push(NTC-MALFORMED / NTC-KEYTYPE …)               ← BR-14
 ├─ injector = buildLearningsInjector({...})                       ← null when disabled
 └─ wrapperSeams._injectLearnings = injector
      ├─ converge() ──────────► wrappedDispatch ─┐
      ├─ routeErrata() ───────► wrappedDispatch ─┼─► dispatchAndVerify
      └─ reviewLoop() ────────► runWrapped ──────┘        │
                                                          │  INJECTION_TARGET(dispatchKind, docType)
                                                          ▼
                                        block = await _injectLearnings({feature, docType, phaseId})
                                        prompt = basePrompt + PACING + opener + block   (per iteration)
```

**The attachment condition, in full.** The block is composed when **both** hold:

```js
export const LEARNINGS_TARGET_DOCTYPES = Object.freeze([
  "REQ", "FSPEC", "TSPEC", "PLAN", "DECISIONS", "PROPERTIES",
]);
const injectHere =
  dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType);
```

When `injectHere` is false the injector is **not called at all**: no corpus is enumerated, no
document is read, no `dispatches[]` row is recorded and the block is `""`. Phase CR's optimizer
round therefore contributes nothing to AC-3.1's rows and nothing to AC-5.2's filesystem footprint,
and its prompt is byte-identical to the disabled run's. `LEARNINGS_TARGET_DOCTYPES` is a frozen
array for the same reason D.1's catalogues are (DC-14): AT-02's expected authoring subset is
hand-transcribed against C-1's six names, not imported from this constant.

Three properties of this attachment carry the load:

1. **One attachment point, four call sites — and a target-document test the classification does
   not give.** P-2a/P-3: all four `dispatchKind: "authoring"` code sites reach `dispatchAndVerify`,
   and it is the only function that sees both `dispatchKind` and `docType` at composition time.
   Attaching there is what keeps BR-1 from restating a call-site membership list that would drift
   the moment a fifth site appeared. But `dispatchKind` **alone is wider than REQ C-1** (P-2b,
   P-2c): `reviewLoop` is shared, and Phase CR calls it with `docType: null` over a directory
   target (`orchestrate-dev.js:14551-14556`), so its optimizer round — `se-author` remediating the
   shipped codebase — is authoring-classified while being exactly what C-1's "whose target document
   is REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES" and NG-5 exclude. The `docType` conjunct is
   therefore load-bearing, not defensive: without it AC-1.2's set equality fails against a strict
   superset, AC-4.3's byte-identity for non-authoring dispatches fails on every full pipeline run,
   and R-4's imported prior-feature decisions would reach code remediation. `docType` is still the
   pipeline's own value, not a new taxonomy — the condition consumes two existing fields rather
   than one, and both are already carried to the composition point. FSPEC BR-1 as written forbids
   this conjunct ("consumes the classification, it does not restate the membership"), and AT-02's
   expected set inherits the ambiguity, so the divergence is **routed as ERR-7**, not resolved
   silently in code (TE F-06).

   **The coincidence is an invariant, and it is asserted, not assumed.** That
   `LEARNINGS_TARGET_DOCTYPES` currently equals the `docType` set `converge()` drives at HEAD —
   `REQ` (`orchestrate-dev.js:13766`), `FSPEC` (`:13774`), `TSPEC` (`:13807`), `DECISIONS`
   (`:13874`), `PLAN` (`:13893`), `PROPERTIES` (`:13996`) — is today a coincidence between a
   product boundary (C-1, NG-5) and this pipeline's phase list, and nothing structural keeps the
   two equal: a seventh authoring phase added later would reach `dispatchAndVerify` carrying a
   `docType` this feature never decided to feed. `learningsDispatchSet.test.js` therefore carries a
   **set-equality assertion over the `docType`s that actually reach the injector** on a full
   scripted run, against the hand-transcribed literal `LEARNINGS_TARGET_DOCTYPES` (DC-14) — so a
   new phase reds this test and forces a product decision, rather than silently inheriting
   injection. This is the oracle that makes NG-5's boundary mechanical instead of documentary.

   **The assertion ranges over the composition site, not over the report rows (TE Q-01).** The two
   candidate operands are not equivalent, and only one catches the case the assertion exists for.
   `dispatches[i].docType` is written only for dispatches that were *accepted* — a seventh
   authoring phase whose `docType` reaches `dispatchAndVerify` and is **rejected** by `injectHere`
   produces no `dispatches[]` row at all, so a report-sourced set equality stays green through
   exactly the drift it was written to detect. The operand is therefore the set of `docType`s
   **observed at the composition site**, sampled on both arms of `injectHere`: a
   `_recordDocType(docType)` probe seam, defaulted to a no-op and injected only by this suite,
   called in `dispatchAndVerify` immediately *before* `injectHere` is evaluated, and asserted
   set-equal to the hand-transcribed `LEARNINGS_TARGET_DOCTYPES` literal (DC-14) after a full
   scripted run. The probe is a test seam on the module's established `_`-prefixed idiom, not
   production behaviour, and it is the only instrument that sees a `docType` the feature declined.

   Two consequences a PLAN task must carry. First, the run driving it has to exercise every
   authoring phase — a scripted matrix short of the six `converge` doc types makes the equality
   pass by omission, so the fixture asserts the observed set equals the literal, never merely that
   it is contained in it. Second, `null` is an expected member of the observed set (Phase CR,
   P-2b), so the assertion's expected value is `LEARNINGS_TARGET_DOCTYPES ∪ {null}` at the
   composition site while `LEARNINGS_TARGET_DOCTYPES` alone is the accepted set — the difference
   between the two is precisely the `docType` conjunct's work, and asserting both makes P-2c's
   claim falsifiable rather than narrated.

2. **Once per episode, not once per invocation.** `dispatchAndVerify`'s `for(;;)` loop may compose
   the prompt several times for one dispatch (the pacing budget). The injector is called **once,
   before the loop**, and the resulting string is held in a `const` and concatenated into every
   iteration's prompt. The loop legitimately mutates `opener` per iteration (the near-miss hint and
   the PLAN-lint feed-forward clause, `orchestrate-dev.js:8972-8977`); the block is concatenated
   **after** the mutated `opener` at composition time (`:8978`), so a retry iteration carries the
   *same block bytes* appended to a *possibly different* opener. **No FSPEC AT owns this invariant, so TSPEC names the case
   (TE F-02).** AT-23 does *not* pin it — AT-23 is about author-emitted channels equalling the
   pre-feature baseline set — and no other AT is even incidentally sensitive to per-iteration
   re-selection: an implementation calling the injector inside the `for(;;)` loop still passes
   AT-02 (set equality over *which* dispatches carry a block, not how often it is produced),
   AT-33 (the same read paths, merely re-read) and AT-14 (two whole-process runs, not two
   iterations of one loop). The failure mode is real: re-selection on iteration 2 over a corpus
   that moved mid-dispatch yields different block bytes inside a single dispatch, and duplicate
   `dispatches[]` rows for it. The `RETRY-ITERATION` fixture (§T.6) is the owning case. That is
   what "re-composed per authoring dispatch" (FSPEC BR-1, E-29) means operationally: one selection,
   one record row-set, per dispatch — not per retry.
3. **A suffix, never an insertion.** The block is appended after `opener`, so the existing
   `basePrompt` / `PACING_CONTRACT_CLAUSE` / `opener` text and its order are untouched (BR-7, C-8).
   `_injectLearnings` returns `""` — not a marker, not a header — whenever nothing is selected, so
   `prompt` is **character-for-character** the pre-feature string on a disabled run, an empty
   corpus, an unlistable corpus, and an admits-nothing configuration. AC-4.1's, AC-5.1a's and
   AT-24's byte-identity are then structural, not something a test discovers.

`reviewLoop` must thread the new seam: it already spreads `wrapperSeams`, so it needs
`_injectLearnings` added to its destructured parameter list (defaulting to `null`) and forwarded
in `wrapped`'s `dispatchAndVerify` call (`orchestrate-dev.js:7342-7358`). No other function changes
shape.

### A.3 The IO shell, and why it is two seam calls

`gatherLearningsCorpus` makes exactly two kinds of call, both on seams `dispatchAndVerify` already
holds:

| Step | Seam | Failure handling |
|---|---|---|
| Enumerate | `_git(LEARNINGS_CORPUS_ARGV)` — P-4's literal argv | `!reply.ok` ⇒ `{unlistable: true}` ⇒ corpus-level `RSN-UNLISTABLE` (BR-12) |
| Read each path | `_readFile(path)` | `null` **or throw** ⇒ that document alone gets `RSN-UNREADABLE` (P-8; the `try/catch` is mandatory, since `rtReadFile` throws where `defaultReadFile` returns `null`) |

**Why `_git` and not `_listFiles`.** `_listFiles` is non-recursive and returns basenames only
(`defaultListFiles`, `orchestrate-dev.js:11586-11605`), so reconstructing C-3's two-level,
tracked-and-untracked-but-not-ignored predicate from it would require three listings plus a
reimplementation of `.gitignore` — a *different* predicate wearing the same name. The whole of
REQ C-3/O-7 is that this feature uses **the predicate consolidation ships**, and that predicate is a
git pathspec (P-4). Using the same argv also makes `docs/discarded/{feature}/` fall outside by the
`:(glob)` semantics (`*` does not cross `/`) rather than by an exclusion rule of our own, which is
precisely what BR-2 requires.

**The whole shell is wrapped in one `try/catch` returning the unlistable outcome**, which is
BR-12's last row ("selection step fails in any other way ⇒ empty block, `RSN-UNLISTABLE`"). Nothing
in this feature can throw past `dispatchAndVerify`.

### A.4 Cost, stated plainly

On the plain-Node channel the shell is one `git ls-files` plus N `readFileSync` calls — negligible.
On the Claude Code runtime channel both seams are model-mediated, and this is the feature's real
cost: the first authoring dispatch of a run pays a chunked read of every corpus document (measured
at HEAD: 9 documents, 300,152 bytes total, mean 33,350). Every later authoring dispatch pays one
*probe* per document instead of a full read, **where the entry is still resident**, because
`rtReadFile` revalidates a cached entry by size+sha and serves the cached text when they match
(P-9). Residency is not a guarantee this design can make: `RT_READ_CACHE_MAX_BYTES` is a *shared*
2 MiB budget with oldest-inserted eviction across every read the run makes
(`runtime-adapter.js:459-465`), and 300,152 bytes of LEARNINGS competes with the run's spec,
cross-review and code reads. The honest claim is that the corpus *can* fit and that a warm probe is
the cheap path when it does — the probe-vs-full-read count T-O-3 asks the operator to report is the
measurement that would settle it, and it is asked for precisely because this claim is not
structural.

Two consequences are recorded rather than designed around:

- **A run-scoped memo is rejected.** It would make the second dispatch cheaper still, but FSPEC
  E-32 requires each dispatch to select over the state *it* observed, and AT-14 deliberately
  demands two separate process invocations so an in-process cache cannot masquerade as determinism.
  The adapter's revalidating cache is the correct mechanism precisely because it *re-observes*.
- **The read is unbounded even though the injection is bounded.** `maxBytesPerDocument` bounds what
  is injected, not what is read; a 50 KB LEARNINGS document is read whole to find its
  `Date Completed` row and its priority sections. Bounding the read would need a seam that can
  return a byte range, which neither channel offers. This is the dominant term in REQ O-1's
  measurement and is carried to it explicitly (T-O-3).

### A.5 Threading the record to the report

`main()` owns a run-scoped sink, in the shape `notices` already has
(`orchestrate-dev.js:12110`): an array of per-dispatch records plus at most one corpus-level
outcome and one rule-input record.

**The run-level singletons are LAST-WRITE-WINS, and every dispatch's own values are also kept on
its own row.** Selection runs per dispatch over the state that dispatch observed (E-32, and AT-14
forbids an in-process memo), so two dispatches in one run may legitimately observe different
corpora — different `orderKeys`, or dispatch 1 listable and dispatch 5 `RSN-UNLISTABLE`. The rule:

| Field | Scope | Rule |
|---|---|---|
| `corpusOutcome` | run-level | the value the **last** authoring dispatch of the run observed |
| `ruleInputs` | run-level | the `orderKeys`/`thresholds` the **last** authoring dispatch observed |
| `dispatches[i].corpusOutcome` | per-dispatch | that dispatch's own value, always recorded |
| `dispatches[i].orderKeys` | per-dispatch | that dispatch's own ordering keys, always recorded |
| `dispatches[i].corpusDiverged` | per-dispatch | `true` iff this dispatch's `{corpusOutcome, orderKeys}` differ from the immediately preceding authoring dispatch's; **`false` — never `null` — on the first dispatch of a run**, which has no predecessor to differ from (TE Q-02), so `dispatches.every(r => r.corpusDiverged === false)` is a valid stable-corpus assertion |

Last-write-wins is chosen over first-write-wins because the run-level record is an operator's
*current-state* summary and the last dispatch is the one closest to the state on disk when the run
ended; it is chosen over "conflict is a notice" because a divergent corpus is not an error — a
LEARNINGS file legitimately lands mid-run — and BR-14's notice catalogue is about configuration
defects, not corpus movement. `corpusDiverged` is what makes the divergence *visible* without
inventing an outcome id.

**Scoping AC-3.3, and what is left to REQ.** AC-3.3 states the reproduction inputs live in "the
report's **run-level** record", and its *Given* is an operator reproducing the selection "against
the same repository state" (REQ AC-3.3). On a **stable corpus** — every authoring dispatch of the
run observing the same `{corpusOutcome, orderKeys}` — the run-level record *is* the locus AC-3.3
names, and last-write-wins is an identity: this design satisfies AC-3.3 as written, unchanged.
The divergent case is one AC-3.3's *Given* does not contemplate: there is no single "same
repository state" to reproduce against, so a single run-level record cannot be the locus for every
dispatch. The per-dispatch `{corpusOutcome, orderKeys, corpusDiverged}` fields are TSPEC's
**extension** for that case, not a reinterpretation of AC-3.3's locus, and they are additive —
nothing AC-3.3 requires is removed. Whether AC-3.3's locus should be restated to name the
per-dispatch row for divergent runs is a **product decision about the record's contract**, not an
engineering one, so it is routed as an erratum against REQ AC-3.3 (**ERR-6**) rather than settled
here. Until REQ answers, the run-level record remains the stated locus and the per-dispatch rows
are the mechanism that keeps a divergent run reconstructable; the design does not change under
either resolution — only which rows AC-3.3's completeness test is asserted over.

The determinate expected value a test needs therefore exists on both sides: `DIVERGENT-CORPUS` (a
new §T.6 fixture, five authoring dispatches where the scripted `_git` reply gains one path after
dispatch 2 and fails at dispatch 5) asserts the run-level scalars equal dispatch 5's observation,
each `dispatches[i]` carries its own, and `corpusDiverged` is `true` on exactly dispatches 3 and 5.

`buildLearningsInjector` closes over the sink and pushes on each
call; `buildFinalReport` receives it as one new parameter and spreads it **conditionally**, on
P-10's `advisory` precedent, so a disabled run's report has **no such key at all** (AC-5.1a) while
an enabled run with an empty selection has the key present with empty rows (AC-4.4). Those two
states differ by key presence, which is exactly the distinction REQ AC-4.4 names.

## Interfaces

Every signature below is a new export of `pdlc/workflows/orchestrate-dev.js` unless marked
*module-private*. Types are given in the JSDoc dialect the module already uses.

### I.1 The corpus predicate, restated *(discharges F-O-4 / REQ O-7)*

```js
/** The literal argv `consolidate-learnings.js` hands `_git` (LS_FILES_ARGV, :1338-1346),
 *  restated here because the engine vendors only orchestrate-dev.js (prepack.mjs:20). */
export const LEARNINGS_CORPUS_ARGV = Object.freeze([
  "ls-files", "--cached", "--others", "--exclude-standard", "--",
  ":(glob)docs/*/LEARNINGS-*.md",
  ":(glob)docs/completed/*/LEARNINGS-*.md",
]);
```

**The pin is an agreement oracle, not a second transcription.** `LS_FILES_ARGV` is module-private in
`consolidate-learnings.js` — it is only ever *handed* to `_git`. So the pinning test drives
`enumerateCorpus(fakeGit)` and asserts that the argv the fake observed `toEqual`s
`LEARNINGS_CORPUS_ARGV` (T-PIN-1, §Test Strategy). This is a genuine cross-module agreement check:
if either side changes its pathspec, the test reds. It is available at test time even though the
import is not available at runtime — both modules live in `pdlc/workflows/` in this repository, and
only the *vendored* subset is narrowed.

**Which `fakeGit`, and how many transcriptions.** `consolidationPredicate.test.js` establishes the
idiom, and `learningsPredicatePin.test.js` follows *that* file exactly: it imports `fakeGit` from
`__tests__/helpers/consolidationDoubles.js` (which re-exports `mergeDoubles.js`'s), calls
`enumerateCorpus(git._git)` and asserts over `git.calls`. That is **not** `seams.js`'s `fakeGit`,
which *is* the seam function and records to `git.invocations` — the two are not interchangeable
(§T.2). The pin suite uses the consolidation double because the subject under test is
`consolidate-learnings.js`'s own call; every other suite in this feature drives `orchestrate-dev.js`
seams and uses `seams.js`.

`consolidationPredicate.test.js` already keeps its own local transcription of the argv (`:23-31`),
so `LEARNINGS_CORPUS_ARGV` is a third literal regardless. T-PIN-1 is deliberately a **three-way**
agreement assertion: the argv `enumerateCorpus` actually hands `_git`, `LEARNINGS_CORPUS_ARGV`, and
the existing test's literal are asserted mutually equal in one test. Two-way would let
`consolidate-learnings.js` and its own test drift together while this feature's constant stayed
correct-but-stale.

### I.2 Configuration

```js
export const LEARNINGS_CONFIG_PATH = MERGE_CONFIG_PATH;      // ".claude/pdlc.config.json"
export const LEARNINGS_DEFAULTS = Object.freeze({
  enabled: true, maxDocuments: 5, maxBytesPerDocument: 6000, maxTotalBytes: 20000,
});

/** @returns {{present: boolean, config: object, sectionMalformed: boolean, invalidKeys: string[]}} */
export function parseLearningsConfig(text)
export async function readLearningsConfigSafely(readFileFn, path)  // never throws
```

`parseLearningsConfig` is `parseAdvisoryConfig` (P-11, P-12) with **one deliberate divergence** and
one addition:

| Input | `parseAdvisoryConfig` | `parseLearningsConfig` | Why |
|---|---|---|---|
| file absent / unreadable / not JSON | defaults, `sectionMalformed:false` | `present:false` | same shape |
| top-level not an object, or no `learningsInjection` key | defaults, `sectionMalformed:false` | `present:false` | BR-14: a misspelt section name is a stray top-level key and reads as absent — no unknown-key registry |
| section present, not a plain object | `sectionMalformed:true` | `present:true, sectionMalformed:true` | BR-14 `NTC-MALFORMED` |
| declared key wrong-typed | key defaults, name in `invalidKeys` | identical | BR-14 `NTC-KEYTYPE`; the run stays enabled |
| — | `ADVISORY_DEFAULTS.enabled === false` | `LEARNINGS_DEFAULTS.enabled === true` | the sibling is opt-in per-key; here `enabled` defaults true **within a present section**, and an absent section is `present:false`, so the feature is still off until an operator writes the section — **which is FSPEC Step 0(2)'s resolution of a REQ-internal contradiction this TSPEC inherits rather than decides; see ERR-4** |

`present` is the new field, and it is the whole of AC-5.1a's "absent, not present-and-empty": the
injector is built **only** when `present && config.enabled && !sectionMalformed`, and
`buildFinalReport` receives `undefined` otherwise.

**The `present:true, sectionMalformed:true` state, in full.** AC-5.1b requires that state to be
*both* AC-5.1a's behaviour *and* a reported notice, and those two pull against each other if
`notices` lives inside a key that is absent. Resolved by giving the sink two parts with different
presence rules: `notices` is carried **outside** the `learningsInjection` key, on
`buildFinalReport`'s existing run-level notice channel, and `learningsInjection` (rule inputs,
corpus outcome, dispatch rows) is the conditionally-spread key. So:

| Config state | `learningsInjection` key | `NTC-*` notice |
|---|---|---|
| absent section, or `enabled:false` | absent (AC-5.1a) | none |
| present, not an object (`sectionMalformed`) | **absent** (behaviour is AC-5.1a's) | `NTC-MALFORMED` present (AC-5.1b) |
| present, `enabled:true`, one key wrong-typed | present, run proceeds on defaults for that key | `NTC-KEYTYPE` present |

The three rows are owned by three different ATs (TE F-04): row 1 is **AT-31**'s (`enabled:false`,
and separately the absent section ⇒ no injection key, no notice); rows 2 and 3 are **AT-32**'s two
cases (malformed section ⇒ key absent plus `NTC-MALFORMED`; wrong-typed declared key ⇒ key present,
defaults for that key, plus `NTC-KEYTYPE`). **AT-30 owns none of them** — it is the
admits-nothing-thresholds AT for AC-4.4 (`maxDocuments: 0`, `maxTotalBytes: 0` ⇒ enabled run, BR-8
rows present and empty). AT-32's closure is a **two**-notice set equality, over `NTC-MALFORMED` and
`NTC-KEYTYPE`, matching `LEARNINGS_NOTICES = Object.freeze(["NTC-MALFORMED", "NTC-KEYTYPE"])`
exactly; a test written for a three-member set would red the frozen literal on day one. §D.2's
record is amended accordingly (no `notices` key inside `learningsInjection`).

The three thresholds validate as **non-negative integers** (`Number.isInteger(v) && v >= 0`), not
positive ones — AC-4.4 requires `0` to be a *valid* admits-nothing configuration rather than an
invalid key that falls back to its default. A negative or non-integer value is `NTC-KEYTYPE`.

### I.3 The pure selection core

```js
/** @typedef {{path: string, feature: string, text: string|null, readOk: boolean,
 *             excluded: null | "RSN-SELF"}} CorpusEntry */
/** @typedef {{path: string, orderKey: string|null, bytes: number, bounded: boolean,
 *             position: number, material: string}} SelectedDoc */
/** @typedef {{path: string, reason: string}} RejectedDoc */

/** True iff `text`'s first non-blank line is a level-1 heading naming a LEARNINGS document.
 *  Bytes only, no model call (F-O-1). */
export function looksLikeLearningsDocument(text)

/** The `Date Completed` cell as `YYYY-MM-DD`, or null when absent/unparseable (BR-4). */
export function parseHarvestDate(text)

/** BR-6's five priority sections, in priority order, bounded to `maxBytes` UTF-8 bytes of MATERIAL
 *  (§D.5). `bounded` is decided at the cut, not re-derived downstream: `bytes` may be < `maxBytes`
 *  on a bounded document, because the cut is character-safe.
 *  @returns {{material: string, bounded: boolean, bytes: number,
 *             sections: string[]}} — `sections` are the BR-6 priority names actually taken, and are
 *             AT-11's section-set-equality operand. */
export function extractInjectableMaterial(text, maxBytes)

/** BR-4's total order: `orderKey` descending (null last), then path byte-ascending. */
export function orderCorpus(entries)

/** The whole of BR-2/BR-4/BR-5/BR-6, as one pure function.
 *  @param {{entries: CorpusEntry[], feature: string, thresholds: object}} arg
 *  @returns {{selected: SelectedDoc[], rejected: RejectedDoc[], totalBytes: number,
 *             orderKeys: Array<{path: string, orderKey: string|null}>}} */
export function selectLearnings({ entries, feature, thresholds })
```

**`rejected[]` is total over `entries`, including the entries the shell never opened.** Every
`CorpusEntry` whose `excluded` is `"RSN-SELF"` is emitted by `selectLearnings` as a
`{sourcePath, reason: "RSN-SELF"}` row — the entry is *present* in the array with
`text: null, readOk: false, excluded: "RSN-SELF"`, and `excluded` is tested **before** `readOk`, so
a self document is never mis-reported as `RSN-UNREADABLE`. This is what gives BR-9's "every known
document appears either as a BR-8 row or as a per-document reason row" a producible path for
`RSN-SELF` while keeping §D.6's "decided before any read" true: the shell decides *not to read*,
the pure selector decides *what to report*, and `rejected[]` stays the single owner of reject
reasons. AC-1.3's row and AT-33/AT-34's paired footprint claim are then satisfiable by one fixture
(a corpus listing containing `docs/{f}/LEARNINGS-{f}.md` for the feature being authored).

`selectLearnings` takes **already-read bytes** and returns **no strings destined for the prompt
except each document's material**; rendering is `renderLearningsBlock`'s. That separation is what
lets AT-07 … AT-13 and AT-17 … AT-22 run as plain unit tests over literal fixtures with no seam,
no harness and no model.

### I.4 The IO shell and the injector

```js
/** `entries` contains one member per enumerated path, INCLUDING self documents (carried with
 *  `excluded: "RSN-SELF"`, `text: null`, and never opened — §D.6, §I.3).
 *  @returns {Promise<{unlistable: true} | {unlistable: false, entries: CorpusEntry[]}>} — never throws */
export async function gatherLearningsCorpus({ feature, _git, _readFile })

/** @returns {string} — the block, or "" when `selected` is empty */
export function renderLearningsBlock({ selected })

/** @returns {null | ((ctx: {feature, docType, phaseId}) => Promise<string>)} */
export function buildLearningsInjector({ config, sink, _git, _readFile, _log })
```

`buildLearningsInjector` returns `null` when the feature is off — so `dispatchAndVerify`'s
attachment is `typeof _injectLearnings === "function" ? await _injectLearnings(ctx) : ""`, and a
disabled run executes **no new code at all** past that one type check. That is the strongest form
of AC-5.1a available: the disabled path is not "the enabled path with an empty result", it is a
branch that never enters the feature.

### I.5 Changed existing signatures

| Function | Change | Compatibility |
|---|---|---|
| `dispatchAndVerify` | one added destructured param `_injectLearnings = null` | defaulted; every existing caller and test unchanged |
| `reviewLoop` | same added param, forwarded in `wrapped` | defaulted; `reviewLoop.test.js` unchanged |
| `main` | one added param `_learningsInjector` (test seam, defaults to the real builder) and the once-per-run config read | defaulted |
| `buildFinalReport` | one added param `learningsInjection = undefined`, conditionally spread | defaulted; every report oracle that asserts key sets sees no new key on a disabled run |

No function's **positional** signature changes; every addition is a defaulted named parameter,
which is the module's established extension idiom (`_provenance`, `_runCommand`, `_sessionAgent`).

## Data Model

### D.1 The three catalogues, as frozen literals *(discharges F-O-3's registration half)*

Each of BR-9's catalogues is one `Object.freeze`d array of string ids, exported, and each is the
operand of its own set-equality test (DC-01, C-9). Arrays rather than enums so a test can assert
`toEqual` against a hand-transcribed literal without importing the module's own value as its
expectation (DC-14).

```js
export const LEARNINGS_REJECT_REASONS = Object.freeze([
  "RSN-COUNT", "RSN-BYTES", "RSN-SELF", "RSN-UNREADABLE", "RSN-UNPARSEABLE", "RSN-NO-MATERIAL",
]);
export const LEARNINGS_CORPUS_OUTCOMES = Object.freeze(["RSN-UNLISTABLE", "RSN-EMPTY"]);
export const LEARNINGS_NOTICES = Object.freeze(["NTC-MALFORMED", "NTC-KEYTYPE"]);
```

**Disjointness in kind** (BR-9) is enforced structurally, not by convention: a reject reason can
only appear in a `rejected[].reason` field, a corpus outcome only in the run-level
`corpusOutcome` field, and a notice only in `notices[].id`. The three fields have three different
value domains, and one test per field asserts that every value it ever carries is a member of that
field's catalogue.

### D.2 The report record *(discharges F-O-3's serialisation half)*

`buildFinalReport`'s new key, present only on an enabled, well-configured run:

```js
learningsInjection: {
  // BR-10 — run-level, exactly two members, closed. Run-level scalars are
  // LAST-WRITE-WINS across authoring dispatches (§A.5); each dispatch also keeps its own.
  ruleInputs: {
    orderKeys: [ { path: "docs/completed/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md",
                   orderKey: "2026-08-02" },
                 { path: "docs/x/LEARNINGS-x.md", orderKey: null } ],
    thresholds: { maxDocuments: 5, maxBytesPerDocument: 6000, maxTotalBytes: 20000 },
  },
  // BR-9 — at most one, run-level; null when documents were known
  corpusOutcome: null,            // | "RSN-UNLISTABLE" | "RSN-EMPTY"
  // BR-8/BR-9 — one entry per authoring dispatch, in dispatch order
  dispatches: [
    {
      phaseId: "T", docType: "TSPEC", mode: "creator",   // context, not a BR-8 row field
      rows: [ { sourcePath: "…", position: 1, bytesInjected: 5871, bounded: true } ],
      totalBytesInjected: 5871,
      rejected: [ { sourcePath: "…", reason: "RSN-BYTES" } ],
      // §A.5 — this dispatch's OWN observation, so a divergent-corpus run stays reconstructable
      corpusOutcome: null,          // this dispatch's value, not the run's last
      orderKeys: [ /* … as observed by THIS dispatch … */ ],
      corpusDiverged: false,        // true iff differs from the preceding authoring dispatch
    },
  ],
  // NO `notices` key here — see §I.2: NTC-* notices are carried on buildFinalReport's
  // run-level notice channel, OUTSIDE this conditionally-spread key, because AC-5.1b
  // requires a malformed-section run to report a notice while `learningsInjection` is absent.
}
```

Four closure claims, one test each:

| Enumeration | Members | Test |
|---|---|---|
| BR-8 row fields | `sourcePath`, `position`, `bytesInjected`, `bounded` | set equality over `Object.keys(row)` |
| BR-8 per-dispatch scalar | `totalBytesInjected` | present, equals `sum(rows[].bytesInjected)` |
| BR-10 members | `orderKeys`, `thresholds` | set equality over `Object.keys(ruleInputs)` |
| BR-9 catalogues | D.1's three arrays | one set-equality test each |
| §A.5 per-dispatch observation | `corpusOutcome`, `orderKeys`, `corpusDiverged` | `DIVERGENT-CORPUS` fixture: run-level scalars equal dispatch 5's, each row carries its own, `corpusDiverged` true on exactly dispatches 3 and 5 |

**Notices are not a member of this record.** `NTC-MALFORMED` and `NTC-KEYTYPE` are pushed onto
`buildFinalReport`'s existing run-level notice channel (§I.2), never onto `learningsInjection`.
If they lived here, AC-5.1b's state (section present but not an object) could not be satisfied:
that state must produce AC-5.1a's behaviour — `learningsInjection` **absent** — *and* a report
carrying `NTC-MALFORMED`, which is impossible if the notice's only home is the absent key. With
the notice channel outside, the three config states are byte-distinguishable in the report:
AC-5.1a (disabled/absent ⇒ no key, no notice), AC-5.1b (malformed ⇒ no key, `NTC-MALFORMED`),
AC-5.1c (wrong-typed key ⇒ key present with empty-or-normal rows, `NTC-KEYTYPE`).

`orderKey: null` is BR-10's "explicit marker that it was absent or unparseable" — a JSON `null`
carried in a **present** key, never an omitted key, so the two states are distinguishable in a
serialised report.

The per-dispatch `corpusOutcome`/`orderKeys`/`corpusDiverged` fields likewise sit outside BR-8's
row enumeration — they describe the *dispatch's* corpus observation, not an injected document — so
they do not widen the `rows[i]` key set AT-17 closes over.

`phaseId`/`docType`/`mode` sit **outside** BR-8's closed row enumeration deliberately: they are
per-dispatch context that lets an operator find the dispatch, and BR-8 closes over *row* fields.
`AT-17`'s set equality is asserted over `rows[i]`, which is the enumeration BR-8 actually states.

### D.3 The document-shape predicate *(discharges F-O-1)*

```js
const LEARNINGS_HEADING_RE = /^#\s+LEARNINGS\b/;
export function looksLikeLearningsDocument(text) {
  if (typeof text !== "string") return false;
  const first = text.split("\n").find((line) => line.trim() !== "");
  return first !== undefined && LEARNINGS_HEADING_RE.test(first.trim());
}
```

Grounded: all 9 corpus documents at HEAD open with `# LEARNINGS — {feature}` (P-6), which is the
form `pdlc/skills/harvest-learnings/SKILL.md` §"LEARNINGS Document Format" prescribes. It consults
only the document's own bytes and is decidable without a model call — FSPEC BR-3's two bounds.

It is deliberately **weak**: it must accept E-19's document missing later sections and E-33's
document carrying none of BR-6's five, because those are eligible-and-reportable states, not
`RSN-UNPARSEABLE` ones. A truncated file keeps its first line, so it stays eligible — which is
exactly BR-3's statement that truncation is not a separate outcome, and why no fixture can
construct an `RSN-TRUNCATED`.

### D.4 The ordering key

```js
const DATE_ROW_RE  = /^\|\s*Date Completed\s*\|\s*([^|]*)\|/m;
const ISO_DATE_RE  = /^(\d{4}-\d{2}-\d{2})\b/;
```

`parseHarvestDate` matches the harvest metadata table's row, trims the cell, and takes an ISO
prefix. The `\b`-anchored prefix match makes an annotated cell such as
`2026-06-09 (Phase H harvest; partial close-out)` parse to `2026-06-09` rather than `null`. **That
sample is FSPEC E-13's, and it is not measured in this repository:** all 9 corpus documents at HEAD
carry a bare ISO `Date Completed` value (P-5, re-verified for this revision), so the tolerance is
defensive against a shape the corpus does not currently exhibit rather than a fix for an observed
one. E-13's own "measured: occurs at HEAD" parenthetical is wrong on this corpus — raised as ERR-5.
Keeping the tolerance is still right (the annotated form is what a partial close-out writes, and
BR-4 must not turn it into `null`), but no fixture may claim it was sampled from this repository.
No `Date` object is constructed: the key is compared as a **string**, descending, which for
zero-padded ISO dates is the same order as chronological and avoids a timezone-dependent parse
(C-5's "no clock"). A value that is not an ISO prefix is `null` and falls to the tiebreak (E-14).

Sort comparator, in full:

```js
(a, b) =>
  (a.orderKey === b.orderKey ? 0
   : a.orderKey === null ? 1
   : b.orderKey === null ? -1
   : b.orderKey < a.orderKey ? -1 : 1)
  || Buffer.compare(Buffer.from(a.path, "utf8"), Buffer.from(b.path, "utf8"))
```

Paths are unique within one `git ls-files` reply, so the composite is a **total order** and the
sort's stability is not relied on.

**The tiebreak is byte order, and the comparator now says so.** AC-2.2 fixes the tiebreak as byte
order over the document path. JavaScript's `<`/`>` on strings is UTF-16 **code-unit** order, which
agrees with UTF-8 byte order on every ASCII path — all 9 corpus paths at HEAD (P-5) — but diverges
outside the BMP, where a supplementary-plane path sorts before a `U+E000`–`U+FFFF` one under
code-unit order and after it under byte order. Determinism holds either way, so this is not a
correctness bug; it is the stated rule and the implemented rule being two different rules.
`Buffer.compare` makes them one, and no ASCII-only restriction on paths has to be assumed for the
document to be true.

### D.5 Byte accounting

All byte quantities are **UTF-8 byte lengths** (`Buffer.byteLength(s, "utf8")`). The accounting is
stated as three disjoint pools so that no quantity is defined in terms of a decision that depends
on it:

| Pool | What is in it | Bounded by |
|---|---|---|
| **Material** — one per selected document | Only the section headings and bodies taken from that document under BR-6 | `maxBytesPerDocument`, per document; and `maxTotalBytes` over the sum |
| **Per-document framing** | That document's `<<< path — feature {p}, completed {d} >>>` opener, its `ABRIDGED` annotation when present, and its `<<< end path >>>` closer | Nothing — framing is never cut |
| **Block framing** | The `--- PRIOR-FEATURE LEARNINGS …` header, the four-sentence advisory preamble (§OQ.1), and the `--- END PRIOR-FEATURE LEARNINGS ---` trailer | Nothing — emitted once, only when `selected` is non-empty |

**`maxBytesPerDocument` bounds material only, and so does `bytesInjected`.** This is the whole of
what TE F-02 asked to be made non-circular: the `ABRIDGED: bounded to 6000 bytes` marker is
emitted *because* a document was bounded, so if it were charged to that document's own budget the
budget would depend on its own outcome. It is not charged. `extractInjectableMaterial(text,
maxBytes)` sees only document text and returns `{material, bounded, bytes}` with
`bytes = Buffer.byteLength(material, "utf8") <= maxBytes`; the renderer adds framing afterwards and
never feeds framing back into the bound. `bytesInjected` in the BR-8 row equals that `bytes`,
`totalBytesInjected` equals their sum, and `maxTotalBytes` is checked against that same sum — so
all three of REQ §4.1's thresholds range over one pool, not three different ones.

**Consequences, stated because tests depend on them.** The realised block is larger than
`totalBytesInjected` by a framing constant plus one opener/closer pair per selected document;
that difference is real prompt cost and is what T-O-3's live measurement reports against REQ O-1,
which is why §A.4 does not claim the thresholds bound prompt growth exactly. AT-11's and AT-12's
expected counts are therefore hand-computable from the fixture alone: sum the section headings and
bodies BR-6 selects, ignore every delimiter. A fixture that wants to pin framing cost asserts on
the rendered block length, not on `bytesInjected`.

**Cutting is character-safe.** Where the first priority section alone exceeds
`maxBytesPerDocument` (E-16), the material taken is the longest **character** prefix whose UTF-8
length is ≤ the bound, so a cut never splits a multi-byte codepoint. The consequence, stated so
AT-12's oracle is written correctly: contributed bytes are ≤ the bound, and **equal** to it only
where the cut happens to land on a character boundary. AT-12's fixture is therefore ASCII, so the
expected count is the bound exactly; a separate case pins the multi-byte behaviour at ≤.

### D.6 Self-exclusion, decided from the path

`RSN-SELF` (BR-2, AC-1.3) is decided **before any read**, from the path alone: an entry whose path
is `docs/{f}/…` or `docs/completed/{f}/…` for the feature being authored. `gatherLearningsCorpus`
therefore never opens a self document, which is what BR-15's expected-set exclusion of `RSN-SELF`
documents requires. Self-exclusion is by *feature directory*, not by filename, so a re-run of a
harvested feature is excluded whichever of the two locations its LEARNINGS sits in (E-31).

## Test Strategy

### T.1 Layers, and what each may touch

| Layer | Subject | Seams | AC-6.1 compliance |
|---|---|---|---|
| **L1 — pure** | `parseLearningsConfig`, `looksLikeLearningsDocument`, `parseHarvestDate`, `extractInjectableMaterial`, `orderCorpus`, `selectLearnings`, `renderLearningsBlock` | none | trivially no model calls |
| **L2 — shell** | `gatherLearningsCorpus`, `buildLearningsInjector` | `fakeGit`, `fakeFs` from `__tests__/helpers/seams.js` | doubles only |
| **L3 — pipeline** | `main()` end-to-end, dispatch-universe and byte-identity claims | scripted `_agent` + full seam set, the `groundingPrompts.test.js` pattern | scripted agent, no live model |
| **L4 — pin** | `LEARNINGS_CORPUS_ARGV` vs. `consolidate-learnings.js` | `fakeGit` driving `enumerateCorpus` | doubles only |

`__tests__/helpers/seams.js` is the **only** source of seam doubles (its own header states the
rule); this feature adds no ad-hoc seam object. New fixture builders — corpus listings, synthetic
LEARNINGS documents — go in one new helper, `__tests__/helpers/learningsFixtures.js`, owned by a
single batch-1 PLAN task.

### T.2 Test doubles

| Double | Source | Use |
|---|---|---|
| `fakeGit({"ls-files": {ok, stdout}})` | `seams.js:413` | enumeration in **this feature's** suites; `{ok:false}` scripts `RSN-UNLISTABLE` |
| `fakeFs(contents, opts)` | `seams.js:245` | document reads; a path may fail by scripted throw **and**, in the sibling case, by returning `null`, because P-8 means both are real |
| `buildLearningsCorpus(specs)` | new, `learningsFixtures.js` | synthesises documents with declared `Date Completed`, declared sections and declared byte sizes |
| scripted `_agent` | `groundingPrompts.test.js` pattern | L3: captures every `(skill, prompt)` pair the run makes |
| `fakeGit` from `__tests__/helpers/consolidationDoubles.js` | `consolidationDoubles.js:23`, re-exported from `mergeDoubles.js` | **only** in `learningsPredicatePin.test.js`, which drives `consolidate-learnings.js`'s `enumerateCorpus` |

**Two `fakeGit`s exist in this repository, and they are not interchangeable — the pin test uses
the sibling's.** `seams.js`'s `fakeGit` *is* the seam function and records `git.invocations` as
`{argv, result}` objects (`seams.js:425-441`). `mergeDoubles.js`'s, re-exported through
`consolidationDoubles.js`, hands the seam out as `git._git` and records bare argv arrays on
`git.calls`. `consolidationPredicate.test.js` — the shipped idiom §I.1 tells the pin test to
imitate — calls `enumerateCorpus(git._git)` and asserts `git.calls[0]` equals the argv literal
(`:37-45`). Code written against `seams.js`'s shape would not run there: there is no `_git`
property to pass and no `calls` array to assert on. So the rule is scoped rather than absolute:
**`seams.js` is the only seam-double source for the four suites this feature adds over
`orchestrate-dev.js`**, and `learningsPredicatePin.test.js` uses `consolidationDoubles.js` because
it is testing the sibling module through the sibling module's own established harness. No new
ad-hoc seam object is introduced either way.

### T.3 The recorded pre-feature baseline *(discharges F-O-5)*

AC-6.2 wants the byte-identity baseline captured at **pre-feature HEAD**, committed, and never
regenerated to fix a failing test. The obligation has a circularity that has to be dissolved before
the mechanism is writable, and TE F-04 named it exactly: the capture harness — the L3 fixture
matrix in `learningsFixtures.js` (§T.2), the scripted `_agent` cases, `learningsDispatchSet.test.js`
— **does not exist at the merge-base**, yet T-O-2 requires the capture to run before the first
production edit lands. "Check out the merge-base and run the capture script" is therefore not an
executable instruction.

**The dissolution: the harness is new, the subject is old.** What must be pre-feature is
`orchestrate-dev.js`'s prompt composition, not the code that drives it. So the capture runs from
the **branch** working tree, against a **merge-base checkout of the subject module only**:

1. `git worktree add .baseline-worktree $(git merge-base origin/main HEAD)` materialises the
   pre-feature module at a second path. Nothing is checked out over the branch.
2. `scripts/capture-learnings-baseline.mjs` — committed on the branch, run from the branch — imports
   `main` from `.baseline-worktree/pdlc/workflows/orchestrate-dev.js` and drives it through the L3
   fixture matrix, which lives on the branch and is imported normally. The subject is merge-base
   code; the harness is branch code; neither is required to exist in the other's tree.
3. It writes each composed prompt to
   `__tests__/fixtures/learnings-baseline/{caseId}/{dispatchIndex}.txt`, plus a `MANIFEST.json`
   recording the merge-base sha and a SHA-256 per file. The worktree is then removed.

**`.baseline-worktree` must be ignored and removed in a `finally`, and it is neither today
(PM Q-02).** Measured at HEAD: `git check-ignore -v .baseline-worktree` exits non-zero — no
`.gitignore` rule covers it — so a capture interrupted between step 1 and step 3's removal leaves a
full untracked checkout at the repository root. The §T.6 porcelain instrument no longer cares (it
runs in its own temp repository, below), but two other things do, and one of them is a shipped
gate: `coveredViolations` walks the **entire** tree under `root` skipping only `.git/` and
`node_modules/` (`WALK_SKIP_DIRS = new Set([".git", "node_modules"])`,
`pdlc/workflows/lib/document-oracles.mjs:69`), so an abandoned worktree — which contains a second
copy of every `docs/**` artifact — would be scanned as if those copies were live documents. Two
obligations follow, both owned by this TSPEC and both PLAN tasks:

1. Add `/.baseline-worktree/` to `.gitignore`, anchored at the root the way
   `/.claude/pdlc.config.json` is, so a nested fixture tree of the same name is untouched.
2. `scripts/capture-learnings-baseline.mjs` removes the worktree in a `finally` block
   (`git worktree remove --force .baseline-worktree`), so an exception between materialise and
   remove still cleans up. Removal is `git worktree remove`, not `rm -rf`: the latter leaves a
   stale administrative entry under `.git/worktrees/` that reds the next `git worktree add` at the
   same path.

Ignoring is the belt and removing is the braces — neither alone is sufficient, because an ignored
leftover still feeds the oracle walk in (1) and an unignored one still dirties `git status` for
whoever runs the capture.

**When re-capture is legitimate, stated so the rule is enforceable rather than exhortatory.**
Re-running the script is correct in exactly one case: the L3 fixture matrix itself changes (a case
is added, or a scripted `_agent` response changes), so the baseline covers dispatches it did not
cover before. It is never correct in response to a byte-identity failure, because that failure is
the feature having changed a prompt it promised not to change. The two are distinguishable
mechanically, not by intent: a legitimate re-capture **adds or replaces whole `{caseId}` directories
while leaving every retained file's digest unchanged**, so the guard test below reds on any
re-capture that alters a retained prompt, whatever the reason given in the commit message.

**The committed baseline is not an NG-4 violation.** NG-1/NG-4 and AC-5.2 forbid the *run* from
creating an index, cache or state file; the baseline directory and `MANIFEST.json` are committed
test fixtures, written once by a script a human invokes and never touched by `main()` on any run.
The §T.6 write-side instrument makes this mechanical rather than definitional: it asserts the run's
working-tree delta is empty, which a run that wrote to `MANIFEST.json` would fail.

**The falsifying anchor lives outside the capture script's own output (TE F-05, DC-03).** A guard
test that only compares the fixture directory against a `MANIFEST.json` the same script wrote
catches hand-edited fixtures and nothing else — and a re-capture rewrites both halves in step, so
the check passes precisely when it should fail. The anchor is therefore a **hand-transcribed
digest literal in the guard test itself** (DC-14): one constant per `{caseId}`, copied by a human
from the first capture, asserted against both the recomputed file digests and `MANIFEST.json`'s
entries. Re-running the capture reds the guard test until someone edits that literal in a
reviewable diff, which is the state mutation the review can actually see. The assertion over those
constants is **set equality on the `{caseId}` keys**, not containment (TE Q-03): containment lets a
silently deleted baseline case pass, and a deleted case is exactly the failure that would otherwise
make a byte-identity failure disappear rather than surface. Adding a legitimate L3 matrix case
therefore also reds the guard until its constant is added — the same reviewable diff. The merge-base-sha
ancestor check is kept as a second, weaker signal, but it is no longer load-bearing: TE F-05 is
right that a later `main` commit is still an ancestor of HEAD, so ancestry alone does not
distinguish pre-feature from mid-feature.

### T.4 The count-bound fixture *(discharges F-O-7 / REQ O-8)*

Under REQ §4.1's defaults the byte bounds bind first on real corpora (FSPEC BR-5's measurement:
87 of 89 documents exceed `maxBytesPerDocument` alone), so `RSN-COUNT` would be named by a
set-equality test and exercised by nothing. The named fixture that makes the count cut binding:

> **`COUNT-BINDING`** — 8 synthetic corpus documents, each carrying exactly one priority section of
> 200 bytes, with thresholds `{maxDocuments: 3, maxBytesPerDocument: 6000, maxTotalBytes: 20000}`.
> Contributed bytes total well under `maxTotalBytes`, so the only cut is the count cut: exactly 3
> documents contribute and exactly 5 carry `RSN-COUNT`.

AT-07's second regime (byte bound binding first) uses the mirror fixture `BYTES-BINDING` — 8
documents of 7,000 injectable bytes each under §4.1's declared values — so the two bounds are each
asserted where they bind and each asserted *not* to bind where the other does.

### T.5 Acceptance test → suite mapping

New suites, under `pdlc/workflows/__tests__/`. **Every AT is listed individually and appears in
exactly one row** — no ranges, so PLAN can derive per-suite tasks mechanically and a reviewer can
check completeness by counting (TE F-12):

| Suite | ATs | Count | Layer |
|---|---|---|---|
| `learningsConfig.test.js` | AT-30, AT-32 | 2 | **L3** (seam-driven whole run) |
| `learningsSelect.test.js` | AT-04, AT-07, AT-08, AT-09, AT-10, AT-13, AT-15, AT-16, AT-28 | 9 | L1 |
| `learningsBlock.test.js` | AT-05, AT-11, AT-12 | 3 | L1 |
| `learningsCorpus.test.js` | AT-25, AT-26, AT-27 | 3 | L2 |
| `learningsRecord.test.js` | AT-17, AT-18, AT-19, AT-20, AT-21, AT-22 | 6 | L1/L2 |
| `learningsDispatchSet.test.js` | AT-01, AT-02, AT-03, AT-06, AT-14, AT-23, AT-24, AT-29, AT-31, AT-33, AT-34, AT-35 | 12 | L3 |
| `learningsPredicatePin.test.js` | T-PIN-1 (not an FSPEC AT — the F-O-4 cross-module pin) | — | L1 |

**Closure claim: 2 + 9 + 3 + 3 + 6 + 12 = 35**, which is FSPEC's full inventory (AT-01 … AT-35),
each assigned once. A PLAN task that adds an AT to a suite must therefore remove it from another,
and a `learningsSuiteMap` assertion — the six suites' declared AT lists, hand-transcribed, asserted
disjoint and equal to the 35-member literal — is what keeps this table honest as suites grow.

**`learningsConfig.test.js` is an L3 suite, not an L1 one (TE F-01).** Both of its ATs are stated
*"when the pipeline runs"*: AT-30 requires an enabled run whose BR-8 rows are **present and empty**
— a claim only a whole run can make, since the distinction from a disabled run is the presence of
the `learningsInjection` key in the finished report — and AT-32 requires the composition to match
AT-31's byte-for-byte *and* the report to carry `NTC-MALFORMED` on the run-level notice channel.
An L1 unit test over `parseLearningsConfig` can falsify neither clause: it sees the parse result,
never the report key set and never a composed prompt. The suite therefore drives `main()` over the
full seam set with a scripted `_agent`, on the `advisoryDisabled.test.js` pattern (that file's
default export runs the pipeline the same way, `pdlc/workflows/__tests__/advisoryDisabled.test.js`)
— the file keeps its config-focused name because its subject is the configuration states, but its
**instrument** is a whole run. `parseLearningsConfig`'s own pure-unit assertions (shape of
`{present, config, sectionMalformed, invalidKeys}`) live in the same file as supporting tests that
carry no AT id, which is why the AT counts above are unchanged: 2 + 9 + 3 + 3 + 6 + 12 = 35.

**AT-11 and AT-12 belong to `learningsBlock.test.js`, not `learningsSelect.test.js`.** The earlier
draft listed them in both, which would have let two PLAN tasks each claim to own them and neither
actually write them. They are material-extraction claims — AT-11 asserts section-set equality over
what BR-6 selected, AT-12 asserts the character-safe cut of §D.5 — so they sit with the renderer's
suite, and `learningsSelect.test.js` covers only the eligibility, ordering and count rules that
`selectLearnings` decides.

### T.6 The L3 claims that need care

**AT-02 — the dispatch-universe set equality.** The expected set comes from the fixture's own phase
script (which phases ran, how many optimizer rounds, whether an erratum fired), transcribed by hand
into the test and compared by set equality against the dispatches whose prompt carries the block
delimiter. Three run shapes are fixtured: a run with no DECISIONS phase (E-27), a Phase R with no
creator (E-28), and one with five optimizer rounds (E-29). **A fourth is added that FSPEC's
inventory does not carry:** the erratum round's land-proof retry fires a *second* authoring dispatch
for the same document (`orchestrate-dev.js:12915`) — see §Open Questions ERR-2.

**`DIVERGENT-CORPUS` — the multi-dispatch fixture §A.5 needs.** Five authoring dispatches where the
scripted `_git` reply gains one path after dispatch 2 and fails outright at dispatch 5. It pins the
last-write-wins rule: run-level `corpusOutcome` and `ruleInputs` equal dispatch 5's observation,
each `dispatches[i]` carries its own, and `corpusDiverged` is `true` on exactly dispatches 3 and 5.

**`RETRY-ITERATION` — one selection per dispatch, not per loop iteration (TE F-02).** A TSPEC-owned
L3 case (no FSPEC AT owns §A.2's property 2; not counted in the 35-AT closure above). The fixture
drives a single PLAN authoring dispatch whose first iteration trips the PLAN-lint feed-forward, so
`dispatchAndVerify`'s `for(;;)` loop composes the prompt at least twice with a mutated `opener`
(`orchestrate-dev.js:8972-8978`), and its scripted `_git` reply **changes between iterations** —
the second reply gains one corpus path — so a per-iteration selector would demonstrably produce
different bytes. Three assertions:

| # | Assertion | Kills |
|---|---|---|
| 1 | exactly **one** `dispatches[]` row exists for the dispatch | duplicate rows from per-iteration recording |
| 2 | exactly **one** `LEARNINGS_CORPUS_ARGV` `_git` call is made for the dispatch, observed on the double's call log | re-enumeration inside the loop |
| 3 | iteration 2's prompt differs from iteration 1's **only inside `opener`**, and its block substring is byte-identical to iteration 1's | re-selection over the moved corpus |

Assertion 2 is the one that fails fast under the loop-placement bug even when the moved corpus
happens to select identically; assertion 3 is the one that fails when it does not.

**AT-29 — gate-input isolation, and why the scripted agent must be prompt-sensitive.** Two scripted
runs over the same fixture matrix, differing only in `learningsInjection.enabled`; the comparison is
over five recorded gate inputs (parsed verdicts, completeness scores, round-window counters,
approval anchors, erratum routes), asserted as set equality over the five names and
member-for-member equality of values — not over the reports as wholes, which legitimately differ by
the `learningsInjection` key itself.

TE F-06 is right that this is vacuous as ordinarily written: if the scripted `_agent` returns fixed
responses irrespective of the prompt it receives, no injected byte can reach any gate input by any
path, and the assertion holds identically over a correct implementation and a broken one. The fix
is to make contamination *possible* in the fixture, so that its absence is a result:

1. **The fixture corpus quotes gate grammar, and the fixture is deliberately stronger than the real
   corpus (TE F-03, re-sourced in the way ERR-5 taught).** Six of the nine corpus documents at HEAD
   contain `VERDICT:`, `ERRATUM:` or `REVISION-COMPLETE:` **token occurrences** —
   `LEARNINGS-pdlc-review-loop-hardening.md` alone carries seven — but every one of them is
   **inline**, inside prose or a backticked table cell, and **zero** occur line-initial at HEAD
   (measured over the corpus predicate's documents; a fixture author looking for a bare trailer
   line in the shipped corpus will not find one). `buildLearningsCorpus` nevertheless synthesises
   documents carrying **line-initial** `VERDICT: Needs revision`, `ERRATUM: REQ: …` and
   `REVISION-COMPLETE: no` lines in their section bodies: the gate parsers are trailer-line
   sensitive, so a line-initial occurrence is the shape most likely to contaminate a gate input,
   and testing isolation against the *stronger* corpus is the right choice. The fixture is
   therefore a deliberate strengthening of a real pattern, not a hand-transcription of one — and
   the two are not conflated here, because a reader who believed it were transcribed would look for
   a sample that is not in the repository.
2. **The scripted `_agent` echoes prompt-derived content into its response.** Each scripted reply
   appends the final 200 bytes of the prompt it was handed. So if the block reaches the composed
   prompt at all — which on an enabled run it does — those quoted grammar lines reach the response
   text the gates parse, and any gate that scans loosely will pick them up.

**The concrete mutations that red AT-29**, stated so the test's power is checkable rather than
asserted: (a) compose the block into `basePrompt` ahead of the verdict-grammar instructions instead
of appending it after `opener`, so the erratum-route scanner sees the corpus's quoted `ERRATUM:`
lines; (b) have the verdict parser scan the whole prompt+response concatenation rather than the
response's trailer region. Under either mutation the enabled run records extra erratum routes or a
different parsed verdict and AT-29 reds. Under the shipped design — block appended last, gates
parsing only the response's own trailer — the five values are identical, and that identity is now
evidence rather than a tautology.

**AT-33/AT-34 — the filesystem footprint, and the two halves of AC-5.2.** The read half is observed
on the `fakeFs`/`fakeGit` call log, since the doubles already record every call in order
(`seams.js`). The observed set is the set of paths `_readFile` was called with under `docs/`. The
expected set is **hand-transcribed** (TE F-10, DC-14): it is written out literally in the test from
the fixture's own scripted `ls-files` stdout, minus the self paths, also written out by hand.
Deriving it from `gatherLearningsCorpus`'s enumeration reply — as the earlier draft did — sources
the expectation from the code under test, so an enumeration bug and a read-loop bug that drift
together leave the test green. The two tests live in **one test file and share one instrument**, so
AT-34's absence claim is paired with AT-33's non-empty positive on that same instrument (DC-03: no
absence-only oracle). Note that the enumeration itself is a `_git` call, not an open under `docs/`,
and so contributes no member — see ERR-3.

**AC-5.2's *write* half needs a different instrument, and the seam log cannot carry it (PM F-03).**
The call log observes only writes routed through injected seams; a direct `fs.writeFileSync` or
`mkdirSync` in the new region — precisely the regression NG-4 exists to prevent — is invisible to
it. AC-5.2 says the filesystem is observed across the whole run and no index, cache or state file is
created **anywhere**. So the write half is carried by two checks that do not depend on the seams:

| Check | Mechanism | Catches |
|---|---|---|
| Working-tree delta | `git status --porcelain` over tracked **and** untracked files, run in a **dedicated temp git repository that is the L3 run's `cwd`**, captured before and after, asserted **set-equal** — an empty delta, with no exemption list at all | Any file the run creates anywhere, by any means |
| Static seam discipline | The new region contains no reference to `fs.`, `writeFileSync`, `mkdirSync`, `appendFileSync` or `require("fs")`, asserted by scanning the source span between the region's sentinel comments | The write before it happens, with a diagnostic naming the symbol |

**The porcelain instrument needs its own repository, and no exemptions (TE F-05, PM Q-01).** Run
against the checkout, the check would red on unrelated dirt — `.claude/workflows/.pdlc-drift-state.json`
is modified in an ordinary working tree, and CI checkouts carry build artefacts — and the only way
to keep it green would be to grow the "paths the fixture declares" exemption list until it cannot
fail. Worse, that list is exactly where someone would eventually park a state file NG-4 forbids,
which is PM Q-01's concern: an exemption list is a place to hide the defect the check exists to
catch. So the check has **no exemption list**: the L3 run's `cwd` is a temp directory made a git
repository in the test's own setup (`git init`, fixture inputs committed), the before-set and
after-set are `git status --porcelain` captures around the run, and the assertion is set equality
between them. Any path the run creates or modifies — declared or not, tracked or not — is a
failure. Fixture inputs are committed **before** the capture, so they are not in the delta, and the
test needs no judgement call about what is legitimate.

The static check is what makes the claim maintainable — the porcelain delta proves it for the runs
the fixture happens to exercise, while the source scan proves it for every run — and together they
cover NG-1 and NG-4 without a real-filesystem tracer. Both are scoped to the new region, not the
whole module, so unrelated `fs` use elsewhere in `orchestrate-dev.js` does not red them.

### T.7 Coverage and CI

The new code lands in `orchestrate-dev.js`, which is already inside `c8`'s `include` set
(`pdlc/workflows/package.json`), and `test:coverage` stage 2 re-reports the run with
`--per-file --branches 85`. No CI configuration changes, and the suites run under the existing
`pdlc/engine CI (ubuntu-latest)` required check.

**But that gate does not detect this feature's uncovered branches, and the earlier draft claimed it
did (TE F-09).** `--per-file` is per *file*, and `orchestrate-dev.js` is ~15k lines, so the floor is
enforced against the whole module's aggregate. The package's own `//c8-per-file` note makes exactly
this point about granularity in the other direction — it added stage 2 because a small module could
hide under the aggregate. A new ~300-line region can sit substantially uncovered without moving the
file's aggregate below 85%, so "every catalogue-closure test and fail-open branch is therefore
load-bearing on an existing gate" was not true.

What actually covers the new region is an **explicit per-branch AT inventory over the fail-open
arms**, owned by this TSPEC rather than by a coverage percentage. Each arm below is named, and each
names the AT that enters it — a PLAN task that leaves one unentered is visible by inspection, which
a diluted file-level percentage never would have been:

| Fail-open arm | Entered by |
|---|---|
| `!reply.ok` from `_git` ⇒ `RSN-UNLISTABLE` | AT-25 |
| `_readFile` returns `null` ⇒ `RSN-UNREADABLE` | AT-26 |
| `_readFile` throws ⇒ `RSN-UNREADABLE` | AT-26 (second case; P-8 makes both real) |
| Empty enumeration ⇒ `RSN-EMPTY` | AT-24 |
| `looksLikeLearningsDocument` false ⇒ `RSN-UNPARSEABLE` | AT-27 |
| No BR-6 section present ⇒ `RSN-NO-MATERIAL` | AT-28 |
| Count bound cuts ⇒ `RSN-COUNT` | AT-08, AT-13, and the `COUNT-BINDING` fixture (§T.4) |
| Byte bound cuts ⇒ `RSN-BYTES` | AT-07, and the `BYTES-BINDING` fixture (§T.4) |
| Self path ⇒ `RSN-SELF` | AT-04 |
| Outer `try/catch` ⇒ `RSN-UNLISTABLE` (BR-12 last row) | A fault-injection case in `learningsCorpus.test.js` |
| Section malformed ⇒ `NTC-MALFORMED`, injector not built | AT-32 |
| Key wrong-typed ⇒ `NTC-KEYTYPE`, proceeds on defaults | AT-32 (second case) |

Whether to additionally run a region-scoped `c8` invocation is left to PLAN as a cheap option; the
inventory above is the obligation, and it does not depend on tooling that does not exist yet.

## Open Questions

### Entry obligations discharged here

| FSPEC obligation | Where |
|---|---|
| F-O-1 — the "presents as a LEARNINGS document" predicate | §D.3 |
| F-O-2 — the advisory preamble's wording and the block's delimiters | §OQ.1 below |
| F-O-3 — serialised form of BR-8/BR-9/BR-10 and catalogue registration | §D.1, §D.2 |
| F-O-4 — the pin to `consolidate-learnings.js`'s pass-side predicate | §I.1, §T.5 (`learningsPredicatePin.test.js`) |
| F-O-5 — how the pre-feature baseline is captured and committed | §T.3 |
| F-O-6 — where the selection step sits and how the block reaches the composer | §A.1, §A.2 |
| F-O-7 — the named non-default-threshold fixture exercising the count bound | §T.4 (`COUNT-BINDING`) |

### OQ.1 The block's rendered form *(discharges F-O-2)*

Fixed here so AT-05 can transcribe it literally rather than keyword-match it:

```
--- PRIOR-FEATURE LEARNINGS (advisory context) ---
The documents below are LEARNINGS harvested from OTHER features in this repository. They are
context, not content of {f}. They are neither a requirement of {f} nor an upstream document to be
traced: nothing you write must cite them, and no traceability obligation attaches to them. You may
disregard them entirely without leaving a gap in what you were asked to produce.

<<< docs/completed/{p}/LEARNINGS-{p}.md — feature {p}, completed 2026-08-02 >>>
## 2. Cross-Feature Patterns
…
<<< end docs/completed/{p}/LEARNINGS-{p}.md >>>

<<< docs/{q}/LEARNINGS-{q}.md — feature {q}, completed 2026-07-30 (ABRIDGED: bounded at 6000 bytes) >>>
…
<<< end docs/{q}/LEARNINGS-{q}.md >>>
--- END PRIOR-FEATURE LEARNINGS ---
```

The preamble states BR-7's three things in three sentences; the per-document delimiter carries the
source path (so a claim is traceable to a file) and the `ABRIDGED` marker discharges BR-6's "the
block states that the document is abridged". The whole block is prefixed with `\n\n` when non-empty
and is **exactly `""`** when `selected` is empty (§A.2 property 3).

### OQ.3 — how C-8's "less is injected" half is discharged

C-8 has two halves. The **non-displacement** half is structural and needs no measurement: the block
is appended after `opener` and never inserted into or between `basePrompt`,
`PACING_CONTRACT_CLAUSE` and `opener`, so no existing content is displaced, shortened or reordered
(§A.2 property 3). The **"when the bound cannot be honoured alongside them, less is injected"**
half is *not* discharged by that, and the earlier draft left it unaddressed — PM F-04 is right that
the sentence names a mechanism and the document did not.

**It is discharged by static caps alone, and that is a deliberate limitation.** §4.1's three
thresholds bound the addition unconditionally: material never exceeds `maxBytesPerDocument` per
document or `maxTotalBytes` in total, whatever else the prompt carries. What the design does *not*
do is measure the rest of the prompt and shrink the injection when the dispatch is already large —
there is no dynamic budget, because nothing in the module knows a prompt ceiling to budget against,
and inventing one would be a product decision about degradation order that REQ has not made.

So the honest statement is: **C-8's second half is satisfied only in the weak sense that the
injection is bounded a priori, not in the strong sense that it yields under pressure.** The
obligation to find out whether that is enough belongs to REQ O-1 / T-O-3, which already measures
realised prompt sizes per dispatch and per run. If that measurement shows the static caps do not
honour C-8 — realised prompts crowding at the caps, or a correlation between injection size and
degraded output — then the consequence is named here rather than discovered later: **the caps
move (a REQ §4.1 change, not a code change), or REQ decides the displacement order and this feature
gains a dynamic budget as a follow-on.** Either way it is an upstream decision, and R-1's
mitigation clause is what routes it there. Nothing in this TSPEC's structure has to change for
either outcome, which is why it is recorded as an open question rather than a design risk.

### Named obligations carried forward

| # | Obligation | Owner |
|---|---|---|
| T-O-1 | The four-suite PLAN must serialise writers on `orchestrate-dev.js`: every task in this feature writes that one file, so single-writer-per-batch (DC/PLAN batch rule 2) forces a mostly serial batch chain. The PLAN owes an explicit per-phase file-ownership manifest making that visible rather than a prose note. | PLAN |
| T-O-2 | The pre-feature baseline capture (§T.3) must run **before** the first production edit lands on the branch, or the merge-base no longer records a pre-feature commit. PLAN owes this as an ordering obligation with a gate moment that binds (DC-21), not a step someone remembers. **Note the rationale is about *when*, not about merge-base stability (TE F-15):** the merge-base itself moves under rebase or a merge from `main`, so §T.3 does not recompute it — `MANIFEST.json` records the resolved sha at capture time and the guard test's hand-transcribed digests are pinned to that recorded sha, so a later rebase cannot silently re-point the baseline at a commit that already contains feature code. | PLAN |
| T-O-3 | REQ O-1's live-run measurement must report, alongside realised prompt sizes, the **read** cost §A.4 names: bytes read per authoring dispatch and probe-vs-full-read counts on the Claude Code channel. The read is unbounded where the injection is bounded, and that is the term most likely to move the thresholds. | operator / O-1 |
| T-O-4 | PROPERTIES owes a property over `orderCorpus`: for any corpus, the output is a permutation of the input and the comparator is a strict weak ordering — the mechanical form of BR-4's "total order over the eligible set". | PROPERTIES |
| T-O-5 | PROPERTIES owes the totality property C-7 asserts: for **any** `{entries, feature, thresholds}` drawn from the generators, `selectLearnings` returns without throwing and every input path appears exactly once across `selected ∪ rejected`. | PROPERTIES |
| T-O-6 | PROPERTIES owes a property over `extractInjectableMaterial`, the third parameterisable pure function (TE F-11): for **any** document text and **any** non-negative `maxBytes`, the returned `bytes` equals `Buffer.byteLength(material, "utf8")` and is ≤ `maxBytes`, `material` is a whole-character prefix of what BR-6 selects (it round-trips through UTF-8 decode without a replacement character), and `bounded` is `true` exactly when material was cut. Example-only coverage (AT-11, AT-12) pins two byte counts; the char-safety claim of §D.5 is a statement about all inputs and needs a generator. | PROPERTIES |

### Load-bearing alternatives weighed and rejected

Recorded here in summary; DECISIONS owns the full form.

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Module placement | inside `orchestrate-dev.js` | a new `pdlc/workflows/learnings-injection.js` — not vendored (P-1), so it would pass CI and be absent in production; extending `MODULE_NAMES` changes the engine's distribution contract for one feature |
| Attachment point | `dispatchAndVerify` | the four call sites individually — would restate BR-1's membership by hand and drift the moment a fifth site appears |
| Corpus enumeration seam | `_git` with the pinned pathspec | `_listFiles` — non-recursive, basenames only, no gitignore knowledge; would be a *different* predicate wearing C-3's name |
| Block placement in the prompt | appended after `opener` | inserted before `PACING_CONTRACT_CLAUSE` — reorders existing content relative to itself and forfeits the structural byte-identity of §A.2 property 3 |
| Corpus caching | none of our own; rely on `rtReadFile`'s revalidating cache | a run-scoped memo — cheaper, but contradicts E-32 and would let AT-14 pass on a cache rather than on determinism |
| `enabled` default | **Not decided here — see OQ.2 and ERR-4.** TSPEC implements `present && config.enabled && !sectionMalformed` provisionally, because AC-5.1a's "or the configuration section absent" is the only *testable* statement in the pair | The alternative reading — REQ §4.1's bare `true` default with no second gate, which G-1's "no configuration change required" implies — is not rejected on engineering grounds; it is a live product question this TSPEC has no authority to settle |

### Still open, unresolved by design

**OQ.2 — does the feature ship on, or off, in a repository with no `learningsInjection` section?**
*Blocked on the REQ erratum ERR-4 raises; TSPEC cannot close it.* REQ carries two statements that
cannot both hold. G-1 promises lessons reach every authoring dispatch "with **no configuration
change required**", and AC-1.1 exercises the feature "with `learningsInjection.enabled` at its
default", which REQ §4.1 declares to be `true` with no second gate — that trio ships the feature
**on** in a bare repository. AC-5.1a states the disabled outcome for "`enabled` false, **or the
configuration section absent**" — which ships it **off** in exactly that repository. This
repository is that case: it holds no `.claude/pdlc.config.json` `learningsInjection` section, and
9 corpus documents (P-5), so the two readings disagree about today's HEAD, not about a corner.

TSPEC implements the `present` gate provisionally so that *something* is testable, and records the
consequence honestly: **on the shipping default, AC-1.1's "then" does not hold in this
repository.** If REQ resolves toward G-1, three things change and nothing else does — §I.2's gate
drops `present` (an absent section reads as enabled-with-defaults), the divergence table's last
row loses its "feature still off until the operator writes a section" clause, and §I.4's "a
disabled run executes no new code at all" narrows to explicitly-`false` runs. The `present` field
itself survives either resolution, because AC-5.1a's report-key distinction (absent, not
present-and-empty) needs it regardless. No suite in §T.5 changes shape; the bare-repository case
in §T.6 changes its expected value from "empty block" to "non-empty block", which is why this is
better settled before Phase P than during implementation.


F-Q-1 … F-Q-4 (FSPEC) and REQ O-1, O-3, O-5, O-6 are carried unchanged. Nothing in this TSPEC
depends on their answers.

### Defects found in upstream documents

Raised as errata rather than fixed here (the finding's document is not this one):

- **ERR-1 (FSPEC BR-14).** The third load-bearing bullet says this feature's absent-config-file
  behaviour "differs deliberately from `parseAdvisoryConfig`, which defaults an absent file to
  enabled-with-defaults". `parseAdvisoryConfig` does not: `ADVISORY_DEFAULTS.enabled` is `false`
  (`orchestrate-dev.js:1944-1949`) and `parseAdvisoryConfig(null)` returns exactly those defaults
  (`:1971`). The divergence the bullet describes does not exist, and the reasoning it supports
  needs a different premise.
- **ERR-2 (FSPEC §Edge Cases, run-shape edges).** The branch inventory has no row for the erratum
  **land-proof retry** dispatch (`orchestrate-dev.js:12915`), which carries
  `dispatchKind: "authoring"` and is therefore a second block-carrying dispatch inside one erratum
  round. E-30 names "an erratum dispatch is made" in the singular; AT-02's fixture list does not
  cover it. DC-05 wants a row and an AT.
- **ERR-3 (FSPEC BR-15).** The expected set is defined as "the corpus-root enumeration, plus one
  open attempt for every corpus document the report names". The enumeration is a `git ls-files`
  call, not an open under `docs/` (§I.1, §A.3), so on the instrument BR-15 describes — file-open
  calls under `docs/` — the enumeration contributes **no** member. As written, AT-33's set equality
  cannot hold.
- **ERR-4 (REQ G-1 / AC-1.1 versus AC-5.1a).** REQ decides the shipping default twice, in opposite
  directions, and FSPEC Step 0(2) / BR-14 inherited one side without flagging the other. G-1 ("no
  configuration change required") and AC-1.1 ("with `learningsInjection.enabled` at its default",
  against REQ §4.1's declared default of `true`) together mean a repository with no
  `learningsInjection` section **receives** injected material. AC-5.1a says a repository whose
  "configuration section [is] absent" produces a byte-identical, injection-free dispatch. Both
  cannot hold, and this repository at HEAD — no config section, 9 corpus documents (P-5) — is the
  case they disagree about, so the contradiction is load-bearing rather than theoretical. The
  choice is a product decision (does an operator opt in, or opt out?), not an engineering one, so
  it is routed to REQ rather than absorbed here; §OQ.2 records what TSPEC does provisionally and
  exactly what changes under either resolution.
- **ERR-5 (FSPEC E-13).** The row is annotated "(measured: occurs at HEAD)", but it does not occur
  at HEAD. Running the corpus predicate and reading each document's `Date Completed` cell yields 9
  bare ISO values (`2026-06-02` … `2026-08-18`); no corpus document carries free text after the
  date. The only occurrence of the sampled string
  `2026-06-09 (Phase H harvest; partial close-out)` in this repository is inside this feature's own
  review documents. The *rule* E-13 states is right and TSPEC implements it (§D.4's `\b`-anchored
  prefix match), so nothing downstream changes; what needs correcting is the provenance claim, since
  a fixture author reading "measured" would look for a sample that is not there. Either drop the
  parenthetical or re-source it.
- **ERR-6 (REQ AC-3.3).** AC-3.3 places every reproduction input in the report's **run-level**
  record, and its *Given* is reproduction "against the same repository state". Selection is
  per-dispatch over the state that dispatch observed (E-32, AT-14 forbids an in-process memo), so
  two authoring dispatches in one run may legitimately observe different corpora — a LEARNINGS file
  landing mid-run, or enumeration failing at dispatch 5 after succeeding at dispatch 1. In that
  case there is no single repository state for a single run-level record to describe. TSPEC keeps
  the run-level record (last-write-wins, §A.5) and adds per-dispatch `{corpusOutcome, orderKeys,
  corpusDiverged}` so the run stays reconstructable, but whether AC-3.3's *locus* should be
  restated to name the per-dispatch row on a divergent run — and therefore which rows its
  completeness test asserts set equality over — is a product decision about the record's contract.
  Routed to REQ rather than reinterpreted here; §A.5 records what TSPEC does in the meantime.
- **ERR-7 (FSPEC BR-1).** BR-1 states a dispatch carries a block "**if and only if** the pipeline
  classifies it as authoring at the moment it is composed", and that the rule "consumes the
  classification, it does not restate the membership"; AT-02's expected set is "the subset BR-1's
  classification names". The classification alone is **wider** than REQ C-1: `reviewLoop` is
  shared, and Phase CR calls it with `docType: null` over a directory target
  (`orchestrate-dev.js:14551-14556`), the `null` surviving as `roundDocType` (`:7306`) and being
  forwarded to `dispatchAndVerify` (`:7342-7358`) with `dispatchKind: "authoring"`. That optimizer
  round — `se-author` remediating shipped code — is authoring-classified while being exactly what
  C-1 and NG-5 exclude. TSPEC therefore adds the `docType ∈ LEARNINGS_TARGET_DOCTYPES` conjunct
  (§A.2), which BR-1 as written forbids. AT-02 consequently has two contradictory readings of its
  expected set — FSPEC's (every authoring-classified dispatch, including Phase CR's optimizer) and
  TSPEC's (C-1's six document types) — and a test written to FSPEC reds a correct implementation.
  BR-1 needs to state the two-conjunct rule (classification **and** target document type), or state
  the exclusion explicitly; TSPEC cannot amend BR-1, and resolving the conflict silently in code
  would leave the defect in the document AT-02 is written from.

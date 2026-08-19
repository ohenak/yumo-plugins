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
| Cross-Reviews | (none yet — round 1) |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-19 |

## Scope

This TSPEC owns the six questions FSPEC §Open Questions hands it (F-O-1 … F-O-7) plus the
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
(`buildLearningsInjector`) that `main()` hangs off `wrapperSeams` so that **every** dispatch the
pipeline classifies `dispatchKind: "authoring"` picks it up at one place — `dispatchAndVerify` —
rather than at each of its four call sites. The block is appended to the composed prompt as a
suffix that is the empty string whenever nothing is selected, which is what makes AC-4.1's and
AC-5.1a's byte-identity claims hold by construction rather than by test.

### Grounded premises

Every claim below was checked against this repository at HEAD on 2026-08-19.

| # | Claim | Evidence |
|---|---|---|
| P-1 | The engine vendors exactly two workflow modules, so a *new file* under `pdlc/workflows/` would not reach a consumer repository | `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`, `pdlc/engine/scripts/prepack.mjs:20` |
| P-2 | Four dispatch sites carry `dispatchKind: "authoring"` at HEAD | `orchestrate-dev.js:13515` (phase creator, in `converge`), `:7663` (review-loop optimizer, positional argument to `runWrapped`), `:12821` (erratum author), `:12915` (erratum land-proof retry) |
| P-3 | All four funnel through one function, which already receives every seam this feature needs | `dispatchAndVerify({… dispatchKind, feature, _readFile, _listFiles, _git, _log})`, `orchestrate-dev.js:8862-8878`; that function composes `prompt` from `basePrompt`, `PACING_CONTRACT_CLAUSE` and `opener` at `:8978` |
| P-4 | The corpus predicate is a single `git ls-files` argv, not a directory walk | `LS_FILES_ARGV`, `pdlc/workflows/consolidate-learnings.js:1338-1346`, consumed by `enumerateCorpus` at `:1349-1355` |
| P-5 | That predicate, run at HEAD, yields 9 documents, 9 of which carry a `Date Completed` row whose value is a bare ISO date | `git ls-files --cached --others --exclude-standard -- ':(glob)docs/*/LEARNINGS-*.md' ':(glob)docs/completed/*/LEARNINGS-*.md'`, cross-checked against each file's line 7 |
| P-6 | Every corpus document's first line is `# LEARNINGS — {feature}`, and the section headings are the `## N. Title` form | measured over all 9; the form is what `pdlc/skills/harvest-learnings/SKILL.md` §"LEARNINGS Document Format" writes |
| P-7 | `_git(argv)` returns `{ok, stdout, stderr}` and never throws, on both channels | `defaultGit`, `orchestrate-dev.js:11658-11676`; `rtGit`, `pdlc/workflows/runtime-adapter.js:1005+` |
| P-8 | `_readFile(path)` returns `null` for an absent file and may **throw** on transport failure | `defaultReadFile`, `orchestrate-dev.js:11513-11519` (returns `null` on any error); `rtReadFile`, `runtime-adapter.js:493-505` (returns `null` for absent, rethrows an exhausted probe) |
| P-9 | The runtime read seam already carries a revalidating cache, so a re-read of an unchanged document costs one probe rather than a full chunked read | `rtReadFile`'s `rtCacheGet`/size+sha revalidation, `runtime-adapter.js:494-522`; `RT_READ_CACHE_MAX_BYTES = 2097152`, `:124` |
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
| `buildLearningsInjector({config, notices, sink, _git, _readFile, _log})` | factory | returns an async closure |

The split is the testability contract: **every rule FSPEC states is in a pure function**, and the
only impure member is the twelve-line shell that turns two seam calls into the array the pure
functions consume. AC-6.1's "no live model calls" then holds for the whole of Groups 2–4 without a
harness, because those tests never touch the shell.

### A.2 Control flow, and the one place it attaches

```
main()
 ├─ readLearningsConfigSafely(readFileFn, LEARNINGS_CONFIG_PATH)   ← ONCE per run
 ├─ parseLearningsConfig(text) → {config, sectionMalformed, invalidKeys}
 ├─ notices.push(NTC-MALFORMED / NTC-KEYTYPE …)                    ← BR-14
 ├─ injector = buildLearningsInjector({...})                       ← null when disabled
 └─ wrapperSeams._injectLearnings = injector
      ├─ converge() ──────────► wrappedDispatch ─┐
      ├─ routeErrata() ───────► wrappedDispatch ─┼─► dispatchAndVerify
      └─ reviewLoop() ────────► runWrapped ──────┘        │
                                                          │  dispatchKind === "authoring"
                                                          ▼
                                        block = await _injectLearnings({feature, docType, phaseId})
                                        prompt = basePrompt + PACING + opener + block
```

Three properties of this attachment carry the load:

1. **One attachment point, four call sites.** P-2/P-3: all four `dispatchKind: "authoring"` sites
   reach `dispatchAndVerify`, and it is the only function that sees `dispatchKind` at composition
   time. Attaching there makes BR-1 *consume* the pipeline's classification instead of restating a
   membership list — which is exactly what BR-1 demands and what a per-call-site approach could not
   give, since it would have to be kept in sync by hand with a fifth site added later.
2. **Once per episode, not once per invocation.** `dispatchAndVerify`'s `for(;;)` loop may compose
   the prompt several times for one dispatch (the pacing budget). The injector is called **once,
   before the loop**, and the resulting string is concatenated into every iteration's prompt. That
   is what "re-composed per authoring dispatch" (FSPEC BR-1, E-29) means operationally: one
   selection, one record row-set, per dispatch — not per retry.
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
*probe* per document instead of a full read, because `rtReadFile` revalidates a cached entry by
size+sha and serves the cached text when they match (P-9), and the whole corpus fits inside the
2 MiB cache budget with room to spare.

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
outcome and one rule-input record. `buildLearningsInjector` closes over it and pushes on each
call; `buildFinalReport` receives it as one new parameter and spreads it **conditionally**, on
P-10's `advisory` precedent, so a disabled run's report has **no such key at all** (AC-5.1a) while
an enabled run with an empty selection has the key present with empty rows (AC-4.4). Those two
states differ by key presence, which is exactly the distinction REQ AC-4.4 names.

## Interfaces

*(section body follows)*

## Data Model

*(section body follows)*

## Test Strategy

*(section body follows)*

## Open Questions

*(section body follows)*

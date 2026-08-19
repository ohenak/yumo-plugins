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
only the *vendored* subset is narrowed. `consolidationPredicate.test.js` establishes the
`fakeGit(enumerateCorpus)` idiom (`pdlc/workflows/__tests__/consolidationPredicate.test.js:37-45`);
this feature reuses it rather than transcribing the argv a third time.

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
| — | `ADVISORY_DEFAULTS.enabled === false` | `LEARNINGS_DEFAULTS.enabled === true` | the sibling is opt-in per-key; here `enabled` defaults true **within a present section**, and an absent section is `present:false`, so the feature is still off until an operator writes the section |

`present` is the new field, and it is the whole of AC-5.1a's "absent, not present-and-empty": the
injector is built **only** when `present && config.enabled && !sectionMalformed`, and
`buildFinalReport` receives `undefined` otherwise.

The three thresholds validate as **non-negative integers** (`Number.isInteger(v) && v >= 0`), not
positive ones — AC-4.4 requires `0` to be a *valid* admits-nothing configuration rather than an
invalid key that falls back to its default. A negative or non-integer value is `NTC-KEYTYPE`.

### I.3 The pure selection core

```js
/** @typedef {{path: string, feature: string, text: string|null, readOk: boolean}} CorpusEntry */
/** @typedef {{path: string, orderKey: string|null, bytes: number, bounded: boolean,
 *             position: number, material: string}} SelectedDoc */
/** @typedef {{path: string, reason: string}} RejectedDoc */

/** True iff `text`'s first non-blank line is a level-1 heading naming a LEARNINGS document.
 *  Bytes only, no model call (F-O-1). */
export function looksLikeLearningsDocument(text)

/** The `Date Completed` cell as `YYYY-MM-DD`, or null when absent/unparseable (BR-4). */
export function parseHarvestDate(text)

/** BR-6's five priority sections, in priority order, bounded to `maxBytes` UTF-8 bytes. */
export function extractInjectableMaterial(text, maxBytes)

/** BR-4's total order: `orderKey` descending (null last), then path byte-ascending. */
export function orderCorpus(entries)

/** The whole of BR-2/BR-4/BR-5/BR-6, as one pure function.
 *  @param {{entries: CorpusEntry[], feature: string, thresholds: object}} arg
 *  @returns {{selected: SelectedDoc[], rejected: RejectedDoc[], totalBytes: number,
 *             orderKeys: Array<{path: string, orderKey: string|null}>}} */
export function selectLearnings({ entries, feature, thresholds })
```

`selectLearnings` takes **already-read bytes** and returns **no strings destined for the prompt
except each document's material**; rendering is `renderLearningsBlock`'s. That separation is what
lets AT-07 … AT-13 and AT-17 … AT-22 run as plain unit tests over literal fixtures with no seam,
no harness and no model.

### I.4 The IO shell and the injector

```js
/** @returns {Promise<{unlistable: true} | {unlistable: false, entries: CorpusEntry[]}>} — never throws */
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
  // BR-10 — run-level, exactly two members, closed
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
    },
  ],
  notices: [ { id: "NTC-KEYTYPE", key: "maxDocuments" } ],
}
```

Four closure claims, one test each:

| Enumeration | Members | Test |
|---|---|---|
| BR-8 row fields | `sourcePath`, `position`, `bytesInjected`, `bounded` | set equality over `Object.keys(row)` |
| BR-8 per-dispatch scalar | `totalBytesInjected` | present, equals `sum(rows[].bytesInjected)` |
| BR-10 members | `orderKeys`, `thresholds` | set equality over `Object.keys(ruleInputs)` |
| BR-9 catalogues | D.1's three arrays | one set-equality test each |

`orderKey: null` is BR-10's "explicit marker that it was absent or unparseable" — a JSON `null`
carried in a **present** key, never an omitted key, so the two states are distinguishable in a
serialised report.

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
prefix. The `\b`-anchored prefix match is what makes E-13's measured
`2026-06-09 (Phase H harvest; partial close-out)` parse to `2026-06-09` rather than to `null`.
No `Date` object is constructed: the key is compared as a **string**, descending, which for
zero-padded ISO dates is the same order as chronological and avoids a timezone-dependent parse
(C-5's "no clock"). A value that is not an ISO prefix is `null` and falls to the tiebreak (E-14).

Sort comparator, in full:

```js
(a, b) => (a.orderKey === b.orderKey ? 0
          : a.orderKey === null ? 1 : b.orderKey === null ? -1
          : b.orderKey < a.orderKey ? -1 : 1)
       || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
```

Paths are unique within one `git ls-files` reply, so the composite is a **total order** and the
sort's stability is not relied on.

### D.5 Byte accounting

All three byte quantities are **UTF-8 byte lengths** (`Buffer.byteLength(s, "utf8")`), of exactly
the substrings the block carries on a document's account (BR-6): its identification line, its
delimiters and source-path label, and each section heading and body taken. The block's preamble
belongs to no document and is counted in none of the three — which is what makes AT-11's and
AT-12's expected counts computable by hand from a fixture.

**Cutting is character-safe.** Where the first priority section alone exceeds
`maxBytesPerDocument` (E-16), the material taken is the longest **character** prefix whose UTF-8
length is ≤ the bound, so a cut never splits a multi-byte codepoint. The consequence, stated so
AT-12's oracle is written correctly: contributed bytes are ≤ the bound and **equal** it only where
the cut happens to land on a character boundary. AT-12's fixture is therefore ASCII, so its
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
| `fakeGit({"ls-files": {ok, stdout}})` | `seams.js:413` | enumeration; `{ok:false}` scripts `RSN-UNLISTABLE` |
| `fakeFs(contents, opts)` | `seams.js:245` | document reads; a path whose read must fail is scripted to throw **and**, in a sibling case, to return `null` — P-8 means both are real |
| `buildLearningsCorpus(specs)` | new, `learningsFixtures.js` | synthesises documents with declared `Date Completed`, declared sections and declared byte sizes |
| scripted `_agent` | `groundingPrompts.test.js` pattern | L3: captures every `(skill, prompt)` pair the run makes |

### T.3 The recorded pre-feature baseline *(discharges F-O-5)*

AC-6.2 requires byte-identity against a composition captured from **pre-feature HEAD**, committed,
and never regenerated by the branch under test. Mechanism:

1. A one-off capture script, run **once**, on the merge-base commit of `feat-pdlc-learnings-injection`,
   drives the L3 fixture matrix through `main()` and writes every composed prompt to
   `__tests__/fixtures/learnings-baseline/{caseId}/{dispatchIndex}.txt`, plus a
   `MANIFEST.json` recording the merge-base sha and a SHA-256 per file.
2. The directory is committed and thereafter **read-only**. The capture script is committed beside
   it with a header stating it must not be re-run to fix a failing test.
3. A guard test asserts the fixture directory's per-file SHA-256 set equals `MANIFEST.json`'s,
   so a regeneration that "fixes" a byte-identity failure is itself a test failure. This is the
   compensating control that makes the "never regenerated" clause enforceable rather than a
   convention.
4. The manifest's recorded merge-base sha is asserted to be an ancestor of `HEAD` — a baseline
   captured from an unrelated commit is not a baseline.

Rejected alternative: capturing the baseline from the branch with `enabled:false`. It is what
AC-5.1a explicitly forbids ("that committed pre-feature fixture, not a second branch of this run"),
and rightly: it would pass even if the disabled path leaked, so long as it leaked identically.

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

New suites, all under `pdlc/workflows/__tests__/`:

| Suite | ATs | Layer |
|---|---|---|
| `learningsConfig.test.js` | AT-30, AT-32 (config states, three-notice closure) | L1 |
| `learningsSelect.test.js` | AT-04, AT-07 … AT-14, AT-15, AT-16, AT-28 | L1 |
| `learningsBlock.test.js` | AT-05, AT-11 (section-set equality), AT-12 | L1 |
| `learningsCorpus.test.js` | AT-25, AT-26, AT-27 (shell + seam failures) | L2 |
| `learningsRecord.test.js` | AT-17 … AT-22 (four closure tests, hand-transcribed rule-input record) | L1/L2 |
| `learningsDispatchSet.test.js` | AT-01, AT-02, AT-03, AT-06, AT-23, AT-24, AT-29, AT-31, AT-33, AT-34, AT-35 | L3 |
| `learningsPredicatePin.test.js` | T-PIN-1 (F-O-4) | L4 |

### T.6 The three L3 claims that need care

**AT-02 — dispatch-universe set equality.** The universe is "every agent invocation the run makes",
not "every invocation already classified authoring" — asserting over the latter would be vacuous.
The scripted `_agent` records `(skill, prompt)` for every call; the *expected* authoring subset is
derived from the fixture's own phase script (which phases ran, how many optimizer rounds, whether
an erratum fired), transcribed by hand into the test, and compared by set equality against the
subset whose prompt contains the block delimiter. Three run shapes are fixtured: no DECISIONS phase
(E-27), Phase R with no creator (E-28), five optimizer rounds (E-29). **A fourth is added here that
FSPEC's inventory does not carry:** an erratum round whose land-proof retry fires a *second*
authoring dispatch for the same document (`orchestrate-dev.js:12915`) — see §Open Questions
ERR-2.

**AT-29 — gate-input isolation.** Two scripted runs over the same fixture matrix, differing only in
`learningsInjection.enabled`. The comparison is over five recorded values (parsed verdicts,
completeness scores, round-window counters, approval anchors, erratum routes), asserted as set
equality over those five names *and* member-for-member equality of their values — not over the run
reports as a whole, which legitimately differ by the `learningsInjection` key itself.

**AT-33/AT-34 — filesystem footprint.** The instrument is the `fakeFs`/`fakeGit` call log, not a
real-filesystem tracer: both doubles already record every call in order (`seams.js`). The observed
set is the set of paths `_readFile` was called with that start with `docs/`; the expected set is
`gatherLearningsCorpus`'s enumeration reply minus the `RSN-SELF` paths. Both tests live in **one
test file and share one instrument**, so AT-34's absence claim is paired with AT-33's non-empty
positive on the same instrument (DC-03: no absence-only oracle). Note that the enumeration itself
is a `_git` call, not a `docs/` open — see §Open Questions ERR-3.

### T.7 Coverage and CI

The new code lands in `orchestrate-dev.js`, which is already inside the `c8` `include` set
(`pdlc/workflows/package.json` `c8.include`) and subject to the per-file ≥85% branch floor that
`test:coverage` stage 2 enforces. Every catalogue-closure test and every fail-open branch is
therefore load-bearing for the existing gate; no CI configuration changes. The suite runs under the
existing `pdlc/engine CI (ubuntu-latest)` required check.

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

### Named obligations carried forward

| # | Obligation | Owner |
|---|---|---|
| T-O-1 | The four-suite PLAN must serialise writers on `orchestrate-dev.js`: every task in this feature writes that one file, so single-writer-per-batch (DC/PLAN batch rule 2) forces a mostly serial batch chain. The PLAN owes an explicit per-phase file-ownership manifest making that visible rather than a prose note. | PLAN |
| T-O-2 | The pre-feature baseline capture (§T.3) must run **before** the first production edit lands on the branch, or the merge-base it records is no longer a pre-feature commit. This is a PLAN ordering obligation with a gate at the moment it binds (DC-21), not a step to be remembered. | PLAN |
| T-O-3 | REQ O-1's live-run measurement must report, alongside realised prompt sizes, the **read** cost §A.4 names: bytes read per authoring dispatch and probe-vs-full-read counts on the Claude Code channel. The read is unbounded where the injection is bounded, and that is the term most likely to move the thresholds. | operator / O-1 |
| T-O-4 | PROPERTIES owes a property over `orderCorpus`: for any corpus, the output is a permutation of the input and the comparator is a strict weak ordering — the mechanical form of BR-4's "total order over the eligible set". | PROPERTIES |
| T-O-5 | PROPERTIES owes the totality property C-7 asserts: for **any** `{entries, feature, thresholds}` drawn from the generators, `selectLearnings` returns without throwing and every input path appears exactly once across `selected ∪ rejected`. | PROPERTIES |

### Load-bearing alternatives weighed and rejected

Recorded here in summary; DECISIONS owns the full form.

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Module placement | inside `orchestrate-dev.js` | a new `pdlc/workflows/learnings-injection.js` — not vendored (P-1), so it would pass CI and be absent in production; extending `MODULE_NAMES` changes the engine's distribution contract for one feature |
| Attachment point | `dispatchAndVerify` | the four call sites individually — would restate BR-1's membership by hand and drift the moment a fifth site appears |
| Corpus enumeration seam | `_git` with the pinned pathspec | `_listFiles` — non-recursive, basenames only, no gitignore knowledge; would be a *different* predicate wearing C-3's name |
| Block placement in the prompt | appended after `opener` | inserted before `PACING_CONTRACT_CLAUSE` — reorders existing content relative to itself and forfeits the structural byte-identity of §A.2 property 3 |
| Corpus caching | none of our own; rely on `rtReadFile`'s revalidating cache | a run-scoped memo — cheaper, but contradicts E-32 and would let AT-14 pass on a cache rather than on determinism |
| `enabled` default | `true` **within a present section**, feature off while the section is absent | `parseAdvisoryConfig`'s absent-file-is-defaults reading — this feature adds material to authoring prompts, so it turns on only where an operator asked for it (BR-14) |

### Still open, unresolved by design

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

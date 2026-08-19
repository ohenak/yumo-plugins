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

*(section body follows)*

## Open Questions

*(section body follows)*

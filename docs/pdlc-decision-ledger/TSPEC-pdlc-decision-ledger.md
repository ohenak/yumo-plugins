---
feature: pdlc-decision-ledger
---

# TSPEC — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (`REQ-pdlc-decision-ledger.md` v1.7, `FSPEC-pdlc-decision-ledger.md` v1.1) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.1**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 0.1 | 2026-08-28 |

## 1. Overview

This TSPEC designs the **decision ledger**: a config-gated block of already-closed decisions,
rendered into the review-loop reviewer dispatch prompt, plus adjacent rule text telling the
reviewer not to re-open an indexed decision without a High-severity finding citing evidence
outside that decision's own record (FSPEC §1, BR-1/BR-5).

### 1.1 Where it lands

Everything this feature adds lands in **one production file**, `pdlc/workflows/orchestrate-dev.js`,
which already exports `reviewerPrompt`'s caller `reviewLoop` and already carries the two shipped
precedents this design clones. That module is the only workflow source the engine vendors
(`scripts/capture-learnings-baseline.mjs`'s sibling constraint recorded as `DEC-LOOPECON-08`), and
REQ NG-6 forbids engine **runtime** edits under `pdlc/engine/`, so a new
`pdlc/workflows/lib/` module is not available to this feature either. The one file outside
`orchestrate-dev.js` is the config disclosure — `.claude/pdlc.config.example.json` plus its
engine-side disclosure test — which FSPEC Q-3 already decided is in scope and which REQ NG-6
explicitly preserves.

### 1.2 The two shipped precedents this design reuses, rather than reinvents

| Obligation | Shipped precedent, cited | How this feature reuses it |
|---|---|---|
| Per-key independent config fallback, fail-open | `parsePinCheckConfig` / `parseDerivativeStopConfig` in `pdlc/workflows/orchestrate-dev.js`, both structural clones of `parseLearningsConfig`, sharing the module-private `descendSection` two-level descent | `parseDecisionLedgerConfig` is a **one-level** descent, so it clones `parseLearningsConfig`'s shape directly (`degraded(sectionMalformed)` closure, `text == null` / `JSON.parse` failure / missing-block short-circuits, `boolField` / `nonNegativeInt` field validators) |
| A gated clause appended to the reviewer prompt, contributing **zero bytes** with the flag off | `reviewerPrompt`'s `findingGrammarPart` — `const findingGrammarPart = findingGrammar ? "\n" + findingGrammarClause() : ""` — threaded from `reviewLoop`'s `derivativeStopEnabled` | The index block and rule text are appended by the identical mechanism: one extra parameter on `reviewerPrompt`, empty string when off |
| An injector closure built once per run, called per dispatch, re-reading its corpus fresh each call, pushing a record onto a report sink | `buildLearningsInjector` / `gatherLearningsCorpus` / `renderLearningsBlock` in `orchestrate-dev.js`, wired at `main()` through `wrapperSeams._injectLearnings` | `buildDecisionLedgerInjector` / `gatherDecisionCorpus` / `renderDecisionLedgerBlock`, wired through `wrapperSeams._injectDecisionLedger` and threaded into `reviewLoop` |
| A committed byte-identity baseline captured from the merge base, guarded by hand-transcribed digests | `pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js` with `__tests__/fixtures/loop-economics-baseline/{scenarios.mjs,MANIFEST.json}`, captured by `scripts/capture-learnings-baseline.mjs`'s `runCaptureScript` | The same harness and the same two-job guard shape, against a new fixture directory (§7.4, answering O-4) |
| Config-block disclosure in the example config with a matching engine-side test | `pdlc/engine/__tests__/learnings-config-example.test.js`, `loop-config-example.test.js`, `advisory-config-example.test.js` — one file per block, so an example edit cannot redden an unrelated engine concern | `pdlc/engine/__tests__/decision-ledger-config-example.test.js`, same shape (FSPEC Q-3) |

### 1.3 The single design risk, stated up front

The whole feature turns on one thing being right: the **recognition rule** (§3) must render exactly
the Baseline's measured extent — 41 project-level ids (`M-1a`, `M-1d`) and the per-directory
feature counts of `M-2e` — at the Baseline's `Verified at` commit, or AT-01 fails and
REQ-DECLEDGER-01 is not met. The rule is not a judgement call: §3 states it, and §3.4 records the
result of running it over the standing corpus, which reproduces `M-1d` and `M-2e` exactly.

Cost is small and bounded. There is no new dependency, no new file type, no new record shape, no
new operator-facing failure class, and no change to any round budget. With the flag off — the
shipped default — the module's behaviour is byte-identical, and §7.4 pins that against a committed
baseline rather than a same-branch comparison.

## 2. Architecture

### 2.1 Module dependency graph

All new symbols are added to `pdlc/workflows/orchestrate-dev.js`. Arrows are "calls".

```
main()
 ├─ readLearningsConfigSafely(readFileFn, LEARNINGS_CONFIG_PATH)   [SHIPPED, reused — one read]
 │    └─ parseDecisionLedgerConfig(text)                            [NEW, pure]
 ├─ buildDecisionLedgerInjector({config, sink, _git, _readFile, _log})  [NEW]
 │    └─ (returns) injectDecisionLedger({feature}) ──┐
 └─ wrapperSeams._injectDecisionLedger ──────────────┘
      └─ reviewLoop({..., _injectDecisionLedger})    [SHIPPED, one new param]
           └─ (per round, before reviewer dispatch)
                injectDecisionLedger({feature})
                 ├─ gatherDecisionCorpus({feature, _git, _readFile})  [NEW, IO]
                 ├─ selectDecisions({entries, feature, thresholds})   [NEW, pure]
                 │    └─ recogniseDecisionRecords(text, path)         [NEW, pure — §3]
                 └─ renderDecisionLedgerBlock({selected})             [NEW, pure]
           └─ reviewerPrompt(doc, phase, feature, iteration, reviewer,
                             docType, frozen, findingGrammar, ledgerBlock)  [SHIPPED + 1 param]
```

The shape is a deliberate clone of the shipped learnings-injection shell: a pure recogniser and a
pure selector wrapped in one IO gatherer, all three behind an injector closure built once per run
and called once per dispatch. Every impure operation is confined to `gatherDecisionCorpus`, which
takes `_git` and `_readFile` as injected seams exactly as `gatherLearningsCorpus` does — that is
what makes §7's oracles driver-free.

### 2.2 Config read: one read, three parsers, now four

`main()` already reads `.claude/pdlc.config.json` **once** into `learningsConfigText` via
`readLearningsConfigSafely`, then hands the same text to `parsePinCheckConfig` and
`parseDerivativeStopConfig` — the comment at that site states the intent explicitly ("threaded
through the SAME already-read `learningsConfigText`, never a second read of `MERGE_CONFIG_PATH`,
which is byte-identical to `LEARNINGS_CONFIG_PATH`"). `LEARNINGS_CONFIG_PATH` is defined as
`MERGE_CONFIG_PATH`, itself `".claude/pdlc.config.json"`.

`parseDecisionLedgerConfig(learningsConfigText)` is the fourth consumer of that same text. It adds
**no** read. Two run-level notices are pushed on the same run-level `notices` channel the shipped
blocks use, with ids following the established `NTC-{BLOCK}-{KIND}` convention:

| Notice id | Fires when |
|---|---|
| `NTC-DECLEDGER-MALFORMED` | the `decisionLedger` value is present but not a plain object |
| `NTC-DECLEDGER-KEYTYPE` | one or more keys are wrong-typed; each named in the detail, each falling back to its own default |

A **missing** block emits no notice — the common case, and the shipped `cascade.pinCheck` /
`review.derivativeStop` sites take the same care so that the disabled-state report stays
byte-identical.

### 2.3 The enablement read is destructured, not dotted

`main()` reads the flag as `const { enabled: decisionLedgerEnabled } = decisionLedgerConfig;`
rather than `decisionLedgerConfig.enabled`. This is not style. `advisoryDisabled.test.js`'s
PROP-DIS-06 pins the source-text count of dotted `enabled` member reads over
`orchestrate-dev.js` to the advisory config's three gates alone; the shipped `pinCheckEnabled`
read is destructured for exactly this reason and says so in a comment. A dotted read here would
redden a property this feature has no mandate over.

`buildDecisionLedgerInjector` returns `null` when the flag is not `true`. That is the gate
(FSPEC §3.2 step 1, BR-4): with the injector `null`, `wrapperSeams._injectDecisionLedger` is
`null`, `reviewLoop` passes `""` as the ninth `reviewerPrompt` argument, and the prompt is
constructed by the identical expression it is today.

**`=== true`, not truthiness.** Every fail-open shape — absent block, wrong-typed value,
unparseable file, malformed section — resolves `enabled` to the `false` default, and the read
site compares with `=== true`, so all four spellings of "not enabled" collapse to one outcome
(FSPEC E-1, AT-05).

### 2.4 Where the block is placed in the prompt

`reviewerPrompt` gains one parameter, `ledgerBlock` (a string, `""` when the feature contributes
nothing). It is rendered as `const ledgerPart = ledgerBlock ? "\n" + ledgerBlock : ""` and
appended **last**, after `oraclePart` and `findingGrammarPart`, on both the iteration-1 and the
iteration-≥2 return paths — the two paths `reviewerPrompt` already has. Appending last matches
the shipped `findingGrammarPart` placement and keeps the diff to two string concatenations.

The **rule text is part of the same block**, emitted by `renderDecisionLedgerBlock` immediately
after the index lines and inside the same header/trailer framing. This is what makes FSPEC BR-1
and E-6 structurally true rather than separately enforced: because there is exactly one string,
"no index ⇒ no rule text" cannot be violated by an ordering mistake — `renderDecisionLedgerBlock`
returns **exactly `""`** when `selected` is empty, the same total-emptiness contract
`renderLearningsBlock` carries.

### 2.5 Scope of "review dispatch": the review loop's reviewer prompt only

`orchestrate-dev.js` builds several reviewer-facing prompts. The index attaches to
`reviewerPrompt` — the review-loop reviewer dispatch — and to no other. The delta-confirmation
prompt and the finding-restatement prompt are explicitly **not** re-reviews (the confirmation
prompt says "Do not re-review the whole document"; the restatement prompt says "Do NOT re-review
anything. Do NOT change your verdict, and do not raise anything new"), so an index inviting the
reader not to re-open closed decisions has nothing to act on there, and adding bytes to those
prompts would enlarge the byte-identity surface for no behavioural gain. This is a real
alternative, weighed and rejected; it is recorded for DECISIONS (§9, D-2).

### 2.6 Freshness

`injectDecisionLedger` re-gathers the corpus on **every call**; nothing is memoised across calls,
and the injector holds no corpus state between dispatches. This is BR-9 / REQ-DECLEDGER-01's
recompute-at-dispatch contract, and it is the same construction `buildLearningsInjector` uses
(its closure holds only `previousObservation`, used for reporting, never for reuse of material).
The injector is called once per round inside `reviewLoop`, immediately before the two reviewer
prompts are built, so both reviewers of a round see the same index and successive rounds each
re-derive it.

## 3. The Recognition Rule (O-1)

FSPEC O-1 assigns this rule to TSPEC in full: carrier markup, id grammar, the key resolving an id
recorded more than once in a file, cross-file precedence, and which lines are omitted when a bound
is exceeded. The constraint is stated there too — a rule rendering a set differing from `M-1d` /
`M-2e` under the directory-glob reading, at the Baseline's commit, fails REQ-DECLEDGER-01.

### 3.1 File scope — a directory glob, enumerated through `_git`

The corpus is enumerated by one `git ls-files` invocation, exactly as
`gatherLearningsCorpus` enumerates its own (`LEARNINGS_CORPUS_ARGV`, a frozen literal argv passed
to the `_git` seam). The decision-ledger argv is likewise a frozen exported literal:

```js
export const DECISION_CORPUS_ARGV = Object.freeze([
  "ls-files", "--cached", "--others", "--exclude-standard", "--",
  ":(glob)docs/_decisions/DECISIONS-*.md",
  ":(glob)docs/*/DECISIONS-*.md",
  ":(glob)docs/completed/*/DECISIONS-*.md",
  ":(glob)docs/discarded/*/DECISIONS-*.md",
]);
```

Two scope facts follow, both transcribed from the Baseline rather than invented:

- **`DECISIONS-*.md` only.** `docs/_decisions/` also holds `.consolidation-log.md` and three
  `CONSOLIDATION-PROPOSAL-*.md` files, which carry line-leading `DEC-` ids that are *re-promotion
  citations*, not records; `M-4c` names both independent reasons the same exclusion is right.
  The filename glob discharges it without a content rule.
- **Directory glob, not single file.** `M-2c` / `M-2d` record two candidate feature-side readings
  (14 ids under the largest single file, 22 under the largest directory); REQ §7 O-1 states the
  directory reading governs, and `M-6b` sizes the `maxEntries` floor (`41 + 22 = 63`) against it.
  `docs/completed/pdlc-headless-engine/` is the witness: two files,
  `DECISIONS-pdlc-headless-engine.md` (14 ids) and `DECISIONS-headless-engine-obligations.md`
  (8 ids), 22 together.

**In-scope set** = every record recognised under `docs/_decisions/` (project-level, always),
**union** every record recognised in the single directory belonging to the feature whose document
is under review, resolved as the first of `docs/{feature}/`, `docs/completed/{feature}/`,
`docs/discarded/{feature}/` that the enumeration returned paths for. No other feature's directory
is in scope, which is what AT-01's "a build rendering all 100 feature-level ids fails" pins.

FSPEC Q-2 is answered here rather than left to fall out of the implementation: a feature with **no**
directory among those three, and a feature whose directory contributes **zero** records, both
resolve to the project-level set alone. Neither is a failure and neither is empty-set error — the
union is simply taken over one operand instead of two.

### 3.2 Carrier markup and id grammar

A **decision record** is a line matching, in full:

```js
export const DECISION_HEADING_RE =
  /^#{2,4}[ \t]+(?:\d+\.[ \t]+)?(DEC(?:-[A-Z0-9]+)+-\d+)[ \t]*[:—-][ \t]*(\S.*?)[ \t]*$/;
```

Read as five conjuncts, each earning its place against a named Baseline instance:

| Conjunct | What it does | Why — cited instance |
|---|---|---|
| `^#{2,4}[ \t]+` | ATX heading, levels 2–4 | Project-level records are `##` (`DECISIONS-loop-termination.md` carries `## DEC-TERM-01: …`); feature-level records are `###` (`DECISIONS-pdlc-engineering-loop.md` carries `### DEC-LOOP-01: …`). Requiring a heading is what excludes `M-4a`'s prose `DEC-` token and `M-4c`'s line-leading citations in the consolidation log |
| `(?:\d+\.[ \t]+)?` | optional ordinal prefix | **Load-bearing.** `DECISIONS-pdlc-engine-distribution.md` numbers its records (`## 2. DEC-EDIST-01: Vendor the workflow modules at build time, into the tarball only`), as does `DECISIONS-pdlc-consolidation-agent.md` (`## 3. DEC-CONS-01: …`). Without this conjunct those two directories contribute **0** instead of 10 and 8, and the rendered feature-level total is 82, not `M-2e`'s 100 |
| `DEC(?:-[A-Z0-9]+)+-\d+` | id: `DEC`, at least one uppercase namespace segment, numeric final segment | The namespace segment is what excludes `M-4b`'s twelve `DEC-01`…`DEC-10` question headings in `DECISIONS-pdlc-plugin-retirement.md` (id carries no namespace) and `M-4d`'s four `### DEC-01 — …` question headings in `DECISIONS-pdlc-advisory-wave-gate.md`. The numeric final segment additionally excludes `M-4a`'s `DEC-AWG-Q1` shorthand |
| id **opens** the heading (only an ordinal may precede) | anchors the id at the start | `M-4d`'s other four non-records are back-references where the id appears mid-heading (`### What follows from DEC-A6-01`). `M-4d` names this consequence explicitly: an id-opens-the-heading rule excludes four headings a looser reading would admit |
| `[ \t]*[:—-][ \t]*(\S.*?)` | a separator, then a **non-empty** statement | Both separators occur: `:` in the deciding blocks, an em dash `—` in the question blocks. Requiring a non-empty remainder is what makes BR-3's "a line whose statement says what was *asked* rather than what was *decided* does not satisfy this rule" implementable together with §3.3 |

Capture group 1 is the **id**; capture group 2 is the **statement**, taken verbatim from the
heading remainder. The **citation** is the record's file path plus its full heading text as it
appears on disk. No field is synthesised: every rendered field is transcribed from the source, which
is what lets AT-02 resolve each citation back at its own file.

### 3.3 In-file resolution: last record wins

Where one file records the same id more than once, the **last** record in file order is the one
rendered. `M-3a` records the sole HEAD instance —
`docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md`, 13 records over 7
distinct ids, `DEC-LOOP-01`…`06` each opening twice — and `M-3c` states the consequence for a
consumer directly: the first opening states the *question*
(`### DEC-LOOP-01 — where the session's state lives`), the second states the *outcome*
(`### DEC-LOOP-01: Session state travels in a caller-echoed token, not a durable file`), so a key
resolving to the **last** record satisfies BR-3's what-was-decided field contract and a key
resolving to the first does not.

This is a rule, not a coincidence of layout: `M-3d` records that every other id in the corpus is
recorded exactly once, so first and last coincide everywhere else and no other expected value moves
under either key. Choosing "last" therefore costs nothing on the rest of the corpus and is correct
on the only instance that discriminates.

**Rejected alternative:** discriminating on the separator (`:` = decision, `—` = question). It
happens to work on the single HEAD instance and is unfalsifiable elsewhere, it would make the
statement field's correctness depend on punctuation no author was ever told to use, and it silently
drops any record that uses the other separator. Recorded for DECISIONS (§9, D-1).

### 3.4 Cross-file precedence: project-level wins

Where the same id is recognised in both a project-level file and the feature-level directory, the
**project-level record renders**, and exactly one line is emitted. `M-5c` names this as the
semantically intended resolution — a decision promoted to project level renders in its promoted
form. `M-5a` records that **zero** ids are recorded in more than one file at HEAD, so this leg has
no witness in the standing corpus; `M-5b` draws the consequence, that the rule is exercisable only
over a constructed corpus, which is the synthetic-fixture obligation FSPEC O-5 already places on
PROPERTIES and over which AT-18 asserts the cardinality conjunct.

`M-5c` also warns that a path-ordering tie-break is *not* equivalent and is not well-defined without
naming a collation, since `_` (`0x5F`) inverts under case-folded collation. This rule therefore
keys on **origin** (project-level vs feature-level), never on path order.

Within `docs/_decisions/` no cross-file duplicate exists either (`M-1a`: the raw carrier count and
the distinct-id count coincide at 41), and within one feature directory the same holds. So
precedence is needed only between the two origins, and "project-level wins" is total over the space
this design can reach.

### 3.5 Verification of §3.1–§3.4 against the standing corpus

The rule above was executed over the working tree at
`docs/_constraints/pdlc-decision-corpus-baseline.md` v1.1's `Verified at` commit
(`8c673a09f` on `feat-pdlc-decision-ledger`), enumerating via `DECISION_CORPUS_ARGV` and
recognising via `DECISION_HEADING_RE`, with last-record-wins per file:

| Measurement | Rule output | Baseline fact |
|---|---|---|
| project-level distinct ids | **41** | `M-1a` / `M-1d`: 41 |
| feature-level distinct ids, summed over directories | **100** | `M-2e`: sum 100 |
| `pdlc-headless-engine` (2 files) | **22** | `M-2e`: 22 |
| `pdlc-advisory-tier` | **11** | `M-2e`: 11 |
| `pdlc-engine-distribution`, `pdlc-learnings-injection`, `pdlc-loop-economics` | **10** each | `M-2e`: 10 each |
| `pdlc-consolidation-agent`, `pdlc-wave-resume` | **8** each | `M-2e`: 8 each |
| `pdlc-engineering-loop` | **7** | `M-2e`: 7 |
| `orchestrate-dev-workflow` | **6** | `M-2e`: 6 |
| `pdlc-advisory-wave-gate` | **4**, exactly `DEC-A6-01`…`04` | `M-2e`: 4; `M-4d`: 8 non-records excluded |
| `pdlc-rcv-budget-stop` | **4** | `M-2e`: 4 |
| `pdlc-plugin-retirement` | **0** (no matching directory entry) | `M-2e`: 0 *(none; `M-4b`)* |
| `DEC-LOOP-01`'s rendered statement | "Session state travels in a caller-echoed token, not a durable file" | `M-3c`: the second, deciding opening |

Every figure agrees. Note that `pdlc-decision-ledger` itself contributes nothing today — this
feature's own DECISIONS document does not exist while this TSPEC is being written — which is
precisely FSPEC Q-2's zero-contribution case, and it resolves to the project-level set alone.

### 3.6 Omission order under a bound

FSPEC BR-13 leaves *which* lines are omitted to this spec. The order is: **feature-level records
are omitted before project-level records; within an origin, records are omitted in reverse
enumeration order** (last enumerated dropped first). Enumeration order is `DECISION_CORPUS_ARGV`'s
pathspec order, then `git ls-files`' own ordering within a pathspec, then file order within a file
— all three deterministic, none dependent on a clock, a locale or a filesystem walk.

Rationale: the project-level corpus is the shared, promoted material every reviewer of every
feature is measured against, and it is a fixed 41 lines against a `maxEntries` default of 70
(`M-6c`: a cap of 70 clears `M-6b`'s floor of 63 by 7), so under the shipped defaults the bound is
never reached and the order is inert. It becomes live only when an operator lowers the bound or the
corpus grows past it, and in that regime dropping the narrower, feature-local material first is the
safe direction.

Both bounds are applied by the same loop, whole line at a time: while the rendered index exceeds
`maxEntries` lines **or** `maxBytes` bytes, drop the next line in omission order. A single line that
alone exceeds `maxBytes` is dropped whole by the same step and the loop continues over the rest
(FSPEC E-8, AT-15). No line is ever truncated, abbreviated, or partially rendered, and construction
is never aborted (BR-13, N-1).

## 4. Interfaces

Every boundary is a TypeScript-style interface below; the implementation is ES-module JavaScript
with JSDoc, matching `orchestrate-dev.js`'s shipped style. Every function marked *pure* never reads
the filesystem, never throws, and is total over its declared input type — the same contract
`parseLearningsConfig` and `selectLearnings` carry.

### 4.1 Config

```ts
interface DecisionLedgerConfig {
  readonly enabled: boolean;    // default false
  readonly maxEntries: number;  // non-negative integer, default 70
  readonly maxBytes: number;    // non-negative integer, default 8000
}

/** Frozen. The three keys of REQ C-3 and no others. */
export const DECISION_LEDGER_DEFAULTS: DecisionLedgerConfig;

/** Pure, total. Never throws, never reads. Each key falls back INDEPENDENTLY. */
export function parseDecisionLedgerConfig(text: string | null): {
  config: DecisionLedgerConfig;
  sectionMalformed: boolean;   // block present but not a plain object
  invalidKeys: string[];       // wrong-typed keys, each already defaulted
};
```

Validation mirrors `parseLearningsConfig` exactly: `boolField` for `enabled`, `nonNegativeInt`
for the two thresholds. `nonNegativeInt` — not positive-int — is deliberate, because
`maxEntries: 0` is a **valid** admits-nothing value that FSPEC E-7 requires to be treated as zero
in-scope decisions rather than as an error or a fallback to the default. This diverges from REQ
C-5's "positive integer" type label; see §9 E-1.

Divergence from `parseLearningsConfig` in one respect only: `enabled` defaults to **`false`**
(REQ C-5, A-2), where learnings injection ships on. Both `parsePinCheckConfig` and
`parseDerivativeStopConfig` already default off, so this is the majority precedent.

### 4.2 Recognition and selection (pure)

```ts
interface DecisionRecord {
  readonly id: string;          // e.g. "DEC-TERM-01"
  readonly statement: string;   // heading remainder, verbatim
  readonly sourcePath: string;  // e.g. "docs/_decisions/DECISIONS-loop-termination.md"
  readonly heading: string;     // full heading line text, verbatim (the citation)
  readonly origin: "project" | "feature";
}

/** Pure, total. Applies §3.2's DECISION_HEADING_RE line by line and §3.3's last-wins
 *  in-file resolution. Returns [] for text that is null, empty, or holds no record —
 *  which is an ordinary empty result, never a failure (BR-8). */
export function recogniseDecisionRecords(text: string | null, sourcePath: string): DecisionRecord[];

interface CorpusEntry {
  readonly path: string;
  readonly text: string | null;
  readonly readOk: boolean;
}

/** Pure, total. Partitions entries by origin (§3.1), applies §3.4 cross-file precedence,
 *  then §3.6's omission order under both bounds. `failedSources` counts entries with
 *  readOk === false; `emptySources` counts entries that read but yielded zero records —
 *  the two are separate fields, which is what discharges O-7 (§6.3). */
export function selectDecisions(args: {
  entries: CorpusEntry[];
  feature: string;
  thresholds: { maxEntries: number; maxBytes: number };
}): {
  selected: DecisionRecord[];
  omitted: Array<{ id: string; reason: "RSN-ENTRIES" | "RSN-BYTES" }>;
  failedSources: string[];
  emptySources: string[];
  renderedBytes: number;
};
```

`selectDecisions` measures `renderedBytes` by rendering candidate lines and measuring the index
block's own bytes — **not** the records', and not the dispatch's (BR-12). Framing (header, preamble,
rule text, trailer) is charged to the bound as well, because BR-12 bounds "the bytes of the index
block as it appears in the prompt"; this differs from `renderLearningsBlock`, whose framing is
explicitly *not* charged, and the divergence is stated here so it is a decision rather than a slip.

### 4.3 Rendering (pure)

```ts
/** Pure, total. Returns EXACTLY "" when `selected` is empty — no header, no preamble,
 *  no rule text, no trailer, no whitespace (BR-1, E-6). Otherwise returns the block,
 *  prefixed "\n\n", closed by the trailer with no trailing newline. */
export function renderDecisionLedgerBlock(args: { selected: DecisionRecord[] }): string;
```

Rendered form — the concrete format FSPEC Q-1 assigns to this spec:

```
--- CLOSED DECISIONS (do not re-open without new evidence) ---
{DECISION_LEDGER_PREAMBLE}

{id} — {statement}  [{sourcePath} § {heading}]
… one line per decision, project-level first, then feature-level …

{DECISION_LEDGER_RULE_TEXT}
--- END CLOSED DECISIONS ---
```

One decision occupies exactly one physical line: the id, ` — `, the statement, then the citation in
square brackets as `{sourcePath} § {heading}`. Statements are transcribed verbatim and are
single-line by construction (§3.2 matches to end of line), so no line can wrap into a second and
"whole lines are omitted" is well-defined byte-wise. Field order and separators are fixed here so
PROPERTIES can transcribe expected values from the fixture (Q-1); the values themselves come from
the fixture, never from the renderer.

`DECISION_LEDGER_RULE_TEXT` is a frozen module constant carrying, in this order: BR-5's two
conjuncts stated as a conjunction ("High severity **and** cites evidence that is not part of that
decision's own record"); BR-6's two exemplars, each explicitly labelled with the side it falls on —
*in scope for re-opening*: a shipped behaviour that changed after the decision was recorded, cited
at the changed source; *not in scope*: a source the decision already cites, re-cited at a different
line or a later commit with no behavioural change; the instruction to decide against the **cited
record**, not the index line, which need not carry the decision's own citations (AT-07); and
BR-6/REQ-DECLEDGER-06's direction to key a repeat on the decision id, recording it as a repeat
naming that id rather than as a fresh finding.

### 4.4 IO shell and injector

```ts
/** One `_git` call, then one `_readFile` per path inside its OWN try/catch.
 *  Never throws: a thrown enumeration yields { unlistable: true }. */
export function gatherDecisionCorpus(args: {
  feature: string;
  _git: (argv: string[]) => Promise<{ ok: boolean; stdout: string }>;
  _readFile: (path: string) => Promise<string | null>;
}): Promise<{ unlistable: true } | { unlistable: false; entries: CorpusEntry[] }>;

/** Returns null iff the flag is not true (the gate). Otherwise an async closure that,
 *  on EACH call, re-gathers, selects, renders, and pushes one record onto `sink`. */
export function buildDecisionLedgerInjector(args: {
  config: DecisionLedgerConfig;
  sink: DecisionLedgerSink | DecisionLedgerDispatchRecord[];
  _git: Function;
  _readFile: Function;
  _log?: (info: object) => void;
}): null | ((args: { feature: string }) => Promise<string>);
```

The per-path `try/catch` is the shipped `gatherLearningsCorpus` discipline and it is what makes
FSPEC E-3's partial leg structural: the runtime `rtReadFile` throws where the test double
`defaultReadFile` returns `null`, and both degrade that one path to `readOk: false` rather than the
whole corpus.

### 4.5 Loop and prompt seams

```ts
// reviewLoop gains one optional seam, defaulting to the shipped state.
_injectDecisionLedger: null | ((args: { feature: string }) => Promise<string>) = null;

// reviewerPrompt gains one trailing parameter, defaulting to the shipped state.
function reviewerPrompt(
  doc, phase, feature, iteration, reviewer, docType,
  frozen = false, findingGrammar = false,
  ledgerBlock = ""      // NEW
): string;
```

Both defaults are chosen so that every existing call site and every existing test keeps HEAD's
behaviour byte-for-byte without edit — the same reason `reviewLoop`'s shipped `derivativeStop`
parameter defaults to `DERIVATIVE_STOP_DEFAULTS` and says so at its declaration.

Inside `reviewLoop`, per round:

```js
const ledgerBlock =
  typeof _injectDecisionLedger === "function"
    ? await _injectDecisionLedger({ feature })
    : "";
```

`await`ed, per this repo's injected-IO rule — the adapter's implementations are async, the test
doubles are sync. The single `await` per round is placed immediately before the two
`reviewerPrompt` calls, so both reviewers of a round receive the identical block.

## 5. Data Model

*(pending)*

## 6. Error Handling and Degradation

*(pending)*

## 7. Test Strategy

*(pending)*

## 8. Traceability

*(pending)*

## 9. Open Questions

*(pending)*

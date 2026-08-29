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
| Draft | se-author | 0.2 | 2026-08-28 |

**v0.2 — addresses TSPEC cross-review round 1** (`CROSS-REVIEW-product-manager-TSPEC-v1.md`,
`CROSS-REVIEW-test-engineer-TSPEC-v1.md`). Both reviewers independently falsified §3.6's
"the bound is never reached" claim by executing the recognition rule and measuring the rendered
bytes; I re-executed it and reproduce their figures exactly. The consequences run through §3.6
(rationale restated on the measurement), §4.3 (citation shortened to `{sourcePath} § {id}`, framing
budget pinned), §7.6 (AT-01's bounds configuration stated) and §9.2 (ERR-2 routes the REQ-owned
default upstream with the measurement attached). §7 additionally gains a per-row coverage obligation,
a source census specified the way its cited precedent actually works, an entry point for AT-05 that
can fail, and the shipped merge-base guard shape. §9.3's T-2 is closed rather than deferred.

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

### 1.2 The shipped precedents this design reuses, rather than reinvents

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
REQ-DECLEDGER-01 is not met. The rule is not a judgement call: §3 states it, and §3.5 records the
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

**This depends on where the new symbols land, so the placement is stated here rather than
left to the implementer.** `advisoryDisabled.test.js`'s `sourceExcludingParser` slices the
sentinel-bounded learnings-injection region (`// === LEARNINGS INJECTION REGION START ===` /
`... END ===` in `orchestrate-dev.js`) out of the source **before** counting `/\.enabled\b/`,
because that region belongs to a different feature's config. Every symbol this feature adds
therefore lands **outside** that region — the region is `pdlc-learnings-injection`'s, and this
is not that feature. The consequence is the point: outside the region the count is live, so the
destructured read is load-bearing and a dotted read reddens PROP-DIS-06. Had the symbols landed
inside the region they would be sliced out, the pin would not see them, and §2.3 would be a
discipline with no oracle behind it. PLAN owns the placement; §7.3's source census is what
checks it.

`buildDecisionLedgerInjector` returns `null` when the flag is not `true`. That is the gate
(FSPEC §3.2 step 1, BR-4): with the injector `null`, `wrapperSeams._injectDecisionLedger` is
`null`, `reviewLoop` passes `""` as the ninth `reviewerPrompt` argument, and the prompt is
constructed by the identical expression it is today.

**`=== true`, not truthiness.** Every fail-open shape — absent block, wrong-typed value,
unparseable file, malformed section — resolves `enabled` to the `false` default, and the read
site compares with `=== true`, so all four spellings of "not enabled" collapse to one outcome
(FSPEC E-1, AT-05). *(Erratum ids raised by this document are prefixed `ERR-` throughout §9.2, so that a citation of `E-1` always means the FSPEC's edge case and never this spec's erratum.)*

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

**The asymmetry this creates, recorded where the decision is taken.** REQ G-4 measures the
intended effect over *committed `CROSS-REVIEW-*` artifacts on the branch*, and confirmation-round
cross-reviews are committed under those same names and do carry `FINDING:` lines — including
`inherited` ones, which is exactly the shape a re-opened closed decision takes. So G-4's
denominator is **wider than this mechanism's injection surface**: it counts rounds whose prompts
never carried the rule text at all. A later reader must therefore not read a G-4 trend as a clean
measurement of this mechanism's effect — the mechanism is applied to a proper subset of what G-4
observes, and the untreated remainder moves the number for reasons unrelated to it. G-4 is
explicitly non-binding in the REQ and carries no acceptance criterion (§7.7), so this is a
disclosure, not a defect to design around; narrowing G-4 or widening the injection surface would
each cost more than the signal is worth.

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

**Cardinality alone is not enough, and the missing conjunct is assigned here.** "Exactly one line
is emitted" is a terminal state both readings of the precedence rule reach: feature-level-wins also
emits exactly one line. A cardinality-only oracle therefore passes under the rule this spec
*rejects*, which is the precedence-chain false green in its textbook form. The **positive**
conjunct is this, and it is asserted over O-5's synthetic two-file fixture alongside the
cardinality one:

> For the id recorded in both files, the single rendered line's `statement` and `sourcePath` equal
> the **project-level** record's — each transcribed literally from the fixture, never captured from
> the renderer — and its `origin` is `"project"`. The feature-level record's statement is asserted
> **absent** from the whole rendered block.

The two halves fail on different mutations, which is why both are needed: swapping the precedence
direction leaves cardinality green and reddens the statement/origin conjunct; emitting both records
leaves the statement conjunct green and reddens cardinality. §7.6's AT-18 row carries this
assignment, so no conjunct is left pointing at a section that assigns no test.

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
| `pdlc-plugin-retirement` | **0** (directory entry matches and is enumerated; all twelve of its ids are namespace-less `DEC-01`…`DEC-10`, rejected by the id-namespace conjunct) | `M-2e`: 0 *(none; `M-4b`)* |
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

**Rationale, and the measurement that governs it.** An earlier draft of this section argued the
order was *inert* under shipped defaults, because `maxEntries` 70 clears `M-6b`'s floor of 63. Both
TSPEC reviewers falsified that claim by executing the rule and measuring the bytes, and I have
re-executed it and reproduce their figures exactly. The `maxEntries` half of the argument is sound;
the claim was wrong because **`maxBytes` binds first in every case**, and D-5 charges framing to it.

Measured over the corpus at the Baseline's `Verified at` commit `8c673a09f`, index lines only
(framing excluded), under the two candidate line formats — the long form an earlier draft of §4.3
specified, and the form §4.3 now specifies:

| In-scope set | Lines | Long form `§ {heading}` | **Shipped form `§ {id}`** |
|---|---|---|---|
| Project-level alone (`M-1d`) | 41 | 9,371 | **6,305** |
| + `pdlc-advisory-wave-gate` (AT-01 (a)) | 45 | 10,441 | **7,042** |
| + `pdlc-engineering-loop` (AT-01 (b)) | 48 | 11,354 | **7,650** |
| + `pdlc-headless-engine` (`M-6b`'s 63-line floor) | 63 | 16,283 | **10,859** |

Two conclusions follow, and this spec acts on both.

**First, the line format was wasteful, and that is this spec's own defect to fix.** The long form
rendered the statement twice — once as `{statement}` and again inside `{heading}`, which is the
full heading line and therefore contains both the id and the statement. §4.3 now cites
`[{sourcePath} § {id}]`, which still names the record's file and locates the record within it —
all BR-3 and AT-02 require — and removes ~33% of the block. This is a Q-1 choice, entirely inside
this document, and it is taken.

**Second, the order is live under shipped defaults, and this section no longer claims otherwise.**
Even in the shipped form, with §4.3's framing budget of ≤1,200 bytes charged, the byte bound leaves
`8000 − 1200 = 6,800` bytes for lines. Project-level alone (6,305) fits with ~495 bytes of
headroom, or roughly **two** feature-level lines. Per-line sizes, measured at the same commit under
the shipped format: project-level lines run **109–200** bytes (mean 153); feature-level lines run
**152–261** bytes (means 183 for `pdlc-advisory-wave-gate`, 191 for `pdlc-engineering-loop`, 206 for
`pdlc-headless-engine`), which is the figure ERR-2 carries upstream. So on the shipped default:

- **at the Baseline's `Verified at` commit**, every reviewer receives the whole project-level
  corpus on every feature, with ~495 bytes of headroom — about **three** project-level lines at the
  measured mean;
- feature-level lines are admitted until the bound, and the larger feature directories are
  partially omitted from the first enabled dispatch.

That is the omission order doing exactly the job it was designed for, on day one rather than in
some future regime — which is precisely why the order is **feature-level first**. The safety
property the earlier draft wanted from inertness is instead delivered by the order itself: the order
**prioritises** the promoted corpus, dropping every feature-level line before it touches a
project-level one. It does not *guarantee* the project-level set is admitted whole, and this section
does not claim it does: once the feature-level lines are exhausted, project-level lines are dropped
like any other. What admits the promoted set whole today is the measured headroom, and
`docs/_decisions/` grows by exactly the mechanism this pipeline runs — consolidation promotes
decisions into it — so at ~44 promoted records the headroom is spent under C-5's current default.

**That is a measured quantity, so it gets a pin rather than a sentence.** §7.3's corpus oracle
carries an assertion over the frozen fixture, at C-5's *shipped* defaults, that the rendered
project-level block fits within `maxBytes − 1200` and `omitted[]` names no project-level id, with
6,305 transcribed as the expected size. It reddens when the promise stops being true — at the
deliberate moment the fixture is re-captured, which is the right moment to re-decide ERR-2's
default — instead of expiring silently. This is the same discipline §4.3 applies to the framing half
of the identical arithmetic (D-9), applied to the corpus half (D-10). The order itself is load-bearing
from the first dispatch and is tested as such (§7.5's property, whose prefix conjunct is what makes
the order falsifiable, and AT-13/AT-15).

**The `maxBytes` default value is not this spec's to set.** It is REQ C-5's, and A-1 already records
it as the unmeasured threshold an operator may revise without a REQ revision. The measurement A-1
was waiting for is now taken and is routed upstream as an erratum (§9.2, E-2) rather than decided
here: a default of **12,500** admits the worst standing case (10,859 + 1,200 = 12,059) with
headroom, where 8000 admits the project-level set plus about two feature lines. Nothing in this
design changes if the default moves — the bound is a parameter, the order is the mechanism, and
both are correct at either value.

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
C-5's "positive integer" type label; see §9.2, ERR-1.

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

**One byte budget, one producer — `selectDecisions` never re-implements the format.** Two functions
would otherwise own the same number: `selectDecisions` computing `renderedBytes` and
`renderDecisionLedgerBlock` producing the bytes. Two implementations of one format drift, and the
drift is invisible in the worst direction — the bound is enforced against a size the prompt does not
actually have, so BR-12 is wrong while every test is green. The single source of truth is therefore
stated normatively:

> `renderDecisionLedgerBlock` is the **only** producer of ledger bytes. `selectDecisions` obtains
> `renderedBytes` by calling it — `Buffer.byteLength(renderDecisionLedgerBlock({ selected }), "utf8")`
> — on the candidate set at each step of §3.6's drop loop. It never concatenates a line itself and
> never carries a copy of the format.

The dependency is `selectDecisions` → `renderDecisionLedgerBlock`, which is acyclic (the renderer is
pure and takes only `selected`), so this costs nothing structurally. It also makes the bound exact by
construction rather than by agreement: the number compared against `maxBytes` is the byte length of
the very string that is appended to the prompt. §7.5's property gets its teeth from this — a
bounds-conformance property that measured a *reconstruction* of the block would pass while the real
block overflowed.

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

{id} — {statement}  [{sourcePath} § {id}]
… one line per decision, project-level first, then feature-level …

{DECISION_LEDGER_RULE_TEXT}
--- END CLOSED DECISIONS ---
```

One decision occupies exactly one physical line: the id, ` — `, the statement, then the citation in
square brackets as `{sourcePath} § {id}`.

**Why the citation names the id and not the full heading.** An earlier draft cited
`{sourcePath} § {heading}`, where `heading` is the full heading line as it appears on disk — which
already contains both the id and the statement. That rendered the statement **twice** on every line
and cost ~33% of the block for no additional information (§3.6's measurement: 9,371 → 6,305 bytes on
the project-level set). What AT-02 requires is that each citation *resolve back at its own source*,
and a path plus the record's id does that exactly as well as a path plus its heading: the id is
unique within its file (`M-1a`, and §3.3's last-wins key makes it so by construction even where it is
not), so `{sourcePath} § {id}` locates one record. `DecisionRecord.heading` is retained on the type
because it is the verbatim on-disk text the fixture's expected values are transcribed from (§7.3) and
because AT-02's resolution check reads it; it is simply not *rendered*.

The framing — header, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, trailer and the blank
lines between them — is charged to `maxBytes` (D-5), so its size is part of the bound's arithmetic and
is therefore **pinned, not left to drift**: the four constants together must render to **≤ 1,200
bytes**, asserted by a pure unit test against that literal. Without the pin the framing is an
unmeasured quantity sitting inside a measured budget, and §3.6's headroom arithmetic would be
unfalsifiable prose. If a future edit to the rule text needs more than 1,200 bytes, the pin reddens and
the budget is re-decided deliberately — which is the point. Statements are transcribed verbatim and are
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

### 5.1 Types

`DecisionRecord`, `CorpusEntry`, `DecisionLedgerConfig` are declared in §4. Two further shapes are
report-side only.

```ts
interface DecisionLedgerDispatchRecord {
  readonly feature: string;
  readonly phaseId: string | null;
  readonly docType: string | null;
  readonly round: number;
  readonly rows: Array<{ id: string; sourcePath: string; origin: "project" | "feature" }>;
  readonly omitted: Array<{ id: string; reason: "RSN-ENTRIES" | "RSN-BYTES" }>;
  readonly renderedBytes: number;
  readonly corpusOutcome: "RSN-UNLISTABLE" | "RSN-EMPTY" | null;
  readonly failedSources: string[];   // read failed — §6.3
  readonly emptySources: string[];    // read fine, zero records — §6.3
}

interface DecisionLedgerSink {
  ruleInputs?: { thresholds: { maxEntries: number; maxBytes: number } };
  dispatches: DecisionLedgerDispatchRecord[];
}
```

`report.decisionLedger` is set to the sink **only** when the injector is non-null, and is otherwise
absent from the report object entirely — never `undefined`-spread. This is the shipped
`learningsInjectionField` discipline (`main()` sets
`const learningsInjectionField = learningsInjectorFn ? learningsSink : undefined` and the report
builder spreads conditionally), and it is what keeps a disabled run's report byte-identical.

### 5.2 Frozen catalogues

Three frozen literals, each the operand of its own set-equality test — the shipped
`LEARNINGS_REJECT_REASONS` / `LEARNINGS_CORPUS_OUTCOMES` / `LEARNINGS_NOTICES` pattern:

| Constant | Members |
|---|---|
| `DECISION_LEDGER_OMIT_REASONS` | `RSN-ENTRIES`, `RSN-BYTES` |
| `DECISION_LEDGER_CORPUS_OUTCOMES` | `RSN-UNLISTABLE`, `RSN-EMPTY` |
| `DECISION_LEDGER_NOTICES` | `NTC-DECLEDGER-MALFORMED`, `NTC-DECLEDGER-KEYTYPE` |

Disjointness in kind is structural, not conventional: an omit reason may appear only in
`omitted[].reason`, a corpus outcome only in `corpusOutcome`, a notice id only in the run-level
`notices[].id`.

### 5.3 Config schema, as disclosed

`.claude/pdlc.config.example.json` gains one top-level block, the values being C-5's declared
defaults verbatim:

```json
"decisionLedger": { "enabled": false, "maxEntries": 70, "maxBytes": 8000 }
```

`pdlc/engine/__tests__/decision-ledger-config-example.test.js` asserts (a) the file parses, (b) the
top-level section set **contains** `decisionLedger` — containment, because the file is shared with
eight other blocks (`dispatch`, `advisory`, `implementation`, `learningsInjection`, `cascade`, `review`, `loop`, `merge`), exactly as `loop-config-example.test.js` reasons about the same file — and (c)
`decisionLedger`'s own key→value map by **set equality** against a literal transcription of C-5's
three keys and defaults, so a fourth key or a different spelling fails. The literal is transcribed
by hand rather than imported from `DECISION_LEDGER_DEFAULTS`, so the example is checked against the
documented shape rather than agreeing with the code by construction — the reason
`loop-config-example.test.js` states for transcribing `MERGE_DEFAULTS` rather than importing it.

### 5.4 State

There is none that survives a dispatch. `injectDecisionLedger`'s closure holds `config` and the
seams; it holds no corpus, no rendered block and no snapshot (§2.6). The sink accumulates records
for the report only, and nothing in the driver ever reads it back.

### 5.5 The one thing the driver never holds

No driver-side computation takes a decision id as input. `DecisionRecord.id` exists only inside
`selectDecisions` / `renderDecisionLedgerBlock` and in `report.decisionLedger.dispatches[].rows[]`,
which is written and never read. Convergence, `DEC-LOOPECON-06`'s identity-triple dedupe, the
`review.derivativeStop` flat/non-flat classification, erratum minting under `DEC-ERRROUTE-01` and
the fail-closed confirmation-presence check all consume reviewer output and never the ledger. This
is BR-11 / REQ NG-4, and it is falsifiable by construction: `selectDecisions`' output does not
reach any of those code paths, which §7.3 asserts as a source-census oracle rather than only as a
behavioural one.

## 6. Error Handling and Degradation

Every failure scenario reachable by this feature, with its expected behaviour. Nothing here halts,
and nothing introduces an operator-facing failure class (REQ-DECLEDGER-04, G-3).

### 6.1 Failure table

| # | Scenario | Where handled | Behaviour |
|---|---|---|---|
| F-1 | `.claude/pdlc.config.json` absent or unreadable | `readLearningsConfigSafely` returns `null`; `parseDecisionLedgerConfig(null)` | All three keys take C-5 defaults ⇒ `enabled: false` ⇒ disabled run. No notice |
| F-2 | Config file present but not valid JSON | `parseDecisionLedgerConfig`'s `JSON.parse` catch | Defaults ⇒ disabled run. No notice (the shipped parsers are silent here too) |
| F-3 | `decisionLedger` key absent | missing-block short-circuit | Defaults ⇒ disabled run. **No notice** — the common case, kept silent so the disabled report stays byte-identical |
| F-4 | `decisionLedger` present but not a plain object | `sectionMalformed: true` | Defaults ⇒ disabled run, plus `NTC-DECLEDGER-MALFORMED` |
| F-5 | One key wrong-typed, others valid | `boolField` / `nonNegativeInt` push to `invalidKeys` | **Only** that key defaults; the other two keep operator values; other blocks untouched. Plus `NTC-DECLEDGER-KEYTYPE` naming the key (BR-10, E-5). With `enabled` the wrong-typed key the fallback is `false`, so the run is a disabled run |
| F-6 | `git ls-files` returns `!ok`, or `_git` throws | `gatherDecisionCorpus`' outer `try/catch` | `{ unlistable: true }` ⇒ `corpusOutcome: "RSN-UNLISTABLE"` ⇒ empty selection ⇒ `renderDecisionLedgerBlock` returns `""` ⇒ **total leg** (E-2) |
| F-7 | Enumeration succeeds but returns zero paths | `entries.length === 0` | `corpusOutcome: "RSN-EMPTY"` ⇒ total leg |
| F-8 | One source file unreadable (`_readFile` throws, or returns `null`/`undefined`) | per-path `try/catch` | That entry gets `readOk: false`, is counted in `failedSources`, contributes no line; **every other source renders** ⇒ partial leg (E-3) |
| F-9 | A source reads but holds zero decision records | `recogniseDecisionRecords` returns `[]` | Counted in `emptySources`, **not** in `failedSources`. Contributes no line, is not a failure, and cannot cause the total leg (BR-8, E-4, `M-4e`) |
| F-10 | Every in-scope decision fails to render for any mixture of F-8/F-9 reasons | `selected.length === 0` | Total leg — same bytes as F-6/F-7. This is why §6.2 partitions on *what survives*, never on *what failed* |
| F-11 | Rendered index exceeds `maxEntries` and/or `maxBytes` | §3.6's drop loop | Whole lines dropped in omission order until both bounds hold; each drop recorded in `omitted[]`. Never truncated, never aborted, never oversized (BR-13, N-1) |
| F-12 | A single line alone exceeds `maxBytes` | same loop | Dropped whole; the remaining lines render if they fit; if it was the only line, `selected` is empty and the block is `""` (E-8 ⇒ E-6) |
| F-13 | `maxEntries` resolves to `0` | `nonNegativeInt` accepts `0`; the drop loop empties `selected` | Block is `""` — E-6's outcome. Not an error, not a fallback to the default, not a halt (E-7) |
| F-14 | The feature under review has no directory among the three globs, or its directory yields zero records | §3.1's union over one operand | Project-level set alone. Not a failure, not an empty-set error (Q-2) |

Nothing in this table throws past `dispatchAndVerify`, and nothing writes to disk.

### 6.2 The two legs, restated as one predicate

FSPEC §3.3's legs are decided by what **survives**, never by the kind of thing that failed:

```
selected.length === 0            →  total leg    (block is "", dispatch as if flag off)
0 < selected.length < inScope    →  partial leg  (failed lines absent, survivors render)
selected.length === inScope      →  ordinary render
```

Because the predicate reads only `selected`, there is no third outcome to invent and no case left
over: the total leg is the degenerate case of the partial leg where the surviving subset is empty.
This is also why F-9 cannot cause the total leg on its own reading — an empty source removes
nothing from `selected` that was ever in it.

### 6.3 O-7 — the driver-internal observable BR-8 needs

FSPEC O-7 assigns TSPEC an obligation: BR-8's empty-versus-failed distinction has no
dispatch-visible consequence, so without a driver-internal observable it is unfalsifiable.

The observable is the pair of **separate** fields `failedSources` and `emptySources`, returned by
`selectDecisions` and carried onto `report.decisionLedger.dispatches[].{failedSources,emptySources}`
(§5.1). They are disjoint by construction — an entry is classified by `readOk`, and an entry with
`readOk: true` can only reach `emptySources` — and their union is the set of sources contributing
no line.

That gives AT-10's classification conjunct something to assert: for a corpus whose only source
reads and parses to zero records, the dispatch bytes are E-6's (identical to the total leg's, so
not discriminating), **and** `failedSources` is `[]` while `emptySources` has one member. Reverse
the classification in the implementation and the bytes do not move but the assertion fails — which
is exactly the falsifiability O-7 asked for.

Neither field is read by any driver computation; both are write-only report data, so adding them
cannot disturb BR-11/§5.5.

### 6.4 Degradation direction

Every path above degrades toward **absence**, never toward a wrong line (BR-7). A decision missing
from the index is one a reviewer may freely challenge; a decision rendered with a wrong statement or
an unresolvable citation would suppress a legitimate challenge. Concretely: a record whose heading
does not match `DECISION_HEADING_RE` is not recognised and contributes nothing, rather than being
rendered with a guessed statement; a source that fails to read contributes nothing rather than a
placeholder line; and a line that will not fit is dropped whole rather than truncated.

## 7. Test Strategy

Suite: `pdlc/workflows/__tests__/` under jest (`cd pdlc/workflows && npm test`), plus one file in
`pdlc/engine/__tests__/` under `node:test` for the config disclosure. Both are gate checks
(`Unit tests (ubuntu-latest, node 20)` and `Engine tests (ubuntu-latest)`).

**Coverage obligation, stated because the shipped gate will not state it.** `pdlc/workflows`'
coverage gate is `c8 ... --check-coverage --per-file --branches 85`, and its `include` list names
`**/pdlc/workflows/orchestrate-dev.js` as a single file. Since every symbol this feature adds lands
in that ~817 KB file (D-6), the new branches are averaged into a per-file ratio already dominated by
~17k lines of shipped code: §6.1's **fourteen** failure rows could be entirely uncovered and the
gate would not move. The gate is therefore not evidence for this feature, and this spec does not
rely on it.

The obligation is stated directly instead, and PLAN owns its discharge:

> **Every row of §6.1's failure table has at least one test that exercises it**, named in the PLAN
> task that implements the row. F-1…F-5 are covered by `parseDecisionLedgerConfig`'s pure unit
> matrix; F-6, F-7 by the `_git` double's `!ok` and throwing arms; F-8, F-9 by the `_readFile`
> double's `null` and zero-record arms (and their `failedSources`/`emptySources` split, §6.3);
> F-10 by the total-leg assertion; F-11…F-13 by §7.5's property, whose bounds range spans `0`,
> exactly-fitting and generous; F-14 by the no-directory corpus case.

This is a stronger obligation than a percentage floor and a checkable one: the mapping is from a
numbered spec row to a named test, so a missing row is visible by inspection of the PLAN rather than
by a coverage delta that rounds to zero.

### 7.1 Test doubles

No new double kind is invented. The two seams are the ones `gatherLearningsCorpus` already takes,
and the shipped scripted doubles in `pdlc/workflows/__tests__/helpers/` supply both:

| Seam | Double | Contract exercised |
|---|---|---|
| `_git` | scripted sync function returning `{ ok, stdout }`, or throwing | F-6's graceful `!ok` **and** ungraceful throw both reach `{unlistable: true}` |
| `_readFile` | scripted map `path → string`, with designated paths returning `null` and designated paths throwing | P-8's shipped lesson: the runtime read throws where the double returns `null`, and both must degrade one entry, never the corpus |
| `_log` | collector array | the per-dispatch observability line is live in production, not only under doubles (the shipped CODE_REVIEW F2 lesson on the learnings injector) |

`recogniseDecisionRecords`, `selectDecisions`, `renderDecisionLedgerBlock` and
`parseDecisionLedgerConfig` are pure and are tested with **no** doubles at all. This is the
cite-and-reuse point: the repo's precedent is an in-process oracle over injected seams, never a
black-box sub-process, and this feature adds no reason to deviate.

### 7.2 Test categories

| Level | What is tested | Against |
|---|---|---|
| Pure unit | `parseDecisionLedgerConfig` over C-3's three keys × {valid, wrong-typed, absent} plus the block-level malformation case; `recogniseDecisionRecords` over §3.2's five conjuncts; `renderDecisionLedgerBlock`'s exact-`""` contract | literals |
| Corpus oracle | §3.5's table — the rule's output over a **frozen fixture copy** of the corpus reproduces `M-1d`, `M-2e`, `M-3c`, `M-4a`–`M-4d`, and `M-4b`'s zero | frozen fixture, never the live repo |
| Integration | `reviewLoop` driven end to end with a scripted `_injectDecisionLedger`, asserting the composed reviewer-prompt bytes on both iteration-1 and iteration-≥2 paths | composed strings |
| Byte-identity baseline | §7.4 | committed merge-base fixture |
| Property | §7.5 (O-8) | generated inputs |
| Source census | §7.3 | module source text |
| Engine disclosure | §5.3 | `.claude/pdlc.config.example.json` |

### 7.3 The frozen fixture copy, and why it is not the live repository

REQ-DECLEDGER-01 and FSPEC AT-01 require the corpus assertions to run against a **frozen fixture
copy** at Baseline v1.1's `Verified at` commit, never the live repository. The reason is concrete
and this branch is the witness: `docs/pdlc-decision-ledger/` is growing while the feature is built,
and this feature's own DECISIONS document will be added to it, so a test reading the live tree would
red on unrelated decisions the moment any feature records one. It is the same class of failure as
the `coveredViolations` whole-tree walk recorded in `CLAUDE.md` — a live filesystem read turns an
unrelated file into a test failure.

The fixture lives at
`pdlc/workflows/__tests__/fixtures/decision-corpus/` and is a path-preserving copy of the 25
in-scope `DECISIONS-*.md` files at `8c673a09f`, addressed through the `_git` and `_readFile`
doubles rather than by real filesystem paths, so no test touches the working tree. Its integrity is
guarded the way `loopEconomicsBaselineGuard.test.js` guards its own: a per-file digest literal
**hand-transcribed** into the test, never recomputed and never read from a manifest, since a
re-capture rewrites a manifest in lockstep with the thing it would be checking.

Expected statements and citations are transcribed from the fixture's own heading text and record
location — data — never captured from the renderer's output, which would derive the expectation
from the code under test (AT-01). `M-3c`'s verbatim second-opening heading is the pinned
discriminating case; `M-4d`'s eight non-record headings and `M-4b`'s twelve namespace-less ids are
the pinned exclusion cases.

**Source census for BR-11 / §5.5.** Alongside the behavioural replay of AT-16, one oracle reads
`orchestrate-dev.js`'s source and pins an *absence*. The precedent is `DEC-LOOPECON-07`, and it is
the right instrument here because BR-11 is a claim that a coupling does not exist. An earlier draft
of this paragraph specified the census in terms that cannot be implemented, and the correction is
the substance of this section.

**Why the earlier wording was unimplementable, stated so it is not re-attempted.** It asked for "no
identifier from the ledger's output types (`DecisionRecord`'s `id`, …)" to appear "inside the
convergence, dedupe, derivative-stop, erratum-mint or confirmation-presence regions". Both operands
fail:

- **The token set was ubiquitous.** `id` is one of the most common identifiers in an ~817 KB file;
  a census forbidding it forbids essentially everything and could never go green.
- **The regions do not exist as source objects.** `orchestrate-dev.js` carries exactly **one**
  sentinel-bounded region, `// === LEARNINGS INJECTION REGION START ===` / `... END ===`. There are
  no delimiters marking "the convergence region" or "the dedupe region", so a scan cannot address
  them. `DEC-LOOPECON-07`'s own census — the cited precedent — does not scan regions either: it
  asserts **zero occurrences of named literal tokens over the whole file**.

**The census, specified the way the precedent actually works.** Both operands are named, frozen and
set-equality-checked, so neither can drift silently:

| Operand | Definition | How it is kept honest |
|---|---|---|
| **Forbidden token set** | The frozen literal `DECISION_LEDGER_CENSUS_TOKENS`, whose members are the *distinctive, unambiguous* exported names this feature introduces: `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `decisionLedger` | A companion test asserts **set equality** between `DECISION_LEDGER_CENSUS_TOKENS` and the module's exported decision-ledger symbol names, so a symbol added later cannot escape the census by not being listed. Generic tokens like `id` are excluded by construction — the set holds only names that are unique to this feature |
| **Scanned source** | The whole of `orchestrate-dev.js`, **minus** the four regions this feature legitimately owns: `parseDecisionLedgerConfig`'s body, `buildDecisionLedgerInjector`'s body, `selectDecisions`/`recogniseDecisionRecords`/`renderDecisionLedgerBlock`'s bodies, and the `main()` wiring block. Each is sliced by brace-matching from its declaration, exactly as `advisoryDisabled.test.js`'s `sourceExcludingParser` slices `parseAdvisoryConfig` | The slicing helper is the shipped one's shape, and the test asserts each slice is non-empty before counting — an empty slice would silently make the census vacuous |

The assertion is then the precedent's: **zero occurrences** of any member of
`DECISION_LEDGER_CENSUS_TOKENS` in the scanned remainder. This is implementable, non-vacuous, and it
falsifies exactly what BR-11 claims — if a future edit reads a decision id inside convergence,
dedupe, derivative-stop or erratum-mint code, that code sits outside the four owned regions and the
census reddens. What it deliberately does **not** attempt is to prove the absence of a coupling
routed through a generically-named local; that residue is covered behaviourally by AT-16's replay
(§7.6), and the two together are the compensating control §7.7 records against R-3.

### 7.4 O-4 — the byte-identity baseline and its pinning

REQ C-2 / REQ-DECLEDGER-02 / AT-04 require byte-identity against a **committed fixture baseline**,
never a same-branch before/after comparison, because a regression corrupting both arms identically
passes every same-branch comparison. FSPEC O-4 asks this spec to name the baseline's identity and
the pinning that stops a re-capture silently satisfying AT-04.

- **Capture harness:** `scripts/capture-learnings-baseline.mjs`'s `runCaptureScript`, reused
  unchanged. It materialises the merge-base worktree with `git worktree add`, imports that tree's
  `pdlc/workflows/orchestrate-dev.js`, drives a scenario matrix, writes `{caseId}/{n}.txt` plus
  `MANIFEST.json`, and removes the worktree in a `finally`.
- **Baseline identity:** `git merge-base origin/main HEAD` on `feat-pdlc-decision-ledger`, recorded
  as `mergeBaseSha` in the new
  `pdlc/workflows/__tests__/fixtures/decision-ledger-baseline/MANIFEST.json`. **How that field is
  guarded is the shipped shape, not a new one.** The load-bearing check is equality against a
  **hand-transcribed literal** in the test file — `expect(manifest.mergeBaseSha).toBe(EXPECTED_MERGE_BASE_SHA)`
  — because a re-capture rewrites the manifest, so a test reading the expected value *from* the
  manifest checks nothing. `git merge-base --is-ancestor {recorded sha} HEAD` is kept only as a
  documented **weaker second signal**, catching a manifest naming a sha that was never merged at
  all; it cannot distinguish "pre-feature" from "mid-feature", since a later `main` commit is an
  ancestor of HEAD too. This is precisely what `loopEconomicsBaselineGuard.test.js` already does,
  including the reason in its own comment, and this feature reuses it verbatim rather than
  redesigning it. Note what the shipped form avoids: it resolves ancestry against **`HEAD`**, never
  against `origin/main`, so the assertion needs no fetch, is hermetic in CI, and cannot red on an
  unrelated push to `main`.
- **Scenario matrix:** `fixtures/decision-ledger-baseline/scenarios.mjs`, one definition imported by
  **both** the capture and the guard, differing only in which `orchestrate-dev.js` namespace is
  handed to it. It sits inside the fixture directory, not `__tests__/helpers/`, so the PLAN's
  file-ownership manifest can give one task both paths without a second task writing `helpers/` in
  the same batch. Jest never collects it — `testPathIgnorePatterns` already excludes
  `/__tests__/fixtures/`.
- **Recorded stream, deliberately narrow:** one case, `REVIEW-LOOP-REVIEWER-PROMPTS`, driving the
  exported `reviewLoop` directly and recording the reviewer-prompt streams for a first-pass round
  and a delta re-review round. A whole-`main()` recording would red on this feature's own intended
  additions (the new notices, the new report field) and would have to be re-transcribed mid-feature,
  proving nothing — the lesson `loop-economics-baseline/scenarios.mjs` records for its own narrow
  cases.

  **This case cannot carry AT-05, and the split is stated rather than left to be discovered.**
  `reviewLoop`'s parameter list takes seams and settings, never config text: the enablement gate
  lives in `main()`, where `readLearningsConfigSafely` reads the file and
  `parseDecisionLedgerConfig` resolves it, and `reviewLoop` receives only the already-built
  `_injectDecisionLedger` seam. A case that drives `reviewLoop` directly therefore reaches all four
  of AT-05's "not enabled" spellings — absent block, wrong-typed value, unparseable file, malformed
  section — as the *same* input, `_injectDecisionLedger: null`. Every arm would pass by construction
  of the harness, and the oracle would be vacuous: it would assert that four identical inputs produce
  identical bytes.

  So the two acceptance tests are given different entry points:

  | AT | Entry point | What it actually falsifies |
  |---|---|---|
  | **AT-04** | `REVIEW-LOOP-REVIEWER-PROMPTS`, driving exported `reviewLoop` | Byte-identity of the reviewer-prompt stream against the merge-base recording, with the seam absent — the shipped disabled path |
  | **AT-05** | A second case entering through the **config gate**: the four spellings are supplied as four `learningsConfigText` values, each run through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector` | That each of the four distinct config inputs resolves `enabled` to `false` and yields `buildDecisionLedgerInjector === null`, and hence the identical `""` block. The four inputs are genuinely different here, so an arm that resolved one of them to `true` reddens |

  Stated as a rule for the implementer: **the recorded arm must consume the config text it is
  varying.** A written config that never reaches the recorded path makes every arm pass for a reason
  that has nothing to do with the property under test.
- **Capture validity window:** the capture must be taken **before** any production change lands, at
  a point where `pdlc/workflows/orchestrate-dev.js` is byte-identical between merge base and branch
  HEAD. The PLAN must make this a real dependency edge (every production task carrying `Deps` on the
  capture task), not a prose note.
- **The pinning O-4 asks for, three clauses:** (a) per-file digest literals hand-transcribed into
  the guard, so a re-capture that rewrites `MANIFEST.json` does not also rewrite its checker;
  (b) `mergeBaseSha` asserted equal to a **hand-transcribed** `EXPECTED_MERGE_BASE_SHA` literal in
  the test file — never read from the manifest it is checking — with `git merge-base --is-ancestor
  {recorded sha} HEAD` kept as the documented **weaker second signal** described in the "Baseline
  identity" bullet above. A form that computes `git merge-base origin/main HEAD` **at test time** is
  specifically excluded: it makes a required check depend on the local `origin/main` ref being
  current, so it can red on an unrelated push to `main` and needs a fetch to be meaningful in CI.
  (c) the case-id check written as **set
  equality**, not containment, so both a deleted case and a silently added case fail — the two
  halves the loop-economics guard proved are not interchangeable.
- **Mutation proof before commit,** the same three steps that guard proves: flip one byte in a
  recorded stream (expect the per-file digest assertion and the oracle comparison red, the manifest
  assertion green); delete a case directory (expect the set-equality assertion red, `actual ⊉
  expected`); add a spurious case directory (expect the same assertion red for the opposite reason).
  Each restored immediately, each observed red recorded in the test file's header.

The guard does **two** jobs, not one: it guards the artifact (digests unchanged) *and* uses it
(drives branch HEAD's `orchestrate-dev.js` through the same matrix and byte-compares). Job one alone
re-hashes a fixture against a digest of itself and proves nothing about the code — the lesson
already written into `learningsBaselineGuard.test.js` and repeated in the loop-economics guard.

### 7.5 O-8 — the bounds invariant as a property

FSPEC O-8 records that BR-12/BR-13's bounds invariant is universally quantified while AT-13
exercises two examples. It is owed as a property, parameterised over **set size × line sizes ×
both bounds**:

> For any in-scope record set and any non-negative `maxEntries` / `maxBytes`, the rendered block
> either is exactly `""` or satisfies all of: at most `maxEntries` lines; at most `maxBytes` bytes;
> every rendered line is byte-identical to the line the unbounded renderer would have produced for
> that record (no truncation, no abbreviation); and the rendered set is a **prefix under §3.6's
> omission order** of the unbounded set.

The last conjunct is what makes the property non-vacuous. A renderer that emits `""` for every
input satisfies the three bounds conjuncts trivially; the prefix conjunct fails it. The generator
draws record sets spanning zero, one, and many records, line lengths spanning below/at/above
`maxBytes`, and bounds spanning `0`, exactly-fitting, and generous — so E-6, E-7 and E-8 are all
inside the property's range rather than beside it. The model is built from the production line
renderer applied per record, not from a re-implementation of the drop loop, so a bug in the loop
cannot be mirrored into the oracle.

**The model does not reuse the renderer, or the no-truncation conjunct would be an echo.** Building
the expected line by calling the production line renderer would make "each rendered line is
byte-identical to the line the renderer produced for that record" true by construction: a wrong line
*format* — a dropped separator, a citation field rendered as `{heading}` instead of `{id}`, a
truncated statement — would appear on both sides of the comparison and the conjunct could never
fail. Only the prefix conjunct would carry any weight.

So the property's model carries its **own** formatter, transcribed from §4.3's stated format
(`{id} — {statement}  [{sourcePath} § {id}]`) and independent of production code. The four conjuncts
then fail on four different mutations: dropping a line reddens the prefix conjunct, truncating one
reddens no-truncation, mis-ordering reddens the prefix conjunct, and changing the citation field
reddens no-truncation. This is the same discipline §7.3 applies to the corpus oracle — expected
values transcribed from data, never captured from the code under test — applied to the property.
The cost is one duplicated format literal, and §4.3's framing-budget pin plus AT-02's resolution
check are what keep the duplicate honest.

### 7.6 Coverage of the FSPEC's acceptance tests

| AT | Level | Notes |
|---|---|---|
| AT-01 | corpus oracle, §7.3 | whole-line equality; two dispatches, `pdlc-advisory-wave-gate` (45 lines) and `pdlc-engineering-loop` (48). **Run with `maxBytes` non-binding** — see the note below |
| AT-02 | corpus oracle | each citation resolved back in the fixture |
| AT-03 | integration | a record mutated **in the scripted `_readFile` double's returned text**, not on the fixture files — see the note below |
| AT-04 | baseline guard, §7.4 | byte-identity against the merge-base recording, seam absent |
| AT-05 | config-gate case, §7.4 | four not-enabled spellings supplied as four config texts, each resolving to a `null` injector |
| AT-06, AT-07 | pure unit on `DECISION_LEDGER_RULE_TEXT` | both conjuncts, both exemplars, both labelled |
| AT-08, AT-09, AT-10 | integration with scripted seams | total leg, partial leg, empty-source classification via §6.3 |
| AT-11 | pure unit | set equality over C-3 × §3.1's condition space, plus block-level malformation |
| AT-12 | integration + source census, §7.3 | rule text carries the id key; `DEC-LOOPECON-06`'s triple untouched |
| AT-13, AT-15 | pure unit, subsumed by §7.5's property | examples kept as regression anchors |
| AT-14 | baseline guard | positive assertion: byte-identical to AT-04's stream |
| AT-16 | replay, both flag settings | invariance **plus** the open-finding ledger anchored to a value transcribed from the fixture, so a driver broken identically in both arms still fails |
| AT-17 | integration | a filed High reopening mints its erratum item and satisfies the confirmation-presence check |
| AT-18 | corpus oracle over O-5's synthetic two-file fixture | cardinality **and** §3.4's positive conjunct: the single line's `statement`/`sourcePath` equal the project-level record's (transcribed from the fixture) and `origin === "project"`, with the feature-level statement asserted absent |

**Two notes the rows above are too narrow to carry.**

**AT-01 runs with the byte bound non-binding, and this is deliberate.** §3.6's measurement shows the
45- and 48-line sets render to 7,042 and 7,650 bytes of index lines, which with §4.3's framing budget
exceed the `maxBytes` default of 8,000. Under default configuration the renderer would drop lines and
the 45/48-line expected sets would be **unproducible** — the oracle would assert a set the renderer
cannot emit. AT-01's subject is the **recognition rule** (§3.1–§3.4), not the bounds, so the oracle
supplies an explicitly non-binding `maxBytes` (and `maxEntries`) and says so in the test file's
header. The bounds are the subject of §7.5's property and AT-13/AT-15, where they are exercised across
their whole range. Stated so the wrong fix is not applied later: if this test ever reddens, the
correct response is **never** to trim the expected set to whatever the renderer emitted — that is the
implementation echo AT-01's own "never captured from the renderer's output" clause forbids.

**AT-03 mutates the double's output, not the fixture on disk.** §7.3 guards the fixture copy with
hand-transcribed per-file digests, so a test that edited a fixture file between two injector calls
would red the integrity guard — the two requirements are contradictory as literally stated. They are
separated by level: the fixture copy is **immutable**, and AT-03's "the corpus changed between
dispatches" scenario is produced by the scripted `_readFile` double returning one text on its first
call for a path and a mutated text on its second. This tests exactly what AT-03 is for — that the
injector re-gathers per dispatch and holds no snapshot (§2.6, BR-9) — without any test writing to the
working tree, which is the discipline §7.3 exists to enforce.

### 7.7 What is not tested, and why

G-4's retrospective trend is explicitly non-binding in the REQ and carries no acceptance criterion;
nothing here asserts it. Reviewer compliance with the rule text is not testable by construction —
R-3 accepts this, and §5.5's source census is the compensating control, pinning that no gate could
enforce it even if one wanted to.

## 8. Traceability

### 8.1 Requirement → technical component

| Requirement | Business rules | Technical components |
|---|---|---|
| REQ-DECLEDGER-01 | BR-1, BR-2, BR-3, BR-9; E-9, E-10, E-11 | §3 recognition rule; `recogniseDecisionRecords`, `selectDecisions`, `renderDecisionLedgerBlock`; §2.6 freshness. Edge cases by id: **E-9** (mixed file — non-record headings contribute no line) → §3.2's five conjuncts, `M-4d` pinned as the exclusion case (§7.3); **E-10** (one id opened twice, question then outcome) → §3.3's last-wins resolution, `M-3c` pinned as the discriminating case (§7.3); **E-11** (same id project- and feature-level) → §3.4's precedence rule and its positive conjunct, over O-5's synthetic fixture (§7.6, AT-18) |
| REQ-DECLEDGER-02 | BR-4 | §2.3 gate (`buildDecisionLedgerInjector` returns `null`); §4.5 default parameters; §7.4 baseline guard |
| REQ-DECLEDGER-03 | BR-5, BR-6 | `DECISION_LEDGER_RULE_TEXT` (§4.3) |
| REQ-DECLEDGER-04 | BR-7, BR-8 | §6.1 F-6…F-10; §6.2 leg predicate; §6.3 O-7 observable |
| REQ-DECLEDGER-05 | BR-10 | `parseDecisionLedgerConfig` (§4.1); §2.2 notices |
| REQ-DECLEDGER-06 | BR-6, BR-11 | `DECISION_LEDGER_RULE_TEXT`'s id-as-key clause; §5.5 |
| REQ-DECLEDGER-07 | BR-12, BR-13 | §3.6 omission order; `selectDecisions`' drop loop; §7.5 property |
| REQ-DECLEDGER-08 | BR-11, BR-14 | §5.5 (driver never holds an id); §7.3 source census; §7.6 AT-16 replay |

### 8.2 FSPEC open questions this spec discharges

| Id | Discharged in |
|---|---|
| O-1 recognition rule, omission order | §3 (all), §3.6 |
| O-2 SKILL.md vs dispatch construction | §9 D-3 — decided: dispatch construction, no `SKILL.md` edit |
| O-3 id minting and uniqueness | §9 D-4 |
| O-4 baseline identity and pinning | §7.4 |
| O-7 driver-internal observable for BR-8 | §6.3 |
| Q-1 concrete line format | §4.3 |
| Q-2 feature contributing nothing / no directory | §3.1 |
| Q-3 config disclosure in scope | §5.3 |

O-5, O-6 and O-8 remain PROPERTIES' (te-author's); §7.3 and §7.5 state what this spec owes them so
they can be written against a fixed target.

### 8.3 Non-goals held

| Non-goal | How this design holds it |
|---|---|
| NG-4 no driver-side scoring change | §5.5, §7.3 source census; the ledger's output reaches no accounting path |
| NG-5 no round-budget change | no constant in this design touches `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, `MAX_ERRATUM_FOLLOWUP_ROUNDS` |
| NG-6 no engine runtime change | the only `pdlc/engine/` file added is `__tests__/decision-ledger-config-example.test.js`, the disclosure-test precedent NG-6 explicitly preserves |
| NG-7 no new record type or field | §3 reads the corpus as it exists; nothing writes a decision record |

## 9. Open Questions

Nothing here blocks PLAN authoring. §9.1 records decisions this spec took where real alternatives
existed — DECISIONS material. §9.2 records the one erratum this spec raises upstream. §9.3 records
what remains genuinely open.

### 9.1 Decisions taken, with the alternative rejected

| Id | Decision | Alternative rejected, and why |
|---|---|---|
| **D-1** | In-file duplicate resolution keys on the **last** record (§3.3) | Keying on the heading **separator** (`:` = decision, `—` = question). It works on the sole HEAD instance and is unfalsifiable elsewhere, makes the statement field's correctness depend on punctuation no author was instructed to use, and silently drops any record using the other separator. Keying on the **first** record is rejected outright: `M-3c` records that the first opening states the question, so it violates BR-3 |
| **D-2** | The index attaches to `reviewerPrompt` only, not to the delta-confirmation or finding-restatement prompts (§2.5) | Attaching to every reviewer-facing prompt. Both confirmation prompts forbid re-review in their own text, so an index inviting the reader not to re-open closed decisions has nothing to act on; attaching there enlarges the byte-identity surface for no behavioural gain |
| **D-3** | Wiring goes through **dispatch construction**, not a `SKILL.md` edit (FSPEC O-2) | Editing the reviewer `SKILL.md` files. A `SKILL.md` edit routes through the consolidation contract's `CONSOLIDATION-PROPOSAL` review, and — decisively — `SKILL.md` text cannot be config-gated, so REQ C-2's byte-identical disabled path would be unachievable. Dispatch construction is where the shipped `findingGrammarClause` gate already lives |
| **D-4** | Ids are read, never minted; uniqueness is **not** enforced across namespaces (FSPEC O-3) | Introducing a mint or a global uniqueness check. `M-1a` records that no id repeats within `docs/_decisions/` and `M-5a` that no id is recorded in two files anywhere at HEAD, so there is nothing to fix; a uniqueness *gate* would be a new operator-facing failure class, which G-3 forbids. §3.4's precedence rule is the total resolution for the collision that does not yet exist |
| **D-5** | Framing bytes (header, preamble, rule text, trailer) **are** charged against `maxBytes` (§4.2) | Excluding framing, as `renderLearningsBlock` does. BR-12 bounds "the bytes of the index block as it appears in the prompt", and the rule text is inside that block; excluding it would let a low `maxBytes` be satisfied while the block is arbitrarily larger than the operator asked for |
| **D-6** | All new symbols land in `orchestrate-dev.js`, not a new `pdlc/workflows/lib/` module | A new `lib/` module. `DEC-LOOPECON-08` records why this is not available: the engine's `prepack.mjs` vendors a frozen module list, and adding to it means editing `pdlc/engine/`, which REQ NG-6 forbids. The cost — every implementation task writing one physical file, forcing serial waves — is taken knowingly and is the PLAN's to absorb via `Deps` edges. **Placement within the file is also decided:** all new symbols land *outside* the sentinel-bounded `// === LEARNINGS INJECTION REGION ... ===` block, which belongs to `pdlc-learnings-injection`. `advisoryDisabled.test.js` slices that region out before counting `/\.enabled\b/`, so landing inside it would silently exempt this feature from PROP-DIS-06 and make §2.3's destructured-read discipline unenforceable (§2.3) |
| **D-7** | The rendered citation is `[{sourcePath} § {id}]` (§4.3) | `[{sourcePath} § {heading}]`, which an earlier draft specified. The heading *is* the id plus the statement, so that form rendered every statement twice — 9,371 bytes against 6,305 for the project-level set, ~33% of the block spent on a duplicate. Path-plus-id resolves the record at its own source, which is all BR-3 and AT-02 require. `DecisionRecord.heading` is retained as the verbatim value expected results are transcribed from, but is not rendered |
| **D-8** | `renderDecisionLedgerBlock` is the single producer of ledger bytes; `selectDecisions` calls it to obtain `renderedBytes` (§4.2) | Letting `selectDecisions` compute the size from its own concatenation. Two implementations of one format drift, and the drift is invisible in the worst direction — BR-12's bound enforced against a size the prompt does not have, with both functions individually looking right and every test green |
| **D-9** | The framing constants are pinned to a ≤1,200-byte budget by a unit test (§4.3) | Leaving framing unmeasured. D-5 charges framing to `maxBytes`, so an unpinned framing size is an unmeasured quantity inside a measured budget, and §3.6's headroom arithmetic would be unfalsifiable prose |

These are load-bearing and a future reader will otherwise reconsider them confidently:
**DECISIONS is warranted.**

### 9.2 Erratum raised

**ERR-1 — REQ C-5 types `maxEntries` and `maxBytes` as "positive integer", but FSPEC E-7 requires
`maxEntries: 0` to be a valid admits-nothing value** treated as zero in-scope decisions and
explicitly "not an error, not a fallback to the default, not a halt". A positive-integer validator
rejects `0` and falls it back to `70`, which is the opposite outcome. The shipped precedent resolves
the same tension in FSPEC's favour: `parseLearningsConfig` validates its thresholds as
**non-negative** integers precisely so that `0` is a valid admits-nothing value, and says so in its
own comment. This spec implements non-negative (§4.1) and raises the type label upstream rather than
editing the REQ.

**ERR-2 — REQ C-5's `maxBytes` default of 8000 is now measured, and admits about two feature-level
lines.** A-1 records 8000 as an unmeasured analogy from `learningsInjection`. The measurement is now
taken (§3.6): at the Baseline's `Verified at` commit, under §4.3's shipped line format, the
project-level set alone renders 41 lines / **6,305** bytes, and with §4.3's ≤1,200-byte framing
budget charged (D-5) the 8,000-byte bound leaves roughly **495** bytes — about **two** feature-level
lines at the measured 137–160 bytes/line. The largest feature directory (`pdlc-headless-engine`,
`M-6b`'s 63-line floor) would need 12,059 bytes to render whole.

Nothing here is broken: the omission order is designed for exactly this, project-level material is
never reached by the bound, and REQ-DECLEDGER-07 explicitly permits omission. But the *product*
intent of REQ-DECLEDGER-01 — one line per in-scope decision — is met for the promoted corpus and only
marginally for the feature under review, which is the half a reviewer is most likely to have recently
argued about. That is a product judgement, not an engineering one, so it is routed rather than taken:
**a default of 12,500 admits the worst standing case with headroom**, and this spec is correct at
either value since the bound is a parameter and the order is the mechanism. The measurement is
supplied so the choice can be made on numbers; A-1 already makes the default operator-revisable
without a REQ revision, so this may equally be resolved by leaving C-5 alone and letting operators
raise it.

### 9.3 Genuinely open

| Id | Owner | Substance |
|---|---|---|
| **O-5, O-6** | te-author (PROPERTIES) | Carried unchanged: the synthetic two-file precedence fixture, the constructed fail-open fixtures, the frozen corpus copy, and AT-16's recorded round of reviewer outputs. §7.3 and §7.4 fix the shapes they must be written against |
| **O-8** | te-author (PROPERTIES) | The bounds invariant as a property. §7.5 states the four conjuncts, the generator's range, and the non-vacuity conjunct |
| **T-1** | se-author (PLAN) | The capture-before-production ordering of §7.4 must be a real `Deps` edge on every production task, not a prose note — the loop-economics PLAN's §2 recorded the same requirement for the same reason |
| **T-2** | ~~se-author (PLAN)~~ **closed in this revision** | *Was:* defer the measured rendered size to the PLAN, once the renderer exists. The premise was wrong — the size is computable from the corpus and the line format alone, both of which this document fixes, so nothing had to wait for an implementation. Measured and recorded in §3.6's table; the format defect it exposed is fixed in §4.3; the residual question, which is the value of a REQ-owned default, is routed upstream as **ERR-2** rather than left open here. No PLAN task is owed |

### 9.4 Assumptions

Carried from FSPEC §7 unchanged and still operator-vetoable: **A-1** `maxEntries` 70 is measured
against `M-6b`/`M-6c`, `maxBytes` 8000 is not measured; **A-2** rollout is config-gated, default off;
**A-3** enforcement is reviewer-side, not a mechanical gate.

This spec adds one assumption of its own: **A-4** the corpus is enumerated through `git ls-files`
with `--others --exclude-standard`, matching `LEARNINGS_CORPUS_ARGV`, so an untracked-but-present
`DECISIONS-*.md` is in scope. This is the shipped precedent's behaviour and is stated so it is a
choice rather than an accident; the frozen-fixture discipline of §7.3 means it cannot make a test
depend on the working tree.

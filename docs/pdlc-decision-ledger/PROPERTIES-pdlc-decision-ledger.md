# PROPERTIES — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES**` (`REQ-pdlc-decision-ledger.md` v1.9, `FSPEC-pdlc-decision-ledger.md` v1.3, `TSPEC-pdlc-decision-ledger.md` v0.7, `DECISIONS-pdlc-decision-ledger.md`, `PLAN-pdlc-decision-ledger.md` v0.3) |
| Downstream | IMPL tests |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | te-author | 1.0 | 2026-08-29 |

## Overview

**What this document is.** The proof system for the decision ledger: a set of falsifiable
properties dense enough that an implementer can write every test in `PLAN` §Batches without asking
a further question, and a reader can audit coverage against `REQ` §5, `FSPEC` §4/§5/§6 and
`TSPEC` §6.1 mechanically.

**What the feature is.** `TSPEC` §1.1 places every new production symbol in one file,
`pdlc/workflows/orchestrate-dev.js` — verified at HEAD as the module already exporting
`parseLearningsConfig` (`orchestrate-dev.js:2252`), `readLearningsConfigSafely` (`:2313`),
`parsePinCheckConfig` (`:2363`), `parseDerivativeStopConfig` (`:2414`), `LEARNINGS_CORPUS_ARGV`
(`:2230`), `renderLearningsBlock` (`:2731`), `gatherLearningsCorpus` (`:2771`),
`buildLearningsInjector` (`:2825`) and `reviewLoop` (`:9194`). `reviewerPrompt` is **module-private**
(declared at `:11433`, not exported), which is why `TSPEC` §1.1 names `reviewLoop` as its exported
caller and why every prompt-byte property below is asserted through `reviewLoop` or `main()`, never
by importing `reviewerPrompt`. The shipped gate shape this feature clones is live at
`orchestrate-dev.js:11453` (`const findingGrammarPart = findingGrammar ? \`\\n${findingGrammarClause()}\` : ""`),
consumed on both return paths (`:11483`, `:11506`).

### The three obligations this document exists to discharge

`REQ` §7 and `FSPEC` §7 route three items to te-author by name, and `TSPEC` §8.2 confirms they are
the only upstream items left open to this layer. Each is discharged in a named section below, and
nothing else in this document is a prerequisite for them:

| Id | Owner | Substance | Discharged by |
|---|---|---|---|
| **O-5** | te-author | Cross-file precedence has **no HEAD instance** (`M-5a` records zero ids held as records in two files), so it is coverable only by construction: a synthetic two-file corpus recording one id both project-level and feature-level | Fixture **FX-PRECEDENCE** (§Fixtures); PROP-PRE-01…04 |
| **O-6** | te-author | `FSPEC` E-2, E-3 and E-4 likewise have no HEAD instance, and `M-4e` records that an empty file and a failed read are separable only by construction; the frozen corpus copy `AT-01` asserts against, and `AT-16`'s recorded round of reviewer outputs, are owed as constructed fixtures too | Fixtures **FX-CORPUS**, **FX-FAILOPEN**, **FX-REPLAY**, **FX-BASELINE** (§Fixtures); PROP-FAIL-01…08, PROP-INV-01…04 |
| **O-8** | te-author | `BR-12`/`BR-13`'s bounds invariant is universally quantified while `AT-13` exercises two examples; it is owed as a **property** parameterised over set size × line sizes × both bounds | PROP-BND-01…06 (`TSPEC` §7.5's four conjuncts, each with its own falsifying mutation) |

`TSPEC` §7.5 additionally promotes two further quantified claims to properties — **P-REC**
(recognition/resolution) and **P-LINE** (one physical line per decision). They are not upstream
obligations on this layer but they are load-bearing for §Oracles' transcribed byte literals, so they
are carried here as PROP-REC-08…11 and PROP-REND-05…07.

### Scope, and the two things deliberately out of it

**In scope:** every observable this feature creates — resolved config, recognised records, selected
records, rendered block bytes, dispatch prompt bytes, the driver-internal
`failedSources`/`emptySources` split (`TSPEC` §6.3), the report field and the notice set.

**Out of scope, stated so no property is invented for them:**

1. **Reviewer compliance with the rule text.** `REQ` R-3 accepts this as unenforceable by
   construction and `TSPEC` §7.7 records the compensating control. Every rule-text property below
   asserts a property of **the emitted text**, never of anyone's classification — which is what
   `FSPEC` AT-07 means by "no human is in the oracle".
2. **`REQ` G-4's retrospective trend.** Non-binding by REQ design, no acceptance criterion, and
   `TSPEC` §2.5 records that its denominator is strictly wider than this mechanism's injection
   surface. Nothing here asserts it.

### Test pyramid

`FSPEC` has eighteen acceptance tests and `TSPEC` §6.1 fourteen failure rows; pushing them to the
cheapest falsifying level is what keeps the suite runnable per wave (`PLAN` T-18 runs it per batch).

```
        /  E2E  \          0 — there is no end-to-end journey; the composition root is the top
       /----------\
      / Integration \      3 seams — reviewLoop composition, main() composition root, replay
     /----------------\
    /    Unit + property  \  the rest — 4 pure functions, 3 properties, 2 corpus oracles,
   /______________________\   1 baseline guard, 1 source census, 1 engine disclosure
```

The composition root (`PLAN` T-10a) is the single most expensive level used, and it is used because
`TSPEC` §7.2 (DC-07) records that a source census proves a string is present and never that a line
runs. No property below is assigned E2E.

### Reading conventions

- **Level** is the cheapest level that can falsify the property, per `TSPEC` §7.2's category table.
- **Fixture** names a `FX-*` entry in §Fixtures. Every property that needs constructed data names
  one; a property naming none is over literals.
- **Task** is the `PLAN` task that owns the property. Red-before-green pairs are written
  `T-05 → T-14`, the `[red]` test task first.
- Every citation is stable content — a spec id, a section anchor, an exported symbol or a verbatim
  quote — per `DEC-DOC-01`. The one exception is a `file:line` anchor where the **position is the
  claim** (the census and the shipped-gate reads above), which `DEC-DOC-01` permits.
- Statement, citation and byte literals quoted below are transcribed from **data** — the frozen
  fixture or the normative spec text — never captured from a renderer, per `PLAN` §Anti-echo
  commitments.

## Properties

Every property is stated as *{component} must/must not {observable} {when}*, classified, levelled,
traced to at least one `REQ` acceptance criterion and at least one `FSPEC` business rule or edge
case, and assigned to the `PLAN` task that owns it. **Negative properties are marked ✖.**

### CFG — config resolution (`parseDecisionLedgerConfig`)

Traces `REQ-DECLEDGER-05`, `REQ` C-1/C-3/C-5; `FSPEC` BR-10, E-1, E-5, AT-11; `TSPEC` §4.1, §6.1
F-1…F-5. Owner **T-04 → T-13**. Level: **pure unit**, over literals — no fixture.

| Id | Property | Category |
|---|---|---|
| **PROP-CFG-01** | `parseDecisionLedgerConfig` must return `DECISION_LEDGER_DEFAULTS` — `{enabled: false, maxEntries: 70, maxBytes: 12500}` — when `text` is `null`, when `text` does not parse as JSON, and when the parsed object holds no `decisionLedger` key, and must set `sectionMalformed: false` and `invalidKeys: []` in all three cases. | Error Handling |
| **PROP-CFG-02** | `parseDecisionLedgerConfig` must resolve each of `enabled`, `maxEntries`, `maxBytes` **independently**: for every key `k` of `REQ` C-3's three, and every condition `c` in {wrong-typed, absent}, with the other two keys carrying valid non-default operator values, the result must equal the operator's value on those two and the C-5 default on `k` alone. | Contract |
| **PROP-CFG-03** | `parseDecisionLedgerConfig` must set `sectionMalformed: true` and return all three defaults when `decisionLedger` is present but **not a plain object** (array, string, number, `null`, boolean). | Error Handling |
| **PROP-CFG-04** | `parseDecisionLedgerConfig` must accept `0` as a **valid** value on both `maxEntries` and `maxBytes`, returning `0` and **not** listing the key in `invalidKeys` — a `nonNegativeInt` validator, never `positiveInt`. | Data Integrity |
| **PROP-CFG-05** | `parseDecisionLedgerConfig` must list in `invalidKeys` exactly the keys it defaulted for wrong-typedness — no more (a valid key never appears) and no fewer (a defaulted key always appears) — asserted as **set equality**, per key and per condition. | Observability |
| **PROP-CFG-06** ✖ | `parseDecisionLedgerConfig` must **not** throw, must **not** read the filesystem, and must **not** mutate its argument, for **any** input string including the empty string, a JSON scalar at top level, and deeply nested garbage — and, on **each** of those same inputs, must **return** the three resolved defaults `{enabled: false, maxEntries: 70, maxBytes: 12500}` with `invalidKeys: []` and `sectionMalformed: **false**` — `false` on **every** input in this row's range, because a top-level scalar, a top-level array and unparseable text all fail the `!isPlainObject(parsed)` guard and short-circuit before any `decisionLedger` lookup (the shipped shape this clones, `parseLearningsConfig`, returns `degraded(false)` there and reserves `degraded(true)` for a *present* block that is not a plain object). Without this positive return conjunct a stub returning `undefined` satisfies all three **not** clauses; PROP-CFG-03's positive companion reaches only the *present-but-not-a-plain-object* case (`TSPEC` §6.1 F-4), never these inputs. | Error Handling |
| **PROP-CFG-07** ✖ | Resolving the `decisionLedger` block must **not** change the resolution of any other block: for a config text carrying a malformed `decisionLedger` alongside valid `learningsInjection`, `cascade` and `review` blocks, `parseLearningsConfig`, `parsePinCheckConfig` and `parseDerivativeStopConfig` must return **byte-identical** results to the same text with `decisionLedger` removed. | Contract |
| **PROP-CFG-08** | The run-level notice set emitted for a config text must be **set-equal** to: `{}` for F-1/F-2/F-3, `{NTC-DECLEDGER-MALFORMED}` for F-4, and `{NTC-DECLEDGER-KEYTYPE}` for F-5 — with the wrong-typed key **named in the notice detail**. | Observability |
| **PROP-CFG-09** | `DECISION_LEDGER_DEFAULTS`' own key set must be **set-equal** to `{enabled, maxEntries, maxBytes}` and the object frozen, so a fourth key or a re-spelling fails (`REQ` C-3's exhaustive enumeration). | Contract |
| **PROP-CFG-10** | `parseDecisionLedgerConfig` must be reached through the **same already-read** `learningsConfigText` `main()` hands `parsePinCheckConfig` and `parseDerivativeStopConfig`, adding **zero** further reads of `.claude/pdlc.config.json`: asserted by a call-count spy on the read seam over a full `main()` run (`TSPEC` §2.2). | Performance |

**Why PROP-CFG-08 names the key rather than asserting a count.** A notice count alone passes a
loader that emits `NTC-DECLEDGER-KEYTYPE` for the wrong key; the detail conjunct is what ties the
notice to the key that actually defaulted.

### REC — recognition and in-file resolution (`recogniseDecisionRecords`)

Traces `REQ-DECLEDGER-01`; `FSPEC` BR-2, BR-3, E-9, E-10, AT-01; `TSPEC` §3.2, §3.3, O-1, D-1.
Owner **T-05 → T-14**. Level: **pure unit** and **property**; corpus-scale assertions are in the
ORACLE section.

| Id | Property | Category |
|---|---|---|
| **PROP-REC-01** | `recogniseDecisionRecords` must yield one record for a line matching **all five** of `TSPEC` §3.2's conjuncts, with `id` = capture 1, `statement` = capture 2 taken **verbatim** (no trim beyond the regex's own `[ \t]*`, no normalisation, no case change), `sourcePath` = the argument, `heading` = the **full line text verbatim**, and `origin` set by the caller's partition. | Functional |
| **PROP-REC-02** ✖ | It must **not** yield a record for an ATX heading outside levels 2–4 — `#` and `#####` — even where every other conjunct holds. | Data Integrity |
| **PROP-REC-03** | It must yield a record for a heading carrying an **ordinal prefix** (`## 2. DEC-EDIST-01: …`, `## 3. DEC-CONS-01: …`). This conjunct is load-bearing: without it `pdlc-engine-distribution` and `pdlc-consolidation-agent` contribute **0** instead of 10 and 8, and the feature-level total is 82 rather than `M-2e`'s 100. | Functional |
| **PROP-REC-04** ✖ | It must **not** yield a record for an id carrying **no namespace segment** (`DEC-01`…`DEC-10`), which is what excludes `M-4b`'s twelve headings in `DECISIONS-pdlc-plugin-retirement.md` and `M-4d`'s four `### DEC-01 — …` question headings; nor for a non-numeric final segment (`DEC-AWG-Q1`, `M-4a`). | Data Integrity |
| **PROP-REC-05** ✖ | It must **not** yield a record where the id appears **mid-heading** rather than opening it (`### What follows from DEC-A6-01`) — only an ordinal may precede — which is what excludes `M-4d`'s four back-reference headings. | Data Integrity |
| **PROP-REC-06** ✖ | It must **not** yield a record for a heading whose statement remainder after the separator is **empty or whitespace-only**, and must **not** yield one for a line carrying the markup mid-line in prose or in a fenced code block that is not itself a heading (`M-4a`'s prose `DEC-` token, `M-4c`'s line-leading citations in `.consolidation-log.md`). | Data Integrity |
| **PROP-REC-07** | It must accept **both** separators actually present in the corpus — `:` in deciding blocks and the em dash `—` in question blocks — and must yield exactly one record per qualifying line for each. | Functional |
| **PROP-REC-08** | Where two qualifying lines in the same text carry the **same id**, it must yield **exactly one** record for that id and that record must be the **later** one in file order (`TSPEC` §3.3, D-1) — asserted positively on `M-3c`'s witness: the yielded `statement` equals the second, deciding opening, and the first, question-form statement is **absent** from the whole result. | Data Integrity |
| **PROP-REC-09** | **(P-REC, property.)** For arbitrary generated text, the set of ids yielded must equal exactly the set of lines satisfying all five conjuncts with a non-empty remainder — no others — and each yielded `statement` must be a **verbatim substring of the line it came from**, and duplicate ids must resolve last-wins yielding exactly one record each. | Data Integrity |
| **PROP-REC-10** | `recogniseDecisionRecords` must return `[]` — never `null`, never a throw — for `text` that is `null`, empty, whitespace-only, or holds no qualifying line, and that empty return must be an **ordinary result** the caller classifies as `emptySources`, never `failedSources` (`FSPEC` BR-8, `M-4e`). | Error Handling |
| **PROP-REC-11** ✖ | It must **not** read the filesystem, throw, or depend on line-ending style: text using `\r\n` must yield records whose `statement` and `heading` carry **no** trailing `\r`. | Contract |

**Why PROP-REC-08's second conjunct is not optional.** A cardinality-only oracle ("one record for
the id") is green under first-wins too, and first-wins renders the *question* rather than the
decision — the exact `BR-3` violation `M-3c` exists to discriminate. The absence conjunct is
asserted over a result that is **non-empty by construction**, so it is not a vacuous absence.

### PRE — cross-file precedence (O-5)

Traces `REQ-DECLEDGER-01`, `REQ` O-5; `FSPEC` E-11, AT-18; `TSPEC` §3.4, D-2. Owner
**T-09 → T-17**. Level: **corpus oracle** over **FX-PRECEDENCE**, the synthetic two-file fixture
this document owes. `M-5a` records **zero** ids held as records in two files at HEAD, so every
property here is unfalsifiable against the standing corpus and constructed data is the only route.

| Id | Property | Category |
|---|---|---|
| **PROP-PRE-01** | Where one id is recognised in **both** a project-level and a feature-level in-scope file, the rendered block must carry **exactly one** line for that id — never two, never zero. | Data Integrity |
| **PROP-PRE-02** | That single line's `statement` and `sourcePath` must equal the **project-level** record's, each transcribed literally from FX-PRECEDENCE and never captured from the renderer, and its `origin` must be `"project"`. | Data Integrity |
| **PROP-PRE-03** ✖ | The **feature-level** record's statement must be **absent** from the whole rendered block — asserted as a substring check over a block that is non-empty and carries the project-level statement (the positive-presence conjunct), so the absence cannot pass vacuously. | Data Integrity |
| **PROP-PRE-04** | Every **other** line in the block must be byte-identical to the block rendered from the same corpus with the duplicate feature-level record removed: the collision must perturb exactly one line. | Idempotency |
| **PROP-PRE-05** ✖ | Precedence must be decided on **`origin`**, never on path order: reversing the enumeration order of FX-PRECEDENCE's two files must produce a **byte-identical** block. `M-5c` warns that a path-ordering tie-break is not well-defined without naming a collation, and `_` (`0x5F`) inverts under case-folded collation. | Idempotency |

**The mutation map** (`TSPEC` §3.4's "the two halves fail on different mutations"): swapping the
precedence direction leaves PROP-PRE-01 green and reddens PROP-PRE-02/03; emitting both records
reddens PROP-PRE-01 and leaves PROP-PRE-02 green. Both are therefore required, and PROP-PRE-05
additionally reddens a build that got the right answer for the wrong reason.

### REND — rendering (`renderDecisionLedgerBlock`)

Traces `REQ-DECLEDGER-01`/`-03`/`-07`; `FSPEC` BR-1, BR-3, E-6, AT-14; `TSPEC` §4.3, D-7, D-8, D-9.
Owner **T-06 → T-15**. Level: **pure unit** and **property**.

| Id | Property | Category |
|---|---|---|
| **PROP-REND-01** | `renderDecisionLedgerBlock({selected: []})` must return **exactly `""`** — not a header, not a preamble, not rule text, not a trailer, not a newline, not a space. `String.length === 0`, asserted as an equality against `""`, never as falsiness. | Contract |
| **PROP-REND-02** | For a non-empty `selected`, the block must open with the header `--- CLOSED DECISIONS (do not re-open without new evidence) ---`, be prefixed `"\n\n"`, carry `DECISION_LEDGER_PREAMBLE`, then the index lines, then `DECISION_LEDGER_RULE_TEXT`, then close with `--- END CLOSED DECISIONS ---` and **no trailing newline**. | Contract |
| **PROP-REND-03** | Each index line must render as `{id} — {statement}  [{sourcePath} § {id}]` — the fields, separators and order fixed by `TSPEC` §4.3 — with every field **transcribed** from the `DecisionRecord`, none synthesised. | Data Integrity |
| **PROP-REND-04** ✖ | The rendered citation must **not** carry the record's full heading (`DecisionRecord.heading` must not appear in the block), which is `D-7`'s retired form and costs ~33% of the block by rendering every statement twice (9,371 vs 6,305 bytes over the project-level set). `heading` must still be **present on the type**, since §Oracles transcribes expected values from it. | Data Integrity |
| **PROP-REND-05** | **(P-LINE, property.)** For any non-empty `selected`, the index region's `split("\n")` length must equal `selected.length` — exactly one **physical** line per selected record — and **no** rendered line may contain an embedded newline. | Data Integrity |
| **PROP-REND-06** | For any non-empty `selected`, the index lines must appear in `TSPEC` §3.6's order: **all** `origin === "project"` lines before **any** `origin === "feature"` line, and within an origin, in enumeration order. | Data Integrity |
| **PROP-REND-07** | Rendering must be a **pure function of `selected`**: two calls with equal input must return byte-identical strings, and the call must not read the filesystem, consult a clock, a locale or an environment variable. | Idempotency |
| **PROP-REND-08** | The four framing constants — header, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, trailer, plus the blank lines between them — must render to **≤ 1,200 bytes** measured by `Buffer.byteLength(…, "utf8")`, asserted against that literal (`TSPEC` D-9). | Performance |
| **PROP-REND-09** | `renderDecisionLedgerBlock` must be the **only** producer of ledger bytes: `selectDecisions` must obtain `renderedBytes` by calling it, asserted by a call-count spy showing `selectDecisions` invokes the renderer at least once per drop-loop step and **never** concatenates a line itself (`TSPEC` D-8). | Contract |

**PROP-REND-08 is a budget, not a measurement.** `TSPEC` §4.3 is explicit that 1,200 is the budget
the rule text must be *drafted to fit*; the constants do not exist yet. If a later edit needs more,
the pin reddens and `TSPEC` §3.6's headroom arithmetic is re-decided deliberately — the ~4,995-byte
whole-corpus headroom and the **441**-byte margin on `M-6b`'s worst standing case shrink one-for-one
with any raise.

**Why PROP-REND-09 is a call-count and not a shape assertion.** Two implementations of one format
produce the same-shaped output while disagreeing on size, and the disagreement is invisible in the
worst direction: the bound is enforced against a size the prompt does not have, `BR-12` is violated,
and every shape assertion stays green. The behavioural call-count is the only oracle that
distinguishes them.

### BND — bounds (O-8)

Traces `REQ-DECLEDGER-07`, `REQ` C-5; `FSPEC` BR-12, BR-13, E-6, E-7, E-8, N-1, AT-13, AT-14,
AT-15; `TSPEC` §3.6, §7.5, F-11…F-13. Owner **T-07 → T-16**. Level: **property** (`fast-check`,
declared at `pdlc/workflows/package.json:13` as `"fast-check": "^4.9.0"` and installed), with
`AT-13`/`AT-15` retained as example regression anchors.

**The property, stated once.** *For any in-scope record set and any non-negative `maxEntries` and
`maxBytes`, the rendered block either is exactly `""` or satisfies all four conjuncts below.* The
generator draws record sets spanning **zero, one and many** records; line lengths spanning
**below, at and above** `maxBytes`; and bounds spanning **`0`, exactly-fitting and generous** — so
`E-6`, `E-7` and `E-8` fall **inside** the property's range rather than beside it.

| Id | Conjunct / property | Category | Falsifying mutation that must red it |
|---|---|---|---|
| **PROP-BND-01** | At most `maxEntries` **lines** in the rendered index region. | Contract | the drop loop tests `>` instead of `≥` on the line count, emitting `maxEntries + 1` lines |
| **PROP-BND-02** | At most `maxBytes` **bytes** in the whole block, framing **charged** (`TSPEC` D-5), measured as `Buffer.byteLength(block, "utf8")`. | Contract | the loop charges index lines only, omitting framing — D-5's charge removed |
| **PROP-BND-03** ✖ | **No truncation:** every rendered line must be byte-identical to the line the **unbounded** renderer would produce for that record; no line abbreviated, no fragment of a dropped line present. | Data Integrity | a line is truncated to the remaining byte budget instead of being dropped whole |
| **PROP-BND-04** | **Prefix conjunct (non-vacuity):** the rendered set must be a prefix of the unbounded set under `TSPEC` §3.6's omission order — feature-level dropped before project-level, and within an origin, reverse enumeration order (last enumerated dropped first). | Data Integrity | the loop drops from the front (project-level first) instead of the back |
| **PROP-BND-05** | Both bounds must be applied by **one** loop with a **disjunctive** condition — *while the block exceeds `maxEntries` lines **or** `maxBytes` bytes, drop the next line in omission order* — so there is no "which bound binds first" stage; each drop must be recorded in `omitted[]` with `reason` in `{RSN-ENTRIES, RSN-BYTES}`. | Functional | the loop applies one bound then the other, leaving a set that satisfies the second and violates the first |
| **PROP-BND-06** | Enumeration order must be **deterministic**: repeated selection over the same corpus must produce byte-identical `selected`, `omitted` and block, with no dependence on clock, locale, or filesystem walk order (`TSPEC` §3.6). | Idempotency | the loop iterates an unordered map |
| **PROP-BND-07** ✖ | **The property's model must not reuse the renderer.** The model that computes the expected line set must carry its **own** formatter, hand-transcribed from `TSPEC` §4.3's stated format (`{id} — {statement}  [{sourcePath} § {id}]`), and must **not** call `renderDecisionLedgerBlock` or any production line renderer. | Contract | the model builds its expected line by calling `renderDecisionLedgerBlock` — whereupon a dropped separator, a citation rendered as `{heading}` or a truncated statement appears on **both** sides of the comparison and PROP-BND-03 can never fail |

**PROP-BND-04 is what makes the family non-vacuous, and it is stated as a positive.** A renderer
returning `""` for every input satisfies PROP-BND-01, -02 and -03 trivially. Only the prefix
conjunct fails it. Every one of the four therefore carries its own named mutation above; each must
be **applied, observed red, reverted, and the observed failure transcribed into the test file's
header** (`PLAN` §Definition of Done, `TSPEC` §7.5).

**Why PROP-BND-07 is a numbered row and not a note.** It is the family's anti-echo conjunct: without
it PROP-BND-03 is true by construction, so an implementer working from the table alone would silently
not write it. The cost it buys is one duplicated format literal; PROP-REND-08's framing pin and the
ORC-02 resolution check are what keep the duplicate honest. It is the **seventh row of the conjunct
table above** — counted in the BND family's **12**, discharged at `FSPEC` AT-13 alongside
PROP-BND-01…03, and cited as part of O-8's discharge in §Coverage Matrix.

**Boundary properties, held as examples alongside the property** (`FSPEC` AT-13/AT-15 regression
anchors, `TSPEC` §7.6):

| Id | Property | Category |
|---|---|---|
| **PROP-BND-08** | `maxEntries: 0` must render **exactly `""`** — treated as zero in-scope decisions, **not** an error, **not** a fallback to `70`, **not** a halt (`FSPEC` E-7). | Error Handling |
| **PROP-BND-09** | `maxBytes: 0` must render **exactly `""`** by the same route — every line exceeds `0`, so `E-8` then `E-6` — **not** an error, **not** a fallback to `12500`, **not** a halt. | Error Handling |
| **PROP-BND-10** | A **single line alone** exceeding `maxBytes`, among other lines that fit, must be **absent in full** from the block, no fragment of it present, and the remaining lines must render. Where it was the only line, the block is `""`. | Error Handling |
| **PROP-BND-11** ✖ | No input may cause the dispatch to be **aborted, oversized, retried, or reported as an error** on account of index size: over the whole generator range, `selectDecisions` must return normally and no notice or failure class may be emitted (`FSPEC` N-1). | Error Handling |
| **PROP-BND-12** | `maxBytes` must bound the **index block alone** as it appears in the prompt — not its contribution to total dispatch size, and not the underlying record bytes: asserted by varying the surrounding prompt's size and showing `selected` and `omitted` are unchanged. | Contract |

### FAIL — fail-open degradation (O-6, O-7)

Traces `REQ-DECLEDGER-04`, `REQ` G-3, R-1, O-6; `FSPEC` BR-7, BR-8, E-2, E-3, E-4, AT-08, AT-09,
AT-10; `TSPEC` §6.1 F-6…F-10 and **F-14** (no directory among the three globs, or a directory yielding zero records — PROP-FAIL-11), §6.2, §6.3. Owner **T-08 → T-17**. Level: **integration with scripted
seams**, over **FX-FAILOPEN**. None of `E-2`/`E-3`/`E-4` has a HEAD instance, so every property here
is constructed data by necessity, which is exactly what O-6 records.

| Id | Property | Category |
|---|---|---|
| **PROP-FAIL-01** | The leg must be decided on **what survives**, never on what kind of thing failed: `selected.length === 0` ⇒ total leg; `0 < selected.length < inScope` ⇒ partial leg; `selected.length === inScope` ⇒ ordinary render. Asserted over corpora that reach each of the three by **different** causes and must agree. | Functional |
| **PROP-FAIL-02** | **Total leg.** Where nothing survives — first every source missing/unreadable/unparseable (`_git` `!ok`, `_git` throwing, `_readFile` `null`, `_readFile` throwing), then a readable corpus in which **every** in-scope decision fails to recognise — the block must be **exactly `""`** and the dispatch prompt must be **byte-identical to FX-BASELINE's flag-off recording**. | Error Handling |
| **PROP-FAIL-03** ✖ | Neither leg may **halt**, throw past `dispatchAndVerify`, write to disk, or emit an operator-facing failure class: over the whole of FX-FAILOPEN, the notice set must be **set-equal** to the flag-off notice set and the run must complete. | Error Handling |
| **PROP-FAIL-04** | **Partial leg.** Where a **proper, non-empty subset** fails — one decision; several decisions; **one whole source unavailable while other sources survive** — the failed lines must be **absent**, **every** surviving expected line **present** (transcribed from the fixture), and the rule text **present**. The three sub-causes must produce **one** outcome, not three. | Error Handling |
| **PROP-FAIL-05** ✖ | A decision that cannot be rendered faithfully must be **omitted whole**, never rendered **partially**: no line may appear carrying an empty, placeholder, truncated or synthesised `statement` or `sourcePath` (`BR-7`). Asserted positively — the block is non-empty and its every line resolves per ORC-02 — so the absence is not vacuous. | Data Integrity |
| **PROP-FAIL-06** | **O-7's observable.** For a corpus whose only source **reads and parses to zero records**, `failedSources` must be `[]` and `emptySources` must have exactly that one member; for a corpus whose only source **fails to read**, the two must be reversed. The dispatch **bytes are identical** in both cases, so this is the only conjunct that can falsify `BR-8` — reverse the classification in the implementation and the bytes do not move but this assertion fails. | Observability |
| **PROP-FAIL-07** | `failedSources` and `emptySources` must be **disjoint by construction** (classified by `readOk`) and their **union** must be exactly the set of in-scope sources contributing no line. | Data Integrity |
| **PROP-FAIL-08** ✖ | An **empty** source must **not** be counted as a failure and must **not**, on its own, cause the total leg: a corpus of one empty source **plus** surviving sources must render the surviving sources' expected line set **exactly** — the empty file adding no line and removing none (`M-4a` and `M-4b` are two standing-corpus files in this position, so this is the common case). | Error Handling |
| **PROP-FAIL-09** | `corpusOutcome` must be `"RSN-UNLISTABLE"` when the `_git` enumeration returns `!ok` **or throws**, `"RSN-EMPTY"` when it succeeds returning zero paths, and `null` otherwise — asserted as set equality against `DECISION_LEDGER_CORPUS_OUTCOMES`. | Observability |
| **PROP-FAIL-10** | `gatherDecisionCorpus` must wrap **each path's read in its own `try/catch`**, so both the runtime shape (`rtReadFile` **throws**) and the test-double shape (`defaultReadFile` returns **`null`**) degrade **that one entry** to `readOk: false` and never the corpus. Both arms must be exercised. | Error Handling |
| **PROP-FAIL-11** | A feature with **no directory** among `docs/{feature}/`, `docs/completed/{feature}/`, `docs/discarded/{feature}/`, and a feature whose directory yields **zero** records, must both resolve to the **project-level set alone** — not a failure, not an empty-set error (`FSPEC` Q-2, `TSPEC` §3.1). `pdlc-plugin-retirement` is the standing witness for the second: its twelve headings are namespace-less `DEC-01`…`DEC-10`, so its directory contributes **0** records while the directory exists. | Functional |

**Why PROP-FAIL-10 names both arms.** `TSPEC` §4.4 records the shipped lesson directly: the runtime
read throws where the double returns `null`. A suite that only scripts `null` proves nothing about
production, and one that only scripts a throw proves nothing about the double the rest of the suite
uses. This is the identical-envelope trap in its read-seam form — both arms produce the same
`readOk: false` envelope, so only exercising both distinguishes an implementation that handles one.

### WIRE — composition root, freshness and injection (DC-07)

Traces `REQ-DECLEDGER-01`, `REQ` G-3; `FSPEC` BR-9, AT-03; `TSPEC` §2.3, §2.4, §2.6, §4.5, §7.2.
Owner **T-10 → T-18** and **T-10a → T-18**. Level: **integration** (`reviewLoop`) and **composition
root, live** (`main()`).

| Id | Property | Category |
|---|---|---|
| **PROP-WIRE-01** | **Freshness.** `injectDecisionLedger` must re-gather the corpus on **every** call: where the scripted `_readFile` double returns one text on its first call for a path and a mutated text on its second, the **second** dispatch's index must reflect the changed record. Asserted as a **call-count** on the read seam (≥ 1 per dispatch), not only as a byte difference — a shape assertion alone cannot distinguish a re-read from a lucky snapshot. | Integration |
| **PROP-WIRE-02** ✖ | The injector closure must hold **no** corpus, **no** rendered block and **no** snapshot between dispatches, and must **not** memoise across calls (`TSPEC` §2.6, §5.4). | Integration |
| **PROP-WIRE-03** | Both reviewers of a round must receive the **identical** block: the single `await`ed injector call must sit immediately before the two `reviewerPrompt` calls in `reviewLoop`. | Integration |
| **PROP-WIRE-04** | **Seam reached (live).** Driving the module's default-exported `main()` with the flag on, a **call-count spy** on the scripted `_git` seam must show `gatherDecisionCorpus`' listing call fires **≥ 1** on the **served reviewer flow**. A fake satisfying only the outer interface cannot meet this conjunct. | Integration |
| **PROP-WIRE-05** | **Positive presence (live).** The reviewer prompt actually handed to the reviewer dispatch must **end with** the rendered ledger block — not merely "differ from the baseline". | Integration |
| **PROP-WIRE-06** | The injector call must be **`await`ed**: a non-awaited call must be detectable, since the adapter's implementations are async while the test doubles are sync (this repo's injected-IO rule). Asserted by scripting an async `_git`/`_readFile` pair and requiring the served prompt to carry the block. | Integration |
| **PROP-WIRE-07** | `buildDecisionLedgerInjector` must return **`null`** iff resolved `enabled` is **not `=== true`**, and with the injector `null`, `reviewLoop` must pass `""` as the `ledgerBlock` argument so the prompt is built by the identical expression it is today. | Contract |
| **PROP-WIRE-08** | The block must be appended **last**, after `oraclePart` and `findingGrammarPart`, on **both** the iteration-1 and the iteration-≥2 return paths `reviewerPrompt` already has (`orchestrate-dev.js:11483` and `:11506`). | Contract |
| **PROP-WIRE-09** ✖ | The index must attach to the review-loop **reviewer** prompt **only** — never to the delta-confirmation prompt or the finding-restatement prompt, both of which forbid re-review in their own text (`TSPEC` §2.5, D-2). Asserted positively and negatively on the same run: the reviewer prompt ends with the block, and the other two prompts are byte-identical to FX-BASELINE's recording of them. | Contract |
| **PROP-WIRE-10** | The enablement flag must be read by **destructuring** (`const { enabled: decisionLedgerEnabled } = decisionLedgerConfig`), never as a dotted `.enabled` member read, and every new symbol must land **outside** the sentinel-bounded `// === LEARNINGS INJECTION REGION START/END ===` block. `advisoryDisabled.test.js`'s PROP-DIS-06 (`advisoryDisabled.test.js:707–740`) slices that region out via `sourceExcludingParser` (`:717–719`) **before** counting `/\.enabled\b/`, so a symbol landing inside it would be silently exempt and this discipline would have no oracle behind it. PROP-DIS-06 must remain green. | Contract |
| **PROP-WIRE-11** | `report.decisionLedger` must be set **only** when the injector is non-null and **absent from the report object entirely** otherwise — never spread as `undefined` (the shipped `learningsInjectionField` discipline). | Contract |

### OFF — the disabled path (byte-identity)

Traces `REQ-DECLEDGER-02`, `REQ` C-2, O-4; `FSPEC` BR-4, E-1, E-6, AT-04, AT-05, AT-14; `TSPEC`
§7.4. Owner **T-02** and **T-10 → T-18**, with the live half **T-10a**. Level: **byte-identity
baseline guard** over **FX-BASELINE**.

| Id | Property | Category |
|---|---|---|
| **PROP-OFF-01** | With `enabled` not `true`, the reviewer-prompt stream must be **byte-identical to the committed merge-base recording** — never to a same-branch before/after comparison, and never to a string computed by subtracting the block from the flag-on prompt. Both weaker forms pass a regression that corrupts both arms identically. | Contract |
| **PROP-OFF-02** | All **four** not-enabled spellings — `enabled` absent, `false`, wrong-typed, and the whole `decisionLedger` block absent or malformed — must produce that identical stream, and **none** may report an error to the operator. | Error Handling |
| **PROP-OFF-03** | The four spellings must be supplied as **four distinct config texts** run through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector`, each yielding `null`. Supplying them to a harness that enters below the config gate makes all four the **same** input (`_injectDecisionLedger: null`) and the oracle vacuously asserts that four identical inputs produce identical bytes (`TSPEC` §7.4). **The recorded arm must consume the config text it is varying.** | Contract |
| **PROP-OFF-04** ✖ | With the flag off, the dispatch must carry **no index, no rule text, no empty block, no marker, and no added or removed whitespace** — pinned by PROP-OFF-01's single byte comparison rather than by four separate absence checks. | Contract |
| **PROP-OFF-05** | With the flag off, the `report` key set must be **set-equal** to FX-BASELINE's flag-off key set (so a spuriously-added key fails), and the emitted notice set must be **set-equal** to the baseline notices array — not merely free of `NTC-DECLEDGER-*`. | Observability |
| **PROP-OFF-06** | **The zero cases resolve to the disabled bytes.** All three of a zero-decision in-scope set, `maxEntries: 0`, and `maxBytes: 0` must produce a dispatch **byte-identical to PROP-OFF-01's stream** — the positive form that pins in one comparison that there is no index block, no header without rows, and **no rule text standing alone above a missing index**. A build emitting rule text without an index fails. | Contract |

**PROP-OFF-06 is the structural guarantee, not a separate enforcement.** `TSPEC` §2.4 makes
"no index ⇒ no rule text" true by construction — the rule text is inside the same string
`renderDecisionLedgerBlock` returns, and that function returns exactly `""` when `selected` is empty
(PROP-REND-01) — so an ordering mistake cannot violate it. PROP-OFF-06 is the falsifier that this
construction was actually adopted.

### TEXT — the rule text

Traces `REQ-DECLEDGER-03`, `REQ-DECLEDGER-06`; `FSPEC` BR-5, BR-6, AT-06, AT-07, AT-12; `TSPEC`
§4.3. Owner **T-06 → T-15**. Level: **pure unit** on `DECISION_LEDGER_RULE_TEXT`.

**What is asserted is a property of the emitted text, never of anyone's classification.** No human
is in any oracle here, and nothing mechanically evaluates evidence novelty — `BR-6` is explicit that
no component compares citations.

| Id | Property | Category |
|---|---|---|
| **PROP-TEXT-01** | `DECISION_LEDGER_RULE_TEXT` must state **both** conjuncts of the bar as a conjunction: **High severity** *and* citing evidence **not part of that decision's own record**. Text carrying one conjunct fails. | Functional |
| **PROP-TEXT-02** | It must carry **both** boundary exemplars, each **explicitly labelled with the side it falls on** — *in scope for re-opening*: a shipped behaviour that changed after the decision was recorded, cited at the changed source; *not in scope*: a source the decision already cites, re-cited at a different line or a later commit with no behavioural change. Text carrying one exemplar, or both unlabelled, fails. | Functional |
| **PROP-TEXT-03** | It must direct the reviewer to decide against the **cited record**, not the index line — which need not carry the decision's own citations (`REQ-DECLEDGER-03`, AT-07). | Functional |
| **PROP-TEXT-04** | It must direct the reviewer to treat the **decision id as the reopening key** across rounds, recording a repeat **as a repeat naming that id** rather than as a fresh finding (`REQ-DECLEDGER-06`). | Functional |
| **PROP-TEXT-05** | The rule text must be emitted **adjacent to the index**, inside the same block returned by `renderDecisionLedgerBlock`, and must appear in the order fixed by `TSPEC` §4.3: bar, exemplars, cited-record instruction, id-as-key direction. | Contract |
| **PROP-TEXT-06** ✖ | The rule text must **not** be emitted when `selected` is empty (PROP-REND-01), and must **not** appear in any prompt other than the review-loop reviewer prompt (PROP-WIRE-09). | Contract |

**Whitespace-normalise before matching.** Every substring assertion in PROP-TEXT-01…04 must
whitespace-normalise both the rule text and the sought sentinel before comparing. These are
multi-word sentinels inside a wrapped prose constant; a sentinel straddling a hard newline silently
matches zero and the property passes for the wrong reason.

### INV — driver invariance (`NG-4` made falsifiable)

Traces `REQ-DECLEDGER-08`, `REQ` NG-4, NG-5, R-2; `FSPEC` BR-11, BR-14, N-2, AT-16, AT-17; `TSPEC`
§5.5, §7.3. Owner **T-10 → T-18** (replay), **T-11 → T-18** (census). Level: **replay integration**
over **FX-REPLAY**, plus a **source census**.

| Id | Property | Category |
|---|---|---|
| **PROP-INV-01** | For **one fixed recorded set of reviewer outputs** replayed twice — flag `true` and flag `false` — all **five** named driver-side outcomes must be identical: the convergence decision; `DEC-LOOPECON-06`'s identity-triple dedupe and the resulting open-finding ledger; the `review.derivativeStop` flat/non-flat classification; the erratum items minted under `DEC-ERRROUTE-01`; and the fail-closed read of a non-approving confirmation carrying no parseable `FINDING:` line. The five are asserted **individually**, and the list is **not** claimed exhaustive — a sixth mechanism is covered by extending it, never by a set equality. | Integration |
| **PROP-INV-02** | **Anchored, not merely invariant.** At least one of the five — the **open-finding ledger**, which the recorded reviewer outputs already determine — must additionally be asserted equal to a value **transcribed from FX-REPLAY**, so the test fails if that anchor moves and not only if the two runs diverge. | Integration |
| **PROP-INV-03** | The dispatch-construction leg must differ in **exactly one asserted way**, stated positively on both sides: the `false` run's dispatch is byte-identical to FX-BASELINE's recording, and the `true` run's carries the rendered index. "Allowed to differ" is not asserted; the difference is. | Integration |
| **PROP-INV-04** | A **High** finding re-opening an indexed decision that a reviewer files anyway must be scored, deduped and routed **as any other High finding**: it must mint its erratum item and satisfy the confirmation-presence check. Any special-casing on account of the index fails. | Integration |
| **PROP-INV-05** ✖ | **No suppressed-finding state.** A finding the reviewer declines to file must be **absent** — not marked, not counted, not carried. No driver-side "discounted finding" state may exist for any gate to disagree about (`FSPEC` N-2). Asserted as a report-shape set equality, not as a scan for an absent key. | Contract |
| **PROP-INV-06** ✖ | **Source census.** Zero occurrences of any member of `DECISION_LEDGER_CENSUS_TOKENS` — `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES` — anywhere in `orchestrate-dev.js` **outside** the four regions this feature owns: the three function bodies sliced by brace-matching from their declarations, and the `main()` wiring run between `// === DECISION LEDGER WIRING START ===` and `... END ===`. | Contract |
| **PROP-INV-07** | `DECISION_LEDGER_CENSUS_TOKENS` must be **set-equal** to the module's exported decision-ledger symbol names, so a symbol added later cannot escape the census by not being listed. | Contract |
| **PROP-INV-08** | **Every census slice must be asserted non-empty** before the count is taken. An empty slice makes the census vacuous — the exact shape of the false green this whole family exists to prevent. | Contract |
| **PROP-INV-09** ✖ | The report field name `decisionLedger` must **not** be a census token. `TSPEC` §7.3 records why: the shipped `learningsInjectionField` analogue is threaded through `buildFinalReport` and named at every one of its call sites, all far outside `main()`'s wiring sentinels, so the census would red on conforming code. What the field is owed instead is behavioural — PROP-OFF-05 and PROP-WIRE-11. | Contract |
| **PROP-INV-10** ✖ | No constant this feature touches may alter `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS` or `MAX_ERRATUM_FOLLOWUP_ROUNDS` (`REQ` NG-5), asserted by pinning their HEAD values. | Contract |

**PROP-INV-06's two operands are both frozen and both set-equality-checked**, which is the whole
reason the census is implementable. `TSPEC` §7.3 records the earlier, unimplementable wording and
why it failed: the token set was ubiquitous (`id` is one of the commonest identifiers in the file)
and the scanned regions do not exist as source objects — `orchestrate-dev.js` carries exactly one
sentinel-bounded region at HEAD (`advisoryDisabled.test.js:718–719` searches for
`"// === LEARNINGS INJECTION REGION START ==="` by **exact string**, not by sentinel *shape*), so
this feature's own wiring sentinels are invisible to PROP-DIS-06's slice and vice versa
(**PROP-DIS-06** is `pdlc-advisory-tier`'s shipped property id, not a misspelling of PROP-DISC-06
below: it is the `/\.enabled\b/` count named in `advisoryDisabled.test.js:711` and in
`orchestrate-dev.js:9263`). What the
census deliberately does **not** attempt is proving the absence of a coupling routed through a
generically-named local; that residue is covered behaviourally by PROP-INV-01…04, and the two
together are the compensating control `TSPEC` §7.7 records against `REQ` R-3.

### DISC — disclosure

Traces `FSPEC` Q-3; `REQ` NG-6; `TSPEC` §5.3. Owners, per property rather than per family, because
this family spans four `PLAN` tasks with no single red→green pair: **T-12 → T-19** (engine
disclosure, PROP-DISC-01…04, -06), **T-12a → T-19** (documentation oracle, PROP-DISC-05 and
PROP-DISC-07's terminal count), **T-00a** alone (PROP-DISC-07's batch-1 exclusion —
green-at-both-ends, no red predecessor by `PLAN`'s construction), **T-20** (PROP-DISC-08),
**T-00** (PROP-DISC-09) and **T-03** (PROP-DISC-10). Level: **engine disclosure test**
(`node:test`), **document oracle**, and two repo guards.

| Id | Property | Category |
|---|---|---|
| **PROP-DISC-01** | `.claude/pdlc.config.example.json` must parse, and its top-level section set must **contain** `decisionLedger`. Containment, not equality — the file is shared with the eight blocks present at HEAD, verified as `dispatch`, `advisory`, `implementation`, `learningsInjection`, `cascade`, `review`, `loop`, `merge`. | Contract |
| **PROP-DISC-02** | `decisionLedger`'s own key→value map must be asserted by **set equality** against a **hand-transcribed** literal of `REQ` C-5's three keys and defaults — `{"enabled": false, "maxEntries": 70, "maxBytes": 12500}` — so a fourth key or a different spelling fails. | Contract |
| **PROP-DISC-03** ✖ | That literal must **not** be imported from `DECISION_LEDGER_DEFAULTS`. Importing it makes the example agree with the code **by construction** and the oracle can never fail — the reason `loop-config-example.test.js` transcribes `MERGE_DEFAULTS` rather than importing it. | Contract |
| **PROP-DISC-04** | The disclosure test must live in its **own** file, `pdlc/engine/__tests__/decision-ledger-config-example.test.js`, one file per block — the shape `learnings-config-example.test.js`, `loop-config-example.test.js` and `advisory-config-example.test.js` all take at HEAD — so an example edit cannot redden an unrelated engine concern. | Contract |
| **PROP-DISC-05** | `pdlc/OPERATIONS.md`, `pdlc/README.md` and `CLAUDE.md` must name the `decisionLedger` block, asserted by a **derived** document oracle whose expectations come from `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_NOTICES` and `DECISION_LEDGER_DEFAULTS` rather than being restated as literals. | Contract |
| **PROP-DISC-06** ✖ | No `SKILL.md` and no `pdlc/engine/` **runtime** file may change (`REQ` NG-6, `TSPEC` D-3): the only `pdlc/engine/` addition is the disclosure test of PROP-DISC-04. `SKILL.md` text cannot be config-gated, so a `SKILL.md` route would make `REQ` C-2's byte-identical disabled path unachievable. | Contract |
| **PROP-DISC-07** | `documentOracles.test.js`'s `*.test.js` census filter must exclude the `decisionLedger` namespace **and** still count `102` after this feature's twelve new modules exist. The literal is **saturated** at HEAD (`documentOracles.test.js:398–420` filters on the `learnings`, `waveResume`, `loop` and `escalationView` prefixes and asserts `expect(count).toBe(102)`), so batch 1 alone would redden a required check before any production code exists. **The two halves have different owners and different batches:** the exclusion edit is `PLAN` **T-00a**, a **batch-1** task — titled there "a batch-1 obligation, not a batch-9 one (TE F-01)" for exactly this reason, since batch 1 adds three `decisionLedger*` modules (T-00, T-02, T-03) and batch 2 adds nine more; the terminal conjunct — the filtered count is still `102` once all twelve exist — is `PLAN` **T-12a → T-19**, batch 9. Scheduling the exclusion in batch 9 produces precisely the failure this property diagnoses. | Contract |
| **PROP-DISC-08** | `node pdlc/workflows/build-runtime.mjs --check` must exit `0` and `pdlc/workflows/dist/` must be staged in the same commit as the workflow-source change; `pdlc/.claude-plugin/plugin.json` must bump from its HEAD value **`0.23.6`** to `0.23.7`, satisfying `pdlc/engine/package.json`'s `"pdlcPluginCompat": "^0.23.0"`. Owned by `PLAN` **T-20** (batch 10), the landing task that names `pdlc/workflows/dist/pdlc-cli.mjs` and `pdlc/.claude-plugin/plugin.json` in its file-ownership rows — not by T-19. | Contract |
| **PROP-DISC-09** | `decisionLedgerPreflight.test.js` must assert that **all nine** HEAD symbols this feature builds on are importable — the eight named in `PLAN` T-00 from `pdlc/workflows/orchestrate-dev.js` (`parseLearningsConfig`, `readLearningsConfigSafely`, `parsePinCheckConfig`, `parseDerivativeStopConfig`, `LEARNINGS_CORPUS_ARGV`, `gatherLearningsCorpus`, `renderLearningsBlock`, `reviewLoop`) plus `runCaptureScript` from `scripts/capture-learnings-baseline.mjs` — asserted as **set equality** against that hand-transcribed nine-name list, so a symbol quietly dropped upstream reddens batch 1 rather than batch 3. **Existence only**: it must assert nothing about the shapes this feature creates, so it passes at HEAD. Owner `PLAN` **T-00** (batch 1), no red predecessor. | Contract |
| **PROP-DISC-10** | `decisionLedgerFixtureGuard.test.js` must pin FX-CORPUS's integrity two ways: the fixture's path set must be **set-equal** to the hand-transcribed **25** `DECISIONS-*.md` paths `FX-CORPUS` names, and each file's content digest must equal its hand-transcribed per-file literal. A drifted, truncated or re-synced fixture must red **here**, not silently move ORC-01's transcribed expectations. Owner `PLAN` **T-03** (batch 1), no red predecessor — it passes against the artefact it captures. | Contract |

**PROP-DISC-07's positive control pins the complement.** Excluding a namespace and re-asserting
`102` proves the **rest** of the directory did not move; it does not count this feature's own
modules. The count of decision-ledger modules is pinned separately by `PLAN`'s file-ownership
manifest — twelve `decisionLedger*.test.js` modules, verified by enumeration of the PLAN's own task
table: `Preflight`, `FixtureGuard`, `BaselineGuard`, `Config`, `Recognise`, `Render`, `Bounds`,
`Injector`, `Corpus`, `Loop`, `Main`, `Census`.

## Oracles

The properties above say *what* must hold. This section fixes *how each is decided*, for the six
oracles where the decision procedure is itself load-bearing — where writing the oracle the obvious
way produces a check that cannot fail.

### ORC-01 — the corpus oracle: whole-line equality, expectations transcribed from data

**Decides:** PROP-REC-01…08, PROP-PRE-01…05, and `FSPEC` AT-01. **Owner:** T-09 → T-17. **Against:**
FX-CORPUS.

The comparison is **equality of the rendered line set** — not containment, and **not equality over
ids alone**. Ids alone are blind to the two cases the fixture was chosen for: `M-3c`'s twice-opened
block, where both openings carry one id and only the second states what was decided, and `M-4d`'s
mixed file, where eight non-record headings must contribute no line while four real records render.
The runs agree only where each line's **id, statement and citation** all agree.

Two dispatches are compared, differing only in the feature whose document is under review:

| Dispatch | Feature | Expected lines | What it pins |
|---|---|---|---|
| (a) | `pdlc-advisory-wave-gate` | 41 project-level + **4** = **45** | `M-4d`'s mixed file: 4 records render, 8 non-record headings contribute none (E-9) |
| (b) | `pdlc-engineering-loop` | 41 project-level + **7** = **48** | `M-3c`'s twice-opened block: `DEC-LOOP-01`…`06` each render one line whose statement is the **second**, deciding opening (E-10) |

No other feature's records are in scope for either dispatch. **A build rendering all 100
feature-level ids fails** — the union is over one feature directory, not all of them.

**Executed at HEAD to ground these figures, not taken on the specification's word.** Enumerating
`DECISION_CORPUS_ARGV`'s four pathspecs at Baseline v1.2's `Verified at` commit `8c673a09f` yields
**25** files; applying `DECISION_HEADING_RE` with §3.3's last-wins resolution over them yields **41**
project-level distinct ids and **100** feature-level, distributed `pdlc-headless-engine` 22,
`pdlc-advisory-tier` 11, `pdlc-engine-distribution` / `pdlc-learnings-injection` /
`pdlc-loop-economics` 10 each, `pdlc-consolidation-agent` / `pdlc-wave-resume` 8 each,
`pdlc-engineering-loop` 7, `orchestrate-dev-workflow` 6, `pdlc-advisory-wave-gate` /
`pdlc-rcv-budget-stop` 4 each, `pdlc-plugin-retirement` **0**. That reproduces `TSPEC` §3.5's table
and `M-1d` / `M-2e` exactly, so the expected sets above are transcribable rather than aspirational.

**Anti-echo, stated as a rule for the implementer.** Expected statements and citations are
transcribed from the **fixture's own heading text and record location** — data — and **never**
captured from the renderer's output. Capturing them derives the expectation from the code under
test, and the oracle then cannot fail for a wrong statement. `M-3c`'s verbatim second-opening
heading is the pinned discriminating case; `M-4d`'s eight non-record headings and `M-4b`'s twelve
namespace-less ids are the pinned exclusion cases. **If ORC-01 reddens, the correct response is
never to trim the expected set to whatever the renderer emitted.**

**ORC-01 runs with both bounds non-binding, deliberately.** Its subject is the **recognition rule**,
not the bounds. The 45- and 48-line sets render to 7,042 and 7,650 index bytes, which sit inside
`REQ` C-5's resolved `maxBytes` default with framing charged — so they are producible under default
configuration today. But that margin is **measured, not structural**: `M-6b`'s 63-record case clears
the same bound by only **441** bytes, so corpus growth or an operator lowering either threshold
would make an expected set unproducible and redden a recognition oracle **for a bounds reason**.
Supplying explicitly non-binding bounds, and saying so in the test file's header, is what keeps the
failure signal attributable. The bounds are the subject of ORC-05 and PROP-BND-01…12.

### ORC-02 — the citation resolution chain, which starts at the rendered line

**Decides:** PROP-REND-03, PROP-FAIL-05, and `FSPEC` AT-02. **Owner:** T-09 → T-17.

The chain, stated in order so it is not written the other way round:

1. Parse `sourcePath` and `id` **out of the rendered line's citation field** — the substring between
   `[` and `]`, split on ` § `.
2. Open that path in FX-CORPUS **through the `_readFile` double**, never by a real filesystem path.
3. Find the heading matching `DECISION_HEADING_RE` whose captured id equals the parsed id — exactly
   one, by `M-1a` and last-wins resolution.
4. Assert that heading's captured **statement** equals the rendered line's statement field, and that
   it says what was **decided** rather than what was **asked**.

**No field of `DecisionRecord` is read anywhere in this chain.** Reading `record.heading` instead
would compare the recogniser's output against the file the recogniser read, leaving the rendered
line outside the loop entirely — a renderer emitting a wrong statement, or citing the wrong
`sourcePath`, would pass. `DecisionRecord.heading` remains on the type solely as the verbatim value
ORC-01's expected results are transcribed from; ORC-02 does not consume it.

### ORC-03 — the shipped-default assertions, in two parts that do not substitute for each other

**Decides:** PROP-BND-04's live consequence and `TSPEC` §3.6's headroom claim. **Owner:**
T-09 → T-17. **Against:** FX-CORPUS. ORC-01 runs with the bounds non-binding and PROP-BND-01…12
quantify over generated bounds, so without ORC-03 **nothing anywhere exercises `REQ` C-5's shipped
defaults over a realistic corpus**.

**Part A — the whole-fixture build, which makes the drop order falsifiable.** Build the block over
**all 141** records in FX-CORPUS at the shipped defaults (`maxEntries: 70`, `maxBytes: 12500`) and
assert three conjuncts:

| # | Conjunct | Falsifies |
|---|---|---|
| A1 | The rendered ids whose `origin` is `"project"` are **set-equal** to the fixture's 41 project-level ids, transcribed as a literal, and those lines joined by `\n` are the transcribed literal **6,305** bytes | a line-format regression, or corpus drift |
| A2 | `6,305 ≤ maxBytes − 1200` — at the resolved default, `6,305 ≤ 11,300` (PROP-REND-08's framing pin is the other half of this sum) | a default lowered below the standing corpus |
| A3 | `omitted[]` is **non-empty** and **every** id in it has `origin === "feature"` | a **reversed drop order** |

**A3 is an absence asserted over a set that is non-empty by construction, which is why the basis is
the whole fixture and not the project-level slice.** On the 41-record slice, 41 lines against
`maxEntries` 70 and 6,305 bytes against an 11,300-byte allowance leave nothing to drop, so
`omitted[]` is empty under **every** drop order and A3 is vacuously true. The 141-record fixture is
deliberately larger than any dispatch this feature will ever construct precisely so that a bound
binds and the drop loop actually runs.

**Part B — the `M-6b`-slice build, which makes the inertness measurement falsifiable.** Part A
watches ~4,995 bytes of project-level headroom; the claim `TSPEC` §3.6's live conclusion actually
rests on — *no line is omitted on a real dispatch at the Baseline commit* — clears the bound by
**441** bytes, which no assertion over the 141-record fixture can reach. So build the block over the
**63-record `M-6b` slice** (the 41 project-level records plus `pdlc-headless-engine`'s 22, the
largest in-scope set `REQ` G-1 can produce at that commit) at the same shipped defaults:

| # | Conjunct | Falsifies |
|---|---|---|
| B1 | `omitted[]` is **empty**, and the rendered id set is set-equal to the slice's 63 ids, transcribed as a literal | either of B2/B3 going wrong |
| B2 | The 63 rendered index lines joined by `\n` are the transcribed literal **10,859** bytes | corpus growth or a line-format regression consuming the 441-byte margin |
| B3 | `10,859 ≤ maxBytes − 1200` — at the resolved default, `10,859 ≤ 11,300`, a difference of **441** bytes | an operator-facing default moved below the standing case |

**Why the block total 12,059 is deliberately not asserted as an equality.** `TSPEC` §4.3 fixes
framing as a **≤ 1,200-byte budget the rule text must be drafted to fit**, not a measurement of
drafted text, and the constants do not exist yet. A conforming implementation drafted under budget
produces a block **smaller** than 12,059, so an equality on that figure would redden for no defect.
The two halves of `12,059 ≤ 12,500` are therefore each pinned where they are measurable — framing by
PROP-REND-08, the index by B2/B3.

**All four transcribed literals — the 41 ids and 6,305, the 63 ids and 10,859 — are hand-transcribed
from the fixture, never derived at test time from the renderer or from a manifest.** Deriving either
makes the assertion an echo; re-deriving 6,305 defeats the purpose of pinning it, which is to make
corpus drift **visible at the re-capture** — the deliberate moment to re-decide `REQ` C-5's default
rather than let it expire silently. PROP-REND-08's framing size is **not** a fifth literal on that
list: it is pinned separately, so a rule-text edit inside the budget re-opens neither B2 nor B3.

**What ORC-03 deliberately does not pin.** How **many** feature-level lines survive Part A. Under
the shipped bounds roughly two dozen do — `maxEntries` 70 less 41 project-level lines caps it at 29,
and the byte headroom against a 152–261-byte feature line trims a few more — and that count is
renderer arithmetic that would churn on any line-format change without naming a defect. The
falsifier lives in the **origin partition** (A3), not in the count.

### ORC-04 — the byte-identity baseline guard, and the two jobs it must do

**Decides:** PROP-OFF-01…06. **Owner:** T-02. **Against:** FX-BASELINE.

The guard does **two** jobs, not one: it **guards the artifact** (per-file digests unchanged) *and*
**uses it** (drives branch HEAD's `orchestrate-dev.js` through the same scenario matrix and
byte-compares). Job one alone re-hashes a fixture against a digest of itself and proves nothing
about the code — the lesson already written into the shipped `learningsBaselineGuard.test.js` and
repeated in `loopEconomicsBaselineGuard.test.js`.

**The three pinning clauses**, none of which is optional:

| Clause | Form | Why the obvious alternative fails |
|---|---|---|
| (a) | Per-file digest literals **hand-transcribed into the test** | A re-capture rewrites `MANIFEST.json`; a test reading its expected digest **from** that manifest checks nothing |
| (b) | `manifest.mergeBaseSha` asserted equal to a hand-transcribed `EXPECTED_MERGE_BASE_SHA` **literal in the test file** | Same reason. `git merge-base --is-ancestor {recorded sha} HEAD` is kept only as a documented **weaker second signal** — it cannot distinguish "pre-feature" from "mid-feature", since a later `main` commit is an ancestor of HEAD too. A form computing `git merge-base origin/main HEAD` **at test time** is specifically excluded: it makes a required check depend on a current local `origin/main` and can red on an unrelated push to `main`. Ancestry is resolved against **`HEAD`**, never `origin/main`, so the check needs no fetch and is hermetic in CI |
| (c) | The case-id check written as **set equality**, never containment | Containment passes a **silently added** case; equality fails both a deleted and an added one, and the two halves are not interchangeable |

**Mutation proof before commit**, three steps, each restored immediately and each observed red
transcribed into the test file's header: flip one byte in a recorded stream (expect the per-file
digest assertion **and** the oracle comparison red, the manifest assertion green); delete a case
directory (expect the set-equality assertion red, `actual ⊉ expected`); add a spurious case
directory (expect the same assertion red for the opposite reason).

### ORC-05 — the bounds property's model, and why it must not reuse the renderer

**Decides:** PROP-BND-01…07. **Owner:** T-07 → T-16.

The model carries its **own** formatter, transcribed by hand from `TSPEC` §4.3's stated format, and
applies it **per record** — it is not a re-implementation of the drop loop, so a bug in the loop
cannot be mirrored into the oracle. Each of PROP-BND-01…04 owns the falsifying mutation named in its
row; each is applied, observed red, reverted, and the observed failure transcribed into the test
file's header.

**Why the generator's range alone does not discharge the two bounds conjuncts.** Drawing bounds
spanning `0`, exactly-fitting and generous is necessary but not sufficient: a drop loop that stops
**one line late** still lands inside that range for most draws. The mutation map is what ties each
conjunct to a defect it alone detects, and it is stated rather than assumed.

### ORC-06 — the replay oracle, anchored so identical brokenness fails

**Decides:** PROP-INV-01…05. **Owner:** T-10 → T-18. **Against:** FX-REPLAY.

**Invariance alone is not an oracle.** Two runs of a driver broken **identically** agree perfectly,
so a pure "the two runs match" assertion passes a total regression. ORC-06 therefore carries a
second leg: the **open-finding ledger** — which FX-REPLAY's recorded reviewer outputs already
determine — is asserted equal to a value **transcribed from the fixture**, and the test fails if
that anchor moves, not only if the runs diverge.

The five driver-side outcomes are asserted **individually**, and the list is explicitly **not**
claimed exhaustive of driver-side accounting. A sixth mechanism is covered by **extending the list**,
never by converting it to a set equality — a set equality over an open-ended list of mechanisms is
a claim this document cannot support and would break on unrelated driver work.

## Fixtures

Five fixtures. Two are copies of real data (FX-CORPUS, FX-BASELINE); three are **constructed**,
because the behaviour they cover has **no instance at HEAD** and therefore cannot be covered by
transcribing anything that exists. That is precisely what `REQ` O-5 and O-6 record, and building
them is this document's principal deliverable.

**One rule governs all five:** no test may read the live `docs/` tree, and no test may write to the
working tree or to a fixture file. Every fixture is addressed through the `_git` and `_readFile`
doubles (`PLAN` T-01, `helpers/decisionLedgerDoubles.js`), never by a real filesystem path.

### FX-CORPUS — the frozen corpus copy

**Owner:** T-03 (build + guard), consumed by T-09 → T-17.
**Path:** `pdlc/workflows/__tests__/fixtures/decision-corpus/`.
**Discharges:** O-6's frozen-copy leg. **Feeds:** ORC-01, ORC-02, ORC-03, PROP-REC-*, PROP-PRE-*.

A **path-preserving** copy of the **25** in-scope `DECISIONS-*.md` files at Baseline v1.2's
`Verified at` commit **`8c673a09f`**, holding **141** records (41 project-level, 100 feature-level).

**Why frozen and not live, with this branch as the witness.** `docs/pdlc-decision-ledger/` is
growing while the feature is built, and this feature's own DECISIONS document has already been added
to it: the same four pathspecs that yield **25** files at `8c673a09f` yield **26** at HEAD today,
the addition being `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md`. A test reading the
live tree reddens the moment any feature records a decision. It is the same class of failure as the
`coveredViolations` whole-tree walk `CLAUDE.md` records — a live filesystem read turns an unrelated
file into a test failure.

**Integrity guard** (T-03), two conjuncts:

1. A **per-file digest literal hand-transcribed into the test**, never recomputed and never read
   from a manifest — a re-capture rewrites a manifest in lockstep with the thing it would be
   checking.
2. The fixture's path set asserted by **set equality** against a hand-transcribed **25**-path
   literal, so both a missing and a spuriously-added file fail.

**The path literal must carry all four of `DECISION_CORPUS_ARGV`'s pathspecs.** A three-alternative
transcription that omits `docs/discarded/*/DECISIONS-*.md` yields **24**, not 25 — the missing file
being `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md`, which contributes 4
`DEC-BUD-*` records. This is verified by enumeration, not assumed.

**Pinned cases inside FX-CORPUS**, each named so a later reader knows what the copy is *for*:

| Case | Instance | Property it discriminates |
|---|---|---|
| Twice-opened id | `M-3a`/`M-3c` — `DECISIONS-pdlc-engineering-loop.md`, 13 records over 7 distinct ids, `DEC-LOOP-01`…`06` each opening twice | PROP-REC-08 (last-wins; the verbatim second-opening heading is the pinned literal) |
| Mixed file | `M-4d` — `DECISIONS-pdlc-advisory-wave-gate.md`, 4 records alongside 8 non-record headings | PROP-REC-05, PROP-REC-06 (E-9) |
| Namespace-less ids | `M-4b` — `DECISIONS-pdlc-plugin-retirement.md`, twelve `DEC-01`…`DEC-10` headings, contributing **0** | PROP-REC-04, PROP-FAIL-11 |
| Ordinal-prefixed records | `DECISIONS-pdlc-engine-distribution.md` (`## 2. DEC-EDIST-01: …`), `DECISIONS-pdlc-consolidation-agent.md` (`## 3. DEC-CONS-01: …`) | PROP-REC-03 — without it the feature-level total is 82, not 100 |
| Two-file feature directory | `pdlc-headless-engine` — `DECISIONS-pdlc-headless-engine.md` (14) + `DECISIONS-headless-engine-obligations.md` (8) = 22 | the directory-glob reading, and ORC-03 Part B's `M-6b` slice |
| Empty-result files | `M-4a` (bullets with no id), `M-4b` (namespace-less headings) | PROP-FAIL-08, PROP-REC-10 — two standing files take the ordinary-empty path |

### FX-PRECEDENCE — the synthetic two-file corpus (O-5)

**Owner:** T-09 → T-17. **Constructed — no HEAD instance.**
**Discharges:** `REQ` O-5 / `FSPEC` O-5 in full. **Feeds:** PROP-PRE-01…05, `FSPEC` AT-18.

`M-5a` records **zero** ids held as records in two files anywhere at HEAD, and `M-5b` draws the
consequence: cross-file precedence is exercisable **only** over a constructed corpus. `M-5c` names
the intent — a decision promoted to project level renders in its promoted form.

**Shape.** Two files, both in scope for one dispatch:

| File | Role | Content |
|---|---|---|
| `docs/_decisions/DECISIONS-fx-precedence.md` | project-level | `## DEC-FXP-01: {project statement}` — the record that must win |
| `docs/fx-precedence-feature/DECISIONS-fx-precedence-feature.md` | feature-level | `### DEC-FXP-01: {feature statement}` — the record that must lose, **plus at least two non-colliding records** |

**Three construction constraints, each earning its place:**

1. **The two statements must be textually distinct and neither a substring of the other**, so
   PROP-PRE-03's absence check discriminates. Two statements sharing a prefix would let a
   substring assertion pass on the wrong record.
2. **The feature file must carry non-colliding records too**, so PROP-PRE-04's "every other line is
   unchanged" is asserted over a **non-empty** remainder rather than vacuously over one line.
3. **The fixture must be renderable under both file enumeration orders**, so PROP-PRE-05 can assert
   byte-identity across a reversed enumeration — the conjunct proving precedence keys on `origin`
   and not on path order. `M-5c` warns that a path-ordering tie-break is not well-defined without
   naming a collation, and `_` (`0x5F`) inverts under case-folded collation.

**Expected values are transcribed from the fixture's own text**, hand-written into the test, never
captured from the renderer — the same anti-echo rule ORC-01 carries.

### FX-FAILOPEN — the constructed degradation corpora (O-6)

**Owner:** T-08 → T-17. **Constructed — no HEAD instance for E-2, E-3 or E-4.**
**Discharges:** `REQ` O-6's fail-open leg. **Feeds:** PROP-FAIL-01…11.

`M-4e` records that an empty file and a failure to read are **separable only by construction**, so
each leg below is a scripted seam configuration rather than a data file:

| Corpus | Scripted seams | Expected leg | Property |
|---|---|---|---|
| `FX-FO-UNLISTABLE-A` | `_git` returns `{ok: false}` | total; `corpusOutcome: "RSN-UNLISTABLE"` | PROP-FAIL-02, -09 |
| `FX-FO-UNLISTABLE-B` | `_git` **throws** | total; same outcome | PROP-FAIL-02, -09 |
| `FX-FO-ZEROPATHS` | `_git` returns `{ok: true}`, zero paths | total; `corpusOutcome: "RSN-EMPTY"` | PROP-FAIL-09 |
| `FX-FO-ALLFAIL` | every path's `_readFile` fails | total | PROP-FAIL-01, -02 |
| `FX-FO-NORECOGNISE` | every path reads fine, **no** line qualifies | total, reached by a **different cause** | PROP-FAIL-01 |
| `FX-FO-ONE-NULL` | one path's `_readFile` returns **`null`**, others survive | partial; that path in `failedSources` | PROP-FAIL-04, -10 |
| `FX-FO-ONE-THROWS` | one path's `_readFile` **throws**, others survive | partial; identical outcome to the `null` arm | PROP-FAIL-04, -10 |
| `FX-FO-WHOLE-SOURCE` | one whole source unavailable, others survive | partial — **one** outcome with the two above, not three | PROP-FAIL-04 |
| `FX-FO-EMPTY-PLUS` | one source reads to **zero records**, others survive | ordinary render of the survivors | PROP-FAIL-06, -08 |
| `FX-FO-EMPTY-ONLY` | the **only** source reads to zero records | bytes are E-6's; `failedSources: []`, `emptySources: [that path]` | PROP-FAIL-06 |
| `FX-FO-NO-FEATURE-DIR` | feature has no directory among the three globs | project-level set alone | PROP-FAIL-11 |
| `FX-FO-ZERO-FEATURE` | feature directory yields zero records (`pdlc-plugin-retirement`) | project-level set alone | PROP-FAIL-11 |

**The two corpora that matter most are `FX-FO-EMPTY-ONLY` and `FX-FO-ALLFAIL`.** Their **dispatch
bytes are identical**, so no prompt-level assertion can tell them apart; PROP-FAIL-06's
`failedSources`/`emptySources` split is the only oracle that can, and it is the whole reason
`TSPEC` §6.3 exposes those fields. Reverse the classification in the implementation and the bytes do
not move while PROP-FAIL-06 fails — which is exactly the falsifiability O-7 asked for.

**Both read-failure shapes must be scripted, not one.** The runtime read **throws** where the test
double returns **`null`**; a suite exercising only one arm proves nothing about the other, and the
two produce the same `readOk: false` envelope.

### FX-REPLAY — the recorded round of reviewer outputs (O-6)

**Owner:** T-10 → T-18. **Constructed.** **Discharges:** `REQ` O-6's replay leg. **Feeds:**
PROP-INV-01…05, `FSPEC` AT-16, AT-17.

**One fixed recording** of a round's reviewer outputs — verdict lines, counts and `FINDING:` lines —
replayed under **both** flag settings. It must be a **recorded envelope**, not a hand-built synthetic
shape: a contract-boundary fixture built by hand encodes the author's belief about the format rather
than the format.

**Required content, each item earning its place:**

| Item | Why |
|---|---|
| ≥ 2 findings sharing a `DEC-LOOPECON-06` identity triple (severity, section anchor, normalised text) | anchors PROP-INV-01's dedupe leg and PROP-INV-02's open-finding ledger to a value that is **not** the input count |
| ≥ 1 **High** finding that re-opens an id present in the rendered index | PROP-INV-04 — it must mint its erratum item and satisfy the confirmation-presence check |
| ≥ 1 round pair that is **flat** and ≥ 1 that is **not** | PROP-INV-01's `review.derivativeStop` classification leg needs both to be non-vacuous |
| ≥ 1 non-approving confirmation carrying **no** parseable `FINDING:` line | PROP-INV-01's fail-closed read leg |
| A transcribed expected **open-finding ledger** | PROP-INV-02's anchor — without it, identical brokenness in both arms passes |

### FX-BASELINE — the committed merge-base recording (O-4, O-6)

**Owner:** T-02. **Path:** `pdlc/workflows/__tests__/fixtures/decision-ledger-baseline/`
(`scenarios.mjs`, `MANIFEST.json`, `REVIEW-LOOP-REVIEWER-PROMPTS/**`).
**Feeds:** PROP-OFF-01…06, PROP-WIRE-09, PROP-INV-03, ORC-04.

**Captured by** `scripts/capture-learnings-baseline.mjs`'s `runCaptureScript`, reused unchanged —
verified present at that path at HEAD. It materialises the merge-base worktree with
`git worktree add`, imports **that tree's** `orchestrate-dev.js`, drives a scenario matrix, writes
`{caseId}/{n}.txt` plus `MANIFEST.json`, and removes the worktree in a `finally`.

**Baseline identity:** `git merge-base origin/main HEAD` on `feat-pdlc-decision-ledger`, recorded as
`mergeBaseSha` and pinned per ORC-04 clause (b).

**Two cases, with different entry points, because one cannot carry both acceptance tests:**

| Case | Entry point | What it falsifies |
|---|---|---|
| `REVIEW-LOOP-REVIEWER-PROMPTS` | exported `reviewLoop` directly; a first-pass round and a delta re-review round | PROP-OFF-01: byte-identity of the reviewer-prompt stream with the seam absent |
| `CONFIG-GATE-SPELLINGS` | through the **config gate** — four `learningsConfigText` values run through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector` | PROP-OFF-02/03: each of four **distinct** config inputs resolves `enabled` to `false` and yields a `null` injector |

**Why the split is mandatory and not a preference.** `reviewLoop`'s parameter list takes seams and
settings, never config text — the enablement gate lives in `main()`. A case driving `reviewLoop`
directly reaches all four of `AT-05`'s not-enabled spellings as the **same** input,
`_injectDecisionLedger: null`, so every arm passes by construction of the harness and the oracle
asserts that four identical inputs produce identical bytes. **Stated as a rule for the implementer:
the recorded arm must consume the config text it is varying.**

**Recorded stream deliberately narrow.** A whole-`main()` recording would red on this feature's own
intended additions — the new notices, the new report field — and would have to be re-transcribed
mid-feature, proving nothing. That narrowness is why PROP-WIRE-04/05 exist as a **separate** live
composition-root arm (`PLAN` T-10a) rather than being folded in here; the two are different
obligations.

**Capture validity window.** The capture must be taken **before any production change lands**, at a
point where `pdlc/workflows/orchestrate-dev.js` is byte-identical between merge base and branch
HEAD. `PLAN` makes this a real `Deps` edge on every production task (`TSPEC` T-1), not a prose note
— which is correct in `PLAN` v0.3: T-02 sits in batch 1 and every green task from T-13 onward
reaches it transitively through T-10's `Deps`.

## Coverage Matrix

Three mappings, each in the direction someone will actually read it: family → where the code goes;
`FSPEC` acceptance test → which property discharges it; upstream obligation → discharge.

### Family → PLAN task → test module

Every module named below is one of the **12** `decisionLedger*.test.js` modules `PLAN` v0.3 names,
verified by enumeration against `PLAN`'s own blast-radius prose; no property here invents a file.
Every task id is one of `PLAN`'s **24**.

| Family | Count | Level | Red task | Green task | Test module |
|---|---|---|---|---|---|
| CFG | 10 | unit (pure) | T-04 | T-13 | `decisionLedgerConfig.test.js` |
| REC | 11 | unit (pure) | T-05 | T-14 | `decisionLedgerRecognise.test.js` |
| REND | 9 | unit (pure) | T-06 | T-15 | `decisionLedgerRender.test.js` |
| TEXT | 6 | unit (pure) | T-06 | T-15 | `decisionLedgerRender.test.js` |
| BND | 12 | unit + `fast-check` property | T-07 | T-16 | `decisionLedgerBounds.test.js` |
| FAIL | 11 | integration (seam-doubled) | T-08 | T-17 | `decisionLedgerInjector.test.js` |
| PRE | 5 | integration (fixture corpus) | T-09 | T-17 | `decisionLedgerCorpus.test.js` |
| INV | 10 | integration (recorded replay) + source census | T-10 (replay), T-11 (census) | T-18 | `decisionLedgerLoop.test.js` (PROP-INV-01…05), `decisionLedgerCensus.test.js` (PROP-INV-06…10) |
| WIRE | 11 | integration (`main()` live) | T-10a | T-18 | `decisionLedgerMain.test.js` |
| OFF | 6 | recorded byte-identity | — (T-02 has **no** red predecessor: it captures the recording and guards it, `PLAN` §Red-before-green edges) | T-02 (batch 1, capture + guard); the byte comparisons consuming it are T-10 → T-18 and T-10a → T-18 | `decisionLedgerBaselineGuard.test.js` (ORC-04), `decisionLedgerLoop.test.js` (PROP-OFF-02…06), `decisionLedgerMain.test.js` (PROP-OFF-01) |
| DISC | 10 | repo/document oracle + two batch-1 repo guards | T-12, T-12a; **no red predecessor** for T-00, T-00a, T-03, T-20 | T-19 (T-12, T-12a); **T-00a** batch 1 (PROP-DISC-07's exclusion half); **T-20** batch 10 (PROP-DISC-08); **T-00** batch 1 (PROP-DISC-09); **T-03** batch 1 (PROP-DISC-10) | `pdlc/engine/__tests__/decision-ledger-config-example.test.js`, `documentOracles.test.js`, `decisionLedgerPreflight.test.js`, `decisionLedgerFixtureGuard.test.js` |

**Every module is claimed, and the claim is checkable in one place** — the manifest below, not
assembled from prose. The count reconciles as a **partition**: 101 properties over 11 families,
`10 + 11 + 9 + 6 + 12 + 11 + 5 + 10 + 11 + 6 + 10 = 101`, with no property counted twice and none
outside a family.

**Pyramid shape, restated as that same partition** (the `## Overview` sketch is the shape; this is
the arithmetic): **36** pure-unit properties needing no seam (CFG 10 + REC 11 + REND 9 + TEXT 6) +
**12** under the `fast-check` generator and its held examples (BND) + **37** integration properties
across **three** seam boundaries — `_git`/`_readFile`, the recorded reviewer envelope, the live
`main()` composition root — (FAIL 11 + PRE 5 + INV 10 + WIRE 11) + **6** recorded byte-identity
(OFF) + **10** repo/document oracle (DISC) = **101**. **Zero** end-to-end; nothing here drives a
real model or a real network. The earlier "47 / 11 / 37" reading double-counted BND across the
pure-unit and generator buckets and left OFF and DISC outside the level breakdown altogether.

### Module manifest — every test module, its owning `PLAN` task, and the properties that claim it

`PLAN` v0.3's file-ownership manifest names **12** `decisionLedger*.test.js` modules plus two shared
files this feature edits. Every one appears below with at least one `PROP-*`; the mapping is
set-equal to `PLAN`'s manifest in both directions, which is what makes "none orphaned" a checkable
claim rather than an assertion.

| Test module | Owning `PLAN` task (batch) | Properties claiming it |
|---|---|---|
| `decisionLedgerPreflight.test.js` | T-00 (1) | PROP-DISC-09 |
| `decisionLedgerBaselineGuard.test.js` | T-02 (1) | ORC-04; PROP-OFF-01's referent |
| `decisionLedgerFixtureGuard.test.js` | T-03 (1) | PROP-DISC-10 |
| `decisionLedgerConfig.test.js` | T-04 (2) → T-13 (3) | PROP-CFG-01…10 |
| `decisionLedgerRecognise.test.js` | T-05 (2) → T-14 (4) | PROP-REC-01…11 |
| `decisionLedgerRender.test.js` | T-06 (2) → T-15 (5) | PROP-REND-01…09, PROP-TEXT-01…06 |
| `decisionLedgerBounds.test.js` | T-07 (2) → T-16 (6) | PROP-BND-01…12 |
| `decisionLedgerInjector.test.js` | T-08 (2) → T-17 (7) | PROP-FAIL-01…11 |
| `decisionLedgerCorpus.test.js` | T-09 (2) → T-17 (7) | PROP-PRE-01…05; ORC-01, ORC-02, ORC-03 |
| `decisionLedgerLoop.test.js` | T-10 (2) → T-18 (8) | PROP-INV-01…05, PROP-OFF-02…06; ORC-06 |
| `decisionLedgerMain.test.js` | T-10a (2) → T-18 (8) | PROP-WIRE-01…11, PROP-OFF-01 |
| `decisionLedgerCensus.test.js` | T-11 (2) → T-18 (8) | PROP-INV-06…10 |
| `documentOracles.test.js` (existing, shared) | T-00a (1, census exclusion) and T-12a (2) → T-19 (9) | PROP-DISC-05, PROP-DISC-07 |
| `pdlc/engine/__tests__/decision-ledger-config-example.test.js` | T-12 (1) → T-19 (9) | PROP-DISC-01…04, PROP-DISC-06 |

**T-20 owns no test module by design** (batch 10): it re-runs the two suites, regenerates
`pdlc/workflows/dist/` and bumps `pdlc/.claude-plugin/plugin.json`, and is claimed by PROP-DISC-08.
With T-00a and T-20 above, **all 24** of `PLAN`'s task ids are traced here in both directions —
every id named in this document is one of `PLAN`'s 24, and every one of `PLAN`'s 24 is named.

### FSPEC acceptance test → discharging properties

| AT | Subject | Discharged by | Fixture |
|---|---|---|---|
| AT-01 | index renders the Baseline enumeration, whole lines | ORC-01 (which decides **PROP-REC-01…08** and PROP-REND-01…09 against the frozen corpus); PROP-REC-09…11 discharge the same AC at the cheaper levels ORC-01 cannot reach — the `fast-check` generator (-09) and pure-unit null/CRLF cases (-10, -11) — and are **not** decided by the corpus oracle | FX-CORPUS |
| AT-02 | every citation resolves at its own source | ORC-02; PROP-REND-03, PROP-FAIL-05 (ORC-02's own `Decides` line) | FX-CORPUS |
| AT-03 | derived fresh, not carried forward | PROP-WIRE-06, -07, -08 | live `main()` |
| AT-18 | id in two files renders exactly one line | PROP-PRE-01…05 | **FX-PRECEDENCE** |
| AT-04 | disabled dispatch byte-identical to baseline | PROP-OFF-01, -04, -06 | FX-BASELINE |
| AT-05 | four not-enabled spellings collapse to one outcome | PROP-OFF-02, -03; PROP-CFG-01…04 | FX-BASELINE (`CONFIG-GATE-SPELLINGS`) |
| AT-06 | rule text carries both conjuncts and both exemplars | PROP-TEXT-01…04 | none (frozen constant) |
| AT-07 | exemplars are decidable as text | PROP-TEXT-05, -06 | none |
| AT-12 | reopening key and driver identity key both intact | PROP-INV-01, -02 | FX-REPLAY |
| AT-08 | nothing surviving → total leg | PROP-FAIL-01, -02, -09 | FX-FAILOPEN |
| AT-09 | surviving proper subset → partial leg | PROP-FAIL-03, -04, -10 | FX-FAILOPEN |
| AT-10 | empty file contributes nothing, costs nothing | PROP-FAIL-06, -07, -08 | FX-FAILOPEN |
| AT-11 | per-key fallback over the full enumeration | PROP-CFG-05…10 | none (pure) |
| AT-13 | both bounds hold on index text alone | PROP-BND-01…04 (O-8 property), PROP-BND-07 (the model discipline that makes -03 falsifiable), PROP-BND-12 ("index block alone" is what `maxBytes` bounds) | generated |
| AT-14 | empty and zero cases collapse to the baseline bytes | PROP-BND-08, -09; **PROP-OFF-06** (the property that states the criterion: all three zero cases produce the disabled bytes); PROP-FAIL-06 is on this row **deliberately** — a corpus that reads to zero records shares E-6's byte outcome with the zero-bound cases, and PROP-FAIL-06 is the only conjunct that distinguishes it from a *failed* read behind identical bytes | generated + FX-BASELINE |
| AT-15 | a single oversized line is omitted whole | **PROP-BND-10** (states the criterion: absent in full, no fragment, remaining lines render); PROP-BND-05, -06, -11 (the one-loop disjunction, determinism and no-abort guarantees the drop relies on) | generated |
| AT-16 | replay agrees on every driver-side outcome | PROP-INV-01, -02, -03 | FX-REPLAY |
| AT-17 | a filed reopening scores as any other High finding | **PROP-INV-04** (states the criterion verbatim); PROP-INV-05…10 (the no-suppressed-state and census guarantees that make it unevadable) | FX-REPLAY |

**Every one of AT-01…AT-18 is claimed**, and each row's fixture column is satisfied by `## Fixtures`.
The three ATs whose fixture is `none` are the ones asserting properties of a **frozen string
constant**, where a fixture would only restate the constant.

### Upstream obligation → discharge

| Obligation | Owner | Discharged here by |
|---|---|---|
| **O-5** — cross-file precedence has no HEAD instance; owed a constructed corpus | te-author | **FX-PRECEDENCE** + PROP-PRE-01…05 |
| **O-6** — E-2/E-3/E-4, the frozen corpus copy and AT-16's replay are all owed constructed fixtures | te-author | **FX-FAILOPEN**, **FX-CORPUS**, **FX-REPLAY** + PROP-FAIL-*, PROP-INV-* |
| **O-8** — bounds invariant is universally quantified | te-author | PROP-BND-01…04 under `fast-check`, with PROP-BND-07 forbidding renderer reuse |
| **O-7** — empty-vs-failed needs a driver-internal observable | se-author (`TSPEC` §6.3) | **consumed**, not owed: PROP-FAIL-06 is the oracle that makes §6.3's fields load-bearing |
| **O-4** — baseline identity and re-capture pinning | se-author (`TSPEC`) | **consumed**: ORC-04 pins `mergeBaseSha`; PROP-OFF-06 |
| **DC-07** — composition-root wiring | `DECISIONS` | PROP-WIRE-01…11 via T-10a's live `main()` arm |
| **BR-11 / NG-4** — no second source of decision text | `FSPEC`/`REQ` | **PROP-INV-06** — the source census, cloning `loopEconomicsAnchorGuard.test.js` — with PROP-INV-07 (token-set equality) and PROP-INV-08 (every slice non-empty) as its non-vacuity guards, and PROP-INV-01…04's behavioural residue as the compensating control (`TSPEC` §7.7). PROP-DISC-07 is a repo-hygiene count and discharges nothing here |

The three obligations `FSPEC` §7 assigns to **te-author** — O-5, O-6, O-8 — are each discharged by a
named fixture and a named property family above. That is this document's completion condition.

## Gaps, Risks and Routed Items

### Routed upstream (erratum channel)

**One item**, raised against `PLAN` and not folded into this document, because fixing it means
editing a task row this document does not own.

**PLAN's byte-identity recording cannot make AT-05 non-vacuous.** T-02 (`PLAN`:101) defines exactly
**one** case, `REVIEW-LOOP-REVIEWER-PROMPTS`, "driving exported `reviewLoop`". `PLAN`'s AT map
(`PLAN`:389-390) then assigns **AT-05** — the four not-enabled spellings — to "T-10 → T-18, loop
integration against T-02's recording". But `reviewLoop` never receives config text: the enablement
gate lives in `main()`, and by the time `reviewLoop` is called all four spellings have already
collapsed to the single value `_injectDecisionLedger: null`. A T-10 arm therefore feeds **four
identical inputs** to the recorded comparison and asserts that identical inputs produce identical
bytes — true by construction of the harness, and true even if `parseDecisionLedgerConfig` treats
`"true"` as enabling. The `(live half)` row at T-10a mitigates the *presence* half but is scoped to
the flag-off report/notices set, not to the four spellings. The fix is a second recorded case whose
input **is** the config text — the `CONFIG-GATE-SPELLINGS` case `## Fixtures` specifies under
FX-BASELINE, running each `learningsConfigText` value through `parseDecisionLedgerConfig` →
`buildDecisionLedgerInjector` and recording the resulting stream. PROP-OFF-02 and PROP-OFF-03 are
written against that case and will not be satisfiable until T-02 carries it.

### Known gaps — deliberate, with the reason

| Gap | Why it is not covered here |
|---|---|
| **Reviewer compliance with the rule text** | `FSPEC` §1's two-part split makes the *rule* reviewer-side; nothing the driver computes changes. AT-06/AT-07 assert the text is **present and decidable**, which is the whole testable surface. Asserting that a model obeys it is not a property. |
| **G-4's re-open-rate trend** | An outcome measured across features over time, not an invariant of one dispatch. No oracle can be red or green on this branch. |
| **End-to-end runs against a real model** | Deliberate: 0 E2E. The composition root is exercised live at T-10a with doubled seams; beyond that the pyramid buys nothing but flake. |
| **The live `docs/` tree** | Excluded by rule (`## Fixtures`). FX-CORPUS is frozen at `8c673a09f` precisely because the live enumeration already moved 25 → 26 on this branch. |
| **`git ls-tree` with `DECISION_CORPUS_ARGV`** | Not a coverage gap but a command that cannot run: `ls-tree` rejects `:(glob)` magic. `PLAN` T-03 already carries the `ls-tree -r --name-only` + `grep -E` equivalent; no test may quietly substitute the `ls-files` form. |

### Risks to the implementer

| Risk | Mitigation already written in |
|---|---|
| **The byte budget margin is thin.** The project-level set alone is 41 lines / **6,305** bytes; `M-6b`'s 63-record slice is **10,859**, and with the 1,200-byte framing (D-9) that is **12,059** against a `maxBytes` default of **12,500** — a margin of **441 bytes**, under 4%. A handful of new project-level decisions crosses it and the renderer starts omitting. Fail-open, not a defect, but a bounds test written against today's corpus would change behaviour without any code changing. | PROP-BND-01…04 quantify over generated sets, never over the live corpus; ORC-01's expected values are pinned at `8c673a09f`. |
| **`DECISIONS-pdlc-plugin-retirement.md` looks like a bug.** Twelve `DEC-01`…`DEC-10` headings contribute **0** records, because the id grammar requires a namespace segment. An implementer who "fixes" this changes the feature-level total from 100 and reddens ORC-01. | PROP-REC-04 and PROP-FAIL-11 assert the zero **deliberately**, with the file named. |
| **The two read-failure shapes are not interchangeable.** The runtime **throws**; the test double returns **`null`**. A suite scripting one arm proves nothing about the other. | FX-FAILOPEN scripts both (`FX-FO-ONE-NULL`, `FX-FO-ONE-THROWS`); PROP-FAIL-10 asserts they agree. |
| **`FX-FO-EMPTY-ONLY` and `FX-FO-ALLFAIL` have identical dispatch bytes.** No prompt-level assertion separates them; reverse the classification and every byte oracle stays green. | PROP-FAIL-06 asserts over `TSPEC` §6.3's `failedSources`/`emptySources` split — the reason O-7 exists. |
| **Ordinal-prefixed headings are easy to miss.** `## 2. DEC-EDIST-01: …` and `## 3. DEC-CONS-01: …` are real; a recognition rule without the optional ordinal group yields **82** feature-level records, not 100. | PROP-REC-03, with both instances pinned in FX-CORPUS. |
| **Path-order tie-breaks are undefined without a collation.** `_` (`0x5F`) inverts under case-folded ordering, so `docs/_decisions/` sorts differently under two plausible implementations. | Precedence keys on `origin`, never on path order; PROP-PRE-05 asserts byte-identity under a **reversed** enumeration. |
| **A baseline captured too late is worthless.** It must be taken while `orchestrate-dev.js` is byte-identical between merge base and branch HEAD. | Enforced structurally: T-02 sits in `PLAN` batch 1 and every green task from T-13 on reaches it transitively through T-10's `Deps` — an ordering edge, not a prose note. |
| **Digest manifests that check themselves.** A re-capture that rewrites `MANIFEST.json` satisfies any guard that reads that manifest. | Both integrity guards use **hand-transcribed literals in the test file** — per-file digests and `EXPECTED_MERGE_BASE_SHA` — never manifest reads. |
